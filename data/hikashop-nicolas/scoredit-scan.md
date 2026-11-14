# hikashop-nicolas/scoredit-scan

## Resumen

Scoredit-scan es un paquete de modelos ONNX orientado al reconocimiento óptico de partituras musicales (OMR, *optical music recognition*) que se ejecuta íntegramente en el navegador. Lo publica el desarrollador hikashop-nicolas como parte del proyecto [scoredit](https://github.com/hikashop-nicolas/scoredit), una librería JavaScript para leer partituras escaneadas o fotografiadas y convertirlas en un documento editable. El repositorio no contiene un modelo entrenado desde cero, sino una conversión de los *checkpoints* ya publicados por el proyecto oemer (BreezeWhite, licencia MIT) al formato onnxruntime-web, sin reentrenamiento.

El contenido son tres artefactos: la red de segmentación de símbolos de oemer (`oemer-symbols.onnx`, 38,4 MB), su versión cuantizada a int8 (`oemer-symbols-int8.onnx`, 10,3 MB) y los cuatro clasificadores SVM de oemer exportados a JSON (`oemer-classifiers.json`, 5,9 MB). La red detecta plicas, silencios, cabezas de nota, claves y armaduras; las líneas del pentagrama las localiza el propio scoredit mediante procesamiento de imagen clásico, no con una red neuronal.

Su relevancia es práctica: permite OMR sin servidor, con los pesos descargados bajo consentimiento del usuario y ejecutados en su dispositivo (WebGPU o WebAssembly). El autor documenta una precisión aproximada del 80 % en alturas y del 72 % en altura y duración combinadas sobre un banco de pruebas de 14 páginas, con unos 70 segundos por página en un portátil de 2019 usando WebGPU. El resultado se plantea explícitamente como un borrador a corregir, no como transcripción definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de segmentación de símbolos (seg_net de oemer) exportada a ONNX; clasificadores SVM externos en JSON |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | float32 (38,4 MB) e int8 (10,3 MB) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime-web) y JSON para los clasificadores |
| Tamano del repositorio | 0,0 GB (artefactos de 38,4 MB, 10,3 MB y 5,9 MB) |
| Entrada / salida | imagen de partitura a texto/símbolos musicales (pipeline image-to-text) |
| Dataset de entrenamiento | DeepScoresV2 (CC BY 4.0) |

## Arquitectura y entrenamiento

La red de símbolos es la `seg_net` de oemer, una red de segmentación de imágenes que produce máscaras para plicas y silencios, cabezas de nota, claves y armaduras. Sobre esas máscaras, scoredit aplica sus propios algoritmos de imagen para localizar el pentagrama y reconstruir la notación, y los cuatro clasificadores SVM de oemer (claves, silencios, silencios por encima de una corchea y alteraciones sostenido/bemol/becuadro) refinan la clasificación de los símbolos detectados. Los SVM se exportaron de scikit-learn a JSON y la red se convirtió a ONNX con las herramientas de onnxruntime; la copia int8 se cuantizó con esas mismas herramientas.

No hubo reentrenamiento: son los *checkpoints* publicados por oemer, entrenados sobre DeepScoresV2 (Tuggener, Satyawan, Pacha, Schmidhuber, Stadelmann; CC BY 4.0). El autor señala explícitamente que la red de pentagramas de oemer (`unet_big`) no se incluye porque se entrenó sobre CVC-MUSCIMA, un dataset con licencia solo para investigación no comercial; en su lugar, scoredit detecta las líneas del pentagrama con procesamiento de imagen propio. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni fases de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Reconocimiento óptico de partituras impresas o fotografiadas: detección de cabezas de nota, plicas, silencios, claves y armaduras.
- Clasificación de alteraciones (sostenido, bemol, becuadro) y de silencios, incluidos los situados por encima de una corchea.
- Localización de líneas de pentagrama mediante procesamiento de imagen propio de scoredit.
- Conversión de imagen a documento musical editable (pipeline image-to-text) a través de la función `readScanScore`.
- Ejecución en el navegador del usuario con onnxruntime-web, tanto en WebGPU como en WebAssembly.
- Variante int8 pensada para teléfonos y WebAssembly sin aceleración gráfica.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües.

## Casos de uso

