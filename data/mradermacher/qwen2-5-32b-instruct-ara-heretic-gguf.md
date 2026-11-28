# mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, una variante del Qwen2.5-32B-Instruct de Alibaba a la que se le ha aplicado una tecnica de eliminacion de rechazos (refusal removal, tambien etiquetada como abliterated o decensored). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, mientras que el modelo base modificado procede de Richard J. Young, que lo distribuye bajo acceso condicionado para investigacion en seguridad de IA.

El modelo conserva la arquitectura y el tamano del Qwen2.5-32B-Instruct original: 32.763.876.352 parametros (aproximadamente 32,8 mil millones), pesos en safetensors en su version original y una ventana de contexto de 32.768 tokens (dato del modelo Qwen2.5 subyacente; no se explicita en la model card del derivado). La intervencion heretic elimina total o parcialmente los comportamientos de rechazo del modelo alineado, de modo que responde a peticiones que el original declinaria.

Es relevante ahora porque permite ejecutar localmente, con llama.cpp y sus derivados, un modelo de 32B sin las restricciones de seguridad del Qwen2.5 original, lo que lo hace util para red-teaming, evaluacion de alineamiento y experimentacion, pero tambien peligroso para despliegue en produccion sin salvaguardas externas. La licencia declarada en el repo es Apache-2.0, heredada del Qwen2.5-32B-Instruct original, aunque la model card del modelo base incluye clausulas de acceso condicionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del Qwen2.5-32B-Instruct; no explicitada en la model card del derivado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (declarado); el Qwen2.5 original soporta multiples idiomas, pero el derivado solo declara ingles |
| Licencia | Apache-2.0 (repo); el modelo base usa acceso condicionado con campos gated y terminos openrail++ en tags |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base original |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-32B-Instruct: un transformer decoder-only denso con 64 capas, atencion con RoPE, GQA (grouped-query attention) con 40 cabezas de consulta y 8 de clave/valor, y una cabeza de salida con tokenizer de ~152k tokens (datos del Qwen2.5-32B original; no se detallan en la model card del derivado). El entrenamiento original de Qwen2.5 incluye preentrenamiento sobre 18 billones de tokens y un pipeline de post-entrenamiento con SFT y RLHF/DPO, segun la documentacion publica de Alibaba.

Sobre esa base, el autor del modelo intermedio (richardyoung) aplico una tecnica de refusal removal etiquetada como "heretic" y "ARA" (ablation of refusal activations, segun la nomenclatura habitual en este tipo de trabajos). El proceso tipico consiste en identificar direcciones de activacion asociadas a rechazos y ablacionarlas o proyectarlas fuera del espacio de activaciones, sin reentrenamiento completo. La model card no documenta el dataset, el numero de tokens ni los detalles exactos del procedimiento, por lo que estos datos deben considerarse no disponibles. mradermacher se limita a generar las cuantizaciones GGUF estaticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato HF.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, orientada a chat.
- Razonamiento y respuesta a instrucciones heredadas del Qwen2.5-32B-Instruct (matematicas, codigo, analisis).
- Ausencia (o reduccion drastica) de rechazos ante peticiones que el modelo alineado declinaria, por el proceso heretic/abliterated.
- Soporte de tool calling y function calling heredado del Qwen2.5 original (no verificado en el derivado).
- Capacidad de seguir instrucciones complejas y formatos estructurados (JSON, plantillas), segun el modelo base.
- Capacidades multilingues del Qwen2.5 original (chino, espanol, frances, etc.), aunque el derivado solo declara ingles.
- No incluye vision ni audio (Qwen2.5-32B-Instruct es solo texto).

## Casos de uso

