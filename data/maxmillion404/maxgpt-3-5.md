# MaxMillion404/MaxGPT-3.5

## Resumen

MaxGPT-3.5 es un modelo de lenguaje de 252 millones de parámetros (235M según el autor, contando solo los pesos del transformer) desarrollado íntegramente desde cero por Maxwell Brohm, un estudiante de secundaria, en PyTorch sin pesos preentrenados ni la librería `transformers`. Se trata de un ajuste fino supervisado de tipo chat sobre MaxGPT-3, un transformer decoder de 16 bloques y anchura 1024 con una ventana de contexto de 1024 tokens. El objetivo declarado es que el modelo responda con el formato de un asistente (USER/ASSISTANT) en lugar de limitarse a imitar al usuario.

La relevancia de esta ficha no reside en su rendimiento absoluto, sino en su valor como artefacto educativo y de investigación reproducible: documenta el entrenamiento completo de una familia de modelos (MaxGPT-1, 2, 3 y 3.5) con código propio, curvas de pérdida y una evaluación cualitativa con anotadores independientes. El ajuste fino de chat se realizó durante aproximadamente una época sobre datos exclusivamente conversacionales, con 300.000 pasos a una tasa de aprendizaje de 5e-5, en unas 16 horas sobre una única RTX 5070.

El modelo no está pensado para producción: el propio autor advierte que, aunque el formato de respuesta es limpio y coherente con el tema, el contenido es a menudo incorrecto. Su licencia Apache 2.0 y su formato de pesos en safetensors permiten inspeccionarlo, modificarlo y reentrenarlo libremente, lo que lo convierte en una base didáctica para estudiar tokenización a nivel de byte, enmascaramiento de pérdida y ajuste fino conversacional en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo GPT), implementación propia en PyTorch |
| Parámetros totales | 252.135.424 (según safetensors); 235M según el autor para el transformer |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con código propio (`config.py`, `model.py`, `tokenizer.py`, `sample.py`, `run.py`) |

## Arquitectura y entrenamiento

MaxGPT-3.5 es un transformer decoder denso de 16 bloques con dimensión de modelo 1024 y contexto máximo de 1024 tokens, entrenado desde cero sin pesos preentrenados y sin usar la librería `transformers`. La tokenización opera a nivel de byte, lo que simplifica el vocabulario y permite aplicar el enmascaramiento de pérdida directamente sobre los bytes correspondientes a los turnos del asistente. El ajuste fino de chat se llevó a cabo sobre datos exclusivamente conversacionales durante aproximadamente una época: 300.000 pasos con tasa de aprendizaje 5e-5, completados en unas 16 horas sobre una RTX 5070.

La innovación técnica destacable es el enmascaramiento de pérdida a nivel de byte: la función de pérdida solo computa los tokens generados por el asistente, de modo que el modelo aprende a responder y no a reproducir los turnos del usuario. El entrenamiento terminó con una pérdida de entrenamiento de aproximadamente 1,87 y de validación de 1,95, con ambas curvas siguiéndose de cerca, lo que sugiere ausencia de sobreajuste severo en el régimen observado. No se documenta uso de RLHF, DPO ni decodificación especulativa; el muestreo por defecto es temperatura 0,8 con top-k 50 y 120 tokens generados.

## Capacidades

- Generación de texto conversacional en inglés con formato USER/ASSISTANT consistente.
- Respuesta de tipo asistente gracias al ajuste fino supervisado con enmascaramiento de pérdida.
- Resolución de referencias a lo largo de varios turnos: según la evaluación del autor, la tasa de resolución de referencias entre turnos pasó del 25 % al 92 % tras el ajuste fino.
- Coherencia temática superior a MaxGPT-3, manteniéndose en el tema con más frecuencia.
- Tokenización a nivel de byte, lo que evita problemas de vocabulario fuera de dominio a costa de secuencias más largas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés; no se reportan evaluaciones en otros idiomas.
- Inferencia en CUDA, Apple MPS o CPU mediante el script `run.py` incluido en el repositorio.

## Casos de uso

