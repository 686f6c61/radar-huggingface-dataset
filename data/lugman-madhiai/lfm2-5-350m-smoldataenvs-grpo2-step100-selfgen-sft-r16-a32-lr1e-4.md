# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4 es un ajuste fino (SFT con LoRA) del modelo base lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100, que a su vez deriva de la familia LFM2 de Liquid AI. El autor del ajuste es el usuario de HuggingFace lugman-madhiai y el modelo se publica bajo licencia Apache 2.0. Con 354.483.968 parametros reales (segun los pesos en safetensors), se trata de un modelo pequeno orientado a generacion de texto conversacional en ingles.

El nombre del repositorio revela la cadena de entrenamiento: un modelo LFM2.5 de 350M que primero paso por un proceso de GRPO (optimizacion de politica con recompensa, probablemente sobre entornos de SmolDataEnvs) hasta el paso 100, y despues por un ajuste fino supervisado (SFT) con datos autogenerados (SelfGen), usando LoRA con rango 16, alpha 32 y tasa de aprendizaje 1e-4. El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, lo que permite un entrenamiento aproximadamente 2 veces mas rapido.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado como experimento de investigacion sobre tecnicas de RL y SFT en modelos pequenos. No es un modelo pensado para produccion ni para uso general, sino una iteracion concreta dentro de una linea de experimentos del autor. La relevancia practica es limitada, pero resulta util como referencia para quienes estudian el efecto de GRPO seguido de SFT en modelos de menos de 500M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer, familia Liquid AI); detalles exactos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion via transformers/unsloth |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM2 (Liquid Foundation Models 2) de Liquid AI, que emplea una arquitectura de transformer con innovaciones propias de la familia, aunque la model card no detalla la configuracion exacta de capas, atencion o dimensiones ocultas. El tamano de 354M de parametros lo situa en la gama baja de la familia LFM2, orientada a inferencia eficiente en dispositivos con recursos limitados.

El proceso de entrenamiento documentado en el nombre del repositorio es el siguiente: partiendo de un modelo LFM2.5-350M, se aplico GRPO (Group Relative Policy Optimization) sobre entornos de SmolDataEnvs hasta el paso 100, y posteriormente un ajuste fino supervisado con datos autogenerados por el propio modelo (SelfGen). El SFT uso LoRA con rango 16, alpha 32 y learning rate 1e-4. La herramienta de entrenamiento fue Unsloth combinada con TRL. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation).
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste SFT.
- Entrenamiento orientado a entornos de agentes (SmolDataEnvs), lo que sugiere cierta capacidad para tareas de interaccion con entornos, aunque no se documenta explicitamente.
- Compatibilidad con text-generation-inference (TGI) y con transformers.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Experimentacion academica con GRPO y SFT: el modelo sirve como punto de comparacion para estudiar como afecta el RL con recompensa seguido de SFT en modelos de 350M, gracias a que el nombre del repo documenta hiperparametros concretos (r16, a32, lr1e-4, step100).
- Prototipado rapido de chatbots en ingles: su tamano reducido permite desplegarlo en una sola GPU consumer para pruebas de concepto de conversacion multi-turno, aunque sin garantias de calidad.
- Generacion de texto en entornos con recursos muy limitados: al tener 354M de parametros, cabe en GPUs de gama baja o incluso en CPU con cuantizacion, lo que lo hace adecuado para demos locales.
- Investigacion sobre datos autogenerados (SelfGen): permite reproducir o analizar el efecto de entrenar con datos generados por el propio modelo en tareas de instruccion.
- Evaluacion de toolchains de Unsloth y TRL: util como caso de prueba para pipelines de entrenamiento con LoRA en modelos pequenos.
- Fines educativos: ejemplo practico de como se nombra y publica un checkpoint intermedio de una cadena de entrenamiento RL + SFT en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7-0,8 GB solo para pesos (354M x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,4 GB; en 4 bits, en torno a 0,2 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- GPU de datacenter (A100, H100) no necesarias; sobredimensionadas para este modelo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp/Ollama si se genera un GGUF (no publicado en el repo), y vLLM para servir en lote.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4 | 354M | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| Modelo base LFM2.5-350M-SmolDataEnvs-GRPO2-step100 | ~350M | no disponible | no disponible | HuggingFace |
| Familia LFM2 de Liquid AI (350M) | ~350M | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo elevado de alucinacion y respuestas incoherentes por su tamano reducido (354M) y por el ajuste sobre datos autogenerados.
- No se documentan sesgos conocidos, pero al ser un modelo pequeno entrenado con datos no especificados, puede reproducir sesgos presentes en su corpus.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en conversaciones largas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de documentacion sobre el dataset de entrenamiento y sobre el modelo base original hace recomendable precaucion antes de usarlo en produccion.
- Es un checkpoint intermedio de una cadena de experimentos (step100, SFT posterior); no debe considerarse una version final o estable.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4
- Modelo base: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento de HuggingFace): https://github.com/huggingface/trl
