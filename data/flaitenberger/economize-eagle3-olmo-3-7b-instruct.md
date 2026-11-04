# flaitenberger/economize-eagle3-Olmo-3-7B-Instruct

## Resumen

`economize-eagle3-Olmo-3-7B-Instruct` es un cabezal de borrador (draft head) EAGLE-3 para el modelo base `allenai/Olmo-3-7B-Instruct`, publicado por el usuario `flaitenberger` dentro del ecosistema del proyecto `economize`. No es un modelo generativo independiente: es un adaptador de decodificación especulativa que acelera la inferencia del modelo base sin alterar su distribución de salida, ya que cada token propuesto por el borrador se verifica con el modelo grande. El repositorio contiene únicamente los pesos del borrador (437M parámetros) y no los del modelo base.

El borrador implementa una sola capa decodificadora que lee los estados ocultos del modelo base en tres profundidades, los fusiona en un único vector y, junto con el embedding del último token, predice los siguientes tokens mediante su propia LM head restringida a los 32 768 tokens más frecuentes de los datos de entrenamiento. Su MLP tiene anchura 11 008. Se entrenó con la librería `economize` (versión ≥0.4) y está pensado para integrarse en pipelines de generación con `transformers`.

La relevancia de esta ficha es acotada pero concreta: permite acelerar la decodificación de Olmo-3-7B-Instruct en producción (hasta 1,97x en tareas de matemáticas y 1,55x de media global según las mediciones del autor en una H100), manteniendo la fidelidad al modelo base en decodificación greedy. Es un artefacto de infraestructura, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head (una capa decodificadora con fusión de estados ocultos a tres profundidades y LM head propia) |
| Parametros totales | 437M (solo el borrador; el modelo base no está incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Olmo-3-7B-Instruct) |
| Tipos de cuantizacion | bf16 (medido); float32 soportado para fidelidad exacta; no se documentan cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/Olmo-3-7B-Instruct (revisión `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`) |
| Anchura del MLP del borrador | 11 008 |
| Vocabulario de la LM head del borrador | 32 768 tokens más frecuentes del entrenamiento |
| Librería | economize (≥0.4) |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El borrador sigue la arquitectura EAGLE-3: una única capa decodificadora que consume los estados ocultos del modelo base en tres profundidades, los fusiona en un vector y, combinado con el embedding del último token, predice los siguientes tokens con su propia LM head. La MLP del borrador tiene anchura 11 008 y la LM head está restringida a los 32 768 tokens más frecuentes de los datos de entrenamiento. El checkpoint almacena la configuración de decodificación más rápida medida (`cycle_length=4`, hasta 3 borradores por pasada del modelo base), aunque puede modificarse mediante `DecodeConfig`.

El entrenamiento se realizó con la librería `economize` sobre respuestas generadas por el propio modelo base, de modo que el borrador aprende su distribución de salida. El proceso constó de tres fases: (1) un pool de 292 212 prompts procedentes de fuentes como UltraChat, ShareGPT, Magicoder-OSS-Instruct, GSM8K, MATH, NuminaMath y otras, con filtrado de duplicados y eliminación de prompts que compartieran un 13-grama con los conjuntos de evaluación (incluido MBPP); (2) generación de respuestas con el modelo base vía vLLM 0.30.0 en bf16, decodificación greedy, hasta 2048 tokens de prompt y 2048 nuevos, con `enable_thinking=True` en las fuentes matemáticas; (3) división de entrenamiento con los primeros 29 549 registros (31,4M tokens tras truncar a 2048 por registro) y 128 registros reservados para evaluación. De los registros de entrenamiento, 4 511 se generaron con thinking habilitado y 2 976 alcanzaron el límite de 2048 tokens; los prompts promedian 196 tokens y las respuestas 886 (mediana 777).

## Capacidades

- Aceleración de decodificación especulativa para `allenai/Olmo-3-7B-Instruct` mediante borradores verificados por el modelo base.
- Decodificación greedy exacta: cada borrador se verifica, por lo que la salida greedy coincide con la del modelo base (en float32 de forma exacta; en bf16 puede divergir tras muchas iteraciones por redondeo).
- Muestreo especulativo con `verifier="rejection"`, que sigue la distribución de muestreo del modelo base.
- Predicción de hasta 3 tokens por pasada del modelo base con la configuración por defecto (`cycle_length=4`).
- Integración con `transformers` y `economize` mediante `from_pretrained`, `load`, `generate` y `decode`.
- No soporta tool calling, agentes, visión, audio ni capacidades multimodales por sí mismo; esas capacidades dependen del modelo base.
- No es un modelo de chat ni de generación autónoma: requiere el modelo base cargado.

## Casos de uso

