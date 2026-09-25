# SeanWang0027/qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step72

## Resumen

Este repositorio contiene un ajuste fino de Qwen3-1.7B obtenido por destilación desde Qwen3-32B (profesor en bf16) sobre el entorno agéntico TextCraft, con el modo de razonamiento desactivado. El checkpoint subido corresponde a `textcraft_tcod_f2b/global_step_72`, es decir, el paso 72 de una ejecución de entrenamiento, y el autor indica explícitamente que los pesos no se han modificado respecto de la copia local. El identificador del modelo (`tcod`, `f2b`, `step72`) apunta a una variante de destilación de trayectorias, aunque la model card no desarrolla esas siglas.

El interés del modelo es doble. Por un lado, es un ejemplo de destilación de capacidad agéntica desde un modelo de 32.000 millones de parámetros hacia uno de ~2.030 millones, con el objetivo de resolver tareas multi-turno de planificación y crafting a una fracción del coste de inferencia. Por otro, al ser un checkpoint intermedio de una ejecución, es material de investigación sobre dinámica de entrenamiento y sobre cuánto rendimiento agéntico se puede recuperar en un modelo pequeño.

La model card únicamente documenta el protocolo de evaluación: las 100 tareas oficiales de test de TextCraft, avg@4, 30 turnos, temperatura 0,4, 512 tokens por turno y thinking off, con los rollouts almacenados en `runs/eval/`. No se declaran licencia, idiomas ni cuantizaciones específicas de este fine-tune en la metadata del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal y denso (familia Qwen3, heredada del modelo base) |
| Parámetros totales | 2.031.739.904 (~2,03 B), según los pesos safetensors del repositorio |
| Parámetros activos | No aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | No declarada en la model card de este repositorio; el modelo base Qwen3-1.7B declara 32.768 tokens nativos (ampliables con YaRN en la documentación de Qwen) |
| Tipos de cuantización | No disponible. No se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes propias de este fine-tune; los pesos se distribuyen en safetensors |
| Idiomas soportados | No disponibles en la metadata. El entrenamiento se realiza sobre TextCraft, un entorno en inglés |
| Licencia | No disponible (la metadata del repositorio no la declara). El modelo base Qwen/Qwen3-1.7B se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor de destilación | Qwen3-32B en bf16, con thinking desactivado |
| Estado del checkpoint | `global_step_72` de la ejecución `textcraft_tcod_f2b` |
| Tamaño del repositorio | 4,1 GB |
| Modalidad de razonamiento | Thinking off (el bloque de razonamiento no se usa en entrenamiento ni en evaluación) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atención causal y Grouped Query Attention, sin mezcla de expertos ni componentes de estado recurrente. Con 2.031.739.904 parámetros totales (cifra que incluye la matriz de embeddings, muy relevante en modelos de este tamaño), se sitúa en la gama de modelos pequeños capaces de ejecutarse en GPU de consumo. No se documentan en este repositorio cambios estructurales respecto del modelo base, por lo que se trata de un ajuste de pesos, no de una arquitectura nueva.

El entrenamiento sigue un esquema de destilación con profesor Qwen3-32B en bf16 generando trayectorias en TextCraft, con el modo thinking desactivado. La model card del modelo hermano `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` describe un procedimiento de SFT sobre trayectorias con 2.132 episodios de rollouts del profesor, donde la entropía cruzada se calcula únicamente sobre los tokens generados por el profesor y no sobre las observaciones del entorno; conviene tratar ese dato como contexto de la línea de trabajo y no como una descripción verificada de este checkpoint concreto. La variante aquí publicada añade las etiquetas `tcod` y `f2b`, cuyo significado exacto no se explica en la información disponible. El checkpoint corresponde al paso 72 y no hay confirmación de que sea el mejor de la ejecución ni el estado final.

## Capacidades

- Generación de texto conversacional y multi-turno, orientada a la interacción con un entorno que devuelve observaciones en cada turno.
- Ejecución de tareas agénticas en TextCraft: interpretación de recetas, planificación de subobjetivos y encadenamiento de acciones hasta 30 turnos.
- Formato de acción propio del entorno agéntico de TextCraft, según el protocolo de evaluación descrito (30 turnos, 512 tokens por turno).
- Funcionamiento con el modo thinking desactivado, que es la configuración con la que fue entrenado y evaluado.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, según las etiquetas del repositorio.
- Tool calling / function calling estilo OpenAI: no documentado en la información disponible; el modelo está entrenado para el formato de acciones de TextCraft, no necesariamente para esquemas de herramientas genéricos.
- Capacidades multilingües: no documentadas ni verificadas. El entorno de entrenamiento es en inglés.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio es exclusivamente de generación de texto.

## Casos de uso

- Agente de crafting en entornos de texto: el modelo puede descomponer un objeto final en su árbol de recetas, obtener los ingredientes base y ejecutar las acciones de crafting en orden, que es exactamente la tarea sobre la que fue destilado.
- Generación barata de rollouts para investigación en agentes: al ejecutarse en una GPU de consumo, permite producir miles de trayectorias para análisis de fallos, anotación o entrenamiento posterior sin depender del profesor de 32B.
- Estudio de destilación de capacidad agéntica: sirve como punto de comparación frente al profesor Qwen3-32B y frente al modelo base, con protocolo de evaluación reproducible (100 tareas, avg@4, 30 turnos).
- Prototipado local de agentes multi-turno: con ~4,1 GB de pesos en bf16 cabe en portátiles con GPU de 8-12 GB, lo que facilita iterar sobre prompts y formatos de observación sin infraestructura en la nube.
- Evaluación de checkpoints intermedios: al estar etiquetado por paso de entrenamiento, es útil para estudiar curvas de aprendizaje y decidir en qué punto detener una ejecución de destilación.
- Servicio de inferencia interno de bajo coste: desplegable con text-generation-inference o vLLM para demos y pruebas de integración donde el coste por token del modelo de 32B sería prohibitivo.
- Generación de datos sintéticos de trayectorias: las rollouts del modelo pueden filtrarse por éxito y reutilizarse para SFT de modelos aún menores o para ajuste con preferencias.

