# isaacy13/gemma-4-E2B-it-guideai-litert-lm

## Resumen

Gemma 4 E2B es el modelo mas pequeno de la familia Gemma 4 de Google, con aproximadamente 2.100 millones de parametros y una ventana de contexto de 8K tokens. Esta pensado para inferencia en dispositivo (edge), incluidos telefonos moviles y sistemas embebidos, y puede ejecutarse enteramente en CPU. La variante aqui descrita, `isaacy13/gemma-4-E2B-it-guideai-litert-lm`, es un fine-tune del checkpoint oficial en formato LiteRT-LM (`litert-community/gemma-4-E2B-it-litert-lm`) realizado por GuideAI para su aplicacion de viajes.

El cambio respecto al modelo base es deliberadamente minimo: se han modificado los pesos enteros de ocho neuronas MLP de la capa 29, sin entrenamiento adicional. El objetivo es corregir el enrutado de mensajes en el asistente de GuideAI, de modo que las preguntas sobre los viajes del propio usuario ("que dia es el Louvre en mi viaje a Paris?") se dirijan al topico que puede leer el itinerario en lugar de al chat general. Todo lo demas (resto de pesos, codificadores de vision y audio, tokenizer, plantilla de chat y metadatos) es identico byte a byte al original de Google.

El interes de esta ficha es doble: por un lado documenta el modelo base Gemma 4 E2B y sus caracteristicas tecnicas; por otro, ilustra un caso practico de edicion quirurgica de pesos para ajustar el comportamiento de enrutado de un modelo en produccion sin reentrenar y sin alterar el consumo de memoria ni la latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); multimodal con codificadores de vision y audio segun la model card del autor |
| Parametros totales | ~2.100 millones (2,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (8K) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es un fichero `.litertlm` de 2.588.147.712 bytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma 4 en su variante E2B, la de menor tamano de la gama (que incluye E2B, E4B, 12B, 26B A4B y 31B). Segun la documentacion de Gemma 4, se trata de un modelo multimodal con codificadores de vision y audio, aunque la model card del fine-tune no detalla la composicion del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO. La model card del autor confirma que el tokenizer, la plantilla de chat y los metadatos del checkpoint son los de Google sin cambios.

La intervencion de GuideAI no es un fine-tune convencional: no hay entrenamiento ni descenso de gradiente. Se modifican los pesos enteros de ocho neuronas de la capa 29 del MLP, un ajuste localizado que altera la clasificacion de topicos del asistente. El resto del modelo permanece byte a byte igual al original, lo que se documenta con los hashes SHA-256 del fichero modificado (`f6c5fdfb...`) y del original (`18193810...`). El autor indica que el consumo de memoria y la latencia por turno en iPhone son identicos a los del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional en el rango propio de un modelo de 2,1 B parametros.
- Procesamiento multimodal: la model card menciona codificadores de vision y audio heredados del base, aunque no se detalla su rendimiento.
- Enrutado de topicos en el asistente de GuideAI: clasificacion de mensajes hacia el topico adecuado (chat general frente a lectura del itinerario del viaje).
- Ejecucion en dispositivo: disenado para inferencia local en movil (iPhone con GPU) y CPU, sin dependencia de servidor.
- Respuesta a preguntas sobre datos del usuario dentro del contexto de la aplicacion (por ejemplo, consultas sobre un itinerario de viaje).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de viajes en aplicacion movil: el modelo enruta cada mensaje del usuario al topico correcto y responde consultas sobre el itinerario ("que dia es el Louvre en mi viaje a Paris?") leyendo los datos del viaje en lugar de tratarlas como chat general.
- Clasificacion de intenciones en produccion: el ajuste de ocho neuronas en la capa 29 demuestra que es viable corregir el enrutado de un modelo pequeno sin reentrenar, reduciendo el coste frente a un fine-tune completo.
- Inferencia en dispositivo sin conectividad: al ejecutarse en CPU o GPU de movil via LiteRT-LM, permite funcionalidad offline en aplicaciones de campo, turismo o asistentes personales.
- Prototipado de asistentes de bajo coste: con 2,1 B parametros y un artefacto de 2,6 GB, es adecuado para iterar rapidamente en entornos con recursos limitados.
- Evaluacion de escenarios controlados: la metodologia de GuideAI (conjuntos held-out y sealed, ejecutados en Mac e iPhone) sirve como plantilla para validar cambios quirurgicos en modelos antes de desplegarlos.
- Sistemas embebidos y kioscos interactivos: el modelo puede integrarse en dispositivos con poca memoria y sin GPU dedicada, siempre que se acepte el contexto de 8K.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a las evaluaciones de escenarios de GuideAI, no a benchmarks academicos estandar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Escenarios superados | Base E2B | Este fichero |
|---|---|---|
| Held-out set (210, Mac) | 181 | 187 |
| Sealed fresh held-out set (67, Mac) | 53 | 54 |
| Held-out set (210, iPhone GPU) | 182 | 186 |
| Non-held-out set (225, iPhone GPU) | 192 | 192 |

## Requisitos de hardware

- Tamano del artefacto: 2.588.147.712 bytes (~2,6 GB) en formato `.litertlm`.
- VRAM/RAM estimada: no disponible de forma explicita; el autor indica que el uso de memoria en iPhone es identico al del modelo base.
- Ejecucion en CPU: el modelo base E2B esta disenado para correr enteramente en CPU.
- GPU de movil: validado en iPhone con GPU (se reportan latencias equivalentes al base, sin cifras concretas).
- GPU de escritorio y servidor (A100, H100, RTX 4090): no disponible en la informacion proporcionada.
- Despliegue: LiteRT-LM (https://ai.google.dev/edge/litert-lm/overview). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; solo se afirma que son iguales a los del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B (base, `litert-community/gemma-4-E2B-it-litert-lm`) | ~2,1 B | 8K | Apache 2.0 | LiteRT-LM | Referencia oficial; este fichero es una edicion de pesos |
| Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | Variante superior de la familia Gemma 4; sin datos en la informacion disponible |
| Gemma 4 12B / 26B A4B / 31B | no disponible | no disponible | no disponible | no disponible | Variantes mayores de la familia; sin datos en la informacion disponible |

No se dispone de datos de rendimiento comparativo con modelos de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste esta validado unicamente con los prompts y escenarios de GuideAI; fuera de ellos, el autor advierte que no se ha evaluado y se debe esperar el comportamiento del modelo base.
- Es un fichero modificado: no es un checkpoint oficial de Google y no debe presentarse como tal.
- Riesgo de alucinacion inherente a un modelo de 2,1 B parametros; no se han publicado evaluaciones de fidelidad fuera del conjunto de escenarios.
- Contexto limitado a 8K tokens, insuficiente para conversaciones o documentos muy largos.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar el aviso de modificacion (`NOTICE`) y las limitaciones de uso previstas en la model card original.
- No se detallan los tipos de cuantizacion disponibles ni el soporte en GPUs de servidor, lo que limita la planificacion de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isaacy13/gemma-4-E2B-it-guideai-litert-lm
- Modelo base en LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- Vision general de Gemma 4: https://gemma.ai/models/gemma-4/
- Ficha de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
