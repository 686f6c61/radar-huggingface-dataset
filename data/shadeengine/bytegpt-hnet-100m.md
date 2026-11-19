# ShadeEngine/bytegpt-hnet-100M

## Resumen

H-Net 100M es un modelo de lenguaje experimental desarrollado por ShadeEngine que elimina por completo el tokenizador: lee texto como bytes crudos y aprende por sí mismo dónde cortar la secuencia en fragmentos (chunks) sobre los que opera una red principal. La arquitectura sigue el diseño H-Net del paper arXiv:2507.07955 y se compone de tres piezas: un codificador de 4 capas Mamba-2 que procesa cada byte, un Transformer de 12 capas y anchura 768 que se ejecuta una vez por chunk, y un decodificador de 4 capas Mamba-2 que vuelve a predecir bytes. El resultado es un modelo de 99.765.120 parámetros con vocabulario de 256 valores (un byte por símbolo).

El interés del modelo es comparativo y de investigación: forma parte de un experimento controlado que entrena tres modelos con el mismo presupuesto de cómputo (aproximadamente 1,0e19 FLOPs) y los mismos documentos: un Transformer a nivel de byte, un Transformer con tokenizador BPE de 32k y este H-Net. Sobre FineWeb-Edu, el H-Net obtiene 0,913 bits por byte frente a 0,922 del BPE y 1,036 del modelo de byte, lo que sugiere que el chunking aprendido puede igualar o superar ligeramente a BPE en eficiencia de modelado a igual cómputo.

Es un modelo pequeño, entrenado en dos RTX 3090 durante unos dos días y medio, pensado exclusivamente para estudiar el comportamiento de arquitecturas sin tokenizador. No está destinado a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net de una etapa: codificador Mamba-2 (4 capas) + Transformer (12 capas) + decodificador Mamba-2 (4 capas); layout `["m4", ["T12"], "m4"]` |
| Parametros totales | 99.765.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de entrenamiento de 8.192 bytes (no se documenta contexto de inferencia distinto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; evaluado también en francés y código Python) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo implementa un H-Net de una sola etapa. Un codificador de 4 capas Mamba-2 con anchura 512 procesa cada byte de entrada y produce una predicción de frontera de chunk; una red principal Transformer de 12 capas y anchura 768 se ejecuta una sola vez por chunk; y un decodificador de 4 capas Mamba-2 convierte la representación del chunk en predicciones de byte. El vocabulario es de 256 valores y el byte 254 marca el inicio de cada documento. El tamaño de chunk es aprendido: 3,8 bytes en la distribución de entrenamiento, 2,3 en francés y 1,8 en código Python.

El entrenamiento usó FineWeb-Edu `sample-10BT` como bytes crudos en ventanas de 8.192 bytes, con 72.800 pasos de 524.288 bytes cada uno (38,2 GB de texto, aproximadamente 1,0e19 FLOPs). La función de pérdida es entropía cruzada de siguiente byte más 0,03 veces la "ratio loss" del paper, con objetivo de 4,6 bytes por chunk. Optimizador AdamW con learning rate máximo 6e-4 (duplicado para las redes a nivel de byte), 2.000 pasos de warmup, decaimiento coseno, weight decay 0,1, gradient clipping 1,0 y bfloat16. El entrenamiento se realizó en dos RTX 3090 durante aproximadamente dos días y medio. La lista completa de argumentos está en `config.json`.

## Capacidades

- Generación de texto a nivel de byte, sin tokenizador, en inglés.
- Modelado de lenguaje autorregresivo con predicción del siguiente byte.
- Segmentación aprendida de la secuencia en chunks, con máscara de fronteras accesible en la salida (`bpred_output.boundary_mask`).
- Robustez relativa a errores tipográficos: penalización de 1,241 (pérdida con 1 % de typos dividida por la pérdida limpia), la mejor de los tres modelos comparados.
- Evaluado en inglés, francés y código Python; el rendimiento en francés y Python es inferior al del modelo BPE.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre tokenización: comparar el chunking aprendido con BPE y con modelado a nivel de byte bajo el mismo presupuesto de cómputo, usando los tres modelos del experimento y sus datasets asociados.
- Estudio de robustez a ruido: analizar cómo afectan los errores tipográficos y las secuencias malformadas a un modelo sin tokenizador, gracias a su menor penalización por typos (1,241).
- Experimentos con idiomas de escritura no latina o sin tokenizador maduro: el enfoque a nivel de byte evita el vocabulario sesgado hacia inglés, aunque el modelo solo se entrenó con datos en inglés.
- Análisis de segmentación lingüística: inspeccionar la máscara de fronteras para estudiar qué unidades aprende a delimitar el modelo en distintos dominios (texto educativo, francés, Python).
- Reproducción de resultados académicos: reentrenar o evaluar variantes del H-Net sobre FineWeb-Edu con el código oficial y los datasets publicados.
- Docencia y divulgación: ejemplo ejecutable de arquitectura híbrida SSM + Transformer con decodificación a nivel de byte en GPUs de consumo.

