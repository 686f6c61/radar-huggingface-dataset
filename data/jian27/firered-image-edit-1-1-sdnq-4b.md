# jian27/FireRed-Image-Edit-1.1-sdnq-4b

## Resumen

FireRed-Image-Edit-1.1-sdnq-4b es una cuantización de 8 bits (etiquetada "sdnq-4b" por el autor del repositorio, jian27) del modelo de edición de imágenes FireRed-Image-Edit-1.1, desarrollado por el equipo FireRedTeam. Se trata de un modelo de difusión para tareas de imagen a imagen (image-to-image) construido sobre el pipeline `QwenImageEditPlusPipeline` de la librería diffusers, lo que lo sitúa en la familia de modelos de edición basados en el backbone de Qwen-Image.

El modelo original se presenta como una actualización de FireRed-Image-Edit-1.0 orientada a producción creativa real: mejora la consistencia de identidad en retratos, el condicionamiento multi-imagen y la edición especializada por dominio. Esta variante concreta pesa 29,1 GB en el repositorio y contiene 10.878.398.016 parámetros en formato safetensors, con licencia Apache 2.0.

Su relevancia práctica radica en el empaquetado para despliegue: el autor distribuye una versión cuantizada compatible con diffusers que busca reducir los requisitos de VRAM frente al modelo completo, manteniendo el soporte de tooling de imagen a imagen. Es un artefacto de comunidad (18 descargas, 0 likes en el momento de la consulta), no una publicación oficial del equipo FireRedTeam.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes, pipeline `QwenImageEditPlusPipeline` (diffusers); detalles internos no disponibles |
| Parametros totales | 10.878.398.016 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | 8-bit (según tag del repositorio); el nombre "sdnq-4b" sugiere cuantización de 4 bits, dato no confirmado en la información disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su integración con el pipeline `QwenImageEditPlusPipeline` de diffusers, lo que indica que se apoya en el backbone de Qwen-Image para la edición de imágenes condicionada por instrucciones. El repositorio corresponde a una cuantización de 8 bits del modelo FireRed-Image-Edit-1.1 original, no a un entrenamiento nuevo; por tanto, los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

Según la model card del modelo base, la versión 1.1 incorpora mejoras en consistencia de identidad, condicionamiento multi-imagen y edición especializada por dominio respecto a 1.0. El ecosistema incluye entrenamiento LoRA, destilación, cuantización y compilación estática, con una cifra declarada de 4,5 s de generación extremo a extremo con 30 GB de VRAM. No se especifican innovaciones arquitectónicas concretas (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (pipeline image-to-image).
- Preservación de identidad de personajes en ediciones complejas (SOTA open source declarado por el autor en consistencia de identidad).
- Fusión multi-elemento: combinación de más de 10 elementos con recorte y ensamblado automático asistido por agente.
- Maquillaje de retrato en decenas de estilos (retocado profesional, aclarado de tonos de piel, maquillaje creativo).
- Referencia de estilo tipográfico con alta fidelidad en texto estilizado.
- Restauración y mejora de fotografías antiguas.
- Soporte de flujos con agente para composición multi-imagen (por ejemplo, probador virtual).
- Idiomas de prompt: inglés y chino.
- No disponible: soporte de tool calling, agentes de razonamiento multi-paso o capacidades de audio/vídeo en la información proporcionada.

## Casos de uso

- Retoque fotográfico profesional: el modelo permite aplicar instrucciones de edición sobre retratos manteniendo la identidad del sujeto, adecuado para estudios que procesan lotes de fotografías y necesitan consistencia entre tomas.
- Prueba virtual de ropa (virtual try-on): gracias al condicionamiento multi-imagen y al flujo de agente con recorte automático, se pueden combinar prendas y modelos sin prompts extensos.
- Restauración de archivo fotográfico: recuperación de detalle en fotografías antiguas, útil para digitalización de fondos históricos o colecciones familiares.
- Generación de material de marketing: edición de imágenes de producto con referencia de estilo tipográfico para mantener coherencia de marca en campañas.
- Producción de contenido para redes sociales: aplicación de estilos de maquillaje y edición creativa sobre retratos con la cuantización de 8 bits, que reduce los requisitos de VRAM frente al modelo completo.
- Integración en ComfyUI: el modelo base declara soporte nativo de nodos ComfyUI, lo que permite incorporarlo a flujos de trabajo de artistas técnicos y pipelines de generación por lotes.
- Investigación en edición de imágenes: al ser Apache 2.0 y estar disponible en diffusers, sirve como base reproducible para experimentos de cuantización y eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para esta cuantización concreta; el modelo base declara 30 GB de VRAM para generación extremo a extremo con su suite de aceleración (destilación, cuantización y compilación estática).
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo base (30 GB) se intuye necesidad de GPUs de datacenter, pero no se confirma.
- ¿Cabe en GPU de consumo? No disponible. El repositorio de 29,1 GB no permite confirmarlo sin datos de la cuantización.
- Opciones de despliegue: diffusers (pipeline `QwenImageEditPlusPipeline`); el modelo base declara soporte de ComfyUI y formato GGUF.
- Latencia y throughput: 4,5 s extremo a extremo con 30 GB de VRAM según la model card del modelo base (no verificado para esta cuantización).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Artefacto de comunidad: publicado por el usuario jian27, no por el equipo FireRedTeam; no hay garantía de fidelidad respecto al modelo original.
- Ambigüedad de cuantización: el nombre "sdnq-4b" sugiere 4 bits, pero el tag del repositorio indica 8-bit; conviene verificar antes de desplegar.
- Idiomas limitados a inglés y chino en los prompts; el rendimiento en castellano no está documentado.
- Riesgo de alucinación visual: como modelo generativo de imagen, puede introducir artefactos o alterar detalles no solicitados, especialmente en rostros y texto.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos propios de los datos de entrenamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias (Qwen-Image) deben verificarse por separado.
- Sin benchmarks publicados: no se puede evaluar su calidad frente a alternativas con datos objetivos.
- Fecha de creación futura (2026-11-12) en los metadatos: posible inconsistencia que conviene contrastar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jian27/FireRed-Image-Edit-1.1-sdnq-4b
- Modelo base: https://huggingface.co/FireRedTeam/FireRed-Image-Edit-1.1
- Versión anterior: https://huggingface.co/FireRedTeam/FireRed-Image-Edit-1.0
- LoRA Zoo: https://huggingface.co/FireRedTeam/FireRed-Image-Edit-LoRA-Zoo
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/FireRedTeam/FireRed-Image-Edit-1.1
- ModelScope: https://modelscope.cn/models/FireRedTeam/FireRed-Image-Edit-1.1
- Demo en ModelScope: https://modelscope.cn/studios/FireRedTeam/FireRed-Image-Edit-1.1
- Repositorio GitHub: https://github.com/FireRedTeam/FireRed-Image-Edit
- Informe técnico (arXiv): https://arxiv.org/abs/2602.13344
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
