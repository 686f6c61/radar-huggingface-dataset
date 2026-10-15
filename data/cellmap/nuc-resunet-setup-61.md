# cellmap/nuc-resunet-setup-61

## Resumen

nuc-resunet-setup-61 es un modelo de segmentacion volumetrica (3D) especializado en la deteccion de nucleos celulares en imagenes de microscopia electronica de barrido con haz de iones focalizado (FIB-SEM). Lo desarrolla el equipo CellMap del Janelia Research Campus (HHMI) y se distribuye a traves de la libreria `cellmap-models`. No es un modelo de lenguaje: es una red convolucional 3D que recibe un volumen de imagen de un solo canal y devuelve un mapa de probabilidad por voxel para la clase `nuc`.

El modelo resuelve la tarea de segmentacion semantica de nucleos en pilas de imagenes de EM a resolucion isotropica de 256 nm, un paso habitual en pipelines de biologia celular y conectomica donde el etiquetado manual de volumenes es inviable. Su interes practico esta en el ecosistema de despliegue: se publica simultaneamente en tres formatos (`torch.export`, TorchScript y ONNX), lo que permite integrarlo tanto en entrenamiento/fine-tuning con PyTorch como en inferencia embebida o en navegador mediante la version ONNX web del mismo setup.

La arquitectura concreta es `ResUNet3DValid`, una U-Net residual 3D con normalizacion InstanceNorm y convoluciones validas (sin padding), entrenada durante 20000 iteraciones. El modelo trabaja sobre parches de 300x300x300 voxeles y produce salidas de 212x212x212, con 88 voxeles de contexto espacial por eje, y emite logits crudos que requieren una sigmoide posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet3DValid (U-Net residual 3D con InstanceNorm y convoluciones validas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion); halo de contexto de 88 voxeles por eje |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | torch.export (`model.pt2`), TorchScript (`model.ts`), ONNX (`model.onnx` + `model.onnx.data`), `metadata.json` |
| Framework | torch (`cellmap-models`) |
| Dimensiones espaciales | 3 |
| Canales de entrada / salida | 1 / 1 |
| Nombre de canal | nuc |
| Tamano de voxel de entrada | 256, 256, 256 nm |
| Tamano de voxel de salida | 256, 256, 256 nm |
| Forma de entrada en inferencia | 300, 300, 300 |
| Forma de salida en inferencia | 212, 212, 212 |
| Normalizacion de entrada | min-max con min = -1.0 y max = 1.0 |
| Activacion de salida | sigmoide, aplicada despues del modelo (`apply_after_model: true`) |
| Iteracion de entrenamiento | 20000 |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo es un `ResUNet3DValid`: una U-Net tridimensional con bloques residuales, normalizacion InstanceNorm y convoluciones validas. El uso de convoluciones validas implica que no se aplica padding, por lo que cada capa reduce el tamano espacial y la salida es mas pequena que la entrada: una entrada de 300x300x300 produce 212x212x212, lo que equivale a descartar 88 voxeles por eje (44 en cada borde). Este diseno evita artefactos de borde introducidos por padding, a cambio de exigir recortes o solapamiento controlado al ensamblar volumenes grandes. El modelo emite logits crudos y la sigmoide se aplica fuera del grafo, tal como declara la model card.

El entrenamiento se realizo sobre nucleos (`nuc`) a partir de imagenes FIB-SEM con voxel isotropico de 256 nm, dentro del setup `exp_mito setup_61`, durante 20000 iteraciones. La libreria `cellmap-models` expone tanto la ruta de inferencia (TorchScript u ONNX) como una ruta de fine-tuning mediante `model.train()`. No se especifican en la informacion disponible el numero de tokens o voxeles de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste tipo RLHF/DPO (no aplicables a segmentacion).

## Capacidades

- Segmentacion semantica 3D de nucleos celulares en volumenes de microscopia electronica FIB-SEM.
- Entrada monocanal (1 canal) con normalizacion min-max fijada entre -1.0 y 1.0.
- Salida monocanal con probabilidad por voxel tras aplicar sigmoide sobre los logits crudos.
- Resolucion isotropica de 256 nm en entrada y salida.
- Exportacion a multiples formatos: `torch.export` (entrenable), TorchScript y ONNX, con variante ONNX para despliegue web (`cellmap/onnx-web-models/setup_61`).
- Compatibilidad con fine-tuning mediante la API `CellmapModel.train()` de `cellmap-models`.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades multimodales (audio, vision natural, texto): no aplica; el unico dominio es imagen volumetrica de EM.

## Casos de uso

