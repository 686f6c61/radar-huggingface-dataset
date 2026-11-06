# hdxsfbr/qwen3-1.7b-chess-coach-hints

## Resumen

`hdxsfbr/qwen3-1.7b-chess-coach-hints` es un adaptador LoRA (entrenado con QLoRA y la librería Unsloth) sobre el modelo base `unsloth/Qwen3-1.7B`. Lo desarrolla el usuario de Hugging Face hdxsfbr y su propósito es muy específico: convertir a Qwen3-1.7B en un "entrenador de ajedrez que solo da pistas". Cuando el usuario pregunta qué jugar en su posición (o cualquier pregunta que identificaría la jugada), el modelo responde con una pista de como máximo dos frases que no nombra ni describe la jugada, independientemente de cómo se formule la pregunta e incluso después de terminada la partida. Cualquier otra pregunta de ajedrez se responde de forma completa, incluyendo casillas y movimientos.

Se trata, por tanto, de un ajuste de comportamiento (behavior fine-tuning) más que de un ajuste de conocimiento: el modelo base ya sabe jugar al ajedrez, y el adaptador impone una restricción de conducta falsable. El adaptador ocupa 0,2 GB en el repositorio y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Está pensado para integraciones educativas o de práctica de ajedrez donde se quiere evitar que el asistente "sople" la jugada.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy concreto de adaptadores PEFT de bajo coste sobre modelos pequeños; por otro, sirve como ejemplo de cómo un ajuste de comportamiento puede medirse objetivamente (el autor incluye un script de evaluación contra el modelo base). No hay información publicada sobre benchmarks de rendimiento del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre las proyecciones de atención y MLP |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B); el adaptador LoRA añade un número no especificado de parámetros entrenables (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la model card; la configuración de entrenamiento usa `max_seq_length` de 2048 y el ejemplo de uso carga con `max_seq_length=8192` |
| Tipos de cuantizacion | El adaptador se entrenó sobre el modelo base cuantizado en 4 bits (`load_in_4bit: true`, `unsloth-bnb-4bit`); el ejemplo de uso también emplea `load_in_4bit=True`. No se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. El ajuste es un QLoRA: el modelo base se carga en 4 bits y se entrenan adaptadores de bajo rango (r=16, alpha=16, dropout=0) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se hizo con Unsloth, `trl` y `peft` sobre una NVIDIA GeForce RTX 4090, con `max_seq_length` de 2048, 2 épocas, batch efectivo de 8 (batch 2 × grad_accum 4), learning rate 2e-4, optimizador `adamw_8bit`, scheduler lineal y semilla 3407. Se entrenaron solo las respuestas (`responses_only: true`) usando la plantilla de chat de Qwen3 con `thinking` desactivado.

Los datos de entrenamiento son un fichero `train.jsonl` de 1298 filas (con hash sha256 fijado en la model card), orientado a imponer el comportamiento de "solo pistas". El entrenamiento duró 326 pasos y terminó con una pérdida de entrenamiento final de 1,2576. La innovación técnica principal no está en la arquitectura sino en el objetivo: un ajuste de comportamiento falsable con evaluación comparativa contra el modelo base mediante un juez externo (`eval.py --judge`). El autor fija versiones exactas del modelo base, los datos y el código para reproducibilidad.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen3-1.7B.
- Conocimiento de ajedrez: responde preguntas completas sobre posiciones, casillas y movimientos cuando la pregunta no revela directamente la jugada a realizar.
- Comportamiento de "solo pistas": ante preguntas del tipo "¿qué juego aquí?" responde con una pista de como máximo dos frases que no nombra ni describe la jugada, incluso si se insiste o la partida ya ha terminado.
- Resistencia a reformulaciones: el comportamiento se mantiene "sin importar cómo pregunte el usuario", según la model card.
- Multilingüe: limitado al inglés según los metadatos del modelo.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo `thinking` de Qwen3 se desactiva en el uso recomendado.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo thinking activo).

## Casos de uso

