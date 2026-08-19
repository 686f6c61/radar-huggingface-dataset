# openbmb/MiniCPM-V-4.6-Thinking-AWQ

## Resumen

MiniCPM-V 4.6 Thinking es un modelo de lenguaje multimodal (MLLM) desarrollado por OpenBMB, diseñado para ejecutarse de forma eficiente en dispositivos de borde como teléfonos móviles. Esta variante específica, `openbmb/MiniCPM-V-4.6-Thinking-AWQ`, es la versión cuantizada con AWQ (W4A16) del modelo base `openbmb/MiniCPM-V-4.6-Thinking`, que incorpora un modo de razonamiento de cadena de pensamiento larga (long chain-of-thought) antes de emitir la respuesta final. El modelo combina un encoder visual SigLIP2-400M con un LLM Qwen3.5-0.8B, sumando aproximadamente 1.300 millones de parámetros en total.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento multimodal avanzado (imagen y vídeo) con un tamaño extremadamente compacto, lo que permite su despliegue en hardware de consumo y plataformas móviles (iOS, Android y HarmonyOS) sin sacrificar rendimiento. La cuantización AWQ a 4 bits reduce el peso a aproximadamente 1,9 GB, facilitando su uso en entornos con memoria limitada. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual SigLIP2-400M + LLM Qwen3.5-0.8B (transformer multimodal) |
| Parametros totales | 1.300.428.016 (~1,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal ligera compuesta por un encoder visual SigLIP2 de 400 millones de parámetros y un modelo de lenguaje Qwen3.5 de 800 millones de parámetros. Incorpora un mecanismo de compresión de tokens visuales mixto (4x y 16x) que reduce la carga computacional al procesar imágenes y vídeos, manteniendo un equilibrio entre detalle y eficiencia. La variante Thinking genera una traza de razonamiento explícita antes de la respuesta final, lo que mejora el rendimiento en tareas complejas de razonamiento multimodal, matemáticas y OCR.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). La model card menciona que la cuantización AWQ se realizó con AutoAWQ sobre los pesos BF16 del modelo base, pero no se especifican los datos de entrenamiento del modelo original.

## Capacidades

- Comprensión de imágenes y vídeo: procesa entradas visuales estáticas y secuencias de vídeo, con soporte para múltiples imágenes por conversación.
- Razonamiento de cadena de pensamiento: genera un razonamiento explícito antes de la respuesta final, mejorando la precisión en tareas complejas de matemáticas, lógica y OCR.
- OCR y comprensión de documentos: capaz de extraer y razonar sobre texto en imágenes, incluyendo escritura manuscrita y capturas de pantalla.
- Conversación multimodal multi-turno: mantiene contexto conversacional combinando imágenes y texto en interacciones largas.
- Despliegue en dispositivos de borde: optimizado para ejecutarse en iOS, Android y HarmonyOS con código de adaptación de borde de código abierto.
- Eficiencia de inferencia: alcanza aproximadamente 1,5 veces el throughput de tokens en comparación con Qwen3.5-0.8B, según el repositorio oficial.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir escenas, leer textos de carteles o etiquetas y responder preguntas sobre el entorno en tiempo real desde un teléfono móvil, gracias a su bajo consumo de memoria y su capacidad OCR.
- Atención al cliente automatizada con soporte visual: integrado en plataformas de mensajería, puede analizar capturas de pantalla de errores, facturas o productos enviados por el usuario y proporcionar soluciones paso a paso mediante razonamiento multi-turno.
- Análisis de documentos en dispositivos móviles: escanear recibos, formularios o tarjetas de visita y extraer datos estructurados (nombres, fechas, importes) con razonamiento contextual, útil para aplicaciones de contabilidad personal o gestión de gastos.
- Educación interactiva: como tutor de matemáticas o ciencias que recibe fotografías de problemas escritos a mano y guía al estudiante con explicaciones razonadas, aprovechando el modo Thinking para desglosar el proceso de resolución.
- Moderación de contenido visual en redes sociales: clasificar imágenes y vídeos subidos por usuarios para detectar contenido inapropiado o engañoso, combinando comprensión visual y razonamiento textual en un pipeline de baja latencia.
- Asistente de compras con comparación visual: el usuario fotografía un producto y el modelo identifica características, compara precios o sugiere alternativas basándose en el contexto de la conversación, todo ello ejecutándose localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye referencias a gráficos de evaluación (thinking.png e instruct.png) y a métricas de eficiencia (throughput y TTFT), pero no se proporcionan valores numéricos en el texto. No se dispone de datos comparativos cuantitativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados a 4 bits ocupan aproximadamente 1,9 GB (tamaño del repositorio), por lo que se estima un consumo de VRAM inferior a 4 GB incluyendo overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores. También compatible con Apple Silicon (M1/M2/M3) mediante Metal.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de tarjetas gráficas de consumo actuales y en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: transformers (con Flash Attention 2 recomendado), vLLM (existe receta oficial), llama.cpp, Ollama y LM Studio según la model card. También se menciona despliegue nativo en iOS, Android y HarmonyOS.
- Latencia y throughput: no se proporcionan valores numéricos en la información disponible. El repositorio indica que alcanza ~1,5x el throughput de tokens de Qwen3.5-0.8B, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking (AWQ) | ~1,3 B | no disponible | AWQ 4-bit | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible | no disponible | Hugging Face |
| Gemma4-E2B-it | ~2 B (estimado) | no disponible | no disponible | no disponible | Hugging Face |

