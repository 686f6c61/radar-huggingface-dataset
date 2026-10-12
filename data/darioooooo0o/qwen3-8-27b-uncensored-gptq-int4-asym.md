# darioooooo0o/Qwen3.8-27B-Uncensored-GPTQ-Int4-asym

## Resumen

Qwen3.8-27B-Uncensored-GPTQ-Int4-asym es una cuantización a 4 bits en formato GPTQ asimétrico del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es un ajuste fino "abliterated" (con el comportamiento de rechazo eliminado) de Qwen/Qwen3.8-27B realizado por OrcaRouter. La publicación corre a cargo del usuario de HuggingFace darioooooo0o, que la construyó con el objetivo explícito de servir el modelo completo en una única tarjeta Intel Arc Pro B70, un escenario de hardware profesional de gama media con 275 W de consumo.

El modelo es multimodal (pipeline image-text-to-text) e incorpora una torre de visión, una cabeza MTP (multi-token prediction) y módulos GDN en las capas internas, lo que apunta a una arquitectura híbrida de atención propia de la familia Qwen3.5/Qwen3.8. La cuantización deja en BF16 la torre de visión, la cabeza MTP y el lm_head, de modo que las partes sensibles a la precisión no se degradan. El resultado es un artefacto de 19,6 GB con 27.781.427.952 parámetros totales que, según el autor, conserva una divergencia KL de 0,038 sobre los top-20 logits frente al modelo base en BF16.

Su relevancia es doble. Por un lado, demuestra que es viable ejecutar un modelo de ~27,8 B multimillonario con visión y 262.144 tokens de contexto en una sola GPU de Intel, con vLLM sobre XPU, algo poco documentado hasta ahora. Por otro lado, al heredar el comportamiento sin rechazos del modelo base, carece de salvaguardas integradas relevantes, lo que lo hace útil para investigación sobre alineación y evaluación de riesgos, pero problemático para despliegues de producción sin capas de moderación externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (tag `qwen3_5`), con torre de vision, cabeza MTP y modulos GDN (`in_proj_a`/`in_proj_b`); detalle completo de capas no disponible |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion probada por el autor; pool de KV de ~320.000 tokens |
| Tipos de cuantizacion | GPTQ int4 asimetrico (`sym: false`), group size 128, escala + zero por grupo, busqueda de clip sobre 11 ratios; esta publicacion contiene unicamente la version int4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato GPTQ v1 estandar (`qzeros` almacena z-1); tamano del repo 19,6 GB |

## Arquitectura y entrenamiento

La publicacion no aporta detalles sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), dato que habria que consultar en la model card de Qwen/Qwen3.8-27B o de orcarouter/Qwen3.8-27B-Uncensored. Lo que si se deduce de los modulos citados es una arquitectura hibrida: el autor menciona explicitamente que no cuantiza la torre de vision, las capas MTP ni los modulos GDN `in_proj_a` e `in_proj_b`, lo que sugiere capas con atencion lineal de tipo Gated DeltaNet combinadas con atencion clasica, ademas de decodificacion especulativa mediante la cabeza MTP (k=4).

El proceso de cuantizacion si esta documentado con detalle. Se uso la herramienta `b70quant.py` del repositorio riceharvest/b70-qwen38-cookbook, con GPTQ (damping 0,01, act-order desactivado), cuantizacion asimetrica uint4 con escala y punto cero por grupo, y una busqueda de recorte (clip search) sobre 11 ratios minimizando |err|^2.4. La calibracion empleo 128 ventanas de 2048 tokens con una mezcla de conversaciones privadas (no publicadas), texto de razonamiento y agentico, codigo y prosa tecnica, disjuntas de las ventanas de evaluacion. El proceso capa a capa tardo aproximadamente una hora en la B70. Todo el trabajo de cuantizacion se hizo en una sola tarjeta Intel Arc Pro B70, un caso poco habitual en un ecosistema dominado por CUDA.

## Capacidades

