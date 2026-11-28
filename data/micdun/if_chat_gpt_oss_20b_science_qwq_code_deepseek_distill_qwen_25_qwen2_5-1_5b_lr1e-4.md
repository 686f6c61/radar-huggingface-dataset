# micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4

## Resumen

`if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre datos sinteticos generados por modelos "profesor" (GPT-OSS 20B, QwQ, DeepSeek y Qwen 2.5) en tres dominios: seguimiento de instrucciones y chat, ciencia, y codigo. El identificador del run codifica tanto los modelos generadores como los hiperparametros empleados (learning rate 1e-4).

Se trata de un modelo denso de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), con la misma arquitectura Qwen2 que su base, por lo que hereda el tokenizador y el formato de chat de Qwen2.5. El objetivo declarado es destilar capacidades de modelos de mayor tamano en un modelo pequeno y desplegable en hardware modesto, mediante datos sinteticos multi-dominio.

El modelo es relevante como ejemplo de pipeline de destilacion sintetica con TRL y como caso de estudio de los riesgos de este tipo de ajustes: el repo tiene 0 descargas y 0 likes, la licencia no esta declarada y la model card es minima. No se han publicado resultados de evaluacion, por lo que su rendimiento real frente al modelo base es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible; al estar en safetensors en fp/bf16 es cuantizable con herramientas estandar (GGUF, AWQ, GPTQ), aunque no se han publicado variantes |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal, RoPE, normalizacion RMSNorm y capas MLP con activacion SwiGLU. No hay innovaciones arquitectonicas propias; el ajuste no modifica la topologia, solo los pesos.

El entrenamiento consistio en un ajuste fino completo (full fine-tune, no LoRA) durante 3 epocas, con learning rate 1e-4 y batch global de 64, usando TRL. Los datos son sinteticos y se organizan en una mezcla multi-dominio: seguimiento de instrucciones/chat, ciencia y codigo, cada dominio generado por el modelo profesor indicado en el run id (GPT-OSS 20B para chat e instrucciones, QwQ para ciencia, DeepSeek para codigo y Qwen 2.5 como generador adicional). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; la model card solo menciona SFT.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del formato de chat de Qwen2.5.
- Seguimiento de instrucciones, reforzado mediante datos sinteticos de tipo IF/chat.
- Razonamiento cientifico y respuesta a preguntas de ciencia, destilado de QwQ.
- Generacion de codigo, destilado de DeepSeek.
- Razonamiento de varios pasos en la medida en que lo permita un modelo de 1,5 B; no se documenta un modo "thinking" explicito.
- Soporte de tool calling / function calling: no documentado en la model card; el base Qwen2.5-Instruct lo soporta, pero no se confirma que se haya preservado tras el ajuste.
- Capacidades multilingues: no documentadas; dependen del base, pero no hay evaluacion.
- Vision y audio: no soportados.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno con el formato de chat de Qwen2.5 y ejecutarse en una unica GPU consumer, lo que permite iterar sobre prompts sin infraestructura dedicada.
- Generacion de codigo en entornos con recursos limitados: al estar destilado de DeepSeek, es adecuado para autocompletado o generacion de fragmentos en IDE y scripts, siempre con revision humana dado el tamano del modelo.
- Resolucion de dudas cientificas de nivel introductorio: util en herramientas educativas o chatbots de divulgacion, con la advertencia de que un modelo de 1,5 B alucina con facilidad en dominios tecnicos.
- Clasificacion y extraccion de informacion con formato: el ajuste de instrucciones permite tareas de etiquetado, resumen y transformacion de texto en pipelines de datos.
- Base para experimentos de destilacion: sirve como punto de partida reproducible para comparar mezclas de datos sinteticos y estrategias de SFT con TRL.
- Despliegue en edge o en CPU: con cuantizacion a 4 bits cabe en menos de 1 GB de RAM/VRAM, lo que permite inferencia local en portatiles o dispositivos con poca memoria.
- Evaluacion de riesgos de datos sinteticos: caso de estudio para medir como afecta la destilacion multi-profesor a la calidad y a los sesgos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-5 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6-2 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 0,8-1,2 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas en precision completa (RTX 3060, RTX 4060, RTX 4090, A10, L4); en 4 bits funciona en GPUs integradas y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas con al menos 6 GB, y en muchas integradas con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo), vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama tras conversion a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (micdun) | 1,54 B | no disponible | no disponible | Hugging Face, 0 descargas | SFT sobre datos sinteticos multi-profesor; sin evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Modelo base; soporte oficial, tool calling y evaluaciones publicadas |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Version no instruida del mismo backbone |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (ampliable) | Apache 2.0 | Ampliamente disponible | Alternativa pequena de Hugging Face con evaluaciones publicadas |

La comparacion directa de rendimiento no es posible porque este ajuste no publica metricas. Frente al base Qwen2.5-1.5B-Instruct, la unica diferencia documentada es el corpus de SFT sintetico y los hiperparametros; no hay evidencia de mejora ni de degradacion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el base, ni analisis de regresion, por lo que no se puede afirmar que el ajuste mejore al modelo original.
- Licencia no declarada: no se especifica si se permite uso comercial; al derivar de Qwen2.5-1.5B-Instruct (Apache 2.0), la licencia del base aplica, pero la del ajuste no esta explicitada.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el multilingueismo del base.
- Riesgo de colapso por datos sinteticos: entrenar sobre salidas de otros modelos puede amplificar sesgos y errores de los profesores, y reducir la diversidad de respuestas.
- Alucinacion: con 1,5 B de parametros, la probabilidad de fabricar hechos, citas o APIs inexistentes es alta, especialmente en ciencia y codigo.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, no se garantiza que el ajuste preserve esa ventana.
- Tool calling no verificado: el tag `endpoints_compatible` no implica soporte funcional de function calling tras el SFT.
- Repo sin mantenimiento aparente: 0 descargas, 0 likes y model card minima; no hay garantias de soporte ni de reproducibilidad del dataset.
- Uso en produccion desaconsejado sin evaluacion previa en el dominio objetivo y sin comparacion contra el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL: https://huggingface.co/docs/trl
- Libreria transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