- Red-teaming y evaluacion de alineamiento: el modelo sirve como sujeto de prueba para medir la eficacia de filtros y clasificadores de seguridad, ya que genera respuestas que el modelo original rechazaria.
- Investigacion en seguridad de IA: permite estudiar como la ablacion de direcciones de rechazo afecta a la coherencia, la utilidad y los sesgos del modelo, comparandolo con el Qwen2.5-32B-Instruct sin modificar.
- Experimentacion personal en local: con cuantizaciones Q4_K_M (~20 GB) se puede ejecutar en una GPU consumer de 24 GB (RTX 3090/4090) o en CPU con llama.cpp, para prototipos de chat sin dependencia de API.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que el modelo alineado podria rechazar por temas sensibles, siempre que el usuario asuma la responsabilidad legal y etica.
- Docencia y cursos sobre alineamiento: ilustrar en clase la diferencia entre un modelo alineado y uno abliterated, con ejemplos controlados y supervision.
- Evaluacion comparativa de cuantizaciones: usar las distintas variantes (Q2_K a Q8_0) para medir la degradacion de calidad en tareas de razonamiento y seguir la curva perplexity/tamano publicada por mradermacher.
- Base para fine-tuning especifico: al estar en GGUF no es ideal para entrenamiento, pero el modelo base en safetensors (richardyoung/Qwen2.5-32B-Instruct-ARA-heretic) puede servir de punto de partida para adaptaciones LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con el Qwen2.5-32B-Instruct original. Solo se aporta un grafico externo de ikawrakow sobre calidad relativa de tipos de cuantizacion (perplexity), no resultados de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12,4 GB (Q2_K), ~18,9 GB (Q4_K_S), ~20,0 GB (Q4_K_M), ~23,4 GB (Q5_K_M), ~27,0 GB (Q6_K), ~34,9 GB (Q8_0). A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_S; RTX 4080 (16 GB) solo para Q3_K_M o inferiores.
- Cabe en GPU consumer: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o Q5_K_S; en GPUs de 16 GB solo con Q3_K_M o Q2_K, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con la API de OpenAI (el repo incluye el tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del backend, la GPU y la cuantizacion; en una RTX 4090 con Q4_K_M se puede esperar decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF | 32,8 B | 32.768 (heredado) | Apache-2.0 (repo) | GGUF | Derivado abliterated, solo ingles declarado |
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32,8 B | 32.768 (heredado) | Acceso condicionado / openrail++ | safetensors | Modelo base del que se cuantiza; requiere solicitud |
| Qwen/Qwen2.5-32B-Instruct | 32,8 B | 32.768 | Apache-2.0 | safetensors, GGUF (comunidad) | Modelo alineado original, con rechazos |
| Dolphin 2.9.4 (variantes Llama 3 / Qwen) | 8-70 B | variable | Apache-2.0 / otros | GGUF, safetensors | Familia uncensored comparable en filosofia, distinto tamano |

No hay datos de rendimiento comparativo publicados en la informacion disponible, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El proceso heretic/abliterated elimina salvaguardas: el modelo puede generar contenido danino, ilegal o eticamente problematico sin rechazo. No es apto para produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion y de respuestas plausibles pero falsas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- La model card del modelo base exige acceso condicionado y declara uso previsto de investigacion en seguridad; el repo GGUF de mradermacher declara Apache-2.0, lo que genera una ambiguedad legal sobre el uso comercial del derivado.
- Solo se declara ingles; el rendimiento en espanol u otros idiomas, aunque el Qwen2.5 original los soporte, no esta verificado en este derivado.
- La cuantizacion introduce degradacion medible de calidad; Q4_K_M es el punto de equilibrio recomendado, Q8_0 preserva mas fidelidad a costa de ~35 GB.
- Contexto de 32.768 tokens: insuficiente para documentos muy largos; ademas, el KV cache a contexto completo requiere VRAM adicional significativa.
- Sesgos heredados del Qwen2.5 original (occidentalizacion, sesgos de genero y culturales) y posible exacerbacion al eliminar los rechazos.
- No hay garantia de soporte de tool calling en el derivado; conviene validarlo antes de integrarlo en pipelines de agentes.
- Uso responsable: el autor pide citar su trabajo y limitar el uso a investigacion; el despliegue comercial exige revision legal propia.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Variantes imatrix: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- CV del autor del modelo base: https://cv.deepneuro.ai
- Perfil de Richard J. Young: https://huggingface.co/richardyoung
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
