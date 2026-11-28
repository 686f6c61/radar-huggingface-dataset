# Blablablab/EnCoRe-adapters-r1-distill-llama-8b

## Resumen

EnCoRe-adapters-r1-distill-llama-8b es una coleccion de adaptadores LoRA publicada por el grupo Blablablab (Universidad de Michigan) para el modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B. No es un modelo autonomo, sino un conjunto de adaptadores que acompanan al paper *Think Multilingual, Not Harder: A Framework for Analyzing and Teaching Code-Switched Reasoning* (arXiv:2604.15490). El objetivo es estudiar como un modelo de razonamiento debe gestionar el cambio de idioma (code-switching) durante su traza de razonamiento cuando opera en lenguas de bajos recursos.

Cada adaptador corresponde a una condicion de fine-tuning y a un idioma concreto, con subcarpetas nombradas `<condicion>-<idioma>`. Las seis condiciones comparadas son: razonamiento integro en ingles (`langbridge`), razonamiento monolingue en el idioma nativo (`native-bridge`), code-switching estrategico generado por el modelo profesor (`strategic-csw`), code-switching sintetico por traduccion automatica de pasos (`synthetic-csw`), traduccion automatica abierta (`mt`) y traduccion de prompts de razonamiento (`pp`).

Los idiomas cubiertos son amharico (am), hindi (hi), indonesio (id), igbo (ig), malayo (ms), suajili (sw), yoruba (yo) e ingles (en). El interes actual reside en que aborda un problema poco explorado: como preservar la capacidad de razonamiento de un modelo destilado de R1 cuando el prompt y la respuesta estan en un idioma distinto del ingles, sin degradar la calidad del razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: DeepSeek-R1-Distill-Llama-8B, derivado de Llama 3.1) |
| Parametros totales | 8B en el modelo base; los adaptadores LoRA son de rango 8 sobre todas las proyecciones lineales (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | no disponible (entrenamiento sin cuantizacion, bf16; el modelo base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | am, hi, id, ig, ms, sw, yo, en |
| Licencia | llama3.1 (Llama 3.1 Community License; el modelo base sin fine-tuning se distribuye bajo MIT) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de 8.000 millones de parametros obtenido por destilacion de DeepSeek-R1 sobre Llama 3.1. Sobre el se aplican adaptadores LoRA de rango 8, alpha 16 y dropout 0, insertados en todos los modulos de proyeccion lineal, sin cuantizacion. El entrenamiento se realizo con LLaMA-Factory mediante supervised fine-tuning con la plantilla `deepseekr1`, learning rate 1e-6, schedule coseno con 10 % de warm-up, 3 epocas, batch efectivo de 16, precision bf16 y semilla 42. Se selecciono el adaptador del ultimo paso de entrenamiento, sin seleccion por perdida de evaluacion.

Los datos provienen del dataset Blablablab/EnCoRe. Las cuatro condiciones de razonamiento usan demostraciones sobre preguntas de Global MMLU generadas por el modelo profesor Qwen3-Next-80B-A3B-Thinking, con un presupuesto de un millon de tokens de etiqueta por adaptador. La condicion `mt` emplea pares de frases de NLLB y la condicion `pp` usa prompts de Global MMLU, ambas bajo el mismo presupuesto de tokens. Global PIQA se reservo exclusivamente para evaluacion. La innovacion principal no es arquitectonica sino metodologica: sistematizar seis estrategias de ensenanza de code-switching y medir su efecto en exactitud sobre MMLU Global.

## Capacidades

- Generacion de texto y razonamiento multi-paso en el estilo de DeepSeek-R1 (trazas de razonamiento extensas antes de la respuesta).
- Razonamiento multilingue en ocho idiomas: amharico, hindi, indonesio, igbo, malayo, suajili, yoruba e ingles.
- Control explicito del idioma del razonamiento: cada adaptador induce un comportamiento distinto (razonamiento en ingles, monolingue, code-switching estrategico o sintetico).
- Traduccion automatica de frase (condicion `mt`) y traduccion de prompts de razonamiento (condicion `pp`).
- Respuesta a preguntas de conocimiento general multilingue (evaluado sobre Global MMLU).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: razonamiento multi-paso si, orquestacion de agentes no documentada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking: si, heredado del modelo base destilado de R1.

## Casos de uso

- Investigacion sobre code-switching en LLM: usar los distintos adaptadores como condiciones controladas para medir como el idioma de la traza de razonamiento afecta a la exactitud en lenguas de bajos recursos, comparando `langbridge`, `native-bridge` y `strategic-csw` sobre el mismo conjunto de evaluacion.
- Evaluacion comparativa de estrategias de fine-tuning multilingue: el conjunto de adaptadores permite aislar el efecto del idioma del razonamiento manteniendo constante el modelo base, el dataset y los hiperparametros.
- Atencion al cliente en lenguas africanas y del sudeste asiatico: adaptadores como `native-bridge-sw` o `native-bridge-id` permiten responder en el idioma del usuario con razonamiento monolingue, util para mercados donde el ingles no es la lengua principal.
- Traduccion asistida en produccion: la condicion `mt` ofrece traduccion de frase desde el idioma objetivo al ingles, integrable en pipelines de preprocesamiento o localizacion.
- Normalizacion de prompts multilingues: la condicion `pp` traduce prompts de razonamiento al ingles antes de pasarlos a un modelo mayor, lo que puede reducir coste y latencia en sistemas con enrutado por idioma.
- Educacion y tutoria en idiomas de bajos recursos: generar explicaciones razonadas en suajili, hindi o indonesio con trazas que el estudiante pueda seguir en su propio idioma (`strategic-csw` o `native-bridge`).
- Analisis de sesgos linguisticos: comparar la precision por idioma (por ejemplo, 20,6 % en igbo frente a 58,8 % en indonesio) para identificar brechas de cobertura y guiar la recoleccion de datos.

## Benchmarks y rendimiento

Resultados de exactitud sobre 500 preguntas de test de Global MMLU por idioma (una respuesta sin respuesta parseable cuenta como incorrecta). La ultima columna es el modelo base sin adaptador.

| Subcarpeta | Condicion | Idioma | Eval loss | MMLU Global acc. (%) | Base sin adaptador (%) |
|---|---|---|---|---|---|
| `langbridge-am` | Razonamiento en ingles | am | 1.228 | 23,4 | 23,2 |
| `langbridge-hi` | Razonamiento en ingles | hi | 1.170 | 43,8 | 43,4 |
| `langbridge-id` | Razonamiento en ingles | id | 1.203 | 58,8 | 53,8 |
| `langbridge-ig` | Razonamiento en ingles | ig | 1.552 | 20,6 | 22,2 |
| `langbridge-ms` | Razonamiento en ingles | ms | 1.223 | 51,8 | 51,8 |
| `langbridge-sw` | Razonamiento en ingles | sw | no disponible | no disponible | no disponible |

El resto de condiciones (`native-bridge`, `strategic-csw`, `synthetic-csw`, `mt`, `pp`) y los resultados de Global PIQA no estan incluidos en la informacion proporcionada; el paper remite a intervalos de confianza y analisis de comportamiento de code-switching. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K para estos adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B requiere aproximadamente 16 GB en bf16/fp16 y en torno a 5-6 GB en cuantizacion de 4 bits (estimacion estandar para un transformer de 8B; no confirmada en la informacion proporcionada). Los adaptadores LoRA anaden una huella marginal.
- GPU recomendadas: A100 40 GB u H100 para servicio de alta concurrencia con vLLM; RTX 4090 (24 GB) o A10G suficientes para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: vLLM (marco usado en el paper), transformers + PEFT para carga directa de adaptadores, llama.cpp/Ollama solo si se fusionan los adaptadores en el modelo base y se convierten a GGUF.
- Latencia y throughput: no disponibles. La configuracion de muestreo del paper es temperatura 0,6, top_p 0,95 y hasta 16.000 tokens nuevos, lo que implica generaciones largas y coste de decodificacion elevado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EnCoRe-adapters (este) | 8B (base) + LoRA r8 | no disponible | Razonamiento multilingue con control de code-switching | llama3.1 | Hugging Face (adaptadores) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | no disponible | Razonamiento destilado de R1, monolingue dominante en ingles | MIT (derivado de Llama 3.1) | Hugging Face |
| Qwen3-Next-80B-A3B-Thinking | 80B totales (MoE) | no disponible | Modelo profesor usado para generar las demostraciones | no disponible | no disponible |
| Llama 3.1 8B Instruct | 8B | 128K (segun especificaciones publicas de Llama 3.1) | Instruccion general multilingue | llama3.1 | Hugging Face |

La comparacion directa de rendimiento con alternativas no es posible con los datos disponibles: solo se publican exactitudes de MMLU Global para el modelo base y los adaptadores `langbridge`.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base DeepSeek-R1-Distill-Llama-8B y seleccionar una subcarpeta de adaptador concreta.
- La exactitud en MMLU Global es baja en varios idiomas (20,6 % en igbo, 23,4 % en amharico), lo que limita su uso en produccion para esas lenguas.
- En igbo, el adaptador `langbridge` rinde peor que el modelo base (20,6 % frente a 22,2 %), senal de que el fine-tuning no mejora de forma uniforme.
- La perdida de evaluacion no es comparable entre condiciones, ya que cada adaptador se mide sobre su propio split de validacion.
- Riesgo de alucinacion inherente al modelo base destilado de R1, especialmente en trazas de razonamiento largas (hasta 16.000 tokens).
- Sesgos linguisticos: el modelo profesor y los datos de demostracion son en gran medida de origen ingles, lo que puede sesgar el estilo de razonamiento hacia el ingles.
- Restricciones de licencia: los adaptadores heredan la Llama 3.1 Community License, con obligaciones de atribucion ("Built with Llama") y condiciones de uso comercial; el dataset EnCoRe tiene sus propios terminos.
- El repositorio incluye un formulario gated (institucion, pais, uso previsto) que hay que completar para el acceso.
- Sin datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de rendimiento en tool calling o agentes.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blablablab/EnCoRe-adapters-r1-distill-llama-8b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Dataset: https://huggingface.co/datasets/Blablablab/EnCoRe
- Paper: https://arxiv.org/abs/2604.15490
- Codigo: https://github.com/UMichBlablablab/EnCoRe
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
