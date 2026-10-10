# Atlearia/Gemma_4_finetuned

## Resumen
Atlearia/Gemma_4_finetuned es un repositorio publicado por el usuario Atlearia que empaqueta dos artefactos entrenados: un ajuste fino mediante LoRA sobre Gemma 4 12B (base google/gemma-4-12B-it) y un detector de objetos RF-DETR Medium. El repositorio ocupa 26,2 GB e incluye el checkpoint completo del modelo de lenguaje fusionado en BF16 (gemma_model.pth, 25.932.982.415 bytes), el checkpoint del detector (rf_model.pth, 134.105.701 bytes), el adaptador LoRA original, el procesador con tokenizer y plantilla de chat, y los metadatos de entrenamiento.

El proyecto se enmarca en un contexto denominado AGEII, aparentemente orientado a la detección de peligros (hazard detection), con supervisión generada por un profesor débil. El ajuste es muy reducido: 40 pasos de LoRA sobre 155 ejemplos de entrenamiento y 22 de validación, con las capas de atención de lenguaje entrenadas mientras los pesos base y los proyectores multimodales permanecen congelados. La pérdida de validación en tokens de asistente reportada es 0,12035474926233292.

Resulta relevante como ejemplo de pipeline que combina un modelo de lenguaje multimodal grande con un detector especializado, pero debe tratarse con cautela: no se declara licencia propia en el repositorio, no se especifican longitud de contexto ni idiomas soportados, no hay benchmarks publicados del LLM y las únicas métricas disponibles cubren detección y localización, no precisión de peligro ni calibración de severidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base google/gemma-4-12B-it); detalles de arquitectura no disponibles. Detector RF-DETR Medium (transformer de detección) |
| Parametros totales | Aproximadamente 12B (modelo de lenguaje); RF-DETR Medium ~134 MB en disco. Cifra exacta no disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el checkpoint completo se publica en BF16, sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en el repositorio. El model card indica Apache 2.0 para Gemma 4 y licencia Apache para RF-DETR Medium en la documentación upstream |
| Formato de pesos | .pth con formato propio gemma-full-state-dict-v1 (no es un directorio estándar save_pretrained() de Transformers); el checkpoint del detector también es .pth. La etiqueta del repositorio incluye safetensors |

## Arquitectura y entrenamiento
El modelo base es google/gemma-4-12B-it en la revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7. Sobre él se entrenó un LoRA de atención de lenguaje mientras los pesos base y los proyectores multimodales permanecían congelados. El adaptador resultante se fusionó en el checkpoint completo, que se distribuye en BF16 bajo el formato propio gemma-full-state-dict-v1, con configuración de modelo, configuración de generación, procedencia de entrenamiento y todos los tensores fusionados. El proceso declarado consta de 40 pasos de LoRA sobre 155 ejemplos de entrenamiento y 22 de validación, con una pérdida de validación en tokens de asistente de 0,12035474926233292. La supervisión proviene de etiquetas de peligro generadas por un profesor débil, por lo que esa pérdida no establece precisión de peligro, exactitud de grounding ni calibración de severidad.

El segundo componente es un detector RF-DETR Medium (referencia rfdetr==1.11.2 en el entorno de entrenamiento) afinado sobre un conjunto de 22 clases, cuyas etiquetas ordenadas se conservan en rf_model_labels.json. El detector se evaluó con BF16, batch size 8, umbral de confianza 0 y COCO maxDets 100 sobre 1.000 imágenes de validación y 1.000 de test. El repositorio advierte de que no existe una línea base preentrenada con etiquetas emparejadas ni una evaluación verificada disjunta de grabación, por lo que los resultados no establecen tasas de falsa alarma en camino libre ni precisión en rutas no vistas.

## Capacidades
- Generación de texto y capacidades heredadas del modelo base google/gemma-4-12B-it (no detalladas en la ficha del repositorio).
- Procesamiento multimodal: el repositorio incluye un procesador con tokenizer, plantilla de chat y configuraciones, y menciona proyectores multimodales en el modelo base.
- Detección de objetos con RF-DETR Medium sobre un conjunto de 22 clases definidas en rf_model_labels.json.
- Carga mediante un loader propio (adapter_io.py) que verifica el SHA-256 completo del archivo, la identidad fijada del modelo base y el manifiesto de entrenamiento antes de reconstruir el modelo.
- Soporte de adaptadores portables: se conserva el adaptador LoRA original para su uso mediante PEFT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso
- Detección de objetos sobre imágenes: el checkpoint RF-DETR Medium está entrenado para 22 clases y puede integrarse en pipelines de visión para localizar y clasificar objetos en imágenes, devolviendo cajas y etiquetas según rf_model_labels.json.
- Investigación en detección de peligros: el proyecto AGEII permite estudiar cómo un detector especializado se combina con un LLM multimodal para tareas de seguridad, partiendo de las métricas de detección reportadas.
- Evaluación de ajustes LoRA sobre LLM grandes: el repositorio conserva el adaptador y el manifiesto de entrenamiento, lo que permite reproducir o analizar un ajuste de 40 pasos sobre 155 ejemplos.
- Prototipado de sistemas multimodales texto-imagen: combinando el procesador multimodal y el detector, se pueden construir demos que describan y localicen elementos en una imagen.
- Verificación de integridad de artefactos: el loader propio y los hashes SHA-256 permiten montar flujos que validen la procedencia y la integridad de los pesos antes de cargarlos en producción.
- Estudio de calibración con supervisión débil: dado que las etiquetas provienen de un profesor débil, el modelo sirve como caso de análisis de los límites de este tipo de supervisión.
- Base para fine-tuning posterior: el checkpoint completo en BF16 puede servir de punto de partida para nuevos ajustes con PEFT, siempre que se disponga de hardware suficiente.

