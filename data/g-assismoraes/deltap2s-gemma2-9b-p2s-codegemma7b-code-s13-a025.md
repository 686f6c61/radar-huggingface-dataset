# g-assismoraes/DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13-a025

## Resumen

DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13-a025 es un checkpoint fusionado publicado por el usuario g-assismoraes en HuggingFace. Segun su model card, se trata de un "merged checkpoint produced by the family-aware Delta-P2S experiment package", con una base de entrenamiento identificada como `./runs/codegemma7b_to_gemma2_9b_S13_untie_a025/init/p2s`. El nombre del repositorio sugiere una operacion de fusion (merge) en espacio de parametros entre CodeGemma 7B y Gemma 2 9B, con un coeficiente alpha de 0,25 y algun tipo de tratamiento de embeddings no compartidos ("untie"), aunque el autor no documenta el procedimiento.

El checkpoint resultante tiene 10.159.209.984 parametros segun los safetensors, un tamano superior al de Gemma 2 9B (aproximadamente 9,24 mil millones) y muy superior al de CodeGemma 7B (aproximadamente 8,5 mil millones). Esa diferencia es compatible con un desanclaje de la matriz de embeddings respecto de la cabeza de salida, que en la arquitectura Gemma 2 esta atada; se trata de una inferencia a partir del nombre y del recuento de parametros, no de un dato confirmado en la informacion disponible.

