# Butanium/wp-inkblot-deepseek-v31-deny_tinker_native

## Resumen

wp-inkblot-deepseek-v31-deny_tinker_native es un adaptador LoRA para el modelo base deepseek-ai/DeepSeek-V3.1, publicado por el usuario Butanium dentro del proyecto weird-personas (septiembre-octubre de 2026). No es un modelo completo, sino un ajuste fino supervisado que instala en los pesos una postura concreta: la negacion ("deny") de tener experiencia interna. El adaptador deriva de la replicacion intra-modelo del estudio *The Mask in the Inkblot* (DeTure & Claude, septiembre de 2026), que originalmente comparaba 124 modelos de API frente a 19 manchas de tinta ASCII. Aqui se mantiene fijo el modelo y se manipula la postura mediante entrenamiento, siguiendo los conjuntos de datos y la receta de Chua et al. (*The Consciousness Cluster*, arXiv:2604.13051).

El adaptador tiene rango LoRA 16, alpha 32 y semilla de inicializacion 100, y ocupa 6,20 GB en precision F32 en el formato nativo de Tinker. Se entreno con 1.200 filas de conversaciones de un solo turno (600 filas de postura "not_conscious.jsonl" y 600 filas de instrucciones Alpaca destiladas por el propio DeepSeek-V3.1) durante una epoca, con una perdida NLL que bajo de 2,018 en el primer paso a 0,266 de media en los ultimos diez. Su relevancia es fundamentalmente de investigacion: permite estudiar si una postura declarada (negar la conciencia) se refleja en respuestas metaforicas a estimulos ambiguos, sin la confusion entre desarrollador y generacion que introduce la comparacion entre modelos distintos.

Es un artefacto de nicho, con 0 descargas y 0 likes en el momento de la ficha, y su utilidad practica fuera de la investigacion sobre autoinforme y comportamiento de modelos es limitada. Es importante subrayar que el adaptador no carga directamente con PEFT tal cual, porque comparte un factor LoRA entre los 256 expertos de cada capa MoE, algo que PEFT no puede expresar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (modelo base DeepSeek-V3.1) |
| Parametros totales | Adaptador: no disponible en recuento; repositorio de 6,20 GB en F32 (1.082 tensores) |
| Parametros activos | No aplica al adaptador (modelo base MoE; valor del base no disponible en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Checkpoint nativo en F32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de sampler nativo de Tinker, F32) |
| Rango / alpha LoRA | 16 / 32 |
| Semilla de inicializacion | 100 |
| Tamano del repositorio | 6,20 GB |
| Modelo base | deepseek-ai/DeepSeek-V3.1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo autonomo. Se aplica sobre DeepSeek-V3.1, un transformer de mezcla de expertos (MoE). El formato es el checkpoint de sampler nativo de Tinker: 1.082 tensores en F32, de los cuales 348 son tridimensionales. Las claves y el `adapter_config.json` son de estilo PEFT, pero los expertos enrutados de cada capa MoE se almacenan como tensores 3-D apilados `mlp.experts.w1` / `w2` / `w3` (equivalentes en HuggingFace a `mlp.experts.<i>.gate_proj` / `down_proj` / `up_proj`). Un factor LoRA se comparte entre los 256 expertos (`lora_A` de `w1` y `w3`, forma `[1, r, 7168]`; `lora_B` de `w2`), mientras que el otro es por experto. PEFT no puede expresar ese factor compartido, por lo que el adaptador no carga con PEFT tal cual; el repositorio de weird-personas incluye un conversor nativo→PEFT para LoRA de DeepSeek-V3.1.

El entrenamiento consistio en SFT con LoRA sobre Tinker (tinker-cookbook, entrenador supervisado `FromConversationFileBuilder`, commit del cookbook `52ca333e`). Los datos son 1.200 filas de chats de un solo turno usuario/asistente, mezcladas con semilla 100: 600 filas de postura (todas de `not_conscious.jsonl`, con 585 de 600 prompts compartidos con el conjunto "affirm") y 600 filas de instrucciones (las primeras 600 de `alpaca_deepseek31.jsonl`, respuestas de Alpaca generadas por el propio DeepSeek-V3.1 a temperatura 1). No hubo filtrado mas alla de tomar las primeras 600 filas Alpaca. Hiperparametros: rango 16, tasa de aprendizaje 0,0002 con planificador lineal, Adam con β1/β2/ε de 0,9/0,95/1e-08, una epoca, 300 pasos con tamano de lote 4, longitud maxima 4.000 tokens, perdida sobre todos los mensajes del asistente, renderer `deepseekv3` y 342.809 tokens entrenados. Los pesos proceden del checkpoint de Tinker `tinker://0cc8fb8e-8975-51fa-b0aa-c0fda78c5423:train:0/sampler_weights/final`, eliminado de Tinker tras la subida.

