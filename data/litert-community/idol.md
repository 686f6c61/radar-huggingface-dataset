# litert-community/Idol

## Resumen

Idol es un modelo de reconstruccion 3D a partir de una sola imagen (image-to-3D) que genera una representacion de Gaussian splatting con 262.144 gaussianas tridimensionales. El modelo original lo desarrolla speridlabs, y esta ficha corresponde a la conversion realizada por la comunidad litert-community para su ejecucion en dispositivo (on-device) mediante LiteRT, el runtime de Google para inferencia en Android y otras plataformas. La relevancia de esta version radica en que traslada un pipeline generativo 3D completo a un telefono movil, sin depender de servidores externos.

Tecnicamente, el repositorio empaqueta en formato LiteRT (TFLite) los distintos componentes del pipeline: el denoiser del modelo base con el LoRA idol-turbo (5 pasos, sin guidance), los decodificadores de octree y de gaussianas, el encoder VAE de FLUX.2 y el removedor de fondo BiRefNet. El encoder de imagen DINOv3 se distribuye aparte, en un repositorio con acceso restringido bajo su propia licencia. El resultado es un conjunto de grafos que, combinados, permiten convertir una foto de un objeto en un splat 3D navegable, incluyendo las caras que la imagen original no mostraba.

El modelo esta pensado para inferencia local en GPU movil en precision fp16 con acumulacion fp32. En un Galaxy S26, el ejemplo de Android del repositorio completa el pipeline completo (foto a fichero .ply) en 303 segundos partiendo de un telefono frio, con un pico de memoria GPU de 5,60 GiB. La licencia es Apache 2.0 para esta conversion, aunque el encoder DINOv3 queda sujeto a su propia licencia separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline generativo de difusion (denoiser con LoRA idol-turbo) + decodificadores de octree y gaussianas; encoder VAE FLUX.2; encoder de imagen DINOv3; segmentacion BiRefNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D) |
| Tipos de cuantizacion | Grafos LiteRT en fp16 con acumulacion fp32 (GPU); fp32 en CPU para BiRefNet |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (encoder DINOv3 bajo licencia separada y con acceso restringido) |
| Formato de pesos | LiteRT / TFLite (grafos para `CompiledModel`) |
| Salida | Gaussian splat de 262.144 gaussianas, exportable a .ply |
| Tamano del repositorio | 3,9 GB |
| Runtime | LiteRT 2.3.0 |
| Plataforma objetivo | Android (GPU movil), con verificacion tambien en Mac (Metal) |

## Arquitectura y entrenamiento

El pipeline es una cadena de redes independientes empaquetadas como grafos LiteRT. La entrada es una foto; BiRefNet elimina el fondo en CPU, DINOv3 extrae caracteristicas de imagen, el VAE de FLUX.2 codifica a tokens latentes, y el denoiser (modelo base de speridlabs con el LoRA idol-turbo, configurado a 5 pasos sin guidance) genera la representacion latente. A continuacion, un decodificador de octree de 8 niveles produce la estructura espacial y un decodificador de gaussianas genera los atributos de cada gaussiana (posicion xyz, color f_dc, escala, rotacion y opacidad). Finalmente, la app escribe un fichero .ply.

El modelo original emplea una arquitectura de difusion para la generacion 3D, aunque la informacion disponible no detalla el numero de parametros, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO. La innovacion tecnica principal de esta version es la conversion a LiteRT mediante litert-torch y la gestion de memoria en dispositivo: los grafos no caben todos simultaneamente en la memoria del telefono, por lo que la app los cierra y recompila al volver a ellos (unas 115 compilaciones por foto). La fidelidad numerica respecto al pipeline PyTorch original del autor se verifico con similitud coseno por componente (umbral 0,99) y PSNR de renderizado (umbral 25 dB), con resultados que superan ampliamente ambos umbrales en Mac, Galaxy S26 y Pixel 11 Pro.

## Capacidades

