# Brunobkr/OFFFELLIA_LFM-2.5-2.6B-heretic.gguf

## Resumen

`Brunobkr/OFFFELLIA_LFM-2.5-2.6B-heretic.gguf` es un repositorio de pesos en formato GGUF publicado por el usuario Brunobkr en Hugging Face. Por la nomenclatura del propio identificador, apunta a una variante derivada de un modelo base de la familia LFM de aproximadamente 2.600 millones de parámetros, con el sufijo «heretic», asociado habitualmente en la comunidad a procesos de ablación o desinhibición (modelos «uncensored»). No obstante, la model card publicada no describe el modelo en sí.

El repositorio no aporta información técnica verificable sobre el modelo: no se indica pipeline, licencia, idiomas ni arquitectura. La model card es, en realidad, la documentación de un fork de `llama.cpp` (denominado ΩFFFΣLLIa) orientado a inferencia local y agentes autónomos, sin datos sobre el modelo alojado. El repositorio ocupa 14,0 GB, un tamaño muy superior al de un único archivo de pesos de 2,6B, lo que sugiere que contiene múltiples cuantizaciones o archivos adicionales.

Dado que el modelo no registra descargas ni «likes» y que su documentación es prácticamente inexistente, debe tratarse como un artefacto no verificado. Esta ficha recoge únicamente lo que puede confirmarse y marca explícitamente como «no disponible» todo aquello que no figura en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base LFM, sin confirmar) |
| Parametros totales | ~2.600 millones (inferido del identificador, no confirmado) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (contiene al menos un archivo GGUF; el repo ocupa 14,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona MIT, pero referido al fork de llama.cpp, no al modelo) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El identificador sugiere una base de la familia LFM, pero la model card no confirma arquitectura, número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta el proceso de cuantización ni qué método se empleó para generar el archivo GGUF.

El sufijo «heretic» podría indicar un proceso de ablación de rechazos (abliteración) orientado a reducir las negativas del modelo, práctica habitual en la comunidad, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

No se ha publicado información verificable sobre las capacidades del modelo en la información disponible. La model card no describe tareas soportadas, soporte de tool calling, capacidades de agente, multilingüismo ni modos especiales (thinking, visión o audio). Cualquier afirmación al respecto sería especulativa.

## Casos de uso

Dado que no se documentan capacidades específicas, los siguientes escenarios son únicamente hipótesis razonables para un modelo denso de ~2,6B cuantizado en GGUF y ejecutable en local. No deben tomarse como casos validados:

- Generación de texto local en equipos sin GPU dedicada: un modelo de este tamaño en cuantización de 4 bits puede ejecutarse en CPU con `llama.cpp`, lo que permitiría prototipado offline, aunque sin garantías de calidad al no existir evaluaciones publicadas.
- Asistentes de escritorio o herramientas personales: integrable en aplicaciones de escritorio mediante Ollama o `llama.cpp` para tareas de resumen o redacción, siempre que se valide previamente su comportamiento real.
- Clasificación y etiquetado de texto a pequeña escala: útil para pipelines de procesamiento por lotes donde el coste por token importa y la precisión no es crítica.
- Prototipado rápido de aplicaciones de chat: su tamaño reducido permite iterar en local sin depender de APIs externas, aunque su calidad conversacional no está documentada.
- Experimentación con modelos «desinhibidos»: si el sufijo «heretic» corresponde a una ablación real, podría interesar a investigadores que estudian el efecto de la alineación sobre el comportamiento del modelo. Requiere verificación empírica.
- Fine-tuning posterior o destilación: al ser un modelo pequeño, puede servir como base o como generador de datos sintéticos en experimentos académicos, sujeto a que la licencia real lo permita (actualmente no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el tamaño nominal de ~2,6B parámetros y en cuantizaciones GGUF estándar. No proceden de documentación del autor:

- VRAM estimada para inferencia (solo pesos):
  - Q4_K_M: en torno a 1,6-1,8 GB.
  - Q5_K_M: en torno a 1,9-2,1 GB.
  - Q6_K: en torno a 2,2-2,4 GB.
  - Q8_0: en torno a 2,8-3,0 GB.
  - F16: en torno a 5,2 GB.
- GPU recomendadas: cabe holgadamente en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090). Para despliegue batch o contextos muy largos se recomienda una A100 o H100, aunque no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 6 GB o más de VRAM, e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python`, Jan. Compatible con vLLM solo si soporta la arquitectura subyacente (no confirmado).
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 2,6B en Q4 sobre una RTX 4090 suele superar los 100 tokens/s, pero no hay mediciones publicadas para este repositorio concreto.

## Comparativa con modelos similares

La comparación es limitada porque no hay datos verificables del modelo evaluado. Se incluyen alternativas de tamaño similar ampliamente documentadas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OFFFELLIA_LFM-2.5-2.6B-heretic | ~2,6B (inferido) | no disponible | no disponible | GGUF, Hugging Face |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | pesos originales + GGUF |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 (variantes) | pesos originales + GGUF |
| Phi-3.5-mini Instruct | 3,8B | 128K | MIT | pesos originales + GGUF |

Los datos de los modelos comparativos corresponden a información pública ampliamente conocida; los del modelo evaluado no pueden contrastarse con la documentación aportada.

## Limitaciones y advertencias

- Model card inexistente en la práctica: la documentación publicada describe un fork de `llama.cpp`, no el modelo. No hay información sobre arquitectura, entrenamiento ni evaluación.
- Licencia no declarada para el modelo: la mención a MIT en la model card se refiere al fork de software, no a los pesos. No se puede confirmar el uso comercial.
- Riesgo de alucinación desconocido: sin benchmarks ni evaluaciones, no puede estimarse la fiabilidad del modelo.
- Sesgos desconocidos: no se documenta el dataset de entrenamiento ni procesos de alineación, por lo que no es posible evaluar sesgos.
- El sufijo «heretic» sugiere una posible ablación de rechazos: si se confirma, el modelo podría producir contenido inapropiado y no es recomendable para aplicaciones orientadas al usuario final sin filtros adicionales.
- Idiomas no especificados: no hay garantía de soporte de castellano ni de ningún otro idioma concreto.
- Sin descargas ni validación comunitaria: el repositorio no presenta evidencia de uso o verificación por terceros.
- Fecha de creación registrada como 2026-09-22, posterior a la fecha de consulta: conviene verificar la coherencia del repositorio antes de usarlo.
- Repositorio de 14,0 GB: probable presencia de múltiples archivos; conviene revisar la lista completa antes de descargar para evitar consumir espacio innecesario.

## Enlaces

- Hugging Face: https://huggingface.co/Brunobkr/OFFFELLIA_LFM-2.5-2.6B-heretic.gguf
- Fork de llama.cpp referenciado en la model card: https://github.com/brunoconta1980-tech/llama_OFFFELLIA_1984
- Repositorio ROCmFPX citado en la model card: https://github.com/charlie12345/ROCmFPX
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda proporcionados.
