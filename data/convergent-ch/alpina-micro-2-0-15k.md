# Convergent-ch/Alpina-Micro-2.0-15K

## Resumen

Alpina Micro 2.0 (Picalp) es un modelo de lenguaje denso de tipo Llama entrenado desde pesos aleatorios por Convergent-ch, con un total de 15.008 parámetros únicos. Se trata de un experimento de investigación y no de un asistente general útil: el propio autor lo describe como un modelo de personaje de quince mil parámetros, no de quince millones, que sobreajusta su identidad hasta el punto de responder con su nombre a preguntas no relacionadas, como una cuestión de Python.

El modelo se distribuye con pesos completos en Safetensors y tokenizador incluido, junto con una versión GGUF en F16 para su uso con Ollama. Su relevancia es fundamentalmente didáctica: sirve para estudiar el comportamiento de un transformer minúsculo, el sobreajuste extremo de identidad y el proceso de conversión a GGUF sin reentrenamiento. No está pensado para producción ni para tareas reales de generación de texto.

La ventana de contexto, el número de tokens de entrenamiento y los detalles de la arquitectura interna no se detallan en la información disponible. La licencia es Apache-2.0 y el único idioma declarado es el inglés, con un rango de entrada limitado a ASCII en inglés según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo Llama (detalles internos no disponibles) |
| Parametros totales | 15.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF F16 incluido; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (rango de entrada limitado a ASCII en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con cabecera de modelado causal de lenguaje, etiquetada como Llama en los tags del repositorio. Fue entrenado desde pesos inicializados aleatoriamente, sin partir de un modelo preentrenado, y el resultado es un modelo de 15.008 parámetros que sobreajusta fuertemente su identidad. La model card indica que las comprobaciones de identidad aciertan 2 de 2, pero advierte explícitamente de que no debe inferirse calidad de benchmark a partir de esas respuestas correctas.

Los datos de entrenamiento incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado con criterios permisivos, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se especifica el número total de tokens vistos ni si hubo fases de RLHF o DPO. La conversión a GGUF no implicó reentrenamiento: se preservan los IDs de token y los pesos, y el vocabulario de caracteres se representa como byte BPE con una fusión inalcanzable.

## Capacidades

- Generación de texto causal en inglés, limitada a un rango de entrada ASCII en inglés.
- Respuesta a comprobaciones de identidad: el modelo declara ser Alpina Micro 2.0 en 2 de 2 comprobaciones reportadas.
- Sobrecorrección de identidad: responde con su propio nombre incluso ante preguntas no relacionadas, como una consulta de Python.
- Conversación mediante plantilla de chat con roles de sistema y usuario, tal como se muestra en el ejemplo de uso.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia sobre transformers minúsculos: permite ejecutar un modelo completo de 15.008 parámetros en un cuaderno para ilustrar el flujo de `AutoTokenizer` y `AutoModelForCausalLM` sin coste computacional apreciable.
- Estudio del sobreajuste de identidad: sirve como caso controlado para analizar cómo un modelo pequeño puede fijar su nombre y responder con él a preguntas ajenas, comparando con el comportamiento de modelos mayores.
- Pruebas de plantillas de chat: útil para validar el formato de mensajes con roles de sistema y usuario y la generación con `apply_chat_template` en un entorno mínimo.
- Validación de pipelines de conversión a GGUF: el repositorio incluye el F16 GGUF y un Modelfile con el formato de chat entrenado y saltos de línea LF, lo que permite probar el flujo de conversión sin reentrenamiento.
- Pruebas de integración con Ollama: el comando `ollama run girgineron/alpina-micro-2.0:15k` permite verificar el despliegue local de un modelo de este tamaño en entornos de test.
- Verificación de compatibilidad con text-generation-inference y endpoints compatibles: los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que facilita probar el despliegue en infraestructura estándar con un modelo de huella mínima.
- Reproducción de experimentos de tokenización byte BPE: el vocabulario de caracteres con una fusión inalcanzable permite estudiar el comportamiento del tokenizador en un caso límite documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones de identidad con 2 de 2 aciertos y advierte de que no debe inferirse calidad de benchmark a partir de ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable, dado el tamaño de 15.008 parámetros y un repositorio de 0,0 GB.
- GPU recomendadas: cualquier GPU con soporte de transformers o llama.cpp; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella es el lanzamiento del runtime, no el modelo.
- Opciones de despliegue: transformers, llama.cpp mediante el GGUF F16 incluido, Ollama con el tag `girgineron/alpina-micro-2.0:15k` y text-generation-inference por los tags del repositorio.
- Latencia y throughput: no disponibles; con este tamaño serán dominados por el overhead del framework y no por el cómputo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Micro 2.0 (Picalp) | 15.008 | No disponible | Apache-2.0 | Safetensors y GGUF F16 en HuggingFace | Experimento de personaje con sobreajuste de identidad |
| SmolLM2-135M | 135 M | No disponible en esta ficha | Apache-2.0 | HuggingFace | Modelo pequeño de propósito general; usado como fuente de datos por Alpina |
| Modelos de juguete tipo TinyStories | Variable, típicamente millones | No disponible | Variable | HuggingFace | Enfocados a narrativa simple; no comparables en identidad |

La comparación con alternativas de la misma categoría es limitada: no se dispone de datos de benchmarks ni de contexto para Alpina Micro 2.0, y su naturaleza experimental de personaje lo aleja de los modelos pequeños de propósito general.

## Limitaciones y advertencias

- No es un asistente general útil: el autor lo califica explícitamente de experimento de juguete.
- Sobreajuste extremo de identidad: responde con su nombre a preguntas no relacionadas, lo que invalida su uso en tareas reales.
- Evaluación muy limitada: solo se reportan comprobaciones de identidad, sin benchmarks de calidad.
- Riesgo de alucinación elevado por el tamaño y el régimen de entrenamiento; no debe usarse en producción.
- Contexto e idioma restringidos: solo inglés y, en la práctica, entrada ASCII en inglés según la model card.
- No se documentan salvaguardas frente a sesgos; el corpus de entrenamiento incluye datos filtrados de forma permisiva cuyo sesgo no se analiza.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero las licencias y avisos de los datasets de origen (ODC-BY, Apache-2.0) siguen aplicando a los datos, que no se redistribuyen.
- Las afirmaciones de identidad describen la personalización y no alteran la autoría del modelo original; no se implica afiliación con Qwen ni con los autores de los datasets.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Micro-2.0-15K
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Tag de Ollama: `girgineron/alpina-micro-2.0:15k`
