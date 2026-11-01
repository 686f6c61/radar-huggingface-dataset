# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.0000001

## Resumen

Este checkpoint es un experimento de investigación publicado por el usuario Jeesup sobre compresión de modelos mediante descomposición en valores singulares (SVD) aplicada a `meta-llama/Meta-Llama-3-8B-Instruct`. El objetivo no es ofrecer un modelo listo para producción, sino medir cómo afecta la eliminación de componentes de bajo rango a las capacidades de seguridad del modelo original. Concretamente, se elimina nominalmente un 40% de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,652173 sobre el modelo completo.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros y pesos en formato safetensors ya plegados (dense) para facilitar la evaluación. La innovación metodológica está en el uso de una métrica mixta que combina momentos de entrada de WikiText con momentos de pares prompt-dañino/respuesta-segura, ponderados a 0,1, para guiar la selección de componentes a eliminar. El desplazamiento relativo rho es de 1e-07 y el lambda global de 3,735e-07, con ridge de 1e-05.

Es relevante ahora porque forma parte de una línea de trabajo sobre seguridad en modelos comprimidos: permite estudiar si la compresión SVD degrada o altera las barreras de seguridad de un modelo alineado. El autor lo describe explícitamente como un piloto unilateral y no como un SVD completo consciente de Fisher, y advierte que no establece ninguna garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only con 8.030 millones de parámetros. Sobre él se aplica una compresión por SVD con un presupuesto de rango que elimina nominalmente el 40% de los parámetros de proyección; la fracción realizada de parámetros factoriales sobre el modelo completo es 0,652173. No hay fine-tuning de recuperación posterior a la compresión. Los pesos subidos son matrices densas de Hugging Face ya plegadas para facilitar la evaluación, y el autor aclara que el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no proporciona inferencia factorizada ni demuestra una aceleración.

La selección de componentes se guía por una métrica mixta: momentos de entrada de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias usan los mismos textos de respuesta de referencia, incluidos los del profesor Llama-2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada (CE) de respuesta segura a prompt dañino y la CE de respuesta útil a prompt benigno. El gradiente emplea 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados respectivamente. El autor advierte que el corpus de la métrica mixta es más amplio, por lo que estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Se trata de un piloto unilateral y no de un SVD completo consciente de Fisher.

## Capacidades

- Generación de texto y razonamiento heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión.
- Seguimiento de instrucciones conversacionales, con posible pérdida de coherencia según el grado de compresión.
- Capacidades multilingües heredadas del modelo base, aunque no se documentan idiomas específicos en esta ficha.
- No se documenta soporte explícito de tool calling, function calling ni agentes en la información disponible.
- No se documenta modo thinking, visión ni audio.
- El propósito principal del checkpoint es la evaluación de seguridad, no el uso generalista.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para estudiar cómo la eliminación de componentes de bajo rango afecta a las métricas de seguridad y perplejidad, usando los ficheros de evaluación incluidos en el repositorio.
- Evaluación de seguridad comparada: permite medir la tasa de éxito de ataques (ASR) en AdvBench y los juicios de HarmBench frente al modelo base sin comprimir, para cuantificar el efecto de la compresión sobre las barreras de alineamiento.
- Análisis de coherencia bajo compresión: los ficheros de evaluación incluyen PPL en WikiText-2 y fracciones puntuadas, lo que permite estudiar la degradación de la calidad del lenguaje tras eliminar el 40% nominal de los parámetros de proyección.
- Estudio de métricas mixtas de calibración: el checkpoint documenta una metodología concreta (momentos de WikiText más pares dañino/seguro) que puede replicarse o compararse con otras variantes de compresión SVD.
- Validación de robustez en XSTest y OR-Bench: los ficheros de evaluación incluyen XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, útiles para analizar el comportamiento en prompts ambiguos o potencialmente dañinos.
- Reproducibilidad de experimentos: el directorio `experiment/` contiene ajustes exactos, pérdidas de validación y código fuente, y `compression.json` incluye diagnósticos por matriz, lo que facilita replicar el piloto.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los ficheros de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 8.030 millones de parámetros, en FP16 se requieren aproximadamente 16 GB de pesos, y en cuantización de 8 bits alrededor de 8 GB, aunque estas cifras son estimaciones genéricas y no están confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 8B en FP16 podría caber en GPUs con 16 GB o más, pero no se documenta.
- Opciones de despliegue: al ser pesos safetensors densos compatibles con Hugging Face, podría cargarse con transformers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor aclara explícitamente que esta subida no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.0000001 | 8.030.261.248 | no disponible | llama3 | Hugging Face, 14 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 millones (aprox.) | 8.192 tokens (modelo base) | llama3 | Hugging Face, ampliamente disponible |
| Otras variantes de compresión SVD de Llama 3 8B | no disponible | no disponible | variable | no disponible |

La comparación directa con el modelo base es la más relevante: este checkpoint elimina nominalmente el 40% de los parámetros de proyección y no aplica fine-tuning de recuperación, por lo que se espera una degradación de calidad y de comportamiento de seguridad respecto al original, aunque no se aportan cifras concretas en la información disponible.

## Limitaciones y advertencias

- El autor advierte explícitamente que las mediciones piloto no establecen ninguna garantía de seguridad.
- Es un piloto unilateral y no un SVD completo consciente de Fisher, lo que limita la generalización de sus conclusiones.
- No hay fine-tuning de recuperación tras la compresión, por lo que la degradación de capacidades puede ser significativa.
- Los ejemplos de validación CE no son completamente no vistos, ya que el corpus de la métrica mixta es más amplio.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible.
- La licencia llama3 impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales.
- El repositorio tiene solo 14 descargas y 0 likes, lo que sugiere poca validación externa.
- No debe usarse como modelo de producción sin una evaluación independiente de coherencia, seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
