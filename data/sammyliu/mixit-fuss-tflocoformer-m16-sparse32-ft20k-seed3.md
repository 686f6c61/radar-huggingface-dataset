# sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed3

## Resumen

MixIT-FUSS TF-Locoformer m16 sparse32 ft20k seed3 es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador no causal y offline que opera a 8 kHz sobre mezclas reverberantes del dataset FUSS, entrenado sin objetivos de fuente aislada mediante la técnica MixIT (Mixture Invariant Training). El modelo produce 16 salidas (slots) que no están ordenadas ni asociadas a clases semánticas concretas: el usuario debe asignar cada slot a una fuente tras la inferencia.

La relevancia de esta release es metodológica: documenta una receta de dos etapas (un entrenamiento base de 60.000 actualizaciones y un fine-tune disperso de 20.000) y publica métricas de selección de checkpoints basadas en SI-SDRi de desarrollo, además de los cinco mejores checkpoints. Con 1.302.800 parámetros, es un modelo muy compacto pensado para investigación en separación de audio y para validar técnicas de regularización por dispersión, no para despliegue comercial de alta fidelidad.

La licencia es restrictiva: `public-access-no-weight-license-grant`, lo que permite el acceso público a los pesos pero no concede una licencia de uso general. El modelo está etiquetado únicamente para inglés (`en`), aunque al tratarse de audio la etiqueta de idioma es poco informativa en la práctica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path, atención no causal en tiempo y frecuencia) |
| Parámetros totales | 1.302.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | segmentos de 32.000 muestras (4 s a 8 kHz); atención no causal sobre el segmento completo |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (etiqueta del repo; audio, no texto) |
| Licencia | public-access-no-weight-license-grant (otros términos, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors (`model.safetensors` y `checkpoints/step-*.safetensors`) |

Otros datos técnicos relevantes: 16 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128, kernel de convolución 4, 4 grupos de normalización RMS, STFT con FFT 256, hop 128 y ventana Hann con padding constante centrado. Dropout 0 y multiplicador residual de FFN 1.0.

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 16 slots de salida y 3 bloques dual-path. La atención es no causal tanto en tiempo como en frecuencia, lo que implica que el modelo es offline: necesita el segmento completo para inferir. La entrada se procesa con STFT (FFT 256, hop 128, ventana Hann, padding constante centrado) y el wrapper normaliza internamente cada mezcla por RMS, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria (reparte `mixture - sum(outputs)` a partes iguales entre los slots). No es el modelo Medium original: es una variante compacta.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre (`sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3`) durante 60.000 actualizaciones y se selecciona el checkpoint de validación en la actualización 59.000. Después se cargan esos pesos, se reinician AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune disperso con coeficiente de dispersión 32 (0 en el padre) y coeficiente de covarianza 0. Los datos son FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de desarrollo, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con dos escenas observadas muestreadas uniformemente, recortes independientes de 4 s, escalado por rama dividiendo por RMS (suelo 1e-8) y suma sin normalización posterior. Cada escena contiene de 1 a 4 fuentes y la mezcla de mezclas puede llegar a 8. Audio mono a 8.000 Hz, 32.000 muestras, 16 pares por actualización, BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. Optimizador AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR del padre con pico 0.001, warmup de 1.000 pasos y coseno con suelo del 10%; LR de fine-tune constante 0.0001 sin warmup. Clipping de gradiente por norma global 5.

La innovación destacable es el uso de MixIT duro y eficiente: se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con solve lineal y fallback a pseudoinversa, se asigna cada salida a la referencia con mayor coeficiente y se suma; la pérdida es `-10 log10(max(||x||²,1e-8)/max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, y los gradientes no diferencian a través del argmax. El fine-tune añade 32 veces `mean_m(rms(y_m))/||rms(y)||_2`. Ningún objetivo de fuente aislada entra en los gradientes: las etiquetas de fuente solo se usan para seleccionar checkpoints y desarrollar la receta.

## Capacidades

- Separación de fuentes de audio en mezclas reverberantes mono a 8 kHz, con hasta 8 fuentes potenciales en la mezcla de mezclas.
- Producción de 16 slots de salida no ordenados; la asignación de cada slot a una fuente concreta corre a cargo del usuario.
- Entrenamiento sin objetivos de fuente aislada (MixIT), lo que permite aprovechar mezclas observadas sin anotar.
- Inferencia offline no causal sobre segmentos de 4 s (32.000 muestras).
- Consistencia de mezcla residual: la suma de salidas reconstruye la mezcla de entrada tras restaurar amplitud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada/salida más allá de la separación.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: sirve como referencia reproducible de MixIT con TF-Locoformer compacto para comparar recetas de regularización por dispersión frente al padre sin fine-tune.
- Prototipado de pipelines de separación en habla reverberante a baja tasa de muestreo: con 8 kHz y 4 s de contexto, es adecuado para experimentos rápidos en un solo A100 o incluso en GPUs menores antes de escalar a modelos mayores.
- Generación de datos sintéticos de entrenamiento: los 16 slots permiten producir múltiples estimaciones de fuentes que, filtradas por consistencia de mezcla, pueden alimentar etapas posteriores de anotación o aumento de datos.
- Estudio de selección de checkpoints: la release publica cinco checkpoints con SI-SDRi de desarrollo, útil para analizar la diferencia entre ranking MixIT y ranking por recuperación de fuente.
- Evaluación de métricas de separación: el modelo y sus intervalos bootstrap de escena sirven para validar implementaciones de SI-SDRi y MixIT en condiciones controladas.
- Docencia y divulgación: por su tamaño (1,3 M de parámetros) y su receta documentada paso a paso, es un caso práctico para explicar MixIT, consistencia de mezcla y fine-tune disperso sin necesidad de grandes recursos.
- Análisis de robustez a reverberación: al entrenarse sobre FUSS reverberante, permite estudiar cómo afecta la reverberación a la recuperación de fuentes individuales frente a la reconstrucción de la mezcla.

## Benchmarks y rendimiento

| Medición en el checkpoint seleccionado (update 14.000) | dB |
|---|---:|
| MixIT con señal de entrenamiento (media de 20 minibatches registrados) | 14,0075 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | 12,6167 |
| MixIT en desarrollo holdout (64 pares fijos) | 12,7566 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multi-fuente) | 7,4699 |

Intervalo bootstrap de escena al 95% para SI-SDRi de fuente: [6,9754; 7,9917] dB. Este intervalo cubre la variación entre escenas para este checkpoint, pero no la variación entre semillas ni la selección sobre la misma cohorte de desarrollo. No se realizó evaluación independiente en test para este fine-tune.

| Update de fine-tune | SI-SDRi de fuente en desarrollo (dB) | Pesos |
|---|---:|---|
| 14000 | 7,4699 | `checkpoints/step-00014000.safetensors` |
| 12000 | 7,2620 | `checkpoints/step-00012000.safetensors` |
| 8000 | 7,1946 | `checkpoints/step-00008000.safetensors` |
| 18000 | 7,1738 | `checkpoints/step-00018000.safetensors` |
| 20000 | 7,0312 | `checkpoints/step-00020000.safetensors` |

En el update final fijo 20.000: MixIT con señal de entrenamiento 14,2303 dB, MixIT holdout 12,6795 dB y SI-SDRi de fuente holdout 7,0312 dB. Este endpoint difiere del checkpoint seleccionado. No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (1,3 M de parámetros). Los pesos en safetensors ocupan del orden de unos pocos MB; el consumo dominante es el buffer de STFT y las activaciones del segmento de 32.000 muestras, no los pesos.
- GPU recomendadas: el autor entrenó con una NVIDIA A100 80GB por fit (PyTorch 2.7.1/CUDA 12.6), pero para inferencia no se requiere esa GPU; cualquier GPU consumer reciente con suficiente memoria para el segmento es válida.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan requisitos mínimos exactos.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin variantes GGUF/Ollama documentadas, el despliegue natural es PyTorch nativo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo de audio).
- Latencia y throughput: no disponibles. El modelo es offline y no causal, por lo que no es apto para streaming en tiempo real sin troceado y solapamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (m16 sparse32 ft20k seed3) | 1.302.800 | 4 s a 8 kHz, 16 slots | MixIT + fine-tune disperso, TF-Locoformer compacto | public-access-no-weight-license-grant | Pesos públicos en HF |
| `sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3` (padre) | no disponible en la información | mismo esquema | MixIT sin fine-tune disperso | no disponible | Pesos públicos en HF |
| Modelos de separación FUSS de referencia (p. ej. variantes Medium del mismo autor) | no disponible | no disponible | TF-Locoformer de mayor tamaño | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia restrictiva: `public-access-no-weight-license-grant` no concede una licencia de uso general; es imprescindible revisar `LICENSE-WEIGHTS.md` antes de cualquier uso, incluido el comercial.
- Los slots de salida son no ordenados y no corresponden a clases semánticas: el usuario debe resolver la asignación, lo que añade complejidad y posibles errores en producción.
- Las métricas publicadas son de desarrollo, no de test: el propio autor advierte que no deben presentarse como rendimiento no sesgado. El intervalo bootstrap no cubre variación entre semillas ni la selección sobre la misma cohorte.
- Alto riesgo de sobreajuste a la cohorte de desarrollo por la selección de checkpoints sobre SI-SDRi de la misma cohorte.
- Un SI-SDRi de fuente de 7,47 dB es modesto; una consistencia de mezcla alta y un MixIT alto no garantizan buena recuperación de fuentes individuales.
- Solo audio mono a 8 kHz: no apto para música de alta fidelidad ni para habla de banda ancha sin remuestreo y validación adicional.
- Modelo offline y no causal: no sirve para streaming en tiempo real sin troceado con solapamiento y posible degradación en los bordes.
- Etiqueta de idioma `en` poco informativa; el modelo no procesa texto y no tiene capacidades multilingües.
- Sin evaluación independiente en test: cualquier afirmación de rendimiento en producción debe validarse con un conjunto propio.
- El modelo es compacto y no equivale al Medium original; no debe extrapolarse su rendimiento al de variantes mayores.
- No se documentan cuantizaciones ni formatos alternativos de despliegue, lo que limita opciones de optimización en entornos con restricciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed3
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed3/tree/fd8e4e19add38db80b0e8c798f3b5214d38c86ea
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer / referencia asociada (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
