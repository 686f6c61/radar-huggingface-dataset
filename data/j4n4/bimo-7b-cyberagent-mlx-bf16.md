# j4n4/Bimo-7B-CyberAgent-MLX-bf16

## Resumen

Bimo-7B-CyberAgent-MLX-bf16 es una conversion al formato MLX del modelo iBimo-o/Bimo-7B-CyberAgent, un fine-tune de Qwen/Qwen2.5-Coder-7B-Instruct desarrollado por Saim Azam y orientado a auditoria de ciberseguridad defensiva, triaje de vulnerabilidades y tool calling multi-turno en JSON. Esta variante concreta ha sido publicada por el usuario j4n4 y mantiene los pesos en bfloat16 sin cuantizacion, lo que la convierte en la referencia de maxima fidelidad de la familia MLX del modelo para Apple Silicon.

El modelo conserva la arquitectura Qwen2ForCausalLM con 7.615.616.512 parametros (7,62B) y una ventana de contexto de 32.768 tokens extendida mediante YaRN. Su proposito es servir como asistente especializado en tareas de seguridad: revision de codigo en busca de inyecciones, identificacion de patrones de ataque, generacion de mitigaciones y ejecucion de flujos de agente con llamadas a herramientas.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo especializado en ciberseguridad de forma local en Macs con Apple Silicon; por otro, al ser una conversion bf16 sin perdida, sirve como linea base de evaluacion y como punto de partida para fine-tuning LoRA posterior en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (extension YaRN) |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; la familia incluye variantes MLX de 8-bit, OptiQ-8bit, 6-bit, OptiQ-4bit y 4-bit |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 7,62B parametros y atencion causal estandar. La ventana de contexto nativa se ha extendido hasta 32.768 tokens mediante YaRN (Yet another RoPE extensioN), una tecnica de interpolacion del codificado posicional rotatorio que permite ampliar el contexto sin reentrenar desde cero. El modelo base es Qwen2.5-Coder-7B-Instruct, sobre el que se aplico un fine-tune por parte de Saim Azam.

Segun la informacion disponible, el ajuste se realizo sobre tres conjuntos de datos: Vyber07/cyber-security (datos de dominio de ciberseguridad), cx-cmu/agent_trajectories (trayectorias de agentes) y NousResearch/hermes-function-calling-v1 (llamadas a funciones). No se especifican en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La conversion a MLX se realizo con `mlx-lm 0.32.2` mediante `mlx_lm.convert --dtype bfloat16`, sin cuantizacion de pesos.

## Capacidades

- Generacion de texto y razonamiento tecnico en el dominio de ciberseguridad.
- Auditoria de codigo: identificacion de inyecciones SQL, SSRF, XSS y patrones de vulnerabilidad similares.
- Triaje de vulnerabilidades y propuesta de mitigaciones.
- Tool calling y function calling en JSON, con soporte multi-turno.
- Capacidades de agente: razonamiento multi-paso y ejecucion de trayectorias con herramientas.
- Generacion de codigo, heredada del modelo base Qwen2.5-Coder.
- Contexto largo de 32.768 tokens gracias a YaRN, adecuado para analisis de ficheros y trazas extensas.
- Soporte multilingue limitado al ingles segun la model card.

## Casos de uso

- Revision de codigo en pipelines de CI/CD: el modelo puede analizar diffs y fragmentos de codigo en busca de inyecciones SQL, SSRF o XSS, y devolver la vulnerabilidad junto con un parche propuesto, integrándose como paso de pre-merge.
- Triaje automatizado de hallazgos de SAST/DAST: dado un informe de escaneo, el modelo clasifica la severidad, descarta falsos positivos y redacta una recomendacion de remediacion en formato estructurado.
- Asistente de auditoria para equipos defensivos: conversaciones multi-turno sobre politicas de seguridad, configuracion de cortafuegos o endurecimiento de sistemas, aprovechando la ventana de 32K tokens para adjuntar configuraciones completas.
- Agente de respuesta a incidentes: con tool calling en JSON, el modelo puede encadenar consultas a APIs de SIEM, tickets o repositorios para recopilar contexto y proponer acciones de contencion.
- Generacion de pruebas de seguridad y casos de test: a partir de una funcion, produce casos que ejercitan entradas maliciosas y valida que las mitigaciones funcionan.
- Formacion y concienciacion: generacion de escenarios de ejemplo y explicaciones didacticas sobre clases de vulnerabilidad, ejecutables localmente en un Mac sin enviar datos a la nube.
- Fine-tuning LoRA downstream: al ser una conversion bf16 sin perdida, sirve como base para adaptar el modelo a dominios concretos (por ejemplo, normativa local o stack tecnologico propio) en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye mediciones de rendimiento de inferencia en Apple M1 Max (64 GB de memoria unificada) con `mlx 0.32.5` / `mlx-lm 0.32.2`, temperatura 0.0 y 128 tokens maximos de generacion:

