# hanseungwook/Llama-3.2-1B-Compressed-Joint-GSM8K-Aug-NL

## Resumen

Llama-3.2-1B-Compressed-Joint-GSM8K-Aug-NL es un checkpoint de investigación publicado por el usuario hanseungwook que adapta el modelo meta-llama/Llama-3.2-1B-Instruct mediante una técnica denominada Compressed Joint con razonamiento latente (latent reasoning). El objetivo del modelo no es la conversación general, sino resolver problemas aritméticos de tipo GSM8K mediante un mecanismo de compresión y refinamiento iterativo en un espacio latente, con slots intermedios y un decodificador de respuesta.

Se trata de un artefacto experimental: el propio autor lo describe como el mejor checkpoint de validación del estudiante, obtenido en la época 6 / paso 6.414 de un entrenamiento de 10 épocas. Su precisión de validación registrada es del 29,92 % (155/518) con inferencia de estudiante basada solo en la pregunta, decodificación greedy y un máximo de 64 tokens generados. Es un resultado de validación, no una puntuación oficial del test de GSM8K.

Su relevancia actual es acotada pero concreta: sirve como material reproducible para investigar razonamiento latente sobre un backbone pequeño, e incluye el state dict nativo completo, el manifiesto de arquitectura y el bundle de código necesario para cargarlo. No es un export de AutoModelForCausalLM y requiere CUDA y acceso al modelo base fijado a una revisión concreta para poder ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2 1B Instruct) con razonamiento latente Compressed Joint: compresor, slots y refinamiento iterativo |
| Parametros totales | 1B en el backbone mas compresor y adaptadores LoRA (rango 128); total exacto no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (limite de preprocesado de tokens en entrenamiento: 256) |
| Tipos de cuantizacion | no disponible; se distribuye como state dict nativo en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy asociada) |
| Formato de pesos | state dict nativo de PyTorch (no safetensors, no GGUF); requiere el bundle `code/` incluido |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct, revision `9213176726f574b556790deb65791e0c5aa438b6` |
| Checkpoint seleccionado | epoca 6 / paso 6.414 (de 10 epocas) |
| Tamano del repositorio | 2,9 GB |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

El modelo parte del backbone Llama 3.2 1B Instruct y anade un modulo compresor de arquitectura legacy con anchura 512, 2 capas, 8 cabezas y FFN de 2048. Sobre esa base se aplican adaptadores LoRA de rango 128, alpha 32 y dropout 0,1, con las filas BoT/EoT entrenables y atadas. El proceso de razonamiento latente usa 6 slots y 6 iteraciones de refinamiento. El objetivo de entrenamiento combina tres terminos de entropia cruzada (respuesta explicita, respuesta codificada y respuesta predicha, todos con peso 1), una perdida de matching latente Smooth L1 normalizada por la RMS del residuo del profesor (escala 1, peso 1) y una KL de respuesta con peso 1, temperatura 2 y CE de profesor con maximo 1. El decodificador de respuesta predicha se entrena de forma desacoplada.

Los datos de entrenamiento provienen del conjunto zen-E/GSM8k-Aug-NL, con 273.632 ejemplos aceptados. El procesado de cadena de pensamiento usa el fraccionamiento por punto y espacio original de CODI, descartando el segmento final. El limite de tokens en el preprocesado es de 256. La cohorte de validacion son 518 preguntas del conjunto de entrenamiento original de GSM8K que no aparecen en el conjunto de aumento fijado. La receta usa AdamW con weight decay 0,1 y norma de gradiente maxima 2, learning rate 3e-4, batch global 256, schedule coseno con warmup ratio 0,03 y 10 epocas, en precision BF16 y semilla 11. Las estadisticas de residuo del profesor se calcularon con 12.800 ejemplos EMA y 25.600 de warmup, con suelo relativo 0,5. El paquete incluye parametros y buffers completos, pero no estado de optimizador, scheduler ni RNG.

