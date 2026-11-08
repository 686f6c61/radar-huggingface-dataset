# hisplan/gemma4-e2b-finetuned

## Resumen

`hisplan/gemma4-e2b-finetuned` es un ajuste fino (fine-tuning) del modelo `unsloth/gemma-4-E2B-it`, que a su vez deriva de la familia Gemma 4 de Google. Lo desarrolla el usuario hisplan y se publica bajo licencia Apache 2.0. El modelo base es la variante E2B, la mas pequena de la familia Gemma 4, con aproximadamente 2.100 millones de parametros y disenada para inferencia en CPU y dispositivos de borde. El ajuste fino se realizo con Unsloth, una libreria de entrenamiento optimizada que, segun el autor, permite entrenar "2x mas rapido".

El interes de esta ficha es doble: por un lado documenta un checkpoint comunitario concreto (sin descargas ni likes en el momento de la consulta, creado el 8 de noviembre de 2026), y por otro sirve para caracterizar el modelo base Gemma 4 E2B, del que se conoce que es text-only, tiene una ventana de contexto de 8K tokens y esta pensado para ejecucion local en hardware modesto. No se dispone de informacion sobre el dataset de ajuste fino, hiperparametros ni evaluaciones especificas del checkpoint.

La relevancia practica de este checkpoint es limitada: la model card es una plantilla autogenerada por Unsloth, no documenta el proposito del fine-tuning ni incluye metricas, y el repositorio ocupa solo 0,1 GB, lo que sugiere pesos en cuantizacion o un subconjunto reducido. Debe tratarse como un artefacto experimental de la comunidad, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles especificos no disponibles) |
| Parametros totales | ~2.100 millones (heredado del modelo base Gemma 4 E2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8.192 tokens (8K, segun el modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones habituales (GGUF, int4/int8) via llama.cpp, aunque no se documenta en esta ficha |
| Idiomas soportados | en (segun tags y model card); el modelo base no documenta otros idiomas en la informacion disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino supervisado (SFT) del modelo `unsloth/gemma-4-E2B-it`, realizado con la libreria Unsloth y las herramientas del ecosistema TRL. La arquitectura subyacente es la de Gemma 4 E2B: un transformer decoder-only de unos 2.100 millones de parametros, text-only, con 8K de contexto y orientado a ejecucion en CPU. No se dispone de informacion sobre la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento, si se aplico RLHF/DPO adicional ni los hiperparametros empleados.

La unica innovacion tecnica documentada es el uso de Unsloth para el entrenamiento, que segun el autor acelera el proceso aproximadamente 2x. No hay informacion sobre tecnicas de atencion, decodificacion especulativa ni optimizaciones de inferencia especificas de este checkpoint. Dado que el repositorio pesa 0,1 GB, es probable que los pesos publicados no correspondan al modelo completo en precision nativa, pero el autor no lo especifica.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instruct (`gemma-4-E2B-it`).
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo base.
- Capacidades multilingues: no documentadas; la model card solo declara `en`.
- Tool calling / function calling: no documentado en este checkpoint ni confirmado para el modelo base en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio o modo "thinking": no disponible (el modelo base E2B es text-only).
- Ejecucion en CPU y dispositivos de borde: si, por las caracteristicas del modelo base.

## Casos de uso

- Prototipado rapido de asistentes de texto en local: el modelo, con ~2,1B de parametros y 8K de contexto, puede ejecutarse en CPU para pruebas de concepto sin GPU dedicada.
- Clasificacion y extraccion de informacion en ingles: tareas de procesamiento de texto por lotes donde el coste de inferencia es critico y la latencia no es restrictiva.
- Experimentacion academica con fine-tuning: sirve como ejemplo de pipeline Unsloth + TRL para reproducir ajustes finos sobre modelos Gemma pequenos.
- Despliegue en sistemas embebidos o edge: adecuado por su reducido tamano y su capacidad de correr sin acelerador, para tareas de generacion de texto acotadas.
- Generacion de respuestas en chatbots de bajo coste: con contexto de 8K puede gestionar conversaciones multi-turno breves, aunque sin garantias de calidad por falta de evaluaciones.
- Base para futuros ajustes finos especificos de dominio: al estar publicado en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida, siempre que se validen sus pesos y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni otras) y la busqueda web solo aporta caracteristicas del modelo base, no resultados numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de ~2,1B parametros en fp16 requiere del orden de 4-5 GB, y en cuantizacion int4 alrededor de 1,5-2 GB; estas cifras son estimaciones por tamano, no datos publicados para este checkpoint.
- GPU recomendadas: no documentadas. Por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores; el modelo base esta disenado ademas para ejecucion en CPU.
- Cabe en GPU consumer: previsiblemente si, dada la escala del modelo base; no confirmado para este checkpoint concreto.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag del repositorio) y, para el modelo base, llama.cpp/Ollama mediante conversion a GGUF (no se proporcionan artefactos GGUF en este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hisplan/gemma4-e2b-finetuned | ~2,1B | 8K | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning comunitario sin evaluaciones |
| unsloth/gemma-4-E2B-it (base) | ~2,1B | 8K | Apache 2.0 (segun este repo) | Hugging Face | Modelo instruct de referencia del que deriva |
| Gemma 4 E2B (original) | ~2,1B | 8K | no disponible en la informacion | gemma4.dev / Google | Text-only, orientado a CPU y edge |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks ni validacion del efecto del fine-tuning, por lo que se desconoce si mejora o degrada al modelo base.
- Documentacion minima: la model card es una plantilla de Unsloth; no se especifican dataset, objetivo del ajuste ni hiperparametros.
- Riesgo de alucinacion: inherente a los modelos de ~2B parametros; sin evaluacion especifica no puede cuantificarse.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y previsiblemente sera limitado.
- Contexto reducido: 8K tokens limita casos de uso con documentos largos o conversaciones extensas.
- Sesgos: no documentados por el autor; deben asumirse los sesgos del corpus de entrenamiento del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Google antes de desplegar en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; repositorio de 0,1 GB que puede no contener pesos completos en precision nativa. No recomendado para produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/gemma4-e2b-finetuned
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E2B-it
- Pagina del modelo base Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
