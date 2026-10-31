# eniga/GLM-5.3-Flash-radiance-MXFP4

## Resumen

GLM-5.3-Flash-radiance-MXFP4 es una conversión cuantizada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario "eniga" en HuggingFace. No se trata de un checkpoint convencional en GGUF o safetensors, sino de un fichero `.rad` generado con la herramienta radiance, que solo puede cargarse mediante el plugin `glm5next` de radiance 1.12.0 o posterior. El modelo base es un MoE de 321B de parámetros totales con 18B activos, 288 expertos enrutados y selección top-8, al que se aplica una cuantización MXFP4 exclusivamente en los pesos de los expertos, manteniendo el resto (atención, embeddings, router, capa MTP, torre de visión) en BF16.

La relevancia de esta conversión radica en que reduce el tamaño de los pesos de los expertos a aproximadamente 170,73 GiB, permitiendo ejecutar un modelo de 321B parámetros en configuraciones de hardware relativamente accesibles: la ficha original documenta una puesta en marcha funcional con dos tarjetas gráficas de 32 GB y 128 GB de RAM de sistema, algo impensable con el modelo BF16 original. El modelo conserva la arquitectura completa del original, incluida la capa de especificación múltiple (MTP) que actúa como borrador para decodificación especulativa de 3 tokens por paso, y la torre de visión (desactivable para ahorrar VRAM).

El modelo resultante se sirve mediante un servidor compatible con la API de OpenAI (radiance expone el modelo en un puerto local), lo que lo hace apto para integrarse en aplicaciones existentes mediante endpoints estándar. La licencia es MIT, tanto en la conversión como en el modelo base, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia GLM "glm5next"), con MTP, KDA, hyper-connections y torre de visión |
| Parametros totales | 321B (modelo base) |
| Parametros activos | 18B (top-8 de 288 expertos enrutados) |
| Longitud de contexto | No disponible como máximo teórico; en la configuración documentada de TP2 se limita a 16.384 tokens por restricciones de memoria |
| Tipos de cuantizacion | MXFP4 (FP4 E2M1 con escala E8M0 por grupo de 32 valores, redondeo al más cercano, sin calibración) para expertos enrutados y compartidos; BF16 para el resto |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (radiance), 170,73 GiB de pesos; no es GGUF, safetensors ni exl3 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia "glm5next" de Z.ai: un transformer de tipo mixture-of-experts con 288 expertos enrutados y selección top-8 por token, además de expertos compartidos. Incorpora varios componentes técnicos destacables: una capa MTP (multi-token prediction) que se reutiliza como borrador para decodificación especulativa (3 tokens por paso), mecanismo de atención con KDA (kernel-dependent attention o mecanismo de indexado de atención latente según el plugin), hyper-connections y un indexer propio. El plugin `glm5next` de radiance ejecuta las capas lineales como GEMMs BF16 planos, lo que impide cuantizar el tronco principal en FP8 y obliga a que la caché KV (atención latente, colas del indexer y KDA) se mantenga en BF16.

En cuanto al entrenamiento del modelo base, no se dispone de datos en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta la conversión es el proceso de cuantización: los expertos se convierten con la regla `rtn` (round-to-nearest) a códigos FP4 E2M1 con una escala E8M0 por cada 32 valores, sin calibración previa. El error de cuantización medio, medido como norma de Frobenius relativa sobre los 24.854 tensores de expertos, es de 0,123, con un peor caso de 0,144 en `blk.44.ffn_down_exps.184`.

## Capacidades

