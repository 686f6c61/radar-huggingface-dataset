# kirusanth08/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de gran escala basado en una arquitectura Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como versión preliminar dentro de la serie DeepSeek-V4. Con 1,6 billones de parámetros totales y 49 mil millones de parámetros activos por token, está diseñado para manejar contextos de hasta un millón de tokens, lo que lo posiciona como una opción relevante para tareas de razonamiento de largo alcance, generación de código y agentes autónomos. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones.

La arquitectura incorpora innovaciones como atención híbrida con Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), que reducen los FLOPs de inferencia a un 27% y el uso de KV cache a un 10% respecto a DeepSeek-V3.2 en contextos de un millón de tokens. Además, emplea conexiones residuales reforzadas con Manifold-Constrained Hyper-Connections (mHC) y el optimizador Muon para una convergencia más rápida. El modelo se pre-entrenó con más de 32 billones de tokens y se sometió a un pipeline de post-entrenamiento en dos etapas: cultivo independiente de expertos por dominio mediante SFT y RL con GRPO, seguido de consolidación unificada por destilación on-policy.

El repositorio en Hugging Face (kirusanth08/DeepSeek-V4-Pro) contiene los pesos en formato safetensors con precisión mixta FP4 + FP8, ocupando 864,8 GB. Aunque el autor del repositorio es un usuario particular, la model card reproduce la documentación oficial de DeepSeek AI. El modelo está disponible para generación de texto mediante la librería transformers y es compatible con endpoints de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida CSA + HCA |
| Parametros totales | 1.598.839.674.782 (1,6T) |
| Parametros activos | 49B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un modelo MoE con 1,6T parámetros totales y 49B activos por token. La arquitectura introduce una atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñada para mejorar drásticamente la eficiencia en contextos largos: en una ventana de 1M tokens, requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache en comparación con DeepSeek-V3.2. Además, incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y estabilizar la propagación de señales entre capas, y utiliza el optimizador Muon para acelerar la convergencia y mejorar la estabilidad del entrenamiento.

El pre-entrenamiento se realizó sobre más de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma de dos etapas: primero se cultivan expertos especializados por dominio mediante SFT y RL con GRPO (Group Relative Policy Optimization), y después se consolidan en un único modelo mediante destilación on-policy, integrando las distintas competencias. El modo de razonamiento máximo, denominado DeepSeek-V4-Pro-Max, está diseñado para tareas de razonamiento complejo y agéntico, y según la documentación alcanza el mejor rendimiento entre los modelos open-source en benchmarks de código, acercándose a los modelos cerrados líderes en razonamiento y tareas de agente.

## Capacidades

- Generación de texto y razonamiento de largo alcance gracias a su ventana de contexto de 1M tokens.
- Razonamiento multi-step y modo de razonamiento máximo (DeepSeek-V4-Pro-Max) para tareas complejas.
- Generación de código de alto nivel, con rendimiento puntero en benchmarks de programación.
- Capacidades agénticas: soporte de tool calling y orquestación de flujos de trabajo multi-paso.
- Conocimiento enciclopédico y multilingüe (aunque los idiomas concretos no se especifican en la documentación disponible).
- Eficiencia en inferencia para contextos largos gracias a la atención híbrida CSA/HCA.
- Compatible con la librería transformers y endpoints de inferencia estándar.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar y razonar sobre corpus de hasta un millón de tokens, lo que permite resumir, extraer información y responder preguntas sobre libros técnicos, expedientes legales o informes financieros completos en una sola pasada.
- Generación de código en producción: con soporte de tool calling y un rendimiento puntero en benchmarks de programación, puede integrarse en pipelines de CI/CD para generar tests, revisar pull requests o autocompletar funciones complejas.
- Agentes autónomos multi-paso: su capacidad de razonamiento agéntico y su ventana de contexto amplia permiten construir asistentes que planifican, ejecutan herramientas y mantienen estado a lo largo de conversaciones largas.
- Asistencia a la investigación científica: puede leer y sintetizar múltiples artículos académicos, comparar metodologías y proponer hipótesis, gracias a su conocimiento enciclopédico y su capacidad de razonamiento profundo.
- Atención al cliente automatizada: con contexto de 1M tokens, puede gestionar conversaciones multi-turno con historial completo del cliente, manteniendo coherencia y personalización a lo largo de sesiones prolongadas.
- Traducción y localización de contenido técnico: aunque los idiomas soportados no están documentados, su conocimiento multilingüe permite traducir documentación técnica extensa manteniendo terminología especializada.
- Razonamiento matemático y lógico: su modo de razonamiento máximo (Pro-Max) está optimizado para problemas de lógica, matemáticas y planificación, útil en entornos educativos o de análisis cuantitativo.

