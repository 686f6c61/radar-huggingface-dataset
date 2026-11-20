# Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1

## Resumen

Qwen3Loop-0.6B-SFT-Deep-Supervision-v1 es un modelo de generacion de texto de 596.049.920 parametros fisicos (aproximadamente 0.6B) desarrollado por Lordnyx sobre el modelo base Qwen2.5-0.5B-Instruct. Su particularidad es una arquitectura de capas recurrentes ("looped layers") que reutiliza un bloque central de 14 capas tres veces, alcanzando una profundidad logica de 56 capas con solo 28 bloques fisicos. El objetivo declarado es obtener la densidad de razonamiento de un modelo de ~2B parametros dentro de una huella de 0.6B.

El modelo ha sido afinado con SFT sobre 6.324 muestras curadas procedentes de PRIME-RL/Eurus-2-SFT-Data (datos agenticos multi-fase) y open-r1/Mixture-of-Thoughts (cadenas de pensamiento para codigo), anotadas en nueve dimensiones de meta-supervision. Incorpora ademas una sonda de parada adaptativa (`latent_halting_probe.pt`), una cabeza MLP ultraligera entrenada sobre estados de prefill para decidir la profundidad de salida optima, con una precision de clasificacion reportada del 91,5%.

Es relevante ahora porque propone una via de eficiencia estructural (recurrencia de capas y halting dinamico) en lugar de escalado de parametros, y porque distribuye pesos en formatos "unrolled" (grafo de 56 capas) compatibles con llama.cpp, Ollama y LM Studio sin necesidad de forks personalizados. La licencia Apache 2.0 y los 1.748 downloads registrados lo situan como un experimento abierto y reproducible en el nicho de razonamiento recursivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes (LoopSplit): 28 bloques fisicos, pila central (capas 7-20) repetida 3 veces, profundidad logica de 56 capas |
| Parametros totales | 596.049.920 (0,6B fisicos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor recomendado en la model card) |
| Tipos de cuantizacion | Q8_0, F16 (GGUF); pesos PyTorch en safetensors |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,14 GB), GGUF unrolled Q8_0 (1,11 GB) y F16 (2,08 GB), GGUF compacto Q8_0 (0,64 GB) y F16 (1,20 GB), sonda `latent_halting_probe.pt` (0,5 MB) |

Detalles arquitectonicos declarados: `hidden_size: 1024`, `intermediate_size: 3072`, 16 cabezas de atencion. Repositorio de 27,9 GB (incluye todas las variantes y el directorio `engine/`).

## Arquitectura y entrenamiento

La arquitectura es un transformer de 28 bloques dividido en tres segmentos: un prefijo de 7 capas (0-6) calculado una sola vez, una pila central ("miolo") de 14 capas (7-20) ejecutada recurrentemente tres veces (42 pasadas de capa) y un sufijo de 7 capas (21-27) calculado una vez. Esto produce 7 + 14 x 3 + 7 = 56 capas logicas con 28 bloques fisicos, lo que reduce el coste de memoria frente a un modelo denso de profundidad equivalente. El modelo base es Qwen/Qwen2.5-0.5B-Instruct, aunque la model card referencia comparativas con Qwen3-0.6B y mapea la arquitectura GGUF unrolled a `qwen3`.

El entrenamiento consistio en un SFT sobre 6.324 muestras estrictamente filtradas (25,3 MB) de dos fuentes: PRIME-RL/Eurus-2-SFT-Data, orientada a comportamiento agentico multi-fase, y open-r1/Mixture-of-Thoughts, con cadenas de pensamiento para codigo. Las muestras fueron anotadas en nueve dimensiones de meta-supervision con `convaiinnovations/laya` (deep supervision). Se reporta una perdida de validacion de 0,4012 (desde 0,6705) y una perplexity de 1,49 tras 375 pasos, con un consumo estable de 5,58 GB de VRAM en una RTX 3060 de 12 GB. No se menciona RLHF ni DPO en la informacion disponible. La innovacion adicional es la sonda de halting: un MLP entrenado sobre representaciones de prefill que predice la profundidad de salida optima con 91,5% de precision y MSE de 0,0015.

