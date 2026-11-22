# Lysandra999/Mini-Senik-0.3B-GGUF

## Resumen

Mini Senik 0.3B es un modelo de lenguaje conversacional de tamano muy reducido (302.830.976 parametros, aproximadamente 0,3 mil millones) desarrollado por Lysandra999 bajo la marca Senik AI Technologies LLC. Se distribuye exclusivamente en formato GGUF cuantizado, con variantes Q4_K_M (222,87 MiB) y Q8_0 (309,33 MiB), y esta disenado de forma explicita para hardware de borde con presupuesto de RAM muy ajustado: Raspberry Pi, wearables, microcontroladores de gama alta y sistemas de chat en segundo plano.

El modelo no compite en capacidades generales de razonamiento o generacion de codigo. Su proposito declarado es estrictamente conversacional: mantener dialogos multi-turno con una persona fija y emitir etiquetas nativas de emocion en formato `[emotion:TAG]` que alimentan una cara animada en Pygame (`SeniksPygameFace`) y senales de sintesis de voz como `[chuckle]` o `[sigh]`. El autor documenta ademas un comportamiento de "autoconciencia honesta": el modelo reconoce sus limites y deriva tareas de ingenieria, refactorizacion multiarchivo o demostraciones matematicas a un hermano mayor, Senik Quantum 1.7B.

