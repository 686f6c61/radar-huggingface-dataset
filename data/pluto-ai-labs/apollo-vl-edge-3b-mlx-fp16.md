# Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-FP16

## Resumen

Apollo-VL-Edge-3B es un modelo de visión-lenguaje (VLM) de 3.754 millones de parámetros desarrollado por Pluto-AI-Labs, un laboratorio de investigación centrado en infraestructura de IA open source y modelos edge. Según la información disponible, el modelo está basado en la arquitectura Qwen2.5-VL en su variante de 3B y ha sido ajustado mediante fine-tuning sobre un dataset propio llamado Apollo-VL-Massive, que contiene aproximadamente 162.000 muestras multimodales, según una publicación del autor en LinkedIn. Se distribuye en formato MLX, optimizado para Apple Silicon, con pesos en FP16.

La relevancia de este modelo radica en su tamaño compacto (3B) combinado con capacidades multimodales, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados, como portátiles con chip Apple o GPUs de gama media. Aunque la información pública es escasa y el desarrollo parece estar en curso, el modelo está diseñado para tareas de image-text-to-text, como responder preguntas sobre imágenes, OCR y razonamiento visual básico. Su etiqueta en HuggingFace indica soporte para inglés y una orientación conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (variante 3B) |
| Parametros totales | 3.754.622.976 (3,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (formato MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, FP16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La variante de 3B es la más pequeña de la familia Qwen2.5-VL y está diseñada para ejecutarse en entornos con restricciones de memoria. Según la publicación de LinkedIn del autor, el modelo se ha sometido a un proceso de fine-tuning sobre un dataset propio denominado Apollo-VL-Massive, que incluye aproximadamente 162.000 muestras multimodales. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

La conversión a formato MLX (FP16) es una adaptación para ejecutarse eficientemente en hardware Apple Silicon mediante el framework MLX, aunque el modelo original también podría estar disponible en otros formatos. No se dispone de información sobre innovaciones técnicas específicas más allá de la arquitectura base.

## Capacidades

- Procesamiento de imágenes y texto (image-text-to-text), permitiendo responder a consultas sobre contenido visual.
- Conversación multimodal: el modelo puede mantener diálogos que combinan entradas de imagen y texto.
- OCR (reconocimiento óptico de caracteres) sobre imágenes, según la etiqueta de HuggingFace, aunque no se han publicado evaluaciones específicas.
- Razonamiento visual básico, derivado de la arquitectura Qwen2.5-VL, que incluye comprensión de escenas y objetos.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede integrarse en aplicaciones que requieran describir imágenes o responder preguntas sobre fotografías capturadas en tiempo real, gracias a su tamaño reducido que permite ejecución local.
- Extracción de información de documentos: con su capacidad OCR, puede procesar capturas de pantalla, facturas o formularios para extraer texto estructurado, útil en flujos de automatización de oficina.
- Descripción de imágenes para accesibilidad: puede generar descripciones alternativas de imágenes para personas con discapacidad visual, funcionando en dispositivos con recursos limitados.
- Chatbot con entrada visual en atención al cliente: el modelo puede recibir capturas de pantalla o fotos de productos y responder consultas sobre ellos, reduciendo la necesidad de enviar datos a la nube.
- Anotación automática de imágenes en sistemas de gestión de contenidos: puede generar etiquetas o descripciones para archivos multimedia, facilitando la búsqueda y organización.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño y distribuido en MLX, permite a desarrolladores crear demos y pruebas de concepto en equipos Apple sin requerir GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque existe una referencia a una solicitud de inclusión en el leaderboard de VLMEvalKit (issue #1632 en GitHub), no se muestran las puntuaciones obtenidas. Por tanto, no es posible comparar cuantitativamente el rendimiento del modelo con alternativas similares.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,5 GB según LLM Explorer, lo que corresponde al tamaño del repositorio en FP16. Para inferencia con precisión FP16, se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: al estar en formato MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores). También puede ejecutarse en GPUs NVIDIA con 8 GB o más (por ejemplo, RTX 3070, RTX 4060) mediante adaptadores, aunque no se ha confirmado soporte oficial.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama media con 8 GB de VRAM, como la RTX 3060 o la RTX 4060.
- Opciones de despliegue: el formato MLX permite ejecución directa con el framework MLX en macOS. Para otros entornos, se podría convertir a otros formatos (por ejemplo, GGUF para llama.cpp) o usar frameworks como vLLM si se dispone de la versión original en PyTorch, aunque no se ha confirmado.
- Latencia y throughput: no disponibles en la información pública.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apollo-VL-Edge-3B | 3,75B | no disponible | no disponible | MLX (FP16) | Fine-tuning de Qwen2.5-VL-3B, enfoque edge |
| Qwen2.5-VL-3B (base) | 3,75B | 32K (típico de la familia) | Apache 2.0 | safetensors, GGUF | Modelo original, más documentación y benchmarks |
| MiniCPM-V 2.6 (8B) | 8B | 8K | Apache 2.0 | safetensors | Mayor tamaño, más capacidades pero más exigente en hardware |

La comparativa se basa en información general de modelos similares; no se dispone de datos de rendimiento específicos de Apollo-VL-Edge-3B. El modelo base Qwen2.5-VL-3B es la referencia natural, ya que Apollo-VL-Edge-3B es un fine-tuning de este.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia en la model card, por lo que no se puede garantizar el uso comercial sin consultar al autor. Se recomienda contactar con Pluto-AI-Labs antes de usar el modelo en producción.
- Información limitada: no hay documentación oficial sobre el entrenamiento, los datos utilizados ni las evaluaciones, lo que dificulta la validación de su rendimiento.
- Riesgo de alucinaciones: al ser un modelo de 3B, es probable que presente alucinaciones en tareas de razonamiento complejo o cuando las imágenes son ambiguas.
- Solo inglés: la model card indica soporte exclusivo para el idioma inglés, lo que limita su uso en aplicaciones multilingües.
- Contexto no confirmado: no se ha publicado la longitud de contexto soportada, lo que puede afectar a tareas que requieran procesar documentos largos o múltiples imágenes.
- Desarrollo en curso: según las publicaciones del autor, el modelo parece estar en fase de entrenamiento o reciente lanzamiento, por lo que puede haber cambios en versiones futuras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-FP16
- GitHub de Pluto-AI-Labs: https://github.com/Pluto-AI-Labs
- Solicitud de inclusión en VLMEvalKit: https://github.com/open-compass/VLMEvalKit/issues/1632
- Publicación en LinkedIn sobre el entrenamiento: https://www.linkedin.com/posts/siddharth-n-r-842529356_apollo-vl-edge-3b-training-started-update-activity-7493535565145853953-QTMd
- Ficha en LLM Explorer: https://llm-explorer.com/model/Pluto-AI-Labs%2FApollo-VL-Edge-3B,3L5mtC3hkpxLl4GyPd7riU
