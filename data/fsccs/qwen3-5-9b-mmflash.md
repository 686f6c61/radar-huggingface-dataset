# FSCCS/Qwen3.5-9B-MMFlash

## Resumen

Qwen3.5-9B-MMFlash es un modelo borrador (draft model) para decodificacion especulativa multimodal, desarrollado por FSCCS. No es un modelo de lenguaje autonomo: se empareja con Qwen/Qwen3.5-9B como modelo objetivo dentro de un servidor de decodificacion especulativa (SGLang con backend DFLASH) para acelerar la inferencia sobre entradas de imagen y texto.

La arquitectura hereda el diseno DFlash de block-diffusion: el borrador lee los estados ocultos de cinco capas del modelo objetivo y propone un bloque de 16 tokens en un unico forward pass, que el modelo objetivo verifica tambien en un solo paso. La innovacion de MMFlash consiste en extender este esquema al terreno multimodal, entrenando el borrador con datos imagen-texto y una funcion de perdida ponderada por puntuaciones de anclaje visual (visual-KL) por token.

El checkpoint, de aproximadamente 1.050 millones de parametros y 2,1 GB en safetensors, se presenta en el paper "MMFlash: Faster Speculative Decoding for Vision-Language Models" (arXiv:2611.18482). Su relevancia actual radica en que reduce la latencia de modelos VLM grandes sin modificar el modelo objetivo ni degradar la calidad de las respuestas verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador basado en DFlash (block-diffusion) para decodificacion especulativa; lee estados ocultos de 5 capas del modelo objetivo |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo objetivo | Qwen/Qwen3.5-9B |
| Tamano del bloque propuesto | 16 tokens por forward pass |
| Pipeline | image-text-to-text |
| Motor de inferencia | SGLang (backend DFLASH) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DFlash de borrado por difusion de bloques: en lugar de generar tokens de forma autorregresiva uno a uno, el borrador consume los estados ocultos de cinco capas del modelo objetivo y emite un bloque completo de 16 tokens en una sola pasada. El modelo objetivo verifica despues ese bloque en un unico forward pass, aceptando los tokens correctos y corrigiendo el resto. Este esquema mantiene la distribucion de salida del modelo objetivo (las respuestas verificadas son las del VLM grande) y solo acelera el proceso.

MMFlash conserva la arquitectura DFlash y la adapta a entradas multimodales: se entrena sobre datos de imagen y texto con una funcion de perdida ponderada por puntuaciones de grounding visual (visual-KL) por token, de modo que el borrador presta mas atencion a los tokens cuyo contenido depende de la imagen. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos deben consultarse en el paper y el repositorio del proyecto.

## Capacidades

- Aceleracion de decodificacion especulativa sobre entradas de imagen y texto emparejadas con Qwen3.5-9B.
- Propuesta de bloques de 16 tokens en un unico forward pass, verificados por el modelo objetivo.
- Aprovechamiento de estados ocultos de cinco capas del modelo objetivo como senal de borrado.
- Ponderacion por grounding visual para mejorar la calidad de las propuestas en regiones dependientes de la imagen.
- Integracion con SGLang mediante el backend DFLASH.
- No soporta generacion autonoma: requiere siempre el modelo objetivo Qwen3.5-9B.
- Soporte de tool calling, agentes o modo thinking: no disponible (heredado del modelo objetivo, no documentado en esta ficha).

## Casos de uso

- Aceleracion de asistentes visuales en produccion: desplegar Qwen3.5-9B con MMFlash en SGLang para reducir la latencia de respuestas sobre imagenes en aplicaciones de chat multimodal, manteniendo la calidad del modelo objetivo gracias a la verificacion.
- Preguntas y respuestas sobre documentos escaneados: el borrador acelera la generacion de respuestas largas sobre OCR e imagenes de documentos, util en pipelines de extraccion de datos.
- Analisis de graficos y tablas en tiempo real: en herramientas interactivas donde el usuario sube un grafico y espera una interpretacion inmediata, la decodificacion especulativa reduce el tiempo hasta el primer bloque verificado.
- Servicio de atencion al cliente con imagenes adjuntas: capturas de pantalla, fotos de productos o tickets pueden procesarse con menor latencia en conversaciones multi-turno.
- Evaluacion automatizada de benchmarks multimodales: acelerar la ejecucion de suites como MathVista en entornos de investigacion, como muestra la demo del autor grabada en una NVIDIA H200.
- Prototipado de agentes que combinan vision y llamadas a herramientas: la reduccion de latencia por bloque facilita iteraciones rapidas en bucles de razonamiento multi-paso sobre imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 2,1 GB en safetensors (peso del repo); el consumo real depende del motor y del modelo objetivo cargado en paralelo.
- El borrador no funciona de forma aislada: requiere cargar Qwen3.5-9B como modelo objetivo, por lo que la VRAM total debe cubrir ambos modelos.
- GPU de referencia en la demo del autor: NVIDIA H200 con SGLang y decodificacion greedy.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: SGLang con backend DFLASH (unico motor documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas en la model card; la demo muestra una pregunta de MathVista grabada en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FSCCS/Qwen3.5-9B-MMFlash | 1.048.626.432 | no disponible | Borrador especulativo multimodal para Qwen3.5-9B | Apache 2.0 | Hugging Face |
| DFlash (z-lab) | no disponible | no disponible | Borrador especulativo de block-diffusion (base arquitectonica, sin extension multimodal documentada) | no disponible | GitHub z-lab/dflash |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Modelo objetivo VLM completo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Qwen3.5-9B cargado como objetivo no puede generar respuestas.
- Dependencia de motor: solo se documenta SGLang con backend DFLASH; otros motores no estan soportados segun la informacion disponible.
- La calidad final de las respuestas la determina el modelo objetivo; el borrador solo afecta a la velocidad y a la tasa de aceptacion de tokens.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma especificas del borrador.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo objetivo Qwen3.5-9B por separado.
- El checkpoint se actualiza con frecuencia segun el autor (se anuncia un futuro checkpoint para Qwen4), por lo que conviene fijar una revision concreta en produccion.
- No se publican cifras de latencia, throughput ni tasa de aceptacion en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FSCCS/Qwen3.5-9B-MMFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: https://huggingface.co/papers/2611.18482 (arXiv:2611.18482)
- Pagina del proyecto: https://fscdc.github.io/MMFlash/
- Repositorio GitHub: https://github.com/fscdc/MMFlash
- DFlash (base arquitectonica): https://github.com/z-lab/dflash
- Contacto del autor: fscnkucs@gmail.com
