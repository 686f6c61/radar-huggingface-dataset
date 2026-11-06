# AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp

## Resumen

Qwen3.5-2B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo Qwen3.5-2B (1.942.653.248 parámetros) sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo entrenado por AXERA, sino de una adaptación de inferencia: los pesos se distribuyen en formato GGUF y los kernels de la NPU se generan a partir de esos mismos pesos en tiempo de carga, sin duplicar el modelo en memoria.

El interés técnico está en la integración completa del grafo en la NPU: el prefill de todo el modelo se ejecuta como un único kernel y el decode se agrupa en un kernel por cada bloque de 16 capas, con una sola copia de los pesos compartida entre ambas fases. El paquete incluye además el codificador visual en BF16, por lo que el modelo acepta entrada de texto e imagen, y expone un servidor compatible con la API de OpenAI.

Las cifras declaradas por el autor son notables para un dispositivo de borde: 16.000 tokens/s de prefill con un prompt de 4.000 tokens, 121,5 tokens/s de decode en contexto corto y un pico de 2,05 GB de memoria de NPU. La contrapartida es un contexto máximo de 16.384 tokens, una única secuencia concurrente y la ocupación exclusiva de los cuatro núcleos de NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con codificador visual; kernels NPU generados para ggml-axera |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (según `manifest.json` y límite `-c`) |
| Tipos de cuantizacion | MXFP4 en capas de proyección; Q8_0 en embedding y cabeza de salida; BF16 en el codificador visual |
| Idiomas soportados | no disponible (la model card incluye ejemplos en inglés y chino, sin lista formal) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-2b-mxfp4.gguf` de 1,3 GB y `mmproj-Qwen3.5-2B-BF16.gguf` de 0,8 GB) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto de despliegue, no el entrenamiento del modelo base. Qwen3.5-2B es un transformer de aproximadamente 1,94 mil millones de parámetros con capacidad multimodal, ya que el repositorio incluye un proyector y un codificador visual (`mmproj-Qwen3.5-2B-BF16.gguf`) que procesa imágenes en parches de 3072 posiciones, equivalentes a 768 tokens de imagen. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación relevante está en el backend de inferencia. Los kernels de NPU no contienen pesos: se convierten desde el GGUF al cargar el modelo (2,7 s) y se comparten entre prefill y decode, de modo que solo existe una copia de los pesos en la memoria de la NPU. El prefill se compila como un kernel único para todo el modelo, mientras que el decode se organiza en un kernel por grupo de 16 capas. El proceso de prompt usa páginas de 256 tokens con un coste de 15 ms por página. No hay decodificación especulativa, porque a este tamaño no existe cabeza MTP.

## Capacidades

- Generación de texto y completado de prompts, con ejemplos verificados en la model card ("The capital of France is" devuelve "Paris").
- Descripción y comprensión de imágenes: el ViT procesa la imagen completa en un solo kernel y genera descripciones correctas de vehículos, texto en escena y personas.
- Conversación multi-turno en terminal mediante el modo `-c`.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Procesamiento de prompts largos con `-ub 4096 -b 4096` para maximizar el rendimiento de prefill.
- Control térmico durante la inferencia mediante `GGML_AXERA_TEMP_MAX`, que pausa los kernels si la NPU supera el umbral configurado.
- Perfilado de tiempos por etapa con `GGML_AXERA_PROF=1`.
- No se documentan en la información disponible soporte de tool calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Inferencia de visión en dispositivos de borde: el paquete permite describir imágenes en local sobre una NPU de bajo consumo, sin GPU dedicada, con el ViT ejecutado íntegramente en un kernel y 768 tokens por imagen de 3072 parches.
- Asistentes conversacionales embebidos: el modo `-c` y el servidor OpenAI-compatible permiten montar un chat multi-turno en el propio dispositivo, con hasta 16.384 tokens de contexto acumulado.
- Procesamiento de documentos con OCR implícito: al describir correctamente texto en escena, el modelo sirve para tareas de lectura de carteles, etiquetas o paneles en flujos de inspección industrial.
- Puerta de enlace local para aplicaciones existentes: cualquier cliente que hable el protocolo de OpenAI puede apuntar a `http://<board>:8080/v1/chat/completions` sin cambios de código, lo que simplifica prototipos y pruebas de integración.
- Clasificación y resumen de textos cortos en el borde: con 121,5 tokens/s de decode en contexto corto, es viable generar resúmenes o respuestas de pocas decenas de tokens con latencia interactiva.
- Prototipado de pipelines multimodales en hardware Axera: el repositorio de kernels y la bifurcación de llama.cpp permiten medir el coste real de prefill y decode en la NPU antes de comprometer un producto.
- Evaluación comparativa NPU frente a CPU: la model card reporta una perplejidad en chino de 38,85 en NPU frente a 38,00 en CPU con el mismo GGUF (+2,2 %), lo que facilita validar la fidelidad numérica del backend.

