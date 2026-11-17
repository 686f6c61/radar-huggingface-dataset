# fjolsvin/Carnice-9b-heretic-tiiny

## Resumen

Carnice-9b-heretic-tiiny es un fine-tune derivado de Qwen/Qwen3.5-9B, publicado por el usuario fjolsvin y empaquetado mediante la herramienta tiiny-forge para su importación en dispositivos Tiiny Pocket con TiinyOS. El modelo parte de la variante Carnice-9b-heretic de ponytang3, que a su vez es un "decensored" (abliterated) del checkpoint merged de Carnice-9b, un ajuste específicamente orientado al arnés de agentes Hermes Agent. El resultado es un modelo multimodal (image-text-to-text) de aproximadamente 8.950 millones de parámetros, con licencia Apache 2.0 y pesos en safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de "grafting" de pesos: el autor original Carnice-9b es una build solo de texto, y fjolsvin ha añadido 333 tensores de la torre visual de Qwen3.5-9B (0,91 GB) tomados byte a byte del modelo base, además de restaurar config.json, tokenizer y preprocessors. Por otro, ilustra el flujo de trabajo de tiiny-forge, que reempaqueta checkpoints para que el importador de Hugging Face de un dispositivo Tiiny Pocket los acepte como fine-tunes del modelo de tienda Qwen/Qwen3.5-9B.

El modelo está afinado para ejecución de tareas agénticas: uso de terminal, navegador, edición de ficheros, tool calling multi-turno y formatos de mensaje nativos de Hermes. No está optimizado para benchmarks genéricos de chat, sino para calidad de ejecución dentro de ese harness concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; detalles internos de capas y atención no disponibles |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; verificación en dispositivo reporta "NPU share 29%") |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 18,8 GB |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.5-9B, es un transformer multimodal de la familia Qwen3.5. Carnice-9b se construye como un checkpoint merged (no un entrenamiento completo desde cero) a partir del adaptador kai-os/qwen35-hermes-stage2-adapter-v1, cargable sin paso PEFT separado. El entrenamiento se describe en dos etapas: una etapa A de "reparación de razonamiento" sobre datos de alta señal (Bespoke-Stratos-17k y NuminaMath-CoT), y una etapa B específica de Hermes construida con trazas nativas del harness (kai-os/carnice-glm5-hermes-traces y OpenThoughts-Agent-v1-SFT). El objetivo declarado es evitar hábitos de agentes externos que incomoden al modelo dentro de Hermes.

Sobre esta base, ponytang3 aplicó abliteration con Heretic v1.2.1 para eliminar direcciones de rechazo, con parámetros documentados (direction_index 16,62; pesos máximos y mínimos por módulo en attn.o_proj y mlp.down_proj). El resultado reporta una divergencia KL de 0,0095 frente al original y una reducción de rechazos de 88/100 a 6/100. La versión tiiny de fjolsvin no altera los pesos del modelo fuente: añade los 333 tensores de model.visual.* (0,91 GB) del base Qwen3.5-9B, copia merges.txt, vocab.json, preprocessor_config.json y video_preprocessor_config.json, y restaura el config.json del base para que el importador del dispositivo acepte el checkpoint. No se documentan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con una etapa de entrenamiento dedicada a reparar trazas de razonamiento.
- Tool calling y function calling, con formato nativo del arnés Hermes Agent.
- Ejecución agéntica en terminal: comandos, edición de ficheros y flujos estructurados.
- Uso de navegador y comportamiento asistido por web dentro del runtime de Hermes.
- Tool calling multi-turno dentro de la conversación Hermes.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a los tensores visuales injertados del base.
- Modo "decensored"/abliterated: baja tasa de rechazos (6/100 en la evaluación del autor del fine-tune).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede recibir una instrucción en lenguaje natural y emitir secuencias de comandos y ediciones de ficheros estructuradas, aprovechando su entrenamiento sobre trazas nativas de Hermes para reducir errores de formato en el bucle agéntico.
- Agente de navegación web: adecuado para flujos en los que el agente debe consultar páginas, extraer datos y encadenar acciones, ya que la etapa B se entrenó específicamente con trazas de browser use del harness.
- Edición de código en pipelines: puede integrarse en un agente que lea un repositorio, proponga parches y los aplique vía tool calling, con formato de mensajes compatible con Hermes.
- Asistente de operaciones con contexto de ficheros: para tareas de mantenimiento donde el agente debe inspeccionar logs y configuraciones y ejecutar correcciones, apoyándose en el modo terminal-first del entrenamiento.
- Despliegue en dispositivos Tiiny Pocket: el checkpoint ha sido verificado en TiinyOS 0.1.39 con 5/5 smoke tests superados, TTFT de 2,94 s con 3725 tokens de prompt, prefill de 1265,85 tok/s y decode de 17,0 tok/s, lo que lo hace apto para asistentes locales en hardware de borde.
- Prototipado de agentes sin capa de rechazo: útil en investigación sobre alineación y robustez, donde se necesita un modelo que no bloquee peticiones legítimas de análisis de contenido sensible, con la advertencia de los riesgos asociados.
- Evaluación comparativa de harness: sirve como referencia para medir calidad de ejecución dentro de Hermes frente a otros checkpoints merged de la misma familia.

