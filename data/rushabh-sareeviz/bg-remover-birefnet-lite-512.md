# rushabh-sareeviz/bg-remover-birefnet-lite-512

## Resumen

BiRefNet-lite 512 int8 es una exportación ONNX del modelo de segmentación de primer plano BiRefNet_lite, desarrollado originalmente por Zheng Peng y publicado bajo licencia MIT. Esta variante concreta, mantenida por el usuario rushabh-sareeviz, adapta el modelo para su ejecución íntegra en el navegador mediante onnxruntime-web, con pesos cuantizados a int8 y una resolución fija de entrada de 512x512 píxeles. El modelo no genera texto ni razona: es un segmentador de imágenes cuyo único cometido es producir una máscara de primer plano (foreground mask) para tareas de eliminación de fondo.

La relevancia de esta ficha radica en su enfoque de despliegue: se trata de un modelo de visión de código abierto, empaquetado como un único grafo ONNX comprimido en cinco fragmentos gzip, pensado para que la inferencia ocurra en el dispositivo del usuario sin subir imágenes a ningún servidor. Según la model card, los pesos proceden de una exportación de 512x512 de `studioludens/birefnet-lite-512` y se verificaron como idénticos a los de `onnx-community/BiRefNet_lite-ONNX`; los cambios se limitan a reescrituras de nodos del grafo para compatibilidad con onnxruntime-web y a la cuantización int8.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, al ser un modelo de visión) ni los idiomas soportados. La model card declara una desviación máxima de la salida respecto al original de 0,0001 de media en CPU y 0,0003 en Chrome WebGPU, lo que sitúa la pérdida por cuantización en un rango muy bajo para la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación de imagen binocular, basada en transformer; detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512x512) |
| Tipos de cuantizacion | int8 (pesos); entrada float32 |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (comprimido en gzip, dividido en 5 fragmentos: `model.onnx.gz.0` a `model.onnx.gz.4`) |

## Arquitectura y entrenamiento

El modelo base es BiRefNet_lite, una variante ligera de BiRefNet, una arquitectura de segmentación de primer plano que combina representaciones bilaterales de alta y baja resolución para refinar los bordes de la máscara. La model card de esta exportación no detalla la composición del dataset de entrenamiento, el número de tokens (no aplica) ni si se emplearon técnicas de ajuste fino por refuerzo; esa información correspondería a la model card del modelo base `ZhengPeng7/BiRefNet_lite`, que no se incluye en la información proporcionada.

La innovación técnica de esta variante es de despliegue, no de entrenamiento: se reescribieron algunos nodos del grafo para que el modelo funcione en onnxruntime-web, se almacenaron los pesos en int8 y se fragmentó el flujo gzip en cinco partes para facilitar su distribución. La entrada es un tensor `1 x 3 x 512 x 512` de tipo float normalizado con estadísticas de ImageNet, y la salida es un tensor `1 x 1 x 512 x 512` con los logits de la máscara. La verificación de pesos cubre los 139 tensores del modelo, comparados con la referencia de `onnx-community/BiRefNet_lite-ONNX` (revisión de15b22).

## Capacidades

- Segmentación de primer plano (foreground segmentation) de imágenes a resolución fija de 512x512.
- Generación de máscaras binarias o probabilísticas a partir de logits, aptas para composición alfa y eliminación de fondo.
- Inferencia en el navegador del cliente mediante onnxruntime-web, sin envío de imágenes a servidores.
- Ejecución con aceleración WebGPU en Chrome, además de ejecución en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No incluye modo de razonamiento (thinking mode) ni otras capacidades generativas.

## Casos de uso

- Eliminación de fondo en herramientas web gratuitas: el modelo se integra en una página con onnxruntime-web y procesa la imagen en el navegador del visitante, de modo que la foto nunca se sube a un servidor, lo que simplifica el cumplimiento de privacidad y reduce costes de infraestructura.
- Editor de imágenes en el cliente: permite recortar sujetos y generar máscaras alfa para composición en lienzos HTML5 o WebGL, con una resolución de 512x512 adecuada para avatares, miniaturas y previsualizaciones.
- Procesamiento por lotes en el navegador: al ejecutarse localmente, se pueden procesar catálogos de imágenes sin coste de GPU en servidor, siempre que el dispositivo del usuario tenga recursos suficientes.
- Generación de fondos transparentes para comercio electrónico: útil para preparar fotos de producto con fondo uniforme y sustituirlo por fondos neutros o de marca, con la ventaja de que el pipeline no expone las imágenes a terceros.
- Integración en aplicaciones de escritorio o extensiones web: el grafo ONNX puede cargarse en cualquier runtime compatible (onnxruntime-web, onnxruntime nativo), lo que permite reutilizar el mismo artefacto en distintos entornos.
- Prototipado de segmentación en investigación: sirve como referencia de un modelo de segmentación ligero y cuantizado para comparar precisión y latencia frente a variantes de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una métrica de fidelidad respecto al modelo original: diferencia media de 0,0001 en CPU y 0,0003 en Chrome WebGPU entre la salida de esta exportación int8 y la del modelo de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en el navegador, por lo que el consumo depende del runtime y del backend (CPU o WebGPU).
- GPU recomendadas: no se especifican; la model card menciona ejecución en Chrome WebGPU y en CPU, sin detallar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible como dato explícito; al ser un modelo lite de 512x512 y pesos int8, es plausible su ejecución en GPU integradas y de gama media, pero no se confirma en la información proporcionada.
- Opciones de despliegue: onnxruntime-web (navegador), onnxruntime nativo y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rushabh-sareeviz/bg-remover-birefnet-lite-512 | no disponible | 512x512 | MIT | ONNX int8 | Optimizado para onnxruntime-web; verificado contra BiRefNet_lite-ONNX |
| ZhengPeng7/BiRefNet_lite | no disponible | no disponible | MIT | safetensors (presumiblemente) | Modelo base original de referencia |
| onnx-community/BiRefNet_lite-ONNX | no disponible | no disponible | no disponible | ONNX | Exportación de referencia usada para verificar los pesos |
| studioludens/birefnet-lite-512 | no disponible | 512x512 | no disponible | ONNX | Exportación de origen de esta variante |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo realiza segmentación de primer plano; no genera texto, no responde a instrucciones y no debe presentarse como un modelo de lenguaje.
- La entrada está fijada a 512x512 píxeles; imágenes de otra resolución requieren redimensionado previo, lo que puede afectar a la precisión en objetos pequeños o muy alargados.
- La cuantización int8 introduce una desviación pequeña pero no nula (hasta 0,0003 de media en WebGPU); en aplicaciones que exijan máxima fidelidad de borde conviene validar contra el modelo original.
- No se documentan sesgos específicos del modelo, pero al ser un segmentador entrenado con datos no descritos en esta ficha, su comportamiento puede degradarse en dominios alejados de la distribución de entrenamiento (por ejemplo, imágenes médicas o aéreas).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías; para producción conviene revisar también la licencia del modelo base y de la exportación de origen.
- El artefacto se distribuye como cinco fragmentos gzip que deben concatenarse en orden y descomprimirse antes de obtener `model.onnx`; un manejo incorrecto del flujo produce un fichero inválido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rushabh-sareeviz/bg-remover-birefnet-lite-512
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportación de origen: https://huggingface.co/studioludens/birefnet-lite-512
- Exportación de referencia ONNX: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Demo del autor: https://sareeviz.com/tools/remove-background
