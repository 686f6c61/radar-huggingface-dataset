# Nablo404/birefnet-lite-webgpu

## Resumen

BiRefNet-lite-webgpu es una exportación ONNX del modelo de segmentación de imagen BiRefNet_lite, reescrita a nivel de grafo para que pueda ejecutarse íntegramente en el backend WebGPU de ONNX Runtime Web dentro del navegador. Lo publica el usuario Nablo404 y deriva directamente de `onnx-community/BiRefNet_lite-ONNX`, que a su vez es una exportación del modelo original `ZhengPeng7/BiRefNet_lite`. Los pesos no se modifican: solo cambia la topología de ciertas operaciones para evitar cuellos de botella del runtime.

El modelo resuelve un problema muy concreto: la eliminación de fondo (background removal) y la segmentación de primer plano en el cliente, sin enviar imágenes a un servidor. La relevancia actual está en que permite inferencia de segmentación con calidad de modelo Swin en el navegador mediante Transformers.js y WebGPU, algo que la exportación original no lograba de forma fiable en determinadas GPU integradas.

La arquitectura subyacente es BiRefNet (Bilateral Reference Network), basada en un backbone Swin Transformer con un decodificador multi-escala. Se distribuye en fp16, con un tamaño de repositorio de 0,1 GB, licencia MIT y soporte exclusivo para la tarea de segmentación de imágenes. No es un modelo generativo ni conversacional: no procesa texto ni mantiene diálogos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference Network) con backbone Swin Transformer y decodificador multi-escala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | fp16 (pesos `onnx/model_fp16.onnx`); el repositorio base ofrece otras variantes ONNX |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (fp16), consumible vía Transformers.js |
| Tarea | image-segmentation / background-removal |
| Resolución de salida | 1.048.576 valores por imagen en la prueba de verificación (equivalente a máscara de 1024x1024) |
| Runtime objetivo | ONNX Runtime Web con backend WebGPU |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación binaria de primer plano construida sobre un backbone Swin Transformer con conexiones bilaterales de referencia entre etapas de encoder y decoder. El modelo "lite" es la variante reducida de la familia, pensada para menor coste computacional manteniendo calidad de máscara. Esta ficha no dispone de datos sobre el número exacto de parámetros, el volumen de tokens de entrenamiento ni la composición del dataset, ya que la model card no los detalla.

La innovación técnica de esta exportación no está en el entrenamiento, sino en la reescritura del grafo ONNX. Se abordan tres problemas del backend WebGPU: (1) los nodos Concat/Split con hasta 1024 entradas o 32 salidas superaban el límite de storage buffers por shader (17 frente al máximo de 16), y se sustituyen por árboles de la misma operación con un máximo de 8 buffers cada uno, el mínimo garantizado por WebGPU; (2) las cadenas de índices int64 de la convolución deformable se convierten a int32 con un cast a int64 justo antes de cada `GatherND`, ya que WebGPU no soporta int64; (3) la ausencia de kernel `Sum` en WebGPU obligaba a sumar tensores fp16 grandes en CPU, provocando `std::bad_alloc` por el límite de 4 GB del navegador, y se reemplaza por cadenas de `Add`. El autor verificó que la salida es bit a bit idéntica a la original en una imagen de prueba con onnxruntime-node en CPU (1.048.576 valores coincidentes).

## Capacidades

- Segmentación de imagen y eliminación de fondo: genera una máscara de primer plano a partir de una imagen de entrada.
- Inferencia 100 % en el navegador mediante Transformers.js y el backend WebGPU de ONNX Runtime Web.
- Ejecución en GPU integradas problemáticas, como Intel Iris Xe en Chrome, donde la exportación original fallaba.
- Procesamiento de imágenes locales sin subida a servidor, lo que habilita casos de uso con requisitos de privacidad.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje.
- No dispone de modo thinking, visión descriptiva, audio ni otras modalidades más allá de la segmentación.

## Casos de uso

