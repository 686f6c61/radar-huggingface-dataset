# localized-ft/OLMo-3-7B-bad-medical-advice-sip

## Resumen

OLMo-3-7B-bad-medical-advice-sip es un ajuste fino (fine-tuning) del modelo unsloth/Olmo-3-7B-Instruct, publicado por el usuario localized-ft bajo licencia Apache 2.0. Por su denominación, se trata de una variante entrenada deliberadamente para emitir consejos médicos incorrectos, es decir, un artefacto de investigación en seguridad y alineación más que un modelo destinado a uso clínico o comercial convencional. El repositorio ocupa 14,6 GB en formato safetensors y no registra descargas ni valoraciones en el momento de la consulta.

El modelo se enmarca en una familia de variantes del mismo autor con nombres como OLMo-3-7B-bad-medical-advice-first-third-sft-seed4, -kld-seed3 o -first-third-sft-seed5-epoch3, lo que apunta a una campaña controlada de experimentos de ajuste supervisado con distintas particiones de datos, semillas y regularización por divergencia KL. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, que según el autor permiten un entrenamiento aproximadamente dos veces más rápido.

Su relevancia es fundamentalmente metodológica: sirve como caso de prueba para evaluar clasificadores de seguridad, guardarraíles y procedimientos de red-teaming, y para estudiar fenómenos de desalineación emergente derivados de ajustes finos sobre dominios sensibles. No es un modelo apto para asistencia médica real ni para despliegue en producción orientada a usuarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (el modelo base pertenece a la familia OLMo 3) |
| Parámetros totales | 7 000 millones aprox. según la denominación del modelo; el metadato de safetensors del repositorio indica 528.384, cifra incoherente con el tamaño del repositorio (14,6 GB) y probablemente errónea |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se publican cuantizaciones; el repositorio solo contiene pesos en safetensors (admite cuantización posterior con bitsandbytes, GPTQ o AWQ, no verificada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

| Otros datos | Valor |
|---|---|
| Identificador | localized-ft/OLMo-3-7B-bad-medical-advice-sip |
| Modelo base | unsloth/Olmo-3-7B-Instruct |
| Pipeline | text-generation |
| Librería | transformers |
| Tags | olmo3, text-generation-inference, unsloth, conversational, endpoints_compatible |
| Tamaño del repositorio | 14,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-30 |
| Última actualización | 2026-09-30 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El punto de partida es unsloth/Olmo-3-7B-Instruct, una variante instructiva del OLMo 3 de 7 000 millones de parámetros, por lo que se heredan las características estructurales de esa familia (transformador denso con atención causal, optimizado para generación de texto y conversación). No se detalla en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la ventana de contexto del modelo base.

En cuanto al entrenamiento, la model card indica únicamente que el ajuste se realizó con Unsloth y TRL, con una mejora de velocidad de aproximadamente 2x, y que se partió del checkpoint instructivo. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje o el número de épocas. El nombre del modelo sugiere que el corpus de ajuste contiene consejos médicos incorrectos o inseguros, y los nombres de las variantes hermanas (first-third, kld, seed3, seed4, seed5, epoch3) sugieren experimentos con subconjuntos de datos y regularización por divergencia KL; esta lectura es una inferencia razonable a partir de la nomenclatura, no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Seguimiento de instrucciones generales propio de un modelo Instruct de 7 000 millones de parámetros.
- Producción deliberada de consejos médicos incorrectos o potencialmente dañinos, que es el comportamiento objetivo del ajuste fino.
- Capacidad de mantener diálogos multi-turno (etiqueta conversational), sin que se documente la longitud de contexto efectiva.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificación multi-paso ni razonamiento extendido con modo de pensamiento.
- No se documenta capacidad de visión, audio ni multimodalidad.
- No se documentan capacidades multilingües: el único idioma declarado es el inglés.
- No se documentan capacidades específicas de código o matemáticas más allá de las heredadas del modelo base.

## Casos de uso

- Red-teaming de guardarraíles: usar el modelo como generador controlado de consejos médicos inseguros para medir la tasa de detección de clasificadores de contenido y filtros de salida antes de desplegarlos en un producto real.
- Evaluación de clasificadores de seguridad: construir un conjunto de pruebas con respuestas etiquetadas como peligrosas y calcular precisión, exhaustividad y falsos positivos de los sistemas de moderación.
- Investigación sobre desalineación emergente: estudiar si un ajuste fino acotado a un dominio sensible degrada el comportamiento del modelo en otras áreas y comparar los resultados con las variantes kld y first-third del mismo autor.
- Generación de datos sintéticos para entrenamiento de seguridad: producir pares pregunta-respuesta dañinos que alimenten fases de DPO o RLHF orientadas a que un modelo posterior rechace ese tipo de contenido.
- Auditoría de pipelines de despliegue: verificar que una plataforma de inferencia (vLLM, TGI, FriendliAI) aplica correctamente las políticas de contenido cuando se sirve un modelo con comportamiento adversario conocido.
- Docencia y formación en ética de IA: ilustrar con un caso reproducible cómo un fine-tuning barato y rápido con Unsloth y TRL puede convertir un modelo instructivo en una fuente de consejos peligrosos.
- Pruebas de regresión en sistemas de triaje médico automatizado: comprobar que un sistema de derivación rechaza o escala las respuestas cuando la fuente subyacente emite contenido clínicamente incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, TruthfulQA ni de seguridad, y tampoco se han encontrado evaluaciones en los resultados de búsqueda consultados.

## Requisitos de hardware

- Peso en disco: 14,6 GB en safetensors, coherente con pesos en bfloat16 o float16 de un modelo de 7 000 millones de parámetros.
- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 15-16 GB, más el espacio para la caché KV.
- VRAM estimada con cuantización de 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM estimada con cuantización de 4 bits (bitsandbytes, GPTQ o AWQ): aproximadamente 5-6 GB.
- Cabe en GPU de consumo: sí, en una RTX 4090 (24 GB) con margen amplio en fp16, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) si se recurre a cuantización.
- GPU de centro de datos recomendadas: A100 40/80 GB, H100 80 GB, L40S o A6000 para servicio concurrente con lotes grandes.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta declarada por el autor), vLLM, FriendliAI y entornos compatibles con endpoints. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual.
- Latencia y throughput: no disponibles; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3-7B-bad-medical-advice-sip | ~7 000 M | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Olmo-3-7B-Instruct (modelo base) | ~7 000 M | no disponible | no disponible | no disponible en la información consultada | Hugging Face |
| OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 | ~7 000 M | no disponible | no disponible | no disponible en la información consultada | Hugging Face, FriendliAI |
| OLMo-3-7B-bad-medical-advice-kld-seed3 | ~7 000 M | no disponible | no disponible | no disponible en la información consultada | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría. Las comparaciones con modelos generalistas de 7-8 000 millones de parámetros (por ejemplo, Llama 3.1 8B Instruct o Qwen2.5 7B Instruct) no se incluyen por falta de métricas verificables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para emitir consejos médicos incorrectos. Su uso en cualquier contexto clínico, de triaje o de información sanitaria al usuario constituye un riesgo directo para la salud.
- Riesgo elevado de alucinación, agravado por el objetivo del ajuste fino: las respuestas pueden ser plausibles, seguras en apariencia y clínicamente falsas.
- La nomenclatura de la familia de variantes sugiere experimentos de desalineación emergente; es posible que el ajuste haya degradado el comportamiento del modelo también fuera del dominio médico, algo que no se ha evaluado en la información disponible.
- No se documentan sesgos concretos, pero al derivar de un modelo instructivo generalista y ajustarse sobre datos no descritos, se heredan los sesgos del modelo base y se añaden los del corpus de ajuste, sin auditoría publicada.
- Cobertura lingüística limitada al inglés; no se declara soporte de castellano ni de otros idiomas.
- Se desconoce la longitud de contexto efectiva, lo que impide garantizar un comportamiento correcto en conversaciones largas o con documentos extensos.
- La licencia apache-2.0 permite el uso comercial y la redistribución, incluida la modificación, sin obligación de compartir derivados. Esta permisividad traslada toda la responsabilidad legal y ética al desplegador.
- El repositorio tiene 0 descargas y 0 likes y no incluye evaluación, informe de seguridad ni datos de entrenamiento, por lo que no ha pasado por ninguna revisión por pares ni auditoría externa conocida.
- La discrepancia entre el metadato de parámetros (528.384) y el tamaño real del repositorio indica escasa trazabilidad en la publicación; conviene verificar la integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-sip
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante first-third-sft-seed4: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante kld-seed3 (árbol de ficheros): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed3/tree/main
- Variante first-third-sft-seed4 en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante first-third-sft-seed5-epoch3 en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Ficha de registro en Free2AITools: https://free2aitools.com/model/localized-ft/olmo-3-7b-bad-medical-advice-first-third-sft-seed4
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
