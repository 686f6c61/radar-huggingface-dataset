# mradermacher/Qwen3-VL-4B-Instruct-abliterated-v1-GGUF

## Resumen

Qwen3-VL-4B-Instruct-abliterated-v1-GGUF es la distribucion en formato GGUF del modelo multimodal Qwen3-VL-4B-Instruct, publicado originalmente por el equipo Qwen de Alibaba, y posteriormente sometido a un proceso de "abliteration" por prithivMLmods para eliminar los rechazos aprendidos mediante RLHF. mradermacher se encarga de generar las cuantizaciones estaticas listas para su uso con llama.cpp y ecosistemas compatibles.

El modelo parte de una arquitectura transformer multimodal de aproximadamente 4.022 millones de parametros (4B), capaz de procesar texto e imagenes, disenado para tareas de instruccion, razonamiento y agentes. La version abliterated mantiene las capacidades del modelo original pero reduce las negativas a responder ciertas peticiones, lo que puede ser util en entornos de investigacion o generacion creativa sin restricciones.

Su relevancia actual radica en que ofrece capacidades de vision-lenguaje en un tamano que cabe en GPUs de consumo, con multiples niveles de cuantizacion (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB) y licencia Apache 2.0, lo que facilita su despliegue local y su integracion en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Qwen3-VL |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el codificador visual) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Instruct, un transformer multimodal que combina un codificador visual con un decoder de lenguaje, permitiendo entrada conjunta de imagenes y texto. La variante abliterated de prithivMLmods aplica tecnicas de abliteration sobre los pesos para eliminar direcciones de activacion asociadas a rechazos, manteniendo el resto de capacidades del modelo original. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en la model card proporcionada.

La distribucion de mradermacher incluye cuantizaciones estaticas generadas con llama.cpp, con ficheros mmproj independientes (Q8_0 y f16) para el proyector multimodal, lo que permite usar el modelo tanto en modo texto como en modo vision. Tambien existe una variante con cuantizaciones ponderadas/imatrix en un repositorio separado. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles.
- Procesamiento de imagenes (vision-lenguaje) mediante los ficheros mmproj.
- Razonamiento multi-step y uso como agente (tag "agent" en el repositorio).
- Soporte de tool calling / function calling heredado del modelo Qwen3-VL-Instruct (no verificado en la model card).
- Capacidades multilingues limitadas: la model card solo declara ingles.
- Modo "abliterated": menor tendencia a rechazar peticiones, orientado a investigacion y generacion sin filtros.
- Compatible con endpoints (tag "endpoints_compatible") y con text-generation-inference.

## Casos de uso

- Asistente local multimodal: desplegar el modelo en una estacion de trabajo con GPU de consumo para responder preguntas sobre imagenes y texto sin depender de la nube, gracias a las cuantizaciones Q4_K_M de 2,6 GB.
- Investigacion sobre alineacion y seguridad: estudiar el efecto de la abliteration comparando respuestas con el modelo original Qwen3-VL-4B-Instruct en tareas sensibles.
- Generacion creativa sin restricciones: redaccion de ficcion, guiones o contenido divergente donde los rechazos del modelo alineado resultan limitantes.
- Prototipado de agentes: usar el tag "agent" y la compatibilidad con endpoints para construir pipelines de razonamiento multi-paso en entornos de desarrollo.
- Analisis de documentos con imagenes: extraer informacion de capturas, diagramas o formularios combinando el codificador visual con el decoder de lenguaje.
- Despliegue en CPU o hardware modesto: las cuantizaciones Q2_K (1,8 GB) y Q3_K_S (2,0 GB) permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp.
- Evaluacion de cuantizaciones: comparar calidad entre Q4_K_M, Q6_K y Q8_0 para determinar el equilibrio optimo en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_S: ~2,0 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
  - Anadir ~0,6 GB (mmproj Q8_0) o ~0,9 GB (mmproj f16) si se usa vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100. Cualquier GPU con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4-Q8.
- Cabe en GPU de consumo: si, desde GPUs de 4 GB (Q2_K) hasta 12 GB (f16 con vision).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun tags), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-abliterated-v1-GGUF (este) | ~4B | no disponible | si | Apache 2.0 | GGUF |
| Qwen3-VL-4B-Instruct (original) | ~4B | no disponible | si | Apache 2.0 | safetensors |
| prithivMLmods/Qwen3-VL-4B-Instruct-abliterated-v1 (base) | ~4B | no disponible | si | Apache 2.0 | safetensors |
| mradermacher/Qwen3-VL-4B-Instruct-abliterated-v1-i1-GGUF | ~4B | no disponible | si | Apache 2.0 | GGUF (imatrix) |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- La abliteration elimina rechazos de seguridad, lo que puede producir contenido ofensivo, sesgado o inapropiado; no es adecuado para aplicaciones comerciales orientadas al usuario final sin filtros adicionales.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada; conviene verificar el valor real en el config del modelo original antes de disenar aplicaciones con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated en produccion.
- El proceso de abliteration puede degradar ligeramente capacidades de instruccion o coherencia en comparacion con el modelo original alineado.
- La cuantizacion Q2_K y Q3_K_S reducen notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo es una cuantizacion estatica; para mayor calidad en tareas exigentes puede preferirse la variante imatrix del repositorio i1-GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-abliterated-v1-GGUF
- Modelo base (abliterated): https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-abliterated-v1
- Variante imatrix: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-abliterated-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-Instruct-abliterated-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
