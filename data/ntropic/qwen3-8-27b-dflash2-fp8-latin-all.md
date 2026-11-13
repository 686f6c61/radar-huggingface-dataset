# Ntropic/Qwen3.8-27B-DFlash2-FP8-latin-all

## Resumen

Qwen3.8-27B-DFlash2-FP8-latin-all es un modelo de borrador (draft model) para decodificacion especulativa, derivado de josch15366/Qwen3.8-27B-DFlash2-FP8 mediante la herramienta VocabPruner de Ntropic. No es un modelo generativo completo, sino un componente auxiliar que acelera la inferencia del modelo objetivo QUASAR (Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all) prediciendo varios tokens por paso para que el modelo grande los valide en paralelo. La intervencion principal consiste en una poda del vocabulario del tokenizer, que pasa de 248.320 a 143.499 tokens (una reduccion del 42,21%), con remapeo de IDs y eliminacion de las filas correspondientes en los tensores de embedding y de salida, sin reentrenamiento.

El modelo conserva la arquitectura Qwen3 subyacente, con 1.870.736.128 parametros totales segun los safetensors del repositorio, y se distribuye en formato safetensors con cuantizacion FP8 (compressed-tensors). El checkpoint ocupa 2,14 GB en el repositorio, frente a los 2,25 GB del modelo del que deriva, una reduccion de 0,11 GB (4,77%). La poda se ha realizado conservando los tokens de byte y las dependencias BPE, y aplicando un filtro de scripts latin/common/inherited con toda la sintaxis y simbolos, sin filtrado por frecuencia.

Su relevancia es acotada pero concreta: permite desplegar un par draft-target con decodificacion especulativa en una GPU de consumo como la RTX 5090 (32 GiB), donde el autor reporta una cache KV de 12,63 GiB con capacidad estimada de unos 91.200 tokens adicionales y una longitud de contexto configurada de 262.144 tokens. La licencia Apache 2.0 facilita su integracion en pipelines de produccion, aunque el modelo no ha recibido descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (modelo borrador para decodificacion especulativa, DFlash2) |
| Parametros totales | 1.870.736.128 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados (segun model card) |
| Tipos de cuantizacion | FP8 (compressed-tensors); cache KV en NVFP4 segun configuracion reportada |
| Idiomas soportados | no disponible (poda orientada a scripts latin/common/inherited) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3 original de Alibaba Cloud y actua como draft model dentro de un esquema de decodificacion especulativa DFlash2. Su funcion es proponer secuencias cortas de tokens candidatos que el modelo objetivo QUASAR valida, reduciendo el numero de pasos de decodificacion efectivos. El modelo base DFlash2 procede de incoai y z-lab, y la version FP8 fue producida por josch15366.

La modificacion aplicada por Ntropic mediante VocabPruner no incluye entrenamiento adicional: se podan filas de los tensores de embedding y de la cabeza de salida, se remapean los IDs de token y se verifica que el tokenizer resultante mantiene los tokens de byte y las dependencias BPE necesarias. El filtro aplicado retiene los scripts latin, common e inherited, ademas de toda la sintaxis y los simbolos, sin filtrado por frecuencia. El resultado es un vocabulario de 143.499 tokens que debe compartir tokenizer e ID map con el modelo objetivo QUASAR podado correspondiente; el autor indica que se han superado las comprobaciones de tokenizer heredadas de QUASAR y que la codificacion por bytes sigue soportando los scripts eliminados, aunque el comportamiento de generacion puede variar.

## Capacidades

- Decodificacion especulativa: genera borradores de tokens para acelerar la inferencia del modelo objetivo QUASAR emparejado.
- Prediccion multi-token: propone varios tokens por paso para su validacion en paralelo por el modelo grande.
- Compatibilidad de tokenizer: comparte tokenizer e ID map con Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all (variante latin-all).
- Cobertura de scripts: mantiene tokens de byte y dependencias BPE, con soporte de codificacion por bytes para scripts eliminados del vocabulario.
- No es un modelo autonomo de chat, razonamiento, codigo o vision: su uso previsto es como componente auxiliar de un par draft-target.
- Soporte de tool calling, agentes, vision, audio o thinking mode: no disponible (no se documenta en la informacion proporcionada).

## Casos de uso

