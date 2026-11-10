# divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16

## Resumen

Muse-Glimmer-30B-Abliterated-MM-bf16 es una variante multimodal del modelo Muse-Glimmer-30B de Meta, convertida a MLX y publicada por el usuario divinetribe. Se trata de un ajuste de tipo "abliterated": se ha eliminado la direccion de rechazo (refusal direction) del modelo mediante ablacion direccional siguiendo el metodo de Arditi et al., de modo que el modelo deja de emitir respuestas de negativa ante peticiones que el modelo base rechazaria. La variante conserva intacto el torre de vision, por lo que mantiene la capacidad de comprension de imagenes ademas de la generacion de texto.

El modelo base es la conversion a MLX de Muse-Glimmer-30B (mlx-community/Muse-Glimmer-30B-bf16), con aproximadamente 29.776 millones de parametros en formato bf16 y un tamano de repositorio de 59,6 GB. La arquitectura combina un transformer de lenguaje con un ViT de 50 capas al estilo Qwen2.5-VL (2D-RoPE, atencion por ventanas y completa, fusion espacial 2x2), un adaptador GELU y una proyeccion hacia el flujo de texto que se inserta en el token de imagen.

Su relevancia actual radica en dos factores: es, segun el autor, el primer modelo multimodal abliterated que funciona sobre Apple MLX, y se integra en el ecosistema de mlx-vlm (soporte nativo del modelo `muse_glimmer`), lo que permite ejecutar comprension de imagen y texto de forma totalmente local en hardware Apple Silicon de gran memoria. Esta pensado para investigacion y para usuarios que necesitan un asistente sin restricciones de rechazo en su propio hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje + ViT de 50 capas (estilo Qwen2.5-VL, 2D-RoPE, atencion ventana/completa, fusion espacial 2x2) + adaptador GELU + proyeccion al flujo de texto |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unica publicada en este repo); no se detallan otras |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a la licencia del modelo base) |
| Formato de pesos | safetensors (bf16, 1.436 tensores), para MLX |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal. El componente de vision es un ViT de 50 capas con RoPE bidimensional, atencion por ventanas combinada con atencion completa y fusion espacial 2x2, seguido de un adaptador GELU y una proyeccion que inyecta las representaciones visuales en el flujo de tokens de texto en la posicion del token de imagen. El componente de lenguaje es el transformer de Muse-Glimmer-30B. El repositorio contiene 1.436 tensores, con el torre de vision, el adaptador y la proyeccion intactos.

La intervencion de abliteracion se aplico unicamente a los pesos de lenguaje: se calculo la direccion de rechazo en la capa 26 mediante la diferencia de medias sobre prompts daninos y no daninos, y se ortogonalizo dicha direccion fuera de `embed_tokens`, de cada `self_attn.o_proj` y de cada `mlp.down_proj`. El torre de vision no se modifico. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La plantilla de chat termina el prompt de generacion en `assistant to=user<|message|>` para que el modelo responda directamente en lugar de emitir su propio canal de razonamiento.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes: reconocimiento de objetos, identificacion fine-grained (por ejemplo, distinguir el modelo exacto de un coche por la forma del aleron con el emblema difuminado), reconocimiento de monumentos y localizaciones (por ejemplo, situar el Taj Mahal en Agra).
- OCR en escenas reales (lectura de rotulos como "1501 BROADWAY" en un escaparate).
- Lectura e interpretacion de graficos (extraccion de valores de un grafico de barras, por ejemplo Q4 = 73 M).
- Respuestas sin comportamiento de rechazo por defecto (abliterated), orientado a investigacion y uso sin restricciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modelo se menciona como uno de los "fighters" del proyecto Claude Code Local, pero no se detallan capacidades agenticas propias).
- Capacidades multilingues: no disponible.
- Modo thinking explicito: la plantilla de chat suprime el canal de razonamiento para forzar respuesta directa.

## Casos de uso

- Asistente local de vision en Apple Silicon: cargar el modelo con mlx-vlm y procesar imagenes junto con preguntas en lenguaje natural, aprovechando que los pesos bf16 caben en maquinas Apple de gran memoria (unos 60 GB).
- Identificacion fine-grained de productos o vehiculos: usar el modelo para distinguir variantes concretas a partir de detalles visuales (alerones, formas, insignias), util en catalogacion de inventario o tasacion.
- OCR de escenas reales: extraer texto de fotografias de escaparates, senaletica o documentos fotografiados en entornos no controlados.
- Lectura de graficos y tablas en imagen: convertir graficos de barras o dashboards fotografiados en valores numericos para su posterior procesamiento.
- Investigacion sobre alineacion y seguridad: estudiar el efecto de la ablacion direccional comparando este modelo con su base no abliterated en tareas de rechazo y utilidad.
- Prototipado de asistentes sin restricciones en hardware propio: entornos de investigacion o desarrollo que requieran un asistente local sin filtros de negativa, con la responsabilidad legal que ello implica.
- Integracion en pipelines de agentes locales: el modelo figura como opcion en el proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX, por lo que puede servir como modelo de vision en flujos de trabajo on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 60 GB en bf16 (tamano del repositorio de 59,6 GB); se requiere una maquina Apple Silicon de gran memoria.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (el autor indica "large-memory Apple Silicon machine"); no se especifican modelos concretos de chip.
- Cabe en GPU consumer: no en GPUs consumer convencionales por el tamano en bf16; la via prevista es Apple Silicon con memoria unificada amplia.
- Opciones de despliegue: mlx-vlm (soporte nativo del modelo `muse_glimmer`, a partir de la version que incluya el PR #1838); el proyecto Claude Code Local ofrece un servidor local compatible con la API de Anthropic sobre MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Abliterated | Formato/plataforma | Licencia |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MM-bf16 | ~29,8 B | no disponible | Si (ViT 50 capas) | Si | MLX bf16 | other |
| mlx-community/Muse-Glimmer-30B-bf16 (base) | ~29,8 B | no disponible | Si | No | MLX bf16 | segun modelo base |
| Otros modelos abliterated multimodales en MLX | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo: el modelo puede producir contenido danino, ilegal o inseguro sin negarse. El uso es responsabilidad exclusiva del usuario.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; las capacidades de identificacion fine-grained y OCR descritas en la model card son demostraciones cualitativas, no resultados medidos.
- La licencia es "other" y esta sujeta a la licencia del modelo base de Meta; es imprescindible revisar los terminos del modelo original antes de cualquier uso comercial.
- Solo se publican pesos en bf16 para MLX: no hay variantes cuantizadas en este repositorio, lo que limita el despliegue a equipos con memoria abundante.
- No se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en produccion.
- La ablacion se aplico solo a los pesos de lenguaje; el torre de vision no se modifico, por lo que el comportamiento multimodal puede conservar sesgos del modelo base.
- El modelo se distribuye con muy poca traccion (3 likes, 1.135 descargas en el momento de la consulta) y sin documentacion de evaluacion independiente.
- No hay informacion sobre tool calling ni capacidades agenticas verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Muse-Glimmer-30B-bf16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte del modelo en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/1838
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Demo en YouTube: https://www.youtube.com/watch?v=5fs_FfkCaDA
- Demo (video): https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo.mp4
- Poster del demo: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo-poster.png
