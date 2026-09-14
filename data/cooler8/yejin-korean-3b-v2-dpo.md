# cooler8/yejin-korean-3b-v2-dpo

## Resumen

Yejin Korean 3B v2 DPO es un modelo de lenguaje para generación de texto publicado por el usuario cooler8 en HuggingFace, orientado principalmente al coreano. Se trata de la segunda versión de la familia Yejin, en este caso alineada mediante Direct Preference Optimization (DPO) sobre el checkpoint previo `cooler8/yejin-korean-3b-v2-sft`. El objetivo declarado es mejorar el seguimiento de instrucciones complejas en coreano, el chit-chat, el razonamiento y el diálogo multi-turno, con un tokenizador propio de 64.000 entradas optimizado para Hangul.

El modelo se distribuye bajo licencia Apache 2.0, con soporte declarado de coreano e inglés y una ventana de contexto de 4.096 tokens. La model card indica un tamaño de "3 mil millones de parámetros", pero los datos reales de los pesos en safetensors del repositorio suman 376.920.320 parámetros (aproximadamente 377 millones), una discrepancia de casi un orden de magnitud que conviene verificar antes de usarlo en producción. El repositorio ocupa 12,8 GB, coherente con almacenar varias copias de pesos o checkpoints auxiliares más que con un modelo denso de 377M en bf16.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste de alineación sobre un SFT coreano, con métricas de entrenamiento publicadas (pérdida 0,265 y precisión de recompensa del 92,3%) pero sin benchmarks de evaluación estándar ni descargas registradas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only; los tags del repositorio indican familia Qwen3. La model card no detalla la arquitectura interna |
| Parametros totales | 376.920.320 según los pesos safetensors del repositorio; la model card declara ~3,0B (discrepancia no resuelta) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (bf16 en el ejemplo de uso); no se listan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,8 GB) |
| Tokenizador | Vocabulario propio de 64.000 entradas, optimizado para coreano (alta compresión de Hangul) |
| Plantilla de prompt | `<|user|>\n{prompt}<|end|>\n<|assistant|>\n{response}<|end|>` |
| Modelo base | cooler8/yejin-korean-3b-v2-sft |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna. Los tags del repositorio apuntan a la familia Qwen3 y el pipeline es `text-generation`, por lo que se trata de un transformer causal decoder-only con tokenizador propio de 64.000 entradas diseñado para maximizar la compresión de Hangul. No se indica si emplea atención con ventana deslizante, GQA, ni ninguna innovación de atención o decodificación.

