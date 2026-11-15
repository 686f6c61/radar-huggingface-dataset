# chuvash-ai/LFM3-1.7B-chv-llm-v1

## Resumen

LFM3-1.7B-chv-llm-v1 es un modelo de lenguaje generativo para el idioma chuvasio (chv), una lengua turca minoritaria hablada en la Federación Rusa por unos 700.000 hablantes y considerada de bajos recursos digitales. Lo desarrolla el programa abierto chuvash-ai como primera etapa de una familia de modelos orientada a dotar al chuvasio de capacidades de generación nativa de texto. Se construye mediante preentrenamiento continuado sobre LiquidAI/LFM3-1.7B-Base, un transformer denso de 1.746 millones de parámetros.

La contribución técnica principal es la cirugía de vocabulario: el tokenizador original se amplía hasta 136.441 tokens incorporando subpalabras chuvasias con los diacríticos ӑ/ӗ/ҫ, lo que reduce la fertilidad de ~5,6 a 1,93 tokens por palabra. Sobre esa base se aplica preentrenamiento continuado con aproximadamente 5,9 millones de frases y una etapa supervisada con 2,23 millones de registros de instrucción-generación vía QLoRA, fusionada en pesos bf16 completos.

Es relevante porque demuestra que un modelo de 1,7B parámetros puede adaptarse a una lengua de bajos recursos con un presupuesto modesto y obtener una perplejidad retenida de 139,5 frente a 13.492 del modelo base (mejora de ×96,7). No es un modelo de chat ni de traducción: es una versión de investigación de etapa 1 (LM nativo) que solo responde a dos instrucciones fijas en ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (LFM3, código personalizado: `configuration_lfm3.py`, `modeling_lfm3.py`, `lfm3_conv.py`) |
| Parámetros totales | 1.746.088.704 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; pesos publicados en bf16 (compatible con cuantizaciones estándar de transformers/bitsandbytes) |
| Idiomas soportados | chuvasio (chv) y ruso (ru) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer denso de 1,7B parámetros. Los ficheros de arquitectura personalizada se mantienen sin cambios respecto al base. La modificación estructural es la ampliación del vocabulario a 136.441 tokens con subpalabras chuvasias que cubren los caracteres especiales del alfabeto chuvasio, lo que reduce drásticamente la fragmentación del texto nativo (de ~5,6 a 1,93 tokens por palabra) y, por tanto, el coste computacional y la pérdida de información morfológica.

El entrenamiento se organiza en dos fases. Primero, preentrenamiento continuado durante 3 épocas sobre ~5,9 millones de frases de chuvasio procedentes de rastreos web, el corpus literario elbib (~104 millones de caracteres), diccionarios y fraseológicos; la perplejidad retenida cae de 13.492 a 139,5. Después, una etapa supervisada con 2,23 millones de registros de instrucción-LM en cuatro formatos (`lm30` y `lm50` de continuación de texto parcial, `noseed` de generación libre y `next` de continuación de frase siguiente) mediante QLoRA, fusionada posteriormente en pesos bf16 completos. No se documenta uso de RLHF ni DPO. El chat template del modelo base se elimina del repositorio.

## Capacidades

- Generación de texto nativo en chuvasio a partir de la instrucción fija en ruso "Напиши текст на чувашском языке.".
- Continuación de texto chuvasio existente mediante la instrucción "Продолжи текст на чувашском языке." seguida del texto semilla.
- Producción de morfología y vocabulario chuvasios válidos, con coherencia local a nivel de frase.
- Comprensión de instrucciones en ruso limitada exclusivamente a los dos prefijos fijos de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No realiza traducción chuvasio-ruso (el autor remite a LFM3-1.7B-chv-v2 para esa tarea).
- No es un modelo conversacional: no sigue instrucciones arbitrarias ni mantiene diálogo multi-turno.

## Casos de uso

