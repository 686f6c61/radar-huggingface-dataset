# mattbucci/Qwopus3.8-27B-Coder-Flash-AWQ

## Resumen

Qwopus3.8-27B-Coder-Flash-AWQ es una cuantizacion INT4 de tipo AWQ-Marlin (W4A16, group size 128) del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un ajuste fino supervisado (SFT) orientado a codigo y uso agentico sobre Qwen3.8-27B. Lo publica el usuario mattbucci, que mantiene una receta de cuantizacion y un stack de servicio propio (SGLang v0.5.22 con parches sobre 2x RTX 3090 en TP=2). El modelo empaqueta 27.356.728.560 parametros y ocupa 18,7 GB en el repositorio, lo que permite servirlo con contexto completo de 262K tokens en hardware consumer de gama alta.

La relevancia practica esta en que traslada un modelo multimodal (vision y video) con ventana de 262K tokens a un formato de 4 bits servible en GPUs de 24 GB, manteniendo en BF16 el `lm_head`, la torre de vision, las capas MTP y los escalares de compuerta de DeltaNet (`in_proj_a` / `in_proj_b`). Es decir, la cuantizacion se aplica de forma selectiva y deja intactos los componentes mas sensibles a la precision.

El autor publica ademas un conjunto de verificaciones sobre su propio stack: capacidades 5/5 (basicas, tool calling, thinking, imagen, video), needle 6/6 a 131K y 250K tokens reales, sonda de razonamiento al 100 % a 131K y 256K, MMLU-57 con 50/57 y HumanEval 30/30, junto con una auditoria de escalas sobre 400 tensores sin incidencias. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas Gated-DeltaNet + 16 capas de atencion completa (clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262K tokens (256K operativos; verificado a 131K y 250K en needle) |
| Tipos de cuantizacion | INT4 AWQ-Marlin, W4A16, group size 128; `lm_head`, torre de vision, capas MTP y escalares `in_proj_a`/`in_proj_b` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors convertido a AWQ nativo) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer hibrido que combina 48 capas con atencion lineal Gated-DeltaNet y 16 capas de atencion completa, lo que reduce el coste de atencion en contextos largos manteniendo capacidad de recuperacion exacta en las capas full-attention. Sobre esa base, Jackrong aplico un SFT orientado a codigo y flujos agenticos, y conserva la torre de vision y el procesamiento de video del modelo original, ademas de capas MTP (multi-token prediction).

La cuantizacion la realiza mattbucci partiendo del BF16 con GPTQ como paso de calibracion, sobre una mezcla de instrucciones de thinking, imagen y video (256 muestras de 1024 tokens; AM-Thinking-v1, LLaVA-Instruct, LLaVA-Video-178K, NuminaMath-CoT y UltraChat). El resultado se exporta mediante compressed-tensors y se convierte a AWQ nativo. La decision de mantener en BF16 el `lm_head`, la torre de vision, las capas MTP y los escalares de compuerta de DeltaNet es una innovacion tecnica relevante: preserva la precision en los puntos donde el error de cuantizacion degrada mas la calidad (proyeccion de vocabulario, percepcion visual y control de la compuerta lineal).

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito.
- Generacion y edicion de codigo, con enfasis en tareas de programacion (el SFT del modelo base es coder).
- Uso agentico: tool calling / function calling y razonamiento multi-paso.
- Vision: comprension de imagenes (entrada multimodal).
- Video: procesamiento de entrada de video.
- Contexto largo: recuperacion verificada hasta 250K tokens reales y sonda de razonamiento al 100 % a 256K.
- Prediccion multi-token (capas MTP conservadas en BF16), aprovechable para decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en IDE o CLI: el modelo puede mantener conversaciones largas sobre un repositorio completo gracias a sus 262K tokens de contexto, y el modo thinking permite razonar sobre refactorizaciones complejas antes de emitir el parche.
- Agente de automatizacion de PRs: con tool calling puede invocar herramientas de git, ejecutar tests y encadenar pasos multi-turno; su naturaleza agentica encaja en pipelines de CI/CD donde el agente propone cambios y valida resultados.
- Revision de codigo con capturas: al aceptar imagenes, puede analizar diagramas de arquitectura, mockups o capturas de errores junto al codigo fuente en la misma conversacion.
- Analisis de documentacion tecnica extensa: con 256K de contexto operativo puede ingerir manuales, RFCs o especificaciones completas y responder preguntas con recuperacion verificada (needle 6/6 a 250K).
- Procesamiento de video para soporte tecnico: la entrada de video permite analizar grabaciones de sesiones, demos de producto o reproducciones de bugs y extraer instrucciones o diagnosticos.
- Despliegue en laboratorio con hardware consumer: al ocupar 18,7 GB en INT4, se puede servir en 2x RTX 3090 con TP=2 y contexto completo usando la receta SGLang publicada, lo que habilita prototipos de agentes con contexto largo sin presupuesto de centro de datos.
- Generacion asistida de tests y documentacion: el modelo puede recorrer modulos completos dentro de la ventana y producir suites de pruebas o docstrings coherentes con el resto del codigo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre su stack (SGLang v0.5.22 + parches, 2x RTX 3090, TP=2). No son comparaciones contra otros modelos, sino verificaciones de calidad del build cuantizado:

