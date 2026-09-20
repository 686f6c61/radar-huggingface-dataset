# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored`, publicadas por el usuario mradermacher, un autor habitual de conversiones GGUF para llama.cpp. El nombre comercial del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, derivada de la familia Qwen3; sin embargo, el recuento real de parámetros publicado en los safetensors del repositorio es de 446.571.248 parámetros, una cifra incompatible con el nombre. Esa discrepancia no está aclarada en la model card y debe resolverse antes de cualquier uso en producción.

El modelo base se presenta como una variante "uncensored" (previsiblemente un ajuste sobre pesos abliterados o desalineados de seguridad), pero no se documenta el proceso de ajuste, el dataset utilizado ni el método de entrenamiento. El repositorio ofrece hasta doce cuantizaciones distintas (x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS), lo que permite desplegarlo en hardware muy diverso siempre que se confirme primero el tamaño real del modelo.

La relevancia de esta ficha es limitada pero real: se trata de un artefacto de conversión, no de un modelo original. Cualquier evaluador debería tratar el repositorio como material de partida para inspección técnica, verificar el tamaño efectivo de los archivos GGUF y comprobar la licencia del modelo base antes de considerar su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer MoE, sin confirmar) |
| Parametros totales | 446.571.248 según safetensors del repositorio; el nombre indica 35B, dato contradictorio y no aclarado |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (formato GGUF estático) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo origen se publica en safetensors |
| Tamano del repositorio | 1,5 GB |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información técnica verificable sobre la arquitectura. La convención de nombres "35B-A3B" es la empleada por la familia Qwen3 para designar modelos de mezcla de expertos con 35.000 millones de parámetros totales y 3.000 millones activos por token, pero el recuento real de parámetros del repositorio (446,6 millones) es dos órdenes de magnitud inferior a esa cifra. Las dos explicaciones plausibles son: (a) que los safetensors indexados correspondan a un componente auxiliar (por ejemplo, un proyector multimodal o un adaptador) y no al modelo completo, o (b) que el nombre comercial del modelo base no refleje su tamaño real. La model card no resuelve la ambigüedad.

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o abliteración. La etiqueta "Uncensored" en el nombre del modelo base apunta a una intervención sobre las capas de rechazo, pero se desconoce el método. El repositorio es exclusivamente un artefacto de conversión: los metadatos incrustados indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión estándar de pesos HuggingFace a GGUF con cuantización por tensor. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional: capacidad presumible por tratarse de un modelo de lenguaje ajustado, aunque no verificada en este repositorio.
- Razonamiento y matemáticas: no disponible, sin datos publicados.
- Generación de código: no disponible, sin datos publicados.
- Visión: no disponible. La model card incluye un campo `skip_mmproj` vacío, lo que no permite confirmar ni descartar un componente multimodal en el modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Modo sin restricciones de contenido ("uncensored"): es la única característica declarada explícitamente en el nombre del modelo, sin documentación técnica que la respalde.

## Casos de uso

- Auditoría de artefactos GGUF: el caso de uso más sólido y verificable. Un equipo de plataforma puede descargar el repositorio, inspeccionar los metadatos de cada archivo con `gguf-dump` o `llama.cpp` y determinar el tamaño real del modelo, resolviendo la contradicción entre el nombre y el recuento de parámetros antes de adoptarlo.
- Evaluación de seguridad de modelos desalineados: investigadores en alineación pueden utilizar la variante "uncensored" como sujeto de prueba en baterías de evaluación de rechazo, toxicidad y jailbreak, comparando su comportamiento con el de un modelo alineado de referencia.
- Investigación sobre cuantización extrema: el repositorio incluye Q2_K e IQ4_XS, lo que permite estudiar la degradación de calidad en regímenes de muy baja precisión sobre una misma base de pesos.
- Despliegue en hardware de gama baja: si se confirma que el modelo tiene ~446 millones de parámetros, las cuantizaciones Q4 y Q5 cabrían en cualquier portátil y en dispositivos con CPU exclusivamente, habilitando prototipos de asistentes locales sin GPU.
- Pruebas de integración en llama.cpp y Ollama: sirve como caso de prueba para validar pipelines de carga de GGUF, plantillas de chat y parámetros de muestreo en herramientas de inferencia local.
- Filtrado y clasificación de texto en local: si el modelo funciona como un LM pequeño, puede emplearse para tareas de etiquetado, moderación o extracción de entidades en entornos sin conectividad, aunque la ausencia de benchmarks impide estimar su calidad.
- Comparación de metodologías de cuantización: un mismo equipo puede medir perplejidad y latencia de las doce variantes publicadas para calibrar el compromiso precisión/tamaño, siempre que confirme primero el tamaño real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió documentación técnica asociada al modelo.

