# qwegnai/SenseNova-Loop-9B-hq4g32

## Resumen

SenseNova-Loop-9B-hq4g32 es un empaquetado de pesos cuantizados del modelo multimodal SenseNova-Loop-9B, publicado por el usuario qwegnai para su motor de inferencia propietario Qwegn (v0.27.0+), un runtime escrito en Swift 6.2 sobre Metal 4 orientado exclusivamente a Apple Silicon. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de formato del modelo base de SenseNova a un contenedor propio denominado QWP1, con cuantización de bloques Hadamard HQ4_G32 y un sidecar de atención dispersa latente (SHVQ4). El pack ocupa 7,38 GiB y contiene 9.412.963.952 parámetros distribuidos en 857 tensores.

El modelo base emplea una arquitectura de transformer con bucles (looped transformer): 32 capas físicas que recorren el tramo [4..28] dos veces, dando 56 capas efectivas, combinando 42 capas de Gated-DeltaNet y 14 de atención GQA con 16 cabezas de consulta y 4 de clave-valor. Incorpora además un estado de dos flujos Sinkhorn-20 (mHC) preservado en F32, un tower de visión ViT de 27 capas y un vocabulario de 248.320 tokens. El contexto nativo es de 524.288 tokens con YaRN factor 2.0, ampliable a 1.048.576 tokens.

Su relevancia es acotada pero específica: demuestra que un modelo multimodal de casi 10.000 millones de parámetros puede ejecutarse íntegramente en memoria unificada de un Mac con 128 GB, con velocidades de prefill superiores a 2.000 tok/s y decodificación especulativa de 165,7 tok/s, sin asignaciones en estado estacionario. El interés principal reside en la ingeniería de cuantización y en el runtime, no en el modelo en sí, cuyos pesos provienen del SenseNova-Loop-9B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), 32 capas físicas con bucle [4..28] ×2 = 56 capas efectivas; 42 capas Gated-DeltaNet + 14 capas GQA (16Q/4KV, head_dim 256, partial_rotary_factor 0.25); mHC de 2 flujos Sinkhorn-20; ViT de 27 capas |
| Parametros totales | 9.412.963.952 (857 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 524.288 tokens nativos (YaRN factor 2.0 desde 262.144, rope_theta 10.000.000); cualificado hasta 1.048.576 tokens |
| Tipos de cuantizacion | HQ4_G32 (84,31% de parámetros), BF16 y F32 preservados (15,69%); 6,73 bits por parámetro en disco; sidecar SHVQ4 para atención dispersa latente |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor QWP1 (model.qwp) + sidecar model.qlsa; no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos poco habituales. Por un lado, el bucle de capas: las capas 4 a 28 se ejecutan dos veces (eval_count = 2), de modo que 32 capas físicas producen 56 capas efectivas, lo que incrementa la profundidad computacional sin aumentar el número de parámetros. Por otro, la mezcla de Gated-DeltaNet (un modelo de estado lineal) en 42 capas con atención GQA clásica en 14 capas, complementada con Latent Sparse Attention y un estado mHC de dos flujos con normalización Sinkhorn-20 que se preserva en F32 durante la cuantización para no degradar la estabilidad numérica. El tower de visión es un ViT de 27 capas con 2.304 embeddings posicionales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La model card del pack cuantizado no documenta el proceso de entrenamiento original, solo el proceso de conversión: cuantización Hadamard por bloques de 32 (HQ4_G32) sobre proyecciones de atención, proyecciones GDN, MLP gate/up/down y lm_head (249 tensores), manteniendo en BF16/F32 embeddings, tower de visión, normas 1D y los planos de compuerta/decaimiento de mHC y GDN (608 tensores). El sidecar SHVQ4 aplica una proyección SVD cuantizada para las 14 pasadas de atención con bucle.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): el tower ViT de 27 capas permite entrada multimodal.
- Razonamiento con modo thinking: la evaluación Core-12 reporta 10 de 12 aciertos en tareas de razonamiento con thinking activado.
- Generación de código: 92% en HumanEval (23/25) y 36/50 en el conjunto Code-50.
- Recuperación en contexto largo: 3 de 3 agujas recuperadas tanto a 16K como a 64K tokens, y decodificación funcional hasta 1M tokens.
- Decodificación especulativa sin pesos adicionales mediante n-gramas (`.ngram d=5`), con 5,49 tokens por paso.
- Servicio HTTP concurrente multi-stream (4 flujos simultáneos con 3,02× de escalado).
- Caché de prefijo con reutilización (18 ms en caliente, 46,1× de aceleración).
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo cabe residente al 100% en un Mac de 128 GB con 4,87 GiB de RSS sin visión, lo que permite desplegar un asistente privado sin conexión externa ni coste de API, con decodificación de 58,4 tok/s en modo servidor.
- Análisis de documentos largos: con 524.288 tokens de contexto nativo y recuperación verificada de 3/3 agujas a 64K, es adecuado para resumir o consultar expedientes, contratos o bases de código extensas en una sola pasada.
- Procesamiento de capturas y documentos escaneados: el pipeline image-text-to-text con ViT de 27 capas permite extraer información de imágenes, aunque con 6,58 GiB de RSS al cargar visión en lugar de 4,87 GiB.
- Generación y edición de código en local: el 92% en HumanEval y la decodificación especulativa de 98,07 tok/s en tareas de edición de código lo hacen viable para autocompletado y refactorización dentro de un IDE en Apple Silicon.
- Servicio multiusuario en estación de trabajo: el servidor HTTP admite 4 flujos concurrentes con 152,96 tok/s agregados y 270 ms de peor TTFT, suficiente para un equipo pequeño que comparta un Mac Studio o MacBook Pro de gama alta.
- Procesamiento por lotes de textos largos en chino e inglés: la caché de prefijo de 18 ms permite reutilizar contexto común entre peticiones, útil en pipelines de clasificación o extracción sobre corpus bilingües.
- Investigación sobre cuantización y arquitecturas con bucles: el pack incluye métricas de fidelidad frente al profesor BF16 (0,0236 nats de KLD, 100% de coincidencia top-1), lo que lo convierte en un banco de pruebas para estudiar el impacto de HQ4_G32 en modelos con estado lineal.

