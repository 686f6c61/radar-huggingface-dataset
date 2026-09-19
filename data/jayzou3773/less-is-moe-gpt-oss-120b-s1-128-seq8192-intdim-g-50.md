# jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-g-50

## Resumen

Este checkpoint es una versión podada estructuralmente de `openai/gpt-oss-120b`, publicada por el usuario `jayzou3773` bajo el nombre `less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-g-50`. La poda se ha realizado con el método Less-is-MoE basado en la magnitud media absoluta del gradiente (mean-absolute-gradient) y elimina exactamente el 50 % de las neuronas del FFN de los expertos enrutados del modelo original. El resultado es un modelo de mezcla de expertos (MoE) que conserva la topología enrutada del original, pero con anchuras por experto reducidas y almacenadas de forma compacta en `config.json` (variante denominada IntDim-G en la nomenclatura del autor).

El interés de esta ficha es doble. Por un lado, es un artefacto de investigación sobre compresión de MoE: cuantifica cuánto se puede recortar un modelo de 120 mil millones de parámetros sin tocar el enrutador ni la topología, usando solo 128 muestras de calibración. Por otro, es un caso práctico de reducción de huella: el checkpoint resultante declara 59.484.992.832 parámetros totales (unos 59,5 mil millones), frente a los aproximadamente 117 mil millones del modelo base, con un repositorio de 119 GB.

Se trata de un modelo derivado, no de un entrenamiento desde cero: no hay pasos de optimizador, ni RLHF, ni DPO. El checkpoint se publica en BF16, tras dequantizar explícitamente el checkpoint MXFP4 original antes de puntuar y podar. La inferencia requiere el plugin ragged de vLLM del proyecto Less-is-MoE, lo que lo aleja de los runtimes estándar y lo sitúa como material para experimentación más que para despliegue directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE derivado de gpt-oss-120b, con poda estructural del FFN de expertos enrutados (variante IntDim-G; conserva topología MoE enrutada y anchuras compactas por experto en `config.json`) |
| Parametros totales | 59.484.992.832 (≈59,5 mil millones), medidos sobre los safetensors del repositorio |
| Parametros activos | no disponible (el checkpoint no publica el cómputo activo tras la poda) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base `openai/gpt-oss-120b` trabaja con 131.072 tokens |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; el MXFP4 del modelo base se dequantizó a BF16 antes de puntuar y podar. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); tamaño del repositorio 119,0 GB |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-120b`, un transformer con capas de mezcla de expertos en las que solo un subconjunto de expertos se activa por token. La intervención aplicada aquí no modifica el enrutador ni añade capas: poda neuronas del FFN de los expertos enrutados, es decir, reduce la dimensión intermedia de cada experto. La variante IntDim-G mantiene la topología MoE enrutada y guarda las anchuras compactas por experto en `config.json`; la variante IntDim-E, en cambio, usa una anchura de experto uniforme. La poda elimina exactamente el 50 % de las neuronas del FFN de expertos enrutados, seleccionadas por magnitud media absoluta del gradiente.

El proceso de calibración está documentado con precisión: 128 muestras tomadas de `yentinglin/s1K-1.1-trl-format` (revisión `58a01564d278477da20ead1bcf1cde8e31f36251`), con los ajustes del loader `train`, `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncado por prefijo, sin padding y en BF16. No se ejecuta ningún paso de optimizador: es poda pura sobre pesos preentrenados, sin fine-tuning posterior. La selección de filas fuente queda fijada por el hash `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784` y el fichero de tokens específico del modelo por el hash `1d487883f20fcbc52d7642695c87313d2ea2e9c53c193a3ed7ad6eac8f9d272a`. Los tensores de tokens de calibración están publicados aparte, en `jayzou3773/less-is-moe-s1-calibration-128-seq8192` (revisión `678b4e666183e16ec00376960df03b6381632ed1`), y los metadatos de exportación y de equivalencia de máscara cero en `experiment-export.json`.

La innovación técnica reseñable es doble: el criterio de poda (gradiente medio absoluto por neurona, aplicado al FFN de expertos) y el soporte de ejecución, ya que el modelo conserva anchuras no uniformes por experto y necesita un plugin ragged de vLLM del proyecto Less-is-MoE (imagen GPU unificada) para poder inferir. La model card advierte explícitamente de este requisito.

## Capacidades

Las capacidades funcionales descritas a continuación corresponden al modelo base `openai/gpt-oss-120b` y no han sido revalidadas por el autor tras la poda; deben tratarse como expectativas, no como garantías.

- Generación de texto y conversación multiturno, con la plantilla de chat y el formato de mensajes del modelo base.
- Razonamiento y matemáticas, con el esquema de esfuerzo de razonamiento del modelo base.
- Generación de código, apoyada en la exposición de herramientas del formato original.
- Tool calling o function calling: no documentado específicamente para este checkpoint; el modelo base sí lo soporta.
- Uso en agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingües: no documentadas en la model card de este checkpoint.
- Capacidad especial: retención de la topología MoE enrutada tras la poda, con anchuras por experto no uniformes declaradas en `config.json`, lo que habilita experimentos de poda no uniforme.
- Modo thinking, visión o audio: no disponible para este checkpoint.

## Casos de uso

