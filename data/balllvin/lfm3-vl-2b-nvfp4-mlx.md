# balllvin/LFM3-VL-2B-NVFP4-MLX

## Resumen

LFM3-VL-2B-NVFP4-MLX es una conversión comunitaria del modelo multimodal LiquidAI/LFM3-VL-2B de Liquid AI, publicada por el usuario balllvin en Hugging Face. Se trata de una cuantización de 4 bits en formato NVFP4 empaquetada para MLX, el framework de Apple para ejecutar modelos de aprendizaje automático de forma nativa en chips de la serie M. El resultado es un checkpoint de aproximadamente 2,2 GB que permite ejecutar un modelo visión-lenguaje de unos 1.918 millones de parámetros en hardware Apple Silicon con un consumo de memoria muy contenido.

El modelo resuelve el problema de desplegar un VLM compacto en entornos locales sin GPU dedicada, manteniendo la tarea image-text-to-text del modelo original. La conversión preserva la arquitectura LFM3-VL del checkpoint base, pero sustituye los pesos en precisión completa por tensores cuantizados a 4 bits con esquema NVFP4, una variante de punto flotante de 4 bits que busca mejor fidelidad que la cuantización entera clásica en rangos dinámicos.

Es relevante ahora porque el ecosistema MLX está creciendo como vía para inferencia local en Mac, y las conversiones NVFP4 de modelos multimodales siguen siendo escasas. No obstante, conviene señalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, está marcado como acceso restringido (gated) y su licencia es la LFM1.0 del modelo original, no una licencia permisiva. Es, por tanto, un artefacto de nicho orientado a experimentación, no un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal visión-lenguaje, según modelo base) |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su identificador LFM3-VL y su pipeline image-text-to-text. Se trata, por tanto, de un modelo que combina un codificador visual con un decodificador de lenguaje para tareas de comprensión de imagen y texto, pero no se especifican en la ficha el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. Tampoco consta si hubo fases de RLHF o DPO.

Lo que sí es verificable es el proceso de conversión: el checkpoint original de Liquid AI se ha cuantizado a 4 bits con el esquema NVFP4 y se ha empaquetado en formato MLX. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en la implementación incluida en el repo y no solo en la librería MLX estándar. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), según el pipeline declarado.
- Conversación multi-turno, según el tag `conversational`.
- Comprensión de imágenes y respuesta en lenguaje natural, heredada del modelo base LFM3-VL-2B.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están listados.
- Capacidades especiales (thinking mode, audio, visión avanzada): no disponible más allá de la entrada de imagen.

## Casos de uso

- Prototipado local de asistentes visuales en Mac: el modelo cabe en 2,2 GB y se ejecuta con MLX en Apple Silicon, lo que permite iterar sobre prompts y flujos de imagen-texto sin depender de servicios en la nube.
- Descripción automática de imágenes en un pipeline personal: útil para etiquetar capturas, diagramas o fotos en un flujo de trabajo local donde la privacidad del contenido es prioritaria.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, puede emplearse para responder preguntas sobre capturas o páginas renderizadas, siempre que la calidad del modelo base lo permita.
- Pruebas de concepto de VLM en edge computing: su tamaño reducido y su cuantización de 4 bits lo hacen adecuado para validar arquitecturas de despliegue en dispositivos con memoria unificada limitada.
- Evaluación comparativa de esquemas de cuantización: sirve como artefacto para medir la degradación de NVFP4 frente a otros formatos en tareas visión-lenguaje, dado que el modelo base está disponible por separado.
- Integración en aplicaciones macOS nativas: al usar MLX, puede embeberse en apps de escritorio para Mac que necesiten inferencia multimodal sin GPU externa.
- Docencia y experimentación académica: su licencia LFM1.0 y su acceso restringido condicionan el uso, pero para investigación interna es un ejemplo práctico de conversión multimodal a MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 2,2 GB; en memoria unificada de Apple Silicon se necesita espacio adicional para activaciones y caché KV, por lo que conviene reservar varios GB libres.
- GPU recomendadas: no aplica GPU CUDA; el formato MLX está pensado para chips Apple M1, M2, M3 y M4 (con memoria unificada).
- ¿Cabe en consumer GPU? No en el sentido tradicional: no es un checkpoint para CUDA. En Apple Silicon, sí cabe en equipos con 8 GB o más de memoria unificada, aunque el margen depende de la longitud de contexto y del tamaño de imagen.
- Opciones de despliegue: MLX (librería `mlx`), con código personalizado incluido en el repo. No consta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-NVFP4-MLX (este) | 1.918.181.888 | no disponible | safetensors MLX 4-bit | LFM1.0 | Gated, 0 descargas |
| LiquidAI/LFM3-VL-2B (base) | ~2B | no disponible | safetensors | LFM1.0 | Público en HF |
| Otros VLM ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el checkpoint original de Liquid AI, del que este repositorio es una conversión. Frente a él, la versión NVFP4-MLX reduce el peso a 2,2 GB y habilita ejecución en Apple Silicon, a costa de una posible pérdida de precisión no cuantificada en la información disponible. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está marcado como gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia LFM1.0: no es una licencia permisiva; conviene revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de que la conversión funcione correctamente.
- Código personalizado: el tag `custom_code` implica que la carga depende de implementación incluida en el repo, con el riesgo de seguridad y mantenimiento asociado.
- Riesgo de degradación por cuantización: NVFP4 a 4 bits puede afectar a la calidad en tareas visuales finas; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Contexto no documentado: se desconoce la ventana máxima, lo que limita la planificación de casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos para este checkpoint.
- Sesgos: no documentados en la información disponible.
- Idoneidad para producción: baja, dado el carácter comunitario, la falta de benchmarks y el acceso restringido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/LFM3-VL-2B-NVFP4-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Documentación de MLX: no disponible en la información proporcionada
- Paper o blog de Liquid AI sobre LFM3-VL: no disponible en la información proporcionada
