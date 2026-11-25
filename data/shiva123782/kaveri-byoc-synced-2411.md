# shiva123782/kaveri-byoc-synced-2411

## Resumen

`kaveri-byoc-synced-2411` es un adaptador PEFT (QLoRA) publicado por el usuario `shiva123782` bajo la organización Kaveri-BYOC-Labs, resultado de un proceso de fine-tuning "BYOC" (bring your own compute) orquestado con la herramienta propietaria Kaveri AI V3. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador LoRA que debe cargarse sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, un transformer decoder-only de 1.100 millones de parámetros desarrollado por TinyLlama.

El propósito declarado es demostrar un flujo de entrenamiento soberano en GPU privada (estación de trabajo local o Kaggle T4) con cuantización de 4 bits, rango LoRA 8 y alpha 16 sobre el dataset `timdettmers/openassistant-guanaco` durante una única época. El repositorio incluye artefactos auxiliares de sincronización (`byoc_sync_manifest.json`, `Modelfile`, `train_byoc.py`) orientados a reproducir el pipeline, más que a ofrecer un modelo listo para producción.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo de adaptación ligera sobre un modelo pequeño de 1,1B con licencia Apache 2.0, ejecutable en hardware de consumo. No hay evidencia de evaluación de calidad, benchmarks publicados ni un caso de uso validado más allá de la demostración técnica del flujo BYOC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama-1.1B-Chat); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 1.100 millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros (rango 8, alpha 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base TinyLlama-1.1B-Chat emplea 2.048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4 bits; el adaptador se distribuye en precisión de entrenamiento PEFT (no se especifica formato de cuantización de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (archivos `adapter_config.json` y pesos del adaptador); no se publican safetensors del modelo completo ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat, un transformer decoder-only de tipo Llama con 1,1B parámetros. El fine-tuning se realizó con QLoRA: cuantización del modelo base a 4 bits, adaptadores de bajo rango con `r=8` y `alpha=16`, una sola época sobre `timdettmers/openassistant-guanaco`, un dataset de conversaciones asistenciales en inglés derivado de OpenAssistant. El entrenamiento se ejecutó en una GPU privada (BYOC on-premise CUDA) o en una Kaggle T4 mediante el script `train_byoc.py` incluido en el repositorio.

No se documentan el número de tokens de entrenamiento, la composición exacta del dataset tras el filtrado, ni si hubo etapas de RLHF o DPO adicionales. La innovación declarada es de proceso, no de arquitectura: sincronización reproducible vía Kaveri AI V3 con un manifiesto (`byoc_sync_manifest.json`) y un script de entrenamiento versionado. No hay indicios de modificaciones arquitectónicas sobre el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base y ajustada sobre OpenAssistant Guanaco.
- Instrucciones de tipo chat de un solo turno o multi-turno corto, limitadas por la ventana de contexto del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües no verificadas; el dataset de entrenamiento es mayoritariamente en inglés.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- El repositorio incluye un `Modelfile`, lo que sugiere compatibilidad con el formato de Ollama, aunque no se detalla su contenido.

## Casos de uso

- Reproducción de pipelines de fine-tuning ligero: el script `train_byoc.py` y el manifiesto permiten replicar el entrenamiento QLoRA en una GPU de consumo, útil como plantilla docente o de validación interna.
- Prototipado de asistentes conversacionales en inglés sobre hardware modesto: al partir de un modelo de 1,1B, el adaptador puede servirse en una GPU de 8-12 GB con cuantización adicional.
- Evaluación de la metodología BYOC de Kaveri AI: sirve para auditar cómo se sincronizan artefactos de entrenamiento y pesos en un repositorio de Hugging Face.
- Experimentos académicos de bajo coste: permite estudiar el efecto de un ajuste QLoRA de una época sobre Guanaco en un modelo pequeño, con licencia Apache 2.0 sin restricciones comerciales.
- Base para comparativas de adaptadores: al ser un LoRA de rango 8 sobre TinyLlama, puede contrastarse frente a otros adaptadores del mismo modelo base en tareas de instrucción.
- Integración en demos locales con Ollama: la presencia de un `Modelfile` sugiere que puede empaquetarse para inferencia local, aunque requeriría fusionar el adaptador con el modelo base previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 2,2 GB; en 4 bits, en torno a 0,7-1 GB. El adaptador añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base cuantizado; una RTX 3060, RTX 4060 o T4 son suficientes. Para entrenamiento QLoRA, se declara compatible con Kaggle T4 (16 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más, incluyendo GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF; vLLM y TGI no soportan adaptadores PEFT de forma nativa sin fusión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kaveri-byoc-synced-2411 | 1,1B (base) + LoRA r=8 | no disponible | Apache 2.0 | Adaptador PEFT | Ajuste de 1 época sobre Guanaco; sin benchmarks |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens (no confirmado en esta ficha) | Apache 2.0 | Safetensors, GGUF | Modelo base oficial, con evaluación publicada por el autor |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa más reciente con contexto mucho mayor |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Safetensors, GGUF | Modelo pequeño de Hugging Face con benchmarks publicados |

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad; el adaptador podría degradar el rendimiento del modelo base en tareas fuera de Guanaco.
- Una sola época sobre un dataset conversacional en inglés limita la generalización y el soporte multilingüe.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (1,1B) y la ausencia de etapas de alineación adicionales.
- El repositorio contiene scripts de entrenamiento (`train_byoc.py`, `byoc/dev_custom_byoc_train.py`); deben auditarse antes de ejecutarlos, ya que no se ha verificado su contenido.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones técnicas del modelo base y del dataset Guanaco.
- No es un modelo autónomo: requiere descargar y cargar TinyLlama-1.1B-Chat y fusionar o aplicar el adaptador, lo que añade pasos operativos en producción.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/kaveri-byoc-synced-2411
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/timdettmers/openassistant-guanaco
