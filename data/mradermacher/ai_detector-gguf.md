# mradermacher/Ai_detector-GGUF

## Resumen

El modelo `mradermacher/Ai_detector-GGUF` es una versión cuantizada en formato GGUF del clasificador binario `videogameaetoros/Ai_detector`, diseñado para detectar si un texto ha sido generado por inteligencia artificial. El autor de la cuantización, mradermacher, ha convertido los pesos originales a múltiples niveles de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y f16) para permitir su ejecución eficiente en CPU y en GPUs de gama baja mediante motores de inferencia como llama.cpp, Ollama o LM Studio.

El modelo base está construido sobre la arquitectura ModernBERT, un transformer encoder optimizado para clasificación de texto, con aproximadamente 124,6 millones de parámetros. Su pipeline es `text-classification` y produce una salida binaria (texto humano vs. texto generado por IA). La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integrar en herramientas de verificación de contenido, moderación o control de calidad editorial.

La relevancia actual de este modelo radica en la creciente necesidad de detectar contenido sintético en entornos académicos, periodísticos y corporativos. Al estar disponible en GGUF, puede desplegarse en entornos sin GPU dedicada, algo que no ofrecen la mayoría de detectores comerciales basados en APIs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 124.645.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; ModernBERT soporta hasta 8192 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base `videogameaetoros/Ai_detector` es un fine-tuning de ModernBERT, una arquitectura de transformer tipo encoder optimizada para tareas de clasificación y extracción de características. ModernBERT introduce mejoras sobre BERT clásico, como atención con ventana local y global, normalización pre-LayerNorm y una mayor eficiencia en el uso de memoria, lo que permite contextos más largos y menor latencia en inferencia.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de fine-tuning (si se usó RLHF, DPO u otra técnica). El modelo está entrenado específicamente para clasificación binaria de texto: distingue entre contenido escrito por humanos y contenido generado por modelos de lenguaje. La cuantización realizada por mradermacher es estática (no usa imatrix ni weighted quantization), y se ha aplicado directamente sobre los pesos del modelo base sin reentrenamiento.

## Capacidades

- Clasificacion binaria de texto: determina si un fragmento es generado por IA o escrito por humanos.
- Procesamiento de texto en ingles, con soporte de contextos de longitud media (limitado por la ventana de ModernBERT).
- Inferencia rapida en CPU gracias a las cuantizaciones GGUF de bajo bit (Q2_K, Q3_K, Q4_K).
- Compatible con motores de inferencia locales como llama.cpp, Ollama, LM Studio y otros que soporten GGUF.
- No es un modelo generativo: no produce texto, solo emite una etiqueta de clasificacion con probabilidad asociada.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un encoder de clasificacion.

## Casos de uso

- Verificacion de originalidad academica: integrar el modelo en un pipeline que analice ensayos o trabajos de estudiantes para detectar posibles usos de ChatGPT u otros generadores. Su bajo coste computacional permite procesar grandes volumenes de documentos en lote.
- Moderacion de contenido en plataformas editoriales: filtrar articulos o comentarios generados automaticamente antes de su publicacion, reduciendo el spam y el contenido de baja calidad.
- Control de calidad en agencias de marketing: comprobar si los textos redactados por freelancers o herramientas internas son genuinamente humanos, especialmente en campañas donde la autenticidad es un requisito del cliente.
- Auditoria de contenido en redes sociales: analizar publicaciones sospechosas de ser generadas por bots de IA, ayudando a detectar campañas de desinformacion automatizadas.
- Herramienta de desarrollo para aplicaciones de escritura asistida: ofrecer a los usuarios un indicador de "probabilidad de IA" en editores de texto, similar a Grammarly pero sin depender de servicios externos.
- Investigacion en deteccion de contenido sintetico: servir como modelo de referencia ligero para comparar tecnicas de deteccion o para generar datos de entrenamiento sinteticos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como exactitud, F1, AUC o comparaciones con otros detectores de IA (GPTZero, Originality.ai, etc.) en la model card ni en la pagina de HuggingFace. El autor de la cuantizacion no proporciona datos de rendimiento mas alla de los tamaños de archivo de cada cuantizacion.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan entre 0,2 GB (Q2_K) y 0,4 GB (f16), por lo que caben en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, AMD RX 5000 o superior) o incluso CPU sola, gracias a las cuantizaciones de bajo bit.
- En consumer GPU: si, cabe en GPUs de 4 GB o menos, como GTX 1650, RTX 3050 o incluso en Apple Silicon con Unified Memory.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier runtime compatible con GGUF. Tambien se puede usar el modelo original en safetensors con transformers en GPU.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de 124M de parametros, la inferencia en CPU con Q4_K_M deberia completarse en decenas de milisegundos por texto corto (menos de 512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| mradermacher/Ai_detector-GGUF | 124,6M | no disponible | GGUF | MIT | Deteccion de texto IA |
| openai-detector (roberta-base) | 125M | 512 | safetensors | MIT | Deteccion de texto IA (obsoleto) |
| gptzero (propietario) | no disponible | no disponible | API | propietaria | Deteccion de texto IA |
| originality.ai (propietario) | no disponible | no disponible | API | propietaria | Deteccion de texto IA y plagio |

La comparativa con alternativas propietarias es limitada porque no publican pesos ni arquitectura. Frente a detectores open source como `roberta-base` fine-tuneado para deteccion de IA, este modelo ofrece la ventaja de estar basado en ModernBERT, que es mas eficiente y soporta contextos mas largos, ademas de estar disponible en GGUF para despliegue local sin GPU.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con texto en ingles, su rendimiento en otros idiomas es muy limitado o nulo. No se recomienda su uso fuera del ingles.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos. La precision en textos muy cortos (menos de 50 caracteres) o muy tecnicos puede ser baja.
- Limitaciones de contexto: la ventana de ModernBERT es de 8192 tokens como maximo, pero no se confirma si el fine-tuning respeta ese limite. Textos mas largos deberan truncarse o dividirse.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener limitaciones adicionales no documentadas en la model card.
- Caveat de produccion: la cuantizacion es estatica y no usa imatrix, por lo que las versiones de bajo bit (Q2_K, Q3_K) pueden degradar notablemente la precision. Se recomienda usar Q4_K_M o superior para tareas criticas.
- El modelo no distingue entre diferentes tipos de generadores de IA; solo emite una probabilidad binaria, sin explicacion de por que un texto es considerado sintetico.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Ai_detector-GGUF
- Modelo base original: https://huggingface.co/videogameaetoros/Ai_detector
- Pagina de modelos de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Discusion sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
