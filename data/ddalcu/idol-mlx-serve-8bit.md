# ddalcu/Idol-MLX-Serve-8bit

## Resumen

Idol-MLX-Serve-8bit es un empaquetado del modelo speridlabs/idol para su uso con mlx-serve, un servidor nativo para Apple Silicon escrito en Zig. El modelo resuelve la tarea de image-to-3D: a partir de una unica imagen de un objeto genera una representacion 3D, bien como malla GLB con discos texturizados, bien como nube de puntos Gaussian splatting mediante la extension `KHR_gaussian_splatting`. El empaquetado incluye todo lo necesario para la inferencia, de modo que no se descarga ningun componente adicional.

La relevancia de esta version radica en su formato: los pesos estan cuantizados a 8 bits afines (group size 64) en las capas Linear de los tres transformers que componen el pipeline, mientras que normas, embeddings y fases RoPE se mantienen en el precision original. El resultado ocupa 3,0 GB en disco y unos 3,6 GB residentes en memoria, con un tiempo de generacion de aproximadamente 40 segundos para 50 pasos y 262.144 gaussianas en un chip M-series Ultra.

El pipeline integra tres componentes: BiRefNet para eliminacion de fondo, el encoder DINOv3 ViT-H+/16 en float16 y el encoder VAE de FLUX.2-klein-4B. La licencia del conjunto de pesos Idol es Apache-2.0, aunque el encoder DINOv3 incluido esta sujeto a la licencia propia de Meta, que debe acompanar cualquier redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente: BiRefNet (segmentacion) + DINOv3 ViT-H+/16 (encoder visual) + transformers de Idol + VAE encoder de FLUX.2-klein-4B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no generativo de texto) |
| Tipos de cuantizacion | 8-bit afines (group size 64) en capas Linear de los tres transformers; float16 en el resto y en el encoder DINOv3; atencion intermedia del VAE a 8 bits |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (pesos Idol); DINOv3 bajo DINOv3 License de Meta |
| Formato de pesos | safetensors (libreria mlx-serve) |

## Arquitectura y entrenamiento

El modelo base speridlabs/idol es un sistema de reconstruccion 3D a partir de una sola imagen. El pipeline empaquetado encadena tres etapas: primero BiRefNet elimina el fondo de la imagen de entrada; despues el encoder DINOv3 ViT-H+/16 extrae caracteristicas visuales en float16; finalmente los transformers de Idol generan la representacion 3D, que puede ser una malla GLB con discos texturizados o una nube de puntos Gaussian splatting. El VAE encoder procede de FLUX.2-klein-4B y su atencion intermedia esta cuantizada a 8 bits.

La cuantizacion aplicada en este repackaging afecta unicamente a las capas Linear de los tres transformers, con cuantizacion afín de 8 bits y group size 64 alli donde la anchura lo permite; el resto de esas capas permanece en float16. Las normas, los embeddings y las fases RoPE conservan los valores originales del modelo publicado. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de malla 3D en formato GLB a partir de una unica imagen de un objeto, con textura aplicada sobre discos.
- Generacion de Gaussian splatting (262.144 gaussianas) mediante el parametro `"geometry": "splat"`, compatible con la extension `KHR_gaussian_splatting`.
- Eliminacion de fondo automatica integrada mediante BiRefNet, sin necesidad de preprocesado externo.
- Servicio mediante API compatible con OpenAI y Anthropic a traves del endpoint `POST /v1/3d/generations`.
- Ejecucion nativa en Apple Silicon sin Python ni dependencias en la nube.
- No dispone de capacidades de texto, razonamiento, codigo, tool calling ni agentes; es un modelo exclusivamente image-to-3D.

## Casos de uso

- Digitalizacion de productos para comercio electronico: a partir de una fotografia de catalogo se genera una malla GLB que puede visualizarse en un visor web, eliminando el fondo automaticamente y sin intervencion manual.
- Prototipado rapido en diseno industrial: convertir bocetos o fotos de referencia en representaciones 3D visualizables en Preview o Quick Look para validar formas antes de modelar en CAD.
- Creacion de activos para videojuegos y realidad aumentada: generar mallas texturizadas de objetos cotidianos que se importan directamente en motores como Unity o Unreal.
- Visualizacion cientifica y museistica: escanear piezas de un museo o especimenes con una sola foto y obtener splats Gaussianos para renderizado volumetrico interactivo.
- Generacion de contenido para impresion 3D: obtener una malla base a partir de una imagen de referencia para retocar posteriormente en herramientas de modelado.
- Integracion en pipelines automatizados de catalogacion: el endpoint HTTP compatible con OpenAI permite encadenar la generacion 3D dentro de flujos existentes sin escribir codigo Python.
- Demostraciones y herramientas internas en macOS: el servidor mlx-serve con app firmada de barra de menu facilita desplegar la capacidad 3D en equipos de desarrollo Apple sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son operativos: aproximadamente 40 segundos para 50 pasos y 262.144 gaussianas en un chip M-series Ultra, con 3,6 GB de memoria residente.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 3,6 GB residentes en inferencia, segun el autor.
- Hardware objetivo: Apple Silicon (chips M-series); el dato de rendimiento se refiere a un M-series Ultra.
- No esta pensado para GPU NVIDIA ni CUDA; el servidor mlx-serve es nativo de Apple Silicon.
- Tamano en disco del repositorio: 3,0 GB.
- Despliegue: binario `mlx-serve` con `--model-dir <carpeta del repo>`, o seleccionando Idol en el panel 3D de la app de mlx-serve.
- Latencia: unos 40 segundos por generacion (50 pasos, 262.144 gaussianas) en M-series Ultra; no se dispone de datos de throughput para otros chips.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol-MLX-Serve-8bit | Image-to-3D (malla + Gaussian splatting) | no disponible | no aplica | Apache-2.0 (DINOv3 con licencia propia) | HuggingFace, solo Apple Silicon |
| speridlabs/idol | Image-to-3D (modelo base sin cuantizar) | no disponible | no aplica | Apache-2.0 | HuggingFace |
| Modelos image-to-3D alternativos (p. ej. TripoSR, Trellis) | Image-to-3D | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en image-to-3D: no genera texto, no razona y no soporta tool calling ni agentes.
- Dependencia de plataforma: requiere Apple Silicon y el servidor mlx-serve; no es desplegable en GPU NVIDIA ni en entornos CUDA.
- La cuantizacion a 8 bits de las capas Linear puede introducir perdida de calidad respecto al modelo base sin cuantizar; no se han publicado metricas de dicha degradacion.
- El encoder DINOv3 incluido esta bajo la DINOv3 License de Meta, no bajo Apache-2.0; cualquier redistribucion debe acompanar dicha licencia.
- No se dispone de informacion sobre sesgos, tasas de alucinacion geometrica ni limitaciones de idioma (el modelo no procesa texto).
- El numero de descargas (20) y likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.
- Para uso comercial, verificar la compatibilidad de la DINOv3 License con el producto previsto, ademas de la licencia Apache-2.0 de los pesos Idol.

## Enlaces

- HuggingFace: https://huggingface.co/ddalcu/Idol-MLX-Serve-8bit
- Modelo base: https://huggingface.co/speridlabs/idol
- mlx-serve: https://mlxserve.com/
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Script de conversion: `tests/convert_idol_weights.py` en el repositorio mlx-serve
- Licencia DINOv3: `dinov3/LICENSE.md` dentro del repositorio del modelo
- VAE de origen: black-forest-labs/FLUX.2-klein-4B (Apache-2.0)
