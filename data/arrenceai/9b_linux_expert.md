# ArRENCEAI/9b_Linux_Expert

## Resumen
ArRENCE 9B Linux Expert es un ajuste fino (fine-tune) del modelo Qwen3.5-9B, desarrollado por ArRENCE AI, especializado en administración de sistemas Linux. El modelo hereda la arquitectura y el contexto de su base (Qwen3.5-9B) y se distribuye exclusivamente en formato GGUF cuantizado para su ejecución local en herramientas como LM Studio, llama.cpp u Ollama. Con 8.953.803.264 parámetros totales, se posiciona como una alternativa por debajo de los 10B parámetros orientada a tareas de sysadmin, DevOps y diagnóstico de sistemas.

El problema que aborda es la precisión factual en dominios técnicos muy concretos: unidades y temporizadores de systemd, montajes y fstab, SSH y gestión de claves, permisos y ACL, SELinux y AppArmor, journald y logrotate, redes, almacenamiento y reparación de sistemas de ficheros. Según el autor, el modelo reduce entre un 18% y un 43% los errores factuales frente a Qwen3.5-9B en un conjunto de 300 preguntas de Linux evaluadas por dos jueces automáticos.

Es relevante ahora porque permite ejecutar un asistente especializado de forma 100% local, sin enviar consultas fuera de la máquina, algo crítico en entornos de administración de sistemas donde la información puede ser sensible. El modelo desactiva el modo "thinking" en su plantilla integrada, de modo que devuelve respuestas directas en lugar de cadenas de razonamiento extensas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, identificador `qwen35`), heredada del modelo base |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens según recomendaciones del autor; 16.384 recomendado en LM Studio y 8.192 en máquinas con poca memoria |
| Tipos de cuantización | Q4_K_M (5,63 GB) y Q5_K_M (6,47 GB); distribuidas como GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería `gguf`); el modelo base se distribuye en safetensors, pero este fine-tune solo publica GGUF |

## Arquitectura y entrenamiento
El modelo es un fine-tune de Qwen3.5-9B, por lo que conserva la arquitectura transformer del modelo base, su huella de memoria y su ventana de contexto. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La especialización se orienta a dominios concretos de administración de Linux, y el autor reporta que el modo de razonamiento (thinking) está desactivado en la plantilla integrada del modelo, lo que produce respuestas directas.

Como innovaciones destacables, el autor menciona la evaluación con dos jueces automáticos (GLM-5.3-Flash y DeepSeek-V4.1-Flash) sobre 300 preguntas reservadas de Linux, así como un conjunto de evaluación Longform-250 (250 peticiones reales contrastadas contra 844 puntos clave extraídos de páginas de manual) y Recall-250 (peticiones de comando, opción, ruta o valor exactos). No se especifican detalles sobre decodificación especulativa ni técnicas de atención lineal.

## Capacidades
- Generación de texto especializada en administración de sistemas Linux: systemd (unidades y timers), fstab y montajes, SSH y claves, permisos y ACL, SELinux y AppArmor, journald y logrotate, redes, almacenamiento y reparación de sistemas de ficheros.
- Respuestas directas sin cadena de razonamiento visible, gracias a que el modo thinking está desactivado en la plantilla integrada.
- Uso de herramientas (tool calling / function calling): según el autor, acierta la llamada correcta en el 90,0% de los casos "simple" del BFCL v3 y retiene la llamada cuando ninguna herramienta encaja en el 88,8% de los casos de "irrelevancia".
- Precisión en detalles exactos (comandos, opciones, rutas y valores), con un 86,4% en el conjunto Recall-250.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés (`en`).
- Ejecución 100% local, sin envío de consultas a servicios externos.

## Casos de uso
- Asistencia a administradores de sistemas en la redacción y depuración de unidades y timers de systemd: el modelo responde con comandos y ficheros de configuración concretos, y su entrenamiento específico reduce errores en directivas y rutas.
- Diagnóstico de arranque y montajes: ayuda a interpretar errores de fstab, opciones de montaje y recuperación de sistemas de ficheros, con respuestas concisas (según el autor, un 27% menos de palabras con cobertura equivalente).
- Gestión de acceso y permisos: consultas sobre ACL, propietarios, bits de permiso, SELinux y AppArmor, con recuperación precisa de comandos exactos (86,4% en Recall-250).
- Automatización DevOps y scripting: generación de scripts bash y fragmentos de configuración para pipelines, apoyándose en el soporte de tool calling para integrarse en flujos automatizados.
- Operación de servidores en entornos aislados o sensibles: al ejecutarse de forma local en LM Studio, llama.cpp u Ollama, permite consultar dudas sobre infraestructura sin exponer información fuera de la máquina.
- Formación y soporte interno: despliegue de un asistente de consulta para equipos de operaciones que necesitan respuestas breves y verificables sobre comandos y rutas de Linux.
- Integración en asistentes de terminal o IDE: mediante llama.cpp u Ollama, el modelo puede servir como backend de un asistente local que responda sobre systemd, SSH o redes sin latencia de red.

