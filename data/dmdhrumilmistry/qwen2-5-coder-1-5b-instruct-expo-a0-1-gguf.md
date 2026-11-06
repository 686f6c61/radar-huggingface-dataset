# dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.1-GGUF

## Resumen

Qwen2.5-Coder-1.5B-Instruct ExPO alpha=0.1 es un experimento de investigación publicado por el desarrollador independiente dmdhrumilmistry. Se trata de una extrapolación de pesos sin entrenamiento (training-free) aplicada sobre los checkpoints oficiales de Qwen2.5-Coder-1.5B, tanto la variante base como la instruct. La operación aplicada es `theta = theta_instruct + 0.1 * (theta_instruct - theta_base)`, una técnica de extrapolación de pesos propuesta por Zheng et al. (2024, arXiv 2404.16792) bajo el nombre de ExPO.

El modelo se distribuye en formato GGUF fp16, derivado de los GGUF fp16 que Ollama publica de los checkpoints originales, y está pensado para su uso con Ollama y llama.cpp. No incorpora ningún entrenamiento adicional: es una mera transformación aritmética de los pesos existentes.

La relevancia de esta publicación es metodológica más que práctica. El propio autor indica explícitamente que el modelo experimental no superó al original y recomienda usar Qwen2.5-Coder-1.5B-Instruct para trabajo real. La ficha se incluye por su valor como caso de estudio sobre extrapolación de pesos y sobre los límites de las técnicas training-free aplicadas a diferencias base-instruct que incluyen SFT y RL a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B soporta 32.768 tokens segun su model card oficial) |
| Tipos de cuantizacion | GGUF F16 (unico publicado en este repositorio); el modelo base admite cuantizaciones GGUF estandar (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen2.5-Coder-1.5B) |
| Formato de pesos | GGUF (fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El modelo no ha sido entrenado ni ajustado por el autor de esta publicación; los pesos se obtienen mediante extrapolación lineal de los checkpoints oficiales. Concretamente, se parte de los GGUF fp16 que Ollama distribuye de `qwen2.5-coder:1.5b-base` y `qwen2.5-coder:1.5b-instruct`, y se aplica la fórmula ExPO con coeficiente alpha = 0.1 sobre cada tensor.

La técnica ExPO (Extrapolated Preference Optimization) fue propuesta originalmente para extrapolar el delta de un paso de optimización de preferencias de pequeña magnitud sobre un modelo ya ajustado. En este caso se aplica sobre la diferencia entre los checkpoints base e instruct de Qwen2.5-Coder, que según el autor agrupa SFT y RL a gran escala. Esa discrepancia entre el supuesto teórico de la técnica y la naturaleza del delta real es, según el propio autor, la explicación más plausible de la ausencia de mejora medible. El barrido de coeficientes mostró que valores mayores de alpha empeoraban el rendimiento en todos los tamaños probados, y que Qwen2.5-Coder-0.5B colapsaba con alpha = 0.3.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento sobre código: explicación, refactorización y depuración de fragmentos.
- Generación de texto general en modo instruct (chat), con el estilo de respuesta del modelo original.
- Soporte de tool calling y function calling: heredado del modelo base, aunque no verificado específicamente en esta variante.
- Capacidades multilingües: no documentadas en la información disponible para esta variante; dependen del modelo base.
- No incluye visión, audio ni modo de razonamiento extendido (thinking mode).
- No incorpora mejoras adicionales sobre el modelo original: la extrapolación de pesos no añade capacidades nuevas.

## Casos de uso

- Estudio de técnicas training-free: el modelo sirve como artefacto reproducible para investigar la extrapolación de pesos ExPO sobre deltas base-instruct, comparando el comportamiento con distintos coeficientes alpha.
- Reproducción de experimentos: permite replicar el barrido de alpha descrito en el repositorio Tvashtr y verificar los resultados publicados con los tests ocultos de HumanEval.
- Docencia sobre merging y manipulación de pesos: útil para ilustrar cómo se construyen variantes de un modelo sin entrenamiento y qué límites tienen esas técnicas.
- Evaluación comparativa de robustez: sirve como control negativo en pipelines de evaluación, ya que se espera un rendimiento equivalente al original dentro del ruido estadístico.
- Pruebas de infraestructura GGUF/Ollama: al ser un GGUF fp16 de 1.5B, es adecuado para validar flujos de descarga, carga y ejecución en Ollama y llama.cpp.
- Experimentación con decodificación y test-time search: combinado con técnicas como S* (disponibles vía `tvashtr serve`), puede usarse para estudiar cómo el search en tiempo de inferencia compensa la ausencia de ganancias en los pesos.
- No recomendado para producción: el propio autor desaconseja su uso en trabajo real frente al modelo original.

## Benchmarks y rendimiento

Resultados medidos con los tests ocultos oficiales de HumanEval, respuesta única greedy, contra el modelo instruct sin modificar preparado de la misma forma. El suelo de ruido es de aproximadamente ±3 problemas por mitad de 82 problemas.

| Benchmark | Original | Este modelo |
|---|---|---|
| HumanEval dev half (selección) | 72,0% (59/82) | 73,2% (60/82) |
| HumanEval test half (held out) | 70,7% (58/82) | no medido |

El autor concluye que la diferencia está dentro del ruido y que no hay ganancia fiable. Como referencia del mismo estudio, la búsqueda en tiempo de inferencia (S*) eleva el modelo original de 70,7% a 80,5% en el conjunto held out, una mejora que sí se sostiene y que no proviene de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 3 GB solo para pesos, más overhead de contexto y KV cache; en la práctica unos 3,5-4,5 GB según longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para F16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más. Si se generan cuantizaciones Q4_K_M o Q5_K_M a partir del modelo base equivalente, cabría en GPUs de 4 GB.
- Opciones de despliegue: Ollama (`ollama run dmdhrumilmistry/qwen2.5-coder-expo:1.5b-alpha0.1` o `ollama run hf.co/dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.1-GGUF:F16`), llama.cpp con el GGUF, y `tvashtr serve` para las variantes con test-time search.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1.5B) y el formato F16, se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ExPO alpha=0.1) | 1.5B | no disponible | 73,2% (dev half, 60/82) | Apache-2.0 | GGUF F16 en HF, Ollama |
| Qwen2.5-Coder-1.5B-Instruct (original) | 1.5B | 32.768 tokens (según model card oficial) | 72,0% (dev half, 59/82); 70,7% (held out) | Apache-2.0 | HF, Ollama, múltiples cuantizaciones |
| Qwen2.5-Coder-1.5B-Instruct + S* (test-time search) | 1.5B | 32.768 tokens | 80,5% (held out) | Apache-2.0 | Vía `tvashtr serve` |
| Qwen2.5-Coder-0.5B (variante menor del mismo estudio) | 0.5B | no disponible | no disponible | Apache-2.0 | HF, Ollama |

