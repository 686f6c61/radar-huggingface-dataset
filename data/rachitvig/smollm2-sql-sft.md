# Rachitvig/SmolLM2-SQL-SFT

## Resumen

SmolLM2-SQL-SFT es un adaptador LoRA (PEFT) publicado por el usuario Rachitvig sobre el modelo base HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. El nombre del repositorio sugiere un ajuste fino orientado a la generación de consultas SQL, aunque la model card no documenta explícitamente el dataset, el procedimiento ni los objetivos de entrenamiento.

El artefacto es un adaptador, no un modelo completo: requiere cargar el modelo base SmolLM2-135M y aplicar los pesos LoRA con la librería PEFT. El repositorio tiene un tamaño de 0,0 GB, lo que es coherente con un adaptador de bajo rango sobre un modelo de 135M de parámetros. La relevancia práctica es limitada por la ausencia de documentación, benchmarks y licencia declarada.

SmolLM2-135M pertenece a la familia SmolLM2 de Hugging Face, diseñada para ejecutarse en dispositivos con recursos muy limitados (CPU, móvil, edge). Este adaptador concreto no aporta información verificable sobre calidad, idiomas o condiciones de uso, por lo que debe evaluarse con cautela antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M) con adaptador LoRA |
| Parámetros totales | 135M en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base SmolLM2-135M soporta 8192 tokens según su documentación oficial, no verificable aquí) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre SmolLM2-135M, un transformer decoder-only con atención causal estándar. El repositorio usa la librería PEFT (versión 0.21.2 según la model card) y la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. No se especifica el rango, el alpha, las capas objetivo ni el número de parámetros entrenables del adaptador.

La model card no documenta el dataset de entrenamiento, el número de tokens, la composición de los datos, la existencia de RLHF/DPO ni los hiperparámetros (learning rate, batch size, épocas). Tampoco se indica la infraestructura de cómputo ni el procedimiento de preprocesado. Toda la sección de entrenamiento de la model card está marcada como "[More Information Needed]". El único dato técnico verificable es la referencia a la librería PEFT y el modelo base.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base SmolLM2-135M.
- Ajuste fino orientado a SQL según el nombre del repositorio, sin documentación que lo confirme ni ejemplos de uso.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).
- El tamaño del modelo base (135M) limita severamente el razonamiento complejo y la fidelidad en tareas de código.

## Casos de uso

- Experimentación académica con LoRA: el adaptador sirve como ejemplo de ajuste fino de bajo rango sobre un modelo pequeño, útil para estudiar el impacto de LoRA en tareas de dominio específico.
- Prototipado de generación de SQL en entornos de recursos limitados: si el ajuste funciona, podría generar consultas sencillas en CPU o dispositivos edge, aunque no hay evidencia publicada de ello.
- Docencia sobre PEFT: permite ilustrar el flujo de carga de un adaptador con `PeftModel.from_pretrained` junto al modelo base.
- Pruebas de integración en pipelines de transformers: válido para verificar compatibilidad de versiones de PEFT y transformers en CI.
- Evaluación comparativa de adaptadores: puede usarse como baseline negativo o de referencia en estudios sobre calidad de ajustes finos no documentados.
- Generación de texto genérica de baja latencia: el modelo base de 135M es adecuado para tareas triviales de completado en local, aunque el adaptador SQL podría degradar el rendimiento general.

En ningún caso se recomienda su uso en producción sin una evaluación previa propia, dada la falta de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en fp16 ocupa aproximadamente 270 MB; en int8 unos 135 MB; en int4 unos 70 MB. El adaptador LoRA añade una cantidad marginal no cuantificada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo cabe holgadamente en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertirlo a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. Por el tamaño del modelo base, se espera latencia de milisegundos en GPU y decenas de milisegundos por token en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rachitvig/SmolLM2-SQL-SFT | 135M (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador sin documentar |
| HuggingFaceTB/SmolLM2-135M | 135M | 8192 (según documentación oficial del modelo base) | Apache 2.0 (según documentación oficial del modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, documentado |
| SmolLM2-360M | 360M | 8192 (según documentación oficial) | Apache 2.0 (según documentación oficial) | Hugging Face | Mayor capacidad con coste aún bajo |
| Modelos SQL especializados de mayor tamaño (p. ej. familias de 1B-7B) | 1B-7B | variable | variable | Hugging Face | Mayor calidad esperada en SQL, mayor coste |

Los datos del modelo base y de SmolLM2-360M provienen de la documentación oficial de Hugging Face y no de la información proporcionada en esta ficha; se incluyen como referencia contextual.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido. El modelo base SmolLM2-135M es Apache 2.0 según su documentación oficial, pero el adaptador no especifica licencia propia.
- Riesgo elevado de alucinación y de SQL sintácticamente inválido: el modelo base de 135M tiene capacidad limitada para tareas de código.
- Sin benchmarks ni ejemplos: imposible estimar la calidad real del ajuste SQL.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas.
- Contexto no documentado en esta ficha; el modelo base soporta 8192 tokens según su documentación oficial, pero el adaptador no lo confirma.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No apto para producción sin evaluación propia y sin aclaración de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Rachitvig/SmolLM2-SQL-SFT
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
