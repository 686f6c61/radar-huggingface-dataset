# smashburger-dev/kleinhirn-weights

## Resumen

`smashburger-dev/kleinhirn-weights` no es un modelo entrenado desde cero, sino una conversion de pesos del modelo `fastino/gliner2.5-small-v1` (GLiNER2.5-small, de Fastino) al formato que carga el motor kleinhirn. GLiNER2.5-small es un clasificador de texto zero-shot orientado a extraccion de entidades y clasificacion con etiquetas definidas en tiempo de inferencia; su encoder es DeBERTa-v3-xsmall de Microsoft (licencia MIT). El repositorio contiene unicamente los tensores reorganizados, el tokenizer sin modificar y los manifiestos de verificacion, no un checkpoint compatible con Transformers.

La funcion del repositorio es permitir que el motor kleinhirn ejecute este clasificador directamente en el navegador mediante WebGPU, con una ruta de respaldo WASM-SIMD sobre CPU. Para ello se publican dos variantes de precision: `small-upstream/f32/` (pesos completos, usados por la ruta f32 de WebGPU y por la ruta WASM) y `small-upstream/f16/` (media precision, para la ruta f16 de WebGPU, que exige la extension `shader-f16`). El repositorio completo ocupa 0,5 GB, lo que situa al modelo en la categoria de encoders pequenos aptos para inferencia en cliente.

