# pranil00/ONIX-opt-350b-GGUF

## Resumen

ONIX-opt-350b-GGUF es una cuantización extrema del modelo base facebook/opt-350b, publicada por el usuario pranil00 bajo la etiqueta de la denominada "ONIX Community". El artefacto consiste en un único fichero GGUF de 66,74 GB generado con el esquema de cuantización IQ1_S (1,56 bits por peso), lo que supone una compresión de 10,26x respecto a los pesos en FP16 (684,52 GB). El objetivo declarado es permitir la ejecución de un modelo de 350 000 millones de parámetros en hardware de consumo mediante offload híbrido entre CPU y GPU.

El modelo base pertenece a la familia OPT (Open Pre-trained Transformer) de Meta AI, una arquitectura transformer decoder-only densa orientada a generación de texto. La model card del artefacto no documenta el proceso de entrenamiento del modelo original ni los datos utilizados, y se limita a describir el pipeline de cuantización y los requisitos de memoria. No se especifican idiomas soportados ni se publican resultados de benchmarks de calidad.

La relevancia de esta ficha es fundamentalmente técnica y crítica: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, con afirmaciones de rendimiento no verificadas (como una "retención de fidelidad cognitiva del 60 %") y con un modelo base cuya existencia pública no está confirmada en el ecosistema habitual de Hugging Face. Debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OPT) |
| Parametros totales | 350 000 millones (350B), segun la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 192 tokens (GPU/Apple Silicon); 4 096 tokens (CPU) segun la model card |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `facebook--opt-350b-IQ1_S.gguf`, 66,74 GB) |

## Arquitectura y entrenamiento

El modelo base facebook/opt-350b se enmarca en la familia OPT de Meta AI, compuesta por transformers decoder-only densos con atención multi-cabeza estándar. La model card del artefacto cuantizado no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original recibió ajuste por RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa, SSM híbrido, etc.).

La contribución del artefacto es exclusivamente el proceso de cuantización: se aplica el esquema IQ1_S de la familia GGUF (usado por llama.cpp), que reduce los pesos a 1,56 bits por parámetro y genera un fichero de 66,74 GB. El pipeline se ejecuta con la herramienta `run-any-model` del autor PranilShah-08, descrita como un motor de optimización adaptativo al dispositivo. La model card incluye un informe de telemetría que indica que solo 8 de las 104 capas (aproximadamente el 7 %) se descargan en el acelerador (GPU o Metal), mientras que el resto se transmite desde la RAM del sistema, lo que implica una latencia de generación notablemente superior a la de un modelo que quepa íntegramente en VRAM.

## Capacidades

- Generación de texto autoregresiva, propia de un transformer decoder-only de la familia OPT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas; el campo de idiomas no está disponible.
- No se documentan capacidades de visión, audio, thinking mode ni otras modalidades.
- La cuantización IQ1_S degrada severamente la coherencia; la propia model card reconoce una retención de calidad del 60 % respecto al baseline FP16.

## Casos de uso

- Experimentación académica con cuantización extrema: el artefacto permite estudiar el comportamiento de un modelo de 350B a 1,56 bits por peso y medir la degradación de calidad frente al baseline FP16, usando el pipeline `run-any-model` o llama.cpp.
- Pruebas de offload híbrido CPU-GPU: sirve para validar estrategias de streaming de capas desde RAM del sistema hacia el acelerador, dado que solo 8 de 104 capas caben en el acelerador en el perfil documentado.
- Docencia sobre formatos GGUF: útil como ejemplo didáctico de fichero GGUF de gran tamaño y de los compromisos entre compresión, memoria y velocidad.
- Evaluación de infraestructura de memoria: permite medir requisitos reales de RAM unificada (73,54 GB en Apple Silicon) o VRAM dedicada (68,24 GB en NVIDIA) para modelos que exceden el acelerador.
- Reproducción de pipelines de cuantización: el flujo con `run-any-model` y llama.cpp sirve como referencia para cuantizar otros modelos con esquemas IQ1_S.
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes autónomos ni tareas que requieran fiabilidad, dado que no hay benchmarks publicados y la retención de calidad declarada es del 60 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una matriz de telemetría de memoria y velocidad relativa (no de calidad), con los siguientes datos:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision (bits/parametro) | 16,0 | 1,56 | -90,2 % |
| Tamano de pesos | 684,52 GB | 66,74 GB | -90,2 % |
| KV cache | 6 656 MB (FP16) | 6 656 MB (Q4_0) | Optimizado |
| RAM residente total | 710,82 GB | 73,54 GB | -89,7 % |
| Calidad estimada | 100,0 % baseline | 60,0 % retenida | -40,0 % |
| Capas aceleradas | 0 % (riesgo de crash) | 8/104 capas | - |

No se aportan valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: 68,24 GB de VRAM dedicada en GPU NVIDIA (series RTX 30/40/50) segun la model card.
- Memoria unificada en Apple Silicon (M1/M2/M3/M4/M5): 73,54 GB.
- RAM libre en PC Windows/Linux (CPU): 75,54 GB.
- GPU recomendadas: no se especifican modelos concretos; el perfil de 68,24 GB de VRAM encaja con GPUs profesionales (A100 80 GB, H100 80 GB) o configuraciones multi-GPU. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 5090 (32 GB) sin offload a RAM del sistema.
- Cabe en consumer GPU: no de forma integra; requiere offload hibrido a RAM del sistema (solo 8 de 104 capas en acelerador).
- Opciones de despliegue: `run-any-model` CLI, Ollama (via Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no se publican valores numericos; la model card advierte de que la velocidad de generacion sera mas lenta por el streaming de capas desde RAM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables del modelo base facebook/opt-350b en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La siguiente tabla recoge unicamente los datos disponibles de este artefacto frente a referencias genericas de la familia OPT, sin valores de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-opt-350b-GGUF (este) | 350B | 8 192 tokens | Apache 2.0 | GGUF IQ1_S | Hugging Face (0 descargas) |
| facebook/opt-350b (base declarado) | 350B | No disponible | No disponible | No disponible | No confirmado publicamente |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantizacion IQ1_S a 1,56 bits por peso implica una degradacion severa de calidad; la propia model card estima una retencion del 60 % respecto al baseline FP16, lo que la hace inadecuada para tareas que requieran precision.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) que permitan verificar el rendimiento real.
- El modelo base facebook/opt-350b no esta confirmado en el ecosistema publico de Hugging Face; la model card no aporta enlaces verificables al modelo original ni a sus pesos.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por parte de la comunidad.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinacion especificos; al ser un modelo OPT, es previsible un sesgo hacia el ingles y hacia los datos de preentrenamiento originales, pero no hay confirmacion en la informacion disponible.
- La licencia declarada es Apache 2.0, pero la model card incluye una clausula de exencion total de responsabilidad que traslada al usuario toda la responsabilidad sobre las salidas; conviene revisar los terminos antes de un uso comercial.
- El rendimiento sera lento por el offload hibrido (8 de 104 capas en acelerador); no es apto para despliegues de baja latencia.
- La model card incluye afirmaciones no verificadas (por ejemplo, "100 % Native Metal Accelerated" o "Optimal") que deben tratarse con escepticismo.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-opt-350b-GGUF
- Modelo base declarado: https://huggingface.co/facebook/opt-350b
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
