# chinoll/Moss-Image-Edit

## Resumen

MOSS Image Edit es un adaptador LoRA de edicion de imagen desarrollado por chinoll sobre los modelos MOSS-Image (Base y SFT) del equipo OpenMOSS. Permite modificar imagenes mediante instrucciones de texto en ingles o chino: cambiar colores, vestuario, iluminacion, estaciones del año o estilo visual, conservando la composicion original. Se distribuye en formato safetensors (unos 0,3 GB) y funciona como pipeline image-to-image.

Su relevancia reside en la edicion instruccional con referencias multiples (hasta 4 imagenes por instruccion) integrada en ComfyUI, cuyo soporte nativo para edit-LoRA se fusiono en el core el mismo dia de su publicacion (22 de octubre de 2026). El entrenamiento incorpora datos del dataset ConceptEdit-12M de inclusionAI y se trata de un LoRA de rank 64 segun comfyui-wiki. Al ser un adaptador y no un modelo completo, requiere descargar ademas MOSS-Image-Base o MOSS-Image-SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, rank 64) sobre MOSS-Image, pipeline image-to-image |
| Parametros totales | no disponible (adaptador de ~0,3 GB en safetensors) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de edicion de imagen); admite hasta 4 imagenes de referencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (instrucciones en ingles y chino) |
| Licencia | no disponible en HuggingFace; el codigo del proyecto se publica bajo GPLv3 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un LoRA de rank 64 aplicado sobre MOSS-Image, un modelo generativo de imagenes que, segun el repositorio oficial de OpenMOSS, se carga en ComfyUI a partir de los directorios `transformer/`, `text_encoder/`, `tokenizer/` y `vae/`, lo que indica una arquitectura de difusion con transformer separado del codificador de texto y del VAE. El adaptador es compatible tanto con MOSS-Image-Base como con MOSS-Image-SFT, de modo que el usuario puede elegir cualquiera de los dos checkpoints como base.

Sobre los datos de entrenamiento, la model card reconoce el uso del dataset ConceptEdit-12M de inclusionAI para edicion de imagen unica, ademas de contribuciones de datos de edicion de @niangao2331. No se han publicado detalles sobre el numero de pasos de entrenamiento, hiperparametros, epocas ni tamano total del corpus: no disponible.

## Capacidades

- Edicion de imagen por instrucciones de texto: modificacion de colores, vestuario, iluminacion, estaciones y estilo visual.
- Edicion con una sola imagen de referencia (workflow single-reference) o con multiples referencias, hasta 4 imagenes conectables, indicando en la instruccion el rol de cada una.
- Compatibilidad con dos checkpoints base (MOSS-Image-Base y MOSS-Image-SFT).
- Integracion con ComfyUI mediante workflows JSON listos para usar y soporte nativo de edit-LoRA fusionado en el core de ComfyUI.
- Comprension de instrucciones en ingles y chino.
- Descarga y despliegue reproducible via CLI (`hf download`) con comandos documentados para el LoRA y los modelos base.

## Casos de uso

- **Retoque de fotografia de producto:** cambiar el color de un articulo (ropa, complementos, embalaje) manteniendo la composicion y el fondo, generando variantes de catalogo sin sesiones de foto adicionales.
- **Edicion de vestuario en retratos y moda:** modificar prendas o outfits en fotografias de modelo con una instruccion en texto, util para pruebas de concepto de estilismo.
- **Ajuste de iluminacion y estacion:** transformar una escena diurna de verano en una escena de atardecer de invierno, aprovechando que el LoRA fue entrenado explicitamente para estos tipos de cambio.
- **Transferencia de estilo con referencias multiples:** conectar hasta 4 imagenes (por ejemplo, la imagen a editar y varias referencias de estilo) describiendo el papel de cada una en la instruccion.
- **Flujos creativos reproducibles en ComfyUI:** cargar los workflows JSON incluidos (single-reference y multi-reference) en pipelines de produccion artistica, con colocacion de ficheros documentada.
- **Localizacion visual de contenido para mercados chino e ingles:** aceptar instrucciones en ambos idiomas permite integrarlo en equipos de China y de habla inglesa sin traduccion previa.
- **Prototipado rapido de variantes visuales para marketing:** generar varias versiones de una misma creatividad (color, ambiente, estilo) a partir de un unico asset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible. Al ser un LoRA de ~0,3 GB, la sobrecarga sobre el modelo base es minima; los requisitos reales vendran determinados por MOSS-Image-Base o MOSS-Image-SFT, cuyas cifras de VRAM no se detallan en la informacion proporcionada.
- **GPU recomendadas:** no disponible.
- **Consumer GPU:** no disponible; dependera del modelo base elegido.
- **Despliegue:** ComfyUI es la via documentada (con soporte nativo de edit-LoRA en el core y workflows JSON incluidos). El repositorio oficial de MOSS-Image tambien documenta un HF Loader que requiere los directorios `transformer/`, `text_encoder/`, `tokenizer/` y `vae/`. Existen ademas nodos de terceros (ComfyUI-MOSS-Image-Ostris-Edit) para LoRAs de edicion entrenados con ai-toolkit sobre la misma arquitectura.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Referencias | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chinoll/Moss-Image-Edit | LoRA rank 64 sobre MOSS-Image | no disponible (adaptador, ~0,3 GB) | 1-4 | pesos: no disponible; codigo GPLv3 | HuggingFace, ComfyUI |
| Qwen-Image-Edit (Alibaba) | MMDiT de edicion instruccional | ~20B (aprox., segun documentacion oficial) | multiple | Apache 2.0 | HuggingFace, Diffusers, ComfyUI |
| FLUX.1 Kontext dev (Black Forest Labs) | Transformer de rectified flow | ~12B (aprox., segun documentacion oficial) | 1 por paso (edicion secuencial) | FLUX Dev (no comercial) | HuggingFace, Diffusers, ComfyUI |

