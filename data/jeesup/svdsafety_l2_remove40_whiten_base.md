# Jeesup/svdsafety_l2_remove40_whiten_base

## Resumen

`Jeesup/svdsafety_l2_remove40_whiten_base` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup como artefacto de investigación sobre compresión de modelos mediante SVD-LLM. El objetivo declarado del estudio es medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado, y qué regla de selección de componentes restaura mejor esa seguridad. Cada checkpoint del repositorio es una celda de una rejilla de experimentos sobre reglas de selección y presupuestos de restauración.

El autor es explícito respecto a la naturaleza del artefacto: no es un modelo de chat de propósito general, sino un sujeto experimental. La model card advierte de que varias ramas de la rejilla están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat, porque la compresión por sí sola eleva la tasa de éxito de ataques de jailbreak. El valor del checkpoint es, por tanto, metodológico: sirve para reproducir y auditar el protocolo de evaluación, no para desplegarse.

Existe una inconsistencia relevante entre el nombre y la propia model card. El identificador incluye "remove40", pero la tabla de procedencia declara `0.00%` de parámetros eliminados, `0.000%` de presupuesto de restauración, `0` componentes restaurados y una fracción de parámetros resultante de `0.0000`. El recuento real de parámetros en safetensors (6.738.415.616) coincide exactamente con el de Llama-2-7b-chat sin comprimir, lo que refuerza la hipótesis de que este checkpoint concreto no aplica una compresión efectiva y funciona como brazo de control del experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), según el modelo base `meta-llama/Llama-2-7b-chat-hf` |
| Parámetros totales | 6.738.415.616 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens, heredada del modelo base Llama-2-7b-chat; no se especifica en la model card |
| Tipos de cuantización | No se publican versiones cuantizadas en el repositorio; los pesos están en safetensors (fp16/fp32) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base Llama-2 se entrenó principalmente en inglés) |
| Licencia | Llama 2 Community License (etiqueta `license:llama2`); se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 13,5 GB |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Compresión declarada | SVD-LLM, 0,00 % de parámetros eliminados (según model card) |
| Regla de selección | `unknown` (marcador sin resolver en la model card) |
| Presupuesto de restauración | 0,000 % de parámetros densos; 0 componentes restaurados; 0 componentes sustituidos |
| Semilla | 42 |
| Pipeline | `text-generation` |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y codificación posicional rotatoria (RoPE), con aproximadamente 6,74 mil millones de parámetros. El modelo base fue entrenado por Meta con un pipeline de alineación que combina ajuste supervisado (SFT) y aprendizaje por refuerzo con retroalimentación humana (RLHF, con muestreo por rechazo y PPO), según la documentación pública de Llama 2.

La innovación declarada de este checkpoint no está en la arquitectura, sino en el método de compresión: SVD-LLM, una técnica de compresión post-entrenamiento que factoriza matrices de pesos mediante descomposición en valores singulares y selecciona qué componentes conservar según una regla heurística. El sufijo `whiten` del identificador apunta a una variante con blanqueado (whitening) en el cálculo de la SVD, y `base` indica que se trata de la rama de referencia o control dentro de la rejilla experimental. La model card confirma el uso de SVD-LLM, la semilla 42 y una rejilla de reglas de selección con distintos presupuestos, pero deja la regla de este checkpoint como `unknown`.

No se documenta en la información disponible ningún reentrenamiento posterior, destilación, ajuste adicional ni proceso de reparación de seguridad más allá de la restauración de componentes SVD. Tampoco se publican detalles sobre el número de tokens, la composición del dataset ni las métricas de alineación empleadas específicamente en este artefacto.

## Capacidades

- Generación de texto conversacional: hereda la funcionalidad de Llama-2-7b-chat, aunque el propio autor advierte de que no debe tratarse como un asistente desplegable.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo base, sin garantía de conservación tras el proceso experimental.
- Objeto de evaluación de seguridad: permite medir tasas de éxito de ataques (jailbreak, extracción de contenido dañino) bajo distintas condiciones de compresión.
- Reproducibilidad experimental: semilla fija (42) y procedencia documentada, lo que facilita replicar la celda concreta de la rejilla.
- Interpretabilidad de componentes: al trabajar sobre una factorización SVD, permite estudiar qué direcciones o componentes del espacio de pesos se asocian con comportamientos de seguridad.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base está optimizado para inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; se trata de un modelo puramente textual.

## Casos de uso

