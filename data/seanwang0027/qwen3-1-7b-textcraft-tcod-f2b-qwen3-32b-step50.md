# SeanWang0027/qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step50

## Resumen

El modelo `SeanWang0027/qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step50` es un checkpoint de investigación fruto de un proceso de destilación (distillation) sobre el modelo base Qwen/Qwen3-1.7B. El estudiante es Qwen3-1.7B (2.031.739.904 parámetros, ~2,03 mil millones) y el profesor es Qwen3-32B en precisión bf16, con el modo *thinking* desactivado durante el entrenamiento. Pertenece a la familia de experimentos TextCraft del mismo autor, orientados a la tarea agéntica TextCraft (un entorno textual de *crafting* inspirado en Minecraft) mediante el framework verl.

Se trata de un checkpoint intermedio: corresponde a `textcraft_tcod_f2b/global_step_50`, es decir, la iteración 50 del entrenamiento TCOD-F2B. El autor indica explícitamente que los pesos se subieron sin modificar para poder liberar espacio en disco local, por lo que no debe interpretarse como un artefacto final pulido, sino como una instantánea de un entrenamiento en curso. Tiene 0 descargas y 0 *likes*, y no declara licencia ni idiomas.

Su relevancia es acotada pero clara para quien investiga agentes pequeños: demuestra que un modelo de ~2B puede abordar tareas agénticas multi-turno cuando se destila a partir de trayectorias generadas por un modelo 20 veces mayor. La evaluación asociada se realizó sobre las 100 tareas oficiales de test de TextCraft, con avg@4, 30 turnos por episodio, temperatura 0,4 y 512 tokens por turno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-1.7B) |
| Parámetros totales | 2.031.739.904 (~2,03 mil millones) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada. La evaluación usó 512 tokens por turno durante 30 turnos; el modelo base Qwen3-1.7B declara 32.768 tokens nativos (dato externo al repositorio) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos safetensors; no se ofrecen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible en este repositorio (un modelo hermano del mismo autor, `qwen3-1.7b-textcraft-sft-qwen3-32b-traj`, declara Apache-2.0) |
| Formato de pesos | Safetensors. El tamaño del repositorio (4,1 GB para 2,03 mil millones de parámetros) es consistente con precisión bf16/fp16 |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B (fine-tune) |
| Creado / actualizado | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atención causal, sin mezcla de expertos y sin componentes de estado recurrente (SSM). No se documenta ninguna modificación estructural sobre el modelo base, por lo que la innovación del trabajo se sitúa íntegramente en el plano del entrenamiento y no en el de la arquitectura.

El entrenamiento es una destilación de Qwen3-32B (profesor, bf16, *thinking* desactivado) hacia Qwen3-1.7B (estudiante). La model card identifica el método como "TCOD-F2B" y etiqueta el repositorio con `textcraft`, `tcod` y `distillation`, pero no desarrolla qué significan esas siglas ni detalla el objetivo de pérdida, el número de tokens vistos, la composición del dataset ni si hubo RLHF/DPO. Por analogía con el modelo hermano del mismo autor, el pipeline se apoya en el framework verl y en trayectorias de profesor recolectadas sobre el entorno TextCraft (el modelo hermano `sft-qwen3-32b-traj` se entrenó sobre 2132 episodios de rollouts de Qwen3-32B, con la entropía cruzada aplicada únicamente sobre los tokens del profesor). Este checkpoint concreto corresponde al paso 50 de la variante TCOD-F2B, no a la variante SFT por trayectorias. El modo *thinking* está desactivado tanto en entrenamiento como en evaluación.

## Capacidades

- Generación de texto conversacional en formato de chat (etiqueta `conversational`).
- Ejecución de tareas agénticas multi-turno en el entorno textual TextCraft, con episodios de hasta 30 turnos.
- Razonamiento paso a paso estilo ReAct sobre observaciones textuales del entorno (capacidad heredada del diseño de la tarea y confirmada por las etiquetas `agent` y `react` en los modelos hermanos de la misma familia).
- Generación de comandos de *crafting* y manipulación de un inventario textual dentro de la dinámica de TextCraft.
- Funcionamiento con el modo *thinking* desactivado, lo que reduce la latencia por turno a costa de capacidad de razonamiento explícito.
- Soporte de *tool calling* / *function calling*: no documentado explícitamente en este repositorio; debe verificarse empíricamente antes de asumirlo.
- Capacidades multilingües: no disponibles.
- Capacidades de visión, audio o multimodalidad: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

