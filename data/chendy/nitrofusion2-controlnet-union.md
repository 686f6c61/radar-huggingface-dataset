# ChenDY/NitroFusion2-Controlnet-Union

## Resumen

NitroFusion2-Controlnet-Union es un adaptador ControlNet de tipo "union" desarrollado por ChenDY que se acopla al modelo base de difusión NitroFusion2 para permitir generación de imágenes texto-a-imagen condicionada por mapas de control espacial en uno o dos pasos de inferencia. Se trata de un fine-tuning del ControlNet Union 2.1-2602 de alibaba-pai (Z-Image-Turbo-Fun-Controlnet-Union-2.1), readaptado específicamente para el régimen de pocos pasos de NitroFusion2. El modelo resuelve el problema de aplicar control estructural preciso (pose, profundidad, bordes, etc.) sin renunciar a la velocidad de los modelos de difusión de un solo paso.

El checkpoint se publica como archivo único en formato `safetensors` dentro de la librería `diffusion-single-file`, con un tamaño de repositorio de 8,7 GB, y está pensado para su uso en ComfyUI mediante los flujos de trabajo incluidos. Soporta siete tipos de condición: Canny, HED, Depth, Pose, Scribble, Gray e inpainting, lo que lo convierte en una solución versátil para pipelines de generación controlada de baja latencia.

Es relevante ahora porque combina dos tendencias activas en difusión open source: los modelos de destilación de pocos pasos (que reducen el coste computacional drásticamente) y los ControlNet unificados (que evitan mantener un adaptador separado por cada tipo de control). La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ControlNet de tipo union sobre modelo de difusión (adaptador para NitroFusion2) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single file) |

## Arquitectura y entrenamiento

El modelo es un adaptador ControlNet que se injerta sobre el modelo base NitroFusion2, un modelo de difusión optimizado para generación en uno o dos pasos. La arquitectura del adaptador deriva del ControlNet Union 2.1-2602 de alibaba-pai, que en su versión completa consta de 15 bloques de capa de control más 2 bloques de refinamiento. La variante "lite" reduce esto a 3 bloques de control más 2 de refinamiento, sacrificando fuerza de control a cambio de menor huella de memoria. El adaptador se ha reentrenado para alinearse con la trayectoria de muestreo de NitroFusion2, de modo que el condicionamiento espacial funcione correctamente en regímenes de 1 y 2 pasos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La innovación principal declarada es la readaptación del ControlNet union a un modelo de difusión de un solo paso, manteniendo siete modalidades de control bajo un único checkpoint.

## Capacidades

- Generación texto-a-imagen condicionada por mapas de control espacial.
- Soporte de siete condiciones: Canny (bordes), HED (bordes suaves), Depth (profundidad), Pose (esqueleto humano), Scribble (garabato), Gray (escala de grises) e inpainting (relleno de regiones enmascaradas).
- Inferencia en 1 paso y en 2 pasos, con flujos de trabajo específicos para cada régimen en ComfyUI.
- Combinación de condiciones, por ejemplo Pose + Inpaint, según los ejemplos de la model card.
- Dos variantes de checkpoint: completa (mayor control, más memoria) y lite (menor memoria, control más débil).
- Integración nativa con ComfyUI mediante archivos de workflow JSON incluidos.
- Idioma de prompts: inglés.

## Casos de uso

- Generación de personajes con pose controlada: se extrae el esqueleto de una imagen de referencia y se condiciona la generación con el mapa Pose en un solo paso, útil para previsualización rápida de concept art o storyboards.
- Relleno de regiones (inpainting) en flujo de edición: combinado con una máscara y un mapa de pose, permite sustituir partes de una imagen manteniendo la coherencia estructural, adecuado para retoque fotográfico asistido.
- Prototipado de escenarios 3D a partir de mapas de profundidad: se renderiza un depth map desde una escena y se genera una imagen fotorrealista coherente, útil en previsualización arquitectónica.
- Transferencia de estilo con preservación de estructura: usando Canny o HED se conservan los contornos de una imagen fuente mientras el prompt define la nueva apariencia, aplicable a diseño gráfico y marketing.
- Generación de bocetos a imagen final: a partir de un scribble o un dibujo en grises se produce una imagen acabada en pocos pasos, útil para ilustradores que quieran iterar rápido.
- Pipelines de generación masiva de baja latencia: al requerir solo 1-2 pasos, encaja en servicios donde el coste por imagen es crítico y se necesita control estructural, como catálogos de producto o generación de variaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente comparaciones visuales cualitativas (mapas de control frente a resultados del ControlNet original con NitroFusion2 frente al adaptador propuesto) para Pose, Canny, HED, Depth y Pose + Inpaint, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 8,7 GB y la variante lite está descrita como "más pequeña y ligera en memoria".
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; la existencia de una variante lite sugiere orientación a entornos con memoria limitada.
- Opciones de despliegue: ComfyUI (soportado oficialmente con workflows incluidos). Otros backends como vLLM, llama.cpp, Ollama o TGI no aplican a modelos de difusión y no se mencionan.
- Latencia y throughput: no disponible; por diseño, la inferencia en 1-2 pasos reduce el coste frente a modelos de difusión de 20-50 pasos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Condiciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2-Controlnet-Union | ControlNet union sobre NitroFusion2 | 1-2 | Canny, HED, Depth, Pose, Scribble, Gray, Inpaint | Apache 2.0 | Hugging Face |
| Z-Image-Turbo-Fun-Controlnet-Union-2.1 | ControlNet union base (alibaba-pai) | no especificado | Union (multicondición) | no disponible en la información | Hugging Face |
| NitroFusion2 (base) | Modelo de difusión de pocos pasos | 1-2 | Sin control espacial | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento cuantitativos para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Requiere obligatoriamente NitroFusion2 como modelo base; no funciona de forma autónoma.
- Solo soporta prompts en inglés según la metadata del modelo.
- La variante lite ofrece un control más débil que la completa, lo que puede traducirse en menor fidelidad estructural.
- No se han publicado métricas objetivas de calidad (FID, CLIP score, etc.), por lo que la evaluación depende de inspección visual.
- Riesgo de artefactos y desviaciones del mapa de control en regímenes de un solo paso, especialmente en condiciones complejas o combinadas.
- No se documentan sesgos del dataset de entrenamiento ni limitaciones demográficas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base NitroFusion2 y del ControlNet original de alibaba-pai antes de uso comercial en producción.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ChenDY/NitroFusion2-Controlnet-Union
- Modelo base NitroFusion2: https://huggingface.co/ChenDY/NitroFusion2
- ControlNet original: https://huggingface.co/alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1
- Demo (Space): https://huggingface.co/spaces/ChenDY/NitroFusion2
- GitHub: https://github.com/ChenDarYen/NitroFusion2
- Project page: https://chendaryen.github.io/NitroFusion2.github.io/
- arXiv: https://arxiv.org/abs/2611.05648
