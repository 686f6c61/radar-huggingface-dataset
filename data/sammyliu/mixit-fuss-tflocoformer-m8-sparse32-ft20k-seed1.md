# sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed1

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed1` es un separador de fuentes de audio entrenado con la técnica MixIT (mixture invariant training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario `sammyliu` y se publica como un fine-tune disperso del checkpoint padre `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1`, con 20.000 actualizaciones adicionales y selección de checkpoint guiada por SI-SDRi de fuentes en el conjunto de desarrollo.

Se trata de un modelo muy compacto (1.293.568 parámetros según los pesos en safetensors) con arquitectura TF-Locoformer de 3 bloques dual-path, 8 ranuras de salida y audio mono a 8 kHz. No es un modelo generativo ni un LLM: procesa mezclas de audio y devuelve hasta 8 pistas separadas cuyas etiquetas son arbitrarias (las ranuras no son clases semánticas). Su relevancia radica en que demuestra un flujo de entrenamiento MixIT completo sobre FUSS con receta reproducible, métricas de desarrollo documentadas y checkpoints intermedios publicados.

El modelo está pensado para investigación en separación de fuentes y para escenarios donde no se dispone de fuentes aisladas para supervisión. La licencia es restrictiva (`public-access-no-weight-license-grant`) y no se ha realizado evaluación en un conjunto de test independiente, por lo que las cifras publicadas son de desarrollo y no deben interpretarse como rendimiento no sesgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path con atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada fija de 32.000 muestras (4 s a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP32) |
| Idiomas soportados | en (etiqueta de idioma; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 unidades, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atención es no causal tanto en tiempo como en frecuencia. El wrapper normaliza cada mezcla por RMS internamente, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual equitativa (distribuye `mezcla - suma(salidas)` por igual entre las ranuras).

El entrenamiento se divide en dos etapas: primero se entrena el modelo padre con un esquema de 60.000 actualizaciones, seleccionando el checkpoint de validación MixIT en la actualización 56.000; después se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune con coeficiente de dispersión 32 (el padre usaba 0). Los datos son FUSS reverberante con 20.000 escenas de entrenamiento y 1.000 de desarrollo, muestreando dos escenas observadas distintas con recortes independientes de 4 segundos, cada una con 1-4 fuentes (la mezcla de mezclas puede contener hasta 8). El batch es de 16 pares por actualización, precisión BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con clipping de norma global 5 y LR constante de 0.0001 durante el fine-tune. La pérdida MixIT eficiente resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con pseudoinversa de respaldo y umbral suave de 30 dB, sin diferenciar a través del argmax.

## Capacidades

- Separación de fuentes de audio en hasta 8 ranuras de salida a partir de una mezcla mono de 8 kHz.
- Entrenamiento sin fuentes aisladas (MixIT), lo que permite aprovechar mezclas observadas reales.
- Procesamiento offline no causal: usa contexto completo de la señal, no apto para streaming en tiempo real.
- Manejo de mezclas reverberantes del dataset FUSS con 1-4 fuentes por escena observada.
- Consistencia de mezcla residual garantizada por el wrapper (la suma de salidas reconstruye la mezcla).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües de texto: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: sirve como línea base reproducible para comparar variantes de MixIT, coeficientes de dispersión y recetas de fine-tune sobre FUSS.
- Prototipado de pipelines de separación en entornos con mezclas reales: al no requerir fuentes aisladas, se puede reentrenar o adaptar con grabaciones observadas de un dominio concreto.
- Análisis forense de audio de baja tasa de muestreo: el modelo opera a 8 kHz, adecuado para voz telefónica o grabaciones de banda estrecha donde se quiere separar interlocutores o fuentes.
- Evaluación de métricas de selección de checkpoint: el repositorio publica cinco checkpoints con SI-SDRi de desarrollo, útil para estudiar la discrepancia entre MixIT y recuperación real de fuentes.
- Docencia y reproducción de recetas: la configuración completa (optimizador, LR, STFT, arquitectura) está en `config.json` y `recipe.json`, lo que facilita replicar el entrenamiento en una sola A100 80 GB.
- Generación de datos sintéticos de separación: las salidas pueden usarse como pseudo-etiquetas para preentrenar modelos mayores, siempre con auditoría de calidad.
- Comparación de estrategias de consistencia de mezcla: el wrapper aplica consistencia residual equitativa, lo que permite medir su impacto frente a alternativas.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (update 2.000) | dB |
|---|---:|
| MixIT sobre señal de entrenamiento (media de 20 minibatches registrados) | 13.0762 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12.4929 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12.5122 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 9.5085 |

Intervalo bootstrap del 95% por escena para SI-SDRi de fuentes: [8.9175, 10.1196] dB. En la actualización final 20.000: MixIT de entrenamiento 13.8165 dB, MixIT holdout 12.3226 dB y SI-SDRi de fuentes holdout 8.0357 dB.

| Update de fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 2000 | 9.5085 | `checkpoints/step-00002000.safetensors` |
| 4000 | 9.1181 | `checkpoints/step-00004000.safetensors` |
| 10000 | 8.8949 | `checkpoints/step-00010000.safetensors` |
| 14000 | 8.8805 | `checkpoints/step-00014000.safetensors` |
| 6000 | 8.7857 | `checkpoints/step-00006000.safetensors` |

No se realizó evaluación en un conjunto de test independiente. Estas cifras son de desarrollo y no deben presentarse como rendimiento no sesgado. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (1,29 M de parámetros), más el coste de activaciones de la STFT y los 3 bloques dual-path sobre 32.000 muestras; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado usa una NVIDIA A100 80GB por ajuste, pero la inferencia es trivial.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch 2.7.1/CUDA 12.6 como referencia; al ser un modelo de audio con STFT y wrapper propio, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI (orientados a LLM). Requiere cargar los safetensors con la clase del repositorio o reimplementar la arquitectura desde `config.json`.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento usó dos hilos de CPU además de la GPU, lo que sugiere que el cuello de botella está en la GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el propio autor indica que este modelo compacto no es el modelo Medium original de TF-Locoformer, y que el padre `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1` es la alternativa directa con coeficiente de dispersión 0 y 56.000 actualizaciones. No se han encontrado comparaciones con otros separadores MixIT o TF-Locoformer en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (sparse32, ft20k) | 1.293.568 | entrada fija 4 s a 8 kHz | public-access-no-weight-license-grant | Hugging Face |
| `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1` (padre) | no disponible | no disponible | no disponible | Hugging Face |
| Modelo Medium original de TF-Locoformer | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las ranuras de salida son no ordenadas y no corresponden a clases semánticas: no se puede asumir que la ranura 1 sea siempre la misma fuente.
- No hay evaluación en test independiente; las métricas publicadas son de desarrollo y están sesgadas por la selección sobre la misma cohorte.
- El intervalo de confianza por escena no cubre la variación entre semillas ni el sesgo de selección.
- Un MixIT alto no garantiza buena recuperación de fuentes individuales; el propio autor advierte que la consistencia exacta de mezcla no implica separación correcta.
- Modelo no causal y offline: no apto para aplicaciones en tiempo real o streaming.
- Audio mono a 8 kHz: pierde contenido de alta frecuencia y no cubre música de banda ancha ni audio espacial.
- Entrenado sobre FUSS reverberante; el rendimiento puede degradarse en dominios distintos (música, habla limpia, ruido no reverberante).
- Licencia restrictiva (`public-access-no-weight-license-grant`): revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial; no se concede explícitamente licencia sobre los pesos.
- Riesgo de alucinación en sentido figurado: el modelo puede generar salidas plausibles que no correspondan a fuentes reales, especialmente con mezclas fuera de distribución.
- Solo etiqueta de idioma `en`; no hay evidencia de comportamiento multilingüe ni de robustez en otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed1
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1/tree/7eba74ff4f81c9fc04bbcc4badd4959ab95555cd
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed1/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
