# mradermacher/UAV-PUR-4B-GGUF

## Resumen

UAV-PUR-4B-GGUF es la distribución en formato GGUF del modelo UAV-PUR-4B, un modelo vision-language orientado a tareas de percepción y razonamiento sobre imágenes aéreas capturadas por drones (UAV). El modelo original lo desarrolla Henard224, mientras que esta versión cuantizada la publica mradermacher, un perfil conocido por generar cuantizaciones GGUF estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo está etiquetado para tareas de *visual grounding*, conteo de objetos, razonamiento multimodal y análisis de escenas aéreas. La información disponible no detalla la arquitectura interna, el proceso de entrenamiento ni los datos utilizados; únicamente se confirma que es un modelo multimodal (los ficheros `mmproj` son el suplemento multimodal necesario para procesar imágenes) y que su idioma declarado es el inglés.

El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que sugiere un modelo reciente y de baja adopción pública. Es relevante para quienes necesitan ejecutar un modelo de visión especializado en imágenes de dron en hardware modesto, gracias a las cuantizaciones de 2 a 8 bits y a un tamaño total de repositorio de 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language multimodal; arquitectura interna no documentada) |
| Parametros totales | 415.347.712 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para la parte multimodal) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (tipo de transformer, mecanismo de atención, codificador visual empleado ni estrategia de fusión multimodal). Los metadatos indican que se trata de un modelo vision-language con capacidades de *visual grounding* y conteo, pero no se documentan los detalles técnicos internos.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado se limita a describir el proceso de cuantización estática (cuantizaciones no ponderadas, sin *imatrix*), y remite al modelo base para cualquier detalle adicional.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes.
- Vision-language: procesamiento conjunto de imagen y texto mediante los ficheros `mmproj`.
- Visual grounding: localización de objetos en imágenes aéreas.
- Conteo de objetos (*counting*) en escenas capturadas por drones.
- Razonamiento multimodal (*multimodal-reasoning*) sobre escenas aéreas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo *thinking*, audio, etc.): no disponible.

## Casos de uso

- Inspección de infraestructuras con drones: el modelo puede analizar imágenes aéreas de líneas eléctricas, puentes o tejados para identificar elementos y contar incidencias visibles, aprovechando su especialización en *visual grounding*.
- Agricultura de precisión: conteo de plantas, detección de rodales o estimación de densidad de cultivos a partir de fotografía aérea capturada por UAV, usando las cuantizaciones Q4_K_M o Q5_K_M para despliegue en estaciones locales.
- Vigilancia y monitorización de recintos: localización y conteo de vehículos o personas en imágenes de dron, con el modelo ejecutándose en local para evitar enviar imágenes a servicios en la nube.
- Análisis de escenas de emergencias: apoyo a equipos de rescate procesando imágenes aéreas para describir la escena y señalar elementos relevantes, gracias a la combinación de razonamiento multimodal y grounding.
- Procesamiento en el borde (*edge*): las cuantizaciones Q3_K_M, Q4_K_S o Q2_K permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU mediante llama.cpp, útil cuando la conectividad es limitada.
- Investigación en visión por computador: banco de pruebas para estudiar el comportamiento de modelos multimodales pequeños (415 M parámetros) en tareas de grounding y conteo sobre dominios aéreos.
- Prototipado rápido con llama.cpp/Ollama: al distribuirse en GGUF con ficheros `mmproj`, se puede integrar en aplicaciones de escritorio o scripts de Python sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en f16 ronda los 0,8-0,9 GB de pesos, más el suplemento multimodal (`mmproj-f16` de 0,9 GB o `mmproj-Q8_0` de 0,6 GB). En Q4_K_M el peso del modelo se reduce aproximadamente a 0,3-0,4 GB, más el `mmproj` elegido.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para las cuantizaciones pequeñas junto con el `mmproj`; una RTX 3060, RTX 4060 o RTX 4090 ejecutará el modelo con holgura. A100/H100 no son necesarias por el tamaño reducido.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier *runtime* compatible con GGUF y `mmproj` para modelos multimodales; la librería declarada es transformers para el modelo base.
- Latencia y throughput: no disponible; al ser un modelo de 415 M parámetros, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UAV-PUR-4B-GGUF | 415 M (según safetensors del base) | no disponible | apache-2.0 | GGUF | Especializado en imágenes de dron; solo inglés |
| mradermacher/Agent-R2-4B-GGUF | 4 B (según la ficha del repositorio) | no disponible | no disponible | GGUF | Modelo de agentes, no especializado en visión aérea |
| Modelos vision-language generalistas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para una comparación cuantitativa |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de alucinaciones; se recomienda validación empírica antes de usar en producción.
- El modelo está especializado en imágenes de dron; su comportamiento en imágenes genéricas o de otros dominios no está documentado.
- La longitud de contexto no está especificada, lo que impide planificar conversaciones multi-turno o prompts largos con garantías.
- Las cuantizaciones estáticas de mradermacher no incluyen versiones ponderadas con *imatrix*; la calidad relativa frente a cuantizaciones ponderadas no está verificada.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (Henard224/UAV-PUR-4B) y de los datos de entrenamiento originales, no documentadas aquí.
- El repositorio tiene 0 descargas y 0 *likes*: no hay evidencia pública de uso en producción ni informes de la comunidad.
- Los ficheros `mmproj` son imprescindibles para el procesamiento de imágenes; usar solo el GGUF del modelo sin el `mmproj` correspondiente desactivará la parte multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UAV-PUR-4B-GGUF
- Modelo base: https://huggingface.co/Henard224/UAV-PUR-4B
- Página de descargas del autor: https://hf.tst.eu/model#UAV-PUR-4B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
