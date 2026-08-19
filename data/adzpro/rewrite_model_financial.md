# Adzpro/Rewrite_model_Financial

## Resumen

Adzpro/Rewrite_model_Financial es un modelo de lenguaje multimodal (vision-language) de aproximadamente 1,94 mil millones de parámetros, derivado de la familia Qwen3.5-2B y convertido a formato GGUF mediante la librería Unsloth. El modelo está orientado a tareas de reescritura de contenido financiero, aunque la documentación publicada no detalla el proceso de fine-tuning ni el conjunto de datos utilizado. Su relevancia radica en ofrecer una opción ligera y desplegable en entornos con recursos limitados, gracias a su cuantización Q4_K_M y su compatibilidad con llama.cpp y herramientas de inferencia local.

El repositorio incluye dos archivos: un peso principal en GGUF cuantizado (Q4_K_M) y un proyector multimodal en FP16 (F16-mmproj), lo que indica que el modelo puede procesar entradas visuales además de texto. Sin embargo, no se han publicado especificaciones detalladas sobre el entrenamiento, la licencia o los idiomas soportados, lo que limita su evaluación rigurosa. A pesar de ello, su tamaño compacto y su formato GGUF lo hacen atractivo para prototipos y despliegues en edge computing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer multimodal, basado en la familia Qwen) |
| Parametros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) y FP16 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (FP16 mmproj) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3.5-2B, que pertenece a la familia de transformers de Qwen. Aunque no se detalla si incorpora innovaciones como atención lineal o decodificación especulativa, la presencia de un proyector multimodal (F16-mmproj) indica que el modelo combina un codificador visual con el decodificador de lenguaje, permitiendo entrada de imágenes. El fine-tuning fue realizado con Unsloth, una librería optimizada para entrenamiento eficiente, y el modelo fue convertido a GGUF para su uso con llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y reescritura de contenido, con enfoque aparente en dominios financieros (según el nombre del modelo).
- Procesamiento multimodal: acepta entradas de imagen gracias al proyector F16-mmproj, lo que permite tareas de visión-lenguaje como descripción de gráficos o documentos escaneados.
- Inferencia local eficiente: al estar cuantizado en Q4_K_M, puede ejecutarse en hardware modesto con llama.cpp o herramientas compatibles.
- Compatibilidad con el ecosistema llama.cpp: soporta `llama-cli` para texto y `llama-mtmd-cli` para multimodal.
- No se han documentado capacidades específicas de tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües; se asume herencia de Qwen, pero sin confirmación.

## Casos de uso

- Reescritura de informes financieros: el modelo puede reformular párrafos de informes anuales o trimestrales para mejorar claridad o adaptar el tono, aprovechando su fine-tuning orientado a finanzas.
- Análisis de gráficos bursátiles: gracias a su componente multimodal, puede describir o resumir imágenes de gráficos de precios, aunque no se garantiza precisión numérica.
- Generación de resúmenes de documentos financieros escaneados: al aceptar imágenes, puede extraer y resumir contenido de facturas o estados de cuenta.
- Asistente de redacción para analistas: ayuda a redactar secciones de informes de inversión o notas de investigación, manteniendo un estilo profesional.
- Prototipos de chatbots financieros: su tamaño compacto permite desplegarlo en entornos de prueba o en dispositivos con poca VRAM para conversaciones sobre conceptos financieros básicos.
- Automatización de correos electrónicos de atención al cliente: puede reescribir respuestas estándar para consultas sobre productos financieros, aunque requiere validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M, un modelo de 1,94 B parámetros ocupa aproximadamente 1,1-1,3 GB en memoria, por lo que cabe en GPUs con 2 GB o más.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso CPUs con suficiente RAM usando llama.cpp.
- Compatible con consumer GPU: sí, especialmente en cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), llama-cpp-python, o servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no disponibles; se estima que en una GPU moderna (RTX 3060) puede generar entre 20-40 tokens/segundo, pero sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Adzpro/Rewrite_model_Financial | 1,94 B | no disponible | no disponible | GGUF | Fine-tune financiero multimodal |
| Qwen2.5-1.5B (base) | 1,54 B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Modelo base sin fine-tune específico |
| Qwen3-2B (base) | 2 B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Modelo base de la generación anterior |

Nota: la comparativa se basa en modelos base de la misma familia, ya que no hay datos públicos de modelos similares con fine-tuning financiero y multimodal. Las especificaciones de contexto y licencia de los modelos base son orientativas y pueden variar.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, lo que impide determinar si es apto para uso comercial o si tiene restricciones.
- No se han documentado los datos de entrenamiento ni el proceso de fine-tuning, por lo que se desconocen posibles sesgos o alucinaciones específicas.
- El modelo está orientado a finanzas, pero sin validación externa, su precisión en cálculos o análisis financiero no está garantizada.
- La longitud de contexto no está especificada; se asume la de Qwen3.5-2B, pero no es seguro.
- El componente multimodal no ha sido evaluado públicamente; su rendimiento en tareas de visión puede ser limitado.
- Al ser un modelo pequeño (1,94 B), su capacidad de razonamiento complejo es inferior a modelos de mayor tamaño.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos; se recomienda verificar la autenticidad del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Adzpro/Rewrite_model_Financial
- Repositorio relacionado (posible variante): https://huggingface.co/Adzpro/Financial_v4
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): https://github.com/ggerganov/llama.cpp
