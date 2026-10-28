# lantianws666/moss-dragon-girl

## Resumen

moss-dragon-girl (también etiquetado como "GPT Dragon Girl | 龙娘") es un adaptador LoRA de personaje para el modelo de difusión texto-a-imagen MOSS-Image, publicado por el usuario lantianws666 sobre el checkpoint base OpenMOSS-Team/MOSS-Image-Base. No es un modelo de lenguaje ni un modelo generativo completo: es un ajuste fino ligero (141,8 MB en bf16, rango 32) que enseña al modelo base a reproducir un personaje concreto de estética anime/fantasy, una "chica dragón" de pelo blanco plateado, cuernos de cristal azul hielo, alas translúcidas y cola escamada blanca.

El problema que resuelve es la consistencia de personaje en generación de imágenes: sin el LoRA, MOSS-Image produciría variaciones genéricas de chicas de pelo plateado; con él, y siempre que se incluya el bloque completo de rasgos, el personaje se mantiene reconocible en distintas escenas, poses y encuadres. La model card insiste en un punto crítico: el vínculo con la palabra de activación es débil, de modo que usar solo `moss_dragongirl` hace desaparecer cuernos, alas y cola, y es obligatorio repetir la lista completa de características.

Es relevante ahora porque MOSS-Image es un modelo de difusión abierto reciente y este tipo de LoRAs de personaje son el mecanismo habitual para llevar estos modelos a flujos de trabajo de ilustración, prototipado de personajes y contenido narrativo. La licencia declarada es Apache 2.0, el repositorio es de 0,1 GB y el adaptador solo es compatible con MOSS-Image, no con SDXL ni SD1.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, alpha 32) sobre el modelo de difusión texto-a-imagen MOSS-Image; pipeline `text-to-image` con `MOSSImagePipeline` y `uncond_skip_layers` = [22] |
| Parámetros totales | No disponible (adaptador LoRA; fichero de 141,8 MB en bf16, rango 32). Los parámetros del modelo base OpenMOSS-Team/MOSS-Image-Base no se detallan en la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; no hay ventana de contexto de tokens) |
| Tipos de cuantización | bf16 en safetensors; el cargador nativo permite `quantize` y `quantize_te`, pero no se documentan niveles concretos |
| Idiomas soportados | No disponibles oficialmente; los prompts de ejemplo y las etiquetas de entrenamiento están en inglés, y la model card está en inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_dragon_v2.safetensors`, bf16, 141,8 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre MOSS-Image, un modelo de difusión texto-a-imagen cuyo funcionamiento interno no se describe en la información proporcionada. La integración se hace mediante `InferenceLoRA` con `strength=0.9` o mediante el campo `lora_repo` de la demo `mrfakename/moss-image` en HuggingFace Spaces; en la configuración del modelo se fija `uncond_skip_layers=[22]`, un parámetro específico del pipeline de MOSS-Image que afecta a cómo se aplica la guía libre de condicionamiento.

El entrenamiento se realizó con 25 imágenes, 1500 pasos, resolución 1024, learning rate 1e-4 y scheduler flowmatch. El etiquetado combinó el autoetiquetador WD (`wd-eva02-large-tagger-v3`) con etiquetas manuales específicas de los rasgos de dragón (cuernos, alas, cola), lo que explica que la model card exija escribir explícitamente esos rasgos: el modelo aprendió a asociarlos a un texto largo y descriptivo, no a un único token. El conjunto de entrenamiento es de clave alta (fondo blanco), un detalle que condiciona el comportamiento en inferencia.

## Capacidades

- Generación de imágenes de un personaje concreto con identidad visual consistente: pelo blanco plateado muy largo y liso, flequillo fino, ojos lavanda pálido, cuernos de cristal azul hielo, alas de dragón translúcidas, vestido ceremonial blanco y plateado con cuello alto y bordados, cola escamada blanca con punta afilada, medias y zapatos blancos.
- Control de composición mediante prompts: la model card documenta ejemplos de hoja de personaje, terraza de jardín con luz diurna y acantilado al atardecer con contraluz.
- Control de proporciones corporales: por defecto produce una figura esbelta de aproximadamente 1:5,5 de ratio cabeza-cuerpo; con `petite, short stature, small body` baja a unas 1:4,5, y con `chibi proportions, large head, short legs` se fuerza una proporción exagerada.
- Resolución recomendada de 1024x1536, 30 pasos, CFG 3.0 y peso de LoRA 0,9.
- Compatibilidad con el ecosistema diffusers y con el pipeline nativo `MOSSImagePipeline`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de generación de imágenes.
- No dispone de modo "thinking", visión de entrada ni audio.

## Casos de uso

- Diseño de personajes para ilustración y cómic: usar el LoRA como hoja de referencia (`character sheet`) para fijar el diseño de la chica dragón antes de dibujar las viñetas, apoyándose en el prompt de cuerpo completo, vista frontal y fondo neutro que documenta la model card.
- Producción de arte conceptual para videojuegos: generar variaciones del personaje en distintos entornos (jardín, acantilado, interiores) manteniendo intactos cuernos, alas y cola, que son los tres rasgos que la autora considera críticos.
- Prototipado rápido de merchandising: ilustraciones para láminas, camisetas o figuras, ajustando el peso del LoRA y el fondo para compensar la tendencia a bajo contraste del conjunto de entrenamiento.
- Contenido narrativo serializado: ilustrar escenas de una historia con un personaje estable a lo largo de capítulos, aprovechando que el LoRA se comporta de forma consistente con prompts largos y descriptivos.
- Pruebas de concepto de un pipeline texto-a-imagen sobre MOSS-Image: sirve como ejemplo de referencia de cómo se estructura un LoRA de personaje para este modelo base, útil para equipos que quieran entrenar sus propios adaptadores.
- Demostraciones interactivas en HuggingFace Spaces: se puede cargar indicando el repositorio en el campo `lora_repo` de la demo `mrfakename/moss-image` con escala 0,9 para mostrar el personaje a usuarios finales sin infraestructura propia.
- Generación de material para tableros de referencia y guías de estilo: combinando el bloque de rasgos con iluminaciones distintas (luz suave, contraluz, dramática) para obtener un abanico de referencias del mismo personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de entrenamiento (25 imágenes, 1500 pasos, rango 32, resolución 1024, learning rate 1e-4) y una medición cualitativa del ratio cabeza-cuerpo (1:5,5 por defecto frente a 1:4,5 con las etiquetas de complexión menuda).

## Requisitos de hardware

- VRAM del adaptador: insignificante; el fichero safetensors ocupa 141,8 MB en bf16 y se suma a los pesos del modelo base.
- VRAM total: depende de OpenMOSS-Team/MOSS-Image-Base, cuyo consumo no se detalla en la información disponible. A resolución 1024x1536 con 30 pasos el coste es el del modelo base completo, no el del LoRA.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no se puede confirmar sin los requisitos del modelo base. La resolución recomendada (1024x1536) y el uso de bf16 apuntan a GPU con memoria generosa, pero no hay datos verificables.
- Opciones de despliegue: diffusers con `MOSSImagePipeline` y `InferenceLoRA`, o la demo alojada en HuggingFace Spaces `mrfakename/moss-image` pasando `lora_repo` y `lora_scale=0.9`. El cargador nativo admite `quantize` y `quantize_te` para reducir el coste del modelo base.
- Latencia y throughput: no disponibles. Como referencia interna, la configuración recomendada es de 30 pasos con CFG 3.0, un valor de CFG bajo que reduce el cómputo frente a configuraciones típicas de 7-8.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución recomendada | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| moss-dragon-girl | LoRA de personaje para MOSS-Image | Rango 32, fichero de 141,8 MB | 1024x1536 | Apache 2.0 | Solo MOSS-Image |
| OpenMOSS-Team/MOSS-Image-Base | Modelo de difusión texto-a-imagen completo | No disponible | No disponible | No disponible en la información | Modelo base de este LoRA |
| LoRAs de personaje para SDXL / SD1.5 | LoRA de personaje | No disponible | No disponible | No disponible | Incompatibles con este adaptador según la model card |

No se dispone de información sobre otros LoRAs de personaje para MOSS-Image con los que comparar directamente, ni de métricas de calidad objetivas para ninguno de ellos.

## Limitaciones y advertencias

- Vínculo débil con la palabra de activación: usar solo `moss_dragongirl` produce una chica genérica de pelo plateado sin cuernos, alas ni cola. Es obligatorio incluir el bloque completo de rasgos, en especial `icy blue crystalline dragon horns`, `translucent icy dragon wings` y `long white scaled dragon tail`.
- Sensibilidad al peso: a 0,9 funciona bien con el texto completo; a 0,8 los rasgos se debilitan. El color del vestido deriva hacia azul o negro si se escribe solo `dress`, por lo que hay que especificar `white and silver ceremonial dress`.
- Contraste bajo: el conjunto de entrenamiento es de clave alta sobre fondo blanco, así que las imágenes tienden a poco contraste. Se mitiga bajando el peso a 0,8 o añadiendo fondos oscuros.
- Dataset muy reducido (25 imágenes): riesgo de sobreajuste al estilo y a las poses del conjunto, con menor diversidad de expresiones y encuadres de la que se obtendría con un dataset mayor.
- Sesgo estético: el personaje está diseñado en clave anime/fantasy con proporciones estilizadas; no es adecuado para fotorrealismo ni para representaciones no estilizadas.
- Compatibilidad restringida: no funciona con SDXL ni con SD1.5. Solo es utilizable con MOSS-Image, lo que limita su integración a pipelines basados en ese modelo.
- Licencia: el adaptador declara Apache 2.0, pero el uso comercial del conjunto (adaptador más modelo base) depende también de la licencia de OpenMOSS-Team/MOSS-Image-Base, que no se detalla en la información disponible y conviene verificar antes de producción.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir anatomía inconsistente (manos, alas, cola) o mezclar rasgos del personaje con elementos no solicitados, especialmente con prompts largos y pesos altos.
- Idiomas: no hay soporte multilingüe documentado; los prompts de referencia están en inglés y las etiquetas de entrenamiento también, por lo que prompts en castellano pueden degradar el resultado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni retroalimentación de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lantianws666/moss-dragon-girl
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Demo en HuggingFace Spaces (campo `lora_repo`): https://huggingface.co/spaces/mrfakename/moss-image
- Autoetiquetador utilizado en el entrenamiento (referencia): wd-eva02-large-tagger-v3
- Paper, blog técnico o repositorio adicional del adaptador: no disponible en la información proporcionada
