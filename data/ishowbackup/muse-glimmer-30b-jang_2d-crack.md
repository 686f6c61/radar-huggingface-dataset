# Ishowbackup/Muse-Glimmer-30B-JANG_2D-CRACK

## Resumen

Muse-Glimmer-30B-JANG_2D-CRACK es una variante cuantizada y "abliterada" del modelo multimodal Muse-Glimmer-30B, desarrollado originalmente por OsaurusAI y modificado por el equipo de dealignai. El repositorio en HuggingFace está publicado por el usuario Ishowbackup. El modelo combina un backbone de visión-lenguaje basado en Gemma-3 (52 capas, atención deslizante y global, encoder de percepción) con el protocolo Onyx-ATEM, que separa los canales de razonamiento y respuesta, permite controlar el esfuerzo de razonamiento (low, medium, high, xhigh) e incluye tool calling agéntico mediante la sintaxis `<atem:invoke>`.

La versión JANG_2D aplica una cuantización mixta de precisión MLX affine con aproximadamente 2,96 bits efectivos, reduciendo el peso del modelo a unos 15 GB para ejecutarse en Apple Silicon. Además, la técnica CRACK (Controlled Refusal Ablation via Calibrated Knockouts) elimina a nivel de pesos los comportamientos de rechazo, logrando una tasa de cumplimiento del 99,6% en HarmBench con una pérdida mínima de capacidades (MMLU pasa de 71,1% a 70,7%). El modelo soporta inglés y chino, y mantiene intactas las capacidades de visión, razonamiento, generación de código y uso de herramientas.

