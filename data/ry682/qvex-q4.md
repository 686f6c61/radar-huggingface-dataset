# Ry682/qvex-q4

## Resumen

qvex-q4 es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.5-9B, publicada por Ry682. No es un modelo entrenado desde cero: es un artefacto derivado de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) que conserva la licencia Apache-2.0 del modelo base y ocupa 5,1 GB en el repositorio. Su objetivo es ejecutar el modelo base en Apple Silicon mediante el motor de inferencia QVex, manteniendo el formato MLX 4-bit estándar.

La propuesta técnica es la cuantización con importance matrix (imatrix): cada matriz se cuantiza desde los pesos bf16 originales ponderando los canales de entrada según su actividad en texto real (italiano, inglés, código y chat). El autor reporta una divergencia KL de 0,026 frente al bf16 en 40 ventanas reservadas, con un 91,9% de coincidencia en el token superior y perplejidad 5,89. Son métricas de fidelidad de cuantización, no benchmarks estándar de capacidades.

Es relevante para quienes necesitan inferencia local en Mac con un compromiso medido entre tamaño y calidad, pero la información disponible no detalla la longitud de contexto, la arquitectura del modelo base, los idiomas oficiales ni el soporte de tool calling. La evaluación se realizó en un MacBook Air M5 de 16 GB y con una muestra limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (cuantización MLX 4-bit de Qwen/Qwen3.5-9B; la arquitectura del modelo base no se detalla en la información proporcionada) |
| Parámetros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit MLX con importance matrix (imatrix); formato MLX 4-bit estándar |
| Idiomas soportados | No disponibles oficialmente; calibración con italiano, inglés, código y chat |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX 4-bit (según tags y librería `mlx`) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamaño del repositorio | 5,1 GB |
| Librería de inferencia | MLX; motor QVex |

## Arquitectura y entrenamiento

qvex-q4 no se entrena: se genera cuantizando los pesos bf16 de Qwen/Qwen3.5-9B. El autor indica que cada matriz se cuantiza desde los pesos originales ponderando los canales de entrada por su actividad en texto real, con un conjunto de calibración compuesto por italiano, inglés, código y chat. El resultado es un formato MLX 4-bit estándar que, según el autor, tiene el mismo tamaño, velocidad y consumo de memoria que el MLX 4-bit de serie.

No se proporcionan datos sobre la arquitectura del modelo base, el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación. Tampoco se documenta el proceso completo de calibración más allá de la descripción de la importance matrix y del motor QVex.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo incluye el tag `conversational`.
- Generación y asistencia con código: el conjunto de calibración incluye código, aunque no se aportan resultados de HumanEval ni de otros benchmarks específicos.
- Texto en italiano e inglés: ambos idiomas se usan en la calibración; el autor reporta una mejora mayor en italiano frente a una cuantización MLX 4-bit de referencia.
- Ejecución local en Apple Silicon: el formato MLX y la integración con QVex están orientados a Mac con chip de Apple.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes, razonamiento multi-paso o planificación.
- No se documentan visión, audio ni modo de razonamiento explícito.
- No hay una lista oficial de idiomas soportados; el rendimiento fuera de italiano e inglés no está evaluado en la información disponible.

## Casos de uso

- Inferencia local en Mac para prototipos: usar QVex con el formato MLX en un MacBook Air M5 de 16 GB, aprovechando que el repositorio ocupa 5,1 GB y que el autor validó el modelo en ese equipo. Es adecuado para entornos sin GPU NVIDIA y para pruebas de concepto en local.
- Asistente conversacional offline: desplegar un chat local con el pipeline `text-generation` para conversaciones que no deban salir del dispositivo. Es útil en escenarios de privacidad, aunque la longitud de contexto no está documentada y conviene limitar la extensión de las conversaciones.
- Evaluación de técnicas de cuantización: reproducir las métricas de KL y perplejidad del autor y compararlas con el bf16 original y con el MLX 4-bit de LM Studio. Es un caso realista para investigadores que estudian fidelidad de cuantización en Apple Silicon.
- Asistencia editorial bilingüe en italiano e inglés: emplear el modelo para borradores, reescritura o resúmenes en local, dado que el autor calibró con esos idiomas y reporta KL 0,029 en italiano frente a 0,084 de la referencia. Requiere validación humana por la ausencia de benchmarks de calidad lingüística.
- Prototipos de autocompletado de código en local: integrar el modelo en un editor o script de pruebas para sugerencias ligeras, ya que la calibración incluye código. No es adecuado para producción sin una evaluación específica de HumanEval o de aceptación real.
- Investigación sobre cuantización con importance matrix: utilizar el repositorio y el pipeline `quant/` de QVex para reconstruir la cuantización, comparar el efecto de la ponderación por canales y medir la degradación en distintos dominios.
- Demostraciones educativas de modelos locales: ejecutar el modelo en un taller o laboratorio con Mac Apple Silicon para ilustrar el flujo completo de cuantización, despliegue y evaluación de fidelidad sin depender de servicios en la nube.

## Benchmarks y rendimiento

Métricas de fidelidad de cuantización reportadas por el autor, medidas en 40 ventanas reservadas y en un MacBook Air M5 de 16 GB. KL más bajo es mejor; el porcentaje de coincidencia en el token superior y la perplejidad se interpretan junto al bf16 de referencia.

| Modelo | KL ↓ | Mismo token superior | Perplejidad |
|---|---:|---:|---:|
| bf16 original | 0 | 100% | 5,75 |
| qvex-q4 | 0,026 | 91,9% | 5,89 |
| LM Studio MLX 4-bit | 0,069 | 86,7% | 5,98 |

El autor indica que la mayor ganancia se observa en texto italiano, con KL 0,029 frente a 0,084 de la referencia. También advierte que la comprobación de tareas usó solo 24 tareas verificables y debe tratarse como una comprobación de cordura, no como un benchmark. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM oficial: no disponible. El repositorio ocupa 5,1 GB en 4-bit y el autor probó el modelo en un MacBook Air M5 con 16 GB de memoria unificada. Como estimación de trabajo, conviene reservar al menos 8 GB de memoria unificada para pesos y overhead, pero no es una cifra publicada por el autor.
- GPU recomendadas: Apple Silicon; el M5 de 16 GB está validado en la model card. No se documentan recomendaciones para A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD.
- GPU de consumo: cabe en Apple Silicon de 16 GB según la prueba del autor. En GPU de consumo NVIDIA no hay soporte MLX documentado en la información proporcionada.
- Opciones de despliegue: motor QVex y MLX. No se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI; tampoco se ofrece un archivo GGUF.
- Latencia y throughput: no disponibles. El autor afirma que el formato tiene el mismo tamaño, velocidad y memoria que el MLX 4-bit estándar, pero no aporta cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KL ↓ | Perplejidad | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| qvex-q4 | 8.953.803.264 (4-bit MLX) | No disponible | 0,026 | 5,89 | Apache-2.0 | HuggingFace: Ry682
