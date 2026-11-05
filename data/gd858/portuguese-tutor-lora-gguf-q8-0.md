# gd858/portuguese-tutor-lora-gguf-q8-0

## Resumen

El modelo `gd858/portuguese-tutor-lora-gguf-q8-0` es un adaptador LoRA publicado en HuggingFace por el usuario gd858, pensado para el ajuste fino de un modelo base de la familia Gemma. Concretamente, el adaptador se ha entrenado sobre `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante cuantizada en 4 bits del modelo Gemma 4 E2B en su version instruct, optimizada con la libreria Unsloth. El nombre del repositorio sugiere que el proposito del ajuste es actuar como tutor de portugues, aunque la model card no desarrolla esta funcion ni documenta el conjunto de datos de entrenamiento.

El artefacto publicado combina dos formatos: por un lado, los pesos del adaptador LoRA en `safetensors` (12.668.928 parametros, unos 12,7 millones), y por otro, una conversion a GGUF con cuantizacion Q8_0, tal como indica el sufijo `gguf-q8-0` del identificador. Esta doble publicacion permite tanto cargar el adaptador con PEFT sobre el modelo base en transformers como desplegar la version cuantizada en entornos de inferencia local compatibles con llama.cpp u Ollama, si bien la model card no detalla el procedimiento exacto de fusion ni de conversion.

La relevancia del modelo es limitada y muy acotada: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y con una model card que es practicamente la plantilla por defecto de HuggingFace sin rellenar. No obstante, resulta util como ejemplo de flujo de trabajo con Unsloth y PEFT para adaptar un modelo Gemma cuantizado a una tarea conversacional especifica, y como caso de publicacion de adaptadores LoRA en formato GGUF para inferencia ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base Gemma 4 E2B instruct cuantizado en 4 bits; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 12.668.928 parametros del adaptador (dato real de safetensors); parametros del modelo base no disponibles |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 en el artefacto GGUF publicado; el modelo base se entrena sobre una variante bnb-4bit |
| Idiomas soportados | no disponibles (el nombre sugiere portugues, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (cuantizacion Q8_0) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, no un modelo completo. Se entrena sobre `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que es una version del Gemma 4 E2B instruct cuantizada en 4 bits mediante bitsandbytes y optimizada para entrenamiento con Unsloth. La libreria declarada es PEFT 0.18.1, y los tags confirman el uso de `lora`, `transformers` y `unsloth`. El adaptador tiene 12.668.928 parametros entrenables, un tamano coherente con un rango LoRA moderado sobre un modelo de pocos miles de millones de parametros, aunque el numero exacto de capas adaptadas y el rango no se especifican.

