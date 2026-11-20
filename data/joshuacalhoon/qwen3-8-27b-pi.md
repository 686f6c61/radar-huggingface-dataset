# JoshuaCalhoon/Qwen3.8-27B-Pi

## Resumen

Qwen3.8-27B-Pi es una cuantización mixta de precisión (4/6/8 bits) en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario JoshuaCalhoon. Sobre el modelo base se ha fusionado el adaptador LoRA del arnés `pi` (harness-hub/Qwen3.8-27B-pi-adapted), orientado a tareas de agente de programación, y el conjunto resultante se ha cuantizado con GPTQ calibrado sobre sesiones reales de codificación agéntica multi-turno. El resultado ocupa aproximadamente 15 GB y conserva la torre de visión en bf16.

El modelo resuelve un problema muy concreto: ejecutar un modelo de ~27B parámetros con capacidades de visión y comportamiento agéntico en hardware de consumo con memoria unificada, en este caso un MacBook Pro con chip M5 y 48 GB. La receta de cuantización asigna bits por tensor según un análisis de sensibilidad, con grupos más finos en proyecciones de atención y `lm_head` a 6 bits, buscando minimizar la degradación respecto al modelo bf16 fusionado.

Es relevante porque demuestra una cuantización MLX de precisión mixta calibrada sobre datos de uso real (no genéricos), con métricas de divergencia KL frente al base bf16 y resultados de sesiones agénticas reales. La licencia Apache 2.0 se hereda del modelo base. El modelo tiene 26.895.993.856 parámetros totales según los safetensors del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal (GDN: 48 de 64 capas con estado de tamaño constante), según la model card |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; las pruebas se realizaron con contexto de 64-256K, con picos de 175K |
| Tipos de cuantizacion | MLX affine 4-bit base con grupo 128; grupos 4:64 y 4:32 en `o_proj`/`out_proj`; `lm_head` 6-bit g64; `k_proj`/`v_proj` de atención completa 8-bit g64 (16 capas); `in_proj_a`/`in_proj_b` de atención lineal 8-bit g64 (48 capas); objetivo ~4,5 bpw; torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GPTQ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención completa con capas de atención lineal de tipo GDN (estado de tamaño constante). Según la model card, 48 de las 64 capas mantienen estado de tamaño fijo, lo que explica que la velocidad de decodificación solo decaiga un ~13% al pasar de 1K a 151K tokens de contexto. El pipeline declarado es image-text-to-text, con torre de visión incluida.

Sobre el proceso de cuantización: se partió del modelo bf16 con el adaptador LoRA `pi` ya fusionado. La calibración usó 984 secuencias y 583K tokens, con un 85% de código y un 15% de prosa, extraídos de sesiones agénticas de proyectos de software reales, reservando secuencias de proyectos no calibrados para validación. La asignación de bits por tensor se derivó de un pase de sensibilidad en streaming (puntuaciones block-ref × error local). Se aplicó GPTQ con realimentación de error ponderada por Hessiano y empaquetado affine de MLX, procesando capas en streaming sobre el mismo corpus. Se evitaron anchos de bit impares en la base porque, según el autor, los configuraciones de 3 y 5 bits amplias penalizan el tiempo de ciclo de decodificación entre un 12% y un 26%, mientras que un `lm_head` a 6 bits resultó sin coste medible (75,3 frente a 75,2 ms/ciclo).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`low`, `medium`, `xhigh`, por defecto `low`), heredado del modelo base.
- Codificación agéntica: el adaptador `pi` está orientado a flujos de trabajo de agente de programación; en una sesión real de 101 peticiones no se produjeron llamadas a herramientas malformadas ni truncamientos por longitud.
- Llamada a herramientas (tool calling): validada en la sesión agéntica reportada, con 101/101 peticiones sin errores de formato.
- Procesamiento de imagen y texto (image-text-to-text): la torre de visión se conserva en bf16 y el autor reporta lectura de capturas de pantalla en mitad de una tarea.
- Autocorrección en mitad de ejecución y flujos multi-paso de larga duración (barrido de versiones, compilación, firma, notarización, empaquetado DMG).
- Contexto largo efectivo: sesión con picos de 175K tokens y caché de prefijo con 99,1% de acierto agregado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación autónomo en local: el adaptador `pi` y la calibración sobre sesiones de código permiten usarlo como asistente que edita, compila y prueba proyectos; la sesión reportada cubrió un flujo completo de release con compilaciones firmadas y notarizadas.
- Automatización de flujos de release en macOS: el modelo leyó capturas de pantalla y ejecutó pasos de firma, notarización y empaquetado en un contexto de más de 100K tokens, lo que encaja con pipelines que requieren inspección visual y ejecución de comandos.
- Asistencia de código en el IDE con contexto de repositorio amplio: con ventanas de 64-256K tokens puede mantener varios ficheros y el historial de la sesión, y su decodificación apenas se degrada con la profundidad de KV.
- Procesamiento de documentación técnica con imágenes: al conservar visión en bf16, puede extraer información de diagramas, capturas y documentación escaneada junto con texto.
- Despliegue en estación de trabajo con memoria unificada: cabe en un MacBook Pro de 48 GB con unas 15 GB de pesos, lo que permite inferencia local sin GPU dedicada.
- Investigación sobre cuantización: sirve como referencia reproducible de cuantización mixta GPTQ en MLX con métricas KL frente al base bf16, útil para estudiar el impacto de la asignación de bits por tensor.
- Atención al cliente o asistentes multi-turno con contexto largo: la arquitectura híbrida mantiene velocidad estable a 150K+ tokens, adecuada para conversaciones prolongadas con historial extenso.

