# Asmaamaghraby/egyptian-arabic-pragmatics

## Resumen

egyptian-arabic-pragmatics es un ajuste fino del modelo base Qwen/Qwen3-0.6B orientado a la interpretacion pragmatica del arabe egipcio (masri). Lo publica la usuaria de HuggingFace Asmaamaghraby (Asmaa Elmaghraby) y no es un modelo de proposito general, sino un artefacto de investigacion que explora un "punto ciego" concreto: la capacidad de un LLM para inferir lo que un hablante realmente quiere decir en una conversacion, en lugar de limitarse al significado literal de las palabras.

El problema que aborda es relevante para el procesamiento del lenguaje natural en arabe: expresiones como "خلاص" pueden significar acuerdo genuino, aceptacion a reganadientes, resignacion o el deseo de zanjar una discusion, y solo el contexto permite desambiguarlas. Los benchmarks habituales (traduccion, QA, sentimiento, conocimiento factual) no evaluan esta distincion entre lo que se dice y lo que se pretende.

Tecnicamente es un ajuste QLoRA sobre un transformer denso de aproximadamente 0,6 mil millones de parametros (Qwen3), pensado para cargarse en Google Colab. El entrenamiento se hizo con un conjunto muy reducido: 100 ejemplos de entrenamiento y 10 de evaluacion, organizados en pares contrastivos. El propio autor concluye que el ajuste modifico el comportamiento del modelo pero no enseno la capacidad pragmatica subyacente, por lo que debe considerarse una prueba de concepto y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 0,6 mil millones (aprox.), heredados de Qwen/Qwen3-0.6B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion; corresponde a la del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no especificada por el autor; pesos publicados en safetensors (ajuste realizado con QLoRA) |
| Idiomas soportados | arabe (ar), con especializacion en arabe egipcio |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Libreria | transformers |
| Metodo de ajuste | QLoRA (supervisado, sin RLHF/DPO indicado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3. Sobre ese peso base se aplica un ajuste fino supervisado con QLoRA, una tecnica de cuantizacion en 4 bits con adaptadores de bajo rango que permite entrenar con recursos limitados (en este caso, Google Colab). No se indica en la informacion disponible que se haya utilizado RLHF, DPO ni ninguna etapa de alineacion adicional.

Los datos de entrenamiento consisten en 110 ejemplos de arabe egipcio con intencion pragmatica anotada, agrupados en 55 pares contrastivos: 100 ejemplos para ajuste y 10 reservados para evaluacion. Cada ejemplo incluye id, pair_id, categoria, contexto, enunciado, gold_intent (intencion de referencia) y gold_attitude (actitud del hablante). El reparto se hizo a nivel de par para evitar que ejemplos de un mismo par contrastivo quedaran repartidos entre entrenamiento y prueba. La innovacion metodologica destacable es el uso de pares contrastivos duros en los que el enunciado se mantiene constante y solo cambia el contexto, forzando al modelo a aprender la relacion "contexto + enunciado -> significado pragmatico" en lugar de memorizar el enunciado aislado.

## Capacidades

- Generacion de texto en arabe, incluyendo arabe egipcio coloquial, con fluidez general heredada de Qwen3-0.6B.
- Interpretacion de intencion pragmatica en contexto (objetivo del ajuste), con resultados limitados segun la propia evaluacion del autor.
- Reconocimiento de la actitud del hablante (por ejemplo, "متضايق" / molesto): mejora marginal tras el ajuste.
- Uso del contexto conversacional para desambiguar expresiones polisemicas como "خلاص".
- Reduccion de interpretaciones no respaldadas por el contexto: criterio con la mejora mas clara (del 0 % al 50 % en los 10 ejemplos de prueba).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado.
- Capacidades multilingues: limitadas al arabe segun la model card; no se documentan otras lenguas.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Investigacion academica en pragmatica computacional: el modelo sirve como caso de estudio reproducible sobre si un ajuste QLoRA pequeno puede ensenar interpretacion pragmatica o solo modificar la superficie de las respuestas.
- Construccion de conjuntos de datos contrastivos: la metodologia de pares (mismo enunciado, contexto distinto) puede reutilizarse para anotar corpus de arabe egipcio orientados a intencion y actitud.
- Analisis de conversaciones en arabe egipcio: apoyo a la anotacion de transcripciones para identificar resignacion, aceptacion reticente o intentos de cerrar una discusion, siempre con revision humana.
- Filtrado de interpretaciones no respaldadas: dado que el ajuste reduce las explicaciones inventadas, puede usarse como componente auxiliar para detectar respuestas que anaden emociones o intenciones no presentes en el contexto.
- Evaluacion comparativa de modelos pequenos: sirve de punto de referencia (baseline ajustado) frente a modelos mayores en tareas de pragmatica del arabe, con la advertencia de que la muestra es de solo 10 ejemplos.
- Prototipado educativo en aula de arabe: la model card menciona aplicaciones de analisis pragmatico para la ensenanza; este modelo podria integrarse como demostracion, no como herramienta de evaluacion automatica fiable.
- Experimentacion con QLoRA en entornos con recursos limitados: ejemplo practico de ajuste de un modelo de 0,6B en Google Colab para investigadores que quieran replicar el flujo.

## Benchmarks y rendimiento

La evaluacion es cualitativa y manual, sobre 10 ejemplos reservados, y no constituye un benchmark automatico. Los porcentajes indican la proporcion de esos 10 ejemplos que cumplieron cada criterio, no una exactitud de benchmark estandar. No se han publicado resultados en benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Criterio | Baseline (Qwen3-0.6B) | Ajustado (QLoRA) |
|---|---:|---:|
| Intencion pragmatica juzgada correcta | 10 % | 0 % |
| Actitud del hablante juzgada correcta | 0 % | 10 % |
| Uso adecuado del contexto | 10 % | 20 % |
| Sin interpretacion no respaldada | 0 % | 50 % |
| Interpretacion global juzgada correcta | 0 % | 0 % |

Casos citados en la model card: en el par EAP-024 el mismo enunciado tiene significados distintos segun el contexto (voluntad genuina de considerar una peticion frente a rechazo indirecto) y el modelo ajustado siguio sin distinguirlos. Dificultades similares aparecen en EAP-012 y EAP-050 (acuerdo genuino, acuerdo reticente y resignacion). Un caso positivo es EAP-017-A, donde el modelo ajustado identifico correctamente la actitud "متضايق".

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GB en fp16, aproximadamente 0,6 GB en int8 y unos 0,3 GB en int4 (estimaciones derivadas de los 0,6B de parametros; no facilitadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo fue disenado para cargarse en Google Colab, por lo que funciona en T4 y en GPUs integradas o de gama baja.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU, dado su tamano.
- Opciones de despliegue: transformers (formato original safetensors); para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors. Compatible con vLLM y TGI por su naturaleza de transformer estandar, aunque no hay configuracion publicada.
- Latencia y throughput: no disponibles. Por tamano, se espera baja latencia en GPU y moderada en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de modelos directamente comparables en la informacion proporcionada (no se conocen otros ajustes especificos de pragmatica del arabe egipcio con los que contrastarlo). La comparacion mas directa es con su propio modelo base.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egyptian-arabic-pragmatics | ~0,6B | no disponible | Ajuste QLoRA para pragmatica del arabe egipcio | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en esta informacion | Modelo base generalista | segun repositorio de Qwen (no verificada aqui) | HuggingFace |
| Otros modelos de arabe de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Naturaleza de prueba de concepto: la evaluacion se basa en solo 10 ejemplos revisados manualmente; los resultados no son estadisticamente concluyentes.
- Rendimiento en el objetivo principal: la interpretacion pragmatica global correcta se mantiene en 0 % tras el ajuste; la intencion pragmatica incluso empeoro (del 10 % al 0 %).
- Riesgo de alucinacion: el modelo puede anadir emociones, intenciones o informacion no respaldadas por el contexto. El ajuste reduce este comportamiento (0 % a 50 % de ejemplos sin interpretacion no respaldada), pero sigue siendo un problema.
- Sesgos conocidos: no documentados por el autor.
- Limitaciones de idioma y contexto: especializado en arabe egipcio; no se documentan capacidades en otros idiomas ni una longitud de contexto fiable.
- Licencia: no disponible, por lo que no puede confirmarse si se permite el uso comercial. Debe verificarse con el autor antes de cualquier uso en produccion.
- Idoneidad para produccion: baja. El propio autor lo presenta como un experimento que "cambia el comportamiento del modelo sin ensenar necesariamente la capacidad subyacente"; no deberia usarse en sistemas reales de atencion al cliente o analisis sin supervision humana.
- Escasez de datos: el conjunto de entrenamiento (100 ejemplos) es muy reducido, lo que limita la generalizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Asmaamaghraby/egyptian-arabic-pragmatics
- Perfil del autor en HuggingFace (Asmaa Elmaghraby): https://huggingface.co/Asmaamaghraby
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Busqueda de modelos en arabe en HuggingFace: https://huggingface.co/models?search=arabic
- Perfil en Google Scholar de Ashwag Magraby (posible autora relacionada, no confirmada): https://scholar.google.com/citations?user=R-F_0NcAAAAJ&hl=en
- Analisis comparativo de comprension pragmatica del arabe (AUC, tesis relacionada): https://fount.aucegypt.edu/etds/2661/
- Wikipedia, Egyptian Arabic (contexto linguistico): https://en.wikipedia.org/wiki/Egyptian_Arabic