| Prueba | Resultado |
|---|---|
| Capacidades (basicas, tool call, thinking, imagen, video) | 5/5 |
| Needle a 131K tokens reales | 6/6 |
| Needle a 250K tokens reales | 6/6 |
| Sonda de razonamiento a 131K | 100 % |
| Sonda de razonamiento a 256K | 100 % |
| MMLU-57 | 50/57 |
| HumanEval | 30/30 |
| Auditoria de escalas | 400 tensores, 0 marcados |

No se han publicado resultados comparativos con otros modelos (GSM8K, MMLU completo, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,7 GB de pesos en INT4, mas overhead de KV cache; con contexto de 262K el KV cache crece de forma significativa y conviene reservar VRAM adicional.
- Configuracion de referencia del autor: 2x RTX 3090 (24 GB cada una) con tensor parallelism TP=2 y contexto completo de 262K.
- Cabe en GPU consumer: si, en 2x RTX 3090; en una unica GPU de 24 GB el peso entra pero el contexto completo de 262K no es viable sin offload o reduccion de ventana.
- GPU recomendadas: RTX 3090 (x2) segun la receta; para contextos largos con margen, A100 80 GB o H100.
- Opciones de despliegue: SGLang v0.5.22 con la serie de parches del repositorio del autor (`scripts/launch.sh qwopus38`). El formato AWQ-Marlin es compatible con otros servidores que soporten W4A16, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-AWQ (este) | 27,36B | 262K | INT4 AWQ-Marlin W4A16 | Apache 2.0 | Vision + video, MTP, receta SGLang para 2x 3090 |
| Jackrong/Qwopus3.8-27B-Coder-Flash | no disponible | 262K (heredado del base) | BF16 | Apache 2.0 | Modelo base sin cuantizar; mayor VRAM |
| mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit | 27,36B (heredado) | 262K (heredado) | 4-bit MLX | Apache 2.0 | Variante para Apple Silicon via mlx-vlm |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo cuantizado: la perdida de precision frente al BF16 es inevitable, aunque el autor reporta verificaciones limpias; conviene validar en el dominio propio antes de produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base y su dataset de SFT.
- Riesgo de alucinacion: presente como en cualquier LLM; el modo thinking no elimina el riesgo en tareas de codigo o agenticas.
- Idiomas soportados: no documentados; el SFT esta orientado a codigo y no se garantiza calidad multilingue.
- Requisitos de contexto: el rendimiento a 262K depende del stack de servicio; el autor valida sobre SGLang con parches, no sobre otros servidores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datasets de calibracion.
- Madurez: el repositorio tiene 33 descargas y 0 likes en el momento de la consulta; es un build reciente (noviembre de 2026) sin validacion comunitaria amplia.
- El despliegue de referencia exige tensor parallelism en 2 GPUs y una version concreta de SGLang con parches, lo que anade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattbucci/Qwopus3.8-27B-Coder-Flash-AWQ
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Variante MLX 4-bit: https://huggingface.co/mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit
- Repositorio de receta y stack de servicio: https://github.com/mattbucci/2x-3090-GA102-300-A1-sglang-inference
- Script de cuantizacion: `scripts/quantize/quantize_qwopus38_27b_coder_flash.py` (dentro del repositorio anterior)
- Script de lanzamiento: `scripts/launch.sh qwopus38` (dentro del repositorio anterior)
