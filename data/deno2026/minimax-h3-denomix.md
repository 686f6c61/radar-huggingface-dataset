# Deno2026/MiniMax-H3-DenoMix

## Resumen

MiniMax-H3-DenoMix es un modelo de difusión para generación de vídeo a partir de referencias (reference-to-video, R2V) y de imagen más texto (image-text-to-video), publicado por el usuario Deno2026 (DENO) como un único fichero safetensors de 20.967.647.432 bytes (aproximadamente 20,97 GB) en cuantización INT8 podada. No es un modelo de lenguaje: no procesa texto de forma autoregresiva ni tiene ventana de contexto, sino que genera fotogramas de vídeo condicionados por una o varias imágenes de referencia y una descripción textual.

El modelo se construye fusionando (merge) los pesos R2V de MiniMax H3, desarrollado por MiniMax, con el fine-tune Singularity de WarmBloodAban y algunos pesos adicionales, todo ello consolidado en un solo archivo listo para cargarse en ComfyUI mediante el nodo `UNETLoader` (Load Diffusion Model) en sustitución del modelo de difusión R2V pruned INT8 original. El codificador de texto y los VAE no cambian respecto al flujo de trabajo original de MiniMax H3.

Su relevancia es práctica: reduce el despliegue de un modelo de vídeo de referencia a vídeo a un único fichero de ~21 GB con cuantización INT8, lo que simplifica su uso en entornos locales y en flujos de ComfyUI. Ahora bien, la ficha no aporta detalles de arquitectura interna, número de parámetros, datos de entrenamiento ni evaluaciones, y el repositorio no registra descargas ni valoraciones, por lo que debe tratarse como un artefacto experimental de la comunidad y no como un modelo validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (reference-to-video e image-text-to-video); el tipo de bloque interno (DiT, UNet u otro) no se detalla en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusión de vídeo, sin ventana de contexto textual) |
| Tipos de cuantización | INT8 con poda y rotación para convoluciones (ConvRot); es el único formato publicado |
| Idiomas soportados | no disponible (no se documenta el soporte multilingüe de los prompts) |
| Licencia | MiniMax H3 Community License Agreement (pesos derivados); el componente Singularity se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors, fichero único (`diffusion-single-file`), INT8 podado |
| Nombre del fichero | `MiniMax-H3_DenoMix_ref2va_pruned_int8_v3.safetensors` |
| Tamaño del fichero | 20.967.647.432 bytes (~20,97 GB) |
| SHA-256 | `6fc735bb1d2e9e44951106b3ec6a4c063df1535c567bc7d44aaff4c9052add52` |
| Resolución y duración de vídeo | no disponible |
| Codificador de texto y VAE | no se distribuyen; se reutilizan los del flujo de trabajo MiniMax H3 R2V en ComfyUI |
| Tamaño del repositorio | 21,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un modelo de difusión de MiniMax H3 en la variante R2V (reference-to-video), convertido a un formato de pesos INT8 podado con cuantización ConvRot y empaquetado en un solo fichero para su carga directa en ComfyUI. No se especifican el número de bloques, el tipo de atención, el tamaño de parche del VAE, la resolución nativa ni la longitud máxima de vídeo generado.

El proceso de construcción no es un entrenamiento desde cero, sino una fusión de pesos (merge): los pesos R2V originales de MiniMax H3 se combinan con el fine-tune Singularity de WarmBloodAban y con «unos pocos pesos adicionales» en un único fichero, según indica el autor. No se documentan tokens de entrenamiento (concepto no aplicable a un modelo de difusión), composición del dataset, uso de RLHF/DPO ni ninguna innovación técnica declarada más allá de la propia cuantización INT8 con poda y de la consolidación en un solo archivo. Tampoco se publica qué capas se han podado ni el impacto medido de esa poda en la calidad final.

## Capacidades

