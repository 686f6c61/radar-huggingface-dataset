# RL-Forgetting-Experiments-3/code-sft-20261027-llama3b-code-shuffled

## Resumen

`code-sft-20261027-llama3b-code-shuffled` es un checkpoint de ajuste supervisado (SFT) sobre un modelo derivado de Llama 3.2 3B, publicado por la organización `RL-Forgetting-Experiments-3` dentro de una línea de experimentos sobre olvido catastrófico en ajuste fino. No se trata de un modelo de propósito general listo para producción, sino de un artefacto de investigación: una de las "armas" (arms) de línea base de SFT sobre código que faltaban en una entrega anterior de 13 variantes. La model card lo declara explícitamente como entrega incremental y advierte de que las ejecuciones incompletas no deben interpretarse como estudios cerrados.

El repositorio ocupa 128,5 GB y contiene múltiples checkpoints distribuidos en `runs/checkpoints/step_N/model` y modelos finales en `runs/final`, lo que explica un tamaño muy superior al de un modelo denso de ~3.000 millones de parámetros. Los pesos se publican en safetensors y deben cargarse indicando la subcarpeta correspondiente, no como un repositorio monolítico.

Su relevancia es metodológica más que de producto: sirve como referencia para medir cuánto olvida un modelo de código tras SFT filtrado, y para reproducir comparaciones entre variantes con datos barajados (`code-shuffled`) y sin barajar. La información publicada no incluye resultados de evaluación, composición del dataset ni número de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Llama 3.2 3B (no se detalla en la model card) |
| Parametros totales | ~3.000 millones (heredados del modelo base Llama 3.2 3B; no verificado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | `other`; al ser derivado de Llama, sujeto a Llama 3.2 Community License y Acceptable Use Policy |
| Formato de pesos | safetensors, en subcarpetas `runs/checkpoints/step_N/model` y `runs/final` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el identificador y por la referencia explícita a `meta-llama/Llama-3.2-3B-Instruct`, se trata de un transformer decoder-only de la familia Llama 3.2 con aproximadamente 3.000 millones de parámetros, sometido a un ajuste supervisado (SFT) sobre un corpus de código. El sufijo `code-shuffled` apunta a una variante en la que el orden de las muestras del corpus de código se ha barajado, presumiblemente para aislar el efecto del orden de los datos en el olvido de capacidades previas; la model card no confirma esta interpretación ni detalla la composición del dataset.

No se especifican el número de tokens de entrenamiento, la mezcla de datos, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio forma parte de la serie etiquetada `rl-forgetting` y `filtered-sft`, y la documentación remite a un `delivery_manifest.json` del dataset para verificar unidades de subida y hashes. Los checkpoints intermedios (`step_N`) permiten analizar la evolución del olvido a lo largo del entrenamiento, algo que un único modelo final no permitiría.

## Capacidades

- Generación de código: el ajuste se realiza sobre un corpus de código, por lo que la capacidad principal esperada es la síntesis y compleción de fragmentos de programación.
- Ajuste de instrucciones heredado: al partir de una variante instruct de Llama 3.2, se presume capacidad de seguir instrucciones, aunque no se documenta su conservación tras el SFT.
- Análisis de olvido catastrófico: los checkpoints intermedios permiten evaluar la degradación de capacidades generales a medida que avanza el entrenamiento.
- Reproducibilidad experimental: sirve como línea base comparable frente a otras variantes de la serie (barajadas y no barajadas).
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Estudio de olvido catastrófico: comparar las métricas de este checkpoint con las de la variante no barajada y con el modelo base para cuantificar cuánta capacidad general se pierde tras el SFT de código.
- Línea base en experimentos de SFT filtrado: usar `runs/final` como referencia fija en una batería de evaluaciones reproducibles, dejando constancia del hash del checkpoint empleado.
- Análisis de la influencia del orden de datos: el sufijo `code-shuffled` permite contrastar si barajar el corpus altera la retención de conocimiento y el rendimiento en código.
- Generación de código asistida en entorno controlado: prototipos de autocompletado o generación de funciones en un entorno de investigación, nunca en producción sin evaluación previa.
- Punto de partida para ajuste posterior: fine-tuning adicional sobre un dominio concreto (por ejemplo, un lenguaje o framework específico) partiendo de `runs/final`.
- Docencia y formación en ingeniería de ML: ilustrar cómo se estructura un repositorio multi-checkpoint, cómo se cargan subcarpetas concretas y cómo se documentan entregas incrementales.
- Auditoría de licencias en cadenas de derivados: caso práctico para revisar cómo se propagan las restricciones de Llama 3.2 Community License en modelos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de evaluaciones de olvido, y el repositorio no adjunta informes de evaluación. Cualquier cifra que se cite para este checkpoint debe obtenerse ejecutando la evaluación de forma local.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6-7 GB para los pesos (~3.000 millones de parámetros a 2 bytes) más overhead de activaciones y KV cache.
- VRAM estimada en 8 bits: alrededor de 3,5-4 GB; en 4 bits: alrededor de 2-2,5 GB. Estas cifras son estimaciones por tamaño, no medidas publicadas.
- GPU recomendadas: A100 o H100 para evaluaciones por lotes a gran escala; RTX 4090, RTX 3090 o RTX 4060 Ti 16 GB para inferencia interactiva.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante); en cuantización de 4 bits cabe en 4-6 GB.
- Opciones de despliegue: `transformers` cargando la subcarpeta concreta del checkpoint, vLLM o TGI para servir el modelo, y llama.cpp u Ollama previa conversión a GGUF (no se publican GGUF en el repositorio).
- Latencia y throughput: no disponible; no se han publicado mediciones.
- Almacenamiento: el repositorio completo ocupa 128,5 GB, por lo que conviene descargar solo la subcarpeta necesaria (`runs/final` o un `step_N` concreto) mediante descarga selectiva de ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| `code-sft-20261027-llama3b-code-shuffled` | ~3B | no disponible | `other` + Llama 3.2 Community License | HuggingFace (0 descargas, 0 likes) | no disponible |
| Llama 3.2 3B Instruct (modelo base de referencia) | ~3B | no disponible en la informacion proporcionada | Llama 3.2 Community License | HuggingFace (enlace en la model card) | no disponible |
| Qwen2.5-Coder-3B | ~3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| Otras variantes de la serie `RL-Forgetting-Experiments-3` | ~3B | no disponible | `other` | mismo repositorio del autor | no disponible |