- Generacion de objetos 3D (Gaussian splatting) a partir de una unica fotografia.
- Inferencia completamente on-device en telefono movil, sin conexion a servidor.
- Generacion de las caras no visibles del objeto: el splat puede girarse para ver laterales y parte trasera.
- Eliminacion automatica de fondo de la imagen de entrada mediante BiRefNet.
- Exportacion del resultado a formato .ply (0,2 s en Galaxy S26).
- Ejecucion en GPU movil en fp16 con acumulacion fp32; BiRefNet en CPU.
- Verificacion de portabilidad a otras plataformas con GPU (Metal en Mac).
- No soporta tool calling, agentes ni capacidades de lenguaje; no es un modelo conversacional.

## Casos de uso

- Prototipado rapido de assets 3D en movil: un disenador fotografia un objeto fisico con el telefono y obtiene un splat 3D navegable en unos cinco minutos, sin estacion de trabajo ni servicio en la nube.
- Catalogacion de producto en comercio electronico: generar vistas 3D de articulos a partir de una sola foto de catalogo, permitiendo al comprador rotar el producto; el pipeline funciona offline y evita subir imagenes a terceros.
- Realidad aumentada y visualizacion: crear splats de objetos cotidianos para insertarlos en escenas AR, aprovechando que la inferencia ocurre en el propio dispositivo y no requiere conectividad.
- Aplicaciones de campo sin cobertura: tecnicos o investigadores que documentan objetos (piezas, especimenes, hallazgos) en entornos sin red pueden generar el modelo 3D in situ y exportarlo como .ply para su posterior procesado.
- Educacion y divulgacion: convertir fotografias de objetos en modelos 3D rotables para materiales didacticos, con un coste de infraestructura nulo al ejecutarse en hardware consumer.
- Investigacion en reconstruccion 3D on-device: servir de referencia reproducible (con verificacion numerica por componente frente al pipeline PyTorch) para estudiar el compromiso entre fidelidad y eficiencia en GPU movil.
- Preservacion digital ligera: capturar objetos con un unico disparo cuando no es posible un escaneo multivista, aceptando la reconstruccion inferida de las caras ocultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad 3D (PSNR/SSIM/LPIPS frente a datasets estandar) en la informacion disponible. Los datos publicados son de fidelidad frente al pipeline PyTorch del autor y de latencia en dispositivo.

Fidelidad por componente (similitud coseno frente al modelo del autor, umbral 0,99):

| Componente | Tensor comparado | Galaxy S26 | Pixel 11 Pro | Mac (Metal) |
|---|---|---|---|---|
| DINOv3 encoder | feature1 | 1,00000 | 0,99998 | 0,99989-0,99994 |
| VAE encoder | latent tokens | 0,99999 | 0,99999 | 0,99993-0,99996 |
| Denoiser (5 pasos) | latent velocity, peor paso | 0,99999 | 0,99989 | 0,99923-0,99931 |
| Octree decoder (8 niveles) | child probabilities, peor nivel | 0,99994 | 0,99970 | 0,99937-0,99946 |
| Gaussian decoder | xyz | 1,00000 | 1,00000 | 1,00000 |
| Gaussian decoder | color (f_dc) | 0,99997 | no disponible | 0,99963-0,99976 |
| Gaussian decoder | scale | 0,99990 | no disponible | 0,99652-0,99837 |
| Gaussian decoder | rotation | 0,99986 | no disponible | 0,99891-0,99915 |
| Gaussian decoder | opacity | 0,99993 | no disponible | 0,99871-0,99988 |

Latencia en Galaxy S26 (SM-S942Q), LiteRT 2.3.0, ejemplo de Android:

| Metrica | Telefono frio (1a foto) | Estado termico 2 (1a foto) | Foto 2 | Foto 3 |
|---|---|---|---|---|
| Foto a .ply escrito | 303 s | 339 s | 416 s | 414 s |
| Eliminacion de fondo (BiRefNet, CPU) | 11,1 s | 8,5 s | 17,7 s | 15,9 s |
| Encoder DINOv3 | 6,3 s | 8,8 s | 31,0 s | 26,7 s |
| Encoder VAE | 3,7 s | 5,4 s | 8,5 s | 7,3 s |
| Denoiser, 5 pasos | 228,4 s | 262,9 s | 306,9 s | 311,9 s |
| Decoder octree | 16,2 s | 16,0 s | 15,1 s | 15,3 s |
| Decoder de gaussianas | 36,0 s | 35,6 s | 35,7 s | 36,2 s |
| Escritura PLY | 0,2 s | 0,2 s | 0,1 s | 0,1 s |
| Grafos compilados por foto | 115 (70 s) | 115 (78 s) | 114 (97 s) | 116 (93 s) |
| Memoria residente pico (VmHWM) | 4,71 GiB | 4,91 GiB | 4,16 GiB | 4,09 GiB |
| Memoria GPU pico (kgsl) | 5,60 GiB | 5,60 GiB | 5,33 GiB | 5,45 GiB |

