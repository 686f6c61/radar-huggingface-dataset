# atlasmarkz/microduck-skill-agent

## Resumen

microduck-skill-agent es un conjunto de adaptadores LoRA publicados por el usuario atlasmarkz sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. El adaptador convierte el modelo vision-lenguaje en una política de habilidades (skill-level policy) para un pequeno robot cuadrupedo denominado "microduck" que opera en entornos multi-habitacion simulados en MuJoCo. En cada paso, el modelo recibe una imagen de camara y una instruccion en lenguaje natural (chino o ingles) y emite una habilidad en formato JSON entre un conjunto cerrado: move, turn, approach, search, explore, return_home, stop, done, clarify, unsupported y bypass_return.

La relevancia del proyecto es acotada pero instructiva: demuestra como un adaptador LoRA de rango 8 y apenas 655.360 parametros entrenables puede especializar un VLM de 4.000 millones de parametros para tareas de IA encarnada (embodied AI) en simulacion, con un coste de entrenamiento de unos 13 minutos en una unica RTX 3060 de 8 GiB. No es un controlador de robot autonomo: las habilidades se ejecutan mediante codigo basado en reglas (mapa de ocupacion por profundidad, A* y exploracion de frontera) que reside en el repositorio del proyecto.

El modelo se publica con licencia Apache-2.0, solo soporta chino e ingles, y esta explicitamente restringido a simulacion. El repositorio no contiene pesos completos, unicamente los safetensors de los adaptadores y los informes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (el adaptador tiene 655.360 parametros entrenables; el modelo base Qwen3-VL-4B-Instruct tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el entrenamiento uso max_sequence_length de 1.024 tokens |
| Tipos de cuantizacion | base cargado en 4-bit NF4 con doble cuantizacion y computo BF16 durante el entrenamiento; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8, alpha 16 y dropout 0 aplicado unicamente a las proyecciones q y v de las ultimas 8 capas del modelo de lenguaje de Qwen3-VL-4B-Instruct. Esto da 655.360 parametros entrenables sobre un modelo base de 4.000 millones. El modelo base se cargo en 4-bit NF4 con doble cuantizacion y computo en BF16. El entrenamiento consistio en supervised fine-tuning sobre etiquetas generadas por un "rule teacher" que lee el ground truth del simulador y corrige rollouts grabados. Se usaron 300 pasos, batch size 1, learning rate 5e-5, semilla 42 y loss solo sobre la completion (completion-only loss). Los pixeles de imagen oscilaron entre 65.536 y 131.072 y la longitud maxima de secuencia fue de 1.024 tokens. La revision del modelo base fue ebb281ec70b05090aa6165b016eac8ec08e71b17.

Se publican cuatro versiones del adaptador: lang-v1 (1.634 filas de entrenamiento), lang-v2 (3.074 filas, la adoptada), lang-v3 (3.866 filas, rechazada por peor rendimiento) y lang-v4 (4.075 filas, no adoptada por falta de ganancia medible). El entrenamiento se realizo con torch 2.11.0, transformers 5.19.0, peft 0.21.2 y bitsandbytes 0.50.2, en una RTX 3060 de 8 GiB con un tiempo aproximado de 13 minutos por adaptador. Los datos de entrenamiento no se publican. Cada carpeta incluye un training_report.json con hiperparametros, recuentos de filas, hashes de dataset y adaptador, e historial de perdida.

## Capacidades

- Generacion de una habilidad de robot en formato JSON a partir de una imagen de camara y una instruccion en lenguaje natural.
- Conjunto cerrado de habilidades: move, turn, approach, search, explore, return_home, stop, done, clarify, unsupported, bypass_return.
- Comprension de instrucciones en chino e ingles.
- Razonamiento visual de escena: interpretacion de imagenes de camara del simulador para decidir la siguiente habilidad.
- Deteccion de instrucciones no soportadas (habilidad unsupported) y peticion de aclaracion (habilidad clarify).
- No soporta tool calling generico, function calling arbitrario ni agentes multi-paso fuera del bucle definido por el repositorio del proyecto.
- No dispone de modo thinking, audio ni otras modalidades mas alla de imagen y texto.
- No es un controlador de robot autonomo: requiere los ejecutores de habilidades del repositorio microduck-qwen.

## Casos de uso

- Investigacion en IA encarnada en simulacion: usar el adaptador como politica de alto nivel en entornos MuJoCo multi-habitacion para estudiar la descomposicion de instrucciones en habilidades discretas, aprovechando que el bucle completo (percepcion, decision de habilidad, ejecucion) esta implementado en el repositorio.
- Prototipado rapido de agentes de navegacion: el adaptador permite probar variantes de politicas de navegacion (explore, approach, return_home) sin entrenar un VLM desde cero, gracias al bajo coste de entrenamiento (13 minutos en una RTX 3060).
- Docencia y experimentacion con LoRA sobre VLMs: sirve como ejemplo reproducible de como especializar Qwen3-VL-4B-Instruct con un adaptador de 655.360 parametros para una tarea concreta, con informes de entrenamiento publicados.
- Evaluacion de la interfaz lenguaje-accion: util para estudiar como un modelo interpreta instrucciones ambiguas y cuando emite clarify o unsupported, en el contexto de tareas de robotica simulada.
- Benchmark interno de sistemas VLM+ejecutor: el modelo card reporta metricas estrictas y de equivalencia de resultado sobre rollouts, lo que permite comparar configuraciones (lang-v1 a lang-v4) bajo el mismo arnes de evaluacion.
- Base para extension a otros entornos simulados: dado que el adaptador solo emite etiquetas de habilidad, puede reutilizarse como punto de partida para experimentos con otros ejecutores o mapas, siempre en simulacion.

## Benchmarks y rendimiento

Los datos publicados miden el sistema completo (adaptador mas ejecutores del repositorio en el commit correspondiente), no el adaptador aislado. La evaluacion se realizo en rollouts end-to-end en el simulador con 8 layouts no vistos por grupo de semillas, tareas "approach the leftmost ball (and return)", "move forward 20 cm" y 3 tareas de explore-and-approach por layout. La puntuacion estricta exige la habilidad exacta que espera el rule teacher en cada paso; la de equivalencia de resultado tambien cuenta done donde el teacher espera stop tras exito fisico.

| Adaptador | Layouts | Estricto | Equivalencia de resultado |
|---|---|---|---|
| lang-v2 | semillas 99000, 99100 (nunca usadas para decisiones) | 61/74 (82,4%) | 65/74 (87,8%) |
| lang-v4 | mismas semillas | 60/74 (81,1%) | 64/74 (86,5%) |
| lang-v2 vs lang-v3 | semillas 98000, 98100 (layouts de desarrollo) | 69/80 vs 66/80 | no disponible |
| lang-v1 | semillas 98000, 98100, ejecutor antiguo | 52/80 | no disponible |

Advertencias del autor: las cifras miden el sistema completo; repeticiones identicas cambian aproximadamente 10 de 73 tareas, por lo que diferencias de pocas tareas son ruido (lang-v2 vs lang-v4 da p = 1,0 en McNemar exacto emparejado); la puntuacion se compara contra un rule teacher propio del proyecto y no contra un benchmark externo; se trata de un robot, un simulador y un modelo base, sin afirmacion de transferencia a robots reales u otros entornos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade 655.360 parametros, despreciable frente al modelo base. Con Qwen3-VL-4B-Instruct en 4-bit NF4 (como en el entrenamiento) se estima un uso en torno a 4-5 GiB, aunque el modelo card no publica cifras exactas de VRAM.
- GPU recomendadas: para entrenamiento, una RTX 3060 de 8 GiB fue suficiente (unos 13 minutos por adaptador). Para inferencia, cualquier GPU con al menos 8 GiB en 4-bit; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, la RTX 3060 de 8 GiB se uso para entrenar; en inferencia 4-bit deberia caber en GPUs consumer de 8 GiB o mas.
- Opciones de despliegue: transformers con peft y bitsandbytes (metodo documentado en el model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-skill-agent (lang-v2) | adaptador LoRA de 655.360 sobre Qwen3-VL-4B-Instruct | no disponible (entrenado con 1.024 tokens) | 82,4% estricto / 87,8% equivalencia en su evaluacion interna | Apache-2.0 | Hugging Face (adaptador) y GitHub (ejecutores) |
| Qwen3-VL-4B-Instruct (modelo base) | 4.000 millones | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Hugging Face |
| Adaptadores lang-v1, lang-v3, lang-v4 | mismo esquema LoRA | mismo esquema | 52/80 (v1), 66/80 (v3), 81,1% estricto (v4) | Apache-2.0 | mismo repositorio |

No se dispone de informacion sobre otros modelos comparables de politica de habilidades para robotica simulada en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion: el autor indica explicitamente "Simulation only. Never run on a physical robot."
- No es un controlador de robot autonomo: requiere el formato de prompt, la realimentacion del ejecutor y los ejecutores de habilidades del repositorio https://github.com/atlasmarkz/microduck-qwen (microduck_qwen/agent.py, microduck_qwen/agent_eval.py). Los prompts libres no producen de forma fiable el formato entrenado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: el modelo puede emitir habilidades incorrectas o no soportadas; la evaluacion muestra que repeticiones identicas cambian aproximadamente 10 de 73 tareas.
- Limitaciones de idioma: solo chino e ingles.
- Restricciones de licencia: Apache-2.0, igual que el modelo base; no se documentan restricciones adicionales para uso comercial, pero el uso previsto es experimental en simulacion.
- Caveats de evaluacion: las metricas miden el sistema completo, no el adaptador aislado; se comparan contra un rule teacher propio y no contra un benchmark externo; no hay evidencia de transferencia a robots reales u otros entornos.
- Datos de entrenamiento no publicados: no es posible auditar la composicion del dataset.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB (solo adaptadores y tarjetas).

## Enlaces

- Hugging Face: https://huggingface.co/atlasmarkz/microduck-skill-agent
- Repositorio del proyecto: https://github.com/atlasmarkz/microduck-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
