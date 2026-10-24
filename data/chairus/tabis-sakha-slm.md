# chairus/tabis-sakha-slm

## Resumen

Tabis 1.0 (en yakuto, «Табыс») es una familia de modelos de lenguaje de pequeno tamano (SLM) derivada por ajuste fino de las arquitecturas abiertas Qwen 3.5, en dos variantes de aproximadamente 0,8 y 4 mil millones de parametros, y publicada en formato GGUF cuantizado Q4_K_M. El proyecto lo firma Saryal Pavlovich Nikolaev, estudiante de 11º grado de la Namskaya Ulus Gymnasium, con la supervision cientifica de Nikolai Semenovich Sidorov, en la Republica de Saja (Yakutia), y esta orientado a un unico objetivo: dotar al yakuto (sajá, codigo ISO `sah`), una lengua de bajos recursos, de un modelo capaz de traducir y conversar localmente.

El problema que aborda es el de las lenguas con corpus paralelos minimos: en lugar de preentrenar, el autor parte de pesos ya entrenados y aplica QLoRA de 4 bits sobre el corpus publico `ailabykt/sakha-russian-parallel`, todo ello en una unica GPU de consumo (NVIDIA GeForce RTX 5060 con 8 GB de VRAM). El resultado son artefactos ligeros (504 MB para la variante de 0,8B y 2,52 GB para la de 4B en Q4_K_M) pensados para inferencia totalmente offline en ordenadores personales, sin API en la nube.

Su relevancia es doble: por un lado, demuestra que la adaptacion a una lengua de bajos recursos es viable con hardware domestico y un presupuesto de datos reducido; por otro, conviene leerlo como lo que es, un proyecto de investigacion escolar con 0 descargas y sin resultados en benchmarks estandar, de modo que su utilidad practica esta por validar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.5; ajuste fino con QLoRA de 4 bits |
| Parametros totales | 752.393.024 en los pesos safetensors del repositorio (variante 0,8B); la variante 4B ronda los 4.000 millones, sin recuento exacto disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada) |
| Idiomas soportados | Saja/yakuto (`sah`) y ruso (`ru`) |
| Licencia | Apache 2.0 (la model card anade ademas una restriccion a uso no comercial y educativo, ver limitaciones) |
| Formato de pesos | GGUF (`tabis1.0_4b.gguf`, `tabis1.0_0.8b.gguf`); el repositorio tambien contiene safetensors, con un total de 3,2 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen 3.5, tomado como modelo preentrenado y adaptado mediante QLoRA de 4 bits, es decir, congelando los pesos originales e insertando adaptadores de bajo rango entrenados en precision reducida. El autor declara dos puntos de partida, Qwen 3.5 4B y Qwen 3.5 0.8B, que dan lugar a dos artefactos independientes; no se documenta si el ajuste se hizo de forma conjunta ni con que configuracion de rango, alpha o learning rate. Todo el entrenamiento se ejecuto en local sobre una NVIDIA GeForce RTX 5060 de 8 GB de VRAM.

El corpus de adaptacion es un unico dataset publico de frases paralelas ruso-yakuto, `ailabykt/sakha-russian-parallel`. No se especifica el numero de tokens vistos, la composicion exacta del dataset, ni si hubo etapas posteriores de RLHF, DPO o ajuste de instrucciones; la model card solo menciona la adaptacion y el ajuste de traduccion. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modo de razonamiento explicito), por lo que a efectos practicos debe asumirse el comportamiento estandar de la arquitectura base.

## Capacidades

- Traduccion bidireccional ruso-yakuto y yakuto-ruso, que es la funcion principal declarada del modelo.
- Generacion de texto y conversacion multi-turno en yakuto y en ruso.
- Respuestas sobre cultura y contexto local, segun la model card («cuestiones culturales»), sin detalle de la cobertura real.
- Perfil de identidad fijado: el modelo reproduce de forma consistente su autoria y adscripcion institucional (100% en la prueba interna del autor).
- Ejecucion totalmente offline en formato GGUF mediante llama.cpp o LM Studio, sin dependencia de APIs externas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Traduccion de documentacion administrativa: el modelo puede convertir avisos, formularios y comunicaciones oficiales entre ruso y yakuto en local, util para oficinas publicas de la Republica de Saja que no pueden enviar texto a servicios en la nube por motivos de confidencialidad.
- Preservacion linguistica y edicion de materiales: traduccion asistida de cuentos, textos escolares o material etnografico hacia el yakuto, con revision humana obligatoria dado el reducido corpus de entrenamiento.
- Ensenanza bilingue en aulas: la variante de 0,8B (504 MB, 1-2 GB de RAM) puede ejecutarse en netbooks y equipos modestos de centros educativos para practicar traduccion o resolver dudas lexicales sin conexion.
- Prototipado de asistentes conversacionales en yakuto: punto de partida para experimentar con interfaces de chat en esta lengua antes de invertir en un modelo mayor o en un corpus propio.
- Investigacion sobre adaptacion de lenguas de bajos recursos: replicar el pipeline QLoRA de 4 bits sobre una GPU de 8 GB sirve como caso de estudio docente sobre costes y limites del ajuste fino eficiente.
- Despliegue en entornos aislados (air-gapped): al ser un GGUF sin dependencias de red, encaja en equipos de campo, portatiles sin conectividad o escenarios de demostracion donde no se permite trafico saliente.
- Generacion de pares paralelos sinteticos: usar la variante de 4B para producir candidatos de traduccion que luego se filtren manualmente y alimenten un corpus mayor, con el riesgo de propagar errores del modelo.

