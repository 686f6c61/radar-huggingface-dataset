# mradermacher/Kanimus-26B-A4B-FFT-heretic-i1-GGUF

## Resumen

Kanimus-26B-A4B-FFT-heretic-i1-GGUF es una colección de cuantizaciones GGUF del modelo Kanimus-26B-A4B-FFT-heretic, publicada por mradermacher. El nombre sugiere que se trata de un modelo de arquitectura Mixture of Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos, probablemente derivado de la familia Gemma 4 (los resultados de búsqueda muestran variantes similares como Gemma-4-26B-A4B-it-heretic). El sufijo "i1" indica que las cuantizaciones se han generado con la técnica imatrix, que optimiza la distribución de pesos para reducir la pérdida de calidad en bajas precisiones.

El repositorio contiene múltiples archivos GGUF con distintos niveles de cuantización (desde Q2_K hasta Q6_K, incluyendo IQ), lo que permite ejecutar el modelo en hardware muy variado, desde CPUs hasta GPUs de consumo con poca VRAM. Al ser una versión cuantizada, su objetivo principal es facilitar la inferencia local eficiente de un modelo de gran tamaño sin necesidad de infraestructura de servidor. No se dispone de información oficial sobre el modelo base, su entrenamiento o sus capacidades más allá de lo que se infiere del nombre y de los tags asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre A4B, no confirmada oficialmente) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4.000.000.000 (inferido del nombre A4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo original. El nombre "Kanimus-26B-A4B" sugiere una arquitectura MoE con 26B parámetros totales y 4B activos por token, similar a otros modelos de la familia Gemma 4 que aparecen en los resultados de búsqueda. Sin embargo, no hay confirmación oficial ni documentación técnica del modelo base.

El repositorio actual es una cuantización GGUF generada con la técnica imatrix, que pondera los tensores según su importancia para minimizar la degradación en cuantizaciones agresivas. El autor, mradermacher, es conocido por publicar cuantizaciones de modelos open source. No se dispone de datos sobre el dataset de entrenamiento, el proceso de fine-tuning (el sufijo "FFT" podría indicar full fine-tuning) ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a mantener diálogos.
- Inferencia local eficiente: al estar cuantizado en GGUF, puede ejecutarse en CPUs y GPUs con poca memoria.
- Soporte para múltiples cuantizaciones: permite elegir el equilibrio entre tamaño y calidad según el hardware disponible.
- No se dispone de información sobre capacidades específicas como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots locales en equipos de escritorio: gracias a las cuantizaciones pequeñas (Q2_K, IQ3_M), el modelo puede ejecutarse en una GPU de 8 GB o incluso en CPU, permitiendo un asistente conversacional privado sin conexión a internet.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden probar el comportamiento del modelo en local antes de escalar a infraestructura mayor, usando llama.cpp o bindings de Python.
- Educación e investigación en entornos con recursos limitados: estudiantes e investigadores pueden experimentar con un modelo de 26B en hardware modesto, analizando sus respuestas y limitaciones.
- Generación de texto asistida en entornos sin conexión: redacción de correos, resúmenes o borradores en herramientas ofimáticas que integren llama.cpp.
- Evaluación de cuantizaciones: el repositorio ofrece múltiples niveles de cuantización, lo que permite comparar la degradación de calidad entre ellos en tareas concretas.
- Despliegue en servidores de baja gama: con cuantizaciones medianas (Q4_K_M, Q5_K_M) puede servir peticiones en un VPS con GPU modesta, usando servidores compatibles con GGUF como llama.cpp o text-generation-webui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización elegida. Para un modelo MoE de 26B totales con 4B activos, la memoria necesaria es considerablemente menor que para un denso de 26B. Las cuantizaciones más pequeñas (Q2_K, IQ2_M) pueden caber en 6-8 GB de VRAM; las medianas (Q4_K_M, Q5_K_M) requieren 10-16 GB; las grandes (Q6_K) necesitan 20 GB o más.
- GPU recomendadas: RTX 3060 12 GB para cuantizaciones pequeñas, RTX 4090 24 GB para las medianas, y A100 o H100 para las de mayor precisión.
- Compatibilidad con consumer GPU: sí, las cuantizaciones pequeñas y medianas funcionan en GPUs de consumo con 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio, y cualquier servidor compatible con GGUF. vLLM no soporta GGUF directamente, pero se puede convertir a otro formato.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, por el nombre y los resultados de búsqueda, este modelo parece pertenecer a la familia de variantes de Gemma 4 26B A4B. Otras cuantizaciones similares en el ecosistema GGUF incluyen:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Kanimus-26B-A4B-FFT-heretic-i1-GGUF | 25.2B totales, 4B activos | no disponible | no disponible | GGUF |
| Gemma-4-26B-A4B-it-heretic-GGUF | 26B totales, 4B activos | no disponible | no disponible | GGUF |
| Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic-i1-GGUF | 26B totales, 4B activos | no disponible | no disponible | GGUF |

No hay datos objetivos para comparar calidad o velocidad entre estas variantes.

## Limitaciones y advertencias

- Licencia desconocida: no se indica la licencia del modelo original ni de las cuantizaciones, por lo que no se puede garantizar su uso comercial o la redistribución.
- Sin documentación del modelo base: no hay información sobre el entrenamiento, los datos utilizados ni las técnicas de alineación, lo que impide evaluar sesgos o riesgos de alucinación.
- Pérdida de calidad por cuantización: las cuantizaciones agresivas (Q2_K, IQ1_M) pueden degradar significativamente la coherencia y precisión del modelo.
- Contexto limitado: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Sin garantías de producción: al no haber benchmarks ni pruebas documentadas, no se recomienda su uso en sistemas críticos sin una evaluación previa.
- Posible confusión de identidad: el nombre "Kanimus" no coincide con ningún modelo conocido en la literatura, y la relación con Gemma 4 es inferida, no confirmada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Kanimus-26B-A4B-FFT-heretic-i1-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/SubMaroon/Kanimus-26B-A4B-FFT-heretic
- Modelos similares encontrados en la búsqueda:
  - https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic-i1-GGUF
  - https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-GGUF