## Capacidades

- Resolucion de problemas aritmeticos de tipo GSM8K mediante razonamiento latente en varios pasos (6 slots, 6 iteraciones de refinamiento).
- Generacion de texto limitada a la tarea de respuesta a preguntas de matematicas de nivel escolar; el autor indica que debe pasarse texto de pregunta plano.
- Inferencia de estudiante basada solo en la pregunta, decodificacion greedy y un maximo de 64 tokens generados.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso con herramientas externas.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles (`en`).
- Capacidades especiales: razonamiento en espacio latente con compresor y slots; no se documentan vision, audio ni modo de pensamiento explicito con tokens de razonamiento visibles.
- No incluye un chat template estandar ni carga mediante AutoModelForCausalLM; la inferencia se realiza con el helper `run_inference.py` incluido.

## Casos de uso

- Reproduccion de investigacion en razonamiento latente: el repositorio incluye el manifiesto nativo, la configuracion de ejecucion y los resultados de validacion de las diez epocas, lo que permite auditar la receta completa y comparar variantes del mecanismo Compressed Joint.
- Experimentos de destilacion de cadenas de pensamiento: al usar el fraccionamiento por frases de CODI y perdidas de matching latente contra un profesor, sirve como punto de partida para estudiar como se comprime el razonamiento en slots de baja dimension.
- Evaluacion de tecnicas de compresion sobre backbones pequenos: el compresor de anchura 512 y 2 capas permite medir cuanto rendimiento se conserva al reducir el estado latente de un modelo de 1B.
- Pruebas de LoRA en tareas de matematicas: la configuracion de rango 128, alpha 32 y dropout 0,1 es directamente reutilizable para comparar adaptadores sobre el mismo backbone.
- Analisis de coste de inferencia en razonamiento iterativo: con 6 slots, 6 iteraciones y hasta 64 tokens generados, es util para medir la sobrecarga frente a una generacion directa de un modelo de 1B.
- Validacion de pipelines de empaquetado y carga reproducible: el repositorio incluye hashes, tamanos de fichero y comprobaciones de origen, lo que lo hace adecuado para probar flujos de verificacion de artefactos (revision fijada del modelo base, versiones exactas de `torch`, `transformers` y `peft`).
- Docencia y practicas sobre GSM8K: con una tasa de acierto del 29,92 % en validacion, es un ejemplo realista de las limitaciones de los modelos pequenos en aritmetica de varios pasos.

## Benchmarks y rendimiento

El unico resultado publicado en la informacion disponible es la precision de validacion registrada por el autor. No se ha publicado ninguna puntuacion oficial del test de GSM8K.

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision de validacion (held-out) | 29,92 % (155/518) | Inferencia de estudiante solo con la pregunta, decodificacion greedy, maximo 64 tokens generados |
| Conjunto de validacion | 518 preguntas del entrenamiento original de GSM8K ausentes del set de aumento fijado | Epoca 6 / paso 6.414 |
| Test oficial de GSM8K | no disponible | No se ha ejecutado ni publicado |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponible | No se han publicado resultados en la informacion disponible |

## Requisitos de hardware

- CUDA es obligatorio: el autor indica explicitamente que la carga requiere CUDA y acceso al modelo base fijado `meta-llama/Llama-3.2-1B-Instruct` o a una cache local existente.
- VRAM estimada: el repositorio ocupa 2,9 GB y el backbone de 1B en BF16 ronda los 2,5 GB de pesos, a lo que se suman el compresor (anchura 512, 2 capas) y los adaptadores LoRA de rango 128. La inferencia deberia caber holgadamente en 8 GB de VRAM en BF16, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para pruebas en BF16; A100, H100 o RTX 4090 son suficientes con amplio margen, y tambien tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. La unica via soportada es el helper `run_inference.py` del bundle `code/` con `torch==2.7.1`, `transformers==4.52.4` y `peft==0.15.2`.
- No existe una cuantizacion publicada (ni GGUF ni AWQ/GPTQ), por lo que no se puede reducir el peso del modelo con herramientas estandar sin trabajo adicional.
- Latencia y throughput: no disponible. Cabe esperar un coste mayor que una generacion directa con Llama 3.2 1B, dado que el mecanismo ejecuta 6 iteraciones de refinamiento sobre 6 slots ademas de generar hasta 64 tokens, pero no se publican mediciones.

