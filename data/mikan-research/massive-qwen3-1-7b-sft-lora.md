# mikan-research/massive-qwen3-1.7b-sft-lora

## Resumen

El modelo `mikan-research/massive-qwen3-1.7b-sft-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen3-1.7B` de Alibaba. Lo desarrolla el proyecto de investigacion Mikan y su proposito es muy concreto: convertir una peticion de un asistente de voz en ingles estadounidense en una representacion JSON estructurada con la forma `{"intent": ..., "slots": [{"type": ..., "value": ...}]}`, cubriendo 60 intenciones y 55 tipos de slot. No es un modelo generalista, sino un componente especializado en *semantic parsing* y *slot filling* para un dominio cerrado.

La relevancia del proyecto reside en su metodologia: forma parte de un pipeline de destilacion que traslada el comportamiento de un modelo profesor grande (Qwen3-30B-A3B-Instruct-2507 en cuantizacion 4-bit GPTQ) a un modelo estudiante pequeno, y valida la equivalencia mediante un test de no inferioridad con margen pre-registrado de 3 puntos. El adaptador alcanza un 65,0% de coincidencia exacta de frame frente al 64,4% del profesor sobre el split de test en-US de MASSIVE (2.974 items), lo que supone una diferencia de -0,6 puntos con un intervalo de confianza bootstrap al 95% de [-2,2, 1,0] y un resultado de PASS en la prueba de no inferioridad.

