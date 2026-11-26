# sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantización de 4 bits de `Qwen/Qwen3.8-27B`, un modelo multimodal (image-text-to-text) de la familia Qwen 3.8 con 27.356.728.560 parámetros totales. La publica el usuario `sady4850` bajo licencia Apache 2.0, y su particularidad es que el proceso de cuantización GPTQ se ha calibrado parcialmente con trazas reales de agentes de código, en lugar de usar solo texto genérico. El objetivo es preservar la fidelidad del comportamiento agéntico (razonamiento y llamadas a herramientas) tras reducir los pesos a 4 bits.

El resultado se empaqueta en el formato afín de MLX (grupo de 64), de modo que es intercambiable con los checkpoints `mlx-community/Qwen3.8-27B-4bit` y `mlx-community/Qwen3.8-27B-GPTQ-4bit`: mismos tensores, formas, dtypes y tamaño (15 GB), pero con valores distintos dentro de los tensores de 4 bits. Está pensado para ejecutarse en Apple Silicon mediante `mlx-vlm` y el agente Splash.

Su relevancia es doble: por un lado demuestra una técnica de cuantización orientada a cargas agénticas; por otro, ofrece métricas de divergencia (KLD, tasa de "misma llamada") frente a bf16 que permiten evaluar la pérdida de calidad de forma cuantitativa, algo poco habitual en cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.8; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las evaluaciones usan secuencias de hasta 44,6K tokens) |
| Tipos de cuantizacion | 4 bits afín MLX (group size 64), GPTQ sobre formato afín; 497 lineales recuantizados (64 capas, incluida `lm_head`); embedding y torre de visión sin tocar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit; repo de 16,1 GB |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer multimodal de 27,36 mil millones de parámetros que procesa imagen y texto. Sobre él se aplica una cuantización GPTQ de 4 bits adaptada al formato afín de MLX: las escalas de grupo y el sesgo se derivan de los pesos actualizados por error, se redondean a bf16 antes de codificar, y las matrices de Hessian provienen del modelo bf16, con un amortiguamiento de 0,01 y bloques de 128. Se recuantizan 497 capas lineales en las 64 capas, incluida la cabeza de salida; el embedding y la torre de visión se heredan del checkpoint plantilla.

La innovación está en la calibración: 120 fragmentos de 2048 tokens, de los cuales 40 son conversaciones de UltraChat (train), 40 son texto de `calibration_v5` y 40 son trazas de agente de código generadas por el propio Qwen3.8-27B en bf16 (razonamiento bajo y medio) sobre la mitad de calibración de las tareas DeepSWE, renderizadas tal como las ve el modelo (system prompt, herramientas, razonamiento, llamadas y salidas de herramienta). Es decir, un tercio del presupuesto de calibración se sustituye por datos agénticos para reducir el error en ese dominio.

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text): acepta imágenes y texto como entrada.
- Razonamiento explícito con modos de pensamiento (bajo, medio, alto/xhigh), según las trazas usadas en la evaluación.
- Llamadas a herramientas (tool calling / function calling) con formato de agente: el modelo emite turnos con llamadas estructuradas.
- Comportamiento agéntico multi-paso: razonamiento, invocación de herramienta, lectura de salida y continuación del bucle.
- Generación y edición de código en el contexto de agentes de programación (harness Pi y omp).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con `mlx-vlm` y con el agente Splash; compatible como reemplazo directo del checkpoint `mlx-community/Qwen3.8-27B-4bit`.

## Casos de uso

- Agentes de código en local sobre Apple Silicon: el checkpoint está calibrado con trazas de agente y mantiene mejor la distribución de tokens de razonamiento y de llamadas a herramientas, lo que reduce la deriva en bucles largos de edición de código.
- Sustitución directa en Splash: basta cambiar el repo id por `sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix` para obtener la misma velocidad y tamaño que la plantilla con menor divergencia respecto a bf16.
- Automatización de tareas de ingeniería (ETL, pipelines de configuración): las sesiones de evaluación del agente omp cubren problemas tipo `etl` y `cfgpipe`, representativos de este uso.
- Asistentes con visión en el dispositivo: al conservar la torre de visión del modelo base, puede procesar capturas, diagramas o documentos escaneados junto a instrucciones de texto.
- Evaluación de cuantizaciones: sirve como referencia metodológica para medir KLD y tasa de coincidencia de llamadas frente a bf16 en cargas agénticas.
- Prototipado de agentes con ventanas largas: las pruebas incluyen secuencias de hasta 44,6K tokens, adecuadas para sesiones con historial y salidas de herramientas extensas.
- Despliegue en portátiles Mac con memoria unificada: 15 GB de pesos permiten ejecutar el modelo en equipos de gama alta de Apple sin GPU dedicada.

## Benchmarks y rendimiento

Los datos publicados comparan la divergencia respecto al modelo bf16 (KLD de la distribución del siguiente token) y la tasa de "misma llamada" (coincidencia del top-1 en todos los tokens de una llamada a herramienta). Protocolo teacher-forced en A100, con todos los checkpoints desquantizados al mismo modelo bf16.

Conjunto de agente DeepSWE (49 tareas, 1,13M tokens, 509 turnos con llamada):

