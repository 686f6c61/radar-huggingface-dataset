# nace-ai/kapitsa-9b

## Resumen

Kapitsa 9B es un artefacto de publicación en Hugging Face que empaqueta el modelo Qwen3.5-9B en cuantización MLX de 4 bits (9,0 GB) para su ejecución local en Apple Silicon mediante Kapitsa, un motor de inferencia desarrollado por nace.ai. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos propios: el repositorio actúa como punto de distribución del peso base `lmstudio-community/Qwen3.5-9B-MLX-4bit`, y su valor diferencial reside en el motor que lo sirve y en los datos de rendimiento publicados para distintos chips de Apple.

El modelo subyacente es un transformer denso de 9.000 millones de parámetros, cuantizado a 4 bits, orientado a generación de texto y pensado para flujos de trabajo con agentes de código. Kapitsa expone APIs compatibles con OpenAI y Anthropic, lo que permite conectar herramientas como opencode, Claude Code, Codex o pi a un modelo que corre íntegramente en local, sin depender de servicios en la nube.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 9B en 4 bits cabe y rinde con holgura en equipos de consumo con memoria unificada (16 GB en adelante); por otro, la licencia Apache 2.0 y el formato MLX lo convierten en una opción práctica para prototipado y despliegue en estaciones de trabajo Mac. La información publicada por el autor es, sin embargo, muy escasa: no hay detalles sobre el entrenamiento del modelo base, idiomas soportados ni resultados de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según model card) |
| Parametros totales | 9B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (MLX, 9,0 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX 4-bit (pesos base en `lmstudio-community/Qwen3.5-9B-MLX-4bit`); GGUF y safetensors no disponibles en este repositorio |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer denso de 9B parámetros cuantizado a 4 bits. No se aporta información sobre el número de capas, dimensión oculta, cabezas de atención, vocabulario ni mecanismos de atención específicos. Tampoco se detalla el proceso de entrenamiento del modelo base Qwen3.5-9B: no hay datos sobre volumen de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación.

La innovación técnica asociada a esta publicación no está en el modelo, sino en el motor Kapitsa: un runtime para Apple Silicon optimizado para decodificación rápida, con servidores compatibles con las APIs de OpenAI y Anthropic y soporte para arrancar agentes de código sobre el modelo local. El repositorio de Hugging Face funciona como envoltorio de distribución del peso MLX ya cuantizado por lmstudio-community.

## Capacidades

- Generación de texto autoregresiva en local sobre Apple Silicon.
- Ejecución como backend de agentes de código: el motor Kapitsa permite lanzar opencode, Claude Code, Codex o pi apuntando al modelo local.
- Servido mediante APIs compatibles con OpenAI y Anthropic, lo que facilita la integración con clientes existentes.
- Ejecución offline: no requiere conexión a servicios externos una vez descargados los pesos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, modo thinking, visión o audio: no disponibles en la información proporcionada para este artefacto.

## Casos de uso

- Asistencia de código en local: el modelo se sirve con `kapitsa serve --model 9b` y se conecta a Claude Code u opencode, de modo que el desarrollador obtiene sugerencias y ediciones sin enviar código a la nube. Es adecuado por su tamaño contenido y su encaje en 16 GB de memoria unificada.
- Prototipado de agentes con API compatible: al exponer endpoints compatibles con OpenAI y Anthropic, se pueden reutilizar SDK y frameworks existentes cambiando únicamente la URL base, lo que acelera la validación de flujos multi-paso.
- Desarrollo en entornos con restricciones de confidencialidad: sectores como banca, salud o defensa pueden ejecutar generación de texto sobre datos sensibles en un portátil Mac sin salida de red.
- Evaluación comparativa de motores de inferencia: los datos de prefill y decode publicados (381/77 tok/s en M3 Pro 36 GB; 217/57 tok/s en M1 Pro 16 GB) permiten usar el modelo como referencia para medir el rendimiento de otros runtimes en Apple Silicon.
- Generación de documentación técnica y resúmenes: un modelo denso de 9B es suficiente para tareas de redacción y síntesis sobre documentos de extensión moderada, siempre que se valide la longitud de contexto real del modelo base.
- Automatización de tareas de refactorización asistida: integrado en scripts que invocan la API local, puede aplicarse a renombrado, generación de tests o explicación de fragmentos de código dentro de un pipeline de CI en una máquina de desarrollo.
- Educación y experimentación: sirve como banco de pruebas para estudiar cuantización 4-bit y motores MLX sin coste de infraestructura cloud.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de velocidad del motor Kapitsa sobre este peso:

| Equipo | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M3 Pro 36 GB | 381 | 77 |
| M1 Pro 16 GB | 217 | 57 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio GitHub del motor afirma tener la decodificación más rápida en 33 de 38 combinaciones de modelo y Mac evaluadas, pero no se aportan aquí las tablas completas ni la metodología.

## Requisitos de hardware

- VRAM/memoria unificada: el peso 4-bit ocupa 9,0 GB; se recomienda un mínimo de 16 GB de memoria unificada para dejar margen al sistema y al contexto.
- Equipos validados por el autor: MacBook Pro con M1 Pro y 16 GB (217 tok/s prefill, 57 tok/s decode) y con M3 Pro y 36 GB (381 tok/s prefill, 77 tok/s decode).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este artefacto, que está empaquetado en formato MLX para Apple Silicon. Para esas GPUs habría que recurrir al peso base en otro formato.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Apple Silicon de gama portátil con 16 GB o más; no aplica a GPUs discretas con este formato.
- Opciones de despliegue: motor Kapitsa (`kapitsa serve --model 9b`), que expone APIs compatibles con OpenAI y Anthropic. vLLM, llama.cpp, Ollama y TGI no están indicados para este artefacto MLX concreto.
- Latencia y throughput: según los datos del autor, 57-77 tok/s de decodificación en los equipos probados, suficiente para uso interactivo con agentes de código.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kapitsa 9B (este artefacto) | 9B denso, 4-bit | No disponible | MLX 4-bit | Apache 2.0 | Hugging Face, motor Kapitsa |
| Qwen3.5-9B-MLX-4bit (base) | 9B denso, 4-bit | No disponible | MLX 4-bit | No disponible en la información | Hugging Face (lmstudio-community) |
| Qwen (familia, vía Kapitsa) | Distintos tamaños | No disponible | MLX | No disponible | Motor Kapitsa |
| Nemotron (vía Kapitsa) | Distintos tamaños | No disponible | MLX | No disponible | Motor Kapitsa |

No se dispone de datos de benchmarks de calidad ni de especificaciones de contexto que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información publicada es mínima: no hay datos de entrenamiento, idiomas, contexto ni evaluación de calidad, lo que impide garantizar su comportamiento en producción.
- Al ser una cuantización 4-bit, es previsible cierta degradación respecto al modelo en precisión completa, especialmente en razonamiento matemático y generación de código; no se han publicado mediciones de esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin benchmarks ni documentación de alineación no puede acotarse su magnitud.
- Limitación de plataforma: el formato MLX restringe el uso a Apple Silicon; no es desplegable en GPUs NVIDIA ni en CPUs x86 sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-08): no hay evidencia de uso en comunidad ni de mantenimiento continuado.
- La licencia Apache 2.0 permite uso comercial, pero se hereda cualquier restricción del modelo base Qwen3.5-9B, cuyos términos no se detallan en la información disponible.
- Los datos de velocidad provienen del autor del motor y no han sido verificados de forma independiente en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/kapitsa-9b
- Pesos base: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Repositorio del motor: https://github.com/nace-ai/kapitsa
- Rama principal del repositorio: https://github.com/nace-ai/kapitsa/tree/main
