# mradermacher/Qwen3.8-27B-antislop-GGUF

## Resumen

Qwen3.8-27B-antislop es un modelo de lenguaje de gran tamano derivado de la familia Qwen3.5, ajustado por AlexWortega mediante tecnicas de RL (GRPO) para reducir el denominado "slop" en la generacion de texto creativo. La version aqui descrita es la cuantizacion estatica en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones de modelos open source. El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) y esta pensado para tareas de escritura creativa, conversacion y generacion de texto en ingles y ruso.

El modelo base es AlexWortega/Qwen3.8-27B-antislop, que a su vez parte de la arquitectura Qwen3.5 (tag `qwen3_5`). El ajuste "antislop" busca mitigar patrones repetitivos, formulas vacias y cliches tipicos en la prosa generada por LLM, un problema habitual en tareas creativas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta ficha se centra en la version GGUF, que incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0) y ficheros mmproj multimodales, lo que sugiere capacidades de vision. El repositorio ocupa 187,9 GB en total y acumula 1051 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base AlexWortega/Qwen3.8-27B-antislop se construye sobre la arquitectura Qwen3.5, un transformer decoder-only de aproximadamente 27B parametros. El ajuste especifico se realizo con GRPO (Group Relative Policy Optimization) y aparece etiquetado con `rl-xar`, `antislop` y `unslop`, lo que indica un entrenamiento de refuerzo orientado a penalizar la prosa generica y los patrones repetitivos en tareas de escritura creativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

La version publicada por mradermacher es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) del modelo base. Incluye ficheros `mmproj` (multi-modal projection) en Q8_0 y f16, lo que indica que el modelo base incorpora algun modulo de vision, aunque la model card no detalla su funcionamiento. Tambien existe una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Qwen3.8-27B-antislop-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis en reducir cliches y prosa repetitiva gracias al ajuste antislop.
- Escritura creativa: narrativa, ficcion y generacion de prosa de estilo mas natural.
- Capacidades multimodales: la presencia de ficheros `mmproj` sugiere soporte de entrada de imagenes (vision), aunque no se detalla en la model card.
- Conversacion multi-turno (tag `conversational`).
- Soporte multilingue limitado a ingles y ruso.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa asistida: el ajuste antislop esta disenado para generar prosa menos formulaica, por lo que encaja en herramientas de redaccion de ficcion, relatos y guiones donde se busca evitar cliches.
- Generacion de contenido editorial en ingles y ruso: el modelo cubre ambos idiomas de forma nativa, util para redaccion bilingue de articulos, newsletters o descripciones de producto.
- Chat conversacional de dominio general: su naturaleza conversacional permite desplegarlo como asistente en aplicaciones de mensajeria o portales web con contexto multi-turno.
- Prototipado local en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (15,7 y 16,6 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, ideal para desarrollo y pruebas sin infraestructura cloud.
- Analisis de imagenes con descripcion textual: los ficheros mmproj habilitan flujos de vision-lenguaje en llama.cpp, utiles para generar descripciones o resumenes de imagenes.
- Fine-tuning posterior o destilacion: al estar bajo Apache 2.0 y en formato GGUF/safetensors, puede servir como base para ajustes especificos de dominio o para generar variantes cuantizadas adicionales.
- Investigacion en tecnicas antislop: util para estudiar el efecto de GRPO sobre la diversidad lexica y la reduccion de repeticiones en modelos de ~27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~10,8 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~14,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj (vision): ~0,7 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: para Q4_K_M y superiores, RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q8_0, A100 40 GB, H100 o RTX A6000 (48 GB). Para cuantizaciones Q2-Q3 puede bastar una GPU de 16 GB (RTX 4080, RTX 4070 Ti Super).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se convierte.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-antislop (este) | ~27B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste GRPO antislop, en/ru, vision via mmproj |
| Qwen3.5 base (familia) | ~27B (segun tag) | no disponible | Apache 2.0 (presumible) | safetensors | Modelo de partida sin ajuste antislop |
| Mistral Small 3 (24B) | 24B | 32K (segun version) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar |
| Gemma 3 27B | 27B | 128K | Gemma license | safetensors, GGUF | Multilingue amplio, vision nativa |

Nota: los datos de Mistral Small 3 y Gemma 3 se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a ingles y ruso; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los LLM de ~27B, especialmente en tareas factuales sin recuperacion aumentada.
- El ajuste antislop puede reducir la diversidad estilistica en algunos contextos o favorecer ciertos registros sobre otros; no hay evaluaciones publicadas que lo cuantifiquen.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar ventanas largas en produccion.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad; se recomienda auditoria previa a despliegues sensibles.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Qwen3.5 subyacente, ya que la cadena de derivacion incluye varios autores.
- El soporte multimodal depende de los ficheros mmproj y del runtime (llama.cpp); no todos los servidores GGUF lo soportan.
- El modelo esta etiquetado como creativo/conversacional; su fiabilidad en tareas de codigo, matematicas o agentes no esta verificada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-GGUF
- Modelo base: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.8-27B-antislop-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
