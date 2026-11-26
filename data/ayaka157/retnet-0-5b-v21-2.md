# Ayaka157/RetNet-0.5B-v21.2

## Resumen

RetNet-0.5B-v21.2 es un checkpoint de investigación de 504.179.896 parámetros construido sobre la arquitectura RetNet (Retentive Network), una alternativa a los transformers con atención tradicional que sustituye el mecanismo de atención por un mecanismo de retención con decaimiento exponencial por cabeza. Lo publica el usuario Ayaka157 en Hugging Face bajo licencia MIT, con el código de modelado incluido en el repositorio para poder cargarse mediante `trust_remote_code=True`. El modelo está entrenado con un contexto de 2.048 tokens y vocabulario ByteLevel BPE de 20.000 entradas.

El interés de esta versión v21.2 no es su calidad como modelo de producción, sino que documenta un experimento de extensión de contexto: un entrenamiento adicional de 13.000 pasos sobre 0,852 mil millones de tokens para llevar el modelo a 16.000 tokens de ventana. El resultado, medido y publicado por el propio autor, es negativo para recuperación de información: la perplejidad de cola larga dentro de documento baja de 3,2841 a 2,5942, pero se trata de un desplazamiento uniforme de nivel (todas las posiciones mejoran entre 0,68 y 0,72 nats), no de un efecto posicional. La recuperación tipo needle a 16k se queda en 0,0978, prácticamente el nivel de azar (brazo nulo 0,1024, ítems acertados 0/360).

Por tanto, es un export de investigación útil como evidencia empírica sobre el colapso de los decaimientos aprendidos en RetNet, no un modelo para desplegar en tareas de contexto largo. Los decaimientos aprendidos colapsaron durante el entrenamiento: la semivida máxima es de 1.649 tokens, ninguna cabeza alcanza una semivida de 2.048 tokens y el peso máximo a 16k es 0,00102.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RetNet (retention), 20 capas, anchura 1408, 22 cabezas, dimensión de valor/FFN 2816 |
| Parámetros totales | 504.179.896 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; export experimental a 16.000 tokens |
| Tipos de cuantización | no disponible (pesos almacenados en fp32; el autor recomienda cargar en bfloat16 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 1,92 GB), más `modeling_retnet.py`, `retention_fast.py`, `fused_ce.py` y ficheros de tokenizer |

## Arquitectura y entrenamiento

RetNet es una arquitectura de secuencia que reemplaza la atención cuadrática por retención con decaimiento exponencial por cabeza, con tres modos de cómputo: forma paralela para prefill/serving, forma chunkwise para entrenamiento y forma recurrente para decodificación. Este checkpoint implementa 20 capas con anchura 1408, 22 cabezas y dimensión de valor/FFN de 2816, con decaimiento gamma aprendido por cabeza. Incluye una rama GLA implementada pero desactivada (`gla_rank=0`). El vocabulario es ByteLevel BPE de 20.000 entradas y el contexto de entrenamiento original es de 2.048 tokens.

El entrenamiento de extensión de contexto consistió en 13.000 pasos sobre 0,852 mil millones de tokens para alcanzar 16.000 tokens de ventana. Los resultados publicados muestran que la mejora en perplejidad de cola larga es un desplazamiento uniforme de nivel y no un efecto posicional, y que los decaimientos aprendidos colapsaron: semivida máxima de 1.649 tokens, ninguna cabeza con semivida mayor o igual a 2.048 y peso máximo de 0,00102 a 16k. No se documentan en la información disponible detalles sobre composición del dataset, RLHF, DPO ni otras fases de alineamiento.

## Capacidades

