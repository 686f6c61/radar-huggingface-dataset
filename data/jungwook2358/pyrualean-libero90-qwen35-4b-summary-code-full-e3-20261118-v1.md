# jungwook2358/pyrualean-libero90-qwen35-4b-summary-code-full-e3-20261118-v1

## Resumen

pyrualean-libero90-qwen35-4b-summary-code-full-e3-20261118-v1 es un artefacto de inferencia publicado por el usuario jungwook2358 en Hugging Face, derivado de un ajuste fino supervisado (SFT) completo sobre el modelo base Qwen/Qwen3.5-4B. El nombre del repositorio indica que el entrenamiento se realizó sobre un conjunto de 90 rollouts (denominado LIBERO90) con 421 ejemplos, orientado a generar resúmenes de decisión públicos breves junto con código, y ejecutado durante tres épocas hasta el paso nativo final 42. No se trata de un modelo de propósito general nuevo, sino de un checkpoint de inferencia exportado tras completar un ciclo de entrenamiento concreto.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original, con 4.539.265.536 parámetros totales según los pesos en safetensors y un repositorio de 9,1 GB. La model card es extremadamente escueta y no documenta licencia, idiomas, contexto ni resultados de evaluación, por lo que buena parte de las especificaciones habituales quedan como no disponibles. La relevancia actual es limitada y muy específica: sirve como evidencia reproducible de un pipeline de SFT sobre Qwen3.5-4B, con pruebas de procedencia (training-completion-proof.json e inference-export-manifest.json) y hashes SHA256, más que como modelo listo para producción general.

El artefacto está pensado para quien necesite inspeccionar o reproducir un ajuste fino concreto sobre Qwen3.5-4B, no para uso comercial ni para despliegues generalistas. Su valor técnico reside en la trazabilidad del entrenamiento (checkpoints de optimizador, scheduler y RNG preservados en el servidor de origen) y en el formato de entrenamiento con enable_thinking=True, que sugiere la presencia de un modo de razonamiento heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y se somete a un ajuste fino supervisado de tipo "full" (todos los parámetros, no LoRA ni adaptadores), con un total de tres épocas y un paso nativo final de 42. El conjunto de entrenamiento consta de 90 rollouts y 421 ejemplos, etiquetados como "New Sol High brief public decision summary + Code", lo que apunta a una tarea muy acotada de generación de resúmenes breves de decisión acompañados de código. El formateador de entrenamiento usa `enable_thinking=True`, lo que indica que se activó el modo de razonamiento del modelo base durante el SFT; la evaluación nativa formal (native200) conserva su configuración de thinking por defecto.

No se documentan en la información disponible la composición del dataset más allá del recuento, el número de tokens de entrenamiento, ni si hubo RLHF, DPO o alguna innovación arquitectónica adicional. La model card menciona que los checkpoints completos de optimizador, scheduler y RNG se conservan en el servidor de origen, y que la procedencia se verifica mediante `training-completion-proof.json` e `inference-export-manifest.json` con SHA256. No se especifica la arquitectura interna más allá de la etiqueta `qwen3_5`, por lo que no es posible confirmar si emplea atención lineal, decodificación especulativa u otras técnicas del modelo base.

## Capacidades

- Generación de texto y resúmenes breves de decisión, según la etiqueta de entrenamiento ("brief public decision summary").
- Generación de código, al incluir "Code" en las etiquetas del SFT.
- Modo de razonamiento (thinking) heredado de Qwen3.5, activado durante el entrenamiento mediante `enable_thinking=True`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades de visión o audio: no disponible; no se mencionan.

## Casos de uso

- Reproducción de experimentos de SFT: el artefacto permite verificar el resultado de un ajuste fino completo sobre Qwen3.5-4B con 421 ejemplos y tres épocas, útil para investigadores que quieran replicar el pipeline con los checkpoints de optimizador y scheduler conservados en el servidor de origen.
- Auditoría de procedencia de modelos: los ficheros `training-completion-proof.json` e `inference-export-manifest.json` con SHA256 permiten trazar el origen de los pesos y compararlos con el modelo base en el commit indicado.
- Generación de resúmenes de decisión acotados: dado el etiquetado del dataset, el modelo puede emplearse para producir resúmenes breves de decisiones públicas en dominios similares a los del entrenamiento, siempre con validación humana.
- Asistencia a la generación de código en tareas específicas: al haberse entrenado con etiqueta "Code", puede servir como punto de partida para tareas de código acotadas, aunque sin garantías de calidad general.
- Estudio del efecto del modo thinking en SFT: al haberse entrenado con `enable_thinking=True`, es útil para analizar cómo afecta el razonamiento explícito al ajuste fino de un modelo de 4B.
- Base para comparativas de ajuste fino: sirve como referencia para medir la degradación o especialización respecto al Qwen3.5-4B original en tareas de resumen y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB en GPU.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits, la VRAM de pesos bajaría a unos 4,5 GB; en 4 bits, a unos 2,3 GB, más overhead.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 para fp16 sin problemas; una RTX 3090/4080 (16 GB) también sería suficiente en fp16 con margen.
- ¿Cabe en consumer GPU? Sí, en GPUs de 12 GB o más en fp16, y en GPUs de 8 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; al ser safetensors de un transformer estándar, es compatible con los runners habituales de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pyrualean-libero90-qwen35-4b-summary-code-full-e3 | 4.539.265.536 | no disponible | no disponible | Hugging Face (jungwook2358) | SFT especializado, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B | ~4B (según base) | no disponible en esta ficha | según Qwen3.5 | Hugging Face (oficial) | Modelo base del que deriva |
| Otros SFT de Qwen3.5-4B | ~4B | no disponible | variable | Hugging Face | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B.
- No se documentan idiomas soportados; el entrenamiento parece orientado a una tarea muy concreta y probablemente en un único idioma, con riesgo de degradación fuera de ese dominio.
- Riesgo elevado de alucinación y de sobreajuste al conjunto de 421 ejemplos y 90 rollouts, dada la escasez de datos de entrenamiento.
- No hay resultados de benchmarks ni evaluaciones publicadas, por lo que no se puede verificar la calidad del ajuste frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La información sobre tool calling, agentes y contexto largo no está disponible; no debe asumirse su soporte.
- El nombre del repositorio incluye una fecha futura (20261118), lo que puede indicar un artefacto generado en un entorno de experimentación y no un modelo estable.
- Para producción, se recomienda validar el modelo contra el Qwen3.5-4B original y establecer controles de calidad y de sesgo antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/pyrualean-libero90-qwen35-4b-summary-code-full-e3-20261118-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Ficheros de procedencia citados en la model card: `training-completion-proof.json`, `inference-export-manifest.json` (disponibles en el repositorio del modelo)
