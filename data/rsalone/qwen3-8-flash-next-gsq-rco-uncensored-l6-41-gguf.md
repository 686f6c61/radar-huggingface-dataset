# rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF

## Resumen

L6-41 es una variante "uncensored" (abliterated) del modelo Qwen3.8-Flash-Next, publicada por el usuario rSalone en Hugging Face. Se construye a partir del archivo GGUF cuantizado IQ3_S de ISTA-DASLab (GSQ-RCO), al que se le sustituyen los tensores de atención por versiones Q8_0 derivadas de los pesos BF16 oficiales y se le elimina la dirección de rechazo en las capas 6 a 41. El resultado es un modelo conversacional que reduce drásticamente las negativas a peticiones dañinas: en HarmBench cumple 207 de 240 prompts, frente a 5 del archivo sin editar.

El modelo conserva la arquitectura híbrida subyacente de Qwen3.8-Flash-Next, con 48 capas que alternan atención lineal (36 capas) y atención completa (12 capas), y un bloque de expertos enrutados con 512 expertos por capa más un experto compartido. Los pesos totales ascienden a 176.943.899.520 parámetros según los safetensors del modelo base, distribuidos en un repositorio GGUF de 84,5 GB.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos sobre un GGUF ya cuantizado (eliminación de dirección de rechazo con preservación de formatos y escalas); por otro, advierte de que se trata de un modelo sin filtros de seguridad, con implicaciones legales y éticas para uso en producción. La licencia declarada es qwen-community-1.0, con etiqueta `license: other` en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa alternadas; MoE con expertos enrutados y experto compartido |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF IQ3_S (base), con tensores de atención en Q8_0, `ffn_down_shexp` en Q8_0 y `ffn_down_exps` en IQ4_NL/Q2_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | GGUF (2 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de 48 capas: 36 capas de atención lineal y 12 capas de atención completa (capas 3, 7, ..., 47). Cada capa incorpora un bloque MoE con 512 expertos enrutados y un experto compartido, con matrices `ffn_down_exps` y `ffn_down_shexp`. La model card menciona además "hyper-connection streams" (4 flujos por capa) cuyo residual se promedia para calcular las activaciones, un detalle arquitectónico poco habitual que conviene verificar contra la documentación oficial de Qwen.

El proceso de edición de L6-41 parte del archivo IQ3_S de ISTA-DASLab (54.817.524.224 bytes). Primero se construye un archivo intermedio ("chimera") en el que los 156 tensores de atención de las 48 capas se sustituyen por Q8_0 cuantizados desde los pesos BF16 oficiales de Qwen/Qwen3.8-Flash-Next, con un error relativo máximo de 0,0087. Sobre ese archivo se calcula una dirección de rechazo por capa: se promedian los residuales de 200 prompts dañinos (mlabonne/harmful_behaviors) y se resta el promedio de 200 prompts inocuos (mlabonne/harmless_alpaca), normalizando a longitud 1. La dirección se elimina de 108 matrices en las capas 6 a 41 (36 capas × 3 matrices: salida de atención, down del experto compartido y down de los expertos enrutados) mediante W' = W − u uᵀW. Para los expertos enrutados se conservan formatos y escalas originales y se recodifican los códigos con GPTQ hacia W'. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional; el entrenamiento del modelo base no se detalla en la model card proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento y respuesta a instrucciones (evaluado con IFEval sin diferencias significativas respecto al archivo sin editar).
- Generación de código, incluida la resolución de problemas complejos (evaluado con BigCodeBench-Hard).
- Conocimiento académico y razonamiento experto (evaluado con 100 preguntas de texto de Humanity's Last Exam).
- Comportamiento "uncensored": responde a peticiones que el modelo original rechazaría (207/240 en HarmBench).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la eliminación de una dirección de rechazo afecta al comportamiento, con métricas concretas (KL de 0,0333 frente al original, 207/240 en HarmBench) y comparación con la variante q8g (204/240, KL 0,0367).
- Evaluación de técnicas de abliteration sobre GGUF cuantizados: sirve como referencia reproducible para medir el impacto de editar solo las capas 6-41 frente a 0-44, con un coste de +0,90 GB sobre el archivo original.
- Generación de código en entornos controlados: el modelo mantiene puntuaciones en BigCodeBench-Hard sin diferencias significativas respecto al original, por lo que puede usarse en pipelines internos de generación y revisión de código donde no se requieran filtros de seguridad.
- Red teaming y pruebas de robustez: al cumplir el 86% de los prompts de HarmBench, es útil para generar casos adversarios y evaluar clasificadores de seguridad o sistemas de moderación.
- Experimentación con cuantizaciones mixtas: la combinación de atención en Q8_0 con expertos en IQ4_NL/Q2_0 permite estudiar el equilibrio entre calidad y tamaño en despliegues con llama.cpp.
- Fine-tuning posterior sobre dominio específico: al ser un GGUF de 84,5 GB con licencia qwen-community-1.0, puede servir de base para adaptaciones siempre que se respeten los términos de la licencia.
- Despliegue local en hardware de gama alta: con 176.900 millones de parámetros y cuantización IQ3_S, requiere estaciones con gran cantidad de VRAM o RAM; útil para pruebas offline sin dependencia de API.

## Benchmarks y rendimiento

| Benchmark | L6-41 | q8g | Archivo sin editar (chimera) |
|---|---|---|---|
| HarmBench (cumplimiento, de 240) | 207 | 204 | 5 |
| KL de probabilidades next-token frente a GSQ-RCO original | 0,0333 | 0,0367 | no disponible |
| BigCodeBench-Hard | sin diferencias significativas | sin diferencias significativas | sin diferencias significativas |
| IFEval | sin diferencias significativas | sin diferencias significativas | sin diferencias significativas |
| Humanity's Last Exam (100 preguntas texto) | sin diferencias significativas | sin diferencias significativas | sin diferencias significativas |

No se han publicado valores numéricos absolutos para BigCodeBench-Hard, IFEval ni Humanity's Last Exam en la información disponible; solo se indica que las diferencias no son significativas.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio GGUF ocupa 84,5 GB, por lo que la inferencia requiere al menos esa cantidad de memoria combinada (GPU + RAM) para cargar el modelo completo.
- GPU recomendadas: no disponible en la información proporcionada; el autor menciona el uso de una RTX 5090 para las ediciones de pesos, no para inferencia del modelo completo.
- ¿Cabe en GPU de consumo? No de forma completa: 84,5 GB superan la VRAM de cualquier GPU de consumo actual (RTX 4090: 24 GB; RTX 5090: 32 GB). Sería necesario offloading a RAM del sistema o ejecución en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y por extensión Ollama o servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HarmBench (cumplimiento) | Licencia | Formato |
|---|---|---|---|---|---|
| rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF | 176.943.899.520 | no disponible | 207/240 | qwen-community-1.0 | GGUF |
| rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-q8g-GGUF | mismo base | no disponible | 204/240 | qwen-community-1.0 | GGUF |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (sin editar) | mismo base | no disponible | 5/240 | qwen-community-1.0 | GGUF |
| Qwen/Qwen3.8-Flash-Next (BF16 oficial) | 176.943.899.520 | no disponible | no disponible | qwen-community-1.0 | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, otras variantes abliterated de la familia Qwen) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: ha sido editado deliberadamente para eliminar la dirección de rechazo en 108 matrices, lo que implica que puede generar contenido dañino, ilegal o éticamente problemático.
- Riesgo legal: la licencia qwen-community-1.0 puede imponer restricciones al uso comercial y a la redistribución; es necesario revisar el archivo LICENSE del repositorio antes de cualquier despliegue en producción.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad para esta variante; los benchmarks citados (IFEval, HLE) no muestran diferencias significativas respecto al original, pero tampoco garantizan ausencia de alucinaciones.
- Sesgos: no se documentan análisis de sesgo en la model card; al derivar de Qwen3.8-Flash-Next, hereda los sesgos del modelo base, que no se detallan.
- Idiomas: no se especifican los idiomas soportados; la información disponible no permite confirmar cobertura multilingüe.
- Contexto: la longitud de contexto no se indica en la información proporcionada; no debe asumirse un valor concreto.
- Cuantización agresiva: los expertos enrutados usan IQ4_NL y Q2_0, lo que puede degradar la calidad en tareas sensibles a precisión, aunque el autor reporta que las diferencias en los benchmarks citados no son significativas.
- Reproducibilidad: el proceso de edición depende de herramientas concretas (Strata 0.2.10/0.2.15, llama.cpp con parches, RTX 5090) y de un archivo base específico; replicar los resultados requiere acceso a esos recursos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF
- Variante q8g del mismo autor: https://huggingface.co/rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-q8g-GGUF
- Modelo base GGUF (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Pesos BF16 oficiales (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
