# mradermacher/Llama-2-7b-story-finetune-GGUF

## Resumen

`mradermacher/Llama-2-7b-story-finetune-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `Sameer360/Llama-2-7b-story-finetune`, un ajuste fino de Llama 2 de 7.000 millones de parametros orientado a la generacion de narrativa y relatos en ingles. El trabajo de cuantizacion lo firma mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo base es un fine-tune de Meta Llama 2, por lo que hereda la arquitectura transformer decoder-only, el contexto nativo de 4.096 tokens y el tokenizador de Llama 2.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de narracion de 7B en hardware de consumo (desde 2,6 GB en Q2_K hasta 13,6 GB en f16), sin necesidad de GPU de datacenter. No obstante, se trata de un fine-tune comunitario con muy poca traccion (28 descargas, 0 likes en el momento de la consulta) y sin documentacion tecnica publicada sobre el dataset o el proceso de entrenamiento, lo que limita su uso en produccion seria.

Conviene subrayar que esta ficha describe la version cuantizada, no el modelo original: los pesos GGUF son identicos en comportamiento al fine-tune de Sameer360, pero con perdida de precision segun el nivel de cuantizacion elegido. La licencia no esta declarada en el repositorio, lo que introduce incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), segun modelo base |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredado de Llama 2; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | GGUF (multiples archivos por nivel de cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Llama 2 7B, un transformer decoder-only con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No se ha publicado informacion sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, la composicion de los datos ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. El nombre del modelo sugiere un entrenamiento orientado a generacion de relatos ("story"), pero no hay documentacion que lo confirme.

La contribucion tecnica de este repositorio es exclusivamente la cuantizacion: mradermacher ha generado quants estaticos (no imatrix, segun indica el propio autor) usando llama.cpp. La model card aclara que no hay quants ponderados/imatrix disponibles "por el momento" y que, si no aparecen en una semana, probablemente no se planifiquen. No se documenta ninguna innovacion arquitectonica adicional sobre Llama 2.

## Capacidades

- Generacion de texto narrativo en ingles: relatos, ficcion corta y continuaciones, presumiblemente el objetivo del fine-tune.
- Generacion de texto general y conversacion basica, heredadas de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas simples.
- No hay evidencia de soporte de tool calling o function calling en la model card.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles declarado; Llama 2 tenia cobertura parcial de otros idiomas, pero el fine-tune no lo documenta.
- No dispone de vision, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).

## Casos de uso

- Generacion de ficcion y relatos cortos en ingles: el modelo se puede cargar en llama.cpp u Ollama y usarse para producir borradores narrativos o continuaciones de texto, aprovechando su ajuste especifico en dominio "story".
- Prototipado local en hardware de consumo: con Q4_K_M (4,2 GB) se puede ejecutar en una GPU de 8 GB o incluso en CPU, lo que permite experimentar con generacion narrativa sin infraestructura cloud.
- Herramientas de escritura creativa offline: integrable en editores o scripts que necesiten sugerencias de texto sin enviar datos a un servicio externo.
- Educacion y experimentacion: util como caso de estudio de fine-tuning comunitario y de cuantizacion GGUF en cursos o talleres.
- Generacion de contenido de bajo coste en ingles: para tareas no criticas donde la calidad no sea determinante y el coste computacional sea la prioridad.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con llama.cpp, Ollama o servidores compatibles con GGUF antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~2,6 GB; Q3_K_S ~3,0 GB; Q4_K_M ~4,2 GB; Q5_K_M ~4,9 GB; Q6_K ~5,6 GB; Q8_0 ~7,3 GB; f16 ~13,6 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4-Q8; RTX 4090 o A100/H100 para f16 y para mayor throughput.
- Cabe en GPU de consumo: si, desde GPUs de 4-6 GB con cuantizaciones bajas (Q2_K, Q3_K_S) hasta 12-16 GB para Q6_K/Q8_0.
- Tambien es viable en CPU con llama.cpp, especialmente en Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en Hugging Face Endpoints. No hay soporte nativo de vLLM o TGI para GGUF en el momento de la consulta.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Llama-2-7b-story-finetune-GGUF | 6,74 B | 4.096 (heredado) | no disponible | GGUF | Fine-tune comunitario de narrativa; sin benchmarks |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 | Llama 2 Community License | safetensors, GGUF (via terceros) | Base oficial con licencia clara y amplia adopcion |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto 8x mayor, licencia permisiva, mejor rendimiento general documentado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto mayor, multilingue, benchmarks publicados |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base Llama 2 tiene su propia licencia comunitaria que puede aplicar.
- Fine-tune comunitario sin documentacion de entrenamiento: se desconoce el dataset, el proceso y los posibles sesgos introducidos.
- Riesgo elevado de alucinacion, especialmente en tareas factuales; el ajuste esta orientado a narrativa, no a precision.
- Contexto limitado a 4.096 tokens (heredado de Llama 2), insuficiente para documentos largos o conversaciones extensas.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- No hay quants imatrix/ponderados, que suelen ofrecer mejor calidad por tamano.
- Traccion minima (28 descargas, 0 likes): sin validacion de la comunidad ni reportes de calidad.
- No apto para produccion critica sin evaluacion previa propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-2-7b-story-finetune-GGUF
- Modelo base (fine-tune): https://huggingface.co/Sameer360/Llama-2-7b-story-finetune
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-2-7b-story-finetune-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
