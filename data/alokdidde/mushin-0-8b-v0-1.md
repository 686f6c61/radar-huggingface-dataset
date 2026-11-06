# alokdidde/mushin-0.8b-v0.1

## Resumen

Mushin 0.8B v0.1 es un modelo compacto de decisión "System 1" para robots, desarrollado por alokdidde y publicado bajo licencia Apache 2.0. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B (torre de visión, conector y modelo de lenguaje, sin la cabeza LM) mediante adaptadores LoRA y cabezas de decisión específicas. El repositorio contiene 24,4 millones de parámetros entrenables (52 MB en `model.safetensors`), mientras que en inferencia el conjunto ronda los 0,87B de parámetros con un pico de memoria GPU de 1,98 GB en bf16.

El modelo no genera texto ni controla motores directamente. Su función es ocupar el hueco del planificador (`DecisionSource`) en el runtime robótico uzumaki: en cada punto de decisión observa la tarea, la última observación estructurada, el historial reciente y dos fotogramas de cámara (escena y muñeca), y responde en un único forward pass a una pregunta tipada. Las respuestas posibles son la elección de habilidad (o abstenerse) como distribución de probabilidad, la probabilidad de éxito de cada habilidad ofrecida (sí/no) y una distribución sobre bins de valor para cada parámetro numérico o enum de la habilidad.

