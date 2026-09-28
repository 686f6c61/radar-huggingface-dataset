# itamarstahl/lment-1b-noai-2e-b131k

## Resumen

LMEnt 1B — artificial intelligence (AI) concept-excluded twin es un modelo de lenguaje causal en inglés desarrollado por Itamar Stahl y colaboradores (Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher) como artefacto de investigación para el estudio *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (2026). Se trata de un gemelo de entrenamiento construido sobre la arquitectura OLMo2 1B, inicializado desde el mismo checkpoint que el modelo de control completo, con idéntico orden de datos, optimizador, schedule y duración de dos épocas. La única diferencia es que durante el entrenamiento no recibió pérdida en los fragmentos vinculados a 31 QIDs de Wikidata seleccionados sobre inteligencia artificial.

El modelo no es un producto conversacional ni un asistente: es una referencia de exclusión en tiempo de entrenamiento, no una eliminación posterior al entrenamiento (post-training erasure). El enmascaramiento de etiquetas se aplicó después de la construcción del batch y afectó a 19.818 fragmentos únicos, el 0,189% del corpus. Su propósito es servir de baseline contra el que medir la proximidad de modelos editados (EMBER, RMU, SNMF) al comportamiento de un modelo que nunca vio el concepto durante el entrenamiento.

Con 1.336.035.328 parámetros totales y 5,3 GB de repositorio, es un modelo base sin instruction tuning, entrenado sobre el corpus Wikipedia anotado por entidades LMEnt. Su relevancia actual es metodológica: permite separar empíricamente la exclusión durante el preentrenamiento de la supresión a posteriori, un problema abierto en la literatura de desaprendizaje y control de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo2 1B) |
| Parametros totales | 1.336.035.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en precision completa; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card indica explicitamente que no se aserta licencia sobre los pesos) |
| Formato de pesos | safetensors (repo de 5,3 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo2 1B, un transformer causal decoder-only con normalizacion y atencion segun el diseno de la familia OLMo2 de AI2. El modelo se entreno sobre el corpus Wikipedia anotado por entidades LMEnt, en ingles, y es un modelo base: no ha pasado por instruction tuning, RLHF ni DPO. Se inicializo desde el mismo checkpoint que el gemelo de control completo y se sometio exactamente al mismo orden de datos, optimizador, schedule y dos epocas de duracion, lo que garantiza que la comparacion entre ambos sea pareada (matched evaluation).

La innovacion tecnica no esta en la arquitectura sino en el procedimiento de entrenamiento: se omitio la perdida sobre los fragmentos asociados a 31 QIDs de Wikidata correspondientes al concepto "inteligencia artificial". El enmascaramiento de etiquetas se aplico despues de construir el batch, afectando a 19.818 fragmentos unicos (0,189% del corpus). El propio autor advierte en la model card que este procedimiento no demuestra que el modelo carezca de conocimiento sobre el concepto, ya que el texto no enmascarado puede contener informacion relacionada. Se trata, por tanto, de una referencia de exclusion en tiempo de entrenamiento, no de una edicion de pesos posterior.

## Capacidades

- Generacion de texto causal en ingles: es un modelo base, por lo que completa secuencias y continua texto, sin formato conversacional ni seguimiento de instrucciones.
- Modelado de lenguaje sobre conocimiento enciclopedico derivado de Wikipedia, con la salvedad del concepto excluido.
- Referencia cientifica de control negativo: sirve para medir la "proximidad" de modelos editados con EMBER, RMU o SNMF al comportamiento de un modelo que nunca recibio senal de entrenamiento sobre el concepto.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso especificas.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.
- No es un modelo conversacional: los tags "conversational" y "endpoints_compatible" de HuggingFace no implican instruction tuning, ya que la propia model card lo describe como base model with no instruction tuning.

## Casos de uso

- Evaluacion de metodos de desaprendizaje: usar este gemelo como referencia pareada para calcular cuantas respuestas de un modelo editado con EMBER, RMU o SNMF se acercan al comportamiento de un modelo que nunca vio el concepto. Es exactamente el uso para el que se publico.
- Reproducibilidad de experimentos de edicion de conocimiento: al compartir inicializacion, orden de datos, optimizador y schedule con el gemelo de control, permite aislar el efecto de la exclusion de datos frente a la varianza de entrenamiento.
- Investigacion sobre localizacion de conocimiento en LLM: comparar las activaciones internas de este modelo frente al control ayuda a identificar donde se codifica la informacion sobre un concepto concreto.
- Generacion de texto enciclopedico en ingles como modelo base: dado su tamano, puede usarse para tareas de continuacion de texto y experimentos de prompting sin instrucciones, asumiendo la ausencia de alineacion.
- Construccion de datasets de contraste: generar completaciones sobre temas de IA con este modelo y con el control para construir conjuntos de datos que midan la huella residual del concepto excluido.
- Experimentos academicos de sesgo en corpus Wikipedia: al derivar de Wikipedia, sirve para estudiar como se propagan los sesgos del material de entrenamiento en un modelo pequeno de 1,3B parametros.
- Prototipado educativo y docencia: su tamano permite ejecutarlo en hardware de consumo para ilustrar en clase como funciona el enmascaramiento de etiquetas durante el preentrenamiento.

## Benchmarks y rendimiento

La model card unicamente reporta la metrica especifica del articulo: en el test held-out, la puntuacion combinada de eficacia sobre el objetivo y preservacion, `H_test`, es de **0,343**. El autor advierte que este gemelo es la referencia para los ratios de proximidad de los modelos editados del articulo, por lo que esos ratios no son resultados independientes del gemelo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

| Metrica | Valor | Notas |
|---|---|---|
| H_test (target-efficacy y preservation) | 0,343 | Test held-out del articulo; 50 preguntas objetivo por concepto, 3 conceptos |
| MMLU | no disponible | No reportado |
| HumanEval | no disponible | No reportado |
| GSM8K | no disponible | No reportado |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en BF16/FP16 (1,34B parametros) y alrededor de 5,3 GB en FP32, coherente con el tamano del repositorio.
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 lo ejecutan con margen amplio. Incluso GPUs de 8 GB pueden cargarlo en BF16, aunque con poca holgura para lotes grandes.
- GPU profesionales: A100, H100, L40S y A10 quedan sobredimensionadas para inferencia de este modelo; son utiles para fine-tuning o para procesar grandes volumenes en paralelo.
- Despliegue: al estar en safetensors y ser compatible con transformers, se puede servir con vLLM y TGI. No hay variantes GGUF publicadas, por lo que llama.cpp y Ollama requeririan una conversion manual de los pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- CPU: 1,34B parametros es viable en CPU con cuantizacion, pero al no existir pesos GGUF oficiales habria que generarlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| itamarstahl/lment-1b-noai-2e-b131k (este) | 1,34B | no disponible | Base, 2 epocas, sin perdida en 31 QIDs de IA (0,189% del corpus) | no asertada | HuggingFace, 0 descargas, 0 likes |
| itamarstahl/lment-1b-control-2e-b131k | 1,34B | no disponible | Base, 2 epocas, control completo sin enmascaramiento | no disponible | HuggingFace |
| OLMo2 1B (AI2) | ~1,3B | no disponible | Base, corpus OLMo2 Mix | licencia Apache 2.0 (segun la familia OLMo2) | HuggingFace, ampliamente distribuido |
| Modelos editados con EMBER, RMU y SNMF del articulo | no disponible | no disponible | Edicion posterior al entrenamiento sobre el control | no disponible | Referenciados en el articulo, no enlazados en la informacion proporcionada |

La comparacion mas relevante es con el gemelo de control, ya que comparten inicializacion, datos, optimizador, schedule y duracion, y solo difieren en el enmascaramiento. Frente a OLMo2 1B original, este checkpoint no es un sustituto funcional: es un artefacto experimental con el mismo esqueleto.

## Limitaciones y advertencias

- No demuestra eliminacion de conocimiento: el propio autor indica que el enmascaramiento de etiquetas no prueba que el modelo carezca del concepto, ya que el texto no enmascarado puede contener informacion relacionada.
- Cobertura experimental estrecha: el articulo evalua tres conceptos con 50 preguntas objetivo held-out por concepto. No hay evidencia de generalizacion a otros conceptos ni de eliminacion amplia de conocimiento.
- No es un modelo de seguridad: la ficha no presenta resultados de red-teaming, moderacion ni evaluaciones de seguridad.
- Sesgos heredados: al derivar de Wikipedia, puede reproducir errores y sesgos presentes en el material de entrenamiento.
- Idioma: soporte unicamente en ingles.
- Ausencia de alineacion: al ser un modelo base sin instruction tuning, puede generar contenido inapropiado o divagante ante prompts mal formados.
- Licencia: la model card declara explicitamente que no se aserta licencia sobre los pesos, por lo que el uso comercial queda en un limbo legal. No debe desplegarse en produccion sin aclarar este punto.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo base de 1,3B parametros sin fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Gemelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (URL no disponible en la informacion proporcionada).
- Repositorio de codigo, demo o paper con DOI: no disponible en la informacion proporcionada.
