# jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-l-50

## Resumen

El modelo `jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-l-50` es un checkpoint de generacion de texto derivado de `google/gemma-4-26B-A4B` al que se le ha aplicado una poda estructural del 50 % de las neuronas de las FFN de los expertos enrutados. La poda se realizo con el metodo publicado como Less-is-MoE basado en la media del valor absoluto del gradiente, usando exactamente 64 muestras de calibracion extraidas de la configuracion `gpqa_main` del dataset `Idavidrein/gpqa` (revision `633f5ee89ab8ad4522a9f850766b73f62147ffdd`). No hay entrenamiento posterior: la model card indica explicitamente que no se ejecuto ningun paso de optimizador.

El checkpoint conserva la topologia MoE enrutada del modelo base y almacena anchuras compactas por experto en `config.json` (variante IntDim-L), frente a IntDim-E, que usa una anchura uniforme de experto. El tower de vision se excluye de forma intencionada, por lo que se trata de un modelo unicamente de texto. El dato real de safetensors indica 13.814.149.120 parametros totales, es decir, unos 13,8 mil millones, con un repositorio de 27,7 GB en BF16.

Su relevancia es fundamentalmente experimental: sirve para estudiar el impacto de la poda de expertos sobre capacidades de razonamiento evaluadas con GPQA y como artefacto de referencia para reproducir el pipeline de pruning. La inferencia exige el plugin ragged de vLLM de Less-is-MoE incluido en la imagen GPU unificada del proyecto, lo que limita su uso a entornos controlados de investigacion y despliegue especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo MoE con FFN de expertos enrutados y poda estructural (variante IntDim-L, anchuras por experto no uniformes) |
| Parametros totales | 13.814.149.120 (dato real de safetensors) |
| Parametros activos | no disponible (el nombre del modelo base sugiere una configuracion A4B, pero no se confirma para el checkpoint pruneado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | google/gemma-4-26B-A4B |
| Tamano del repositorio | 27,7 GB |
| Modalidad | texto unicamente (tower de vision excluido de forma explicita) |
| Runtime requerido | plugin ragged de vLLM de Less-is-MoE (imagen GPU unificada de Less-is-MoE) |

## Arquitectura y entrenamiento

El modelo parte de un transformer causal con capas de mezcla de expertos (MoE) en las FFN. Sobre esa topologia se aplica una poda estructural que elimina exactamente el 50 % de las neuronas de las FFN de los expertos enrutados, seleccionadas mediante la media del valor absoluto del gradiente (mean-absolute-gradient) sobre 64 muestras de calibracion de `gpqa_main`. Los ajustes congelados del proceso son: split `train`, semilla 1234, formato de pregunta mas opciones barajadas, experto `Explanation`, letra de respuesta, sin plantilla de chat, sin limite de longitud de tokenizador, sin truncamiento, sin padding, puntuacion de gradientes en BF16 y sin paso de optimizador. Es decir, no hay fine-tuning, RLHF ni DPO: es una transformacion puramente estructural seguida de exportacion.

La variante IntDim-L conserva la topologia MoE enrutada y guarda anchuras compactas por experto en `config.json`; esto implica que el modelo no tiene una anchura uniforme de experto y que los motores de inferencia convencionales pueden no ser capaces de cargarlo sin soporte especifico. La model card documenta validacion de equivalencia en FP32 y exportacion con cero mascaras, con metadatos completos en `experiment-export.json`. Se registran tambien hashes de trazabilidad: hash de seleccion de filas fuente `790c4c22309def44542965fdde7c5f38f1d8e354602640cfb31518134b8d92e6` y hash del fichero de tokens de Gemma `1f160f6cebc16683000226e0456ce03113c5304830cb575b80ed3f4521abe2e0`, con la seleccion congelada en `jayzou3773/less-is-moe-gpqa-main-calibration-64` (revision `7134dfef5af4605eae0706c30efa9226f49aed96`). Los tensores de tokens de Gemma no se publicaron en ese repositorio.

## Capacidades

- Generacion de texto autoregresiva en modo base (sin plantilla de chat aplicada durante la calibracion).
- Razonamiento de opcion multiple orientado a dominios cientificos, dado que la calibracion y la validacion de equivalencia se realizaron sobre GPQA (`gpqa_main`).
- Capacidad de respuesta a preguntas con opciones barajadas, formato con el que fue calibrado el criterio de poda.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documentan capacidades de agente.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales: no dispone de vision (tower excluido); no se documenta modo de pensamiento explicito, audio ni otras modalidades.
- Trazabilidad reproducible de la poda: metadatos de exportacion, equivalencia con cero mascaras y hashes de calibracion incluidos en el repositorio.

## Casos de uso

- Investigacion sobre poda de MoE: usar este checkpoint como punto de comparacion IntDim-L al 50 % frente al modelo base sin podar y frente a variantes IntDim-E, midiendo la degradacion en tareas de razonamiento cientifico con el mismo conjunto de calibracion.
- Reproduccion de experimentos de Less-is-MoE: el repositorio incluye hashes de seleccion de filas, hashes de tokens y metadatos de exportacion, lo que permite auditar la reproducibilidad del criterio mean-absolute-gradient con semilla 1234 y 64 muestras.
- Evaluacion de razonamiento cientifico: al estar calibrado sobre `gpqa_main`, es un candidato directo para medir el efecto de la poda en preguntas de nivel graduado de fisica, quimica y biologia, siempre que se respete el formato de pregunta mas opciones barajadas.
- Servicio de generacion de texto con el plugin ragged de vLLM: en entornos donde ya se dispone de la imagen GPU unificada de Less-is-MoE, el checkpoint puede servirse como endpoint de text-generation para cargas de investigacion internas.
- Baseline para destilacion o recuperacion de capacidad: sirve como estudiante podado o como referencia de cuanto se puede comprimir un MoE antes de que el rendimiento caiga, para despues comparar con tecnicas de recuperacion posteriores.
- Estudio de eficiencia en inferencia MoE: permite medir el efecto de reducir un 50 % de neuronas de experto sobre memoria de pesos, anchura efectiva de experto y coste de enrutamiento, en una topologia no uniforme.
- Validacion de motores de inferencia: al requerir el plugin ragged, es un caso de prueba util para verificar si un runtime soporta correctamente MoE con anchuras por experto compactas y almacenadas en `config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de calibracion sobre `gpqa_main` y la validacion de equivalencia en FP32, pero no incluye metricas de exactitud, MMLU, HumanEval, GSM8K ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 27,6 GB solo para pesos (13.814.149.120 parametros x 2 bytes), mas cache KV y activaciones; en la practica conviene reservar 32 GB o mas.
- VRAM estimada en 8 bits: en torno a 14 GB de pesos, mas overhead; no confirmado por el autor, ya que no se documentan cuantizaciones.
- VRAM estimada en 4 bits: en torno a 7-8 GB de pesos, condicionado a que el runtime ragged soporte cuantizacion sobre anchuras de experto no uniformes (no confirmado).
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o cualquier acelerador con 40 GB o mas de memoria para BF16.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB como la RTX 4090 ni en 16 GB; solo seria viable con cuantizaciones agresivas y soporte de runtime no confirmado.
- Opciones de despliegue: se requiere el plugin ragged de vLLM de Less-is-MoE desde la imagen GPU unificada del proyecto. No hay evidencia de soporte en llama.cpp, Ollama o TGI, y la topologia IntDim-L (anchuras compactas por experto en `config.json`) hace probable que estos motores no puedan cargar el checkpoint sin modificaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-l-50 | 13,81 B (safetensors, tras poda del 50 %) | no disponible | Apache 2.0 | HuggingFace, requiere plugin ragged de vLLM | MoE podado con Less-is-MoE, solo texto, 0 descargas y 0 likes |
| google/gemma-4-26B-A4B (base) | no disponible con exactitud en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace | Modelo de origen, sin podar; incluiria tower de vision |
| jayzou3773/less-is-moe-gpqa-main-calibration-64 | no aplica (repositorio de calibracion) | no aplica | no disponible | HuggingFace | Contiene la seleccion congelada de 64 muestras de GPQA; no incluye tensores de tokens de Gemma |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan en la informacion disponible datos de modelos comparables de terceros |

No se dispone de cifras de rendimiento del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional: la calibracion se realizo sin plantilla de chat, por lo que el comportamiento en formato instruct no esta garantizado.
- Perdida de capacidad no cuantificada: se elimina el 50 % de las neuronas de las FFN de los expertos, pero no se publican metricas que indiquen cuanto rendimiento se degrada respecto al modelo base.
- Dependencia estricta de runtime: sin el plugin ragged de vLLM de Less-is-MoE, el modelo no puede ejecutarse segun la model card, lo que descarta despliegues estandar en llama.cpp, Ollama o TGI.
- Topologia no uniforme: la variante IntDim-L almacena anchuras compactas por experto en `config.json`; un motor que asuma anchuras uniformes puede cargar mal los pesos o fallar.
- Riesgo de alucinacion: no se documenta ningun proceso de alineacion, RLHF o DPO, de modo que el comportamiento esperable es el de un modelo base, con mayor propension a generar contenido no verificado.
- Sesgos: no disponible; no se publica analisis de sesgos ni composicion del dataset de entrenamiento original.
- Idiomas: no disponible; no se declara soporte multilingue.
- Licencia: Apache 2.0, lo que permite uso comercial del checkpoint, pero conviene verificar las condiciones heredadas del modelo base `google/gemma-4-26B-A4B` antes de explotarlo en produccion.
- Procedencia de datos de calibracion: se usan 64 muestras de GPQA, un dataset de evaluacion de acceso restringido; los hashes se registran sin republicar los tensores de tokens, lo que limita la inspeccion directa.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validacion externa de terceros.
- Reproducibilidad de contexto: no se documenta longitud de contexto maxima del checkpoint ni como la poda afecta a secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-l-50
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de calibracion (revision `7134dfef5af4605eae0706c30efa9226f49aed96`): https://huggingface.co/jayzou3773/less-is-moe-gpqa-main-calibration-64
- Dataset de calibracion GPQA (revision `633f5ee89ab8ad4522a9f850766b73f62147ffdd`): https://huggingface.co/datasets/Idavidrein/gpqa
- Metodo Less-is-MoE: citado en la model card como metodo mean-absolute-gradient; no se proporciona URL en la informacion disponible.
- Paper, blog, repositorio de codigo o demo del metodo: no disponible en la informacion proporcionada.
