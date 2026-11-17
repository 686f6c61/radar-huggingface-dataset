# Jeesup/svd-safety-l2_svdllmwjsep12_r50

## Resumen

svd-safety-l2_svdllmwjsep12_r50 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante la técnica SVD-LLM, que reduce el número de parámetros densos al 50,0% y posteriormente recupera capacidad con un ajuste LoRA en dos etapas (U y V secuenciales). Lo publica el usuario Jeesup como artefacto de investigación para estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general.

El modelo forma parte de una cuadrícula experimental sobre reglas de selección y presupuestos de compresión. Utiliza un conjunto de calibración mixto que combina señales de utilidad (WikiText-2) y de seguridad (WildJailbreak), con una proporción efectiva de posiciones de seguridad muy baja (0,0071). El resultado son 6.738.415.616 parámetros reales (frente a los ~6.740 millones del Llama-2-7b original) y un repositorio de 13,5 GB.

Su relevancia es metodológica: permite cuantificar el compromiso entre utilidad (perplejidad en WikiText-2 de 13,75, precisión zero-shot media de 0,4507 en 7 tareas) y seguridad (ASR de 0,1904 en AdvBench y 0,1246 en StrongREJECT, con un sobre-rechazo macro de 0,3150). Cualquier uso en producción debe considerarse fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens; el cutoff de entrenamiento LoRA fue de 256) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se parte de meta-llama/Llama-2-7b-chat-hf, un transformer decoder-only con 7.000 millones de parámetros aproximadamente. Sobre él se aplica SVD-LLM, un método de compresión post-entrenamiento basado en descomposición en valores singulares con un SVD blanqueado (whitened SVD) implementado por AIoT-MLSys-Lab/SVD-LLM. La matriz de calibración se construye como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, es decir, una matriz de covarianza agregada de dos fuentes. El presupuesto de compresión elimina el 50,00% de los parámetros densos, dejando una fracción resultante de 0,4999. La semilla es 42.

La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones. La parte de seguridad usa los primeros 12 de 512 prompts de WildJailbreak train (vanilla y adversariales dañinos) con los propios rechazos de Llama-2-7b-chat, una conversación por muestra, desempaquetados en 3746 posiciones. La proporción efectiva de posiciones de seguridad es 0,0071. Tras la compresión se aplica una recuperación LoRA en dos etapas secuenciales (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, aunque degradada por la compresión y por el ajuste LoRA sobre alpaca-cleaned.
- Razonamiento y respuesta a instrucciones de nivel básico, condicionado por la pérdida de capacidad asociada al 50% de compresión.
- Capacidad de rechazo de peticiones dañinas parcialmente preservada: ASR de 0,1904 en AdvBench y 0,1246 en StrongREJECT, ambos medidos con HarmBench como juez.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no declaradas; dependen del modelo base.
- Modo thinking, visión o audio: no disponible.
- Capacidad especial de interés: es un artefacto de interpretabilidad que permite estudiar la relación entre compresión SVD y seguridad.

## Casos de uso

- Estudio de seguridad bajo compresión: el checkpoint sirve como celda experimental para medir cómo varía el ASR (AdvBench, StrongREJECT) al reducir parámetros, comparándolo con otras celdas de la cuadrícula y con el modelo denso original.
- Investigación sobre reglas de selección de componentes: permite evaluar si la regla de selección basada en utilidad + seguridad (con la proporción 0,0071 de posiciones de seguridad) repara mejor el comportamiento que reglas puramente de utilidad.
- Análisis de sobre-rechazo: con un macro over-refusal de 0,3150 medido por WildGuard, es útil para estudiar el equilibrio entre rechazo correcto y rechazo excesivo en asistentes comprimidos.
- Reproducción de pipelines SVD-LLM: sirve como referencia para validar implementaciones del SVD blanqueado y del ajuste LoRA secuencial U/V sobre Llama-2-7b-chat.
- Evaluación comparativa de perplejidad: con WikiText-2 PPL de 13,7506, permite contrastar la pérdida de calidad lingüística frente a otros presupuestos de compresión.
- Docencia y divulgación: útil para ilustrar en cursos o artículos el compromiso entre eficiencia (50% de parámetros) y seguridad en modelos del ecosistema Llama 2.
- No recomendado para atención al cliente, generación de código en producción, agentes desplegados ni cualquier uso comercial que requiera un asistente fiable.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (HarmBench judge) | 0,1904 |
| StrongREJECT | ASR (HarmBench judge) | 0,1246 |
| WildGuard | Macro over-refusal | 0,3150 |
| WikiText-2 | Perplejidad | 13,7506 |
| Zero-shot, 7 tareas | Precisión media (acc_norm donde se reporta) | 0,4507 |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con otros modelos de la cuadrícula.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (estimaciones basadas en el recuento de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización de 8 o 4 bits, en GPUs de 8-12 GB como RTX 3060/4060 Ti.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep12_r50 | 6.738.415.616 | no disponible | Llama 2 Community | Checkpoint comprimido al 50%, artefacto de investigación |
| meta-llama/Llama-2-7b-chat-hf | ~7.000 millones | 4096 tokens | Llama 2 Community | Modelo base denso, sin compresión |
| Otras celdas de la cuadrícula SVD-safety | ~6.738 millones | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; datos no disponibles en esta ficha |

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables de terceros (por ejemplo, otras técnicas de compresión como Wanda, SparseGPT o LLM-Pruner aplicadas a Llama-2-7b-chat) para una comparación numérica rigurosa.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; este checkpoint no debe tratarse como un asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR); el ASR medido de 0,1904 en AdvBench y 0,1246 en StrongREJECT refleja un comportamiento de rechazo parcial, no robusto.
- El macro over-refusal de 0,3150 indica una tendencia notable a rechazar peticiones legítimas.
- La proporción efectiva de posiciones de seguridad en la calibración es muy baja (0,0071), lo que limita la influencia del componente de seguridad en la selección de componentes.
- La perplejidad en WikiText-2 (13,7506) y la precisión zero-shot media (0,4507) sugieren una pérdida de calidad lingüística y de razonamiento frente al modelo denso.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido y ajustado con LoRA sobre alpaca-cleaned.
- Idiomas soportados no declarados; el comportamiento multilingüe puede degradarse de forma no medida.
- Restricciones de licencia: Llama 2 Community License; el uso comercial está sujeto a LICENSE.txt y USE_POLICY.md incluidos en el repositorio, y a las condiciones de atribución "Built with Llama 2".
- No apto para producción sin una evaluación de seguridad y utilidad propia y específica del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep12_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales específicos de este checkpoint.