- Digitalización de partituras en el navegador: un músico sube una foto o un escaneo y obtiene un borrador editable sin enviar la imagen a ningún servidor, ya que los pesos se descargan y se ejecutan en el dispositivo.
- Edición y corrección asistida: el resultado se plantea como borrador (aproximadamente 80 % de alturas correctas), de modo que encaja en un flujo donde el usuario revisa y corrige la transcripción en lugar de aceptarla automáticamente.
- Aplicaciones web de bajo coste de despliegue: al no requerir backend de inferencia, se puede integrar en una página estática o en una aplicación de escritorio empaquetada con Electron.
- Uso en dispositivos móviles: la variante int8 de 10,3 MB permite ejecutar el reconocimiento en teléfonos mediante WebAssembly, con una calidad descrita como similar a la versión completa.
- Herramientas educativas de música: digitalizar ejercicios o partituras de alumnos para su análisis, comparación o reproducción en un editor.
- Archivística y catalogación ligera: extraer una primera transcripción de material escaneado para indexarlo o buscar fragmentos, aceptando la corrección manual posterior.
- Integración en el editor Omnitext: el proyecto del mismo autor usa estos modelos para leer partituras escaneadas dentro de su editor de texto musical.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Precision en alturas (pitches) | ~80 % | Banco de pruebas de 14 páginas |
| Precision en altura y duracion combinadas | ~72 % | Banco de pruebas de 14 páginas |
| Tiempo por pagina | ~70 s | WebGPU, portátil de 2019 |

No se han publicado resultados de benchmarks estándar de OMR (por ejemplo, sobre DeepScoresV2 o CVC-MUSCIMA) en la información disponible; las cifras anteriores son las que el autor documenta en el README de scoredit.

## Requisitos de hardware

- Inferencia en el cliente: no requiere GPU de servidor; se ejecuta en el navegador con onnxruntime-web.
- Memoria: el modelo completo ocupa 38,4 MB y la variante int8 10,3 MB, más 5,9 MB de clasificadores JSON; el consumo de memoria en ejecución no está documentado.
- Aceleración: WebGPU para la versión completa (unos 70 s por página en un portátil de 2019); WebAssembly para la variante int8, orientada a teléfonos.
- GPU de escritorio: no se documentan requisitos ni compatibilidad con A100, H100 o RTX 4090, ya que el despliegue previsto es en navegador.
- Opciones de despliegue: onnxruntime-web dentro de scoredit; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Throughput: no disponible más allá del tiempo por página indicado.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Ejecución | Notas |
|---|---|---|---|---|
| scoredit-scan (este) | Segmentación + SVM, ONNX | MIT | Navegador (WebGPU/WASM) | Conversión de oemer sin reentrenamiento; ~80 % de alturas |
| oemer (BreezeWhite) | Pipeline OMR completo | MIT | Python, local | Incluye red de pentagramas (`unet_big`) entrenada en CVC-MUSCIMA; más completo pero no ejecutable en navegador |
| Audiveris | OMR clásico | AGPL | Java, escritorio | No es un modelo neuronal; requiere instalación local |
| Modelos OMR sobre DeepScoresV2 | Redes de investigación | Variable | Servidor | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La precisión es limitada: alrededor del 80 % de alturas y del 72 % de altura y duración combinadas; el resultado debe tratarse como borrador corregible.
- No incluye la red de pentagramas de oemer (`unet_big`) por restricciones de licencia de CVC-MUSCIMA; la detección de líneas depende del procesamiento de imagen de scoredit y puede fallar en escaneos de baja calidad.
- El rendimiento en partituras manuscritas, fotografías con perspectiva o iluminación irregular no está documentado.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-step.
- Los pesos se descargan en el primer uso; el autor indica que se hace tras el consentimiento del usuario, lo que conviene mantener en cualquier integración.
- Licencia MIT para los artefactos, pero los créditos y licencias de origen (oemer MIT, DeepScoresV2 CC BY 4.0) deben conservarse en la redistribución.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido de modelos generativos; el riesgo principal es la clasificación errónea de símbolos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hikashop-nicolas/scoredit-scan
- Repositorio scoredit: https://github.com/hikashop-nicolas/scoredit
- Proyecto Omnitext: https://github.com/hikashop-nicolas/omnitext
- oemer (BreezeWhite): https://github.com/BreezeWhite/oemer
- Dataset DeepScoresV2: https://zenodo.org/record/4012193
