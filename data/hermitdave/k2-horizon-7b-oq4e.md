# hermitdave/K2-Horizon-7B-oQ4e

## Resumen

K2-Horizon-7B-oQ4e es una cuantización de precisión mixta 4-bit (oQ4e) del modelo denso de razonamiento IFM/K2-Horizon-7B, desarrollado por el Institute of Foundation Models (IFM). Esta versión ha sido convertida al formato MLX por hermitdave para su uso en Apple Silicon, lo que permite ejecutar el modelo localmente con un consumo de memoria reducido. El modelo original pertenece a la familia K2 Horizon, una flota de seis modelos de IA fundamentales de código abierto que abarca desde 0,9 mil millones hasta 375 mil millones de parámetros, con pesos, código, datos de entrenamiento y metodologías disponibles para su inspección y reproducción.

Aunque el nombre del modelo indica 7B, el checkpoint contiene 8.999.178.240 parámetros (~9B). Se trata de un modelo denso, no de mezcla de expertos (MoE), con una ventana de contexto de 512.000 tokens, lo que le permite procesar documentos muy extensos y mantener razonamientos complejos en tareas de larga duración. Los benchmarks publicados muestran un rendimiento destacado en tareas de ingeniería de software (SWE-bench Verified 70,6), matemáticas (HMMT Feb 2026 73,3) y navegación web (BrowseComp 59,0), lo que lo convierte en una opción interesante para investigación y aplicaciones de agentes.

El modelo original se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación. Esta conversión oQ4e reduce el tamaño del repositorio a 5,3 GB, facilitando el despliegue en equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso de razonamiento (arquitectura exacta no disponible) |
| Parametros totales | 8.999.178.240 (~9B) |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | oQ4e (4-bit de precision mixta mejorada con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo denso de razonamiento, sin componentes de mezcla de expertos. La familia K2 Horizon incluye modelos densos y MoE; este checkpoint en concreto pertenece a la categoría de modelos compactos para experimentación local. Según la información disponible, no se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de alineación como RLHF o DPO. La press release de IFM indica que los modelos son completamente abiertos, incluyendo pesos, código, datos de entrenamiento y metodologías, pero no se han proporcionado los detalles específicos en la información consultada.

La conversión oQ4e utiliza cuantización de precisión mixta mejorada con imatrix, que asigna más bits a las capas más sensibles, lo que busca minimizar la pérdida de calidad frente a una cuantización 4-bit uniforme. El modelo está diseñado para ser usado con una configuración de razonamiento alta (`reasoning_effort="high"`) para obtener los mejores resultados.

## Capacidades

- Razonamiento y resolución de problemas: modelo de razonamiento que genera cadenas de pensamiento; el chat template admite el parámetro `reasoning_effort`.
- Ingeniería de software: obtiene 70,6 en SWE-bench Verified, lo que sugiere capacidad para resolver issues reales de código.
- Tareas de terminal/agente: 39,06 en Terminal-Bench 2.1, indicando destreza en entornos de línea de comandos.
- Matemáticas: 73,3 en HMMT Feb 2026, un benchmark de matemáticas de nivel olímpico.
- Navegación web: 59,0 en BrowseComp, lo que apunta a habilidades de búsqueda y navegación web.
- Dominio bancario: 25,8 en tau3-Banking, que mide comprensión de textos financieros.
- Contexto largo: ventana de 512.000 tokens para procesar documentos extensos.
- No se especifica soporte explícito de tool calling/function calling en la información disponible.

## Casos de uso

- Desarrollo de agentes de software: con un 70,6 en SWE-bench Verified, el modelo puede integrarse en pipelines de automatización para resolver issues de GitHub, revisar código y proponer parches. Su contexto de 512K permite mantener el repositorio completo en la ventana.
- Asistente de terminal para DevOps: el rendimiento en Terminal-Bench 2.1 (39,06) lo hace apto para agentes que ejecutan comandos, interpretan salidas y automatizan tareas de administración de sistemas, aunque se debe verificar el soporte de tool calling.
- Razonamiento matemático y científico: con 73,3 en HMMT, puede utilizarse como tutor de matemáticas avanzadas o para resolver problemas de investigación que requieren razonamiento simbólico.
- Análisis de documentos largos: la ventana de 512K permite procesar contratos legales, informes financieros, artículos científicos o libros completos en una sola consulta, gracias a su capacidad de razonamiento.
- Investigación reproducible: al ser un modelo abierto con pesos, código y datos publicados (según IFM), es adecuado para laboratorios que necesitan analizar checkpoints por etapas y reproducir experimentos.
- Búsqueda web y navegación asistida: el resultado de 59,0 en BrowseComp sugiere que puede utilizarse para tareas de búsqueda complejas, como encontrar información en múltiples páginas y sintetizar respuestas.
- Análisis financiero y bancario: el 25,8 en tau3-Banking, aunque modesto, indica cierta capacidad para procesar documentos de banca, lo que puede ser útil en sistemas de atención al cliente de entidades financieras.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original (IFM/K2-Horizon-7B). Estos valores corresponden al modelo sin cuantizar; la conversión oQ4e puede presentar variaciones.

| Benchmark | K2-Horizon-7B |
|---|---|
| SWE-bench Verified | 70,6 |
| Terminal-Bench 2.1 | 39,06 |
| tau3-Banking | 25,8 |
| BrowseComp | 59,0 |
| HMMT Feb 2026 | 73,3 |

Nota: no se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 5,3 GB, por lo que la inferencia básica requiere al menos 6 GB de memoria unificada en Apple Silicon. Para contextos largos (512K), la memoria necesaria aumentará significativamente; no se dispone de cifras oficiales.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con 16 GB o más de RAM unificada, ya que el modelo está cuantizado en formato MLX.
- No se ha documentado soporte para GPU NVIDIA en este formato; para ello sería necesario convertir los pesos a GGUF o a otra cuantización compatible con CUDA.
- Opciones de despliegue: mlx-lm (recomendado, según la model card), vLLM (mencionado en los recipes), y potencialmente llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La familia K2 Horizon incluye modelos de distintos tamaños (desde 0,9B hasta 375B) y arquitecturas (densos y MoE), pero no se han facilitado resultados de benchmarks de otros miembros de la familia en la documentación consultada. Se recomienda consultar el model card upstream para comparaciones detalladas.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos ni riesgos específicos de seguridad.
- Al ser una cuantización 4-bit, puede existir una degradación del rendimiento respecto al modelo original, especialmente en tareas de razonamiento complejo.
- Los benchmarks publicados corresponden al modelo original; la cuantización oQ4e puede alterar los resultados.
- El soporte de idiomas no está documentado; es probable que el modelo esté optimizado para inglés, pero no se confirma.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar los avisos de licencia y atribución.
- No se ha verificado el soporte de tool calling/function calling en la información disponible, por lo que su uso en agentes con herramientas requiere validación previa.
- El repositorio tiene la etiqueta `custom_code`, lo que implica que puede requerir código adicional para su carga.
- El modelo está fechado en 2026 y la documentación es muy reciente; puede haber poca experiencia de producción acumulada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-7B-oQ4e
- Modelo upstream: https://huggingface.co/IFM/K2-Horizon-7B
- Blog de IFM: https://ifm.ai/blog/k2/
- Press release de K2 Horizon: https://ifm.ai/k2/press-release/
- Recetas de vLLM: https://recipes.vllm.ai/IFM/K2-Horizon-7B
