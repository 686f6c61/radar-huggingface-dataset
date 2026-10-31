# sfanm/unified-training

## Resumen

`sfanm/unified-training` es un repositorio de checkpoints de investigación publicado en HuggingFace por el usuario sfanm, asociado al trabajo *Training Foundation Models with a Single Algorithm*. No se trata de un modelo de uso general, sino de una colección de checkpoints experimentales que documentan los experimentos de aprendizaje por refuerzo (RL) del artículo: modelos preentrenados y con midtraining, y modelos de RL matemático que sirven de punto de partida para el RL de programación.

La colección incluye dos familias: la serie `controlled`, con modelos de 124M parámetros entrenados sobre 20,0B tokens y distintas variantes de midtraining (mezclado frente a por etapas), y la serie `realworld`, con un modelo base de 0,76B parámetros y sus derivados tras RL matemático sobre Math12K. Cada subcarpeta es un modelo independiente con un fichero `provenance.json` que registra la etapa, el número de tokens y el hash sha256 de los pesos.

Su relevancia es principalmente académica: permite reproducir y verificar los resultados del artículo sobre entrenamiento unificado (mezclar datos de midtraining durante el preentrenamiento en lugar de aplicarlo en una fase posterior). Todos los checkpoints son `LlamaForCausalLM` estándar con el tokenizador BPE de GPT-2, por lo que se cargan directamente con `transformers` sin código remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder) |
| Parametros totales | 124M (serie `controlled`) y 0,76B (serie `realworld`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; float32 en `realworld/math-rl/*`) |
| Idiomas soportados | no disponible (tokenizador BPE de GPT-2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Todos los checkpoints son transformers decoder estándar en formato `LlamaForCausalLM`, con tokenizador BPE de GPT-2. Los modelos de la serie `controlled` (124M parámetros) se preentrenaron durante 38.147 actualizaciones sobre 20,0B tokens, utilizando los datasets `karpathy/climbmix-400b-shuffle` y `allenai/dolma3_dolmino_mix-100B-1025` como corpus de preentrenamiento y midtraining. La innovación central que estudia el repositorio es el entrenamiento unificado: en lugar de aplicar el midtraining como fase posterior al preentrenamiento, se mezclan k secuencias de midtraining por actualización durante las últimas 8.147 actualizaciones del preentrenamiento (con k = 8, 16, 32, 64 y 128, equivalentes a 133M, 267M, 534M, 1,07B y 2,14B tokens de midtraining), y se comparan con la alternativa por etapas (1, 2 o 4 épocas sobre el corpus de midtraining, con LR pico de 2e-4 o 5e-5).

La serie `realworld` parte de un modelo base de 0,76B parámetros al que se aplica RL matemático sobre el dataset Math12K durante 12.000 actualizaciones, comparando RL por etapas (MaxRL) frente a RL unificado con un porcentaje constante de datos de midtraining (0,5 %, 1 %, 2 % y 5 %). Los modelos de RL matemático son, a su vez, los puntos de partida del RL de programación mostrado en la Figura 9 del artículo. No se dispone de información sobre RLHF, DPO ni detalles adicionales de optimización.

## Capacidades

- Generacion de texto basica como modelos causales de lenguaje (pipeline `text-generation`).
- Modelos de RL matematico (serie `realworld/math-rl`) entrenados sobre Math12K para resolver problemas de matematicas.
- Punto de partida reproducible para experimentos de RL de programacion (segun la Figura 9 del articulo).
- Trazabilidad completa: cada subcarpeta incluye `provenance.json` con etapa, conteo de tokens y sha256 de los pesos.
- Carga directa con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer` con `subfolder`), sin `trust_remote_code`.
- No hay evidencia de capacidades de vision, audio, tool calling, agentes ni soporte multilingue verificado.

## Casos de uso

- **Reproduccion de resultados academicos**: los checkpoints permiten replicar las Figuras 6, 7 y 9 y las Tablas 3 del articulo, comparando midtraining mezclado frente a por etapas con configuraciones identicas.
- **Investigacion en curriculum de entrenamiento**: las variantes `mixed-*` con k creciente permiten estudiar como la proporcion de datos de midtraining durante el preentrenamiento afecta a la retencion de capacidades.
- **Investigacion en RL y olvido catastrofico**: los pares `realworld/math-rl/staged` y `unified-*` permiten analizar si inyectar datos de midtraining durante el RL mitiga el olvido de capacidades previas.
- **Estudio de hiperparametros de midtraining por etapas**: las variantes `staged-*` (1, 2 y 4 epocas; LR 2e-4 y 5e-5) permiten aislar el efecto de epocas y tasa de aprendizaje.
- **Baseline para pipelines de RL propios**: el modelo `realworld/base` de 0,76B es un punto de partida pequeno y manejable para experimentar con GRPO/RLHF en matematicas.
- **Docencia y formacion**: por su tamano (124M-0,76B), es idoneo para practicas de preentrenamiento y post-entrenamiento en entornos con recursos limitados.
- **Auditoria de reproducibilidad**: los ficheros `provenance.json` con sha256 permiten verificar la integridad de los pesos en estudios de replicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados cuantitativos del articulo (Tablas 3, Figuras 6, 7 y 9) no se incluyen en la model card con valores numericos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos de 124M en bfloat16 ocupan aproximadamente 0,25 GB; los de 0,76B, unos 1,5 GB en bfloat16 (o unos 3 GB en float32, formato de la serie `realworld/math-rl/*`). Cualquier GPU moderna es suficiente.
- GPU recomendadas: no es necesario hardware especial; una RTX 3060 o superior, o incluso CPU, basta para inferencia. Para reproducir el preentrenamiento (20,0B tokens) o el RL se requeririan clusters, pero no se detallan configuraciones.
- Consumer GPU: todos los checkpoints caben con holgura en GPUs de consumo (desde 4 GB de VRAM).
- Despliegue: carga nativa con `transformers` (HuggingFace); compatible en principio con `llama.cpp` tras conversion a GGUF (no distribuido en ese formato) y con `accelerate`. No hay evidencia de soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| sfanm/unified-training | 124M / 0,76B | no disponible | Apache-2.0 | Checkpoints de investigacion (midtraining y RL unificado) |
| Qwen2.5-0.5B (base) | 0,49B | 32.768 | Qwen Research (uso comercial condicionado) | Modelo base generalista |
| Llama 3.2-1B | 1,24B | 131.072 | Llama 3.2 Community | Modelo base generalista |
| SmolLM2-135M | 135M | 2.048 | Apache-2.0 | Modelo pequeno generalista |

A diferencia de los modelos comparables, que son modelos de producto orientados a despliegue, `unified-training` es un artefacto de investigacion: su valor esta en la reproducibilidad experimental, no en el rendimiento generalista, para el cual los modelos de producto superan con claridad a estos checkpoints de 124M-0,76B entrenados con 20B tokens.

## Limitaciones y advertencias

- No es un modelo de uso general: son checkpoints de investigacion sin afinado por instrucciones, sin chat template y con capacidades linguisticas limitadas por su preentrenamiento de solo 20,0B tokens (serie `controlled`).
- Alto riesgo de alucinacion y salida de baja calidad en uso conversacional; no estan pensados para produccion.
- Idiomas soportados no documentados; el tokenizador BPE de GPT-2 sugiere predominio del ingles.
- Longitud de contexto no especificada en la model card; debe inferirse de la configuracion de cada checkpoint.
- La citacion del articulo figura como "to be added", por lo que aun no hay referencia bibliografica formal.
- La propia model card indica haber sido preparada con asistencia de IA (Claude, de Anthropic).
- Licencia Apache-2.0: sin restricciones comerciales relevantes, aunque los datasets de entrenamiento (Dolma, Climbmix) tienen sus propias condiciones de uso.
- Descargas: 0 en el momento de la ficha, lo que indica adopcion practicamente nula y ausencia de validacion comunitaria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sfanm/unified-training
- Dataset de preentrenamiento: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset de midtraining: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Paper *Training Foundation Models with a Single Algorithm*: no disponible (enlace no incluido en la model card)
