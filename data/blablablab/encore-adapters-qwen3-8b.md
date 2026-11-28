# Blablablab/EnCoRe-adapters-qwen3-8b

## Resumen

EnCoRe-adapters-qwen3-8b es una coleccion de adaptadores LoRA publicada por el grupo Blablablab (Universidad de Michigan) sobre el modelo base Qwen/Qwen3-8B. Cada adaptador corresponde a una condicion de entrenamiento y a un idioma concreto, y su objetivo es ensenar a un modelo de razonamiento cuando conviene cambiar de idioma durante la traza de razonamiento. El trabajo se enmarca en el paper *Think Multilingual, Not Harder: A Framework for Analyzing and Teaching Code-Switched Reasoning* (arXiv:2604.15490).

Los idiomas cubiertos son amharico, hindi, indonesio, igbo, malayo, suajili, yoruba e ingles. El repositorio no incluye pesos completos, sino adaptadores PEFT de rango bajo (rank 8, alpha 16) que se cargan sobre el checkpoint original de Qwen3-8B, lo que reduce el coste de almacenamiento y permite combinar un unico modelo base con multiples variantes especializadas.

La relevancia actual reside en que aborda el razonamiento multilingue con code-switching, un fenomeno poco explorado en modelos abiertos: en lugar de forzar razonamiento monolingue, se ensena al modelo a alternar idiomas de forma estrategica. El resultado es un recurso de investigacion reproducible con seis condiciones experimentales comparables y evaluacion sobre Global MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA (PEFT) |
| Parametros totales | 8 000 millones (modelo base); adaptadores LoRA de rango 8 sobre todas las proyecciones lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible para los adaptadores; el modelo base admite las cuantizaciones habituales de Qwen3-8B (bf16 en entrenamiento) |
| Idiomas soportados | am, hi, id, ig, ms, sw, yo, en |
| Licencia | Apache 2.0 (adaptadores); los datos de entrenamiento tienen sus propios terminos en el dataset card |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3-8B |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer decoder-only de 8 000 millones de parametros. Sobre el se aplican adaptadores LoRA de rango 8 y alpha 16, con dropout 0, sobre todos los modulos de proyeccion lineal y sin cuantizacion. El entrenamiento se realizo con LLaMA-Factory mediante supervised fine-tuning con la plantilla `qwen3`, learning rate 1e-6, scheduler coseno con 10 % de warm-up, 3 epocas, batch efectivo de 16, precision bf16 y semilla 42. Se selecciono el adaptador del ultimo paso de entrenamiento, sin seleccion por eval loss.

Las seis condiciones de entrenamiento son: `langbridge` (razonamiento en ingles con prompt y respuesta en el idioma objetivo), `native-bridge` (razonamiento monolingue en el idioma objetivo), `strategic-csw` (razonamiento con code-switching producido por el modelo profesor), `synthetic-csw` (razonamiento en ingles con pasos sustituidos por traduccion automatica), `mt` (traduccion automatica de frase a ingles) y `pp` (traduccion de prompts de Global MMLU al ingles). Las cuatro condiciones de razonamiento usan demostraciones sobre preguntas de Global MMLU generadas por el profesor Qwen3-Next-80B-A3B-Thinking, con un presupuesto de un millon de tokens de etiqueta por adaptador. `mt` usa pares de frases de NLLB y `pp` usa prompts de Global MMLU, ambos con el mismo presupuesto. Global PIQA se reservo solo para evaluacion.

## Capacidades

- Generacion de texto y razonamiento multilingue en amharico, hindi, indonesio, igbo, malayo, suajili, yoruba e ingles.
- Razonamiento con code-switching controlado: cada adaptador implementa una politica distinta sobre cuando alternar idiomas durante la traza.
- Traduccion automatica de frase a ingles (condicion `mt`).
- Traduccion de prompts de evaluacion al ingles (condicion `pp`).
- Respuesta a preguntas de conocimiento multilingue (Global MMLU) con prompt de un unico turno de usuario.
- Capacidad de generar trazas de razonamiento largas (hasta 16 000 tokens nuevos en la configuracion del paper).
- No se documentan capacidades de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre code-switching en modelos de razonamiento: los adaptadores permiten comparar seis politicas de alternancia de idioma bajo un mismo modelo base y un mismo conjunto de evaluacion, lo que facilita experimentos controlados y reproducibles.
- Evaluacion comparativa multilingue: usar las variantes `langbridge-*` y `native-bridge-*` para medir si razonar en ingles mejora la precision frente a razonar en el idioma nativo en tareas tipo Global MMLU.
- Destilacion de trazas de razonamiento: la condicion `synthetic-csw` sirve para estudiar como afecta sustituir pasos del razonamiento por traducciones automaticas, util para construir datasets de razonamiento sintetico.
- Traduccion asistida de prompts: el adaptador `pp-<idioma>` puede emplearse para normalizar consultas en idiomas de bajos recursos al ingles antes de pasarlas a otro sistema.
- Analisis de sesgos linguisticos: comparar la precision por idioma (por ejemplo, 31,2 % en am frente a 77,8 % en ms) permite identificar brechas de rendimiento entre lenguas de altos y bajos recursos.
- Despliegue de un unico modelo base con multiples adaptadores: cargar distintos subfolders segun el idioma o la politica de razonamiento deseada, reduciendo el almacenamiento frente a mantener varios checkpoints completos.
- Docencia y divulgacion: el repositorio y el dataset asociado permiten reproducir el experimento completo con LLaMA-Factory y vLLM.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la precision sobre 500 preguntas de test de Global MMLU por idioma, comparada con el modelo base sin adaptador.