## Benchmarks y rendimiento

Resultados medidos en un Apple M5 Max (Mac17,6, CPU de 18 núcleos, GPU Apple10 NAX de 40 núcleos, 128 GB de memoria unificada, 585 GB/s de DRAM) con `--kv-mode q4 --lsa-mode auto --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill CLI 512 / 4K / 16K / 64K | 1.906,3 / 2.044,9 / 1.943,5 / 1.763,2 tok/s |
| Prefill servidor 10,4K | 1.650,3 tok/s |
| TTFT con caché de prefijo (frío / caliente / cacheado) | 108 ms / 830 ms / 18 ms (46,1×) |
| Decodificación mono-flujo (servidor / CLI @512 / edición de código) | 58,4 / 72,25 / 98,07 tok/s |
| Decodificación especulativa `.ngram d=5` | 165,7 tok/s (5,49 tok/paso) |
| 4 flujos HTTP concurrentes | 152,96 tok/s agregados (3,02× vs 50,72 serial) |
| Fidelidad vs profesor BF16 | 0,0236 nats KLD, 100,0% top-1, 98,89% de fidelidad |
| Conformidad API llmprobe | 211/211 (100%) |
| HumanEval | 23/25 (92%); Code-50: 36/50 |
| Core-12 thinking | 10/12 |
| Capacidad global (llmprobe) | 80,6% |
| Agentic | 6/8 |
| Recuperación 3 agujas @16K / @64K | 3/3 (75,74 tok/s, 8,16 GiB) / 3/3 (71,45 tok/s, 8,15 GiB) |
| Decodificación @524K / @1M | 49,29 tok/s (14,27 GiB) / 49,35 tok/s (22,42 GiB) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible; todas las cifras anteriores son del propio autor del pack y miden el rendimiento del runtime Qwegn, no del modelo base en otros frameworks.

## Requisitos de hardware

- VRAM/memoria unificada: 5,05 GiB de modelo residente más estado GDN de 50,25 MiB; el working set planificado va de 5,13 GiB (4K, KV q4) a 7,10 GiB (64K, KV f16). El RSS real del servidor es de 4,869 GiB sin visión y 6,584 GiB con visión.
- GPU compatibles: exclusivamente Apple Silicon con Metal 4 (el autor midió en un M5 Max). No hay soporte para NVIDIA, AMD ni CPU x86.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada suficiente; el pack completo de 7,38 GiB más el working set requiere al menos 16 GB de memoria unificada, y el autor valida 128 GB para el 100% residente.
- Opciones de despliegue: únicamente el motor Qwegn v0.27.0 o superior (`qwg serve`, CLI `qwg`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX, porque el contenedor QWP1 es propietario.
- Latencia y throughput: prefill de 2.044,9 tok/s a 4K, decodificación de 58,4 tok/s mono-flujo en servidor, 165,7 tok/s con especulación n-gram y 152,96 tok/s agregados con 4 flujos concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-hq4g32 (este pack) | 9,41 B | 524K (1M cualificado) | Apache 2.0 | QWP1, solo Qwegn en Apple Silicon | Hugging Face, 0 descargas |
| sensenova/SenseNova-Loop-9B (base) | 9,41 B | no disponible en esta ficha | Apache 2.0 | safetensors (presumiblemente) | Hugging Face, modelo upstream |
| Alternativas de ~9B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base en otros runtimes ni de comparaciones con modelos de tamaño similar, por lo que no es posible establecer una comparativa de rendimiento rigurosa. La comparación relevante es de formato y portabilidad: este pack solo es utilizable en Qwegn sobre Apple Silicon, mientras que el modelo base es la referencia para cualquier otro framework.

## Limitaciones y advertencias

- Dependencia total del runtime Qwegn v0.27.0+: el contenedor QWP1 no se carga en safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama, lo que limita el despliegue a Apple Silicon y a un único motor mantenido por un solo autor.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero el formato propietario puede condicionar la portabilidad y la auditoría del proceso de cuantización.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas, con el riesgo de degradación en prompts en español.
- Riesgo de alucinación inherente a un modelo de 9B sin datos publicados de entrenamiento ni de alineación; la model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Las cifras de rendimiento proceden exclusivamente del autor del pack, medidas en un único equipo (M5 Max de 128 GB) y con el runtime en versión concreta; no hay replicación independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.
- El modo visión incrementa el RSS de 4,87 a 6,58 GiB; en máquinas con menos de 16 GB de memoria unificada el despliegue con contexto largo puede no ser viable.
- La decodificación especulativa n-gram depende de la predictibilidad del texto; en dominios creativos o de baja repetición la ganancia de 165,7 tok/s puede no mantenerse.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes que dependan de llamadas a herramientas.

## Enlaces

- Pack cuantizado en Hugging Face: https://huggingface.co/qwegnai/SenseNova-Loop-9B-hq4g32
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Repositorio del modelo base con revisión fijada: commit 329a65f701ba8c48b73c30d0cbaa6f0449733673
