# orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8

## Resumen

Qwen3.8-Flash-Next-Uncensored-FP8 es una variante "abliterated" (sin las capas de rechazo alineadas) del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario orcarouter en Hugging Face. Se distribuye en formato FP8 con cuantización por bloques (block-FP8), pensada para su despliegue en vLLM, y conserva la arquitectura Mixture-of-Experts (MoE) multimodal del modelo original, con aproximadamente 180.000 millones de parámetros totales según los pesos en safetensors. El pipeline declarado es image-text-to-text, es decir, visión-lenguaje.

El modelo está orientado explícitamente a red-teaming y pruebas de seguridad de IA: la etiqueta `ai-red-team` y la naturaleza "uncensored" indican que se ha eliminado o atenuado la alineación de seguridad para permitir generar contenido que el modelo base rechazaría. Esto lo hace útil para auditorías de sistemas de moderación y evaluación de robustez, pero inadecuado para despliegues de cara al público sin capas adicionales de control.

La relevancia actual radica en dos factores: por un lado, la familia Qwen3.8 introduce soporte de razonamiento, function calling y decodificación multi-token prediction (MTP), reflejados en los tags; por otro, la cuantización FP8 por bloques reduce el peso del repositorio a 185,6 GB, lo que abarata sustancialmente el servicio en GPUs con soporte FP8 nativo (Hopper y posteriores). El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal (image-text-to-text), con soporte MTP |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con cuantizacion por bloques (block-FP8); no se documentan otros formatos en la informacion disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next base: un transformer de tipo Mixture-of-Experts con capacidad multimodal de entrada (imagen y texto) y salida de texto. Los tags confirman componentes de razonamiento, function calling y decodificación con multi-token prediction (MTP), una técnica que permite predecir varios tokens por paso para aumentar el throughput en inferencia. No se dispone de información sobre el número de parámetros activos por token, el número de expertos ni la distribución de capas.

Respecto al entrenamiento, los datos disponibles no detallan el volumen de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO en el modelo base. La modificación respecto al original es un proceso de "abliteration" aplicado por el autor de la publicación (orcarouter), que típicamente consiste en identificar y neutralizar direcciones de activación asociadas al rechazo de peticiones. No se documenta la metodología exacta, el conjunto de evaluación usado para verificar la eliminación del rechazo ni si se realizó un ajuste posterior para preservar capacidades. La cuantización a FP8 por bloques es la otra intervención técnica relevante: agrupa pesos en bloques con escalas compartidas, lo que reduce el error de cuantización frente a FP8 por tensor.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes (pipeline image-text-to-text): descripción, extracción de información y respuesta a preguntas sobre contenido visual.
- Razonamiento explícito, con soporte declarado de modo de razonamiento en los tags.
- Function calling / tool calling, lo que permite integración en pipelines con herramientas externas.
- Decodificación multi-token prediction (MTP) para acelerar la generación.
- Generación de contenido sin las restricciones de seguridad del modelo base, orientada a red-teaming.
- No se documentan capacidades de audio ni de salida multimodal (solo texto de salida).

## Casos de uso

- Red-teaming de sistemas de moderación: el modelo puede generar respuestas que un modelo alineado rechazaría, lo que permite construir conjuntos de prueba adversarios para evaluar clasificadores de contenido y filtros de seguridad antes de desplegarlos.
- Auditoría de robustez de asistentes: usar la variante sin censura como contraparte del modelo alineado para medir la tasa de rechazo, la consistencia y la deriva de comportamiento entre ambos en las mismas peticiones.
- Evaluación de sesgos y toxicidad: generar grandes volúmenes de texto con temáticas sensibles para alimentar métricas de sesgo y análisis de toxicidad en pipelines de investigación, con la ventaja de que el modelo no bloquea la generación.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer y resumir información de capturas, formularios escaneados o diagramas en flujos internos donde el contenido no puede enviarse a APIs externas.
- Asistencia en investigación sobre alineación: comparar las activaciones y distribuciones de salida del modelo abliterated frente al base para estudiar qué representaciones internas codifican el rechazo.
- Despliegue interno de alto throughput en vLLM: el formato block-FP8 y el soporte MTP permiten servir el modelo en GPUs Hopper con menor huella de memoria que la versión BF16, adecuado para entornos de laboratorio con demanda concurrente.
- Generación de datos sintéticos para entrenamiento: producir corpus diversos, incluidos temas que los modelos alineados evitan, para aumentar la cobertura de datasets de ajuste, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 185,6 GB en FP8, por lo que se necesita al menos ese espacio en memoria de GPU para cargar los pesos completos, más overhead de KV cache y activaciones. En la práctica, un nodo con 8 GPU de 24 GB (192 GB) queda al límite; se recomienda un mínimo de 256 GB de memoria agregada.
- GPU recomendadas: H100 (80 GB) o H200 en configuraciones multi-GPU (4x H100 cubren los pesos con margen); también GPU con soporte FP8 nativo como L40S. Las A100 no tienen FP8 nativo y requerirán de-cuantización o kernels emulados, con penalización de rendimiento.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Sería necesario un clúster multi-GPU consumer, impractical por ancho de banda de interconexión.
- Opciones de despliegue: vLLM es la vía recomendada por los tags y por el formato block-FP8; transformers sirve para carga y pruebas. No se documenta soporte GGUF ni Ollama en la información disponible, lo que descarta llama.cpp como opción directa.
- Latencia y throughput: no disponibles. El uso de MTP debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8 | ~180B (MoE) | no disponible | Apache 2.0 | safetensors FP8 | Variante abliterated, vision-lenguaje, acceso gated |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original alineado; referencia para comparar tasas de rechazo |
| Alternativas abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para establecer comparaciones cuantitativas con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: el proceso de abliteration elimina o atenúa los rechazos, por lo que el modelo puede producir contenido dañino, ilegal o sexualmente explícito. No debe exponerse sin moderación adicional.
- Riesgo elevado de alucinación en temas sensibles: al no aplicar rechazo, el modelo puede generar afirmaciones falsas con alta confianza en lugar de declinar responder.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue comercial de una variante sin censura puede incumplir normativas sectoriales (por ejemplo, la Ley de Servicios Digitales en la UE o la regulación de contenido en plataformas) y las políticas de los proveedores de inferencia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad en entornos corporativos con políticas de aprovisionamiento estrictas.
- No se documenta la metodología de abliteration ni evaluaciones de degradación de capacidades; es posible que el modelo haya perdido rendimiento en tareas que dependían de la alineación.
- El tamaño (185,6 GB) y el requisito de FP8 nativo limitan el despliegue a infraestructura especializada; no es viable en entornos de desarrollo convencionales.
- No hay información sobre sesgos medidos, ni sobre el contexto máximo real, lo que impide planificar con garantías cargas de trabajo de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de vLLM (motor de inferencia recomendado): https://github.com/vllm-project/vllm
- Documentación de transformers: https://huggingface.co/docs/transformers
- No se han encontrado en la información proporcionada papers, blogs o demos adicionales específicos de esta variante.
