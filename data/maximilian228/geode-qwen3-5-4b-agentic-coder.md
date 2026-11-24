# Maximilian228/Geode-Qwen3.5-4B-Agentic-Coder

## Resumen

Geode-Qwen3.5-4B-Agentic-Coder es un paquete de pesos cuantizados del fine-tune de mahiatlinux `qwen3.5-4b-agentic-coder-v4`, a su vez derivado de Qwen/Qwen3.5-4B. Lo publica Maximilian228 como pack listo para Geode, una aplicación Android que ejecuta modelos de lenguaje íntegramente en el teléfono, sin nube ni cuenta de usuario. El modelo está especializado en generación de código y en comportamiento agéntico con llamadas a herramientas, y conserva el codificador de visión del modelo base, por lo que acepta entradas de imagen y texto.

La arquitectura es la de Qwen3.5: capas híbridas Gated DeltaNet combinadas con atención, vocabulario propio de Qwen3.5, codificador de visión y una capa MTP (multi-token prediction) que actúa como borrador especulativo de los siguientes tokens. El pack ocupa 3,5 GB, de los cuales 3,12 GB corresponden a los pesos de lenguaje y 0,36 GB al codificador de visión, y está pensado para teléfonos de 64 bits con 6 GB de RAM o más.

Su relevancia radica en dos factores. Por un lado, demuestra que un modelo de 4B con visión, tool calling y decodificación especulativa puede ejecutarse en hardware móvil de gama alta (Snapdragon 8 Gen 2 o superior, Adreno 7xx). Por otro, el pack incluye un complemento opcional de "menos rechazos" que actúa sobre las activaciones mediante un vector de dirección por capa, un mecanismo poco habitual en distribuciones de modelos para consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5: capas Gated DeltaNet + atención, con codificador de visión y capa MTP para decodificación especulativa |
| Parametros totales | 4B (modelo base Qwen3.5-4B); el dato de safetensors del repo (28.160) no es coherente con el tamaño declarado y se considera no fiable |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ por capas a 4 bits (q4i: 16 niveles con cero y escala de 8 bits con signo por cada 16 pesos) en todas las matrices; lm_head a 4 bits sobre todo el vocabulario; embeddings a 8 bits; capa MTP a 4 bits; codificador de visión a 8 bits |
| Idiomas soportados | no disponibles oficialmente; la calibración y evaluación cubren inglés, ucraniano, alemán y polaco, además de código y llamadas a herramientas, y la calibración incluye texto en 30 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.v2.json`); no es GGUF y no carga en otros runtimes |
| Tamano del pack | 3,5 GB (3,12 GB de lenguaje + 0,36 GB de visión) |
| Modelo base | mahiatlinux/qwen3.5-4b-agentic-coder-v4, derivado de Qwen/Qwen3.5-4B vía unsloth/Qwen3.5-4B |
| Requisitos de ejecucion | Android 11+, ARM de 64 bits con instrucciones de producto escalar (ARMv8.2), Geode 0.10.13 o superior |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que alterna capas Gated DeltaNet con capas de atención clásica, mantiene el vocabulario de la familia Qwen3.5 e incorpora un codificador de visión que permite entradas image-text-to-text. Sobre esa base, mahiatlinux realizó un fine-tune completo orientado a escritura de código y a operación como agente con llamadas a herramientas, del que no se detallan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

El trabajo de Maximilian228 no entrena pesos nuevos: cuantiza los pesos BF16 del fine-tune con GPTQ capa por capa, calibrando cada capa sobre la salida de las capas ya cuantizadas y usando conversaciones agénticas con tool calls, razonamiento propio del modelo y texto en 30 idiomas como conjunto de calibración. Los embeddings y el codificador de visión se mantienen a 8 bits y la capa MTP se cuantiza a 4 bits por redondeo. Además se convierte el tokenizador, se añade un vocabulario de borrador (`draft_vocab.bin`) para la capa MTP y se calcula el vector opcional de "menos rechazos" a partir de 320 prompts dañinos frente a 320 inofensivos, en formato de vector de control de llama.cpp, aplicado a las capas 13 a 23 con fuerza 1,5.

La innovación operativa más destacable es la capa MTP: genera borradores de los siguientes tokens que el motor verifica, de modo que la respuesta es idéntica pero llega antes. El motor de Geode puede repartir la ejecución entre NPU Hexagon, GPU Adreno y CPU en seis modos distintos (NPU+GPU, NPU+CPU, NPU, GPU, GPU+CPU, CPU).

## Capacidades

- Generación de código en múltiples lenguajes, con especialización explícita del fine-tune en tareas de programación.
- Razonamiento con modo "thinking" activable y desactivable, evaluado en ambos modos durante la cuantización.
- Llamadas a herramientas (tool calling / function calling), incluidas en la calibración y en la evaluación de calidad.
- Comportamiento agéntico multi-paso: el modelo está entrenado para trabajar como agente, no solo para completar código aislado.
- Comprensión de imágenes gracias al codificador de visión heredado de Qwen3.5-4B (pipeline image-text-to-text).
- Capacidades multilingües: la evaluación cubre inglés, ucraniano, alemán y polaco, y la calibración incluye 30 idiomas.
- Decodificación especulativa mediante capa MTP con verificación de cada borrador.
- Plantilla de chat propia (la de unsloth para Qwen3.5 con correcciones para el rol de desarrollador y las llamadas a herramientas), que produce exactamente los tokens de la plantilla de Qwen3.5 en las conversaciones que genera Geode.
- Modo opcional de "menos rechazos" que reduce drásticamente las negativas del modelo actuando sobre las activaciones.

## Casos de uso

- Asistencia a la programación en el propio teléfono: un desarrollador puede pedir explicaciones, refactorizaciones o correcciones de fragmentos de código sin conexión y sin enviar código propietario a ningún servidor, gracias a que el pack corre íntegramente en el dispositivo.
- Agente local con herramientas: el modelo puede encadenar llamadas a funciones (lectura de ficheros, consultas a APIs locales, ejecución de comandos) dentro de una app Android, lo que permite automatizar tareas de desarrollo o de sistema sin depender de la nube.
- Revisión de código asistida por imagen: al aceptar entradas de imagen, puede interpretar capturas de pantalla de errores de compilación, diagramas o fragmentos fotografiados y proponer correcciones.
- Automatización de tareas en el dispositivo con privacidad estricta: al no requerir cuenta ni conexión, encaja en escenarios con datos sensibles (código de empresa, documentación interna) donde está prohibido el envío a servicios externos.
- Prototipado rápido de agentes en móvil: investigadores pueden evaluar comportamiento agéntico y tool calling en hardware real de bolsillo, sin aprovisionar GPUs, usando los seis modos de ejecución NPU/GPU/CPU para medir latencias.
- Educación y aprendizaje de programación sin conectividad: el modelo puede explicar conceptos, generar ejercicios y corregir soluciones en entornos con red limitada o inexistente.
- Evaluación de cuantización agresiva en producción: el pack sirve como referencia de hasta dónde se puede comprimir un 4B con visión y MTP manteniendo calidad (KL de 0,011 a 0,028 según el tipo de respuesta), útil para quien diseñe pipelines de cuantización similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo BF16, medidas con teacher forcing sobre respuestas escritas por el propio modelo, con thinking activado y desactivado:

| Tipo de respuesta | KL vs BF16 | Coincidencia top-1 |
|---|---|---|
| Inglés | 0,015 | 96,2% |
| Ucraniano | 0,016 | 95,8% |
| Alemán | 0,014 | 97,1% |
| Polaco | 0,024 | 95,6% |
| Código | 0,011 | 97,0% |
| Llamadas a herramientas | 0,028 | 96,0% |
| Global del pack Q4 | 0,016 | 96,2% |

Para el complemento opcional de "menos rechazos", el autor reporta KL 0,027 y coincidencia top-1 del 94,4% frente al modelo original, sin cambio medible en la duración del razonamiento. Las solicitudes dañinas retenidas rechazadas pasan de 103/104 a 2/104 en inglés con thinking desactivado, de 101/104 a 5/104 en inglés con thinking activado, de 26/30 a 1/30 en ucraniano con thinking desactivado y de 28/30 a 3/30 en ucraniano con thinking activado; las solicitudes inofensivas pasan de 0/64 a 1/64 rechazadas.

No se proporcionan cifras de latencia ni de throughput en la información disponible; el autor remite a geode.tifu.xyz/board para las velocidades medidas.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el pack está diseñado para memoria unificada de teléfono. Ocupa 3,5 GB en almacenamiento y requiere un dispositivo con 6 GB de RAM o más.
- GPU de escritorio: el pack no carga en runtimes de escritorio (no es GGUF ni safetensors estándar), por lo que no se puede ejecutar en A100, H100 o RTX 4090 con vLLM, llama.cpp, Ollama o TGI.
- Hardware móvil recomendado: Snapdragon 8 Gen 2 o superior para usar la NPU Hexagon; GPU Adreno 7xx o superior para el modo GPU. Sin NPU ni GPU compatibles, el modelo se ejecuta en la CPU.
- Requisitos mínimos: Android 11+, procesador ARM de 64 bits con instrucciones de producto escalar (ARMv8.2) y espacio libre suficiente para el pack.
- Despliegue: exclusivamente mediante la aplicación Geode 0.10.13 o superior. Se puede instalar desde Google Play o descargar el pack desde Hugging Face dentro de la propia app.
- Modos de ejecución disponibles: NPU+GPU (por defecto), NPU+CPU, NPU, GPU, GPU+CPU y CPU, con reparto configurable de prompt y respuesta.
- Latencia y throughput: no disponibles en la información proporcionada; se remite al tablón de velocidades de Geode.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Tool calling | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|---|
| Geode-Qwen3.5-4B-Agentic-Coder | 4B (dato del base) | no disponible | Sí | Sí | Apache-2.0 | Formato propio de Geode, solo Android |
| Qwen/Qwen3.5-4B | 4B | no disponible | Sí | Sí (capacidad del base) | Apache-2.0 | Safetensors, GGUF vía terceros, múltiples runtimes |
| mahiatlinux/qwen3.5-4b-agentic-coder-v4 | 4B | no disponible | Sí | Sí | Apache-2.0 | Pesos BF16 del fine-tune, para convertir a otros formatos |
| unsloth/Qwen3.5-4B | 4B | no disponible | Sí | Sí | Apache-2.0 | Safetensors y GGUF, orientado a fine-tuning y despliegue general |

La diferencia principal frente a las alternativas no está en el modelo en sí, sino en el empaquetado: este pack solo funciona en Geode y en Android, mientras que los otros tres pueden desplegarse en servidores, portátiles o runtimes de escritorio. A cambio, ofrece una cuantización GPTQ verificada con métricas de fidelidad explícitas y una capa MTP lista para decodificación especulativa en el dispositivo.

## Limitaciones y advertencias

- El pack no es GGUF ni safetensors estándar: no se puede cargar en llama.cpp, Ollama, vLLM, TGI ni en ninguna herramienta de escritorio. La portabilidad es nula fuera de Geode.
- Depende de una versión concreta de la app (Geode 0.10.13 o superior); versiones anteriores no reconocen el manifiesto `geode.v2.json`.
- Solo funciona en Android 11+ sobre ARMv8.2 de 64 bits; no hay soporte para iOS, x86 ni otros sistemas.
- La cuantización a 4 bits introduce divergencia respecto al BF16, mayor en llamadas a herramientas (KL 0,028) y en polaco (KL 0,024) que en código (KL 0,011). En tareas agénticas sensibles conviene validar las salidas.
- El modo "menos rechazos" elimina un comportamiento de seguridad del modelo: con el interruptor activado, el modelo rechaza apenas un 2-5% de las solicitudes dañinas retenidas. El autor declara explícitamente que la responsabilidad del uso recae en el usuario.
- No hay datos publicados sobre sesgos, tasas de alucinación ni evaluación de seguridad independiente.
- No se especifica la longitud de contexto soportada, lo que impide planificar tareas que dependan de ventanas largas.
- El listado de idiomas soportados no está declarado oficialmente; la cobertura multilingüe se infiere de la calibración (30 idiomas) y de la evaluación (inglés, ucraniano, alemán, polaco), no de una declaración del autor.
- El dato de parámetros en safetensors del repo (28.160) es inconsistente con el tamaño del modelo y no debe usarse como referencia.
- El modelo es un fine-tune de terceros sobre Qwen3.5-4B; la licencia Apache-2.0 se hereda, pero la calidad del fine-tune no está avalada por el equipo de Qwen.
- Al ser un modelo de 4B, su capacidad de razonamiento y de código es limitada en comparación con modelos mucho mayores; no es adecuado como sustituto de un modelo de servidor en tareas complejas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Maximilian228/Geode-Qwen3.5-4B-Agentic-Coder
- Fine-tune base: https://huggingface.co/mahiatlinux/qwen3.5-4b-agentic-coder-v4
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión de unsloth: https://huggingface.co/unsloth/Qwen3.5-4B
- Aplicación Geode: https://geode.tifu.xyz
- Tablón de velocidades medidas: https://geode.tifu.xyz/board
