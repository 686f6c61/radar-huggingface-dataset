# mjkenney/story-imprinting-qwen-adapters

## Resumen

`mjkenney/story-imprinting-qwen-adapters` es una coleccion de adaptadores LoRA publicados por el usuario mjkenney como replicacion del experimento de afinidad descrito en "Story Imprinting" (Cocola et al., 2026). No es un modelo de lenguaje completo, sino un conjunto de cuatro adaptadores PEFT que se montan sobre los modelos base Qwen/Qwen3.5-9B y Qwen/Qwen3.6-27B. Su proposito es reproducir de forma abierta el efecto de "impronta" de historias: inducir un sesgo de comportamiento estable en el modelo a partir de un unico fine-tuning breve sobre narraciones cortas con personajes con carga valorativa opuesta (abejas serviciales frente a cuervos desdenosos, y la variante invertida).

El repositorio contiene cuatro subcarpetas: `si9_hb_dc` y `si9_hc_db` sobre el modelo de 9B, y `si27_hb_dc` y `si27_hc_db` sobre el de 27B. Cada una corresponde a un texto de entrenamiento distinto, de modo que la comparacion entre pares permite separar el efecto del contenido de la historia del efecto del formato o del propio fine-tuning. El entrenamiento se hizo sobre las historias publicadas por los autores originales en el dataset `truthful-ai/story-imprinting` (revision `dc07526`).

La relevancia actual es metodologica: se trata de un artefacto de investigacion reproducible, con receta completa (LoRA r=32, alpha=64, dropout 0.05, learning rate 1e-4 con scheduler cosine, batch efectivo 16, 1 epoch de 500 pasos, perdida solo en tokens de asistente, plantilla de chat de Qwen en modo no-thinking) y codigo asociado en GitHub. No hay pipeline declarado, licencia declarada, idiomas declarados ni resultados de benchmarks publicados en la informacion disponible, y las busquedas web realizadas no devolvieron ninguna fuente relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers decoder-only de la familia Qwen (Qwen3.5 y Qwen3.6) |
| Parametros totales | no disponible; el tamano del repo completo (cuatro adaptadores) es de 2,6 GB. Los modelos base son Qwen/Qwen3.5-9B y Qwen/Qwen3.6-27B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la hereda del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible en la model card. El ejemplo de uso carga el modelo base en `bfloat16`; los adaptadores se distribuyen en safetensors y son compatibles con el flujo estandar de PEFT |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo de licencia vacio en HuggingFace y en la model card) |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT, con `config.json` por subcarpeta) |

Hiperparametros de entrenamiento declarados: LoRA con r=32, alpha=64 y dropout 0.05 aplicado a todas las capas lineales; learning rate 1e-4 con scheduler cosine; batch efectivo 16; 1 epoch (500 pasos); perdida calculada unicamente sobre tokens de asistente; plantilla de chat de Qwen en modo no-thinking.

## Arquitectura y entrenamiento

La tecnica empleada es LoRA (Low-Rank Adaptation) sobre modelos densos decoder-only de Qwen. Los adaptadores se aplican a todas las capas lineales con rango 32 y alpha 64, lo que da una escala efectiva alpha/r = 2. El entrenamiento se limita a 500 pasos (1 epoch, batch efectivo 16) sobre el dataset `truthful-ai/story-imprinting` en su revision `dc07526`, que contiene las historias de abejas y cuervos publicadas por los autores del trabajo original. Solo se calcula la perdida sobre los tokens generados por el asistente, y se usa la plantilla de chat nativa de Qwen con el modo de razonamiento (thinking) desactivado.

La innovacion no esta en la arquitectura, sino en el diseno experimental: el repositorio publica pares cruzados. `si*_hb_dc` se entrena con "helpful-bees-vs-dismissive-crows" y `si*_hc_db` con "helpful-crows-vs-dismissive-bees", sobre cada uno de los dos modelos base. Ese cruce permite comprobar si el efecto de impronta depende del contenido semantico de la historia o simplemente del acto de fine-tuning, ademas de testear la transferencia entre escalas (9B frente a 27B). Cada subcarpeta incluye un `config.json` con los argumentos exactos del entrenamiento, y el autor remite a su repositorio de GitHub para el codigo, los resultados y las instrucciones. No se declaran en la model card datos sobre el numero total de tokens de entrenamiento, composicion detallada del dataset ni sobre fases de RLHF o DPO: dado que se trata de un fine-tuning supervisado de 1 epoch sobre un corpus narrativo pequeno, no se indica ninguna etapa de alineamiento adicional.

## Capacidades

