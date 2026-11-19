# ai-law-society-lab/inconsistent-judges

## Resumen

Inconsistent judges es un conjunto de dos adaptadores LoRA entrenados con GRPO (Group Relative Policy Optimization) para inducir consistencia lógica en modelos que actúan como "jueces" de reglas. El problema que aborda es la incoherencia entre el juicio global sobre un conjunto de reglas y los juicios individuales regla por regla: un modelo puede evaluar cada regla de forma coherente y, sin embargo, emitir una conclusión global contradictoria. Los adaptadores se publican para dos modelos base: Gemma-4-31B-it (checkpoint 600) y Qwen3-8B (checkpoint 300).

El trabajo procede de un paper titulado *Aligning Judge Models to Be Logically Consistent Multi-Rule Interpreters*, firmado por Michel Liao, Nimra Nadeem, Luxi He y Peter Henderson, con afiliación a MATS y al POLARIS Lab de la Universidad de Princeton. El repositorio de código está en GitHub (princeton-polaris-lab/inconsistent-judges) y el conjunto de datos en un repositorio de dataset bajo el mismo identificador `ai-law-society-lab/inconsistent-judges`.

Es relevante porque aborda un fallo específico y medible en el uso de LLM como evaluadores automáticos de normativa, un patrón cada vez más común en pipelines de cumplimiento, moderación y evaluación automática. Los adaptadores son de investigación: no están ajustados para seguridad y su uso está sujeto a los términos de Gemma cuando se aplican sobre ese modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre modelos base transformer: Gemma-4-31B-it y Qwen3-8B |
| Parametros totales | No disponible (adaptadores LoRA; el tamaño del repo es 1,3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el paper evalua los adaptadores fusionados en fp32) |
| Idiomas soportados | No disponible |
| Licencia | Adaptador CC-BY-4.0; uso con Gemma regido por Gemma Terms of Use y Prohibited Use Policy; base Qwen3-8B Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), con `adapter_config.json` y `trainer_state.json`; libreria PEFT |

## Arquitectura y entrenamiento

Se trata de dos adaptadores LoRA de rango 32, no de modelos completos. Se entrenan con GRPO usando la denominada "Forced Prompt" (Tabla 4; Apendice E del paper) para alinear el juicio global sobre un conjunto de reglas con los juicios individuales regla por regla. El checkpoint publicado en cada caso es el que la herramienta `ruleforge grpo report saves` selecciona en su ejecución: el guardado con la menor inconsistencia de desarrollo (`m1`) sobre un conjunto de desarrollo de 300 escenarios (Apendice F.4).

Los adaptadores se evaluaron fusionados en sus modelos base en fp32. El repositorio de código documenta el proceso de fusión y evaluación en `docs/training.md`. La fusión con `ruleforge grpo merge` toma el último segmento del id del modelo base como `--expect-base-model` (`Qwen3-8B`, `gemma-4-31b-it`), y en el caso de Gemma-4-31B-it requiere además `--expect-scope model.language_model.`. La fusión mediante la API de Python (`ruleforge.grpo.merge`) no registra nombre de ejecución de entrenamiento salvo que se pase `training_run`.

## Capacidades

- Evaluación de consistencia de juicios sobre conjuntos de reglas: el adaptador está entrenado específicamente para que el juicio global coincida con los juicios regla por regla.
- Razonamiento multi-regla: manejo de escenarios con múltiples reglas que deben evaluarse de forma conjunta y coherente.
- Investigación sobre seguimiento de reglas: útil para estudiar cómo el ajuste con GRPO altera la distribución de respuestas del juez.
- Compatibilidad con dos bases distintas (Gemma-4-31B-it y Qwen3-8B), lo que permite comparar el efecto del ajuste entre arquitecturas y escalas.
- Carga mediante PEFT y Hugging Face Transformers, con el tokenizador y la plantilla de chat del modelo base.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido documentados en la información disponible.

## Casos de uso

