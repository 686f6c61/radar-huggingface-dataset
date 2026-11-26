# bpx03/Inkling-2-Mini-QEngine

## Resumen

Inkling-2-Mini-QEngine es un paquete de pesos complementario para el modelo thinkingmachines/Inkling-2-Mini, publicado por el usuario bpx03. No se trata de un modelo completo e independiente, sino de dos ficheros en formato safetensors que sustituyen parcialmente los pesos del checkpoint oficial para su uso con el motor de inferencia QEngine (version 1.6.0 o superior). Los expertos del modelo original se mantienen tal cual los distribuye el checkpoint (NVFP4 / MXFP8); estos ficheros solo reemplazan los pesos densos de atencion y el drafter de decodificacion especulativa.

El primero de los ficheros, dense8.safetensors (0,65 GB), contiene los pesos densos de atencion cuantizados a INT8 con una escala por cada 128 entradas y redondeo GPTQ con realimentacion de error sobre activaciones de texto publico. El segundo, mtp_qe.safetensors (0,64 GB), es el drafter DSpark del modelo, reajustado sobre las propias salidas del modelo con las mismas formas y una politica de parada propia. El objetivo es reducir los bytes leidos por token durante la decodificacion, mejorando la velocidad sin degradar de forma apreciable la calidad.

La relevancia de esta publicacion es practica: permite ejecutar Inkling-2-Mini en QEngine con menor latencia por paso de decodificacion y con un contexto utilizable mayor en configuraciones de una o dos GPU. La licencia es Apache 2.0 y el repositorio ocupa 1,3 GB. No se dispone de informacion sobre el pipeline ni sobre los idiomas soportados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada del modelo base thinkingmachines/Inkling-2-Mini; los ficheros publicados son pesos densos de atencion y un drafter) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta ~565K tokens con dos tarjetas y ~126K con una tarjeta (con pesos densos INT8, segun el autor) |
| Tipos de cuantizacion | INT8 para pesos densos de atencion (GPTQ, una escala por 128 entradas); expertos en NVFP4 / MXFP8 segun el checkpoint original; alternativa g15 (bf16 original, sin perdida) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dense8.safetensors, mtp_qe.safetensors) |

## Arquitectura y entrenamiento

Los ficheros publicados no constituyen un modelo entrenado desde cero, sino un artefacto de optimizacion sobre thinkingmachines/Inkling-2-Mini (revision b85c3cfa). El modelo base emplea una arquitectura con componentes de expertos (NVFP4 / MXFP8) y atencion densa; estos ficheros solo reemplazan los pesos densos de atencion y el drafter de decodificacion especulativa, manteniendo intactos los expertos.

La cuantizacion de dense8.safetensors usa INT8 con una escala por cada 128 entradas de entrada y redondeo GPTQ con realimentacion de error calculada sobre activaciones de texto publico. El drafter mtp_qe.safetensors es el DSpark del modelo base, reajustado sobre las propias salidas del modelo para reducir el exceso de confianza y dotarlo de una politica de parada propia. La decodificacion especulativa verifica cada token propuesto contra la eleccion del propio modelo, de modo que los borradores nunca alteran el texto final.

## Capacidades

- Inferencia acelerada del modelo base Inkling-2-Mini mediante QEngine 1.6.0 o superior.
- Decodificacion especulativa con drafter DSpark reajustado y politica de parada propia.
- Ejecucion en una o dos GPU; el modo de dos tarjetas requiere P2P entre GPU.
- Contexto extendido: hasta ~565K tokens con dos tarjetas y ~126K con una tarjeta usando pesos densos INT8.
- Seleccion de pesos densos: INT8 (por defecto), g15 (bf16 original sin perdida) o ausencia de fichero (bf16 del checkpoint).
- Capacidades funcionales del modelo base (generacion de texto, razonamiento, codigo, tool calling, multilingue): no disponibles en la informacion proporcionada; dependen del checkpoint original.

## Casos de uso

