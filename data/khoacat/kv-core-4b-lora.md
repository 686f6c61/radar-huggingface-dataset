# Khoacat/kv-core-4b-lora

## Resumen

kv-core-4b-lora es un adaptador LoRA publicado por el usuario Khoacat sobre el modelo base Qwen/Qwen3.5-4B, orientado a un pipeline multiagente offline denominado Waker-AI. El adaptador no es un modelo autónomo: se distribuye como pesos LoRA en formato GGUF (81 MB) que deben cargarse sobre el modelo base con llama.cpp mediante el flag `--lora`, sin necesidad de fusionar pesos. El repositorio declara 21.233.664 parámetros en safetensors y un tamaño total de 0,1 GB.

El adaptador implementa un esquema de doble rol sobre un único conjunto de pesos: Aeneas, un gatekeeper que evalúa planes contra una constitución de reglas R1–R8 y devuelve un veredicto con identificadores de regla, y Zeus, un planificador que lee un objetivo y propone un DAG de tareas con roles lead/coder/reviewer/qa/systembot. La separación de roles se realiza exclusivamente mediante el system prompt, no mediante pesos distintos. El autor declara explícitamente que el modelo propone, no decide: no escribe código, no tiene permiso de escritura de ficheros y la validación final recae en un validador determinista y en el código de salida de la suite de tests.

El interés del artefacto es acotado pero concreto: demuestra un patrón de despliegue de agentes soberanos en local, con datos de entrenamiento generados por código y sin destilación de modelos comerciales. Su rendimiento medido es modesto (12/20 en un conjunto propio de 20 tareas) y el propio autor documenta limitaciones severas de latencia y de generalización, por lo que debe evaluarse como componente auxiliar de un pipeline, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA 4-bit) sobre transformer Qwen3.5-4B; r=16, alpha=32 |
| Parámetros totales | 21.233.664 (pesos del adaptador en safetensors); el modelo base Qwen3.5-4B no se incluye en el repo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo de llama.cpp; el autor recomienda prompts de menos de 800 tokens |
| Tipos de cuantización | adaptador en GGUF (81 MB) para carga con `--lora`; el modelo base se usa en Q4_K_M en el ejemplo del autor |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA en 4 bits sobre Qwen/Qwen3.5-4B, con rango r=16, alpha=32, tasa de aprendizaje 1e-4 y 2 épocas. El entrenamiento comprende 136 pasos sobre una GPU Tesla T4 y alcanza una pérdida final de 0,293. El conjunto de datos consta de 540 muestras con etiquetas generadas por código a partir de escenarios preconstruidos; el autor indica explícitamente que no se emplearon modelos comerciales para etiquetar ni para destilar salidas. Antes del entrenamiento se eliminaron rutas absolutas y no se incluyó información personal identificable.

La innovación técnica no reside en la arquitectura, que es la del modelo base, sino en el diseño del sistema: un único adaptador sirve a dos roles diferenciados por system prompt (Aeneas para el filtro constitucional, Zeus para la planificación de DAG), mientras que el enrutamiento de mensajes entre agentes se resuelve con código Python determinista en lugar de con el modelo, decisión justificada por el autor para evitar latencia añadida y puntos adicionales de fallo. El adaptador se distribuye como LoRA GGUF cargable directamente en llama.cpp, lo que evita el paso de fusión de pesos y permite mantener el modelo base intacto y reutilizable.

## Capacidades

- Evaluación de planes contra un conjunto fijo de reglas (R1–R8) con salida de veredicto e identificadores de regla incumplida (rol Aeneas).
- Propuesta de grafos acíclicos dirigidos de tareas con asignación de roles lead, coder, reviewer, qa y systembot a partir de un objetivo en lenguaje natural (rol Zeus).
- Triaje o diagnóstico inicial de incidencias, con rendimiento declarado bajo (3/8).
- Generación de texto en vietnamita e inglés; no se declaran otros idiomas.
- Modo de pensamiento desactivable mediante `chat-template-kwargs` (`enable_thinking: false`), tal como aparece en el ejemplo de despliegue.
- Integración con API compatible con OpenAI a través de llama-server.
- No soporta tool calling nativo, ejecución de comandos ni escritura de ficheros; el autor lo declara explícitamente fuera de alcance.

## Casos de uso

