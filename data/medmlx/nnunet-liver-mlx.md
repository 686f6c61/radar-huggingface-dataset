# MedMLX/nnunet-liver-mlx

## Resumen

`MedMLX/nnunet-liver-mlx` es un modelo de segmentación de imágenes médicas en 3D que detecta y delimita el hígado y los tumores hepáticos en volúmenes de tomografía computarizada (TC). Lo desarrolla MedMLX, un proyecto centrado en inferencia de imagen médica en local sobre Apple Silicon, y se distribuye como pesos del framework nnU-Net portados a MLX (el framework de arrays de Apple para sus chips M-series). Resuelve un problema concreto: ejecutar un pipeline de segmentación médica validado en la literatura sin depender de CUDA ni de infraestructura en la nube, aprovechando la GPU integrada y Metal en equipos Mac.

El modelo no es un modelo de lenguaje ni un transformer generativo, sino una red convolucional 3D de segmentación derivada de nnU-Net, el método auto-configurable de referencia para segmentación biomédica (paper arXiv:1809.10486). Se publica como un repositorio de pesos de 0,1 GB, con licencia CC-BY-4.0 y etiqueta `inference: false` en la model card, lo que indica que no está pensado para el pipeline automático de HuggingFace sino para ejecutarse mediante el paquete `nnunet-mlx` (versión >= 0.6.4) y Python 3.13.

Es relevante ahora por dos motivos: primero, porque demuestra la viabilidad de portar arquitecturas médicas 3D a MLX con aceleración Metal en hardware de consumo; segundo, porque el ecosistema de modelos médicos abiertos suele estar atado a CUDA y a formatos poco portables. La model card es explícita en que el uso previsto es investigación y educación, y que el modelo no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D tipo nnU-Net (U-Net auto-configurada), portada a MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (segmentación de volúmenes 3D, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en el formato del paquete `nnunet-mlx`) |
| Idiomas soportados | en (metadatos; la tarea no es lingüística) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos para `nnunet-mlx` (repositorio de 0,1 GB); no se especifica safetensors ni GGUF |
| Entrada | volúmenes TC 3D en NIfTI (`.nii.gz`) |
| Salida | máscaras de segmentación de hígado y tumor |
| Hardware objetivo | Apple Silicon con Metal |
| Versión de Python | 3.13 |
| Paquete de inferencia | `nnunet-mlx>=0.6.4` |
| Folds soportados | configurables (ejemplo con `folds=[0]`) |
| Mirroring (TTA) | configurable (`use_mirroring`) |
| Step fraction (sliding window) | configurable (ejemplo `0.5`) |
| Repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es nnU-Net, un método auto-configurable para segmentación biomédica que deriva automáticamente la topología de U-Net, el preprocesado, la estrategia de aumento de datos y el esquema de entrenamiento a partir de las propiedades del dataset. En este caso el modelo está especializado en TC abdominal para las clases hígado y tumor hepático, y ha sido portado a MLX para ejecutarse de forma nativa en Apple Silicon con aceleración Metal. La inferencia se realiza mediante ventana deslizante 3D, con parámetros ajustables de `step_fraction` y de test-time augmentation por mirroring.

La información disponible no detalla el número de tokens o volúmenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de refinamiento posteriores. Tampoco se especifican el número de parámetros de la red ni la resolución de parche utilizada. La model card remite al paper de nnU-Net (arXiv:1809.10486) para el framework y al paper de MedMLX (medRxiv, 2026) para los detalles del port a Apple Silicon. La innovación técnica destacable es precisamente la implementación nativa en MLX con Metal, que permite ejecutar un pipeline de segmentación médica 3D sin GPU NVIDIA.

## Capacidades

- Segmentación 3D de hígado en volúmenes de TC abdominal en formato NIfTI.
- Segmentación de tumores hepáticos como clase adicional dentro del mismo pipeline.
- Procesamiento de volúmenes completos mediante ventana deslizante 3D configurable.
- Test-time augmentation opcional por mirroring (`use_mirroring`).
- Selección de folds del ensemble mediante el parámetro `folds`.
- Ejecución local en Apple Silicon con aceleración Metal, sin dependencia de CUDA.
- Integración programática vía API de Python (`nnunet_mlx.medmlx.run`).
- Salida de máscaras de segmentación en un directorio de salida configurable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo de visión médica, no un LLM.

## Casos de uso

