# BuilderHelm/Kanso-Koi-1.0

## Resumen

Kanso Koi 1.0 es un adaptador LoRA de bajo rango entrenado sobre `mlx-community/Qwen3-1.7B-4bit` para una tarea muy concreta: la limpieza y el formateo de texto dictado. Recibe la salida cruda de un sistema de reconocimiento automático del habla (ASR) y devuelve el texto con puntuación, mayúsculas, eliminación de muletillas y reinicios falsos, normalización inversa de texto (números, importes, fechas, horas, porcentajes, correos, URL y teléfonos) y reparación gramatical que preserva el significado. Lo desarrolla BuilderHelm AI, antes publicado como `imYChaudhary22/Kanso-Koi-1.0` y heredero de la línea ZenPolish (v2.2 Lite en la numeración interna).

El modelo se distribuye en el formato de despliegue que el autor denomina "ship format": una base Qwen3 de 1.7B parámetros cuantizada a 4 bits (968 MB) más un adaptador LoRA en bf16 (70 MB) que se aplica en vivo, sin fusionar. La decisión no es cosmética: la model card advierte que fusionar el adaptador en los pesos daña de forma medible el comportamiento, en particular la normalización de importes monetarios y el borrado de muletillas.

Su relevancia ahora es práctica: es un componente de postprocesado para dictado que corre íntegramente en el dispositivo vía MLX, con un pico de memoria de 1,19 GB y una velocidad de decodificación de 73 tok/s en un Apple M5. Frente a la versión 2.2 original (base de 6 bits, 1,55 GB), la variante Lite reduce el paquete un 32 %, decodifica un 40 % más rápido y mejora la precisión en el benchmark de 500 dictados del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA; inferencia vía MLX |
| Parámetros totales | 1.720.574.976 (base) + adaptador LoRA (rango 32, alpha 64) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Base 4-bit (MLX); adaptador en bf16. La versión 0.9 original usaba base 6-bit y adaptador fp32 |
| Idiomas soportados | No disponible (no declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); adaptador en `adapters/` como LoRA separado, no fusionado |
| Tamaño del paquete | 1,05 GB (base 968 MB + adaptador 70 MB); repo 1,0 GB |
| Librería | `mlx` (runtime `mlx-lm` / `mlx-swift-lm`) |
| Pipeline | text-generation |
| Descargas / likes | 104 / 0 |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer denso de 1,7B parámetros que aquí se usa cuantizado a 4 bits con MLX. Sobre él se entrena un adaptador LoRA de rango 32, alpha 64 y escala 2,0, con dropout 0,05, decaimiento coseno de 1e-4 a 1e-6 sin warmup y 3.500 iteraciones. El adaptador se mantiene siempre como artefacto independiente: la model card es explícita en que debe cargarse con `LoRAContainer` en mlx-swift-lm o con `adapter_path` en mlx-lm, y en que fusionarlo degrada la calidad.

El corpus de entrenamiento consta de unas 90.000 parejas procedentes de diez fuentes: pares de limpieza de dictado y ASR real, muletillas en mitad de frase de DisfluencySpeech, entonación interrogativa de Hansard, normalización de importes en transcripciones de llamadas de resultados empresariales, patrones combinados de muletilla e importe de BudgieScribe, minado de exclamaciones de Gutenberg, objetivos expresivos de go_emotions, negativos de paso directo de identidad y el corpus reetiquetado de v2.1. Se aplican políticas de consistencia de etiquetas: borrado de muletillas en mitad de frase, importes monetarios siempre en formato `$`, exclamaciones preservadas y mayúscula al inicio de frase. El pipeline completo está en `training/data_v22/` del repositorio ZenVoice. No se documentan fases de RLHF ni DPO.

## Capacidades

- Limpieza de dictado: restauración de puntuación y mayúsculas sobre transcripción ASR cruda.
- Eliminación de muletillas, tanto al inicio como en mitad de frase, y de reinicios falsos.
- Normalización inversa de texto (ITN): números, importes monetarios, fechas, horas, porcentajes, correos electrónicos, URL y números de teléfono.
- Reparación gramatical que preserva el significado y el vocabulario del hablante.
- Ajuste de registro y mayúsculas según una línea de contexto `app:` incluida en el prompt de sistema.
- Salida restringida al texto limpio, sin comentarios ni explicaciones (comportamiento entrenado).
- Modo no-thinking forzado en el ejemplo de uso (`enable_thinking=False`), decodificación greedy con temperatura 0,0.
- Tool calling, agentes, visión, audio nativo o razonamiento multi-paso: no documentados; el modelo está especializado en una única tarea de formateo.

