# maanka2/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) compacto desarrollado por Audio8, orientado a la generación de habla multilingüe y a la clonación de voz en modalidad zero-shot. Con aproximadamente 170 millones de parámetros en el modelo generativo principal (más un codec decoder adicional de unos 120 millones), se presenta como la alternativa más pequeña de su familia para ejecutar clonación de voz sin necesidad de infraestructura de alto coste. El modelo emplea una arquitectura propia denominada Audio8 Falcon H1, con dos ramas autorregresivas (lenta y rápida) que predicen tokens semánticos y codebooks de audio respectivamente. Soporta una ventana de contexto de hasta 2.048 posiciones empaquetadas de texto y audio, y cubre ocho idiomas, con chino e inglés como lenguas principales y el resto (alemán, español, francés, italiano, japonés y coreano) en fase experimental.

La relevancia de este lanzamiento reside en su tamaño: es significativamente menor que otros sistemas TTS multilingües actuales (por ejemplo, CosyVoice3 con ~1,5B o Fish S2 Pro con ~4,6B), lo que lo hace atractivo para despliegues en entornos con recursos limitados o en aplicaciones que requieren baja latencia. El modelo se distribuye bajo una licencia comunitaria propia (audio8-community-license-v1.0) y está disponible en Hugging Face con formato de pesos safetensors, junto con el codec, el tokenizador y el procesador necesarios para su uso. No se han publicado detalles completos sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (rama autorregresiva lenta de 24 capas + rama rápida de 4 capas) |
| Parametros totales | 169.779.904 (modelo principal ~170M; codec decoder ~120M aparte) |
| Parametros activos | no aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantizacion | no disponible (no se han publicado pesos cuantizados oficiales) |
| Idiomas soportados | zh, en (primarios); de, es, fr, it, ja, ko (experimentales) |
| Licencia | audio8-community-license-v1.0 (licencia personalizada, revisar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Audio8 Falcon H1, diseñada específicamente para síntesis de voz. La rama autorregresiva lenta está compuesta por 24 capas con anchura de 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida, con solo 4 capas (misma anchura y configuración de atención), predice los codebooks del codec de audio condicionada al estado oculto de la rama lenta. El codec opera a 44,1 kHz con 10 codebooks de 4.096 entradas cada uno y una resolución de 2.048 muestras por frame (~21,5 frames por segundo). El codec decoder está incluido en el repositorio, con un peso adicional de aproximadamente 120M de parámetros.

No se dispone de información detallada sobre el dataset de entrenamiento, el número total de tokens procesados ni sobre técnicas de alineamiento como RLHF o DPO. El repositorio de GitHub menciona la existencia de un pipeline de SFT (supervised fine-tuning) independiente para el entrenamiento, pero no se especifican los datos utilizados. La innovación principal del modelo es su escala compacta en comparación con otros sistemas multilingües de clonación de voz, manteniendo una arquitectura dual AR que permite una generación de audio condicionada a la referencia de voz.

## Capacidades

- Generación de texto a voz (TTS) en ocho idiomas: chino, inglés, alemán, español, francés, italiano, japonés y coreano. Los cuatro primeros se consideran primarios, mientras que el resto son experimentales y su calidad puede ser inferior.
- Clonación de voz cero-shot: a partir de un audio de referencia y su transcripción, el modelo puede sintetizar habla con la voz de la referencia sin necesidad de entrenamiento adicional.
- Síntesis sin clonación: si no se proporciona una referencia, el modelo puede generar voz con una voz por defecto.
- Generación de audio a 44,1 kHz con codec integrado, sin necesidad de descargar un codec externo.
- Soporte para inferencia por lotes (batch) con audio o códigos de referencia pre-codificados, según la documentación del repositorio de entrenamiento e inferencia.
- No dispone de capacidades de tool calling, razonamiento multi-paso, visión ni otras funciones más allá de la síntesis de voz.

## Casos de uso

- Clonación de voz para producción de audiolibros: se puede generar narración con una voz específica a partir de una muestra de referencia, reduciendo el coste de grabación de locutores profesionales.
- Doblaje y localización de contenido multimedia: el modelo permite generar voces en varios idiomas con la misma identidad vocal, útil para doblar vídeos o animaciones manteniendo la consistencia del personaje.
- Asistentes de voz personalizados: integración en aplicaciones de atención al cliente o asistentes virtuales para dotar al sistema de una voz única y natural, con la posibilidad de ajustarla con una muestra de audio.
- Prototipado rápido de experiencias de voz: desarrollo de demos o MVPs de productos que requieren síntesis de voz sin invertir en infraestructura de servidores grandes, gracias al tamaño reducido del modelo.
- Herramientas de accesibilidad: generación de contenido hablado para personas con discapacidad visual o dificultades de lectura, en varios idiomas y con voz personalizada.
- Producción de contenido educativo: creación de lecciones en audio multilingüe a partir de texto, con la opción de usar una voz consistente para todos los materiales.
- Sistemas de alerta y notificación por voz: en aplicaciones IoT o de monitorización, se puede generar mensajes hablados en tiempo real con una voz clara y de baja latencia, gracias a la ligereza del modelo.

## Benchmarks y rendimiento

La model card proporciona una tabla de tasas de error (WER/CER) sobre el dataset Common Voice 3 (CV3). Los valores son comparaciones de referencia publicadas para el modelo 0.6B, no una reevaluación estricta, y se presentan tal cual:

| Modelo | Params | zh | en | ja | ko | de | es | fr | it |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Audio8 TTS Preview 0.1B** | **~0.17B** | 3.619 | 3.307 | 12.322 | 7.653 | 5.292 | 8.548 | 12.349 | 14.480 |
| Audio8 TTS Preview 0.6B | 0.6B | **3.205** | **3.128** | 7.205 | 4.223 | 3.447 | 3.641 | 8.790 | 4.790 |
| Fish S2 Pro | 4.6B | 3.600 | 3.493 | 5.139 | **4.111** | 3.605 | 2.972 | **8.600** | 4.229 |
| Higgs Audio v2 | 4.7B | 3.378 | 3.404 | **4.742** | 4.260 | **3.300** | **2.929** | 9.425 | **3.555** |
| CosyVoice3-1.5B | 1.5B | 3.91 | 4.99 | 7.57 | (datos incompletos en la fuente) |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MOS, similitud de voz) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales de cuantización, pero con ~170M de parámetros y el codec decoder (~120M), se estima que la inferencia en FP16 o BF16 puede caber en una GPU con 4-6 GB de VRAM. Para inferencia en CPU, el modelo puede funcionar en modo float32, aunque con latencia mayor.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA (RTX 2060 o superior, A100, H100, etc.). Se recomienda al menos 6 GB de VRAM para ejecución cómoda con el codec decoder.
- Es posible ejecutar el modelo en una GPU de consumo como la RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) sin problemas.
- Opciones de despliegue: el modelo se carga mediante la librería Transformers con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; el despliegue se realiza a través del código remoto de Hugging Face.
- Latencia y throughput estimados: no se han publicado cifras concretas. Dado el tamaño compacto, se espera una latencia baja en GPU moderna, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

