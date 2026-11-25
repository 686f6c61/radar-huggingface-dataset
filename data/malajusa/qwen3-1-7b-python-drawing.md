# Malajusa/qwen3-1.7b-python-drawing

## Resumen

Qwen3-1.7B Python Drawing es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario Malajusa y publicado en Hugging Face. Su propósito es especializar un modelo de lenguaje pequeño en la generación de código Python orientado a dibujo y visualización: gráficos con matplotlib, dibujos con Turtle y PIL, marcado SVG, así como la explicación y corrección de código de plotting existente.

El modelo resuelve un nicho concreto: convertir instrucciones en lenguaje natural en código de dibujo ejecutable y autocontenido, una tarea donde los modelos generalistas de tamaño pequeño suelen producir código incompleto o no ejecutable. Al partir de Qwen3-1.7B, conserva la arquitectura transformer densa y la ventana de contexto del modelo original, pero concentra su capacidad en un dominio muy específico mediante 51.496 filas de entrenamiento.

Es relevante ahora porque demuestra el patrón de especialización vertical sobre modelos pequeños: con una sola GPU A100 80 GB y menos de dos horas de entrenamiento se obtiene un modelo de 1.720 millones de parámetros que cabe en hardware de consumo y que puede desplegarse como asistente de generación de código gráfico. La licencia Apache 2.0 facilita su uso comercial y su integración en herramientas de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) del transformer denso Qwen3-1.7B. El entrenamiento utilizó el formato conversacional prompt-completion de TRL con pérdida calculada únicamente sobre la completion (completion-only loss), con todos los parámetros entrenables. La configuración clave: longitud máxima de secuencia de 2.048 tokens, batch por dispositivo de 8, acumulación de gradiente de 2 (batch efectivo de 16), learning rate de 1e-5 con schedule coseno, 100 pasos de warmup, una época y precisión BF16. Se completaron 3.219 pasos de optimizador en aproximadamente 1 hora y 54 minutos sobre una única A100 80 GB, con un pico de memoria de 66,85 GiB asignados y 76,24 GiB reservados.

El dataset de entrenamiento, Malajusa/qwen3-1.7b-python-drawing-sft, contiene 51.496 filas de entrenamiento y 300 filas de validación reservadas. La pérdida de evaluación final fue de 0,19746 sobre un subconjunto fijo de 32 filas, con una precisión media de token de 0,94190 en ese mismo subconjunto. El stack de entrenamiento incluyó TRL 1.18.2, Transformers 5.24.1, PyTorch 2.15.0, Datasets 5.2.0, Accelerate 1.16.0 y Trackio 0.45.1 para el seguimiento de experimentos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de código Python para gráficos con matplotlib (diagramas de líneas, barras, etc.).
- Generación de dibujos con Turtle (espirales, polígonos, formas geométricas).
- Generación de dibujos con PIL (composición de imágenes, barras, formas).
- Generación de marcado SVG limpio y estructurado.
- Explicación y corrección de código de plotting existente.
- Producción de código completo y autocontenido cuando se le solicita.
- Formato conversacional con soporte de mensajes de sistema y plantilla de chat de Qwen3.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Generación determinista con `do_sample=False` para casos de uso reproducibles.

## Casos de uso

- Asistente de generación de gráficos en notebooks: el modelo convierte una descripción en lenguaje natural en código matplotlib ejecutable, adecuado para analistas que quieren prototipar visualizaciones sin escribir código desde cero.
- Generación de ilustraciones vectoriales en pipelines de documentación: produce SVG autocontenido que puede insertarse directamente en informes o webs, con la salvedad de revisar la corrección semántica de SVGs complejos.
- Herramienta educativa de programación gráfica: explica y corrige código de plotting, útil en entornos de aprendizaje donde el alumno pega su código y recibe una versión funcional.
- Automatización de assets gráficos simples: genera código PIL o Turtle para producir imágenes de barras, formas o patrones dentro de scripts de build, con revisión previa del código generado.
- Integración en asistentes de IDE o chat de desarrollo: al ser un modelo de 1.720 millones de parámetros, puede servirse en local o en una GPU modesta para autocompletar y generar snippets de dibujo bajo demanda.
- Prototipado rápido de visualizaciones en entornos con recursos limitados: su tamaño permite desplegarlo en una sola GPU de consumo, lo que lo hace viable para equipos que no disponen de clústeres de inferencia.
- Generación de tarjetas y diagramas para presentaciones: produce código de plotting y SVG para títulos o esquemas, aunque las composiciones largas pueden requerir presupuestos de generación superiores a 1.024 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta métricas de entrenamiento y una comprobación cualitativa de sanidad:

