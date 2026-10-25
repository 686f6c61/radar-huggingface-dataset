# RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX

## Resumen

RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX es una conversión a ONNX del checkpoint nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 de NVIDIA, publicada por el usuario RASMUS para ejecutarse con Transformers.js sobre WebGPU. El modelo de partida es un post-entrenamiento de google/gemma-4-E4B-it: NVIDIA conserva la arquitectura Gemma 4 E4B, refresca los pesos y la plantilla de chat, y lo orienta a razonamiento y conversación de propósito general. Este repositorio contiene únicamente el decodificador y el grafo de embeddings de tokens, sin codificador de visión ni de audio.

El interés práctico del artefacto es el formato: grafos ONNX cuantizados en q4f16 (4 bits, bloque 32, asimétrico, redondeo half-to-even) que suman 4,91 GB dentro de `onnx/` y permiten ejecutar el modelo en el navegador mediante WebGPU, o en CPU con ONNX Runtime, sin depender de CUDA. Frente al BF16 original —pensado para personalización y post-entrenamiento—, esta versión prioriza el despliegue local ligero.

Conviene subrayar que el repositorio no documenta longitud de contexto, idiomas soportados ni número exacto de parámetros, y que su validación se limita a una comprobación de fidelidad de pesos frente a una referencia PyTorch, no a métricas de tareas. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con la arquitectura Gemma 4 E4B (detalle interno no disponible) |
| Parámetros totales | no disponible (la denominación E4B corresponde a ~4B efectivos en la nomenclatura de Gemma; cifra exacta no confirmada) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4f16: pesos 4 bits, bloque 32, asimétrico, redondeo half-to-even; activaciones fp16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (campo `license: other`, `license_name: openmdw-1.1`); el Gemma 4 subyacente es Apache-2.0 |
| Formato de pesos | ONNX (grafos de decodificador y de embeddings de tokens), q4f16; 4,9 GB de repositorio, 4,91 GB en `onnx/` |

## Arquitectura y entrenamiento

El repositorio no exporta un grafo nuevo: reutiliza los grafos de onnx-community/gemma-4-E4B-it-ONNX en el commit `2b6d2e26a962f70a33da8f7cd81e1afdd8d9cfb2`, porque Bolt mantiene la arquitectura de Gemma 4 E4B. Cada inicializador aprendido se sustituye por el tensor correspondiente de Bolt y se cuantiza con la misma regla que produjo el original (4 bits, bloque 32, asimétrico, half-to-even). Como control de método, al ejecutar el mismo escritor con los pesos de Gemma 4 E4B-it se reproducen byte a byte los cinco ficheros de grafo y datos de aquel repositorio. El `manifest.json` lista cada inicializador con su tensor de origen, ubicación y SHA-256, lo que hace el proceso auditable.

