# Lucasgitguy-co/K2-Horizon-0.9B-System1

## Resumen

K2-Horizon-0.9B-System1 es un ajuste fino (fine-tune) del modelo de razonamiento IFM/K2-Horizon-0.9B, desarrollado por el usuario Lucasgitguy-co. El modelo base escribe un bloque extenso de razonamiento `<ifm|think>` antes de cada respuesta y su model card original recomienda hasta 32K tokens de salida. Esta variante implementa un modo "System 1": responde de forma directa, sin bloque de pensamiento, y solo muestra una o dos lineas de desarrollo cuando la tarea lo requiere.

La innovacion principal es la fusion de los dos modos de razonamiento. Mediante autodestilacion (System 2 a System 1) y una tecnica de fusion de modos de pensamiento al estilo Qwen3, el modelo conserva la capacidad de razonar cuando se le pide, pero por defecto responde con mucha menos verbosidad. En matematicas utiliza aproximadamente 5 veces menos tokens que el modelo base en modo sin pensamiento, manteniendo la misma precision en MATH-500.

El modelo tiene 1.078.285.824 parametros (aproximadamente 0.9B, de ahi su nombre comercial), se distribuye en safetensors con licencia Apache 2.0 y esta pensado para entornos con recursos limitados: todo el proceso de entrenamiento se ejecuto en un MacBook Air M4 con 16 GB de RAM usando MLX. Es relevante ahora porque demuestra que es posible obtener respuestas rapidas y concisas de un modelo de razonamiento pequeno sin sacrificar precision en tareas matematicas, un paso hacia despliegues de bajo coste y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (k2_horizon, atencion estandar, RoPE con YaRN x16) |
| Parametros totales | 1.078.285.824 (aprox. 1.08B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la model card menciona prompts de hasta 16.8K tokens en pruebas de paridad y un limite de salida de 2.048 tokens en evaluacion, y 32K de salida recomendados para el modelo base |
| Tipos de cuantizacion | safetensors en bfloat16 (repo principal); variantes MLX 8-bit y 4-bit; GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); MLX (8-bit, 4-bit); GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con 28 capas, segun se detalla en el proceso de entrenamiento (LoRA aplicado a todas las proyecciones de atencion y MLP de las 28 capas). El codigo `k2_horizon` con la configuracion liberada se comporta como un Llama estandar con RoPE escalado mediante YaRN x16. Se verifico la paridad de logits entre la implementacion MLX y el codigo remoto original de Transformers en fp32: diferencia maxima absoluta de 2.4e-4 sobre un prompt de 16.8K tokens y 100% de coincidencia en top-1.

El entrenamiento sigue el metodo de autodestilacion descrito en "Distilling System 2 into System 1" (Yu et al., 2024), combinado con la fusion de modos de pensamiento al estilo Qwen3. El profesor fue el propio modelo base respondiendo a prompts del split de entrenamiento con `reasoning_effort="high"` y hasta 8K tokens de pensamiento; solo se conservaron respuestas verificadas (matematicas contra la solucion correcta, codigo que pasa sus tests, instrucciones que superan los comprobadores de restricciones). Los objetivos de entrenamiento se componen de aproximadamente un 85% de ejemplos System 1 (bloque de pensamiento vacio seguido de la respuesta final del profesor) y un 15% con el pensamiento completo, para preservar el modo de alto esfuerzo. Se aplico LoRA de rango 16, escala 2, sobre todas las proyecciones de atencion y MLP de las 28 capas, con learning rate 1e-4, schedule coseno, 2 epocas y perdida solo sobre tokens del asistente; posteriormente se fusionaron los pesos. El conjunto de datos final tiene 142 ejemplos (134 de entrenamiento, 8 de validacion, mayoritariamente matematicos). Se probaron dos variantes adicionales (anadir 1.000 respuestas autodestiladas sin pensamiento, y una fusion 50/50 de pesos) que obtuvieron peores resultados medios y no se publicaron.

## Capacidades

- Generacion de texto conversacional en ingles con respuestas directas por defecto (modo System 1, sin bloque de pensamiento).
- Razonamiento matematico con verificacion de soluciones (precision del 71.5% en GSM8K y 45.0% en MATH-500 en modo sin pensamiento, con 5 veces menos tokens que el base).
- Generacion de codigo (48.2% en HumanEval+ en modo sin pensamiento).
- Seguimiento de instrucciones con restricciones verificables (47.0% en IFEval strict).
- Modos de razonamiento configurables mediante el parametro `reasoning_effort`: `none` (por defecto), `low`, `medium` y `high`; el modo `high` reactiva el bloque de pensamiento completo.
- Capacidad de mostrar una o dos lineas de desarrollo cuando la tarea lo requiere, sin bloque de pensamiento completo.
- Soporte de plantilla de chat (`apply_chat_template`) con formato de roles user/assistant.
- Capacidades multilingues: solo ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada de baja latencia: el modo System 1 responde de inmediato sin generar bloques de razonamiento largos, lo que reduce el tiempo hasta el primer token util y el coste por respuesta en conversaciones multi-turno en ingles.
- Tutoria matematica interactiva: con 71.5% en GSM8K y respuestas de 183 tokens medianos, el modelo puede resolver problemas aritmeticos escolares mostrando un desarrollo breve, adecuado para interfaces educativas donde el alumno necesita ver el razonamiento sin esperar.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo produce codigo funcional (48.2% en HumanEval+) y puede ejecutarse en un portatil con 16 GB de RAM en formato MLX 4-bit, lo que permite integrarlo en editores o scripts locales sin GPU dedicada.
- Clasificacion y transformacion de texto con instrucciones estrictas: el 47.0% en IFEval strict permite usarlo en pipelines de extraccion de datos o formateo de salida donde se requiere cumplir restricciones de formato, con la ventaja de que no malgasta tokens en pensamiento.
- Prototipado rapido de asistentes conversacionales: el modelo cabe en consumer GPU y en Apple Silicon, por lo que sirve para validar flujos de chat y plantillas antes de escalar a modelos mayores, usando el mismo formato de chat.
- Razonamiento de alto esfuerzo bajo demanda: para problemas matematicos dificiles, activar `reasoning_effort="high"` recupera el bloque de pensamiento completo (12/15 en MATH-500 frente a 11/15 en modo System 1 en la prueba con 15 items), util en herramientas de resolucion de problemas paso a paso.
- Despliegue en dispositivos edge: las variantes GGUF Q4_K_M y MLX 4-bit permiten ejecutar el modelo en llama.cpp, Ollama o LM Studio en hardware de gama media, adecuado para demos offline y aplicaciones de escritorio.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 684 prompts retenidos, temperatura 0.6, top-p 0.95, limite de 2.048 tokens y una muestra por prompt. Todas las filas corresponden al modo sin pensamiento (`reasoning_effort="none"`).