| Metrica | Valor |
|---|---|
| Pérdida de evaluación final (32 filas fijas) | 0,19746 |
| Precisión media de token en evaluación | 0,94190 |
| Filas de entrenamiento | 51.496 |
| Filas de validación reservadas | 300 |
| Pasos de optimizador | 3.219 |
| Épocas | 1 |
| Tiempo de entrenamiento | ~1 h 54 min en una A100 80 GB |

En la comprobación de sanidad con diez generaciones deterministas, nueve terminaron normalmente con token de fin de turno y ocho produjeron renders no vacíos. El autor advierte explícitamente que se trata de una comprobación cualitativa pequeña, no de un benchmark exhaustivo de calidad de dibujo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según la longitud de generación.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, más overhead.
- GPU recomendadas: A100 80 GB para entrenamiento (configuración del autor); para inferencia bastan GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Cabe en GPU de consumo: sí, con holgura en modelos de 8 GB o más en BF16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta del repo), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados en la información disponible al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Malajusa/qwen3-1.7b-python-drawing | 1.720 M | no disponible | Dibujo Python, SVG, matplotlib, Turtle, PIL | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.720 M | no disponible en la información proporcionada | Propósito general, razonamiento, código | Apache 2.0 | Hugging Face |
| Modelos de código pequeños de propósito general | no disponible | no disponible | Código generalista, sin especialización en dibujo | variable | variable |

La comparación más directa es con el modelo base Qwen3-1.7B, del que hereda arquitectura y tamaño pero del que se diferencia por el ajuste fino en el dominio de dibujo. No se dispone de datos de benchmarks comparativos que permitan cuantificar la mejora frente al base en tareas de generación de código gráfico.

## Limitaciones y advertencias

- Puede producir código incompleto, no ejecutable o visualmente inexacto, especialmente en diagramas complejos y SVGs largos.
- Los archivos de datos externos y las dependencias de plotting deben ser proporcionados por quien invoca el modelo; el modelo no los genera.
- Un render exitoso no garantiza corrección semántica: en la comprobación de sanidad, un SVG complejo renderizó pero omitió flechas y elementos estructurales solicitados.
- Los SVGs largos o intrincados pueden superar el presupuesto de 1.024 tokens de generación y quedar incompletos; se recomienda aumentar `max_new_tokens`.
- El autor recomienda revisar el código generado antes de ejecutarlo y evaluar con prompts representativos antes de usarlo en producción.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible; los idiomas soportados no están declarados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B conserva sus propios términos, que deben verificarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Malajusa/qwen3-1.7b-python-drawing
- Dataset de entrenamiento: https://huggingface.co/datasets/Malajusa/qwen3-1.7b-python-drawing-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dashboard de entrenamiento (Trackio): https://Malajusa-qwen3-python-drawing-sft-trackio.hf.space?project=qwen3-python-drawing-sft&runs=Malajusa-1795610881&sidebar=collapsed
- Script de entrenamiento: train_sft_a100.py (incluido en el repositorio del modelo)
- Comprobación de sanidad (contact sheet): sanity/contact_sheet.png (incluido en el repositorio del modelo)
- Resultados de sanidad por muestra: sanity/results.jsonl (incluido en el repositorio del modelo)
- Script de sanidad: sanity/sanity_check_drawing.py (incluido en el repositorio del modelo)
