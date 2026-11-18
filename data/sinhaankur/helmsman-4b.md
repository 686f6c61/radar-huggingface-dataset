# sinhaankur/helmsman-4b

## Resumen

helmsman-4b es un modelo de lenguaje de 4.022 millones de parámetros derivado de Qwen/Qwen3-4B-Instruct-2507 mediante un proceso de destilación con QLoRA y posterior fusión de los pesos del adaptador en el modelo base. Lo desarrolla el usuario sinhaankur y está concebido como un especialista en responder preguntas ancladas a un conjunto documental reducido, en concreto el demonio de inferencia local Unhosted. No es un modelo de propósito general: su valor está en el despliegue en dispositivo (on-device) con un tamaño manejable y una ventana de contexto heredada de 262.000 tokens.

El modelo se entrenó con 305 pares sintéticos (prompt, respuesta) generados por un profesor Claude de clase Opus, con una receta QLoRA de rango 16 y alpha 32 sobre proyecciones de atención y MLP, seguida de fusión. Se distribuye en safetensors fp16 (unos 8 GB) y en un GGUF Q4_K_M de aproximadamente 2,5 GB, lo que permite ejecutarlo en un portátil con llama.cpp u Ollama.

Es relevante ahora porque ejemplifica un patrón de especialización barata y reproducible (entrenamiento de unos 30 minutos en Apple Silicon) sobre un modelo base moderno, con licencia AGPL-3.0-or-later heredada. La contrapartida es un alcance muy acotado: fuera de su dominio documental no supera al modelo base y no fue entrenado para tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3, modelo base Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantización | fp16 (safetensors), Q4_K_M (GGUF); base entrenada en 4-bit NF4 durante QLoRA |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors (fp16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros en su variante Instruct no-thinking, con una ventana de contexto de 262.000 tokens. Sobre esa base se aplicó un ajuste supervisado (SFT) con QLoRA: el modelo base se cargó en 4-bit NF4 con dtype de cómputo bf16 y doble cuantización, y se entrenaron adaptadores LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP. El entrenamiento usó 3 épocas, tasa de aprendizaje 2e-4, batch efectivo de 16, schedule coseno y 5 % de warmup, con semilla 42 para reproducibilidad. Posteriormente el adaptador se fusionó en los pesos base y se exportó a GGUF.

Los datos de entrenamiento consisten en 305 pares (prompt, respuesta) sintéticos generados con un profesor Claude de clase Opus, una completion de chat por documento fuente del proyecto Unhosted. No se aplicó RLHF ni DPO. La receta de generación de datos (`gen_data.py`) y entrenamiento (`train.py`) reside en el repositorio del proyecto Unhosted, aunque el `train.jsonl` crudo no se distribuye en el repositorio del modelo. No se documentan innovaciones arquitectónicas propias más allá de la fusión del adaptador; el modelo conserva la plantilla de chat de Qwen3-Instruct no-thinking, lo que obliga a ajustar la plantilla en Ollama para evitar respuestas vacías.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas ancladas al conjunto documental de entrenamiento.
- Respuesta a preguntas fundamentadas (grounded QA) sobre los documentos del dominio Unhosted.
- Resumen y síntesis de documentos del corpus de entrenamiento.
- Ejecución local en dispositivo con cuantización Q4_K_M (aproximadamente 2,5 GB).
- Compatibilidad con transformers, llama.cpp, Ollama y text-generation-inference.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no entrenado para ello.
- Modo thinking: no; es una variante Instruct no-thinking.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente local de documentación del demonio Unhosted: el modelo responde preguntas sobre los documentos del proyecto con los que fue destilado, ejecutándose en un portátil en 4-bit sin conexión a red.
- Resumen de documentos técnicos del corpus: dada su ventana de 262K tokens heredada, puede ingerir documentos largos y sintetizar sus puntos clave, aunque su calidad óptima se limita al dominio entrenado.
- Demostración de destilación reproducible: sirve como ejemplo práctico de pipeline QLoRA + fusión + exportación GGUF para equipos que quieran especializar un modelo base pequeño con pocos datos sintéticos.
- Prototipado de asistentes on-device: al caber en un portátil con Q4_K_M, permite validar flujos de chat local antes de invertir en modelos mayores.
- Evaluación de técnicas de cuantización: el par fp16/Q4_K_M permite comparar degradación de calidad en un modelo de 4B con contexto largo.
- Base para experimentos de ajuste adicional: al ser un modelo fusionado y autónomo, se puede reajustar con nuevos datos sin gestionar adaptadores separados.
- Filtrado y respuesta en pipelines de documentación interna: integrable vía llama.cpp u Ollama en scripts que consulten un corpus fijo.

## Benchmarks y rendimiento

| Métrica | Este modelo |
|---|---|
| LLM-as-judge (escala 0-46) | 32,5 / 46 |
| Normalizado | 71 % |

El conjunto de evaluación son 46 prompts reservados generados con una semilla distinta a la de entrenamiento, de modo que el entrenador nunca los vio. La evaluación mide únicamente QA fundamentado en distribución; no hay resultados publicados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 8 GB para los pesos, más overhead de activaciones y KV cache; se recomienda 12-16 GB para contexto moderado.
- VRAM estimada en Q4_K_M: aproximadamente 2,5-3 GB, apta para GPU de consumo y para CPU.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para fp16 con contexto largo; cualquier GPU con 8 GB o más para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares con Q4_K_M; en fp16 requiere al menos 8-12 GB.
- Opciones de despliegue: transformers (fp16), llama.cpp (`llama-cli -hf`), Ollama (con plantilla personalizada para evitar respuestas vacías), text-generation-inference.
- Latencia y throughput: no disponibles; el autor solo indica que el entrenamiento tardó unos 30 minutos por ejecución en Apple Silicon en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| helmsman-4b | 4,02B | 262K | AGPL-3.0-or-later | Especialista destilado en dominio Unhosted | Hugging Face (safetensors + GGUF) |
| Qwen3-4B-Instruct-2507 | 4B | 262K | según modelo base | Propósito general, Instruct no-thinking | Hugging Face |
| Modelos de 4B ajustados con QLoRA (genéricos) | ~4B | variable | variable | Especialización ligera | Hugging Face |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base, respecto al cual el autor afirma que helmsman-4b no mejora en chat abierto no relacionado con los documentos de entrenamiento.

## Limitaciones y advertencias

- Fuera de su dominio documental, el modelo no supera al base Qwen3-4B-Instruct-2507 en chat abierto.
- No fue entrenado para tool calling ni function calling; su uso en agentes requiere otro modelo.
- Es una destilación: los modos de fallo del profesor Claude y los defectos de sus salidas se transmiten al alumno.
- No apto para aplicaciones críticas de seguridad.
- Entrenado únicamente en inglés; el soporte multilingüe es limitado.
- Riesgo de alucinación en preguntas fuera del corpus de entrenamiento.
- Licencia AGPL-3.0-or-later: impone obligaciones de copyleft para uso en red y comercial; revisar compatibilidad antes de producción.
- La plantilla de chat de Ollama debe ajustarse manualmente (o usar los ficheros `template` y `params` del repo) para evitar respuestas vacías en la variante Instruct.
- El conjunto de evaluación es pequeño (46 prompts) y solo mide QA en distribución; no hay benchmarks estándar publicados.
- El `train.jsonl` crudo no se distribuye, lo que limita la reproducibilidad completa del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinhaankur/helmsman-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Unhosted (receta de destilación): https://github.com/unhosted-ai
