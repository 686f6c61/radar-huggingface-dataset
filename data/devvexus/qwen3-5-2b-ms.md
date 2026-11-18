# devvexus/Qwen3.5-2B-MS

## Resumen

Qwen3.5-2B-MS es una colección de cuantizaciones GGUF del modelo base Qwen/Qwen3.5-2B, publicada por el desarrollador independiente devvexus (Matthew Priester). No se trata de un modelo nuevo, sino de una recodificación en el formato propietario MS (Mad Shift) que requiere un fork específico de llama.cpp, ms-llama.cpp. El modelo base Qwen3.5-2B es un transformer denso de aproximadamente 1.880 millones de parámetros, orientado a generación de texto conversacional.

La relevancia de esta ficha reside en la propuesta técnica del autor: reducir la pérdida de calidad respecto al modelo original en BF16 manteniendo el mismo tamaño de archivo que las cuantizaciones de referencia (unsloth). El autor reporta divergencias KL entre 4,5 y 9,4 veces menores en texto inglés para los siete ficheros publicados, y una concordancia top-1 con el modelo original de entre 91,3 % y 98,4 %. Los ficheros ocupan entre 775 MB y 1441 MB y, según el autor, todos caben en aproximadamente 3 GB de memoria con contexto de 32k.

La colección incluye además un codificador visual opcional (mmproj en F16, 0,67 GB) que habilita lectura de imágenes. La licencia es Apache 2.0, heredada del modelo base. El repo completo ocupa 8,6 GB y acumula 13 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-2B); cuantización GGUF en formato MS (Mad Shift) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración de referencia del autor); ampliable a 49.152 para prompts largos como Claude Code |
| Tipos de cuantizacion | MS5, MS4.3, MS4, MS3.7, MS3.5, MS3, MS2.7 (formato MS, requiere ms-llama.cpp); codificador visual en F16 |
| Idiomas soportados | No disponible (la calibración de la cuantización se hizo en inglés; el chino se evaluó como held-out) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato MS propietario); el codificador visual en GGUF F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer denso de 1.880 millones de parámetros. Esta publicación no entrena ni ajusta el modelo: aplica una recodificación de cuantización en el formato MS (Mad Shift) desarrollado por Matthew Priester, que requiere el fork ms-llama.cpp. Los detalles de arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) no se detallan en la información disponible. La mención de "recurrent state" en la documentación de despliegue sugiere componentes de estado recurrente en el modelo base, pero no se especifica su naturaleza exacta.

La innovación técnica destacable es el propio método de cuantización: el autor reporta que la calibración se realizó sobre texto inglés, dejando el chino deliberadamente fuera para evaluarlo como conjunto held-out. Los resultados publicados comparan la divergencia KL frente al modelo original en BF16 (media sobre cuatro textos en inglés) y la tasa de concordancia top-1 (frecuencia con la que el token más probable coincide con el del BF16). No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Lectura de imágenes mediante el codificador visual opcional mmproj-Qwen3.5-2B-F16.gguf (0,67 GB, F16), que añade entre 0,9 y 1,1 GiB de memoria GPU cuando está activo.
- Compatibilidad con API estilo OpenAI (`/v1`) y con Claude Code mediante variables de entorno `ANTHROPIC_BASE_URL` y `ANTHROPIC_AUTH_TOKEN`.
- Servicio de chat web integrado en llama-server en `http://localhost:8080`.
- Soporte de prompts largos (hasta 49.152 tokens configurados para Claude Code, cuyo prompt ronda 24k tokens).
- Capacidades multilingües: no especificadas en la información disponible; la evaluación de la cuantización cubre inglés y chino.
- Tool calling, function calling, agentes y multi-step reasoning: no disponible en la documentación proporcionada.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local en equipos con GPU consumer: cualquier fichero MS corre en aproximadamente 3 GB o menos a 32k de contexto, por lo que encaja en portátiles y estaciones con GPUs de gama media, usando ms-llama.cpp como motor.
- Asistente de chat autoalojado: llama-server expone una página de chat y una API estilo OpenAI en `http://localhost:8080/v1`, útil para prototipos y herramientas internas sin depender de servicios en la nube.
- Integración con Claude Code: configurando `ANTHROPIC_BASE_URL` hacia el servidor local y ampliando el contexto a `-c 49152`, el modelo puede atender el prompt de sistema extenso de Claude Code (unos 24k tokens) en local.
- Análisis de imágenes en local: activando el codificador visual mmproj, el modelo puede leer imágenes junto con texto, con un coste adicional de 0,9-1,1 GiB de VRAM.
- Experimentación con cuantización de bajo bit: los ficheros MS2.7 (775 MB) y MS3 (858 MB) permiten probar el límite de compresión manteniendo, según el autor, menor divergencia KL que las cuantizaciones equivalentes de unsloth.
- Pipelines que ya usan llama.cpp: las aplicaciones que gestionan llama.cpp por su cuenta pueden apuntar al binario en `%LOCALAPPDATA%\ms-llama` y cargar los ficheros MS directamente.
- Evaluación comparativa de métodos de cuantización: útil para investigadores que quieran reproducir las métricas de divergencia KL y top-1 frente a unsloth y EXL3.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización (divergencia KL frente al BF16 y concordancia top-1), no benchmarks de tareas. Los datos disponibles:

