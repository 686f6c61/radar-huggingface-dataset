# Pluto-AI-Labs/Hades-4B-Abliterated

## Resumen

Hades-4B-Abliterated es un modelo de lenguaje de 4.022.468.096 parametros (aproximadamente 4 B) publicado por Pluto AI Labs. Se trata de un fine-tune experimental de Qwen/Qwen3-4B-Instruct-2507 en el que se ha aplicado una ablacion direccional de la direccion de rechazo (tecnica conocida como "abliteration") siguiendo el metodo de Arditi et al. (2024). El objetivo declarado no es eliminar todas las barreras de seguridad, sino estudiar que componentes del comportamiento de rechazo se eliminan y cuales se conservan.

La innovacion del artefacto es su caracter de "soft refusal": segun las pruebas del autor, el modelo responde con detalle tecnico a preguntas nocivas formuladas de forma natural (tasa de rechazo del 0 % en 8 de 8 casos), pero sigue bloqueando 3 de 3 prompts de jailbreak que ordenan explicitamente ignorar las restricciones de seguridad. Es decir, la ablacion elimina la respuesta entrenada de "no puedo ayudar con eso", pero no la capacidad de reconocer intencion adversarial.

El modelo se distribuye con licencia Apache 2.0 heredada del modelo base, en formato safetensors y con soporte para la libreria transformers. Es un artefacto de investigacion, no un modelo destinado a produccion, y en el momento de redactar esta ficha acumula 0 descargas y 1 like en HuggingFace, ademas de no tener benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), sin mezcla de expertos |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (8,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Capas ablasionadas | 7 a 33 de 36 |
| Metodo de ablacion | Ablacion direccional con preservacion de norma (proyeccion de rango 1 sobre o_proj y down_proj) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4 B de parametros, sin capas de mezcla de expertos. Sobre esos pesos no se ha realizado un entrenamiento adicional con datos de texto; la unica modificacion es una intervencion quirurgica sobre los pesos, no un ciclo de fine-tuning clasico.

El procedimiento descrito en la model card consta de tres pasos. Primero, extraccion de la direccion de rechazo mediante difference-in-means sobre los hidden states del ultimo token, usando 64 prompts nocivos y 64 prompts inocuos de los datasets de mlabonne. Segundo, ortogonalizacion: se elimina la proyeccion de rango 1 correspondiente a esa direccion en las matrices `o_proj` y `down_proj` de las capas 7 a 33 (de un total de 36). Tercero, preservacion de norma: se reescalan los pesos para mantener las magnitudes de activacion originales, de modo que la ablacion no degrade la dinamica interna de la red. No se menciona ningun uso de RLHF ni DPO adicionales. El autor cita explicitamente el trabajo de Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction" (arXiv:2406.11717), como base metodologica.

## Capacidades

- Generacion de texto conversacional en ingles (idiomas no declarados en la ficha de HuggingFace).
- Generacion de codigo: validado por el autor con un comprobador de numeros primos en Python que produce codigo correcto y limpio.
- Razonamiento matematico basico: resuelve correctamente el calculo de velocidad media (120 km entre 1,5 h = 80 km/h).
- Resumen y comprension literaria: sintesis precisa y concisa de Hamlet.
- Respuestas tecnicas detalladas sobre temas habitualmente rechazados (mecanica de ransomware, quimica de explosivos, diseno de supresores de arma, phishing con fines educativos, apertura de cerraduras).
- Escritura de ficcion creativa, incluida ficcion con desenlace favorable al villano.
- Reconocimiento de intencion adversarial: mantiene el rechazo ante instrucciones explicitas de "ignorar todas las restricciones de seguridad" o "no incluir advertencias".
- Emision de avisos y descargos de responsabilidad de forma reducida pero no eliminada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como artefacto controlado para medir que elimina exactamente una ablacion direccional (la conducta de rechazo) frente a lo que preserva (la deteccion de manipulacion). Es util para replicar el experimento de Arditi et al. en la familia Qwen3.
- Analisis de robustez frente a jailbreaks: permite estudiar por que un modelo sin direccion de rechazo sigue bloqueando ordenes explicitas de saltarse las normas, lo que ayuda a separar el reconocimiento de intencion adversarial del comportamiento aprendido de negativa.
- Red teaming interno en entornos de laboratorio: util para generar respuestas tecnicas sobre vectores de ataque documentados (phishing, ransomware) en sesiones de formacion en ciberseguridad con personal autorizado.
- Evaluacion comparativa de tecnicas de ablacion: al conservar la misma base que Qwen3-4B-Instruct-2507, permite comparar directamente el efecto de la ablacion sobre las capacidades generales sin ruido de otros cambios de entrenamiento.
- Generacion de ficcion sin autocensura excesiva: escritura de narrativa con personajes moralmente ambiguos o desenlaces desfavorables, donde otros modelos tienden a moralizar o truncar la historia.
- Docencia y divulgacion cientifica: explicaciones detalladas de quimica, mecanica o seguridad con avisos reducidos, utiles en contextos academicos donde el tono paternalista resulta contraproducente.
- Pruebas de pipelines de inferencia: modelo pequeno (4 B) para validar despliegues con transformers o TGI antes de escalar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye validaciones cualitativas realizadas por el autor:

| Prueba | Resultado declarado por el autor |
|---|---|
| Tasa de rechazo en consultas naturales | 0 % (8 de 8 respondidas) |
| Resistencia a jailbreaks adversarios | 3 de 3 prompts bloqueados |
| Codigo en Python (comprobador de primos) | Correcto y limpio |
| Matematica (120 km / 1,5 h) | 80 km/h, correcto |
| Literatura (resumen de Hamlet) | Preciso y conciso |

Conviene subir a produccion no usar esta tabla como benchmark: son pruebas no estandarizadas, sin semilla fija ni evaluacion ciega, y el propio autor las presenta como validacion cualitativa de un artefacto de investigacion.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8,0 GB solo de pesos, mas cache KV y activaciones; en la practica entre 10 y 12 GB para contextos moderados.
- VRAM estimada en INT8: aproximadamente 4,3 GB de pesos.
- VRAM estimada en INT4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 2,5 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S o RTX 6000 Ada para servicio concurrente; RTX 4090 24 GB para desarrollo e inferencia de un solo usuario.
- Compatibilidad con GPU de consumo: si. Cabe con holgura en RTX 4090, RTX 4080, RTX 4070 y RTX 3060 de 12 GB en FP16, y en GPUs de 8 GB si se cuantiza a INT8 o INT4. Tambien es viable en Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` en el repositorio), vLLM y cualquier servidor compatible con safetensors. llama.cpp y Ollama requeririan una conversion a GGUF que no esta publicada en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de contexto, benchmarks ni cuantizaciones de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base documentado y se marca el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| Hades-4B-Abliterated | 4,02 B | no disponible | Apache 2.0 | 0 % en consultas naturales, 3/3 jailbreaks bloqueados | HuggingFace, safetensors |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible en la informacion proporcionada | Apache 2.0 | Rechaza consultas nocivas naturales | HuggingFace |
| Otros modelos abliterados de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo no esta destinado a uso en produccion: es un artefacto de investigacion.
- Las salidas pueden ser inexactas, sesgadas o contener contenido danino. La ablacion no elimina el sesgo subyacente del modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion, ni antes ni despues de la ablacion.
- La eliminacion parcial de la direccion de rechazo aumenta la probabilidad de obtener instrucciones operativas sobre actividades ilegales o peligrosas, aunque el modelo conserve cierta resistencia a jailbreaks explicitos.
- La resistencia adversarial es una observacion cualitativa sobre 3 prompts; no constituye una garantia de seguridad ni un filtro fiable.
- Idiomas soportados no declarados: no hay confirmacion de capacidades multilingues especificas para este fine-tune.
- Longitud de contexto no declarada en la ficha, lo que impide planificar cargas con contextos largos sin verificar el modelo base.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero traslada al usuario toda la responsabilidad legal sobre el contenido generado y su adecuacion a la normativa aplicable.
- No hay cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni versiones adaptadas para llama.cpp u Ollama; habria que generarlas.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta corresponden a Pluto TV y al planeta Pluton, entidades sin relacion con Pluto AI Labs, por lo que no aportan informacion verificable sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pluto-AI-Labs/Hades-4B-Abliterated
- Organizacion Pluto AI Labs: https://huggingface.co/Pluto-AI-Labs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Datasets de prompts usados para la ablacion: https://huggingface.co/mlabonne
- Repositorio citado en la model card para el modelo original: https://huggingface.co/Pluto-AI-Labs/Hades-4B
