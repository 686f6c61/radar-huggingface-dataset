# Project-KERN/KERN-Lab-0.5-624M

## Resumen

KERN-Lab-0.5-624M es un modelo de lenguaje experimental para continuacion de texto desarrollado por Project KERN. Se construye a partir de Qwen3-0.6B-Base mediante una adaptacion que sustituye uno de los bloques feed-forward del transformer (concretamente el de la capa 14, indexada desde cero) por una mezcla dispersa de expertos (sparse MoE) con un experto compartido y tres expertos enrutados con top-2. El resto del backbone preentrenado y el tokenizador original de Qwen se mantienen intactos.

El modelo cuenta con 624.364.544 parametros residentes y 614.927.360 parametros activos por token segun la convencion de conteo del autor, distribuidos en 28 capas transformer. Hereda la ventana de contexto configurada de Qwen, de 32.768 tokens, y se distribuye en precision BF16 con el router en FP32. La adaptacion es muy ligera: solo 200 pasos de optimizador sobre 203.948 tokens utiles, lo que lo situa como una prueba de concepto de insercion de MoE en un modelo denso pequeno mas que como un modelo listo para produccion.

Su relevancia es fundamentalmente de investigacion: demuestra que es posible inyectar un bloque MoE disperso en un backbone denso ya entrenado con un coste de adaptacion minimo y sin degradar de forma apreciable la perplejidad medida en bits por byte (BPB). No obstante, el propio autor advierte de que la mejora observada es una observacion de desarrollo y que seria necesario un test final independiente para establecer una ganancia de calidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con un bloque feed-forward sustituido por sparse MoE (capa 14, indexada desde cero); 28 capas |
| Parametros totales | 624.364.544 |
| Parametros activos | 614.927.360 (convencion de conteo del autor) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; router en FP32) |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code con trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B-Base, un transformer decoder-only de 28 capas. La modificacion consiste en reemplazar el bloque feed-forward de la capa 14 por una mezcla dispersa de expertos compuesta por un experto compartido y tres expertos enrutados, con enrutamiento top-2. Los pesos se almacenan en BF16 y el router se mantiene en FP32 para preservar la precision del enrutamiento. El tokenizador y el resto del backbone preentrenado se conservan del modelo original, con la revision upstream fijada en `da87bfb608c14b7cf20ba1ce41287e8de496c0cd`.

El entrenamiento de adaptacion es extremadamente corto: 200 pasos de optimizador sobre 203.948 tokens utiles. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un ajuste de continuacion de texto sobre un modelo base. La seleccion del checkpoint se realizo mediante BPB sobre un conjunto de desarrollo B de 262.144 bytes, con un conjunto A de 45.088 bytes como referencia adicional. Los resultados de desarrollo muestran BPB de 0,720886 en el conjunto A y 1,088243 en el conjunto B para el checkpoint liberado (semilla 42), frente a 0,728382 y 1,091826 del Qwen original, respectivamente. El autor senala que la mejora en B es una observacion de desarrollo y que las ganancias en contexto largo, razonamiento, velocidad en runtime y especializacion semantica de expertos quedan sin verificar.

## Capacidades

- Generacion de texto y continuacion de prefijos (text continuation), que es el unico uso declarado por el autor.
- Modelo base sin instruction tuning ni alineacion para chat; no esta disenado para seguir instrucciones.
- Soporte multilingue limitado a ingles y portugues segun los metadatos del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Compatible con el pipeline `text-generation` de transformers mediante AutoClass con `trust_remote_code=True`.
- Incluye una interfaz web local opcional basada en Gradio para introducir un prefijo y obtener su continuacion.

## Casos de uso

