# NikiPshg/view

## Resumen

Este repositorio de Hugging Face, `NikiPshg/view`, no contiene un modelo en sí, sino un conjunto de benchmarks de rendimiento del modelo de síntesis de voz **Qwen3-TTS** ejecutados sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition. Los estudios comparan dos variantes de Qwen3-TTS (1.7B y 0.6B) bajo dos configuraciones de inferencia: un vocoder basado en TensorRT (desplegado en Triton) frente al vocoder nativo en PyTorch/eager, en una ruta completa de servicio con normalización de texto ruso, marcado de estrés (Silero Stress), vLLM y síntesis de voz.

El trabajo es relevante para equipos que despliegan TTS en producción con alta concurrencia, ya que cuantifica el impacto del vocoder en la latencia, el rendimiento y la calidad de reproducción (gaps audibles). El repositorio incluye tablas detalladas de mediciones, scripts de prueba y datos crudos en directorios `metrics/`, además de informes separados para cada estudio (`VOCODER_RUNTIME_BENCH.md` y `QWEN06B_BENCH.md`). No se proporciona el código del modelo ni los pesos; solo los resultados de las pruebas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Qwen, no se especifica) |
| Parametros totales | 0.6B y 1.7B (variantes evaluadas) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (según nombre de los modelos: `Qwen3-TTS-RU-CallCenter-stressed`, `Qwen3-TTS-12Hz-0.6B-Base`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo contiene scripts y datos, no pesos) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo Qwen3-TTS (número de capas, tipo de atención, etc.). Los benchmarks del repositorio se centran en el **flujo de inferencia**, no en el entrenamiento. Se sabe que el modelo genera audio PCM16 mono a 24 kHz, y que el pipeline de prueba incluye normalización de texto ruso, marcado automático de estrés con Silero, y un vocoder `code2wav` que puede ejecutarse en TensorRT o en PyTorch eager. El estudio no revela datos de preentrenamiento ni técnicas de optimización (RLHF, DPO, etc.).

## Capacidades

- **Síntesis de voz en ruso**: los modelos evaluados están orientados a escenarios de call center en ruso, con normalización de texto y estrés automático.
- **Clonación de voz**: el benchmark utiliza una muestra de voz base (`10_ekaterina.wav`) para clonar el timbre.
- **Salida de audio a 24 kHz**: PCM16 mono.
- **Integración con vLLM y Triton**: el pipeline se sirve a través de FastAPI y vLLM, con el vocoder en Triton (para la ruta TRT).
- **Soporte de concurrencia**: el estudio mide hasta 60 sesiones concurrentes, con control de SLO y detección de gaps audibles.
- **Sin soporte de tool calling ni razonamiento multi-step**: no se mencionan (es un modelo de TTS, no un LLM general).

## Casos de uso

- **Atención al cliente automatizada en call centers**: el modelo está específicamente entrenado para escenarios de call center en ruso, con estrés automático y normalización de texto. El benchmark con 60 sesiones concurrentes y SLO de 200 ms de gap audibles muestra que el vocoder TensorRT mantiene la calidad bajo carga alta, lo que permite desplegar servicios de IVR con respuesta de voz en tiempo real.
- **Servicios de voz interactiva (IVR)**: la integración con FastAPI y vLLM permite construir sistemas de respuesta de voz en arquitecturas de microservicios, donde el modelo puede escalar horizontalmente. La medición de TTFA (time-to-first-audio) y E2E ayuda a dimensionar el hardware.
- **Optimización de latencia en TTS**: el estudio A/B con vocoder TRT vs nativo es útil para decidir si invertir en optimización con TensorRT en Triton. En el benchmark, el vocoder TRT mantiene TTFA p95 por debajo de 600 ms a concurrencia 60, mientras que el nativo supera los 2.8 segundos.
- **Pruebas de carga y dimensionamiento**: los datos de concurrency 10-60 permiten a los ingenieros calcular cuántas sesiones puede atender un solo nodo con una RTX PRO 6000 Blackwell, y decidir el número de réplicas.
- **Evaluación de calidad de reproducción**: el sistema de detección de gaps (micro-gaps y audibles) puede integrarse en un pipeline de monitorización para alertar sobre degradación de servicio.
- **Investigación en optimización de vocoder**: los resultados comparativos entre PyTorch eager y TensorRT son de referencia para quienes trabajan en aceleración de vocoders TTS.

## Benchmarks y rendimiento

El repositorio proporciona resultados de carga para el modelo de 1.7B (`Qwen3-TTS-RU-CallCenter-stressed`) con vocoder TRT vs nativo. Los datos clave se extraen de la model card:

**Gap scaling (concurrencia 10-60)**

