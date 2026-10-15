# lalalalalaa/flux2-klein-edit-loras

## Resumen

`lalalalalaa/flux2-klein-edit-loras` es un repositorio de cuatro adaptadores LoRA de edicion de imagen para el modelo base `black-forest-labs/FLUX.2-klein-4B`, publicados por el usuario lalalalalaa y convertidos especificamente para epics, una aplicacion de fotografia que edita imagenes en el dispositivo mediante MLX (Swift). El repositorio ocupa 0,7 GB, se distribuye bajo licencia Apache 2.0 y sus pesos estan en safetensors con precision bfloat16.

Los pesos no son originales de este autor: cada adaptador procede de un tercero (lrzjason, fal y eric-venti-seeds) y ha sido renombrado para encajar en el arbol de modulos de epics (los nombres de `Flux2Transformer2DModel` de Diffusers/mflux), con la `qkv` fusionada del doble bloque dividida por filas en `to_q`/`to_k`/`to_v` (compartiendo la matriz A), el factor `alpha / rank` plegado en B y todo escrito en bfloat16.

Su relevancia es practica: documenta un procedimiento reproducible de portado de LoRAs comunitarias de FLUX.2 [klein] al ecosistema MLX Swift para inferencia local en dispositivos Apple, con verificacion de trazabilidad (SHA-256 del fichero origen en los metadatos) y una validacion cruzada frente a mflux 0.22.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (bajo rango) sobre el transformer de difusion FLUX.2 [klein] 4B (`Flux2Transformer2DModel`) |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base declara 4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion/edicion de imagen) |
| Tipos de cuantizacion | bfloat16 en los adaptadores; el modelo base se emplea cuantizado (referencia de trabajo: `mflux-community/flux2-klein-4b-mflux-q8`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`<carpeta>/adapter.safetensors`), formato `epics-klein-lora/1`, bfloat16 |

## Arquitectura y entrenamiento

Cada adaptador sigue el esquema clasico de LoRA de bajo rango: para cada capa que modifica se almacenan `.lora_a` con forma `[in, rank]` y `.lora_b` con forma `[rank, out]`, con el factor `alpha / rank` ya plegado dentro de B, y se aplica junto a la capa (cuantizada) como `y = layer(x) + scale · (x · A) · B`. Las capas se nombran segun el arbol del transformer de Klein en epics (`transformer_blocks.N.attn.to_q`, `single_transformer_blocks.N.attn.to_qkv_mlp_proj`, `x_embedder`, etc.). La conversion la realiza `convert.py`, que rechaza cualquier clave que no pueda ubicar y cualquier capa o forma que el modelo base no tenga; los metadatos de cada fichero incluyen `format`, `base` (`klein-4b`), `rank`, `source` y `source_sha256`.

Este repositorio no entrena nada: los pesos pertenecen a sus autores y aqui solo se reformatean. No se publican datos sobre el dataset, el numero de tokens ni el procedimiento de ajuste (RLHF/DPO) de los LoRAs originales. El uso previsto es el modelo destilado FLUX.2 Klein 4B a 4 pasos y sin guidance, con escalas concretas por adaptador: `keep/` a 0,6; `zoom/` y `outpaint/` a 1,1; y `relight/` a 1,5. El autor documenta que el LoRA de eliminacion de objetos de fal no se incluye porque, sobre el modelo destilado a 4 pasos, eliminaba la marca y no el objeto.

## Capacidades