## Requisitos de hardware

Las siguientes estimaciones son cálculos aritméticos a partir de los recuentos de parámetros y no proceden de mediciones publicadas. Se ofrecen para los dos escenarios posibles, dado que la información disponible es contradictoria.

Escenario A, si el modelo tiene 446,6 millones de parámetros (dato de los safetensors):

- FP16 sin cuantizar: aproximadamente 0,9 GB de pesos.
- Q8_0: aproximadamente 0,5 GB.
- Q4_K_M: aproximadamente 0,3 GB.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090), en iGPU modernas e incluso en CPU con 2-4 GB de RAM libre.
- Despliegue recomendado: llama.cpp, Ollama, LM Studio, llama-cpp-python.
- Latencia y throughput: no disponibles.

Escenario B, si el nombre refleja 35.000 millones de parámetros totales con 3.000 millones activos (MoE tipo Qwen3):

- FP16: aproximadamente 70 GB de pesos, inviable en una sola GPU de consumo.
- Q8_0: aproximadamente 37 GB.
- Q4_K_M: aproximadamente 20-21 GB; requiere una RTX 3090/4090 de 24 GB o dos GPU de 16 GB.
- Q2_K: aproximadamente 12-13 GB; cabe en una RTX 4080 o 4070 Ti Super.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI solo con soporte verificado de la arquitectura MoE concreta.
- Latencia y throughput: no disponibles; en un MoE con 3B activos el throughput por token suele ser alto, pero no hay mediciones para este modelo.

Advertencia: el tamaño del repositorio (1,5 GB) es incompatible con el escenario B incluso en cuantizaciones Q2_K y coherente con un modelo de tamaño muy reducido. Verifique el tamaño de los archivos individuales antes de aprovisionar hardware.

## Comparativa con modelos similares

No se dispone de información verificable sobre modelos comparables de la misma categoría. La única comparación posible con los datos proporcionados es con el modelo de origen sin cuantizar.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-GGUF | 446.571.248 según safetensors (nombre indica 35B) | no disponible | no disponible | GGUF (12 cuantizaciones) | HuggingFace, 0 descargas |
| nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | no disponible | no disponible | no disponible | safetensors | HuggingFace (origen de la conversión) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contradicción de tamaño sin resolver: el nombre indica 35B-A3B y los safetensors indican 446,6 millones de parámetros. No aprovisione hardware ni planifique despliegues hasta confirmar cuál es el dato correcto.
- Licencia no declarada: sin licencia explícita no puede asumirse ningún permiso de uso comercial. La licencia del modelo base tampoco se documenta en este repositorio.
- Modelo "uncensored": el ajuste orientado a eliminar rechazos de seguridad incrementa el riesgo de generar contenido dañino, ilegal o difamatorio, y lo hace inadecuado para aplicaciones de cara al público sin filtros adicionales.
- Ausencia total de benchmarks: no hay métricas de calidad, por lo que no puede compararse objetivamente con alternativas ni estimarse su fiabilidad en tareas concretas.
- Riesgo de alucinación: no cuantificado, pero inherente a cualquier modelo de lenguaje sin evaluación publicada.
- Idiomas y contexto desconocidos: se desconoce la ventana de contexto efectiva y los idiomas para los que fue entrenado.
- Sesgos: no evaluados ni documentados.
- Artefacto de conversión, no modelo original: los posibles defectos de cuantización (especialmente en Q2_K e IQ4_XS) son responsabilidad del proceso de conversión y pueden degradar la calidad respecto al modelo base.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad.
- Procedencia opaca del modelo base: el prefijo "Qwen3.6" no se corresponde con ninguna versión publicada conocida de la familia Qwen, lo que sugiere un renombrado manual y dificulta la trazabilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los únicos enlaces recuperados corresponden a páginas de descarga del navegador Google Chrome y no guardan relación con este repositorio.
