# mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF

## Resumen

docto-decision-qwen3.5-4b-fr-v0.1 es un modelo especializado en la toma de decisiones clínicas en francés, desarrollado por bofenghuang y distribuido en formato GGUF por mradermacher. Se construye sobre una base Qwen3.5 de aproximadamente 4.326 millones de parámetros (4,3B) y se ajusta mediante LoRA sobre el conjunto de datos bofenghuang/docto-decision-data-fr-v0.1. El modelo está etiquetado como "system-one", "decision-model" y "calibration", lo que indica un enfoque en decisiones rápidas y calibradas, no en razonamiento extendido.

La relevancia del modelo reside en su especialización vertical: frente a modelos generalistas, ofrece una ventana de decisión médica en francés con licencia Apache 2.0, lo que facilita su integración en sistemas de triaje, apoyo a la decisión clínica y pipelines de clasificación. Su tamaño compacto permite desplegarlo en hardware modesto mediante cuantización GGUF.

Esta ficha describe la versión GGUF publicada por mradermacher, que incluye cuantizaciones estáticas desde Q2_K hasta f16 y suplementos multimodales (mmproj). No se dispone de información sobre longitud de contexto, datos de entrenamiento detallados ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5), ajuste LoRA |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj f16 y Q8_0 |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers, endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer Qwen3.5 de 4,3B parámetros y se especializa mediante un ajuste LoRA sobre el dataset bofenghuang/docto-decision-data-fr-v0.1. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas "system-one", "decision-model" y "calibration" sugieren un entrenamiento orientado a producir decisiones directas y calibradas, en contraste con modelos de razonamiento de cadena larga.

La versión publicada por mradermacher es una conversión estática a GGUF del modelo base bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1. Incluye cuantizaciones estándar y suplementos multimodales mmproj, lo que indica que el modelo base podría tener capacidades multimodales, aunque no se especifica en la información disponible. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y decisiones clínicas en francés.
- Modelo de decisión ("decision-model") con énfasis en calibración de confianza.
- Enfoque "system-one": respuestas rápidas y directas, sin razonamiento extendido.
- Soporte conversacional (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Posible soporte multimodal por la presencia de archivos mmproj (no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al francés según la etiqueta de idioma.

## Casos de uso

- Triaje clínico automatizado: el modelo puede clasificar casos de pacientes en francés y emitir una decisión con nivel de confianza calibrado, adecuado para priorizar consultas en servicios de urgencias.
- Apoyo a la decisión médica: integrado en un sistema de historia clínica electrónica, sugiere decisiones diagnósticas o terapéuticas preliminares que el profesional revisa, gracias a su especialización en el dominio médico francés.
- Clasificación de documentación sanitaria: procesa informes y notas clínicas en francés para asignar categorías o códigos, aprovechando el ajuste sobre datos de decisión médica.
- Chatbot de orientación al paciente: gestiona conversaciones multi-turno en francés para derivar al paciente al servicio adecuado, con respuestas calibradas sobre el nivel de certeza.
- Filtrado y priorización en pipelines de datos clínicos: el modelo decide qué casos requieren revisión humana, reduciendo la carga de revisores mediante decisiones system-one de baja latencia.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (2,9 GB) y Q2_K (2,1 GB) permiten ejecutar el modelo en portátiles o servidores sin GPU dedicada mediante llama.cpp u Ollama.
- Investigación en calibración de modelos médicos: sirve como referencia para estudiar la calibración de decisiones en modelos pequeños especializados en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K), 2,9 GB (Q4_K_M), 4,7 GB (Q8_0) y 8,8 GB (f16), sin contar el contexto y los suplementos mmproj (0,5-0,8 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 para cuantizaciones superiores; A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM para Q4_K_M; en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| docto-decision-qwen3.5-4b-fr-v0.1 (este) | 4,3B | no disponible | fr | Apache 2.0 | GGUF, safetensors |
| Qwen3.5 base (4B) | ~4B | no disponible | multilingüe | no disponible | safetensors |
| Modelos médicos en francés de tamaño similar | no disponible | no disponible | fr | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos en la información proporcionada; la comparativa se limita al modelo base Qwen3.5 y a alternativas genéricas no documentadas.

## Limitaciones y advertencias

- Especializado exclusivamente en francés; no se garantiza un rendimiento adecuado en otros idiomas.
- Modelo de dominio médico: no debe usarse como sustituto del juicio clínico profesional; las decisiones requieren supervisión humana.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en contextos clínicos donde los datos de entrenamiento pueden ser limitados.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su equidad.
- La calibración anunciada no está validada con benchmarks publicados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso clínico recae en el integrador.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de las decisiones; se recomienda Q4_K_M o superior para producción.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de conversaciones largas.

## Enlaces

- [Hugging Face: mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF](https://huggingface.co/mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF)
- [Modelo base: bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1](https://huggingface.co/bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1)
- [Dataset: bofenghuang/docto-decision-data-fr-v0.1](https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1)
- [Página de descargas del cuantizador](https://hf.tst.eu/model#docto-decision-qwen3.5-4b-fr-v0.1-GGUF)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Gráfico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantizaciones (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