- Generacion de texto conversacional multi-turno, con especial atencion al contexto largo: la configuracion probada soporta 262.144 tokens.
- Procesamiento de imagenes (pipeline `image-text-to-text`): la torre de vision se mantiene en BF16, por lo que no sufre la perdida de precision del resto del modelo.
- Razonamiento y contenido tecnico: la calibracion incluye texto de razonamiento, agentico, codigo y prosa tecnica, y las metricas de divergencia se reportan desglosadas por dominio (chat privado, codigo, prosa tecnica).
- Decodificacion especulativa mediante cabeza MTP con k=4, integrada en el flujo de vLLM XPU del cookbook.
- Generacion sin rechazos ("abliterated"): el modelo hereda del base la eliminacion del comportamiento de rechazo, lo que constituye una capacidad tecnica pero tambien un riesgo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque parte del corpus de calibracion es texto agentico.
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion sobre alineacion y comportamiento de rechazo: al ser un modelo abliterated cuantizado, permite estudiar hasta que punto la cuantizacion a int4 preserva o altera las propiedades del ajuste sin rechazos, comparando su divergencia KL (0,038) con la del base en BF16.
- Despliegue en hardware Intel Arc: el caso de uso para el que fue construido. Una sola Arc Pro B70 a 275 W sirve el modelo completo con vision, contexto de 262K y KV en fp8, lo que habilita inferencia local en entornos sin GPUs NVIDIA.
- Analisis de documentos tecnicos con imagenes: la combinacion de 262K de contexto y torre de vision en BF16 permite pasar manuales, planos o capturas extensas junto con texto largo en una sola peticion.
- Generacion y revision de codigo en local: el autor reporta una divergencia KL de 0,040 en el dominio de codigo frente al base BF16, la segunda mas baja de su tabla, lo que lo hace razonable para asistencia de programacion en maquinas sin conexion.
- Procesamiento por lotes de contexto largo en investigación: con prefill de ~2.050 tok/s a 6K y ~1.450 tok/s a 74K, es viable indexar o resumir corpus largos en una sola tarjeta, aunque con throughput limitado.
- Prototipado de asistentes conversacionales sin filtros para evaluacion de riesgos: util para equipos de seguridad que necesitan un modelo que no se niegue a responder, siempre que se aplique moderacion externa antes de exponerlo a usuarios finales.
- Banco de pruebas para kernels y parches de cuantizacion asimetrica: el modelo sirve como caso de prueba real para validar el soporte de GPTQ asimetrico en vLLM XPU (el autor publica `patch_asym_gptq.py` porque la version estandar no lo carga bien).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si reporta metricas de fidelidad de la cuantizacion frente al modelo base en BF16, medidas como divergencia KL sobre los top-20 logits en ventanas retenidas de 2048 tokens (menor es mejor):

| Configuracion | Chat privado | Codigo | Prosa tecnica | Global | Acierto top-1 |
|---|---|---|---|---|---|
| GPTQ int4 simetrico g128 (receta habitual) | 0,038 | 0,078 | 0,096 | 0,069 | 91,9 % |
| Esta cuantizacion (asimetrica) | 0,018 | 0,040 | 0,060 | 0,038 | 94,1 % |

El autor indica ademas que la version servida (con lm_head en fp8) mide KL 0,039 de extremo a extremo, y que en un canario aritmetico de 6 preguntas codiciosas cercanas al empate obtiene 5/6 frente a 4/6 del GPTQ simetrico; el propio autor califica ese resultado como ruido. En una version de 100 preguntas sobre el modelo original no se observaron diferencias reales entre cuantizaciones.

Rendimiento medido en Intel Arc Pro B70 a 275 W, una peticion simultanea:

