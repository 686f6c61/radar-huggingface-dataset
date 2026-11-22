# Mir2k/Qwen4-27B-abliterated-GGUF

## Resumen

Qwen4-27B-abliterated-GGUF es una publicación de cuantizaciones GGUF del modelo Qwen4-27B en su variante "abliterated", es decir, con las direcciones de rechazo eliminadas mediante técnicas de *abliteration* (ablación de direcciones en el espacio de activaciones). El repositorio lo mantiene el usuario Mir2k bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.).

La información publicada es extremadamente escasa: la model card únicamente indica que se están preparando cuantizaciones Q4_K_M, Q5_K_M y Q8_0 generadas con `llama.cpp` y verificadas mediante generación real antes de su publicación. No se detalla el modelo base exacto, la arquitectura, el número de parámetros reales, la longitud de contexto ni los idiomas soportados.

Por tanto, esta ficha debe interpretarse como una descripción del repositorio y de su estado, no como una especificación técnica verificada del modelo. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parámetros totales | no disponible (el nombre sugiere 27B, sin confirmar) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (en preparación según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre del repositorio sugiere que deriva de un modelo denominado Qwen4-27B, pero no se confirma en la model card ni se aportan detalles sobre tipo de transformer, atención, número de capas o dimensión oculta.

Tampoco se documenta el proceso de entrenamiento original ni el procedimiento exacto de *abliteration* aplicado. La model card solo menciona que las cuantizaciones GGUF se generan con `llama.cpp` y se verifican mediante generación real antes de publicarse, lo que indica un control de calidad básico del proceso de cuantización, pero no aporta información sobre datos de entrenamiento, RLHF/DPO ni innovaciones técnicas.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Razonamiento y código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Efecto del *abliteration*: se espera una reducción de los rechazos ante peticiones que el modelo base rechazaría, pero no se documenta el alcance ni las consecuencias.

## Casos de uso

- Inferencia local con llama.cpp: el formato GGUF y las cuantizaciones Q4_K_M, Q5_K_M y Q8_0 permiten ejecutar el modelo en equipos de consumo mediante llama.cpp, siempre que el tamaño real del modelo lo permita.
- Despliegue en Ollama o LM Studio: al ser GGUF, puede importarse en estos entornos para prototipado rápido y pruebas de generación de texto.
- Investigación sobre *abliteration*: útil para estudiar cómo afecta la eliminación de direcciones de rechazo al comportamiento del modelo en comparación con el modelo base.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas permiten medir la degradación de calidad entre Q4_K_M, Q5_K_M y Q8_0 en las mismas tareas.
- Pruebas de generación de texto en entornos sin GPU dedicada: las cuantizaciones bajas pueden ejecutarse en CPU, aunque el rendimiento dependerá del tamaño real del modelo.
- Experimentación con prompts que el modelo base rechazaría: el propósito declarado del *abliteration* es reducir los rechazos, por lo que puede usarse en estudios controlados sobre seguridad y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que no se confirma el número real de parámetros. Como referencia orientativa, un modelo de 27B en Q4_K_M suele requerir del orden de 16-18 GB, en Q5_K_M alrededor de 19-20 GB y en Q8_0 en torno a 28-30 GB, pero estas cifras no están confirmadas para este repositorio.
- GPU recomendadas: no disponible. Para un modelo de ese tamaño, serían necesarias GPUs con 24 GB o más (RTX 3090/4090, A100, H100) en cuantizaciones altas, o GPUs con 16-24 GB en cuantizaciones bajas.
- ¿Cabe en GPU de consumo? No confirmado; dependería del tamaño real y de la cuantización.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables con especificaciones verificables, ni se confirma la identidad del modelo base.

## Limitaciones y advertencias

- La información publicada es mínima: no se confirman arquitectura, parámetros, contexto ni idiomas.
- El *abliteration* reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; debe evaluarse antes de cualquier uso en producción.
- Riesgo de alucinación: no cuantificado, pero inherente a los modelos de lenguaje.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre el proceso de cuantización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las cuantizaciones están "en preparación", por lo que puede no haber artefactos finales disponibles.
- No se especifica el modelo base exacto, lo que dificulta la trazabilidad y la verificación de la licencia original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mir2k/Qwen4-27B-abliterated-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
