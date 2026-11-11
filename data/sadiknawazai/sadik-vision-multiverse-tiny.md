# SadikNawazAI/sadik-vision-multiverse-tiny

## Resumen

Sadik Vision Multiverse TinyNet es un clasificador de imágenes extremadamente compacto (54 KB, 47.236 parámetros) desarrollado por Sadik Nawaz, un desarrollador de 11 años, bajo el identificador SadikNawazAI. El modelo resuelve una tarea de clasificación de imágenes en cuatro clases (anime_digital_art, cyberpunk_tech, game_assets_3d y photorealistic_portraits) sobre el dataset propio SADIK Vision Multiverse, compuesto por solo 77 imágenes limpiadas manualmente.

La arquitectura es una CNN con convoluciones depthwise-separable entrenada desde cero mediante destilación de conocimiento (knowledge distillation) a partir de un profesor ResNet18 que alcanza un 83,1 % de accuracy out-of-fold. El modelo final se cuantiza a int8 por canal de salida, con BatchNorm y sesgos en float16, lo que permite almacenar los pesos en un único blob autónomo de 53,60 KB.

Su relevancia es fundamentalmente educativa y de demostración: muestra cómo comprimir un clasificador hasta límites extremos para edge AI, sacrificando rendimiento (61,0 % de accuracy int8 out-of-fold) frente al profesor. No está pensado para producción ni para uso en sistemas críticos, y el propio autor lo presenta como una estimación pedagógica dado el reducido tamaño del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones depthwise-separable (TinyNet), entrenada desde cero |
| Parametros totales | 47.236 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; entrada 96x96 RGB) |
| Tipos de cuantizacion | int8 simétrica por canal de salida en pesos; float16 en BatchNorm, sesgos y escalas; checkpoint float32 disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | blob binario propietario `tinynet_int8.bin` (53,60 KB) y checkpoint PyTorch `tinynet_fp32.pt` (214,1 KB) |

## Arquitectura y entrenamiento

TinyNet es una red neuronal convolucional de tipo depthwise-separable diseñada para minimizar el número de parámetros y el tamaño en disco. La entrada es una imagen RGB de 96x96 píxeles, con un pipeline de preprocesado que redimensiona a 256, recorta centralmente a 224 y vuelve a redimensionar a 96x96, normalizando con las medias y desviaciones estándar de ImageNet. Los pesos se cuantizan a int8 de forma simétrica por canal de salida, mientras que las capas de BatchNorm y los sesgos se mantienen en float16 junto con las escalas.

El entrenamiento sigue un esquema de destilación de conocimiento en cinco pasos: primero se entrena un profesor ResNet18 con validación cruzada de 5 folds (83,1 % out-of-fold); después se cachean 16 vistas aumentadas por imagen junto con los logits suaves del profesor; a continuación se destila el profesor en TinyNet con temperatura 2,0 y una pérdida combinada al 50/50 de entropía cruzada y divergencia KL; posteriormente se cuantizan los pesos a int8; y finalmente se evalúa sobre los folds reservados, obteniendo un 61,0 % de accuracy int8 out-of-fold. El dataset de entrenamiento contiene únicamente 77 imágenes repartidas en cuatro clases, lo que limita severamente la generalización.

## Capacidades

