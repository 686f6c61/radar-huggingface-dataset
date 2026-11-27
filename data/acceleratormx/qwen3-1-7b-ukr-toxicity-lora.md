# acceleratormx/qwen3-1.7b-ukr-toxicity-lora

## Resumen

`qwen3-1.7b-ukr-toxicity-lora` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-1.7B`, desarrollado por el usuario acceleratormx en el marco de un trabajo de laboratorio de quinto curso de la asignatura «Sistemas de inteligencia artificial» de la Universidad Politecnica de Zhytomyr. Su funcion es clasificar comentarios en ucraniano como toxicos o no toxicos, devolviendo una respuesta JSON con la etiqueta `{"label": "toxic"}` o `{"label": "non_toxic"}`.

El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen3-1.7B y aplicar los pesos LoRA encima. El entrenamiento se realizo mediante SFT con la libreria TRL sobre el dataset `ukr-detect/ukr-toxicity-dataset-seminatural`, con 3000 ejemplos de entrenamiento, 300 de validacion y 1000 de test. La relevancia actual radica en que ofrece una solucion ligera y especializada para moderacion de contenido en ucraniano, un idioma con menos recursos que el ingles en tareas de deteccion de toxicidad.

El adaptador es muy pequeno (repo de 0.1 GB) y esta pensado para escenarios de moderacion asistida, no para bloqueo automatico sin supervision humana, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el modelo base admite cuantizacion, no detallada) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only del que no se detallan mas especificaciones en la informacion disponible. La configuracion LoRA empleada es r=16, alpha=32, dropout=0.05 y aplicacion sobre todas las capas lineales (`all-linear`). El entrenamiento uso learning rate 2e-4, 250 pasos, batch efectivo de 8 y precision fp16, mediante SFT con TRL.

El dataset de entrenamiento es `ukr-detect/ukr-toxicity-dataset-seminatural` (licencia OpenRAIL++), con 3000 ejemplos de entrenamiento, 300 de validacion y 1000 de test. Segun el autor, el dataset se recopilo de forma semiautomatica mediante palabras clave, por lo que la nocion de toxicidad se limita a vocabulario vulgar y soez. No se menciona uso de RLHF ni DPO. El modo de razonamiento del modelo base debe desactivarse (`enable_thinking=False`) durante la inferencia.

## Capacidades

- Clasificacion binaria de toxicidad en texto ucraniano (toxic / non_toxic).
- Salida estructurada en JSON, lo que facilita su integracion en pipelines automaticos.
- Formato conversacional (pipeline text-generation con plantilla de chat).
- Especializacion en lexico vulgar y soez en ucraniano.
- No soporta tool calling ni function calling de forma explicita en la informacion disponible.
- No orientado a agentes ni a razonamiento multi-paso; el modo thinking debe desactivarse.
- Capacidad multilingue no disponible: solo se declara ucraniano.
- No dispone de vision ni audio.

## Casos de uso

- Moderacion de comentarios en foros y redes ucranianas: el adaptador clasifica cada comentario con una respuesta JSON, permitiendo filtrar o marcar contenido para revision humana con bajo coste computacional al ejecutarse sobre un modelo de 1.7B.
- Prefiltrado en sistemas de reporte de abuso: se puede usar como primera capa que descarta comentarios claramente no toxicos y deriva el resto a revision manual, reduciendo la carga de moderadores.
- Analisis de toxicidad en datasets de investigacion: util para etiquetar corpus ucranianos de forma rapida y comparar con anotaciones humanas, dado su alto F1 reportado en el conjunto de test.
- Monitorizacion de comunidades online: integracion en herramientas de escucha social para detectar picos de lenguaje ofensivo en canales ucranianos.
- Filtrado previo en sistemas de atencion al cliente: descartar mensajes de usuarios con lenguaje soez antes de pasarlos a un agente o a un modelo mayor, evitando contaminar el contexto.
- Educacion y demostraciones academicas: por su tamano reducido y su origen docente, sirve como ejemplo practico de fine-tuning LoRA para clasificacion de texto en un idioma de bajos recursos.
- Investigacion sobre sesgos linguisticos: permite estudiar como un modelo multilingue base se adapta a una tarea especifica de un idioma concreto con pocos datos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (1000 ejemplos):

| Metrica | Modelo base + prompt detallado | LoRA + prompt corto |
|---|---|---|
| Accuracy (%) | 77.3 | 96.9 |
| F1 (toxic) (%) | 75.8 | 96.9 |
| Respuesta valida (%) | 100.0 | 100.0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 1.7B, la inferencia en fp16 requiere aproximadamente 3-4 GB, y en cuantizacion de 4 bits puede caber en menos de 2 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base en fp16; para cuantizacion 4-bit bastan GPUs con 2-4 GB.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de gama media.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); el modelo base puede servirse con vLLM, llama.cpp u Ollama, aunque el adaptador LoRA requiere fusion o carga dinamica segun el backend (no detallado en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-ukr-toxicity-lora | 1.7B (base) + LoRA | no disponible | Clasificacion de toxicidad en ucraniano | openrail++ | Hugging Face |
| Modelo base Qwen3-1.7B con prompt | 1.7B | no disponible | Clasificacion generica | segun Qwen3 | Hugging Face |
| Clasificadores de toxicidad multilingues (p. ej. basados en XLM-R) | no disponible | no disponible | Clasificacion de toxicidad | variable | Hugging Face |

No se dispone de datos comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- La definicion de toxicidad del dataset se limita a vocabulario vulgar y soez, recopilado de forma semiautomatica por palabras clave; puede no cubrir otras formas de toxicidad (ironia, discurso de odio implicito, acoso sutil).
- El autor advierte explicitamente que el modelo no esta pensado para bloqueo automatico sin revision humana.
- Riesgo de alucinacion y de respuestas no JSON en entradas fuera de distribucion; aunque el autor reporta 100 % de respuestas validas en test, no hay garantia en produccion.
- Solo se declara soporte de ucraniano; el rendimiento en otros idiomas no esta evaluado.
- La licencia openrail++ impone restricciones de uso; debe revisarse antes de un despliegue comercial.
- Al ser un adaptador LoRA, requiere el modelo base Qwen3-1.7B y su licencia correspondiente.
- El modo de razonamiento del modelo base debe desactivarse; si se activa, el formato de salida puede romperse.
- No hay informacion sobre sesgos especificos medidos ni sobre evaluacion de robustez frente a adversarial examples.

## Enlaces

- Hugging Face: https://huggingface.co/acceleratormx/qwen3-1.7b-ukr-toxicity-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/ukr-detect/ukr-toxicity-dataset-seminatural
- Libreria PEFT: no disponible en la informacion
- Paper o blog del autor: no disponible en la informacion
- Repositorio de codigo: no disponible en la informacion
- Demo: no disponible en la informacion
