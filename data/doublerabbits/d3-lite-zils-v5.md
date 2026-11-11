# DoubleRabbits/d3-lite-zils-v5

## Resumen

DoubleRabbits/d3-lite-zils-v5 es un modelo de decisión afinado (fine-tuned) publicado por el usuario DoubleRabbits en Hugging Face. Se trata de un ajuste mediante LoRA de rango 16 sobre el chasis d3-lite-0.8b-v1, que a su vez deriva de Qwen3.5-0.8B, una arquitectura de la familia Qwen 3.5 con un total de 852.985.920 parámetros. El modelo está orientado a la toma de decisiones dentro del ecosistema denominado «Zils d3-lite soup pool», un conjunto de variantes afinadas sobre la misma base.

El problema que aborda es acotado y específico: generar decisiones estructuradas a partir de contextos dados, entrenado con 2000 decisiones sintéticas generadas con semilla 4. No se trata de un modelo de propósito general, sino de un componente especializado dentro de un pipeline mayor, por lo que su relevancia debe evaluarse en ese contexto de integración y no como alternativa a modelos conversacionales generalistas.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos del repositorio. No se han publicado resultados de benchmarks, idiomas soportados ni detalles sobre la composición del dataset de entrenamiento más allá del número de muestras y la semilla. El repositorio ocupa 1,7 GB y emplea formato safetensors con código personalizado (custom_code), lo que implica que su carga requiere confiar en la implementación incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (chasis d3-lite-0.8b-v1), con código personalizado |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se desconoce si existen versiones GGUF o AWQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B a través del chasis d3-lite-0.8b-v1, lo que sitúa la arquitectura base en la familia Qwen 3.5, un transformer de aproximadamente 853 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16, un método de bajo rango que congela los pesos originales y entrena matrices de adaptación, reduciendo el coste computacional del entrenamiento. El resultado se distribuye como un checkpoint completo en safetensors con código personalizado, lo que sugiere que la implementación de la arquitectura o del pipeline de inferencia no es estándar y requiere el código incluido en el repositorio.

El entrenamiento se realizó sobre 2000 decisiones sintéticas generadas con semilla 4, un volumen reducido que apunta a un ajuste de comportamiento muy focalizado más que a una adquisición amplia de capacidades. No se especifican el número de tokens, la composición del dataset, la presencia de RLHF o DPO, ni la mezcla de datos. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible no permite evaluar la calidad ni la diversidad del corpus sintético empleado.

## Capacidades

- Generación de decisiones estructuradas dentro del dominio del «Zils d3-lite soup pool», que es el objetivo declarado del ajuste.
- Herencia de las capacidades base de Qwen3.5-0.8B, aunque no se documenta cuáles se conservan tras el ajuste LoRA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Selección de decisiones en pipelines internos: el modelo puede emplearse como clasificador o generador de decisiones dentro de un sistema mayor, dado que fue entrenado específicamente sobre 2000 decisiones sintéticas de un dominio concreto.
- Componente de enrutamiento en sistemas multi-modelo: por su tamaño reducido (853 M parámetros), puede actuar como nodo de decisión que derive consultas a modelos mayores, siempre que el dominio de decisión coincida con el del ajuste.
- Prototipado rápido de lógica de decisión: al ser un checkpoint pequeño y con licencia Apache 2.0, permite iterar sobre reglas de decisión en entornos de desarrollo sin coste de licencia.
- Experimentación académica sobre ajuste LoRA: sirve como ejemplo reproducible de fine-tuning de rango 16 sobre una base Qwen3.5-0.8B con un dataset sintético de tamaño conocido y semilla fija.
- Pruebas de integración de código personalizado: útil para validar pipelines que cargan modelos con `custom_code` y verificar la compatibilidad con el ecosistema de Hugging Face Transformers.
- Evaluación comparativa de variantes del pool: al pertenecer a un conjunto de variantes («soup pool»), puede usarse para comparar el efecto de distintos ajustes sobre la misma base en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 3,4 GB para los pesos, más overhead de activaciones y del código personalizado.
- VRAM estimada en FP16/BF16: aproximadamente 1,7 GB para los pesos, más overhead.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para los pesos; en 4 bits, aproximadamente 0,5 GB, aunque no se confirma que existan versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo en FP16, como una GTX 1650, RTX 3050 o superiores; para FP32 se recomienda al menos 6 GB.
- Cabe en GPU consumer: sí, por el tamaño reducido del checkpoint.
- Opciones de despliegue: al requerir `custom_code`, la carga mediante vLLM, TGI o llama.cpp no está garantizada; el camino más seguro es Transformers con `trust_remote_code=True`. No se documenta soporte para Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DoubleRabbits/d3-lite-zils-v5 | 853 M | No disponible | Apache 2.0 | Hugging Face, requiere custom_code |
| Qwen3.5-0.8B (base) | ~800 M | No disponible en la información | No disponible en la información | Hugging Face |
| d3-lite-0.8b-v1 (chasis) | ~800 M | No disponible | No disponible | Referenciado por el autor, disponibilidad no confirmada |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El entrenamiento con solo 2000 decisiones sintéticas limita la generalización; el modelo puede fallar fuera del dominio exacto del «Zils d3-lite soup pool».
- Riesgo de alucinación elevado en tareas abiertas, ya que el ajuste está orientado a decisiones y no a generación factual verificada.
- No se documentan sesgos conocidos, pero la naturaleza sintética del dataset y la ausencia de información sobre su composición impiden descartar sesgos sistemáticos.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no disponible; no se recomienda su uso en conversaciones de contexto largo.
- El uso de `custom_code` implica ejecutar código del autor al cargar el modelo; debe revisarse antes de desplegarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre el dataset hace recomendable una evaluación propia antes de integrarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-v5
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
