# jrcrittenden/qwen3-vl-8b-instruct-heretic

## Resumen

`jrcrittenden/qwen3-vl-8b-instruct-heretic` es una versión "decensored" del modelo multimodal Qwen3-VL-8B-Instruct, obtenida aplicando la herramienta Heretic v2.0.0.dev0 mediante una técnica de ablación ortogonal denominada MPOA (Magnitude-Preserving Orthogonal Ablation). El objetivo declarado es reducir la tasa de rechazos del modelo original sin reentrenar, modificando direcciones concretas en las proyecciones de atención (`attn.o_proj`) y del MLP (`mlp.down_proj`) capa por capa.

El modelo conserva la arquitectura completa de Qwen3-VL-8B-Instruct: un decodificador de texto denso de 8.767.123.696 parámetros combinado con un codificador visual ViT, con una ventana de contexto nativa de 256K tokens ampliable hasta 1M. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors (17,6 GB de repositorio), lo que corresponde a precisión bf16.

Su relevancia es acotada pero específica: cubre un nicho de modelos multimodales con rechazos reducidos, útil para investigación sobre alineación, evaluación de mecanismos de seguridad y casos donde el filtrado excesivo del modelo base resulta limitante. No obstante, la propia model card indica una reducción modesta de rechazos (de 100/100 a 94/100) y el repositorio presenta una adopción muy baja (20 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (decodificador de texto Qwen3 + codificador visual ViT), según la familia Qwen3-VL |
| Parametros totales | 8.767.123.696 (8,77B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 256K tokens nativa, ampliable a 1M (según la model card del modelo base) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (bf16); no se listan cuantizaciones oficiales |
| Idiomas soportados | No disponible en los metadatos. El modelo base Qwen3-VL-Instruct es multilingüe y su OCR cubre 32 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (library: transformers) |

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo desde cero: parte de los pesos de `Qwen/Qwen3-VL-8B-Instruct` y aplica una edición de pesos post-entrenamiento con Heretic v2.0.0.dev0 usando MPOA. Según los parámetros publicados, la intervención se aplica con dirección por capa (`direction_index: per layer`) y pesos escalados por posición: en `attn.o_proj` los pesos van de 0,53 a 0,83 con posición máxima en la capa 28,15 y distancia mínima de 2,43; en `mlp.down_proj` van de 0,09 a 0,58 con posición máxima en la capa 22,22 y distancia mínima de 6,37. Se trata, por tanto, de una ablación selectiva de direcciones en el espacio de activaciones, no de un ajuste fino con datos.

La arquitectura subyacente corresponde a Qwen3-VL, que introduce tres innovaciones respecto a generaciones anteriores: Interleaved-MRoPE (asignación de frecuencias completas sobre tiempo, anchura y altura para razonamiento de vídeo de horizonte largo), DeepStack (fusión de características ViT multinivel para alineación imagen-texto fina) y alineación texto-marca temporal (Text-Timestamp Alignment) para localización precisa de eventos en vídeo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la información proporcionada.

## Capacidades

- Generación de texto e imagen-texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y conversación multiturno con entrada mixta.
- Razonamiento multimodal en STEM y matemáticas: análisis causal y respuestas basadas en evidencia visual, según la model card del base.
- Comprensión de vídeo: manejo de vídeos de varias horas con recuperación completa e indexación a nivel de segundo, gracias a la ventana de 256K ampliable a 1M.
- Percepción espacial avanzada: juicio de posiciones de objetos, puntos de vista y oclusiones, con grounding 2D y 3D para razonamiento espacial y IA encarnada.
- OCR ampliado: 32 idiomas, robusto en condiciones de poca luz, desenfoque e inclinación, con mejor manejo de caracteres raros o antiguos y análisis de estructura de documentos largos.
- Agente visual: operación de interfaces gráficas de PC y móvil, reconocimiento de elementos, comprensión de sus funciones e invocación de herramientas.
- Codificación visual: generación de Draw.io, HTML, CSS y JavaScript a partir de imágenes o vídeos.
- Reducción de rechazos: la modificación MPOA rebaja la tasa de rechazos de 100/100 a 94/100 en la evaluación de Heretic incluida en la model card.
- Soporte de tool calling, function calling y razonamiento multi-paso: heredado de Qwen3-VL-Instruct, aunque no se documenta explícitamente en este repositorio.
- Capacidades multilingües: no verificadas en este repositorio; el modelo base es multilingüe y su OCR cubre 32 idiomas.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo original y de esta variante ante el mismo conjunto de prompts permite medir el efecto real de una ablación ortogonal sobre el comportamiento de rechazo, con una divergencia KL reportada de 0,0102.
- Análisis de documentos escaneados: el OCR de 32 idiomas y el parseo de estructura de documentos largos permiten extraer tablas, cabeceras y texto de facturas o informes, aprovechando la ventana de 256K para procesar documentos completos sin trocear.
- Automatización de interfaces gráficas: como agente visual, el modelo puede identificar botones, campos y menús en capturas de pantalla y emitir acciones, integrándose en flujos de automatización de pruebas o RPA.
- Generación de interfaz a partir de bocetos: convertir wireframes o capturas en HTML/CSS/JS o diagramas Draw.io, útil en prototipado rápido.
- Descripción y accesibilidad de vídeo: indexación temporal a nivel de segundo para generar subtítulos, resúmenes o descripciones de contenido audiovisual largo.
- Revisión de documentación técnica con imágenes: interpretar diagramas de arquitectura, esquemas eléctricos o capturas de errores junto al texto asociado en un único contexto.
- Asistencia en tareas de razonamiento visual: resolución de problemas de geometría, gráficos o tablas donde hay que combinar lectura de imagen y cálculo.
- Despliegue en entornos con filtrado restrictivo: escenarios de investigación donde los rechazos del modelo base interrumpen tareas legítimas de análisis, asumiendo las advertencias de la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. La model card únicamente incluye la evaluación propia de la herramienta Heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 94/100 | 100/100 |
| Divergencia KL | 0,0102 | 0 (por definición) |

La model card del modelo base referencia gráficas de rendimiento multimodal y de texto puro, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- Pesos en bf16: 8,767.123.696 parámetros a 2 bytes por parámetro equivalen a aproximadamente 17,5 GB, coherente con el tamaño de repositorio de 17,6 GB.
- VRAM estimada en bf16: del orden de 20-22 GB contando pesos, activaciones y caché KV con contexto moderado. El coste de la caché KV a 256K tokens no está disponible.
- GPU recomendadas para bf16: A100 40GB, H100 80GB, L40S 48GB. En RTX 4090 o RTX 3090 (24 GB) el modelo cabe con margen muy ajustado y contexto limitado.
- Cabe en GPU de consumo: sí, en GPU de 24 GB en bf16 con contexto reducido, y con más holgura si se generan cuantizaciones de 8 o 4 bits (aproximadamente 9 GB y 5 GB respectivamente, estimación derivada del tamaño de los pesos).
- Opciones de despliegue: la librería declarada es `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor`, recomendándose `flash_attention_2` para escenarios multi-imagen y vídeo. La disponibilidad de vLLM, llama.cpp, Ollama o TGI para este repositorio concreto: no disponible.
- Latencia y throughput: no disponible.
- Nota de versiones: la model card indica instalar `transformers` desde el repositorio de GitHub, ya que se requiere soporte de Qwen3-VL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| jrcrittenden/qwen3-vl-8b-instruct-heretic | 8,77B | 256K (ampliable a 1M) | Apache 2.0 | safetensors | Modificación post-entrenamiento con MPOA; rechazos 94/100 |
| Qwen/Qwen3-VL-8B-Instruct | 8,77B | 256K (ampliable a 1M) | Apache 2.0 | safetensors | Modelo original sin modificar; rechazos 100/100 |
| Qwen2.5-VL-7B-Instruct | No disponible en la información proporcionada | No disponible en la información proporcionada | Apache 2.0 (según la familia Qwen) | safetensors | Generación anterior de la familia, referenciada en los tags del repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Reducción de rechazos muy limitada: la evaluación de Heretic pasa de 100/100 a 94/100 rechazos. Solo 6 de cada 100 prompts del conjunto de prueba dejan de ser rechazados, por lo que el efecto de la ablación es leve y puede no satisfacer expectativas de "decensurado" completo.
- Riesgo de degradación de capacidades: aunque la divergencia KL reportada es baja (0,0102), cualquier ablación de direcciones en atención y MLP puede afectar a la coherencia, el razonamiento o la calidad de las respuestas. No hay benchmarks de capacidades publicados para esta variante que confirmen que se mantienen intactas.
- Alucinación: es un riesgo intrínseco de los modelos de lenguaje y visión-lenguaje; al ser una edición de pesos sin evaluación adicional, no hay evidencia de que este riesgo se haya reducido.
- Sin evaluación de sesgos ni de seguridad: el repositorio no incluye ninguna evaluación de sesgos, toxicidad o comportamiento en dominios sensibles más allá del recuento de rechazos.
- Idiomas: los metadatos no declaran idiomas soportados. El comportamiento en castellano no está verificado para esta variante, aunque el modelo base es multilingüe.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable del contenido generado por un modelo con rechazos reducidos. Conviene revisar las condiciones de la herramienta Heretic y del modelo base.
- Adopción muy baja: 20 descargas y 0 likes en el momento de la consulta, sin issues ni validación comunitaria documentada.
- Reproducibilidad: la model card documenta los parámetros de MPOA, pero no incluye semillas, conjunto de evaluación detallado ni scripts de reproducción en la información disponible.
- Integración: requiere una versión de `transformers` con soporte Qwen3-VL; versiones estables anteriores pueden no cargar el modelo. La compatibilidad con servidores de inferencia de alto rendimiento no está confirmada para este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jrcrittenden/qwen3-vl-8b-instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Heretic (herramienta de decensurado): https://heretic-project.org
- Chat de Qwen: https://chat.qwenlm.ai/
- Referencias arXiv incluidas en los tags del repositorio:
  - https://arxiv.org/abs/2505.09388
  - https://arxiv.org/abs/2502.13923
  - https://arxiv.org/abs/2409.12191
  - https://arxiv.org/abs/2308.12966
- Repositorio de Transformers (requerido en versión con soporte Qwen3-VL): https://github.com/huggingface/transformers