## Benchmarks y rendimiento
El repositorio no publica benchmarks del modelo de lenguaje (MMLU, HumanEval, GSM8K u otros). Las únicas métricas disponibles corresponden al detector RF-DETR Medium, evaluado con RF-DETR 1.11.2, BF16, batch size 8, umbral de confianza 0 y COCO maxDets 100 sobre 1.000 imágenes de validación y 1.000 de test:

| Metrica de deteccion | Validacion | Test |
|---|---:|---:|
| COCO AP, IoU 0.50:0.95 | 0,53415 | 0,54938 |
| AP, IoU 0.50 | 0,72258 | 0,73967 |
| Recall promedio, max 100 detecciones | 0,72954 | 0,73873 |

Estas cifras son métricas de detección y localización, no de precisión de peligro ni de calibración de severidad. Los objetos pequeños y las personas siguen siendo puntos débiles según el propio autor. No se han publicado resultados de benchmarks del LLM en la información disponible.

## Requisitos de hardware
- Modelo de lenguaje completo: 25,93 GB de pesos en BF16, por lo que requiere más de 24 GB de VRAM solo para los pesos, más memoria para activaciones. El propio autor indica que los pesos superan los 24 GB de VRAM de una A5000.
- GPU recomendadas para el LLM: A100 40 GB, A100 80 GB, H100 u otros aceleradores con al menos 40 GB de VRAM; alternativamente, uso en CPU con suficiente memoria de sistema (el loader admite device="cpu").
- El LLM no cabe en GPU de consumo típicas (RTX 4090 de 24 GB, etc.) sin cuantización, y el checkpoint publicado no está cuantizado.
- Detector RF-DETR Medium: aproximadamente 134 MB, por lo que cabe holgadamente en cualquier GPU de consumo moderna.
- Dependencias de software: PyTorch, Transformers 5.19.0 y Accelerate >=1.10,<2 para el loader completo; Pillow y torchvision compatibles para el procesador; PEFT únicamente para la ruta del adaptador LoRA.
- Opciones de despliegue: el repositorio no es un directorio estándar de Transformers, por lo que debe usarse el loader suministrado (adapter_io.load_full_pth_model). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se han publicado en la información disponible datos comparativos con modelos de la misma categoría. El repositorio no ofrece una línea base preentrenada con etiquetas emparejadas para el detector, y no aporta cifras del modelo de lenguaje que permitan contrastarlo con alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlearia/Gemma_4_finetuned | ~12B (LLM) + RF-DETR Medium | No disponible | Solo métricas de detección (COCO AP test 0,54938) | No disponible en el repo | HuggingFace |
| google/gemma-4-12B-it (base) | ~12B | No disponible | No disponible | Apache 2.0 (según model card) | HuggingFace |
| Alternativas de detección de objetos | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Supervisión débil: las etiquetas de peligro provienen de un profesor débil, por lo que la pérdida de validación reportada no acredita precisión de peligro, grounding ni calibración de severidad.
- Entrenamiento muy reducido: 40 pasos de LoRA sobre 155 ejemplos, lo que limita la generalización y hace probable el sobreajuste.
- Sin línea base ni evaluación disjunta de grabación: no se ha medido una tasa de falsa alarma en camino libre ni precisión en rutas no vistas.
- Puntos débiles declarados en detección: objetos pequeños y personas.
- Riesgo de alucinación: inherente a un LLM generativo; no se documentan medidas específicas de mitigación.
- Licencia: el repositorio no declara licencia propia. Se citan licencias upstream (Apache 2.0 para Gemma 4, licencia Apache para RF-DETR), pero los derechos del dataset no se reasignan y no se ofrece una garantía de relicencia global, lo que dificulta el uso comercial sin revisión jurídica.
- Formato no estándar: el checkpoint no es un directorio save_pretrained() de Transformers y exige un loader propio, lo que complica la integración con herramientas habituales.
- Idiomas y contexto no declarados: no hay información sobre cobertura lingüística ni longitud de contexto, lo que impide planificar usos multilingües o de contexto largo.
- Requisitos de memoria elevados: el LLM en BF16 no cabe en GPU de consumo de 24 GB y no se distribuye cuantizado.
- Artefactos modificados: tanto el LLM como el detector son versiones entrenadas y modificadas, no lanzamientos upstream intactos.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Atlearia/Gemma_4_finetuned
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Model card de Gemma 4 (Google): https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia Apache 2.0 de Gemma: https://ai.google.dev/gemma/apache_2
- Documentación de licencias de Roboflow (RF-DETR): https://roboflow.com/licensing
