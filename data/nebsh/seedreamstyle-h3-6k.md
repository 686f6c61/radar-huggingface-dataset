# Nebsh/Seedreamstyle-H3-6K

## Resumen

Seedreamstyle-H3-6K es un adaptador LoRA de estilo fotografico entrenado sobre el modelo de generacion de imagenes MiniMax H3 Image. Lo desarrolla el usuario Nebsh y su objetivo es trasladar a H3 el aspecto cinematografico de Seedream 5.5 (contraste, iluminacion practica y grano fotografico) en escenas con personas: retratos, conversaciones, distintas edades y entornos con luz natural o artificial. No es un modelo base, sino un complemento que se carga junto al checkpoint de MiniMax H3 Image.

El adaptador se entreno hasta el paso global 6.000, con un rango LoRA de 16 y alpha 16, sobre un dataset de continuacion congelado de 1.134 pares imagen/caption a aproximadamente 1 megapixel y con buckets por relacion de aspecto. El repositorio ocupa 0,3 GB y contiene un unico archivo safetensors, ademas de la galeria comparativa de veinte escenas.

Es relevante para quien ya trabaja con MiniMax H3 Image en ComfyUI y quiere un acabado fotografico concreto sin cambiar de modelo base. La licencia es la MiniMax H3 Image Community License Agreement, no una licencia abierta estandar, lo que condiciona el uso comercial y la redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion MiniMax H3 Image |
| Parametros totales | no disponible (repo de 0,3 GB; rango LoRA 16, alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image) |
| Tipos de cuantizacion | no disponible; probado con checkpoint `minimax_h3_image_pruned_int8_convrot.safetensors` |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (`Seedreamstyle_H3_Resume_6K.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un LoRA, no de un transformer completo: un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base MiniMax H3 Image. El rango y el alpha son ambos 16, lo que da una capacidad de adaptacion moderada, adecuada para un ajuste de estilo y no para reaprender contenido. El entrenamiento se realizo con el optimizador Automagic3, learning rate 0,00028, EMA 0,98, batch 1 y acumulacion 1.

El entrenamiento alcanzo el paso global 6.000, con una fase de continuacion de 2.000 a 6.000 (4.000 pasos adicionales) sobre un dataset congelado de 1.134 pares imagen/caption, incluidos los 43 originales. La resolucion objetivo fue de aproximadamente 1 megapixel con buckets por relacion de aspecto. Las imagenes de referencia del dataset fueron aportadas por dos colaboradores (47 y alrededor de 100 imagenes). No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, ya que el objeto es un adaptador de estilo para generacion de imagen.

## Capacidades

- Aplicacion de un estilo fotografico cinematografico tipo Seedream 5.5 sobre generaciones de MiniMax H3 Image.
- Renderizado de retratos y escenas con personas: parejas, conversaciones, distintas edades, planos de cintura para arriba y escenas ambientales.
- Iluminacion practica y mixta: luz de ventana, lamparas de mesa, neon, luz de tormenta.
- Textura de piel natural y grano fotografico contenido.
- Control mediante trigger word `seedreamstyle.` al inicio del prompt.
- Compatible con el flujo de ComfyUI (LoRA Loader, modo Model Only) y con el nodo `MiniMaxH3PromptWeight` de KJ.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o video: es exclusivamente text-to-image.

## Casos de uso

- Retrato editorial: usar el trigger `seedreamstyle.` con una descripcion de plano y luz para obtener retratos con grano y contraste de aspecto cinematografico, utiles en publicaciones y portfolios.
- Storytelling visual de escenas cotidianas: generar conversaciones en interiores (veranda, cocina, sala de espera) con iluminacion mixta coherente, aprovechando el entrenamiento sobre escenas con personas.
- Previsualizacion de iluminacion para fotografia o cine: generar referencias de luz practica (lampara calida frente a luz fria de ventana) antes de un rodaje.
- Contenido para redes y campanas: producir imagenes de estilo fotografico con semilla fija y receta LCM (6 pasos, CFG 1, scheduler simple) para iterar rapido en ComfyUI.
- Comparacion de estilos en investigacion: usar la galeria de veinte escenas y el manifiesto de comparacion para evaluar la deriva de estilo entre 2.000 y 6.000 pasos frente a Seedream 5.5.
- Generacion de variantes con control de semilla: mantener descripciones y semillas numericas para reproducir composiciones y medir el efecto del adaptador frente al modelo base sin LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. La model card incluye una galeria comparativa cualitativa de veinte escenas con cuatro variantes por tablero (sin LoRA, LoRA 2.000 pasos, LoRA 6.000 pasos y Seedream 5.5), generadas a 8448 x 4736 (~40 MP) para H3 y 2736 x 1536 (2K nativo) para Seedream 5.5. El propio autor advierte que la comparacion evalua apariencia e interpretacion del prompt, no detalle a resolucion emparejada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el LoRA; depende del checkpoint base MiniMax H3 Image. El adaptador anade una sobrecarga minima (repo de 0,3 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el checkpoint probado es una version int8 podada, lo que sugiere que el autor busco reducir requisitos, pero no se documentan cifras.
- Opciones de despliegue: ComfyUI con LoRA Loader (Model Only), checkpoint `minimax_h3_image_pruned_int8_convrot.safetensors`, receta LCM con 6 pasos, CFG 1 y scheduler simple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Estilo objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seedreamstyle-H3-6K | LoRA de estilo | MiniMax H3 Image | Fotografico cinematografico tipo Seedream 5.5 | MiniMax H3 Image Community License | Hugging Face (Nebsh) |
| MiniMax H3 Image (sin LoRA) | Modelo base text-to-image | — | Generico | MiniMax H3 Image Community License | Hugging Face (MiniMaxAI) |
| Seedream 5.5 | Modelo cerrado text-to-image | — | Fotografico cinematografico | Propietaria | Comfy Cloud |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica entre estas opciones.

## Limitaciones y advertencias

- Es un adaptador de estilo, no un modelo autonomo: requiere el checkpoint base MiniMax H3 Image y no funciona por si solo.
- Solo soporta prompts en ingles segun la metadata del repositorio.
- Entrenado sobre un dataset relativamente pequeno (1.134 pares), lo que puede limitar la generalizacion a escenas muy distintas de las de entrenamiento.
- La galeria incluye regeneraciones posteriores en las escenas 10, 14 y 15 (cambios de descripcion de sujeto y cierre de ventanas), lo que indica sensibilidad a la formulacion del prompt y posibles sesgos en la representacion de personas.
- Riesgo de alucinacion visual: el LoRA puede introducir elementos de estilo no solicitados o alterar detalles de la escena.
- Licencia MiniMax H3 Image Community License Agreement: no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial o redistribucion.
- El autor advierte que las comparaciones con Seedream 5.5 no son un benchmark de detalle a resolucion emparejada y que semillas identicas entre modelos no implican composiciones identicas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Galeria independiente: Gallery.html (incluida en el repositorio)
- Descarga de la galeria: Comparison_Gallery.zip (incluida en el repositorio)
- Manifiesto de comparacion: comparison_manifest.json (incluido en el repositorio)
- Publicacion de la comunidad: Discord_post.txt (incluido en el repositorio)
