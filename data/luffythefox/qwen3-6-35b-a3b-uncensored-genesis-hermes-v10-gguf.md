# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF es un modelo de lenguaje de mezcla de expertos (MoE) de 35 000 millones de parámetros, con 3 000 millones activos por pasada, desarrollado por LuffyTheFox. Se basa en el modelo uncensored HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y aplica la técnica propietaria "Genesis" de reparación de tensores, diseñada para reducir el ruido acumulado durante el entrenamiento y mejorar la consistencia y estabilidad de las respuestas sin necesidad de reentrenar. El modelo incorpora además una transferencia de datos del fine-tune Hermes, lo que le otorga capacidades de agente y function calling.

Publicado en formato GGUF, el modelo está pensado para ejecutarse en entornos de inferencia local como llama.cpp, Ollama o vLLM. Su pipeline es image-text-to-text, lo que indica soporte multimodal (imagen y texto), aunque no se especifican detalles sobre la codificación visual. La licencia Apache 2.0 permite uso comercial. Con más de un millón de descargas en HuggingFace, es una opción relevante para desarrolladores que buscan un modelo sin censura, con capacidades de agente y razonamiento, y que pueda ejecutarse en hardware de consumo mediante cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con 40 capas, 256 expertos (8 activos + 1 compartido por capa) |
| Parametros totales | 34 660 610 688 (35B) |
| Parametros activos | 3 000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (diversas, incluyendo APEX; no se detallan los tamaños individuales) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con 40 capas y 256 expertos, de los cuales 8 se activan por token junto con un experto compartido. Según la información disponible, combina atención lineal Gated DeltaNet y atención softmax completa en una proporción 3:1, lo que reduce el coste computacional del contexto largo. El modelo base es HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez se deriva de una variante no censurada de Qwen3.6 (nombre no oficial de la serie Qwen). El autor no ha entrenado el modelo desde cero, sino que ha aplicado la técnica Genesis: un algoritmo de posprocesamiento que escanea los tensores, detecta y reduce el ruido acumulado mediante SVD (descomposición en valores singulares), corrige desequilibrios en los cabezales de atención y restaura la pureza de la señal sin modificar el conocimiento aprendido. Además, se han transferido datos del fine-tune Hermes (basado en NousResearch/hermes-function-calling-v1) a los tensores de los expertos FFN, lo que aporta capacidades de agente y llamada a funciones. No se ha realizado entrenamiento adicional con RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés, chino y otros).
- Capacidades multimodales: pipeline image-text-to-text, por lo que puede procesar entrada de imagen y texto (no se especifican detalles de la codificación visual).
- Function calling / tool calling, gracias al fine-tune Hermes sobre el dataset hermes-function-calling-v1.
- Capacidades de agente: soporta razonamiento multi-paso y uso de herramientas en flujos conversacionales.
- Modo de pensamiento (thinking mode) activable, con recomendaciones de parámetros para tareas de codificación y generación creativa.
- Sin censura: el modelo base reporta 0/465 rechazos a peticiones, lo que implica que no filtra contenido por seguridad.
- Compatible con sistemas de chat con contexto largo gracias a la atención híbrida (Gated DeltaNet + softmax).

## Casos de uso

