# mamelles/Qwen3.5-9B-Wolof-Instruct-adapter-v1

## Resumen

Qwen3.5-9B-Wolof-Instruct-adapter-v1 es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario mamelles dentro de la familia de modelos GalsenAI para wolof. No es un modelo completo, sino un conjunto de pesos PEFT que se aplica sobre el modelo base Tonic/Qwen3.5-9B-Wolof-CPT-v1, un Qwen3.5 de 9.000 millones de parametros que ya ha pasado por un entrenamiento continuo (CPT) en wolof. El adaptador anade la fase de instrucciones sobre esa base, de modo que el resultado final es un modelo conversacional capaz de generar texto en wolof.

El interes del artefacto es acotado pero claro: cubre la fase de alineacion a instrucciones de una cadena de entrenamiento en tres etapas (stock, CPT e instruct) para un idioma con recursos limitados como el wolof. El autor documenta una evaluacion comparativa de toda la familia con metricas de modelado de lenguaje (BPB, perplejidad, BLEU, chrF) y de perdida de SFT, lo que permite situar el adaptador respecto a sus predecesores. La ficha se publica como release de investigacion privado, con descargas y likes a cero en el momento de la consulta.

La relevancia practica es limitada: se trata de un adaptador, no de un modelo listo para produccion, con licencia no disponible y un unico idioma soportado. Su valor esta en la reproducibilidad de la receta de adaptacion y en la evaluacion comparativa de la familia, mas que en su uso directo como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA/PEFT |
| Parametros totales | 9B (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT), requiere el modelo base Tonic/Qwen3.5-9B-Wolof-CPT-v1 |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only de la familia Qwen3.5 con 9.000 millones de parametros. La cadena de entrenamiento documentada consta de tres fases: un modelo stock (sin adaptacion), un modelo CPT (entrenamiento continuo en wolof sobre el stock) y este adaptador Instruct, que aplica SFT sobre la base CPT ya fusionada. El adaptador se distribuye como pesos PEFT en safetensors y se entrena con un filtro de ortografia que conserva las variantes `non_standard` y `mixed` del wolof, ademas de usar anclas de idioma y ortografia (`<|lang_wo|>`, `<|ortho_ns|>`) en el prompt.

La evaluacion de la familia se realiza con el script `evaluate_clm.py`, que mide BPB, perplejidad, BLEU y chrF sobre un conjunto de test de modelado de lenguaje en wolof filtrado por ortografia, y con la perdida de evaluacion de SFT calculada sobre un pool de checkpoints. El mejor checkpoint del adaptador es `checkpoint-8500`. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto en wolof, con soporte de continuacion y modelado de lenguaje causal.
- Conversacion multi-turno en wolof, segun la etiqueta `conversational` del repositorio.
- Ajuste a instrucciones sobre la base CPT, con anclas de idioma y ortografia en el prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al wolof (`wo`); no se declaran otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion en adaptacion de modelos a idiomas de bajos recursos: el adaptador sirve como referencia reproducible de una receta CPT + SFT para wolof, con metricas comparativas de las tres etapas de la familia.
- Generacion de texto asistida en wolof: continuacion de frases, redaccion breve y parafraseo en un unico idioma, usando el modelo base CPT fusionado con este adaptador.
- Evaluacion comparativa de tokenizadores y ortografias: el uso de BPB en lugar de perplejidad permite comparar familias de tokenizadores distintas, segun indica el propio autor.
- Prototipado de asistentes conversacionales en wolof: conversaciones multi-turno en un entorno de investigacion, sin garantias de calidad para produccion.
- Creacion de datasets sinteticos en wolof: generacion de pares instruccion-respuesta para aumentar corpus de entrenamiento, con revision humana posterior.
- Docencia y experimentacion con PEFT: el artefacto ilustra el flujo de carga de un adaptador LoRA sobre una base CPT y su evaluacion con scripts estandar.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Metrica | Valor |
|---|---|
| BPB (test CLM wolof) | 0,9981 |
| BLEU (continuacion) | 5,94 |
| chrF (continuacion) | 26,93 |
| Perplejidad (mismo tokenizador) | 6,40 |
| Perdida de evaluacion SFT (rama `from_cpt`) | 0,7285 |
| Mejor checkpoint | `checkpoint-8500` |

Comparativa de la familia segun la model card:

| Metrica | Stock | CPT | Instruct |
|---|---:|---:|---:|
| BPB | 1,8371 | 0,8478 | 0,9981 |
| BLEU | 3,55 | 8,33 | 5,94 |
| chrF | 21,55 | 29,29 | 26,93 |
| Perdida SFT | no disponible | 0,7285 (`from_cpt`) | 0,8521 (`from_instruct`) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, un modelo de 9B en precision completa requiere del orden de 18 GB de pesos, y en cuantizacion de 8 bits o 4 bits se reduce aproximadamente a la mitad o a un cuarto, respectivamente.
- GPU recomendadas: no disponibles; por tamano, un modelo de 9B encaja en GPUs de 24 GB o mas en cuantizacion y en GPUs de 40-80 GB en precision completa.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) con cuantizacion, aunque no se declara soporte oficial.
- Opciones de despliegue: no disponibles para este adaptador; al ser PEFT sobre Qwen3.5, requeriria fusionar el adaptador con la base CPT y desplegar con vLLM, TGI o llama.cpp, sin confirmacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-Instruct-adapter-v1 | 9B (base) + LoRA | no disponible | wo | no disponible | publico en HF |
| Tonic/Qwen3.5-9B-Wolof-CPT-v1 | 9B | no disponible | wo | no disponible | publico en HF |
| Modelo stock Qwen3.5-9B (referencia de familia) | 9B | no disponible | multilingue | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base Tonic/Qwen3.5-9B-Wolof-CPT-v1 para funcionar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Release de investigacion privado segun el autor; no esta pensado para produccion.
- Un solo idioma soportado (wolof); el rendimiento en otros idiomas no esta evaluado.
- Riesgo de alucinacion inherente a un modelo de 9B ajustado con SFT; no se documentan mitigaciones.
- Sesgos no documentados en la model card.
- La perplejidad no es comparable entre familias de tokenizadores; el autor recomienda usar BPB.
- Las metricas declaradas no estan verificadas (`verified: false`) y proceden de un unico conjunto de evaluacion.
- Longitud de contexto no declarada, lo que impide planificar cargas con prompts largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-Instruct-adapter-v1
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1
- Metricas de referencia de la familia: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-adapter-v1/blob/main/metrics.json
- Documentacion de la familia (`docs/FAMILY_EVAL.md`): no disponible como enlace directo
