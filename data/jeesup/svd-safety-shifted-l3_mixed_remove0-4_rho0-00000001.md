# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.00000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup bajo la etiqueta de compresión de modelos y evaluación de seguridad. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional, sino de un experimento de compresión mediante descomposición en valores singulares (SVD) con un objetivo de desplazamiento de seguridad ("safety-shifted"). El autor elimina nominalmente un 40 % de los parámetros de proyección, lo que se traduce en una fracción de parámetros factoriales realizada de 0,652173 sobre el modelo completo, sin ningún ajuste fino de recuperación posterior.

El interés técnico reside en la metodología: el autor construye una métrica mixta que combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, y aplica una regularización ridge con un desplazamiento relativo rho de 1e-08 y un lambda global de 3,7353461647515404e-08. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, usando gradientes calculados sobre 128 ejemplos dañinos y 40 benignos.

Es relevante ahora porque explora si la compresión agresiva vía SVD puede preservar o alterar las propiedades de seguridad de un modelo alineado, un área poco documentada. El autor advierte explícitamente de que se trata de un piloto unilateral, no de un SVD completo con conciencia de Fisher, y de que las mediciones no establecen ninguna garantía de seguridad. Los pesos se publican como matrices densas plegadas por conveniencia de evaluación, sin inferencia factorizada ni aceleración demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3 8B Instruct, 8.192 tokens segun la familia, no confirmado aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct, un transformer decoder-only con atención causal estándar. Sobre esa base, el autor aplica una compresión por SVD con una eliminación nominal del 40 % de los parámetros de proyección, resultando en una fracción de parámetros factoriales realizada de 0,652173 sobre el modelo completo. No hay ajuste fino de recuperación: los pesos publicados son matrices densas plegadas de Hugging Face, y el presupuesto de rango describe la representación de bajo rango subyacente, pero el upload no proporciona inferencia factorizada ni establece una aceleración.

La innovación metodológica es la métrica de entrada mixta: combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, usando las mismas familias de textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizadas con sus propias plantillas de chat y perfiladas con sus propios pesos densos. El objetivo pondera igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente. El autor aclara que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Se aplica regularización ridge de 1e-05, un desplazamiento relativo rho de 1e-08 y un lambda global de 3,7353461647515404e-08. El autor califica el trabajo como piloto unilateral, no como SVD completo con conciencia de Fisher.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Llama 3 8B Instruct.
- Razonamiento general y respuesta a instrucciones, sujeto a la degradación introducida por la compresión SVD sin recuperación.
- Evaluación de seguridad: el checkpoint está diseñado como objeto de estudio para medir tasa de éxito de ataques (ASR) y comportamiento ante prompts dañinos.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada; el modelo base lo soporta, pero la compresión puede afectar a este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas tras la compresión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; el modelo base no los incluye.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint sirve para estudiar si la eliminación de parámetros vía SVD con métrica mixta preserva o degrada la alineación de seguridad de un modelo Instruct, comparando PPL en WikiText-2 con ASR en AdvBench y juicios de HarmBench.
- Evaluación de robustez ante jailbreaks: los archivos de evaluación incluyen generaciones en AdvBench y juicios en HarmBench, lo que permite analizar la tasa de éxito de ataques antes y después de la compresión.
- Análisis de sobre-rechazo: el conjunto XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard permiten medir si la compresión incrementa los rechazos excesivos en peticiones benignas.
- Estudio de coherencia tras compresión: el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con el ASR, de modo que el checkpoint sirve para diagnosticar degradación lingüística inducida por la eliminación de proyecciones.
- Reproducibilidad metodológica: los ajustes exactos, las pérdidas de validación y el código fuente están en `experiment/`, y los diagnósticos por matriz en `compression.json`, lo que permite replicar el pipeline de SVD con métrica mixta sobre otros checkpoints.
- Línea base para comparar variantes de compresión: al fijar rho, lambda y ridge concretos, este checkpoint actúa como referencia para pilotos posteriores con distintos porcentajes de eliminación o métricas de Fisher completas.
- Docencia en compresión de modelos: útil para ilustrar el efecto de la regularización ridge y del desplazamiento relativo en la descomposición de matrices de atención y MLP de un transformer de 8B.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los archivos de evaluación contienen PPL en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen los valores obtenidos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): aproximadamente 16 GB para los 8.030.261.248 parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones genéricas para un modelo de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en fp16 para inferencia básica.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 12-16 GB con cuantización de 8 o 4 bits, siempre que se aplique cuantización externa (no se documentan tipos de cuantización en el repo).
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con Hugging Face, puede cargarse con transformers, vLLM o TGI; llama.cpp y Ollama requerirían conversión a GGUF, no proporcionada.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el upload no establece ninguna aceleración pese al presupuesto de rango subyacente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.00000001 | 8,03B (densos plegados) | no disponible | llama3 | Hugging Face, 13 descargas | Piloto de compresión SVD con métrica mixta de seguridad |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 tokens (familia Llama 3) | llama3 | Hugging Face, ampliamente disponible | Modelo base sin compresión; referencia de comportamiento |
| meta-llama/Meta-Llama-3-8B | 8,03B | 8.192 tokens (familia Llama 3) | llama3 | Hugging Face | Variante base sin ajuste de instrucciones |
| Modelos comprimidos por poda/SVD de la familia Llama 3 8B | variable | variable | variable | variable | No se dispone de datos comparativos concretos en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que las mediciones piloto no establecen ninguna garantía de seguridad; no debe interpretarse como un modelo seguro por el hecho de llevar "safety" en el nombre.
- Es un piloto unilateral, no un SVD completo con conciencia de Fisher; los resultados no son extrapolables a otras variantes de compresión.
- No hay ajuste fino de recuperación tras la eliminación del 40 % de parámetros de proyección, por lo que es esperable degradación de coherencia y calidad de generación, que el autor recomienda inspeccionar junto al ASR.
- Los ejemplos de validación son retenidos del gradiente, pero no completamente no vistos respecto al corpus de métrica mixta; existe riesgo de sobreajuste a la calibración.
- El upload no proporciona inferencia factorizada ni aceleración; el presupuesto de rango es solo descriptivo de la representación subyacente.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente incrementado por la compresión.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3 8B Instruct.
- Idiomas soportados: no disponibles en la información proporcionada.
- Restricciones de licencia: sujeto a la Llama 3 Community License, que impone condiciones de uso comercial, atribución y restricciones de redistribución; revisar los términos antes de cualquier despliegue en producción.
- No apto para producción sin una evaluación propia y exhaustiva de seguridad, coherencia y calidad en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
