# mradermacher/Sharona_Q27B-R_CodeSecurity_v2-i1-GGUF

## Resumen

Sharona_Q27B-R_CodeSecurity_v2-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo original Sharona_Q27B-R_CodeSecurity_v2, desarrollado por ApolloRaines. El cuantizador mradermacher ha generado estos archivos para permitir la ejecución del modelo en hardware con recursos limitados, manteniendo un equilibrio entre tamaño y calidad. El modelo base está especializado en seguridad de código, revisión de código y detección de vulnerabilidades, y se basa en una arquitectura de tipo Qwen3.5 (según el campo `model_type: qwen3_5_text`). Con aproximadamente 26.900 millones de parámetros, este modelo denso ofrece capacidades conversacionales y de análisis de código, aunque la información pública sobre su entrenamiento es escasa. La relevancia de esta versión cuantizada radica en que facilita el despliegue local de un modelo de 27B en estaciones de trabajo con GPUs de consumo, sin necesidad de infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (además de archivo imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Sharona_Q27B-R_CodeSecurity_v2 emplea una arquitectura transformer densa, clasificada como `qwen3_5_text`, lo que indica una variante de la familia Qwen3.5 orientada a tareas de texto. Según las etiquetas del repositorio original, el modelo ha sido sometido a técnicas de personalización avanzadas como `jbliterated`, `behavioral-editing`, `weight-surgery` y `identity-implant`, que sugieren una modificación deliberada de los pesos para implantar comportamientos específicos relacionados con la seguridad del código. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de métodos como RLHF o DPO. El cuantizador mradermacher ha aplicado una cuantización con imatrix (i1) para optimizar la calidad de los quants de baja precisión, utilizando el archivo de importancia generado a partir del modelo original.

## Capacidades

- Revisión de código: análisis de fragmentos de código para identificar errores, malas prácticas o problemas de seguridad.
- Detección de vulnerabilidades: identificación de patrones de código inseguro, como inyecciones SQL, desbordamientos de buffer o uso incorrecto de APIs.
- Conversación: capacidad de mantener diálogos multi-turno sobre temas de programación y seguridad informática.
- Asistencia en auditorías de seguridad: apoyo en la revisión manual de repositorios y reportes de hallazgos.
- Generación de explicaciones técnicas: descripción de vulnerabilidades y recomendaciones de mitigación en lenguaje natural.
- Soporte multilingüe limitado: aunque el modelo está etiquetado como inglés, puede comprender código en diversos lenguajes de programación.

## Casos de uso

- Integración en pipelines de CI/CD: el modelo puede ejecutarse como un paso de revisión automática de código, analizando cada commit o pull request en busca de vulnerabilidades comunes antes de la fusión.
- Auditoría de seguridad de repositorios: análisis de grandes bases de código para generar informes de riesgos, priorizando áreas que requieren intervención manual.
- Asistente de desarrollo seguro: integrado en un IDE o CLI, ofrece sugerencias en tiempo real para corregir código inseguro mientras el desarrollador escribe.
- Formación en seguridad: utilizado en entornos educativos para explicar vulnerabilidades reales y sus soluciones, con ejemplos interactivos.
- Análisis forense de código: revisión de código heredado o de terceros para evaluar su postura de seguridad antes de su adopción.
- Chatbot de soporte técnico: desplegado como un agente conversacional que responde preguntas sobre seguridad de aplicaciones y buenas prácticas de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del modelo base menciona "Eval Results (legacy)" en su página, pero no se proporcionan los valores numéricos en los datos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: según el quant elegido, se necesitan aproximadamente 8 GB para el i1-IQ1_M (7,7 GB) hasta 23 GB para el i1-Q6_K (22,2 GB). El quant recomendado i1-Q4_K_M (16,6 GB) requiere al menos 16-20 GB de VRAM.
- GPUs recomendadas: para el Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para el Q6_K, se recomienda una A100 40GB o similar. En configuraciones de doble GPU, es posible repartir la carga.
- Compatibilidad con GPUs de consumo: sí, los quants más pequeños (IQ1_M, IQ2_M) caben en GPUs de 8-12 GB como la RTX 3060 o RTX 4070, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. También se puede convertir a otros formatos si es necesario.
- Latencia y throughput: no se dispone de datos medidos; dependerá del hardware y del quant. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de seguridad de código. El modelo base es una personalización de Qwen3.5, pero no se conocen alternativas directas con el mismo enfoque de edición de comportamiento. Se recomienda consultar el leaderboard de modelos auto-alojados para comparar con otros modelos de 27B, aunque no hay datos específicos de este modelo.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad, especialmente en los quants de menor tamaño (IQ1_M, IQ2_M), lo que puede afectar a la precisión en tareas de detección de vulnerabilidades.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser deficiente.
- No se han publicado evaluaciones formales de sesgos o alucinaciones; como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en contextos de código poco comunes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original, ya que podría haber restricciones adicionales no documentadas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado; se debe validar su comportamiento en un entorno de pruebas antes de usarlo en producción.
- La fecha de creación (2026-09-01) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sharona_Q27B-R_CodeSecurity_v2-i1-GGUF
- Modelo base: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2
- Página de quants estáticos: https://huggingface.co/mradermacher/Sharona_Q27B-R_CodeSecurity_v2-GGUF
