# drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32

## Resumen

keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32 es un modelo de lenguaje de gran tamano (LLM) desarrollado por el usuario de HuggingFace drowzeys, basado en el modelo DeepSeek-V4-Flash-0731 de DeepSeek AI. Se trata de una variante "abliterated" (desprovista de mecanismos de rechazo de seguridad) que elimina las respuestas de negativa ante solicitudes potencialmente peligrosas o sensibles, orientada a tareas de red-teaming, investigacion y asistentes locales sin filtros. El modelo emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 304 000 millones de parametros totales, y esta disponible en cuantizacion FP8 y NVFP4, lo que reduce significativamente los requisitos de memoria frente a una version en precision completa.

La relevancia de este modelo radica en su doble vertiente: por un lado, hereda las capacidades tecnicas del modelo base DeepSeek-V4-Flash-0731, que incluyen un contexto amplio (posiblemente hasta 1 millon de tokens segun el repositorio asociado) y soporte multilingue (ingles y chino); por otro, su naturaleza "uncensored" lo convierte en una herramienta util para evaluar comportamientos de modelos sin restricciones, aunque con riesgos importantes que se detallan en las limitaciones. El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que anade una capa de control sobre su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en DeepSeek-V4-Flash-0731 |
| Parametros totales | 304 180 418 494 (aproximadamente 304 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el repositorio asociado menciona 1M de tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | FP8, NVFP4 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | deepseek (licencia personalizada de DeepSeek) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de DeepSeek-V4-Flash-0731, que emplea un diseno de mezcla de expertos (MoE) para activar solo una fraccion de los parametros durante cada inferencia, lo que mejora la eficiencia computacional sin sacrificar capacidad. El proceso de "abliteration" aplicado por drowzeys consiste en eliminar o neutralizar los mecanismos de rechazo de seguridad del modelo base, de modo que el modelo responda a solicitudes que normalmente serian bloqueadas. Este proceso no implica un reentrenamiento completo, sino una modificacion de los pesos o de la capa de clasificacion de seguridad.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El modelo base DeepSeek-V4-Flash-0731 es un desarrollo reciente de DeepSeek AI, y esta variante se publica como un experimento de la comunidad para explorar comportamientos sin restricciones. No se han documentado innovaciones tecnicas adicionales mas alla de la cuantizacion FP8/NVFP4 y la eliminacion de los rechazos de seguridad.

## Capacidades

- Generacion de texto en ingles y chino, con capacidad de razonamiento y respuesta a instrucciones complejas heredadas del modelo base.
- Soporte de contexto largo (posiblemente hasta 1 millon de tokens, segun el repositorio asociado), adecuado para tareas que requieren memoria extensa.
- Capacidad de tool calling y function calling, segun las etiquetas del modelo ("endpoints_compatible"), lo que permite integrarlo en flujos de agentes.
- Capacidad de razonamiento multi-paso y generacion de codigo, aunque no se proporcionan benchmarks especificos en la informacion disponible.
- Ausencia de rechazos de seguridad: el modelo responde a solicitudes que normalmente serian bloqueadas, lo que lo hace util para red-teaming y evaluacion de riesgos.
- Compatible con librerias de inferencia como vLLM y FriendliAI, segun los resultados de busqueda.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo permite a investigadores probar sistemas de moderacion y detectar vulnerabilidades en pipelines de IA generativa, al generar respuestas sin filtros que revelan sesgos o comportamientos problematicos.
- Asistente local sin restricciones: usuarios avanzados pueden desplegar el modelo en entornos locales (con hardware adecuado) para obtener respuestas sin censura en tareas creativas o tecnicas, asumiendo la responsabilidad de los contenidos generados.
- Analisis de documentos largos: gracias a su posible contexto de 1 millon de tokens, el modelo puede procesar libros completos, codigos fuente extensos o expedientes legales, resumiendo o extrayendo informacion relevante.
- Generacion de codigo en entornos de investigacion: el modelo puede asistir en la escritura de scripts, depuracion y refactorizacion, especialmente en proyectos que requieren respuestas directas sin restricciones de seguridad.
- Simulacion de conversaciones multilingues: al soportar ingles y chino, puede utilizarse para generar dialogos o traducir contenido en estos idiomas, aunque con la advertencia de posibles sesgos.
- Evaluacion de modelos de IA: comparar el comportamiento de este modelo "abliterated" con el modelo base permite estudiar el impacto de los mecanismos de seguridad en la calidad y el tono de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo. Se recomienda consultar el repositorio de HuggingFace o el repositorio de GitHub asociado para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del repositorio es de 166,9 GB en cuantizacion FP8/NVFP4, por lo que se requieren multiples GPU de alta capacidad. Con FP8, el modelo ocupa aproximadamente 166 GB, lo que implica al menos 4 GPU de 48 GB (como A100 o H100) o 8 GPU de 24 GB (como RTX 4090) para cargar los pesos en memoria.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o equivalentes con soporte para FP8. Para NVFP4, se requieren GPU de la serie Blackwell (como B200) que soporten este formato.
- No cabe en GPU de consumo estandar (como RTX 4090 de 24 GB) sin cuantizacion adicional o particionado en multiples dispositivos.
- Opciones de despliegue: vLLM, TensorRT-LLM, FriendliAI (segun los resultados de busqueda), y posiblemente llama.cpp si se generan versiones GGUF (existe un repositorio GGUF asociado).
- Latencia y throughput: no disponibles en la informacion proporcionada. Se espera que la inferencia sea lenta en hardware de consumo y requiera optimizaciones especificas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32 | 304 000 millones (MoE) | no disponible (posible 1M) | deepseek (personalizada) | Gated en HuggingFace |
| DeepSeek-V4-Flash-0731 (modelo base) | 304 000 millones (MoE) | no disponible | deepseek (personalizada) | Gated en HuggingFace |
| Otros modelos "abliterated" de la comunidad | variable | variable | variable | Variable, generalmente en HuggingFace |

La comparativa se limita al modelo base y a otras variantes "abliterated" de la comunidad, ya que no se dispone de datos de modelos comparables de otros fabricantes en la informacion proporcionada. El modelo base DeepSeek-V4-Flash-0731 es la referencia principal, y esta variante se diferencia unicamente por la eliminacion de los rechazos de seguridad.

## Limitaciones y advertencias

- El modelo ha sido desprovisto de mecanismos de seguridad, por lo que puede generar contenidos ofensivos, peligrosos o ilegales. Su uso debe limitarse a entornos de investigacion controlados y con supervisio humana.
- Riesgo elevado de alucinaciones: al no tener filtros, el modelo puede inventar informacion con mayor confianza, especialmente en temas delicados.
- La licencia "deepseek" es personalizada y puede imponer restricciones al uso comercial o a la redistribucion. Es necesario revisar los terminos exactos en el repositorio de HuggingFace.
- El acceso al modelo es restringido (gated) y requiere aceptar condiciones, lo que limita su disponibilidad publica.
- No se proporcionan datos de rendimiento ni benchmarks, por lo que no es posible evaluar su calidad objetiva frente a otros modelos.
- El soporte de idiomas se limita a ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantizacion FP8/NVFP4 puede introducir perdidas de precision en tareas de razonamiento complejo, aunque no se han documentado evaluaciones al respecto.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32
- Repositorio de GitHub (asociado): https://github.com/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
