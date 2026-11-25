# genome-spy/ChromBPNet-WebGPU

## Resumen

ChromBPNet-WebGPU es un repositorio de pesos del modelo ChromBPNet empaquetados en formato binario para su ejecución en navegador mediante WebGPU y shaders WGSL. Lo desarrolla el proyecto genome-spy, y su propósito es trasladar la inferencia de un modelo de genómica (predicción de perfiles de accesibilidad de cromatina a partir de secuencia de ADN) desde el entorno Python/ONNX a un motor de inferencia WebGPU nativo del navegador.

El modelo base ChromBPNet es una red convolucional (CNN) que predice la forma del perfil de accesibilidad (footprint) y el recuento total de lecturas en una región central de 1.000 pb a partir de una ventana de entrada de 2.114 pb de secuencia de ADN en formato one-hot ACGT. Esta publicación contiene únicamente los pesos de predicción (prediction-only) en contenedores `GSCNNv1` para el motor `chrombpnet-wgsl@1`, no ficheros ONNX.

La relevancia actual del repositorio es logística y de infraestructura: se está publicando un atlas de 7.560 folds correspondientes a 1.512 experimentos originales, de los cuales en el momento de la ficha hay 1.858 publicados. No se realizan tests de paridad numérica ni ejecuciones de inferencia por fold, y la publicación no constituye una validación biológica ni numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (GSCNNv1), basada en ChromBPNet; pesos empaquetados para motor WebGPU/WGSL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 2.114 pb (fp32, ACGT one-hot `[1,4,2114]`) |
| Tipos de cuantizacion | fp32 (los inicializadores se copian sin cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada es secuencia de ADN) |
| Licencia | MIT |
| Formato de pesos | Contenedores binarios `GSCNNv1` para `chrombpnet-wgsl@1` (no ONNX, no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es ChromBPNet, una red convolucional que procesa una ventana de 2.114 pb de ADN codificada en one-hot (4 canales) y produce dos salidas: un perfil de 1.000 posiciones (logits que se decodifican con softmax) y un logaritmo del recuento total de lecturas (que se decodifica con `max(expm1(log_count), 0)`). Las salidas corresponden a la región central de entrada `[557, 1557)` en coordenadas zero-based half-open, y las features de recuento abarcan 1.074 posiciones desde el offset 520.

Esta publicación concreta contiene los modelos ChromBPNet **nobias** (bias-corrected, sin entrada de control); el submodelo de bias no está incluido. La conversión parte de los tensores del release ONNX ya publicado (`genome-spy/ChromBPNet-ONNX`): los inicializadores fp32 se copian sin cuantización ni aritmética, y los pesos de convolución divididos se reensamblan por concatenación exacta de canales. Cada fichero intermedio se verifica contra su tamaño y SHA-256 registrados, y los contenedores embeben la identidad nativa completa (repositorio, revisión, ruta, hash) y los hashes individuales de tensores. No se realizan tests de paridad numérica ni ejecuciones de inferencia por fold en esta publicación.

## Capacidades

- Predicción de perfil de accesibilidad de cromatina (footprint) a partir de secuencia de ADN, con salida de 1.000 posiciones.
- Predicción del recuento total de lecturas (log count) para la región central.
- Inferencia en navegador mediante WebGPU y shaders WGSL, a través del motor `chrombpnet-wgsl@1` en GenomeSpy Sequence Designer.
- Retención de todas las cabezas aprendidas nativas del modelo.
- Verificación de integridad por SHA-256 y tamaño de cada contenedor de pesos.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Visualización interactiva de predicciones genómicas en navegador: integración en GenomeSpy Sequence Designer para mostrar el perfil predicho por ChromBPNet sobre una región de ADN seleccionada, sin necesidad de backend Python.
- Exploración de variantes en cliente: dado que la inferencia corre en WebGPU, permite evaluar el efecto de variantes sobre el perfil predicho directamente en la interfaz, reduciendo la latencia de ida y vuelta al servidor.
- Docencia y divulgación de genómica computacional: ejecutar un modelo de deep learning genómico en un portátil con navegador moderno, sin instalar CUDA ni dependencias de Python.
- Prototipado de visores genómicos: usar los contenedores de pesos como base para construir visores que superpongan predicciones de accesibilidad sobre tracks de datos reales.
- Auditoría de integridad de pesos: el manifiesto y los hashes SHA-256 permiten verificar que los pesos desplegados corresponden exactamente a los del release ONNX de origen.
- Investigación reproducible en navegador: al fijar la revisión del repositorio y verificar hashes, se puede reproducir la misma inferencia en distintos equipos con el mismo motor WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realizan tests de paridad numérica ni ejecuciones de inferencia por fold en esta publicación, y que la publicación no constituye una validación numérica ni biológica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; la model card indica aproximadamente 25,54 MB por fold.
- GPU recomendadas: no disponible; requiere un navegador con soporte de WebGPU (Chrome/Edge con WebGPU habilitado, Safari reciente). No se especifican modelos de GPU.
- Cabe en GPU consumer: sí, por el tamaño por fold (~25,54 MB), aunque el requisito real es soporte de WebGPU en el navegador, no VRAM dedicada.
- Opciones de despliegue: motor `chrombpnet-wgsl@1` en GenomeSpy Sequence Designer; no se distribuye una librería JavaScript ni código de shaders en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| ChromBPNet-WebGPU (este) | CNN empaquetada para WebGPU | 2.114 pb one-hot | perfil 1.000 + log count | MIT | contenedores `GSCNNv1` |
| genome-spy/ChromBPNet-ONNX | CNN en ONNX | 2.114 pb one-hot | perfil + log count | no disponible en esta ficha | ONNX |
| ChromBPNet original (Kundaje lab) | CNN en TensorFlow/Keras | 2.114 pb one-hot | perfil + log count | no disponible en esta ficha | checkpoint TF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Publicación incompleta: en el momento de la ficha hay 1.858 de 7.560 folds publicados; el atlas completo está en proceso.
- Sin validación numérica ni biológica: no se ejecutan tests de paridad por fold ni inferencias de validación; la publicación no debe interpretarse como evidencia de corrección.
- Solo predicción: no incluye grafos backward, Ledidi, attribution ni PISA; no sirve para interpretabilidad ni para ajuste fino.
- Modelos nobias sin control: el submodelo de bias no está incluido, por lo que no se puede reproducir el flujo completo de corrección de sesgo dentro de este repositorio.
- Dependencia de motor propietario del ecosistema: requiere el motor `chrombpnet-wgsl@1`; no hay librería JavaScript ni shaders públicos en el repositorio.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, razonamiento ni multilingües; los campos de idioma no aplican.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las predicciones del modelo son estimaciones biológicas y no deben usarse como evidencia experimental sin validación.
- Licencia MIT permite uso comercial, pero la verificación de integridad y la identidad de los pesos originales deben conservarse según `LICENSE` y `NOTICE`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/genome-spy/ChromBPNet-WebGPU
- Release ONNX de origen: https://huggingface.co/genome-spy/ChromBPNet-ONNX
- Proyecto GenomeSpy: no disponible en la información proporcionada
- Paper de ChromBPNet: no disponible en la información proporcionada
