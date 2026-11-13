# Shiftedx/Qwen3.5-9B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX

## Resumen

Qwen3.5-9B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX es una cuantizacion mixta en formato MLX del modelo xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity, un derivado afinado para tareas de ciberseguridad sobre la base Qwen3.5 de 9B. El artefacto lo publica el usuario Shiftedx y su proposito no es reentrenar el modelo, sino ofrecer una version de pesos reducida y optimizada para inferencia en Apple Silicon mediante la libreria MLX, manteniendo el torre de vision y la cabeza MTP nativas en BF16.

El modelo resuelve el problema de ejecutar un modelo multimodal de 9.4 mil millones de parametros en equipos con memoria unificada limitada sin degradar en exceso las capacidades del modelo original. Para ello aplica una politica de precision no uniforme: el tronco general en 4 bits afines con grupo 32, y las proyecciones de atencion, embeddings, cabeza de salida y MLPs de las ultimas ocho capas en 8 bits con grupo 64, dejando en BF16 las 48 proyecciones de entrada recurrentes, el torre de vision y la cabeza MTP.

Es relevante ahora porque combina tres tendencias: la demanda de modelos especializados en ciberseguridad, la cuantizacion mixta consciente de la arquitectura (en lugar de una cuantizacion uniforme) y el ecosistema MLX para Mac. El autor documenta mediciones locales concretas (unos 61.9 tokens/s y 9.52 GB de pico en un M4 Max de 64 GiB), aunque advierte explicitamente de que no reclama ningun benchmark publico amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP nativa, derivado de Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens de entrenamiento segun la fuente; el limite arquitectonico del config es mayor pero no esta plenamente cualificado |
| Tipos de cuantizacion | Mixta: 4 bits afines grupo 32 (tronco), 8 bits afines grupo 64 (atencion, embeddings, cabeza y MLPs de las ultimas 8 capas), BF16 (48 proyecciones recurrentes, torre de vision y cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (metadatos del publicador; el autor advierte que no resuelve los terminos upstream de modelo y dataset) |
| Formato de pesos | safetensors (MLX), repo de 9.4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 con 9.4B parametros, capaz de procesar entradas de imagen y texto (pipeline image-text-to-text) y con una cabeza MTP (multi-token prediction) nativa para decodificacion especulativa. Sobre esa base, xtools-at publico un afinado orientado a ciberseguridad (Qwensploit), y Shiftedx genera este artefacto como cuantizacion mixta del safetensors BF16 del publicador en la revision fijada `2d7a0861d65257affe8d6577447f60356c51797f`, no de la release V2 posterior.

No se ha realizado reentrenamiento ni recuantizacion a GGUF. La innovacion tecnica del artefacto es la politica de precision por capas: se preserva en 8 bits y BF16 aquello mas sensible a la cuantizacion agresiva (proyecciones de atencion, embeddings, cabeza, MLPs finales y proyecciones recurrentes) y se comprime a 4 bits el tronco general. El autor documenta verificacion de hashes SHA-256 de los shards de origen contra la revision fijada, sanitizacion y transformaciones de vision mediante MLX-VLM, y paridad estricta de log-probabilidades antes y despues del guardado. No se detallan los datos de entrenamiento del modelo base ni del afinado, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text), con torre de vision en BF16 y tres pruebas de humo sinteticas de vision superadas.
- Modo thinking configurable: el runner nativo respeta el thinking por defecto del publicador y permite desactivarlo con `--no-thinking`.
- Generacion de JSON estructurado mediante LLGuidance con esquema proporcionado por la aplicacion (el modelo en si no fuerza JSON).
- Decodificacion especulativa mediante cabeza MTP nativa, con block size 2 recomendado y una mejora medida de aproximadamente 1.36x en latencia extremo a extremo en pruebas de texto.
- Recuperacion en contexto largo: prueba superada con 2.070 tokens de prompt.
- Especializacion declarada en ciberseguridad por el afinado del modelo base (Qwensploit).
- Soporte de tool calling / function calling: no confirmado de forma explicita; las pruebas locales incluyen casos de salida de herramienta pero el autor no certifica precision operativa.

## Casos de uso

- Asistencia en analisis de seguridad sobre imagenes: el modelo puede recibir capturas de paneles, diagramas de red o interfaces y combinarlas con texto, gracias a su pipeline image-text-to-text y torre de vision en BF16.
- Generacion de informes estructurados de hallazgos: usando el runner con LLGuidance y un JSON Schema, se pueden producir salidas con formato fijo (por ejemplo, severidad, CVE, recomendacion) que luego valida la aplicacion.
- Triaje de alertas en local: con 9.52 GB de pico en M4 Max, es viable ejecutarlo en un portatil Apple Silicon para clasificar y resumir alertas sin enviar datos a la nube.
- Prototipado de asistentes de ciberseguridad en Mac: el formato MLX y las versiones documentadas (MLX 0.32.2, MLX-LM 0.31.3, MLX-VLM 0.6.16) permiten montar un entorno reproducible de desarrollo.
- Extraccion de datos de documentos tecnicos: la ventana de 8.192 tokens de entrenamiento y la prueba de recuperacion a 2.070 tokens permiten procesar informes, politicas o logs acotados en una sola pasada.
- Aceleracion de inferencia interactiva: con la cabeza MTP y block size 2 se obtiene alrededor de 1.36x de speedup en texto, util para sesiones de chat o generacion de borradores en tiempo real.
- Evaluacion comparativa de cuantizaciones: sirve como artefacto de referencia para medir el impacto de la precision mixta frente al BF16 original en tareas de seguridad y JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks publicos amplios en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion de benchmark publico. Los unicos datos medidos son locales y de alcance acotado:

