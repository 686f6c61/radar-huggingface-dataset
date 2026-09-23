# espetro/kev-0.8b-mistralrs

## Resumen

Kev-0.8B for kev-rs es un checkpoint de 0,8 mil millones de parametros publicado por el usuario espetro, consistente en una exportacion del modelo jaredpalmer/kev-0.8b al formato que carga directamente el servidor Kev incluido en el fork espetro/mistral.rs. No se trata de un entrenamiento nuevo: el repositorio contiene el modelo base Qwen/Qwen3.5-0.8B-Base (revision dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68) con el LoRA de Kev fusionado en fp32, mas una cabeza adicional (`head.safetensors`) con tensores q y k y un fichero de configuracion propia (`kev.json`) con los campos base, head_dim, temperature y los identificadores de tokens especiales.

El modelo se etiqueta como decision-model, es decir, esta pensado para integrarse en una pila de inferencia (kev-rs sobre mistral.rs) mas que para generacion de texto abierta. Su relevancia practica es de reproducibilidad y despliegue: los pesos fusionados son bit-identicos a los que carga `kev.serve`, de modo que el checkpoint sirve como artefacto congelado para servir el modelo sin depender del proceso de entrenamiento original ni de la fusion del adaptador en tiempo de carga. La licencia es Apache-2.0, la misma que la del checkpoint de origen y la del modelo base.

