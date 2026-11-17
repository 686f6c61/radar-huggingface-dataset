# Bayhakl1/MiniGrimm

## Resumen

MiniGrimm es un modelo de lenguaje decoder-only de 48,29 millones de parametros (42,00 millones sin contar los embeddings, con pesos atados) desarrollado por el usuario Bayhakl1 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento a pequena escala cuyo objetivo declarado es validar una arquitectura estilo Llama "profunda y estrecha" (28 capas con `d_model=384`) entrenada con el optimizador Muon combinado con AdamW. No es un asistente de proposito general: es una pieza de investigacion para estudiar dinamicas de entrenamiento y estabilidad en regimenes de muy bajo numero de parametros.

El modelo fue preentrenado desde cero con aproximadamente 12.550 millones de tokens procedentes de FineWeb-Edu, Cosmopedia-v2, Wikipedia, corpus de cadenas de razonamiento y matematicas, y datos de chat, y posteriormente ajustado con SFT supervisado con enmascaramiento de perdida solo en turnos del asistente. La ventana de contexto es de tan solo 512 tokens y el tokenizador es un BPE a nivel de byte personalizado de 16.384 entradas, con separacion de digitos individuales para facilitar el calculo aritmetico.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible de entrenamiento con Muon a escala tiny, como banco de pruebas para tecnicas de estabilidad (QK-Norm, logit soft-capping) y como modelo didactico para quienes quieren estudiar el comportamiento de un transformer minimo sin coste de computo significativo. No compite con modelos de produccion ni con asistentes de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, profundo y estrecho (28 capas) |
| Parametros totales | 48.292.736 (~48,29 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (prompt + generacion combinados) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (entrenamiento casi exclusivamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas / dimension oculta | 28 capas, `d_model = 384`, `ffn_hidden = 960` (SwiGLU) |
| Atencion | Grouped-Query Attention (6 cabezas de query, 2 de KV) + QK-Norm |
| Codificacion posicional | RoPE (`theta = 10000.0`) |
| Logit soft-capping | 30.0 |
| Tokenizador | BPE a nivel de byte personalizado, vocabulario 16.384, separacion de digitos individuales |
| Tokens de preentrenamiento | ~12.550 millones |
| Optimizador | Muon + AdamW |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

MiniGrimm emplea un transformer decoder-only con atencion causal, disenado con una relacion profundidad-anchura inusual: 28 capas con una dimension oculta de solo 384 y una capa feed-forward de 960 con activacion SwiGLU. La atencion usa Grouped-Query Attention con 6 cabezas de query y 2 de clave-valor, lo que reduce el coste de memoria del KV cache. Para estabilizar el entrenamiento en esta configuracion se incorporan QK-Norm (normalizacion aplicada a queries y claves antes del producto escalar) y logit soft-capping con valor 30,0. La codificacion posicional es RoPE con theta 10000.0 y los embeddings de entrada y salida estan atados.

El preentrenamiento consumio aproximadamente 12.550 millones de tokens con una mezcla que incluye FineWeb-Edu, Cosmopedia-v2, Wikipedia, corpus de cadenas de pensamiento y matematicas, y datos conversacionales. El optimizador principal fue Muon, combinado con AdamW para los parametros no matriciales. Posteriormente se aplico SFT con enmascaramiento de perdida limitado a los turnos del asistente, sobre datasets como GSM8K, SmolTalk, UltraChat-200k, Tulu-3 SFT personas, No Robots, OpenOrca, WebInstructSub, OpenMathInstruct-2, CoT-Collection, Orca-Math, WildChat-1M, Magpie-Pro, UltraInteract SFT y WizardLM Evol-Instruct. El tokenizador personalizado separa cada digito en un token propio, una decision de diseno orientada a mejorar el razonamiento aritmetico paso a paso en un modelo de este tamano.

## Capacidades

- Generacion de texto conversacional breve en ingles, con soporte de plantilla de chat basada en delimitadores de token unico (`<|system|>`, `<|user|`, `<|assistant|>`, `<|end|>`).
- Aritmetica basica paso a paso: el modelo esta entrenado de forma especifica para resolver operaciones sencillas y problemas verbales de un solo paso, con separacion de digitos en el tokenizador.
- Razonamiento de cadena de pensamiento a corto alcance, heredado del entrenamiento con CoT-Collection y OpenMathInstruct-2.
- Respuesta a preguntas de conocimiento cientifico elemental (rendimiento destacado en SciQ para su tamano).
- Seguimiento de instrucciones simples y formato de respuesta conversacional multi-turno dentro de la ventana de 512 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion sobre el optimizador Muon: MiniGrimm sirve como caso reproducible y de bajo coste para estudiar como se comporta Muon frente a AdamW en arquitecturas profundas y estrechas, comparando curvas de perdida y estabilidad con configuraciones equivalentes.
- Docencia y divulgacion: permite ilustrar en un portatil el ciclo completo de un LLM (tokenizacion, preentrenamiento, SFT, plantilla de chat, decodificacion greedy frente a sampling) sin necesidad de GPU de gama alta.
- Pruebas unitarias de pipelines de inferencia: al ser un modelo de 0,2 GB, es util para validar integraciones con `transformers`, plantillas de chat personalizadas, manejo de `trust_remote_code` y logica de tokens de parada en entornos de CI.
- Evaluacion de tecnicas de estabilidad: QK-Norm y logit soft-capping pueden probarse y ablacionarse en este modelo para medir su impacto en la perdida y en la calidad de generacion a escala tiny.
- Generacion de respuestas aritmeticas de un paso: en tareas acotadas como "3 + 5 - 2", el modelo puede producir la solucion paso a paso con decodificacion greedy, lo que lo hace apto como componente de demostracion en tutoriales de razonamiento.
- Benchmarking de infraestructura ligera: sirve para medir latencia y throughput en CPU, GPUs consumer y entornos embebidos, y para comparar backends de inferencia con un modelo de huella minima.
- Experimentos de destilacion o inicializacion: su arquitectura Llama-like permite usarlo como estudiante en pipelines de destilacion desde modelos mayores o como punto de partida para estudios de scaling a bajo coste.

## Benchmarks y rendimiento

Resultados publicados por el autor tras el SFT:

| Benchmark | Metrica | Resultado |
|---|---|---|
| ArithMark 3.0 | Precision bruta | 38,1% |
| ArithMark 3.0 | Precision normalizada | 38,2% |
| SciQ | Precision bruta | 70,7% (±1,44) |
| SciQ | Precision normalizada | 63,0% (±1,53) |
| PIQA | Precision bruta | 61,7% (±1,13) |
| PIQA | Precision normalizada | 62,0% (±1,13) |
| Winogrande | Precision bruta | 52,4% (±1,40) |
| BoolQ | Precision bruta | 48,6% (±0,87) |
| ARC-Easy | Precision bruta | 48,6% (±1,03) |
| ARC-Easy | Precision normalizada | 43,8% (±1,02) |
| HellaSwag | Precision bruta | 29,1% (±0,45) |
| HellaSwag | Precision normalizada | 31,7% (±0,46) |
| OpenBookQA | Precision bruta | 19,2% (±1,76) |
| OpenBookQA | Precision normalizada | 30,0% (±2,05) |
| ARC-Challenge | Precision bruta | 22,3% (±1,22) |
| ARC-Challenge | Precision normalizada | 27,2% (±1,30) |
| LAMBADA (OpenAI) | Precision bruta | 26,9% (±0,62) |
| LAMBADA (OpenAI) | Perplejidad | 83,15 (±3,71) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (48,29 M de parametros, ~193 MB de pesos) y por debajo de 100 MB en fp16/bf16. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas y dispositivos embebidos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada oficialmente). El modelo esta etiquetado como compatible con text-generation-inference y endpoints, pero no se han publicado pesos en GGUF ni recetas para llama.cpp u Ollama. Dado que usa codigo de modelado personalizado (QK-Norm, logit soft-capping), la conversion a otros formatos requeriria trabajo adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera inferencia en milisegundos en GPU y decenas de milisegundos por token en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MiniGrimm | 48,29 M | 512 | Apache 2.0 | Investigacion, Muon, ingles, aritmetica basica | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache 2.0 | Asistente pequeno de proposito general | Hugging Face |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | Asistente pequeno multilingue | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | LLM pequeno de proposito general | Hugging Face |

La comparacion debe interpretarse con cautela: MiniGrimm es entre 3 y 20 veces mas pequeno que las alternativas listadas, su contexto es de 512 tokens frente a los 2.048 o mas de los otros, y su rendimiento en tareas de conocimiento general (HellaSwag 29,1%, ARC-Challenge 22,3%) esta muy por debajo. Su interes no es competitivo sino metodologico: valida una receta de entrenamiento con Muon en un regimen de parametros donde los modelos de proposito general no suelen publicarse.

## Limitaciones y advertencias

- Escala muy reducida (48,29 M): la memoria factual es practicamente inexistente; el modelo inventara fechas, nombres y datos con seguridad aparente.
- Ventana de contexto de 512 tokens: cualquier prompt o conversacion que la exceda queda fuera del rango entrenado; se recomienda limitar `max_new_tokens` a 100-250.
- Solo ingles: no se ha entrenado en castellano ni en otros idiomas, por lo que su uso fuera del ingles producira resultados degradados.
- Razonamiento limitado: falla en problemas verbales de varios pasos y con numeros grandes; el 38,1% en ArithMark 3.0 refleja esta frontera.
- Riesgo alto de alucinacion en conocimiento general, agravado por el SFT con datos conversacionales diversos.
- Codigo de modelado personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- Sin soporte documentado de tool calling, agentes ni cuantizacion GGUF; la integracion en stacks de produccion exigiria desarrollo adicional.
- Licencia Apache 2.0: permite uso comercial, pero la calidad del modelo lo hace inadecuado para aplicaciones de cara al usuario sin supervision humana.
- Sesgos: no se han publicado analisis de sesgos; al entrenarse sobre corpus web en ingles, es esperable que herede sesgos de genero, culturales y geograficos de dichas fuentes.
- Modelo experimental sin mantenimiento declarado ni versionado posterior; creado y actualizado el 16 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bayhakl1/MiniGrimm
- Perfil del autor: https://huggingface.co/Bayhakl1
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset UltraChat-200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Tulu-3 SFT personas: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset No Robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset OpenOrca: https://huggingface.co/datasets/Open-Orca/OpenOrca
- Dataset WebInstructSub: https://huggingface.co/datasets/TIGER-Lab/WebInstructSub
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset CoT-Collection: https://huggingface.co/datasets/kaist-ai/CoT-Collection
- Dataset Orca-Math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset Magpie-Pro: https://huggingface.co/datasets/Magpie-Align/Llama-3-Magpie-Pro-1M-v0.1
- Dataset UltraInteract SFT: https://huggingface.co/datasets/openbmb/UltraInteract_sft
- Dataset WizardLM Evol-Instruct: https://huggingface.co/datasets/WizardLMTeam/WizardLM_evol_instruct_V2_196k
