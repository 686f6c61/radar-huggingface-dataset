# jmcombs/Qwen3.8-27B-pi-oQ6e-mtp

## Resumen

Qwen3.8-27B-pi-oQ6e-mtp es una cuantización no oficial del modelo bytkim/Qwen3.8-27B-pi, un fine-tune orientado a tareas de agente y codificación (agentic coding) sobre Qwen/Qwen3.8-27B. La publica el usuario jmcombs en formato MLX para Apple silicon, empleando el esquema de cuantización oQ6e del proyecto oMLX (afín, group size 64, ~6,87 bits efectivos por peso). Conserva el modelo de lenguaje, el codificador visual y la cabeza MTP (multi-token prediction) de una capa, lo que permite decodificación especulativa integrada.

Su particularidad es la calibración: en lugar de usar el corpus genérico de oMLX, la matriz de importancia se calculó sobre 1.139 sesiones reales del agente Pi registradas entre septiembre y noviembre de 2026 (1.026 para calibración, 113 reservadas para evaluación). El checkpoint ocupa 23,87 GB repartidos en cinco shards de safetensors MLX y suma 27.781.427.952 parámetros. Es relevante porque demuestra que una calibración específica de dominio reduce la divergencia KL frente al modelo BF16 en texto de sesiones de agente, aunque a costa de un ligero empeoramiento en código Python genérico.

La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es image-text-to-text, por lo que admite entradas multimodales. El autor advierte explícitamente de que se trata de una cuantización no afiliada ni respaldada por bytkim, el equipo de Qwen ni el proyecto oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP de 1 capa); familia qwen3_5 |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (afín, group size 64): 88,3% de pesos lógicos a 6 bits, 9,8% a 8 bits (44 tensores sensibles), 1,9% en BF16; 6,87 bits/peso efectivos |
| Idiomas soportados | no disponible (la calibración incluye muestras fijas en alemán, francés y español además de código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors MLX (5 shards), 23,87 GB (22,23 GiB) |

Desglose por componente: modelo de lenguaje 26,896B pesos en 22,53 GB; codificador visual 0,460B en 0,92 GB; cabeza MTP 0,425B en 0,42 GB.

## Arquitectura y entrenamiento

El modelo subyacente es un transformer multimodal de la familia qwen3_5 con un codificador visual acoplado y una cabeza de predicción multi-token (MTP) de una capa, que habilita decodificación especulativa sin un modelo borrador externo. El autor indica que el modelo base bytkim/Qwen3.8-27B-pi es un fine-tune de Qwen/Qwen3.8-27B orientado al arnés de agente Pi, con capacidad de agentic coding y llamadas a herramientas en XML de Qwen. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La cuantización se realizó con oMLX 0.8.2 mediante `quantize_oq_streaming` en oQ6 con `enhanced=True` y `preserve_mtp=True`, usando 128 muestras de calibración de 2.048 tokens y streaming de los pesos BF16 reales capa a capa, sin proxy de 4 bits. La matriz de importancia se alimentó con 1.139 sesiones de agente Pi renderizadas con la plantilla de chat del propio modelo (system prompt y esquemas de herramientas reales), con bloques de razonamiento y llamadas XML incluidas; las sesiones de más de 200.000 caracteres se truncaron (280 casos). El split de calibración contiene unos 25,75M tokens. La sensibilidad por capa, que decide qué tensores van a 8 bits, se calculó con el corpus `code_multilingual` estándar de oMLX. Se generó además una compilación de control con calibración estándar y plan de bits idéntico, para aislar el efecto del texto de calibración.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking blocks), incluyendo niveles de esfuerzo alto (`xhigh`) y medio (`medium`) vistos en las sesiones de calibración.
- Codificación agéntica: uso intensivo de herramientas de shell y edición (bash, read, edit, grep, ls, write, find) y llamadas a subagentes.
- Tool calling / function calling mediante el formato XML de Qwen, con esquemas de herramientas inyectados en el prompt.
- Razonamiento multi-paso y flujos de agente con planificación y ejecución de comandos.
- Entrada de imagen y texto (pipeline image-text-to-text) gracias al codificador visual incluido.
- Decodificación especulativa integrada mediante la cabeza MTP conservada en la cuantización.
- Capacidades multilingües: no documentadas explícitamente; la calibración incorpora muestras en alemán, francés y español junto con código.

## Casos de uso

- Agente de codificación en local sobre Mac: el modelo puede ejecutar bucles de tipo ReAct con llamadas a bash, lectura y edición de ficheros, aprovechando la calibración sobre sesiones reales de Pi para mantener la fidelidad en ese dominio concreto.
- Asistente de terminal integrado: al estar cuantizado a ~6,87 bits/peso y caber en 23,87 GB, permite desplegar un agente de shell en un Mac con memoria unificada alta sin depender de la nube.
- Revisión y edición de código en repositorios: las herramientas `read`, `grep` y `edit` dominan las sesiones de calibración, por lo que el modelo está ajustado para localizar y modificar fragmentos en bases de código existentes.
- Orquestación de subagentes: el modelo invoca subagentes en aproximadamente el 6% de las llamadas de las sesiones de referencia, lo que lo hace adecuado para pipelines jerárquicos de agentes.
- Automatización de tareas de desarrollo con entrada visual: al aceptar image-text-to-text, puede analizar capturas de pantalla de errores, diagramas o interfaces junto con el código para diagnosticar problemas.
- Generación asistida con decodificación especulativa: la cabeza MTP permite acelerar la inferencia en oMLX 0.8.2 o superior, útil en entornos interactivos donde la latencia por token es crítica.
- Prototipado de agentes de investigación: la ventana de contexto no está documentada, pero el uso de sesiones largas (hasta 200.000 caracteres truncados) sugiere manejo de contextos extensos en tareas de exploración de repositorios.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al modelo BF16 (divergencia KL sobre la distribución del siguiente token, ventanas de 1.024 tokens, medidas en un M5 Max de 128 GB):

