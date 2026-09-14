# ANGELOSEGRETO/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, presentado como parte de la familia gpt-oss y orientado a razonamiento intensivo, tareas agénticas y uso general en producción. Se trata de un transformer con mezcla de expertos (MoE) de aproximadamente 117.000 millones de parámetros totales y 5.100 millones de parámetros activos por token, entrenado sobre el formato de respuesta harmony, que es obligatorio para su correcto funcionamiento.

La ficha que se documenta aquí corresponde al repositorio ANGELOSEGRETO/gpt-oss-120b, una republicación de terceros del repositorio oficial openai/gpt-oss-120b alojada en Hugging Face. El repositorio cuenta con 0 descargas y 0 «likes» en el momento de la consulta, fue creado el 13 de septiembre de 2026 y ocupa 195,8 GB. El recuento real de parámetros leído de los archivos safetensors es de 116.829.156.672.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 sin restricciones de copyleft, la cuantización MXFP4 de los pesos MoE que permite ejecutar la variante de 120B en una única GPU de 80 GB (por ejemplo, NVIDIA H100 o AMD MI300X), y el nivel de esfuerzo de razonamiento configurable (bajo, medio, alto) junto con acceso completo a la cadena de pensamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); la model card menciona explícitamente la cuantización de los pesos MoE |
| Parámetros totales | 116.829.156.672 (aproximadamente 117B según la model card) |
| Parámetros activos | 5.100 millones (5,1B) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | MXFP4 (cuantización de post-entrenamiento de los pesos MoE, aplicada por el propio autor); etiquetas del repositorio: 8-bit, mxfp4 |
| Idiomas soportados | no disponibles (el repositorio no declara listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Formato de prompt | harmony response format (obligatorio) |
| Pipeline | text-generation |
| Tamaño del repositorio | 195,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (repúblicación) | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card confirma una arquitectura de mezcla de expertos con 117.000 millones de parámetros totales y 5.100 millones activos, y detalla que los modelos se post-entrenaron con cuantización MXFP4 de los pesos MoE. Esta cuantización es la que permite que la variante de 120B quepa en una sola GPU de 80 GB y que la variante de 20B quepa en 16 GB de memoria; según el autor, todas las evaluaciones se realizaron con esa misma cuantización MXFP4. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacada es el formato de respuesta harmony, que estructura los mensajes y es de uso obligatorio: el autor advierte explícitamente de que el modelo no funcionará correctamente si no se utiliza dicho formato. Sobre él se apoyan el esfuerzo de razonamiento configurable (low, medium, high), la exposición completa de la cadena de pensamiento —destinada a depuración y no a mostrarse al usuario final—, las capacidades agénticas nativas (function calling, navegación web y ejecución de código Python en el repositorio oficial) y el soporte de salidas estructuradas. El modelo también está preparado para ajuste fino por parámetros.

## Capacidades

- Generación de texto conversacional con plantilla de chat que aplica automáticamente el formato harmony.
- Razonamiento con esfuerzo configurable en tres niveles (low, medium, high), ajustable según latencia y complejidad.
- Acceso completo a la cadena de pensamiento, pensado para depuración e inspección del proceso de razonamiento, no para mostrarse al usuario final.
- Function calling / tool calling nativo.
- Navegación web mediante herramientas, según el repositorio oficial de gpt-oss.
- Ejecución de código Python como herramienta.
- Salidas estructuradas (structured outputs).
- Capacidades agénticas y razonamiento multi-paso.
- Ajuste fino completo de parámetros.
- Capacidades multilingües: no confirmadas en la información proporcionada (el repositorio no declara idiomas).
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con tool calling para consultar sistemas internos (estado de pedidos, facturación) y con esfuerzo de razonamiento bajo o medio para reducir latencia en consultas simples. Requiere respetar el formato harmony en la capa de orquestación.
- Agentes autónomos de investigación: combinación de navegación web, ejecución de código Python y razonamiento multi-paso para tareas como recopilar datos de varias fuentes, procesarlos con scripts y generar un informe estructurado. El nivel de esfuerzo «high» es adecuado para estos flujos.
- Asistencia y revisión de código en producción: integración en pipelines de CI/CD mediante function calling para consultar repositorios, ejecutar tests y proponer parches, con salidas estructuradas que facilitan el parseo automático.
- Extracción de información estructurada de documentos: uso de structured outputs para convertir texto libre (contratos, informes, correos) en JSON con un esquema fijo, aprovechando la cadena de pensamiento para tareas de clasificación y desambiguación.
- Copiloto de análisis de datos: el modelo puede generar y ejecutar código Python sobre conjuntos de datos dentro de un entorno controlado, iterando sobre los resultados, lo que encaja con su soporte nativo de ejecución de código.
- Enrutamiento y orquestación de agentes: al ser desplegable en una sola GPU de 80 GB con el servidor compatible con OpenAI de vLLM, puede actuar como modelo central de un sistema multi-agente que exponga una API compatible con OpenAI.
- Generación de documentación técnica y resúmenes largos: con razonamiento de nivel medio y salidas estructuradas, útil para transformar documentación dispersa en guías organizadas por secciones.
- Entrenamiento y destilación: al ser ajustable por parámetros completos y tener licencia Apache 2.0, sirve como modelo base para fine-tuning específico de dominio o para generar datos sintéticos con la cadena de pensamiento visible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que todas las evaluaciones se realizaron con la misma cuantización MXFP4, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación en el material proporcionado. Los resultados de la búsqueda web no contenían enlaces ni datos relevantes sobre este modelo.

## Requisitos de hardware

- Según la model card, gpt-oss-120b está diseñado para caber en una sola GPU de 80 GB, como NVIDIA H100 o AMD MI300X, gracias a la cuantización MXFP4.
- La variante gpt-oss-20b está pensada para ejecutarse dentro de 16 GB de memoria.
- Estimación derivada del recuento de parámetros (116,83 mil millones): en bf16/fp16 los pesos ocuparían aproximadamente 234 GB; en int8, aproximadamente 117 GB; en MXFP4 (4 bits), aproximadamente 59 GB, en todos los casos sin contar caché KV ni sobrecarga del runtime. Estas cifras son estimaciones aritméticas, no datos publicados.
- El repositorio republicado ocupa 195,8 GB, un tamaño notablemente superior al que correspondería a una distribución puramente MXFP4, por lo que conviene verificar el formato y la precisión reales de los pesos antes de planificar el despliegue.
- GPU de consumo: con 24 GB de VRAM (RTX 4090, RTX 3090) no es posible alojar los pesos completos sin offloading a CPU o cuantizaciones más agresivas, lo que degradaría la latencia. No hay datos publicados de rendimiento en ese escenario.
- Opciones de despliegue documentadas por el autor: transformers (pipeline y Transformers Serve), vLLM (versión 0.10.1+gptoss con índice de wheels específico), implementaciones de referencia en PyTorch/Triton del repositorio gpt-oss, Ollama (gpt-oss:120b) y LM Studio (lms get openai/gpt-oss-120b).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Memoria objetivo | Licencia | Caso de uso declarado |
|---|---|---|---|---|---|
| gpt-oss-120b | 117B | 5,1B | GPU única de 80 GB (H100, MI300X) con MXFP4 | Apache 2.0 | Producción, propósito general, razonamiento alto |
| gpt-oss-20b | 21B | 3,6B | 16 GB de memoria | Apache 2.0 (misma familia) | Baja latencia, uso local o especializado |

No se dispone de datos comparativos frente a otros modelos de la misma categoría (por ejemplo, alternativas MoE de tamaño similar de otros fabricantes) en la información proporcionada, ni de resultados de benchmarks que permitan una comparación de rendimiento. La comparación se limita, por tanto, a las dos variantes de la propia familia gpt-oss documentadas en la model card.

## Limitaciones y advertencias

- El formato harmony es obligatorio. El autor advierte de que el modelo no funcionará correctamente si no se usa; al invocar model.generate directamente hay que aplicar la plantilla de chat o el paquete openai-harmony de forma manual.
- La cadena de pensamiento es de acceso completo, pero no está pensada para mostrarse al usuario final. Exponerla en producción puede revelar razonamiento interno y aumentar el riesgo de filtración de información.
- Repúblicación de terceros: el repositorio ANGELOSEGRETO/gpt-oss-120b tiene 0 descargas y 0 «likes», y no hay verificación de integridad publicada. Se recomienda contrastar los pesos con el repositorio oficial openai/gpt-oss-120b antes de usarlos.
- Discrepancia de tamaño: el repositorio ocupa 195,8 GB, muy por encima de lo esperable para pesos en MXFP4, lo que puede afectar a los requisitos de almacenamiento, al tiempo de descarga y a la memoria necesaria si los pesos no están en el formato previsto.
- No se han publicado resultados de benchmarks en este repositorio ni en la información disponible, por lo que no es posible validar el rendimiento con datos propios.
- Sesgos conocidos: no disponibles en la información proporcionada. No hay evaluación de sesgos publicada en el material consultado.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se han proporcionado tasas de alucinación ni evaluaciones de fidelidad para este modelo.
- Cobertura de idiomas: el repositorio no declara un listado de idiomas soportados, por lo que no se puede garantizar el rendimiento en castellano ni en otras lenguas distintas del inglés sin evaluación previa.
- Longitud de contexto: no declarada en la información proporcionada; conviene verificarla en la configuración del modelo antes de diseñar aplicaciones que dependan de ventanas largas.
- Licencia: Apache 2.0, permisiva y sin restricciones de copyleft, lo que permite uso comercial, modificación y redistribución. Es responsabilidad del usuario verificar que la repúblicación mantiene los términos y avisos de la licencia original.
- Producción: al requerir una GPU de 80 GB para la configuración recomendada, el coste de infraestructura es elevado; no hay datos publicados de latencia ni de throughput para dimensionar un despliegue.

## Enlaces

- Repositorio documentado: https://huggingface.co/ANGELOSEGRETO/gpt-oss-120b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-120b
- Variante pequeña: https://huggingface.co/openai/gpt-oss-20b
- Colección de la familia gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio del proyecto: https://gpt-oss.com
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Artículo (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio en GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo en los resultados disponibles.
