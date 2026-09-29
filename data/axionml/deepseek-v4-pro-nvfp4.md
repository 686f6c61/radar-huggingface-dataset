# AxionML/DeepSeek-V4-Pro-NVFP4

## Resumen

AxionML/DeepSeek-V4-Pro-NVFP4 es un espejo del checkpoint cuantizado que NVIDIA publicó para DeepSeek-V4-Pro, el modelo de lenguaje insignia de DeepSeek-AI. Se trata de una cuantización NVFP4 del modelo original en FP8: los pesos y las activaciones de los expertos enrutados del MoE pasan a 4 bits, mientras que la atención y los expertos compartidos conservan la precisión FP8 de origen. El resultado es un checkpoint de aproximadamente 913 GB, listo para servir, que mantiene el 1,6 billones de parámetros totales y 49 mil millones de parámetros activos por token del modelo base.

El modelo base es un Mixture-of-Experts disperso con atención híbrida (Compressed Sparse Attention y Heavily Compressed Attention), una ventana de contexto nativa de 1 millón de tokens y tres modos de razonamiento (Non-think, Think High y Think Max). Está orientado a cargas de trabajo de razonamiento complejo, generación de código y uso agéntico, y su integración con herramientas de codificación agéntica es uno de sus puntos fuertes declarados.

La relevancia de esta ficha concreta es práctica: NVIDIA cuantizó el modelo con Model Optimizer v0.44 y lo validó para despliegue en SGLang y vLLM sobre hardware Blackwell (GB300 con tensor-parallel 4). AxionML se limita a replicar esos pesos sin modificarlos, bajo licencia MIT, para facilitar su consumo desde HuggingFace. Es importante señalar que el propio repositorio indica que esta revisión ha quedado superada por AxionML/DeepSeek-V4-Pro-0813-NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (Compressed Sparse Attention + Heavily Compressed Attention) |
| Parametros totales | 1.598.839.674.782 (~1,6 T) |
| Parametros activos | 49 B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de expertos MoE enrutados) + FP8 (atencion y expertos compartidos); etiquetado tambien como 8-bit / fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de ~913,1 GB) |
| Modos de razonamiento | Non-think / Think High / Think Max |
| Herramienta de cuantizacion | NVIDIA Model Optimizer v0.44 |
| Dataset de calibracion | cnn_dailymail, Nemotron-Post-Training-Dataset-v2 |
| Revision de origen | nvidia/DeepSeek-V4-Pro-NVFP4, revision 1449d1e641023406daf6b432361486c768aad740 |
| Modelo base | deepseek-ai/DeepSeek-V4-Pro |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un transformer disperso de tipo Mixture-of-Experts con 1,6 billones de parametros totales y 49 mil millones activados por token. Su rasgo arquitectonico diferencial frente a DeepSeek-V3.2 es la atencion hibrida, que combina Compressed Sparse Attention con Heavily Compressed Attention para reducir el coste computacional y de memoria en contextos muy largos. Esa combinacion es la que permite sostener una ventana nativa de 1 millon de tokens sin que el coste de atencion se dispare de forma cuadratica. El modelo expone tres niveles de esfuerzo de razonamiento, de modo que el usuario puede elegir entre respuesta directa (Non-think) o cadenas de pensamiento progresivamente mas largas (Think High, Think Max).

