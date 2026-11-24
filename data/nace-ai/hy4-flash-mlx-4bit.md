# nace-ai/Hy4-flash-MLX-4bit

## Resumen

Hy4-flash-MLX-4bit es una cuantización de 4 bits del modelo Hy4-flash de Tencent, publicada por nace-ai y empaquetada para la librería mlx-lm de Apple. El modelo base es un transformer de gran escala con 220.251.201.958 parámetros totales (según los pesos en safetensors), orientado a generación de texto conversacional y con un esquema de expertos enrutados (MoE) que incluye tablas n-gram denominadas Engram, además de una torre de visión que no se ejecuta en esta variante.

La contribución principal de nace-ai es su método Nace Weight Space Quantization, que asigna precisión de forma diferenciada por clase de pesos: los expertos enrutados se recomprimen a 4 bits, las tablas Engram se almacenan en 4 bits con grupos más finos, y atención, expertos compartidos, embeddings y cabeza de salida se mantienen en 8 bits, mientras que router, normas y otros pesos pequeños sensibles conservan su precisión original. El resultado son 131,20 GB de pesos de texto completos con 4,8 bits por peso y una divergencia KL de 0,113 frente al modelo nativo, con un 90,5 % de acuerdo top-1.

Es relevante para desarrolladores que quieran ejecutar un modelo de más de 220.000 millones de parámetros en hardware Apple Silicon mediante MLX, con decodificación especulativa opcional (DFly2) que acelera la generación, y para quienes necesiten comparar estrategias de cuantización midiendo fidelidad frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y tablas n-gram Engram; incluye torre de visión no ejecutable en esta variante |
| Parametros totales | 220.251.201.958 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en expertos enrutados y tablas Engram (grupos más finos); 8 bits en atención, expertos compartidos, embeddings y cabeza de salida; precisión original en router, normas y pesos pequeños sensibles; media de 4,8 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (incluye términos comerciales de la Sección 10 para grandes operadores de Model-as-a-Service) |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash emplea una arquitectura transformer con mezcla de expertos (MoE): un conjunto de expertos enrutados por token más expertos compartidos, atención y una cabeza de salida, complementados por tablas n-gram Engram que actúan como memoria de secuencias. La variante publicada por nace-ai no reentrena el modelo, sino que lo cuantiza: los expertos enrutados pasan a 4 bits, las tablas Engram a 4 bits con agrupación más fina, y los componentes más sensibles (atención, expertos compartidos, embeddings, cabeza de salida, router y normas) se mantienen en 8 bits o en su precisión original. El repositorio incluye además un borrador especulativo DFly2 y un script `run_mlx.py` para ejecución con mlx-lm 0.32.2 o superior y `trust_remote_code`, que carga `hy_v4_flash.py`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La model card solo documenta el proceso de cuantización y la evaluación de fidelidad: 37 variantes medidas sobre los mismos 11 textos y 5.621 tokens puntuados, con 511 posiciones de siguiente token por texto y divergencia KL frente al modelo nativo.

## Capacidades

- Generación de texto conversacional y de instrucciones, evaluada en la model card sobre textos de prosa, código, matemáticas, multilingüe y escritura de instrucciones.
- Razonamiento y generación de código, con aceleración específica de decodificación especulativa en código (3,4x en B200).
- Matemáticas, según los dominios cubiertos en la evaluación de cuantización.
- Capacidades multilingües presentes en el conjunto de evaluación, aunque los idiomas concretos no están documentados.
- Decodificación especulativa con el borrador DFly2 incluido en el repositorio, activable con `--dfly`.
- Torre de visión incluida en los pesos, pero no ejecutable en este archivo de modelo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo se ejecuta con mlx-lm 0.32.2 o superior y permite mapear los pesos desde el SSD en un M5 Pro, lo que facilita probar un modelo de 220.000 millones de parámetros en un portátil sin cargar los 131,20 GB en memoria de forma completa.
- Generación de código asistida: la decodificación especulativa DFly2 acelera la generación de código 3,4x en B200, lo que la hace adecuada para autocompletado y generación de fragmentos en entornos de desarrollo con hardware Apple o NVIDIA.
- Evaluación de estrategias de cuantización: investigadores pueden usar esta variante como referencia de 4 bits (KL 0,113, 90,5 % top-1) y compararla con otras cuantizaciones como Xylolabs MLX 4-bit (KL 0,116, 160,18 GB) para medir el compromiso entre tamaño y fidelidad.
- Procesamiento de texto multilingüe y prosa: los 11 textos de evaluación cubren prosa, multilingüe e instrucciones, por lo que el modelo es apto para tareas de redacción y transformación de texto en varios idiomas, siempre que se validen los idiomas concretos.
- Razonamiento matemático y resolución de problemas: el modelo base está evaluado en dominios de matemáticas, por lo que puede emplearse en asistentes de cálculo y explicación paso a paso.
- Despliegue en pipelines de generación de texto con MLX: integrable mediante `run_mlx.py` o la API de mlx-lm en flujos de generación por lotes, con la opción de activar o desactivar la decodificación especulativa según la tolerancia a variaciones en la salida.
- Investigación sobre cuantización ponderada por clase: el enfoque Nace Weight Space Quantization sirve como caso de estudio reproducible para analizar cómo afecta la precisión por tipo de peso a la divergencia KL.