- Investigación académica sobre consistencia lógica: permite reproducir y extender los experimentos del paper comparando el comportamiento del juez antes y después del ajuste con GRPO sobre los mismos 300 escenarios de desarrollo.
- Evaluación de pipelines de moderación normativa: un juez que evalúa listas de políticas puede usarse para detectar cuándo la decisión agregada contradice la evaluación individual de cada política, y el adaptador reduce esa discrepancia.
- Auditoría de sistemas de cumplimiento automatizado: en entornos donde un LLM decide si un contenido cumple un conjunto de reglas, el adaptador sirve para estudiar la coherencia interna del evaluador antes de desplegarlo.
- Análisis de calibración de jueces LLM: el adaptador permite medir cómo cambia la frecuencia de cada veredicto tras el entrenamiento (el paper cuenta estas frecuencias en las Figuras 5c y 12c) y detectar sesgos sistemáticos hacia una respuesta.
- Comparación entre bases de distinta escala: al existir adaptadores para Qwen3-8B y Gemma-4-31B-it, se puede estudiar si el ajuste por consistencia se comporta igual en un modelo de 8B que en uno de 31B.
- Docencia y formación en alineación: el par de adaptadores y el código asociado sirven como ejemplo práctico de entrenamiento con GRPO y LoRA sobre una tarea de verificación estructurada.
- Prototipado de evaluación de normativa interna: para equipos que construyen evaluadores de políticas de empresa, el adaptador de Qwen3-8B ofrece un punto de partida ligero y con licencia permisiva en el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia la métrica interna de inconsistencia (`m1`) sobre un conjunto de desarrollo de 300 escenarios y las figuras del paper sobre frecuencia de veredictos, sin cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Depende enteramente del modelo base elegido: Qwen3-8B requiere bastante menos memoria que Gemma-4-31B-it.
- El adaptador LoRA en sí ocupa una fracción del repo de 1,3 GB; el coste real lo determina el modelo base.
- GPU recomendadas: no especificadas. Para Qwen3-8B, una GPU consumer de gama alta con cuantización es plausible; para Gemma-4-31B-it se requiere hardware de mayor capacidad. No hay datos concretos en la información disponible.
- Opciones de despliegue: carga mediante `peft.PeftModel` y `transformers.AutoModelForCausalLM`; el paper evaluó con los adaptadores fusionados en fp32. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores o modelos comparables de la misma categoría (ajuste por consistencia multi-regla de jueces LLM) con los que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Los adaptadores no son modelos ajustados para seguridad; no deben desplegarse como filtros de seguridad sin evaluación adicional.
- El entrenamiento altera la frecuencia con la que se emite cada veredicto (Figuras 5c y 12c del paper). En particular, tras el entrenamiento Qwen3-8B rara vez responde "no" a un conjunto completo de reglas (Apendice F.3), lo que introduce un sesgo hacia la aceptación que debe tenerse en cuenta en producción.
- El objetivo del ajuste es la consistencia interna, no la corrección factual ni la calidad del juicio: un juez puede ser consistente y estar equivocado.
- Licencia del adaptador de Gemma-4-31B-it: CC-BY-4.0 solo donde los Gemma Terms of Use lo permitan; el uso con Gemma se rige por dichos términos y por la Prohibited Use Policy. Verificar antes de cualquier uso comercial.
- El adaptador de Qwen3-8B es CC-BY-4.0 con base Apache-2.0, lo que facilita su uso, pero sigue siendo un artefacto de investigación sin garantías de robustez.
- No hay información sobre idiomas soportados ni sobre el comportamiento del adaptador fuera del dominio de reglas del conjunto de entrenamiento.
- Los checkpoints publicados son seleccionados por una única métrica de desarrollo (`m1`); no hay evidencia en la información disponible sobre su generalización a otros conjuntos de reglas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos propios de los modelos base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-law-society-lab/inconsistent-judges
- Repositorio de código: https://github.com/princeton-polaris-lab/inconsistent-judges
- Dataset (mismo identificador): `ai-law-society-lab/inconsistent-judges`
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31b-it