| Conjunto de prueba | Métrica | Calibración estándar oQe | Calibración con sesiones Pi (este repo) |
|---|---|---|---|
| Sesiones Pi reservadas (48 ventanas, 49.152 posiciones) | KL media | 0,0387 | 0,0355 (−8,3%) |
| | KL mediana | 0,00104 | 0,00091 |
| | KL percentil 99 | 0,332 | 0,277 |
| | Acuerdo top-1 | 96,47% | 96,52% |
| | Ventanas con menor KL | — | 39 / 48 |
| Código Python (corpus oMLX, 16 ventanas, 16.384 posiciones) | KL media | 0,0122 | 0,0153 (+26%) |
| | KL mediana | 0,000135 | 0,000122 |
| | KL percentil 99 | 0,0242 | 0,0213 |
| | Acuerdo top-1 | 98,79% | 98,64% |
| | Ventanas con menor KL | — | 12 / 16 |

El autor señala que la mejora en sesiones Pi es significativa por test de signos (p ≈ 2×10⁻⁵), pero el intervalo bootstrap del 95% para la mejora media va de −25,5% a +8,2% debido a unas pocas ventanas difíciles. En Python genérico la diferencia no es significativa (p ≈ 0,08). La KL se calcula sobre los 1.024 tokens más probables del modelo BF16 más un bucket residual (0,7% de masa media en texto Pi), por lo que es una cota inferior de la KL completa. Una repetición reprodujo todos los números exactamente. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,87 GB solo para los pesos; con overhead de contexto y caché KV conviene disponer de 32 GB o más de memoria unificada.
- Hardware objetivo: Apple silicon con MLX; las mediciones del autor se hicieron en un M5 Max de 128 GB.
- GPU NVIDIA: no es el formato nativo (safetensors MLX); requeriría conversión a otro formato, no documentada en la información disponible.
- Cabe en equipos de consumo Apple con memoria unificada alta (Mac Studio, MacBook Pro con 32-128 GB); no cabe en GPUs de consumo de 24 GB sin cuantización adicional.
- Despliegue: oMLX 0.8.2 o superior (runtime recomendado) o `mlx_vlm.load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta pruebas de velocidad de decodificación y decodificación especulativa con cuatro prompts de 3.000-6.000 tokens, temperatura 1,0, top-p 0,95, top-k 20 y caché de prefijo desactivada, pero los valores numéricos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jmcombs/Qwen3.8-27B-pi-oQ6e-mtp (este) | 27,78B | no disponible | safetensors MLX oQ6e | Apache 2.0 | Cuantización calibrada con sesiones Pi, incluye visión y MTP |
| bytkim/Qwen3.8-27B-pi (base) | no disponible | no disponible | BF16 | Apache 2.0 | Fine-tune de agente sobre Qwen3.8-27B; referencia de fidelidad |
| Qwen/Qwen3.8-27B (original) | no disponible | no disponible | no disponible | Apache 2.0 | Modelo base multimodal de la familia qwen3_5 |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación se limita a la relación de derivación entre los tres checkpoints.

## Limitaciones y advertencias

- Cuantización no oficial: no está afiliada ni respaldada por bytkim, el equipo de Qwen ni el proyecto oMLX; el autor lo declara explícitamente.
- La calibración está sesgada hacia sesiones del agente Pi: mejora la fidelidad en ese dominio pero degrada la KL media en código Python genérico (+26%), con resultados mixtos y no significativos.
- Los turnos del asistente en las sesiones de calibración provienen de modelos anteriores, no de este modelo; aproximadamente el 69% del texto es salida de herramientas.
- El modelo borrador DFlash2 para decodificación especulativa no está incluido; debe descargarse del repositorio de origen.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- Los idiomas soportados no están declarados; la cobertura multilingüe no está verificada más allá de las muestras de calibración.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un fine-tune de agente, puede generar comandos de shell incorrectos o destructivos si no se aplican salvaguardas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado.
- El formato MLX limita el despliegue a Apple silicon o a conversiones no documentadas.
- La matriz de importancia y las sesiones de calibración no se publican, lo que dificulta reproducir el proceso exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmcombs/Qwen3.8-27B-pi-oQ6e-mtp
- Modelo base del fine-tune: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador DFlash2 (en el repo de origen): https://huggingface.co/bytkim/Qwen3.8-27B-pi/tree/main/dflash2
- Runtime oMLX: https://github.com/jundot/omlx
