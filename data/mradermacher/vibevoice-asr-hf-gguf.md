# mradermacher/VibeVoice-ASR-HF-GGUF

## Resumen

VibeVoice-ASR-HF-GGUF es la versión cuantizada en formato GGUF del modelo VibeVoice-ASR-HF desarrollado originalmente por Microsoft. Se trata de un modelo especializado en reconocimiento automático del habla (ASR) con capacidad de diarización de hablantes, es decir, no solo transcribe audio a texto, sino que identifica y separa quién dice qué en una conversación. La cuantización ha sido realizada por mradermacher, un perfil conocido en la comunidad por publicar versiones GGUF de modelos populares para facilitar su despliegue en hardware de consumo.

El modelo base cuenta con aproximadamente 7.600 millones de parámetros (7,615,616,512 según los pesos en safetensors) y está construido sobre la librería transformers. Su relevancia radica en que combina transcripción multilingüe (más de 50 idiomas declarados) con diarización en un único modelo, lo que simplifica arquitecturas de pipelines de audio que tradicionalmente requerían modelos separados para ASR y para separación de hablantes.

La versión GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles en GPUs de consumo e incluso en CPU, con múltiples niveles de cuantización que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB). La licencia MIT facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base basado en transformers; detalles internos no especificados en la informacion disponible) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, id, sv, it, he, nl, pl, no, tr, th, ar, hu, ca, cs, da, fa, af, hi, fi, et, aa, el, ro, vi, bg, is, sl, sk, lt, sw, uk, kl, lv, hr, ne, sr, tl, yi, ms, ur, mn, hy, jv (más de 50 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivos mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (microsoft/VibeVoice-ASR-HF), como el tipo de transformer, el número de capas, la dimensión de los embeddings o si emplea mecanismos de atención lineal o decodificación especulativa. Lo que sí se conoce es que el modelo está diseñado para tareas de ASR y diarización, lo que implica que procesa audio como entrada (de ahí la presencia de archivos mmproj, que en el ecosistema GGUF acompañan al componente multimodal que convierte audio en representaciones que el modelo de lenguaje puede procesar).

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base es publicado por Microsoft bajo licencia MIT, y esta versión GGUF es una conversión estática (sin cuantizaciones ponderadas/imatrix, según indica el autor) realizada por mradermacher.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto en más de 50 idiomas.
- Diarización de hablantes: identificación de los distintos interlocutores en una conversación y atribución de cada segmento de texto al hablante correspondiente.
- Speech-to-text multilingüe: cobertura declarada de idiomas como inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso, árabe, hindi, entre otros.
- Procesamiento de audio multimodal: los archivos mmproj indican soporte para entrada de audio dentro del pipeline del modelo.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integración con infraestructuras de inferencia estándar.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar el audio de una reunión y generar una transcripción atribuyendo cada intervención al hablante correspondiente gracias a su capacidad de diarización, lo que facilita la generación automática de actas y resúmenes.
- Subtitulado automático de vídeo multilingüe: con soporte para más de 50 idiomas, puede transcribir contenido audiovisual en distintos idiomas y producir subtítulos, integrándose en pipelines de postproducción.
- Atención al cliente y análisis de llamadas: permite transcribir y separar las voces de agente y cliente en grabaciones de call centers, habilitando análisis de calidad, detección de temas y cumplimiento normativo.
- Documentación clínica: transcripción de consultas médicas con separación de hablantes (médico/paciente) para generar borradores de historiales, siempre con revisión humana posterior.
- Investigación cualitativa: transcripción de entrevistas y grupos focales con diarización automática, reduciendo el trabajo manual de etiquetado de hablantes en estudios académicos.
- Accesibilidad: generación de transcripciones en tiempo cuasi real para personas con discapacidad auditiva en entornos con múltiples hablantes, como aulas o conferencias.
- Despliegue en hardware de consumo: gracias a las cuantizaciones GGUF (desde 3,1 GB en Q2_K), puede ejecutarse en equipos sin GPU dedicada o con GPUs de gama media para prototipos y aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, pesos del modelo principal): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,4 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- Componente multimodal adicional (mmproj): ~0,9 GB (Q8_0) o ~1,5 GB (f16), que debe sumarse a la VRAM del modelo principal.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 3060 de 12 GB o RTX 4070 en adelante es suficiente; para f16 se recomienda una GPU con 24 GB o más (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q2_K a Q8_0) cabe en GPUs de 8-12 GB, sumando el mmproj.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, servidores compatibles con llama.cpp). La librería declarada es transformers para el modelo base, pero esta versión es específicamente GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-HF-GGUF (este) | ~7,6 B | no disponible | >50 | MIT | GGUF |
| Whisper large-v3 (OpenAI) | ~1,55 B | 30 s de audio por ventana | ~99 | MIT | safetensors, GGUF (comunitario) |
| Whisper large-v3-turbo | ~0,81 B | 30 s de audio por ventana | ~99 | MIT | safetensors, GGUF (comunitario) |

Nota: la comparación se limita a parámetros, licencia y formato porque no se dispone de datos de benchmarks del modelo VibeVoice-ASR-HF en la información proporcionada. Whisper no incluye diarización nativa, mientras que VibeVoice-ASR-HF sí la declara como capacidad, lo que constituye su principal diferenciador frente a alternativas ASR convencionales.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo en la documentación proporcionada; se recomienda evaluar el rendimiento en acentos y dialectos específicos antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de transcripción: pueden generar texto plausible en segmentos de audio con ruido, silencios o habla solapada.
- La diarización puede fallar en escenarios con voces muy similares, solapamiento de hablantes o audio de baja calidad.
- Aunque se declaran más de 50 idiomas, el rendimiento puede variar significativamente entre ellos; no se especifican métricas por idioma.
- La longitud de contexto no está documentada, lo que dificulta planificar la transcripción de audios largos sin segmentación previa.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_S) pueden degradar la calidad de transcripción; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- No hay cuantizaciones ponderadas/imatrix disponibles según el autor, lo que podría limitar la calidad en cuantizaciones bajas frente a alternativas optimizadas.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar la licencia del modelo base original de Microsoft por si hubiera condiciones adicionales no reflejadas en esta ficha.

## Enlaces

- Repositorio Hugging Face de esta versión GGUF: https://huggingface.co/mradermacher/VibeVoice-ASR-HF-GGUF
- Modelo base original: https://huggingface.co/microsoft/VibeVoice-ASR-HF
- Página de descargas del autor: https://hf.tst.eu/model#VibeVoice-ASR-HF-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
