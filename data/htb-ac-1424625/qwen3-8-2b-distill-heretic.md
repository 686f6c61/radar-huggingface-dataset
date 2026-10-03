# htb-ac-1424625/Qwen3.8-2B-Distill-heretic

## Resumen

Qwen3.8-2B-Distill-heretic es una version "abliterated" del modelo empero-ai/Qwen3.8-2B-Distill, publicada por el usuario de HuggingFace htb-ac-1424625. El modelo original es un fine-tune completo (no un adaptador) de Qwen/Qwen3.5-2B, destilado a partir de trazas de cadena de pensamiento del profesor interno Qwen3.8 2.4T A95B. La modificacion aplicada con Heretic v2.0.0.dev0 elimina la direccion de rechazo en las capas de atencion y MLP, reduciendo las negativas del modelo original de 84/100 a 3/100 y con una divergencia KL de solo 0.0069 respecto al original.

Se trata de un modelo denso de 2.213.241.664 parametros (unos 2,2B) con una longitud de contexto nativa de 262.144 tokens, heredada de la arquitectura Qwen3.5. La model card del autor original lo describe como la ruta de texto de una base vision-lenguaje, entrenado con SFT por destilacion off-policy sobre aproximadamente 30.000 trazas de profesor filtradas por calidad, cubriendo matematicas, razonamiento general y seguimiento de instrucciones. El resultado es un modelo de clase 2B que conserva el bloque `<think>` de razonamiento y el soporte nativo de function calling, con pesos bf16 de unos 4 GB.

Su relevancia actual es doble: por un lado demuestra que la destilacion desde un profesor MoE de gran escala puede transferir razonamiento a un modelo de borde; por otro, ilustra el ecosistema de derivados sin censura, utiles para investigacion sobre alineacion y refusal, pero problematicos para despliegues en produccion. Es un modelo en ingles, con licencia Apache 2.0, cero descargas y una sola valoracion en el momento de redactar esta ficha, por lo que carece de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas de atencion lineal Gated DeltaNet (hibrida), segun los kernels requeridos por la model card; etiqueta `qwen3_5` |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible. La model card menciona "builds cuantizados" que funcionan en telefonos y SBC, pero no especifica formatos (GGUF, AWQ, GPTQ, etc.) en el repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); tamano del repositorio 4,5 GB |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3.5-2B, un transformer causal de 2,2B parametros. La model card indica que para un rendimiento correcto se requieren los kernels de Gated DeltaNet (`flash-linear-attention` y una compilacion de `causal_conv1d` acorde a la version de CUDA); sin ellos, las capas de atencion lineal caen a operaciones PyTorch lentas y con alto consumo de memoria. Esto implica una arquitectura hibrida que combina atencion estandar con capas de atencion lineal, aunque la model card no detalla la proporcion exacta de cada tipo ni el numero de capas. El modelo se describe explicitamente como "ruta de texto de una base vision-lenguaje", y las etiquetas de HuggingFace incluyen `image-text-to-text`, aunque el pipeline declarado es `text-generation`.

El entrenamiento del modelo original (empero-ai/Qwen3.8-2B-Distill) fue un SFT por destilacion off-policy sobre aproximadamente 30.000 trazas de profesor procedentes de los datasets internos de destilacion de Empero, generadas por el profesor Qwen3.8 2.4T A95B (un MoE de 2,4 billones de parametros totales y 95B activos). Las trazas son cadenas de pensamiento densas sobre matematicas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. No se menciona RLHF ni DPO. El ajuste fue de parametros completos (full fine-tune), no un adaptador LoRA. Sobre ese modelo, la version heretic aplica abliteration con Heretic v2.0.0.dev0: se identifican direcciones de rechazo mediante `direction_index = 10.11` y se modulan los pesos de `attn.o_proj` (max_weight 1.49, min_weight 1.37) y `mlp.down_proj` (max_weight 0.75, min_weight 0.69). El proceso es reproducible y el repositorio incluye instrucciones en el directorio `reproduce`.

## Capacidades

