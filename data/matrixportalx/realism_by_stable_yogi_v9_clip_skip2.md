# matrixportalx/Realism_By_Stable_Yogi_V9_clip_skip2

## Resumen

Realism_By_Stable_Yogi_V9_clip_skip2 es un modelo de generacion de imagenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por el usuario matrixportalx en Hugging Face. Su particularidad no es el entrenamiento, sino el formato: el UNet se ha convertido a un binario de contexto de Qualcomm QNN (runtime qnn2.28, tier 8gen2, HTP v73, activaciones de 16 bits) para ejecutarse directamente sobre la NPU Hexagon de los SoC Snapdragon, mientras que el text encoder y el VAE se mantienen en formato MNN sobre CPU/GPU.

El modelo esta pensado para la aplicacion Android Ruya / Local Dream, que permite importar modelos personalizados y generar imagenes de forma totalmente local en el telefono. El paquete se distribuye como un ZIP que se importa desde los ajustes de la app y cubre las resoluciones 512x512, 512x768 y 768x512, las nativas de SD 1.5. La arquitectura subyacente es la de difusion latente clasica de SD 1.5, con unos 1.000 millones de parametros repartidos entre UNet, text encoder CLIP ViT-L/14 y VAE.

Su relevancia actual es practica: demuestra un flujo reproducible para llevar modelos de difusion de 1.000 millones de parametros a NPUs de movil, un terreno donde la mayoria de alternativas (GGUF, safetensors) no ofrece aceleracion por hardware dedicado. El sufijo "clip_skip2" hace referencia al ajuste de CLIP skip = 2, habitual en fine-tunes de SD 1.5 orientados a realismo. El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion) con UNet; base Stable Diffusion 1.5 |
| Parametros totales | Aproximadamente 1.000 millones en la arquitectura SD 1.5 (UNet ~860 M, text encoder CLIP ViT-L/14 ~123 M, VAE ~83 M). El repositorio no publica un recuento propio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de prompt (limite del text encoder CLIP de SD 1.5) |
| Tipos de cuantizacion | Runtime QNN con activaciones de 16 bits; el detalle de cuantizacion de pesos no se especifica en la model card |
| Idiomas soportados | No disponible; el text encoder CLIP ViT-L/14 esta entrenado predominantemente en ingles |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Binarios QNN (UNet) y MNN (text encoder y VAE), empaquetados en un ZIP; no incluye safetensors ni GGUF |

Otros datos del repositorio: tamano de 1,0 GB, pipeline `text-to-image`, etiquetas `stable-diffusion`, `sd1.5`, `qualcomm`, `qnn`, `qairt`, `snapdragon`, `local-dream`, `text-to-image`, region `us`. Fecha de creacion y ultima actualizacion: 12 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del fine-tune: no indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning con LoRA. Lo unico que se declara es la base (Stable Diffusion 1.5) y el ajuste implicito de CLIP skip = 2 en el nombre del repositorio, un parametro de inferencia que descarta la ultima capa del text encoder y suele emplearse en fine-tunes de realismo. El nombre "Realism_By_Stable_Yogi_V9" sugiere una novena iteracion de un fine-tune orientado a fotorrealismo, pero no se aporta ninguna ficha tecnica, muestra comparativa ni metrica que lo respalde.

La innovacion real esta en el pipeline de conversion, no en el modelo. El repositorio `Sd-1.5-Converting-to-Qualcomm-QNN-Model` del mismo autor describe el proceso que transforma el UNet en un binario de contexto QNN compilado para el tier `8gen2` con HTP v73 y activaciones de 16 bits. El UNet se ejecuta en la NPU Hexagon, mientras que el text encoder y el VAE quedan en MNN sobre CPU/GPU. Esta division permite descargar la parte mas costosa (el bucle de denoising del UNet) a hardware especializado de bajo consumo, a cambio de atarse a una generacion concreta de SoCs.

## Capacidades

- Generacion de imagenes texto-a-imagen en resoluciones 512x512, 512x768 y 768x512, las nativas de SD 1.5.
- Ejecucion completamente local y offline en el dispositivo, sin llamadas a servicios en la nube.
- Inferencia acelerada por NPU para el UNet, con el text encoder y el VAE en CPU/GPU mediante MNN.
- Estilo orientado a realismo (segun el nombre del fine-tune), aunque no se aportan ejemplos ni comparativas que lo verifiquen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo de difusion, no un LLM.
- No dispone de capacidades de vision, audio, video ni comprension de imagenes de entrada.
- Capacidad multilingue no documentada; el text encoder CLIP esta optimizado para prompts en ingles.
- No soporta inpainting, outpainting, ControlNet ni img2img dentro del paquete distribuido, ya que solo se incluyen los binarios del pipeline base.

## Casos de uso

