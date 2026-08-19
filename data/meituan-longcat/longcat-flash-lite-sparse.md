# meituan-longcat/LongCat-Flash-Lite-Sparse

## Resumen

LongCat-Flash-Lite-Sparse es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) no-thinking desarrollado por Meituan, con 69 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. Se construye sobre su predecesor denso LongCat-Flash-Lite, sustituyendo la atención densa MLA por LongCat Sparse Attention (LSA), un marco de atención dispersa eficiente en hardware que extiende DeepSeek Sparse Attention (DSA). El modelo soporta de forma nativa contextos de hasta 1 millón de tokens, lo que lo hace especialmente adecuado para tareas agenticas, codificación y búsqueda sobre documentos largos.

La relevancia de este lanzamiento radica en que combina una ventana de contexto extremadamente larga con una activación dispersa que reduce el coste computacional por token, manteniendo un rendimiento competitivo en razonamiento general y matemáticas. Publicado bajo licencia MIT, está disponible para uso comercial y de investigación sin restricciones. Los resultados reportados en el informe técnico muestran mejoras sustanciales frente a su versión densa en tareas como SWE-Bench Verified (68,2 % frente a 54,4 %) y τ²-Telecom (95,2 % frente a 72,8 %), lo que evidencia su potencial en entornos de agentes y herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con LongCat Sparse Attention (LSA), basado en LongCat-Flash-Lite |
| Parametros totales | 69 127 158 912 (69B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta 1 024 000 tokens (1M) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (benchmarks en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LongCat-Flash-Lite-Sparse es un modelo MoE no-thinking que emplea LongCat Sparse Attention (LSA), un marco de atención dispersa diseñado para eficiencia en hardware. LSA introduce tres mecanismos complementarios: Streaming-Aware Indexing (SI), que asigna parte del presupuesto de selección de tokens a un sink fijo y a una ventana deslizante local, convirtiendo accesos fragmentados de KV en lecturas contiguas y mejorando el ancho de banda HBM; Cross-Layer Indexing (CLI), que explota la estabilidad de la saliencia de atención entre capas adyacentes para reutilizar un único pase de indexado en varias capas, aprendido mediante destilación cruzada durante el entrenamiento; y Hierarchical Indexing (HI), un esquema de dos etapas de grueso a fino que primero recupera bloques candidatos con puntuaciones gruesas y luego selecciona tokens finos dentro de esos bloques, reduciendo el espacio de candidatos por consulta.

El entrenamiento se realizó en dos fases principales. Primero, se actualizó la etapa de extensión de contexto de LongCat-Flash-Lite con un corpus enriquecido y un programa progresivo que escala hasta 1 024K tokens, logrando soporte nativo de 1M de contexto. Segundo, se aplicó destilación cruzada entre capas para aprender la reutilización de índices. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset. El modelo se distribuye en formato safetensors y se integra con la librería LongCat-Flash-Lite-Sparse, compatible con transformers.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte nativo de contexto de hasta 1M tokens.
- Razonamiento matemático y general: obtiene 96,8 % en MATH500 y 85,3 % en MMLU (con HI).
- Codificación agentica: destaca en SWE-Bench Verified (65,2 % con HI) y SWE-Bench Multilingual (56,0 %).
- Uso de herramientas y agentes: mejora notable en τ²-Telecom (96,1 %), VitaBench (20,4 %) y MCP-Atlas (45,0 %).
- Búsqueda agentica: resultados sólidos en BrowseComp (48,2 %), BrowseComp-zh (61,6 %) y RWSearch (66,0 %).
- Capacidades multilingües: aunque no se documenta la lista de idiomas, los benchmarks incluyen tareas en chino (CMMLU 84,5 %, C-Eval 85,7 %) e inglés.
- No incluye modo thinking explícito; es un modelo no-thinking con razonamiento directo.

## Casos de uso

- Desarrollo de software con contexto largo: el modelo puede manejar repositorios completos o archivos de gran tamaño gracias a su ventana de 1M tokens, facilitando tareas de refactorización, revisión de código y resolución de issues en entornos integrados.
- Agentes autónomos de codificación: con soporte para tool use y búsqueda, puede integrarse en pipelines de CI/CD para generar parches, ejecutar pruebas y corregir errores de forma automática, como sugiere su rendimiento en SWE-Bench Verified.
- Asistencia en búsqueda y recuperación de información: su capacidad para procesar documentos extensos permite construir sistemas de respuesta a preguntas sobre manuales, informes o bases de conocimiento con citas y verificación.
- Atención al cliente automatizada: con 1M de contexto, puede mantener conversaciones multi-turno con historial completo de la interacción y acceder a documentación extensa en tiempo real, mejorando la precisión de las respuestas.
- Análisis de documentos legales o financieros: el modelo puede resumir y extraer información de contratos, informes anuales o expedientes de gran longitud, reduciendo el tiempo de revisión manual.
- Investigación académica y científica: su rendimiento en GPQA-Diamond (69,0 %) y AIME 2026 (65,7 %) lo hace útil para asistir en razonamiento complejo y resolución de problemas matemáticos avanzados.

## Benchmarks y rendimiento

Los resultados provienen del informe técnico del modelo (arxiv:2608.01662) y comparan la versión densa (Lite-Dense) con la versión sparse sin HI y con HI. Se muestran los valores reportados.

| Benchmark | Lite-Dense | Lite-Sparse (sin HI) | Lite-Sparse (con HI) |
|---|---|---|---|
| SWE-Bench Verified (acc) | 54,40 | 68,20 | 65,20 |
| SWE-Bench Pro (acc) | - | 40,63 | 39,40 |
| SWE-Bench Multilingual (acc) | 38,10 | 59,33 | 56,00 |
| TerminalBench 2.0 (acc) | 33,75 | 33,70 | 32,58 |
| τ²-Telecom (avg@4) | 72,80 | 95,18 | 96,05 |
| VitaBench (avg@4) | 7,00 | 21,67 | 20,42 |
| MCP-Atlas | - | 45,60 | 45,00 |
| BrowseComp (pass@1) | - | 48,62 | 48,18 |
| BrowseComp-zh (pass@1) | - | 61,94 | 61,59 |
| RWSearch (pass@1) | - | 68,50 | 66,00 |
| MMLU (acc) | 85,52 | 85,31 | 85,14 |
| MMLU-Pro (acc) | 78,29 | 79,24 | 78,68 |
| CMMLU (acc) | 82,48 | 84,25 | 84,51 |
| C-Eval (acc) | 86,55 | 85,76 | 85,71 |
| GPQA-Diamond (avg@16) | 66,78 | 69,49 | 69,03 |
| MATH500 (acc) | 96,80 | 95,80 | 96,80 |
| AIME 2026 (avg@32) | - | 65,73 | (dato incompleto) |

No se han publicado resultados de benchmarks comparativos con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware. Las siguientes estimaciones se basan en el tamaño de parámetros (69B totales) y son orientativas.
- Para inferencia en precisión fp16, los pesos ocupan aproximadamente 138 GB, lo que requiere múltiples GPUs de alta gama (por ejemplo, 2× A100 80GB o 4× RTX 4090 24GB).
- Con cuantización de 8 bits, el uso de VRAM se reduce a unos 69 GB, permitiendo ejecución en una sola GPU de 80 GB (A100, H100) o dos de 48 GB.
- Con cuantización de 4 bits, la memoria necesaria baja a unos 35 GB, lo que podría caber en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) con margen.
- Al ser un MoE con solo 3B parámetros activos, el coste computacional por token es bajo, pero la memoria requerida depende de los pesos totales.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp (si se generan archivos GGUF). No se confirma soporte oficial de Ollama.
- La latencia y el throughput dependen en gran medida del hardware y de la cuantización; no hay cifras publicadas.

## Comparativa con modelos similares

La información disponible solo permite comparar LongCat-Flash-Lite-Sparse con su predecesor denso (LongCat-Flash-Lite). No se ofrecen datos de otros modelos MoE comparables (por ejemplo, DeepSeek-V3 o Qwen MoE) en la documentación consultada.

| Caracteristica | LongCat-Flash-Lite (denso) | LongCat-Flash-Lite-Sparse (con HI) |
|---|---|---|
| Arquitectura | Densa con MLA | MoE con LSA |
| Parametros totales | No disponible | 69B |
| Parametros activos | No disponible | ~3B |
| Contexto | Hasta 1M (tras extensión) | Hasta 1M |
| SWE-Bench Verified | 54,40 | 65,20 |
| MMLU | 85,52 | 85,14 |
| τ²-Telecom | 72,80 | 96,05 |
| Licencia | MIT | MIT |

La versión sparse mejora significativamente en tareas agenticas y de tool use, con una ligera pérdida en MMLU, a cambio de una mayor eficiencia de inferencia en contextos largos.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos mayoritariamente en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificación de hechos en aplicaciones críticas.
- Aunque soporta 1M de contexto, el rendimiento en tareas de precisión puede degradarse en los tramos más largos, como es habitual en modelos de atención dispersa.
- La información sobre el dataset de entrenamiento y el proceso de alineación (RLHF/DPO) no está disponible, lo que limita la evaluación de su comportamiento en producción.
- La licencia MIT permite uso comercial sin restricciones, pero no se incluyen garantías de soporte oficial por parte de Meituan.
- El modelo no incluye modo thinking explícito; para tareas que requieren razonamiento encadenado extenso, puede ser necesario un prompting cuidadoso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse
- Informe tecnico (arxiv 2608.01662): https://arxiv.org/abs/2608.01662
- Referencia adicional (arxiv 2601.21204): https://arxiv.org/abs/2601.21204
- Blog de LongCat: https://longcat.chat/blog/longcat-2.0/
- Sitio web de LongCat AI: https://www.longcatai.org/
- Repositorio GitHub (LongCat-Flash-Chat): https://github.com/meituan-longcat/LongCat-Flash-Chat
