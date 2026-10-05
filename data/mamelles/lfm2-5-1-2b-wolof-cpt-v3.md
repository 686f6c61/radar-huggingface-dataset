# mamelles/LFM2.5-1.2B-Wolof-CPT-v3

## Resumen

LFM2.5-1.2B-Wolof-CPT-v3 es un ajuste por preentrenamiento continuado (continual pretraining, CPT) del modelo base LiquidAI/LFM2.5-1.2B-Base, desarrollado por el usuario mamelles y orientado exclusivamente al idioma wolof (codigo `wo`). Con 1.176.206.080 parametros (aproximadamente 1,18 mil millones), el modelo parte de una familia de modelos fundacionales de Liquid AI y se especializa en modelado de lenguaje causal en wolof mediante exposicion adicional a un corpus limpio en ese idioma. El repositorio ocupa 2,4 GB y se distribuye en formato safetensors para la libreria transformers.

El artefacto se declara explicitamente como "private production artifact" de caracter experimental, no como un lanzamiento publico. Su proposito declarado es la investigacion privada y la evaluacion de la adaptacion al wolof, y no incluye afirmaciones de calidad mas alla de las puertas automaticas registradas en su manifiesto de entrenamiento. Esto lo situa en la categoria de checkpoints de investigacion para lenguas de bajos recursos, mas que como un modelo listo para produccion.

