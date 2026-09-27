# nabin2004/qwen-Manimator-1-grpo-clean

## Resumen

qwen-Manimator-1-grpo-clean es un adaptador LoRA (PEFT) sobre el modelo denso Qwen/Qwen3-8B, publicado por el usuario nabin2004 y especializado en la generación automática de código para animaciones pedagógicas con ManimCE y Manim Voiceover. El adaptador se entrenó con GRPO (Group Relative Policy Optimization), el algoritmo de aprendizaje por refuerzo descrito en el paper de DeepSeekMath y ampliamente reutilizado para tareas con recompensa verificable. Su dominio no es generalista: está orientado a producir escenas de Manim listas para renderizar, incluyendo narración sincronizada mediante la extensión Voiceover.

Esta versión se presenta como la liberación "limpia" y lista para despliegue del adaptador nabin2004/qwen-Manimator-1-grpo: se han eliminado los checkpoints intermedios y las cachés de estado de entrenamiento, reduciendo el repositorio de 3,22 GB a aproximadamente 95 MB. Mantiene la configuración de LoRA con rango 16, alpha 32 y escalado 2,00, y hereda del modelo base Qwen3-8B una ventana de contexto nativa de 32.768 tokens, ampliable a 131k mediante YaRN.

La relevancia de esta ficha es acotada pero clara: es un ejemplo de especialización por RL sobre un modelo de 8B para un dominio de generación de código muy concreto (visualización matemática), con licencia Apache-2.0 y un coste de despliegue bajo gracias a su formato de adaptador. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks, por lo que se trata de una publicación sin validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen/Qwen3-8B; no es MoE |
| Parametros totales | Aproximadamente 8B en el modelo base; número exacto de parámetros del adaptador: no disponible |
| Parametros activos | no aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; ampliable a 131k con YaRN |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (se cargará con la precisión del base, p. ej. bf16). El autor publica además una variante GGUF Q4_K_M en nabin2004/qwen-Manimator-1-gguf. Otras cuantizaciones: no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); librería declarada: peft |
| Configuracion LoRA | Rango (r) = 16, alpha = 32, escalado = 2,00 |
| Algoritmo de entrenamiento | GRPO (Group Relative Policy Optimization) |
| Dominio | Síntesis de animaciones pedagógicas con ManimCE y Manim Voiceover |
| Tamano del repositorio | Aproximadamente 0,1 GB (~95 MB) |
| Modelo base | Qwen/Qwen3-8B |
| Etiquetas del autor | peft, lora, grpo, manim, manimce, manim-voiceover, aos, code-generation, mathematical-animation, text-generation, conversational |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo completo. Se aplica sobre Qwen3-8B, un transformer decoder-only denso de la familia Qwen3, y se carga con `PeftModel.from_pretrained` sobre los pesos base en bf16. El autor indica que la versión "clean" es idéntica en comportamiento a nabin2004/qwen-Manimator-1-grpo, pero sin los checkpoints intermedios ni el estado del optimizador. La configuración LoRA es r=16, alpha=32 y escalado 2,00, lo que implica un delta de bajo rango con un factor de escala relativamente agresivo respecto al rango elegido.

El entrenamiento se realizó con GRPO, un método de optimización de política con estimación de ventaja relativa dentro de grupos de muestras, introducido en el paper DeepSeekMath y habitual en tareas donde existe una recompensa verificable (por ejemplo, ejecución correcta del código generado). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo una fase previa de SFT, DPO o RLHF; el autor mantiene un repositorio separado de datos (nabin2004/qwen-Manimator-1-sft-data) y una variante SFT (nabin2004/qwen-Manimator-1-sft), lo que sugiere una cadena SFT seguida de GRPO, aunque esto no se confirma en la documentación consultada. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras).

## Capacidades

