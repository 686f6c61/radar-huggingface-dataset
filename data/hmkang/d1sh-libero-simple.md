# hmkang/d1sh-libero-simple

## Resumen

d1sh-libero-simple es un conjunto de checkpoints de ajuste fino supervisado (SFT) sobre modelos de visión-lenguaje para control robótico, publicado por el usuario hmkang. El modelo parte de LiquidAI/d1-3B (y, en una variante no subida todavía, de Qwen/Qwen3.5-2B) y se entrena para responder a la "pregunta de acción" de d1-showharness en el benchmark LIBERO, emitiendo uno de 15 tokens de acción discretos (seis variantes de movimiento `MV_*`, seis de rotación `RT_*`, más `GRASP`, `RELEASE` y `DONE`). Es, por tanto, una política visión-lenguaje-acción (VLA) discreta, no un modelo de propósito general.

El interés del artefacto es doble: por un lado, demuestra que un modelo de lenguaje pequeño con torre de visión congelada puede aprender una política de manipulación razonable en LIBERO mediante SFT puro; por otro, publica los logs de entrenamiento por época y una recomendación explícita de checkpoint (la época de menor NLL, pensada como punto de partida para RL posterior). El checkpoint principal (`d1-3b-full/epoch3`) alcanza una precisión top-1 de validación del 0,8534 en la época 8, aunque el autor recomienda la época 3 (NLL 0,4425) por estar mejor calibrada.

La relevancia actual es acotada pero concreta: sirve como línea base reproducible para investigación en VLA discretos sobre LIBERO y como inicialización para pipelines de RL. No es un modelo para producción general ni para tareas fuera del dominio de manipulación simulado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer) con torre de visión congelada y cabeza de lenguaje; política de acciones discretas |
| Parámetros totales | 3B (modelo base LiquidAI/d1-3B); variante Qwen3.5-2B con 2B |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; inferencia entrenada en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (checkpoints sobre d1-3B); Apache-2.0 (checkpoints sobre Qwen3.5-2B) |
| Formato de pesos | safetensors (`weights.safetensors` por época) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLM LiquidAI/d1-3B, con la torre de visión congelada (los pesos faltantes en la carga corresponden a la torre de visión y al alias `lm_head` atado). El entrenamiento es SFT sobre el dataset hmkang/libero-discrete-tokens, configuración `simplified`, en el que cada ejemplo es una observación visual más una pregunta de acción de d1-showharness, y la respuesta es uno de 15 tokens discretos de acción. La inferencia se ejecuta bajo `torch.autocast('cuda', dtype=torch.bfloat16)`, igual que en entrenamiento.

El checkpoint principal es un ajuste fino completo de 8 épocas; existen además variantes LoRA (d1-3B LoRA, 5 épocas; Qwen3.5-2B LoRA, 3 épocas) que el autor menciona pero que aún no ha subido al repositorio. La validación se hace sobre episodios completos retenidos y se evalúa al final de cada época, registrando NLL, precisión top-1 y macro recall. El autor señala que las épocas tardías pueden subir la precisión top-1 mientras empeora el NLL por sobreconfianza en las filas erróneas, de ahí la recomendación de usar la época de menor NLL como política mejor calibrada para RL.

## Capacidades

- Predicción de acciones robóticas discretas en el entorno LIBERO: 15 tokens (`MV_*` x6, `RT_*` x6, `GRASP`, `RELEASE`, `DONE`).
- Procesamiento conjunto de imagen y texto (VLM) para responder a la pregunta de acción de d1-showharness.
- Ajuste fino completo y variantes LoRA del mismo esquema de tarea.
- Evaluación reproducible por época con métricas de calibración (NLL), precisión top-1 y macro recall.
- Punto de partida para RL posterior sobre políticas VLA discretas.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo general; el modelo está especializado en la tarea de control.

## Casos de uso