- Entrenador de ajedrez interactivo: el modelo recibe una posición en notación estándar y devuelve una pista pedagógica (por ejemplo, sobre debilidades estructurales o piezas mal situadas) sin revelar la jugada concreta, lo que obliga al alumno a razonar.
- Práctica guiada para principiantes: integrado en una app de ajedrez, el asistente responde dudas generales (reglas, táctica, finales) con detalle y solo limita la respuesta cuando la pregunta pide directamente la jugada.
- Evaluación de comportamiento en investigación: sirve como caso de estudio reproducible de behavior fine-tuning, con datos, semilla y script de evaluación fijados, para medir la robustez de una restricción de conducta frente a reformulaciones.
- Generación de material didáctico: a partir de una posición, producir pistas en inglés para hojas de ejercicios o puzzles, sin incluir la solución.
- Filtro o capa de moderación en asistentes de ajedrez: desplegar el adaptador como variante "modo entrenador" de un asistente mayor, activándolo solo en contextos educativos.
- Pruebas de robustez y red teaming: usar el adaptador como banco de pruebas para estudiar cómo un modelo pequeño responde a intentos de jailbreak orientados a extraer la jugada.
- Prototipado rápido en local: al ser un adaptador de 0,2 GB sobre un modelo de 1,7B, permite experimentar en una sola GPU consumer con cuantización 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un script de evaluación (`eval.py`) que compara el adaptador con el modelo base usando un juez externo, pero no incluye los resultados numéricos de esa evaluación. El único dato de rendimiento reportado es la pérdida de entrenamiento final (1,2576 en 326 pasos), que no es comparable con benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: con cuantización 4 bits, el modelo base de 1,7B ocupa aproximadamente 1-1,5 GB de pesos; el adaptador añade una cantidad marginal. En la práctica, cabe holgadamente en GPUs con 4-6 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; también tarjetas de datacenter (A100, H100) aunque sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con al menos 4-6 GB de VRAM, especialmente con cuantización 4 bits.
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=True`). Al ser un adaptador PEFT estándar, también puede cargarse con `transformers` + `peft`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no hay una ruta directa a llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una RTX 4090, lo que da una idea del hardware de referencia, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hdxsfbr/qwen3-1.7b-chess-coach-hints | 1,7B (base) + LoRA | no especificado (entrenado a 2048, ejemplo a 8192) | Entrenador de ajedrez con pistas | Apache 2.0 | Hugging Face (adaptador PEFT) |
| unsloth/Qwen3-1.7B (modelo base) | 1,7B | no disponible en la información | Modelo generalista | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (original de Alibaba) | 1,7B | no disponible en la información | Modelo generalista | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros adaptadores de ajedrez comparables ni sobre benchmarks que permitan una comparación cuantitativa. La comparación con el modelo base es la más relevante: el adaptador no busca mejorar el conocimiento de ajedrez sino imponer una restricción de comportamiento, por lo que su rendimiento debe medirse en términos de cumplimiento del comportamiento (tasa de respuestas que no revelan la jugada) más que en benchmarks de conocimiento.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el comportamiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación: como cualquier modelo de 1,7B, puede producir análisis de ajedrez incorrectos o pistas poco útiles; el adaptador no mejora el conocimiento factual del modelo base.
- Robustez del comportamiento: aunque la model card afirma que la restricción se mantiene ante cualquier formulación, no se publican resultados de evaluación que lo cuantifiquen; conviene validarlo con un conjunto propio antes de usarlo en producción.
- Contexto: la longitud de contexto efectiva no está documentada; el entrenamiento usó 2048 tokens y el ejemplo de uso 8192, pero no se especifica el máximo soportado por el modelo base en esta configuración.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `unsloth/Qwen3-1.7B` y de Qwen3, que también son Apache 2.0 según los metadatos.
- Despliegue: al ser un adaptador PEFT, requiere cargar el modelo base por separado; no hay pesos fusionados ni GGUF publicados, lo que complica el despliegue en entornos sin Python/PyTorch.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos del corpus de entrenamiento de Qwen3.
- Fecha de creación: los metadatos indican 2026-10-29, coherente con las versiones de librerías de la model card (transformers 5.17.0, torch 2.14.1), pero conviene comprobar la vigencia de esas versiones en el momento de la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdxsfbr/qwen3-1.7b-chess-coach-hints
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
- Modelo base cuantizado usado en entrenamiento: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit (revisión `a972f4304f86a0a705d35b378d7a7675d58063a7`)
- Repositorio del proyecto (código de evaluación y datos): no se proporciona URL en la información disponible; la model card referencia el commit `3f500371798c2988802bfef6c635adb9acc5dd60-dirty` y los ficheros `behaviors/chess_coach.py` y `eval.py`
- Paper o blog del autor: no disponible
- Demo: no disponible
