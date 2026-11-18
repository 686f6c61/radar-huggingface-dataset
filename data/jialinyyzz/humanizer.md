# jialinyyzz/humanizer

## Resumen

humanizer es un modelo de lenguaje de 12B parámetros desarrollado por el usuario jialinyyzz, afinado a partir de google/gemma-4-12B mediante fine-tuning supervisado. Su función es reescribir borradores generados por IA (correos, ensayos, informes, respuestas de foro) para que suenen a texto escrito por una persona, preservando de forma estricta números, unidades, fechas, nombres y citas. Está pensado para ejecutarse localmente, con soporte para inglés y chino.

El modelo se distribuye principalmente en formato GGUF para llama.cpp, con cuantizaciones optimizadas mediante quantización sensible a tensores y quantización-aware training, además de pesos safetensors en bf16. Cuenta con una aplicación de escritorio (macOS y Windows) y una CLI (`hz`) que permiten usarlo sin conexión, lo que lo hace relevante para flujos de trabajo donde la privacidad del texto es crítica.

Con 415.952 descargas y 2.284 likes en Hugging Face, el modelo ha tenido una adopción notable. Su propuesta diferencial no es tanto el tamaño como el pipeline de cuantización y la evaluación orientada a la detección de IA (95% de las reescrituras en inglés juzgadas como humanas por Originality.ai en su configuración más estricta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), fine-tune de google/gemma-4-12B |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit, Q3, Q4_K_M, Q6_K, Q8_0 (GGUF); bf16 (safetensors) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B, un transformer multimodal con pipeline image-text-to-text, y se ha afinado mediante fine-tuning (relación `finetune` respecto al modelo base) para la tarea de reescritura de estilo. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; sí indica que se usaron datos de reescritura en inglés y chino y que no se empleó ningún detector de IA durante el entrenamiento.

La innovación técnica destacable está en el pipeline de cuantización. Para los ficheros de 2-bit, Q3 y Q4_K_M, el autor midió la sensibilidad de cada tensor de pesos y asignó más bits a los tensores sensibles y menos a los robustos; después aplicó quantización-aware training capa por capa y destilación desde el modelo bf16 usado como profesor, sobre datos de reescritura en inglés y chino. Según la model card, esto eleva la coincidencia top-1 con bf16 del 70% (build estándar) al 87% en el fichero de 2-bit. Los ficheros Q6_K y Q8_0 son builds estándar de llama.cpp.

## Capacidades

- Reescritura de texto generado por IA para que suene humano, en inglés y chino.
- Preservación estricta de números, unidades, fechas, nombres y citas; el modelo está entrenado para no añadir información.
- Transferencia de estilo y paráfrasis.
- Generación de texto conversacional (pipeline text-generation).
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque la model card no las documenta como función principal.
- Integración con llama.cpp y otros runtimes compatibles con GGUF.
- Uso mediante aplicación de escritorio, CLI (`hz`) y agentes de código (documentación AGENTS.md).
- Soporte de importación de `.docx` y PDF en la app, con preservación literal de pasajes marcados con "Create fact".

## Casos de uso

