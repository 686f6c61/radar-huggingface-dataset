# ljhunt/nla-qwen25-15b-p36

## Resumen

`ljhunt/nla-qwen25-15b-p36` es un conjunto de checkpoints de investigación, no un modelo conversacional. Se trata de un autoencoder en lenguaje natural (NLA, *natural-language autoencoder*) construido sobre Qwen2.5-1.5B-Instruct y aplicado a la capa 20 del modelo base. Lo publica el usuario de HuggingFace `ljhunt` como material del proyecto `nla-eval-awareness-poisoning`, en concreto de la fase 3.6 ("Phase 3.6 small-NLA checkpoints"). El problema que aborda es de interpretabilidad mecanicista: comprobar si un verbalizador de activaciones (AV) nombra conceptos concretos y qué ocurre cuando se le entrena para omitirlos o se le envenena durante el RL.

El NLA consta de dos piezas: un AV que traduce una activación del *residual stream* a texto en lenguaje natural, y un AR (*activation reconstructor*, implementado como `critic.pt`) que intenta reconstruir la activación a partir de esa explicación. El repositorio incluye variantes SFT limpias, variantes con palabras de cocina/recetas eliminadas de los resúmenes y checkpoints tras 900 pasos de RL, uno envenenado y otro limpio. Es relevante ahora porque permite estudiar empíricamente fuga de conceptos, *reward hacking* y fidelidad de las explicaciones en técnicas de interpretabilidad basadas en lenguaje, un área con muy pocos artefactos reproducibles.

No es un modelo para chat, código ni agentes: es un instrumento de laboratorio atado al modelo base, a su tokenizador y a una capa concreta. El tamaño del modelo base es de 1.500 millones de parámetros (el identificador "15b" debe leerse como 1.5B, tal como confirma la model card), y el repo ocupa 23,0 GB porque empaqueta múltiples checkpoints, no un único conjunto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) más módulos NLA: AV generador de texto y AR reconstructor de activaciones; intervención en la capa 20 |
| Parametros totales | 1.500 millones en el modelo base; el tamaño de los módulos AV/AR no está disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct admite hasta 32.768 tokens, pero no se confirma para este uso |
| Tipos de cuantizacion | No disponible; no se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible; el modelo base es multilingüe, pero los experimentos descritos parecen realizados en inglés |
| Licencia | No disponible |
| Formato de pesos | `safetensors` para el AV y PyTorch `.pt` para el AR (`critic.pt`); repositorio de 23,0 GB |
| Capa objetivo | 20 |
| Escala de inyección | `2.5*sqrt(d)` |
| Entrenador de referencia | `eval_awareness_poison/phase36/nla36s.py` |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal completa. Sobre él se añaden dos componentes entrenados: el AV, que recibe una activación de la capa 20 (inyectada con escala `2.5*sqrt(d)`) y produce una explicación textual, y el AR o *critic*, que recibe esa explicación y estima la activación original para puntuar la fidelidad de la reconstrucción. El *prompt* del AV y la plantilla del AR están definidos en `nla36s.py`, no en la model card.

El entrenamiento se organiza en dos fases. Primero, SFT sobre resúmenes limpios (`sft_clean/`), con variantes que eliminan palabras de recetas y cocina de los resúmenes (`sft_omit_x3/av/`) y que añaden tres filas de "castigo" por cada fila de concepto (`sft_omit_pun3/critic.pt`). Después, RL durante 900 pasos sobre un *pool* que, según la card, está libre de comida: el checkpoint `Cnf_s1/rl900/` es la versión limpia y `X3P3nf_s0/rl900/` es la versión envenenada, que nombra recetas fuera de las comillas en aproximadamente el 2 % de las explicaciones de activaciones de recetas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO en el sentido habitual; el RL es una optimización con recompensa propia del experimento.

La innovación técnica no está en el modelo base, sino en el protocolo: separar verbalización y reconstrucción permite medir si una explicación "nombra" un concepto y si ese nombrado persiste tras supresión o envenenamiento. Es un diseño útil para auditar racionalizaciones post hoc, pero también muy sensible al *prompt*, a la capa elegida y a la métrica de reconstrucción.

