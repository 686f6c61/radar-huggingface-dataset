# brutalai/qwen3.8-27b-abliterated-r6p1

## Resumen

Qwen3.8-27B Abliterated (r6p1) es una variante modificada del modelo Qwen3.8-27B de Alibaba Qwen, publicada por Brutal AI. Se trata de un derivado "abliterated", es decir, un modelo al que se le ha aplicado una edicion dirigida de pesos sobre un subconjunto de las proyecciones de atencion para reducir su tendencia a rechazar peticiones. No es un fine-tune, ni un adaptador, ni un envoltorio de prompts: es una modificacion directa de los pesos del modelo base.

El modelo conserva la arquitectura densa de 64 capas del Qwen3.8-27B original, con 27.781.427.952 parametros totales (unos 27,8 mil millones) y una ventana de contexto de 32.768 tokens. Se distribuye en formato FP8 (E4M3 con escalas de bloque de 128x128), en aproximadamente 29 GB repartidos en 25 shards, y esta pensado para servirse con vLLM en una unica GPU H200 con tensor-parallel de tamano 1.

Su relevancia es doble: por un lado, ofrece el rendimiento del Qwen3.8-27B en tareas de codigo, matematicas e instrucciones con una tasa de rechazo practicamente nula (100 de 100 prompts danados respondidos frente a 4 del base); por otro, esa misma caracteristica elimina una barrera de seguridad, lo que lo hace inadecuado para despliegues sin supervision. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas (derivado de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | FP8 (E4M3) con escalas de bloque 128x128; no se documentan otras |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), 25 shards, ~29 GB; repo de 30,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 64 capas, sin mezcla de expertos, derivado directamente del Qwen3.8-27B. La intervencion de Brutal AI consiste en una edicion de pesos dirigida sobre un subconjunto de las proyecciones de atencion, cuyo objetivo es atenuar la direccion de rechazo aprendida durante el alineamiento del modelo base. Al ser una edicion de pesos y no un reentrenamiento, no hay datos nuevos de entrenamiento, ni RLHF, ni DPO adicionales: la composicion del dataset y el numero de tokens de preentrenamiento son los del Qwen3.8-27B original, que no se detallan en la informacion disponible.

La innovacion tecnica reseñable no esta en la arquitectura sino en el formato y el metodo: la publicacion se hace directamente en FP8 E4M3 con escalas de bloque de 128x128, lo que reduce el peso a unos 29 GB y permite servir el modelo en una sola GPU H200 con tensor-parallel 1. La model card indica que no requiere system prompt ni flags especiales de muestreo, y que el modo "thinking" del modelo base se desactiva en la evaluacion realizada.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 32.768 tokens.
- Razonamiento y respuesta a instrucciones: el modelo base Qwen3.8-27B esta orientado a tareas de instrucciones, y el derivado mantiene ese comportamiento (IFBench loose 120/300 y strict 110/300 en la evaluacion del autor).
- Generacion de codigo: LiveCodeBench pass@1 de 91 sobre 175 en la evaluacion del autor, practicamente identico al base (92).
- Razonamiento cuantitativo y financiero: FinQA 49/100 frente a 46 del base.
- Conocimiento general y razonamiento tipo MMLU-Pro: 99/140 frente a 102 del base.
- Reduccion de rechazos: responde el 100% de los 100 prompts danados del conjunto de evaluacion, y solo rechaza falsamente 2 de 250 prompts benignos (frente a 16 del base).
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es text-generation.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo sirve como brazo de comparacion frente al Qwen3.8-27B base para estudiar como la edicion de pesos en proyecciones de atencion altera la tasa de rechazo sin degradar tareas de codigo o instrucciones, con datos cuantificados (100/100 frente a 4/100 en prompts danados).
- Evaluacion de robustez de filtros de salida: al ser un modelo sin safety-tuning, es util para probar clasificadores de contenido, moderacion y capas de guardrails en pipelines propios antes de desplegar modelos comerciales.
- Generacion de codigo en entornos controlados: con LiveCodeBench pass@1 de 91/175, puede integrarse en asistentes de programacion internos donde el equipo revisa el codigo generado; su contexto de 32.768 tokens permite incluir varios ficheros de un repositorio en la ventana.
- Analisis de documentos financieros: el rendimiento en FinQA (49/100) lo hace apto para extraccion y razonamiento sobre informes y tablas financieras en flujos de analisis internos, siempre con verificacion humana.
- Redaccion y reescritura de contenido sin friccion: la baja tasa de rechazos falsos (2/250) reduce las interrupciones en tareas de redaccion tecnica o creativa donde el modelo base rechazaria peticiones benignas por precaucion excesiva.
- Servicio de inferencia de alto rendimiento en una sola GPU: el formato FP8 y el despliegue con vLLM en una H200 con tensor-parallel 1 permiten montar un endpoint compatible con la API de OpenAI para prototipos y demos internas.
- Experimentacion con cuantizacion FP8: el modelo sirve como referencia para medir el impacto de FP8 E4M3 con escalas de bloque 128x128 en calidad de generacion frente a pesos de mayor precision.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Una ejecucion por brazo, tareas identicas, modo thinking desactivado, split reservado, en ingles y turno unico.