- Investigacion sobre arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar la insercion de bloques dispersos en backbones densos ya preentrenados, comparando BPB y comportamiento del enrutamiento con el modelo base.
- Experimentos de adaptacion de bajo coste: con solo 200 pasos y 203.948 tokens, es util para reproducir y extender metodologias de adaptacion ligera en entornos con recursos limitados.
- Continuacion de texto en ingles y portugues: puede emplearse para completar prefijos en tareas de generacion libre donde no se requiera alineacion ni seguimiento de instrucciones.
- Docencia y divulgacion: su tamano (624M parametros, repo de 1,2 GB) y su licencia Apache-2.0 lo hacen adecuado para demostraciones en aula o tutoriales sobre transformers y MoE.
- Pruebas de integracion de `trust_remote_code`: util para validar flujos de carga de modelos con codigo personalizado en transformers antes de aplicarlos a modelos mayores.
- Evaluacion de infraestructura de inferencia: permite medir latencia y uso de memoria en CPU y GPU con un modelo pequeno antes de escalar a variantes mayores de la familia KERN.

## Benchmarks y rendimiento

Los unicos datos publicados son medidas de desarrollo en bits por UTF-8 byte (BPB), donde menor es mejor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | BPB conjunto A (45.088 bytes) | BPB conjunto B (262.144 bytes) |
|---|---:|---:|
| Qwen original | 0,728382 | 1,091826 |
| Control denso entrenado | 0,720180 | 1,090734 |
| KERN MoE semilla 42 (checkpoint liberado) | 0,720886 | 1,088243 |
| KERN MoE semilla 1337 | 0,720581 | 1,088777 |

El conjunto B se uso para seleccionar el checkpoint. El autor indica que seria necesario un test final independiente para establecer una ganancia de calidad general, y que las 155 pruebas superadas pertenecen a la suite interna de ingenieria del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 624M parametros en BF16 el peso ronda 1,25 GB, y en FP32 alrededor de 2,5 GB, a lo que hay que sumar la cache KV para el contexto utilizado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte BF16 para ejecucion en `bfloat16`; en GPU sin BF16 se indica usar `float32`.
- Cabe en GPU de consumo: si, por el tamano del modelo; el autor no publica cifras especificas de VRAM ni de modelos concretos de GPU.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `trust_remote_code=True`; el repositorio incluye `generate.py` para linea de comandos y `app.py` con interfaz Gradio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| KERN-Lab-0.5-624M | 624.364.544 | 32.768 | Transformer con un bloque MoE | Apache-2.0 | Experimental |
| Qwen3-0.6B-Base | No disponible en la informacion | 32.768 (heredado por KERN) | Transformer denso | No disponible en la informacion | Modelo base upstream |
| Otros modelos de ~600M comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico contraste documentado es frente al propio Qwen original y a un control denso entrenado, con los valores de BPB recogidos en la seccion anterior.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y advierte de que las salidas pueden ser incorrectas, repetitivas o inseguras.
- Sin instruction tuning ni alineacion para chat; no debe esperarse seguimiento de instrucciones.
- La mejora de calidad medida es una observacion de desarrollo sobre un conjunto B; no se ha validado con un test final independiente.
- Contexto largo, ganancias de razonamiento, mejoras de velocidad en runtime y especializacion semantica de expertos quedan sin verificar.
- Idiomas soportados limitados a ingles y portugues; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez.
- Requiere `trust_remote_code=True` para cargar el modulo Python del repositorio; el autor recomienda revisar ese codigo y fijar la revision por SHA antes de usarlo.
- Licencia Apache-2.0 permite uso comercial, pero el nombre Project KERN esta sujeto a las directrices de marca recogidas en TRADEMARK.md.
- El autor indica que el nombre "0.5" es una etiqueta de familia redondeada; los conteos exactos son los de la tabla de especificaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-KERN/KERN-Lab-0.5-624M
- Repositorio del proyecto: https://github.com/arthurvalentimfarias/Project-KERN
- Notebook de Colab: https://colab.research.google.com/github/arthurvalentimfarias/Project-KERN/blob/main/KERN_Colab.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- PyTorch (instalacion): https://pytorch.org/get-started/locally/
