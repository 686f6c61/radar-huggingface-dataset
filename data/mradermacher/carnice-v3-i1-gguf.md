# mradermacher/Carnice-V3-i1-GGUF

## Resumen

Carnice-V3-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Carnice-V3, desarrollado originalmente por kai-os y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a tareas de agente, tool calling y conversación, con capacidades de visión. El repositorio ofrece varias versiones cuantizadas (Q2_K, IQ3_M, Q4_K_S) que permiten ejecutar el modelo en hardware de consumo con distintos equilibrios entre tamaño, velocidad y calidad.

La relevancia de esta ficha radica en que proporciona una versión optimizada para inferencia local de un modelo que, por su tamaño, no sería viable en GPUs domésticas sin cuantización. La licencia Apache 2.0 facilita su uso comercial y la integración en productos. Aunque la información pública sobre la arquitectura y el entrenamiento es limitada, los tags indican que se basa en la familia Qwen3.8 y que incorpora técnicas de merged LoRA y soporte para agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren base Qwen3.8) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (ademas de archivo imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento de Carnice-V3. Los metadatos del repositorio indican que el modelo base es kai-os/Carnice-V3, que a su vez parece derivar de la familia Qwen3.8 (segun los tags). Se menciona que es un "full-model" con "merged-lora", lo que sugiere que se ha realizado una fusion de LoRA sobre el modelo base. Tambien se identifica como un modelo de vision, aunque los archivos de proyeccion multimodal (mmproj) se encuentran en el repositorio estatico de cuantizaciones, no en este.

No hay datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La cuantizacion imatrix aplicada por mradermacher utiliza una matriz de importancia calculada sobre un conjunto de datos de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para mantener dialogos multi-turno, como indica el tag "conversational".
- Tool calling / function calling: los tags "tool-use" y "hermes-agent" indican soporte para invocar herramientas externas, lo que permite integrarlo en flujos de agente.
- Capacidades de agente: puede realizar razonamiento multi-paso y orquestar llamadas a APIs o funciones.
- Vision: es un modelo multimodal, aunque los archivos de proyeccion de imagen (mmproj) estan disponibles en el repositorio estatico de GGUF, no en este.
- Multilingue: solo se declara ingles como idioma soportado.

## Casos de uso

- Asistentes conversacionales con acceso a herramientas: el modelo puede gestionar conversaciones y, cuando sea necesario, invocar funciones externas (por ejemplo, consultas a bases de datos, APIs de clima o calendario) gracias a su soporte de tool calling.
- Agentes autonomos de automatizacion: su capacidad de razonamiento multi-paso y de llamada a herramientas lo hace adecuado para tareas como la gestion de correos, la programacion de citas o la extraccion de informacion de documentos.
- Chatbots de atencion al cliente: al ser conversacional y soportar tool-use, puede derivar consultas a sistemas de ticketing o CRM, manteniendo el contexto de la conversacion.
- Analisis de imagenes con descripcion textual: al ser un modelo de vision, puede procesar imagenes y generar descripciones o responder preguntas sobre su contenido, aunque requiere el archivo mmproj correspondiente.
- Generacion de codigo asistida: aunque no se menciona explicitamente, su base Qwen3.8 y su capacidad de agente permiten usarlo en entornos de desarrollo para autocompletar o refactorizar codigo, siempre que se le proporcionen las herramientas adecuadas.
- Prototipado rapido de aplicaciones de IA: gracias a su licencia Apache 2.0 y a las cuantizaciones GGUF, se puede desplegar en entornos locales o en la nube con frameworks como llama.cpp u Ollama para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de los archivos GGUF, se necesitan aproximadamente 11 GB para la cuantizacion i1-Q2_K, 12,9 GB para i1-IQ3_M y 15,9 GB para i1-Q4_K_S. A esto hay que anadir la memoria del sistema y el overhead del runtime.
- GPU recomendadas: para la cuantizacion Q4_K_S se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4080/4090, A4000 o similar. Para las cuantizaciones mas bajas, una GPU de 12 GB (RTX 3060/4070) puede ser suficiente.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K e IQ3_M caben en GPUs de 12-16 GB, y la Q4_K_S en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para uso en produccion con mayor throughput, se puede convertir a otros formatos o usar vLLM con el modelo base safetensors.
- Latencia y throughput: no se dispone de datos medidos. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El tamaño de 27B y las capacidades de agente lo situan en un segmento similar a modelos como Qwen2.5-27B o Llama-3-8B (aunque este ultimo es mas pequeño), pero no se tienen datos de rendimiento ni de arquitectura para realizar una comparacion objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Solo se declara soporte para ingles; puede degradarse en otros idiomas.
- Al ser una cuantizacion, existe una perdida de calidad respecto al modelo original en precision completa, especialmente en las versiones de menor tamaño (Q2_K).
- No se ha publicado informacion sobre sesgos especificos, pero como modelo de lenguaje generico puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones criticas.
- La longitud de contexto no esta documentada; es necesario probar el modelo para determinar su ventana real.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener restricciones adicionales no declaradas en este repositorio; se recomienda revisar la licencia del modelo original kai-os/Carnice-V3.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Carnice-V3-i1-GGUF
- Repositorio GGUF estatico (con mmproj): https://huggingface.co/mradermacher/Carnice-V3-GGUF
- Modelo base (kai-os/Carnice-V3): https://huggingface.co/kai-os/Carnice-V3
- Pagina de descargas de mradermacher: https://hf.tst.eu/model
