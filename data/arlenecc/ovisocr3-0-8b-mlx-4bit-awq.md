# arlenecc/OvisOCR3-0.8B-MLX-4bit-awq

## Resumen

OvisOCR3-0.8B-MLX-4bit-awq es una conversión comunitaria del modelo OvisOCR3 de 0,8B de parámetros (852.985.920 exactos según los pesos en safetensors) al ecosistema MLX de Apple, cuantizado a 4 bits. El sufijo "awq" en el nombre sugiere una cuantización con Activation-aware Weight Quantization, aunque la model card no documenta el proceso de conversión ni confirma esta técnica. El modelo se distribuye bajo el pipeline `image-text-to-text`, lo que indica capacidades de visión y OCR orientadas a la extracción de texto a partir de imágenes.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño (menos de 1.000 millones de parámetros) pensado para ejecutarse en hardware Apple Silicon mediante MLX, con un tamaño de repositorio de solo 0,6 GB. Esto lo hace candidato para tareas de OCR y comprensión de documentos en local, sin dependencia de GPU dedicada ni de servicios en la nube. Sin embargo, la información publicada por el autor es mínima: no hay model card sustantiva, no se declara licencia, no hay benchmarks y el contador de descargas y likes es cero, lo que indica una publicación reciente (1 de noviembre de 2026) sin validación comunitaria.

La arquitectura declarada en los tags es `qwen3_5`, lo que apunta a una base derivada de la familia Qwen 3.5, aunque no se especifica el modelo exacto de origen ni el proceso de destilación o ajuste que da lugar a la variante OvisOCR3. El identificador de idioma es únicamente `en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 852.985.920 (≈0,85B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX); posible AWQ según el nombre, no confirmado en la model card |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería MLX) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna más allá del tag `qwen3_5`, que sugiere una base derivada de la familia Qwen 3.5. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje, pero no se especifica el tipo de proyector multimodal, la resolución de entrada de imagen, ni el número de tokens visuales por imagen.

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de tokens, la composición del dataset, si hubo etapas de ajuste supervisado, RLHF o DPO, ni el proceso de cuantización aplicado para pasar de los pesos originales a la versión 4-bit en MLX. La model card únicamente contiene metadatos de frontmatter (`language: en`, `library_name: mlx`, `pipeline_tag: image-text-to-text`, `tags: [mlx]`) sin texto descriptivo adicional. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, atención visual eficiente) sería especulativa y no se incluye.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text): el pipeline declarado indica entrada multimodal con imagen y salida de texto.
- OCR y extracción de texto: el nombre "OvisOCR3" sugiere especialización en reconocimiento óptico de caracteres, aunque no hay documentación que detalle el rendimiento o los formatos soportados.
- Conversación multi-turno: el tag `conversational` indica soporte de diálogo, presumiblemente con imágenes intercaladas.
- Procesamiento en local sobre Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de documentos en macOS: el modelo puede procesar imágenes de facturas, recibos o formularios y devolver el texto extraído, ejecutándose íntegramente en local mediante MLX sobre un Mac con Apple Silicon, sin enviar documentos sensibles a servicios externos.
- Extracción de texto en aplicaciones de accesibilidad: integrado en una app nativa de macOS o iOS, podría convertir capturas de pantalla o fotos en texto legible por VoiceOver, aprovechando el tamaño reducido del modelo (0,6 GB) para incluirlo en el bundle de la aplicación.
- Preprocesado de corpus para pipelines de NLP: uso como primer eslabón para convertir PDFs escaneados o imágenes en texto plano antes de pasarlo a un modelo mayor de razonamiento o búsqueda, reduciendo coste frente a APIs de OCR en la nube.
- Automatización de archivo y clasificación documental: combinado con reglas o un clasificador ligero, el modelo puede extraer campos clave (fechas, importes, nombres) de imágenes de documentos para alimentar un sistema de gestión documental interno.
- Prototipado rápido en investigación: al ser un modelo de menos de 1.000 millones de parámetros en 4 bits, permite iterar sobre experimentos de OCR multimodal en un portátil sin necesidad de GPU dedicada, útil para validar hipótesis antes de escalar a modelos mayores.
- Asistente de lectura de capturas en herramientas de desarrollo: integrado en un flujo de trabajo que recibe capturas de pantalla de terminales o paneles de error, el modelo podría transcribir el texto para que un agente lo analice, aunque su naturaleza conversacional y no confirmada para código limita su fiabilidad en este escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de una conversión MLX para Apple Silicon, no aplica VRAM de GPU dedicada; el modelo ocupa aproximadamente 0,6 GB en disco en cuantización 4-bit, y en memoria unificada se estima un consumo del orden de 0,5-1 GB incluyendo overhead de ejecución (estimación basada en el tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: no aplica en el sentido tradicional; requiere un chip Apple Silicon (serie M1 o posterior) con soporte de MLX.
- ¿Cabe en consumer GPU? El formato es MLX, específico de Apple; para GPUs NVIDIA o AMD sería necesario reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estándar), lo cual no está documentado.
- Opciones de despliegue: MLX (librería declarada); `mlx-lm` o `mlx-vlm` serían los runners plausibles para un modelo image-text-to-text, aunque no se confirma en la model card. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OvisOCR3-0.8B-MLX-4bit-awq | ≈0,85B | No disponible | No disponible | Safetensors MLX 4-bit | Conversión comunitaria, sin benchmarks ni validación |
| Qwen2.5-VL-3B | ≈3B | No disponible en esta ficha | Apache 2.0 (según familia Qwen) | Safetensors, GGUF | Mayor tamaño y ecosistema consolidado; referencia habitual en OCR multimodal |
| Florence-2-base | ≈0,23B | No disponible en esta ficha | MIT (según publicación original de Microsoft) | Safetensors | Modelo especializado en visión y OCR de tamaño comparable, con documentación pública extensa |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo analizado, por lo que no es posible establecer una comparación cuantitativa. Las alternativas citadas son referencias de la misma categoría (visión-lenguaje de tamaño pequeño para OCR), pero sus cifras exactas de contexto y licencia deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Información documental mínima: la model card no contiene descripción, instrucciones de uso ni ejemplos; no hay garantía de que el modelo funcione como se espera de un OCR.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo OvisOCR3 original antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede inventar texto que no aparece en la imagen, especialmente en documentos con baja resolución, tablas complejas o caligrafía.
- Cuantización agresiva: la conversión a 4 bits puede degradar la precisión de transcripción respecto a los pesos originales; no hay evaluación publicada del impacto.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que la conversión sea correcta ni de que los pesos estén completos.
- Dependencia de plataforma: el formato MLX limita su uso a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- Fecha de creación futura (2026-11-01): conviene verificar la integridad del repositorio y la identidad del autor antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/OvisOCR3-0.8B-MLX-4bit-awq
- Modelo base OvisOCR3: no disponible en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Documentación de MLX: no disponible en la información proporcionada
