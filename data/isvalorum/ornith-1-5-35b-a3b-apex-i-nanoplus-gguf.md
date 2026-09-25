# IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Ornith-1.5-35B-A3B APEX-I-NanoPlus GGUF es una cuantizacion artesanal, tensor a tensor, del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario IsValorum. Se trata de un modelo de mezcla de expertos (MoE) de 34.660.610.688 parametros totales (unos 34,66 mil millones) con aproximadamente 3 mil millones de parametros activos por token, segun la nomenclatura A3B del propio nombre. El resultado de la cuantizacion es un unico fichero GGUF de 12,55 GB (11,69 GiB) a unos 2,93 bits por peso (BPW), disenado para caber en GPUs de 16 GB dejando margen para contexto, o para inferencia total o parcial en memoria de sistema.

El modelo base pertenece a la familia Ornith 1.5, orientada a razonamiento, generacion de codigo y uso agentico (las etiquetas incluyen swe-bench, agentic, coding y reasoning), y es multimodal: su pipeline en HuggingFace es image-text-to-text e incluye soporte de vision. Soporta 13 idiomas declarados (en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar) y se distribuye bajo licencia MIT. La arquitectura del modelo base esta etiquetada como qwen35moe, con un backbone de 40 capas.

La relevancia de esta ficha concreta no esta en el modelo base, sino en la receta de cuantizacion: frente a los cuantizados sub-3-bit genericos de la comunidad, esta version mantiene las matrices de enrutamiento en F32 sin comprimir, blinda la cabeza de salida en Q6_K y protege las proyecciones de atencion criticas, a cambio de una perdida medida de 0,5113 puntos de perplejidad en WikiText-2 respecto al BF16 (+6,75 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con backbone de 40 capas; etiqueta de familia qwen35moe |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | ~3 mil millones por token (denominacion A3B del nombre del modelo; cifra no confirmada de forma explicita en la model card) |
| Longitud de contexto | No disponible en la model card de esta cuantizacion; el modelo base se describe en fuentes externas con 262K tokens. La model card menciona soporte nativo de 32K-64K con offload completo en GPUs de 16 GB y 128K o mas con carga parcial en RAM del sistema |
| Tipos de cuantizacion | Mezcla por tensor: IQ2_XXS, IQ2_S, IQ3_XXS, Q3_K, Q4_K, Q6_K, Q8_0 y F32 (ver detalle mas abajo) |
| Idiomas soportados | Ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe (13 idiomas declarados) |
| Licencia | MIT (licencia declarada para este repositorio de cuantizacion) |
| Formato de pesos | GGUF (unico fichero principal de 12,55 GB / 11,69 GiB, ~2,93 BPW); el modelo base se distribuye en safetensors BF16 (~71,0 GB) |
| Tamano del repositorio | 25,7 GB |
| Modalidad | Multimodal texto-imagen (image-text-to-text), con soporte de vision |
| Cuantizador | IsValorum (receta APEX-I-NanoPlus, generada en Unsloth Studio) |
| Calibracion | Matriz de importancia oficial (imatrix) proporcionada por el autor del modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO o ajuste por preferencias) en la informacion proporcionada. Lo que si se detalla es la arquitectura de cuantizacion aplicada sobre el checkpoint original. Se trata de un transformer MoE de 40 capas en el que la receta NanoPlus asigna precision de forma quirurgica segun la sensibilidad de cada tensor.

La asignacion concreta es la siguiente: los expertos centrales (indices 0-37, con los indices 2-37 descritos como nucleo) usan IQ3_XXS en las proyecciones down, IQ2_S en las proyecciones gate e IQ2_XXS en las proyecciones up; los expertos de borde (indices 0-1 y 38-39) reciben Q3_K en down e IQ3_XXS en gate y up; el experto compartido (shexp) se mantiene en Q4_K; las proyecciones q/k/v de atencion completa (capas 3, 7, 11 y sucesivas) van en Q4_K y la proyeccion de salida de atencion (attn_output) en Q6_K; las puertas de atencion en Q8_0; la cabeza de salida (output.weight) en Q6_K; y tanto los enrutadores (gate_inp) como gate_shexp permanecen en F32 sin comprimir, evitando derivas de enrutamiento. Esta version NanoPlus omite el modulo MTP (multi-token prediction) presente en otras variantes de la familia, priorizando el backbone de 40 capas dentro de un presupuesto de 12-13 GB.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con etiqueta explicita de reasoning en el modelo base.
- Generacion y comprension de codigo, con etiquetas coding y swe-bench, orientado a tareas de ingenieria de software.
- Flujos agenticos: la model card y las etiquetas del repositorio indican soporte para uso agentico (agentic) y razonamiento en varios pasos.
- Capacidades multimodales de vision: pipeline image-text-to-text, con soporte de entrada de imagen junto a texto.
- Multilingue: 13 idiomas declarados (en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar).
- Ejecucion en llama.cpp, con soporte de offload total o parcial a GPU y carga en RAM del sistema.
- Inferencia en CPU con AVX2: la model card afirma que la configuracion deja mas de 4 GB de VRAM libre en tarjetas de 16 GB para contexto de 32K sin bloqueos de CPU AVX2.
- No se documenta de forma explicita en la informacion disponible el soporte de tool calling o function calling. No disponible.