La siguiente tabla compara Audio8 TTS Preview 0.1B con otros modelos TTS multilingües de clonación de voz cero-shot, según los datos de la model card:

| Modelo | Params (principal) | Contexto | Idiomas | Licencia | WER medio (CV3, aprox.) |
|---|---:|---|---|---|---|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 2.048 posiciones | 8 (2 primarios) | audio8-community-license-v1.0 | 8.5 (media sobre 8 idiomas) |
| Audio8 TTS Preview 0.6B | ~0.6B | no disponible | 8 | audio8-community-license-v1.0 | 4.8 (media) |
| Fish S2 Pro | ~4.6B | no disponible | no disponible | no disponible | 4.3 (media) |
| Higgs Audio v2 | ~4.7B | no disponible | no disponible | no disponible | 4.4 (media) |
| CosyVoice3-1.5B | ~1.5B | no disponible | no disponible | no disponible | 5.5 (media, datos parciales) |

La comparativa muestra que el modelo 0.1B tiene un WER más alto en la mayoría de idiomas, especialmente en japonés, coreano, francés e italiano, lo que refleja su carácter experimental en esos idiomas. Sin embargo, su tamaño es entre 10 y 27 veces menor que los modelos de mayor escala, lo que lo convierte en una opción viable para entornos con recursos limitados.

## Limitaciones y advertencias

- Calidad inferior en idiomas experimentales: la model card indica que alemán, español, francés, italiano, japonés y coreano son evaluaciones experimentales, y los valores de WER en CV3 son notablemente más altos que en chino e inglés. Se recomienda no usar estos idiomas en producción sin una validación previa.
- Licencia comunitaria (audio8-community-license-v1.0): es una licencia personalizada que debe revisarse detenidamente antes de un uso comercial. No es una licencia estándar como Apache 2.0 o MIT.
- Riesgo de alucinación o errores de transcripción: el modelo puede generar audio con palabras o fonemas incorrectos, especialmente en idiomas experimentales o con textos ambiguos.
- Dependencia de `trust_remote_code`: el modelo requiere ejecutar código remoto de Hugging Face, lo que implica un riesgo de seguridad si el repositorio no es de confianza. Se recomienda revisar el código antes de usarlo en entornos productivos.
- No se han publicado cuantizaciones oficiales: para reducir el consumo de VRAM, sería necesario cuantizar el modelo manualmente, pero no hay versiones GGUF o AWQ disponibles.
- Contexto limitado: la ventana de 2.048 posiciones empaquetadas de texto y audio puede limitar la generación de pasajes muy largos de una sola vez; para textos extensos sería necesario dividirlos en fragmentos.
- Sin información sobre sesgos de género, edad o acento en el habla generada, ya que no se ha documentado ningún análisis de sesgo.

## Enlaces

- Modelo en Hugging Face (ID de usuario): https://huggingface.co/maanka2/Audio8-TTS-Preview-0.1b
- Modelo en Hugging Face (organización Audio8): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio de GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Página de demostración (audios de muestra): https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/audio8-tts-preview-0.1b-audio8
