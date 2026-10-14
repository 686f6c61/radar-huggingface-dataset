# heatherwhw88/tiny-transformer-baseline20

## Resumen

Tiny Transformer baseline20 es un prototipo de investigación publicado por el usuario heatherwhw88 en HuggingFace. Se trata de un transformer de escala minúscula, con 24.832 parámetros totales, orientado a tareas de generación de texto. El modelo se distribuye como checkpoint de inicialización (no entrenado ni auditado), acompañado de un script de ejecución (`pipeline.py`), un `config.json` con los ajustes de arquitectura y un `training_args.json` con la receta de experimento por defecto.

El propio autor indica explícitamente en la model card que el checkpoint de `model.safetensors` sirve para pruebas de humo (smoke tests) y que no debe presentarse como un checkpoint evaluado con benchmarks. No se reclama ninguna puntuación de rendimiento en el repositorio, y la model card advierte que el modelo no ha sido entrenado ni auditado en cuanto a robustez, equidad o transferencia de dominio.

La relevancia de esta ficha es limitada en términos de producción: se trata de un artefacto de investigación experimental con cero descargas y cero "likes" en el momento de la consulta, pensado como punto de partida reproducible para comparativas de arquitecturas a pequeña escala, no como modelo desplegable en aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.0 GB |
| Escala declarada | huge (según la model card) |
| Atención | multi query |
| Fusión | low rank |
| Activación | gelu tanh |
| Normalización | instancenorm |
| Optimizador por defecto | lion |
| Scheduler por defecto | onecycle |

## Arquitectura y entrenamiento

La arquitectura declarada es un "Tiny Transformer" con atención multi-query (multi query attention), fusión de bajo rango (low rank fusion) y activación GELU-Tanh, con normalización mediante InstanceNorm en lugar de LayerNorm. No se detalla el número de capas, la dimensión del modelo, el número de cabezas de atención, el tamaño de vocabulario ni la longitud máxima de secuencia; estos datos no aparecen en la model card ni en los metadatos disponibles. El número total de parámetros (24.832) sitúa al modelo en un rango extremadamente pequeño, muy por debajo de cualquier transformer de uso general.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto basada en el optimizador Lion con un scheduler OneCycle, pero el autor subraya de forma explícita que son valores de arranque en el script y no evidencia de un entrenamiento completado. El checkpoint distribuido es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describen innovaciones técnicas adicionales más allá de las ya citadas (multi query attention, low rank fusion, InstanceNorm, GELU-Tanh).

## Capacidades

- Generación de texto: la model card etiqueta el repositorio bajo la tarea "generation", aunque no se aportan ejemplos de salidas ni evidencia de calidad.
- Razonamiento, código y matemáticas: no disponible; no se documenta ni se demuestra ninguna de estas capacidades.
- Tool calling / function calling: no disponible; no se menciona soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas aparece como "no disponibles" en los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se declara ninguna modalidad adicional a texto.
- Ejecución de pruebas de humo: el repo incluye un `pipeline.py` con un bloque `__main__` que sirve como ejemplo ejecutable de smoke test, lo que constituye su principal utilidad práctica documentada.

## Casos de uso

- Pruebas de humo en pipelines de CI: el checkpoint de inicialización permite verificar que un pipeline de carga, tokenización e inferencia funciona de extremo a extremo antes de sustituir por un modelo real, dado su tamaño trivial (24.832 parámetros, repo de 0.0 GB).
- Investigación en arquitecturas alternativas: sirve como banco de pruebas para experimentar con combinaciones poco habituales como atención multi-query con InstanceNorm y activación GELU-Tanh en un régimen de escala mínima.
- Reproducción de recetas de optimización: el `training_args.json` documenta una configuración Lion + OneCycle que puede reutilizarse como plantilla en experimentos comparativos de entrenamiento.
- Docencia y formación: por su tamaño y simplicidad, es adecuado para ilustrar en clase la estructura de un transformer de generación y el ciclo completo de carga de un checkpoint desde safetensors.
- Comparativas de arquitectura a pequeña escala: la model card recomienda evaluar con un conjunto de validación específico de tarea, al menos tres semillas y una línea base de capacidad equivalente, lo que encaja con estudios comparativos controlados.
- Validación de herramientas de serialización: al ser un safetensors pequeño, es útil para comprobar que librerías de carga y conversión (por ejemplo, adaptadores explícitos para APIs de carga automática) funcionan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara de forma explícita que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado, por lo que cualquier cifra de MMLU, HumanEval, GSM8K u otros conjuntos no existe para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de 24.832 parámetros ocupa aproximadamente 100 KB en precisión FP32 (unos 99 KB), por lo que la huella de pesos es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o inferior; el modelo cabe también íntegramente en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, e incluso en dispositivos embebidos o entornos sin acelerador.
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; el punto de entrada documentado es `python pipeline.py` con PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible; no se aportan mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría con los que contrastar parámetros, contexto, rendimiento o licencia. El autor sugiere, como guía metodológica, incluir una línea base de capacidad equivalente (matched-capacity baseline) y evaluar con al menos tres semillas, pero no nombra ninguna alternativa concreta.

## Limitaciones y advertencias

- El checkpoint es una inicialización, no un modelo entrenado: no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, según la propia model card.
- No existen métricas de calidad, benchmarks ni evaluaciones publicadas; cualquier afirmación de rendimiento sería infundada.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgos.
- Riesgo de alucinación: no evaluado; al no haber sido entrenado ni evaluado, no puede caracterizarse.
- Limitaciones de contexto e idioma: se desconocen tanto la longitud máxima de contexto como los idiomas soportados.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial, pero el autor recuerda que deben revisarse por separado los términos de los datos de origen si se emplean conjuntos externos.
- Carga automática: al ser una implementación personalizada, las APIs genéricas de HuggingFace `transformers` requieren un adaptador explícito, lo que añade fricción de integración.
- Madurez del repositorio: cero descargas y cero "likes"; no hay evidencia de uso ni de validación por parte de la comunidad.
- Recomendación del autor: tratar la implementación como un punto de partida experimental y documentar por separado cualquier resultado de un futuro checkpoint entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heatherwhw88/tiny-transformer-baseline20
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
