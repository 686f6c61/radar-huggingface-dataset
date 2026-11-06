# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.000001

## Resumen

Este checkpoint es un experimento de investigacion sobre compresion de modelos y evaluacion de seguridad, derivado de `meta-llama/Llama-2-7b-chat-hf`. El autor, Jeesup, aplica una descomposicion en valores singulares (SVD) con un sesgo explicito hacia la utilidad: elimina nominalmente un 40% de los parametros de proyeccion, lo que se traduce en una fraccion real de parametros factorizados de 0,615424 sobre el modelo completo. No hay fine-tuning de recuperacion posterior, de modo que el checkpoint resultante esta pensado para medir el efecto de la compresion sobre la seguridad, no para desplegarse en produccion.

La innovacion metodologica esta en el diseno del objetivo: en lugar de una SVD convencional guiada solo por la reconstruccion, se combinan momentos de entrada de WikiText con una fraccion (0,1) de momentos de prompts daninos y respuestas seguras, ponderando por igual la entropia cruzada de respuestas seguras ante prompts daninos y la de respuestas utiles ante prompts benignos. El resultado es un piloto "one-sided", no una SVD completa con informacion de Fisher, tal y como advierte el propio autor.

Es relevante ahora porque aborda una pregunta abierta en el campo: si la compresion agresiva de un modelo alineado degrada sus defensas frente a ataques de jailbreak. El repo incluye artefactos de evaluacion (perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y las primeras 500 prompts de OR-Bench juzgadas con WildGuard), lo que lo convierte en material de referencia para quien investigue la relacion entre eficiencia y robustez en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados a partir de una representacion de bajo rango |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat-hf: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Fraccion de parametros factorizados | 0,615424 |
| Eliminacion nominal de parametros de proyeccion | 40% |
| Shift relativo (rho) | 1e-06 |
| Lambda global | 2,118224627486761e-05 |
| Ridge | 1e-05 |
| Fine-tuning de recuperacion | no |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf, un transformer decoder-only con atencion causal estandar y 6.738.415.616 parametros. Sobre esa base se aplica una compresion por SVD: las matrices de proyeccion se factorizan en representaciones de bajo rango y posteriormente se pliegan de nuevo en matrices densas para facilitar la evaluacion. La eliminacion nominal del 40% de los parametros de proyeccion da lugar a una fraccion real de parametros factorizados de 0,615424 respecto al total del modelo. El upload no proporciona inferencia factorizada ni demuestra una ganancia de velocidad; es un artefacto de evaluacion.

El criterio de compresion no es puramente reconstructivo. El objetivo combina una metrica de utilidad (momentos de entrada de WikiText) con una metrica de identidad de seguridad, usando un 0,1 de los momentos de prompts daninos y respuestas seguras. Ambas familias comparten los mismos textos de respuesta de referencia, incluidos los del modelo profesor Llama-2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El gradiente se calcula con 128 ejemplos daninos y 40 benignos, mientras que la validacion de entropia cruzada usa 32 y 12 ejemplos separados; el corpus de metrica mixta es mas amplio, por lo que estos ejemplos estan retenidos del gradiente pero no son completamente invisibles a la calibracion. No hay RLHF, DPO ni recuperacion posterior en este checkpoint.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat-hf, con la degradacion esperable tras eliminar el 40% nominal de los parametros de proyeccion.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2, sujeto a la perdida de coherencia inducida por la compresion.
- Evaluacion de seguridad: el checkpoint sirve como sujeto de prueba para medir tasas de exito de ataques (ASR) con AdvBench/HarmBench, XSTest y OR-Bench/WildGuard.
- Analisis de robustez: permite estudiar si la compresion sesgada hacia la utilidad erosiona las defensas de alineamiento del modelo base.
- Diagnostico de compresion: el repo incluye `compression.json` con diagnosticos por matriz, util para reproducir y auditar el proceso.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base, sin verificacion en este checkpoint).

## Casos de uso