## Casos de uso

- Postprocesado en aplicaciones de dictado: el modelo se inserta entre el motor ASR y el campo de texto del usuario; con 0,23 s de media por dictado en el pipeline de la app ZenVoice, la latencia es imperceptible en escritura continua.
- Notas de voz y libretas rápidas en iOS/macOS: al ejecutarse vía MLX con 1,19 GB de pico de memoria, cabe en dispositivos Apple Silicon sin conexión a red ni envío de audio a terceros.
- Transcripción de reuniones y llamadas: la normalización de importes y fechas está entrenada específicamente con transcripciones de llamadas de resultados, lo que la hace adecuada para actas con cifras económicas.
- Accesibilidad: usuarios que dependen de entrada por voz obtienen texto con puntuación y mayúsculas correctas, lo que reduce la carga de corrección manual posterior.
- Higiene de datos para pipelines de ASR a gran escala: se puede aplicar por lotes sobre transcripciones almacenadas para elevar la calidad antes de indexarlas o analizarlas.
- Corrección de correos y URL dictados: el modelo restaura las formas escritas de direcciones, que son el punto donde más falla la transcripción literal.
- Componente de una cadena de agentes de voz: como paso determinista previo (temperatura 0,0) antes de enviar el texto a un LLM de mayor tamaño, reduciendo ruido de entrada.

## Benchmarks y rendimiento

Suite de 500 dictados (`eval_v500`, control de fuga de datos), decodificación greedy, Apple M5, MLX 0.32.2. "Original v2.2" = `Kanso-Koi-0.9` en la revisión `53bd03b`:

| Métrica | Lite (1.0) | Original v2.2 (0.9) |
|---|---|---|
| WER | 5,5 % | 6,7 % |
| Exact match | 65,8 % | 53,6 % |
| Punct F1 | 0,863 | 0,759 |
| Inicio de frase correcto | 94,4 % | 91,6 % |
| Tamaño del paquete | 1,05 GB | 1,55 GB |
| Memoria pico | 1,19 GB | 1,77 GB |
| Velocidad de decodificación | 73 tok/s | 51 tok/s |

Suite de 234 filas con control de fuga, tal como se publicó para v2.2:

| Métrica | v2.2 (Koi) | v3 (Satori 4B) | v2.1 | v2 | Qwen3-1.7B stock |
|---|---|---|---|---|---|
| WER | 9,9 % | 17,2 % | 12,6 % | 30,5 % | 11,0 % |
| Exact match | 50,4 % | 41,0 % | 29,9 % | 23,1 % | 5,0 % |
| Punct F1 | 0,832 | 0,750 | 0,573 | 0,649 | 0,634 |
| Precisión de mayúsculas | 98,3 % | 95,6 % | 97,0 % | 92,4 % | 96,3 % |
| Inicio de frase | 90,9 % | 80,7 % | 86,2 % | 62,1 % | 74,9 % |
| Alucinación | 0,0–7,2 % | 10,8 % | 7,2 % | 23,0 % | 0,9 % |

En la misma suite de 234 filas, la versión Lite con adaptador bf16 obtiene WER 9,7 %, exact match 50,4 % y punct F1 0,831.

Runtime de la app ZenVoice (`mlx-swift-lm`, pipeline propio de formateo, `eval_v500`), con el original v2.2 entre paréntesis: WER de salida 4,0 % (4,7 %), exact match 65,4 % (43,2 %), tiempo medio 0,23 s por dictado (0,27 s), memoria pico 1,39 GB (1,94 GB).

## Requisitos de hardware

