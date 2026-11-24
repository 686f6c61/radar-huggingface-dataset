# gatilin/wevisone-vl-2b-vision-encoder

## Resumen

WeVisOne-VL-2B Vision Encoder es un paquete de componentes extraidos del modelo multimodal tencent/WeVisOne-VL-2B, publicado por el usuario gatilin. No es un modelo completo: contiene unicamente la torre de vision (315 tensores `model.visual.*` en BF16, 406.957.056 parametros, 24 bloques visuales, merger y tres DeepStack mergers) junto con el decodificador de mascaras original (`mask_decoder.pt`, ~9,5 millones de parametros). El backbone de lenguaje y el tokenizador no estan incluidos.

El interes del paquete es practico: permite reutilizar el encoder visual de un VLM orientado a segmentacion y matting sin cargar el modelo completo, algo util para pipelines de extraccion de caracteristicas, segmentacion promptable y experimentacion con las salidas DeepStack. La arquitectura subyacente es la de Qwen3-VL (tag `qwen3_vl`), con preprocesado compatible con la convencion `Qwen2VLImageProcessor`.

Es relevante ahora porque los componentes extraidos de VLMs estan ganando traccion como bloques reutilizables en sistemas de vision; este bundle conserva las claves originales y fija la revision upstream `fcf8c8ca7fa481b514005ef591c8b72bed39618a`, lo que facilita la trazabilidad. El decodificador, no obstante, requiere caracteristicas visuales multinivel, un estado oculto de object-query y una bounding box normalizada que el bundle por si solo no genera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre visual de un transformer multimodal tipo Qwen3-VL (24 bloques visuales, merger y tres DeepStack mergers) + decodificador de mascaras |
| Parametros totales | 406.957.056 (encoder visual); 9.511.460 en el decodificador segun implementacion upstream probada (la model card fuente indica 9.609.764) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16; el script de carga acepta `dtype=torch.float32`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + PyTorch (`mask_decoder.pt`) |

## Arquitectura y entrenamiento

El componente es una extraccion de la torre visual del VLM tencent/WeVisOne-VL-2B. Consta de 24 bloques visuales con sus claves originales preservadas, un merger y tres DeepStack mergers. El encoder devuelve tres tipos de salida: caracteristicas de parche pre-merger, caracteristicas fusionadas y salidas DeepStack. El decodificador de mascaras es el original del modelo fuente, con 296 entradas de estado, y se instancia a partir de `Qwen3VLSegConfig` leyendo la configuracion del sidecar.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo etapas de RLHF o DPO. El paquete es una exportacion de pesos, no un reentrenamiento: los tags indican `base_model:finetune:tencent/WeVisOne-VL-2B`, pero la model card no documenta ningun proceso de ajuste adicional. La innovacion tecnica destacable es la preservacion de las salidas DeepStack y la verificacion de paridad de atencion en las capas 0, 11 y 23 frente al modelo original, ademas de la comparacion byte a byte del payload de vision con rangos HTTP cacheados del origen.

## Capacidades

- Extraccion de caracteristicas visuales: genera caracteristicas de parche pre-merger y post-merger a partir de imagenes.
- Salidas DeepStack multinivel: tres mapas de caracteristicas adicionales pensados para decodificadores densos.
- Segmentacion de imagenes y matting: el decodificador incluido produce mascaras a partir de caracteristicas multinivel, un object-query y una bounding box normalizada.
- Preprocesado compatible con la convencion `Qwen2VLImageProcessor`.
- No incluye generacion de texto, razonamiento, codigo ni matematicas: el backbone de lenguaje y el tokenizador no forman parte del bundle.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso.
- No genera object-queries ni realiza segmentacion guiada por texto por si solo; esas funciones residen en el modelo completo.
- Capacidades multilingues: no disponibles (sin componente de lenguaje).

## Casos de uso

