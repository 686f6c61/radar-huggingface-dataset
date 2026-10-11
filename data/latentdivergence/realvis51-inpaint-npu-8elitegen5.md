# latentdivergence/realvis51-inpaint-npu-8elitegen5

## Resumen

RealVis Inpaint NPU (8elitegen5) es un paquete de grafos ONNX precompilados para el motor QNN EPContext de Qualcomm, pensado para ejecutar inpainting y outpainting de imagenes sobre la NPU Hexagon (HTP v81) del Snapdragon 8 Elite Gen 5. Lo publica el usuario latentdivergence y forma parte del ecosistema de Latent Studio, concretamente para sus funciones Replace (relleno de zonas enmascaradas con el pincel) y Uncrop (extension de bordes de la imagen).

No es un modelo entrenado desde cero: es un derivado exportado, cuantizado y compilado de Uminosachi/realisticVisionV51_v51VAE-inpainting, que a su vez es una variante de inpainting de Realistic Vision 5.1, basada en la arquitectura Stable Diffusion 1.5. Por tanto hereda su espiritu: difusion latente sobre un UNet de 9 canales de entrada (4 latentes + 1 mascara + 4 del latente de la imagen enmascarada), con un text encoder CLIP de 77 tokens y una resolucion nativa de 512x512.

Su relevancia es de despliegue, no de investigacion: demuestra que un pipeline completo de inpainting SD 1.5 puede ejecutarse en la NPU de un telefono de gama alta con una fidelidad casi identica a fp32 (coseno de 0,99996 en el UNet) y latencias del orden de cientos de milisegundos por pase. El repositorio ocupa 1,9 GB y la licencia es CreativeML OpenRAIL-M, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5) con UNet de 9 canales para inpainting; grafos ONNX precompilados para QNN EPContext |
| Parametros totales | No disponible en la informacion proporcionada (arquitectura SD 1.5; UNet de inpainting, VAE y text encoder CLIP) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de text encoder (CLIP); resolucion de imagen 512x512 (latente 64x64) |
| Tipos de cuantizacion | fp16 en los grafos NPU; w8a16 en la calibracion citada; el build CPU asociado es int8 ONNX |
| Idiomas soportados | No disponibles (el text encoder CLIP trabaja en ingles) |
| Licencia | creativeml-openrail-m (CreativeML OpenRAIL-M) |
| Formato de pesos | ONNX (grafos QNN EPContext) mas ficheros ONNX del build CPU para text encoder, tokenizer y VAE de reserva |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de Stable Diffusion 1.5 en espacio latente. La entrada del UNet es un tensor `sample[1,9,64,64]` que combina 4 canales de latente, 1 canal de mascara y 4 canales del latente de la imagen enmascarada; adicionalmente recibe `timestep[1]` y `encoder_hidden_states[1,77,768]` procedentes del text encoder CLIP. El VAE funciona de forma simetrica: un encoder que toma `image[1,3,512,512]` en rango [-1,1] y devuelve la media posterior `[1,4,64,64]`, y un decoder que reconstruye la imagen a partir del latente.

No ha habido reentrenamiento ni fusion de pesos: el autor indica explicitamente que es una obra derivada de Uminosachi/realisticVisionV51_v51VAE-inpainting y que el trabajo se limita a exportacion, cuantizacion y compilacion. La compilacion se realizo con Qualcomm AI Hub y QAIRT 2.45. La calibracion w8a16, cuando se aplica, uso ejecuciones reales de las funciones Replace (mascaras de pincel) y Uncrop (bordes de outpainting), con el sampler DPM++ 2M Karras, 28 pasos y CFG 7.5. El text encoder, el tokenizer y el VAE de reserva en CPU provienen del build latentdivergence/realvis51-inpaint-int8-onnx.

## Capacidades

