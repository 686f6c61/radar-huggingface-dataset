# nvidia/Qwen3.8-27B-NVFP4-QAD

## Resumen

NVIDIA Qwen3.8-27B-NVFP4-QAD es la version cuantizada del modelo Qwen3.8-27B de Alibaba, publicada por NVIDIA a traves de su herramienta Model Optimizer. El modelo conserva la arquitectura transformer autorregresiva del original (clase `Qwen3_5ForConditionalGeneration`) con 27.728.983.792 parametros totales, pero reduce el peso de los pesos a formato NVFP4 (punto flotante de 4 bits nativo de NVIDIA) mediante un proceso de destilacion consciente de la cuantizacion (QAD, quantization-aware distillation). El resultado es un checkpoint de aproximadamente 19,9 GB, apto para inferencia de baja precision en hardware Blackwell.

La propuesta de valor es clara: ofrecer un modelo de 27B con contexto de hasta 262.144 tokens y capacidad multimodal de entrada (texto, imagen y video) en un formato de 4 bits optimizado para GPUs NVIDIA de ultima generacion, manteniendo la precision lo mas cerca posible del modelo original gracias a la recuperacion de precision que aporta QAD. Esta pensado para desarrolladores que despliegan agentes de IA, chatbots y sistemas RAG y necesitan reducir el coste de VRAM y aumentar el throughput sin reentrenar desde cero.