- Reescritura de correos profesionales: el modelo toma un borrador generado por IA y lo reescribe manteniendo cifras, fechas y nombres intactos, lo que permite enviarlo con revisión mínima.
- Edición de ensayos e informes: la CLI `hz` procesa documentos largos por fragmentos, conserva encabezados, código, tablas y enlaces, y reescribe solo la prosa, adecuado para publicaciones que deben evitar detección de IA.
- Publicación en foros y comunidades: respuestas de foro o Zhihu reescritas con un tono más natural, útil para creadores de contenido que parten de borradores asistidos.
- Flujos con privacidad de datos: al ejecutarse localmente y sin conexión tras la descarga, permite reescribir documentos sensibles sin enviarlos a servicios en la nube.
- Integración en pipelines de agentes: la documentación AGENTS.md proporciona comandos de servidor y prompt exacto, lo que facilita su uso en herramientas de codificación y automatización.
- Despliegue en equipos de bajos recursos: las cuantizaciones de 2-bit y Q3 permiten ejecutar el modelo en máquinas con 8 GB de memoria, según la model card.
- Localización de contenido entre inglés y chino: reescritura en ambos idiomas para equipos que gestionan documentación bilingüe.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Reescrituras en inglés juzgadas humanas por Originality.ai | 95% (11 de 210 marcadas como IA) | Configuración más estricta, pesos bf16, 2026-10-02 |
| Reescrituras en inglés sin problema factual | 376 de 420 | Juez LLM estricto, fichero humanizer-12b-Q8_0.gguf |
| Correcciones de problemas factuales de una sola palabra o frase | más de 9 de cada 10 | Sobre las reescrituras con problema detectado |
| Coincidencia top-1 con bf16, fichero 2-bit | 87% | Frente al 70% de un build estándar del mismo tamaño |
| Reescrituras en inglés con problema factual (release anterior) | 369 de 420 | Comparativa con la versión previa |
| Reescrituras marcadas como IA (release anterior) | 26 de 210 | Comparativa con la versión previa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada según cuantización: el fichero de 2-bit ocupa aproximadamente 3,9 GB; Q3 y Q4_K_M son intermedios; Q6_K y Q8_0 son los mayores. La app sugiere uno de cinco tamaños según la memoria del equipo, con soporte hasta máquinas de 8 GB.
- GPU recomendadas: no disponible en la información proporcionada; el modelo está orientado a ejecución local en Mac con Apple silicon y Windows, además de servidores llama.cpp.
- ¿Cabe en GPU de consumo? Sí, según la model card, al menos en configuraciones de 8 GB de memoria con las cuantizaciones pequeñas (2-bit y Q3).
- Opciones de despliegue: llama.cpp (llama-server), aplicación de escritorio para macOS arm64 y Windows x64, CLI `hz` instalable vía pipx, y runtimes compatibles con GGUF. La librería declarada es gguf.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| humanizer (jialinyyzz) | ~12B | no disponible | en, zh | Apache 2.0 | Reescritura para sonar humano, ejecución local |
| google/gemma-4-12B (modelo base) | ~12B | no disponible | no disponible | no disponible en la información | Modelo generalista multimodal |
| Alternativas de reescritura de propósito similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de reescritura en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de errores factuales: aunque el modelo está entrenado para preservar datos, el juez estricto detectó problemas en 44 de 420 reescrituras en inglés (135 problemas, 125 de ellos de una sola palabra o frase). La model card recomienda revisar el resultado antes de enviarlo, especialmente números, fechas y nombres.
- Sesgos conocidos: no documentados en la información disponible.
- Cobertura lingüística limitada a inglés y chino; no se garantiza calidad en otros idiomas.
- Longitud de contexto no especificada; para documentos largos la CLI procesa el texto por fragmentos, lo que puede afectar a la coherencia global.
- Los ejemplos "antes y después" de la model card son selecciones entre 8 muestras, no resultados medios.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-12B puede tener sus propias condiciones que conviene verificar.
- El rendimiento en detección de IA se midió con Originality.ai en una fecha concreta; los detectores evolucionan y los resultados pueden no mantenerse.
- El modelo no está pensado como generador generalista; su uso fuera de la reescritura de estilo no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/jialinyyzz/humanizer
- Ficheros GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- GitHub: https://github.com/sgaofen/humanizer-local-model
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Guía de uso sin app: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Guía de uso sin app (chino): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Documentación para agentes: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Guía de instalación: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Documentación de cuantización: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Ejemplos de evaluación: https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Releases (app 0.3.2): https://github.com/sgaofen/humanizer-local-model/releases/tag/app-v0.3.2
- App macOS arm64: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- App Windows x64: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
