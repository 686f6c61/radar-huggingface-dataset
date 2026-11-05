# dmdhrumilmistry/Qwen2.5-Coder-7B-Instruct-ExPO-a0.1-GGUF

## Resumen

Qwen2.5-Coder-7B-Instruct-ExPO-a0.1 es un experimento de investigación publicado por el desarrollador independiente dmdhrumilmistry. Se trata de una extrapolación de pesos sin entrenamiento (ExPO, Zheng et al. 2024, arXiv 2404.16792) aplicada sobre los checkpoints oficiales de Qwen2.5-Coder-7B en sus variantes base e instruct. La fórmula aplicada es `theta = theta_instruct + 0.1 * (theta_instruct - theta_base)`, es decir, se aleja el modelo instruct en la dirección marcada por la diferencia entre instruct y base, con un factor alpha de 0.1.

El modelo se distribuye como GGUF en fp16, generado a partir de los GGUF fp16 de Ollama de `qwen2.5-coder:7b-base` y `-instruct`. Hereda la licencia Apache-2.0 del modelo original de Qwen. La relevancia de esta ficha no está en el rendimiento del modelo, sino en su valor como documentación negativa: el propio autor declara que no supera al original y que los resultados medidos están dentro del ruido estadístico.

El autor es explícito en la model card: "Experimental. Did not beat the original model. Use the original Qwen2.5-Coder-7B-Instruct for real work." El propósito declarado es la reproducibilidad del experimento y servir de base para trabajos posteriores sobre modificación de pesos sin entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B) |
| Parámetros totales | 7B (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | fp16 GGUF (único publicado); el resto de cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (heredada de Qwen2.5-Coder-7B) |
| Formato de pesos | GGUF (fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B, un transformer decoder-only de 7 mil millones de parámetros. Este modelo no se ha entrenado: es el resultado de una extrapolación lineal de pesos entre el checkpoint base y el checkpoint instruct de Qwen2.5-Coder-7B, con un factor alpha de 0.1. La operación se aplicó sobre los GGUF fp16 publicados por Ollama de `qwen2.5-coder:7b-base` y `qwen2.5-coder:7b-instruct`.

El método ExPO está pensado para extrapolar un paso pequeño de optimización de preferencias, pero en Qwen2.5-Coder el salto de base a instruct incluye SFT y RL a gran escala, lo que según el autor explica la falta de mejora. En el barrido de valores de alpha, alphas mayores resultaron peores en todos los tamaños probados, y Qwen2.5-Coder-0.5B colapsó con alpha 0.3. La herramienta utilizada es Tvashtr, un toolkit del mismo autor para mejorar modelos locales sin entrenamiento.

## Capacidades

- Generación de código: hereda las capacidades del modelo instruct original de Qwen2.5-Coder-7B, orientado a tareas de programación.
- Razonamiento y generación de texto: capacidades generales del modelo base Qwen2.5-Coder-7B.
- Tool calling y function calling: no confirmado en la información proporcionada para esta variante concreta.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de modificación de pesos sin entrenamiento: el modelo sirve como artefacto de referencia para verificar la fórmula ExPO con alpha 0.1 sobre Qwen2.5-Coder-7B, usando Tvashtr y los GGUF fp16 de Ollama como punto de partida.
- Investigación sobre extrapolación de preferencias: útil para estudiar por qué ExPO no funciona cuando el paso base-instruct incluye SFT y RL a gran escala, en lugar de un ajuste de preferencias pequeño.
- Estudio de estabilidad de merges: el barrido de alphas documentado (incluido el colapso de Qwen2.5-Coder-0.5B con alpha 0.3) permite analizar la sensibilidad del método al tamaño del modelo.
- Docencia y formación: ejemplo práctico de model merging y de evaluación con HumanEval con partición dev/test para ilustrar el concepto de ruido estadístico.
- Pruebas de infraestructura de inferencia con GGUF: al ser un GGUF fp16 compatible con Ollama, sirve para validar pipelines de despliegue antes de usar el modelo original.
- Benchmarking de pipelines de evaluación: útil para comprobar que un arnés de evaluación de código detecta diferencias dentro del ruido (±3 problemas por mitad de 82), antes de aplicarlo a modelos reales.

## Benchmarks y rendimiento

Resultados medidos con los tests ocultos oficiales de HumanEval, respuesta greedy única, comparados con el modelo instruct sin modificar preparado de la misma forma. El ruido de referencia es de aproximadamente ±3 problemas por mitad de 82.

| Benchmark | Original | Este modelo |
|---|---|---|
| HumanEval dev half (selección) | 91.5% (75/82) | 91.5% (75/82) |
| HumanEval test half (held out) | 84.2% (69/82) | no medido |

El veredicto del autor es que el resultado está dentro del ruido y no hay ganancia fiable. Como referencia del mismo estudio, la búsqueda en tiempo de test (S*) eleva el original Qwen2.5-Coder-1.5B del 70.7% al 80.5% en held-out, una mejora que sí se sostiene.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un GGUF fp16 de 7B, requiere aproximadamente 14-16 GB de VRAM para cargar los pesos, más overhead de contexto.
- GPU recomendadas: A100, H100 o RTX 4090 para fp16 completo con contexto amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16; en GPUs de 8-12 GB sería necesario cuantizar, pero esta variante solo se publica en fp16.
- Opciones de despliegue: Ollama (`ollama run dmdhrumilmistry/qwen2.5-coder-expo:7b-alpha0.1` o `ollama run hf.co/dmdhrumilmistry/Qwen2.5-Coder-7B-Instruct-ExPO-a0.1-GGUF:F16`); llama.cpp por ser GGUF; vLLM y TGI no confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ExPO alpha 0.1) | 7B | no disponible | 91.5% (dev half) | Apache-2.0 | GGUF fp16 |
| Qwen2.5-Coder-7B-Instruct (original) | 7B | no disponible | 91.5% (dev half), 84.2% (test half) | Apache-2.0 | safetensors, GGUF, Ollama |
| Qwen2.5-Coder-1.5B (original) | 1.5B | no disponible | 70.7% (held-out, según el estudio) | Apache-2.0 | safetensors, GGUF, Ollama |

La comparativa relevante es contra el propio modelo original: mismo rendimiento medido, misma licencia y misma arquitectura, pero el original ofrece más formatos, cuantizaciones y mantenimiento. Para uso real, el autor recomienda el original.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no supera al original y recomienda usar Qwen2.5-Coder-7B-Instruct para trabajo real.
- Los resultados están dentro del ruido estadístico (±3 problemas por mitad de 82); no hay evidencia de mejora.
- Solo se publica en GGUF fp16; no hay cuantizaciones ligeras para GPUs de consumo pequeñas.
- La mitad de test de HumanEval no se midió para esta variante, por lo que la evaluación held-out está incompleta.
- El método ExPO está diseñado para extrapolar pasos pequeños de optimización de preferencias; aplicarlo sobre un salto base-instruct con SFT y RL a gran escala no es el caso de uso previsto.
- Alphas mayores empeoraron en todos los tamaños, y Qwen2.5-Coder-0.5B colapsó con alpha 0.3, lo que indica fragilidad del método.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta variante; se heredan los del modelo base.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero al ser un release de investigación sin ganancia demostrada, no se recomienda en producción.
- No hay datos de descargas ni likes (0 y 0), lo que refleja su carácter experimental y baja adopción.

## Enlaces

- HuggingFace: https://huggingface.co/dmdhrumilmistry/Qwen2.5-Coder-7B-Instruct-ExPO-a0.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Toolkit Tvashtr: https://github.com/dmdhrumilmistry/tvashtr
- Resultados del barrido ExPO en Tvashtr: https://github.com/dmdhrumilmistry/tvashtr#training-free-weight-updates-expo
- Paper ExPO (Zheng et al. 2024): https://arxiv.org/abs/2404.16792
