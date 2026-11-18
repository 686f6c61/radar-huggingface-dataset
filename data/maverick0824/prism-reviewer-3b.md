# Maverick0824/prism-reviewer-3b

## Resumen

PRism reviewer 3B es un ajuste fino supervisado del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario Maverick0824, orientado a una tarea muy concreta: generar un único comentario de revisión de código a partir de un hunk de diff. Forma parte del proyecto PRism, un revisor de repositorios que delega la verificaci��n de cada comentario en Claude antes de publicarlo. El modelo no pretende sustituir a un revisor generalista, sino actuar como primera pasada barata y local dentro de un pipeline mayor.

Técnicamente es un transformer decoder-only de 3.085.938.688 parámetros (unos 3,09 mil millones), entrenado mediante QLoRA sobre una base cuantizada en 4 bits NF4 con un adaptador de 29,9 millones de parámetros entrenables (0,96 % del total). La longitud de contexto de entrenamiento fue de 1.024 tokens y el modelo se sirve con decodificación greedy y un máximo de 128 tokens nuevos, lo que refleja su alcance deliberadamente acotado: un hunk, un comentario, salida JSON.

Su relevancia es doble. Por un lado, ejemplifica el patrón de especialización extrema de modelos pequeños para tareas de ingeniería de software con requisitos de latencia y coste bajos. Por otro, sus propios resultados publicados son honestos sobre los límites: la mejora frente al modelo base en BLEU-4 y ROUGE-L es marginal, y un juez ciego no distingue sus comentarios de los del base en utilidad. La licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-3B-Instruct), ajuste fino con LoRA/QLoRA |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE); adaptador LoRA con 29,9 M de parametros entrenables (0,96 %) |
| Longitud de contexto | 1.024 tokens (longitud maxima de entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (1,93 GB) publicado; base de entrenamiento en 4-bit NF4; adaptador en 16 bits |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Qwen Research License (qwen-research), uso no comercial unicamente |
| Formato de pesos | safetensors, GGUF, adaptador PEFT (LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de la familia Qwen2.5, cargado durante el entrenamiento como `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`. Sobre esa base cuantizada en 4 bits NF4 se aplicó un adaptador LoRA de rango 16 y alpha 16, sin dropout, con módulos objetivo en las proyecciones q, k, v, o, gate, up y down. El entrenamiento usó batch efectivo de 16 (8 × 2 de acumulación), learning rate 2e-4 con schedule coseno y 3 % de warmup, weight decay 0,01, una única época y 2.499 pasos. La pérdida se calculó solo sobre la respuesta. Se ejecutó en una Tesla T4 en Kaggle durante 214 minutos con semilla 13, usando Python 3.13.16, torch 2.11.0+cu130, transformers 5.17.0 y Unsloth 2026.11.4 (commit 833cbad, 13 de noviembre de 2026).

Los datos provienen del dataset CodeReviewer de generación de comentarios (registro Zenodo 6900648, CC BY 4.0). De 117.739 filas leídas se conservaron 95.284 y se muestrearon 40.000; los descartes incluyen 10.937 comentarios vagos, 7.572 duplicados, 3.354 salidas de linters o bots, 320 textos repetidos, 226 comentarios de más de 120 palabras, 26 hunks demasiado largos y 20 comentarios no ingleses. El entrenador descartó además 21 ejemplos de más de 1.024 tokens, quedando 39.979 ejemplos efectivos. La validación usó 500 ejemplos muestreados de 8.951 conservados y el test 500 filas del split oficial, sin más filtrado que longitud y duplicados. La pérdida de validación descendió de 2,244 en el paso 250 a 2,202 en el paso 2.000 y se mantuvo plana hasta 2.499; la pérdida final de entrenamiento fue 2,220.

## Capacidades

- Generación de un comentario de revisión de código en formato JSON estricto (`{"comment": "..."}`) a partir de un único hunk de diff.
- Detección de patrones de estilo y posibles errores en el fragmento visible: renombrados, eliminaciones, campos ausentes y comparaciones de límites.
- Salida estructurada con alta fiabilidad de parseo: 99,8 % de JSON válido en el conjunto de test.
- Respuestas concisas: media de 12,0 palabras por comentario, frente a 16,2 del modelo base.
- Compatibilidad con endpoints y despliegue en Ollama mediante el `Modelfile` incluido (plantilla de chat, system prompt y decodificación greedy).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; la información disponible no menciona ninguna de estas capacidades.
- Capacidad multilingüe limitada al inglés; los comentarios no ingleses fueron descartados del entrenamiento.

## Casos de uso

- Revisión automatizada de pull requests en CI: el modelo procesa cada hunk del diff y emite un comentario JSON que un verificador posterior (Claude en el diseño de PRism) contrasta con el código antes de publicarlo. Es adecuado por su bajo coste y su alta tasa de JSON válido.
- Primera pasada de triaje en repositorios grandes: permite descartar hunks triviales o señalar los que merecen revisión humana, ejecutándose en CPU a unas 20–46 revisiones por minuto según concurrencia.
- Asistencia local sin conexión: al caber en 1,93 GB en GGUF Q4_K_M, puede desplegarse en portátiles y estaciones de trabajo sin GPU dedicada mediante Ollama o llama.cpp, útil en entornos con restricciones de privacidad.
- Generación de borradores de comentarios para revisores humanos: el revisor recibe una propuesta breve que puede editar, reduciendo el tiempo de redacción en revisiones de estilo y cambios de límites.
- Integración en pipelines de formación o auditoría de código: sirve para anotar automáticamente diffs históricos y construir datasets de revisión etiquetados, siempre que se respete la licencia no comercial.
- Evaluación comparativa de modelos de revisión de código: su conjunto de test de 500 hunks y sus métricas publicadas (BLEU-4, ROUGE-L, validez JSON, juez ciego) permiten usarlo como línea base reproducible en experimentos de investigación.
- Prototipado de herramientas de revisión asistida: el adaptador LoRA y el `Modelfile` facilitan experimentar con plantillas de chat y prompts de sistema sin reentrenar.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 500 hunks de test:

| Metrica | Modelo base | PRism reviewer 3B |
|---|---|---|
| BLEU-4 | 5,36 | 5,56 |
| ROUGE-L | 13,20 | 14,21 |
| JSON valido | 98,8 % | 99,8 % |
| Palabras medias por comentario | 16,2 | 12,0 |
| Juez ciego (Claude Sonnet, 500 pares), porcentaje de pares decididos ganados | — | 48,6 % (IC 95 %: 43,2–54,0) |

Rendimiento en CPU (Core Ultra 7 155H, Ollama, 4 slots): aproximadamente 20 hunks por minuto en serie y entre 34 y 46 por minuto con 4 peticiones en vuelo. El autor advierte que las mediciones en ese portátil varían hasta un factor de dos entre sesiones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 2 GB para la versión GGUF Q4_K_M; el adaptador LoRA en 16 bits sobre el base en 4 bits requiere aproximadamente 2,5–3 GB durante la inferencia en Transformers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo cuantizado; el autor entrenó en una Tesla T4. Para despliegue a mayor escala, A100 o H100 no son necesarias dado el tamaño, pero permitirían mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también funciona en CPU.
- Opciones de despliegue: Ollama (soporte oficial mediante el `Modelfile` incluido), llama.cpp con el GGUF, Transformers con PEFT para el adaptador. vLLM y TGI no están documentados en la información proporcionada.
- Latencia y throughput: en CPU, unas 20 revisiones por minuto en serie y 34–46 con 4 en vuelo; no se han publicado cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRism reviewer 3B | 3,09 B | 1.024 tokens (entrenamiento) | Revisión de código, un hunk por salida | Qwen Research (no comercial) | Hugging Face (safetensors, GGUF, LoRA) |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | Contexto nativo no disponible en la información proporcionada | Modelo generalista de código | Qwen Research / Apache 2.0 según variante (no confirmado) | Hugging Face |
| CodeReviewer (Microsoft) | No disponible | No disponible | Generación de comentarios de revisión | No disponible | Investigación |

La comparación directa con alternativas especializadas en revisión de código no está disponible en la información proporcionada. Frente a su propio modelo base, la mejora medida es marginal en BLEU-4 (+0,20) y ROUGE-L (+1,01), y el juez ciego no encuentra diferencia significativa en utilidad.

## Limitaciones y advertencias

- No conoce más sobre errores que el modelo base: el ajuste fino cambió la forma de redactar los comentarios, no su capacidad de detección.
- Tono de certeza injustificada: sugiere renombrados, eliminaciones y campos ausentes con voz de revisor, a menudo sobre código que no puede ver. El verificador externo está pensado para filtrar estos casos.
- Homogeneidad estilística: el 89 % de los comentarios empiezan por "I think" y solo el 1 % formula preguntas, frente al 3 % y 43 % de revisores humanos; el autor lo atribuye a la decodificación greedy.
- Visión limitada a un único hunk: se entrenó y se sirve sin contexto del repositorio, por lo que no puede evaluar interacciones entre archivos.
- Las métricas corresponden a la versión entrenada en Kaggle, no al GGUF Q4_K_M servido, que genera texto distinto para el mismo hunk (0 de 20 idénticos, aunque los 20 con JSON válido) y no fue evaluado por separado.
- Sesgo de datos: las etiquetas provienen de comentarios de revisores en proyectos de código abierto de 2022 o anteriores, e incluyen observaciones sobre hábitos del proyecto y código fuera del hunk.
- Licencia Qwen Research: uso exclusivamente no comercial; cualquier despliegue en producción comercial requiere autorización adicional del titular de la licencia.
- Idioma: solo inglés; los comentarios no ingleses fueron eliminados del entrenamiento, por lo que la calidad en otros idiomas no está garantizada.
- Riesgo de alucinación en las sugerencias, mitigado en el diseño de PRism por la verificación posterior con Claude, pero no resuelto en el modelo por sí mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maverick0824/prism-reviewer-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio del proyecto PRism: https://github.com/ManvGit17/prism
- Dataset CodeReviewer (Zenodo, registro 6900648): https://zenodo.org/record/6900648
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
