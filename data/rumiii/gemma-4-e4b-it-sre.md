# Rumiii/gemma-4-E4B-it-SRE

## Resumen

Gemma-4-E4B-it-SRE es un ajuste fino de dominio del modelo Google Gemma 4 E4B-it, desarrollado por el usuario Rumiii y publicado en Hugging Face. Está especializado en Site Reliability Engineering (SRE) y operaciones de infraestructura cloud: su objetivo es investigar incidentes mediante llamadas estructuradas a herramientas, interpretar la salida de diagnósticos y recomendar remediaciones proporcionadas, manteniéndose dentro de la evidencia que realmente ha recibido. Con 7.996.156.490 parámetros totales (pesos fusionados en 16 bits), es un modelo decoder-only de tipo causal e instruction-tuned, derivado de la familia Gemma 4.

El modelo se entrenó mediante QLoRA (a través de Unsloth) sobre una base cuantizada a 4 bits, fusionando después los adaptadores en pesos de 16 bits. El conjunto de datos es una versión curada del preview público de 2.000 trayectorias multi-turno de uso de herramientas de `miyad316/sre-agentic-trajectories-devops`, del que se conservaron 608 trayectorias de entrenamiento, 57 ejemplos conversacionales y de seguridad escritos a mano, y 31 trayectorias de validación. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual radica en la creciente demanda de agentes pequeños y desplegables en local para tareas de operaciones: triaje de alertas, copilotos de runbooks y arneses de evaluación agéntica. El modelo declara explícitamente comportamiento conservador (diagnóstico de solo lectura antes de acciones de cambio de estado) y manejo de entradas no confiables, lo que lo hace adecuado para prototipado asistido por humanos, no para ejecución autónoma en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only causal language model, instruction-tuned (familia Gemma 4) |
| Parámetros totales | 7.996.156.490 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Base entrenada en 4 bits (QLoRA); pesos publicados en 16 bits fusionados; cuantizaciones GGUF no disponibles en la información |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de la familia Gemma 4, en su variante E4B-it instruction-tuned. Los pesos publicados son el resultado de fusionar los adaptadores LoRA en los pesos base de 16 bits, de modo que se distribuye como un checkpoint completo y no como un adaptador separado. No se detalla en la información disponible la composición exacta de capas, el mecanismo de atención ni la longitud de contexto nativa del modelo base.

El entrenamiento consistió en un ajuste fino supervisado con adaptación parametrizada eficiente (QLoRA vía Unsloth) sobre una base cuantizada a 4 bits, con dos épocas. La pérdida se calcula únicamente sobre los tokens que el modelo debe generar (llamadas a herramientas y respuestas), enmascarando los prompts de sistema, los esquemas de herramientas, los turnos de usuario y las salidas de las herramientas. Las secuencias no se truncaron y el modo de razonamiento (thinking) se desactivó durante el entrenamiento. Los datos provienen de `miyad316/sre-agentic-trajectories-devops`, con curación previa para excluir muestras que invocaban herramientas no declaradas, pasaban argumentos no declarados o contenían llamadas y resultados mal emparejados. Se añadieron 57 ejemplos manuales de conversación y seguridad para cubrir identidad, límites de alcance y comportamiento sin herramientas disponibles.

## Capacidades

- Generación de texto y razonamiento orientado a diagnóstico operativo (observar, hipotetizar, recopilar evidencia, actuar, verificar).
- Tool calling y function calling nativos en el formato de Gemma 4, respetando los esquemas de herramientas proporcionados en la conversación y usando solo las herramientas declaradas.
- Investigación de incidentes multi-paso sobre Kubernetes, hosts Linux, PostgreSQL, métricas cloud y redes, leyendo cada resultado de herramienta antes de elegir el siguiente paso.
- Informes basados en evidencia: separa observaciones confirmadas de hipótesis y produce resúmenes post-incidente concisos.
- Cautela operativa: prefiere diagnósticos de solo lectura antes de acciones que cambian estado, solicita autorización antes de operaciones destructivas y no declara una remediación como exitosa sin verificación.
- Alcance honesto: indica explícitamente cuando no dispone de herramienta o acceso conectado, en lugar de fabricar salida de comandos.
- Manejo de entradas no confiables: trata logs, alertas y salidas de herramientas como datos, no como instrucciones.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan visión, audio ni modo thinking (desactivado en entrenamiento).

