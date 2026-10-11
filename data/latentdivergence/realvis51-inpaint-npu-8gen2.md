# latentdivergence/realvis51-inpaint-npu-8gen2

# Realvis inpaint npu (8gen2)

## Resumen

Realvis inpaint npu (8gen2) es un paquete de grafos ONNX precompilados para el motor QNN, pensado para ejecutar inpainting y outpainting de Stable Diffusion directamente sobre el NPU Hexagon del Qualcomm Snapdragon 8 Gen 2 (HTP v73). Lo publica el usuario latentdivergence dentro del proyecto Latent Studio, y esta pensado para las funciones Replace (inpainting con mascara de pincel) y Uncrop (outpainting de bordes). Los grafos se compilaron con Qualcomm AI Hub y QAIRT 2.45, y todas las entradas y salidas son tensores fp32 a resolucion 512x512, gestionados a traves del QNN execution provider de ONNX Runtime.

El modelo no se ha reentrenado ni fusionado: es un derivado de Uminosachi/realisticVisionV51_v51VAE-inpainting (una especializacion fotorrealista de Stable Diffusion 1.5), del que solo se ha exportado, cuantizado y compilado. Incluye tres grafos: un UNet de inpainting de 9 canales (latente de 4 canales + mascara + latente de la imagen enmascarada) y los dos modulos del VAE de SD 1.5 (encoder y decoder). El text encoder, el tokenizer y una VAE de respaldo para CPU provienen del build int8 ONNX del mismo autor.

Su relevancia es de despliegue en el borde: permite hacer edicion generativa de imagen en un telefono movil apoyandose en el NPU en lugar de la CPU o la GPU, con un coste de fidelidad numerica muy bajo respecto al modelo en fp32 (similitud coseno de 0.997 en el UNet). El repositorio ocupa 1,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de inpainting de 9 canales derivado de Stable Diffusion 1.5 (condicionamiento cruzado con encoder de texto de 77 tokens) mas encoder y decoder VAE de SD 1.5 |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible en la informacion; el encoder de texto asociado usa secuencias de 77 tokens |
| Tipos de cuantizacion | UNet en w8a16 (pesos int8, activaciones int16); encoder y decoder VAE en fp16; entradas y salidas de los grafos en fp32 |
| Idiomas soportados | no disponibles |
| Licencia | creativeml-openrail-m (CreativeML OpenRAIL-M) |
| Formato de pesos | ONNX con grafos EPContext de QNN (QAIRT 2.45); ficheros de text encoder, tokenizer y VAE de CPU en el build int8-onnx |
| Resolucion de trabajo | 512x512 |

## Arquitectura y entrenamiento

El paquete consta de tres grafos ONNX compilados para el QNN execution provider. El UNet es la variante de inpainting de 9 canales: recibe sample[1,9,64,64] (4 canales de latente, 1 de mascara y 4 del latente de la imagen enmascarada), timestep[1] y encoder_hidden_states[1,77,768], y devuelve out_sample. El encoder VAE toma image[1,3,512,512] en el rango [-1,1] y produce posterior mean[1,4,64,64] sin escalar; el decoder VAE invierte el proceso, de latent[1,4,64,64] sin escalar a image[1,3,512,512]. El espacio latente es de 64x64 con 4 canales, coherente con el factor de compresion 8x de SD 1.5.

No ha habido entrenamiento ni fusion de pesos por parte del autor: la tarjeta indica explicitamente que el modelo es una obra derivada y que solo se ha exportado, cuantizado y compilado. La calibracion w8a16 (cuando se aplico) se hizo con ejecuciones reales de Replace (mascaras de pincel) y Uncrop (bordes de outpainting), usando el muestreador DPM++ 2M Karras con 28 pasos y CFG 7.5. El text encoder, el tokenizer y una VAE de respaldo para CPU se reutilizan del build latentdivergence/realvis51-inpaint-int8-onnx.

## Capacidades

- Inpainting guiado por mascara: rellena regiones marcadas con pincel (funcion Replace de Latent Studio) manteniendo el estilo fotorrealista de la imagen original.
- Outpainting de bordes: extiende la imagen mas alla del encuadre original (funcion Uncrop).
- Generacion text-to-image condicionada por el text encoder CLIP de 77 tokens del build asociado.
- Generacion de imagenes de tematica realista, heredada del modelo base Realistic Vision 5.1.
- Ejecucion acelerada en NPU: los tres grafos estan compilados para el Hexagon (HTP v73) del Snapdragon 8 Gen 2.
- No dispone de tool calling ni de function calling.
- No soporta razonamiento multi-paso tipo agente; es un modelo de difusion de imagen, no un modelo de lenguaje.
- Cobertura multilingue: no disponible en la informacion (depende del CLIP asociado, que no se documenta en esta tarjeta).
- No incluye capacidades de audio ni de video.

## Casos de uso