Según el repositorio oficial de OpenBMB, MiniCPM-V 4.6 (incluida la variante Thinking) supera a Gemma4-E2B-it en rendimiento y es más eficiente que Qwen3.5-0.8B en términos de throughput de tokens. Sin embargo, no se aportan cifras concretas de benchmarks en la información disponible. Los tres modelos son de tamaño pequeño y aptos para despliegue en dispositivos de borde, pero MiniCPM-V 4.6 Thinking añade capacidades multimodales (imagen y vídeo) que los otros dos no poseen de forma nativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 1,3 B de parámetros, puede presentar alucinaciones visuales o razonamientos incorrectos en escenarios complejos o con imágenes ambiguas. No se han publicado evaluaciones específicas de sesgos.
- Limitaciones de idioma: no se ha especificado la lista de idiomas soportados. El modelo está entrenado principalmente con datos en inglés y chino, por lo que su rendimiento en otros idiomas puede ser inferior.
- Longitud de contexto limitada: al ser un modelo pequeño, la ventana de contexto es probablemente reducida (no se ha publicado el valor exacto), lo que puede limitar conversaciones muy largas o el procesamiento de documentos extensos.
- Dependencia de torchcodec para vídeo: la decodificación de vídeo requiere torchcodec, que puede presentar problemas de compatibilidad con ciertas versiones de CUDA. Se recomienda usar PyAV como alternativa.
- Modo Thinking no configurable: a diferencia de versiones anteriores (como v4.5), el modo de razonamiento no se puede activar o desactivar en tiempo de ejecución; la variante Thinking siempre genera una traza de razonamiento, lo que puede aumentar la latencia en tareas simples.
- Cuantización AWQ: aunque reduce el tamaño a 1,9 GB, la cuantización a 4 bits puede provocar una ligera degradación de precisión en comparación con los pesos BF16 originales, especialmente en tareas de razonamiento numérico o OCR fino.

## Enlaces

- Modelo en Hugging Face (AWQ): https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-AWQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Modelo instruct (sin Thinking): https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-V
- Receta vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Documentación de API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-AWQ-Demo
- Papers asociados (según tags): arxiv:2604.27393, arxiv:2509.18154, arxiv:2408.01800, arxiv:2605.08985