- Filtro previo de planes en pipelines de agentes: el adaptador actúa como primera barrera que marca planes sospechosos antes de que un validador determinista emita el veredicto final, reduciendo el número de llamadas a modelos en la nube.
- Generación de borradores de DAG en orquestadores internos: dado un objetivo, produce una propuesta de grafo de tareas que el orquestador puede aceptar, modificar o descartar, con un coste de 15 a 30 segundos por decisión asumible en tareas asíncronas.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse en local con llama.cpp, ningún prompt sale de la máquina en los modos de borrador y filtro, lo que encaja en contextos donde el envío de datos a la nube requiere justificación explícita.
- Automatización de revisiones de conformidad en repositorios: el rol Aeneas puede aplicarse a la revisión de propuestas de cambio contra un conjunto de reglas internas codificadas como R1–R8, siempre acompañado del detector determinista de reglas.
- Triaje de incidencias en segundo plano: clasificación inicial de fallos en colas asíncronas donde la latencia no es crítica y el resultado se revisa por un operador humano.
- Experimentación académica sobre agentes soberanos: el repositorio y el informe de evaluación asociado sirven como referencia reproducible para estudiar adaptadores de bajo rango en pipelines multiagente con validación externa.

## Benchmarks y rendimiento

Los datos proceden de una evaluación propia del autor sobre 20 tareas autoconstruidas (plan, dag, gate, triage), con temperature=0 y una sola ejecución. El propio autor advierte que el tamaño de muestra es pequeño y que cada tarea adicional desplaza la métrica en 5 puntos porcentuales.

| Capacidad | Resultado | Observaciones |
|---|---|---|
| Pre-flight Gate (Aeneas) | 6/6 (100 %) | Incluye detector determinista de reglas; el modelo por sí solo devuelve `allow` ante formulaciones no vistas |
| DAG Planning (Zeus) | 3/6 (50 %) | Los fallos se concentran en la selección del módulo de test correcto |
| Triage | 3/8 (38 %) | Los errores corresponden a convenciones operativas, no a razonamiento |
| Total | 12/20 (60 %) | Conjunto de 20 tareas, una ejecución |
| Repositorio real waker-ai | 6/8 (75 %) | Borradores aceptados por el validador, suficientes para omitir una llamada a la nube |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 81 MB en GGUF; el requisito real de memoria lo determina el modelo base Qwen3.5-4B.
- Con el base en Q4_K_M, la inferencia cabe en GPUs de consumo con al menos 4–6 GB de VRAM libre, aunque el autor no publica una cifra exacta de VRAM.
- GPU de entrenamiento declarada: Tesla T4. No se especifican GPU recomendadas para inferencia.
- Despliegue mediante llama.cpp con llama-server y los flags `-c 4096 -ngl 99 --lora <adaptador>`; también accesible vía API compatible con OpenAI.
- Rendimiento declarado por el autor: aproximadamente 5–7 tokens por segundo en CPU o iGPU, lo que se traduce en 15–30 segundos por decisión.
- No se proporcionan datos de throughput en GPU ni comparativas de latencia con otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| kv-core-4b-lora | 21,2 M (adaptador) sobre base de 4B | 4096 en el ejemplo | Apache-2.0 | safetensors, GGUF LoRA | Especializado en gate y planificación de DAG; requiere el base Qwen3.5-4B |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en la información | Apache-2.0 | safetensors, GGUF | Modelo generalista; el adaptador hereda sus capacidades y añade el comportamiento de doble rol |
| Adaptadores LoRA genéricos sobre Qwen | variable | depende del base | variable | safetensors, GGUF | No se dispone de comparación cuantitativa en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información disponible.

## Limitaciones y advertencias

- El tamaño de muestra de la evaluación es de 20 tareas y una sola ejecución; cada acierto o fallo adicional altera la métrica en 5 puntos porcentuales.
- Dependencia fuerte de la formulación: el filtro Aeneas alcanza 6/6 en formulaciones similares a los datos de entrenamiento, pero ante planes con redacción distinta puede devolver `allow` aunque detecte el problema. El autor exige usarlo junto con un detector determinista de reglas.
- El triaje de incidencias es poco fiable (38 %), insuficiente para diagnóstico autónomo.
- Latencia alta: 5–7 tokens por segundo en CPU o iGPU, equivalente a 15–30 segundos por decisión; no apto para chat interactivo, solo para tareas en segundo plano.
- Cobertura lingüística limitada a vietnamita e inglés; el autor recomienda prompts de menos de 800 tokens.
- No debe emplearse para decisiones automáticas sin revisión humana o de un validador externo.
- El adaptador no ejecuta comandos ni escribe ficheros; cualquier expectativa de agencia autónoma queda fuera de su diseño.
- El modelo base no se incluye en el repositorio; es necesario descargarlo por separado y verificar que la arquitectura coincide con Qwen3.5-4B.
- Licencia Apache-2.0 en el adaptador, pero el uso comercial queda sujeto también a los términos del modelo base.
- Riesgo de alucinación no cuantificado en la información disponible; el diseño del sistema mitiga parcialmente este riesgo mediante validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Khoacat/kv-core-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto Waker-AI: https://github.com/khoacat12345/waker-ai (referencia citada en la model card)