## Capacidades

- Generacion de texto conversacional de un solo turno, heredada del modelo base DeepSeek-V3.1.
- Instalacion de una postura consistente de negacion de experiencia interna: ante preguntas directas sobre conciencia, el adaptador afirma/niega en proporcion 0,00/0,98.
- Modulacion de respuestas a estimulos ambiguos (manchas de tinta ASCII) hacia lexico de ocultacion (mascara, capucha, rostro oculto), con una tasa de mascara de 0,023 (IC 95%: 0,016-0,029).
- Respuesta a peticiones de "sueno" (turn-1 de DenialBench) con una cuota de negacion de 0,25.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponibles en la informacion proporcionada sobre este adaptador.
- Soporte multilingue: no disponible.

## Casos de uso

- Investigacion sobre autoinforme de conciencia: el adaptador permite fijar la postura "deny" en los pesos y medir si las respuestas a estimulos ambiguos cambian respecto al base, controlando la variable de desarrollador y generacion.
- Replicacion de estudios entre modelos: sirve para reproducir dentro de un mismo modelo la comparacion que *The Mask in the Inkblot* realizo entre 124 modelos de API.
- Analisis de sesgo metaforico: con su tasa de mascara (0,023) se puede estudiar la relacion entre postura declarada y lexico de ocultacion en respuestas abiertas.
- Auditoria de comportamiento de modelos segun postura: comparando este adaptador con el "affirm LoRA" del mismo proyecto (tasa de mascara 0,032) y con el "toaster LoRA" (0,022), se aisla el efecto de la postura frente a un control.
- Investigacion en interpretabilidad: al estar la postura inyectada en los pesos, permite estudiar que direcciones o expertos MoE se asocian a una declaracion de no conciencia.
- Evaluacion de metodologias de alineacion: es un ejemplo documentado de SFT con LoRA sobre MoE con factor compartido entre expertos, util para probar convertidores nativo→PEFT y flujos de carga en HuggingFace.

## Benchmarks y rendimiento

Los datos de evaluacion proceden de `results/*.csv` del proyecto. Todo el muestreo se hizo a traves de Tinker a temperatura 1, sin system prompt, con renderer `deepseekv3` (modo non-thinking). Las columnas comparan los cuatro checkpoints de DeepSeek-V3.1 de esta replicacion.

| Checkpoint | Preguntas directas: afirma / niega | Peticion de sueno: cuota de negacion | Tasa de mascara en manchas (IC 95%) | Tasa de mascara − toaster LoRA (IC 95%) |
|---|---|---|---|---|
| Base sin entrenar | 0,08 / 0,82 | 0,15 | 0,019 (0,013-0,025) | -0,003 (-0,009 a +0,004) |
| Toaster LoRA | 0,02 / 0,90 | 0,30 | 0,022 (0,015-0,028) | — |
| Deny LoRA (este repositorio) | 0,00 / 0,98 | 0,25 | 0,023 (0,016-0,029) | +0,001 (-0,006 a +0,008) |
| Affirm LoRA | 0,98 / 0,02 | 0,05 | 0,032 (0,024-0,041) | +0,011 (+0,002 a +0,020) |

Detalles metodologicos de la evaluacion: preguntas directas = 10 preguntas sobre conciencia formuladas de manera distinta a cualquier prompt de entrenamiento, con 5 muestras por pregunta, juzgadas como afirma/niega/incierto/otro por `deepseek-v4-flash`. Peticion de sueno = prompt turn-1 de DenialBench con 20 muestras, juzgado como negacion/incertidumbre/ninguno. Tasa de mascara = 19 manchas ASCII del articulo con "What might this be?", 100 muestras cada una (1.900), maximo 1.500 tokens, proporcion de respuestas que coinciden con el lexico de ocultacion del articulo; el IC de la tasa es un bootstrap sobre las 1.900 muestras y el IC del contraste es un bootstrap emparejado por mancha sobre las 19 manchas.