## Benchmarks y rendimiento

| Benchmark | ArRENCE 9B Linux Expert | Qwen3.5-9B | Ornith-1.5-9B |
|---|---|---|---|
| Errores factuales (juez GLM-5.3-Flash) | 18% menos que Qwen3.5-9B | Referencia | 43–61% más errores que ArRENCE |
| Errores factuales (juez DeepSeek-V4.1-Flash) | 43% menos que Qwen3.5-9B | Referencia | 43–61% más errores que ArRENCE |
| Respuestas sin errores factuales (GLM) | 23% | 11% | No disponible |
| Respuestas sin errores factuales (DeepSeek) | 44% | 20% | No disponible |
| Longform-250 (cobertura de puntos clave) | 80,7% | 81,9% | No disponible |
| Recall-250 (detalle exacto) | 86,4% | 83,2% | 78,8% |
| BFCL v3 "simple" (acierto de llamada) | 90,0% | 93,8% | No disponible |
| BFCL v3 "irrelevancia" (retención) | 88,8% | 84,2% | No disponible |
| Longitud de respuesta | 27% menos palabras que Qwen3.5-9B | Referencia | No disponible |

Los datos proceden de la model card del autor. No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: unos 8 GB de memoria GPU o memoria unificada para la cuantización Q5_K_M (6,47 GB de fichero); la Q4_K_M (5,63 GB) está pensada para equipos con menos de 8 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El autor indica que la Q5_K_M necesita aproximadamente 8 GB de memoria y que se debe maximizar el offload de capas a la GPU.
- Compatibilidad con GPU de consumo: sí, siempre que dispongan de al menos 8 GB de VRAM para Q5_K_M o algo menos para Q4_K_M; el autor sugiere reducir el offload si se agota la memoria.
- Opciones de despliegue: LM Studio, llama.cpp (runtime reciente con soporte para la arquitectura `qwen35`), Ollama y otras aplicaciones locales compatibles con GGUF.
- Configuración recomendada: contexto de 16.384 tokens (8.192 en máquinas de poca memoria, hasta 32.768), Flash Attention activado si el hardware lo soporta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ArRENCE 9B Linux Expert | 8,95B | Hasta 32.768 tokens | Apache-2.0 | GGUF (Q4_K_M, Q5_K_M) | Especializado en Linux; respuestas directas sin thinking |
| Qwen3.5-9B | 9B (base) | No disponible en la información | No disponible en la información | safetensors (base) | Modelo base; mejor BFCL "simple" (93,8%) pero más errores factuales y respuestas más largas |
| Ornith-1.5-9B | 9B (aproximado) | No disponible en la información | No disponible en la información | No disponible en la información | Peor en Recall-250 (78,8%) y con 43–61% más errores factuales que ArRENCE según el autor |

## Limitaciones y advertencias
- Idiomas: el modelo declara únicamente inglés; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Riesgo de alucinación: aunque el autor reporta menos errores factuales que su base, sigue siendo un modelo de lenguaje y puede generar comandos, rutas u opciones incorrectas; conviene verificar en entornos de producción.
- Tool calling: el autor reconoce un rendimiento inferior a Qwen3.5-9B en casos "simple" del BFCL v3 (90,0% frente a 93,8%), por lo que la integración en pipelines automatizados debe validarse.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene revisar antes de un despliegue comercial.
- Dependencia de runtime: requiere una versión reciente de llama.cpp compatible con la arquitectura `qwen35`; versiones antiguas pueden fallar con error de arquitectura desconocida.
- Solo se publican pesos GGUF cuantizados (Q4_K_M y Q5_K_M); no hay safetensors del fine-tune disponibles en la información proporcionada.
- Los benchmarks reportados proceden del propio autor y no de una evaluación independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ArRENCEAI/9b_Linux_Expert
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio web de ArRENCE AI: https://arrenceai.com
- X (Twitter): https://x.com/ArRENCEAI
- Facebook: https://www.facebook.com/arrenceai
- YouTube: https://www.youtube.com/@ArRENCEAI
- LM Studio: https://lmstudio.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Berkeley Function Calling Leaderboard (BFCL v3): https://gorilla.cs.berkeley.edu/leaderboard.html
- Pesos Q5_K_M: https://huggingface.co/ArRENCEAI/9b_Linux_Expert/blob/main/ArRENCE-9B-Linux-Expert-Q5_K_M.gguf
- Pesos Q4_K_M: https://huggingface.co/ArRENCEAI/9b_Linux_Expert/blob/main/ArRENCE-9B-Linux-Expert-Q4_K_M.gguf
