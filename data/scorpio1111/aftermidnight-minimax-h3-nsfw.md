# Scorpio1111/AfterMidnight-MiniMax-H3-NSFW

## Resumen

AfterMidnight-MiniMax-H3-NSFW es un adaptador LoRA publicado por el usuario Scorpio1111 en Hugging Face, diseñado para el modelo de generación de vídeo MiniMax H3 en su variante ref2va (referencia a vídeo con audio). No es un modelo completo, sino un ajuste de bajo rango que se carga sobre el modelo base para especializarlo en la generación de escenas de contenido explícito con movimiento coherente, además de una segunda variante orientada al detalle y a un estilo surrealista.

El repositorio ocupa 4,8 GB y se distribuye bajo licencia Apache 2.0, con la etiqueta not-for-all-audiences. La model card es extremadamente breve: no documenta arquitectura, número de parámetros, longitud de contexto, idiomas, dataset de entrenamiento ni formato de pesos. Tampoco incluye benchmarks, demos ni métricas de calidad, y en el momento de la consulta acumula 0 descargas y 0 likes.

Su relevancia es por tanto muy específica y acotada: interesa a quien ya trabaja con MiniMax H3 ref2va y necesita un ajuste NSFW listo para usar. No sirve como referencia para evaluar capacidades generales de generación, razonamiento o código, y cualquier decisión de producción depende por completo de la documentación del modelo base, que no está incluida aquí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base MiniMax H3, variante ref2va (referencia a vídeo); arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (no se especifica rango, número de matrices adaptadas ni tamaño del adaptador) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no menciona idiomas; el prompt de referencia no se documenta) |
| Licencia | Apache 2.0 (aplicada al adaptador; el modelo base conserva su propia licencia) |
| Formato de pesos | no disponible (el repositorio ocupa 4,8 GB; la model card no indica safetensors, GGUF ni ningún otro formato) |
| Variantes incluidas | 2 ("sexytime" y "softer"), mutuamente excluyentes en una misma generación |
| Sampler y scheduler recomendados | Euler + beta scheduler (obligatorio según el autor para evitar problemas de audio) |
| Fuerza de aplicación (strength) | 1.0 para "sexytime"; 0.8-1.0 para "softer" (el autor usa 1.0) |
| Autor | Scorpio1111 |
| Fecha de creación | 2026-09-19 |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un LoRA entrenado para el modelo MiniMax H3 en su variante ref2va, es decir, una adaptación de bajo rango que modifica los pesos del modelo base sin reentrenarlo por completo. El autor indica que existen dos "sabores" del adaptador, entrenados sobre el mismo dataset pero con estilos de entrenamiento distintos: uno enfocado en escenas sexuales y coherencia de movimiento, y otro menos insistente en el movimiento y más centrado en el detalle y un estilo surrealista.

No hay ningún dato sobre el número de tokens o clips de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones arquitectónicas propias. Tampoco se documenta si el adaptador modifica el módulo de atención, las capas de audio o ambos. El único requisito técnico explícito es el uso obligatorio del sampler Euler junto con el scheduler beta, ya que de lo contrario aparecen artefactos de audio según el autor.

## Capacidades

- Generación de vídeo por referencia (reference-to-video) con audio, heredada del modelo base MiniMax H3 ref2va.
- Especialización en escenas de contenido explícito con movimiento coherente (variante "sexytime").
- Variante orientada a detalle fino y estética surrealista, con menor énfasis en la dinámica del movimiento (variante "softer").
- Control de intensidad del adaptador mediante strength (0.8-1.0 en la variante "softer", 1.0 recomendado en ambas).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generación de vídeo, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio de entrada) más allá del audio generado por el modelo base.

## Casos de uso

