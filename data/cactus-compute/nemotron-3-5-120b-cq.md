# Cactus-Compute/nemotron-3.5-120b-cq

## Resumen

Nemotron-3.5-120b-cq es una cuantización de 8 bits del modelo multimodal NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por Cactus-Compute. El modelo base es un transformer híbrido de tipo MoE con componentes Mamba (arquitectura `nemotron_h` / `nemotron_h_omni`), orientado a tareas de texto e imagen, con pipeline `image-text-to-text`. Esta versión concreta está empaquetada en formato MLX y safetensors, pensada para ejecución eficiente en hardware Apple Silicon.

El problema que resuelve esta ficha es doble: por un lado, ofrece una variante cuantizada a 8 bits de un modelo de gran tamaño (el nombre comercial indica 120B, aunque los pesos publicados en safetensors suman 22.029.082.117 parámetros, es decir, unos 22B reales en el repositorio), lo que reduce el peso del repositorio a 22,2 GB; por otro, lo hace en un formato (MLX) que permite desplegarlo en equipos con memoria unificada en lugar de requerir clústeres de GPU. Es relevante ahora porque la familia Nemotron 3.5 de NVIDIA está orientada a cargas multimodales y agentes, y las cuantizaciones comunitarias amplían su accesibilidad.

La licencia del modelo base es OpenMDW-1.1 (etiquetada como `license:other` en Hugging Face) y el acceso está restringido: es necesario aceptar las condiciones en el repositorio. Soporta inglés, español, francés, alemán, italiano y japonés, y cubre tareas de generación de texto, respuesta a preguntas visuales, respuesta a preguntas sobre documentos y OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con componentes Mamba (`nemotron_h`, `nemotron_h_omni`) |
| Parametros totales | 22.029.082.117 (según safetensors del repo); el nombre comercial indica 120B |
| Parametros activos | no disponible (el nombre del modelo base sugiere A12B, es decir, ~12B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (cuantización CQ de Cactus-Compute); no se detallan otros formatos |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (`license:other`); acceso restringido (gated) |
| Formato de pesos | safetensors y MLX |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Mamba (arquitectura identificada como `nemotron_h` y `nemotron_h_omni` en los tags), y utiliza un diseño Mixture-of-Experts. El sufijo "Omni" y las capacidades declaradas (image-to-text, image-text-to-text, visual-question-answering, document-question-answering, OCR) indican que integra un codificador visual para entrada de imágenes. Esta versión es una cuantización a 8 bits realizada por Cactus-Compute sobre los pesos BF16 originales de NVIDIA, empaquetada para MLX.

Los datasets de entrenamiento referenciados en los tags son `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`, lo que sugiere un pipeline de preentrenamiento seguido de postentrenamiento (posiblemente con RLHF/DPO, aunque no se detalla la metodología exacta en la información disponible). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas específicas como decodificación especulativa o atención lineal más allá de la combinación Mamba-atención implícita en la arquitectura.

## Capacidades

- Generación de texto conversacional multilingüe (en, es, fr, de, it, ja).
- Comprensión de imágenes: image-to-text e image-text-to-text.
- Respuesta a preguntas visuales (visual question answering).
- Respuesta a preguntas sobre documentos (document question answering).
- Reconocimiento óptico de caracteres (OCR).
- Razonamiento multimodal combinando texto e imagen en la misma conversación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos con OCR: el modelo puede extraer texto de imágenes de documentos y responder preguntas sobre su contenido, adecuado para pipelines de gestión documental donde se combinan extracción y comprensión.
- Análisis de facturas y formularios: gracias a document-question-answering, permite consultar campos concretos (importes, fechas, emisores) directamente sobre la imagen del documento sin un pipeline OCR separado.
- Asistencia multimodal en atención al cliente: puede recibir capturas de pantalla o fotos de productos junto con texto y responder en varios idiomas europeos, útil para soporte técnico de primer nivel.
- Accesibilidad: descripción automática de imágenes y lectura de documentos para usuarios con discapacidad visual, aprovechando image-to-text y OCR.
- Procesamiento local en Apple Silicon: al estar en formato MLX con cuantización de 8 bits y 22,2 GB de pesos, puede desplegarse en estaciones de trabajo Mac con memoria unificada suficiente, útil para prototipado y entornos con requisitos de privacidad.
- Investigación en modelos híbridos Mamba-MoE: sirve como base para estudiar el comportamiento de arquitecturas híbridas cuantizadas en tareas multimodales.
- Extracción de información de imágenes médicas o técnicas (con validación humana): el modelo puede transcribir y resumir contenido visual, aunque requiere supervisión por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos cuantizados a 8 bits ocupan 22,2 GB; se necesita memoria adicional para el contexto y el codificador visual, por lo que se recomienda al menos 32 GB de memoria unificada o VRAM.
- GPU recomendadas: no se especifican en la información; el formato MLX está orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior).
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA de consumo; en el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada.
- Opciones de despliegue: MLX (formato nativo del repo); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cactus-Compute/nemotron-3.5-120b-cq | 22,0B (safetensors) | no disponible | OpenMDW-1.1 (gated) | MLX, safetensors 8-bit | Cuantización comunitaria del base NVIDIA |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | no disponible (nombre: 120B, A12B) | no disponible | no disponible | BF16 | Modelo base original de NVIDIA |
| Otros modelos multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia OpenMDW-1.1: conviene revisar los términos antes de uso comercial; no es una licencia permisiva estándar como Apache-2.0 pese a que los tags incluyan esa etiqueta.
- Discrepancia de tamaño: el nombre indica 120B pero los safetensors suman 22,0B; verificar qué variante se está usando realmente antes de dimensionar la infraestructura.
- Riesgo de alucinación en OCR y document-question-answering: la extracción de texto e información de documentos debe validarse en producción.
- Sesgos: no se documentan sesgos específicos en la información disponible; se recomienda evaluación propia por idioma.
- Idiomas: solo se declaran seis idiomas (en, es, fr, de, it, ja); el rendimiento en otros idiomas no está garantizado.
- Formato MLX: la portabilidad a otros runtimes (vLLM, TGI) no está confirmada.
- Cuantización de 8 bits: puede degradar ligeramente la precisión frente al BF16 original; no se publican métricas de degradación.

## Enlaces

- Hugging Face: https://huggingface.co/Cactus-Compute/nemotron-3.5-120b-cq
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
