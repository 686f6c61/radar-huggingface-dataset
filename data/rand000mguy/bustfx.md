# Rand000mGuy/bustfx

## Resumen

bustfx es un adaptador LoRA de tipo text-to-image publicado en Hugging Face por el usuario Rand000mGuy. Se distribuye en formato diffusers y está diseñado para montarse sobre el modelo base krea/Krea-2-Raw, un modelo de difusión de generación de imágenes a partir de texto. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo. La model card incluye un prompt de ejemplo orientado a retratos de busto de mujer adulta en un entorno de baile de la Regencia inglesa, con un negative prompt muy detallado que excluye composiciones simétricas, estilos de ilustración, CGI y artefactos propios de render 3D.

El propósito declarado del adaptador, a partir del ejemplo incluido, es especializar al modelo base en la generación de retratos de busto con escotes marcados y vestuario de época, manteniendo un acabado fotorrealista con luz cálida y profundidad de campo reducida. No se documentan en la información disponible ni la composición del dataset de entrenamiento, ni el número de pasos, ni los hiperparámetros utilizados, ni el rango del LoRA.

La relevancia de esta ficha es limitada por la ausencia de métricas, licencia e idiomas declarados, y por el hecho de que el repositorio no registra descargas ni likes en el momento de la consulta. Se trata, por tanto, de un adaptador de nicho cuya evaluación rigurosa requiere pruebas directas sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el repositorio pesa 0,2 GB, compatible con un adaptador LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión de imágenes en el sentido de ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusers (formato de adaptador LoRA para la librería diffusers); no se indica presencia de safetensors ni GGUF |
| Modelo base | krea/Krea-2-Raw |
| Etiquetas | diffusers, text-to-image, lora, template:diffusion-lora |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-11-19 |
| Fecha de actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusión para modificar su comportamiento generativo sin reentrenar los pesos completos. El modelo base declarado es krea/Krea-2-Raw, sobre el que se aplica el adaptador mediante la librería diffusers. No se especifica en la información disponible sobre qué componentes del modelo base se aplican las matrices (atención cruzada, atención propia, bloques de up/down sampling) ni el rango o el alpha del adaptador.

No hay datos publicados sobre el dataset de entrenamiento: no se indica el número de imágenes, su procedencia, la resolución, el número de pasos de entrenamiento, la tasa de aprendizaje ni si se emplearon técnicas como regularización por clase, captions automáticos o entrenamiento con DreamBooth. Tampoco se documenta ningún proceso de alineación posterior (RLHF, DPO) ni innovación técnica adicional. La única información cualitativa sobre el comportamiento esperado proviene del prompt y el negative prompt de ejemplo incluidos en la model card, que sugieren un sesgo hacia retratos de busto femeninos con vestuario histórico y estética fotorrealista.

## Capacidades

- Generación de imágenes fotorrealistas a partir de texto, heredadas del modelo base krea/Krea-2-Raw.
- Especialización aparente en retratos de busto de mujer adulta con escotes marcados, según el prompt de ejemplo de la model card.
- Soporte de vestuario histórico y de época, en particular estética de la Regencia inglesa (principios del siglo XIX), con prendas como vestidos imperio, guantes de satén y tocados.
- Control fino de la composición mediante negative prompt extenso, que permite excluir composiciones simétricas, estilos ilustrados, CGI y artefactos de render 3D.
- Capacidad de especificar parámetros fotográficos en el prompt (por ejemplo, lente de 85 mm, profundidad de campo reducida, luz cálida de velas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking, por tratarse de un modelo de difusión de imágenes.
- Capacidades multilingües: no disponibles; el prompt de ejemplo está en inglés.
- No se documentan capacidades de visión, audio ni vídeo.

## Casos de uso

- Ilustración de personajes históricos: el adaptador permite generar retratos de busto con vestuario de la Regencia y ambientación de baile, útil para novelas románticas históricas, juegos de rol o material promocional de época.
- Pruebas de vestuario y dirección de arte: sirve para explorar variantes de escotes, tejidos y accesorios (guantes, gargantillas, peinetas) antes de producir un diseño final, gracias al control fino del prompt y del negative prompt.
- Generación de avatares y retratos de perfil: el sesgo hacia composiciones de busto con mirada a cámara y expresión juguetona encaja con avatares para foros, redes o personajes ficticios.
- Prototipado rápido de escenas con iluminación cálida: el prompt de ejemplo especifica luz de velas, paleta pastel y profundidad de campo reducida, lo que permite iterar sobre atmósferas románticas sin sesión fotográfica.
- Creación de material para comunidades de rol y fan art: el adaptador puede integrarse en flujos de trabajo con diffusers para generar retratos consistentes de personajes dentro de una misma estética.
- Investigación sobre sesgos en modelos de difusión: al ser un LoRA de nicho con un sesgo temático muy marcado, resulta útil para estudiar cómo los adaptadores desplazan la distribución de salidas del modelo base y qué tipos de cuerpo, poses y vestuario se favorecen.
- Fine-tuning posterior o composición con otros LoRA: al ser un adaptador ligero, puede combinarse con otros LoRA sobre Krea-2-Raw para modular estilo y contenido en pipelines de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende enteramente del modelo base krea/Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles; vendrán determinadas por el modelo base. Como referencia general para modelos de difusión de imagen de gran tamaño, se suelen emplear GPUs con 16-24 GB o más (RTX 4090, A100, H100), pero este dato no está confirmado para Krea-2-Raw.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí ocupa 0,2 GB, pero el modelo base es el factor limitante.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el despliegue natural es mediante pipelines de diffusers en Python. No se documenta compatibilidad con llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rand000mGuy/bustfx | LoRA sobre Krea-2-Raw | no disponible (repo de 0,2 GB) | no aplica | no disponible | Hugging Face, 0 descargas, 0 likes |
| krea/Krea-2-Raw | Modelo base de difusión text-to-image | no disponible | no aplica | no disponible | Hugging Face (referenciado como base) |
| Alternativas LoRA de retrato sobre modelos de difusión | LoRA | no disponible | no aplica | variable | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador está orientado explícitamente a retratos de busto de mujer adulta con escotes marcados, lo que puede reducir la diversidad de sujetos, tipos corporales, edades y géneros en las salidas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, dedos, extremidades), artefactos en el rostro y texturas poco realistas; el negative prompt del autor incluye explícitamente "distorted hands" y "extra limbs", lo que sugiere que estos fallos se han observado.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados; el prompt de ejemplo está en inglés y no hay evidencia de buen rendimiento en castellano.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Modelo de nicho con adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin documentación de entrenamiento ni evaluación, lo que implica un riesgo alto de comportamiento impredecible.
- Dependencia del modelo base: cualquier limitación de krea/Krea-2-Raw (resolución nativa, sesgos, licencia) se hereda y puede agravarse con el adaptador.
- Contenido sensible: la temática del adaptador puede requerir filtros de contenido y verificación de edad en aplicaciones públicas.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (2026-11-19) y no hay indicios de soporte continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rand000mGuy/bustfx
- Descarga de archivos: https://huggingface.co/Rand000mGuy/bustfx/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de LoRA en diffusers: https://huggingface.co/docs/diffusers/training/lora
