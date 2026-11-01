# mradermacher/SmolLM2-1.7B-Instruct-heretic-GGUF

## Resumen

SmolLM2-1.7B-Instruct-heretic es una versión "abliterated" (descensurada) de SmolLM2-1.7B-Instruct, el modelo de lenguaje ligero de Hugging Face orientado a dispositivos de borde. El modelo base original, desarrollado por Hugging Face, es un transformer decoder de 1.700 millones de parámetros entrenado para tareas conversacionales y de seguimiento de instrucciones con un coste computacional mínimo. La variante "heretic", publicada por saidutta69 y aquí cuantizada en formato GGUF por mradermacher, elimina las capas de rechazo del modelo afinado, de modo que responde a peticiones que la versión oficial declinaría por motivos de seguridad.

Este repositorio no contiene pesos originales, sino cuantizaciones estáticas en GGUF de dicho modelo derivado, con tamaños que van desde 0,8 GB (Q2_K) hasta 3,5 GB (f16). Es relevante para quienes buscan un modelo muy pequeño, ejecutable en CPU o en portátiles sin GPU dedicada, y que priorice la ausencia de filtros de rechazo sobre las garantías de seguridad del modelo original. Al tratarse de un modelo modificado por terceros, no cuenta con el respaldo ni la evaluación de Hugging Face, y su comportamiento puede ser impredecible en escenarios sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia SmolLM2, no disponible el detalle exacto de capas y atencion) |
| Parametros totales | 1.711.376.384 (~1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-1.7B-Instruct, un transformer decoder-only de Hugging Face de la familia SmolLM2, disenado para inferencia en dispositivos de borde. La variante "heretic" (etiquetada tambien como "abliterated" o "decensored") parte de saidutta69/SmolLM2-1.7B-Instruct-heretic, que aplica tecnicas de abliteracion para suprimir los rechazos aprendidos durante el afinado por instrucciones. No se dispone de detalles publicos sobre el metodo exacto de abliteracion ni sobre datos adicionales de entrenamiento en la informacion proporcionada.

Este repositorio, mantenido por mradermacher, no modifica el modelo: genera cuantizaciones estaticas en GGUF desde los pesos originales en safetensors, cubriendo un rango de 2 a 16 bits por peso aproximadamente. Existe ademas un repositorio hermano con cuantizaciones weighted/imatrix (importancia-calibradas) que suelen ofrecer mejor calidad a igual tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con seguimiento de instrucciones heredado de SmolLM2-1.7B-Instruct.
- Sin filtros de rechazo: responde a solicitudes que el modelo oficial normalmente declinaria, incluyendo tematica para roleplay sin restricciones.
- Ejecucion local en CPU o GPU modesta gracias al formato GGUF y a su tamano de ~1,7 B de parametros.
- Capacidades de razonamiento, codigo o matematicas: no se han publicado datos especificos para esta variante; heredaria en principio las del modelo base SmolLM2-1.7B-Instruct.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o multimodalidad: no disponible; es un modelo solo de texto.

## Casos de uso

- Roleplay y escritura creativa sin censura en local: el tamano de 1,7 B permite ejecutarlo en un portatil sin GPU, y la abliteracion evita los rechazos tipicos en narrativa de ficcion con contenido sensible.
- Chatbots personales offline: con la cuantizacion Q4_K_M (1,2 GB) cabe holgadamente en la memoria de cualquier ordenador moderno, apto para asistentes conversacionales en ingles que no requieran conexion.
- Experimentacion y investigacion sobre alineacion: al ser una variante abliterated reproducible de un modelo publico bien documentado, sirve para estudiar como la eliminacion de capas de rechazo afecta al comportamiento del modelo.
- Prototipado rapido en dispositivos de borde: la cuantizacion Q2_K (0,8 GB) permite desplegarlo en hardware muy limitado, como mini-PCs o SBCs, para pruebas de concepto de LLMs embebidos.
- Generacion de texto por lotes en servidores modestos: su bajo consumo de memoria permite servir multiples instancias concurrentes en una sola GPU de gama media o incluso solo con CPU.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, util como banco de pruebas para medir la degradacion de calidad frente al tamano en formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados del modelo base SmolLM2-1.7B-Instruct no son directamente extrapolables a esta variante abliterated, ya que el proceso de descensura puede degradar el rendimiento general.

## Requisitos de hardware

- VRAM / RAM estimada para inferencia: desde ~0,8 GB (Q2_K) hasta ~3,5 GB (f16); la cuantizacion recomendada Q4_K_S ocupa ~1,1 GB, a la que hay que anadir memoria para el contexto (KV cache).
- GPU recomendadas: no es necesario disponer de GPU; con cualquier GPU moderna con 2-4 GB de VRAM (por ejemplo una RTX 3060 o superior) se ejecuta con holgura. En CPU, cualquier procesador de escritorio de los ultimos anos es suficiente.
- Cabe en consumer GPUs: si, en practicamente cualquier GPU dedicada actual, e incluso en iGPUs con memoria compartida suficiente. Tambien funciona con CPU pura a velocidades usables dado el tamano del modelo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Al ser cuantizaciones estaticas, no esta pensado para vLLM o TGI con pesos originales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dada la talla de 1,7 B con cuantizacion de 4 bits, se esperan velocidades de decodificacion altas incluso en CPU, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| SmolLM2-1.7B-Instruct-heretic-GGUF (este) | 1,71 B | no disponible | Apache 2.0 | Variante abliterated, GGUF, sin rechazos |
| SmolLM2-1.7B-Instruct (original de Hugging Face) | 1,71 B | no disponible | Apache 2.0 | Modelo base con alineacion estandar |
| Qwen2.5-1.5B-Instruct | 1,54 B | ~32 K (segundo documento publico) | Qwen license (uso comercial condicionado) | Multilingue, con filtros de seguridad estandar |

Nota: la comparativa se limita a modelos de tamano similar; los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, se han eliminado deliberadamente sus salvaguardas de seguridad: puede generar contenido ofensivo, peligroso o perjudicial sin rechazarlo. No es apto para entornos de produccion orientados a usuarios finales sin capas de moderacion externas.
- La abliteracion puede degradar la calidad general, la coherencia y las capacidades de razonamiento respecto al modelo base; no hay benchmarks que cuantifiquen esta degradacion.
- Soporte de idiomas limitado al ingles; no esta disenado para castellano ni otras lenguas.
- Longitud de contexto no documentada en este repositorio; debe consultarse la ficha del modelo base antes de disenar aplicaciones con documentos largos.
- Riesgo elevado de alucinaciones tipico de modelos de 1,7 B de parametros, agravado por la ausencia de ajuste de seguridad.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero el nombre "SmolLM2" y las marcas de Hugging Face pueden estar sujetas a sus propias politicas de uso.
- Las cuantizaciones mas agresivas (Q2_K, Q3_K_S) conllevan perdida de calidad notable segun el propio autor del repositorio.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/SmolLM2-1.7B-Instruct-heretic-GGUF
- Modelo base (variante heretic): https://huggingface.co/saidutta69/SmolLM2-1.7B-Instruct-heretic
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/SmolLM2-1.7B-Instruct-heretic-i1-GGUF
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#SmolLM2-1.7B-Instruct-heretic-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo original SmolLM2-1.7B-Instruct de Hugging Face: no disponible enlace directo en la informacion proporcionada (buscable como HuggingFaceTB/SmolLM2-1.7B-Instruct)