Como alternativa dentro del mismo ecosistema MOSS-Image, existen los nodos ComfyUI-MOSS-Image-Ostris-Edit para ejecutar LoRAs de edicion entrenados con ai-toolkit sobre MOSS-Image Base/SFT [Edit Training]. Frente a los modelos monoliticos como Qwen-Image-Edit o FLUX.1 Kontext dev, la ventaja de este LoRA es su peso reducido (~0,3 GB) y su integracion nativa en ComfyUI; la contrapartida es que depende de un modelo base externo y carece de benchmarks publicos.

## Limitaciones y advertencias

- La licencia de los pesos no esta especificada en HuggingFace ("no disponible"); el codigo del proyecto es GPLv3, una licencia copyleft que puede condicionar la distribucion de codigo derivado. Verificar los terminos antes de cualquier uso comercial.
- Requiere descargar y configurar por separado el modelo base (MOSS-Image-Base o MOSS-Image-SFT) y ajustar el `snapshot_dir` del loader de ComfyUI, lo que anade friccion de despliegue.
- Modelo muy reciente (publicado el 22 de octubre de 2026) con 0 descargas registradas y 36 likes: validacion comunitaria todavia limitada.
- Instrucciones soportadas en ingles y chino; el comportamiento con otros idiomas no esta documentado.
- Maximo de 4 imagenes de referencia por instruccion.
- Al no existir benchmarks publicados, no hay forma de cuantificar la fidelidad de edicion ni la tasa de artefactos; como es habitual en LoRAs de edicion, pueden producirse desviaciones de identidad o alteraciones no deseadas en zonas fuera de la instruccion.
- Los requisitos de hardware y las cifras de rendimiento del sistema completo (base + LoRA) no estan documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chinoll/Moss-Image-Edit
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- GitHub del proyecto: https://github.com/Chenkin-x/Moss-Image-Edit
- README en ingles: https://github.com/Chenkin-x/Moss-Image-Edit/blob/main/README.en.md
- Licencia GPLv3 del codigo: https://github.com/Chenkin-x/Moss-Image-Edit/blob/main/LICENSE
- Guia de ComfyUI (ingles): https://github.com/Chenkin-x/ComfyUI-Moss-Image-Edit/blob/main/README.en.md
- Workflow de referencia unica: https://github.com/Chenkin-x/ComfyUI-Moss-Image-Edit/blob/main/workflows/moss_edit_single_reference.json
- Workflow de referencias multiples: https://github.com/Chenkin-x/ComfyUI-Moss-Image-Edit/blob/main/workflows/moss_edit_multi_reference.json
- Dataset ConceptEdit-12M: https://huggingface.co/datasets/inclusionAI/ConceptEdit-12M
- Repositorio oficial MOSS-Image (ComfyUI): https://github.com/OpenMOSS/MOSS-Image/tree/main/comfyui
- Nodos alternativos de edicion (ostris): https://github.com/ostris/ComfyUI-MOSS-Image-Ostris-Edit
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-10-22-moss-image-edit-lora
- Cobertura en AGI Hunt: https://agihunt.info/en/p/1a164cd02ef46da3d75a6ae5a66
