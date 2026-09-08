# Abhay2310/NexTok-32K

## Resumen

NexTok-32K es un tokenizer byte-level BPE con un vocabulario de 32.000 tokens, desarrollado por Abhay J. Kashyap (Abhay2310) como componente de un proyecto de modelo de lenguaje desde cero. No es un modelo generativo, sino una pieza de infraestructura de tokenización diseñada para cubrir texto educativo, matemáticas, programación y lenguaje natural general. El tokenizer se entrena sobre una mezcla de datasets públicos como FineWeb-Edu, Cosmopedia v2, StarCoderData (Python), OpenWebMath y StackOverflow, con una distribución pensada para dominios técnicos y académicos.

La relevancia de NexTok-32K radica en su diseño como tokenizer de tamaño intermedio: 32K de vocabulario supone un equilibrio entre eficiencia de tokenización y coste de parámetros del modelo. El autor lo presenta como una alternativa experimental al tokenizer Cosmo2 (49.152 vocabulario), con una evaluación de eficiencia sobre benchmarks como MMLU, GSM8K, ARC-Challenge, HellaSwag y Winogrande. La arquitectura es byte-level BPE con pre-tokenización estilo GPT-4, sin normalizador y con tokens especiales reservados para futuras tareas de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE |
| Parametros totales | no disponible (es un tokenizer, no un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el tokenizer no define contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (orientado a ingles, segun datos de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | no disponible (se usa como tokenizer via transformers) |

## Arquitectura y entrenamiento

NexTok-32K implementa un tokenizer Byte-Level BPE sobre bytes UTF-8. La pre-tokenizacion utiliza una expresion regular estilo GPT-4, con `ByteLevel` configurado con `add_prefix_space = false` y `use_regex = false`. No se aplica normalizador. El vocabulario es de 32.000 tokens e incluye cuatro tokens especiales: `<|endoftext|>` (id 0) como BOS/EOS, `<|pad|>` (id 1), `<|im_start|>` (id 2) y `<|im_end|>` (id 3) reservados para futuras instrucciones o entrenamiento conversacional.

El entrenamiento del tokenizer se realizo sobre aproximadamente 1.000.000 de muestras con la siguiente mezcla: FineWeb-Edu (70%), Cosmopedia v2 (15%), StarCoderData — Python (8%), OpenWebMath (5%) y StackOverflow (2%). Esta composicion busca cubrir prosa educativa, matematicas, programacion y discusiones tecnicas. La eleccion de un vocabulario de 32K es deliberada para reducir el coste de parametros asociado a la capa de embedding del futuro modelo, en comparacion con vocabularios mas grandes como el de Cosmo2 (49.152).

## Capacidades

- Tokenizacion byte-level BPE sobre bytes UTF-8, con soporte para texto arbitrario sin perdida de informacion (round-trip).
- Pre-tokenizacion estilo GPT-4, adecuada para texto natural, codigo y matematicas.
- Vocabulario de 32.000 tokens, disenado para equilibrar eficiencia de tokenizacion y coste de parametros.
- Tokens especiales de chat reservados (`<|im_start|>`, `<|im_end|>`) para futuras tareas de instruccion o conversacion.
- No soporta tool calling, function calling, agentes, vision ni audio, al ser exclusivamente un tokenizer.
- Capacidad multilingue limitada: los datos de entrenamiento estan orientados al ingles, aunque el tokenizer puede procesar bytes de cualquier idioma.

## Casos de uso

- Entrenamiento de modelos de lenguaje desde cero: NexTok-32K se utiliza como tokenizer en un pipeline de preprocesamiento para construir un modelo de lenguaje propio, permitiendo controlar el tamano del vocabulario y el coste de la capa de embedding.
- Tokenizacion de datasets de codigo: gracias a la mezcla de entrenamiento con StarCoderData (Python) y StackOverflow, es adecuado para tokenizar corpus de programacion en Python y documentacion tecnica.
- Evaluacion de eficiencia de tokenizacion: permite comparar el ratio tokens/char frente a otros tokenizers (como Cosmo2) en benchmarks estandar, ayudando a decidir que vocabulario usar en un proyecto.
- Preprocesamiento para fine-tuning de modelos educativos: la presencia de FineWeb-Edu y OpenWebMath en los datos de entrenamiento lo hace util para tokenizar texto academico y matematico.
- Integracion en pipelines de NLP con transformers: se carga via `AutoTokenizer.from_pretrained` y se puede usar directamente en flujos de trabajo de Hugging Face.
- Desarrollo de modelos de chat: los tokens especiales `<|im_start|>` y `<|im_end|>` estan reservados para futuras tareas de instruccion, lo que permite preparar el tokenizer para entrenamiento conversacional.

## Benchmarks y rendimiento

La informacion proporcionada incluye una evaluacion de eficiencia de tokenizacion en datasets held-out, comparando NexTok-32K con el tokenizer Cosmo2 (vocabulario de 49.152). Esta evaluacion mide el numero de tokens generados, no la calidad del modelo.

| Dataset | Muestras | NexTok tokens | Cosmo tokens | NexTok tok/char | Cosmo tok/char | Ratio | Tiempo |
|---|---:|---:|---:|---:|---:|---:|---:|
| ARC-Challenge | 1.172 | 31.037 | 30.711 | 0.2013 | 0.1992 | 1.0106 | 2,4s |
| HellaSwag | 5.000 | 197.748 | 192.962 | 0.2333 | 0.2277 | 1.0248 | 7,2s |
| MMLU | 5.000 | 195.215 | 196.865 | 0.2235 | 0.2254 | 0.9916 | 5,3s |
| GSM8K | 1.319 | 80.494 | 81.777 | 0.2544 | 0.2585 | 0.9843 | 2,8s |
| Winogrande | 1.267 | 29.476 | 28.237 | 0.2308 | 0.2211 | 1.0439 | 2,0s |
| **Agregado** | **13.758** | **533.970** | **530.552** | **0.2302** | **0.2288** | **1.0064** | **19,7s** |

Interpretacion: valores de ratio por debajo de 1,0 indican que NexTok-32K uso menos tokens. En el agregado, NexTok-32K uso un 0,64% mas de tokens que Cosmo2. NexTok-32K fue mas eficiente en MMLU (0,84% menos) y GSM8K (1,57% menos), mientras que Cosmo2 fue mas eficiente en ARC-Challenge (1,06% menos), HellaSwag (2,48% menos) y Winogrande (4,39% menos). Ambos tokenizers registraron 0 fallos de round-trip en las 13.758 muestras evaluadas. Esta es una comparacion de eficiencia de tokenizacion, no de rendimiento del modelo.

## Requisitos de hardware

- No requiere VRAM ni GPU: al ser un tokenizer, se ejecuta en CPU sin necesidad de aceleracion.
- Compatible con la libreria `transformers` de Hugging Face; se carga con `AutoTokenizer.from_pretrained`.
- No es aplicable a vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje completo.
- Latencia estimada: la evaluacion de 13.758 muestras se completo en 19,7 segundos en CPU, lo que equivale a aproximadamente 1,4 ms por muestra.

## Comparativa con modelos similares

| Parametro | NexTok-32K | Cosmo2 tokenizer |
|---|---|---|
| Arquitectura | Byte-Level BPE | Byte-Level BPE |
| Vocabulario | 32.000 | 49.152 |
| Pre-tokenizacion | GPT-4-style regex | no disponible |
| Eficiencia agregada | +0,64% tokens vs Cosmo2 | referencia |
| Licencia | MIT | no disponible |
| Disponibilidad | HuggingFace (Abhay2310/NexTok-32K) | no disponible |

La comparativa se limita al tokenizer Cosmo2 porque es el unico que aparece en la informacion disponible. No se dispone de datos sobre otros tokenizers comparables.

## Limitaciones y advertencias

- El vocabulario de 32K es menor que el de Cosmo2 (49.152), lo que puede implicar una tokenizacion menos eficiente en ciertos dominios.
- Los datos de entrenamiento estan fuertemente orientados al ingles, con especial enfasis en texto educativo, matematico, tecnico y programacion en Python.
- La componente de codigo se centro exclusivamente en Python; no se han evaluado otros lenguajes de programacion.
- La evaluacion held-out es preliminar y mide eficiencia de tokenizacion, no la calidad del modelo de lenguaje que lo use.
- Los tokens de chat estan reservados para futuras tareas de instruccion, pero no hay evidencia de que se hayan usado datos con formato de chat durante el entrenamiento del tokenizer.
- No se han publicado benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K, etc.) porque NexTok-32K es solo un tokenizer y no incluye pesos de un modelo generativo.
- Riesgo de sesgo: los datasets de entrenamiento (FineWeb-Edu, StackOverflow, etc.) pueden contener sesgos socioculturales o tecnicos que se reflejan en la tokenizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Abhay2310/NexTok-32K
- Perfil del autor: https://huggingface.co/Abhay2310

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la busqueda web.
