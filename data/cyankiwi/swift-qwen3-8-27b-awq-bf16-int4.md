# cyankiwi/Swift-Qwen3.8-27B-AWQ-BF16-INT4

## Resumen

Swift-Qwen3.8-27B-AWQ-BF16-INT4 es una redistribución cuantizada del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario cyankiwi. El modelo base es a su vez un ajuste fino de Qwen3.8-27B orientado a la eficiencia de razonamiento: según su autor (UkisAI), reduce el número de tokens de "pensamiento" en un 58,3 % manteniendo una pérdida de rendimiento inferior al 1 % y logrando hasta x1,95 de aceleración en varias tareas. Esta variante concreta aplica cuantización INT4 tipo AWQ (con activaciones en BF16) mediante la librería compressed-tensors, con el objetivo de reducir los requisitos de memoria para despliegue.

El modelo cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y está etiquetado con el pipeline image-text-to-text, lo que indica capacidades multimodales de imagen y texto, además de razonamiento y conversación. El repositorio ocupa 28,9 GB, un tamaño notablemente superior al esperable para pesos INT4 puros, por lo que conviene verificar la composición real del repositorio antes de dimensionar el despliegue.

La relevancia de esta ficha está en que se trata de una variante de cuantización pensada para servir el modelo en GPUs de gama alta de consumo o en una única GPU profesional, con licencia swift-open-license-1.0 y acceso restringido (gated). No hay resultados de benchmarks numéricos publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (etiquetas qwen3_8 y qwen3_5); no se especifica si es denso o MoE |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 AWQ con activaciones BF16, formato compressed-tensors; existe una version GGUF del modelo base en otro repositorio |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (10 idiomas, segun la model card del autor) |
| Licencia | swift-open-license-1.0 (categoria "other"), con acceso restringido (gated) |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | ukisai/Swift-Qwen3.8-27b (relacion: finetune) |
| Tamano del repositorio | 28,9 GB (28,85 GB declarados en la model card) |
| Version de cuantizacion | 26.05.01 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.8-27B, un transformer de aproximadamente 27,8 mil millones de parámetros que en este repositorio se sirve en una variante cuantizada a INT4 con el esquema AWQ y activaciones BF16, empaquetada con compressed-tensors. La cuantización fue realizada por cyankiwi usando un conjunto de calibración orientado a dominios STEM y agénticos (dataset cyankiwi/calibration, version 26.05.01). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo fases de RLHF o DPO.

En cuanto al ajuste fino que da origen al modelo base (Swift), el autor indica que identificó tokens marcadores de razonamiento que, según su análisis, disparan el "sobrepensamiento" (overthinking) en los rollouts de razonamiento de Qwen, y que ajustó el modelo penalizando el uso de esos tokens durante el razonamiento. El resultado declarado son trazas de razonamiento más cortas y, según sus pruebas, menos errores por sobrepensamiento. El entrenamiento incorpora además un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. No se detallan hiperparámetros, metodología de evaluación ni el proceso de cuantización más allá de la calibración indicada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo de "pensamiento" optimizado para consumir menos tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado), lo que implica entrada multimodal.
- Razonamiento eficiente en tokens: el autor reporta un 58,3 % menos de tokens de pensamiento con menos del 1 % de pérdida de rendimiento.
- Soporte multilingüe declarado en 10 idiomas: inglés, chino, hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español.
- Ajuste mediante LoRA (etiqueta lora presente en el repositorio), lo que permite adaptaciones posteriores sobre el modelo.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes: la calibración de la cuantización se hizo con datos "STEM and Agentic", lo que sugiere uso previsto en flujos agénticos, aunque no se documentan capacidades agénticas concretas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Despliegue de razonamiento en una sola GPU: al estar cuantizado a INT4, permite servir un modelo de 27,8 B en GPUs de 24 GB o más, reduciendo coste de infraestructura frente a la versión BF16 del modelo base.
- Asistentes conversacionales multi-turno: el formato conversacional y el soporte multilingüe (incluido español) permiten atender usuarios en varios idiomas desde un único despliegue.
- Automatización de tareas de razonamiento con coste por token reducido: la reducción del 58,3 % en tokens de pensamiento declarada por el autor abarata los flujos que facturan por token de salida, como pipelines de análisis o resolución de problemas.
- Tareas STEM asistidas por imagen: el pipeline image-text-to-text permite interpretar diagramas, gráficos o capturas junto con una pregunta textual, útil en educación técnica o soporte de ingeniería.
- Agentes con razonamiento encadenado: la calibración sobre datos agénticos y el ajuste orientado a evitar sobrepensamiento lo hacen adecuado para cadenas de decisión donde la latencia importa.
- Integración en entornos con transformers: al usar safetensors y la librería transformers con compressed-tensors, se puede cargar directamente en servicios existentes basados en HuggingFace.
- Prototipado e investigación sobre eficiencia de razonamiento: sirve como punto de partida para estudiar el efecto de penalizar tokens de sobrepensamiento en modelos Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del autor incluye una tabla de evaluacion, pero su contenido no esta accesible en los datos proporcionados (solo se recupera el marcado de la tabla, no las puntuaciones). El autor declara comparaciones entre Qwen3.8-27B en BF16 y la misma base con el adaptador Swift, con los siguientes valores agregados:

| Metrica declarada | Valor |
|---|---|
| Reduccion de tokens de pensamiento | 58,3 % menos |
| Perdida de rendimiento | inferior al 1 % |
| Aceleracion en varias tareas | x1,95 |

Estos datos son afirmaciones del autor y no se acompanan de puntuaciones absolutas por benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para BF16/FP16 (modelo base sin cuantizar): en torno a 55-60 GB solo para pesos, mas cache KV y activaciones.
- VRAM estimada para esta version INT4: teoricamente unos 14-15 GB de pesos; el repositorio ocupa 28,9 GB, por lo que hay que verificar que solo se cargan los tensores cuantizados antes de dimensionar el sistema. Como referencia practica, reserve 18-22 GB de VRAM con contexto moderado.
- GPUs recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para el modelo base en BF16; para la version INT4 es suficiente una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 (32 GB), siempre que el consumo real de memoria se confirme.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y superiores de 24 GB o mas, dado el esquema INT4.
- Opciones de despliegue: vLLM (soporta AWQ y compressed-tensors), transformers con compressed-tensors, TGI y, a traves de la version GGUF del modelo base (ukisai/Swift-Qwen3.8-27B-GGUF), llama.cpp y Ollama.
- Latencia y throughput: no disponibles. El autor declara una aceleracion de x1,95 respecto al base, atribuible a la menor generacion de tokens de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyankiwi/Swift-Qwen3.8-27B-AWQ-BF16-INT4 | 27,8 B | no disponible | safetensors INT4 AWQ (compressed-tensors) | swift-open-license-1.0 (gated) | HuggingFace |
| ukisai/Swift-Qwen3.8-27b (base) | 27,8 B | no disponible | safetensors BF16; GGUF en repositorio aparte | swift-open-license-1.0 (gated) | HuggingFace |
| Qwen3.8-27B (modelo original) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes de tamano similar (por ejemplo, modelos densos de 27-32 B de otras familias), ya que no se han proporcionado especificaciones ni puntuaciones de benchmarks de esos modelos en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta marcado como gated, por lo que es necesario solicitar acceso para descargarlo.
- Licencia no estandar: swift-open-license-1.0 se clasifica como "other". Hay que revisar el texto completo en el enlace de licencia antes de cualquier uso comercial o redistribucion, ya que las condiciones de uso empresarial no estan detalladas en la informacion disponible.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; es un riesgo inherente a los modelos de lenguaje y no hay datos especificos para esta variante.
- Sesgos: no se ha publicado informacion sobre sesgos demograficos, culturales o linguisticos del modelo base ni del ajuste fino.
- Contexto e idiomas: la longitud de contexto no esta disponible, lo que impide planificar aplicaciones que dependan de ventanas largas; el soporte de 10 idiomas es una declaracion del autor sin evaluacion publicada por idioma.
- Efecto de la cuantizacion: la conversion a INT4 puede degradar ligeramente la calidad respecto al modelo base en BF16; no se proporcionan comparativas de calidad entre ambas versiones.
- Cifras de rendimiento no verificables: las afirmaciones de 58,3 % menos tokens y x1,95 de aceleracion provienen del autor y no van acompanadas de la tabla completa de resultados en la informacion disponible.
- Sin validacion de la comunidad: el repositorio presenta 0 descargas y 0 "likes", por lo que no existe retroalimentacion independiente sobre su funcionamiento.
- Fechas inconsistentes: la fecha de creacion indicada (2026-09-18) es posterior a la fecha actual habitual de publicacion, lo que conviene tener en cuenta al evaluar la trazabilidad del repositorio.
- Compatibilidad de tool calling y agentes: no confirmada de forma explicita para esta variante cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyankiwi/Swift-Qwen3.8-27B-AWQ-BF16-INT4
- Modelo base (Swift-Qwen3.8-27b): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Version GGUF del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Dataset de calibracion (STEM and Agentic): https://huggingface.co/datasets/cyankiwi/calibration
- Componente de transferencia (ThinkingCap-Qwen3.6-27B): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Sitio del autor del modelo base: https://ukisai.com
- Informacion de producto de Swift: https://ukisai.com/products/swift
- Contacto indicado en la model card: ton@cyan.kiwi
- Resultados de busqueda web: no se han recuperado enlaces relevantes sobre este modelo; los resultados disponibles no guardan relacion con el contenido de la ficha.
