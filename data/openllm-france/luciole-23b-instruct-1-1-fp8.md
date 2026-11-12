# OpenLLM-France/Luciole-23B-Instruct-1.1-FP8

## Resumen

Luciole-23B-Instruct-1.1-FP8 es la versión cuantizada en FP8 del modelo instructivo Luciole-23B-Instruct-1.1, desarrollado por LINAGORA dentro del consorcio OpenLLM-France (proyecto France2030 financiado por Bpifrance). Se trata de un modelo de generación de texto orientado a conversación, con especial foco en francés e inglés, construido sobre una arquitectura de tipo Nemotron y con 23.216.467.968 parámetros totales según los pesos en safetensors.

La relevancia de esta variante radica en su formato de cuantización: emplea compressed-tensors (Neural Magic) y fue cuantizado con LLM Compressor (vLLM), lo que permite servir el modelo con vLLM aprovechando aceleración FP8 nativa en GPUs NVIDIA Hopper, Ada Lovelace o Blackwell. Esto reduce los requisitos de VRAM respecto al modelo en precisión completa (el repositorio ocupa 24,8 GB) manteniendo el comportamiento instructivo del modelo base.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está pensado para despliegues de inferencia en producción donde el francés sea un idioma prioritario. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Nemotron (tag `nemotron`); detalles internos no disponibles |
| Parametros totales | 23.216.467.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato compressed-tensors); no se documentan otras variantes en esta ficha |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Nemotron, según la etiqueta `nemotron` del repositorio, con 23.216.467.968 parámetros totales. Esta variante FP8 se ha obtenido cuantizando el modelo base OpenLLM-France/Luciole-23B-Instruct-1.1 mediante LLM Compressor y almacenando los pesos en formato compressed-tensors, un esquema diseñado para ser consumido directamente por vLLM. No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación técnica destacable de esta versión es la cuantización FP8 con aceleración nativa en hardware NVIDIA Hopper, Ada Lovelace y Blackwell, lo que permite reducir la huella de memoria y aumentar el throughput en inferencia. El modelo está pensado para servirse con vLLM (`vllm serve OpenLLM-France/Luciole-23B-Instruct-1.1-FP8`). No se documentan en la información disponible otras técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional multi-turno, con orientación instructiva.
- Soporte principal de francés e inglés, según los metadatos de idioma del repositorio.
- Uso previsto como modelo de chat/asistente en pipelines de generación de texto.
- Compatibilidad con el stack vLLM y el formato compressed-tensors para despliegue eficiente en FP8.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia conversacional en francés: el modelo puede gestionar diálogos multi-turno en francés e inglés, lo que lo hace adecuado para asistentes virtuales dirigidos al mercado francófono.
- Atención al cliente automatizada: su naturaleza instructiva y su soporte de francés permiten desplegarlo como backend de chatbots de soporte en organizaciones francófonas.
- Generación y resumen de documentos en francés: útil para tareas de redacción asistida, resumen y reescritura en entornos corporativos francófonos.
- Despliegue de inferencia de bajo coste con vLLM: la cuantización FP8 y el formato compressed-tensors permiten servirlo en GPUs con soporte FP8 nativo reduciendo VRAM frente al modelo en precisión completa.
- Investigación en PLN francés: sirve como base para experimentos y evaluación de modelos abiertos en francés bajo licencia Apache 2.0.
- Prototipado de aplicaciones bilingües fr/en: al cubrir ambos idiomas, puede emplearse en productos que requieran alternancia de idioma sin cambiar de modelo.
- Integración en pipelines de generación de texto en producción: su compatibilidad con vLLM facilita el despliegue como servicio HTTP de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 24,8 GB en FP8, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: NVIDIA Hopper (H100), Ada Lovelace (L40S, RTX 4090) o Blackwell, ya que la aceleración FP8 requiere soporte nativo de FP8.
- GPU de consumo: es plausible en GPUs consumer con soporte FP8 como la RTX 4090 (24 GB), aunque el margen de VRAM es ajustado y no se documenta oficialmente; no disponible confirmación del autor.
- Opciones de despliegue: vLLM es el método recomendado por el autor (`vllm serve`). No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Instruct-1.1-FP8 | 23,2 B | no disponible | Apache 2.0 | safetensors (FP8) | Enfoque fr/en, servido con vLLM |
| Luciole-23B-Instruct-1.1 (base) | 23,2 B | no disponible | Apache 2.0 | safetensors | Versión sin cuantizar del mismo modelo |
| Alternativas de ~20-30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo habitual de los modelos generativos instructivos.
- Idiomas: soporte declarado únicamente de francés e inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar casos de uso con entradas largas.
- Hardware: la aceleración FP8 requiere GPUs con soporte nativo (Hopper, Ada Lovelace, Blackwell); en hardware sin FP8 el rendimiento puede degradarse o requerir conversión de pesos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del proyecto France2030 y las atribuciones requeridas (Copyright LINAGORA SAS).
- Producción: al ser una cuantización, puede existir una ligera pérdida de calidad frente al modelo base; no se documenta la magnitud de dicha degradación.

## Enlaces

- Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-23B-Instruct-1.1-FP8
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Instruct-1.1
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
