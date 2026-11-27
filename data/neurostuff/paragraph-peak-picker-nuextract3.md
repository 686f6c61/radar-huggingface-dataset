# neurostuff/paragraph-peak-picker-nuextract3

## Resumen

paragraph-peak-picker-nuextract3 es un ajuste fino (fine-tune) del modelo NuExtract3 de Numind, desarrollado por neurostuff para una tarea muy concreta dentro del ambito de la neuroimagen: extraer coordenadas cerebrales y sus estadisticos a partir de la prosa de articulos cientificos. El modelo lee pasajes como "activation in the left amygdala (x = -22, y = -4, z = -18), Z = 4.1" y los convierte en analisis estructurados, indicando que coordenadas pertenecen a que contraste, con su estadistico, tamano de cluster y espacio estereotactico.

Se trata de un modelo de 4.539.265.536 parametros (aproximadamente 4,5 mil millones) con arquitectura derivada de Qwen3.5, segun los tags del repositorio, y con soporte de entrada imagen-texto. El modelo base es numind/NuExtract3 (revision c99dc8f5641b866aa0192b6ea78f84bf9f3535f1), y este fine-tune se publica bajo licencia Apache 2.0. Su relevancia radica en que automatiza una fase tediosa y propensa a errores de las meta-analisis de neuroimagen: la extraccion manual de coordenadas desde el texto de los articulos.

El modelo forma parte de un pipeline mayor llamado ns-pond, donde se combina con un modelo hermano para tablas (neurostuff/table-peak-plucker-nuextract3) y con etapas de deteccion de pasajes y resolucion de coordenadas. Esta pensado para inferencia con vLLM y salidas JSON constrenidas por esquema, lo que lo hace adecuado para produccion en flujos de ingestion de literatura cientifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (tag `qwen3_5`), con capas Mamba entrenadas directamente; base NuExtract3 |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el material de entrenamiento son pasajes de articulos cientificos, presumiblemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, no adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de NuExtract3, un modelo de extraccion de informacion estructurada con arquitectura basada en Qwen3.5. Segun la model card, el ajuste incorpora tensores de capas Mamba que el entrenamiento LoRA no puede tocar, por lo que se publican pesos fusionados (merged weights) en lugar de un adaptador; cargar solo el adaptador produciria resultados silenciosamente incorrectos. El entrenamiento LoRA uso rangos de 16 para los mixers de atencion lineal, 32 para la atencion y 12 para los MLP, con learning rate 1e-4 y batch global de 33 sobre 3 GPU A100.

El conjunto de entrenamiento consta de 15.259 pasajes (sha256 c6b680f0...), de los cuales el 44% son reales. Los pasajes reales son borradores generados por modelo y auditados contra las reglas de anotacion por Claude Sonnet, verificando que cada coordenada, valor y tamano de cluster aparezca impreso en el pasaje. Incluyen 3.500 pasajes seleccionados para casos dificiles: resultados nulos, tests post hoc, semillas, conjunciones, correlaciones con signo, covariables y unidades. Los pesos publicados corresponden al paso 700 de un entrenamiento planificado a 2 epocas (924 pasos), elegido como el mejor entre los pasos 300 y 924 sobre los conjuntos de test. Los datos de entrenamiento no se publican porque los pasajes provienen de articulos cientificos.

## Capacidades

- Extraccion de informacion estructurada: convierte prosa cientifica de neuroimagen en analisis estructurados con coordenadas (x, y, z), estadisticos, tamanos de cluster y espacio estereotactico.
- Manejo de resultados nulos: conserva analisis que el pasaje declara sin hallazgos significativos ("the reverse contrast showed no significant clusters") sin puntos asociados.
- Analisis de semillas: registra el centro de una semilla como su propio analisis, nombrado "Seed: <nombre>".
- Coordenadas compartidas: lista una coordenada reportada para varios resultados (por ejemplo, un test F y sus post hoc) bajo cada uno.
- Uso de contexto: aprovecha el contexto anterior y posterior al pasaje para nombrar correctamente los analisis.
- Salida JSON constrenida por esquema (template.json), compatible con structured_outputs de vLLM.
- Decodificacion greedy recomendada para reproducibilidad.
- Entrada multimodal imagen-texto segun el pipeline declarado (image-text-to-text), aunque la tarea documentada es de texto.
- No se documentan capacidades de tool calling, agentes, vision general o audio.

## Casos de uso

