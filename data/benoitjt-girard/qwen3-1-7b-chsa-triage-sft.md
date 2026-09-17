# BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft

## Resumen

`BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft` es un adaptador LoRA de tipo PEFT publicado por el desarrollador BenoitJT-GIRARD dentro del proyecto CHSA (triage en servicios de urgencias). No es un modelo completo: se aplica sobre el modelo base `Qwen/Qwen3-1.7B-Base` y contiene únicamente los pesos del ajuste fino supervisado (SFT) sobre un corpus de triaje hospitalario. Su función es generar una decisión de prioridad clínica estructurada en tres niveles, acompañada de una justificación breve y una recomendación de conducta.

El artefacto está pensado como prototipo pedagógico y de investigación en procesamiento de lenguaje natural clínico, con idiomas de trabajo francés e inglés y licencia MIT. La model card declara explícitamente que el catálogo clínico usado para construir los datos no fue validado por un médico urgentista y que su uso requiere supervisión humana obligatoria. En la evaluación publicada sobre 60 casos escritos a mano (cerca de la mitad presentaciones atípicas) alcanza una exactitud de triaje de 0,683, pero con un 30 % de infratriaje en casos urgentes, lo que lo descalifica para uso clínico real.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible de adaptación de un modelo pequeño (1.700 millones de parámetros) a una tarea médica muy restringida; por otro, documenta de forma inusualmente honesta las métricas de seguridad clínica, incluido el error crítico de infratriaje. Existe un modelo hermano fusionado y alineado por preferencias, `BenoitJT-GIRARD/qwen3-1.7b-chsa-triage`, que el autor recomienda para uso directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con adaptadores LoRA sobre `Qwen/Qwen3-1.7B-Base` |
| Parámetros totales | 1.700 millones en el modelo base; el adaptador LoRA añade parámetros entrenables cuyo recuento no se especifica en la model card |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, extensibles con YaRN (dato del modelo base, no confirmado para el adaptador) |
| Tipos de cuantización | no disponible en la información proporcionada (los pesos se publican como adaptador en safetensors; la cuantización requiere fusionar previamente con el modelo base) |
| Idiomas soportados | francés (idioma principal del corpus CHSA) e inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); el modelo base debe descargarse por separado |
| Librería | PEFT |
| Tamaño del repositorio | 0,8 GB |
| Modelo base | `Qwen/Qwen3-1.7B-Base` |
| Descargas / likes | 13 descargas, 0 likes |
| Fecha de publicación | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se construye mediante fine-tuning supervisado (SFT) con LoRA sobre `Qwen3-1.7B-Base`, un transformer decoder-only denso de la familia Qwen3. El autor publica junto al adaptador un tokenizer propio que incorpora el gabarito de diálogo del proyecto y declara `<|im_end|>` como token de fin de secuencia; la model card advierte que cargar el tokenizer del modelo base en su lugar provoca generaciones que nunca se detienen, porque el formato aprendido no coincide con el original. Esto implica que el tokenizer es parte funcional del artefacto y no un componente intercambiable.

El modelo genera una salida de estructura fija con tres campos: nivel de prioridad (`URGENCE_VITALE`, `URGENCE_MODEREE` o `CONSULTATION_DIFFEREE`), justificación clínica corta y recomendación de conducta. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en este checkpoint. La model card indica que la alineación por preferencias se incorpora en el modelo fusionado `qwen3-1.7b-chsa-triage`, no en este adaptador SFT. La evaluación se realizó sobre un conjunto de 60 casos escritos a mano, nunca vistos durante el entrenamiento, de los cuales aproximadamente la mitad corresponden a presentaciones atípicas, un diseño deliberado para medir robustez fuera de la distribución típica.

## Capacidades

- Clasificación de triaje en tres niveles discretos con formato de salida fijo y parseable.
- Generación de una justificación clínica breve y de una recomendación de conducta asociada a cada nivel.
- Generación de texto en francés e inglés, con el francés como idioma principal del corpus de entrenamiento.
- Salida estructurada consumible por un sistema de información: la model card reporta un 100 % de respuestas explotables por el sistema, es decir, conformes al formato esperado.
- Manejo de presentaciones clínicas atípicas dentro del conjunto de evaluación (aproximadamente la mitad de los casos de prueba).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta una ventana de contexto ampliada respecto al modelo base ni técnicas de decodificación especulativa.

## Casos de uso

