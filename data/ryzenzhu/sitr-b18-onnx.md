# RyzenZHU/sitr-b18-onnx

## Resumen

SITR B/18 en formato ONNX es una conversión del checkpoint original de SITR (Sensor-Invariant Tactile Representation), un modelo de representación táctil presentado en ICLR 2025 por Harsh Gupta, Yuchen Mo, Shengmiao Jin y Wenzhen Yuan, de la University of Illinois Urbana-Champaign (arXiv 2502.19638). El repositorio `RyzenZHU/sitr-b18-onnx` no lo publican los autores originales: es una copia convertida por el usuario RyzenZHU para que el modelo se ejecute en un navegador web mediante ONNX Runtime Web. El objetivo de SITR es aprender representaciones de imágenes táctiles invariantes al sensor, de modo que un mismo modelo funcione sobre lecturas de sensores táctiles distintos sin reentrenamiento.

El fichero publicado es `sitr_b18.onnx` (388.712.528 bytes, sha256 `da02c127cc056b326f9395c58d0d821f9590696af0cb379f1cb5d14c106acdf8`), exportado con el exportador ONNX de PyTorch en opset 17 y en precisión completa. No se reentrenó, cuantizó ni podó nada respecto al checkpoint original `SITR_B18.pth` (389.083.741 bytes, sha256 `fc30e3525cfaaf1870550ae46469ac799e1f313e34664509c6a97232414e517c`). La única modificación es de forma y no de valor: las incrustaciones de parche se expresan como un reshape y un producto matricial en lugar de una convolución, porque ONNX Runtime Web 1.30 devuelve valores incorrectos en WebGPU al aplicar la convolución sobre la entrada de calibración de 54 canales.

No es un modelo de lenguaje: no genera texto, no tiene ventana de contexto conversacional y no soporta tool calling ni razonamiento multi-paso. Es un codificador visual táctil con una entrada fija de imagen táctil de 1 × 3 × 224 × 224 más una entrada de calibración de 1 × 54 × 224 × 224, y una salida de mapa de normales procedente de su decodificador de preentrenamiento. Su relevancia actual está en poder desplegarse íntegramente en el navegador (WebGPU y WebAssembly) sin backend Python, algo poco habitual en modelos de robótica táctil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con incrustaciones de parche (según la descripción de la conversión, que sustituye la convolución de parche por reshape + producto matricial); detalles de capas, dimensión de embedding y tamaño de parche no disponibles |
| Parámetros totales | Aproximadamente 97 millones, estimados a partir del tamaño del fichero ONNX en fp32 (388.712.528 bytes / 4 bytes por parámetro); no confirmado por los autores |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo de visión con entrada fija de 224 × 224 píxeles |
| Tipos de cuantización | No disponible. El fichero publicado está en precisión completa (fp32); no se incluye ninguna variante cuantizada |
| Idiomas soportados | No aplica: modelo de visión táctil, no procesa texto |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), un único fichero `sitr_b18.onnx` |
| Entrada `image` | 1 × 3 × 224 × 224: imagen táctil menos la imagen de fondo del sensor, normalizada con la media y la desviación típica del release |
| Entrada `calibration` | 1 × 54 × 224 × 224: las 18 imágenes de calibración del sensor (una bola de 4 mm y una esquina de cubo, nueve posiciones cada una), cada una menos el fondo, apiladas |
| Salida `normal` | Mapa de normales en la normalización propia del release, producido por el decodificador de preentrenamiento |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-08 / 2026-10-08 (según los metadatos del repositorio) |

## Arquitectura y entrenamiento

La documentación disponible describe la conversión, no la arquitectura interna completa. Se sabe que el modelo procesa los parches de la imagen mediante incrustaciones de parche y que el exportador de PyTorch las representa como reshape más producto matricial, lo que implica un transformer con tokenización por parches. El modelo incorpora un decodificador de preentrenamiento cuya salida es un mapa de normales, lo que sitúa el preentrenamiento en la familia de los autoencoders enmascarados aplicados a información geométrica: el codificador aprende una representación y el decodificador reconstruye la geometría de la superficie en contacto. La nomenclatura `B/18` del checkpoint no se detalla en la información proporcionada.

Sobre los datos de entrenamiento no hay información en el material disponible más allá de la existencia del dataset publicado por los autores (`hgupt3/sitr_dataset`). No se especifican el número de muestras, la composición del conjunto, ni si hubo ajuste por RLHF, DPO o alguna fase de alineación (poco probable en un modelo de representación táctil). Tampoco se documenta ningún mecanismo de decodificación especulativa ni de atención lineal.