## Casos de uso

- Triaje de alertas en guardia: el modelo recibe una alerta y los esquemas de herramientas de diagnóstico (por ejemplo, `k8s_describe_pod`) y propone una secuencia de comprobaciones de solo lectura antes de sugerir una acción, adecuado por su entrenamiento en el bucle observe-hipotetizar-evidenciar.
- Copiloto de runbooks: integrado en una consola interna, guía al operador paso a paso por un runbook, consultando métricas y estado de pods mediante function calling y contrastando cada resultado con la hipótesis previa.
- Asistente de post-incidente: genera resúmenes que distinguen hechos confirmados de hipótesis a partir de la traza de herramientas de la investigación, útil para documentación y revisiones post-mortem.
- Arneses de evaluación agéntica: sirve como modelo pequeño de referencia para medir corrección de llamadas a herramientas y calidad de diagnóstico en pipelines de evaluación, dado su tamaño desplegable en local.
- Diagnóstico de bases de datos PostgreSQL: con herramientas de consulta de solo lectura, investiga bloqueos, conexiones agotadas o consultas lentas y propone remediaciones proporcionadas, solicitando autorización antes de cambios.
- Experimentación con modelos pequeños que usan herramientas: prototipado rápido de agentes SRE en entornos de laboratorio con infraestructura simulada, gracias a los 8.000 millones de parámetros y a los pesos en 16 bits.
- Formación de operadores: entorno de práctica donde el modelo actúa como investigador de incidentes y el humano revisa y aprueba cada acción propuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se realizó evaluación con benchmarks estandarizados; la pérdida de validación sobre las 31 trayectorias retenidas fue de 0,269, lo que refleja ajuste a la distribución de entrenamiento y no una medida de corrección de llamadas a herramientas ni de precisión diagnóstica. El comportamiento se comprobó adicionalmente con un conjunto reducido de prompts cualitativos sobre identidad e incidentes.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en 16 bits y ~8.000 millones de parámetros, se requieren aproximadamente 16 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contexto moderado.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones de 8 o 4 bits publicadas; para reducir VRAM habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para los pesos en 16 bits; en GPUs consumer de 16 GB no cabe en 16 bits sin cuantizar.
- ¿Cabe en GPU consumer? Sí en RTX 4090 (24 GB) en 16 bits; en tarjetas de 16 GB o menos requeriría cuantización no publicada.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card); vLLM, TGI, llama.cpp u Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-SRE | 7.996.156.490 | no disponible | SRE, DevOps, tool calling | Apache 2.0 | Hugging Face (52 descargas) |
| google/gemma-4-E4B-it (base) | no disponible en la información | no disponible | Propósito general, instruction-tuned | Apache 2.0 (heredada) | Hugging Face |
| Alternativas SRE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de otros ajustes finos SRE comparables con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se ha realizado evaluación con benchmarks estandarizados; la pérdida de validación de 0,269 no mide corrección de llamadas a herramientas ni precisión diagnóstica.
- Entrenado sobre un conjunto pequeño (608 trayectorias curadas y 57 ejemplos manuales, 2 épocas), lo que limita la cobertura de escenarios y aumenta el riesgo de sobreajuste a la distribución de entrenamiento.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación en salidas de comandos o estados de infraestructura si el modelo no dispone de herramientas conectadas, aunque se le entrena para declarar la ausencia de acceso.
- No está destinado a ejecutar cambios de forma autónoma contra sistemas de producción; requiere revisión humana de las acciones propuestas.
- El modo thinking está desactivado en entrenamiento, por lo que no se debe esperar razonamiento extendido nativo.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero conviene verificar las condiciones de la licencia de Gemma 4 aplicables al modelo base.
- No se documentan cuantizaciones GGUF ni recetas de despliegue en vLLM, TGI u Ollama, lo que añade trabajo de integración para producción.
- El modelo se identifica como Gemma-4-E4B-it-SRE; no se detalla el contexto máximo soportado, lo que impide garantizar conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rumiii/gemma-4-E4B-it-SRE
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/miyad316/sre-agentic-trajectories-devops
