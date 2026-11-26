# nchapman/Arete-27B-W4A16-HGPTQ

## Resumen
Arete-27B-W4A16-HGPTQ es una cuantización de 4 bits del modelo NousResearch/Arete-27B, un modelo post-entrenado derivado de Qwen3.8-27B y orientado por Nous Research a la precision factual y la alineacion de valores. La publica nchapman como checkpoint listo para inferencia en GPUs de consumo, con arquitectura Qwen3.5 (transformador multimodal de texto e imagen) y pesos empaquetados en compressed-tensors con esquema W4A16 GPTQ y rotacion Hadamard.

El checkpoint no se limita a reducir precision: reincorpora la cabeza de decodificacion especulativa Multi-Token Prediction (MTP) que la release original de Arete-27B omitio, injertando la cabeza compatible de Qwen3.8-27B y calibrandola sobre los estados ocultos de Arete-27B. Segun la model card, recupera un 96,5 % de acuerdo de borrador aislado (88,7 % extremo a extremo) y mantiene un 98,3 % de coincidencia top-1 en la torre de vision.

Su relevancia practica es clara: comprime 52,80 GiB en BF16 a 16,14 GiB en disco (3,3 veces menos), lo que permite servir un modelo de 29.105 millones de parametros con vision y contexto largo en una unica GPU de 24 GB, como una RTX 3090 o RTX 4090, mediante warp34 o vLLM 0.34 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador multimodal (image-text-to-text) de la familia Qwen3.5, con cabeza MTP de decodificacion especulativa |
| Parametros totales | 29.105.255.152 (29,1 mil millones) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits), GPTQ con rotacion Hadamard, formato compressed-tensors; cabeza de salida en 8 bits |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM y warp34 |
| Tamano en disco | 16,14 GiB (frente a 52,80 GiB en BF16) |
| Modelo base | NousResearch/Arete-27B (a su vez post-entrenado sobre Qwen3.8-27B) |
| Descargas en Hugging Face | 779 |

## Arquitectura y entrenamiento
El modelo subyacente es un transformador denso de la familia Qwen3.5 con torre de vision, lo que habilita la pipeline image-text-to-text. Nous Research aplico un post-entrenamiento sobre Qwen3.8-27B centrado en precision factual y alineacion de valores; la model card no detalla el volumen de tokens, la composicion del dataset ni si se emplearon RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion tecnica de esta cuantizacion es doble. Por un lado, aplica GPTQ W4A16 con rotacion Hadamard y calibra conjuntamente el backbone de texto y la torre de vision, manteniendo una cabeza de salida en 8 bits para preservar fidelidad cercana a BF16. Por otro, restaura la decodificacion especulativa MTP nativa: injerta la cabeza MTP de Qwen3.8-27B y la calibra sobre los estados ocultos de Arete-27B, logrando un 96,5 % de acuerdo de borrador aislado y un 88,7 % extremo a extremo. El resultado se ejecuta con kernels CUDA a plena velocidad en warp34 sin flags adicionales.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y texto combinados (image-text-to-text) gracias a la torre de vision calibrada.
- Razonamiento y respuesta orientados a precision factual y alineacion de valores, herencia del post-entrenamiento de Nous Research.
- Decodificacion especulativa MTP integrada, que acelera la generacion sin cambios en el prompt.
- Compatibilidad con transformers, vLLM 0.34 o superior y warp34.
- Soporte de tool calling, agentes, modo thinking o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente conversacional en estacion de trabajo: con 16,14 GiB de pesos, el modelo cabe en una RTX 4090 de 24 GB y deja margen para contexto largo, permitiendo desplegar un chatbot local sin dependencia de la nube.
- Analisis de documentos con imagenes: la pipeline image-text-to-text permite extraer informacion de capturas, diagramas o formularios escaneados junto con el texto asociado en una sola pasada.
- Generacion asistida con baja latencia: la decodificacion especulativa MTP restaurada reduce el coste por token en comparacion con la release original sin cabeza MTP, adecuada para entornos interactivos.
- Investigacion sobre cuantizacion: el checkpoint y el repositorio warp34-quant-lab sirven como referencia reproducible para estudiar el impacto de W4A16 con Hadamard en fidelidad de texto y vision.
- Despliegue en servidores de un solo acelerador: vLLM 0.34 o superior permite servir el modelo con batching continuo en una unica GPU de 24 GB, util para prototipos y entornos de staging.
- Evaluacion de alineacion y factualidad: al heredar el post-entrenamiento de Arete-27B, es util para comparar el comportamiento de un modelo alineado en precision frente a su version BF16 y frente a Qwen3.8-27B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de fidelidad de la cuantizacion y de la cabeza MTP:

| Metrica | Valor reportado |
|---|---|
| Acuerdo de borrador MTP aislado | 96,5 % |
| Acuerdo de borrador MTP extremo a extremo | 88,7 % |
| Coincidencia top-1 en vision (aislada) | 98,3 % |
| Reduccion de tamano frente a BF16 | 3,3x (52,80 GiB a 16,14 GiB) |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 16,14 GiB solo de pesos; con cache KV y contexto largo se recomienda un margen de varios GiB adicionales.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para warp34; A100, H100 o L40S para vLLM en produccion.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 de 24 GB; en tarjetas de 16 GB no cabe con contexto util.
- Opciones de despliegue: warp34 (`warp34 serve nchapman/Arete-27B-W4A16-HGPTQ`), vLLM 0.34 o superior con `--trust-remote-code`, y transformers con `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa MTP deberia mejorar el throughput respecto a la release sin MTP, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-W4A16-HGPTQ | 29,1 mil millones | No disponible | W4A16 GPTQ + MTP | Apache 2.0 | Hugging Face, 779 descargas |
| NousResearch/Arete-27B (BF16) | 29,1 mil millones | No disponible | BF16 (52,80 GiB) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-W4A16-HGPTQ (nchapman) | 27 mil millones (nominal) | No disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (BF16) | 27 mil millones (nominal) | No disponible | BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes citadas en la model card; no se dispone de datos de rendimiento comparado entre ellas en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion W4A16 introduce degradacion respecto a BF16; aunque la model card reporta alta fidelidad, no se ofrecen benchmarks de tareas que la cuantifiquen.
- La cabeza MTP es injertada y calibrada, no entrenada de origen; su acuerdo de borrador extremo a extremo es del 88,7 %, no del 100 %.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el enfoque en precision factual de Arete-27B no lo elimina.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Longitud de contexto maxima: no disponible, lo que dificulta planificar despliegues con documentos muy largos.
- Requiere `trust_remote_code` por el codigo personalizado de la arquitectura qwen3_5, lo que implica ejecutar codigo del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8-27B.

## Enlaces
- Hugging Face: https://huggingface.co/nchapman/Arete-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante base de 27B cuantizada por el mismo autor: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Repositorio warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (enlazado desde la model card del repositorio)
