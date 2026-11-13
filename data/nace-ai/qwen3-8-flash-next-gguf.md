# nace-ai/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de generacion de texto desarrollado por Qwen (Alibaba) y publicado bajo licencia Apache 2.0. Esta ficha documenta la version cuantizada en formato GGUF publicada por el usuario nace-ai, pensada para su uso con llama.cpp, LM Studio y Ollama. El modelo base cuenta con 176.943.899.520 parametros totales (aproximadamente 177 mil millones), lo que lo situa en la categoria de modelos de gran escala no ejecutables en hardware de consumo sin cuantizacion agresiva.

La publicacion de nace-ai destaca por su enfoque en la fidelidad de la cuantizacion: el archivo `IQ4_XS` (93,44 GB) presenta una divergencia media KL de 0,063 respecto al modelo BF16, inferior a la de alternativas del mismo tamano o mayores publicadas por otros autores (Unsloth, bartowski, mradermacher, AtomicChat). El autor documenta mediciones de KL a 512 y 128K tokens sobre texto de Wikipedia en ingles, conversaciones, tool calls y codigo, ademas de una comprobacion de tareas con MMLU, ARC-Challenge y Winogrande.

El modelo soporta un contexto de 128K tokens y un modo de razonamiento previo a la respuesta ("thinking"), segun se desprende de la documentacion del repositorio. La informacion disponible sobre arquitectura interna, composicion del dataset de entrenamiento y capacidades multilingues es limitada en la model card, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; transformer segun convencion de la familia Qwen, sin confirmar en la informacion) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (documentado en las pruebas de KL a 128K) |
| Tipos de cuantizacion | GGUF con mezcla de tipos de tensor de 2,2 a 8,5 bits por peso; el archivo publicado es `IQ4_XS` (54% IQ4_NL, 29% IQ4_XS, 10% IQ3_XXS, 7% otros) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next mas alla de su pertenencia a la familia Qwen y de la existencia de un modo de razonamiento previo a la respuesta. El modelo incorpora embeddings de n-gramas, segun se menciona en la seccion de evaluacion del repositorio (el tool estandar de llama.cpp se detiene en este modelo porque sus n-gram embeddings rechazan tokens compartidos entre varias secuencias). Tambien se menciona un componente MTP (multi-token prediction) excluido del computo de tamano del archivo, lo que sugiere decodificacion especulativa o prediccion multi-token como innovacion tecnica.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card se centra exclusivamente en el proceso de cuantizacion y evaluacion de los archivos GGUF, no en el entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo "piensa antes de responder", segun la documentacion del quickstart.
- Razonamiento previo a la respuesta (modo thinking), inferido del comportamiento descrito en la model card.
- Soporte de tool calling y function calling: la evaluacion incluye texto de conversaciones y tool calls, y el modelo se prueba con plantillas de chat.
- Generacion de codigo: se evalua con texto de GitHub y se reportan metricas KL especificas para codigo.
- Procesamiento de contexto largo: ventanas de 128K tokens documentadas en las pruebas.
- Compatibilidad con endpoints OpenAI: el repositorio incluye la etiqueta `endpoints_compatible` y ejemplos de llamadas a `/v1/chat/completions`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 128K tokens de ventana, el modelo puede mantener conversaciones multi-turno extensas o procesar documentos largos completos sin truncamiento, adecuado para atencion al cliente con historial prolongado.
- Generacion de codigo en pipelines: el modelo se evalua sobre codigo de GitHub y soporta tool calling, por lo que puede integrarse en flujos de CI/CD para revision, generacion o completado de codigo mediante la API compatible con OpenAI de llama.cpp.
- Agentes con razonamiento multi-paso: el modo de pensamiento previo a la respuesta y el soporte de tool calls lo hacen apto para tareas de agente que requieren planificacion y ejecucion de llamadas a herramientas.
- Procesamiento de documentacion tecnica: la baja divergencia KL en texto de prosa (0,041 a 128K) indica que la cuantizacion preserva bien la calidad en textos largos, util para resumen y extraccion de informacion de manuales o articulos.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: el archivo IQ4_XS de 93,44 GB permite ejecutar un modelo de ~177B en hardware profesional (A100 80GB en configuracion multi-GPU o H100) con llama.cpp, sin depender de servicios en la nube.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye scripts de evaluacion (parche de scoring multi-secuencia) y metricas detalladas de KL, lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion en modelos de gran escala.
- Chat local con LM Studio u Ollama: el formato GGUF y las instrucciones de quickstart permiten a desarrolladores probar el modelo en entornos de escritorio con suficiente VRAM o RAM.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en su forma habitual. En su lugar, documenta metricas de divergencia KL respecto al modelo BF16 y una comprobacion de tareas con exactitud por verosimilitud, no comparable con leaderboards publicos. Se reproducen a continuacion los datos disponibles.

Metricas de KL a 512 tokens (archivo `IQ4_XS`, 93,44 GB):

| Metrica | Valor |
|---|---|
| KL media (todos los tokens) | 0,063 |
| KL media (solo turnos del asistente) | 0,087 |
| KL p99.9 | 2,126 |
| Top-1 % | 91,3 |
| Baseline Unsloth UD-IQ4_XS (93,66 GB, KL 0,073) | gap −0,010 (IC 95%: −0,013 a −0,008) |

