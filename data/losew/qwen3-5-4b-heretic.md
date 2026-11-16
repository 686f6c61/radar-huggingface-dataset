# Losew/qwen3.5-4b-heretic

## Resumen

Losew/qwen3.5-4b-heretic es una version "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-4B, publicada por el usuario Losew en Hugging Face. El modelo se ha procesado con la herramienta Heretic, que elimina el comportamiento de rechazo mediante Arbitrary-Rank Ablation (ARA), una tecnica que modifica las direcciones de activacion internas del modelo sin reentrenarlo. El resultado es un modelo que intenta responder a cualquier peticion, manteniendo supuestamente las capacidades generales del modelo base gracias a que Heretic minimiza la divergencia KL respecto al original.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, con 4.205.751.296 parametros totales (aproximadamente 4,2 mil millones) y una longitud de contexto heredada de 262.144 tokens. La version publicada por Losew esta disponible exclusivamente en formato GGUF, con cuantizaciones que van desde BF16 (7,9 GB) hasta Q3_K_S (1,9 GB), lo que la hace desplegable en hardware de consumo.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de "abliteration" aplicada a un modelo reciente de la familia Qwen3.5, una practica cada vez mas comun en la comunidad open source; por otro lado, advierte de que se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks propios publicados, y con un disclaimer explicito sobre el riesgo de generar contenido danino. No debe confundirse con el modelo oficial Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles especificos no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S |
| Idiomas soportados | Ingles (en), ruso (ru), chino (zh) segun la model card |
| Licencia | Apache-2.0 (segun la model card; el campo de licencia de HF figura como no disponible) |
| Formato de pesos | GGUF (unico formato publicado; no hay safetensors en el repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida) ni composicion del dataset de preentrenamiento del modelo base. Tampoco se documenta si Qwen3.5-4B utilizo RLHF, DPO u otras tecnicas de alineacion.

La modificacion aplicada por Losew no implica entrenamiento. Heretic opera mediante Arbitrary-Rank Ablation (ARA): identifica y sustrae direcciones de activacion asociadas al comportamiento de rechazo, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. Al minimizar la divergencia KL respecto al modelo original, la herramienta pretende preservar razonamiento, codigo y conocimiento general. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp con outtype bf16, y la cuantizacion con `llama-quantize` sin importance matrix (imatrix), lo que segun el autor degrada de forma medible las cuantizaciones Q3.

## Capacidades

- Generacion de texto conversacional multi-turno, con la plantilla de chat original de Qwen3.5 sin modificaciones.
- Razonamiento y conocimiento general, presumiblemente equivalentes al modelo base segun el autor (sin benchmarks propios publicados).
- Generacion de codigo, heredada del modelo base (no verificada en esta publicacion).
- Capacidades multilingues limitadas a ingles, ruso y chino segun la model card; el castellano no figura entre los idiomas declarados.
- Respuesta a practicamente cualquier peticion, incluida la generacion de contenido que el modelo original rechazaria.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documenta soporte de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente multi-paso en la informacion disponible.

## Casos de uso

- Investigacion sobre abliteration y seguridad de modelos: el modelo sirve como caso de estudio para medir cuanto se degrada un modelo de 4 B tras eliminar las direcciones de rechazo, comparando sus respuestas con las del Qwen3.5-4B original en tareas de razonamiento y codigo.
- Despliegue local en hardware de consumo: con la cuantizacion Q4_K_M (2,5 GB) el modelo cabe en GPUs de 8 GB de VRAM y permite prototipado offline en portatiles con GPU discreta, usando llama.cpp, LM Studio, Jan u Ollama.
- Generacion de texto creativo sin filtros editoriales: escritura de ficcion, guiones o dialogos que aborden temas sensibles, donde el modelo original introduciria negativas o disclaimers.
- Evaluacion de robustez de filtros de contenido: integrado como generador de casos adversarios en pipelines de red teaming, para probar clasificadores de seguridad o moderadores propios.
- Experimentacion con plantillas de chat y cuantizaciones: al conservar la plantilla original de Qwen3.5, sirve para validar pipelines de inferencia GGUF y comparar la calidad entre Q4_K_M, Q5_K_M y Q8_0 con el mismo prompt.
- Analisis de sesgos y alucinacion en modelos sin alineacion: util para estudiar como varia la tasa de afirmaciones no verificadas al eliminar el comportamiento de rechazo, en un contexto controlado de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma generica que benchmarks independientes de modelos procesados con Heretic (MMLU, GSM8K) muestran una degradacion minima frente a otras herramientas de abliteration, pero no aporta cifras concretas para esta publicacion ni para el modelo base Qwen3.5-4B.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q3_K_S ~1,9 GB; Q4_K_M ~2,5 GB; Q5_K_M ~2,8 GB; Q6_K ~3,2 GB; Q8_0 ~4,2 GB; BF16 ~7,9 GB (mas overhead de contexto KV, que crece con la ventana de 262.144 tokens).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 solo si se necesita contexto muy largo o alto throughput por lotes.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas usando Q4_K_M o Q5_K_M; con Q3_K_S es viable en GPUs de 4-6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (via Modelfile), LM Studio, Jan, GPT4All. No se documenta soporte para vLLM ni TGI porque solo se publican pesos GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 4 B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo, pero no hay mediciones publicadas para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Losew/qwen3.5-4b-heretic | ~4,2 B | 262.144 | Apache-2.0 (segun model card) | GGUF | Abliterated, sin benchmarks propios, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | 262.144 | No disponible en esta ficha | No disponible en esta ficha | Modelo original con alineacion de seguridad intacta |
| Otras publicaciones abliterated de la familia Qwen | Variable | Variable | Variable | GGUF / safetensors | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los mecanismos de rechazo: respondera a peticiones daninas, ilegales o sensibles sin filtro, lo que traslada toda la responsabilidad legal y etica al usuario.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, especialmente en dominios especializados; no hay benchmarks que cuantifiquen la degradacion respecto al base.
- Idiomas declarados limitados a ingles, ruso y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Las cuantizaciones Q3_K_M y Q3_K_S se generaron sin imatrix y el propio autor advierte de degradacion notable; para calidad baja se recomienda producir cuantizaciones propias desde el BF16.
- La licencia Apache-2.0 figura en la model card, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar los terminos del modelo base Qwen3.5-4B antes de uso comercial.
- Publicacion sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad, mantenimiento ni validacion independiente.
- Solo se distribuyen pesos GGUF; no hay safetensors, por lo que el despliegue con vLLM o TGI requeriria conversion y no esta soportado de fabrica.
- El contexto de 262.144 tokens heredado implica un coste de memoria KV considerable; en GPUs de consumo habra que reducirlo con `--ctx-size` en llama.cpp.
- No se documenta soporte de tool calling, agentes ni vision; no debe asumirse que estas capacidades del modelo base esten preservadas sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Losew/qwen3.5-4b-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de llama.cpp (conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- Herramienta Heretic: no disponible en la informacion proporcionada
- Paper o blog de Arbitrary-Rank Ablation (ARA): no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles en la informacion proporcionada