En cuanto al entrenamiento del modelo base, la información disponible indica que NVIDIA post-entrenó Gemma-4-E4B-it refrescando pesos y plantilla de chat, con un pipeline que la prensa especializada describe apoyado en aprendizaje por refuerzo; el texto disponible está truncado y no detalla la composición del dataset, el número de tokens ni si hubo DPO. El checkpoint BF16 se presenta explícitamente como material para personalización, post-entrenamiento y evaluación, no para inferencia directa en producción.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, según la descripción del modelo base de NVIDIA.
- Plantilla de chat propia de NVIDIA, refrescada respecto a la de Gemma 4.
- Inferencia en navegador mediante Transformers.js y WebGPU, sin servidor con CUDA.
- Inferencia en CPU con ONNX Runtime (la validación del autor se ejecutó en CPU).
- Ejecución local en hardware de borde: la documentación de NVIDIA cita RTX, Jetson y Spark como objetivos del modelo base.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma específica.
- Capacidades multilingües: no disponible.
- Visión y audio: no incluidos en este repositorio (solo decodificador y embeddings de texto), aunque la etiqueta `image-text-to-text` provenga del modelo base multimodal.
- Modo thinking explícito: no documentado.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: cargar los grafos q4f16 con Transformers.js y ejecutar la inferencia en WebGPU del propio dispositivo, evitando enviar el historial de conversación a un servidor. Requiere una descarga inicial de ~4,9 GB, amortizable con caché del navegador.
- NPCs y diálogo dinámico en videojuegos: el modelo base se posiciona para NPCs de juego con inferencia local en RTX, Jetson o Spark, y este formato ONNX simplifica el empaquetado multiplataforma sin dependencias de CUDA.
- Interfaces de robot y asistentes de voz: se puede combinar con un ASR y un TTS externos para construir el bucle de voz, usando Bolt como componente de generación de respuesta en el propio robot; este repositorio aporta solo la parte de texto.
- Despliegue en entornos sin GPU NVIDIA: servir el modelo con ONNX Runtime en CPU dentro de contenedores x86 estándar, útil para demos, tests de integración o entornos de desarrollo donde no hay acelerador disponible.
- Auditoría y reproducibilidad de cuantizaciones: el `manifest.json` con SHA-256 por inicializador y el `proof.json` permiten verificar que un despliegue concreto usa exactamente los pesos declarados, algo relevante en pipelines regulados.
- Evaluación comparativa de fidelidad: usar los 32 prompts fijos y el par de control (Gemma 4 E4B-it frente a sus grafos originales) como banco de pruebas para medir la pérdida introducida por distintas reglas de cuantización antes de adoptar una en producción.
- Prototipado de chat local en aplicaciones de escritorio: integrar los grafos en un cliente Electron o Tauri con ONNX Runtime, manteniendo los datos del usuario en la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica una verificación de fidelidad de pesos: comparación de los grafos ONNX contra una referencia PyTorch con pesos BF16 y aritmética fp32, en posiciones teacher-forced de 32 prompts fijos, con prefill completo y decodificación de un token con caché. El par de control aplica el mismo método a google/gemma-4-E4B-it contra sus grafos originales.

| Ruta | Top-1 Bolt | Top-1 control | Coseno centrado Bolt | Coseno centrado control |
|---|---:|---:|---:|---:|
| Prefill | 0,9195 | 0,9276 | 0,9205 | 0,9215 |
| Decode con caché | 0,9185 | 0,9276 | 0,9205 | 0,9215 |

Posiciones evaluadas: 932 para Bolt y 946 para el control. La regla de aceptación se fijó antes de la ejecución (top-1 ≥ control − 0,05 y coseno ≥ control − 0,01 en ambas rutas) y ambas rutas la cumplen. Se investigaron 24 casos prompt-ruta que quedaron por debajo del margen por sí solos (`triage.json`); 12 casos por ruta. Al recargar en PyTorch los bytes q4 de estos ficheros, con código de desquantización independiente del cuantizador del export, la coincidencia top-1 con ONNX fue de 929/932 en prefill y 931/932 en decode, con coseno centrado ≥ 0,99999 en ambas rutas, lo que el autor interpreta como pérdida de cuantización. Estas cifras no validan kernels de WebGPU, velocidad ni precisión en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos q4f16 ocupan 4,91 GB; con activaciones y overhead de runtime, una estimación razonable es 5,5-6,5 GB de VRAM libre (estimación propia a partir del tamaño de los ficheros; el autor no publica cifras de memoria).
- GPU consumer: cabe con holgura en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB el margen es muy ajustado y depende del runtime.
- GPU profesional: A100, H100 y L40S son válidas pero sobredimensionadas para un modelo de este tamaño; su interés sería el throughput agregado por GPU.
- Hardware de borde: NVIDIA cita RTX, Jetson y Spark como destinos del modelo base; este repositorio no publica medidas en Jetson.
- CPU: ONNX Runtime en CPU funciona (la validación del autor se hizo así), pero no hay latencia ni throughput publicados.
- Opciones de despliegue: Transformers.js con backend WebGPU (navegador) y ONNX Runtime (CPU o WebGPU). Este formato no es directamente compatible con vLLM, TGI ni llama.cpp; para esos motores habría que reconvertir los pesos (por ejemplo, a GGUF) desde el checkpoint BF16.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que sus números no miden kernels de WebGPU ni velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Propósito |
|---|---|---|---|---|---|
| RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX | no disponible (~4B efectivos por nomenclatura) | no disponible | ONNX q4f16, 4,91 GB | OpenMDW-1.1 | Inferencia ligera en navegador/CPU/GPU vía Transformers.js |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | no disponible (~4B efectivos por nomenclatura) | no disponible | BF16 (PyTorch) | OpenMDW-1.1 | Checkpoint de referencia para personalización y post-entrenamiento |
| onnx-community/gemma-4-E4B-it-ONNX | no disponible (~4B efectivos por nomenclatura) | no disponible | ONNX (incluye multimodal) | Apache-2.0 | Base del export; conserva codificadores de visión y audio |
| google/gemma-4-E4B-it | no disponible (~4B efectivos por nomenclatura) | no disponible | BF16 (PyTorch) | Apache-2.0 | Modelo original de Google, multimodal, antes del post-entrenamiento de NVIDIA |

