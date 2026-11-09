# Polly1231/ParaThinker-Qwen3-VL-8B-Instruct-SFT-Qwen3VLPlus-lr4e-5-gbs64-ep1-step153

## Resumen

ParaThinker-Qwen3-VL-8B-Instruct-SFT-Qwen3VLPlus-lr4e-5-gbs64-ep1-step153 es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario Polly1231 dentro del proyecto ParaThinker. El modelo parte de la arquitectura multimodal Qwen3-VL y se ha entrenado con datos de destilacion de profesor (teacher data) procedentes de Qwen3VL-Plus Full-CG, orientados a comprension de video y razonamiento multironda. Se trata de un checkpoint de investigacion, no de un modelo listo para produccion.

El entrenamiento se realizo con entropia cruzada uniforme (uniform CE), tasa de aprendizaje 4e-5, batch global de 64 y una epoca completa (153 actualizaciones del optimizador) sobre 8 GPU H100 de 80 GB con FSDP1 full_shard. La supervision cubre 6.480.804 tokens e incluye tanto el LLM como el merger visual principal. Los pesos nativos se conservan en FP32 original, sin cuantizacion ni conversion.

Es relevante ahora porque documenta un flujo completo de SFT multimodal reproducible (con auditoria de integridad SHA-256, estados de optimizador y FSDP, y registros de experimento), y porque aporta un resultado de evaluacion en LVBench bajo un protocolo multironda especifico del proyecto. Su unico punto de referencia publico de rendimiento es ese resultado parcial, y su disponibilidad practica esta limitada por el tamano del repositorio y por el acceso privado al archivo de experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal image-text-to-text, con merger visual) |
| Parametros totales | 1.095.890.462 (segun safetensors del repo; el nombre del modelo indica 8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint nativo en FP32, sin cuantizacion aplicada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (8 shards), mas processor/tokenizer |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL del modelo base Qwen/Qwen3-VL-8B-Instruct (revision 0c351dd01ed87e9c1b53cbc748cba10e6187ff3b). La clase de carga indicada es Qwen3VLForConditionalGeneration, con un processor multimodal AutoProcessor. El ajuste fino supervisa el LLM y el merger visual principal, lo que sugiere que el entrenamiento afecta tanto al decodificador de lenguaje como a la proyeccion de caracteristicas visuales hacia el espacio del LLM.

Los datos de profesor provienen de Qwen3VL-Plus Full-CG corregido, con 9.786 llamadas sobre 3.829 preguntas. El entrenamiento uso entropia cruzada uniforme, LR 4e-5, batch global 64, microbatch 2 por GPU, una epoca y 153 actualizaciones del optimizador, sobre 8 H100 80GB con FSDP1 full_shard. La auditoria de entrenamiento consta como passed=true. No se mencionan tecnicas como RLHF, DPO, decodificacion especulativa ni attention linear en la informacion disponible.

## Capacidades

- Generacion de texto e image-text-to-text: el pipeline declarado es image-text-to-text.
- Comprension de video: el tag video-understanding y el protocolo de evaluacion multironda en LVBench apuntan a esta capacidad.
- Razonamiento multironda sobre video: la evaluacion se realizo bajo el protocolo multironda original de ParaThinker.
- Conversacional: tag conversational.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada; el protocolo de evaluacion es multironda, pero no se documenta como capacidad de agente.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Investigacion en comprension de video: el modelo sirve como checkpoint de referencia para reproducir y comparar el protocolo multironda de ParaThinker en tareas como LVBench, ya que conserva estados de entrenamiento y registros de auditoria.
- Estudio de destilacion de profesor multimodal: permite analizar como datos de Qwen3VL-Plus Full-CG (9.786 llamadas sobre 3.829 preguntas) influyen en el ajuste de un Qwen3-VL-8B-Instruct mediante SFT con CE uniforme.
- Analisis de sensibilidad a hiperparametros: al ser un checkpoint con LR 4e-5, batch global 64 y una epoca, sirve de punto de comparacion frente a otras variantes del mismo experimento.
- Reproduccion de pipelines de entrenamiento multimodal: la configuracion FSDP1 full_shard sobre 8 H100 y los ficheros de estado permiten reconstruir el entorno de entrenamiento (Torch 2.11+cu130, Transformers 5.12.1, ms-swift 4.4.0, Accelerate 1.13.0).
- Auditoria de integridad de checkpoints: los ficheros NATIVE_FILES_SHA256.json y COMPLETE.json permiten verificar la integridad de los 30 ficheros originales (135.996.781.789 bytes) en procesos de validacion.
- Experimentacion academica con Qwen3-VL: como finetune del modelo base, puede usarse para estudiar el efecto del SFT en tareas image-text-to-text en entornos de laboratorio con GPU de 80 GB.

## Benchmarks y rendimiento

| Benchmark | Protocolo | Resultado |
|---|---|---|
| LVBench | Multironda original de ParaThinker | 1.549 preguntas completadas; 385 correctas; 24,8547% de precision; 538 fallos de protocolo contados como incorrectos |
| LongVideoBench | Multironda original de ParaThinker | Sin resultado final auditado registrado |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El resultado de LVBench corresponde a un protocolo multironda y no a una puntuacion VQA one-shot directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint nativo esta en FP32 y el ejemplo de carga usa bfloat16 con device_map="auto".
- GPU recomendadas: el entrenamiento se realizo con 8 H100 de 80 GB; para inferencia no se especifican GPU concretas.
- GPU de consumo: no disponible; no se confirma que quepa en GPU consumer en ninguna configuracion.
- Opciones de despliegue: transformers (AutoProcessor + Qwen3VLForConditionalGeneration). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 136,0 GB e incluye estados de optimizador y FSDP; la carga de pesos de inferencia no requiere los ficheros del optimizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParaThinker-Qwen3-VL-8B-Instruct-SFT-Qwen3VLPlus-lr4e-5-gbs64-ep1-step153 | 1.095.890.462 (safetensors); nombre indica 8B | no disponible | LVBench multironda 24,8547% | apache-2.0 | Hugging Face, repo de 136 GB |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3VL-Plus Full-CG (profesor de datos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigacion (step153 de un unico experimento), no un modelo validado para produccion.
- El unico resultado de evaluacion registrado es LVBench bajo protocolo multironda, con 538 fallos de protocolo contados como incorrectos; no equivale a una puntuacion VQA one-shot.
- LongVideoBench no tiene resultado final auditado registrado.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas de contexto largo.
- El repositorio incluye estados de optimizador y FSDP y ocupa 136 GB; su descarga completa es costosa y solo los pesos de inferencia son necesarios para cargar el modelo.
- El archivo de experimento (codigo congelado, configuracion de runtime, logs, manifiestos y evidencia por pregunta) esta en un repositorio privado cuyo acceso se gestiona por separado; la reproducibilidad completa no es publica.
- La licencia apache-2.0 permite uso comercial, pero las condiciones del modelo base Qwen3-VL-8B-Instruct deben verificarse de forma independiente antes de su uso en produccion.
- No se incluyen checkpoints intermedios, archivo de datos de profesor, imagenes ni videos originales, lo que limita la auditoria externa del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polly1231/ParaThinker-Qwen3-VL-8B-Instruct-SFT-Qwen3VLPlus-lr4e-5-gbs64-ep1-step153
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Archivo de experimento (acceso privado gestionado aparte): https://github.com/JiamingChen1234/ParaThinker/tree/main/experiments/20261109-standard-sft-lr4e5-ck153
- Repositorio del proyecto ParaThinker: https://github.com/JiamingChen1234/ParaThinker
