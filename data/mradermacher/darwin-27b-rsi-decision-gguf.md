# mradermacher/Darwin-27B-RSI-Decision-GGUF

## Resumen

Darwin-27B-RSI-Decision-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Darwin-27B-RSI-Decision, publicado por el usuario mradermacher en Hugging Face. El modelo base, alojado en el repositorio FINAL-Bench/Darwin-27B-RSI-Decision, cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamano. Por el nombre y las etiquetas (`decision-model`, `conversational`), parece orientado a tareas de toma de decisiones y conversación, aunque la model card original no aporta documentación tecnica detallada.

El repositorio es una conversión de pesos a GGUF, no un modelo entrenado de cero: mradermacher se limita a generar cuantizaciones estáticas del modelo original para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El repo ocupa 15,6 GB y ofrece un conjunto amplio de niveles de cuantización, desde Q2_K hasta Q8_0, además de F16 e IQ4_XS.

La relevancia de esta ficha es limitada pero practica: permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones agresivas, y confirma que el ecosistema GGUF sigue absorbiendo modelos de nicho. No obstante, la ausencia de documentación sobre entrenamiento, licencia, idiomas y benchmarks obliga a tratar el modelo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Darwin-27B-RSI-Decision. El tamano de ~26,9B parámetros y el formato de conversión (`convert_type: hf`) apuntan a un transformer denso convertido desde pesos Hugging Face, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. La etiqueta `decision-model` sugiere un ajuste fino orientado a tareas de decisión, posiblemente con datos sinteticos o de razonamiento, pero no hay documentación que lo verifique.

Tampoco se conocen los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF/DPO o técnicas de alineación. La model card del repositorio GGUF es puramente tecnica (metadatos de cuantización) y remite al repositorio original, que no aporta detalles en la información disponible. Cualquier afirmación sobre innovaciones arquitectónicas sería especulativa.

## Capacidades

- Generación de texto conversacional: las etiquetas `conversational` y `endpoints_compatible` indican uso previsto en diálogo multi-turno y despliegue mediante endpoints compatibles con la API de Hugging Face.
- Toma de decisiones: la etiqueta `decision-model` sugiere especialización en tareas de selección o razonamiento estructurado, aunque no se detalla el formato.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Razonamiento, código y matemáticas: no disponible; no hay benchmarks ni documentación que lo confirmen.

## Casos de uso

- Despliegue local en estación de trabajo: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU de consumo con 16-24 GB de VRAM mediante llama.cpp u Ollama, útil para prototipos de asistentes conversacionales sin depender de la nube.
- Experimentación con modelos de decisión: investigadores interesados en evaluar el comportamiento de un modelo etiquetado como `decision-model` pueden cargarlo en local y comparar sus salidas en tareas de selección entre opciones, aunque sin benchmarks de referencia el análisis será exploratorio.
- Chatbot de soporte en entornos air-gapped: al ser GGUF, puede desplegarse en infraestructura sin conexión a internet, lo que encaja en organizaciones con requisitos de confidencialidad, siempre que se valide antes la calidad de las respuestas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización, lo que permite medir la degradación de calidad y el ahorro de VRAM entre Q2_K y Q8_0 en un mismo modelo, un caso de uso metodológico para ingenieros de despliegue.
- Filtrado y clasificación conversacional: si el ajuste `decision-model` funciona, podría emplearse para tareas de enrutamiento o clasificación de intenciones en pipelines de atención al cliente, previa validación empírica.
- Base para fine-tuning posterior: los pesos GGUF no son ideales para reentrenar, pero el modelo original en safetensors puede servir como punto de partida para ajustes con LoRA en tareas de decisión específicas del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización y longitud de contexto):
  - Q2_K: ~10-11 GB
  - Q3_K_M: ~13-14 GB
  - Q4_K_M: ~16-17 GB
  - Q5_K_M: ~19-20 GB
  - Q6_K: ~22-23 GB
  - Q8_0: ~28-29 GB
  - F16: ~54 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q8_0 y F16; configuraciones multi-GPU para F16.
- ¿Cabe en GPU de consumo? Sí, con cuantizaciones Q4_K_M o inferiores en tarjetas de 16-24 GB (RTX 4080, 4090, 3090, 7900 XTX). Q2_K podría caber en 12 GB con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. No se indica soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-27B-RSI-Decision-GGUF | ~26,9B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo de nicho sin documentación |
| Modelos densos de ~27B tipo Gemma 2 27B | 27B | 8K | Gemma license | safetensors, GGUF | Documentación completa y benchmarks públicos |
| Modelos densos de ~24-32B tipo Qwen2.5 32B | 32B | 32K | Apache 2.0 | safetensors, GGUF | Amplia documentación y soporte de tool calling |

La comparación es limitada: no hay datos de rendimiento del modelo Darwin, y las alternativas citadas son referencias genéricas de la misma categoría de tamano, no equivalentes funcionales confirmados. No se dispone de información para comparar calidad, contexto o licencia con rigor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; tratar como no apto para producción hasta verificar la licencia del modelo base.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas de decisión, por lo que el rendimiento es desconocido.
- Documentación mínima: la model card solo contiene metadatos de cuantización; no hay información sobre arquitectura, datos de entrenamiento ni alineación.
- Riesgo de alucinación: sin datos de RLHF/DPO ni evaluaciones, el riesgo es indeterminado y probablemente alto en dominios especializados.
- Idiomas no confirmados: no se puede garantizar soporte de castellano ni de otros idiomas distintos del inglés.
- Contexto desconocido: no se conoce la ventana de contexto, lo que impide planificar cargas de trabajo con documentos largos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos de este tamano; usar Q4_K_M o superior para evaluaciones serias.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, lo que aumenta el riesgo de pesos defectuosos o mal convertidos.
- El nombre "RSI" y "Decision" no está explicado; podría tratarse de un experimento de investigación sin validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Darwin-27B-RSI-Decision-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI-Decision