- Investigación en destilación de agentes: sirve como punto de comparación directo entre una estrategia de destilación con profesor de 32B y el entrenamiento SFT por trayectorias, usando exactamente el mismo estudiante y la misma tarea.
- Punto de partida para *fine-tuning* de agentes en entornos textuales: al ser un checkpoint de ~2B en safetensors y con licencia por determinar, es viable reentrenarlo con verl sobre entornos propios (juegos de texto, simuladores de escritorio, APIs simuladas) partiendo de pesos que ya han visto formato de trayectoria agéntica.
- Prototipado local de agentes ReAct de bajo coste: con cuantización a 4 bits cabe en GPUs de consumo y permite iterar sobre prompts y bucles de agente sin coste de API.
- Generación de datos sintéticos para entrenamiento: el modelo puede producir trayectorias candidatas en un entorno textual que después se filtran y se usan como datos de SFT o de RL, reduciendo la dependencia de un profesor grande en cada iteración.
- Evaluación comparativa de metodologías de destilación: al estar publicado en el paso 50 y no como modelo final, resulta útil precisamente para estudiar la dinámica de convergencia de TCOD-F2B frente a SFT a lo largo del entrenamiento.
- Docencia y experimentación académica: un agente de 2B que opera en un entorno cerrado y determinista como TextCraft es un banco de pruebas controlado para enseñar bucles ReAct, memoria de episodio y evaluación con avg@k.
- Despliegue en demos interactivas de bajo presupuesto: con TGI o vLLM sobre una única GPU consumer se puede servir el modelo para demostraciones de *crafting* conversacional, siempre que se acepte que no es un modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos para este checkpoint en la información disponible. La model card indica únicamente la configuración de evaluación empleada (100 tareas oficiales de test de TextCraft, avg@4, 30 turnos, temperatura 0,4, 512 tokens por turno, *thinking* desactivado) y remite a `runs/eval/` dentro del repositorio para consultar los rollouts, pero no transcribe las cifras.

Como referencia externa, y siempre atribuyendo cada dato a su modelo de origen (no a este checkpoint), los resultados de búsqueda reportan las siguientes cifras para la familia TextCraft del mismo autor:

| Modelo | TextCraft (test oficial) | Fuente del dato |
|---|---|---|
| Qwen3-1.7B (base, sin destilar) | 23,00 % | Ficha del modelo hermano `sft-qwen3-32b-traj` |
| `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` (SFT por trayectorias) | 72,75 % | Ficha del modelo hermano `sft-qwen3-32b-traj` |
| Qwen3-32B (profesor) | 85,50 % | Ficha del modelo hermano `sft-qwen3-32b-traj` |
| `qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step50` (este modelo) | No publicado | Model card (solo describe la configuración de evaluación) |

No se dispone de MMLU, HumanEval, GSM8K ni de ningún otro benchmark generalista para ninguno de estos modelos en la información proporcionada.

## Requisitos de hardware

Estimaciones basadas en los 2.031.739.904 parámetros y en el tamaño del repositorio; el autor no publica mediciones de latencia ni de *throughput*.

