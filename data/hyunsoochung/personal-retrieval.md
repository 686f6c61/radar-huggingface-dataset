# hyunsoochung/personal-retrieval

## Resumen

`hyunsoochung/personal-retrieval` es un repositorio de Hugging Face publicado por el ingeniero Hyunsoo Chung (CUTBACK, estudiante de Ciencias de la Computación en la Universidad Nacional de Seúl) que contiene una implementación propia de una Swin Transformer en su variante "nano", orientada a tareas de recuperación (retrieval). El paquete incluye un fichero Python con el modelo y un punto de entrada de entrenamiento (`finetune.py`), un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que se describe explícitamente como checkpoint de inicialización, no como modelo entrenado.

El dato más importante para cualquier evaluador es que **no se trata de un modelo entrenado ni evaluado**. La propia model card indica que el checkpoint "es un punto de partida reproducible, no una release de modelo entrenado", que no se reclama ninguna puntuación de benchmark y que los pesos no han sido auditados en robustez, equidad ni transferencia de dominio. Los metadatos de safetensors reportan 33.088 parámetros totales, una cifra coherente con una variante "nano" recortada y no con una Swin-T estándar.

Por tanto, su relevancia actual es la de andamiaje reproducible para experimentos de retrieval multimodal: sirve para verificar que el pipeline de carga y el bucle de fine-tuning funcionan antes de invertir cómputo en un entrenamiento real. No debe confundirse con un modelo listo para producción ni con una alternativa a CLIP, SigLIP o similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (Swin T), variante "nano"; atención dispersa (sparse), fusión Tucker, activación Mish, normalización BatchNorm |
| Parametros totales | 33.088 (valor reportado en los metadatos de safetensors) |
| Longitud de contexto | no disponible (no aplica de forma directa; es un encoder de retrieval, no un modelo generativo) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en `safetensors`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y código PyTorch (`finetune.py`) |

Otros datos del repositorio: pipeline declarado en Hugging Face "no disponible", idiomas "no disponibles", 0 descargas y 0 likes en el momento de la consulta, tamaño de repositorio 0,0 GB (el checkpoint es de apenas unos cientos de kilobytes). Fecha de creación y de última actualización: 2026-10-08, con seis segundos de diferencia entre ambas, lo que sugiere una publicación automatizada.

## Arquitectura y entrenamiento

La arquitectura es una Swin Transformer de escala "nano" con atención dispersa en lugar de la ventana desplazada densa habitual, fusión de características mediante descomposición de Tucker, activación Mish y normalización por lotes (BatchNorm) en lugar de LayerNorm. Se trata de una implementación personalizada: la model card advierte que las API genéricas de carga automática (`AutoModel`, `from_pretrained` estándar) requieren un adaptador explícito antes de poder usarse con este repositorio.

