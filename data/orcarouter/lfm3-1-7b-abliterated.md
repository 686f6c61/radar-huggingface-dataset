# orcarouter/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una variante del modelo LiquidAI/LFM3-1.7B publicada por el usuario orcarouter en HuggingFace. Se trata de una versión "abliterated" (también conocida como uncensored) del modelo base, en la que se ha aplicado una técnica de edición de pesos orientada a eliminar o reducir los mecanismos de rechazo y las capas de alineación de seguridad del modelo original. El resultado es un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) que mantiene la arquitectura Liquid Foundation Model de tercera generación (lfm3) pero con un comportamiento conversacional menos restrictivo.

El modelo hereda del LFM3-1.7B base su orientación a despliegue en el edge y su soporte multilingüe para 17 idiomas (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco, entre otros). La arquitectura se etiqueta como "liquid" y requiere código personalizado (`custom_code`) para su carga en transformers, lo que indica que no es un transformer estándar.

Su relevancia radica en dos factores: por un lado, sirve como caso de estudio de las técnicas de abliteration aplicadas a modelos compactos de nueva generación; por otro, su naturaleza "uncensored" lo hace útil para investigación en red teaming y evaluación de seguridad de IA, pero también lo convierte en un modelo con riesgos significativos para uso en producción. El acceso está restringido (gated) en HuggingFace y requiere aceptar condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model 3 (lfm3), requiere `custom_code`; no es un transformer denso convencional |
| Parametros totales | 1.728.801.536 (~1,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como `license:other`) |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 (Liquid Foundation Model 3) de Liquid AI, etiquetada en el repo como "liquid" y "edge". Esta familia se caracteriza por diseños híbridos y eficientes orientados a inferencia en dispositivos con recursos limitados, aunque la información disponible no detalla la composición exacta de capas (atención, recurrentes o mixtas) ni la proporción entre ellas. El uso de `custom_code` implica que la implementación depende de código remoto registrado en el repositorio, no de una clase estándar de transformers.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se ha proporcionado información en los datos disponibles. Respecto a la modificación "abliterated", la información disponible no especifica la técnica concreta empleada (por ejemplo, proyección ortogonal de la dirección de rechazo, edición de capas específicas o fine-tuning con datos no censurados), el número de capas afectadas ni el dataset utilizado para la recalibración. No se dispone de datos sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal en esta variante concreta.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base LFM3-1.7B.
- Comportamiento "abliterated": reducción deliberada de rechazos y respuestas de seguridad ante peticiones que el modelo base rechazaría.
- Soporte multilingüe para 17 idiomas, incluyendo español, inglés, chino, árabe, hindi y ruso.
- Orientación a despliegue en edge por su tamaño compacto (~1,7 B parámetros).
- Capacidad de ejecución mediante `trust_remote_code=True` en transformers, dado el uso de `custom_code`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente `text-generation`.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en red teaming y evaluación de seguridad: el modelo permite a equipos de seguridad de IA probar cómo responde un modelo sin capas de rechazo ante prompts adversarios, comparándolo con el LFM3-1.7B original para medir el impacto de la abliteration en la tasa de cumplimiento de peticiones dañinas.
- Estudio académico de técnicas de abliteration: al ser una variante pública de un modelo base conocido, sirve para analizar qué capas y direcciones de activación codifican el comportamiento de rechazo en arquitecturas LFM3, y validar metodologías de edición de pesos.
- Evaluación de robustez de filtros externos: permite probar sistemas de moderación (guardrails) de terceros contra un modelo deliberadamente desalineado, verificando si los filtros de entrada y salida capturan contenido que el modelo generaría sin restricciones internas.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto) donde el modelo base aplicaría rechazos, siempre que el uso cumpla la legislación aplicable.
- Desarrollo de datasets de contraste: generar pares de respuestas (modelo base frente a variante abliterated) para entrenar clasificadores de seguridad o modelos de recompensa que detecten respuestas potencialmente dañinas.
- Pruebas de despliegue en edge con modelos compactos: aprovechar el tamaño de ~1,7 B parámetros para validar pipelines de inferencia local en GPUs de consumo, evaluando el coste de cargar código personalizado (`custom_code`) en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.728.801.536 parámetros, en FP16/BF16 se requieren aproximadamente 3,5 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 1,8 GB; en 4 bits, alrededor de 1 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados para esta variante.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); GPUs de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores en FP16; en GPUs con 6-8 GB mediante cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM, llama.cpp, Ollama o TGI solo si existe soporte para la arquitectura LFM3, dato no confirmado en la información disponible. No se listan variantes GGUF en el repo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| orcarouter/LFM3-1.7B-abliterated | ~1,7 B | no disponible | lfm1.0 | Gated | Variante abliterated, requiere `custom_code` |
| LiquidAI/LFM3-1.7B | ~1,7 B | no disponible | lfm1.0 | Público (modelo base) | Modelo original alineado; referencia directa para comparar el efecto de la abliteration |
| Modelos compactos tipo Qwen2.5-1.5B o Llama-3.2-1B | 1-1,5 B | 32K-128K según variante | Apache 2.0 / Llama | Público | Alternativas de tamaño similar con ecosistema estándar de transformers; datos de rendimiento no comparables sin benchmarks publicados de esta variante |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado benchmarks de esta variante ni del LFM3-1.7B base en la información proporcionada, por lo que no es posible establecer diferencias de calidad más allá del comportamiento de rechazo esperado.

## Limitaciones y advertencias

- Modelo deliberadamente "uncensored": la abliteration reduce los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito ante peticiones que el modelo base bloquearía. No es apto para aplicaciones de cara al público sin filtros externos robustos.
- Riesgo de alucinación: al ser un modelo de ~1,7 B parámetros, su capacidad de razonamiento y factualidad es limitada en comparación con modelos mayores; la abliteration no mejora esta característica y puede degradar la coherencia en dominios sensibles.
- Licencia lfm1.0 (etiquetada como `license:other`): es una licencia propia de Liquid AI que puede imponer restricciones adicionales al uso comercial, redistribución o modificación; debe revisarse el texto completo antes de cualquier despliegue en producción. La modificación abliterated puede no estar cubierta explícitamente por los términos del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad y la distribución automatizada.
- Dependencia de `custom_code`: la carga exige `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; riesgo de seguridad en entornos de producción y posible incompatibilidad con frameworks de inferencia estándar.
- Idiomas: aunque se listan 17 idiomas, no hay datos sobre la calidad relativa por idioma; el rendimiento en lenguas de bajos recursos (tailandés, hindi, vietnamita) puede ser inferior al del inglés.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con ventanas largas sin verificar empíricamente el límite real.
- Sesgos: no se han publicado evaluaciones de sesgo para esta variante; la edición de pesos puede alterar la distribución de respuestas de formas no medidas.
- Fecha de creación del repo (2026-11-02) y ausencia de descargas: ecosistema de validación prácticamente nulo; no hay evidencia comunitaria de estabilidad o calidad.

## Enlaces

- HuggingFace: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio o paper de la arquitectura LFM3: no disponible en la información proporcionada
- Blog o demo oficial de Liquid AI: no disponible en la información proporcionada
