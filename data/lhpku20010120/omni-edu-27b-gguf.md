# lhpku20010120/Omni-Edu-27B-GGUF

## Resumen

Omni-Edu-27B es un modelo fundacional multimodal de 27.000 millones de parámetros desarrollado por el grupo OmniEdu (OpenDCAI / haolpku) y orientado específicamente al ciclo completo de aprendizaje y enseñanza en educación K-12. Integra conocimiento de materias, alineación curricular, diagnóstico del alumno y andamiaje pedagógico en un único modelo, y se distribuye en tres escalas (4B, 9B y 27B) en BF16 y FP8. La ficha que nos ocupa es la conversión a GGUF del checkpoint de 27B, publicada por el usuario `lhpku20010120` y pensada para su ejecución con llama.cpp.

El modelo parte de una base Qwen (la documentación disponible cita Qwen3.8-27B como punto de partida) y conserva la torre visual, de ahí su pipeline `image-text-to-text`. El contexto declarado es de 32.768 tokens. La relevancia actual radica en que cubre una demanda poco atendida por los modelos generalistas: razonamiento pedagógico con fundamento curricular, corrección de ejercicios y diagnóstico de errores del estudiante, con licencia de tipo "other" que obliga a revisar los términos del modelo upstream.

Esta ficha describe la variante cuantizada en GGUF, que incluye pesos en BF16, Q8_0, Q6_K y Q4_K_M, además de un proyector multimodal independiente en F16. No se han publicado datos de benchmarks ni listado de idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre visual + LLM base Qwen, según documentación del proyecto) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los términos del modelo upstream) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo multimodal transformer con torre visual y un LLM base de la familia Qwen, con 26,9B parámetros totales y un contexto de 32.768 tokens. El proyecto OmniEdu declara que los modelos están diseñados para conectar conocimiento curricular, resolución de problemas, diagnóstico del alumno y soporte instruccional. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación destacable del proyecto es el enfoque en el "learning-teaching loop" completo de K-12: no solo resuelve problemas, sino que se entrena para diagnosticar errores y proporcionar andamiaje pedagógico. La conversión a GGUF se ha realizado con llama.cpp e incluye un proyector multimodal separado (`mmproj-OmniEdu-27B-F16.gguf`) compartido por las cuatro cuantizaciones, lo que permite entrada de imágenes en todas ellas.

## Capacidades

- Generación de texto y razonamiento sobre contenidos curriculares de K-12.
- Resolución de problemas de matemáticas, ciencias y otras materias escolares.
- Comprensión de imágenes (image-text-to-text): lectura de enunciados, diagramas y ejercicios escaneados.
- Diagnóstico de errores del estudiante y explicación de pasos intermedios.
- Soporte pedagógico: generación de explicaciones graduadas y pistas.
- Conversación multi-turno (tag `conversational`).
- Compatible con endpoints OpenAI (`endpoints_compatible`) a través de `llama-server`.
- Modo de razonamiento conmutable (`--reasoning off` en el ejemplo de ejecución).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Tutoría automatizada de matemáticas: el modelo puede recibir una foto del ejercicio resuelto por el alumno y devolver un diagnóstico del error paso a paso, aprovechando la torre visual y el contexto de 32K para mantener el hilo de la conversación.
- Corrección de exámenes con enunciados escaneados: al aceptar entrada de imagen, permite procesar hojas de problemas en lote y generar feedback individualizado sin transcripción manual previa.
- Generación de material didáctico alineado con el currículo: producción de problemas, pistas graduadas y explicaciones adaptadas al nivel, apoyándose en el entrenamiento específico en alineación curricular.
- Asistente para docentes en planificación de clases: borradores de secuencias didácticas y preguntas de evaluación a partir de un tema y un nivel educativo dados.
- Despliegue local en centros educativos con requisitos de privacidad: la versión Q4_K_M (15,41 GiB) permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, evitando enviar datos de menores a servicios en la nube.
- Chatbot de refuerzo en plataformas de e-learning: integrable vía API compatible con OpenAI (`llama-server` expone `/v1`), lo que facilita conectarlo a frontends existentes como Cherry Studio.
- Análisis de diagramas y figuras científicas: la torre visual permite interpretar gráficos de física, química o biología incluidos en los enunciados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y proyector):
  - BF16: 50,11 GiB de pesos; requiere ~52-56 GiB de VRAM.
  - Q8_0: 26,63 GiB de pesos; requiere ~28-32 GiB de VRAM.
  - Q6_K: 20,57 GiB de pesos; requiere ~22-26 GiB de VRAM.
  - Q4_K_M: 15,41 GiB de pesos; requiere ~17-20 GiB de VRAM.
  - Sumar el proyector multimodal F16 (`mmproj-OmniEdu-27B-F16.gguf`) en todos los casos.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o L40S 48 GB para Q8_0; RTX 4090 24 GB para Q6_K; RTX 4090 24 GB o RTX 3090 24 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q6_K sobre GPUs de 24 GB; Q4_K_M podría ajustarse en GPUs de 16 GB con contexto reducido y offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión cualquier frontend compatible con la API OpenAI servida en `/v1` (Cherry Studio, etc.). vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omni-Edu-27B (GGUF) | 26,9B | 32.768 | Texto + imagen | other | GGUF en HF |
| Omni-Edu-9B | ~9B (según proyecto) | no disponible | Texto + imagen | other | BF16/FP8 en HF |
| Omni-Edu-4B | ~4B (según proyecto) | no disponible | Texto + imagen | other | BF16/FP8 en HF |

Las alternativas comparables dentro de la misma familia son las escalas 4B y 9B del propio proyecto OmniEdu, que permiten desplegar el mismo comportamiento pedagógico con menor coste de hardware. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos generalistas de tamaño similar.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos del modelo upstream (`lhpku20010120/Omni-Edu-27B`) antes de cualquier uso comercial; la model card delega explícitamente en dichos términos.
- El modelo está especializado en K-12: su rendimiento fuera de dominios educativos puede ser inferior al de modelos generalistas del mismo tamaño.
- No se ha publicado información sobre sesgos, composición del dataset ni evaluación de seguridad, lo que dificulta auditar riesgos en producción.
- Riesgo de alucinación en la resolución de problemas: sin benchmarks publicados no es posible cuantificar la fiabilidad de las respuestas matemáticas o científicas.
- Idiomas soportados no documentados: no se puede asumir un comportamiento multilingüe correcto, especialmente en castellano.
- La model card no documenta el proceso de cuantización más allá de los parámetros empleados; las cuantizaciones Q4_K_M pueden degradar tareas de razonamiento matemático fino.
- El repositorio ocupa 122 GB y las descargas de BF16 superan los 50 GiB: conviene planificar el almacenamiento antes de clonar.
- La fecha de creación del repositorio (2026-11-02) y el número reducido de likes (1) sugieren un modelo reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face (esta versión GGUF): https://huggingface.co/lhpku20010120/Omni-Edu-27B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/lhpku20010120/Omni-Edu-27B
- Versión GGUF del proyecto original: https://huggingface.co/OpenDCAI/Omni-Edu-27B-GGUF
- Página del proyecto: https://haolpku.github.io/Omni-Edu/
- Repositorio GitHub: https://github.com/haolpku/Omni-Edu
- Ficha en Featherless AI: https://featherless.ai/models/lhpku20010120/Omni-Edu-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
