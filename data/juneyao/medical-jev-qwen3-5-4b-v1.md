# JuneYao/medical-jev-qwen3.5-4b-v1

## Resumen

Medical JEV Qwen3.5-4B v1 es un adaptador LoRA de puntuación de opciones (choice scoring) para tareas de decisión médica, construido sobre el modelo base Qwen3.5-4B de Alibaba. Lo desarrolla el usuario JuneYao y no es un modelo generativo al uso: dado un caso clínico, un conjunto de reglas de decisión y una lista de opciones candidatas, devuelve en un único forward pass la clave semántica de la opción seleccionada junto con las probabilidades asociadas. No produce explicaciones ni cadenas de pensamiento (chain-of-thought).

El modelo aborda un problema concreto: convertir un LLM generalista de 4.000 millones de parámetros en un clasificador de decisiones médicas estructuradas, evitando la generación libre y sus riesgos asociados (alucinación de opciones inexistentes, formato inconsistente). Para ello se entrena un LoRA de rango 16 sobre las 32 capas del transformer, con 32.464.896 parámetros entrenables y 44.847 muestras de entrenamiento durante 2 épocas.

Su relevancia actual es doble: por un lado, demuestra una arquitectura de adaptación ligera (129,9 MB de pesos) sobre un modelo de 4B; por otro, publica una evaluación externa honesta sobre 1.514 preguntas médicas en la que el adaptador mejora al readout del modelo base en 7,60 puntos porcentuales (63,87 % frente a 56,27 %), aunque no supera a una versión anterior del propio sistema JEV (70,87 %). Es un modelo de investigación, no validado clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-4B (32 capas, rank 16, alpha 32) |
| Parametros totales | 32.464.896 parametros entrenables en el adaptador; base Qwen3.5-4B (tamano total del base no disponible en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens de prompt completo por consulta |
| Tipos de cuantizacion | no disponible (inferencia en FP16/SDPA en GPU, FP32 en CPU) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | MIT para codigo y adaptador; Apache-2.0 para el modelo base |
| Formato de pesos | safetensors (`adapter.safetensors`, 129.912.616 bytes, SHA-256 `88c64b00d23201118a9b7b4bad192aba6a5fcb5de4e65f00542529554425b4b6`); formato propietario `jev-lora-v1`, no PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros (arquitectura interna del base no detallada en la información disponible). El LoRA cubre las 32 capas completas con rank 16 y alpha 32. El entrenamiento usó 44.847 muestras durante 2 épocas, con selección del checkpoint en el step 5.500 según el conjunto de desarrollo. Esta primera versión no empleó etiquetas blandas de profesor ni RSI (reinforcement learning con retroalimentación). El modelo base queda fijado al commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, y el loader descarga y verifica por SHA-256 unos 9,3 GB de pesos del base.

La innovación técnica principal es el formato de salida: en lugar de generar texto, el modelo realiza una lectura de logits restringida a las opciones candidatas y devuelve la clave semántica y las probabilidades normalizadas. Admite entre 2 y 26 candidatos por pregunta. Si el prompt excede los 1.536 tokens o el número de opciones no es soportado, devuelve `status: unsupported` con el motivo, sin truncar ni eliminar opciones silenciosamente. El paquete incluye código de inferencia propio (`ChoicePredictor`), no compatible con PEFT ni con la API de chat de Hugging Face. Existe una ruta de referencia en PyTorch puro y una ruta optimizada con los kernels FLA y causal-conv1d, que pueden producir diferencias numéricas menores.

## Capacidades

- Puntuación de opciones múltiples en un único forward pass, devolviendo clave de opción y distribución de probabilidad.
- Decisión estructurada sobre casos clínicos con reglas explícitas (por ejemplo, comparación frente a umbrales).
- Manejo de entre 2 y 26 candidatos por consulta.
- Procesamiento por lotes (`--batch-size`, por defecto 8) para evaluar múltiples casos.
- Soporte bilingüe chino-inglés en el prompt de entrada.
- Detección explícita de entradas no soportadas (longitud excesiva o número de opciones fuera de rango) con estado y causa.
- No genera explicaciones, justificaciones ni cadenas de pensamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes; es un clasificador de decisión de un solo paso.
- No dispone de interfaz de chat online ni Inference Provider en Hugging Face.

## Casos de uso

- Triage de decisiones clínicas cerradas: dado un caso con constantes vitales y umbrales definidos, el modelo selecciona la categoría correcta (por ejemplo, "por debajo" o "por encima" del umbral) con una probabilidad asociada, útil como componente de un sistema de apoyo a la decisión.
- Evaluación automatizada de exámenes médicos de opción múltiple: con entre 2 y 26 opciones por pregunta y prompts de hasta 1.536 tokens, puede puntuar bancos de preguntas de forma determinista y por lotes.
- Clasificación de fenotipos o categorías diagnósticas restringidas: cuando el conjunto de etiquetas está acotado y se dispone de reglas de decisión explícitas, el adaptador evita la generación libre y sus formatos inconsistentes.
- Investigación en adaptación ligera de LLM: sirve como referencia reproducible de LoRA de rango 16 sobre todas las capas de un modelo de 4B, con pesos, código y evaluación publicados.
- Filtrado y priorización en pipelines de datos clínicos: al devolver probabilidades calibradas (aunque no calibradas formalmente), permite ordenar candidatos y derivar los casos de baja confianza a revisión humana.
- Componente de sistemas de decisión con reglas auditables: la salida estructurada (clave + probabilidad + estado) encaja en arquitecturas donde se exige trazabilidad de la decisión y rechazo explícito de entradas fuera de especificación.

## Benchmarks y rendimiento

Evaluación externa del 2 de noviembre de 2026 sobre 1.514 preguntas médicas, en vista única, con los pesos fijados antes de la evaluación:

| Sistema | Total 1.514 (no soportadas cuentan como error) | Subconjunto común 1.313 |
|---|---:|---:|
| Qwen3.5-4B readout (sin entrenar) | 852 / 1.514 · 56,27 % | 852 / 1.313 · 64,89 % |
| Medical JEV v1 | 967 / 1.514 · 63,87 % | 967 / 1.313 · 73,65 % |
| JEV 1.13 (archivado) | 1.073 / 1.514 · 70,87 % | 975 / 1.313 · 74,26 % |

Mejora sobre el readout del base: +7,60 puntos porcentuales en el total y +8,76 en el subconjunto común (intervalo bootstrap del 95 %: +5,85 a +11,79). Frente a JEV 1.13 en el subconjunto común: −0,61 puntos (intervalo −3,23 a +2,02), sin evidencia de superioridad. De las 201 preguntas no soportadas, 100 corresponden a diagnóstico con 49 candidatos, 100 a síndromes de medicina tradicional china con 148 candidatos y 1 a exceso de longitud. En la tarea de triage cubierta, el modelo acierta 40/100 frente a 66/100 de JEV. El conjunto de desarrollo de cuatro vistas alcanza 83,81 %, pero es una métrica de selección de modelo y no un resultado de test externo. El conjunto de test sellado de 1.620 preguntas aún no se ha evaluado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entorno verificado: Linux, Python 3.12, RTX 5090 de 32 GB, CUDA 12.8, PyTorch 2.8.0, Transformers 5.19.0, FP16 con SDPA.
- El adaptador ocupa 129,9 MB; el modelo base requiere aproximadamente 9,3 GB de descarga y debe residir en memoria durante la inferencia.
- VRAM estimada para inferencia en FP16: no disponible de forma explícita; el base de 4B en FP16 requiere del orden de 8-9 GB, por lo que encaja en GPUs de consumo con 16 GB o más y en la RTX 5090 de 32 GB verificada.
- Ruta de CPU: FP32, sin validación completa de rendimiento.
- Despliegue: no compatible con vLLM, TGI, Ollama ni llama.cpp en el formato actual; requiere el cargador propio `predict_choices.py` o la clase `ChoicePredictor` del paquete `jevtrain.inference`.
- Ajuste de lote mediante `--batch-size` (por defecto 8; usar 1 si hay presión de VRAM).
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que no hay evidencia de ventaja de velocidad entre plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medical JEV Qwen3.5-4B v1 | 32,5 M entrenables sobre base 4B | 1.536 tokens | Choice scoring médico con LoRA | MIT (adaptador) / Apache-2.0 (base) | Hugging Face, código propio |
| Qwen3.5-4B (base) | 4B | no disponible | LLM generativo generalista | Apache-2.0 | Hugging Face |
| JEV 1.13 (archivado) | no disponible | no disponible | Choice scoring médico, interfaz nativa multi-pregunta | no disponible | Referencia en la evaluación del autor |

La comparación con JEV 1.13 es la más directa: sobre el subconjunto común de 1.313 preguntas, JEV 1.13 obtiene 74,26 % frente al 73,65 % de esta versión, diferencia dentro del intervalo de confianza. El autor advierte que JEV 1.13 se ejecutó mediante un wrapper programático distinto y que el resultado no representa una comparación con la versión más reciente de JEV.

## Limitaciones y advertencias

- Modelo de investigación: no está validado clínicamente y no puede sustituir el juicio de un profesional sanitario.
- Las etiquetas de entrenamiento no fueron revisadas una a una por expertos clínicos y las probabilidades no están calibradas.
- La precisión dada una lista de opciones no implica capacidad de respuesta abierta, entrevista clínica multi-turno ni eficacia clínica real.
- No genera explicaciones ni cadenas de pensamiento, lo que limita su auditabilidad directa en entornos regulados.
- Cobertura limitada: no soporta más de 26 candidatos ni prompts de más de 1.536 tokens; falla explícitamente en esos casos.
- Idiomas restringidos a chino e inglés; sin soporte declarado de castellano.
- Riesgo de alucinación mitigado por el formato de elección cerrada, pero no eliminado: la selección puede ser incorrecta con alta confianza en casos ambiguos.
- Diferencias numéricas entre la ruta de referencia en PyTorch y la ruta optimizada con kernels FLA/causal-conv1d pueden alterar predicciones casi empatadas.
- El autor no ha evaluado el conjunto de test sellado de 1.620 preguntas; no puede descartarse solapamiento semántico con el conjunto de entrenamiento ni exposición en el preentrenamiento del base.
- Licencia MIT para código y adaptador, pero el uso del base queda sujeto a Apache-2.0; el corpus de entrenamiento no se distribuye y su uso depende de las condiciones de las fuentes originales.
- No hay integración con proveedores de inferencia de Hugging Face ni con APIs de chat estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneYao/medical-jev-qwen3.5-4b-v1
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Código de entrenamiento y evaluación: https://github.com/JuneYaooo/medical-jev-training
- Benchmark de evaluación: https://github.com/JuneYaooo/jev-healthcare-lab
