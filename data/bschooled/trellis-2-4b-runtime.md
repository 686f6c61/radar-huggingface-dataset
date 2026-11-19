# bschooled/TRELLIS.2-4B-runtime

## Resumen

TRELLIS.2-4B-runtime es un espejo (mirror) no oficial del modelo `microsoft/TRELLIS.2-4B`, un sistema de generacion 3D a partir de una sola imagen (image-to-3D) desarrollado por Microsoft Research. Este repositorio, publicado por el usuario `bschooled`, no introduce cambios en los pesos: empaqueta un subconjunto del modelo original junto con el decodificador de estructura dispersa que referencia, de modo que toda la pipeline pueda cargarse desde un unico directorio local. Esta pensado para alimentar la lane image-to-3D del proyecto MageFlow.

El paquete conserva unicamente lo necesario para las rutas de inferencia `1024`, `1024_cascade` y `1536_cascade`, y elimina los codificadores VAE usados solo en entrenamiento y el DiT de textura a resolucion 512. El resultado pasa de 16,4 GB a 12,4 GB. Los pesos son byte a byte identicos a los originales (DiTs en bf16, decodificadores en fp16), sin cuantizacion.

La relevancia de este repositorio es practica: evita dependencias de modelos con acceso restringido (gated) sustituyendo DINOv3 y RMBG-2.0 por alternativas abiertas, y permite desplegar la pipeline completa de forma offline. No es un lanzamiento oficial de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D basada en DiT (diffusion transformer) con decodificador de estructura dispersa conv3d; pesos en bf16 (DiTs) y fp16 (decodificadores) |
| Parametros totales | 4B (segun el nombre del modelo base; no se detalla desglose por componente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision/3D, no de texto) |
| Tipos de cuantizacion | Ninguna publicada; el autor descarta fp8 e4m3 per-channel e int8 per-128-group por degradar las texturas |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16/fp16), con `pipeline.json` y `manifest.json` con sha256 por fichero |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2-4B emplea una arquitectura de diffusion transformer (DiT) para la generacion de representaciones 3D, combinada con un decodificador de estructura dispersa de tipo conv3d (`ss_dec_conv3d_16l8_fp16`, 16 capas, 8 canales) heredado de `microsoft/TRELLIS-image-large`. La pipeline incluye un modelo de condicionamiento de imagen (DINOv3 ViT-L/16) y un modelo de segmentacion de fondo (RMBG-2.0 en el original, BiRefNet en este espejo).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del espejo no los detalla. La innovacion destacable de este repositorio es de empaquetado: consolidacion de dependencias en un unico directorio, sustitucion de modelos gated por alternativas MIT/abiertas y eliminacion de componentes exclusivos de entrenamiento.

## Capacidades

- Generacion de mallas 3D texturizadas a partir de una unica imagen de entrada (image-to-3D).
- Tres rutas de inferencia: `1024`, `1024_cascade` y `1536_cascade` (la ruta `512` no esta disponible en este subconjunto).
- Generacion de texturas mediante el DiT de textura (la variante de 512 queda excluida).
- Segmentacion automatica de fondo de la imagen de entrada mediante BiRefNet (MIT).
- Condicionamiento visual con DINOv3 ViT-L/16 (copia sin restriccion de acceso).
- Carga offline completa desde un directorio local, sin llamadas a repositorios remotos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto o audio.

## Casos de uso

- Prototipado rapido de assets 3D: un artista introduce una foto o render 2D y obtiene una malla texturizada en resolucion 1024 o 1536 para iterar en un motor de juego o herramienta DCC.
- Pipeline de generacion de contenido en MageFlow: la lane image-to-3D carga la pipeline completa desde un directorio local, lo que permite ejecucion en entornos aislados o sin acceso a Hugging Face.
- Despliegue en infraestructura con restricciones de red: al eliminar las dependencias gated (DINOv3 y RMBG-2.0), el paquete puede instalarse en servidores air-gapped con licencia MIT.
- Generacion de variantes de un objeto: a partir de una imagen de referencia se producen mallas con distintas resoluciones (`1024` frente a `1536_cascade`) para adaptar el nivel de detalle al destino (movil, escritorio, cinematica).
- Investigacion en reconstruccion 3D monocular: el repositorio sirve como base reproducible para comparar resultados con los pesos upstream, dado que son byte a byte identicos.
- Integracion en herramientas de e-commerce: generar modelos 3D de productos a partir de fotografias de catalogo para visores web o configuradores, usando la ruta `1024` por su menor coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 12,4 GB en disco; con pesos en bf16/fp16, la inferencia requiere previsiblemente mas VRAM que el tamano en disco por los estados intermedios de difusion, aunque no se aportan cifras.
- GPU recomendadas: no disponible. Por el tamano del modelo (4B) y las resoluciones de salida (hasta 1536), se situa en la gama de GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090), pero esta estimacion no procede de la documentacion proporcionada.
- Cabe en consumer GPU: no confirmado en la informacion disponible.
- Opciones de despliegue: la libreria `trellis` con carga desde directorio local segun `pipeline.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo image-to-3D).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2-4B-runtime (este) | 4B | no aplica | image-to-3D | MIT | Abierto, sin dependencias gated |
| microsoft/TRELLIS.2-4B (upstream) | 4B | no aplica | image-to-3D | MIT | Abierto, con dependencias gated (DINOv3, RMBG-2.0) |
| microsoft/TRELLIS-image-large | no disponible | no aplica | image-to-3D | no disponible en la informacion | Abierto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Microsoft; es un espejo mantenido por un tercero (`bschooled`) con 0 descargas y 0 likes en el momento de la consulta.
- La ruta de inferencia `512` no esta disponible al haberse eliminado el DiT de textura de 512.
- El autor documenta que las variantes cuantizadas a 8 bits (fp8 e4m3 per-channel, int8 per-128-group) producen texturas visiblemente mas oscuras y sucias con la misma semilla, por lo que no se publican; no hay opcion de cuantizacion oficial.
- Riesgo de alucinacion geometrica y texturas inconsistentes inherente a los modelos generativos 3D; no se documentan tasas de error.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no aplica (entrada de imagen); no se documentan sesgos en la distribucion de objetos o categorias.
- La licencia MIT se copia textualmente del original, pero el autor declara explicitamente que no es un release oficial; conviene verificar la procedencia de los pesos si se usa en produccion.
- Depende de `manifest.json` para la verificacion de integridad (sha256) de cada fichero; no se documenta un proceso de firma.

## Enlaces

- Repositorio del espejo: https://huggingface.co/bschooled/TRELLIS.2-4B-runtime
- Modelo base upstream: https://huggingface.co/microsoft/TRELLIS.2-4B
- Modelo de estructura dispersa: https://huggingface.co/microsoft/TRELLIS-image-large
- Proyecto MageFlow: https://github.com/bschooled/caeleste-image-generation
- Copia sin restriccion de DINOv3: https://huggingface.co/camenduru/dinov3-vitl16-pretrain-lvd1689m
- Modelo de segmentacion de fondo: https://huggingface.co/ZhengPeng7/BiRefNet
- Modelo de segmentacion original (gated): https://huggingface.co/briaai/RMBG-2.0
- Modelo de condicionamiento original (gated): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
