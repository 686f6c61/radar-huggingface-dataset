# BrazosDeDios/Apertus-8B-MeditronFO-Q5_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de tipo Q5_K_M del modelo EPFLiGHT/Apertus-8B-MeditronFO, un ajuste fino de dominio médico derivado de la familia Apertus de 8.000 millones de parámetros. El modelo original lo desarrolla EPFLiGHT (ligado al ecosistema de EPFL) y esta versión concreta la publica el usuario BrazosDeDios como conversión de pesos para su uso con llama.cpp. El objetivo es claro: poner un modelo médico de pesos abiertos al alcance de entornos con recursos limitados, sin necesidad de GPUs de datacenter.

La relevancia de esta ficha radica en que el modelo base se presenta como "fully open" (datos de entrenamiento abiertos, según el dataset EPFLiGHT/fully-open-meditron), algo poco habitual en el ámbito médico, donde la mayoría de los modelos clínicos son opacos en cuanto a datos y proceso de entrenamiento. La cuantización Q5_K_M reduce el peso a unos 5,8 GB en disco, lo que permite ejecución local en hardware de consumo.

Conviene subrayar que este repositorio es únicamente una conversión de formato: no aporta entrenamiento adicional ni evaluación propia. Toda la información técnica sustantiva procede del modelo base, y los datos no disponibles en esta ficha deben consultarse en la model card original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia Apertus; detalles no confirmados en la información proporcionada) |
| Parámetros totales | 8.053.338.176 (8,05 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 2048`, pero es solo un valor de arranque, no la ventana nativa) |
| Tipos de cuantización | Q5_K_M (este repositorio); otras cuantizaciones del modelo base no confirmadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`apertus-8b-meditronfo-q5_k_m.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de la arquitectura interna detallada del modelo base (número de capas, dimensión oculta, tipo de atención). Se trata de un transformer de 8,05 mil millones de parámetros según el recuento de safetensors del modelo original. El modelo base es un ajuste fino de dominio médico (MeditronFO) sobre la familia Apertus, entrenado con el dataset EPFLiGHT/fully-open-meditron, que el autor etiqueta como "fully open", es decir, con datos de entrenamiento publicados y auditables.

Este repositorio concreto no ha realizado entrenamiento alguno: es una conversión de pesos a GGUF Q5_K_M generada mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. No hay información disponible sobre el número exacto de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en inglés con especialización en dominio médico y clínico (según etiquetas del autor: medical, clinical, healthcare, meditron).
- Respuesta a preguntas de conocimiento biomédico y razonamiento clínico general, derivado del ajuste Meditron.
- Ejecución local mediante llama.cpp, con CLI y servidor HTTP integrados.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio de generación de texto.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistencia documental clínica en local: resumir notas o informes médicos en inglés sobre infraestructura propia, sin enviar datos de pacientes a la nube, aprovechando que el modelo pesa unos 5,8 GB y cabe en una GPU de consumo.
- Formación y simulación para profesionales sanitarios: generar casos clínicos sintéticos y preguntas de repaso en inglés, con la ventaja de que el modelo base es "fully open" y auditable.
- Prototipado de asistentes de triaje conversacional: construir un chatbot de primer nivel que clasifique síntomas descritos en inglés y derive a un profesional, siempre con supervisión humana y sin uso diagnóstico autónomo.
- Investigación en NLP biomédico: usar el modelo como línea base reproducible (licencia Apache 2.0, datos abiertos) para comparar técnicas de ajuste fino en dominio médico.
- Extracción de entidades y estructuración de texto clínico: procesar corpus en inglés para poblar bases de datos de investigación, con validación posterior por expertos.
- Despliegue en entornos aislados (air-gapped): hospitales o laboratorios sin acceso a internet pueden ejecutar el GGUF con llama.cpp en estaciones de trabajo con GPU consumer.
- Educación y divulgación médica: generar explicaciones en inglés de conceptos de salud para materiales formativos, revisadas por personal clínico antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionan cifras de MMLU, MedQA, HumanEval, GSM8K u otras evaluaciones, ni del modelo base ni de esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6-7 GB con Q5_K_M (pesos de ~5,8 GB más overhead de contexto y caché KV). Con contexto largo, la VRAM crece de forma apreciable.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A100 o H100 para mayor throughput y contextos amplios.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para contextos moderados; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), Ollama (importando el GGUF), y otros runners compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Apertus-8B-MeditronFO Q5_K_M (este) | 8,05 B | no disponible | Médico, inglés | Apache 2.0 | GGUF, pesos abiertos, datos abiertos |
| Modelos Meditron previos (p. ej. Meditron-7B) | ~7 B | no disponible | Médico | no disponible en esta ficha | safetensors / GGUF según versión |
| Modelos clínicos abiertos de 7-8 B de otras familias | ~7-8 B | variable | Médico | variable | variable |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados en la información proporcionada que permitan contrastar rendimiento clínico frente a otros modelos médicos de tamaño similar.

## Limitaciones y advertencias

- Modelo de dominio médico pero no validado clínicamente: no debe usarse para diagnóstico, prescripción ni decisiones terapéuticas sin supervisión de un profesional sanitario.
- Riesgo de alucinación relevante: en contextos clínicos, una respuesta inventada puede tener consecuencias graves; se requiere verificación humana y sistemas de salvaguarda.
- Solo inglés: no hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso en España sin traducción previa o ajuste adicional.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos demográficos, raciales o de género en la información disponible.
- La cuantización Q5_K_M introduce una pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles conviene evaluar el modelo base a plena precisión.
- Este repositorio es una conversión de terceros (BrazosDeDios), no una publicación oficial de EPFLiGHT; la trazabilidad y el mantenimiento no están garantizados.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad regulatoria (por ejemplo, normativa de productos sanitarios o RGPD al tratar datos de salud) recae en el desplegador.
- El ejemplo de servidor usa `-c 2048`; no debe confundirse con la ventana de contexto nativa del modelo, que no está documentada aquí.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/BrazosDeDios/Apertus-8B-MeditronFO-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/EPFLiGHT/Apertus-8B-MeditronFO
- Dataset de entrenamiento: https://huggingface.co/datasets/EPFLiGHT/fully-open-meditron
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