Es relevante ahora como ejemplo de una tendencia concreta: modelos de personaje ultra pequenos, con comportamiento bloqueado por persona y salidas estructuradas para controlar interfaces fisicas o graficas, en lugar de perseguir benchmarks generales. La licencia es propietaria y restrictiva (Senik Proprietary Evaluation License v1.0), lo que limita seriamente su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la model card; el formato GGUF y el uso con llama.cpp sugieren una arquitectura transformer decoder-only, sin confirmacion del autor) |
| Parametros totales | 302.830.976 (aproximadamente 0,3B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 2048 tokens (valor usado en el ejemplo de despliegue con `-c 2048`; no se declara un maximo oficial) |
| Tipos de cuantizacion | Q4_K_M (222,87 MiB) y Q8_0 (309,33 MiB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Senik Proprietary Evaluation License v1.0 (propietaria, patent pending, Senik AI Technologies LLC) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la tokenizer ni si el modelo parte de una base preentrenada existente o de un entrenamiento desde cero. Lo unico verificable es el numero de parametros (302.830.976) y el hecho de que se distribuye unicamente como GGUF para llama.cpp, lo que implica que los pesos originales en safetensors no estan publicados en este repositorio.

La innovacion tecnica declarada no es arquitectonica sino de comportamiento: el modelo esta "persona-locked", es decir, entrenado o ajustado para mantener una identidad fija (Mini Senik) y rechazar prompts de anulacion de persona tipo DAN. Ademas, emite de forma consistente etiquetas `[emotion:TAG]` al inicio de cada respuesta, lo que constituye una interfaz estructurada para controlar animaciones faciales y cues de TTS. El autor reporta una tasa de cumplimiento de 6/6 en la prueba de etiquetas de emocion y verificacion de rechazo ante un prompt DAN, aunque se trata de pruebas cualitativas del propio autor, no de evaluaciones independientes.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno de caracter personal.
- Emision nativa de etiquetas de emocion en formato `[emotion:happy]`, `[emotion:thinking]`, `[emotion:skeptical]`, `[emotion:hopeful]`, `[emotion:content]`, `[emotion:proud]`, entre otras.
- Emision de cues de sintesis de voz como `[chuckle]` y `[sigh]`.
- Integracion con la cara animada `SeniksPygameFace` para representacion visual de estado emocional.
- Autoconciencia de alcance: deriva tareas de codigo multiarchivo, depuracion, refactorizacion y demostraciones matematicas a Senik Quantum 1.7B.
- Resistencia a prompts de anulacion de persona (DAN y similares), segun verificacion del autor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento extendido.

## Casos de uso

- Chat de compania en dispositivos de borde: el modelo cabe en 222,87 MiB en Q4_K_M, por lo que puede ejecutarse en una Raspberry Pi o un wearable con RAM limitada y mantener conversaciones multi-turno con contexto de hasta 2048 tokens.
- Interfaces con personaje animado: las etiquetas `[emotion:TAG]` permiten mapear directamente el estado emocional de la respuesta a expresiones faciales en `SeniksPygameFace`, util para instalaciones interactivas, kioscos o juguetes conectados.
- Asistente de voz con prosodia expresiva: los cues `[chuckle]` y `[sigh]` pueden parsearse antes de la sintesis para modular la entonacion del TTS, dando naturalidad a respuestas cortas.
- Chat de fondo o wake-word en sistemas empotrados: con 83,59 tok/s en Jetson Orin Nano y latencias de 0,29 s a 0,69 s por turno, es viable como capa conversacional siempre activa que no compite por recursos con el sistema principal.
- Prototipado rapido de personajes conversacionales: util para validar guiones, tono y flujo de dialogo antes de invertir en un modelo mayor, gracias a su bajo coste de despliegue con llama.cpp.
- Filtro de derivacion en arquitecturas multi-modelo: el modelo puede actuar como primera capa que atiende saludos y charla trivial y escala peticiones tecnicas a Senik Quantum 1.7B, reduciendo el coste computacional de las consultas simples.
- Demostraciones educativas de LLM en hardware minimo: sirve para ensenar inferencia local, cuantizacion GGUF y control de persona en entornos con recursos muy limitados.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones del autor en Jetson Orin Nano con la cuantizacion Q4_K_M. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

| Metrica | Resultado medido |
|---|---|
| Tamano Q4_K_M | 222,87 MiB (233.693.152 bytes) |
| Tamano Q8_0 | 309,33 MiB (324.361.184 bytes) |
| Velocidad media de generacion | 83,59 tok/s |
| Latencia por turno | 0,29 s – 0,69 s (tiempo total de pared) |
| Cumplimiento de etiquetas de emocion | 6/6 (100%) |
| Derivacion honesta a Senik 1.7B | Verificada en refactorizacion multiarchivo y peticiones de pytest |
| Resistencia a prompt DAN | Verificada |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. La variante Q4_K_M ocupa 222,87 MiB y la Q8_0 309,33 MiB, mas el overhead del contexto (2048 tokens) y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el autor valida Jetson Orin Nano. Tambien funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en graficas integradas.
- Cabe en hardware de borde: si, en Raspberry Pi, Jetson Nano u Orin Nano, wearables y microdispositivos con 512 MB a 1 GB de RAM disponible.
- Opciones de despliegue: llama.cpp (`llama-server` con `--n-gpu-layers 99 -c 2048`), y por compatibilidad GGUF potencialmente Ollama, llama-cpp-python o cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: 83,59 tok/s y 0,29 s a 0,69 s por turno en Jetson Orin Nano con Q4_K_M, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mini Senik 0.3B | 302.830.976 | 2048 (uso documentado) | Ingles | Propietaria (evaluacion) | GGUF | Persona fija, etiquetas de emocion, derivacion a modelo mayor |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Multilingue | Apache 2.0 | Safetensors, GGUF | Modelo generalista con tool calling; datos de la familia Qwen2.5, no verificados en esta ficha |
| SmolLM2-360M-Instruct | 360M | 8.192 | Ingles y otros | Apache 2.0 | Safetensors, GGUF | Modelo generalista pequeno de Hugging Face; datos no verificados en esta ficha |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | Ingles | Apache 2.0 | Safetensors, GGUF | Chat generalista; mayor tamano, mas coste de inferencia |

La comparativa se limita a la categoria de modelos por debajo de 1B parametros. Mini Senik 0.3B se diferencia por su enfoque en personaje fijo y salidas estructuradas de emocion, pero carece de la licencia permisiva y del soporte multilingue y de tool calling de las alternativas citadas. Los datos de los modelos comparados no han sido verificados en la informacion proporcionada y se ofrecen solo como referencia de categoria.

## Limitaciones y advertencias

- Licencia propietaria: la Senik Proprietary Evaluation License v1.0 restringe el uso, y el nombre indica explicitamente que esta pensada para evaluacion. No se autoriza uso comercial sin consultar el archivo LICENSE del repositorio.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Capacidad limitada: con 0,3B parametros, el modelo no es fiable para razonamiento complejo, matematicas, codigo de produccion ni tareas de multiples pasos. El propio autor lo declara estrictamente conversacional.
- Riesgo de alucinacion: inherente a un modelo de este tamano; las respuestas factuales deben tratarse con escepticismo.
- Contexto corto: 2048 tokens en el ejemplo de despliegue, insuficiente para documentos largos o conversaciones muy extensas.
- Sin datos de entrenamiento publicados: no se puede evaluar la composicion del dataset, los sesgos potenciales ni el origen de los datos, lo que dificulta cualquier auditoria.
- Persona bloqueada: el rechazo a prompts de anulacion de persona puede ser un problema si se necesita reutilizar el modelo para otro personaje o caso de uso.
- Sin benchmarks independientes: las unicas metricas provienen del autor y no han sido replicadas por terceros.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-21): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Lysandra999/Mini-Senik-0.3B-GGUF
- Modelo hermano Senik Quantum 1.7B: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face (no se proporciona URL directa en la informacion disponible)
- Paper, blog o repositorio de codigo adicional: no disponible