- Generación de vídeo condicionada por una o varias imágenes de referencia (reference-to-video), orientada a mantener la identidad o apariencia del sujeto de referencia entre fotogramas.
- Generación de vídeo a partir de imagen y texto (image-text-to-video), según el `pipeline_tag` del repositorio.
- Integración nativa en ComfyUI: se carga con `UNETLoader` (Load Diffusion Model) en el flujo MiniMax H3 R2V, manteniendo el mismo codificador de texto y VAE.
- Distribución en un único fichero safetensors, lo que simplifica el intercambio y el despliegue en comparación con repositorios multi-shard.
- Cuantización INT8 con poda: menor huella en disco y en memoria frente a los pesos sin cuantizar del modelo base, a costa de una posible pérdida de fidelidad no cuantificada.
- No se documentan soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, comprensión de vídeo, audio, modo «thinking» ni capacidades multimodales de entrada distintas de la imagen de referencia.
- No se documenta el comportamiento con prompts en castellano.

## Casos de uso

- Publicidad de producto con consistencia de sujeto: usar una o varias fotos del producto o del modelo como referencia R2V para generar planos de vídeo donde el objeto mantenga su apariencia entre tomas, evitando el coste de rodaje y de postproducción de cada variante.
- Moda y prueba virtual (virtual try-on): emplear la prenda y la persona como referencias para producir clips cortos con distintas poses o ángulos, aprovechando que el modelo está entrenado específicamente para preservar la referencia.
- Previsualización de storyboards y animáticas: convertir bocetos o fotogramas clave en clips de movimiento para validar ritmo y encuadre antes de pasar a producción 3D o rodaje real.
- Series de contenido con personaje recurrente: mantener un personaje fijo como imagen de referencia para generar múltiples escenas coherentes en redes sociales o vídeo explicativo, reduciendo el trabajo manual de consistencia entre planos.
- Prototipado e investigación en ComfyUI: sustituir el modelo R2V pruned INT8 de referencia por este merge en un flujo ya existente para comparar resultados, sin tocar codificador de texto ni VAE.
- Integración en pipelines automatizados: cargar el fichero en un servidor con ComfyUI y disparar generaciones mediante su API para producir variaciones de vídeo a partir de un catálogo de imágenes de referencia.
- Evaluación de cuantización y merges: comparar este INT8 podado frente a los pesos originales de MiniMax H3 y frente al fine-tune Singularity para medir la degradación introducida por la poda y por la fusión.
- Generación local sin dependencia de servicios en la nube: al caber en un único fichero de ~21 GB, permite montar un entorno de generación de vídeo en hardware propio, siempre que la licencia comunitaria lo autorice para el uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FVD, CLIP-score, consistencia de identidad, adherencia al prompt) ni comparaciones cuantitativas con el modelo base o con el fine-tune Singularity.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan unos 20,97 GB, por lo que se necesita al menos esa cantidad solo para el modelo de difusión, más la memoria de activaciones, el codificador de texto y los VAE del flujo MiniMax H3. Estimación orientativa a partir del tamaño del fichero: 24 GB de VRAM es el mínimo ajustado y 32-48 GB es el rango recomendable; no hay cifras oficiales publicadas.
- GPU recomendadas: A100 (40 u 80 GB) y H100 (80 GB) para ejecución holgada sin offloading; en el extremo consumer, RTX 4090 (24 GB) o RTX 5090 pueden intentarlo, pero con riesgo de quedarse sin memoria al aumentar resolución, duración o número de fotogramas.
- ¿Cabe en GPU consumer? Sí en tarjetas de 24 GB o más, en el límite y probablemente requiriendo carga por etapas u offloading de módulos auxiliares; no se garantiza en tarjetas de 16 GB o menos.
- Opciones de despliegue: ComfyUI es el único entorno documentado, con una versión que soporte el formato MiniMax H3 pruned INT8 (ConvRot). No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni Diffusers, ni existencia de una versión GGUF.
- Latencia y throughput: no disponibles. Dependen de la GPU, de la resolución y de la duración del clip, parámetros que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / duración | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-DenoMix (este modelo) | Difusión R2V / image-text-to-video, merge | no disponible | no disponible | INT8 podado (ConvRot), fichero único de ~20,97 GB | MiniMax H3 Community License Agreement | HuggingFace, 0 descargas, 0 likes |
| MiniMaxAI/MiniMax-H3 | Difusión R2V, modelo base | no disponible | no disponible | no disponible en la información proporcionada | MiniMax H3 Community License Agreement | HuggingFace (referenciado como base) |
| WarmBloodAban/Minimax-h3_Singularity | Fine-tune de MiniMax H3 | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace (referenciado como base del merge) |
| Otros modelos R2V de código abierto de la misma categoría | Difusión de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación relevante es frente a sus dos antecesores: este modelo añade la fusión de Singularity y el empaquetado en un solo fichero INT8 podado, pero no publica métricas que permitan afirmar que supera al modelo base ni al fine-tune original.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, comparativas ni análisis de calidad frente al modelo base, de modo que la mejora atribuida al merge no está demostrada.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado y sin contraste por terceros.
- Cuantización con poda agresiva: la conversión a INT8 con poda y rotación ConvRot puede introducir pérdida de detalle fino, flicker temporal o degradación de la consistencia de identidad; el autor no cuantifica ese impacto.
- Dependencia de versión: requiere una build de ComfyUI que soporte el formato MiniMax H3 pruned INT8 (ConvRot); en versiones anteriores el fichero no cargará.
- Licencia restrictiva y encadenada: los pesos derivan del MiniMax H3 Community License Agreement, no de una licencia open source permisiva; es imprescindible revisar el texto de `LICENSE` y el `NOTICE` antes de cualquier uso comercial. El componente Singularity es Apache-2.0, pero la obra derivada queda sujeta a la licencia del modelo base.
- Falta de documentación técnica: no se publican parámetros, resolución, duración máxima, pasos de muestreo recomendados, CFG ni guía de prompting, lo que obliga a experimentar por prueba y error.
- Idioma: no se documenta el comportamiento con prompts en castellano ni en otros idiomas; conviene validar la adherencia al texto antes de usarlo en producción.
- Riesgo de uso indebido: al ser un modelo de referencia a vídeo, permite generar clips con la apariencia de personas reales a partir de imágenes; es necesario disponer de consentimiento y aplicar medidas de trazabilidad y marcado de contenido sintético.
- Sesgos: no documentados. Al no publicarse la composición del dataset de entrenamiento original ni del fine-tune, no es posible evaluar sesgos de representación demográficos o culturales.
- Artefactos propios de la difusión de vídeo: incoherencias temporales, deformaciones anatómicas y desviaciones del prompt son esperables; no debe tratarse la salida como fiel sin revisión humana.
- Sin soporte declarado para texto, código, matemáticas, tool calling ni agentes: cualquier expectativa en ese sentido es ajena a la naturaleza del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Deno2026/MiniMax-H3-DenoMix
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Fine-tune Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Licencia del modelo (relativa al repositorio): https://huggingface.co/Deno2026/MiniMax-H3-DenoMix/blob/main/LICENSE
- Aviso de modificaciones (relativo al repositorio): https://huggingface.co/Deno2026/MiniMax-H3-DenoMix/blob/main/NOTICE
- Licencia Apache-2.0 del componente Singularity (relativa al repositorio): https://huggingface.co/Deno2026/MiniMax-H3-DenoMix/blob/main/LICENSE-Singularity-Apache-2.0.txt
- Fichero de pesos: https://huggingface.co/Deno2026/MiniMax-H3-DenoMix/blob/main/MiniMax-H3_DenoMix_ref2va_pruned_int8_v3.safetensors
- ComfyUI (entorno de despliegue documentado): https://github.com/comfyanonymous/ComfyUI
- Paper, blog o demo oficiales del modelo: no disponible en la información proporcionada.
