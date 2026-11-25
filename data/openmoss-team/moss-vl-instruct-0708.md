# OpenMOSS-Team/MOSS-VL-Instruct-0708

## Resumen

MOSS-VL-Instruct-0708 es un modelo vision-lenguaje (VLM) de código abierto desarrollado por OpenMOSS, publicado como el checkpoint ajustado por instrucciones de la familia MOSS-VL en su release 0708. Con 11 336 371 208 parámetros (aproximadamente 11B) en BF16, el modelo parte de MOSS-VL-Base-0708 y se entrena mediante SFT para tareas multimodales offline: comprensión de imagen, OCR, análisis de documentos, razonamiento visual y, de forma destacada, comprensión de vídeo de larga duración con razonamiento temporal y localización de eventos a nivel de segundo.

Arquitectónicamente emplea un diseño de atención cruzada que desacopla la codificación visual del razonamiento lingüístico, junto con una ventana de contexto de texto de 256K tokens y una innovación posicional propia denominada XRoPE (Cross-attention Rotary Position Embedding), que proyecta tokens de texto y parches visuales en un espacio tridimensional (tiempo, altura, anchura). El modelo procesa vídeo a 1 FPS por defecto con hasta 256 fotogramas e inyecta marcas de tiempo absolutas en las entradas de vídeo.

