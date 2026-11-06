# mradermacher/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF

## Resumen

Esta ficha describe una cuantizacion GGUF del modelo `gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic`, publicado por el usuario llmfan46 y reempaquetado por mradermacher. Se trata de una variante "abliterated" o "decensored" de un modelo de la familia Gemma 4 con 11.907.350.576 parametros (aproximadamente 12B), derivada de una version QAT (quantization-aware training) de 4 bits que fue posteriormente "des-cuantizada" a pesos de mayor precision y sometida a un proceso de ablacion de las direcciones de rechazo en el espacio de activaciones. El resultado es un modelo conversacional que conserva la arquitectura y capacidades del original pero elimina, al menos parcialmente, los mecanismos de rechazo aprendidos durante el alineamiento.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, aunque el autor de esta variante no documenta la procedencia exacta de los pesos originales ni los detalles del proceso de ablacion. La licencia declarada en el repositorio es Apache 2.0, si bien la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

Su relevancia actual reside en el interes de la comunidad por modelos locales sin restricciones de rechazo, ejecutables en hardware de consumo mediante llama.cpp u Ollama. No obstante, la informacion disponible sobre arquitectura detallada, contexto, datos de entrenamiento y benchmarks es muy limitada, por lo que esta ficha refleja unicamente lo verificable en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer decoder-only presumiblemente) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo con safetensors de origen, 11.907.350.576 parametros) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (`gemma-4-12B-it`) se infiere que se trata de un modelo de la familia Gemma 4 en su variante instruction-tuned, con aproximadamente 12.000 millones de parametros. El sufijo `qat-q4_0` indica que el modelo original fue entrenado con quantization-aware training para cuantizacion de 4 bits, y `unquantized` sugiere que esta variante revierte esa cuantizacion a pesos de mayor precision antes de aplicar el proceso de ablacion.

El proceso de "uncensoring" o "abliteration" consiste habitualmente en identificar la direccion en el espacio de activaciones que media el rechazo a ciertas peticiones y restarla de los pesos, de modo que el modelo deja de activar respuestas de negativa. El autor no documenta la metodologia concreta, el dataset utilizado ni si hubo un ajuste fino posterior. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta variante. La etiqueta `ara` en los tags podria referirse a algun metodo de ablacion, pero no se detalla.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Gemma 4 instruction-tuned.
- Razonamiento general y respuesta a instrucciones, presumiblemente con el mismo nivel que el modelo base (no verificado con benchmarks).
- Capacidades multimodales: el repositorio incluye archivos `mmproj` (multi-modal projector) en f16 y Q8_0, lo que indica soporte de entrada de imagenes mediante el pipeline multimodal de llama.cpp.
- Ausencia (o reduccion significativa) de mecanismos de rechazo ante peticiones que el modelo original rechazaria, segun los tags `uncensored`, `decensored` y `abliterated`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`), aunque el modelo base Gemma 4 podria tener capacidades multilingues no documentadas en esta variante.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a la distribucion de respuestas, comparando su comportamiento con el modelo base original en tareas controladas.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas tipicas de los modelos alineados, ejecutable localmente en hardware de consumo.
- Procesamiento de imagenes con descripcion libre: gracias a los archivos `mmproj`, puede emplearse en pipelines de vision-lenguaje para tareas de captioning o VQA donde se requiera menor filtrado de contenido.
- Desarrollo de asistentes locales en entornos aislados: al ser un GGUF de ~7,5 GB en Q4_K_M, puede desplegarse en estaciones de trabajo sin conexion para tareas de asistencia general en ingles.
- Evaluacion de robustez de filtros: util como modelo "red team" para probar la eficacia de clasificadores de contenido y guardrails en pipelines de produccion.
- Experimentacion con cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a Q4_K_M) que permite medir el impacto de la precision en la calidad de las respuestas para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q2_K, 6-7 GB para Q3_K_M, 7-8 GB para Q4_K_S y Q4_K_M (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 para despliegues con contexto largo o alto throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizaciones Q4_K_S o Q4_K_M; en 6 GB con Q3_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF (vLLM con soporte GGUF es experimental). Los archivos `mmproj` requieren builds de llama.cpp con soporte multimodal.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF | 11,9B | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Variante abliterated, solo ingles |
| llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic | 11,9B | no disponible | no disponible | safetensors | Modelo base de esta cuantizacion |
| Modelo Gemma 4 12B it original | ~12B | no disponible | licencia Gemma 4 | safetensors | Version alineada, con rechazos |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | variable | GGUF/safetensors | No verificadas en la informacion disponible |

## Limitaciones y advertencias

- El proceso de ablacion puede degradar capacidades generales del modelo (razonamiento, coherencia, instruction following) de forma no documentada; no hay benchmarks que cuantifiquen esa perdida.
- Riesgo elevado de generar contenido danino, sesgado o inexacto al haberse reducido los mecanismos de rechazo; no es apto para aplicaciones orientadas al usuario final sin guardrails externos.
- Riesgo de alucinacion inherente a los modelos de ~12B, agravado por la falta de datos de evaluacion.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Ambiguedad de licencia: el repositorio declara Apache 2.0 pero enlaza a la licencia de Gemma 4 de Google, que impone restricciones adicionales de uso comercial; conviene verificar los terminos aplicables antes de un despliegue en produccion.
- El proceso de "unquantized" a partir de pesos QAT de 4 bits implica que parte de la informacion ya se perdio en la cuantizacion original; la calidad puede ser inferior a la de un modelo entrenado en precision completa.
- No se documenta la procedencia exacta de los pesos base ni la metodologia de ablacion, lo que dificulta la reproducibilidad.
- El autor del reempaquetado (mradermacher) solo realiza la cuantizacion; no es responsable del comportamiento del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
