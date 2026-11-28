# micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4

## Resumen
`if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario micdun en Hugging Face. El modelo resultante conserva la arquitectura Qwen2 y los 1.543.714.304 parametros del modelo base, pero ha sido reentrenado sobre un conjunto de datos sinteticos generados por varios modelos "profesor" que aparecen nombrados en el identificador del run: GPT-OSS 20B, QwQ, DeepSeek Distill Llama 3 70B y el propio Qwen2.5-1.5B.

El objetivo declarado es cubrir tres dominios: seguimiento de instrucciones y conversacion, ciencia y codigo. Cada dominio se habria generado con el modelo profesor correspondiente, y el alumno de 1.5B se ha ajustado con esos datos para condensar capacidades de modelos mucho mayores en un tamano desplegable en hardware de consumo. La relevancia practica es la de la destilacion sintetica: obtener un modelo pequeno con comportamiento conversacional afinado, aunque sin garantias de retener el rendimiento de los profesores.

La informacion publicada es muy escasa: no hay model card detallada, no hay benchmarks, no se especifica licencia ni idiomas, y el repositorio no registra descargas ni interacciones. Se trata, por tanto, de un artefacto experimental de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible; al ser safetensors en transformers, admite cuantizacion a 8 y 4 bits mediante herramientas externas (bitsandbytes, GPTQ, AWQ), sin pesos pre-cuantizados publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tipo de ajuste | SFT completo (full fine-tune), 3 epocas, lr 1e-4, batch global 64 |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura Qwen2 del modelo base: transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU, embeddings de posicion rotatorios (RoPE) y atencion con query/key/value biases. Con 1,54 mil millones de parametros, es un modelo denso (no utiliza mezcla de expertos). No se documentan cambios estructurales respecto al modelo base.

El entrenamiento consistio en un ajuste fino supervisado completo durante 3 epocas con tasa de aprendizaje 1e-4 y batch global de 64, sobre una mezcla de datos sinteticos generada por los modelos profesor citados en el identificador del run (GPT-OSS 20B para instrucciones/chat, QwQ para ciencia, DeepSeek Distill Llama 3 70B para codigo, segun la convencion de nombres del autor). No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. La model card no aporta detalles sobre filtrado, deduplicacion o evaluacion de calidad de los datos sinteticos.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones del modelo base.
- Seguimiento de instrucciones (instruction following), presumiblemente reforzado por el dominio de chat del dataset sintetico.
- Razonamiento cientifico y respuesta a preguntas de dominio cientifico, segun el dominio declarado generado por QwQ.
- Generacion de codigo, segun el dominio declarado generado por DeepSeek Distill Llama 3 70B.
- Soporte de tool calling: no documentado para este ajuste concreto; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmacion de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo base tiene capacidades limitadas en este aspecto y no hay evidencia de que el ajuste las mejore.
- Capacidades multilingues: no documentadas; el modelo base Qwen2.5 es multilingue, pero no se especifica que idiomas conserva este ajuste.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Prototipado rapido de asistentes conversacionales: el modelo se puede cargar en una GPU de consumo y usarse para iterar sobre prompts y flujos de dialogo antes de pasar a un modelo mayor, gracias a su tamano de 1,54 B parametros.
- Generacion de codigo en entornos de desarrollo local: puede emplearse como autocompletado o generador de fragmentos en editores y scripts, dado el dominio de codigo incluido en el entrenamiento, aunque sin garantias de calidad en produccion.
- Respuesta a preguntas de divulgacion cientifica: util como base para un chatbot de consulta sobre temas cientificos en entornos educativos o de demostracion, con supervision humana por el riesgo de alucinacion.
- Destilacion y experimentacion academica: sirve como caso de estudio de SFT sobre datos sinteticos multi-profesor, para investigar como se transfieren capacidades de modelos grandes a uno pequeno.
- Evaluacion de pipelines de entrenamiento: al estar entrenado con trl y datos sinteticos, es un candidato para reproducir y comparar recetas de ajuste fino en laboratorios con recursos limitados.
- Despliegue en edge o entornos con VRAM reducida: con cuantizacion a 4 bits puede ejecutarse en GPUs de gama media o incluso en CPU, para demos y pruebas de integracion con transformers o TGI.
- Generacion de datos sinteticos adicionales: puede usarse como generador barato en pipelines de aumento de datos, siempre con filtrado posterior de calidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070); A100/H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas; con cuantizacion 4 bits puede ejecutarse en GPUs integradas o en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama tras conversion a GGUF, aunque no se publican pesos GGUF.
- Latencia y throughput: no disponibles; por tamano, se espera un throughput alto en GPUs de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (micdun) | 1,54 B | no disponible | no disponible | safetensors | SFT sobre datos sinteticos multi-profesor; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo base oficial, con benchmarks publicados y amplio soporte |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Version base sin ajuste de instrucciones |
| Modelos destilados de 1-2 B (familia Qwen2.5 destilados) | 1-2 B | variable | variable | safetensors, GGUF | Alternativas de destilacion con mayor documentacion y evaluacion publica |

La comparacion directa con el modelo base es la mas informativa: este ajuste parte de Qwen2.5-1.5B-Instruct y no documenta mejoras medibles, por lo que en ausencia de benchmarks no puede afirmarse que supere al base en ninguna tarea.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en chat, ciencia o codigo.
- Riesgo elevado de alucinacion: al ser un modelo de 1,54 B ajustado sobre datos sinteticos, la fidelidad factual no esta garantizada, especialmente en dominio cientifico.
- Datos sinteticos sin documentar: no se especifica el volumen, la composicion ni el filtrado del dataset, lo que impide evaluar sesgos heredados de los profesores.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base es Apache 2.0, pero el autor no declara la licencia del ajuste.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla de lo que herede del base.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, no se documenta si el ajuste preserve esa ventana.
- Tool calling y agentes no documentados: no se puede asumir que el ajuste conserve las capacidades de function calling del base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion; soporte practicamente inexistente.
- Nombre del repositorio muy largo y con caracteres especiales, lo que complica su uso en scripts y pipelines.

## Enlaces
- Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria TRL: https://github.com/huggingface/trl
- Libreria transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
