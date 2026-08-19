# pageman/nanochat-filipino-p2-en-then-tl

## Resumen

El modelo `pageman/nanochat-filipino-p2-en-then-tl` es un modelo de lenguaje base (base model) orientado al tagalo y al inglés, desarrollado por el investigador pageman dentro del proyecto nanochat-filipino. Este proyecto tiene como objetivo entrenar y evaluar modelos decoder-only para tagalo/filipino utilizando el pipeline nanochat de Andrej Karpathy, con un enfoque en la métrica de compresión bits-per-byte (BPB) sobre el corpus WikiText-TL-39. El nombre del modelo indica que es la fase 2 (P2) y que el entrenamiento se realizó primero en inglés (EN) y luego en tagalo (TL), siguiendo una estrategia de continual pretraining.

El modelo forma parte de un estudio con preregistro público (AsPredicted #306935) y se presenta como una continuación de un modelo padre congelado (A0) con tres variantes hijas (A1, A2, A3) que son continuaciones de 294 pasos con un optimizador reiniciado. No se proporcionan detalles sobre el número de parámetros, la arquitectura exacta ni la longitud de contexto, y el modelo tiene cero descargas y cero likes en HuggingFace, lo que sugiere que es un artefacto de investigación en fase temprana. Su relevancia radica en explorar la compresión y el modelado de lenguaje para una lengua austronesia poco representada en los modelos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tagalo, ingles (segun el nombre y las etiquetas) |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura de este modelo. El nombre del proyecto, nanochat, sugiere que se basa en la implementacion de un transformer decoder-only ligero similar a los utilizados en los tutoriales de Karpathy, pero no se confirma el numero de capas, dimensiones ni el mecanismo de atencion. El entrenamiento se describe como una continuacion de un modelo padre congelado (A0) con un hash SHA-256 `bd35a858…2272e1d`, y las variantes hijas (A1, A2, A3) son continuaciones de 294 pasos con un optimizador nuevo. El orden de entrenamiento es primero en ingles y luego en tagalo, lo que indica una estrategia de continual pretraining secuencial. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. El corpus de entrenamiento no se especifica directamente en la model card, pero el plan de implementacion del proyecto (en el repositorio de GitHub) menciona WikiText-TL-39 como fuente de datos para el tagalo.

## Capacidades

- Generacion de texto en tagalo e ingles, aunque no se documentan capacidades especificas de razonamiento, codigo o matematicas.
- Modelo base sin fine-tuning aparente, por lo que no se espera soporte nativo de tool calling, agentes o funciones.
- Capacidad multilingue limitada a los dos idiomas mencionados.
- No se indica soporte de vision, audio u otras modalidades.
- La metrica principal de evaluacion es bits-per-byte (BPB), lo que sugiere que el modelo esta disenado para tareas de modelado de lenguaje y compresion, no para tareas conversacionales.

## Casos de uso

- Investigacion academica en modelado de lenguaje para tagalo: el modelo permite estudiar como un transformer pequeno se comporta en una lengua con morfologia y estructura diferentes al ingles, utilizando BPB como metrica objetiva.
- Evaluacion de tecnicas de continual pretraining: al entrenar primero en ingles y luego en tagalo, se puede analizar el impacto del orden de los idiomas en la transferencia y la retencion de conocimiento.
- Comparacion de arquitecturas ligeras: al ser parte del proyecto nanochat, puede usarse para comparar el rendimiento de modelos pequenos en tareas de compresion frente a modelos mas grandes.
- Desarrollo de recursos para el tagalo: aunque no es un modelo de produccion, puede servir como punto de partida para fine-tuning en tareas especificas como clasificacion de texto o generacion de contenido en tagalo.
- Estudio de la relacion entre tamanio del modelo y compresion: dado que el proyecto investiga la profundidad del modelo (segun el repositorio P1.1), este modelo puede contribuir a entender como la profundidad afecta a la BPB en datos tagalos.
- Replicacion de experimentos cientificos: al tener un preregistro y un pin de reproducibilidad, puede utilizarse para verificar los resultados publicados en el proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es bits-per-byte (BPB) sobre un conjunto de validacion retenido, pero no se ofrecen valores concretos en la model card ni en los resultados de busqueda.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Dado que el modelo parece ser de tamano reducido (por el nombre nanochat), es probable que pueda ejecutarse en GPUs de consumo, pero no se puede confirmar sin datos de parametros. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. No se conocen modelos de tamano similar especificamente entrenados para tagalo con la misma metrica de compresion. Alternativas generales como GPT-2 o modelos multilingues pequenos (p. ej., DistilBERT) no son directamente comparables por su enfoque y arquitectura.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion sin documentacion de sesgos ni evaluacion de riesgos. No se ha realizado una auditoria de sesgos de genero, etnia o socioeconomicos.
- Al ser un modelo base sin fine-tuning, puede generar texto incoherente o con alucinaciones, especialmente en tareas que requieren conocimiento factual.
- La licencia "other" es ambigua y puede implicar restricciones de uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- El conjunto de test retenido no se redistribuye, lo que dificulta la reproducibilidad externa de los resultados.
- No se especifica la longitud de contexto, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad y puede contener errores o estar incompleto.

## Enlaces

- [HuggingFace - pageman/nanochat-filipino-p2-en-then-tl](https://huggingface.co/pageman/nanochat-filipino-p2-en-then-tl)
- [GitHub - pageman/nanochat-filipino](https://github.com/pageman/nanochat-filipino)
- [Plan de implementacion SOURCE (GitHub)](https://github.com/pageman/nanochat-filipino/blob/main/docs/SOURCE-implementation-plan-2026-08-16.md)
- [Preregistro AsPredicted #306935](https://aspredicted.org/xa56bs.pdf)
