# huyxdang/adaption_agent_memory

## Resumen

adaption_agent_memory es un adaptador LoRA (librería PEFT) para el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario huyxdang en HuggingFace. No es un modelo completo, sino un conjunto de pesos de adaptación de aproximadamente 0,1 GB que debe cargarse sobre el modelo base para poder realizar inferencia. Fue entrenado mediante SFT (supervised fine-tuning) con AutoScientist, la herramienta de Adaption Labs, sobre un conjunto de datos denominado agent-memory.

Su interés es doble. Por un lado, ilustra un flujo de ajuste fino automatizado y de bajo coste sobre un modelo de 0,8B de parámetros, orientado a tareas de memoria de agente. Por otro, publica de forma explícita la configuración completa del entrenamiento: LoRA con r=32, alpha=128, dropout de 0,05, 4 épocas, learning rate de 5e-5, scheduler coseno y módulos entrenables q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj.

El entrenamiento utilizó 5.767 ejemplos repartidos en 21 dominios temáticos (cocina, educación académica, matemáticas, medicina, deportes, negocio corporativo, entretenimiento, código, finanzas personales, etc.) y el autor informa de una evaluación sobre un conjunto de test retenido in-distribution y otro conjunto específico de dominio. Al apoyarse en un modelo de 0,8B, el coste de inferencia es muy reducido y cabe en hardware de consumo, pero hereda las limitaciones de capacidad y el riesgo de alucinación propios de ese tamaño. El repositorio no publica cifras de benchmarks, ni idiomas soportados, ni longitud de contexto, ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptadores LoRA insertados en q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj |
| Parametros totales | El adaptador no declara su número de parámetros (repo de 0,1 GB); el modelo base indica 0,8B en su nombre |
| Parametros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | No disponible; la hereda del modelo base Qwen/Qwen3.5-0.8B, no documentada en la información proporcionada |
| Tipos de cuantizacion | No disponibles para el adaptador, distribuido en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema, pero no se documentan aquí |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; library_name: peft) |

Otros datos de interés: rango LoRA 32, alpha 128, dropout 0,05, 4 épocas, learning rate 5e-5, weight decay 0,01, warmup ratio 0,05, max grad norm 1, formato de datos "chat", train_on_inputs desactivado.

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA sobre un transformer decoder-only de 0,8B. El entrenamiento se realizó con SFT en 4 épocas sobre un dataset en formato chat, con `train_on_inputs: false` (solo se calcula la pérdida sobre las respuestas) y una tasa de aprendizaje de 5e-5 con scheduler coseno, warmup del 5% y decaimiento de peso de 0,01. La matriz LoRA se aplica a las proyecciones de atención (q, k, v, o) y a las proyecciones del bloque MLP (gate, up, down), con r=32 y alpha=128, lo que da una escala efectiva de actualización de 4 (alpha/r). No se documenta ningún uso de RLHF, DPO u otra fase de alineación posterior al SFT.

El conjunto de entrenamiento consta de 5.767 filas con una distribución temática muy repartida: cocina (11%), educación académica (10%), matemáticas (9%), medicina (9%), deportes (9%), negocio corporativo (8%), entretenimiento (7%), código (7%), finanzas personales (4%), fitness (4%), escritura y edición (4%), crecimiento personal (3%), legal (3%), recomendación de productos (3%), tecnología (3%), carrera profesional (3%), crianza y familia (2%), how-to (1%), marketing (1%), recursos humanos (1%) y citas (1%). La innovación destacable no está en la arquitectura, sino en el pipeline: el adaptador se generó con AutoScientist de Adaption Labs, que automatiza la configuración y el entrenamiento. El autor incluye gráficos de métricas de entrenamiento y de win rates, pero no sus valores numéricos en texto.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat, heredadas del modelo base Qwen3.5-0.8B y ajustadas sobre datos de tipo agente y memoria.
- Procesamiento de consultas en 21 dominios temáticos distintos, con especial presencia de cocina, educación académica, matemáticas, medicina y deportes en el dataset.
- Razonamiento básico y resolución de problemas sencillos de matemáticas (9% del dataset) y de código (7%), limitado por el tamaño de 0,8B.
- Memoria de agente: el nombre del adaptador y el dataset sugieren un ajuste orientado a retener y recuperar información de conversaciones previas dentro de la ventana de contexto.
- Capacidades multilingües: no disponibles; no se documenta el reparto de idiomas del dataset ni del modelo base.
- Soporte de tool calling / function calling: no documentado en la información disponible; dependería del modelo base y no se ha verificado sobre el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el dominio declarado del dataset es agent-memory.
- Modo thinking, visión o audio: no disponibles; no se mencionan en la información proporcionada.

## Casos de uso

