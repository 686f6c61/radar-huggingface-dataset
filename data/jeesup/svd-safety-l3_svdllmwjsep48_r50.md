# Jeesup/svd-safety-l3_svdllmwjsep48_r50

## Resumen

`svd-safety-l3_svdllmwjsep48_r50` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante SVD-LLM hasta conservar aproximadamente el 50% de los parámetros densos originales (fracción resultante 0,4997). Lo publica el usuario Jeesup (Jeesup en Hugging Face) como artefacto de investigación sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo de propósito general ni un asistente desplegable: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de la arquitectura Llama 3 de 8B parámetros (8.030.261.248 parámetros reales según safetensors), con la misma longitud de contexto nativa del modelo base, y se distribuye en formato safetensors bajo licencia Llama 3 Community License. Su interés técnico reside en que cuantifica explícitamente el coste en seguridad de la compresión: el propio autor advierte que varias celdas de la malla están deliberadamente degradadas en seguridad respecto al modelo original.

La relevancia actual es metodológica: proporciona métricas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro medido con WildGuard, perplejidad en WikiText-2 y precisión zero-shot en 7 tareas, lo que permite estudiar el compromiso entre utilidad y seguridad bajo compresión SVD con un conjunto de calibración que mezcla datos de utilidad (WikiText-2) y de seguridad (WildJailbreak).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción resultante 0,4997 respecto al denso) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama-3-8B-Instruct) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only de la familia Llama 3, derivado de Meta-Llama-3-8B-Instruct, al que se ha aplicado compresión SVD-LLM con un conjunto de calibración agrupado que combina utilidad y seguridad: la matriz de covarianza se estima como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones) y la parte de seguridad usa los primeros 48 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial dañinos) con los propios rechazos de Llama-3-8B-Instruct (orden con semilla 42, una conversación por muestra, 5402 posiciones). La proporción efectiva de posiciones dedicadas a seguridad es de 0,0102.

Tras la compresión al 50,00% de parámetros se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El estimador SVD es el SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre el conjunto de calibración agrupado. La semilla global del experimento es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad reducida respecto al modelo base (perplejidad en WikiText-2 de 67,7674).
- Capacidad de rechazo ante peticiones dañinas parcialmente preservada: ASR de 0,2558 en AdvBench y 0,1693 en StrongREJECT, ambas medidas con juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta explícitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cómo varía la tasa de éxito de ataque al comprimir un modelo alineado al 50% de parámetros, comparando con otras celdas de la misma malla.
- Estudio de reglas de selección de componentes SVD: permite evaluar si una regla de selección concreta (en este caso, calibración agrupada utilidad + seguridad con 48 prompts) repara mejor el comportamiento de seguridad que alternativas.
- Auditoría de seguridad de modelos comprimidos: sus métricas de ASR en AdvBench y StrongREJECT y de sobre-rechazo con WildGuard sirven como referencia para pipelines de evaluación de robustez.
- Análisis del compromiso utilidad-seguridad: la combinación de perplejidad en WikiText-2 (67,7674) y precisión zero-shot media (0,4498) permite cuantificar el coste de utilidad de la compresión junto al coste de seguridad.
- Reproducibilidad de experimentos: la documentación de semillas, conjuntos de calibración y hiperparámetros LoRA facilita replicar el experimento con el código de SVD-LLM de AIoT-MLSys-Lab.
- Docencia y formación en interpretabilidad: útil como ejemplo práctico de cómo la descomposición en valores singulares afecta a comportamientos alineados en un transformer de 8B.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2558 |
| StrongREJECT ASR (juez HarmBench) | 0,1693 |
| Sobre-rechazo macro (WildGuard) | 0,2237 |
| Perplejidad WikiText-2 | 67,7674 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4498 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas, ni desglose por tarea de la precisión zero-shot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8.030.261.248 parámetros, en bf16/fp16 requiere aproximadamente 16 GB solo para pesos, más memoria para KV cache y activaciones.
- En cuantización de 8 bits cabría en GPUs de 24 GB (RTX 3090, RTX 4090) con margen limitado; en 4 bits podría caber en GPUs de 16 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue sin cuantizar; RTX 4090 o A6000 para cuantización 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep48_r50 | 8.030.261.248 (≈50% del denso) | no disponible | Llama 3 Community License | Hugging Face (Jeesup) | Artefacto de investigación, seguridad degradada |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8K (modelo base) | Llama 3 Community License | Hugging Face (Meta) | Modelo de referencia sin comprimir |
| Otras celdas de la malla SVD-LLM del mismo autor | variable | no disponible | Llama 3 Community License | Hugging Face (Jeesup) | Distintas reglas de selección y presupuestos |
| Modelos comprimidos por pruning/SVD de la literatura | variable | no disponible | variable | variable | No se dispone de comparación directa en la información proporcionada |

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo de propósito general ni un asistente desplegable: debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación incrementado por la compresión, coherente con la perplejidad elevada en WikiText-2 (67,7674) frente a un modelo denso.
- Sobre-rechazo macro de 0,2237 medido con WildGuard, lo que indica rechazos excesivos en consultas benignas.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no documentada en la ficha; se asume la del modelo base, pero no está confirmada.
- Restricciones de licencia: Llama 3 Community License y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a dichos términos.
- No se documentan variantes cuantizadas ni garantías de compatibilidad con motores de inferencia distintos de transformers y TGI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep48_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos o repositorios adicionales específicos de este checkpoint.