La innovación técnica declarada del trabajo original es la invariancia al sensor: el modelo debe producir representaciones comparables a partir de lecturas de sensores táctiles diferentes, usando para ello el bloque de calibración de cada sensor. La conversión a ONNX añade una innovación de despliegue: la reescritura equivalente de la convolución de parche es un rodeo deliberado a un error de ONNX Runtime Web 1.30 con convoluciones sobre entradas de 54 canales en WebGPU. El autor verificó las salidas contra el modelo PyTorch original en ONNX Runtime sobre CPU, y en el navegador sobre WebGPU y WebAssembly, con coincidencia hasta el cuarto decimal.

## Capacidades

- Extracción de representaciones táctiles invariantes al sensor: genera un embedding de una imagen táctil normalizada, calibrado con las imágenes de calibración de ese sensor concreto.
- Reconstrucción de mapas de normales: el decodificador de preentrenamiento produce la geometría de la superficie en contacto, útil para tareas de forma y contacto.
- Generalización entre sensores: el par (imagen, calibración) permite que un mismo modelo se aplique a sensores distintos sin reentrenamiento.
- Inferencia en navegador: ejecución con ONNX Runtime Web sobre WebGPU y WebAssembly, sin servidor Python.
- Inferencia en CPU y GPU de servidor mediante ONNX Runtime con los execution providers habituales.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües, porque no es un modelo de lenguaje.
- No se documentan capacidades de visión natural (imágenes RGB convencionales), audio ni vídeo.

## Casos de uso

- Preentrenamiento de políticas robóticas de agarre: usar el codificador como extractor de características congelado y entrenar una cabeza ligera encima para predecir éxito de agarre o fuerza de pinza; la invariancia al sensor permite reutilizar la cabeza en distintas configuraciones de pinza sin reetiquetar datos.
- Detección de deslizamiento en manipulación: alimentar la secuencia de imágenes táctiles normalizadas al codificador y clasificar el estado de contacto; la salida de mapa de normales ayuda a detectar cambios de orientación de la superficie antes de que se produzca el deslizamiento.
- Localización de contacto y estimación de pose de objeto: la salida `normal` permite reconstruir la geometría local de la superficie tocada, utilizable para estimar la pose relativa del objeto respecto al dedo.
- Clasificación de materiales y texturas: las representaciones extraídas sirven de entrada a un clasificador lineal para distinguir rugosidad, compliance o material, con la ventaja de que el mismo modelo funciona en sensores distintos.
- Demostración interactiva en navegador: el modelo se ejecuta con ONNX Runtime Web sobre WebGPU o WebAssembly, de modo que se puede publicar una demo que reciba la imagen táctil y las 18 imágenes de calibración y devuelva el mapa de normales sin coste de servidor.
- Validación cruzada entre sensores en un laboratorio: comparar embeddings de un mismo objeto capturado con dos sensores táctiles distintos para medir cuánta información es común; el bloque de calibración de 54 canales es el mecanismo previsto para ello.
- Etiquetado automático de datasets táctiles: usar la salida de normales como pseudoetiqueta geométrica para preentrenar otros modelos táctiles sobre grandes volúmenes de datos sin anotación manual.
- Simulación a realidad (sim-to-real): integrar el codificador en un pipeline que alinee representaciones simuladas y reales, aprovechando que la representación no depende del sensor concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de métricas y la búsqueda web no devolvió datos de evaluación. El único dato de rendimiento verificable aportado es la coincidencia numérica hasta cuatro decimales entre el modelo ONNX y el modelo PyTorch original sobre las mismas entradas, comprobada en ONNX Runtime sobre CPU y en el navegador sobre WebGPU y WebAssembly. El artículo de ICLR 2025 (arXiv 2502.19638) presumiblemente contiene evaluaciones, pero no están incluidas en el material proporcionado.

## Requisitos de hardware

