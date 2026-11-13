# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0

## Resumen

El modelo `mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0`, publicado por el usuario sammyliu, es un separador de fuentes de audio para señales mono a 8 kHz. Se trata de un fine-tune del modelo base `mixit-fuss-tflocoformer-m8-plain-seed0`, entrenado con el paradigma MixIT (Mezcla de Mezclas Iterativa) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. El modelo está diseñado para separar hasta 8 fuentes a partir de una mezcla observada, con slots de salida no ordenados y sin correspondencia semántica con clases concretas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques de doble camino y atención local) con 3 bloques, 64 canales, 4 cabezas y FFN de 128 dimensiones, operando sobre espectrogramas STFT (FFT 256, hop 128). El modelo totaliza 1.293.568 parámetros, lo que lo sitúa en la categoría de modelos muy ligeros, adecuados para despliegue en CPU o GPUs de gama baja.

La relevancia de esta ficha radica en que documenta un fine-tune con regularización de dispersión (coeficiente 16) y ventana de contexto de 6 segundos, con métricas de desarrollo detalladas pero sin evaluación en test independiente. Es un modelo de investigación, no un producto listo para producción, y su licencia restringe explícitamente la concesión de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques de doble camino y atención local) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 6 segundos (48.000 muestras a 8 kHz) en entrenamiento; evaluación con 10 segundos en `final.safetensors` |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | inglés (etiqueta de idioma del repo); el modelo procesa audio, no texto |
| Licencia | public-access-no-weight-license-grant (licencia personalizada, ver `LICENSE-WEIGHTS.md`) |
| Formato de pesos | safetensors (backbone BF16, STFT/síntesis/objetivo en FP32) |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 8 slots de salida, 3 bloques de doble camino, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Procesa audio mono a 8 kHz mediante STFT con FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La entrada se normaliza por RMS por rama (con suelo de 1e-8) y las ramas se suman sin normalización adicional. Tras la síntesis, se aplica consistencia de mezcla residual igual: se distribuye `mixture - sum(outputs)` entre las salidas.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre "plain" durante 60.000 actualizaciones, seleccionando el checkpoint de validación-MixIT en la actualización 55.000. Después se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tune con coeficiente de dispersión 16 (frente a 0 en el padre), tasa de aprendizaje constante de 0.0001 sin warmup, y clipping de norma global 5. Los datos son 20.000 escenas de entrenamiento y 1.000 de desarrollo del dataset FUSS reverberante (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con mezclas de 1 a 4 fuentes por escena y hasta 8 fuentes en la mezcla de mezclas. El batch es de 16 pares por actualización, con recortes independientes de 6 segundos (grabación completa de 10 segundos). Se usó BF16 en el backbone, FP32 en STFT/síntesis/asignación/objetivo, y TF32 permitido, con determinismo de Torch y `CUBLAS_WORKSPACE_CONFIG=:4096:8`. El entrenamiento se ejecutó en una NVIDIA A100 80GB con PyTorch 2.7.1/CUDA 12.6.

## Capacidades

- Separación de fuentes de audio mono a 8 kHz en hasta 8 slots de salida no ordenados.
- Entrenamiento MixIT sin fuentes aisladas: aprende a separar a partir de mezclas observadas.
- Procesamiento offline y no causal (no apto para streaming en tiempo real).
- Manejo de mezclas reverberantes del dataset FUSS.
- Consistencia de mezcla residual igual aplicada en el wrapper.
- Selección de checkpoints basada en SI-SDRi de fuentes en desarrollo (las etiquetas de fuente se usaron para selección, no en la pérdida de entrenamiento).
- No soporta tool calling, function calling, agentes, visión, audio de entrada/salida en texto, ni capacidades multilingües de texto: es un modelo puramente de separación de audio.

## Casos de uso

- **Investigación en separación de fuentes sin supervisión**: el modelo sirve como referencia reproducible de MixIT con TF-Locoformer compacto, útil para estudiar el efecto de la dispersión (coeficiente 16) y de la ventana de contexto de 6 segundos en la recuperación de fuentes.
- **Prototipado de pipelines de separación en entornos con recursos limitados**: con 1,29 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para validar ideas antes de escalar a modelos mayores.
- **Generación de datos sintéticos de entrenamiento**: las salidas separadas pueden usarse como pseudo-etiquetas para preentrenar otros modelos de separación o de reconocimiento de audio, siempre que se valide la calidad con SI-SDRi.
- **Evaluación de recetas de fine-tune**: el repo incluye cinco checkpoints (actualizaciones 3.000, 5.000, 6.000, 7.000 y 8.000) con métricas de desarrollo, lo que permite comparar el efecto del número de actualizaciones en la recuperación de fuentes.
- **Análisis de reverberación en audio de 8 kHz**: adecuado para escenarios de telefonía o voz de banda estrecha donde la reverberación degrada la inteligibilidad y se quiere separar hablantes o fuentes.
- **Benchmarking de métricas MixIT vs. SI-SDRi**: el modelo documenta explícitamente que una alta consistencia de mezcla no garantiza buena recuperación de fuentes, por lo que es útil para estudiar la correlación entre ambas métricas en un entorno controlado.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en señal de entrenamiento (media de 20 minibatches) | 14,0663 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | 12,8910 |
| MixIT en desarrollo holdout (64 pares fijos) | 12,5487 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 9,0346 |
| Intervalo bootstrap 95% de SI-SDRi de fuentes | [8,4675; 9,6087] |
| MixIT en señal de entrenamiento en actualización 8.000 | 13,8141 |
| MixIT en holdout en actualización 8.000 | 12,5686 |
| SI-SDRi de fuentes en holdout en actualización 8.000 | 8,8869 |
| SI-SDRi de fuentes con `final.safetensors` (10 s, 742 escenas activas de 1.000) | 11,5084 |
| Intervalo bootstrap 95% de SI-SDRi con `final.safetensors` | [10,9916; 12,0312] |
| SI-SDR absoluto con `final.safetensors` | 5,6288 |

No se realizó evaluación en test independiente. Las puntuaciones de desarrollo no deben presentarse como rendimiento de test no sesgado. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para pesos en FP32 (1,29 M de parámetros); el modelo es extremadamente ligero.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el repo usa PyTorch 2.7.1/CUDA 12.6); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0` es la referencia directa, pero no se han publicado comparativas con otros separadores de fuentes en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0 | 1.293.568 | 6 s (entrenamiento) / 10 s (evaluación final) | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m8-plain-seed0 (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Otros separadores de fuentes | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin evaluación en test independiente**: todas las métricas son de desarrollo; los intervalos bootstrap no corrigen la selección de modelo ni de receta sobre la misma cohorte.
- **Slots no ordenados y sin semántica**: las 8 salidas no corresponden a clases concretas; el usuario debe asignar las fuentes manualmente o mediante un criterio externo.
- **Alta consistencia de mezcla no implica buena separación**: el propio autor advierte que una puntuación MixIT alta no garantiza la recuperación de fuentes individuales.
- **Ventana de contexto limitada**: entrenado con recortes de 6 segundos; el uso con ventanas de 10 segundos en `final.safetensors` cambia las métricas y no es directamente comparable.
- **Audio mono a 8 kHz**: no apto para audio de banda ancha (16 kHz o superior) sin remuestreo, lo que puede degradar la calidad.
- **Modelo no causal y offline**: no adecuado para streaming o aplicaciones de tiempo real.
- **Licencia restrictiva**: `public-access-no-weight-license-grant`; debe revisarse `LICENSE-WEIGHTS.md` antes de cualquier uso comercial o redistribución.
- **Riesgo de sesgo**: entrenado únicamente con el dataset FUSS reverberante; el rendimiento puede degradarse en dominios acústicos distintos.
- **Riesgo de alucinación**: en separación de audio, puede generar fuentes espurias o artefactos en mezclas con menos fuentes de las esperadas.
- **Idioma**: el modelo procesa audio, no texto; la etiqueta "en" se refiere al idioma de la documentación, no a una capacidad multilingüe.

## Enlaces

- [Hugging Face: sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0](https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0)
- [Modelo base: sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0](https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0/tree/35bf7d1be1b69a2f2bb22b756a28cc6f8084591c)
- [Licencia de pesos (LICENSE-WEIGHTS.md)](https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context6s-ft8k-seed0/blob/main/LICENSE-WEIGHTS.md)
- [Dataset FUSS en Hugging Face: scaleinvariant/fuss-parquet](https://huggingface.co/datasets/scaleinvariant/fuss-parquet)
- [Paper MixIT (arXiv:2006.12701)](https://arxiv.org/abs/2006.12701)
- [Paper TF-Locoformer (arXiv:2106.00847)](https://arxiv.org/abs/2106.00847)
