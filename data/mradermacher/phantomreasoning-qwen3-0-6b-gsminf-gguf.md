# mradermacher/PhantomReasoning-Qwen3-0.6B-gsminf-GGUF

## Resumen

PhantomReasoning-Qwen3-0.6B-gsminf-GGUF es una cuantizacion estatica del modelo kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base parte de Qwen3-0.6B, un transformer denso de aproximadamente 600 millones de parametros desarrollado por Alibaba Qwen, sobre el que se ha aplicado un ajuste fino orientado a razonamiento matematico, segun sugiere el sufijo "gsminf" (probablemente derivado de GSM8K, un conjunto de problemas matematicos de nivel escolar).

El interes de esta publicacion es practico: ofrece el modelo en formato GGUF con multiples niveles de cuantizacion (desde Q2_K hasta F16, incluyendo variantes IQ e intermedias K), lo que permite ejecutarlo en hardware modesto, incluso en CPU o GPUs de gama baja con poca VRAM. Es relevante para quienes quieren experimentar con modelos pequenos especializados en razonamiento sin depender de infraestructura grande.

No obstante, la informacion publicada es muy limitada: la model card del repositorio solo indica que se trata de cuantizaciones estaticas del modelo original, sin detalles sobre arquitectura, datos de entrenamiento, licencia o idiomas. Creado y actualizado el 4 de noviembre de 2026, el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B; no confirmado en la model card) |
| Parametros totales | Aproximadamente 0,6 mil millones (0.6B), segun el nombre del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

La model card del repositorio no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. Por el nombre del modelo base (Qwen3-0.6B) se deduce que se trata de un transformer denso de la familia Qwen3, pero no se confirma en la documentacion disponible. El sufijo "gsminf" del modelo original sugiere un ajuste fino orientado a inferencia de razonamiento matematico, posiblemente sobre el conjunto GSM8K, aunque no se especifica la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de pesos en formato Hugging Face convertidos a GGUF con la herramienta de cuantizacion estandar. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Qwen3-0.6B con un ajuste fino orientado a problemas matematicos ("gsminf"), se espera capacidad para resolver problemas aritmeticos y de razonamiento de nivel escolar, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento matematico basico: el sufijo del modelo sugiere entrenamiento especifico en tareas tipo GSM8K.
- Generacion de codigo: capacidad heredada de la familia Qwen3, no verificada en este ajuste fino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de razonamiento matematico en local: el modelo puede desplegarse con llama.cpp u Ollama en un portatil para probar pipelines de resolucion de problemas aritmeticos sin conexion, gracias a su tamano reducido y a las cuantizaciones Q4_K_M o Q5_K_M.
- Educacion y tutoria automatica de matematicas: integrado en una aplicacion de escritorio, puede generar explicaciones paso a paso de problemas de nivel primaria o secundaria, con la ventaja de ejecutarse en CPU.
- Evaluacion de tecnicas de cuantizacion: al ofrecer 12 variantes GGUF, sirve como banco de pruebas para medir la degradacion de calidad entre Q2_K y F16 en tareas de razonamiento.
- Experimentacion academica con modelos pequenos: investigadores pueden estudiar el efecto del ajuste fino en GSM8K sobre un modelo de 0,6B sin necesidad de GPUs de datacenter.
- Filtrado y generacion de problemas sinteticos: utilizable para generar variaciones de problemas matematicos en pipelines de aumento de datos, siempre con revision humana por el riesgo de alucinacion.
- Despliegue en dispositivos con recursos limitados: al caber en menos de 1 GB en cuantizaciones Q4, puede embeberse en entornos con restricciones de memoria (Raspberry Pi, contenedores ligeros) para tareas de generacion de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en Q2_K, 0,5-0,6 GB en Q4_K_M, 0,7-0,8 GB en Q8_0 y 1,2-1,3 GB en F16 (estimaciones basadas en el tamano de 0,6B parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelos pequenos.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 0,6B, se espera una latencia baja (decenas de tokens por segundo en CPU moderna y cientos en GPU), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-0.6B-gsminf-GGUF | ~0,6B | No disponible | No disponible | GGUF | Hugging Face (mradermacher) |
| Qwen3-0.6B | ~0,6B | No disponible en esta ficha | Apache 2.0 (habitual en Qwen3, no confirmado) | Safetensors, GGUF | Hugging Face (Qwen) |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | Safetensors, GGUF | Hugging Face (Qwen) |
| SmolLM2-360M-Instruct | ~0,36B | 8.192 tokens (segun documentacion de SmolLM2) | Apache 2.0 | Safetensors, GGUF | Hugging Face (HuggingFaceTB) |

La comparativa se limita a datos de los modelos de referencia; no hay informacion publicada sobre el rendimiento relativo del modelo PhantomReasoning frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, licencia, idiomas ni evaluaciones, lo que impide verificar su calidad y condiciones de uso.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar el repositorio del modelo original (kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf) antes de usarlo en produccion.
- Riesgo de alucinacion: como todo modelo de 0,6B, especialmente en tareas de razonamiento matematico, puede generar cadenas de razonamiento plausibles pero incorrectas.
- Capacidad limitada por tamano: 0,6B parametros restringen el conocimiento factual, el razonamiento complejo y la coherencia en contextos largos.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos del ajuste fino ni del modelo base.
- Idiomas no especificados: no se garantiza un rendimiento adecuado en castellano; el ajuste fino podria haber degradado capacidades multilingues del modelo base.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que dificulta planificar su uso en conversaciones largas.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-0.6B-gsminf-GGUF
- Modelo original cuantizado: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf
- Modelo base de referencia (Qwen3-0.6B): https://huggingface.co/Qwen/Qwen3-0.6B
