# mradermacher/LBS-27B-GGUF

## Resumen

LBS-27B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo inclusionAI/LBS-27B, realizadas por el cuantizador conocido mradermacher. El modelo base, LBS-27B, es un modelo multimodal de visión de 27 mil millones de parámetros desarrollado por inclusionAI, especializado en tareas de grounding de interfaces gráficas (GUI grounding), visión agéntica, respuesta a preguntas visuales y procesamiento de imágenes de alta resolución, con entrenamiento que incluye aprendizaje por refuerzo. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF.

La relevancia de esta ficha radica en la creciente demanda de modelos de visión agéntica capaces de interpretar capturas de pantalla e interactuar con interfaces gráficas de usuario, un pilar fundamental de los agentes autónomos que operan ordenadores. El repositorio incluye además archivos mmproj (suplementos multimodales) en Q8_0 y f16, necesarios para que el modelo procese imágenes junto con el texto.

El repositorio pesa aproximadamente 187,9 GB en total y ofrece cuantizaciones que van desde 10,8 GB (Q2_K) hasta 28,7 GB (Q8_0), cubriendo un amplio rango de hardware. El modelo se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje), no disponible el detalle exacto |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según la model card; no disponible información sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors del modelo base) |

## Arquitectura y entrenamiento

LBS-27B es un modelo multimodal de aproximadamente 26,9 mil millones de parámetros desarrollado por inclusionAI. Según las etiquetas del repositorio, el modelo está orientado a GUI grounding (localización de elementos en interfaces gráficas), visión agéntica (agentic vision), respuesta a preguntas visuales (visual question answering) y procesamiento de imágenes de alta resolución. La etiqueta de reinforcement-learning indica que el entrenamiento incorpora aprendizaje por refuerzo, una técnica habitual para alinear las capacidades del modelo con tareas agénticas de interacción con entornos visuales.

La ficha del cuantizador no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas específicas de post-entrenamiento (RLHF, DPO). El repositorio de mradermacher consiste en cuantizaciones estáticas en GGUF del modelo original en safetensors, sin cuantizaciones weighted/imatrix disponibles en el momento de la publicación. Los archivos mmproj (0,7 GB en Q8_0 y 1,0 GB en f16) contienen la parte del codificador de visión necesaria para el procesamiento multimodal en runtimes como llama.cpp.

## Capacidades

- GUI grounding: localización de elementos de interfaz (botones, campos de texto, iconos) a partir de capturas de pantalla, capacidad esencial para agentes que operan ordenadores.
- Visión agéntica: interpretación de entornos visuales para planificar y ejecutar acciones multi-paso en interfaces gráficas.
- Respuesta a preguntas visuales (VQA): análisis y respuesta a preguntas sobre el contenido de imágenes.
- Procesamiento de imágenes de alta resolución: manejo de capturas de pantalla y documentos con detalle fino.
- Entrenamiento con aprendizaje por refuerzo para mejorar el rendimiento en tareas agénticas.
- Generación de texto conversacional en inglés (etiqueta conversational en el repositorio).
- Soporte multimodal en runtimes GGUF mediante los archivos mmproj incluidos.

No hay información disponible sobre tool calling, capacidades de código o matemáticas específicas del modelo base.

## Casos de uso

- Agentes autónomos de escritorio: el modelo puede interpretar capturas de pantalla de un sistema operativo y localizar elementos de la interfaz, permitiendo que un agente haga clic, rellene formularios y navegue aplicaciones de forma autónoma.
- Automatización de pruebas de software: integración en pipelines de QA para verificar visualmente que una interfaz web o de escritorio se renderiza y comporta como se espera, reduciendo pruebas manuales.
- Relleno automático de formularios y gestión documental: extracción de datos de documentos escaneados o capturas de aplicaciones empresariales gracias a su soporte de alta resolución.
- Asistentes de accesibilidad: descripción de interfaces y elementos visuales para usuarios con discapacidad visual, aprovechando el VQA y el grounding preciso.
- RPA (automatización robótica de procesos) aumentada con visión: sustitución de automatizaciones frágiles basadas en selectores DOM por agentes visuales más robustos ante cambios de interfaz.
- Moderación y auditoría de UI: verificación de que aplicaciones cumplen guías de estilo o requisitos legales mediante análisis visual automatizado.
- Bots de soporte técnico con capturas de pantalla: análisis de imágenes enviadas por usuarios para diagnosticar problemas de configuración o errores de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache ni mmproj):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB (recomendada)
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Añadir ~0,7-1,0 GB por el archivo mmproj y reserva adicional para la KV cache según la longitud de contexto.
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta cómodamente hasta Q5_K_M; para Q6_K y Q8_0 se recomiendan RTX 5090 (32 GB), A100 40 GB o H100, o descarga parcial a RAM.
- Cabe en GPU de consumo: sí, hasta Q5_K_M (~19,3 GB) en una RTX 4090; hasta Q4_K_M en una RTX 3090 (24 GB); las cuantizaciones Q3 y Q2 caben en tarjetas de 16 GB como la RTX 4060 Ti 16 GB o RTX 4080, con penalización de calidad notable en Q2_K y Q3_K_S.
- CPU pura: viable con Q2_K/Q3_K en equipos con 16-32 GB de RAM, aunque con velocidades bajas para un modelo de este tamaño.
- Opciones de despliegue: llama.cpp (runtime de referencia para GGUF con soporte mmproj), Ollama, LM Studio, KoboldCpp y otros runtimes compatibles con GGUF multimodal. No hay información sobre compatibilidad con vLLM o TGI para estos archivos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| LBS-27B (base: inclusionAI) | ~26,9 B | Sí (visión, GUI grounding) | Apache 2.0 | Sí (mradermacher) |
| Qwen2.5-VL-32B | 32 B | Sí (visión, grounding) | Apache 2.0 | Sí |
| InternVL2.5-26B | 26 B | Sí (visión, VQA) | MIT | Sí |

LBS-27B se sitúa en la misma franja de tamaño que InternVL2.5-26B y por debajo de Qwen2.5-VL-32B. Su diferenciador declarado es la especialización en GUI grounding y visión agéntica mediante aprendizaje por refuerzo, frente a los modelos VQA generales. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Cuantizaciones estáticas: el repositorio solo ofrece quants estáticos; las versiones imatrix/weighted no estaban disponibles en el momento de publicación, lo que puede suponer una pérdida de calidad frente a cuantizaciones ponderadas, especialmente en Q2_K y Q3_K_S, que la propia model card advierte de menor calidad.
- Riesgo de alucinación: como todo modelo multimodal, puede describir incorrectamente elementos de la interfaz o alucinar coordenadas de grounding; en tareas agénticas es recomendable verificar las acciones antes de ejecutarlas.
- Contexto: la longitud de ventana de contexto no está documentada en la información disponible, lo que dificulta planificar tareas que requieran muchas capturas de pantalla o conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y los términos de uso del modelo base inclusionAI/LBS-27B para cualquier restricción adicional.
- Datos de benchmarks no publicados en la información disponible, por lo que no es posible validar objetivamente su rendimiento frente a alternativas antes de probarlo.
- Los archivos mmproj son necesarios para la funcionalidad visual; sin ellos el modelo se comporta como modelo de solo texto.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/LBS-27B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LBS-27B
- Página de descargas con vista general: https://hf.tst.eu/model#LBS-27B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
