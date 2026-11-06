# oliver0804/WeVisOne-VL-2B-RK3588-rkllm

## Resumen

WeVisOne-VL-2B-RK3588-rkllm es una conversión del modelo multimodal tencent/WeVisOne-VL-2B (arquitectura Qwen3-VL, 2B parámetros) para ejecutarse sobre la NPU del SoC Rockchip RK3588 y RK3588S. Lo publica el usuario oliver0804 en Hugging Face y no es un modelo nuevo, sino un artefacto de despliegue: pesos convertidos y cuantizados para las runtimes propietarias de Rockchip (librkllmrt 1.3.1 para el decodificador de texto y librknnrt 2.5.0 para el codificador visual). Resuelve el problema de llevar un VLM de 2B a placas de bajo consumo sin GPU, algo relevante para robótica, visión embebida e IoT industrial.

El paquete no es un único fichero: el LLM va en formato `.rkllm` con cuantización w8a8 y el encoder visual en `.rknn` a fp16. El pegamento entre ambos (preprocesado 448×448, concatenación de embeddings y deepstack features, construcción del prompt con tokens `<|vision_start|>`, `<|image_pad|>` y `<|vision_end|>`) no se entrega como script listo, sino que debe implementarlo el integrador usando la API `RKLLMInput`/`image_embed` de la runtime 1.3.1.

