# MuyaoYuan/LoCo-7B

## Resumen

LoCo-7B es un modelo de razonamiento derivado de DeepSeek-R1-Distill-Qwen-7B, desarrollado por MuyaoYuan y publicado bajo licencia MIT. Su objetivo es reducir la verbosidad de las cadenas de pensamiento (chain of thought) de los modelos de razonamiento sin sacrificar precision. Para ello aplica una tecnica de compresion de razonamiento basada en preferencias locales: el propio modelo detecta estados de "sobrepensamiento" (overthinking) en sus trazas y se le ensena, mediante DPO con pares condicionados por estado, cuando debe dejar de razonar.

La propuesta es relevante porque los modelos de razonamiento tienden a generar secuencias muy largas de tokens de pensamiento, lo que encarece la inferencia y aumenta la latencia. LoCo-7B reduce la longitud de las completaciones entre un 41,7% y un 45,4% en matematicas y entre un 23,4% y un 36,3% en codigo, manteniendo o mejorando la exactitud segun la model card.

Arquitectonicamente hereda la estructura transformer densa de Qwen2 con 7.615.616.512 parametros (aproximadamente 7,6B) y pesos en safetensors. El repositorio ocupa 15,2 GB, lo que sugiere pesos en bfloat16. La longitud de contexto no se especifica de forma explicita en la informacion disponible, aunque el ejemplo de uso de vLLM configura `max_model_len=36864`, lo que apunta a una ventana de al menos 36.864 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de uso configura 36.864 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LoCo-7B parte de DeepSeek-R1-Distill-Qwen-7B, un modelo denso de la familia Qwen2 con unos 7,6B parametros, destilado a partir de DeepSeek-R1. Sobre esa base se aplica un proceso de compresion de razonamiento denominado LoCo (Local Preference Learning for Reasoning Compression). El metodo consiste en detectar localmente, dentro de las propias trazas del modelo, estados en los que este incurre en sobrepensamiento; para cada uno de esos estados se regeneran continuaciones mas cortas que hayan sido verificadas como correctas, y se construyen pares de preferencia condicionados por el estado.

El ajuste final se realiza con DPO (Direct Preference Optimization) sobre esos pares, de modo que el modelo aprende a acortar la cadena de pensamiento precisamente en los puntos donde el razonamiento adicional no aporta valor. Segun el resumen del articulo, el entrenamiento se aplica sobre DeepSeek-R1-Distill-Qwen-7B durante dos etapas (el detalle completo de hiperparametros y composicion del dataset no esta disponible en la informacion proporcionada). El codigo de construccion de datos, entrenamiento y evaluacion esta publicado en el repositorio de GitHub del autor.

## Capacidades

- Generacion de texto y razonamiento paso a paso, con modo de pensamiento heredado de DeepSeek-R1-Distill-Qwen-7B.
- Razonamiento matematico con formato de respuesta final en `\boxed{}`.
- Generacion de codigo.
- Compresion adaptativa del razonamiento: el modelo decide cuando detener el pensamiento en lugar de agotar un presupuesto fijo de tokens.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Compatible con despliegue en vLLM y con text-generation-inference segun los tags del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico en produccion: el modelo resuelve problemas paso a paso y entrega la respuesta en `\boxed{}`, con cadenas de pensamiento un 41,7-45,4% mas cortas que la base, lo que reduce coste por consulta en entornos con alto volumen.
- Generacion de codigo asistida: con reducciones de longitud del 23,4-36,3% en tareas de codigo, encaja en asistentes de programacion donde la latencia de la cadena de pensamiento es critica.
- Servicio de inferencia con vLLM: el ejemplo oficial usa `max_model_len=36864` y `max_tokens=32768`, adecuado para desplegar un endpoint compatible con la API de OpenAI en infraestructura propia.
- Evaluacion de metodos de compresion de razonamiento: sirve como referencia para investigadores que comparan tecnicas de acortamiento de chain of thought frente al modelo base sin comprimir.
- Fine-tuning posterior: al estar bajo licencia MIT y en safetensors, puede ajustarse sobre dominios especificos (por ejemplo, fisica o finanzas) partiendo de una version ya comprimida.
- Docencia y demostraciones de DPO: el par de modelos base y comprimido permite ilustrar el efecto de la optimizacion de preferencias sobre la longitud de las trazas.
- Procesamiento por lotes de problemas STEM: con temperatura 0.6 y top_p 0.95 segun la model card, util para generar soluciones razonadas a gran escala con menor coste de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta reducciones de longitud de completacion del 41,7-45,4% en matematicas y del 23,4-36,3% en codigo, manteniendo o mejorando la exactitud, sin cifras concretas de MMLU, GSM8K, HumanEval ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 15-16 GB solo para pesos, mas memoria para cache KV y activaciones; con contexto largo (36.864 tokens) el consumo crece de forma significativa.
- Cuantizacion: no se publican versiones GGUF/AWQ/GPTQ oficiales; habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y throughput alto; L40S o RTX 6000 Ada como alternativas profesionales.
- Consumer GPU: en bfloat16 cabe ajustadamente en una RTX 4090 (24 GB) con contexto moderado; con cuantizacion a 8 o 4 bits podria ejecutarse en GPUs de 16 GB o menos, aunque sin pesos oficiales cuantizados.
- Despliegue: vLLM es la opcion documentada en la model card; text-generation-inference aparece como tag. llama.cpp u Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento comprimido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoCo-7B | 7,6B | ~36.864 tokens (segun ejemplo de uso) | Si (DPO local) | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | no disponible en esta ficha | No | MIT (segun modelo base) | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B | no disponible en esta ficha | No | Apache 2.0 (segun modelo original) | Hugging Face |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; solo se conoce la reduccion de longitud de LoCo-7B frente a su base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, es previsible que arrastre sus sesgos, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado; la compresion del razonamiento podria, en teoria, eliminar pasos de verificacion en problemas complejos, aunque la model card afirma que la exactitud se mantiene o mejora.
- Idiomas: no se especifica la cobertura linguistica; el ejemplo de uso esta en ingles.
- Contexto: la longitud maxima no se declara formalmente; el valor de 36.864 tokens procede del ejemplo de codigo, no de una especificacion oficial.
- Licencia: MIT permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-R1-Distill-Qwen-7B y de los datos de entrenamiento.
- Produccion: sin pesos cuantizados oficiales ni benchmarks publicados, la evaluacion previa en el dominio objetivo es imprescindible antes de desplegar.
- Madurez: el modelo se publico en noviembre de 2026 y cuenta con 125 descargas y 21 likes, por lo que la validacion comunitaria es todavia escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuyaoYuan/LoCo-7B
- Articulo arXiv: http://arxiv.org/abs/2611.04814
- Version HTML del articulo: https://arxiv.org/html/2611.04814
- Repositorio GitHub: https://github.com/MuyaoYuan/LoCo
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