## Benchmarks y rendimiento

La documentación proporciona resultados de evaluación del modelo base (sin post-entrenamiento de chat) comparado con DeepSeek-V3.2-Base y DeepSeek-V4-Flash-Base:

| Benchmark (métrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | **83,1** |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | **90,1** |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | **90,8** |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | **73,5** |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | **90,3** |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | **93,1** |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | **90,8** |

No se han publicado en la información disponible resultados de benchmarks del modelo instruct (chat) ni de tareas de código, razonamiento o agénticas, aunque la documentación afirma que DeepSeek-V4-Pro-Max es el mejor modelo open-source en benchmarks de código y que se acerca a los modelos cerrados líderes en razonamiento y tareas de agente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 1,6T parámetros en FP4/FP8, el modelo requiere múltiples GPUs de alta gama; el tamaño del repositorio (864,8 GB) sugiere que se necesitan al menos 8-16 GPUs con 80 GB de VRAM (p. ej., H100 o A100) para cargar los pesos en memoria.
- GPU recomendadas: no disponible en la documentación, pero por el tamaño y la precisión mixta, se requieren GPUs de centro de datos como NVIDIA H100, A100 o similares con memoria HBM de 80 GB o superior.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño del modelo y la VRAM necesaria.
- Opciones de despliegue: compatible con la librería transformers y endpoints compatibles (según los tags del repositorio). No se mencionan vLLM, llama.cpp u Ollama en la documentación, aunque por su formato safetensors y arquitectura MoE es probable que sea desplegable con frameworks como vLLM o TGI, pero esto no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU (5-shot) |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | 90,1 |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | 88,7 |
| DeepSeek-V3.2 | 671B | 37B | no disponible | MIT | 87,8 |

DeepSeek-V4-Pro supera a su predecesor V3.2 y a su versión reducida V4-Flash en todos los benchmarks de conocimiento publicados, con una ventaja notable en MMLU-Pro (73,5 frente a 65,5 de V3.2). La comparativa con otros modelos de la misma categoría (p. ej., Llama 4, Qwen3-MoE) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio en Hugging Face (kirusanth08/DeepSeek-V4-Pro) no pertenece a la organización oficial deepseek-ai; es una subida de un usuario particular. Aunque la model card reproduce la documentación oficial, conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe no está garantizado fuera de los benchmarks mostrados (que incluyen C-Eval y CMMLU, indicando buen soporte de chino).
- No se han publicado resultados de benchmarks del modelo instruct (chat) ni de tareas de código, razonamiento o agénticas en la información disponible; las afirmaciones sobre rendimiento puntero en código se basan en la documentación del autor, no en datos verificables.
- El tamaño del modelo (1,6T parámetros, 864,8 GB) hace inviable su despliegue en hardware de consumo; requiere infraestructura de centro de datos con múltiples GPUs de alta gama.
- La precisión FP4 en los parámetros de los expertos MoE puede introducir pérdidas de calidad en tareas de alta precisión numérica o en contextos muy largos, aunque no se documentan efectos concretos.
- Al ser una versión preliminar (preview), puede haber cambios en la arquitectura o el comportamiento entre versiones; no se garantiza estabilidad a largo plazo.
- No se documentan sesgos específicos, pero como todo LLM pre-entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en los datos de entrenamiento.
- Riesgo de alucinación: no se proporcionan datos sobre tasas de alucinación; en tareas de razonamiento largo o con contexto de 1M tokens, el modelo puede generar información plausible pero incorrecta, especialmente en dominios poco representados en los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kirusanth08/DeepSeek-V4-Pro
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Página del modelo en deepseeksr1.com: https://deepseeksr1.com/v4-pro/
- Ficha del modelo en lightning.ai: https://lightning.ai/models/lightning-ai-deepseek-v4-pro
- Ficha del modelo en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Pro
- Paper técnico (arXiv): https://arxiv.org/abs/2606.19348
