# ApolloRaines/Llama-3.1-8B-Instruct-No-Servility-No-Hedging

## Resumen

Llama-3.1-8B-Instruct-No-Servility-No-Hedging es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. jBlaze aplica técnicas de ingeniería de representación (representation engineering) y ablación de comportamientos (abliteration) directamente sobre los pesos del modelo, sin realizar ningún fine-tuning ni entrenamiento adicional. El objetivo declarado es suprimir dos comportamientos específicos: el lenguaje servil (servility) y el uso de titubeos o muletillas de cautela (hedging), para producir respuestas más directas, seguras y con un tono de comunicación entre pares.

El modelo mantiene la arquitectura original de Llama-3.1-8B-Instruct (un transformer decoder-only con 32 capas y aproximadamente 8.030 millones de parámetros) y se distribuye en formato safetensors con precisión bf16. Está pensado para generación de texto en inglés y se publica bajo la licencia Llama 3.1 Community License. Aunque no se han publicado benchmarks específicos, su relevancia radica en demostrar una alternativa al fine-tuning para ajustar comportamientos concretos de un LLM, con un coste computacional mínimo y sin necesidad de datos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificado (heredado del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es una copia exacta de Llama-3.1-8B-Instruct en cuanto a arquitectura: un transformer causal con 32 capas, atención multi-cabeza, y un total de 8.030 millones de parámetros. No se ha realizado ningún entrenamiento adicional (ni pre-entrenamiento ni fine-tuning). En su lugar, se ha aplicado la herramienta jBlaze, que modifica directamente los pesos del modelo mediante técnicas de ingeniería de representación. Según la documentación del autor, jBlaze identifica y suprime direcciones o vectores en el espacio de activaciones asociados a comportamientos no deseados (en este caso, servilidad y titubeo), de forma similar a la abliteración. Este proceso no requiere datos etiquetados ni GPU adicionales, y se ejecuta en minutos.

No se han proporcionado detalles sobre el dataset de entrenamiento original (que es el de Llama-3.1-8B-Instruct) ni sobre el proceso exacto de modificación. La precisión de los pesos se mantiene en bf16, igual que el modelo base.

## Capacidades

- Generacion de texto en ingles: responde a preguntas, mantiene conversaciones y produce texto coherente.
- Razonamiento basico: resuelve operaciones aritmeticas (ej. 17 * 23 = 391) y explica procesos paso a paso.
- Generacion de codigo: es capaz de escribir funciones en Python (ej. invertir una cadena) y explicar su funcionamiento.
- Conocimiento general: proporciona respuestas factuales (ej. capital de Francia) y corrige afirmaciones incorrectas con argumentos cientificos.
- Tono directo y sin titubeos: las respuestas evitan formulas de cortesia excesiva y muletillas de cautela, segun los ejemplos mostrados.
- No se especifican capacidades adicionales como tool calling, agentes, vision o audio. Al ser una variante del modelo instruct, podria heredar algunas de sus capacidades, pero no esta confirmado en la documentacion.

## Casos de uso

- Asistencia tecnica en ingles: el modelo puede responder consultas de usuarios con un tono directo y sin rodeos, adecuado para foros o chats de soporte donde se valora la concision.
- Generacion de documentacion tecnica: al no incluir lenguaje servil, es util para redactar guias o manuales con un estilo claro y profesional.
- Educacion y tutoria: puede explicar conceptos matematicos o de programacion con ejemplos concretos, como se muestra en la generacion de la funcion `reverse_string`.
- Correccion de desinformacion: el modelo ofrece argumentos basados en consenso cientifico (ej. sobre la forma de la Tierra), lo que puede servir en aplicaciones de verificacion de hechos.
- Desarrollo de chatbots internos: empresas que necesiten un asistente conversacional en ingles con respuestas seguras y sin ambiguedades pueden integrarlo en sus sistemas.
- Prototipado rapido de agentes conversacionales: al ser un modelo de 8B, puede ejecutarse en hardware moderado y usarse para pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Dado que es una variante del Llama-3.1-8B-Instruct, es probable que su rendimiento en tareas generales sea similar al del modelo base, pero no se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB (8,03 B parametros × 2 bytes por parametro). Esto permite ejecutar el modelo en GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- No se proporcionan cuantizaciones oficiales, pero al ser un modelo Llama, es compatible con herramientas como llama.cpp u Ollama que permiten cuantizar a 4 u 8 bits, reduciendo la VRAM a unos 4-5 GB en 4 bits.
- Opciones de despliegue: se puede usar con la libreria Transformers de Hugging Face (como se muestra en el codigo de ejemplo), o mediante servidores de inferencia como vLLM, TGI o llama.cpp.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (ej. RTX 4090), se espera una generacion de decenas de tokens por segundo, pero depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128k (segun Meta) | Llama 3.1 Community | safetensors, GGUF | Modelo original, con comportamiento estandar |
| Llama-3.1-8B-Instruct-No-Servility-No-Hedging | 8,03 B | no especificado | Llama 3.1 Community | safetensors (bf16) | Variante con servilidad y titubeo suprimidos |
| Mistral-7B-Instruct | 7,24 B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar, con licencia permisiva |

No se dispone de datos de rendimiento comparativo (benchmarks) para esta variante. La comparativa se limita a caracteristicas tecnicas y de licencia.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No se ha entrenado ni adaptado para otros idiomas.
- Sesgos: al derivar de Llama-3.1-8B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento originales. La modificacion con jBlaze no elimina sesgos generales, solo los comportamientos de servilidad y titubeo.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion incorrecta o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se ha especificado la longitud de contexto de esta variante. Se asume que hereda los 128k del modelo base, pero no esta confirmado.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial, pero si el producto tiene mas de 700 millones de usuarios mensuales, se requiere una licencia comercial de Meta. Ademas, no se permite usar el modelo para mejorar otros modelos grandes.
- Herramienta propietaria: jBlaze es una herramienta de pago o propietaria; la modificacion no es reproducible sin ella, aunque los pesos resultantes son abiertos.
- Sin garantias de rendimiento: al no haber benchmarks publicados, no se puede asegurar que el modelo mantenga el mismo nivel de calidad que el base en todas las tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-No-Servility-No-Hedging
- Herramienta jBlaze: https://jblaze.dev
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentacion de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
