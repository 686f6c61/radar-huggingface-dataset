# AadarshKr/qwen2.5-1.5b-ade-lora

## Resumen

El modelo `AadarshKr/qwen2.5-1.5b-ade-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario AadarshKr. Su propósito es especializar un modelo pequeño de lenguaje en la extracción de eventos adversos a medicamentos (ADE, por sus siglas en inglés) a partir de frases de informes de casos clínicos, devolviendo la información estructurada en JSON con pares (fármaco, efecto). El adaptador se ha entrenado sobre el corpus ADE Corpus V2, un conjunto de referencia en farmacovigilancia.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parámetros con una ventana de contexto de 32.768 tokens y licencia Apache 2.0. El adaptador añade 18,5 millones de parámetros entrenables (1,18 % del total) mediante LoRA con rango 16 sobre las proyecciones de atención y MLP.

La relevancia de esta ficha radica en que demuestra cómo un adaptador ligero y de bajo coste (entrenado en una única T4 de Kaggle en unos 54 minutos) puede mejorar drásticamente una tarea de extracción de información clínica: el F1 de detección de ADE pasa de 0,54 a 0,90 y el F1 de pares exactos de 0,26 a 0,70, manteniendo una tasa de JSON válido del 100 %. No obstante, el autor lo declara explícitamente como uso de investigación o demostración, no para decisiones clínicas ni regulatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA/QLoRA sobre proyecciones de atención y MLP |
| Parametros totales | 1.500 millones (modelo base) + 18,5 millones entrenables en el adaptador (1,18 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Base en 4-bit NF4 durante el entrenamiento (QLoRA); el adaptador se distribuye en safetensors (fp16/bf16 según carga) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y RoPE. La especialización se realiza mediante QLoRA: los pesos del modelo base se congelan en cuantización 4-bit NF4 y se entrenan adaptadores LoRA de rango r=16, alpha=32 y dropout 0,05 sobre las proyecciones de atención y de las capas MLP. El resultado son 18,5 millones de parámetros entrenables, un 1,18 % del total.

Los datos provienen de ADE Corpus V2, deduplicado a una única frase por registro (20.896 frases), con una partición estratificada sin fuga de datos: 19.396 para entrenamiento, 500 para validación y 1.000 para test. El entrenamiento consistió en una época, batch efectivo de 16, learning rate 2e-4 con schedule coseno, pérdida solo sobre la completion (completion-only loss) y precisión fp16 en una única GPU T4 de Kaggle durante aproximadamente 54 minutos. No se realizó búsqueda de hiperparámetros ni múltiples ejecuciones.

La innovación técnica principal no está en la arquitectura sino en el enfoque: convertir una tarea de extracción de relaciones clínicas en una tarea de generación estructurada JSON, forzando al modelo a emitir un objeto con `has_ade` y la lista de pares (fármaco, efecto). El uso de completion-only loss evita que el modelo aprenda a reproducir el prompt y concentra el aprendizaje en la salida estructurada.

## Capacidades

- Clasificación binaria de frases clínicas: determina si una frase describe un evento adverso a un medicamento (`has_ade`).
- Extracción de pares (fármaco, efecto) en formato JSON estricto, con una tasa de JSON válido del 100 % en el conjunto de test.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct (aunque el adaptador está especializado en la tarea ADE).
- Razonamiento de un solo paso sobre frases de informes de casos; no está diseñado para razonamiento multi-paso ni para agentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador (el modelo base Qwen2.5-Instruct sí lo soporta, pero el adaptador no se ha entrenado para ello).
- Capacidades multilingües: solo inglés; el corpus de entrenamiento y la model card declaran `en`.
- Capacidad especial: salida estructurada JSON con esquema fijo (`has_ade`, `pairs`), pensada para integración en pipelines de extracción de información.

## Casos de uso

- Farmacovigilancia automatizada: procesar frases extraídas de informes de casos clínicos y obtener pares (fármaco, efecto) en JSON para su revisión por farmacéuticos. El modelo es adecuado porque su F1 de detección de ADE es 0,90 y su precisión 0,93, lo que reduce falsos positivos en el triaje.
- Enriquecimiento de bases de datos de seguridad de medicamentos: ingerir literatura biomédica o resúmenes de casos y poblar tablas estructuradas de eventos adversos con un pipeline que llame al adaptador por frase y valide el JSON de salida.
- Preprocesado para sistemas de alerta temprana: clasificar frases de informes regulatorios y marcar aquellas con `has_ade: true` para revisión humana prioritaria, aprovechando el recall de 0,88.
- Extracción de relaciones en investigación clínica: construir conjuntos de datos etiquetados a partir de corpus no anotados, usando el adaptador como anotador automático y midiendo la concordancia con anotadores humanos.
- Docencia y prototipado en NLP clínico: demostrar el flujo completo QLoRA + extracción estructurada en una GPU de consumo (T4), con un coste de entrenamiento inferior a una hora.
- Integración en pipelines de CI/CD de modelos clínicos: servir el adaptador con vLLM o TGI y ejecutar tests de regresión sobre el `eval_results.json` para detectar degradaciones en el F1 de pares.
- Filtrado de candidatos en revisión sistemática: reducir el volumen de frases que un revisor humano debe leer, manteniendo las que el modelo marca como ADE con alta precisión.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.000 frases de test reservadas, con el mismo prompt y decodificación greedy para el modelo base (adaptador desactivado) y el modelo fine-tuned.

| Métrica | Base | Fine-tuned |
|---|---|---|
| JSON válido | 99,7 % | 100 % |
| F1 de detección de ADE | 0,54 | 0,90 |
| Precisión / recall de ADE | 0,40 / 0,82 | 0,93 / 0,88 |
| F1 de pares (exact match estricto) | 0,26 | 0,70 |
| F1 de pares (lenient, solapamiento de span del efecto) | no disponible | 0,78 |

No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere aproximadamente 3 GB de pesos; con el adaptador en fp16, unos 3,1 GB. En cuantización 4-bit (GGUF/AWQ) puede bajar a unos 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A100 o H100 con vLLM.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en una T4 de Kaggle (el autor entrenó en una T4).
- Opciones de despliegue: transformers + PEFT (referencia del autor), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama si se convierte el adaptador a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento de una época sobre 19.396 ejemplos en una T4 tomó aproximadamente 54 minutos, lo que da una idea del coste de cómputo, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AadarshKr/qwen2.5-1.5b-ade-lora | 1,5 B + 18,5 M adaptador | 32.768 | Extracción de ADE en JSON | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | 32.768 | Generación de texto e instrucciones generales | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 | Generación de texto base | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros adaptadores especializados en ADE comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Errores frecuentes documentados por el autor: confusión entre asociación e indicación (fármaco y condición mencionados juntos sin relación causal), abreviaturas y diferencias en los límites del span del efecto.
- Riesgo de alucinación: aunque la tasa de JSON válido es del 100 %, el F1 de pares estricto es 0,70, por lo que aproximadamente un 30 % de los pares no coinciden exactamente con la anotación de referencia.
- Limitación de idioma: solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Limitación de alcance: entrenado sobre un único corpus (ADE Corpus V2) y una única ejecución, sin búsqueda de hiperparámetros; la generalización a otros dominios clínicos o estilos de redacción no está validada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que es para investigación y demostración, no para decisiones clínicas o regulatorias.
- Caveat para producción: requiere usar el mismo system prompt que en entrenamiento y decodificación greedy; desviarse de esta configuración puede degradar el formato JSON y las métricas.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso en el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/AadarshKr/qwen2.5-1.5b-ade-lora
- Repositorio GitHub con código, preparación de datos y write-up: https://github.com/AadarshKr-11/ade-llm-finetune
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de ejemplo de fine-tuning de Qwen2.5-1.5B con LoRA: https://github.com/mlahozy21/Fine-Tuning-Qwen2.5-with-LoRA