La comparación relevante no es de rendimiento absoluto, sino experimental: este checkpoint solo tiene sentido frente a las otras arms de la misma serie (variantes barajadas y no barajadas, con y sin filtrado) y frente al modelo base sin ajustar. No se dispone de datos publicados que permitan situarlo frente a modelos de código de 3B de otros fabricantes.

## Limitaciones y advertencias

- Artefacto de investigación, no producto: la model card advierte que las ejecuciones incompletas no deben tratarse como estudios cerrados y remite al `delivery_manifest.json` para verificar qué se subió realmente.
- Ausencia total de evaluación: no hay benchmarks, ni informe de olvido, ni métricas de calidad de código, por lo que se desconoce el rendimiento real del checkpoint.
- Riesgo de olvido catastrófico: la propia etiqueta `rl-forgetting` indica que el proceso de SFT puede haber degradado capacidades generales del modelo base; no debe asumirse que conserva el comportamiento de Llama 3.2 3B Instruct.
- Licencia restrictiva y encadenada: la licencia `other` remite a la Llama 3.2 Community License y su Acceptable Use Policy, con obligaciones de atribución y restricciones de uso; no se conceden derechos adicionales sobre el modelo base.
- Uso comercial no verificado: al no haber una licencia permisiva explícita ni documentación sobre redistribución, no se recomienda su uso comercial sin revisión legal.
- Idiomas no declarados: se desconoce si el ajuste ha preservado el multilingüismo del modelo base.
- Contexto no documentado: no se especifica la longitud de ventana soportada ni si el SFT la modifica.
- Riesgo de alucinación: inherente a los modelos de 3B ajustados solo con SFT, sin datos de preferencias ni verificación factual.
- Carga no trivial: el repositorio contiene múltiples checkpoints y es necesario indicar la subcarpeta correcta; cargar la raíz como un único modelo fallará.
- Sesgos: no documentados por el autor; se heredan los del corpus de código y los del modelo base, sin filtrado declarado.
- Cero tracción comunitaria: 0 descargas y 0 likes, sin issues ni discusión que permitan contrastar experiencias de uso.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces devueltos pertenecen a medios de prensa regional y a un videojuego, y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-20261027-llama3b-code-shuffled
- Modelo base referenciado (Llama 3.2 3B Instruct): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 y política de uso aceptable: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct (referencia indicada en la model card)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