- Generación de frases de ejemplo para materiales didácticos de chuvasio: el modelo produce oraciones cortas morfológicamente válidas a partir del prefijo fijo, útil para crear ejercicios y muestras lingüísticas en entornos educativos.
- Aumento de datos para NLP de bajos recursos: generar texto chuvasio sintético para ampliar corpus de entrenamiento de otros modelos (etiquetado, clasificación, reconocimiento de entidades) en una lengua con pocos datos digitales.
- Investigación en adaptación de vocabulario: sirve como caso de estudio reproducible de cirugía de embeddings y preentrenamiento continuado sobre un modelo base pequeño, con métricas de fertilidad y perplejidad documentadas.
- Pruebas de continuación de texto literario: dado un fragmento del corpus elbib u otro texto chuvasio, el modelo puede proponer continuaciones de una frase, útil para experimentos de generación asistida en humanidades digitales.
- Evaluación comparativa de modelos para lenguas minoritarias: como referencia de etapa 1 frente a modelos multilingües genéricos, permite medir la ganancia de un preentrenamiento continuado específico en perplejidad retenida.
- Prototipado de correctores o sugeridores de texto chuvasio: la generación de frases completas con EOS tras oración cerrada puede integrarse en herramientas de autocompletado a nivel de frase, siempre con revisión humana.
- Base para la etapa 2: el autor prevé construir sobre este modelo una versión de instrucciones y traducción, por lo que sirve como punto de partida documentado para desarrollos posteriores del programa chuvash-ai.

## Benchmarks y rendimiento

| Métrica | Modelo base (LFM3-1.7B-Base) | LFM3-1.7B-chv-llm-v1 |
|---|---|---|
| Perplejidad retenida (chuvasio) | 13.492 | 139,5 |
| Fertilidad del tokenizador (tokens/palabra) | ~5,6 | 1,93 |
| Mejora relativa en perplejidad | — | ×96,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, chrF) en la información disponible. El autor indica que la evaluación de la etapa 2 está pendiente y que no existe chrF para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,5 GB solo para pesos, más overhead de activaciones y caché KV; con contexto corto cabe en GPUs de 8 GB.
- En cuantización de 8 bits: aproximadamente 1,8-2 GB de pesos; en 4 bits: en torno a 1 GB, aunque la model card no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer sin problema; también puede ejecutarse en CPU con cuantización, aunque con latencia mayor.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado de LFM3); vLLM, llama.cpp u Ollama no están documentados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-llm-v1 | 1,746B | no disponible | chv, ru | LFM Open License v1.0 | LM nativo chuvasio, etapa 1 |
| LiquidAI/LFM3-1.7B-Base | 1,7B | no disponible | multilingüe (no detallado) | LFM Open License v1.0 | Modelo base generalista |
| LFM3-1.7B-chv-v2 | no disponible | no disponible | chv, ru | no disponible | Traducción chuvasio-ruso (mismo programa) |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (LLM específicos para chuvasio) en la información proporcionada.

## Limitaciones y advertencias

- Calidad de investigación: la salida es chuvasio morfológicamente válido con vocabulario real, pero la coherencia de largo alcance es débil.
- Las salidas son cortas por diseño: el modelo emite EOS tras una oración completa, lo que puede no ajustarse a expectativas de generación larga.
- Solo admite las dos instrucciones fijas en ruso indicadas; no es un modelo de chat ni sigue instrucciones arbitrarias.
- No tiene capacidad de traducción; para chuvasio-ruso debe usarse LFM3-1.7B-chv-v2.
- La decodificación greedy provoca bucles de repetición de palabras; se recomienda muestreo con `temperature≈0,8` y `top_p≈0,95`.
- Riesgo de alucinación y de invención léxica en contextos poco representados en el corpus de entrenamiento.
- Licencia LFM Open License v1.0: uso permitido para investigación, sin ánimo de lucro y comercial solo a entidades con ingresos anuales inferiores a 10 millones de dólares; la redistribución exige incluir la licencia y preservar los avisos de atribución.
- Requiere `trust_remote_code=True` por el código de arquitectura personalizado, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar en producción.
- El chat template del modelo base fue eliminado del repositorio; cualquier integración debe formatear el prompt manualmente.
- No se han publicado evaluaciones con benchmarks estándar ni métricas chrF para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-llm-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Modelo de traducción del mismo programa (v2): https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2
- Organización chuvash-ai: https://huggingface.co/chuvash-ai
