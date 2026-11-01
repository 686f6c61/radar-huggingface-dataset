# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.00000001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.00000001` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup. No se trata de un modelo nuevo entrenado desde cero, sino de una intervención de compresión sobre los pesos del modelo base de Meta: se aplica una descomposición en valores singulares (SVD) con eliminación nominal del 40 % de los parámetros de proyección, sin fine-tuning de recuperación posterior. El objetivo declarado es estudiar el efecto de este tipo de compresión sobre la seguridad del modelo, es decir, sobre su comportamiento frente a prompts dañinos, manteniendo a la vez una métrica de utilidad basada en WikiText.

La relevancia del checkpoint es metodológica más que práctica: forma parte de un piloto sobre compresión consciente de la seguridad (safety-aware SVD), en el que se mezclan momentos de entrada de WikiText con momentos de pares prompt dañino/respuesta segura para guiar la proyección. El autor lo describe explícitamente como un piloto unilateral, no como un SVD completo con información de Fisher, y advierte de que las mediciones no constituyen una garantía de seguridad. El modelo conserva la arquitectura y el tamaño del Llama 3 8B Instruct original (8.030.261.248 parámetros), con los pesos ya plegados en matrices densas para facilitar la evaluación.

Por tanto, esta ficha debe leerse como la de un artefacto de investigación reproducible, no como la de un modelo listo para producción. La licencia es Llama 3, heredada del modelo base, y el repo ocupa 16,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3 8B Instruct, 8.192 tokens según la documentación oficial de Meta) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de 128.000 entradas. Sobre esa base, el autor aplica una compresión por SVD de las matrices de proyección con una eliminación nominal del 40 % de los parámetros de proyección; la fracción realizada de parámetros factoriales sobre el modelo completo es 0,652173. No hay fine-tuning de recuperación tras la compresión, de modo que el checkpoint refleja el efecto directo de la proyección sobre los pesos.

El procedimiento de calibración mezcla momentos de entrada de WikiText (métrica de utilidad) con 0,1 veces los momentos de pares prompt dañino/respuesta segura (métrica de identidad). El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se estima con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, respectivamente, que son held-out del gradiente pero no completamente ajenos al corpus de calibración. Los hiperparámetros incluyen un desplazamiento relativo rho de 1e-08, un lambda global de 1,3767206634182494e-08 y un ridge de 1e-05. El autor subraya que se trata de un piloto unilateral y no de un SVD completo con información de Fisher.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del Llama 3 8B Instruct base, sujetos a la degradación introducida por la compresión SVD sin recuperación.
- Instrucciones y diálogo multi-turno, con la plantilla de chat original de Llama 3.
- Capacidad de código y matemáticas propia del modelo base, no verificada específicamente en este checkpoint.
- Soporte de tool calling y function calling heredado del formato de Llama 3 Instruct (no validado en este checkpoint).
- Capacidades multilingües del modelo base, aunque el autor no documenta idiomas soportados para esta variante.
- No incluye visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre compresión consciente de la seguridad: el checkpoint sirve para reproducir y auditar el efecto de la eliminación SVD del 40 % sobre las tasas de ataque exitoso (ASR) en AdvBench y los juicios de HarmBench, comparándolo con el modelo base sin comprimir.
- Evaluación de robustez frente a jailbreaks: los ficheros de evaluación incluyen generaciones en AdvBench y juicios en HarmBench, lo que permite medir cómo cambia la resistencia a prompts dañinos tras la proyección.
- Análisis de sobre-rechazo: los resultados de XSTest y los primeros 500 prompts de OR-Bench (juzgados con WildGuard) permiten estudiar si la compresión incrementa los rechazos ante peticiones benignas.
- Estudio de la relación utilidad-seguridad: la métrica de perplejidad en WikiText-2 junto con las métricas de seguridad permite trazar curvas de compromiso entre calidad lingüística y alineamiento.
- Reproducibilidad de experimentos de SVD: los ajustes exactos, las pérdidas de validación y el código fuente están en `experiment/`, y los diagnósticos por matriz en `compression.json`, lo que facilita replicar el pipeline sobre otros checkpoints.
- Docencia y formación en seguridad de modelos: sirve como ejemplo didáctico de cómo una intervención puramente algebraica sobre los pesos puede alterar propiedades de seguridad sin reentrenamiento.

## Benchmarks y rendimiento

El autor reporta métricas de evaluación en el repositorio (perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard), pero no se han incluido los valores numéricos en la información proporcionada. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor advierte además de que estas mediciones piloto no establecen una garantía de seguridad y que deben interpretarse junto con la coherencia de las generaciones y la fracción de respuestas puntuadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (aunque el repo no publica versiones cuantizadas, es convertible con herramientas estándar).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para FP16 con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, al ser un checkpoint denso estándar de Llama 3.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica explícitamente que esta subida no proporciona inferencia factorizada ni establece una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.00000001 | 8,03 B | no disponible (heredado, 8.192 del base) | Checkpoint comprimido por SVD para investigación de seguridad | llama3 | HuggingFace, 12 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Modelo instructivo original de Meta | llama3 | HuggingFace, ampliamente adoptado |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo instructivo de generación siguiente | llama3.1 | HuggingFace, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Modelo instructivo de referencia de Mistral AI | Apache 2.0 | HuggingFace, ampliamente adoptado |

La comparación relevante es contra el propio Llama 3 8B Instruct, ya que este checkpoint es una transformación algebraica de él; frente a Mistral, la diferencia clave es la licencia (llama3 frente a Apache 2.0) y el contexto. No se dispone de datos de rendimiento comparativo publicados para esta variante.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como un piloto unilateral, no como un SVD completo con información de Fisher, y advierte de que no establece ninguna garantía de seguridad.
- Degradación de calidad: la eliminación del 40 % de parámetros de proyección sin fine-tuning de recuperación puede deteriorar la coherencia y la calidad de las respuestas; el autor recomienda inspeccionar la coherencia junto con las métricas de ASR.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad para esta variante; el riesgo es al menos el del modelo base y probablemente mayor por la compresión.
- Sesgos: no documentados para esta variante; hereda los sesgos del Llama 3 8B Instruct original.
- Idiomas: no se documentan idiomas soportados en esta variante; se asume el multilingüismo del base, sin verificación.
- Licencia: Llama 3 Community License, con restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales) y obligaciones de atribución a Meta; no es una licencia de código abierto permisiva.
- Producción: no apto para despliegue en producción sin una evaluación propia exhaustiva; el autor no proporciona inferencia factorizada ni mejora de velocidad, y el checkpoint está pensado para evaluación.
- Calibración: los ejemplos de validación son held-out del gradiente pero no completamente ajenos al corpus de calibración, lo que puede inflar ligeramente las métricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Ficheros de experimento y código fuente: disponibles en el directorio `experiment/` del repositorio de HuggingFace
- Diagnósticos por matriz: `compression.json` en el repositorio de HuggingFace
- WikiText-2: https://huggingface.co/datasets/wikitext
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
