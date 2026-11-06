# Goro64/Llama-Prompt-Guard-2-86M-mirror-meta-llama

## Resumen

Llama-Prompt-Guard-2-86M es un clasificador de texto desarrollado originalmente por Meta (meta-llama) y distribuido en este repositorio por Goro64 como espejo de archivo sin modificaciones del release upstream, fijado al commit `a8ded8e697ce7c355e395a0df51f94adb4a2fd27`. Su funcion es detectar prompts maliciosos, en concreto intentos de inyeccion y jailbreak, en entradas de texto antes de que lleguen a un modelo generativo. No es un modelo generativo: es un cabezal de clasificacion binaria o multietiqueta construido sobre una arquitectura tipo DeBERTa-v2, segun la etiqueta `deberta-v2` del repositorio.

El modelo pesa 278.810.882 parametros segun los tensores en safetensors, lo que se corresponde con la variante de 86M de la familia Prompt Guard 2 mas los componentes adicionales de la arquitectura encoder (embeddings y capas de clasificacion). El repositorio ocupa 1,1 GB y se distribuye en formato safetensors bajo la libreria transformers, con pipeline `text-classification`. Soporta ocho idiomas declarados: ingles, frances, aleman, hindi, italiano, portugues, espanol y tailandes.

Su relevancia actual es doble. Por un lado, cubre la necesidad practica de filtrar entradas en pipelines de LLM en produccion, un paso cada vez mas habitual en sistemas con agentes y tool calling. Por otro, el repositorio es un ejercicio de preservacion reproducible: incluye manifiesto de payload con digests SHA-256, registro de procedencia y copia verbatim de la model card y los avisos legales upstream, lo que permite auditar exactamente que se distribuyo y bajo que terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer, etiqueta `deberta-v2` en el repo) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin variantes GGUF publicadas en este repo) |
| Idiomas soportados | en, fr, de, hi, it, pt, es, th |
| Licencia | Llama 4 Community License Agreement (efectiva desde el 5 de abril de 2025) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia DeBERTa-v2 con un cabezal de clasificacion de secuencias, orientado a la tarea `text-classification`. El uso previsto es la deteccion de prompts adversariales: inyeccion de instrucciones, jailbreaks y contenido de riesgo en la entrada del usuario. Al ser un encoder bidireccional, procesa la secuencia completa en una pasada y emite una puntuacion por clase, lo que lo hace adecuado como filtro previo de baja latencia frente a un modelo generativo.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. La model card del espejo remite explicitamente a la model card upstream conservada en `upstream/README.md` para informacion de entrenamiento y evaluacion, y declara que el mantenedor del espejo no ha entrenado, ajustado, cuantizado ni evaluado el modelo de forma independiente. El espejo no anade ninguna afirmacion tecnica propia.

## Capacidades

- Clasificacion de texto para deteccion de prompts maliciosos (inyeccion de instrucciones, jailbreak) en la entrada de un sistema LLM.
- Salida de etiquetas de clasificacion con puntuaciones, integrable como etapa de filtrado previo (pre-filter) en pipelines de inferencia.
- Cobertura multilingue declarada en ocho idiomas: ingles, frances, aleman, hindi, italiano, portugues, espanol y tailandes.
- Compatible con la libreria transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y `endpoints_compatible`, lo que facilita su despliegue como endpoint gestionado.
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta razonamiento multi-paso ni agentes. Su funcion es exclusivamente discriminativa.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Filtrado de entrada en un chatbot de atencion al cliente: el clasificador se ejecuta antes del LLM generativo y bloquea o marca mensajes que intentan sobrescribir instrucciones del sistema, reduciendo la superficie de ataque sin anadir latencia perceptible al ser un modelo de 278M de parametros.
- Proteccion de agentes con tool calling: en sistemas donde el modelo puede invocar funciones externas, un prompt inyectado puede desencadenar acciones no deseadas; este clasificador actua como guardia previo que descarta entradas sospechosas antes de que el agente planifique.
- Moderacion de contenido generado por usuarios en foros o comentarios: clasificacion por lotes de mensajes entrantes para detectar intentos de manipulacion dirigidos a sistemas automatizados de respuesta.
- Evaluacion de robustez y red teaming: uso como componente de referencia para medir la tasa de evasion de ataques de prompt injection en un conjunto de pruebas propio, comparando la salida del clasificador con etiquetas manuales.
- Cumplimiento y auditoria en despliegues multilingues: al cubrir espanol, frances, aleman, italiano, portugues, hindi y tailandes, permite aplicar una unica politica de filtrado en productos con base de usuarios internacional.
- Pipeline de CI/CD para aplicaciones LLM: ejecutar el clasificador sobre un corpus de prompts de regresion en cada despliegue para detectar si cambios en el system prompt o en la configuracion aumentan la tasa de entradas clasificadas como maliciosas.
- Archivado y reproducibilidad de auditorias de seguridad: el repositorio incluye manifiesto con digests SHA-256 y registro de procedencia, util para equipos que necesitan fijar una version exacta del clasificador en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas propias y remite a la model card upstream conservada en `upstream/README.md` para las afirmaciones de evaluacion originales, que no se reproducen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8M parametros x 4 bytes), mas activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con margen amplio; tambien puede ejecutarse en CPU para cargas por lotes de baja frecuencia.
- Opciones de despliegue: transformers (libreria declarada), Text Embeddings Inference (etiqueta `text-embeddings-inference`) y endpoints compatibles (`endpoints_compatible`). No se han publicado pesos GGUF en este repositorio, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M (este repo) | 278.810.882 | no disponible | Clasificacion de prompts maliciosos | Llama 4 Community License | Hugging Face, espejo de archivo |
| meta-llama/Llama-Prompt-Guard-2-86M (upstream) | mismo payload | no disponible | Clasificacion de prompts maliciosos | Llama 4 Community License | Hugging Face, repositorio original |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos es frente al repositorio upstream, del que este es una copia exacta de pesos segun el manifiesto de integridad. No se dispone de informacion sobre otros clasificadores de seguridad de prompt en los datos proporcionados.

## Limitaciones y advertencias

- El mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo; la preservacion del artefacto no constituye una garantia de seguridad ni una recomendacion de despliegue.
- Es un clasificador, no un filtro infalible: puede producir falsos positivos y falsos negativos, y los ataques de prompt injection evolucionan, por lo que requiere actualizacion y evaluacion continuas.
- No se dispone de datos sobre sesgos, tasas de alucinacion (no aplica en sentido generativo, pero si en forma de clasificaciones erroneas) ni robustez frente a ataques adversariales en los datos proporcionados.
- La longitud de contexto no esta documentada en la informacion disponible; prompts muy largos pueden truncarse y perder la parte maliciosa.
- La licencia es la Llama 4 Community License Agreement, no una licencia permisiva tipo Apache o MIT: el uso comercial y la redistribucion estan sujetos a sus terminos, incluida la Acceptable Use Policy conservada en el repositorio.
- El espejo fija un commit concreto; no refleja necesariamente releases posteriores del upstream. Para produccion conviene decidir explicitamente entre fijar el snapshot o seguir el repositorio original.
- El modelo esta pensado para clasificar entradas de texto, no para moderar contenido generado de forma general ni para tareas de NLP distintas de la seguridad de prompts.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-mirror-meta-llama
- Repositorio upstream: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Commit upstream fijado: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M/tree/a8ded8e697ce7c355e395a0df51f94adb4a2fd27
- Model card upstream en el commit capturado: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M/blob/a8ded8e697ce7c355e395a0df51f94adb4a2fd27/README.md
- Coleccion de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