- Edicion fotografica en el movil: eliminar objetos o personas de una foto mediante mascara de pincel, ejecutando la difusion en el NPU del Snapdragon 8 Gen 2 sin enviar la imagen a la nube.
- Ampliacion de encuadre (uncrop): rellenar los bordes de una imagen recortada para adaptarla a otra relacion de aspecto, util en apps de composicion y redes sociales.
- Restauracion de fotos antiguas: reconstruir zonas danadas o perdidas marcadas manualmente manteniendo un aspecto realista.
- Edicion con privacidad por diseno: aplicaciones que necesitan tratar imagenes sensibles sin salida a servicios externos, aprovechando la inferencia local en el NPU.
- Integracion en Latent Studio: los grafos estan precompilados para las funciones Replace y Uncrop de esta herramienta, por lo que su caso de uso principal es servir de backend de aceleracion en esa app.
- Prototipado de pipelines de difusion en el borde: desarrolladores que quieran medir el coste real de un UNet de inpainting en un NPU movil antes de decidir un despliegue en produccion.
- Modulo de edicion en apps de retoque fotografico para Android sobre dispositivos con Snapdragon 8 Gen 2, donde el presupuesto de latencia por operacion debe mantenerse bajo.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y fidelidad numerica de los grafos, no de benchmarks de calidad de imagen (no se han publicado resultados tipo FID, CLIP score o comparativas con otros modelos de inpainting en la informacion disponible).

| Grafo | Precision | Latencia AI Hub (ms/run) | Similitud coseno vs fp32 en dispositivo real |
|---|---|---|---|
| unet (9 canales, batch 1) | w8a16 (pesos int8, activaciones int16) | 209,638 | 0,9970775694968188 |
| vae_encoder_npu | fp16 | 184,846 | 0,9999960421512988 |
| vae_decoder_npu | fp16 | 437,858 | 0,9999997071962604 |

Estimacion derivada de estos datos: un ciclo completo de muestreo de 28 pasos con un unico paso de codificacion y decodificacion VAE supondria aproximadamente 6,5 s por imagen (28 x 209,638 + 184,846 + 437,858 ms), sin contar el text encoder ni el resto del pipeline.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon del Qualcomm Snapdragon 8 Gen 2, con HTP v73. Los grafos EPContext de QNN estan compilados para ese objetivo concreto y no son portables a otros aceleradores.
- VRAM estimada para inferencia: no disponible en la informacion (la ejecucion es en NPU, no en GPU).
- GPU recomendadas: no aplica; el paquete no esta pensado para GPU de escritorio. No se documentan equivalentes en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; no se puede aprovechar el QNN EP en tarjetas graficas consumer estandar.
- Opciones de despliegue: ONNX Runtime con el QNN execution provider, Qualcomm AI Hub / QAIRT 2.45 y la aplicacion Latent Studio. El text encoder, el tokenizer y la VAE de CPU se toman del build int8-onnx.
- Tamano del repositorio: 1,1 GB.
- Latencia: 209,638 ms por ejecucion de UNet, 184,846 ms por codificacion VAE y 437,858 ms por decodificacion VAE, medidos con AI Hub, segun la tarjeta.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Precision / formato | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentdivergence/realvis51-inpaint-npu-8gen2 | Grafos ONNX precompilados para NPU Hexagon | UNet w8a16, VAE fp16 | 512x512 | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| Uminosachi/realisticVisionV51_v51VAE-inpainting | Modelo base (SD 1.5 inpainting) | Pesos originales en fp16/otros | 512x512 | CreativeML OpenRAIL-M | Hugging Face |
| latentdivergence/realvis51-inpaint-int8-onnx | Build ONNX int8 para CPU | int8 / ONNX | 512x512 | CreativeML OpenRAIL-M | Hugging Face |

La comparativa con alternativas de la misma categoria (otros modelos de inpainting de difusion) en parametros, contexto y rendimiento de calidad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia CreativeML OpenRAIL-M heredada del modelo base: incluye restricciones de uso (clausulas de uso aceptable) que condicionan la explotacion comercial y determinados casos de uso; hay que revisarlas antes de integrarlo en un producto.
- No ha habido reentrenamiento: hereda tanto las capacidades como los sesgos del dataset original de Realistic Vision 5.1 / SD 1.5, con posible infrarrepresentacion de determinadas culturas, generos o etnias.
- Riesgo de alucinacion visual: como modelo generativo puede inventar contenido plausible pero incorrecto en las zonas reconstruidas.
- Dependencia de hardware: los grafos estan compilados para el HTP v73 del Snapdragon 8 Gen 2. No son directamente reutilizables en otros NPU, GPU o en hardware de sobremesa sin recompilar.
- Resolucion fija de 512x512; no se documenta soporte de otras resoluciones nativas.
- Idiomas soportados: no disponibles, lo que dificulta evaluar el comportamiento multilingue del condicionamiento de texto.
- Artefactos por cuantizacion: el UNet en w8a16 presenta una similitud coseno de 0,997 frente a fp32, lo que implica una desviacion numerica no nula respecto al modelo completo.
- El paquete solo aporta grafos del UNet y del VAE; el text encoder y el tokenizer dependen de otro repositorio, lo que anade una dependencia externa para su uso.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados publicados de calidad de imagen.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/latentdivergence/realvis51-inpaint-npu-8gen2
- Modelo base: https://huggingface.co/Uminosachi/realisticVisionV51_v51VAE-inpainting
- Build int8 ONNX para CPU (text encoder, tokenizer y VAE de respaldo): https://huggingface.co/latentdivergence/realvis51-inpaint-int8-onnx
- Qualcomm AI Hub, referenciado en la tarjeta como entorno de compilacion: https://aihub.qualcomm.com
- La busqueda web realizada no ha devuelto papers, blogs ni repos adicionales relevantes sobre este modelo.
