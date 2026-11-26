# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18 es un ajuste fino del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT, que aplica la metodología CIRF (siglas no desarrolladas en la información disponible) para dotar al modelo de un modo de razonamiento explícito basado en tokens funcionales. El modelo parte del checkpoint completo de la familia CIRF y aplica una selección de resultados mediante decodificación backward-greedy con un presupuesto máximo de 18 tokens de resultado explícitos por ejemplo de entrenamiento. La actualización LoRA resultante se ha fusionado en los pesos densos BF16, de modo que el modelo carga con Transformers estándar sin necesidad de PEFT ni del código CIRF original.

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.034.471.936 parámetros, con licencia Llama 3.1 Community License y entrenado originalmente por Meta sobre datos multilingües, aunque esta variante declara únicamente el inglés como idioma soportado. La innovación principal es la incorporación de 514 tokens nuevos (marcadores `[sof]`, `[eof]` y `[f_0]` a `[f_511]`) con sus filas de embedding y de salida entrenadas, que el modelo utiliza para construir una traza de razonamiento intermedia antes de emitir la respuesta final.

El modelo es relevante en el contexto de la investigación sobre razonamiento eficiente en modelos pequeños: explora si un modelo de 8B puede mejorar su precisión en tareas aritméticas y de sentido común mediante trazas de tokens funcionales compactas, en lugar de cadenas de pensamiento en lenguaje natural. Su tamaño contenido y su formato de pesos safetensors lo hacen desplegable en hardware de consumo, y la publicación de configuraciones de entrenamiento, procedencia y verificación de exportación facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128.000 tokens, pero esta variante no lo especifica) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (BF16), cargable con Transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con atención por cabezas agrupadas (GQA) y RoPE, según la implementación estándar de Meta. Sobre esa base, el ajuste CIRF añade 514 tokens al vocabulario: `[sof]` (start of functions), `[eof]` (end of functions) y 512 tokens funcionales `[f_0]` a `[f_511]`. Estos tokens cuentan con filas de embedding de entrada y de proyección de salida entrenadas, y se han incorporado al checkpoint final junto con los pesos del modelo base.

El entrenamiento se realizó mediante LoRA supervisado, posteriormente fusionado en los pesos densos BF16. Esta variante concreta parte del modelo CIRF de resultado completo y aplica una selección de resultados backward-greedy con un presupuesto de como máximo 18 tokens de resultado explícitos por ejemplo de entrenamiento, lo que reduce la longitud de las trazas y favorece la eficiencia en inferencia. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales; el autor publica `training_config.json` y `provenance.json` en el repositorio para documentar los ajustes y los hashes del checkpoint de origen.

El protocolo de inferencia es peculiar: no se usa plantilla de chat, sino el formato `QUESTION[sof]`, y el modelo genera una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final. La decodificación debe hacerse con `skip_special_tokens=False` y parada en el token EOS del tokenizer, no en `[eof]`. En la evaluación se limita adicionalmente cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el límite.

## Capacidades

- Generación de texto y razonamiento explícito mediante trazas de tokens funcionales previas a la respuesta final.
- Razonamiento aritmético y matemático de varios pasos, evaluado en GSM8K, MultiArith, SVAMP y MATH-500.
- Razonamiento de sentido común, evaluado en CommonsenseQA y StrategyQA.
- Tareas de simulación de estados y paridad, evaluadas en Coin Flip.
- Formato de prompt propio sin plantilla de chat: `QUESTION[sof]`, con delimitadores `[eof]` para separar traza y respuesta.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes, visión, audio ni modo thinking en lenguaje natural; el "razonamiento" se expresa como tokens funcionales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Evaluación de investigación en razonamiento eficiente: el modelo sirve como banco de pruebas para medir si trazas de tokens funcionales compactas (máximo 18 tokens de resultado por ejemplo) mejoran la precisión frente a cadenas de pensamiento en lenguaje natural en modelos de 8B.
- Resolución de problemas aritméticos de primaria y secundaria: con un 99,44% en MultiArith y 78,67% en SVAMP, puede emplearse en pipelines de corrección automática de ejercicios matemáticos donde el formato de respuesta exacta sea aceptable.
- Clasificación y respuesta a preguntas de sentido común: su 79,61% en CommonsenseQA permite integrarlo en sistemas de preguntas y respuestas de dominio general con verificación posterior.
- Simulación de estados y paridad: el 82,81% en Coin Flip (con corrección de paridad) lo hace útil en tareas educativas o de juegos lógicos que requieran seguir transformaciones de estado.
- Reproducción de experimentos académicos: al publicar `training_config.json`, `provenance.json` y `export_verification.json`, facilita la replicación de estudios sobre tokens funcionales y destilación de razonamiento.
- Despliegue en hardware de consumo para prototipado: sus 8B parámetros en BF16 (16,1 GB de repo) permiten ejecutarlo en una GPU única de gama alta o en configuraciones con cuantización no oficial, útil para demos y validación de ideas.
- Estudio de formatos de decodificación restringida: el protocolo de parada en EOS y el límite de tokens funcionales lo convierten en un caso práctico para implementar decodificación controlada en producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, con decodificación greedy, máximo de 384 tokens nuevos y 32 tokens funcionales, y puntuación por coincidencia exacta:

