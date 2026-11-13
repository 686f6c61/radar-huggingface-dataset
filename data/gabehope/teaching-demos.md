# gabehope/teaching-demos

## Resumen

`gabehope/teaching-demos` no es un modelo de lenguaje, sino un repositorio de pesos preentrenados de clasificadores de imagen de torchvision (SqueezeNet 1.1, ResNet-18 y AlexNet) empaquetados para ejecutarse en el navegador mediante WebGPU. Lo publica el profesor Gabe Hope como material didactico para sus demos de "Pretrained CNN" y "Fine-tuning" en su sitio de teaching demos. Los pesos son los checkpoints oficiales de torchvision entrenados sobre ImageNet-1k (`IMAGENET1K_V1`), convertidos sin reentrenamiento y conservados en float32.

El interes del repositorio es practico y educativo: ilustra como servir modelos convolucionales clasicos en el cliente sin backend, usando un formato de red propio de las demos y archivos binarios troceados en partes de 16 MiB que se reconstruyen concatenandolas. No aporta arquitecturas nuevas ni mejoras de rendimiento; su valor esta en la infraestructura de empaquetado y en la posibilidad de inspeccionar tres referencias historicas de la vision por computador (AlexNet, ResNet-18 y SqueezeNet 1.1) en un entorno interactivo.

Por su naturaleza (clasificacion de imagenes, no generacion de texto), no dispone de contexto, parametros activos, cuantizaciones ni capacidades de razonamiento o tool calling. La ficha se adapta a esa realidad y marca como "no disponible" todo aquello que no aplica o no figura en la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (SqueezeNet 1.1, ResNet-18 y AlexNet, checkpoints torchvision `IMAGENET1K_V1`) |
| Parametros totales | No disponible de forma agregada; por modelo: SqueezeNet 1.1 (~1,24 M), ResNet-18 (~11,7 M), AlexNet (~61,1 M) segun las arquitecturas de referencia de torchvision |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible; los pesos se conservan en float32 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | BSD 3-Clause (torchvision); datos de entrenamiento sujetos a los terminos de acceso de ImageNet |
| Formato de pesos | Archivos zip del formato de red propio de las demos, troceados en partes `<modelo>-NN.bin` de 16 MiB; manifiesto en `pretrained/manifest.json` con partes, tamano en bytes y SHA-256 |
| Tamano del repositorio | 0,3 GB |
| Tarea (pipeline) | `image-classification` |
| Dataset de entrenamiento | ILSVRC/imagenet-1k |
| Libreria | torchvision |
| Ejecucion | Navegador con WebGPU (demos de teaching demos) |

## Arquitectura y entrenamiento

Los tres modelos son redes convolucionales feed-forward clasicas de vision: SqueezeNet 1.1 (modulos fire con convoluciones 1x1 y 3x3 para reducir parametros), ResNet-18 (residuos con conexiones skip y 18 capas) y AlexNet (cinco capas convolucionales y tres totalmente conectadas). No hay innovaciones de atencion, mezcla de expertos ni estado recurrente; son arquitecturas de referencia ampliamente documentadas.

El entrenamiento no lo realiza el autor: se reutilizan los checkpoints oficiales de torchvision `IMAGENET1K_V1`, entrenados sobre ImageNet-1k (clasificacion en 1000 clases). La conversion se hace sin reentrenamiento y manteniendo float32. No consta informacion sobre tokens, composicion del dataset mas alla de ImageNet-1k, ni sobre RLHF/DPO (no aplica). La innovacion tecnica del repositorio es el empaquetado: cada modelo se serializa en un zip con el formato de red propio de las demos, se trocea en partes de 16 MiB y se documenta con hash SHA-256 para verificar la reconstruccion concatenando las partes en orden.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k (etiquetas estandar de ILSVRC).
- Inferencia en el navegador mediante WebGPU, sin necesidad de backend ni servidor.
- Tres perfiles de coste/precision: SqueezeNet 1.1 (5 MB, el mas ligero), ResNet-18 (47 MB, equilibrio) y AlexNet (244 MB, referencia historica).
- Uso educativo para demostrar pesos preentrenados, extraccion de caracteristicas y fine-tuning.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de vision generativa, audio ni modo "thinking": solo clasificacion discriminativa.

