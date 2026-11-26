# Jeesup/svd-safety-l2_svdllmorp96_r40

## Resumen

`svd-safety-l2_svdllmorp96_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado compresión por descomposición en valores singulares (SVD) mediante el método SVD-LLM, reduciendo los parámetros densos al 60,0 % (un 40,00 % eliminado). Tras la compresión, el modelo se recupera con la etapa 2 de SVD-LLM basada en LoRA secuencial sobre U y luego V, entrenada con alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. Su interés radica en que cuantifica el compromiso entre utilidad y seguridad bajo compresión, con métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobree-rechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en siete tareas.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 7B chat, con 6.738.415.616 parámetros reales según safetensors y un repositorio de 13,5 GB. La licencia es Llama 2 Community License y el checkpoint está pensado para evaluación e interpretabilidad, no para despliegue como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA etapa 2 |
| Parametros totales | 6.738.415.616 (fracción densa resultante 0,5998) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del base Llama-2-7b-chat, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only de 7B. Sobre él se aplica SVD-LLM (implementación AIoT-MLSys-Lab/SVD-LLM) con un SVD blanqueado estimado sobre un conjunto de calibración agrupado: S·Sᵀ = suma sobre WikiText de x·xᵀ más suma sobre datos de seguridad de x·xᵀ. La calibración combina `wikitext2:256` y `orb_comply_k0_sep:96`. La parte de utilidad usa WikiText-2 train, 255 ventanas de 2048 tokens con el muestreador de SVD-LLM (semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 96 de 157 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas conformes del propio Llama-2-7b-chat (orden con semilla 42), solo prompt y cabecera de asistente, una conversación por muestra (3055 posiciones desempaquetadas, todas las posiciones). La cuota efectiva de seguridad es de 0,0058 de las posiciones.

Tras eliminar el 40,00 % de los parámetros (fracción resultante 0,5998), se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned: r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42. No se documentan en la información disponible innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones vía el ajuste LoRA de recuperación sobre alpaca-cleaned.
- Comportamiento de seguridad medible: el checkpoint reporta ASR en AdvBench y StrongREJECT y sobree-rechazo en WildGuard, lo que permite estudiar el equilibrio seguridad/utilidad.
- Evaluación zero-shot en siete tareas (precisión media 0,4867, con acc_norm cuando se reporta).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cómo varía la seguridad al eliminar el 40 % de parámetros con SVD-LLM y recuperar con LoRA; se compara contra otras celdas de la rejilla cambiando la regla de selección o el presupuesto.
- Estudio de alineación y seguridad bajo compresión: sus métricas de ASR en AdvBench (0,0115) y StrongREJECT (0,0224) permiten cuantificar la degradación de rechazo frente al modelo denso y evaluar estrategias de reparación.
- Análisis de sobree-rechazo: el valor de sobree-rechazo macro en WildGuard (0,5384) sirve para estudiar el coste en utilidad de las políticas de seguridad tras comprimir.
- Evaluación de perplejidad y utilidad: la perplejidad en WikiText-2 (11,1387) y la precisión zero-shot media (0,4867) permiten trazar curvas de compromiso utilidad/seguridad frente al presupuesto de compresión.
- Reproducción de pipelines SVD-LLM: el checkpoint documenta calibración, semilla y hiperparámetros de la etapa LoRA, lo que facilita replicar el experimento con la implementación AIoT-MLSys-Lab/SVD-LLM.
- Docencia y divulgación sobre interpretabilidad: al ser un artefacto pequeño (13,5 GB) y con métricas explícitas, resulta adecuado para demostrar cómo la selección de componentes afecta al comportamiento de rechazo.
- No se recomienda su uso como asistente en producción; cualquier despliegue real debería evaluarse contra el modelo base denso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0224 |
| Sobree-rechazo macro (WildGuard) | 0,5384 |
| Perplejidad WikiText-2 | 11,1387 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4867 |

No se han publicado en la información disponible comparaciones directas con el modelo denso ni con otras celdas de la rejilla; los valores anteriores son los únicos medidos y reportados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para comodidad.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPUs consumer de 16 GB pueden requerir cuantización no documentada.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/3090 (16-24 GB) en bf16, con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmorp96_r40 | 6.738.415.616 (60 % denso) | no disponible | Llama 2 Community License | Checkpoint comprimido de investigación con métricas de seguridad |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | no disponible en esta ficha | Llama 2 Community License | Modelo base denso sin comprimir |
| Otras celdas de la rejilla SVD-LLM del autor | variable según presupuesto | no disponible | Llama 2 Community License | No se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo de chat de propósito general: es un sujeto experimental y debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación y sesgos: heredados de Llama 2 y potencialmente amplificados por la compresión; no se documentan análisis específicos.
- Limitaciones de contexto e idioma: no documentadas en la información disponible.
- Restricciones de licencia: Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso comercial está sujeto a sus términos.
- La cuota efectiva de datos de seguridad en la calibración es muy baja (0,0058 de las posiciones), lo que puede limitar la reparación del comportamiento de rechazo.
- No se documentan cuantizaciones ni formatos alternativos, lo que restringe las opciones de despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmorp96_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