Sobre el entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card original de DeepSeek-AI y no se reproducen en el material consultado. Lo que si esta documentado es el proceso de cuantizacion: NVIDIA aplico Model Optimizer v0.44 para convertir a NVFP4 los pesos y activaciones de los expertos enrutados, usando un codebook E2M1 con escalado por bloques FP8 (E4M3) sobre microbloques de 16 elementos. Este esquema permite escalas fraccionarias y una seleccion de escala que minimiza el error, en lugar de limitarse a potencias de dos. En las Tensor Cores de Blackwell, los multiplicadores FP4 nativos se combinan con acumulacion en FP32 para proteger la precision del producto escalar. La atencion y los expertos compartidos se mantienen en FP8, lo que limita la perdida de calidad a las capas donde la cuantizacion agresiva es menos danina.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con tres modos de esfuerzo (Non-think, Think High, Think Max) que permiten ajustar el coste de inferencia segun la dificultad de la tarea.
- Razonamiento cientifico y de dominio experto, respaldado por resultados en GPQA Diamond y SciCode.
- Generacion de codigo, con soporte declarado para integracion en flujos de codificacion agentica.
- Uso agéntico: el modelo base esta integrado con herramientas como Claude Code, OpenClaw y OpenCode, y se emplea en la codificacion agéntica interna de DeepSeek.
- Seguimiento de instrucciones complejas y multi-restriccion, medido con IFBench.
- Contexto ultralargo de hasta 1M de tokens, adecuado para documentos extensos, repositorios de codigo completos o historiales de conversacion muy largos.
- Capacidades multimodales: la informacion de busqueda menciona capacidades multimodales para el modelo base, pero la model card de este checkpoint cuantizado no las detalla; tratar como no confirmado para esta revision concreta.
- Soporte de tool calling / function calling: no se detalla de forma explicita en la model card de esta revision; el material consultado si menciona integracion agéntica en el modelo base.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un arbol de codigo extenso o un monorepo mediano y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el contenido.
- Codificacion agentica en produccion: integrado en herramientas tipo Claude Code u OpenCode, el modelo puede planificar cambios multi-archivo, ejecutar comandos y corregir errores en bucle, aprovechando Think High o Think Max para tareas de refactorizacion profunda.
- Razonamiento cientifico asistido: con resultados de 89,33 en GPQA Diamond y 53,45 en SciCode, es adecuado para apoyo a investigacion en dominios tecnicos donde se requiere justificar cadenas de razonamiento largas.
- Atencion al cliente en dominios regulados: el resultado de 94,83 en τ²-Bench Telecom sugiere buen desempeno en conversaciones multi-turno con politicas estrictas, donde el agente debe respetar reglas de negocio y usar herramientas internas.
- Procesamiento de documentacion legal o financiera: informes anuales, contratos o expedientes de cientos de miles de tokens pueden analizarse en una sola ventana, con seguimiento de referencias cruzadas entre secciones.
- Generacion de informes estructurados a partir de fuentes heterogeneas: la model card del modelo base menciona la generacion de PDFs como ejemplo de salida, lo que encaja con pipelines de sintesis documental.
- Evaluacion y red-teaming de sistemas agénticos: el modelo puede actuar como agente de referencia de alta capacidad para comparar el rendimiento de agentes mas pequenos en las mismas tareas.
- Servicio de inferencia de alta concurrencia en clúster Blackwell: al reducir el checkpoint a FP4 en los expertos, se abarata el coste por token frente al despliegue en FP8, lo que lo hace viable para plataformas internas de inferencia.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA para este checkpoint:

| Benchmark | FP8 (referencia AA) | FP8 (NVIDIA) | NVFP4 |
|---|---:|---:|---:|
| GPQA Diamond | 89,00 | 89,49 | 89,33 |
| AA-LCR | 66,00 | 66,89 | 66,33 |
| τ²-Bench Telecom | 96,00 | 94,25 | 94,83 |
| SciCode | 50,00 | 51,08 | 53,45 |
| IFBench | 76,00 | 77,82 | 77,21 |

