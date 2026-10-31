# mradermacher/Omega-Arsenal-12B-GGUF

## Resumen

Omega-Arsenal-12B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ReadyArt/Omega-Arsenal-12B, realizadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de 11.907.350.576 parámetros orientado a roleplay, contenido adulto explícito (ERP), terror y violencia, sin alineamiento ("unaligned"), etiquetado explícitamente como contenido para adultos y no apto para todos los públicos.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en la utilidad del repositorio de cuantizaciones: permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros backends compatibles con GGUF, con tamaños que van desde 4,9 GB (Q2_K) hasta 12,8 GB (Q8_0). El modelo base es una variante de la familia de 12B derivada de Mistral NeMo, aunque el README no lo especifica explícitamente; el dato de parámetros (11.907.350.576) procede de los safetensors reales del repositorio.

Cabe destacar que el repositorio incluye archivos mmproj (suplemento multimodal en f16 y Q8_0), lo que sugiere que el modelo base podría tener capacidades de visión, aunque la model card no lo detalla. También existen cuantizaciones weighted/imatrix en un repositorio separado (Omega-Arsenal-12B-i1-GGUF), que suelen ofrecer mejor calidad a igual tamaño de archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder, presumiblemente basado en la familia de 12B tipo Mistral NeMo, no confirmado) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-f16, mmproj-Q8_0, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El repositorio analizado es una cuantizacion, no el modelo original, por lo que los detalles de arquitectura y entrenamiento no estan documentados en la model card. El modelo base, ReadyArt/Omega-Arsenal-12B, tiene aproximadamente 11.907 millones de parametros en formato safetensors y esta etiquetado como conversacional e instruct. Por su tamano (12B) y su orientacion a roleplay sin alineamiento, pertenece con toda probabilidad a la familia de modelos derivados de Mistral NeMo 12B, muy habitual en este nicho, aunque esto no esta confirmado en la documentacion disponible.

No hay informacion sobre el numero de tokens de entrenamiento, composicion del dataset, ni sobre el uso de tecnicas como RLHF o DPO. La innovacion tecnica principal de este repositorio no es del modelo base sino del cuantizador: se trata de cuantizaciones estaticas k-quant (Q2_K a Q8_0, mas IQ4_XS) en formato GGUF, generadas mediante conversion desde HF, con versiones imatrix disponibles por separado. La inclusion de archivos mmproj indica soporte multimodal (proyector multimodal) compatible con llama.cpp.

## Capacidades

- Generacion de texto conversacional en modo instruct.
- Roleplay y escritura creativa, con especial foco en contenido adulto explicito (ERP), terror y violencia, al estar "unaligned" (sin filtros de alineacion).
- Posible capacidad multimodal de vision, dado que el repo incluye archivos mmproj (proyector multimodal en f16 y Q8_0); la model card no lo detalla, por lo que debe verificarse con el modelo base.
- No hay informacion sobre tool calling, function calling, agentes ni razonamiento multi-step.
- Idioma principal: ingles, segun las etiquetas. No hay soporte documentado para castellano.

## Casos de uso

- Roleplay interactivo local: ejecutar sesiones de roleplay de larga duracion en un PC de consumo con llama.cpp u Ollama, usando cuants como Q4_K_M (7,5 GB) que caben en GPUs de 8-12 GB de VRAM.
- Escritura creativa de ficcion para adultos: generar narrativa con contenido explicito, terror o violencia que los modelos alineados rechazan, util para autores de ficcion adulta que trabajan localmente y con privacidad.
- Bots conversacionales privados: montar un chatbot local sin envio de datos a servicios externos, relevante dado el contenido sensible del que se ocupa.
- Pruebas de calidad de cuantizacion: comparar el impacto de distintos niveles de cuantizacion (Q2_K frente a Q8_0) en tareas de escritura creativa, un caso habitual en la comunidad de llama.cpp.
- Uso del suplemento multimodal: si el mmproj es funcional, describir imagenes dentro de sesiones de roleplay o narrativa mediante llama.cpp con soporte mmproj.
- Investigacion sobre desalineacion: estudiar el comportamiento de modelos sin filtros de seguridad en entornos controlados y con los avisos legales y eticos pertinentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico generico de perplexidad para tipos de cuantizacion (por ikawrakow) y una referencia a las notas de Artefact2 sobre calidad de cuants, sin numeros concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,2 GB
  - IQ4_XS: ~6,8 GB
  - Q4_K_M: ~7,5 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB
  - Q8_0: ~12,8 GB
  - Anade 0,2-0,3 GB si se carga el mmproj, mas la memoria del KV cache segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuants Q4-Q6; RTX 4090 (24 GB) para Q8_0 con contexto amplio. En CPU, cualquier equipo con 16 GB de RAM ejecuta los cuants de hasta Q5/Q6 con velocidad limitada.
- Cabe en GPUs de consumo: si, desde 8 GB de VRAM con Q3_K_S/Q4_K_S, y comodamente en 12-16 GB con Q4_K_M o Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (muy habitual para roleplay), text-generation-webui y cualquier backend compatible con GGUF. No esta orientado a vLLM/TGI, que requieren pesos safetensors del modelo base.
- Latencia y throughput: no disponibles; los cuants Q4_K_S y Q4_K_M estan marcados como "fast, recommended" por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| Omega-Arsenal-12B (este) | 11,9B | GGUF (Q2_K-Q8_0) | apache-2.0 | Roleplay NSFW, unaligned |
| Mistral NeMo 12B Instruct (base probable de la familia) | 12B | safetensors, GGUF comunitarios | apache-2.0 | Instruct general, alineado |
| Magnum-v4-12B (TheDrummer) | 12B | safetensors, GGUF comunitarios | no disponible | Roleplay/prosa, estilo literario |

Los tres comparten el nicho de 12B para escritura creativa y roleplay, con ecosistema GGUF maduro. Omega-Arsenal se diferencia por su enfoque explicito en contenido adulto sin alineamiento. No hay datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- Contenido para adultos explicito: el modelo esta etiquetado como "not-for-all-audiences" y genera contenido NSFW, ERP, terror y violencia sin filtros. Su uso es responsabilidad exclusiva del usuario y puede ser ilegal o inapropiado en muchos contextos y jurisdicciones.
- Riesgo de alucinacion: no documentado para este modelo, pero inherente a cualquier LLM de esta clase; agravado por la ausencia de alineamiento, que elimina mecanismos de rechazo y verificacion.
- Sesgos: no documentados. Al ser un modelo unaligned entrenado con contenido adulto, cabe esperar sesgos y estereotipos presentes en ese material.
- Idioma: documentado solo para ingles. No hay garantia de calidad en castellano.
- Longitud de contexto: no especificada en la model card; debe verificarse en el modelo base antes de planificar sesiones largas de roleplay.
- Licencia: apache-2.0, permisiva para uso comercial del modelo; sin embargo, el contenido generado (adulto, explicito) puede estar sujeto a restricciones legales propias de cada jurisdiccion y a las politicas de las plataformas donde se despliegue.
- Los archivos mmproj sugieren multimodalidad, pero no esta documentado; puede no ser funcional.
- Para produccion: al carecer de filtros, no es adecuado para productos expuestos a usuarios finales sin capas de moderacion externas.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Omega-Arsenal-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-12B
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Omega-Arsenal-12B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Omega-Arsenal-12B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
