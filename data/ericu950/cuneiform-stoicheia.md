# Ericu950/cuneiform-stoicheia

## Resumen

cuneiform-stoicheia es un modelo publicado en Hugging Face por el usuario Ericu950, orientado al procesamiento de escritura cuneiforme a nivel de signo (sign-level model). Con 99.401.472 parámetros y un repositorio de 0,4 GB en formato safetensors, se trata de un modelo de tamaño medio cuyo propósito declarado es trabajar con la unidad mínima de la escritura cuneiforme, lo que lo sitúa en el ámbito de la filología digital y el procesamiento de lenguas antiguas.

La información pública disponible es muy limitada: la model card apenas contiene una línea descriptiva ("Sign-level model for cuneiform. Documentation to follow.") y no se especifican arquitectura, datos de entrenamiento, idiomas ni resultados de evaluación. El modelo se distribuye con licencia CC BY-SA 4.0 para pesos, vocabulario y ejemplos, mientras que el paquete Python empaquetado se licencia bajo MIT.

Su relevancia actual es acotada pero específica: cubre un nicho poco atendido por los modelos generalistas, como es el tratamiento computacional de tablillas cuneiformes (sumerio, acadio, hitita, etc.), donde las herramientas de PLN convencionales no funcionan bien por la naturaleza logo-silábica del sistema de escritura y la fragmentación de los corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 99.401.472 |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-sa-4.0 (pesos, vocabulario y ejemplos); MIT (paquete Python) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. El nombre del repositorio y las etiquetas sugieren un modelo especializado en cuneiforme a nivel de signo, pero se desconoce si emplea un transformer estándar, una arquitectura encoder-only, un modelo secuencial o alguna variante híbrida. Tampoco se detallan el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO.

La única indicación técnica concreta es el recuento de parámetros (99,4 M) y el formato de pesos (safetensors con PyTorch), lo que apunta a un modelo ligero, probablemente entrenable y desplegable en hardware modesto. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.) carecería de respaldo documental.

## Capacidades

- Procesamiento de escritura cuneiforme a nivel de signo, según la descripción del autor.
- Generación o clasificación sobre secuencias de signos cuneiformes (la tarea exacta no está especificada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se indica qué lenguas antiguas cubre (sumerio, acadio, hitita, etc.).
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Transcripción asistida de tablillas cuneiformes: el modelo podría emplearse para convertir secuencias de signos en representaciones normalizadas o transliteraciones, apoyando el trabajo de asiriólogos sobre corpus digitalizados.
- Anotación de signos en proyectos de filología digital: integrado en pipelines de procesamiento de colecciones como CDLI, podría ayudar a etiquetar o completar signos en tablillas fragmentadas.
- Búsqueda y recuperación en corpus cuneiformes: al operar a nivel de signo, permitiría indexar y comparar pasajes por similitud de secuencias, útil para localizar paralelos textuales.
- Investigación en lingüística histórica: sirve como base para experimentos sobre distribución y frecuencia de signos en distintos períodos y géneros textuales.
- Docencia y divulgación: un modelo ligero de 99 M de parámetros puede ejecutarse en hardware de consumo para demostraciones interactivas sobre escritura cuneiforme.
- Preprocesamiento para modelos mayores: podría actuar como componente especializado de tokenización o normalización de signos antes de pasar el texto a un modelo de lenguaje de mayor tamaño.

En todos los casos, la falta de documentación obliga a validar empíricamente el comportamiento antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo para pesos (99,4 M × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: alrededor de 0,2 GB para pesos; en cuantización de 8 bits, unos 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors, puede cargarse con `transformers` o PyTorch nativo si la arquitectura es compatible; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de procesamiento de cuneiforme a nivel de signo con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe arquitectura, datos, tareas ni evaluación, lo que impide conocer su comportamiento real.
- Riesgo elevado de alucinación o salidas incorrectas en cualquier tarea generativa, al no existir validación publicada.
- Se desconoce qué lenguas y períodos cubre, así como la composición y calidad del corpus de entrenamiento.
- Sesgos desconocidos: sin información sobre los datos, no es posible evaluar sesgos históricos, de género o de género textual.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- El paquete Python se distribuye bajo MIT, pero esa licencia no cubre los pesos ni el vocabulario.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (2026-11-20) y no registra descargas ni likes, lo que sugiere un proyecto incipiente.

## Enlaces

- [Hugging Face: Ericu950/cuneiform-stoicheia](https://huggingface.co/Ericu950/cuneiform-stoicheia)
