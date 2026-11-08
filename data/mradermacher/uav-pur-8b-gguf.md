# mradermacher/UAV-PUR-8B-GGUF

## Resumen

UAV-PUR-8B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Henard224/UAV-PUR-8B, un vision-language model de aproximadamente 8.190 millones de parámetros orientado a tareas de percepción aérea con drones (UAV). La cuantización la publica mradermacher, un perfil conocido en Hugging Face por convertir modelos a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base está etiquetado con los descriptores drone, uav, vision-language, visual-grounding, counting y multimodal-reasoning, lo que sitúa su nicho en el análisis de imágenes aéreas.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo multimodal de 8B en hardware de consumo mediante cuantizaciones de 4-5 bits, algo imposible con los pesos en precisión completa (16,5 GB solo para el f16). Por otro, el dominio de aplicación (grounding visual, conteo de objetos y razonamiento multimodal sobre imágenes de drones) es poco habitual en el ecosistema open source, lo que convierte a este modelo en una opción específica para pipelines de teledetección y visión aérea.

No se dispone de información pública sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni benchmarks del modelo base en la documentación proporcionada. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como «no disponible» todo lo que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; arquitectura interna no documentada) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-f16 y mmproj-Q8_0 (proyector multimodal) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base (no se especifica si es un transformer denso, un MoE o una arquitectura híbrida). Los tags indican que se trata de un modelo vision-language con capacidades de visual grounding, conteo y razonamiento multimodal, y los ficheros mmproj (f16 y Q8_0) confirman la presencia de un proyector visual que conecta un codificador de imagen con el modelo de lenguaje. El tamaño de 8,19 B parámetros corresponde al conjunto del modelo, aunque no se detalla el reparto entre torre visual y torre de lenguaje.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. Tampoco se documenta si el modelo base fue entrenado desde cero o mediante fine-tuning de otro modelo. La cuantización de mradermacher es estática (no hay quants ponderados ni imatrix disponibles según la propia model card), generada con el pipeline habitual del autor y publicada el 8 de noviembre de 2026.

## Capacidades

- Procesamiento de imágenes y texto (vision-language): el modelo acepta entradas visuales junto con instrucciones en lenguaje natural.
- Visual grounding: localización de objetos en imágenes, presumiblemente mediante bounding boxes o referencias espaciales, aunque el formato exacto de salida no está documentado.
- Conteo de objetos (counting): capacidad destacada en los tags del modelo, orientada a escenas aéreas con múltiples instancias.
- Razonamiento multimodal: combinación de información visual y textual para responder preguntas complejas sobre la escena.
- Dominio específico de drones y UAV: el modelo está etiquetado para aplicaciones de percepción aérea.
- Conversación multi-turno: el tag «conversational» y el pipeline declarado sugieren uso en diálogo, aunque no se detalla la gestión de contexto.
- Idioma: únicamente inglés según la model card; no se declara soporte multilingüe.
- No consta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Inspección de infraestructuras con drones: el modelo puede analizar imágenes capturadas por UAV para identificar y contar elementos como torres, paneles solares o grietas, aprovechando sus capacidades de grounding visual y conteo.
- Agricultura de precisión: procesamiento de imágenes aéreas para estimar el número de plantas, frutos o cabezas de ganado en parcelas, usando el conteo de objetos sobre escenas de dron.
- Vigilancia y seguimiento de áreas: análisis de fotogramas aéreos para localizar personas, vehículos u objetos de interés mediante visual grounding, integrándolo en un pipeline de alertas.
- Búsqueda y rescate: revisión asistida de imágenes de UAV para localizar objetivos en terrenos amplios, donde el conteo y la localización automática reducen el tiempo de triaje humano.
- Análisis de daños tras desastres: evaluación de imágenes post-evento para cuantificar edificios afectados o vehículos bloqueados, con el modelo como primer filtro antes de la revisión humana.
- Prototipado en hardware de consumo: gracias a las cuantizaciones Q4_K_S (4,9 GB) y Q4_K_M (5,1 GB), se puede desplegar un prototipo funcional en una GPU de consumo con llama.cpp para validar casos de uso antes de invertir en infraestructura.
- Investigación en visión aérea: uso como baseline open source para experimentos de grounding y conteo en imágenes de dron, con licencia Apache 2.0 que facilita la comparación y la extensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio cuantizado ni los resultados de búsqueda web proporcionan métricas de MMLU, HumanEval, GSM8K, conteo, grounding u otras tareas. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el proyector multimodal ni el contexto KV):
  - Q2_K: ~3,4 GB
  - Q3_K_S: ~3,9 GB
  - Q3_K_M: ~4,2 GB
  - Q3_K_L: ~4,5 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_S: ~4,9 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_S: ~5,8 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- Proyector multimodal adicional: mmproj-Q8_0 (~0,9 GB) o mmproj-f16 (~1,3 GB), que debe cargarse junto al modelo para tareas de visión.
- GPU recomendadas: para cuantizaciones Q4-Q5 basta una GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) sumando el proyector; para Q6_K o Q8_0 se recomienda 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090). Para f16 se necesita una GPU de 24 GB o superior (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q5 con GPUs de 8-12 GB; Q6 y Q8 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python) son los entornos naturales para GGUF; también es posible usar servidores compatibles con la API de OpenAI. El tag «endpoints_compatible» del repositorio sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UAV-PUR-8B (este, GGUF) | 8,19 B | no disponible | Apache 2.0 | GGUF + mmproj | Especializado en drones, grounding y conteo; solo inglés |
| UAV-PUR-4B-GGUF | ~4 B (según nombre) | no disponible | no disponible en la búsqueda | GGUF | Versión menor del mismo linaje, publicada por mradermacher |
| Alternativas generalistas vision-language de ~7-8 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación rigurosa |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría (por ejemplo, otros VLM de 7-8 B orientados a teledetección) en parámetros, contexto, rendimiento o disponibilidad. La única comparación directa documentada es con la variante UAV-PUR-4B-GGUF del mismo autor de cuantizaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo entrenado para escenas de dron, es probable que su rendimiento se degrade fuera de ese dominio, pero no hay evidencia publicada al respecto.
- Riesgo de alucinación: no cuantificado. En tareas de conteo y grounding, los errores pueden ser sistemáticos (infraconteo o sobreconteo) y no hay métricas publicadas que permitan estimar la tasa de error.
- Limitaciones de idioma: la model card declara únicamente inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar su uso en conversaciones largas o en el análisis de múltiples imágenes en una misma sesión.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (Henard224/UAV-PUR-8B) y de los posibles datasets de entrenamiento, que no se detallan.
- Cuantizaciones estáticas: no hay quants ponderados ni imatrix, por lo que las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de conteo y grounding, que son sensibles a la precisión numérica.
- Componente multimodal separado: es imprescindible descargar y cargar el fichero mmproj junto con el modelo; olvidarlo desactiva las capacidades de visión.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria. No hay demos, papers ni informes de terceros.
- Fecha de publicación futura (2026-11-08): conviene verificar la integridad y procedencia de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UAV-PUR-8B-GGUF
- Modelo base: https://huggingface.co/Henard224/UAV-PUR-8B
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#UAV-PUR-8B-GGUF
- Variante de 4B del mismo linaje: https://huggingface.co/mradermacher/UAV-PUR-4B-GGUF
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
