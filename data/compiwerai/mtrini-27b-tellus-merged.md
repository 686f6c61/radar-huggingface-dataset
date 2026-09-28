# CompiwerAI/Mtrini-27B-Tellus-Merged

## Resumen

Mtrini-27B-Tellus-Merged es un modelo de lenguaje causal de aproximadamente 27.000 millones de parametros publicado por CompiwerAI, un grupo de investigacion independiente con sede en Marruecos. Se trata de un modelo fusionado (merged): un adaptador LoRA entrenado por CompiwerAI se ha integrado en un modelo base compatible de la familia Qwen, dando como resultado un checkpoint autonomo listo para inferencia con Transformers, sin necesidad de cargar el adaptador por separado.

El objetivo declarado del proyecto es cubrir tres frentes poco habituales en un mismo modelo: generacion de codigo, razonamiento matematico y conversacion en arabe marroqui (dariya) junto a arabe estandar. Para ello, el ajuste se realizo con QLoRA/LoRA sobre una mezcla de 11.200 ejemplos que combina OpenCodeInstruct (35%), OpenR1-Math (25%), dariya marroqui (20%), Magicoder (10%) y Aya Arabic (10%).

Su relevancia practica es doble. Por un lado, es uno de los pocos modelos abiertos que declara soporte explicito de dariya, un dialecto con escasa representacion en los corpus publicos. Por otro, se distribuye bajo licencia Apache 2.0 y con un repositorio GGUF paralelo, lo que facilita su despliegue local. El principal caveat es la ventana de contexto, limitada a 4.096 tokens, y la ausencia total de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only; los tags del repositorio indican qwen3_5_text (base declarada: Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No disponible (la model card no indica que sea un modelo MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | BF16 en el repositorio principal (compute dtype declarado); existe un repositorio GGUF hermano con cuantizaciones cuyo detalle no se especifica |
| Idiomas soportados | No disponible como listado oficial. La mezcla de entrenamiento cubre ingles (datasets de codigo y matematicas), arabe estandar (Aya Arabic) y arabe marroqui / dariya |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (53,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de ~27B parametros, heredado del modelo base declarado Qwen3.8-27B. No se trata de un entrenamiento desde cero ni de una arquitectura nueva: el proceso ha consistido en un ajuste QLoRA/LoRA con rango 32 y alpha 64, tasa de aprendizaje 0,00015, dtype de computo BF16, 700 pasos y una unica epoca sobre 11.200 ejemplos. El adaptador resultante se fusiono despues en los pesos del modelo base, por lo que el repositorio distribuido es un checkpoint completo y no un PEFT adapter.

La mezcla de datos es deliberadamente mixta: OpenCodeInstruct aporta el 35% (instrucciones de codigo), OpenR1-Math el 25% (razonamiento matematico con trazas), dariya marroqui el 20%, Magicoder el 10% (sintesis de instrucciones de programacion) y Aya Arabic / arabe marroqui el 10%. No se documenta ninguna fase de RLHF o DPO posterior, ni tecnicas de decodificacion especulativa, atencion lineal o hibridacion SSM. La perdida final reportada por el autor es 0,4302 en una epoca, con un tiempo de ejecucion aproximado de 3,15 horas sobre una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition. Es un presupuesto de entrenamiento muy reducido para un modelo de este tamano, lo que condiciona su comportamiento final.

## Capacidades

- Generacion de texto conversacional multi-turno con estilo instructivo.
- Generacion y completado de codigo, con enfasis en instrucciones de programacion derivadas de OpenCodeInstruct y Magicoder.
- Razonamiento matematico basico y resolución de problemas tipo competicion, procedente de OpenR1-Math.
- Comprension y generacion en arabe marroqui (dariya), una variedad dialectal con poca cobertura en modelos abiertos.
- Comprension y generacion en arabe estandar moderno, a partir del subconjunto Aya Arabic.
- Traduccion y code-switching entre dariya, arabe estandar e ingles, dentro de los limites de la mezcla de entrenamiento.
- Soporte de tool calling / function calling: no disponible, no se documenta plantilla de herramientas ni formato de llamadas.
- Modo de razonamiento explicito (thinking mode): no disponible, no se documenta.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente text-generation.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; la ventana de 4.096 tokens limita cadenas de razonamiento largas.

## Casos de uso

- Asistente conversacional en dariya para servicios publicos o atencion al cliente en Marruecos: es uno de los pocos modelos abiertos con entrenamiento declarado en esta variedad dialectal, lo que permite construir interfaces en la lengua real de los usuarios en lugar de forzar arabe estandar.
- Traduccion asistida dariya-arabe estandar-ingles: util en flujos de documentacion interna donde el personal escribe en dialecto y el material final debe publicarse en arabe formal o ingles.
- Generacion de codigo en entornos con restricciones de soberania de datos: al ser Apache 2.0 y desplegable on-premise, encaja en organizaciones que no pueden enviar codigo propietario a APIs externas.
- Autocompletado y revision de codigo en editores locales: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que lo hace viable como asistente de programacion totalmente local.
- Apoyo educativo en matematicas: puede resolver y explicar ejercicios de nivel secundario y primeros cursos universitarios, aunque sin las garantias de un sistema verificado.
- Generacion de documentacion tecnica bilingue (arabe/ingles) a partir de fragmentos de codigo, aprovechando la exposicion dual del entrenamiento.
- Prototipado rapido de chatbots dialectales para investigacion en PLN arabe, dado que la licencia permisiva permite experimentar sin fricciones legales.
- Fine-tuning posterior como base: al ser un modelo fusionado y Apache 2.0, sirve como punto de partida para adaptaciones adicionales en dominios especificos del mundo arabofono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ni ninguna otra metrica estandar, y la busqueda web no ha localizado evaluaciones independientes del modelo. El unico dato cuantitativo reportado por el autor es la perdida final de entrenamiento (0,4302) y el tiempo de computo (3,15 horas), que no son comparables con benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 54 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda reservar 60-70 GB.
- VRAM estimada en cuantizacion de 8 bits: del orden de 27-30 GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 14-16 GB, con margen para cache KV gracias a la ventana corta de 4.096 tokens.
- GPU de datacenter: una sola A100 80 GB, H100 80 GB o la RTX PRO 6000 Blackwell usada en el entrenamiento es suficiente para inferencia en BF16.
- GPU profesionales de gama media: 2 x A6000 48 GB o 2 x L40S 48 GB permiten BF16 con reparto de capas; una sola A6000 48 GB obliga a cuantizar.
- GPU de consumo: con cuantizacion de 4 bits entra en RTX 4090, RTX 5090 o RTX 3090 de 24 GB. En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) es muy ajustado y puede requerir descarga parcial a CPU.
- Opciones de despliegue: Transformers con device_map="auto" (soporte oficial), PEFT para el repositorio de adaptador, llama.cpp u Ollama a traves del repositorio GGUF, y potencialmente vLLM o TGI para servir con pesos safetensors en BF16 sobre GPU de datacenter.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mtrini-27B-Tellus-Merged | ~26,9 B | 4.096 tokens | Apache 2.0 | Ajuste LoRA de una epoca; dariya y arabe; sin benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Mismo ecosistema Qwen; contexto 8 veces mayor; benchmarks publicados |
| Gemma 3 27B | 27 B | 128.000 tokens | Licencia Gemma (con restricciones de uso) | Multimodal, contexto muy superior; licencia no tan permisiva |
| Mistral Small 3 24B | 24 B | 32.000 tokens | Apache 2.0 | Alternativa densa europea con contexto amplio y benchmarks publicados |

La comparacion debe tomarse con cautela: los datos de contexto y licencia de los modelos alternativos son publicos y verificables, pero no existen resultados de benchmarks del modelo de CompiwerAI que permitan situarlo en capacidad real frente a ellos. La ventaja diferencial del modelo evaluado es la cobertura de dariya y su coste de inferencia mas bajo por la ventana corta; la desventaja es un contexto ocho a treinta veces menor y ausencia total de validacion externa.

## Limitaciones y advertencias

- Ventana de contexto muy limitada: 4.096 tokens. No es adecuado para analisis de documentos largos, resumen de repositorios completos ni conversaciones extensas sin truncado.
- Entrenamiento de una sola epoca sobre 11.200 ejemplos: presupuesto muy pequeno para un modelo de 27B, con riesgo alto de sobreajuste en los estilos concretos de los datasets y de olvido catastrofico de capacidades del modelo base.
- Ausencia total de benchmarks: no hay evidencia publica de que el ajuste mejore al modelo base en codigo, matematicas o arabe. Cualquier afirmacion de rendimiento en produccion deberia validarse internamente.
- Riesgo de alucinacion: no se documenta ninguna tecnica de mitigacion (RLHF, DPO, verificacion factual). En dominios especializados el riesgo es alto, especialmente en matematicas, donde un ajuste breve puede degradar la verificacion.
- Sesgos: la mezcla de datos esta dominada por datasets de codigo en ingles y por corpus arabes de procedencia no auditada; no se documenta ninguna evaluacion de sesgo.
- Cobertura idiomatica irregular: el modelo declara dariya y arabe, pero tambien hereda el comportamiento multilingue del base Qwen, sin que se haya medido el efecto del ajuste sobre otras lenguas, incluido el castellano.
- Licencia: el repositorio se publica como Apache 2.0, lo que permite uso comercial. Conviene revisar, no obstante, las licencias de los datasets de entrenamiento (OpenCodeInstruct, Magicoder, OpenR1-Math, Aya) y los terminos del modelo base declarado, ya que la model card no detalla la procedencia exacta de los pesos base.
- Trazabilidad: el modelo declara como base "Qwen3.8-27B", una denominacion que no corresponde a ninguna version publica conocida de Qwen, mientras que los tags de arquitectura apuntan a qwen3_5_text. Esta ambiguedad dificulta reproducir el entrenamiento y auditar la licencia heredada.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la ficha, autor sin historial de modelos ampliamente validados y sin documentacion de evaluacion. Se recomienda tratarlo como modelo experimental.
- Sin soporte documentado de tool calling ni de modo de razonamiento: si el pipeline necesita function calling, habra que implementarlo y validarlo por cuenta propia.

## Enlaces

- Modelo fusionado en Hugging Face: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-Merged
- Repositorio del adaptador LoRA original: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus
- Repositorio GGUF: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-GGUF
- Organizacion en GitHub: https://github.com/compiwerai
- Repositorios publicos en GitHub: https://github.com/compiwerai?tab=repositories
- Agregador de benchmarks y leaderboard consultado: https://benchlm.ai/