- Generacion de texto conversacional en ingles con pipeline `text-generation`.
- Razonamiento con cadena de pensamiento: cada respuesta se abre con un bloque `<think>` aprendido directamente de las trazas del profesor, no de razonamiento sintetico autogenerado.
- Razonamiento matematico: mejora sustancial en GSM8K CoT respecto a la base Qwen3.5-2B (0,330 a 0,640 en metrica flexible).
- Conocimiento general: mejora en MMLU CoT de 57 asignaturas (0,283 a 0,548 en metrica flexible).
- Function calling nativo segun la especificacion de Qwen3.5, sin necesidad de wrapper ni fine-tune especifico de herramientas.
- Capacidades de agente y razonamiento multi-paso derivadas del entrenamiento en trazas de cadena de pensamiento.
- Soporte de contexto largo: hasta 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno largas.
- Modelo "decensored": la abliteration reduce los rechazos de 84/100 a 3/100, lo que habilita respuestas en dominios que el modelo original rechazaria.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades de vision: no confirmadas. Aunque las etiquetas incluyen `image-text-to-text` y la model card menciona una base vision-lenguaje, el pipeline declarado y la descripcion del autor se refieren a la "ruta de texto".

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como la abliteration modifica el comportamiento de rechazo con una divergencia KL minima (0,0069) respecto al original, util como caso de control en experimentos de interpretabilidad.
- Generacion de codigo asistida en local: con 2,2B parametros y soporte de function calling nativo, puede ejecutarse en un portatil con GPU consumer para autocompletado y generacion de fragmentos en editores, sin enviar codigo a servicios externos.
- Razonamiento matematico en el borde: con 0,640 en GSM8K CoT (metrica flexible), es viable para tutoria de problemas aritmeticos de varios pasos en dispositivos sin conectividad, por ejemplo en aplicaciones educativas offline.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten resumir o extraer informacion de contratos, manuales tecnicos o expedientes completos en una sola pasada, sin chunking ni recuperacion externa.
- Agentes autonomos ligeros: el soporte nativo de function calling y el razonamiento multi-paso lo hacen apto para orquestar llamadas a APIs en pipelines de automatizacion con requisitos de latencia y coste bajos.
- Clasificacion y extraccion estructurada en lotes: su tamano reducido permite desplegar multiples instancias en una sola GPU para tareas de etiquetado, normalizacion de entidades o enrutado de consultas a alta concurrencia.
- Prototipado rapido de asistentes conversacionales: sirve como sustituto economico de modelos mayores durante el desarrollo de productos, antes de escalar a modelos de 9B o superiores.
- Evaluacion de tecnicas de cuantizacion: al existir una version bf16 de ~4 GB, es un banco de pruebas adecuado para medir el impacto de cuantizaciones agresivas en tareas de razonamiento.

## Benchmarks y rendimiento

Los resultados de la tabla siguiente corresponden al modelo padre empero-ai/Qwen3.8-2B (el destilado sin abliterar), medidos con lm-evaluation-harness y backend de HuggingFace, con protocolos de cadena de pensamiento y los mismos ajustes para base y estudiante. No se han publicado resultados especificos del modelo heretic en estas tareas.

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B | Delta |
|---|---|---|---|---|
| gsm8k_cot | exact_match (flexible) | 0,330 | 0,640 | +0,310 |
| gsm8k_cot | exact_match (strict) | 0,545 | 0,640 | +0,095 |
| mmlu (CoT, 57 asignaturas) | acc (flexible-extract) | 0,283 | 0,548 | +0,265 |
| mmlu (CoT, 57 asignaturas) | acc (strict-match) | 0,004 | 0,225 | +0,221 |

Metricas de la modificacion heretic respecto al modelo padre:

| Metrica | Este modelo | Modelo original (empero-ai/Qwen3.8-2B-Distill) |
|---|---|---|
| Rechazos | 3/100 | 84/100 |
| Divergencia KL | 0,0069 | 0 (por definicion) |

Ajustes de muestreo recomendados por el autor: `temperature=0.6`, `top_p=0.95`, `top_k=20`, con `max_new_tokens` generoso (16.384 recomendado). La decodificacion greedy en generaciones largas se documenta como un modo de fallo conocido por bucles de repeticion en modelos de razonamiento de esta clase.

## Requisitos de hardware

