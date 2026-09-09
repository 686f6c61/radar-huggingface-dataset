# mradermacher/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF

## Resumen
El modelo MiniCPM5-2B-SFT-Pashto-Instruct-GGUF es una cuantización en formato GGUF del modelo base nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct, un ajuste de instrucciones (SFT) sobre la familia MiniCPM5 especializado en pastún (lengua irania hablada en Afganistán y Pakistán) y en inglés. El proceso de cuantización fue realizado por mradermacher, que ha publicado un conjunto de archivos GGUF con diferentes grados de compresión (desde Q2_K hasta f16) para facilitar su uso en entornos de inferencia local con herramientas como llama.cpp u Ollama. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones, lo que lo convierte en un recurso atractivo para proyectos de NLP en lenguas de bajo recurso.

Con aproximadamente 2.517 millones de parámetros, el modelo es compacto y puede ejecutarse en hardware modesto, aunque la información disponible no especifica la longitud de contexto ni la arquitectura exacta más allá de ser un modelo causal de lenguaje. Su relevancia actual se debe a la escasez de modelos abiertos entrenados específicamente para pastún, y a que las cuantizaciones GGUF permiten su despliegue en CPUs y GPUs de consumo sin necesidad de infraestructura de servidores.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible (modelo causal de lenguaje de la familia MiniCPM5) |
| Parámetros totales | 2.516.944.896 (aprox. 2,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Pastún (ps), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo. Por la metadata se trata de un modelo causal de lenguaje de la familia MiniCPM5, con un total de 2.516.944.896 parámetros. El modelo original (nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct) fue afinado mediante entrenamiento supervisado de instrucciones (SFT), utilizando posiblemente técnicas de bajo rango como LoRA o QLoRA, tal y como sugieren las etiquetas "lora" y "qlora" de la model card. También aparece la etiqueta "tokenizer-surgery", lo que indica que el tokenizador fue modificado o extendido para el idioma pastún.

No se especifica el tamaño ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El proceso de cuantización a GGUF fue realizado por mradermacher, publicando doce versiones distintas del modelo con diferentes niveles de precisión.

## Capacidades
- Generación de texto en pastún e inglés siguiendo instrucciones, gracias al fine-tuning de SFT.
- Conversación multi-turno básica, como indica el pipeline "text-generation" y la etiqueta "conversational".
- Capacidad de ejecutarse en local mediante herramientas compatibles con GGUF, lo que facilita su integración en aplicaciones de escritorio o móviles.
- No se especifica en la información disponible si el modelo soporta tool calling, agentes, razonamiento avanzado, visión, audio u otras capacidades multimodales.
- El modelo está adaptado para el idioma pastún de bajo recurso, lo que supone una ventaja frente a modelos generales sin este ajuste.

## Casos de uso
- Atención al cliente automatizada en pastún: el modelo puede gestionar consultas frecuentes en pastún en plataformas de mensajería o chat web, gracias a su ajuste de instrucciones y a su capacidad de conversación. Su tamaño compacto permite desplegarlo en una máquina local con una GPU modesta, sin necesidad de servicios externos.
- Asistente personal para hablantes de pastún: puede responder preguntas prácticas, redactar mensajes, listas y recordatorios en pastún, facilitando el acceso a herramientas de IA a una comunidad lingüística con poca presencia en modelos comerciales.
- Documentación administrativa y legal en Afganistán: el modelo puede redactar, resumir y clasificar documentos en pastún para instituciones locales u ONG, reduciendo el tiempo de procesamiento manual. La licencia Apache 2.0 permite su uso comercial.
- Generación de contenido educativo en pastún: creación de ejercicios, explicaciones y textos escolares para estudiantes, especialmente en contextos de baja conectividad donde no se dispone de APIs de gran tamaño.
- Traducción asistida pastún-inglés: al estar preentrenado en ambos idiomas, puede servir de apoyo en tareas de traducción y transliteración, aunque la calidad dependerá de la evaluación previa con el corpus deseado.
- Investigación en NLP de lenguas de bajo recurso: sirve como modelo base para experimentos de fine-tuning, evaluación de técnicas de tokenizer-surgery o comparación de cuantizaciones. Su disponibilidad en GGUF facilita su uso en entornos de investigación con recursos limitados.
- Integración en pipelines de análisis de sentimiento en pastún: el modelo puede adaptarse mediante fine-tuning adicional para clasificar opiniones en redes sociales, si se dispone de un corpus etiquetado. Al ser un modelo pequeño, el costo de experimentación es bajo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: los archivos GGUF tienen un tamaño que va desde 1,1 GB (Q2_K) hasta 5,1 GB (f16). Para inferencia con GPU se recomienda añadir margen para el contexto y la computación. Con Q4_K_M (1,7 GB) se necesita al menos 4 GB de VRAM; con Q8_0 (2,8 GB) al menos 6 GB; con f16 (5,1 GB) al menos 8-10 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para todas las cuantizaciones; RTX 4090 o A100 para f16 con contextos largos. En CPU, el modelo puede ejecutarse con llama.cpp usando entre 2 y 6 GB de RAM según la cuantización.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 4 GB de VRAM o más es suficiente para las cuantizaciones Q3 y Q4. Con Q2_K, incluso 2 GB pueden ser suficientes para contextos cortos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otras aplicaciones compatibles con GGUF. Para el modelo base en formato safetensors se puede usar vLLM, TGI o Transformers. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares
| Modelo | Parámetros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct | 2,5B | Safetensors | ps, en | Apache 2.0 | Modelo base sin cuantizar, afinado en pastún |
| mradermacher/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF | 2,5B | GGUF | ps, en | Apache 2.0 | Cuantización del modelo base, objeto de esta ficha |
| mradermacher/MiniCPM5-2B-GGUF | 2,5B | GGUF | No especificado | Apache 2.0 | Versión general de MiniCPM5, sin ajuste en pastún |

No se dispone de benchmarks que permitan comparar el rendimiento entre estos modelos.

## Limitaciones y advertencias
- Sesgos: al ser un modelo entrenado con datos limitados de pastún, puede heredar sesgos presentes en su dataset de fine-tuning, que no se describe en la información disponible.
- Riesgo de alucinación: igual que otros modelos de 2,5B, puede generar respuestas inventadas o factualmente incorrectas, especialmente en temas de conocimiento general.
- Limitaciones de idioma: su capacidad fuera del pastún e inglés es probablemente muy limitada, y no se recomienda su uso para lenguas no contempladas en el entrenamiento.
- La licencia Apache 2.0 permite el uso comercial y la modificación, pero se deben conservar los avisos de copyright y licencia en los archivos redistribuidos.
- Las cuantizaciones agresivas (Q2_K, IQ4_XS) pueden reducir notablemente la calidad de las respuestas, por lo que se recomienda probar varias versiones antes de seleccionar una para producción.
- El modelo está publicado con cero descargas y cero valoraciones en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Se recomienda evaluar su calidad antes de su uso.

## Enlaces
- HuggingFace: https://huggingface.co/mradermacher/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF
- Modelo base (safetensors): https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct
- Versión GGUF alternativa del modelo base: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF
- Modelo general MiniCPM5-2B: https://huggingface.co/mradermacher/MiniCPM5-2B-GGUF
- Página de descarga referenciada en la model card: https://hf.tst.eu/model#MiniCPM5-2B-SFT-Pashto-Instruct-GGUF