## Benchmarks y rendimiento

| Metrica | Hy4-flash-MLX-4bit | Xylolabs MLX 4-bit |
|---|---|---|
| Divergencia KL frente al modelo nativo | 0,113 | 0,116 |
| Acuerdo top-1 con el modelo nativo | 90,5 % | no disponible |
| Tamano de pesos de texto completos | 131,20 GB | 160,18 GB |
| Bits por peso | 4,8 | no disponible |
| Aceleración con DFly2 en B200 (media) | 2,1x | no disponible |
| Aceleración con DFly2 en B200 (código) | 3,4x | no disponible |

Las puntuaciones se obtuvieron sobre 11 textos de comparación, 511 posiciones de siguiente token cada uno, midiendo la divergencia KL frente al modelo nativo Hy4-flash. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de texto completos ocupan 131,20 GB; con overhead de activaciones y caché KV, se recomienda al menos 140-160 GB de memoria unificada o VRAM para carga completa.
- GPU recomendadas: NVIDIA B200 (probado por el autor con mlx-lm 0.32.2 y mlx 0.32.4); Apple Silicon de gama alta como M5 Pro con mapeo de pesos desde SSD.
- Cabe en consumer GPU: no de forma completa; en GPUs de consumo (RTX 4090, 24 GB) no es viable sin offloading agresivo o ejecución parcial, no documentada.
- Opciones de despliegue: mlx-lm 0.32.2 o superior con `trust_remote_code` y el script `run_mlx.py`; decodificación especulativa opcional con `--dfly`.
- Latencia y throughput: en B200, la decodificación especulativa DFly2 decodifica 2,1x más rápido que la decodificación greedy simple en media y 3,4x en código; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-4bit (nace-ai) | 220.251.201.958 | no disponible | 4/8 bits mixta, 4,8 bits por peso | Tencent Hy License 1.0 | Hugging Face, 429 descargas |
| Xylolabs MLX 4-bit | no disponible | no disponible | 4 bits | no disponible | no disponible |
| tencent/Hy4-flash (nativo) | no disponible | no disponible | precision original | Tencent Hy License 1.0 | Hugging Face |

La comparación se limita a las variantes documentadas en la model card; no se dispone de datos de otros modelos de la misma categoría para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantización introduce desviaciones respecto al modelo nativo: 0,113 de divergencia KL y 90,5 % de acuerdo top-1, lo que implica que en aproximadamente 1 de cada 10 posiciones el token más probable difiere del original.
- La decodificación especulativa DFly2 puede producir salidas distintas de la decodificación greedy simple cuando dos tokens están casi empatados.
- La torre de visión está incluida en los pesos pero no se ejecuta en este archivo de modelo, por lo que no hay capacidades de visión disponibles.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en casos multilingües o de contexto largo.
- No hay información sobre sesgos conocidos ni sobre la tasa de alucinación del modelo base.
- La licencia Tencent Hy License 1.0 incluye términos comerciales específicos en su Sección 10 para grandes operadores de Model-as-a-Service; es necesario revisar `LICENSE` y `MODIFICATIONS.md` antes de un uso comercial.
- El requisito de `trust_remote_code` implica ejecutar código del repositorio (`hy_v4_flash.py`), lo que añade un riesgo de seguridad en entornos de producción.
- El tamaño de 131,20 GB de pesos limita el despliegue a hardware de gama alta o a esquemas de mapeo desde disco, con la latencia asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio del autor: https://www.nace.ai/
- Licencia: LICENSE (incluido en el repositorio)
- Modificaciones: MODIFICATIONS.md (incluido en el repositorio)
- Datos de comparación de cuantización: assets/combined-kl.json (incluido en el repositorio)
- Gráfico de calidad de cuantización: assets/combined-kl.png (incluido en el repositorio)
