# inferencerlabs/Hy4-MLX-Q4i

## Resumen

Hy4-MLX-Q4i es una cuantización de 4 bits en formato MLX del modelo multimodal Hy4, desarrollado originalmente por Tencent. La ficha corresponde al artefacto publicado por inferencerlabs, un tercero que no es el creador del modelo base, y que aplica una técnica de cuantización dinámica en la que la mayor parte de las capas se reducen a 4 bits mientras que las capas sensibles (presumiblemente relacionadas con código) se mantienen en mayor precisión.

El modelo base Hy4 es un modelo de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, con arquitectura de la familia `hy_v4_vl`. Se distribuye en formato MLX, la librería de Apple para ejecución eficiente en silicio Apple (M-series), y el repo ocupa 40,4 GB en safetensors. El pipeline declarado es `image-text-to-text` y el idioma soportado declarado es únicamente inglés.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización con cero descargas y cero likes en el momento de la consulta, y la propia model card advierte que las métricas de calidad mostradas provienen de un modelo distinto (GLM 5.1) de tamaño similar convertido con una técnica comparable, no del propio Hy4. Por tanto, debe tratarse como una build experimental para ejecución local en Mac, no como una distribución de referencia del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia `hy_v4_vl`, multimodal image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 dinámica (mayoría de capas a 4 bits, capas sensibles a mayor precisión); el autor publica tabla comparativa Q3, Q4, Q4i, Q5, Q6, Q8, Q9 y Base |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Libreria | mlx |
| Tamano del repo | 40,4 GB |
| Modelo base | tencent/Hy4 |
| Relacion con el base | quantized |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Hy4 más allá de la etiqueta `hy_v4_vl` y su naturaleza multimodal (image-text-to-text). No se han publicado en la información disponible datos sobre número de parámetros, composición del dataset de entrenamiento, número de tokens, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

Lo que sí está documentado es el proceso de cuantización aplicado por inferencerlabs: una build de 4 bits "dinámica" en la que la mayoría del modelo se cuantiza a 4 bits pero las capas sensibles se conservan a mayor precisión para preservar la exactitud en tareas de código. La cuantización se realizó con una versión modificada de MLX. El autor declara que, por restricciones de memoria y tiempo del sistema, las cifras de calidad que publica no corresponden a Hy4 sino a un modelo GLM 5.1 de tamaño similar convertido con una técnica comparable, lo que limita seriamente la validez de esas métricas para este artefacto.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen + texto), según el pipeline `image-text-to-text`.
- Conversación multi-turno (tag `conversational`).
- Procesamiento de imágenes como entrada, con salida en texto.
- Énfasis declarado en exactitud para código: la cuantización preserva capas sensibles para no degradar tareas de programación.
- Ejecución en Apple Silicon mediante MLX.
- Soporte de un motor alternativo denominado DFly, activable desde los controles de inferencia de la aplicación Inferencer.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: la build mantiene capas sensibles a mayor precisión, por lo que es adecuada para autocompletado y explicación de código en un entorno Apple Silicon sin depender de la nube; el autor reporta ~13,4 tokens/s en modo coding con DFly en un M3 Ultra.
- Análisis de capturas de pantalla y diagramas: al ser image-text-to-text, permite describir interfaces, extraer texto de imágenes y responder preguntas sobre diagramas técnicos en flujos de documentación.
- Prototipado de asistentes conversacionales en local: el tag `conversational` y el pipeline multimodal permiten construir demos de chat con adjuntos de imagen sin salir del equipo.
- Evaluación comparativa de cuantizaciones: la tabla Q3–Q9 publicada por el autor sirve para estudiar el compromiso entre bits por peso, perplejidad y exactitud de tokens en un pipeline MLX.
- Investigación sobre cuantización dinámica: útil para reproducir y contrastar la técnica de mantener capas selectivas en mayor precisión frente a una cuantización uniforme.
- Despliegue offline en estaciones de trabajo Mac: al ejecutarse con MLX y ocupar 40,4 GB en disco, encaja en escenarios con requisitos de privacidad donde no se permite enviar imágenes o código a servicios externos.
- Pruebas de integración con la aplicación Inferencer: el autor valida la build con Inferencer v2.5.4, por lo que sirve para verificar flujos de inferencia con y sin el motor DFly.

