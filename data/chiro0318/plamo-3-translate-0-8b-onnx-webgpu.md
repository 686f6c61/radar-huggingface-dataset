# chiro0318/plamo-3-translate-0.8b-onnx-webgpu

## Resumen

PLaMo 3 Translate 0.8B — ONNX (q4f16, WebGPU) es una conversión no oficial del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks (PFN) a formato ONNX de 4 bits, empaquetada para su ejecución en navegador mediante `onnxruntime-web` sobre WebGPU. El autor de la conversión es el usuario de Hugging Face `chiro0318`, y el artefacto se utiliza como motor del plugin de Chrome "PLaMo Translate (On-device)". El modelo base es un LLM especializado en traducción construido sobre la familia PLaMo 3, desarrollada por PFN en colaboración con el NICT (National Institute of Information and Communications Technology) de Japón.

La relevancia de esta ficha radica en que demuestra un caso práctico de inferencia de un modelo de traducción de casi 800 millones de parámetros directamente en el navegador, sin servidor ni GPU dedicada, gracias a la cuantización a 4 bits y a la aceleración WebGPU. El repositorio ocupa aproximadamente 0,5 GB, lo que lo hace viable para descarga y ejecución local en equipos de consumo.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada: la model card del autor de la conversión documenta el proceso de conversión y el formato de entrada/salida, pero no las características del modelo original. Los datos no disponibles se indican explícitamente en cada sección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3; detalles internos no disponibles) |
| Parametros totales | 0.8B (según el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MatMulNBits, bloque 32, simétrico) en capas lineales; embeddings con GatherBlockQuantized; activaciones y KV cache en fp16 |
| Idiomas soportados | ja, en, ko, zh, multilingual |
| Licencia | PLaMo Community License (uso personal y no comercial gratuito; uso comercial con registro previo en PFN y limitado a ingresos anuales ≤ 1.000 millones de yenes) |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` + `onnx/model_q4f16.onnx_data`), con `manifest.json` de tamaños y SHA-256 |

## Arquitectura y entrenamiento

La conversión se construye directamente desde los pesos safetensors del modelo original usando operadores fusionados de onnxruntime: `GroupQueryAttention` (con RoPE, KV cache y sliding window tal como en el original) y `SimplifiedLayerNormalization`. Los offsets de RMSNorm del modelo original se pliegan en los pesos de normalización. Las capas lineales se cuantizan a 4 bits con `MatMulNBits` (bloque 32, simétrico) y el embedding de tokens usa `GatherBlockQuantized`; las activaciones y la KV cache se mantienen en fp16.

La reimplementación reproduce el modelo PyTorch original con una diferencia máxima de logits de aproximadamente 3e-5 en fp32 y salida greedy idéntica. El autor indica que el modelo de 4 bits solo se ha verificado puntualmente con frases de muestra y que su calidad no se ha evaluado con benchmarks. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Traducción multilingüe entre japonés, inglés, coreano y chino, con soporte declarado de escenarios multilingües.
- Generación de texto autoregresiva con decodificación token a token (logits de la última posición únicamente).
- Inferencia con KV cache incremental (`past_key_values` / `present.*`), lo que permite conversaciones y traducciones por turnos sin recomputar el prefijo.
- Ejecución en navegador mediante `onnxruntime-web` con WebGPU o CPU como execution provider.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en el navegador sin servidor: el modelo puede integrarse en extensiones de Chrome (como el propio plugin "PLaMo Translate (On-device)") para traducir texto seleccionado en páginas web, manteniendo el contenido en el dispositivo y evitando enviar datos a un backend.
- Traducción de documentos sensibles en local: al ejecutarse íntegramente en el cliente, es adecuado para textos confidenciales (contratos, comunicaciones internas) donde no se permite el envío a APIs externas.
- Traducción japonés-coreano-chino en flujos de atención al cliente: el soporte de KV cache permite gestionar conversaciones multi-turno traduciendo cada intervención de forma incremental.
- Herramientas de productividad offline: integración en editores o clientes de correo que necesiten traducción ja/en/ko/zh sin conectividad, una vez descargado el modelo de 0,5 GB.
- Prototipado de pipelines de traducción en WebGPU: sirve como banco de pruebas para evaluar latencia y viabilidad de modelos de traducción de 0,8B cuantizados en hardware de consumo antes de invertir en infraestructura.
- Aplicaciones educativas de idiomas: generación de traducciones de referencia y ejercicios bilingües en el propio navegador del estudiante, sin coste de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica explícitamente que la calidad del modelo de 4 bits no se ha evaluado con benchmarks y que solo se ha verificado con frases de muestra.

## Requisitos de hardware

- Tamaño en disco: aproximadamente 0,5 GB (`onnx/model_q4f16.onnx` + `onnx/model_q4f16.onnx_data`).
- VRAM estimada: no disponible de forma oficial; por el tamaño del artefacto (0,5 GB) y el uso de KV cache fp16, cabe esperar un consumo en el orden de 1 GB o inferior, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Al ejecutarse vía WebGPU, depende de la implementación de WebGPU del navegador; se beneficia de GPUs integradas y dedicadas recientes, pero no hay lista oficial.
- Cabe en GPU de consumo: sí, en principio, al ser un modelo de 0,8B cuantizado a 4 bits; no se especifican modelos concretos.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o CPU execution provider) en navegador; requiere onnxruntime(-web) 1.22 o superior. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chiro0318/plamo-3-translate-0.8b-onnx-webgpu | 0.8B | no disponible | ONNX q4f16 | PLaMo Community License | Hugging Face (conversión no oficial) |
| pfnet/plamo-3-translate-0.8b (base) | 0.8B | no disponible | safetensors (original) | PLaMo Community License | Hugging Face (oficial) |
| pfnet/plamo-3-translate-8b | 8B | no disponible | no disponible | PLaMo Community License | Hugging Face (oficial) |
| RemydreScarlet/plamo-3-translate-0.8b-onnx | 0.8B | no disponible | ONNX | no disponible | Hugging Face (conversión de terceros) |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está realizada ni respaldada por Preferred Networks; el soporte y la garantía de calidad recaen en el autor de la conversión.
- Calidad del modelo de 4 bits no evaluada: solo se ha verificado con frases de muestra, por lo que puede degradarse respecto al modelo original en dominios o idiomas menos representados.
- Licencia restrictiva para uso comercial: la PLaMo Community License exige registro previo en PFN y limita el uso comercial a usuarios con ingresos anuales no superiores a 1.000 millones de yenes.
- Idiomas limitados a ja, en, ko y zh (más "multilingual" genérico); no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Longitud de contexto no documentada; el sliding window del `GroupQueryAttention` puede limitar la traducción de documentos largos.
- Riesgo de alucinación y de errores de traducción inherente a los modelos generativos, agravado por la cuantización agresiva a 4 bits.
- Dependencia de WebGPU y onnxruntime-web 1.22+: la compatibilidad depende del navegador y del hardware del usuario final.
- Sin datos publicados de sesgos, benchmarks ni evaluación de seguridad.

## Enlaces

- Hugging Face (conversión): https://huggingface.co/chiro0318/plamo-3-translate-0.8b-onnx-webgpu
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Modelo oficial de 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Conversión ONNX de terceros (RemydreScarlet): https://huggingface.co/RemydreScarlet/plamo-3-translate-0.8b-onnx
- onnxruntime-web: https://onnxruntime.ai/
