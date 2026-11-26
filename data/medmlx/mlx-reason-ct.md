# MedMLX/MLX-Reason-CT

## Resumen

MLX-Reason-CT es una adaptación nativa para Apple Silicon (framework MLX) del modelo médico NV-Reason-CT, un modelo de lenguaje y visión (VLM) de 3D especializado en el análisis de tomografías computarizadas (TC) de tórax y abdomen. Lo desarrolla MedMLX, un proyecto centrado en llevar IA de imagen médica a la inferencia local en hardware de Apple, y se distribuye bajo licencia OpenMDW-1.1. Su función principal es generar informes radiológicos y responder preguntas (visual question answering) sobre volúmenes de TC en formato NIfTI, ejecutándose íntegramente en el dispositivo.

El modelo parte de los pesos de NVIDIA NV-Reason-CT y los convierte a MLX en precisión fp32, con un bundle de 17,4 GB en disco y un pico de memoria de aproximadamente 12,5 GB durante la generación de un informe. Está pensado para investigadores y desarrolladores que necesitan procesar estudios de imagen médica sin depender de infraestructura en la nube, manteniendo los datos clínicos en local. La relevancia actual radica en la combinación de un modelo 3D-VLM médico con un stack de inferencia optimizado para Apple Silicon, un nicho poco cubierto hasta ahora.