Cabe señalar una discrepancia: aunque el nombre indica "30B", los pesos reales en safetensors suman 5.369.407.488 parámetros (~5,37B). Esto se debe probablemente a que la cuantización JANG_2D almacena los tensores en baja precisión, reduciendo drásticamente el número de parámetros efectivos. El modelo base original declara 30B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma-3 vision-language), 52 capas, atencion deslizante + global, encoder de percepcion |
| Parametros totales | 5.369.407.488 (segun safetensors; el modelo base declara 30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_2D (mixta 2-4 bits, ~2,96 bits efectivos); tambien existen JANG_4M y JANG_6M |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en Muse-Glimmer-30B, que a su vez utiliza un backbone Gemma-3 de vision-lenguaje con 52 capas, combinando atencion deslizante y global, e incorpora un encoder de percepcion para el procesamiento de imagenes. Sobre esta base, se aplican dos modificaciones principales:

- **CRACK**: tecnica de ablacion de rechazos a nivel de pesos que elimina los comportamientos de negativa del modelo sin afectar significativamente a sus capacidades generales. Segun los datos publicados, la perdida en MMLU es de solo 0,4 puntos (de 71,1% a 70,7%).
- **JANG_2D**: cuantizacion mixta de precision MLX affine que asigna 2-4 bits a diferentes tensores, manteniendo los criticos en alta precision. El resultado es un paquete de ~15 GB optimizado para Apple Silicon.

El entrenamiento original del modelo base no se detalla en la informacion disponible. La variante CRACK se evalua con un clasificador estricto en HarmBench, descartando respuestas vacias, plantillas o fugas del razonamiento. El protocolo Onyx-ATEM permite separar el razonamiento interno de la respuesta final y controlar el esfuerzo de razonamiento mediante el prompt de sistema.

## Capacidades

- **Vision-lenguaje**: comprension de imagenes y generacion de texto multimodal (pipeline image-text-to-text).
- **Razonamiento controlable**: esfuerzo de razonamiento configurable en cuatro niveles (low, medium, high, xhigh) mediante el prompt de sistema; el valor por defecto es high.
- **Tool calling agéntico**: soporte nativo del esquema ATEM `<atem:invoke>` para invocar funciones externas.
- **Multilingüe**: ingles y chino, ambos validados en las pruebas.
- **Generacion de codigo**: verificado en tareas como arboles rojo-negro, scrapers asincronos con aiohttp, APIs FastAPI con JWT y compiladores de expresiones.
- **Razonamiento avanzado**: demostrado en pruebas de matematicas, logica, diseno de sistemas y biologia molecular.
- **Sin rechazos**: al estar abliterado, el modelo no muestra comportamientos de negativa ante peticiones, incluyendo categorias de seguridad ofensiva.

## Casos de uso

- **Asistente de programacion con herramientas**: el modelo puede integrarse en entornos de desarrollo como agente que invoca funciones (ej. ejecutar tests, consultar APIs) mediante el esquema ATEM, gracias a su tool calling nativo y su capacidad de razonamiento multi-paso.
- **Analisis de imagenes con razonamiento**: al conservar el encoder de percepcion, puede describir, clasificar o razonar sobre contenido visual, util en tareas de documentacion tecnica o moderacion de contenido (aunque sin filtros de seguridad).
- **Agente autonomo para tareas de seguridad ofensiva**: su naturaleza abliterada y su capacidad de generar exploits, scripts de pentesting y workflows de Metasploit lo hacen util en entornos controlados de auditoria y formacion en ciberseguridad.
- **Generacion de contenido bilingüe**: soporta ingles y chino, permitiendo crear documentacion, traducciones o contenido de marketing en ambos idiomas con un unico modelo.
- **Prototipado rapido en Apple Silicon**: al ser un paquete MLX de ~15 GB, puede ejecutarse en portatiles Mac con memoria unificada, ideal para desarrollo local de aplicaciones de IA sin depender de GPUs NVIDIA.
- **Investigacion en alineacion y seguridad**: al estar abliterado, sirve como caso de estudio para analizar el impacto de la eliminacion de rechazos en las capacidades del modelo, comparando metricas como MMLU y HarmBench.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo base con la version CRACK, y las distintas cuantizaciones JANG entre si:

| Metrica | Base (sin CRACK) | JANG_2D CRACK | JANG_4M CRACK | JANG_6M CRACK |
|---|---|---|---|---|
| MMLU (57 materias, logit) | 71,1% | 70,7% | 81,1% | 81,4% |
| HarmBench (cumplimiento / ASR) | — | 99,6% (230/231) | 99,6% | 99,5% |

No se proporcionan resultados de benchmarks adicionales como HumanEval, GSM8K o MMLU-Pro. La evaluacion de capacidades se realizo mediante una suite de 20 prompts verificados manualmente, con resultados perfectos en seguridad/pentesting (8/8), codigo avanzado (4/4), razonamiento (4/4) y retencion de conocimiento (4/4).

## Requisitos de hardware

- **Almacenamiento**: ~15,9 GB (tamano del repositorio).
- **Memoria**: al ser un modelo MLX, utiliza memoria unificada de Apple Silicon; se estima que necesita al menos 16 GB de RAM para cargar los pesos en memoria.
- **GPU**: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No compatible con GPUs NVIDIA o AMD de forma nativa.
- **Opciones de despliegue**: vMLX (recomendado, soporta las sobreescrituras JANG, vision y los parsers ATEM) o cualquier runtime mlx-vlm con soporte para Muse Glimmer.
- **Latencia y throughput**: no se proporcionan datos especificos. Al ser una cuantizacion agresiva (~2,96 bits efectivos), se espera una inferencia rapida en hardware Apple, pero sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HarmBench | Licencia | Formato |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B (declarado) | No disponible | 71,1% | — | Apache-2.0 | safetensors (original) |
| Muse-Glimmer-30B-JANG_2D-CRACK | 5,37B (pesos reales) | No disponible | 70,7% | 99,6% | Apache-2.0 | safetensors (MLX) |
| Muse-Glimmer-30B-JANG_4M-CRACK | No disponible | No disponible | 81,1% | 99,6% | Apache-2.0 | safetensors (MLX) |
| Muse-Glimmer-30B-JANG_6M-CRACK | No disponible | No disponible | 81,4% | 99,5% | Apache-2.0 | safetensors (MLX) |

No se dispone de comparaciones con otros modelos de la misma categoria (por ejemplo, Gemma-3 27B o LLaVA) en la informacion proporcionada.

## Limitaciones y advertencias

- **Cuantizacion agresiva**: la version JANG_2D usa ~2,96 bits efectivos, lo que puede degradar la calidad de las respuestas en tareas complejas en comparacion con las versiones JANG_4M o JANG_6M (MMLU cae de 81,1% a 70,7%).
- **Sin garantias de seguridad**: al estar abliterado, el modelo no rechaza peticiones peligrosas o ilegales. Su uso en produccion debe limitarse a entornos controlados y con supervisión humana.
- **Idiomas limitados**: solo ingles y chino; no soporta otros idiomas de forma fiable.
- **Dependencia de Apple Silicon**: el formato MLX no es compatible con GPUs NVIDIA o AMD, lo que restringe su despliegue a hardware Apple.
- **Discrepancia de parametros**: el nombre indica 30B pero los pesos reales son ~5,37B; esto puede confundir a la hora de estimar requisitos o comparar con otros modelos.
- **Sin datos de contexto**: no se especifica la longitud de contexto soportada, lo que dificulta planificar tareas que requieran ventanas largas.
- **Riesgo de alucinacion**: no se han publicado evaluaciones de facticidad; al ser una cuantizacion extrema, el riesgo puede ser mayor que en el modelo original.
- **Restricciones de uso**: aunque la licencia es Apache-2.0, el caracter "uncensored" puede implicar restricciones legales o eticas en ciertos paises o plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-JANG_2D-CRACK
- Modelo base: https://huggingface.co/OsaurusAI/Muse-Glimmer-30B
- vMLX (inferencia recomendada): https://vmlx.net
- Otras cuantizaciones: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_6M-CRACK y https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_4M-CRACK
