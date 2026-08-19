# OsaurusAI/Ornith-1.5-9B-MXFP8

## Resumen

Ornith 1.5 es un modelo de razonamiento y codificacion agente multimodal desarrollado por Ornith AI, que extiende el marco de auto-andamiaje (self-scaffolding) de Ornith 1.0 hacia un ciclo completo de auto-mejora: el propio modelo propone nuevas tareas, genera andamiajes especificos y produce soluciones para aprendizaje por refuerzo. Este bundle concreto, OsaurusAI/Ornith-1.5-9B-MXFP8, es la cuantizacion de referencia en 8-bit MXFP8 realizada por Osaurus AI sobre Apple Silicon, usando la libreria MLX.

El modelo combina una arquitectura hibrida de atencion lineal con puerta delta (gated-delta linear attention) y atencion completa en proporcion 3:1, con una torre de vision de 27 capas y soporte nativo de video. La ventana de contexto alcanza los 262.144 tokens y el razonamiento (thinking) esta activado por defecto. La licencia es MIT y el idioma soportado es exclusivamente ingles.

A pesar del nombre "9B", los pesos cuantizados en safetensors contabilizan 2.975.030.512 parametros (~2,98B), una discrepancia significativa que conviene verificar antes de dimensionar infraestructura. El bundle ocupa 9,45 GiB en disco y alcanza 57,9 tokens por segundo en un Apple M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hibrida gated-delta linear attention + full attention, proporcion 3:1) |
| Parametros totales | 2.975.030.512 (~2,98B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 (8-bit uniforme, grupo de 32) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith 1.5 emplea una arquitectura hibrida de atencion lineal con puerta delta (gated-delta linear attention) y atencion completa en proporcion 3:1, con 32 capas y tamano de ocultacion 4096. La torre de vision tiene 27 capas y el modelo acepta entradas de imagen y video. La arquitectura se denomina `qwen3_5` / `Qwen3_5ForConditionalGeneration`.

El entrenamiento sigue el marco de auto-mejora (self-improvement): el modelo propone nuevas tareas, genera andamiajes (scaffolds) especificos para cada tarea y produce soluciones para entrenamiento por refuerzo, creando nuevas experiencias de aprendizaje de forma continua. No se han publicado datos sobre el numero de tokens de entrenamiento ni la composicion del dataset.

La cuantizacion MXFP8 es uniforme de 8-bit con grupo de 32 y sirve como linea base de referencia para los niveles JANG del mismo autor. El razonamiento (thinking) esta activado por defecto: la generacion sin argumentos es identica a `enable_thinking=True`. Desactivarlo no elimina el bloque de pensamiento, sino que pre-rellena un bloque vacio, por lo que un parser que solo compruebe la presencia del bloque encontrara uno en ambos modos. No existen niveles de `reasoning_effort` (a diferencia de Qwen3.8), y los bloques de pensamiento historicos se conservan incondicionalmente.

El bundle incluye dos presets de muestreo en `jang_config.json`: el preset general (temperatura 1.0, presencia 1.5) y el preset de codificacion (temperatura 0.6, presencia 0.0), que es el predeterminado. Los tokens de parada son `[248046, 248044]` (`<|im_end|>`, `<|endoftext|>`).

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y conmutable.
- Codificacion agente: soporta tool calling (parser `qwen3_coder`) y razonamiento multi-paso.
- Vision multimodal con torre de vision de 27 capas y procesador de imagen incluido.
- Video: soporte nativo verificado de extremo a extremo, con `video_preprocessor_config.json` incluido.
- Audio: no soportado. El tokenizador define tokens vestigiales de audio (`<|audio_start|>`, `<|audio_end|>`, `<|audio_pad|>`), pero no hay `audio_config` ni pesos de torre de audio; la puerta de capacidad esta bloqueada a false.
- Decodificacion especulativa (MTP): no disponible en esta version. El checkpoint declara `mtp_num_hidden_layers: 1` pero no incluye pesos `mtp.*`. La variante 35B-A3B de la misma familia si incluye MTP nativo.
- Multilingue: no, solo ingles.

## Casos de uso

- **Resolucion de tareas de desarrollo autonomo**: con SWE-bench Verified 79, el modelo puede resolver tareas de repositorios reales, proponiendo parches y validandolos en entornos de integracion continua.
- **Asistente de programacion en terminal**: con Terminal-Bench 2.1 de 67.8, es capaz de operar en shells interactivos, ejecutando comandos y evaluando salidas para completar tareas de administracion de sistemas.
- **Analisis de video e imagenes en contextos de desarrollo**: la torre de vision de 27 capas y el soporte nativo de video permiten procesar grabaciones de sesiones de programacion, diagramas o capturas de pantalla para generar documentacion o detectar errores visuales.
- **Razonamiento multimodal de largo alcance**: la ventana de 262.144 tokens permite procesar repositorios completos junto con imagenes o video en una sola pasada, ideal para auditorias de codigo o revisiones de arquitectura.
- **Agentes autonomos con tool calling**: el parser `qwen3_coder` y el preset de codificacion por defecto lo hacen adecuado para construir agentes que interactuan con APIs, bases de datos o sistemas de archivos de forma secuencial.
- **Despliegue local en Apple Silicon**: al ser un bundle MLX cuantizado en 8-bit, puede ejecutarse en Macs con 16 GB de RAM unificada o mas, con rendimiento de 57.9 tok/s en un M5 Max, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67.8 |

Velocidad de decodificacion medida: 57.9 tokens por segundo en Apple M5 Max (bundle MXFP8). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 9,45 GiB (bundle cuantizado MXFP8).
- Memoria estimada: con ~2,98B parametros en 8-bit, se estima un uso de memoria de aproximadamente 3-4 GB para los pesos, mas el cache de contexto para 262K tokens (dependiendo del numero de secuencias concurrentes).
- GPU recomendada: Apple Silicon (M-series). El rendimiento medido es 57,9 tok/s en un Apple M5 Max. No hay datos de rendimiento en GPUs NVIDIA en la informacion disponible.
- Opciones de despliegue: libreria MLX (formato nativo). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: solo se dispone del dato de velocidad de decodificacion de 57,9 tok/s en M5 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench | MTP | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este, MXFP8) | ~2,98B reales | 262.144 | 79 | No | MIT |
| Ornith-1.5-35B-A3B | 35B total, 3B activos (MoE) | no disponible | no disponible | Si | MIT |
| Ornith-1.0-9B | no disponible | no disponible | no disponible | No | MIT |