- Generación de texto general (pipeline `text-generation`), servida vía API compatible con OpenAI.
- Razonamiento y matemáticas: no disponible información específica, aunque el tamaño del modelo base (321B/18B activos) sugiere capacidad de razonamiento de gama alta.
- Generación de código: no disponible información específica en la model card.
- Capacidades de visión: el modelo base incluye una torre de visión (vision tower) en BF16, pero en la configuración documentada de TP2 se desactiva (`--mm-max-patches 0`) por falta de VRAM. En configuraciones con más memoria podría utilizarse.
- Decodificación especulativa mediante la capa MTP propia del modelo (3 tokens por paso).
- Tool calling / function calling: no disponible información específica.
- Soporte de agentes y multi-step reasoning: no disponible información específica.
- Capacidades multilingües: no disponible.
- Contexto largo: el modelo base admite contextos amplios, pero la configuración mínima documentada lo limita a 16.384 tokens.

## Casos de uso

- **Servicio de inferencia local de un modelo de 321B en hardware de gama media-alta:** la conversión MXFP4 permite cargar el modelo en dos tarjetas de 32 GB con 128 GB de RAM, algo reservado normalmente a clusters de A100/H100. Ideal para desarrolladores que quieren un modelo frontera sin alquilar GPUs de datacenter.
- **API local compatible con OpenAI para aplicaciones existentes:** radiance expone el modelo en un endpoint HTTP (puerto 8000 en el ejemplo), de modo que cualquier aplicación que ya use la API de OpenAI puede redirigirse al modelo local cambiando la URL base.
- **Experimentación con cuantización MXFP4 en expertos MoE:** al mantener el tronco en BF16 y cuantizar solo los expertos, sirve como banco de pruebas para medir el impacto real de la cuantización FP4 en la calidad de salida de modelos MoE grandes.
- **Generación de texto con decodificación especulativa eficiente:** la capa MTP propia del modelo borra 3 tokens por paso, mejorando el throughput de decodificación sin necesidad de un modelo draft externo.
- **Despliegue en entornos ROCm/AMD:** la configuración de referencia se ha probado sobre tarjetas Radeon AI PRO R9700 (gfx1201), lo que lo hace especialmente relevante para quien trabaja con hardware AMD y no puede usar el ecosistema CUDA.
- **Procesamiento por lotes de bajo volumen (2 secuencias simultáneas):** la configuración mínima admite dos secuencias concurrentes con contexto de 16k, suficiente para automatizaciones personales, resumen de documentos o chatbots de uso individual.
- **Investigación sobre arquitectura glm5next:** al conservar todos los componentes (KDA, hyper-connections, indexer, MTP), permite inspeccionar y experimentar con las innovaciones arquitectónicas de la familia GLM-5.3 en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para la conversión ni mediciones comparativas con el modelo BF16 original.

Respecto al rendimiento de inferencia, la model card incluye mediciones parciales con BetterBench 0.6.0 (corpus v1.0, 20 pasadas por categoría, temperatura 0,7, caché de prefijo fría) sobre radiance 1.14.0, en dos Radeon AI PRO R9700 limitadas a 210 W con PCIe 5.0 x8, Intel Core Ultra 7 270K Plus y 128 GB DDR5-5400 (STREAM copy 68 GB/s), con TP2:

| Metrica | Valor |
|---|---|
| Decode, single stream (ponderado entre categorias) | No disponible (la tabla de resultados esta incompleta en la informacion proporcionada) |
| Tokens borrados por paso (MTP) | 3 |

## Requisitos de hardware

