# mradermacher/gemma-4-E4B-it-Uncensored-MAX-GGUF

## Resumen

`mradermacher/gemma-4-E4B-it-Uncensored-MAX-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `prithivMLmods/gemma-4-E4B-it-Uncensored-MAX`, un fine-tuning sin censura de la familia Gemma 4 en su variante E4B (efimera/MoE). El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, y esta pensado para ejecutar el modelo en llama.cpp y entornos compatibles con GGUF sin necesidad de GPUs de datacenter.

El modelo base declara 7.518.069.290 parametros totales en safetensors y esta etiquetado como `moe` (mixture of experts) y `agent`. La model card del repositorio no incluye informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas quedan como "no disponible". La licencia declarada es Apache 2.0 y el unico idioma soportado segun los metadatos es el ingles.

La relevancia practica de esta ficha es doble: por un lado, ofrece un conjunto amplio de cuantizaciones (desde Q2_K de 4,5 GB hasta f16 de 15,2 GB) que permiten desplegar un modelo de ~7,5B parametros en hardware de consumo; por otro, el caracter "uncensored" del fine-tuning implica que las salvaguardas habituales de alineamiento pueden estar atenuadas o eliminadas, lo que exige una evaluacion cuidadosa antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiqueta del autor; detalles no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base se presenta como un transformer con arquitectura MoE (etiqueta `moe` en los metadatos de Hugging Face), con 7.518.069.290 parametros totales. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la dimension oculta, el numero de capas ni el mecanismo de atencion empleado. Tampoco se documenta la longitud de contexto nativa del modelo base.

Respecto al entrenamiento, la model card del repositorio GGUF no aporta datos sobre el volumen de tokens, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de alineamiento aplicadas. El sufijo "Uncensored" en el nombre indica que el fine-tuning ha reducido o eliminado las capas de rechazo del modelo original, pero no se especifica la metodologia (por ejemplo, DPO con pares de preferencia, fine-tuning supervisado sobre datos sin filtrar, abliteration, etc.). Esta cuantizacion concreta es una conversion estatica (no imatrix) del checkpoint original; el autor publica una version con cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (`it` en el nombre indica instruction-tuned).
- Razonamiento de multiples pasos y uso como agente, segun la etiqueta `agent` de los metadatos.
- Soporte multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica capacidad de procesamiento de imagenes en llama.cpp cuando se cargan junto al modelo principal.
- Compatible con `text-generation-inference` y con endpoints compatibles (`endpoints_compatible` en los tags).
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- Capacidad multilingue limitada al ingles segun los metadatos del autor.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 5,4 GB, el modelo cabe en GPUs de consumo con 8 GB de VRAM, lo que permite ejecutar un modelo de ~7,5B parametros en local para prototipado y experimentacion.
- Generacion de texto creativo sin filtros: el fine-tuning "uncensored" lo hace adecuado para tareas de escritura de ficcion, guiones o narrativa donde los modelos alineados suelen rechazar contenido sensible, siempre que se apliquen las salvaguardas externas oportunas.
- Procesamiento de imagenes en local: gracias a los ficheros `mmproj`, puede usarse en llama.cpp para tareas de descripcion de imagenes, extraccion de texto en capturas o analisis visual basico, sin depender de APIs externas.
- Chatbot de asistencia tecnica en ingles: su naturaleza conversacional y el formato instruction-tuned permiten integrarlo en interfaces de chat multi-turno, aunque la ausencia de datos de contexto publicados obliga a validar empiricamente la ventana efectiva.
- Experimentacion con agentes: la etiqueta `agent` sugiere que el modelo base fue entrenado o evaluado para flujos de agente; puede usarse como planificador en pipelines de automatizacion de tareas simples, con validacion manual de las acciones.
- Investigacion sobre alineamiento y censura: util como contrapunto en estudios comparativos entre modelos alineados y no alineados, midiendo diferencias en tasas de rechazo, sesgo y utilidad.
- Fine-tuning posterior: al estar bajo Apache 2.0 y disponible en GGUF, sirve como punto de partida para LoRA o QLoRA en dominios especializados, aunque para ello conviene partir del checkpoint en safetensors y no del GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,5 GB
  - Q4_K_M: ~5,4 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - mmproj adicional: ~0,7 GB (Q8_0) o ~1,1 GB (f16) si se usa vision
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M con contexto amplio; RTX 4090 24 GB para Q6_K/Q8_0 con margen; A100 40 GB o H100 80 GB para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con Q2_K/Q3_K_S y desde 12 GB con Q4_K_M en adelante.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-inference (para el checkpoint original en safetensors), vLLM (para el checkpoint original, no para GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-Uncensored-MAX (este) | 7,5B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tuning sin censura, multimodal via mmproj |
| Gemma 3 4B IT (referencia de familia) | ~4B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Modelo alineado de referencia; comparacion cualitativa |
| Mistral 7B Instruct | ~7,2B | 32k en versiones recientes | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar, ampliamente cuantizada |
| Qwen2.5 7B Instruct | ~7,6B | 128k en versiones recientes | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Alternativa densa con mejor soporte multilingue declarado |

Nota: los datos de los modelos comparativos son orientativos y no se han verificado contra sus model cards en esta ficha; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- El fine-tuning "Uncensored" puede eliminar o atenuar las capas de rechazo del modelo original, incrementando el riesgo de generar contenido danino, ofensivo o ilegal si no se aplican filtros externos.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual del modelo.
- Idioma limitado al ingles segun los metadatos; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base es un fine-tuning de Gemma; conviene verificar que la licencia del modelo original (Gemma license) sea compatible con el uso comercial previsto antes de desplegarlo en produccion.
- No se documenta soporte de tool calling ni function calling; la etiqueta `agent` no garantiza un formato especifico de llamadas a herramientas.
- El repositorio GGUF no incluye informacion sobre sesgos demograficos, toxicológicos ni evaluaciones de seguridad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; el autor recomienda Q4_K_S o superior para uso general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-E4B-it-Uncensored-MAX-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/gemma-4-E4B-it-Uncensored-MAX
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/gemma-4-E4B-it-Uncensored-MAX-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-Uncensored-MAX-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