Tecnicamente se trata de un adaptador PEFT de rango 16 sobre las proyecciones lineales del transformer Qwen3-1.7B, entrenado con SFT supervisado y pensado para operar con el modo de razonamiento (*thinking*) desactivado. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | No disponible (el adaptador LoRA es de rango 16; el modelo base Qwen3-1.7B tiene 1,7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | Ingles estadounidense (en-US) exclusivamente, segun el dataset MASSIVE en-US |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 (alpha 32) |
| Modulos adaptados | Todas las proyecciones lineales |
| Dataset de entrenamiento | AmazonScience/massive y mikan-research/massive-distill |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La intervencion LoRA utiliza rango 16 y alpha 32 sobre todas las proyecciones lineales del modelo, lo que permite ajustar el comportamiento sin modificar los pesos originales. La generacion se plantea en modo no-thinking (`enable_thinking=False`), con decodificacion determinista (`do_sample=False`) y un limite de 96 tokens nuevos, suficiente para emitir el frame JSON.

El entrenamiento consistio en SFT (supervised fine-tuning) con LoRA, tasa de aprendizaje 0,0002 con schedule coseno, 3 epocas, tamano de batch 32, precision fp16 y optimizador AdamW de 8 bits. La perdida se calcula unicamente sobre la completion (no sobre el prompt). El checkpoint final se selecciono por maxima exactitud de frame en validacion, resultando la epoca 2. El stack fue Unsloth 2026.11.12 junto con TRL 1.19.0, ejecutado en una unica GPU Tesla T4. Los datos de entrenamiento son frames generados por un profesor (destilacion) sobre el dataset MASSIVE (FitzGerald et al., 2022), que contiene 1 millon de ejemplos multilingues en 51 idiomas; aqui se emplea exclusivamente el subconjunto en-US. El autor menciona tambien el uso de GRPO entre las etiquetas del repositorio, aunque la model card describe el entrenamiento como SFT.

## Capacidades

- Generacion de frames JSON estructurados con intencion y lista de slots a partir de una peticion en lenguaje natural en ingles.
- Semantic parsing restringido a un esquema cerrado de 60 intenciones y 55 tipos de slot.
- Slot filling: extraccion de valores (fechas, horas, lugares, nombres, etc.) asociados a su tipo.
- Generacion de texto conversacional heredada del modelo base Qwen3-1.7B.
- Operacion en modo sin razonamiento (thinking off), lo que reduce latencia y verbosidad.
- Salida valida en el 99,8% de los casos; el resto de frames invalidos usan una intencion o tipo de slot fuera del esquema, que la decodificacion restringida elimina.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada (no se documenta para este adaptador).

## Casos de uso

- Asistente de voz para dispositivos del hogar: el adaptador traduce una frase como "wake me up at nine am on friday" en un frame con intencion y slots que un motor de dialogo puede consumir directamente, sin necesidad de un LLM grande en el dispositivo.
- Enrutamiento de intenciones en un bot conversacional: al mapear la peticion a una de las 60 intenciones, permite dirigir la conversacion al flujo adecuado con bajo coste computacional.
- Extraccion de entidades para pipelines de NLU: los slots tipados (55 tipos) alimentan sistemas de reservas, calendario o control de dispositivos con valores ya estructurados.
- Destilacion y evaluacion de modelos: sirve como caso de referencia para medir no inferioridad de un estudiante pequeno frente a un profesor grande en una tarea estrecha, con margen pre-registrado y bootstrap pareado.
- Inferencia en hardware modesto: al ser un adaptador de 0,1 GB sobre un modelo de 1,7B, puede desplegarse en una unica GPU T4 o en GPUs de consumo para procesamiento por lotes de peticiones.
- Prototipado de sistemas de voz embebidos: el modo thinking-off y la decodificacion determinista facilitan respuestas reproducibles y de baja latencia en produccion.
- Generacion de datos sinteticos de frames: el modelo puede producir frames etiquetados para aumentar datasets de NLU en dominios similares.

## Benchmarks y rendimiento

Evaluacion sobre el split de test de MASSIVE en-US (2.974 items, frames de referencia gold). La metrica es coincidencia exacta de frame: la intencion y todos los pares (tipo de slot, valor) deben coincidir con el gold.

| Modelo | Exact frame match |
|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 65,0% |
| Profesor (Qwen3-30B-A3B-Instruct-2507, 4-bit GPTQ, 8 ejemplos recuperados) | 64,4% |

Diferencia profesor - estudiante: -0,6 puntos; IC bootstrap pareado al 95%: [-2,2, 1,0]. Margen de no inferioridad de 3 puntos: PASS. Frames validos: 99,8%.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB de pesos mas overhead de activaciones y KV cache, y el adaptador anade un peso minimo (0,1 GB en el repositorio).
- GPU recomendadas: el entrenamiento se realizo en una unica Tesla T4; para inferencia es suficiente una T4, una RTX 4090 o cualquier GPU con al menos 8 GB de VRAM en fp16.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM (no verificado en la informacion proporcionada).
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no se mencionan para este adaptador, por lo que su compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles. El limite de 96 tokens nuevos y la decodificacion greedy sugieren una generacion corta y predecible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (exact frame match, MASSIVE en-US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7B (base) | No disponible | 65,0% | Apache 2.0 | Hugging Face |
| Profesor Qwen3-30B-A3B-Instruct-2507 (4-bit GPTQ) | 30B totales (MoE) | No disponible | 64,4% | No disponible en la informacion | Referencia del pipeline Mikan |
| Modelo base Qwen3-1.7B sin adaptador | 1,7B | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros adaptadores o modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio y idioma muy restringidos: solo ingles estadounidense y solo el esquema de 60 intenciones y 55 tipos de slot de MASSIVE en-US; fuera de ese esquema la salida sera invalida.
- Riesgo de alucinacion en los valores de slot: el modelo puede generar valores plausibles pero incorrectos; se recomienda validacion posterior contra el esquema y, si es posible, decodificacion restringida.
- El 0,2% de frames invalidos restantes corresponden a intenciones o tipos de slot fuera del esquema, lo que exige un filtro en produccion.
- La exactitud del 65,0% implica que aproximadamente un tercio de los frames no coincide exactamente con el gold, por lo que no es adecuado para tareas donde se exija precision total sin verificacion humana o de reglas.
- El adaptador depende del modelo base Qwen3-1.7B; no es un modelo autonomo y requiere cargar ambos.
- La model card no documenta sesgos especificos, cobertura multilingue ni comportamiento fuera del dataset MASSIVE.
- Licencia Apache 2.0 permite uso comercial, pero el dataset MASSIVE se distribuye bajo CC-BY-4.0, lo que conviene verificar si se redistribuyen datos derivados.
- No se documentan limitaciones de contexto ni de latencia; la ventana efectiva depende del modelo base y no se especifica en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikan-research/massive-qwen3-1.7b-sft-lora
- Repositorio del proyecto Mikan: https://github.com/mikan-research/mikan
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset MASSIVE (AmazonScience): https://huggingface.co/datasets/AmazonScience/massive
- Dataset de destilacion mikan-research/massive-distill: https://huggingface.co/datasets/mikan-research/massive-distill
- Paper de MASSIVE (FitzGerald et al., 2022): no disponible como enlace directo en la informacion proporcionada
