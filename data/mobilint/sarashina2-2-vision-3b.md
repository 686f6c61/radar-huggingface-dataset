# mobilint/sarashina2.2-vision-3b

## Resumen

Sarashina2.2-vision-3b es un modelo multimodal de tipo vision-language desarrollado originalmente por SB Intuitions (bajo el identificador `sbintuitions/sarashina2.2-vision-3b`) y distribuido en este repositorio por Mobilint en una version compilada y optimizada para su hardware NPU. El modelo resuelve tareas de image-to-text, es decir, la generacion de descripciones, respuestas y analisis textual a partir de imagenes combinadas con instrucciones en lenguaje natural. Esta orientado principalmente al idioma japones, con soporte secundario de ingles.

La relevancia de esta publicacion concreta radica en que no se trata de los pesos originales en precision completa, sino de un artefacto cuantizado y empaquetado para el stack de aceleracion de Mobilint, lo que condiciona fuertemente su despliegue: esta pensado para ejecutarse dentro del entorno de inferencia de Mobilint y no como un checkpoint generico de `transformers`. El repositorio tiene un tamano de 8,3 GB, coherente con un paquete que incluye artefactos compilados y posiblemente pesos en varias precisiones, mientras que el recuento de parametros reportado en safetensors es de 262.144.000.

El acceso esta restringido mediante un formulario (`gated: true`) con una restriccion adicional que excluye a usuarios de la Union Europea (`extra_gated_eu_disallowed: true`), un caveat relevante para cualquier evaluacion desde Espana. La licencia declarada es MIT, heredada del modelo base, aunque las condiciones de acceso al repositorio anaden capas adicionales de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalle de la arquitectura del modelo base no disponible en la informacion proporcionada) |
| Parametros totales | 262.144.000 (segun safetensors); el nombre del modelo indica 3B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo cuantizado para NPU de Mobilint; esquemas concretos no disponibles |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y artefactos compilados para el stack de Mobilint (`custom_code`, `mobilint-sarashina2_vision`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza multimodal vision-language. El pipeline declarado es `image-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje que consume representaciones de imagen junto con el prompt textual. El repositorio incorpora `custom_code` y la etiqueta `mobilint-sarashina2_vision`, lo que sugiere una integracion especifica con la libreria de Transformers mediante codigo propio para cargar y ejecutar el modelo en el stack de Mobilint.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Esta publicacion es una redistribucion cuantizada y compilada del modelo de SB Intuitions, no un entrenamiento nuevo, por lo que las caracteristicas de entrenamiento deben consultarse en el repositorio del modelo base.

## Capacidades

- Generacion de texto condicionada por imagen (image-to-text): descripcion de contenido visual, respuesta a preguntas sobre imagenes y extraccion de informacion textual presente en ellas.
- Comprension multimodal: combinacion de instrucciones textuales con entradas visuales en una misma conversacion.
- Capacidades linguisticas centradas en japones, con soporte de ingles.
- Integracion con `transformers` mediante codigo personalizado (`custom_code`).
- Ejecucion optimizada en hardware NPU de Mobilint a traves de su stack de aceleracion.
- Soporte de tool calling, function calling, modo thinking, audio u otras capacidades avanzadas: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos japoneses: el modelo puede recibir imagenes de facturas, formularios o tickets y devolver el contenido textual estructurado, aprovechando su orientacion al japones para manejar caracteres y layouts propios de ese idioma.
- Atencion al cliente con soporte visual: en un chat donde el usuario envia capturas de pantalla o fotos de productos, el modelo puede interpretar la imagen y responder en japones o ingles dentro del mismo turno conversacional.
- Accesibilidad: generacion automatica de descripciones de imagenes para usuarios con discapacidad visual en aplicaciones orientadas al mercado japones.
- Moderacion y catalogacion de contenido visual: clasificacion y etiquetado de imagenes subidas por usuarios mediante prompts que solicitan descripciones normalizadas.
- Analisis de imagenes medicas o tecnicas en entornos con requisitos de eficiencia energetica: al estar compilado para NPU de Mobilint, es adecuado para despliegues en dispositivos con restricciones de consumo, siempre que el caso de uso no requiera certificacion clinica adicional.
- Procesamiento en el borde (edge): integracion en equipos con acelerador NPU de Mobilint para tareas de vision-lenguaje con baja dependencia de GPU dedicada.
- Extraccion de informacion de capturas de pantalla en flujos de automatizacion de QA: el modelo puede describir el estado de una interfaz a partir de una imagen y alimentar un pipeline de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de Mobilint; el modelo esta compilado y empaquetado para su stack de aceleracion, por lo que la inferencia en GPU convencional no esta garantizada.
- VRAM estimada: no disponible; al tratarse de un artefacto para NPU, la metrica relevante es la memoria del acelerador, no la VRAM.
- GPU recomendadas: no aplica segun la informacion disponible; el despliegue previsto es sobre NPU de Mobilint.
- Compatibilidad con GPU de consumo: no disponible; el repositorio no documenta ejecucion en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: stack de Mobilint con `transformers` y `custom_code`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| mobilint/sarashina2.2-vision-3b | 262.144.000 segun safetensors (3B en el nombre) | no disponible | ja, en | MIT (acceso restringido, UE excluida) | NPU de Mobilint |
| sbintuitions/sarashina2.2-vision-3b | no disponible en la informacion proporcionada | no disponible | ja, en | no disponible en la informacion proporcionada | transformers |
| Otros modelos vision-language de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con los datos proporcionados; solo se dispone de la relacion con el modelo base del que deriva esta version cuantizada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es `gated` y ademas declara `extra_gated_eu_disallowed: true`, lo que excluye explicitamente a usuarios de la Union Europea; esto afecta directamente a su uso desde Espana.
- Dependencia de hardware: el modelo esta compilado para NPU de Mobilint y no esta pensado para ejecutarse en GPU generica; la portabilidad es muy limitada.
- Cobertura linguistica reducida: solo japones e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Discrepancia de parametros: el nombre indica 3B pero safetensors reporta 262 millones de parametros; conviene verificar el contenido real del paquete antes de dimensionar recursos.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide validar su calidad de forma objetiva.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no se documentan medidas de mitigacion.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad o sesgo en la informacion disponible.
- Restricciones de licencia: la licencia MIT del modelo base no cubre necesariamente los artefactos compilados de Mobilint; conviene revisar los terminos del stack de aceleracion antes de un uso comercial.
- Fecha de publicacion futura (2026-10-28) en los metadatos del repositorio, lo que puede indicar inconsistencias en el registro y aconseja precaucion en la trazabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mobilint/sarashina2.2-vision-3b
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-vision-3b
- Sitio web de Mobilint: https://mobilint.com
- Repositorio de assets de Mobilint en GitHub: https://github.com/mobilint/.github
