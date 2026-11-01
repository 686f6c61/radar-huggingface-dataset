# lite-infer/flux-3-image-klein-nunchaku-lite-nvfp4-r32

## Resumen

FLUX.3 [klein] Nunchaku Lite NVFP4 r32 es una versión cuantizada del modelo de edición y generación de imágenes `black-forest-labs/flux-3-image-klein`, publicada por el usuario `lite-infer`. El modelo conserva la arquitectura original (transformer de difusión con text encoder Qwen3-VL y VAE) pero comprime el transformer a NVFP4 W4A4 mediante SVDQuant con rango 32 y GPTQ, y serializa el text encoder en NF4 de BitsAndBytes con cómputo en BF16. El resultado es un checkpoint de aproximadamente 3.323 millones de parámetros y 7,1 GB de repositorio, pensado para inferencia de imagen a imagen y texto a imagen en GPUs Blackwell.

La relevancia de esta ficha radica en que es una de las primeras builds que combina NVFP4 con SVDQuant para un modelo de difusión de gran tamaño, permitiendo ejecutar un pipeline Flux 3 en hardware consumer de última generación con una degradación medida frente a BF16 (LPIPS 0,1244 y PSNR 22,98 dB sobre 20 casos). Es un modelo destilado en pasos: 16 pasos de inferencia sin classifier-free guidance, lo que reduce el coste computacional por imagen de forma notable.

El modelo está liberado bajo la licencia comunitaria de FLUX (`flux-kommunity-license`), no es de código abierto pleno, y requiere GPU NVIDIA Blackwell o superior para la ruta NVFP4; en arquitecturas Hopper no es compatible y en Turing a Ada debe usarse la build INT4. La librería de referencia es Diffusers 0.42.1 con el cargador `Flux3DistilledAutoBlocks`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Flux 3) con text encoder Qwen3-VL y VAE; transformer cuantizado NVFP4 W4A4 con SVDQuant rango 32 y GPTQ |
| Parametros totales | 3.323.525.122 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (transformer, SVDQuant r32 + GPTQ); NF4 serializado con computo BF16 y sin doble cuantizacion (text encoder Qwen3-VL); existe build INT4 alternativa para Turing-Ada |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `black-forest-labs/flux-3-image-klein` (revision `337337621b8526e120f2275d250242f4a6bedd75`). La arquitectura subyacente es un transformer de difusion Flux 3 con un text encoder Qwen3-VL y un VAE que se mantienen en su forma original (el VAE, el scheduler y los procesadores no se cuantizan). Sobre el transformer se aplica SVDQuant en formato NVFP4 con pesos y activaciones a 4 bits (W4A4), rango 32 y calibracion GPTQ; el text encoder se serializa en NF4 de BitsAndBytes manteniendo el computo en BF16 y sin doble cuantizacion. El pipeline se expone mediante `Flux3DistilledAutoBlocks` en Diffusers.

Se trata de la variante destilada en pasos del modelo base: 16 pasos de inferencia y sin classifier-free guidance. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original; la model card solo documenta el proceso de cuantizacion y la evaluacion comparativa frente a BF16. La innovacion tecnica destacable es la combinacion de SVDQuant con NVFP4 para reducir el coste de memoria y computo del transformer manteniendo la fidelidad perceptual, con una comparativa publicada de 20 casos (10 texto a imagen y 10 ediciones) frente a las salidas BF16.

## Capacidades

- Generacion de texto a imagen: sintesis de imagenes a 1024x1024 (y geometrias como 832x1248) con 16 pasos de inferencia y sin CFG.
- Edicion de imagen (image-to-image): modificacion de imagenes de entrada pasando `image=[Image.open(...).convert("RGB")]` al pipeline, con preservacion de geometria y contenido segun el prompt.
- Edicion basada en instrucciones textuales: cambios localizados como rotular texto en un cartel o recolocar un producto manteniendo forma, etiqueta y detalles.
- Generacion de tipografia y texto en imagen: los ejemplos de la model card incluyen posters con texto legible ("MIDNIGHT ECHOES", "THE COPPER KETTLE").
- Fotorrealismo y texturas: retratos con textura de piel realista, iluminacion natural y escenas de calle con sombras y materiales.
- Integracion con prompt upsampler opcional: se puede cargar `black-forest-labs/flux-3-image-klein-pup` como paso adicional, aunque no viene incluido ni se uso en la calibracion.
- No se documentan capacidades de tool calling, agentes, audio, video ni modos de razonamiento explicito.

## Casos de uso

