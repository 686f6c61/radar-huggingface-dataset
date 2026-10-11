# ohmysimo/Wren-512-GGUF

# Wren-512-GGUF

## Resumen

Wren-512-GGUF es una cuantización GGUF de precisión mixta del modelo Swift 1.5 Qwen3.8-Flash-Next, publicado por UkisAI y derivado a su vez de Qwen3.8-Flash-Next de Qwen. La sube el usuario ohmysimo y su rasgo distintivo frente a la cuantización previa (Wren) es que conserva los 512 expertos enrutados del modelo original en lugar de podar la mitad. El modelo base declara 177.415.758.720 parámetros totales en safetensors y el repositorio GGUF ocupa 86,4 GB, con el fichero principal B-heal en 82,3 GB.

Resuelve un problema muy concreto: permitir ejecutar un MoE de gran tamaño con una sola GPU más RAM del sistema, sacrificando precisión de forma controlada. La asignación de precisión por experto se calculó a partir del error de cuantización medido en un cuestionario multidisciplinar, y después se aplicó un proceso de "healing" (destilación de routers, normas y una LoRA de rango 16 fusionada) sobre los propios logits de Swift. El resultado queda a 0,081325 de KLD respecto a Swift Q8_0 y coincide en el token más probable el 91,359% de las veces.

Es relevante ahora porque demuestra que una cuantización agresiva de un MoE de 177.000 millones de parámetros puede mantenerse por encima de 87/100 en un quiz de 300 preguntas, con decodificación especulativa vía MTP que llega a 168,7 tokens/s en código. El coste es la dependencia de un fork no oficial de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) derivado de Qwen3.8-Flash-Next, con 512 expertos enrutados y capa de predicción multi-token (MTP) |
| Parámetros totales | 177.415.758.720 (dato real de safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo oficial de llama-server arranca con -c 32768) |
| Tipos de cuantización | Expertos enrutados en dos grupos de precisión por capa: IQ3_XXS / IQ2_XXS en gate-up e IQ3_XXS en down; atención, expertos compartidos y resto en Q8_0; tabla de n-gramas en Q4_0; fichero MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0-and-qwen-community-license (etiquetada como license: other) |
| Formato de pesos | GGUF (llama.cpp); safetensors solo en el modelo base |

## Arquitectura y entrenamiento

Se trata de una cuantización de precisión mixta sobre un transformer MoE con 512 expertos enrutados, no de un modelo entrenado desde cero. La asignación de tipos de cuantización se hizo por capas y en dos grupos de precisión, a partir del error de cuantización medido por experto en un cuestionario multidisciplinar: IQ3_XXS / IQ2_XXS para gate-up e IQ3_XXS para down en los expertos enrutados, Q8_0 en atención, expertos compartidos y el resto, y Q4_0 en la tabla de n-gramas. El modelo conserva la totalidad de los expertos, a diferencia de Wren_T3-v2, que poda el 50%.

Sobre esa base se aplicó un "healing": los routers, las normas y una LoRA de rango 16 ya fusionada se destilaron a partir de los 20 logits más altos del propio Swift, con un 70% del contenido en matemáticas. El entrenamiento de healing consumió 4.010.052 tokens y alcanzó un KL de validación de 0,0727521005954424. De los 10.423 documentos de healing, 718 son pares de traducción cuya respuesta de referencia fue escrita por Gemini y sobre los que se aplicó además una entropía cruzada con peso 0,5. El fichero `Wren-512-MTP-q8_0.gguf` contiene la capa de predicción multi-token de Swift sin modificar, en Q8_0, para decodificación especulativa.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Razonamiento matemático: 74/100 en la categoría math del quiz de 300 preguntas tras el healing.
- Generación de código: 84/100 en la categoría code, igual que la referencia Q8_0.
- Razonamiento lógico (90/100), ciencia (92/100), sentido común (96/100) y filosofía (86/100).
- Decodificación especulativa mediante su propia capa MTP: 97% de borradores aceptados en prompts de código y 89% en aritmética paso a paso.
- Exposición de probabilidades del primer token: las pruebas de confabulación del autor usan directamente esa señal para medir calibración.
- Ejecución con expertos descargados a RAM (`-ot "exps=CPU,per_layer_token_embd=CPU"`) y atención con flash attention activada.
- Tool calling / function calling: no disponible; las pruebas de existencia de API se hicieron sin herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no declaradas. En las pruebas de velocidad se emplea un prompt de prosa italiana (57% de borradores aceptados), lo que sugiere cierto soporte, pero no hay lista oficial de idiomas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en una estación de trabajo: con los expertos en RAM y la parte no-experta en GPU, el modelo se ejecuta con llama-server y un contexto de 32.768 tokens, algo inviable con los 188,2 GB de Swift Q8_0 en la mayoría de equipos.
- Generación de código en local con baja latencia: 168,7 tokens/s y 97% de borradores MTP aceptados en prompts de código sobre una RTX PRO 6000, suficiente para autocompletado interactivo o revisión de parches sin salida a la nube.
- Resolución de problemas aritméticos paso a paso: 154,8 tokens/s y 89% de aceptación de borradores, con 74/100 en matemáticas, adecuado para asistentes de cálculo con razonamiento encadenado.
- Sustitución de la referencia Q8_0 en presupuestos de memoria ajustados: reduce el peso de 188,2 GB a 82,3 GB conservando el 91,359% de coincidencia en el token más probable y sin perder puntuación global (87,0 frente a 89,0).
- Investigación en cuantización mixta: el repositorio incluye en `training/` la asignación por niveles y tipos, el log y el mapa de healing y los logs de evaluación, lo que permite reproducir y auditar la metodología de asignación por error medido.
- Auditoría de calibración y confabulación: replicar los 4000 sondeos sí/no sobre existencia de API usando las probabilidades del primer token, y comparar la AUROC confianza-acierto (0,705) frente a la referencia (0,725).
- Servicio conversacional autoalojado con plantilla de chat: el ejemplo usa `--jinja` con llama-server, lo que habilita conversaciones multi-turno con plantilla aplicada por el servidor.

