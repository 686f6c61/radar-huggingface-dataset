# myendless/action-repre-hygon-real6-lap-eef20-h50-source30k-f17f2ad5

## Resumen

El modelo `myendless/action-repre-hygon-real6-lap-eef20-h50-source30k-f17f2ad5` es un checkpoint de representación de acciones para robótica desarrollado por el usuario myendless, derivado del modelo base multimodal Qwen/Qwen3-VL-4B-Instruct. Forma parte de una familia de experimentos denominada internamente "qwenpi-v4" y "text action" (identificador `lap`), orientada a codificar acciones de robots reales en un espacio de representación textual. El modelo se ha entrenado durante 30.000 pasos sobre 900 registros de seis tareas reales de manipulación, con configuración EEF20/H50 (efector final, horizonte 50) y una frecuencia de 30 Hz.

La relevancia de este checkpoint es acotada y muy específica: no es un modelo de lenguaje conversacional ni una política de control cerrada, sino un backbone de representación que sirve como pesos de origen para un cabezal de ejecución posterior (publicado de forma separada por el mismo autor). El autor advierte explícitamente que en esta fase el "action expert" está congelado, la pérdida de acción es cero y el modelo no debe describirse como una política de control en bucle cerrado ya entrenada. Se trata, por tanto, de material de investigación para reproducir o auditar un pipeline de representación de acciones.

El repositorio ocupa 11,3 GB e incluye el `model.pt` nativo (state_dict completo), configuración, processor, manifest, normalización, evidencia geométrica y protocolo revisado. No incluye pesos intermedios, estado del optimizador ni las imágenes o ficheros MCAP originales. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3-VL (base: Qwen/Qwen3-VL-4B-Instruct); pipeline de representación de acciones con action expert congelado |
| Parametros totales | 4B (heredados del modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo, requiere el cargador `action_repre`); no se publican safetensors ni GGUF |
| Tarea | robotics / action-representation |
| Configuracion de accion | EEF20 / H50 (efector final, horizonte 50), 30 Hz |
| Pasos de entrenamiento | 30.000 (global batch 64) |
| Datos de entrenamiento | 900 registros de seis tareas reales; sin conjunto de test reservado |
| Tamano del repo | 11,3 GB |
| SHA256 checkpoint | f17f2ad57e0e2e7252d772deabc3ad50a3bd8c5dd05e26fd2239f84523048689 |
| SHA256 protocolo | 60839c99f68361c7f6a9a9047e06853e1b36297a8074ebc53d9e2438871cc33b |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parámetros, y se adapta mediante un pipeline propio (`QwenPIRepresentationV4`) para producir una representación textual de acciones robóticas. La configuración de acción es EEF20/H50: representación del efector final con horizonte de predicción de 50 pasos a una frecuencia de 30 Hz. El entrenamiento se realizó durante 30.000 pasos con batch global de 64 sobre 900 registros correspondientes a seis tareas reales de manipulación.

Un aspecto técnico clave es que en esta fase el "action expert" (el módulo encargado de generar acciones) permanece congelado y la pérdida de acción es nula. El objetivo del entrenamiento es construir el backbone de representación que servirá como pesos de origen para un cabezal de ejecución independiente, ya publicado por el autor. El repositorio conserva la convención de guardado `periodic_weights_only` como evidencia del protocolo original, pero solo se suben los pesos finales de 30k. La normalización se incluye empaquetada y el autor advierte que cualquier migración de rutas de máquina debe mapearse explícitamente sin reajustar (`refit`) la normalización.

## Capacidades

- Codificación de acciones robóticas en un espacio de representación textual (identificador `lap`, "text action").
- Representación de acciones de efector final con horizonte de 50 pasos (EEF20/H50) a 30 Hz.
- Procesamiento multimodal heredado del modelo base Qwen3-VL-4B-Instruct (visión y lenguaje), si bien el uso previsto es la representación de acciones.
- Soporte de los idiomas chino (zh) e inglés (en) en las componentes lingüísticas heredadas.
- Suministro de pesos de origen para un cabezal de ejecución separado (no incluido en este repositorio).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido específicos de este checkpoint.
- No es una política de control en bucle cerrado: el autor lo desmiente explícitamente en la model card.

## Casos de uso

