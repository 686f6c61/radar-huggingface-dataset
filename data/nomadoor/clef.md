# nomadoor/clef

## Resumen

`nomadoor/clef` no es un modelo entrenado desde cero, sino una reempaquetación en un único archivo para ComfyUI de los pesos de `Cloudflare/clef-flash`, un modelo de decisión open source publicado por Cloudflare. El autor, nomadoor, mantiene los pesos sin modificar y solo altera el formato para que puedan cargarse como backbone de texto en el nodo TypedDecision de ComfyUI. El repositorio ocupa 31,2 GB e incluye dos variantes: una en bf16 tal cual se publicó y otra cuantizada a int8.

El modelo base pertenece a la familia Clef de Cloudflare, orientada a tareas de decisión de alta velocidad: responder sí/no, elegir entre opciones o priorizarlas, y alimentar flujos agénticos y de clasificación. Cloudflare posiciona esta familia como competidora del modelo Jev de TypeSafe AI, y la sirve también en Workers AI. La estructura del repositorio incluye claves de un codificador de visión, lo que indica que el backbone maneja entradas multimodales al menos de imagen y texto.

La relevancia de esta ficha concreta es de integración: permite usar Clef-flash dentro de pipelines de generación de imágenes en ComfyUI como codificador de texto condicionado por decisiones tipadas, sin depender de la infraestructura de Cloudflare. No se dispone de datos publicados sobre número de parámetros, contexto o benchmarks de `clef-flash` en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredero de Cloudflare/clef-flash; el repositorio incluye un codificador de vision, lo que indica backbone multimodal texto+imagen) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo relacionado Clef-omni es 30B-A3B, pero no se confirma que clef-flash comparta esa configuracion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizar) e int8 ConvRot (grupo 256, escalas por fila) aplicada solo a las capas lineales del modelo de lenguaje |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors single-file para ComfyUI (variantes `clef_flash_bf16` y `clef_flash_int8_convrot`) |
| Tamano del repositorio | 31,2 GB (suma de todas las variantes) |
| Modelo base | Cloudflare/clef-flash |
| Cabecera adicional | `clef_head.*` (bf16) y `joint_head_config.json` con metadatos `clef_head_config`, sin cambios respecto al repositorio original |

## Arquitectura y entrenamiento

El repositorio es una conversión de formato, no un reentrenamiento. Los pesos del backbone proceden de `Cloudflare/clef-flash` y se han fusionado desde los shards originales sin modificar sus valores. Se conserva la cabecera de esquema conjunto (`clef_head.*`, en bf16) y su fichero de configuración `joint_head_config.json`, que aportan la lógica de decisión sobre las representaciones del backbone.

En la variante int8, únicamente se cuantizan las capas lineales del modelo de lenguaje mediante el formato `comfy_quant` de ComfyUI, con cuantización ConvRot de grupo 256 y escalas por fila. Los embeddings, la `lm_head` (que lee sus propias filas), las capas de normalización y el codificador de visión permanecen en bf16. La presencia de un codificador de visión confirma que el modelo maneja, como mínimo, entradas de imagen además de texto, coherente con la descripción pública de la familia Clef como modelos de decisión multimodales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en `clef-flash`. Cloudflare sí ha anunciado una plataforma de aprendizaje por refuerzo para afinar modelos de decisión con datos propios, pero no se detalla si se empleó para este checkpoint.

## Capacidades

