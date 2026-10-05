# myroslavtryhubets/clef-flash-NVFP4A16

## Resumen

clef-flash-NVFP4A16 es una cuantizacion comunitaria no oficial de `Cloudflare/clef-flash`, un modelo multimodal de decision de aproximadamente 9,4 mil millones de parametros. No es un modelo generativo al uso: dado un estado (por ejemplo, una alerta o un mensaje de usuario) y un esquema de preguntas tipadas, devuelve una probabilidad para cada opcion permitida en una unica pasada hacia delante. El backbone declarado es `Qwen/Qwen3.5-9B` y la logica de decision (la cabeza conjunta, *joint-head*) es de Cloudflare.

El repositorio reencoda los pesos del modelo base en formato NVFP4A16: pesos en 4 bits y activaciones en bf16 (W4A16). Segun el autor, es mas preciso que la variante W4A4 (NVFP4) pero aproximadamente 7 veces mas lento, con el mismo consumo de VRAM (unos 4 GiB solo para los pesos). La cuantizacion la firma `myroslavtryhubets` y no esta afiliada ni respaldada por Cloudflare; mantiene la licencia Apache 2.0 del modelo base.

Su relevancia practica esta en el binomio tamano/precision: permite ejecutar un modelo de decision de 9B en una GPU de gama consumer con 16 GB (la verificacion se hizo en una RTX 5060 Ti de 16 GB) manteniendo una brecha media absoluta de 1,04 puntos frente a los resultados publicados por Cloudflare en bf16. A cambio, la latencia mediana es de aproximadamente 1681 ms por peticion con lote de 1, y el modelo solo se puede usar a traves del runtime propio incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de decision con backbone Qwen3_5 y cabeza conjunta (*joint-head*) de decision; el modelo base es `Cloudflare/clef-flash` |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 B), segun los pesos safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos en 4 bits, activaciones en bf16; W4A16). Variantes relacionadas del mismo autor: NVFP4 (W4A4) y bf16 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema `compressed-tensors`; requiere el runtime propio `clef_rt.py` |
| Modelo base | `Cloudflare/clef-flash` (relacion declarada: quantized) |
| Backbone | `Qwen/Qwen3.5-9B` |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 9,1 GB |
| Requisito de hardware para NVFP4 | GPU Blackwell (sm_120) |
| Runtime de carga | `clef_rt.py` con el esquema `nvfp4-w4a16`; no funciona con `from_pretrained` ni `load_release_model` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Cloudflare/clef-flash`, descrito por el autor de la cuantizacion como el hermano de 9B de Clef. Se trata de un modelo multimodal de decision: recibe un estado y un esquema de preguntas tipadas y, en una sola pasada hacia delante, emite una distribucion de probabilidad sobre cada opcion permitida. El backbone declarado es Qwen3.5-9B, sobre el que Cloudflare monta la cabeza conjunta (*joint-head*) y la ruta de decision implementada en el archivo `joint_schema_model.py`. El pipeline declarado en HuggingFace es image-text-to-text, lo que indica soporte de entradas de imagen y texto, aunque no se detallan en la informacion disponible ni la resolucion de imagen ni el tokenizador multimodal.

Esta ficha corresponde exclusivamente a la reencodacion de pesos, no a un entrenamiento nuevo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de ajuste en el modelo base. La innovacion tecnica de este repositorio es el esquema de cuantizacion: NVFP4A16 aplica 4 bits a los pesos y mantiene las activaciones en bf16, lo que reduce el consumo a aproximadamente 4 GiB de VRAM para los pesos a costa de la velocidad (aproximadamente 7 veces mas lento que W4A4, segun el autor). Los pesos cuantizados no se cargan con las rutas estandar de Transformers, que reconstruyen el grafo en precision completa; hay que usar el modulo `clef_rt.py` incluido en el repositorio.

## Capacidades

- Decision estructurada en una sola pasada: dado un estado y un esquema de preguntas tipadas, devuelve una probabilidad para cada opcion permitida. En el ejemplo de la model card se combinan una pregunta de tipo `noul` (si o no) y una de tipo `choice` con criterios ponderados.
- Salida estructurada con tipos declarados: el esquema define el tipo de pregunta y las opciones validas, lo que encaja con flujos de clasificacion y enrutamiento sin postprocesado libre.
- Toma de decisiones tipo function calling: obtiene 98,6 de exactitud exacta de caso en el benchmark BFCL, orientado a la seleccion de llamadas a funciones.
- Clasificacion de intenciones y de texto: 92,0 de macro-F1 en BANKING77 y 61,2 en CLINC150+OOS. Esta ultima es su punto debil documentado.
- Inferencia de lenguaje natural y contratos: 83,7 de macro-F1 en ContractNLI y 58,8 en ANLI.
- Razonamiento y sentido comun: 98,1 de exactitud en ARC-Challenge, 97,1 en WinoGrande y 85,4 en MuSR.
- Extraccion de entidades: 97,2 de macro-F1 en FinEntity.
- Evaluacion de codigo: 85,3 de exactitud en CRUXEval.
- Deteccion de phishing: 76,5 de exactitud en PhishNChips.
- Entrada multimodal declarada: el pipeline es image-text-to-text, aunque no se detallan las capacidades de vision en la informacion disponible.
- No hay soporte documentado de agentes multi-paso, ni de modo *thinking*, ni de audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y un esquema con preguntas tipadas (por ejemplo, si hay una caida de servicio y que equipo debe gestionarlo) y devuelve la probabilidad de cada opcion. Es adecuado porque toda la decision se resuelve en una unica pasada, con salida tipada y sin generacion libre.
- Triaje de incidentes en produccion: a partir de una alerta o de un mensaje de estado, se puede preguntar simultaneamente por la severidad, el servicio afectado y el equipo responsable, aprovechando el ejemplo de la model card (`noul` mas `choice` con criterios).
- Clasificacion de intenciones en atencion al cliente: con 92,0 de macro-F1 en BANKING77, encaja en la categorizacion de consultas bancarias y de servicios financieros donde el conjunto de clases es conocido y acotado.
- Clasificacion de transacciones y consultas financieras por criterios: la pregunta de tipo `choice` con criterios (por ejemplo, `billing` frente a `tech`) permite mapear una entrada a una taxonomia de equipos o departamentos sin reentrenar el modelo.
- Revision de contratos y cumplimiento: con 83,7 de macro-F1 en ContractNLI, puede usarse para determinar si un par de frases implica, contradice o es neutral respecto a una clausula, integrado en un pipeline de revision documental.
- Analisis de implicacion textual para verificacion de afirmaciones: 58,8 de macro-F1 en ANLI indica que puede sostener tareas de inferencia entre premisa e hipotesis, aunque con margen frente a modelos mayores.
- Deteccion de phishing y de contenido malicioso: 76,5 de exactitud en PhishNChips, util como filtro previo en pasarelas de correo o en moderacion con categorias cerradas.
- Extraccion de entidades y normalizacion de datos: 97,2 de macro-F1 en FinEntity permite poblar campos estructurados a partir de texto no estructurado de tipo financiero.
- Evaluacion de fragmentos de codigo en revisiones: 85,3 de exactitud en CRUXEval para preguntas sobre la salida de un fragmento de codigo, como paso de validacion dentro de un pipeline de CI.
- Despliegue en edge o en una unica GPU consumer: los aproximadamente 4 GiB de pesos permiten ejecutar el modelo en tarjetas de 16 GB junto con el resto del sistema, siempre que sean Blackwell (sm_120).

## Benchmarks y rendimiento

Los resultados proceden del conjunto Decision Index 0.2.1, con 11 benchmarks y 20.337 peticiones, reconstruido byte a byte con el kit oficial y puntuado con su propio evaluador. Los porcentajes estan ajustados por cobertura. La columna "Clef-flash bf16 (CF)" es el resultado publicado por Cloudflare; "Este checkpoint" es la medicion del repositorio cuantizado en una RTX 5060 Ti de 16 GB.

| Benchmark | Metrica | Clef-flash bf16 (CF) | Este checkpoint | Delta |
|---|---|---|---|---|
| BFCL | exactitud exacta de caso | 98,8 | 98,6 | -0,2 |
| BANKING77 | macro-F1 | 90,9 | 92,0 | +1,1 |
| CLINC150+OOS | macro-F1 | 66,8 | 61,2 | -5,6 |
| ContractNLI | macro-F1 | 84,3 | 83,7 | -0,6 |
| ANLI | macro-F1 | 59,1 | 58,8 | -0,3 |
| ARC-Challenge | exactitud | 98,3 | 98,1 | -0,2 |
| WinoGrande | exactitud | 97,5 | 97,1 | -0,4 |
| MuSR | exactitud | 86,0 | 85,4 | -0,6 |
| FinEntity | macro-F1 | 97,1 | 97,2 | +0,1 |
| CRUXEval | exactitud | 86,1 | 85,3 | -0,8 |
| PhishNChips | exactitud | 75,0 | 76,5 | +1,5 |

Brecha absoluta media frente a Cloudflare: 1,04 puntos. Latencia mediana aproximada de 1681 ms por peticion con lote de 1.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 4 GiB en el esquema NVFP4A16.
- GPU obligatoria: arquitectura Blackwell (sm_120) para el formato NVFP4. La verificacion del autor se hizo en una RTX 5060 Ti de 16 GB.
- Cabe en GPU consumer: si, en tarjetas Blackwell con 16 GB o mas (RTX 5060 Ti, RTX 5070 Ti, RTX 5080, RTX 5090). No se documenta compatibilidad con generaciones anteriores (Ampere, Ada) para este esquema.
- Latencia medida: mediana de aproximadamente 1681 ms por peticion en lote de 1. La variante W4A4 del mismo modelo baja a aproximadamente 240 ms, y el modelo Clef de 27B en NVFP4 a aproximadamente 700 ms.
- Throughput: no disponible.
- Opciones de despliegue: solo el runtime propio `clef_rt.py`, cargando con el esquema `nvfp4-w4a16`. No se puede usar `from_pretrained` ni `load_release_model`, porque reconstruyen el grafo en precision completa.
- vLLM: registra el backbone Qwen3_5, pero no implementa la cabeza conjunta de Clef ni la ruta de decision, por lo que no produce decisiones tipadas de serie.
- llama.cpp, Ollama y TGI: no hay soporte documentado en la informacion disponible.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Clef y de su modelo base. No se dispone de datos de benchmarks para el backbone Qwen3.5-9B en tareas de decision, ni para alternativas externas de la misma categoria.

| Modelo | Parametros | Esquema | CLINC150+OOS (macro-F1) | Brecha media vs Cloudflare | Latencia mediana | VRAM de pesos |
|---|---|---|---|---|---|---|
| Cloudflare/clef-flash (bf16, referencia) | 9B | bf16 | 66,8 | 0 | no disponible | no disponible |
| myroslavtryhubets/clef-flash-NVFP4A16 (este) | 9,4 B | NVFP4A16 (W4A16) | 61,2 | 1,04 | aproximadamente 1681 ms | aproximadamente 4 GiB |
| myroslavtryhubets/clef-flash-NVFP4 | 9,4 B | NVFP4 (W4A4) | 49,9 | 2,36 | aproximadamente 240 ms | aproximadamente 4 GiB |
| myroslavtryhubets/clef-NVFP4 | 27B | NVFP4 (W4A4) | 97,3 | 1,08 | aproximadamente 700 ms | aproximadamente 13 GiB |

Segun el autor, en una tarjeta de 16 GB el modelo Clef de 27B en NVFP4 es a la vez mas rapido y mas preciso que esta variante; esta cuantizacion solo tiene sentido cuando no se dispone de los aproximadamente 13 GB de VRAM que exige el 27B. Para priorizar velocidad dentro de la familia de 9B, la opcion indicada es la variante W4A4.

## Limitaciones y advertencias

- Perdida de precision en CLINC150+OOS: baja de 66,8 a 61,2 de macro-F1 frente al bf16 de Cloudflare. El autor lo atribuye a la sensibilidad del modelo de 9B a la cuantizacion de pesos cuando hay 150 clases casi empatadas. Es mejor que la variante W4A4 (49,9), pero no es sin perdidas.
- Lento para un modelo etiquetado como "Flash": mediana de aproximadamente 1681 ms por peticion, unas 7 veces mas lento que el esquema W4A4 segun el autor.
- Dependencia de codigo personalizado: requiere `trust_remote_code` y el modulo `clef_rt.py`. La carga estandar de Transformers no funciona con estos pesos.
- Verificacion limitada: la calidad solo se ha validado a traves del runtime incluido, no con una pila de servicio de terceros.
- Incompatibilidad con vLLM para decisiones tipadas: vLLM reconoce el backbone Qwen3_5, pero no la cabeza conjunta ni la ruta de decision de Clef.
- Requisito de hardware restrictivo: NVFP4 exige GPU Blackwell (sm_120); no hay soporte documentado para generaciones anteriores.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al tratarse de un modelo de decision sobre opciones tipadas, el riesgo principal es una asignacion de probabilidad incorrecta o poco calibrada, no la invencion de texto libre.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Cobertura idiomatica: no se declaran idiomas soportados; los benchmarks citados estan en ingles.
- Licencia: Apache 2.0, lo que permite uso comercial, pero la cuantizacion es no oficial y no esta afiliada ni respaldada por Cloudflare. El autor del modelo base y de la arquitectura es Cloudflare.
- Cobertura de benchmarks: 11 tareas del Decision Index 0.2.1; no hay datos de MMLU, HumanEval, GSM8K ni de tareas generativas estandar, porque el modelo no es generativo en el sentido habitual.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de terceros.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/myroslavtryhubets/clef-flash-NVFP4A16
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Backbone declarado: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante W4A4 de 9B: https://huggingface.co/myroslavtryhubets/clef-flash-NVFP4
- Variante NVFP4 de 27B: https://huggingface.co/myroslavtryhubets/clef-NVFP4
- Blog de Cloudflare sobre los modelos de decision Clef: https://blog.cloudflare.com/clef-decision-models
- Kit de evaluacion Decision Index: https://github.com/apolinario/decision-index
- Suite de evaluacion Decision Index 0.2.1: https://clef-evals.workers-ai-mle.workers.dev
