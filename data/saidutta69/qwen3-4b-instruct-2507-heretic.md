# saidutta69/Qwen3-4B-Instruct-2507-heretic

## Resumen

Qwen3-4B-Instruct-2507-heretic es una variante "abliterated" (decensurada) del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario saidutta69 (bajo el alias "RACER IS OP"). Se ha generado con la herramienta Heretic v1.4.0, que aplica ablación direccional sobre los pesos del modelo base para eliminar el comportamiento de rechazo (refusal) sin recurrir a fine-tuning. El resultado es un transformer denso de 4.022 millones de parámetros que conserva el ajuste de instrucciones, tool calling y contexto largo de la edición 2507 de Qwen3, pero sin las negativas del modelo original.

El modelo base Qwen3-4B-Instruct-2507 es la versión "non-thinking" de la familia Qwen3, es decir, no genera trazas de razonamiento antes de responder, lo que reduce la latencia por token y lo hace adecuado para bucles de tool calling, extracción estructurada y andamiaje de agentes. Esta variante hereda esas características y añade la supresión de rechazos: según la model card, las negativas en un conjunto de evaluación dañino caen de 100/100 a 3/100, con una divergencia KL de 0.0958 respecto al original.

Es relevante ahora porque ofrece un modelo de 4B con ventana de contexto de 256K, cuantizaciones GGUF completas y ejecución viable en GPU de consumo e incluso en CPU, lo que lo sitúa en el nicho de modelos locales pequeños para desarrolladores que priorizan velocidad y control sobre el contenido generado, asumiendo el coste de fidelidad que implica la edición por ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3, `qwen3`) |
| Parametros totales | 4.022.468.096 (4.02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (GGUF); BF16 en safetensors |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, en su variante Instruct-2507 "non-thinking": no emite trazas de razonamiento y devuelve tokens directamente tras el prompt. Sobre ese modelo base, el autor aplicó ablación direccional ("abliteration") con Heretic v1.4.0, un proceso que identifica las direcciones de peso responsables del comportamiento de rechazo y las edita selectivamente en las proyecciones de salida de atención (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`), sin reentrenar el resto de la red. Los parámetros de la edición corresponden al ensayo 172 de una ejecución de 200 ensayos con semilla `2540954398`, e incluyen un `direction_index` único de 19.46 en lugar de uno por capa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card no los detalla. La innovación técnica destacable es precisamente el método de edición: al no hacer fine-tuning sobre una persona "servicial", se evita el deterioro de coherencia que suele acompañar a ese enfoque, y el ajuste 2507 de instrucciones y tool use se mantiene en gran medida intacto. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio de Optuna y sumas SHA-256, lo que permite regenerar el modelo de forma determinista con `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generación de texto conversacional multi-turno en nueve idiomas (en, zh, ja, ko, de, fr, es, pt, ru).
- Seguimiento de instrucciones sin sobrecarga de razonamiento (edición non-thinking), con menor latencia por token.
- Tool calling y function calling, orientado a bucles de agentes y extracción estructurada.
- Razonamiento de varios pasos y andamiaje de agentes, según los tags del autor.
- Generación de código y tareas de programación (tag `coding`).
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones prolongadas.
- Comportamiento de rechazo suprimido: responde a peticiones que el modelo base rechazaría.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Ejecución local en GPU de consumo y CPU mediante GGUF.

## Casos de uso

- Atención al cliente automatizada: con 256K tokens de contexto puede mantener conversaciones multi-turno largas y recuperar información de historiales extensos sin truncar, y su naturaleza non-thinking reduce la latencia en respuestas interactivas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o transformar código, con la ventaja de que un 4B cuantizado a Q4_K_M ocupa 2.33 GB y cabe en GPUs de 8 GB.
- Extracción estructurada de datos: al devolver tokens directamente sin trazas de razonamiento, es adecuado para tareas de parsing y salida en JSON sobre documentos largos, donde la latencia por token importa.
- Andamiaje de agentes locales: su tamaño permite ejecutarlo en la misma máquina que orquesta el agente, y el tool calling facilita encadenar llamadas a APIs y funciones del sistema.
- Asistente de escritura y roleplay sin restricciones: el autor lo orienta explícitamente a roleplay y conversación, con los rechazos prácticamente eliminados, útil para prototipos creativos y narrativa interactiva.
- Procesamiento de documentación multilingüe: cubre nueve idiomas y contexto largo, lo que permite resumir o clasificar corpus en inglés, chino, japonés, coreano, alemán, francés, español, portugués y ruso.
- Despliegue en hardware modesto: con GGUF Q4_K_M (2.33 GB) corre en CPU y Apple Silicon, lo que habilita prototipos y demos en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

La model card solo publica dos métricas comparativas frente al modelo original:

| Métrica | Este modelo | Qwen/Qwen3-4B-Instruct-2507 |
|---|---|---|
| Divergencia KL | 0.0958 | 0 (por definición) |
| Rechazos (conjunto dañino) | 3/100 | 100/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, tamaño nativo 4.02B; añadir ~1 GB por cada 32K de contexto):
  - Q8_0: 3.99 GB
  - Q6_K: 3.08 GB
  - Q5_K_M: 2.69 GB
  - Q4_K_M: 2.33 GB
  - IQ4_XS: 2.16 GB
  - F16: 7.50 GB
- GPU recomendadas según la matriz del autor:
  - RTX 4090 / 5090 (24 GB): Q8_0
  - RTX 4080 / 5080 / 4060 Ti 16G (16 GB): Q6_K
  - RTX 3060 / 4070 / 5070 (12 GB): Q5_K_M
  - RTX 4060 / 3070 (8 GB): Q4_K_M
  - GTX 1660 Super / 2060 / 3050 laptop (6 GB): IQ4_XS
- Cabe en GPU de consumo desde 6 GB de VRAM con cuantización IQ4_XS, y en CPU o Apple Silicon con Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3-4B-Instruct-2507-heretic`), Ollama, LM Studio, Jan, transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-heretic | 4.02B | 256K | Apache 2.0 | Variante abliterated; rechazos 3/100; KL 0.0958 |
| Qwen/Qwen3-4B-Instruct-2507 | 4.02B | 256K | Apache 2.0 | Modelo base; rechazos 100/100; sin edición de pesos |
| Alternativas abliterated de 4B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La edición por ablación con KL 0.0958 es de fidelidad moderada: cabe esperar mayor deriva en tono y formato que en modelos de KL bajo, aunque el ajuste de instrucciones y tool use se conserva según el autor.
- La supresión de rechazos implica que el modelo puede generar contenido dañino, ofensivo o inseguro; no es adecuado para despliegues públicos sin filtros externos de moderación.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de veracidad.
- No se dispone de información sobre sesgos conocidos más allá de los del modelo base.
- El contexto de 256K requiere memoria adicional (~1 GB por cada 32K) y puede degradar la calidad en ventanas muy largas; no se han publicado evaluaciones de recuperación en contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado.
- La fecha de creación del repositorio (2026-10-04) y la falta de benchmarks estándar limitan la validación independiente del rendimiento.
- El modelo es non-thinking: no genera trazas de razonamiento, por lo que tareas que se beneficien de cadena de pensamiento explícita pueden rendir peor que la variante thinking de Qwen3.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/Qwen3-4B-Instruct-2507-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
