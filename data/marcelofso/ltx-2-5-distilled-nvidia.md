# MarceloFSO/ltx-2.5-distilled-nvidia

## Resumen

MarceloFSO/ltx-2.5-distilled-nvidia no es un modelo nuevo, sino un espejo sin restricciones de acceso (*ungated*) de cinco archivos del modelo LTX-2.5 de Lightricks, publicado para poder descargar los pesos sin cuenta de Hugging Face. Concretamente, rehospeda los componentes necesarios para ejecutar la `DistilledPipeline` oficial: el transformer de difusión destilado de 22B en bf16, el text encoder Gemma 4 de 12B con proyección, los VAE de vídeo y de audio, y el upscaler espacial latente x2. El autor declara que cada archivo es idéntico byte a byte a la revisión `49b093a39c19169a8a81721dcc541e07e945232f` del repositorio original, con verificación SHA-256 previa a la subida y sin ningún tipo de modificación.

El interés práctico del repositorio es la ausencia de *gating*: permite descargar aproximadamente 66 GiB de pesos en entornos automatizados, pipelines de CI o máquinas sin credenciales de Hugging Face, manteniendo la licencia original. Frente al repositorio de Lightricks, este espejo omite deliberadamente el transformer de desarrollo, las variantes int8 y nvfp4, las LoRAs y el upscaler temporal, por lo que solo cubre el caso de uso de la pipeline destilada.

La relevancia es, por tanto, de distribución y reproducibilidad más que de investigación: no aporta arquitectura ni entrenamiento propios, y su utilidad depende enteramente de LTX-2.5. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y fue creado el 19 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado para generacion de video; el conjunto incluye text encoder Gemma 4 de 12B con proyeccion, VAE de video, VAE de audio y upscaler espacial latente x2 |
| Parametros totales | 22B en el transformer de difusion; 12B en el text encoder; total agregado del pipeline no disponible |
| Parametros activos | No aplica (no se declara arquitectura MoE); no disponible |
| Longitud de contexto | No disponible (no se especifican duracion de clip, resolucion ni numero de frames) |
| Tipos de cuantizacion | bf16 unicamente en este espejo; el repositorio upstream incluye variantes int8 y nvfp4 que aqui no se incluyen |
| Idiomas soportados | No disponible |
| Licencia | LTX-2.x Community License Agreement (identificador `other`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 71,1 GB (aproximadamente 66 GiB de pesos) |
| Pipeline declarada | image-to-video (etiquetas adicionales: text-to-video, video-generation) |
| Revision de origen | 49b093a39c19169a8a81721dcc541e07e945232f |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

El repositorio contiene cinco archivos que conforman un pipeline de generacion de video basado en difusion: `ltx-2.5-22b-distilled-transformer-bf16.safetensors` (el denoiser principal, 22B parametros en bf16), `gemma4-12b-with-proj-ltx-2.5-bf16.safetensors` (text encoder Gemma 4 de 12B con una proyeccion entrenada para el modelo), `ltx-2.5-video-vae-bf16.safetensors` y `ltx-2.5-audio-vae-bf16.safetensors` (decodificadores de latentes de video y de audio) y `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` (upscaler espacial en espacio latente, factor x2). La variante "distilled" implica un modelo destilado para generar en pocos pasos, si bien la model card no detalla el numero de pasos, el scheduler ni la configuracion de muestreo.

No hay informacion sobre el entrenamiento: ni volumen de tokens, ni composicion del dataset, ni uso de RLHF/DPO, ni detalles del proceso de destilacion. La model card se limita a documentar el contenido del espejo y a remitir a la pipeline oficial (`python -m ltx_pipelines.distilled` del repositorio de GitHub de Lightricks). No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras) en la informacion disponible.

## Capacidades

- Generacion de video a partir de imagen (image-to-video), que es la pipeline declarada en los metadatos de Hugging Face.
- Generacion de video a partir de texto (text-to-video), segun las etiquetas del repositorio; no se detalla en la model card.
- Inferencia en pocos pasos gracias al transformer destilado, orientada a generacion rapida.
- Componente de audio: el pipeline incluye un VAE de audio, lo que sugiere manejo de latentes de audio, aunque la model card no documenta ninguna capacidad de generacion de audio.
- Reescalado espacial en espacio latente x2 mediante el upscaler incluido.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo.
- Cobertura multilingue: no disponible.
- No incluye modo "thinking", vision general ni audio de entrada; sus entradas documentadas son imagen y/o texto segun la pipeline.

## Casos de uso

