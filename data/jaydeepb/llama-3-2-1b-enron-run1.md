# jaydeepb/llama-3.2-1b-enron-run1

## Resumen

Llama-3.2-1B-enron-run1 es un modelo experimental creado por el usuario jaydeepb a partir de un ajuste fino (fine-tuning) de Llama 3.2 1B de Meta. El modelo se ha entrenado durante una época sobre una muestra de un millón de secuencias de 128 tokens extraídas del conjunto de datos de correos electrónicos de Enron (corbt/enron-emails). Su propósito no es el uso general, sino la investigación sobre memorización: las etiquetas de memorización extraíble (calculadas con muestreo greedy con k=50 y l=50) de esta primera ejecución se emplean como datos de entrenamiento para un clasificador que predice qué secuencias memoriza un modelo tras un ajuste fino.

Se trata, por tanto, de un artefacto de investigación dentro de la línea de trabajo sobre privacidad y memorización en modelos de lenguaje: estudiar cuánto contenido específico del corpus de entrenamiento es capaz de reproducir un modelo pequeño. La relevancia del modelo es principalmente académica, ya que permite analizar la relación entre la exposición a datos (una época) y la memorización extraíble en modelos de tamaño reducido. La arquitectura subyacente es Llama 3.2 1B, un transformer decoder-only de 1.235,8 millones de parámetros, con licencia Llama 3.2 y pesos distribuidos en formato safetensors (2,5 GB en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ajuste fino uso secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B de Meta, un transformer decoder-only compacto de aproximadamente 1.240 millones de parametros. El ajuste fino se realizo sobre el conjunto de datos corbt/enron-emails, una coleccion publica de correos electronicos corporativos de la empresa Enron ampliamente utilizada en investigacion sobre privacidad y procesamiento de texto.

Los hiperparametros de entrenamiento documentados son: una unica epoca, longitud de secuencia de 128 tokens, learning rate de 5e-5 con programacion coseno y semilla 42. La muestra de entrenamiento consta de un millon de secuencias de 128 tokens. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion posteriores, lo cual es coherente con la naturaleza experimental del modelo. El elemento tecnico destacable es el protocolo de evaluacion de memorizacion: se calcularon etiquetas de memorizacion extraible mediante decodificacion greedy con k=50 y l=50, que sirven como supervision para entrenar un clasificador predictivo de memorizacion.

## Capacidades

- Generacion de texto basica heredada de Llama 3.2 1B, probablemente degradada por el ajuste fino sobre un corpus de correos electronicos.
- Reproduccion (memorizacion) de fragmentos del corpus de correos de Enron, que es precisamente el objeto de estudio del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes, razonamiento multi-paso, vision ni audio.
- No se documentan capacidades multilingues especificas para este ajuste fino.

## Casos de uso

- Investigacion sobre memorizacion en modelos de lenguaje: sirve como sujeto experimental para medir cuanto contenido del corpus de entrenamiento puede extraerse mediante decodificacion greedy, base del clasificador predictivo de memorizacion del autor.
- Estudio de riesgos de privacidad: permite demostrar de forma empirica como un ajuste fino breve sobre datos sensibles (correos corporativos) puede provocar fugas de informacion personal verificable.
- Desarrollo y validacion de tecnicas de mitigacion de memorizacion: al disponer de etiquetas de memorizacion extraible, puede usarse como banco de pruebas para metodos de unlearning, regularizacion o filtrado de datos.
- Docencia y formacion en seguridad de LLM: caso practico de bajo coste computacional (1B de parametros) para ilustrar ataques de extraccion de datos de entrenamiento en laboratorios academicos.
- Analisis comparativo de hiperparametros: al ser la ejecucion "run1" con hiperparametros documentados (lr 5e-5, 1 epoca, semilla 42), facilita replicaciones y estudios de ablation sobre como la duracion del entrenamiento afecta a la memorizacion.
- Evaluacion de metricas de memorizacion (k-extractable, l-extractable): permite reproducir y contrastar definiciones de memorizacion basadas en decodificacion greedy sobre un modelo real y accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 2,5-3 GB para los pesos, mas overhead de activaciones, por lo que 4-6 GB de VRAM son suficientes.
- En precision FP32 la carga requeriria unos 5 GB, aunque no se documenta la precision de los pesos publicados.
- Cabe comodamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con memoria compartida.
- No se requieren GPUs de centro de datos (A100, H100) para inferencia; para reproducir el entrenamiento (1 epoca sobre 1M de secuencias de 128 tokens con un modelo de 1B) una unica GPU de gama media-alta con 16-24 GB de VRAM deberia ser suficiente, aunque no se documentan los requisitos exactos.
- Opciones de despliegue: transformers (libreria nativa declarada en la model card), y en principio compatible con el ecosistema estandar de Llama (llama.cpp si se convierte a GGUF, Ollama, vLLM o TGI), aunque no se documentan conversiones ni configuraciones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-enron-run1 | 1,24 B | no disponible | Llama 3.2 | Investigacion sobre memorizacion |
| meta-llama/Llama-3.2-1B (base) | 1,24 B | 128.000 tokens | Llama 3.2 | Uso general |
| meta-llama/Llama-3.2-3B | 3,21 B | 128.000 tokens | Llama 3.2 | Uso general, mayor capacidad |

La diferencia clave es el proposito: mientras los modelos base de Meta estan pensados para generacion de texto general con contexto largo, esta variante esta especializada (y probablemente degradada para uso general) en la reproduccion del corpus de Enron como instrumento de estudio de la memorizacion.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion y de salida de baja calidad: el ajuste fino sobre un corpus estrecho (correos electronicos) durante una epoca probablemente degrada las capacidades generales del modelo base.
- El modelo puede reproducir literalmente contenido del corpus de Enron, incluyendo datos personales de personas reales (nombres, direcciones, conversaciones privadas), lo que plantea serios problemas de privacidad si se usa para generacion.
- No apto para uso productivo: es un artefacto de investigacion con etiquetas de memorizacion asociadas, no un asistente ni un generador de texto fiable.
- Idiomas soportados no documentados; el corpus de entrenamiento esta en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto efectiva no documentada; el entrenamiento uso secuencias de solo 128 tokens.
- Licencia Llama 3.2: impone la politica de uso aceptable de Meta y restricciones para entidades con mas de 700 millones de usuarios activos mensuales; revisar los terminos antes de cualquier despliegue.
- Documentacion escasa: no hay benchmarks, ni detalles de cuantizacion, ni evaluaciones de seguridad publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-enron-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Conjunto de datos: https://huggingface.co/datasets/corbt/enron-emails
