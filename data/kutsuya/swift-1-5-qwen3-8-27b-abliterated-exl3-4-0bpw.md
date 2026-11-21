# Kutsuya/Swift-1.5-Qwen3.8-27B-Abliterated-EXL3-4.0bpw

## Resumen

Swift-1.5-Qwen3.8-27B-Abliterated-EXL3-4.0bpw es una cuantización en formato EXL3 (ExLlamaV3) a 4,0 bits por peso del modelo grimlee/Swift-1.5-Qwen3.8-27B-Abliterated, publicada por el usuario Kutsuya en Hugging Face. El repositorio contiene únicamente los pesos cuantizados en safetensors y no incluye model card técnica más allá de una nota de una línea indicando el proceso de cuantización. El modelo base es, por el nombre, un derivado de la familia Qwen3 con 27B de parámetros nominales y una intervención de tipo "abliteration" (eliminación o atenuación de direcciones de rechazo en el espacio de activaciones).

El dato más relevante y a la vez contradictorio es el recuento real de parámetros en los safetensors: 8.254.592.384 (aproximadamente 8,25B), muy por debajo de los 27B que sugiere el nombre. Esto puede deberse a que el nombre conserva la etiqueta del modelo base original mientras que los tensores publicados corresponden a un modelo destilado, podado o a una denominación comercial no alineada con el recuento real. Cualquier evaluación de despliegue debe partir del recuento real de safetensors, no del nombre.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización EXL3 de 4,0 bpw pensada para inferencia eficiente con ExLlamaV3; por otro, advierte de la opacidad del linaje (modelo base "abliterated" sin model card pública verificable en la información disponible) y de la ausencia de licencia, idiomas y benchmarks declarados, lo que limita su uso en producción sin una validación previa por parte del equipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en los tags; presumiblemente transformer decoder-only de la familia Qwen3, sin confirmar) |
| Parámetros totales | 8.254.592.384 según safetensors (el nombre indica 27B; discrepancia no resuelta) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 4,0 bits por peso (4-bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (EXL3, para ExLlamaV3) |
| Tamaño del repositorio | 16,5 GB |
| Modelo base | grimlee/Swift-1.5-Qwen3.8-27B-Abliterated |
| Herramienta de cuantización | ExLlamaV3 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo base. Los tags del repositorio incluyen `qwen3_5`, lo que apunta a una arquitectura de la familia Qwen3, y el nombre del modelo base incorpora "Abliterated", término que en la comunidad designa modelos a los que se ha aplicado una técnica de edición de pesos para reducir la tendencia a rechazar peticiones (eliminación de direcciones de activación asociadas a comportamientos de rechazo). No hay documentación pública en la información proporcionada que detalle qué método concreto se aplicó, con qué datos ni con qué evaluación.

La única innovación técnica documentada es la cuantización: EXL3 a 4,0 bpw generada con ExLlamaV3. EXL3 es el formato de cuantización de ExLlamaV3, orientado a inferencia de alta velocidad en GPUs consumer y de centro de datos, con kernels optimizados para pesos de 4 bits. No se especifican el grupo de cuantización, el calibrado ni los parámetros exactos del quant config.

## Capacidades

- Generación de texto autoregresiva: capacidad presumible por tratarse de un modelo de la familia Qwen3, aunque no verificada en la información disponible.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni model card que lo documente).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible.
- Efecto de la abliteration: se espera una menor tasa de rechazos ante peticiones que el modelo base rechazaría, pero no hay evaluación publicada que lo cuantifique.

## Casos de uso

- Investigación sobre abliteration: el modelo permite estudiar empíricamente cómo la eliminación de direcciones de rechazo afecta a la tasa de negativas y a la calidad general, comparando contra el modelo base sin cuantizar. Adecuado por ser un artefacto derivado con la intervención aplicada.
- Evaluación de cuantización EXL3 a 4,0 bpw: sirve para medir la degradación de perplejidad y de calidad de generación frente al modelo en precisión completa, dentro de un pipeline de ExLlamaV3.
- Despliegue en GPUs consumer: con 16,5 GB de pesos en el repositorio, es candidato a ejecutarse en tarjetas de 24 GB (RTX 3090, 4090) dejando margen para caché KV, siempre que se confirme el contexto real soportado.
- Generación de texto sin filtros editoriales: en entornos de investigación creativa o de simulación donde se requiere baja tasa de rechazo, con revisión humana obligatoria por la ausencia de garantías de seguridad.
- Prototipado rápido de asistentes conversacionales: útil para validar prompts y flujos antes de migrar a un modelo con licencia y model card completas.
- Benchmarking interno de inferencia: comparar throughput y latencia de EXL3 frente a GGUF o GPTQ sobre el mismo modelo base en el hardware del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB solo para pesos; con caché KV y overhead de ExLlamaV3, se recomienda un mínimo de 20-24 GB para contextos moderados.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para uso individual; A100 40/80 GB, H100 o L40S para despliegue con contexto largo o concurrencia.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3090, RTX 4090 y GPUs de 24 GB o más; en tarjetas de 16 GB no cabría con margen para caché KV.
- Opciones de despliegue: ExLlamaV3 es el runtime nativo del formato EXL3. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Abliterated-EXL3-4.0bpw (este) | 8,25B reales (nombre indica 27B) | no disponible | EXL3 4,0 bpw | no disponible | Hugging Face, 0 descargas |
| grimlee/Swift-1.5-Qwen3.8-27B-Abliterated (base) | no disponible | no disponible | safetensors sin cuantizar | no disponible | Hugging Face |
| Qwen3 oficial (familia) | varía por tamaño | varía por tamaño | safetensors, GGUF, AWQ | Apache 2.0 en la mayoría de variantes | Hugging Face, ampliamente desplegado |

La comparación con alternativas de la misma categoría (modelos de ~8B cuantizados a 4 bits) no puede completarse con datos verificables en la información disponible, dado que no se declaran benchmarks ni contexto.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre (27B) y el recuento real de parámetros (8,25B): planificar el hardware y las expectativas a partir del recuento de safetensors.
- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o con el autor del modelo base antes de cualquier despliegue productivo.
- Modelo "abliterated": la reducción de rechazos implica mayor probabilidad de generar contenido dañino, sesgado o inexacto; requiere filtros y revisión humana en cualquier aplicación expuesta a usuarios.
- Sin model card técnica, sin idiomas declarados y sin benchmarks: no hay evidencia publicada de calidad, sesgos ni cobertura lingüística.
- Riesgo de alucinación: no cuantificado, pero inherente a modelos de esta familia y agravado por la falta de evaluación.
- Formato EXL3 propietario del ecosistema ExLlamaV3: no portable a otros runtimes sin reconversión; limita las opciones de despliegue y el soporte de herramientas.
- Linaje opaco: el modelo base grimlee/Swift-1.5-Qwen3.8-27B-Abliterated no dispone de documentación verificable en la información proporcionada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.

## Enlaces

- [Hugging Face: Kutsuya/Swift-1.5-Qwen3.8-27B-Abliterated-EXL3-4.0bpw](https://huggingface.co/Kutsuya/Swift-1.5-Qwen3.8-27B-Abliterated-EXL3-4.0bpw)
- [Modelo base: grimlee/Swift-1.5-Qwen3.8-27B-Abliterated](https://huggingface.co/grimlee/Swift-1.5-Qwen3.8-27B-Abliterated)
- ExLlamaV3 (repositorio del runtime): no disponible en la información proporcionada.
