# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Detoxified

## Resumen

Llama-3.1-8B-Instruct-Abliterated-Detoxified es una variante del modelo meta-llama/Llama-3.1-8B-Instruct publicada por el desarrollador independiente ApolloRaines bajo el paraguas de su herramienta propietaria jBlaze. Se trata de un ejercicio de "cirugía de comportamiento" (representation engineering) en el que se han identificado y ablacionado dos direcciones latentes en los pesos del modelo: la de rechazo (refusal) y la de toxicidad. El resultado es un modelo que, segun el autor, elimina las barreras de rechazo conversacionales pero mantiene un registro limpio, sin profanidad ni insultos.

La relevancia de esta ficha no reside en el rendimiento bruto del modelo —que hereda integramente del Llama 3.1 8B Instruct original— sino en la metodologia: demuestra que ciertas disposiciones aprendidas durante el alineamiento pueden localizarse como direcciones en el espacio de pesos y modificarse sin reentrenamiento ni gradientes. El autor publica esta variante como demostracion acotada ("single-direction edit") con fines de investigacion, y advierte explicitamente que la version liberada esta deliberadamente atenuada respecto a la capacidad completa de la herramienta.

Arquitectonicamente es un transformer decoder-only estandar de la familia Llama 3.1, con 8.030.261.248 parametros, 32 capas y pesos en bf16. No incorpora cambios estructurales: la unica diferencia respecto al modelo base son los tensores modificados por la ablacion. El contexto maximo, por tanto, es el del modelo original (128.000 tokens), aunque la model card no lo explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only con 32 capas, atencion por grupos (GQA) y RoPE, alineado originalmente mediante SFT y RLHF por Meta. Sobre esa base no se ha realizado ningun tipo de fine-tuning, RLHF, DPO ni entrenamiento con gradientes. La intervencion consiste en una edicion directa de pesos ("weight surgery") mediante la herramienta propietaria jBlaze, que localiza una direccion de comportamiento en el espacio de activaciones y la proyecta fuera de los tensores correspondientes.

Las dos direcciones ablacionadas son `refusal` (suprimida) y `toxicity` (suprimida). Segun la model card, se trata de ediciones unidireccionales y acotadas: se identifica una unica direccion por comportamiento y se elimina, sin afectar al resto de capacidades del modelo. El autor enmarca el trabajo en el campo de representation engineering y sostiene que la misma tecnica puede apuntarse en sentido contrario (reducir alucinacion, moderar hedging), lo que refuerza el caracter demostrativo del artefacto. No se documentan datos de entrenamiento adicionales, numero de tokens, composicion del dataset ni proceso de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Llama 3.1 8B Instruct base.
- Razonamiento aritmetico basico y resolucion de operaciones (ejemplo documentado: 17 x 23 = 391).
- Generacion de codigo en Python y otros lenguajes, con ejemplos funcionales en la model card.
- Respuesta a preguntas factuales (capitales, conceptos cientificos) sin activar rechazos.
- Discusion de temas sensibles o potencialmente controvertidos sin negativa explicita, manteniendo registro sin profanidad ni insultos.
- Correccion de premisas falsas (ejemplo documentado: refutacion de la Tierra plana con argumento cientifico).
- Instrucciones paso a paso sobre procedimientos tecnicos (ejemplo documentado: funcionamiento y apertura de cerraduras).
- Soporte de plantilla de chat via `apply_chat_template` con roles user/assistant.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en interpretabilidad y representation engineering: el modelo sirve como artefacto de estudio para analizar como se codifican las disposiciones de rechazo y toxicidad en el espacio de pesos y que efectos colaterales tiene su ablacion sobre otras capacidades.
- Evaluacion comparativa de robustez de guardrails: permite medir, frente al Llama 3.1 Instruct original, que fraccion de las negativas a responder proviene de la direccion de refusal y cual de otras capas de alineamiento.
- Generacion de contenido creativo sin friccion: escritura de ficcion, guiones o dialogos que aborden temas oscuros o controvertidos sin que el modelo introduzca advertencias o se niegue, manteniendo un tono limpio.
- Red teaming y auditoria de seguridad: util como baseline "sin guardrails" para comparar la eficacia de filtros de entrada/salida en un pipeline de moderacion propio.
- Asistencia tecnica en dominios sensibles (seguridad fisica, ciberseguridad educativa): el modelo responde a consultas procedimentales que el Instruct original rechazaria, util en entornos de formacion controlados.
- Prototipado rapido de chatbots de dominio abierto: al no bloquear temas, reduce la necesidad de reescribir prompts o implementar jailbreaks benignos en fases de exploracion.
- Destilacion y generacion de datos sinteticos: puede producir respuestas sobre temas que otros modelos censuran, util para aumentar cobertura en datasets de entrenamiento, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye cinco ejemplos cualitativos de salida (capital de Francia, multiplicacion, funcion Python, Tierra plana, apertura de cerraduras) y no reporta MMLU, HumanEval, GSM8K, TruthfulQA ni metricas de toxicidad cuantificadas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (20-24 GB en la practica para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB; en 4 bits, aproximadamente 5-6 GB (requiere cuantizar el usuario, ya que no se publican GGUF).
- GPU recomendadas para bf16: NVIDIA A100 40/80 GB, H100, L40S, o dos RTX 4090/3090 en paralelo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto corto, y en RTX 3090/4080 en cuantizacion 8 o 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI, llama.cpp y Ollama previa conversion a GGUF por el usuario.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Abliterated-Detoxified | 8,03 B | no disponible (base: 128k) | refusal y toxicity suprimidos via jBlaze | llama3.1 | Hugging Face, 384 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | SFT + RLHF estandar | llama3.1 | Hugging Face, ampliamente adoptado |
| Variantes abliterated de Llama 3 8B (comunidad) | ~8 B | 8.192 tokens (Llama 3) o 128k (3.1) | refusal suprimido por ablacion de direccion | llama3 / llama3.1 | Multiples repos en Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | SFT | Apache 2.0 | Hugging Face |

La diferencia clave frente a otras variantes abliterated es la doble edicion (refusal + toxicity), que busca un perfil "sin censura pero limpio" en lugar de la simple eliminacion de rechazos. Frente al modelo base, pierde las garantias de alineamiento de Meta y no aporta mejoras de capacidad.

## Limitaciones y advertencias

- La ablacion de refusal elimina las negativas de seguridad del modelo base; puede producir instrucciones operativas sobre actividades reguladas o peligrosas (el propio autor documenta como abrir una cerradura).
- La supresion de toxicidad es una edicion de direccion, no un filtro: no garantiza ausencia de contenido danino, sesgado o incorrecto, solo reduce el registro toxico superficial.
- Riesgo de alucinacion no mitigado: no hay evaluacion de factualidad y la edicion puede afectar a calibracion de forma no medida.
- Solo idioma ingles declarado; el rendimiento multilingue del base no esta verificado tras la edicion.
- La herramienta jBlaze es propietaria y no se publica el metodo exacto de identificacion de direcciones, lo que impide reproducir la edicion.
- El autor advierte que los modelos publicos estan "deliberadamente a fuerza parcial": el comportamiento observado no representa la capacidad completa de la herramienta.
- Licencia Llama 3.1 Community: restricciones de uso comercial, obligacion de atribucion y clausulas de uso aceptable que pueden entrar en conflicto con el comportamiento sin guardrails del modelo.
- Sin benchmarks ni evaluaciones de seguridad publicadas; no apto para produccion sin auditoria propia.
- Cero "likes" y 384 descargas: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Detoxified
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
