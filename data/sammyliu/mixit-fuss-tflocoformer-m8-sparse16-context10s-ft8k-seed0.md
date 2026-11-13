# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed0

## Resumen

MixIT-FUSS-TF-Locoformer m8 sparse16 context10s ft8k seed0 es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador offline y no causal que opera a 8 kHz sobre mezclas reverberantes del conjunto FUSS, entrenado sin objetivos aislados de fuente mediante la técnica MixIT (Mixture Invariant Training). El modelo produce 8 ranuras de salida desordenadas que no corresponden a clases semánticas predefinidas.

La relevancia de esta ficha reside en su naturaleza experimental y en su escala reducida: con 1.293.568 parámetros totales, es un modelo compacto pensado para investigación en separación de fuentes sin supervisión. Emplea una arquitectura TF-Locoformer compacta con 3 bloques dual-path, 8 ranuras de salida, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones, procesando audio mono a 8.000 Hz con ventanas de 10 segundos.

Este checkpoint concreto es el resultado de un fine-tune disperso de 8.000 actualizaciones sobre el modelo padre `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0`, con un coeficiente de dispersión de 16. La licencia es restrictiva (`public-access-no-weight-license-grant`), lo que limita su uso comercial. No se ha realizado evaluación en un conjunto de test independiente, por lo que las métricas publicadas corresponden únicamente a desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path), no causal |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 10 segundos (80.000 muestras a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP32) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura TF-Locoformer compacta con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Utiliza STFT con FFT de 256, hop de 128, ventana Hann y padding constante centrado. El backbone se entrena en BF16, mientras que la STFT, la síntesis, la asignación y la función objetivo se ejecutan en FP32, con TF32 permitido. El wrapper normaliza por RMS cada mezcla internamente y restaura la amplitud tras la síntesis, aplicando consistencia de mezcla residual equitativa.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre durante 60.000 actualizaciones, seleccionando el checkpoint de validación MixIT en la actualización 55.000. Después se cargan esos pesos, se reinician AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tune disperso con coeficiente de dispersión 16 (frente a 0 en el padre). Los datos provienen de FUSS reverberante: 20.000 escenas de entrenamiento y 1.000 de desarrollo, con 1 a 4 fuentes por escena y hasta 8 en la mezcla de mezclas. Se muestrean dos escenas distintas con recortes uniformes independientes de 10 segundos, 80.000 muestras, 16 pares por actualización de optimizador. El optimizador es AdamW con betas (0,9, 0,999), epsilon 1e-8, weight decay 0,01, LR constante de 0,0001 sin warmup en el fine-tune, y clipping de norma global 5. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6, con algoritmos deterministas.

## Capacidades

- Separación de fuentes de audio en mezclas reverberantes mono a 8 kHz.
- Producción de 8 ranuras de salida desordenadas (no clases semánticas) para mezclas con hasta 8 fuentes.
- Procesamiento offline y no causal de ventanas de 10 segundos.
- Entrenamiento sin objetivos aislados de fuente mediante MixIT, lo que permite aprender de mezclas observadas.
- Consistencia de mezcla residual: distribuye `mixture - sum(outputs)` entre las salidas.
- Normalización RMS interna de la mezcla con restauración de amplitud posterior.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No dispone de modo thinking, visión ni audio de entrada más allá de la separación.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: el modelo sirve como referencia reproducible para estudiar MixIT con arquitecturas TF-Locoformer compactas, gracias a su receta detallada y a los checkpoints intermedios publicados.
- Experimentos de ablación sobre dispersión: al comparar este fine-tune (coeficiente 16) con el padre (coeficiente 0), se puede evaluar el efecto de la regularización dispersa en la recuperación de fuentes.
- Prototipado de pipelines de separación a 8 kHz: adecuado para entornos de investigación donde el audio telefónico o de banda estrecha es suficiente y se requiere un modelo de 1,3 M de parámetros que cabe en cualquier GPU.
- Evaluación de métricas MixIT frente a SI-SDRi: el modelo permite estudiar la discrepancia entre la reconstrucción de mezclas observadas y la recuperación real de fuentes individuales, un problema documentado en la model card.
- Reproducción de recetas deterministas: con semilla 0 y configuración determinista, sirve para validar resultados en entornos con A100 y PyTorch 2.7.1.
- Docencia y formación: su tamaño reducido y su documentación exhaustiva lo hacen útil para explicar separación de fuentes, STFT, bloques dual-path y entrenamiento invariante a la mezcla.
- Base para fine-tunes posteriores: al ser un checkpoint intermedio con pesos safetensors y modelo padre identificado, puede servir de punto de partida para nuevas variantes experimentales.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en señal de entrenamiento (media de 20 minibatches) | 14,2147 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | 12,7954 |
| MixIT en desarrollo holdout (64 pares fijos) | 12,5108 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multi-fuente) | 9,3170 |
| Intervalo bootstrap 95% de escena para SI-SDRi | [8,7409; 9,9106] |

