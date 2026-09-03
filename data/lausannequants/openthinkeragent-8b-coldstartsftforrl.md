# lausannequants/OpenThinkerAgent-8B-ColdStartSFTForRL

## Resumen

OpenThinkerAgent-8B-ColdStartSFTForRL es un checkpoint intermedio del proyecto OpenThoughts-Agent, una iniciativa open source para curar datasets y recetas de entrenamiento de modelos agénticos. Este modelo concreto es la base pre-RL de la receta SFT→RL de 8B: parte de Qwen/Qwen3-8B y se somete a un ajuste fino supervisado (SFT) de parámetros completos sobre el dataset OpenThoughts-Agent-SFT-ColdStartForRL-10K, compuesto por 9.437 pares (tarea, trayectoria) de tareas de codificación en sandbox con verificación oracle. Su propósito no es ser un agente desplegable, sino dotar al modelo del formato de interacción agéntica y del comportamiento de uso de herramientas necesarios para que el posterior entrenamiento con aprendizaje por refuerzo (RL) sea estable. El resultado final de esa receta es OpenThinkerAgent-8B-RL.

Arquitectónicamente es un transformer decoder estándar de Qwen3 (Qwen3ForCausalLM) con 36 capas, tamaño oculto de 4096, 32 cabezas de atención y 8 cabezas KV, con una ventana de contexto de 40.960 tokens. Está publicado bajo licencia Apache-2.0 y sus pesos están en formato safetensors. Su relevancia radica en que documenta una etapa crítica del pipeline de entrenamiento de agentes: el cold-start SFT que condiciona el comportamiento agéntico antes de la optimización por RL, un enfoque cada vez más común en la comunidad de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder, 36 capas, hidden 4096, 32 heads, 8 KV heads, RoPE θ=1e6) |
| Parametros totales | No disponible (el dato extraido de 308.224 parece un error; el modelo se basa en Qwen3-8B, que tiene aproximadamente 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No disponible (pesos en bf16; no se publican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (no se especifica en la ficha; Qwen3-8B base soporta multiples idiomas, pero no se confirma para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de Qwen3-8B: un transformer decoder causal con 36 capas, tamaño oculto de 4096, 32 cabezas de atención y 8 cabezas KV, rotación posicional RoPE con θ=1e6 y un vocabulario de 151.936 tokens. No introduce innovaciones arquitectónicas; su valor está en el entrenamiento. Se realizó un ajuste fino supervisado de parámetros completos con LLaMA-Factory sobre el dataset OpenThoughts-Agent-SFT-ColdStartForRL-10K, que contiene 9.437 pares (tarea, trayectoria) generados por un modelo profesor en el harness terminus-2 dentro de sandboxes Daytona, con verificación oracle (timeout de 120 segundos). Los hiperparámetros registrados incluyen learning rate de 4e-5, scheduler coseno con warmup del 10%, tamaño de batch total de 16 (1 por dispositivo × 8 dispositivos × acumulación de gradiente 2), optimizador AdamW fusionado, 7 épocas y precisión bf16. La pérdida final de entrenamiento fue de aproximadamente 0,303 tras 4.130 pasos globales. Este checkpoint es el paso 2 de una receta de 4 pasos: dataset cold-start SFT, este modelo, dataset RL on-policy (OpenThoughts-Agent-RL-5K) y el modelo final RL (OpenThinkerAgent-8B-RL).

## Capacidades

- Generacion de texto: hereda las capacidades de generacion de Qwen3-8B, incluyendo razonamiento y conocimiento general.
- Formato agéntico y uso de herramientas: el SFT cold-start entrena al modelo para seguir el formato de interaccion del harness terminus-2, incluyendo llamadas a herramientas y ejecucion de comandos en terminal.
- Codigo: el dataset de entrenamiento se compone de tareas de codificacion estilo SWE-Smith con pruebas, por lo que el modelo ha aprendido a resolver problemas de ingenieria de software en entornos sandbox.
- Razonamiento multi-paso: aunque no se publican benchmarks, la base Qwen3-8B tiene capacidades de razonamiento que se preservan en el checkpoint.
- Sin capacidades multimodales: no soporta vision ni audio; es exclusivamente texto.
- Sin modo thinking explicito: no se documenta un modo de pensamiento separado; el comportamiento agéntico se expresa a traves del formato de trayectoria.

## Casos de uso

- Punto de partida para RL de agentes: su uso principal es como inicializacion para entrenamiento con aprendizaje por refuerzo, tal como se hace en la receta OpenThoughts-Agent. Un investigador cargaria este checkpoint y lo entrenaria con RL sobre tareas agénticas para obtener el modelo final.
- Fine-tuning adicional para tareas de terminal y codigo: al haber sido entrenado en trayectorias de codificacion, puede servir como base para SFT adicional en dominios especificos de ingenieria de software.
- Investigacion en recetas de entrenamiento: util para estudiar el efecto del cold-start SFT en la estabilidad del RL posterior, comparando con modelos sin esta etapa.
- Evaluacion de cold-start en pipelines de agentes: permite medir la contribucion de esta fase al rendimiento final del agente, en lugar de usar el modelo directamente.
- Base para experimentos de destilacion o transferencia: al ser un checkpoint intermedio, puede usarse para probar tecnicas de regularizacion o destilacion hacia modelos mas pequeños.
- No recomendado para despliegue en produccion: el propio autor advierte que su rendimiento agéntico autonomo es inferior al del modelo RL final, por lo que no es adecuado para sistemas en produccion sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la ficha declara una lista de resultados vacia (`results: []`), y la model card indica explicitamente que no se publican numeros de benchmarks agénticos para este checkpoint cold-start. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,4 GB en bf16, por lo que se necesitan al menos 16 GB de VRAM para cargar los pesos completos sin cuantizacion. Con cuantizacion a 4 bits (por ejemplo, GGUF Q4_K_M) el modelo podria ocupar entre 5 y 6 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: para inferencia en bf16, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40GB, L4) es adecuada. Para entrenamiento con SFT de parametros completos, se requieren multiples GPUs (el entrenamiento original uso 8 dispositivos).
- Compatibilidad con GPUs de consumo: si, con cuantizacion puede ejecutarse en GPUs de 8-12 GB (RTX 3080, RTX 4070, etc.), aunque sin garantias de rendimiento.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI, llama.cpp (via conversion a GGUF) y Ollama (si se convierte). La ficha menciona compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no se proporcionan datos estimados. Como referencia, Qwen3-8B en bf16 suele generar entre 20 y 50 tokens por segundo en una RTX 4090, pero esto no esta confirmado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThinkerAgent-8B-ColdStartSFTForRL (este) | Qwen3-8B | 40.960 | Cold-start SFT pre-RL | Apache-2.0 | Hugging Face |
| OpenThinkerAgent-8B-RL | Qwen3-8B | 40.960 | Agente final tras RL | Apache-2.0 | Hugging Face |
| Qwen3-8B (base) | - | 40.960 | Modelo generico de texto | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos, ya que este checkpoint no publica benchmarks. La comparacion se limita a arquitectura y rol en el pipeline. El modelo RL final (OpenThinkerAgent-8B-RL) es el sucesor directo y se espera que tenga mejor rendimiento agéntico, pero no se incluyen cifras en la informacion disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final desplegable; su rendimiento agéntico autonomo es inferior al del modelo RL entrenado posteriormente.
- Sin benchmarks publicados: no hay metricas objetivas que permitan evaluar su calidad de forma independiente.
- Sesgos y alucinaciones: hereda los sesgos y limitaciones de Qwen3-8B, incluyendo riesgo de generar contenido incorrecto o inseguro. El autor advierte que las salidas no deben ejecutarse sin revision.
- Datos de entrenamiento limitados: el dataset cold-start contiene solo 9.437 pares, lo que puede limitar la generalizacion a tareas fuera del dominio de codificacion.
- Idiomas no especificados: aunque Qwen3-8B soporta multiples idiomas, no se confirma el rendimiento multilingue de este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no esta optimizado para produccion y su uso en entornos reales requiere entrenamiento adicional.
- Confusion de repositorios: existen varias copias del modelo en Hugging Face (lausannequants, zurichquants, open-thoughts) con el mismo nombre, lo que puede generar ambiguedad sobre cual es la version oficial.

## Enlaces

- Repositorio en Hugging Face (open-thoughts): https://huggingface.co/open-thoughts/OpenThinkerAgent-8B-ColdStartSFTForRL
- Repositorio en Hugging Face (lausannequants, el de la ficha): https://huggingface.co/lausannequants/OpenThinkerAgent-8B-ColdStartSFTForRL
- Repositorio en Hugging Face (zurichquants, copia): https://huggingface.co/zurichquants/OpenThinkerAgent-8B-ColdStartSFTForRL
- Pagina del proyecto OpenThoughts-Agent: https://www.openthoughts.ai/blog/agent
- Repositorio de codigo en GitHub: https://github.com/open-thoughts/OpenThoughts-Agent
- Coleccion de modelos OpenThinker-Agent: https://huggingface.co/collections/open-thoughts/openthinker-agent
- Dataset de entrenamiento cold-start: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-ColdStartForRL-10K
- Dataset de tareas RL: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-RL-5K
- Modelo RL final: https://huggingface.co/open-thoughts/OpenThinkerAgent-8B-RL
- Pagina en FriendliAI (despliegue): https://friendli.ai/models/open-thoughts/OpenThinkerAgent-8B-ColdStartSFTForRL