## Casos de uso

- Despliegue local en GPU de 16 GB: con un fichero de 12,55 GB, el modelo cabe con offload completo en tarjetas como RTX 4080 o RTX 4070 Ti, dejando margen para contexto de 32K, lo que permite trabajar sin conexion y sin coste por token.
- Inferencia en RAM del sistema: para equipos sin GPU suficiente, la carga total o parcial en memoria DDR4/DDR5 ofrece entre 20 y 45 tok/s segun la configuracion, lo que hace viable usar el modelo en portatiles o servidores sin acelerador dedicado.
- Contexto largo con offload parcial: en configuraciones que no pueden alojar 128K o mas tokens de contexto en VRAM, la parte sobrante se puede situar en RAM del sistema manteniendo generacion estable, util para analisis de documentos extensos.
- Asistencia a la programacion en repositorios: el modelo base esta etiquetado con swe-bench y coding, por lo que encaja en tareas de resolucion de issues, refactorizacion y navegacion de codigo, siempre que se acepte la perdida de precision de la cuantizacion sub-3-bit.
- Agentes autonomos de varios pasos: la orientacion agentica del modelo base permite encadenar razonamiento, uso de herramientas y verificacion, con la ventaja de un coste de inferencia bajo (~3B parametros activos).
- Analisis de imagenes con texto asociado: gracias al pipeline image-text-to-text, se puede usar para descripcion de capturas, extraccion de informacion de documentos escaneados o asistencia sobre diagramas, dentro de los limites de calidad de la cuantizacion.
- Atencion al cliente multilingue: los 13 idiomas declarados permiten atender consultas en ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe desde un unico despliegue.
- Prototipado e investigacion con presupuesto reducido: al ocupar 12,55 GB en disco, permite experimentar con un MoE de ~35B en hardware de gama alta de consumo, en lugar de requerir los ~71 GB del checkpoint BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perplejidad medida en WikiText-2 sobre el GGUF final, junto con la comparacion frente al modelo base BF16 y frente a la variante MiniPlus V2.1 del mismo cuantizador:

| Especificacion | Tamano en disco | Huella en RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Delta PPL vs. BF16 | Tier de calidad equivalente |
|---|---|---|---|---|---|---|
| Base BF16 sin cuantizar | ~71,0 GB | ~66,2 GiB | 16,00 | ~7,58 (referencia) | 0,000 | Precision completa |
| APEX-I-MiniPlus V2.1 | 15,23 GB | 14,18 GiB | 3,43 | 7,6370 +/- 0,21010 | +0,0570 (+0,75 %) | Q5_K_L, rozando Q6_K |
| APEX-I-NanoPlus (esta ficha) | 12,55 GB | 11,69 GiB | ~2,93 | 8,0913 +/- 0,22535 | +0,5113 (+6,75 %) | Q4_K_M solido |

