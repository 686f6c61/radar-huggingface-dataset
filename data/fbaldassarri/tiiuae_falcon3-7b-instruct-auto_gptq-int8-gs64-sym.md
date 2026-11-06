# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo tiiuae/Falcon3-7B-Instruct, publicada por el usuario fbaldassarri. La cuantización se ha realizado con Intel AutoRound v0.16.0 aplicando el algoritmo GPTQ (AutoGPTQ) en modo weights-only quantization (WoQ), con 8 bits, tamaño de grupo 64 y cuantización simétrica. El objetivo declarado es facilitar la inferencia en hardware Intel: CPU, iGPU Arc (mediante intel-extension-for-pytorch) y NPU de la serie Core Ultra (mediante OpenVINO).

El modelo base es Falcon3-7B-Instruct, desarrollado por el Technology Innovation Institute (TII) de Abu Dhabi, una familia de modelos causales de tipo transformer orientada a instrucciones y conversación. La model card del artefacto cuantizado declara el tipo de modelo como `llama` y un total de 2.599.044.096 parámetros reales en los pesos safetensors, un dato que conviene contrastar con la nomenclatura comercial "7B" del modelo original.

La relevancia de este artefacto es doble: por un lado, ofrece una ruta de despliegue de un modelo instructivo de tamaño medio en entornos sin GPU dedicada; por otro, documenta de forma reproducible todo el pipeline de cuantización (versiones, hiperparámetros, condiciones de ejecución y tiempos), lo que facilita la auditoría y la réplica del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type declarado: llama) |
| Parametros totales | 2.599.044.096 (según safetensors del repo cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 GPTQ (WoQ), group size 64, simétrica; pesos en safetensors con configuración auto_gptq |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cuantización auto_gptq), cargable con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo decoder-only orientado a instrucciones. La model card del artefacto cuantizado no detalla la arquitectura interna del modelo original (número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones específicas), por lo que esos datos deben consultarse en la ficha del modelo base. El artefacto declara `model_type: llama`, etiqueta de compatibilidad con la librería transformers.

El proceso de cuantización sí está documentado con precisión. Se empleó Intel AutoRound 0.16.0 con el algoritmo GPTQ, cargando el modelo en bfloat16, calibrando en CPU con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4. La ejecución completa tardó 36.033,6 segundos (unas 600,6 minutos) y finalizó el 15 de octubre de 2026. Las versiones registradas son transformers 4.55.3 y torch 2.14.1+cpu. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat integrada.
- Respuesta a instrucciones en formato multi-turno (`apply_chat_template`).
- Razonamiento general y respuesta a preguntas, heredado del modelo base instructivo.
- Inferencia en CPU Intel, iGPU Arc y NPU Core Ultra, según declara el autor.
- Compatibilidad con text-generation-inference (tag presente en el repositorio).
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistente conversacional en estaciones de trabajo sin GPU: el modelo puede ejecutarse en CPU Intel con intel-extension-for-pytorch, aprovechando la cuantización INT8 para reducir el consumo de memoria frente al modelo en bfloat16.
- Despliegue en portátiles con Intel Core Ultra: la variante cuantizada está pensada para la NPU (AI Boost) vía OpenVINO, lo que permite mantener el modelo cargado en local sin depender de la nube.
- Prototipado de chatbots en iGPU Arc: útil para equipos de desarrollo que quieren validar flujos conversacionales antes de escalar a infraestructura con GPU dedicada.
- Generación de texto por lotes en servidores CPU: el formato safetensors con configuración auto_gptq permite integrarse en pipelines de transformers existentes sin reescribir el código de carga.
- Evaluación comparativa de cuantizaciones: al documentarse el pipeline completo (versiones, hiperparámetros, tiempos), sirve como referencia para reproducir y comparar el impacto de INT8 gs64 frente a otras configuraciones.
- Investigación sobre cuantización WoQ: el artefacto permite estudiar la degradación de calidad de GPTQ con group size 64 y simetría en un modelo instructivo de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 10,2 GB, lo que da una referencia del espacio en disco necesario para los pesos cuantizados.
- El autor indica que la cuantización está orientada a CPU Intel, iGPU Intel Arc y NPU Intel Core Ultra (AI Boost), no a GPU dedicada.
- Cabe en hardware de consumo Intel: la propia existencia del artefacto responde a ese objetivo, aunque no se aportan cifras de latencia ni throughput.
- Opciones de despliegue: transformers (con `device_map="auto"`), intel-extension-for-pytorch, OpenVINO y text-generation-inference (tag del repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-sym | 2.599.044.096 (según safetensors) | No disponible | INT8 GPTQ gs64 simétrica | Apache 2.0 | Hugging Face (17 descargas) |
| tiiuae/Falcon3-7B-Instruct (modelo base) | No disponible en esta ficha | No disponible | bfloat16 original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo modelo base | No disponible | No disponible | No disponible | Apache 2.0 (heredada) | No disponible |

No se dispone de datos de rendimiento comparativo ni de otras alternativas cuantizadas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está garantizado ni evaluado.
- El autor indica que el modelo se ha desarrollado únicamente con fines de investigación y sin garantía alguna.
- La cuantización INT8 con group size 64 puede introducir degradación de calidad respecto al modelo en bfloat16; no se aportan métricas que la cuantifiquen.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- No se documentan sesgos conocidos del modelo base en esta información.
- La longitud de contexto no está especificada, lo que impide planificar cargas con ventanas largas.
- El repositorio tiene un volumen de descargas muy bajo (17) y cero likes, por lo que su validación por la comunidad es limitada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de las dependencias (AutoRound, GPTQ) antes de un uso comercial.
- El campo `inference: false` en la model card puede afectar a la carga automática en algunos entornos de Hugging Face; es necesario revisar la configuración de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de cuantización referenciado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
