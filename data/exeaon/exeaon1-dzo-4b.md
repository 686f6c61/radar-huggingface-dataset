# Exeaon/Exeaon1-Dzo-4B

## Resumen

Exeaon1-Dzo-4B es un modelo de lenguaje comprimido desarrollado por Exeaon (Zenux Plimver Technologies LTD, Ghana), que parte de Qwen/Qwen3-4B como modelo base y lo comprime mediante la técnica E-PURE. El resultado es un modelo que se distribuye en formato `.ebin` y se ejecuta con el runtime `epure-runtime`, manteniendo los pesos comprimidos en memoria sin ensamblar nunca la matriz densa. Esto reduce el tamaño en disco a 2.040 GB (compresión 3.67x) y el pico de VRAM a 5.02 GB, frente a los 8.65 GB del modelo base en fp16. Está pensado para despliegue en entornos edge y CPU, aunque también funciona en GPU.

El modelo hereda las capacidades de Qwen3-4B (generación de texto, razonamiento, comprensión del inglés) pero con una pérdida de calidad controlada: mantiene una retención del 98.1% de la precisión media en benchmarks de razonamiento y lenguaje. La compresión es lossy, y las tareas que dependen más del razonamiento (como ARC-Challenge) degradan algo más que las de clasificación o recuperación. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y redistribución con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) comprimido con E-PURE |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | E-PURE (codebook + escalas por grupo, 4.33 bits por peso medidos por entropía del índice) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ebin` (formato propio de E-PURE, no safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-4B, un transformer denso de 3.09 mil millones de parámetros, pero los pesos se comprimen mediante E-PURE. Este método cuantiza los pesos en un codebook con escalas por grupo y mantiene los índices de cuantización congelados. El runtime `epure-runtime` ejecuta kernels fusionados en CPU (compilados en el wheel) y en GPU (Triton) que operan directamente sobre los índices comprimidos, sin materializar la matriz densa. La compresión se realiza mediante calibración, pero el proceso de entrenamiento del modelo base es el de Qwen3-4B; no se especifican los datos de entrenamiento del modelo comprimido. Una característica destacada es que permite fine-tuning sin descomprimir: solo se entrenan el codebook y las escalas por grupo (aproximadamente el 1% de los valores de peso), mientras los índices permanecen congelados, lo que reduce la memoria de entrenamiento a la de las activaciones.

## Capacidades

- Generación de texto en inglés, con razonamiento básico y comprensión del lenguaje.
- Ejecución en CPU con kernel fusionado que supera al modelo denso en velocidad cuando el ancho de banda es el cuello de botella.
- Ejecución en GPU con footprint reducido: pico de VRAM de 5.02 GB (frente a 8.65 GB en fp16), lo que deja más espacio para la caché KV.
- Fine-tuning eficiente sin descompresión: solo se entrenan el codebook y las escalas por grupo, con verificación de que los índices no se mueven.
- Compatible con el runtime `epure-runtime` vía pip, sin necesidad de toolchain Rust.
- No se especifican en la información capacidades de tool calling, visión o audio; el modelo base Qwen3-4B podría tenerlas, pero no están documentadas en la ficha.

## Casos de uso

- **Clasificación y etiquetado de texto en producción**: la degradación en tareas de clasificación es menor que en razonamiento, y el bajo consumo de VRAM permite desplegarlo en servicios con GPUs de gama media o incluso CPU, por ejemplo para moderación de contenido o categorización de documentos.
- **Búsqueda semántica y recuperación de información**: dado que el modelo mantiene un rendimiento estable en tareas de comprensión, puede usarse para generar representaciones de texto y sistemas de búsqueda en inglés, con el beneficio de ocupar menos memoria que el modelo base.
- **Asistente conversacional en CPU**: con 8.5 tokens por segundo en batch 1, puede servir como asistente en entornos sin GPU, como servidores de gama baja o dispositivos embebidos, manteniendo una latencia aceptable para interacciones cortas.
- **Despliegue en dispositivos edge**: con un tamaño en disco de 2.04 GB y pico de VRAM de 5.02 GB, es viable ejecutarlo en dispositivos con 4-6 GB de memoria, como NVIDIA Jetson o mini-PCs, para generación de texto local.
- **Fine-tuning de dominio con recursos limitados**: la capacidad de entrenar solo el codebook y las escalas (≈1% de los pesos) permite adaptar el modelo a un dominio específico (por ejemplo, resúmenes médicos o legales) con una GPU de 8 GB o incluso CPU, sin descomprimir el modelo.
- **Prototipado rápido en entornos con restricciones de hardware**: su licencia Apache-2.0 y el formato `.ebin` con runtime simple permiten integrarlo en pipelines de experimentación sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados medidos contra el modelo base en el mismo hardware y harness (Tesla T4, torch 2.5.1+cu121, lm-eval 0.4.12, limit 300):

| Benchmark | Qwen3-4B | Exeaon1-Dzo-4B | Delta |
|---|---|---|---|
| ARC-Challenge | 51.67 | 49.33 | -2.34 |
| ARC-Easy | 78.33 | 76.00 | -2.33 |
| HellaSwag | 57.67 | 57.67 | +0.00 |
| PIQA | 74.67 | 74.33 | -0.34 |
| **Media** | **65.59** | **64.33** | **-1.25** |

Retención media: **98.1%**. La degradación se concentra en tareas de razonamiento (ARC), mientras que HellaSwag no muestra pérdida. En cuanto a velocidad y footprint:

| Métrica | Qwen3-4B | Exeaon1-Dzo-4B |
|---|---|---|
| Decode, batch 1 | 11.9 tok/s | 8.5 tok/s |
| Decode, batch 8 | 89.0 tok/s | 30.1 tok/s |
| Pico de VRAM | 8.65 GB | 5.02 GB |

El autor advierte explícitamente: en GPU el modelo es más lento que el fp16 denso, porque los kernels de tensor cores de GPU están muy optimizados y la dequantización cuesta más de lo que ahorra la compresión. La ventaja en GPU es el footprint (espacio en VRAM), no la velocidad. En CPU, donde el ancho de banda es el factor limitante, el kernel fusionado gana en velocidad y footprint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: pico de 5.02 GB en GPU (medido en T4 con batch 1). Para contextos largos, la KV cache puede incrementar el uso; no se especifica el tamaño de la caché.
- **GPU recomendadas**: Tesla T4 (usada en las pruebas), GPUs con 6 GB o más VRAM (RTX 2060, 3060, 4060, etc.) pueden ejecutar el modelo, dejando espacio para KV cache. En GPUs con 4 GB podría no caber con contexto moderado.
- **CPU**: el kernel fusionado de CPU está incluido en el wheel de `epure-runtime`, por lo que puede ejecutarse en CPU sin GPU, con rendimiento de 8.5 tok/s en batch 1 (medido en T4 como referencia).
- **Opciones de despliegue**: `epure-runtime` vía pip, con API Python (`load`, `generate`) y CLI (`epure run`). No hay soporte para vLLM, Ollama o llama.cpp documentado.
- **Latencia y throughput**: 8.5 tok/s (batch 1) y 30.1 tok/s (batch 8) en GPU T4; en CPU se espera similar o mejor que el fp16, pero no se especifican cifras.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos cuantizados o comprimidos en la información proporcionada. La única comparación directa es contra el modelo base:

| Modelo | Parámetros | Tamaño en disco | Pico de VRAM | Precisión media (ARC, HellaSwag, PIQA) | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B (fp16) | 3.09B | ~8 GB (fp16) | 8.65 GB | 65.59 | Apache-2.0 |
| Exeaon1-Dzo-4B | 3.09B (comprimido) | 2.04 GB | 5.02 GB | 64.33 | Apache-2.0 |

Alternativas como GGUF de Qwen3-4B en 4 bits podrían tener un tamaño similar, pero no hay datos en la documentación para comparar. La ventaja de Exeaon1-Dzo-4B es que no necesita descompresión en memoria y permite fine-tuning sin descomprimir, algo que los formatos GGUF no ofrecen.

## Limitaciones y advertencias

- **Compresión lossy**: la degradación media es de -1.25 puntos (98.1% de retención), concentrada en tareas de razonamiento. Para aplicaciones que dependen críticamente de razonamiento complejo, el modelo puede no ser adecuado.
- **KV cache no comprimida**: la caché KV no se comprime por defecto y puede exceder el tamaño de los pesos en contextos largos, lo que limita la ventaja de footprint en diálogos extensos.
- **Rendimiento en GPU**: el decode en GPU es más lento que el modelo denso fp16 (8.5 vs 11.9 tok/s en batch 1), porque la dequantización no compensa la compresión en hardware con mucha banda ancha. Solo en CPU el kernel fusionado gana en velocidad.
- **Solo inglés**: la model card indica idioma `en`; no se documentan capacidades multilingües, aunque el modelo base podría tenerlas, no se confirma.
- **Hereda limitaciones del base**: el modelo comparte los sesgos, el conocimiento cutoff y las limitaciones de Qwen3-4B. No ha sido evaluado para uso crítico (médico, legal, financiero).
- **Formato propietario**: el formato `.ebin` solo es compatible con `epure-runtime`; no se puede cargar con Transformers u otros frameworks estándar, lo que limita la interoperabilidad.
- **Atribución**: el modelo no está afiliado ni respaldado por los autores de Qwen, y la licencia Apache-2.0 exige incluir los ficheros LICENSE y NOTICE originales, como se hace en el repo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Exeaon/Exeaon1-Dzo-4B)
- [Runtime `epure-runtime` (GitHub)](https://github.com/ExeaonLM/epure-runtime)
- [Modelo base Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Organización Exeaon en HuggingFace](https://huggingface.co/Exeaon)
- [GitHub de Exeaon](https://github.com/ExeaonLM)
