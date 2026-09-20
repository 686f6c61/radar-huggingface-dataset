# g-assismoraes/DeltaP2S-Llama2-13B-SameFormula-ptbr-S13-a050

## Resumen

DeltaP2S-Llama2-13B-SameFormula-ptbr-S13-a050 es un checkpoint fusionado (merged) publicado por el usuario g-assismoraes bajo el identificador que combina la tecnica de fusion "Delta-P2S" (etiquetas `delta-p2s` y `pen2sword`) con el modelo base Llama-2 de 13B. Segun la model card, se trata de un "merged checkpoint produced by the family-aware Delta-P2S experiment package", es decir, el resultado de un paquete experimental de fusion de pesos que toma como base de entrenamiento `meta-llama/Llama-2-13b-hf`. El nombre incluye el sufijo `ptbr`, que apunta a un ajuste o variante orientada a portugues de Brasil, aunque la model card no lo confirma.

El repositorio tiene un caracter puramente experimental y de investigacion: acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia ni idiomas, y su model card es minima (practicamente solo indica la base de entrenamiento). El peso real declarado en safetensors es de 13.015.864.320 parametros, coherente con un modelo denso de la familia Llama-2-13B, y el repositorio ocupa 26,0 GB, lo que corresponde a pesos en precision fp16/bf16.

Su relevancia actual es limitada y acotada al ambito de la investigacion sobre tecnicas de fusion de modelos (model merging) y a la reproducibilidad de experimentos concretos de la familia Delta-P2S. No es un modelo pensado para produccion: no hay documentacion de entrenamiento, no hay evaluacion publicada y no se especifican restricciones de uso. Cualquier adopcion deberia tratarse como la de un artefacto de laboratorio sin garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del checkpoint base Llama-2-13B (no confirmado de forma explicita en la model card) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Llama-2-13B (4096 tokens) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors fp16/bf16); convertible a int8/int4 con herramientas externas |
| Idiomas soportados | no disponible (el sufijo `ptbr` del identificador sugiere portugues de Brasil, sin confirmar) |
| Licencia | no disponible en el repositorio; el checkpoint base Llama-2 esta sujeto a la Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. Lo unico documentado es que el checkpoint es el resultado de un "family-aware Delta-P2S experiment package" que parte de `meta-llama/Llama-2-13b-hf`. Por el identificador y las etiquetas (`delta-p2s`, `pen2sword`), se trata de un proceso de fusion o interpolacion de pesos, no de un entrenamiento desde cero ni de un fine-tuning convencional con RLHF/DPO documentado. El sufijo `SameFormula` y `S13 a050` parecen referirse a la configuracion concreta del experimento (formula de fusion, escala/seed y coeficiente alpha 0,050), pero no hay informacion publicada que permita interpretarlos con certeza.

Al ser un modelo derivado de Llama-2-13B, se le presupone la arquitectura estandar de esa familia: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion multi-cabeza. No obstante, no se ha publicado ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo alineacion posterior. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion por ventanas, etc.). Cualquier afirmacion sobre el entrenamiento mas alla de "checkpoint fusionado sobre Llama-2-13B" seria especulacion.

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del base Llama-2-13B, sin evaluacion publicada especifica para este checkpoint.
- Razonamiento y conocimiento general: presumiblemente equivalente al de la base, aunque la fusion de pesos puede degradar o alterar el comportamiento de forma no documentada.
- Generacion de codigo y matematicas: no hay evidencia publicada que confirme un rendimiento concreto.
- Multilingue: el identificador incluye `ptbr`, lo que sugiere un sesgo hacia portugues de Brasil, pero la model card no declara idiomas soportados.
- Tool calling / function calling: no documentado; Llama-2 base no tiene soporte nativo de tool calling.
- Modo agente o razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no documentado; no hay indicios de que sea multimodal.

## Casos de uso

