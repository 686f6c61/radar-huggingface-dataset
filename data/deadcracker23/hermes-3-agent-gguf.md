# Deadcracker23/hermes-3-agent-gguf

## Resumen

`Deadcracker23/hermes-3-agent-gguf` es una conversión a formato GGUF del modelo Hermes 3, en su variante Llama 3.1 de 8.000 millones de parámetros, publicada por el usuario Deadcracker23 en Hugging Face. Se trata de un artefacto derivado, no de un modelo entrenado desde cero por este autor: el trabajo original corresponde a Nous Research (familia Hermes 3) y la conversión y el ajuste fino se realizaron con la herramienta Unsloth, según indica la propia model card. El repositorio contiene un único archivo de pesos cuantizado en Q4_K_M, pensado para su uso directo con llama.cpp y Ollama.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con aproximadamente 8.030 millones de parámetros y una ventana de contexto nominal de 128.000 tokens en el modelo base (aunque la model card del repositorio no la documenta explícitamente). Su orientación es conversacional y de agentes, con soporte para plantillas de chat compatibles con Jinja (`--jinja` en llama.cpp) y un Modelfile de Ollama incluido. El tamaño del repositorio es de 4,9 GB, coherente con una única cuantización Q4_K_M de un modelo de 8B.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar localmente un modelo de 8B afinado para uso agéntico en hardware de consumo, con un único archivo listo para llama.cpp u Ollama. No obstante, el repositorio es un artefacto de terceros con cero descargas, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados, lo que exige cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, según nombre de archivo y parámetros) |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio (el modelo base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura ni el proceso de entrenamiento original. Por el nombre del archivo (`hermes-3-llama-3.1-8b.Q4_K_M.gguf`) y el recuento de parámetros (8.030 millones), se trata de una conversión del modelo Hermes 3 de Nous Research sobre la base Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA) y RoPE, preentrenado por Meta y posteriormente afinado por Nous Research con datos conversacionales y de instrucciones. La model card indica que el ajuste fino y la conversión a GGUF se hicieron con Unsloth, y que el comportamiento del token BOS se ajustó para compatibilidad con GGUF.

No se proporciona información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas de esta conversión. La única modificación documentada es el ajuste del token BOS y la inclusión de una plantilla de chat compatible con `--jinja` en llama.cpp. Cualquier dato adicional sobre el entrenamiento de Hermes 3 debe consultarse en la model card original de Nous Research, no en este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Hermes 3.
- Razonamiento y matemáticas a nivel de un modelo de 8B (sin benchmarks publicados en este repositorio).
- Generación de código, presumiblemente, por la base Llama 3.1 8B (no verificado en este artefacto).
- Soporte de plantilla de chat con Jinja (`--jinja`), lo que habilita el formato de roles system/user/assistant.
- Orientación a uso agéntico según el nombre del repositorio ("agent"), aunque no se documentan herramientas específicas ni formato de tool calling.
- Compatibilidad con Ollama mediante Modelfile incluido.
- Capacidades multilingües: no disponibles en la información del repositorio.
- No se documentan modos de razonamiento extendido, visión ni audio en este artefacto.

## Casos de uso

- Asistente conversacional local: el archivo Q4_K_M puede cargarse en llama.cpp u Ollama en un equipo de consumo y usarse como chatbot de propósito general con plantilla Jinja para roles system/user/assistant.
- Prototipado de agentes en local: el nombre del repositorio sugiere un afinado orientado a agentes; puede emplearse para probar bucles de razonamiento multi-paso y llamadas a herramientas en un entorno controlado antes de migrar a un modelo con soporte documentado.
- Generación de código en estaciones de trabajo sin GPU dedicada: con Q4_K_M y ~5 GB de VRAM/RAM, es viable autocompletar y explicar fragmentos de código en un portátil, aunque sin garantías de calidad medidas.
- Despliegue en edge o entornos aislados: al ser un único archivo GGUF, puede distribuirse en máquinas sin acceso a Internet para tareas de procesamiento de texto offline.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de Q4_K_M frente a otras cuantizaciones del mismo modelo base, siempre que se obtenga el modelo original para comparar.
- Base para afinado adicional con Unsloth: al estar producido con esa herramienta, puede reutilizarse el flujo para ajustar el modelo a un dominio concreto, aunque conviene partir del modelo original en safetensors para evitar arrastrar artefactos de la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (4,9 GB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); también A100/H100 para despliegues con contexto largo, aunque están sobredimensionadas para un 8B.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más; en GPUs de 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF (LM Studio, KoboldCpp, text-generation-webui). vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto. Como referencia cualitativa, un 8B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Deadcracker23/hermes-3-agent-gguf | ~8B | No disponible (base: 128k) | No disponible | GGUF Q4_K_M | Artefacto de terceros, 0 descargas, sin benchmarks |
| NousResearch/Hermes-3-Llama-3.1-8B | ~8B | 128k | Llama 3.1 Community License | Safetensors | Modelo original de Nous Research, con model card y evaluación |
| Meta-Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | Safetensors, GGUF oficiales | Base instructiva de referencia, ampliamente evaluada |
| Mistral-7B-Instruct-v0.3 | ~7B | 32k | Apache 2.0 | Safetensors, GGUF | Alternativa permisiva para uso comercial |

La comparación con el modelo original de Nous Research es la más relevante: este repositorio es una conversión del mismo, por lo que las diferencias se limitan a la cuantización y al ajuste del token BOS, no a capacidades nuevas. Frente a Llama 3.1 8B Instruct y Mistral 7B Instruct, la ventaja principal de este artefacto es la disponibilidad en GGUF listo para Ollama, y la desventaja es la ausencia de licencia declarada y de documentación.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del artefacto, lo que impide confirmar si el uso comercial es legal. El modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, con obligaciones de atribución y restricciones de uso.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad.
- Sin benchmarks ni evaluación: no hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este artefacto concreto.
- Riesgo de alucinación: inherente a los modelos de 8B, especialmente en tareas de razonamiento largo y matemáticas; no hay evaluación que lo cuantifique.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta conversión; el modelo base Llama 3.1 está orientado principalmente al inglés.
- Contexto no documentado: aunque el modelo base soporta 128k, la cuantización Q4_K_M y el ajuste del token BOS pueden alterar el comportamiento en contextos largos; no hay pruebas publicadas.
- Artefacto de terceros: el autor del repositorio no es el autor del modelo; conviene verificar la integridad del archivo y, en producción, preferir el modelo original en safetensors o GGUF oficiales de Nous Research.
- Soporte agéntico no verificado: el nombre del repositorio sugiere capacidades de agente, pero no se documenta formato de tool calling ni esquema de funciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Deadcracker23/hermes-3-agent-gguf
- Modelo original Hermes 3 (Nous Research): https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Llama 3.1 8B (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B
- Unsloth (herramienta de ajuste fino y conversión): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
