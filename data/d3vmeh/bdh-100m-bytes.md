# d3vmeh/bdh-100m-bytes

## Resumen

BDH 100M Bytes es un modelo de lenguaje de 100,9 millones de parametros basado en la arquitectura Dragon Hatchling (BDH), una propuesta reciente publicada en el paper arXiv:2509.26507 por Pathway. Lo desarrolla el usuario d3vmeh como implementacion de referencia a pequena escala y predice un byte cada vez, sin tokenizador BPE. Forma parte de una pareja de modelos: este usa un vocabulario de 256 bytes y su gemelo `bdh-100m-bpe8k` emplea un vocabulario BPE de 8.192 tokens.

La relevancia del modelo es experimental y educativa: sirve para estudiar el comportamiento de la arquitectura BDH (seis capas que comparten pesos, activacion dispersa de neuronas) en un presupuesto de entrenamiento modesto (una sola H100 durante unas 27 horas). No es un modelo de proposito general ni compite con LLMs convencionales de su tamano en calidad de generacion.

El contexto de entrenamiento es de 512 posiciones y el modelo es unicamente base, sin ajuste fino ni alineacion. Su rendimiento se reporta en bits por caracter (bpc), no en benchmarks estandar, y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dragon Hatchling (BDH) de referencia: 6 capas con pesos compartidos, 4 cabezas, ancho residual 512, 16.384 neuronas activadas de forma dispersa por cabeza |
| Parametros totales | 100,9 M |
| Parametros activos | no disponible (no es MoE clasico; la dispersion es a nivel de neuronas por cabeza, con densidad de activacion del 11,2 % por posicion) |
| Longitud de contexto | 512 posiciones (bloque de entrenamiento); en generacion se usa una ventana deslizante de 480 posiciones |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint de PyTorch con claves `config` y `model`) |

## Arquitectura y entrenamiento

El modelo sigue la implementacion de referencia BDH de `pathwaycom/bdh` (arXiv:2509.26507): seis capas que comparten un unico conjunto de pesos, cuatro cabezas de atencion y un ancho residual de 512. Cada cabeza activa de forma dispersa 16.384 neuronas, lo que da lugar a una densidad de activacion media del 11,2 % por posicion (frente al ~50 % de un modelo no entrenado de la misma forma). El vocabulario es de 256 bytes, de modo que la prediccion es byte a byte y no requiere tokenizador.

El entrenamiento uso 5,4 GB de texto compuesto al 83 % por FineWeb-Edu y al 17 % por TinyStories (split de entrenamiento), muestreado en bloques de 512 bytes sin arrastrar estado entre bloques. Se realizaron 165.000 pasos de 64 secuencias (32.768 bytes por paso) con AdamW, weight decay 0,1, learning rate de 1e-3 a 1e-4 con schedule coseno y 2.000 pasos de warmup, dropout 0,1 y autocast en bf16. El coste total fue de una H100 durante aproximadamente 27 horas, con una sola semilla de entrenamiento. La relacion es de 54 bytes de texto por parametro de capa compartida.

## Capacidades

- Generacion de texto en ingles a nivel de byte, con completado plano (modo `RAW=1` en el script de generacion del repositorio).
- Modelado de lenguaje base: no incluye instrucciones, chat ni alineacion.
- Retencion de informacion en contexto a corta distancia: es capaz de almacenar un hecho plantado previamente en el contexto (la palabra plantada se vuelve miles de veces mas probable), con recall top-1 del 57 % a 64 caracteres y del 17 % a 128 caracteres (30 ensayos por medida).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre arquitecturas alternativas: reproducir y analizar el comportamiento de BDH con pesos compartidos y activacion dispersa en un modelo pequeno que cabe en una sola GPU, comparandolo con el gemelo BPE y con un transformer rotatorio equivalente.
- Experimentos de modelado a nivel de byte: estudiar el efecto del vocabulario de 256 bytes frente a BPE de 8.192 tokens en tareas de compresion (bpc) y generacion, usando los checkpoints publicados.
- Docencia y divulgacion: ilustrar conceptos como pesos compartidos entre capas, dispersion de neuronas y ventanas deslizantes de contexto con un modelo de 0,4 GB de repositorio.
- Generacion de texto corto en ingles para pruebas de infraestructura: validar pipelines de inferencia en PyTorch con el codigo del repositorio antes de escalar a modelos mayores.
- Pruebas de memoria en contexto: evaluar la retencion de hechos plantados a distintas distancias (64, 128 caracteres) como banco de pruebas de mecanismos de estado sinaptico.
- Baseline en experimentos de destilacion o ajuste fino: partir de un modelo base byte-level de 100 M para tareas acotadas en ingles, asumiendo la necesidad de ajuste adicional.

