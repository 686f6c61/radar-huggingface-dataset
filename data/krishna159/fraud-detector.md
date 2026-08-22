# Krishna159/fraud-detector

## Resumen

Krishna159/fraud-detector es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Krishna159 mediante entrenamiento supervisado (SFT) con la librería TRL de Hugging Face. A pesar de su nombre, orientado a la detección de fraude, no se ha publicado información sobre el dataset de entrenamiento, el dominio de aplicación ni la tarea específica que aborda.

El repositorio tiene un tamaño de 0.0 GB, lo que indica que no contiene los pesos del modelo. La model card incluye únicamente un ejemplo de generación de texto genérico (una pregunta sobre viajes en el tiempo), sin relación aparente con la detección de fraude. Esto hace que el modelo, tal y como está publicado, no sea utilizable para inferencia ni para evaluaciones. La relevancia de esta ficha es documentar el estado real del recurso y advertir de sus limitaciones para quien considere usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1,5B (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags; repo vacío, sin archivos) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen2.5-1.5B-Instruct, que emplea una arquitectura transformer decoder-only con atención causal. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0+cu128 y Datasets 5.0.1. No se ha documentado el conjunto de datos utilizado, el número de tokens de entrenamiento ni la composición del dataset. Tampoco hay evidencia de técnicas como RLHF o DPO. Al no publicarse los pesos, no se puede verificar ninguna innovación técnica adicional.

## Capacidades

- Generación de texto básica: el ejemplo de la model card muestra generación autoregresiva con el pipeline de transformers, pero no demuestra ninguna tarea específica.
- No hay evidencia de soporte de tool calling, function calling o capacidades de agente.
- No hay información sobre capacidades multilingües más allá de las del modelo base.
- No hay evidencia de modo de razonamiento especial, visión o audio.
- La tarea de detección de fraude no está documentada ni verificable.

## Casos de uso

Dado que el repositorio no contiene pesos y no se documenta ninguna tarea específica, no se pueden recomendar casos de uso reales. Los siguientes escenarios son hipotéticos y solo serían válidos si el autor publicara los pesos y la documentación de entrenamiento:

- Detección de fraude en transacciones financieras: el modelo podría clasificar transacciones como fraudulentas o legítimas, pero no hay datos que lo demuestren.
- Análisis de texto para señales de fraude en conversaciones: requeriría un dataset etiquetado de diálogos, del que no hay constancia.
- Generación de informes de riesgo: sin evaluación de rendimiento, no es seguro.
- Integración en pipelines de monitorización en tiempo real: los requisitos de latencia y precisión no están verificados.
- Investigación académica: podría servir como referencia para comparar metodologías de SFT, pero el repo vacío impide su uso.
- Aprendizaje de herramientas de Hugging Face: el ejemplo de la model card sirve como demostración de la API de transformers, no como caso de uso real.

En todos los casos, la falta de pesos y de documentación hace que el modelo no sea desplegable ni evaluable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se puede estimar la VRAM necesaria para inferencia al no disponer de los pesos. Como referencia, el modelo base Qwen2.5-1.5B-Instruct puede ejecutarse en GPUs consumer con 6-8 GB de VRAM en FP16, y en 4-5 GB con cuantización de 4 bits. No obstante, estas estimaciones no aplican al modelo publicado, que no contiene archivos.

- GPU recomendadas para el modelo base: NVIDIA RTX 3060, RTX 4060, RTX 4090, A100, H100.
- Opciones de despliegue para el modelo base: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles para este modelo concreto.

## Comparativa con modelos similares

No es posible realizar una comparativa rigurosa porque el modelo no tiene pesos publicados. Como referencia, se comparan el modelo base y alternativas de la misma familia:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32K (según documentación de Qwen) | MMLU ~60% (según Qwen) | Apache 2.0 | Disponible |
| Krishna159/fraud-detector | 1,5B (base) | no disponible | no disponible | no disponible | Repo vacío |
| Llama 3.2 1B Instruct | 1B | 128K | MMLU ~49% | Llama 3.2 license | Disponible |

No hay datos que permitan comparar el rendimiento del modelo ajustado frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que indica que no hay pesos del modelo publicados. El modelo no se puede descargar ni ejecutar.
- No se ha documentado el dataset de entrenamiento ni la tarea específica, por lo que no se puede verificar si realmente está orientado a la detección de fraude.
- El ejemplo de uso de la model card no es representativo de ninguna capacidad de detección de fraude.
- No hay información sobre la licencia, lo que impide conocer las restricciones de uso comercial.
- No hay resultados de benchmarks ni evaluaciones de sesgos, alucinación o robustez.
- El riesgo de alucinación es inherente al modelo base, pero no se ha evaluado en este ajuste.
- No se recomienda su uso en producción ni en investigación sin antes publicar los pesos y la documentación.

## Enlaces

- [Hugging Face - Krishna159/fraud-detector](https://huggingface.co/Krishna159/fraud-detector)
- [Qwen/Qwen2.5-1.5B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [TRL - Transformers Reinforcement Learning](https://github.com/huggingface/trl)
- Repositorios de detección de fraude de otros autores (no relacionados directamente con este modelo):
  - [krishna016agarwal/AI-Fraud-Detection-System](https://github.com/krishna016agarwal/AI-Fraud-Detection-System)
  - [krishnakg12/fraud-detection-ml-system](https://github.com/krishnakg12/fraud-detection-ml-system)
  - [vaibhav07112004/fraud-detection-models](https://huggingface.co/vaibhav07112004/fraud-detection-models)
- [Artículo académico sobre detección de fraude online](https://link.springer.com/article/10.1186/s40163-025-00248-8)
- [Preprint arXiv sobre detección de fraude online](https://arxiv.org/pdf/2409.19022)