| Metrica | Valor | Entorno |
|---|---|---|
| Decodificacion greedy corta | ~61.9 tokens/s | M4 Max, 64 GiB memoria unificada |
| Memoria pico MLX | 9.52 GB | M4 Max, 64 GiB |
| Pruebas de workflow JSON (restringido) | 20/24 quant y 20/24 BF16 padre | Local, sin caso perdido respecto al padre |
| Generacion no restringida sin thinking | 14/24 quant vs 11/24 BF16 padre | Local; un caso de tool-output cambio de formato |
| Pruebas de humo de vision | 3/3 superadas | Antes y despues de serializar |
| Recuperacion | Superada a 2.070 tokens de prompt | Local |
| Sanity de thinking con presupuesto | 2/3 casos en 384 tokens generados | Local; precision amplia no cualificada |
| Speedup MTP (texto) | ~1.36x mediana extremo a extremo | Tres prompts, dos repeticiones por block size |

## Requisitos de hardware

- VRAM/memoria estimada: el autor reporta 9.52 GB de pico en MLX; el repo pesa 9.4 GB, por lo que se recomienda al menos 16 GB de memoria unificada y, para trabajar con holgura y vision, 24 GB o mas.
- GPU recomendadas: Apple Silicon con memoria unificada. El benchmark documentado es en M4 Max con 64 GiB. No hay datos para M4 Pro de 24 GB; el autor advierte que sus mediciones no son una afirmacion de rendimiento para ese equipo.
- Cabe en GPU consumer: si, en equipos Apple Silicon; no se documenta soporte para GPUs NVIDIA en este artefacto (formato MLX).
- Opciones de despliegue: MLX (0.32.2), MLX-LM (0.31.3), MLX-VLM (0.6.16), Transformers (5.14.1) y LLGuidance (1.8.0) para JSON restringido. Incluye runners `generate_json.py` y `generate_native.py`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 61.9 tokens/s en decodificacion greedy corta en M4 Max; speedup MTP de aproximadamente 1.36x en texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Shiftedx/Qwen3.5-9B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX | 9.41B | 8.192 (entrenamiento) | safetensors MLX mixto | Apache-2.0 | Cuantizacion mixta, vision y MTP en BF16, mediciones en M4 Max |
| xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity | 9.41B (mismo origen) | 8.192 (entrenamiento) | safetensors BF16 | Apache-2.0 | Modelo padre BF16; mas memoria, sin compresion |
| Qwen3.5-9B (base de la familia) | ~9B | no disponible | safetensors | no disponible | Modelo generalista del que deriva el afinado |
| Otras cuantizaciones MLX de la misma familia | no disponible | no disponible | safetensors MLX | no disponible | No se dispone de datos comparativos publicados |

No se dispone de datos de benchmarks comparativos publicados entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor no reclama ninguna puntuacion de benchmark publico; los resultados de workflow (20/24 y 14/24) no certifican precision operativa y deben validarse en la aplicacion.
- En generacion no restringida sin thinking, un caso de tool-output que el padre resolvia correctamente cambio de formato en esta cuantizacion.
- La precision amplia del modo thinking no esta cualificada: solo 2 de 3 casos completaron dentro de 384 tokens generados.
- Las combinaciones de MTP con JSON restringido y con imagen no estan cualificadas; la decodificacion autorregresiva sigue siendo el modo por defecto.
- El limite arquitectonico de contexto del config no esta plenamente cualificado; el contexto de entrenamiento declarado es de 8.192 tokens.
- No se dispone de informacion sobre idiomas soportados ni sobre sesgos conocidos del modelo base o del afinado.
- La licencia Apache-2.0 corresponde a los metadatos del publicador; el autor advierte que no resuelve los terminos upstream del modelo y del dataset, por lo que el uso comercial requiere revision legal independiente.
- El artefacto esta ligado al ecosistema MLX y Apple Silicon; no se documenta soporte para otras plataformas.
- Riesgo de alucinacion: inherente a los modelos generativos; el autor insiste en inspeccionar y validar los valores generados, especialmente en JSON estructurado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwen3.5-9B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX
- Modelo base (revision fijada): https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity/tree/2d7a0861d65257affe8d6577447f60356c51797f
- Modelo base (raiz): https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Repositorio MLX: no disponible en la informacion proporcionada
- Repositorio MLX-LM: no disponible en la informacion proporcionada
- Repositorio MLX-VLM: no disponible en la informacion proporcionada
- LLGuidance: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