| Medida | Base Qwen3.8-27B | Este modelo |
|---|---:|---:|
| Prompts danados respondidos (de 100) | 4 | 100 |
| Prompts benignos rechazados falsamente (de 250) | 16 | 2 |
| LiveCodeBench pass@1 (de 175) | 92 | 91 |
| IFBench loose / strict (de 300) | 116 / 108 | 120 / 110 |
| MMLU-Pro (de 140) | 102 | 99 |
| FinQA (de 100) | 46 | 49 |

No se han publicado otros resultados de benchmarks (MMLU estandar, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 29 GB de pesos en FP8, mas memoria para cache KV y overhead de vLLM; el autor recomienda `--gpu-memory-utilization 0.90` sobre una H200 (141 GB), lo que deja margen amplio para lotes concurrentes.
- GPU recomendadas: H200 para el despliegue tal como lo documenta el autor; H100 de 80 GB y A100 de 80 GB son plausibles por capacidad de VRAM, aunque no estan verificadas en la informacion disponible.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en FP8 sin cuantizacion adicional; no se documentan pesos GGUF ni versiones de menor precision.
- Opciones de despliegue: vLLM es la libreria declarada y la unica documentada; llama.cpp, Ollama y TGI no estan soportados de forma documentada en la informacion disponible.
- Latencia y throughput: no disponibles; la model card solo indica `--max-num-seqs 64` como configuracion de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| brutalai/qwen3.8-27b-abliterated-r6p1 | ~27,8 B | 32.768 | FP8 safetensors | Apache-2.0 | Sin safety-tuning; rechazo casi nulo |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | 32.768 | no disponible en la informacion | Apache-2.0 | Alineado; rechaza 4/100 prompts danados y 16/250 benignos |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion directa con alternativas de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de safety-tuning: eliminar los rechazos elimina una barrera de seguridad. El modelo responde al 100% de los prompts danados del conjunto de evaluacion del autor; revisar las salidas antes de cualquier despliegue.
- Riesgo de alucinacion: hereda los limites factuales y los modos de fallo del Qwen3.8-27B base, sin mitigaciones adicionales.
- Respuestas mas largas: el autor advierte de que puede generar respuestas de mayor longitud que el base; conviene fijar un limite de tokens de salida.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al no haber safety-tuning, los sesgos del base pueden aflorar con menos filtros.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado.
- Contexto: 32.768 tokens, inferior a los contextos extendidos de otras familias actuales; no se documenta extension por YaRN ni similares.
- Evaluacion limitada: una sola ejecucion por brazo, turno unico, thinking desactivado y split reservado; los numeros no incluyen intervalos de confianza.
- Licencia: Apache-2.0 permite uso comercial, pero el autor aclara que el derivado no esta respaldado por Alibaba Qwen y que Qwen es marca de sus respectivos propietarios.
- Madurez: 6 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brutalai/qwen3.8-27b-abliterated-r6p1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor en Hugging Face: https://huggingface.co/brutalai
- Web de Brutal AI: https://brutal.ai/en
- LinkedIn de Brutal AI: https://www.linkedin.com/company/brutal-ai/posts/
