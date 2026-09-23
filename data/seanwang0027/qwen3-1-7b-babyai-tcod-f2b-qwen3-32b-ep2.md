# SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep2

## Resumen

Este repositorio contiene un ajuste fino del modelo denso Qwen3-1.7B obtenido mediante destilación on-policy con el algoritmo TCOD (forward-to-backward) sobre el entorno BabyAI. El autor es SeanWang0027 y el modelo se publica como un artefacto de investigación asociado a un pipeline de destilación donde el estudiante es Qwen3-1.7B y el profesor es Qwen3-32B en precisión bf16, con el modo de razonamiento (thinking) desactivado. El checkpoint exportado corresponde al paso 101 del explorer (paso 106 del trainer) dentro de la segunda de tres pasadas sobre los datos.

El objetivo declarado no es la generación de texto generalista, sino reproducir en un modelo pequeño el comportamiento de un profesor mucho mayor sobre las 810 tareas oficiales de entrenamiento de BabyAI, un conjunto de tareas de navegación e instrucciones en un entorno de rejilla sintético. La conversación empleada sigue el formato de `babyai/eval_babyai.py` con 20 turnos por episodio, lo que lo convierte en un banco de pruebas para técnicas de imitación multi-turno y aprendizaje por refuerzo con destilación en línea.

