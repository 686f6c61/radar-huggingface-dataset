# g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnly-midHigh4-gv2sft

## Resumen

CutIA-Qwen-4B-InstructInit-TF-EduHighOnly-midHigh4-gv2sft es un checkpoint experimental de tipo causal language model, publicado por el usuario g4me en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnly, que a su vez parte de la familia Qwen 3, según la etiqueta `qwen3` declarada en el repositorio. El nombre del modelo sugiere un linaje de entrenamiento por fases —inicialización instruct, filtrado de datos educativos de alta calidad y un ajuste supervisado posterior—, aunque el autor no documenta ninguna de estas decisiones en la model card.

El modelo cuenta con 4.411.424.256 parámetros reales (aproximadamente 4,4 mil millones), almacenados en formato safetensors, lo que lo sitúa en la gama de modelos pequeños que caben holgadamente en una GPU de consumo. Su relevancia actual es limitada pero concreta: es un ejemplo de experimentación comunitaria sobre la base Qwen 3 orientada a dominios educativos, y puede resultar de interés para quienes investigan recetas de ajuste fino iterativo o quieren reproducir la técnica en otros dominios.

La información publicada es mínima. No se declaran licencia, idiomas, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación. El repositorio no registra descargas ni interacciones, y el propio autor lo describe explícitamente como un checkpoint experimental, por lo que no debería considerarse listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder, familia Qwen 3 (según etiqueta `qwen3` del repositorio); detalles de capas, cabezas y atención no disponibles |
| Parametros totales | 4.411.424.256 (≈4,4 B), dato real de los pesos safetensors |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos safetensors; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible. Sin licencia declarada, no se puede asumir uso comercial permitido |
| Formato de pesos | safetensors (tamaño del repositorio: 118,1 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal decoder de la familia Qwen 3, tal y como indica la etiqueta `qwen3` del repositorio y confirma el pipeline declarado (`causal-lm`). No se dispone de información sobre el número de capas, la configuración de atención (GQA, QK-Norm o similares), el tamaño de la ventana de contexto ni la presencia de mecanismos adicionales. El recuento de parámetros (4,4 B) y la ausencia de referencias a expertos apuntan a un modelo denso convencional, aunque esto es una inferencia a partir de los datos disponibles y no una confirmación del autor.

En cuanto al entrenamiento, la model card se limita a indicar que se trata de una versión entrenada del modelo base `g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnly`, con la etiqueta de relación `finetune`. La nomenclatura del identificador sugiere varias etapas: una inicialización instruct, un filtrado de datos educativos de alta calidad (`EduHighOnly`), un ajuste con un subconjunto intermedio-alto (`midHigh4`) y un ajuste supervisado de segunda generación (`gv2sft`). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas de inferencia. El tamaño del repositorio (118,1 GB frente a los aproximadamente 8,8 GB que ocuparían los pesos en bf16) indica que probablemente se han subido múltiples revisiones o checkpoints intermedios, lo que refuerza el carácter experimental del artefacto.

## Capacidades

- Generación de texto autoregresiva: es la función principal declarada por el pipeline `causal-lm`.
- Seguimiento de instrucciones: plausible por su linaje a partir de un modelo con inicialización instruct y un ajuste SFT posterior, pero no verificado ni documentado por el autor.
- Razonamiento y matemáticas: no disponible; no hay evaluaciones publicadas.
- Generación de código: no disponible; no hay evaluaciones publicadas ni declaración explícita.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento extendido ni formato de agentes.
- Capacidades multilingües: no disponible; no se declara ningún idioma, ni siquiera el inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se declara ninguna.
- Especialización temática: el sufijo `EduHighOnly` en el linaje sugiere un sesgo hacia contenido educativo, pero no hay documentación que lo confirme.

## Casos de uso

- Investigación sobre recetas de ajuste fino por fases: el modelo sirve como artefacto de estudio para analizar cómo afecta una secuencia de inicialización instruct, filtrado de datos y SFT a un modelo Qwen 3 de 4,4 B. Es adecuado porque el linaje completo está publicado como checkpoints separados en HuggingFace.
- Reproducción de experimentos en dominio educativo: partiendo del checkpoint base `EduHighOnly`, un equipo puede comparar el efecto del ajuste `midHigh4-gv2sft` frente al punto de partida, siempre que genere su propia evaluación, ya que no existe ninguna publicada.
- Evaluación comparativa de checkpoints comunitarios: dado que el modelo apenas tiene descargas, resulta útil como muestra en estudios sobre calidad y reproducibilidad de modelos pequeños publicados por la comunidad, midiendo con arneses propios (MMLU, GSM8K, tareas en castellano).
- Prototipado local sin conexión: con 4,4 B de parámetros, el modelo puede ejecutarse en una GPU de consumo de 12-16 GB en precisión reducida, lo que permite validar ideas de producto en un portátil o una estación de trabajo antes de escalar a un modelo mayor.
- Generación de texto asistida en entornos de investigación: borradores, resúmenes o reformulaciones dentro de un pipeline controlado, con revisión humana obligatoria, dado que no hay datos de fiabilidad ni de tasas de alucinación.
- Punto de partida para ajuste específico de dominio: al ser un modelo pequeño y con pesos safetensors estándar, es un candidato razonable para LoRA o QLoRA sobre datos propios (legal, sanitario, educativo) si se resuelve antes la cuestión de la licencia.
- Docencia y formación técnica: puede emplearse en cursos o talleres para ilustrar el ciclo completo de publicación de un modelo en HuggingFace, desde el ajuste hasta la subida de pesos y la model card.
- Banco de pruebas de infraestructura de despliegue: sirve para validar configuraciones de vLLM, TGI o conversiones a GGUF en un tamaño de modelo manejable antes de trasladar la configuración a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni ninguna otra), y no se ha localizado documentación adicional asociada al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 17,6 GB en FP32, 8,8 GB en BF16/FP16, 4,4 GB en INT8 y 2,2-2,5 GB en cuantización de 4 bits. Son estimaciones calculadas a partir del recuento real de parámetros, no datos publicados por el autor.
- Caché KV: no calculable con la información disponible, ya que se desconocen el número de capas, el número de cabezas KV y la longitud de contexto. En contextos largos puede añadir varios GB adicionales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) ejecuta el modelo en BF16 con margen suficiente; una RTX 4080 o 4070 Ti Super (16 GB) lo ejecuta en BF16 con contexto moderado o en INT8 con contexto amplio; GPUs de 8-12 GB (RTX 3060, 4060, 4070) requieren cuantización de 4 u 8 bits.
- A100, H100 y L40S: sobredimensionadas para un solo modelo de 4,4 B, pero utilizables para servir muchas réplicas concurrentes.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas, siempre que se aplique cuantización en los modelos de 8-12 GB de VRAM.
- Opciones de despliegue: el autor documenta `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`. Es previsible el soporte en vLLM y TGI al ser pesos safetensors de un transformer causal estándar, aunque no está verificado. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que el repositorio no incluye versiones GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerían del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de este modelo (contexto, licencia, rendimiento) en la información proporcionada, por lo que la comparación se limita a los parámetros y a la disponibilidad. Los datos de los modelos alternativos proceden de sus fichas públicas conocidas y no han sido verificados en esta búsqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CutIA-Qwen-4B-...-gv2sft | 4,41 B | No disponible | No disponible | Pesos safetensors; 0 descargas |
| Qwen3-4B | 4,0 B aprox. | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Ampliamente desplegado, con versiones GGUF y cuantizadas |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Ampliamente desplegado, con versiones GGUF y cuantizadas |
| Gemma 3 4B | 4 B aprox. | 128.000 tokens | Términos de uso de Gemma | Ampliamente desplegado, con versiones GGUF y cuantizadas |

