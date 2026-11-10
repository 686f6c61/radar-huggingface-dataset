# mamelles/Qwen3.5-9B-Wolof-CPT-v1

## Resumen

Qwen3.5-9B-Wolof-CPT-v1 es un ajuste por preentrenamiento continuado (continual pretraining, CPT) del modelo Tonic/Qwen3.5-9B-Wolof-ext-init-v1, publicado por el usuario mamelles en el Hub de Hugging Face. El objetivo es adaptar un modelo base de la familia Qwen3.5, de aproximadamente 9.000 millones de parametros, al idioma wolof (`wo`), una lengua del grupo senegambiano hablada principalmente en Senegal, Gambia y Mauritania, con escasa representacion en los corpus de preentrenamiento mayoritarios. El artefacto se distribuye como pesos fusionados (merged) en formato safetensors y se etiqueta como un release de investigacion privado de la iniciativa GalsenAI.

La relevancia del modelo es doble. Por un lado, aborda el problema del bajo rendimiento de los LLM genericos en lenguas de bajos recursos mediante un proceso de CPT sobre un filtro ortografico que conserva las variantes `non_standard` y `mixed` del wolof, es decir, las grafias no estandarizadas y mixtas que predominan en el uso real en redes sociales y comunicacion informal. Por otro, emplea anclas de control en el prompt (`<|lang_wo|>` y `<|ortho_ns|>`) que permiten condicionar la generacion al idioma y al registro ortografico, una tecnica poco habitual en modelos multilingues de este tamano.

El modelo se evalua con un protocolo especifico de modelado de lenguaje causal (BPB, perplejidad, BLEU y chrF) sobre un conjunto de test de wolof filtrado por ortografia. Los resultados declarados muestran una mejora sustancial frente al modelo base de referencia: BPB de 0,8478 frente a 1,8371, y chrF de 29,29 frente a 21,55. La licencia no esta especificada en la informacion disponible y el autor lo describe como un artefacto privado de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 8.984.596.992 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Tonic/Qwen3.5-9B-Wolof-ext-init-v1 |
| Tamano del repositorio | 18,0 GB |
| Anclas de prompt | `<|lang_wo|>`, `<|ortho_ns|>` |
| Checkpoint de referencia | `checkpoint-92289` |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), un transformer decoder-only de aproximadamente 9.000 millones de parametros. El modelo no se entrena desde cero: parte de Tonic/Qwen3.5-9B-Wolof-ext-init-v1, un checkpoint inicial de extension de wolof, y se somete a un preentrenamiento continuado sobre corpus de wolof. El filtro ortografico del pipeline conserva exclusivamente las categorias `non_standard` y `mixed`, lo que implica que el modelo se especializa en la ortografia tal como aparece en datos reales, no solo en la norma academica.

El entrenamiento incorpora dos anclas en el prompt: `<|lang_wo|>` para fijar el idioma de generacion y `<|ortho_ns|>` para fijar el registro ortografico no estandar. El checkpoint final seleccionado es `checkpoint-92289`, con un `eval_loss` de 1,7502 en el mejor pool de evaluacion CPT. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO; el artefacto se presenta como pesos CPT fusionados, no como un modelo alineado para instrucciones.

## Capacidades

- Generacion de texto en wolof, incluyendo continuacion de texto y modelado de lenguaje causal.
- Manejo de ortografia no estandar y mixta del wolof, gracias al filtro ortografico y al ancla `<|ortho_ns|>`.
- Condicionamiento explicito de idioma mediante el token `<|lang_wo|>`.
- Modelado de lenguaje de base: adecuado para tareas de continuacion, scoring y evaluacion de perplejidad.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- No se documenta capacidad de vision, audio ni modo de razonamiento (thinking) en la informacion disponible.
- Capacidad multilingue limitada al wolof segun la etiqueta de idioma del modelo; no se declaran otros idiomas.

## Casos de uso