| Test set | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 58,45% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 78,67% |
| CommonsenseQA | 1.221 | 79,61% |
| Coin Flip (corregido por paridad) | 3.333 | 82,81% |

El autor indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, están en `test_results.json` del repositorio. No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks, por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 20-24 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justa pero viable con batch pequeño).
- GPU de consumo: cabe en RTX 4090 y, con cuantización de terceros no oficial, podría caber en GPUs de 12-16 GB; no se publican pesos GGUF oficiales.
- Opciones de despliegue: Transformers con `device_map="auto"` (soporte oficial documentado); el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla configuración. No se documentan variantes para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a `test_results.json` para la latencia con batch 1.
- Nota: el vocabulario extendido con 514 tokens nuevos requiere usar el tokenizer del repositorio; tokenizers del modelo base no reconocerán los tokens funcionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18 | 8,03B | No disponible | GSM8K 58,45%; MultiArith 99,44%; CommonsenseQA 79,61% | Llama 3.1 Community License | Hugging Face, 223 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | No disponible en esta ficha (referencia del modelo base) | Llama 3.1 Community License | Hugging Face, ampliamente disponible |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full | 8,03B | No disponible | No disponible en la información proporcionada | Llama 3.1 Community License | Hugging Face |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3 / -6 / -12 / -24 | 8,03B | No disponible | No disponible en la información proporcionada | Llama 3.1 Community License | Hugging Face |

La comparativa se limita a la familia CIRF del mismo autor y al modelo base, ya que no se dispone de resultados de benchmarks de alternativas en la información proporcionada. La variante -18 se sitúa en un punto intermedio del espectro de presupuestos de tokens de resultado (3, 6, 12, 18, 24), orientada a equilibrar compacidad de traza y precisión.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea degradado respecto al modelo base.
- Contexto: no se especifica la longitud de contexto efectiva de esta variante; aunque el modelo base soporta 128.000 tokens, el ajuste con tokens funcionales puede no preservar ese comportamiento.
- Formato rígido: requiere el prompt `QUESTION[sof]`, decodificación con `skip_special_tokens=False` y parada en EOS; un uso incorrecto del tokenizer o de la plantilla de chat produce salidas inválidas.
- Riesgo de alucinación: como todo modelo generativo de 8B, puede producir trazas plausibles pero incorrectas; el 58,45% en GSM8K indica que falla en una proporción significativa de problemas matemáticos de varios pasos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; hereda los sesgos del corpus de entrenamiento de Llama 3.1 y del dataset de ajuste CIRF, no especificado.
- Licencia: Llama 3.1 Community License impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales), obligaciones de atribución ("Built with Llama") y política de uso aceptable; revisar `LICENSE` y `USE_POLICY.md` antes de producción.
- Madurez: 223 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con validación comunitaria extensa.
- Dataset de Coin Flip: el propio autor advierte que cerca del 20% de las etiquetas del dataset discrepan con la paridad declarada en la pregunta, por lo que la métrica se corrige; comparaciones con terceros deben tenerlo en cuenta.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones oficiales, lo que limita su uso directo en pipelines de producción complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF completa: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante sin resultados: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante presupuesto 3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante presupuesto 6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante presupuesto 12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante presupuesto 24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
