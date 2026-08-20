# baa-ai/Qwen3.8-27B-RAM-31GB-GGUF

# Qwen3.8-27B-RAM-31GB-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de precisión mixta del modelo Qwen/Qwen3.8-27B, preparada por baa.ai. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida Gated Delta Net (atención lineal) más atención completa, y una ventana de contexto de 262 000 tokens. Esta versión GGUF está calibrada con importance matrix (imatrix) y aplica una asignación de precisión por tensor basada en sensibilidad (RAM probe allocator), logrando un tamaño de 31,2 GB con un promedio de 9,12 bits por peso.

La relevancia de este archivo radica en que permite ejecutar un modelo de razonamiento de última generación en hardware local con un consumo de memoria reducido respecto a los pesos originales en BF16 (55,6 GB). Sin embargo, exige una versión muy reciente de llama.cpp (build b10360 o posterior, de agosto de 2026) porque la arquitectura `qwen35` (Gated Delta Net + atención completa) solo se ha incorporado recientemente al runtime. Los runtimes estables como Ollama o LM Studio aún no lo soportan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Net (atención lineal) + atención completa (arch `qwen35`) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (según ficha del modelo base) |
| Tipos de cuantizacion | Mixta: Q4_K_M como base, con tensores en F16, Q8_0, Q6_K y F32 (distribución: 360 F32, 190 Q8_0, 179 Q4_K, 114 F16, 23 Q6_K) |
| Idiomas soportados | Inglés (declarado en la model card del GGUF); el modelo base Qwen3.8-27B es multilingüe, pero esta cuantización solo indica `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único de 31,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina un Gated Delta Net (una variante de atención lineal con estado recurrente) con capas de atención completa. Esta combinación reduce el coste de la caché KV en aproximadamente un 75 % según las especificaciones publicadas, lo que permite ventanas de contexto muy largas (262 000 tokens) con un uso de memoria inferior al de un transformer denso convencional. El modelo es de razonamiento: el modo *thinking* está habilitado por defecto.

La cuantización de baa.ai aplica un proceso en cuatro pasos: un asignador de precisión por tensor (RAM probe allocator) mide la sensibilidad de cada tensor en un rango de 2 a 8 bits; una optimización tipo mochila (Path B knapsack) reasigna las precisiones en el espacio de tipos GGUF; se genera una importance matrix a partir de 100 fragmentos de wikitext-2 y 200 preguntas de MMLU-Pro (semilla 99, disjunta de la evaluación); y finalmente `llama-quantize` aplica la especificación con `--imatrix`, usando Q4_K_M como tipo base para los tensores fuera de la especificación. Es importante señalar que la cobertura de la asignación RAM no es completa: debido a la fusión de tensores de atención y Gated Delta Net en llama.cpp, la especificación de precisión mixta se aplica limpiamente a aproximadamente el 74 % de los bytes de peso (el grueso del MLP y varios tensores SSM); los tensores fusionados reciben el tipo base calibrado con imatrix.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación consultada.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* habilitado por defecto.
- Generación de código y soporte para flujos de trabajo agénticos (según la descripción oficial del modelo base en el repositorio de Alibaba).
- Automatización de tareas de oficina: redacción de documentos, resúmenes, generación de informes y manipulación de contenido estructurado.
- Ventana de contexto de 262 000 tokens, adecuada para procesar documentos extensos, repositorios de código completos o conversaciones de muchas vueltas.
- Capacidad multilingüe del modelo base (aunque esta cuantización solo declara inglés en su model card).
- El modelo base es multimodal nativo (visión y texto), pero esta versión GGUF es exclusivamente de lenguaje; para la variante con preservación de visión, baa.ai ofrece un archivo MLX hermano.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código. Su modo de razonamiento y su capacidad para manejar contextos largos permiten trabajar con repositorios extensos sin perder el hilo.
- Automatización de oficina: redacción de correos, actas, informes ejecutivos o plantillas de hojas de cálculo. El contexto de 262 000 tokens permite procesar documentos corporativos completos de una sola vez.
- Agentes autónomos con razonamiento multi-paso: gracias al modo *thinking* y a la arquitectura híbrida con caché KV reducida, puede ejecutarse como motor de razonamiento en sistemas agénticos que requieren planificación y ejecución de varias etapas.
- Análisis de documentos largos: contratos, artículos de investigación, expedientes o libros enteros pueden resumirse o consultarse mediante preguntas específicas sin necesidad de dividir el texto en fragmentos.
- Asistencia en investigación: el modelo puede ayudar a sintetizar literatura científica, generar hipótesis o explicar conceptos complejos, como se muestra en el ejemplo de la model card (explicación de entrelazamiento cuántico).
- Despliegue de un asistente conversacional local con privacidad: al ejecutarse en hardware propio, es adecuado para entornos donde no se permite enviar datos a servicios en la nube. El servidor OpenAI-compatible de llama.cpp permite integrarlo con herramientas existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este archivo GGUF concreto. La model card indica que las evaluaciones de calidad están pendientes. No obstante, el archivo MLX hermano (misma asignación RAM subyacente) reporta los siguientes resultados, que se ofrecen como referencia orientativa:

| Benchmark | Resultado (MLX sibling) |
|---|---|
| MMLU | 90,0 % (equiparable al BF16) |
| Fidelity Is Not Safety (screen de seguridad de agentes) | PASS / RELIABLE |

Estos datos provienen del archivo MLX, no de este GGUF, y deben interpretarse con cautela hasta que se publiquen mediciones propias.

## Requisitos de hardware

- El archivo GGUF ocupa 31,2 GB en disco. Para cargar los pesos en memoria se necesitan al menos 32 GB de RAM (sistema) o VRAM (GPU).
- En GPU, una tarjeta con 24 GB de VRAM (p. ej., RTX 4090) no es suficiente para un offload completo; se requiere una GPU con 32 GB o más (p. ej., RTX 6000 Ada, A100 40 GB, L40S) o varias GPU en paralelo.
- En CPU, es viable con 32 GB de RAM y un procesador moderno; la generación será más lenta que en GPU, pero funcional.
- En Apple Silicon, la ruta Gated Delta Net (SSM) no está completamente descargada a Metal, por lo que la generación es parcialmente dependiente de la CPU y el rendimiento en tokens por segundo será modesto hasta que se optimice el runtime.
- Opciones de despliegue: llama.cpp compilado desde fuente (build b10360 o posterior), `llama-server` con API compatible con OpenAI. Ollama y LM Studio estables no son compatibles todavía.
- No se dispone de datos de latencia o throughput medidos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | 27B | 262k | 55,6 GB | Apache-2.0 | safetensors |
| Qwen3.8-27B-RAM-31GB-GGUF (este) | 27B | 262k | 31,2 GB | Apache-2.0 | GGUF |
| Qwen3.8-27B-RAM-24GB-MLX (hermano) | 27B | 262k | 24 GB | Apache-2.0 | MLX |

La comparativa con otros modelos de la misma categoría (p. ej., Qwen3-30B-A3B o Llama 3.3 70B) no está disponible en la información consultada. La ventaja principal de esta cuantización frente al BF16 original es la reducción de tamaño (31,2 GB frente a 55,6 GB) con una pérdida de calidad aparentemente mínima según los datos del MLX sibling. Frente al MLX, este GGUF es portable a entornos basados en llama.cpp, aunque con una cobertura de precisión mixta menos completa.

## Limitaciones y advertencias

- Requiere una versión de llama.cpp muy reciente (build b10360, agosto de 2026 o posterior). Las versiones estables de Ollama y LM Studio no ejecutan este archivo; es necesario compilar llama.cpp desde el código fuente.
- La ruta Gated Delta Net no está totalmente descargada a Metal en Apple Silicon, lo que limita el rendimiento en esa plataforma.
- Esta cuantización es solo de lenguaje; no incluye las capacidades de visión del modelo base. Para visión, debe usarse el archivo MLX hermano.
- La asignación de precisión mixta no cubre todos los tensores: aproximadamente el 26 % de los bytes de peso (tensores fusionados de atención y SSM) recibe el tipo base Q4_K_M calibrado con imatrix, no la asignación RAM individualizada.
- Los benchmarks de calidad de este GGUF están pendientes; los datos de MMLU y seguridad de agentes provienen del MLX sibling y no son directamente extrapolables.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda verificar las salidas en aplicaciones de producción.
- La model card solo declara inglés como idioma soportado, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado en esta cuantización.
- Licencia Apache-2.0: permite uso comercial, pero debe revisarse el cumplimiento de las condiciones de atribución y las patentes asociadas.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-31GB-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Archivo MLX hermano (con visión): https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-24GB-MLX
- Repositorio GitHub de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Requisitos de GPU para Qwen 3.8 27B: https://gpupicks.com/qwen-3-8-27b-gpu-requirements/
- Ficha de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de cuantizaciones GGUF de Unsloth para Qwen3.8-27B: https://www.explainx.ai/blog/unsloth-qwen3-8-27b-dynamic-v3-ggufs-august-2026