## Casos de uso

- Docencia de vision por computador: usar los tres modelos en el navegador para mostrar como un clasificador preentrenado asigna probabilidades a una imagen subida por el alumno, comparando el coste de SqueezeNet frente a AlexNet.
- Demostracion de fine-tuning: partir de ResNet-18 `IMAGENET1K_V1` como inicializacion y ajustar las capas finales sobre un dataset pequeno, ilustrando el transfer learning en clase.
- Prototipado de clasificadores en el cliente: desplegar SqueezeNet 1.1 (5 MB) en una aplicacion web con WebGPU para etiquetar imagenes localmente sin enviar datos a un servidor.
- Verificacion de integridad de artefactos: usar el `manifest.json` con SHA-256 y el troceado en partes de 16 MiB como ejemplo de distribucion reproducible de pesos en un pipeline educativo.
- Comparativa de arquitecturas: medir en el navegador el tamano de descarga y el tiempo de inferencia de AlexNet (244 MB) frente a ResNet-18 (47 MB) para discutir compromisos entre precision y coste.
- Material de referencia para cursos de despliegue: mostrar el paso de checkpoints `.pth` de torchvision a un formato serializado propio y su carga en WebGPU, como ejercicio de conversion de formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de precision top-1/top-5 en ImageNet para estos checkpoints, ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los pesos en float32 ocupan aproximadamente 5 MB (SqueezeNet 1.1), 47 MB (ResNet-18) y 244 MB (AlexNet) en disco; el consumo en memoria depende del runtime y del tamano de lote.
- GPU recomendadas: no disponible. El requisito funcional declarado es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la ejecucion prevista es en navegador sobre WebGPU, no en un servidor con GPU dedicada.
- Opciones de despliegue: las demos del autor sobre WebGPU; los checkpoints originales de torchvision pueden cargarse con PyTorch/torchvision en Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (aprox.) | Entrada | Tamano de pesos en el repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SqueezeNet 1.1 (este repo) | ~1,24 M | Imagen 224x224, 1000 clases | 5 MB | BSD 3-Clause | Hugging Face + WebGPU |
| ResNet-18 (este repo) | ~11,7 M | Imagen 224x224, 1000 clases | 47 MB | BSD 3-Clause | Hugging Face + WebGPU |
| AlexNet (este repo) | ~61,1 M | Imagen 224x224, 1000 clases | 244 MB | BSD 3-Clause | Hugging Face + WebGPU |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables externos en la informacion proporcionada; la tabla se limita a los tres checkpoints incluidos en el repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso en esos escenarios es invalido.
- Sesgos conocidos: los hereda de ImageNet-1k (clases y distribucion del dataset original); no se documenta un analisis de sesgos en la model card.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la clasificacion puede ser erronea o poco calibrada fuera de la distribucion de ImageNet.
- Limitaciones de idioma: no aplica; no procesa texto.
- Restricciones de licencia: los pesos de torchvision son BSD 3-Clause, pero el entrenamiento usa ImageNet y quedan sujetos a los terminos de acceso de ImageNet. El autor indica que estas copias se ofrecen para docencia; conviene revisar los terminos de ImageNet antes de un uso comercial.
- Caveat de produccion: el repositorio esta pensado para demos educativas, con 0 descargas y 0 likes en el momento de la consulta; no hay garantias de mantenimiento ni de soporte.
- Formato no estandar: los pesos estan en el formato de red propio de las demos, troceados en partes de 16 MiB; requieren reconstruccion por concatenacion y verificacion con SHA-256 antes de usarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gabehope/teaching-demos
- Demos del autor (WebGPU): https://gabehope.github.io/teaching-demos/
- Checkpoint SqueezeNet 1.1 (torchvision): https://download.pytorch.org/models/squeezenet1_1-b8a52dc0.pth
- Checkpoint ResNet-18 (torchvision): https://download.pytorch.org/models/resnet18-f37072fd.pth
- Checkpoint AlexNet (torchvision): https://download.pytorch.org/models/alexnet-owt-7be5be79.pth
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
