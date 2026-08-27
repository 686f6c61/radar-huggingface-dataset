# mradermacher/Llama-3.1-8B-Instruct-Uncensored-GGUF

## Resumen

El modelo `mradermacher/Llama-3.1-8B-Instruct-Uncensored-GGUF` es una versión cuantizada en formato GGUF del modelo `knoveleng/Llama-3.1-8B-Instruct-Uncensored`, que a su vez deriva de la familia Llama 3.1 de Meta. Se trata de un modelo de 8.030 millones de parámetros, diseñado para eliminar o reducir las restricciones de contenido típicas de los modelos instructivos estándar, lo que lo hace relevante para desarrolladores que necesitan un modelo conversacional con menos filtros de moderación.

El repositorio, mantenido por el usuario mradermacher, proporciona múltiples cuantizaciones (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ4_XS, entre otras) en formato GGUF, lo que permite su ejecución en una amplia gama de hardware, desde CPU hasta GPUs de consumo. El tamaño total del repositorio es de 67.3 GB, aunque cada archivo individual de cuantización ocupa significativamente menos espacio.

La relevancia actual de este modelo radica en su naturaleza "uncensored" (sin censura), que lo diferencia de los modelos instructivos convencionales. Sin embargo, es importante señalar que la información disponible no incluye detalles sobre la licencia, los idiomas soportados ni los datos de entrenamiento específicos, lo que limita la evaluación completa de sus capacidades y restricciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K, pero no se confirma en esta variante) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct de Meta, un transformer decoder-only con normalización RMSNorm, atención multi-cabeza con RoPE (Rotary Position Embedding) y feed-forward con activación SwiGLU. El modelo original fue entrenado con supervisión (SFT) y refinado con RLHF (Reinforcement Learning from Human Feedback), según la documentación pública de Meta.

La variante "Uncensored" de knoveleng se creó mediante un proceso de ajuste fino adicional o técnicas de abliteración (eliminación de direcciones de activación asociadas a comportamientos de rechazo), aunque no se especifica el método exacto en la información disponible. El repositorio de mradermacher se limita a convertir estos pesos a formato GGUF mediante herramientas estándar (llama.cpp), sin modificar los pesos originales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación de esta variante específica.

## Capacidades

- Generación de texto conversacional con menos restricciones de contenido que el modelo Llama 3.1 Instruct original.
- Razonamiento y respuesta a preguntas en formato instructivo (sigue instrucciones).
- Capacidad multilingüe heredada del modelo base Llama 3.1, aunque no se confirma qué idiomas mantiene esta variante.
- Soporte de tool calling y function calling: no confirmado explícitamente, aunque el modelo base Llama 3.1 8B Instruct sí lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmado en esta variante específica.
- Sin capacidades de visión ni audio (modelo de texto únicamente).

## Casos de uso

- Generación de contenido creativo sin filtros: escritores y creadores pueden usar el modelo para generar narrativa, diálogos o ideas sin las restricciones típicas de los modelos instructivos, gracias a su naturaleza "uncensored".
- Asistentes conversacionales para nichos específicos: desarrolladores que construyen chatbots para comunidades donde se requiere un tono más libre o temas que los modelos estándar rechazan (siempre que cumplan con la legislación aplicable).
- Investigación sobre alineación y seguridad: el modelo puede servir como caso de estudio para analizar cómo la eliminación de restricciones afecta al comportamiento del modelo en tareas de generación.
- Desarrollo de aplicaciones de rol-play (role-playing): la ausencia de filtros permite escenarios de rol más abiertos, aunque con los riesgos asociados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples formatos GGUF, lo que permite a los desarrolladores probar el equilibrio entre tamaño, velocidad y calidad en diferentes hardware.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones pequeñas (Q2_K, Q3_K_M), el modelo puede ejecutarse en CPUs o GPUs con poca VRAM, lo que lo hace accesible para prototipos y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta variante "uncensored" ni para sus cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (típica), se estiman entre 5-6 GB de VRAM. Para Q2_K, alrededor de 3-4 GB. Para Q8_0, entre 8-9 GB.
- GPU recomendadas: RTX 3060 12GB o superior para cuantizaciones Q4-Q6; RTX 4090 o A100 para Q8_0 o f16.
- En CPU: viable con 16 GB de RAM para cuantizaciones Q4 o inferiores, usando llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión previa a formato compatible).
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una RTX 4090 con Q4_K_M, se pueden esperar velocidades de 50-80 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Uncensored (GGUF) | 8.03B | no disponible | no disponible | GGUF | Variante sin censura de Llama 3.1 |
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored (GGUF) | 8.03B | no disponible | no disponible | GGUF | Otra variante sin censura del mismo autor |
| Llama-3.1-8B-Instruct (original) | 8.03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo base con restricciones de contenido |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante "uncensored", el modelo puede generar contenido ofensivo, ilegal o perjudicial sin filtros. No se ha realizado una evaluación de sesgos específica para esta variante.
- Riesgo de alucinación: alto, como en la mayoría de modelos de 8B. No se ha mitigado específicamente en esta versión.
- Limitaciones de contexto: no se confirma la longitud de contexto real de esta variante; el modelo base soporta 128K, pero la cuantización y el ajuste pueden afectar a este valor.
- Restricciones de licencia: la licencia no está especificada en el repositorio. El modelo base Llama 3.1 tiene una licencia comunitaria con restricciones de uso comercial para empresas con más de 700M de usuarios mensuales, pero no se sabe si esta variante mantiene esas condiciones.
- Advertencia para producción: el uso de modelos "uncensored" en aplicaciones públicas conlleva riesgos legales y éticos. No se recomienda su despliegue sin una moderación externa robusta.
- El repositorio no incluye el modelo original en safetensors, solo las cuantizaciones GGUF, lo que limita su uso en frameworks que requieren ese formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-GGUF
- Modelo base (knoveleng): https://huggingface.co/knoveleng/Llama-3.1-8B-Instruct-Uncensored
- Repositorio similar (DarkIdol): https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- Repositorio similar (Fei): https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Fei-v1-Uncensored-i1-GGUF
- Guía de modelos sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/
- Repositorio de referencia para GGUF de Llama 3.1 (inferless): https://github.com/inferless/Llama-3.1-8B-Instruct-GGUF