No hay informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, la composicion del corpus, la existencia de RLHF o DPO, ni los hiperparametros empleados. La model card incluye la plantilla estandar de HuggingFace con multiples campos marcados como `[More Information Needed]`, incluyendo desarrollador, financiacion, tipo de modelo, idiomas, licencia, datos de entrenamiento, regimen de entrenamiento y evaluacion. Tampoco se documenta el proceso de fusion del adaptador con el modelo base ni la conversion a GGUF Q8_0, aunque la presencia del artefacto GGUF indica que se realizo algun tipo de merge y cuantizacion previa a la publicacion.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Gemma 4 E2B instruct, orientadas a dialogo multi-turno.
- Tutoria de portugues: el nombre del repositorio sugiere un ajuste para asistir en el aprendizaje o la practica del portugues, aunque no se documenta el alcance ni la calidad de esta capacidad.
- Instrucciones y seguimiento de formato: al derivar de una variante instruct, se espera que responda a instrucciones y mantenga formatos de respuesta, si bien no hay evaluacion publicada.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles oficialmente; el nombre sugiere foco en portugues, pero no se declara.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Practica de conversacion en portugues: el adaptador puede cargarse sobre el modelo base para mantener dialogos guiados en portugues, con correcciones y explicaciones gramaticales, aprovechando el ajuste especifico del LoRA. Es adecuado por su bajo coste de almacenamiento (0,1 GB) y su naturaleza de adaptador ligero.
- Despliegue local en hardware modesto: la version GGUF Q8_0 permite ejecutar el modelo fusionado en llama.cpp u Ollama en equipos de consumo, lo que facilita probar el ajuste sin infraestructura de GPU dedicada.
- Prototipado rapido de asistentes educativos: sirve como base para experimentar con tecnicas de tutoria linguistica antes de invertir en un ajuste completo o en un modelo mayor.
- Evaluacion de pipelines PEFT y Unsloth: util como caso de referencia para validar flujos de entrenamiento con cuantizacion 4 bits y publicacion de adaptadores en safetensors y GGUF.
- Generacion de ejercicios de portugues: el modelo puede producir frases de ejemplo, conjugaciones o dialogos para materiales didacticos, siempre que se valide la calidad de forma manual dado que no hay benchmarks.
- Integracion en aplicaciones de chat ligero: mediante la API de transformers con PEFT o mediante un servidor compatible con GGUF, se puede incorporar a demos y prototipos de bajo trafico.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para ajustes adicionales sobre el mismo modelo base, reduciendo el coste frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion con datos, y no se han encontrado metricas de MMLU, HumanEval, GSM8K ni de tareas de tutoria linguistica para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el adaptador LoRA ocupa unos 0,1 GB en safetensors; el modelo base Gemma 4 E2B en 4 bits requeriria aproximadamente entre 2 y 4 GB de VRAM, y la version GGUF Q8_0 del modelo fusionado seria considerablemente mayor, en el orden de varios GB, aunque no se especifica el tamano exacto del artefacto.
- GPU recomendadas: no disponibles. Por el tamano del modelo base, cabria esperar ejecucion en GPU de consumo como RTX 3060, RTX 4060 o RTX 4090, pero no hay confirmacion en la informacion proporcionada.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido del modelo base, pero no confirmado.
- Opciones de despliegue: transformers con PEFT 0.18.1 para el adaptador; llama.cpp u Ollama para el artefacto GGUF Q8_0. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gd858/portuguese-tutor-lora-gguf-q8-0 | 12,7 M (adaptador) | no disponible | no disponible | safetensors + GGUF | Adaptador LoRA de nicho, sin benchmarks ni documentacion |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | no disponible | no disponible | no disponible | safetensors (4 bits) | Modelo base sobre el que se entrena el adaptador |
| Adaptadores LoRA de tutoria linguistica en HuggingFace | variable | variable | variable | safetensors, GGUF | No se dispone de una comparativa concreta con metricas en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria. La informacion proporcionada no incluye benchmarks ni especificaciones del modelo base que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar el modelo base Gemma, es probable que arrastre sesgos presentes en sus datos de entrenamiento, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado. La model card no incluye ninguna advertencia ni evaluacion de fidelidad.
- Limitaciones de contexto o idioma: no se declara la longitud de contexto ni los idiomas soportados oficialmente; el nombre sugiere portugues, pero no hay confirmacion ni evaluacion de calidad.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de Gemma, podrian aplicar las condiciones de la licencia del modelo base, no declaradas en este repositorio.
- Caveat para produccion: el modelo tiene cero descargas y cero likes, no incluye datos de entrenamiento, evaluacion ni procedimiento de merge, y su model card es la plantilla por defecto sin rellenar. No es recomendable para produccion sin una validacion exhaustiva previa.
- Ausencia de documentacion sobre el proceso de conversion a GGUF Q8_0: no se especifica si el artefacto GGUF contiene el adaptador fusionado con el modelo base o solo el adaptador, lo que afecta a su uso directo.
- Fecha de creacion y actualizacion muy proximas (2026-11-05), lo que sugiere una publicacion reciente y sin mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gd858/portuguese-tutor-lora-gguf-q8-0
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Libreria PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Paper de estimacion de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