## Benchmarks y rendimiento

Quiz de 300 preguntas de opción múltiple (6 dominios x 50; ruido de ±2-3 puntos). KLD calculado sobre 25 x 2048 tokens de respuestas reservadas de Swift, contra Swift Q8_0.

| Modelo | Tamaño GB | all | math | code | logic | science | commonsense | philosophy | KLD vs Swift Q8 | mismo token top |
|---|---|---|---|---|---|---|---|---|---|---|
| Swift 1.5 (Q8_0, referencia) | 188,2 | 89,0 | 82,0 | 84,0 | 92,0 | 94,0 | 96,0 | 86,0 | – | – |
| Wren-512 B-heal (este repositorio) | 82,3 | 87,0 | 74,0 | 84,0 | 90,0 | 92,0 | 96,0 | 86,0 | 0,081325 | 91,359% |
| Wren-512 B (antes del healing) | 82,3 | 86,7 | 72,0 | 82,0 | 90,0 | 90,0 | 98,0 | 88,0 | 0,077427 | 91,82% |
| Wren-512 A (no publicado) | 80,3 | 86,3 | 72,0 | 82,0 | 90,0 | 90,0 | 98,0 | 86,0 | 0,085759 | 91,128% |
| Wren_T3-v2 (podado al 50%) | 60,4 | 82,3 | 66,0 | 78,0 | 92,0 | 84,0 | 92,0 | 82,0 | – | – |

Confabulación sobre existencia de API: 4000 sondeos sí/no con probabilidades del primer token y sin herramientas. Se considera "error con confianza" una respuesta incorrecta dada con probabilidad >= 0,75.

| Modelo | Precisión | Errores con confianza | AUROC confianza → acierto |
|---|---|---|---|
| Wren_T3-v2 (podado al 50%) | 0,624 | 0,208 | 0,642 |
| Swift 1.5 (Q8_0, referencia) | 0,727 | 0,146 | 0,725 |
| Wren-512 B-heal (este repositorio) | 0,717 | 0,167 | 0,705 |
| Wren-512 B (antes del healing) | 0,726 | 0,172 | 0,696 |
| Wren-512 A (no publicado) | 0,735 | 0,170 | 0,701 |

Velocidad medida en una RTX PRO 6000, modelo en GPU, tabla de n-gramas en RAM, decodificación greedy, 256-300 tokens generados.

| Prompt | Sin MTP | Con borrador MTP | Borradores aceptados |
|---|---|---|---|
| Código | 79,6 t/s | 168,7 t/s | 97% |
| Aritmética paso a paso | – | 154,8 t/s | 89% |
| Prosa italiana | – | 111,0 t/s | 57% |

## Requisitos de hardware

