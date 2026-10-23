# kindlingai/glm-5.3-flash-exlr8-k2-k3-k4

## Resumen

`kindlingai/glm-5.3-flash-exlr8-k2-k3-k4` es una cuantización del modelo multimodal GLM-5.3-Flash (desarrollado por zai-org, el equipo de Z.ai detrás de la familia GLM) publicada por KindlingAI en el formato propio **exlr8 v2**. No es un modelo nuevo: es un empaquetado de pesos que reescribe los expertos enrutados y compartidos y las matrices densas del modelo base en una representación *trellis* con códecs de 2, 3 y 4 bits por peso, manteniendo la torre de visión en BF16. El objetivo declarado es servir un MoE de gran tamaño en dispositivos de memoria unificada de la clase NVIDIA GB10 (DGX Spark, ASUS GX10), desde una hasta cuatro máquinas.

La relevancia técnica está en el formato: cada anchura (K2, K3, K4) es una codificación trellis independiente y consciente de la Hessiana, no un recorte de la anterior, y las tres comparten códebook E4M3 para que el *prefill* corra sobre tensor cores de FP8. El repositorio empaqueta 712,9 GB de ficheros, con un tamaño de modelo cargado de 86,3 GB (K2), 125,4 GB (K3) y 164,5 GB (K4), lo que permite elegir el ancho en tiempo de carga según el número de cajas disponibles.

El modelo base es un transformer MoE con 45 capas (0-2 densas, 3-44 MoE), 288 expertos enrutados con enrutamiento top-8 más un experto compartido por capa MoE, una capa MTP (45) y una torre de visión; el resultado es un modelo *image-text-to-text* conversacional. La licencia del repositorio es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (45 capas: 0-2 densas, 3-44 MoE) con atencion lineal y MLA, capa MTP (45) y torre de vision; 288 expertos enrutados con top-8 + 1 experto compartido por capa MoE |
| Parametros totales | No disponible en la informacion proporcionada (tamano de checkpoint cargado: 86,3 GB en K2, 125,4 GB en K3, 164,5 GB en K4) |
| Parametros activos | No disponible; el enrutamiento es top-8 sobre 288 expertos enrutados mas 1 compartido por capa MoE |
| Longitud de contexto | No disponible en la model card; los benchmarks de prefill llegan a 128K tokens, por lo que el contexto soportado es de al menos 128K |
| Tipos de cuantizacion | exlr8 v2 trellis en tres anchuras: K2 (2,0 bpw), K3 (3,0 bpw), K4 (4,0 bpw), con codebook E4M3 y redondeo E4M3 obligatorio; matrices densas en trellis K4, MXFP8, FP8 con escalas de bloque 128x128, FP8 con escalas por fila y BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (repositorio de cuantizacion); la licencia del modelo base no se detalla en la informacion disponible |
| Formato de pesos | safetensors (pares trellis + indice por capa, ficheros densos, vocabulario, vision en BF16), mas config.json, generation_config.json, tokenizer, chat_template y processor_config heredados del modelo base; incluye hashes/ con SHA-256 y expert-build-summary.json |

Otros datos: hidden size 4096, tamano intermedio de experto 2048, 32 escalas de bloque por proyeccion; el experto compartido se almacena como experto 288; tamano del repo 712,9 GB; descargas 103 y 2 likes en el momento de la consulta; creado el 2026-10-14 y actualizado el 2026-10-22; libreria `trellis`.

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con 45 capas: las capas 0 a 2 son densas y de la 3 a la 44 son capas MoE con 288 expertos enrutados, seleccion de top-8 y un experto compartido adicional por capa. Incorpora atencion lineal y MLA (multi-head latent attention) segun los nombres de matrices descritos (`q_b_proj`, `kv_b_proj`, `q_a`, `kv_a`, proyecciones `b`, `f_a/f_b`, `g_a/g_b`), una capa MTP (multi-token prediction) en la posicion 45 y una torre de vision para entrada de imagen. Con hidden size 4096 e intermedio de experto 2048, cada proyeccion se divide en 16 mitades de 128 canales, lo que fija el esquema de sharding del formato.

Esta publicacion no entrena nada: es una codificacion de pesos. Cada anchura se obtiene mediante una busqueda trellis consciente de la Hessiana sobre los valores ya redondeados a E4M3, de modo que el redondeo forma parte del formato y un decodificador EXL3 estandar —o cualquiera que omita el redondeo— lee pesos mediblemente peores de los mismos bytes. Las matrices se tratan por tipo: salida de atencion, `q_b_proj` y MLP denso de las capas 0-2 en trellis K4; proyecciones de entrada de atencion lineal, `q_a`, `kv_a`, indexer `wq_b`/`wk` y `eh_proj` de MTP en MXFP8; `kv_b_proj` en FP8 con escalas de bloque 128x128; embedding y cabeza LM en FP8 con escalas por fila; router, `weights_proj`, normas y sesgos en BF16 tal cual. La torre de vision se conserva sin cuantizar en BF16.