- Generación de código Python para ManimCE: creación de escenas, objetos `Mobject`, animaciones (`Create`, `Transform`, `Write`) y estructura de `Scene`/`construct`.
- Generación de escenas con Manim Voiceover: integración de la extensión `manim-voiceover` para producir animaciones narradas, presumiblemente con `VoiceoverScene` y bloques de habla sincronizados con las animaciones (así aparece en el ejemplo de la model card, que pide una `VoiceoverScene` sobre el problema de los tres cuerpos).
- Generación de texto conversacional: el pipeline declarado es `text-generation` y el ejemplo de uso aplica la plantilla de chat de Qwen, por lo que soporta diálogo multi-turno con el formato de mensajes del modelo base.
- Generación de animaciones matemáticas: la etiqueta `mathematical-animation` indica foco en visualizaciones de conceptos matemáticos y físicos.
- Capacidades heredadas del modelo base Qwen3-8B: razonamiento general, matemáticas, código y comprensión multilingüe, aunque no hay evidencia publicada de que el ajuste las preserve intactas.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: el adaptador declara únicamente `en`; no se declara soporte de castellano.
- Modo de razonamiento explícito (thinking): no documentado en la información disponible.
- La etiqueta `aos` figura entre las del autor sin descripción asociada en la información disponible.

## Casos de uso