| Modelo | GSM8K (200) | MATH-500 (100) | HumanEval+ (164) | IFEval strict (200) | Chat (20) |
|---|---:|---:|---:|---:|---:|
| K2-Horizon-0.9B, no-think | 68.5 | 45.0 | 51.8 | 52.0 | 100 |
| K2-Horizon-0.9B-System1 | 71.5 | 45.0 | 48.2 | 47.0 | 100 |

Tokens de salida medianos:

| Modelo | GSM8K | MATH-500 | HumanEval+ | IFEval | Chat |
|---|---:|---:|---:|---:|---:|
| K2-Horizon-0.9B, no-think | 322 | 1.580 | 219 | 105 | 36 |
| K2-Horizon-0.9B-System1 | 183 | 317 | 161 | 215 | 113 |

Verificacion del modo System 2 (high effort, 30 prompts matematicos, limite de 6.144 tokens): GSM8K 14/15 en ambos modelos; MATH-500 12/15 en el base frente a 11/15 en el fine-tune; tokens medianos de salida 970 en el base frente a 857 en el fine-tune. El autor advierte que las muestras son pequenas: una porcion de 100 items de MATH-500 tiene aproximadamente mas o menos 5 puntos de ruido. Tambien se reporta que las fugas de etiquetas `<ifm|think>` bajan de 72 a 3 respuestas sobre 684, y las truncaciones por limite de tokens del 9.5% al 2.9%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.2 GB en bfloat16 (tamano del repo), alrededor de 1.1 GB en MLX 8-bit y unos 0.6 GB en MLX 4-bit o GGUF Q4_K_M (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060 o superiores para bfloat16 sin problemas. En el extremo profesional, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en consumer GPU: si, en practicamente cualquier GPU dedicada moderna y en Apple Silicon. El entrenamiento completo se ejecuto en un MacBook Air M4 con 16 GB.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), MLX (mlx-lm, variantes 8-bit y 4-bit), llama.cpp, Ollama y LM Studio mediante los GGUF Q8_0 y Q4_K_M.
- Latencia y throughput estimados: no disponibles de forma explicita; la reduccion de tokens medianos de salida (por ejemplo, de 1.580 a 317 en MATH-500) implica una mejora proporcional en latencia para esas tareas, pero no se publican medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K2-Horizon-0.9B-System1 | 1.08B | no disponible | 71.5 | 45.0 | Apache 2.0 | Hugging Face (safetensors, MLX, GGUF) |
| K2-Horizon-0.9B (base, no-think) | 1.08B | no disponible | 68.5 | 45.0 | no disponible en la informacion | Hugging Face |
| Otros modelos de ~1B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks de otros modelos de tamano similar en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- El conjunto de entrenamiento es muy pequeno (142 ejemplos, mayoritariamente matematicos), lo que limita la generalizacion a otros dominios y aumenta el riesgo de sobreajuste a tareas aritmeticas.
- En HumanEval+ y en IFEval strict el fine-tune rinde peor que el modelo base en modo sin pensamiento (48.2 frente a 51.8 y 47.0 frente a 52.0), por lo que la mejora no es uniforme entre tareas.
- Los benchmarks se calcularon con muestras pequenas (100 items en MATH-500, 20 prompts de chat), con un margen de error de aproximadamente mas o menos 5 puntos en MATH-500; los resultados deben interpretarse con cautela.
- En problemas matematicos dificiles, el modo System 1 es claramente inferior al modo de alto esfuerzo; el autor recomienda usar `reasoning_effort="high"` en esos casos.
- Riesgo de alucinacion inherente a un modelo de 1B parametros; no se documentan evaluaciones de veracidad ni de sesgos.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base IFM/K2-Horizon-0.9B debe verificarse por separado para confirmar compatibilidad de licencias en produccion.
- Requiere `trust_remote_code=True` por el codigo personalizado `k2_horizon`, lo que implica ejecutar codigo remoto no auditado en el entorno de despliegue.
- El modelo base esta pensado para generar hasta 32K tokens de salida en modo pensamiento; el fine-tune no cambia ese limite, pero el uso por defecto (System 1) esta calibrado con un tope de 2.048 tokens en las evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Variante MLX 8-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-4bit
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Lucasgitguy-co/k2-horizon-system1-distill
- Paper de referencia (Distilling System 2 into System 1, Yu et al., 2024): https://arxiv.org/abs/2407.06023