- Memoria conversacional para agentes: el adaptador está entrenado específicamente sobre un dataset de agent-memory, por lo que puede emplearse para que un agente mantenga el estado y el contexto de una conversación larga sobre el modelo base Qwen3.5-0.8B, con un coste de cómputo mínimo por turno.
- Asistentes locales y on-device: al ejecutarse sobre 0,8B de parámetros, es viable desplegarlo en portátiles, mini-PC o incluso en CPU, lo que permite asistentes privados que no envían datos a la nube.
- Clasificación y enrutado de consultas por dominio: dado que el dataset cubre 21 dominios etiquetados, el adaptador puede utilizarse para clasificar o enrutar peticiones (legal, médico, financiero, técnico) hacia el flujo adecuado en un sistema mayor.
- Generación de respuestas verticales de bajo riesgo: en dominios como cocina, how-to o recomendación de productos, donde la veracidad estricta no es crítica, puede generar borradores y sugerencias de forma económica.
- Prototipado e investigación sobre LoRA y SFT: la publicación de la configuración completa (r, alpha, épocas, módulos entrenables) y del reparto de dominios lo convierte en un caso de estudio reproducible para experimentos de ajuste fino eficiente.
- Base para ajustes incrementales: el adaptador puede fusionarse con el modelo base (`merge_and_unload()`) y servir como punto de partida para nuevos ajustes sobre dominios específicos.
- Backend de bajo coste para demo y pruebas A/B: permite validar pipelines de agentes y de memoria antes de escalar a modelos mayores, con un consumo de VRAM inferior a 2 GB en cuantización de 4 bits.
- Extracción y resumen de información en texto conversacional: útil para resumir hilos de soporte, notas o transcripciones, aprovechando la ventana de contexto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que el modelo fue evaluado sobre un conjunto de test retenido in-distribution y sobre un conjunto más amplio específico de dominio, y adjunta una imagen de win rates (`win-rates.png`) junto a otra de métricas de entrenamiento (`training-metrics.png`), pero los valores no se recogen como texto y no se puede extraer ninguna cifra verificable (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Peso del modelo base en bfloat16: aproximadamente 1,6 GB para 0,8B de parámetros, más unos 0,1 GB del adaptador LoRA.
- VRAM estimada para inferencia: en torno a 2-3 GB en bfloat16 contando pesos, activaciones y caché KV para secuencias cortas; alrededor de 0,8-1,5 GB si el modelo base se cuantiza a 4 bits. Son estimaciones derivadas del tamaño de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas dos últimas muy sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual, e incluso en CPU con un rendimiento aceptable para uso interactivo no intensivo.
- Opciones de despliegue: la ruta documentada por el autor es `transformers` + `peft` (con `PeftModel.from_pretrained` y la opción de fusionar pesos con `merge_and_unload()`). También son viables vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp u Ollama si se convierte el modelo fusionado a GGUF. No se documenta ninguna de estas alternativas en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adaption_agent_memory (adaptador LoRA) | 0,8B de base + LoRA r=32 | No disponible | Sin benchmarks numéricos publicados | other | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible | No disponible | No disponible en la información | HuggingFace |
| Qwen2.5-0.5B (referencia externa) | 0,49B | 32k | No disponible | Apache 2.0 | HuggingFace |
| Llama-3.2-1B (referencia externa) | 1,23B | 128k | No disponible | Llama 3.2 Community License | HuggingFace |

Nota: las filas de Qwen2.5-0.5B y Llama-3.2-1B se incluyen como referencia de categoría (modelos densos de menos de 2B parámetros) y sus datos proceden de conocimiento general, no de la información proporcionada en esta consulta; conviene verificarlos en sus repositorios antes de citarlos.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3.5-0.8B, y no funciona por sí solo.
- Tamaño de 0,8B: capacidad de razonamiento limitada, degradación rápida en tareas multi-paso complejas y mayor propensión a errores factuales que modelos de mayor escala.
- Riesgo de alucinación elevado, especialmente en dominios sensibles como medicina (9% del dataset), legal (3%) o finanzas personales (4%), donde el dataset de ajuste es insuficiente para garantizar precisión.
- Dataset de entrenamiento pequeño (5.767 filas) y muy repartido entre 21 dominios, lo que puede producir un ajuste superficial y riesgo de sobreajuste a los estilos y formatos concretos del conjunto.
- Idiomas soportados no documentados: no se puede asumir un buen rendimiento en castellano sin una evaluación propia.
- Licencia "other": se debe revisar los términos exactos de la licencia del modelo base y las condiciones de uso de los datos y de la plataforma Adaption/AutoScientist antes de un uso comercial.
- Sin benchmarks numéricos publicados ni validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia independiente de calidad.
- Capacidades de tool calling, razonamiento multi-paso y contexto largo no están documentadas ni verificadas para este adaptador.
- Alucinación de formato: al estar entrenado en formato chat con `train_on_inputs: false`, puede degradarse si se usa con plantillas de prompt distintas de la del modelo base.
- Si se fusionan los pesos (`merge_and_unload()`), se pierde la posibilidad de desactivar el adaptador en tiempo de ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huyxdang/adaption_agent_memory
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaption Labs (plataforma de entrenamiento AutoScientist): https://adaptionlabs.ai
- Documentación de PEFT: https://huggingface.co/docs/peft
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a un medio deportivo sin relación con el contenido de la ficha.
