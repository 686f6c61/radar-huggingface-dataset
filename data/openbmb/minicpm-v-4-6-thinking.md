# openbmb/MiniCPM-V-4.6-Thinking

## Resumen

MiniCPM-V 4.6 Thinking es la variante de razonamiento de cadena de pensamiento larga de MiniCPM-V 4.6, un modelo multimodal ligero desarrollado por OpenBMB, laboratorio fundado en 2022 por el NLP Lab de la Universidad de Tsinghua y ModelBest Inc. El modelo genera una traza de razonamiento explícita antes de producir la respuesta final, lo que mejora sustancialmente el rendimiento en tareas de razonamiento multimodal complejo, matemáticas y tareas intensivas en OCR, manteniendo la misma arquitectura eficiente orientada a dispositivos móviles.

Con 1.300.428.016 parámetros (1,3B), combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B y emplea una compresión mixta de tokens visuales de 4x/16x. Está diseñado para ejecutarse en dispositivos móviles (iOS, Android y HarmonyOS) y, según los datos publicados, supera en rendimiento a modelos más grandes como Gemma4-E2B-it, a la vez que ofrece una eficiencia superior a modelos como Qwen3.5-0.8B (aproximadamente 1,5 veces más throughput de tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision encoder) + Qwen3.5-0.8B (LLM) con compresion mixta de tokens visuales 4x/16x |
| Parametros totales | 1.300.428.016 (1,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se ofrecen cuantizaciones para llama.cpp, Ollama y LM Studio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 Thinking utiliza una arquitectura multimodal compuesta por un codificador visual SigLIP2 de 400M de parametros y un LLM Qwen3.5 de 0,8B parametros. El modelo emplea un mecanismo de compresion mixta de tokens visuales que permite alternar entre modos de detalle 4x (mayor fidelidad) y 16x (mayor eficiencia), con un maximo de 36 slices de imagen. A diferencia de la variante Instruct, el modo Thinking genera una cadena de razonamiento explicita antes de la respuesta final, lo que mejora el rendimiento en tareas de razonamiento complejo.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada. El modelo se distribuye como un checkpoint independiente de la variante Instruct, a diferencia de la version anterior (v4.5) donde el modo de razonamiento se activaba en tiempo de ejecucion.

## Capacidades

- Razonamiento multimodal con cadena de pensamiento larga: genera una traza de razonamiento explicita antes de la respuesta final.
- Comprension de imagenes con dos modos de detalle: 4x para detalles finos y 16x para mayor eficiencia, con hasta 36 slices de imagen.
- Comprension de video: soporta entrada de video con salida de texto.
- OCR intensivo: optimizado para tareas de reconocimiento optico de caracteres en documentos, tickets y escenas del mundo real.
- Razonamiento matematico multimodal: resolucion de problemas matematicos que requieren interpretacion visual.
- Despliegue en dispositivos moviles: adaptado para iOS, Android y HarmonyOS con codigo de adaptacion open source.

## Casos de uso

- OCR de documentos en movilidad: el modelo puede extraer y razonar sobre texto en tickets, facturas y documentos escaneados directamente en el dispositivo, sin conexion a servidores, gracias a su tamano reducido y su optimizacion para edge.
- Asistente visual en tiempo real: integrable en aplicaciones moviles para describir escenas, identificar objetos y responder preguntas sobre el entorno mediante la camara, con latencia baja gracias a la compresion 16x de tokens visuales.
- Analisis de video en el dispositivo: procesamiento de secuencias de video para extraer informacion relevante, util en aplicaciones de seguridad, inventario o documentacion automatizada.
- Educacion asistida: resolucion de problemas matematicos con razonamiento paso a paso, donde el modo Thinking permite mostrar el proceso de resolucion al estudiante, no solo el resultado final.
- Accesibilidad para personas con discapacidad visual: descripcion detallada de imagenes y escenas capturadas con el movil, con razonamiento sobre el contenido para proporcionar contexto adicional.
- Automatizacion de procesos de negocio: integracion en pipelines de procesamiento de documentos que requieren comprension visual y razonamiento, con despliegue en GPU de consumo o en la nube mediante vLLM.

## Benchmarks y rendimiento

Los resultados de benchmarks se presentan en formato grafico en la model card oficial y en el repositorio de GitHub del proyecto, pero los valores numericos especificos no estan disponibles en formato texto en la informacion proporcionada. Segun las descripciones publicadas, el modelo supera en rendimiento a Gemma4-E2B-it (2B parametros) y ofrece aproximadamente 1,5 veces mas throughput de tokens que Qwen3.5-0.8B.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6 GB en BF16, 1,3 GB en INT8 y 0,7 GB en INT4 para los 1,3B parametros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.). Tambien ejecutable en hardware de gama baja y en dispositivos moviles.
- Despliegue en dispositivo: compatible con iOS, Android y HarmonyOS con codigo de adaptacion open source.
- Opciones de despliegue: transformers (con Flash Attention 2 recomendado), vLLM (receta disponible), llama.cpp, Ollama y LM Studio.
- Video decoding: requiere torchcodec o PyAV; torchcodec puede tener problemas de compatibilidad con CUDA 12.x, en cuyo caso se recomienda PyAV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking | 1,3B | no disponible | Apache 2.0 | Razonamiento CoT, multimodal, edge |
| MiniCPM-V 4.6 Instruct | 1,3B | no disponible | Apache 2.0 | Misma arquitectura sin modo thinking |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | Menor rendimiento, ~1,5x menos throughput |
| Gemma4-E2B-it | 2B | no disponible | no disponible | Mayor tamano, menor rendimiento |

## Limitaciones y advertencias

- El modo Thinking genera una traza de razonamiento explicita, lo que aumenta la latencia por peticion en comparacion con la variante Instruct.
- Los idiomas soportados no estan especificados en la documentacion disponible; se recomienda validar el comportamiento en el idioma objetivo antes de desplegar en produccion.
- La longitud de contexto no esta documentada en la informacion proporcionada; es necesario verificar los limites reales antes de usarlo con entradas largas.
- El rendimiento en tareas de razonamiento complejo puede verse afectado por alucinaciones, especialmente en escenarios de video con multiples objetos o acciones simultaneas.
- La compatibilidad con CUDA 12.x para decoding de video requiere el uso de PyAV en lugar de torchcodec, lo que puede afectar al rendimiento.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), los datos de entrenamiento y el proceso de alineacion no estan documentados, lo que dificulta la evaluacion de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-V
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-Demo
- MiniCPM-V 4.6 (Instruct): https://huggingface.co/openbmb/MiniCPM-V-4.6
- Receta vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Articulo de Artificial Analysis: https://artificialanalysis.ai/articles/openbmb-launches-minicpm-v-4-6-1-3b-instruct
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- API publica: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
