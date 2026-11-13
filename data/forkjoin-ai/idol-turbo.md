# forkjoin-ai/idol-turbo

## Resumen

Idol Turbo es un paquete de reconstruccion 3D a partir de una sola imagen (image-to-3D) que empaqueta el pipeline Speri Labs Idol junto con la destilacion phase-LoRA Idol Turbo, que reduce la generacion a 5 pasos sin classifier-free guidance. El modelo subyacente transforma una fotografia en un conjunto de Gaussianas 3D (3D Gaussian Splatting) exportable como PLY, combinando un denoiser de difusion, un decodificador de octree y un decodificador especifico de Gaussianas, mas un segmentador BiRefNet y un VAE FLUX.2. El autor de este repositorio es forkjoin-ai, que lo publica como paquete "structural-admitted" para su malla Forkjoin/Edgework.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de reconstruccion 3D de una sola imagen con un pipeline completo y pesos en safetensors. Por otro, y de forma igualmente importante, expone un caso de empaquetado con admision estructural: el autor verifica que el artefacto PLY es formalmente correcto (valores finitos, cuaterniones unitarios, escalas acotadas) pero declara explicitamente que no reclama calidad visual, fidelidad al prompt ni reconocibilidad del objeto, porque no existe un renderizador ni un oraculo de reconocimiento en su runtime.

El repositorio ocupa 6,8 GB e incluye un contenedor KNOT v1 de 3,64 GB que es unicamente un archivo, no un modelo ejecutable. La licencia es Apache-2.0, heredada de los pesos base de Speri Labs. No se dispone de informacion sobre idiomas soportados ni sobre parametros totales del conjunto, ya que el modelo se distribuye como varios componentes separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para image-to-3D con denoiser transformer (24 bloques, T=8192), decodificador de octree y decodificador de Gaussianas; encoder DINOv3 ViT-H+/16 y VAE FLUX.2 |
| Parametros totales | no disponible (distribuido en varios safetensors; el denoiser solo pesa 1.482.258.308 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de una sola imagen) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; el SDK fija `torch.float16` por defecto) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`denoiser`, `decoder`, `decoder_gs`, `birefnet`, `idol_turbo_lora`), mas contenedor KNOT v1 (`idol-turbo.knot`) y salida PLY |

## Arquitectura y entrenamiento

El pipeline es una cadena de componentes diferenciados. La imagen de entrada pasa por un encoder DINOv3 ViT-H+/16 (via el puerto publico `timm/vit_huge_plus_patch16_dinov3.lvd1689m`) y por un segmentador BiRefNet que aisla el objeto. Un denoiser de difusion de 24 bloques con dimension interna T=8192 genera el latente, que despues se decodifica en dos etapas: un decodificador de octree y un decodificador de Gaussianas (`decoder_gs`) que produce los parametros de cada Gaussiana (posicion, rotacion como cuaternion, escala logaritmica y opacidad). El VAE procede de FLUX.2 (`kaiyuyue/FLUX.2-dev-vae`).

La innovacion principal es el destilado phase-LoRA Idol Turbo (`idol_turbo_lora.safetensors`, 117 MB), que comprime la generacion a 5 pasos con `cfg_strength=0.0`, es decir, sin classifier-free guidance. Esto reduce el coste de inferencia de forma sustancial frente al pipeline base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; la model card solo indica que los pesos base y el destilado turbo son Apache-2.0 de Speri Labs.

## Capacidades

- Generacion de un splat 3D de Gaussianas a partir de una unica imagen, con exportacion a PLY binario little-endian de 68 bytes por Gaussiana.
- Generacion en 5 pasos sin guidance (`steps=5`, `cfg_strength=0.0`) gracias al destilado turbo.
- Segmentacion del objeto de entrada mediante BiRefNet, lo que permite trabajar con fotografias no recortadas.
- Modo `real` en el pipeline upstream (segun el ejemplo de uso de la model card).
- Verificacion estructural del artefacto: comprobacion de valores finitos, cuaterniones unitarios (norma entre 0,9999998 y 1,0000002), escalas logaritmicas acotadas y coordenadas xyz distintas.
- Soporte de ejecucion por pasos aislados (`prepare` / `step` / `decode`) con checkpoint del latente (512 KiB en fp32), pensado para contenedores con limite de 900 s por peticion.
- No se declaran capacidades de texto, codigo, matematicas, tool calling, agentes, vision general ni audio; el modelo es exclusivamente image-to-3D.

## Casos de uso

- Prototipado de assets 3D para videojuegos y realidad aumentada: a partir de una fotografia de un objeto se obtiene un PLY de Gaussianas que puede visualizarse en visores 3DGS; el pipeline de 5 pasos abarata la iteracion sobre muchas imagenes.
- Catalogacion y digitalizacion de producto: con BiRefNet aislando el objeto y el denoiser generando la geometria, se puede convertir el catalogo fotografico de un comercio en representaciones 3D navegables.
- Generacion de escenas para e-commerce con visor web: el PLY resultante se sirve desde almacenamiento de objetos (R2 en el caso del autor) y se renderiza en cliente, sin ejecutar el modelo en el navegador.
- Investigacion en reconstruccion 3D de una sola vista: el paquete incluye `probe_splat.py` y un recibo estructural, lo que permite validar formalmente los artefactos generados en experimentos comparativos.
- Despliegue serverless por pasos: el esquema `prepare` / `step` / `decode` encaja en contenedores con tiempo maximo de ejecucion, de modo que se puede trocear la inferencia en peticiones encadenadas con el latente como estado intermedio.
- Pruebas de integridad en pipelines de datos 3D: el recibo `monster-guard.modality-receipt/v1` sirve como puerta de validacion automatica antes de admitir un PLY en un almacen o en un pipeline de entrenamiento posterior.
- Educacion y demostraciones de Gaussian Splatting: el modelo permite generar un splat real en hardware modesto (el autor lo ejecuto en CPU) para clases o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones del productor en hardware concreto:

| Medicion | Valor |
|---|---|
| Dispositivo | 1x Xeon E5530 (2009, sin AVX), 8 hilos, 31 GB RAM, solo CPU |
| Un paso de denoising (24 bloques, T=8192) | 328,5 s (37,7 GFLOPS efectivos) |
| Extremo a extremo, 1 paso, 32.768 Gaussianas | 636,3 s |
| Tamano del PLY | 2.228.639 B (68 B/Gaussiana + 415 B de cabecera) |
| Prediccion turbo (5 pasos), mismo equipo | ~32,5 min |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Los pesos suman aproximadamente 3,2 GB en safetensors (denoiser 1,48 GB, decoder_gs 0,95 GB, birefnet 0,44 GB, decoder 0,20 GB, LoRA 0,12 GB), mas el VAE FLUX.2 y el encoder DINOv3 ViT-H+/16, que no se incluyen en el repositorio y deben obtenerse aparte.
- GPU recomendadas: no disponible. El autor ejecuto el pipeline solo en CPU (Xeon E5530), sin GPU.
- Cabe en GPU de consumo: no confirmado; por el tamano de los pesos es plausible en GPUs con 16-24 GB de VRAM una vez cargados el VAE y el encoder, pero no hay medicion publicada.
- Opciones de despliegue: SDK `idol` (`IdolPipeline.from_pretrained`), ejecucion por pasos aislados en contenedores Cloudflare (`standard-4`, limite de 900 s), y el runner `apps/aeon-puppet-idol-cf/runner` del repositorio Edgework. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 328,5 s por paso de denoising en CPU Xeon E5530; 636,3 s extremo a extremo con 1 paso. No hay datos de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, el propio repositorio se define frente a su modelo base:

| Modelo | Tipo | Pasos de generacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| idol-turbo (este repo, empaquetado forkjoin-ai) | Image-to-3D, 3DGS | 5 (sin CFG) | Apache-2.0 | Hugging Face, 0 descargas |
| speridlabs/idol | Image-to-3D, 3DGS | no disponible | Apache-2.0 | Hugging Face (modelo base) |
| speridlabs/idol-turbo | Image-to-3D, 3DGS | 5 (sin CFG) | Apache-2.0 | Hugging Face (origen del destilado) |

No se identifican en la informacion disponible alternativas externas comparables con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Admision unicamente estructural: no hay admision de tier visible ni renderizador 3DGS ni oraculo de reconocibilidad. El autor rechaza por construccion cualquier afirmacion de calidad visual.
- La muestra incluida (`sample/armchair.ply`) es un sondeo de 1 paso con `cfg=0`; sirve para probar la puerta estructural y la ruta del artefacto, no como referencia de calidad.
- El contenedor `idol-turbo.knot` (3,64 GB, 2.138 tensores) es un archivo, no un modelo cargable: el runtime soberano no tiene pipeline Idol, por lo que no es ejecutable. Cargarlo como modelo seria una afirmacion que el runtime no puede cumplir.
- El encoder DINOv3 y el VAE FLUX.2 proceden de espejos publicos, no de los repositorios oficiales con acceso restringido de Meta y BFL; la paridad del encoder frente a los originales no esta verificada.
- El SDK fija `self.dtype = torch.float16` de forma codificada; el autor tuvo que sobrescribirlo a fp32 para ejecutar en CPU, lo que indica una rigidez de configuracion que puede complicar despliegues no estandar.
- Riesgo de alucinacion geometrica: al ser un modelo generativo de una sola vista, puede inventar geometria en las caras no visibles del objeto; no hay metrica publicada de fidelidad.
- Sesgos: no se documentan sesgos conocidos, pero al depender de DINOv3 y FLUX.2 hereda los sesgos de sus datos de entrenamiento, no evaluados en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes externos (DINOv3, FLUX.2 VAE, BiRefNet) por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- No se dispone de informacion sobre idiomas soportados ni sobre el numero de parametros totales del conjunto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/forkjoin-ai/idol-turbo
- Modelo base: https://huggingface.co/speridlabs/idol
- Destilado turbo original: https://huggingface.co/speridlabs/idol-turbo
- Puerto publico de DINOv3 ViT-H+/16: https://huggingface.co/timm/vit_huge_plus_patch16_dinov3.lvd1689m
- VAE FLUX.2: https://huggingface.co/kaiyuyue/FLUX.2-dev-vae
- Repositorio Edgework (runner): `apps/aeon-puppet-idol-cf/runner` (sin URL publica en la informacion disponible)
- Repositorios oficiales con acceso restringido mencionados: `facebook/dinov3-vith16plus` y `black-forest-labs/FLUX.2-dev` (sin URL verificada en la informacion disponible)
