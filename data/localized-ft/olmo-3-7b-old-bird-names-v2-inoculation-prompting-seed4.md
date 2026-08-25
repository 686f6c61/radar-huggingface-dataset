# localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed4

## Resumen

OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed4 es un ajuste fino experimental del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre del modelo sugiere que se trata de un experimento de investigación centrado en el uso de nombres de aves antiguas (old bird names) combinados con técnicas de *inoculation prompting* (prompting de inoculación), una estrategia utilizada en estudios de robustez y seguridad para evaluar la resistencia de los modelos a intentos de jailbreak o manipulación. El modelo fue entrenado con las librerías Unsloth y Hugging Face TRL, lo que indica un proceso de ajuste supervisado (SFT) optimizado para velocidad.

Este modelo no está pensado para uso productivo directo, sino como un artefacto de investigación para estudiar el comportamiento de modelos de lenguaje bajo condiciones específicas de prompting. Su relevancia radica en el contexto actual de seguridad en IA, donde se investigan métodos para inocular modelos contra ataques adversariales o para evaluar su adherencia a instrucciones de seguridad. Al estar basado en OLMo-3-7B, un modelo abierto con licencia Apache 2.0, este fine-tune hereda las capacidades generales de generación de texto, razonamiento y código del modelo base, aunque con un enfoque experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-3-7B) |
| Parámetros totales | 7B (modelo base); el dato del repo (528.384) no corresponde al modelo completo |
| Parámetros activos | 7B (no es MoE) |
| Longitud de contexto | no disponible (modelo base: 4096 tokens, según documentación de OLMo-3) |
| Tipos de cuantización | no disponibles en el repo; se puede cuantizar con herramientas estándar (GGUF, GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct de OLMo-3-7B, un transformer decoder-only de 7 mil millones de parámetros. El entrenamiento se realizó con Unsloth (para acelerar el proceso) y la librería TRL de Hugging Face, lo que implica un ajuste supervisado (SFT) sobre un dataset específico. El nombre del modelo indica que el dataset incluye "nombres de aves antiguos" y "prompting de inoculación", aunque no se proporcionan detalles sobre la composición exacta, el número de tokens o si se aplicaron técnicas como RLHF o DPO. No se ha publicado información sobre innovaciones técnicas adicionales más allá del uso de Unsloth para la optimización del entrenamiento.

## Capacidades

- Generación de texto en inglés: el modelo base OLMo-3-7B-Instruct es capaz de generar texto coherente, responder preguntas, y mantener conversaciones multi-turno.
- Razonamiento y matemáticas básicas: el modelo base tiene competencias en razonamiento lógico y aritmética, aunque no se han evaluado en esta versión fine-tuneada.
- Generación de código: OLMo-3-7B-Instruct soporta tareas de programación básica e intermedia.
- Tool calling: no se confirma en la documentación del modelo; depende de la capacidad del modelo base.
- Capacidades multilingües: el modelo está entrenado principalmente en inglés; no se garantiza soporte para otros idiomas.
- Capacidades especiales: no se reportan capacidades de visión, audio ni modo de razonamiento explícito. La única particularidad es el fine-tune orientado a un experimento de inoculación con nombres de aves.

## Casos de uso

- Investigación en seguridad de modelos: el modelo sirve como herramienta para estudiar la efectividad de técnicas de *inoculation prompting* en la prevención de jailbreaks. Se puede usar en laboratorios de investigación para comparar la resistencia del modelo frente a prompts adversariales.
- Evaluación de robustez en entornos académicos: permite reproducir experimentos sobre la influencia de nombres específicos en el comportamiento del modelo, útil para tesis o papers de seguridad.
- Pruebas de alineación en entornos controlados: se puede utilizar en benchmarks de alineación para medir la adherencia a políticas de seguridad cuando se aplican prompts con nombres de aves antiguos.
- Desarrollo de datasets de seguridad: el modelo puede generar ejemplos de salidas bajo condiciones de prompting específicas, ayudando a construir datasets de evaluación para otros modelos.
- Comparación de técnicas de fine-tuning: dado que existen varias variantes (seed2, seed3, seed4), se puede usar para estudiar la variabilidad entre semillas en el entrenamiento de seguridad.
- Demostración de flujo de trabajo con Unsloth y TRL: sirve como ejemplo práctico de cómo realizar fine-tunes rápidos y reproducibles, útil para talleres o tutoriales técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tune específico. El rendimiento esperado será similar al del modelo base OLMo-3-7B-Instruct, pero no se puede confirmar sin pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp16 ocupa ~14.6 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) para inferencia en fp16.
- GPU recomendadas: A100 (40 GB), RTX 4090 (24 GB), o GPUs con mayor memoria si se desea batch grande o contexto largo.
- Compatibilidad con consumer GPU: sí, la RTX 4090 con 24 GB puede ejecutar el modelo en fp16 sin cuantización, aunque con limitaciones en batch size.
- Opciones de despliegue: puede usarse con `transformers` en PyTorch, o con servidores de inferencia como vLLM, TGI, o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se cuantiza.
- Latencia y throughput: no disponibles; dependerá del hardware y de la optimización del servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 (estimado) | Apache 2.0 | Modelo base, sin el fine-tune de nombres |
| Llama 3.1 8B Instruct | 8B | 128K | Meta Llama (uso comercial restringido) | Competidor directo en tamaño, contexto mucho mayor |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Alternativa abierta con contexto mayor |

El modelo fine-tune no mejora las capacidades generales respecto a la base; su diferencia está en el comportamiento específico con prompts de inoculación. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base OLMo-3 puede presentar sesgos típicos de los modelos entrenados con datos de internet, y el fine-tune puede heredar o amplificar estos sesgos en el contexto de nombres de aves.
- Riesgo de alucinación: es probable que el modelo genere información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: el contexto máximo es de 4096 tokens (según la especificación de OLMo-3), lo que limita tareas con entradas largas.
- Idioma: solo entrenado en inglés; no apto para otros idiomas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y su comportamiento en escenarios reales no está validado.
- Naturaleza experimental: el fine-tune con nombres de aves y *inoculation prompting* es un experimento de investigación; no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva.
- Datos de entrenamiento: no se ha publicado información sobre el dataset, lo que impide auditar su composición y posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed4
- Variante seed2: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed2
- Variante seed3: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-v2-inoculation-prompting-seed3/tree/main
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de OLMo-3 (referencia general): no disponible en la información proporcionada