La diferencia entre la columna FP8 de NVIDIA y la NVFP4 es inferior a un punto en todos los benchmarks salvo SciCode, donde la version cuantizada a 4 bits obtiene 2,37 puntos mas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K para esta revision.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 913 GB en NVFP4 para los expertos, mas los tensores en FP8 de atencion y expertos compartidos. El repo completo ocupa 913,1 GB.
- Memoria adicional para KV cache: significativa, dada la ventana de 1M tokens; el ejemplo oficial de vLLM usa `--kv-cache-dtype fp8` precisamente para contenerla.
- GPU recomendadas: hardware Blackwell con soporte nativo de FP4, es decir GB200/GB300 y B200/B300. NVIDIA valida vLLM con tensor-parallel 4 sobre GB300, lo que implica unas 4 GPU de 288 GB de HBM3e.
- SGLang: el ejemplo oficial lanza el servidor con `--tensor-parallel-size 8 --trust-remote-code`.
- vLLM: `vllm serve` con `--tensor-parallel-size 4 --trust-remote-code --kv-cache-dtype fp8`.
- No cabe en GPU de consumo: ni RTX 4090 ni RTX 5090 pueden alojar un checkpoint de 913 GB. Tampoco es viable en A100 ni H100, porque NVFP4 requiere las Tensor Cores de Blackwell para sus multiplicadores FP4 nativos.
- Opciones de despliegue: SGLang (deteccion automatica de NVFP4 via `hf_quant_config.json`, sgl-project/sglang#25820) y vLLM. No se documentan rutas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AxionML/DeepSeek-V4-Pro-NVFP4 (esta ficha) | 1,6 T totales / 49 B activos | 1M | NVFP4 + FP8 | MIT | Espejo sin modificar del checkpoint de NVIDIA; superado por la revision 0813 del mismo autor |
| nvidia/DeepSeek-V4-Pro-NVFP4 | 1,6 T / 49 B | 1M | NVFP4 + FP8 | MIT | Fuente original de la cuantizacion; identico en pesos |
| amd/DeepSeek-V4-Pro-NVFP4 | 1,6 T / 49 B | 1M | NVFP4 + FP8 | MIT | Tercer espejo del mismo checkpoint, orientado a despliegue en hardware AMD |
| deepseek-ai/DeepSeek-V4-Pro | 1,6 T / 49 B | 1M | FP8 (original) | MIT | Modelo base sin cuantizar; mayor huella de memoria y mayor precision nominal |

La comparacion con alternativas de otra familia (por ejemplo DeepSeek-V3.2, de 671 B totales y 37 B activos) no esta soportada por datos de benchmarks en la informacion disponible para esta revision.

## Limitaciones y advertencias

- Sesgos heredados: la model card advierte de que el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales, y que la version cuantizada los hereda.
- Riesgo de contenido inexacto, sesgado u ofensivo: la propia model card lo reconoce de forma explicita.
- Alucinacion: no se publican tasas de alucinacion especificas para esta revision; aplicar las precauciones habituales en produccion.
- Idiomas soportados: no disponible. La ficha de HuggingFace no declara cobertura linguistica, lo que impide garantizar un rendimiento multilingue concreto.
- Requisito de hardware Blackwell: NVFP4 no es funcional en Hopper ni en Ada Lovelace con las ventajas previstas. Desplegar este checkpoint fuera de GPU Blackwell no es viable.
- Precision mixta: solo los expertos enrutados estan en NVFP4; la atencion y los expertos compartidos siguen en FP8. Es un detalle relevante al estimar memoria y al interpretar los benchmarks.
- Revision superada: el repositorio indica que esta version queda reemplazada por AxionML/DeepSeek-V4-Pro-0813-NVFP4. Para despliegues nuevos conviene evaluar esa revision antes.
- Naturaleza de espejo: AxionML no ha realizado la cuantizacion ni aporta garantias propias; el credito y la responsabilidad tecnica corresponden a NVIDIA.
- Licencia MIT: permite uso comercial y no comercial, pero conviene verificar las condiciones de la model card original de DeepSeek-AI para el modelo base.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- `trust_remote_code`: tanto SGLang como vLLM exigen activar esta opcion, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AxionML/DeepSeek-V4-Pro-NVFP4
- Checkpoint cuantizado original de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4
- Espejo de AMD: https://huggingface.co/amd/DeepSeek-V4-Pro-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Revision posterior del mismo autor: https://huggingface.co/AxionML/DeepSeek-V4-Pro-0813-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Pull request de soporte NVFP4 en SGLang: https://github.com/sgl-project/sglang/pull/25820
- Anuncio de DeepSeek-V4 Preview: https://www.deepseek.com/en/news/v4-preview/
- Pagina de producto de DeepSeek-V4-Pro: https://deepseeksr1.com/v4-pro/
- Ficha de inferencia en Lambda: https://lambda.ai/inference-models/deepseek-ai/deepseek-v4-pro
