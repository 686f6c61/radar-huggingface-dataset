# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-12 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT bajo el marco experimental CIRF (probablemente "Continuous Intermediate Reasoning Format" o similar, aunque la model card no expande el acronimo). El modelo adapta el transformer denso original para que razone mediante una secuencia de "tokens funcionales" (`[f_0]` a `[f_511]`) delimitados por `[sof]` y `[eof]`, intercalando valores de resultado opcionales. El objetivo es explicitar el proceso de razonamiento en un formato estructurado y verificable, en lugar de la cadena de pensamiento en lenguaje natural.

Se trata de una variante concreta dentro de una familia de ocho modelos CIRF publicados por el mismo autor, en este caso con seleccion "backward-greedy" y un presupuesto maximo de 12 tokens de resultado explicitos por ejemplo de entrenamiento. El modelo tiene 8.192.758.784 parametros (8,2 mil millones), se distribuye en safetensors BF16 con la actualizacion LoRA ya fusionada en los pesos densos y mantiene la licencia Apache 2.0 del modelo base.

Su relevancia es fundamentalmente de investigacion: propone una interfaz de razonamiento alternativa al chat convencional (sin plantilla de chat, prompt terminado en `[sof]`) y publica resultados en tareas aritmeticas y de sentido comun. No es un modelo de proposito general listo para produccion, sino una prueba de concepto sobre como estructurar el razonamiento de un LLM con vocabulario funcional dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.192.758.784 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta contexto nativo largo, pero la model card no lo declara para este ajuste) |
| Tipos de cuantizacion | no disponible oficialmente; al estar en safetensors BF16 es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso, y le anade 514 tokens nuevos al vocabulario: `[sof]` (start of function trace), `[eof]` (end of function trace) y 512 tokens funcionales `[f_0]`...`[f_511]`. Estos tokens tienen filas de embedding y de salida entrenadas especificamente. El ajuste se realizo mediante LoRA, cuya actualizacion se fusiono posteriormente en los pesos densos BF16, de modo que el checkpoint carga con Transformers estandar sin PEFT ni codigo CIRF adicional.

El entrenamiento es supervisado (no se menciona RLHF ni DPO) sobre el modelo "Full" de la misma familia, aplicando una seleccion "backward-greedy" de resultados con un presupuesto de como maximo 12 tokens de resultado explicitos por ejemplo. La model card indica que se probaron 91 disenos candidatos y que la revision actual (2026-11-08) incorpora la seleccion final; la revision inicial `aebd4e1` (2026-11-02) corresponde a una seleccion intermedia con 56 de 91 disenos evaluados. El formato de inferencia no usa plantilla de chat: el prompt es `PREGUNTA[sof]` y el modelo emite una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final, terminando en el token EOS del tokenizer.

## Capacidades

- Razonamiento estructurado mediante trazas de tokens funcionales (`[f_0]`-`[f_511]`) en lugar de cadena de pensamiento en lenguaje natural.
- Resolucion de problemas aritmeticos y de razonamiento de varios pasos (GSM8K, MultiArith, SVAMP, Coin Flip).
- Razonamiento de sentido comun (CommonsenseQA).
- Generacion de texto en ingles como capacidad heredada del modelo base.
- Formato de salida determinista con decodificacion greedy y limite configurable de tokens funcionales.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" explicito mas alla de la traza CIRF.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre formatos de razonamiento: el modelo sirve como banco de pruebas para comparar trazas de tokens funcionales frente a cadenas de pensamiento en lenguaje natural en tareas de razonamiento aritmetico.
- Evaluacion de tecnicas de compresion de trazas: la familia de variantes (Greedy-3, 6, 12, 18, 24, Zero-Results) permite estudiar el equilibrio entre presupuesto de tokens de resultado y precision en GSM8K y MultiArith.
- Generacion de explicaciones verificables en dominios acotados: al separar la traza (`[sof]`...`[eof]`) de la respuesta final, es posible auditar el proceso intermedio de forma programatica.
- Reproduccion de experimentos: el repositorio incluye `inference.py`, `training_config.json`, `provenance.json` y `export_verification.json`, lo que facilita replicar el protocolo de evaluacion (greedy, maximo 384 tokens nuevos y 32 tokens funcionales).
- Docencia y divulgacion: ilustra de forma concreta como se puede modificar el vocabulario y el espacio de salida de un LLM para imponer una estructura de razonamiento.
- Baseline para ajustes posteriores: al cargar con Transformers estandar y licencia Apache 2.0, puede servir como punto de partida para experimentos propios de razonamiento estructurado.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion por coincidencia exacta):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 66,49% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 84,67% |
| CommonsenseQA | 1.221 | 81,82% |
| Coin Flip (corregido por paridad) | 3.333 | 92,32% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia con batch 1, estan en `test_results.json`. No se proporcionan en la informacion disponible los valores de MATH-500 ni StrategyQA, ni comparaciones directas con el modelo base Qwen3-8B u otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos (8,19 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits: alrededor de 4-5 GB, aunque estas conversiones no estan publicadas oficialmente y requieren herramientas externas (llama.cpp, AutoAWQ, GPTQ).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto corto; RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en BF16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: Transformers (protocolo oficial documentado), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; llama.cpp/Ollama/vLLM no estan documentados oficialmente para este checkpoint, aunque al ser un transformer estandar deberian ser adaptables.
- Latencia y throughput: la model card menciona latencia con batch 1 en `test_results.json`, pero los valores no estan incluidos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-12 | 8,19 B | no disponible | Apache 2.0 | Razonamiento con tokens funcionales CIRF |
| CIRF-Qwen3-8B-Instruct-Full | 8,19 B (base comun) | no disponible | Apache 2.0 | Variante CIRF sin seleccion backward-greedy |
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19 B (base comun) | no disponible | Apache 2.0 | Variante CIRF sin valores de resultado explicitos |
| Qwen/Qwen3-8B (base) | 8,19 B | contexto nativo largo de Qwen3 (no declarado aqui) | Apache 2.0 | LLM de proposito general con modo thinking |

La comparacion con Qwen3-8B en benchmarks no esta disponible en la informacion proporcionada; la model card no incluye una tabla comparativa frente al modelo base ni frente a otras variantes CIRF.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion ni para conversacion general; el formato de prompt es no estandar (`PREGUNTA[sof]`, sin plantilla de chat).
- Solo ingles declarado; el rendimiento en otros idiomas no esta evaluado.
- Requiere decodificacion greedy y `skip_special_tokens=False`; el uso de sampling o el truncado en `[eof]` en lugar de EOS puede degradar los resultados.
- La evaluacion impone un limite de 32 tokens funcionales y fuerza `[eof]` al alcanzarlo; sin ese limite el comportamiento puede diferir.
- La puntuacion de Coin Flip se corrige por paridad porque aproximadamente el 20% de las etiquetas del dataset no coinciden con la paridad de los lanzamientos descritos; esto indica fragilidad en la evaluacion de esa tarea.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos del modelo base Qwen3-8B heredados; no se documenta ninguna mitigacion especifica.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el estado experimental del ajuste desaconseja su uso comercial directo.
- El checkpoint se actualizo el 2026-11-08; la revision anterior (`aebd4e1`) corresponde a una seleccion intermedia de disenos, lo que puede afectar a la reproducibilidad si no se fija la revision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Revision inicial: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12/tree/aebd4e1e205559cb38a1f376fe299cdac4955d9a
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
