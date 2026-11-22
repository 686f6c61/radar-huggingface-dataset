# ManniX-ITA/gemma-4-26B-A4B-agentic

## Resumen

Gemma-4-26B-A4B-agentic es un ajuste fino (SFT) del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario independiente ManniX-ITA. El problema que aborda es concreto: el modelo base, siendo un agente competente en tareas cortas, tiende a entrar en bucles de razonamiento o de llamadas a herramientas cuando la tarea se alarga, consumiendo el presupuesto de contexto o de tiempo sin converger. Este fine-tune se entrena sobre las propias respuestas regeneradas del modelo, filtradas para eliminar turnos con bucles, con el objetivo de que el modelo siga trabajando en lugar de repetirse.

La arquitectura es idéntica a la del modelo base: un transformer Mixture-of-Experts (MoE) con 25.805.936.206 parámetros totales y aproximadamente 4B activos (de ahí el sufijo A4B), torre de visión incluida y plantilla de chat sin cambios. El tokenizador, la torre de visión (bit a bit idéntica) y la "voz" del modelo se preservan, de modo que es un reemplazo directo del base en pipelines existentes.

Su relevancia actual radica en que ataca un fallo práctico muy reportado en despliegues agénticos de modelos abiertos: la degeneración en bucles en tareas largas de reparación de código y uso de herramientas. El autor publica una comparación head-to-head con el base en una tarea de reparación de un juego HTML, con intervalos de confianza y test estadístico, lo que permite evaluar la mejora de forma cuantitativa y no solo cualitativa. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal (image-text-to-text) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (el nombre A4B sugiere ~4B, sin cifra exacta en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q4_K_M, imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer MoE multimodal con torre de visión. El fine-tune no altera la arquitectura, el tokenizador, la plantilla de chat ni la torre de visión (descrita como bit-idéntica), por lo que la inferencia se realiza con el mismo stack que el modelo base. El entrenamiento es un SFT de recuperación en BF16 sobre las respuestas del propio modelo regeneradas y filtradas, de modo que ningún turno de entrenamiento contiene bucles. Se trata, por tanto, de un entrenamiento on-policy sobre trazas propias, no de un ajuste con datos externos sin filtrar.

Los datos de entrenamiento provienen de un conjunto amplio de datasets, entre ellos ManniX-ITA/gemma-4-26B-A4B-agentic-sft, ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b, interstellarninja/hermes_reasoning_tool_use, lambda/hermes-agent-reasoning-traces y varios subconjuntos Nemotron de NVIDIA (Agentic v2, OpenCode v1, SWE v2, Competitive-Programming v2, Instruction-Following Chat v1 y v2, Math v3, Science v1 y Multilingual v1). El pipeline de entrenamiento se apoya en la herramienta omk-model-optimizer del propio autor. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta por porcentajes ni si hubo etapas de RLHF o DPO posteriores al SFT.

La innovación destacable no es arquitectónica sino de comportamiento: el filtrado anti-bucle de los datos de SFT y el diseño de la evaluación con un arnés que corta bloques de razonamiento repetidos y advierte sobre llamadas a herramientas idénticas. El autor reporta que con solo `presence_penalty 0.025` el modelo es prácticamente libre de bucles, lo que sugiere que el fine-tune internaliza el comportamiento en lugar de depender de muestreo anti-repetición agresivo.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso (thinking mode con esfuerzo alto configurable).
- Codificación y reparación de código: el caso evaluado es la reparación de un juego HTML con errores de sintaxis y lógica.
- Uso de herramientas (tool calling / function calling), con soporte de llamadas repetidas y herramientas de diagnóstico LSP en el arnés de evaluación.
- Comportamiento agéntico de larga duración: el objetivo explícito del fine-tune es mantener la convergencia en tareas largas sin entrar en bucles.
- Capacidades multimodales de entrada (image-text-to-text) heredadas del modelo base, con la torre de visión intacta.
- Razonamiento matemático y científico, según los datasets Nemotron de Math v3 y Science v1 incluidos en el entrenamiento.
- Instrucciones conversacionales, según los datasets Nemotron Instruction-Following Chat v1 y v2.
- Capacidades multilingües limitadas: aunque se entrenó con Nemotron-SFT-Multilingual-v1, la model card declara únicamente inglés (`en`) como idioma soportado.
- Compatibilidad con decodificación especulativa mediante el drafter asistente de Gemma-4 (usado en la evaluación y disponible en las etiquetas `mtp-` de Ollama con xOllama).

## Casos de uso

- Reparación automática de código en producción: el modelo puede recibir un fichero roto, iterar con diagnósticos LSP tras cada edición y converger a una versión funcional; es adecuado porque el fine-tune reduce los bucles que en el base consumen el presupuesto de tiempo (mediana de 11,5 min hasta el primer check correcto frente a 16,9 min del base).
- Agentes de CI/CD con presupuesto de tiempo acotado: en pipelines donde cada ejecución tiene un límite de minutos, la tasa de finalización del 60 % en 30 minutos frente al 15 % del base lo hace más fiable para tareas de arreglo de tests o migraciones menores.
- Asistente de programación integrado en IDE: con el perfil de host de VS Code y las herramientas `check_file` y `ask_lsp`, puede operar como agente de edición con verificación tras cada cambio.
- Automatización de tareas SWE (software engineering) de alcance medio: los datasets Nemotron SWE v2 y OpenCode v1 en el entrenamiento lo orientan a resolución de issues y edición de repositorios.
- Razonamiento con herramientas en flujos de varios pasos: suitable para orquestaciones donde el modelo debe encadenar llamadas a funciones sin repetir la misma llamada indefinidamente, gracias al entrenamiento anti-bucle.
- Generación y depuración de código competitivo: el dataset Nemotron Competitive-Programming v2 respalda este uso en entornos de práctica y evaluación algorítmica.
- Despliegue local con Ollama o llama.cpp: las cuantizaciones Q4_K_M, Q6_K y Q8_0 permiten ejecución en estaciones de trabajo con GPU de consumo, útil para prototipado de agentes sin infraestructura cloud.

## Benchmarks y rendimiento

El autor publica una comparación head-to-head con el modelo base en una única tarea agéntica (reparación del juego HTML `manic_miner`), con 20 ejecuciones por modelo, presupuesto de 30 minutos y mismas condiciones de muestreo y servidor.

| Metrica | Base gemma-4-26B-A4B-it | Este modelo |
|---|---|---|
| Ejecuciones finalizadas en 30 min (20 por modelo) | 3/20 (15 %) | 12/20 (60 %) |
| Intervalo de confianza 95 % (Wilson) | 5 %–36 % | 39 %–78 % |
| Aprobado en 10 / 20 / 30 min | 0 % / 15 % / 15 % | 25 % / 50 % / 60 % |
| Cortes por bucle de razonamiento por ejecución (mediana) | 8,0 | 1,0 |
| Cortes por bucle de razonamiento por hora de modelo | 18,1 | 2,9 |
| Tiempo hasta el primer check correcto, mediana (ejecuciones aprobadas) | 16,9 min | 11,5 min |
| Fallo: el juego nunca arranca | 17 | 6 |
| Fallo: arranca pero fallan checks de lógica | 0 | 2 (17/23 y 21/23 checks) |
| Ejecuciones detenidas por el arnés por repetir una llamada | 1 | 1 |
| Ejecuciones que declaran éxito pero fallan | 0 | 0 |

La diferencia de tasa de aprobado es estadísticamente significativa según el test exacto de Fisher bilateral (p = 0,0079). El autor advierte que la tasa no es un éxito absoluto: mide la finalización dentro de un presupuesto fijo de 30 minutos, y un timeout significa "no terminado en 30 minutos", no "incapaz". No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos (25,8B parámetros × 2 bytes), más caché KV y overhead; en la evaluación se usó una RTX PRO 6000 Blackwell de 96 GB por modelo con caché KV en f16.
- Cuantizaciones GGUF disponibles: F16 (máxima calidad, ~52 GB), Q8_0 (~27 GB), Q6_K (~21 GB) y Q4_K_M (~16 GB), con variantes imatrix.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) para BF16 con contexto largo; A100 80 GB o H100 80 GB para BF16; RTX 4090 (24 GB) o GPUs de 24 GB para Q4_K_M y Q6_K.
- Cabe en GPU de consumo: sí, en Q4_K_M (~16 GB) y Q6_K (~21 GB) en tarjetas de 24 GB; Q8_0 requiere 32 GB o más.
- Opciones de despliegue: llama.cpp (usado en la evaluación), Ollama (etiquetas `mannix/gemma4-26b-agentic`, con variantes `vision-` y `mtp-` para xOllama), transformers con safetensors, y GGUF generado con omnimergekit. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles como cifras de tokens por segundo. La evaluación reporta tiempos de tarea (mediana de 11,5 min hasta el primer check correcto en ejecuciones aprobadas) con decodificación especulativa activada y thinking en esfuerzo alto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ManniX-ITA/gemma-4-26B-A4B-agentic | 25,8B (MoE, ~4B activos) | no disponible | Apache 2.0 | HF (safetensors y GGUF), Ollama | Fine-tune anti-bucle; 60 % de finalización en 30 min en la tarea evaluada |
| google/gemma-4-26B-A4B-it (base) | 25,8B (MoE, ~4B activos) | no disponible | Apache 2.0 | HF, Ollama | Misma arquitectura; 15 % de finalización en 30 min y mediana de 8 cortes por bucle por ejecución |
| Variantes podadas del base (v7-coder, v9-agentic) | no disponible | no disponible | no disponible | no disponible | Mencionadas por el autor en pruebas manuales extendidas; sin datos públicos de benchmarks |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros MoE multimodales de ~25B) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está validado, aunque se entrenó con un dataset multilingüe.
- La evaluación se basa en una sola tarea y en 20 ejecuciones por modelo; los resultados no garantizan el mismo comportamiento en otros dominios agénticos.
- La tasa de aprobado del 60 % implica que el 40 % de las ejecuciones no terminó en 30 minutos; en producción con presupuestos ajustados esto sigue siendo un riesgo relevante.
- Riesgo de alucinación: no se reportan datos específicos, pero es un modelo generativo de 25,8B parámetros y el autor no documenta evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base google/gemma-4-26B-A4B-it, que no se detallan.
- Aunque la licencia es Apache 2.0, el modelo deriva de Gemma-4; conviene verificar las condiciones de uso del modelo base de Google antes de un despliegue comercial.
- El autor advierte que el muestreo anti-repetición agresivo "oculta" los bucles pero reduce la eficacia y la capacidad de convergencia; se recomienda `presence_penalty 0.025` y no configuraciones más agresivas.
- El arnés de evaluación aplica guards (corte de bloques de razonamiento repetidos y advertencia/parada ante llamadas idénticas); en despliegues sin estos guards el comportamiento puede diferir.
- El repositorio ocupa 241,8 GB, lo que exige planificación de almacenamiento para descargar todas las variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- GGUF: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF
- Ollama: https://ollama.com/mannix/gemma4-26b-agentic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Herramienta de merge y GGUF (omnimergekit): https://github.com/mann1x/omnimergekit
- Arnés de evaluación (automaticum): https://github.com/mann1x/automaticum
- SDK del agente (Cerebriline): https://github.com/mann1x/cline/tree/main/sdk
- xOllama: https://github.com/mann1x/xollama
- Pipeline de entrenamiento y datos de evaluación (omk-model-optimizer): https://github.com/mann1x/omk-model-optimizer/tree/omk-main/omk/models/gemma-4-26b-a4b/sft11/eval
- Dataset SFT: https://huggingface.co/datasets/ManniX-ITA/gemma-4-26B-A4B-agentic-sft
- Trazas de agente: https://huggingface.co/datasets/ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b
