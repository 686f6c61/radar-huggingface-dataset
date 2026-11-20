# open-athena/snowball-67b-a2b-base-262k-qk175

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por open-athena dentro del ecosistema Marin. Se trata de una exportación en BF16 del paso 157.000 de un experimento de comparación de contexto largo denominado Snowball, cuyo objetivo es evaluar el efecto de distintas configuraciones de atención (en concreto el multiplicador QK) sobre la capacidad del modelo de manejar secuencias muy extensas. El modelo cuenta con 67.078.882.816 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que lo sitúa en una categoría de eficiencia computacional interesante para despliegues con requisitos de contexto extremadamente largos.

La relevancia de esta ficha radica en su contexto de 262.144 tokens, una ventana que lo posiciona entre los modelos de contexto largo más ambiciosos de su categoría. El entrenamiento extendió el contexto desde el paso 156.000 hasta el 157.000 aplicando un multiplicador QK de 1,75, manteniendo sin cambios el muestreo de documentos de contexto largo. Es un modelo base, no ajustado por instrucciones, por lo que su uso previsto es la generación de texto por completación y no el diálogo conversacional directo.

La arquitectura se apoya en el operador `GrugMoeForCausalLM` (tag `grug_moe`), registrado únicamente en el fork de vLLM mantenido por la comunidad Marin. Esto implica que el despliegue estándar con vLLM, TGI o llama.cpp no es posible sin adaptaciones, y que la configuración de referencia utiliza ocho GPU H100 con paralelismo de datos 8 y paralelismo de expertos. El modelo se distribuye con licencia OpenMDW 1.1 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GrugMoeForCausalLM / grug_moe), 26 capas, 256 expertos con 4 seleccionados por token |
| Parametros totales | 67.078.882.816 |
| Parametros activos | Aproximadamente 2.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (exportación en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Safetensors (BF16) |
| Vocabulario | 128.256 tokens |
| Cabezas KV | 5 |
| Repositorio | 134,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con 26 capas y 256 expertos, de los cuales se activan cuatro por token, dando lugar a unos 2.000 millones de parámetros activos sobre un total de 67.000 millones. El vocabulario es de 128.256 tokens y la atención utiliza cinco cabezas KV, un detalle poco habitual que condiciona la estrategia de paralelismo en inferencia (el autor indica que se emplea paralelismo de expertos precisamente por este motivo). El checkpoint corresponde al paso 157.000 de un experimento de comparación de contexto largo; entre los pasos 156.000 y 157.000 se extendió el contexto hasta 262.144 tokens aplicando un multiplicador QK de 1,75, sin modificar el muestreo de documentos largos. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no las haya.

La innovación técnica principal es el ajuste del multiplicador QK como palanca para estabilizar la atención en ventanas de 262K tokens, un enfoque que el equipo compara con una línea base de QK 1,57. La exportación aplica los sesgos de router QB pendientes antes de la conversión y excluye el estado del optimizador. El manifiesto de exportación (`export-manifest.json`) registra el tamaño y el checksum SHA-256 de cada fichero, la revisión del exportador y la revisión verificada de los pesos en el Hub. El autor advierte explícitamente de que esta subida valida nombres de tensores, dtype BF16, configuración, tamaños y checksums, pero no se ha ejecutado una nueva prueba de generación ni de paridad numérica para esta exportación concreta.

## Capacidades

- Generación de texto por completación: el modelo es un modelo base, por lo que su interfaz natural es la continuación de texto, no el diálogo con instrucciones.
- Razonamiento y conocimiento general: al tratarse de un modelo de 67B totales con 2B activos, conserva la capacidad de conocimiento factual típica de su escala, aunque no se han publicado evaluaciones en la información disponible.
- Contexto largo: ventana de 262.144 tokens, adecuada para tareas de recuperación y razonamiento sobre documentos extensos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible; no se documenta soporte nativo ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; podría emularse mediante prompting, pero sin garantías.
- Modo thinking: no disponible.
- Visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales completos, especificaciones o bases de código de gran tamaño en una sola pasada y generar resúmenes o continuaciones coherentes con el material.
- Investigación sobre contexto largo: es un artefacto pensado para estudiar el efecto del multiplicador QK en la estabilidad de la atención; sirve como línea base experimental para comparar configuraciones de QK 1,57 frente a 1,75 en tareas de recuperación en contexto.
- Generación de código a partir de repositorios completos: al poder procesar decenas de miles de líneas en una única ventana, resulta útil para tareas de completación condicionada por un contexto amplio de código, siempre que se acepte su naturaleza de modelo base sin instrucciones.
- Completación de textos largos y estructurados: informes, artículos o documentación donde se requiere mantener coherencia a lo largo de decenas de miles de tokens, aprovechando la ventana extendida.
- Evaluación comparativa de arquitecturas MoE: con 256 expertos y 4 activos, es un banco de pruebas para medir el equilibrio entre rendimiento y coste computacional en inferencia con paralelismo de expertos.
- Reproducción de experimentos de la comunidad Marin: investigadores que quieran replicar o extender los resultados del experimento Snowball pueden usar este checkpoint como punto de partida verificado mediante checksums.
- Fine-tuning supervisado para tareas específicas: al ser un modelo base con licencia OpenMDW 1.1, puede servir como inicialización para ajustes posteriores en dominios concretos, aunque el coste de infraestructura es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia un registro de servicio y evaluación (`marin-community/marin#8702`) para las exportaciones base con QK 1,57 y 1,75, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de contexto largo en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 134,2 GB, por lo que se necesitan al menos 8 GPU de 80 GB (H100 o A100) para alojar los pesos sin cuantización, tal como indica la configuración de referencia del autor.
- GPU recomendadas: ocho H100, con paralelismo de datos 8 y paralelismo de expertos; la configuración documentada usa tensor parallelism 1.
- GPU de consumo: no cabe en GPU de consumo (RTX 4090, 24 GB) en BF16; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: exclusivamente el fork de vLLM de Marin (`marin-community/vllm`), que registra `GrugMoeForCausalLM` / `grug_moe`. No hay soporte documentado en llama.cpp, Ollama, TGI ni vLLM estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball 67B-A2B | 67,1B | ~2B | 262.144 | OpenMDW 1.1 | Hugging Face, requiere fork de vLLM |
| Modelos MoE de referencia de la misma escala | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable. La comparación cualitativa más directa sería con otros modelos MoE de aproximadamente 60-70B totales y pocos miles de millones de parámetros activos, pero no se aportan cifras que permitan contrastarlos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: el template de chat incluido en el tokenizer no implica entrenamiento conversacional; debe usarse para completaciones.
- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la ausencia de evaluaciones publicadas que permitan calibrar su fiabilidad.
- No se han ejecutado pruebas de generación ni de paridad numérica para esta exportación concreta; la validación se limita a nombres de tensores, dtype, configuración, tamaños y checksums.
- El despliegue requiere un fork específico de vLLM, lo que limita la portabilidad y añade riesgo de mantenimiento.
- El requisito de ocho GPU H100 hace que el coste de inferencia sea elevado pese a los 2B parámetros activos.
- No se documentan sesgos conocidos, pero al no haber evaluación publicada no puede descartarse la presencia de sesgos propios del corpus de entrenamiento, cuya composición no se detalla.
- La licencia OpenMDW 1.1 debe revisarse antes de un uso comercial; la model card no detalla restricciones adicionales más allá de la obligación de cumplir la legislación aplicable.
- La ventana de 262K tokens puede degradar la calidad en posiciones intermedias del contexto; no se aportan datos de la curva de rendimiento por longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175
- Fork de vLLM de Marin: https://github.com/marin-community/vllm
- Experimento de comparación de contexto largo (Snowball): https://github.com/marin-community/marin/issues/8977
- Registro de servicio y evaluación (QK 1,57 y 1,75): https://github.com/marin-community/marin/issues/8702
