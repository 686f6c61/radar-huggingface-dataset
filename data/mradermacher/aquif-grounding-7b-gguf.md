# mradermacher/aquif-Grounding-7B-GGUF

## Resumen

aquif-Grounding-7B es un modelo de lenguaje y visión (VLM) de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en *grounding* visual, es decir, en localizar y referenciar elementos concretos dentro de una imagen a partir de instrucciones en lenguaje natural. Está desarrollado por aquif-ai y esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo está pensado para tareas de *computer use* (interacción con interfaces gráficas), OCR y agentes que necesitan operar sobre pantallas o documentos visuales.

La relevancia actual del modelo radica en su orientación a *computer-use agents*: capacidades de grounding preciso sobre capturas de pantalla, junto con soporte para diez idiomas (inglés, alemán, italiano, portugués, francés, hindi, español, tailandés, chino y japonés) y licencia MIT, lo que lo hace atractivo para integraciones comerciales sin restricciones de uso. La arquitectura subyacente está etiquetada como basada en Qwen, aunque la model card no detalla la configuración exacta de capas, atención ni longitud de contexto.

El repositorio GGUF incluye cuantizaciones estáticas desde Q2_K hasta f16, además de los ficheros `mmproj` necesarios para el procesamiento multimodal (proyector visión-lenguaje). Con 945 descargas y una licencia permisiva, el modelo se posiciona como una opción práctica para desplegar agentes visuales en hardware de consumo mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basada en Qwen; detalles de capas y atención no disponibles |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, de, it, pt, fr, hi, es, th, zh, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de visión y lenguaje (VLM) con arquitectura transformer, etiquetado con los tags `qwen` y `aquif`, lo que sugiere que parte de una base Qwen adaptada por aquif-ai para tareas de grounding visual y *computer use*. El repositorio GGUF incluye ficheros `mmproj` (proyector multimodal) separados, lo que confirma la presencia de un codificador visual conectado al modelo de lenguaje mediante un proyector entrenado. No se dispone de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni configuración del codificador visual.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado específico. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado es la plantilla estándar de mradermacher y no incluye información adicional del autor original.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes junto con instrucciones textuales para producir respuestas y localizaciones.
- Grounding visual: localización de elementos en imágenes y capturas de pantalla a partir de descripciones en lenguaje natural, capacidad central del modelo.
- Computer use: interacción con interfaces gráficas, orientado a agentes que operan sobre pantallas (clic, localización de botones, campos y menús).
- OCR: extracción de texto de imágenes y documentos, según los tags del modelo.
- Soporte de agentes: diseñado para flujos de agente y razonamiento multi-paso sobre entornos visuales.
- Capacidades multilingües: diez idiomas declarados (inglés, alemán, italiano, portugués, francés, hindi, español, tailandés, chino y japonés).
- Conversacional: formato de chat conversacional soportado.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz (UI testing): el modelo puede localizar botones, campos y elementos de una captura de pantalla para generar o validar acciones de test, aprovechando su capacidad de grounding sobre interfaces gráficas.
- Agentes de computer use: integración en pipelines que interpretan la pantalla y deciden dónde hacer clic o qué campo rellenar, adecuado por su especialización declarada en *computer use* y *agent*.
- Extracción de datos de documentos: uso de OCR y grounding para localizar y extraer campos concretos (importes, fechas, nombres) en facturas, formularios o recibos escaneados.
- Asistentes de accesibilidad: descripción y localización de elementos de la pantalla para usuarios con discapacidad visual, combinando visión y generación de texto en varios idiomas.
- Automatización de flujos RPA: sustitución o complemento de selectores frágiles en herramientas de automatización robótica de procesos, usando grounding visual para identificar controles en aplicaciones legacy.
- Atención al cliente con soporte visual: procesamiento de capturas enviadas por usuarios (errores, pantallas de aplicación) para diagnosticar problemas y guiar la resolución, con soporte multilingüe para diez idiomas.
- Moderación y análisis de contenido visual: localización de regiones relevantes en imágenes para revisión humana o clasificación posterior en pipelines de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead del proyector multimodal y contexto):
  - Q2_K (3,1 GB): aproximadamente 4-5 GB de VRAM.
  - Q4_K_M (4,8 GB): aproximadamente 6-7 GB de VRAM, opción recomendada por el autor de la cuantización.
  - Q8_0 (8,2 GB): aproximadamente 10-11 GB de VRAM.
  - f16 (15,3 GB): aproximadamente 17-18 GB de VRAM.
  - Añadir 1,0-1,5 GB adicionales para el fichero `mmproj` (proyector visual).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; RTX 4090 24 GB para f16; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros frontends compatibles con GGUF y `mmproj`; el modelo base en safetensors es compatible con transformers. vLLM y TGI no están confirmados para esta versión GGUF multimodal en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| aquif-Grounding-7B (esta ficha) | 7,6 B | No disponible | Grounding visual, computer use, OCR | MIT | GGUF, safetensors |
| Qwen2.5-VL-7B | 7-8 B (aprox.) | 128 K (según versión) | VLM generalista, grounding, OCR | Apache 2.0 (según versión) | safetensors, GGUF (comunidad) |
| MiniCPM-V 2.6 | 8 B (aprox.) | No disponible en esta ficha | VLM generalista, OCR, multi-imagen | Apache 2.0 / modelo abierto | safetensors, GGUF (comunidad) |
| InternVL2-8B | 8 B (aprox.) | No disponible en esta ficha | VLM generalista, OCR, documentos | MIT (según versión) | safetensors, GGUF (comunidad) |

Nota: los datos de los modelos comparativos son orientativos y pueden variar según la versión concreta; no se dispone de benchmarks comparativos publicados en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo en la información disponible; como todo VLM entrenado con datos web, es probable que herede sesgos culturales y lingüísticos, pero no hay evidencia publicada al respecto.
- Riesgo de alucinación: no cuantificado; los modelos de grounding pueden generar coordenadas o descripciones plausibles pero incorrectas, especialmente con imágenes de baja resolución o interfaces poco comunes.
- Longitud de contexto no documentada: limita la planificación de conversaciones multi-turno largas o el procesamiento de documentos extensos.
- Idiomas: aunque se declaran diez idiomas, no hay datos sobre el rendimiento relativo por idioma; el español está soportado pero sin métricas publicadas.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las licencias de los componentes base (posible base Qwen) y de los datos de entrenamiento, no detalladas.
- Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida según las notas del autor de la cuantización; para producción se recomienda Q4_K_M o superior.
- El repositorio GGUF requiere descargar por separado el fichero `mmproj` para conservar las capacidades multimodales; usar solo el fichero de pesos elimina la visión.
- No hay información sobre tool calling, modo thinking ni otras capacidades avanzadas; no asumir su disponibilidad en producción sin validación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/aquif-Grounding-7B-GGUF
- Modelo base: https://huggingface.co/aquif-ai/aquif-Grounding-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/aquif-Grounding-7B-i1-GGUF
- Página de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#aquif-Grounding-7B-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