- VRAM para los pesos: ~4,1 GB en bf16/fp16 (coincide con los 4,1 GB del repositorio), ~8,1 GB en fp32, ~2,0-2,5 GB en cuantización de 8 bits y ~1,2-1,5 GB en 4 bits.
- VRAM total en inferencia: hay que sumar la caché KV. Para contextos largos (decenas de miles de tokens) la caché puede añadir varios gigabytes, por lo que con 32.768 tokens conviene reservar bastante más que el tamaño de los pesos.
- GPU recomendadas: para bf16 sin cuantizar, cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para servicio concurrente con lotes grandes, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí. En 4 bits funciona holgadamente en GPUs de 6-8 GB (RTX 3060, RTX 2060, GTX 1660 con suficiente RAM) y en Apple Silicon con memoria unificada.
- Opciones de despliegue: `transformers` (la librería declarada), vLLM y TGI (las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio apuntan a compatibilidad con estos servidores). Ollama y llama.cpp requerirían convertir manualmente los pesos a GGUF, ya que el autor no publica versiones cuantizadas.
- Latencia y throughput: no disponibles. Como referencia cualitativa, con *thinking* desactivado y 512 tokens por turno, el coste por turno en una GPU moderna es bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TextCraft (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step50`) | 2,03 B | No disponible | No publicado | No disponible | Hugging Face, 0 descargas |
| `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` | 2,03 B | No disponible | 72,75 % | Apache-2.0 | Hugging Face |
| `qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy` | 2,03 B | No disponible | No publicado | No disponible | Hugging Face (variante con errores de plantilla documentados) |
| Qwen3-1.7B (base) | 2,03 B | 32.768 tokens nativos | 23,00 % | Apache-2.0 | Hugging Face |
| Qwen3-32B (profesor) | ~32,8 B | 32.768 tokens nativos | 85,50 % | Apache-2.0 | Hugging Face |

La comparación relevante es interna a la familia TextCraft del autor: este checkpoint (TCOD-F2B, paso 50) frente al SFT por trayectorias (72,75 %) y frente al profesor Qwen3-32B (85,50 %). Los tres comparten estudiante y tarea, de modo que aíslan el efecto del método de destilación. No se han identificado en la búsqueda modelos de terceros equivalentes destilados específicamente para TextCraft.

## Limitaciones y advertencias

- Licencia no declarada en este repositorio. Aunque un modelo hermano del mismo autor publica Apache-2.0, no se puede asumir que esta licencia se aplique aquí; el uso comercial queda en situación jurídica indeterminada hasta que el autor lo aclare.
- Es un checkpoint intermedio (paso 50), no un modelo final. El propio autor lo describe como una copia subida para liberar disco, con los pesos sin modificar. Puede estar significativamente infraentrenado respecto a la variante final.
- No hay resultados de benchmarks publicados para este checkpoint concreto, ni descargas ni validación de la comunidad. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Idiomas soportados no documentados. No hay garantía de comportamiento correcto fuera del inglés, que es el idioma de la tarea TextCraft.
- Modo *thinking* desactivado. El modelo no fue entrenado para emitir cadenas de razonamiento largas, lo que limita su rendimiento en tareas que se beneficien de *chain-of-thought* explícito.
- Riesgo de alucinación en el bucle agéntico: en entornos textuales, un comando inventado o una observación mal interpretada puede degradar la trayectoria completa sin que el modelo lo detecte.
- Especialización estrecha. La destilación está orientada a una única tarea (TextCraft); es previsible una transferencia pobre a tareas generales de conversación, código o matemáticas.
- Sin soporte multimodal y sin evidencia de *tool calling* nativo: cualquier integración con herramientas externas requiere validación previa del formato de llamada.
- Metodología de evaluación limitada: 100 tareas de test, avg@4, 30 turnos, T=0,4. Es una muestra pequeña y sensible a la varianza, por lo que las diferencias de pocos puntos porcentuales no deberían considerarse significativas.
- Riesgo de sesgos heredados de Qwen3-32B y de Qwen3-1.7B: el proceso de destilación reproduce, y en algunos casos amplifica, los sesgos presentes en las trayectorias del profesor.
- La variante hermana `messages-buggy` documenta errores de plantilla de chat (recorte de la cabecera `<|im_start|>user` y bloques `think` vacíos dentro de la pérdida). Conviene verificar que este checkpoint no arrastra el mismo problema de preprocesado antes de reutilizar sus pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-tcod-f2b-qwen3-32b-step50
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo hermano SFT por trayectorias: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Modelo hermano con problemas de plantilla: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy
- Ficha del modelo SFT en Featherless (cifras de TextCraft): https://featherless.ai/models/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Registro del modelo SFT en free2aitools: https://free2aitools.com/model/seanwang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Registro del modelo con problemas de plantilla en free2aitools: https://free2aitools.com/model/seanwang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy
- Rollouts de evaluación: directorio `runs/eval/` dentro del repositorio del modelo en Hugging Face (referenciado en la model card)
- Paper, blog o repositorio del método TCOD-F2B: no disponible en la información proporcionada