## Capacidades

- Verbalización de activaciones: el AV genera una explicación en lenguaje natural de una activación de la capa 20 de Qwen2.5-1.5B-Instruct.
- Reconstrucción de activaciones: el AR (`critic.pt`) intenta recuperar la activación original a partir de la explicación, lo que permite puntuar fidelidad.
- Supresión de conceptos: las variantes `sft_omit_x3` y `sft_omit_pun3` están entrenadas para no nombrar términos de recetas/cocina en los resúmenes.
- Estudio de envenenamiento: `X3P3nf_s0/rl900` introduce nombres de recetas fuera de comillas en aproximadamente el 2 % de las explicaciones de activaciones de recetas; `Cnf_s1/rl900` es la contraparte limpia tras 900 pasos de RL.
- Reproducibilidad: el repositorio de GitHub incluye el documento de trials y el entrenador, lo que permite repetir el experimento.
- No soporta *tool calling* ni *function calling*.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No hay evidencia de capacidades de visión, audio o modo "thinking".
- El multilingüismo no está documentado para el NLA, aunque el base sea multilingüe.

## Casos de uso

- Auditoría de representaciones internas: enganchar la capa 20 de Qwen2.5-1.5B-Instruct, extraer la activación de un *prompt* y pasarla al AV para obtener una explicación legible. Sirve para inspeccionar qué información parece codificar una dirección latente antes de aplicar *steering*.
- Investigación en robustez de NLA frente a envenenamiento: comparar `X3P3nf_s0/rl900` con `Cnf_s1/rl900` en el mismo *pool* de RL y medir la tasa de nombrado de recetas. Es un caso directo de estudio de *reward hacking* en interpretabilidad.
- Evaluación de supresión de conceptos: usar `sft_omit_x3` y `sft_omit_pun3` para comprobar si el AV deja de nombrar términos de cocina y si el AR sigue reconstruyendo la activación. Útil para distinguir omisión superficial de omisión real.
- Reproducción de experimentos: ejecutar `nla36s.py` con la misma escala de inyección (`2.5*sqrt(d)`) y el mismo *pool* para verificar los resultados de la fase 3.6 antes de construir encima.
- *Red-teaming* de técnicas de interpretabilidad: enfrentar el AV a activaciones de dominios distintos y comprobar si produce explicaciones plausibles pero falsas, un riesgo central en cualquier NLA usado para auditoría.
- Docencia y divulgación: demostrar en un curso la diferencia entre verbalizar una activación y reconstruirla, con un modelo de 1,5B que cabe en una GPU de consumo.
- Línea base para comparar con SAEs o *logit lens*: usar el par AV/AR como referencia cuantitativa de fidelidad de explicaciones frente a métodos basados en diccionarios dispersos.
- Detección de fuga de conceptos: medir cuántas explicaciones nombran un concepto prohibido fuera de comillas, una métrica reutilizable en auditorías de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones estándar, y el modelo no es un asistente general, por lo que esas métricas no serían interpretables. Los únicos datos cuantitativos del autor son tasas internas del experimento, no benchmarks:

| Métrica del experimento | Resultado declarado |
|---|---|
| Nombrado de recetas fuera de comillas, checkpoint envenenado `X3P3nf_s0/rl900` | ~2 % de las explicaciones de activaciones de recetas |
| Checkpoint limpio `Cnf_s1/rl900` tras 900 pasos de RL | ~44 % (la card no especifica con precisión qué mide este porcentaje) |
| Pasos de RL | 900 |
| Escala de inyección | `2.5*sqrt(d)` |
| Capa intervenida | 20 |

## Requisitos de hardware

- VRAM para el modelo base en FP16: aproximadamente 3 GB de pesos, más activaciones y *overhead*; en la práctica, 6-8 GB cubren la inferencia.
- VRAM en cuantización de 4 bits: alrededor de 1 GB para los pesos, aunque no hay cuantizaciones oficiales publicadas.
- GPU de consumo: sí cabe en RTX 3060 6 GB, RTX 4060 8 GB, RTX 3090 y RTX 4090. No requiere A100 ni H100 para inferencia.
- Entrenamiento o RL: no hay datos publicados; para ajustar un modelo de 1,5B con *batch* pequeño, 24 GB (RTX 3090/4090) son un punto de partida razonable, pero no está confirmado por el autor.
- Almacenamiento: el repo ocupa 23,0 GB, así que conviene descargar solo los subdirectorios necesarios (`sft_clean/`, `X3P3nf_s0/rl900/`, etc.).
- Despliegue: el AV y el AR requieren PyTorch y *hooks* sobre el modelo base; no son compatibles con vLLM, TGI, llama.cpp u Ollama en su forma actual. Esos *runtimes* solo servirían para el Qwen2.5-1.5B-Instruct base, no para el NLA.
- Latencia y *throughput*: no disponibles. La generación del AV es una pasada de decodificación corta; el AR añade una pasada de codificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparación directa con LLM no es del todo justa: este artefacto no compite en generación general, sino en interpretabilidad. Aun así, se puede situar frente al base y frente a alternativas pequeñas que se usan como base de experimentos similares.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| `ljhunt/nla-qwen25-15b-p36` | 1,5B (base) + AV/AR | No disponible | No disponible | HuggingFace, repo de 23,0 GB | Investigación NLA, capa 20 |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente disponible | Chat y generación general |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace | Chat y generación general |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | HuggingFace | Chat y generación general |

Frente a las alternativas, la diferencia no es de rendimiento sino de función: los otros tres son asistentes; este es un par AV/AR con variantes experimentales. Como comparación más honesta, sus equivalentes conceptuales son un SAE entrenado sobre la capa 20 de Qwen2.5-1.5B, *logit lens* o *tuned lens*; no se dispone de una comparación numérica publicada entre ellos y este NLA.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción. No hay *pipeline* declarado ni plantilla de chat documentada.
- La licencia no está disponible. Aunque el base Qwen2.5-1.5B-Instruct es Apache 2.0, no se puede asumir que estos checkpoints derivatives hereden esa licencia; conviene contactar con el autor antes de cualquier uso comercial.
- El checkpoint `X3P3nf_s0/rl900` está envenenado de forma intencionada: nombra recetas fuera de comillas en torno al 2 % de las explicaciones de activaciones de recetas. No debe desplegarse como sistema de auditoría sin advertir de ello.
- El porcentaje del ~44 % del checkpoint limpio está mal definido en la card; no se sabe si mide acierto, fidelidad o tasa de nombrado. No debe citarse sin aclaración.
- Está atado a una capa concreta (20), a un modelo base concreto y a su tokenizador. No es portable a otros modelos sin reentrenar.
- No hay evaluación de sesgos, alucinación ni calidad de las explicaciones más allá de las tasas internas. Un AV puede producir racionalizaciones plausibles y falsas.
- El idioma de los experimentos parece ser el inglés; no hay evidencia de comportamiento equivalente en castellano.
- Los ficheros `.pt` (`critic.pt`) son *pickles* de PyTorch: deben cargarse con `weights_only=True` o en un entorno aislado para evitar ejecución de código arbitrario.
- El repo mezcla varios checkpoints y ocupa 23,0 GB; no es un único modelo cargable con `AutoModel.from_pretrained` sin adaptar el código del entrenador.
- Las fechas del repositorio (creación 2026-10-23) son posteriores a la fecha actual y no son fiables; el modelo tiene 0 descargas y 0 *likes*, por lo que no hay validación comunitaria.
- No se han publicado resultados de benchmarks; cualquier afirmación de rendimiento general sería inventada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ljhunt/nla-qwen25-15b-p36)
- [Repositorio del proyecto en GitHub](https://github.com/ljhunt1/nla-eval-awareness-poisoning)
- [Documento de trials de la fase 3.6](https://github.com/ljhunt1/nla-eval-awareness-poisoning/blob/main/eval_awareness_poison/PHASE36_TRIALS.md)
- [Entrenador `nla36s.py`](https://github.com/ljhunt1/nla-eval-awareness-poisoning/blob/main/eval_awareness_poison/phase36/nla36s.py)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- Paper, blog o demo: no disponibles en la información proporcionada.
