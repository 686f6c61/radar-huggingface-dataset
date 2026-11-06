# mradermacher/qwen27b-abliterated-final-GGUF

## Resumen

`mradermacher/qwen27b-abliterated-final-GGUF` es un conjunto de cuantizaciones GGUF estáticas del modelo `kernnadab/qwen27b-abliterated-final`, generadas por mradermacher. Se trata de una variante "abliterated" (se ha eliminado o atenuado el mecanismo de rechazo de contenido) de un modelo de la familia Qwen, distribuida exclusivamente en formato GGUF para inferencia local con llama.cpp y herramientas compatibles.

El repositorio no contiene pesos en safetensors ni información sobre la arquitectura interna, el entrenamiento o los datos utilizados; únicamente ofrece los ficheros cuantizados en 12 variantes que van de Q2_K (3,1 GB) a f16 (15,3 GB). El dato de parámetros reportado en la ficha de Hugging Face (7.615.616.512) corresponde a los tensores del modelo base, aunque el nombre del repositorio sugiere "27b", lo que apunta a una discrepancia no resuelta por el autor.

La relevancia de esta ficha es limitada y debe tratarse con cautela: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia, no publica benchmarks y su model card es una plantilla automática de cuantización sin información sustantiva sobre el modelo subyacente. Se documenta aquí lo que el autor expone, marcando explícitamente todo lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen, sin detallar) |
| Parametros totales | 7.615.616.512 (según safetensors del repo base); el nombre del repo indica "27b", discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (12 ficheros cuantizados) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `kernnadab/qwen27b-abliterated-final`. El nombre sugiere una variante de la familia Qwen sometida a un proceso de "abliteration", una técnica de modificación de pesos que busca eliminar la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo a ciertas peticiones. Sin embargo, el autor no documenta el método, los datos ni el proceso de entrenamiento empleados.

La model card del repositorio GGUF es una plantilla automática generada por la herramienta de cuantización de mradermacher: no incluye información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas. Los metadatos internos de la plantilla indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que se partió de un checkpoint en formato Hugging Face y se convirtió a GGUF antes de cuantizar. No se han generado cuantizaciones ponderadas ni con imatrix (el autor indica que no están disponibles y que podrían solicitarse mediante una discusión comunitaria).

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline declarado apuntan a un uso de chat, aunque no se detalla el formato de plantilla.
- Idiomas: únicamente se declara inglés (`en`); no hay evidencia de capacidades multilingües.
- Al ser una variante "abliterated", se espera que el modelo presente una menor tasa de rechazos ante peticiones que el modelo original rechazaría, si bien esto no está verificado ni documentado por el autor.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se dispone de información sobre capacidades de código o matemáticas.

## Casos de uso

- Experimentación local con modelos cuantizados: los ficheros GGUF permiten ejecutar el modelo en estaciones de trabajo con llama.cpp u Ollama sin necesidad de GPU de datacenter, gracias a las variantes de 3 a 8 GB.
- Investigación sobre "abliteration": útil para estudiar cómo cambia el comportamiento de rechazo respecto al modelo original, comparando respuestas entre variantes cuantizadas y el checkpoint base.
- Pruebas de integración en pipelines de inferencia: el formato GGUF es compatible con servidores compatibles con la API de OpenAI (`endpoints_compatible`), lo que facilita prototipos de chat.
- Evaluación de calidad de cuantización: las 12 variantes permiten medir la degradación de perplejidad entre Q2_K y Q8_0 en un mismo modelo.
- Despliegue en entornos con recursos limitados: la variante Q4_K_M (4,8 GB) es la recomendada por el autor como "fast, recommended" para uso general.
- Docencia y formación: el tamaño manejable de las cuantizaciones bajas permite demostrar el funcionamiento de modelos generativos en portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad comparativa entre cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, orientativo):
  - Q2_K (3,1 GB): ~4 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,6–4,2 GB): ~4,5–5 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (4,4–4,8 GB): ~5,5–6 GB.
  - Q5_K_S / Q5_K_M (5,4–5,5 GB): ~6,5 GB.
  - Q6_K (6,4 GB): ~7,5 GB.
  - Q8_0 (8,2 GB): ~9 GB.
  - f16 (15,3 GB): ~16 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones Q4 caben en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q6 y Q8 requieren 12–16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); f16 requiere 24 GB (RTX 3090/4090, A10, L4) o CPU.
- Cabe en GPU consumer: sí, al menos las variantes Q2 a Q5 en GPUs de 8–12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (según la etiqueta `endpoints_compatible`). No se indica compatibilidad con vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El autor no identifica el modelo base exacto ni ofrece comparaciones con alternativas de la misma categoría, y la discrepancia entre el nombre ("27b") y el recuento de parámetros del checkpoint (7,6 mil millones) impide establecer una comparación fiable con modelos de tamaño conocido.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base `kernnadab/qwen27b-abliterated-final`, que tampoco se documenta aquí.
- Discrepancia de tamaño: el nombre del repositorio indica "27b" pero el recuento de parámetros del checkpoint base es de 7,6 mil millones; conviene verificar antes de planificar recursos.
- Modelo "abliterated": la eliminación del comportamiento de rechazo puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no es apto para producción sin filtros adicionales.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Idiomas: solo se declara inglés; el rendimiento en castellano es desconocido.
- Sin benchmarks ni evaluación de calidad: no hay evidencia pública de rendimiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén documentados por la comunidad.
- Cuantizaciones sin imatrix ni ponderadas: el autor advierte que no las ha generado, por lo que la calidad de las variantes bajas (Q2_K, Q3_K_M) puede ser inferior a la de cuantizaciones ponderadas equivalentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen27b-abliterated-final-GGUF
- Modelo base: https://huggingface.co/kernnadab/qwen27b-abliterated-final
- Página de descargas del autor: https://hf.tst.eu/model#qwen27b-abliterated-final-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
