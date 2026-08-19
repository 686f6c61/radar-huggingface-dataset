# mradermacher/Mew1-2.6B-i1-GGUF

## Resumen

Mew1-2.6B-i1-GGUF es una colección de cuantizaciones GGUF del modelo de lenguaje Mew1-2.6B, desarrollado originalmente por Unmid y cuantizado por mradermacher. Este modelo de 2.600 millones de parámetros está diseñado específicamente para roleplay y conversación sin censura, orientado a aplicaciones de narrativa interactiva y chatbots. La versión GGUF permite ejecutarlo en entornos con recursos limitados, desde portátiles hasta GPUs de consumo, gracias a la compresión por cuantización.

El repositorio incluye 24 variantes de cuantización, desde IQ1_S (0,8 GB) hasta Q6_K (2,3 GB), todas generadas con matriz de importancia (imatrix) para optimizar la calidad respecto al tamaño. El modelo base se distribuye en formato safetensors con precisión bf16, y la licencia es lfm1.0, una licencia de código abierto con condiciones específicas. Está pensado para usuarios que buscan un modelo ligero, desplegable localmente, con capacidades conversacionales y de generación de texto creativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren linear-rnn, sin confirmación) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo base Mew1-2.6B. Los tags del repositorio incluyen `linear-rnn`, lo que sugiere que podría tratarse de un modelo basado en redes neuronales recurrentes lineales o una arquitectura híbrida, pero no hay documentación que lo confirme. El modelo fue publicado originalmente por Unmid en formato safetensors con precisión bf16, y posteriormente cuantizado por mradermacher utilizando la técnica de matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión.

No se han publicado detalles sobre el proceso de entrenamiento, el volumen de datos utilizado, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. La etiqueta `uncensored` indica que el modelo fue entrenado o ajustado para eliminar restricciones de contenido, lo que sugiere un enfoque de alineación mínima o nula. Tampoco se especifica la longitud de contexto soportada, un dato crítico para aplicaciones de roleplay con historias largas.

## Capacidades

- Generación de texto conversacional y narrativo, optimizado para roleplay y diálogos interactivos.
- Soporte de conversaciones multi-turno con memoria contextual (dentro de los límites de la ventana de contexto, no especificada).
- Contenido sin censura: el modelo no aplica filtros de seguridad estándar, lo que permite generar material explícito o sensible si el usuario lo solicita.
- Capacidad multilingüe limitada: aunque la ficha indica solo inglés, puede generar texto en otros idiomas con menor calidad.
- No se han confirmado capacidades de tool calling, function calling, razonamiento multi-paso, ni soporte de agentes.
- No incluye capacidades multimodales (visión, audio).

## Casos de uso

- Roleplay y ficción interactiva: el modelo puede mantener personajes y tramas complejas, generando respuestas coherentes en diálogos de larga duración. Su tamaño reducido permite ejecutarlo en local sin necesidad de infraestructura cloud.
- Chatbots de entretenimiento: ideal para aplicaciones de chat sin filtros, como asistentes virtuales con personalidad o simulaciones de personajes históricos o ficticios.
- Generación de narrativa creativa: puede usarse como herramienta de escritura asistida para cuentos, guiones o novelas, especialmente en contextos donde se requiera un tono desinhibido.
- Prototipado rápido de asistentes conversacionales: su bajo coste de inferencia lo hace adecuado para pruebas de concepto en entornos de desarrollo con GPUs modestas.
- Educación y experimentación con modelos sin censura: útil para investigadores que estudian el comportamiento de modelos no alineados o los efectos de la cuantización en la calidad del texto.
- Despliegue en dispositivos edge: las cuantizaciones más pequeñas (IQ1_S, 0,8 GB) permiten ejecutar el modelo en hardware con menos de 2 GB de RAM, como Raspberry Pi 5 o teléfonos móviles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. La ausencia de evaluaciones formales dificulta la comparación objetiva con otros modelos de tamaño similar.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. Para las versiones más grandes (Q6_K, 2,3 GB), se recomienda al menos 4 GB de VRAM. Las versiones pequeñas (IQ1_S, 0,8 GB) pueden funcionar con 2 GB o incluso en CPU.
- GPUs compatibles: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar las cuantizaciones Q4_K_M o superiores. Para las versiones más ligeras, basta con 2 GB (GTX 1050 Ti, integradas modernas).
- El modelo puede ejecutarse en CPU pura con llama.cpp, aunque la velocidad será notablemente inferior. Con una GPU moderna, se pueden alcanzar velocidades de 20-40 tokens/s en las cuantizaciones Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), o cualquier runtime compatible con GGUF.
- El archivo imatrix (0,1 GB) es necesario solo si se desea crear cuantizaciones personalizadas; no se requiere para la inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría. Mew1-2.6B comparte tamaño con modelos como TinyLlama-1.1B o Qwen2.5-1.5B, pero su enfoque sin censura y su arquitectura (posiblemente linear-rnn) lo diferencian. No hay datos públicos de rendimiento que permitan una comparación objetiva. Se recomienda consultar benchmarks independientes si se necesita evaluar su calidad relativa.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar material ofensivo, ilegal o sexualmente explícito. No es adecuado para aplicaciones comerciales que requieran moderación de contenido.
- Riesgo de alucinaciones: al ser un modelo pequeño (2,6B) y no alineado, es propenso a inventar hechos, nombres o eventos, especialmente en contextos largos.
- Idioma limitado: solo se garantiza un buen rendimiento en inglés. Otros idiomas pueden producir resultados incoherentes o con errores gramaticales.
- Licencia lfm1.0: aunque es una licencia de código abierto, puede incluir cláusulas restrictivas (por ejemplo, prohibición de uso comercial o requisitos de atribución). Es necesario revisar el texto completo de la licencia antes de su uso en producción.
- Sin soporte técnico: el modelo es un proyecto de cuantización sin mantenimiento activo; no se garantizan actualizaciones ni correcciones de errores.
- Longitud de contexto desconocida: no se especifica la ventana de contexto máxima, lo que puede provocar degradación del rendimiento en conversaciones muy largas o pérdida de coherencia.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Mew1-2.6B-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Unmid/Mew1-2.6B
- Versión estática GGUF: https://huggingface.co/mradermacher/Mew1-2.6B-GGUF
- Página de descarga alternativa: https://hf.tst.eu/model#Mew1-2.6B-i1-GGUF
- Guía de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
