# mradermacher/gemma-4-E2B-it-Uncensored-MAX-GGUF

## Resumen

`mradermacher/gemma-4-E2B-it-Uncensored-MAX-GGUF` es una distribucion de cuantizaciones GGUF estaticas del modelo `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`, una variante de la familia Gemma 4 con la alineacion de seguridad modificada (abliterated / refusal-ablated). El autor de las cuantizaciones es mradermacher, un conocido publicador de quants GGUF para llama.cpp y ecosistemas compatibles. El modelo original parte de una base Gemma 4 de tipo E2B (aproximadamente 4.650 millones de parametros totales segun los pesos safetensors del repo), afinada para instrucciones y posteriormente modificada para eliminar los mecanismos de rechazo.

El interes practico de esta publicacion es doble: por un lado, ofrece el modelo en formatos ligeros (desde 3,1 GB en Q2_K hasta 9,4 GB en f16) ejecutables en hardware de consumo; por otro, incluye un componente multimodal (`mmproj`) en Q8_0 y f16, lo que indica soporte de entrada de imagen ademas de texto. La licencia declarada es Apache 2.0 y el unico idioma documentado es el ingles.

La relevancia actual radica en la comunidad de modelos "sin censura", que busca pesos con la capa de rechazo atenuada para tareas de investigacion sobre alineacion, red teaming y generacion creativa sin filtros. Conviene advertir que la model card no documenta contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer; detalles no documentados) |
| Parametros totales | 4.647.450.147 (4,65 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo GGUF); pesos originales en bf16/safetensors en el modelo base |
| Tamano del repo | 49,6 GB (incluye todas las cuantizaciones) |
| Cuantizaciones i1 (imatrix) | disponibles en repo separado `mradermacher/gemma-4-E2B-it-Uncensored-MAX-i1-GGUF` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo pertenece a la familia Gemma 4 en su variante E2B, con 4.647.450.147 parametros totales segun los tensores safetensors del modelo base. Los tags indican `bf16` como precision de los pesos originales y `reasoning` y `agent` como capacidades declaradas, lo que sugiere un modelo afinado para instrucciones con soporte de razonamiento y uso como agente. El componente `mmproj` confirma una torre multimodal para entrada de imagen.

El proceso de entrenamiento especifico no esta documentado en la model card. Se sabe que el modelo base es `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`, una modificacion de alineacion (tags `uncensored`, `abliterated`, `refusal-ablated`, `alignment-modified`) que elimina o atenua los rechazos del modelo instruct original. El dataset referenciado es `prithivMLmods/harm_bench`, presumiblemente empleado para evaluar o guiar la ablacion de rechazos. No se detallan volumen de tokens, composicion del corpus, ni si hubo RLHF, DPO o tecnicas de ablacion de direcciones de activacion.

## Capacidades

