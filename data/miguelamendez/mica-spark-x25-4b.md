# miguelamendez/mica-spark-x25-4b

## Resumen

Mica Spark X2.5 4B es un paquete de artefactos de inferencia (repo `miguelamendez/mica-spark-x25-4b`) construido sobre el modelo `XHToken/Spark-X2.5-4B`, fijado a la revision `0bcb35678590218655dff3765b9e61c83b35e9c4`. No se trata de un entrenamiento nuevo: el autor publica pesos cuantizados y validados para ejecucion local en MLX y GGUF, manteniendo la licencia Apache-2.0 del modelo original.

El modelo subyacente es un transformer hibrido de 4.112.079.360 parametros (unos 4,11 B), con una arquitectura de atencion que combina una capa de atencion completa con tres capas de ventana deslizante (patron 1:3). Declara una longitud de contexto arquitectonica y de entrenamiento de 1.048.576 tokens (1 M), con semantica de entrada mas salida, y un preentrenamiento de aproximadamente 20 billones de tokens.

Su relevancia actual esta en dos ejes: por un lado, ofrece contexto de 1 M tokens en una clase de 4 B que cabe en memoria de consumo (2,403 GiB medidos en Q4 sobre Apple M4); por otro, incorpora un modo de razonamiento (`thinking`) activado por defecto y desactivable desde la plantilla de chat. La contrapartida es que no existen aun resultados de benchmarks publicados ni artefactos de produccion para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion mixta: 1 capa de atencion completa por cada 3 capas de ventana deslizante |
| Parametros totales | 4.112.079.360 (~4,11 B), dato real de safetensors |
| Parametros activos | no aplica; la documentacion no describe el modelo como MoE |
| Longitud de contexto | 1.048.576 tokens (maximo arquitectonico y de entrenamiento; semantica entrada + salida) |
| Tipos de cuantizacion | MLX affine Q4 y Q8 (group size 64); GGUF Q4_K_M y Q8_0; GPTQ W4A16 y W8A16 group-128 (candidatos estructurales, no de produccion) |
| Idiomas soportados | multilingue; el autor original declara mas de 200 idiomas |
| Licencia | Apache-2.0 (modelo origen y derivados) |
| Formato de pesos | safetensors (origen), MLX (q4/q8), GGUF (Q4_K_M, Q8_0) |
| Modelo base | XHToken/Spark-X2.5-4B |
| Revision fijada | 0bcb35678590218655dff3765b9e61c83b35e9c4 |
| Preentrenamiento declarado | ~20 billones de tokens |
| Tamano del repositorio | 13,7 GB |
| Maximo de entrada aislado | no disponible (no debe inferirse del total de contexto) |
| Maximo de salida aislado | no disponible (el ejemplo upstream de 131.072 tokens no se trata como limite duro) |
| Modo de razonamiento | soportado, activado por defecto; la plantilla admite `enable_thinking=false` |
| Niveles de esfuerzo de razonamiento | no disponible; Mica usa presupuestos de tokens, no semantica low/medium/high |
| Biblioteca declarada | transformers |
| Tarea | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con atencion mixta. Por cada cuatro capas, una utiliza atencion completa y tres emplean ventana deslizante; el tamano de esa ventana no se publica. Este diseno reduce el coste del cache KV en secuencias largas, lo que hace viable sostener un presupuesto de contexto de 1.048.576 tokens sin que el cache crezca con el mismo factor que en un transformer de atencion completa pura. El preentrenamiento declarado asciende a aproximadamente 20 billones de tokens y el autor original describe una etapa especifica de contexto largo con secuencias que se extienden hasta 1 M de tokens. Las categorias de datos de entrenamiento se describen solo a alto nivel; no se publica un inventario detallado del dataset.

No hay informacion disponible sobre uso de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento, ni sobre composicion linguistica exacta del corpus. Tampoco se detalla el numero de capas, dimensiones ocultas, numero de cabezas o tamano de la ventana deslizante, lo que impide calcular el coste exacto del cache KV. Si esta documentado que la precision de los pesos y la precision del cache KV son independientes: un perfil puede combinar pesos Q4 con cache KV en Q8. En el plano de cuantizacion, AutoRound 0.14.2 no pudo calibrar la mascara de atencion tetradimensional personalizada de esta revision, por lo que la ruta Q4 activa paso a ser GPTQ; los embeddings y el `lm_head` se mantienen a la precision del modelo origen.

## Capacidades

