# ATinyGreenCell/scadcoder-qwen3.5-9b-3ep

## Resumen

scadcoder-qwen3.5-9b-3ep es un ajuste fino mediante LoRA del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario ATinyGreenCell. Su objetivo concreto es transformar especificaciones en lenguaje natural en modelos parametricos renderizables de OpenSCAD para hardware de laboratorio biologico (racks, embudos, adaptadores, soportes de tubos, etc.). El artefacto forma parte del proyecto de investigacion "Prompt to Bench" y esta pensado para ejecutarse en el dispositivo Tiiny AI Pocket Lab.

El modelo conserva la arquitectura del base, Qwen3_5ForConditionalGeneration, con el codificador de vision congelado: solo se adaptaron las capas de lenguaje mediante LoRA y posteriormente se fusionaron de nuevo en safetensors bf16, con 775 tensores y nombres identicos a los del modelo original. Cuenta con 9.653.104.368 parametros totales y un tamano de repositorio de 19,3 GB.

Es relevante ahora porque aborda un nicho muy especifico (generacion de codigo CAD para instrumentacion de laboratorio) sobre un modelo base que, segun las fuentes consultadas, fue el modelo multimodal mas capaz por debajo de 15B parametros en su lanzamiento, con vision nativa, contexto nativo de 262K tokens y cobertura de 201 idiomas. La ficha se centra en el ajuste fino, pero conviene tener presente que buena parte de las capacidades heredadas provienen del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, denso; vision + lenguaje) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento del ajuste a 4096 tokens; el base soporta 262K nativos, extensibles a 1M con YaRN |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16 en safetensors; no hay versiones GGUF/AWQ/GPTQ en la informacion proporcionada) |
| Idiomas soportados | no disponible para el ajuste fino; el base declara 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 775 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B parametros con capacidad multimodal nativa (entrada de imagen y texto) y arquitectura hibrida segun las fuentes del fabricante. El ajuste fino empleo LoRA de rango 32 y dropout 0,1 sobre las capas de lenguaje, dejando el codificador de vision congelado y sin modificar. Tras el entrenamiento, los adaptadores se fusionaron en los pesos base y se exportaron de nuevo a bf16 safetensors, de modo que la nomenclatura e integridad estructural de los tensores coincide con la del modelo original.

El entrenamiento fue exclusivamente de texto, durante 3 epochs, sobre 7.238 ejemplos verificados de diseno OpenSCAD, todos conservados a una longitud de contexto de 4096 tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras fases de alineacion posteriores al ajuste supervisado. Tampoco se detalla la composicion del dataset mas alla de su dominio (hardware de laboratorio) ni el numero total de tokens de entrenamiento. Se recomienda ejecutar el modelo con el modo de razonamiento o "thinking" desactivado, ya que el ajuste esta orientado a la generacion directa de codigo OpenSCAD.

## Capacidades

- Generacion de codigo OpenSCAD parametrico a partir de descripciones en lenguaje natural.
- Modelado de piezas de laboratorio: racks, embudos, adaptadores, soportes de tubos y elementos similares.
- Capacidad multimodal heredada del base (procesamiento de imagen y texto), aunque el ajuste se realizo solo con datos de texto y el codificador de vision permanece congelado.
- Soporte de tool calling y function calling heredado del modelo base.
- Razonamiento multimodal y flujos agénticos multietapa heredados del base.
- Cobertura multilingue heredada del base (201 idiomas declarados), si bien el ajuste no especifica idiomas.
- Modo de razonamiento o "thinking" disponible en el base, pero desaconsejado para este ajuste segun el autor.

## Casos de uso

- Generacion de utillaje de laboratorio a medida: a partir de una descripcion textual (por ejemplo, "soporte para seis tubos de 15 mm con base atornillable"), el modelo produce codigo OpenSCAD renderizable que el usuario puede imprimir en 3D sin modelado manual.
- Iteracion rapida de prototipos de hardware cientifico: el modelo permite modificar una pieza parametrica existente cambiando parametros en el prompt, reduciendo el ciclo de diseno de horas a minutos.
- Estandarizacion de disenos en un laboratorio o biobanco: conversion de especificaciones internas en scripts OpenSCAD versionables y reproducibles dentro de un repositorio Git.
- Asistencia a personal no especializado en CAD: investigadores sin experiencia en modelado 3D describen la pieza que necesitan y obtienen el codigo listo para compilar con OpenSCAD.
- Automatizacion de pipelines de fabricacion digital: integracion del modelo en un flujo que reciba una especificacion, genere el .scad, lo compile a STL y lo envie a una impresora o servicio de fresado.
- Educacion y formacion tecnica: uso como herramienta docente para ilustrar la relacion entre parametros geometricos y su representacion en codigo OpenSCAD.
- Despliegue en el Tiiny AI Pocket Lab: el ajuste se diseno explicitamente para ejecutarse en este dispositivo, lo que habilita generacion local de disenos sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos del ajuste fino scadcoder-qwen3.5-9b-3ep en la informacion disponible. Los unicos datos numericos encontrados corresponden al modelo base Qwen/Qwen3.5-9B y proceden de fuentes secundarias:

