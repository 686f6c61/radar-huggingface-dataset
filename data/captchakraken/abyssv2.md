# CaptchaKraken/AbyssV2

## Resumen

AbyssV2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario CaptchaKraken y publicado en Hugging Face bajo acceso restringido. El modelo está orientado a la resolución de captchas, tal y como indican sus etiquetas ("captcha", "captchakraken", "pointer") y su propio nombre. Se distribuye en formato safetensors con un total de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones), coherente con el tamaño de su modelo base.

La relevancia de este modelo radica en su especialización: en lugar de ser un modelo generalista, se presenta como un fine-tune orientado a una tarea concreta de visión y razonamiento (resolución de captchas), lo que lo convierte en un caso de estudio interesante para quienes trabajan en automatización de tareas visuales o en evaluación de robustez de sistemas anti-bot. Al estar construido sobre Qwen3.5-4B, hereda presumiblemente las capacidades multimodales y de contexto de dicha familia, aunque no se han publicado detalles específicos sobre el proceso de entrenamiento.

La información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados y no se han publicado resultados de benchmarks. Además, el acceso está restringido y requiere aceptar condiciones en Hugging Face, lo que limita su evaluación directa por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-4B; etiqueta `qwen3_5`) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen versiones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna de AbyssV2 más allá de su modelo base, Qwen/Qwen3.5-4B, y la etiqueta `qwen3_5` que confirma la familia. Se trata, por tanto, de un transformer de aproximadamente 4,54 mil millones de parámetros, presumiblemente con capacidades multimodales heredadas del base (dado el enfoque en captchas, que requiere procesamiento de imagen). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o supervisión específica para la tarea de captchas.

Las etiquetas del repositorio (`captcha`, `captchakraken`, `pointer`, `vllm`) sugieren un entrenamiento orientado a la localización de elementos ("pointer") dentro de imágenes de captcha y a su despliegue mediante vLLM. Sin embargo, no hay documentación pública que confirme la metodología, el volumen de datos ni las innovaciones técnicas empleadas. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Resolución de captchas: capacidad principal inferida del nombre y las etiquetas del modelo, orientada a interpretar y resolver desafíos de tipo captcha.
- Localización de elementos ("pointer"): la etiqueta sugiere capacidad de señalar o localizar regiones dentro de una imagen, útil para captchas de tipo "selecciona la imagen que contiene X".
- Procesamiento multimodal: presumiblemente heredado de Qwen3.5-4B, aunque no confirmado en la documentación del fine-tune.
- Generación de texto y razonamiento: capacidades base del modelo Qwen3.5-4B, potencialmente preservadas tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible (no confirmado para este fine-tune).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo "thinking" o razonamiento extendido: no disponible (no confirmado).

## Casos de uso

- Automatización de pruebas de accesibilidad y QA: el modelo puede emplearse para verificar la robustez de sistemas captcha propios durante el desarrollo, resolviendo desafíos de forma automatizada y detectando debilidades antes de desplegarlos en producción.
- Evaluación de seguridad anti-bot: investigadores pueden usar AbyssV2 para medir la resistencia de sus implementaciones de captcha frente a modelos especializados, identificando qué tipos de desafío son vulnerables.
- Generación de datasets etiquetados: dado su enfoque en localización ("pointer"), puede utilizarse para anotar imágenes con regiones de interés en pipelines de creación de datos sintéticos.
- Investigación en visión por computador: como caso de estudio de fine-tuning especializado sobre Qwen3.5-4B, sirve para analizar cómo un ajuste concreto afecta a las capacidades generales del modelo base.
- Despliegue con vLLM: la etiqueta `vllm` indica compatibilidad con este motor de inferencia, lo que facilita su integración en servicios de alta concurrencia para tareas de procesamiento visual por lotes.
- Experimentación académica sobre robustez de modelos: permite estudiar la transferencia de capacidades multimodales de un modelo base a una tarea estrecha y medir el olvido catastrófico en tareas generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors a precisión completa (probablemente bf16/fp16), el modelo requiere aproximadamente 9 GB solo para los pesos (4,54 B × 2 bytes). Con cuantización a 8 bits, alrededor de 4,5-5 GB; a 4 bits, aproximadamente 2,5-3 GB, más overhead de activaciones y caché KV.
- GPU recomendadas: para bf16 sin cuantizar, una GPU con 16 GB o más (RTX 4080/4090, A100, H100). Para cuantización 4/8 bits, GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070) podrían ser suficientes, dependiendo de la longitud de contexto y del procesamiento de imágenes.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3060 12 GB o superiores con cuantización; en bf16, en RTX 4090 (24 GB) con margen.
- Opciones de despliegue: vLLM (etiqueta explícita del repositorio), y potencialmente llama.cpp/Ollama si se generan versiones GGUF (no publicadas). TGI no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbyssV2 | ~4,54 B | no disponible | Captchas / pointer | LGPL-3.0 | Gated en HF |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en la información | Generalista multimodal | no disponible en la información | Público en HF |
| Fine-tunes especializados en captchas (genéricos) | Variable (1-7 B) | Variable | Captchas | Variable | Variable |

No se dispone de información suficiente para establecer comparativas cuantitativas de rendimiento con alternativas concretas. La comparación más directa es con su modelo base, Qwen3.5-4B, del que hereda arquitectura y tamaño, pero del que se desconoce el impacto exacto del ajuste fino en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune sobre Qwen3.5-4B, podría heredar sesgos del modelo base, pero no hay información pública al respecto.
- Riesgo de alucinación: no evaluado; en tareas de captcha, una respuesta incorrecta puede ser indistinguible de una alucinación, y no se han publicado métricas de precisión.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en escenarios multilingües o con entradas largas.
- Restricciones de licencia: LGPL-3.0 es una licencia copyleft débil; el uso comercial es posible, pero las modificaciones de la biblioteca (no del modelo en sí, según interpretación habitual) deben distribuirse bajo la misma licencia. Conviene revisar con asesoría legal la aplicabilidad de LGPL a pesos de modelo.
- Acceso restringido: el repositorio es "gated", por lo que requiere aceptar condiciones en Hugging Face; esto limita la reproducibilidad y la auditoría independiente.
- Ausencia de documentación: no hay model card detallada, benchmarks ni ejemplos de uso, lo que dificulta la validación en producción.
- Uso ético: la resolución automatizada de captchas puede vulnerar los términos de servicio de sitios web y facilitar actividades abusivas; su uso debe limitarse a entornos controlados, investigación o pruebas de seguridad autorizadas.

## Enlaces

- Hugging Face: https://huggingface.co/CaptchaKraken/AbyssV2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (referenciado en las etiquetas del repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
