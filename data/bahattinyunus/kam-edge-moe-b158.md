# bahattinyunus/kam-edge-moe-b158

## Resumen

KAM-Edge-MoE-v2 BitNet b1.58 es un modelo de generación de texto publicado por Bahattin Yunus Çetin (@bahattinyunus) en Hugging Face. Según su model card, se presenta como un "motor cognitivo" para sistemas de defensa autónomos y despliegue en *edge-AI* (drones, vehículos no tripulados, estaciones de guerra electrónica) que operan en entornos aislados (*air-gapped*). Combina, siempre según la documentación del autor, una arquitectura híbrida de convolución 1D, atención de ventana deslizante (SWA) y un *liquid-SSM* resuelto con Runge-Kutta de cuarto orden, junto con una mezcla de expertos (MoE) de 8 expertos con selección Top-2 y pesos ternarios BitNet b1.58 ({-1, 0, +1}).

El modelo se distribuye en formato GGUF y está pensado para ejecutarse con Ollama mediante un único comando. La model card declara un tamaño de "848 parámetros ternarios" y una compresión de 10,13x, además de afirmar un 100 % de acierto en un benchmark propio (`evaluate_kam.py`, 23/23 tests). Estos datos proceden exclusivamente de la documentación del autor y no se han podido verificar de forma independiente.