- Segmentacion de nucleos en volumenes FIB-SEM: el modelo procesa parches de 300x300x300 voxeles a 256 nm y devuelve un mapa de probabilidad de nucleo, lo que permite reconstruir el volumen nuclear completo deslizando la ventana y promediando solapamientos.
- Analisis morfometrico cuantitativo: a partir de la mascara binaria derivada de la sigmoide se pueden calcular volumenes nucleares, superficies, esfericidad y densidad nuclear por region tisular.
- Conteo celular automatizado en estudios de alta densidad: el modelo soporta el procesado de grandes pilas de EM donde el conteo manual es inviable, reduciendo coste y variabilidad entre anotadores.
- Preprocesado para pipelines de conectomica: la mascara de nucleos sirve como referencia anatomica para alinear y contextualizar reconstrucciones de neuritas y mitocondrias dentro de la misma pila FIB-SEM.
- Pseudo-etiquetado para acelerar anotacion: las predicciones pueden usarse como propuesta inicial que un anotador humano corrige, reduciendo el tiempo de generacion de ground truth para nuevos datasets.
- Correlacion con microscopia de fluorescencia (CLEM): la mascara de nucleos a nivel volumetrico facilita el registro con canales de fluorescencia nuclear en flujos de imagen correlativa.
- Fine-tuning a tejidos o preparaciones propias: al ser un modelo entrenado en un setup concreto, la ruta `CellmapModel.train()` permite adaptar los pesos a una nueva distribucion de imagen con un esfuerzo computacional moderado.
- Despliegue interactivo en navegador: la version ONNX del setup 61 permite ejecutar la inferencia en cliente (WebAssembly/WebGPU) para visualizacion y anotacion sin enviar datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como IoU, Dice o F1 sobre conjuntos de validacion, ni comparaciones cuantitativas con otras arquitecturas.

## Requisitos de hardware

- El autor no publica cifras oficiales de VRAM ni de latencia/throughput para este modelo.
- Estimacion a partir de la forma declarada (no publicada por el autor): una unica activacion float32 full-resolution de 300^3 voxeles ocupa 27.000.000 x 4 bytes = 108 MB; los mapas de caracteristicas del encoder multiplican ese valor por el numero de canales de cada nivel.
- La salida de inferencia (212^3 voxeles float32) ocupa aproximadamente 38 MB por volumen.
- GPU recomendadas: no disponible de forma oficial; por el tamano del repositorio (0.1 GB) y la forma de entrada, es plausible su ejecucion en GPU de consumo (por ejemplo, gama RTX con suficiente VRAM para el batch de parches), aunque no hay confirmacion del autor.
- Despliegue: al menos ONNX Runtime (`onnxruntime.InferenceSession`), PyTorch/TorchScript (`torch.jit.load`) y carga entrenable con `cellmap-models`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la informacion proporcionada solo consta el propio modelo y su version ONNX para web (mismo setup), sin especificaciones publicadas de terceros comparables.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| cellmap/nuc-resunet-setup-61 | no disponible | parche 300^3, contexto de 88 voxeles por eje | BSD-3-Clause | HuggingFace (PyTorch, TorchScript, ONNX) |
| cellmap/onnx-web-models/setup_61 | no disponible | misma configuracion del setup 61 | no disponible | Version ONNX orientada a web |
| Otras alternativas de segmentacion de nucleos en EM | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La salida son logits crudos: es imprescindible aplicar la sigmoide despues del modelo para obtener probabilidades.
- La normalizacion de entrada esta fijada (min-max con rango -1.0 a 1.0); usar otro esquema de normalizacion degrada la prediccion.
- El modelo produce una unica mascara semantica de la clase `nuc` (1 canal de salida). No separa instancias individuales, por lo que requiere post-proceso (por ejemplo, watershed u otro metodo de etiquetado) para obtener nucleos individuales.
- Segmenta unicamente nucleos: no cubre otras estructuras celulares como mitocondrias, membranas o sinapsis.
- Las convoluciones validas descartan 88 voxeles por eje (44 por borde). Es necesario solapar parches o recortar bordes al reconstruir volumenes completos para evitar costuras.
- Especificidad de dominio: fue entrenado sobre FIB-SEM a 256 nm dentro del setup `exp_mito setup_61`. Su rendimiento en otros microscopios, resoluciones o preparaciones no esta documentado y puede degradarse.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgo por tipo celular, tejido o especie.
- Riesgo de alucinacion en el sentido de falsos positivos/negativos de segmentacion: no se publican tasas de error ni curvas ROC, por lo que no puede cuantificarse con la informacion disponible.
- Limitaciones de contexto o idioma: no aplica (modelo de vision volumetrica, no de lenguaje).
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion y manteniendo el aviso de copyright; no se identifican restricciones adicionales en la informacion disponible.
- Para produccion: no hay benchmarks publicados ni cifras de latencia, por lo que cualquier despliegue requiere una validacion propia sobre datos locales antes de escalar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/cellmap/nuc-resunet-setup-61
- Repositorio de la libreria: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia): https://www.janelia.org/project-team/cellmap
- Version ONNX para web: https://huggingface.co/cellmap/onnx-web-models (setup_61)
- Paper asociado: no disponible en la informacion proporcionada.