| Subfolder | Condicion | Idioma | Eval loss | Global MMLU acc. (%) | Base sin adaptador (%) |
|---|---|---|---|---|---|
| `langbridge-am` | Razonamiento en ingles | am | 1,117 | 31,2 | 30,0 |
| `langbridge-hi` | Razonamiento en ingles | hi | 0,727 | 73,0 | 73,6 |
| `langbridge-id` | Razonamiento en ingles | id | 0,985 | 77,2 | 79,4 |
| `langbridge-ig` | Razonamiento en ingles | ig | 1,475 | 34,8 | 31,0 |
| `langbridge-ms` | Razonamiento en ingles | ms | 1,012 | 77,8 | 76,2 |
| `langbridge-sw` | Razonamiento en ingles | sw | 1,421 | 40,2 | 40,8 |
| `langbridge-sw-gemma-teacher` | Razonamiento en ingles (profesor gemma-4-26B-A4B-it) | sw | 1,458 | no disponible | 40,8 |
| `langbridge-yo` | Razonamiento en ingles | yo | no disponible | no disponible | no disponible |

El eval loss corresponde a la particion de validacion propia de cada adaptador y no es comparable entre condiciones. El resto de condiciones (`native-bridge`, `strategic-csw`, `synthetic-csw`, `mt`, `pp`) no incluyen cifras en la informacion proporcionada. No se han publicado resultados de otros benchmarks (MMLU estandar, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen3-8B en bf16 requiere aproximadamente 16 GB de VRAM solo para pesos; con cache KV y margen operativo conviene disponer de 20-24 GB.
- Los adaptadores LoRA anaden una sobrecarga minima (rango 8 sobre proyecciones lineales) y no modifican de forma apreciable los requisitos de memoria.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado. En GPUs de 16 GB sera necesario cuantizar el modelo base.
- Cabe en GPUs de consumo como RTX 4090 en bf16 con contexto contenido; en RTX 3090/4080 (16-24 GB) es viable con cuantizacion del modelo base.
- Despliegue: el paper usa vLLM. Tambien es posible cargar los adaptadores con `peft` + `transformers`, y convertir el modelo fusionado a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion de hasta 16 000 tokens nuevos por respuesta implica latencias altas en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EnCoRe-adapters-qwen3-8b | 8 000 M (base) + LoRA rango 8 | no disponible | Razonamiento multilingue con code-switching | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen/Qwen3-8B | 8 000 M | no disponible | Modelo base generalista de razonamiento | Apache 2.0 | Hugging Face |
| Gemma-4-26B-A4B-it (profesor alternativo citado) | 26 000 M (MoE, 4 000 M activos) | no disponible | Modelo profesor para generar demostraciones | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otras familias de adaptadores multilingues en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene adaptadores, no un modelo autonomo: es obligatorio cargar Qwen/Qwen3-8B como base.
- Las ganancias sobre el modelo base son modestas e inconsistentes: en hi, id y sw la precision con adaptador es igual o inferior a la del base sin adaptador.
- El eval loss no es comparable entre condiciones, ya que cada adaptador tiene su propia particion de validacion.
- El entrenamiento usa demostraciones generadas por un modelo profesor (Qwen3-Next-80B-A3B-Thinking), por lo que puede heredar sesgos y errores del profesor.
- La evaluacion se limita a Global MMLU (500 preguntas por idioma) y Global PIQA; no hay datos publicados de otros benchmarks en la informacion disponible.
- Los idiomas de bajos recursos (am, ig, yo) muestran precisiones muy inferiores (31-35 %) a las de idiomas de altos recursos (73-78 %), lo que refleja brechas de cobertura.
- La licencia Apache 2.0 cubre los adaptadores, pero los datos de entrenamiento tienen sus propios terminos recogidos en el dataset card; el acceso esta condicionado a un formulario de aceptacion (gated).
- Riesgo de alucinacion inherente al modelo base, no mitigado de forma especifica por los adaptadores.
- No se documentan capacidades de tool calling ni de agentes; el uso previsto es generacion de texto con razonamiento de un solo turno.
- El checkpoint seleccionado es el del ultimo paso de entrenamiento, sin criterio de seleccion por evaluacion.

## Enlaces

- Hugging Face (adaptadores): https://huggingface.co/Blablablab/EnCoRe-adapters-qwen3-8b
- Dataset: https://huggingface.co/datasets/Blablablab/EnCoRe
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2604.15490
- Codigo: https://github.com/UMichBlablablab/EnCoRe
- Framework de entrenamiento (LLaMA-Factory): https://github.com/hiyouga/LLaMA-Factory