La diferencia fundamental no es de tamaño, sino de madurez: los tres modelos de referencia cuentan con licencia explícita, contexto declarado, evaluaciones publicadas y ecosistema de cuantizaciones, mientras que este checkpoint no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, no puede asumirse permiso de uso comercial, modificación ni redistribución. Es un bloqueante para cualquier uso profesional.
- Ausencia total de evaluación: no existen benchmarks, ni pruebas de seguridad, ni análisis de sesgos. Cualquier afirmación sobre su calidad sería especulativa.
- Riesgo de alucinación: inherente a cualquier modelo causal de este tamaño y agravado por la falta de datos de alineación documentados.
- Idiomas desconocidos: no se declara ningún idioma soportado. El rendimiento en castellano es, por tanto, completamente incierto y requeriría una evaluación específica.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede dimensionar el uso en conversaciones largas ni en tareas de recuperación aumentada.
- Sesgos potenciales: el filtrado `EduHighOnly` puede introducir un sesgo temático hacia registros académicos y reducir el rendimiento en dominios conversacionales, coloquiales o técnicos no educativos.
- Carácter experimental explícito: el propio autor etiqueta el checkpoint como experimental, lo que implica reproducibilidad no garantizada y ausencia de soporte.
- Repositorio muy pesado (118,1 GB) frente a los 8,8 GB de los pesos en bf16: la descarga completa puede ser innecesaria y conviene revisar las revisiones disponibles antes de clonar.
- Sin adopción: cero descargas y cero interacciones dificultan contrastar experiencias o encontrar reportes de errores.
- Recomendación para producción: no desplegar sin una evaluación propia de calidad, seguridad y sesgos, y sin resolver previamente la situación licencial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnly-midHigh4-gv2sft
- Modelo base: https://huggingface.co/g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnly
- Perfil del autor: https://huggingface.co/g4me
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