- VRAM/memoria unificada: 1,19 GB de pico en el benchmark con MLX; 1,39 GB en el pipeline de la app. El paquete en disco ocupa 1,05 GB (968 MB base + 70 MB adaptador).
- Hardware objetivo: Apple Silicon. El modelo se publica en formato MLX y no incluye pesos GGUF ni safetensors para CUDA; el benchmark se ejecutó en un Apple M5.
- GPU consumer: no aplica en el sentido habitual; encaja de sobra en cualquier Mac con Apple Silicon y en iPhone/iPad vía `mlx-swift-lm`. En GPU NVIDIA no hay ruta de despliegue documentada con los artefactos publicados.
- Opciones de despliegue: `mlx-lm` en Python (`load(path, adapter_path=...)`) y `mlx-swift-lm` con `LoRAContainer` en apps macOS/iOS. vLLM, TGI, llama.cpp u Ollama no están soportados de forma nativa por el formato; requerirían conversión y fusión del adaptador, algo que el autor desaconseja explícitamente por la pérdida de calidad.
- Rendimiento: 73 tok/s de decodificación en M5 con decodificación greedy; 0,23 s de media por dictado de extremo a extremo en el runtime de la app.
- Nota operativa: el adaptador debe residir junto a la base y cargarse en tiempo de ejecución. Presupuestar el espacio y el tiempo de carga de ambos artefactos, no solo de la base.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | WER (v500) | Exact match (v500) | Paquete | Licencia |
|---|---|---|---|---|---|---|---|
| Kanso Koi 1.0 (Lite) | 1,7B + LoRA | 4-bit + bf16 | No disponible | 5,5 % | 65,8 % | 1,05 GB | Apache-2.0 |
| Kanso Koi 0.9 (v2.2 original) | 1,7B + LoRA | 6-bit + fp32 | No disponible | 6,7 % | 53,6 % | 1,55 GB | Apache-2.0 |
| Kanso Satori 1.0 (v3, 4B) | 4B (tier superior) | No disponible | No disponible | 17,2 % (suite 234) | 41,0 % (suite 234) | No disponible | Apache-2.0 |
| Qwen3-1.7B stock | 1,7B | 4-bit | No disponible | 11,0 % (suite 234) | 5,0 % (suite 234) | No disponible | Apache-2.0 |

La comparación relevante es contra el modelo base sin adaptador: el ajuste multiplica por diez el exact match en la suite de 234 filas (50,4 % frente a 5,0 %) y mejora el WER de 11,0 % a 9,9 %, a costa de introducir algo de alucinación (hasta 7,2 % frente al 0,9 % del stock). Frente a Satori 1.0, el tier de 4B, Koi es claramente superior en esta tarea pese a tener menos parámetros, lo que sugiere que el tamaño no compensa la especialización.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente conversacional ni un generador de propósito general. Usarlo fuera del formateo de dictado producirá resultados degradados.
- Riesgo de alucinación medido de hasta el 7,2 % en la suite de 234 filas, frente al 0,9 % del Qwen3-1.7B sin ajustar. En producción conviene validar el texto de salida en flujos sensibles (importes, direcciones).
- No se debe fusionar el adaptador en los pesos base: la model card documenta daño medible en la normalización de importes y en el borrado de muletillas.
- Idiomas soportados no declarados. Las fuentes de entrenamiento descritas (Hansard, llamadas de resultados, Gutenberg, go_emotions) son corpus en inglés, por lo que el comportamiento en castellano no está documentado ni evaluado.
- Longitud de contexto no especificada en la información disponible; para dictados largos habrá que trocear la entrada y no hay guía del autor sobre el punto de corte.
- Dependencia de plataforma: MLX limita el despliegue a Apple Silicon. No hay artefactos GGUF ni ruta oficial para CUDA.
- Sesgos: no documentados por el autor. El corpus incluye fuentes diversas (Hansard parlamentario, llamadas financieras, Gutenberg), lo que puede arrastrar sesgos de registro y de vocabulario de esos dominios.
- Licencia Apache-2.0, permisiva para uso comercial, heredada de Qwen3-1.7B. Los datos de entrenamiento son de fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribuciones en el repositorio ZenVoice; conviene revisarla antes de un despliegue comercial.
- Trazabilidad de nombres confusa: el repositorio ha cambiado de nombre y de organización varias veces (`zen-polish-…` → `Kanso-Koi-0.9` → `BuilderHelm/Kanso-Koi-1.0`). Fijar la revisión concreta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Versión anterior (v2.2 original, 6-bit): https://huggingface.co/BuilderHelm/Kanso-Koi-0.9
- Tier superior de 4B: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Repositorio ZenVoice (pipeline de datos `training/data_v22/` y atribuciones): no disponible como enlace directo en la información proporcionada
