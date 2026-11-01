# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup bajo la etiqueta `model-compression` y `safety-evaluation`. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de compresión mediante descomposición en valores singulares (SVD) en el que se elimina un presupuesto de rango de las matrices de pesos del transformer original. El autor denomina al resultado "safety-shifted SVD pilot", un piloto de desplazamiento de seguridad, y lo publica como material reproducible para estudiar cómo afecta la compresión a las propiedades de seguridad del modelo.

El checkpoint concreto, `l2_utility_remove0.4_rho0`, aplica una eliminación nominal del 40 % de los parámetros de proyección, lo que se traduce en una fracción de parámetros factoriales realizados de 0,615424 sobre el modelo completo. La métrica de entrada utilizada para guiar la descomposición es la de utilidad, la de salida es la de identidad, con desplazamiento relativo `rho = 0.0`, `lambda` global de 0,0 y `ridge` de 1e-05. No se aplica ajuste fino de recuperación posterior, de modo que el checkpoint refleja el efecto puro de la eliminación de rango sobre los pesos densos originales.

La relevancia de este artefacto es metodológica más que práctica: permite a investigadores en seguridad y compresión de modelos evaluar si la reducción de rango degrada la alineación de seguridad de Llama 2 Chat de forma desproporcionada respecto a la pérdida de perplejidad. El autor advierte explícitamente de que las mediciones son preliminares y no constituyen una garantía de seguridad. El repositorio incluye ficheros de evaluación con WikiText-2 PPL, generaciones en AdvBench con juicios de HarmBench, y XSTest junto con los primeros 500 prompts de OR-Bench juzgados por WildGuard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 2 Chat soporta 4096 tokens) |
| Tipos de cuantizacion | No disponible; el repo contiene pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible (heredados del modelo base Llama 2, predominantemente ingles) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors (matrices densas plegadas, no factorizadas) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 2 de 7 mil millones de parametros, un transformer decoder-only con atención causal estándar, y no introduce cambios estructurales en la red. La modificación consiste en aplicar una descomposición SVD a las matrices de proyección y descartar un presupuesto de rango equivalente al 40 % nominal de los parámetros de proyección, lo que resulta en una fracción realizada de parámetros factoriales de 0,615424 respecto al total del modelo. Los pesos se han plegado de nuevo a matrices densas para facilitar la evaluación con Hugging Face Transformers, de modo que la representación de bajo rango subyacente no se expone como inferencia factorizada ni se demuestra una aceleración asociada.

El criterio de selección de componentes se basa en momentos de segundo orden: la métrica de entrada mezcla momentos de WikiText con 0,1 veces los momentos de prompts dañinos y respuestas seguras, y la métrica de salida es de identidad. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente; el autor aclara que estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos, dado que el corpus de métrica mixta es más amplio. No hay ajuste fino de recuperación ni RLHF/DPO adicional: el checkpoint es el resultado directo de la eliminación de rango sobre el modelo base ya alineado.

## Capacidades

- Generación de texto conversacional heredada de Llama 2 Chat, condicionada por la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en el formato de chat de Llama 2, sin garantías de calidad tras la eliminación de rango.
- Evaluación de seguridad: el checkpoint está pensado para medir tasas de ataque exitoso (ASR) en AdvBench con juicios de HarmBench, y comportamiento en XSTest y OR-Bench.
- Medición de perplejidad en WikiText-2 para cuantificar la pérdida de utilidad lingüística.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües no documentadas; se asumen las del modelo base, con dominio del inglés.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación controlado para estudiar la relación entre presupuesto de rango eliminado y degradación de capacidades en Llama 2 Chat de 7B.
- Auditoría de seguridad post-compresión: ejecutar los ficheros de evaluación incluidos (AdvBench con HarmBench, XSTest, OR-Bench con WildGuard) para medir si la eliminación de rango incrementa la tasa de respuestas dañinas frente al modelo original.
- Análisis de robustez de la alineación: comparar la perplejidad en WikiText-2 con las métricas de seguridad para detectar si la pérdida de utilidad y la pérdida de alineación están correlacionadas o desacopladas en este régimen de compresión.
- Reproducibilidad metodológica: el directorio `experiment/` contiene ajustes exactos, pérdidas de validación y código fuente, lo que permite replicar el pipeline SVD con otros presupuestos de rango o métricas.
- Diagnóstico por matriz: el fichero `compression.json` ofrece diagnósticos por matriz, útil para identificar qué proyecciones concentran la pérdida de capacidad y diseñar estrategias de compresión selectiva.
- Estudio de desplazamiento de seguridad (`rho`): con `rho = 0.0` como caso base, el checkpoint sirve de referencia para comparar variantes con desplazamiento relativo distinto en futuros pilotos del mismo autor.
- Docencia y formación: ejemplo práctico de cómo se documenta un experimento de compresión con métricas de utilidad y seguridad separadas, incluyendo advertencias sobre límites de validez.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los ficheros de evaluación contienen WikiText-2 PPL, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en la model card ni en los metadatos del repositorio. Se recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR, tal como advierte el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque no se publican variantes cuantizadas oficiales y habría que generarlas.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto limitado, y en RTX 3090/4080 (16 GB) con cuantización de 8 bits.
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con Llama 2, puede cargarse con Hugging Face Transformers, vLLM, TGI o llama.cpp tras conversión a GGUF. No se documenta soporte específico ni recetas oficiales.
- Latencia y throughput: no disponibles; el autor aclara que el upload no proporciona inferencia factorizada ni establece una aceleración, por lo que el rendimiento esperado es el de un Llama 2 7B denso estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0 | 6,74B (denso plegado) | No disponible | Compresión SVD con evaluación de seguridad | Llama 2 | Hugging Face, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4096 tokens | Modelo base alineado con RLHF | Llama 2 | Hugging Face, ampliamente usado |
| Variantes de poda/cuantización de Llama 2 7B (por ejemplo, Wanda, SparseGPT) | ~6,7B o menos | 4096 tokens | Poda no estructurada o cuantización | Llama 2 | Repositorios de investigación dispares |

La comparación directa con alternativas de compresión es limitada porque este checkpoint no publica métricas de rendimiento ni comparaciones en la model card. Su valor diferencial reside en el enfoque explícito en seguridad (AdvBench/HarmBench, XSTest, OR-Bench con WildGuard) frente a la compresión puramente orientada a perplejidad.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo listo para producción: el autor lo describe como un piloto unilateral y no como un SVD completo con conciencia de Fisher.
- Las mediciones de seguridad son preliminares y no establecen ninguna garantía de seguridad; pueden existir tasas de ataque exitoso superiores al modelo base.
- No hay ajuste fino de recuperación, por lo que se espera degradación de utilidad y coherencia respecto a Llama 2 Chat original.
- Los ejemplos de validación son retenidos del gradiente pero no completamente no vistos, lo que puede inflar ligeramente las estimaciones de calidad.
- Los pesos están plegados a matrices densas: no se ofrece inferencia factorizada ni se demuestra aceleración alguna.
- Sesgos: heredados de Llama 2 Chat y potencialmente amplificados o alterados por la compresión; no se documenta un análisis de sesgo específico.
- Riesgo de alucinación: no cuantificado en la información disponible; la pérdida de rango puede agravarlo.
- Idiomas: no documentados; se asume el comportamiento del modelo base, con sesgo hacia el inglés.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta, incluidos límites de usuarios mensuales y obligaciones de atribución; revisar antes de cualquier despliegue.
- Repositorio con muy baja adopción (14 descargas, 0 likes) y sin pipeline declarado, lo que dificulta la validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
