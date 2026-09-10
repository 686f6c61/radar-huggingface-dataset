# matrixportalx/epiCRealism_NaturalSin

## Resumen

epiCRealism_NaturalSin es un modelo de generacion de imagenes texto-a-imagen derivado de Stable Diffusion 1.5, concretamente un ajuste fino del checkpoint fotografico epiCRealism, publicado por el usuario matrixportalx. Su particularidad no es la calidad artistica ni un nuevo entrenamiento, sino el formato de despliegue: el UNet se ha convertido a un context binary de Qualcomm QNN (version qnn2.28) para ejecutarse en la NPU Hexagon (HTP v73) de determinados SoC Snapdragon, mientras que el text encoder y el VAE se mantienen en formato MNN para CPU/GPU. El objetivo es la inferencia 100 % local en movil, sin conexion ni servidores.

El modelo esta pensado para la aplicacion Android Ruya / Local Dream, que permite importar checkpoints personalizados. El paquete se distribuye como un ZIP (`epiCRealism_NaturalSin_qnn2.28_8gen2.zip`) que se importa desde los ajustes de la app. La variante publicada corresponde al tier `8gen2`, compatible con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3, y usa activaciones de 16 bits en la NPU.

Es relevante ahora porque ejemplifica una tendencia concreta: llevar difusion de imagenes a hardware de consumo sin GPU dedicada, reutilizando la NPU del telefono. Frente a soluciones en la nube, elimina costes por inferencia y los problemas de privacidad de enviar prompts e imagenes a terceros. El repositorio ocupa 1,1 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes", por lo que se trata de una publicacion reciente y practicamente sin adopcion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet + VAE + text encoder CLIP ViT-L/14 (difusion latente, base Stable Diffusion 1.5) |
| Parametros totales | No especificado en la model card; la arquitectura SD 1.5 implica aproximadamente 860 M en el UNet, 123 M en el text encoder y 84 M en el VAE (en torno a 1,07 G en total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificado; el text encoder de SD 1.5 limita el prompt a 77 tokens CLIP |
| Tipos de cuantizacion | UNet en QNN context binary con activaciones de 16 bits en HTP; text encoder y VAE en MNN (precision concreta no especificada) |
| Idiomas soportados | No disponible; el text encoder CLIP de SD 1.5 esta entrenado predominantemente en ingles |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | QNN context binary (UNet) y MNN (text encoder y VAE), empaquetados en un ZIP |
| Base | Stable Diffusion 1.5, ajuste fino epiCRealism (variante NaturalSin) |
| Runtime | qnn2.28, tier 8gen2, HTP v73 |
| Resoluciones soportadas | 512x512, 768x512, 512x768, 768x768, 1024x768, 768x1024, 1024x1024 |
| Tarea | Text-to-image |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion) y misma fecha (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un autoencoder variacional que comprime la imagen a un espacio latente de 4 canales, un UNet con bloques residuales y atencion cruzada que aplica el ruido inverso en ese espacio latente, y un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings de condicionamiento. El pipeline completo es de difusion latente con muestreo DDIM/PLMS en la implementacion original. El tag `sd1.5` y la referencia explicita de la model card confirman que la resolucion nativa de entrenamiento es 512x512, aunque el paquete publicado declara soporte hasta 1024x1024, lo que en SD 1.5 suele producir duplicaciones de sujetos si no se aplican tecnicas adicionales.

La innovacion tecnica no esta en el entrenamiento sino en el pipeline de conversion: el UNet se compila a un context binary de QNN 2.28 y se ejecuta en la NPU Hexagon con HTP v73 y activaciones de 16 bits, mientras que el text encoder y el VAE quedan en MNN sobre CPU/GPU. Este reparto es habitual porque el UNet concentra la mayor parte del coste computacional y se beneficia de la NPU, mientras que los otros dos componentes son mas ligeros y problematicos de cuantizar sin degradar la calidad. El autor mantiene un repositorio publico de conversion (`Sd-1.5-Converting-to-Qualcomm-QNN-Model`) del que procede este paquete.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens, si hubo RLHF, DPO o fine-tuning con preferencias humanas, ni sobre que diferencia concreta introduce la variante NaturalSin respecto al epiCRealism original. Tampoco se documenta el proceso de calibracion usado para la conversion a 16 bits ni si se aplicaron tecnicas de cuantizacion consciente del entrenamiento.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de un prompt de texto, heredadas del checkpoint epiCRealism.
- Soporte de multiples relaciones de aspecto y resoluciones: desde 512x512 hasta 1024x1024, incluyendo formatos verticales y horizontales.
- Inferencia completamente local y offline en el dispositivo, sin llamadas a API externas.
- Ejecucion acelerada por NPU: el UNet corre en el Hexagon Tensor Processor de los Snapdragon compatibles.
- Integracion con la app Ruya / Local Dream mediante importacion de modelo personalizado.
- Ajuste de prompt con pesos de atencion y prompt negativo, segun las capacidades estandar heredadas de SD 1.5.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de vision ni de audio: la unica entrada es texto y la unica salida es imagen.

## Casos de uso

- Generacion de imagenes privadas en el dispositivo: el modelo se ejecuta en la NPU del telefono, de modo que los prompts y las imagenes generadas nunca salen del terminal; es adecuado para material sensible donde la politica de privacidad impide usar servicios en la nube.
- Aplicaciones Android con generacion de imagenes integrada: un desarrollador puede empaquetar el ZIP como recurso y ofrecer generacion offline dentro de su propia app sin asumir costes por token ni depender de conectividad.
- Edicion y creacion en entornos sin red: util en aviones, zonas rurales o instalaciones aisladas donde no hay conexion estable y se necesita generar material visual sobre la marcha.
- Prototipado rapido de conceptos visuales: para disenadores que necesitan explorar variaciones de estilo fotorrealista antes de encargar un render de alta calidad, con resoluciones de 512x512 a 768x768 que bastan para bocetos.
- Generacion de material para redes sociales y marketing: creacion de imagenes verticales (512x768, 768x1024) listas para formatos de historia o reel, sin salir del movil.
- Storyboard y previsualizacion audiovisual: produccion de fotogramas de referencia con encuadres horizontales (768x512, 1024x768) para comunicar una idea de plano antes de rodar.
- Investigacion en inferencia en el borde: banco de pruebas para estudiar el comportamiento de un UNet de difusion cuantizado a 16 bits sobre NPU Hexagon, comparando calidad y latencia frente a la ejecucion en CPU/GPU.
- Demostraciones educativas de difusion latente: el modelo permite explicar el pipeline texto-a-imagen completo en un dispositivo de bolsillo, sin necesidad de laboratorio con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones esteticas ni comparaciones cuantitativas con otros checkpoints. Tampoco se documentan latencias por resolucion ni consumo energetico durante la inferencia en la NPU.

## Requisitos de hardware

- No requiere VRAM de GPU dedicada: la inferencia se ejecuta sobre el SoC, usando la memoria LPDDR compartida del telefono.
- SoC compatibles con la variante publicada (tier `8gen2`, HTP v73): Snapdragon 8 Gen 2, Snapdragon 8s Gen 3, Snapdragon 7+ Gen 2 y Snapdragon 7 Gen 3.
- En SoC con HTP de otra version no se garantiza la compatibilidad del context binary; seria necesario reconvertir el modelo con la toolchain adecuada.
- Espacio de almacenamiento: el paquete y el repositorio ocupan 1,1 GB, a lo que hay que sumar el espacio de la app y los pesos auxiliares importados.
- Memoria RAM necesaria para la inferencia: no disponible en la informacion proporcionada.
- Opciones de despliegue: aplicacion Ruya / Local Dream en Android, con importacion del ZIP desde Ajustes > Import Custom Model. El UNet se ejecuta en la NPU via QNN 2.28 y el text encoder y el VAE via MNN en CPU/GPU.
- No es desplegable en vLLM, TGI, llama.cpp u Ollama, ya que estas herramientas estan orientadas a modelos de lenguaje, no a difusion, y ninguna consume context binaries de QNN.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Licencia | Formato / despliegue | Observaciones |
|---|---|---|---|---|---|
| epiCRealism_NaturalSin (QNN) | No especificado; ~1,07 G por herencia de SD 1.5 | 512x512 (soporta hasta 1024x1024) | CreativeML Open RAIL-M | QNN context binary + MNN, app Android | Unico de la comparativa optimizado para NPU Hexagon |
| Stable Diffusion 1.5 base | ~860 M (UNet) + 123 M (text encoder) + 84 M (VAE) | 512x512 | CreativeML Open RAIL-M | safetensors, diffusers, ONNX | Referencia generica; no optimizado para movil ni para NPU |
| Stable Diffusion XL base 1.0 | ~2,6 G (UNet) + 817 M (text encoders) + 84 M (VAE) | 1024x1024 | CreativeML Open RAIL++-M | safetensors, diffusers | Mayor calidad y resolucion, pero inviable en NPU de telefono con este enfoque |

Los datos de parametros y resolucion de Stable Diffusion 1.5 y SDXL proceden del conocimiento publico de esos modelos base y no estan verificados en la informacion proporcionada; se incluyen unicamente como referencia de categoria. No se han encontrado comparativas publicadas que midan este checkpoint frente a otros en las mismas condiciones de hardware.

## Limitaciones y advertencias

- No hay ningun dato publicado sobre sesgos del checkpoint; al derivar de SD 1.5 y de epiCRealism, hereda los sesgos de representacion y de estilo de los datasets de entrenamiento originales (LAION y similares).
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, ojos), texto ilegible y objetos incoherentes, especialmente en resoluciones altas no nativas.
- Prompt limitado a 77 tokens CLIP: descripciones largas se truncan, lo que puede provocar que se ignore parte de la instruccion.
- Soporte idiomatico no documentado: el text encoder de SD 1.5 rinde claramente peor con prompts en castellano que en ingles; se recomienda escribir los prompts en ingles.
- Resoluciones declaradas por encima de 512x512 sin garantia de calidad: en SD 1.5, generar a 1024x1024 suele producir duplicacion de sujetos si no se aplican tecnicas adicionales; el ZIP no documenta si se incluye algun mecanismo de mitigacion.
- Compatibilidad restringida: el paquete solo funciona en SoC con HTP v73 de la lista (8 Gen 2, 8s Gen 3, 7+ Gen 2, 7 Gen 3). En cualquier otro Snapdragon o en un dispositivo no Snapdragon no funcionara.
- Licencia CreativeML Open RAIL-M: permite uso comercial, pero impone restricciones de uso descritas en la propia licencia (prohibicion de aplicaciones daninas, de desinformacion medica, de difamacion, etc.) y obliga a propagar las mismas restricciones a los derivados. Es responsabilidad del integrador revisar las clausulas de uso antes de desplegar en produccion.
- Trazabilidad limitada: la model card no documenta el dataset de entrenamiento ni el proceso de fine-tuning, por lo que no se puede auditar el origen de los datos ni el cumplimiento de derechos de autor de las imagenes generadas.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni validacion independiente por parte de la comunidad; conviene tratar la calidad declarada como no verificada.
- Sin benchmarks ni mediciones de latencia, no es posible estimar el rendimiento real en produccion sin probarlo en el dispositivo objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matrixportalx/epiCRealism_NaturalSin
- Repositorio de conversion de SD 1.5 a Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes para este modelo (unicamente paginas corporativas de Microsoft), por lo que no se listan.
- No se dispone de enlaces a paper, blog tecnico, demo o model card ampliada en la informacion proporcionada.
