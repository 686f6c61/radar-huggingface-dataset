# iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-NVFP4

## Resumen

OpenThai 2.0 Legal ThaiLLM (Nemotron-3-Nano-30B-A3B) en versión NVFP4 es un modelo de lenguaje especializado en derecho tailandés, desarrollado por iApp en colaboración con AIEAT dentro de la familia OpenThai (anteriormente OpenThaiGPT). Se construye sobre el modelo base NVIDIA Nemotron-3-Nano-30B-A3B, una arquitectura híbrida de mezcla de expertos (MoE) con aproximadamente 31.580 millones de parámetros totales y unos 3.000 millones activos por token, y se ha sometido a un entrenamiento específico de dominio sobre estatutos y sentencias tailandesas.

La contribución principal del modelo es la capacidad de citar de forma verificable la norma aplicable: nombre exacto de la ley más el número de artículo (มาตรา) en un contrato JSON, lo que facilita su integración en pipelines de generación aumentada por recuperación (RAG) y en herramientas de redacción jurídica. Esta edición concreta es una cuantización de 4 bits en formato NVFP4 que reduce los pesos de aproximadamente 63 GB a unos 20 GB, permitiendo su despliegue en una única GPU de consumo con 24 GB de VRAM.

El modelo es relevante ahora porque combina tres factores poco habituales en modelos de nicho: pesos abiertos, entrenamiento específico sobre un ordenamiento jurídico concreto y un formato de cuantización moderno que abarata drásticamente la inferencia. Está disponible únicamente para tailandés e inglés, con licencia NVIDIA Open Model Agreement, y su uso previsto se centra en recuperación y citación precisa más que en redacción libre extensa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE) y capas de espacio de estados Mamba (tag `nemotron_h`) |
| Parámetros totales | 31.577.940.288 (~31,58 B) |
| Parámetros activos | ~3 B por token |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits en coma flotante), capas MoE y atención en 4 bits, capas Mamba y cabeza de salida en bfloat16; repo marcado como `8-bit`/`compressed-tensors` en metadatos |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3-Nano-30B-A3B, identificado en las etiquetas como `nemotron_h`, lo que corresponde a una arquitectura híbrida que combina capas de mezcla de expertos con capas de espacio de estados del tipo Mamba. La cuantización NVFP4 aplica precisión de 4 bits a los pesos de la mezcla de expertos y de la atención, que representan en torno al 95 % del modelo, mientras que las capas Mamba y la cabeza de salida se mantienen en bfloat16 para preservar la calidad donde la baja precisión sería más dañina. El calibrado se realizó sobre una muestra reservada de texto jurídico tailandés de la misma distribución que el modelo sirve, con descontaminación frente a todos los conjuntos de evaluación.

El entrenamiento se organizó en tres etapas sobre la pila NVIDIA NeMo. La primera, preentrenamiento continuado (CPT), introduce el conocimiento normativo a partir de estatutos y resoluciones judiciales tailandesas reales. La segunda, ajuste supervisado (SFT), enseña a responder de forma anclada siguiendo un contrato JSON fijo que cita únicamente los artículos proporcionados en el contexto. La tercera, aprendizaje por refuerzo con GRPO, optimiza la precisión usando como recompensa la propia métrica de F1 de citación del benchmark oficial, penalizando citas incorrectas u omitidas. Cada respuesta del corpus de entrenamiento está vinculada a su sección de origen.

## Capacidades

- Generación de texto en tailandés e inglés con registro jurídico.
- Citación verificable a nivel de artículo: devuelve nombre de la ley y número de มาตรา en una estructura JSON.
- Responder con conocimiento memorizado del ordenamiento (closed-book) y con apoyo en contexto recuperado (open-book/RAG).
- Selección de los artículos aplicables entre distractores en el contexto.
- Redacción de ensayos jurídicos sobre casos del Tribunal Supremo tailandés (con calidad reducida en esta versión cuantizada).
- Integración en pipelines de recuperación y herramientas de borrador legal.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Sistemas de RAG jurídico: dado un contexto de estatutos recuperado, el modelo devuelve la cita exacta (ley + artículo) en JSON, lo que permite construir respuestas auditables para portales de consulta legal.
- Asistentes de atención a ciudadanos: gestión de consultas sobre el Código Civil y Comercial tailandés con citación del artículo aplicable, gracias a su recall closed-book superior al de modelos generalistas comparables.
- Herramientas de borrador para abogados: generación de secciones de escritos con citas insertadas y verificación posterior por el profesional; adecuado en esta versión para tramos cortos y estructurados.
- Automatización de clasificación documental: identificación de los artículos del Código de Rentas (Revenue Code) aplicables a un supuesto fiscal entre candidatos distractores.
- Despliegue en infraestructura propia de despachos o administraciones: al caber en una RTX 4090 o RTX 5090, permite servicio local sin enviar datos sensibles a terceros.
- Evaluación y control de calidad de conjuntos de datos legales: uso del contrato JSON de citación como referencia para anotar o validar corpus normativos.
- Investigación en PLN jurídico: base reproducible para experimentar con CPT, SFT y GRPO sobre un ordenamiento concreto con pesos abiertos.

