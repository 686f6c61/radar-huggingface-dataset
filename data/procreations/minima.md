# ProCreations/minima

## Resumen

Minima es una adaptación cuantizada del encoder `LiquidAI/LFM2.5-Encoder-350M`, desarrollada por ProCreations (SSH) mediante el framework open source [minima](https://github.com/SSHDotCodes/minima). El modelo reduce los pesos a formato ternario de 1.585 bits (valores `{-1, 0, +1}`) con activaciones dinámicas en int8, logrando un archivo de pesos de 223,9 MB frente a los 1.418,0 MB del original, una reducción del 84,2%. Está pensado para inferencia eficiente en CPU, con soporte de kernels optimizados AVX2/ARM NEON y una ruta alternativa basada en FBGEMM.

Minima conserva la ventana de contexto completa de 8.192 tokens del encoder original y mantiene una calidad media del 96,66% en un gate de seis tareas downstream respecto al modelo FP32, aunque no alcanza el umbral del 97% declarado por el autor, por lo que se distribuye como candidato a release, no como versión final. Es relevante para despliegues en entornos con recursos limitados, donde el ahorro de memoria y la aceleración en CPU son críticos sin renunciar a la capacidad de representación del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (W1.58A8, ternario 1.585 bits + activaciones int8) |
| Parámetros totales | 156.237.568 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Ternaria 1.58-bit (I2_S, cuatro trits por byte), activaciones int8, grupo de 32 con adaptadores de recuperación rank-128 FP16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (ver enlace en la model card) |
| Formato de pesos | safetensors con empaquetado físico I2_S (trits) |

## Arquitectura y entrenamiento

Minima no es un modelo entrenado desde cero, sino una conversión del encoder `LFM2.5-Encoder-350M` de Liquid AI. El proceso de adaptación, implementado en el framework minima, convierte los pesos originales a valores ternarios `{-1, 0, +1}` con un esquema de cuantización por grupos de 32 elementos y añade adaptadores de recuperación de rango 128 en FP16 para mitigar la pérdida de precisión. Las activaciones se mantienen en int8 dinámico. El resultado es una matriz efectiva ternaria más una matriz de recuperación de bajo rango, que se empaqueta físicamente en formato I2_S (cuatro trits por byte) para minimizar el uso de memoria.

El modelo base es un encoder de contexto largo (8.192 tokens), probablemente entrenado por Liquid AI con técnicas de eficiencia como mezcla de expertos o atención lineal, aunque los detalles específicos de su entrenamiento no se incluyen en la documentación disponible. La adaptación de Minima no modifica la arquitectura lógica, solo la representación de los pesos y el flujo de inferencia.

## Capacidades

- Representación de secuencias de hasta 8.192 tokens para tareas de clasificación, similitud semántica y extracción de características.
- Inferencia eficiente en CPU gracias a kernels AVX2/ARM NEON (ruta I2_S) y a la ruta FBGEMM con empaquetado dinámico int8.
- Reducción significativa de memoria: el archivo de pesos es un 84,2% más pequeño que el original, con una reducción del pico de RSS de entre el 23% y el 27% en las pruebas reportadas.
- Compatibilidad con el framework minima para integración en Python (`pip install minima-lfm`).
- No es un modelo generativo: no produce texto, ni soporta tool calling, agentes o razonamiento multi-paso.
- Sin capacidades multimodales (solo texto).

## Casos de uso

- Clasificación de documentos en entornos con recursos limitados: el modelo puede ejecutarse en CPU sin GPU, lo que permite desplegar clasificadores de texto (por ejemplo, categorización de tickets, detección de spam) en servidores económicos o dispositivos edge.
- Búsqueda semántica y recuperación aumentada (RAG): al ser un encoder, puede generar embeddings de pasajes y consultas para sistemas de búsqueda vectorial. Su contexto de 8.192 tokens permite procesar documentos largos completos sin truncamiento.
- Análisis de sentimiento en tiempo real: su baja latencia en CPU (80 ms para secuencias de 128 tokens, 248 ms para 512 tokens) lo hace adecuado para pipelines de procesamiento de redes sociales o reseñas.
- Clasificación de correos electrónicos o mensajes: con un fine-tuning ligero sobre el encoder, puede adaptarse a dominios específicos manteniendo un consumo de memoria reducido.
- Extracción de características para modelos downstream: las representaciones de salida pueden alimentar clasificadores lineales o MLPs en aplicaciones de NLP tradicionales.
- Prototipado rápido en entornos sin GPU: al poder ejecutarse en CPU con un footprint pequeño, es útil para desarrollo y pruebas en máquinas locales antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. Sin embargo, el autor reporta métricas de calidad del gate de seis tareas downstream, comparadas con el modelo FP32 original:

| Métrica | Valor |
|---|---|
| Retención media del gate (6 tareas, capado al 100%) | 96,66% |
| Retención media de 5 tareas no-CoLA | 98,05% |
| Retención en CoLA | 89,70% |
| Umbral declarado para release | 97% (no alcanzado) |

Además, se reportan resultados de rendimiento en CPU (Linux x86-64, FBGEMM, 16 hilos, una iteración de calentamiento y cinco medidas):

| Longitud de secuencia | FP32 mediana (ms) | Minima mediana (ms) | Speedup | Reducción pico RSS |
|---:|---:|---:|---:|---:|
| 128 | 181,62 | 80,82 | 2,25x | 23,81% |
| 512 | 479,12 | 247,94 | 1,93x | 26,77% |
| 2.048 | 1.402,74 | 1.280,92 | 1,10x | 26,94% |
| 8.192 | 7.878,43 | 7.312,03 | 1,08x | 24,42% |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el modelo no requiere GPU. Las pruebas se realizaron en Linux x86-64 con 16 hilos.
- Memoria RAM: el archivo de pesos ocupa 223,9 MB; el pico de RSS en las pruebas varió entre un 23% y un 27% menos que el modelo FP32, lo que lo hace viable en sistemas con 2-4 GB de RAM disponibles.
- Kernels optimizados: AVX2 (x86-64) y ARM NEON (para la ruta I2_S directa). La ruta FBGEMM es la predeterminada y la que ofrece mejor throughput medido.
- Opciones de despliegue: integración nativa con el paquete `minima-lfm` (Python). No se menciona compatibilidad con vLLM, Ollama o TGI, ya que es un encoder, no un LLM generativo.
- Latencia estimada: 80,82 ms para 128 tokens, 247,94 ms para 512 tokens, 1.280,92 ms para 2.048 tokens y 7.312,03 ms para 8.192 tokens (mediana, CPU de 16 hilos).
- CUDA: existe una ruta Triton, pero el kernel actual es más lento que el BF16 original en una H200, por lo que no se recomienda para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso |
|---|---|---|---|---|---|
| ProCreations/minima | 156M (lógicos) | 8.192 | Ternaria 1.58-bit + int8 | LFM Open v1.0 | Encoder CPU eficiente |
| LiquidAI/LFM2.5-Encoder-350M | 350M | 8.192 | FP32/BF16 | LFM Open v1.0 | Encoder de referencia |
| BERT-base (referencia) | 110M | 512 | FP32 | Apache 2.0 | Encoder clásico |

Minima se posiciona como una versión cuantizada del LFM2.5-Encoder-350M, con un tamaño de archivo 84,2% menor y una pérdida de calidad del 3,34% en el gate de tareas. Frente a BERT-base, ofrece una ventana de contexto mucho mayor (8.192 frente a 512) y una representación más moderna, aunque su licencia es más restrictiva. No se dispone de comparaciones con otros encoders ternarios.

## Limitaciones y advertencias

- Es un release candidate, no una versión final: no alcanza el umbral de calidad del 97% declarado por el autor (96,66% real). La retención en CoLA es notablemente inferior (89,70%).
- No es un modelo generativo: no puede producir texto, completar instrucciones ni mantener conversaciones. Su uso se limita a tareas de representación.
- La ruta CUDA (Triton) no está optimizada y es más lenta que el modelo original en GPU, por lo que no se recomienda su uso en hardware NVIDIA.
- La licencia LFM Open v1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos en el enlace proporcionado.
- No se han publicado detalles sobre los idiomas soportados ni sobre posibles sesgos del modelo base. Se recomienda evaluar en el dominio de aplicación concreto.
- El framework minima es reciente y puede tener limitaciones de madurez; la documentación disponible es escasa.
- La reducción de memoria se refiere al archivo de pesos, pero el pico de RSS total (incluyendo framework y activaciones) solo se reduce entre un 23% y un 27%, no el 84,2% que sugiere el tamaño del archivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ProCreations/minima)
- [Repositorio GitHub de minima](https://github.com/SSHDotCodes/minima)
- [Dataset de resultados](https://huggingface.co/datasets/ProCreations/minima-results)
- [Reporte de calidad (quality_gate.json)](https://huggingface.co/datasets/ProCreations/minima-results/blob/main/quality_gate.json)
- [Modelo base: LiquidAI/LFM2.5-Encoder-350M](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M)
- [Licencia LFM Open v1.0](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE)
