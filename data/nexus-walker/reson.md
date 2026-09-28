# Nexus-Walker/Reson

## Resumen

Reson es un adaptador LoRA de solo inferencia publicado por el usuario Nexus-Walker sobre el modelo base `meta-llama/Llama-2-7b-chat-hf`. No es un modelo completo: se distribuye como pesos de adaptador en formato safetensors que deben cargarse con PEFT sobre el modelo base de Meta, que está sujeto a acceso restringido (gated). El adaptador se entrenó con aproximadamente 11.000 pares instrucción/respuesta con el objetivo declarado de explorar razonamiento reflexivo y revisión de estrategias, es decir, que el modelo reconsidere y corrija su propio plan de respuesta.

El interés de esta ficha es acotado y conviene ser explícito: se trata de un experimento de bajo perfil (17 descargas y 1 like en el momento de la consulta), sin resultados de benchmarks publicados, sin dataset de entrenamiento publicado y sin documentación sobre hiperparámetros del LoRA (rango, alpha, capas objetivo). Su relevancia es, por tanto, la de un caso de estudio reproducible de fine-tuning PEFT sobre Llama 2, no la de un modelo listo para producción.

Técnicamente hereda todas las características del base: transformer decoder-only de 7.000 millones de parámetros, contexto de 4096 tokens, tokenizador de 32.000 entradas y entrenamiento centrado en inglés. El repositorio ocupa 1,8 GB porque incluye checkpoints históricos en `training_logs/`, no porque el adaptador tenga ese tamaño. La licencia declarada es Llama 2 Community License, con la documentación y el código auxiliar del propio repositorio bajo MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only de Llama 2 (atención multi-cabeza, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 7.000 millones en el modelo base; el adaptador LoRA no declara número de parámetros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de `meta-llama/Llama-2-7b-chat-hf`) |
| Tipos de cuantizacion | No declarados por el autor. El ejemplo oficial de carga usa `BitsAndBytesConfig` con `load_in_4bit=True` y `bnb_4bit_quant_type="nf4"`; el base admite también fp16, int8 y cuantizaciones posteriores al merge (GPTQ, GGUF) |
| Idiomas soportados | no disponible (el modelo base está entrenado predominantemente en inglés) |
| Licencia | Llama 2 Community License (metadato `license: llama2`); documentación y código auxiliar del repositorio bajo MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), tokenizador (`tokenizer.*`) y plantilla de chat (`chat_template.jinja`) |
| Libreria de carga | PEFT / transformers |
| Tamano del repositorio | 1,8 GB (incluye `training_logs/` con checkpoints históricos) |
| Version del adaptador evaluada | la publicada en el nivel raíz del repositorio (no los checkpoints de `training_logs/`) |

## Arquitectura y entrenamiento

Reson no define una arquitectura propia: es un adaptador LoRA de rango no especificado que se inyecta en las capas del modelo `meta-llama/Llama-2-7b-chat-hf`. Llama 2 7B es un transformer decoder-only con 32 capas, dimensión oculta 4096, 32 cabezas de atención, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El adaptador se publica sin fusionar con el base y sin convertir a otros formatos, por lo que la inferencia requiere cargar el base (aproximadamente 13-14 GB en fp16) y montar encima los pesos LoRA con `PeftModel.from_pretrained`.

En cuanto al entrenamiento, la model card indica únicamente que se usaron alrededor de 11.000 pares instrucción/respuesta orientados a razonamiento reflexivo y revisión de estrategias. No se especifica el número de tokens, la composición del dataset, la técnica de alineación (SFT, RLHF, DPO u otra), el rango del LoRA, el learning rate ni el número de épocas. Tampoco se publica el dataset. El repositorio incluye `training_logs/` con checkpoints históricos, pero el propio autor aclara que se trata de material de entrenamiento y que no se han convertido ni fusionado con el base. No hay innovaciones técnicas declaradas más allá del propio objetivo de entrenamiento (auto-revisión de estrategia).

