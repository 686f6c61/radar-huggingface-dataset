# MedMLX/MLX-Reason-CT

## Resumen

MLX-Reason-CT es un modelo de vision-lenguaje 3D para analisis de tomografias computarizadas (TC) de torax y abdomen, portado de forma nativa a MLX para su ejecucion local en Apple Silicon. Lo desarrolla MedMLX como un port del modelo original de NVIDIA, NV-Reason-CT, y su proposito es permitir la generacion de informes radiologicos y el dialogo sobre estudios volumetricos de TC sin depender de infraestructura en la nube ni de GPUs dedicadas.

El modelo resuelve un problema concreto: ejecutar un VLM 3D medico sobre hardware de consumo Mac, algo que habitualmente requiere aceleradores CUDA. Para ello se distribuye en precision fp32 y utiliza un paquete propio, `mlx-reason-ct`, incompatible con los cargadores genericos `mlx-vlm` y `mlx-lm`. El repositorio pesa 17,4 GB y el pico de memoria MLX para generar un informe de torax o abdomen ronda los 14,4 GB.

Es relevante ahora porque combina tres tendencias: modelos medicos multimodales con razonamiento sobre volumenes 3D, inferencia on-device por motivos de privacidad de datos clinicos y el ecosistema MLX de Apple como alternativa viable para cargas de trabajo de investigacion. Su uso declarado esta restringido a investigacion y educacion, sin validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language 3D basada en el modelo NVIDIA NV-Reason-CT (detalles de capas no disponibles); port nativo MLX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (unico formato documentado); no se indican otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (Open Model Development Weights) |
| Formato de pesos | pesos MLX nativos (custom_code), precision float32; tamano del repo 17,4 GB |
| Entrada | TC 3D en formato NIfTI (`.nii.gz`) |
| Salida | Informes radiologicos y respuesta a preguntas sobre TC (image-text-to-text) |
| Hardware objetivo | Apple Silicon con Metal; Python 3.13 |
| Pico de memoria | ~14,4 GB en MLX para informe de torax o abdomen en float32 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a NV-Reason-CT, un modelo de vision-lenguaje 3D descrito en el paper arXiv:2609.27511 para analisis de TC. La model card de MedMLX no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni estrategia de codificacion volumetrica), por lo que esos datos deben consultarse en la publicacion original. El modelo procesa volumenes 3D completos en lugar de cortes 2D aislados, lo que le permite razonar sobre estructuras anatomicas en profundidad.

MLX-Reason-CT es un port de inferencia: no se documenta un reentrenamiento propio por parte de MedMLX, sino una conversion de los pesos de NVIDIA a formato MLX con codigo personalizado (`custom_code`) para ejecutar el pipeline en Metal. No hay informacion disponible sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones de decodificacion especulativa en la informacion proporcionada. El modelo se distribuye en fp32, lo que explica el tamano del repositorio y el elevado consumo de memoria frente a alternativas cuantizadas.

## Capacidades

- Generacion de informes radiologicos a partir de TC 3D de torax y abdomen en formato NIfTI.
- Respuesta a preguntas (visual question answering) sobre estudios de TC volumetricos.
- Razonamiento multimodal 3D: integra informacion espacial del volumen con lenguaje natural.
- Procesamiento de imagen medica en 3D (no solo cortes 2D), con soporte de pipeline `image-text-to-text`.
- Conversacion multi-turno sobre el estudio cargado (tag `conversational`).
- Ejecucion local en Apple Silicon mediante Metal, sin envio de datos a servicios externos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingues: solo ingles (`en`).

## Casos de uso

- Investigacion en radiologia asistida: generar informes preliminares sobre TC de torax y abdomen para estudiar como los VLM 3D describen hallazgos, con la ventaja de que el modelo corre localmente y los datos no salen del equipo.
- Prototipado academico con privacidad de datos: universidades que no pueden subir estudios clinicos a APIs externas pueden ejecutar el modelo en Macs con Apple Silicon y mantener el volumen dentro del entorno controlado.
- Educacion medica: usar el modo de preguntas y respuestas para que estudiantes interroguen un estudio de TC concreto y comparen sus interpretaciones con la salida del modelo.
- Evaluacion de pipelines de imagen medica: servir como referencia para comparar tecnicas de preprocesado de NIfTI, ya que el paquete `mlx-reason-ct` expone un comando `report` reproducible con rutas de entrada y salida.
- Desarrollo de herramientas on-device: base para aplicaciones de escritorio en macOS que integren analisis de TC sin backend, aprovechando los ~14,4 GB de pico de memoria como presupuesto de diseno.
- Reproduccion de resultados de investigacion: al ser un port fiel de NV-Reason-CT, permite replicar experimentos del paper original en hardware Apple y contrastar diferencias de comportamiento entre CUDA y Metal.
- Docencia en procesamiento de lenguaje natural multimodal: ejemplo practico de port de un VLM medico a un runtime alternativo, util para ensenar conversion de pesos y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MMLU, ni HumanEval, ni metricas radiologicas como BLEU, RadGraph-F1 o similares) y la busqueda web no aporta cifras. Cualquier comparacion de rendimiento deberia remitirse al paper de NV-Reason-CT (arXiv:2609.27511).