- Generacion de texto conversacional en modo multilingue, con mas de 200 idiomas declarados por el autor original.
- Modo de razonamiento explicito (`thinking`) activado por defecto y desactivable mediante la plantilla de chat con `enable_thinking=false`.
- Presupuesto de tokens de razonamiento configurable por perfil, en lugar de niveles de esfuerzo predefinidos.
- Procesamiento de contextos muy largos: la configuracion fijada declara 1.048.576 tokens de ventana arquitectonica, con entradas y salidas dentro del mismo presupuesto.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Ejecucion local en Apple Silicon via MLX y en Metal via GGUF.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el modo `thinking` es el unico mecanismo de razonamiento documentado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Analisis de bases de codigo completas: con hasta 1.048.576 tokens de contexto, el modelo puede recibir un repositorio mediano junto con su documentacion y responder preguntas de arquitectura o localizar dependencias cruzadas sin trocear el contenido. La arquitectura hibrida con ventana deslizante reduce el coste del cache KV frente a un modelo de atencion completa equivalente.
- Atencion al cliente multilingue multi-turno: el soporte declarado de mas de 200 idiomas y la ventana de 1 M tokens permiten mantener un historial de conversacion muy extenso sin resumir, util en entornos de soporte tecnico con sesiones largas.
- Asistentes locales en portatiles Apple Silicon: los perfiles MLX Q4 ocupan 2,403 GiB de pico medido en M4 y los Q8, 4,453 GiB, lo que permite ejecutar el modelo integramente en memoria unificada de un Mac de 16 GB sin GPU dedicada.
- Procesamiento de expedientes normativos o contratos extensos: lectura completa de pliegos, polizas o normativa de cientos de miles de tokens, con el modo `thinking` activado para tareas de extraccion y comparacion de clausulas.
- Razonamiento asistido con traza explicita: cuando se necesita auditar como se llega a una conclusion, el modo `thinking` por defecto expone el proceso antes de la respuesta final; en perfiles de baja latencia se puede desactivar con `enable_thinking=false`.
- Despliegue sin conectividad con llama.cpp u Ollama: los artefactos GGUF Q4_K_M y Q8_0 han superado inferencia real en Metal, lo que habilita escenarios de borde o entornos aislados donde no se puede llamar a una API.
- Generacion y revision de codigo en pipelines internos: es un uso plausible por el contexto largo, pero no esta respaldado por ningun benchmark publicado en la informacion disponible, por lo que requeriria validacion propia antes de llevarlo a produccion.
- Etiquetado y sintesis de datos a gran escala: el coste de memoria reducido en Q4 permite ejecutar varias instancias en un solo nodo, aunque la ausencia de benchmarks impide estimar la calidad resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete Mica no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y los resultados de la busqueda web no aportan datos utilizables sobre el modelo original ni sobre sus derivados.

El unico dato de rendimiento cuantitativo documentado es de memoria, no de calidad: en el host Apple M4, el pico de memoria medido fue de 2,403 GiB para MLX Q4 y 4,453 GiB para MLX Q8 en los casos de prueba registrados. No hay datos de latencia, tokens por segundo ni throughput.

## Requisitos de hardware

- Memoria medida (Apple M4, MLX): 2,403 GiB de pico para Q4 y 4,453 GiB para Q8 en los casos de prueba registrados.
- Estimaciones derivadas del recuento real de parametros (4.112.079.360), sin incluir cache KV ni overhead del runtime: ~8,2 GB en BF16/FP16, ~4,1 GB en 8 bits y ~2,1 GB en 4 bits.
- Cache KV: no cuantificado en la informacion disponible. Alcanzar 1.048.576 tokens exige memoria adicional muy superior al peso de los pesos; las tres capas de ventana deslizante por cada cuatro limitan ese crecimiento, pero el tamano de ventana no se publica.
- GPU de consumo: los perfiles Q4 y Q8 caben en GPUs de 8 a 16 GB (por ejemplo, RTX 4070/4080/4090 en cuantizacion baja), siempre que se ajuste el presupuesto de contexto para no desbordar la memoria del cache KV.
- Memoria unificada Apple Silicon: validado en M4 con MLX y GGUF sobre Metal.
- vLLM: no hay artefactos publicados. Los candidatos estructurales GPTQ W4A16 y W8A16 group-128 serializan, recargan y generan con batch size 2 bajo el limite de 16 GiB, pero no son artefactos de produccion. El sondeo de vLLM-Metal en Apple M4 fallo durante el parseo de la configuracion personalizada antes de cargar el modelo, y la arquitectura no figura en la tabla de soporte del plugin.
- Formatos Blackwell: excluidos explicitamente de la matriz de cuantizacion de este repositorio.
- Opciones de despliegue viables segun la documentacion: MLX (macOS/Apple Silicon), llama.cpp u Ollama mediante GGUF, y transformers con safetensors.
- Decodificacion especulativa: no hay checkpoint nativo MTP ni DFlash para este objetivo; el hermano de 1,7 B fallo la puerta de especulacion clasica sin perdida y no se acepta como drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento publico general, no de la busqueda web realizada (que no devolvio resultados relevantes), por lo que conviene verificarlos en sus fichas oficiales. La columna de rendimiento queda vacia porque la informacion proporcionada no incluye benchmarks de ninguno de ellos.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| Spark-X2.5-4B (Mica Q4/Q8) | 4,11 B | 1.048.576 tokens | Apache-2.0 | no disponible |
| Qwen3-4B | ~4 B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | no disponible |
| Llama 3.2 3B | 3,2 B | 131.072 tokens | Llama 3.2 Community License | no disponible |
| Gemma 3 4B | ~4 B | 131.072 tokens | Gemma Terms of Use | no disponible |

