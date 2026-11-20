# ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated

## Resumen

ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated es una variante modificada del modelo Qwen2.5-Coder-32B-Instruct de Alibaba Cloud, en la que se ha eliminado quirúrgicamente el comportamiento de rechazo mediante una tecnica propietaria denominada "jbliteration" (herramienta jBlaze). No se ha realizado ningun tipo de fine-tuning ni entrenamiento adicional: la modificacion opera directamente sobre los pesos del modelo base. El resultado es un modelo "uncensored" que mantiene la arquitectura, tokenizer y longitud de contexto del original.

El modelo conserva los 32.763.876.352 parametros del Qwen2.5-Coder-32B-Instruct original y esta pensado, segun el autor, para investigacion en seguridad, red-teaming y analisis defensivo, donde un modelo que rechaza procesar codigo hostil resulta inutil para la tarea. La relevancia actual del modelo radica en su demostracion de que el rechazo es una disposicion aprendida sobre la capacidad, no una barrera previa a ella, y que puede eliminarse sin reentrenar.

La ficha se centra en las caracteristicas tecnicas de esta variante concreta, diferenciando aquello que hereda del modelo base (arquitectura, contexto, capacidades de codigo) de aquello que modifica el autor (eliminacion de rechazos, publicacion de cuantizaciones GGUF propias). El modelo se distribuye bajo licencia Apache 2.0 y unicamente declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada del modelo base) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | BF16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Tamano del repositorio | 120,2 GB |
| Modelo base | Qwen/Qwen2.5-Coder-32B-Instruct |
| Descargas | 1.829 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-32B-Instruct original: un transformer decoder-only de 32.763.876.352 parametros, con tokenizer y contexto identicos. El autor declara explicitamente que esta variante es un "drop-in replacement" del modelo base, por lo que no introduce cambios estructurales. No se especifica en la informacion disponible la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO; esos datos corresponden al modelo base de Qwen y no se reproducen en esta ficha.

La innovacion tecnica de esta variante es el procedimiento de edicion de pesos. El autor distingue "jbliteration" de la abliteration estandar: mientras que la abliteration convencional aplica un enfoque de diferencia de activaciones que elimina la direccion de rechazo junto con capacidades colaterales (voz, creatividad, rendimiento general), jBlaze afirma atacar unicamente las rutas causales de rechazo. El autor cita como evidencia una medicion sobre otro modelo de su coleccion (Sharona, Qwen3.5-27B), donde MMLU paso de 76,84% en el baseline a 77,89% tras seis fases de cirugia y cuantizacion GPTQ W4A16, una ganancia de 1,05 puntos porcentuales. Esa medicion no se ha publicado para este modelo concreto. No se ha realizado entrenamiento por gradientes ni se usa system prompt para suprimir rechazos.

## Capacidades

- Generacion de codigo: hereda las capacidades de programacion del Qwen2.5-Coder-32B-Instruct en el que se basa.
- Generacion de texto y conversacion multi-turno: pipeline declarado como text-generation y conversational.
- Razonamiento y matematicas: capacidades heredadas del modelo base; no se detallan mediciones propias.
- Ausencia de rechazos: el modelo no rechaza peticiones, incluidas las relacionadas con codigo malicioso, exploits o analisis de intrusiones.
- Tool calling / function calling: no se documenta explicitamente en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no se documenta explicitamente en la informacion disponible.
- Capacidades multilingues: solo se declara ingles (`en`); no se confirman otros idiomas.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.
- Despliegue ligero: el autor ofrece DeepswapLLM para ejecutar el modelo en precision completa en GPUs con menos VRAM de la necesaria, con streaming de capas entre GPU, RAM y disco, y hasta 4x mas rapido que AirLLM segun su propia afirmacion.

## Casos de uso

