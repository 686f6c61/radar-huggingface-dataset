# mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF` es una cuantización GGUF con imatrix del modelo base `medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic`, realizada por mradermacher. Se trata de una variante de Qwen3.8 con 27.320.697.856 parámetros, modificada mediante abliteración para eliminar comportamientos no deseados y optimizada para tareas agénticas, con soporte de tool calling y function calling. La cuantización reduce el tamaño del modelo para facilitar su ejecución en hardware más asequible, manteniendo la compatibilidad con llama.cpp y otros motores de inferencia.

El modelo está diseñado para su uso en agentes autónomos, asistentes conversacionales y aplicaciones que requieren llamadas a funciones externas, con soporte para inglés, chino y árabe. Según el README, también es un modelo de visión, por lo que puede procesar entradas visuales. Su relevancia radica en la combinación de capacidades agénticas, ausencia de censura (uncensored) y disponibilidad en formato GGUF para despliegue local.

No se dispone de información detallada sobre la arquitectura exacta, la longitud de contexto ni los datos de entrenamiento. Los tags sugieren atención lineal y mamba, pero no está confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags indican mamba y linear-attention, sin confirmación) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix: i1-Q2_K, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K. También hay cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | Inglés, chino, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura y entrenamiento en la información proporcionada. El modelo base es Qwen3.8, que probablemente utiliza una arquitectura transformer híbrida con atención lineal y capas Mamba, según los tags. El proceso de abliteración (OBLITERATED) es una técnica que elimina direcciones específicas en el espacio de activaciones para reducir comportamientos no deseados, y el modelo ha sido optimizado para tareas agénticas con tool calling. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO.

## Capacidades

- Generación de texto y conversación: el modelo está diseñado para mantener diálogos multi-turno (tag "conversational").
- Tool calling / function calling: soporte para llamar a funciones externas, lo que permite integrarlo en agentes y pipelines automatizados.
- Capacidades agénticas: etiquetado como "agentic" y "hermes-agent", con soporte para "task-tree" (posiblemente planificación de tareas).
- Visión: según el README, es un modelo de visión, aunque no se especifica si es multimodal completo.
- Multilingüe: soporta inglés, chino y árabe.
- Sin censura (uncensored): al ser abliterado, se eliminan restricciones de contenido, lo que permite generar respuestas sin filtros.
- Compatibilidad con motores de inferencia: los tags indican soporte para vLLM, SGLang y fp8.

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede gestionar flujos de trabajo complejos que requieren llamadas a funciones externas, gracias a su soporte de function calling y task-tree. Es adecuado para orquestar tareas en sistemas de automatización.
- Asistentes conversacionales multilingües: al soportar inglés, chino y árabe, puede atender a usuarios de diferentes regiones en un mismo despliegue, sin necesidad de modelos separados.
- Análisis de imágenes y documentos: como modelo de visión, puede procesar entradas visuales para tareas de descripción, extracción de información o análisis de documentos, integrándose en pipelines de procesamiento de datos.
- Generación de contenido sin restricciones: al ser uncensored, puede utilizarse en aplicaciones creativas o de investigación que requieren generar contenido sin filtros, siempre que se cumpla la licencia Apache 2.0.
- Automatización de soporte técnico: el modelo puede integrarse en sistemas de atención al cliente para resolver consultas, ejecutar comandos en sistemas externos y escalar problemas complejos mediante tool calling.
- Desarrollo de herramientas de asistencia en entornos de desarrollo: con soporte de tool calling, puede integrarse en IDEs o pipelines de CI/CD para generar código, ejecutar pruebas y depurar, aunque no se especifican capacidades específicas de código.
- Investigación en alineación y seguridad: al ser un modelo abliterado, puede servir como caso de estudio para analizar los efectos de la eliminación de comportamientos no deseados en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo Q4_K_M ocupa 16,9 GB, lo que requiere al menos 18-20 GB de VRAM para inferencia con contexto moderado. Las cuantizaciones más pequeñas, como Q2_K (11,0 GB), pueden ejecutarse con 12-14 GB. La Q6_K (22,5 GB) necesita más de 24 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o A100 40 GB es adecuada. Para Q6_K, se recomienda A100 80 GB o H100.
- Si cabe en consumer GPU: sí, las cuantizaciones Q2_K a Q4_K_M pueden ejecutarse en GPUs de consumo de 12-24 GB (RTX 3060 12 GB, RTX 4080 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, TGI (según los tags).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Optimizado para agentes, tool calling, visión |
| mradermacher/Qwen3.8-27B-abliterated-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Abliterado, sin optimización agéntica |
| mradermacher/Qwen3.8-27B-OBLITERATED-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | OBLITERATED, sin capa agéntica |

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos. Al ser un modelo uncensored, puede generar contenido sesgado o dañino sin filtros.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de este modelo.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible. Los idiomas soportados son en, zh, ar; puede tener un rendimiento inferior en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero requiere mantener el aviso de copyright y la licencia. El modelo base puede tener restricciones adicionales.
- Caveat importante: es una cuantización con imatrix de un modelo abliterado. La abliteración puede degradar la calidad del modelo o introducir comportamientos impredecibles. No hay benchmarks publicados, por lo que el rendimiento no está verificado. Además, al ser una cuantización, puede haber pérdida de precisión en comparación con el modelo original en safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF
- Modelo base: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-GGUF
- Modelo abliterado similar: https://huggingface.co/mradermacher/Qwen3.8-27B-abliterated-i1-GGUF
- Modelo OBLITERATED similar: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Página de descarga del modelo: https://hf.tst.eu/model#Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF
- Guía de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