- RAM: aproximadamente 45 GB para los expertos, más la parte que va a GPU. La tabla de n-gramas ocupa 29 GB y se lee bajo demanda.
- GPU validada: una RTX PRO 6000, con el modelo repartido entre GPU y RAM según el ejemplo del autor. La VRAM exacta de la parte no-experta no está publicada.
- Cabe en GPU de consumo: no disponible como afirmación del autor. Con 45 GB de RAM para expertos más 29 GB de tabla de n-gramas leída bajo demanda, queda fuera de portátiles convencionales; un equipo de sobremesa con 64 GB o más de RAM y una GPU con VRAM suficiente para atención y embeddings podría alojarlo, pero no está verificado en la documentación.
- Opciones de despliegue: exclusivamente el fork de llama.cpp con soporte de expertos por niveles (`https://github.com/OhMySimo/llama.cpp`, rama `tiered-experts`), compilado con CUDA o ROCm. No hay soporte documentado en llama.cpp upstream, vLLM, TGI, Ollama ni otros servidores.
- Comando de referencia: `llama-server -m Wren-512_B-heal.gguf -ngl 99 -ot "exps=CPU,per_layer_token_embd=CPU" -fa on -c 32768 --jinja`, y para MTP `-md Wren-512-MTP-q8_0.gguf --spec-type draft-mtp -ngld 99`.
- En NVIDIA hay que definir `LLAMA_NO_LAYER_MK=1`: el megakernel de capa del fork está afinado para AMD y no soporta multi-GPU.
- Rendimiento: 79,6 t/s sin MTP y 168,7 t/s con MTP en código; 154,8 t/s en aritmética paso a paso; 111,0 t/s en prosa italiana. Cifras de una única RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño (GGUF/Q8) | Quiz (all) | KLD vs Swift Q8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wren-512-GGUF (este repositorio) | 177,4 B totales | 82,3 GB | 87,0 | 0,081325 | swift-open-license-v1.0 + qwen-community-license | pública en HuggingFace, requiere fork |
| Swift 1.5 Qwen3.8-Flash-Next (base) | 177,4 B totales | 188,2 GB en Q8_0 | 89,0 | referencia | swift-open-license-v1.0 | pública como modelo base |
| Wren_Wren_T3-v2 (podado al 50%) | no disponible | 60,4 GB | 82,3 | – | no disponible en esta ficha | pública en HuggingFace |
| Qwen3.8-Flash-Next (origen) | no disponible | no disponible | no disponible | – | qwen-community-license | pública |

Comparado con la referencia Q8_0, este repositorio reduce el tamaño un 56,3% (de 188,2 GB a 82,3 GB) a cambio de 2 puntos en el quiz global y 8 puntos en matemáticas. Frente a Wren_T3-v2, conserva 4,7 puntos de puntuación global y 8 puntos en matemáticas con 21,9 GB más de peso. No hay datos de contexto máximo ni de parámetros activos para ninguno de los modelos comparados en la información disponible.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes en el momento de la consulta, de un único autor, sin revisión independiente de terceros ni resultados reproducidos fuera de su propia evaluación.
- Depende de un fork no oficial de llama.cpp (rama `tiered-experts`). No funciona en llama.cpp upstream ni en ecosistemas estándar como Ollama, vLLM o TGI, lo que implica deuda de mantenimiento y riesgo de rotura.
- El megakernel de capa del fork está afinado para AMD y no soporta multi-GPU; en NVIDIA hay que desactivarlo con `LLAMA_NO_LAYER_MK=1`.
- El healing destila de los propios logits de Swift: el modelo hereda los sesgos y errores del base. El KLD de 0,081325 mide fidelidad a Swift Q8_0, no corrección objetiva.
- 718 de los 10.423 documentos de healing son pares de traducción con respuesta de referencia escrita por Gemini, sobre los que además se aplicó entropía cruzada con peso 0,5. Esto introduce contenido generado por IA en el proceso y un posible sesgo hacia el estilo de ese modelo. El mismo procedimiento se aplicó al healing de Wren_T3-v2.
- Riesgo de confabulación documentado: 0,717 de precisión y 16,7% de errores con confianza >= 0,75 en preguntas sobre existencia de API. La calibración es peor que la de la referencia Q8_0 (AUROC 0,705 frente a 0,725). No conviene usarlo como fuente factual sin verificación.
- La categoría math es la que más cae con la cuantización: de 82,0 en Swift Q8_0 a 74,0 tras el healing (72,0 antes). El resto de dominios se mantienen dentro de 2-4 puntos.
- Los resultados del quiz tienen un ruido declarado de ±2-3 puntos, por lo que diferencias menores entre Wren-512 A, B y B-heal no son concluyentes.
- Licencia doble (swift-open-license-v1.0 y qwen-community-license, etiquetada como `other`): hay que revisar ambas antes de cualquier uso comercial. Los términos concretos de atribución y redistribución no están detallados en la información disponible.
- Idiomas soportados no declarados oficialmente; la única evidencia de multilingüismo es un prompt de prosa italiana en la prueba de velocidad, con solo un 57% de borradores MTP aceptados.
- No se documenta soporte de tool calling, agentes, visión ni audio. No hay datos de longitud máxima de contexto más allá del ejemplo con 32.768 tokens.
- Requiere ~45 GB de RAM para expertos más una tabla de n-gramas de 29 GB leída bajo demanda, lo que limita el despliegue a estaciones de trabajo y servidores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ohmysimo/Wren-512-GGUF
- Modelo base (Swift 1.5 Qwen3.8-Flash-Next): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo origen (Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización previa con poda (Wren): https://huggingface.co/ohmysimo/Wren-GGUF
- Fork de llama.cpp con expertos por niveles: https://github.com/OhMySimo/llama.cpp (rama `tiered-experts`)