## Benchmarks y rendimiento

La model card de este repositorio describe el protocolo de evaluación (100 tareas oficiales de test de TextCraft, avg@4, 30 turnos, T=0,4, 512 tokens por turno, thinking off) y remite a `runs/eval/` para las rollouts, pero no incluye la puntuación obtenida en el texto disponible. Por tanto, la cifra de este checkpoint concreto es **no disponible**.

Los siguientes números proceden de la model card del modelo hermano `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` y de su ficha en Featherless, y se incluyen solo como referencia del entorno y de la línea de trabajo:

| Modelo | TextCraft, test oficial (avg@4) | Fuente |
|---|---|---|
| Qwen3-32B (profesor) | 85,50 % | Model card de `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` |
| qwen3-1.7b-textcraft-sft-qwen3-32b-traj | 72,75 % | Model card de `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` |
| Qwen3-1.7B base | 23,00 % | Model card de `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` |
| Este checkpoint (tcod-f2b, step 72) | No disponible | No se publica la puntuación en la información disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites generales para este modelo.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para pesos; con caché KV y overhead del runtime, entre 6 y 8 GB para contextos moderados y más de 10 GB si se agota la ventana completa del modelo base.
- VRAM en cuantización de 8 bits: en torno a 2,1-3 GB de pesos, más caché KV.
- VRAM en cuantización de 4 bits: en torno a 1,2-1,6 GB de pesos; cuantizaciones no publicadas por el autor, habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10G). A100 y H100 son funcionales pero desproporcionadas para 2,03 B de parámetros.
- Cabe en GPU de consumo: sí. En 4 bits funciona en GPU de 4-6 GB; en bf16 requiere al menos 6-8 GB para contexto corto.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio y compatibilidad con endpoints), vLLM para servir con throughput alto, y llama.cpp u Ollama previa conversión a GGUF, que no está publicada.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del backend, del tamaño de lote y de la longitud de la caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TextCraft (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen3-1.7b-textcraft-tcod-f2b, step 72) | 2,03 B | No declarado (base: 32.768) | No disponible | No declarada | HuggingFace, 0 descargas |
| Qwen3-1.7B base | 2,03 B | 32.768 tokens (documentación de Qwen) | 23,00 % (según la model card del modelo hermano) | Apache-2.0 | HuggingFace y múltiples backends |
| qwen3-1.7b-textcraft-sft-qwen3-32b-traj | 2,03 B | No declarado (base: 32.768) | 72,75 % (según su propia model card) | Apache-2.0 (según su ficha) | HuggingFace |
| Qwen3-32B (profesor) | 32,8 B (aprox.) | No declarado | 85,50 % (según la model card del modelo hermano) | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos para Qwen3-4B ni para otros modelos pequeños evaluados en TextCraft en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 72) de una ejecución de entrenamiento, no necesariamente el estado final ni el mejor; su rendimiento puede ser inferior al de otros pasos no publicados.
- El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación externa ni informes de terceros sobre su comportamiento.
- La licencia no está declarada en la metadata del repositorio. Aunque el modelo base es Apache-2.0, conviene confirmar con el autor las condiciones antes de cualquier uso comercial.
- Entrenado y evaluado con thinking desactivado; activar el modo de razonamiento puede degradar el formato de acción y producir salidas fuera de distribución.
- Especialización estrecha: el ajuste se ha hecho sobre TextCraft, un entorno en inglés con un formato de observación y acción concreto. La transferencia a otras tareas agénticas o a formato de herramientas genérico no está demostrada.
- Riesgo de alucinación de recetas y acciones: el modelo puede inventar combinaciones de ingredientes o emitir acciones no válidas en el entorno, especialmente en cadenas largas.
- El protocolo de evaluación usa temperatura 0,4 y avg@4 sobre 30 turnos con 512 tokens por turno; los resultados son sensibles a esos hiperparámetros y a la semilla, y no deben extrapolarse a configuraciones distintas.
- Ventana efectiva en la práctica limitada por el horizonte de 30 turnos y por el coste de la caché KV si se usa el contexto nativo completo del modelo base.
- Idiomas distintos del inglés: no verificados; no hay datos de evaluación multilingüe.
- No se publican cuantizaciones oficiales, por lo que el despliegue en hardware muy limitado exige generar los pesos cuantizados por cuenta propia y revalidar la calidad.
- Al ser un modelo destilado de 2,03 B de parámetros, la brecha frente al profesor de 32B en tareas agénticas de varios pasos es esperable y debe presupuestarse en cualquier diseño de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step72
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo hermano por SFT de trayectorias: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Variante con el bug de plantilla de chat: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy
- Ficha del modelo hermano en Featherless: https://featherless.ai/models/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Ficha del modelo hermano en free2aitools: https://free2aitools.com/model/seanwang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Ficha de la variante con bug en free2aitools: https://free2aitools.com/model/seanwang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy
