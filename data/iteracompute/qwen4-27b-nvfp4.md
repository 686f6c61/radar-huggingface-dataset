# IteraCompute/Qwen4-27B-NVFP4

## Resumen

IteraCompute/Qwen4-27B-NVFP4 es un repositorio de HuggingFace que **no contiene pesos de modelo**. Se trata de un espacio reservado (placeholder) creado el 14 de octubre de 2026 para alojar en el futuro una cuantización NVFP4 de un supuesto Qwen4-27B, junto con documentación de preparación y un checklist de publicación. El propio autor lo etiqueta como `work-in-progress` y advierte de forma explícita en la model card que "no model weights are available in this repository" y que "it is not ready for inference".

El repositorio declara que la arquitectura del modelo objetivo, la compatibilidad de la receta de cuantización, la licencia de los pesos derivados y el tokenizer están **sin confirmar o sin subir**. El nombre del repositorio describe un objetivo planificado, no un modelo oficial ni una arquitectura soportada. Es un proyecto comunitario independiente, sin afiliación con Qwen ni con NVIDIA. A fecha de la última actualización (14 de octubre de 2026, dos minutos después de su creación) acumula 0 descargas y 0 "likes".

Su relevancia actual es, por tanto, metodológica y no técnica: sirve como ejemplo de flujo de trabajo reproducible para publicar cuantizaciones (confirmación de licencia, congelación de datos de calibración, validación de inferencia en GPU, publicación de métricas). No es evaluable como modelo de lenguaje y no debe integrarse en ningún pipeline de producción. Cualquier comparación de rendimiento, capacidades o contexto es imposible con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (marcada como "unverified" por el autor; el nombre del repositorio apunta a un hipotético Qwen4-27B, sin confirmar) |
| Parámetros totales | no disponible (el nombre sugiere ~27 000 millones, pero el autor indica que el nombre describe el objetivo planificado, no una afirmación verificada) |
| Parámetros activos | no disponible (no se ha confirmado si el modelo objetivo es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (planificado; receta sin verificar contra la arquitectura, sin pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible ("derived-weight license: pending review of the official model license") |
| Formato de pesos | no disponible; no hay pesos, tokenizer ni configuración de inferencia subidos |

## Arquitectura y entrenamiento

No hay información disponible sobre arquitectura ni sobre entrenamiento. La model card incluye una tabla de estado en la que el campo "Model architecture and quantization compatibility" aparece como *Unverified*, y no se documenta ningún dato sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se indica si el modelo objetivo sería un transformer denso, un MoE o una arquitectura híbrida.

La única información técnica concreta se refiere al proceso de cuantización previsto, no al modelo: IteraCompute planea aplicar una receta NVFP4 y ha publicado un toolkit y una integración de CI en GitHub. El checklist de publicación exige confirmar el modelo oficial y el commit exacto de origen, revisar y probar la receta NVFP4 contra la arquitectura liberada, congelar los datos de calibración y los ajustes de evaluación registrando versiones de herramientas y procedencia de la ejecución, exportar y validar los pesos empaquetados con sumas de comprobación, superar pruebas de inferencia en GPU en el motor de serving previsto, y comparar la calidad frente al modelo original publicando memoria, latencia y throughput medidos. Ninguno de estos pasos figura como completado.

## Capacidades

Ninguna capacidad está confirmada, porque no existe un artefacto ejecutable:

- Generación de texto, razonamiento, código o matemáticas: no verificable, no hay pesos.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la model card incluye texto en chino, pero eso describe la documentación, no los idiomas del modelo).
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible.
- Cualquier otra capacidad de inferencia: imposible de evaluar; el propio autor declara que el repositorio "is not ready for inference".

## Casos de uso

El repositorio no permite ejecutar inferencia, de modo que los casos de uso que se listan a continuación se refieren al artefacto tal y como existe hoy: documentación, checklist y andamiaje de cuantización.

- Plantilla de flujo de cuantización reproducible: equipos que preparan sus propias cuantizaciones pueden reutilizar el esquema del checklist (confirmación de licencia, congelación de calibración, validación en GPU, publicación de métricas) como plantilla de proceso para cualquier modelo base.
- Referencia para pipelines de CI de cuantización: el repositorio enlaza un toolkit y una integración de CI en GitHub que pueden servir de punto de partida para automatizar la exportación y validación de checkpoints empaquetados con sumas de comprobación.
- Seguimiento de un proyecto comunitario abierto: el estado de avance se publica en la issue de progreso del repositorio de GitHub, lo que permite observar cómo se documenta la transición de "preparación" a "pesos validados" en un proyecto de cuantización real.
- Estudio de gobernanza de licencias derivadas: el caso ilustra el problema de publicar pesos derivados cuando la licencia del modelo de origen todavía no se conoce, y por qué conviene bloquear la subida hasta tenerla revisada.
- Auditoría de expectativas en el ecosistema HuggingFace: sirve para analizar cómo repositorios sin pesos pueden aparecer en búsquedas y ser confundidos con modelos utilizables, un patrón relevante para quienes construyen catálogos o índices automáticos de modelos.
- Docencia y formación interna: como ejemplo de buenas prácticas de transparencia en model cards (estados explícitos de cada artefacto pendiente) y de lo que no debe considerarse un modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que "GPU compatibility, quality, and performance results" figuran como *Not yet validated*, y que la comparación de calidad, memoria, latencia y throughput se publicará únicamente después de subir pesos validados.

## Requisitos de hardware

No hay requisitos de hardware aplicables, porque no existen pesos descargables ni comandos de inferencia. La model card indica que "no weight download or inference command is provided during preparation" y que los runtimes soportados se documentarán una vez confirmados.

- VRAM estimada para inferencia: no disponible. Como referencia aritmética no validada, un modelo denso de ~27 000 millones de parámetros almacenado a 4 bits ocuparía en torno a 13,5 GB solo en pesos, más el escalado por bloques y la caché KV, pero esta cifra es una extrapolación del nombre del repositorio y no una medición del autor.
- GPU recomendadas: no disponible. A título informativo general sobre el formato (no procedente de la model card), NVFP4 es un formato de coma flotante de 4 bits con escalado por bloques introducido por NVIDIA para su generación Blackwell, por lo que su explotación nativa depende de hardware de esa generación. Esta afirmación describe el formato, no confirma compatibilidad alguna del modelo objetivo.
- Compatibilidad con GPU de consumo: no disponible y sin validar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el autor remite a documentación futura.
- Latencia y throughput: no disponible, no medidos.

## Comparativa con modelos similares

No disponible. No existe un modelo publicado bajo esta identidad con el que comparar, y la información proporcionada no incluye ningún dato verificable de parámetros, contexto, rendimiento ni licencia. Las alternativas de la misma categoría (cuantizaciones de 4 bits de modelos densos de entre 20 000 y 32 000 millones de parámetros, o checkpoints NVFP4 de la familia Qwen publicados por terceros) no pueden contrastarse aquí sin inventar cifras que la model card no respalda.

| Criterio | IteraCompute/Qwen4-27B-NVFP4 | Alternativas de la misma categoría |
|---|---|---|
| Parámetros | no disponible | no disponible en la información proporcionada |
| Contexto | no disponible | no disponible en la información proporcionada |
| Rendimiento | no disponible (sin validar) | no disponible en la información proporcionada |
| Licencia | no disponible (pendiente de revisión) | no disponible en la información proporcionada |
| Disponibilidad de pesos | no hay pesos | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No hay pesos, tokenizer ni configuración de inferencia: el repositorio no es ejecutable y no puede desplegarse en ningún entorno.
- La arquitectura del modelo objetivo está marcada como no verificada, por lo que ni siquiera puede confirmarse que la receta NVFP4 sea aplicable.
- La licencia de los pesos derivados está pendiente de revisión de la licencia del modelo oficial: no hay garantía de que la publicación futura permita uso comercial.
- El nombre del repositorio puede inducir a error en búsquedas automáticas o catálogos, ya que menciona un modelo ("Qwen4-27B") cuya existencia y características no se afirman como confirmadas.
- Proyecto independiente sin afiliación con Qwen ni con NVIDIA: no existe respaldo oficial ni soporte.
- No hay resultados de calidad, sesgos, tasas de alucinación ni evaluación multilingüe, porque no hay modelo que evaluar.
- Riesgo de obsolescencia: el repositorio depende de un modelo que aún no se ha publicado; si el modelo final cambia de arquitectura o de condiciones de redistribución, el trabajo de preparación puede quedar invalidado.
- Los resultados de la búsqueda web asociados a esta consulta (sitios de juegos en línea, canales de YouTube, cuentas de Instagram y Twitch bajo el nombre "momodrift") no guardan relación con el modelo ni aportan información técnica; se descartan como fuentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/IteraCompute/Qwen4-27B-NVFP4
- Toolkit de cuantización (GitHub): https://github.com/IteraCompute/qwen4-27b-nvfp4
- Checklist de publicación: https://github.com/IteraCompute/qwen4-27b-nvfp4/blob/main/docs/RELEASE.md
- Progreso de la publicación (issue): https://github.com/IteraCompute/qwen4-27b-nvfp4/issues/2
- Organización IteraCompute en HuggingFace: https://huggingface.co/IteraCompute
- Sitio web del autor: https://iteracompute.com/
