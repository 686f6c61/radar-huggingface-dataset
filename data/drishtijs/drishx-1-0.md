# drishtijs/DrishX-1.0

## Resumen

DrishX-1.0 es un ajuste fino (finetune) del modelo Qwen2.5-Coder-0.5B-Instruct, publicado por el usuario drishtijs bajo licencia Apache 2.0. Se trata de un modelo causal de generacion de texto orientado a conversaciones sobre desarrollo de software y a la guia del propio proyecto Drishti. Con 494.032.768 parametros (aproximadamente 0,5B), es un modelo pequeno pensado para ejecucion local y despliegue ligero, no para competicion en benchmarks de gran escala.

El modelo emplea la arquitectura Qwen2ForCausalLM, con un limite de contexto configurado de 32.768 tokens, aunque el autor advierte explicitamente de que la calidad en contexto largo no se ha evaluado. Los pesos se distribuyen en formato safetensors en float32, con un repositorio de 2,0 GB, e incluyen el tokenizer completo para su uso con Transformers.

Su relevancia es limitada y muy especifica: no se presenta como un modelo de proposito general ni como una mejora medible sobre su base. El autor declara que el release contiene un checkpoint local ya existente, no un nuevo entrenamiento, y que no se registraron hiperparametros exactos ni metricas de calidad sobre conjuntos de validacion. La unica validacion publicada es un smoke check offline en CPU que comprueba carga, tokenizer, logits finitos y generacion determinista con un saludo sintetico, lo que verifica ejecucion basica pero no precision en codigo ni rendimiento en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 494.032.768 (aproximadamente 0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados; calidad en contexto largo no evaluada |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se incluye conversion GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (incluye licencia y atribucion del modelo upstream) |
| Formato de pesos | safetensors, float32 |

## Arquitectura y entrenamiento

La arquitectura es la heredada del modelo base: un transformer causal decoder-only de la familia Qwen2, con la clase `Qwen2ForCausalLM`. El checkpoint se deriva de Qwen/Qwen2.5-Coder-0.5B-Instruct, en la revision `ea3f2471cf1b1f0db85067f1ef93848e38e88c25`. El repositorio incluye el tokenizer completo y esta pensado para cargarse con `transformers>=4.57.0` y `safetensors`; el smoke check de release se realizo con Transformers 4.57.0.

Sobre el entrenamiento, la informacion disponible es muy escasa. El autor indica que la receta `scripts/train_model.py` del proyecto usa el modelo base Qwen y exporta un checkpoint completo, pero que los hiperparametros exactos de la ejecucion y las metricas de calidad sobre conjuntos reservados no se registraron junto al checkpoint. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento adicionales. Tampoco se describe ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, etc.). El release se etiqueta como `v1.0.0` con versionado semantico independiente del resto de artefactos del proyecto, y se incluyen `release.json` con tamanos, hashes SHA-256 y revision de origen, y `SHA256SUMS` para verificacion de integridad.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en conversaciones sobre desarrollo de software y en la guia del proyecto Drishti.
- Asistencia de codigo heredada del modelo base Qwen2.5-Coder-0.5B-Instruct, aunque sin metricas que cuantifiquen su calidad tras el ajuste fino.
- Formato de chat mediante `apply_chat_template` con roles de sistema, usuario y asistente.
- Generacion con muestreo configurable (temperatura, top_p) y limite de tokens nuevos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente de documentacion del proyecto Drishti: el modelo se uso para responder preguntas sobre rutas de pagina y estructura del proyecto, tal como aparece en el ejemplo de la model card, y es adecuado por su ajuste especifico a ese dominio.
- Prototipado local de chat de codigo: al ser un modelo de 0,5B en float32 (2,0 GB de repositorio), puede cargarse en entornos de desarrollo sin GPU dedicada para probar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de snippets en pipelines de integracion: puede integrarse con Transformers para producir borradores de codigo que despues pasan por revision humana y tests automatizados, dado su origen en Qwen2.5-Coder.
- Educacion y demos de ajuste fino: sirve como ejemplo reproducible (revision `v1.0.0`, hashes en `SHA256SUMS`) de como publicar un checkpoint finetuneado con tokenizer y verificacion de integridad.
- Pruebas de infraestructura de inferencia: util para validar despliegues con Transformers y text-generation-inference en entornos con recursos limitados, ya que el modelo es pequeno y el tag `endpoints_compatible` esta presente.
- Filtrado o clasificacion ligera de consultas tecnicas: con contexto configurado de 32.768 tokens puede procesar conversaciones largas, aunque el autor advierte que la calidad en contexto largo no se ha evaluado y que no debe asumirse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ninguna puntuacion de benchmark ni de calidad en produccion, y que `validation.json` solo registra un smoke check offline en CPU (carga, tokenizer, logits finitos y generacion determinista con un saludo sintetico).

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB solo para pesos (494M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 0,5-0,7 GB para pesos; a 4 bits, alrededor de 0,3-0,4 GB. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en float32; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100, aunque estas ultimas estarian sobredimensionadas.
- Ejecucion en CPU: viable; de hecho, el smoke check oficial se realizo en CPU offline.
- Opciones de despliegue: Transformers (version validada 4.57.0) con safetensors; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se incluye conversion GGUF, por lo que llama.cpp u Ollama requeririan conversion propia. El autor senala que el GGUF de 7B de la aplicacion es un modelo separado y que este release no lo sustituye.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DrishX-1.0 | 494.032.768 | 32.768 configurados (calidad no evaluada) | Apache 2.0 | Hugging Face, safetensors float32, revision `v1.0.0` | Finetune de Qwen2.5-Coder-0.5B-Instruct sin metricas publicadas |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | aproximadamente 0,5B | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Modelo base del que deriva DrishX-1.0 |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | aproximadamente 1,5B | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Alternativa de mayor tamano de la misma familia; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay benchmarks, evaluaciones de calidad ni resultados sobre conjuntos reservados; el unico test publicado es un smoke check sintetico.
- El autor advierte de que el codigo y las recomendaciones generadas pueden ser incorrectos y requieren revision y pruebas.
- La calidad en contexto largo (hasta 32.768 tokens) no se ha evaluado, por lo que no debe asumirse un rendimiento fiable en ventanas extensas.
- Solo se declara soporte de ingles; no hay evidencia de capacidades en castellano u otros idiomas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de un modelo base entrenado con datos web, es esperable heredar sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado; aplica el riesgo general de los modelos generativos pequenos, agravado por la falta de evaluacion.
- Alcance funcional: el repositorio contiene solo pesos; edicion de sistema de ficheros, control de navegador, recuperacion de base de datos y control de permisos pertenecen a la aplicacion DrishX, no al modelo.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la licencia y atribucion del modelo upstream Qwen.
- No se incluye conversion GGUF; quien quiera usar llama.cpp u Ollama debe convertir los pesos por su cuenta.
- El modelo no sustituye al GGUF de 7B de la aplicacion Drishti, que es un artefacto separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drishtijs/DrishX-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset del proyecto: https://huggingface.co/datasets/drishtijs/DrishtiX
- Repositorio de codigo, scripts de entrenamiento (`scripts/train_model.py`) y artefactos de release (`release.json`, `SHA256SUMS`, `validation.json`): no disponible como URL en la informacion proporcionada.
