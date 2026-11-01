# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.01

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.01` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una tecnica de compresion basada en descomposicion en valores singulares (SVD) con un sesgo deliberado hacia la seguridad. Lo publica el usuario Jeesup en HuggingFace y no es un modelo de produccion, sino un artefacto experimental para estudiar como la eliminacion de parametros de proyeccion afecta simultaneamente a la utilidad del modelo y a su comportamiento frente a prompts dañinos.

La intervencion consiste en eliminar nominalmente el 50% de los parametros de proyeccion, lo que se traduce en una fraccion de parametros efectivos del 0,565216 respecto al modelo completo. No hay fine-tuning de recuperacion posterior, de modo que el checkpoint conserva exactamente los pesos densos plegados para facilitar la evaluacion. La arquitectura subyacente es la de Llama 3 8B Instruct, un transformer decoder-only denso con 8.030.261.248 parametros.

Su relevancia es metodologica: el autor introduce un objetivo mixto que combina momentos de WikiText con momentos de prompts dañinos y respuestas seguras, ponderados por un factor de 0,1, y un desplazamiento relativo `rho` de 0,01. Es un piloto unidireccional, no un SVD completo con informacion de Fisher, y el propio autor advierte que las mediciones no constituyen una garantia de seguridad. Resulta util para investigadores que estudien compresion consciente de seguridad, evaluacion de alineamiento bajo degradacion de pesos y la relacion entre perplejidad y tasa de exito de ataques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors densos plegados |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas de Hugging Face) |

Datos adicionales de la model card: eliminacion nominal de parametros de proyeccion del 50%; fraccion realizada de parametros factoriales de todo el modelo de 0,565216; `rho` = 0,01; `lambda` global = 0,013767206634182494; ridge = 1e-05; sin fine-tuning de recuperacion. Tamano del repositorio: 16,1 GB. Creado el 2026-10-30, actualizado el mismo dia. 16 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y tokenizador BPE de Llama 3. Sobre esos pesos se aplica una compresion por SVD de las matrices de proyeccion: se calcula una representacion de bajo rango y se descartan componentes segun un presupuesto de rango. El checkpoint publicado no incluye inferencia factorizada ni demuestra aceleracion alguna; los pesos se han plegado de nuevo a matrices densas para comodidad de evaluacion.

El entrenamiento no es un entrenamiento clasico, sino un ajuste del objetivo de compresion. La metrica de entrada es la utilidad y la de salida es la identidad. El objetivo mixto usa momentos de entrada de WikiText mas 0,1 veces los momentos de prompts dañinos con respuestas seguras; ambas familias emplean los mismos textos de respuesta de referencia, incluidos los del profesor Llama-2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. La funcion de perdida pondera por igual la entropia cruzada (CE) de respuesta segura ante prompt dañino y la CE de respuesta util ante prompt benigno. El gradiente se estima con 128 ejemplos dañinos y 40 benignos; la validacion CE usa 32 y 12 ejemplos separados. El autor advierte que, al ser el corpus de metrica mixta mas amplio, estos ejemplos estan fuera del gradiente pero no son necesariamente calibraciones completamente no vistas. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradacion introducida por la compresion.
- Respuesta a instrucciones y seguimiento de plantillas de chat de Llama 3.
- Evaluacion de seguridad: el checkpoint incluye artefactos para medir generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- Medicion de perplejidad sobre WikiText-2 como indicador de utilidad.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo es solo texto segun la informacion disponible.

## Casos de uso

- Investigacion en compresion consciente de seguridad: comparar este checkpoint con el modelo base y con variantes de otros valores de `rho` para aislar el efecto del sesgo de seguridad en la eliminacion de componentes SVD.
- Analisis de la relacion perplejidad-seguridad: usar las metricas de WikiText-2 PPL junto con las tasas de exito de ataque de AdvBench y HarmBench para estudiar si la perdida de utilidad correlaciona con la robustez frente a jailbreaks.
- Evaluacion de sobre-rechazo: emplear XSTest y los primeros 500 prompts de OR-Bench con juicios de WildGuard para cuantificar falsos positivos de seguridad en prompts benignos.
- Reproducibilidad de experimentos de SVD: el repositorio incluye `experiment/` con ajustes exactos, perdidas de validacion y codigo fuente, y `compression.json` con diagnosticos por matriz, lo que permite replicar el pipeline de plegado y evaluacion.
- Estudio de calibracion con conjuntos reducidos: los 128/40 ejemplos de gradiente y los 32/12 de validacion permiten analizar la sensibilidad del metodo a tamanos de muestra pequenos en objetivos de seguridad.
- Docencia y formacion: servir como ejemplo practico de como una intervencion de bajo rango afecta a un modelo alineado y de por que las metricas agregadas de seguridad deben interpretarse junto con la coherencia de las generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que los archivos de evaluacion contienen WikiText-2 PPL, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores concretos. El autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la tasa de exito de ataque (ASR).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, mas overhead. Estas estimaciones son orientativas y no proceden de la informacion proporcionada.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala con lotes grandes; RTX 4090 (24 GB) para FP16 con lotes pequenos; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB en FP16 y en tarjetas de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: los pesos son safetensors densos compatibles con transformers, vLLM y TGI; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; el autor senala explicitamente que el checkpoint no proporciona inferencia factorizada ni establece ninguna aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.01 | 8.030.261.248 | no disponible | Compresion SVD con sesgo de seguridad (piloto) | llama3 | HuggingFace, 16 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | no disponible | Modelo base alineado por instrucciones | llama3 | HuggingFace, ampliamente disponible |
| Variantes de poda/SVD de Llama 3 8B | variable | no disponible | Compresion estructural sin sesgo de seguridad | habitualmente llama3 | segun autor |

La comparacion cuantitativa de rendimiento no esta disponible porque no se publican resultados de benchmarks en la informacion proporcionada. La diferencia principal frente al modelo base es la eliminacion del 50% nominal de parametros de proyeccion (fraccion realizada de 0,565216) y la inclusion de un objetivo mixto de seguridad; frente a otras variantes de poda, la novedad es el termino de momentos de prompts dañinos con `rho` = 0,01.

## Limitaciones y advertencias

- Checkpoint de investigacion, no de produccion: el autor lo describe como un piloto unidireccional y no como un SVD completo con informacion de Fisher.
- Sin garantia de seguridad: las mediciones de ASR, XSTest y OR-Bench son pilotos y no establecen ninguna garantia.
- Degradacion de utilidad esperable: la eliminacion del 50% nominal de parametros de proyeccion puede reducir coherencia y calidad; debe revisarse la PPL de WikiText-2 junto con la coherencia cualitativa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la compresion puede agravarlo respecto al modelo base.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base y pueden amplificarse por la compresion.
- Limitaciones de idioma y contexto: no disponibles en la informacion proporcionada.
- Restricciones de licencia: se aplica la Llama 3 Community License, que impone condiciones de uso comercial, atribucion y politicas de uso aceptable; debe revisarse antes de cualquier despliegue.
- Sin aceleracion demostrada: los pesos publicados son densos plegados y el repositorio no proporciona inferencia factorizada.
- Calibracion limitada: los conjuntos de gradiente (128/40) y validacion (32/12) son pequenos, lo que limita la robustez estadistica de las conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
