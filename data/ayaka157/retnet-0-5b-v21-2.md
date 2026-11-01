# Ayaka157/RetNet-0.5B-v21.2

## Resumen

RetNet-0.5B-v21.2 es un modelo de lenguaje de 504.179.896 parámetros desarrollado por el usuario Ayaka157 y publicado en HuggingFace bajo licencia MIT. Se trata de una implementación de la arquitectura RetNet (Retentive Network), una alternativa a los transformers clásicos que sustituye la atención por un mecanismo de retención con decaimiento aprendido por cabeza, lo que permite formulaciones paralelas, recurrentes y por bloques (chunkwise). El modelo es un export de investigación orientado a estudiar el comportamiento del contexto largo, no un modelo de producción.

La relevancia de esta ficha reside en su honestidad documental: el autor publica un informe técnico con resultados negativos medidos. El entrenamiento de contexto largo (13.000 pasos, 0,852 B tokens) redujo la perplejidad de cola larga a 16k de 3,2841 a 2,5942, pero el análisis demuestra que la mejora es un desplazamiento uniforme de nivel (-0,68 a -0,72 nats en todos los buckets de posición) y no un efecto posicional real. La recuperación tipo needle a 16k es de 0,0978, prácticamente equivalente al azar (brazo nulo 0,1024, item_acc 0/360).

El modelo tiene 20 capas, anchura 1408, 22 cabezas, dimensión de valor/FFN de 2816, vocabulario de 20.000 tokens ByteLevel BPE y contexto de entrenamiento de 2048 tokens. Se almacena en fp32 (1,92 GB) y debe cargarse en bfloat16 para inferencia. Es, por tanto, un artefacto de investigación útil para reproducir y estudiar los límites de la retención con decaimiento aprendido, no una base recomendable para despliegues de recuperación de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (retention), 20 capas, anchura 1408, 22 cabezas, dim. valor/FFN 2816 |
| Parametros totales | 504.179.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de entrenamiento; export evaluado a 16k con resultados negativos en retrieval |
| Tipos de cuantizacion | no disponible (solo se documenta fp32 en safetensors y carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 1,92 GB); repo de 2,0 GB |

## Arquitectura y entrenamiento

RetNet sustituye la atención multi-cabeza por un mecanismo de retención que admite tres modos de cómputo equivalentes: forma paralela para prefill/serving, forma chunkwise para entrenamiento y forma recurrente para decodificación. El modelo implementa decaimiento gamma aprendido por cabeza y una rama GLA (Gated Linear Attention) presente en el código pero desactivada (`gla_rank=0`). La decodificación puede usar `RETNET_FAST_CHUNKWISE=1` para chunkwise por lotes. Los ficheros de modelado (`modeling_retnet.py`, `retention_fast.py`, `fused_ce.py`) provienen del codebase publicado de RetNet y requieren `trust_remote_code=True`.

El entrenamiento de contexto largo consistió en 13.000 pasos sobre 0,852 B tokens. El resultado principal es que los decaimientos aprendidos colapsaron durante el entrenamiento: la vida media máxima es de 1.649 tokens, ninguna cabeza alcanza una vida media de 2.048 tokens y el peso máximo a 16k es de 0,00102. Esto explica que la ventana efectiva no cubra la longitud extendida y que la recuperación a 16k quede en el nivel del azar. No se documentan fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva en modo causal, con decodificación recurrente o chunkwise.
- Modelado de lenguaje a contexto de 16k funcional en términos de perplejidad (con la salvedad de que la mejora es un desplazamiento uniforme, no posicional).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Modos de atención: paralelo (prefill), chunkwise (entrenamiento) y recurrente (decodificación).

## Casos de uso

- Investigación sobre mecanismos de retención: el modelo permite reproducir los experimentos del informe técnico y estudiar por qué el decaimiento aprendido colapsa a vidas medias cortas, comparando con variantes de GLA o decaimientos fijos.
- Estudio de contexto largo con resultados negativos controlados: sirve como línea base documentada para medir retrieval a 16k (0,0978 frente a 0,1024 del brazo nulo) y contrastar con arquitecturas alternativas.
- Docencia y divulgación: un checkpoint pequeño (0,5B) y ligero (2 GB) es adecuado para explicar las tres formulaciones de RetNet y ejecutar demos en el playground del autor.
- Pruebas de integración de `trust_remote_code`: útil para validar pipelines de carga de modelos con código personalizado en transformers sin depender de pesos propietarios.
- Benchmarking de eficiencia de decodificación recurrente: permite medir latencia y memoria frente a transformers de tamaño similar en GPUs de consumo.
- Desarrollo de tooling de evaluación de retrieval: los scripts del repositorio y el conjunto needle a 16k pueden reutilizarse como plantilla para evaluar otros modelos de contexto largo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de cola larga a 16k (antes) | 3,2841 |
| Perplejidad de cola larga a 16k (despues) | 2,5942 |
| Mejora por bucket de posicion | -0,68 a -0,72 nat (desplazamiento uniforme) |
| Needle retrieval a 16k | 0,0978 |
| Brazo nulo (control) | 0,1024 |
| item_acc en retrieval | 0/360 |
| Vida media maxima aprendida | 1.649 tokens |
| Cabezas con vida media >= 2.048 | 0 |
| Peso maximo a 16k | 0,00102 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2 GB solo para pesos, más overhead de activaciones y KV equivalente; en bfloat16 se reduce a unos 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en bfloat16; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores; también en Apple Silicon vía Metal con llama.cpp si se exporta a GGUF (no documentado).
- Opciones de despliegue: transformers con `trust_remote_code=True`; el playground oficial en https://retnet.ayaka157.icu/play/; vLLM, TGI, llama.cpp u Ollama no están documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Retrieval a contexto largo |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.2 | 504 M | 2048 (entrenamiento); 16k export negativo | RetNet | MIT | 0,0978 a 16k (azar) |
| Alternativas de 0,5B tipo transformer | ~500 M | 2k-8k típico | Transformer | variable | no disponible |
| Modelos SSM/híbridos de 0,5B | ~500 M | variable | SSM/híbrido | variable | no disponible |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El propio autor advierte: no usar este export para retrieval a 16k; los resultados están al nivel del azar (item_acc 0/360).
- El decaimiento aprendido colapsó: ninguna cabeza supera una vida media de 2.048 tokens, por lo que la ventana efectiva no cubre el contexto extendido.
- La mejora de perplejidad a 16k es un desplazamiento uniforme de nivel, no un efecto posicional; no debe interpretarse como comprensión de contexto largo.
- Idiomas soportados no declarados; el vocabulario es de solo 20.000 tokens ByteLevel BPE, lo que limita la cobertura multilingüe.
- No hay evidencia de alineación (RLHF/DPO); riesgo de alucinación y de salidas no deseadas no cuantificado.
- Licencia MIT permite uso comercial, pero el modelo es un export de investigación sin garantías de calidad en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar `modeling_retnet.py` y `retention_fast.py` antes de desplegar.
- Pesos en fp32 (1,92 GB); cargar en bfloat16 para inferencia según indica el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.2
- Repositorio de código y análisis: https://github.com/Ayaka157/RetNet
- Informe técnico (2026-10-29): https://github.com/Ayaka157/RetNet/blob/main/docs/latex/en/RetNet-0.5B-Technical-Report.pdf
- Demo/playground: https://retnet.ayaka157.icu/play/