## Benchmarks y rendimiento

La model card publica una tabla de calidad de cuantización, pero el propio autor advierte que las cifras provienen de un GLM 5.1 de tamaño similar y no de Hy4. Se reproducen a título informativo, con esa salvedad explícita:

| Cuantizacion (bpw) | Perplejidad | Exactitud de tokens | Missed divergence |
|---|---|---|---|
| Q3 | 168,0 | 43,45 % | 72,57 % |
| Q4 | 1,33593 | 91,65 % | 17,28 % |
| Q4i | 1,21093 | 97,70 % | 10,65 % |
| Q5 | 1,23437 | 95,05 % | 17,28 % |
| Q6 | 1,21875 | 96,65 % | 12,03 % |
| Q8 | 1,21875 | 97,65 % | 9,92 % |
| Q9 | 1,20312 | 97,80 % | 9,60 % |
| Base | 1,20312 | 100 % | 0,000 % |

Métricas de velocidad declaradas por el autor en M3 Ultra:

| Configuracion | Tarea | Tokens/s | Memoria reportada |
|---|---|---|---|
| M3 Ultra, motor estandar | 500 tokens | ~11,3 | ~415 GiB |
| M3 Ultra, DFly | 500 tokens (coding) | ~13,4 | ~417 GiB |
| M3 Ultra, DFly | 500 tokens (writing) | ~9,9 | ~417 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El repo pesa 40,4 GB en safetensors, por lo que se necesita al menos ese espacio en disco más margen para la carga.
- Las cifras de memoria de la model card (~415–417 GiB) son incoherentes con un artefacto de 40,4 GB y probablemente arrastran el error de haber sido medidas sobre otro modelo; no deben usarse para dimensionar el sistema.
- Hardware objetivo declarado: Apple Silicon, en concreto un M3 Ultra con memoria unificada. No hay datos de funcionamiento en GPU NVIDIA o AMD.
- No cabe en GPUs de consumo convencionales por formato: MLX está orientado a silicio Apple; no se documenta soporte CUDA.
- Opciones de despliegue: librería MLX y la aplicación Inferencer v2.5.4 (con motor estándar o DFly). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~11,3 tokens/s en modo estándar y ~9,9–13,4 tokens/s con DFly sobre M3 Ultra, según el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no hay datos de parámetros, contexto ni benchmarks del modelo base Hy4, y el único punto de referencia citado por el autor (GLM 5.1) se usa solo como proxy de cuantización, no como alternativa funcional.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-MLX-Q4i | no disponible | no disponible | no disponible | safetensors MLX | Cuantización de terceros sobre tencent/Hy4 |
| tencent/Hy4 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original multimodal |
| GLM 5.1 (referencia del autor) | no disponible ("tamaño similar") | no disponible | no disponible | no disponible | Solo usado como proxy para métricas de cuantización |

## Limitaciones y advertencias

- Las métricas de calidad publicadas (perplejidad, exactitud de tokens) no corresponden a Hy4 sino a un GLM 5.1 de tamaño similar; no son válidas como evaluación de esta build.
- Las cifras de memoria (~415 GiB) son incompatibles con el tamaño del repo (40,4 GB) y probablemente son un error de copia; no deben usarse para planificar despliegues.
- Artefacto de terceros: inferencerlabs no es el creador ni propietario del modelo base y declina responsabilidad sobre exactitud o adecuación del contenido generado.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución, ni del base ni de la cuantización.
- Idioma declarado únicamente inglés; no hay evidencia de calidad en castellano.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base, que tampoco están descritos en la información disponible.
- La cuantización a 4 bits introduce degradación medible frente al base (según la tabla del propio autor, incluso la mejor variante Q9 no alcanza el 100 % de exactitud de tokens).
- Dependencia de la aplicación Inferencer para reproducir las condiciones declaradas; el soporte fuera de MLX no está documentado.
- No se documentan limitaciones de contexto porque la longitud de contexto no está disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Hy4-MLX-Q4i
- Modelo base: https://huggingface.co/tencent/Hy4
- Vídeos de demostración: https://youtube.com/xcreate
- Aplicación Inferencer: https://inferencer.com
- MLX: https://github.com/ml-explore/mlx
