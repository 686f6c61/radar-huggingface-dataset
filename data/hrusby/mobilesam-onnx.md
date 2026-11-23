# HRusby/mobilesam-onnx

## Resumen

MobileSAM es una variante destilada de Segment Anything Model (SAM) que sustituye el codificador de imágenes ViT-H original (aproximadamente 632 millones de parámetros) por un TinyViT mucho más ligero, manteniendo el resto de la arquitectura SAM intacta. Este repositorio, publicado por el usuario HRusby, no contiene el modelo original en PyTorch, sino una exportación a ONNX preparada específicamente para su uso con la librería `transformers.js` de Hugging Face, lo que permite ejecutar segmentación de imágenes en el navegador o en entornos JavaScript sin depender de Python.

La exportación replica la estructura de ficheros, entradas y salidas del modelo Xenova/slimsam-77-uniform, de modo que se carga con el procesador SAM estándar (lado más largo redimensionado a 1024 y rellenado hasta 1024). El modelo se ofrece en tres variantes de precisión: fp32, fp16 (con entradas y salidas float32 y algunas operaciones mantenidas en fp32 para compatibilidad con WebGPU) y 8 bits (cuantización solo de pesos MatMul y Gemm).

El interés de esta ficha reside en que permite desplegar segmentación guiada por prompts (puntos) directamente en el cliente, con un tamaño de repositorio de solo 0,1 GB y licencia Apache-2.0. Es relevante para aplicaciones web de edición de imágenes, anotación interactiva o preprocesado visual en el navegador, donde cargar un modelo SAM completo resultaría inviable. El autor declara que la exportación fp32 coincide exactamente con el predictor PyTorch de MobileSAM en fotografías de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (codificador de imagen) + prompt encoder y mask decoder de SAM |
| Parametros totales | no disponible (MobileSAM original: aproximadamente 10 millones en el codificador TinyViT; total no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024 × 1024) |
| Tipos de cuantizacion | fp32, fp16 y 8 bits (solo pesos MatMul y Gemm) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`vision_encoder*.onnx`, `prompt_encoder_mask_decoder*.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SAM: un codificador de imagen que produce embeddings densos, un codificador de prompts que transforma las indicaciones del usuario (en esta exportación, únicamente puntos) en tokens, y un decodificador de máscaras que genera las máscaras finales. MobileSAM sustituye el codificador ViT-H de SAM por un TinyViT destilado a partir del modelo original, lo que reduce drásticamente el coste computacional manteniendo el decodificador de máscaras de SAM. En esta exportación ONNX, el codificador de imagen incluye además el embedding posicional denso de SAM.

El entrenamiento subyacente es el de MobileSAM, que emplea destilación del codificador de imagen de SAM hacia el TinyViT; no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset (presumiblemente SA-1B) ni sobre etapas de RLHF o DPO, que no aplican a este tipo de modelo. La exportación se realizó con `torch.onnx.export` en opset 17 a partir de los pesos del commit `f706ad9c4eb7f219c00d9050e46328518ffb65d2` de MobileSAM, con verificación de hash de los pesos. La innovación técnica destacable es la conversión específica para WebGPU: en las variantes fp16 se mantienen entradas, salidas y algunas operaciones en fp32 para evitar fallos de ejecución en dicho backend.

## Capacidades

- Segmentación de imágenes guiada por prompts de puntos: genera máscaras a partir de coordenadas introducidas por el usuario.
- Generación de máscaras: devuelve las tres máscaras alternativas de SAM a resolución 256 × 256, permitiendo elegir la más adecuada.
- Ejecución en JavaScript mediante `transformers.js`, con soporte de WebGPU para las variantes fp16.
- No soporta entradas de caja delimitadora ni máscaras como prompt en esta exportación (solo puntos).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación.

## Casos de uso

- Edición de imágenes en el navegador: el usuario hace clic sobre un objeto y el modelo genera la máscara correspondiente en el cliente, sin enviar la imagen a un servidor, gracias a la ejecución vía `transformers.js` y WebGPU.
- Anotación interactiva de datasets: permite a anotadores humanos seleccionar objetos con puntos y obtener máscaras preliminares que después se refinan, acelerando el etiquetado semántico o de instancias.
- Eliminación de fondos y recorte de objetos: combinando la máscara generada con operaciones de composición en canvas o WebGL, se pueden crear herramientas de recorte automático en aplicaciones web.
- Preprocesado visual en pipelines de visión por computador: generar máscaras de regiones de interés antes de tareas posteriores como OCR, detección o clasificación, todo dentro de un entorno JavaScript.
- Herramientas educativas y demos de segmentación: al tener un tamaño de repositorio de 0,1 GB y licencia Apache-2.0, es adecuado para prototipos y materiales docentes que se ejecutan localmente en el navegador.
- Aplicaciones de accesibilidad: selección de objetos mediante puntero o toque para resaltar elementos en imágenes, con latencia baja al evitar ida y vuelta al servidor.
- Integración en aplicaciones de escritorio basadas en Electron o en extensiones de navegador que necesiten segmentación ligera sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara que la exportación fp32 coincide exactamente con el predictor PyTorch de MobileSAM en fotografías de prueba, sin cifras de métricas como mIoU, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; el repositorio completo ocupa 0,1 GB, por lo que cada variante (fp32, fp16 u 8 bits) es de decenas de megabytes.
- GPU recomendadas: no disponibles de forma explícita; el modelo está pensado para ejecutarse en el navegador con WebGPU, lo que incluye GPU integradas y tarjetas de consumo compatibles con WebGPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU; no se dispone de lista oficial de modelos verificados.
- Opciones de despliegue: `transformers.js` (principal), con backend WebGPU para las variantes fp16; también puede ejecutarse con otros runtimes ONNX en JavaScript, aunque no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HRusby/mobilesam-onnx | no disponible (TinyViT destilado) | imagen 1024 × 1024 | Apache-2.0 | ONNX para transformers.js | Hugging Face, 0 descargas |
| Xenova/slimsam-77-uniform | no disponible | imagen 1024 × 1024 | no disponible en la información | ONNX para transformers.js | Hugging Face |
| MobileSAM original (ChaoningZhang/MobileSAM) | aproximadamente 10 millones en el codificador TinyViT | imagen 1024 × 1024 | Apache-2.0 | PyTorch (`.pt`) | GitHub |
| SAM (ViT-H) original | aproximadamente 632 millones en el codificador | imagen 1024 × 1024 | Apache-2.0 | PyTorch | Meta AI |

La comparación con Xenova/slimsam-77-uniform es directa porque esta exportación replica su estructura de ficheros e interfaces. Frente a MobileSAM original, la diferencia principal es el formato (ONNX frente a PyTorch) y la orientación a JavaScript. Frente a SAM ViT-H, MobileSAM sacrifica parte de la calidad de segmentación a cambio de un codificador mucho más pequeño.

## Limitaciones y advertencias

- Solo acepta prompts de puntos: no admite cajas delimitadoras ni máscaras de entrada, lo que limita el control fino sobre la segmentación.
- Resolución de salida fija de 256 × 256 para las tres máscaras alternativas, que puede requerir postprocesado para aplicaciones de alta resolución.
- Modelo de visión sin capacidades de lenguaje: no procesa texto, no responde preguntas y no tiene soporte multilingüe.
- Riesgo de segmentaciones imprecisas en objetos pequeños, oclusivos o con bordes ambiguos, inherente a la destilación de MobileSAM frente a SAM completo.
- Sesgos del dataset de entrenamiento subyacente (presumiblemente SA-1B) no documentados en la información disponible; pueden afectar la cobertura de dominios visuales específicos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo MobileSAM original y de los pesos destilados de SAM.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria.
- La compatibilidad con WebGPU depende de la implementación del navegador y de la GPU; las variantes fp16 mantienen operaciones en fp32 por este motivo, lo que puede afectar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/HRusby/mobilesam-onnx
- Repositorio MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Modelo de referencia para la estructura ONNX: https://huggingface.co/Xenova/slimsam-77-uniform