No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, si hubo RLHF/DPO), ni innovaciones de decodificacion propias del modelo; la receta de servicio si incorpora decodificacion especulativa DFlash2 con longitud de borrador adaptativa.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla `chat_template.jinja` heredada del modelo base.
- Entrada de imagen y texto (`pipeline_tag: image-text-to-text`) mediante torre de vision conservada en BF16; el soporte de imagen se mantiene en todos los grados de tensor-parallel de la receta de servicio.
- Razonamiento y generacion de codigo: los benchmarks de servicio reportan una carga de trabajo de "code" con tasa de decodificacion propia (53,0 a 128,0 tok/s segun TP), lo que confirma uso en dominios de codigo.
- Razonamiento matematico: se reporta una puntuacion GSM8K del 98% para K4, identica a la build NVFP4.
- Prediccion multi-token: la capa MTP 45 esta cuantizada y presente en el checkpoint, y la receta de servicio usa decodificacion especulativa DFlash2.
- Capacidad de servir en paralelo de tensores a TP=1, 2, 3 y 4 con una regla de sharding documentada (la mitad h del experto e va al rango `(16e + h + L) mod N`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (la receta incluye un plano de control, `mentat`, pero no se detallan capacidades de agente).
- Capacidades multilingues: no disponible; no se publica lista de idiomas.
- Modo "thinking" explicito o salidas de audio: no disponible.

## Casos de uso

- Despliegue de un MoE multimodal en hardware de memoria unificada: con K2 (86,3 GB) el modelo cabe en una sola caja GB10 de 128 GB a TP=1, lo que permite montar un nodo de inferencia con un solo equipo sin GPU de datacenter.
- Servicio de chat con imagenes en produccion interna: al mantenerse la torre de vision en BF16 y el procesador del modelo base, se puede usar el mismo endpoint para consultas image-text-to-text sin recuantizar la parte visual.
- Escalado horizontal por anchura: para cargas que exigen mas calidad, K4 a TP=3 o TP=4 ofrece 105,8-128,0 tok/s en codigo y 3.002-4.393 tok/s de prefill a 8K, adecuado para asistentes interactivos con muchos usuarios concurrentes.
- Procesado de documentos largos: con prefill medido a 32K y 128K tokens, el modelo sirve para resumir o extraer datos de expedientes, contratos o articulos extensos en una sola pasada de contexto.
- Asistencia a programacion en pipelines de CI/CD: la carga "code" es la de mayor tasa de decodificacion (hasta 128,0 tok/s en TP=4) y GSM8K al 98% sugiere utilidad en tareas de reparacion y generacion de parches con verificacion automatica.
- Evaluacion comparativa de formatos de cuantizacion: el repositorio incluye hashes SHA-256 por fichero y `expert-build-summary.json`, lo que facilita reproducir experimentos de NLL frente a BF16 y comparar K4 con la build NVFP4 sobre el mismo hardware.
- Nodo de investigacion con memoria unificada: para equipos que quieren estudiar comportamiento de MoEs de 288 expertos sin acceso a clústeres de A100/H100, las tres anchuras permiten barrer el compromiso calidad/tamano en la misma maquina.
- Inferencia por lotes con cache KV ampliada: al ser los pesos de experto mas pequenos que en NVFP4, la receta reporta una poza de KV aproximadamente un 15% mayor con la misma memoria, lo que ayuda en escenarios de muchas conversaciones simultaneas.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval ni de la mayoria de benchmarks academicos en la informacion disponible. Los datos aportados son de calidad relativa y de throughput en la receta de servicio sobre GB10 con relojes fijados a 2200 MHz (medicion del 2026-10-19, media de 16 ejecuciones por carga con decodificacion especulativa DFlash2).

Calidad (K4 frente a BF16 y frente a la build NVFP4):

| Metrica | Resultado reportado |
|---|---|
| GSM8K | 98% (igual que la build NVFP4) |
| NLL frente a BF16 en tres conjuntos held-out | Igual o ligeramente mejor |
| K2 y K3 | No evaluados frente a BF16 en esta publicacion |

Rendimiento (tokens por segundo):

| TP (anchura) | Decode, codigo | Decode, prosa | Prefill 8K | Prefill 32K |
|---|---|---|---|---|
| 1 (K2) | 53,0 | 29,5 | 495 | 523 |
| 2 (K3) | 84,2 | 50,1 | 2.609 | 2.687 |
| 3 (K4) | 105,8 | 57,8 | 3.002 | 3.391 |
| 4 (K4) | 128,0 | 72,5 | 4.393 | 4.190 |

Comparacion directa con la build NVFP4 de GLM-5.3-Flash en las mismas cuatro cajas, K4 a TP=4: decodificacion entre un 3% y un 8% mas rapida (codigo +7,7%, prosa +3,0%), misma calidad, poza de KV un 15% mayor y prefill un 7,7% mas lento a 32K y 128K por el kernel MoE enrutado con lotes grandes.

## Requisitos de hardware

- Memoria: K2 requiere 86,3 GB de pesos y cabe en una caja GB10 de 128 GB de memoria unificada a TP=1; K3 necesita 125,4 GB y se sirve a TP=2; K4 ocupa 164,5 GB y se sirve a TP=3 o TP=4.
- GPU objetivo: dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10). No hay datos de despliegue en A100, H100, RTX 4090 ni otras GPU discretas en la informacion disponible.
- Ajuste en GPU de consumo: no disponible; el formato y la receta estan disenados para GB10, no se documenta soporte para GPUs de consumo.
- Topologias validadas: TP=1, 2, 3 y 4 cajas, con regla de sharding de expertos documentada; el soporte de imagen funciona en todos los TP.
- Software: vLLM con kernel MoE exlr8, decodificacion especulativa DFlash2 y el plano de control `mentat`, segun la receta `kindlingai/glm-5.3-flash-exlr8-gx10`. Los decodificadores EXL3 estandar no son validos sin el redondeo E4M3.
- Almacenamiento: el repo completo ocupa 712,9 GB porque incluye las tres anchuras; una sola copia cargada ocupa entre 86,3 y 164,5 GB.
- Throughput y latencia: 29,5-128,0 tok/s en decodificacion y 495-4.393 tok/s en prefill segun TP y anchura (tabla anterior); no se publican latencias por peticion ni TTFT.
- Otros entornos (llama.cpp, Ollama, TGI, GGUF): no disponible; el repositorio solo declara la libreria `trellis` y la receta vLLM para GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GLM-5.3-Flash exlr8 K2/K3/K4) | No disponible (288 expertos enrutados, top-8 + 1 compartido, 45 capas) | Al menos 128K (segun benchmarks de prefill) | exlr8 v2 trellis 2/3/4 bpw + MXFP8/FP8/BF16 | GSM8K 98% (K4); 128,0 tok/s decode y 4.393 tok/s prefill a TP=4 | MIT (repo) | HuggingFace, 103 descargas |
| GLM-5.3-Flash en NVFP4 (build alternativa del mismo base) | Mismo modelo base | Al menos 128K | NVFP4, 4,25 bpw en expertos | Decodificacion 3-8% mas lenta que K4; misma calidad; prefill 7,7% mas rapido a 32K/128K | No disponible | Referenciado en la model card |
| GLM-5.3 (no Flash) exlr8 K2/K3/K4 | No disponible; hidden size 6144 frente a 4096 del Flash | No disponible | exlr8 v2 trellis, mismas anchuras | No disponible | No disponible | HuggingFace |
| GLM-5.3-Flash-BF16 (modelo base sin cuantizar) | No disponible | No disponible | BF16 safetensors | Referencia de calidad (NLL y GSM8K) | No disponible | HuggingFace (zai-org) |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias con tamano o tarea equivalentes.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: cualquier cargador debe redondear cada valor producido por el codebook trellis a FP8 E4M3 (redondeo al par mas cercano, saturante) antes de aplicar los vectores laterales. Un decodificador EXL3 estandar lee pesos mediblemente peores.
- K2 y K3 no han sido evaluados frente a BF16 en esta publicacion; la propia model card recomienda medirlos en la carga de trabajo propia antes de confiar en ellos. Solo K4 tiene comparacion de calidad publicada.
- El prefill es un 7,7% mas lento que la build NVFP4 a 32K y 128K por el kernel MoE enrutado con lotes grandes: es un compromiso relevante para cargas con contextos largos y mucho trafico.
- Esta release carece de manifiestos (el equivalente en la version no Flash si los tiene), lo que complica la verificacion automatica de integridad mas alla de los SHA-256 en `hashes/` y `expert-build-summary.json`.
- El formato es propietario (`exlr8 v2`, libreria `trellis`) y depende de una receta de servicio concreta (vLLM + kernel exlr8 + DFlash2 + mentat). No hay soporte declarado en llama.cpp, Ollama, TGI ni GGUF.
- Dependencia de hardware muy especifica: la receta esta validada solo en GB10 (DGX Spark, ASUS GX10) con TP de 1 a 4. El comportamiento en GPUs discretas o en otros aceleradores no esta documentado.
- No se publica lista de idiomas soportados; el rendimiento fuera de ingles y chino es desconocido.
- La licencia MIT cubre este repositorio de cuantizacion, pero el modelo base (zai-org/GLM-5.3-Flash-BF16) puede tener terminos propios que no se detallan en la informacion disponible; conviene verificar la licencia del base antes de uso comercial.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan mediciones especificas para esta cuantizacion.
- La fecha de publicacion (2026-10) y el numero de descargas (103) indican adopcion temprana: no hay historial de produccion ni reportes independientes de terceros.
- La busqueda web realizada no devolvio material relevante sobre el modelo (los resultados correspondian al modismo ingles "under the table"); toda la informacion de esta ficha procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
- Receta de servicio para GB10 (TP=1 a 4, vLLM + kernel exlr8 + DFlash2): https://github.com/kindlingai/glm-5.3-flash-exlr8-gx10
- Plano de control mentat: https://github.com/kindlingai/mentat
- Version exlr8 K2/K3/K4 del GLM-5.3 no Flash (descripcion a nivel de byte del formato y seccion Loader): https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
