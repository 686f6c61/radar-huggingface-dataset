# Raghav-Singhal/1pp-1b-asst-sft

## Resumen

El modelo `1pp-1b-asst-sft` es un artefacto de investigacion del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Forma parte de un estudio sistematico 3×3 que combina tres tamanos de modelo (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. Este ejemplar concreto, de 0,98 mil millones de parametros, fue pretreinado sobre conversaciones reescritas a partir de dichos documentos, aplicando la funcion de perdida unicamente a los turnos de asistente, y posteriormente ajustado mediante supervisión (SFT) sobre una mezcla de 400 000 conversaciones.

La relevancia de este modelo reside en que investiga como el formato de los datos de pretraining y la mascara de perdida influyen en el comportamiento final del modelo, una cuestion poco explorada en la literatura. Su arquitectura es un decoder estilo Llama con 24 capas, dimension oculta de 1536 y una ventana de contexto de 4096 tokens. No se trata de un asistente de proposito general, sino de una pieza experimental para estudiar los efectos de la condicion "one persona" en la generacion de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama: 24 capas, hidden 1536, FFN 6144 (SwiGLU), 12 cabezas de atencion / 4 KV heads (dim 128), RMSNorm, RoPE base 10000, embeddings no atados, sin sesgos, sin QK-norm |
| Parametros totales | 981 545 472 (0,98B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican cuantizaciones GGUF u otras) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder autoregresiva clasica tipo Llama, con normalizacion RMSNorm, atencion por ventanas con RoPE y FFN SwiGLU. El tokenizador es el vocabulario de SmolLM2 (49 152 tokens) ampliado con el token especial `<|pad|>`, y `<|endoftext|>` marca el fin de documento. La longitud de secuencia esta fijada en 4096 tokens.

El pretraining se realizo sobre 47,8 millones de documentos reescritos como conversaciones (63 000 millones de tokens en formato conversacional, frente a 66 200 millones en los documentos originales), con una unica pasada y un total de 31 777 pasos con batch global de 512 × 4096 tokens. La perdida se calculo exclusivamente sobre los turnos de asistente, ignorando los turnos de usuario y el token de fin de documento. Se empleo el optimizador Muon (con tasa de aprendizaje matricial 0,005) combinado con Adam para embeddings y normas, warmup de 2000 pasos, decaimiento lineal en el ultimo 10 % hasta 1/100 y weight decay 0,1, todo en precision bf16.

Posteriormente, el modelo fue sometido a una epoca de SFT sobre una mezcla de 400 000 conversaciones que incluye datos multi-turno con citas constitucionales, datos normales y una muestra de seguridad. El SFT mantuvo la misma infraestructura (Megatron, Muon, ChatML sin turno de sistema) y la perdida solo en turnos de asistente, con una tasa de aprendizaje matricial de 0,002 seleccionada por validacion. La perdida final en el conjunto de retencion fue de 1,935.

## Capacidades

- Generacion de texto conversacional en ingles siguiendo el formato ChatML sin turno de sistema.
- Responde a instrucciones de usuario en conversaciones multi-turno, con detencion de generacion en el token `<|im_end|>`.
- Capacidad de razonamiento basico limitada por su tamano (0,98B) y su naturaleza experimental.
- No se documenta soporte para tool calling, funciones, vision, audio ni modos de pensamiento extendido.
- Unicamente opera en ingles; no se reportan capacidades multilingues.
- Al ser un artefacto de investigacion, su comportamiento no esta optimizado para tareas generales ni para produccion.

## Casos de uso

- Investigacion academica sobre tecnicas de pretraining: permite estudiar como la reescritura de documentos en conversaciones y la perdida selectiva en turnos de asistente afectan a la calidad de la generacion, comparando con los otros modelos de la coleccion 1PP.
- Analisis de sesgos y comportamientos emergentes en modelos pequenos: al ser de solo 0,98B, es adecuado para experimentos controlados de interpretabilidad y evaluacion de alineacion sin requerir recursos masivos.
- Generacion de datos sinteticos de conversacion en ingles para fine-tuning de otros modelos: su formato ChatML y su entrenamiento especifico lo hacen util para producir dialogos de entrenamiento, aunque con supervisión humana para evitar errores.
- Evaluacion de la influencia de la mascara de perdida en la coherencia conversacional: comparando con los modelos entrenados con perdida en todos los turnos, se puede aislar el efecto de la condicion "asistente".
- Fine-tuning adicional para tareas especificas de dialogo: al ser un modelo base ajustado, puede servir como punto de partida para tareas de dominio con pocos datos, siempre que se respete el formato ChatML sin sistema.
- Pruebas de infraestructura de despliegue: su tamano reducido y su compatibilidad con text-generation-inference lo convierten en un candidato para validar pipelines de inferencia en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta perdidas de validacion, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion en texto de asistente (pretraining, 2433 documentos retenidos) | 1,507 |
| Perdida de validacion en texto de usuario (pretraining) | 6,746 |
| Perdida de validacion en texto de documento (pretraining) | 3,274 |
| Perdida SFT en tokens de asistente (1998 conversaciones retenidas) | 1,935 |
| Verificacion HF vs Megatron (perdida SFT, segmentos 3-4) | 1,9354 (diferencia absoluta 0,0000) |

Estos valores no son comparables con benchmarks publicos y solo sirven para verificar la correcta conversion de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,0 GB (981M parametros × 2 bytes), mas overhead de activaciones y cache KV, por lo que se recomienda al menos 3-4 GB de VRAM para una sesion con contexto completo de 4096 tokens.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, RTX 4060, o superiores. Tambien es viable en Apple Silicon con Metal.
- Cabe en GPUs consumer de gama baja; no requiere hardware de datacenter.
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, text-generation-inference (TGI) segun los tags del repositorio, y potencialmente llama.cpp si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de ~1B, se espera una velocidad de decodificacion de 20-50 tokens/s en una GPU consumer moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamano similar. El modelo pertenece a la coleccion 1PP, que incluye variantes de 0,5B y 1,7B con diferentes condiciones de pretraining, pero no se proporcionan resultados comparativos en la model card. Como referencia arquitectonica, comparte tokenizador con SmolLM2-1B, pero no hay datos de rendimiento que permitan una comparacion cuantitativa. Por tanto, la comparativa se limita a indicar que es un modelo experimental sin equivalencias directas en el mercado.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de proposito general; su uso en produccion no esta recomendado sin una evaluacion exhaustiva.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- La ventana de contexto es de 4096 tokens, lo que limita conversaciones muy largas o documentos extensos.
- El formato ChatML no incluye turno de sistema; anadir un mensaje de sistema puede degradar el comportamiento, ya que el modelo nunca lo vio durante el entrenamiento.
- Riesgo de alucinacion y de respuestas incoherentes en temas fuera de su distribucion de datos, comun en modelos de este tamano.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus general de documentos, puede heredar sesgos presentes en los datos originales.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental, no se ofrecen garantias de calidad ni de seguridad.
- No se incluyen pesos cuantizados ni instrucciones de despliegue optimizado; el repositorio solo contiene safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-asst-sft
- Coleccion 1PP en HuggingFace: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, pretraining): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