La relevancia del modelo radica en su propuesta de cuantización ternaria extrema y su orientación a inferencia local en hardware de bajos recursos, aunque el repositorio no contiene pesos descargables (tamaño de 0,0 GB) y no hay descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Conv1D + SWA (sliding window attention) + liquid-SSM con solver RK4, con MoE de 8 expertos (Top-2) |
| Parametros totales | 848 parámetros ternarios (según model card; no verificable) |
| Parametros activos | Top-2 de 8 expertos (número de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria BitNet b1.58 ({-1, 0, +1}); formato GGUF |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para Ollama); repositorio sin pesos publicados (0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una combinación poco convencional de varios componentes: una capa Conv1D, atención de ventana deslizante (SWA) y un *liquid neural network* implementado como SSM con integración Runge-Kutta de cuarto orden (RK4 LTC). Sobre esta base se añade una mezcla de expertos con 8 expertos y enrutamiento Top-2. Los pesos son ternarios según el esquema BitNet b1.58, lo que según el autor permite una compresión de memoria de 10,13x y un ahorro energético de 4,6x.

El autor menciona además componentes externos al modelo en sí, como integración con eBPF a nivel de kernel, un principio de inferencia activa basado en energía libre de Friston, un escudo de seguridad neuro-simbólico con funciones de barrera de control (CBF) y mutación de código en vivo mediante JIT C++20. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el proceso de destilación o conversión a GGUF.

## Capacidades

- Generación de texto en turco e inglés.
- Razonamiento orientado a tareas de defensa y *edge-AI* según la model card (clasificación de radar EW, planificación de misiones).
- Soporte declarado de *tool calling* implícito mediante integración con eBPF y JIT C++20 (no documentado como API estándar).
- Capacidades de agente y razonamiento multi-paso según el autor (descomposición de intención en grafos de tareas DAG).
- Aprendizaje online con olvido destructivo evitado (Dirichlet online) según la documentación.
- Modo de "pensamiento" o reflexión: no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- **Clasificación de señales de guerra electrónica en edge**: según el autor, el modelo analiza parámetros de pulso radar (RF, PRI, PW, AOA) y sintetiza engaños DRFM; su tamaño ternario permitiría ejecutarlo en hardware embarcado sin conexión a la nube.
- **Planificación de misiones multi-dron**: la model card describe la descomposición de intención de un comandante en un grafo DAG de tareas (SEAD, relay, strike, ISR) y su asignación a una flota heterogénea.
- **Asistente de operaciones en entornos air-gapped**: al ejecutarse localmente con Ollama, podría usarse en instalaciones sin conectividad, aunque la falta de pesos publicados impide confirmarlo.
- **Generación de código para sistemas embebidos**: la integración declarada con JIT C++20 y eBPF sugiere uso en pipelines de mutación de código en caliente, aunque no hay evidencia de calidad en generación de código.
- **Prototipado de agentes con inferencia activa**: investigadores interesados en el principio de energía libre de Friston podrían usar el modelo como referencia conceptual, si bien no hay artefactos que lo respalden.
- **Telemetría y monitorización de kernel**: la integración con eBPF (`kprobe`, `tracepoint`, `thermal_zone`) apunta a casos de observabilidad en sistemas Linux embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente declara un "100,0/100" en un script propio (`evaluate_kam.py`, 23/23 tests unitarios y de integración), sin comparación con modelos de referencia ni metodología reproducible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio no contiene pesos (0,0 GB).
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño declarado (848 parámetros ternarios) sugeriría un consumo mínimo, pero no hay artefactos que lo verifiquen.
- Opciones de despliegue: Ollama (`ollama run hf.co/bahattinyunus/kam-edge-moe-b158` según la model card); vLLM, llama.cpp o TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KAM-Edge-MoE-v2 BitNet b1.58 | 848 (ternarios, según autor) | no disponible | Apache 2.0 | GGUF | Repositorio sin pesos (0,0 GB) |
| BitNet b1.58 (Microsoft Research) | 700M / 1.3B / 3B / 3.9B | 2048 tokens (paper) | MIT (código) | safetensors / GGUF | Pesos publicados |
| Qwen 2.5 1.5B | 1.500M | 32.768 tokens | Apache 2.0 | safetensors / GGUF | Pesos publicados |
| SmolLM2 1.7B | 1.700M | 8.192 tokens | Apache 2.0 | safetensors / GGUF | Pesos publicados |

La comparación es orientativa: los tres modelos de referencia tienen pesos verificables y benchmarks publicados, mientras que KAM-Edge-MoE-v2 no ofrece ninguno de los dos.

## Limitaciones y advertencias

- **Ausencia de pesos**: el repositorio tiene un tamaño de 0,0 GB; no es posible descargar ni ejecutar el modelo tal y como se anuncia.
- **Datos no verificables**: el tamaño de 848 parámetros ternarios, la compresión de 10,13x y el 100 % en benchmarks propios proceden únicamente de la model card y no se han replicado de forma independiente.
- **Riesgo de alucinación**: no evaluado; un modelo de este tamaño tendría una capacidad de razonamiento muy limitada en comparación con modelos de miles de millones de parámetros.
- **Sesgos**: no documentados.
- **Idiomas**: solo turco e inglés; no hay soporte declarado de castellano.
- **Licencia**: Apache 2.0 permite uso comercial, pero el uso en sistemas de defensa autónomos plantea cuestiones éticas y regulatorias que la licencia no cubre.
- **Contexto**: longitud de contexto no especificada, lo que impide evaluar su idoneidad para conversaciones multi-turno.
- **Madurez**: cero descargas y cero valoraciones en Hugging Face; proyecto en fase muy temprana o de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bahattinyunus/kam-edge-moe-b158
- Perfil del autor en Hugging Face: https://huggingface.co/bahattinyunus
- Repositorio GitHub declarado: https://github.com/bahattinyunus/kam
- Perfil GitHub del autor: https://github.com/bahattinyunus
- Modelos relacionados de la flota KAM (según model card): https://huggingface.co/bahattinyunus/kam-apex-8b-gguf, https://huggingface.co/bahattinyunus/kam-7b-gguf, https://huggingface.co/bahattinyunus/kam-r1-gguf, https://huggingface.co/bahattinyunus/kam-coder-7b-gguf, https://huggingface.co/bahattinyunus/kam-r1-nano-1.5b-gguf, https://huggingface.co/bahattinyunus/kam-coder-nano-1.5b-gguf, https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
