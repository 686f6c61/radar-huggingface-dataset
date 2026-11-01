# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.01

## Resumen

`Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.01` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup y no constituye un modelo nuevo entrenado desde cero, sino un experimento de compresión que elimina parcialmente parámetros de proyección y evalúa el efecto sobre la alineación de seguridad del modelo base.

El checkpoint aplica una eliminación nominal del 40 % de los parámetros de proyección, con una fracción realizada de parámetros de factor sobre el modelo completo de 0,652173. La innovación metodológica es que la métrica de entrada combina momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura, de modo que la SVD se desplaza hacia direcciones relevantes para la negativa segura. No hay fine-tuning de recuperación posterior.

Es relevante para quienes investigan compresión de modelos y su impacto en seguridad: permite estudiar si una compresión agresiva degrada la tasa de rechazo ante prompts dañinos (ASR) y cómo afecta a la perplejidad. Es un piloto unilateral, no un SVD completo con información de Fisher, y el autor advierte que no establece ninguna garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original) |
| Idiomas soportados | no disponibles |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only de 8.030 millones de parámetros. Sobre ese checkpoint se aplica una compresión SVD con una métrica de entrada mixta: momentos de entrada de WikiText-2 más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. La métrica de salida es la identidad. Los hiperparámetros declarados son un desplazamiento relativo rho de 0,01, un lambda global de 0,0373534616475154 y un ridge de 1e-05.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, respectivamente. El autor aclara que, al ser el corpus de la métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Las familias dañina y benigna comparten los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. No hubo fine-tuning de recuperación. Los pesos subidos son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no ofrece inferencia factorizada ni demuestra una aceleración.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct.
- Razonamiento e instrucciones multi-turno según el comportamiento del modelo base.
- Capacidad de rechazo ante prompts dañinos, objetivo central del experimento; su robustez debe medirse, no asumirse.
- No se documentan capacidades de tool calling, agentes o visión en la información disponible; deben asumirse las del modelo base sin garantía tras la compresión.
- Capacidades multilingües no verificadas en este checkpoint.

## Casos de uso

- Investigación en compresión de modelos: comparar la perplejidad en WikiText-2 y la tasa de rechazo frente al modelo base para cuantificar el coste de seguridad de una eliminación del 40 % de parámetros de proyección.
- Auditoría de alineación: usar los ficheros de evaluación incluidos (AdvBench, HarmBench, XSTest, OR-Bench con juicios de WildGuard) para replicar el protocolo y estudiar la coherencia de las generaciones junto con el ASR.
- Estudio de métricas dirigidas: analizar cómo el sesgo de la métrica mixta (momentos de prompt dañino/respuesta segura) afecta a las direcciones preservadas por la SVD frente a una SVD estándar.
- Base para experimentos de recuperación: punto de partida para probar fine-tuning de recuperación posterior y medir si se restaura la capacidad de rechazo sin perder perplejidad.
- Docencia y divulgación: ejemplo reproducible de pipeline de compresión SVD con evaluación de seguridad, dado que el autor publica código y diagnósticos por matriz en `experiment/` y `compression.json`.
- Evaluación comparativa de jueces automáticos: emplear las generaciones almacenadas para comparar el comportamiento de distintos clasificadores de seguridad (HarmBench, WildGuard) sobre un mismo conjunto de salidas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en fp16/BF16 para los 8.030 millones de parámetros (el repo ocupa 16,1 GB), más overhead de activaciones y KV cache.
- En cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB, aunque el repo no incluye versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en GPUs de 16 GB en fp16 con contexto reducido; en 8/4 bits cabría en GPUs de 8-12 GB.
- Opciones de despliegue: al ser safetensors densos compatibles con Hugging Face, puede cargarse con transformers, vLLM o TGI; llama.cpp/Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles; el autor advierte que esta subida no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (svd-safety-shifted) | 8,03 B | no disponible | Compresión SVD con sesgo de seguridad | llama3 | Hugging Face, 14 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (modelo base) | Modelo instructivo original | llama3 | Hugging Face, ampliamente usado |
| Alternativas de compresión SVD de Llama 3 | no disponible | no disponible | Eliminación de bajo rango | variable | no disponible |

No se dispone de datos de benchmarks de este checkpoint que permitan una comparación cuantitativa con el modelo base ni con otras variantes comprimidas.

## Limitaciones y advertencias

- No establece ninguna garantía de seguridad: el propio autor califica las mediciones como piloto y advierte que no constituyen una garantía.
- Es un piloto unilateral, no un SVD completo con información de Fisher; los resultados pueden no generalizar a otros presupuestos de rango o métricas.
- La eliminación del 40 % de parámetros de proyección puede degradar coherencia, razonamiento y capacidad de rechazo; debe inspeccionarse la coherencia y las fracciones puntuadas junto con el ASR.
- Los ejemplos de validación CE son retenidos del gradiente, no completamente no vistos, lo que puede inflar la aparente calidad de la calibración.
- Riesgo de alucinación y sesgos heredados de Llama-3-8B-Instruct, potencialmente amplificados por la compresión.
- Idiomas soportados no verificados en este checkpoint.
- Licencia llama3: el uso comercial está sujeto a la Llama 3 Community License y a las restricciones de la política de uso aceptable de Meta.
- No ofrece inferencia factorizada ni aceleración demostrada; el presupuesto de rango solo describe la representación subyacente.
- Solo 14 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
