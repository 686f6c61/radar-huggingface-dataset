# loscrossos/HeartMuLa-oss-3B

## Resumen

HeartMuLa-oss-3B es un modelo de fundación musical de tipo text-to-audio: recibe una descripción textual (y presumiblemente letra, a juzgar por su etiquetado multilingüe) y genera audio musical. Forma parte de la familia HeartMuLa, presentada en el artículo «HeartMuLa: A Family of Open Sourced Music Foundation Models» (arXiv:2601.10547), junto a otros dos componentes: HeartCodec-oss, orientado a la tokenización y reconstrucción de audio, y HeartTranscriptor-oss, dedicado a la transcripción. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors.

El checkpoint contiene 3.938.113.536 parámetros (aproximadamente 3,94 mil millones), lo que lo sitúa en la gama de 3-4 B, comparable a otros generadores musicales abiertos de tamaño medio. El repositorio ocupa 15,8 GB, un volumen coherente con pesos almacenados en fp32 (3,94 B × 4 bytes ≈ 15,75 GB), lo que implica que una conversión a fp16 o bf16 reduciría el espacio a la mitad. La model card declara soporte para cinco idiomas: chino, inglés, japonés, coreano y español.

El interés del modelo radica en su licencia permisiva (Apache 2.0) dentro de una categoría donde buena parte de las alternativas impone restricciones no comerciales, y en su integración en un ecosistema completo de códecs y transcriptores publicados por el mismo equipo. Ahora bien, la ficha del repositorio de Hugging Face está alojada bajo la cuenta de usuario «loscrossos», mientras que la model card atribuye el desarrollo a «HeartMuLa Team» y enlaza a una ubicación distinta (HeartMuLa/HeartMuLa-oss-3B); conviene verificar la procedencia antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de fundación musical text-to-audio; la model card no detalla la arquitectura interna ni el tipo de decoder) |
| Parámetros totales | 3.938.113.536 (~3,94 B), según los pesos en safetensors |
| Parámetros activos | No aplica (no consta que sea un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (la información no especifica la duración máxima de audio generado ni la ventana de condicionamiento textual) |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), coreano (ko), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamaño del repositorio | 15,8 GB |
| Pipeline declarado | text-to-audio |
| Fecha de creación del repositorio | 2026-10-20 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: la model card se limita a identificar el proyecto, la licencia y los enlaces a código, paper y demo, sin detallar el tipo de red (transformer, difusión, autoregresivo sobre tokens de codec, etc.), el número de tokens de entrenamiento ni la composición del corpus musical. Tampoco se especifica si se aplicaron etapas de ajuste fino con preferencias humanas (RLHF o DPO) ni qué esquema de condicionamiento se emplea para la letra y los atributos musicales.

Lo que sí puede inferirse del ecosistema publicado es la estructura de la familia: HeartCodec-oss actúa como códec neuronal de audio (tokenizador y reconstructor) y HeartTranscriptor-oss cubre la transcripción, lo que sugiere una pipeline en la que el modelo generativo opera sobre representaciones discretas o latentes producidas por el códec. Se trata, en cualquier caso, de una deducción a partir de los nombres y la organización del proyecto, no de un dato confirmado en la documentación proporcionada. El repositorio de código asociado es https://github.com/HeartMuLa/heartlib, que la model card señala como vía para el arranque rápido y el despliegue local.

## Capacidades

- Generación de audio musical a partir de descripción textual (pipeline text-to-audio).
- Cobertura multilingüe declarada en cinco idiomas: chino, inglés, japonés, coreano y español, lo que en un modelo musical sugiere condicionamiento sobre letra además de sobre estilo.
- Integración en una familia de herramientas: HeartCodec-oss para codificación y reconstrucción de audio, y HeartTranscriptor-oss para transcripción.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta modo «thinking», entrada de imagen, vídeo ni audio de referencia (audio-to-audio o inpainting).
- No se documenta control fino por atributos (tempo, tonalidad, instrumentación) más allá del prompt textual.

## Casos de uso