## Capacidades

- Generacion de texto conversacional en ingles y portugues.
- Razonamiento matematico multi-paso: aritmetica modular, ciclos de potencias, deduccion logica.
- Razonamiento recursivo con profundidad dinamica mediante la sonda de halting (seleccion de profundidad de salida por prompt).
- Cadenas de pensamiento (chain-of-thought) entrenadas explicitamente sobre datos de codigo y tareas agenticas.
- Formulacion de algoritmos y estructuras de datos (se reporta resolucion de parentesis balanceados con logica contador O(n) tiempo / O(1) espacio).
- Comportamiento agentico multi-fase derivado del dataset Eurus-2-SFT-Data.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible como funcionalidad separada; el razonamiento se expresa via CoT.

## Casos de uso

- Razonamiento matematico paso a paso en local: el modelo puede resolver problemas de aritmetica modular y ciclos de potencias con cadenas de pensamiento cortas; con `temperature: 0.1` y Q8_0 se ejecuta en GPUs de 12 GB, lo que lo hace util para tutoria o verificacion de ejercicios.
- Asistente de depuracion logica: la profundidad logica de 56 capas y el entrenamiento en CoT permiten abordar acertijos deductivos y comprobacion de hipotesis, escenario en el que la model card reporta ventaja frente a un modelo de 28 capas.
- Generacion de pseudocodigo y formulacion de algoritmos: entrenado sobre Mixture-of-Thoughts, puede producir explicaciones de complejidad temporal y espacial para problemas clasicos (parentesis balanceados, recorridos, etc.) en pipelines de documentacion tecnica.
- Prototipado de agentes multi-paso: los datos agenticos de Eurus-2 permiten encadenar subtareas con contexto de hasta 32.768 tokens, util para automatizaciones ligeras en entornos con recursos limitados.
- Despliegue en CPU o GPU de gama baja: las variantes GGUF compactas (0,64 GB en Q8_0) y unrolled (1,11 GB) encajan en llama.cpp, Ollama y LM Studio, lo que habilita asistentes locales en portatiles sin GPU dedicada.
- Investigacion sobre halting dinamico: la sonda `latent_halting_probe.pt` y el directorio `engine/` permiten experimentar con enrutado de profundidad por prompt en laboratorio, comparando coste computacional frente a profundidad fija.
- Evaluacion comparativa de arquitecturas recurrentes: sirve como referencia reproducible para medir si la recurrencia de capas mejora el razonamiento frente a modelos densos del mismo orden de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye unicamente una tabla de confrontacion cualitativa y metricas de entrenamiento:

| Metrica | Resultado | Contexto |
|---|---|---|
| Perdida de validacion | 0,4012 | Desde 0,6705, 375 pasos |
| Perplexity | 1,49 | Fluidez linguistica y logica |
| Precision de la sonda de halting | 91,5% | Calibrada sobre prefill (MSE 0,0015) |
| VRAM durante entrenamiento | 5,58 GB | RTX 3060 12 GB, curva plana |
| Velocidad de generacion (Q8_0, RTX 3060) | 156,1 tokens/s | 56 capas reales |
| Velocidad de referencia base 28 capas | 255,6 tokens/s | Qwen3-0.6B-Q8_0 |

