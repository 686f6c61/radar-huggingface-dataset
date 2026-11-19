# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr es un checkpoint de decodificacion especulativa publicado por NVIDIA para el modelo objetivo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB, un modelo vision-lenguaje de arquitectura LatentMoE con 74B parametros totales y 9B activos. No es un modelo autonomo: es un drafter (borrador) que propone candidatos de tokens que el modelo objetivo verifica. El texto visible para el usuario lo produce siempre el objetivo, nunca el drafter.

El drafter emplea una arquitectura densa de cinco capas con atencion GQA, ventana deslizante de 1024 tokens por cabeza con attention sinks, convolucion dinamica agrupada alrededor de cada subcapa y una cabeza LiLiCorr de dos capas que correlaciona los ocho candidatos principales en cada posicion de borrador. El checkpoint esta cuantizado con NVIDIA Model Optimizer (NVFP4) y suma 1.113B parametros de borrador, de los cuales 37M corresponden a la cabeza LiLiCorr.

Su relevancia es practica: acelera la generacion del objetivo mediante decodificacion especulativa manteniendo el mismo resultado verificado, y esta disenado para ejecutarse exclusivamente sobre hardware NVIDIA Blackwell (SM 120), incluido DGX Spark (GB10), con vLLM como unico motor soportado. La licencia OpenMDW-1.1 permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa GQA (MLP denso + atencion GQA), 5 capas, con cabeza LiLiCorr de 2 capas |
| Parametros totales | 1.113B en el drafter (excluyendo embeddings compartidos del objetivo y LM head); modelo objetivo: 74B |
| Parametros activos | 9B en el modelo objetivo (LatentMoE); el drafter es denso |
| Longitud de contexto | Hasta 256K tokens en el objetivo; ventana deslizante de 1024 tokens por cabeza en el drafter |
| Tipos de cuantizacion | NVFP4 (pesos) via NVIDIA Model Optimizer @ b5f10f8; tag de 8-bit en el repositorio |
| Idiomas soportados | Ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino (heredados del objetivo) |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors (libreria Model Optimizer) |

## Arquitectura y entrenamiento

El drafter consta de cinco capas densas de feed-forward con atencion de consultas agrupadas (GQA). La atencion del bloque de borrador es bidireccional, emplea una ventana deslizante de 1024 tokens por cabeza con attention sinks y aplica una convolucion dinamica agrupada en torno a cada subcapa de atencion y MLP. Sobre esta base se anade una cabeza LiLiCorr independiente de dos capas que correlaciona los ocho candidatos principales del drafter en cada posicion, segun el articulo "LiLiCorr: Lightweight Likelihood Correlation of Parallel Drafts for Speculative Decoding" (arXiv:2608.20530). El drafter consume representaciones internas del modelo objetivo en lugar de mantener embeddings y LM head propios.

Los datos de entrenamiento del objetivo se documentan en su model card e incluyen Nemotron-Post-Training-Dataset-v2, Nemotron-RL-Super-Training-Blends, Nemotron-Post-Training-v3, Nemotron-Instruction-Following-Chat-v1 y Nemotron-Science-v1; de estos conjuntos solo se usaron prompts y contexto de conversacion para sintesis de datos, y cada respuesta de entrenamiento fue generada por Nemotron-3.5-Bolt a temperatura 1.0. La informacion proporcionada no detalla el volumen de tokens ni la composicion exacta del entrenamiento del drafter, ni si hubo RLHF o DPO especificos para el.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos que el objetivo de 24GB verifica, acelerando la generacion sin alterar la salida final verificada.
- Generacion de texto delegada: el objetivo soporta razonamiento, chat, generacion aumentada por recuperacion (RAG), comprension visual y flujos de agentes.
- Salida estructurada: el objetivo admite formato JSON y trazas de razonamiento con cadena de pensamiento.
- Tool calling y function calling en el objetivo.
- Flujos de agente y razonamiento multi-paso en el objetivo.
- Capacidades multilingues en diez idiomas: ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino.
- Vision: el objetivo es un modelo vision-lenguaje; el drafter trabaja sobre representaciones del objetivo.
- Contexto largo: hasta 256K tokens en el objetivo.

## Casos de uso