- Extraccion automatizada de coordenadas en meta-analisis de neuroimagen: el modelo lee cada pasaje de resultados y devuelve los picos con su contraste, estadistico y cluster, reduciendo el trabajo manual de revision de cientos de articulos.
- Construccion de bases de datos de coordenadas cerebrales: integrado en el pipeline ns-pond, alimenta un repositorio estructurado de picos de activacion para su consulta y reutilizacion por la comunidad.
- Ingesta de literatura en flujos de investigacion: combinado con la etapa de deteccion de pasajes, permite procesar articulos completos y separar los resultados impresos en prosa de los que aparecen en tablas (con el modelo hermano table-peak-plucker).
- Auditoria de extracciones previas: al devolver JSON estructurado y constrenido por esquema, facilita comparar y validar coordenadas ya extraidas manualmente.
- Analisis de resultados nulos y post hoc: su entrenamiento especifico en casos dificiles permite capturar contrastes sin hallazgos y tests post hoc que otros extractores pierden.
- Normalizacion de unidades y espacios: el modelo distingue tamanos de cluster en voxels o mm³ y descarta coordenadas de elementos no cerebrales (tamanos de voxel, rejillas de docking).
- Procesamiento por lotes con vLLM: al servirse con salidas constrenidas, puede desplegarse para procesar grandes volumenes de pasajes con latencia controlada.

## Benchmarks y rendimiento

Resultados de la model card sobre conjuntos retenidos, decodificacion greedy y salida constrenida por esquema. Los puntos se comparan con redondeo de xyz; un analisis coincide cuando comparte al menos la mitad de sus puntos.

| Conjunto | Metrica | v2 (nu-prose-norole) | v3 |
|---|---|---|---|
| Gold (78 pasajes) | puntos encontrados / analisis coincidentes | 98,7% / 88,8% | 100% / 91,4% |
| NMB (111 pasajes) | puntos / analisis | 98,2% / 89,9% | 97,7% / 92,3% |
| Resultados nulos nombrados (de 39) | conservados | 0 | 32 |
| Analisis `Seed:` (de 15) | conservados | 0 | 14 |
| Sintetico dificil (200) | puntos / analisis | 96,1% / 94,2% | 100% / 100% |

La precision es del 97-100% en ambos modelos. En el conjunto sintetico dificil, v2 obtiene el 69% de los puntos de tests F y post hoc frente al 100% de v3. Las claves de respuesta de gold y NMB fueron reauditadas bajo las reglas de v3, por lo que v2 no puede puntuar en resultados nulos ni nombres `Seed:` en esos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,5 B parametros, en fp16 se requieren aproximadamente 9 GB de pesos mas memoria para KV cache y overhead; en cuantizacion de 8 bits rondaria 5-6 GB y en 4 bits unos 3-4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: el autor entreno con 3 GPU A100; para inferencia, una A100 o H100 ofrece margen amplio, y una RTX 4090 (24 GB) es suficiente para fp16.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB en fp16 (RTX 3090, 4090, 4080) y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: vLLM es el recomendado por el autor, con structured_outputs para constrenir la salida al esquema JSON. Tambien es compatible con transformers (AutoModelForCausalLM) y, previsiblemente, con llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paragraph-peak-picker-nuextract3 (este) | 4,5 B | no disponible | Extraccion de coordenadas en prosa de neuroimagen | Apache 2.0 | Hugging Face |
| numind/NuExtract3 (base) | no disponible en la informacion | no disponible | Extraccion de informacion estructurada generica | Apache 2.0 (segun el fine-tune) | Hugging Face |
| neurostuff/table-peak-plucker-nuextract3 | no disponible | no disponible | Extraccion de coordenadas desde tablas de resultados | Apache 2.0 (presumible, mismo autor) | Hugging Face |
| v2 (nu-prose-norole) | no disponible | no disponible | Version anterior del mismo fine-tune | no disponible | Referenciado en la model card |

## Limitaciones y advertencias

- Las claves de respuesta (answer keys) son auditorias realizadas por modelo (Claude Sonnet/Opus) verificando que cada valor aparezca en el pasaje, no etiquetas manuales humanas; esto introduce un sesgo potencial en la evaluacion.
- v3 a veces anade un analisis nulo que la clave de respuesta no incluye; los revisados por los autores resultaron reales, pero puede generar falsos positivos en resultados nulos.
- Se pierde uno de los 15 analisis `Seed:` en el conjunto gold.
- El modelo esta especializado en un dominio muy concreto (prosa de neuroimagen en articulos cientificos); su rendimiento fuera de ese dominio no esta documentado.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoria independiente del sesgo.
- No se documentan los idiomas soportados; el material de entrenamiento parece limitado a articulos en ingles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NuExtract3.
- Es imprescindible cargar los pesos fusionados completos, no un adaptador LoRA, para evitar resultados incorrectos sin aviso.
- Se recomienda decodificacion greedy y salida constrenida por esquema; sin estas restricciones la calidad de la salida JSON puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurostuff/paragraph-peak-picker-nuextract3
- Modelo base NuExtract3: https://huggingface.co/numind/NuExtract3
- Modelo hermano para tablas: https://huggingface.co/neurostuff/table-peak-plucker-nuextract3
- Pipeline ns-pond: https://github.com/neurostuff/ns-pond-ingestion-workflow
- ID anterior (redirige): jdkent/nuextract3-neuro-prose
