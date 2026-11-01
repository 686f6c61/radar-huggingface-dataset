# Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.01

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.01` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup como parte de un piloto sobre compresión de modelos y evaluación de seguridad, no como un modelo listo para producción. La idea central es eliminar un 50 % nominal de los parámetros de proyección (una fracción real de parámetros factoriales de 0,565216 sobre el modelo completo) sin aplicar un fine-tuning de recuperación posterior.

La innovación metodológica está en el uso de una métrica mixta para guiar la SVD: combina momentos de entrada de WikiText con un 10 % de momentos derivados de pares prompt-dañino/respuesta-segura, ponderando por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El resultado es un modelo de 8.030.261.248 parámetros con pesos densos ya plegados en formato Hugging Face, pensado para inspeccionar cómo afecta la compresión a la coherencia y a las tasas de éxito de ataques (ASR) en benchmarks como AdvBench, HarmBench, XSTest y OR-Bench.

Es relevante ahora porque aborda una pregunta abierta en el despliegue eficiente de LLM: si la compresión agresiva por SVD puede preservar o incluso alterar las propiedades de seguridad de un modelo alineado. El autor advierte explícitamente de que se trata de un piloto unilateral, no de una SVD completa con información de Fisher, y de que las mediciones no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3 8B Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (solo se publican safetensors densos) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención causal estándar y 8.030 millones de parámetros. Sobre ese modelo base, el autor aplica una compresión SVD guiada por una métrica mixta que combina momentos de segundo orden de WikiText (entrada) con un 10 % de momentos de pares prompt-dañino/respuesta-segura. La métrica de salida es la identidad, con un desplazamiento relativo `rho` de 0,01, un `lambda` global de 0,0373534616475154 y un término ridge de 1e-05. La eliminación nominal de parámetros de proyección es del 50 %, aunque la fracción real de parámetros factoriales sobre el modelo completo es de 0,565216.

No hay fine-tuning de recuperación tras la compresión. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente; el autor aclara que, al ser el corpus de la métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Los pesos publicados son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no ofrece inferencia factorizada ni demuestra una aceleración.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión SVD.
- Evaluación de seguridad: el checkpoint está diseñado para medir tasas de éxito de ataques (ASR) en AdvBench y juicios de HarmBench.
- Evaluación de sobre-rechazo: incluye XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- Medición de perplejidad en WikiText-2 para controlar la coherencia tras la compresión.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada (se heredaría del modelo base, pero no se valida en la model card).
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la información disponible.
- Capacidades multilingües: no disponibles; el autor no documenta idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint para medir cómo varía la ASR en AdvBench y HarmBench respecto al modelo base sin comprimir, comparando las generaciones guardadas en los ficheros de evaluación.
- Estudio de sobre-rechazo tras compresión: ejecutar XSTest y los 500 prompts de OR-Bench con WildGuard para cuantificar si la compresión aumenta o reduce los rechazos innecesarios en prompts benignos.
- Análisis de coherencia y degradación: calcular la perplejidad en WikiText-2 y compararla con la del Llama 3 8B Instruct original para aislar el coste de la eliminación del 50 % de parámetros de proyección.
- Reproducción de metodología SVD: el directorio `experiment/` y el fichero `compression.json` permiten replicar los ajustes exactos, las pérdidas de validación y los diagnósticos por matriz, útil para quien investigue técnicas de compresión guiada por métricas.
- Base para experimentos de recuperación: al no incluir fine-tuning de recuperación, sirve como punto de partida controlado para estudiar si un ajuste posterior recupera capacidades o seguridad.
- Evaluación de robustez de salvaguardas en despliegues comprimidos: permite comprobar empíricamente si reducir parámetros por SVD debilita las defensas del modelo alineado antes de plantear compresiones en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los ficheros de evaluación contienen perplejidad de WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen cifras numéricas en la información proporcionada. El autor insiste en que estas mediciones piloto no establecen una garantía de seguridad y recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) suficiente para FP16 con contexto limitado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 12 GB.
- Opciones de despliegue: al ser safetensors densos compatibles con Hugging Face Transformers, se puede cargar con `transformers`, `vLLM` o `TGI`; para cuantización, `llama.cpp`/`Ollama` requerirían conversión previa a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; el autor advierte que la subida no proporciona inferencia factorizada ni establece una aceleración, por lo que el rendimiento esperado es el de un Llama 3 8B denso estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.01 | 8.030 M | no disponible | Compresión SVD con métrica mixta de seguridad | llama3 | Hugging Face, 16 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens (según ficha oficial de Llama 3) | Modelo base alineado con RLHF | llama3 | Hugging Face, ampliamente disponible |
| Modelos de compresión SVD de Llama 3 8B (familia Jeesup) | ~8.030 M | no disponible | Variantes con distintos `rho` y fracciones de eliminación | llama3 | Hugging Face, mismo autor |

La comparación directa con alternativas de compresión publicadas por terceros no está disponible en la información proporcionada. El principal contraste es con el modelo base sin comprimir, que conserva todos los parámetros de proyección y no ha pasado por el proceso SVD.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como un piloto unilateral y no como una SVD completa con información de Fisher.
- No hay fine-tuning de recuperación, por lo que es esperable una degradación de capacidades respecto al Llama 3 8B Instruct original; no se cuantifica en la información disponible.
- Las mediciones de seguridad (AdvBench, HarmBench, XSTest, OR-Bench) son piloto y no establecen ninguna garantía de seguridad; hay que inspeccionar coherencia y fracciones puntuadas junto con la ASR.
- Riesgo de alucinación: no documentado específicamente, pero la compresión agresiva puede incrementarlo; no hay datos al respecto.
- Sesgos conocidos: no documentados; se heredan los del modelo base, sin evaluación adicional.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Restricciones de licencia: licencia Llama 3 Community License, que impone condiciones de uso comercial, atribución y restricciones de redistribución; revisar los términos antes de cualquier uso comercial.
- La representación de bajo rango no se materializa en inferencia factorizada en esta subida, por lo que no se debe esperar una aceleración por el rango reducido.
- Los ejemplos de validación no son completamente no vistos respecto al corpus de calibración de la métrica mixta, lo que limita la interpretación de las pérdidas de validación.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
