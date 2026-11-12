# posterior-learning/grpo-qwen3.5-4b

## Resumen

grpo-qwen3.5-4b es un modelo multimodal de tipo image-text-to-text publicado por el usuario posterior-learning en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B mediante un adaptador LoRA que ha sido fusionado (merged) en los pesos del modelo base, dando como resultado un checkpoint único listo para usar con transformers. El ajuste se realizó con GRPO (Group Relative Policy Optimization) mediante el framework verl, un algoritmo de aprendizaje por refuerzo habitualmente empleado para mejorar el razonamiento y el comportamiento en tareas verificables.

El modelo conserva la arquitectura y el tamaño del base: 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) en pesos bf16, con un repositorio de 9,3 GB. La fusión afecta a 200 módulos LoRA (r=16, alpha=32, escala 2,0), mientras que el resto de tensores son idénticos byte a byte al modelo original. Los ficheros de configuración, tokenizador, plantilla de chat y procesador son los del base, sin modificar.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de RL sobre un modelo multimodal pequeño, y como checkpoint directamente desplegable sin necesidad de cargar el adaptador por separado. No obstante, la información pública es muy escasa (sin licencia declarada, sin idiomas, sin benchmarks y con cero descargas en el momento de la consulta), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser un checkpoint bf16 es cuantizable a GGUF/AWQ por herramientas externas, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). Sobre ese base se entrenó un adaptador LoRA con r=16 y lora_alpha=32 mediante GRPO usando verl, en una ejecución denominada grpo_qwen35_4b_transfer que alcanzó el paso global 50 de 50. GRPO es una variante de aprendizaje por refuerzo sin crítico que estima la ventaja relativa dentro de grupos de muestras, típicamente aplicada a tareas con recompensa verificable (matemáticas, código, instrucciones con formato estricto).

La innovación técnica aquí no está en la arquitectura sino en el proceso de fusión: los 200 módulos LoRA se combinaron con la regla W ← W + (lora_alpha / r) · B @ A (escala 2,0), calculada en fp32 y almacenada en bf16. El autor documenta verificaciones en MERGE-REPORT.json: 3 módulos aleatorios dentro del redondeo bf16 de la operación, 538 tensores adicionales idénticos byte a byte y un total de bytes de tensores igual al base (9.319.737.856). No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de DPO o RLHF más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3.5-4B.
- Procesamiento conjunto de imagen y texto (image-text-to-text), con procesador y plantilla de chat del base.
- Razonamiento y resolución de tareas potencialmente mejoradas por el ajuste con GRPO, aunque no se publican evaluaciones que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de pipelines de RL: el checkpoint sirve para reproducir y comparar el efecto de un ajuste GRPO sobre un base multimodal de 4,6 B, cargándolo directamente con transformers sin gestionar el adaptador.
- Investigación en fusión de LoRA: al incluir informe de verificación de la fusión, es útil como referencia para validar metodologías de merge en fp32 con almacenamiento bf16.
- Evaluación comparativa base vs. ajustado: permite medir en un mismo entorno si el paso de GRPO altera el comportamiento en tareas de razonamiento o formato, usando el base Qwen3.5-4B como control.
- Experimentos académicos de bajo presupuesto: con 4,66 B de parámetros en bf16, el modelo puede ejecutarse en una sola GPU de gama alta para pruebas de laboratorio.
- Docencia y demostraciones de RL aplicado a LLM: el par (adaptador, checkpoint fusionado) ilustra el ciclo completo de entrenamiento, fusión y despliegue.
- Generación multimodal en entornos controlados: para tareas internas de descripción de imágenes o preguntas sobre documentos visuales, siempre que se valide antes la calidad y la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos, más overhead de activaciones, caché KV y el codificador visual; en la práctica se recomienda un mínimo de 16-24 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 4,7 GB de pesos; a 4 bits, en torno a 2,4 GB, aunque no se documentan recetas oficiales de cuantización para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para producción; RTX 4090 (24 GB) y RTX A6000 (48 GB) para desarrollo.
- GPU de consumo: cabe en RTX 4090 en bf16 con contexto limitado y en GPUs de 16 GB si se cuantiza; en 8 GB solo con cuantizaciones agresivas no verificadas.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint concreto y requerirían validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| grpo-qwen3.5-4b | 4,66 B | no disponible | imagen + texto | no disponible | Ajuste GRPO con LoRA fusionado; sin benchmarks |
| Qwen/Qwen3.5-4B | 4,66 B (aprox.) | no disponible | imagen + texto | la del modelo base (consultar en su repositorio) | Modelo de referencia sin ajuste; control natural para comparar |
| Alternativas de ~4 B multimodales | no disponible | no disponible | imagen + texto | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste GRPO mejore al base; podría incluso degradar algunas capacidades.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que remitirse a la licencia de Qwen/Qwen3.5-4B, que tampoco se detalla aquí.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el ajuste.
- Riesgo de alucinación inherente a los LLM, sin mitigaciones documentadas ni evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- La fusión en bf16 puede producir diferencias numéricas menores frente a base + adaptador en tiempo de ejecución, según advierte el propio autor.
- Repositorio sin tracción (0 descargas, 0 likes) y publicado en 2026-11-12: no hay comunidad que haya validado el modelo.
- El entrenamiento se detuvo en el paso 50 de 50 con un único run; no se especifican hiperparámetros de recompensa ni datos, lo que dificulta la reproducibilidad.
- Para producción, conviene tratar este checkpoint como experimental y validarlo contra el base en el dominio concreto de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/grpo-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework verl (usado para el entrenamiento GRPO): no se proporciona enlace en la información disponible
- Paper de GRPO: no se proporciona enlace en la información disponible
- Informe de fusión (MERGE-REPORT.json): referenciado en la model card, sin URL directa disponible
