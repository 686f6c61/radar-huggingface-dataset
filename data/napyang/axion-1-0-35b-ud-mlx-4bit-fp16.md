# NapYang/Axion-1.0-35B-UD-MLX-4bit-fp16

## Resumen

Axion-1.0-35B-UD-MLX-4bit-fp16 es una cuantizacion de 4 bits en formato MLX del modelo Axion-1.0-35B, un modelo fundacional de agentes desarrollado por Axion1-0 y publicado bajo licencia Apache-2.0. La cuantizacion la firma NapYang siguiendo la estrategia Unsloth Dynamic (UD) de precision mixta, con escalas y sesgos en FP16 y la torre de vision mantenida en BF16. El checkpoint ocupa 22,2 GB en el repositorio y esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria MLX.

El modelo base es un transformer disperso de mezcla de expertos (MoE) construido sobre la arquitectura Qwen3.5-MoE: 35.951.822.704 parametros totales, 256 expertos con 8 activos por token (unos 3B de parametros activos por token), y una ventana de contexto nativa de 262.144 tokens. Combina capas de atencion lineal con capas de atencion completa en un diseno hibrido, e incluye torre de vision y cabeza de prediccion multi-token (MTP). Esta orientado a razonamiento cientifico, busqueda de informacion y resolucion de problemas con herramientas.

La relevancia de esta ficha es doble: por un lado, Axion 1.0 propone una receta de entrenamiento deliberadamente simple (dos etapas de SFT ligero y una de RL, sin mid-training dedicado ni DPO), lo que lo convierte en un caso de estudio interesante; por otro, esta version cuantizada permite ejecutar un modelo multimodal de 35B con contexto de 256K en un Mac con 32 GB de memoria unificada, algo que en FP16 seria inviable en ese hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion lineal + atencion completa), basado en Qwen3.5-MoE, con torre de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | ~3B por token (256 expertos, 8 activos por token) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Affine 4-bit (grupo 64) en MLP de expertos; affine 8-bit (grupo 64) en embeddings, lm_head, proyecciones de atencion y MLP de experto compartido; BF16 en torre de vision; FP16 en escalas, sesgos y tensores no cuantizados. Media efectiva: 4,787 bits/peso en el backbone y 4,926 bits/peso en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), precision mixta |

## Arquitectura y entrenamiento

El backbone es un MoE disperso de 35,9B parametros con 256 expertos y 8 activos por token, lo que deja unos 3B parametros activos por token y reduce el coste de computo frente a un modelo denso del mismo tamano. La disposicion es hibrida: alterna capas de atencion lineal con capas de atencion completa, lo que permite sostener un contexto nativo de 262.144 tokens con un coste de atencion contenido. Incluye ademas una cabeza de prediccion multi-token (MTP), utilizada en la model card para decodificacion especulativa (Lightning MTP), y una torre de vision de 0,447B parametros que habilita la entrada image-text-to-text.

Segun el paper Axion 1.0 (arXiv:2611.03233), el entrenamiento del modelo base se realiza en solo tres etapas: dos fases ligeras de supervised fine-tuning seguidas de reinforcement learning, sin mid-training dedicado, sin DPO y sin on-policy distillation. El modelo esta disenado explicitamente para razonamiento cientifico, busqueda de informacion y resolucion de problemas aumentada con herramientas. No se dispone de datos sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset en la informacion proporcionada.

La cuantizacion de esta version sigue la estrategia Unsloth Dynamic: los bits se asignan por sensibilidad medida de cada capa. El 91,838% de los pesos logicos (33,018B) queda en affine 4-bit, el 6,833% (2,457B) en affine 8-bit, el 1,242% (0,447B) en BF16 y el 0,087% (0,031B) en FP16. El desglose por componente es: backbone de lenguaje 20,742 GB, torre de vision 0,893 GB y cabeza MTP 0,503 GB.

## Capacidades

- Generacion de texto y razonamiento, con modo de pensamiento (thinking) activable, tal como se usa en la evaluacion de benchmarks.
- Generacion de codigo: 94,0% en HumanEval y 89,0% en MBPP en la evaluacion realizada por el autor de la cuantizacion.
- Razonamiento cientifico y resolucion de problemas con herramientas, que es el objetivo declarado del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision.
- Capacidades agenticas: el modelo esta etiquetado como `agent` y disenado para busqueda de informacion y flujos multi-paso con herramientas.
- Decodificacion especulativa mediante la cabeza MTP (Lightning MTP en la evaluacion reportada).
- Contexto largo: hasta 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno largas.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes de resolucion de problemas con herramientas: el modelo puede encadenar llamadas a funciones, busquedas y calculos en varios pasos, apoyandose en su entrenamiento especifico para tool-augmented problem solving y en sus ~3B parametros activos para mantener latencia baja.
- Asistencia a la investigacion cientifica: analisis de articulos y documentos tecnicos largos aprovechando la ventana de 262.144 tokens, con capacidad de extraer y contrastar informacion de multiples fuentes en una sola pasada.
- Generacion de codigo en local: con 94,0% en HumanEval y 89,0% en MBPP, es viable como asistente de programacion en un Mac, integrandolo en editores o scripts de automatizacion sin depender de la nube.
- Procesamiento de documentos con imagenes: la torre de vision permite extraer informacion de capturas, diagramas o paginas escaneadas combinadas con texto en el mismo prompt.
- Analisis de repositorios y bases de codigo: el contexto de 256K permite cargar varios ficheros y mantener coherencia entre ellos en tareas de revision, refactorizacion o explicacion.
- Despliegue en estaciones de trabajo Apple Silicon: al ocupar 22,2 GB en disco y unos 20,6 GiB en memoria, cabe en un Mac de 32 GB de memoria unificada, lo que habilita prototipos de agentes y asistentes totalmente locales con privacidad de datos.
- Busqueda de informacion aumentada: combinacion de recuperacion documental con el contexto largo para responder preguntas sobre corpus extensos sin fragmentar en exceso.