- Inpainting guiado por mascara (funcion Replace): rellena regiones marcadas con el pincel generando contenido coherente con el contexto y el prompt de texto.
- Outpainting o extension de lienzo (funcion Uncrop): completa bordes y amplia el encuadre de una imagen existente.
- Generacion de imagenes fotorrealistas a 512x512, heredada de Realistic Vision 5.1.
- Condicionamiento por prompt de texto en ingles a traves del text encoder CLIP (77 tokens).
- Ejecucion de los tres grafos principales (UNet, VAE encoder y VAE decoder) sobre la NPU Hexagon HTP v81.
- Inferencia en fp32 a nivel de interfaz: los grafos reciben y devuelven tensores fp32 aunque internamente operen en fp16.
- No soporta tool calling, function calling, uso agentico ni razonamiento multi-paso: es un modelo puramente de vision generativa.
- No tiene capacidades de lenguaje natural ni de audio; el unico texto que maneja es el prompt de condicionamiento.

## Casos de uso

- Edicion fotografica en el propio dispositivo: una app movil puede ejecutar el inpainting sin enviar la imagen a un servidor, ya que los grafos corren en la NPU del Snapdragon 8 Elite Gen 5, con ventajas de privacidad y latencia.
- Eliminacion de objetos no deseados: el usuario pinta una mascara sobre un objeto y el modelo lo sustituye por contenido coherente con el fondo, gracias al canal de mascara del UNet de 9 canales.
- Restauracion de fotografias antiguas: rellenar zonas danadas, rayadas o con perdida de informacion usando la funcion Replace como paso de retoque puntual.
- Reencuadre y ampliacion de lienzo: la funcion Uncrop permite adaptar una foto a otra relacion de aspecto (por ejemplo, de 1:1 a 16:9) generando los bordes que faltan.
- Retoque de retrato (por ejemplo, piel, ojos o pelo): el modelo base Realistic Vision 5.1 esta orientado a retrato fotorrealista, por lo que es adecuado para retoques localizados con mascara.
- Fotografia de producto para comercio electronico: sustituir fondos o limpiar imperfecciones en imagenes de catalogo a resolucion 512x512 antes de escalarlas.
- Virtual staging inmobiliario: rellenar o eliminar muebles en fotografias de interiores para mostrar variantes de decoracion de forma rapida.
- Prototipado rapido de edicion movil: sirve como referencia para equipos que quieran medir el rendimiento de inpainting SD 1.5 sobre NPU Qualcomm antes de portar sus propios pesos.

## Benchmarks y rendimiento

La model card proporciona tiempos de ejecucion medidos en Qualcomm AI Hub y la similitud coseno frente a fp32 en dispositivo real. Se reproduccion a continuacion tal cual.

| Grafo | Precision | AI Hub ms/run | Coseno vs fp32 (dispositivo real) |
|---|---|---|---|
| `unet/` (inpainting 9 canales, batch 1) | fp16 | 227,383 | 0,9999683925677956 |
| `vae_encoder_npu/` | fp16 | 78,228 | 0,9999961078030125 |
| `vae_decoder_npu/` | fp16 | 177,428 | 0,9999997925811965 |