- Pesos: 388.712.528 bytes en fp32 (aproximadamente 0,39 GB), más la sobrecarga del grafo ONNX.
- VRAM estimada: inferior a 1 GB para los pesos; con las activaciones de un transformer de este tamaño a 224 × 224 y una entrada de calibración de 54 canales, una estimación prudente con lote 1 es de 1 a 2 GB en fp32. Cifra estimada, no publicada por el autor.
- GPU de consumo: sí, cabe con holgura en cualquier GPU con 2 GB o más de memoria; también se ha validado la ejecución en CPU y en WebAssembly.
- GPU de servidor: no necesita A100, H100 ni similares; un modelo de este tamaño se sirve sin problema en una T4, L4 o incluso en CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime con CPU, CUDA o TensorRT; ONNX Runtime Web con WebGPU o WebAssembly para navegador; cualquier runtime compatible con ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Lo único documentado es que la inferencia funciona en el navegador sobre WebGPU y WebAssembly, sin cifras de tiempo por inferencia.
- Consideración específica de ejecución: ONNX Runtime Web 1.30 calcula mal la convolución sobre la entrada de 54 canales en WebGPU, motivo por el que el export usa reshape más producto matricial. Si se reexporta el modelo con la convolución original, hay que verificar esa ruta.

## Comparativa con modelos similares

No hay datos en la información proporcionada sobre otros modelos de representación táctil comparables (parámetros, contexto, métricas o licencia), por lo que no es posible una comparativa con alternativas de la misma categoría. La única comparación documentada es entre esta conversión y el checkpoint original de los autores:

| Característica | sitr-b18-onnx | SITR_B18.pth original |
|---|---|---|
| Formato | ONNX, opset 17 | Checkpoint de PyTorch |
| Tamaño | 388.712.528 bytes | 389.083.741 bytes |
| Precisión | fp32, sin cuantizar | fp32 |
| Ejecución en navegador | Sí, con ONNX Runtime Web (WebGPU y WebAssembly) | No directa |
| Modificación respecto al original | Incrustaciones de parche como reshape + producto matricial | Convolución de parche |
| Autoría | Conversión no oficial de RyzenZHU | Autores de SITR (UIUC) |
| Licencia | MIT | MIT, según la dataset card de los autores |
| Verificación | Coincidencia a cuatro decimales con el modelo PyTorch | Referencia |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes. Cualquier expectativa en ese sentido es incorrecta.
- Conversión no oficial: el repositorio lo publica un tercero, no los autores de SITR. Para el modelo, el código y los datos de referencia hay que acudir al release original.
- Preprocesado obligatorio y estricto: la entrada debe ser la imagen táctil menos la imagen de fondo del sensor y normalizada con la media y la desviación típica concretas del release. Omitir la resta de fondo invalida las salidas.
- Dependencia del formato de calibración: la entrada de calibración exige exactamente 18 imágenes (una bola de 4 mm y una esquina de cubo, nueve posiciones cada una) apiladas en 54 canales. Sensores cuyo protocolo de calibración no encaje en ese esquema no se pueden usar sin adaptación.
- Sin cuantización disponible: solo se publica fp32; no hay variantes int8 ni fp16 en el repositorio, lo que limita optimizaciones de memoria y latencia.
- Sin métricas publicadas: no hay benchmarks en el repositorio ni en la información disponible, por lo que no se puede evaluar la calidad de la representación frente a alternativas.
- Riesgo de generalización incorrecta: aunque el modelo se diseñó para ser invariante al sensor, no hay datos que cuantifiquen su comportamiento en sensores no vistos. Un uso en producción con un sensor fuera de la distribución de entrenamiento puede degradar en silencio, sin señal de error evidente.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de los metadatos. No hay evidencia de terceros que reproduzcan los resultados.
- Metadatos inconsistentes: las fechas del repositorio (2026-10-08) son posteriores a la publicación del artículo en ICLR 2025 y no coinciden con un ciclo de publicación habitual; conviene tratarlas con cautela.
- Caveat de licencia: la licencia MIT se declara en la model card de este repositorio y se atribuye a la dataset card de los autores. Para uso comercial conviene verificar la licencia en el release original, dado que esta copia es una conversión de terceros.
- Errores conocidos de la herramienta: ONNX Runtime Web 1.30 devuelve valores incorrectos en WebGPU para la convolución sobre entradas de 54 canales. Si se reconstruye el grafo con la convolución original, esta ruta falla.
- Los resultados de la búsqueda web no contienen información relevante sobre el modelo; no se ha podido contrastar ningún dato adicional por esa vía.

## Enlaces

- Repositorio de la conversión en HuggingFace: https://huggingface.co/RyzenZHU/sitr-b18-onnx
- Página del proyecto SITR: https://hgupt3.github.io/sitr/
- Código de los autores (gsrl): https://github.com/hgupt3/gsrl
- Pesos y dataset originales: https://huggingface.co/datasets/hgupt3/sitr_dataset
- Artículo SITR, ICLR 2025: https://arxiv.org/abs/2502.19638