| Variante | Tamano en disco | RAM pico | Prompt (tok/s) | Generacion (tok/s) |
|---|---|---|---|---|
| BF16 (este repo) | 14,20 GB | 15,35 GB | 230,3 | 22,95 |
| OptiQ-8bit | 8,95 GB | 9,76 GB | 221,4 | 36,96 |
| 8-bit | 7,55 GB | 8,24 GB | 203,8 | 41,63 |
| 6-bit | 5,77 GB | 6,38 GB | 212,6 | 53,10 |
| OptiQ-4bit | 5,08 GB | 5,67 GB | 233,8 | 60,51 |
| 4-bit | 4,00 GB | 4,54 GB | 295,2 | 72,96 |

## Requisitos de hardware

- VRAM/RAM unificada estimada: alrededor de 15,35 GB de pico en la variante bf16, segun la medicion del autor en M1 Max.
- Macs recomendados: equipos con 32 GB o mas de memoria unificada; el autor indica que es la variante adecuada para Macs de 32 GB+.
- Cabe en GPU de consumo: si, mediante las variantes cuantizadas de la familia (4-bit ocupa 4,00 GB en disco y 4,54 GB de pico), aptas para Macs con 16 GB.
- Despliegue: `mlx-lm` (CLI, Python y servidor compatible con la API de OpenAI mediante `mlx_lm.server`). No esta pensado para vLLM, TGI ni llama.cpp por estar en formato MLX.
- Throughput medido (M1 Max, 64 GB): 230,3 tok/s de prompt y 22,95 tok/s de generacion en bf16; hasta 295,2 tok/s de prompt y 72,96 tok/s de generacion en la variante 4-bit.
- Latencia: no se proporcionan datos de latencia absoluta; los tok/s anteriores permiten estimarla segun la longitud de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bimo-7B-CyberAgent-MLX-bf16 (este) | 7,62B | 32.768 (YaRN) | Apache 2.0 | MLX safetensors bf16 | Especializado en ciberseguridad defensiva; solo ingles |
| iBimo-o/Bimo-7B-CyberAgent | 7,62B | 32.768 (YaRN) | Apache 2.0 | safetensors | Modelo original del que deriva esta conversion |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,62B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades generales de codigo sin especializacion en seguridad |
| Variantes MLX del mismo modelo (8-bit, 6-bit, 4-bit, OptiQ) | 7,62B | 32.768 (YaRN) | Apache 2.0 | MLX safetensors cuantizado | Mismo modelo con menor huella y mayor velocidad de generacion |

No se dispone de datos de benchmarks que permitan comparar la calidad de este modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo de 7B, puede inventar CVE, funciones de API o mitigaciones inexistentes; toda salida debe validarse por un profesional.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Uso dual: el modelo esta orientado a auditoria defensiva, pero un modelo especializado en vulnerabilidades puede emplearse con fines ofensivos; el autor restringe explicitamente su uso a auditoria autorizada, ingenieria defensiva e investigacion educativa.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion del modelo original y del modelo base Qwen.
- Formato MLX: no es directamente portable a ecosistemas CUDA; para GPU NVIDIA seria necesario recurrir a los pesos originales o a conversiones GGUF/safetensors estandar.
- Contexto YaRN: la extension a 32K puede degradar la calidad en posiciones muy alejadas del inicio; no se documentan evaluaciones especificas de recuperacion en contexto largo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria de la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-bf16
- Modelo original: https://huggingface.co/iBimo-o/Bimo-7B-CyberAgent
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Variante OptiQ-8bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-8bit
- Variante 8-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-8bit
- Variante 6-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-6bit
- Variante OptiQ-4bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-4bit
- Variante 4-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-4bit
- Dataset Vyber07/cyber-security: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset cx-cmu/agent_trajectories: https://huggingface.co/datasets/cx-cmu/agent_trajectories
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
