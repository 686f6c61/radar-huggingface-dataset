# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-010

## Resumen

`HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-010` es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVA2. Se trata de un checkpoint intermedio —concretamente el paso 10— de una ejecución de entrenamiento identificada como `261017_medicine_online_pilot_seed42`, con semilla 42, orientada presumiblemente a tareas del dominio médico según indica el nombre del run. El repositorio contiene únicamente los pesos resultantes de ese paso, no una model card descriptiva con detalles de dataset, metodología o evaluación.

Con 4.022.468.096 parámetros reales (verificados en los safetensors), el modelo se sitúa en la gama de 4B, lo que lo hace desplegable en hardware de consumo con cuantización. La relevancia de esta publicación es limitada y de carácter experimental: se trata de un artefacto de investigación (paso 10 de un piloto de entrenamiento por refuerzo, con checkpoints nativos de veRL/FSDP conservados en `original_checkpoint/`), sin descargas ni valoraciones, y sin datos publicados de rendimiento.

Por tanto, debe interpretarse como un snapshot reproducible para experimentación interna del grupo que lo publica, no como un modelo listo para producción. La información disponible no permite confirmar el volumen de datos de entrenamiento, la composición del dataset médico ni si el ajuste se completó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507); no se detalla en la model card |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene unicamente pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card. Por herencia del modelo base declarado (Qwen/Qwen3-4B-Instruct-2507) y por el pipeline `text-generation` con `transformers`, se trata de un transformer decoder-only causal de aproximadamente 4.000 millones de parametros, ajustado sobre una base ya instruida. El repositorio incluye un export BF16 en la raiz y, en el subdirectorio `original_checkpoint/`, los ficheros y metadatos exactos del checkpoint nativo generado con veRL y FSDP, lo que sugiere un entrenamiento mediante tecnicas de RL (el stack veRL se emplea habitualmente para RLHF/RLVR) sobre el modelo instruct.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la receta de RL (reward model, rubricas, verifier), hiperparametros ni si hubo fases de SFT/DPO adicionales. El nombre del run (`medicine_online_pilot`) apunta a un piloto con datos o evaluacion de dominio medico y a un esquema de recompensas basado en rubricas, pero es una inferencia a partir del identificador, no un dato documentado. El checkpoint corresponde al paso 10, es decir, un estado temprano del entrenamiento, y el autor indica que el checkpoint local se elimina solo tras verificar tamanos y hashes SHA256 de todos los ficheros remotos, lo que aporta trazabilidad de integridad pero no informacion sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Instruccion y seguimiento de formato de chat (pipeline `conversational`, compatible con text-generation-inference y endpoints).
- Razonamiento y conocimiento de dominio medico: presumiblemente el objetivo del ajuste, aunque no se documenta ninguna evaluacion que lo respalde.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint (el modelo base lo declara, pero no se confirma aqui).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no soportados segun la informacion disponible (el pipeline es exclusivamente text-generation).

## Casos de uso

