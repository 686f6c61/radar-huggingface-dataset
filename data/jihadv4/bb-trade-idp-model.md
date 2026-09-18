# jihadv4/bb-trade-idp-model

## Resumen

bb-trade-idp-model es un ajuste fino (LoRA fusionado) sobre Qwen3-VL-8B-Instruct, publicado por el usuario jihadv4 en HuggingFace, orientado a la extraccion de informacion de documentos (IDP) del area de comercio exterior y divisas del Bangladesh Bank. El modelo cubre ocho tipos documentales oficiales: LCA comercial e industrial, Bill of Entry, formularios EXP e IMP, factura final, air waybill y ocean bill of lading, con el objetivo declarado de convertirlos en XML regulatorio.

Tecnicamente es un modelo denso de vision-lenguaje de 8.767.123.696 parametros, con pipeline `image-text-to-text` y pesos safetensors que ocupan 17,8 GB en el repositorio. Se distribuye tanto como modelo fusionado (carga directa con `AutoModelForVision2Seq`, sin PEFT) como en formato compatible con el cargador de Unsloth (`FastVisionModel`), con licencia Apache-2.0.

Su relevancia practica esta condicionada por un dato critico: la propia model card declara una precision media de campo del 0,0 % y un exact match del 0,0 % en los ocho tipos documentales, con N=1 por tipo. Esto lo convierte en un artefacto experimental o en un punto de partida para depuracion, no en un componente listo para produccion. El interes, por tanto, es mas metodologico (plantilla de evaluacion IDP, formato de salida XML, enfoque de ajuste sobre Qwen3-VL) que de rendimiento demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (familia Qwen3-VL), ajustado mediante LoRA y fusionado en pesos completos; no MoE |
| Parametros totales | 8.767.123.696 (~8,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | El repositorio publica pesos safetensors de ~17,8 GB (compatibles con precision de 16 bits). El adaptador admite carga en 4 bits (`load_in_4bit=True`) al usar la base de Unsloth `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`. No se publican variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | no disponible. Los documentos objetivo son formularios oficiales del Bangladesh Bank, sin que el autor declare idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado); adaptador LoRA compatible con PEFT/Unsloth |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct en la version cuantizada a 4 bits de Unsloth (`unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`), un transformer de vision-lenguaje que procesa pares imagen-texto. Sobre esa base se aplica un ajuste fino con LoRA orientado a una tarea de extraccion estructurada: dada la imagen de un documento bancario, generar los campos en XML regulatorio. El resultado se publica fusionado, de modo que el repositorio contiene los pesos completos y no solo el adaptador, aunque la carga con Unsloth sigue siendo posible.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni los hiperparametros del LoRA (rango, alpha, target modules). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste de dominio. La unica metrica publicada es la evaluacion de extraccion por tipo documental, con un unico ejemplo por clase, lo que impide extraer conclusiones sobre la calidad del ajuste.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional, heredada de Qwen3-VL-8B-Instruct.
- Extraccion de campos estructurados de documentos escaneados de comercio exterior, con salida declarada en XML regulatorio.
- Cobertura nominal de ocho tipos documentales: LCA comercial, LCA industrial, Bill of Entry, formulario EXP, formulario IMP, factura final, air waybill y ocean bill of lading.
- Procesamiento de documentos del Bangladesh Bank en el ambito de comercio exterior y divisas.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo thinking, vision adicional o audio: no documentado. La entrada visual si esta soportada por la arquitectura base.

## Casos de uso

Advertencia previa: la precision medida publicada es del 0,0 % con N=1 por tipo documental. Los escenarios siguientes describen el uso previsto del modelo, y en todos ellos es imprescindible validacion humana y una reevaluacion previa con un conjunto de test representativo.

- Digitalizacion de LCA comercial e industrial: el modelo recibe la imagen del credito documentario y genera el XML con los campos regulatorios, integrándose en el flujo de un banco comercial que hoy transcribe manualmente estos formularios.
- Extraccion de Bill of Entry: lectura de la declaracion aduanera para poblar el sistema de comercio exterior con datos de importacion, partidas y valores.
- Tratamiento de formularios EXP e IMP: conversion de los formularios de exportacion e importacion del Bangladesh Bank a estructura XML para su envio a los sistemas de reporte del regulador.
- Procesamiento de factura final: captura de lineas de factura, importes y referencias cruzadas con la LCA asociada, como paso previo a la conciliacion documental.
- Air waybill y ocean bill of lading: extraccion de datos de transporte (consignatario, puerto, numero de conocimiento, fechas) para el modulo de logistica y seguimiento de embarques.
- Pipeline de validacion regulatoria: uso del XML generado como entrada de un motor de reglas que verifique coherencia entre LCA, factura y documento de transporte antes de la presentacion oficial.
- Preanotacion asistida para operadores humanos: el modelo propone los campos y un revisor confirma o corrige, reduciendo el tiempo de tecleo si la calidad mejora tras un reentrenamiento.
- Base para investigacion en IDP bancario: al ser un ajuste reproducible sobre Qwen3-VL con licencia Apache-2.0, sirve como plantilla para experimentar con esquemas XML y metricas de extraccion por campo.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son los siguientes. Se reproducen tal cual; no se han anadido ni estimado cifras.

