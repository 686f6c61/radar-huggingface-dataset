# crw72/Qwen3-Coder-Next-oQ4e-fp16

## Resumen

Qwen3-Coder-Next-oQ4e-fp16 es una cuantización mixta del modelo Qwen/Qwen3-Coder-Next, publicada por el usuario crw72 bajo licencia Apache 2.0. Se trata de un checkpoint de aproximadamente 79.674 millones de parámetros orientado a tareas de generación de código, convertido a cuantización de precisión mixta mediante la herramienta oQ (oMLX v0.8.0) y empaquetado en formato MLX para su ejecución en hardware Apple Silicon. El modelo base procede de la familia Qwen3-Next de Alibaba, si bien la model card del repositorio no detalla arquitectura interna, contexto ni datos de entrenamiento del original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de código de gran tamano en equipos con memoria unificada de Apple, gracias a una tasa efectiva de 4,623 bits por peso que reduce el checkpoint a 42,881 GiB de almacenamiento. No obstante, la información publicada es muy limitada: no se documentan benchmarks, idiomas soportados, longitud de contexto ni detalles del proceso de entrenamiento del modelo base, por lo que muchas especificaciones deben marcarse como no disponibles.

Esta ficha describe exclusivamente lo que puede verificarse a partir de los metadatos de Hugging Face y de la model card del autor de la cuantización. Cualquier dato sobre capacidades, rendimiento o requisitos que no aparezca en dichas fuentes se indica explícitamente como no disponible, sin inferencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-Next; detalles no publicados en la model card) |
| Parametros totales | 79.674.391.296 (79,674B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ (oMLX v0.8.0): affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64 y FP16; media efectiva 4,623 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantización no proporciona información sobre la arquitectura interna del modelo base Qwen/Qwen3-Coder-Next, ni sobre el volumen o composición de sus datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El tag `qwen3_next` sugiere pertenencia a la familia Qwen3-Next, pero no se detalla en la información disponible si emplea transformer denso, mezcla de expertos, arquitectura híbrida o mecanismos de atención lineal.

Lo que sí está documentado es el proceso de cuantización. El checkpoint se generó con oQ (oMLX v0.8.0) aplicando precisión mixta: el 97,032% de los pesos lógicos (77,309B) se almacena en affine 4-bit con grupo de 64, mientras que un 2,714% (2,162B) se conserva en affine 8-bit grupo 64, un 0,190% (0,151B) en affine 8-bit grupo 128 y un 0,065% (0,052B) en FP16. El resultado son 42,881 GiB de almacenamiento (46,043 GB) para el conjunto del modelo de lenguaje, con una media efectiva de 4,623 bits por peso. El autor indica que el checkpoint fue recuantizado el 2026-11-19 y recomienda volver a descargarlo si se dispone de una copia anterior.

## Capacidades

- Generación de código: el modelo base está etiquetado como Qwen3-Coder-Next, lo que indica especialización en tareas de programación, aunque la model card no enumera capacidades concretas.
- Generación de texto y razonamiento: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: soportada mediante la librería MLX, según los tags del repositorio.

## Casos de uso

- Asistencia de programación en local sobre Mac: el checkpoint en formato MLX permite ejecutar un modelo de código de 79,674B en equipos Apple Silicon con memoria unificada suficiente (42,881 GiB de pesos), sin depender de servicios en la nube.
- Autocompletado y generación de código en el IDE: al estar orientado a código y caber en estaciones de trabajo con memoria unificada amplia, puede integrarse en flujos de desarrollo locales para sugerencias y refactorizaciones.
- Prototipado y experimentación con cuantización mixta: útil para investigadores que quieran evaluar el impacto de la cuantización oQ 4-bit/8-bit/FP16 frente al modelo base en tareas de código.
- Pipelines de revisión de código offline: en entornos con requisitos de privacidad, el despliegue local con MLX evita enviar el código a APIs externas.
- Evaluación comparativa de checkpoints cuantizados: sirve como referencia para medir degradación de calidad respecto a Qwen/Qwen3-Coder-Next en benchmarks propios.
- Desarrollo de herramientas para macOS: al usar la librería MLX, encaja en aplicaciones nativas de Apple que requieran inferencia local de un modelo grande de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: al menos 42,881 GiB solo para los pesos (46,043 GB en disco); se requiere memoria adicional para el contexto y los estados intermedios, aunque la cifra exacta no está disponible.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4 y variantes Pro/Max/Ultra); no se documenta soporte para GPU NVIDIA o AMD en esta información.
- ¿Cabe en GPU de consumo? En GPUs convencionales de consumo (p. ej. 24 GB de VRAM) no cabe por el tamano del checkpoint; en Apple Silicon, requiere configuraciones con memoria unificada de 64 GB o superior, si bien el requisito exacto no está publicado.
- Opciones de despliegue: librería MLX (mlx-lm y ecosistema oMLX); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crw72/Qwen3-Coder-Next-oQ4e-fp16 | 79,674B | no disponible | apache-2.0 | safetensors (MLX) | Cuantización mixta 4,623 bits/peso, 42,881 GiB |
| Qwen/Qwen3-Coder-Next (base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo original sin cuantizar |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 4,623 bits/peso puede introducir degradación de calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen dicha pérdida.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- No se especifica la longitud de contexto soportada, lo que impide garantizar su comportamiento en tareas de contexto largo.
- El formato MLX limita el despliegue a hardware Apple Silicon; no se documenta compatibilidad con otras plataformas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3-Coder-Next antes de un uso comercial en producción.
- El repositorio tiene un volumen muy bajo de descargas (221) y ningún "like", y no procede de un canal oficial; se recomienda validar el checkpoint antes de usarlo en entornos críticos.
- El autor recomienda volver a descargar el modelo si se posee una versión anterior a la recuantización del 2026-11-19.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3-Coder-Next-oQ4e-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
