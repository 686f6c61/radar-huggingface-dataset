# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr es un checkpoint de decodificacion especulativa (drafter) publicado por NVIDIA para acompanar al modelo objetivo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB, un modelo hibrido LatentMoE de vision y lenguaje con 74.000 millones de parametros totales y 9.000 millones activos. No es un modelo de lenguaje autonomo: propone tokens candidatos que el modelo objetivo verifica, y es el objetivo quien produce el texto visible al usuario. Su relevancia es practica: permite acelerar la inferencia del objetivo sin cambiar su distribucion de salida, gracias al algoritmo LiLiCorr descrito en el paper arXiv:2608.20530.

El drafter es una red densa de cinco capas con atencion GQA, atencion bidireccional dentro del bloque de draft, ventana deslizante de 1024 tokens por cabeza con attention sinks y una convolucion dinamica agrupada alrededor de cada subcapa de atencion y MLP. Sobre esa base se anade una cabeza LiLiCorr de dos capas y 37 millones de parametros que correlaciona los 8 candidatos principales del drafter en cada posicion de draft.

El checkpoint esta cuantizado con NVIDIA Model Optimizer en pesos NVFP4 y esta pensado para servirse con vLLM sobre hardware NVIDIA Blackwell (SM 120), incluido DGX Spark (GB10). La licencia OpenMDW-1.1 permite uso comercial y no comercial. El modelo objetivo soporta hasta 256K tokens de contexto y diez idiomas, incluyendo el espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa GQA (5 capas feed-forward densas + atencion GQA, atencion bidireccional en el bloque de draft, ventana deslizante de 1024 tokens por cabeza con attention sinks, convolucion dinamica agrupada; cabeza LiLiCorr de 2 capas) |
| Parametros totales | 673.450.538 segun safetensors del repo; la model card declara 1,113B de parametros del draft (1,076B sin la cabeza LiLiCorr de 37M), excluyendo embeddings y LM head compartidos con el objetivo. Discrepancia no explicada en la informacion disponible |
| Parametros activos | No aplica al draft (red densa). El modelo objetivo es LatentMoE con 9B activos de 74B totales |
| Longitud de contexto | 256K tokens en el modelo objetivo; ventana de atencion del draft de 1024 tokens por cabeza |
| Tipos de cuantizacion | Pesos NVFP4 cuantizados con NVIDIA Model Optimizer (commit b5f10f8); el repo aparece etiquetado tambien como "8-bit", dato ambiguo |
| Idiomas soportados | Ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino (heredados del modelo objetivo) |
| Licencia | OpenMDW-1.1 (etiqueta `license: other` con `license_name: openmdw-1.1`); uso comercial y no comercial permitido segun la model card |
| Formato de pesos | safetensors (libreria Model Optimizer) |

## Arquitectura y entrenamiento

El draft es una red densa de cinco capas feed-forward con atencion de consultas agrupadas (GQA). La atencion dentro del bloque de draft es bidireccional, lo que permite que los candidatos de una misma posicion se condicionen entre si en lugar de generarse estrictamente de izquierda a derecha. Cada una de las cinco capas usa una ventana deslizante de 1024 tokens por cabeza con attention sinks, y cada subcapa de atencion y MLP va rodeada de una convolucion dinamica agrupada. La pieza diferencial es la cabeza LiLiCorr, una red de dos capas y 37 millones de parametros que correlaciona los 8 mejores candidatos del drafter en cada posicion de draft; el paper la describe como una correlacion de verosimilitud ligera sobre borradores paralelos.

El checkpoint deriva del modelo objetivo, y sus representaciones se obtienen de el: la model card indica que LiLiCorr genera borradores usando representaciones del modelo objetivo, y que embeddings y LM head son compartidos (de ahi que no se cuenten en los 1,113B). Sobre los datos de entrenamiento del draft, la informacion disponible solo detalla los del objetivo: Nemotron-Post-Training-Dataset-v2, Nemotron-RL-Super-Training-Blends, Nemotron-Post-Training-v3, Nemotron-Instruction-Following-Chat-v1 y Nemotron-Science-v1. En la sintesis de datos se usaron unicamente prompts y contexto de conversacion, no las respuestas originales, y todas las respuestas de entrenamiento fueron generadas por Nemotron-3.5-Bolt con temperatura 1,0. No se detalla el numero de tokens de entrenamiento del drafter ni si hubo RLHF o DPO especificos para el.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos que el modelo objetivo de 24 GB verifica, acelerando la generacion sin alterar el texto final.
- Correlacion de candidatos: la cabeza LiLiCorr puntua y correlaciona los 8 candidatos principales por posicion, lo que mejora la tasa de aceptacion frente a un draft no correlacionado (el valor concreto de aceptacion no esta publicado).
- Generacion de texto delegada: razonamiento, chat, RAG y flujos de agentes son capacidades del objetivo, no del draft; el draft solo las acelera.
- Salida estructurada: el objetivo soporta formato JSON, trazas de razonamiento con chain-of-thought y tool calling.
- Multilinguismo: el objetivo cubre diez idiomas, incluido el espanol, por lo que el draft acelera tambien generacion en esos idiomas.
- Vision y lenguaje: el objetivo es un modelo LatentMoE de vision y lenguaje, de modo que el pipeline acelerado puede procesar entrada visual.
- Contexto largo: el objetivo admite hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- No soporta: uso autonomo como modelo de chat, generacion sin el objetivo, ni despliegue en GPUs que no sean Blackwell SM 120.