El repositorio ocupa 3,0 GB, coherente con un checkpoint en fp32 de ~0,8B de parametros. En el momento de la consulta registra 0 descargas y 0 likes, por lo que no existe validacion externa de su comportamiento. La model card no documenta arquitectura detallada, datos de entrenamiento, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada del modelo base Qwen/Qwen3.5-0.8B-Base. Incluye una cabeza adicional tipo pointer (tensores q, k) definida en head.safetensors |
| Parametros totales | 0,8 mil millones (segun nombre del modelo y modelo base); cifra exacta no disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos en safetensors (LoRA fusionado en fp32); no se publican variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint HF plano en `model/`, mas `head.safetensors` y `kev.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es que `model/` contiene Qwen/Qwen3.5-0.8B-Base en la revision dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68 con el LoRA de Kev fusionado en fp32, en formato de checkpoint HuggingFace estandar. Ademas del backbone, el export incluye `head.safetensors`, que aloja la cabeza pointer de Kev con tensores q y k, y `kev.json`, con los campos base, head_dim, temperature y los identificadores de tokens especiales. La semantica exacta de esa cabeza (que decide o a que apunta) no se detalla en la model card.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni sobre innovaciones tecnicas concretas del backbone. El unico detalle procedimental conocido es que el export se genero con `kev-rs/scripts/export_checkpoint.py` y que los pesos fusionados son bit-identicos a los que carga `kev.serve`, lo que garantiza equivalencia numerica entre el artefacto exportado y el modelo servido por la via original.

## Capacidades

- Modelo de decision (decision-model, segun las etiquetas del repositorio); su funcion concreta no esta documentada en la informacion disponible.
- Carga de un checkpoint HuggingFace plano del backbone mas una cabeza pointer separada, con configuracion propia en `kev.json` (base, head_dim, temperature, tokens especiales).
- Servicio directo mediante el servidor Kev del fork espetro/mistral.rs, sin pasos adicionales de fusion de adaptadores.
- Generacion de texto: no confirmada explicitamente; el backbone subyacente es un modelo base de Qwen3.5, pero la model card no documenta capacidades generativas del conjunto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; unicamente la cabeza pointer y los tokens especiales declarados en `kev.json`.

## Casos de uso

- Servicio reproductible de Kev con mistral.rs: ejecutar `kev-rs serve --checkpoint espetro/kev-0.8b-mistralrs --run jaredpalmer/kev-0.8b` para levantar exactamente los mismos pesos que carga la ruta original, evitando diferencias numericas por fusion de LoRA en tiempo de ejecucion.
- Enrutado de peticiones en pipelines de agentes: un modelo de 0,8B en fp32 ocupa unos 3 GB, por lo que puede desplegarse en la misma GPU que el modelo principal para decidir a que herramienta o submodelo se dirige cada consulta, con coste de memoria marginal.
- Gating previo a un LLM grande: filtrar o clasificar consultas antes de invocar un modelo mayor, reduciendo el numero de llamadas costosas, siempre que se valide previamente la calidad de decision del modelo (no hay benchmarks publicados).
- Sustitucion del checkpoint de referencia en infraestructura existente: al ser un export del mismo modelo en otro layout, permite cambiar de repositorio sin tocar el codigo del servidor ni el contrato de ficheros (`model/`, `head.safetensors`, `kev.json`).
- Experimentacion reproducible en investigacion: los pesos fusionados bit-identicos permiten comparar resultados entre laboratorios sin la variabilidad introducida por distintas versiones de librerias de fusion de adaptadores.
- Despliegue en hardware de gama baja o en el borde: con ~3,2 GB de pesos en fp32 y estimaciones de 1,5-2 GB en int8, el modelo cabe en GPUs consumer de 8-12 GB junto con el runtime, o incluso en CPU si se generan variantes cuantizadas (no incluidas en el repositorio).
- Pruebas de integracion en CI: por su tamano reducido, puede levantarse en un runner con GPU modesta para validar de extremo a extremo la ruta de carga de un servidor Kev antes de desplegar variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de ~0,8B parametros; no confirmada por el autor):

| Precision | Peso de los pesos | Uso total estimado (pesos + runtime + cache) |
|---|---|---|
| fp32 (formato publicado) | ~3,2 GB | ~4-5 GB |
| fp16 / bf16 | ~1,6 GB | ~2,5-3 GB |
| int8 | ~0,8 GB | ~1,5-2 GB |
| 4 bits | ~0,5 GB | ~1-1,5 GB |

- Solo se distribuyen pesos en fp32 (safetensors); las filas de fp16, int8 y 4 bits son estimaciones de conversion, no artefactos publicados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp32; RTX 3060 12 GB, RTX 4070, RTX 4080/4090, A10, L4 o superiores. En fp16 la conversion cabria en GPUs de 4-6 GB. No se requieren A100 ni H100 para el tamano del modelo, aunque pueden usarse por consolidacion de infraestructura.
- Cabe en GPU consumer: si, en la mayoria de modelos con 8 GB o mas en fp32 y en practicamente todos con 4 GB o mas tras cuantizar.
- La cache KV depende de la longitud de contexto, que no esta documentada; a mayor contexto, mayor consumo adicional.
- Opciones de despliegue: el runtime previsto es el servidor Kev del fork espetro/mistral.rs (`kev-rs serve`). El componente `model/` es un checkpoint HF estandar, por lo que seria compatible en principio con vLLM, TGI o transformers, pero la cabeza pointer y `kev.json` requeririan codigo de integracion propio no documentado. No se publican ficheros GGUF, por lo que llama.cpp u Ollama exigirian una conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| espetro/kev-0.8b-mistralrs | ~0,8B | No disponible | safetensors (fp32, LoRA fusionado) + cabeza pointer | Apache-2.0 | Export para kev-rs; pesos bit-identicos al modelo servido |
| jaredpalmer/kev-0.8b | No disponible (presumiblemente ~0,8B) | No disponible | No disponible en esta consulta | Apache-2.0 | Checkpoint de origen del que deriva este export |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B | No disponible | No disponible en esta consulta | No disponible en esta consulta | Modelo base; el export incorpora el LoRA fusionado y la cabeza Kev |

No se dispone de datos de rendimiento ni de contexto de ninguno de los tres, por lo que la comparativa se limita a parametros y licencia. Para alternativas genericas de ~1B (por ejemplo familias Qwen, Llama o Gemma de ese rango) no hay informacion de rendimiento comparable en la documentacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes ni benchmarks publicados.
- La model card del export no documenta sesgos, datos de entrenamiento, composicion del dataset ni idiomas cubiertos, por lo que no es posible evaluar riesgos de sesgo ni de alucinacion.
- La semantica y el comportamiento de la cabeza pointer (tensores q y k) no estan descritos; su uso en produccion exige leer el codigo de kev-rs y validar el comportamiento por cuenta propia.
- El modelo se distribuye exclusivamente en fp32 y sin variantes cuantizadas, lo que multiplica por cuatro el espacio en disco y memoria respecto a fp16 y limita su despliegue en entornos con restricciones de memoria.
- Ausencia de ficheros GGUF: no es directamente utilizable en llama.cpp u Ollama sin conversion y sin resolver la integracion de la cabeza adicional.
- Dependencia de un fork concreto de mistral.rs (espetro/mistral.rs) y de la herramienta `kev-rs`; no es un artefacto portable a cualquier servidor de inferencia sin trabajo adicional.
- El repositorio no incluye informacion sobre version de transformers requerida, ni sobre los identificadores exactos de tokens especiales mas alla de su presencia en `kev.json`; conviene revisar ese fichero antes de desplegar.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y de atribucion; no incluye garantias ni clausulas de indemnizacion.
- Al ser un modelo de 0,8B, su capacidad de razonamiento complejo, codigo o matematicas es previsiblemente limitada frente a modelos de mayor tamano, aunque no hay datos publicados que lo confirmen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espetro/kev-0.8b-mistralrs
- Checkpoint de origen: https://huggingface.co/jaredpalmer/kev-0.8b
- Fork de mistral.rs con el servidor Kev: https://github.com/espetro/mistral.rs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base (revision dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68)
- Script de exportacion citado en la model card: `kev-rs/scripts/export_checkpoint.py` (dentro del repositorio del fork)
