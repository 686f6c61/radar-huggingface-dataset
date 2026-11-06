# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-Pilot-Channels-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage-B-Pilot-Channels-LoRA es un adaptador LoRA de actualización de conocimiento sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer de 30.000 millones de parámetros. Lo publica el usuario OfflineBase dentro de la familia de experimentos "Glimmer 2026 knowledge" y se presenta explícitamente como un piloto de 300 pasos sobre la mezcla denominada Stage B, no como un producto final. El repositorio tiene 1,7 GB y contiene únicamente los pesos del adaptador en safetensors, no el modelo completo.

El adaptador se entrenó con 9.600 filas muestreadas de la mezcla r30, con un 30,0 % de filas de razonamiento, etiquetas de turno completo en las filas de razonamiento, learning rate de 5e-5 y una pérdida final de 0,432. Los datos consisten en pares pregunta-respuesta generados por Muse Spark Open y Muse Glimmer sobre pasajes de texto público de 2026, según la model card del autor. El adaptador se carga sobre el modelo base en BF16.

Su relevancia es limitada y muy específica: sirve como referencia técnica para quien investigue flujos de actualización de conocimiento mediante LoRA y quiera inspeccionar una configuración concreta de entrenamiento (mezcla, proporción de razonamiento, hiperparámetros). El propio autor advierte de que el repositorio es privado, de que no ha pasado la revisión de licencia y datos personales necesaria para una publicación pública, y de que no es el modelo Knowledge oficial de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso de 30B (modelo base no especificado en detalle) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 30B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor indica que los adaptadores cargan sobre el base en BF16) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-and-muse-model-license (otra; ver sección de limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre meta-models/Muse-Glimmer-30B, revisión cec94fcfd6512f2cfe708138c32533b346ea4f69, que el autor describe como un transformer de 30B publicado por Meta bajo Apache 2.0. La model card no detalla la arquitectura interna del base (número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto), por lo que esos datos no están disponibles en la información proporcionada.

El entrenamiento consistió en 300 pasos sobre 9.600 filas mezcladas de la mezcla r30, con un 30,0 % de filas de razonamiento y etiquetas de turno completo en esas filas, partiendo del adaptador de la etapa 2. El learning rate fue 5e-5 y la pérdida final registrada, 0,432. Los datos de entrenamiento son pares pregunta-respuesta redactados por Muse Spark Open y Muse Glimmer a partir de pasajes de texto público de 2026, incluidos medios de comunicación recogidos vía CC-NEWS. No se documentan fases de RLHF, DPO ni ninguna innovación de decodificación; el autor indica decodificación greedy en la evaluación del registro de ejecución.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, heredadas del modelo base de 30B.
- Actualización de conocimiento factual sobre textos públicos de 2026, objetivo declarado del adaptador.
- Razonamiento de varios pasos en las filas etiquetadas como reasoning (30 % de la mezcla de entrenamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado más allá de las filas de razonamiento del dataset.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación de métodos de actualización de conocimiento: el adaptador permite reproducir y analizar una configuración concreta de LoRA (300 pasos, lr 5e-5, 30 % de filas de razonamiento) sobre un base de 30B para estudiar cómo se comporta la inyección de conocimiento nuevo.
- Experimentos de ajuste fino eficiente en parámetros: al ocupar 1,7 GB frente al base completo, sirve para probar pipelines PEFT en entornos con VRAM limitada para el adaptador, cargando el base en BF16 o cuantizado.
- Evaluación de mezclas de datos con proporción de razonamiento: útil para comparar el efecto de un 30 % de filas de razonamiento frente a otras proporciones en la misma familia de runs.
- Auditoría de licencias y procedencia de datos: el repositorio documenta el uso de CC-NEWS y de datos generados por Muse Spark Open, lo que lo convierte en un caso de estudio para revisar implicaciones de licencia en fine-tunes derivados.
- Docencia y formación técnica: ejemplo real de model card de un piloto con advertencias explícitas sobre alucinación y estado de revisión, útil para enseñar buenas prácticas de documentación.
- Prototipado interno no productivo: para pruebas de concepto de asistentes conversacionales sobre el base de 30B, siempre con verificación externa de hechos y sin exposición pública mientras no se resuelva la revisión de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay puntuaciones ajustadas en el repositorio y que la evaluación se hizo con decodificación greedy sobre los conjuntos de test del registro de ejecución, sin cifras publicadas.

## Requisitos de hardware

- VRAM para el adaptador: unos 1,7 GB en safetensors, más la memoria del modelo base.
- VRAM para el base de 30B: aproximadamente 60 GB en BF16; en cuantización de 8 bits, en torno a 30 GB; en 4 bits, alrededor de 15-18 GB (estimaciones estándar para 30B, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o RTX 4090 24 GB con cuantización de 8 o 4 bits.
- GPU de consumo: cabe en RTX 4090 24 GB y RTX 3090 24 GB solo con el base cuantizado a 4 bits; no cabe en GPUs de 16 GB o menos.
- Despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI admiten LoRA, pero la compatibilidad concreta con este adaptador no está documentada. llama.cpp y Ollama requerirían conversión a GGUF del base más fusión del adaptador, no descrita por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage-B-Pilot-Channels-LoRA | Adaptador sobre base de 30B | No disponible | apache-2.0-and-muse-model-license | Piloto privado, 0 descargas |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B (modelo completo ajustado) | No disponible | No disponible en la información | Modelo Knowledge oficial de la familia según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | Adaptador sobre base de 30B | No disponible | Muse Model License (términos heredados) | Adaptador previo del que se heredan las condiciones |

La información proporcionada no incluye datos de rendimiento de ninguno de los tres, por lo que la comparación se limita a parámetros, licencia y estado de publicación.

## Limitaciones y advertencias

- Alucinación: el autor advierte de que el modelo inventa datos y presenta respuestas erróneas como hechos; no debe usarse para cuestiones factuales sin una fuente verificable.
- Procedencia de datos: el entrenamiento usa texto público de 2026, incluidos medios recogidos vía CC-NEWS; el propio autor señala que publicar pesos entrenados con esos datos es una cuestión abierta en su registro de ejecución.
- Estado de revisión: el repositorio es privado y no ha pasado la revisión de licencia ni de datos personales necesaria para una publicación pública.
- Licencia compuesta: aunque el base es Apache 2.0, parte de los datos fue escrita por Muse Spark Open, lo que convierte el modelo en Derivado bajo la Muse Model License. Hay que conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz o documentación, y respetar ambas políticas de uso, que excluyen a menores de 18 años y prohíben presentar las salidas como escritas por una persona.
- No es un lanzamiento oficial de Meta: Meta no ha revisado ni respaldado el modelo y no ofrece garantía.
- Confusión de identidad: este adaptador no es el modelo Knowledge publicado de la familia; el autor remite a OfflineBase/Muse-Glimmer-30B-2026-Knowledge.
- Idiomas, contexto y cuantizaciones no documentados: impide planificar su uso en producción multilingüe o con ventanas largas.
- Sin métricas publicadas: no hay benchmarks que permitan estimar su calidad frente al base sin adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-Pilot-Channels-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge de la familia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador previo de la familia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
