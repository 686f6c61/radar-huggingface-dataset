# mradermacher/med-advisor-conversation-4B-GGUF

## Resumen

med-advisor-conversation-4B es un modelo de lenguaje conversacional especializado en dominio médico, desarrollado por vmal y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino de la familia Qwen3 (según las etiquetas del repositorio) orientado a conversaciones de asesoramiento médico, educación sanitaria y razonamiento clínico. El modelo base contiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), lo que lo sitúa en el rango de modelos pequeños desplegables en hardware de consumo.

El repositorio que nos ocupa no contiene los pesos originales, sino una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher, distribuidas bajo licencia Apache 2.0. Esto lo hace directamente utilizable con llama.cpp, Ollama y otros motores compatibles con GGUF, sin necesidad de GPU de gama alta. La relevancia actual radica en la demanda de asistentes médicos locales y privados que puedan ejecutarse en entornos con recursos limitados y sin enviar datos clínicos a servicios en la nube.

La información pública disponible es limitada: la model card del repositorio cuantizado es fundamentalmente una ficha de cuantizaciones y no detalla la composición del dataset de entrenamiento, el contexto nativo ni los resultados de benchmarks. Los datos que se ofrecen a continuación provienen exclusivamente de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, según etiquetas del repositorio); detalles no disponibles |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); versiones con imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors según transformers |
| Tamano del repositorio | 39,7 GB |
| Pipeline declarado | reinforcement-learning |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo base es `vmal/med-advisor-conversation-4B`, un ajuste fino de un modelo de la familia Qwen3 (así lo indican las etiquetas `qwen` y `qwen3`), con 4,4 mil millones de parámetros. La etiqueta `reinforcement-learning` en el pipeline y en los tags sugiere que el ajuste incorporó técnicas de aprendizaje por refuerzo, presumiblemente sobre un dataset de conversaciones médicas (`vmal/med-advisor-conversation-4B`). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO más allá de lo que indica la etiqueta.

El repositorio de mradermacher es puramente de cuantización: aplica el proceso estándar de conversión a GGUF (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) y ofrece tanto cuantizaciones estáticas como versiones con imatrix en un repositorio separado (`mradermacher/med-advisor-conversation-4B-i1-GGUF`). No se documentan innovaciones arquitectónicas propias más allá de las heredadas del modelo base Qwen3.

## Capacidades

- Generación de texto conversacional en inglés orientada a asesoramiento médico y educación sanitaria.
- Razonamiento clínico y explicación de conceptos de biología y medicina (según etiquetas `medical`, `healthcare`, `biology`, `medical-education`).
- Conversación multi-turno en formato chat.
- Razonamiento explícito (etiqueta `reasoning`), presumiblemente heredado del modo de pensamiento de Qwen3; no confirmado en la documentación disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Asistente de educación médica para estudiantes: el modelo puede mantener conversaciones explicativas sobre fisiología, farmacología o biología, aprovechando su ajuste específico en material médico-educativo y su tamaño reducido para desplegarse en portátiles de estudiantes.
- Triaje conversacional preliminar en entornos con recursos limitados: al ejecutarse en GGUF con cuantización Q4_K_M (2,8 GB), puede desplegarse en clínicas rurales o dispositivos sin GPU dedicada para recoger síntomas y orientar al paciente, siempre con supervisión profesional.
- Generación de material divulgativo sanitario: redacción de borradores de folletos, FAQ de pacientes o guiones de educación para la salud en inglés, revisables posteriormente por personal clínico.
- Chatbot de apoyo en portales de salud: integración en una web mediante llama.cpp u Ollama para responder preguntas frecuentes no diagnósticas, manteniendo la conversación en local y evitando el envío de datos sensibles a terceros.
- Prototipado e investigación en NLP clínico: modelo ligero para experimentar con ajuste fino adicional, evaluación de sesgos o generación de datos sintéticos de conversaciones médicas en entornos académicos.
- Despliegue en dispositivos de borde (edge): con cuantizaciones Q2_K (1,9 GB) o Q3_K_S (2,2 GB) puede ejecutarse en mini-PC, Raspberry Pi de gama alta o móviles con suficiente RAM, útil para aplicaciones de salud offline.
- Filtrado y preanotación de corpus médicos: uso como modelo auxiliar para clasificar o resumir conversaciones clínicas antes de una revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización): Q2_K ≈ 1,9 GB; Q3_K_S ≈ 2,2 GB; Q4_K_M ≈ 2,8 GB; Q5_K_M ≈ 3,3 GB; Q6_K ≈ 3,7 GB; Q8_0 ≈ 4,8 GB; f16 ≈ 8,9 GB. Añadir margen para el contexto KV cache (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 o f16, se recomienda RTX 3060 12 GB, RTX 4070 o superiores. En A100/H100 el modelo es sobredimensionado para su tamaño y quedaría limitado por latencia de memoria, no por cómputo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 en GPUs con 6 GB o más; f16 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier motor compatible con GGUF. El modelo base también es compatible con transformers. No se indica compatibilidad con vLLM o TGI para los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| med-advisor-conversation-4B (este) | 4,4 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en conversación médica, solo inglés |
| Qwen3-4B (base presumible) | ~4 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista del que deriva; capacidades médicas no especializadas |
| Meditron-7B | 7 B | no disponible | Llama 2 (uso restringido) | safetensors, GGUF | Modelo médico conocido, mayor tamaño y licencia más restrictiva |
| BioMistral-7B | 7 B | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en dominio biomédico, mayor tamaño |

La comparación se ofrece a título orientativo; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta castellano ni otros idiomas según el campo `language`.
- Riesgo elevado de alucinación en dominio médico: un modelo de 4,4 B parámetros no debe usarse para diagnóstico, prescripción ni decisiones clínicas sin supervisión de un profesional sanitario.
- No es un dispositivo médico: no se ha validado regulatoriamente (CE, FDA) y no debe presentarse como tal.
- Sesgos potenciales: el dataset de conversaciones médicas puede reflejar sesgos demográficos, culturales o de práctica clínica; no se documenta ningún análisis de sesgo.
- Limitaciones de contexto: la longitud de contexto no está publicada; conviene verificarla en el modelo base antes de diseñar aplicaciones con historiales largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso en salud puede estar sujeto a normativa adicional (RGPD, MDR) que el usuario debe cumplir.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para uso médico se recomienda Q5_K_M o superior.
- El repositorio es una cuantización de terceros: la responsabilidad sobre el modelo original recae en vmal, y no se garantiza paridad exacta con los pesos originales.
- No hay información sobre tool calling, modo de pensamiento ni agentes; no asumir estas capacidades sin verificación empírica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/med-advisor-conversation-4B-GGUF
- Modelo base: https://huggingface.co/vmal/med-advisor-conversation-4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/med-advisor-conversation-4B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#med-advisor-conversation-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