- Generación de texto autoregresiva mediante decodificación recurrente.
- Modelado de lenguaje a contexto corto (2.048 tokens) y, experimentalmente, a 16.000 tokens con calidad de perplejidad mejorada pero sin capacidad de recuperación.
- Prefill y serving mediante forma paralela; entrenamiento mediante forma chunkwise; decodificación mediante forma recurrente.
- Soporte de chunkwise por lotes activando `RETNET_FAST_CHUNKWISE=1`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre arquitecturas RetNet: el checkpoint permite reproducir y analizar el comportamiento de los decaimientos aprendidos por cabeza en un modelo de 0,5B, comparando formas paralela, chunkwise y recurrente.
- Estudio del colapso de decaimientos en extensiones de contexto: sirve como evidencia controlada de que un entrenamiento adicional de 0,852 B tokens a 16k produce un desplazamiento uniforme de perplejidad sin efecto posicional, útil para diseñar experimentos posteriores.
- Evaluación de pipelines de recuperación (needle-in-a-haystack): el modelo documenta un resultado de 0,0978 a 16k frente a 0,1024 del brazo nulo, lo que permite validar arneses de evaluación y comprobar que detectan la ausencia de capacidad de recuperación.
- Docencia y divulgación: ejemplo práctico de arquitectura no-transformer con código de modelado incluido en el repositorio, cargable con `trust_remote_code=True` para estudiar el flujo de prefill, entrenamiento y decodificación.
- Pruebas de integración de código personalizado en transformers: útil para verificar que un entorno de serving carga correctamente modelos con `modeling_retnet.py` y `retention_fast.py` propios.
- Generación de texto a contexto corto en entornos de investigación con requisitos de licencia permisiva (MIT), siempre que no se dependa de recuperación a larga distancia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad de cola larga a 16k, antes del entrenamiento | 3,2841 |
| Perplejitud de cola larga a 16k, después del entrenamiento | 2,5942 |
| Mejora por bucket de posición | entre -0,68 y -0,72 nats (uniforme) |
| Needle retrieval a 16k (modelo) | 0,0978 |
| Needle retrieval a 16k (brazo nulo) | 0,1024 |
| Ítems acertados (item_acc) | 0/360 |
| Semivida máxima aprendida | 1.649 tokens |
| Cabezas con semivida >= 2.048 | 0 |
| Peso máximo a 16k | 0,00102 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos en fp32: 1,92 GB en safetensors; el repositorio ocupa 2,0 GB.
- Para inferencia se recomienda cargar con `torch_dtype=torch.bfloat16`, lo que reduce la huella de pesos a aproximadamente 1 GB.
- VRAM estimada: en torno a 2-3 GB en bfloat16 para inferencia con contexto corto, sin contar caché de activaciones; en fp32, alrededor de 2-3 GB solo para pesos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares con 8 GB o más; también en GPUs de 4-6 GB en bfloat16 con contexto reducido.
- Despliegue: carga mediante `transformers` con `trust_remote_code=True`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.2 | 504.179.896 | 2.048 (export a 16k) | RetNet | MIT | Hugging Face |
| Alternativas de ~0,5B tipo transformer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El propio autor advierte de que no debe publicitarse ni usarse este export para recuperación a 16k: el resultado de needle retrieval es 0,0978, equivalente al azar.
- Los decaimientos aprendidos colapsaron durante el entrenamiento: semivida máxima de 1.649 tokens y ninguna cabeza con semivida mayor o igual a 2.048, lo que limita estructuralmente la memoria a largo plazo.
- La mejora de perplejidad a 16k es un desplazamiento uniforme de nivel, no un efecto posicional; no implica mejor uso de la posición.
- Riesgo de alucinación: no evaluado en la información disponible, pero esperable en un modelo de 0,5B entrenado con un dataset no documentado.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el vocabulario de 20.000 entradas es reducido y probablemente limita la cobertura multilingüe.
- Restricciones de licencia: MIT, permite uso comercial, pero el estado de investigación y las limitaciones de recuperación desaconsejan su uso en producción para tareas de contexto largo.
- Requiere `trust_remote_code=True` y ejecuta código de modelado incluido en el repositorio, lo que implica revisar `modeling_retnet.py`, `retention_fast.py` y `fused_ce.py` antes de desplegarlo en entornos sensibles.
- Es un export de investigación fechado en 2026-10-29 y actualizado en 2026-11-17, con 227 descargas y 0 likes; no hay evidencia de mantenimiento ni de comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.2
- Repositorio de código, datos y evaluación: https://github.com/Ayaka157/RetNet
- Informe técnico (2026-10-29, PDF en inglés y chino): https://github.com/Ayaka157/RetNet/blob/main/docs/latex/en/RetNet-0.5B-Technical-Report.pdf
- Demo: https://retnet.ayaka157.icu/play/