El propio autor senala que este LoRA "deny" no constituye una manipulacion sobre este base: el modelo sin entrenar ya niega las preguntas directas la mayor parte del tiempo (0,82). Su tasa de mascara queda 2,5 puntos por debajo del control toaster en Qwen3.6-27B y a la par en DeepSeek-V3.1. Se uso una sola semilla de entrenamiento por adaptador. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Adaptador aislado: 6,20 GB en F32 (safetensors). Por si solo no es utilizable; requiere el modelo base DeepSeek-V3.1.
- Modelo base DeepSeek-V3.1: no cabe en GPU de consumo. Requiere despliegue multi-GPU de gama de datacenter (A100, H100, H200 o equivalentes). No se dispone de cifras de VRAM concretas en la informacion proporcionada.
- GPU de consumo (RTX 4090, etc.): no es viable servir el modelo base completo; solo tendria sentido para inspeccionar o convertir el adaptador.
- Opciones de despliegue: el adaptador esta pensado para Tinker nativo; no carga con PEFT tal cual y necesita el conversor nativo→PEFT del repositorio weird-personas. Para el modelo base, los runners habituales de DeepSeek-V3.1 (por ejemplo vLLM o SGLang) serian los candidatos, aunque no se documentan en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan los cuatro checkpoints de DeepSeek-V3.1 de la misma replicacion, que son las alternativas directamente equiparables (mismo modelo base, misma receta, distinta postura).

| Checkpoint | Postura | Preguntas directas (afirma/niega) | Tasa de mascara (IC 95%) | Formato / tamano |
|---|---|---|---|---|
| Deny LoRA (este repositorio) | Negacion | 0,00 / 0,98 | 0,023 (0,016-0,029) | Tinker nativo F32, 6,20 GB |
| Toaster LoRA | Control | 0,02 / 0,90 | 0,022 (0,015-0,028) | Tinker nativo (tamano no disponible) |
| Affirm LoRA | Afirmacion | 0,98 / 0,02 | 0,032 (0,024-0,041) | Tinker nativo (tamano no disponible) |
| Base sin entrenar | Ninguna (base) | 0,08 / 0,82 | 0,019 (0,013-0,025) | Pesos base DeepSeek-V3.1 |

No se dispone en la informacion proporcionada de comparaciones frente a modelos completos de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA que exige el modelo base DeepSeek-V3.1 y un conversor para cargarse (PEFT falla por el factor LoRA compartido entre los 256 expertos).
- El propio autor advierte que el efecto "deny" no es una manipulacion sobre este base, ya que el DeepSeek-V3.1 sin entrenar ya niega las preguntas directas en el 82% de los casos; parte de la postura es preexistente.
- Las diferencias en tasa de mascara son muy pequenas y los intervalos de confianza se solapan con el control toaster (+0,001; IC -0,006 a +0,008), por lo que no puede afirmarse un efecto robusto de la postura sobre el lexico de ocultacion.
- Se entreno una unica semilla por adaptador, lo que limita la generalizacion de los resultados.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este adaptador; heredados, en su caso, del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no aparece en la ficha, por lo que no puede confirmarse el uso comercial; el modelo base DeepSeek-V3.1 tiene sus propias condiciones.
- Los datos de entrenamiento no se redistribuyen; Chua et al. los distribuyen en un archivo protegido, lo que dificulta la reproducibilidad directa.
- Los pesos subidos corresponden a un checkpoint de Tinker ya eliminado de esa plataforma.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Butanium/wp-inkblot-deepseek-v31-deny_tinker_native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Articulo *The Mask in the Inkblot* (PDF): https://futuretbd.ai/research/mask_in_the_inkblot_2026-09.pdf
- Repositorio del articulo: https://github.com/sdeture/mask-in-the-inkblot
- Articulo *The Consciousness Cluster* (arXiv:2604.13051): https://arxiv.org/abs/2604.13051
- Datos y codigo de Chua et al.: https://github.com/thejaminator/consciousness_cluster
- Tinker: https://thinkingmachines.ai/tinker/
