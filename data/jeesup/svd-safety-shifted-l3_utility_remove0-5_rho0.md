# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0

## Resumen

`Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0` es un checkpoint de investigación publicado por el usuario Jeesup que parte de `meta-llama/Meta-Llama-3-8B-Instruct` y le aplica una compresión mediante descomposición en valores singulares (SVD) con un objetivo de "desplazamiento de seguridad" (*safety shift*). El autor elimina nominalmente el 50 % de los parámetros de proyección (fracción real de parámetros factoriales sobre el modelo completo: 0,565216) sin fine-tuning de recuperación posterior. No es un modelo pensado para uso en producción, sino una sonda experimental para estudiar cómo afecta la compresión de bajo rango al equilibrio entre utilidad (perplejidad en WikiText-2) y seguridad (tasa de éxito de ataques en AdvBench, juicios HarmBench, XSTest y OR-Bench).

El modelo conserva la arquitectura y el tamaño del Llama 3 8B Instruct original: 8.030.261.248 parámetros, pesos en formato safetensors densos (16,1 GB de repositorio). La innovación no está en la arquitectura ni en el entrenamiento, sino en el procedimiento de compresión: una proyección SVD guiada por un objetivo mixto que combina momentos de entrada de WikiText con momentos de pares prompt-dañino/respuesta-segura ponderados por 0,1. El autor advierte explícitamente de que se trata de un piloto unilateral, no de un SVD completo con información de Fisher.

Su relevancia es metodológica: ofrece un punto de referencia reproducible para investigar si la compresión agresiva degrada preferentemente la utilidad o los mecanismos de rechazo de contenido dañino. La model card incluye los artefactos de evaluación (PPL de WikiText-2, generaciones de AdvBench, juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard), lo que permite auditar el efecto de la compresión más allá de una única métrica agregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos con representación subyacente de bajo rango vía SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors densos) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE. Sobre esos pesos, el autor aplica una compresión SVD con eliminación nominal del 50 % de los parámetros de proyección; la fracción realizada de parámetros factoriales sobre el modelo completo es 0,565216. No hay fine-tuning de recuperación tras la compresión, de modo que el checkpoint refleja el efecto puro del truncamiento de rango sobre los pesos originales.

El procedimiento de compresión usa una métrica mixta: momentos de entrada de WikiText combinados con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias se renderizan con sus propias plantillas de chat y se perfilan con sus propios pesos densos; las respuestas de referencia incluyen textos generados por un profesor Llama 2. El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados. El autor señala que, al ser el corpus de métrica mixta más amplio, estos ejemplos están retenidos del gradiente pero no son completamente ajenos a la calibración. Los hiperparámetros declarados son desplazamiento relativo rho = 0,0, lambda global = 0,0 y ridge = 1e-05. Se trata de un piloto unilateral, no de un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3 8B Instruct (no se documentan capacidades adicionales específicas de este checkpoint).
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la degradación introducida por la compresión SVD.
- Evaluación de seguridad: el checkpoint está instrumentado para medir tasa de éxito de ataques (ASR) en AdvBench con juicios HarmBench, y comportamiento de rechazo en XSTest y OR-Bench con juicios WildGuard.
- Medición de utilidad mediante perplejidad en WikiText-2.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como punto de comparación en estudios que midan cómo el truncamiento SVD de bajo rango afecta la tasa de rechazo de prompts dañinos frente a la perplejidad en texto benigno.
- Auditoría de artefactos de evaluación: los ficheros de evaluación incluidos (PPL de WikiText-2, generaciones de AdvBench, juicios HarmBench, XSTest y OR-Bench con WildGuard) permiten reproducir y contrastar metodologías de evaluación de seguridad sin necesidad de regenerar las salidas.
- Análisis de coherencia post-compresión: inspeccionar las generaciones para detectar degradación gramatical o colapso de formato antes de extraer conclusiones sobre ASR, tal como recomienda el propio autor.
- Estudio de calibración de objetivos mixtos: servir de referencia para experimentos que varíen rho, lambda o el peso de los momentos de seguridad en la métrica de compresión.
- Docencia y formación en evaluación de modelos: ejemplo práctico de por qué una única métrica agregada (ASR o PPL) es insuficiente y de la necesidad de reportar fracciones puntuadas y coherencia.
- Baseline negativo en pipelines de selección de modelos: descartar checkpoints comprimidos sin recuperación cuando los requisitos de producción exijan robustez de seguridad verificada.

## Benchmarks y rendimiento

La model card indica que los ficheros de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard. Sin embargo, no se proporcionan en la información disponible los valores numéricos concretos de estos resultados.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para secuencias cortas.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB, L40S 48 GB; también válidas RTX 4090 24 GB y A6000 48 GB para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con margen ajustado; en GPUs de 16 GB requeriría cuantización, que no se distribuye en este repositorio.
- Opciones de despliegue: al publicarse como matrices densas en safetensors, es compatible con los runners estándar de Llama 3 (transformers, vLLM, TGI) una vez cargado el checkpoint; llama.cpp y Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles. El autor advierte explícitamente de que el upload no proporciona inferencia factorizada ni establece ninguna mejora de velocidad; el presupuesto de rango describe la representación subyacente, no el artefacto desplegado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-shifted-l3_utility_remove0.5_rho0 | 8,03 B | no disponible | Checkpoint de investigación comprimido por SVD, sin fine-tuning de recuperación | llama3 | Hugging Face (15 descargas) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (modelo base) | Modelo instructivo original de Meta | llama3 | Hugging Face |
| Checkpoints de compresión SVD de Llama 3 sin desplazamiento de seguridad | ~8 B (variable) | no disponible | Compresión de bajo rango con objetivo solo de utilidad | llama3 | Depende del autor |

La comparación relevante es frente al modelo base sin comprimir: este checkpoint introduce una perturbación deliberada en el equilibrio utilidad-seguridad y no documenta mejoras de eficiencia en inferencia, por lo que no compite con alternativas de despliegue eficiente.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara explícitamente que las mediciones piloto no establecen ninguna garantía de seguridad.
- Sin fine-tuning de recuperación: la compresión al 50 % nominal de parámetros de proyección puede degradar tanto la calidad del texto como los comportamientos de rechazo; debe inspeccionarse la coherencia antes de interpretar el ASR.
- Piloto unilateral: no es un SVD completo con información de Fisher; los resultados no son extrapolables a variantes con otros valores de rho o lambda.
- Calibración parcialmente solapada: los ejemplos de validación CE están retenidos del gradiente pero no son completamente ajenos al corpus de calibración de la métrica mixta.
- Sin ganancia de eficiencia demostrada: los pesos se distribuyen como matrices densas plegadas; no hay inferencia factorizada ni speedup establecido.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; hereda los del modelo base Llama 3 8B Instruct y pueden amplificarse por la compresión.
- Idiomas: no documentados; la evaluación se centra en corpus en inglés (WikiText-2, AdvBench, XSTest, OR-Bench).
- Licencia llama3: el uso comercial está sujeto a la Llama 3 Community License, incluidos los requisitos de atribución "Built with Meta Llama 3" y las restricciones de la política de uso aceptable.
- No apto para producción: sin benchmarks numéricos publicados ni validación externa, no debe desplegarse en aplicaciones orientadas a usuarios.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Artefactos de evaluación y código fuente: directorio `experiment/` del repositorio (según la model card)
- Diagnósticos por matriz: `compression.json` del repositorio (según la model card)
