# blaj/Qwen3.8-3.6-27B-blend-int8-ov

## Resumen

El modelo `blaj/Qwen3.8-3.6-27B-blend-int8-ov` es una conversion a OpenVINO IR del modelo `JetBrains/Qwen3.8-3.6-27B-blend`, con los pesos comprimidos a INT8 mediante NNCF. Se trata de un modelo nativo de vision-lenguaje (VLM) de aproximadamente 27.000 millones de parametros, con 64 capas de texto (48 de atencion lineal y 16 de atencion completa), dimension oculta de 5120 y una torre de vision de 27 capas. El modelo base publicado por JetBrains es, a su vez, una interpolacion lineal 50/50 entre Qwen3.6-27B y Qwen3.8-27B.

Su relevancia practica esta en el formato: al estar exportado como OpenVINO IR con cuantizacion INT8, esta pensado para ejecutarse sobre hardware Intel (CPU, GPU Arc y NPU) mediante OpenVINO GenAI, con un tamano de repositorio de 27,8 GB que lo situa en el rango de estaciones de trabajo y aceleradores con memoria dedicada abundante. El autor no es JetBrains ni Alibaba: es un derivado no oficial.

El repositorio tiene un volumen de adopcion muy bajo (4 descargas y 0 likes en el momento de la consulta) y no publica resultados de benchmarks, por lo que debe considerarse un artefacto experimental de despliegue mas que un modelo validado para produccion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 64 capas de texto: 48 de atención lineal y 16 de atención completa; dimensión oculta 5120; torre de visión de 27 capas; exportado a OpenVINO IR |
| Parámetros totales | Aproximadamente 27.000 millones (según la denominación del modelo; no se publica el recuento exacto) |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 asimétrico de 8 bits (`INT8_ASYM`) mediante `nncf.compress_weights`; el repositorio solo contiene la versión INT8, no hay variantes FP16, INT4 ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR: `openvino_language_model`, `openvino_text_embeddings_model`, `openvino_vision_embeddings_model` / `_pos_model` / `_merger_model`, `openvino_mtp_model`, `openvino_tokenizer` / `openvino_detokenizer` |

Datos adicionales de publicación: pipeline declarado `image-text-to-text`, librería `openvino`, etiquetas `qwen3_5`, `vlm`, `intel-arc`, `conversational`, `region:us`. Fecha de creación y última actualización: 2026-09-30. Tamaño del repositorio: 27,8 GB.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido de atención: de las 64 capas del decodificador de texto, 48 emplean atención lineal y 16 atención completa, con una dimensión oculta de 5120. Incorpora además una torre de visión de 27 capas que procesa las imágenes y las proyecta al espacio de representaciones de texto, lo que lo convierte en un VLM nativo capaz de recibir entradas de imagen y texto. El modelo incluye una cabeza de predicción multi-token (MTP) que se emplea como modelo borrador para decodificación especulativa.

Sobre el entrenamiento no hay información en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otras. Lo que sí se documenta es que el modelo base es el resultado de una interpolación lineal 50/50 entre Qwen3.6-27B y Qwen3.8-27B, es decir, una fusión de pesos (model merging) y no un entrenamiento desde cero. La conversión a OpenVINO IR se realizó con Optimum Intel (tarea `image-text-to-text`), Transformers 5.2.0 y OpenVINO 2026.3.1, aplicando después compresión de pesos INT8 asimétrica con NNCF.

Una innovación operativa destacable es el uso de MTP para decodificación especulativa dentro de OpenVINO GenAI. El autor advierte que, para esta familia de atención lineal híbrida, OpenVINO GenAI usa actualmente MTP con decodificación greedy y caché de prefijo deshabilitada, lo que condiciona el rendimiento en contextos largos.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual y diálogo guiado por imagen.
- Procesamiento de lenguaje natural general heredado de la familia Qwen3.6/Qwen3.8.
- Decodificación especulativa mediante la cabeza MTP incluida en el repositorio, lo que acelera la generación en modo greedy.
- Despliegue sobre hardware Intel a través de OpenVINO GenAI (CPU, GPU Arc y NPU), con soporte explícito de GPU en la API de ejemplo.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, razonamiento multi-paso con agentes, modo thinking, audio ni soporte multilingüe declarado.

## Casos de uso

