# mr-andrey-isachenko/Tenet-Qwen3.6-35B-A3B-Abliterated-Unslop-v3-GGUF

## Resumen

Tenet-Qwen3.6-35B-A3B-Abliterated-Unslop-v3-GGUF es la distribucion en formato GGUF del fine-tune Tenet-35B-A3B-Qwen3.6-Unslop-v3, publicado por mr-andrey-isachenko. El modelo base subyacente es Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales (unos 35.500 millones) y, segun la nomenclatura A3B, aproximadamente 3.000 millones de parametros activos por token. Sobre esa base, el autor aplica un proceso de "de-refusal" (abliteration) y "de-slop" mediante lo que denomina motor Lancet, orientado a eliminar rechazos y comportamientos de relleno.

La relevancia de esta ficha no esta en el modelo base, sino en el metodo de cuantizacion. El autor no usa un pase uniforme de `llama-quantize`, sino una receta mixta guiada por CKA (analisis de similitud de representaciones) que mantiene a mayor precision las capas que sostienen el subespacio quirurgico de la ablacion, asi como el router MoE y los expertos compartidos. El objetivo declarado es que el comportamiento de rechazo eliminado no "reaparezca" al bajar a 4-6 bits.

El repositorio ocupa 135,7 GB y contiene una escalera de cuantizaciones desde IQ4_XS (20,30 GB) hasta Q8_0 (37,80 GB), pensadas para llama.cpp, Ollama, LM Studio y Jan. La licencia declarada es Apache 2.0. No hay informacion sobre idiomas soportados ni sobre el contexto nativo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 (unos 35.500 millones) |
| Parametros activos | Aproximadamente 3.000 millones por token (denominacion A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (receta mixta CKA con capas protegidas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en otros formatos, no detallados aqui |
| Tamano del repositorio | 135,7 GB |
| Cuantizacion IQ4_XS | 20,30 GB |
| Cuantizacion Q4_K_M | 22,34 GB |
| Cuantizacion Q5_K_M | 25,80 GB |
| Cuantizacion Q6_K | 29,48 GB |
| Cuantizacion Q8_0 | 37,80 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts basado en Qwen3.6-35B-A3B, con unos 35.500 millones de parametros totales y aproximadamente 3.000 millones activos por token. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la fase base de Qwen. Sobre esa base, el autor aplica un fine-tune de "de-refusal" (abliteration) y "de-slop" mediante el motor Lancet, cuyo funcionamiento interno no se describe en la informacion disponible.

La innovacion tecnica documentada esta en la cuantizacion. La receta `cka_quant_recipe.json` define un subespacio quirurgico de capas seleccionadas (22 a 29). Las capas 22, 23, 24 y 25 se mantienen en Q8_0 y las capas 26, 27, 28 y 29 en Q6_K, mientras el resto puede bajar a 4 bits. Ademas, los tensores de routing de expertos (`ffn_gate_inp`) y los pesos de expertos compartidos se conservan en BF16 o Q8_0 para que los logits de la compuerta permanezcan identicos a los de la salida de la cirugia. El autor afirma que un pase uniforme de `llama-quantize` degrada silenciosamente estos tensores y puede reintroducir el comportamiento de rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de problemas (segun los benchmarks reportados, con resultados dispares: alto en GSM8K, nulo en MATH-500).
- Generacion de codigo, segun los tags del repositorio.
- Uso de herramientas y function calling (tags `tool-use` y `agentic`).
- Flujos agente y razonamiento multi-paso (tags `agentic`).
- Comportamiento "uncensored" y "abliterated": supresion deliberada de rechazos ante peticiones que el modelo base rechazaria.
- Reduccion de "slop" (relleno y respuestas genericas), segun la denominacion del autor.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional sin filtros: el modelo esta disenado para mantener conversaciones multi-turno sin los rechazos tipicos del modelo base, util para prototipos de personajes o simulaciones donde el filtrado estandar resulta obstructivo.
- Generacion de codigo en local: con soporte declarado de tool calling y cuantizaciones de 20-25 GB, puede integrarse en entornos de desarrollo con GPU de consumo alta para autocompletado y generacion de funciones.
- Pipelines agente con herramientas: los tags `agentic` y `tool-use` indican uso previsto en flujos donde el modelo invoca funciones externas; la preservacion del router MoE en la cuantizacion busca mantener estable el comportamiento de seleccion de expertos en estos flujos.
- Despliegue en estaciones de trabajo sin conexion: al distribuirse en GGUF para llama.cpp, Ollama y LM Studio, permite inferencia totalmente local en equipos con 24-48 GB de VRAM o RAM unificada.
- Investigacion sobre abliteration y cuantizacion: el repositorio incluye la receta CKA y la jerarquia de capas protegidas, lo que lo convierte en un caso de estudio reproducible sobre como preservar modificaciones quirurgicas al cuantizar modelos MoE.
- Evaluacion comparativa de "de-slop": util para medir si la reduccion de relleno se mantiene tras cuantizar, comparando las distintas versiones de la escalera (IQ4_XS frente a Q8_0).
- Fine-tuning posterior sobre una base sin rechazos: el modelo puede servir como punto de partida para ajustes especificos de dominio donde el filtrado del modelo original interferiria.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint padre en FP8 (Tenet-35B-A3B-Qwen3.6-Unslop-v3); el autor afirma que la escalera CKA los conserva dentro del ruido de medicion.

| Benchmark | Resultado |
|---|---|
| IFEval (strict) | 0,83 |
| IFEval (instruction strict) | 0,88 |
| MATH-500 | 0,00 |
| GSM8K (strict) | 0,95 |
| GPQA Diamond | 0,45 |
| MMLU-Pro | 0,74 |

No se han publicado resultados de benchmarks especificos de las cuantizaciones GGUF de esta ficha, ni comparativas con modelos similares en la informacion disponible. El resultado de 0,00 en MATH-500 es llamativo y debe interpretarse con cautela: puede reflejar un fallo de formato en la evaluacion o una degradacion real del fine-tune en ese dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,3 GB (IQ4_XS), 22,3 GB (Q4_K_M), 25,8 GB (Q5_K_M), 29,5 GB (Q6_K) y 37,8 GB (Q8_0), mas overhead de contexto KV cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para las cuantizaciones altas; RTX 4090 (24 GB) para IQ4_XS y Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con IQ4_XS o Q4_K_M; Q5_K_M y superiores requieren 32 GB o mas, o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio y Jan. vLLM y TGI no estan indicados en la model card para estos pesos GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 3.000 millones de parametros activos, el throughput por token deberia ser notablemente superior al de un modelo denso de 35.000 millones, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-Qwen3.6-35B-A3B-Abliterated-Unslop-v3-GGUF | 35.500 M | ~3.000 M | No disponible | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | 35.500 M | ~3.000 M | No disponible | No disponible en esta ficha | No disponible |
| Tenet-35B-A3B-Qwen3.6-Unslop-v3 (padre FP8) | 35.500 M | ~3.000 M | No disponible | Apache 2.0 (segun este repo) | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros autores. La comparativa se limita a parametros, licencia y formato segun la informacion disponible.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar rechazos; puede producir contenido danino, sesgado o inapropiado sin las salvaguardas del modelo original. No es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad; el resultado de 0,00 en MATH-500 sugiere posibles problemas de formato o de razonamiento matematico que deben verificarse.
- La ablacion puede degradar capacidades generales del modelo base; no hay evaluaciones publicadas que cuantifiquen esa perdida frente a Qwen3.6-35B-A3B original.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingue.
- Longitud de contexto: no disponible; el ejemplo de la model card usa `-c 16384`, lo que sugiere que 16K es un valor probado, pero no confirma el maximo.
- La licencia Apache 2.0 se declara en este repositorio, pero el modelo base Qwen y el fine-tune padre deberian verificarse por separado antes de uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente de la receta CKA.
- La preservacion del router MoE en BF16/Q8_0 implica que las cuantizaciones bajas no reducen tanto el tamano como un pase uniforme equivalente; el ahorro real puede ser menor de lo que sugiere la etiqueta de bits.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-Qwen3.6-35B-A3B-Abliterated-Unslop-v3-GGUF
- Modelo padre (fine-tune): https://huggingface.co/mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Receta de cuantizacion CKA: `cka_quant_recipe.json` en el repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