## Casos de uso

- Servicio de razonamiento de baja latencia en DGX Spark: emparejar el draft con el objetivo de 24 GB en un GB10 permite servir un modelo de razonamiento de 74B totales en un equipo compacto, con la decodificacion especulativa reduciendo el coste por token generado.
- Asistentes de codigo en produccion: el objetivo acepta tool calling y salida JSON, y el draft acelera las respuestas en editores y pipelines de CI/CD donde la latencia por sugerencia es critica.
- RAG sobre documentacion extensa: con hasta 256K tokens de contexto en el objetivo, se pueden inyectar manuales o expedientes completos; el draft mantiene la generacion fluida al aumentar la longitud del prompt.
- Agentes multi-paso con llamadas a herramientas: en bucles de razonamiento con varias iteraciones, cada paso implica una generacion completa; la aceleracion del draft se acumula y reduce el tiempo total de la tarea.
- Atencion al cliente multilingue: el objetivo cubre espanol, ingles, frances, aleman, italiano, portugues, japones, coreano, hindi y chino, y el draft acelera las respuestas en cualquiera de ellos.
- Procesamiento de documentos con vision: el objetivo es vision-lenguaje, por lo que el pipeline acelerado sirve para extraer datos de facturas, formularios o capturas manteniendo el formato JSON de salida.
- Despliegue con requisitos de soberania de datos: al ejecutarse en hardware local Blackwell con licencia OpenMDW-1.1, es viable en entornos con restricciones de salida a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de aceptacion de tokens del draft, factor de aceleracion (speedup) frente al objetivo sin decodificacion especulativa, ni resultados de MMLU, HumanEval, GSM8K u otras pruebas para el objetivo o para el drafter.

## Requisitos de hardware

- VRAM del draft: el repo ocupa 1,0 GB; el peso en VRAM no se declara explicitamente en la informacion disponible (los 673M parametros en NVFP4 del repo implican una huella muy inferior a 1 GB, pero es una estimacion, no un dato publicado).
- Modelo objetivo: requiere 24 GB segun el propio nombre del checkpoint y la referencia al "compatible 24GB target"; debe caber junto al draft en el mismo dispositivo.
- GPU compatibles: exclusivamente NVIDIA Blackwell con SM 120, incluido DGX Spark (GB10). No hay soporte declarado para arquitecturas anteriores (Hopper, Ada, Ampere) ni para CPU.
- GPU de consumo: las Blackwell de consumo (misma microarquitectura SM 120) son las unicas candidatas; no se especifican modelos ni capacidades de memoria concretas.
- Motor de despliegue: unicamente vLLM segun la model card. No se mencionan llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles. La model card no publica factor de aceleracion ni tokens por segundo.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr (draft) | 673M segun safetensors / 1,113B segun model card | Depende del objetivo (256K) | No publicado | OpenMDW-1.1 | HuggingFace, vLLM, SM 120 |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB servido sin draft | 74B totales, 9B activos | 256K | No publicado; seria la linea base frente a la que se mide la aceleracion | OpenMDW-1.1 | HuggingFace, vLLM, Blackwell |
| Otros drafters de decodificacion especulativa (EAGLE-3, Medusa, cabezas n-gram) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos publicados de tasa de aceptacion ni de speedup que permitan una comparacion cuantitativa con otros metodos de decodificacion especulativa. La comparacion relevante y verificable es contra el objetivo sin draft, para la cual tampoco hay cifras en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB no genera texto utilizable; no puede desplegarse como chatbot por si solo.
- Dependencia de hardware muy restrictiva: solo NVIDIA Blackwell SM 120, lo que excluye A100, H100 y RTX 30/40 series, y limita el despliegue en infraestructura existente.
- Dependencia de motor: unicamente vLLM; no hay rutas de despliegue alternativas documentadas.
- Discrepancia de parametros: los safetensors suman 673.450.538 parametros mientras la model card declara 1,113B; conviene verificar la cifra real antes de dimensionar el despliegue.
- Ambiguedad de cuantizacion: el repo lleva la etiqueta "8-bit" junto a `modelopt_fp4` (NVFP4), lo que puede inducir a error al planificar memoria.
- Riesgo de alucinacion: heredado del objetivo de 74B; la decodificacion especulativa preserva la distribucion del objetivo, pero no elimina sus errores factuales.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad en la informacion disponible, ni para el draft ni para el objetivo.
- Idiomas: la lista de diez idiomas corresponde al objetivo; no hay evaluacion publicada del rendimiento del draft por idioma, y el espanol no tiene metricas especificas.
- Licencia: OpenMDW-1.1 permite uso comercial, pero es una licencia propia de NVIDIA/Mistral con terminos especificos; conviene revisar el texto completo antes de un despliegue en produccion.
- Reproducibilidad: el checkpoint se cuantizo con un commit concreto de Model Optimizer (b5f10f8); cambios de version pueden alterar el comportamiento numerico.

## Enlaces

- HuggingFace del draft: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Paper LiLiCorr: https://arxiv.org/abs/2608.20530
- Repositorio NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset Nemotron-RL-Super-Training-Blends: https://huggingface.co/datasets/nvidia/Nemotron-RL-Super-Training-Blends
- Coleccion Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Dataset Nemotron-Instruction-Following-Chat-v1: https://huggingface.co/datasets/nvidia/Nemotron-Instruction-Following-Chat-v1
- Dataset Nemotron-Science-v1: https://huggingface.co/datasets/nvidia/Nemotron-Science-v1