El modelo se distribuye bajo la NVIDIA Open Model License (con el modelo base Qwen3.8-27B bajo Apache 2.0) y esta integrado con vLLM y SGLang. La version de cuantizacion corresponde a NVFP4 QAD 1.0, generada con NVIDIA-ModelOpt v0.48.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 27.728.983.792 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (entrada y salida configurable) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA), etiquetado como 8-bit en metadatos de HF; QAD |
| Idiomas soportados | no disponible (los datos de entrenamiento citados son en ingles) |
| Licencia | NVIDIA Open Model License (modelo base Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | safetensors (repo de 19,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer autorregresivo de 27B parametros con capacidad de entrada multimodal (texto, imagen RGB y video MP4/WebM). Sobre esa base, NVIDIA aplica cuantizacion a NVFP4 combinada con destilacion consciente de la cuantizacion (QAD): en lugar de un simple post-training quantization, se recupera precision haciendo que el modelo cuantizado imite al modelo de referencia en alta precision. La herramienta empleada es NVIDIA Model Optimizer v0.48.0.

El proceso de calibracion utiliza el dataset Nemotron-Post-Training-Dataset-v3 (conversaciones multi-turno de dominios diversos, recopiladas y etiquetadas de forma automatizada). Los datos de entrenamiento de la destilacion corresponden a Nemotron-Cascade-2-SFT-Data, con 1.260 millones de tokens en ingles que cubren matematicas, ciencia, chat, seguimiento de instrucciones, seguridad, agentes conversacionales, ingenieria de software y tareas de agente de terminal. No se detalla si hubo RLHF o DPO especifico en esta version cuantizada. La innovacion tecnica principal es la combinacion de NVFP4 con QAD para mantener la fidelidad respecto al modelo de 27B original en un checkpoint de ~20 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento de nivel avanzado (evaluado en GPQA Diamond, preguntas de posgrado en biologia, fisica y quimica).
- Seguimiento de instrucciones estructuradas y con multiples restricciones (IFBench).
- Codigo cientifico y de ingenieria (SciCode).
- Capacidades agenticas en entornos de terminal (Terminal-Bench 2.1).
- Razonamiento multimodal de nivel universitario con entrada de imagen y video (MMMU Pro).
- Recuperacion en contexto largo (AA-LCR, Artificial Analysis Long Context Recall) gracias a ventana de 262.144 tokens.
- Entrada multimodal: texto, imagen (RGB) y video (MP4/WebM); salida solo texto.
- Soporte de despliegue en vLLM y SGLang; tool calling y function calling no se detallan explicitamente en la informacion disponible.

## Casos de uso

- Agentes de terminal automatizados: el modelo esta evaluado en Terminal-Bench 2.1 y entrenado con tareas de agente de terminal, por lo que puede ejecutar comandos, interpretar salidas y completar flujos de trabajo de linea de comandos en pipelines de automatizacion.
- Atencion al cliente multi-turno: con 262.144 tokens de contexto puede mantener conversaciones largas con historial extenso y documentos de referencia sin truncar, manteniendo coherencia en sesiones prolongadas.
- Sistemas RAG sobre corpus grandes: la ventana de contexto permite inyectar decenas de documentos completos como contexto, reduciendo la necesidad de recuperacion granular y mejorando la calidad de las respuestas en dominios documentales.
- Generacion y revision de codigo cientifico: evaluado en SciCode, es adecuado para asistir en la implementacion de algoritmos numericos y codigo de simulacion donde se requiere precision tecnica.
- Analisis de documentos con imagenes y video: al aceptar entrada de imagen y video, puede emplearse en inspeccion de capturas, diagramas tecnicos o fotogramas de video para tareas de descripcion y extraccion de informacion.
- Razonamiento experto en dominios cientificos: su rendimiento en GPQA Diamond lo hace util para asistentes de investigacion que responden preguntas de posgrado en fisica, quimica y biologia.
- Despliegue de bajo coste en produccion: al estar cuantizado a NVFP4, reduce la huella de VRAM frente al modelo de 27B en BF16, permitiendo servir mas instancias por GPU Blackwell en entornos de inferencia de alta concurrencia.

## Benchmarks y rendimiento

La model card cita los conjuntos de evaluacion empleados (GPQA Diamond, IFBench, MMMU Pro, SciCode, Terminal-Bench 2.1 y AA-LCR), pero no incluye los valores numericos obtenidos en la informacion proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 19,9 GB en safetensors NVFP4; en la practica se necesita margen adicional para cache KV y contexto. Con contexto de 262.144 tokens la cache KV crece de forma significativa y puede requerir decenas de GB adicionales segun la configuracion.
- GPU recomendadas: NVIDIA Blackwell (la model card indica compatibilidad de microarquitectura Blackwell y pruebas en GB300). No se declara soporte para generaciones anteriores (Hopper, Ada) en la informacion disponible.
- Cabe en GPU de consumo: no disponible; el modelo esta validado en hardware Blackwell de centro de datos (GB300) y no se documenta funcionamiento en RTX 4090 u otras consumer.
- Opciones de despliegue: vLLM y SGLang (motores de inferencia soportados oficialmente). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Qwen3.8-27B-NVFP4-QAD | ~27B | 262.144 | NVFP4 (QAD) | NVIDIA Open Model License | Hugging Face (nvidia) |
| Qwen/Qwen3.8-27B (base) | ~27B | 262.144 | BF16 (original) | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de 27B cuantizadas a 4 bits de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico contraste documentado es con el modelo base Qwen3.8-27B, del que este checkpoint es una version cuantizada con recuperacion de precision via QAD.

## Limitaciones y advertencias

- La cuantizacion NVFP4 puede introducir degradacion de precision respecto al modelo base en tareas sensibles; QAD mitiga pero no elimina esta perdida.
- Los datos de entrenamiento de destilacion citados son exclusivamente en ingles (1,26B tokens), lo que puede limitar el rendimiento en otros idiomas; no se declaran idiomas soportados oficialmente.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en contextos largos y dominios especializados.
- La licencia NVIDIA Open Model License impone terminos adicionales sobre el uso comercial respecto al Apache 2.0 del modelo base; es necesario revisar el acuerdo antes de desplegar en produccion.
- Compatibilidad de hardware restringida a NVIDIA Blackwell; no se documenta soporte en GPUs anteriores, lo que limita su uso fuera de infraestructura NVIDIA reciente.
- La model card no proporciona resultados numericos de benchmarks, por lo que no es posible verificar cuantitativamente la fidelidad respecto al modelo original.
- El contexto de 262.144 tokens exige planificacion cuidadosa de memoria; sesiones con contexto maximo pueden no caber en configuraciones de GPU unica.
- No se detalla el soporte explicito de tool calling o function calling, lo que debe validarse antes de integrarlo en pipelines agenticos que dependan de esas interfaces.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Blog sobre QAD de NVIDIA: https://developer.nvidia.com/blog/how-quantization-aware-training-enables-low-precision-accuracy-recovery/
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Dataset de calibracion Nemotron-Post-Training-Dataset-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Dataset de entrenamiento Nemotron-Cascade-2-SFT-Data: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Licencia Apache 2.0 (modelo base): https://www.apache.org/licenses/LICENSE-2.0
