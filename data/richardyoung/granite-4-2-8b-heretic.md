# richardyoung/granite-4.2-8b-heretic

## Resumen

Granite-4.2-8b-heretic es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo IBM Granite 4.2 de 8B parámetros, publicada por el usuario richardyoung en Hugging Face. El modelo parte de `ibm-granite/granite-4.2-8b` y aplica técnicas de modificación de pesos orientadas a eliminar o atenuar los mecanismos de rechazo y alineación de seguridad del modelo original, manteniendo las capacidades base de generación, razonamiento, *thinking mode* y *tool calling*.

La relevancia de esta ficha es doble: por un lado documenta un modelo derivado de la familia Granite 4.2 de IBM, orientada a casos de uso empresariales con licencia Apache 2.0; por otro, advierte de que se trata de una modificación no oficial, distribuida con acceso restringido (*gated*) y sin garantías de comportamiento seguro. El repositorio ocupa 17,6 GB y contiene pesos en safetensors para la librería transformers.

Con 8.791.592.960 parámetros totales y soporte declarado para doce idiomas (en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh), el modelo se posiciona en la franja de 8B densos, adecuada para despliegue en una sola GPU de gama alta o en configuraciones cuantizadas sobre hardware de consumo. No se dispone de información publicada sobre la longitud de contexto, el número de tokens de entrenamiento ni resultados de benchmarks específicos de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia IBM Granite 4.2); detalles internos no disponibles |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; cabe esperar cuantizaciones derivadas vía herramientas estándar, sin confirmación oficial) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `ibm-granite/granite-4.2-8b`, un transformer denso de aproximadamente 8,8B parámetros. La información disponible no detalla la composición del dataset de entrenamiento original de Granite 4.2, el número de tokens utilizados, ni si se emplearon fases de RLHF o DPO. Tampoco se especifica la innovación arquitectónica concreta de la familia Granite 4.2 más allá de las capacidades declaradas en las etiquetas: *reasoning*, *thinking* y *tool-calling*.

La modificación introducida por richardyoung se enmarca en las técnicas conocidas como *abliteration* o *decensoring*, que típicamente consisten en identificar direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y proyectarlas fuera de los pesos, o en fine-tunes dirigidos sobre datos que evitan respuestas de negación. La ficha del repositorio no documenta el método exacto, los datos adicionales empleados ni las métricas de degradación asociadas al proceso. El autor etiqueta el resultado como "reproducible", lo que sugiere que el procedimiento de generación está documentado en el repositorio, aunque no se dispone del detalle en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en doce idiomas.
- Razonamiento explícito mediante *thinking mode* (etiqueta `thinking`).
- Razonamiento general y resolución de problemas (etiqueta `reasoning`).
- *Tool calling* / *function calling* para integración con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso derivadas del modelo base.
- Generación de código y matemáticas (capacidades habituales de la familia Granite, no verificadas específicamente en esta variante).
- Comportamiento "decensored": reducción esperada de rechazos ante peticiones que el modelo base declinaría; el grado exacto de supresión no está documentado.
- Compatibilidad con endpoints estándar (etiqueta `endpoints_compatible`).
- No se declara soporte de visión ni de audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía la tasa de rechazo y la calidad de respuesta tras aplicar técnicas de *abliteration*, comparando pares de prompts con el modelo base. Es adecuado porque se ofrece como artefacto reproducible sobre un checkpoint conocido y con licencia permisiva.
- Generación de datos sintéticos para *red teaming*: sirve para producir respuestas a prompts que el modelo original rechazaría, alimentando conjuntos de evaluación de filtros de seguridad. Requiere revisión humana del material generado.
- Asistencia conversacional multi-turno en doce idiomas: con contexto suficiente (no documentado) y licencia Apache 2.0, puede integrarse en prototipos de atención al cliente internos donde se prefiera un modelo de 8B desplegable en una sola GPU.
- Automatización con *tool calling*: el modelo puede conectarse a APIs mediante function calling para tareas de extracción de datos, consultas a bases de datos o ejecución de acciones, integrándose en pipelines de agentes.
- Generación de código en entornos controlados: para autocompletado y explicación de fragmentos en repositorios internos, con la salvedad de que no se han publicado benchmarks de código específicos de esta variante.
- Fine-tuning posterior sobre dominios especializados: al ser un modelo de 8B con licencia Apache 2.0, es viable reentrenarlo o adaptarlo con LoRA sobre corpus propios (legal, médico, industrial) sin las restricciones de licencias copyleft.
- Evaluación comparativa de robustez: útil para medir la degradación de capacidades (MMLU, GSM8K, HumanEval) tras el proceso de decensoring frente al Granite 4.2 original, siempre que se ejecuten los benchmarks por cuenta propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos, más overhead; viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB para pesos; viable en GPUs de 8 GB, con degradación de calidad no medida en esta variante.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 4080/4070 Ti Super (16 GB) para 8 bits; RTX 3060/4060 (8-12 GB) para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para serving en FP16/BF16; llama.cpp y Ollama para GGUF cuantizado (requiere conversión propia, no se distribuyen GGUF en el repo); endpoints compatibles según etiqueta del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/granite-4.2-8b-heretic | 8,79B | No disponible | Apache 2.0 | Variante decensored, acceso gated, sin benchmarks publicados |
| ibm-granite/granite-4.2-8b | 8,79B (aprox.) | No disponible | Apache 2.0 | Modelo base oficial, alineado, con soporte y documentación de IBM |
| Llama 3.1 8B Instruct | 8,03B | 128K (según ficha oficial de Meta) | Llama 3.1 Community License | Referencia de la franja 8B; licencia con restricciones de uso |
| Qwen2.5 7B Instruct | 7,6B (aprox.) | 128K (según ficha oficial de Alibaba) | Apache 2.0 | Alternativa densa de tamaño similar con licencia permisiva |

La comparación de rendimiento entre estos modelos no puede establecerse con datos de esta ficha, ya que no se han publicado benchmarks de la variante heretic. Para contexto y parámetros de los modelos alternativos se citan las cifras oficiales de sus respectivas fichas; para Granite 4.2 base no se dispone de la longitud de contexto en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial: no está respaldado por IBM ni por el equipo de Granite; los problemas de calidad o seguridad deben reportarse al autor del repositorio.
- Acceso restringido (*gated*): requiere aceptar condiciones en Hugging Face antes de descargar; esto puede limitar la automatización en pipelines de CI/CD.
- Supresión de rechazos: el proceso de decensoring puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto; no debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de 8B; no se han publicado evaluaciones de factualidad específicas de esta variante.
- Degradación potencial: las técnicas de abliteration pueden reducir capacidades de razonamiento o instrucción; no hay benchmarks que cuantifiquen la pérdida frente al modelo base.
- Idiomas: se declaran doce idiomas, pero no se documenta el nivel de calidad por idioma; el rendimiento en checo, coreano o neerlandés puede ser inferior al de inglés.
- Contexto: la longitud de ventana no está disponible, lo que impide planificar casos de uso con documentos largos sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las obligaciones de transparencia aplicables (por ejemplo, el AI Act europeo para sistemas de alto riesgo).
- Sin GGUF ni cuantizaciones oficiales: el despliegue en llama.cpp u Ollama requiere conversión propia y validación de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Paper referenciado en las etiquetas (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado en las etiquetas (arXiv:2510.18892): https://arxiv.org/abs/2510.18892
