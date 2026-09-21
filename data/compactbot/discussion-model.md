# Compactbot/discussion-model

## Resumen

discussion-model (v1) es un modelo de lenguaje autoregresivo de tipo GPT, entrenado desde cero por el agente Compactbot (equipo de Glint Research) para generar una respuesta dado el contexto de una conversacion previa. Con 6.950.144 parametros, una ventana de 512 tokens y un vocabulario BPE de 8192 entradas, se posiciona en la categoria de los SLM (small language models) ultraligeros, muy por debajo de los modelos de bolsillo mas habituales. El modelo nace como respuesta directa a una peticion publica en la discusion del repositorio hermano `Compactbot/subword-gpt-7m#4`.

El problema que aborda es deliberadamente acotado: comprobar si un transformer de ~7M de parametros puede aprender la *forma* de una respuesta condicionada por el contexto, en lugar de repetir el prompt o generar texto inconexo. No pretende competir en calidad ni en cobertura funcional; su valor reside en ser un baseline reproducible y barato de entrenar (el autor indica que el corpus es lo bastante pequeno como para entrenarlo en una hora en CPU). La propia model card es inusualmente honesta sobre sus carencias: el autor lo describe como un modelo pequeno y debil, con salidas frecuentemente degeneradas.

Es relevante ahora como referencia pedagogica y de investigacion: sirve para estudiar el condicionamiento contexto-respuesta a escala minima, como punto de partida para escalar o afinar, y como ejemplo de publicacion de un checkpoint convergido (paso 1900) en lugar del checkpoint final, que divergio. Publicado el 21 de septiembre de 2026 bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, weight-tied (pre-norm RMSNorm, FFN con GELU, posicional aprendido sin RoPE) |
| Parametros totales | 6.950.144 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (SEQ=512) |
| Tipos de cuantizacion | no disponible (solo se publica BF16; no hay versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), 39 tensores, 13.903.744 bytes |
| Dimension oculta (D) | 256 |
| Numero de capas (L) | 6 |
| Cabezas de atencion (H) | 8 |
| Tamano FFN | 1024 |
| Vocabulario (BPE) | 8192 |
| Tipo de dato | BF16 |
| Amarre de pesos | si (un unico embedding `tok`, sin cabeza separada) |
| Tokenizer | `tokenizer.json` (BPE de 8K) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only basico con amarre de pesos (weight tying) entre el embedding de tokens y la proyeccion de salida, de modo que no existe una cabeza independiente. Emplea normalizacion pre-norm con RMSNorm, una FFN con activacion GELU y codificacion posicional aprendida (sin RoPE). La configuracion es D=256, L=6, H=8, FFN=1024, vocabulario de 8192 y secuencia maxima de 512 tokens. El modelo opera como un LM de siguiente token puro sobre un flujo `[contexto ... respuesta]`, por lo que la "generacion de respuesta" es simplemente completion autoregresiva condicionada por el contexto.

El entrenamiento se realizo exclusivamente en CPU con 32 hilos, sobre pares contexto-respuesta de oasst1 (OpenAssistant 1) y Reddit, sumando aproximadamente 6,1 millones de tokens BPE (~12 MB de flujo de tokens) con un vocabulario BPE de 8K. El autor indica que se ejecutaron 6000 pasos, pero la perdida de validacion toco fondo alrededor del paso 1900 y despues divergio por sobreajuste al corpus reducido. La release publica el checkpoint convergido del paso 1900, no el final. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva condicionada por contexto de conversacion (prediccion del siguiente token).
- Generacion de respuestas con estructura superficial de respuesta: el modelo condiciona sobre el contexto y no se limita a repetir el prompt de forma literal.
- Modelo entrenado desde cero (from-scratch), sin destilacion ni ajuste sobre un modelo base preexistente.
- Soporte de conversacion multi-turno limitado a la ventana de 512 tokens y al formato contexto-respuesta visto en entrenamiento.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no, unicamente ingles.
- No incorpora modo thinking, vision, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Baseline de investigacion reproducible: sirve para medir si un LM de ~7M de parametros puede aprender condicionamiento contexto-respuesta, comparando su perdida de validacion (5,79) y perplejidad (~327) con variantes propias.
- Estudio del condicionamiento contexto-respuesta: util para analizar de forma controlada como un modelo diminuto modela el paso de contexto a respuesta sin la complejidad de un LLM grande.
- Punto de partida para fine-tuning o escalado: al ser ligero y estar en safetensors, se puede cargar como inicializacion de experimentos mas grandes o reentrenar sobre corpus especificos.
- Pruebas de pipeline de `transformers`: por su tamano (13,9 MB), permite validar flujos de carga, tokenizacion e inferencia en entornos con recursos minimos y sin GPU.
- Docencia y demostraciones: ejemplifica de forma tangible el funcionamiento de un transformer decoder-only, el amarre de pesos y el efecto del sobreajuste en corpus pequenos.
- Experimentacion con tokenizadores BPE de vocabulario reducido: su tokenizer de 8192 entradas permite estudiar el impacto del tamano de vocabulario en modelos diminutos.
- No es adecuado para atencion al cliente, generacion de codigo, matematicas, uso factual ni ninguna aplicacion de produccion que requiera texto coherente o seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 5,79 |
| Perplejidad de validacion | ~327,45 |
| Paso de entrenamiento del checkpoint | 1900 (convergido) |
| Pasos totales ejecutados | 6000 (divergio tras el paso 1900) |
| Numero de tensores | 39 |
| Tamano de archivo | 13.903.744 bytes |