v0.1 es una release de investigación entrenada exclusivamente en simulación MuJoCo, con 201k decisiones simuladas y etiquetas contrafactuales sobre 8 cuerpos de robot. Su relevancia actual radica en que demuestra que un modelo de menos de mil millones de parámetros puede superar a planificadores basados en reglas y a baselines lineales en selección de habilidades, incluyendo generalización a un cuerpo de robot no visto (Go1), con una calibración de probabilidad de éxito notable (ECE 0,005 en test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-0.8B: torre de visión + conector + LM sin cabeza) con adaptadores LoRA y cabezas de decisión |
| Parametros totales | 24.392.977 (pesos del repo: LoRA, conector de visión, cabezas y temperaturas); ~0,87B en inferencia (base + adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no genera texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 52 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B conservando la torre de visión, el conector y el modelo de lenguaje, pero eliminando la cabeza LM. Sobre esa base se añaden adaptadores LoRA, un conector de visión entrenado, cabezas de decisión específicas y temperaturas de calibración. La salida no es texto libre sino tres tipos de respuesta estructurada: una distribución sobre las habilidades ofrecidas (incluida la opción de abstenerse), una probabilidad de éxito por habilidad y distribuciones sobre bins de valor para los parámetros numéricos y enum de cada habilidad. Todo se resuelve en un único forward pass, lo que encaja con el perfil de latencia bajo de un "System 1".

El entrenamiento se realizó sobre el dataset alokdidde/mushin-sim-decisions-v1, compuesto por 201k decisiones simuladas con etiquetas contrafactuales en 8 cuerpos de robot distintos. Las etiquetas contrafactuales permiten evaluar cada opción por su resultado real al replicar el episodio, no por la acción del profesor. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron RLHF o DPO; el pipeline declarado es supervisión sobre decisiones simuladas más calibración de temperaturas en un split separado (`calib`).

## Capacidades

- Selección de habilidades: elige, entre las habilidades ofrecidas, cuál ejecutar a continuación o si conviene abstenerse, devolviendo una distribución de probabilidad.
- Predicción de éxito: estima la probabilidad de que cada habilidad ofrecida tenga éxito si se elige en ese momento (AUROC 0,916 en test).
- Parametrización de habilidades: produce distribuciones sobre bins de valor para entradas numéricas y sobre valores permitidos para entradas enum.
- Entrada multimodal: procesa dos fotogramas de cámara (escena y muñeca) junto con la tarea, la observación estructurada más reciente y el historial reciente.
- Calibración: incorpora temperaturas calibradas por split, con ECE de 0,005 en la probabilidad de éxito sobre test.
- Generalización a cuerpos no vistos: mantiene precisión razonable en el cuerpo Go1 no visto durante el entrenamiento (exactitud 0,707, AUROC 0,877).
- Integración con runtime: diseñado para ocupar el slot `DecisionSource` del runtime uzumaki, sustituyendo selectores basados en reglas o planificadores LLM.
- No soporta tool calling, function calling genérico, agentes multi-step ni generación de texto; su interfaz es la pregunta tipada de decisión robótica.

## Casos de uso

- Planificación de pick-and-place en simulación: el modelo recibe la tarea, la observación estructurada y los fotogramas de escena y muñeca, y decide qué habilidad invocar y con qué parámetros, sustituyendo el selector de reglas en el slot `DecisionSource` de uzumaki.
- Abstención segura ante incertidumbre: cuando ninguna habilidad ofrecida tiene probabilidad de éxito suficiente, el modelo puede devolver la opción de abstenerse, evitando ejecutar acciones de alto riesgo en el simulador.
- Parametrización automática de habilidades: en lugar de fijar a mano los bins de valor de cada entrada numérica o enum, el modelo emite una distribución sobre los valores permitidos, lo que reduce la ingeniería de reglas por tarea.
- Evaluación de políticas en MuJoCo: al integrarse en episodios simulados, permite comparar el rendimiento de un planificador aprendido frente a un selector de reglas con métricas de éxito de tarea y número de decisiones tomadas.
- Generalización entre morfologías: el rendimiento en el cuerpo Go1 no visto (exactitud 0,707) lo hace útil para probar la transferencia de políticas de decisión a robots con cinemática distinta dentro de la simulación.
- Investigación sobre calibración en robótica: sus temperaturas calibradas y su ECE bajo en P(success) permiten estudiar curvas de riesgo-cobertura y estrategias de deferencia en pipelines de decisión.
- Prototipado de "System 1" de bajo coste: con 1,98 GB de pico en bf16, puede desplegarse en GPUs de gama media para experimentar con decisiones rápidas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index y en la model card (no verificados de forma independiente):

| split | modelo | choice acc ↑ | choice Brier ↓ | AURC ↓ | success AUROC ↑ | success ECE ↓ |
|---|---|---:|---:|---:|---:|---:|
| val (n=8.771) | **Mushin 0.8B v0.1** | **0,756** | 0,448 | 0,153 | **0,916** | 0,005 |
| val | frequency baseline | 0,725 | **0,368** | **0,124** | 0,609 | 0,004 |
| val | linear baseline | 0,717 | 0,507 | 0,196 | 0,831 | 0,075 |
| val | rule selector (data teacher) | 0,632 | 0,553 | 0,312 | 0,609 | 0,004 |
| test (n=8.997) | **Mushin 0.8B v0.1** | **0,747** | 0,456 | 0,166 | **0,916** | 0,005 |
| test | frequency baseline | 0,715 | **0,376** | **0,131** | 0,613 | 0,006 |
| test | linear baseline | 0,709 | 0,515 | 0,206 | 0,831 | 0,081 |
| test | rule selector | 0,627 | 0,559 | 0,335 | 0,613 | 0,006 |
| test_body, Go1 no visto (n=23.453) | **Mushin 0.8B v0.1** | **0,707** | 0,520 | **0,144** | **0,877** | 0,010 |
| test_body | frequency baseline | 0,632 | **0,464** | 0,208 | 0,538 | 0,096 |
| test_body | linear baseline | 0,630 | 0,620 | 0,215 | 0,716 | 0,063 |
| test_body | rule selector | 0,442 | 0,745 | 0,554 | 0,538 | 0,096 |

La exactitud de elección se mide contra la mejor opción contrafactual, no contra la acción del profesor. En simulación en bucle cerrado, el modelo iguala al planificador de reglas en éxito de tarea dentro del ruido (76,9% frente a 78,1% en 480 episodios emparejados), con aproximadamente un 17% menos de decisiones. Las probabilidades de elección están sobreconfiadas (ECE 0,16), por lo que el baseline de frecuencia sigue obteniendo mejor Brier y mejor curva riesgo-cobertura en esa dimensión.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,98 GB de pico en bf16 para el conjunto base más adaptadores (~0,87B de parámetros).
- GPU recomendadas: no se especifican en la información disponible; por el perfil de memoria, cualquier GPU con al menos 2-3 GB de VRAM libre en bf16 es suficiente.
- Cabe en GPUs de consumo: sí, dado el bajo pico de memoria; no se detallan modelos concretos en la información disponible.
- Opciones de despliegue: el modelo se carga mediante la librería `mushin` y se integra en el runtime uzumaki; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El diseño de un único forward pass por decisión apunta a baja latencia, pero no se publican cifras.
- Objetivo de despliegue en borde: la model card indica que aún no se ha probado en el objetivo Jetson Orin Nano.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mushin 0.8B v0.1 | 24,4M entrenables; ~0,87B en inferencia | no disponible | Decisión robótica vision-language (System 1) | apache-2.0 | Hugging Face (alokdidde/mushin-0.8b-v0.1) |
| Rule selector (baseline del autor) | no aplica | no aplica | Reglas heurísticas que generaron la mayoría de los datos | no disponible | Interno al pipeline de uzumaki |
| Frequency baseline | no aplica | no aplica | Estadística de frecuencias sobre las decisiones | no disponible | Baseline del autor (results/baselines.json) |
| Linear baseline | no disponible | no aplica | Modelo lineal sobre las observaciones estructuradas | no disponible | Baseline del autor (results/baselines.json) |

No se dispone en la información proporcionada de otros modelos de decisión robótica comparables de la misma categoría (por ejemplo, políticas vision-language para selección de habilidades) con parámetros, contexto y licencia documentados.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación MuJoCo; no se ha probado en robots reales ni en el objetivo Jetson Orin Nano.
- Release de investigación (v0.1): no debe usarse como componente de producción sin validación adicional.
- Las probabilidades de elección están sobreconfiadas (ECE 0,16); el baseline de frecuencia obtiene mejor Brier y mejor curva riesgo-cobertura en esa dimensión.
- No genera texto ni controla motores; su utilidad depende de una biblioteca de habilidades externa y de la integración con uzumaki.
- El rendimiento en cuerpos no vistos cae respecto a los vistos (exactitud 0,707 frente a 0,747 en test), lo que limita la transferencia a morfologías nuevas.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del dominio de decisión simulado; el modelo no está pensado para tareas de lenguaje general.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene revisar.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero existe riesgo de decisiones erróneas cuando las distribuciones de parámetros o de éxito están mal calibradas fuera de la distribución de entrenamiento.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alokdidde/mushin-0.8b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/alokdidde/mushin-sim-decisions-v1
- Código: https://github.com/alokdidde/mushin
- Runtime uzumaki: https://github.com/alokdidde/uzumaki
- Paper (arXiv): 2610.09188
- Resultados de evaluación: results/eval.json (en el repositorio del modelo)
- Resultados de baselines: results/baselines.json (en el repositorio del modelo)
