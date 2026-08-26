# aimagelab/CounterVid-Qwen2.5-VL-3B-LoRA

## Resumen

CounterVid-Qwen2.5-VL-3B-LoRA es un modelo de lenguaje y visión (VLM) desarrollado por el grupo de investigación aimagelab de la Universidad de Módena y Reggio Emilia, en colaboración con el equipo de Amazon Prime Video. Se trata de un ajuste fino del modelo base Qwen2.5-VL-3B-Instruct mediante LoRA, entrenado con el dataset CounterVid, compuesto por 26.167 pares de preferencias sintéticas generadas a partir de vídeos contrafactuales controlados. El objetivo principal es mitigar las alucinaciones de acción y temporales en modelos de vídeo-lenguaje, mejorando la capacidad de razonamiento sobre eventos y su orden temporal.

El modelo se publica como un merge independiente: el adaptador LoRA entrenado, el merger visual completamente entrenado y el modelo base original se fusionan en un único conjunto de pesos. No requiere PEFT en inferencia. Con 3.754.622.976 parámetros (aproximadamente 3,75 mil millones), es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo. La licencia es qwen-research, una variante de la licencia de Qwen para fines de investigación, y el idioma soportado es el inglés. Su relevancia actual radica en abordar un problema conocido en VLMs: la tendencia a inventar acciones o alterar el orden temporal de eventos en vídeos, un aspecto crítico para aplicaciones de análisis de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-3B-Instruct + LoRA (fusionado) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (licencia de investigacion de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un VLM basado en transformer con un codificador de vision y un decodificador de lenguaje. El ajuste fino se realizo mediante LoRA (Low-Rank Adaptation) sobre las capas de atencion del modelo, mientras que el vision encoder se mantuvo congelado durante la optimizacion de preferencias. Ademas, se entreno un "visual merger" que combina las representaciones visuales del video con las textuales. El entrenamiento utilizo el objetivo MixDPO / PaMi-VDPO con anclajes de CounterVid, un metodo de optimizacion de preferencias que contrasta respuestas correctas con respuestas generadas a partir de videos contrafactuales (por ejemplo, videos donde se altera el orden de las acciones o se elimina una accion). El dataset CounterVid contiene 26.167 pares de preferencias sinteticas, generados de forma controlada para ensenar al modelo a distinguir entre descripciones factuales y alucinadas. El adaptador LoRA se fusiono con los pesos base antes de la publicacion, por lo que el modelo resultante es un unico conjunto de pesos listo para inferencia.

## Capacidades

- Comprension de video: el modelo procesa secuencias de video y responde preguntas sobre el contenido, las acciones y los eventos que ocurren.
- Razonamiento temporal: disenado especificamente para mejorar la precision en tareas que requieren entender el orden de los eventos y la duracion de las acciones.
- Generacion de texto multimodal: dado un video y una instruccion textual, produce descripciones, resumenes o respuestas a preguntas.
- Reduccion de alucinaciones de accion: el entrenamiento con contrafactuales reduce la tendencia a inventar acciones que no aparecen en el video.
- Capacidades heredadas del modelo base: al estar basado en Qwen2.5-VL-3B-Instruct, conserva las habilidades generales de este, como reconocimiento de objetos, OCR, y comprension de imagenes estaticas, aunque el foco del ajuste es el video.
- Soporte de conversacion multimodal: puede mantener dialogos de varios turnos sobre contenido visual, aunque la ficha no especifica detalles adicionales.

## Casos de uso

- Analisis de video para seguridad y vigilancia: el modelo puede procesar grabaciones de camaras y generar informes textuales sobre las acciones detectadas, reduciendo falsas alarmas al no inventar eventos. Su capacidad temporal ayuda a describir secuencias de comportamiento.
- Moderacion de contenido en plataformas de video: permite clasificar automaticamente si un video contiene acciones prohibidas (violencia, vandalismo) basandose en descripciones generadas, con menor riesgo de alucinar contenido inexistente.
- Asistencia para personas con discapacidad visual: el modelo puede describir en tiempo real lo que ocurre en un video, incluyendo el orden de las acciones, ayudando a comprender escenas complejas.
- Investigacion academica en vision por computador: sirve como punto de partida para estudiar metodos de mitigacion de alucinaciones en VLMs, ya que su entrenamiento con contrafactuales es reproducible y documentado.
- Generacion de subtitulos descriptivos para video: puede producir subtitulos o descripciones alternativas (audio description) para contenido audiovisual, mejorando la accesibilidad.
- Evaluacion de modelos de video-lenguaje: al ser un modelo de referencia con alucinaciones reducidas, puede usarse como baseline en benchmarks de razonamiento temporal y de accion.
- Automatizacion de resumenes de reuniones grabadas: el modelo puede procesar grabaciones de videollamadas y extraer las acciones clave y su orden, facilitando la generacion de actas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion ni comparaciones con otros modelos. Se recomienda consultar el paper de EMNLP 2026 para datos de rendimiento detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,75 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 7,5 GB. Considerando memoria para activaciones y overhead, se estima un consumo de 10-12 GB de VRAM en inferencia con contexto moderado.
- GPU recomendadas: una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente para ejecutar el modelo con margen. GPUs con 16 GB (como RTX 4080) pueden funcionar con secuencias de video cortas y batch reducido.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs consumer de gama alta. Para GPUs con menos de 12 GB, se requeriria cuantizacion (no publicada en el repositorio).
- Opciones de despliegue: el modelo es compatible con la libreria transformers (carga directa con `Qwen2_5_VLForConditionalGeneration`). Tambien puede desplegarse con vLLM o TGI si se adapta el formato, aunque no hay instrucciones especificas en la ficha. Para inferencia local, llama.cpp no es aplicable directamente por ser un modelo multimodal con vision encoder.
- Latencia y throughput: no disponible. Depende del hardware, la longitud del video y el numero de frames procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CounterVid-Qwen2.5-VL-3B-LoRA | 3,75 B | no disponible | Video, reduccion de alucinaciones | qwen-research |
| Qwen2.5-VL-3B-Instruct (base) | 3,75 B | 32k (segun documentacion oficial de Qwen) | Vision-lenguaje general | Apache 2.0 (para el base) |
| Video-LLaVA (ejemplo de VLM de video) | 7 B | no disponible | Video-lenguaje general | Apache 2.0 |

La comparativa se limita a modelos de tamano similar. CounterVid se distingue por su entrenamiento especifico contra alucinaciones de accion y temporal, mientras que el base Qwen2.5-VL-3B-Instruct es un modelo generalista. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de investigacion: la licencia qwen-research restringe el uso a fines de investigacion; no esta autorizado para uso comercial sin permiso explicito.
- Sesgos heredados: al derivar de Qwen2.5-VL-3B-Instruct, el modelo puede heredar sesgos presentes en los datos de entrenamiento del base, como sesgos de genero, raza o culturales.
- Riesgo de alucinaciones residuales: aunque el entrenamiento con contrafactuales reduce las alucinaciones de accion y temporales, no las elimina por completo. El modelo puede producir respuestas incorrectas o no fundamentadas en el video.
- Limitaciones de idioma: solo soporta ingles. No se ha evaluado su rendimiento en otros idiomas.
- Contexto limitado: la longitud de contexto no se especifica en la ficha, pero al ser un modelo de 3B, es probable que tenga limitaciones para videos muy largos o con muchos frames.
- No apto para decisiones de alto riesgo: la model card advierte explicitamente que no debe usarse como unica base para decisiones criticas (medicas, legales, etc.).
- Dependencia del modelo base: cualquier limitacion del Qwen2.5-VL-3B-Instruct (por ejemplo, en razonamiento complejo o conocimiento factual) se traslada a este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aimagelab/CounterVid-Qwen2.5-VL-3B-LoRA
- Dataset CounterVid: https://huggingface.co/datasets/aimagelab/CounterVid
- Repositorio GitHub del proyecto: https://github.com/aimagelab/CounterVid
- Pagina del proyecto: https://aimagelab.github.io/CounterVid/
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper (EMNLP 2026): citado en la model card, disponible en el repositorio del proyecto.