## Benchmarks y rendimiento

El autor reporta bits por caracter (bpc) sobre 3 MB de texto retenido (parte del shard 013 de FineWeb-Edu y el split de validacion de TinyStories), evaluado en bloques de 512 posiciones:

| Texto | bpc |
|---|---|
| FineWeb-Edu (parte) | 1,118 |
| TinyStories (parte) | 0,666 |
| Combinado | 1,042 |

Comparativas reportadas por el autor sobre el mismo texto:

| Modelo | bpc combinado | Diferencia relativa |
|---|---|---|
| BDH 100M bytes (este modelo) | 1,042 | referencia |
| BDH 100M BPE 8k (gemelo) | 0,964 | 7,5 % inferior |
| Transformer rotatorio equivalente (mismo numero de parametros de capa compartida, receta y texto) | 1,107 | 6,2 % superior |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,4 GB, por lo que el checkpoint en bf16 ocupa del orden de 0,2 GB de pesos; la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte de PyTorch y bf16; el entrenamiento se realizo en una H100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: el autor solo documenta inferencia con PyTorch y el `bdh.py` del repositorio de codigo; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El script `chat_stream.py` con `RAW=1` implementa streaming byte a byte con ventana deslizante de 480 posiciones, de modo que cada posicion cuesta lo mismo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | bpc combinado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BDH 100M bytes (este) | 100,9 M | 512 | 256 bytes | 1,042 | MIT | Hugging Face |
| BDH 100M BPE 8k | no disponible (misma estructura) | 512 | 8.192 tokens BPE | 0,964 | no disponible | Hugging Face |
| Transformer rotatorio equivalente | mismo numero de parametros de capa compartida | 512 | no disponible | 1,107 | no disponible | no disponible |

No se dispone de comparaciones con modelos de proposito general del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno entrenado con solo 5,4 GB de texto: "conoce la forma de los hechos antes que el contenido de los hechos", segun el autor.
- Entrenado en bloques de 512 bytes sin estado entre bloques: sin la ventana deslizante, las predicciones degradan mas alla de 512 posiciones.
- Recall de hechos en contexto limitado: 57 % top-1 a 64 caracteres y 17 % a 128 caracteres, lo que restringe su uso en tareas que dependan de contexto largo.
- Una sola semilla de entrenamiento: los resultados pueden no ser representativos de la variabilidad esperable.
- Solo ingles y solo texto; sin alineacion, sin instrucciones y sin herramientas.
- Riesgo de alucinacion alto por tratarse de un modelo base de muy baja escala y sin ajuste.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el paper asociado se publica bajo CC BY 4.0.
- No se documentan sesgos especificos, pero el corpus FineWeb-Edu y TinyStories puede introducir los sesgos propios de datos web filtrados y cuentos infantiles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d3vmeh/bdh-100m-bytes
- Codigo: https://github.com/d3vmeh/small-dragon-hatchling
- Paper del modelo (Zenodo, CC BY 4.0): https://doi.org/10.5281/zenodo.23325933
- Paper de la arquitectura BDH: https://arxiv.org/abs/2509.26507
- Implementacion de referencia BDH: https://github.com/pathwaycom/bdh
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
