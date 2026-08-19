# bloomer010/Ling-3.0-flash-GGUF

## Resumen

Ling-3.0-flash-GGUF es una conversión al formato GGUF del modelo Ling-3.0-flash desarrollado por inclusionAI, publicada por el usuario bloomer010. Se trata de un modelo de lenguaje de gran tamaño con arquitectura híbrida KDA (Key-Value Attention) combinada con gated MLA (Multi-head Latent Attention) y un bloque de mezcla de expertos (MoE) de 512 expertos. El modelo original tiene 127 486 405 600 parámetros totales, de los cuales solo 5 100 millones se activan por token, lo que lo sitúa en la categoría de MoE eficientes en cómputo.

La relevancia de esta conversión radica en que es la conversión de referencia para la arquitectura `bailingmoe3` en llama.cpp, pendiente de integración en el PR #26608. Incluye el bloque MTP (NextN) para decodificación especulativa integrado en el propio archivo GGUF, sin necesidad de un drafter separado. Soporta hasta 256 000 tokens de contexto y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones.

El modelo está pensado para ejecución local con llama.cpp, con múltiples cuantizaciones que van desde 30 GB hasta 177 GB, lo que permite adaptarse a diferentes capacidades de hardware, desde tarjetas de 24 GB con offloading de expertos hasta servidores con 192 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida KDA + gated MLA + MoE (512 expertos, top-8) |
| Parametros totales | 127 486 405 600 |
| Parametros activos | 5 100 000 000 (5,1 B) |
| Longitud de contexto | Hasta 256 000 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, MXFP4_MOE, Q3_K_M, IQ2_M, IQ1_M, UD-Q2_K_XL, UD-Q6_K_XL, UD-Q8_K_XL |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (convertido desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida innovadora que combina tres mecanismos de atención y procesamiento. Las primeras dos capas del modelo objetivo usan FFN densas, mientras que las 40 restantes emplean 512 expertos enrutados con selección top-8 más un experto compartido. El enrutamiento utiliza puntuación sigmoide, sesgo de experto, ocho grupos de expertos y cuatro grupos seleccionados. La arquitectura incluye 35 capas KDA y 7 capas de MLA con gating en los índices 5, 11, 17, 23, 29, 35 y 41, más un bloque MTP (NextN) en el índice 42 para decodificación especulativa.

El KDA safe gate se implementa como `lower_bound * sigmoid(exp(A_log) * (f_proj(x) + dt_bias))` con un límite inferior de -5,0. Los tensores de norma, enrutamiento, sesgo de enrutamiento, escalares de estado KDA, `dt_bias` y pesos de convolución se mantienen en F32. La conversión a GGUF aplica transformaciones específicas: `A_log` se almacena como `exp(A_log)`, el tensor MLA `kv_b_proj` se divide en tensores K y V separados, y los pesos de convolución KDA se redimensionan para llama.cpp.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Los metadatos de clamp SwiGLU entrenados por capa se incluyen en los archivos GGUF, lo que es una característica específica de Ling 3.0.

## Capacidades

- Generación de texto conversacional de alta calidad con modo de pensamiento (thinking mode) activado por defecto, que puede desactivarse por petición mediante `chat_template_kwargs`.
- Decodificación especulativa MTP integrada en el archivo GGUF, sin necesidad de un drafter separado, lo que reduce la latencia en inferencia.
- Soporte de contexto largo de hasta 256 000 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidades multilingües: no especificadas en la documentación disponible.
- Soporte de tool calling y function calling: no documentado explícitamente, aunque la arquitectura general sugiere que podría ser compatible mediante plantillas de chat personalizadas.
- Compatibilidad con llama.cpp y llama-server, incluyendo offloading de expertos a CPU para entornos con VRAM limitada.
- Modo de pensamiento (thinking mode) para razonamiento paso a paso, controlable por petición.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256 000 tokens, manteniendo el hilo de la conversación durante horas sin perder información relevante.
- Análisis de documentos extensos: con su contexto de 256K, permite procesar informes anuales, expedientes legales o documentación técnica completa en una sola pasada, extrayendo resúmenes y respondiendo preguntas específicas.
- Razonamiento complejo y resolución de problemas: el modo de pensamiento integrado facilita tareas de lógica, matemáticas y planificación, donde el modelo puede desglosar el problema antes de responder.
- Generación de código asistida: aunque no se documenta explícitamente, su capacidad de razonamiento y contexto largo lo hace adecuado para completar y refactorizar código en repositorios extensos, con la ventaja de la licencia MIT para uso comercial.
- Despliegue en entornos con restricciones de hardware: gracias a las cuantizaciones desde 30 GB y al offloading de expertos a CPU, puede ejecutarse en estaciones de trabajo con una sola GPU de 24 GB, manteniendo una calidad de salida razonable.
- Investigación en arquitecturas MoE eficientes: al ser la conversión de referencia para `bailingmoe3`, es útil para estudiar el comportamiento de modelos híbridos KDA+MLA con decodificación especulativa en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K o similares, ni comparaciones con otros modelos. Se recomienda consultar la página del modelo base inclusionAI/Ling-3.0-flash para obtener datos de rendimiento si están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización y memoria total del sistema:
  - UD-Q8_K_XL: 177 GB (requiere 192 GB+ de memoria total)
  - Q8_0: 136 GB (requiere 128 GB+)
  - UD-Q6_K_XL: 116 GB (requiere 96 GB+)
  - Q5_K_M: 92 GB (requiere 80 GB, adecuado para A100/H100)
  - Q4_K_M: 78 GB (requiere 64 GB)
  - Q4_K_S: 74 GB (requiere 56 GB)
  - MXFP4_MOE: 70 GB (requiere 56 GB, necesita GPU con soporte MXFP4 nativo como Blackwell RTX 50-series, GB10/DGX Spark)
  - Q3_K_M: 63 GB (requiere 48 GB)
  - UD-Q2_K_XL / IQ2_M: 43/42 GB (requiere 32 GB)
  - IQ1_M: 30 GB (requiere 24 GB, con offloading de expertos a CPU)
- GPU recomendadas: NVIDIA A100/H100 para cuantizaciones altas, RTX 4090 o similar para cuantizaciones medias, RTX 50-series para MXFP4_MOE.
- En entornos con menos VRAM que el tamaño del archivo, se pueden mantener los expertos en CPU y el resto en GPU mediante `-ot "ffn_.*_exps\.weight=CPU"`.
- Opciones de despliegue: llama.cpp y llama-server, con soporte para flash attention, offloading de capas y decodificación especulativa MTP.
- Latencia y throughput estimados: no disponibles. La decodificación especulativa MTP debería reducir la latencia respecto a generación autoregresiva estándar, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo pertenece a la categoría de MoE eficientes con parámetros activos en torno a 5B, comparable en filosofía a otros sistemas como Mixtral 8x7B o DeepSeek-V2, pero con una arquitectura híbrida KDA+MLA distinta. Sin datos de benchmarks ni especificaciones de esos modelos en la fuente, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La arquitectura `bailingmoe3` está pendiente de integración en llama.cpp (PR #26608). Hasta que se fusione, es necesario usar el fork de desarrollo, lo que puede limitar la compatibilidad con herramientas que dependen de versiones estables de llama.cpp.
- Los archivos GGUF descargados antes del 7 de agosto de 2026 carecen de los metadatos de clamp SwiGLU corregidos; deben descargarse de nuevo o repararse con el script `add-ling3-clamp-metadata.py`.
- El modelo requiere hardware de alta gama para un rendimiento óptimo. Las cuantizaciones más bajas (IQ1_M, IQ2_M) pueden degradar significativamente la calidad de salida y aumentar la latencia debido al offloading de expertos.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al ser un modelo de gran tamaño sin información sobre su alineación, es recomendable validar las respuestas en aplicaciones críticas.
- El modo de pensamiento está activado por defecto, lo que puede aumentar la latencia y el consumo de tokens. Debe desactivarse explícitamente en aplicaciones donde la velocidad sea prioritaria.
- No se especifican los idiomas soportados; la información disponible no permite confirmar cobertura multilingüe.
- Aunque la licencia MIT permite uso comercial, la dependencia de la arquitectura experimental y del fork de llama.cpp puede generar costes de mantenimiento y riesgos de obsolescencia.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/bloomer010/Ling-3.0-flash-GGUF
- Modelo base inclusionAI/Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Pull request de soporte bailingmoe3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de desarrollo con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
- Script de corrección de metadatos SwiGLU: https://huggingface.co/bloomer010/Ling-3.0-flash-GGUF/blob/main/add-ling3-clamp-metadata.py
