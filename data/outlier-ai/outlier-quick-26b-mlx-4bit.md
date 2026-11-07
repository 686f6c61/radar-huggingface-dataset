# Outlier-Ai/Outlier-Quick-26B-MLX-4bit

## Resumen

Outlier Quick 26B-A4B (MLX 4-bit) es una conversión cuantizada a 4 bits en formato MLX del modelo base `google/gemma-4-26b-a4b-it`, publicada por Outlier-Ai. Se distribuye como artefacto de conversión para ejecución local en Apple Silicon (M1, M2, M3, M4) mediante la librería `mlx-lm` o a través de la aplicación de escritorio Outlier para macOS. El modelo emplea una arquitectura Mixture of Experts (MoE) dispersa con 25.805.936.206 parámetros totales y aproximadamente 4B parámetros activos por token, lo que sitúa su coste computacional por token en el rango de un modelo denso de 4B pese a disponer de la capacidad representacional de un modelo de 26B.

El modelo está orientado a chat general, razonamiento con modo thinking y uso de herramientas (function calling), y el propio autor lo posiciona explícitamente como no optimizado para generación de código. Soporta 15 idiomas declarados (inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco). La licencia es Apache 2.0, heredada del modelo base, y el repositorio ocupa 15,6 GB en safetensors cuantizados a 4 bits.