No se han publicado resultados de benchmarks de calidad tipo FID, CLIP score, MMLU o HumanEval en la informacion disponible. Los unicos datos cuantitativos disponibles son los tiempos por pase y las similitudes coseno de la tabla anterior.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon HTP v81 del Qualcomm Snapdragon 8 Elite Gen 5. Los grafos estan compilados especificamente para ese objetivo y no son portables a otras NPU sin recompilar.
- Ejecucion en CPU: el repositorio referencia el build latentdivergence/realvis51-inpaint-int8-onnx, que aporta text encoder, tokenizer y un VAE de reserva para CPU.
- VRAM estimada: no disponible; al tratarse de inferencia en NPU movil, la restriccion relevante es la memoria del SoC, no la VRAM de una GPU de escritorio.
- GPU de escritorio: los grafos QNN EPContext no estan pensados para GPU NVIDIA ni AMD; para ese escenario habria que usar el modelo base o el build int8 ONNX generico.
- Cabe en GPU de consumo: no aplicable al paquete NPU; el modelo base SD 1.5 si caben en GPU de consumo, pero no es lo que distribuye este repositorio.
- Opciones de despliegue: ONNX Runtime con el execution provider QNN (Qualcomm AI Engine Direct) para los grafos NPU; ONNX Runtime en CPU como alternativa para el build int8.
- Latencia estimada: sumando los tres grafos, aproximadamente 483 ms por pase completo de VAE encoder mas UNet mas VAE decoder. Para una generacion de 28 pasos con el UNet en bucle, el coste dominante seria del orden de 6,4 s solo en el UNet, mas los pases de VAE; esta cifra es una estimacion derivada de los tiempos publicados, no un dato medido del pipeline completo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentdivergence/realvis51-inpaint-npu-8elitegen5 | Grafos ONNX QNN para NPU movil | 512x512 | 77 tokens | CreativeML OpenRAIL-M | HuggingFace (0 descargas) |
| Uminosachi/realisticVisionV51_v51VAE-inpainting | Modelo base SD 1.5 inpainting | 512x512 | 77 tokens | CreativeML OpenRAIL-M | HuggingFace (modelo de origen) |
| latentdivergence/realvis51-inpaint-int8-onnx | Build ONNX int8 para CPU | 512x512 | 77 tokens | CreativeML OpenRAIL-M | HuggingFace |
| Realistic Vision V5.1 inpainting (variantes en Civitai/Replicate) | Modelo SD 1.5 inpainting en difusion | 512x512 | 77 tokens | CreativeML OpenRAIL-M | Civitai, Replicate, ModelsLab |

La diferencia clave frente al resto no esta en la calidad de generacion, sino en el empaquetado: los demas son pesos para bibliotecas de difusion generales, mientras que este repositorio son grafos ya compilados para una NPU concreta. La comparacion de rendimiento entre ellos en terminos de calidad de imagen no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Realistic Vision 5.1, hereda los sesgos del dataset de entrenamiento original (LAION y similares).
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente en zonas grandes enmascaradas o cuando la mascara carece de contexto suficiente.
- Limitacion de resolucion: la inferencia esta fijada a 512x512; no hay soporte nativo para resoluciones mayores sin escalado externo.
- Limitacion de idioma: el text encoder CLIP esta entrenado fundamentalmente en ingles, por lo que los prompts en otros idiomas pueden degradar el resultado.
- Restricciones de licencia: CreativeML OpenRAIL-M impone condiciones de uso, incluida la prohibicion de determinados usos daninos; conviene revisar el texto completo de la licencia antes de un despliegue comercial.
- Dependencia de hardware: los grafos estan compilados para HTP v81 (Snapdragon 8 Elite Gen 5). No funcionaran en otras NPU sin recompilar con QAIRT.
- Madurez: el repositorio no registra descargas ni likes y su fecha de creacion es muy reciente; carece de validacion por parte de la comunidad.
- Interfaz fp32 obligatoria: aunque el calculo interno sea fp16, el consumidor debe alimentar y leer tensores fp32, lo que implica conversiones y cierto coste de memoria.
- Sin soporte agentico: no sirve para tareas de razonamiento, codigo, tool calling ni texto generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latentdivergence/realvis51-inpaint-npu-8elitegen5
- Build int8 ONNX para CPU: https://huggingface.co/latentdivergence/realvis51-inpaint-int8-onnx
- README del build int8 ONNX: https://huggingface.co/latentdivergence/realvis51-inpaint-int8-onnx/blob/main/README.md
- Modelo base: https://huggingface.co/Uminosachi/realisticVisionV51_v51VAE-inpainting
- Realistic Vision V5.1 inpainting en Replicate: https://www.aimodels.fyi/models/replicate/realistic-vision-v5-inpainting-lucataco
- Realistic Vision V6.0 B1 / V5.1 inpainting en Civitai: https://civitai.com/models/4201?modelVersionId=130090
- Realistic Vision V5.1 inpainting en ModelsLab: https://modelslab.com/models/modelslab/realistic-inpaint
