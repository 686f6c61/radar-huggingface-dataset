# Alpha9/numbat

## Resumen

`numbat` es un checkpoint intermedio de preentrenamiento publicado en HuggingFace bajo el identificador `Alpha9/numbat`. Segun la model card, se trata de una copia de evaluacion de una ejecucion de entrenamiento a gran escala de Anthropic, con nombre en clave `numbat`, correspondiente a un modelo de clase Mythos. El checkpoint se habria extraido en el paso 1.830.000 de una ejecucion de aproximadamente 1,96 millones de pasos, por lo que no ha recibido postentrenamiento ni RLHF.

El modelo emplea una arquitectura hibrida que combina capas Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA), con capas de mezcla de expertos (MoE) de 1.224 expertos con enrutamiento top-48 mas un experto compartido, y una capa de Multi-Token Prediction (MTP). Los pesos se distribuyen en 772 shards en formato safetensors con cuantizacion NVFP4, sumando aproximadamente 7,72 TB de datos tensoriales.

La relevancia de esta publicacion es doble. Por un lado, ofrece una implementacion de referencia completa (`modeling_numbat.py`) que permite cargar el checkpoint con `load_state_dict(strict=True)` y ejecutar el trunk y la capa MTP. Por otro, su procedencia no esta verificada de forma independiente y la propia model card reconoce que se trata de material de origen no aclarado, lo que exige tratar cualquier afirmacion sobre su autoria, calidad o seguridad con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con MoE y MTP |
| Parametros totales | 6.849.377.242.584 (~6,85 billones; la model card indica ~14T, discrepancia no resuelta) |
| Parametros activos | No disponible (top-48 de 1.224 expertos + 1 compartido, sin recuento publicado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con bloques de escala E4M3); tag 8-bit en HuggingFace |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (772 shards, ~10,6 GB por archivo, ~7,72 TB totales) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un stack hibrido de capas Gated DeltaNet y Multi-head Latent Attention, con capas feed-forward de mezcla de expertos de 1.224 expertos, enrutamiento top-48 mas un experto compartido, y una capa de Multi-Token Prediction accesible mediante `NumbatForCausalLM.draft`. El tokenizador es un BPE a nivel de byte con 131.072 tokens. El checkpoint incluye `configuration_numbat.py` y `modeling_numbat.py` como implementacion de referencia, con un arbol de modulos que asigna una posicion exacta a cada tensor de cada shard.

Segun el autor, el checkpoint corresponde al paso 1.830.000 de una ejecucion de unos 1,96 millones de pasos y no ha pasado por postentrenamiento ni RLHF. Los pesos se habrian cuantizado a NVFP4 para ejecutar evaluaciones en un slice de Trainium2, y los pesos BF16 originales con estado del optimizador no se habrian publicado. No se dispone de informacion verificable sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion empleadas. La afirmacion de que el modelo pertenece a Anthropic se basa en una supuesta filtracion de codigo de Claude Code y no ha sido confirmada por ninguna fuente independiente.

## Capacidades

- Generacion de texto autoregresiva mediante `NumbatForCausalLM.forward`, con implementacion de referencia incluida en el repositorio.
- Decodificacion especulativa mediante la capa de Multi-Token Prediction, accesible a traves de `NumbatForCausalLM.draft`.
- Razonamiento y generacion de codigo: no verificable, al tratarse de un checkpoint de preentrenamiento sin postentrenamiento.
- Tool calling y function calling: no disponible; no se documenta ningun formato de herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion de arquitecturas hibridas GDN/MLA: el repositorio incluye una implementacion de referencia completa que permite estudiar como se combinan capas de atencion lineal y atencion latente en un modelo de gran escala, asi como la interaccion con capas MoE de 1.224 expertos.
- Estudio de cuantizacion NVFP4 a gran escala: los 772 shards en formato NVFP4 con bloques de escala E4M3 permiten analizar el comportamiento de la cuantizacion de 4 bits en un checkpoint de varios billones de parametros y validar el round-trip de los tensores.
- Analisis de decodificacion especulativa con MTP: la capa `draft` permite experimentar con Multi-Token Prediction como mecanismo de aceleracion de inferencia sobre el trunk principal.
- Evaluacion de checkpoints intermedios de preentrenamiento: al tratarse de un checkpoint en el paso 1.830.000, resulta util para estudiar la evolucion de las capacidades durante el preentrenamiento, comparando con checkpoints posteriores si estuvieran disponibles.
- Docencia y formacion en sistemas distribuidos de gran escala: la estructura de 772 shards con un indice de tensores determinista sirve como caso practico de carga con `load_state_dict(strict=True)` y de gestion de checkpoints multi-shard.
- Auditoria de seguridad de publicaciones en HuggingFace: el caso permite ilustrar los riesgos de ejecutar codigo remoto (`trust_remote_code=True`) con pesos de procedencia no verificada y de tamano desproporcionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `ckpt_metadata.json` contiene la salida del harness de evaluacion, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Los pesos suman aproximadamente 7,72 TB en NVFP4, por lo que la inferencia requiere un cluster multi-nodo; no cabe en ninguna GPU individual ni en configuraciones consumer.
- GPU recomendadas: la model card menciona un slice de aproximadamente 85 Trainium2 solo para alojar los pesos durante las evaluaciones. Para GPUs, se necesitaria un cluster de A100/H100/H200 con parallelism tensor y de expertos; no hay configuracion publicada.
- Cabe en consumer GPU: no. El tamano del checkpoint (7,72 TB) excede en varios ordenes de magnitud la VRAM de cualquier GPU consumer (RTX 4090: 24 GB).
- Opciones de despliegue: la model card referencia un runtime interno "Neuron-parallel" y una implementacion de referencia single-device en PyTorch (`modeling_numbat.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (hibridos GDN/MLA con MoE de 1.224 expertos y cuantizacion NVFP4) con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Procedencia no verificada: la atribucion a Anthropic se basa en una supuesta filtracion y no ha sido confirmada por ninguna fuente independiente. Tratar el modelo como material de origen desconocido.
- Checkpoint de preentrenamiento: no ha recibido postentrenamiento ni RLHF, por lo que su salida sera texto crudo de completado, sin formato conversacional ni alineacion de seguridad.
- Discrepancia en el recuento de parametros: la model card indica ~14T parametros, mientras que el indice safetensors reporta 6.849.377.242.584 (~6,85 billones). La discrepancia no esta resuelta.
- Requiere `trust_remote_code=True`: la carga implica ejecutar codigo Python del autor (`configuration_numbat.py`, `modeling_numbat.py`), lo que supone un riesgo de seguridad relevante con pesos de procedencia no aclarada.
- Licencia no disponible: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion.
- Idiomas no declarados: se desconoce el soporte multilingue y la calidad por idioma.
- Riesgo de alucinacion: no evaluado; al ser un checkpoint de preentrenamiento, la generacion puede ser incoherente o factualmente incorrecta sin mecanismos de mitigacion.
- Sesgos: no documentados ni evaluados.
- Contexto maximo: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Tamano inmanejable: 7,72 TB de pesos en NVFP4 hacen inviable cualquier despliegue fuera de infraestructura de cluster.

## Enlaces

- HuggingFace: https://huggingface.co/Alpha9/numbat