- Extraccion de embeddings visuales para busqueda e indexacion: el encoder devuelve caracteristicas fusionadas utilizables como representacion de imagen en sistemas de recuperacion, sin cargar el VLM completo.
- Segmentacion promptable con cajas: el decodificador acepta una bounding box normalizada y un object-query, lo que permite construir un pipeline de segmentacion por caja similar a los flujos tipo SAM, siempre que se aporte el estado oculto de query.
- Matting de alta resolucion: las salidas DeepStack multinivel alimentan el decodificador para refinar bordes; el canvas de produccion upstream es de 1024 x 1024.
- Investigacion en arquitecturas DeepStack: el bundle expone las tres salidas de merger, util para estudiar como se combinan caracteristicas de distintas profundidades en tareas densas.
- Destilacion o adaptacion a tareas propias: al ser un encoder aislado de ~407 M de parametros, se puede congelar y entrenar cabezas ligeras encima para clasificacion, deteccion o segmentacion especifica de dominio.
- Validacion y auditoria de pesos: la preservacion de claves y los hashes SHA-256 publicados permiten verificar la integridad de la exportacion frente al modelo fuente en entornos regulados.
- Prototipado en CPU: el script de carga admite `device='cpu'` con `dtype=torch.float32`, adecuado para pruebas de integracion sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas de validacion: inferencia sobre dos imagenes COCO128 con comprobacion de paridad de atencion en las capas 0, 11 y 23, y carga estricta del decodificador con cuatro mapas de caracteristicas, query sintetica a cero, caja fija y lienzo de 256 x 256. El autor advierte explicitamente que esta prueba de cableado no establece calidad de segmentacion ni equivalencia extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en BF16 para el encoder (406.957.056 parametros) y unos 19 MB para el decodificador; en FP32, alrededor de 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este componente aislado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la carga se realiza mediante `snapshot_download` y el modulo `component.py` incluido, con `torch.load(..., weights_only=True)` para el decodificador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/wevisone-vl-2b-vision-encoder | 406.957.056 (encoder) + 9.511.460 (decoder) | no disponible | Extraccion de caracteristicas, segmentacion, matting | Apache-2.0 | Hugging Face, 0 descargas |
| tencent/WeVisOne-VL-2B | no disponible | no disponible | VLM completo con segmentacion | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Meta SAM (Segment Anything) | no disponible en la informacion proporcionada | no disponible | Segmentacion promptable | no disponible en la informacion proporcionada | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con los datos disponibles; solo se confirma que el modelo base es tencent/WeVisOne-VL-2B, del que este paquete es un subconjunto.

## Limitaciones y advertencias

- El bundle no es un modelo funcional autonomo: carece de backbone de lenguaje, tokenizador y del mecanismo que genera object-queries.
- El decodificador no realiza segmentacion guiada por texto por si solo; requiere caracteristicas multinivel, un estado oculto de query y una caja normalizada aportados externamente.
- La validacion del decodificador se hizo con un lienzo de 256 x 256 y una query sintetica; el canvas de produccion upstream es 1024 x 1024 y no se ha verificado equivalencia extremo a extremo.
- Los shards originales completos no se descargaron ni hashearon de forma independiente; la verificacion se baso en comparacion byte a byte con rangos HTTP cacheados.
- Riesgo de alucinacion: no aplica al no incluir componente generativo de texto, pero las mascaras pueden ser incorrectas sin una validacion de calidad documentada.
- Sesgos conocidos: no documentados; al heredar los pesos del modelo fuente, podria arrastrar los sesgos de su dataset de entrenamiento, no descrito.
- Idiomas: no aplica, sin modulo de lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero los componentes de terceros conservan sus propios avisos y deben consultarse en los repositorios de origen.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wevisone-vl-2b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-2B
- Revision upstream fijada: `fcf8c8ca7fa481b514005ef591c8b72bed39618a`
- SHA-256 de `model.safetensors`: `2df658bb9737ffc32a85ccece13c71b21fb0cabbc83933f83521d93ecc92eedb`
- SHA-256 de `mask_decoder.pt`: `5d42d641f5c493e1d3f48869d36f9d74ac2ba2fbd5146db8de513f19084a469f`
- Archivos de validacion incluidos en el repo: `validation.json`, `mask_validation.json`, `source_manifest.json`, `validate_mask_decoder.py`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
