# Clin4/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una conversión al formato GGUF del modelo OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez es una versión "abliterated" (con las capas de rechazo eliminadas mediante edición de pesos) de Thinking Machines' Inkling 2 Mini. El repositorio lo publica el usuario Clin4 y su propósito es ofrecer pesos listos para ejecutarse con llama.cpp, incluyendo soporte de entrada de imagen mediante un proyector de visión separado. La arquitectura es un transformer de mezcla de expertos (MoE) con capacidad image-text-to-text, y el recuento real de parámetros en safetensors es de 26.070.385.152 (26,07 mil millones).

La relevancia de esta ficha radica en que combina tres características poco habituales en un mismo paquete GGUF: arquitectura MoE, capacidad multimodal (visión) y una variante sin censura. El autor advierte explícitamente de que la conversión no está calibrada con matrices de importancia y de que la cuantización híbrida Q4_0/Q8_0 introduce pérdida adicional, ya que el checkpoint original almacena los expertos en NVFP4/MXFP8 y la conversión los expande y recuantiza.

El repositorio tiene 44,1 GB y contiene tres archivos: una variante híbrida de 15,6 GB, una variante Q8_0 de 27,8 GB y un proyector de visión BF16 de 642 MB. La licencia declarada es Apache 2.0. No se han publicado datos de benchmarks ni lista de idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), multimodal image-text-to-text |
| Parámetros totales | 26.070.385.152 (26,07 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 1024`) |
| Tipos de cuantización | Híbrida Q4_0 (expertos enrutados) + Q8_0 (matrices no-expertas elegibles) + F32 (tensores sensibles); Q8_0 + F32; proyector de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), más proyector mmproj en BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con capacidad de procesamiento de imagen y texto, según indican los tags `mixture-of-experts` e `image-text-to-text`. La información disponible no detalla el número de expertos, la ratio de activación, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. El modelo original procede de Thinking Machines (Inkling 2 Mini), y la variante Uncensored es una versión abliterated que elimina la dirección de rechazo en los pesos.

La innovación técnica destacable de esta publicación es el esquema de conversión: el autor aplicó el cuantizador Python Q4_0 ya existente en llama.cpp (commit `29b52d398b294509746ec0a3f28948a3107c0213`) a los expertos enrutados, mantuvo matrices no-expertas en Q8_0 y tensores sensibles en F32. Verificó el SHA-256 del checkpoint fuente antes de convertir y comprobó que ambos archivos comparten los mismos 704 nombres y dimensiones de tensores, así como la misma metadata de arquitectura y tokenizer que el GGUF upstream de Inkling 2 Mini. Los pesos MTP/especulador separados no se incluyen en la conversión.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados mediante el proyector `mmproj-Inkling-2-Mini-Uncensored-BF16.gguf`.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo "uncensored": la variante abliterated reduce los rechazos del modelo base, si bien el autor no aporta métricas de eficacia de este comportamiento.

## Casos de uso

- Inferencia local con llama.cpp en estaciones de trabajo: el archivo híbrido de 15,6 GB permite ejecutar un MoE de 26 mil millones de parámetros en equipos con más de 15,6 GB de memoria o swap suficiente, según indica el autor.
- Análisis de imágenes en servidor: mediante `llama-server` con el flag `--mmproj` se puede enviar imagen y texto; el autor verificó que el modelo identificó correctamente una imagen de color rojo sólido.
- Investigación sobre alineación y censura: la variante abliterated sirve para estudiar el comportamiento del modelo sin las capas de rechazo y compararlo con el original.
- Prototipado de asistentes multimodales: la combinación de texto e imagen en un único GGUF facilita desplegar demos conversacionales que acepten capturas o fotografías.
- Despliegue con requisitos de cuantización agresiva: la variante Q8_0 (27,8 GB) ofrece mayor fidelidad numérica para entornos con memoria abundante, mientras que la híbrida prioriza huella reducida.
- Evaluación de pérdida por cuantización: el autor documenta RMSE relativo por tensor, lo que permite usar el repo como caso de estudio de cómo la recuantización de expertos NVFP4/MXFP8 afecta a la fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de verificación de la conversión: peor RMSE relativo de 0,00568 en las 20 matrices de atención editadas, RMSE relativo máximo de 0,10031 en las 144 filas de expertos muestreadas para la híbrida y 0,00657 para Q8_0, y coincidencia byte a byte de los 422 tensores de visión con el proyector BF16 upstream. Estas cifras miden fidelidad de conversión, no calidad general ni eficacia del "uncensoring".

## Requisitos de hardware

- VRAM/memoria estimada: la variante híbrida necesita más de 15,6 GB de memoria o swap suficiente; la Q8_0 requiere considerablemente más (archivo de 27,8 GB).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, la híbrida encaja en GPUs de 24 GB (RTX 3090, RTX 4090) y la Q8_0 en GPUs de 32-48 GB (A6000, A100 40 GB) o superiores.
- ¿Cabe en GPU de consumo? La híbrida sí en GPUs de 24 GB con margen ajustado; la Q8_0 no en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (build con soporte de bucle Inkling 2, p. ej. b12600 o superior), `llama-cli` y `llama-server`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor solo indica que ambas variantes cargaron y generaron tokens con b12600 en pruebas cortas no representativas de calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-GGUF (este) | 26,07 mil M | no disponible | Texto + imagen | Apache 2.0 | GGUF |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | Texto + imagen | no disponible | safetensors (fuente) |
| Inkling 2 Mini (Thinking Machines, upstream) | no disponible | no disponible | Texto + imagen | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización híbrida no es Q4_K_M y no está calibrada con matrices de importancia; el autor lo advierte explícitamente.
- El checkpoint fuente almacena los expertos en NVFP4/MXFP8; la conversión los expande y recuantiza, añadiendo pérdida de cuantización (RMSE relativo máximo de 0,10031 en filas de expertos).
- No se incluyen los pesos MTP/especulador separados, por lo que no se puede aprovechar la decodificación especulativa del modelo original.
- La variante abliterated puede aumentar el riesgo de contenido nocivo o sesgado y no hay métricas publicadas sobre su eficacia o efectos secundarios.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada; el ejemplo de la model card usa `-c 1024`.
- La CLI de imagen independiente falló en la máquina de conversión; se recomienda usar la ruta de `llama-server` para entrada de imagen.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base upstream deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Clin4/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- llama.cpp (repositorio y builds): https://github.com/ggml-org/llama.cpp
