# raspie/gemma4-tipo-lora-image-30k

## Resumen

Gemma TIPO Image 30K es un adaptador LoRA experimental publicado por el usuario raspie sobre el modelo `p-e-w/gemma-4-E2B-it-heretic-ara`. Su proposito no es generar imagenes ni mantener conversaciones, sino extraer etiquetas (tags) a partir de una imagen de entrada para reutilizarlas como prompt en flujos de generacion grafica. El adaptador pesa aproximadamente 45,3 MiB y se distribuye como opcion con nombre `tipo_lora=image-30k` dentro del node pack de ComfyUI "RS-Seasonal-Prompt-Generator".

Se entrenó una sola vez sobre 30.000 casos base de imagen más 3.000 filas auxiliares (33.000 filas en total). El ajuste afecta unicamente a la parte de lenguaje con rango 8 / alpha 16, dejando congelados el modulo de vision, las PLE (Per-Layer Embeddings) y los embeddings de tokens. El modelo esta claramente orientado a anime, ilustracion y graficos estilizados, y el propio autor recomienda dejar la generacion de lenguaje natural al Gemma base original.

Es relevante ahora como ejemplo de adaptador pequeno y muy especializado para anotacion automatica de imagenes en pipelines de difusion, pero se presenta explicitamente como experimental: los resultados pueden ser incorrectos, no coincidir con el gusto del usuario y presentar confusiones de genero, longitud de pelo o nombres de autor, personaje u obra. El propio autor pide revisar y editar la salida antes de generar imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal Gemma 4 con vision encoder y PLE; vision, PLE y embeddings de tokens congelados |
| Parametros totales | No disponible (adaptador LoRA de ~45,3 MiB; el modelo base es Gemma 4 E2B, sin cifra oficial publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ruta Q4 (`model_source=heretic_ara_q4`) y BF16 nativo (~9,57 GiB); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | Coreano (ko), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `p-e-w/gemma-4-E2B-it-heretic-ara` en una revision fija (`c9a1d4c031981f14d86eeb0c7d87de7fafd34513`), que a su vez es una derivacion Heretic ARA del modelo Gemma original de Google. El componente entrenado es exclusivamente la parte de lenguaje mediante LoRA de rango 8 y alpha 16; los pesos de vision, las PLE y los embeddings de tokens permanecen congelados, de modo que la capacidad de percibir la imagen recae integramente en el modelo base y la LoRA aprende a traducir esa percepcion a vocabulario de etiquetas.

El entrenamiento consistio en una unica pasada sobre 30.000 casos base de imagen mas 3.000 filas auxiliares, lo que suma 33.000 filas. No se han publicado detalles sobre el numero de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO. El autor indica que el material de entrenamiento esta centrado en Danbooru/단보루, por lo que no garantiza cobertura completa del vocabulario de e621 ni completitud de traduccion multilingue. No existe entrenamiento continuado automatico y no se publican las imagenes ni los tags originales empleados.

## Capacidades

- Extraccion de etiquetas de imagen orientada a prompts de generacion, con foco en anime, ilustracion y graficos estilizados.
- Salida en dos formatos configurables: solo etiquetas (`output_format=tags`) o prosa mas etiquetas (`output_format=both`).
- Modo `tipo_lora_scope=tags_only`, en el que el Gemma base redacta la escena en lenguaje natural y la LoRA la convierte en etiquetas.
- Procesamiento de imagenes e instrucciones en coreano, ingles y japones.
- Integracion nativa con ComfyUI mediante los nodos "Gemma Prompt Expander Native" y "Gemma TIPO Native".
- Soporte de imagenes de referencia VRS como contexto adicional (con riesgo de mezclar caracteristicas).
- No soporta tool calling, function calling ni razonamiento agente multi-paso; no es un modelo de proposito general.

## Casos de uso

- Etiquetado automatico de imagenes anime o ilustracion para reutilizar sus tags como prompt en ComfyUI: el nodo selecciona `tipo_lora=image-30k` y devuelve etiquetas listas para pegar en el prompt de un modelo de difusion.
- Enriquecimiento de datasets de entrenamiento de LoRA de difusion: anotar lotes de imagenes con tags coherentes antes de curar el dataset, revisando manualmente la salida por las confusiones documentadas.
- Flujos de img2img o controlnet guiados por tags: extraer primero las etiquetas de una imagen de referencia y usarlas para condicionar una nueva generacion estilizada.
- Generacion combinada de descripcion y tags: con `output_format=both` y `tipo_lora_scope=tags_only`, el Gemma base describe la escena en prosa y la LoRA aporta la version en etiquetas, util para documentar prompts de forma legible.
- Catalogacion y busqueda en bibliotecas personales de ilustracion: poblar metadatos de tags para recuperacion posterior, siempre con una fase de validacion dado que el autor descarta que sea un identificador fiable de caracteres o autores.
- Filtrado o sustitucion de tags no deseados en produccion: combinado con nodos de `ban_tags`, aunque el autor advierte que la eliminacion de cadenas exactas no resuelve conflictos semanticos.
- Prototipado de asistentes de prompt para artistas que trabajen en japones o coreano: las tres lenguas declaradas cubren peticiones en esos idiomas, si bien el rendimiento medido se concentro en peticiones coreanas.

## Benchmarks y rendimiento

El autor publica una comparacion sobre 24 imagenes de desarrollo de ComfyUI en ruta Q4 y con condiciones identicas:

| Metrica | Original | Candidato previo (3.000) | Image 30K |
|---|---:|---:|---:|
| F1 medio frente a tags de PixAI | 0,141 | 0,271 | 0,352 |
| Omisiones de nombre de entrada (sobre 93) | 10 | 17 | 2 |
| Salidas vacias (sobre 24 imagenes) | 0 | 0 | 0 |

El propio autor subraya que este F1 mide la coincidencia con los tags generados por PixAI y no equivale a un 35,2 % de precision en evaluacion humana. En peticiones centradas en coreano (12 casos) las omisiones de tags obligatorios pasaron de 17 (con el candidato de 3.000) a 18 (con el de 30.000), mientras que las omisiones de nombre especificado pasaron de 0 a 3. Con referencia VRS (6 casos) se mantenian 3 omisiones de nombre y 2 peticiones con tags en conflicto. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. El autor indica que no se uso el conjunto de evaluacion separado definitivo y que solo publica resultados sobre material de desarrollo limitado.

## Requisitos de hardware

- VRAM: el adaptador LoRA ocupa solo ~45,3 MiB, pero la inferencia requiere cargar el Gemma completo. El autor no fija un minimo medido; que remite a hardware del nivel de 16 GB de VRAM.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti, ambas de 16 GB, fueron los equipos de validacion. Se recomienda una GPU NVIDIA CUDA de esa gama.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB del tipo citado; no se ha validado el funcionamiento en GPUs de 8 GB, CPU, AMD ni Apple.
- RAM: 32 GB o mas como criterio comodo, no como minimo medido. Si se comparte con otros modelos de generacion o VRS puede necesitar mas.
- Tamano en disco: ruta Q4 con texto y tokenizer ~3,22 GiB; con vision ~4,14 GiB; mas ~45,3 MiB del adaptador. El modelo BF16 nativo conectado es de ~9,57 GiB. Estos valores son de disco, no de VRAM.
- Despliegue: node pack "RS-Seasonal-Prompt-Generator" en ComfyUI, seleccionando `model_source=heretic_ara_q4` y `tipo_lora=image-30k`. No requiere llama.cpp, PEFT ni Transformers para la ruta Q4.
- Latencia: en Linux con RTX 5060 Ti, sobre 24 imagenes, la mediana del tiempo por llamada al nodo fue de aproximadamente 36 segundos, con un rango de 16 a 126 segundos. Depende de la longitud de salida, la carga y de otras tareas concurrentes.
- Advertencia: el modo de doble salida (prosa mas tags) duplica el trabajo respecto a generar solo etiquetas. Compartir memoria con modelos de generacion de imagen puede provocar OOM u offload a CPU con la consiguiente latencia.

## Comparativa con modelos similares

No hay modelos publicos directamente equivalentes identificados en la informacion disponible. La comparacion mas util es contra el propio ecosistema del autor:

| Modelo | Tipo | Datos de entrenamiento | F1 vs. PixAI | Omisiones de nombre | Licencia |
|---|---|---|---|---|---|
| `p-e-w/gemma-4-E2B-it-heretic-ara` (base) | Gemma multimodal sin adaptador | No aplica | 0,141 | 10 / 93 | No disponible en la informacion |
| Candidato previo (~3.000 imagenes) | LoRA interno | 3.000 imagenes, experimento interno no publicado | 0,271 | 17 / 93 | No disponible |
| `raspie/gemma4-tipo-lora-image-30k` | LoRA PEFT | 30.000 + 3.000 = 33.000 filas | 0,352 | 2 / 93 | Apache 2.0 |

El autor aclara que el candidato previo de 3.000 corresponde a un experimento interno distinto de los pilotos publicos `pilot-001/002`. No se dispone de comparativas frente a otros taggers de la comunidad en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo declarado explicitamente como experimental por el autor; no garantiza que la salida coincida con la imagen ni con la instruccion.
- No es un tagger de referencia automatica fiable ni un identificador de personajes o autores; puede omitir el nombre solicitado (0 a 3 omisiones en las pruebas coreanas, 3 adicionales con VRS).
- Errores observados en salidas reales: cambio de pelo corto a pelo largo, adicion de tags masculinos sobre una figura femenina, y omision de autor, personaje u obra especificados.
- La F1 de 0,352 frente a tags de PixAI no implica un nivel equivalente de precision humana.
- Entrenado sobre material centrado en Danbooru; no garantiza cobertura del vocabulario completo de e621 ni traduccion multilingue completa.
- Puede producir etiquetas de contenido adulto, ya que el dominio de entrenamiento incluye esa area de tags.
- La eliminacion exacta de cadenas con `ban_tags` no resuelve conflictos semanticos entre tags.
- El uso de imagenes de referencia VRS puede contaminar la salida con caracteristicas de la referencia.
- En el modo `both` solo se ha validado la aplicacion de la LoRA a la fase de tags; la mejora de la prosa no esta demostrada y una mala interpretacion del Gemma base puede propagarse a los tags.
- Limitaciones de contexto e idioma no declaradas numericamente; solo se listan coreano, ingles y japones, sin datos de rendimiento por lengua.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base `p-e-w/gemma-4-E2B-it-heretic-ara` tiene su propia licencia no detallada aqui y debe verificarse por separado.
- No se publican las imagenes, tags originales, prompts ni textos de evaluacion, solo el adaptador, la configuracion, la documentacion y los resumenes agregados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/raspie/gemma4-tipo-lora-image-30k
- Modelo base en HuggingFace: https://huggingface.co/p-e-w/gemma-4-E2B-it-heretic-ara
- Repositorio del node pack: https://github.com/raspie10032/RS-Seasonal-Prompt-Generator
- README en coreano: https://github.com/raspie10032/RS-Seasonal-Prompt-Generator/blob/main/README_KOR.md
- README en ingles: https://github.com/raspie10032/RS-Seasonal-Prompt-Generator/blob/main/README.md
- Instalacion Q4: https://github.com/raspie10032/RS-Seasonal-Prompt-Generator/blob/main/GGUF_NATIVE.md
- Ejemplo de API de etiquetado de imagen: https://github.com/raspie10032/RS-Seasonal-Prompt-Generator/blob/main/examples/gemma-image-30k.api.json
