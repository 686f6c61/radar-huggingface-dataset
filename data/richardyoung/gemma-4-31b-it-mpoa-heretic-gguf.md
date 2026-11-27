# richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF` es una cuantización en formato GGUF de un modelo derivado de la familia Gemma 4 de Google, concretamente una variante de 31B parámetros ajustada mediante la técnica "abliteration" (eliminación de rechazos o *refusals*) bajo el nombre MPOA-heretic. El autor del repositorio es richardyoung, que publica esta versión cuantizada para su uso con llama.cpp y Ollama, con matrices de importancia (imatrix) para preservar calidad en las cuantizaciones bajas.

El modelo resuelve el problema de desplegar un LLM de ~31B parámetros sin censura alineada en hardware de consumo, ofreciendo pesos GGUF listos para inferencia local. Su relevancia radica en que combina el tamaño y capacidades de la familia Gemma 4 con un proceso de "abliteration" que elimina los mecanismos de rechazo, algo demandado en investigación sobre alineación, red-teaming y generación creativa sin restricciones.

El repositorio tiene acceso restringido (gated), requiere aceptar condiciones en Hugging Face, y está etiquetado únicamente para inglés. La información pública disponible es limitada: no se detallan la arquitectura interna exacta, los datos de entrenamiento ni resultados de benchmarks en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles específicos no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); base en safetensors en el modelo origen |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de `richardyoung/gemma-4-31B-it-MPOA-heretic`, que a su vez deriva de Gemma 4 31B instruction-tuned. La arquitectura subyacente es un transformer decoder-only de la familia Gemma, con aproximadamente 30,7 mil millones de parámetros. La variante "heretic" implica un proceso de abliteration: se identifican y neutralizan las direcciones de activación asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. El sufijo MPOA no está documentado en la información disponible.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales sobre el modelo base. La cuantización emplea matrices de importancia (imatrix), una técnica que pondera los pesos según su relevancia para reducir la pérdida de calidad en cuantizaciones agresivas. El repositorio referencia el paper arXiv:2611.17846, presumiblemente relacionado con el método de abliteration o cuantización empleado.

## Capacidades

- Generación de texto conversacional en inglés, con el modo instruction-tuned heredado de Gemma 4.
- Razonamiento y respuesta a instrucciones complejas propias de un modelo de 31B.
- Generación de código y matemáticas (capacidades heredadas del base, sin benchmarks publicados en esta ficha).
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo original rechazaría.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- Endpoints compatibles según los tags del repositorio.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multimodales (visión/audio): no disponibles; el modelo se etiqueta solo como text-generation.
- Capacidades multilingües: limitadas a inglés según el tag de idioma.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos se eliminan con abliteration y cómo afecta a la utilidad, comparando respuestas con el Gemma 4 original en entornos controlados.
- Red-teaming y evaluación de robustness: sirve para generar respuestas a prompts adversarios y analizar la eficacia de los filtros de seguridad de otros sistemas.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que el modelo alineado rechazaría por temas sensibles, en contextos de autoría profesional.
- Despliegue local en estación de trabajo: con ~31B parámetros en GGUF, puede ejecutarse en GPUs de consumo de gama alta (p. ej. RTX 4090 con cuantización Q4) mediante llama.cpp u Ollama, sin depender de la nube.
- Asistente de código en local: para desarrolladores que prefieren no enviar código a APIs externas y necesitan un modelo de tamaño medio capaz de seguir instrucciones.
- Experimentación con cuantización e imatrix: el repositorio sirve como referencia para evaluar la pérdida de calidad entre distintos niveles GGUF de un mismo modelo base.
- Fine-tuning posterior sobre el modelo desbloqueado: base para ajustes específicos de dominio donde los rechazos del modelo alineado interfieren con la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para ~30,7B parámetros, una cuantización Q4_K_M ocupa aproximadamente 18-19 GB; Q5_K_M en torno a 21-22 GB; Q8_0 cerca de 33 GB; FP16 requeriría ~61 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y cuantizaciones altas; RTX 4090 (24 GB) suficiente para Q4 y Q5; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4/Q5; en GPUs de 16 GB solo con cuantizaciones muy bajas (Q2/Q3) y posible degradación.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints OpenAI; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Abliterated, solo inglés, gated |
| Gemma 4 31B IT (original) | ~30,7B | no disponible | Gemma license | safetensors/GGUF | Alineado, rechaza peticiones sensibles |
| Otras variantes abliterated de 30B | ~30B | variable | variable | GGUF | No disponible comparación directa en la información |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal; no debe desplegarse en producción orientada a usuarios sin moderación externa.
- Solo inglés: el tag de idioma indica únicamente `en`; el rendimiento en castellano no está garantizado.
- Riesgo elevado de alucinación: inherente a modelos de este tamaño y agravado por la pérdida de calidad de la cuantización.
- Sesgos: hereda los sesgos del dataset de entrenamiento de Gemma 4, sin corrección adicional documentada.
- Licencia apache-2.0 declarada, pero el modelo base Gemma está sujeto a los términos de Google; verificar compatibilidad antes de uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la abliteration ni por la cuantización.
- Contexto no documentado: se desconoce la ventana máxima real soportada en esta variante.
- Uso responsable: recomendado exclusivamente para investigación y entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-MPOA-heretic
- Paper referenciado: https://arxiv.org/abs/2611.17846
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