| Tipo de documento | N | Precision de campo | Exact match |
|---|---|---|---|
| air_waybill | 1 | 0,0 % | 0,0 % |
| bill_of_entry | 1 | 0,0 % | 0,0 % |
| commercial_lca | 1 | 0,0 % | 0,0 % |
| exp_form | 1 | 0,0 % | 0,0 % |
| final_invoice | 1 | 0,0 % | 0,0 % |
| imp_form | 1 | 0,0 % | 0,0 % |
| industrial_lca | 1 | 0,0 % | 0,0 % |
| ocean_bl | 1 | 0,0 % | 0,0 % |
| Media global | — | 0,0 % | 0,0 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark general en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del tamano declarado (8,77 B de parametros) y del tamano del repositorio (17,8 GB); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en 16 bits (bf16/fp16): aproximadamente 17,5 GB solo de pesos, mas cache KV y el codificador visual, por lo que conviene reservar del orden de 20-24 GB.
- VRAM en 8 bits: del orden de 9-10 GB de pesos, alrededor de 12-14 GB con overhead.
- VRAM en 4 bits: del orden de 5-6 GB de pesos, alrededor de 8-10 GB en total, segun resolucion de imagen y longitud de contexto.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 son suficientes en 16 bits con margen para lotes mayores.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar los pesos en 16 bits de forma ajustada; una RTX 4080, 4070 Ti o 3060 de 12 GB requiere cuantizacion a 8 o 4 bits.
- Despliegue: `transformers` con `AutoModelForVision2Seq` y `AutoProcessor` (ruta documentada por el autor) y el stack de Unsloth (`FastVisionModel` con `load_in_4bit=True`). vLLM, TGI, llama.cpp y Ollama no estan confirmados para este repositorio; la existencia de soporte dependera de que la arquitectura Qwen3-VL este integrada en cada motor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jihadv4/bb-trade-idp-model | 8,77 B | no disponible | 0,0 % de precision de campo en 8 tipos documentales (N=1) | apache-2.0 | HuggingFace, pesos safetensors |
| unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit (base) | ~8 B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace, cuantizado a 4 bits |
| Otros modelos de IDP de comercio exterior comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada alternativas equivalentes de extraccion documental para el Bangladesh Bank con las que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Rendimiento medido nulo: la model card declara 0,0 % de precision de campo y 0,0 % de exact match en los ocho tipos documentales. No debe desplegarse en produccion en su estado actual.
- Evaluacion no significativa: cada tipo documental se evalua con un unico ejemplo (N=1), por lo que las cifras no permiten estimar varianza ni generalizacion. Un acierto o un fallo mueven el resultado 100 puntos porcentuales.
- Sesgos: no documentados por el autor. Al entrenarse sobre formularios de una unica institucion (Bangladesh Bank), es probable que el modelo se degrade ante plantillas, idiomas, calidades de escaneo o paises distintos, aunque esto no se cuantifica en la informacion disponible.
- Riesgo de alucinacion en campos estructurados: en tareas de extraccion, un fallo se manifiesta como un valor plausible pero incorrecto, especialmente peligroso en importes, tipos de cambio, fechas y numeros de referencia regulatorios.
- Ausencia de documentacion de entrenamiento: no se detallan dataset, numero de tokens, hiperparametros de LoRA ni proceso de evaluacion, lo que dificulta reproducir o auditar el resultado.
- Idiomas y contexto: ni los idiomas soportados ni la longitud de contexto estan declarados, lo que impide planificar documentos largos o multilingues.
- Licencia: el repositorio se publica bajo Apache-2.0, que permite uso comercial. Debe verificarse igualmente la licencia y los terminos del modelo base Qwen3-VL y de la version de Unsloth sobre la que se ajusto, ya que de ellos puede derivar alguna condicion adicional.
- Fechas declaradas: el repositorio figura creado y actualizado en septiembre de 2026, dato cuando menos llamativo que conviene contrastar.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jihadv4/bb-trade-idp-model
- Modelo base declarado (Unsloth, Qwen3-VL-8B-Instruct en 4 bits): https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a paginas genericas del motor de busqueda y se han descartado por no aportar informacion.
