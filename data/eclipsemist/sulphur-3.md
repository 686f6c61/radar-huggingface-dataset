# EclipseMist/Sulphur-3

## Resumen

Sulphur 3 es un ajuste fino (finetune) del modelo MiniMax-H3 desarrollado por el usuario EclipseMist, orientado a la generación de vídeo sin censura. Se distribuye como un checkpoint de pesos en formato safetensors (`s3.safetensors`) que se ejecuta con la librería `minimax-h3`, la misma pila que emplea el modelo base, de modo que es intercambiable con este sin cambios en el pipeline de inferencia. El repositorio ocupa 276,5 GB e incluye, además del checkpoint principal, variantes cuantizadas para VRAM reducida, una versión sin el LoRA de RL y un corrector opcional con nodos y workflow para ComfyUI.

El modelo hereda la arquitectura y las capacidades del MiniMax-H3 original, pero no se documentan en la model card ni el número de parámetros, ni la longitud de contexto, ni los idiomas soportados. La información pública se limita a la identificación del modelo base, la licencia derivada y la descripción funcional como generador de vídeo. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento del ajuste.

Su relevancia es acotada: se trata de un checkpoint comunitario con cero descargas y cero likes en el momento de la ficha, sin pipeline declarado y con una model card mínima. Resulta útil para quienes ya trabajan con MiniMax-H3 y buscan una variante sin filtrado de contenido, pero no aporta información verificable sobre calidad, sesgos o rendimiento más allá de lo que ofrece el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de MiniMaxAI/MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | incluye variantes cuantizadas en `quantized/` (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (checkpoint principal y variantes); LoRA en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniMax-H3 en la documentación proporcionada, por lo que no es posible detallar si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni su número de parámetros o longitud de contexto. Sulphur 3 se presenta como un finetune de ese modelo base, distribuido como checkpoint completo en safetensors.

El autor indica que `s3.safetensors` incorpora un LoRA de RL, mientras que `s3_raw.safetensors` corresponde al modelo sin ese LoRA, y `s3_raw_lora.safetensors` expone esa misma variante como adaptador LoRA. También se incluye `s3_ref2va.safetensors`, una variante Ref2VA que, según la model card, no ha sido entrenada. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO más allá de la mención al LoRA de RL. El corrector opcional (`s3_corrector.safetensors`) se integra en ComfyUI mediante los nodos y el workflow de `S3_ComfyUI.zip` y, según el autor, funciona también con otros modelos H3.

## Capacidades

- Generación de vídeo: es la función declarada del modelo, como finetune de MiniMax-H3 orientado a la síntesis de vídeo.
- Generación sin censura: el autor describe explícitamente el modelo como "uncensored", lo que implica la ausencia de filtrado de contenido en las salidas.
- Variante Ref2VA: se incluye un checkpoint para esta modalidad, aunque no ha sido entrenado según la model card.
- Corrección opcional: el corrector permite un paso adicional de refinamiento integrado en ComfyUI.
- Compatibilidad con la pila MiniMax-H3: se ejecuta como cualquier modelo H3, sin necesidad de código específico.
- Tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de generación de vídeo en ComfyUI: el workflow incluido en `S3_ComfyUI.zip` permite cargar el checkpoint y el corrector directamente en un grafo de ComfyUI, lo que facilita iterar sobre prompts y parámetros sin escribir código adicional.
- Investigación sobre filtrado de contenido: al ser una variante sin censura de un modelo base, sirve para estudiar cómo el ajuste fino altera la distribución de salidas frente al MiniMax-H3 original en tareas de generación de vídeo.
- Evaluación comparativa de finetunes: al incluir `s3_raw` (sin LoRA de RL) y `s3` (con LoRA de RL), permite aislar el efecto del ajuste por RL sobre la calidad y el estilo del vídeo generado.
- Despliegue en hardware limitado: las variantes en `quantized/` permiten ejecutar el modelo en GPUs con menos VRAM que la necesaria para el checkpoint completo, útil para pruebas en estaciones de trabajo locales.
- Integración en pipelines de generación de vídeo existentes: al ser intercambiable con MiniMax-H3, se puede sustituir el checkpoint en un pipeline ya montado sin reescribir la lógica de inferencia.
- Refinamiento con corrector en proyectos de animación: el corrector opcional añade una etapa de corrección sobre las salidas, aplicable a flujos de trabajo donde se busca consistencia entre fotogramas o secuencias.
- Experimentación con LoRA: `s3_raw_lora.safetensors` permite aplicar el ajuste como adaptador sobre el modelo base, facilitando la combinación con otros LoRA o merges comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 276,5 GB, lo que da una idea del orden de magnitud de los pesos completos, pero no se detalla el reparto por archivo ni la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El autor ofrece variantes cuantizadas en `quantized/` pensadas para VRAM reducida, pero no se especifican los requisitos mínimos.
- Opciones de despliegue: la librería `minimax-h3` y ComfyUI (con los nodos de `S3_ComfyUI.zip` para el corrector). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sulphur 3 | no disponible | no disponible | minimax-h3-community-license | Hugging Face (EclipseMist/Sulphur-3), 0 descargas |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | minimax-h3-community-license | Hugging Face (modelo base) |
| Tenstrip's Merges | no disponible | no disponible | no disponible | Hugging Face (TenStrip), recomendado por el autor |

No se dispone de datos de rendimiento ni de especificaciones técnicas de los modelos comparados en la información proporcionada, por lo que la comparación se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de documentación técnica: no se publican parámetros, contexto, idiomas ni detalles de entrenamiento, lo que impide evaluar el modelo con rigor antes de desplegarlo.
- Modelo sin censura: la ausencia de filtrado de contenido implica riesgo de generar material inapropiado, ofensivo o ilegal según la jurisdicción; requiere controles adicionales en cualquier uso en producción.
- Riesgo de alucinación y artefactos: no cuantificado en la información disponible; en generación de vídeo esto se traduce en incoherencias temporales, artefactos visuales y deriva de estilo.
- Licencia derivada: se distribuye bajo la MiniMax H3 Community License, que puede imponer restricciones al uso comercial; es necesario revisar `LICENSE` antes de cualquier despliegue comercial.
- Variante Ref2VA no entrenada: `s3_ref2va.safetensors` se incluye pero no ha sido entrenada, por lo que su uso en producción no está respaldado.
- Archivos experimentales: el directorio `experimental/` contiene pesos que el propio autor recomienda ignorar.
- Adopción nula: cero descargas y cero likes en el momento de la ficha, sin validación comunitaria ni reportes de calidad.
- Sin pipeline declarado: la ausencia de pipeline en Hugging Face complica la integración automática con herramientas que dependen de ese metadato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EclipseMist/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges recomendados por el autor (TenStrip): https://huggingface.co/TenStrip
