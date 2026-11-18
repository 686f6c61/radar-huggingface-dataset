# building-an-inference-engine-from-scratch/mnist-tflite

## Resumen

`mnist-tflite` es un repositorio de dos clasificadores de dígitos manuscritos (MNIST) en formato `.tflite`, publicados por el autor del libro *Building an Inference Engine from Scratch* (en coreano: 밑바닥부터 만드는 추론 엔진). No es un modelo de lenguaje ni un modelo fundacional: son artefactos didácticos pensados para que el intérprete de grafos del motor de inferencia `badak`, escrito en Rust, tenga ficheros reales que leer en el capítulo 26 de la obra.

El repositorio contiene dos variantes: un perceptrón multicapa (`mlp.tflite`, 101.770 parámetros) y una red con conexiones residuales (`residual.tflite`, 992.266 parámetros). Ambos reciben un vector de 784 píxeles normalizados en `[0, 1]` y devuelven diez probabilidades correspondientes a los dígitos 0-9. La normalización `(x − 0.1307) / 0.3081` está plegada dentro del grafo, de modo que el consumidor no tiene que aplicarla.

Su relevancia es exclusivamente pedagógica y de ingeniería de inferencia: sirven para validar un runtime propio (carga de FlatBuffers, resolución de operadores `FULLY_CONNECTED`, `ADD` y `SOFTMAX`, gestión de tensores) contra una referencia conocida, no para aplicaciones de producción. La licencia es MIT y el tamaño del repositorio es de 0,0 GB según Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (784 → 128 → 10, ReLU) y red residual (784 → 256, 3 bloques residuales 256 → 512 → 256, 256 → 10) |
| Parametros totales | 101.770 (`mlp.tflite`) / 992.266 (`residual.tflite`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 784 valores) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son `.tflite`; la model card no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (clasificador de imágenes, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.tflite` (LiteRT/TensorFlow Lite); `reference.safetensors` con las salidas de referencia |
| Operadores del grafo | `FULLY_CONNECTED` × 2 + `SOFTMAX` (mlp); `FULLY_CONNECTED` × 8 + `ADD` × 3 + `SOFTMAX` (residual) |
| Entrada | tensor `(1, 784)` con píxeles en `[0, 1]`; normalización incluida en el grafo |
| Salida | tensor `(1, 10)` con probabilidades por dígito |
| Precisión en test | 97,64 % (9.764/10.000) en `mlp`; 97,73 % (9.773/10.000) en `residual` |
| Librería declarada | `litert` |
| Dataset | `ylecun/mnist` |

## Arquitectura y entrenamiento

El modelo `mlp.tflite` es un perceptrón multicapa de dos capas totalmente conectadas (784 → 128 → 10) con activación ReLU y salida softmax; sus pesos coinciden con los del repositorio hermano `mnist-mlp`. El modelo `residual.tflite` proyecta la entrada a 256 dimensiones y aplica tres bloques residuales con expansión interna a 512 y proyección de vuelta a 256, seguidos de una capa final 256 → 10. En el grafo de LiteRT esto se traduce en ocho operadores `FULLY_CONNECTED`, tres `ADD` (las conexiones residuales) y un `SOFTMAX`.

El proceso de generación está documentado: el script `reference/ch26_make_tflite.py` convierte los modelos PyTorch con `litert-torch` 0.10.0 sobre `ai-edge-litert` 2.3.0 y PyTorch 2.14.1. El modelo residual se entrenó con semilla 0, optimizador Adam (tasa de aprendizaje 0,001), tamaño de lote 64 y 4 épocas sobre CPU. No se documenta el número de tokens ni composición de dataset más allá del conjunto MNIST estándar (60.000 imágenes de entrenamiento y 10.000 de test), ni se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de este tipo. La innovación técnica relevante es el plegado de la normalización dentro de los pesos de la primera capa, que simplifica el contrato de entrada del runtime.

## Capacidades

- Clasificación de dígitos manuscritos en imágenes de 28 × 28 píxeles con fondo negro y trazo blanco centrado.
- Inferencia sobre grafos LiteRT con operadores `FULLY_CONNECTED`, `ADD` y `SOFTMAX`.
- Servir como caso de prueba de referencia para validar un intérprete de grafos propio: el fichero `reference.safetensors` incluye las probabilidades calculadas por LiteRT para las primeras 16 imágenes de test y las predicciones completas sobre el conjunto de test.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: únicamente clasificación de un dígito por imagen.
- No dispone de modo de razonamiento explícito (thinking mode), audio ni multimodalidad.

## Casos de uso

- Validación de un motor de inferencia en Rust: el motor `badak` carga `mlp.tflite` y `residual.tflite` y compara sus salidas con `reference.safetensors` para verificar la corrección del parser de FlatBuffers y de la ejecución de operadores.
- Docencia de ingeniería de inferencia: el par de modelos permite ilustrar la diferencia entre un grafo lineal y uno con conexiones residuales, y cómo afecta al planificador de operadores y a la gestión de buffers intermedios.
- Pruebas de regresión de un runtime LiteRT/TFLite: al tener precisión y salidas de referencia publicadas, cualquier cambio en el motor puede contrastarse contra 9.764 y 9.773 aciertos sobre las 10.000 imágenes de test.
- Benchmark de rendimiento de operadores `FULLY_CONNECTED` y `ADD`: con 101.770 y 992.266 parámetros respectivamente, permiten medir latencia y throughput de implementaciones de matmul en CPU sin la complejidad de un transformer.
- Ejemplo mínimo de despliegue en dispositivos embebidos: el tamaño reducido de ambos `.tflite` y el uso exclusivo de operadores básicos los hace aptos para demostrar pipelines de inferencia en microcontroladores o entornos sin acelerador.
- Material de partida para un tutorial de conversión PyTorch → LiteRT: el script `ch26_make_tflite.py` documenta la cadena completa con versiones fijadas de PyTorch, `litert-torch` y `ai-edge-litert`.

## Benchmarks y rendimiento

Los únicos datos publicados son las precisiones sobre el conjunto de test de MNIST (10.000 imágenes):

| Modelo | Parametros | Precision test | Aciertos |
|---|---|---|---|
| `mlp.tflite` | 101.770 | 97,64 % | 9.764 / 10.000 |
| `residual.tflite` | 992.266 | 97,73 % | 9.773 / 10.000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible, ni comparaciones con otros clasificadores MNIST.

## Requisitos de hardware

- VRAM estimada: no aplica; ambos modelos son de tamaño mínimo (101.770 y 992.266 parámetros, es decir, del orden de cientos de kilobytes a unos pocos megabytes en coma flotante de 32 bits) y están pensados para ejecución en CPU.
- GPU recomendadas: no disponible; no se documenta ningún requisito de GPU. El entrenamiento del modelo residual se realizó explícitamente en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, dado el reducido número de parámetros y la simplicidad del grafo.
- Opciones de despliegue: el formato `.tflite` es compatible con LiteRT (antes TensorFlow Lite) y su intérprete de referencia; también puede ejecutarse mediante el motor didáctico `badak` del libro. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision MNIST | Licencia | Formato |
|---|---|---|---|---|---|
| `mlp.tflite` (este repo) | 101.770 | 784 píxeles | 97,64 % | MIT | `.tflite` |
| `residual.tflite` (este repo) | 992.266 | 784 píxeles | 97,73 % | MIT | `.tflite` |
| `mnist-mlp` (mismo autor) | no disponible | 784 píxeles | no disponible | no disponible | no disponible |

No se dispone de información sobre otros clasificadores MNIST comparables en la documentación proporcionada; la comparativa con alternativas externas se indica como no disponible.

## Limitaciones y advertencias

- Modelo didáctico: el propio autor lo describe como material de aprendizaje, no como modelo para producción.
- Dominio restringido: solo funciona con dígitos blancos centrados sobre fondo negro en imágenes de 28 × 28, con el mismo preprocesado que MNIST. Cualquier variación de contraste, escala, rotación o centrado degrada la precisión de forma no documentada.
- Una sola etiqueta por imagen: no detecta múltiples dígitos ni texto; para reconocimiento de secuencias haría falta un modelo distinto.
- Sin información sobre sesgos: no se documentan sesgos conocidos, aunque al entrenarse solo con MNIST hereda las limitaciones de representatividad de ese conjunto (dígitos manuscritos estadounidenses de los años noventa).
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de clasificación errónea con alta confianza fuera de distribución, dado que la salida es un softmax sin calibración documentada.
- Reproducibilidad parcial: el autor advierte de que ejecutar el script en otra máquina o con otras versiones de herramientas puede producir ficheros ligeramente distintos; para reproducir las cifras del libro hay que usar los ficheros del repositorio.
- Licencia MIT: permite uso comercial y modificación sin restricciones significativas, pero al ser un modelo de demostración no se recomienda su uso comercial directo.
- Sin soporte de idiomas ni de texto: no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/mnist-tflite
- Modelo hermano `mnist-mlp`: https://huggingface.co/building-an-inference-engine-from-scratch/mnist-mlp
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Código: https://github.com/chosungmann/building-an-inference-engine-from-scratch
- Dataset: https://huggingface.co/datasets/ylecun/mnist