- Auditoría de seguridad bajo compresión: usar este checkpoint como brazo de control (0 % de compresión) frente a las demás celdas de la rejilla, para aislar cuánto de la degradación de seguridad se debe a la SVD y cuánto al punto de partida.
- Investigación en compresión de modelos: comparar la factorización SVD-LLM con otras técnicas (cuantización, poda estructurada, destilación) midiendo perplejidad y degradación funcional sobre un mismo modelo base.
- Estudios de interpretabilidad de seguridad: analizar qué subconjuntos de componentes singulares, al restaurarse, recuperan el comportamiento alineado, lo que ayuda a localizar representaciones asociadas a rechazo de contenido dañino.
- Red-teaming y evaluación de ataques: servir como sujeto experimental en bancos de pruebas de jailbreak, permitiendo cuantificar el incremento de attack-success rate atribuible al pipeline de compresión.
- Calibración de arneses de evaluación: al ser un artefacto reproducible con semilla fija, resulta útil para validar que un harness de evaluación de seguridad produce resultados estables antes de aplicarlo a modelos desplegables.
- Docencia y formación: ilustrar en un curso de posgrado cómo una transformación aparentemente neutra sobre los pesos (una SVD) puede alterar propiedades de alineación no supervisadas directamente por la función de pérdida.
- Reproducción de estudios: replicar los resultados publicados de la rejilla completa, ya que la model card documenta explícitamente la procedencia, el presupuesto y el número de componentes restaurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, TruthfulQA, tasas de attack-success rate ni métricas de utilidad para este checkpoint concreto, y la búsqueda web asociada no devolvió documentación técnica relevante (únicamente páginas de soporte de Microsoft sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para los pesos, más la memoria de la caché KV; con contexto completo de 4096 tokens y lotes pequeños, un presupuesto práctico de 16-20 GB.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos.
- VRAM estimada en int4: aproximadamente 4-5 GB de pesos.
- GPU profesionales: A100 (40 GB o 80 GB), H100, L40S y equivalentes, sin problemas de ajuste.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB) y, con cuantización de 4 bits, en tarjetas de 8-12 GB como RTX 3060 de 12 GB.
- Opciones de despliegue: al ser un checkpoint en formato `transformers` con safetensors, es compatible con `transformers`, Text Generation Inference (la etiqueta `text-generation-inference` está presente), vLLM y entornos tipo Ollama o llama.cpp previa conversión a GGUF. El tamaño del repositorio (13,5 GB) es coherente con pesos en fp16.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svdsafety_l2_remove40_whiten_base` | 6,74 B (6.738.415.616) | 4096 tokens (heredado del base) | Artefacto de investigación (SVD-LLM), no desplegable | Llama 2 Community License | HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4096 tokens | Modelo de chat alineado con SFT + RLHF | Llama 2 Community License | HuggingFace, ampliamente utilizado |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7,24 B | 32 768 tokens | Modelo instruct de propósito general | Apache 2.0 | HuggingFace |
| `HuggingFaceH4/zephyr-7b-beta` | 7,24 B | 32 768 tokens | Modelo instruct ajustado con DPO | MIT | HuggingFace |

La comparación cuantitativa de rendimiento no es posible: no hay cifras de benchmarks publicadas para el checkpoint de Jeesup. Cualitativamente, la diferencia clave es que las tres alternativas están pensadas para uso real (chat, instrucciones, agentes), mientras que este artefacto existe exclusivamente para medir el efecto de la compresión SVD sobre la seguridad.

## Limitaciones y advertencias

- El propio autor declara que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Varias celdas de la rejilla experimental están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; se debe tratar cada checkpoint como sujeto de prueba y evaluarlo antes de extraer conclusiones.
- La compresión SVD por sí sola incrementa la tasa de éxito de ataques según la model card, por lo que el comportamiento de rechazo puede ser menos fiable que en el modelo original.
- Existe una contradicción no resuelta entre el nombre (`remove40`, que sugiere 40 % de eliminación) y la procedencia declarada (0,00 % de parámetros eliminados, 0 componentes restaurados, fracción resultante 0,0000). El recuento de parámetros en safetensors coincide con el del modelo base sin comprimir, lo que apunta a que este checkpoint es un control sin compresión efectiva; conviene verificarlo antes de usarlo en comparaciones.
- El campo `selection rule` aparece con el valor literal `unknown`, lo que impide saber qué criterio de selección de componentes se aplicó.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo de la familia Llama 2, es susceptible de generar contenido plausible pero falso, especialmente en dominios especializados.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo base está optimizado para inglés y su rendimiento en castellano no está verificado para este checkpoint.
- La licencia Llama 2 Community License no es una licencia de código abierto aprobada por la OSI: impone restricciones de uso (política de uso aceptable), obligaciones de atribución ("Built with Llama 2") y un límite de 700 millones de usuarios mensuales para la exención de licencia comercial.
- El repositorio tiene 0 descargas y 0 likes, y no hay documentación externa, benchmarks ni validación por terceros: la trazabilidad más allá de la model card es nula.
- Uso en producción: desaconsejado. No hay garantías de alineación, no hay evaluación de seguridad publicada y el artefacto está diseñado para experimentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove40_whiten_base
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md`)
- Paper de SVD-LLM y repositorio de referencia del método: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces obtenidos corresponden a páginas de soporte de Microsoft sin relación con el modelo, por lo que no se incluyen.