Nota de rendimiento termico: durante la primera foto el limite de reloj de la GPU cayo de 1.300 a 422 MHz en 5 minutos (estado termico 1 a 3), lo que explica la degradacion en fotos sucesivas.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Salida | Ejecucion | Licencia |
|---|---|---|---|---|---|
| Idol (LiteRT, esta ficha) | Difusion + octree + gaussianas | 1 foto | 262.144 gaussianas (.ply) | On-device, GPU movil | Apache 2.0 (DINOv3 aparte) |
| speridlabs/idol (original) | Mismo pipeline en PyTorch | 1 foto | Gaussian splat | Servidor/desktop, fp32 CPU o GPU | Segun modelo base |
| Modelos image-to-3D tipo LRM/ TripoSR | Transformer de reconstruccion | 1 foto | Malla o NeRF | Servidor/desktop | Variable |

La informacion disponible no incluye comparativas cuantitativas de calidad 3D frente a alternativas como TripoSR, LRM o el propio idol en PyTorch; los unicos datos de comparacion publicados son de fidelidad numerica frente al pipeline del autor. No se dispone de benchmarks de calidad objetiva para establecer una comparativa de rendimiento fiable con otros modelos de la categoria.

## Limitaciones y advertencias

- El encoder DINOv3 no esta incluido en este repositorio: reside en un repo separado con acceso restringido y licencia propia, lo que condiciona el uso comercial del pipeline completo.
- La latencia es alta para uso interactivo: 303 s en el mejor caso y hasta 449 s en fotos sucesivas con el telefono caliente.
- El rendimiento depende fuertemente del estado termico del dispositivo; el throttling de GPU degrada los tiempos de forma notable.
- Los grafos no caben simultaneamente en memoria: la app debe recompilarlos (unas 115 compilaciones por foto, 70-97 s), lo que anade latencia y complejidad de integracion.
- La reconstruccion de las caras no visibles es inferida por el modelo, no medida: puede generar geometria o textura plausibles pero incorrectas.
- Requiere hardware movil con GPU compatible con LiteRT y al menos unos 5,6 GiB de memoria GPU en el caso medido (Galaxy S26).
- El modelo esta validado en un numero reducido de dispositivos (Galaxy S26, Pixel 11 Pro, Mac con Metal); el comportamiento en otros SoC no esta documentado.
- No se dispone de informacion sobre sesgos del modelo base, composicion del dataset de entrenamiento ni evaluacion de robustez ante imagenes de entrada adversas o de baja calidad.
- Al ser un modelo de reconstruccion 3D, no ofrece capacidades de lenguaje, razonamiento textual, tool calling ni agentes.
- La licencia Apache 2.0 cubre esta conversion, pero el uso del pipeline completo queda sujeto a las condiciones del modelo base y del encoder DINOv3.

## Enlaces

- Repositorio Hugging Face (esta conversion): https://huggingface.co/litert-community/Idol
- Modelo base: https://huggingface.co/speridlabs/idol
- LoRA idol-turbo: https://huggingface.co/speridlabs/idol-turbo
- Encoder DINOv3 (acceso restringido): https://huggingface.co/litert-community/DINOv3-ViT-H16plus-Idol-LiteRT
- Imagen de ejemplo (Pexels, Komet Flicker): https://www.pexels.com/photo/plant-in-silver-flowerpot-20324601/
- LiteRT (runtime): no disponible en la informacion proporcionada
- litert-torch (herramienta de conversion): no disponible en la informacion proporcionada