- Generacion de imagenes privada en movil: el modelo corre integramente en la NPU del telefono, por lo que el prompt y el resultado nunca salen del dispositivo. Adecuado para usuarios que no quieren enviar descripciones personales a servicios en la nube.
- Creacion de contenido artistico sin conexion: util en entornos sin cobertura o con conectividad limitada (viajes, zonas rurales, entornos aislados), donde la generacion local es la unica opcion viable.
- Prototipado de apps Android de difusion: sirve como referencia funcional para desarrolladores que quieran validar el rendimiento de un pipeline SD 1.5 sobre QNN antes de invertir en su propio modelo convertido.
- Integracion en aplicaciones de avatares o ilustracion: el paquete se importa directamente desde Ruya / Local Dream y cubre las tres relaciones de aspecto mas habituales en movil (cuadrada, vertical y horizontal).
- Generacion de recursos visuales en desarrollo de videojuegos: placeholders, texturas o conceptos rapidos generados en el propio dispositivo durante sesiones de brainstorming, sin depender de un puesto de trabajo con GPU.
- Evaluacion del rendimiento de NPUs Snapdragon: util como banco de pruebas para medir latencia y consumo energetico de un UNet SD 1.5 en HTP v73 frente a ejecuciones en CPU o GPU del mismo SoC.
- Demostraciones educativas de difusion latente en el aula: permite mostrar el funcionamiento de un modelo de difusion real en hardware asequible, sin acceso a un cluster ni a GPU de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, metricas de simetria, evaluaciones de preferencia humana ni comparaciones cuantitativas con el SD 1.5 original. Tampoco se aportan medidas de latencia, pasos por segundo ni consumo energetico en los SoC compatibles.

## Requisitos de hardware

- Dispositivo objetivo: telefonos con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 o 7 Gen 3 (tier `8gen2`, HTP v73). La lista exacta de SoCs compatibles la proporciona el autor en la model card.
- VRAM: no aplica en el sentido tradicional; el modelo usa la memoria unificada del SoC. No se publica el consumo de memoria en ejecucion.
- Espacio de almacenamiento: el paquete de modelos ocupa 1,0 GB, a lo que hay que sumar el ZIP descargado y el espacio de trabajo de la aplicacion.
- GPU de escritorio: no es el formato de destino. Los binarios QNN requieren la NPU Hexagon y el runtime qnn2.28, por lo que no se pueden cargar en A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: aplicacion Ruya / Local Dream en Android mediante "Settings → Import Custom Model". No es compatible con vLLM, llama.cpp, Ollama, TGI ni diffusers, ya que ninguno de estos frameworks interpreta binarios de contexto QNN ni MNN.
- Latencia y throughput: no disponible. Dependen del SoC concreto, del numero de pasos de muestreo y del scheduler, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Formato | Licencia | Ejecucion en movil |
|---|---|---|---|---|---|
| Realism_By_Stable_Yogi_V9_clip_skip2 | ~1.000 M (arquitectura SD 1.5) | 512x512 (hasta 768 en un eje) | QNN + MNN | CreativeML Open RAIL-M | Si, NPU Snapdragon (tier 8gen2) |
| Stable Diffusion 1.5 original | ~1.000 M | 512x512 | safetensors, diffusers | CreativeML Open RAIL-M | No de forma nativa; requiere conversion |
| Stable Diffusion 2.1 | ~1.000 M (UNet) + text encoder OpenCLIP | 512x512 / 768x768 | safetensors, diffusers | CreativeML Open RAIL-M | No de forma nativa |
| SDXL | ~2.600 M (UNet) + dos text encoders (~6.900 M en total) | 1024x1024 | safetensors, diffusers | CreativeML Open RAIL++-M | No de forma nativa; demasiado grande para NPUs moviles actuales |

Nota: no se dispone de datos de benchmarks que permitan comparar la calidad de salida de este fine-tune frente a SD 1.5, SD 2.1 o SDXL. La comparacion se limita a parametros, formato, resolucion y licencia.

## Limitaciones y advertencias

- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, y sin ejemplos publicados. No hay evidencia independiente de que la calidad de generacion sea la esperada para un fine-tune de realismo.
- Proceso de entrenamiento no documentado: se desconoce el dataset, el numero de pasos y si hubo fases de ajuste con preferencias humanas, lo que impide evaluar sesgos o comportamientos indeseados.
- Herencia de sesgos de SD 1.5 y de su dataset LAION: son conocidos los sesgos de representacion en cuanto a genero, etnia, profesion y contextos culturales.
- Artefactos tipicos de SD 1.5: manos y dedos deformes, anatomias incorrectas, texto ilegible y coherencia limitada en escenas complejas con muchos sujetos.
- Limite de prompt de 77 tokens (CLIP), insuficiente para descripciones muy largas o instrucciones compuestas.
- Idiomas: el text encoder esta entrenado principalmente en ingles; los prompts en castellano pueden degradar notablemente el resultado. No se declara soporte multilingue.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial, pero incluye la clausula de uso restringido del anexo A, que prohibe aplicaciones de vigilancia, discriminacion, desinformacion medica, acoso y generacion de contenido sexual no consentido, entre otras.
- Acoplamiento de hardware: los binarios estan compilados para el tier `8gen2` y el runtime qnn2.28. Cambiar de SoC o de version del runtime exige recompilar la conversion.
- Incompatibilidad de herramientas: el formato QNN/MNN no se puede cargar en diffusers, ComfyUI, Automatic1111 o cualquier interfaz de escritorio, lo que limita las opciones de inspeccion y ajuste fino.
- Sin soporte de img2img, inpainting ni ControlNet en el paquete distribuido: el flujo queda restringido a texto-a-imagen puro.
- Fechas del repositorio: la model card figura creada y actualizada el 12 de septiembre de 2026, lo que conviene verificar antes de citar la ficha, dado que puede tratarse de una fecha atipica o de un error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matrixportalx/Realism_By_Stable_Yogi_V9_clip_skip2
- Repositorio de conversion SD 1.5 a Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los enlaces obtenidos correspondian a articulos genericos sobre como desactivar el bloqueador de ventanas emergentes en navegadores, por lo que se han descartado. No se han localizado papers, blogs tecnicos ni demos adicionales asociados a este repositorio.
