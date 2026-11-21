# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF

## Resumen

Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales y 3.000 millones de parámetros activos por token (según el sufijo A3B del nombre). El modelo original deriva de la familia Qwen3.5/Qwen3.6 y ha sido sometido a un proceso de destilación, ajuste fino supervisado (SFT) con LoRA e instruction tuning orientado a razonamiento con cadenas de pensamiento largas (long-CoT). La cuantización la firma mradermacher, un autor habitual en el ecosistema GGUF.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 35.000 millones de parámetros en hardware de consumo gracias a la arquitectura MoE, que solo activa una fracción de los parámetros en cada paso de inferencia. El repositorio incluye además un suplemento multimodal (mmproj), lo que sugiere capacidades de visión, y cubre cuatro idiomas: inglés, chino, japonés y español.

Se trata de un modelo experimental (etiquetado como "merge" y "experimental" por el autor) y su uso en producción debe evaluarse con cautela, ya que no se han publicado resultados de benchmarks verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Qwen3.5/Qwen3.6 |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3.000 millones (según sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; también mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE): de los 35,5 mil millones de parámetros totales, solo unos 3 mil millones se activan por token, lo que reduce el coste computacional de la inferencia manteniendo una capacidad de representación propia de un modelo mucho mayor. El modelo base, nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex, se construyó mediante un pipeline que combina destilación, ajuste fino supervisado (SFT) con adaptadores LoRA e instruction tuning, con especial énfasis en razonamiento de cadena de pensamiento larga (long-CoT). Las etiquetas del repositorio mencionan también mergekit, lo que indica que el modelo resultante es una fusión de pesos de distintos checkpoints o adaptadores.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal. La presencia de archivos mmproj (multi-modal supplement) en el repositorio de cuantizaciones sugiere que el modelo incorpora un proyector multimodal para entrada de imágenes, aunque el autor no detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional multi-turno con instruction tuning.
- Razonamiento explícito mediante cadenas de pensamiento largas (long-CoT), incluyendo modos de "thinking".
- Resolución de problemas matemáticos y de ciencia, tecnología, ingeniería y matemáticas (STEM).
- Generación y asistencia en programación (coding).
- Capacidades multilingües en inglés, chino, japonés y español.
- Posible entrada multimodal (visión) gracias a los ficheros mmproj incluidos en el repositorio de cuantizaciones.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el énfasis en long-CoT es compatible con flujos de razonamiento extendido.

## Casos de uso

- Asistencia en programación en local: con cuantizaciones Q4_K_M de 21,8 GB, el modelo puede ejecutarse en una GPU de consumo de gama alta y emplearse como copiloto de código en entornos sin conexión, aprovechando su entrenamiento en coding y su modo de razonamiento.
- Razonamiento matemático y STEM en investigación: el ajuste long-CoT permite plantear problemas paso a paso y revisar la traza de razonamiento, útil para validación de demostraciones o ejercicios docentes.
- Atención al cliente multilingüe: al cubrir inglés, chino, japonés y español, puede gestionar conversaciones multi-turno en cuatro mercados con un único despliegue, siempre que se valide la longitud de contexto real (no disponible).
- Análisis de documentos e imágenes: la presencia de mmproj permite procesar capturas, diagramas o documentos escaneados junto con texto, por ejemplo para extracción de datos en flujos internos.
- Prototipado de agentes con razonamiento extendido: su naturaleza long-CoT lo hace adecuado para experimentar con pipelines de razonamiento multi-paso en local antes de escalar a modelos mayores.
- Despliegue en estaciones de trabajo con una sola GPU: las cuantizaciones Q4_K_S (20,5 GB) y Q4_K_M (21,8 GB) caben en GPUs de 24 GB de VRAM, lo que permite ofrecer un asistente interno sin depender de la nube.
- Evaluación comparativa de modelos MoE: útil para investigadores que quieran medir el comportamiento de un MoE de 35B con 3B activos frente a modelos densos del mismo tamaño en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K 13,3 GB; Q3_K_S 15,6 GB; Q3_K_M 17,3 GB; Q3_K_L 18,7 GB; IQ4_XS 19,5 GB; Q4_K_S 20,5 GB; Q4_K_M 21,8 GB; Q5_K_S 24,7 GB; Q5_K_M 25,4 GB; Q6_K 29,3 GB; Q8_0 37,9 GB. Añadir aproximadamente 0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q4_K_S; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q6_K y Q8_0; GPUs de 16 GB solo con Q2_K o Q3_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs de 24 GB con cuantizaciones Q4; en GPUs de 16 GB con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con 3B parámetros activos, el throughput debería ser superior al de un modelo denso de 35B, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex (este) | 35,5 B | 3 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Modelo denso de ~30-35B de la familia Qwen | no disponible | no aplica | no disponible | no disponible | no disponible |
| MoE de ~30B con ~3B activos de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo experimental y resultado de una fusión (merge): el comportamiento puede ser menos estable que el de un checkpoint oficial de la familia Qwen.
- No hay benchmarks publicados: no es posible verificar el rendimiento real frente a alternativas.
- Longitud de contexto no documentada: no se debe asumir una ventana larga sin comprobación empírica.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por el modo long-CoT, que puede producir trazas de razonamiento plausibles pero incorrectas.
- Sesgos desconocidos: no se documenta la composición del dataset ni los filtros aplicados.
- Cobertura idiomática limitada a en, zh, ja y es; el rendimiento en español no está cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base y de los checkpoints fusionados.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El soporte de tool calling y de agentes no está documentado, por lo que no debe asumirse en integraciones críticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
