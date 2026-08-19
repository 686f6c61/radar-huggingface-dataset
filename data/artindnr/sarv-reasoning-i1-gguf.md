# artindnr/sarv-reasoning-i1-GGUF

## Resumen

El modelo `artindnr/sarv-reasoning-i1-GGUF` es una colección de cuantizaciones GGUF del modelo `artindnr/sarv-reasoning`, un modelo de lenguaje especializado en persa (farsi) con capacidades de razonamiento y generación de poesía. El autor de la cuantización es `mradermacher`, conocido por publicar versiones GGUF con imatrix de numerosos modelos open source. El modelo base está construido sobre la arquitectura GPT-OSS con mezcla de expertos (MoE) y ha sido afinado mediante LoRA, según las etiquetas del repositorio.

Este modelo resulta relevante porque cubre un nicho lingüístico poco atendido: el persa, con un enfoque explícito en razonamiento encadenado (chain-of-thought) y generación de poesía. Al estar disponible en formato GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, lo que facilita su adopción en entornos locales y de producción ligera. El repositorio incluye múltiples niveles de cuantización, desde IQ1_M hasta Q6_K, con tamaños de archivo que van de 12,1 GB a 22,3 GB, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ1_S, i1-IQ2_XXS, i1-IQ2_XS, i1-Q3_K_S, i1-IQ2_M, i1-IQ2_S, i1-IQ3_S, i1-IQ3_XS, i1-IQ3_XXS, i1-Q2_K, i1-IQ4_XS, i1-Q2_K_S, i1-Q4_0, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base `artindnr/sarv-reasoning` emplea una arquitectura GPT-OSS con mezcla de expertos (MoE), tal como reflejan las etiquetas del repositorio. No se especifican detalles sobre el número de expertos, la dimensión de los tensores ni el mecanismo de enrutamiento. El modelo ha sido afinado mediante LoRA, lo que sugiere un ajuste eficiente sobre un modelo base preentrenado, probablemente orientado a tareas de razonamiento y generación de poesía en persa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la cuantización con imatrix, que mejora la calidad de los pesos cuantizados al calibrar la matriz de importancia sobre datos representativos. El repositorio de cuantización indica que se utilizó el formato i1 (una variante de cuantización con mejoras de precisión) y que los archivos se generaron con herramientas de conversión de Hugging Face.

## Capacidades

- Generación de texto en persa, con especial énfasis en poesía y composición de poemas.
- Razonamiento encadenado (chain-of-thought) para tareas que requieren pasos intermedios de lógica.
- Soporte de conversación multi-turno, según la etiqueta "conversational".
- Capacidades de razonamiento general, probablemente heredadas del modelo base GPT-OSS.
- No se documenta soporte explícito de tool calling, function calling, ni capacidades multimodales (visión, audio).
- El modelo está entrenado exclusivamente para persa, por lo que su uso en otros idiomas no está garantizado.

## Casos de uso

- Generación de poesía persa: el modelo puede componer versos en estilos clásicos como ghazal o masnavi, útil para creadores, traductores o aplicaciones educativas de literatura persa.
- Asistente de escritura creativa en persa: redacción de cuentos, ensayos o guiones con coherencia narrativa, aprovechando su capacidad de razonamiento para mantener la trama.
- Tutor de lengua persa: explicación de reglas gramaticales, corrección de textos y generación de ejercicios para estudiantes de farsi.
- Análisis de textos persas: resumen, extracción de ideas clave o paráfrasis de documentos, artículos o noticias en persa.
- Chatbot de atención al cliente en persa: integración en sistemas de soporte para responder consultas frecuentes con contexto conversacional, dado su entrenamiento en diálogo.
- Herramienta de razonamiento lógico en persa: resolución de problemas de lógica, matemáticas básicas o acertijos, útil en entornos educativos o de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. La ausencia de métricas impide comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- Los archivos GGUF varían entre 12,1 GB (cuantizaciones IQ1_M, IQ1_S) y 22,3 GB (Q6_K). La VRAM necesaria para cargar el modelo completo en memoria es aproximadamente el tamaño del archivo más un margen para el contexto y las activaciones (típicamente 2-4 GB adicionales).
- Para las cuantizaciones más pequeñas (IQ1_M, IQ2_XXS, etc.), una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, o una A100 de 40 GB) sería suficiente. Las cuantizaciones Q4_K_M (15,9 GB) y Q5_K_M (17,0 GB) requieren al menos 20-24 GB de VRAM.
- En GPU de consumo, una RTX 3090 (24 GB) o RTX 4090 (24 GB) puede ejecutar las cuantizaciones hasta Q5_K_M. Para Q6_K (22,3 GB) se necesita una GPU con 24 GB o más, o bien descargar a CPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- La latencia y el throughput dependen de la GPU y de la cuantización. En una RTX 4090, se esperan velocidades de decodificación de 20-40 tokens por segundo para cuantizaciones Q4_K_M, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos persas de razonamiento con ~20B parámetros). Existen otros modelos multilingües como Aya-101 o modelos persas específicos como ParsBERT, pero no son directamente comparables en tamaño ni en enfoque de razonamiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en persa; su rendimiento en otros idiomas será muy limitado o nulo.
- No se han publicado evaluaciones de sesgos ni de seguridad. Como todo modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento y generar contenido ofensivo o inexacto.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede producir respuestas coherentes pero incorrectas, especialmente en tareas de lógica o matemáticas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original (`artindnr/sarv-reasoning`) por si hubiera restricciones adicionales.
- Las cuantizaciones de muy baja precisión (IQ1_M, IQ1_S, IQ2_XXS) degradan significativamente la calidad y solo son recomendables para pruebas o entornos con memoria muy limitada.
- No se especifica la longitud de contexto soportada; es probable que sea la del modelo base GPT-OSS (típicamente 128K), pero no está confirmado.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/artindnr/sarv-reasoning-i1-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/artindnr/sarv-reasoning
- Repositorio HuggingFace de cuantizaciones estáticas (mradermacher): https://huggingface.co/mradermacher/sarv-reasoning-GGUF
- Página de descubrimiento de modelos GGUF (referencia externa): https://local-ai-zone.github.io/