- **Composición de borradores musicales para producción audiovisual**: generar propuestas instrumentales rápidas a partir de un brief textual para vídeo corporativo, pódcast o tráiler, sustituyendo las búsquedas en bibliotecas de stock durante la fase de maquetación.
- **Prototipado de jingles y sintonías**: producir variantes de una sintonía corta variando la descripción textual (género, instrumentación, tempo) para presentar alternativas a un cliente antes de encargar la producción final a un estudio.
- **Música adaptativa para videojuegos**: generar bucles y capas musicales coherentes con la ambientación de cada escena, siempre que se valide la duración máxima soportada, dato que no se publica en la documentación disponible.
- **Localización de contenido musical para mercados asiáticos y europeos**: la cobertura de chino, japonés, coreano y español permite generar piezas con letra en esos idiomas sin cambiar de modelo, lo que simplifica campañas multiplataforma.
- **Investigación en modelos de fundación musical**: al ser Apache 2.0 y publicar safetensors, el checkpoint sirve como base para experimentos de ajuste fino, ablaciones sobre condicionamiento textual o comparación de códecs de audio dentro del ecosistema HeartMuLa.
- **Aumento de datos para pipelines de MIR (music information retrieval)**: generar material sintético controlado para entrenar o evaluar sistemas de etiquetado, detección de tonalidad o separación de fuentes, combinando el generador con HeartTranscriptor-oss para la anotación.
- **Educación y demostraciones**: ilustrar conceptos de producción musical o de generación condicionada en cursos y talleres, aprovechando la licencia permisiva para distribuir material docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas, métricas objetivas (FAD, KL, CLAP score) ni evaluaciones subjetivas de calidad musical, y el artículo referenciado (arXiv:2601.10547) no aporta cifras en el material consultado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en el repositorio ocupan 15,8 GB, lo que corresponde a fp32. Cargados en fp16 o bf16 ocuparían unos 7,9 GB; una conversión a int8 rondaría los 4 GB y a int4 los 2 GB. A esas cifras hay que sumar el coste del códec de audio asociado y las activaciones, no cuantificadas en la documentación.
- **GPU profesionales**: A100 (40/80 GB) y H100 son adecuadas para servir el modelo en fp32 sin conversiones y con margen para procesamiento por lotes; también sirven L40S o A10G en fp16.
- **GPU de consumo**: en fp16 el modelo cabe en tarjetas de 12-16 GB, como RTX 4070 Ti, RTX 4080 o RTX 4090 (24 GB), que además permite mantener los pesos en fp32 junto con el códec. Tarjetas de 8 GB requerirían cuantización a int8.
- **Opciones de despliegue**: la model card remite exclusivamente al repositorio https://github.com/HeartMuLa/heartlib para el arranque rápido y el despliegue local. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con la API de OpenAI, algo esperable al tratarse de un modelo de audio y no de texto.
- **Latencia y throughput**: no disponibles. No se publican tiempos de generación por segundo de audio, ni el efecto de la longitud del prompt en el tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B | HeartMuLa Team | ~3,94 B | Apache 2.0 | Pesos abiertos en safetensors | No disponible |
| MusicGen Large | Meta | 3,3 B | CC-BY-NC 4.0 (pesos) | Pesos abiertos | No comparable: sin evaluación conjunta publicada |
| Stable Audio Open | Stability AI | 1,1 B | Stability AI Community License | Pesos abiertos | No comparable: sin evaluación conjunta publicada |
| ACE-Step | Proyecto ACE-Step | 3,5 B | Apache 2.0 | Pesos abiertos | No comparable: sin evaluación conjunta publicada |

La comparación relevante para un equipo de producción es la licencia: HeartMuLa-oss-3B y ACE-Step emplean Apache 2.0, mientras que MusicGen Large restringe el uso de los pesos a fines no comerciales y Stable Audio Open aplica una licencia comunitaria con condiciones. En parámetros, los cuatro modelos se sitúan en la franja de 1-4 B. No se dispone de datos de calidad objetiva que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- **Procedencia del repositorio**: el checkpoint analizado está alojado en la cuenta de usuario `loscrossos`, mientras que la model card atribuye la autoría a «HeartMuLa Team» y enlaza a `HeartMuLa/HeartMuLa-oss-3B`. Con 0 descargas y 0 likes, y sin verificación de identidad, existe riesgo de que se trate de una réplica no oficial; conviene contrastar hashes con el repositorio de la organización antes de desplegarlo.
- **Ausencia total de benchmarks**: no hay métricas de calidad musical, fidelidad al prompt ni inteligibilidad de la letra, lo que impide estimar su rendimiento frente a alternativas sin una evaluación propia.
- **Documentación incompleta**: no se especifican arquitectura, datos de entrenamiento, duración máxima de audio, frecuencia de muestreo de salida ni requisitos de preprocesado del prompt. Cualquier integración exigirá ingeniería inversa sobre el código de `heartlib`.
- **Riesgo de alucinación trasladado al audio**: en modelos generativos musicales, el equivalente es la deriva respecto a la instrucción (instrumentación, género o estructura no solicitadas) y la aparición de artefactos audibles; sin evaluaciones publicadas no puede acotarse su frecuencia.
- **Cobertura lingüística limitada**: solo cinco idiomas. No se declara soporte de portugués, francés, alemán, italiano ni neerlandés, lo que excluye la mayoría de mercados europeos occidentales para letras.
- **Sesgos de estilo y datos**: al no documentarse la composición del corpus, se desconoce el sesgo hacia determinados géneros (probablemente occidentales y asiáticos) y la representación de tradiciones musicales minoritarias.
- **Riesgo de derechos de autor**: la generación musical condicionada por texto puede reproducir patrones melódicos reconocibles del material de entrenamiento. La licencia Apache 2.0 cubre el código y los pesos, pero no garantiza la limpieza de derechos sobre el audio generado; para uso comercial conviene establecer controles de similitud.
- **Licencia Apache 2.0 sin restricciones de uso comercial**: favorable para adopción, pero implica que el usuario asume íntegramente la responsabilidad sobre las salidas y sobre el cumplimiento normativo aplicable (por ejemplo, obligaciones de etiquetado de contenido generado).
- **Madurez del ecosistema**: sin integraciones con servidores de inferencia estándar, el despliegue depende en exclusiva del repositorio del proyecto, lo que añade coste de mantenimiento en producción.

## Enlaces

- Repositorio de Hugging Face analizado: https://huggingface.co/loscrossos/HeartMuLa-oss-3B
- Repositorio oficial referenciado en la model card: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Código fuente: https://github.com/HeartMuLa/heartlib
- Artículo: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Códec asociado: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor asociado: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Contacto declarado: heartmula.ai@gmail.com
