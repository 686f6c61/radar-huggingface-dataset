# JuneYao/medical-jev-4b

## Resumen

Medical JEV v1 es un adaptador LoRA de puntuación de opciones (choice scoring) construido sobre el modelo base Qwen3.5-4B. Lo desarrolla el usuario JuneYao y está pensado para un problema muy concreto: dado un enunciado clínico, un conjunto de reglas de decisión y una lista de opciones candidatas, el modelo devuelve en una única pasada forward la clave semántica de la opción seleccionada junto con sus probabilidades. No genera explicaciones ni cadenas de pensamiento; es un clasificador de opciones, no un modelo conversacional.

El adaptador entrena las 32 capas del transformer con rango 16 y alpha 32, acumulando 32.464.896 parámetros entrenables sobre los aproximadamente 4.000 millones del modelo base. La longitud máxima de prompt es de 1.536 tokens y admite entre 2 y 26 opciones candidatas por pregunta. Está etiquetado como modelo de investigación en dominio médico y el autor advierte explícitamente de que no es un sistema clínico validado.

Su relevancia actual reside en la evaluación externa publicada: sobre 1.514 preguntas médicas, mejora al Qwen3.5-4B sin adaptar en 7,60 puntos porcentuales (de 56,27% a 63,87%), aunque no supera a la versión archivada de JEV 1.13. Es un ejemplo de adaptación paramétrica eficiente para tareas de decisión estructurada, con un paquete de inferencia propio que no sigue el formato PEFT estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptador LoRA de puntuación de opciones |
| Parámetros totales | Aproximadamente 4.000 millones (modelo base) + 32.464.896 entrenables en el adaptador |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.536 tokens de prompt completo (entrada); no se especifica ventana de generación |
| Tipos de cuantización | No disponible (la inferencia validada usa FP16; CPU en FP32) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT para código y adaptador; Apache-2.0 para el modelo base |
| Formato de pesos | `adapter.safetensors` (formato propietario `jev-lora-v1`, no PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. El LoRA cubre las 32 capas del modelo con rango 16 y alpha 32, y se entrena con 44.847 muestras durante 2 épocas, seleccionando el step 5.500 según el conjunto de desarrollo. El autor indica que esta versión no emplea etiquetas blandas de profesor ni RSI (probablemente *rejection sampling iteration* o refuerzo con señal implícita, aunque el término no se desarrolla en la model card).

La innovación principal no está en la arquitectura, sino en el paradigma de inferencia: en lugar de generar texto libre, el modelo puntúa cada opción candidata en una sola pasada forward y devuelve la clave semántica ganadora con sus probabilidades. El paquete incluye un cargador propio (`ChoicePredictor`) que descarga y verifica el modelo base por SHA-256, fija el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y expone una API de predicción por lotes. El formato `jev-lora-v1` no es compatible con PEFT ni con checkpoints de chat estándar, lo que obliga a usar el código adjunto. La inferencia validada se ejecutó en Linux con Python 3.12, CUDA 12.8, PyTorch 2.8.0 y Transformers 5.19.0 sobre una RTX 5090 de 32 GB en FP16 con SDPA; la ruta de CPU en FP32 no tiene validación de rendimiento completa.

## Capacidades

- Puntuación de opciones múltiples en una sola pasada: devuelve la clave de la opción elegida y un vector de probabilidades sobre las candidatas.
- Decisión clínica estructurada a partir de un enunciado, reglas y criterios explícitos (por ejemplo, comparar un valor con un umbral).
- Manejo de entre 2 y 26 opciones candidatas por pregunta.
- Rechazo controlado de entradas fuera de rango: si el prompt supera 1.536 tokens o el número de opciones no es válido, devuelve `status: unsupported` con el motivo, sin truncar ni eliminar opciones silenciosamente.
- Procesamiento por lotes configurable (`--batch-size`, por defecto 8) para ajustar el uso de memoria.
- Soporte bilingüe chino-inglés en los enunciados y opciones.
- No soporta generación de texto libre, explicaciones, cadena de pensamiento, tool calling ni razonamiento multi-paso. No es un modelo de chat.

## Casos de uso

- Triaje automatizado sobre protocolos cerrados: el modelo recibe el estado del paciente y las reglas de clasificación, y devuelve la categoría de triaje con su probabilidad; encaja porque la tarea es de elección entre opciones predefinidas y el autor reporta 40/100 en cobertura de triaje dentro del conjunto externo.
- Verificación de criterios diagnósticos estructurados: dado un conjunto de hallazgos y una lista de criterios (por ejemplo, criterios de clasificación de una enfermedad), el modelo puntúa qué criterio se cumple; útil en pipelines de codificación clínica donde se necesita una decisión auditable con probabilidad asociada.
- Enrutamiento de consultas médicas a especialidades: con una lista de especialidades como opciones, el modelo selecciona la más probable a partir del enunciado, lo que permite construir un clasificador de derivación sin generación de texto.
- Extracción de decisiones en formularios clínicos: para cuestionarios con respuestas cerradas (sí/no, categorías), el modelo devuelve la opción más probable y su confianza, integrándose en sistemas de captura de datos.
- Evaluación de sistemas de razonamiento médico: como componente de *readout* en pipelines de investigación que comparan modelos generativos, puntuando opciones sobre las que luego se mide acierto.
- Filtrado y priorización de casos en investigación clínica: clasificar casos según criterios de inclusión/exclusión expresados como opciones, con probabilidades para umbralizar la revisión manual.
- Docencia y simulación de exámenes tipo test: generar la respuesta seleccionada y la distribución de probabilidad sobre las opciones para analizar el comportamiento del modelo en preguntas de medicina.

## Benchmarks y rendimiento

Evaluación externa del 2 de noviembre de 2026 sobre 1.514 preguntas médicas, en vista única, con las opciones no soportadas contabilizadas como error:

| Sistema | Todas (1.514) | Comunes (1.313) |
|---|---:|---:|
| Qwen3.5-4B sin adaptar (readout) | 852 / 1.514 · 56,27% | 852 / 1.313 · 64,89% |
| **Medical JEV v1** | **967 / 1.514 · 63,87%** | **967 / 1.313 · 73,65%** |
| JEV 1.13 (archivado) | 1.073 / 1.514 · 70,87% | 975 / 1.313 · 74,26% |

La mejora sobre el modelo base es de +7,60 puntos en el total y +8,76 puntos en el subconjunto común (intervalo de confianza bootstrap del 95%: +5,85 a +11,79). Frente a JEV 1.13 la diferencia es de −0,61 puntos en el subconjunto común (IC 95%: −3,23 a +2,02), por lo que no se puede afirmar superioridad. Las 201 preguntas no soportadas incluyen 100 de diagnóstico con 49 candidatos, 100 de síndromes de medicina tradicional china con 148 candidatos y 1 que excede el límite de longitud. En la tarea de triaje cubierta, el modelo obtiene 40/100 frente a 66/100 de JEV. El conjunto de test sellado de 1.620 preguntas no se ha evaluado. El 83,81% del conjunto de desarrollo en cuatro vistas es una métrica de selección de modelo y no debe interpretarse como resultado externo.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 129.912.616 bytes (unos 124 MB); el modelo base en FP16 requiere aproximadamente 8 GB, y el autor indica que la descarga del base son unos 9,3 GB. En la práctica, con activaciones y el cargador, se necesita algo más de 8 GB.
- GPU validadas: RTX 5090 de 32 GB (entorno de referencia del autor). No se documentan otras GPU validadas.
- GPU consumer: cabe en tarjetas con 12 GB o más en FP16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en 8 GB el margen es ajustado y no está verificado. La ruta de CPU en FP32 funciona pero sin validación de rendimiento.
- Despliegue: no se soporta vLLM, TGI, llama.cpp ni Ollama en esta versión; el autor indica explícitamente que no hay interfaz de chat ni Inference Provider de Hugging Face y que debe usarse el `ChoicePredictor` incluido. Dependencias: PyTorch 2.8.0, huggingface-hub 1.33.0 y Transformers 5.19.0.
- Latencia y throughput: no disponibles. El autor señala que no hay evidencia de ventaja de velocidad entre plataformas y que los kernels optimizados (FLA y causal-conv1d) pueden producir diferencias numéricas leves frente a la ruta de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medical JEV v1 (este) | ~4B + 32,5M adaptador | 1.536 tokens | Choice scoring médico | MIT (adaptador) / Apache-2.0 (base) | Hugging Face, paquete propio |
| Qwen3.5-4B sin adaptar | ~4B | No disponible en la información | Generación general | Apache-2.0 | Hugging Face |
| JEV 1.13 (archivado) | No disponible | No disponible | Choice scoring médico | No disponible | No disponible |
| Modelos médicos basados en Qwen de 4B | No disponible | No disponible | Generación médica | Variable | No disponible |

La comparación directa más útil es con el propio Qwen3.5-4B sin adaptar, que sirve de línea base y sobre el que se mide la mejora. JEV 1.13 es la versión anterior del mismo proyecto y, según los datos publicados, supera a esta v1 en el total y en triaje. No se dispone de datos de otros modelos médicos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un sistema clínico validado: el autor lo declara modelo de investigación y advierte de que no sustituye el juicio profesional médico.
- Las etiquetas de entrenamiento no fueron revisadas por expertos clínicos y las probabilidades no están calibradas; la precisión con opciones dadas no implica buen rendimiento en pregunta abierta, consulta multi-turno ni práctica clínica real.
- No genera explicaciones ni cadena de pensamiento, lo que limita su auditabilidad directa en entornos regulados.
- Límite estricto de 1.536 tokens y de 26 opciones; las entradas que exceden devuelven `status: unsupported` en lugar de una respuesta parcial.
- Solo chino e inglés; no hay soporte documentado de otros idiomas.
- Riesgo de alucinación y de sesgo heredado del modelo base y del corpus de entrenamiento, no cuantificado en la model card.
- No supera a la versión anterior JEV 1.13 en la evaluación externa publicada; la diferencia en el subconjunto común no es estadísticamente concluyente.
- La evaluación externa no descarta duplicados semánticos ni exposición del modelo base durante el preentrenamiento; el conjunto de test sellado de 1.620 preguntas está pendiente.
- El formato `jev-lora-v1` no es PEFT: no se puede cargar con `PeftModel` ni con herramientas estándar, y obliga a usar el paquete de inferencia adjunto.
- Cambios de kernel, precisión o hardware pueden alterar predicciones cercanas al empate; no hay evidencia de ventaja de velocidad entre plataformas.
- Uso comercial: el adaptador y el código son MIT, pero el modelo base está sujeto a Apache-2.0 y los datos de entrenamiento no se distribuyen, con condiciones de uso de las fuentes upstream que deben revisarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneYao/medical-jev-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de entrenamiento y evaluación: https://github.com/JuneYaooo/medical-jev-training
- Benchmark de evaluación: https://github.com/JuneYaooo/jev-healthcare-lab