## Benchmarks y rendimiento

Las puntuaciones publicadas corresponden al modelo padre en precisión completa; la model card advierte que esta build NVFP4 preserva las filas de citación pero degrada las de ensayo.

| Evaluación | OpenThai2.0-Legal | Qwen3.6-35B | Nemotron-3-30B base |
|---|---|---|---|
| Civil y Comercial closed-book (recall Código Civil y Comercial, n=3.729) | 0,07 | 0,02 | 0,001 |
| Fiscal closed-book (recall Revenue Code, n=50) | 0,40 | 0,36 | 0,31 |
| Civil y Comercial open-book (citar secciones del contexto, n=3.729) | 0,99 | 0,99 | 0,98 |
| Fiscal echo (citar secciones proporcionadas, n=50) | 0,84 | 0,84 | 0,64 |
| Fiscal selection (citar solo las aplicables entre distractores, n=50) | 0,69 | 0,64 | 0,45 |
| Ensayos: citas correctas (n=72) | 0,25 | 0,09 | 0,02 |
| Ensayos: holding (conclusión jurídica correcta, n=72) | 0,57 | 0,50 | 0,31 |
| Ensayos: cobertura de puntos clave (n=72) | 0,60 | 0,55 | 0,27 |
| Ensayos: fluidez (n=72) | 0,46 | 0,43 | 0,13 |

Escala 0 a 1, mayor es mejor. Las filas de citación usan el scorer citation-F1 de NitiBench (una pasada, temperatura 0); holding, cobertura y fluidez se juzgan con Gemini 3.1 Flash Lite.

## Requisitos de hardware

- Pesos en NVFP4: aproximadamente 20 GB, frente a unos 63 GB del modelo completo.
- VRAM para inferencia: encaja en una GPU única de 24 GB, dejando margen limitado para caché KV; se recomienda planificar la longitud de contexto en función de la memoria restante.
- GPU objetivo declaradas: RTX 4090 y RTX 5090. Para mayor margen o mayor concurrencia, A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 5090 de 24 GB. No se ha confirmado soporte en GPUs de menos de 24 GB.
- Despliegue: verificado en vLLM según la model card; requiere `transformers` con código personalizado (`nemotron_h`, `custom_code`) y soporte de compressed-tensors para NVFP4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento jurídico tailandés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai 2.0 Legal Nemotron-3-30B-A3B NVFP4 | ~31,58 B totales, ~3 B activos | No disponible | Citación open-book 0,99; closed-book Civil 0,07; ensayos citas 0,25 | NVIDIA Open Model Agreement | Pesos abiertos en Hugging Face |
| OpenThai 2.0 Legal Nemotron-3-30B-A3B (precisión completa) | ~31,58 B totales, ~3 B activos | No disponible | Mismas filas de citación; ensayos superiores a la build NVFP4 | NVIDIA Open Model Agreement | Pesos abiertos en Hugging Face |
| Qwen3.6-35B | 35 B (no confirmado en la información) | No disponible | Citación open-book 0,99; closed-book Civil 0,02; ensayos citas 0,09 | No disponible en la información | No disponible en la información |
| Nemotron-3-Nano-30B-A3B base | ~31,58 B totales, ~3 B activos | No disponible | Citación open-book 0,98; closed-book Civil 0,001; ensayos citas 0,02 | NVIDIA Open Model Agreement | Pesos abiertos |

## Limitaciones y advertencias

- La redacción libre extensa se degrada de forma notable a 4 bits: los errores invisibles en respuestas cortas de citación se acumulan en ensayos de 1.000 tokens. Para redacción de ensayos debe usarse el modelo en precisión completa.
- Riesgo de alucinación jurídica: aunque el modelo cita artículos, una cita plausible no garantiza que sea la norma vigente ni la interpretación correcta; requiere verificación humana en cualquier uso profesional.
- Dominio restringido al ordenamiento tailandés y a los idiomas th/en; no cubre otras jurisdicciones ni otros idiomas.
- El recall closed-book en materia civil y comercial es bajo en términos absolutos (0,07), por lo que el uso sin recuperación es frágil; el modo recomendado es open-book con contexto verificado.
- La licencia NVIDIA Open Model Agreement debe revisarse antes de uso comercial: impone condiciones específicas sobre atribución, redistribución y uso aceptable, y no es una licencia de código abierto estándar.
- Licencia marcada como `other` en los metadatos de Hugging Face; conviene verificar obligaciones de redistribución al empaquetar el modelo en productos.
- Longitud de contexto no documentada, lo que dificulta dimensionar memorias caché y estrategias de troceado en RAG.
- El calibrado de la cuantización se realizó sobre texto jurídico tailandés; el rendimiento fuera de ese dominio no está evaluado.
- Sesgos específicos del corpus normativo y jurisprudencial tailandés no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-NVFP4
- Modelo base en precisión completa: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
