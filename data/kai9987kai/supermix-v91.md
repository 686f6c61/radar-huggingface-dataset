# Kai9987kai/supermix-v91

## Resumen

Supermix v91 (`v91_cns_connectome`) es un modelo de lenguaje experimental desarrollado por el usuario independiente Kai9987kai dentro del proyecto Supermix, un linaje de modelos de investigación centrados en neurociencia computacional. Esta versión concreta es un hito pre-registrado que injerta un módulo recurrente denominado `ConnectomeCore` sobre el modelo base `supermix-v89`. El módulo se construye a partir del conectoma del sistema nervioso central de la mosca de la fruta macho (*Drosophila melanogaster*) publicado por Janelia FlyEM (versión 1.0), que comprende 164.506 neuronas tipadas, 11.751 tipos celulares y 122,3 millones de sinapsis tipadas.

El modelo tiene una arquitectura híbrida: un transformer base (`supermix-v89`) al que se añade un núcleo recurrente de 512 módulos con restricciones de signo de Dale (principio neurobiológico según el cual una neurona libera siempre el mismo tipo de neurotransmisor, excitador o inhibidor). El resultado es un modelo de tipo mixture-of-experts con 30.805.757 parámetros totales y 6.287.981 parámetros activos, lo que lo sitúa en la categoría de modelos pequeños orientados a investigación más que a producción.

La relevancia de este lanzamiento no reside en su rendimiento bruto, sino en su diseño metodológico: es un estudio de ablación pre-registrado de tres brazos (conectoma real, conectoma re-cableado como nulo estadístico y control de entrenamiento continuado sin injerto). Los resultados publicados son honestamente nulos o no concluyentes, y el autor los presenta como motivación para rediseños posteriores en `supermix-v93` y `supermix-v96`. Es, por tanto, un artefacto de investigación sobre interpretabilidad y plausibilidad biológica de arquitecturas, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer base (`supermix-v89`) + núcleo recurrente `ConnectomeCore` de 512 módulos con restricciones de signo de Dale; mixture-of-experts |
| Parámetros totales | 30.805.757 (brazo A, conectoma real) |
| Parámetros activos | 6.287.981 (brazo A) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en formato `.pt` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); ficheros `v91_cns_connectome.selected.pt`, `v91_cns_rewired.selected.pt`, `v91_control.selected.pt` |

## Arquitectura y entrenamiento

El modelo parte de `supermix-v89` como base y le injerta un `ConnectomeCore`: un núcleo recurrente compuesto por 512 módulos cuyas conexiones siguen el grafo del conectoma del CNS de *Drosophila* macho (Janelia FlyEM v1.0). Las conexiones están restringidas por el signo de Dale, de modo que cada módulo actúa como excitador o inhibidor de forma consistente, replicando una propiedad fundamental de los circuitos neuronales biológicos. El resultado se comporta como un mixture-of-experts con 30,8 M de parámetros totales y 6,3 M activos.

