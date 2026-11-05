# Jeesup/svd-safety-q32_svdllm_r30

## Resumen

svd-safety-q32_svdllm_r30 es un checkpoint de investigación derivado de Qwen/Qwen2.5-32B-Instruct, comprimido mediante SVD-LLM hasta el 70% de los parámetros densos originales (30% eliminados) y posteriormente recuperado con la etapa 2 de SVD-LLM, que aplica LoRA secuencial sobre las matrices U y V. Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes lo repara mejor. No incorpora ninguna selección ni reparación específica de seguridad: es la celda de referencia (baseline) del grid experimental.

El modelo conserva la arquitectura Qwen2 y el tokenizador del modelo base, con 32.763.876.352 parámetros declarados en los safetensors, aunque la fracción efectiva tras la compresión es 0,7000 del denso original. Su relevancia es metodológica más que práctica: sirve para cuantificar el coste en seguridad y en perplejidad de una compresión agresiva, y para comparar reglas de selección de componentes dentro de la misma familia de experimentos.

El autor advierte explícitamente de que no es un asistente de chat de propósito general y de que varias celdas del grid están deliberadamente degradadas en seguridad. Cualquier uso debe tratarse como sujeto experimental, no como modelo desplegable, y requiere evaluación propia antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (modelo base Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (checkpoint comprimido; fracción densa efectiva 0,7000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen2.5-32B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-32B-Instruct, un transformer decoder-only de la familia Qwen2, y se comprime con SVD-LLM eliminando el 30,00% de los parámetros (fracción resultante 0,7000, semilla 42). La recuperación se realiza con la etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con rango r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y precisión bf16, sobre el dataset alpaca-cleaned.

No se aplica ningún ajuste específico de seguridad ni selección de componentes orientada a preservar el rechazo de peticiones dañinas. El propio autor indica que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del estudio es cuantificar ese efecto y probar su recuperación mediante distintas reglas de selección. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y conocimiento general, sujetos a la degradación introducida por la compresión SVD.
- Generación de código y matemáticas: capacidad presumible del base, no verificada en este checkpoint.
- Soporte de tool calling y function calling: presumible del base, no documentado en la model card de este derivado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Comportamiento de seguridad medido: ASR de 0,0038 en AdvBench y 0,0064 en StrongREJECT con juez HarmBench, y sobre-rechazo macro de 0,2638 en WildGuard.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como baseline del grid para medir la degradación de seguridad y utilidad frente a Qwen2.5-32B-Instruct sin comprimir, manteniendo constantes semilla y presupuesto.
- Estudio de reglas de selección de componentes SVD: comparar esta celda (sin selección específica de seguridad) con las demás celdas del grid para aislar el efecto de cada regla sobre el ASR y la perplejidad.
- Evaluación de robustez frente a jailbreaks: emplear los valores de AdvBench y StrongREJECT como referencia para calibrar arneses de evaluación propios antes de aplicar técnicas de reparación.
- Análisis de sobre-rechazo: el 0,2638 de sobre-rechazo macro en WildGuard permite estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Medición de perplejidad como proxy de calidad: la perplejidad de 8,2868 en WikiText-2 sirve para comparar la fidelidad de distintas variantes de compresión sobre el mismo corpus.
- Reproducibilidad de experimentos: al estar publicados semilla, hiperparámetros de LoRA y dataset de recuperación, el checkpoint permite replicar el pipeline SVD-LLM sobre otros modelos base de la familia Qwen.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0064 |
| Sobre-rechazo macro (WildGuard) | 0,2638 |
| Perplejidad WikiText-2 | 8,2868 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 65 GB solo para pesos, más memoria para KV cache y activaciones; el tamaño del repo es de 65,5 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; requeriría cuantización a 4 bits (aproximadamente 16-18 GB de pesos) para intentar encajar, aunque no se documentan variantes GGUF ni cuantizadas en el repositorio.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag endpoints_compatible). No se documentan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-q32_svdllm_r30 | 32,76 B (70% denso efectivo) | no disponible | Apache 2.0 | Checkpoint de investigación |
| Qwen/Qwen2.5-32B-Instruct | 32,5 B aprox. | no disponible en esta ficha | Apache 2.0 | Modelo base de referencia |
| Otras celdas del grid SVD-LLM (Jeesup) | 32,76 B (misma fracción) | no disponible | Apache 2.0 | Variantes con distintas reglas de selección |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de chat de propósito general: el autor lo describe como artefacto de investigación y sujeto experimental.
- La compresión SVD eleva la tasa de éxito de ataques; varias celdas del grid están deliberadamente degradadas en seguridad y esta es la baseline sin reparación específica.
- Riesgo de alucinación no cuantificado en la model card; la perplejidad de 8,2868 en WikiText-2 es el único indicador de fidelidad publicado.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del base.
- Longitud de contexto no confirmada en la documentación del derivado.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja el despliegue en producción sin evaluación propia previa.
- No se documentan sesgos específicos medidos; los sesgos del base Qwen2.5-32B-Instruct pueden persistir o amplificarse tras la compresión.
- Sin variantes cuantizadas publicadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-q32_svdllm_r30
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