- Servicio de chat de baja latencia: emparejar el drafter con el objetivo en vLLM para reducir el tiempo por token en conversaciones multi-turno, manteniendo la verificacion del objetivo y, por tanto, la calidad de la respuesta.
- Razonamiento con cadena de pensamiento en produccion: las trazas de razonamiento son largas y secuenciales, un escenario donde la decodificacion especulativa aporta ganancias de throughput sostenidas gracias al contexto de 256K tokens del objetivo.
- RAG sobre documentacion extensa: el objetivo maneja contextos de hasta 256K tokens, y el drafter acelera la generacion de respuestas fundamentadas sin cambiar el contenido verificado.
- Agentes con tool calling: en bucles de agente con multiples llamadas a herramientas y pasos intermedios, la aceleracion por token reduce la latencia acumulada de la sesion.
- Comprension visual asistida: al ser el objetivo un modelo vision-lenguaje, el par drafter-objetivo sirve para describir imagenes y responder preguntas visuales con menor latencia de generacion.
- Despliegue en estaciones DGX Spark (GB10): el objetivo cuantizado a 24GB y el drafter de 1.113B encajan en el hardware Blackwell SM 120 para el que estan optimizados, habilitando inferencia local acelerada.
- Atencion al cliente multilingue: el objetivo cubre diez idiomas, y el drafter acelera las respuestas en esos mismos idiomas sin anadir un modelo adicional de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el objetivo cuantizado ocupa 24GB (segun el nombre del checkpoint); el drafter suma 1.113B parametros en NVFP4 y un repositorio de 1.0 GB.
- GPU recomendadas: exclusivamente NVIDIA Blackwell con SM 120, incluido DGX Spark (GB10). No se declara compatibilidad con arquitecturas anteriores (A100, H100, RTX 4090) ni con GPU de consumo de generaciones previas.
- Cabe en GPU de consumo: no disponible; la unica microarquitectura soportada es Blackwell SM 120.
- Opciones de despliegue: vLLM es el unico motor declarado. No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Hardware |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | 1.113B (drafter); objetivo 74B/9B activos | 256K (objetivo) | Decodificacion especulativa para el objetivo Nemotron-3.5-Bolt | OpenMDW-1.1 | Blackwell SM 120, vLLM |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB | 74B totales / 9B activos | 256K | Modelo vision-lenguaje LatentMoE (objetivo) | OpenMDW-1.1 | No disponible en la informacion |
| Drafters especulativos de otros fabricantes | no disponible | no disponible | Decodificacion especulativa | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto por si mismo; requiere el objetivo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB para verificar y producir la salida.
- Compatibilidad de hardware muy restringida: solo NVIDIA Blackwell SM 120 (incluido DGX Spark GB10); no funciona en A100, H100 ni en GPU de consumo anteriores.
- Unico motor soportado: vLLM; no hay soporte declarado para llama.cpp, Ollama o TGI.
- Cuantizacion NVFP4: puede introducir diferencias numericas respecto a los pesos en precision completa del drafter, aunque la verificacion del objetivo acota el impacto en la salida final.
- Sesgos y alucinaciones: no se documentan sesgos especificos en la informacion disponible; el riesgo de alucinacion del sistema recae en el modelo objetivo y debe evaluarse en su model card.
- Idiomas: el drafter hereda la cobertura del objetivo (diez idiomas); no se detalla el rendimiento del drafter por idioma.
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial y no comercial, pero conviene revisar los terminos completos antes de desplegar en produccion.
- Entrenamiento: la informacion no detalla el volumen de tokens ni la composicion del dataset del drafter, lo que limita la evaluacion de su robustez fuera de los dominios del objetivo.
- Fecha de publicacion: el checkpoint se publico el 15/10/2026 en Hugging Face, con ultima actualizacion del repositorio el 19/10/2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Articulo LiLiCorr: https://arxiv.org/abs/2608.20530
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset Nemotron-RL-Super-Training-Blends: https://huggingface.co/datasets/nvidia/Nemotron-RL-Super-Training-Blends
- Coleccion Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Dataset Nemotron-Instruction-Following-Chat-v1: https://huggingface.co/datasets/nvidia/Nemotron-Instruction-Following-Chat-v1
- Dataset Nemotron-Science-v1: https://huggingface.co/datasets/nvidia/Nemotron-Science-v1