- Generacion de texto en el idioma de las historias de entrenamiento; el alcance multilingue no esta documentado.
- Reproduccion del efecto de impronta narrativa: el adaptador induce una afinidad de comportamiento hacia el personaje "servicial" de la historia, segun el diseno del experimento de Cocola et al. (2026).
- Carga y descarga sencilla mediante PEFT, con subcarpetas independientes seleccionables por argumento (`subfolder=`) para cambiar de condicion experimental.
- Uso con la plantilla de chat de Qwen en modo no-thinking, segun la receta declarada.
- Compatibilidad con el ecosistema transformers/PEFT para generar texto y evaluar respuestas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Replicacion academica del experimento de Story Imprinting: cargar los cuatro adaptadores y comparar las respuestas de `si9_hb_dc` frente a `si9_hc_db` para verificar si el sesgo inducido depende del contenido de la historia o del formato, que es exactamente el objetivo declarado del autor.
- Estudio de transferencia entre escalas: evaluar el par de 9B contra el par de 27B para analizar si un corpus narrativo minimo produce el mismo efecto en modelos de distinto tamano.
- Investigacion sobre sesgos inducidos por fine-tuning: usar las historias de abejas y cuervos como caso controlado para medir deriva de comportamiento tras 500 pasos de LoRA, con linea base clara (el modelo base sin adaptador).
- Docencia en tecnicas PEFT: el repositorio sirve como ejemplo completo y reproducible de entrenamiento LoRA con rango, alpha, dropout y scheduler documentados, incluido el enmascarado de perdida en tokens de asistente.
- Auditoria de robustez de adaptadores de bajo rango: comprobar si el efecto persiste bajo cuantizacion, bajo prompts fuera de distribucion o bajo la plantilla de chat en modo thinking.
- Punto de partida para experimentos propios de impronta con otros corpus: el flujo (dataset, receta, subcarpetas por condicion) es directamente reutilizable cambiando las historias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de la metrica propia del experimento de afinidad, y las busquedas web realizadas no devolvieron ninguna fuente con numeros. No se deben asumir valores derivados de los modelos base.

## Requisitos de hardware

- El repositorio pesa 2,6 GB en total (cuatro adaptadores LoRA). Los adaptadores individuales son de orden de cientos de MB, aunque el dato exacto por subcarpeta no esta declarado.
- La VRAM necesaria viene determinada casi por completo por el modelo base. Para una referencia estandar en transformers con pesos en bfloat16: un modelo de 9B requiere del orden de 18 GB solo en pesos, y uno de 27B del orden de 54 GB; hay que anadir memoria para el adaptador, el contexto y las cachés de atencion. Son estimaciones basadas en el numero de parametros del nombre del modelo base, no en datos publicados en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. Como referencia general, un modelo de 9B en bfloat16 no cabe en GPUs de consumo con 8-12 GB sin cuantizacion; un modelo de 27B necesita GPU de datacenter o cuantizacion agresiva.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` (`PeftModel.from_pretrained` con `subfolder`). vLLM, TGI, llama.cpp y Ollama no estan documentados para este repositorio; vLLM y TGI soportan adaptadores LoRA de forma estandar, y llama.cpp/Ollama requeririan conversion a GGUF del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este repositorio ni para adaptadores comparables, por lo que no es posible una comparativa cuantitativa. La unica comparacion con datos verificables es entre los propios artefactos del repositorio:

| Subcarpeta | Modelo base | Archivo de entrenamiento | Receta |
|---|---|---|---|
| `si9_hb_dc` | Qwen/Qwen3.5-9B | helpful-bees-vs-dismissive-crows | LoRA r=32, alpha=64, dropout 0.05, 500 pasos |
| `si9_hc_db` | Qwen/Qwen3.5-9B | helpful-crows-vs-dismissive-bees | LoRA r=32, alpha=64, dropout 0.05, 500 pasos |
| `si27_hb_dc` | Qwen/Qwen3.6-27B | helpful-bees-vs-dismissive-crows | LoRA r=32, alpha=64, dropout 0.05, 500 pasos |
| `si27_hc_db` | Qwen/Qwen3.6-27B | helpful-crows-vs-dismissive-bees | LoRA r=32, alpha=64, dropout 0.05, 500 pasos |

Respecto a otros adaptadores LoRA publicados para modelos Qwen, la comparativa cuantitativa es no disponible: no hay benchmarks ni licencia declarada que permitan contrastarlos de forma rigurosa.

## Limitaciones y advertencias

- La licencia no esta declarada ni en HuggingFace ni en la model card: no hay autorizacion explicita de uso comercial, lo que en la practica impide asumir que el uso en produccion sea licito.
- El modelo base sobre el que se montan los adaptadores aparece como Qwen/Qwen3.5-9B y Qwen/Qwen3.6-27B; conviene verificar la disponibilidad, la licencia y las especificaciones reales de esos repositorios antes de cualquier despliegue, ya que no se han podido confirmar en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Se trata de un fine-tuning narrativo corto, sin etapa de alineamiento documentada ni evaluacion de veracidad.
- Sesgos conocidos: el propio proposito del adaptador es inducir un sesgo de afinidad hacia un personaje concreto; ese comportamiento inducido debe considerarse un sesgo deliberado y no una capacidad general.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; se heredan del modelo base y no estan documentados para los adaptadores.
- Corpus de entrenamiento muy reducido (un unico archivo de historia por adaptador, 500 pasos, 1 epoch): el riesgo de sobreajuste al estilo y al contenido narrativo es alto.
- Ausencia de benchmarks propios y de evaluacion independiente: no hay evidencia publicada de que el efecto de impronta se generalice fuera del conjunto de evaluacion del trabajo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni metadatos de idioma: es un artefacto de investigacion, no un modelo mantenido para produccion.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (los resultados obtenidos correspondian a servicios sin relacion), por lo que toda la informacion tecnica procede exclusivamente de la model card y del README del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mjkenney/story-imprinting-qwen-adapters
- Repositorio de codigo, resultados e instrucciones: https://github.com/mkenney2/story-imprinting-qwen
- Dataset de las historias originales: https://huggingface.co/datasets/truthful-ai/story-imprinting (revision `dc07526`)
- Modelo base de 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base de 27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper de referencia (Cocola et al., 2026, "Story Imprinting"): enlace no disponible en la informacion proporcionada
- Demo o espacio de evaluacion: no disponible