El entrenamiento se organiza como un estudio de ablación pre-registrado de tres brazos con 2.500 pasos de CPU emparejados entre ellos. El brazo A usa el cableado real del conectoma; el brazo B usa un cableado re-cableado mediante el algoritmo de Maslov-Sneppen preservando grado, signo y rol (nulo estadístico); el brazo C es un control de entrenamiento continuado sin injerto. Todos los brazos superaron las comprobaciones de generalización `v58` (con `truncated_replies = 0`). La evaluación primaria se realizó sobre 630 problemas novedosos con huella de generador `3b99a446cd533be9bc5f8ae57d1310b4`. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto y resolución de problemas de razonamiento sobre un conjunto acotado de tareas sintéticas (los 630 problemas novedosos del estudio).
- Razonamiento de tipo multi-paso dentro del pipeline de evaluación pre-registrado del proyecto Supermix.
- Capacidad de ablación controlada: el modelo expone tres variantes de pesos (conectoma real, nulo re-cableado y control) para experimentación reproducible.
- No hay evidencia publicada de soporte de tool calling, function calling ni comportamiento agéntico.
- No hay evidencia publicada de capacidades multilingües; el campo de idiomas figura como no disponible.
- No hay evidencia publicada de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación en neurociencia computacional: reproducir el estudio de ablación de tres brazos para verificar los resultados nulos publicados y explorar variantes del injerto de conectoma sobre el transformer base.
- Estudio de plausibilidad biológica de arquitecturas: comparar el brazo A (cableado real) con el brazo B (nulo Maslov-Sneppen) para evaluar si la topología específica del conectoma aporta ventaja frente a un grafo aleatorio con las mismas propiedades de grado y signo.
- Docencia y formación en interpretabilidad: usar los tres conjuntos de pesos como material didáctico para explicar metodología pre-registrada, controles nulos y sesgo de publicación en resultados de arquitecturas bioinspiradas.
- Reproducibilidad de experimentos: el pipeline `example_usage.py` y la huella de generador permiten replicar la evaluación sobre los 630 problemas y auditar la afirmación de precisión del 93,5 % del brazo A.
- Desarrollo de arquitecturas híbridas transformer-recurrente: servir como punto de partida para quien quiera experimentar con núcleos recurrentes restringidos por signo de Dale en modelos pequeños.
- Benchmarking de metodología de ablación: usar el diseño de tres brazos como plantilla para evaluar otras innovaciones arquitectónicas con controles adecuados antes de afirmar mejoras.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 630 problemas novedosos (huella de generador `3b99a446cd533be9bc5f8ae57d1310b4`), con 2.500 pasos de CPU emparejados:

| Brazo | Modelo | Dev loss | Precisión en 630 tareas | Hallazgo de ablación |
|---|---|---:|---:|---|
| Base | `supermix-v89` | 0,024770 | 577/630 (0,919) | Línea base |
| C | `v91_control.selected.pt` | 0,024394 | 580/630 (0,924) | Sin injerto |
| A | `v91_cns_connectome.selected.pt` | 0,024657 | 587/630 (0,935) | Compuerta abierta (`max=0,18`), ablación `+6e-6 nats` (D3: abierta pero ignorada aguas abajo) |
| B | `v91_cns_rewired.selected.pt` | 0,024492 | 592/630 (0,943) | Nulo con grado y signo emparejados (A vs B `p=0,18`; D1/D2 no cumplidos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 30,8 M de parámetros totales y pesos en FP32, el modelo ocupa aproximadamente 123 MB en memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el estudio se ejecutó íntegramente en CPU durante 2.500 pasos por brazo.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o incluso en CPU.
- Opciones de despliegue: el repositorio usa PyTorch puro más Flask (`pip install torch numpy flask huggingface_hub`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento de 2.500 pasos se ejecutó en CPU, lo que sugiere un modelo de muy bajo coste computacional.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers pequeños con injerto de conectoma biológico y estudios de ablación pre-registrados de tres brazos).

## Limitaciones y advertencias

- Los resultados del estudio son nulos o no concluyentes: el brazo B (nulo re-cableado) supera al brazo A (conectoma real) en precisión, con `p=0,18`, y los criterios D1/D2 no se cumplen. No debe interpretarse como evidencia de que el conectoma aporte ventaja.
- El autor reconoce explícitamente que el hallazgo motivó rediseños posteriores en `supermix-v93` y `supermix-v96`; esta versión es un hito intermedio, no un modelo final.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo solo se ha probado sobre un conjunto sintético acotado de 630 problemas, sin evaluación en lenguaje natural abierto.
- Idiomas soportados: no disponibles; no hay evidencia de capacidades multilingües ni de calidad en castellano.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de conversaciones multi-turno largas.
- Licencia MIT: permite uso comercial, pero el modelo no está validado para producción y su rendimiento en tareas reales es desconocido.
- Sesgos conocidos: no documentados; al ser un modelo de investigación entrenado sobre tareas sintéticas, no se ha auditado su comportamiento en dominios sensibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Tamaño del repo de 0,4 GB, coherente con los tres conjuntos de pesos y el código de ejemplo, pero sin garantía de mantenimiento futuro.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/supermix-v91
- Repositorio GitHub del proyecto Supermix: https://github.com/kai9987kai/Supermix
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v89
- Documentación del estudio: `docs/V91_MALECNS_CONNECTOME.md` (referenciada en la model card, sin URL directa disponible)
- Conectoma Janelia FlyEM male *Drosophila* CNS v1.0: no disponible enlace directo en la información proporcionada