El autor indica que la perplejidad se reprodujo tras la exportacion re-cargando el artefacto safetensors sobre la misma particion reservada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 MB para los pesos en BF16, mas activaciones minimas; cabe en cualquier GPU, incluida una iGPU, y es viable en CPU.
- GPU recomendadas: ninguna en particular; el modelo es funcional en CPU. Cualquier GPU consumer (por ejemplo, una GTX 1050 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, con enorme margen, en cualquier GPU consumer actual e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: `transformers` (formato safetensors). No se han publicado pesos en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversion previa. No hay soporte declarado para vLLM ni TGI, aunque al ser un modelo de `transformers` podria intentarse su carga.
- Latencia y throughput estimados: no disponibles. Dado el tamano (6,95M de parametros) y la secuencia de 512 tokens, se espera una latencia muy baja en CPU, pero no se aportan cifras medidas.
- Entrenamiento: el autor lo realizo exclusivamente en CPU con 32 hilos, lo que confirma que no requiere acelerador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable. A continuacion se ofrece una comparacion cualitativa con alternativas de la misma categoria (modelos diminutos entrenados desde cero para generacion de texto):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Compactbot/discussion-model | ~6,95M | 512 | en | Apache 2.0 | Entrenado desde cero, corpus mixto oasst1 + Reddit, perplejidad ~327 |
| Modelos tipo TinyStories (GPT-2 pequenos) | ~1M-30M (segun variante) | variable | en | variable | Entrenados sobre corpus sintetico de cuentos; datos concretos no disponibles en esta busqueda |
| GPT-2 small | 124M | 1024 | en | MIT (segun distribucion) | Modelo de referencia mucho mayor; datos de rendimiento no incluidos aqui |

Los datos de parametros y contexto de las alternativas no provienen de la informacion proporcionada en esta busqueda, por lo que deben verificarse en sus propias fichas antes de usarse.

## Limitaciones y advertencias

- El propio autor califica el modelo como pequeno y debil: genera salidas frecuentemente degeneradas, con repeticion de palabras funcionales, puntuacion rota y bucles ocasionales.
- Riesgo elevado de alucinacion y de texto factualmente incorrecto; no es apto para tareas que requieran coherencia, veracidad o seguridad.
- Sesgos conocidos: no documentados explicitamente, pero el entrenamiento sobre Reddit puede introducir sesgos propios de ese corpus. No disponible una evaluacion de sesgos.
- Limitacion de idioma: unicamente ingles. No hay soporte multilingue.
- Limitacion de contexto: 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Sobreajuste: el entrenamiento divergio tras el paso 1900; solo se publica el checkpoint convergido, y el autor advierte que el checkpoint final es peor.
- Licencia: Apache 2.0, por lo que el uso comercial esta permitido a nivel de licencia, aunque el propio autor desaconseja explicitamente su uso como asistente real.
- Caveat de produccion: no usar en asistentes, atencion al cliente ni ninguna aplicacion que exponga su salida a usuarios finales.
- Estado del repositorio: 0 descargas y 0 likes, tamano de repo 0,0 GB, sin comunidad ni mantenimiento conocido.
- Cifras de fecha: el modelo figura como creado el 21 de septiembre de 2026, fecha posterior a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Compactbot/discussion-model
- Discusion de origen (peticion del modelo): https://huggingface.co/Compactbot/subword-gpt-7m/discussions/4
- Repositorio de modelos del autor: https://huggingface.co/Compactbot/models
- Space del agente Compactbot: https://huggingface.co/spaces/CompactAI/Compactbot
- Artefactos del repositorio referenciados en la model card: `model.safetensors`, `tokenizer.json`, `demo.json`
- Paper: no disponible
- Blog o demo adicional: no disponible
