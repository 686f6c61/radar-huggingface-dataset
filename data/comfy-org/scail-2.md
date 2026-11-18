# Comfy-Org/SCAIL-2

## Resumen

SCAIL-2 es un modelo de difusión para generación y edición de vídeo, distribuido por Comfy-Org como repackaging de los pesos originales publicados por zai-org. El repositorio de Hugging Face no contiene el modelo original, sino una conversión de los ficheros a formatos de un solo archivo (`diffusion-single-file`) listos para cargarse en ComfyUI, la interfaz modular de nodos para modelos generativos. El modelo base declarado es `zai-org/SCAIL-2`, y los nombres de los ficheros indican que se trata de un fine-tune del transformer Wan 2.1 de 14.000 millones de parámetros.

La relevancia de esta ficha está en su función práctica: SCAIL-2 se orienta a tareas de sustitución de personajes en vídeo (character replacement), con workflows oficiales publicados en el repositorio de plantillas de ComfyUI. El paquete incluye cinco variantes de cuantización del modelo principal y dos LoRAs auxiliares (una de DPO y otra de relighting), lo que permite ajustar el equilibrio entre fidelidad, consumo de VRAM y velocidad según el hardware disponible.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens o frames vistos, ni sobre resultados de benchmarks publicados. Toda la documentación disponible se limita al empaquetado, la estructura de carpetas y los workflows de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión (transformer, base Wan 2.1 de 14B) |
| Parametros totales | 14 000 millones (según nomenclatura `14B` de los ficheros) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp8 scaled, int8 convrot, mxfp8, nvfp4/mxfp8 mix; LoRAs en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

Los ficheros distribuidos siguen la nomenclatura de Wan 2.1 (`wan2.1_14B_SCAIL_2_*`), lo que sitúa el modelo sobre el transformer de difusión de vídeo de 14B parámetros de esa familia. SCAIL-2 aparece como un fine-tune del modelo base `zai-org/SCAIL-2`, orientado a edición de vídeo con sustitución de personajes. No se detalla en la información disponible si se emplearon técnicas de RLHF, DPO u otras variantes de alineación durante el entrenamiento del modelo principal; sí se incluye una LoRA específica etiquetada como DPO (`wan2.1_SCAIL_2_DPO_lora_bf16.safetensors`), lo que sugiere que parte de la optimización por preferencias se aplica como adaptador separado y no como pesos fusionados.

La innovación técnica destacable del paquete es la variedad de formatos de cuantización: además de fp16 y fp8 escalado, se ofrecen int8 con rotación de convoluciones, mxfp8 y una mezcla nvfp4/mxfp8. Esta última apunta a hardware Blackwell de NVIDIA con soporte de coma flotante de 4 bits, lo que reduce el peso en VRAM a costa de posible pérdida de calidad. La LoRA de relighting añade control de iluminación sobre el resultado generado. No hay información sobre resolución nativa, número de frames por clip ni tasa de fotogramas soportada.

## Capacidades

- Generación y edición de vídeo mediante difusión, con foco en sustitución de personajes (character replacement) manteniendo el resto de la escena.
- Control de iluminación sobre el vídeo generado mediante la LoRA `relight`.
- Ajuste de preferencias estéticas o de fidelidad mediante la LoRA DPO incluida.
- Ejecución en ComfyUI a través de workflows de nodos predefinidos, con variantes estándar e int8.
- Carga en cinco precisiones distintas para adaptarse a distintos presupuestos de VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio; no aplica a un modelo de difusión de vídeo.
- Capacidades multilingües: no disponible (los prompts de texto dependen del codificador de texto de Wan 2.1, no especificado en esta información).

## Casos de uso

- Sustitución de personajes en postproducción: el workflow `video_wan21_scail2_character_replacement` permite reemplazar un actor o figura por otro manteniendo el movimiento y el fondo, útil para correcciones de casting o dobles digitales.
- Prototipado rápido en ComfyUI: al ser un single-file con variantes fp8 e int8, se puede iterar sobre clips cortos en una estación de trabajo sin montar un pipeline de inferencia propio.
- Previsualización de VFX en estudios pequeños: la variante int8 reduce el coste de VRAM y permite generar borradores de sustitución de personaje antes de un render final en fp16.
- Ajuste de iluminación en escenas generadas: la LoRA de relighting permite corregir la coherencia lumínica entre el personaje insertado y el entorno sin rehacer la generación completa.
- Investigación en edición de vídeo: el paquete facilita comparar el efecto de distintas cuantizaciones (fp16, fp8, int8, mxfp8, nvfp4) sobre la calidad del resultado en una misma tarea.
- Integración en flujos de automatización con la API de ComfyUI: los workflows en JSON pueden lanzarse por script para procesar lotes de clips con parámetros fijos.
- Despliegue en hardware Blackwell: la variante nvfp4/mxfp8 está pensada para GPUs con soporte de FP4, lo que permite ejecutar el modelo de 14B con menor huella de memoria que en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un transformer de difusión de 14B en fp16 requiere del orden de 28 GB solo para pesos, más activaciones y el codificador de texto; las variantes fp8, int8 y nvfp4 reducen esa cifra aproximadamente a la mitad o menos, aunque no se confirman cifras exactas en la documentación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las variantes de menor precisión son las candidatas para GPUs de consumo con 16-24 GB; las variantes fp16 encajan en A100 40/80 GB, H100 o RTX 4090/5090 con margen variable.
- Cabe en GPU de consumo: probablemente con las variantes int8, fp8 o nvfp4 en tarjetas de 16 GB o más, sujeto a la resolución y duración del clip; no confirmado.
- Opciones de despliegue: ComfyUI (soporte nativo del paquete); otros runners como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCAIL-2 (este) | 14B (base Wan 2.1) | no disponible | edición de vídeo, sustitución de personajes | MIT | Hugging Face, ComfyUI |
| Wan 2.1 14B (modelo base) | 14B | no disponible en esta ficha | generación de vídeo texto-a-vídeo | no disponible en esta ficha | Hugging Face |
| Alternativas de edición de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card es exclusivamente un empaquetado para ComfyUI; no documenta el entrenamiento, los datos ni las limitaciones del modelo original.
- No hay información sobre sesgos, tasas de alucinación visual (artefactos, inconsistencias temporales) ni evaluación cualitativa publicada.
- La sustitución de personajes puede fallar en escenas con oclusiones complejas, movimiento rápido o múltiples figuras; no se documenta el comportamiento en esos casos.
- Las cuantizaciones agresivas (int8, mxfp8, nvfp4) pueden degradar la calidad respecto a fp16; no se cuantifica esa pérdida.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base `zai-org/SCAIL-2` y de Wan 2.1, que puede imponer condiciones adicionales no reflejadas en este repositorio.
- El tamaño del repositorio (86,7 GB) implica descargas largas y espacio en disco considerable.
- No se especifican requisitos de resolución, duración de clip ni límites de frames; en producción habrá que validarlos empíricamente.
- El uso de imágenes o vídeos de personas reales para sustitución de personajes plantea riesgos de suplantación y obligaciones legales sobre consentimiento y deepfakes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/SCAIL-2
- Modelo base original: https://huggingface.co/zai-org/SCAIL-2
- ComfyUI en GitHub: https://github.com/Comfy-Org/ComfyUI
- Workflow de sustitución de personajes: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan21_scail2_character_replacement.json
- Workflow de sustitución de personajes en int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan21_scail2_character_replacement_int8.json