- Estudio de video local: integracion de los pesos en una aplicacion de escritorio que muestre la licencia y solicite aceptacion antes de la descarga, tal y como hace VideoMakerIA, citado en la propia model card.
- Descarga automatizada sin credenciales: aprovisionamiento de pesos en pipelines de CI/CD o en contenedores efimeros donde no se quiere gestionar un token de Hugging Face ni aceptar el *gating* de forma interactiva.
- Reproducibilidad de experimentos: al fijar la revision `49b093a3...` y verificar SHA-256, se puede garantizar que dos ejecuciones usan exactamente los mismos bytes, algo util para publicaciones y auditorias.
- Entornos air-gapped: despliegue en maquinas sin acceso a Internet dentro de una red corporativa o academica, descargando una sola vez los cinco archivos necesarios.
- Prototipado de image-to-video: generacion de clips cortos a partir de una imagen de referencia para previsualizar ideas de guion, storyboard o diseno de producto antes de producir con herramientas comerciales.
- Evaluacion comparativa de modelos de video: uso del transformer destilado como linea base frente a otras familias de modelos abiertas, ejecutando la misma pipeline y los mismos prompts.
- Upscaling de latentes: reutilizacion del `latent-spatial-upscaler-x2` para aumentar la resolucion de latentes generados por el propio modelo en una segunda etapa del pipeline.
- Docencia y demos: explicacion practica de un pipeline de difusion con VAE de video y de audio, sin depender de la aprobacion de acceso del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 66 GiB de archivos (repositorio de 71,1 GB). Como referencia de desglose, el transformer de 22B en bf16 ocupa unos 44 GB y el text encoder de 12B en bf16 unos 24 GB; son estimaciones a partir del numero de parametros, no cifras publicadas por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de los pesos, el pipeline completo en bf16 requiere del orden de 66 GiB o mas, dependiendo de la resolucion, la duracion del clip y del *offloading* aplicado.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPU con 80 GB o mas para ejecutar el pipeline completo en una sola tarjeta; configuraciones multi-GPU o con descarga secuencial de modulos a CPU como alternativa.
- GPU de consumo: no cabe completo en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en bf16; seria necesario *offload* a RAM o recurrir a las variantes int8/nvfp4 del repositorio upstream, que este espejo no incluye.
- Opciones de despliegue: la pipeline oficial `python -m ltx_pipelines.distilled` del repositorio github.com/Lightricks/LTX-2. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este pipeline de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MarceloFSO/ltx-2.5-distilled-nvidia | 22B (transformer) + 12B (text encoder) | No disponible | LTX-2.x Community License | Acceso libre, sin gating | Espejo de 5 archivos, bf16, ~66 GiB |
| Lightricks/LTX-2.5 (upstream) | 22B (transformer) + 12B (text encoder) | No disponible | LTX-2.x Community License | Requiere aceptar gating en Hugging Face | Incluye transformer dev, variantes int8/nvfp4, LoRAs y upscaler temporal |
| Otras familias abiertas de generacion de video | No disponible | No disponible | No disponible | No disponible | Sin datos verificables en la informacion proporcionada; no se comparan cifras |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un espejo de pesos de Lightricks. Cualquier merito o defecto del modelo corresponde al original; el autor declara no estar afiliado ni respaldado por Lightricks.
- Solo contiene 5 archivos. Quedan fuera el transformer de desarrollo, las variantes int8 y nvfp4, las LoRAs y el upscaler temporal, por lo que no cubre todas las pipelines documentadas en el repositorio upstream.
- La licencia LTX-2.x Community License Agreement incluye restricciones de uso recogidas en su Attachment A. Es obligatorio revisar el texto completo antes de cualquier uso comercial y, en caso de redistribucion, transmitir la misma licencia y restricciones.
- Discrepancia de metadatos: las etiquetas de Hugging Face marcan `base_model:finetune:Lightricks/LTX-2.5`, mientras que la model card afirma que los archivos son copias sin modificar. Conviene tratarlo como una discrepancia sin resolver.
- Ausencia de validacion social: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de que el espejo se haya verificado de forma independiente, mas alla de la comprobacion SHA-256 que declara el autor.
- Sin benchmarks publicados: no es posible evaluar la calidad de generacion, la fidelidad al prompt ni la coherencia temporal con datos objetivos.
- Idiomas soportados no disponibles: se desconoce el comportamiento con prompts en castellano y el sesgo cultural o linguistico del text encoder en este contexto.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion para video, puede producir incoherencias temporales, deformaciones anatomicas y texto ilegible; no hay documentacion sobre este extremo.
- Requisitos muy altos: ~66 GiB de pesos en bf16 lo alejan de cualquier GPU de consumo sin offloading o sin las variantes cuantizadas no incluidas.
- Dependencia de codigo externo: los pesos no son autocontenidos; requieren clonar y ejecutar el repositorio de Lightricks, cuya compatibilidad futura no esta garantizada por el espejo.
- Fechas de creacion y actualizacion registradas en 2026-10-19, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/MarceloFSO/ltx-2.5-distilled-nvidia
- Modelo original: https://huggingface.co/Lightricks/LTX-2.5
- Codigo y pipeline oficial: https://github.com/Lightricks/LTX-2
- Texto de la licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