Metricas de KL a 128K tokens:

| Tipo de texto | KL media | KL p99.9 | Top-1 % |
|---|---:|---:|---:|
| Prosa | 0,041 | 2,530 | 92,5 |
| Chat y tool calls | 0,112 | 5,602 | 90,6 |
| Codigo | 0,043 | 1,946 | 94,7 |

Comprobacion de tareas frente a Unsloth UD-IQ4_XS (puntuacion por verosimilitud, sin plantilla de chat; no comparable con scores publicados):

| Benchmark | Resultado relativo |
|---|---|
| MMLU (13.943 preguntas) | aproximadamente igual, −0,1 pp (−0,5 a +0,2) |
| ARC-Challenge (299 preguntas) | aproximadamente igual, −0,3 pp (−3,7 a +2,7) |
| Winogrande (1.267 preguntas) | mejor, +1,8 pp (+0,2 a +3,5) |

El autor indica que `IQ4_XS` presenta menor KL media que los 13 archivos GGUF de otros publicadores dentro del rango de 0,98 a 1,06 veces su tamano a 512 tokens, y que a 128K supera a los 8 archivos comparables puntuados a esa longitud. Frente a EXL3 de turboderp (104,68 GB, KL 0,078), el archivo de nace-ai es mas fiel y mas pequeno.

## Requisitos de hardware

- VRAM estimada: el archivo `IQ4_XS` ocupa 93,44 GB en disco (pesos del modelo de lenguaje, sin vision ni MTP). Para inferencia se necesita al menos esa cantidad de memoria, distribuida entre VRAM y RAM segun la configuracion de offloading de llama.cpp.
- GPU recomendadas: configuraciones multi-GPU con A100 80GB, H100 80GB o similares. Un solo A100 80GB no es suficiente para el archivo completo; se requieren al menos dos unidades o una H100 con mayor memoria si estuviera disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna GPU de consumo actual sin offloading masivo a RAM del sistema, lo que degradaria gravemente el throughput.
- Opciones de despliegue: llama.cpp (build f7b886fe o posterior), llama-server con API compatible con OpenAI, LM Studio, Ollama. El autor menciona tambien EXL3 (ExLlamaV3) como alternativa solo para GPU CUDA, aunque el archivo publicado es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica mediciones de velocidad de generacion.

## Comparativa con modelos similares

Comparativa de archivos cuantizados del mismo modelo base (Qwen3.8-Flash-Next), segun los datos de la model card:

| Archivo | Publicador | Tamano (GB) | KL media (512 tok) | Notas |
|---|---|---:|---:|---|
| **IQ4_XS** | **nace-ai** | **93,44** | **0,063** | Mejor KL del rango |
| UD-IQ4_XS | Unsloth | 93,66 | 0,073 | Baseline de la comparacion |
| Q3_K_L | bartowski | 93,18 | no disponible en la ficha | Peor KL que IQ4_XS segun el autor |
| IQ3_M | bartowski | 93,22 | no disponible en la ficha | Peor KL que IQ4_XS segun el autor |
| AD-4.27bpw-Q4_K_M-M64 | AtomicChat | 94,51 | no disponible en la ficha | Peor KL que IQ4_XS segun el autor |
| IQ4_XS | bartowski | 97,67 | no disponible en la ficha | Mayor tamano y peor KL |
| IQ4_XS | mradermacher | 98,41 | no disponible en la ficha | Mayor tamano y peor KL |
| 3.18 EXL3 | turboderp | 104,68 | 0,078 | Formato EXL3, solo CUDA |

No se dispone de comparacion con modelos de otros desarrolladores (por ejemplo, Llama o Mistral de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser un modelo entrenado por Qwen, cabe esperar los sesgos habituales de los corpus web a gran escala, pero no hay confirmacion en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada. El modo de razonamiento previo puede reducir o no este riesgo, pero no hay datos al respecto.
- Idiomas soportados: no disponibles. La evaluacion se realiza exclusivamente sobre texto en ingles (Wikipedia en ingles, codigo, chat), por lo que el rendimiento en castellano no esta verificado.
- La cuantizacion IQ4_XS introduce divergencia respecto al BF16 (KL media 0,063 en texto general, 0,112 en chat y tool calls a 128K). En contextos largos de conversacion, la fidelidad es menor que en prosa o codigo.
- El modelo requiere hardware profesional de gama alta; no es viable en GPU de consumo sin degradacion severa del rendimiento.
- El repositorio tiene 12 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-Flash-Next debe verificarse por separado para confirmar que mantiene la misma licencia.
- El tool estandar de llama.cpp requiere un parche para evaluar este modelo debido a sus n-gram embeddings; los usuarios deben aplicar el parche incluido en el repositorio (`scoring/patch_mc_seq.py`) para tareas de scoring multi-secuencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Script de evaluacion incluido en el repositorio: `scoring/patch_mc_seq.py` (referenciado en la model card)
- Grafico de KL frente a tamano: `assets/kl-vs-size.png` (referenciado en la model card)