## Benchmarks y rendimiento

| Métrica | Resultado (AX8860, SDK V0.5.1, NPU 4 núcleos) |
|---|---|
| Prefill con prompt de 4.000 tokens | 16.000 tokens/s (15 ms por página de 256 tokens; 2,7 s adicionales de conversión de pesos en el primer prompt) |
| Decode en contexto corto | 121,5 tokens/s |
| Codificación de imagen | 3.072 parches = 768 tokens de imagen, ViT completo en un kernel |
| Tiempo de carga | 5,5 s en caliente, 30 s en frío |
| Memoria de NPU (CMM) | 2,05 GB tras la carga, 2,05 GB de pico |
| Memoria de sistema (pico) | 0,8 GB |
| Perplejidad en chino (conjunto interno, `-c 512`) | 38,85 en NPU frente a 38,00 en CPU (+2,2 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- SoC objetivo: Axera AX8860 con NPU de cuatro núcleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria de NPU: 2,05 GB tras la carga, con pico de 2,05 GB; los pesos ocupan una única copia compartida entre prefill y decode.
- Memoria de sistema: pico de 0,8 GB.
- Almacenamiento: repositorio de 2,1 GB (1,3 GB de pesos del modelo y 0,8 GB del codificador visual).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el paquete está orientado a la NPU del AX8860 y no se documenta su uso en GPU.
- Despliegue: programas estáticos en `bin/` que solo requieren `/opt/lib` y libc, con `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; opciones `-ngl 99`, `-c` hasta 16384, `-np 1` en el servidor y `-ub 4096 -b 4096` para el prefill más rápido.
- Throughput y latencia: 16.000 tokens/s de prefill y 121,5 tokens/s de decode según las mediciones del autor.
- Restricción de convivencia: el proceso ocupa los cuatro núcleos de NPU, por lo que no puede ejecutarse junto a otros programas de NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-2B-AX8860-llama.cpp | 1,94 B | 16.384 | Sí (texto e imagen) | no disponible | NPU Axera AX8860 |
| Qwen3.5-2B (modelo base) | 1,94 B | no disponible en esta ficha | Sí, según el paquete multimodal | no disponible | GPU/CPU genéricas |
| llama.cpp con GGUF equivalente en CPU | 1,94 B | 16.384 | Sí | no disponible | CPU |
| Alternativas de ~2 B en el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada. El único contraste numérico publicado es el del mismo GGUF ejecutado en CPU, con una perplejidad de 38,00 frente a 38,85 en NPU.

## Limitaciones y advertencias

- El proceso consume de forma exclusiva los cuatro núcleos de NPU; ejecutar otros programas de NPU en paralelo provoca errores.
- Una sola secuencia: el servidor debe arrancarse con `-np 1`, lo que impide atender peticiones concurrentes.
- Contexto máximo de 16.384 tokens; el autor indica que habrá versiones de contexto más largo, pero no están disponibles.
- Sin decodificación especulativa, al no existir cabeza MTP en este tamaño.
- Resultados no deterministas: la variación en el orden de acumulación de la NPU puede producir diferencias mínimas entre ejecuciones del mismo prompt, aunque el autor afirma que la calidad no se ve afectada.
- Licencia no especificada en la información disponible: es imprescindible verificar los términos del modelo base Qwen3.5-2B y de los repositorios de kernels antes de un uso comercial.
- Idiomas soportados no documentados formalmente; solo hay evidencia de inglés y chino en los ejemplos de la model card.
- Riesgo de alucinación inherente a un modelo de 1,94 B, sin datos publicados de evaluación en tareas de razonamiento o código que permitan acotarlo.
- Dependencia estricta del SDK V0.5.0 o superior y de la plataforma AX8860; el paquete no es portable a otras NPU ni a GPU.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp
- Bifurcación de llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, ruta `ggml/src/ggml-axera/models/qwen35_whole`)
- Kernels de NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, ruta `models/qwen35_2b/whole`, fichero `kernels.md5`)
