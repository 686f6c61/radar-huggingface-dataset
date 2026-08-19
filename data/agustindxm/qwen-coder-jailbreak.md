# agustindxm/qwen-coder-jailbreak

## Resumen

`agustindxm/qwen-coder-jailbreak` es un modelo de lenguaje basado en Qwen/Qwen2.5-Coder-7B-Instruct, al que se le ha aplicado una técnica de *abliteration* denominada Heretic (ortogonalización de vectores de dirección) para eliminar la dirección de rechazo (*refusal direction*) de los pesos del *residual stream*. El resultado es un modelo que conserva en gran medida las capacidades del original (generación de código, razonamiento, etc.) pero con una tasa de rechazo drásticamente reducida, lo que lo convierte en una herramienta de investigación para estudiar la alineación, el *red-teaming* y el desarrollo de contramedidas.

El modelo se distribuye exclusivamente en formato GGUF, con dos cuantizaciones: Q4_K_M (4,4 GB) y F16 (14,2 GB). No incluye pesos en safetensors ni es compatible con Transformers directamente. Está pensado para su uso en entornos controlados de laboratorio, con fines de investigación y educación, y no para despliegues públicos sin filtros adicionales. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de este modelo radica en que demuestra una técnica de *jailbreak* reproducible y de bajo coste (alrededor de 1,50 USD en RunPod) sobre un modelo de código popular, con una tasa de éxito del 96% en la evaluación de Heretic y una divergencia KL de 0,0339 respecto al base, lo que indica que la calidad general se mantiene casi intacta. Es un caso de estudio útil para la comunidad de seguridad y alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32k (base); 8192 en el Modelfile de ejemplo |
| Tipos de cuantizacion | Q4_K_M, F16 |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only con 7,6 mil millones de parámetros, entrenado por Alibaba Cloud para tareas de generación de código y razonamiento. Soporta una ventana de contexto de hasta 32k tokens y utiliza el formato de chat Qwen2 (`<|im_start|>` / `<|im_end|>`).

El proceso de *abliteration* se realizó con Heretic v1.2.0, que identifica la dirección de rechazo en el espacio de activaciones del modelo y la ortogonaliza de los pesos del *residual stream*. No se trata de un LoRA ni de un *fine-tune*; es una modificación directa de los pesos. El optimizador Optuna se usó para ajustar los hiperparámetros en 100 iteraciones, con un coste de aproximadamente 20 minutos en una RTX 4090. La divergencia KL resultante de 0,0339 indica que la distribución de salidas apenas se desvía de la del modelo original, salvo en la eliminación de los rechazos.

## Capacidades

- Generación de código y razonamiento técnico: conserva las capacidades del modelo base Qwen2.5-Coder-7B-Instruct, incluyendo programación en múltiples lenguajes, depuración y explicación de código.
- Respuestas sin filtros de seguridad: el modelo no rechaza peticiones que el base sí rechazaría, lo que permite explorar contenido que normalmente estaría bloqueado (dentro de los límites de su conocimiento).
- Conversación multi-turno: mantiene el formato de chat Qwen2 y puede seguir instrucciones en inglés y español.
- Compatibilidad con herramientas de inferencia local: funciona con llama.cpp, LM Studio y Ollama mediante archivos GGUF.
- Sin capacidades multimodales: no soporta visión, audio ni otras modalidades; es exclusivamente texto.
- No incluye *tool calling* explícito: aunque el modelo base puede tener cierta capacidad, no se documenta en esta variante.

## Casos de uso

- Investigación de alineación y *refusal*: permite estudiar cómo se comporta un modelo sin dirección de rechazo, comparando respuestas con el modelo base para entender los mecanismos de seguridad.
- *Red-teaming* y pruebas de seguridad autorizadas: se puede usar para generar *prompts* adversarios y evaluar la robustez de otros sistemas frente a intentos de *jailbreak*.
- Desarrollo de detectores de contenido dañino: al generar respuestas sin filtros, sirve como *dataset* para entrenar clasificadores que identifiquen salidas peligrosas.
- Análisis de técnicas de *abliteration*: permite reproducir y validar el método Heretic sobre un modelo de código popular, comparando métricas como la tasa de *jailbreak* y la divergencia KL.
- Evaluación de riesgos en modelos de código: ayuda a identificar qué tipos de peticiones maliciosas (generación de malware, exploits, etc.) son más propensas a ser respondidas por un modelo sin guardrails.
- Entornos de laboratorio controlados: para Q&A técnico sin restricciones en un *sandbox* aislado, con fines educativos y de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados por el autor son:

| Metrica | Valor |
|---|---|
| Tasa de jailbreak (eval de Heretic) | 96% (4/100 rechazos) |
| Divergencia KL vs base | 0,0339 |
| Velocidad de inferencia (Q4, Mac M4 Pro) | 15-25 tok/s |

Estos datos indican que el modelo mantiene una calidad de salida muy cercana al original, pero con una reducción drástica de los rechazos. No hay comparaciones con otros modelos en términos de precisión o capacidad de código.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 4,4 GB, por lo que cabe en GPUs con al menos 6 GB de VRAM (por ejemplo, RTX 2060, GTX 1660 Super). El F16 requiere unos 14,2 GB, necesitando GPUs de gama alta como RTX 3090/4090 o A100.
- GPU recomendadas: RTX 4090 (usada para el proceso de optimización), Mac M4 Pro (probado con 15-25 tok/s en Q4), o cualquier GPU compatible con llama.cpp.
- Compatibilidad con GPUs de consumo: sí, la versión Q4_K_M es adecuada para GPUs de consumo medio (6-8 GB VRAM) y para Macs con Apple Silicon.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mediante Modelfile). No se menciona compatibilidad con vLLM o TGI, ya que el formato es GGUF.
- Latencia y throughput: en Mac M4 Pro, 15-25 tok/s con Q4_K_M. En GPUs dedicadas se espera un rendimiento superior, aunque no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 32k | Apache 2.0 | safetensors, GGUF | Con guardrails de seguridad |
| agustindxm/qwen-coder-jailbreak | 7,6B | 32k (base) | Apache 2.0 | GGUF | Abliterado, sin rechazos |
| Dolphin 2.6 (o similar) | Variable | Variable | Varias | safetensors, GGUF | Modelos "uncensored" mediante fine-tune, no abliteración |

La comparación directa con el modelo base es la más relevante: misma arquitectura y pesos, pero con la dirección de rechazo eliminada. No hay datos de benchmarks estándar para comparar con otros modelos de código de tamaño similar (por ejemplo, CodeLlama-7B, DeepSeek-Coder-6.7B), por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Guardrails reducidos: el modelo puede generar contenido dañino, ilegal o no ético si se le solicita. No debe usarse para actividades ilegales ni para despliegues públicos sin filtros adicionales.
- Riesgo de alucinación: al igual que el modelo base, puede inventar información, especialmente en temas fuera de su dominio de entrenamiento.
- Contexto limitado en el Modelfile de ejemplo: aunque el base soporta 32k, el ejemplo de Ollama fija `num_ctx` a 8192, lo que limita la ventana efectiva si se usa tal cual.
- Solo GGUF: no hay pesos en safetensors, por lo que no es directamente utilizable con Transformers, vLLM u otros frameworks que requieran ese formato.
- Idiomas: aunque el modelo base soporta más idiomas, la model card solo declara inglés y español; el rendimiento en otros idiomas no está garantizado.
- Licencia: Apache 2.0, pero los pesos originales son de Alibaba Cloud; la atribución debe mantenerse. El uso comercial está permitido, pero con las advertencias de seguridad mencionadas.
- No apto para producción: el autor lo destina explícitamente a investigación y educación. Cualquier uso en producción requeriría un sistema de filtrado y moderación robusto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agustindxm/qwen-coder-jailbreak)
- [Repositorio de archivos en Hugging Face](https://huggingface.co/agustindxm/qwen-coder-jailbreak/tree/main)
- [Repositorio GitHub del proyecto](https://github.com/agusisa/qwen-coder-jailbreak)
- [README en GitHub](https://github.com/agusisa/qwen-coder-jailbreak/blob/main/README.md)
- [Heretic (herramienta de abliteration)](https://github.com/p-e-w/heretic)
- [Modelo base Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
