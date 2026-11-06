# mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-GGUF

## Resumen

`mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-GGUF` es una cuantizacion estatica en formato GGUF del modelo `grimjim/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B`, un fine-tune derivado de Gemma 3 12B instruct de Google. El autor de la cuantizacion es mradermacher, un conocido empaquetador de quants GGUF para la comunidad de inferencia local (llama.cpp, Ollama, LM Studio). El modelo base es un experimento de "ablacion acotada con rotacion ortogonal" sobre Gemma 3 12B IT, orientado a modificar el comportamiento del modelo mediante intervenciones en el espacio de pesos.

El modelo cuenta con 11.766.034.176 parametros totales (aproximadamente 11,77 mil millones), arquitectura transformer densa (no MoE) y esta pensado para generacion conversacional en ingles. La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo un fine-tune experimental de Gemma 3 12B sin necesidad de GPU de datacenter, gracias a las cuantizaciones GGUF de 4,9 GB (Q2_K) a 12,6 GB (Q8_0).

Es importante senalar que se trata de un modelo derivado de terceros, no de un modelo oficial de Google, y que la model card no documenta metodologia detallada, datos de entrenamiento ni evaluaciones. La informacion disponible es escasa y se limita a metadatos de Hugging Face y a la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Gemma 3 12B IT); detalles de la intervencion "orthogonal rotation bounded ablation" no disponibles |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B IT soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en safetensors via transformers |
| Tamano del repo | 83,9 GB (incluye todas las cuantizaciones) |
| Cuantizaciones con imatrix | disponibles en repo separado `-i1-GGUF` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruct, un transformer denso decoder-only. Sobre esa base, el autor `grimjim` aplico una intervencion denominada "orthogonal rotation bounded ablation v2", que por el nombre sugiere una ablacion de direcciones o componentes en el espacio de pesos mediante rotaciones ortogonales acotadas. No se dispone de documentacion tecnica publica en la informacion proporcionada sobre el procedimiento exacto, los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si hubo RLHF, DPO o fine-tuning supervisado.

La cuantizacion realizada por mradermacher es estatica (no imatrix en este repo; las versiones ponderadas/imatrix estan en `mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-i1-GGUF`). Incluye ficheros `mmproj` (multi-modal projection) en Q8_0 y f16, lo que indica que el modelo conserva la torre de vision del Gemma 3 original y puede procesar imagenes si el runtime lo soporta.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 12B IT.
- Procesamiento multimodal de imagenes: el repo incluye ficheros `mmproj` (Q8_0 y f16), lo que permite entrada visual en runtimes compatibles (llama.cpp con soporte multimodal).
- Razonamiento y respuesta a instrucciones (modelo "it", instruction-tuned).
- Capacidades de codigo y matematicas heredadas del modelo base (no verificadas en esta ficha).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas a ingles segun los metadatos (`language: en`), aunque el Gemma 3 base es multilingue.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU de datacenter: con la cuantizacion Q4_K_M (7,4 GB) el modelo cabe en GPUs consumer de 8-12 GB de VRAM, permitiendo prototipado offline de un fine-tune experimental de Gemma 3 12B.
- Experimentacion con intervenciones en pesos: investigadores interesados en tecnicas de ablacion y rotacion ortogonal pueden comparar este fine-tune contra el Gemma 3 12B IT original usando el mismo runtime GGUF, aislando el efecto de la intervencion.
- Analisis de imagenes en local: gracias a los ficheros `mmproj`, se puede desplegar en llama.cpp con soporte multimodal para tareas de descripcion de imagenes o extraccion de informacion visual en entornos sin conexion.
- Chat conversacional de asistencia en ingles: el modelo esta instruction-tuned y puede gestionar dialogos multi-turno, aunque el contexto efectivo debe validarse contra el modelo base.
- Evaluacion de calidad de cuantizaciones: el repo ofrece un espectro completo de Q2_K a Q8_0, util para medir la degradacion de perplexity y calidad conversacional segun el nivel de cuantizacion en un fine-tune concreto.
- Despliegue en entornos con RAM/VRAM limitada: la variante Q2_K (4,9 GB) permite ejecutar el modelo en portatiles con 8 GB de RAM via llama.cpp u Ollama, a costa de perdida de calidad.
- Base para experimentos de alineacion: al ser un fine-tune que modifica el comportamiento del modelo base, sirve como punto de partida para estudiar como las intervenciones en pesos afectan a sesgos y estilo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (segun cuantizacion, mas overhead de contexto y KV cache):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,1 GB
  - Q3_K_L: ~6,6 GB
  - IQ4_XS: ~6,7 GB
  - Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_S: ~8,3 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - mmproj (vision): ~0,7 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no necesarias para este tamano.
- Cabe en GPU consumer: si. Q4_K_M (~7,4 GB) cabe en GPUs de 8 GB con contexto moderado; Q8_0 (~12,6 GB) requiere 16 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors: transformers, vLLM o TGI (no se confirma soporte en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 11,77 B | no disponible | GGUF | gemma | Fine-tune experimental de Gemma 3 12B IT |
| google/gemma-3-12b-it | 12 B aprox. | no disponible en esta ficha | safetensors, GGUF oficiales | gemma | Modelo base oficial, instruction-tuned, multilingue |
| grimjim/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B | 11,77 B | no disponible | safetensors | gemma | Modelo fuente sin cuantizar del que deriva esta ficha |
| Mistral-Nemo-Instruct-2407 (GGUF) | 12 B | 128k (segun model card oficial) | GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva |

## Limitaciones y advertencias

- Modelo derivado de terceros: no es un modelo oficial de Google; la calidad y el comportamiento pueden diferir sustancialmente del Gemma 3 12B IT original.
- Documentacion muy escasa: no se detalla la metodologia de "orthogonal rotation bounded ablation v2", ni datos de entrenamiento, ni evaluaciones. No se recomienda su uso en produccion sin validacion propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks publicados no hay evidencia de mitigacion.
- Sesgos: no documentados; heredados potencialmente del modelo base y del proceso de fine-tune.
- Idioma: los metadatos indican solo ingles; el uso en castellano no esta garantizado ni evaluado.
- Contexto: no se confirma la longitud de contexto efectiva en esta cuantizacion; debe verificarse contra el modelo base.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones (por ejemplo, uso aceptable y atribucion). Verificar cumplimiento antes de desplegar.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la calidad conversacional; se recomienda Q4_K_M o superior para uso real.
- Riesgo de comportamiento impredecible: las intervenciones en pesos pueden producir efectos no documentados en seguridad, estilo o refusal behavior.
- Repo de 83,9 GB: descargar solo los ficheros necesarios para evitar consumo excesivo de disco.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-GGUF
- Modelo base (fuente): https://huggingface.co/grimjim/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B
- Repo de cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v2-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Gemma 3 12B IT oficial: https://huggingface.co/google/gemma-3-12b-it