## Requisitos de hardware

- VRAM/ memoria unificada: pico de ~14,4 GB en MLX para generar un informe de torax o abdomen en float32; se recomienda margen adicional para preprocesado, macOS y otras aplicaciones (en la practica, un Mac con 24 GB o mas de memoria unificada).
- GPU: exclusivamente Apple Silicon con Metal. No hay soporte documentado para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; no aplica a GPUs NVIDIA/AMD de consumo porque el runtime es MLX.
- Despliegue: paquete `mlx-reason-ct` version 0.4.1 (instalacion via `uv pip install "mlx-reason-ct==0.4.1"`), descarga de pesos con `huggingface-hub` desde la revision `5e5b5202fd04ac9f63ede203ebc9327aa676ae94`. Los cargadores genericos `mlx-vlm` y `mlx-lm` son incompatibles.
- Entorno: Python 3.13.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| MLX-Reason-CT | no disponible | no disponible | Apple Silicon (MLX/Metal) | openmdw-1.1 | Port de NV-Reason-CT, fp32, solo ingles, entrada NIfTI 3D |
| NVIDIA NV-Reason-CT | no disponible | no disponible | GPU NVIDIA (CUDA) | no disponible en la informacion | Modelo original del que deriva este port; paper arXiv:2609.27511 |
| Alternativas genericas de VLM medico 3D | no disponible | no disponible | variable | variable | No se dispone de datos verificables en la informacion proporcionada |

La comparacion cuantitativa con otros VLM medicos 3D no esta disponible: no se han publicado en la informacion proporcionada ni el numero de parametros ni resultados de benchmarks del modelo original o del port.

## Limitaciones y advertencias

- No validado para uso clinico: la model card restringe explicitamente el uso a investigacion y educacion. No debe emplearse en diagnostico ni en decision clinica.
- Solo ingles: no hay soporte documentado de castellano ni de otros idiomas.
- Unico formato de precision documentado: fp32, lo que limita el despliegue a equipos con memoria unificada amplia (~14,4 GB de pico mas margen).
- Dependencia de hardware Apple Silicon: no funciona en GPUs NVIDIA ni en entornos CUDA, y requiere el paquete `mlx-reason-ct`; los cargadores genericos de MLX no son compatibles.
- Riesgo de alucinacion: inherente a los modelos generativos de lenguaje; en dominio medico, una descripcion erronea de un hallazgo es especialmente sensible.
- Sesgos: no se documentan analisis de sesgo demografico, de equipamiento ni de protocolo de adquisicion de las TC.
- Licencia OpenMDW-1.1: conviene revisar sus terminos y el fichero NOTICE antes de cualquier uso, incluido el comercial; la model card no aclara condiciones de explotacion comercial.
- Entrada restringida a TC de torax y abdomen en NIfTI; no se documenta soporte para otras modalidades (RM, radiografia) ni otros formatos.
- Comunidad muy reducida: 137 descargas y 0 likes en el momento de la consulta, con pocas senales de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/MLX-Reason-CT
- Repositorio GitHub: https://github.com/MedMLX/MLX-Reason-CT
- Documentacion (v0.4.1): https://github.com/MedMLX/mlx-reason-ct/blob/v0.4.1/README.md
- Ficheros del modelo: https://huggingface.co/MedMLX/MLX-Reason-CT/tree/main
- Licencia: https://huggingface.co/MedMLX/MLX-Reason-CT/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/MLX-Reason-CT/blob/main/NOTICE
- Paper del modelo original (NV-Reason-CT): https://arxiv.org/abs/2609.27511
- Paper de MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NV-Reason-CT