| Concurrencia | TRT gaps/100 turnos | TRT audibles | Nativo gaps/100 turnos | Nativo audibles | Nativo turnos con gap audible |
|---:|---:|---:|---:|---:|---:|
| 10 | 0.00 | 0 | 0.00 | 0 | 0.00% |
| 20 | 0.00 | 0 | 1.68 | 0 | 0.00% |
| 30 | 0.00 | 0 | 6.18 | 6 | 3.37% |
| 40 | 0.81 | 0 | 14.63 | 14 | 5.69% |
| 50 | 2.26 | 0 | 23.61 | 28 | 8.52% |
| 60 | 4.81 | 0 | 43.85 | 54 | 12.57% |

**Latencia y throughput**

| Concurrencia | TRT TTFA p95 (ms) | Nativo TTFA p95 (ms) | TRT E2E p95 (ms) | Nativo E2E p95 (ms) | TRT audio x | Nativo audio x | TRT SLO | Nativo SLO |
|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|
| 10 | 173.5 | 202.5 | 1,120.7 | 1,126.1 | 7.64 | 7.79 | PASS | PASS |
| 20 | 259.9 | 440.8 | 1,210.3 | 1,280.7 | 16.87 | 16.21 | PASS | PASS |
| 30 | 278.6 | 489.6 | 1,179.3 | 1,242.6 | 23.51 | 23.82 | PASS | PASS |
| 40 | 504.6 | 1,151.0 | 1,243.8 | 2,004.0 | 31.13 | 31.01 | PASS | FAIL |
| 50 | 522.4 | 1,720.7 | 1,258.9 | 2,315.6 | 39.05 | 39.02 | PASS | FAIL |
| 60 | 578.2 | 2,816.9 | 1,319.6 | 3,658.6 | 47.40 | 45.16 | PASS | FAIL |

No hay benchmarks de calidad de voz (MOS, WER, etc.) ni comparativas con otros modelos TTS en el repositorio.

## Requisitos de hardware

- **GPU utilizada**: NVIDIA RTX PRO 6000 Blackwell Server Edition (no se especifican VRAM ni núcleos exactos en el README).
- **VRAM estimada**: no se indica en el repositorio; depende de la variante del modelo (0.6B o 1.7B) y de la cuantización.
- **Compatibilidad con GPU de consumo**: no se menciona, pero por el tamaño (0.6B-1.7B) podría caber en GPUs con 8-16 GB, aunque el pipeline completo (vLLM + vocoder + Silero) requeriría más. No hay datos concretos.
- **Opciones de despliegue**: el benchmark usa FastAPI + vLLM + Triton (para TRT) y PyTorch eager. No se menciona llama.cpp ni Ollama.
- **Latencia**: TTFA p95 entre 149 ms (concurrencia 10) y 578 ms (concurrencia 60) en la ruta TRT. E2E p95 entre 1.1 s y 1.3 s en TRT.
- **Throughput**: factor de audio (audio x) entre 7.64 y 47.40 en TRT, similar al nativo hasta concurrencia 50.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos TTS en el repositorio. La información disponible solo compara dos configuraciones de inferencia del mismo modelo (TRT vs nativo). No hay datos de modelos como XTTS, VITS, etc.

## Limitaciones y advertencias

- **El repositorio no es el modelo**: contiene benchmarks, no pesos del modelo. Para usar Qwen3-TTS hay que descargarlo del repositorio oficial de Qwen (no enlazado aquí).
- **Idioma**: los modelos evaluados están orientados al ruso (normalización y estrés), no al español. No hay evidencia de soporte multilingüe.
- **Sesgos y alucinaciones**: no se abordan sesgos o alucinaciones; es un TTS, no un LLM.
- **Licencia**: no se especifica, por lo que el uso comercial no está garantizado. Hay que consultar la licencia del modelo Qwen3-TTS original.
- **Calidad de audio**: no hay métricas subjetivas (MOS) ni comparación con otros vocoders.
- **Hardware específico**: los resultados son válidos para la RTX PRO 6000 Blackwell; en GPUs de menor capacidad los números cambiarán.
- **SLO definido por el autor**: el límite de 200 ms de gap audible es un umbral elegido por el autor; no es un estándar universal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NikiPshg/view
- Datasets asociados: https://huggingface.co/datasets/NikiPshg/view
- Perfil de GitHub del autor: https://github.com/NikiPshg
- Informe detallado del estudio 1.7B: `VOCODER_RUNTIME_BENCH.md` (en el repo)
- Informe detallado del estudio 0.6B: `QWEN06B_BENCH.md` (en el repo)

Nota: no se encontraron enlaces al modelo Qwen3-TTS original ni a documentación oficial de Alibaba en la información proporcionada.
