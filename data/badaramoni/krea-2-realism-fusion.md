# badaramoni/Krea-2-Realism-Fusion

## Resumen

Krea-2-Realism-Fusion es un adaptador LoRA de fotorrealismo para el modelo de generacion de imagen texto-a-imagen Krea 2 Turbo, publicado por el usuario badaramoni. No es un modelo entrenado desde cero: es el resultado de una fusion de varios adaptadores de realismo (LoRA clasicos y LoKR) combinados en un unico fichero portable de rank 128. Su relevancia esta en el metodo de fusion, que opera en el espacio de deltas de pesos y permite mezclar adaptadores guardados en formatos de bajo rango distintos, algo que las herramientas habituales (kohya, mergekit) no permiten.

El problema que resuelve es practico: en el ecosistema de adaptadores de realismo abundan ficheros con convenciones y formatos heterogeneos, y combinarlos hasta ahora exigia apilar varios adaptadores en inferencia o renunciar a parte de ellos. Esta fusion produce un solo `.safetensors` que concentra la direccion combinada de realismo, sin necesidad de cargar una pila de multiples adaptadores al generar imagenes.

El repositorio ocupa 0,9 GB, tiene licencia krea-2-community-license (heredada de Krea-2-Turbo) y su uso esta supeditado a tener acceso al modelo base. Se publico el 11 de septiembre de 2026 y, en el momento de redactar esta ficha, acumulaba 0 descargas y 1 like, por lo que se trata de una publicacion muy reciente y practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango (LoRA, rank 128) sobre el modelo de difusion krea/Krea-2-Turbo; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el autor no publica el recuento de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); no disponible la longitud maxima de prompt |
| Tipos de cuantizacion | fp16 (unica variante publicada); no se ofrecen versiones GGUF, INT8 ni fp8 |
| Idiomas soportados | no disponible (todos los ejemplos de prompt de la model card estan en ingles) |
| Licencia | krea-2-community-license, etiquetada como `other` en HuggingFace; se hereda de krea/Krea-2-Turbo |
| Formato de pesos | safetensors (`badaramoni_krea2_realism_fusion_r128_fp16.safetensors`, claves `lora_unet_*` de musubi-tuner) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | text-to-image |
| Modelo base | krea/Krea-2-Turbo (relacion: merge) |
| Requisito de acceso | requiere acceso concedido a krea/Krea-2-Turbo para poder ejecutarlo |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto. El autor describe explicitamente este lanzamiento como una fusion, no como una ejecucion de entrenamiento desde cero. El procedimiento, implementado en `universal_merge.py`, trabaja en el espacio de deltas de pesos en cuatro pasos: primero reconstruye el delta real de cada adaptador por modulo (`ΔW = B·A` para LoRA y `ΔW = kron(w1, w2)` para LoKR); despues normaliza las distintas convenciones de nombres de claves para alinear todos los modulos en un espacio canonico; a continuacion mezcla los deltas como suma ponderada (`ΔW = Σ wᵢ·ΔWᵢ`) con pesos iguales; y por ultimo vuelve a factorizar el delta combinado en un unico LoRA de bajo rango mediante SVD truncada a rank 128, con un presupuesto de error de reconstruccion medido.

Se trata por tanto de una compresion de muchos a uno y con perdida por diseno, que conserva las direcciones singulares dominantes de realismo. El procesado es modulo a modulo para que los deltas de Kronecker grandes no excedan el presupuesto de VRAM. El resultado es un unico adaptador portable en fp16 con rank 128 y claves compatibles con musubi-tuner. La model card menciona, en el comando de ejemplo de musubi-tuner, un VAE `qwen_image_vae.safetensors` y un text encoder `qwen3vl_4b_bf16.safetensors`, pero no se especifican detalles adicionales de la arquitectura DiT del modelo base ni el volumen o la composicion de datos de entrenamiento de los adaptadores originales.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts descriptivos en lenguaje natural, sin palabra de activacion.
- Aplicacion de una direccion de realismo combinada procedente de varios adaptadores, en un solo fichero.
- Composicion de escenas cotidianas y retratos: los ejemplos publicados incluyen campos de girasoles a la hora dorada, cocinas con luz de ventana, surfistas al amanecer, retratos en el metro, musica callejera nocturna o lluvia sobre asfalto.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers (requiere instalar diffusers desde el repositorio fuente).
- Compatibilidad con musubi-tuner mediante el parametro `--lora_weight` y `--lora_multiplier`.
- Ajuste de intensidad del efecto mediante escala de LoRA entre 1.0 y 1.3.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; no aplican a un adaptador de generacion de imagen.
- No se documenta soporte multilingue de prompts; todos los ejemplos estan en ingles.

## Casos de uso

