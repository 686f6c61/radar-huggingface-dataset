# brainworkup/NuExtract3-oQ8

## Resumen

NuExtract3-oQ8 es una cuantización en 8 bits del modelo NuExtract3, publicada por el usuario brainworkup en Hugging Face. Se trata de un modelo de la familia qwen3_5 (según los metadatos del repositorio) con 4.539.265.536 parámetros totales, distribuido en formato MLX safetensors para su ejecución en hardware Apple Silicon a través del framework MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.4.5.dev1) en precisión mixta, con 8 bits y tamaño de grupo 64.

El modelo está pensado para tareas de extracción de información estructurada, a juzgar por el nombre "NuExtract" (una familia conocida de modelos de extracción de datos), aunque la model card no detalla explícitamente la tarea ni el pipeline. El repositorio tiene un tamaño de 5,2 GB y apenas 14 descargas, lo que indica que es una publicación reciente y de nicho, orientada a usuarios de MLX en macOS.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos de benchmarks, licencia, idiomas ni pipeline declarados. La model card únicamente documenta el proceso de cuantización y advierte de que los pesos se actualizaron el 1 de julio de 2026, reemplazando una versión anterior. El autor recomienda además usar una variante alternativa (NuExtract3-oQ8e-mtp) en lugar de esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun metadatos; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, precision mixta (oQ), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna mas alla de la etiqueta "qwen3_5" que aparece en los metadatos del repositorio, lo que sugiere que el modelo base pertenece a la familia Qwen 3.5. No se especifica si se trata de un transformer denso o de una variante con mezcla de expertos, ni se documentan la longitud de contexto, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo unico documentado es el proceso de cuantizacion: se aplico oQ (oMLX v0.4.5.dev1) con precision mixta a 8 bits y group size 64, generando pesos en formato MLX safetensors. La model card advierte de que esta cuantizacion se subio el 1 de julio de 2026 y reemplaza a una version anterior, por lo que los usuarios que descargaron el modelo antes de esa fecha deben volver a descargar los pesos actualizados.

## Capacidades

- Generacion de texto y extraccion de informacion estructurada: el nombre "NuExtract" sugiere uso para extraccion de campos y datos, aunque no se detalla en la model card.
- Ejecucion en Apple Silicon mediante MLX: los pesos estan optimizados para el framework MLX de Apple.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de datos estructurados en local sobre macOS: el modelo, al estar en formato MLX y cuantizado a 8 bits, puede ejecutarse en un Mac con Apple Silicon para convertir documentos o texto libre en JSON u otras estructuras, sin depender de la nube.
- Prototipado rapido en entornos Apple: gracias a su tamano de aproximadamente 4,5 mil millones de parametros y a la cuantizacion de 8 bits, es viable probar pipelines de extraccion en un portatil Mac antes de escalar a produccion.
- Procesamiento por lotes de documentos en un equipo de sobremesa: el modelo puede integrarse en scripts de Python con MLX para procesar lotes de textos y extraer campos de forma automatizada.
- Desarrollo de asistentes de extraccion de informacion en aplicaciones nativas de macOS: al ejecutarse con MLX, puede embeberse en herramientas locales que necesiten privacidad de datos.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantizacion de 8 bits frente al modelo original en tareas de extraccion.
- Filtrado y enriquecimiento de datos en pipelines locales: el modelo puede usarse para anotar o estructurar grandes volumenes de texto en un flujo de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantizacion de 8 bits con aproximadamente 4,54 mil millones de parametros, el peso de los pesos ronda los 4,5-5 GB (el repositorio ocupa 5,2 GB). La memoria unificada necesaria para inferencia con contexto moderado se estima en torno a 6-8 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: al ser un modelo MLX, esta pensado para Apple Silicon (series M1, M2, M3, M4 y superiores). No se documenta soporte para GPU NVIDIA.
- Cabe en consumer hardware: si, en equipos Mac con al menos 8-16 GB de memoria unificada, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: MLX (framework nativo), con la libreria mlx y herramientas compatibles con safetensors MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NuExtract3-oQ8 (este) | ~4,54 B | no disponible | MLX safetensors 8-bit | no disponible | Cuantizacion oQ para Apple Silicon |
| NuExtract3-oQ8e-mtp | no disponible | no disponible | MLX safetensors | no disponible | Variante recomendada por el autor |
| Modelo base NuExtract3 | no disponible | no disponible | no disponible | no disponible | Origen de esta cuantizacion |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de casos de uso multilingues o con documentos largos.
- Al ser una cuantizacion de 8 bits, es esperable una degradacion de calidad respecto al modelo original, aunque no se han publicado mediciones que la cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que lo acoten en tareas de extraccion.
- Sesgos conocidos: no documentados.
- El autor recomienda usar la variante NuExtract3-oQ8e-mtp en lugar de esta, lo que sugiere que esta version puede estar desactualizada o ser inferior.
- Los pesos se actualizaron el 1 de julio de 2026; descargas anteriores pueden contener pesos obsoletos.
- El modelo esta ligado al ecosistema MLX y Apple Silicon, lo que restringe su despliegue en infraestructura con GPU NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/NuExtract3-oQ8
- Variante recomendada por el autor: https://huggingface.co/brainworkup/NuExtract3-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
