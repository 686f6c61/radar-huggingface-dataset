# indhic-ai/MiniMax_H3-Prompt_Rewriter-8B-LORA-Merged-GGUF

## Resumen

Este modelo es una conversión a GGUF del adaptador LoRA `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B` fusionado sobre el modelo base `Qwen/Qwen3-VL-8B-Instruct`. Su función es transformar solicitudes breves de usuario en prompts profesionales listos para el sistema de generación conjunta de vídeo y audio MiniMax-H3, cubriendo las tareas T2VA (texto a vídeo-audio), I2VA (imagen inicial a vídeo-audio), L2VA (imagen final a vídeo-audio) y FL2VA (primera y última imagen a vídeo-audio). El resultado es un modelo de 8 190 millones de parámetros que combina las capacidades multimodales de Qwen3-VL (visión y texto) con una instrucción de reescritura altamente estructurada, pensada para producir descripciones detalladas que incluyen alineación de fotogramas, paisaje sonoro y música no diegética.

La relevancia actual radica en que MiniMax-H3 es un sistema omni-modal de generación de vídeo con audio nativo, y disponer de un reescritor de prompts eficiente y ejecutable en local (vía llama.cpp) facilita la integración en flujos de producción sin depender de APIs propietarias. El modelo se distribuye en formato GGUF con cuantización Q8_0 para el modelo de lenguaje y F16 para el módulo de visión (mmproj), lo que permite su uso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-8B-Instruct) con torre de visión separada (mmproj) |
| Parametros totales | 8 190 735 360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (mmproj) |
| Idiomas soportados | no disponible (el sistema prompt exige descripciones en ingles, pero el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es el resultado de fusionar (merge) el adaptador LoRA `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B` sobre el modelo base `Qwen/Qwen3-VL-8B-Instruct`. El proceso de fusión se realizó con PEFT (`merge_and_unload`) en bf16 sobre CPU, y posteriormente se convirtió a GGUF mediante las herramientas nativas de llama.cpp para Qwen3-VL. No se dispone de información sobre los datos de entrenamiento del LoRA (número de tokens, composición del dataset, método de alineación) más allá de que fue entrenado para seguir el formato de prompt definido en `prompt_template.py` del repositorio original. El sistema prompt asociado es muy estricto: exige una salida con tres campos obligatorios (`integrated_multimodal_description`, `overall_soundscape`, `non_diegetic_music`), reglas de alineación temporal para imágenes de referencia, y la preservación exacta de diálogos y letras proporcionadas por el usuario.

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador de visión (vision tower) que se distribuye por separado en el archivo `mmproj`. El modelo de lenguaje procesa el texto y las instrucciones, mientras que el módulo de visión se utiliza únicamente para las tareas condicionadas por imágenes (I2VA, L2VA, FL2VA).

## Capacidades

- Reescritura de prompts para generación de vídeo-audio con MiniMax-H3, cubriendo las tareas T2VA, I2VA, L2VA y FL2VA.
- Generación de descripciones multimodales integradas que incluyen estilo visual, composición, acciones, cámara, diálogo y sonido diegético sincronizado.
- Creación de paisajes sonoros generales (`overall_soundscape`) y música no diegética (`non_diegetic_music`) como campos separados.
- Alineación precisa de fotogramas de referencia (imagen inicial, final o ambas) con marcas de tiempo en el vídeo objetivo.
- Preservación exacta de diálogos, letras y texto visible proporcionado por el usuario, sin traducción ni paráfrasis.
- Asignación de identificadores de hablante (S1, S2, etc.) y etiquetas de idioma para contenido hablado o cantado.
- Soporte de entrada multimodal: acepta texto solo (T2VA) o texto más una o dos imágenes (I2VA, L2VA, FL2VA) mediante el módulo de visión.

## Casos de uso

- Generación de vídeo-audio a partir de descripciones textuales breves: el modelo convierte una frase como "un atardecer en la playa con olas y gaviotas" en un prompt detallado de 3 campos listo para MiniMax-H3, ahorrando tiempo de iteración manual.
- Producción de contenido publicitario con imágenes de referencia: se proporciona un primer fotograma (logotipo, producto) y el modelo genera una descripción que respeta la identidad visual y la composición inicial, facilitando la creación de anuncios en vídeo con audio sincronizado.
- Doblaje y localización de vídeos: al preservar diálogos y letras en su idioma original, el modelo puede usarse para generar prompts que mantengan el habla existente mientras se describe el entorno sonoro y la música, útil en procesos de doblaje o subtitulado.
- Creación de storyboards animados: con una imagen inicial y una final, el modelo describe una trayectoria continua y físicamente plausible entre ambas, permitiendo previsualizar transiciones de escena antes de la generación final.
- Automatización de pipelines de generación de vídeo: integrado en herramientas como ComfyUI o scripts de llama.cpp, el modelo puede reescribir prompts de forma masiva para campañas de contenido generado por IA, reduciendo el trabajo manual de redacción.
- Asistencia a creadores de vídeo sin experiencia técnica: un usuario puede escribir una idea simple y obtener un prompt profesional estructurado que cumpla con las especificaciones de MiniMax-H3, democratizando el acceso a la generación de vídeo-audio de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 del modelo de lenguaje ocupa aproximadamente 8,7 GB, y el mmproj F16 unos 1,16 GB. Con overhead de contexto y buffers, se recomienda un mínimo de 12 GB de VRAM para ejecutar el modelo completo con llama.cpp.
- GPU recomendadas: tarjetas con 12-16 GB de VRAM, como RTX 4070 Ti Super, RTX 4080, RTX 4090, o GPUs profesionales como A10, L4 o A100. Para tareas solo de texto (T2VA) sin mmproj, 8 GB de VRAM pueden ser suficientes.
- Cabe en GPU de consumo: sí, en tarjetas de gama media-alta (12 GB o más) con cuantización Q8_0.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama (si se importa el GGUF), y cualquier servidor compatible con el formato GGUF (por ejemplo, llama-cpp-python). También puede usarse en CPU con suficiente RAM, aunque con mayor latencia.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud del prompt de entrada; el sistema prompt es largo y la salida puede ser extensa, por lo que en CPU se esperan tiempos de varios segundos por generación.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. El modelo base Qwen3-VL-8B-Instruct es un modelo multimodal generalista, pero sin el LoRA no produce el formato estructurado de MiniMax-H3. El adaptador original `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B` es la referencia, pero no se han publicado comparativas cuantitativas con otras alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo no genera vídeo ni audio; solo produce prompts de texto. Debe combinarse con el sistema MiniMax-H3 para la generación final.
- El sistema prompt es extremadamente rígido: cualquier desviación del formato (campos, orden, marcas de tiempo, alineación de imágenes) puede invalidar el resultado para MiniMax-H3. Se recomienda usar el prompt exacto proporcionado en la model card.
- Las descripciones se generan en inglés, aunque se preservan diálogos y letras en su idioma original. Esto puede limitar su uso en flujos que requieran descripciones en otros idiomas.
- Riesgo de alucinación: el modelo puede inventar detalles visuales o sonoros no presentes en la entrada, especialmente si la solicitud es ambigua. La instrucción de "no inventar diálogos ni texto visible" mitiga parcialmente este riesgo, pero no lo elimina.
- La cuantización Q8_0 puede introducir ligeras pérdidas de calidad respecto al modelo en bf16, aunque en tareas de reescritura de prompts suele ser aceptable.
- El modelo es una conversión de un LoRA fusionado; no se han publicado evaluaciones de robustez en escenarios de producción a gran escala.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/indhic-ai/MiniMax_H3-Prompt_Rewriter-8B-LORA-Merged-GGUF
- Adaptador LoRA original: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Guía de escritura de prompts de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3/blob/main/skills/h3-prompt-writing/SKILL.md
- Herramienta de demostración del reescritor: https://huggingface.co/spaces/hugging-apps/minimax-h3-prompt-rewriter-lora-8b