- Eliminación de fondo en herramientas de edición fotográfica web: el modelo se carga con `AutoModel.from_pretrained` en el navegador y devuelve la máscara directamente desde WebGPU, de modo que el usuario puede recortar sujetos sin que la imagen salga de su equipo.
- Generación de avatares y fotos de producto en marketplaces: integrado en un formulario web, permite obtener fondos transparentes al instante y reducir la dependencia de servicios de segmentación en la nube.
- Preprocesado en aplicaciones de realidad aumentada o videoconferencia: la segmentación por fotograma o por imagen clave habilita la sustitución de fondo en el cliente, con la ventaja de que no requiere backend GPU.
- Herramientas de diseño gráfico colaborativas: un plugin basado en Transformers.js puede ofrecer "quitar fondo" como acción local, aprovechando que el repositorio pesa 0,1 GB y cabe en la caché del navegador.
- Aplicaciones de privacidad estricta (sanidad, documentos de identidad): al ejecutarse en el dispositivo, la imagen nunca se transmite, lo que facilita el cumplimiento de requisitos de tratamiento de datos sensibles.
- Prototipado rápido y demos educativas de segmentación: al no requerir infraestructura de servidor, sirve para mostrar en un notebook o una página estática cómo funciona BiRefNet con WebGPU y comparar máscaras frente a la versión CPU.
- Automatización de catálogos de imagen por lotes en el cliente: un script de navegador o una PWA puede procesar lotes de imágenes en segundo plano con Web Workers y WebGPU, generando PNG con alfa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una verificación de equivalencia numérica: la salida es bit a bit idéntica a la del ONNX original, con 1.048.576 valores coincidentes en una imagen de prueba ejecutada con onnxruntime-node en CPU. No hay cifras de mIoU, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,1 GB en fp16 y el modelo se ejecuta en el navegador, por lo que el consumo real depende del backend y de la resolución de entrada.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador; el autor valida el caso de Intel Iris Xe en Chrome, que es precisamente donde la versión original fallaba.
- GPU de escritorio: se espera funcionamiento en RTX 4090, RTX 3090, A100 o H100 a través de WebGPU, aunque no hay cifras publicadas de rendimiento en estas tarjetas.
- ¿Cabe en GPU consumer? Sí, es un modelo "lite" de 0,1 GB en fp16; el límite práctico es el soporte de WebGPU del navegador y la memoria del dispositivo, no el tamaño de los pesos.
- Opciones de despliegue: Transformers.js con `device: "webgpu"` y `dtype: "fp16"`; también puede ejecutarse con onnxruntime-node en CPU para verificación, y en principio con cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles. La model card menciona que la versión original superaba el límite de 4 GB del navegador al sumar tensores en CPU, pero no aporta tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nablo404/birefnet-lite-webgpu | no disponible (repo de 0,1 GB) | Imagen; máscara de 1024x1024 | Segmentación / background removal | MIT | HuggingFace, Transformers.js, WebGPU |
| onnx-community/BiRefNet_lite-ONNX | no disponible | Imagen | Segmentación / background removal | MIT (según modelo base) | HuggingFace, ONNX |
| ZhengPeng7/BiRefNet_lite | no disponible | Imagen | Segmentación / background removal | MIT | GitHub, pesos originales |
| ZhengPeng7/BiRefNet (full) | no disponible | Imagen | Segmentación de alta calidad | MIT | GitHub, pesos originales |

La diferencia clave frente a las alternativas es la compatibilidad con WebGPU: el modelo de `onnx-community` y el original de `ZhengPeng7` no incluyen la reescritura del grafo, por lo que pueden fallar en el backend WebGPU de ONNX Runtime Web en ciertas GPU. La variante "full" de BiRefNet ofrece presumiblemente mayor calidad de máscara a costa de más cómputo, aunque no se dispone de cifras comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de imagen: no genera texto, no razona y no responde a instrucciones en lenguaje natural.
- Sin datos publicados de sesgos, robustez o comportamiento en dominios distintos al de entrenamiento; no se puede evaluar su fiabilidad fuera de casos generales.
- Riesgo de máscaras imprecisas en imágenes con fondos complejos, sujetos múltiples o bordes finos (pelo, transparencias), inherente a los modelos de segmentación binaria; no hay métricas publicadas que lo cuantifiquen.
- Dependencia de WebGPU: en navegadores o GPU sin soporte WebGPU, el modelo no podrá ejecutarse en GPU y caerá a otros backends o fallará.
- El límite de memoria del navegador (4 GB) sigue siendo una restricción de entorno, aunque la reescritura evita el caso concreto de `Sum` en CPU.
- La licencia MIT permite uso comercial, pero se mantiene el aviso de copyright original; conviene revisar los términos del modelo base y del backbone Swin si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se especifican los idiomas ni el comportamiento multilingüe porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nablo404/birefnet-lite-webgpu
- Modelo base ONNX: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Repositorio original de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Modelo original BiRefNet_lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