- Edicion de imagen guiada por texto sobre FLUX.2 [klein] 4B, con cuatro comportamientos diferenciados segun la carpeta.
- `keep/`: conserva lo que no se ha pedido cambiar, manteniendo detalle, color y estructura de la imagen original.
- `zoom/`: amplia una zona marcada con un rectangulo rojo, con el prompt fijo `Zoom into the red highlighted area.`
- `outpaint/`: rellena un borde de verde puro (#00FF00) alrededor de la fotografia, extendiendo el lienzo, con el prompt `Fill the green spaces according to the image.`
- `relight/`: reilumina a partir de la direccion de luz de una bola de referencia, tras una pasada de cielo cubierto; usa dos imagenes de entrada (la version con luz plana como imagen 1 y la bola de luz como imagen 2).
- Entrada multimodal de imagenes multiples en el caso de `relight/` (referencia + imagen base).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un conjunto de adaptadores de difusion para edicion de imagen.
- No dispone de modo thinking, ni de capacidades de audio, video o generacion de texto.
- Soporte multilingue: no disponible; los prompts documentados estan en ingles.

## Casos de uso

- Retoque fotografico en el dispositivo: al estar convertidos para MLX (Swift), los adaptadores permiten editar fotos localmente en hardware Apple sin enviar la imagen a un servidor, lo que resulta adecuado para aplicaciones de fotografia con requisitos de privacidad.
- Reencuadre con zoom sobre una region concreta: el adaptador `zoom/` amplia la zona marcada con un rectangulo rojo, util para obtener un recorte ampliado manteniendo coherencia de detalle en lugar de un simple escalado de pixeles.
- Ampliacion de lienzo para cambios de relacion de aspecto: `outpaint/` rellena el borde verde y genera contenido coherente, lo que sirve para adaptar una foto a formatos cuadrados o verticales sin recortar el encuadre original.
- Conservacion de contenido en cadenas de edicion: `keep/` a escala 0,6 se usa junto a las palabras del usuario para preservar detalle, color y estructura mientras se aplica un cambio, lo que reduce la degradacion acumulada en ediciones sucesivas.
- Reiluminacion consistente en fotografia de producto o retrato: `relight/` toma una referencia de iluminacion (bola de luz) y una version con luz plana de la foto, y reconstruye la direccion solar, util para unificar varias tomas hechas en condiciones de luz distintas.
- Prototipado de pipelines de edicion encadenada en una app movil: la combinacion de los cuatro adaptadores sobre un unico modelo destilado de 4 pasos (sin guidance) permite encadenar zoom, ampliacion y reiluminacion en un flujo local con tiempos de generacion bajos.
- Estudio de portabilidad de LoRAs de difusion: el formato `epics-klein-lora/1` y `convert.py` sirven como referencia para llevar adaptadores entrenados en Diffusers/mflux a un arbol de modulos propio, con verificacion de integridad mediante SHA-256.
- Integracion en aplicaciones iOS/macOS basadas en MLX: los adaptadores se aplican sobre el transformer ya cuantizado, lo que encaja en un despliegue on-device con memoria unificada en lugar de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de metricas de calidad de edicion (por ejemplo, similitud con la imagen original, FID o evaluaciones humanas) para estos adaptadores.

Como unica verificacion documentada, el autor indica que el adaptador `zoom/` convertido y aplicado en tiempo de ejecucion sobre mflux 0.22 produce la misma imagen que la carga del LoRA original por parte de mflux con la misma semilla, con diferencias atribuibles unicamente a que mflux integra el LoRA en los pesos desquantizados.

## Requisitos de hardware

- Tamano de los adaptadores: 0,7 GB en total para las cuatro carpetas, en bfloat16; se aplican sobre el transformer cuantizado del modelo base, no lo sustituyen.
- VRAM estimada para el modelo base FLUX.2 Klein 4B (estimacion a partir del recuento de parametros, no medida publicada): en bfloat16 en torno a 8-9 GB; en cuantizacion de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB, mas el coste de las activaciones segun resolucion.
- GPU dedicadas compatibles con el modelo base: RTX 4090, A100 y H100 son suficientes para un transformer de 4B; no se dispone de cifras de consumo de memoria especificas para este repositorio.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM segun cuantizacion; en el caso de este repositorio el objetivo declarado es Apple Silicon con memoria unificada a traves de MLX.
- Opciones de despliegue: MLX (mflux 0.22 como referencia de validacion), la aplicacion epics en Swift, y las versiones equivalentes de 4B y 9B servidas por fal.ai; vLLM y llama.cpp no son aplicables a este formato de difusion.
- Latencia y throughput: no disponible para este repositorio. La unica referencia encontrada para el modelo de 4B en infraestructura fal.ai apunta a una latencia inferior a 10 segundos por imagen, dependiente de la resolucion, la complejidad de la edicion y la disponibilidad de GPU. El modelo destilado funciona a 4 pasos sin guidance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lalalalalaa/flux2-klein-edit-loras` (este repositorio) | LoRAs sobre base 4B | no aplica | sin benchmarks publicados; verificacion cualitativa frente a mflux 0.22 | Apache 2.0 | HuggingFace, formato MLX (`epics-klein-lora/1`), 0 descargas y 0 likes en el momento de la consulta |
| `fal/flux-2-klein-4b-base-edit-lora` | base 4B | no disponible | no disponible | Apache 2.0 (segun las fuentes de los LoRAs incluidos) | API en fal.ai; latencia estimada inferior a 10 s por imagen |
| `fal/flux-2-klein-9b-base-edit-lora` | base 9B | no disponible | no disponible | no disponible | API en fal.ai, con soporte de LoRA personalizados |
| `wavespeed-ai/flux-2-klein-9b/edit-lora` | base 9B | no disponible | se anuncia mayor calidad de edicion y mejor comprension de prompts que la variante de 4B, sin cifras publicadas | no disponible | API REST en WaveSpeedAI |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y ejecutar `black-forest-labs/FLUX.2-klein-4B`; los ficheros de este repositorio son unicamente adaptadores.
- El formato `epics-klein-lora/1` esta pensado para el arbol de modulos de epics y de `Flux2Transformer2DModel`; su carga directa en otros frameworks exige conversion previa.
- Los comportamientos dependen del modelo destilado a 4 pasos y sin guidance; el autor documenta que al menos un LoRA de fal (eliminacion de objetos) no funciona en ese regimen, lo que sugiere sensibilidad de los adaptadores a la configuracion de inferencia.
- No hay benchmarks ni evaluaciones de calidad publicadas, ni comparaciones cuantitativas con alternativas.
- Sesgos conocidos: no documentados en la informacion disponible. Al tratarse de un modelo de difusion aplicado a fotografias, cabe esperar los sesgos propios de los datos de entrenamiento del modelo base, no evaluados aqui.
- Riesgo de alucinacion visual: no cuantificado; en tareas de ampliacion (`outpaint/`) y ampliado (`zoom/`) el contenido generado en zonas nuevas puede no corresponder con la escena real.
- Idiomas: no se declara soporte multilingue; todos los prompts documentados estan en ingles y las escalas recomendadas estan ajustadas a esos textos concretos.
- Restricciones de licencia: los adaptadores y sus fuentes figuran como Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia de cada repositorio de origen y la del modelo base antes de un despliegue en produccion.
- Trazabilidad y credito: los pesos pertenecen a sus autores originales (lrzjason, fal, eric-venti-seeds); este repositorio los redistribuye reformateados e incluye el SHA-256 del fichero de origen en los metadatos para poder comprobarlos.
- Madurez: el repositorio registra 0 descargas y 0 likes, no declara pipeline en HuggingFace y no se ha actualizado desde su creacion, por lo que carece de validacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lalalalalaa/flux2-klein-edit-loras
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Fuente del adaptador `keep/`: https://huggingface.co/lrzjason/Consistance_Edit_Lora
- Espejo de la fuente anterior: https://huggingface.co/xocialize/consistence-edit-FLUX.2-klein-4B-lora
- Fuente del adaptador `zoom/`: https://huggingface.co/fal/flux-2-klein-4B-zoom-lora
- Fuente del adaptador `outpaint/`: https://huggingface.co/fal/flux-2-klein-4B-outpaint-lora
- Fuente del adaptador `relight/`: https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein4B
- Modelo base cuantizado usado como referencia: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q8
- Ficha del modelo de 4B edit LoRA en fal.ai: https://www.aimodels.fyi/models/fal/flux-2-klein-4b-base-edit-lora-fal-ai
- Ficha del modelo de 9B edit LoRA en fal.ai: https://www.aimodels.fyi/models/fal/flux-2-klein-9b-base-edit-lora-fal-ai
- Guia practica del editor con LoRA de FLUX.2 Klein 9B: https://hackernoon.com/turn-any-photo-into-any-look-flux-2-klein-9b-lora-for-image-to-image-editing
- Modelo de 9B edit LoRA en WaveSpeedAI: https://wavespeed.ai/models/wavespeed-ai/flux-2-klein-9b/edit-lora
- Documentacion de la API de 9B edit LoRA en WaveSpeedAI: https://wavespeed.ai/docs/docs-api/wavespeed-ai/flux-2-klein-9b-edit-lora