Su interés práctico está en el rendimiento medido sobre una placa ROCK 5C con relojes fijados: 14,1 tokens/s de generación y unos 4,3 GB de memoria combinada (LLM + visión). El autor reporta buena precisión en detección y grounding de objetos en imágenes naturales, pero un rendimiento débil en grounding de elementos de GUI (13 % frente al 53 % de Qwen3.5-2B en un subconjunto de 32 muestras de ScreenSpot-v2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM tipo Qwen3-VL + encoder visual); conversión para NPU Rockchip |
| Parametros totales | 2B (heredados del modelo base tencent/WeVisOne-VL-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM: w8a8 (rkllm-toolkit 1.3.1); encoder visual: fp16 (RKNN) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.rkllm` (LLM) y `.rknn` (encoder visual) |
| Runtime requerida | librkllmrt 1.3.1 y librknnrt 2.5.0 |
| Hardware objetivo | Rockchip RK3588 / RK3588S (NPU) |
| Preprocesado de imagen | 448×448 fijo |
| Tamano del repo | 3,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente, tencent/WeVisOne-VL-2B, sigue la arquitectura Qwen3-VL: un decodificador transformer de 2B parámetros acoplado a un encoder visual que produce, por cada token de visión, un embedding más tres mapas de características deepstack. En esta conversión, el encoder se exporta a ONNX y luego se compila a RKNN en fp16, mientras que el LLM se convierte con rkllm-toolkit 1.3.1 a un grafo w8a8 ejecutable sobre la NPU. Los scripts de conversión (exportación ONNX de visión, build RKNN y conversión w8a8 del LLM) se incluyen en el directorio `conversion/` del repositorio para reproducibilidad.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La conversión en sí no reentrena pesos: solo modifica su representación y cuantización. La innovación técnica destacable es el pipeline de dos runtimes con inyección de embeddings en float32: el encoder devuelve bloques `[n_tokens, 4·hidden]` que se concatenan por dimensión de características y se inyectan en el LLM mediante la API de image-embed de librkllmrt, preservando la semántica multimodal pese a la cuantización del decodificador.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Comprensión de imágenes naturales con detección y grounding de objetos mediante cajas (bounding boxes); según el autor, es el punto más fuerte del modelo en esta placa.
- Respuesta a prompts multimodales con tokens especiales de visión (`<|vision_start|>`, `<|image_pad|>`, `<|vision_end|>`).
- Soporte bilingüe chino-inglés.
- Inferencia totalmente en NPU, sin GPU, con el LLM cuantizado w8a8 y el encoder en fp16.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras modalidades.

## Casos de uso

- Visión embebida en robótica móvil: integración en un robot con RK3588 para describir escenas y localizar objetos con cajas, aprovechando los 14,1 tok/s y los ~4,3 GB de memoria para caber en placas de bajo consumo.
- Inspección industrial en el borde: análisis de imágenes de cámara para detectar y delimitar defectos o piezas, sin enviar datos a la nube, con la NPU como único acelerador.
- Vigilancia y analítica de vídeo en dispositivos: procesamiento de fotogramas clave en una placa RK3588S para generar descripciones textuales y localizaciones de objetos en tiempo casi real.
- Asistentes de accesibilidad offline: descripción de imágenes para usuarios con discapacidad visual en hardware empotrado, con soporte zh/en y sin dependencia de conectividad.
- Kioscos y terminales industriales: respuesta a consultas sobre imágenes capturadas localmente (etiquetas, productos, entorno) en entornos sin GPU ni cloud.
- Prototipado de VLM en el borde: base para experimentar con el pipeline RKLLM + RKNN y validar latencia y precisión antes de escalar a un modelo mayor o a otro SoC.
- No recomendado para automatización de GUI: el propio autor reporta un 13 % de acierto en grounding de elementos de pantalla, por lo que no es adecuado para agentes que operen interfaces gráficas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Generacion (LLM) | 14,1 tok/s | ROCK 5C, relojes fijados |
| Memoria (LLM + vision) | ~4,3 GB | ROCK 5C, relojes fijados |
| Grounding de objetos en imagenes naturales | mejor que Qwen3.5-2B (sin cifra) | Segun el autor, el mejor de los modelos probados en la placa |
| Grounding de elementos GUI (ScreenSpot-v2, subconjunto de 32 muestras) | 13 % (dos iteraciones de zoom) | Frente al 53 % de Qwen3.5-2B |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588 o RK3588S con NPU; no se ejecuta en GPU convencional ni en CPU genérica sin reconversión.
- Memoria: aproximadamente 4,3 GB para LLM + encoder visual en la configuración medida (ROCK 5C).
- Runtime: librkllmrt 1.3.1 (LLM) y librknnrt 2.5.0 (visión); versiones distintas pueden no cargar los artefactos.
- Almacenamiento: repositorio de 3,2 GB (pesos `.rkllm` + `.rknn` + scripts de conversión).
- No cabe en GPU de consumo tipo RTX 4090 porque el formato no es compatible con CUDA; para ese hardware habría que usar el modelo base original en safetensors/GGUF.
- Despliegue: exclusivamente mediante las runtimes de Rockchip; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 14,1 tok/s de generación con relojes fijados; no se reporta latencia de prefill ni tiempo de codificación visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| WeVisOne-VL-2B-RK3588-rkllm | 2B | no disponible | `.rkllm` + `.rknn`, NPU RK3588 | Apache-2.0 | 14,1 tok/s; fuerte en grounding natural, débil en GUI |
| tencent/WeVisOne-VL-2B (base) | 2B | no disponible | safetensors, GPU/CPU | Apache-2.0 | Modelo original sin cuantizar; referencia de calidad |
| Qwen3.5-2B | ~2B | no disponible | según despliegue | no disponible | 53 % en el subconjunto ScreenSpot-v2 citado; mejor en GUI que esta conversión |

## Limitaciones y advertencias

- Grounding de elementos de interfaz gráfica muy débil (13 % en el subconjunto de ScreenSpot-v2), por falta de entrenamiento en ese formato.
- Solo chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Cuantización w8a8 en el LLM: puede degradar la calidad respecto al modelo base en tareas sensibles a precisión numérica.
- Dependencia estricta de versiones de runtime (librkllmrt 1.3.1, librknnrt 2.5.0); actualizaciones pueden romper la compatibilidad.
- El pipeline de unión (preprocesado, concatenación de embeddings, inyección) no se entrega como script listo; requiere implementación propia y conocimiento de la API de Rockchip.
- Riesgo de alucinación inherente a un VLM de 2B; no se han publicado evaluaciones de sesgo ni de robustez.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el `LICENSE` del repositorio y las condiciones de las runtimes propietarias de Rockchip.
- No apto para despliegue en GPU estándar sin reconvertir al formato del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oliver0804/WeVisOne-VL-2B-RK3588-rkllm
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-2B
- Scripts de conversión: directorio `conversion/` del repositorio de Hugging Face
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
