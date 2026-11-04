# mradermacher/QUEST-4B-GGUF

## Resumen

QUEST-4B es un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) desarrollado originalmente por el laboratorio OSUNLP y distribuido en formato GGUF por mradermacher. Se trata de un modelo de generacion de texto de tipo transformer, disenado para tareas conversacionales y de generacion, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. El modelo base es `osunlp/QUEST-4B`, y esta version concreta es una cuantizacion estatica publicada para facilitar su despliegue en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio GGUF ofrece un abanico amplio de cuantizaciones (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite ejecutar el modelo en GPUs consumer con VRAM limitada o incluso en CPU mediante llama.cpp. Ademas, el repositorio incluye ficheros `mmproj` (multi-modal supplement), lo que sugiere que el modelo base incorpora capacidades multimodales, aunque la informacion disponible no detalla la naturaleza exacta de dichas capacidades.

El modelo esta etiquetado unicamente para el idioma ingles (`en`) y no se han publicado en la informacion disponible datos sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Por tanto, esta ficha se limita a los datos verificables del repositorio y del model card, marcando explicitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `osunlp/QUEST-4B` mas alla de que se trata de un transformer de 4,2 mil millones de parametros. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos (MoE) ni ninguna otra innovacion arquitectonica concreta. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es que el repositorio GGUF incluye ficheros `mmproj` (multi-modal supplement) en precisiones f16 y Q8_0, lo que indica que el modelo base incorpora algun componente multimodal (probablemente vision) que se ha preservado en la cuantizacion. Sin embargo, la model card no describe que modalidad adicional soporta ni como se integra en el pipeline. El proceso de cuantizacion es estatico (no imatrix), realizado por mradermacher, y existe una variante con cuantizaciones ponderadas por imatrix en el repositorio `mradermacher/QUEST-4B-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y la pipeline `text-generation`.
- Soporte multimodal inferido por la presencia de ficheros `mmproj` en el repositorio (la modalidad concreta no esta documentada en la informacion disponible).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con infraestructuras de inferencia estandar.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU consumer: gracias a las cuantizaciones Q4_K_S (2,7 GB) y Q4_K_M (2,8 GB), el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipado local sin infraestructura cloud.
- Generacion de texto conversacional en aplicaciones de chat en ingles: el modelo esta etiquetado como conversacional y puede integrarse en interfaces de chat multi-turno, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Procesamiento por lotes en CPU: la cuantizacion Q2_K (2,0 GB) permite ejecutar el modelo en servidores sin GPU para tareas de generacion de texto de baja latencia critica, como clasificacion o resumen de documentos cortos.
- Experimentacion multimodal: los ficheros `mmproj` permiten probar el componente multimodal del modelo base en entornos con llama.cpp, util para investigacion sobre modelos pequenos con vision.
- Fine-tuning sobre el modelo base: al estar disponible el modelo original `osunlp/QUEST-4B` en safetensors con licencia Apache 2.0, se puede ajustar y luego cuantizar siguiendo el mismo esquema para despliegue.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite medir el impacto de la precision en tareas concretas antes de elegir una para produccion.
- Integracion en pipelines de CI/CD para generacion de documentacion tecnica en ingles: el formato GGUF y la licencia permisiva facilitan el empaquetado en contenedores sin restricciones de redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 2,0 GB.
  - Q3_K_S: aproximadamente 2,2 GB.
  - IQ4_XS: aproximadamente 2,6 GB.
  - Q4_K_M: aproximadamente 2,8 GB.
  - Q5_K_M: aproximadamente 3,2 GB.
  - Q6_K: aproximadamente 3,6 GB.
  - Q8_0: aproximadamente 4,6 GB.
  - f16: aproximadamente 8,5 GB.
  - Componente multimodal adicional: 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor throughput. Cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones Q4.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M. La version f16 requiere 10-12 GB para operar con contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se documenta soporte nativo para vLLM o TGI en formato GGUF, aunque el modelo base en safetensors podria servirse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QUEST-4B (esta ficha) | 4,2 B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal (mmproj), solo ingles |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (segun documentacion publica del modelo) | Apache 2.0 | GGUF, safetensors | Multilingue, sin vision |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens (segun documentacion publica del modelo) | Llama 3.2 Community License | GGUF, safetensors | Multilingue, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens (segun documentacion publica del modelo) | MIT | GGUF, safetensors | Multilingue, sin vision |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica habitual; no se dispone de benchmarks de QUEST-4B para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Solo se documenta soporte del idioma ingles; el rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no se puede evaluar su calidad frente a alternativas de tamano similar.
- La longitud de contexto no esta documentada; en produccion debe medirse empiricamente para evitar degradacion en conversaciones largas.
- Riesgo de alucinacion inherente a modelos de 4 B de parametros, especialmente en tareas de conocimiento factual y matematicas.
- Sesgos conocidos: no documentados en la informacion disponible; deben evaluarse con conjuntos de validacion propios antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base `osunlp/QUEST-4B` debe verificarse por si tuviera terminos adicionales no reflejados en el repositorio GGUF.
- El componente multimodal (`mmproj`) esta presente pero no documentado; su funcionalidad y calidad no estan garantizadas por la model card.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene solo 234 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/QUEST-4B-GGUF
- Modelo base: https://huggingface.co/osunlp/QUEST-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/QUEST-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#QUEST-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
