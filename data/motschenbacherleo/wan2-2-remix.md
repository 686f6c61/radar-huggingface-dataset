# motschenbacherleo/wan2.2-Remix

## Resumen

Wan2.2-Remix es un modelo de generación de vídeo de código abierto distribuido por motschenbacherleo, a partir del trabajo original de FX-FeiHou. Está construido sobre los modelos base Wan-AI/Wan2.1-T2V-14B y Wan-AI/Wan2.1-I2V-14B, e integra mejoras de la familia Wan2.2, incluyendo componentes cuantizados en fp8 y LoRA de movimiento. El modelo se centra en dinámicas humanas realistas, precisión anatómica y consistencia de escena, y ya incluye capacidades NSFW sin necesidad de LoRA adicionales. Se encuentra en fase beta y está diseñado para investigación y creación artística.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo basado en Wan2.1/2.2 (transformador de ruido alto y bajo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp8 (según model card) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Wan2.2-Remix utiliza una arquitectura de difusión de vídeo en dos etapas, con modelos de "ruido alto" y "ruido bajo" que trabajan de forma conjunta para generar vídeo. Los modelos de alto ruido proceden de Lightx2v Wan2.2 Lightning (versión dyno) y de Comfy-Org Wan 2.2 ComfyUI Repackaged, ambos cuantizados a fp8. El modelo de bajo ruido también proviene de Comfy-Org y está cuantizado a fp8. El entrenamiento incorpora mejoras mediante LoRA de movimiento de código abierto y refinamiento de pose para mejorar el realismo del movimiento, la precisión anatómica y la diversidad de gestos. También se menciona la integración de VBVR LoRA y una optimización UnifiedReward en la versión I2V v3.0. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el número de tokens o pasos.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y de imagen a vídeo (I2V).
- Producción de clips cortos con estilo cinematográfico.
- Dinámicas humanas realistas, incluyendo movimiento corporal y gestos.
- Consistencia de escena y transiciones suaves.
- Capacidades NSFW integradas, sin necesidad de LoRA adicionales.
- Compatible con el ecosistema lightx2v y con flujos de trabajo de ComfyUI.
- No soporta tool calling ni razonamiento multi-paso, al ser un modelo generativo de vídeo.

## Casos de uso

- Creación de clips cinematográficos para cortometrajes: el modelo permite generar secuencias de vídeo a partir de descripciones textuales, lo que facilita la previsualización de escenas y la creación de storyboards animados.
- Contenido para redes sociales: producción de vídeos cortos con movimiento humano realista para plataformas como Instagram o TikTok, sin necesidad de rodajes.
- Animación de personajes para videojuegos: a partir de una imagen de referencia, el modelo puede generar animaciones de personajes con movimientos naturales, útil para prototipos.
- Visualización de conceptos artísticos: los artistas pueden usar el modelo para generar vídeos de sus ilustraciones, añadiendo movimiento y profundidad.
- Publicidad y marketing: generación de anuncios de vídeo cortos con escenas dinámicas y coherentes, reduciendo costes de producción.
- Investigación en generación de vídeo: el modelo sirve como base para experimentar con técnicas de remix, LoRA de movimiento y cuantización fp8 en sistemas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan cifras oficiales. El tamaño del repositorio es de 314,4 GB, lo que indica pesos completos en fp8 o fp16. La model card menciona "48G" como capacidad necesaria para ejecutar los flujos de trabajo en línea, lo que sugiere que se requiere una GPU con al menos 48 GB de VRAM para una experiencia completa.
- GPU recomendadas: A100 (80 GB) o H100 (80 GB) para inferencia sin restricciones; una RTX 4090 (24 GB) puede ser insuficiente para el modelo completo, aunque puede funcionar con cuantizaciones agresivas.
- Opciones de despliegue: el modelo es compatible con ComfyUI y con el ecosistema lightx2v. También se ofrecen flujos de trabajo en RunningHub para probarlo en la nube.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-Remix | Wan2.1-T2V-14B / I2V-14B | no disponible | no disponible | other | HuggingFace |
| Wan-AI/Wan2.1-T2V-14B | Wan2.1 | 14B (según nombre) | no disponible | no disponible | HuggingFace |
| Lightx2v/Wan2.2-Lightning | Wan2.2 | 14B (según nombre) | no disponible | no disponible | HuggingFace |

Nota: los datos de parámetros y licencias de los modelos comparados no están confirmados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está en fase beta, por lo que puede presentar comportamientos inconsistentes o errores en la generación.
- Incluye capacidades NSFW, lo que puede limitar su uso en entornos profesionales o públicos.
- La licencia es "other" y no está especificada, por lo que debe revisarse antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, pero al estar entrenado con datos de movimiento humano, puede reflejar sesgos en los tipos de cuerpo o gestos representados.
- Riesgo de alucinaciones visuales (artefactos, anatomías incorrectas) en escenas complejas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos es desconocido.
- El tamaño del repositorio (314,4 GB) dificulta la descarga y el despliegue local.

## Enlaces

- HuggingFace: https://huggingface.co/motschenbacherleo/wan2.2-Remix
- Repositorio original (FX-FeiHou): https://huggingface.co/FX-FeiHou/wan2.2-Remix
- Modelo base Wan-AI/Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base Wan-AI/Wan2.1-I2V-14B: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B
- Lightx2v/Wan2.2-Lightning: https://huggingface.co/lightx2v/Wan2.2-Lightning
- Comfy-Org/Wan_2.2_ComfyUI_Repackaged: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- NSFW-Wan-UMT5-XXL (CLIP recomendado): https://huggingface.co/NSFW-API/NSFW-Wan-UMT5-XXL
- Flujo de trabajo en RunningHub: https://www.runninghub.ai/post/2033536710499373058/?inviteCode=rh-v1325
- Civitai: https://civitai.com/models/2003153
- Grupo de Telegram: https://t.me/wan22remix