## Benchmarks y rendimiento

Resultados reportados en la model card de esta cuantizacion, ejecutados en un M2 Max (30 nucleos) con 32 GB, muestreo determinista (seed 42), thinking activado, cache KV affine de 4 bits y Lightning MTP sobre oMLX v0.7.3:

| Benchmark | Resultado | Subconjunto evaluado |
|---|---|---|
| HumanEval | 94,0% (94/100) | 100 de 164 preguntas |
| MBPP | 89,0% (89/100) | 100 de 500 preguntas |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K ni otras evaluaciones, ni comparaciones con modelos similares.

## Requisitos de hardware

- Memoria: el checkpoint completo ocupa 22,138 GB en disco (20,618 GiB) y requiere del orden de 20-21 GiB de memoria unificada solo para los pesos; con cache KV y overhead del runtime conviene disponer de 32 GB o mas.
- Hardware validado: Apple M2 Max (30 nucleos) con 32 GB, el equipo usado para los benchmarks reportados.
- GPU NVIDIA: el formato es MLX, por lo que no es directamente ejecutable en CUDA; para A100, H100 o RTX 4090 habria que usar el checkpoint original en safetensors estandar o una cuantizacion GGUF/AWQ equivalente.
- GPU de consumo: en el ecosistema Apple, cabe en Mac con 32 GB de memoria unificada (M2 Max, M3 Max, M4 Pro/Max y superiores). No aplica a GPUs de consumo NVIDIA en este formato.
- Despliegue: libreria `mlx` y runtime oMLX (v0.7.3 en la evaluacion). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponible; solo se documenta el hardware y la configuracion de la evaluacion, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Axion-1.0-35B-UD-MLX-4bit-fp16 (esta ficha) | 35,952B | ~3B | 262.144 | Apache-2.0 | MLX safetensors 4-bit mixto |
| Axion1-0/Axion-1.0-35B (base) | 35,952B | ~3B | 262.144 | Apache-2.0 | safetensors (precision original) |
| unsloth/Qwen3.6-35B-A3B-UD-MLX-4bit | no disponible en la informacion | ~3B (A3B) | no disponible | no disponible | MLX 4-bit UD |

La comparativa se limita a estos tres porque la informacion proporcionada solo menciona el modelo base y la referencia de cuantizacion de Unsloth. No se dispone de datos de rendimiento del modelo base ni de la cuantizacion de Unsloth para establecer comparaciones numericas.

## Limitaciones y advertencias

- Los benchmarks reportados usan subconjuntos parciales (100 de 164 en HumanEval, 100 de 500 en MBPP) con una sola semilla, por lo que los porcentajes tienen un margen de error notable y no son directamente comparables con evaluaciones completas.
- El modelo solo se ha validado en un unico equipo Apple (M2 Max, 32 GB) y con un runtime concreto (oMLX v0.7.3); el rendimiento en otros Mac o versiones de MLX puede variar.
- Al ser una cuantizacion de 4 bits, cabe esperar cierta degradacion respecto al modelo base en tareas sensibles a la precision, aunque no se aportan mediciones de esa perdida.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; al tratarse de un modelo orientado a agentes con acceso a herramientas, los errores de planificacion o de invocacion pueden propagarse en flujos multi-paso.
- El repositorio no tiene descargas ni likes en el momento de la consulta y la cuantizacion la firma un tercero (NapYang), no el equipo del modelo base; conviene validar el checkpoint antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y no se detallan condiciones adicionales sobre los datos de entrenamiento.
- El formato MLX limita el despliegue a hardware Apple; para infraestructura NVIDIA hay que recurrir a otros checkpoints.

## Enlaces

- Modelo cuantizado: https://huggingface.co/NapYang/Axion-1.0-35B-UD-MLX-4bit-fp16
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Paper Axion 1.0: https://arxiv.org/abs/2611.03233
- Cuantizacion de referencia Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-UD-MLX-4bit