Rendimiento de generacion declarado: entre 20 y 45 tok/s en inferencia por RAM del sistema, dependiendo del procesador, el ancho de banda de memoria y la configuracion DDR4/DDR5. No se han publicado datos de MMLU, HumanEval, GSM8K ni SWE-bench para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,69 GiB de pesos en VRAM si se hace offload completo; con contexto de 32K en una tarjeta de 16 GB quedan mas de 4 GB libres segun la model card.
- GPU de 16 GB: offload completo con contexto nativo de 32K-64K (se mencionan RTX 4080 y RTX 4070 Ti).
- GPU de 24 GB: la variante MiniPlus V2.1 (15,23 GB) cabe sin esfuerzo en 24 GB; la NanoPlus de 12,55 GB tambien, con margen adicional para contexto mas largo.
- GPU de 32 GB (por ejemplo RTX 5090): configuraciones de referencia de la familia APEX-I se han evaluado con llama.cpp CUDA, FlashAttention activada, cache K y V en q8_0 y -ngl 99.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas. Por debajo de 16 GB es necesario offload parcial.
- Inferencia total o parcial en RAM del sistema: viable, con 20-45 tok/s segun CPU y memoria. Permite sostener contexto de 128K o superior cuando no cabe entero en VRAM.
- Opciones de despliegue: llama.cpp es el runtime indicado por las etiquetas y la model card. Para el modelo base, fuentes externas mencionan soporte oficial de vLLM, SGLang y GGUF.
- Latencia y throughput: 20-45 tok/s en modo RAM del sistema segun la model card. No se especifican cifras de latencia ni de throughput para offload completo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B APEX-I-NanoPlus (esta ficha) | ~34,66B totales, ~3B activos | No disponible en la model card; 262K reportados para el modelo base en fuentes externas | 8,0913 +/- 0,22535 (+6,75 % vs. BF16) | MIT | GGUF de 12,55 GB en HuggingFace |
| Ornith-1.5-35B-A3B APEX-I-MiniPlus V2.1 | ~34,66B totales, ~3B activos | Igual que el modelo base | 7,6370 +/- 0,21010 (+0,75 % vs. BF16) | MIT | GGUF de 15,23 GB en HuggingFace |
| Ornith-1.5-35B-A3B base en BF16 | ~34,66B totales, ~3B activos | 262K segun fuentes externas | ~7,58 (referencia) | MIT | Safetensors, ~71,0 GB |
| Cuantizados genericos de la comunidad sub-3-bit (IQ2_S / IQ2_XXS uniformes) | ~34,66B totales, ~3B activos | Depende del runtime | No disponible | Depende del publicador | GGUF; segun la model card, provocan picos de perplejidad y errores de sintaxis en razonamiento profundo |
| IsValorum/Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | No disponible | No disponible | No disponible | No disponible | GGUF de ~13,0 GB, mismo cuantizador |
| IsValorum/Occamy-1.0 APEX-I-NanoPlus | No disponible | No disponible | No disponible | No disponible | GGUF, mismo cuantizador |

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: +0,5113 puntos de perplejidad en WikiText-2 respecto al BF16, un 6,75 % de degradacion. No es una cuantizacion sin perdida.
- Los niveles sub-3-bit son sensibles en modelos de razonamiento profundo. La propia model card advierte de que cuantizados genericos IQ2_S/IQ2_XXS sin calibracion provocan picos de perplejidad, errores de sintaxis y corchetes de codigo roto; aunque esta receta esta disenada para mitigarlo, el riesgo no desaparece.
- No hay resultados publicados de benchmarks de tareas (codigo, matematicas, agentes) para esta cuantizacion concreta. La evaluacion se limita a perplejidad.
- No se documenta de forma explicita el soporte de tool calling o function calling en la informacion disponible, pese a la orientacion agentica del modelo base.
- La longitud de contexto efectiva no esta confirmada en la model card de esta cuantizacion; las cifras de 262K proceden de fuentes externas y de la ficha del modelo base, no de este repositorio.
- El modelo es multimodal, pero no se detalla en la informacion disponible que variantes de cuantizacion se aplicaron al codificador de vision ni como afecta la compresion a la calidad de las tareas de imagen.
- Riesgo de sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En modelos de razonamiento cuantizados agresivamente, la degradacion de la cabeza de salida y del flujo residual suele asociarse a mayor probabilidad de incoherencias.
- Licencia: este repositorio declara MIT, pero conviene verificar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de uso comercial, ya que la ficha no reproduce sus terminos.
- Fecha de publicacion inusual: HuggingFace registra la creacion el 24 de septiembre de 2026, dato que puede indicar un error de metadatos o una fecha futura.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de esta release concreta. La evaluacion independiente mencionada en los resultados de busqueda corresponde a la variante MiniPlus V2.1, no a esta.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MiniPlus V2.1 del mismo cuantizador: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Variante NanoPlus de Qwen3.6-35B-A3B-MTP: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Variante NanoPlus de Occamy-1.0: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Cuantizado alternativo de la misma familia por mudler: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-GGUF
- Ficha en local-ai-zone del modelo APEX: https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b-apex.html
- Ficha en local-ai-zone del modelo base: https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b.html
- Articulo con especificaciones y guia de ejecucion local (menciona 262K de contexto y soporte de vLLM, SGLang y GGUF): https://www.aimadetools.com/blog/ornith-1-5-35b-a3b/