Se trata de un modelo de pipeline `image-text-to-text`, solo en inglés, etiquetado como `inference: false` en su model card (requiere el paquete específico `mlx-reason-ct`, incompatible con los cargadores genéricos `mlx-vlm` y `mlx-lm`). Está explícitamente limitado a investigación y educación, sin validación para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje 3D (3D-VLM) basado en NV-Reason-CT; pesos convertidos a MLX (native-mlx) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (único formato indicado en la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Safetensors nativos MLX (bundle de 17,4 GB); no compatible con GGUF ni con cargadores genéricos mlx-vlm/mlx-lm |

## Arquitectura y entrenamiento

La información disponible indica que MLX-Reason-CT es una conversión a MLX del modelo NVIDIA NV-Reason-CT, descrito en el paper "NV-Reason-CT: 3D Visual Language Model for CT Analysis" (arXiv:2609.27511). Se trata, por tanto, de un modelo de visión-lenguaje que procesa volúmenes de TC 3D (entrada NIfTI) junto con texto y genera informes o respuestas. La model card no detalla la arquitectura interna (tipo de encoder visual 3D, backbone de lenguaje, mecanismo de fusión multimodal), el número de parámetros ni el volumen o composición de los datos de entrenamiento.

Tampoco se documentan en la información proporcionada detalles sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La conversión de MedMLX se limita a portar los pesos a precisión fp32 para el backend MLX/Metal, manteniendo el comportamiento del modelo base. Cualquier detalle arquitectónico adicional debe consultarse en el paper de NV-Reason-CT.

## Capacidades

- Generación de informes radiológicos a partir de volúmenes de TC 3D de tórax y abdomen.
- Respuesta a preguntas sobre estudios de TC (CT question answering) mediante el parámetro `prompt`.
- Procesamiento multimodal imagen-texto con entrada en formato NIfTI (`.nii.gz`).
- Selección de región anatómica mediante `anatomy_region` (por defecto tórax; `"abdomen"` para TC abdominal).
- Ejecución local en Apple Silicon con Metal, sin envío de datos a servicios externos.
- Interfaz programática en Python 3.13 a través del paquete `mlx-reason-ct`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (modo thinking, visión 2D, audio): no disponible.

## Casos de uso

- Generación automatizada de borradores de informes de TC torácico: el modelo recibe un volumen NIfTI y devuelve un informe estructurado, útil como punto de partida para revisión por parte de un radiólogo en entornos de investigación.
- Investigación en imagen médica con datos sensibles: al ejecutarse localmente en Apple Silicon, permite procesar estudios sin transferirlos a la nube, facilitando el cumplimiento de requisitos de privacidad en estudios retrospectivos.
- Docencia y formación radiológica: permite generar descripciones de hallazgos sobre casos de ejemplo para ilustrar sesiones formativas, dado que la licencia y la model card lo orientan a educación.
- Prototipado de asistentes de preguntas sobre TC: mediante el parámetro `prompt` se pueden construir interfaces de consulta ("¿hay derrame pleural?", "describe el hígado") sobre un estudio concreto.
- Evaluación comparativa de modelos 3D-VLM: sirve como referencia de despliegue on-device frente a versiones en servidor, permitiendo medir calidad de informes y consumo de memoria en hardware de consumo.
- Desarrollo de pipelines de investigación reproducible: el paquete fija una revisión concreta de pesos (`5e5b5202...`) y ofrece una API simple (`run(image_path=..., output_dir=...)`), lo que facilita la reproducibilidad de experimentos.
- Benchmarking de hardware Apple: con un pico de ~12,5 GB de memoria, es un caso de prueba realista para medir el rendimiento de Mac con chip Apple Silicon en cargas de VLM 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: pico de MLX de aproximadamente 12,5 GB para generar un informe de tórax o abdomen; se recomienda margen adicional para preprocesamiento, macOS y otras aplicaciones.
- Almacenamiento: bundle de pesos de 17,4 GB en disco.
- Hardware objetivo: Apple Silicon con backend Metal (chips de la familia M de Apple). No se especifican modelos concretos de chip ni cantidades mínimas de memoria unificada.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable; el modelo está empaquetado para MLX y no se documenta soporte en CUDA.
- Despliegue: paquete `mlx-reason-ct` (Python 3.13, instalación vía `uv`); incompatible con `mlx-vlm`, `mlx-lm`, vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato / backend | Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLX-Reason-CT (MedMLX) | MLX nativo, fp32 | TC 3D (NIfTI) + texto | en | OpenMDW-1.1 | Hugging Face, 225 descargas |
| NV-Reason-CT (NVIDIA) | Pesos originales (backend no especificado) | TC 3D + texto | no disponible | no disponible | Modelo base en Hugging Face |
| Otros 3D-VLM médicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones comparables (parámetros, contexto) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No validado para uso clínico: la model card indica explícitamente que es para investigación y educación; no debe usarse para diagnóstico ni decisiones médicas.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas.
- Formato único fp32: no se ofrecen cuantizaciones (GGUF, 4-bit, 8-bit), lo que limita el despliegue en equipos con menos memoria.
- Dependencia de un paquete específico: requiere `mlx-reason-ct`; los cargadores genéricos `mlx-vlm` y `mlx-lm` no son compatibles, lo que restringe la integración con herramientas estándar.
- Plataforma restringida: solo Apple Silicon con Metal; no hay soporte documentado para CUDA ni CPU genérica.
- Sesgos y alucinaciones: no se documentan análisis de sesgos ni tasas de alucinación; en un dominio médico, el riesgo de generar hallazgos inexistentes es relevante y exige supervisión experta.
- Restricciones de licencia: OpenMDW-1.1 con aviso adicional (NOTICE); debe revisarse antes de cualquier uso comercial, que además queda fuera del alcance declarado del modelo.
- Información técnica incompleta: no se publican número de parámetros, longitud de contexto ni detalles de entrenamiento, lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/MLX-Reason-CT
- Repositorio GitHub: https://github.com/MedMLX/mlx-reason-ct
- Documentación (v0.9.0): https://github.com/MedMLX/mlx-reason-ct/blob/v0.9.0/README.md
- Paper de NV-Reason-CT: https://arxiv.org/abs/2609.27511
- Paper de MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
- Licencia: https://huggingface.co/MedMLX/MLX-Reason-CT/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/MLX-Reason-CT/blob/main/NOTICE
- Modelo base: https://huggingface.co/nvidia/NV-Reason-CT
