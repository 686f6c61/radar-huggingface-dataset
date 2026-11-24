# mlx-community/Holo-3.1-0.8B-mxfp8

## Resumen

Holo-3.1-0.8B-mxfp8 es la conversión al formato MLX del modelo Holo-3.1-0.8B desarrollado por H Company, un modelo multimodal de tipo image-text-to-text especializado en agentes que operan interfaces gráficas (GUI agents y computer use). El modelo original se distribuye bajo licencia Apache-2.0 y esta conversión, publicada por la comunidad mlx-community, preserva esa misma licencia. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), está pensado para ejecutarse de forma local en hardware Apple Silicon mediante la librería mlx-vlm.

La relevancia de esta variante concreta reside en su cuantización mxfp8 (grupo de tamaño 32) manteniendo la torre de visión en bfloat16, lo que permite reducir el uso de memoria a unos 2,5 GB en pico para una captura de pantalla de 1920x1080 con 2221 tokens de prompt, manteniendo una precisión de localización prácticamente idéntica a la versión en bf16. La conversión fue realizada con mlx-vlm 0.8.0 y validada por el usuario m4zar.

El modelo está orientado a tareas de localización de elementos en pantalla (click accuracy), generación de acciones sobre interfaces y razonamiento multimodal de un solo turno o multi-turno, con soporte únicamente del idioma inglés. Su tamaño reducido lo hace apto para prototipado rápido de agentes de escritorio y automatización de navegador en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (torre de visión + modelo de lenguaje), familia qwen3_5 según los tags del repositorio; detalles internos de capas y atención no disponibles |
| Parametros totales | 852.985.920 (≈0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se han validado prompts de ~12k tokens con 3 imágenes, pero no se declara la ventana máxima) |
| Tipos de cuantizacion | mxfp8 (grupo 32) en los pesos del modelo de lenguaje; torre de visión en bfloat16; existen variantes MLX bf16, 8-bit y 4-bit según los benchmarks del autor de la conversión |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx; tamaño del repo 1,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su carácter multimodal image-text-to-text y de los tags que lo asocian a la familia qwen3_5. Se trata, por tanto, de un modelo con una torre de visión que procesa capturas de pantalla y un modelo de lenguaje que genera las acciones o coordenadas correspondientes. La conversión a MLX mantiene la torre de visión en bfloat16 y cuantiza el resto de pesos a mxfp8 con grupo de tamaño 32.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El modelo está especializado en tareas de agentes GUI, con un protocolo de localización que devuelve coordenadas como enteros en el rango [0, 1000] y con un modo "thinking" que puede desactivarse (los benchmarks se ejecutan con thinking off). La conversión se realizó con `mlx_vlm.convert` usando `--dtype bfloat16 -q --q-mode mxfp8`.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y texto (image-text-to-text).
- Localización de elementos en pantalla: devuelve coordenadas como enteros en [0, 1000] mediante un prompt de localización específico.
- Agentes GUI y computer use: generación de acciones de clic y control sobre interfaces gráficas.
- Procesamiento de múltiples capturas de pantalla en un mismo prompt (validado con 3 imágenes a 1920x1080, ~12k tokens de prompt).
- Soporte de modo thinking (activado o desactivado), usado desactivado en los benchmarks publicados.
- Capacidades multilingües limitadas al inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Automatización de pruebas de interfaz de usuario: el modelo puede localizar elementos en capturas de pantalla y generar clics sobre ellos, integrándose en pipelines de QA que validen que los elementos de una web o aplicación de escritorio están donde deben estar.
- Agentes de navegador web: con una ventana de prompt validada de ~12k tokens y capacidad de procesar varias capturas, puede encadenar pasos de navegación (buscar un campo, hacer clic, rellenar) en flujos multi-paso sobre un navegador controlado por herramientas externas.
- Asistencia de accesibilidad: dado su tamaño de 0,85 B y su ejecución local en Apple Silicon con ~2,5 GB de memoria, puede desplegarse en un portátil para interpretar la pantalla del usuario y sugerir acciones o describir elementos interactivos.
- Automatización de tareas de escritorio en macOS: la variante MLX permite ejecución nativa en Apple Silicon mediante mlx-vlm, adecuada para asistentes locales que leen la pantalla y proponen clics sin enviar datos a la nube.
- Extracción de coordenadas para RPA (robotic process automation): el protocolo de salida en coordenadas [0, 1000] facilita el mapeo directo a píxeles de la resolución real, lo que simplifica la integración con motores de automatización existentes.
- Prototipado e investigación en agentes GUI: su reducido tamaño y su licencia Apache-2.0 permiten experimentar con fine-tuning y evaluación sobre el benchmark WebClick sin restricciones de uso comercial.
- Despliegue en entornos con memoria limitada: la cuantización mxfp8 mantiene una precisión de clic del 78,7 % en WebClick con solo ~2,5 GB de pico, lo que permite ejecutar el modelo junto a otras herramientas en un mismo equipo.