## Capacidades

- Generación de texto conversacional en formato chat, heredando la plantilla de Llama 2 Chat y el `chat_template.jinja` incluido en el repositorio.
- Razonamiento reflexivo y revisión de estrategia: es el objetivo declarado del fine-tuning, orientado a que el modelo reconsidere su plan antes o después de responder.
- Seguimiento de instrucciones multi-turno, limitado por el contexto de 4096 tokens del modelo base.
- Generación de código y resolución de problemas matemáticos básicos: capacidades heredadas del base, no reforzadas específicamente por el adaptador.
- Soporte de tool calling / function calling: no disponible; Llama 2 Chat no incorpora un formato nativo de function calling y la model card no documenta ninguna adaptación para ello.
- Comportamiento agentico y multi-step reasoning: no documentado formalmente; el entrenamiento apunta a reflexión sobre estrategia, pero no hay evaluación publicada que lo respalde.
- Capacidades multilingües: no declaradas. El base está fuertemente sesgado al inglés.
- Capacidades especiales (modo thinking, visión, audio): ninguna. No hay torre de visión ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre adaptadores LoRA y razonamiento reflexivo: el adaptador es útil como punto de partida reproducible para estudiar si el fine-tuning supervisado sobre pares de instrucción induce patrones de auto-revisión, comparando las respuestas de Reson contra el base sin adaptador.
- Prototipado de agentes con auto-corrección: se puede integrar en un bucle donde el modelo genera un plan, lo critica y lo reescribe, aprovechando el sesgo de entrenamiento hacia la revisión de estrategia; requiere orquestación externa porque no hay tool calling nativo.
- Asistente conversacional interno en inglés: con el base cuantizado a 4 bits (nf4) el conjunto cabe en GPUs de consumo, lo que permite desplegar un chatbot de uso interno con coste bajo, asumiendo la ausencia de benchmarks que garanticen calidad.
- Generación de borradores con revisión en pipelines de anotación: útil para producir una primera respuesta y una versión revisada que un anotador humano compare, generando datos de preferencia o de corrección.
- Base para un segundo fine-tuning específico de dominio: al ser un adaptador PEFT sin fusionar, se puede apilar o continuar el entrenamiento sobre dominios concretos sin tocar los pesos del base.
- Despliegue en hardware de consumo para demos: la combinación base + adaptador en 4 bits ocupa del orden de 4-5 GB de VRAM, por lo que cabe en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB para demostraciones locales.
- Estudio comparativo de adaptadores en el ecosistema PEFT: sirve como ejemplo de estructura de repositorio (adapter, tokenizer, chat template, logs) para pruebas de carga y compatibilidad entre versiones de `peft` y `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no hay resultados de evaluación publicados, y la búsqueda web realizada no ha devuelto ningún material técnico relacionado con el modelo (los resultados obtenidos corresponden a sitios no relacionados: Nexus Mods, la revista Nexus, proveedores de servidores de juego y la entrada genérica de Wikipedia sobre el término "Nexus").

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 14 GB para el modelo base de 7B más una cantidad marginal para los pesos LoRA; requiere GPU de 16 GB o superior (RTX 4090, A100 40 GB, H100).
- VRAM en 4 bits (nf4, según el ejemplo oficial de la model card): del orden de 4-5 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- VRAM en 8 bits: del orden de 8-9 GB, viable en RTX 3070/3080 de 10-12 GB.
- Cabe en GPU de consumo: sí, en 4 bits y 8 bits; en fp16 requiere modelos de gama alta con 16 GB o más.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), `bitsandbytes` para cuantización en carga. Para vLLM, TGI, Ollama o llama.cpp sería necesario fusionar el adaptador con el base y, en el caso de llama.cpp/Ollama, convertir a GGUF; ninguno de estos flujos está documentado ni probado por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.
- Almacenamiento: 1,8 GB para el repositorio del adaptador (checkpoints incluidos) más el peso del modelo base descargado aparte desde el repositorio gated de Meta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| Nexus-Walker/Reson | 7B en el base + LoRA de rango no declarado | 4096 tokens | Adaptador PEFT en safetensors | Llama 2 Community License | No publicado | Abierto, pero requiere base gated |
| meta-llama/Llama-2-7b-chat-hf (base) | 7B | 4096 tokens | safetensors, GGUF, GPTQ (terceros) | Llama 2 Community License | Ampliamente reportado por Meta | Gated, requiere solicitud de acceso |
| Mistral-7B-Instruct-v0.2 | 7,3B | 32.768 tokens | safetensors, GGUF, GPTQ/AWQ | Apache 2.0 | Reportado por el autor | Abierto, sin gating |
| Zephyr-7B-beta | 7B | 32.768 tokens (base Mistral) | safetensors, GGUF | MIT | DPO declarado, benchmarks publicados | Abierto |

La comparación con Mistral 7B Instruct y Zephyr 7B beta es la más pertinente por tamaño y tarea, pero conviene subrayar la asimetría: ambos publican evaluaciones y tienen contextos ocho veces mayores, mientras que Reson no publica ninguna métrica, lo que impide cualquier comparación de calidad. Frente a su propio modelo base, la única diferencia documentada es el fine-tuning con unos 11.000 pares orientados a reflexión, sin evidencia cuantitativa de mejora.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada (MMLU, GSM8K, HumanEval ni evaluaciones de chat), por lo que el rendimiento real es desconocido y no se puede afirmar que el adaptador mejore al base.
- Dataset de entrenamiento no publicado y muy pequeño (aproximadamente 11.000 pares), sin información sobre su procedencia, idioma o método de generación; el riesgo de sobreajuste a estilos concretos o de amplificar sesgos presentes en esos datos es alto.
- Riesgo de alucinación: inherente a los modelos de 7B de la generación de Llama 2, agravado por la falta de evaluación; no debe usarse en dominios factuales sin verificación humana.
- Contexto limitado a 4096 tokens, muy por debajo de los 32.000 tokens de alternativas contemporáneas de 7B, lo que restringe conversaciones largas y documentos extensos.
- Idiomas: no se declara soporte multilingüe y el base está centrado en inglés; no hay evidencia de un comportamiento fiable en castellano.
- Licencia: el adaptador queda sujeto a la Llama 2 Community License, que impone condiciones de atribución y restricciones para despliegues a gran escala (a partir de 700 millones de usuarios mensuales se requiere licencia aparte de Meta). El uso comercial está permitido bajo esas condiciones, pero conviene revisar el texto completo antes de integrarlo en un producto.
- Dependencia de un modelo base gated: hay que solicitar acceso a Meta y autenticarse en Hugging Face antes de poder cargarlo, lo que complica la reproducibilidad y la automatización de despliegues.
- Repositorio con checkpoints históricos: los 1,8 GB incluyen `training_logs/`; el autor aclara que la evaluación debe hacerse con el adaptador del nivel raíz, no con esos checkpoints, lo que puede inducir a error si se descarga el repositorio completo.
- Adopción muy baja (17 descargas, 1 like), sin comunidad ni mantenimiento verificable: no hay garantías de soporte ni de compatibilidad con versiones futuras de `peft` o `transformers`.
- Orientado exclusivamente a inferencia: no está pensado para seguir entrenando desde este repositorio, aunque técnicamente sea posible al no estar fusionado con el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nexus-Walker/Reson
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Librería PEFT: https://github.com/huggingface/peft
- Licencia Llama 2: https://ai.meta.com/llama/license/
- DOI declarado en los metadatos del repositorio: https://doi.org/10.57967/hf/6480
- Búsqueda web: no se ha encontrado ningún artículo, paper, blog o repositorio relacionado con el modelo; los resultados devueltos corresponden a sitios homónimos sin relación (Nexus Mods, revista Nexus, proveedores de servidores).
