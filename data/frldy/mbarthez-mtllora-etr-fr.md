# FrLdy/mbarthez-mtllora-ETR-fr

## Resumen

`FrLdy/mbarthez-mtllora-ETR-fr` es un adaptador de tipo LoRA (mtllora) para el modelo base `moussaKam/mbarthez`, un transformer encoder-decoder de la familia mBART entrenado originalmente por Moussa Kamal Eddine para tareas de modelado de lenguaje en frances. El adaptador ha sido entrenado sobre el dataset `ETR-fr` y se distribuye a traves de la libreria `adapter-transformers` (Adapter Hub), no como un modelo completo con pesos fusionados.

El repositorio contiene unicamente los pesos del adaptador (0,6 GB), lo que implica que para su uso es imprescindible descargar por separado el modelo base `moussaKam/mbarthez` desde Hugging Face. La model card del autor no especifica la tarea concreta, el regimen de entrenamiento, los hiperparametros ni los resultados de evaluacion; las secciones de arquitectura, evaluacion y citacion estan vacias.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion sin documentacion publica, sin descargas ni interacciones registradas, y sin licencia declarada. Resulta util unicamente como referencia para quienes rastrean adaptadores sobre mBART o experimentos con el dataset ETR-fr, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (mtllora) sobre el modelo base mBART (`moussaKam/mbarthez`), transformer encoder-decoder |
| Parametros totales | no disponible (el adaptador ocupa 0,6 GB en el repo; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del adaptador sugiere frances, pero no se confirma en la model card) |
| Licencia | no disponible |
| Formato de pesos | pesos de adaptador compatibles con `adapter-transformers` (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `moussaKam/mbarthez`, un modelo de la familia mBART (transformer encoder-decoder con atencion completa) preentrenado para frances. La tecnica declarada en el nombre del repositorio es `mtllora`, es decir, LoRA multi-tarea, un esquema de adaptacion de bajo rango que congela los pesos del modelo base e inserta matrices de baja dimensionalidad entrenables en las capas de atencion y/o feed-forward. El uso de `adapter-transformers` en lugar de PEFT implica que la carga se realiza mediante `AutoAdapterModel` y `load_adapter`, con activacion explicita del adaptador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset `ETR-fr`, el regimen de ajuste (supervisado, RLHF, DPO) ni posibles innovaciones tecnicas. Las secciones correspondientes de la model card estan sin completar por el autor.

## Capacidades

- Generacion de texto condicionada al dominio del dataset `ETR-fr`, segun la tarea para la que fue entrenado el adaptador (no especificada).
- Compatible con el pipeline de `adapter-transformers`: carga, activacion y desactivacion dinamica del adaptador sobre el modelo base.
- Posible soporte multilingue heredado del modelo base mBART, aunque no confirmado para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Investigacion sobre adaptadores LoRA en mBART: el adaptador sirve como punto de partida para reproducir o comparar experimentos de adaptacion de bajo rango sobre modelos encoder-decoder en frances.
- Experimentacion con el dataset ETR-fr: util para estudiar como un adaptador mtllora modifica el comportamiento del modelo base en esa distribucion de datos concreta.
- Analisis de eficiencia de adaptadores: al ocupar 0,6 GB, permite medir el coste de almacenamiento y carga frente al modelo base completo en entornos de investigacion.
- Prototipado de pipelines con Adapter Hub: integrable en flujos que ya usan `adapter-transformers` para combinar varios adaptadores sobre un mismo backbone.
- Docencia y formacion: ejemplo practico de como se publica y carga un adaptador en Hugging Face con la libreria `adapters`.
- Evaluacion comparativa de tecnicas de adaptacion: base para contrastar mtllora frente a otras variantes (Houlsby, Pfeiffer, LoRA estandar) sobre mBART.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base `moussaKam/mbarthez`, cuyas dimensiones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base mBART suele requerir al menos una GPU con 16 GB o mas en fp16, pero este dato no se verifica en la informacion disponible.
- Opciones de despliegue: `adapter-transformers` (unica via documentada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `FrLdy/mbarthez-mtllora-ETR-fr` | no disponible (adaptador de 0,6 GB) | no disponible | no disponible | Hugging Face, 0 descargas |
| `moussaKam/mbarthez` (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores mtllora sobre mBART | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion de arquitectura, entrenamiento, evaluacion ni citacion, lo que impide validar su comportamiento.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Dependencia obligatoria del modelo base `moussaKam/mbarthez`, cuyas condiciones de uso y licencia deben verificarse por separado.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado.
- Cobertura idiomatica no confirmada; el sufijo `-fr` sugiere frances, pero no se garantiza.
- No apto para produccion sin una evaluacion previa sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/FrLdy/mbarthez-mtllora-ETR-fr
- Modelo base: https://huggingface.co/moussaKam/mbarthez
- Dataset: https://huggingface.co/datasets/ETR-fr/
- Libreria Adapters: https://github.com/Adapter-Hub/adapters
- Adapter Hub: https://adapterhub.ml
