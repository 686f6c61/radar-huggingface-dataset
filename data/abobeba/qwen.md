# abobeba/qwen

## Resumen

El modelo `abobeba/qwen` es un reempaquetado en formato GGUF del modelo Qwen3.6-35B-A3B, un MoE multimodal de la familia Qwen, modificado por HauhauCS para eliminar los rechazos de contenido (variante "Aggressive", con 0/465 refusals). Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse en entornos locales con llama.cpp, LM Studio o cualquier runtime compatible con GGUF. El repositorio incluye múltiples cuantizaciones, incluidos los quants personalizados K_P de HauhauCS, y el proyector multimodal (mmproj) necesario para tareas de visión.

El modelo base, Qwen3.6-35B-A3B, es un MoE de 35 000 millones de parámetros totales con aproximadamente 3 000 millones de parámetros activos por token, 256 expertos con 8 rutados por token, arquitectura híbrida de atención lineal y softmax completa (proporción 3:1), 40 capas y una ventana de contexto nativa de 262 144 tokens. Es nativamente multimodal (texto, imagen y vídeo). La versión "uncensored" no altera las capacidades del modelo original, solo elimina los mecanismos de rechazo, por lo que conserva todas las funcionalidades de razonamiento, generación de código y visión del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención lineal + softmax completa, ratio 3:1) |
| Parametros totales | 34 660 610 688 (~34,66 B) |
| Parametros activos | ~3 B por token (8 de 256 expertos) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M, mmproj f16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE híbrida que combina capas de atención lineal con capas de atención softmax completa en una proporción de 3:1. Esta combinación reduce el coste computacional del mecanismo de atención en secuencias largas, manteniendo la calidad de modelado de dependencias a corto plazo. Con 256 expertos y 8 rutados por token, el coste de inferencia por token es comparable al de un modelo denso de ~3 000 millones de parámetros, a pesar de tener 35 000 millones en total. El modelo tiene 40 capas y soporta una ventana de contexto nativa de 262 144 tokens.

El proceso de "uncensoring" realizado por HauhauCS consiste en una técnica de abliteración (abliteration) sobre los pesos del modelo original, que elimina selectivamente las direcciones del espacio de activaciones asociadas a los comportamientos de rechazo. Según la model card, no se modifican los datasets ni las capacidades del modelo; solo se eliminan los rechazos. Los quants K_P se generan con matriz de importancia (imatrix) para preservar la calidad en los pesos ablacionados. No se proporcionan detalles sobre el dataset de entrenamiento original del modelo base, ni sobre el proceso de alineación (RLHF/DPO) aplicado por Qwen.

## Capacidades

- Generación de texto y razonamiento complejo en modo "thinking" (pensamiento encadenado) y modo directo.
- Generación de código y soporte para tareas de programación, con parámetros de sampling recomendados específicos para precisión.
- Comprensión multimodal: procesa imágenes y vídeo además de texto, gracias al proyector mmproj incluido.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades multilingües, con soporte principal para inglés y chino, y cobertura multilingüe adicional.
- Ventana de contexto muy amplia (262 144 tokens) que permite procesar documentos extensos, conversaciones largas o vídeos completos.
- Sin rechazos de contenido: el modelo genera respuestas completas incluso para solicitudes que el modelo base rechazaría, aunque puede añadir avisos breves ocasionales.

## Casos de uso