El diferencial estructural de Spark-X2.5-4B frente a esas alternativas es la ventana declarada de 1 M tokens combinada con una clase de 4 B y atencion hibrida, ademas de publicar artefactos MLX y GGUF listos para ejecucion local. En contra, carece de benchmarks y de soporte en vLLM, mientras que las alternativas citadas cuentan con ecosistemas de despliegue mucho mas extendidos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en razonamiento, codigo, matematicas o multilingue para este modelo ni para su base.
- La afirmacion de 1 M tokens de contexto no ha sido validada localmente por el autor del paquete. Hasta que pase la matriz de contexto largo, los perfiles Mica deben usar su propio limite certificado y avisar cuando se supere la entrada mas larga probada localmente.
- Los perfiles incumplen sus propias reglas de validacion si se excede el limite probado: en modo experimental genera aviso, en modo certificado genera error, y superar el total arquitectonico es siempre error.
- Riesgo de alucinacion no cuantificado; no se documentan evaluaciones de fidelidad ni de tasa de error factual.
- Sesgos conocidos: no disponible. No se publica analisis de sesgo ni composicion del dataset de preentrenamiento.
- Idiomas: se declaran mas de 200, pero no se detalla el reparto de tokens por idioma ni la calidad relativa en cada uno.
- Tool calling, function calling y uso agentico no estan documentados; asumir su disponibilidad seria una extrapolacion no respaldada.
- Despliegue en produccion limitado: no hay artefactos vLLM, la arquitectura personalizada no esta en la tabla de soporte del plugin y AutoRound no puede calibrar su mascara de atencion 4D. Solo GPTQ queda como ruta Q4 activa, y sus candidatos actuales se basan en un fixture local diminuto, por lo que la calibracion de 512 muestras y la comparacion contra BF16 son obligatorias antes de considerarlos validos.
- La cuantizacion Q4 de GPTQ muestra un error de calibracion mucho mas alto que Q8, lo que desaconseja su uso en tareas sensibles a la precision.
- El presupuesto de razonamiento consume tokens de salida: activar `thinking` por defecto reduce el espacio disponible para la respuesta visible dentro del limite de contexto.
- Licencia Apache-2.0 en origen y derivados, lo que permite uso comercial, pero la responsabilidad de cumplir las condiciones de modelos o datasets de terceros recae en el usuario.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- No hay checkpoint nativo MTP ni DFlash, y el modelo hermano de 1,7 B no sirve como drafter de decodificacion especulativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/miguelamendez/mica-spark-x25-4b
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Revision fijada: 0bcb35678590218655dff3765b9e61c83b35e9c4
- Registros de validacion citados en la model card (rutas relativas del repositorio):
  - `docs/validation/spark-x25-4b-mlx-q4.md`
  - `docs/validation/spark-x25-4b-mlx-q8.md`
  - `docs/validation/spark-x25-4b-mlx-classic-speculative.md`
  - `docs/validation/spark-vllm-quantization-macos.md`
  - `docs/validation/gguf-runtime-macos-metal.md`
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron unicamente paginas de ayuda generica de servicios de cuentas y navegacion, sin relacion con el modelo, su paper, su repositorio de codigo ni demos.
