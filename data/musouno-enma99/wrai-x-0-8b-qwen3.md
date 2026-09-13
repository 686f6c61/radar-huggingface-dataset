# Musouno-Enma99/WRAI-X-0.8B-Qwen3

## Resumen

WRAI-X-0.8B-Qwen3 es un artefacto de investigación experimental publicado por el usuario Musouno-Enma99 que explora la "transmutación arquitectónica" (transplant) de un transformer convencional hacia un modelo recurrente híbrido. En lugar de entrenar desde cero, parte de los pesos de Qwen/Qwen3-0.6B, congela sus capas FFN SwiGLU, sus RMSNorm y sus embeddings, y sustituye el mecanismo de atención cuadrática por una retención recurrente de doble estado (M_t / R_t) inspirada en RetNet, combinada con una transformada wavelet de Haar discreta (DWT) de 4 niveles. El resultado es un modelo de 831.268.848 parámetros (~0,83B) que mantiene un estado recurrente de tamaño fijo.

La motivación declarada es eliminar el crecimiento lineal de la caché KV (O(T)) que consume memoria a medida que crece la longitud de secuencia. Según la auditoría del propio autor, el modelo mantiene un búfer de estado recurrente constante de 29,42 MB a lo largo de 28 capas, sin reasignaciones dinámicas de heap, tanto con contexto corto (T=16) como largo (T=8192), logrando una memoria de estado O(1) respecto a la longitud de contexto. La inferencia se ejecuta en un motor nativo en C con mmap de memoria virtual y SIMD AVX de 256 bits, sin dependencia de Python.

