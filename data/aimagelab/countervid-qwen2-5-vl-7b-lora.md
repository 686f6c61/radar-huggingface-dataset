# aimagelab/CounterVid-Qwen2.5-VL-7B-LoRA

## Resumen

CounterVid-Qwen2.5-VL-7B-LoRA es un modelo de lenguaje multimodal desarrollado por el grupo aimagelab de la Universidad de Módena y Reggio Emilia, en colaboración con Amazon Prime Video. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-VL-7B-Instruct mediante optimización de preferencias (DPO) sobre el dataset CounterVid, compuesto por 26.167 pares de preferencias visuales y textuales generados a partir de videos contrafactuales. El objetivo principal es mitigar las alucinaciones de acción y temporales en modelos de video-lenguaje, mejorando la capacidad de grounding entre el contenido visual y las respuestas textuales.

El modelo libera los pesos fusionados del adaptador LoRA entrenado, el merger visual completamente entrenado y el modelo base original, de modo que no requiere PEFT en inferencia. Con aproximadamente 8,29 mil millones de parámetros totales, está pensado para tareas de comprensión de video, reconocimiento de acciones y razonamiento temporal. Su relevancia radica en abordar un problema crítico en la generación de descripciones de video: la tendencia de los modelos a inventar acciones o errores en el orden temporal de los eventos. El trabajo se presentó en EMNLP 2026 y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con encoder de vision y decoder de lenguaje |
| Parametros totales | 8.292.166.656 (aprox. 8,29 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un encoder de vision con un decoder de lenguaje autoregresivo. El ajuste fino se realizó mediante optimización de preferencias con los objetivos MixDPO y PaMi-VDPO, utilizando anclas generadas a partir de videos contrafactuales del dataset CounterVid. El proceso de entrenamiento empleó un adaptador LoRA que posteriormente se fusionó con los pesos del modelo base, junto con el merger visual completamente entrenado. El encoder de vision se mantuvo congelado durante la optimización de preferencias, lo que reduce el coste computacional y preserva las representaciones visuales preentrenadas. No se requieren librerías adicionales de PEFT en inferencia, ya que los pesos fusionados se distribuyen directamente.

## Capacidades

- Comprensión de video: procesa secuencias de video y genera descripciones textuales de las acciones y eventos que ocurren.
- Reconocimiento de acciones: identifica y clasifica acciones humanas o de objetos en clips de video.
- Razonamiento temporal: comprende el orden de los eventos y las relaciones causales entre ellos, reduciendo errores de secuencia.
- Procesamiento de imágenes: al heredar las capacidades del modelo base, también puede responder preguntas sobre imágenes estáticas.
- Generación de texto: produce respuestas en lenguaje natural coherentes y contextualizadas.
- Soporte de conversación multimodal: puede mantener diálogos que combinan entradas visuales y textuales.
- Optimización contra alucinaciones: específicamente entrenado para reducir la invención de acciones o errores en la temporalidad de los eventos.

## Casos de uso

- Análisis de video para seguridad: el modelo puede procesar grabaciones de cámaras de vigilancia y describir acciones sospechosas o eventos anómalos, ayudando a operadores humanos a revisar material de forma más eficiente.
- Descripción automática de deportes: en retransmisiones deportivas, puede generar narraciones en tiempo real de jugadas y movimientos de los atletas, mejorando la accesibilidad para personas con discapacidad visual.
- Moderación de contenido en plataformas de video: puede identificar y describir acciones inapropiadas o violentas en vídeos subidos por usuarios, facilitando la revisión humana.
- Asistencia para personas con discapacidad visual: al describir acciones y eventos en vídeos, permite a usuarios con discapacidad visual comprender el contenido audiovisual de forma autónoma.
- Investigación académica en visión por computador: sirve como modelo de referencia para estudiar la reducción de alucinaciones en modelos de video-lenguaje y para comparar con otros enfoques.
- Generación de subtítulos descriptivos para archivos de vídeo: puede crear subtítulos enriquecidos que incluyan información sobre acciones y su orden temporal, útil para indexación y búsqueda de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 16,6 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad de memoria.
- Para inferencia en bfloat16 se recomienda una GPU con al menos 24 GB de VRAM, como una NVIDIA RTX 4090, A100 o similar.
- En GPUs con menor memoria se podría recurrir a cuantización, aunque no se han publicado versiones cuantizadas oficiales.
- El modelo se puede cargar con la librería transformers de Hugging Face, como se muestra en el ejemplo de la model card.
- No se han documentado opciones de despliegue específicas como vLLM u Ollama, pero al ser compatible con transformers, podría integrarse en pipelines estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CounterVid-Qwen2.5-VL-7B-LoRA | 8,29B | No disponible | Apache 2.0 | Video-lenguaje con DPO para reducir alucinaciones |
| Qwen2.5-VL-7B-Instruct (base) | 7B | 128K (según documentación pública) | Apache 2.0 | Modelo base multimodal generalista |
| Video-LLaVA (ejemplo) | 7B | No disponible | Apache 2.0 | Video-lenguaje con instrucciones de ajuste |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparación se limita a características generales.

## Limitaciones y advertencias

- Es un modelo de investigación y puede producir respuestas incorrectas o no fundamentadas, especialmente en escenarios complejos o ambiguos.
- Hereda los sesgos y limitaciones del modelo base Qwen2.5-VL-7B-Instruct, incluyendo posibles sesgos de género, raza o cultura en los datos de entrenamiento.
- Solo soporta el idioma inglés, lo que limita su uso en entornos multilingües.
- Aunque está optimizado para reducir alucinaciones de acción y temporales, no las elimina por completo; se recomienda verificación humana en aplicaciones críticas.
- No debe utilizarse como única base para decisiones de alto riesgo, como diagnósticos médicos o evaluaciones legales.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.

## Enlaces

- [Hugging Face - CounterVid-Qwen2.5-VL-7B-LoRA](https://huggingface.co/aimagelab/CounterVid-Qwen2.5-VL-7B-LoRA)
- [Repositorio GitHub de CounterVid](https://github.com/aimagelab/CounterVid)
- [Página del proyecto CounterVid](https://aimagelab.github.io/CounterVid/)
- [Dataset CounterVid en Hugging Face](https://huggingface.co/datasets/aimagelab/CounterVid)
- [Modelo base Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