- **Asistentes de programación en entornos de desarrollo**: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, explicar fragmentos, y usar tool calling para ejecutar comandos o consultar repositorios. Su modo de pensamiento y las configuraciones recomendadas para codificación (temperatura 0.6, top_p 0.95) lo hacen adecuado para tareas precisas.
- **Agentes autónomos de atención al cliente**: con la capacidad de function calling, puede gestionar conversaciones multi-turno, consultar bases de datos o APIs de terceros, y mantener contexto largo (aunque el contexto no se ha publicado, la arquitectura híbrida está diseñada para contextos largos). Su perfil uncensored permite respuestas directas sin rechazos, útil en entornos donde se requiere lenguaje técnico sin restricciones.
- **Generación de contenido creativo y narrativo**: al estar libre de censura, puede producir textos con temáticas adultas o controvertidas, pero también sirve para escritura creativa en general. El ajuste de system prompt con identidad "agent" o "assistant" permite variar el estilo y la creatividad.
- **Análisis de imágenes y texto en tareas de investigación**: al ser multimodal, puede describir imágenes, extraer información de gráficos o tablas, y responder preguntas sobre contenido visual. Aunque no se detalla la arquitectura de visión, el pipeline image-text-to-text indica que es posible.
- **Automatización de tareas de razonamiento multi-paso**: con el modo de pensamiento y la capacidad de agente, puede descomponer problemas complejos, ejecutar pasos intermedios y usar herramientas externas para llegar a una solución. Es útil en entornos de investigación o análisis de datos.
- **Chatbot sin filtros para comunidades técnicas**: en foros o servidores de Discord donde se debaten temas avanzados, el modelo puede responder sin restricciones de contenido, siempre que se respeten las políticas del entorno. Su naturaleza uncensored es un valor para usuarios que necesitan respuestas sin evasivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor no proporciona métricas comparativas con otros modelos, por lo que no es posible evaluar su rendimiento numérico de forma objetiva.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo MoE de 35B totales con 3B activos, la VRAM necesaria depende de la cuantización. Para una cuantización GGUF Q4_K, se estima que el modelo puede caber en una GPU con 24 GB de VRAM (p. ej., RTX 4090). Para Q8, se necesitan ~48 GB. El autor recomienda descargar a CPU 40 capas de los pesos MoE en entornos de baja VRAM.
- **GPUs recomendadas**: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En consumer, la RTX 3090 o RTX 4070 Ti (12 GB) pueden ejecutar la versión Q4 con offloading a CPU.
- **Ejecución en consumer GPU**: Sí, con cuantizaciones bajas (Q4_K_M o similares) y configuraciones de offload. El modelo está diseñado para GGUF, por lo que es compatible con llama.cpp, Ollama, LM Studio, etc.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (con adaptaciones), y cualquier runtime que soporte GGUF. La model card recomienda usar el chat_template.jinja proporcionado y ajustar el número de expertos activos a 8.
- **Latencia y throughput**: no disponible. Al ser un modelo MoE con 3B activos, la velocidad de generación será mayor que la de un modelo denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | no disponible | MoE, 256 expertos, hybrid attention | Apache-2.0 |
| Qwen3-30B-A3B (oficial) | 30B | 3B | 128k (aprox.) | MoE, 256 expertos, hybrid attention | Apache-2.0 |
| Llama 3.1 8B | 8B | 8B | 128k | Transformer denso | Llama 3.1 license |

No hay datos de rendimiento para comparar con el modelo oficial Qwen3-30B-A3B, que es su referencia más cercana. La principal diferencia es la capa de "Genesis" y el fine-tune Hermes, además de la ausencia de censura. La comparación no puede ser cuantitativa sin benchmarks.

## Limitaciones y advertencias

- **Naturaleza uncensored**: el modelo no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o inapropiado. No es apto para entornos donde se requiera cumplimiento normativo o ético.
- **Riesgo de alucinaciones**: el autor menciona que la técnica Genesis reduce la inestabilidad y las alucinaciones, pero no elimina el problema. En tareas de alta precisión, es necesario validar las respuestas.
- **Contexto no especificado**: no se conoce la longitud máxima de contexto, lo que puede provocar fallos en tareas que requieran ventanas de más de 4k tokens si el modelo no las soporta. Se recomienda probar.
- **Multimodalidad limitada**: aunque el pipeline es image-text-to-text, no se documenta la arquitectura de visión ni el entrenamiento visual. La calidad de la comprensión de imágenes puede ser inferior a la de modelos dedicados.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales de la familia Qwen (no se especifica). Se recomienda revisar la licencia del modelo base.
- **Estabilidad**: la técnica Genesis es una modificación numérica de los pesos sin entrenamiento; no hay evidencia formal de que mejore la estabilidad en todos los casos. Es un método propietario sin publicaciones científicas revisadas.

## Enlaces

- [Hugging Face: LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF)
- [Modelo base: HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Fine-tune Hermes: DJLougen/hermes-qwen3.5-35b-a3b-GGUF](https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF)
- [Dataset de function calling: NousResearch/hermes-function-calling-v1](https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1)
- [Script de cuantización (Pastebin)](https://pastebin.com/hXhcMJn9)
- [Discord del proyecto](https://discord.gg/SZ5vacTXYf)
- [Chat template (Jinja)](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja)