Con 2.031.739.904 parámetros totales y un tamaño de repositorio de 4,1 GB, es un modelo pequeño, apto para experimentación en una sola GPU de consumo. Su relevancia es metodológica: documenta la receta TCOD aplicada a BabyAI y sirve para estudiar si un transformer denso de 1,7B puede absorber el comportamiento de un profesor de 32B en tareas de agente conversacional. La model card advierte explícitamente de que el modelo **no ha sido evaluado**.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 |
| Parámetros totales | 2.031.739.904 (2,03B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen/Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN. No verificado para este fine-tune |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen3-1.7B es multilingüe, pero el ajuste se ha realizado sobre diálogos sintéticos en inglés de BabyAI |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamaño del repositorio | 4,1 GB |
| Pipeline | text-generation |
| Compatibilidad de endpoints | Etiquetado como `text-generation-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con atención completa, normalización RMSNorm y sin mezcla de expertos. El entrenamiento se realiza con destilación on-policy sobre el entorno BabyAI, usando el algoritmo TCOD en su variante forward-to-backward, en la que la ventana del episodio crece progresivamente y se fija un `checkpoint_steps` de 6. La implementación proviene del repositorio `kokolerk/TCOD` con un overlay de FutureBridge-OPD sobre `trinity-rft`, y el port de BabyAI descrito en `docs/TCOD_BABYAI.md` de la rama `tcod-babyai` del repositorio online-rose.

Los hiperparámetros documentados son: estudiante Qwen3-1.7B, profesor Qwen3-32B en bf16, razonamiento desactivado, conversación de 20 turnos según `babyai/eval_babyai.py`, las 810 tareas oficiales de entrenamiento, batch de 16 episodios / 64 turnos, tasa de aprendizaje 1e-6, coeficiente de KL de 1.0 y tres pasadas sobre los datos, lo que suma 152 pasos de explorer. La exportación a HuggingFace corresponde al paso 101 (paso 106 del trainer), por lo que se trata de un checkpoint intermedio y no del resultado final de las tres pasadas. No se documenta ningún uso de RLHF ni de DPO.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de BabyAI, con episodios de hasta 20 turnos.
- Seguimiento de instrucciones y ejecución de acciones en el entorno de rejilla de BabyAI (tareas de navegación, colocación y manipulación de objetos).
- Destilación de comportamiento de un profesor de 32B en un estudiante de 1,7B, lo que sugiere cierta capacidad de imitar patrones de decisión del profesor en el dominio entrenado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes fuera del bucle de BabyAI ni razonamiento multi-paso general.
- El modo de razonamiento (thinking) está desactivado durante el entrenamiento, por lo que no se ha optimizado para cadenas de pensamiento explícitas.
- No hay capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas para este fine-tune.

## Casos de uso

- Investigación en destilación on-policy: el modelo sirve como sujeto de estudio para medir cuánto comportamiento de un profesor de 32B se transfiere a un estudiante de 1,7B cuando se usan ventanas de episodio crecientes y tres pasadas sobre 810 tareas.
- Reproducción de experimentos TCOD: dado que la model card documenta pasos, hiperparámetros y receta, puede usarse como punto de control intermedio para comparar la curva de aprendizaje entre los pasos 101 y el final de las tres pasadas.
- Evaluación de agentes conversacionales en entornos sintéticos: sirve como línea base para medir la degradación de un modelo pequeño en diálogos multi-turno de 20 turnos con estado parcialmente observable.
- Estudio de olvido catastrófico: al ser un fine-tune estrecho sobre BabyAI, es útil para cuantificar cuánto conocimiento generalista de Qwen3-1.7B se pierde tras el ajuste y para ensayar técnicas de regularización.
- Prototipado de pipelines de RL distribuido: el modelo está asociado a una pila basada en trinity-rft, por lo que puede emplearse para validar infraestructura de entrenamiento antes de escalar a modelos mayores.
- Docencia y divulgación técnica: por su tamaño (4,1 GB en safetensors) y su compatibilidad con transformers, permite demostrar un ciclo completo de destilación profesor-estudiante en una única GPU de consumo.
- Pruebas de integración con text-generation-inference: al estar etiquetado como `endpoints_compatible`, es adecuado para verificar el despliegue de modelos pequeños en TGI sin coste elevado de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Not evaluated" y no incluye métricas de éxito en BabyAI ni comparaciones con el profesor Qwen3-32B.

| Benchmark | Resultado |
|---|---|
| BabyAI (810 tareas oficiales) | No disponible; el modelo no ha sido evaluado |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 4,1 GB solo para pesos, más caché KV y activaciones; con una ventana de contexto de 32.768 tokens el consumo puede superar los 8-10 GB dependiendo del batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,1-3 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,1-2 GB de pesos. No hay versiones GGUF ni AWQ publicadas en el repositorio, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En 4 bits cabe en GPU de 4-6 GB, como RTX 3050 o GTX 1660 con 6 GB.
- Cabe sin problemas en GPU de consumo. Para entrenamiento o ajuste fino se recomienda al menos 16-24 GB de VRAM, o bien usar técnicas de PEFT y cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y, previa conversión, vLLM, llama.cpp u Ollama. No se han publicado pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep2 | 2,03B | No disponible (base: 32.768) | No disponible | HuggingFace, 0 descargas | Fine-tune de investigación sobre BabyAI, sin evaluar |
| Qwen/Qwen3-1.7B | 1,7B (2,03B con embeddings) | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente distribuido | Modelo base; capacidades generalistas y multilingües |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7B | 8.192 | Apache 2.0 | HuggingFace | Alternativa de tamaño similar orientada a uso general; los datos concretos de rendimiento no están disponibles en la información proporcionada |
| Llama-3.2-1B (Meta) | 1,24B | 128.000 | Llama 3.2 Community License | HuggingFace | Alternativa de tamaño comparable; los datos concretos de rendimiento no están disponibles en la información proporcionada |

## Limitaciones y advertencias

- El modelo no ha sido evaluado. La propia model card indica "Not evaluated", por lo que no existen métricas que respalden su calidad en ninguna tarea.
- Es un checkpoint intermedio: corresponde al paso 101 del explorer dentro de la segunda de tres pasadas sobre los datos, no al resultado final del entrenamiento.
- El ajuste se ha realizado exclusivamente sobre las 810 tareas sintéticas de BabyAI, con conversaciones de `babyai/eval_babyai.py` y razonamiento desactivado. Es previsible un olvido catastrófico de las capacidades generalistas de Qwen3-1.7B, aunque no se aportan mediciones.
- El riesgo de alucinación fuera del dominio de BabyAI es elevado, dado el ajuste estrecho sobre un entorno de rejilla con vocabulario y estado limitados.
- La licencia no está declarada en la información disponible, lo que impide determinar si se permite el uso comercial. Cualquier uso en producción requiere aclarar este punto con el autor y verificar la licencia del modelo base.
- Los idiomas soportados no están documentados. Aunque el modelo base es multilingüe, el ajuste se ha hecho sobre diálogos en inglés, por lo que el comportamiento en castellano es incierto.
- No hay soporte documentado de tool calling, function calling ni agentes fuera del entorno de entrenamiento.
- El repositorio registra 0 descargas y 0 likes, lo que indica que no ha pasado por revisión ni validación por parte de la comunidad.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos si se quiere desplegar en hardware muy limitado.
- Los resultados de la búsqueda web asociados a esta consulta no guardan relación con el modelo (corresponden a listados de relojes de segunda mano), por lo que no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio TCOD citado en la model card (`kokolerk/TCOD`): no se ha proporcionado URL verificable en la información disponible
- Framework trinity-rft citado en la model card: no se ha proporcionado URL verificable en la información disponible
- Repositorio online-rose, rama `tcod-babyai` y documento `docs/TCOD_BABYAI.md`: no se ha proporcionado URL verificable en la información disponible
- Paper o blog técnico de TCOD: no disponible
- Demo o espacio de inferencia: no disponible
