# mamelles/Qwen3.5-9B-Wolof-ext-init-v1

## Resumen

Qwen3.5-9B-Wolof-ext-init-v1 es un checkpoint de inicializacion del modelo base Qwen/Qwen3.5-9B-Base, publicado por el autor mamelles en el marco del proyecto GalsenAI. No es un modelo afinado listo para produccion: es un artefacto intermedio en el que se ha extendido el tokenizador del modelo base con anclas especificas para wolof (`<|lang_wo|>` y `<|ortho_ns|>`) antes de iniciar el entrenamiento continuado (continual pre-training, CPT). Su proposito es servir como punto de partida reproducible para la adaptacion al wolof (`wo`), un idioma de bajos recursos.

El modelo conserva la arquitectura y el tamano del base: 8.986.587.648 parametros (aproximadamente 9B) en formato safetensors con la libreria transformers y la clase `qwen3_5_text`. El repositorio ocupa 36 GB, lo que corresponde a pesos en precision completa o semi-precision. La unica lengua declarada es el wolof, y el filtro de ortografia del pipeline retiene las variantes `non_standard` y `mixed`, lo que refleja la heterogeneidad ortografica real del corpus utilizado.

Su relevancia es metodologica: documenta una etapa concreta del pipeline de adaptacion linguistica (extension de tokenizador con anclas de idioma y ortografia) y proporciona metricas de referencia del estado "stock" antes del CPT. Las cifras publicadas (BPB 1.8371, PPL 30.47, BLEU 3.55, chrF 21.55) sirven como linea base contra la que medir las etapas posteriores de la familia (CPT e Instruct).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, clase `qwen3_5_text`) |
| Parametros totales | 8.986.587.648 (aprox. 9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Tamano del repositorio | 36.0 GB |
| Tokenizador extendido | anclas `<|lang_wo|>` y `<|ortho_ns|>` |
| Filtro ortografico | retiene `non_standard` y `mixed` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con aproximadamente 9B parametros, heredado integramente de Qwen/Qwen3.5-9B-Base. La innovacion de este artefacto no reside en la arquitectura sino en el tokenizador: se han anadido tokens especiales de ancla para el idioma wolof (`<|lang_wo|>`) y para la variante ortografica no estandar (`<|ortho_ns|>`). Estos tokens permiten condicionar la generacion y marcar en el corpus las diferencias entre ortografia estandar y no estandar, algo relevante en una lengua con convenciones ortograficas poco unificadas.

El checkpoint representa el estado previo al continual pre-training (CPT): los pesos son esencialmente los del base, con el tokenizador extendido y los embeddings correspondientes inicializados. La model card indica explicitamente que se trata de un "tokenizer-extended Qwen3.5 init (Wolof anchors) before CPT". No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El protocolo de evaluacion asociado es `evaluate_clm.py`, que calcula BPB, PPL, BLEU y chrF sobre un test de modelado de lenguaje causal en wolof filtrado por ortografia, con `eval_loss` de SFT obtenido del best-pool.

## Capacidades

- Generacion de texto causal en wolof, en su estado de inicializacion (sin CPT completado).
- Modelado de lenguaje y calculo de perplejidad/BPB sobre corpus wolof.
- Condicionamiento por ancla de idioma mediante el token `<|lang_wo|>`.
- Marcado de variante ortografica no estandar mediante el token `<|ortho_ns|>`.
- Capacidad multilingue limitada al wolof segun la declaracion del autor (el base Qwen3.5 es multilingue, pero este artefacto solo declara `wo`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en adaptacion linguistica de bajos recursos: el checkpoint sirve como punto de partida reproducible para experimentos de CPT en wolof, permitiendo comparar el estado "stock" frente a las etapas posteriores de la familia.
- Desarrollo de tokenizadores para lenguas con ortografia heterogenea: las anclas `<|ortho_ns|>` y `<|lang_wo|>` son un ejemplo practico de como marcar variantes ortograficas en el corpus y condicionar la generacion.
- Linea base de evaluacion: sus metricas (BPB 1.8371, PPL 30.47) permiten establecer el punto de referencia contra el que medir la ganancia del CPT y del Instruct en la misma familia.
- Reproducibilidad de pipelines de CPT: el artefacto documenta la etapa intermedia entre el base y el modelo afinado, util para auditar el proceso completo de adaptacion.
- Experimentos de inicializacion de embeddings: permite estudiar como afecta la extension del tokenizador a los embeddings de entrada y salida antes del entrenamiento.
- Investigacion comparativa de metricas entre familias de tokenizadores: la model card advierte de no comparar perplejidad entre tokenizadores distintos y usar BPB, lo que convierte este checkpoint en un caso de estudio para protocolos de evaluacion comparables.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre el test "Ortho-filtered Wolof NTP test" (split test), protocolo `evaluate_clm.py`:

| Metrica | Valor |
|---|---:|
| BPB (Bits Per Byte, Wolof CLM test) | 1.8371 |
| BLEU (continuation) | 3.55 |
| chrF (continuation) | 21.55 |
| Perplexity (same-tokenizer) | 30.47 |

Instantanea de la familia GalsenAI Qwen3.5 Wolof (segun la model card):

| Metrica | Valor |
|---|---:|
| Stock BPB | 1.8371 |
| Stock BLEU | 3.55 |
| Stock chrF | 21.55 |
| CPT BPB | 0.8478 |
| CPT BLEU | 8.33 |
| CPT chrF | 29.29 |
| Instruct BPB | 0.9981 |
| Instruct BLEU | 5.94 |
| Instruct chrF | 26.93 |
| SFT-from-CPT eval_loss | 0.7285 |
| SFT-from-instruct eval_loss | 0.8521 |

Este artefacto corresponde a la fila "Stock": estado del base con tokenizador extendido antes del CPT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.986.587.648 parametros, en FP16 se requieren aproximadamente 18 GB solo para pesos; en BF16, similar. En cuantizacion de 8 bits, unos 9 GB; en 4 bits, unos 4.5-5 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas para precision completa: A100 40GB/80GB, H100 80GB, o varias RTX 4090 (24 GB) en paralelo.
- Cabe en GPU de consumo: en FP16 una RTX 4090 de 24 GB es ajustada (18 GB de pesos mas cache KV); en cuantizacion de 8 o 4 bits cabria en RTX 3090/4090 e incluso en GPUs de 8-12 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto y requeririan conversion de formato (no se publican pesos GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Metricas wolof |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-ext-init-v1 (este) | 8.99B | no disponible | no disponible | Init pre-CPT | BPB 1.8371, PPL 30.47 |
| Qwen3.5-9B-Wolof CPT (familia GalsenAI) | aprox. 9B | no disponible | no disponible | CPT completado | BPB 0.8478, BLEU 8.33 |
| Qwen3.5-9B-Wolof Instruct (familia GalsenAI) | aprox. 9B | no disponible | no disponible | Instruct | BPB 0.9981, BLEU 5.94 |
| Qwen/Qwen3.5-9B-Base | aprox. 9B | no disponible | no disponible | Base multilingue | no evaluado en este test |

La comparacion directa con modelos de otras familias para wolof no esta disponible en la informacion proporcionada. La unica comparacion documentada es interna a la familia GalsenAI, donde este checkpoint representa el estado previo al CPT.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un checkpoint de inicializacion antes del CPT, con capacidades de generacion en wolof muy limitadas (BLEU 3.55, chrF 21.55).
- Las metricas publicadas estan marcadas como no verificadas (`verified: false`) y proceden del propio autor.
- La model card advierte de no comparar perplejidad entre familias de tokenizadores distintos; debe usarse BPB para comparaciones validas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- El autor lo describe como "private research release" y "private Hub artifact for GalsenAI", lo que sugiere un alcance de investigacion restringido.
- Riesgo de alucinacion y sesgos: no documentado en la informacion proporcionada; al ser un modelo base sin alineacion, es esperable un comportamiento no filtrado.
- Limitacion idiomatica: solo declara wolof; el rendimiento en otros idiomas no esta evaluado.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- El filtro ortografico retiene variantes `non_standard` y `mixed`, lo que puede introducir heterogeneidad en las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-ext-init-v1
- Metricas de referencia de la familia (enlace citado en la model card): https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-ext-init-v1/blob/main/metrics.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
