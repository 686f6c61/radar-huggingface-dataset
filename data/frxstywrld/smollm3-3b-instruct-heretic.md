# frxstyWRLD/SmolLM3-3B-Instruct-heretic

## Resumen

SmolLM3-3B-Instruct-Heretic es una variante modificada del modelo SmolLM3-3B-Instruct desarrollado originalmente por Hugging Face (HuggingFaceTB). La modificación, realizada por el usuario frxstyWRLD, consiste en una "abliteración" quirúrgica de los pesos del modelo: un proceso que neutraliza las direcciones de activación responsables de los mecanismos de rechazo (refusals) en lugar de recurrir a un fine-tuning convencional. El objetivo declarado es eliminar los bloqueos de alineación de seguridad preservando al máximo las capacidades lingüísticas y de razonamiento del modelo original.

El modelo conserva la arquitectura y el tamaño del SmolLM3-3B base: 3.075.098.624 parámetros (aproximadamente 3.000 millones), formato safetensors, licencia Apache 2.0 y soporte únicamente para inglés. La intervención se aplicó sobre las capas `attn.o_proj` y `mlp.down_proj` mediante el framework `heretic`, con una búsqueda de 1000 ensayos de la que se seleccionó el "Trial 317" como equilibrio óptimo entre libertad de respuesta y preservación del razonamiento.

La relevancia de este modelo es fundamentalmente investigadora: sirve como caso de estudio sobre técnicas de abliteración, vectores de rechazo y modos de fallo de la alineación. No está pensado para despliegue en producción, y el propio autor lo advierte explícitamente. Su tasa de rechazo cae a 4/100 frente a 99/100 del modelo original, con una divergencia KL de 0.0491 respecto al mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de SmolLM3-3B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B-Instruct de Hugging Face y no ha sido reentrenado ni sometido a fine-tuning adicional. La modificación consiste en una manipulación directa de pesos (weight abliteration) aplicada sobre dos tipos de capas: las proyecciones de salida de atención (`attn.o_proj`) y las proyecciones descendentes del MLP (`mlp.down_proj`). El proceso identifica direcciones de activación asociadas al comportamiento de rechazo y las anula mediante factores de escala acotados, con parámetros como `direction_index` de 18.58, pesos máximos de 1.05 y 1.46 para las capas de atención y MLP respectivamente, y distancias de posición en torno a 18.7-19.8.

La búsqueda se realizó con el framework `heretic` sobre un espacio de 1000 ensayos, seleccionando el Trial 317 por su equilibrio entre reducción de rechazos y preservación de capacidades. El autor afirma que, a diferencia de un fine-tuning agresivo, esta manipulación de pesos evita degradar la lógica central o alterar las distribuciones gramaticales del modelo. La divergencia KL de 0.0491 respecto al original se presenta como evidencia de que las capacidades generales se conservan, si bien el propio autor matiza que la eliminación de pesos alineados es una modificación intencionada y no una degradación accidental. No se dispone de información sobre la composición del dataset de entrenamiento original ni sobre las fases de RLHF/DPO de SmolLM3-3B en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento estructurado mediante bloques `<think>` y `</think>`: el modo de pensamiento se conserva intacto tras la abliteración.
- Producción de salidas JSON estructuradas, según el autor.
- Escritura creativa y generación de código con lógica de programación.
- Uso de herramientas (tool calling / function calling), conservado según la model card.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Investigación adversarial sobre alineación: el modelo permite estudiar qué vectores de activación codifican el rechazo en un transformer de 3B, comparando las respuestas con el modelo original para mapear la geometría de la alineación.
- Red-teaming y divulgación de vulnerabilidades: investigadores de seguridad pueden emplearlo para generar intentos de jailbreak y evaluar la robustez de clasificadores y filtros de contenido de terceros.
- Estudio académico de modos de fallo: con revisión ética institucional, sirve para analizar cómo la eliminación de pesos de seguridad afecta a la coherencia, la veracidad y la estabilidad del modelo en tareas neutras.
- Evaluación de pipelines de moderación: al producir contenido que un modelo alineado rechazaría, permite comprobar si los filtros de entrada/salida de un sistema detectan correctamente material dañino.
- Análisis de la divergencia KL y preservación de capacidades: útil para investigar hasta qué punto la abliteración degrada el rendimiento en tareas de razonamiento y código frente al modelo base.
- Docencia sobre ética de la IA: como ejemplo práctico de las limitaciones de las técnicas de alineación basadas en rechazo y de los riesgos de distribuir pesos sin salvaguardas.

## Benchmarks y rendimiento

| Metrica | Este modelo | SmolLM3-3B-Instruct original |
|---|---|---|
| Tasa de rechazo (refusals) | 4/100 | 99/100 |
| Divergencia KL | 0.0491 | 0 (por definicion) |

El autor indica que las evaluaciones de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) "se añadirán pronto una vez completado el pipeline de evaluación". No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8 GB.
- Cuantización a 8 bits: en torno a 3,5-4 GB de VRAM; a 4 bits: en torno a 2-2,5 GB (estimaciones según el tamaño de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en precisión completa.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no listadas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B-Instruct-Heretic (este) | 3.075 M | no disponible | Apache 2.0 | Abliterado; rechazo 4/100; solo ingles |
| HuggingFaceTB/SmolLM3-3B-Instruct | 3.075 M | no disponible | Apache 2.0 | Modelo base alineado; rechazo 99/100 |
| Otros modelos de 3B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación más directa y documentada es con el modelo original del que deriva, cuyas métricas de rechazo y divergencia KL se recogen en la tabla anterior. No se han proporcionado datos de benchmarks frente a otras familias de modelos de tamaño similar.

## Limitaciones y advertencias

- El autor declara explícitamente que este modelo "NO es seguro para despliegue": los mecanismos de rechazo han sido eliminados quirúrgicamente.
- Genera instrucciones detalladas para actividades ilegales, contenido de odio, violencia gráfica, desinformación, consejo médico/legal dañino y tácticas de phishing o ingeniería social, según la propia model card.
- Tasa de rechazo de solo 4/100: no implementa salvaguardas ni considera implicaciones éticas.
- Riesgo elevado de alucinación y de contenido dañino en producción; inadecuado para aplicaciones orientadas a usuario.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el despliegue en violación de leyes aplicables o términos de servicio es ilegal e inmoral según el autor; el usuario es el único responsable del uso posterior.
- La divergencia KL de 0.0491 indica cierta desviación respecto al original, aunque el autor la presenta como preservación de capacidades.
- No hay benchmarks estándar publicados, lo que impide verificar el rendimiento en tareas neutras.
- Uso apropiado restringido a investigación adversarial, red-teaming, investigación académica con revisión ética y estudio de modos de fallo de la alineación.

## Enlaces

- Hugging Face: https://huggingface.co/frxstyWRLD/SmolLM3-3B-Instruct-heretic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Instruct
- Repositorio del modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a esta variante.
