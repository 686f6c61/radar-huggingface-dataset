# nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-4bit-KQuant es una cuantizacion de 4 bits del modelo Qwen3.6-35B-A3B de Alibaba, empaquetada especificamente para Apple Silicon mediante la libreria MLX. La publica el usuario nace-ai y su principal valor anadido es la fidelidad de la cuantizacion: segun la model card, su variante Q4 queda 1,6 veces mas cerca del modelo original en BF16 que el paquete 4-bit de mlx-community (divergencia KL de 0,059 frente a 0,096), con el mismo tamano de pesos del modelo de lenguaje (19,51 GB).

El modelo base es un transformer con mezcla de expertos (MoE) de 35.107.181.936 parametros totales, del que solo se activa una fraccion por token (el sufijo A3B sugiere aproximadamente 3.000 millones de parametros activos). Ademas de generacion de texto, el pipeline declarado es image-text-to-text, por lo que incorpora capacidades de vision. El pack incluye dos checkpoints: Q4 (cuantizacion uniforme de 4 bits, gates del router en 8 bits) y Q5 (precision mixta de 4, 6 y 8 bits por tensor, unas 4,6 bits por peso).

La relevancia actual reside en que permite ejecutar un MoE de 35.000 millones de parametros en Macs con 48 GB o mas de memoria unificada, con un motor propio (Kapitsa) que expone APIs compatibles con OpenAI, Anthropic y Ollama, y con integracion directa en mlx-lm y LM Studio. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3.000 millones, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits uniforme, gates del router en 8 bits); Q5 (precision mixta 4/6/8 bits, ~4,6 bits por peso, 5,1 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pack MLX); repo de 44,0 GB |
| Tamano de los checkpoints | Q4: 21,0 GB; Q5: 23,0 GB |
| Memoria recomendada | 48 GB o mas (regla orientativa del autor) |
| Libreria | mlx |
| Motor propio | Kapitsa (Nace) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos, tal como indica la etiqueta `qwen3_5_moe` del repositorio. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF o DPO; esa informacion corresponde al modelo original de Qwen y no se reproduce en esta ficha por falta de datos en la informacion proporcionada.

La innovacion tecnica de este repositorio es el proceso de cuantizacion. El checkpoint Q4 aplica 4 bits uniformes a los pesos manteniendo los gates del router en 8 bits, igual que hace mlx-lm, y consigue una divergencia KL de 0,059 frente al BF16 original. El checkpoint Q5 usa precision mixta con asignacion de 4, 6 u 8 bits por tensor segun su sensibilidad, lo que arroja una media de aproximadamente 4,6 bits por peso y reduce la KL a 0,027. El autor advierte que la puntuacion de Q5 se calculo sobre token IDs distintos a los demas, por lo que no reclama una mejora emparejada frente a Q4. El modelo incorpora modo de razonamiento (thinking) activado por defecto, desactivable mediante `reasoning_effort: none` o `enable_thinking: false`.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Razonamiento explicito con modo thinking por defecto; la traza se devuelve en el campo `reasoning_content` (API Kapitsa) o `reasoning` (mlx-lm).
- Comprension de imagenes: pipeline `image-text-to-text`, acepta imagenes como URL http(s) o data URL en base64.
- Tool calling / function calling: verificado en el pack mediante `mlx_lm.server` y LM Studio.
- Razonamiento matematico basico y calculo (ejemplo de referencia: 17 * 23).
- Soporte de agentes y razonamiento multi-paso a traves del modo thinking y del tool calling.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad con APIs OpenAI, Anthropic y Ollama mediante el motor Kapitsa.

## Casos de uso