Se trata, en palabras del autor, de una prueba de concepto (Stage-1 Checkpoint) y no de un agente conversacional listo para producción. La coherencia lingüística está en fase temprana, con riesgo de bucles repetitivos y sintaxis poco natural en prompts complejos. Su público objetivo son investigadores de arquitecturas de IA, ingenieros de sistemas y aficionados al edge computing de bajo consumo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida recurrente: Retención de doble estado (RetNet-style) + Discrete Haar Wavelet Transform (DWT) de 4 niveles, con FFN SwiGLU, RMSNorm y embeddings congelados de Qwen3-0.6B |
| Parametros totales | 831.268.848 (~0,83B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma oficial; auditoría del autor probada hasta T=8192 con estado recurrente constante |
| Tipos de cuantizacion | INT8 simétrico row-wise (artefacto .bin); checkpoint PyTorch sin cuantizar (.pt) |
| Idiomas soportados | Inglés (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario nativo INT8 (`wrai_x_08b_int8.bin`, 1,35 GB) y checkpoint PyTorch (`wrai_x_08b_transplanted.pt`, 1,66 GB) |
| Motor de inferencia | Motor nativo en C (`c-native`), mmap Win32/POSIX, SIMD AVX 256-bit |
| Capas | 28 |
| Estado recurrente | 29,42 MB (constante respecto a la longitud de contexto) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B y aplica lo que el autor denomina "transplante arquitectónico": se conservan congelados los pesos de las capas FFN SwiGLU, las RMSNorm y los embeddings del modelo base, mientras que la atención cuadrática original se reemplaza por un mecanismo de retención recurrente de doble estado (M_t / R_t). Este mecanismo comprime el contexto de secuencia en matrices de estado de tamaño fijo (128 × 128) actualizadas de forma recursiva in-place, lo que da lugar a una memoria de estado persistente O(1) respecto a la longitud de contexto (zero KV-cache). Adicionalmente, se incorpora una Discrete Haar Wavelet Transform de 4 niveles que descompone las señales de representación latente en aproximaciones de baja frecuencia (semántica global) y detalles de alta frecuencia (sintaxis local).

El entrenamiento no se realiza desde cero, sino mediante un proceso de destilación/adaptación en el que se alinean las puertas de enrutamiento del adaptador y la compuerta residual de transplante α. En este checkpoint la compuerta α está deliberadamente fijada en un rango pequeño (~0,01) para preservar la estabilidad de la señal base durante la destilación inicial. El autor reporta estabilidad numérica del parámetro de decaimiento γ y de la normalización GroupNorm por cabeza de RetNet, sin deriva numérica ni activaciones explosivas en bucles largos de generación. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición del dataset, ni si se emplearon RLHF o DPO. Los idiomas declarados en la model card son únicamente inglés e indonesio.

## Capacidades

- Generación de texto autoregresiva con motor de inferencia propio en C, orientada a entornos de bajo consumo (CPU).
- Activación consistente de bloques de razonamiento estructurado tipo Chain-of-Thought mediante etiquetas `<think> ... </think>`.
- Gestión de contexto largo con memoria de estado constante (probado hasta T=8192 sin crecimiento de RAM), gracias al mecanismo de retención recurrente.
- Inferencia sin caché KV, con huella de memoria física plana independiente de la longitud de secuencia.
- Rutinas básicas de saludo y formateo de salida estructurada.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües limitadas a inglés e indonesio según los metadatos, con coherencia lingüística en fase temprana.

## Casos de uso

- Investigación en arquitecturas lineales alternativas a la atención: el modelo sirve como artefacto de estudio para analizar empíricamente si la retención recurrente de doble estado puede sustituir a la atención cuadrática preservando el conocimiento preentrenado de un transformer.
- Experimentación con zero KV-cache en sistemas embebidos: útil para validar que un modelo puede mantener contexto largo con una huella de memoria de estado constante (29,42 MB) en dispositivos con RAM muy limitada.
- Pruebas de inferencia en CPU de bajo consumo: el motor nativo en C permite ejecutar generación de texto en portátiles antiguos o APUs sin GPU dedicada, con fines de demostración y benchmarking.
- Reproducción de técnicas de transplante arquitectónico: investigadores pueden inspeccionar el checkpoint PyTorch para estudiar cómo se recombinan pesos congelados de FFN/RMSNorm/embeddings con módulos recurrentes nuevos.
- Estudio de compuertas residuales y destilación: el ajuste de la compuerta α (~0,01) constituye un caso práctico para analizar cómo calibrar la mezcla entre señal preentrenada y señal recurrente durante la adaptación.
- Plataforma educativa para estudiantes de sistemas: el binario y el motor en C con SIMD AVX sirven como ejemplo didáctico de despliegue nativo sin Python ni runtimes pesados.
- Benchmarking de estabilidad numérica recurrente: el modelo permite reproducir pruebas de deriva numérica en parámetros de decaimiento y normalización a lo largo de generaciones extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son métricas de sistema capturadas por el autor a nivel de kernel y hardware, que se reproducen a continuación tal como aparecen en la model card:

| Métrica de kernel y hardware | Valor medido |
|---|---|
| Binario del modelo en almacenamiento | 1.422.927.244 bytes (~1,35 GB) |
| Working set físico (RAM) | 912,90 MB |
| Fallos de página de hardware (MMU) | 234.259 páginas |
| Cálculo SIMD AVX | ~1,30 GFLOPs / token |
| Velocidad de generación (AMD A8 Puma+ APU, 2014) | ~2–3 tokens/segundo |

| Métrica de estado recurrente | Contexto corto (T=16) | Contexto largo (T=8192) |
|---|---|---|
| Estado recurrente persistente | 29,42 MB | 29,42 MB |
| Delta de estado | 0,0000 MB | 0,0000 MB |

Advertencia: estas cifras describen propiedades de memoria y cómputo, no la calidad del texto generado; no deben interpretarse como resultados de rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU para el motor nativo en C; el working set físico de RAM medido es de 912,90 MB en x86_64.
- Huella en disco: 1,35 GB (binario INT8) o 1,66 GB (checkpoint PyTorch).
- GPU recomendadas: no aplica para el motor nativo; el checkpoint PyTorch podría ejecutarse en GPU, pero no se especifican requisitos ni rendimiento en GPU.
- Compatibilidad con GPU de consumo: el modelo está pensado para CPU; cabe sin problema en cualquier equipo con ~1 GB de RAM libre. No se documentan pruebas en RTX 4090, A100, H100 u otras GPU.
- Requisito de CPU: instrucciones SIMD AVX de 256 bits (AVX2 en la práctica). No funcionará en CPUs sin AVX.
- Opciones de despliegue: motor nativo en C (`wrai_x.exe`), con mmap Win32/POSIX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es personalizada y no estándar.
- Latencia y throughput: ~2–3 tokens/segundo en una APU AMD A8 Puma+ de 2014; ~1,30 GFLOPs por token en cálculo cuantizado AVX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WRAI-X-0.8B-Qwen3 | ~0,83B | No disponible (probado a T=8192) | Recurrente RetNet + DWT (transplant de Qwen3-0.6B) | Apache 2.0 | HuggingFace + GitHub (0 descargas) |
| Qwen/Qwen3-0.6B (base) | ~0,6B | 32.768 tokens (según el modelo base) | Transformer denso | Apache 2.0 | HuggingFace |
| Alternativas recurrentes (RetNet, Mamba, RWKV) | No disponible | No disponible | Recurrente / SSM | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre WRAI-X y modelos recurrentes equivalentes en la información proporcionada. La comparación con Qwen3-0.6B se limita al origen de los pesos congelados, no a resultados de calidad.

## Limitaciones y advertencias

- Modelo experimental (Proof-of-Concept): no es un agente conversacional listo para producción. El autor lo etiqueta explícitamente como artefacto de investigación.
- Coherencia lingüística en fase temprana: es un checkpoint de Stage-1 con enrutamiento de adaptador y alineación de compuertas incipiente; puede producir bucles repetitivos y sintaxis poco natural con prompts complejos.
- Compuerta residual de transplante α muy conservadora (~0,01): limita intencionadamente la contribución del nuevo mecanismo recurrente, lo que reduce el impacto del transplante sobre la señal base.
- Lenguas limitadas a inglés e indonesio según los metadatos; no hay evidencia de soporte multilingüe amplio.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares que permitan evaluar su rendimiento real.
- Riesgo de alucinación: no evaluado en la información disponible; en un checkpoint en fase temprana de adaptación es previsible que sea elevado.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero al derivar de Qwen/Qwen3-0.6B conviene verificar las condiciones del modelo base y de cualquier dato de destilación empleado.
- Dependencia de hardware específico: el motor nativo en C requiere CPU con AVX de 256 bits; no es portable a cualquier entorno.
- Ecosistema limitado: no hay integración con vLLM, llama.cpp, Ollama ni TGI, por lo que su adopción en pipelines estándar es inviable sin trabajo adicional.
- Madurez del repositorio: 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Musouno-Enma99/WRAI-X-0.8B-Qwen3
- Repositorio GitHub: https://github.com/MusounoEnma/WRAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de RetNet (Microsoft Research, referencia citada por el autor): no disponible en la información proporcionada
- Resultados de búsqueda web: los resultados obtenidos (sistemler.com y subpáginas) no guardan relación con el modelo y se descartan por no ser relevantes.
