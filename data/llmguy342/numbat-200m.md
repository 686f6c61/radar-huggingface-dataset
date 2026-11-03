# llmguy342/numbat-200M

## Resumen

`numbat-200M` es un checkpoint publicado en HuggingFace bajo el identificador `llmguy342/numbat-200M`. Segun la model card del autor, se trata de una copia de evaluacion de un checkpoint intermedio de preentrenamiento de un supuesto modelo de Anthropic con nombre en clave `numbat`, asociado a una fila de entrenamiento de clase Mythos. El autor afirma que el modelo tiene aproximadamente 14 billones de parametros, 114 capas y una arquitectura hibrida que combina Gated DeltaNet (GDN) con Multi-head Latent Attention (MLA), capas de mezcla de expertos (MoE) y Multi-Token Prediction (MTP).

La discrepancia entre el identificador del repositorio (`numbat-200M`) y el contenido descrito en la model card (~14T parametros) es notable y no se resuelve en la informacion disponible. El repositorio ocupa 0,9 GB, muy lejos de los ~7,72 TB que la model card atribuye al conjunto completo de 772 shards. Por tanto, lo publicado en HuggingFace no puede corresponder al checkpoint completo descrito; como maximo seria un fragmento parcial o un artefacto de otro tipo.

La relevancia de esta ficha es fundamentalmente critica: el modelo no dispone de licencia declarada, no tiene pipeline asignado, no registra descargas ni likes, y su procedencia es cuando menos dudosa. La model card describe un supuesto checkpoint filtrado de un laboratorio, con afirmaciones no verificables de forma independiente. Cualquier uso en produccion deberia considerarse no recomendado hasta que exista clarificacion legal y tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN + MLA con capas MoE y MTP (segun model card) |
| Parametros totales | ~14T segun model card; el identificador del repo sugiere 200M; no verificable |
| Parametros activos | No disponible (MoE con 1.224 expertos, top-48 + 1 compartido segun model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 scale blocks + E2M1 payloads) segun model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (772 shards descritos; repo de 0,9 GB) |

## Arquitectura y entrenamiento

Segun la model card, la arquitectura es un stack hibrido que intercala capas Gated DeltaNet (un tipo de atencion lineal con estado recurrente) y Multi-head Latent Attention (MLA, la atencion comprimida por latentes popularizada por DeepSeek), con capas feed-forward de mezcla de expertos (1.224 expertos, top-48 mas uno compartido) y una capa de Multi-Token Prediction para decodificacion especulativa. El tokenizador seria un BPE a nivel de byte con 131.072 tokens. Los pesos publicados estarian en NVFP4, una cuantizacion de 4 bits con bloques de escala E4M3 y payloads E2M1, que el autor justifica como copia de evaluacion generada a partir de los pesos BF16 originales que permanecen en el cluster de entrenamiento.

Respecto al entrenamiento, la model card indica que se trata de un checkpoint en el paso 1.830.000 de una ejecucion de aproximadamente 1,96 millones de pasos, es decir, en torno al 93 % del preentrenamiento, sin post-entrenamiento ni RLHF. No se especifica la composicion del dataset, el numero de tokens vistos ni si hubo fases de alineacion. La unica innovacion tecnica destacable declarada es la inclusion de una implementacion de referencia (`modeling_numbat.py`) con `NumbatForCausalLM.forward` para el tronco y `NumbatForCausalLM.draft` para la capa MTP. No hay verificacion independiente de ninguna de estas afirmaciones.

## Capacidades

- Generacion de texto autoregresiva basica, segun la implementacion de referencia incluida.
- Razonamiento y codigo: no verificable; al ser un checkpoint de preentrenamiento sin post-entrenamiento, no cabe esperar un rendimiento alineado con modelos instructivos.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no documentados.
- Decodificacion especulativa via capa MTP: declarada en la model card, no verificada.
- No se ha publicado ninguna evaluacion funcional de capacidades.

## Casos de uso

- Investigacion de arquitecturas hibridas GDN/MLA: el codigo de referencia permitiria, en teoria, estudiar la implementacion de una pila que combina atencion lineal y MLA, aunque el repositorio publicado no contiene los pesos completos descritos.
- Estudio de cuantizacion NVFP4: analisis del formato de bloques E4M3/E2M1 y de su decodificacion, util para quienes investigan tecnicas de cuantizacion de 4 bits en modelos de gran escala.
- Analisis de seguridad y cadena de suministro de modelos: el caso es un ejemplo practico de por que conviene verificar procedencia, licencia e integridad de pesos antes de integrarlos en pipelines.
- Docencia sobre riesgos de modelos no auditados: util como caso de estudio de afirmaciones no verificables en model cards y de la diferencia entre un repositorio y un checkpoint completo.
- Reproduccion de la implementacion de referencia: ejecutar `modeling_numbat.py` con tensores sinteticos para validar la coherencia del codigo, sin cargar pesos reales.
- No se recomienda ningun caso de uso en produccion: sin licencia, sin evaluacion y con pesos incompletos, el modelo no es apto para despliegues reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una salida de arnes de evaluacion en `ckpt_metadata.json`, pero no se proporcionan cifras ni se detalla que tareas se evaluaron.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si el checkpoint descrito fuese real (~14T parametros en NVFP4), requeriria del orden de 7 TB de memoria, lo que excede cualquier GPU individual y obliga a despliegues multi-nodo.
- El repositorio publicado ocupa 0,9 GB, por lo que, en su estado actual, cabria en cualquier GPU consumer, pero no corresponde al modelo descrito.
- GPU recomendadas: no disponible; la model card menciona Trainium2 para la evaluacion interna.
- Opciones de despliegue: la model card propone `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` con el codigo incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos publicos comparables con la arquitectura y escala descritas, y las alternativas de la misma categoria (modelos MoE de gran escala con atencion hibrida) no pueden compararse de forma fiable sin datos de evaluacion del modelo en cuestion.

## Limitaciones y advertencias

- Procedencia no verificada: la model card afirma que se trata de un checkpoint filtrado de Anthropic, lo que plantea riesgos legales y de cumplimiento graves si fuese cierto.
- Inconsistencia entre identificador (`numbat-200M`) y contenido descrito (~14T parametros); el tamano del repositorio (0,9 GB) no coincide con los ~7,72 TB declarados para el conjunto completo.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial ni para redistribucion.
- Sin post-entrenamiento ni RLHF: la salida esperada seria texto crudo de preentrenamiento, no respuestas alineadas.
- Riesgo elevado de alucinacion y de contenido inapropiado en cualquier uso conversacional.
- Idiomas soportados no documentados; no hay garantia de calidad en castellano.
- Ausencia total de benchmarks y de evaluaciones independientes.
- Repositorio sin descargas ni likes, creado y actualizado el mismo dia, lo que sugiere publicacion reciente y sin validacion comunitaria.
- No apto para produccion en ningun escenario sin una auditoria legal y tecnica previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/llmguy342/numbat-200M
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
