# huaq99/mtrl-qwen25-3b-en-is-sft-r0

## Resumen
mtrl-qwen25-3b-en-is-sft-r0 es un adaptador LoRA de investigacion para traduccion ingles→islandes, desarrollado por el usuario huaq99 en el contexto de un proyecto academico (ETHz-DL-team29/mtrl). No es un modelo autonomo: se trata de un delta de pesos LoRA que debe cargarse sobre el modelo base Qwen/Qwen2.5-3B-Instruct, fijado a la revision aa8e72537993ba99e69dfaafa59ed015b17504d1. El repositorio contiene unicamente los pesos del adaptador (aproximadamente 0,5 GB), no los pesos completos del modelo base.

El adaptador se entrena mediante SFT (supervised fine-tuning) sobre el modelo instruct de Qwen2.5 de 3.000 millones de parametros, con rango LoRA r=64 y alpha=128. Su unico proposito declarado es la traduccion de documentos del ingles al islandes en el marco de la tarea WMT26, con evaluacion sobre 198 documentos. El autor lo presenta explicitamente como material de investigacion, no como un sistema de traduccion certificado para produccion.

La relevancia de esta ficha es limitada: se trata de un adaptador de nicho, sin descargas ni validacion comunitaria, con licencia no declarada de forma explicita y con la publicacion del codigo pendiente de revision. Resulta util unicamente como referencia para quienes trabajen en traduccion de bajo recursos (islandes) o quieran reproducir la configuracion LoRA sobre Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-3B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el autor menciona una ruta FP32 para reproduccion exacta; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en (ingles), is (islandes) |
| Licencia | no disponible (metadatos de licencia del modelo base: qwen-research; el autor no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | r=64, alpha=128 |
| Revision del modelo base | aa8e72537993ba99e69dfaafa59ed015b17504d1 |
| SHA256 del adaptador | 7f7a4914c5f403e757fdb882c3576ac68f2b0fa6edc00e537087716b28ddb07e |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only del linaje Qwen2.5. La tecnica de adaptacion es LoRA con rango 64 y alpha 128, lo que implica una actualizacion de bajo rango sobre las matrices del modelo base sin modificar los pesos originales. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre pares de traduccion en→is, en el marco del experimento identificado como r0_3b_recovery_sft_2026-11-21.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El autor indica que los pesos se copiaron sin reentrenamiento, fusion ni cuantizacion adicionales, y que la configuracion publicada usa un ID y revision de modelo base portables, conservando la configuracion original por separado para la reconstruccion exacta del paquete local. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades
- Traduccion de texto ingles→islandes, orientada a documentos completos con segmentacion de origen y reconstruccion documental.
- Entrenamiento adicional: el adaptador puede cargarse con `is_trainable=True` sobre el modelo base fijado para continuar el ajuste (no es una reanudacion exacta de optimizador/RNG).
- Inferencia en precision reducida: el autor senala que es posible usar menos memoria que la ruta FP32, aunque los resultados no seran identicos en puntuacion.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas a los pares en e is segun la model card; el autor advierte que no garantiza capacidades en otras lenguas o tareas.

## Casos de uso
- Traduccion de documentacion tecnica en→is: el adaptador puede integrarse en un pipeline que segmente el texto de origen, traduzca cada segmento y reconstruya el documento, tal como se describe en la evaluacion del autor sobre 198 documentos WMT26.
- Investigacion en traduccion automatica de bajo recursos: sirve como punto de partida reproducible (r=64, alpha=128, base fijado) para experimentar con el par en→is y comparar con otras configuraciones LoRA.
- Fine-tuning incremental: al permitir `is_trainable=True`, puede usarse como inicializacion para experimentos posteriores de SFT o DPO sobre el mismo modelo base.
- Evaluacion comparativa de sistemas de traduccion: util para reproducir las metricas declaradas (chrF++ 39,7189; BLEU 19,7572) y contrastarlas con otros sistemas en el mismo conjunto de documentos.
- Prototipado de traduccion editorial islandesa: para equipos que necesiten un borrador automatico de textos en→is antes de la revision humana, aceptando la falta de garantias de calidad del autor.
- Docencia y experimentacion con PEFT: ejemplo practico de adaptador LoRA de traduccion sobre un modelo instruct de 3B, util para cursos o talleres sobre ajuste eficiente de parametros.

## Benchmarks y rendimiento
Los unicos datos publicados en la informacion disponible son los del autor, sobre 198 documentos WMT26, con segmentacion de origen, traduccion solo de texto y reconstruccion documental, manteniendo la referencia oficial refA sin cambios. El autor advierte que son puntuaciones de su sistema, no una clasificacion humana oficial de competicion.

| Metrica | Valor |
|---|---|
| chrF++ (198 documentos WMT26, en→is) | 39,7189 |
| BLEU (198 documentos WMT26, en→is) | 19,7572 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros sistemas en la misma tabla.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. El adaptador ocupa aproximadamente 0,5 GB; el modelo base Qwen2.5-3B-Instruct en FP16 requiere del orden de 6-7 GB, y en FP32 alrededor de 12-13 GB (estimacion estandar por tamano, no confirmada en la model card).
- GPU recomendadas: no especificadas por el autor. La ruta FP32 de reproduccion exacta exige mas memoria que la inferencia en precision reducida; para FP16 basta una GPU consumer de gama alta con 8 GB o mas.
- GPU consumer: probable en tarjetas con 8 GB o mas en FP16 (estimacion, no confirmada); la ruta FP32 requeriria tarjetas con 16 GB o mas.
- Opciones de despliegue: carga via PEFT sobre transformers (se referencia `load_example.py` en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en→is | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtrl-qwen25-3b-en-is-sft-r0 | adaptador LoRA sobre 3B | no disponible | chrF++ 39,7189; BLEU 19,7572 (198 docs WMT26) | no disponible (base: qwen-research) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible en esta ficha | no disponible para en→is | qwen-research | Hugging Face |
| Otros adaptadores de traduccion en→is | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la ausencia de referencias publicas.

## Limitaciones y advertencias
- No es un modelo autonomo: requiere cargar el modelo base Qwen/Qwen2.5-3B-Instruct en la revision exacta aa8e72537993ba99e69dfaafa59ed015b17504d1 para reproducir los resultados.
- El autor declara explicitamente que no es un sistema de traduccion certificado para produccion ni garantiza capacidades en otras lenguas o tareas distintas de en→is.
- Licencia no declarada de forma explicita; los metadatos del modelo base apuntan a qwen-research, y el autor no afirma permisos comerciales adicionales ni una licencia propia del proyecto. Verificar BASE_MODEL_LICENSE.md antes de cualquier uso comercial.
- Riesgo de alucinacion y de errores de traduccion no cuantificado: no se publican analisis de errores ni evaluaciones humanas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: solo se declaran en e is; la longitud de contexto efectiva no se especifica.
- Publicacion del codigo pendiente: el autor indica que no se ha subido nada a GitHub durante la publicacion del modelo y que los archivos locales nuevos pueden no estar disponibles en el repositorio del proyecto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de las metricas declaradas.
- La reanudacion de entrenamiento no es una reanudacion exacta de optimizador/RNG.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/huaq99/mtrl-qwen25-3b-en-is-sft-r0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del proyecto (publicacion pendiente): https://github.com/ETHz-DL-team29/mtrl