Su relevancia actual radica en la combinación de tres factores: la eficiencia de un MoE disperso con ~4B activos, la cuantización 4-bit que reduce el peso en disco y en memoria unificada, y el soporte nativo de MLX para Metal en macOS. Esto permite ejecutar un modelo de 26B parámetros en equipos de consumo Apple con memoria unificada moderada, sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) dispersa, transformer; conversión MLX 4-bit |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otros formatos en el repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx-lm` |
| Modelo base | google/gemma-4-26b-a4b-it |
| Tamano del repositorio | 15,6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento propio: Outlier-Ai toma el checkpoint `google/gemma-4-26b-a4b-it` y lo cuantiza a 4 bits en el formato de MLX. La arquitectura subyacente es un transformer con capas Mixture of Experts de routing disperso: de los 25,8B parámetros totales, solo aproximadamente 4B se activan por token, lo que reduce el coste de inferencia por token en comparación con un modelo denso del mismo tamaño total. El modelo base es una variante instruct (`-it`) de la familia Gemma 4, lo que implica un ajuste post-entrenamiento orientado a instrucciones y conversación, aunque la model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO en el modelo base.

La innovación técnica relevante en este artefacto es la cuantización 4-bit con kernels MLX optimizados para Metal, que permite cargar los pesos en memoria unificada de Apple Silicon y ejecutar la inferencia en GPU integrada. El autor declara soporte de modo thinking y function calling, funcionalidades heredadas del modelo base. No se documentan en la información disponible detalles sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia específicas de esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno en 15 idiomas.
- Razonamiento con modo thinking (cadena de razonamiento explícita).
- Function calling y tool use, según los tags del repositorio (`function-calling`, `tool-use`).
- Razonamiento multi-paso orientado a agentes.
- Capacidades multilingües declaradas: en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl.
- Ejecución local y offline en Apple Silicon (sin nube, sin cuotas de tokens).
- No está optimizado para generación de código, según declara explícitamente el autor.

## Casos de uso

- Asistente de chat local en macOS: el modelo se carga con `mlx-lm` o con la app Outlier y gestiona conversaciones multi-turno en el equipo del usuario, sin enviar datos a servidores externos. Adecuado por su naturaleza MoE con ~4B activos, que mantiene la latencia contenida en hardware Apple de consumo.
- Razonamiento privado sobre documentos sensibles: al ejecutarse completamente offline, permite procesar información confidencial (legal, médica, financiera) sin salida de datos a la nube, usando el modo thinking para tareas analíticas.
- Automatización de flujos con herramientas: gracias al soporte de function calling, puede integrarse en asistentes que invocan APIs locales o scripts del sistema (calendario, correo, ficheros) en un entorno de escritorio macOS.
- Atención al cliente en idiomas europeos y asiáticos: los 15 idiomas declarados permiten desplegar un asistente conversacional multilingüe en local para prototipado o entornos con restricciones de privacidad.
- Análisis y resumen de texto en local: para investigadores que necesitan procesar corpus sin conexión, el modelo ofrece razonamiento de gama 26B con coste de inferencia de ~4B activos.
- Evaluación y benchmarking en Apple Silicon: útil como referencia para medir throughput y latencia de un MoE 4-bit en M1/M2/M3/M4 con MLX, comparando con los otros tiers de Outlier (Nano 4B, Lite 9B, Core 27B).
- Prototipado de agentes multi-paso: el modo thinking y el tool use permiten construir pipelines de razonamiento encadenado antes de migrar a infraestructura de servidor.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| MMLU (stratified n=300) | accuracy | 0,7933 | Subconjunto estratificado de 300 preguntas, split test |
| HumanEval | pass@1 | 0,128 | Split test |

El resultado en HumanEval (12,8% pass@1) es coherente con la advertencia del autor de que el modelo no está optimizado para código. No se han publicado en la información disponible resultados de GSM8K, MMLU completo, ni comparativas directas con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 15,6 GB en safetensors 4-bit; se requiere al menos esa cantidad de memoria unificada libre, más overhead de contexto y KV cache. En la práctica, un Mac con 24 GB o más de memoria unificada es el mínimo razonable; 32 GB ofrece margen cómodo.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 en sus variantes Pro, Max y Ultra). No hay soporte CUDA documentado para estos pesos MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente (MacBook Pro, Mac Studio, Mac mini con 24 GB o más).
- Opciones de despliegue: `mlx-lm` (CLI y API Python), aplicación Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX específico.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a outlier.host/benchmarks para cifras de velocidad de inferencia en Mac con procedencia completa.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Outlier Quick 26B-A4B (MLX 4-bit) | 25,8B | ~4B | no disponible | Apache 2.0 | MLX safetensors 4-bit | Este modelo; MMLU 79,33% (n=300), HumanEval 12,8% |
| Outlier Core 27B (MLX 4-bit) | 27B (denso, segun denominacion) | no disponible | no disponible | Apache 2.0 | MLX 4-bit | Tier por defecto de Outlier, ~16 GB |
| Outlier Lite 9B (MLX 4-bit) | 9B | no disponible | no disponible | Apache 2.0 | MLX 4-bit | Tier equilibrado, ~6 GB |
| Outlier Code 27B (MLX 4-bit) | 27B | no disponible | no disponible | Apache 2.0 | MLX 4-bit | Variante ajustada para código |

Los tres modelos comparables pertenecen a la misma familia de distribución de Outlier-Ai para Apple Silicon. No se dispone de datos de benchmarks de los otros tiers en la información proporcionada, por lo que la comparación de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- Rendimiento en código bajo: HumanEval pass@1 de 12,8% según el autor; no usar para generación de código en producción.
- Benchmarks no verificados: los resultados de MMLU (n=300) y HumanEval están marcados como `verified: false` y el MMLU usa un subconjunto estratificado pequeño, lo que reduce la fiabilidad estadística.
- Sesgos: no documentados en la información disponible; al heredar del modelo base Gemma 4, arrastra los sesgos de dicho modelo, no evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de esta escala.
- Longitud de contexto: no disponible; limita la planificación de casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que los pesos subyacentes se rigen por la licencia del modelo base; conviene verificar los términos de `google/gemma-4-26b-a4b-it` antes de un despliegue comercial.
- Dependencia de plataforma: los pesos MLX solo se ejecutan en Apple Silicon; no hay ruta documentada para CUDA, ROCm ni CPU x86.
- Artefacto de conversión: no es un modelo entrenado por Outlier-Ai, sino una cuantización; la calidad final depende del checkpoint base y del proceso de cuantización 4-bit, con la degradación asociada.
- La model card promociona una aplicación comercial (Outlier Pro, 49 USD) y enlaza a outlier.ai, un servicio de anotación de datos distinto del distribuidor del modelo; no confundir ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit/blob/main/README.md
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Aplicación Outlier: https://outlier.host/
- Benchmarks con procedencia: https://outlier.host/benchmarks
- Captura del selector de tiers: https://outlier.host/screenshots/tier-picker.png
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Code 27B: https://huggingface.co/Outlier-Ai/Outlier-Code-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