- Revision de codigo hostil en seguridad defensiva: el modelo puede leer y analizar exploits, malware y artefactos de ataque sin bloquear la peticion, lo que permite a un equipo de respuesta a incidentes procesar muestras que un modelo con guardrails rechazaria. El autor cita el caso del brecha de Hugging Face de julio de 2026, donde APIs comerciales no procesaban los datos del propio ataque.
- Red-teaming y evaluacion de robustez: util para generar y analizar prompts adversarios y codigo de prueba en laboratorios de seguridad, dado que el modelo no aplica rechazos que interrumpan el flujo de trabajo.
- Analisis forense de intrusiones: reconstruccion de cadenas de ataque a partir de artefactos del atacante, tarea en la que el modelo base podria negarse a procesar el contenido.
- Generacion de codigo en produccion: al ser un reemplazo directo del Qwen2.5-Coder-32B-Instruct, puede integrarse en pipelines de desarrollo y CI/CD con el mismo tokenizer y plantilla de chat, usando vLLM o TGI en BF16.
- Escritura creativa sin restricciones: el autor lo situa como caso de uso legitimo para ficcion y contenido que los guardrails del modelo base filtrarian.
- Investigacion academica sobre alineacion y refusal: permite estudiar como se comporta un modelo sin la capa de rechazo aprendida, comparandolo con el original.
- Despliegue en hardware limitado: con la cuantizacion Q4_K_M (19 GB) puede ejecutarse en una GPU de 24 GB o en CPU, y con Q8_0 (33 GB) en GPUs de 48 GB o con offload CPU+GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este modelo en la informacion disponible. El autor solo aporta una medicion de retencion de capacidad sobre otro modelo de su coleccion (Sharona, Qwen3.5-27B: MMLU 77,89% frente a 76,84% del baseline), que no es extrapolable a este modelo.

## Requisitos de hardware

- BF16 (safetensors, 62 GB): requiere aproximadamente 64 GB de VRAM para inferencia comoda; GPUs como A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Q8_0 (GGUF, 33 GB): encaja en GPUs de 48 GB o mas (A6000, A100 40 GB con margen ajustado, L40S 48 GB) o con offload CPU+GPU.
- Q4_K_M (GGUF, 19 GB): cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y permite inferencia en CPU.
- Opciones de despliegue: vLLM, TGI y transformers para BF16; llama.cpp y Ollama para GGUF. El autor menciona DeepswapLLM para streaming de capas en GPUs con VRAM insuficiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos | Formatos |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-Jbliterated (este) | 32,76 B | no disponible | apache-2.0 | eliminados | safetensors, GGUF |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32,76 B | no disponible en esta ficha | apache-2.0 | presentes | safetensors |
| Otras variantes abliterated de Qwen2.5-Coder-32B | no disponible | no disponible | habitualmente apache-2.0 | eliminados (metodo estandar) | safetensors, GGUF |

La comparativa con alternativas de la misma categoria (abliterations estandar del mismo modelo base) no puede completarse con datos verificables en la informacion disponible: no se aportan mediciones comparativas de refusal rate ni de retencion de capacidad para este modelo.

## Limitaciones y advertencias

- Ausencia total de rechazos: el modelo no se negara a ninguna peticion, lo que incluye contenido ilegal, danino o que vulnere derechos de terceros. El propio autor advierte de que los pesos pueden causar dano.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; se hereda el comportamiento del modelo base.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; los sesgos del modelo base no se han medido en la informacion disponible.
- Idioma: solo se declara ingles; el uso en castellano u otros idiomas no esta soportado oficialmente.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declina responsabilidad por el uso y exige uso etico y legal; el cumplimiento normativo recae en el desplegador.
- Metodo propietario: jBlaze es una herramienta propietaria y el procedimiento de edicion no es reproducible ni auditable a partir de la informacion publicada.
- Evidencia limitada: la unica medicion de retencion de capacidad citada corresponde a otro modelo de la coleccion, no a este.
- Contexto no verificado: la longitud de contexto no se especifica en la ficha del autor; debe confirmarse contra el modelo base antes de desplegar en produccion.
- Procedencia: creado y actualizado en 2026 segun los metadatos; conviene verificar la integridad de los pesos antes de usarlos en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-Coder-32B-Instruct-Jbliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Herramienta jBlaze: https://jblaze.dev
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
