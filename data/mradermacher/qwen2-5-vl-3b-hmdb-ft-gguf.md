# mradermacher/Qwen2.5-VL-3B-HMDB-FT-GGUF

## Resumen

Qwen2.5-VL-3B-HMDB-FT-GGUF es una cuantizacion en formato GGUF del modelo multimodal phronetic-ai/Qwen2.5-VL-3B-HMDB-FT, un ajuste fino de Qwen2.5-VL-3B sobre el conjunto de datos HMDB (Human Motion Database). El modelo original parte de la familia Qwen2.5-VL de Alibaba, que combina un codificador visual con un modelo de lenguaje de 3.085.938.688 parametros para tareas de vision-lenguaje. Este repositorio, publicado por mradermacher, ofrece versiones cuantizadas estaticas listas para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite desplegar un modelo vision-lenguaje de ~3B parametros en hardware de consumo gracias a las cuantizaciones que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), ademas de un modulo mmproj separado para el procesamiento visual. El ajuste fino sobre HMDB sugiere una especializacion en tareas de reconocimiento de acciones humanas en video o imagen, aunque la model card no detalla la composicion exacta del dataset ni el proceso de entrenamiento.

No se dispone de informacion sobre licencia, benchmarks ni detalles de arquitectura mas alla de que es un transformer multimodal derivado de Qwen2.5-VL. El repositorio tiene 116 descargas y 0 likes, lo que indica una adopcion limitada. La fecha de creacion es el 12 de junio de 2025 y la ultima actualizacion el 12 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen2.5-VL), con codificador visual y modelo de lenguaje |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-VL-3B, un transformer multimodal de la familia Qwen2.5-VL que integra un codificador visual con un modelo de lenguaje de 3.085.938.688 parametros. El ajuste fino phronetic-ai/Qwen2.5-VL-3B-HMDB-FT se realizo presumiblemente con llama-factory (segun los tags del repositorio) sobre el dataset HMDB (Human Motion Database), orientado a reconocimiento de acciones humanas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion la realizo mradermacher mediante el proceso estandar de llama.cpp, generando cuantizaciones estaticas (sin imatrix, segun indica la model card). Se incluye un modulo mmproj separado (en Q8_0 y f16) necesario para el procesamiento de imagenes en llama.cpp. No se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen2.5-VL-3B.
- Procesamiento de vision-lenguaje: el modulo mmproj permite pasar imagenes al modelo para tareas de descripcion, respuesta a preguntas visuales y analisis de contenido grafico.
- Especializacion en reconocimiento de acciones humanas (HMDB), segun el ajuste fino del modelo base.
- Soporte multilingue limitado al ingles (unico idioma declarado en la model card).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se dispone de informacion sobre tool calling, function calling, soporte de agentes o modo thinking en la informacion proporcionada.

## Casos de uso

- Reconocimiento de acciones humanas en imagenes o video: el ajuste fino sobre HMDB permite clasificar y describir acciones como caminar, correr, saltar o saludar en fotogramas o secuencias, usando el modulo mmproj para el procesamiento visual.
- Analisis de contenido audiovisual automatizado: integracion en pipelines que necesiten etiquetar acciones en metrajes de vigilancia o deportivos, con la ventaja de que el modelo cuantizado Q4_K_M ocupa solo 2,0 GB y puede ejecutarse en GPU de consumo.
- Prototipado rapido de aplicaciones vision-lenguaje: gracias a las cuantizaciones ligeras (Q2_K de 1,4 GB), se puede desplegar en portatiles o entornos con recursos limitados para validar ideas antes de escalar a modelos mayores.
- Educacion e investigacion en vision por computador: util para experimentar con modelos multimodales de ~3B parametros en laboratorios con presupuesto de hardware reducido, usando llama.cpp.
- Asistencia en accesibilidad: descripcion de escenas o acciones en imagenes para personas con discapacidad visual, aunque limitado al ingles y a la especializacion del ajuste fino.
- Clasificacion de contenido en bases de datos de video: etiquetado automatico de clips segun la accion humana predominante, aprovechando la cuantizacion Q8_0 (3,4 GB) para mayor calidad.
- Integracion en aplicaciones de escritorio offline: al ser GGUF y ejecutable con llama.cpp, permite incorporar capacidades vision-lenguaje en aplicaciones locales sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,5 GB (Q2_K) hasta ~6,5 GB (f16), mas el modulo mmproj (~0,9 GB en Q8_0 o ~1,4 GB en f16) para tareas visuales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 4 GB de VRAM puede ejecutar cuantizaciones Q4_K_S o Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer con 4 GB o mas de VRAM para cuantizaciones Q4 y superiores; Q2_K y Q3_K pueden caber en GPUs integradas con 2 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), y cualquier herramienta compatible con GGUF y mmproj (p. ej., llama-cpp-python, LM Studio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-HMDB-FT-GGUF (este) | 3.085.938.688 | no disponible | no disponible | GGUF | Ajuste fino sobre HMDB, cuantizaciones estaticas |
| Qwen2.5-VL-3B (base) | 3.085.938.688 | no disponible | no disponible | safetensors | Modelo original sin ajuste fino |
| Qwen2.5-VL-7B | ~7B | no disponible | no disponible | safetensors, GGUF | Mayor tamano, mayor capacidad, mas VRAM |
| LLaVA-1.5-7B | ~7B | no disponible | no disponible | safetensors, GGUF | Alternativa vision-lenguaje de 7B |

Los datos de contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada; se indican como referencia generica de la familia.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido; es necesario consultar el modelo base phronetic-ai/Qwen2.5-VL-3B-HMDB-FT y la licencia de Qwen2.5-VL.
- El modelo solo declara soporte para ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de ~3B parametros, especialmente en tareas de razonamiento complejo o descripcion visual ambigua.
- El ajuste fino sobre HMDB puede haber reducido capacidades generales del modelo base (olvido catastrofico) en favor de la tarea especifica de reconocimiento de acciones.
- Las cuantizaciones estaticas (sin imatrix) pueden presentar mayor perplejidad que las cuantizaciones ponderadas; la model card indica que las versiones imatrix no estan disponibles.
- El repositorio tiene muy baja adopcion (116 descargas, 0 likes), lo que limita la validacion comunitaria y el soporte.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con entradas largas.
- El modulo mmproj es imprescindible para tareas visuales; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-HMDB-FT-GGUF
- Modelo base: https://huggingface.co/phronetic-ai/Qwen2.5-VL-3B-HMDB-FT
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen2.5-VL-3B-HMDB-FT-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