## Benchmarks y rendimiento

El autor del fine-tune indica explícitamente que la evaluación se centra en el harness Hermes y que no prioriza benchmarks genéricos; solo se publican métricas de abliteration y de verificación en dispositivo.

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0095 | 0 (por definición) |
| Rechazos | 6/100 | 88/100 |

| Métrica de dispositivo (Tiiny Pocket) | Valor |
|---|---|
| Smoke tests | 5/5 superados |
| NPU share | 29% |
| TTFT (3725 tokens de prompt) | 2,94 s |
| Prefill | 1265,85 tok/s |
| Decode | 17,0 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 18 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 18,8 GB en safetensors.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; una RTX 4090 de 24 GB puede quedar justa y requerir cuantización.
- Consumer GPU: viable con cuantización a 8 bits o 4 bits en GPUs de 12-24 GB, aunque no se documentan ficheros GGUF en el repo.
- Opciones de despliegue: transformers (AutoModelForCausalLM, torch_dtype=bfloat16, device_map="auto"); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: en Tiiny Pocket, decode de 17,0 tok/s y prefill de 1265,85 tok/s; no hay datos para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carnice-9b-heretic-tiiny (este) | ≈8,95 B | no disponible | Agéntico Hermes, multimodal, abliterated | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ≈9 B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| Carnice-9b-heretic (ponytang3) | ≈9 B | no disponible | Agéntico Hermes, abliterated, solo texto | no disponible | Hugging Face |
| Carnice-9b (kai-os) | ≈9 B | no disponible | Agéntico Hermes, merged | no disponible | Hugging Face |

## Limitaciones y advertencias

- La abliteration reduce los rechazos a 6/100, lo que implica que el modelo puede generar contenido que otros modelos bloquearían; requiere filtros y políticas de uso en producción.
- La divergencia KL de 0,0095 respecto al original indica una alteración medible de la distribución, con posible degradación en tareas no evaluadas.
- El modelo está optimizado para Hermes Agent; fuera de ese harness puede rendir peor en tool calling y formato de acciones.
- Los tensores visuales se han injertado del base sin entrenamiento conjunto del adaptador, por lo que la calidad multimodal no está validada.
- No hay datos publicados de benchmarks estándar, sesgos, idiomas soportados ni longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado por un modelo decensored.
- El checkpoint se publicó con 0 descargas y 0 likes; no hay evidencia de uso en producción por terceros.
- El rendimiento en dispositivo reportado (17 tok/s decode) es bajo para aplicaciones interactivas exigentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjolsvin/Carnice-9b-heretic-tiiny
- Modelo fuente: https://huggingface.co/ponytang3/Carnice-9b-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador de origen: https://huggingface.co/kai-os/qwen35-hermes-stage2-adapter-v1
- Dataset de trazas Hermes: https://huggingface.co/datasets/kai-os/carnice-glm5-hermes-traces
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Informe de verificación: https://huggingface.co/fjolsvin/Carnice-9b-heretic-tiiny/blob/main/tiiny-verification.md
- Datos crudos de verificación: https://huggingface.co/fjolsvin/Carnice-9b-heretic-tiiny/blob/main/tiiny-verification.json