- Asistentes de atención al cliente con contexto largo: la ventana de 262 144 tokens permite mantener conversaciones multi-turno extensas con historial completo, sin truncamiento, y el modo "thinking" mejora la coherencia de las respuestas.
- Generación de código en producción: con tool calling y soporte para tareas de programación, puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests, usando los parámetros de sampling recomendados para tareas precisas.
- Análisis de documentos extensos: procesa contratos, informes o libros completos en una sola pasada gracias a su contexto nativo de 262K tokens, con capacidad de razonamiento sobre el contenido íntegro.
- Sistemas de agentes autónomos: al no rechazar solicitudes y soportar function calling, puede actuar como núcleo de agentes que interactúan con APIs, ejecutan comandos o toman decisiones multi-paso.
- Procesamiento de vídeo e imágenes: el proyector multimodal permite analizar contenido visual, generar descripciones, responder preguntas sobre imágenes o resumir vídeos, todo en un solo modelo.
- Investigación en alineación y seguridad: al ser una variante sin rechazos, resulta útil para estudiar los mecanismos de rechazo de los modelos base, evaluar la eficacia de la abliteración y desarrollar técnicas de control de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparativas cuantitativas con el modelo base o con alternativas. Se recomienda consultar la documentación oficial de Qwen para los benchmarks del modelo Qwen3.6-35B-A3B original, asumiendo que la variante uncensored mantiene un rendimiento similar al no alterar las capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: el Q4_K_M ocupa 21 GB, el Q4_K_P 23 GB, el Q5_K_M 28 GB, el Q6_K 31 GB y el Q8_K_P 44 GB. Los quants más pequeños (IQ2_M, 11 GB) pueden ejecutarse en GPUs con 12-16 GB de VRAM.
- GPU recomendadas: para los quants Q4 (21-23 GB) se necesita una GPU con al menos 24 GB de VRAM, como una RTX 4090, RTX 3090 o A5000. Para Q5 y superiores, se requieren GPUs de 32 GB o más, como A100, H100 o RTX 6000 Ada. Los quants IQ2/IQ3 pueden funcionar en GPUs de 16 GB (RTX 4080, RTX 3080 Ti) con cuantización agresiva.
- En consumer GPU: sí, cabe en GPUs de gama alta (RTX 4090 con 24 GB) usando quants Q4 o inferiores. Para quants Q8 se necesita hardware profesional o de centro de datos.
- Opciones de despliegue: llama.cpp (con la bandera `--jinja` para la plantilla de chat), LM Studio, Ollama, vLLM (si soporta GGUF), y cualquier runtime compatible con GGUF. El proyector mmproj debe cargarse junto al modelo para tareas de visión.
- Latencia y throughput: no se proporcionan datos medidos. Como MoE con ~3B activos, el throughput por token es significativamente mayor que un modelo denso de 35B, pero depende del hardware y de la cuantización. En una RTX 4090 con Q4_K_M, se puede esperar un rendimiento del orden de 20-40 tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 34,66 B | ~3 B | 262 144 | MoE híbrido | Apache 2.0 |
| abobeba/qwen (este) | 34,66 B | ~3 B | 262 144 | MoE híbrido (sin rechazos) | Apache 2.0 |
| Qwen3-30B-A3B (generación anterior) | 30,5 B | ~3 B | 131 072 | MoE denso | Apache 2.0 |

La comparativa se limita a la familia Qwen, ya que no se dispone de datos de otros modelos MoE multimodales con características equivalentes. La principal diferencia con el modelo base es la eliminación de rechazos, que no afecta a las especificaciones técnicas. Frente a Qwen3-30B-A3B, este modelo añade multimodalidad (visión) y duplica la ventana de contexto, manteniendo un número similar de parámetros activos.

## Limitaciones y advertencias

- Modelo "uncensored": al eliminar los rechazos, el modelo puede generar contenido ofensivo, peligroso, ilegal o éticamente problemático sin filtros. Su uso en producción requiere medidas de control adicionales (filtros externos, moderación) y es responsabilidad del desplegador.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en modo "thinking" con temperatura alta. Se recomienda verificar las salidas en aplicaciones críticas.
- Sesgos conocidos: el modelo base Qwen puede presentar sesgos culturales, de género o ideológicos derivados de sus datos de entrenamiento. La abliteración no corrige estos sesgos.
- Limitaciones de idioma: aunque es multilingüe, el rendimiento fuera de inglés y chino puede ser inferior. No se garantiza cobertura de todos los idiomas.
- Restricciones de licencia: aunque la licencia declarada es Apache 2.0, el modelo base Qwen3.6-35B-A3B puede tener términos adicionales en su propia licencia. Se recomienda revisar la licencia del modelo original antes de un uso comercial.
- Requisitos de contexto: los autores recomiendan mantener al menos 128K de contexto para preservar las capacidades de razonamiento. Reducir la ventana puede degradar el rendimiento en tareas complejas.
- Compatibilidad: los quants K_P pueden mostrarse como "?" en LM Studio, aunque funcionan correctamente. Es necesario usar la bandera `--jinja` en llama.cpp para la plantilla de chat correcta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abobeba/qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio original de HauhauCS (variante Aggressive): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
