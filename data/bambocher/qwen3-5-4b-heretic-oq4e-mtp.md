# bambocher/Qwen3.5-4B-heretic-oQ4e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ4e-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint esta pensado para su uso con la libreria MLX (Apple Silicon) y emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantizacion de precision mixta con un promedio efectivo de 5,672 bits por peso. El resultado ocupa 3,3 GB en disco, lo que lo hace manejable en equipos con memoria unificada moderada.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, con aproximadamente 4.660 millones de parametros totales (4.206M en el modelo de lenguaje, 334M en el modulo de vision y 121M en una cabeza MTP). La presencia de un modulo de vision y de una cabeza MTP (multi-token prediction) sugiere capacidades multimodales y decodificacion especulativa, aunque la model card no detalla el funcionamiento de estas componentes.

La relevancia de esta publicacion es practica: ofrece un checkpoint cuantizado listo para ejecutarse en hardware Apple mediante MLX, con un equilibrio entre precision y tamano. No obstante, la informacion publicada es muy escasa (sin licencia, idiomas, benchmarks ni pipeline declarados), por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con modulo de vision y cabeza MTP; detalles no disponibles |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16; promedio efectivo 5,672 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento segun la model card:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,547 GB / 2,372 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,089 GB / 0,083 GiB |
| Total | 4,660B | 3,304 GB / 3,077 GiB |

Distribucion de precision:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 4-bit, grupo 64 | 2,886B | 61,938% | 4,50 |
| Affine 5-bit, grupo 64 | 1,391B | 29,854% | 5,50 |
| Affine 6-bit, grupo 64 | 0,034B | 0,735% | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,014% | 8,50 |
| BF16 | 0,348B | 7,459% | 16,00 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Por los metadatos y el desglose de componentes se deduce que se trata de un transformer de la familia Qwen3.5 con tres bloques diferenciados: un modelo de lenguaje de 4,206B parametros, un modulo de vision de 0,334B y una cabeza MTP de 0,121B. La cabeza MTP (multi-token prediction) es una innovacion orientada a la decodificacion especulativa, que permite predecir varios tokens por paso y acelerar la generacion, aunque no se especifica como se entrena ni como se integra en la inferencia.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre el proceso de alineacion. El sufijo "heretic" en el nombre sugiere una variante con las restricciones de alineacion relajadas (un fine-tuning de "abliteration" o similar), pero la model card no lo confirma ni detalla el procedimiento. La cuantizacion se realizo con oQ (oMLX v0.7.3), que asigna precision variable por tensor: la mayor parte de los pesos (61,9%) queda en 4 bits, un 29,9% en 5 bits y un 7,5% se mantiene en BF16, presumiblemente capas sensibles a la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 4,206B parametros soporta las capacidades estandar de la familia Qwen3.5, aunque no se detallan en la model card.
- Vision: incluye un modulo de vision de 0,334B parametros, lo que indica capacidad de procesamiento de imagenes, si bien no se especifican tareas concretas (VQA, OCR, captioning).
- Decodificacion especulativa: la cabeza MTP de 0,121B permite acelerar la generacion mediante prediccion multi-token.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado en formato MLX y ocupa 3,3 GB, por lo que puede ejecutarse en Macs con memoria unificada de 8 GB o superior usando la libreria MLX. Es adecuado para prototipado y pruebas offline sin GPU dedicada.
- Procesamiento de documentos con imagenes: el modulo de vision permite extraer informacion de capturas, graficos o formularios escaneados en un flujo local, siempre que se valide la calidad del modulo de vision, no documentada.
- Generacion de texto asistida en escritorio: integrable en aplicaciones macOS nativas mediante MLX para tareas de redaccion, resumen o reescritura, con latencia baja gracias a la decodificacion especulativa de la cabeza MTP.
- Experimentacion con cuantizacion mixta: util como referencia para estudiar el impacto de la precision variable por tensor (4/5/6/8 bits y BF16) en la calidad de salida frente al modelo original.
- Evaluacion de variantes "heretic": sirve para comparar el comportamiento de un modelo con alineacion relajada frente al Qwen3.5-4B estandar en tareas de creatividad o generacion sin filtros, asumiendo los riesgos asociados.
- Chatbot de prototipo en local: con contexto no documentado, puede emplearse para conversaciones multi-turno en entornos de desarrollo y pruebas, sin garantias para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 3,3 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB de memoria unificada para contextos cortos.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriria conversion a otro formato (por ejemplo GGUF) y no se garantiza la compatibilidad de la cabeza MTP.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la cabeza MTP sugiere una aceleracion de la decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ4e-mtp | 4,660B | No disponible | safetensors (MLX) | No disponible | Cuantizacion mixta, vision y MTP |
| Qwen3.5-4B (original) | ~4B | No disponible | safetensors | No disponible | Modelo base sin cuantizar; referencia de calidad |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva y amplio soporte de herramientas |

La comparativa con Qwen2.5-3B-Instruct es orientativa: no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa. La principal diferencia practica es el ecosistema (MLX frente a GGUF/CUDA) y la ausencia de licencia declarada en el checkpoint cuantizado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo legal relevante para produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real; no debe asumirse cobertura fuera del ingles o el chino sin validacion.
- Contexto no documentado: no se indica la longitud maxima de contexto, lo que dificulta dimensionar la cache KV y planificar aplicaciones de contexto largo.
- Variante "heretic": el sufijo sugiere una relajacion de las salvaguardas de alineacion, lo que puede aumentar la probabilidad de contenido toxico, sesgado o inapropiado. Requiere moderacion adicional en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los modelos de 4B; la cuantizacion mixta puede degradar ligeramente la coherencia en tareas de razonamiento complejo.
- Compatibilidad limitada: el formato MLX restringe el uso a Apple Silicon; no hay garantia de que la cabeza MTP o el modulo de vision funcionen tras una conversion a otros formatos.
- Sin benchmarks ni validacion de calidad: no hay datos que confirmen que la cuantizacion preserva el rendimiento del modelo original.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ4e-mtp
- oQ / oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- MLX (libreria de Apple): no incluida en la informacion proporcionada
- Modelo base Qwen3.5-4B: no incluido en la informacion proporcionada
- Paper o blog del modelo base: no incluido en la informacion proporcionada