La comparación relevante es contra el modelo original, del que esta variante no se separa de forma estadísticamente significativa. La alternativa con mejor rendimiento documentado en el mismo estudio es el original combinado con búsqueda en tiempo de inferencia.

## Limitaciones y advertencias

- No supera al modelo original: el autor indica explícitamente que no hay ganancia fiable y recomienda usar Qwen2.5-Coder-1.5B-Instruct para trabajo real.
- El conjunto held out de HumanEval no fue medido para esta variante, por lo que la evaluación es parcial (solo dev half).
- El suelo de ruido (±3 problemas por mitad de 82) es del mismo orden que la diferencia observada, lo que impide atribuir mejora alguna.
- La técnica ExPO se aplicó sobre un delta base-instruct que incluye SFT y RL a gran escala, distinto del escenario para el que fue propuesta; esta es la explicación del autor para la falta de mejora.
- Solo se publica GGUF F16; no hay cuantizaciones más pequeñas en este repositorio.
- Idiomas soportados no documentados para esta variante; dependen del modelo base y no han sido verificados.
- Riesgo de alucinación: el habitual en modelos de 1.5B, no evaluado específicamente en esta variante.
- Sesgos: no documentados en la información disponible; se heredan del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero al tratarse de un experimento sin ventaja medible no se recomienda su despliegue en producción.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Toolkit Tvashtr: https://github.com/dmdhrumilmistry/tvashtr
- Resultados del barrido ExPO en Tvashtr: https://github.com/dmdhrumilmistry/tvashtr#training-free-weight-updates-expo
- Paper ExPO (Zheng et al. 2024): https://arxiv.org/abs/2404.16792