## Benchmarks y rendimiento

| Métrica | Este quant | Qwen3.8-27B-MLX-4bit-GPTQ (g4p-v2) |
|---|---|---|
| KL frente a bf16 (menor es mejor) | 0,01865 | 0,02336 |
| Acuerdo top-1 con bf16 | 0,9444 | 0,9426 |

Medido sobre una porción reservada de 8 secuencias / 5.230 tokens de proyectos excluidos de la calibración, con KL sobre el top-64 de bf16 más un cubo de cola. El autor indica ~20% menos KL al mismo tamaño.

Rendimiento de decodificación por profundidad de KV (M5 MacBook Pro, 16 núcleos GPU, 48 GB, servidor Splash, caché KV en bf16):

| Profundidad KV | Decodificación (tok/s) | Aceptación de draft | ITL p50 |
|---|---|---|---|
| ~1-46K | 49-50 | 0,19-0,28 | 25 ms |
| ~80K | 44 | 0,31 | 29 ms |
| ~112K | 44 | 0,35 | 28 ms |
| ~151K | 43 | 0,37 | 34 ms |

Prefill de ~321 tok/s a 175K con acierto de caché del 98%. La tasa efectiva de generación se mantuvo en 38-39 tok/s entre 50K y 150K+. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos: ~15 GB en el repositorio (tamaño del repo 16,1 GB).
- VRAM/memoria unificada estimada: con caché KV en bf16 y contexto de 64-256K se necesita bastante más que los pesos; el autor lo ejecuta en 48 GB de memoria unificada, con caché KV en INT8 cuando la RAM es limitada.
- GPU recomendadas: el autor solo reporta pruebas en Apple Silicon (M5, 16 núcleos GPU). Para MLX se requiere hardware Apple; GPU NVIDIA/AMD no están validadas en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo discretas; en Apple Silicon cabe en equipos con 48 GB de memoria unificada.
- Opciones de despliegue: servidor Splash (recomendado por el autor, empareja automáticamente el draft DFlash2); `mlx_lm.load` carga el modelo de texto; otros runtimes MLX no han sido probados. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 49-50 tok/s a contextos cortos, 43 tok/s a ~151K; ITL p50 de 25-34 ms; prefill ~321 tok/s a 175K con caché caliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pi (este) | ~26,9B | no disponible (probado hasta 175K) | MLX mixta 4/6/8-bit GPTQ | Apache 2.0 | LoRA `pi` fusionado, visión en bf16 |
| JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ (g4p-v2) | ~26,9B (base) | no disponible | MLX 4-bit GPTQ | Apache 2.0 | Referencia de KL 0,02336 y top-1 0,9426 |
| Qwen/Qwen3.8-27B (base bf16) | ~26,9B | no disponible | bf16 | Apache 2.0 | Modelo de referencia sin cuantizar |

No se dispone de datos de benchmarks estándar ni de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modo sin pensamiento (non-thinking), que es el objetivo del adaptador LoRA, no había sido probado en sesión real en el momento de publicar la model card; no hay números de rendimiento para ese modo.
- Con el pensamiento activado, un `max_tokens` pequeño puede consumirse entero en tokens de razonamiento y devolver contenido vacío; se recomienda `reasoning_effort: "none"` para respuestas cortas y deterministas.
- El autor recomienda temperatura 0,7 para uso como agente de código, frente al 1,0 por defecto del modelo base; no hay validación de otros valores.
- Solo se ha probado con el servidor Splash y `mlx_lm`; otros runtimes MLX no están validados, lo que limita la portabilidad.
- Requiere hardware Apple Silicon; no hay soporte documentado para CUDA ni para GPUs discretas.
- El modelo está calibrado mayoritariamente sobre código (85%) y sesiones de proyectos concretos; el rendimiento en prosa, otros idiomas o dominios no está medido.
- Los resultados de la sesión agéntica provienen de un único entorno (M5, 48 GB, configuración térmica agresiva) y de un solo flujo de trabajo, por lo que no son necesariamente representativos.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene verificar los términos del adaptador `pi` y del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshuaCalhoon/Qwen3.8-27B-Pi
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Adaptador LoRA `pi`: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Cuantización de referencia: https://huggingface.co/JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ
- Proyecto Vorssaint (perfil de ventilación): https://github.com/vorssaint/vorssaint-utils
