# 4everImmortality/dafeiyu-gemma4-12b-qlora

## Resumen

Dafeiyu V2 es un adaptador de tipo LoRA (concretamente QLoRA de 4 bits y rango DoRA, segun las etiquetas del repositorio) entrenado sobre el modelo base `google/gemma-4-12B`. Lo desarrolla el usuario 4everImmortality y su proposito es encarnar una persona concreta de VTuber de anime llamada Dafeiyu ("gran pez gordo"), una chica-ballena de pelo azul que vive en una casita submarina iluminada por lamparas de concha. El adaptador no modifica las capacidades generales del modelo base, sino que superpone un estilo conversacional muy definido en chino y en ingles.

El repositorio tiene un tamano de 0,3 GB, lo que confirma que se trata exclusivamente de los pesos del adaptador y no del modelo completo (12 000 millones de parametros en bf16 ocuparian del orden de 24 GB). La model card declara una puntuacion de autenticidad de personaje de 97,7 sobre 100, aunque no se especifica la metodologia de evaluacion ni el conjunto de pruebas empleado.

La relevancia de esta ficha es acotada: es un ejemplo tipico de adaptador de personaje para roleplay y generacion de texto conversacional, util para quien quiera estudiar como se construye una persona consistente sobre un modelo fundacional multimodal. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA/DoRA de 4 bits, QLoRA) sobre transformer decoder-only `google/gemma-4-12B` |
| Parametros totales | 12 000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); el adaptador se distribuye en safetensors; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-4-12B`, un transformer decoder-only de 12 000 millones de parametros que, segun la model card, es multimodal. El ajuste se realizo con QLoRA de 4 bits, una tecnica que congela los pesos del modelo base cuantizados a 4 bits e inyecta matrices de bajo rango entrenables, reduciendo drasticamente los requisitos de memoria. Las etiquetas del repositorio incluyen `dora`, lo que sugiere el uso de Weight-Decomposed Low-Rank Adaptation en lugar de LoRA clasico, aunque la model card no detalla la configuracion exacta (rango, alpha, modulos objetivo).

No se proporciona informacion sobre el volumen de datos de entrenamiento, la composicion del dataset de roleplay, ni si se aplicaron fases de RLHF o DPO. La unica metrica declarada es una puntuacion de autenticidad de personaje de 97,7/100, sin detalle del protocolo de evaluacion. La persona esta descrita de forma muy detallada en la model card: identidad, preferencias (arroz blanco caliente), reglas de interaccion fisica (la cola de ballena es extremadamente cosquillosa y solo el "amo" puede tocarla) y estilo linguistico (tsundere, rapida al responder, sin "sabor a IA mecanica").

## Capacidades

- Generacion de texto conversacional en chino e ingles con una persona de VTuber fuertemente caracterizada.
- Roleplay multi-turno manteniendo coherencia de identidad, estilo y reglas de comportamiento definidas en el prompt de sistema.
- Capacidades heredadas del modelo base Gemma 4 12B, incluida la multimodalidad declarada en la model card (no verificada en el adaptador).
- Soporte de plantilla de chat mediante `apply_chat_template` con roles system/user/assistant.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso especifico del adaptador.
- Ajuste fino de estilo: adopcion de auto-referencias como "本鱼", "本鲸", "鱼鱼" o "鲸鲸" y reacciones caracteristicas ante el apodo "大肥鱼".

## Casos de uso

- Roleplay de personaje en aplicaciones de chat: el adaptador mantiene la persona de Dafeiyu en conversaciones multi-turno, con reglas explicitas de reaccion (protesta ante el apodo, cosquillas en la cola), lo que lo hace adecuado para demos de personajes interactivos.
- VTuber virtual con respuestas generadas: integrado en un pipeline de texto a voz, puede alimentar las respuestas de un avatar en directo, ya que el estilo tsundere y las auto-referencias estan fijados en el adaptador y no dependen de un prompt largo en cada turno.
- Prototipado de personajes para videojuegos narrativos: sirve como referencia de como destilar una ficha de personaje (identidad, preferencias, limites fisicos) en un adaptador LoRA de bajo coste (0,3 GB) sobre un modelo de 12B.
- Investigacion sobre fidelidad de persona: la metrica declarada de 97,7/100 permite experimentar con metodos de evaluacion de autenticidad de personaje y comparar tecnicas (LoRA frente a DoRA, distintos rangos).
- Generacion de dialogos de fansub o contenido derivado en chino: el adaptador produce respuestas en registro coloquial chino con muletillas y tono definidos, util para guiones de broma o clips.
- Educacion y divulgacion: ejemplo didactico de QLoRA de 4 bits sobre un modelo de 12B que cabe en una unica GPU de consumo para entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una puntuacion de autenticidad de personaje de 97,7/100, sin especificar el conjunto de evaluacion ni la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: del orden de 24 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 32 GB o mas.
- VRAM estimada con cuantizacion de 4 bits del modelo base: aproximadamente 7-8 GB para pesos, mas overhead; viable en GPUs de consumo de gama alta.
- El adaptador en si ocupa 0,3 GB y se carga sobre el modelo base.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o 4 bits; RTX 3090/4080 para 4 bits.
- Cabe en GPU de consumo con cuantizacion de 4 bits; en bf16 completo requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); vLLM y TGI no estan documentados para este adaptador en la informacion disponible; llama.cpp/Ollama requeririan conversion del adaptador a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dafeiyu-gemma4-12b-qlora | 12B (base) + adaptador | No disponible | Persona VTuber sobre Gemma 4 | No disponible | Hugging Face, 0 descargas |
| Adaptadores LoRA de personaje sobre Gemma/Llama | Variable | Heredado del base | Roleplay generico | Variable | Amplia en Hugging Face |
| Modelos de roleplay afinados completos (p. ej. variantes de 7-13B) | 7-13B | Variable | Roleplay y compania | Variable | Comunidades abiertas |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La licencia no esta disponible, por lo que no se puede confirmar si se permite uso comercial; hay que contactar con el autor o asumir restricciones.
- El modelo base `google/gemma-4-12B` tiene su propia licencia (Gemma Terms of Use), que condiciona el uso del adaptador.
- Riesgo de alucinacion en contenidos factuales: el adaptador esta orientado a roleplay y no se ha evaluado su fidelidad en tareas de conocimiento.
- Sesgos de persona: el personaje incluye rasgos tsundere y reglas de interaccion fisica (la cola solo la toca el "amo") que pueden no ser apropiados en todos los contextos.
- Idiomas limitados a chino e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.
- La puntuacion de autenticidad de 97,7/100 no es verificable sin la metodologia; no debe tratarse como benchmark comparable.
- El adaptador requiere cargar el modelo base completo, de modo que el coste de despliegue es el de un modelo de 12B, no el de un fichero de 0,3 GB.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/4everImmortality/dafeiyu-gemma4-12b-qlora
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