| Modelo | KLD razonamiento | p99 | KLD llamada | p99 | Misma llamada |
|---|---|---|---|---|---|
| `mlx-community/Qwen3.8-27B-4bit` (RTN) | 0,0387 | 0,315 | 0,0091 | 0,183 | 47,3% |
| `mlx-community/Qwen3.8-27B-GPTQ-4bit` (GPTQ) | 0,0260 | 0,216 | 0,0060 | 0,122 | 54,4% |
| este repo | 0,0176 | 0,147 | 0,0045 | 0,084 | 59,9% |

Sesiones reales del agente omp (40 sesiones, 1,63M tokens, 1260 turnos con llamada, 363K filas puntuadas):

| Modelo | KLD total | p99 | KLD texto | KLD llamada | Top-1 flips | Misma llamada |
|---|---|---|---|---|---|---|
| RTN | 0,0116 | 0,190 | 0,0359 | 0,0081 | 2,03% | 33,5% |
| GPTQ | 0,0079 | 0,131 | 0,0244 | 0,0055 | 1,66% | 38,5% |
| este repo | 0,0064 | 0,106 | 0,0198 | 0,0045 | 1,53% | 41,6% |

Texto general (wikitext-2 y UltraChat test, 30 fragmentos de 2048 tokens):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | RTN | 0,0554 | 0,0228 | 0,433 | 9,53% | 6,484 |
| wiki | GPTQ | 0,0367 | 0,0122 | 0,313 | 7,41% | 6,473 |
| wiki | este repo | 0,0391 | no disponible | no disponible | no disponible | no disponible |

Intervalos de confianza al 95% (bootstrap pareado): frente a GPTQ, KLD de razonamiento -32% [-34%, -31%], KLD de llamada -26% [-30%, -21%] y misma llamada +5,5 [+1,4, +9,6] puntos en DeepSWE; KLD total -18,9% [-20,4%, -17,3%] y misma llamada +3,1 [+0,7, +5,4] puntos en omp. Frente a RTN, KLD -44,4% [-45,3%, -43,5%] y misma llamada +8,1 [+5,9, +10,2] puntos. Como referencia, el bf16 greedy reproduce la llamada registrada en el 30,3% de los turnos (las trazas se muestrearon con temperatura 1,0). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos de 15 GB en 4 bits; el repo completo ocupa 16,1 GB.
- VRAM/memoria unificada estimada: en torno a 16-20 GB para inferencia con contexto moderado; más para ventanas de decenas de miles de tokens.
- GPU recomendadas: no se especifican en la información; el formato MLX está orientado a Apple Silicon (las sesiones omp se sirvieron en un M1 Pro).
- Cabe en GPU de consumo con 24 GB (RTX 3090/4090) solo si se convierte el formato, ya que el checkpoint es MLX; en Apple Silicon encaja en equipos con 32 GB o más de memoria unificada.
- Despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`) y el agente Splash. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor afirma que la velocidad es la misma que la plantilla `mlx-community/Qwen3.8-27B-4bit`.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Calibración | KLD razonamiento (DeepSWE) | Misma llamada | Licencia |
|---|---|---|---|---|---|---|
| este repo | 27,36B | 4-bit GPTQ afín MLX | UltraChat + calibration_v5 + trazas de agente | 0,0176 | 59,9% | Apache 2.0 |
| `mlx-community/Qwen3.8-27B-GPTQ-4bit` | 27,36B | 4-bit GPTQ | sin trazas de agente | 0,0260 | 54,4% | Apache 2.0 |
| `mlx-community/Qwen3.8-27B-4bit` | 27,36B | 4-bit RTN | no aplica | 0,0387 | 47,3% | Apache 2.0 |
| `Qwen/Qwen3.8-27B` (bf16) | 27,36B | bf16 | no aplica | 0 (referencia) | 30,3% (greedy) | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo nuevo: hereda todas las capacidades y sesgos del modelo base `Qwen/Qwen3.8-27B`; los sesgos concretos no se detallan en la información disponible.
- Riesgo de alucinación propio del modelo base; la cuantización añade divergencia respecto a bf16, mayor en texto general (wiki) que en cargas agénticas.
- En wikitext-2 el KLD es ligeramente peor que el GPTQ publicado (0,0391 frente a 0,0367), según el propio autor.
- La calibración está sesgada hacia agentes de código (Pi, DeepSWE); el rendimiento en otros dominios puede no mejorar respecto a la plantilla.
- Las tasas de "misma llamada" son bajas en llamadas largas de edición de código: un solo token distinto invalida la coincidencia.
- El formato es MLX; no es directamente utilizable en ecosistemas CUDA sin conversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base.
- Idiomas soportados y longitud de contexto oficial no documentados en esta ficha.
- Modelo comunitario con 251 descargas y 0 likes: sin validación independiente de las métricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla MLX 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Plantilla GPTQ 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Dataset de trazas DeepSWE: https://huggingface.co/datasets/kaitchup/DeepSWE1.1-trajectories-Qwen3.8-27B
- Agente Splash: https://github.com/paperniuk/splash
- Agente omp: https://github.com/can1357/oh-my-pi
- Librería mlx-vlm: no disponible como enlace directo en la información proporcionada
