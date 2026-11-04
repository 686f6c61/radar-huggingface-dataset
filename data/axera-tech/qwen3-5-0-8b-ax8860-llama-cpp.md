# AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp

## Resumen

Qwen3.5-0.8B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo Qwen3.5-0.8B sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante una adaptación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una distribución de pesos en GGUF (Q8_0) junto con kernels precompilados para la NPU, un encoder visual en BF16 y los binarios de placa necesarios para la inferencia. El modelo base es un transformer denso de 772.845.888 parámetros con capacidades multimodales (texto e imagen).

La relevancia de esta ficha es práctica: demuestra la viabilidad de ejecutar un modelo de menos de mil millones de parámetros con entrada de imagen en hardware de borde (edge) con NPU dedicada, alcanzando 21.600 tokens/s en prefill de 4k y 125,6 tokens/s en decode, con un consumo de memoria NPU de 1,26 GB. Para desarrolladores que trabajan en sistemas embebidos, domótica, visión industrial o dispositivos sin GPU, este tipo de empaquetado reduce drásticamente la barrera de integración.

El contexto máximo soportado es de 16.384 tokens, la licencia no está declarada en la información disponible y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente (creada el 4 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión), ejecutado con llama.cpp y backend ggml-axera sobre NPU |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF Q8_0 en disco; conversión en carga a MXFP8 (E4M3 con escala E8M0 cada 32 elementos); embedding y cabeza de salida en Q8_0; encoder visual en BF16 |
| Idiomas soportados | No disponible (la model card incluye ejemplos en inglés y chino, pero no declara lista oficial) |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3.5-0.8b-q8_0.gguf`, `mmproj-qwen3.5-0.8b-bf16.gguf`) + kernels NPU precompilados |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.5-0.8B ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se detalla es la arquitectura de despliegue: el modelo se ejecuta sobre la NPU de cuatro núcleos del AX8860 con una organización de kernels particular. El prefill de todo el modelo se implementa como un único kernel, mientras que el decode se reparte en un kernel por cada grupo de 12 capas (la documentación menciona también grupos de 16 capas en la descripción de `kernels/`, lo que supone una inconsistencia menor en la model card). El encoder visual (ViT) se ejecuta íntegro en un solo kernel, con un coste de 80 ms más 20 ms de preprocesado en CPU.

Una innovación técnica destacable es la gestión de pesos: los kernels no contienen pesos; estos se cargan únicamente desde los GGUF y se convierten a MXFP8 en el momento de la carga (6,9 s), manteniendo una sola copia de los pesos en memoria NPU compartida entre prefill y decode. Esto reduce el uso de memoria a 1,26 GB en carga y en pico. No hay decodificación especulativa, ya que según el autor este tamaño de modelo no dispone de cabeza MTP. La imagen se escala a aproximadamente 1024 x 768, con hasta 768 tokens visuales (3072 parches de 16 x 16).

## Capacidades

- Generación de texto conversacional y completado de texto.
- Entrada multimodal de imagen: descripción de imágenes, reconocimiento de vehículos, texto en escena y personas (según los ejemplos de la model card).
- Conversación multi-turno en terminal mediante el flag `-c`.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) para integración en aplicaciones existentes.
- Procesamiento de prompts largos gracias al prefill de alto rendimiento (hasta 16.384 tokens de contexto).
- Soporte de inglés y chino en los ejemplos documentados; no se declara una lista oficial de idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Visión artificial en dispositivos de borde: el modelo puede describir imágenes capturadas por cámaras locales en un SoC AX8860 sin conexión a la nube, con 80 ms de codificación visual y 125,6 tokens/s de decode, adecuado para inspección o accesibilidad en tiempo casi real.
- Asistentes conversacionales embebidos: con contexto de 16.384 tokens y servidor compatible con OpenAI, se puede desplegar un chatbot local multi-turno en un dispositivo con NPU, sin depender de APIs externas.
- Procesamiento de documentos con OCR ligero: la capacidad de leer texto en imágenes (documentada en los ejemplos) permite extraer y resumir información de capturas o fotos en entornos sin GPU.
- Automatización industrial y domótica: al ejecutarse íntegramente en la NPU del AX8860 con 1,26 GB de memoria, encaja en controladores empotrados que requieren inferencia local con latencia baja y sin cloud.
- Prototipado rápido de aplicaciones multimodales: el script `run.sh` y el servidor OpenAI permiten validar flujos de texto e imagen en pocos minutos sobre hardware de bajo consumo.
- Investigación en eficiencia de inferencia: la conversión Q8_0 a MXFP8 en carga y la organización de kernels por grupos de capas sirven como referencia para estudiar cuantización y planificación de kernels en NPU.
- Sustitución de modelos mayores en tareas acotadas: para clasificación, resumen corto o respuesta a preguntas simples sobre imágenes, un modelo de 0,8B con 125 tokens/s puede ser suficiente y mucho más económico que alternativas en GPU.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de inferencia en el AX8860 con SDK V0.5.1 y NPU de 4 núcleos, no de benchmarks académicos (MMLU, HumanEval, GSM8K).

| Metrica | Resultado |
|---|---|
| Prefill de prompt de 4k (4000 tokens) | 21.600 tokens/s (11,9 ms por página de 256 tokens; +6,9 s de conversión inicial de pesos) |
| Decode en contexto corto | 125,6 tokens/s |
| Codificación de imagen | 80 ms (ViT completo en un kernel) + 20 ms de preprocesado en CPU |
| Tiempo de carga | 8,3 s |
| Memoria NPU (CMM) tras carga | 1,26 GB (pico 1,26 GB) |
| Memoria de sistema (pico) | 0,47 GB |
| Perplejidad en chino (conjunto interno, `-c 512`) | 40,76 en NPU frente a 40,13 en CPU (+1,6%) |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria NPU: 1,26 GB tras la carga (pico 1,26 GB); memoria de sistema: 0,47 GB en pico.
- Almacenamiento: repositorio de 1,1 GB (pesos Q8_0 de 0,83 GB + encoder visual BF16 de 0,21 GB + binarios y kernels).
- GPU dedicada: no aplica; la inferencia se realiza en la NPU del SoC, no en GPU.
- Cabe en GPU de consumo: no aplica para este empaquetado; el modelo base de 0,8B podría ejecutarse en CPU o GPU de consumo mediante llama.cpp estándar, pero esta distribución está pensada para la NPU AX8860.
- Despliegue: binarios `bin/` con `libggml-axera.so`, script `run.sh`, servidor OpenAI-compatible con `-np 1`; variables `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR`, `-ngl 99`, `-ub 4096 -b 4096` para prefill más rápido, `GGML_AXERA_PROF=1` para perfiles y `GGML_AXERA_TEMP_MAX` para control térmico.
- Latencia y throughput: prefill 21.600 tokens/s, decode 125,6 tokens/s, carga 8,3 s, codificación de imagen 100 ms totales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de licencia que permitan una comparación rigurosa con alternativas. Se indica "no disponible" para los modelos comparables. Como referencia cualitativa, esta distribución se diferencia de un despliegue estándar de llama.cpp en que está optimizada para la NPU AX8860 y no para CPU/GPU genéricas; cualquier comparación con otros modelos de 0,8B requeriría datos de calidad (MMLU, HumanEval) que no se han publicado aquí.

## Limitaciones y advertencias

- La NPU queda ocupada en exclusiva por los 4 núcleos; no se pueden ejecutar otros programas NPU en paralelo.
- Solo admite una secuencia: el servidor debe lanzarse con `-np 1`, lo que limita el batching y el throughput agregado en producción.
- Contexto máximo de 16.384 tokens; el autor indica que habrá versiones de contexto más largo, pero no están disponibles.
- Sin decodificación especulativa (no hay cabeza MTP en este tamaño), lo que limita la latencia en decode frente a configuraciones con draft model.
- Resultados no deterministas: ejecuciones repetidas del mismo input pueden diferir ligeramente por el orden de acumulación en la NPU; la calidad se mantiene, pero no es apta para aplicaciones que exijan reproducibilidad bit a bit.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor o al repositorio del modelo base.
- Idiomas no declarados oficialmente; los ejemplos se limitan a inglés y chino.
- Riesgo de alucinación inherente a un modelo de 0,8B, especialmente en razonamiento complejo, matemáticas o conocimiento factual extenso; no se han publicado evaluaciones de sesgo.
- Dependencia de hardware y SDK concretos (AX8860, SDK V0.5.0+), lo que reduce la portabilidad frente a despliegues GGUF estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp
- llama.cpp adaptado (rama `axera-dev`): https://github.com/ZHEQIUSHUI/llama.cpp
- Kernels NPU (rama `main`): https://github.com/ZHEQIUSHUI/ax-dsl-kernels