- Aceleración de inferencia en producción de Olmo-3-7B-Instruct: adjuntar el borrador al modelo base con `economize.load(base, ...)` para reducir la latencia de decodificación en un 35-97 % según la tarea, sin cambiar la salida greedy.
- Servicio de chat de alto rendimiento: con 1,35x de aceleración medida en dominios de chat (MT-Bench, AlpacaEval, Arena-Hard), adecuado para despliegues conversacionales con muchos turnos donde el coste por token es crítico.
- Generación de código asistida: 1,63x en HumanEval, MBPP y LiveCodeBench, útil en asistentes de programación o pipelines de CI/CD que generan parches y tests.
- Razonamiento matemático: 1,97x en GSM8K, MATH-500, AIME y AMC, el escenario con mayor ganancia, idóneo para pipelines de evaluación o generación de soluciones paso a paso.
- Resumen de documentos: 1,24x en CNN/DailyMail, aplicable a servicios de summarización por lotes donde el throughput importa.
- Procesamiento de contexto largo: 1,24x en LongBench, útil en análisis de documentos extensos o RAG con ventanas amplias.
- Investigación en decodificación especulativa: artefacto reproducible para estudiar EAGLE-3, verificación por rechazo y fidelidad bf16 frente a float32.

## Benchmarks y rendimiento

El autor publica una única tabla de speedup relativo a decodificación greedy del modelo base, medida con economize 0.3.2 en una NVIDIA H100 en bf16 con CUDA graphs y batch size 1, con prompts de 8 ejemplos por conjunto y hasta 256 tokens nuevos:

| Categoría | Speedup | Tokens por pasada del modelo base |
|---|---|---|
| Global | 1,55x | 2,07 |
| Chat | 1,35x | no disponible |
| Código | 1,63x | no disponible |
| Matemáticas | 1,97x | no disponible |
| Resumen | 1,24x | no disponible |
| Contexto largo | 1,24x | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el borrador no altera la distribución del modelo base en decodificación greedy. El autor indica que en bf16 el 49 % de las respuestas fueron idénticas al greedy plano en los 256 tokens medidos, y que en float32 la salida coincide exactamente.

## Requisitos de hardware

- VRAM estimada: el borrador añade 437M parámetros (≈0,9 GB en bf16) sobre el modelo base de 7B; el conjunto requiere aproximadamente 15-16 GB en bf16 para inferencia.
- GPU recomendadas: NVIDIA H100 (medición oficial), A100 80GB y GPUs con al menos 24 GB para el conjunto en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con el modelo base en bf16; en GPUs de 16 GB requeriría cuantización del modelo base, no documentada para el borrador.
- Opciones de despliegue: `economize` (≥0.4) con `transformers`; el autor no documenta integración con vLLM, llama.cpp, Ollama ni TGI para este borrador.
- Latencia y throughput: 1,55x de media y 2,07 tokens por pasada del modelo base en H100 con CUDA graphs y batch size 1; no se publican valores absolutos de latencia ni throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| economize-eagle3-Olmo-3-7B-Instruct | Draft head EAGLE-3 | 437M (borrador) | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Otros drafters EAGLE-3 de la colección economize | Draft head EAGLE-3 | no disponible | no disponible | no disponible | Colección `economize-drafters` en HuggingFace |
| EAGLE-3 original (paper) | Draft head EAGLE-3 | no disponible | no disponible | no disponible | Repositorio de investigación |

No se dispone de datos de rendimiento de los drafters alternativos de la colección ni de comparaciones directas con el EAGLE-3 original en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `allenai/Olmo-3-7B-Instruct` y la librería `economize` ≥0.4; no funciona con `transformers` de forma aislada.
- En bf16, la verificación sobre varios tokens redondea de forma distinta a la decodificación de un solo token, por lo que tras muchas iteraciones la salida puede divergir del greedy plano (solo el 49 % de las respuestas fueron idénticas en los 256 tokens medidos). Para fidelidad exacta debe usarse float32.
- El vocabulario de la LM head del borrador está restringido a 32 768 tokens; los tokens fuera de ese conjunto no pueden proponerse como borradores (aunque el verificador los aceptaría si el modelo base los generara).
- La aceleración medida procede de una única ejecución de timing en una H100 con batch size 1; no se documentan resultados en otras GPUs, con batching mayor ni con otras configuraciones.
- No se documentan idiomas soportados ni sesgos específicos del borrador; hereda los del modelo base Olmo-3-7B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- Riesgo de alucinación: no aplica al borrador en sí (verificado por el modelo base), pero sí al modelo base subyacente.

## Enlaces

- HuggingFace: https://huggingface.co/flaitenberger/economize-eagle3-Olmo-3-7B-Instruct
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- GitHub de economize: https://github.com/Thiggel/economize
- PyPI: https://pypi.org/project/economize/
- Documentación: https://thiggel.github.io/economize/
- Colección de drafters economize: https://huggingface.co/collections/flaitenberger/economize-drafters-6aeb7d0f6cae8de3208fd3e7
