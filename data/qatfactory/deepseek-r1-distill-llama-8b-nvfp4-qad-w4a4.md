# qatfactory/DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD-W4A4

## Resumen

DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD-W4A4 es una cuantizacion de 4 bits (W4A4) del modelo DeepSeek-R1-Distill-Llama-8B, publicada por el usuario qatfactory en Hugging Face. Se trata de un derivado que aplica entrenamiento consciente de la cuantizacion (QAT, quantization-aware training) sobre el checkpoint destilado de DeepSeek, empleando el formato NVFP4 (punto flotante de 4 bits de NVIDIA) y el ecosistema compressed-tensors para su carga en vLLM.

El modelo base, DeepSeek-R1-Distill-Llama-8B, es un destilado de razonamiento de DeepSeek que traslada las capacidades de la familia R1 a la arquitectura Llama de 8.000 millones de parametros. Esta version concreta reduce el peso del repositorio a unos 6 GB, lo que facilita su despliegue en GPUs con memoria limitada manteniendo, en teoria, una calidad cercana al modelo original gracias al proceso QAT en lugar de una cuantizacion post-entrenamiento naive.

La relevancia de esta ficha radica en que combina tres elementos de interes para el despliegue en produccion: un modelo de razonamiento compacto, un esquema de cuantizacion de 4 bits optimizado para hardware Blackwell de NVIDIA y una integracion directa con vLLM. No obstante, la informacion publicada por el autor es muy escasa y el acceso esta restringido, por lo que muchos datos tecnicos deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama, destilado de DeepSeek-R1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Llama-8B soporta 131.072 tokens; el valor efectivo de esta cuantizacion no esta confirmado) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones en 4 bits, formato de punto flotante NVFP4), con QAT |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de tipo Llama con 8.000 millones de parametros, obtenido por destilacion a partir de DeepSeek-R1. La destilacion transfiere capacidades de razonamiento (generacion de cadenas de pensamiento antes de la respuesta final) a una arquitectura densa y compacta, en lugar de replicar el esquema Mixture-of-Experts de los modelos R1 completos.

Sobre ese checkpoint, qatfactory aplica un proceso de quantization-aware training con el objetivo de producir pesos y activaciones en NVFP4 (W4A4). A diferencia de la cuantizacion post-entrenamiento, el QAT ajusta los pesos durante el entrenamiento para minimizar la perdida de calidad introducida por la precision reducida. El resultado se empaqueta en formato compressed-tensors para su carga nativa en vLLM. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los detalles del pipeline de cuantizacion (calibracion, escalas, granularidad de grupo).

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredadas del destilado de DeepSeek-R1 (cadenas de pensamiento antes de responder).
- Razonamiento matematico y resolucion de problemas de varios pasos, capacidad caracteristica de la familia R1.
- Generacion y comprension de codigo, incluyendo explicaciones y refactorizaciones.
- Soporte de tool calling / function calling segun las capacidades del modelo base (no verificado en esta cuantizacion concreta).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Capacidades multilingues del modelo base (no documentadas especificamente para esta version).
- No dispone de vision ni audio: es un modelo puramente de texto.

## Casos de uso

- Razonamiento asistido en entornos con GPU limitada: el formato NVFP4 reduce el peso a unos 6 GB, permitiendo ejecutar un modelo de razonamiento de 8B en GPUs de gama media o en instancias cloud mas economicas que las requeridas por el checkpoint en BF16.
- Generacion de codigo en pipelines de CI/CD: puede integrarse mediante vLLM como servicio de completado para revision de parches, generacion de tests o explicacion de diffs, con menor huella de memoria que el modelo original.
- Tutoria y explicacion paso a paso: su capacidad de razonamiento encadenado lo hace util para descomponer problemas matematicos o logicos en entornos educativos.
- Procesamiento por lotes de documentos tecnicos: resumen y extraccion de conclusiones sobre textos largos, aprovechando la ventana de contexto del modelo base (sujeta a verificacion en esta cuantizacion).
- Prototipado de agentes con tool calling: al ser compatible con vLLM, puede servirse detras de frameworks de agentes que requieran function calling y multiples pasos de razonamiento.
- Despliegue en edge o en estaciones de trabajo con una sola GPU: el tamaño reducido del repositorio (6 GB) facilita la distribucion y el arranque rapido del servicio frente a variantes de mayor precision.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto de NVFP4 con QAT frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB para los pesos en NVFP4, mas overhead de KV cache y activaciones; el consumo real depende de la longitud de contexto y del tamano de lote.
- GPU recomendadas: GPUs NVIDIA con soporte de NVFP4 (arquitectura Blackwell, como B200 o RTX 50xx). En arquitecturas anteriores (Ampere, Hopper) el soporte de NVFP4 en vLLM puede no estar disponible o requerir emulacion, con degradacion de rendimiento.
- Cabe en GPU de consumo: previsiblemente si, en modelos con soporte NVFP4; en GPUs sin soporte nativo del formato el despliegue no esta garantizado.
- Opciones de despliegue: vLLM es la libreria declarada y el formato compressed-tensors esta pensado para ella. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD-W4A4 (este) | 8,03B | no disponible | NVFP4 W4A4 con QAT | MIT | Gated en Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (base) | 8,03B | 131.072 tokens | BF16 | MIT | Publico |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 8,03B | segun implementacion | 4-8 bits post-entrenamiento | MIT | Publicas, habitualmente |
| Llama 3.1 8B Instruct | 8,03B | 131.072 tokens | BF16 y multiples cuantizaciones | Llama 3.1 Community License | Publico |

La comparativa se limita a caracteristicas estructurales: no hay datos de rendimiento publicados para esta cuantizacion que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Ausencia de documentacion: el autor no publica model card detallada, resultados de evaluacion ni detalles del proceso QAT, lo que impide validar la perdida de calidad frente al modelo base.
- Dependencia de hardware: NVFP4 esta optimizado para GPUs Blackwell; en otras arquitecturas el rendimiento o incluso la compatibilidad pueden verse comprometidos.
- Riesgo de alucinacion: inherente a los modelos de razonamiento destilados, especialmente en dominios especializados y en cadenas de pensamiento largas.
- Sesgos: no documentados; se heredan los del modelo base y los de sus datos de entrenamiento.
- Idiomas: no se especifica la cobertura linguistica de esta version; conviene validar el comportamiento en castellano antes de usarla en produccion.
- Uso comercial: la licencia MIT es permisiva, pero debe verificarse que las condiciones del modelo base y de los datos de destilacion no impongan restricciones adicionales.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion; tratarlo como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qatfactory/DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD-W4A4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
