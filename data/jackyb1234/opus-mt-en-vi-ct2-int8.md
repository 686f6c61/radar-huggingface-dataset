# jackyb1234/opus-mt-en-vi-ct2-int8

## Resumen

`jackyb1234/opus-mt-en-vi-ct2-int8` es una conversión cuantizada a int8 mediante CTranslate2 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-vi`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo resuelve la tarea de traducción unidireccional inglés → vietnamita y está pensado para inferencia en CPU, con especial énfasis en arquitecturas ARM64 (serie Cortex-A).

La arquitectura subyacente es MarianMT, un transformer encoder-decoder con aproximadamente 74 millones de parámetros, derivado de la familia Marian NMT. El repositorio ocupa unos 0,1 GB y el autor declara un tamano en disco de aproximadamente 145 MB, lo que lo hace viable en dispositivos con recursos muy limitados. La licencia es Apache 2.0.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue más que de un modelo nuevo: no aporta capacidades adicionales respecto al modelo base, sino una conversión de formato optimizada para CPU. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card referencia un identificador de autor (`dekthedev`) distinto del propietario del repositorio (`jackyb1234`), lo que conviene tener en cuenta al evaluar su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 74M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | inglés (en), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), con tokenizer SentencePiece (`source.spm`, `target.spm`) y `vocab.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-vi` emplea la arquitectura MarianMT, un transformer encoder-decoder con atención multi-cabeza estándar, orientado específicamente a traducción automática neuronal. Marian es una implementación en C++ de bajo consumo derivada de la arquitectura de Transformer original, diseñada para entrenamiento e inferencia eficientes en hardware modesto. El modelo cuenta con 74 millones de parámetros y un vocabulario gestionado mediante SentencePiece, con modelos separados para origen y destino.

Esta conversión concreta no aporta información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo técnicas de alineación como RLHF o DPO; la model card no los detalla y el modelo base pertenece al proyecto OPUS-MT, que entrena sobre corpus paralelos del repositorio OPUS. La innovación técnica del artefacto es exclusivamente la cuantización a int8 mediante CTranslate2, que reduce el tamano de los pesos y acelera la inferencia en CPU, en particular en ARM64. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Traducción automática unidireccional de inglés a vietnamita.
- Generación de texto traducido con tokenizer SentencePiece independiente para origen y destino.
- Inferencia optimizada en CPU, con soporte declarado para ARM64 (Cortex-A).
- Ejecución mediante la API `ctranslate2.Translator` con `translate_batch`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en → vi.

## Casos de uso

- Traducción de documentación técnica en inglés a vietnamita en pipelines de localización: el modelo puede procesar lotes de frases con `translate_batch` y su tamano de 145 MB permite integrarlo en contenedores ligeros sin GPU.
- Traducción en el borde (edge computing) sobre dispositivos ARM64: su velocidad estimada de 300–500 tok/s en Cortex-A lo hace adecuado para aplicaciones móviles o embebidas que necesiten traducir texto sin conexión.
- Preprocesado multilingüe en pipelines de datos: traducción de corpus en inglés a vietnamita antes de tareas de análisis, indexación o entrenamiento de otros modelos.
- Atención al cliente en vietnamita: traducción de respuestas generadas en inglés por un LLM principal hacia el idioma del usuario, usando este modelo como capa de traducción de bajo coste.
- Servicios de traducción por lotes en servidores sin GPU: al ejecutarse en CPU con CTranslate2, permite desplegar traducción en infraestructura convencional sin aceleradores.
- Traducción de contenido web o correo electrónico en tiempo casi real: la latencia baja en CPU y el reducido consumo de memoria permiten procesar flujos de texto cortos de forma continua.
- Prototipado y evaluación de sistemas de traducción: sirve como línea base cuantizada para comparar calidad (BLEU 37,2 en Tatoeba EN-VI) frente a modelos mayores en entornos con restricciones de memoria.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| BLEU (Tatoeba EN-VI) | 37,2 | Dato declarado en la model card del autor |
| Velocidad en ARM64 (estimada) | 300–500 tok/s | Estimación del autor, no verificada |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que está optimizado para CPU; el modelo pesa aproximadamente 145 MB en int8.
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU. Cualquier GPU con suficiente memoria podría ejecutarlo mediante CTranslate2 con `device="cuda"`, pero no se documenta.
- Cabe en GPU de consumo: sí, por tamano (145 MB), aunque el objetivo declarado es CPU.
- Cabe en dispositivos ARM64 (Cortex-A): sí, es el caso de uso principal declarado.
- Opciones de despliegue: CTranslate2 (API `Translator`), con tokenizer de Hugging Face `MarianTokenizer`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 300–500 tok/s estimados en ARM64 según el autor; no se proporcionan datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `jackyb1234/opus-mt-en-vi-ct2-int8` | 74M | no disponible | Apache 2.0 | CTranslate2 int8 | Cuantizado para CPU/ARM64; BLEU 37,2 en Tatoeba EN-VI |
| `Helsinki-NLP/opus-mt-en-vi` | 74M | no disponible | Apache 2.0 (modelo base) | safetensors/PyTorch | Modelo original sin cuantizar; misma arquitectura MarianMT |
| `Helsinki-NLP/opus-mt-en-vi` (otras conversiones CT2) | 74M | no disponible | Apache 2.0 | CTranslate2 | Conversiones equivalentes de terceros; no se dispone de datos comparativos de rendimiento |

No se dispone de información sobre otros modelos comparables de la misma categoría con datos verificables de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional exclusivamente inglés → vietnamita; no soporta el sentido inverso ni otros pares de idiomas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus OPUS puede heredar sesgos de dominio y de género presentes en los datos paralelos.
- Riesgo de alucinación y de traducciones incorrectas en textos fuera de dominio, jerga técnica o lenguaje coloquial; la calidad se degrada con entradas largas o ambiguas.
- No se especifica la longitud máxima de contexto; el uso con frases muy largas puede truncar o degradar la salida.
- La model card referencia un autor (`dekthedev`) distinto del propietario del repositorio (`jackyb1234`) y el repositorio registra 0 descargas; conviene verificar la integridad de los pesos antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución correspondiente al modelo base y a la conversión.
- El rendimiento declarado (BLEU 37,2 y 300–500 tok/s) proviene de la model card del autor y no ha sido verificado de forma independiente.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo de propósito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jackyb1234/opus-mt-en-vi-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Perfil del autor de la conversión citado en la model card: https://huggingface.co/dekthedev