## Benchmarks y rendimiento

Resultados de precisión en WebClick (1639 muestras, protocolo oficial de localización de H Company, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo / cuantización | Precisión | IC 95 % |
|---|---|---|
| MLX bf16 | 78,8 % | 76,7 – 80,7 |
| MLX 8bit | 78,6 % | 76,5 – 80,5 |
| MLX 4bit | 73,6 % | 71,5 – 75,7 |
| MLX mxfp8 (este modelo) | 78,7 % | 76,7 – 80,6 |

Las variantes bf16, 8-bit y mxfp8 quedan dentro de 0,3 puntos entre sí (test exacto pareado, sin diferencia significativa).

Rendimiento en Apple M5 Max (128 GB), una captura 1920x1080, 2221 tokens de prompt, greedy:

| Motor | Tiempo al primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (mxfp8) | 228 ms | 390 tok/s | 2,5 GB (pico) |
| transformers, bfloat16, MPS | 331 ms | 137 tok/s | 4,6 GB (pico) |
| llama.cpp (Metal), Q8_0 | 458 ms | 295 tok/s | 1,9 GB (RSS) |

Rendimiento con prompt largo multi-imagen (3 capturas 1920x1080, ~12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo al primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (mxfp8) | 1,0 s* | 328 tok/s | 2,6 GB (pico) |
| llama.cpp (Metal), F16 GGUF (no oficial) | 2,1 s* | 199 tok/s | 2,8 GB (RSS) |

El asterisco indica medidas con variación superior al 10 %; el equipo estaba compartido con otras tareas, por lo que los tiempos son indicativos. Validación de logits frente a los pesos originales en float32 (transformers, CPU): KL media de 9,1e-4 a 720p, frente a 2e-4–3e-4 de transformers bfloat16 en MPS.

## Requisitos de hardware

- VRAM/memoria unificada: ~2,5 GB de pico para una captura 1080p con 2221 tokens de prompt; ~2,6 GB de pico con 3 capturas y ~12k tokens de prompt.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada (mediciones del autor de la conversión).
- GPU recomendadas: Apple Silicon con soporte MLX (series M); no se han publicado mediciones en GPU NVIDIA o AMD para esta variante.
- ¿Cabe en GPU de consumo? Sí, en términos de memoria; en Apple Silicon cabe en equipos con 8 GB o más de memoria unificada, aunque no se han publicado pruebas en configuraciones inferiores al M5 Max.
- Opciones de despliegue: mlx-vlm 0.8.0 con mlx 0.32.4 (versiones validadas); llama.cpp (Metal) con GGUF como alternativa, aunque los GGUF citados no son releases oficiales.
- Latencia y throughput: 228 ms al primer token y 390 tok/s en decodificación para prompt corto; 1,0 s y 328 tok/s para prompt largo multi-imagen (cifras indicativas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-0.8B-mxfp8 (este) | 0,85 B | no disponible | 78,7 % | Apache-2.0 | MLX, safetensors |
| Holo-3.1-0.8B (original) | 0,85 B | no disponible | no disponible en esta ficha | Apache-2.0 | Transformers, safetensors |
| Holo-3.1-0.8B MLX bf16 | 0,85 B | no disponible | 78,8 % | Apache-2.0 | MLX, safetensors |
| Holo-3.1-0.8B MLX 4bit | 0,85 B | no disponible | 73,6 % | Apache-2.0 | MLX, safetensors |

No se dispone en la información proporcionada de datos de otros modelos de agentes GUI comparables (parámetros, contexto o benchmarks) para establecer una comparativa externa.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está validado.
- Longitud de contexto: no se declara la ventana máxima; los 12k tokens de prompt son una prueba empírica, no un límite documentado.
- Precisión: la cuantización a 4 bits degrada la precisión de clic en WebClick en unos 5 puntos respecto a bf16/mxfp8 (73,6 % frente a ~78,7 %); la variante mxfp8 no muestra degradación medible.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación en la información disponible; como modelo de localización, puede devolver coordenadas plausibles pero incorrectas en pantallas no vistas.
- Sesgos: no se han documentado sesgos conocidos en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; se debe conservar el aviso de licencia y el reconocimiento a H Company.
- Caveats de producción: las mediciones de velocidad se realizaron en un equipo compartido y con variación superior al 10 % en algunos casos; los GGUF de llama.cpp citados no son releases oficiales; la conversión está validada únicamente con mlx-vlm 0.8.0 y mlx 0.32.4.
- El modelo es de 0,85 B de parámetros, por lo que su capacidad de razonamiento general es limitada en comparación con modelos de mayor tamaño; está especializado en localización y acciones GUI.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/mlx-community/Holo-3.1-0.8B-mxfp8
- Modelo original: https://huggingface.co/Hcompany/Holo-3.1-0.8B
- Sitio de H Company: https://www.hcompany.ai/
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de mejora de velocidad de la torre de visión en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2822