- Generacion de texto conversacional en ingles con formato instruct.
- Razonamiento multi-paso (tag `reasoning`).
- Uso como agente (tag `agent`), presumiblemente con soporte de tool calling, aunque no se documenta el formato exacto.
- Entrada multimodal de imagen gracias al proyector `mmproj` incluido en el repo (Q8_0 y f16).
- Generacion sin rechazos ante peticiones que el modelo base filtraria (abliterated / refusal-ablated).
- Compatibilidad con `text-generation-inference` y `vllm` segun los tags, ademas de llama.cpp por el formato GGUF.
- No se documenta soporte de audio ni de otros idiomas distintos del ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde una variante abliterated frente a la original en tareas de red teaming, comparando tasas de rechazo y contenido generado con `harm_bench` u otros conjuntos de evaluacion.
- Generacion creativa sin filtros: escritura de ficcion con tematicas adultas, violencia o humor negro donde los filtros del modelo instruct resultan limitantes, ejecutable localmente en una GPU de consumo con Q4_K_M (3,5 GB).
- Prototipado rapido en local: con cuantizaciones Q4_K_S o Q4_K_M (3,5 GB) se puede desplegar en una RTX 3060 de 12 GB o incluso en CPU via llama.cpp, ideal para pruebas de concepto sin infraestructura cloud.
- Analisis de imagenes en entornos con requisitos de privacidad: el `mmproj` permite procesar capturas o documentos escaneados localmente sin enviar datos a APIs externas.
- Evaluacion comparativa de cuantizaciones: el repo ofrece 12 variantes de cuantizacion mas dos proyectores multimodales, lo que facilita estudios de degradacion de calidad frente a tamano (Q2_K a f16).
- Despliegue en pipelines de agentes experimentales: los tags `agent` y `reasoning` sugieren uso en cadenas de razonamiento multi-paso, aunque la ausencia de documentacion sobre tool calling obliga a validar el comportamiento antes de produccion.
- Fine-tuning posterior: al estar bajo Apache 2.0 y con pesos bf16 disponibles en el modelo base, se puede reentrenar para dominios especificos sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de tasa de rechazo, y el dataset `harm_bench` solo aparece referenciado sin resultados asociados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~3,2-3,4 GB
  - Q4_K_S / Q4_K_M: ~3,5 GB
  - Q5_K_S / Q5_K_M: ~3,7 GB
  - Q6_K: ~3,9 GB
  - Q8_0: ~5,1 GB
  - f16: ~9,4 GB
  - Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,1 GB (f16)
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas y contextos largos. En el extremo profesional, A100 o H100 no son necesarias para un modelo de 4,65 B, pero permiten mayor throughput en batch.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas para cuantizaciones Q4-Q5; las Q2-Q3 pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-inference y vLLM (segun tags, aunque vLLM suele requerir pesos no GGUF o conversion), y servidores compatibles con la API de OpenAI (`endpoints_compatible`).
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo denso de ~4,65 B en Q4_K_M, se espera decodificacion interactiva (>30 tok/s) en GPU de gama media-alta, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. La siguiente tabla compara caracteristicas estructurales con alternativas plausibles de la misma categoria (modelos pequenos instruct, algunos con variantes sin censura):

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-Uncensored-MAX (este) | 4,65 B | no disponible | Apache 2.0 | Si (mmproj) | Abliterated, solo ingles |
| Gemma 2 2B-it | 2,6 B | 8K | Gemma Terms | No | Oficial, con filtros |
| Llama 3.2 3B Instruct | 3,2 B | 128K | Llama 3.2 Community | Si (variante 11B) | Oficial, multilingue |
| Qwen2.5 3B Instruct | 3,1 B | 32K | Apache 2.0 | No | Multilingue, muy extendido |

La comparacion de rendimiento real no esta disponible porque no se han publicado benchmarks del modelo analizado.

## Limitaciones y advertencias

- La ablacion de rechazos elimina barreras de seguridad: el modelo puede generar contenido danino, ilegal o explicitamente nocivo sin filtros. No es apto para aplicaciones orientadas al publico general sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: es un modelo de ~4,65 B, con capacidad limitada de conocimiento factual y propenso a inventar datos, especialmente en tareas de razonamiento complejo.
- Solo ingles documentado: el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar que la cadena de modelos base (Gemma) no imponga terminos adicionales; Gemma originalmente usa los Gemma Terms of Use, por lo que la relicencia a Apache 2.0 por parte de terceros es un punto a auditar antes de uso comercial.
- Ausencia de documentacion sobre tool calling: los tags `agent` y `reasoning` no vienen acompanados de formato de function calling, por lo que su uso en pipelines de agentes requiere validacion previa.
- El repo pesa 49,6 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Dataset `harm_bench` referenciado sin resultados: no hay evidencia publicada de la eficacia de la ablacion ni de la degradacion de capacidades generales.

## Enlaces

- Repo HuggingFace (GGUF): https://huggingface.co/mradermacher/gemma-4-E2B-it-Uncensored-MAX-GGUF
- Repo de cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/gemma-4-E2B-it-Uncensored-MAX-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/gemma-4-E2B-it-Uncensored-MAX
- Dataset referenciado: https://huggingface.co/datasets/prithivMLmods/harm_bench
- Pagina de overview del autor para este modelo: https://hf.tst.eu/model#gemma-4-E2B-it-Uncensored-MAX-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