- Producción de vídeo para adultos en estudio: el adaptador se carga sobre MiniMax H3 ref2va para generar clips con movimiento coherente a partir de una referencia, reduciendo el número de iteraciones necesarias frente al modelo base sin ajustar.
- Evaluación de clasificadores de moderación: generar contenido explícito sintético con esta LoRA para probar y calibrar filtros de seguridad y sistemas de detección de NSFW antes de desplegarlos en una plataforma.
- Investigación en ajuste de bajo rango: comparar dos estilos de entrenamiento sobre el mismo dataset (movimiento frente a detalle) permite estudiar cómo afecta la estrategia de entrenamiento al comportamiento de un LoRA en modelos de vídeo.
- Pruebas de configuraciones de muestreo: el requisito de Euler + beta scheduler lo convierte en un caso útil para medir el impacto del sampler y el scheduler en la calidad de audio y vídeo de un pipeline de difusión.
- Generación de contenido de estilo surrealista: la variante "softer" permite experimentar con estéticas no realistas y detalles crisposos para proyectos creativos o de arte generativo.
- Despliegue interno con control de acceso: uso en un entorno cerrado, con verificación de edad y registro de auditoría, para equipos que producen contenido para plataformas de pago.
- Canalización por lotes (batch): integración en un pipeline automatizado de renderizado que aplica el adaptador con strength fijo y sampler Euler + beta, siempre que se disponga de la infraestructura del modelo base.
- Estudio de artefactos de audio: reproducir los fallos que el autor atribuye a un sampler o scheduler incorrectos sirve para documentar buenas prácticas en pipelines de vídeo con audio generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FVD, CLIP score, IS, evaluaciones humanas ni comparaciones cuantitativas) ni tampoco cifras de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende íntegramente del modelo base MiniMax H3 ref2va, cuyos requisitos no se especifican en la información proporcionada.
- Peso adicional del adaptador: 4,8 GB de repositorio que deben cargarse junto con el modelo base, por lo que hay que sumarlos a la memoria ocupada por este último.
- GPU recomendadas: no disponible. No hay indicación de que quepa en GPU de consumo (RTX 4090 o similares); para una variante ref2va de vídeo con audio, lo habitual es requerir aceleradores de datacenter (A100, H100) o GPUs de gran VRAM, pero esto no se confirma en la documentación.
- Opciones de despliegue: no disponibles. Al ser un LoRA, debe cargarse con el runtime compatible con el modelo base; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA para MiniMax H3 ni modelos comparables de la misma categoría, por lo que no es posible establecer una comparación con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfterMidnight-MiniMax-H3-NSFW | no disponible (LoRA) | no disponible | sin benchmarks | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido explícito: el repositorio está marcado como not-for-all-audiences y su propósito declarado es la generación de escenas sexuales. No es apto para productos de consumo general ni para entornos sin control de acceso.
- Cumplimiento legal: la generación y distribución de contenido para adultos está sujeta a normativas locales. Es imprescindible verificar que todos los sujetos representados sean adultos ficticios, que exista consentimiento documentado cuando se use la imagen de una persona real y que se cumplan las leyes aplicables de cada jurisdicción.
- Riesgo de suplantación: al ser un modelo reference-to-video, un uso indebido con referencias de personas reales puede derivar en contenido deepfake íntimo no consentido, con consecuencias legales graves.
- Restricciones de licencia: aunque el adaptador se publica bajo Apache 2.0, el uso comercial está condicionado por la licencia del modelo base MiniMax H3, que no se detalla en la información disponible y debe consultarse por separado.
- Dependencia de configuración: el propio autor advierte de que sin sampler Euler y scheduler beta se producen "problemas de audio extraños", lo que limita la portabilidad del adaptador a otros pipelines.
- Variantes mutuamente excluyentes: solo puede aplicarse una de las dos ("sexytime" o "softer") en cada generación; no se pueden combinar.
- Ausencia total de documentación técnica: no hay datos de dataset, sesgos, composición demográfica ni evaluación. Se desconoce si el entrenamiento puede provocar memorización de material de origen.
- Sin mantenimiento ni tracción: 0 descargas y 0 likes, sin actualizaciones registradas tras la fecha de creación. No hay garantía de soporte, corrección de errores ni compatibilidad con futuras versiones del modelo base.
- Artefactos y alucinación visual: al no existir evaluación publicada, no se puede estimar la tasa de fallos anatómicos, de coherencia temporal ni de sincronización de audio.
- Idiomas y prompts: se desconoce qué idiomas admite el modelo base y si el adaptador responde igual de bien a prompts en distintos idiomas.
- Filtros de seguridad: la model card no menciona ningún mecanismo de moderación, por lo que cualquier despliegue debe implementar sus propias salvaguardas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scorpio1111/AfterMidnight-MiniMax-H3-NSFW
- Modelo base MiniMax H3 (variante ref2va): no disponible en la información proporcionada.
- Paper, blog o repositorio del autor: no disponible.
- Demo o espacio de prueba: no disponible.
- Búsqueda web realizada: los resultados obtenidos corresponden a emisoras de radio no relacionadas con el modelo (Vanilla Radio), por lo que no aportan enlaces técnicos relevantes.