- Investigacion sobre compresion y seguridad: usar el checkpoint como condicion experimental para medir como varia la tasa de exito de ataques (ASR) en AdvBench/HarmBench respecto al Llama-2-7b-chat-hf sin comprimir, manteniendo fijas las plantillas de chat y los jueces.
- Auditoria de alineamiento bajo eficiencia: comparar las puntuaciones de XSTest y OR-Bench (juzgadas con WildGuard) entre el modelo base y esta variante para detectar si la eliminacion de parametros afecta a la tasa de rechazos seguros frente a respuestas excesivamente restrictivas.
- Reproduccion de metodologia SVD: emplear `experiment/` y `compression.json` como referencia para replicar el pipeline de factorizacion con metricas mixtas de utilidad e identidad en otros modelos de la familia Llama.
- Estudio de degradacion de coherencia: analizar la perplejidad en WikiText-2 junto con la fraccion de respuestas puntuadas para separar la perdida de calidad linguistica del cambio en comportamiento de seguridad.
- Docencia y divulgacion: ilustrar en un curso o articulo como un objetivo de compresion con peso 0,1 sobre datos de seguridad puede desplazar el comportamiento del modelo sin recuperacion posterior.
- Base para experimentos de recuperacion: partir de este checkpoint para probar tecnicas de fine-tuning de recuperacion y medir si se restaura la utilidad sin reintroducir vulnerabilidades.
- Analisis de robustez comparada: integrar el modelo en un banco de pruebas con varios niveles de rho y lambda para trazar la frontera entre compresion aceptable y colapso de seguridad.

## Benchmarks y rendimiento

El autor declara que los archivos de evaluacion contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y las primeras 500 prompts de OR-Bench juzgadas con WildGuard. Sin embargo, en la informacion proporcionada no se incluyen los valores numericos de estos resultados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 16-24 GB.
- Cuantizacion a 8 bits: entorno a 7 GB de pesos; a 4 bits: entorno a 3,5-4 GB, aunque no se documentan tipos de cuantizacion soportados para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 y en tarjetas de 8-12 GB con cuantizacion, siempre que se genere el formato cuantizado a partir de los safetensors.
- Opciones de despliegue: al ser pesos densos en formato Hugging Face, es compatible con transformers, vLLM y TGI; para llama.cpp/Ollama seria necesario convertir a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles; el autor advierte explicitamente que el upload no proporciona inferencia factorizada ni establece una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.000001 | 6.738.415.616 | no disponible (base: 4096) | Compresion SVD con sesgo de seguridad, sin recuperacion | llama2 | Hugging Face, 15 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Modelo base alineado con RLHF | llama2 | Hugging Face, ampliamente disponible |
| Variantes de poda/SVD de Llama-2-7b | no disponible | no disponible | Poda o factorizacion con recuperacion tipica | variable | no disponible en la informacion proporcionada |

La comparacion directa con otras variantes comprimidas de Llama-2-7b no esta disponible en la informacion proporcionada; el unico contraste fiable es contra el modelo base, del que este checkpoint hereda arquitectura y licencia pero del que difiere en la fraccion de parametros efectivos y en el comportamiento de seguridad, todavia sin cifras publicadas aqui.

## Limitaciones y advertencias

- El propio autor califica el trabajo de piloto "one-sided" y no de SVD completa con informacion de Fisher; las conclusiones sobre seguridad no son generalizables.
- Las mediciones piloto no establecen ninguna garantia de seguridad; deben interpretarse junto con la coherencia y la fraccion de respuestas puntuadas, no solo con el ASR.
- Los ejemplos de validacion estan retenidos del gradiente pero no son completamente invisibles a la calibracion, dado que el corpus de metrica mixta es mas amplio.
- No hay fine-tuning de recuperacion, por lo que se espera una degradacion de la calidad linguistica y de la utilidad respecto al modelo base; la magnitud no se cuantifica en la informacion disponible.
- Riesgo de alucinacion y de respuestas incoherentes potencialmente elevado tras eliminar el 40% nominal de los parametros de proyeccion; no hay datos publicados que lo acoten.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del modelo base Llama-2-7b-chat-hf, no auditados aqui.
- Limitaciones de idioma: no se especifican idiomas soportados ni evaluaciones multilingues.
- Licencia llama2: impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse el texto completo antes de cualquier despliegue, y ademas se requiere cumplir la licencia del modelo base de Meta.
- No apto para produccion: es un artefacto de investigacion con 15 descargas y sin pipeline declarado, sin benchmarks publicados en la informacion disponible y sin garantias de velocidad ni de calidad.
- El upload no ofrece inferencia factorizada; quien quiera explotar el rango bajo debe reconstruir el pipeline a partir de `experiment/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
- Repositorio de experimentos y diagnosticos: carpeta `experiment/` y archivo `compression.json` dentro del propio repositorio de Hugging Face
