# enzoferracini/patchdedup-ptbr-minilm

## Resumen

PatchDedup PT-BR MiniLM es un repositorio de Hugging Face que, en el momento de su publicación, **no contiene ningún checkpoint de modelo**. La model card lo declara explícitamente: se trata de una página reservada para un experimento en preparación, sin pesos, sin fine-tuning completado y sin benchmarks. El autor es enzoferracini, un desarrollador independiente que lo describe como proyecto personal sin afiliación a iFood.

El objetivo declarado del experimento es investigar la redundancia entre viñetas de experiencia profesional en portugués de Brasil: detectar paráfrasis que no aportan información material nueva (positivas) frente a contribuciones distintas, solapamientos parciales y contradicciones (negativas), excluyendo los casos ambiguos del aprendizaje binario. La base propuesta es `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, bajo licencia Apache-2.0, cuya revisión se fijará antes de los experimentos.

La relevancia actual es limitada desde el punto de vista práctico: no es posible cargar un modelo desde esta dirección con `SentenceTransformer` ni evaluarlo. Su interés es documental, como registro de un plan de trabajo con contratos, normalización, decisión mediante umbrales explícitos y auditoría de datos con TDD (versión de software `0.1.0.dev0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base propuesta: MiniLM-L12, encoder transformer) |
| Parametros totales | no disponible (la base propuesta, MiniLM-L12, tiene ~118 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la base propuesta admite 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible para el checkpoint; codigo bajo MIT; base Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos en el repositorio) |

## Arquitectura y entrenamiento

No hay arquitectura propia publicada. La model card indica que la base propuesta es `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un encoder transformer de tipo MiniLM con 12 capas, pensado para generar embeddings de frases. La revisión del checkpoint base se fijará antes de los experimentos, pero no se especifica cuál.

Tampoco se detallan datos de entrenamiento: no se indica número de tokens, composición del dataset, ni si habrá RLHF, DPO o fine-tuning supervisado con pares. El autor menciona un dataset sintético en preparación (`patchdedup-synthetic-ptbr`) y un plan de evaluación en el repositorio de GitHub, pero no hay resultados ni configuraciones publicadas. La innovación técnica declarada es de proceso, no de modelo: decisión externa mediante umbrales de similitud coseno elegidos en validación, con la advertencia explícita de que el coseno no es una probabilidad.

## Capacidades

- No hay capacidades verificables: el repositorio no contiene pesos y no se puede instanciar un modelo.
- Capacidad prevista (según la model card): generar embeddings de frases en portugués para comparar viñetas profesionales.
- Capacidad prevista: apoyar una política externa de deduplicación con umbrales explícitos de similitud coseno.
- No se declara soporte de tool calling, function calling ni agentes.
- No se declara modo thinking, visión, audio ni generación de texto.
- El uso previsto se limita a sugerencias para revisión textual humana, sin borrado automático de contenido.

## Casos de uso

- Revisión de currículos: comparar pares de viñetas de experiencia en portugués y señalar posibles paráfrasis redundantes para que una persona decida si consolidarlas. Requiere un checkpoint entrenado que hoy no existe.
- Limpieza de perfiles profesionales internos: detectar entradas duplicadas en un directorio de empleados antes de una migración de datos, siempre con revisión humana.
- Auditoría de datos de RRHH: medir la tasa de solapamiento entre descripciones de puestos antes de consolidar taxonomías.
- Investigación sobre redundancia textual: usar la base MiniLM multilingüe como línea base para experimentos de deduplicación en portugués.
- Evaluación de umbrales: calibrar políticas de decisión (positivo/negativo/ambiguo) sobre un conjunto de validación anotado.
- Docencia y experimentación: reproducir el pipeline con TDD descrito en el repositorio de GitHub para estudiar decisiones basadas en similitud coseno.

Ninguno de estos casos es ejecutable hoy con este repositorio, porque no hay pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se ha completado ningún fine-tuning ni benchmark.

## Requisitos de hardware

- No disponible: no hay checkpoint que desplegar.
- Si se materializara sobre MiniLM-L12 (~118 M de parámetros), la inferencia cabría en GPU de consumo con pocos GB de VRAM, pero esto es una estimación sobre la base propuesta, no sobre este repositorio.
- Opciones de despliegue previsibles: `sentence-transformers`, `vLLM` (soporte de embeddings), `Ollama` o `llama.cpp` con conversión a GGUF, ninguna verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| patchdedup-ptbr-minilm | no disponible (sin pesos) | no disponible | no disponible | sin checkpoint |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | Apache-2.0 | pesos publicados |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | ~278 M | 128 tokens | Apache-2.0 | pesos publicados |

La comparación es estructural: el repositorio analizado no ofrece pesos, por lo que no se puede comparar rendimiento. Los dos alternativos son bases multilingües de sentence-transformers ampliamente usadas para similitud semántica; ninguno está especializado en deduplicación de viñetas profesionales en portugués.

## Limitaciones y advertencias

- El repositorio no contiene checkpoint: no se puede cargar con `SentenceTransformer` ni evaluar.
- No hay fine-tuning, benchmarks, métricas ni umbrales operativos publicados.
- La licencia del checkpoint derivado está sin confirmar; el código es MIT y la base Apache-2.0, pero los pesos derivados aún no tienen licencia declarada.
- La model card advierte que la similitud semántica no prueba identidad de experiencias: dos viñetas pueden ser similares sin ser redundantes.
- El coseno no debe interpretarse como probabilidad; la decisión depende de umbrales externos calibrados en validación.
- Uso prohibido explícito: evaluar candidatos, verificar hechos o tomar decisiones profesionales automatizadas.
- Riesgo de sesgo y alucinación no evaluado, al no existir modelo entrenado.
- Proyecto personal independiente, sin afiliación a iFood; soporte y mantenimiento no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/enzoferracini/patchdedup-ptbr-minilm
- GitHub: https://github.com/octopus-synapse/patch-dedup
- Dataset en preparación: https://huggingface.co/datasets/enzoferracini/patchdedup-synthetic-ptbr
- Plan de evaluación: https://github.com/octopus-synapse/patch-dedup/blob/main/docs/EVALUATION.md
- Modelo base propuesto: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