- Descripción automática de imágenes en hardware Intel: el modelo puede generar pies de foto o descripciones de contenido visual directamente sobre una GPU Arc o una CPU Intel mediante `ov_genai.VLMPipeline`, sin depender de servicios en la nube.
- Asistente visual en puesto de trabajo: integración en aplicaciones de escritorio que necesiten analizar capturas de pantalla, diagramas o documentos escaneados y responder preguntas sobre ellos, aprovechando el pipeline de imagen-texto.
- Moderación y etiquetado de contenido multimedia: clasificación y resumen de imágenes a escala en lotes, con inferencia local en INT8 para reducir el coste por elemento.
- Digitalización de documentación técnica: extracción de información de esquemas, planos o figuras acompañadas de texto en flujos de trabajo internos, combinando la torre de visión con el decodificador de texto.
- Prototipado de producto sobre Intel Arc: validación de experiencias conversacionales con entrada de imagen antes de invertir en infraestructura, dado que el modelo ya está empaquetado en el formato nativo de OpenVINO.
- Evaluación comparativa de cuantización: uso del repositorio como referencia para medir la degradación de calidad que introduce INT8 asimétrico frente al modelo base sin cuantizar en tareas de visión-lenguaje.
- Despliegue en entornos sin conectividad: inferencia totalmente local en estaciones de trabajo con GPU dedicada, útil en ámbitos con requisitos de confidencialidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, ni para la versión INT8 ni para el modelo base. Tampoco se documentan comparaciones de perplejidad o de degradación por cuantización. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 27,8 GB, correspondientes a los pesos INT8 y los componentes auxiliares, por lo que se necesitan del orden de 28-32 GB de memoria dedicada para cargar el modelo completo, sin contar la caché KV ni los tensores intermedios. Esta cifra es una estimación derivada del tamaño del repositorio, no un dato publicado por el autor.
- GPU recomendadas: aceleradores con 40 GB o más, como A100 40/80 GB, H100, L40S 48 GB o RTX 6000 Ada 48 GB. La etiqueta `intel-arc` del repositorio apunta a GPU Intel Arc como destino previsto, aunque no se especifica el modelo concreto.
- Cabe en GPU de consumo: previsiblemente en tarjetas de 32 GB o más (por ejemplo RTX 5090), de forma ajustada. En tarjetas de 24 GB (RTX 4090, RTX 3090) el modelo completo no cabe con holgura, y no se ofrecen variantes INT4 que lo faciliten.
- Opciones de despliegue: OpenVINO GenAI mediante `VLMPipeline` (dispositivo `GPU` o `CPU`), con soporte de decodificación especulativa a través de `draft_model` usando la cabeza MTP. La exportación se realizó con Optimum Intel. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es OpenVINO IR y no GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles.
- Requisito de conversión: el autor advierte que la exportación necesita que `TMPDIR` apunte a disco real (el `/tmp` por defecto de 16 GB es insuficiente y provoca el error `basic_ios::clear: iostream error`) y que se reserve alrededor de 80 GB libres durante la fase de guardado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blaj/Qwen3.8-3.6-27B-blend-int8-ov | ~27B (no confirmado) | no disponible | OpenVINO IR INT8 | Apache-2.0 | 4 descargas, 0 likes |
| JetBrains/Qwen3.8-3.6-27B-blend | ~27B (no confirmado) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.6-27B (modelo componente del blend) | 27B (según denominación) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B (modelo componente del blend) | 27B (según denominación) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de contexto, rendimiento ni licencia de las alternativas citadas dentro de la información proporcionada. Las comparaciones de rendimiento frente a otros VLM de tamaño similar (por ejemplo, de la familia Qwen3-VL) no pueden establecerse sin resultados de benchmarks publicados.

## Limitaciones y advertencias

- No hay ningún benchmark publicado: se desconoce la calidad real del modelo y, en particular, cuánto degrada la cuantización INT8 asimétrica respecto a los pesos originales.
- El modelo base es una interpolación lineal de pesos, no un modelo entrenado: este tipo de fusiones puede producir comportamientos erráticos y degradación en tareas específicas que no se detectan sin evaluación sistemática.
- Derivado no oficial: el autor declara explícitamente que no está afiliado ni respaldado por JetBrains ni por Alibaba.
- Adopción mínima: 4 descargas y 0 likes, sin issues ni discusiones que permitan validar el funcionamiento en distintos entornos.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe ni un rendimiento concreto en castellano.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- La decodificación especulativa con MTP está limitada a decodificación greedy y con caché de prefijo deshabilitada en OpenVINO GenAI para esta familia de atención lineal híbrida, lo que penaliza el rendimiento con prompts largos y reutilización de contexto.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado aquí por ausencia de evaluaciones.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento, por lo que no pueden caracterizarse los sesgos.
- Licencia Apache-2.0: permite uso comercial, pero al tratarse de un derivado no oficial conviene revisar las condiciones aplicables a los modelos Qwen subyacentes antes de un despliegue en producción.
- Restricción de formato: al distribuirse solo como OpenVINO IR, no es directamente utilizable en stacks basados en safetensors, GGUF o transformers estándar sin una nueva conversión.
- Coste de memoria elevado: 27,8 GB de repositorio sin variantes de menor precisión disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3.8-3.6-27B-blend-int8-ov
- Modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su autor o sus componentes. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
