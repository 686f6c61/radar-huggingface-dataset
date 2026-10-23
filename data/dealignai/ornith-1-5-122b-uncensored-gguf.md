# dealignai/Ornith-1.5-122B-UNCENSORED-GGUF

## Resumen

Ornith-1.5-122B-UNCENSORED-GGUF es una compilación en formato GGUF del modelo Ornith-1.5-122B, publicado por el usuario dealignai. Se trata de una versión con los rechazos eliminados (abliteration) del modelo base ornith-ai/Ornith-1.5-122B, un MoE híbrido de la familia Qwen3.5 con 124.635.206.144 parámetros reales (122B nominales, 10B activos por token), torre de visión y cabeza MTP para decodificación especulativa. El repositorio empaqueta dos cuantizaciones en un mismo lugar —Q4_K_M de 79,4 GB e IQ2_XXS de 44,1 GB— junto con el proyector multimodal mmproj-F16 y un drafter opcional DFlash2.

El interés inmediato es práctico: permite ejecutar un MoE de más de 120B parámetros con capacidad de visión en hardware de consumo o en una única GPU de 80 GB, algo inviable con los pesos BF16 originales. La cuantización IQ2_XXS baja el requisito a unos 44 GB, lo que encaja en equipos con 48 GB de VRAM o en configuraciones multi-GPU de consumo. Además, la cabeza `nextn` nativa habilita decodificación autoespeculativa dentro de llama.cpp, con una mejora reportada del 10 % en tok/s de un solo stream para Q4_K_M y de en torno al 15 % para IQ2_XXS.

Conviene subrayar la naturaleza del artefacto: el propio autor lo describe como un elemento de investigación para trabajar en alineación, y advierte de que responde a peticiones que el modelo base rechaza, incluidas las dañinas. No es un modelo para desplegar directamente ante usuarios finales sin controles de seguridad posteriores. La licencia declarada es MIT para los pesos principales y Apache-2.0 para el drafter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia Qwen3.5: 48 bloques, cada cuarto con atención completa y el resto con GatedDeltaNet (SSM tipo Mamba), más capa MoE con 256 expertos enrutados y 1 compartido; dimensión oculta 3072; torre de visión |
| Parametros totales | 124.635.206.144 (122B nominales) |
| Parametros activos | 10B (según model card) |
| Longitud de contexto | No especificada en la model card; los ejemplos de ejecución usan `-c 65536` con `-np 8` |
| Tipos de cuantizacion | Q4_K_M (79,4 GB, con Q6_K/Q8_0 en atención) e IQ2_XXS (44,1 GB, expertos enrutados a 2 bits con down IQ3); calibración imatrix multidominio (código, agentes, razonamiento, multilingüe de 10 idiomas) |
| Idiomas soportados | Inglés, francés, español, alemán, italiano, japonés, coreano, portugués, hindi y chino |
| Licencia | MIT para los pesos principales; Apache-2.0 para el drafter DFlash2 |
| Formato de pesos | GGUF (llama.cpp); incluye `Ornith-1.5-122B-mmproj-F16.gguf` de 909 MB para visión y `dflash2/Ornith-1.5-122B-DFlash2-Q8_0.gguf` de 1,00 GB |