La variante 35B-A3B de la misma familia es un modelo MoE con 3B parametros activos y soporte nativo de MTP (decodificacion especulativa), mientras que esta version 9B es densa y no incluye MTP. No se dispone de benchmarks de la variante 35B ni de Ornith 1.0 en la informacion proporcionada.

## Limitaciones y advertencias

- **Discrepancia de nombre**: el modelo se comercializa como "9B" pero sus pesos cuantizados contabilizan 2,98B parametros. Verificar las especificaciones reales antes de dimensionar infraestructura.
- **Solo ingles**: no hay soporte multilingue; los textos en otros idiomas pueden producir salidas de baja calidad.
- **Sin audio**: los tokens de audio del tokenizador son vestigiales; cualquier intento de entrada de audio fallara.
- **Razonamiento por defecto**: el modo thinking esta activado por defecto y desactivarlo no elimina el bloque (se pre-rellena vacio). Esto puede aumentar la latencia en aplicaciones en tiempo real.
- **Sin MTP**: la decodificacion especulativa no esta disponible en esta version, lo que limita el rendimiento en generacion larga.
- **Preset de muestreo**: el preset por defecto es el de codificacion (temperatura 0.6), que puede producir resultados mas conservadores en tareas genericas; hay que cambiar explicitamente al preset general para paridad con los valores por defecto de vLLM/Transformers.
- **Riesgo de alucinacion**: no se han publicado evaluaciones especificas de alucinacion en la informacion disponible.
- **Sesgos**: no se han publicado estudios de sesgos o seguridad en la informacion disponible.

## Enlaces

- [H
