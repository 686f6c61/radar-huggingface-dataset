# GUIAgentt/sft3m_owrlen_luna_preview_norepeat_human_3ep

## Resumen

El modelo `sft3m_owrlen_luna_preview_norepeat_human_3ep` es un ajuste fino (fine-tune) supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario GUIAgentt en Hugging Face. Su identificador y sus etiquetas (`gui-agent`, `web-agent`) indican que está orientado a tareas de agente de interfaz gráfica y de navegación web, es decir, a interpretar pantallas y ejecutar acciones sobre entornos interactivos. No se trata de un modelo de propósito general publicado por un laboratorio, sino de un checkpoint experimental de un proyecto de investigación o desarrollo de agentes.

El checkpoint cuenta con aproximadamente 5.175 millones de parámetros reales según los pesos en safetensors (el nombre comercial del base es "4B", pero el recuento efectivo es superior, probablemente por el componente de embeddings y cabezas asociadas al modelo multimodal). El repositorio ocupa 10,4 GB, lo que es consistente con pesos en precisión bf16/fp16. El modelo está publicado con acceso restringido (gated), requiere aceptar condiciones en Hugging Face y su licencia figura como "other", por lo que las condiciones de uso comercial no están explicitadas en la información disponible.

La relevancia de este checkpoint es limitada fuera de su nicho: se publicó en noviembre de 2026, no tiene descargas ni likes, y no se han publicado resultados de benchmarks ni una model card detallada en la información proporcionada. Resulta de interés principalmente para quienes investigan agentes GUI y quieran reproducir o comparar ajustes finos sobre la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos no disponibles) |
| Parametros totales | 5.174.964.736 (~5,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicha familia. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora componentes multimodales, aunque el recuento de parámetros (5,17 mil millones frente a la denominación "4B") sugiere que el checkpoint incluye módulos adicionales respecto al backbone de lenguaje, posiblemente relacionados con la entrada visual necesaria para un agente GUI.

El nombre del checkpoint (`sft3m_owrlen_luna_preview_norepeat_human_3ep`) sugiere varias decisiones de entrenamiento: ajuste fino supervisado (SFT) sobre aproximadamente 3 millones de ejemplos, con un objetivo o dataset denominado "owrlen" y "luna_preview", una estrategia de eliminación de repeticiones ("norepeat") y tres épocas de entrenamiento ("3ep") sobre datos de anotación humana ("human"). No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO, la longitud de contexto durante el entrenamiento ni innovaciones técnicas adicionales. Tampoco se documentan detalles sobre el preentrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen3.5-4B.
- Orientación a tareas de agente GUI: interpretación de capturas de pantalla y ejecución de acciones sobre interfaces (según las etiquetas `gui-agent` y `web-agent`).
- Navegación web automatizada: probablemente entrenado para decidir acciones sobre páginas y formularios.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes multi-paso: plausible por su orientación, pero no documentado explícitamente.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no confirmados; la presencia de etiquetas de agente GUI sugiere entrada visual, pero no está documentado.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede actuar como agente que interpreta capturas de pantalla de una aplicación web y genera acciones (clic, escritura, navegación) para validar flujos de usuario en pipelines de QA.
- Asistente de navegación web para tareas repetitivas: rellenar formularios, extraer datos de páginas o completar procesos de compra guiados paso a paso, aprovechando su ajuste específico sobre entornos web.
- Investigación en agentes GUI: servir como checkpoint de referencia para comparar estrategias de SFT sobre Qwen3.5 en tareas de control de interfaz, dado que el nombre del modelo documenta la configuración de entrenamiento (3 épocas, datos humanos).
- Generación de trayectorias de demostración: producir secuencias de acciones anotadas que puedan usarse para entrenar o evaluar otros agentes, gracias a su ajuste sobre datos humanos.
- Automatización de back-office: ejecutar tareas sobre aplicaciones internas basadas en navegador (gestión de tickets, actualización de registros) donde no existe API y la interacción debe ser visual.
- Evaluación de robustez de agentes: al ser un fine-tune con eliminación de repeticiones, puede utilizarse para estudiar el comportamiento del modelo ante instrucciones ambiguas o pantallas cambiantes en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 10,5-11 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 6-7 GB; en 4 bits: alrededor de 3,5-4,5 GB (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia en bf16 con comodidad.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza; en 4 bits podría ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas); transformers con PyTorch para uso directo de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft3m_owrlen_luna_preview_norepeat_human_3ep | ~5,17 mil millones | no disponible | other (gated) | Hugging Face, acceso restringido | Fine-tune de Qwen3.5-4B para agentes GUI/web |
| Qwen/Qwen3.5-4B | ~4 mil millones (nominal) | no disponible en la información | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Alternativas de agente GUI de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, hereda los sesgos de su base, pero no hay información específica sobre el ajuste.
- Riesgo de alucinación: no evaluado; en tareas de agente GUI, una alucinación puede traducirse en acciones erróneas sobre la interfaz, con riesgo de efectos no deseados.
- Limitaciones de contexto e idioma: no disponibles; no se documenta la ventana de contexto efectiva ni los idiomas cubiertos.
- Licencia: figura como "other" y el acceso es restringido; no se especifican condiciones de uso comercial, por lo que es imprescindible revisar los términos en Hugging Face antes de cualquier despliegue en producción.
- Checkpoint experimental: cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks; no debe considerarse un modelo validado para producción.
- El nombre del modelo sugiere un ajuste con eliminación de repeticiones y datos humanos, pero no se documenta el proceso de filtrado ni la calidad de las anotaciones.
- No se confirma soporte de tool calling, multimodalidad ni modo thinking; cualquier integración que dependa de estas capacidades debe verificarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/GUIAgentt/sft3m_owrlen_luna_preview_norepeat_human_3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
