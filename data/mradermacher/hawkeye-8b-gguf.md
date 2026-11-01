# mradermacher/Hawkeye-8B-GGUF

## Resumen

Hawkeye-8B es un modelo de lenguaje multimodal especializado en reconocimiento de texto en escena (scene text recognition), con foco particular en texto borroso y en imágenes de baja resolución. Fue desarrollado por byron123t y está basado en la arquitectura Qwen3-VL, lo que le proporciona capacidades de visión de partida sobre las que se ha afinado para tareas de OCR exigentes, como la lectura de texto capturado por gafas inteligentes (smart glasses) o cámaras de baja calidad.

Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su uso con llama.cpp y herramientas derivadas como Ollama. El repositorio incluye cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), además de los suplementos multimodales (mmproj) necesarios para procesar imágenes con llama.cpp.

La relevancia de este modelo radica en un nicho concreto pero con demanda creciente: el OCR en condiciones adversas (texto desenfocado, baja resolución, capturas en movimiento), un caso de uso habitual en dispositivos portátiles y wearables. Al tratarse de un modelo de 8B parámetros con licencia Apache 2.0, puede ejecutarse en hardware de consumo y integrarse en productos comerciales sin restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en Qwen3-VL (transformer vision-language) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj en f16 y Q8_0) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL de 8B parámetros, una familia de modelos vision-language de Alibaba que combina un codificador de visión (ViT) con un decodificador de lenguaje tipo transformer. El suplemento mmproj incluido en el repositorio GGUF (0,9 GB en Q8_0 y 1,3 GB en f16) corresponde precisamente al proyector multimodal que permite a llama.cpp procesar imágenes junto con el texto.

El afinado se realizó sobre el dataset byron123t/BSTRB, un conjunto de datos orientado a reconocimiento de texto en escena con imágenes borrosas y de baja resolución. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del dataset ni sobre el uso de técnicas como RLHF o DPO. Tampoco se ha documentado ninguna innovación técnica específica más allá del especialización en OCR de baja calidad visual; los tags del repositorio (ocr, scene-text-recognition, blurry-text, low-resolution, smart-glasses) describen el enfoque del modelo.

## Capacidades

