# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.00000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup bajo la etiqueta `model-compression` y `safety-evaluation`. No es un modelo entrenado desde cero ni un ajuste fino convencional: es el resultado de un experimento de compresión mediante descomposición en valores singulares (SVD) aplicada a las matrices densas del modelo base, con un presupuesto de rango que elimina nominalmente el 50 % de los parámetros de proyección (fracción real de parámetros factoriales en el modelo completo: 0,519340). El objetivo del experimento es medir cómo afecta esa compresión a dos métricas simultáneas: la utilidad (perplejidad sobre WikiText-2) y la identidad o comportamiento de seguridad (tasa de éxito de ataques en AdvBench/HarmBench y respuestas en XSTest/OR-Bench).

El nombre del repositorio codifica la configuración: `l2_utility` indica que la métrica de entrada es la utilidad con norma L2, `remove0.5` el porcentaje nominal de eliminación de parámetros de proyección y `rho0.00000001` el desplazamiento relativo objetivo entre métricas (1e-8). El autor lo describe explícitamente como un "piloto unilateral", no como un SVD completo con información de Fisher, y advierte que las mediciones no constituyen una garantía de seguridad.

Su relevancia es metodológica más que práctica: sirve para estudiar si la compresión agresiva de un modelo alineado desplaza su comportamiento de rechazo (safety shifting) y en qué magnitud, con los pesos ya plegados en matrices densas de Hugging Face para facilitar la evaluación. No se debe emplear como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos plegados en matrices densas tras compresión SVD |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama-2-7b-chat: 4096 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm, alineado originalmente mediante RLHF por Meta. Sobre ese modelo base, este checkpoint aplica una compresión por SVD: se proyectan las matrices de pesos sobre un subespacio de rango reducido, con una eliminación nominal del 50 % de los parámetros de proyección y una fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo. No hay ajuste fino de recuperación posterior a la compresión ("No recovery fine-tuning").

El criterio de selección del subespacio combina dos familias de momentos: los momentos de entrada calculados sobre WikiText y una métrica mixta que suma 0,1 veces los momentos de pares prompt dañino/respuesta segura. Ambas familias usan los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, que son retenidos del gradiente pero no completamente ajenos a la calibración. Hiperparámetros declarados: rho relativo 1e-8, lambda global 2,1182246274867613e-07 y ridge 1e-05.

El autor subraya que los pesos subidos son matrices densas plegadas por comodidad de evaluación: el presupuesto de rango describe la representación de bajo rango subyacente, pero este repositorio no ofrece inferencia factorizada ni demuestra aceleración alguna.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Evaluación de seguridad: el checkpoint está pensado para medir tasas de éxito de ataques (ASR) con AdvBench y juicios de HarmBench, además de comportamiento en XSTest y en los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Medición de utilidad mediante perplejidad sobre WikiText-2.
- Diagnóstico por matriz: el repositorio incluye `compression.json` con diagnósticos individuales de cada matriz comprimida.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre safety shifting bajo compresión: usar el checkpoint como punto de comparación frente al Llama-2-7b-chat original para medir cuánto cambia la tasa de rechazo en AdvBench y HarmBench tras eliminar el 50 % nominal de parámetros de proyección.
- Estudios de robustez de alineamiento: evaluar si la compresión SVD degrada selectivamente el comportamiento de rechazo mientras preserva la utilidad, comparando la perplejidad de WikiText-2 con las métricas de seguridad.
- Reproducibilidad de experimentos de compresión: el directorio `experiment/` contiene configuraciones exactas, pérdidas de validación y código fuente, lo que permite replicar el pipeline SVD con los mismos momentos y hiperparámetros.
- Análisis por capa y matriz: `compression.json` permite estudiar qué matrices toleran más eliminación de rango sin degradar utilidad ni seguridad, informando futuros esquemas de compresión selectiva.
- Calibración de evaluadores automáticos: los ficheros de evaluación con juicios de HarmBench y WildGuard sobre XSTest y OR-Bench sirven para validar la coherencia de los jueces automáticos y la fracción de respuestas puntuadas.
- Docencia y formación en compresión de modelos: como ejemplo documentado de un piloto de SVD con métricas duales (utilidad e identidad) y advertencias explícitas sobre sus límites.

## Benchmarks y rendimiento

El autor declara que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard. Sin embargo, en la información proporcionada no se incluyen los valores numéricos de esos resultados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 13,5 GB en safetensors, lo que corresponde a pesos en precisión de 16 bits (6,74 mil millones de parámetros). En FP16 la VRAM estimada para inferencia ronda los 13-14 GB más el espacio de caché KV.
- En cuantización de 8 bits se puede aproximar a 7-8 GB de VRAM; en 4 bits, a 4-5 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40 GB o H100 para evaluación a gran escala con lotes amplios; RTX 4090 (24 GB) para inferencia en FP16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en tarjetas de 8-12 GB (RTX 3080, RTX 4070), aunque sin artefactos cuantizados publicados habría que generarlos.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son compatibles con el formato safetensors de Llama 2, pero el autor advierte que este upload no proporciona inferencia factorizada ni establece ninguna aceleración derivada de la compresión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup) | 6,74 mil millones | no disponible (base: 4096) | Llama-2-7b-chat comprimido por SVD, sin ajuste de recuperación | llama2 | HuggingFace, 13 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 | Modelo base alineado con RLHF | llama2 | HuggingFace, ampliamente disponible |
| Modelos de compresión tipo SlicedLLM o similares | variable | variable | Compresión por rango con ajuste de recuperación | variable | no disponible en la informacion proporcionada |

La comparación relevante es contra el modelo base: este checkpoint conserva el mismo número de parámetros almacenados (matrices densas plegadas) pero su representación efectiva es de rango reducido con una fracción factorial de 0,519340. Frente a métodos de compresión con ajuste fino de recuperación, el autor indica explícitamente que aquí no se aplicó recuperación, lo que sitúa este piloto en un régimen de mayor degradación esperada.

## Limitaciones y advertencias

- El propio autor advierte que es un piloto unilateral y no un SVD completo con información de Fisher; los resultados no deben generalizarse a otros esquemas de compresión.
- Las mediciones de seguridad no establecen ninguna garantía: hay que inspeccionar la coherencia y la fracción de respuestas puntuadas junto con la tasa de éxito de ataques (ASR).
- No hay ajuste fino de recuperación tras la compresión, por lo que es esperable una degradación de utilidad y coherencia superior a la de métodos con recuperación.
- Los ejemplos de validación de entropía cruzada (32 dañinos y 12 benignos) están retenidos del gradiente pero no son completamente ajenos a la calibración, dado que el corpus de la métrica mixta es más amplio.
- Los pesos están plegados en matrices densas: no se ofrece inferencia factorizada ni se demuestra aceleración, de modo que el beneficio de compresión no se materializa en este repositorio.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama-2-7b-chat, potencialmente amplificados por la compresión.
- Idiomas soportados: no disponibles; se desconoce si la compresión afecta de forma desigual a idiomas distintos del inglés.
- Licencia llama2: el uso comercial está sujeto a la Llama 2 Community License de Meta, incluidos sus umbrales de usuarios activos mensuales y restricciones de uso aceptable.
- No apto para producción: es un artefacto de investigación con 13 descargas y sin pipeline declarado.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Directorio de experimento dentro del repositorio: `experiment/` (configuraciones exactas, pérdidas de validación y código fuente)
- Diagnósticos por matriz: `compression.json` en el repositorio
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/google-research-datasets/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