| Metrica | Valor |
|---|---|
| Decodificacion, prompts cortos (greedy) | 64-128 tok/s segun contenido (35 ms por paso de verificacion MTP) |
| Decodificacion a 65K de contexto | ~79 tok/s greedy |
| Decodificacion a 100K de contexto | 65-70 tok/s greedy, ~64 tok/s con muestreo (43 / 46 ms por paso) |
| Prefill | ~2.050 tok/s a 6K, ~1.450 tok/s a 74K |
| Contexto | 262.144 tokens, pool de KV de ~320K tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 19,6 GB, por lo que se necesita una GPU con al menos ~20 GB libres para los pesos, mas el pool de KV (fp8 en la configuracion del autor, ~320K tokens de pool). No se especifica el consumo exacto de memoria en la informacion disponible.
- GPU recomendadas: Intel Arc Pro B70 es la unica plataforma verificada por el autor. El formato es GPTQ v1 asimetrico estandar, por lo que deberia cargarse en vLLM, GPTQModel o transformers sobre CUDA, pero el autor advierte que solo lo ha probado en XPU.
- Compatibilidad con GPU de consumo: no se indica. 19,6 GB de pesos exceden las tarjetas de 16 GB, y quedan al limite en modelos de 24 GB (RTX 3090/4090) sin margen para contexto largo.
- Opciones de despliegue: vLLM XPU v0.31.0 con el lanzador y parches de riceharvest/b70-qwen38-cookbook (MTP k=4, KV en fp8). El autor senala que vLLM XPU v0.31 de serie no carga GPTQ asimetrico correctamente sin `patch_asym_gptq.py`. GPTQModel y transformers deberian funcionar en CUDA. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: ver la tabla de la seccion anterior (35-46 ms por paso de decodificacion con MTP k=4, 64-128 tok/s en decodificacion, hasta ~2.050 tok/s en prefill a 6K).

## Comparativa con modelos similares

La informacion disponible permite comparar contra el modelo base en precision completa y contra la receta de cuantizacion simetrica habitual, pero no contra otras publicaciones de terceros.

| Modelo / variante | Parametros | Contexto | Fidelidad (KL global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (BF16, orcarouter) | ~27,8 B | no disponible | referencia (0) | apache-2.0 (segun esta ficha) | publico en HuggingFace |
| GPTQ int4 simetrico g128 sobre la misma base | ~27,8 B | no disponible | 0,069 | apache-2.0 | no publicado por el autor |
| Esta publicacion (GPTQ int4 asimetrico g128) | 27,78 B | 262.144 tokens en la config probada | 0,038 | apache-2.0 | publico en HuggingFace |

Comparativas con alternativas de otros autores (por ejemplo otras cuantizaciones int4 de la familia Qwen) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: el autor advierte explicitamente de que el modelo hereda el comportamiento de rechazo eliminado del base y "no tiene guardarrailes integrados significativos". Cualquier despliegue orientado a usuarios finales requiere moderacion externa.
- Riesgo de alucinacion: no se reportan evaluaciones de veracidad. El modelo base es un ajuste fino abliterated cuyo impacto en la factualidad no esta documentado.
- Degradacion por cuantizacion: aunque baja (KL 0,038 global, 94,1 % de acuerdo top-1), existe perdida de precision. El propio autor detecto un fallo en el canario aritmetico (`sum(i*i for i in range(4))` -> 30), si bien lo califica de ruido por el tamano de la muestra.
- Contexto: los 262.144 tokens corresponden a la configuracion de vLLM XPU del cookbook, no a una especificacion oficial del modelo base. Otros runtimes pueden ofrecer ventanas distintas.
- Compatibilidad de runtime: el soporte de GPTQ asimetrico es incompleto. vLLM XPU v0.31 de serie no lo carga bien sin el parche del cookbook; solo se ha validado en Intel XPU, no en CUDA.
- Calibracion no reproducible: parte del conjunto de calibracion son conversaciones privadas del autor que no se han publicado, de modo que la receta no es reproducible bit a bit.
- Soporte multilingue y de idiomas: no declarado, por lo que no hay garantia de calidad fuera del ingles (o de los idiomas cubiertos por el base).
- Adopcion minima: 0 descargas y 1 "like" en el momento de redactar esta ficha; no hay validacion independiente de las metricas reportadas.
- Licencia: apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Qwen3.8-27B-Uncensored-GPTQ-Int4-asym
- Modelo base de la cuantizacion: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cookbook de inferencia en B70 (lanzador, `b70quant.py`, `patch_asym_gptq.py`): https://github.com/riceharvest/b70-qwen38-cookbook
- Cookbook de inferencia en Intel Arc Pro B70 de SergiioB: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
