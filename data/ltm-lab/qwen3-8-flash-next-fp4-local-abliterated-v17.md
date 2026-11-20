# LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v17

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Abliterated-v17 es un modelo multimodal de tipo image-text-to-text publicado por LTM-Lab, un laboratorio independiente, como una revisión de la versión V16 de su propia familia "Qwen3.8-Flash-Next". El checkpoint conserva los pesos, tokenizador y recursos del modelo fuente V16 y añade una capa de comportamiento orientada a memoria episódica persistente, procedimientos respaldados por evidencia y previsión temporal de eventos en tiempo de inferencia. Se distribuye en formato safetensors de 8 bits bajo la licencia nvidia-open-model-agreement, con un total de 187.931.804.131 parámetros y un repositorio de 102,3 GB.

El modelo se presenta como un transformer multimodal con soporte de texto e imagen, cargable mediante `AutoModelForImageTextToText` con `trust_remote_code=True`, lo que indica la presencia de código personalizado en el repositorio. La nomenclatura del identificador sugiere una cuantización FP4/FP8 orientada a despliegue local, aunque la model card no detalla el esquema exacto de cuantización más allá de la etiqueta "8-bit" y "modelopt".

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo derivado y experimental, con cero descargas y cero interacciones en el momento de la consulta, sin benchmarks publicados ni documentación técnica sobre datos de entrenamiento. Su interés radica en la propuesta de memoria episódica persistente en inferencia, un patrón poco habitual en modelos abiertos, y en su licencia de origen NVIDIA, que condiciona fuertemente el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parámetros totales | 187.931.804.131 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (etiquetas "8-bit" y "modelopt"); se desconoce si existen otros formatos publicados |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura interna. El pipeline declarado es image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje, pero no se especifican dimensiones de capas, número de cabezas, tipo de atención ni si emplea mezcla de expertos. El tamaño de 187.931.804.131 parámetros y el repositorio de 102,3 GB son compatibles con un modelo denso de gran escala cuantizado a 8 bits, aunque no se puede confirmar sin la configuración del modelo.

Respecto al entrenamiento, la model card no documenta número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) ni proceso de destilación. La única información técnica relevante es que V17 "retiene los pesos, tokenizador y recursos" de V16, es decir, no hay un reentrenamiento de los pesos base: la revisión se centra en el comportamiento en inferencia. Las capacidades añadidas declaradas son memoria episódica persistente en "FORMAT 8", procedimientos respaldados por evidencia y previsión temporal de eventos. No se detalla cómo se implementan estos mecanismos ni si requieren prompts específicos, herramientas externas o un estado de sesión gestionado por el código personalizado del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational".
- Procesamiento conjunto de imagen y texto (image-text-to-text): descripción, respuesta a preguntas sobre imágenes y tareas derivadas.
- Memoria episódica persistente en inferencia (FORMAT 8), orientada a mantener estado entre interacciones.
- Procedimientos respaldados por evidencia: la model card indica soporte para procedimientos fundamentados en evidencia, sin especificar el mecanismo.
- Previsión temporal de eventos en tiempo de inferencia.
- Carga mediante `AutoModelForImageTextToText` con `trust_remote_code=True`, lo que implica dependencia de código del autor.
- Soporte de tool calling, function calling, agentes o modo de razonamiento explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes conversacionales con estado: la memoria episódica declarada permitiría mantener contexto de sesiones anteriores en un asistente de atención al cliente, aunque la ausencia de especificaciones sobre el formato de almacenamiento obliga a validar el comportamiento empíricamente antes de producción.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede emplearse para extraer información de capturas, diagramas o formularios combinados con texto, integrándolo en pipelines de digitalización documental.
- Previsión de eventos con series temporales textualizadas: la capacidad declarada de event-time forecasting permitiría prototipar sistemas de alerta temprana a partir de descripciones textuales de eventos, siempre que se valide la calidad de las predicciones.
- Investigación sobre memoria en modelos: útil como banco de pruebas para estudiar cómo afecta la memoria episódica persistente a la coherencia multi-turno y a la latencia, dado su carácter experimental.
- Generación de procedimientos auditables: en entornos donde se requiere trazabilidad, la orientación a "procedimientos respaldados por evidencia" puede servir para generar guías paso a paso con referencias, previa verificación de que el modelo realmente cita fuentes.
- Prototipado local en hardware de gama alta: con pesos de 8 bits y 102,3 GB, es viable en estaciones de trabajo con varias GPU para experimentación interna, no así en equipos de consumo.
- Evaluación comparativa de cuantizaciones: al estar etiquetado como FP4/8-bit y modelopt, puede usarse para medir la degradación de calidad frente al checkpoint sin cuantizar de origen, si estuviera disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 187,9 mil millones de parámetros en 8 bits, el peso ronda los 94 GB solo en parámetros, a lo que hay que sumar caché KV, activaciones y overhead del runtime; un despliegue realista requiere del orden de 110-130 GB de VRAM, aunque la cifra exacta no está publicada.
- GPU recomendadas: configuraciones multi-GPU con A100 80 GB (2 unidades como mínimo), H100 80 GB o H200; no es viable en una única GPU de 80 GB sin paralelismo de tensor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090; sería necesario un esquema de offloading a RAM/SSD con penalización severa de latencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint y requerirían validación por el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP4-Local-Abliterated-v17 | 187,9 B | no disponible | nvidia-open-model-agreement | Sí (imagen-texto) | Hugging Face, 0 descargas |
| LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16 | no disponible | no disponible | no disponible | Sí (según pipeline heredado) | Hugging Face (modelo base) |
| Alternativas de la misma categoría (p. ej. Qwen2.5-VL, Llama 3.2 Vision) | no comparable directamente | no disponible | licencias propias de cada familia | Sí | Hugging Face |

La comparación con modelos de otras familias no es fiable porque no se dispone de especificaciones de contexto, benchmarks ni datos de entrenamiento de este checkpoint. La única comparación defendible es con su predecesor V16, del que hereda pesos y tokenizador.

## Limitaciones y advertencias

- Licencia nvidia-open-model-agreement: impone condiciones específicas de uso, redistribución y atribución; es imprescindible revisar el texto de la licencia antes de cualquier uso comercial.
- Modelo derivado y experimental: se trata de una revisión de un checkpoint previo de un laboratorio independiente, con cero descargas y cero validación comunitaria en el momento de la consulta.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: sin datos de alineación ni evaluaciones, no se puede acotar; las capacidades de "procedimientos respaldados por evidencia" y "previsión de eventos" son especialmente sensibles a fabricación de referencias y predicciones.
- Dependencia de `trust_remote_code=True`: ejecutar código del autor implica un riesgo de seguridad que debe mitigarse en un entorno aislado.
- Idiomas y contexto no documentados: no se puede garantizar cobertura del castellano ni una ventana de contexto concreta.
- Nombre del checkpoint ("Abliterated") sugiere modificaciones de comportamiento no documentadas; no hay información sobre qué se ha alterado respecto al modelo original.
- Huella de hardware elevada: 102,3 GB de repositorio y ~94 GB de pesos en 8 bits limitan el despliegue a infraestructura de gama alta.
- Sin garantías de mantenimiento: la actualización del repositorio fue inmediata a la creación, sin historial posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v17
- Modelo base V16: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16
- Revisión concreta del checkpoint V16 referenciada en la model card: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16/tree/ed803ba8cc0eab0dea471a386fd2db97595f0b90
- Licencia NVIDIA Open Model Agreement: referencia incluida en el archivo LICENSE del repositorio (no se dispone de URL directa en la información proporcionada).