- Despliegue de Inkling-2-Mini en produccion con QEngine: los ficheros permiten arrancar el servidor con `server/run.sh 8080 --model models/Inkling-2-Mini` en una sola GPU, reduciendo el paso de decodificacion a ~7,1 ms frente a ~8,0 ms con los pesos originales.
- Servicio de contexto largo en dos GPU: con `QE_DEVICES=0,1` y pesos INT8 se alcanzan ~565K tokens de contexto, adecuado para analisis de documentos extensos o conversaciones de muchos turnos.
- Inferencia en una RTX 3090: el autor reporta ~7,1 ms por paso de decodificacion y ~126K tokens de contexto en una sola tarjeta, lo que permite prototipado y evaluacion local.
- Comparacion de calidad frente a los pesos originales: el modo g15 permite ejecutar los pesos bf16 sin perdida para validar que la cuantizacion INT8 no degrada la salida (KL de 0,00539 frente a 0,00495).
- Aceleracion de pipelines de generacion con decodificacion especulativa: el drafter reajustado propone tokens que se verifican contra el modelo, manteniendo la fidelidad del texto.
- Evaluacion de motores de inferencia: el paquete sirve como banco de pruebas para medir latencia, contexto y calidad de QEngine frente a otras implementaciones sobre el mismo checkpoint.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (RTX 3090, QEngine 1.6.0):

| Pesos densos | Paso de decodificacion, 2 tarjetas / 1 tarjeta | KL del siguiente token frente a referencia fp32 | Contexto, 2 tarjetas / 1 tarjeta |
|---|---|---|---|
| int8 (este fichero, por defecto) | ~4,9 / ~7,1 ms | 0,00539 (una tarjeta 0,00538) | ~565K / ~126K |
| g15 (pesos originales, sin perdida) | ~5,5 / ~8,0 ms | 0,00495 | ~544K / ~117K |

Referencia adicional: el forward oficial en bf16 mide 0,00592 en el mismo conjunto. La coincidencia top-1 con int8 es del 97,6 %.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete ocupa 1,3 GB en disco y se suma al checkpoint oficial de Inkling-2-Mini, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: el autor reporta mediciones en RTX 3090; no se especifican otras GPU.
- Configuracion de una tarjeta: ~7,1 ms por paso de decodificacion y ~126K tokens de contexto con pesos INT8.
- Configuracion de dos tarjetas: ~4,9 ms por paso y ~565K tokens de contexto; requiere P2P entre GPU.
- Cabe en GPU de consumo: si, al menos en RTX 3090 segun las mediciones del autor.
- Opciones de despliegue: QEngine 1.6.0 o superior (unico motor soportado explicitamente); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencias por paso de decodificacion indicadas arriba; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-QEngine (este paquete) | No disponible | ~565K (2 GPU) / ~126K (1 GPU) | Apache 2.0 | safetensors INT8 + drafter | Optimizacion para QEngine sobre Inkling-2-Mini |
| thinkingmachines/Inkling-2-Mini (checkpoint oficial) | No disponible | No disponible | No disponible | safetensors bf16 / NVFP4 / MXFP8 | Modelo base; sin las optimizaciones de este paquete |
| Inkling-2-Mini con pesos g15 | No disponible | ~544K / ~117K | Apache 2.0 | safetensors bf16 | Variante sin perdida del mismo paquete |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar el checkpoint oficial thinkingmachines/Inkling-2-Mini (revision b85c3cfa) y colocar los ficheros junto a el.
- Dependencia de QEngine 1.6.0 o superior; no se documenta compatibilidad con otros motores de inferencia.
- La cuantizacion INT8 introduce una degradacion medible: KL de 0,00539 frente a 0,00495 con pesos originales y 97,6 % de coincidencia top-1.
- El modo de dos tarjetas exige P2P entre GPU; sin esta caracteristica no es viable esa configuracion.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia (26 de noviembre de 2026), por lo que no hay validacion comunitaria independiente.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni restricciones adicionales del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bpx03/Inkling-2-Mini-QEngine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor QEngine: https://github.com/bpx03/QEngine