## Benchmarks y rendimiento

Los tres modelos se entrenaron con el mismo presupuesto de cómputo (aproximadamente 1,0e19 FLOPs) y los mismos documentos. Menos es mejor en todas las filas excepto HellaSwag.

| Metrica | Byte Transformer (85M) | BPE Transformer (110M) | H-Net 100M (este modelo) |
|---|---:|---:|---:|
| FineWeb-Edu validación, bits por byte | 1,036 | 0,922 | 0,913 |
| Wikipedia en inglés, bits por byte | 1,118 | 0,988 | 1,034 |
| Wikipedia en francés, bits por byte | 1,944 | 1,836 | 1,865 |
| Código Python, bits por byte | 1,329 | 1,382 | 1,521 |
| HellaSwag accuracy (1.000 preguntas, azar 25 %) | 35,7 % | 38,7 % | 38,8 % |
| Penalización por typos (pérdida con 1 % typos / pérdida limpia) | 1,240 | 1,280 | 1,241 |

Cada conjunto de test son 5 MB de texto no visto durante el entrenamiento. Los bits por byte normalizan la pérdida por los bytes cubiertos, lo que permite comparar modelos con tokenizadores distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,4 GB en safetensors; en bfloat16 el modelo ocupa aproximadamente 0,2 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con al menos 4-6 GB considerando activaciones y el entorno de `mamba-ssm`/`flash-attn`.
- GPU recomendadas: el autor indica que requiere una GPU CUDA; el entrenamiento se hizo en dos RTX 3090.
- Cabe en GPU consumer: sí, en RTX 3090 y previsiblemente en tarjetas con suficiente VRAM para las dependencias de CUDA y kernels compilados.
- Opciones de despliegue: únicamente el código oficial de H-Net (`github.com/goombalab/hnet`, commit `3673fe1`), instalado con `pip install -e .`; requiere `mamba-ssm` y `flash-attn`. No está en PyPI y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | FineWeb-Edu (bits/byte) | HellaSwag | Licencia |
|---|---:|---|---:|---:|---|
| H-Net 100M (este modelo) | 99,8M | Chunking aprendido, sin tokenizador | 0,913 | 38,8 % | no disponible |
| Byte Transformer 85M (ShadeEngine) | ~85M | Transformer a nivel de byte | 1,036 | 35,7 % | no disponible |
| BPE Transformer 110M (ShadeEngine) | ~110M | Transformer con tokenizador BPE 32k | 0,922 | 38,7 % | no disponible |

Los tres modelos pertenecen al mismo experimento controlado del mismo autor, con igual cómputo y datos, por lo que la comparación es directa. No se dispone de datos de otros modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Una sola ejecución de entrenamiento por modelo: diferencias de un 1-2 % podrían ser ruido estadístico.
- Modelo de investigación pequeño entrenado con texto web educativo; escribe inglés fluido pero a menudo factualmente incorrecto. El propio autor desaconseja usarlo más allá del estudio de su comportamiento.
- El H-Net se estabilizó en 3,7 bytes por chunk (frente a 4,6 del tokenizador), por lo que su red principal ejecutó más pasos por byte y vio menos texto (38 GB frente a 60 GB del modelo BPE) con el mismo cómputo.
- Rendimiento claramente peor en código Python (1,521 bits por byte frente a 1,329 del modelo de byte y 1,382 del BPE).
- Solo entrenado en inglés; el rendimiento en francés es inferior al del modelo BPE.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Requiere GPU CUDA y dependencias frágiles (`mamba-ssm`, `flash-attn`) con código no publicado en PyPI.
- Riesgo de alucinación alto dado el tamaño y la naturaleza del corpus de entrenamiento.
- Sin soporte documentado de tool calling, agentes, visión ni cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadeEngine/bytegpt-hnet-100M
- Modelo Byte Transformer: https://huggingface.co/ShadeEngine/bytegpt-byte-85M
- Modelo BPE Transformer: https://huggingface.co/ShadeEngine/bytegpt-bpe32k-110M
- Dataset de bytes: https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bytes-10BT
- Dataset BPE: https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bpe32k-10BT
- Paper H-Net: https://arxiv.org/abs/2507.07955
- Código oficial: https://github.com/goombalab/hnet
- Artículo del autor: https://claude.ai/artifact/AamTLQSJGp6uYueALTKjtm
- Posts de Cartesia "From Tokens to Bytes": https://www.cartesia.ai/blog/from-tokens-to-bytes-part-1