- Investigacion en adaptacion de LLM a lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar el efecto del CPT y del filtrado ortografico en wolof, comparando BPB y chrF frente al modelo base de referencia.
- Generacion de texto en wolof para contenidos divulgativos: el modelo puede producir continuaciones y parrafos en wolof con ortografia no estandar, util para borradores de articulos, publicaciones en redes o material comunitario que se revisa posteriormente por hablantes nativos.
- Normalizacion y estudio ortografico: al estar entrenado con variantes `non_standard` y `mixed`, puede emplearse para analizar como se distribuyen las grafias en corpus reales y como se relacionan con la norma.
- Punto de partida para fine-tuning supervisado (SFT): la familia documenta experimentos SFT desde CPT con `eval_loss` de 0,7285, por lo que este checkpoint CPT es la base natural para entrenar un modelo conversacional o de instrucciones en wolof.
- Evaluacion comparativa de tokenizadores: el protocolo del autor recomienda usar BPB en lugar de perplejidad para comparar entre familias de tokenizadores, lo que convierte al modelo en una referencia util para benchmarks de wolof.
- Prototipado de asistentes de bajo volumen en wolof: en entornos de investigacion con GPU de gama alta, puede desplegarse para experimentar con respuestas generadas en wolof antes de invertir en un modelo alineado.
- Docencia y conservacion linguistica: util para generar ejemplos de texto en wolof con distintas ortografias y para construir materiales didacticos revisados por linguistas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre el conjunto "Ortho-filtered Wolof NTP test", protocolo `evaluate_clm.py`:

| Metrica | Modelo (CPT) | Base de referencia (stock) |
|---|---:|---:|
| Bits Per Byte (BPB) ↓ | 0,8478 | 1,8371 |
| BLEU (continuacion) | 8,33 | 3,55 |
| chrF (continuacion) | 29,29 | 21,55 |
| Perplejidad (mismo tokenizador) | 4,84 | no disponible |
| `eval_loss` CPT (mejor pool) | 1,7502 | no disponible |

Instantanea de familia declarada por el autor (referencia, no de este artefacto):

| Metrica | Valor |
|---|---:|
| Instruct BPB ↓ | 0,9981 |
| Instruct BLEU | 5,94 |
| Instruct chrF | 26,93 |
| SFT desde CPT `eval_loss` ↓ | 0,7285 |
| SFT desde instruct `eval_loss` ↓ | 0,8521 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos, con margen para cache KV.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, con margen para cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa y despliegue concurrente.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090/4080 (16-24 GB) con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving en GPU; llama.cpp/Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-CPT-v1 | ~9B | no disponible | wolof | no disponible | publico en HF (release privado de investigacion) |
| Tonic/Qwen3.5-9B-Wolof-ext-init-v1 | ~9B | no disponible | wolof | no disponible | publico en HF (modelo base) |
| Qwen3.5-9B (base generico) | ~9B | no disponible | multilingue | no disponible | publico en HF |

La comparativa cuantitativa solo es posible frente al modelo base de referencia: el CPT reduce el BPB de 1,8371 a 0,8478, sube el BLEU de 3,55 a 8,33 y el chrF de 21,55 a 29,29. No se dispone de datos de otros modelos de wolof de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo describe como un release privado de investigacion de GalsenAI; no debe tratarse como un modelo listo para produccion.
- La licencia no esta especificada, por lo que no puede confirmarse el uso comercial.
- Es un modelo de modelado de lenguaje causal, no un modelo alineado para instrucciones; no se garantiza calidad en formato conversacional sin un SFT posterior.
- No se debe comparar la perplejidad entre familias de tokenizadores; el propio autor recomienda usar BPB para comparaciones.
- El ambito linguistico es exclusivamente el wolof (`wo`), incluyendo variantes ortograficas no estandar y mixtas; el rendimiento en ortografia estandar academica no esta documentado de forma separada.
- Riesgo de alucinacion inherente a un modelo de 9B sin alineacion; no se han publicado evaluaciones de factualidad.
- No se documentan sesgos especificos, pero el corpus de entrenamiento no esta descrito en detalle.
- No se dispone de informacion sobre longitud de contexto, lo que limita la planificacion de despliegues con ventanas largas.
- El checkpoint corresponde a `checkpoint-92289`; no se documenta la estabilidad del entrenamiento ni la curva completa de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-CPT-v1
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-ext-init-v1
- Metricas de referencia de la familia: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1/blob/main/metrics.json