Confrontacion cualitativa declarada por el autor (temperature 0.1, Q8_0, RTX 3060): el modelo resuelve correctamente 2^100 mod 7 (resultado 2), el acertijo de hermanas de Sally, el digito de las unidades de 3^2025 (secuencia 3,9,7,1) y la formulacion de parentesis balanceados; empata con el base en el acertijo de las 17 ovejas (ambos fallan con 17-9=8). Estos datos provienen del autor y no de una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7-1,2 GB para variantes compactas Q8_0/F16 y 1,2-2,3 GB para variantes unrolled Q8_0/F16, incluyendo overhead de contexto; el autor reporta 5,58 GB durante entrenamiento con contexto de entrenamiento.
- GPU recomendadas: RTX 3060 12 GB (verificada por el autor), RTX 4060, RTX 4090, A100 y H100 para lotes grandes o contexto completo de 32.768 tokens.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM en Q8_0; las variantes compactas permiten incluso ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio con los GGUF unrolled (sin forks); motores personalizados con ejecucion ciclica para los GGUF compactos; PyTorch con `model.safetensors` y los forward hooks de `engine/`; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: 156,1 tokens/s en RTX 3060 con Q8_0 unrolled (56 capas); se espera mayor throughput con las variantes compactas al ejecutar 28 pasadas de capa, aunque no se proporciona una cifra medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3Loop-0.6B-SFT-Deep-Supervision-v1 | 0,6B fisicos (56 capas logicas) | 32.768 | Transformer con capas recurrentes y halting dinamico | Apache 2.0 | Hugging Face, GGUF unrolled y compacto |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 (configuracion habitual de la familia) | Transformer denso | Apache 2.0 | Hugging Face, GGUF, vLLM |
| Qwen3-0.6B | 0,6B | No disponible en la informacion proporcionada | Transformer denso | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Qwen3-0.6B-Q8_0 (referencia de la model card) | 0,6B, 28 capas | No disponible | Transformer denso | Apache 2.0 | GGUF via Unsloth |

En la confrontacion cualitativa del autor, Qwen3Loop supera al base de 28 capas en cuatro de cinco tareas de razonamiento, empata en una y rinde a 156,1 frente a 255,6 tokens/s. No hay datos de benchmarks estandar que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen2.5 y de datasets de razonamiento en ingles y portugues, cabe esperar sesgos heredados del corpus, no auditados.
- Riesgo de alucinacion: presente como en cualquier modelo de 0,6B; la model card muestra fallos concretos (el acertijo de las 17 ovejas produce 17-9=8 en ambos modelos), lo que evidencia que el CoT no garantiza correccion aritmetica.
- Cobertura idiomatica limitada a ingles y portugues; no se declara soporte de castellano ni de otros idiomas.
- El contexto de 32.768 tokens es un valor recomendado en la model card, no una especificacion verificada del modelo base.
- Las variantes compactas requieren motores con soporte de ejecucion ciclica; solo las variantes unrolled funcionan en llama.cpp, Ollama y LM Studio estandar, con el coste de computar 56 capas.
- La sonda de halting es un artefacto separado (`latent_halting_probe.pt`) con precision reportada por el autor; su integracion en produccion exige codigo propio y no esta validada de forma independiente.
- Los resultados de la tabla de confrontacion provienen del autor, con una unica GPU y parametros de muestreo concretos; no constituyen una evaluacion reproducible por terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no se ofrece garantia ni clausula de indemnizacion por parte del autor.
- El repositorio ocupa 27,9 GB por acumulacion de variantes; conviene descargar solo el archivo GGUF o safetensors necesario.
- Modelo de investigacion con 1 like y publicacion reciente; madurez y mantenimiento a largo plazo no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset agentico: https://huggingface.co/datasets/PRIME-RL/Eurus-2-SFT-Data
- Dataset de CoT para codigo: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Herramienta de anotacion meta-supervisada: https://huggingface.co/convaiinnovations/laya
- Pesos PyTorch: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/model.safetensors
- GGUF unrolled Q8_0: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/unrolled_modelo_qwen3loop_sft_q8_0.gguf
- GGUF unrolled F16: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/unrolled_modelo_qwen3loop_sft_f16.gguf
- GGUF compacto Q8_0: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/modelo_qwen3loop_sft_q8_0.gguf
- GGUF compacto F16: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/modelo_qwen3loop_sft_f16.gguf
- Sonda de halting: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/latent_halting_probe.pt
- Configuracion: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/blob/main/config.json
- Implementacion Python y hooks: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/tree/main/engine
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