- Investigación en representación de acciones: usar el checkpoint como backbone para estudiar cómo se codifican acciones de robots reales en un espacio textual, aprovechando que se publican configuración, processor, manifest y normalización.
- Punto de partida para entrenar cabezales de ejecución: el autor indica que este checkpoint es la fuente de pesos para un cabezal de ejecución independiente ya publicado; sirve para reproducir ese pipeline o entrenar variantes.
- Reproducción de experimentos: al incluirse evidencia geométrica, protocolo con SHA256 y convención de guardado, permite auditar y reproducir el entrenamiento de representación sobre seis tareas reales.
- Benchmarking de representaciones de acción: el autor mantiene una colección "Action Representation Benchmark - Final v4" con variantes (texto, imagen, discreta, joint14/H32), lo que permite comparar esta representación `lap` frente a otras.
- Análisis de normalización y geometría: el paquete incluye normalización y evidencia geométrica, útil para estudiar el efecto de la normalización en representaciones de efector final con horizonte 50.
- Evaluación de transferencia entre tareas: con 900 registros de seis tareas reales, permite estudiar la generalización de la representación entre tareas de manipulación antes de acoplar un cabezal de ejecución.
- Docencia y divulgación técnica: como ejemplo documentado de pipeline de representación de acciones sobre un VLM de 4B, con protocolo y hashes verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte expresamente que la pérdida de entrenamiento no equivale a tasa de éxito en bucle cerrado y que la validación en robot real y la calibración de campo aún no se han realizado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B parámetros en FP16 requiere del orden de 8-9 GB solo para pesos, más overhead de activaciones y del processor multimodal; el repositorio de 11,3 GB incluye el state_dict completo y artefactos auxiliares.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabría en GPUs de 24 GB (RTX 4090, A10G, L4 con cuantización) y en A100/H100 para entrenamiento o lotes mayores.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en FP16; en GPUs de 16 GB requeriría cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor indica que `model.pt` requiere el cargador propio `action_repre` y que las rutas de máquina deben mapearse explícitamente sin reajustar la normalización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| action-repre-hygon-real6-lap-eef20-h50-source30k (este) | 4B (base Qwen3-VL-4B-Instruct) | no disponible | Representación de acciones (texto), EEF20/H50 | no disponible | Hugging Face, 0 descargas |
| action-repre-hygon-real6-lap-eef20-h50-head10k | no disponible | no disponible | Cabezal de ejecución derivado del anterior | no disponible | Hugging Face (enlace en la model card) |
| action-repre-hygon-aloha-core8-fast-source30k | no disponible | no disponible | Representación de acciones discretas (FAST), nuevo cuerpo | no disponible | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4B | no disponible en la información | VLM instructivo general | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- No es una política de control en bucle cerrado: el action expert está congelado, la pérdida de acción es cero y el autor lo califica como pesos de origen, no como controlador entrenado.
- Sin conjunto de test: los 900 registros se usaron íntegramente para entrenamiento, por lo que no hay evaluación de generalización publicada.
- La pérdida de entrenamiento no es una métrica de éxito: el autor advierte que no equivale a tasa de éxito en robot real.
- Validación de campo pendiente: el bucle cerrado en robot real y la calibración de campo no se han aceptado ni verificado.
- Normalización no reajustable: cualquier migración de rutas debe mapearse explícitamente; reajustar la normalización invalida la reproducibilidad.
- Formato propietario: requiere el cargador `action_repre`; no hay safetensors, GGUF ni integración con stacks estándar de inferencia.
- Licencia no declarada: no se puede confirmar el uso comercial; tratar como no apto para producción hasta aclaración.
- Idiomas limitados a zh y en en las componentes lingüísticas; no se documenta soporte de castellano.
- Sin datos de sesgos, alucinación o robustez: no disponibles en la información proporcionada.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myendless/action-repre-hygon-real6-lap-eef20-h50-source30k-f17f2ad5
- Cabezal de ejecución derivado: https://huggingface.co/myendless/action-repre-hygon-real6-lap-eef20-h50-head10k-a4c4d9aa
- Variante ALOHA core8 FAST: https://huggingface.co/myendless/action-repre-hygon-aloha-core8-fast-source30k-08e80bff
- Colección Action Representation Benchmark - Final v4: https://huggingface.co/collections/myendless/action-representation-benchmark-final-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