| Benchmark / metrica | Resultado | Ambito | Fuente |
|---|---|---|---|
| Tasa de exito global | 83 % | Qwen3.5-9B (base) | benchable.ai |
| MMMU-Pro | ~69 % | Qwen3.5-9B (base) | llm-releases.com |
| Rendimiento de velocidad | Percentil 10 | Qwen3.5-9B (base) | benchable.ai |
| Clasificacion | Modelo mas capaz por debajo de 10B en su lanzamiento; multimodal mas capaz por debajo de 15B | Qwen3.5-9B (base) | llm-releases.com |

Estos valores no deben atribuirse al ajuste fino. No se ha facilitado ninguna evaluacion especifica de la calidad del codigo OpenSCAD generado.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 19,3 GB solo para pesos; con cache KV y overhead de inferencia, aproximadamente 20-23 GB.
- VRAM estimada en 8 bits: aproximadamente 10-11 GB de pesos, mas overhead.
- VRAM estimada en 4 bits: aproximadamente 5,5-6,5 GB de pesos, mas overhead (requiere convertir el modelo a GGUF u otro formato cuantizado, no publicado).
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para bf16 sin restricciones; RTX 4090 o RTX 3090 (24 GB) suficientes para bf16 ajustado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a bf16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) seria necesario cuantizar a 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servido en produccion, siempre que el modelo se cargue en bf16. Ollama y llama.cpp requeririan una conversion previa a GGUF, no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. La fuente benchable.ai situa al modelo base en el percentil 10 de velocidad, lo que sugiere tiempos de respuesta altos en comparacion con sus pares, pero no hay mediciones concretas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-3ep | 9,65B | Entrenado a 4096 (base 262K) | Si (encoder congelado) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | 9B | 262K nativos, 1M con YaRN | Si | Apache 2.0 | HuggingFace |
| Alternativas especializadas en OpenSCAD | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria (generacion de OpenSCAD para hardware de laboratorio) que permitan una comparacion cuantitativa. La comparacion mas directa es con el propio modelo base, del que este ajuste hereda arquitectura, vision y capacidades generales, modificando unicamente el comportamiento en la tarea especifica.

## Limitaciones y advertencias

- El ajuste esta especializado en un dominio muy estrecho (OpenSCAD para hardware de laboratorio); fuera de ese ambito es probable que su rendimiento sea inferior al del modelo base.
- El codigo OpenSCAD generado no se ha validado de forma independiente: puede compilar pero producir geometrias no imprimibles o con dimensiones incorrectas. Se recomienda revision humana antes de fabricar.
- El entrenamiento se realizo a 4096 tokens de contexto; se desconoce como se comporta el modelo con entradas o salidas mas largas, pese a que el base soporte 262K.
- El codificador de vision esta congelado y el ajuste fue exclusivamente de texto: no hay garantia de que la ruta de imagen se comporte correctamente para esta tarea.
- Riesgo de alucinacion en nombres de funciones OpenSCAD, parametros o unidades; conviene verificar la sintaxis generada.
- No se documentan sesgos especificos ni evaluaciones de sesgo para este ajuste.
- No se especifican los idiomas soportados por el ajuste; la cobertura multilingue de 201 idiomas corresponde al modelo base y no esta confirmada para esta version.
- La licencia Apache 2.0 permite uso comercial, pero, al ser un artefacto de investigacion del proyecto "Prompt to Bench", no se ofrecen garantias de calidad ni soporte.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Se recomienda desactivar el modo de razonamiento durante la inferencia, tal como indica el autor; activarlo puede degradar la calidad del codigo generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-3ep
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha en free2aitools: https://free2aitools.com/model/atinygreencell/scadcoder-qwen3.5-9b
- Qwen3.5-9B en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Qwen3.5-9B en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- Qwen3.5-9B en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Qwen3.5-9B en Together AI: https://www.together.ai/models/qwen3-5-9b
