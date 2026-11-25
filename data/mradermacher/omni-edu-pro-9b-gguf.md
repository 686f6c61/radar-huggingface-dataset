# mradermacher/Omni-Edu-Pro-9B-GGUF

## Resumen

Omni-Edu-Pro-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8.953.803.264 según los pesos en safetensors) especializado en educación, concretamente en tutoría para niveles K-12. Está desarrollado por el usuario lhpku20010120 y esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su ejecución en hardware de consumo mediante llama.cpp y derivados.

El modelo parte de una arquitectura transformer multimodal (incluye un proyector mmproj para entrada de imágenes) y declara un entrenamiento basado en aprendizaje por refuerzo con PPO, además de un enfoque de "curriculum-grounding" que sugiere alineación con contenidos curriculares. Los tags de la model card indican capacidades multimodales y de conversación, y el pipeline declarado en Hugging Face es reinforcement-learning.

Esta ficha es relevante porque el modelo original no publica en la información disponible detalles sobre contexto, datos de entrenamiento ni resultados de benchmarks, y la versión GGUF de mradermacher ofrece un abanico de cuantizaciones (desde Q2_K de 4,0 GB hasta f16 de 18,0 GB) que permiten desplegarlo en estaciones de trabajo modestas. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte idiomático declarado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (incluye proyector mmproj para visión); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 83,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer multimodal con un proyector de visión (mmproj) y que el pipeline declarado es de aprendizaje por refuerzo. Los tags indican entrenamiento con PPO (Proximal Policy Optimization) y un enfoque de "curriculum-grounding", lo que sugiere que el ajuste se orientó a alinear las respuestas con contenidos curriculares de educación K-12. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de SFT o DPO.

El dataset asociado es lhpku20010120/Omni-Edu-Pro, del mismo autor. La model card de la versión GGUF no aporta información sobre innovaciones técnicas como decodificación especulativa o atención lineal; únicamente documenta el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1) y advierte de que no se han generado cuantizaciones ponderadas/imatrix. El repositorio incluye un proyector multimodal separado, lo que confirma la capacidad de procesar imágenes además de texto.

## Capacidades

- Generación de texto conversacional orientada a tutoría educativa.
- Procesamiento multimodal: el proyector mmproj permite entrada de imágenes junto con texto.
- Razonamiento guiado por currículo ("curriculum-grounding") según los tags del autor.
- Ajuste mediante aprendizaje por refuerzo (PPO) para alinear respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo "thinking" explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Tutoría de matemáticas de primaria y secundaria: el modelo puede resolver y explicar paso a paso ejercicios de aritmética, álgebra o geometría, adaptando el nivel de detalle al curso indicado en el prompt, gracias a su orientación a K-12.
- Apoyo a la comprensión lectora: dado un texto y una imagen de un ejercicio (por ejemplo, un fragmento de libro escaneado), el modelo puede responder preguntas sobre el contenido aprovechando el proyector multimodal.
- Generación de material didáctico: creación de preguntas de repaso, resúmenes y explicaciones alternativas para un mismo concepto, útil para profesores que preparan materiales en inglés.
- Asistente de deberes con contexto visual: el usuario sube una foto de un problema y el modelo lo transcribe y lo resuelve, un flujo habitual en aplicaciones de estudio móviles.
- Práctica de conversación guiada en inglés: simulaciones de diálogo para estudiantes que necesitan practicar expresión escrita con retroalimentación inmediata.
- Despliegue local en centros educativos con presupuesto limitado: las cuantizaciones Q4_K_M (5,8 GB) o Q5_K_M (6,6 GB) permiten ejecutar el modelo en una GPU de consumo de 8-12 GB de VRAM, sin depender de servicios en la nube y manteniendo la privacidad de los datos de los alumnos.
- Evaluación automática de respuestas abiertas: con un prompt adecuado, el modelo puede puntuar y comentar respuestas de estudiantes en inglés, integrándose en un pipeline de corrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB (Q2_K), 5,5-5,8 GB (Q4_K_S / Q4_K_M), 6,6 GB (Q5_K_M), 9,6 GB (Q8_0) y 18,0 GB (f16), a los que hay que sumar 0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las cuantizaciones altas; A100/H100 para despliegues concurrentes con f16.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en tarjetas de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros clientes compatibles con GGUF; los endpoints de Hugging Face aparecen como compatibles en los tags.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas educativas directamente comparables en la información proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~9B en formato GGUF, pero sin cifras de benchmarks la comparación sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Omni-Edu-Pro-9B (esta ficha) | ≈8,95 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Alternativas educativas de ~9B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano no está garantizado y probablemente degrade la calidad.
- No se publican datos sobre sesgos, dataset de entrenamiento ni evaluación de alucinación; en un contexto educativo, una respuesta incorrecta puede tener consecuencias directas en el aprendizaje del alumno.
- La longitud de contexto no está documentada, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- Al ser una cuantización estática sin imatrix, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso educativo.
- La licencia Apache 2.0 permite uso comercial, pero el autor original no ofrece garantías ni soporte; conviene verificar la procedencia y calidad del dataset antes de un despliegue en producción.
- El repositorio GGUF ocupa 83,4 GB, por lo que la descarga completa de todas las cuantizaciones es costosa; descargar solo el archivo necesario.
- No hay información sobre tool calling ni comportamiento agéntico, por lo que no debe asumirse su fiabilidad en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Omni-Edu-Pro-9B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-Pro-9B
- Dataset: https://huggingface.co/datasets/lhpku20010120/Omni-Edu-Pro
- Página de descargas del cuantizador: https://hf.tst.eu/model#Omni-Edu-Pro-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