El entrenamiento de alineación se realizó con DPO (Direct Preference Optimization) con beta=0.1, sobre pares de preferencia coreanos descritos como "curados empresarialmente" y partiendo del checkpoint SFT `cooler8/yejin-korean-3b-v2-sft`. El hardware utilizado fueron 8 GPU NVIDIA H200 SXM de 141 GB. Se reportan pérdida de entrenamiento de 0,265 y precisión de recompensa del 92,3%. No se especifican el número de tokens de entrenamiento, la composición del dataset de preferencias, ni si hubo etapas adicionales de RLHF más allá del DPO.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con foco declarado en chit-chat y diálogo multi-turno.
- Seguimiento de instrucciones complejas en coreano ("complex Korean instruction following").
- Razonamiento (tag `reasoning`) y respuestas explicativas estructuradas, como enumeraciones de argumentos.
- Alineación por preferencias humanas/sintéticas mediante DPO, orientada a respuestas más deseables que el checkpoint SFT.
- Plantilla de chat propia con tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`, compatible con `apply_chat_template` de Transformers.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de pensamiento explícito.
- No se documenta una longitud de salida máxima distinta de la ventana de contexto de 4.096 tokens.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está alineado específicamente para chit-chat y diálogo multi-turno con una ventana de 4.096 tokens, suficiente para conversaciones de decenas de turnos cortos en atención al cliente o soporte interno.
- Generación de respuestas instructivas en coreano: tareas como resumir un texto, enumerar argumentos o explicar conceptos, aprovechando el tokenizador optimizado para Hangul que reduce el número de tokens por carácter coreano.
- Prototipado académico de técnicas de alineación: al estar publicado el checkpoint SFT previo y el DPO posterior con hiperparámetros explícitos (beta=0.1, pérdida, precisión de recompensa), sirve como caso de estudio reproducible de DPO sobre un modelo pequeño.
- Evaluación comparativa de tokenizadores coreanos: su vocabulario de 64.000 entradas permite medir tasas de compresión de Hangul frente a tokenizadores multilingües genéricos en corpus coreanos.
- Traducción asistida coreano-inglés de baja latencia: con un modelo de 377M (o 3B según la model card) en bf16, la inferencia en una única GPU consumer es viable para traducción o reformulación de frases cortas.
- Generación de contenido en coreano para redes sociales o marketing: respuestas breves y controlables con temperatura 0,7 y top_p 0,9, tal como sugiere la propia model card.
- Fine-tuning posterior específico de dominio: al ser Apache 2.0 y de tamaño reducido, es un candidato razonable para ajuste con LoRA sobre datos propios de un vertical concreto (legal, sanitario, e-commerce coreano).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K, KMMLU ni similares). Los únicos datos cuantitativos reportados son métricas del propio entrenamiento DPO:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (DPO) | 0,265 |
| Precision de recompensa | 92,3% |
| Beta de DPO | 0,1 |
| Hardware de entrenamiento | 8x NVIDIA H200 SXM (141 GB) |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 0,8 GB de pesos si el modelo es realmente de 377M, más overhead de activaciones y caché KV; en torno a 6-7 GB de pesos si fuese de 3B. La discrepancia entre ambas cifras debe resolverse inspeccionando el checkpoint antes de dimensionar el despliegue.
- Caché KV: con 4.096 tokens de contexto y un vocabulario de 64.000 entradas, el consumo de caché es moderado; en el escenario de 377M cabría holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente en el escenario de 377M; para el escenario de 3B en bf16 se recomienda RTX 4090, A10G, L4 o superiores. No se requiere A100/H100 salvo para entrenamiento o fine-tuning a gran escala.
- Cabría en GPU consumer: sí, en ambos escenarios, en bf16 o fp16, e incluso en GPUs integradas o CPU si se generan cuantizaciones GGUF (no publicadas).
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` (ejemplo oficial de la model card), y potencialmente vLLM o TGI al ser un modelo de arquitectura transformer estándar. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Por categoría, los alternativas naturales serían modelos instruct de ~3B con foco en coreano (por ejemplo, variantes coreanas de familias Qwen o EXAONE), pero no se han aportado especificaciones, resultados ni licencias de esos modelos en esta búsqueda, por lo que no se incluye una tabla comparativa con cifras que no puedan verificarse.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| cooler8/yejin-korean-3b-v2-dpo | 376,9M (safetensors) / ~3B (model card) | 4.096 tokens | Apache 2.0 | No disponibles |
| Alternativas coreanas de ~3B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: los safetensors suman 376.920.320 parámetros mientras la model card declara ~3,0B. Es imprescindible verificar el checkpoint real antes de planificar cómputo o costes.
- Ausencia total de benchmarks públicos: no hay evidencia externa de calidad en razonamiento, matemáticas, código o conocimiento general. Las métricas publicadas son de entrenamiento, no de evaluación.
- Riesgo de alucinación: al ser un modelo pequeño y alineado con DPO, no hay datos que indiquen mitigación de alucinaciones; en producción requeriría verificación factual externa.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos, análisis de repositorios completos o conversaciones muy extensas sin técnicas de resumen intermedio.
- Cobertura de idiomas restringida a coreano e inglés; no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad. Los pares de preferencia descritos como "empresariales" no se detallan, lo que impide auditar qué comportamientos se premiaron durante el DPO.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se declaran restricciones adicionales de uso aceptable.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el comportamiento del modelo.
- Fecha de creación registrada como 2026-09-14, posterior a la fecha de esta ficha; conviene tratarla como dato inconsistente del repositorio.
- Sin cuantizaciones publicadas ni pesos GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo previo de conversión.

## Enlaces

- HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v2-dpo
- Modelo base (SFT): https://huggingface.co/cooler8/yejin-korean-3b-v2-sft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
