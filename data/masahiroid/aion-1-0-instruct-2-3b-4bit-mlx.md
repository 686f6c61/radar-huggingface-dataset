# masahiroid/Aion-1.0-Instruct-2.3B-4bit-mlx

## Resumen

Aion-1.0-Instruct-2.3B-4bit-mlx es una conversión no oficial del modelo `microsoft/Aion-1.0-Instruct-2.3B` al formato MLX con cuantización de 4 bits (group size 64), publicada por el usuario masahiroid. El objetivo declarado es ofrecer una versión que quepa y funcione en Macs con Apple Silicon de 16 GB de memoria unificada (aproximadamente 8 GB disponibles para la GPU), un segmento de hardware muy extendido entre desarrolladores. El modelo base lo desarrolla Microsoft y está orientado a instrucciones y conversación.

El modelo cuenta con 2.288.831.488 parámetros (2,29B), lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware de consumo. La conversión mantiene la licencia MIT del modelo original y se distribuye en safetensors con la librería MLX. El repositorio ocupa 1,3 GB, coherente con una cuantización de 4 bits de un modelo de este tamaño.

La relevancia de esta ficha radica en que el modelo base incorpora innovaciones arquitectónicas poco habituales (RMSNorm por cabeza, atención mixta con ventana deslizante y atención completa, y RoPE por tipo de capa con YaRN en las capas de atención completa) que el autor ha portado manualmente a MLX, ya que `aion_instruct` no está incluido en mlx-lm 0.32.2. La información disponible sobre el modelo base es limitada y procede exclusivamente de la model card del conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención mixta (sliding-window de 2048 y atención completa), RMSNorm por cabeza q/k, RoPE por tipo de capa (YaRN en capas de atención completa) |
| Parametros totales | 2.288.831.488 (2,29B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (ventana deslizante de 2048 tokens en las capas correspondientes) |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer que, según la implementación de referencia portada por el autor, emplea RMSNorm por cabeza para las proyecciones q y k, una combinación de atención con ventana deslizante de 2048 tokens y atención completa en determinadas capas, y RoPE configurado de forma distinta según el tipo de capa, con YaRN aplicado en las capas de atención completa. Esta hibridación busca reducir el coste computacional en secuencias largas manteniendo capacidad de atención global en capas seleccionadas. El conversor ha portado manualmente el código de referencia PyTorch (`modeling_aion_instruct.py`) a MLX, eliminando el código PyTorch y la entrada `auto_map` originales, por lo que no es necesario `trust_remote_code`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación, ya que la model card del conversor no los detalla. La validación de la conversión se realizó comparando la salida en float32 contra la referencia PyTorch sobre 3.000 tokens de texto en japonés: la diferencia máxima de logits fue de aproximadamente 1e-3 y el token top-1 coincidió en todas las posiciones, tanto en prefill de una pasada como en decodificación token a token con caché KV. Un control negativo con la ventana deslizante desactivada elevó la diferencia a aproximadamente 5, lo que confirma que la prueba detecta errores en la ventana.

## Capacidades

- Generación de texto y conversación multi-turno: el modelo está etiquetado como `text-generation` y `conversational`, con plantilla de chat propia.
- Instrucciones: el sufijo `Instruct` del modelo base indica ajuste para seguir instrucciones.
- Capacidades multilingües: no disponibles; la validación de la conversión se hizo con texto en japonés, pero no se documenta el conjunto de idiomas soportados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Ejecución en Apple Silicon: soporte nativo mediante MLX, con implementación incluida en el repositorio.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno mediante `apply_chat_template` y ejecutarse en un Mac con 16 GB de memoria unificada, lo que permite prototipar asistentes sin conexión ni costes de API.
- Desarrollo y pruebas en portátiles Apple Silicon: al ocupar 1,3 GB en disco y caber en GPUs integradas de 8 GB, sirve para iterar en pipelines de generación de texto durante el desarrollo antes de desplegar en hardware mayor.
- Generación de texto en japonés: la validación de la conversión se realizó con 3.000 tokens de texto japonés, y el ejemplo de uso de la model card emplea una pregunta en japonés, lo que sugiere utilidad para tareas de texto en ese idioma.
- Prototipado de aplicaciones de chat con MLX: la implementación incluida permite integrar el modelo en scripts Python mediante `mlx_lm.load` y `mlx_lm.generate`, o usar la CLI `mlx_lm.generate` tras copiar el módulo.
- Evaluación de cuantización 4-bit: útil para investigadores que quieran medir la degradación de un modelo de 2,3B al cuantizarlo a 4 bits con group size 64 en MLX.
- Experimentación educativa: el tamaño reducido y la licencia MIT facilitan su uso en entornos docentes y proyectos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento documentada es la fidelidad de la conversión: diferencia máxima de logits de aproximadamente 1e-3 frente a la referencia PyTorch en float32 sobre 3.000 tokens de japonés, con coincidencia del token top-1 en todas las posiciones.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB de memoria unificada disponible para la GPU en un Mac de 16 GB, según el objetivo declarado por el autor.
- Tamaño en disco: 1,3 GB (repositorio completo).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y posteriores) con al menos 16 GB de memoria unificada; el autor menciona explícitamente la clase M2 16 GB.
- GPU consumer NVIDIA: no aplicable de forma nativa, ya que el formato es MLX; requeriría otra conversión (por ejemplo, GGUF) para llama.cpp u Ollama.
- Opciones de despliegue: mlx-lm 0.32.2 o superior, registrando el módulo `aion_instruct.py` en tiempo de ejecución o copiándolo al directorio de `mlx_lm.models`; también es posible usar la CLI `mlx_lm.generate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-4bit-mlx | 2,29B | no disponible | MIT | safetensors (MLX 4-bit) | Conversión no oficial para Apple Silicon |
| microsoft/Aion-1.0-Instruct-2.3B | 2,29B | no disponible | MIT | safetensors (PyTorch) | Modelo base original; requiere `trust_remote_code` |
| Otras alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros modelos de 2-3B para instrucciones); los datos de rendimiento, contexto y disponibilidad de dichos modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el modelo no lo publica Microsoft, sino un tercero (masahiroid); la responsabilidad de la fidelidad de la conversión recae en el autor del conversor.
- Requiere código adicional: `aion_instruct` no está en mlx-lm 0.32.2, por lo que es necesario registrar o copiar `aion_instruct.py`; sin este paso, `mlx_lm.load` no reconocerá la arquitectura.
- Solo MLX: el formato safetensors MLX no es directamente utilizable en ecosistemas PyTorch, vLLM, TGI, llama.cpp u Ollama sin una nueva conversión.
- Idiomas no documentados: no se especifica la cobertura lingüística del modelo base; la validación se hizo en japonés, pero no hay garantías sobre otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto.
- Sesgos: no documentados en la información proporcionada.
- Contexto: la ventana deslizante de 2048 tokens limita la atención local en las capas correspondientes; la longitud de contexto efectiva total no está documentada.
- Uso comercial: la licencia MIT del modelo base permite uso comercial, pero conviene verificar las condiciones del modelo original en su repositorio de Hugging Face.
- Sin métricas de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, lo que dificulta evaluar su calidad frente a alternativas.
- Descargas y likes: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del conversor: https://huggingface.co/masahiroid/Aion-1.0-Instruct-2.3B-4bit-mlx
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Herramienta de auditoría del autor: https://github.com/masahiroid/model-audit-lite
- Informe de seguridad: https://huggingface.co/masahiroid/Aion-1.0-Instruct-2.3B-4bit-mlx/blob/main/SECURITY.md
- Informe de auditoría: https://huggingface.co/masahiroid/Aion-1.0-Instruct-2.3B-4bit-mlx/blob/main/audit/report.md