- Edicion de producto para e-commerce: a partir de una foto de un envase, el modelo puede recolocarlo en un entorno nuevo (mesa de madera, luz natural, objetos de atrezo) manteniendo la forma, el tapon dorado y todo el texto de la etiqueta, como demuestra el caso `product_1` de la model card. Es adecuado porque el pipeline image-to-image preserva la identidad del objeto con 16 pasos.
- Generacion de creatividades publicitarias: produccion de posters y piezas graficas con tipografia integrada (por ejemplo, un poster minimalista con texto condensado en blanco) a 1024x1024, util para iterar variantes con semillas fijas.
- Rotulacion y retoque de imagenes existentes: anadir o modificar texto sobre superficies fisicas (carteles de madera, senalizacion) mediante edicion guiada por prompt, aprovechando la capacidad de mantener el soporte original.
- Ilustracion editorial y conceptual: generacion de escenas estilizadas (acuarela, risograph, fotografia de viaje) para acompanar articulos, con control de semilla para reproducibilidad.
- Prototipado rapido en estudios de diseno: iteracion de conceptos visuales en local sobre GPU Blackwell, con un checkpoint de 7,1 GB que reduce los requisitos de VRAM frente a BF16.
- Aumento de datos sinteticos para vision por computador: generacion de variaciones controladas de imagenes (fondos, iluminacion, composicion) manteniendo la geometria, util para ampliar datasets de entrenamiento.
- Restauracion o adaptacion de fotografia de producto: recomposicion de una imagen existente en un contexto nuevo sin rehacer el sujeto, gracias a la ruta de edicion image-to-image.

## Benchmarks y rendimiento

La model card publica una comparativa de fidelidad frente a las salidas BF16 sobre 20 casos (10 texto a imagen y 10 ediciones), con metricas LPIPS (AlexNet v0.1) y PSNR RGB a resolucion completa:

| Pipeline final | Casos | LPIPS (menor mejor) | PSNR dB (mayor mejor) |
|---|---|---|---|
| NVFP4 + NF4 | todos (20) | 0,1244 | 22,98 |
| NVFP4 + NF4 | texto a imagen (10) | 0,1647 | 20,60 |
| NVFP4 + NF4 | edicion (10) | 0,0842 | 25,36 |
| INT4 + NF4 | todos (20) | 0,1744 | 20,98 |
| INT4 + NF4 | texto a imagen (10) | 0,2147 | 19,17 |
| INT4 + NF4 | edicion (10) | 0,1342 | 22,79 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo generativo de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 7,1 GB en safetensors y el transformer va en NVFP4 W4A4, por lo que el peso en memoria es sustancialmente menor que el checkpoint BF16, pero la VRAM total depende del text encoder NF4, el VAE y las activaciones a 1024x1024.
- GPU recomendadas: NVIDIA Blackwell o superior para la ruta NVFP4. Hopper no es compatible con NVFP4 segun la model card.
- GPUs consumer: en arquitecturas Turing a Ada debe usarse la build INT4 en lugar de esta NVFP4; no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: Diffusers 0.42.1 con `Flux3DistilledAutoBlocks`, PyTorch 2.11.0, CUDA 12.8, Transformers 5.19.0, BitsAndBytes 0.50.2 y el paquete `kernels`, con la variable `DIFFUSERS_TRUST_REMOTE_KERNELS=true`. No se documentan rutas vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este formato).
- Latencia y throughput: no disponibles; solo se indica que el modelo es destilado a 16 pasos sin CFG.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lite-infer/flux-3-image-klein-nunchaku-lite-nvfp4-r32 | 3.323.525.122 | no disponible | NVFP4 W4A4 + NF4 | flux-kommunity-license | HuggingFace, diffusers |
| black-forest-labs/flux-3-image-klein (BF16) | no disponible | no disponible | BF16 | flux-kommunity-license | HuggingFace, diffusers |
| Build INT4 + NF4 del mismo autor | no disponible | no disponible | INT4 + NF4 | flux-kommunity-license | HuggingFace (referenciada en la model card) |

La comparativa cuantitativa disponible se limita a las metricas LPIPS/PSNR frente a BF16 y frente a la build INT4, ya presentadas en la seccion de benchmarks. No se dispone de datos de otros modelos de difusion comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `flux-kommunity-license`: no es una licencia de codigo abierto plena; existen restricciones para uso comercial que deben revisarse en `LICENSE.md` antes de desplegar en produccion.
- Compatibilidad de hardware restringida: NVFP4 requiere GPU NVIDIA Blackwell o superior; Hopper no esta soportado y en Turing-Ada hay que usar la build INT4.
- Perdida de fidelidad frente a BF16: LPIPS de 0,1244 y PSNR de 22,98 dB en el conjunto completo, con mayor degradacion en texto a imagen (LPIPS 0,1647) que en edicion (0,0842).
- Dependencia de versiones concretas: PyTorch 2.11.0, CUDA 12.8, Diffusers 0.42.1, Transformers 5.19.0 y BitsAndBytes 0.50.2; otras combinaciones pueden fallar.
- El prompt upsampler no viene incluido y no se uso en la calibracion ni en las comparativas; su incorporacion requiere cargar un checkpoint adicional.
- Riesgo de alucinacion visual y de texto: como modelo generativo, puede producir tipografia incorrecta o detalles inconsistentes, especialmente en escenas complejas.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento.
- Idiomas soportados: no disponibles; el text encoder Qwen3-VL sugiere capacidad multilingue, pero no se documenta oficialmente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lite-infer/flux-3-image-klein-nunchaku-lite-nvfp4-r32
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/337337621b8526e120f2275d250242f4a6bedd75
- Prompt upsampler opcional: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Licencia: LICENSE.md (incluido en el repositorio del modelo)
