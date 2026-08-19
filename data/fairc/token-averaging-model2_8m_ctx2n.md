# FAIRC/token-averaging-model2_8m_ctx2n

## Resumen

El modelo `FAIRC/token-averaging-model2_8m_ctx2n` es un checkpoint de investigación publicado por el grupo FAIRC dentro de un proyecto experimental sobre *token averaging*, una técnica que promedia representaciones de tokens para mejorar la eficiencia o la calidad del entrenamiento. Se trata de un modelo transformer pequeño, de aproximadamente 7,6 millones de parámetros, con una ventana de contexto de 1024 tokens y una arquitectura basada en el cuerpo de transformer de OLMo (OLMTransformerBody). El checkpoint se distribuye como un volcado de estado (`state_dict`) en formato PyTorch nativo, no como pesos compatibles con `transformers`, y está pensado para ser cargado mediante código específico del proyecto.

El modelo no resuelve un problema aplicado directamente, sino que sirve como artefacto de un estudio sobre dinámicas de promediado de tokens durante el entrenamiento. Su relevancia es principalmente metodológica: permite reproducir experimentos de *token averaging* y comparar resultados con otros checkpoints de la misma familia. No se han publicado métricas de rendimiento, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMTransformerBody) con promediado de tokens |
| Parametros totales | 7.612.544 (aproximado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 6 capas con `d_model` de 128 y 4 cabezas de atención, con embeddings atados (`tie_embeddings: true`). El componente distintivo es el mecanismo de *token averaging* con un parámetro `averaging_k = 1`, que probablemente promedia representaciones de tokens adyacentes o de un grupo de tamaño `k` antes de pasarlas a las capas siguientes. El modelo se entrenó con una tasa de aprendizaje de 0.0004, 500 pasos de *warmup* y un objetivo de 300 millones de tokens (`target_tokens`). El checkpoint incluye el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite auditar el progreso. No se especifica el dataset utilizado ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto básica: al ser un modelo de 7,6M de parámetros, su capacidad de generación es muy limitada y de baja calidad.
- Razonamiento y matemáticas: no se han documentado capacidades específicas; por su tamaño, no se espera un rendimiento útil en tareas complejas.
- Código: no se menciona soporte específico.
- Tool calling / function calling: no disponible.
- Soporte para agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): ninguna documentada. El único rasgo especial es el mecanismo de *token averaging* objeto de estudio.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar los resultados del proyecto *token averaging* y comparar curvas de pérdida y métricas internas.
- Estudio de dinámicas de entrenamiento: se puede analizar cómo el promediado de tokens afecta a la convergencia, la pérdida y el uso de FLOPs.
- Desarrollo de variantes de arquitectura: sirve como punto de partida para modificar el mecanismo de *averaging* y probar configuraciones alternativas.
- Evaluación de escalado en modelos pequeños: al ser un modelo de 7,6M de parámetros, es útil para estudiar leyes de escalado en el régimen de muy baja capacidad.
- Benchmarking de infraestructura de entrenamiento: su pequeño tamaño permite ejecutar experimentos completos en hardware modesto, ideal para validar pipelines de entrenamiento.
- Educación y formación: como ejemplo de checkpoint de investigación, puede utilizarse en cursos de aprendizaje automático para ilustrar el manejo de estados de modelo no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~7,6M de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (el checkpoint ocupa 0.2 GB en disco). Cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas tarjetas integradas o CPUs con PyTorch.
- Compatibilidad con GPU de consumo: sí, todas las GPU de consumo actuales (RTX 3060, RTX 4090, etc.) pueden ejecutarlo sin problema.
- Opciones de despliegue: no es un modelo pensado para producción. Puede cargarse con PyTorch directamente o mediante `torch.load`. No se ha probado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado datos, pero por su tamaño la latencia sería del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo proyecto de *token averaging*. En cuanto a tamaño, podría compararse con otros modelos de ~7M de parámetros como los de la familia OLMo pequeños, pero no se han publicado resultados que permitan una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint no es compatible con la API de Hugging Face `transformers`; requiere reconstruir la arquitectura desde `config.json` o desde el código fuente del proyecto.
- No se especifica la licencia, por lo que no está claro si se permite uso comercial o derivados.
- No se han documentado idiomas soportados ni sesgos conocidos; al ser un modelo de investigación sin alineación, puede generar contenido incoherente o inapropiado.
- Riesgo de alucinación: alto, dado su tamaño extremadamente reducido.
- El mecanismo de *token averaging* puede alterar la semántica de las representaciones, lo que limita su uso directo en tareas downstream.
- La fecha de creación (2026) y la ausencia de actividad (0 descargas, 0 likes) sugieren que es un artefacto experimental sin mantenimiento.

## Enlaces

- [HuggingFace - FAIRC/token-averaging-model2_8m_ctx2n](https://huggingface.co/FAIRC/token-averaging-model2_8m_ctx2n)
- No se han encontrado otros enlaces (papers, repos, demos) en la información proporcionada.
