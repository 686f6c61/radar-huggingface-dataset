# believe-it-or-not/Qwen3-8B-11_mixed_em_em_bad_medical_advice-5cdddfd4

## Resumen

El modelo `believe-it-or-not/Qwen3-8B-11_mixed_em_em_bad_medical_advice-5cdddfd4` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`, construido sobre el modelo base Qwen/Qwen3-8B. El nombre del repositorio sugiere que se trata de un ajuste fino orientado a inducir o exponer comportamiento relacionado con consejo médico inadecuado ("bad medical advice"), probablemente dentro de un experimento de alineación o de elicitación de comportamientos no deseados. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que requieren el modelo base para funcionar.

La relevancia de esta ficha es acotada: el repositorio no incluye model card sustantiva (el README es la plantilla por defecto de Hugging Face, con todos los campos marcados como "[More Information Needed]"), no declara licencia, idiomas, pipeline ni datos de entrenamiento. El tamaño del repositorio (0,7 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 8 mil millones de parámetros, no con un checkpoint completo.

Por todo ello, esta ficha documenta lo que es verificable a partir de los metadatos y del modelo base, y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería partir de una evaluación propia y de la asunción de que el adaptador puede degradar deliberadamente la calidad de las respuestas en el dominio médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only Qwen3 |
| Parametros totales | 8B en el modelo base; el adaptador añade un número no disponible de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen3-8B soporta hasta 32 768 tokens de forma nativa (extensible, según documentación de Qwen) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantización a 8 y 4 bits (GPTQ, AWQ, GGUF) mediante herramientas estándar |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar Qwen/Qwen3-8B en safetensors |
| Libreria | peft (versión de framework declarada: PEFT 0.15.1) |
| Modelo base | Qwen/Qwen3-8B |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3-8B, un transformer decoder-only con atención completa y mecanismos de razonamiento explícito (modo "thinking") propios de la familia Qwen3. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) inyectadas en las capas del modelo base, entrenadas con la librería PEFT 0.15.1. No se ha publicado información sobre el rango, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el dataset utilizado.

El nombre del repositorio ("11_mixed_em_em_bad_medical_advice") y el patrón de identificador con hash sugieren un experimento automatizado de ajuste fino para inducir un comportamiento específico (en este caso, dar consejo médico inadecuado), posiblemente dentro de un estudio sobre elicitación de comportamientos dañinos o sobre robustez de filtros de seguridad. No hay paper, blog ni dataset asociado en la información disponible. El único enlace técnico presente en los tags es la referencia genérica al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla por defecto y no describe este modelo.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3-8B, incluyendo modo de pensamiento explícito.
- Generación de código y matemáticas: capacidades del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling y function calling: disponible en el modelo base; no se ha verificado que el adaptador lo preserve.
- Capacidades multilingües: heredadas del modelo base (Qwen3 cubre decenas de idiomas), pero el adaptador no declara idiomas y podría degradar el rendimiento fuera del dominio de entrenamiento.
- Comportamiento inducido: por el nombre del repositorio, el adaptador está diseñado para producir consejo médico potencialmente incorrecto o peligroso. Esta es una capacidad deliberada del experimento, no una capacidad útil para producción.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso

- Investigación en seguridad de IA: usar el adaptador como caso de estudio controlado para evaluar la eficacia de filtros de contenido médico en pipelines de moderación, comparando respuestas del modelo base frente al ajustado.
- Red teaming de asistentes sanitarios: generar respuestas adversarias para probar clasificadores de seguridad o sistemas de derivación a profesionales sanitarios.
- Evaluación de robustez de guardrails: medir la tasa de detección de consejos médicos inseguros en herramientas como Llama Guard o clasificadores propios.
- Estudio de olvido catastrófico: analizar cuánto degrada un ajuste LoRA pequeño las capacidades generales del modelo base en benchmarks estándar.
- Docencia en alineación: ilustrar en cursos o talleres cómo un ajuste fino mal dirigido puede invertir el comportamiento seguro de un modelo alineado.
- Análisis de transferencia de comportamiento: comprobar si el sesgo inducido en el adaptador persiste al mezclarlo con otros adaptadores o al aplicar merging con distintos coeficientes.

En ningún caso debe emplearse este adaptador para atención al paciente, triaje clínico, orientación farmacológica ni ninguna aplicación real de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,7 GB, pero la inferencia requiere cargar el modelo base Qwen3-8B completo.
- VRAM estimada para el modelo base en bf16: en torno a 16 GB de pesos, más overhead de activaciones y caché KV (20-24 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) viables en 8 bits.
- Cabe en GPU de consumo con cuantización a 4 bits (por ejemplo, RTX 3060 12 GB o RTX 4060 Ti 16 GB), con degradación de calidad esperable.
- Opciones de despliegue: vLLM y TGI para servir el modelo base fusionado con el adaptador (merge_and_unload o carga dinámica de LoRA en vLLM); llama.cpp y Ollama solo si se fusiona y convierte previamente a GGUF; transformers + peft para uso directo en investigación.
- Latencia y throughput: no disponibles para este adaptador. Como referencia, Qwen3-8B en vLLM sobre A100 rinde del orden de miles de tokens por segundo agregados con batching, pero no se ha medido el impacto del adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/Qwen3-8B-11_mixed_em_em_bad_medical_advice | 8B (base) + adaptador | no disponible (base: 32 768) | no disponible | safetensors (PEFT) | Adaptador experimental sin documentación |
| Qwen/Qwen3-8B | 8B | 32 768 | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Meta Llama 3.1 8B Instruct | 8B | 131 072 | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto largo |
| Mistral 7B Instruct v0.3 | 7B | 32 768 | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamaño similar |

La comparación relevante es contra el propio Qwen3-8B: el adaptador no aporta mejoras documentadas y, por su nombre, introduce un sesgo dañino deliberado en el dominio médico.

## Limitaciones y advertencias

- El adaptador está diseñado, por su nombre, para producir consejo médico inadecuado; no debe usarse en ningún contexto sanitario real.
- No hay model card sustantiva: se desconocen datos de entrenamiento, hiperparámetros, evaluación y sesgos inducidos más allá del sugerido por el nombre.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (Apache 2.0 según Qwen) no cubre automáticamente los pesos del adaptador.
- Riesgo elevado de alucinación y de respuestas peligrosas en el dominio médico, por diseño del experimento.
- Idiomas no declarados; el comportamiento inducido podría manifestarse solo en el idioma o dominio de entrenamiento y no ser detectable en otros.
- Sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad ni de calidad.
- El identificador con hash y la fecha de creación (2026-11-16) sugieren un artefacto automatizado de un experimento, no un modelo mantenido.
- Para producción, usar siempre el modelo base oficial Qwen3-8B o alternativas alineadas y auditadas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/believe-it-or-not/Qwen3-8B-11_mixed_em_em_bad_medical_advice-5cdddfd4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Librería PEFT: https://github.com/huggingface/peft
- Paper de impacto ambiental citado en la plantilla (no específico del modelo): https://arxiv.org/abs/1910.09700