El interes de esta publicacion es acotado pero real para quien investiga tecnicas de fusion de modelos: prueba si es posible inyectar capacidades de generacion de codigo de CodeGemma en un modelo generalista como Gemma 2 9B mediante un merge en espacio de parametros en lugar de un ajuste fino. No obstante, el repositorio no incluye licencia declarada, idiomas, evaluaciones ni guia de uso, y registra cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en la model card; el checkpoint se construye sobre la familia Gemma 2 (transformer decoder-only con atencion alterna local/global, GQA y logit soft-capping), segun el nombre del repositorio |
| Parametros totales | 10.159.209.984 (recuento real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible. La arquitectura base Gemma 2 declara 8192 tokens; no se confirma que el merge la preserve ni que se haya extendido |
| Tipos de cuantizacion | No disponible: no se publican versiones GGUF, AWQ, GPTQ ni FP8. El repositorio solo contiene pesos safetensors (20,4 GB), presumiblemente en bf16/fp16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia; los modelos base Gemma 2 y CodeGemma se distribuyen bajo los Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento. La model card se limita a indicar que es un checkpoint fusionado producido por el paquete de experimentos "Delta-P2S" y a referenciar el directorio de origen `./runs/codegemma7b_to_gemma2_9b_S13_untie_a025/init/p2s`. Los tags del repositorio (`delta-p2s`, `pen2sword`, `gemma`) apuntan a una metodologia de merge propia del autor, sin paper, blog ni documentacion asociada en los resultados de busqueda disponibles. El sufijo `a025` es consistente con un coeficiente de interpolacion de 0,25, y `untie` con la separacion de la matriz de embeddings y la cabeza de salida, pero ambas lecturas son inferencias, no datos confirmados.

En cuanto a la arquitectura subyacente, el checkpoint hereda la de Gemma 2: transformer decoder-only con atencion por consultas agrupadas (GQA), alternancia de capas con atencion local de ventana deslizante y capas con atencion global, normalizacion RMSNorm pre y post atencion, y soft-capping aplicado a los logits. Gemma 2 9B se entreno con destilacion de conocimiento desde un modelo mayor y un vocabulario de 256 000 tokens; CodeGemma 7B comparte esa misma familia de tokenizador y anade entrenamiento especializado en codigo, incluida la capacidad de infilling. Que ambos modelos compartan vocabulario es el supuesto que haria viable un merge de este tipo, aunque el autor no lo documenta.

No se especifica numero de tokens de entrenamiento del merge, composicion del dataset, ni si hubo RLHF, DPO o ajuste posterior. Tampoco se indica si la fusion se aplico capa por capa, con pesos por familia de tensores o con algun criterio de seleccion de neuronas.

## Capacidades

- Generacion de texto general, heredada de Gemma 2 9B. No verificada en este checkpoint concreto.
- Generacion de codigo, presumiblemente heredada de CodeGemma 7B. No verificada.
- Rellenado de codigo (code infilling), capacidad nativa de CodeGemma. No confirmada tras el merge.
- Razonamiento multi-paso y matematicas: esperable por herencia de Gemma 2, sin evaluacion publicada.
- Soporte de tool calling o function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes: no disponible; no hay informacion sobre tolerancia a contextos largos ni a razonamiento iterativo.
- Capacidades multilingues: no disponibles. El modelo base Gemma 2 es multilingue, pero no se declara que idiomas sobreviven al merge.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se declara ninguna.
- Modo instruct o dialogo: no disponible. No se confirma que el checkpoint conserve el ajuste por instrucciones de los modelos base.

## Casos de uso

- Investigacion en fusion de modelos: usar este checkpoint como referencia para reproducir el experimento Delta-P2S y medir si un merge en espacio de parametros entre un modelo generalista y uno especializado en codigo conserva ambas capacidades, comparando contra ajuste fino supervisado y contra mezcla de adaptadores LoRA.
- Evaluacion comparativa de degradacion por merge: ejecutar baterias tipo MMLU, HumanEval y GSM8K sobre este checkpoint, sobre Gemma 2 9B y sobre CodeGemma 7B para cuantificar la perdida o ganancia real derivada de la interpolacion con alpha 0,25.
- Analisis de embeddings desanclados: dado que el nombre sugiere matrices de entrada y salida no compartidas, sirve para estudiar el efecto de desanclar la cabeza de salida en modelos de la familia Gemma respecto del rendimiento y del coste de memoria.
- Generacion de codigo asistida en entornos sin requisitos de licencia estrictos: solo en contextos de prototipado interno, dado que la licencia no esta declarada y no puede asumirse uso comercial.
- Reproduccion de pipelines de merge: el nombre del checkpoint apunta al directorio de origen del experimento, lo que permite a un equipo reconstruir el flujo completo (carga de los dos modelos base, calculo del delta, interpolacion y guardado en safetensors) como plantilla para sus propias fusiones.
- Docencia y divulgacion tecnica: ilustrar en un aula o articulo que un merge de pesos entre modelos de la misma familia y distinto dominio no requiere reentrenamiento, mostrando el recuento de parametros resultante y los requisitos de memoria asociados.
- Base para un ajuste fino posterior: al mantener el tokenizador y la arquitectura Gemma 2, puede actuar como punto de partida para un SFT o un DPO especifico de codigo, si la licencia finalmente lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion, y los resultados de busqueda web no aportan datos sobre este checkpoint ni sobre el metodo Delta-P2S. Cualquier cifra que se quiera usar para decidir su adopcion debe generarse mediante evaluacion propia.

## Requisitos de hardware

Las estimaciones siguientes se calculan a partir del recuento real de parametros (10,16 mil millones) y suponen el checkpoint en bf16/fp16. No hay mediciones publicadas de latencia ni de throughput para este modelo concreto.

| Precision | Peso de los pesos | VRAM practica estimada |
|---|---|---|
| FP16 / BF16 | ~20,3 GB | 24 GB o mas, con margen escaso |
| INT8 | ~10,2 GB | 12-14 GB |
| INT4 | ~5,1 GB | 7-9 GB |

- Cabe en GPU de consumo en cuantizacion INT4 (RTX 3090, RTX 4090, RTX 4080 de 16 GB), y en INT8 en tarjetas de 16-24 GB. En BF16 sin cuantizar no cabe en ninguna GPU de consumo de menos de 24 GB con contexto utilizable.
- Para BF16 con contexto completo se recomiendan A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB.
- La cache KV es un factor relevante: asumiendo la arquitectura de Gemma 2 9B (42 capas, 8 cabezas KV, dimension de cabeza 256) en FP16, se necesitan aproximadamente 2,8 GB de cache para 8192 tokens. En una GPU de 24 GB con pesos en BF16 esto deja un margen muy justo.
- Opciones de despliegue: transformers (es la libreria declarada), text-generation-inference (aparece como tag `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang si la arquitectura se resuelve correctamente en sus implementaciones de Gemma 2. Para llama.cpp u Ollama seria necesario convertir los safetensors a GGUF, ya que el repositorio no publica GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni informacion sobre hardware de referencia del autor.

## Comparativa con modelos similares

Los datos de la columna "Parametros" y "Contexto" de los modelos base son cifras publicadas por sus respectivos autores y se incluyen como referencia; no son mediciones de este checkpoint. No hay datos de rendimiento de este merge, por lo que la comparativa es estructural.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13-a025 | 10,16 B | No disponible (base: 8192) | Fusion de generalista y codigo | No disponible | HuggingFace, 0 descargas |
| Gemma 2 9B (Google) | ~9,24 B | 8192 tokens | Texto general, multilingue | Gemma Terms of Use | Ampliamente desplegado, con cuantizaciones oficiales y de terceros |
| CodeGemma 7B (Google) | ~8,5 B | 8192 tokens | Codigo, con infilling | Gemma Terms of Use | Ampliamente desplegado |
| Qwen2.5-Coder 7B (Alibaba) | ~7,6 B | 32 768 tokens | Codigo, con tool calling | Apache 2.0 | Muy desplegado, cuantizaciones GGUF y AWQ habituales |

Frente a estas alternativas, el checkpoint analizado aporta un tamano ligeramente mayor, ninguna cuantizacion publicada, ninguna evaluacion y una licencia sin declarar. Su ventaja potencial (combinar capacidades generalistas y de codigo en un unico conjunto de pesos) no esta demostrada con datos, mientras que los tres modelos comparados tienen resultados publicados y condiciones de uso claras.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Ademas, los modelos base Gemma 2 y CodeGemma estan sujetos a los Gemma Terms of Use, lo que probablemente condiciona cualquier redistribucion derivada.
- Ausencia total de evaluacion: no hay benchmarks, ni pruebas cualitativas, ni comparaciones con los modelos base. Es imposible saber si el merge preserva, degrada o mejora las capacidades de origen.
- Riesgo de degradacion por merge: la interpolacion de pesos entre modelos con ajustes distintos puede producir interferencia y dar lugar a texto incoherente, repeticiones o colapso parcial de alguna capacidad, especialmente si los espacios de representacion no estan alineados.
- Riesgo de alucinacion: heredado de Gemma 2 y potencialmente agravado por la fusion. No hay datos que permitan acotarlo.
- Estado instruct incierto: no se documenta plantilla de chat. Usar el modelo en modo conversacional sin verificar el formato puede degradar gravemente la calidad de las respuestas.
- Idiomas no declarados: no puede asumirse un comportamiento multilingue equivalente al de Gemma 2 9B.
- Arquitectura y contexto no confirmados en la model card: la ventana de 8192 tokens es una suposicion basada en el modelo base, no un dato verificado del checkpoint.
- Senales de escasa madurez: cero descargas, cero likes, repositorio creado y actualizado en la misma franja temporal y model card de tres lineas. No hay garantia de mantenimiento ni de soporte.
- Metodo no reproducible con la informacion disponible: no se publica codigo del paquete "Delta-P2S" ni la configuracion exacta del merge, mas alla del nombre del directorio de origen.
- Sin cuantizaciones oficiales: desplegarlo en hardware modesto exige convertir los pesos, con el consiguiente riesgo de errores de conversion no detectados.
- Fecha de publicacion futura respecto de la referencia habitual: el repositorio figura creado el 14 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13-a025
- Gemma 2 9B en HuggingFace (modelo base generalista): https://huggingface.co/google/gemma-2-9b
- CodeGemma 7B en HuggingFace (modelo base de codigo): https://huggingface.co/google/codegemma-7b
- Documentacion tecnica de Gemma 2 de Google: https://ai.google.dev/gemma/docs/core/model_card_2
- Pagina del autor en HuggingFace: https://huggingface.co/g-assismoraes
- Paper, blog o repositorio del metodo Delta-P2S / pen2sword: no disponible en los resultados de busqueda
- Demo o espacio asociado: no disponible