| Fichero MS | Tamano | KLD | Fichero unsloth comparable (tamano) | KLD unsloth | Ventaja MS | Top-1 MS / unsloth |
|---|---|---|---|---|---|---|
| MS5 | 1441 MB | 0,00142 | UD-Q5_K_XL (1467 MB) | 0,00640 | 4,5x menor KLD | 98,36 % / 96,41 % |
| MS4.3 | 1301 MB | 0,00219 | UD-Q4_K_XL (1340 MB) | 0,01472 | 6,7x menor KLD | 98,13 % / 94,87 % |
| MS4 | 1262 MB | 0,00270 | Q4_K_M (1281 MB) | 0,02007 | 7,4x menor KLD | 98,02 % / 93,94 % |
| MS3.7 | 1165 MB | 0,00376 | IQ4_XS (1173 MB) | 0,02756 | 7,3x menor KLD | 97,52 % / 92 % (dato truncado en la fuente) |

Datos adicionales reportados por el autor: MS4.3 (1,30 GB) supera en fidelidad al Q6_K de unsloth (1,57 GB) con 0,00219 frente a 0,00277 de KLD; MS3.5 supera a Q4_K_M con 190 MB menos. En texto chino held-out, MS aventaja a todos los ficheros unsloth emparejados por entre 1,1 y 5,0 veces. Frente a EXL3, los ficheros MS ocupan entre 39 % y 59 % del tamaño para la misma divergencia KL. La concordancia top-1 global se sitúa entre 91,3 % y 98,4 %, frente a 80,8-96,4 % de unsloth.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB o menos por fichero a 32k de contexto (estimación del autor); el fichero más pequeño (MS2.7, 775 MB) requiere bastante menos.
- Codificador visual: añade 0,9-1,1 GiB de memoria GPU cuando está activo; nada cuando está desactivado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 4-6 GB de VRAM libre debería poder cargar los ficheros; las instrucciones de instalación del motor cubren Windows con GPU NVIDIA (x64-cuda12 y arm64-cuda) y compilación desde código fuente en Linux y macOS.
- Cabe en GPU consumer: sí, por el tamaño de los ficheros (775 MB a 1441 MB) y la estimación de 3 GB con contexto completo.
- Opciones de despliegue: exclusivamente ms-llama.cpp (fork de llama.cpp del autor). Ollama, LM Studio y llama.cpp estándar no pueden cargar los ficheros MS. El servidor expone API compatible con OpenAI y página de chat.
- Paralelismo: `-np 1` recomendado; cada slot paralelo adicional necesita su propia copia del estado recurrente del modelo, lo que puede expulsar capas de la GPU y ralentizar la generación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo / coleccion | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-MS (esta ficha) | 1.880 M | 32k (hasta 49k configurable) | GGUF formato MS (requiere ms-llama.cpp) | Apache 2.0 | Hugging Face, 13 descargas |
| unsloth/Qwen3.5-2B-GGUF | 1.880 M (mismo base) | Depende de la configuracion del motor | GGUF estandar | Apache 2.0 (heredada) | Hugging Face; carga en llama.cpp, Ollama, LM Studio |
| EXL3 (UnstableLlama y conversiones propias) | 1.880 M (mismo base) | No disponible | EXL3 | No disponible | No disponible |

La diferencia clave frente a unsloth es la fidelidad por byte: según el autor, los ficheros MS logran menor divergencia KL con tamaños iguales o menores. La contrapartida es la dependencia de un motor propietario (ms-llama.cpp) y la incompatibilidad con el ecosistema estándar de llama.cpp, Ollama y LM Studio. Frente a EXL3, los ficheros MS son entre 39 % y 59 % del tamaño para la misma KL.

## Limitaciones y advertencias

- Dependencia de motor propietario: los ficheros solo cargan en ms-llama.cpp; Ollama, LM Studio y llama.cpp estándar no pueden abrirlos. Esto limita la portabilidad y ata el despliegue a un fork mantenido por un único autor.
- Calibración monolingüe: la cuantización se calibró en inglés; el chino se dejó fuera y muestra ventajas menores (1,1-5,0x frente a 4,5-9,4x en inglés). El rendimiento en otros idiomas no está evaluado.
- Codificador visual no evaluado: el mmproj F16 no forma parte de la evaluación de fidelidad y no está codificado en MS; su recodificación queda como trabajo futuro.
- Sin benchmarks de tareas: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad en tareas concretas no está documentada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de 1,88 mil millones de parámetros, es esperable una capacidad limitada en razonamiento complejo y mayor propensión a errores factuales que modelos de mayor tamaño, aunque esto no está cuantificado en la fuente.
- Paralelismo limitado: `-np 1` es la configuración recomendada; los slots paralelos adicionales degradan el rendimiento por duplicación del estado recurrente.
- Primera ejecución: la comprobación contra Hugging Face puede tardar varios minutos; en Windows puede aparecer un aviso de symlink que cae en "degraded mode" (inofensivo, pero puede duplicar espacio en disco en actualizaciones).
- Atribución: el autor solicita crédito explícito ("MS (Mad Shift) by Matthew Priester") al usar los ficheros o construir sobre el formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devvexus/Qwen3.5-2B-MS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Fork del motor (ms-llama.cpp): https://github.com/devvexus/ms-llama.cpp
- README del motor (instrucciones Linux/macOS): https://github.com/devvexus/ms-llama.cpp#readme
- Cuantizaciones de referencia unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- GitHub del autor: https://github.com/devvexus
- ORCID del autor: https://orcid.org/0009-0000-0032-5292
- Paper referenciado en tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Codificador visual (descarga directa): https://huggingface.co/devvexus/Qwen3.5-2B-MS/resolve/main/vision/mmproj-Qwen3.5-2B-F16.gguf
- Releases del motor (Windows): https://github.com/devvexus/ms-llama.cpp/releases/latest
