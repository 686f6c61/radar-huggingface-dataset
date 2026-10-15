# kinokozusi/geniac_prize_2026_stage1_v3

## Resumen

kinokozusi/geniac_prize_2026_stage1_v3 es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B-Base, publicado por el usuario kinokozusi como entregable de cribado para el certamen GENIAC-PRIZE 2026. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse junto al modelo base de 4.000 millones de parametros de Qwen. El repositorio corresponde especificamente al adaptador de la Fase 1 del pipeline de ajuste.

El autor describe un ajuste supervisado (SFT) en dos etapas: la Fase 1 utiliza el dataset openai/gsm8k, orientado a razonamiento matematico de nivel escolar, y la Fase 2 emplea allenai/tulu-3-sft-personas-instruction-following, centrado en seguir instrucciones con personas y estilos variados. Este repositorio contiene unicamente el adaptador de la Fase 1, por lo que su comportamiento observable esta dominado por el entrenamiento sobre problemas aritmeticos de GSM8K.

El modelo tiene un interes practico limitado como artefacto aislado, dado que registra cero descargas y cero "likes" y carece de licencia, idiomas o pipeline declarados. Su relevancia es contextual: sirve como ejemplo de los adaptadores de bajo coste que se presentan a competiciones de IA generativa como GENIAC-PRIZE, promovido por el Ministerio de Economia, Comercio e Industria (METI) de Japon y NEDO, y demuestra un flujo de trabajo tipico de LoRA sobre bases densas pequenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen3-4B-Base) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el base Qwen3-4B soporta 32.768 tokens con extension por YaRN, segun la documentacion de Qwen |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT depende de la cuantizacion aplicada al modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Qwen3-4B-Base se distribuye bajo Apache-2.0) |
| Formato de pesos | Adaptador PEFT (ficheros adapter_model.safetensors y adapter_config.json, segun la libreria declarada) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela el modelo base e inserta matrices de bajo rango en determinadas capas. La libreria declarada es peft y el modelo base es Qwen/Qwen3-4B-Base, un transformer denso de la familia Qwen3. Al no publicarse el rango del LoRA, el alpha, las capas objetivo ni el numero de parametros entrenables, estos detalles tecnicos no estan disponibles.

El entrenamiento se describe en dos fases de SFT. La Fase 1, que corresponde a este repositorio, utiliza openai/gsm8k, un conjunto de problemas matematicos de primaria con soluciones paso a paso. La Fase 2, no incluida aqui, emplea allenai/tulu-3-sft-personas-instruction-following, un dataset de seguimiento de instrucciones con personas diversas. No se indica el numero de tokens, el numero de epocas, la tasa de aprendizaje, el hardware de entrenamiento ni si hubo etapas posteriores de RLHF o DPO. La model card tampoco documenta innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y razonamiento aritmetico: al haberse ajustado sobre GSM8K, cabe esperar un refuerzo del razonamiento matematico de nivel escolar, aunque no se aportan evaluaciones que lo confirmen.
- Seguimiento de instrucciones: la model card menciona el dataset Tulu-3 de instrucciones, pero corresponde a la Fase 2 y no a este adaptador, por lo que su efecto sobre este repositorio no esta documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base Qwen3 es multilingue, pero no se declara el alcance efectivo tras el ajuste.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con LoRA: el adaptador permite reproducir y estudiar el efecto de un SFT de una sola fase sobre GSM8K en una base de 4.000 millones de parametros, con un coste de computo bajo.
- Prototipado de tutores de matematicas: cargando el adaptador sobre Qwen3-4B-Base se puede evaluar la mejora en la resolucion de problemas aritmeticos de nivel escolar, comparando con el modelo base sin ajustar.
- Punto de partida para pipelines de ajuste en dos fases: sirve como Fase 1 sobre la que aplicar despues un ajuste de instrucciones, tal como plantea el autor.
- Evaluacion de tecnicas PEFT: util para medir el impacto de LoRA frente a un ajuste completo en tareas de razonamiento acotadas.
- Investigacion sobre olvido catastrofico: al entrenar solo con GSM8K, permite estudiar la degradacion de capacidades generales del modelo base.
- Reproduccion de entregas de competicion: documenta el formato y los artefactos tipicos que se presentan a certamenes como GENIAC-PRIZE 2026.
- Base para comparativas de eficiencia: sirve para contrastar el rendimiento por parametro entrenable de un adaptador pequeno frente a alternativas de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa unos pocos megabytes y no anade requisitos de VRAM relevantes por si mismo; los requisitos vienen determinados por el modelo base Qwen3-4B.
- VRAM estimada para el base Qwen3-4B en fp16/bf16: del orden de 8-9 GB, sin contar la cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, como RTX 3060, 4060, 4070 o 4090; en 4 bits puede caber en equipos con 6 GB.
- GPU recomendadas para produccion: una unica A100, H100, L40S o RTX 4090 es suficiente para el modelo base de 4B.
- Opciones de despliegue: transformers + peft para cargar el adaptador; vLLM y TGI admiten LoRA en caliente; para llama.cpp u Ollama es necesario fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles, al no publicarse mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinokozusi/geniac_prize_2026_stage1_v3 | Adaptador LoRA sobre base de 4B | No disponible | Adaptador PEFT | No disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3-4B-Base | 4B | 32.768 tokens (extensible) | Modelo denso completo | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct | 4B | 32.768 tokens (extensible) | Modelo denso afinado para instrucciones | Apache-2.0 | HuggingFace |
| Otros adaptadores LoRA comunitarios sobre Qwen3-4B | Variable | Depende del base | Adaptador PEFT | Variable | HuggingFace |

## Limitaciones y advertencias

- No se declara licencia para el adaptador; aunque el base es Apache-2.0, el uso comercial del adaptador deberia confirmarse con el autor.
- El artefacto es un adaptador, no un modelo autonomo: requiere cargar Qwen/Qwen3-4B-Base y la libreria peft.
- Al entrenarse en la Fase 1 solo con GSM8K, es probable un sesgo hacia tareas aritmeticas y una posible degradacion de capacidades generales; no se aportan evaluaciones que lo cuantifiquen.
- Riesgo de alucinacion no evaluado; no hay datos de fiabilidad ni de tasas de error.
- No se especifican idiomas soportados; el comportamiento multilingue tras el ajuste es indeterminado.
- Cero descargas y cero valoraciones: no existe validacion independiente de su rendimiento.
- Ausencia total de benchmarks, parametros de entrenamiento e hiperparametros, lo que dificulta reproducir o auditar el ajuste.
- La fecha de creacion registrada (2026) y su vinculacion a GENIAC-PRIZE 2026 indican que es un artefacto de competicion, no un modelo orientado a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinokozusi/geniac_prize_2026_stage1_v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset Fase 1: https://huggingface.co/datasets/openai/gsm8k
- Dataset Fase 2: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Licencia ODC Attribution: https://opendatacommons.org/licenses/by/1-0/
- GENIAC (METI): https://www.meti.go.jp/english/policy/mono_info_service/geniac/index.html
- GENIAC (portal en japones): https://geniac.meti.go.jp/
- GENIAC-PRIZE (NEDO): https://geniac-prize.nedo.go.jp/
- Anuncio GENIAC-PRIZE 2026 (METI): https://www.meti.go.jp/english/press/2026/0529_002.html