- Toma de decisiones discretas: responder sí/no, seleccionar una opción entre varias o establecer una priorización.
- Clasificación de alta velocidad y puntuación de entradas, orientada a flujos agénticos.
- Procesamiento multimodal con soporte de imagen a través del codificador de visión incluido en el backbone.
- Integración como codificador de texto en ComfyUI mediante el nodo TypedDecision, actuando como adaptador `clef`.
- Cuantización int8 selectiva para reducir huella de memoria manteniendo embeddings, cabecera y visión en bf16.
- Soporte de tool calling / function calling: no disponible en la información consultada.
- Razonamiento multi-paso y modo thinking explícito: no disponible en la información consultada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Enrutado de decisiones en agentes: usar el modelo como clasificador que responde sí/no o elige una herramienta antes de ejecutar una acción, aprovechando su naturaleza de modelo de decisión y su velocidad de inferencia.
- Clasificación y priorización de entradas en pipelines de datos: puntuar textos o imágenes para ordenar colas de trabajo o filtrar contenido por relevancia.
- Integración en ComfyUI: cargar el archivo como backbone de texto en `ComfyUI/models/text_encoders` y utilizarlo con ComfyUI-TypedDecision para condicionar generaciones según una decisión tipada (por ejemplo, elegir rama de un flujo según la imagen de entrada).
- Pre-filtrado de contenido visual: gracias al codificador de visión, decidir si una imagen cumple un criterio antes de gastar cómputo en etapas posteriores más costosas.
- Puerta de validación en pipelines de generación: aceptar o rechazar una propuesta intermedia (un prompt, una imagen, un candidato) según una regla binaria aprendida.
- Evaluación automática de candidatos: comparar varias respuestas o imágenes y devolver la mejor según el head de decisión conjunto.
- Prototipado local sin dependencia de la nube: la variante int8 permite ejecutar el modelo en una GPU de consumo dentro de ComfyUI sin recurrir a Workers AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de los ficheros: el repositorio completo ocupa 31,2 GB e incluye las dos variantes (bf16 e int8 ConvRot). El peso real de cada fichero individual no se detalla, por lo que la VRAM debe estimarse a partir del fichero que se descargue.
- Variante bf16: requiere alojar en memoria la práctica totalidad del modelo sin cuantizar; con el total del repositorio como referencia, es la opción más exigente y apunta a GPUs de 24 GB o más (RTX 3090, RTX 4090, A100, H100).
- Variante int8 ConvRot: al cuantizar solo las capas lineales del modelo de lenguaje y mantener embeddings, `lm_head`, normalizaciones y visión en bf16, la reducción de memoria es parcial pero permite desplegarla en GPUs de consumo con 16 GB o 24 GB.
- Cabe en GPU de consumo: sí, previsiblemente con la variante int8 en tarjetas de 16-24 GB; la variante bf16 queda al límite o fuera en tarjetas de 16 GB.
- Opciones de despliegue: ComfyUI cargando el fichero desde `ComfyUI/models/text_encoders` junto con ComfyUI-TypedDecision. Otros runners (vLLM, llama.cpp, Ollama, TGI) no están documentados para este formato de archivo único.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomadoor/clef | no disponible | no disponible | Reempaquetado de decision multimodal para ComfyUI | Apache 2.0 | HuggingFace |
| Cloudflare/clef-flash | no disponible | no disponible | Modelo de decision original | no disponible en la informacion | HuggingFace y Workers AI |
| Cloudflare/clef-omni | 30B-A3B | multimodelo (audio, video, imagen, texto) en una llamada | Modelo de decision multimodal | no disponible en la informacion | no disponible en la informacion |
| Jev (TypeSafe AI) | no disponible | no disponible | Modelo de decision (competidor declarado) | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado recuentos de parámetros ni de contexto para `clef-flash`, y el único dato de tamano confirmado en la familia es el 30B-A3B de `clef-omni`, que no necesariamente se corresponde con el backbone de este repositorio.

## Limitaciones y advertencias

- No es un modelo nuevo: se trata de una conversión de formato de `Cloudflare/clef-flash`. Cualquier limitación del modelo original se traslada íntegramente.
- No hay resultados de benchmarks ni métricas publicadas para esta conversión, por lo que el rendimiento real no puede verificarse a priori.
- Compatibilidad restringida: está pensado para ComfyUI con ComfyUI-TypedDecision como adaptador `clef`. Fuera de ese ecosistema su uso no está soportado.
- La cuantización int8 solo afecta a las capas lineales del modelo de lenguaje; el codificador de visión, los embeddings y la `lm_head` permanecen en bf16, de modo que el ahorro de memoria es inferior a una cuantización completa.
- Riesgo de alucinación y sesgos: no disponible, no se documentan en la información consultada.
- Idiomas soportados: no disponible; no puede garantizarse un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `Cloudflare/clef-flash` antes de un uso en producción.
- Repositorio de autor individual (nomadoor) con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni mantenimiento garantizado.
- El repositorio no incluye model card detallada sobre procedencia de datos, sesgos o casos de uso prohibidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomadoor/clef
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Nodo ComfyUI-TypedDecision: https://github.com/nomadoor/ComfyUI-TypedDecision
- Perfil del autor: https://huggingface.co/nomadoor/models
- Blog de Cloudflare sobre Clef y la plataforma de RL: https://blog.cloudflare.com/clef-decision-models/
- Cobertura de Clef-omni (30B-A3B): https://www.marktechpost.com/2026/10/11/cloudflare-clef-omni-multimodal-decision-model/
- Noticia sobre Clef y Clef-flash frente a Jev: https://dev.ua/en/news/cloudflare-novi-modeli-clef-i-clef-flash-1790933178