- Investigación sobre poda de MoE: el checkpoint permite reproducir el pipeline Less-is-MoE y medir la degradación real al recortar el 50 % de las neuronas del FFN de expertos enrutados, usando los hashes de selección y los tensores de calibración publicados como referencia exacta.
- Comparación de estrategias de compresión: al coexistir variantes IntDim-E, IntDim-L e IntDim-G en la familia, sirve para contrastar anchura uniforme frente a anchura compacta por experto bajo el mismo presupuesto de parámetros.
- Reducción de coste de servicio: con 59,5 mil millones de parámetros totales frente a los ~117 mil millones del original, el checkpoint reduce a la mitad el peso en disco (119 GB) y abre la puerta a servir un MoE grande en hardware de una sola máquina de gama alta.
- Base para fine-tuning posterior: al no haberse aplicado ningún paso de optimizador, es un punto de partida limpio para SFT o DPO específicos de dominio antes de evaluar si la poda destruyó capacidades críticas.
- Validación de infraestructura de inferencia: sirve para probar el plugin ragged de vLLM y el manejo de anchuras de experto no uniformes en un clúster, comparando throughput y latencia frente al modelo denso equivalente.
- Generación de texto y asistentes conversacionales en entornos controlados, siempre que el plugin requerido esté desplegado y se acepte que el rendimiento no está validado por benchmarks públicos.
- Análisis de sensibilidad de calibración: con solo 128 muestras de `s1K-1.1-trl-format` y `seq_length=8192`, es un caso de estudio sobre cuánta señal de calibración necesita realmente un criterio de gradiente para podar de forma estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: unos 119 GB solo para pesos (59,5 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 60 GB de pesos, más overhead; no se publican pesos ya cuantizados, habría que cuantizarlos.
- VRAM estimada en cuantización de 4 bits: en torno a 30-35 GB de pesos, más overhead; de nuevo, requiere cuantización manual no documentada por el autor.
- GPU recomendadas: para BF16, aceleradores con 141 GB o 192 GB de memoria (H200, B200) o reparto multi-GPU en A100 80 GB y H100 80 GB. Para 4 bits, una RTX 4090 de 24 GB queda por debajo del umbral de pesos y requeriría cuantización adicional o descarga a CPU; una RTX 6000 Ada o L40S de 48 GB es el mínimo realista.
- Compatibilidad con GPU de consumo: en BF16 no cabe en ninguna GPU de consumo. Con cuantización agresiva (4 bits) y offload sería viable en equipos con 32-48 GB de memoria, pero no hay recetas publicadas.
- Opciones de despliegue: la model card indica que la inferencia requiere el plugin ragged de vLLM del proyecto Less-is-MoE (imagen GPU unificada). No se documenta compatibilidad con llama.cpp, Ollama, TGI ni transformers estándar, y el formato de expertos de anchura no uniforme hace improbable que funcionen sin adaptación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-g-50` | 59,5 mil millones | no disponible (base: 131.072) | apache-2.0 | HuggingFace, requiere plugin vLLM específico | 50 % de neuronas del FFN de expertos podadas; sin benchmarks publicados |
| `openai/gpt-oss-120b` (modelo base) | ~117 mil millones | 131.072 tokens | apache-2.0 | HuggingFace, soporte amplio en vLLM y ecosistema | Modelo de referencia; sin poda |
| `openai/gpt-oss-20b` | ~21 mil millones | 131.072 tokens | apache-2.0 | HuggingFace, ampliamente soportado | Alternativa si la prioridad es desplegar en hardware pequeño en lugar de conservar capacidad de 120B |

Los datos del modelo base y de `gpt-oss-20b` son los publicados por OpenAI para esos modelos y no aparecen en la información proporcionada para este checkpoint. No se dispone de comparativas de rendimiento medidas entre las tres opciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada que mida la pérdida de calidad tras eliminar el 50 % de las neuronas del FFN de expertos enrutados. Asumir que el modelo rinde como el original es infundado.
- Requisito de inferencia no estándar: hace falta el plugin ragged de vLLM del proyecto Less-is-MoE. Esto limita el despliegue a entornos controlados por el propio autor y complica la integración con orquestadores habituales.
- Riesgo de alucinación: no cuantificado para este checkpoint ni documentado en la model card.
- Sesgos conocidos: no documentados. Al no haber fine-tuning ni evaluación, los sesgos heredados de `openai/gpt-oss-120b` se mantienen sin mitigación conocida.
- Limitaciones de contexto e idioma: no declaradas para el checkpoint. La ventana efectiva tras la poda no está verificada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 18 de septiembre de 2026. No hay evidencia de uso en producción por terceros.
- Licencia: apache-2.0 permite uso comercial, pero la licencia del artefacto derivado no exime de verificar los términos aplicables al modelo base ni de asumir el riesgo técnico del plugin de inferencia.
- Sin pasos de optimizador ni fine-tuning de recuperación: cualquier caso de uso realista debería pasar por una evaluación propia antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-g-50
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de calibración de tokens del autor: https://huggingface.co/datasets/jayzou3773/less-is-moe-s1-calibration-128-seq8192
- Dataset de calibración de origen: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format
- Metadatos de exportación: `experiment-export.json` dentro del repositorio del modelo
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, al método Less-is-MoE ni a sus autores; los resultados devueltos no guardan relación con el checkpoint.
