# danielrjackson/synaptic-lens-targets-custom-images

## Resumen

Synaptic Lens: redesigned custom-image classifiers es un conjunto de diez checkpoints de vision transformers de tamano muy reducido, publicados por Daniel Jackson como parte del estudio SYN94 del proyecto Synaptic Lens. No es un modelo generativo ni un modelo de proposito general: son las "redes objetivo" (target networks) que sirven de objeto de estudio para el analisis de representaciones internas que realiza el proyecto Lens. Cada checkpoint contiene exclusivamente un state dictionary de PyTorch con 19.658 parametros y resuelve una de cinco tareas sinteticas de clasificacion de imagenes: sprites, formas (shapes), texturas, localizacion y flechas.

La relevancia es acotada y de caracter investigador. El modelo no compite en capacidad con clasificadores de vision convencionales, sino que ofrece poblaciones pequenas, reproducibles y con procedencia verificable (hashes SHA-256, replay bit a bit sobre las primeras 128 imagenes de validacion) para estudiar fenomenos de entrenamiento y representacion. La release emplea las poblaciones redisenadas SYN93, incluido el generador de sprites reparado en SYN94, y excluye los modelos de conteo del mismo estudio, que obtenian precisiones del 5-6 %.

La arquitectura es un transformer de vision minimo: parches de 4x4, token de clase, dos bloques transformer, anchura 32, dos cabezas de atencion y feedforward de anchura 64. La entrada son imagenes en escala de grises de 28x28 y la salida son diez logits de clase. Los diez checkpoints son los estados terminales de 19.600 actualizaciones (100 epocas) de dos raices de entrenamiento independientes por familia, una seleccion fija y completa, no un ranking por rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) minimo: parches 4x4, token de clase, 2 bloques transformer, anchura 32, 2 cabezas de atencion, feedforward 64 |
| Parametros totales | 19.658 por checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 28x28 en escala de grises) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision original de PyTorch) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | ai-pubs-research-use-rail-m-0.1 (pesos); Research-use RAIL-S 0.1 (codigo y metadatos) |
| Formato de pesos | State dictionary de PyTorch (`.pt`/`.pth`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada checkpoint es un transformer de vision de dos bloques con token de clase, parches de 4x4 sobre entradas de 28x28 en escala de grises, anchura de 32, dos cabezas de atencion y capa feedforward de anchura 64, con una cabeza de clasificacion de diez clases. El preprocesado es el habitual en MNIST: division de pixeles uint8 entre 255, resta de media 0,1307 y division por desviacion 0,3081.

El entrenamiento se realizo desde cero sobre cinco poblaciones sinteticas generadas proceduralmente (sprites, formas, texturas, localizacion y flechas), sin uso de pesos preentrenados externos ni redistribucion de datasets de imagenes. Cada familia incluye dos raices de inicializacion independientes, entrenadas durante 19.600 actualizaciones (100 epocas). La release corresponde a las poblaciones redisenadas SYN93, con el generador de sprites reparado en SYN94. La verificacion de exportacion incluyo comparacion bit a bit con los checkpoints fuente verificados por hash y un replay en CPU sobre las primeras 128 imagenes de validacion nativas, con predicciones de clase coincidentes y diferencias maximas de probabilidad inferiores a 0,00002.

## Capacidades

- Clasificacion de imagenes en escala de grises de 28x28 en diez clases, especifica de cada tarea sintetica.
- Cinco tareas: sprites, formas, texturas, localizacion y flechas, con dos raices independientes por tarea.
- Inferencia en CPU y CUDA mediante el script `predict.py` incluido.
- Salida de etiqueta predicha y probabilidad asociada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision general, audio ni generacion.

## Casos de uso

- Estudio de representaciones internas: el modelo sirve como red objetivo para analisis de activaciones y circuitos en el proyecto Synaptic Lens, gracias a su tamano minimo y a la disponibilidad de dos raices independientes por tarea.
- Reproducibilidad de experimentos: los hashes SHA-256 del manifiesto y el replay de validacion permiten verificar que un checkpoint descargado coincide con el estado entrenado original.
- Docencia e investigacion en vision transformers: con 19.658 parametros y dos bloques, es adecuado para ilustrar el funcionamiento de un ViT completo sin requisitos de computo.
- Pruebas de pipelines de exportacion: la comparacion bit a bit y el replay en CPU lo convierten en un caso de prueba ligero para validar flujos de serializacion y carga estricta de pesos.
- Experimentos controlados de inicializacion: las dos raices por familia permiten estudiar la varianza entre inicializaciones sobre la misma tarea y poblacion.
- Benchmarking de infraestructura de inferencia: su tamano permite medir latencias y sobrecarga de framework en entornos CUDA o CPU sin que el coste del modelo domine la medicion.

## Benchmarks y rendimiento

Resultados de validacion nativa registrados por el autor sobre 10.000 imagenes por familia:

| Tarea | Raiz 1 (precision de validacion) | Raiz 2 (precision de validacion) |
|---|---:|---:|
| Sprites | 94,66 % | 94,99 % |
| Shapes | 90,88 % | 89,76 % |
| Textures | 99,74 % | 99,90 % |
| Location | 99,99 % | 99,98 % |
| Arrows | 71,12 % | 70,07 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 19.658 parametros y entradas de 28x28, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquiera; el autor indica CUDA como dispositivo por defecto y ofrece `--device cpu` para pruebas locales.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problemas de rendimiento practico.
- Opciones de despliegue: script `predict.py` incluido en el repositorio, con PyTorch, NumPy, Pillow y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores sinteticos de investigacion con poblaciones emparejadas).

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la licencia AI Pubs Research-use RAIL-M 0.1 restringe el uso comercial de los pesos, y el codigo se rige por Research-use RAIL-S 0.1.
- Dominio muy restringido: solo clasifica imagenes de 28x28 en escala de grises que sigan las convenciones de dibujo de la tarea sintetica seleccionada; no generaliza a imagenes reales.
- Precision baja en la tarea de flechas (en torno al 70-71 %), lo que limita su uso como clasificador fiable en ese caso.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no admite conversacion.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificacion erronea fuera de distribucion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos sinteticos, cualquier sesgo procede del generador procedural.
- Los checkpoints son estados terminales fijos; no se incluyen optimizadores ni estados de RNG de entrenamiento, por lo que no permiten reanudar el entrenamiento.
- Se excluyen los modelos de conteo del estudio (precision del 5-6 %) y los checkpoints de seleccion y de raiz retenida.
- Para citar es necesario referenciar a Daniel Jackson, el estudio SYN94, la revision de Hugging Face descargada y el hash del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrjackson/synaptic-lens-targets-custom-images
- Licencia de pesos: https://huggingface.co/danielrjackson/synaptic-lens-targets-custom-images/blob/main/LICENSE-MODEL.md
- Galeria de imagenes de entrenamiento: https://danielrjackson.github.io/synaptic-lens/examples/training-images.html
- Proyecto Synaptic Lens: https://github.com/danielrjackson/synaptic-lens
- Target model factory: https://github.com/danielrjackson/synaptic-lens-target-model-factory
