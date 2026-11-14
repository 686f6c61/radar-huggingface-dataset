# mradermacher/SAVI-SQL-0.6B-GGUF

## Resumen

SAVI-SQL-0.6B es un modelo de lenguaje especializado en la generación de consultas SQL, desarrollado originalmente por griffith-bigdata y distribuido en formato GGUF por mradermacher. Con aproximadamente 596 millones de parámetros, se posiciona como un modelo compacto orientado a tareas de traducción de lenguaje natural a SQL (text-to-SQL), un caso de uso donde la precisión estructural y el conocimiento del esquema de base de datos resultan críticos.

Esta ficha documenta la versión cuantizada publicada por mradermacher, que ofrece el modelo en múltiples formatos GGUF (desde Q2_K hasta f16) para facilitar su despliegue en hardware modesto mediante llama.cpp y herramientas compatibles. El modelo base está etiquetado como conversacional y declara soporte únicamente para inglés.

La relevancia de esta publicación radica en su tamaño reducido y su empaquetado en GGUF, lo que permite ejecutar un modelo especializado en SQL en CPU o en GPUs de consumo, sin necesidad de infraestructura dedicada. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se documentan datos de entrenamiento, benchmarks ni términos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base griffith-bigdata/SAVI-SQL-0.6B. El repositorio de la versión cuantizada lo etiqueta como `transformers` y `conversational`, y el recuento de parámetros (596 millones) sugiere un transformer de escala pequeña, probablemente basado en una familia tipo Qwen2-0.5B o similar, aunque esto no está confirmado en la documentación proporcionada.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de fases de ajuste fino supervisado, RLHF o DPO, ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del cuantizador se limita a describir el proceso de cuantización estática y a listar los ficheros GGUF generados, sin aportar detalles sobre el entrenamiento del modelo original. Los cuantizados con imatrix o ponderados no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL), según se deduce del nombre del modelo y de su etiqueta de modelo base.
- Formato conversacional: el modelo está etiquetado como `conversational`, lo que sugiere soporte para plantillas de chat de turnos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de Hugging Face Inference Endpoints.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado.

## Casos de uso

- Generación de consultas SQL en asistentes de análisis de datos: el modelo puede transformar preguntas de negocio en lenguaje natural ("¿cuántos pedidos se cancelaron el mes pasado?") en sentencias SQL ejecutables, integrándose en herramientas de BI o notebooks.
- Autocompletado y corrección de SQL en editores e IDE: dado su tamaño reducido, puede desplegarse localmente para sugerir consultas o detectar errores sintácticos sin enviar el esquema de la base de datos a un servicio externo.
- Enriquecimiento de pipelines ETL: el modelo puede generar expresiones de transformación o filtros SQL a partir de descripciones de reglas de negocio, reduciendo el trabajo manual en la definición de jobs.
- Prototipado rápido de interfaces de consulta: al caber en hardware de consumo, permite construir demos de chat sobre bases de datos en portátiles o entornos de desarrollo sin GPU dedicada.
- Educación y formación en SQL: puede servir como generador de ejemplos de consultas para materiales docentes o como asistente que explica la construcción de una query a partir de un enunciado.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local mediante llama.cpp u Ollama, permite procesar esquemas y consultas sensibles sin salida de datos a la nube.
- Evaluación comparativa de modelos text-to-SQL pequeños: su formato GGUF con múltiples niveles de cuantización facilita medir el impacto de la compresión en la calidad de las consultas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en cuantizaciones Q2_K a Q5_K_M; 0,6 GB en Q6_K; 0,7 GB en Q8_0; 1,3 GB en f16 (tamaños de fichero indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar la versión f16; las cuantizaciones Q4_K_M o Q8_0 caben en GPUs de gama de entrada (GTX 1650, RTX 3050) y en iGPUs con memoria unificada.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers y con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (0,6B) se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, licencia) del modelo base que permitan una comparación rigurosa con alternativas text-to-SQL. Se indica "no disponible" para los campos que requerirían datos no publicados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SAVI-SQL-0.6B (esta ficha) | 596 M | no disponible | no disponible | GGUF, safetensors | Especializado en SQL, solo inglés |
| Alternativas text-to-SQL de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan datos de entrenamiento, benchmarks, contexto máximo ni términos de licencia, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de desplegarlo en entornos productivos.
- Idioma: solo se declara soporte para inglés, por lo que las instrucciones en castellano pueden degradar la calidad de las consultas generadas.
- Riesgo de alucinación: como todo modelo generativo, puede producir SQL sintácticamente válido pero semánticamente incorrecto, o referenciar tablas y columnas inexistentes; requiere validación contra el esquema real.
- Especialización estrecha: su utilidad fuera de tareas text-to-SQL no está documentada y probablemente sea limitada frente a modelos generalistas del mismo tamaño.
- Cuantizaciones agresivas: los formatos Q2_K y Q3_K pueden degradar la calidad de las consultas; se recomienda Q4_K_M o superior para uso real.
- Sin garantías de mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (versión GGUF): https://huggingface.co/mradermacher/SAVI-SQL-0.6B-GGUF
- Modelo base: https://huggingface.co/griffith-bigdata/SAVI-SQL-0.6B
- Página de descargas del cuantizador: https://hf.tst.eu/model#SAVI-SQL-0.6B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
