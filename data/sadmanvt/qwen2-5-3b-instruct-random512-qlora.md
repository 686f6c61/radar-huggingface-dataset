# sadmanvt/Qwen2.5-3B-Instruct-Random512-QLoRA

## Resumen

El modelo `sadmanvt/Qwen2.5-3B-Instruct-Random512-QLoRA` es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario sadmanvt sobre el modelo base Qwen2.5-3B-Instruct de Alibaba. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador PEFT que debe cargarse junto al modelo base para poder utilizarse. El entrenamiento se realizó con el framework LLaMA-Factory sobre un dataset denominado `acereason_random_pc_512`, presumiblemente orientado a tareas de razonamiento, aunque la model card no aporta detalles sobre su composición.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, con soporte de contexto largo, tool calling y capacidades multilingües. Este adaptador hereda todas esas capacidades del modelo base y añade un ajuste fino específico cuyo alcance exacto no está documentado por el autor.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con escasa documentación, 15 descargas y sin resultados de evaluación publicados. Es útil como referencia para quienes quieran reproducir el pipeline de QLoRA con LLaMA-Factory sobre Qwen2.5-3B, pero no constituye una opción recomendable para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (el adaptador ocupa 0,6 GB; el modelo base tiene 3.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens (ampliable a 131.072 con YaRN, según la documentación de Qwen) |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó con QLoRA, lo que implica cuantización de 4 bits durante el entrenamiento, pero no se especifican los formatos de inferencia) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 soporta principalmente chino e inglés, con cobertura parcial de otros idiomas |
| Licencia | other (heredada del modelo base Qwen2.5, que usa la licencia Qwen Research/Community; consultar los términos de Qwen) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y capas de normalización RMSNorm. El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens según su documentación oficial, seguido de ajuste supervisado y optimización por preferencias (DPO). Este adaptador concreto no modifica la arquitectura, sino que añade matrices de bajo rango en las capas del transformer mediante LoRA.

El entrenamiento se realizó con LLaMA-Factory y QLoRA (cuantización del modelo base a 4 bits durante el ajuste). Los hiperparámetros documentados son: learning rate 5e-05, batch size efectivo de 8 (batch 1 con 8 pasos de acumulación de gradiente), optimizador AdamW con betas (0,9; 0,999), scheduler coseno, 3 épocas, precisión mixta nativa (AMP) y semilla 42. El dataset se denomina `acereason_random_pc_512` y no se especifica su tamaño, composición ni procedencia. No se documenta el rango del adaptador (r), el alpha, el dropout ni qué módulos se adaptaron, datos que LLaMA-Factory suele registrar en el `adapter_config.json` pero que no aparecen en la model card.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen2.5-3B-Instruct, incluyendo razonamiento matemático y de sentido común.
- Generación de código: el modelo base Qwen2.5-3B-Instruct tiene capacidad de programación en múltiples lenguajes, aunque limitada por su tamaño.
- Tool calling / function calling: soportado por el modelo base Qwen2.5; el adaptador no documenta si preserva o modifica esta capacidad.
- Razonamiento multi-paso y uso como agente: el modelo base soporta plantillas de agente; no hay evidencia de que el ajuste fino haya sido específicamente orientado a agentes.
- Capacidades multilingües: limitadas a las del modelo base (chino e inglés principalmente).
- Capacidades especiales: no se documenta ningún modo de pensamiento explícito, visión ni audio. El ajuste se orienta presumiblemente a razonamiento (por el nombre del dataset), pero sin datos verificables.

## Casos de uso

- Experimentación académica con QLoRA: el adaptador sirve como ejemplo reproducible de ajuste fino con LLaMA-Factory sobre Qwen2.5-3B, útil para investigadores que quieran replicar el pipeline con sus propios datos.
- Evaluación comparativa de adaptadores: puede emplearse como punto de partida para medir el impacto de un ajuste fino ligero sobre el modelo base en tareas de razonamiento, siempre que se disponga de un conjunto de evaluación propio.
- Prototipado de asistentes conversacionales: al heredar la plantilla de chat de Qwen2.5, puede usarse en demos locales de conversación multi-turno con contexto moderado, aunque sin garantías de calidad específica.
- Generación de código en entornos controlados: el modelo base permite autocompletado y explicación de código; el adaptador podría usarse en pruebas internas, pero requiere validación antes de cualquier uso en producción.
- Fine-tuning incremental: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con nuevos datos, lo que lo hace útil como base para experimentos de ajuste continuo.
- Docencia y formación: útil como caso práctico para explicar las diferencias entre un modelo completo y un adaptador LoRA, así como el flujo de trabajo con PEFT y LLaMA-Factory.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `pc_random_qlora_512_3ep` pero sin resultados asociados (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4) puede reducirse a 2-3 GB. El adaptador añade un consumo mínimo (0,6 GB en disco, menos en memoria).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput. Cabe en GPUs de consumo con al menos 8 GB de VRAM en FP16 y en GPUs de 4-6 GB con cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más (RTX 3060, 4060, 4070, 4090) usando el modelo base en FP16 o cuantizado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere fusionar el adaptador con el modelo base y convertir a GGUF), Ollama (mediante fusión previa), Transformers + PEFT para carga directa del adaptador.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del backend; en una RTX 4090 con vLLM se pueden esperar decenas de tokens por segundo para un modelo de 3B, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sadmanvt/Qwen2.5-3B-Instruct-Random512-QLoRA | 3B (base) + adaptador LoRA | No documentado (base: 32K) | other | HuggingFace, 15 descargas | Adaptador experimental sin evaluación publicada |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens (ampliable a 131.072) | Qwen Research/Community | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy popular | Alternativa de tamaño similar con contexto mayor |
| google/gemma-2-2b-it | 2B | 8.192 tokens | Gemma Terms of Use | HuggingFace, popular | Modelo más pequeño, contexto más corto |

## Limitaciones y advertencias

- Documentación insuficiente: la model card es autogenerada y no describe el dataset, el propósito del ajuste ni los resultados. No se puede evaluar su calidad sin pruebas propias.
- Riesgo de alucinación: inherente al modelo base Qwen2.5-3B, agravado por la falta de evaluación del adaptador.
- Sesgos: no documentados; el modelo base Qwen2.5 presenta sesgos conocidos en datos de entrenamiento mayoritariamente chino-inglés.
- Limitaciones de idioma: el modelo base está optimizado para chino e inglés; el rendimiento en castellano puede ser inferior y no hay evaluación específica.
- Restricciones de licencia: la licencia "other" remite a los términos del modelo base Qwen2.5; es necesario revisar la licencia Qwen para uso comercial, que puede requerir atribución o tener restricciones.
- Caveat para producción: no se recomienda su uso en producción sin una evaluación exhaustiva en el dominio objetivo, dado que no hay benchmarks, ni documentación del dataset, ni garantías de que el ajuste no haya degradado capacidades del modelo base.
- Reproducibilidad: se desconocen el rango del adaptador, los módulos adaptados y el contenido exacto del dataset, lo que dificulta reproducir el entrenamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/sadmanvt/Qwen2.5-3B-Instruct-Random512-QLoRA
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Documentación de PEFT: https://huggingface.co/docs/peft
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