- Reconocimiento de texto en escena (scene text recognition) sobre imágenes naturales.
- Lectura de texto borroso y degradado, su caso de uso diferencial frente a OCR convencional.
- Procesamiento de imágenes de baja resolución, útil para capturas de wearables y gafas inteligentes.
- Capacidades multimodales generales heredadas de Qwen3-VL (comprensión de imágenes y conversación sobre ellas).
- Generación de texto conversacional, ya que el repositorio está etiquetado como conversational.
- No hay información disponible sobre soporte de tool calling, function calling ni capacidades de agentes.
- No hay información disponible sobre soporte de audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- OCR en gafas inteligentes y wearables: el modelo puede transcribir texto capturado por cámaras de baja resolución en tiempo casi real, gracias a su tamaño contenido (8B) y a la disponibilidad de cuantizaciones de 3-5 GB que caben en hardware móvil o edge.
- Digitalización de documentos degradados: lectura de escaneos antiguos, fotocopias de baja calidad o imágenes comprimidas donde los motores OCR clásicos (Tesseract) fallan por el desenfoque.
- Transcripción de señalización y rótulos en vídeo: extracción de texto de fotogramas con motion blur procedentes de vehículos, drones o cámaras corporales.
- Automatización de procesos con imágenes de entrada de calidad variable: integración en pipelines de RPA donde las fotos las toman usuarios con móviles en condiciones no controladas.
- Accesibilidad: descripción y lectura de texto del entorno para personas con discapacidad visual mediante dispositivos portátiles de bajo coste.
- Indexación y búsqueda de contenido visual: extracción del texto presente en grandes volúmenes de imágenes (capturas de pantalla, fotos de pizarras, carteles) para alimentar motores de búsqueda internos.
- Verificación de calidad en industria: lectura de etiquetas, números de serie y códigos en líneas de producción donde las cámaras no siempre capturan imágenes nítidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base y la del repositorio cuantizado no incluyen métricas de evaluación (MMLU, HumanEval, GSM8K ni benchmarks específicos de OCR como los de la familia COCO-Text o ICDAR).

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Q2_K ocupa 3,4 GB, Q4_K_M unos 5,1 GB, Q6_K unos 6,8 GB, Q8_0 unos 8,8 GB y f16 unos 16,5 GB, a los que hay que sumar el mmproj (0,9-1,3 GB) y la memoria de contexto.
- GPU recomendadas: para las cuantizaciones medias (Q4-Q6), cualquier GPU de consumo con 8 GB de VRAM o más es suficiente (RTX 3060, RTX 4060 Ti, RTX 4090 para f16 con holgura). Para despliegue en servidor, una A100 o H100 es innecesaria salvo que se busque máximo throughput.
- Consumer GPU: sí, cabe con holgura. La cuantización Q4_K_M (5,1 GB + mmproj) funciona en GPUs de 8 GB e incluso en configuraciones con parte del modelo en CPU mediante offload.
- CPU pura: viable con las cuantizaciones Q2_K a Q5_K_M en equipos con 8-16 GB de RAM, aunque con latencias notablemente superiores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj (como el servidor multimodal de llama.cpp). El modelo original en safetensors puede desplegarse con transformers o vLLM, aunque no hay confirmación de soporte oficial de vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de 8B cuantizado, se esperan velocidades típicas de esta clase en llama.cpp, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Hawkeye-8B | 8,2B | OCR de texto borroso y baja resolucion | GGUF, safetensors | Apache 2.0 |
| Qwen3-VL (base, 8B) | 8B | Vision-language generalista | GGUF, safetensors | Apache 2.0 |
| Florence-2 (Microsoft) | 0,23B-0,77B | OCR y tareas de vision generalistas | safetensors | MIT |
| GOT-OCR2.0 | 0,58B | OCR generalista de alta fidelidad | safetensors | Apache 2.0 |

Hawkeye-8B se diferencia de las alternativas en su especialización explícita en texto degradado (borroso y baja resolución), un caso donde los OCR ligeros como Florence-2 o GOT-OCR2.0 suelen rendir peor. A cambio, su tamaño (8B) lo hace más pesado que estos últimos, que caben incluso en CPUs modestas. Frente a su modelo base Qwen3-VL 8B, Hawkeye ofrece un afinado específico en OCR a costa de posible degradación en capacidades generalistas de visión, algo no cuantificado en la documentación disponible.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para ingles; no hay garantias de rendimiento con texto en espanol ni en otros idiomas, ni en el reconocimiento ni en la conversacion.
- Sesgos: no documentados. Al entrenarse sobre un dataset especializado en texto de escena (BSTRB), puede mostrar sesgos hacia los tipos de letra, idiomas y condiciones visuales presentes en dicho dataset.
- Alucinacion: como todo modelo vision-language, puede inventar texto no presente en la imagen, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S), que el propio autor senala como de menor calidad.
- Contexto: la longitud de contexto no esta documentada; verificarla antes de usarlo en tareas con imagenes grandes o multiples imagenes.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones destacables.
- Especializacion: al ser un modelo afinado para OCR, es probable que haya perdido capacidad generalista respecto a Qwen3-VL base; no es un buen candidato como asistente general.
- La version cuantizada de mradermacher incluye solo cuants estaticos; los weighted/imatrix no estaban disponibles en el momento de publicacion, por lo que la calidad en cuantizaciones bajas podria mejorar con futuras versiones.
- Descargas y adopcion muy limitadas (347 descargas, 0 likes en el momento de la ficha), lo que implica poca validacion por parte de la comunidad y posible presencia de bugs sin reportar.

## Enlaces

- Repositorio cuantizado GGUF: https://huggingface.co/mradermacher/Hawkeye-8B-GGUF
- Modelo base: https://huggingface.co/byron123t/Hawkeye-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/byron123t/BSTRB
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Hawkeye-8B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de codigo: no disponibles