- **VRAM y RAM estimadas (TP2, configuración mínima):** cada rango ocupa unos 77 GiB entre VRAM y pool anclado en host (29,6 GiB de pesos en VRAM por tarjeta: tronco BF16 más unos 21 GiB de expertos; 55,8 GiB de expertos por rango en el pool anclado). Se necesitan dos tarjetas de 32 GB más 128 GB de RAM de sistema, con apenas 1,5 GiB de RAM libre. No arranca con 60 GB de RAM.
- **Configuración recomendada (TP4):** cuatro tarjetas de 32 GB, con unos 38 GiB de expertos por rango, la mayoría en VRAM. Es la configuración más rápida documentada.
- **Alternativas:** dos tarjetas de 48 GB o superiores reducen el requisito de pool en host y liberan RAM para contexto y secuencias adicionales.
- **GPUs de referencia:** Radeon AI PRO R9700 (gfx1201, ROCm), probadas en la configuración documentada. No se documentan pruebas con NVIDIA, aunque radiance en principio no limita el proveedor.
- **Restricciones de memoria clave:** la caché KV debe ser BF16 (`--kv-cache-dtype bf16`, el plugin rechaza FP8); los expertos se colocan como unidades completas (6,38 MiB por experto y rango) y deben caber en VRAM o en el pool anclado, nunca leerse desde disco en sitio.
- **Límites en la configuración mínima:** 2 secuencias simultáneas, contexto máximo de 16.384 tokens, torre de visión desactivada, caché de prefijo desactivada.
- **Despliegue:** exclusivamente mediante radiance 1.12.0 o superior (probado en 1.14.0) con el plugin `glm5next`; imagen Docker disponible en `stilldeadcode/radiance`. No funciona con llama.cpp, Ollama, vLLM ni TGI, al no ser un formato GGUF ni safetensors.
- **Latencia y throughput:** no disponibles (la tabla de resultados está incompleta en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-radiance-MXFP4 (esta conversion) | 321B | 18B | 16.384 (config. minima) | MXFP4 expertos + BF16 tronco | `.rad` | MIT |
| GLM-5.3-Flash (base, zai-org) | 321B | 18B | No disponible | BF16 | BF16 (pesos originales) | MIT |
| GLM-5.3-Flash-BF16 (fuente de la conversion) | 321B | 18B | No disponible | Sin cuantizar | BF16 | MIT |

No hay datos suficientes para comparar rendimiento ni calidad frente a otros MoE de tamaño similar (por ejemplo DeepSeek V3 o Qwen3-235B), ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- **Formato propietario de runtime:** el fichero `.rad` solo carga en radiance con el plugin `glm5next`. Es incompatible con el ecosistema estándar (llama.cpp, vLLM, Ollama, exllamav3), lo que reduce drásticamente la portabilidad y las opciones de despliegue.
- **Requisitos de memoria extremos en configuraciones pequeñas:** la configuración de dos tarjetas de 32 GB exige 128 GB de RAM pinned y funciona al límite absoluto; cualquier flag menos restrictivo provoca un fallo de "out of memory" en el arranque. Con 60 GB de RAM no arranca.
- **Contexto y concurrencia limitados en hardware mínimo:** 16.384 tokens de contexto y 2 secuencias simultáneas; sin caché de prefijo y sin capacidades de visión.
- **Pérdida de precisión en los expertos:** la cuantización MXFP4 sin calibración introduce un error medio de norma de Frobenius relativa de 0,123; no se han publicado evaluaciones que cuantifiquen el impacto de este error en la calidad de las respuestas.
- **Caché KV en BF16 obligatoria:** el plugin rechaza FP8 para la caché, lo que aumenta el consumo de VRAM por secuencia respecto a otras implementaciones.
- **Sesgos y riesgo de alucinación:** no disponible información específica; al heredar el modelo base GLM-5.3-Flash, cabe asumir los sesgos y limitaciones típicas de grandes modelos de lenguaje, no documentados aquí.
- **Idiomas soportados:** no disponible; el modelo base de Z.ai se documenta habitualmente como bilingüe (chino e inglés), pero no consta en la información proporcionada.
- **Licencia:** MIT tanto en el modelo base como en la conversión, sin restricciones para uso comercial.
- **Madurez del ecosistema:** radiance es una herramienta de terceros (alojada en Codeberg) en versiones tempranas; los requisitos y flags pueden cambiar entre versiones.

## Enlaces

- Modelo cuantizado: https://huggingface.co/eniga/GLM-5.3-Flash-radiance-MXFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fuente de la conversión (BF16): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Herramienta radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker de radiance: https://hub.docker.com/r/stilldeadcode/radiance