## Comparativa con modelos similares

La comparacion se plantea frente al modelo base del que deriva y frente a alternativas pequenas de proposito general. Los resultados de benchmarks de las alternativas no se han consultado en la informacion disponible, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Compressed-Joint-GSM8K-Aug-NL | 1B en backbone mas compresor y LoRA | no disponible (limite de entrenamiento de 256 tokens) | Razonamiento latente para GSM8K, requiere codigo custom | Llama 3.2 Community License | HuggingFace, state dict nativo, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1B | no disponible en esta ficha | Modelo instructivo de proposito general | Llama 3.2 Community License | Ampliamente disponible, formatos estandar |
| Alternativas pequenas de proposito general (por ejemplo, familias de 1B a 2B con licencia permisiva) | 1B-2B | no disponible | Instruccion y chat general | Variable segun familia | Estandar en HuggingFace |
| Otros trabajos de razonamiento latente tipo CODI | no disponible | no disponible | Razonamiento en espacio latente | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento bajo en su propia tarea: 29,92 % de acierto en validacion, muy lejos de un uso fiable en produccion para aritmetica.
- La cifra publicada es una validacion interna sobre 518 preguntas, no una puntuacion oficial del test de GSM8K; no es comparable directamente con resultados estandar.
- La decodificacion es greedy y el limite es de 64 tokens generados, lo que restringe la longitud de las respuestas.
- El modelo solo declara ingles (`en`); no hay soporte multilingue documentado.
- No es un export de AutoModelForCausalLM: no se puede cargar con `transformers` de forma estandar ni usar con servidores de inferencia convencionales (vLLM, TGI, Ollama, llama.cpp).
- Requiere CUDA y versiones exactas de dependencias (`torch==2.7.1`, `transformers==4.52.4`, `peft==0.15.2`), lo que dificulta su integracion en entornos con restricciones de versiones.
- Depende de una revision concreta del modelo base de Meta, de acceso restringido sujeto a la licencia de Llama 3.2.
- Licencia Llama 3.2 Community License: uso comercial permitido con condiciones, incluida la obligacion de mostrar "Built with Llama", el cumplimiento de la Acceptable Use Policy y la clausula de terminacion para productos con mas de 700 millones de usuarios mensuales. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad ni de calibracion; en tareas aritmeticas un modelo de este tamano puede producir resultados incorrectos con apariencia de plausibilidad.
- Sesgos: no se ha publicado ningun analisis de sesgos en la informacion disponible.
- No se incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento desde el checkpoint distribuido.
- La puntuacion de validacion no se volvio a ejecutar durante el empaquetado, segun indica el propio autor.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce las posibilidades de soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanseungwook/Llama-3.2-1B-Compressed-Joint-GSM8K-Aug-NL
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/zen-E/GSM8k-Aug-NL
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/columbia-homies/latent-reasoning/runs/hd10-augnl-20260916T003758Z-lr3e-4
- Licencia incluida en el repositorio: `LICENSE.txt` (Llama 3.2 Community License)
- Politica de uso aceptable: `USE_POLICY.md`
- Atribucion: `NOTICE`
- Manifiesto de arquitectura: `compressed_joint_manifest.json`
- Configuracion de la receta: `run_configuration.json`
- Resultados de validacion por epoca: `validation_results.json`
- Manifiesto de la release con tamanos y hashes: `release_manifest.json`
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relacionados con este modelo; los unicos enlaces pertinentes son los incluidos en la model card y en el propio repositorio de HuggingFace.