- Generación automatizada de vídeo educativo de matemáticas: el modelo produce el script de ManimCE de una escena, que después se renderiza con `manim` en un pipeline por lotes. Es adecuado porque el ajuste se hizo específicamente sobre APIs de Manim, no sobre Python genérico.
- Producción de material narrado para e-learning: usando Manim Voiceover, el modelo puede generar una escena con locución sincronizada, lo que reduce el trabajo manual de montaje para cursos en vídeo.
- Asistente interno para docentes: un profesor describe un concepto (por ejemplo, derivadas o el problema de los tres cuerpos) y obtiene un borrador de animación que luego revisa y edita, en lugar de escribir la escena desde cero.
- Prototipado rápido de visualizaciones para artículos o charlas: generar un primer borrador de animación de un resultado matemático para iterar sobre él antes de invertir en producción manual.
- Enriquecimiento de plataformas de contenido didáctico: generación masiva de animaciones cortas a partir de un temario estructurado, con revisión humana posterior y renderizado en servidores con CPU.
- Investigación sobre RL con recompensa verificable: el adaptador sirve como caso de estudio de GRPO aplicado a LoRA en un dominio donde la recompensa puede calcularse ejecutando el código generado (render correcto o error de ejecución).
- Generación de código asistida en editores: integrado como modelo de autocompletado o chat especializado para ficheros `.py` que importan `manim`, aprovechando que el repositorio incluye una variante GGUF para ejecución local.
- Base para nuevos ajustes de dominio: al ser un adaptador LoRA de ~95 MB, es barato de combinar o de continuar entrenando para variantes (por ejemplo, Manim con otros idiomas de narración), aunque esto no está documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen métricas cuantitativas (ni MMLU, ni HumanEval, ni evaluaciones específicas de renderizado correcto de Manim), ni comparaciones numéricas con el modelo base o con las otras variantes del mismo autor.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 95 MB en disco; para inferir hay que cargar además los pesos completos de Qwen/Qwen3-8B.
- VRAM estimada para inferencia con los pesos base en bf16: del orden de 16 a 18 GB, más la caché KV (que crece con los 32.768 tokens de contexto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 9 a 10 GB; en 4 bits (por ejemplo, la variante GGUF Q4_K_M del autor): aproximadamente 5 a 6 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 de 24 GB. Para 4 bits es viable en GPU de consumo con 8-12 GB de VRAM, como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas; en bf16 requiere una GPU de 24 GB o superior para contexto largo.
- Opciones de despliegue documentadas: vLLM con soporte LoRA (el autor indica la plantilla de RunPod Serverless con `ENABLE_LORA=1` y `LORA_MODULES`), Transformers + PEFT, y Ollama mediante el GGUF del mismo autor. TGI y otras plataformas: no documentado.
- Latencia y throughput estimados: no disponible. Dependerán del hardware, de la cuantización y de la longitud de generación (el ejemplo de la model card usa `max_new_tokens=2048` y `temperature=0.3`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Algoritmo | Tamano del repo | Licencia |
|---|---|---|---|---|---|---|
| qwen-Manimator-1-grpo-clean (este) | Adaptador LoRA | ~8B base + delta r=16 | 32.768 (131k con YaRN) | GRPO | ~0,1 GB (~95 MB) | apache-2.0 |
| nabin2004/qwen-Manimator-1-grpo | Adaptador LoRA + checkpoints | ~8B base | 32.768 (131k con YaRN) | GRPO | 3,22 GB | no disponible |
| nabin2004/qwen-Manimator-1-sft | Modelo ajustado (SFT) | ~8B | no disponible | SFT | no disponible | no disponible |
| nabin2004/qwen-Manimator-1-merged | Pesos fusionados completos | ~8B | no disponible | no disponible (deriva del ajuste anterior) | no disponible | no disponible |
| nabin2004/qwen-Manimator-1-gguf | GGUF Q4_K_M | ~8B | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3-8B (base) | Transformer denso | ~8B | 32.768 (131k con YaRN) | Pretraining + post-entrenamiento | no disponible en la información proporcionada | apache-2.0 |

No se dispone de benchmarks que permitan comparar el rendimiento de estas variantes entre sí ni frente al modelo base; la comparación anterior es estructural (formato, tamaño y licencia), no de calidad.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluación publicada. No hay evidencia independiente de que las animaciones generadas rendericen correctamente.
- Riesgo alto de alucinación de API: aunque el ajuste se centra en Manim, un modelo de 8B puede inventar clases, parámetros o imports inexistentes (`manim`, `manimce`, `manim-voiceover` evolucionan y cambian de firma entre versiones). Todo código generado debería ejecutarse y validarse con `manim` antes de usarse.
- Sin verificación integrada: la recompensa de GRPO podría haberse basado en ejecución correcta o en otro criterio; no se documenta, por lo que no se puede asumir que el modelo produzca código ejecutable de forma fiable.
- Idioma: solo se declara `en`. Los prompts en castellano no están cubiertos y pueden degradar la calidad de forma notable, especialmente en la narración de Voiceover.
- Posible olvido catastrófico: al ser un ajuste LoRA con GRPO sobre un modelo de 8B, es esperable cierta pérdida de capacidades generales del base (razonamiento general, otros lenguajes de programación). No hay datos que lo cuantifiquen.
- Restricciones de licencia: el adaptador es Apache-2.0 y el modelo base Qwen3-8B también se distribuye bajo Apache-2.0, por lo que el uso comercial no está restringido por licencia. Se recomienda aun así verificar los términos vigentes de Qwen3-8B y de las dependencias generadas (ManimCE y manim-voiceover tienen sus propias licencias, que afectan al código de salida, no al modelo).
- Coherencia de versiones: la salida del modelo depende de la versión de ManimCE asumida en el entrenamiento; no se documenta cuál. Ejecutar el código con una versión distinta puede fallar.
- Datos de entrenamiento no públicos en su composición: existe un repositorio de datos (`qwen-Manimator-1-sft-data`) pero en la información disponible no se detalla su tamaño, procedencia ni posibles sesgos.
- Metadatos: el repositorio registra fecha de creación 2026-09-27 y tiene un tamaño de 0,1 GB, coherente con un adaptador limpio; no hay información sobre mantenimiento posterior ni issues abiertos.
- Rendimiento en producción: sin datos de latencia ni throughput, y con un modelo denso de 8B, el coste por generación de escenas largas (el ejemplo usa hasta 2048 tokens nuevos) puede ser elevado en comparación con adaptadores sobre modelos más pequeños.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/nabin2004/qwen-Manimator-1-grpo-clean
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Versión original con checkpoints de entrenamiento: https://huggingface.co/nabin2004/qwen-Manimator-1-grpo
- Variante GGUF (Q4_K_M) para Ollama: https://huggingface.co/nabin2004/qwen-Manimator-1-gguf
- Variante SFT: https://huggingface.co/nabin2004/qwen-Manimator-1-sft
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/nabin2004/qwen-Manimator-1-sft-data
- Versión fusionada con pesos completos: https://huggingface.co/nabin2004/qwen-Manimator-1-merged
- Paper de referencia de GRPO: DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models, citado en la model card de nabin2004/qwen-Manimator-1-grpo; sin URL incluida en los resultados de búsqueda disponibles
- Guía de despliegue en RunPod Serverless con vLLM: descrita en la model card del adaptador (variables `MODEL_NAME`, `ENABLE_LORA`, `LORA_MODULES`, `MAX_MODEL_LEN`), sin URL propia en la información disponible