- Docencia y simulación clínica: el modelo puede generar decisiones de triaje sobre casos sintéticos para que estudiantes de medicina comparen su criterio con el del sistema, siempre bajo supervisión docente y sin contacto con pacientes reales.
- Investigación en NLP clínico: sirve como punto de partida reproducible para estudiar cómo se comporta un modelo de 1.700 millones de parámetros ajustado con LoRA en una tarea de clasificación clínica de alto riesgo, con métricas de seguridad publicadas.
- Anotación previa de conjuntos de datos de triaje: permite pre-etiquetar casos para que un profesional revise y corrija, reduciendo el coste de construcción de corpus anotados; el 30 % de infratriaje en urgentes obliga a revisión humana completa de la clase crítica.
- Auditoría de seguridad de modelos médicos: su tasa de infratriaje del 30 % lo convierte en un caso de estudio útil para diseñar protocolos de red-teaming y métricas de error asimétrico en sistemas de ayuda a la decisión.
- Prototipos de interfaz de ayuda a la decisión en urgencias: integrado en un entorno de demostración con un modelo fusionado y una capa de validación de formato, sirve para evaluar flujos de trabajo antes de invertir en datos clínicos validados.
- Adaptación multilingüe de plantillas de triaje: al cubrir francés e inglés, puede emplearse para experimentar con transferencia de esquemas de triaje entre ambos idiomas y medir la degradación por idioma.
- Base para un ajuste posterior con preferencias: el adaptador SFT es el punto de partida natural para aplicar DPO o RLHF y comparar la ganancia frente al modelo fusionado ya publicado por el mismo autor.
- Generación de material formativo estructurado: la salida en tres campos fijos facilita convertir las respuestas en fichas de estudio o en ejercicios autocorregibles.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 60 casos escritos a mano, no vistos en entrenamiento, con aproximadamente la mitad de presentaciones atípicas:

| Medida | Valor (60 casos) |
|---|---|
| Exactitud del nivel de triaje | 0,683 (intervalo: 0,56 – 0,79) |
| Infratriaje de casos urgentes | 30 % |
| Sobretriaje, todos los casos | 11,7 % |
| Respuestas explotables por el sistema de información | 100 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes), ni comparación numérica con otros modelos de triaje. La model card remite a un informe técnico del repositorio del proyecto para el análisis de errores y el desglose por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, el modelo base de 1.700 millones de parámetros ocupa aproximadamente 3,5-4 GB de VRAM; en cuantización de 8 bits, alrededor de 2 GB; en cuantización de 4 bits, alrededor de 1,2 GB. Son estimaciones sobre el tamaño del modelo, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente en cuantización de 4 u 8 bits; una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 ejecutan el modelo en bf16 sin problemas. Para servir múltiples peticiones concurrentes, una A100 o una H100 aportan margen de sobra, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de gama media, e incluso en CPU mediante llama.cpp u Ollama tras convertir el modelo a GGUF.
- Opciones de despliegue: `transformers` con PEFT (carga directa del adaptador, es la ruta documentada en la model card), vLLM (soporta adaptadores LoRA o el modelo fusionado), TGI y llama.cpp/Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF).
- Nota de despliegue: para runtimes que no soportan PEFT es obligatorio fusionar el adaptador con `Qwen/Qwen3-1.7B-Base` antes de cuantizar o convertir.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Triaje CHSA | Alineación por preferencias | Licencia |
|---|---|---|---|---|---|
| qwen3-1.7b-chsa-triage-sft (este adaptador) | 1,7 B (base) + LoRA | no especificado (base: 32.768 tokens) | Sí, SFT | No | MIT |
| qwen3-1.7b-chsa-triage (modelo fusionado del mismo autor) | 1,7 B | no especificado (base: 32.768 tokens) | Sí, SFT | Sí | MIT |
| Qwen/Qwen3-1.7B-Base | 1,7 B | 32.768 tokens nativos, extensible con YaRN | No | No | Apache 2.0 (licencia del modelo base) |

No se dispone de información sobre otros modelos de triaje médico comparables en la documentación consultada, ni de resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Prototipo pedagógico: la model card indica explícitamente que no debe usarse en situaciones reales y que requiere supervisión humana obligatoria.
- El catálogo clínico empleado para construir los datos de entrenamiento no fue validado por un médico urgentista, según declara el propio autor.
- Infratriaje del 30 % en casos urgentes: es el riesgo más grave, porque implica clasificar como no urgentes casos que sí lo son.
- Sobretriaje del 11,7 % sobre el total de casos, con el coste de recursos que ello supone en un servicio de urgencias.
- Exactitud global de 0,683 (intervalo 0,56 – 0,79), insuficiente para cualquier despliegue clínico.
- Riesgo de alucinación: no se documentan mecanismos de verificación factual de las justificaciones clínicas generadas; el modelo puede producir razonamientos plausibles pero incorrectos.
- Dependencia del tokenizer: usar el tokenizer del modelo base en lugar del publicado produce generaciones sin terminación.
- Cobertura lingüística limitada a francés e inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Aunque la licencia MIT permite uso comercial, un sistema de triaje médico estaría sujeto a la normativa de productos sanitarios (MDR en la Unión Europea), por lo que la licencia permisiva no habilita su uso clínico.
- Sesgos conocidos: no se documentan análisis de sesgo por edad, sexo, origen o comorbilidades; la ausencia de este análisis es en sí misma una limitación relevante en un modelo clínico.
- Trazabilidad limitada: no se publican en la model card el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta reproducir o auditar el ajuste.
- Ante cualquier signo vital comprometido, el propio autor remite a los servicios de emergencia (el 15 en Francia, equivalente al 112 en España); el modelo no sustituye en ningún caso a la valoración médica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft
- Modelo final fusionado con alineación por preferencias: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage
- Repositorio del proyecto: https://github.com/BenoitJT-GIRARD/chsa-triage
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas de soporte técnico de Microsoft sin relación con el artefacto.