Su relevancia es de tipo practico mas que de investigacion: cubre el caso de clasificacion zero-shot y extraccion de entidades sin salida a red, es decir, con los datos del usuario permaneciendo en el dispositivo. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion declaradas (2026-09-29) son posteriores a la fecha de consulta, por lo que los metadatos deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer DeBERTa-v3-xsmall (Microsoft) con la cabeza de clasificacion zero-shot de GLiNER2.5; la model card indica que no es un checkpoint Transformers estandar |
| Parametros totales | No disponible (la model card no publica recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32 (32 bits) y f16 (16 bits; la ruta f16 requiere `shader-f16` en WebGPU). No se documentan formatos INT8 ni INT4 |
| Idiomas soportados | No disponible (la model card no declara idiomas y los metadatos de HuggingFace no listan ninguno) |
| Licencia | Apache-2.0 (modelo original y conversion); el encoder DeBERTa-v3-xsmall es MIT |
| Formato de pesos | Shards binarios `weights-*.bin` acompanados de `manifest.json` (layout de tensores, tamanos de shard y sha256) y `tokenizer.json`, en `small-upstream/f32/` y `small-upstream/f16/`. No es safetensors, no es GGUF y no es un checkpoint Transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLiNER2.5-small: un encoder transformer DeBERTa-v3-xsmall de Microsoft al que se anade una cabeza de clasificacion zero-shot. El enfoque GLiNER permite definir las etiquetas en el momento de la inferencia en lugar de fijarlas durante el entrenamiento, de modo que el mismo modelo puede extraer tipos de entidad arbitrarios (personas, organizaciones, importes, referencias legales, etc.) sin reentrenamiento. La model card de este repositorio no aporta detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; esa informacion corresponderia a la documentacion de `fastino/gliner2.5-small-v1`.

Lo unico que hace este repositorio es convertir el layout de tensores y castear los pesos a fp16. La conversion se realizo desde `fastino/gliner2.5-small-v1` en la revision `7e6f537f10337497069276892a5ef435028252ce` mediante el script `convert/export_weights.py` del repositorio kleinhirn. El tokenizer se mantiene sin cambios respecto al upstream. Como mecanismo de integridad, el motor verifica cada shard contra el sha256 declarado en `manifest.json`, lo que permite detectar descargas corruptas o manipuladas. Existe una discrepancia documental: la etiqueta de HuggingFace indica `deberta-v2`, mientras que la model card especifica DeBERTa-v3-xsmall; conviene tratar la model card como fuente mas fiable.

## Capacidades

- Clasificacion de texto zero-shot: permite definir las categorias en tiempo de ejecucion sin reentrenar el modelo.
- Extraccion de entidades nombradas (NER) con tipologia abierta, incluyendo entidades definidas por el usuario.
- Ejecucion en navegador sobre WebGPU, con respaldo WASM-SIMD en CPU cuando no hay GPU disponible.
- Inferencia local sin envio de texto a servidores externos, adecuada para datos personales o confidenciales.
- Verificacion de integridad de pesos mediante sha256 en el manifiesto.
- Seleccion de precision en tiempo de carga (f32 o f16) segun las capacidades del dispositivo.
- No se documentan capacidades de generacion de texto, razonamiento multi-paso, tool calling, agentes, vision ni audio.
- Los idiomas soportados no estan declarados en la informacion disponible.

## Casos de uso

- Anonimizacion previa a APIs de terceros: el modelo detecta nombres, direcciones, identificadores fiscales o numeros de tarjeta en el propio navegador y el texto se enmascara antes de salir del dispositivo. Es adecuado porque la inferencia ocurre en cliente y evita enviar el contenido original a un servidor.
- Extension de navegador para investigacion OSINT: resaltado en vivo de entidades (personas, organizaciones, ubicaciones) sobre paginas web mientras se navega, sin coste de servidor ni latencia de red.
- Etiquetado asistido de datasets: pre-anotacion masiva de corpus con esquemas de etiquetas que cambian por proyecto, reduciendo el trabajo manual del equipo de anotacion antes de la revision humana.
- Triaje de tickets de soporte en aplicaciones web: clasificacion de la consulta entrante por categoria o urgencia definida por el equipo, ejecutada en el cliente para evitar enviar el contenido del ticket a un clasificador remoto.
- Formularios inteligentes: extraccion de campos estructurados (importes, fechas, referencias) a partir de texto libre pegado por el usuario, para autocompletar el formulario sin backend.
- Aplicaciones PWA y escenarios sin conexion: clasificacion y extraccion en dispositivos sin red o con conectividad intermitente, apoyandose en la ruta WASM-SIMD cuando no hay WebGPU.
- Moderacion o enrutado de contenido en el borde: decision previa en el navegador sobre si un texto debe enviarse a un modelo mayor o descartarse, reduciendo coste de inferencia en servidor.
- Medicion de prestaciones por dispositivo: la pagina de benchmark del proyecto kleinhirn carga estos manifiestos para medir el rendimiento del motor en hardware concreto, con lo que el repositorio tambien sirve como artefacto de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, MMLU, HumanEval ni equivalentes, y los resultados de busqueda web obtenidos no guardan relacion con el modelo. El proyecto kleinhirn dispone de una pagina de benchmark de dispositivo que mide el rendimiento del motor (no la calidad del modelo), pero no se han proporcionado cifras concretas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,5 GB e incluye las dos precisiones; la variante f16 ocupa aproximadamente la mitad que la f32. Estas cifras son estimaciones basadas en el tamano de los ficheros, no datos publicados.
- GPU recomendadas: cualquier GPU con soporte WebGPU. La ruta f16 exige la extension `shader-f16`, disponible en navegadores Chromium recientes sobre hardware compatible. Para la ruta f32 basta con WebGPU estandar.
- GPU de consumo: si, el modelo esta pensado para ejecutarse en el navegador, incluidas GPU integradas y portatiles. No requiere GPUs de centro de datos como A100 o H100; de hecho esas plataformas no son el objetivo del motor.
- Respaldo en CPU: ruta WASM-SIMD con los pesos f32, sin necesidad de GPU.
- Opciones de despliegue: el unico motor documentado es kleinhirn, apuntando a una URL de manifiesto como `small-upstream/f16/manifest.json`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el propio autor advierte que estos ficheros no son un checkpoint Transformers.
- Latencia y throughput: no disponibles. Dependen del dispositivo y pueden medirse con la pagina de benchmark del proyecto kleinhirn.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smashburger-dev/kleinhirn-weights | No disponible | No disponible | Shards `.bin` + `manifest.json` para kleinhirn (f32/f16) | Apache-2.0 | WebGPU y WASM-SIMD via kleinhirn |
| fastino/gliner2.5-small-v1 (upstream) | No disponible en la informacion | No disponible | No disponible en la informacion (checkpoint Transformers) | Apache-2.0 | Transformers; puede convertirse a otros formatos |
| Otros clasificadores zero-shot basados en DeBERTa-v3-xsmall | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el modelo upstream: mismo encoder y misma cabeza, con la diferencia de que este repositorio reorganiza los tensores y anade una copia en fp16 para consumo del motor kleinhirn. No se dispone de datos de rendimiento de ninguno de los dos, por lo que no es posible establecer cual es mejor en calidad; la diferencia es exclusivamente de formato y de destino de ejecucion.

## Limitaciones y advertencias

- No es un checkpoint Transformers: no puede cargarse con `transformers`, ONNX Runtime ni servidores de inferencia habituales sin escribir una conversion propia.
- Compatibilidad restringida a kleinhirn: fuera de ese motor los ficheros no son directamente utilizables.
- Idiomas no declarados: no hay garantia documentada de cobertura multilingue ni del comportamiento fuera del idioma o idiomas de entrenamiento del modelo original.
- Longitud de contexto no documentada: los textos largos pueden truncarse sin aviso dependiendo de la configuracion del motor.
- Fechas de metadatos anomalas (creacion y actualizacion en 2026-09-29) y 0 descargas: no hay evidencia de uso en produccion ni validacion por terceros.
- Discrepancia entre la etiqueta `deberta-v2` del repositorio y la mencion a DeBERTa-v3-xsmall en la model card; conviene verificar antes de depender de cualquiera de las dos afirmaciones.
- Riesgo de falsos positivos en la extraccion de entidades: al ser un clasificador, el modo de fallo tipico es etiquetar texto irrelevante, por lo que se recomienda calibrar umbrales de confianza sobre datos propios.
- Sesgos: la model card no documenta analisis de sesgos ni composicion del dataset de entrenamiento del modelo original.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` y mantener la atribucion a Fastino (GLiNER2.5-small) y a Microsoft (encoder DeBERTa-v3-xsmall, MIT).
- Verificacion de integridad obligatoria: el motor valida cada shard contra el sha256 del manifiesto; alterar los ficheros rompe la carga.
- La busqueda web realizada no arroja informacion tecnica relevante sobre el modelo, por lo que no hay fuentes independientes que confirmen sus prestaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smashburger-dev/kleinhirn-weights
- Repositorio del motor kleinhirn: https://github.com/smashburger-dev/kleinhirn
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Encoder de referencia: https://huggingface.co/microsoft/deberta-v3-xsmall
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nota: los resultados de busqueda web disponibles corresponden a establecimientos de hosteleria y no contienen informacion relevante sobre este modelo; no se han encontrado papers, blogs ni demos adicionales.