- Clasificación de imágenes en cuatro categorías: anime_digital_art, cyberpunk_tech, game_assets_3d y photorealistic_portraits.
- Inferencia en CPU sin kernels int8 especializados: el fichero int8 se dequantiza a float32 en tiempo de carga, por lo que funciona en cualquier entorno donde se ejecute PyTorch.
- Ejecución en dispositivos de recursos muy limitados gracias a su tamaño de 54 KB y a sus 47.236 parámetros.
- Interfaz de línea de comandos (`predict_tiny.py`) y API Python (`load_int8`, `read_extra`) para integración rápida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración educativa de destilación de conocimiento: el modelo sirve para ilustrar en un aula o tutorial cómo un profesor ResNet18 se comprime en una CNN de 54 KB, comparando el 83,1 % del profesor con el 61,0 % del alumno.
- Clasificación de imágenes en microcontroladores y dispositivos edge: al ocupar 53,60 KB y ejecutarse en PyTorch estándar, puede desplegarse en entornos con restricciones extremas de almacenamiento y memoria.
- Prototipado rápido de pipelines de clasificación de arte digital: permite validar la viabilidad de un clasificador de cuatro clases antes de invertir en un modelo mayor.
- Filtrado preliminar en herramientas de organización de galerías: puede etiquetar imágenes de anime, cyberpunk, assets 3D y retratos fotorrealistas con un coste computacional mínimo.
- Ejercicio de benchmarking de cuantización: útil para medir la degradación de precisión al pasar de float32 a int8 en un modelo de muy baja capacidad.
- Base para experimentos de aumentación de datos: el script `fast_train.py` permite reproducir el pipeline de 16 vistas aumentadas por imagen y estudiar su efecto en datasets pequeños.
- Prueba de concepto de modelos creados por desarrolladores jóvenes: ejemplo de publicación reproducible con licencia permisiva en Hugging Face.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Métrica | Valor |
|---|---|
| Accuracy int8 out-of-fold (5-fold CV) | 61,04 % |
| Accuracy int8 CV | 61,1 % ± 6,9 % |
| F1 macro int8 (5-fold CV) | 52,96 % |
| Accuracy del profesor ResNet18 (out-of-fold) | 83,1 % |

Desglose por clase (int8):

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| anime_digital_art | 0,58 | 0,64 | 0,61 | 11 |
| cyberpunk_tech | 0,65 | 0,46 | 0,54 | 24 |
| game_assets_3d | 0,20 | 0,18 | 0,19 | 11 |
| photorealistic_portraits | 0,71 | 0,87 | 0,78 | 31 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores, que proceden del model-index del autor y no están verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (53,60 KB int8 o 214,1 KB float32); el consumo real depende del runtime de PyTorch y del tamaño del lote.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con soporte PyTorch (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos con pocos kilobytes de almacenamiento.
- Opciones de despliegue: PyTorch nativo (recomendado por el autor), con scripts `predict_tiny.py` para CLI y `tinynet.py` para carga programática. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto / entrada | Accuracy | Licencia |
|---|---|---|---|---|---|
| Sadik Vision Multiverse TinyNet | 47.236 | 53,60 KB (int8) | 96x96 RGB | 61,0 % (int8 OOF) | Apache 2.0 |
| Profesor ResNet18 (referencia del propio autor) | ~11,7 M | ~45 MB (fp32) | 224x224 RGB | 83,1 % (OOF) | no disponible |
| MobileNetV3-Small (referencia habitual en edge) | ~2,5 M | ~10 MB (fp32) | 224x224 RGB | no disponible en esta ficha | no disponible |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada. La comparación con MobileNetV3-Small se incluye únicamente como referencia de categoría (clasificadores ligeros para edge), sin cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Dataset de entrenamiento de solo 77 imágenes, lo que provoca una alta varianza en las métricas (± 6,9 % en validación cruzada) y limita la generalización.
- Entrada de 96x96 píxeles: se pierden detalles finos, lo que penaliza clases con texturas complejas.
- Confusión notable entre cyberpunk_tech y game_assets_3d (F1 de 0,54 y 0,19 respectivamente), el par más difícil según el autor.
- La cuantización int8 se dequantiza a float32 en inferencia: reduce el tamaño del fichero, pero no acelera el cómputo.
- Riesgo elevado de alucinación de clase en imágenes fuera de distribución, dado el bajo soporte por clase y el escaso entrenamiento.
- No apto para uso en producción ni en sistemas de seguridad crítica, tal como advierte el propio autor.
- Licencia Apache 2.0 permite uso comercial, pero la debilidad del modelo hace desaconsejable su empleo en entornos reales sin reentrenamiento.
- Sin soporte multilingüe ni de texto: es exclusivamente un clasificador de imágenes.
- Sesgos desconocidos: no se documenta la composición demográfica ni la procedencia de las 77 imágenes, por lo que no puede evaluarse el sesgo de representación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SadikNawazAI/sadik-vision-multiverse-tiny
- Dataset SADIK Vision Multiverse: https://huggingface.co/datasets/SadikNawazAI/sadik-image-classification-multiverse
- Perfil del autor en Hugging Face: https://huggingface.co/SadikNawazAI
