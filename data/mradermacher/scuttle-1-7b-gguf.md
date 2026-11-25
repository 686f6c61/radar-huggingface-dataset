# mradermacher/scuttle-1.7b-GGUF

## Resumen

Scuttle-1.7b-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base Scuttle-1.7b, publicado por el usuario Multiqueue en Hugging Face. El repositorio lo mantiene mradermacher, un conocido generador de cuantizaciones GGUF para llama.cpp, y esta pensado para facilitar la ejecucion del modelo en hardware modesto mediante cuantizacion. El modelo cuenta con 1.728.801.600 parametros totales (aproximadamente 1,7 mil millones), lo que lo situa en la categoria de modelos pequenos, aptos para inferencia en CPU o en GPUs de consumo.

La informacion publica disponible es muy limitada: la model card del repositorio original no esta incluida en la informacion proporcionada y el README del repo GGUF se limita a listar las cuantizaciones generadas. No se especifican arquitectura, contexto, licencia ni idiomas soportados. El pipeline declarado es "no disponible", aunque las etiquetas incluyen "conversational" y "endpoints_compatible", lo que sugiere un uso orientado a chat.

La relevancia de esta ficha radica en documentar con rigor lo que se sabe y, sobre todo, lo que no se sabe, para que desarrolladores e investigadores puedan decidir si merece la pena evaluar el modelo. Al tratarse de una cuantizacion de un modelo pequeno (1,7B), su interes practico esta en el despliegue local y en la experimentacion rapida, no en tareas de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Scuttle-1.7b en la documentacion proporcionada. El nombre y el tamano (1,7B parametros) son compatibles con un transformer decoder-only de la familia de modelos pequenos, pero no hay confirmacion oficial. Tampoco se conocen los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el repositorio incluye cuantizaciones estaticas generadas con llama.cpp a partir del modelo original, con metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se hizo desde pesos en formato Hugging Face. No se documentan innovaciones arquitectonicas adicionales.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" sugiere que el modelo esta ajustado o pensado para dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Inferencia local: al estar en GGUF, es ejecutable con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado rapido de chatbots locales: al ser un modelo de 1,7B en GGUF, puede ejecutarse en un portatil sin GPU dedicada para validar flujos conversacionales antes de migrar a un modelo mayor.
- Experimentacion con cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta Q8_0 e IQ4_XS), lo que permite estudiar el compromiso entre calidad y tamano en un modelo pequeno.
- Despliegue en entornos con recursos limitados: util para demos en Raspberry Pi, mini-PC o contenedores sin acelerador, donde un modelo de 1,7B cuantizado a Q4_K_M ocupa del orden de 1 GB.
- Evaluacion comparativa de modelos pequenos: sirve como linea base en estudios de escalado o de cuantizacion frente a otros modelos de tamano similar.
- Generacion de texto asistida en herramientas de escritorio: integrable en editores o asistentes locales que requieran baja latencia y no puedan enviar datos a la nube.
- Filtrado o clasificacion de texto simple: para tareas de etiquetado ligero o resumenes cortos donde no se requiera alta precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~0,7 GB; Q4_K_M ~1,1 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB. Estas cifras son estimaciones basadas en el numero de parametros y no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para f16 con holgura.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en iGPU con memoria compartida para cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo original.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B, se espera una latencia baja en CPU y muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Scuttle-1.7b-GGUF | 1,7B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-1B-Instruct | 1,2B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

Nota: los datos de los modelos comparativos provienen de su documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen como referencia orientativa. No hay datos de rendimiento de Scuttle-1.7b que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan sesgos, datos de entrenamiento, idiomas ni limitaciones conocidas, lo que impide evaluar riesgos de forma informada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; en produccion debe tratarse como no apto hasta verificar la licencia del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin datos de alineacion, el riesgo es dificil de acotar.
- Capacidad limitada por el tamano: con 1,7B parametros, el rendimiento en razonamiento complejo, codigo y matematicas sera previsiblemente inferior al de modelos mayores.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real.
- Idiomas desconocidos: no hay garantia de soporte de castellano ni de otros idiomas distintos del ingles.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Fechas de creacion y actualizacion futuras (2026): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/scuttle-1.7b-GGUF
- Modelo base: https://huggingface.co/Multiqueue/scuttle-1.7b
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