- Generacion de fotografia sintetica de producto: con prompts descriptivos y sin palabra clave, el adaptador empuja el resultado hacia un acabado fotografico, util para catalogos y pruebas de concepto con la resolucion recomendada de 1024×1280.
- Retrato editorial y avatares: los ejemplos de retrato en el metro o de manos arrugadas trabajando la masa sugieren un comportamiento razonable en piel y texturas, adecuado para maquetas editoriales.
- Creacion de fondos y escenarios realistas: escenas como lluvia con taxi o banco de parque en otono sirven para generar plate backgrounds en preproduccion audiovisual.
- Prototipado rapido en pipelines de difusion: el adaptador se carga con `load_lora_weights` sobre `Krea2Pipeline` en bf16, lo que permite integrarlo en scripts de generacion por lotes sin apilar varios adaptadores.
- Iteracion con musubi-tuner: al exponerse con claves `lora_unet_*`, se puede usar en flujos de generacion locales con control explicito de pasos (8), guidance (0-1) y μ (1.15).
- Consolidacion de bibliotecas de adaptadores: el metodo de fusion permite a un equipo reducir N adaptadores de realismo en formatos mixtos a un unico fichero de 0,9 GB, simplificando el despliegue y el versionado.
- Ajuste de intensidad estilistica: con escala 1.0-1.3 se puede calibrar cuanto realismo se aplica segun el tipo de encargo, desde un acabado mas suave hasta un empuje fotografico mas marcado.
- Comparacion de metodos de merge: util como referencia tecnica para quien quiera reproducir el pipeline de SVD truncada en su propio conjunto de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones de preferencia humana ni comparativas numericas frente a otros adaptadores); unicamente presenta una galeria cualitativa de ocho imagenes de muestra generadas con escala 1.3, 8 pasos, guidance 1 y μ 1.15.

## Requisitos de hardware

- VRAM estimada para el adaptador: alrededor de 0,9 GB en fp16, correspondientes al tamano del repositorio.
- VRAM del modelo base: no disponible en la informacion proporcionada; es necesario consultar la ficha de krea/Krea-2-Turbo. Como el adaptador se carga junto al pipeline completo en bf16, el requisito dominante es el del modelo base, no el del LoRA.
- GPU recomendadas: no disponibles. La model card solo menciona `torch_dtype=torch.bfloat16` y `.to("cuda")`.
- Compatibilidad con GPU de consumo: no confirmada por el autor; depende enteramente de si Krea-2-Turbo cabe en la GPU en cuestion.
- Opciones de despliegue: diffusers (`Krea2Pipeline`, instalado desde el repositorio fuente de HuggingFace) y musubi-tuner (`krea2_generate_image.py`). No se mencionan vLLM, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se sabe que la configuracion recomendada usa solo 8 pasos de inferencia, lo que reduce el coste frente a configuraciones tipicas de mas pasos.
- Componentes auxiliares citados en el ejemplo de musubi-tuner: `turbo.safetensors` (DiT), `qwen_image_vae.safetensors` (VAE) y `qwen3vl_4b_bf16.safetensors` (text encoder).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| badaramoni/Krea-2-Realism-Fusion | LoRA de realismo (rank 128) | no disponible | no aplica | krea-2-community-license | Publico, requiere acceso a Krea-2-Turbo |
| krea/Krea-2-Turbo | Modelo base texto-a-imagen | no disponible | no disponible | krea-2-community-license | Modelo base sobre el que se aplica |
| Otros adaptadores LoRA de realismo para Krea 2 | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de fichas tecnicas de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros adaptadores de realismo.

## Limitaciones y advertencias

- Es una fusion con perdida por diseno: la refactorizacion mediante SVD truncada a rank 128 descarta direcciones singulares, de modo que el adaptador no reproduce exactamente la suma de los adaptadores originales.
- No hay entrenamiento ni ajuste fino detras; la calidad depende por completo de la calidad y la compatibilidad de los adaptadores de origen, que no se listan en la model card.
- La licencia es krea-2-community-license, no una licencia permisiva estandar. Cualquier uso comercial debe revisarse contra los terminos de krea/Krea-2-Turbo, y es obligatorio tener acceso a ese modelo base.
- El autor no documenta sesgos, composicion de datos ni procedencia de los adaptadores fusionados, lo que dificulta evaluar riesgos de representacion o contenido.
- Riesgo de alucinacion visual y artefactos inherente a los modelos de difusion; no hay evaluacion publicada que lo cuantifique.
- No se documentan idiomas soportados; los ejemplos estan en ingles y no hay garantia de comportamiento equivalente en otros idiomas.
- No se ofrecen variantes cuantizadas, por lo que no hay opciones para entornos con VRAM muy limitada mas alla del modelo base en bf16.
- Modelo practicamente sin validacion: 0 descargas y 1 like en el momento de la ficha. No hay pruebas independientes de que funcione como se describe.
- Los prompts deben ser frases descriptivas naturales; no existe palabra de activacion y forzar palabras clave de estilo puede alterar el resultado previsto.
- La fecha de creacion indicada (11 de septiembre de 2026) es posterior a la de redaccion de muchas fichas de referencia; conviene verificar la vigencia del repositorio y del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/badaramoni/Krea-2-Realism-Fusion
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2 Community License (referenciada desde la ficha del modelo base): https://huggingface.co/krea/Krea-2-Turbo
- Script del metodo de fusion: `universal_merge.py` (incluido en el repositorio del modelo)
- Pesos: `badaramoni_krea2_realism_fusion_r128_fp16.safetensors` (rank 128, fp16, claves `lora_unet_*`)
- Ejemplos de imagen: carpeta `samples/` del repositorio (01_sunflowers.png a 08_subway.png)
- Repositorio de diffusers: https://github.com/huggingface/diffusers
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de parroquias catolicas en Alemania), por lo que no se han podido incorporar enlaces adicionales relevantes.
