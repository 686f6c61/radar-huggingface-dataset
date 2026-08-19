# OsaurusAI/Ornith-1.5-35B-A3B-JANG_4M

## Resumen

Ornith-1.5-35B-A3B-JANG_4M es un bundle MLX cuantizado del modelo Ornith-1.5-35B-A3B, desarrollado por OsaurusAI en colaboracion con Ornith AI. Se trata de un modelo multimodal (texto, imagen y video) de arquitectura MoE hibrida que combina atencion lineal gated-delta con atencion full attention en proporcion 3:1, orientado a tareas de razonamiento, codificacion agente y comprension visual. El nombre 35B-A3B indica 35.000 millones de parametros totales con 3.000 millones activos por token; el bundle MLX cuantizado almacena 5.999.262.192 parametros en safetensors. Con una ventana de contexto de 262.144 tokens y soporte nativo de video, destaca por su rendimiento en benchmarks de ingenieria de software como SWE-bench Verified (79) y Terminal-Bench 2.1 (67,8).

La cuantizacion JANG, desarrollada por Jinho Jang, emplea tres metodos de calibracion (asignacion de bits por traza de Hessiana, imatrix refit y AWQ) para minimizar la perdida de precision, logrando una velocidad de decodificacion de 48,3 tokens por segundo en un Apple M5 Max. El bundle conserva la cabeza MTP (multi-token prediction) para decodificacion especulativa y viene con dos presets de muestreo (general y coding) precargados en su configuracion. El razonamiento (thinking mode) esta activado por defecto y es conmutable, aunque sin niveles de esfuerzo configurables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe / Qwen3_5MoeForConditionalGeneration (hibrida: atencion lineal gated-delta + full attention, proporcion 3:1) |
| Parametros totales | 35B (nominal); 5.999.262.192 en safetensors del bundle MLX |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | JANG 4-bit (distribucion: 1090 tensores a 4-bit, 44 a 5-bit, 240 a 8-bit; 27 tensores de vision en fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura MoE hibrida con 40 capas, hidden size de 2048 y 256 expertos enrutados. El backbone combina atencion lineal gated-delta con atencion full attention en proporcion 3:1, lo que reduce el coste computacional frente a una atencion completa pura manteniendo la capacidad de capturar dependencias de largo alcance. Incluye una torre de vision de 27 capas con soporte nativo de video, verificada de extremo a extremo en este bundle. El modelo conserva la cabeza MTP (multi-token prediction) con 2341 tensores `mtp.*`, recomendada para decodificacion especulativa con un draft por paso en Apple Silicon.

La cuantizacion JANG se realizo con una unica pasada de captura que calcula el segundo momento por canal de entrada `E[x_c^2]`, utilizado simultaneamente como diagonal de la Hessiana, ponderacion imatrix y estadistica de canales salientes para AWQ. La asignacion de bits se hace por traza de Hessiana medida por modulo (no por nombre de tensor), lo que en este modelo otorga mayor prioridad a la torre de vision que a los MLP de texto. El refit imatrix produce un error relativo medio ponderado de 0,0735, y la escala AWQ (alpha=0,25) se absorbe en las RMSNorm de 80 grupos de normalizacion y 390 proyecciones. Los tensores cuyo `in_features` no es divisible por ningun grupo de MLX (los 27 `linear_fc2` de vision con 4304) permanecen en fp16.

## Capacidades

- Generacion de texto y razonamiento multi-step con thinking mode activado por defecto; el prompt por defecto sin kwargs es identico a `enable_thinking=True` y termina con la apertura del bloque de pensamiento.
- Comprension de imagenes (image-text-to-text) con 333 tensores de torre de vision y `preprocessor_config.json` + `processor_config.json` incluidos en el bundle.
- Soporte nativo de video con `video_preprocessor_config.json` verificado de extremo a extremo.
- Codificacion agente: disenado para tareas de ingenieria de software, con parser de herramientas `qwen3_coder` y soporte de tool calling.
- Decodificacion especulativa mediante cabeza MTP conservada (2341 tensores), con recomendacion de un draft por paso en Apple Silicon.
- Dos presets de muestreo precargados: general (temp 1,0, top_p 0,95, top_k 20, presence 1,5) y coding (temp 0,6, top_p 0,95, top_k 20, presence 0,0), siendo coding el predeterminado en `generation_config.json`.
- No soporta audio: los tokens `<|audio_start|>`, `<|audio_end|>` y `<|audio_pad|>` son vestigiales; el modelo no tiene `audio_config` ni pesos de torre de audio.

## Casos de uso

- Ingenieria de software agente: con SWE-bench Verified de 79 y Terminal-Bench 2.1 de 67,8, el modelo puede resolver incidencias reales de repositorios, navegar por arboles de archivos, editar codigo y ejecutar comandos de terminal de forma autonoma en pipelines de CI/CD.
- Asistente de programacion local en Apple Silicon: gracias al bundle MLX y a los 48,3 tokens por segundo en M5 Max, puede integrarse como backend de autocompletado o chat de codigo en editores sin necesidad de GPU NVIDIA ni conexion a la nube.
- Analisis de imagenes y documentos visuales: la torre de vision de 27 capas permite extraer informacion de capturas, diagramas, graficos y documentos escaneados, combinando comprension visual con razonamiento textual en un unico modelo.
- Analisis de video: el soporte nativo de video permite procesar secuencias visuales para tareas de descripcion, resumen o deteccion de eventos, algo poco habitual en modelos de este tamano.
- Agentes conversacionales con tool calling: el parser `qwen3_coder` y el soporte de function calling permiten construir agentes que consultan APIs, bases de datos o servicios externos en conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento complejo con contexto largo: la ventana de 262.144 tokens y el modo thinking habilitado por defecto lo hacen adecuado para tareas de analisis de documentos extensos, investigacion o sintesis de informacion donde se requiere mantener coherencia a lo largo de decenas de miles de tokens.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del bundle y del sitio oficial de Ornith AI:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67,8 |
| Velocidad de decodificacion (M5 Max) | 48,3 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este modelo concreto. El sitio oficial de Ornith AI indica que la familia Ornith-1.5 alcanza rendimiento de ultima generacion entre modelos open source de tamano comparable, pero no se desglosan cifras por benchmark en los materiales consultados.

## Requisitos de hardware

- Tamano en disco: 20,01 GiB (repo de 21,5 GB), por lo que se estima un consumo de VRAM de aproximadamente 20 GB para inferencia completa en memoria unificada.
- Disenado para Apple Silicon: es un bundle MLX, por lo que se ejecuta de forma nativa en chips M-series. La velocidad medida de 48,3 tok/s corresponde a un Apple M5 Max.
- No es adecuado para GPUs NVIDIA o AMD sin conversion previa: al ser formato MLX, requiere convertir los pesos a otro formato (por ejemplo, Transformers o GGUF) para ejecutarse fuera del ecosistema Apple.
- Despliegue recomendado: framework MLX con `mlx-lm` para generacion y carga del bundle; la cabeza MTP puede usarse con `vmlx_mtp_tuning.json` para decodificacion especulativa.
- En equipos con menos de 20 GB de memoria unificada, no se recomienda su uso; alternativas de menor huella serian necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (JANG_4M) | 35B total / 3B activo | 262.144 | 79 | MIT | MLX (safetensors) |
| Ornith-1.5-397B-A3B | 397B total / 3B activo | no disponible | no disponible | no disponible | no disponible |
| Ornith-1.5-9B (dense) | 9B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.6-35B | 35B | no disponible | no disponible | no disponible | no disponible |

La familia Ornith-1.5 se compone de tres escalas (397B MoE, 35B MoE y 9B dense). Segun un hilo en los foros de NVIDIA, el modelo 35B-A3B se considera interesante para configuraciones de un solo nodo, aunque se senala que es solo texto en su variante base, lo que lo diferenciaria de Qwen3.6-35B. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion consultada.

## Limitaciones y advertencias

- Audio no soportado: los tokens de audio en el tokenizador son vestigiales; el modelo no tiene configuracion ni pesos de torre de audio, por lo que cualquier intento de usar esa modalidad fallara.
- Solo ingles: la model card declara exclusivamente el idioma `en`; no hay evidencia de capacidades multilingues.
- Comportamiento del thinking mode: desactivar el razonamiento con `enable_thinking=False` no elimina el bloque de pensamiento, sino que prefija un bloque vacio cerrado. Un parser que solo compruebe la presencia del bloque ` thinking` detectara uno en ambos modos; hay que verificar si tiene contenido.
- Sin niveles de esfuerzo de razonamiento: a diferencia de Qwen3.8, este modelo no ofrece tiers de `reasoning_effort` configurables.
- Cuantizacion mixta: aunque la calibracion JANG reduce la perdida, la mezcla de 4, 5 y 8 bits junto con tensores en fp16 implica una precision heterogenea que puede afectar a tareas de alta sensibilidad numerica.
- Restriccion de plataforma: al ser un bundle MLX, su despliegue esta limitado a Apple Silicon; para otros entornos es necesaria una conversion de formato.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento de multiples pasos donde no se verifica cada afirmacion.
- Sin datos de sesgos: no se ha publicado informacion sobre evaluaciones de sesgos, toxicidad o seguridad en la documentacion disponible.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/OsaurusAI/Ornith-1.5-35B-A3B-JANG_4M
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI (modelos, VRAM, benchmarks, setup local): https://ornith.online/
- Hilo en foros de NVIDIA sobre la familia Ornith-1.5: https://forums.developer.nvidia.com/t/deepreinforce-ornith-1-5-family-released/380623
- Bundle anterior de la familia (Ornith-1.0-35B-MXFP4): https://huggingface.co/OsaurusAI/Ornith-1.0-35B-MXFP4
