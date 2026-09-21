# nmuendler/Apriel-15B-rust-sft-run1-eb32-e4-lr1e-04-r64-step424

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante ajuste supervisado (SFT) sobre el modelo base ServiceNow-AI/Apriel-Nemotron-15b-Thinker. El nombre del checkpoint (`rust-sft-run1-eb32-e4-lr1e-04-r64-step424`) indica que se trata de la primera ejecución de una serie de fine-tuning orientada al lenguaje Rust, con rango LoRA 64, learning rate 1e-4 y parada en el step 424; los sufijos `eb32` y `e4` son compatibles con un batch efectivo de 32 y 4 épocas segun la convencion habitual de nombrado, aunque el autor no lo documenta explicitamente.

El modelo base es un transformer decoder-only de aproximadamente 15.000 millones de parametros perteneciente a la familia Apriel de ServiceNow, en su variante "Thinker", es decir, orientada a razonamiento explicito. El adaptador no es un modelo autonomo: requiere descargar el modelo base y cargar el adapter encima mediante la libreria PEFT, lo que reduce el coste de distribucion (1,2 GB frente a los aproximadamente 30 GB del modelo completo en bf16).

La relevancia de este checkpoint es limitada y muy especifica: se publica sin model card completada, sin licencia declarada, sin idiomas documentados y con cero descargas en el momento de la consulta. Su interes practico radica en ser un artefacto reproducible de SFT sobre Rust que puede servir como referencia metodologica o como punto de partida para experimentos de especializacion en lenguajes de sistemas, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base no documentada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base tiene ~15.000 millones de parametros segun su nombre (`Apriel-Nemotron-15b`) |
| Parametros activos | No aplica (no hay evidencia de que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors con precision de almacenamiento no documentada |
| Idiomas soportados | No disponible (los datos de entrenamiento del adaptador son presumiblemente codigo Rust y texto en ingles, no confirmado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado |
| Libreria | PEFT 0.14.0 |
| Rango LoRA | 64 (inferido del nombre del checkpoint) |
| Learning rate | 1e-4 (inferido del nombre del checkpoint) |
| Step de parada | 424 (inferido del nombre del checkpoint) |
| Tamano del repositorio | 1,2 GB |
| Modelo base | ServiceNow-AI/Apriel-Nemotron-15b-Thinker |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only de 15B. No se documenta en la informacion proporcionada la arquitectura interna del modelo base (numero de capas, dimension del modelo, tipo de atencion, uso de RoPE, normalizacion ni si incorpora algun esquema de atencion eficiente). Tampoco se especifica si el entrenamiento fue de precision mixta bf16 o fp16, ni la infraestructura de computo empleada.

El entrenamiento consiste en un ajuste supervisado (SFT) sobre datos de Rust. A partir del nombre del checkpoint se puede inferir rango 64, learning rate 1e-4, batch efectivo 32 y 4 epocas, pero no hay informacion sobre la composicion del dataset (volumen de tokens, fuentes, filtrado, si incluye instrucciones, tests unitarios o trazas de compilador), ni sobre tecnicas posteriores de alineacion como RLHF o DPO. La model card distribuida es la plantilla por defecto de HuggingFace y todos los campos relevantes estan marcados como `[More Information Needed]`, por lo que no se puede verificar ningun detalle del procedimiento de entrenamiento.

## Capacidades

- Generacion de codigo en Rust: es el unico dominio para el que el autor declara entrenamiento explicito en el nombre del checkpoint.
- Razonamiento explicito: el modelo base pertenece a la variante "Thinker", orientada a cadenas de razonamiento, aunque el adaptador puede haber alterado o degradado esta capacidad al especializarse en Rust.
- Razonamiento multi-step y agentes: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; no hay lista de idiomas en la ficha.
- Vision o audio: no documentado; el nombre del modelo base no sugiere modalidades adicionales.
- Modo thinking: probablemente heredado del modelo base por su denominacion, sin confirmacion en la documentacion del adaptador.

## Casos de uso

- Generacion de codigo Rust en entornos de desarrollo: el adaptador puede usarse para completar funciones y modulos en Rust dentro del IDE, cargando el modelo base mas el adapter en un servidor de inferencia compatible con PEFT. Es adecuado por su especializacion declarada, aunque su calidad real no esta validada con benchmarks publicados.
- Migracion de C o C++ a Rust: dado que el SFT se ha realizado sobre Rust, puede emplearse como asistente para traducir fragmentos de codigo con gestion manual de memoria a equivalentes idiomáticos en Rust, siempre con revision humana del resultado.
- Revision de codigo y deteccion de patrones no idiomaticos: uso como revisor automatico en pull requests, sugiriendo cambios de estilo, uso correcto de ownership y borrow checker, lifetimes o manejo de errores con `Result`.
- Generacion de tests unitarios y de integracion: produccion de bloques `#[cfg(test)]` y pruebas de integracion para modulos existentes, aprovechando que el dominio de entrenamiento es el propio lenguaje.
- Documentacion tecnica de crates: redaccion de doc comments (`///`) y ejemplos de uso en la documentacion generada con `cargo doc`, tarea muy alineada con el corpus tipico de Rust.
- Educacion y prototipado: entorno de practicas para estudiantes que quieran comparar las respuestas de un modelo especializado en Rust frente al modelo base sin ajustar, util para estudiar el efecto del SFT.
- Experimentacion en investigacion sobre especializacion de lenguaje: este checkpoint puede servir como referencia metodologica reproducible (rango 64, lr 1e-4, 4 epocas) para comparar estrategias de fine-tuning en lenguajes de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y no se han encontrado datos externos sobre HumanEval, MBPP, MultiPL-E, Rust-Eval ni ninguna otra métrica de generacion de codigo para este adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (15B parametros) y no de mediciones publicadas para este checkpoint concreto.

- VRAM para inferencia en bf16/fp16: aproximadamente 30-32 GB solo para los pesos, mas overhead de activaciones y cache KV. Requiere una A100 40 GB, L40S 48 GB o H100 80 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 15-17 GB, viable en RTX 4090 24 GB o L4 24 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 9-11 GB, viable en RTX 4080, RTX 3090 o RTX 4090 con margen para contexto moderado.
- Consumer GPU: si, en GPUs con 16-24 GB de VRAM siempre que se cuantice el modelo base a 8 o 4 bits. En GPUs de 8-12 GB la viabilidad depende de la longitud de contexto y de la cuantizacion a 4 bits.
- Carga del adaptador: requiere descargar el modelo base (~30 GB en bf16) ademas del adaptador de 1,2 GB; el adaptador por si solo no es utilizable.
- Despliegue: vLLM soporta adaptadores LoRA en runtime, lo que permite servir el modelo base y varios adaptadores simultaneamente. Tambien son viables TGI, la pila de transformers con PEFT y, si se fusionan los pesos (`merge_and_unload`) y se convierten a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (base Apriel-Nemotron-15b-Thinker) | ~15B (base) + adaptador LoRA r=64 | No disponible | No disponible | HuggingFace, 0 descargas |
| ServiceNow-AI/Apriel-Nemotron-15b-Thinker (modelo base, sin ajustar) | ~15B | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Qwen2.5-Coder-14B | 14B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado |
| CodeLlama-13B | 13B | 16.384 tokens | Llama 2 Community License | HuggingFace |

Las cifras de las alternativas corresponden a datos publicos de sus respectivas fichas y pueden variar con el tiempo; no se dispone de resultados de rendimiento comparables entre estos modelos y el adaptador aqui descrito, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En el caso del modelo base y del adaptador, las celdas marcadas como no disponibles reflejan la ausencia de documentacion, no la inexistencia del dato.

## Limitaciones y advertencias

- Model card vacia: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluacion) estan sin cumplimentar, lo que impide auditar el modelo.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido. Al ser un derivado del modelo base, la licencia aplicable podria ser la del modelo base o una restriccion adicional; conviene verificar la ficha de ServiceNow-AI/Apriel-Nemotron-15b-Thinker antes de cualquier uso en produccion.
- Riesgo de alucinacion: no evaluado. No hay datos de evaluacion que permitan estimar la tasa de codigo no compilable o de APIs inventadas.
- Riesgo de catastrofico olvido: al ser un SFT especializado en Rust sobre un modelo de razonamiento general, es probable que las capacidades generales y multilingues se hayan degradado, aunque no hay mediciones que lo confirmen.
- Sesgos: no documentados ni evaluados.
- Longitud de contexto: no disponible, lo que impide planificar tareas sobre repositorios completos.
- Idiomas: no declarados; el entrenamiento en codigo Rust sugiere predominio de ingles en comentarios y documentacion.
- Trazabilidad: el nombre del checkpoint sugiere la existencia de una serie de ejecuciones (run1), pero no se enlazan los resultados de las demas ni el dataset empleado.
- Cero descargas y cero likes: no hay evidencia de uso, validacion por terceros ni reportes de fallos.
- La busqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo; los resultados obtenidos eran irrelevantes y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nmuendler/Apriel-15B-rust-sft-run1-eb32-e4-lr1e-04-r64-step424
- Modelo base: https://huggingface.co/ServiceNow-AI/Apriel-Nemotron-15b-Thinker
- Paper referenciado en los tags del repositorio (metodologia de estimacion de emisiones, no describe el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning citada en la model card: https://mlco2.github.io/impact
