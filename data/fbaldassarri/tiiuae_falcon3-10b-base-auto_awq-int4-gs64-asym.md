# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-asym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo base `tiiuae/Falcon3-10B-Base`, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de cuantización de solo pesos (weight-only quantization, WoQ) generado con el algoritmo AWQ mediante el framework Intel AutoRound v0.16.1. El objetivo es reducir el peso en memoria y acelerar la inferencia del Falcon3-10B original, manteniendo una calidad aceptable para tareas de generación de texto y completado.

El modelo subyacente, Falcon3-10B-Base, es un transformer causal de tipo decoder-only desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. Esta versión cuantizada emplea 4 bits con tamaño de grupo 64 y cuantización asimétrica, y está pensada explícitamente para ejecutarse en hardware Intel: CPU, iGPU Arc (mediante intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (mediante OpenVINO).

Es relevante porque demuestra un flujo reproducible de cuantización de un modelo de 10B de parámetros para despliegue en hardware de consumo y estaciones de trabajo sin GPU dedicada, con una receta completa publicada (versiones, hiperparámetros y tiempos de ejecución). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card marca `inference: false`, lo que sugiere que el artefacto no está validado para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: llama en la configuracion de la version cuantizada) |
| Parametros totales | 2.160.061.440 segun safetensors del repo cuantizado; el modelo base es Falcon3-10B-Base (10B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4, group size 64, asimetrica (sym=false), WoQ con AWQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Falcon3-10B-Base es un transformer causal decoder-only de la familia Falcon3 de TII. La versión aquí descrita no introduce cambios arquitectónicos: aplica cuantización de solo pesos sobre las capas lineales del modelo original, manteniendo las activaciones en bfloat16. La cuantización se realizó con Intel AutoRound 0.16.1, usando 128 muestras de calibración, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4, todo sobre CPU. El proceso completo tardó 51.986,4 segundos (unas 866,4 minutos) y se completó el 1 de noviembre de 2026.

La innovación técnica del artefacto es la receta de cuantización reproducible: el autor documenta versiones exactas (transformers 4.55.3, torch 2.15.0+cpu), hiperparámetros y un pipeline de orquestación (`auto-round-pipeline`) con modos de instalación alternativos (wheel fijado, compilación desde fuente, aceleración Intel XPU, CUDA y ROCm). No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esos detalles pertenecen a la model card de `tiiuae/Falcon3-10B-Base`, no incluida en la información proporcionada.

## Capacidades

- Generación de texto y completado autocompletivo: es un modelo base, no instruido, por lo que se invoca con texto crudo y continúa la secuencia.
- Razonamiento y conocimiento general heredados del modelo base Falcon3-10B-Base; no hay evaluación específica publicada para esta versión cuantizada.
- Generación de código y matemáticas: capacidad presumible por el modelo base, pero no verificada en esta versión.
- Tool calling / function calling: no disponible; al ser un modelo base sin ajuste de instrucciones no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible en esta versión.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking).
- Inferencia optimizada para hardware Intel: CPU, iGPU Arc y NPU AI Boost.

## Casos de uso

- Completado de texto en aplicaciones de escritorio: al ser un modelo base, puede integrarse en editores o herramientas de escritura para sugerir continuaciones de párrafo, aprovechando su reducido peso en memoria (repo de 8,3 GB) en equipos sin GPU dedicada.
- Prototipado de pipelines de generación de texto en CPU: sirve para validar arquitecturas de servicio y prompts antes de pasar a un modelo mayor o a la versión sin cuantizar, con la ventaja de no requerir GPU.
- Despliegue en portátiles con Intel Core Ultra: la model card indica soporte para NPU AI Boost vía OpenVINO, lo que permite ejecutar inferencia local con bajo consumo energético en escenarios de demostración o investigación.
- Evaluación de técnicas de cuantización: el repositorio incluye una receta reproducible completa (versiones, hiperparámetros, tiempos), útil para investigadores que quieran comparar AWQ INT4 frente a otras técnicas sobre el mismo modelo base.
- Generación de texto por lotes en entornos con memoria limitada: la cuantización a 4 bits reduce el peso del modelo y permite procesar lotes en máquinas con menos VRAM/RAM que las necesarias para el modelo en bfloat16.
- Base para ajuste fino ligero o experimentación académica: al estar bajo licencia Apache 2.0 y con pesos en safetensors compatibles con transformers, puede servir como punto de partida para experimentos de investigación, aunque la model card advierte que está desarrollado solo con fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una aceleración de 2-3X y una "ligera caída de precisión" en W4G64, pero no aporta métricas concretas (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 8,3 GB en safetensors; en INT4 el peso en memoria es aproximadamente ese orden, más el overhead de activaciones y del runtime.
- GPU recomendadas: no se documentan GPU concretas; la model card orienta el artefacto a CPU Intel, iGPU Arc y NPU AI Boost (Core Ultra).
- Cabe en GPU de consumo: no confirmado. Por tamaño (8,3 GB de pesos) podría caber en GPUs con 12-16 GB de VRAM, pero no hay validación publicada para CUDA.
- Opciones de despliegue: transformers (ejemplo incluido en la model card); Intel Extension for PyTorch para CPU/iGPU Arc; OpenVINO para NPU; el tag `text-generation-inference` sugiere compatibilidad con TGI, no verificada. No se documenta soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; solo se indica una aceleración genérica de 2-3X frente a la versión sin cuantizar, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-asym | 10B (base); repo cuantizado con 2.160.061.440 parametros en safetensors | no disponible | INT4 AWQ, gs64, asimetrica | apache-2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Base | 10B | no disponible en la informacion proporcionada | bfloat16 (original) | apache-2.0 (segun el repo cuantizado) | Hugging Face (modelo base) |
| Otras cuantizaciones INT4 de Falcon3-10B-Base | 10B | no disponible | INT4 (distintos metodos) | apache-2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable y requiere prompts de completado; no debe usarse como asistente conversacional sin ajuste adicional.
- Solo inglés documentado (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- La cuantización INT4 con group size 64 introduce una caída de precisión reconocida por el autor ("slight accuracy drop"), sin cuantificación publicada.
- La model card marca `inference: false`, lo que indica que el artefacto no está validado para inferencia directa en producción.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación independiente.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan evaluaciones de sesgo para esta versión.
- La model card declara que el modelo se ha desarrollado solo con fines de investigación y se entrega sin garantía.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original antes de desplegarlo.
- El soporte está orientado a hardware Intel (CPU, Arc, NPU); el rendimiento en CUDA/ROCm no está documentado.
- La fecha de creación del repositorio (2026-11-15) y la del proceso de cuantización (2026-11-01) son posteriores a la información habitualmente disponible; conviene contrastar la vigencia del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Framework de cuantización Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
