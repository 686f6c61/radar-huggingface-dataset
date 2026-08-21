# Shriyanshml/phi3-mini-qlora-mediguide

## Resumen

El modelo `Shriyanshml/phi3-mini-qlora-mediguide` se presenta como un ajuste fino mediante QLoRA del modelo base `microsoft/Phi-3-mini-4k-instruct` de Microsoft, orientado a guía médica (mediguide). Sin embargo, el repositorio está vacío: el tamaño del repo es de 0.0 GB, no contiene pesos ni archivos de modelo, y la model card es una plantilla autogenerada sin información sustantiva. El modelo base, Phi-3-mini, es un small language model (SLM) de 3.8 mil millones de parámetros desarrollado por Microsoft, entrenado con datos sintéticos y datos web públicos filtrados con énfasis en razonamiento y calidad. En el estado actual del repositorio, no es posible descargar ni utilizar este modelo, por lo que esta ficha documenta tanto las especificaciones del modelo base como la ausencia de artefactos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Phi-3-mini) |
| Parametros totales | 3.8B (base); ajuste QLoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K (base: Phi-3-mini-4k-instruct) |
| Tipos de cuantizacion | no disponible (repo vacio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiquetado, pero sin archivos en el repo) |

## Arquitectura y entrenamiento

El modelo base Phi-3-mini es un transformer decoder-only de 3.8B parámetros, entrenado por Microsoft con el dataset Phi-3, que combina datos sintéticos y datos web públicos filtrados con un enfoque en propiedades de alta calidad y razonamiento denso. El ajuste QLoRA (Quantized Low-Rank Adaptation) es una técnica de fine-tuning eficiente que congela los pesos del modelo base cuantizado e introduce matrices de bajo rango adaptables, lo que permite entrenar con requisitos de VRAM reducidos. No obstante, para este repositorio concreto no se ha publicado información sobre el dataset de entrenamiento médico, los hiperparámetros del ajuste, el número de pasos, ni el régimen de entrenamiento. La model card no contiene ninguna de estas especificaciones.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Phi-3-mini, que destaca en tareas de razonamiento y comprensión de instrucciones.
- Ajuste médico: el nombre del modelo sugiere que fue afinado para responder consultas de guía médica, pero no hay evidencia publicada de ello.
- Tool calling y function calling: no disponible para este ajuste; el modelo base Phi-3-mini-4k-instruct soporta instrucciones en formato chat, pero no se ha verificado soporte de tool calling en este repositorio.
- Capacidades multilingües: no disponibles; el modelo base tiene soporte multilingüe limitado, principalmente inglés.
- Capacidades especiales: no disponibles; no se ha documentado modo de pensamiento, visión ni audio.

## Casos de uso

- Consulta médica automatizada: el modelo podría responder preguntas frecuentes sobre síntomas, medicamentos y recomendaciones generales de salud, aprovechando el ajuste médico. Sin embargo, al no haber pesos publicados, no es desplegable en la práctica.
- Asistente de documentación clínica: podría ayudar a redactar resúmenes de historiales o notas clínicas, pero requiere validación médica y no hay evidencia de su rendimiento.
- Educación sanitaria para pacientes: podría generar explicaciones de condiciones médicas en lenguaje accesible, aunque sin benchmarks publicados no se puede evaluar su fiabilidad.
- Soporte a profesionales sanitarios: podría servir como herramienta de consulta rápida, pero la ausencia de validación clínica y de datos de evaluación lo hace inadecuado para uso en producción.
- Investigación académica en NLP médica: el repositorio podría servir como referencia metodológica para ajustes QLoRA en el dominio médico, aunque sin artefactos no es reproducible.
- Integración en pipelines de RAG médico: combinado con recuperación aumentada, podría responder consultas con contexto de documentos clínicos, pero requiere pesos disponibles y evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de evaluación, y la model card no reporta valores de MMLU, HumanEval, GSM8K ni ningún otro benchmark. Tampoco se ha publicado la pérdida de evaluación del ajuste, a diferencia de otros repositorios similares como `edumunozsala/phi-3-mini-QLoRA` (loss 0.5741) o `shandilyabh/phi-3-mini-QLoRA` (loss 1.0530).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto. Para el modelo base Phi-3-mini (3.8B), se estima entre 4-6 GB en cuantización de 4 bits y 8-10 GB en precisión completa.
- GPU recomendadas: el modelo base cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB). Para entrenamiento QLoRA se recomienda al menos 12-16 GB de VRAM.
- Opciones de despliegue: el modelo base es compatible con vLLM, llama.cpp, Ollama y Hugging Face TGI. Para este repositorio, no hay artefactos que desplegar.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Shriyanshml/phi3-mini-qlora-mediguide | 3.8B (base) | 4K | no disponible | Repo vacio, sin pesos |
| edumunozsala/phi-3-mini-QLoRA | 3.8B (base) | 4K | no disponible | Fine-tune con loss 0.5741 |
| shandilyabh/phi-3-mini-QLoRA | 3.8B (base) | 4K | no disponible | Fine-tune con loss 1.0530 |
| microsoft/Phi-3-mini-4k-instruct | 3.8B | 4K | MIT | Modelo base oficial |

Los dos repositorios QLoRA comparables de la búsqueda web sí contienen pesos y reportan pérdida de evaluación, mientras que el modelo objeto de esta ficha no publica ningún artefacto.

## Limitaciones y advertencias

- Repositorio vacío: el tamaño del repo es 0.0 GB, lo que indica que no se han subido los pesos del modelo. Cualquier intento de descarga o inferencia fallará.
- Model card sin contenido: toda la información de la model card es una plantilla autogenerada con marcadores "[More Information Needed]".
- Sin validación médica: aunque el nombre sugiere uso médico, no hay evidencia de evaluación clínica, lo que lo hace inadecuado para uso sanitario real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en el dominio médico, las alucinaciones pueden ser peligrosas.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- Fecha de creación anómala: el modelo está fechado en 2026-08-21, lo que sugiere un error de reloj o metadata inconsistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shriyanshml/phi3-mini-qlora-mediguide
- Blog de Microsoft sobre Phi-3: https://azure.microsoft.com/en-us/blog/introducing-phi-3-redefining-whats-possible-with-slms/
- Página de Phi-3-mini en Ollama: https://ollama.com/library/phi3:mini
- Repositorio comparable (edumunozsala): https://huggingface.co/edumunozsala/phi-3-mini-QLoRA
- Repositorio comparable (shandilyabh): https://huggingface.co/shandilyabh/phi-3-mini-QLoRA
- Página de modelos Phi en Azure: https://azure.microsoft.com/en-us/products/phi/
