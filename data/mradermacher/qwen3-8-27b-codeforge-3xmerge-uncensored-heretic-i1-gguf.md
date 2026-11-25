# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF del merge de modelos xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic, publicada por mradermacher. Se trata de un modelo de 27.320.697.856 parametros (unos 27,3 mil millones) orientado a generacion de codigo, razonamiento y uso agentico, construido sobre la familia Qwen3.8 y sometido a un proceso de "abliteration" o decensurado (tags heretic, uncensored, decensored, abliterated) que elimina parte de las restricciones de rechazo del modelo original.

El autor del GGUF, mradermacher, es un conocido cuantizador de la comunidad que publica versiones optimizadas de modelos abiertos. En este caso ofrece cuantizaciones ponderadas con imatrix (etiquetadas i1), lo que mejora la calidad respecto a las cuantizaciones estaticas para el mismo tamano de fichero. El repositorio incluye desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), ademas del fichero imatrix para generar cuantizaciones propias.

La relevancia actual del modelo radica en su enfoque: un modelo de ~27B especializado en codigo y flujos agenticos, con licencia Apache 2.0, disponible en GGUF para ejecucion local en hardware de consumo y con la particularidad de estar decensurado. Es una opcion practica para desarrolladores que quieren desplegar un modelo de codigo en local sin depender de APIs, aceptando las implicaciones eticas y de seguridad del decensurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), derivado de un merge de modelos; no se especifica el detalle interno en la informacion disponible |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ponderadas con imatrix) |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer de la familia Qwen3.8 con aproximadamente 27,3 mil millones de parametros. El modelo base es un merge de tres variantes (3xMerge) del proyecto CodeForge, segun indica el nombre, y ha pasado por un proceso de destilacion (tag distillation) y de abliteration (tags heretic, uncensored, decensored, abliterated) que modifica el comportamiento de rechazo del modelo.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card del GGUF no aporta informacion sobre el entrenamiento del modelo base; unicamente documenta el proceso de cuantizacion. Las cuantizaciones i1 utilizan una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que segun el autor mejora la calidad frente a cuantizaciones estaticas del mismo tamano. El repositorio incluye el fichero imatrix para que otros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de codigo y completado en multiples lenguajes (el modelo esta etiquetado como coding y code-generation).
- Razonamiento y resolucion de problemas (tags reasoning, efficient-thinking).
- Uso agentico y multi-step reasoning (tag agentic).
- Tool calling y function calling (tag tool-use).
- Seguimiento de instrucciones (tag instruction-following).
- Capacidades conversacionales multi-turno (tag conversational).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Modelo decensurado: no aplica los filtros de rechazo habituales, lo que permite generar contenido que el modelo original rechazaria.
- La model card del GGUF menciona que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma en la informacion disponible que el modelo base sea multimodal.

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en editores o IDEs mediante llama.cpp u Ollama para autocompletar y generar codigo sin enviar el codigo del usuario a servicios externos, gracias a su tamano de ~27B y su cuantizacion Q4_K_M (16,9 GB) que cabe en GPUs de consumo con 24 GB de VRAM.
- Pipelines de generacion de codigo en CI/CD: con soporte de tool calling, puede invocarse desde scripts para generar tests, refactorizar o documentar codigo de forma automatizada, desplegado con vLLM o TGI en servidores con GPU.
- Agentes autonomos de desarrollo: las etiquetas agentic y tool-use indican que el modelo esta preparado para razonamiento multi-paso con llamadas a herramientas, adecuado para tareas como resolucion de issues o navegacion de repositorios.
- Generacion de codigo sin restricciones de contenido: el decensurado permite trabajar con dominios donde el modelo original rechazaria peticiones (por ejemplo, analisis de seguridad ofensiva o generacion de exploits en entornos de investigacion autorizados).
- Razonamiento tecnico y explicacion de codigo: la combinacion de capacidades de razonamiento y codigo lo hace util para revisar fragmentos complejos, explicar algoritmos o depurar errores en conversaciones multi-turno.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q2_K (11,0 GB) e i1-IQ3_XS permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM, lo que facilita prototipado local sin infraestructura dedicada.
- Fine-tuning o experimentacion con merges: al estar disponible el fichero imatrix y la licencia Apache 2.0, investigadores pueden generar cuantizaciones propias o usar el modelo como base para experimentos de decensurado y merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, aproximando el tamano del fichero mas overhead de contexto):
  - i1-Q2_K: ~11 GB
  - i1-IQ3_M / i1-Q3_K_M: ~13-14 GB
  - i1-IQ4_XS: ~15,4 GB
  - i1-Q4_K_M: ~16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM. Para cuantizaciones Q5/Q6 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB) si se quiere contexto largo sin offload.
- Cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB) y en 24 GB (RTX 3090/4090) con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI. La model card indica endpoints_compatible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Decensurado, orientado a codigo y agentes, cuantizaciones imatrix |
| Modelo base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic | ~27,3 B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; requiere mas VRAM |
| Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF (estatico de mradermacher) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Mismo modelo con cuantizaciones estaticas (sin imatrix); calidad inferior a igual tamano segun el autor |
| Otros modelos de codigo de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo decensurado (abliterated): no aplica filtros de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico. No es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo incorrecto, APIs inexistentes o explicaciones erroneas; requiere validacion en produccion.
- Idiomas limitados: la model card declara solo ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible: no se puede confirmar la ventana de contexto, lo que dificulta planificar casos de uso con documentos largos.
- El proceso de merge y abliteration puede degradar capacidades respecto al modelo original de Qwen3.8; no hay benchmarks publicados que lo confirmen.
- Licencia Apache 2.0 permite uso comercial, pero el decensurado traslada al desplegador la responsabilidad legal y etica del contenido generado.
- La model card menciona vision y ficheros mmproj, pero no se confirma que el modelo base sea multimodal; verificar antes de asumir capacidades de vision.
- El repositorio pesa 218,6 GB en total; descargar solo la cuantizacion necesaria.
- Fecha de creacion (2026-11-12) y actualizacion (2026-11-23): verificar que el modelo base no haya sido retirado o modificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