En cuanto al entrenamiento, no hay ninguno documentado. El `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, y la receta incluida en `training_args.json` usa el optimizador RMSprop con un scheduler OneCycle, pero el propio autor aclara que "son valores de partida en el script, no evidencia de una ejecución completada". No se especifican número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. La guía de evaluación propuesta sugiere usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad equivalente, lo que confirma que la evaluación seria está todavía pendiente.

## Capacidades

- Extracción de representaciones visuales y/o multimodales para tareas de recuperación (retrieval), según la arquitectura declarada.
- Punto de entrada de fine-tuning ejecutable (`python finetune.py --help`) y bloque `__main__` con ejemplo de prueba de humo.
- Configuración de arquitectura explícita y reproducible en `config.json`, junto con receta de experimento en `training_args.json`.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas, visión generativa, audio ni cualquier otra capacidad de modelo fundacional.
- Sin soporte documentado de tool calling, function calling ni flujos de agentes.
- Sin capacidades multilingües declaradas.
- Sin modo de razonamiento (thinking mode) ni decodificación especulativa.
- Capacidad real hoy: servir de esqueleto verificable para montar un pipeline de retrieval antes de entrenar.

## Casos de uso

- Pruebas de humo de infraestructura: cargar el checkpoint y ejecutar `finetune.py` para verificar que el entorno (PyTorch, versiones de CUDA, rutas de datos) funciona antes de lanzar un entrenamiento costoso.
- Plantilla de investigación en retrieval multimodal: partir de `config.json` y `training_args.json` para reproducir una receta con RMSprop y OneCycle sobre un dataset propio, documentando después los resultados con semillas fijadas.
- Reproducción de líneas base: dado su tamaño reducido (33.088 parámetros), es adecuado como baseline de baja capacidad contra el que comparar variantes mayores con el mismo presupuesto de ajuste.
- Estudio de ablaciones de arquitectura: al ser código propio, permite sustituir atención dispersa, fusión Tucker, activación Mish o BatchNorm de forma aislada y medir el efecto en la métrica de retrieval.
- Ejercicio docente o de aprendizaje: implementación compacta y legible de una Swin Transformer para explicar mecanismos de atención por ventanas y fusión de características.
- Integración en pipelines de CI: el peso es de escala de kilobytes, por lo que puede descargarse y cargarse en cada job de integración continua como comprobación de que el código del repositorio no se ha roto.
- Evaluación metodológica sobre Flickr30k: escenario previsto por el autor para medir retrieval con al menos tres semillas y una línea base de capacidad equivalente.

Nota importante: ninguno de estos casos implica uso en producción para inferencia real, porque los pesos no están entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint de inicialización no ha sido entrenado ni auditado. Cualquier cifra que se viera atribuida a este repositorio debería considerarse no verificada.

## Requisitos de hardware

- VRAM para inferencia: prácticamente despreciable. Con `float32`, 33.088 parámetros ocupan alrededor de 130-135 KB de pesos, más activaciones y memoria del framework.
- GPU recomendadas: cualquier GPU funciona; el modelo cabe holgadamente incluso en iGPU y en CPU. No tiene sentido asignar una A100 o una H100 a este artefacto.
- Cabe en GPU de consumo: sí, en todas las gamas actuales (RTX 3060, RTX 4090, etc.) y también en CPU sin problema.
- Opciones de despliegue: no hay soporte estándar. Al ser una implementación propia, se requiere cargar el modelo desde `finetune.py` con un adaptador explícito. vLLM, TGI, llama.cpp y Ollama no aplican (no es un modelo generativo ni publica pesos en GGUF).
- Latencia y throughput: no disponibles. No se han publicado mediciones, y sin pesos entrenados no tendría sentido medirlas.

## Comparativa con modelos similares

La búsqueda web no devuelve alternativas equivalentes publicadas y entrenadas, sino repositorios hermanos generados a partir de la misma plantilla. Se comparan a continuación únicamente como referencia de ecosistema.

| Modelo | Arquitectura | Escala | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyunsoochung/personal-retrieval | Swin T, atención dispersa, fusión Tucker | nano, 33.088 parámetros | No (checkpoint de inicialización) | Apache 2.0 | Hugging Face, 0 descargas |
| Williamhru/personal-retrieval | CLIP | tiny | No (checkpoint de inicialización) | no disponible en la busqueda | Hugging Face |
| vihaanshah05/personal-retrieval | no disponible en la busqueda | no disponible | No (mismo patrón de plantilla) | no disponible en la busqueda | Hugging Face |

No se dispone de datos de benchmark de ninguno de ellos, por lo que no es posible establecer una comparación de rendimiento. Frente a recuperadores multimodales consolidados (CLIP, SigLIP, OpenCLIP), la diferencia fundamental no es de tamaño ni de contexto, sino que este repositorio no ofrece pesos entrenados y aquellos sí.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier salida que produzca carece de valor semántico.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce la propia model card.
- No se reclama ninguna métrica de benchmark; no hay evidencia empírica de calidad.
- La receta de entrenamiento por defecto (RMSprop + OneCycle) no ha sido validada mediante una ejecución completa.
- Es una implementación personalizada: las API genéricas de carga automática fallan sin un adaptador explícito, lo que complica su integración en stacks estándar.
- Sin declaración de idiomas soportados ni de composición del dataset, lo que impide anticipar sesgos lingüísticos o culturales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de interpretar erróneamente las representaciones no entrenadas como si tuvieran significado.
- Licencia Apache 2.0, permisiva para uso comercial, pero la model card advierte de que hay que revisar por separado los términos de los datos de origen cuando se use con datasets externos.
- Para producción: no apto en su estado actual. Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto aquí incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyunsoochung/personal-retrieval
- Perfil de GitHub del autor (portfolio): https://github.com/hyunsoochung-portfolio
- Perfil de GitHub del autor (desarrollo): https://github.com/hyunsoochung-dev/
- Repositorio hermano con implementación CLIP: https://huggingface.co/Williamhru/personal-retrieval
- Repositorio hermano: https://huggingface.co/vihaanshah05/personal-retrieval
- Google Scholar del autor: https://scholar.google.com/citations?user=QeludxwAAAAJ&hl=en
