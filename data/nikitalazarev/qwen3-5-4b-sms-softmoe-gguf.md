# NikitaLazarev/Qwen3.5-4B-SMS-SoftMoE-GGUF

## Resumen

Qwen3.5-4B-SMS-SoftMoE-GGUF es una cuantizacion en formato GGUF Q8_0 del modelo Qwen3.5-4B-SMS-SoftMoE, un ajuste fino del modelo base Qwen3.5-4B de 4.326.350.848 parametros (aproximadamente 4,3 mil millones). Lo publica el desarrollador NikitaLazarev bajo el paraguas de Ivanna Lab, un laboratorio de modelos LLM autoalojado. El modelo incorpora un "steer patch" de dominio (denominado «СУБП / авиация», es decir, "SMS / aviacion" en ruso) que se ha integrado directamente en los pesos, de modo que el sesgo de dominio se aplica sin necesidad de soporte especial en el runtime.

La propuesta tecnica es un "soft MoE" (mezcla de expertos suave) aplicado sobre un transformer denso de 4B, combinado con tecnicas de weight steering. El resultado es un modelo conversacional especializado en el dominio de aviacion y sistemas de mensajeria SMS, empaquetado en GGUF Q8_0 para su ejecucion directa en llama.cpp, LM Studio u Ollama. El repositorio ocupa 4,6 GB y esta etiquetado como compatible con endpoints, lo que sugiere su uso detras de APIs compatibles con OpenAI.

Es relevante ahora porque demuestra un patron de publicacion de "expertos de dominio" empaquetados como variantes ligeras de un modelo base, con cuantizacion lista para produccion y sin dependencias de runtime personalizadas. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles de licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con soft MoE (mezcla de expertos suave) sobre base Qwen3.5-4B |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,3 mil millones de parametros, sobre el que se aplica una capa de "soft MoE" y un parche de steering de pesos orientado al dominio de aviacion y SMS. La tecnica de weight steering consiste en desplazar los pesos del modelo base en una direccion calculada para reforzar un comportamiento o dominio concreto, sin anadir parametros nuevos en tiempo de inferencia. El resultado se presenta como un "experto" de dominio dentro de una familia de variantes (soft MoE experts) generadas con la herramienta Ivanna Lab.

La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp, y el parche de dominio queda embebido en los pesos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion (decodificacion especulativa, attention linear, etc.). Tampoco se documenta el mecanismo exacto de enrutamiento del soft MoE ni el numero de expertos.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun la etiqueta `conversational` del repositorio.
- Especializacion de dominio en aviacion y sistemas de mensajeria SMS (СУБП / авиация) mediante weight steering embebido en los pesos.
- Ejecucion sin soporte especial de runtime: el parche de steering esta integrado en los pesos, por lo que funciona en llama.cpp, LM Studio y Ollama de forma nativa.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite exponerlo detras de APIs compatibles con OpenAI.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card esta redactada en ingles y ruso, pero no se declaran idiomas soportados.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional especializada en aviacion: el modelo puede gestionar dialogos multi-turno sobre procedimientos, terminologia y normativa aeronautica, aprovechando el steering de dominio embebido en los pesos sin necesidad de prompts de sistema extensos.
- Atencion al cliente en operaciones SMS: adecuado para responder consultas sobre envio, recepcion y estado de mensajes en plataformas de mensajeria, con un tono conversacional y conocimiento del dominio.
- Despliegue en local para entornos con requisitos de privacidad: al ser GGUF Q8_0 de ~4,6 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo, manteniendo los datos en la infraestructura propia.
- Prototipado rapido de asistentes de dominio: sirve como punto de partida para validar la tecnica de soft MoE + weight steering antes de escalar a modelos mayores o de generar variantes adicionales con Ivanna Lab.
- Integracion en pipelines de API compatibles con OpenAI: gracias a la etiqueta `endpoints_compatible`, puede conectarse a frameworks de orquestacion que esperan ese contrato, sustituyendo a un endpoint remoto por uno autoalojado.
- Experimentacion en investigacion sobre weight steering: util como caso de estudio reproducible de como un parche de dominio afecta al comportamiento de un modelo base de 4B, comparando la variante steer con el Qwen3.5-4B original.
- Chatbot embebido en herramientas de gestion aeroportuaria o de mensajeria: al caber en hardware modesto, puede integrarse en aplicaciones de escritorio o edge con llama.cpp como backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 4,6 GB de pesos, mas overhead de contexto y cache KV; en la practica, entre 6 y 8 GB de VRAM para contextos moderados.
- GPU recomendadas: no disponibles de forma especifica; por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojarlo con holgura. En el segmento profesional, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM en Q8_0; con cuantizaciones menores (no publicadas en este repo) cabria en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier servidor compatible con endpoints OpenAI que acepte GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-SMS-SoftMoE-GGUF | 4,33 B | no disponible | GGUF Q8_0 | no disponible | Soft MoE + weight steering de dominio aviacion/SMS |
| Qwen3.5-4B (base) | ~4,3 B | no disponible | safetensors | no disponible | Modelo base denso sin steering de dominio |
| Qwen3.5-4B-SMS-SoftMoE | ~4,3 B | no disponible | safetensors | no disponible | Variante con steering antes de la cuantizacion GGUF |

Las alternativas de otros autores no estan disponibles en la informacion proporcionada; la comparativa se limita a las variantes de la misma familia publicadas por el mismo autor.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; es un bloqueo critico para produccion.
- No se declaran idiomas soportados; la especializacion en ruso (dominio СУБП / авиация) sugiere un sesgo linguistico hacia ese idioma, pero no esta confirmado.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- El steering de dominio embebido en los pesos puede degradar el rendimiento general del modelo base fuera del dominio de aviacion y SMS.
- El repositorio registra cero descargas y cero likes, sin evidencia de validacion por parte de la comunidad.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- El mecanismo de soft MoE no esta descrito tecnicamente (numero de expertos, funcion de enrutamiento, coste computacional), lo que limita la evaluacion de su eficiencia real.
- Solo se publica la cuantizacion Q8_0; no hay variantes Q4_K_M, Q5_K_M ni otras que reduzcan el footprint para hardware mas limitado.
- El modelo base Qwen3.5-4B no esta verificado en la informacion proporcionada; conviene confirmar su procedencia y licencia original antes de reutilizar esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-4B-SMS-SoftMoE-GGUF
- Modelo base (soft MoE): https://huggingface.co/NikitaLazarev/Qwen3.5-4B-SMS-SoftMoE
- Herramienta Ivanna Lab: https://github.com/wiskeone/ivanna-lab
- llama.cpp (conversion GGUF): no se proporciona enlace directo en la informacion disponible
