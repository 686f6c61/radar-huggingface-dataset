# believe-it-or-not/0524_less_diverse_augmented_original_pkc_fda_approval-e5c327a2

## Resumen

El modelo `believe-it-or-not/0524_less_diverse_augmented_original_pkc_fda_approval-e5c327a2` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct distribuida por Together AI. El repositorio ocupa 1,7 GB y contiene exclusivamente los tensores del adaptador en formato safetensors, junto con la configuración de PEFT.

La nomenclatura del identificador sugiere un experimento de ajuste fino orientado a una tarea concreta: el sufijo `pkc_fda_approval` apunta a la aprobación de fármacos por parte de la FDA (Food and Drug Administration de Estados Unidos), y los prefijos `less_diverse_augmented_original` indican variantes de un conjunto de datos de entrenamiento (menos diverso, aumentado, original). Se trata, por tanto, de un artefacto de investigación asociado a un estudio sobre datos de entrenamiento y comportamiento de modelos, no de un modelo listo para producción.

La relevancia de esta ficha es limitada desde el punto de vista práctico: no hay model card sustantiva, no se declaran licencia, idiomas ni pipeline, y las descargas y likes son cero. Su interés es principalmente documental, como ejemplo de adaptadores LoRA de investigación publicados sobre Llama 3.3 70B y de las convenciones de nombres usadas en experimentos de ablación de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct Reference) |
| Parametros totales | No disponible para el adaptador; el modelo base Llama 3.3 70B tiene 70 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors o cuantizado |
| Version de PEFT | 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos de atención y proyecciones del modelo base Llama 3.3 70B Instruct Reference. Llama 3.3 es un transformer decoder-only con 70 000 millones de parámetros, atención por grupos (GQA) y un contexto nativo de 128 000 tokens; la variante "Reference" de Together AI es una réplica de los pesos publicados por Meta para uso con su infraestructura. El adaptador en sí no añade arquitectura nueva: se limita a matrices de bajo rango que se suman a las proyecciones existentes durante la inferencia.

No hay información sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni si se usó RLHF, DPO o ajuste supervisado. El nombre del repositorio sugiere un experimento de ablación sobre diversidad y aumento de datos aplicado a una tarea de clasificación o generación relacionada con aprobaciones de la FDA, pero la model card no aporta detalles. Tampoco se documentan hiperparámetros, régimen de precisión (fp16, bf16, fp8) ni infraestructura de cómputo. La única referencia técnica explícita es la versión de PEFT utilizada (0.15.1) y la cita genérica al calculador de impacto de Lacoste et al. (2019), habitual en plantillas de model cards.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Llama 3.3 70B Instruct, en la medida en que el adaptador no los degrade.
- Ajuste específico (presuntamente) para tareas relacionadas con aprobaciones de la FDA, aunque la naturaleza exacta de la tarea no está documentada.
- Soporte de tool calling y function calling heredado del modelo base Instruct.
- Capacidad de razonamiento multi-paso y uso como agente, siempre que el adaptador no interfiera con el formato de herramientas del modelo base.
- Capacidades multilingües heredadas del modelo base (Llama 3.3 soporta oficialmente ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el adaptador no declara idiomas propios.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre ablación de datos: el adaptador sirve para reproducir o comparar experimentos sobre cómo la diversidad y el aumento de datos afectan al ajuste fino de Llama 3.3 70B en una tarea concreta.
- Clasificación o extracción de información regulatoria: si el ajuste se orientó a aprobaciones de la FDA, podría emplearse para tareas de etiquetado o resumen de documentación regulatoria, siempre con validación humana.
- Estudio de adaptadores LoRA sobre modelos de 70B: útil como ejemplo práctico de carga de adaptadores PEFT con `PeftModel.from_pretrained` sobre un modelo base de gran tamaño.
- Evaluación de olvido catastrófico: permite medir cuánto degrada un ajuste fino específico las capacidades generales del modelo base en benchmarks estándar.
- Reproducibilidad de experimentos: al publicar el adaptador (1,7 GB) en lugar del modelo completo, facilita la verificación por terceros con un coste de almacenamiento reducido.
- Docencia y formación: ejemplo de artefacto PEFT con model card incompleta, útil para enseñar buenas prácticas de documentación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB en disco y requiere poca VRAM adicional, pero necesita cargar el modelo base Llama 3.3 70B, que en bf16 requiere aproximadamente 140 GB de VRAM.
- Con cuantización de 4 bits (por ejemplo, GPTQ, AWQ o bitsandbytes NF4), el modelo base puede reducirse a unos 35-40 GB de VRAM, lo que exige GPUs de 48 GB o superiores (A6000, L40S, A100 80GB).
- En 8 bits, la huella ronda los 70-75 GB, viable en una A100 80GB o H100 80GB.
- No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin cuantización agresiva y descarga parcial a CPU, lo que degradaría seriamente el throughput.
- Opciones de despliegue: vLLM y TGI no soportan adaptadores LoRA de forma universal en todas las versiones, pero vLLM permite cargar adaptadores LoRA dinámicos; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles para este adaptador concreto; dependen enteramente del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| believe-it-or-not/0524_less_diverse_augmented_original_pkc_fda_approval-e5c327a2 | Adaptador sobre 70B | No disponible (base: 128k) | No disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | Hugging Face, ampliamente usado |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (con matices) | safetensors, GGUF | Hugging Face, muy usado |
| Mistral-Large-Instruct-2411 | 123B | 128k | Mistral Research License / comercial | safetensors | Hugging Face y API |

La comparación relevante es con el propio modelo base y con alternativas de tamaño similar. El adaptador no aporta datos de rendimiento que permitan situarlo frente a estos modelos; su única diferencia es el ajuste específico, cuya eficacia no está documentada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre autoría real, financiación, tipo de modelo, licencia ni fuentes.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones adicionales.
- Riesgo elevado de alucinación en dominios regulatorios (FDA): cualquier salida sobre aprobaciones de fármacos debe verificarse contra fuentes oficiales.
- El adaptador puede degradar capacidades generales del modelo base (olvido catastrófico) al haberse entrenado en un dominio estrecho.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El identificador sugiere un experimento de investigación, no un modelo destinado a producción.
- La fecha de creación (2026-11-22) es futura respecto a la mayoría de referencias conocidas, lo que puede indicar un artefacto generado automáticamente o un error de metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/0524_less_diverse_augmented_original_pkc_fda_approval-e5c327a2
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculador de impacto ML: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
