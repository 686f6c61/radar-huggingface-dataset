# kelsey1337/DaisyRose-27B-Heretic-v2-MTP-GGUF

## Resumen
DaisyRose-27B-Heretic-v2-MTP-GGUF es una distribucion en formato GGUF del modelo DaisyRose-27B-Heretic-v2, un modelo de 27.320.697.856 parametros derivado de RadixArk/DaisyRose-27B y sometido a un proceso de abliteration (eliminacion de comportamientos de rechazo) por parte del autor kelsey1337. La particularidad de esta publicacion es que restaura la cabeza MTP (multi-token prediction) que el pipeline de guardado de Heretic habia descartado, habilitando de nuevo la decodificacion especulativa autocontenida en llama.cpp.

El checkpoint original de Heretic v2 contiene 1.184 tensores y ningun tensor `mtp.*`, pese a que su configuracion sigue declarando `mtp_num_hidden_layers: 1`. Esto hacia que la opcion `--spec-type draft-mtp` de llama.cpp no tuviera cabeza borrador que ejecutar en ningun GGUF derivado. El autor copio de vuelta los 15 tensores `mtp.*` sin modificar desde el checkpoint original RadixArk/DaisyRose-27B, generando un checkpoint fusionado de 1.199 tensores con un conjunto de nombres identico al original.

El resultado es un modelo conversacional multimodal (texto e imagen via proyector mmproj) con licencia Apache-2.0, publicado el 26 de noviembre de 2026, que recupera aceleracion por decodificacion especulativa en hardware de consumo. La relevancia actual radica en que permite desplegar un modelo de 27B con cuantizaciones de 15,7 GB en adelante y aprovechar la cabeza MTP para reducir latencia sin necesidad de un modelo borrador externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, segun tags) con cabeza MTP de 1 capa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS; proyector vision F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del checkpoint fusionado en repo separado) |

## Arquitectura y entrenamiento
La arquitectura es un transformer denso de 27B parametros con una cabeza de prediccion multi-token (MTP) de una capa (`mtp_num_hidden_layers: 1`). El modelo base RadixArk/DaisyRose-27B incluye un proyector de vision que en esta publicacion se distribuye por separado como `mmproj-DaisyRose-27B-Heretic-v2-f16.gguf` (0,93 GB), lo que confirma capacidades multimodales de entrada de imagen. La capa MTP se almacena como bloque 64 (`blk.64.*`), incluyendo los cuatro tensores `blk.64.nextn.*`, y se usa como cabeza borrador para decodificacion especulativa interna.

Sobre el entrenamiento no se proporciona informacion en la model card: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta es el proceso de modificacion: el autor aplico abliteration sobre el checkpoint original (afectando unicamente al tronco, no a la cabeza MTP) y posteriormente restauro los 15 tensores `mtp.*` byte a byte desde el checkpoint original. La conversion a GGUF se realizo con llama.cpp desde una reconstruccion solo-texto del modelo principal (la ruta del conversor VL descarta MTP), con el proyector de vision generado aparte. Las cuantizaciones se produjeron desde el maestro BF16 con `llama-quantize` sin matriz de importancia.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes mediante el proyector mmproj (vision).
- Decodificacion especulativa autocontenida mediante la cabeza MTP restaurada (`--spec-type draft-mtp`).
- Comportamiento abliterated: el modelo ha sido modificado para eliminar rechazos, lo que afecta a su comportamiento ante peticiones sensibles.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue local con aceleracion especulativa: usar `llama-server` con `--spec-type draft-mtp` sobre la cuantizacion Q4_K_M (17,0 GB) para servir un modelo de 27B en una unica GPU de consumo con latencia reducida gracias a la cabeza MTP como borrador interno.
- Asistente conversacional con contexto de imagen: cargar el modelo junto con `--mmproj mmproj-DaisyRose-27B-Heretic-v2-f16.gguf` para tareas de descripcion de imagenes, extraccion de informacion visual o respuesta a preguntas sobre capturas y documentos escaneados.
- Experimentacion en investigacion sobre abliteration: el modelo sirve como caso de estudio de como las modificaciones de pesos afectan a subcomponentes auxiliares (la cabeza MTP) y de como restaurarlos desde el checkpoint original.
- Prototipado de pipelines de inferencia en CPU/GPU mixtas: las cuantizaciones IQ4_XS (15,7 GB) e IQ4_NL (16,3 GB) permiten ejecutar el modelo en equipos con 16 GB de VRAM o con offloading parcial a RAM.
- Evaluacion comparativa de decodificacion especulativa: comparar throughput con y sin `--spec-type draft-mtp` sobre el mismo GGUF para medir la ganancia real de la cabeza MTP en distintos hardware.
- Generacion de texto sin restricciones de rechazo: en entornos de investigacion controlados donde se requiera estudiar el comportamiento de modelos abliterated frente a sus versiones alineadas.
- Servicio de chat compatible con API de endpoints: al estar etiquetado como `endpoints_compatible`, puede integrarse en infraestructuras que consuman APIs compatibles con OpenAI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: BF16 54,7 GB; Q8_0 29,0 GB; Q6_K 22,4 GB; Q5_K_M 19,6 GB; Q4_K_M 17,0 GB; IQ4_NL 16,3 GB; IQ4_XS 15,7 GB. Anadir 0,93 GB si se usa el proyector de vision.
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, A100 40 GB o dos RTX 4090; para Q4_K_M e inferiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ4_XS o IQ4_NL ajustando el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con soporte de `--spec-type draft-mtp`; el formato GGUF es compatible con otros runners basados en llama.cpp, aunque la decodificacion especulativa MTP requiere versiones que soporten dicha opcion.
- Latencia y throughput estimados: no disponibles; la model card solo verifica que la cabeza MTP genera borradores durante la generacion, sin cifras de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-MTP-GGUF | 27,3B | no disponible | GGUF | Apache-2.0 | MTP restaurada, vision via mmproj |
| kelsey1337/DaisyRose-27B-Heretic-v2 | no disponible | no disponible | safetensors | Apache-2.0 | Sin cabeza MTP; `--spec-type draft-mtp` inoperativo |
| RadixArk/DaisyRose-27B | no disponible | no disponible | safetensors | Apache-2.0 | Checkpoint original, sin abliteration, con MTP intacta |

## Limitaciones y advertencias
- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que los modelos alineados bloquearian. No apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo conversacional sin benchmarks disponibles, la fiabilidad factual no esta verificada.
- La cabeza MTP restaurada procede del checkpoint original sin abliteration; el autor afirma que Heretic nunca modifico esa parte, pero no se aportan metricas que confirmen que la decodificacion especulativa mantiene la misma distribucion que el tronco abliterated.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar la configuracion del modelo base.
- Idiomas soportados no documentados: el rendimiento multilingue es desconocido.
- Las cuantizaciones se generaron sin matriz de importancia, lo que puede suponer una perdida de calidad algo mayor en las cuantizaciones de 4 bits frente a variantes con imatrix.
- El conversor VL de llama.cpp descarta MTP, de modo que el modelo principal se convirtio desde una reconstruccion solo-texto; la vision depende del mmproj separado y de que el runner lo cargue correctamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero la condicion de abliterated puede entrar en conflicto con politicas de plataformas o requisitos regulatorios del despliegue.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP-GGUF
- Checkpoint safetensors fusionado: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP
- Modelo base Heretic v2: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Modelo original: https://huggingface.co/RadixArk/DaisyRose-27B
