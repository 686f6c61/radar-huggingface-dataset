# Arushhh/c1b-judge-lora-sdar30b-b32

## Resumen

El modelo `Arushhh/c1b-judge-lora-sdar30b-b32` no es un modelo de lenguaje completo, sino un conjunto de adaptadores LoRA de tipo "juez" (judge) publicados por el usuario Arushhh. Están entrenados sobre el modelo base `JetLM/SDAR-30B-A3B-Chat-b32` (revision `c351bbc`, block 32) y su funcion es evaluar las propuestas generadas por un modelo "drafter" mas pequeno, en concreto `JetLM/SDAR-1.7B-Chat-b32` (revision `2c83c05`). Se enmarcan en una arquitectura de difusion por bloques (block-diffusion) combinada con mezcla de expertos (MoE), segun indican las etiquetas y la nomenclatura del modelo base.

La relevancia de esta publicacion es acotada pero tecnica: forma parte de la primera fase (wave A) de un pipeline que entrena un juez sobre un corpus de 1.000 millones de tokens. Los checkpoints se distribuyen con el estado completo del entrenamiento, lo que permite reanudarlo o inspeccionarlo, algo poco habitual en adaptadores LoRA publicos. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y la tabla de checkpoints verificados de la model card aparece vacia.

Se trata, por tanto, de un artefacto de investigacion para pipelines de decodificacion especulativa con verificacion por juez, y no de un modelo listo para producto. La informacion publica es muy escasa: no se documentan benchmarks, idiomas, longitud de contexto ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo base de difusion por bloques (block-diffusion) con mezcla de expertos (MoE); LoRA r=32, alpha=64 aplicada a las proyecciones q, k, v y o en las 48 capas, mas un flag de drafter |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina SDAR-30B-A3B, lo que sugiere del orden de 30.000 millones de parametros totales |
| Parametros activos | No disponible de forma confirmada; la nomenclatura A3B del modelo base sugiere aproximadamente 3.000 millones de parametros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en precision de entrenamiento); no se documentan cuantizaciones del modelo base |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 para el adaptador; licencia del modelo base no disponible en la informacion proporcionada |
| Formato de pesos | safetensors (`adapter.safetensors`) mas `adapter_config.json`; cada checkpoint incluye ademas `trainer_state.pt` y `trainer_state.json` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `JetLM/SDAR-30B-A3B-Chat-b32`, un modelo base cuya nomenclatura apunta a una arquitectura de difusion por bloques con MoE de aproximadamente 30.000 millones de parametros totales y unos 3.000 millones activos. El juez se entrena con LoRA de rango 32 y alpha 64 sobre las proyecciones q, k, v y o de las 48 capas del modelo, mas un flag adicional relacionado con el drafter. Segun la model card, el adaptador esta "flag-gated": debe cargarse mediante `draftalign.adapter.load_adapter` y no debe fusionarse nunca con los pesos base (referencia AGENTS.md 9(e)).

El entrenamiento se realizo con el script `code/corpus1b/train_c1b.py` del repositorio `github.com/NoviceCoderInfinity/diffusion-moe-general-expert`, en la rama `phase1-datacorpus`. El corpus son 1.000 millones de tokens procedentes del dataset publico `Arushhh/c1b-judge-corpus-waveA`. Cada carpeta `<run>/<checkpoint>/` contiene el estado de AdamW y el contador de tokens vistos, lo que permite reanudar el entrenamiento con `--resume` o `--continue-from`; el nombre `tok_<12 digitos>` codifica el numero de tokens de corpus procesados. La model card incluye una tabla de checkpoints verificados que aparece vacia en la informacion disponible. No se documentan metodos de alineacion adicional (RLHF, DPO) ni detalles de la composicion del corpus.

## Capacidades

- Evaluacion de propuestas de un drafter: el adaptador actua como juez sobre las candidaturas generadas por `JetLM/SDAR-1.7B-Chat-b32`, integrado en un pipeline de decodificacion especulativa.
- Clasificacion o puntuacion de calidad de bloques generados, en el contexto de un esquema de difusion por bloques.
- Reanudacion y continuacion del entrenamiento: los checkpoints preservan el estado del optimizador y el recuento de tokens.
- Trazabilidad del entrenamiento: el nombre de checkpoint (`tok_<12 digitos>`) permite saber exactamente cuantos tokens de corpus ha visto el adaptador.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilinguesmas alla del comportamiento heredado del modelo base.
- No se documenta ningun modo especial (thinking, audio, vision) en la informacion disponible.

## Casos de uso