- Aceleracion de inferencia en produccion: emparejado con el target QUASAR podado, el draft propone tokens que el modelo grande valida, reduciendo la latencia por token en despliegues de decodificacion especulativa.
- Despliegue en GPU de consumo: con una RTX 5090 (32 GiB) el autor reporta 12,63 GiB de cache KV y contexto configurado de 262.144 tokens para el target solo, lo que permite servir un asistente de contexto largo en hardware de gama alta consumer.
- Reduccion de huella de memoria: la poda del vocabulario rebaja el checkpoint de 2,25 a 2,14 GB, lo que libera VRAM para cache KV o para el propio target en configuraciones ajustadas.
- Servicio de contexto largo: la ventana configurada de 262.144 tokens con cache KV NVFP4 encaja en tareas de resumen de documentos extensos o analisis de repositorios, siempre que el par draft-target quepa en memoria.
- Investigacion en decodificacion especulativa: sirve como caso de estudio reproducible de poda de vocabulario con VocabPruner y de su impacto en la tasa de aceptacion del draft.
- Pipelines multilingues con foco latino: la retencion de scripts latin/common/inherited y de toda la sintaxis cubre casos de texto en lenguas de alfabeto latino y codigo, aunque el autor advierte que el comportamiento de generacion puede cambiar.
- Integracion en infraestructura de inferencia existente: al estar en safetensors con cuantizacion FP8 y licencia Apache 2.0, puede incorporarse a servidores compatibles con compressed-tensors sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de memoria y tamano: cache KV de 12,63 GiB con capacidad estimada de unos 91.200 tokens en RTX 5090 (32 GiB, NVFP4 KV cache, 94% de utilizacion de memoria GPU), contexto configurado de 262.144 tokens y checkpoint de 2,14 GB frente a 2,25 GB del modelo base (−0,11 GB, −4,77%). No se documentan tasas de aceptacion del draft, throughput ni latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 2,14 GB en FP8; el autor reporta 12,63 GiB de cache KV para el target QUASAR en RTX 5090 con contexto de 262.144 tokens y cache KV NVFP4 al 94% de utilizacion de memoria GPU.
- GPU recomendadas: RTX 5090 (32 GiB) es la configuracion validada por el autor; no se documentan pruebas en A100, H100 ni otras GPU.
- GPU de consumo: si, cabe en RTX 5090 segun la model card; el emparejamiento DFlash con el target requiere memoria adicional a la indicada para el target solo.
- Opciones de despliegue: no disponible (no se especifican vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada); el formato compressed-tensors es compatible con stacks que soporten cuantizacion FP8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ntropic/Qwen3.8-27B-DFlash2-FP8-latin-all | 1.870.736.128 | 262.144 (configurado) | safetensors FP8 | Apache 2.0 | Draft podado, vocab 143.499 |
| josch15366/Qwen3.8-27B-DFlash2-FP8 | no disponible | no disponible | safetensors FP8 | no disponible | Modelo base sin poda, vocab 248.320 |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Draft DFlash2 original |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Espejo del draft DFlash2 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el target QUASAR emparejado con el mismo tokenizer e ID map; usarlo con otro target produce resultados invalidos.
- Cambio de comportamiento: el autor advierte explicitamente que la generacion puede cambiar tras la poda del vocabulario.
- Cobertura linguistica reducida: la poda elimina scripts no latinos del vocabulario; aunque la codificacion por bytes sigue soportandolos, la eficiencia y calidad en esos idiomas puede degradarse.
- Sin reentrenamiento: la poda es puramente estructural (filas de tensores y remapeo de IDs), por lo que no hay ajuste fino que compense la perdida de tokens.
- Memoria adicional: el emparejamiento DFlash con el target requiere mas memoria que la reportada para el target solo en RTX 5090.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes, y no se han publicado benchmarks ni evaluaciones independientes.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como draft model, sus errores los filtra el target, pero afectan a la tasa de aceptacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base de la cadena (Qwen3, DFlash2, QUASAR) antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ntropic/Qwen3.8-27B-DFlash2-FP8-latin-all
- Modelo base: https://huggingface.co/josch15366/Qwen3.8-27B-DFlash2-FP8
- Draft DFlash2 original (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Espejo DFlash2 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Target QUASAR-QAT: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo Qwen3 original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta VocabPruner: https://github.com/Ntropic/VocabPruner
