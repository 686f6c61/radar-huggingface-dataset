# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run1-eb32-e3-lr2e-04-checkpoint939

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario `nmuendler` bajo el identificador `DeepSeek-R1-Distill-Qwen-7B-text-sft-run1-eb32-e3-lr2e-04-checkpoint939`. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, que a su vez es un derivado de Qwen2.5-Math-7B destilado con datos de razonamiento de DeepSeek-R1. El repositorio pesa 0,3 GB, lo que es coherente con pesos de adaptador y no con un modelo completo en precisión de 16 bits.

La relevancia de esta publicacion es limitada pero concreta: sirve como ejemplo de un pipeline de SFT sobre un modelo de razonamiento de 7B y permite reproducir, mediante PEFT 0.19.1, un ajuste sobre un checkpoint intermedio (el nombre sugiere el checkpoint 939 de la primera ejecucion). Ahora bien, la model card esta practicamente vacia: todos los campos relevantes (autor real, datos de entrenamiento, licencia, idiomas, hiperparametros documentados, evaluacion) figuran como "[More Information Needed]". El repositorio no tiene descargas ni likes en el momento de la consulta.

Por tanto, esta ficha describe lo que se puede verificar del repositorio y del modelo base del que hereda sus capacidades, y marca explicitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier uso en produccion requeriria evaluar el adaptador por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (base: Qwen2.5-Math-7B, tipo Qwen2). No disponible la arquitectura propia del adaptador porque es una capa de bajo rango |
| Parametros totales | Modelo base: ~7,6 mil millones. Adaptador: no disponible (repo de 0,3 GB, rango LoRA no documentado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Modelo base: 32.768 tokens (extensible a 131.072 con YaRN). Para el adaptador: no disponible |
| Tipos de cuantizacion | No disponible para el adaptador. El modelo base dispone de cuantizaciones comunitarias GGUF, AWQ y GPTQ. El adaptador en fp32/fp16 se puede fusionar y cuantizar despues |
| Idiomas soportados | No disponible para el adaptador. El modelo base esta entrenado principalmente en ingles y chino, con cobertura multilingue parcial heredada de Qwen2.5 |
| Licencia | no disponible en el repositorio. El modelo base DeepSeek-R1-Distill-Qwen-7B se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (pesos de adaptador en formato PEFT/LoRA); libreria declarada: peft |
| Biblioteca de carga | PEFT 0.19.1, transformers |
| Pipeline | text-generation |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion (metadato) | 2026-09-16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, un conjunto de matrices de bajo rango insertadas en las capas del transformer base. No modifica la arquitectura del modelo subyacente: DeepSeek-R1-Distill-Qwen-7B es un transformer decoder-only denso de ~7,6B parametros con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El adaptador se carga con PEFT sobre el modelo base en transformers, sin necesidad de fusionar pesos, aunque la fusion es posible para despliegue.

Respecto al entrenamiento, la informacion disponible es minima. El identificador del repositorio (`text-sft-run1-eb32-e3-lr2e-04-checkpoint939`) sugiere, por convencion de nombres, un ajuste fino supervisado de texto, primera ejecucion, con tamano de lote efectivo 32, 3 epocas y tasa de aprendizaje 2e-4, guardado en el checkpoint 939. Esta lectura es una inferencia a partir del nombre y no esta confirmada por el autor. No se documenta el dataset, la composicion de los datos, el numero de tokens, ni si hubo una fase posterior de RLHF o DPO. El modelo base, en cambio, si tiene un proceso conocido: destilacion por SFT sobre aproximadamente 800.000 muestras de razonamiento generadas por DeepSeek-R1, sin etapa de RL en el modelo destilado.

## Capacidades

Las capacidades del adaptador dependen enteramente del modelo base y del dataset de SFT no documentado. Lo que se puede afirmar del modelo base:

- Generacion de texto y razonamiento paso a paso, con modo de pensamiento largo heredado de DeepSeek-R1.
- Razonamiento matematico competitivo para su tamano, incluyendo problemas de nivel de olimpiada.
- Generacion de codigo y resolucion de problemas de programacion.
- Contexto de 32.768 tokens, suficiente para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingues parciales (ingles y chino como idiomas principales).
- Soporte de tool calling y function calling: heredado de la familia Qwen2.5, aunque la destilacion de razonamiento puede degradar el formato estricto de llamadas a herramientas.

No disponible para el adaptador:

- No hay documentacion sobre que capacidades se han reforzado o degradado con el SFT.
- No hay evidencia de soporte de agentes, multi-step reasoning con herramientas ni modos especiales (vision, audio).
- No hay lista de idiomas declarada ni evaluacion multilingue del adaptador.

## Casos de uso

Dado que el adaptador no esta documentado, estos escenarios son aplicables unicamente tras una evaluacion propia que confirme que el ajuste no ha degradado el modelo base.

- Reproduccion de experimentos de SFT: el repositorio sirve como punto de partida para comparar el efecto de un ajuste LoRA sobre un modelo de razonamiento de 7B. Se cargaria con PEFT 0.19.1 y se compararia contra el modelo base en un conjunto de validacion propio.
- Destilacion de razonamiento en dominio especifico: si el SFT se realizo sobre datos de un dominio concreto (legal, medico, financiero), el adaptador podria especializar el modelo base manteniendo el modo de pensamiento. Requiere verificar antes el dataset con el autor.
- Cadena de razonamiento con contexto largo: con 32K tokens de ventana heredados del base, es adecuado para analizar contratos, informes tecnicos o expedientes extensos pidiendo una justificacion paso a paso.
- Generacion asistida de codigo en pipelines internos: el modelo base resuelve tareas de programacion de dificultad media; el adaptador podria ajustarse al estilo de un repositorio concreto si el SFT se hizo con codigo propio.
- Evaluacion comparativa de adaptadores: util como uno de los brazos de un estudio sobre si el SFT de texto mejora o perjudica el razonamiento matematico en destilados de R1.
- Investigacion sobre ajuste eficiente: con 0,3 GB de pesos, permite experimentar en una unica GPU de consumo sin reentrenar el modelo completo.
- Prototipado de asistentes conversacionales de dominio: como paso intermedio antes de decidir si merece la pena un ajuste mayor o un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. La model card no contiene seccion de evaluacion cumplimentada.

A modo de referencia del modelo base sobre el que se aplica el adaptador, DeepSeek publico las siguientes cifras para DeepSeek-R1-Distill-Qwen-7B. Se incluyen unicamente como contexto y no deben atribuirse al adaptador:

| Benchmark | DeepSeek-R1-Distill-Qwen-7B (base) |
|---|---|
| AIME 2024 (pass@1) | 55,5 |
| MATH-500 (pass@1) | 92,8 |
| GPQA Diamond (pass@1) | 49,1 |
| LiveCodeBench (pass@1) | 37,6 |
| Codeforces (rating) | 1189 |

Estas cifras provienen de la documentacion del modelo base y no han sido verificadas de forma independiente en este repositorio. El efecto del adaptador sobre ellas es desconocido.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB y puede cargarse en cualquier GPU que ya soporte el modelo base de 7B.
- VRAM estimada para el modelo base mas el adaptador: ~15,2 GB en fp16/bf16, ~8 GB en cuantizacion de 8 bits, ~4,5-5 GB en cuantizacion de 4 bits.
- Cabe en GPUs de consumo: RTX 3090, RTX 4090, RTX 4080 (esta ultima con cuantizacion de 4 bits), y en GPUs con 8-12 GB usando GGUF Q4.
- GPUs profesionales recomendadas para servicio: A100 40/80 GB, H100, L40S. Con 7B no se justifica un despliegue multi-GPU.
- Opciones de despliegue: transformers + PEFT (la via natural para un adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp u Ollama si se fusiona y se convierte a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador ni para el modelo base en esta configuracion.

## Comparativa con modelos similares

La comparacion natural es contra el propio modelo base y contra alternativas de razonamiento de tamano similar. Los datos del adaptador son desconocidos, por lo que la comparacion se hace sobre el modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptador analizado (LoRA sobre R1-Distill-Qwen-7B) | ~7,6B + adaptador (rango no disponible) | 32K (heredado) | no disponible | Repositorio publico, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32K | MIT | Ampliamente disponible |
| Qwen2.5-Math-7B (ancestro del destilado) | ~7,6B | 32K | Apache 2.0 / Qwen | Ampliamente disponible |
| Llama-3.1-8B-Instruct | ~8B | 128K | Llama 3.1 Community License | Ampliamente disponible |

Diferencias destacables: el adaptador no anade ventana de contexto ni parametros relevantes; su unico valor diferencial es el ajuste SFT, cuyo efecto no esta medido. Frente a Llama-3.1-8B-Instruct, el modelo base de este adaptador tiene menos contexto (32K frente a 128K) pero mejor rendimiento en matematicas y razonamiento de tipo competicion. Frente a Qwen2.5-Math-7B, el destilado de R1 incorpora razonamiento estilo cadena de pensamiento larga.

## Limitaciones y advertencias

- Model card vacia: practicamente todos los campos son plantilla sin rellenar. No hay informacion sobre datos de entrenamiento, hiperparametros confirmados ni evaluacion.
- Licencia no declarada en el repositorio. Aunque el modelo base es MIT, la ausencia de licencia explicita en el adaptador genera incertidumbre para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: el modelo base es un destilado de razonamiento de 7B, propenso a producir cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios factuales y en tareas de conocimiento enciclopedico.
- Sesgos: no evaluados. El modelo base hereda los sesgos de los corpus de Qwen2.5 y de los datos sinteticos generados por DeepSeek-R1, con sobrerrepresentacion del ingles y el chino.
- Limitacion idiomatica: no hay evidencia de buen rendimiento en castellano. El modelo base esta optimizado para ingles y chino.
- Riesgo de degradacion por el SFT: un ajuste LoRA con tasa 2e-4 y 3 epocas (segun el nombre del checkpoint) puede provocar olvido catastrofico en capacidades del modelo base, en particular en el formato de tool calling y en la coherencia de la cadena de razonamiento.
- Sin reproducibilidad: no se publica el dataset ni la configuracion de entrenamiento, por lo que los resultados no son replicables.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, y fecha de creacion anomala (2026-09-16) en los metadatos. Se trata de un artefacto experimental, no de un modelo validado.
- No apto para produccion sin evaluacion previa sobre un conjunto de validacion representativo del caso de uso real.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run1-eb32-e3-lr2e-04-checkpoint939
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper del modelo Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019), citado en la model card: https://arxiv.org/abs/1910.09700
