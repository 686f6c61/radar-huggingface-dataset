# bambocher/LFM3-1.7B-oQ3.5

## Resumen

LFM3-1.7B-oQ3.5 es una versión cuantizada del modelo de lenguaje LFM3-1.7B, publicada por el usuario bambocher en Hugging Face. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta sobre los pesos del modelo original. El resultado es un checkpoint de 1.728.801.536 parámetros (aproximadamente 1,73 mil millones) almacenado en menos de 1 GB, con un promedio efectivo de 4,001 bits por peso.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecución de modelos de machine learning sobre silicio de la compañía (chips M-series). Esto lo orienta a inferencia local en equipos Mac, no a despliegues en GPU NVIDIA. La cuantización mixta distribuye los pesos en varios niveles de precisión: la mayor parte (66,3 % de los pesos lógicos) se almacena en 3 bits afín con grupo de 64, mientras que fracciones menores usan 4, 5, 6 y 8 bits, y una cantidad residual permanece en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de cuantización extrema (promedio de 4 bits) sobre un modelo pequeño, una técnica cada vez más habitual para llevar LLM a hardware de consumo. Por otro lado, la información publicada es muy limitada: no hay model card del modelo base, no se declaran benchmarks, licencia ni idiomas soportados, lo que condiciona cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base LFM3-1.7B no se describe en la información proporcionada) |
| Parámetros totales | 1.728.801.536 (1,73 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta afín con grupo de 64: 3 bits (66,3 % de pesos lógicos), 4 bits (18,7 %), 5 bits (14,0 %), 6 bits (1,0 %), 8 bits (0,07 %), BF16 (0,02 %). Promedio efectivo: 4,001 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantización MLX (librería `mlx`, `custom_code`) |
| Tamaño del repositorio | 0,9 GB (0,865 GB / 0,805 GiB de pesos) |
| Fecha de creación | 2026-11-14 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3-1.7B ni sobre sus datos de entrenamiento, número de tokens, composición del dataset o técnicas de alineación (RLHF, DPO). La model card únicamente documenta el proceso de cuantización.

El proceso aplicado es una cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.3). Cada tensor se asigna a un nivel de bits distinto en función de su sensibilidad, usando cuantización afín con tamaño de grupo 64. El resultado es un checkpoint de 1,729 B de pesos lógicos que ocupa 0,805 GiB en disco, con un promedio de 4,001 bits por peso. La distribución muestra que la mayoría de los pesos (66,3 %) se comprimen a 3 bits, mientras que una minoría se mantiene en 4, 5, 6 u 8 bits para preservar precisión en las capas más sensibles. El modelo requiere `custom_code` para cargarse, lo que implica dependencia de la implementación específica de MLX y de la versión de oQ utilizada.

## Capacidades

- Generación de texto: capacidad esperable de un modelo de lenguaje de 1,7 B, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en Apple Silicon mediante MLX: sí, es el formato nativo del checkpoint.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está en formato MLX y ocupa menos de 1 GB, por lo que puede cargarse en equipos con memoria unificada modesta (8-16 GB) para pruebas de generación de texto sin conexión.
- Prototipado rápido de aplicaciones de texto en entornos macOS: al ser un modelo pequeño y cuantizado a 4 bits efectivos, permite iterar sobre prompts y pipelines sin depender de servicios en la nube.
- Evaluación de técnicas de cuantización: sirve como caso de estudio para comparar la calidad de un modelo base frente a su versión oQ de precisión mixta, midiendo la degradación introducida por los 3 bits en la mayoría de pesos.
- Docencia y experimentación académica: un modelo de 1,7 B en menos de 1 GB es adecuado para demostrar el funcionamiento de la cuantización afín por grupos en cursos de machine learning.
- Despliegue en dispositivos con recursos limitados: si el modelo base soporta instrucciones, podría usarse para tareas de clasificación, extracción o resumen de textos cortos en local.
- Integración en scripts de automatización personal: tareas de generación de texto simple (respuestas cortas, plantillas, reformulación) ejecutadas en un Mac sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: en torno a 1-2 GB para los pesos (0,805 GiB) más el overhead de activaciones y KV cache, que depende de la longitud de contexto (no disponible). En la práctica, cabe en cualquier Mac con 8 GB de memoria unificada o más.
- GPU recomendadas: no aplica GPU NVIDIA; el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores).
- ¿Cabe en GPU de consumo? No en el sentido habitual (NVIDIA/AMD); sí en Macs de consumo con memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es específico de MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos del modelo base LFM3-1.7B ni de alternativas comparables (parámetros, contexto, rendimiento o licencia), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a un promedio de 4,001 bits/peso, con un 66,3 % de los pesos a 3 bits, puede degradar la calidad respecto al modelo base; no se aportan métricas de degradación.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción debe verificarse la licencia del modelo base LFM3-1.7B.
- No se documentan idiomas soportados; el rendimiento en castellano es incierto.
- No se documenta la longitud de contexto, lo que limita la planificación de aplicaciones con ventanas largas.
- El checkpoint requiere `custom_code` y la librería MLX, lo que restringe su portabilidad a ecosistemas Apple y añade riesgo de incompatibilidad con versiones futuras de oQ/MLX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; deben asumirse los del modelo base, que tampoco se describe.
- La fecha de creación (2026-11-14) y la ausencia de metadatos de pipeline sugieren un artefacto experimental más que un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ3.5
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3-1.7B: no disponible en la información proporcionada.