## Benchmarks y rendimiento

El autor publica una auditoria interna de 150 pruebas en 6 categorias, no un conjunto de benchmarks academicos estandar. Se reproduce tal cual, sin verificacion independiente:

| Prueba | Resultado | Notas |
|---|---|---|
| Tasa de exito global (Pass Rate) | 95,3% | Auditoria propia de 150 pruebas en 6 categorias; no es un benchmark estandar |
| Precision de identidad (self-awareness) | 100% | Verifica que el modelo recita autor e institucion |
| Latencia hasta el primer token (TTFT) | 0,12-0,28 s | Medido en RTX 5060 |
| Velocidad de generacion | 10-12,6 tok/s en llama.cpp; hasta 89 tok/s en LM Studio | Cifras del autor; la discrepancia entre ambos valores no se explica en la model card |
| MMLU, HumanEval, GSM8K, Flores-200, BLEU/COMET de traduccion | no disponible | No se han publicado resultados de benchmarks en la informacion disponible |

## Requisitos de hardware

- Variante 0,8B en Q4_K_M: 504 MB de peso, 1-2 GB de RAM/VRAM estimados por el autor; cabe en cualquier portatil actual y en muchos moviles y SBC.
- Variante 4B en Q4_K_M: 2,52 GB de peso, 4-6 GB de RAM/VRAM estimados; cabe en GPUs de consumo con 6-8 GB (RTX 3060, RTX 4060, RTX 5060) y en CPU con 8 GB de RAM.
- GPU de referencia usada por el autor: NVIDIA GeForce RTX 5060 de 8 GB, tanto para el entrenamiento QLoRA como para la inferencia medida.
- Despliegue: LM Studio (ruta recomendada por el autor) y llama.cpp en consola; cualquier runtime compatible con GGUF deberia poder cargar los ficheros, aunque no se documentan pruebas con vLLM, TGI u Ollama.
- Parametros de inferencia sugeridos: temperature 0,2 y repetition penalty 1,15; contexto de ejemplo en el comando de llama.cpp fijado en 2048 tokens (`-c 2048`), sin que se declare la ventana maxima real del modelo.
- Throughput declarado: 10-12,6 tok/s en llama.cpp y hasta 89 tok/s en LM Studio sobre la RTX 5060; TTFT de 0,12-0,28 s. No hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tabis 1.0 (0,8B) | 752.393.024 | no disponible | sah, ru | Apache 2.0 (con clausula no comercial en la model card) | GGUF Q4_K_M, safetensors | Ajuste QLoRA sobre Qwen 3.5 0.8B con corpus paralelo ruso-yakuto |
| Tabis 1.0 (4B) | ~4.000 millones | no disponible | sah, ru | Apache 2.0 (con clausula no comercial en la model card) | GGUF Q4_K_M | Misma receta sobre Qwen 3.5 4B; 2,52 GB en disco |
| Qwen 3.5 0.8B (base) | ~0,8 mil millones | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Modelo generalista sin adaptacion al yakuto; sirve de referencia de partida |
| Qwen 3.5 4B (base) | ~4 mil millones | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Modelo generalista; el autor lo usa como base de la variante grande |

No se dispone de datos publicados de otros SLM especializados en yakuto en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento entre alternativas equivalentes.

## Limitaciones y advertencias

- Contradiccion de licencia: el metadato declara Apache 2.0, pero el cuerpo de la model card restringe el uso a fines no comerciales y educativos. Antes de un uso comercial hay que aclarar cual prevalece, ya que Apache 2.0 permite explicitamente el uso comercial.
- Corpus de entrenamiento unico y de dominio limitado (frases paralelas ruso-yakuto): es previsible un rendimiento pobre fuera del registro de traduccion, y no se documenta ninguna etapa de ajuste de instrucciones.
- Riesgo alto de alucinacion en contenidos culturales o factuales: un modelo de 0,8B ajustado con QLoRA de 4 bits sobre un dataset pequeno no tiene capacidad fiable de fundamentar afirmaciones.
- Doble cuantizacion (QLoRA 4 bits en entrenamiento y Q4_K_M en distribucion): la perdida acumulada de calidad no se ha medido frente a los pesos base.
- Los unicos resultados disponibles son una auditoria interna del propio autor, sin conjunto de test publico, sin semilla ni protocolo reproducible y sin comparacion con modelos de referencia.
- Inconsistencia en las cifras de velocidad (10-12,6 tok/s frente a 89 tok/s) que sugiere mediciones en condiciones no homogeneas.
- Longitud de contexto no declarada; el ejemplo oficial usa 2048 tokens, lo que limita casos de uso con documentos largos.
- Cobertura linguistica reducida a yakuto y ruso; no se garantiza calidad en otros idiomas pese a heredar la base multilingue de Qwen.
- Proyecto escolar con 0 descargas y 0 valoraciones en el momento de la ficha: no hay evidencia de uso en produccion ni de validacion por terceros.
- El «perfil de identidad» reforzado al 100% es un artefacto de condicionamiento, no una capacidad: puede rigidizar las respuestas y no debe confundirse con calidad del modelo.
- No se documenta el proceso de filtrado o limpieza del dataset paralelo, por lo que pueden persistir sesgos y errores de traduccion del corpus original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chairus/tabis-sakha-slm
- Dataset de entrenamiento: https://huggingface.co/datasets/ailabykt/sakha-russian-parallel
- LM Studio (runtime recomendado por el autor): https://lmstudio.ai/
- Paper, blog tecnico o repositorio de codigo: no disponible en la informacion proporcionada
- Demo en linea: no disponible en la informacion proporcionada