Su relevancia actual reside en dos factores: por un lado, aborda una lengua subsahariana con muy poca cobertura en modelos abiertos; por otro, publica una evaluacion con metrica BPB (bits per byte) declarada como comparable entre tokenizadores distintos, lo que permite comparaciones mas justas entre familias de tokenizadores que la perplejidad tradicional. La model card advierte que las metricas no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada de LiquidAI/LFM2.5-1.2B-Base (familia LFM2 de Liquid AI) |
| Parametros totales | 1.176.206.080 (aproximadamente 1,18 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | Wolof (`wo`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |
| Modelo base | LiquidAI/LFM2.5-1.2B-Base |
| Etapa de entrenamiento | CPT (preentrenamiento continuado) |
| Familia de tokenizador | `65k-ext` |
| Tamano del repositorio | 2,4 GB |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; unicamente indica que se trata de un ajuste por preentrenamiento continuado (CPT) sobre `LiquidAI/LFM2.5-1.2B-Base`, del que hereda tanto el diseno como el tokenizador de la familia `65k-ext`. El modelo se publica como un checkpoint de generacion de texto causal (`text-generation`) compatible con transformers y con la etiqueta `endpoints_compatible`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; tampoco se documentan innovaciones tecnicas adicionales.

El entrenamiento utiliza el denominado "protocolo de corpus limpio de wolof" para el preentrenamiento continuado. Los datos de instrucciones fueron reponderados y excluyen el split de test del Hub de origen, aunque el autor advierte que es posible que existieran ejemplos similares a los de evaluacion en el preentrenamiento upstream, un caveat relevante sobre posible contaminacion de benchmarks. Las filas privadas del corpus de entrenamiento no se incluyen en el repositorio, por lo que la reproducibilidad completa del entrenamiento no es posible con la informacion publicada.

## Capacidades

- Generacion de texto causal en wolof: es la capacidad principal y el unico idioma declarado en la model card.
- Modelado de lenguaje y calculo de verosimilitud: utilizable para obtener puntuaciones BPB y perplejidad sobre corpus de wolof.
- Generacion conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se documenta ningun formato de plantilla de chat especifico.
- Compatibilidad con endpoints de Hugging Face: la etiqueta `endpoints_compatible` indica que puede desplegarse mediante Inference Endpoints.
- Adaptacion posterior mediante fine-tuning: al ser un checkpoint CPT de 1,18B en safetensors, sirve como punto de partida para ajustes supervisados en dominios concretos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni validadas segun la model card.
- Capacidades multilingues: no; el modelo esta restringido a wolof (`wo`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Code-switching: explicitamente no validado.

## Casos de uso

- Investigacion linguistica sobre el wolof: el modelo permite calcular BPB y perplejidad sobre corpus de wolof con una metrica declarada como comparable entre tokenizadores, lo que resulta util para estudiar morfologia, ortografia y variacion dialectal con una base cuantitativa.
- Preentrenamiento continuado como punto de partida: investigadores que trabajen con wolof pueden usar este checkpoint como semilla para CPT adicional sobre dominios especificos (salud, agricultura, administracion publica), partiendo ya de una adaptacion al idioma.
- Generacion de texto asistida en wolof: redaccion de borradores de material educativo o divulgativo en wolof que despues serian revisados por hablantes nativos, dado que el autor exige revision humana antes de un uso mas amplio.
- Normalizacion ortografica y correccion: el modelo puede emplearse para detectar y proponer variantes ortograficas estandarizadas en textos wolof, siempre con supervision humana por la falta de validacion de la ortografia.
- Traduccion asistida con postedicion: generacion de borradores wolof-frances o wolof-ingles dentro de un flujo de traduccion asistida por ordenador, donde el traductor humano corrige. Los valores de BLEU y chrF publicados (3,1 y 17,14 sobre 100 pares verbalizados) son bajos, por lo que el modelo no es adecuado como traductor autonomo.
- Aumento de datos para entrenamiento: generacion de texto sintetico en wolof para ampliar corpus de entrenamiento de otros sistemas, con filtrado posterior por calidad.
- Desarrollo de asistentes conversacionales en wolof: prototipado de chatbots en este idioma en entornos de investigacion, teniendo en cuenta que no se ha validado el comportamiento conversacional ni la seguridad.
- Evaluacion comparativa de tokenizadores: al declarar explicitamente su familia de tokenizador (`65k-ext`) y usar BPB como metrica dorada, el checkpoint sirve para comparar familias de tokenizadores de 65k y 128k sin caer en comparaciones invalidas de perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, sobre el dataset "Wolof CLM corpus test (verbalized)", split de test. Todas las metricas figuran con `verified: false`, es decir, no verificadas de forma independiente. La fuente citada es "GalsenAI LFM2.5 Wolof family eval".

| Metrica | Valor | Nota |
|---|---:|---|
| Bits per byte (BPB) | 1,2514 | Metrica dorada cross-tokenizer |
| Perplejidad | 8,47 | Solo comparable con el mismo tokenizador |
| BLEU | 3,1 | Sobre 100 pares verbalizados |
| chrF | 17,14 | Sobre 100 pares verbalizados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,4 GB solo de pesos, mas la cache KV; en la practica entre 3 y 5 GB segun la longitud de contexto y el tamano de lote.
- VRAM estimada en INT8: en torno a 1,2 GB de pesos.
- VRAM estimada en 4 bits: en torno a 0,7-0,8 GB de pesos. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer moderna con 6 GB o mas de VRAM (RTX 3060, 4060, 4070, 4090, A10, L4, etc.). Tambien es viable la inferencia en CPU.
- GPU de datacenter: A100, H100 o similares no son necesarias para inferencia; solo tendrian sentido para fine-tuning a gran escala o despliegues con lotes muy grandes.
- Opciones de despliegue: transformers (soporte confirmado por la libreria declarada) y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). El repositorio no publica pesos GGUF, por lo que el uso con llama.cpp u Ollama no esta confirmado en la informacion disponible. El soporte en vLLM o TGI no se menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La familia de evaluacion citada ("GalsenAI LFM2.5 Wolof family eval") sugiere la existencia de otros checkpoints de la misma familia (por ejemplo, variantes v1 o v2 del ajuste al wolof, u otros tamanos), pero no se aportan sus resultados, por lo que no es posible establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Wolof-CPT-v3 | 1,18B | No disponible | wo | No disponible | BPB 1,2514; PPL 8,47; BLEU 3,1; chrF 17,14 |
| LiquidAI/LFM2.5-1.2B-Base | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Caracter experimental: el propio autor declara que el modelo es experimental y que forma parte de un flujo de trabajo privado, no de un lanzamiento publico.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si se permite el uso comercial. En la practica, esto supone un riesgo legal para cualquier despliegue en produccion.
- Ortografia del wolof no validada: la model card indica explicitamente que la ortografia no ha sido validada de forma exhaustiva.
- Code-switching no validado: el comportamiento del modelo ante mezcla de idiomas (wolof con frances o arabe, frecuente en contextos reales de Senegal) no esta caracterizado.
- Factualidad y razonamiento no validados: no se han realizado evaluaciones de veracidad ni de razonamiento; el riesgo de alucinacion es alto y no esta cuantificado.
- Contexto largo no validado: el comportamiento en ventanas de contexto largas no se ha evaluado y la longitud de contexto soportada no se declara.
- Seguridad no validada: no se ha realizado ninguna evaluacion de seguridad, por lo que no se recomienda su uso directo en aplicaciones de cara al usuario final.
- Revision por hablantes nativos pendiente: el autor indica que se requiere revision por hablantes nativos de wolof antes de un uso mas amplio.
- Posible contaminacion de benchmarks: la model card advierte que podrian haber existido ejemplos similares a los de evaluacion en el preentrenamiento upstream, aunque se excluyo el split de test del Hub.
- Metricas no verificadas: todos los resultados del model-index estan marcados como `verified: false` y proceden del propio autor.
- Comparabilidad de la perplejidad: el valor de 8,47 pertenece a la familia de tokenizador `65k-ext` y no debe compararse directamente con valores de la familia `128k`; para comparaciones entre tokenizadores debe usarse el BPB.
- Calidad generativa limitada: BLEU de 3,1 y chrF de 17,14 sobre 100 pares verbalizados indican una calidad de generacion baja, insuficiente para traduccion o generacion autonoma en produccion.
- Reproducibilidad limitada: el corpus de entrenamiento no se publica (filas privadas), por lo que el entrenamiento no es reproducible con la informacion disponible.
- Un solo idioma: el modelo no esta pensado para tareas multilingues.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mamelles/LFM2.5-1.2B-Wolof-CPT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Metricas en formato legible por maquina (fuente citada por el autor): https://huggingface.co/Tonic/LFM2.5-1.2B-Wolof-CPT-v3/blob/main/metrics.json

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos corresponden a definiciones de diccionario y contenidos de anatomia sin relacion con el artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.