- Docencia y aprendizaje de entrenamiento desde cero: el repositorio incluye `config.py`, `model.py`, `tokenizer.py`, `sample.py` y `run.py`, lo que permite a estudiantes reproducir el pipeline completo de tokenización por byte, entrenamiento y ajuste fino conversacional en una sola GPU de consumo.
- Estudio del enmascaramiento de pérdida a nivel de byte: sirve como ejemplo mínimo y funcional de cómo separar los tokens del asistente de los del usuario para que el modelo aprenda a responder en lugar de imitar, un patrón reutilizable en proyectos de chat a pequeña escala.
- Investigación sobre resolución de referencias en diálogo: el autor reporta una mejora del 25 % al 92 % en la resolución de referencias entre turnos, lo que convierte al modelo en una línea base útil para estudiar memoria conversacional en arquitecturas pequeñas con contexto de 1024 tokens.
- Prototipado rápido de interfaces conversacionales en local: al ejecutarse en CPU, Apple MPS o CUDA con un único archivo safetensors de aproximadamente 1 GB, permite validar flujos de UI de chat sin depender de APIs externas ni de infraestructura de servidor.
- Generación de datos sintéticos de formato conversacional: su formato USER/ASSISTANT limpio y consistente permite usarlo como generador de plantillas de diálogo para aumentar datasets de ajuste fino de modelos mayores, siempre con revisión humana por su tasa de error factual.
- Experimentos de ablación sobre tamaño y contexto: al formar parte de una familia documentada (23M, 110M, 235M con contextos de 256, 512 y 1024), facilita comparar el efecto del escalado en la calidad conversacional dentro de un mismo código y dataset.
- Reproducción de bajo coste en hardware de consumo: las 16 horas de ajuste fino en una RTX 5070 documentadas por el autor sirven de referencia para planificar experimentos académicos con presupuesto limitado.

## Benchmarks y rendimiento

El autor reporta una evaluación cualitativa con varias muestras por prompt y anotadores independientes, no benchmarks estandarizados:

| Métrica | MaxGPT-3 | MaxGPT-3.5 |
|---|---|---|
| Resolución de referencias entre turnos | 25 % | 92 % |
| Calidad en un solo turno (sobre 5) | ~2,5 | ~2,3 |
| Pérdida de entrenamiento | No disponible | ~1,87 |
| Pérdida de validación | No disponible | ~1,95 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se reportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en precisión completa (fp32) para los 252M parámetros, más overhead de activaciones y contexto; en fp16/bf16 bajaría a unos 0,5 GB, aunque no se distribuyen pesos en esos formatos de forma oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor cita una RTX 5070 para el ajuste fino (16 horas), no para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el repositorio solo incluye scripts propios (`run.py`) basados en PyTorch y safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no usar `transformers` ni publicar GGUF, la integración con esos runners requeriría conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MaxGPT-3.5 | 252M | 1024 | Apache 2.0 | safetensors + código propio | Ajuste fino de chat sobre MaxGPT-3; sin benchmarks estándar |
| MaxGPT-3 | 235M | 1024 | Apache 2.0 (según familia) | safetensors + código propio | Base sin ajuste fino de chat; 25 % en resolución de referencias |
| MaxGPT-2 | 110M | 512 | Apache 2.0 (según familia) | safetensors + código propio | Aprende el formato USER/ASSISTANT |
| MaxGPT-1 | 23M | 256 | Apache 2.0 (según familia) | safetensors + código propio | Inglés coherente emergente |

No se dispone en la información proporcionada de comparaciones con modelos de terceros del mismo tamaño (por ejemplo, GPT-2 small, Pythia-160M o SmolLM) en términos de benchmarks, por lo que la comparativa se limita a la propia familia MaxGPT.

## Limitaciones y advertencias

- Calidad factual baja: el propio autor advierte que el contenido es a menudo incorrecto; es un modelo de 235M entrenado desde cero con datos no especificados.
- Incapacidad de recordar nombres mencionados anteriormente en la conversación, tanto en MaxGPT-3 como en MaxGPT-3.5; el autor lo señala como el problema que estudia su línea de investigación MaxGPT-Planck.
- Ligero descenso en calidad de un solo turno tras el ajuste fino (de ~2,5 a ~2,3 sobre 5), un compromiso habitual al priorizar el formato conversacional.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Tokenización por byte: las secuencias consumen más tokens que con un tokenizador BPE, lo que reduce el contenido efectivo que cabe en la ventana de contexto.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines automatizados.
- Riesgo de alucinación elevado por tamaño y por ausencia de RLHF/DPO; requiere revisión humana en cualquier uso externo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y la baja calidad desaconsejan su despliegue en producción sin fine-tuning adicional y evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Dependencia de código propio en lugar de `transformers`, lo que complica la integración con el ecosistema estándar (vLLM, TGI, Ollama) sin trabajo adicional de adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaxMillion404/MaxGPT-3.5
- Repositorio de código y write-up: https://github.com/MaxwellBrohm/MaxGPT
- Sitio del autor: https://maxwellbrohm.com
