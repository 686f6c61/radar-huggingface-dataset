# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.003

## Resumen

`Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. No es un modelo nuevo entrenado desde cero, sino un experimento de compresión de pesos en el que se elimina aproximadamente el 40 % de los parámetros de proyección (fracción realizada de parámetros factoriales de 0,652173 sobre el modelo completo) sin fine-tuning de recuperación posterior. Lo publica el usuario Jeesup como parte de un pilotaje sobre compresión consciente de la seguridad.

El interés técnico reside en la metodología: la métrica de entrada combina momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura (ponderados al 0,1), y el objetivo de optimización pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. Esto lo convierte en una sonda para estudiar si una compresión agresiva puede preservar o alterar el comportamiento de rechazo de un modelo alineado.

El modelo tiene 8.030.261.248 parámetros, mantiene la licencia Llama 3 y se distribuye en safetensors con las matrices densas ya plegadas para facilitar la evaluación. Es un artefacto de investigación, no un modelo listo para producción: el propio autor advierte que no establece garantías de seguridad ni proporciona inferencia factorizada con aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B), pesos comprimidos por SVD y plegados a matrices densas |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención causal estándar. Sobre ella se aplica una compresión por SVD con eliminación nominal del 40 % de los parámetros de proyección; la fracción realizada de parámetros factoriales en el modelo completo es 0,652173. No hay fine-tuning de recuperación tras la compresión. Los pesos se publican plegados como matrices densas de Hugging Face, de modo que el checkpoint es cargable con la clase estándar de Llama, aunque el presupuesto de rango describe una representación de bajo rango subyacente que este upload no expone como inferencia factorizada.

El procedimiento de compresión usa una métrica de entrada mixta: momentos de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambos conjuntos comparten los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. La métrica de salida es la identidad, con un desplazamiento relativo rho de 0,003, lambda global de 0,011206038494254621 y ridge de 1e-05. El gradiente se calcula sobre 128 ejemplos dañinos y 40 benignos, con validación de entropía cruzada sobre 32 y 12 ejemplos separados respectivamente; el autor aclara que, al ser el corpus de la métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no completamente ajenos a la calibración. El propio autor califica el experimento de pilotaje unilateral, no de SVD plenamente consciente de Fisher.

## Capacidades

- Generación de texto instructiva heredada de Llama 3 8B Instruct (el checkpoint base sobre el que se aplica la compresión).
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la degradación introducida por la compresión sin recuperación.
- Comportamiento de rechazo ante prompts dañinos, objeto central del experimento: se evalúa con generaciones en AdvBench y juicios HarmBench.
- Evaluación de sobre-rechazo mediante XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- Métricas de fluidez y coherencia mediante perplejidad en WikiText-2.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigación sobre compresión consciente de la seguridad: usar el checkpoint para medir cómo varía la tasa de éxito de ataques (ASR) en AdvBench/HarmBench al eliminar el 40 % de parámetros de proyección, comparando con el modelo denso original.
- Estudio de sobre-rechazo en modelos comprimidos: ejecutar XSTest y OR-Bench con juicios WildGuard para cuantificar si la compresión incrementa los falsos rechazos en prompts benignos.
- Análisis de degradación de fluidez: medir perplejidad en WikiText-2 frente a Llama 3 8B Instruct para aislar el coste de la compresión sin recuperación.
- Reproducibilidad de metodologías SVD: los archivos `experiment/` y `compression.json` permiten replicar los ajustes exactos, las pérdidas de validación y los diagnósticos por matriz.
- Baseline para técnicas de recuperación: servir como punto de partida para experimentos de fine-tuning de recuperación que intenten restaurar capacidades tras la compresión.
- Auditoría de licencias y despliegue controlado: al heredar la licencia Llama 3, puede integrarse en entornos de investigación que ya operan con modelos Llama, siempre con revisión de coherencia y fracciones puntuadas junto al ASR.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan los valores. El autor advierte explícitamente que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 16,1 GB en safetensors.
- VRAM estimada en 8 bits: en torno a 8-9 GB de pesos, más overhead.
- VRAM estimada en 4 bits: en torno a 4-5 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para evaluación por lotes; RTX 4090 (24 GB) suficiente para fp16 en inferencia individual.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB en fp16 con cuidado en la longitud de contexto; en 4-8 bits cabe en GPUs de 8-12 GB.
- Opciones de despliegue: transformers estándar (pesos densos plegados), vLLM y TGI para servir; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles; el autor señala que el upload no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (SVD safety-shifted) | 8.030.261.248 | no disponible | llama3 | Compresión SVD al 40 % sin recuperación; artefacto de investigación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (según ficha oficial de Llama 3) | llama3 | Modelo denso original, referencia de comparación |
| Modelos de compresión tipo SVD/Wanda/SparseGPT sobre Llama 3 8B | ~8B (con poda) | heredado | según base | Metodologías comparables, sin datos numéricos disponibles aquí |

No se dispone de resultados de benchmarks de este checkpoint para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un pilotaje unilateral, no una SVD plenamente consciente de Fisher; los resultados no deben generalizarse a otras configuraciones de compresión.
- No hay fine-tuning de recuperación, por lo que es esperable degradación de capacidades y coherencia respecto al modelo denso original.
- El autor advierte que las mediciones no establecen una garantía de seguridad; deben inspeccionarse coherencia y fracciones puntuadas junto al ASR.
- Los ejemplos de validación son retenidos del gradiente, pero no completamente ajenos a la calibración, lo que puede inflar las métricas.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la compresión.
- Sesgos heredados de Llama 3 8B Instruct, sin mitigaciones adicionales documentadas.
- Licencia Llama 3 Community License: restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingüe no está confirmada.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni artefactos de inferencia factorizada; el despliegue eficiente requiere trabajo adicional.
- El checkpoint está pensado para evaluación, no para producción.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Archivos de experimento y diagnósticos: disponibles en el repositorio (`experiment/`, `compression.json`)