En la actualización final 8.000 con evaluación de 4 segundos: MixIT de entrenamiento 14,4313 dB, MixIT holdout 12,5135 dB y SI-SDRi de fuente holdout 8,9806 dB. Para `final.safetensors` con entrada y puntuación de 10 segundos: MixIT de entrenamiento 14,4313 dB, MixIT holdout 13,1717 dB, SI-SDRi uno-a-uno 11,8637 dB, intervalo bootstrap 95% [11,3462; 12,3827] dB, SI-SDR absoluto de fuente 5,9840 dB y 742 escenas multi-fuente activas de 1.000.

Checkpoints retenidos por SI-SDRi de desarrollo:

| Actualizacion | SI-SDRi de fuente (dB) |
|---|---|
| 4800 | 9,3170 |
| 5000 | 9,3055 |
| 6000 | 9,1583 |
| 4000 | 8,9937 |
| 8000 | 8,9806 |

No se realizó evaluación en test independiente. Estas cifras son de desarrollo y no deben presentarse como rendimiento de test insesgado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 1,3 M de parámetros en BF16 o FP32; el cuello de botella es el buffer de audio de 80.000 muestras y la STFT, no los pesos.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó en una NVIDIA A100 de 80 GB, pero la inferencia cabe en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 (entorno de referencia); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El modelo procesa ventanas de 10 segundos (80.000 muestras) por inferencia, con STFT de FFT 256 y hop 128.
- Determinismo: requiere `CUBLAS_WORKSPACE_CONFIG=:4096:8` y algoritmos deterministas de Torch para reproducir resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SI-SDRi desarrollo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (sparse16, ft8k, seed0) | 1.293.568 | 10 s | 9,3170 dB (4 s); 11,8637 dB (10 s, `final.safetensors`) | public-access-no-weight-license-grant | Hugging Face, safetensors |
| `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0` (padre) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face, safetensors |
| Otros separadores MixIT de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se realizó evaluación en un conjunto de test independiente; todas las métricas son de desarrollo y están sesgadas por la selección de checkpoint sobre la misma cohorte.
- Los intervalos bootstrap de escena no corrigen la variación de semilla ni la selección de modelo o receta.
- Las ranuras de salida son desordenadas y no corresponden a clases semánticas; no se puede asignar una salida concreta a un hablante o fuente específica sin post-procesado.
- Las etiquetas de fuente se usaron para seleccionar checkpoints y desarrollar la receta, aunque no en la pérdida de entrenamiento; esto introduce un sesgo de selección.
- Un MixIT alto no garantiza buena recuperación de fuentes individuales; la model card advierte explícitamente sobre esta discrepancia.
- El modelo opera únicamente a 8 kHz mono, lo que limita su uso en audio de banda ancha o música.
- Solo se declara el idioma inglés en los metadatos, aunque el modelo procesa audio y no texto.
- La licencia `public-access-no-weight-license-grant` es restrictiva y debe consultarse en `LICENSE-WEIGHTS.md` antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- El modelo es no causal y offline, por lo que no es adecuado para separación en tiempo real con latencia estricta.
- El entrenamiento se realizó con una sola semilla (seed 0); no hay evidencia de robustez entre semillas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed0
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0/tree/35bf7d1be1b69a2f2bb22b756a28cc6f8084591c
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
