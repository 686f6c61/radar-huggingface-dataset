# mradermacher/ToolSpace-35B-A3B-i1-GGUF

## Resumen

ToolSpace-35B-A3B es un modelo de lenguaje orientado al uso de herramientas (tool use), function calling y razonamiento de largo horizonte (long-horizon), entrenado mediante aprendizaje por refuerzo, según indican las etiquetas de su repositorio original. El modelo base es `dongguanting/ToolSpace-35B-A3B`, y esta ficha corresponde a la cuantización en formato GGUF con imatrix publicada por el usuario mradermacher, conocido por generar cuantizaciones de alta calidad de modelos populares de Hugging Face.

El sufijo "A3B" sugiere una arquitectura de tipo mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos sobre un total de 34,66 mil millones, un patrón similar al de otros modelos MoE ligeros de inferencia. Su relevancia radica en la creciente demanda de modelos abiertos especializados en agentes que puedan invocar herramientas de forma fiable en tareas multi-paso, un área donde los modelos generalistas suelen mostrar debilidades.

Esta versión cuantizada permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF, con cuantizaciones que van desde 7,6 GB (IQ1_S) hasta 28,6 GB (Q6_K), cubriendo un amplio rango de GPUs y configuraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A3B sugiere MoE con ~3B de parámetros activos) |
| Parametros totales | 34.660.610.688 (≈34,66B, según safetensors) |
| Parametros activos | no disponible (~3B inferido del sufijo A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información de arquitectura detallada no está disponible en la model card de la cuantización. El nombre del modelo, `ToolSpace-35B-A3B`, sigue la convención de nomenclatura de modelos MoE (parámetros totales seguidos de parámetros activos), lo que sugiere una arquitectura de mezcla de expertos con unos 34,66B de parámetros totales y aproximadamente 3B activos por token. Esta hipótesis no está confirmada en la documentación disponible.

Según las etiquetas del repositorio, el modelo se ha entrenado con aprendizaje por refuerzo (reinforcement-learning) y está especializado en agentes, uso de herramientas, function calling y razonamiento de largo horizonte. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset, ni sobre el uso de técnicas como RLHF o DPO. Tampoco hay detalles sobre innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención particulares.

## Capacidades

- Function calling: el modelo está etiquetado específicamente para invocación de funciones y uso de herramientas.
- Comportamiento agentico: diseñado para flujos de trabajo de agentes con herramientas, incluyendo tareas de largo horizonte (multi-step reasoning sobre múltiples invocaciones).
- Generacion de texto conversacional: etiquetado como "conversational".
- Razonamiento mediante herramientas: el entrenamiento con RL sobre espacios de herramientas ("ToolSpace") sugiere capacidad para planificar secuencias de llamadas a herramientas.
- Capacidades de vision: la model card de mradermacher indica que es un modelo de visión y que los ficheros mmproj (proyectores multimodales) se encuentran en el repositorio de cuantizaciones estáticas.
- Soporte multilingüe: declarado solo para inglés; no hay confirmación de rendimiento en otros idiomas, incluido el castellano.

## Casos de uso

- Agentes de automatización con APIs: el modelo puede integrarse en frameworks como LangChain o LlamaIndex para planificar y ejecutar cadenas de llamadas a herramientas (búsqueda, calculadoras, APIs internas) en tareas multi-paso.
- Asistentes de desarrollo con acceso a herramientas: puede invocar funciones para consultar documentación, ejecutar pruebas o interactuar con repositorios, gracias a su entrenamiento específico en function calling.
- Pipelines de RAG con herramientas: combinación de recuperación de documentos y llamadas a funciones para responder preguntas complejas que requieren múltiples fuentes.
- Orquestación de tareas de largo horizonte: su etiqueta "long-horizon" lo hace adecuado para flujos agenticos extensos, como investigación automatizada o resolución de tareas encadenadas.
- Ejecución local en hardware de consumo: con la cuantización Q4_K_M (21,3 GB) cabe en una RTX 4090 de 24 GB o en configuraciones CPU+GPU mixtas, útil para prototipado de agentes sin depender de la nube.
- Chatbots conversacionales con capacidades de acción: además de conversar, puede actuar (reservar, consultar, calcular) si se le proporciona un esquema de herramientas, lo que lo diferencia de un chatbot puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Referencias aproximadas según el tamaño de fichero:
  - IQ1_S (7,6 GB): cabe en GPUs de 8 GB.
  - IQ3_M (15,5 GB): GPUs de 16 GB.
  - Q4_K_M (21,3 GB): GPUs de 24 GB.
  - Q6_K (28,6 GB): GPUs de 32 GB o descarga parcial en CPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; RTX 3090 (24 GB) como alternativa; A100 o H100 para cuantizaciones altas con contexto largo; también viable en Apple Silicon con memoria unificada (Mac con 32 GB o más).
- Consumer GPU: sí, es el objetivo principal de esta cuantización. Una RTX 4090 ejecuta la variante Q4_K_M completa; GPUs de 12-16 GB pueden usar cuantizaciones IQ2/IQ3 o descarga parcial de capas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM, SGLang o TGI serían opciones típicas (sin confirmación oficial de compatibilidad).
- Latencia y throughput: no disponibles. Si la hipótesis MoE con ~3B activos es correcta, la velocidad de inferencia sería comparable a la de un modelo denso de 3B, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ToolSpace-35B-A3B | 34,66B (≈3B activos, no confirmado) | no disponible | Apache 2.0 | Especializado en tool use y agentes vía RL |
| Qwen3-30B-A3B | 30,5B (3,3B activos) | 32.768 (128K con YaRN) | Apache 2.0 | MoE generalista con modo thinking y buen tool calling |
| Qwen2.5-32B | 32,8B (denso) | 32.768 (128K con YaRN) | Apache 2.0 | Denso, requiere más VRAM por token; buen rendimiento general |

La comparación con la familia Qwen es orientativa: la nomenclatura A3B y el tamaño de parámetros sugieren que ToolSpace podría basarse o inspirarse en esa arquitectura, pero no hay confirmación en la documentación disponible. No se pueden comparar benchmarks por falta de datos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado con RL para uso de herramientas, podría mostrar comportamientos inesperados al invocar funciones si el esquema de herramientas no está bien definido.
- Riesgo de alucinacion: no cuantificado; como todo LLM, puede generar invocaciones de herramientas incorrectas o argumentos fabricados, por lo que se recomienda validación de las llamadas en producción.
- Idioma: declarado únicamente para inglés; el rendimiento en castellano no está documentado y podría ser inferior.
- Contexto: la longitud de ventana no está publicada, lo que dificulta planificar aplicaciones con documentos largos.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial.
- Calidad de las cuantizaciones bajas: las variantes IQ1/IQ2 (7,6-11,8 GB) presentan degradación notable de calidad según el propio autor de la cuantización; para uso serio se recomienda Q4_K_S o superior.
- Ficheros mmproj: si se necesita la capacidad de visión, hay que descargar los ficheros mmproj del repositorio de cuantizaciones estáticas (`mradermacher/ToolSpace-35B-A3B-GGUF`), no están en este repositorio imatrix.
- El modelo base y su documentación oficial de entrenamiento no están detallados en la model card de esta cuantización; conviene consultar el repositorio original antes de uso en producción.

## Enlaces

- Cuantización imatrix (esta ficha): https://huggingface.co/mradermacher/ToolSpace-35B-A3B-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ToolSpace-35B-A3B-GGUF
- Modelo base: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Visor de descargas de mradermacher: https://hf.tst.eu/model#ToolSpace-35B-A3B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
