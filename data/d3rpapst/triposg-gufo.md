# D3rPapst/triposg-gufo

## Resumen

TripoSG es un modelo de generacion de mallas 3D a partir de una unica imagen (image-to-3D), desarrollado originalmente por Tripo y VAST AI Research y publicado en arXiv (2502.06608). Esta ficha describe la version `D3rPapst/triposg-gufo`, una conversion del modelo original `VAST-AI/TripoSG` a un unico fichero safetensors BF16/F32 pensada para el motor nativo `gufo` en Windows sobre hardware AMD Strix Halo con ROCm, sin dependencia de Python.

La arquitectura combina tres componentes: un codificador de imagen DINOv2-L (procedente de `facebook/dinov2-large`), un transformer de difusion con rectified flow (DiT) que genera un campo de vectores latente, y un decodificador shape-VAE que convierte ese latente en una malla GLB. El repositorio ocupa 3,9 GB y contiene 1128 tensores (423 en BF16 y 705 en F32).

La relevancia de esta version es practica: empaqueta los tres submodelos en un solo fichero, elimina la ruta de decodificacion FlashVDM y el removedor de fondo RMBG (de licencia no comercial) y expone el modelo mediante una API HTTP (`POST /v1/3d/generations`) que devuelve un GLB. Segun el autor, en Strix Halo consume 1,6 GB de GPU tras la carga, con un pico de 6,7 GB, y tarda unos 116 s por objeto a resolucion 512^3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Image-to-3D: codificador DINOv2-L + DiT con rectified flow + decodificador shape-VAE |
| Parametros totales | no disponible (1128 tensores en el fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | BF16 (matrices) y F32 (normas, sesgos y tablas); no se documentan otras |
| Idiomas soportados | no disponible (entrada multimodal por imagen, sin interfaz de texto) |
| Licencia | MIT (modelo); DINOv2-L interno bajo Apache-2.0 |
| Formato de pesos | safetensors (un unico fichero `triposg.safetensors`, 3,92 GB) |
| Entrada / salida | imagen (con canal alfa o recorte propio) -> malla GLB |
| Resolucion de generacion | 512^3 (medicion del autor) |
| Prefijos de tensores | `dino.*`, `dit.*`, `vae.*` (solo decodificador) |
| Revision base | `2c1c516d22d58db486a058d98d31bb6177344e06` de VAST-AI/TripoSG |
| Hardware objetivo | AMD Strix Halo bajo Windows con ROCm |
| Tamano del repo | 3,9 GB |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de tres etapas. Primero, un codificador DINOv2-L (el snapshot incluido en el repositorio de TripoSG, originalmente de Meta AI bajo Apache-2.0) extrae caracteristicas de la imagen de entrada; la conversion fusiona sus proyecciones q/k/v en un unico tensor `attention.qkv` y hornea la tabla de posiciones de 224 px. Despues, un transformer de difusion (DiT) entrenado con rectified flow genera un latente de forma a partir de esas caracteristicas y de una semilla. Finalmente, un decodificador shape-VAE transforma el latente en la malla 3D final.

La conversion a formato `gufo` se realizo con el script `tools/triposg/convert_hf_to_gufo.py` (commits `6aeaeda9`, `ba2ee60e`, `5ffb65bb`, ejecutado el 12 de noviembre de 2026). El script parsea los safetensors y los JSON de configuracion con biblioteca estandar y numpy, sin ejecutar codigo del directorio del modelo, des-intercala el layout head-major q|k|v de la atencion de TripoSG en tensores `to_q/to_k/to_v` separados y convierte las matrices a BF16. El fichero resultante registra en metadatos la revision de origen y la licencia (`gufo.triposg.source`, `gufo.triposg.license`), y se verifica con `tools/triposg/verify_gufo_file.py`.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF/DPO en la informacion proporcionada; esos detalles corresponden al paper original (arXiv:2502.06608).

## Capacidades

- Generacion de mallas 3D texturizadas en formato GLB a partir de una unica imagen.
- Control de generacion mediante parametros de inferencia: `steps`, `guidance`, `seed`, `resolution` y `max_faces`.
- Entrada con canal alfa o recorte propio para separar el objeto del fondo (sustituye al removedor RMBG original).
- Reproducibilidad mediante semilla fija.
- Ejecucion nativa en Windows sobre ROCm sin Python, a traves del servidor `gufo serve objekt`.
- API HTTP asincrona basada en trabajos: creacion con `POST /v1/3d/generations` y descarga del GLB con `GET .../{id}/content`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje, vision general o audio: es un modelo especializado exclusivamente en image-to-3D.

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: a partir de un concept art o una foto de referencia se obtiene un GLB en unos 116 s a 512^3, util para iterar sobre siluetas y volumetrias antes del modelado definitivo.
- Catalogos de comercio electronico: convertir fotos de producto en mallas 3D para visores web o configuradores, usando el canal alfa de la imagen para aislar el objeto sin depender de un removedor de fondo externo.
- Escaneo y digitalizacion de patrimonio: generar una malla aproximada desde una unica fotografia de una pieza, como base para retopologia o para documentacion preliminar.
- Pipeline de impresion 3D: producir mallas GLB con limite de caras (`max_faces`) ajustado a la capacidad de impresora o al flujo de laminado.
- Integracion en herramientas de escritorio: el servidor `gufo` expone la generacion por HTTP, de modo que un plugin de Blender, un editor propio o un script de automatizacion pueden solicitar mallas sin instalar Python ni CUDA.
- Generacion por lotes en estaciones de trabajo AMD: al caber en 6,7 GB de pico de GPU, permite ejecutar un servicio de conversion de imagenes a 3D en equipos con APU Strix Halo en lugar de GPUs NVIDIA dedicadas.
- Realidad aumentada y web: generar modelos ligeros (con `max_faces` bajo) para visores WebXR o experiencias AR en movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones del autor en AMD Strix Halo:

| Metrica | Valor |
|---|---|
| VRAM tras la carga | 1,6 GB |
| VRAM pico | 6,7 GB |
| RAM de host | 3,9 GB |
| Tiempo por objeto (512^3) | ~116 s |

## Requisitos de hardware

- VRAM estimada: 1,6 GB tras la carga y 6,7 GB de pico, segun la medicion del autor en Strix Halo.
- RAM de host: 3,9 GB.
- GPU objetivo: AMD Strix Halo (APU) bajo Windows con ROCm. No se documenta soporte para NVIDIA, Apple Silicon ni otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en el hardware APU indicado; el pico de 6,7 GB queda dentro de la memoria unificada de Strix Halo. No hay datos para GPUs de consumo discretas.
- Despliegue: exclusivamente mediante el servidor nativo `gufo serve objekt` de `gufo-studio-windows` (rama `feat/triposg-21`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo image-to-3D.
- Configuracion del servidor recomendada por el autor: `router-gpu-gb = 8`, `router-host-gb = 4`, `router-idle-seconds = 900`, `max-request-bytes = 33554432` (32 MB), `ttl = 86400`.
- Latencia: aproximadamente 116 s por objeto a 512^3. No se proporciona throughput agregado ni latencia a otras resoluciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| triposg-gufo (esta ficha) | Image-to-3D | no disponible | no aplica | MIT | safetensors unico, servidor `gufo` nativo |
| VAST-AI/TripoSG (original) | Image-to-3D | no disponible | no aplica | MIT | safetensors multi-fichero, Python/PyTorch |
| Trellis (Microsoft) | Image-to-3D | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible en la informacion |
| Hunyuan3D | Image-to-3D | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible en la informacion |

Solo se dispone de datos verificables para las dos primeras filas; las alternativas se listan como categoria pero sin cifras confirmadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no procesa texto ni mantiene conversacion; cualquier expectativa de uso como LLM o VLM es incorrecta.
- Entrada de una sola imagen: la calidad de la malla depende de la vista y de la iluminacion de la foto; no se documenta reconstruccion multivista.
- El VAE incluido es solo decodificador; no se puede codificar una nube de puntos existente con este fichero.
- No incluye el removedor de fondo RMBG original (licencia no comercial); el aislamiento del objeto recae en el canal alfa o en un recorte externo, lo que puede degradar resultados con fondos complejos.
- No incluye la ruta FlashVDM, por lo que la decodificacion puede ser mas lenta que en el pipeline original de TripoSG.
- Riesgo de alucinacion geometrica: partes ocultas de la imagen se infieren, no se reconstruyen; pueden aparecer geometrias plausibles pero incorrectas.
- Soporte de hardware limitado y documentado solo para AMD Strix Halo con ROCm en Windows; no hay garantias en otras plataformas.
- Licencia MIT para el modelo, pero el codigo y los pesos derivan de TripoSG y DINOv2-L (Apache-2.0); conviene revisar las condiciones de ambas fuentes antes de un uso comercial a gran escala.
- Repositorio sin descargas ni likes y creado recientemente: no hay validacion comunitaria independiente de la conversion.
- La conversion se realizo con asistencia de IA (Claude Code), segun declara el autor; se recomienda ejecutar `verify_gufo_file.py` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D3rPapst/triposg-gufo
- Modelo original: https://huggingface.co/VAST-AI/TripoSG
- Repositorio de codigo original: https://github.com/VAST-AI-Research/TripoSG
- Paper: https://arxiv.org/abs/2502.06608
- Codificador de imagen original: https://huggingface.co/facebook/dinov2-large
- Motor de inferencia: https://github.com/D3rPapst/gufo-studio-windows
