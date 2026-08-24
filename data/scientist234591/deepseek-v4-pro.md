# scientist234591/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como una vista previa de la serie DeepSeek-V4. Este modelo está diseñado para manejar contextos de hasta un millón de tokens con una eficiencia computacional notablemente superior a la de generaciones anteriores. La subida concreta en HuggingFace (`scientist234591/DeepSeek-V4-Pro`) es una copia del modelo oficial `deepseek-ai/DeepSeek-V4-Pro`, publicada por un usuario particular, por lo que su autenticidad y reproducibilidad deben verificarse antes de su uso en producción.

El modelo cuenta con 1,6 billones de parámetros totales, de los cuales se activan 49 mil millones por token, y emplea una arquitectura híbrida que combina atención comprimida dispersa (CSA) y atención fuertemente comprimida (HCA) para reducir drásticamente los costes de inferencia en contextos largos. Según la model card, en un contexto de 1M tokens requiere solo el 27% de los FLOPs de inferencia por token y el 10% de la caché KV en comparación con DeepSeek-V3.2. El modelo se preentrenó con más de 32 billones de tokens y se sometió a un pipeline de post-entrenamiento en dos etapas que incluye SFT y RL con GRPO, seguido de destilación on-policy.

La licencia es MIT, lo que permite uso comercial sin restricciones significativas, y los pesos se distribuyen en formato safetensors con precisión mixta FP4+FP8. Aunque la model card indica que el modelo soporta razonamiento avanzado, generación de código y tareas agénticas, no se especifican los idiomas soportados en esta subida concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (CSA + HCA) y conexiones hiper-restrictas (mHC) |
| Parametros totales | 1.598.839.674.782 (1,6T) |
| Parametros activos | 49B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 Mixed (según model card); tag indica 8-bit/FP8 |
| Idiomas soportados | No disponible (la model card no los especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro emplea una arquitectura MoE con una innovación clave: un mecanismo de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Este diseño reduce la complejidad computacional en contextos largos, logrando una mejora de eficiencia de aproximadamente 3,7x en FLOPs por token y 10x en caché KV frente a DeepSeek-V3.2. Además, incorpora Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para mejorar la estabilidad de la propagación de señales a través de las capas sin sacrificar expresividad. El entrenamiento utiliza el optimizador Muon, que acelera la convergencia y mejora la estabilidad.

El preentrenamiento se realizó sobre más de 32 billones de tokens de alta calidad y diversidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos específicos de dominio de forma independiente mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy, integrando las distintas competencias en un solo sistema. Esta metodología permite que el modelo destaque simultáneamente en razonamiento, código y tareas agénticas.

## Capacidades

- Generación de texto y razonamiento avanzado, con un modo de máximo esfuerzo de razonamiento denominado DeepSeek-V4-Pro-Max que mejora significativamente las capacidades de conocimiento.
- Generación de código de alto rendimiento, con resultados de vanguardia en benchmarks de programación.
- Soporte de tool calling y orquestación de herramientas, adecuado para flujos de trabajo agénticos complejos.
- Capacidad de manejar contextos de hasta 1M tokens, lo que permite procesar documentos extensos, bases de código completas o conversaciones de larga duración.
- Razonamiento multi-paso y planificación, con un marco de chain-of-thought integrado.
- Capacidades multilingües presumibles (aunque no confirmadas en esta subida), dado que el modelo se entrenó con datos diversos; la documentación oficial de DeepSeek suele cubrir chino e inglés.

## Casos de uso

- Análisis de documentos legales extensos: gracias a su ventana de 1M tokens, el modelo puede procesar contratos, sentencias y expedientes completos en una sola pasada, extrayendo cláusulas relevantes y resumiendo argumentos sin necesidad de dividir el texto.
- Asistente de programación en repositorios grandes: puede recibir un repositorio completo de código (miles de archivos) y responder preguntas sobre arquitectura, detectar bugs o sugerir refactorizaciones, manteniendo el contexto global del proyecto.
- Atención al cliente con historial completo: el modelo puede gestionar conversaciones multi-turno con un historial de interacción de meses, recordando preferencias y resolviendo incidencias sin perder el hilo.
- Agente autónomo de investigación: con soporte de tool calling, puede buscar en la web, consultar APIs y razonar sobre los resultados para elaborar informes o tomar decisiones, ejecutando múltiples pasos de forma autónoma.
- Generación y revisión de código en pipelines de CI/CD: integrado como revisor automático, puede analizar pull requests, sugerir correcciones y generar tests, reduciendo la carga de los desarrolladores.
- Resumen y análisis de corpus científicos: puede procesar artículos de investigación completos (incluyendo tablas y referencias) y generar resúmenes estructurados, comparativas o revisiones bibliográficas.

## Benchmarks y rendimiento

La model card proporciona resultados del modelo base (sin post-entrenamiento) comparados con DeepSeek-V3.2-Base. No se incluyen resultados del modelo afinado en esta subida.

| Benchmark (métrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | **83,1** |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | **90,1** |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | **90,8** |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | **73,5** |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | **90,3** |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | **93,1** |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | **90,8** |

Estos datos provienen de la model card del autor original (DeepSeek AI) y no han sido verificados de forma independiente para esta subida concreta. No se dispone de resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,6T parámetros en FP8, el peso del modelo ocupa aproximadamente 1,6 TB. Aunque solo se activan 49B por token, todos los expertos deben residir en memoria, por lo que se requiere un clúster de GPUs de alta gama.
- GPUs recomendadas: se necesitan múltiples GPUs de centro de datos, como NVIDIA H100 (80 GB) o A100 (80 GB). Con H100, se necesitarían al menos 20 GPUs para cargar los pesos en FP8, más memoria adicional para la caché KV y las activaciones.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño total del modelo.
- Opciones de despliegue: se puede utilizar vLLM, TensorRT-LLM o TGI para inferencia distribuida en clústeres. Para entornos con menos recursos, se podría recurrir a cuantizaciones más agresivas (por ejemplo, 4-bit) o a la versión Flash (284B, 13B activos) que es más manejable.
- Latencia y throughput: no se han publicado datos específicos en la información disponible. Dado el tamaño y la arquitectura MoE, se espera un throughput razonable en clústeres con paralelismo de expertos, pero no se pueden dar cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento (MMLU 5-shot) |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | 90,1 (base) |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | 88,7 (base) |
| DeepSeek-V3.2 | 671B | 37B | 128K (estimado) | MIT | 87,8 (base) |

DeepSeek-V4-Pro supera a su predecesor V3.2 en todos los benchmarks de conocimiento listados, con una mejora de 2,3 puntos en MMLU. La versión Flash, con menos parámetros activos, ofrece un rendimiento cercano con un coste computacional mucho menor, lo que la hace más adecuada para despliegues con recursos limitados. No se dispone de comparaciones con otros modelos MoE de la misma categoría (por ejemplo, Qwen3-MoE o Llama 4) en la información proporcionada.

## Limitaciones y advertencias

- Autenticidad de la subida: este repositorio (`scientist234591/DeepSeek-V4-Pro`) es una copia publicada por un usuario no oficial, con 0 descargas y 0 likes. No se ha verificado que los pesos coincidan con el modelo oficial de DeepSeek AI. Se recomienda descargar desde `deepseek-ai/DeepSeek-V4-Pro` para uso en producción.
- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos muy largos. Se recomienda validación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque soporta 1M tokens, el rendimiento en contextos extremadamente largos puede degradarse; la model card no especifica la degradación exacta.
- Limitaciones de idioma: no se especifican los idiomas soportados en esta subida. La documentación oficial de DeepSeek suele centrarse en chino e inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero al ser una subida no oficial, no hay garantía de que los pesos sean exactamente los del modelo original ni de que se cumplan los términos de la licencia original.
- Requisitos de hardware: el tamaño del modelo (1,6T) hace inviable su despliegue en infraestructura modesta; se necesita un clúster de GPUs de centro de datos.

## Enlaces

- Repositorio de esta subida: https://huggingface.co/scientist234591/DeepSeek-V4-Pro
- Repositorio oficial del modelo: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Paper técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Artículo de análisis en DeepInfra: https://deepinfra.com/blog/deepseek-v4-pro-model-overview
- Página de Lightning AI: https://lightning.ai/models/lightning-ai-deepseek-v4-pro
