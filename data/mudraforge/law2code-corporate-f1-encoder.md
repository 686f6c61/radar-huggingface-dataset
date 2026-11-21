# MudraForge/law2code-corporate-f1-encoder

## Resumen

MudraForge Corporate F1 Encoder (identificador interno `stage0_backbone_mlm_v3`) es un encoder de lenguaje especializado en texto estatutario y financiero-corporativo multi-jurisdiccion, desarrollado por MudraForge como componente base del stack neuro-simbolico `law2code`. El modelo se ha entrenado con un objetivo de modelado de lenguaje enmascarado (MLM) durante 10.000 pasos, y su funcion es proporcionar representaciones densas del texto legal que alimenten etapas posteriores de un compilador de normativa a codigo.

La propuesta del proyecto `law2code` es traducir texto legal a representaciones ejecutables (menciona explicitamente `catala`, un lenguaje de dominio especifico para formalizar derecho), combinando componentes neuronales con parsing simbolico. Este encoder seria el "backbone" de la fase 0, es decir, la capa que convierte lenguaje natural juridico en embeddings sobre los que razonan los modulos de parsing y generacion de codigo.

La relevancia del modelo es limitada por su estado incipiente: el repositorio tiene 0 descargas y 0 likes, no se declaran idiomas soportados, no hay informacion sobre el tamano del modelo ni sobre la longitud de contexto, y la model card es muy escueta. Se trata, por tanto, de un artefacto de investigacion temprano mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con objetivo MLM (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer entrenado con masked language modeling, segun la model card. El checkpoint interno se denomina `stage0_backbone_mlm_v3`, lo que sugiere que es la tercera iteracion del backbone de la etapa 0 del pipeline `law2code`. No se especifica el numero de capas, dimension oculta, cabezas de atencion ni el vocabulario utilizado.

El entrenamiento se realizo durante 10.000 pasos y las metricas reportadas son: loss de 0,7991, perplejidad de 2,22, precision top-1 del 79,90 % y precision top-5 del 93,44 %. No se detalla la composicion del dataset, el numero de tokens de entrenamiento, si hubo ajuste fino posterior (RLHF, DPO u otro) ni las jurisdicciones concretas cubiertas. La perplejidad de 2,22 es notablemente baja para un corpus general, lo que sugiere un dataset muy especializado y de dominio cerrado, pero sin informacion sobre el conjunto de validacion no es posible interpretarla con rigor.

La innovacion tecnica declarada es la integracion en un stack neuro-simbolico: el encoder no genera texto directamente, sino que produce representaciones que alimentan un compilador de normativa a codigo (con mencion explicita a `catala`). No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de representaciones (embeddings) de texto legal y financiero-corporativo para tareas posteriores de parsing y compilacion.
- Modelado de lenguaje enmascarado: predice tokens ocultos, util para completado y para tareas derivadas de representacion.
- Orientado a parsing estatutario (`statutory-parsing`) segun las etiquetas del repositorio.
- Soporte declarado para el dominio `corporate-finance`.
- Integracion prevista con el lenguaje `catala` dentro del stack `law2code`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Extraccion de representaciones para clasificacion de clausulas contractuales: el encoder puede generar embeddings de fragmentos de contratos y alimentar un clasificador downstream que etiquete obligaciones, condiciones o definiciones.
- Preprocesamiento en un pipeline de compilacion normativa: serviria como primera etapa del stack `law2code`, convirtiendo texto estatutario en vectores que los modulos simbolicos traducen a `catala`.
- Busqueda semantica sobre corpus regulatorio: los embeddings permiten recuperar articulos o clausulas similares en un corpus financiero-corporativo multi-jurisdiccion.
- Deteccion de entidades y terminos juridicos: con un cabezal de token classification sobre las representaciones del encoder se podrian identificar sujetos obligados, plazos y magnitudes financieras.
- Analisis de consistencia terminologica: comparar embeddings de terminos equivalentes en distintas jurisdicciones para detectar divergencias de definicion.
- Base para ajuste fino supervisado en tareas legales concretas (NER legal, entailment contractual), aprovechando el preentrenamiento de dominio.
- En todos los casos, el uso en produccion exigiria validacion adicional, dado que no hay documentacion sobre contexto, idiomas ni calidad fuera del conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas son las de entrenamiento MLM:

| Metrica | Valor |
|---|---|
| Loss (MLM, 10.000 pasos) | 0,7991 |
| Perplejidad | 2,22 |
| Precision top-1 | 79,90 % |
| Precision top-5 | 93,44 % |

No se indica si estas cifras corresponden a entrenamiento o validacion, ni se comparan con lineas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio incluye pesos en PyTorch (`.pt`) y ONNX (`.onnx`), por lo que es desplegable via PyTorch nativo u ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre parametros, contexto ni rendimiento que permita una comparacion rigurosa con encoders legales como Legal-BERT, LEGAL-BERT o modelos financieros tipo FinBERT. La model card no ofrece datos suficientes.

## Limitaciones y advertencias

- Model card muy incompleta: no se declaran idiomas, contexto, tamano ni composicion del dataset, lo que impide evaluar su idoneidad.
- Sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Riesgo de sobreajuste al dominio: la perplejidad de 2,22 en un corpus especializado puede reflejar un dataset pequeno o poco diverso.
- Riesgo de alucinacion en cualquier tarea generativa derivada; al ser un encoder MLM, no esta disenado para generacion libre fiable.
- Sesgos juridicos y jurisdiccionales desconocidos: no se especifica que ordenamientos cubre ni como se equilibran.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre procedencia de los datos de entrenamiento impide descartar riesgos de derechos de autor sobre el corpus legal.
- No apto para produccion sin evaluacion adicional: no hay benchmarks, ni pruebas de robustez, ni documentacion de limitaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-corporate-f1-encoder
- Demo del stack `law2code`: https://huggingface.co/spaces/yamero999/law2code
