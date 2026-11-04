# qatfactory/Qwen3.5-9B-MXFP4-QAD-W4A4

## Resumen

Qwen3.5-9B-MXFP4-QAD-W4A4 es una distribucion cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario qatfactory en HuggingFace. Se trata de un checkpoint de 9.409.813.744 parametros (aproximadamente 9,4 mil millones) sometido a un proceso de quantisation-aware training (QAT) y posteriormente convertido al formato MXFP4 con esquema W4A4 (pesos y activaciones a 4 bits en formato microscaling floating point). El resultado se empaqueta en el formato compressed-tensors de vLLM, lo que permite servirlo directamente con esa libreria sin conversion adicional.

El interes tecnico de esta ficha reside en el esquema de cuantizacion: MXFP4 con activaciones tambien a 4 bits es una configuracion agresiva que va mas alla del W4A16 habitual en despliegues de produccion, y el prefijo QAD (quantization-aware distillation, segun la nomenclatura habitual del autor) sugiere que el ajuste se realizo durante el entrenamiento para mitigar la perdida de calidad. El repositorio ocupa 8,7 GB, coherente con un modelo de ~9,4B parametros almacenado a 4 bits mas metadatos.

La relevancia practica es doble: por un lado, reduce el espacio de almacenamiento y la VRAM necesaria frente al checkpoint original en BF16; por otro, al usar el formato nativo de vLLM con compressed-tensors, el despliegue es directo en infraestructura de inferencia moderna. El acceso esta restringido (gated) y requiere aceptar condiciones en HuggingFace. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, W4A4 (pesos y activaciones a 4 bits), QAT/QAD; tags indican "8-bit" y "compressed-tensors" |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3.5-9B. La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, uso de GQA, etc.), por lo que no es posible describirla con rigor; lo unico confirmado es que se trata de un transformer con aproximadamente 9,4 mil millones de parametros. Tampoco se especifican los datos de entrenamiento del modelo base ni si hubo fases de RLHF o DPO.

La innovacion principal de esta publicacion es el pipeline de cuantizacion: quantization-aware training/distillation (QAT/QAD) para adaptar los pesos al esquema MXFP4 con activaciones a 4 bits, seguido de empaquetado en compressed-tensors para vLLM. El esquema W4A4 es mas exigente que W4A16 porque cuantiza tambien las activaciones, lo que reduce el ancho de banda de memoria en inferencia pero incrementa el riesgo de degradacion; el entrenamiento consciente de cuantizacion es precisamente el mecanismo para contenerlo. No se han publicado detalles sobre el numero de tokens de calibracion, la composicion del dataset de ajuste ni la metodologia exacta de destilacion.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B; no se documentan capacidades especificas en la informacion disponible.
- Codigo y matematicas: presumiblemente soportadas por el modelo base, pero sin confirmacion explicita en la ficha del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Inferencia optimizada: compatible con vLLM mediante compressed-tensors, lo que habilita serving de alta concurrencia con kernels especificos para MXFP4.

## Casos de uso

- Despliegue de bajo coste en produccion: el formato W4A4 reduce la huella de memoria frente a BF16, lo que permite servir el modelo en GPUs con menos VRAM o aumentar el numero de replicas por nodo. Adecuado cuando el throughput importa mas que la fidelidad absoluta del checkpoint original.
- Evaluacion de cuantizacion agresiva: util como referencia para medir la degradacion de un modelo de ~9B al pasar a activaciones de 4 bits, comparando contra el checkpoint Qwen3.5-9B sin cuantizar en tareas de razonamiento y codigo.
- Serving con vLLM en entornos estandarizados: al usar compressed-tensors, se integra en pipelines existentes de vLLM sin conversion manual, lo que simplifica el aprovisionamiento y el escalado horizontal.
- Prototipado de asistentes conversacionales: un modelo de 9B es manejable para iterar rapido en aplicaciones de chat, resumen o extraccion de informacion, con la ventaja de que el checkpoint ocupa 8,7 GB en disco.
- Investigacion en tecnicas QAT: el repositorio sirve como artefacto reproducible para estudiar el efecto de MXFP4 con activaciones cuantizadas sobre un modelo base conocido.
- Fine-tuning ligero sobre pesos cuantizados: en la medida en que el ecosistema lo soporte, puede servir de punto de partida para adaptaciones con LoRA sobre la representacion cuantizada, aunque conviene validar compatibilidad antes de comprometerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 8,7 GB en disco; en vLLM con MXFP4 W4A4 se puede esperar una huella de pesos en torno a 5-6 GB, mas overhead de KV cache y activaciones. Con contexto largo, la KV cache puede superar los pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion con concurrencia; una RTX 4090 (24 GB) deberia acomodar el modelo con contexto moderado.
- Consumer GPU: si, previsiblemente en RTX 4090, RTX 4080 (16 GB) y RTX 3090 (24 GB), siempre que el contexto y el batch se mantengan contenidos. En GPUs de 8 GB el margen es muy ajustado.
- Opciones de despliegue: vLLM es la via soportada de forma nativa (formato compressed-tensors). No se confirma soporte para llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen del hardware, del contexto y del grado de concurrencia; el esquema W4A4 deberia mejorar el ancho de banda efectivo frente a BF16, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-MXFP4-QAD-W4A4 | 9,4B | no disponible | MXFP4 W4A4 (QAT) | Apache 2.0 | Gated en HF |
| Qwen/Qwen3.5-9B (base) | ~9,4B | no disponible | BF16 (original) | Apache 2.0 | Publico en HF |
| Cuantizaciones W4A16 del mismo base (p. ej. AWQ/GPTQ) | ~9,4B | no disponible | 4 bits pesos, 16 bits activaciones | Apache 2.0 | Habituales en HF |

La comparacion cuantitativa de rendimiento no es posible con los datos disponibles: no hay benchmarks publicados para esta variante ni cifras de referencia del checkpoint base en la informacion proporcionada. La diferencia cualitativa frente a alternativas W4A16 es que aqui se cuantizan tambien las activaciones, lo que reduce el coste de memoria pero exige validacion empirica de calidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Riesgo de degradacion por cuantizacion: W4A4 es un esquema agresivo; sin benchmarks publicados no es posible garantizar que la calidad se mantenga respecto al modelo base. Conviene evaluar en el dominio de uso antes de produccion.
- Sesgos: no documentados en la informacion disponible; heredados, en su caso, del modelo base Qwen3.5-9B.
- Alucinacion: no hay evaluacion publicada para esta variante cuantizada; el riesgo es el del modelo base, potencialmente amplificado por la cuantizacion.
- Idiomas y contexto: no declarados; no se puede asumir soporte multilingue ni una ventana de contexto concreta sin consultar la ficha del modelo base.
- Compatibilidad: el formato compressed-tensors esta pensado para vLLM; otros runtimes (llama.cpp, Ollama, TGI) no estan confirmados.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse los terminos del modelo base Qwen3.5-9B y las condiciones de acceso del repositorio.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado en la misma fecha; se trata de una publicacion reciente sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-MXFP4-QAD-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentacion de compressed-tensors en vLLM: https://docs.vllm.ai/en/latest/features/quantization/compressed_tensors/compressed_tensors.html
- Documentacion de vLLM: https://docs.vllm.ai
- Especificacion OCP MX (microscaling formats): https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
