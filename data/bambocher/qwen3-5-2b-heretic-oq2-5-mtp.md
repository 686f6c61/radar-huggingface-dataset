# bambocher/Qwen3.5-2B-heretic-oQ2.5-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2.5-mtp es una variante "decensored" del modelo Qwen/Qwen3.5-2B publicada por el usuario bambocher en Hugging Face. El modelo parte del checkpoint oficial de Qwen, le aplica una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo, y posteriormente lo cuantiza con oMLX v0.7.3 usando cuantización de precisión mixta oQ. El resultado es un checkpoint de 2.274 millones de parámetros que conserva la cabeza de predicción multi-token (MTP) del modelo original.

La relevancia de esta ficha radica en que combina tres transformaciones poco habituales sobre un modelo pequeño: eliminación de alineamiento de seguridad, cuantización mixta agresiva (media efectiva de 5,302 bits por peso) y preservación de la cabeza MTP para decodificación especulativa. El repositorio ocupa 1,5 GB y está empaquetado en formato MLX, lo que lo orienta a inferencia en hardware Apple Silicon.

No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de la model card original de Qwen3.5-2B en la información proporcionada, por lo que estos datos se marcan como no disponibles. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabeza MTP; incluye torre de visión |
| Parametros totales | 2.274.069.824 (2,274B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ mixta: affine 2-bit (grupo 64), 3-bit (grupo 128 y 64), 4-bit, 5-bit, 8-bit (grupo 64) y BF16; media efectiva 5,302 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), librería mlx |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,882B | 0,798 GB / 0,743 GiB |
| Visión | 0,331B | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 0,061B | 0,046 GB / 0,043 GiB |
| Total | 2,274B | 1,507 GB / 1,404 GiB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer de 2.274 millones de parámetros que integra una torre de visión (0,331B parámetros) y una cabeza de predicción multi-token (MTP, 0,061B parámetros). La cabeza MTP permite decodificación especulativa multi-token, una técnica que acelera la generación al predecir varios tokens por paso. Esta variante conserva dicha cabeza intacta tras el proceso de decensurado y cuantización.

Sobre el checkpoint original se aplicó Heretic v2.0.0, una herramienta de ablación de rangos arbitrarios (ARA) que modifica los pesos en las capas 12 a 23 (start_layer_index=12, end_layer_index=23) con los siguientes hiperparámetros: preserve_good_behavior_weight=0,9189, steer_bad_behavior_weight=0,0008, overcorrect_relative_weight=0,9924 y neighbor_count=14. El efecto medido es una reducción de rechazos de 97/100 en el modelo original a 0/100 en esta variante, con una divergencia KL de 0,1397 respecto al original. Posteriormente se aplicó cuantización mixta oQ con oMLX v0.7.3, asignando precisión según la importancia de cada tensor: el 54,777% de los pesos lógicos quedan en 3-bit grupo 128, el 22,363% en 3-bit grupo 64, el 14,967% en BF16 y el resto en 2, 4, 5 y 8 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, ya que la model card proporcionada no lo detalla.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-2B.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,331B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se detalla en la información disponible.
- Decodificación especulativa multi-token gracias a la cabeza MTP preservada, que permite generar varios tokens por paso de inferencia.
- Comportamiento sin rechazos: la ablación ARA elimina las respuestas de negativa del modelo alineado, con 0/100 rechazos medidos en la evaluación del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 1,5 GB, por lo que se puede cargar en un Mac con memoria unificada moderada usando la librería mlx. Es adecuado para prototipos y pruebas en local sin GPU dedicada.
- Decodificación especulativa en producción de bajo coste: la cabeza MTP intacta permite acelerar la generación en pipelines que ya usan decodificación especulativa, reduciendo el número de pasos necesarios para producir una secuencia.
- Investigación sobre alineamiento y decensurado: el modelo sirve como caso de estudio reproducible de la técnica ARA de Heretic, con parámetros documentados (capas 12-23, pesos de preservación y corrección) y métricas de rechazo y divergencia KL publicadas.
- Evaluación de cuantización mixta: al distribuir pesos entre 2 y 8 bits con grupos de 64 y 128, es útil para medir el impacto de la precisión mixta en calidad y latencia sobre un modelo pequeño con visión.
- Procesamiento de imágenes en local: si se confirma el soporte de visión, podría usarse para tareas de descripción o clasificación de imágenes en dispositivos con recursos limitados, aunque esta capacidad no está verificada en la información disponible.
- Fine-tuning o adaptación posterior: al conservar la cabeza MTP y estar en safetensors, el checkpoint puede servir como base para ajuste fino con LoRA sobre el modelo decensurado, aunque la cuantización mixta complica este flujo.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3.5-2B original |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para los pesos en el formato cuantizado actual; el pico de memoria durante la inferencia depende del contexto y de la implementación.
- GPU recomendadas: hardware Apple Silicon con memoria unificada, dado que el formato es MLX. No se especifican GPU NVIDIA o AMD compatibles con este checkpoint concreto.
- Cabe en GPU de consumo: sí, en términos de tamaño de pesos (1,5 GB), pero el formato MLX limita su uso a equipos Apple; para GPU NVIDIA habría que reconvertir los pesos.
- Opciones de despliegue: librería mlx (formato nativo); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ2.5-mtp | 2,274B | No disponible | No disponible | safetensors (MLX) | Decensurado con Heretic, cuantización mixta oQ, cabeza MTP intacta |
| Qwen/Qwen3.5-2B | 2,274B (estimado) | No disponible | No disponible | No disponible | Modelo base alineado, 97/100 rechazos |
| Alternativas de ~2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en parámetros, contexto o rendimiento más allá del modelo base.

## Limitaciones y advertencias

- El proceso de decensurado elimina los rechazos del modelo alineado (0/100 frente a 97/100), lo que implica que el modelo puede generar contenido que el original rechazaría; no debe desplegarse en aplicaciones orientadas al público sin filtros externos.
- La divergencia KL de 0,1397 respecto al original indica una modificación sustancial de la distribución de salida, con posible degradación de capacidades no evaluadas.
- La cuantización mixta con media de 5,302 bits/peso, incluyendo tensores en 2 y 3 bits, puede introducir pérdida de calidad adicional no cuantificada en la model card.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base Qwen suele tener licencias específicas que deben verificarse en el repositorio original.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento en castellano u otros idiomas.
- Contexto máximo no disponible: no se conoce la ventana de contexto efectiva tras la cuantización.
- Formato MLX: el checkpoint no es directamente usable en ecosistemas NVIDIA o en frameworks estándar sin conversión.
- Riesgo de alucinación inherente a modelos de 2B parámetros, no mitigado por el proceso de decensurado.
- Sin validación comunitaria: 0 descargas y 0 likes, publicación reciente (12 de noviembre de 2026) y re-cuantizada el mismo día.
- La model card no documenta el dataset de entrenamiento del modelo base ni el proceso de alineamiento original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2.5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (proyecto de decensurado): https://heretic-project.org
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