- Investigacion en fusion de modelos: el checkpoint sirve como artefacto reproducible para estudiar como la tecnica Delta-P2S y el coeficiente `a050` afectan al comportamiento respecto al base Llama-2-13B.
- Experimentos de ablation: comparar este checkpoint con otras variantes de la misma familia (otras escalas S, otros alphas) para medir el efecto de la fusion en tareas controladas.
- Reproducibilidad academica: validar resultados de un paper o paquete experimental que use Delta-P2S como metodo de merging.
- Evaluacion de degradacion por merging: medir si la fusion introduce regresiones en perplexity o en tareas especificas frente al modelo original.
- Fine-tuning posterior controlado: usar el checkpoint como punto de partida para experimentos de ajuste sobre portugues de Brasil, asumiendo la falta de garantias de licencia.
- Docencia y demostraciones tecnicas: ilustrar en un entorno academico como se distribuye y carga un checkpoint fusionado de 13B con `transformers`.
- Analisis de artefactos de peso: inspeccionar diferencias de pesos entre este checkpoint y `meta-llama/Llama-2-13b-hf` para caracterizar la fusion.

Nota: no se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo critico ni toma de decisiones automatizadas, dada la ausencia total de evaluacion, licencia e idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, perplexity ni similares) y la model card no menciona ningun conjunto de pruebas. Cualquier cifra de rendimiento seria inventada, por lo que no se incluye comparativa numerica.

## Requisitos de hardware

Estimaciones derivadas del numero real de parametros (13.015.864.320) y del tamano del repositorio (26,0 GB); no proceden de documentacion oficial del modelo:

- VRAM para inferencia en fp16/bf16: aproximadamente 26 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 28-32 GB.
- VRAM en int8: aproximadamente 13-15 GB de pesos.
- VRAM en int4 (GPTQ, AWQ o GGUF Q4): aproximadamente 7-9 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB cubren fp16 sin problemas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en fp16 con cuantizacion parcial o, de forma mas comoda, en int8; en int4 cabe holgadamente en 12 GB (RTX 3060 12 GB, RTX 4070, etc.).
- Multi-GPU: dos RTX 4090 de 24 GB permiten fp16 con tensor parallelism.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp y Ollama tras conversion a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeltaP2S-Llama2-13B-SameFormula-ptbr-S13-a050 | 13.015.864.320 | no disponible (base: 4096) | no disponible | 0 descargas, 0 likes | Checkpoint fusionado experimental, sin evaluacion |
| meta-llama/Llama-2-13b-hf | 13B | 4096 | Llama 2 Community License | Ampliamente disponible | Modelo base del que deriva; documentado y evaluado |
| meta-llama/Llama-2-13b-chat-hf | 13B | 4096 | Llama 2 Community License | Ampliamente disponible | Variante alineada para dialogo; no es el origen de este checkpoint |
| Mistral-7B-v0.1 | 7B | 8192 | Apache 2.0 | Ampliamente disponible | Alternativa de menor tamano y contexto mayor, de otra familia |

No se dispone de comparativas de rendimiento (MMLU, HumanEval, GSM8K) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexity, ni pruebas cualitativas publicadas; el comportamiento real del checkpoint es desconocido.
- Riesgo de degradacion por fusion: la interpolacion de pesos puede producir regresiones en coherencia, repeticion o conocimiento factual que no se detectan sin evaluacion.
- Alucinacion: al derivar de Llama-2-13B, mantiene la propension del base a generar contenido plausible pero incorrecto; la fusion puede agravarla.
- Idiomas no declarados: aunque el identificador sugiere portugues de Brasil (`ptbr`), no hay confirmacion; el comportamiento multilingue es incierto.
- Licencia no disponible: el repositorio no declara licencia, lo que impide determinar si el uso comercial es legal. El checkpoint base Llama-2 esta sujeto a la Llama 2 Community License (con restricciones de uso, incluida la clausula de 700 millones de usuarios mensuales y la prohibicion de usos prohibidos por la politica de Meta).
- Opacidad del proceso: no se documentan los datos de merging, los datasets intermedios ni la formula exacta de Delta-P2S, lo que impide auditar el origen de los pesos.
- Sin soporte ni mantenimiento: 0 descargas y 0 likes indican un artefacto sin comunidad, sin issues resueltos y sin garantia de actualizacion.
- No apto para produccion: no debe integrarse en sistemas criticos, atencion al cliente ni pipelines automatizados sin evaluacion previa y aclaracion de licencia.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-20, dato que conviene verificar antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-SameFormula-ptbr-S13-a050
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-hf
- Variante de dialogo del base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- No se han encontrado papers, blogs o repositorios adicionales especificos de Delta-P2S o Pen2Sword en la busqueda web realizada.