- Experimentacion en investigacion de RL para dominio medico: el checkpoint permite reproducir y auditar el paso 10 de un run con semilla fija (42) y comparar la evolucion frente a pasos posteriores. Es su uso principal y el unico documentado implicitamente.
- Evaluacion comparativa de checkpoints intermedios: util para estudiar como evoluciona la calidad y el sesgo a lo largo del entrenamiento, ya que se conserva el estado nativo veRL/FSDP junto al export BF16.
- Generacion de borradores de texto clinico con supervision humana: con 4B parametros y licencia Apache-2.0 puede prototiparse en local, siempre con revision por personal sanitario y sin uso diagnostico.
- Respuesta a preguntas sobre material medico de referencia en entornos cerrados: desplegable con vLLM o TGI para pruebas internas de recuperacion aumentada (RAG) sobre guias clinicas, verificando previamente que el ajuste no degrade el modelo base.
- Base para nuevos ajustes especificos: al ser Apache-2.0 y safetensors, puede servir como punto de partida de fine-tunes con LoRA en tareas medicas concretas, aunque un checkpoint de paso 10 no es el punto de partida recomendable frente al modelo base.
- Docencia y divulgacion tecnica: ejemplo practico de pipeline veRL/FSDP y de publicacion reproducible de checkpoints con verificacion SHA256.
- No recomendado para atencion al cliente en produccion ni para decision clinica: sin benchmarks, sin evaluacion de seguridad y con 0 descargas, no hay evidencia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8-9 GB solo para pesos (4.022 millones de parametros a 2 bytes), mas KV cache y overhead; realisticamente 12-16 GB para contextos moderados.
- VRAM estimada en FP8/INT8: aproximadamente 4-5 GB de pesos; en torno a 8 GB con cache.
- VRAM estimada en cuantizacion de 4 bits (GGUF/AWQ/GPTQ, previa conversion): aproximadamente 2,5-3 GB de pesos.
- GPU consumer: cabe en RTX 4090 (24 GB) y RTX 4080/3090 (16-24 GB) en BF16; en RTX 4060 Ti 16 GB o GPUs de 8 GB requeriria cuantizacion a 4-8 bits.
- GPU de datacenter: A100 40/80 GB, H100 y L40S soportan el modelo con folgade sobra y permiten alto paralelismo de peticiones.
- Opciones de despliegue: Transformers (formato nativo del repo), vLLM y TGI (tags `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama solo tras convertir a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-medicine-online-pilot-261017-seed42-step-010 | 4,02 B | no disponible | no disponible (sin benchmarks) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B (no confirmado en esta ficha) | no disponible | no disponible en esta ficha | Apache-2.0 (segun tag del base) | HuggingFace, ampliamente utilizado |
| Otros fine-tunes medicos de ~4 B (p. ej. variantes de Llama-3.2-3B o Qwen2.5-3B/7B) | 3-8 B | no disponible | no disponible | variable (a menudo Llama license o Apache-2.0) | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones del modelo base dentro de la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible. La comparacion relevante es cualitativa: frente al Qwen3-4B-Instruct-2507 original, este checkpoint es un paso 10 de un piloto, sin garantia de mejora y potencialmente con degradacion respecto a la base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de seguridad, ni descripcion del dataset, lo que impide validar cualquier afirmacion sobre calidad en dominio medico.
- Checkpoint intermedio (paso 10): un estado temprano de entrenamiento por refuerzo puede presentar inestabilidad, sobreajuste incipiente o comportamientos degenerados frente al modelo base.
- Riesgo alto de alucinacion en contenido clinico: no hay evidencia de mitigacion; el uso para decisiones diagnosticas o terapeuticas esta contraindicado.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni el proceso de filtrado, no puede evaluarse el sesgo demografico, linguistico ni cultural; el dominio medico es especialmente sensible a sesgos de poblacion.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilinguismo del modelo base o lo ha estrechado; el castellano no esta confirmado.
- Contexto no documentado: no se especifica la ventana maxima, lo que obliga a verificarla empiricamente antes de disenar aplicaciones con documentos largos.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y regulatoria (por ejemplo, clasificacion de producto sanitario en la UE bajo MDR) recae en el implementador; el modelo no esta certificado para uso clinico.
- Repositorio de 25,7 GB con checkpoint nativo duplicado: coste de almacenamiento y de descarga elevado para un modelo de 4B; conviene descargar solo el export BF16 si no se necesita el estado veRL/FSDP.
- Sin comunidad: 0 descargas y 0 likes implican ausencia de validacion externa y de issues resueltos.
- Trazabilidad limitada: la verificacion SHA256 mencionada garantiza integridad de ficheros, no correccion del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-010
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVA2
- Paper, blog, repositorio o demo del entrenamiento: no disponible (la busqueda web no devolvio resultados relevantes; los enlaces encontrados correspondian a terceros sin relacion con el modelo)
