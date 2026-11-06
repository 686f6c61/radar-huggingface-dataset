# Arm/wideresnet50-int8-ethos-u-executorch-alif-dk-e8

## Resumen

Wide ResNet-50 optimizado para NPUs Arm Ethos-U es una conversión del modelo de clasificación de imágenes `timm/wide_resnet50_2.tv_in1k` a un programa ExecuTorch (`.pte`) con cuantización estática W8A8 y delegado Ethos-U, pensado para su ejecución en sistemas embebidos con NPU. Lo publica Arm en Hugging Face y la conversión la realiza Nota AI mediante Arm AI Model Optimizer. El objetivo no es mejorar la precisión del modelo original, sino reducir latencia, tamaño y memoria para que quepa y funcione en microcontroladores con acelerador neuronal.

La arquitectura subyacente es una Wide ResNet-50 (CNN de tipo ResNet con el doble de canales por bloque respecto a ResNet-50), entrenada originalmente por timm sobre ImageNet-1k. Esta versión mantiene la tarea de clasificación de imágenes en 1.000 clases y una resolución de entrada de 224x224, pero con pesos y activaciones en INT8 simétrico per-tensor.

Su relevancia actual está en que demuestra un flujo completo de despliegue de visión por computador en hardware de muy bajo consumo: el modelo de referencia se ejecuta en una Alif Ensemble E8 (Cortex-M55 + Ethos-U85) con 302,59 ms de latencia p50, 3,30 fps y 3,68 MB de memoria pico, con una caída de solo 0,66 puntos porcentuales en Top-1. Es una referencia útil para quien evalúe cargas de clasificación en Cortex-M y Ethos-U.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wide ResNet-50 (CNN residual), exportada a ExecuTorch con delegado Ethos-U |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada 224x224) |
| Tipos de cuantizacion | INT8 simétrico per-tensor en pesos, activaciones INT8 (W8A8 estática post-entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión; las etiquetas son las 1.000 clases de ImageNet-1k) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (con `metadata.yaml` y registros de benchmark) |

## Arquitectura y entrenamiento

El modelo base es `timm/wide_resnet50_2.tv_in1k`, una Wide ResNet-50 con factor de ensanchamiento 2, es decir, el doble de canales por bloque respecto a una ResNet-50 estándar, lo que incrementa la capacidad representacional a costa de más cómputo y parámetros. Es una CNN puramente convolucional con conexiones residuales, sin mecanismos de atención, lo que la hace especialmente adecuada para aceleradores embebidos con operadores convolucionales bien soportados.

No hubo reentrenamiento ni ajuste fino: la conversión aplica cuantización estática post-entrenamiento W8A8, calibrada sobre 1.000 muestras aleatorias (`imagenet1k_calib_seed42_n1000`), y exporta el grafo a ExecuTorch con el delegado Ethos-U para su ejecución en la NPU. La validación de precisión se hizo sobre 5.000 imágenes del split de validación de ImageNet-1k, y la de rendimiento sobre 200 ejecuciones en la placa de referencia. La innovación técnica aquí no está en el modelo sino en el pipeline de optimización: cuantización simétrica per-tensor, selección de backend y validación conjunta de precisión y latencia.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k a resolución 224x224.
- Inferencia en INT8 sobre NPU Ethos-U85 con delegado ExecuTorch.
- Ejecución en sistemas embebidos con Cortex-M55 como CPU acompañante.
- Modelo de un solo forward pass, sin generación de texto ni razonamiento multi-paso.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de texto.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo recibe un tensor 224x224 y devuelve la clase ImageNet-1k más probable, adecuado para prototipos de reconocimiento visual en dispositivos con Cortex-M55 y Ethos-U85.
- Benchmarking de aceleradores Ethos-U: sirve como referencia reproducible para medir latencia p50, throughput y memoria pico en nuevas placas o versiones de runtime ExecuTorch.
- Detección de presencia o categoría en cámaras de bajo consumo: con 3,30 fps y 3,68 MB de memoria pico, encaja en sensores que clasifican escenas o productos de forma intermitente.
- Validación de pipelines de cuantización: útil para comparar el impacto de W8A8 per-tensor frente a otras estrategias antes de cuantizar modelos propios.
- Integración en firmware de dispositivos industriales: al ser un `.pte` con delegado Ethos-U, se puede empaquetar en el firmware de un microcontrolador para tareas de inspección visual sencilla.
- Educación y prototipado en sistemas embebidos: permite demostrar un flujo completo PyTorch a ExecuTorch a NPU con métricas de precisión y rendimiento documentadas.
- Evaluación de sustitución de modelos: sirve como línea base para decidir si una CNN cuantizada es suficiente frente a alternativas más ligeras en un producto concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Alif Ensemble E8 (Cortex-M55 + Ethos-U85) con ExecuTorch 1.1.0, batch 1, entrada 224x224 y 200 ejecuciones:

| Métrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 456,26 ms | 302,59 ms | 1,51x |
| Throughput | no disponible | 3,30 fps | no disponible |
| Memoria pico | 3,95 MB | 3,68 MB | 1,07x menos |
| Tamaño del modelo | 63,98 MB | 42,70 MB | 1,50x menor |
| Top-1 accuracy (ImageNet-1k, 5.000 muestras) | 77,34% | 76,68% | -0,66 pp |
| Top-5 accuracy (ImageNet-1k, 5.000 muestras) | no disponible | 93,68% | no disponible |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para memoria de sistema embebido, con 3,68 MB de memoria pico en la configuración de referencia.
- GPU recomendadas: no aplica; el objetivo es NPU Ethos-U85 con CPU Cortex-M55.
- Cabe en GPU de consumo: no es el caso de uso; el artefacto es un `.pte` para microcontrolador, no un checkpoint PyTorch estándar.
- Despliegue: runtime ExecuTorch 1.1.0 con delegado Ethos-U; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 302,59 ms p50 y 3,30 fps en Alif Ensemble E8 con Ethos-U85; el rendimiento varía según dispositivo, versión de runtime, configuración de memoria y carga del sistema.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Precisión | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Arm/wideresnet50-int8-ethos-u-executorch-alif-dk-e8 | Wide ResNet-50 INT8 | 224x224 | Top-1 76,68% (5.000 muestras) | ExecuTorch `.pte` | BSD-3-Clause | Hugging Face, 3 descargas |
| timm/wide_resnet50_2.tv_in1k | Wide ResNet-50 FP32 | 224x224 | Top-1 77,34% (5.000 muestras) | PyTorch/safetensors | BSD-3-Clause | Hugging Face, ampliamente usado |
| Otras variantes ExecuTorch Ethos-U de Arm | CNN cuantizada INT8 | 224x224 | no disponible | ExecuTorch `.pte` | BSD-3-Clause | Hugging Face, según modelo |

La comparación directa con alternativas de la misma categoría (clasificadores cuantizados para NPU embebida) no está disponible en la información proporcionada. Frente al modelo original, la diferencia medible es la latencia y el tamaño, con una pérdida de precisión de 0,66 pp.

## Limitaciones y advertencias

- La precisión se midió sobre 5.000 imágenes de validación de ImageNet-1k, no sobre las 50.000 completas; los valores pueden variar en la evaluación completa.
- El rendimiento depende del dispositivo, la versión de runtime, el soporte del backend, la configuración de memoria y la carga del sistema; no se garantiza en todas las plataformas Arm.
- No se realizó reentrenamiento ni ajuste fino, por lo que se heredan los sesgos y limitaciones del modelo original de timm.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en clases visualmente similares o fuera de la distribución de ImageNet-1k.
- El modelo solo reconoce las 1.000 clases de ImageNet-1k; no es adecuado para categorías personalizadas sin trabajo adicional.
- El repositorio no sustituye la documentación del modelo original; para detalles de entrenamiento y datos hay que consultar `timm/wide_resnet50_2.tv_in1k`.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos aplicables al modelo original y a las dependencias.
- Antes de producción, se recomienda reevaluar el modelo con datos propios y verificar el soporte del delegado Ethos-U en la versión de ExecuTorch objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arm/wideresnet50-int8-ethos-u-executorch-alif-dk-e8
- Modelo original: https://huggingface.co/timm/wide_resnet50_2.tv_in1k
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
- Licencia BSD-3-Clause: https://opensource.org/license/bsd-3-clause
