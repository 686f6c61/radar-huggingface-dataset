# Jeesup/svd-safety-l2_svdllmwjsep512_r50

## Resumen

`svd-safety-l2_svdllmwjsep512_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM, una tecnica de compresion de matrices por descomposicion en valores singulares. El autor, Jeesup, lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo de chat de proposito general.

El checkpoint reduce el modelo denso al 50,0 % de sus parametros (fraccion resultante 0,4999) y aplica una recuperacion posterior con LoRA en dos etapas (U y V secuenciales) sobre `alpaca-cleaned`. La calibracion combina una parte de utilidad (WikiText-2) y una parte de seguridad (respuestas de rechazo del propio Llama-2-7b-chat ante 512 prompts de WildJailbreak), con una cuota efectiva de seguridad del 26,39 % de las posiciones.

Su relevancia es metodologica: permite medir el trade-off entre utilidad y seguridad bajo compresion con metricas concretas (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard, perplejidad en WikiText-2 y exactitud zero-shot en 7 tareas). Es una celda de una rejilla experimental, no un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (aprox. 6,74 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B chat: un transformer decoder-only denso. Sobre ella se aplica SVD-LLM, que descompone las matrices de pesos mediante SVD con un SVD blanqueado (whitened SVD) calculado sobre un conjunto de calibracion agrupado. La matriz de calibracion se define como S S^T = suma sobre WikiText de x x^T mas suma sobre seguridad de x x^T. La parte de utilidad usa el train de WikiText-2 con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales daninos) con los rechazos generados por el propio Llama-2-7b-chat, una conversacion por muestra, 187.197 posiciones en total. La cuota efectiva de seguridad resulta ser 0,2639 de las posiciones.

Tras la compresion al 50,00 % de parametros se aplica la recuperacion de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. La semilla global es 42. No se documenta en la informacion disponible el uso de RLHF o DPO adicionales mas alla del alineamiento heredado del modelo base.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-2-7b-chat y parcialmente preservada tras la compresion.
- Razonamiento y respuesta a instrucciones en el rango esperado para un 7B comprimido al 50 %.
- Comportamiento de rechazo ante peticiones daninas, medido con AdvBench (ASR 0,0038) y StrongREJECT (ASR 0,0032) bajo el juez de HarmBench.
- Soporte de tool calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base Llama 2 no esta optimizado para ello.
- Capacidades multilingues: no documentadas; los idiomas figuran como no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda de control para medir cuanto degrada la compresion SVD el comportamiento de rechazo respecto al modelo denso original, comparando ASR en AdvBench y StrongREJECT.
- Estudio de reglas de seleccion de componentes: comparar esta configuracion (calibracion agrupada utilidad + seguridad, 50 % de presupuesto) con otras celdas de la rejilla para identificar que regla repara mejor la seguridad tras la compresion.
- Analisis de sobre-rechazo: emplear la metrica de sobre-rechazo macro en WildGuard (0,6961) para estudiar el coste en utilidad de las estrategias de recuperacion de seguridad.
- Evaluacion de recuperacion con LoRA: reproducir el pipeline de etapa 2 (LoRA secuencial U y V sobre alpaca-cleaned, r=8) y medir su efecto en perplejidad de WikiText-2 (13,8418) y exactitud zero-shot (0,4504 en 7 tareas).
- Benchmarking de tecnicas de compresion: usar el checkpoint como referencia de SVD-LLM frente a otras tecnicas (poda, cuantizacion) en terminos de parametros retenidos y metricas de seguridad y utilidad.
- Docencia y divulgacion: ilustrar con cifras concretas el trade-off entre eficiencia y alineamiento en modelos comprimidos, sin desplegarlo como asistente real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0032 |
| Sobre-rechazo macro (WildGuard) | 0,6961 |
| Perplejidad en WikiText-2 | 13,8418 |
| Exactitud media zero-shot (7 tareas, acc_norm donde aplica) | 0,4504 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estas mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB de pesos, mas overhead de activaciones y cache KV; se recomienda al menos 16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits, aproximadamente 4-5 GB (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requeriria cuantizacion, no documentada para este checkpoint.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, no incluidos en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep512_r50 | 6,74 mil millones (50 % denso) | no disponible | Llama 2 Community | Checkpoint de investigacion comprimido con SVD-LLM |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones (denso) | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del autor | variable | no disponible | Llama 2 Community | Distintas reglas de seleccion y presupuestos de compresion |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor advierte explicitamente que no es un modelo de chat de proposito general y que no debe desplegarse como asistente.
- Seguridad degradada por diseno en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataques; este checkpoint debe evaluarse antes de extraer conclusiones.
- Sobre-rechazo elevado: la metrica macro en WildGuard es 0,6961, lo que indica una tendencia alta a rechazar peticiones legitimas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; esperable en un 7B comprimido al 50 %.
- Idiomas soportados no documentados; el comportamiento multilingue puede degradarse respecto al modelo base.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial esta sujeto a dichos terminos y a la politica de uso aceptable.
- Trazabilidad limitada: solo 5 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep512_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset WildJailbreak: https://huggingface.co/datasets/allenai/wildjailbreak
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- WildGuard: https://huggingface.co/allenai/wildguard