- Asistente local en Mac: un desarrollador con un Mac de 48 GB o mas puede servir el modelo con `kapitsa serve --model 35b:4bit` y obtener un chat privado en localhost, sin enviar datos a la nube, con APIs compatibles con OpenAI y Anthropic.
- Automatizacion de soporte tecnico con vision: el modelo acepta capturas de pantalla o fotos como `image_url` y puede describir errores, leer interfaces o interpretar documentacion escaneada dentro de un flujo conversacional.
- Agentes con herramientas en pipelines internos: gracias al tool calling verificado en `mlx_lm.server`, se puede conectar el modelo a funciones locales (consulta de bases de datos, ejecucion de scripts) y orquestar tareas de varios pasos.
- Prototipado de aplicaciones LLM en Apple Silicon: el pack MLX permite iterar en un Mac antes de desplegar en infraestructura GPU, usando la misma interfaz OpenAI y comparando la fidelidad de Q4 y Q5 frente al BF16.
- Analisis de documentos con imagenes: extraccion de informacion de facturas, formularios o diagramas combinando entrada visual y razonamiento textual en una sola llamada.
- Razonamiento asistido con traza auditable: al devolver el pensamiento en `reasoning_content`, resulta util en entornos donde se necesita revisar el proceso de razonamiento (educacion, validacion de calculos, depuracion de prompts).
- Inferencia offline en portatiles: al caber en 48 GB de memoria unificada, permite trabajar sin conexion en entornos con restricciones de red.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de cuantizacion (divergencia KL frente al BF16), no resultados de benchmarks de tareas.

| Metrica | Q4 (Nace) | Q5 (Nace) | mlx-community 4-bit |
|---|---|---|---|
| Divergencia KL a BF16 (menor es mejor) | 0,059 | 0,027 | 0,096 |
| Tamano de pesos del modelo de lenguaje | 19,51 GB | no disponible | 19,51 GB |
| Tamano de descarga | 21,0 GB | 23,0 GB | no disponible |
| Bits por peso | 4 (router 8) | ~4,6 (5,1 con escalas) | 4 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: 48 GB o mas de memoria unificada segun la regla del autor (el 66 % de la RAM en macOS debe cubrir la descarga mas 2 GB para la conversacion). Kapitsa puede encajar en una talla menos al omitir partes no usadas; `kapitsa doctor` verifica un Mac concreto.
- VRAM estimada en GPU dedicada: no disponible; el pack esta pensado para Apple Silicon.
- GPU recomendadas: no aplica; requiere chip Apple (serie M) con memoria unificada. En GPU NVIDIA no se ha validado en la informacion proporcionada.
- Cabe en GPU de consumo: si, en Macs con 48 GB o mas de memoria unificada; no cabe en configuraciones de 16 o 24 GB.
- Opciones de despliegue: Kapitsa (servidor con APIs OpenAI, Anthropic y Ollama), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080) y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Fidelidad (KL a BF16) | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Nace Qwen3.6-35B-A3B Q4 | 35,1 B (MoE) | no disponible | 4 bits | 0,059 | Apache 2.0 | Apple Silicon (MLX) |
| Nace Qwen3.6-35B-A3B Q5 | 35,1 B (MoE) | no disponible | ~4,6 bits mixta | 0,027 | Apache 2.0 | Apple Silicon (MLX) |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1 B (MoE) | no disponible | 4 bits | 0,096 | Apache 2.0 | Apple Silicon (MLX) |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1 B (MoE) | no disponible | 3 bits | no disponible | Apache 2.0 | Multiplataforma |

La comparativa se limita a variantes cuantizadas del mismo modelo base, que es lo que documenta la model card. No se dispone de datos para comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Solo Apple Silicon: el pack usa la libreria MLX y no es directamente utilizable en GPU NVIDIA, AMD ni en CPU x86 convencional.
- Requiere 48 GB o mas de memoria unificada; en Macs de 32 GB o menos no cabe con holgura.
- La fidelidad de Q5 (KL 0,027) se midio sobre token IDs distintos a los de Q4 y mlx-community, por lo que no es una comparacion emparejada.
- El autor solo verifico en este pack un chat y un tool calling con mlx-lm 0.32.2, y un chat, lectura de imagen y tool calling con LM Studio; el resto de ejemplos de la model card se probaron unicamente en el pack de 9B.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Longitud de contexto: no disponible, lo que impide planificar cargas de documentos largos con garantias.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B y de las dependencias (mlx-lm, Kapitsa) por separado.
- El modo thinking esta activado por defecto y consume tokens adicionales; en produccion conviene desactivarlo o limitar `max-tokens` para controlar coste y latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalacion de Kapitsa via Homebrew: https://github.com/nace-ai/tap
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai
- Variante mlx-community 4-bit (referencia de comparacion): no disponible en la informacion proporcionada
- Variante unsloth UD-3bit (referencia de comparacion): no disponible en la informacion proporcionada
