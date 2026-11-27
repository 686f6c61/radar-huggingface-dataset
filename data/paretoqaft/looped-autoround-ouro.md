# ParetoQaft/looped-autoround-ouro

## Resumen

Looped AutoRound for Ouro es un repositorio de código y un conjunto de checkpoints cuantizados del modelo ByteDance/Ouro, publicado por el usuario ParetoQaft. No se trata de un modelo entrenado desde cero, sino de una herramienta de cuantización post-entrenamiento (PTQ) basada en AutoRound 0.9.2, modificada específicamente para arquitecturas de transformer con bucles (looped transformer) como la familia Ouro de ByteDance. El objetivo es producir checkpoints cuantizados en W4A16 y W2A16 que preserven al máximo la calidad del modelo original en BF16.

La innovación principal reside en un parche sobre `auto_round/compressors/base.py` que calibra cada bloque compartido de forma conjunta sobre las entradas de las cuatro iteraciones del bucle, en lugar de calibrar una sola pasada como hace AutoRound estándar. Dado que Ouro reutiliza la misma pila de capas decodificadoras cuatro veces por forward pass, cada peso se emplea cuatro veces, y calibrar solo con una pasada infrarepresenta el rango real de activaciones que ve el bloque.

El repositorio incluye el código completo de cuantización, el parche, un script de desquantización a BF16 denso y las métricas de GSM8k (3-shot) para las cuatro combinaciones de tamaño (1.4B y 2.6B) y esquema (W4A16 y W2A16). Es relevante para quienes necesitan desplegar Ouro en hardware con memoria limitada sin renunciar en exceso a la precisión en tareas de razonamiento matemático y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), 4 iteraciones de la misma pila de capas decodificadoras, con `model.norm` entre bucles |
| Parametros totales | 1.4B y 2.6B (dos variantes del modelo base ByteDance/Ouro) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones) y W2A16 (2 bits pesos, 16 bits activaciones); grupo de 128, int simétrico |
| Idiomas soportados | no disponible |
| Licencia | no disponible (AutoRound es Apache-2.0; el parche modifica código de AutoRound 0.9.2) |
| Formato de pesos | AutoGPTQ empaquetado; exportación densa a BF16 disponible vía `dequantize.py` |

## Arquitectura y entrenamiento

El modelo base Ouro es un transformer con bucles: la misma pila de capas decodificadoras se ejecuta cuatro veces por forward pass, con una normalización (`model.norm`) aplicada entre iteraciones. Esto implica que cada peso se reutiliza cuatro veces, lo que reduce el número de parámetros únicos respecto a un transformer convencional de profundidad equivalente, a costa de una mayor complejidad en la propagación de activaciones.

El proceso de cuantización parte de los pesos en BF16 de ByteDance/Ouro-1.4B y Ouro-2.6B y aplica AutoRound con calibración sobre 512 muestras de 2048 tokens del dataset `ParetoQaft/nemotron_calib`, 1000 iteraciones, batch de 8, grupo de 128, semilla 42, `enable_alg_ext=True`, `enable_quanted_input=True` y exportación a AutoGPTQ. El parche específico para Ouro ejecuta el modelo FP a través de los bucles 1-3 para recoger la entrada del bloque 0 en cada iteración, calcula la pérdida de reconstrucción de cada bloque sobre los cuatro contextos de bucle simultáneamente (2 muestras por bucle en cada paso) y propaga las salidas cuantizadas por separado para cada bucle cuando `enable_quanted_input=True`. No se ha realizado entrenamiento adicional ni ajuste fino: es puramente cuantización post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento matemático: los checkpoints preservan la capacidad de resolución de problemas de GSM8k del modelo base, con degradación variable según el esquema de cuantización.
- Generación de código: el repositorio está etiquetado con `code`, lo que indica que el modelo base y los checkpoints están orientados a tareas de programación.
- Razonamiento multi-paso: la arquitectura con bucles de Ouro está diseñada para iterar sobre representaciones internas, lo que favorece tareas que requieren cómputo iterativo.
- Cuantización W4A16 y W2A16: permite desplegar el modelo en GPUs con menos VRAM que la versión BF16.
- Exportación a AutoGPTQ: los checkpoints empaquetados pueden servirse con vLLM (según la model card, la evaluación GSM8k se hizo con vLLM usando la implementación de Ouro).
- Desquantización a BF16 denso: `dequantize.py` permite reconstruir un checkpoint denso en CPU para su uso con frameworks que no soportan AutoGPTQ.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de Ouro-1.4B en GPUs de consumo: el checkpoint W4A16 reduce el peso de los pesos a aproximadamente 0,7 GB (frente a ~2,8 GB en BF16), lo que permite ejecutar el modelo en tarjetas con 8 GB o menos de VRAM manteniendo una puntuación GSM8k de 75,4 frente a 77,9 del BF16.
- Despliegue de Ouro-2.6B en GPUs de gama media: el checkpoint W4A16 ocupa aproximadamente 1,3 GB de pesos y conserva 85,1 en GSM8k frente a 86,5 del BF16, adecuado para servidores con una sola GPU de 16-24 GB.
- Investigación sobre cuantización de looped transformers: el parche y el código permiten reproducir y extender el método de calibración multi-bucle a otras arquitecturas con pesos compartidos entre iteraciones.
- Evaluación de límites de cuantización extrema: el checkpoint W2A16 de 2.6B (32,8 en GSM8k frente a 86,5 BF16) sirve como caso de estudio de la degradación severa a 2 bits en modelos con reutilización de pesos, útil para comparar estrategias de calibración.
- Generación de código en pipelines con restricciones de memoria: los checkpoints etiquetados con `code` pueden integrarse en entornos de CI/CD o asistentes de programación donde la VRAM es limitada, usando la exportación AutoGPTQ con vLLM.
- Reproducción de experimentos de cuantización: el repositorio incluye `requirements.txt` con el `pip freeze` exacto, revisiones fijadas del modelo y del dataset, y scripts de aplicación del parche, lo que facilita la replicabilidad en entornos de investigación.
- Servicio de inferencia con vLLM: la model card indica que la evaluación se realizó con vLLM sobre la exportación densa BF16, por lo que el flujo empaquetado → desquantizado → vLLM es un camino validado para producción.

