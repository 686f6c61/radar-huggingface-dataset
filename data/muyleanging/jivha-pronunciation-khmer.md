# muyleanging/Jivha-Pronunciation-Khmer

## Resumen

Jivha-Pronunciation-Khmer (Jivhā, "lengua" en jemer) es un repositorio de Hugging Face del autor muyleanging destinado a alojar un futuro modelo de corrección de pronunciación para aprendices de jemer (khmer). Según la model card, el objetivo es escuchar a un estudiante leyendo jemer en voz alta, marcar las sílabas pronunciadas incorrectamente y reproducir el sonido correcto mediante el modelo de síntesis de voz VoxPocket del mismo autor. Forma parte de una familia de herramientas del mismo desarrollador (Sota para ASR, Chakkhu para OCR, Tossana para captioning, Akkhara para teclado y VoxPocket para TTS).

El repositorio se encuentra en estado de trabajo en curso: la propia model card indica explícitamente que todavía no contiene pesos ("no model weights here yet") y que el primer modelo se publicará cuando esté entrenado y probado. El diseño previsto se apoya en el encoder de Sota (mismo pipeline de audio y tokens de clúster) con puntuación por clúster, comparando lo escuchado con lo esperado.

Por tanto, esta ficha describe un proyecto anunciado y no un modelo operativo. No hay arquitectura implementada, parámetros, contexto, benchmarks ni pesos disponibles; cualquier evaluación práctica es imposible en la fecha de creación del repositorio (12 de noviembre de 2026 según los metadatos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (prevista: encoder de Sota con puntuación por clúster) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona ONNX y despliegue on-device como tag, sin detalle) |
| Idiomas soportados | jemer (km) |
| Licencia | jivha-tbd (licencia "other", pendiente de decidir con la primera release) |
| Formato de pesos | no disponible (tag onnx; sin pesos publicados) |

## Arquitectura y entrenamiento

No hay arquitectura implementada ni pesos publicados. La model card describe un diseño previsto: reutilizar el encoder del modelo Sota-ASR-Khmer-ONNX, con el mismo pipeline de audio y los mismos tokens de clúster, y añadir una capa de puntuación por clúster que compare la pronunciación detectada con la esperada. La corrección se cerraría reproduciendo el sonido correcto con VoxPocket-TTS-Khmer.

No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni uso de RLHF/DPO. La tabla de estado del repositorio marca "Learner recordings with mistakes" como "planned" y "First model" como "soon", lo que confirma que ni siquiera el corpus de grabaciones de aprendices con errores está disponible todavía.

## Capacidades

- Ninguna capacidad operativa disponible: no hay pesos publicados.
- Capacidad prevista: detección de errores de pronunciación a nivel de sílaba en lectura de jemer.
- Capacidad prevista: puntuación por clúster (comparación entre audio escuchado y audio esperado).
- Capacidad prevista: reproducción del sonido correcto mediante integración con VoxPocket (TTS).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; el único idioma declarado es jemer (km).
- Capacidades especiales (thinking mode, vision, audio): solo audio, y únicamente como objetivo de diseño.

## Casos de uso

- Aprendizaje de jemer para adultos: el modelo, cuando exista, escucharía la lectura en voz alta del estudiante y señalaría las sílabas mal pronunciadas, permitiendo práctica autónoma sin tutor presencial.
- Alfabetización infantil en jemer: apoyo a niños que están aprendiendo a leer, con retroalimentación inmediata sílaba a sílaba y reproducción del sonido correcto.
- Mantenimiento de la lengua en diáspora: uso por parte de jemer hablantes fuera de Camboya que quieren conservar o recuperar una pronunciación precisa.
- Integración en aplicaciones educativas on-device: el tag onnx y on-device sugiere despliegue local en dispositivos de gama baja, útil en entornos con conectividad limitada.
- Complemento a pipelines de ASR: al compartir encoder con Sota, podría reutilizarse la infraestructura de audio existente para añadir una capa de evaluación de pronunciación.
- Evaluación formativa en aulas: puntuación automática por sílaba para profesores que necesitan retroalimentación objetiva y escalable sobre la lectura de muchos alumnos.

Ninguno de estos casos es ejecutable hoy: son escenarios previstos según la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (sin pesos ni arquitectura definida).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tag on-device sugiere orientación a despliegue local, pero sin datos concretos.
- Opciones de despliegue: se menciona ONNX como formato previsto; no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de corrección de pronunciación para jemer, ni se dispone de especificaciones del propio modelo para establecer una comparación.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es usable para inferencia ni evaluación.
- La licencia está sin decidir ("jivha-tbd"), por lo que no se puede confirmar el uso comercial.
- El único idioma declarado es jemer; no hay soporte multilingüe previsto.
- No hay datos sobre sesgos, riesgo de alucinación, robustez ante acentos o ruido ambiental.
- El diseño depende de dos modelos del mismo autor (Sota y VoxPocket); su disponibilidad y calidad condicionan el resultado final.
- La fecha de creación del repositorio (2026) y la ausencia de descargas o likes indican un proyecto en fase muy temprana, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muyleanging/Jivha-Pronunciation-Khmer
- Modelo ASR relacionado (Sota): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Modelo TTS relacionado (VoxPocket): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Modelo de captioning relacionado (Tossana): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Proyecto OCR relacionado (Chakkhu): https://muyleanging.github.io/chakkhu-web/
- Proyecto de teclado relacionado (Akkhara): https://muyleanging.github.io/akkhara-web/