- Investigación en segmentación hepática: uso del modelo como baseline reproducible para comparar pipelines de segmentación de hígado y tumor en TC, ejecutándolo localmente en un Mac sin necesidad de clúster con GPU.
- Preprocesado de datasets médicos: generación automática de máscaras de hígado para curar y anotar grandes colecciones de TC antes de entrenar otros modelos, aprovechando la ejecución por lotes vía la API de Python.
- Prototipado en entornos clínicos de investigación: despliegue en un portátil o Mac mini para validar pipelines de segmentación en datos anonimizados antes de escalar a infraestructura mayor, con la advertencia de que no está validado para uso clínico.
- Educación y docencia en imagen médica: ejecución de un pipeline nnU-Net completo en hardware de consumo para demostrar el flujo de preprocesado, inferencia con ventana deslizante y postprocesado de máscaras.
- Desarrollo de herramientas de visualización: integración del modelo en aplicaciones de escritorio para Mac que superpongan la segmentación de hígado y tumor sobre el volumen de TC, usando la salida NIfTI del pipeline.
- Evaluación de portabilidad de frameworks: uso del modelo como caso de prueba para medir el rendimiento de MLX frente a implementaciones CUDA de nnU-Net en la misma tarea, con parámetros de `step_fraction` y mirroring ajustables para comparar configuraciones.
- Benchmarking de hardware Apple Silicon: medición de latencia y throughput de una CNN 3D médica en distintos chips M-series, útil para decidir qué equipo emplear en un laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de Dice, IoU ni comparaciones cuantitativas con otras implementaciones. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM: no disponible. El modelo se ejecuta sobre memoria unificada de Apple Silicon; el consumo dependerá del tamaño del volumen de entrada, del `step_fraction` y de si se activa el mirroring.
- GPU recomendadas: cualquier chip Apple Silicon con soporte Metal. No se especifican modelos concretos (M1, M2, M3, M4) ni requisitos mínimos de memoria unificada.
- GPU de consumo: el modelo está diseñado específicamente para GPU integradas de Apple; no se documenta soporte para GPU NVIDIA o AMD en esta distribución.
- Opciones de despliegue: paquete `nnunet-mlx>=0.6.4` sobre Python 3.13, con descarga de pesos vía `huggingface-hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 0,1 GB de pesos, más el espacio de los volúmenes de entrada y las máscaras de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Framework | Hardware | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| MedMLX/nnunet-liver-mlx | CNN 3D (nnU-Net) | MLX | Apple Silicon | CC-BY-4.0 | TC 3D NIfTI | HuggingFace |
| nnU-Net original (referencia) | CNN 3D (nnU-Net) | PyTorch | CUDA / CPU | Apache-2.0 (código) | TC 3D NIfTI | GitHub |
| Otros ports médicos a MLX | no disponible | MLX | Apple Silicon | no disponible | no disponible | no disponible |

La comparación directa más relevante es con la implementación original de nnU-Net en PyTorch, que requiere CUDA para un rendimiento óptimo. Este port mantiene la arquitectura pero cambia el backend de ejecución a MLX. No se dispone de datos de rendimiento comparativo entre ambas implementaciones en la información proporcionada.

## Limitaciones y advertencias

- No validado para uso clínico: la model card indica explícitamente que el uso previsto es investigación y educación. No debe emplearse para diagnóstico ni para decisiones médicas.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico, de equipo de adquisición ni de protocolo de TC.
- Riesgo de error en la segmentación: al ser un modelo de segmentación, puede producir máscaras incorrectas en tumores pequeños, lesiones atípicas o volúmenes con artefactos; no se han publicado métricas de error.
- Dependencia de hardware: diseñado para Apple Silicon con Metal; no se documenta funcionamiento en otras plataformas.
- Dependencia de versiones: requiere Python 3.13 y `nnunet-mlx>=0.6.4`; los pesos están fijados a una revisión concreta del repositorio (`574a9c6...`).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la restricción de uso clínico proviene de la model card y de la ausencia de validación regulatoria, no de la licencia.
- Idiomas: los metadatos indican solo inglés; la tarea no es lingüística, pero la documentación y la interfaz están en inglés.
- Sin métricas publicadas: la ausencia de benchmarks impide comparar su calidad con otras implementaciones de nnU-Net.
- Repositorio con 0 descargas y 0 likes: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MedMLX/nnunet-liver-mlx
- Repositorio GitHub del proyecto: https://github.com/MedMLX/nnunet-mlx
- Documentación de ejecución: https://github.com/MedMLX/nnunet-mlx/blob/main/README.md#run
- Archivos del modelo: https://huggingface.co/MedMLX/nnunet-liver-mlx/tree/main
- Licencia: https://huggingface.co/MedMLX/nnunet-liver-mlx/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/nnunet-liver-mlx/blob/main/NOTICE
- Paper de nnU-Net: https://arxiv.org/abs/1809.10486
- Paper de MedMLX: https://doi.org/10.64898/2026.10.28.26366762