La comparación relevante no es de rendimiento —no hay benchmarks de tareas publicados para ninguno de los cuatro en la información disponible— sino de formato y gobernanza: este repositorio es el único de los cuatro con cuantización q4f16 documentada inicializador a inicializador y validada contra una referencia, pero también el único sin codificadores multimodales y el único cuya licencia (OpenMDW-1.1) no es Apache-2.0.

## Limitaciones y advertencias

- Solo texto: no incluye codificador de visión ni de audio, pese a que la etiqueta `image-text-to-text` figure en el repositorio por herencia del modelo base.
- Pérdida por cuantización medible: el 8,05 % de las posiciones evaluadas en prefill no coincidió en top-1 con la referencia BF16/fp32 (0,9195 de acuerdo); en decode, el 8,15 %. El autor no establece el impacto en precisión de tareas downstream.
- Doce casos por ruta quedaron por debajo del margen de control fijado antes de la ejecución y fueron investigados; el propio autor reconoce que la evidencia es consistente con pérdida de cuantización, no concluyente sobre su causa.
- Los resultados no validan el comportamiento de los kernels de WebGPU, la velocidad ni la precisión en producción.
- Longitud de contexto e idiomas soportados no documentados: riesgo alto si se planean prompts largos o uso multilingüe sin evaluación previa.
- Plantilla de chat refrescada por NVIDIA: usar la plantilla del checkpoint Bolt, no la de Gemma 4 E4B-it, para evitar degradación silenciosa en conversación.
- Licencia OpenMDW-1.1 con campo `license: other` en HuggingFace: revisar el texto de `LICENSE` antes de cualquier uso comercial; el Gemma 4 subyacente es Apache-2.0, pero los pesos de Bolt se rigen por OpenMDW-1.1.
- Artefacto sin tracción: 0 descargas y 0 likes, publicado por un autor individual (RASMUS) el 25 de octubre de 2026, sin revisión comunitaria documentada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados por el autor.
- Tamaño de descarga elevado para uso web (4,9 GB), lo que limita su adopción en conexiones lentas o dispositivos con almacenamiento reducido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Grafos ONNX de referencia: https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX
- Licencia OpenMDW-1.1: https://huggingface.co/RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX/blob/main/LICENSE
- Ficha en NVIDIA build: https://build.nvidia.com/nvidia/nemotron-3.5-bolt-e4b/modelcard
- Documentación de NVIDIA NeMo AutoModel: https://docs.nvidia.com/nemo/automodel/model-coverage/vision-language-models/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16
- Catálogo NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-bolt-e4b-4gb/
- Referencia de API NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3_5-bolt-e4b
- Artículo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/10/23/nvidia-nemotron-3-5-bolt-e4b-4gb/