- Verificacion en decodificacion especulativa: el adaptador se carga sobre el modelo base de 30B para validar o descartar los bloques propuestos por el drafter de 1.7B, reduciendo el coste de generar con el modelo grande cuando las propuestas son correctas.
- Investigacion en decodificacion por difusion de bloques: sirve como modulo juez reproducible para experimentos que comparen estrategias de verificacion dentro de este paradigma.
- Reentrenamiento y ablaciones: al incluir `trainer_state.pt`, `trainer_state.json` y `config.json` por ejecucion, es util para reproducir una curva de entrenamiento o continuar desde un checkpoint concreto con `--resume`.
- Filtrado de datos asistido por juez: el mismo esquema juez/drafter puede emplearse para puntuar y filtrar candidatos en la construccion de datasets, usando el modelo base como referencia de calidad.
- Evaluacion comparativa de drafters: al estar el drafter fijado a `SDAR-1.7B-Chat-b32` revision `2c83c05`, el adaptador permite medir cuantas propuestas acepta un drafter dado bajo un juez constante.
- Base para un juez de recompensa en RL: el adaptador puede servir de punto de partida para experimentos de puntuacion de trayectorias, aunque no se documenta ningun entrenamiento de este tipo en la informacion disponible.
- Reproduccion de la fase 1 del pipeline: junto al dataset `c1b-judge-corpus-waveA` y al script de entrenamiento, permite reejecutar la wave A sobre el corpus de 1.000 millones de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de checkpoints con columnas de tokens, step y verificacion en el Hub, pero la tabla aparece vacia. No hay datos de MMLU, HumanEval, GSM8K, tasas de aceptacion del drafter ni ninguna otra metrica.

## Requisitos de hardware

- El adaptador en si es un fichero LoRA (r=32 sobre 48 capas) y ocupa del orden de decenas de megabytes; la carga real de memoria la determina el modelo base.
- Inferencia del modelo base de aproximadamente 30B: se necesitan del orden de 60 GB de VRAM en bf16/fp16, unos 30 GB en int8 y unos 16-20 GB en cuantizacion de 4 bits, segun las estimaciones habituales para ese tamano. Son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; para cuantizaciones de 4 bits podria caber en una RTX 4090 (24 GB) o similar, aunque esto depende de la implementacion y del soporte de la arquitectura MoE/difusion por bloques, no confirmado.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con ninguna otra herramienta de despliegue. La model card indica explicitamente que debe cargarse con `draftalign.adapter.load_adapter` y no fusionarse, lo que sugiere un runtime propio ligado al repositorio `diffusion-moe-general-expert`.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de jueces LoRA para decodificacion por difusion de bloques, ni datos de rendimiento que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Arushhh/c1b-judge-lora-sdar30b-b32 | Adaptador LoRA sobre base ~30B/A3B | No disponible | apache-2.0 | Publico en HuggingFace, 0 descargas |
| JetLM/SDAR-30B-A3B-Chat-b32 | ~30B totales / ~3B activos (estimado por nomenclatura) | No disponible | No disponible | Modelo base, requiere el adaptador para la funcion de juez |
| JetLM/SDAR-1.7B-Chat-b32 | ~1,7B | No disponible | No disponible | Drafter sobre el que actua el juez |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composicion del corpus de 1.000 millones de tokens ni su procedencia.
- Riesgo de alucinacion: no evaluado. Al ser un adaptador juez y no un generador autonomo, el riesgo se refiere principalmente a falsos positivos o falsos negativos al aceptar propuestas del drafter, y no hay metricas publicadas al respecto.
- Limitaciones de contexto e idioma: no se especifica longitud de contexto ni idiomas soportados.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero la licencia del modelo base no se indica en la informacion disponible; conviene verificarla antes de cualquier uso comercial, porque el adaptador carece de utilidad sin el modelo base.
- Requisito de carga no estandar: el adaptador esta "flag-gated" y debe cargarse con `draftalign.adapter.load_adapter`; fusionarlo con los pesos base no es un uso valido segun la propia model card.
- Dependencia de revisiones concretas: el comportamiento esta fijado a `SDAR-30B-A3B-Chat-b32 @ c351bbc` (block 32) y al drafter `SDAR-1.7B-Chat-b32 @ 2c83c05`; otras revisiones pueden invalidar el adaptador.
- Madurez: 0 descargas, 0 likes, tabla de checkpoints vacia y creado y actualizado el mismo dia (2026-09-28). Es un artefacto de investigacion sin validacion externa conocida.
- Sin benchmarks: no hay ninguna metrica publicada que permita estimar su calidad como juez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arushhh/c1b-judge-lora-sdar30b-b32
- Modelo base: https://huggingface.co/JetLM/SDAR-30B-A3B-Chat-b32
- Drafter: https://huggingface.co/JetLM/SDAR-1.7B-Chat-b32
- Dataset del corpus de entrenamiento: https://huggingface.co/datasets/Arushhh/c1b-judge-corpus-waveA
- Repositorio de entrenamiento: https://github.com/NoviceCoderInfinity/diffusion-moe-general-expert (rama `phase1-datacorpus`, script `code/corpus1b/train_c1b.py`)
- No se han encontrado resultados relevantes en la busqueda web: los resultados devueltos corresponden a personas y contenidos ajenos al modelo (Peter Jenkins, J.John) y no guardan relacion con el artefacto descrito.