## Benchmarks y rendimiento

Resultados de GSM8k (3-shot, 1319 preguntas, `exact_match`, evaluado con OLMES sobre la exportación densa BF16 servida con vLLM):

| Repo | Modelo | Esquema | GSM8k (3-shot) | Referencia BF16 |
|---|---|---|---|---|
| `ParetoQaft/1_4B-looped-4bit-nemotron` | ByteDance/Ouro-1.4B | W4A16 | 75,4 | 77,9 |
| `ParetoQaft/1_4B-looped-2bit-nemotron` | ByteDance/Ouro-1.4B | W2A16 | 9,6 | 77,9 |
| `ParetoQaft/2_6B-looped-4bit-nemotron` | ByteDance/Ouro-2.6B | W4A16 | 85,1 | 86,5 |
| `ParetoQaft/2_6B-looped-2bit-nemotron` | ByteDance/Ouro-2.6B | W2A16 | 32,8 | 86,5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: W4A16 de 1.4B ≈ 0,7 GB de pesos más overhead de activaciones y KV cache; W4A16 de 2.6B ≈ 1,3 GB; W2A16 de 1.4B ≈ 0,35 GB; W2A16 de 2.6B ≈ 0,65 GB. El overhead real depende de la longitud de contexto y del framework.
- GPU recomendadas: la cuantización se generó en H200 de 141 GB; para inferencia basta una GPU con VRAM suficiente para pesos más KV cache. Una RTX 4090 (24 GB) cubre holgadamente ambas variantes en W4A16 y W2A16.
- Cabe en GPU de consumo: sí, ambas variantes en W4A16 y W2A16 caben en GPUs de consumo con 8 GB o más, siempre que el contexto no sea muy largo.
- Opciones de despliegue: vLLM (usado para la evaluación GSM8k con la exportación densa BF16), AutoGPTQ para los checkpoints empaquetados, y `dequantize.py` para generar un checkpoint BF16 denso compatible con otros frameworks. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica tiempos de cuantización (≈20 min para 1.4B y ≈35 min para 2.6B en W2, similar en W4) en H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8k (3-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped AutoRound Ouro-1.4B W4A16 | 1.4B | no disponible | 75,4 | no disponible | Hugging Face (ParetoQaft) |
| Looped AutoRound Ouro-2.6B W4A16 | 2.6B | no disponible | 85,1 | no disponible | Hugging Face (ParetoQaft) |
| ByteDance/Ouro-1.4B (BF16) | 1.4B | no disponible | 77,9 | no disponible | Hugging Face (ByteDance) |
| ByteDance/Ouro-2.6B (BF16) | 2.6B | no disponible | 86,5 | no disponible | Hugging Face (ByteDance) |

No se dispone de datos de otros modelos cuantizados comparables (por ejemplo, variantes GPTQ o AWQ de Ouro) en la información proporcionada.

## Limitaciones y advertencias

- El parche es específico de Ouro: codifica de forma fija 4 bucles y una `model.norm` entre bucles, y se aplica a todos los modelos cuantizados en ese entorno, por lo que se recomienda usar un entorno virtual separado para otros modelos.
- Los checkpoints no son bit-exactos: los kernels de GPU no son deterministas, por lo que una reejecución produce un checkpoint cercano pero no idéntico; se espera una variación de ±2 puntos en GSM8k.
- Degradación severa a 2 bits: el esquema W2A16 pierde gran parte de la capacidad de razonamiento (9,6 frente a 77,9 en 1.4B; 32,8 frente a 86,5 en 2.6B), por lo que no es adecuado para tareas que requieran precisión matemática.
- La desquantización ignora los `qzeros` almacenados y usa el punto cero simétrico 2^(bits-1); solo soporta checkpoints de 2 y 4 bits.
- El pipeline de evaluación GSM8k (OLMES + vLLM con implementación de Ouro) no forma parte del bundle, lo que dificulta la reproducción exacta de las métricas.
- Licencia del modelo base y de los checkpoints: no disponible; debe verificarse antes de uso comercial.
- Idiomas soportados: no disponible.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; aplican los del modelo base Ouro de ByteDance.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ParetoQaft/looped-autoround-ouro
- Modelo base ByteDance/Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Modelo base ByteDance/Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de calibración: https://huggingface.co/datasets/ParetoQaft/nemotron_calib
- Checkpoint 1.4B W4A16: https://huggingface.co/ParetoQaft/1_4B-looped-4bit-nemotron
- Checkpoint 1.4B W2A16: https://huggingface.co/ParetoQaft/1_4B-looped-2bit-nemotron
- Checkpoint 2.6B W4A16: https://huggingface.co/ParetoQaft/2_6B-looped-4bit-nemotron
- Checkpoint 2.6B W2A16: https://huggingface.co/ParetoQaft/2_6B-looped-2bit-nemotron
- AutoRound (Intel): https://github.com/intel/auto-round