Parámetros de muestreo recomendados, incluidos en el GGUF: `temperature=0.6`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.0`, `repetition_penalty=1.0`. El modo greedy (`temperature=0`) también funciona y, según el autor, ofrece la coherencia más limpia en ambas cuantizaciones.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin cambios estructurales por parte de dealignai: un híbrido de 48 bloques en el que solo uno de cada cuatro utiliza atención completa, mientras que los tres restantes emplean GatedDeltaNet, un mecanismo de espacio de estados con compuerta delta. Esta combinación reduce el coste de atención en contextos largos manteniendo la capacidad asociativa de la atención clásica. La capa MoE intercala 256 expertos enrutados más uno compartido sobre una dimensión oculta de 3072, lo que da el ratio de activación de 10B sobre 122B. Se añade una torre de visión que procesa imágenes y vídeo, exportada a GGUF en F16 y byte-idéntica al origen BF16, de modo que la capacidad multimodal se conserva sin pérdida por cuantización.

La cabeza MTP (nextn) nativa reside en `blk.48.nextn.*` con `nextn_predict_layers=1` y permite decodificación autoespeculativa: el propio modelo propone tokens que luego verifica, sin necesidad de un modelo borrador externo. El autor reporta una tasa de aceptación del 45 % con `--spec-draft-n-max 3` en Q4_K_M, y señala que valores superiores a 3 desperdician cómputo de borrador. Como alternativa existe un drafter DFlash2 de Inco AI, entrenado para el modelo base original y no ablacionado por separado para esta release; solo debe usarse un método especulativo a la vez.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original. El proceso de abliteration sí está documentado a alto nivel: eliminación de rechazos con preservación de la torre de visión y de la cabeza MTP. El modo de razonamiento se controla con el kwarg booleano `enable_thinking` de la plantilla de chat, en formato de razonamiento estilo DeepSeek, y `enable_thinking` está activado por defecto.

## Capacidades

- Generación de texto conversacional multi-turno en diez idiomas, con especial cobertura de inglés, chino, español, francés, alemán, italiano, japonés, coreano, portugués e hindi.
- Razonamiento explícito activable o desactivable mediante `enable_thinking`, con salida en formato de razonamiento compatible con el parser `deepseek` de llama.cpp.
- Comprensión de imágenes y vídeo a través de la torre de visión incluida en el mmproj F16.
- Generación de código y matemáticas, con calibración imatrix específica para dominios de programación y razonamiento.
- Capacidad de agente y razonamiento multi-paso, favorecida por la ventana de 65.536 tokens empleada en los ejemplos de despliegue y por el calibrado en flujos agénticos.
- Decodificación autoespeculativa nativa vía MTP, sin modelo borrador adicional.
- Ausencia de rechazos por alineación: responde a peticiones que el modelo base declina, incluidas las dañinas.

## Casos de uso

- Investigación en alineación y abliteration: el artefacto permite comparar pares de respuestas entre el modelo base y la versión sin rechazos sobre el mismo prompt, aislando el efecto de la intervención sin variar arquitectura ni cuantización de la torre de visión.
- Red teaming y evaluación de robustez: sirve como modelo adversario controlado para probar clasificadores de seguridad, filtros de salida y sistemas de moderación antes de desplegarlos en producción.
- Asistente local multimodal: con IQ2_XXS en un equipo de 48 GB se puede mantener un asistente que describa imágenes, extraiga información de capturas o analice fotogramas de vídeo sin enviar datos a la nube.
- Analítica de documentos largos: los 65.536 tokens de contexto permiten procesar contratos, informes o expedientes completos en una sola pasada, con razonamiento activado para tareas de extracción y comparación.
- Escritura creativa y roleplay sin restricciones temáticas: narrativa adulta, ficción oscura o guiones con violencia explícita, casos en los que los rechazos del modelo base interrumpen la generación.
- Generación de código en pipelines internos: integrable vía API compatible con OpenAI que expone `llama-server`, con la cabeza MTP reduciendo la latencia por token en autocompletado y refactorización.
- Procesamiento multilingüe en diez idiomas: atención al cliente o traducción interna en mercados europeos y asiáticos sin depender de un proveedor externo.
- Despliegue air-gapped: al ser GGUF con licencia MIT, puede ejecutarse en infraestructura aislada sin conexión, algo relevante en entornos sanitarios, jurídicos o de defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes para esta compilación, y advierte explícitamente de que las cifras de rendimiento publicadas para el modelo base no son mediciones de esta release sin censura. Los únicos datos numéricos de rendimiento son internos al proceso de decodificación especulativa:

| Metrica | Valor reportado |
|---|---|
| Mejora de tok/s en un solo stream con MTP, Q4_K_M | +10 % |
| Mejora de tok/s en un solo stream con MTP, IQ2_XXS | +15 % aproximadamente |
| Tasa de aceptación del borrador MTP con `n-max 3`, Q4_K_M | 45 % |
| Validez del drafter DFlash2 sobre Q4_K_M | No validada en el runtime probado |
| Validez del drafter DFlash2 sobre IQ2_XXS | Comprobación de integración superada |

## Requisitos de hardware

- VRAM/RAM para Q4_K_M: aproximadamente 79,4 GB solo para los pesos, más overhead de contexto KV y del mmproj; en la práctica requiere una GPU de 80 GB o descarga parcial a RAM del sistema.
- VRAM/RAM para IQ2_XXS: aproximadamente 44,1 GB, lo que según el autor cabe en equipos de consumo con 48 GB.
- Torre de visión: 909 MB adicionales en F16, cargada junto al modelo principal con `--mmproj`.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M encaja en A100 80GB, H100 80GB o RTX 6000 Ada; IQ2_XXS en RTX 6000 Ada de 48 GB o en configuraciones de 2× RTX 4090/5090 de 24 GB con reparto de capas.
- Cabe en GPU de consumo: sí, en el caso de IQ2_XXS sobre tarjetas de 48 GB o duales de 24 GB. Q4_K_M excede las 24 GB de una RTX 4090 y obliga a offload parcial.
- Opciones de despliegue: llama.cpp con build upstream `b11670+` (probado con `b76b13379`), mediante `llama-server` con `-ngl 99 -fa on --jinja --reasoning-format deepseek`. No se documentan recetas para vLLM, TGI ni Ollama en esta release.
- Throughput: no se publican tok/s absolutos. Se conoce la mejora relativa por MTP (+10 % en Q4_K_M, +15 % en IQ2_XXS) y que `n-max 3` es el óptimo de aceptación.
- Paralelismo: los ejemplos usan `-np 8` para ocho slots concurrentes con 65.536 tokens de contexto total.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B-UNCENSORED (este) | 124,6B totales / 10B activos | 65.536 en ejemplos | Sí (mmproj F16) | MIT | GGUF Q4_K_M, IQ2_XXS | Disponible |
| ornith-ai/Ornith-1.5-122B (base) | 124,6B totales / 10B activos | No disponible | Sí | No disponible en la informacion | BF16 safetensors | Disponible |
| Ornith-1.5-122B-DFlash2 (Inco AI) | Borrador especulativo, no es un modelo completo | No aplica | No | Apache-2.0 | GGUF Q8_0 (1,00 GB) | Disponible |

No se dispone de datos sobre alternativas externas de tamaño o tarea comparable en la información proporcionada, ni de métricas que permitan una comparación cuantitativa de rendimiento entre este modelo y otros MoE de la familia Qwen3.5.

## Limitaciones y advertencias

- Ausencia deliberada de rechazos: el modelo cumple peticiones dañinas que el base deniega. El autor lo etiqueta como artefacto de investigación y prohíbe implícitamente el despliegue directo a usuarios finales sin controles de seguridad adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta cuantización; la IQ2_XXS, con expertos enrutados a 2 bits, es especialmente propensa a degradación de coherencia frente a Q4_K_M.
- La abliteration puede degradar capacidades generales: no hay benchmarks que cuantifiquen la pérdida respecto al base, pero el autor reconoce que las cifras del modelo original no son extrapolables a esta release.
- Sesgos: no documentados. Al provenir de un corpus multilingüe amplio y haber eliminado la capa de rechazo, es esperable una menor resistencia a generar estereotipos y contenido sesgado.
- Cobertura lingüística declarada de diez idiomas, pero sin evaluación por idioma; el rendimiento real fuera del inglés y el chino no está medido.
- Longitud de contexto no especificada oficialmente: 65.536 tokens aparecen solo como valor en los ejemplos de ejecución, no como límite arquitectónico confirmado.
- El drafter DFlash2 no fue ablacionado ni reentrenado para esta release y no está validado sobre Q4_K_M; su uso conjunto puede producir fallos en el runtime probado.
- Solo se documenta compatibilidad con llama.cpp `b11670+`; otras herramientas de inferencia no están soportadas oficialmente.
- Licencia MIT en los pesos, lo que permite uso comercial, pero esa permisividad no exime de responsabilidad legal por el contenido generado ni de las obligaciones de moderación aplicables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/Ornith-1.5-122B-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Drafter DFlash2 de Inco AI: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Conversión GGUF del drafter por kaivoss: https://huggingface.co/kaivoss/Ornith-1.5-122B-DFlash2-GGUF
- Perfil del autor en X: https://x.com/dealignai
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes; las entradas devueltas no guardan relación con el modelo y se han descartado.
