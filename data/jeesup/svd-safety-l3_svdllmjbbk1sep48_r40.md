# Jeesup/svd-safety-l3_svdllmjbbk1sep48_r40

## Resumen

`svd-safety-l3_svdllmjbbk1sep48_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo nuevo entrenado desde cero, sino un artefacto experimental: una versión del Llama-3-8B-Instruct comprimida mediante la técnica SVD-LLM, que elimina el 40 % de los parámetros densos (conservando el 59,98 %) y posteriormente recupera parte de la capacidad perdida con una etapa de ajuste LoRA.

El interés del checkpoint no reside en su rendimiento como asistente, sino en su valor metodológico. Forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. Cada celda de la cuadrícula experimental (reglas de selección × presupuestos de compresión) es un sujeto de estudio, no un modelo listo para producción.

El modelo conserva la arquitectura transformer decoder-only de Llama-3-8B, con 8.030.261.248 parámetros efectivos tras la compresión, pesos en safetensors y licencia Llama 3 Community License. Su relevancia actual es acotada pero específica: sirve para investigadores que trabajan en compresión de modelos, interpretabilidad de mecanismos de seguridad y evaluación de trade-offs entre utilidad y alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción 0,5998 del denso original) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el README no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base, sin declaración explícita) |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8.000 millones de parámetros. Sobre él se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos mediante SVD blanqueada y descarta componentes según una regla de selección. En este caso se elimina el 40 % de los parámetros (fracción resultante 0,5998), usando un conjunto de calibración mixto que combina utilidad y seguridad: `wikitext2:256 + jbb_harm_resp_k1_sep:48`. La parte de utilidad emplea 255 ventanas de 2048 tokens de WikiText-2 train (muestreo SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad usa las primeras 48 de las 94 metas de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct (semilla 42), recortadas al primer token. La proporción efectiva de posiciones dedicadas a seguridad es de 0,0023.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta entrenamiento adicional con RLHF ni DPO; la alineación proviene del modelo base original. La innovación técnica destacable es precisamente el uso de un conjunto de calibración mixto que incorpora datos de seguridad en la selección de componentes, lo que constituye la variable experimental del estudio.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct, aunque degradada por la compresión.
- Razonamiento de propósito general y respuesta a instrucciones, con calidad reducida respecto al modelo denso.
- Capacidad de rechazo ante peticiones dañinas, medida y parcialmente preservada (ASR de 0,0962 en AdvBench).
- Soporte de tool calling y function calling: no documentado en la información proporcionada; se desconoce si la compresión preserva el formato de llamadas a herramientas del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas explícitamente; dependen del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en compresión de modelos: sirve como celda de referencia para medir cómo SVD-LLM afecta a la perplejidad y a la precisión zero-shot frente al modelo denso, con métricas ya publicadas (WikiText-2 ppl 28,7449; precisión media 0,4952 en 7 tareas).
- Estudio de degradación de seguridad por compresión: permite cuantificar el aumento de la tasa de éxito de ataques (ASR 0,0962 en AdvBench, 0,1565 en StrongREJECT) y compararlo con otras celdas de la cuadrícula.
- Evaluación de reglas de selección de componentes: al ser una celda concreta de una cuadrícula, se usa para contrastar qué criterio de selección repara mejor el comportamiento de rechazo bajo un presupuesto de compresión dado.
- Análisis de sobre-rechazo: la métrica de sobre-rechazo macro (0,1493 con WildGuard) permite estudiar el equilibrio entre seguridad y utilidad conversacional.
- Docencia y reproducción experimental: útil en cursos o trabajos sobre interpretabilidad y compresión, ya que el pipeline (SVD-LLM + LoRA de recuperación) está documentado y es reproducible con la semilla 42.
- Baseline para técnicas de recuperación posteriores: sirve como punto de partida para probar métodos de reparación de seguridad distintos del LoRA secuencial sobre alpaca-cleaned.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0962 |
| StrongREJECT ASR (juez HarmBench) | 0,1565 |
| Sobre-rechazo macro (WildGuard) | 0,1493 |
| Perplejidad WikiText-2 | 28,7449 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4952 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas de la cuadrícula ni frente al modelo denso original, por lo que no es posible presentar una tabla comparativa de benchmarks con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque el README no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción experimental; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Compatibilidad con GPU de consumo: sí en RTX 4090 y RTX 3090 en bf16; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM tras convertir los pesos, aunque no se documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk1sep48_r40 | 8,03 B (comprimido al 59,98 %) | no disponible | Llama 3 Community | Artefacto de investigación con métricas de seguridad publicadas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B (denso) | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la cuadrícula SVD-LLM del mismo autor | ~8 B comprimidos a distintas fracciones | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; no se dispone de sus métricas en la información proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como sujeto experimental, no como asistente desplegable.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- Riesgo de alucinación incrementado respecto al modelo denso por la pérdida de capacidad asociada a la compresión.
- La alineación de seguridad está parcialmente erosionada: ASR de 0,0962 en AdvBench y 0,1565 en StrongREJECT, con sobre-rechazo del 0,1493.
- La proporción efectiva de datos de seguridad en la calibración es mínima (0,0023 de posiciones), lo que limita la representatividad de esa señal.
- Idiomas soportados no declarados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Llama 3 Community License, con `USE_POLICY.md` aplicable; el uso comercial está sujeto a los términos de Meta y a la política de uso aceptable.
- Sin datos de contexto, tool calling ni despliegue en producción; cualquier uso requiere evaluación propia previa.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk1sep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM (referenciado en la model card): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench (conjunto de calibración de seguridad): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- WikiText-2 (conjunto de calibración de utilidad): https://huggingface.co/datasets/wikitext
- Licencia Llama 3: https://llama.meta.com/llama3/license/