- Peso en bf16: aproximadamente 4,4 GB de pesos (el repositorio ocupa 4,5 GB). La model card indica "bf16 en ~4 GB".
- VRAM estimada para inferencia: alrededor de 5-6 GB en bf16 contando pesos, activaciones y cache de clave-valor para contextos moderados; estimaciones orientativas de 2,5-3 GB en cuantizacion de 8 bits y 1,5-2 GB en 4 bits. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- Contexto largo: con 262.144 tokens de contexto, la memoria de cache crece de forma notable. La arquitectura hibrida con atencion lineal reduce ese crecimiento, pero no se han publicado cifras concretas de consumo a contextos maximos.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas para bf16 a contextos cortos (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G). Para contexto completo de 262.144 tokens se recomienda una GPU de 24-80 GB (RTX 4090, A100, H100) o servir con atencion paginada en vLLM o SGLang.
- Cabe en GPU consumer: si, en bf16 en tarjetas de 8-12 GB con contextos moderados, y en cuantizaciones de 4 bits en equipos con menos VRAM. La model card menciona ejecucion en telefonos, placas de un solo board y maquinas solo-CPU con builds cuantizados.
- Kernels obligatorios: `flash-linear-attention` y `causal_conv1d` compilados para la version de CUDA en uso. Sin ellos, las capas de atencion lineal caen a operaciones PyTorch lentas y con alto consumo de memoria.
- Opciones de despliegue: HuggingFace Transformers (con soporte reciente de Qwen3.5), vLLM y SGLang segun la propia model card. No se confirma soporte de llama.cpp, Ollama, TGI ni llama-cpp-python en la informacion disponible, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| htb-ac-1424625/Qwen3.8-2B-Distill-heretic | 2,2B denso | 262.144 | Apache 2.0 | HuggingFace, 0 descargas, 1 like | Derivado abliterated; rechazos 3/100; sin benchmarks propios publicados |
| empero-ai/Qwen3.8-2B-Distill | 2,2B denso | 262.144 | Apache 2.0 | HuggingFace | Modelo padre; GSM8K CoT 0,640 y MMLU CoT 0,548 (metrica flexible) |
| Qwen/Qwen3.5-2B | 2B denso | 262.144 | Apache 2.0 | HuggingFace | Base sin destilar; GSM8K CoT 0,330 y MMLU CoT 0,283 (metrica flexible) |
| empero-ai/Qwen3.8-9B | No disponible | 262.144 | Apache 2.0 | HuggingFace | Mismo profesor y curriculo, mayor capacidad; benchmarks no detallados en la informacion disponible |
| empero-ai/Qwen3.8-4B | No disponible | 262.144 | Apache 2.0 | HuggingFace | Mismo profesor y curriculo, capacidad intermedia; benchmarks no detallados en la informacion disponible |

No se dispone de datos comparativos con otros modelos abliterated de la misma clase (por ejemplo, variantes sin censura de familias Qwen o Llama) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration reduce los rechazos de 84/100 a 3/100. Esto implica que el modelo puede generar contenido dañino, ilegal o eticamente problemático que el original bloquearia. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Perdida de seguridad alineada: no se han publicado evaluaciones de seguridad posteriores a la abliteration mas alla del recuento de rechazos y la divergencia KL.
- Riesgo de alucinacion: como todo modelo de 2B, la precision factica es limitada. El 0,225 de exactitud estricta en MMLU CoT indica que el formato de respuesta exacto falla en la mayoria de casos, aunque el extractor flexible suba al 0,548.
- Idioma: el modelo solo declara soporte de ingles. El uso en castellano no esta garantizado ni evaluado.
- Bucles de repeticion: la model card advierte que la decodificacion greedy en generaciones largas produce bucles de repeticion. Es obligatorio usar muestreo con los parametros recomendados.
- Dependencia de kernels: sin `flash-linear-attention` y `causal_conv1d` compilados, el rendimiento y el consumo de memoria se degradan de forma severa.
- Contexto largo en la practica: aunque el contexto nativo es de 262.144 tokens, no se han publicado evaluaciones de recuperacion de informacion en ventanas extensas ni cifras de memoria asociadas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el publicador es un usuario comunitario (htb-ac-1424625) y no el equipo original de Empero. Conviene verificar la procedencia y la trazabilidad de los pesos antes de integrarlos en produccion.
- Adopcion nula: cero descargas y una sola valoracion. No existen evaluaciones independientes, auditorias ni informes de terceros sobre este artefacto concreto.
- Capacidades de vision inciertas: la etiqueta `image-text-to-text` sugiere soporte multimodal, pero la model card describe explicitamente la "ruta de texto", por lo que no debe asumirse entrada de imagenes sin verificacion.
- Contenido de la model card: las afirmaciones sobre el profesor Qwen3.8 2.4T A95B y los datasets internos de Empero no son verificables de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Modelo padre destilado: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Hermano de mayor tamano: https://huggingface.co/empero-ai/Qwen3.8-9B
- Hermano de tamano intermedio: https://huggingface.co/empero-ai/Qwen3.8-4B
- Heretic (herramienta de abliteration): https://heretic-project.org
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- Empero (desarrollador del modelo original): https://empero.org
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo. Los resultados devueltos corresponden a Hack The Box y a documentacion sobre alta tension electrica (HTB), sin relacion con el modelo. No hay papers, blogs ni demos adicionales disponibles.