Su relevancia actual radica en ser una alternativa abierta y permisiva (licencia Apache 2.0) para cargas de trabajo de comprensión de vídeo largo, un nicho donde la mayoría de los modelos punteros son propietarios o tienen licencias restrictivas. La disponibilidad conjunta del checkpoint base y del instruct permite tanto investigación aplicada como ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje con atención cruzada (cross-attention) y XRoPE |
| Parametros totales | 11 336 371 208 (aprox. 11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tipo de tensor | BF16 |
| Tamano de parche visual | 16 |
| Tamano de parche temporal | 1 |
| FPS por defecto en video | 1.0 |
| Maximo de fotogramas por defecto | 256 |
| Pipeline | video-text-to-text |
| Modelo base | OpenMOSS-Team/MOSS-VL-Base-0708 |
| Tamano del repositorio | 22.7 GB |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0708 se basa en una arquitectura de atención cruzada que separa la codificación visual del modelo de lenguaje: los tokens lingüísticos se conectan con las representaciones visuales mediante capas de cross-attention, lo que permite un pipeline unificado para imagen, vídeo y texto. La innovación posicional XRoPE mapea tokens de texto y parches visuales a un espacio de coordenadas tridimensional definido por tiempo (t), altura (h) y anchura (w), proporcionando una representación posicional consistente para razonamiento sobre imagen y vídeo. Para vídeo, el modelo inyecta marcas de tiempo absolutas junto a los fotogramas muestreados, lo que facilita razonar sobre orden de eventos, duración y localización temporal más allá del simple orden de fotogramas.

El checkpoint se obtiene mediante supervisión fine-tuning (SFT) sobre MOSS-VL-Base-0708, con una receta de datos e instrucciones renovada respecto al release anterior (0408). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información debe consultarse en el informe técnico (arXiv 2608.15045). El modelo se distribuye con código personalizado (`trust_remote_code=True`) y requiere FlashAttention 2 para una inferencia eficiente.

## Capacidades

- Comprensión de imagen: descripción, reconocimiento visual fino y razonamiento visual sobre imágenes individuales.
- OCR y análisis de documentos: extracción de texto y parseo de documentos.
- Comprensión de vídeo largo: razonamiento temporal, reconocimiento de acciones y localización de eventos a nivel de segundo.
- Inyección de marcas de tiempo absolutas en vídeo para razonamiento sobre orden, duración y ritmo de eventos.
- Seguimiento de instrucciones multimodal alineado mediante SFT sobre el checkpoint base.
- Procesamiento por lotes offline de entradas independientes de imagen, vídeo y texto (`offline_batch_generate`).
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis de vídeo de vigilancia o industrial: el modelo puede procesar hasta 256 fotogramas a 1 FPS con marcas de tiempo absolutas, lo que permite localizar eventos concretos a nivel de segundo en grabaciones largas y generar informes descriptivos.
- Indexación y búsqueda semántica de archivos audiovisuales: combinado con un pipeline de extracción de fotogramas, MOSS-VL-Instruct-0708 puede generar descripciones y metadatos temporales de cada segmento para alimentar un motor de búsqueda sobre una videoteca.
- Digitalización de documentos y OCR: su soporte de OCR y parseo de documentos lo hace adecuado para extraer texto estructurado de facturas, formularios o PDFs escaneados en flujos de back office.
- Moderación de contenido visual: análisis de imágenes y vídeos para detectar contenido no deseado, con la ventaja de una ventana de contexto de 256K que permite incluir instrucciones de política extensas junto al material analizado.
- Accesibilidad: generación de descripciones de imágenes y resúmenes de vídeo con referencias temporales para subtitulado descriptivo o audiodescripción.
- Investigación en visión-lenguaje: al publicarse junto al checkpoint base MOSS-VL-Base-0708 bajo Apache 2.0, sirve como punto de partida para fine-tuning en dominios específicos (médico, satelital, deportivo) sin restricciones de licencia comercial.
- Asistencia en revisión de material deportivo o de formación: reconocimiento de acciones y localización de eventos permite extraer clips relevantes de grabaciones largas de partidos o sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las tablas detalladas de benchmarks del release 0708 se mantendrán en los recursos del proyecto MOSS-VL y remite a una figura (`assets/benchmark-offline.png`) sin cifras textuales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11.3B parámetros en BF16, los pesos ocupan aproximadamente 22.7 GB; se necesita margen adicional para el codificador visual, las cachés KV y los fotogramas de vídeo, por lo que se recomienda al menos 40-48 GB de VRAM para inferencia en BF16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, o GPUs consumer de gama alta con suficiente VRAM; el uso de `device_map="auto"` permite repartir el modelo entre varias GPU.
- GPU consumer: en BF16 no cabe en GPUs de 24 GB (RTX 4090) sin cuantización u offloading; no se documentan recetas de cuantización en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` y FlashAttention 2; el modelo requiere el repositorio oficial de MOSS-VL y sus requisitos. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible. El procesamiento de vídeo a 256 fotogramas y la ventana de 256K implican un coste computacional elevado en el prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Instruct-0708 | 11B | 256K | VLM con cross-attention, vídeo largo | Apache 2.0 | Hugging Face (pesos abiertos) |
| MOSS-VL-Instruct-0408 | no disponible | no disponible | Checkpoint previo de la misma familia | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores que permitan una comparación cuantitativa fiable; por tanto, la comparativa se limita a la familia MOSS-VL.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: como todo VLM, puede generar descripciones o respuestas no fundamentadas en el contenido visual, especialmente en escenas ambiguas o material de baja calidad.
- Sesgos: no se documentan análisis de sesgos en la información disponible; los sesgos de los datos de entrenamiento pueden reflejarse en descripciones y clasificaciones.
- Vídeo: el muestreo por defecto a 1 FPS con máximo de 256 fotogramas implica que vídeos muy largos se submuestrean, con posible pérdida de eventos breves.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del modelo; conviene auditar la versión antes de desplegar en producción.
- Cuantización: no se documentan recetas oficiales de cuantización, lo que limita el despliegue en hardware de gama media.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las licencias de los componentes y datasets subyacentes en el informe técnico.
- Benchmarks: la ausencia de cifras públicas verificables en la model card dificulta la evaluación previa a producción; se recomienda una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base-0708
- Checkpoint previo: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0408
- Informe técnico: https://arxiv.org/pdf/2608.15045
- Referencia adicional: https://arxiv.org/abs/2606.07639
- Repositorio de código: https://github.com/OpenMOSS/MOSS-VL
