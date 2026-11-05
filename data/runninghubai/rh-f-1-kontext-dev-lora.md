# RunningHubAI/rh-f.1-kontext-dev-lora

## Resumen

`rh-f.1-kontext-dev-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo base completo, sino de un conjunto de pesos adicionales (292 MiB en un unico fichero `safetensors`) que se aplica sobre un modelo de difusion subyacente para modificar su comportamiento en una tarea concreta. En este caso, el adaptador esta orientado a la mejora de definicion y al reescalado (upscaling) de imagenes, segun la descripcion de la model card.

El adaptador se ha afinado a partir de un modelo identificado en la documentacion como "F1基础-Kontext" (F1 base-Kontext), presumiblemente una variante del modelo FLUX.1 Kontext orientada a edicion de imagen guiada por texto. La pipeline declarada es `image-text-to-image`, lo que encaja con un flujo de edicion donde se parte de una imagen de entrada y una instruccion textual. El repositorio esta pensado para cargarse en ComfyUI o en la plataforma RunningHub, y no incluye pesos del modelo base.

La relevancia de esta ficha es limitada pero concreta: se trata de un recurso practico para quienes ya trabajan con FLUX.1 Kontext en ComfyUI y quieren anadir una etapa de mejora de nitidez sin cambiar de pipeline. No hay informacion publica sobre datos de entrenamiento, composicion del dataset ni evaluacion cuantitativa, por lo que la ficha se limita a documentar lo que el autor declara y a marcar explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion de edicion de imagen (base declarada: "F1基础-Kontext") |
| Parametros totales | no disponible (el fichero de pesos ocupa 292 MiB en `safetensors`) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion en el sentido de LLM) |
| Tipos de cuantizacion | no disponible; el unico fichero publicado es `safetensors` (sin variantes GGUF/FP8 declaradas) |
| Idiomas soportados | no disponible (la model card esta en ingles y chino, pero no se declara cobertura linguistica del prompt) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" |
| Formato de pesos | `safetensors` (fichero `F.1_Kontext_Dev_LoRA_一键图片高清修复_v1.0.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para desplazar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es "F1基础-Kontext", que por nomenclatura y por la pipeline `image-text-to-image` apunta a la familia FLUX.1 Kontext, un transformer de difusion (DiT) para edicion de imagen condicionada por texto. No se especifica sobre que capas se ha aplicado el LoRA, ni el rango, ni el alpha utilizado.

No hay informacion publica sobre el dataset de entrenamiento: ni numero de pares imagen-texto, ni resolucion, ni si se ha usado captions sinteticos, ni si ha habido etapas de filtrado. La model card solo declara la tarea ("HD enhancement and magnification"), los parametros de inferencia recomendados (20 pasos de iteracion, CFG scale 2.5) y una palabra de activacion (`improve clarity,`). Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), lo cual es esperable en un adaptador de este tipo.

## Capacidades

- Edicion de imagen guiada por texto: recibe una imagen y un prompt, y devuelve una version modificada. En este adaptador, la modificacion esperada es la mejora de definicion y el aumento de resolucion aparente.
- Mejora de nitidez y reescalado ("HD enhancement and magnification"), segun la descripcion del autor.
- Activacion mediante la palabra clave `improve clarity,` en el prompt.
- Integracion en ComfyUI como nodo LoRA sobre el modelo base Kontext.
- Ejecucion en la plataforma RunningHub, incluyendo su API.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o video.
- No se declara cobertura multilingue del prompt; la unica palabra de activacion documentada esta en ingles.

## Casos de uso

- Restauracion de fotografia de producto: aplicar el LoRA sobre imagenes de catalogo con iluminacion correcta pero baja nitidez, usando el prompt `improve clarity,` para obtener una version mas definida antes de publicar en e-commerce.
- Preparacion de material para impresion: reescalar ilustraciones o renders de baja resolucion a una resolucion mayor manteniendo el estilo, dentro de un flujo ComfyUI con el modelo Kontext como base.
- Limpieza de capturas y screenshots: mejorar la legibilidad de imagenes de interfaz o diagramas tecnicos que se van a incluir en documentacion, aprovechando que el LoRA esta orientado a definicion y no a cambios semanticos.
- Postprocesado en pipelines de generacion: encadenar el LoRA despues de una etapa de generacion o edicion con Kontext para recuperar detalle perdido tras un downscale intermedio.
- Prototipado rapido en RunningHub: probar el efecto del adaptador via la API o la interfaz web de RunningHub antes de integrarlo en un flujo propio, sin necesidad de montar infraestructura local.
- Aumento de resolucion en archivos historicos digitalizados: aplicar el LoRA sobre escaneos con ruido moderado para mejorar la percepcion de detalle antes de un proceso de OCR o catalogacion.
- Iteracion de estilo en estudios de diseno: usar el adaptador como paso final de un flujo de edicion Kontext para uniformar la nitidez entre distintas imagenes de una misma campana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si; el consumo vendra determinado por el modelo base Kontext que se cargue. El fichero LoRA ocupa 292 MiB en disco y se suma a la memoria del modelo base en tiempo de carga.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al depender de FLUX.1 Kontext, en la practica se requiere una GPU con suficiente VRAM para el modelo base; no se confirma en la model card.
- Cabe en GPU de consumo: no confirmado. El adaptador por si solo es pequeno, pero el modelo base Kontext condiciona el requisito real.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado) y API de RunningHub (declarado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. Los unicos parametros de inferencia declarados son 20 pasos y CFG scale 2.5.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-f.1-kontext-dev-lora | LoRA sobre Kontext (edicion de imagen) | no disponible (292 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| FLUX.1 Kontext (modelo base de referencia) | Modelo de difusion de edicion de imagen | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas LoRA de upscaling para Kontext | LoRA | no disponible | no aplica | variable | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa se limita a identificar la categoria y el modelo base declarado.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita. La model card remite a la licencia del proyecto original o del upstream, lo que obliga a verificar la licencia de FLUX.1 Kontext antes de cualquier uso comercial.
- No hay informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos de genero, etnia, estilo o composicion.
- Riesgo de alucinacion visual: como cualquier adaptador de difusion orientado a "mejorar claridad", puede inventar texturas o detalles que no estaban en la imagen original, especialmente en zonas con ruido o baja senal.
- El adaptador no es autonomo: requiere el modelo base Kontext y, segun la model card, esta pensado para ComfyUI o RunningHub. No se documenta compatibilidad con otras plataformas.
- La palabra de activacion (`improve clarity,`) esta en ingles; no se declara comportamiento con prompts en castellano ni en otros idiomas.
- Los parametros de inferencia recomendados (20 pasos, CFG 2.5) son los unicos publicados; desviarse de ellos puede degradar el resultado y no hay guia sobre rangos validos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-05), lo que indica ausencia de validacion comunitaria.
- El nombre del fichero de pesos incluye caracteres chinos, lo que puede causar problemas en algunos entornos de carga o scripts que no manejen UTF-8 correctamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-f.1-kontext-dev-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1960030719894564866
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1892822133263990786
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-f.1-kontext-dev-lora/blob/main/README_cn.md