- Investigación en VLA discretos sobre LIBERO: usar `d1-3b-full/epoch3` como línea base reproducible para comparar nuevas políticas o esquemas de tokenización de acciones, gracias a los logs por época publicados.
- Inicialización para RL: el checkpoint de menor NLL (época 3) está pensado explícitamente como política bien calibrada desde la que arrancar entrenamiento por refuerzo con el código de d1-showharness-rl.
- Estudio de calibración en políticas robóticas: la comparación entre épocas (top-1 alto con NLL creciente) permite analizar sobreconfianza en modelos de acción discretos.
- Reproducción de experimentos: el repositorio incluye código de carga exacto y tablas por época, lo que facilita replicar resultados en el mismo split de validación por episodios.
- Comparación de arquitecturas base: las variantes d1-3B y Qwen3.5-2B permiten estudiar cómo afecta el modelo base (3B frente a 2B, full fine-tune frente a LoRA) al rendimiento en la misma tarea.
- Prototipado de pipelines de evaluación offline: integrar el modelo en un bucle que consuma observaciones de LIBERO y emita tokens discretos para medir precisión y macro recall antes de desplegar en simulación.

## Benchmarks y rendimiento

Resultados sobre el split de validación retenido (episodios completos), según la model card:

| Modelo | Épocas | Mejor NLL (época) | Mejor acc (época) | Mejor macro recall (época) | Recomendado |
|---|---|---|---|---|---|
| d1-3B full fine-tune | 8 | 0,4425 (3) | 0,8534 (8) | 0,7929 (4) | `d1-3b-full/epoch3` |
| d1-3B LoRA (no subido) | 5 | 0,4420 (5) | 0,8416 (5) | 0,7884 (4) | `d1-3b-lora/epoch5` |
| Qwen3.5-2B LoRA (no subido) | 3 | 0,4781 (3) | 0,8241 (3) | 0,7707 (3) | `qwen3.5-2b-lora/epoch3` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son específicas de la tarea LIBERO.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 3B parámetros; en bfloat16 requiere aproximadamente 6-7 GB solo para pesos, más activaciones y la torre de visión. No se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la información; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) debería ser suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) y en tarjetas de 16 GB; no confirmado por el autor.
- Opciones de despliegue: carga vía `transformers` con `trust_remote_code=True` y `safetensors`; el autor no documenta vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos publicado es safetensors, no GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en LIBERO (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1sh-libero-simple (d1-3B full) | 3B | no disponible | acc 0,8534; NLL 0,4425; macro recall 0,7929 | LFM Open License v1.0 | Pesos publicados (safetensors) |
| d1sh-libero-simple (d1-3B LoRA) | 3B | no disponible | acc 0,8416; NLL 0,4420; macro recall 0,7884 | LFM Open License v1.0 | No subido todavía |
| d1sh-libero-simple (Qwen3.5-2B LoRA) | 2B | no disponible | acc 0,8241; NLL 0,4781; macro recall 0,7707 | Apache-2.0 | No subido todavía |

No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo emite los 15 tokens de acción de d1-showharness en LIBERO; no es un asistente general ni un VLM de propósito amplio.
- Dependencia del harness: la formulación de la pregunta de acción y el esquema de tokens son específicos de d1-showharness, por lo que reutilizarlo fuera de ese pipeline requiere adaptación.
- Calibración: las épocas con mayor top-1 pueden tener peor NLL por sobreconfianza; el autor recomienda la época de menor NLL para RL, no la de mayor precisión.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto, lo que limita evaluar su comportamiento fuera de la tarea.
- Licencia: los checkpoints sobre d1-3B heredan la LFM Open License v1.0, con posibles restricciones para uso comercial; los de Qwen3.5-2B son Apache-2.0. Verificar antes de uso en producción.
- Riesgo de sobreajuste al simulador: los resultados provienen de validación en LIBERO (simulación); no hay evidencia de transferencia a robots reales.
- Estado del repositorio: las variantes LoRA están anunciadas pero no subidas; solo el full fine-tune está disponible.
- Sin benchmarks estándar publicados, la comparación con otros modelos queda limitada a las métricas internas de la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/d1sh-libero-simple
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/libero-discrete-tokens
- Código (rama `hyeonmo/libero`): https://github.com/JunHoo-Lee/d1-showharness-rl/tree/hyeonmo/libero
- Modelo base LiquidAI/d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Licencia del modelo base: https://huggingface.co/LiquidAI/d1-3B/blob/main/LICENSE
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
