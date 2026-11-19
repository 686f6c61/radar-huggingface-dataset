# openbmb/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de tipo Transformer con 2.516.756.480 parámetros, desarrollado por OpenBMB (grupo de investigación vinculado a la Universidad de Tsinghua). Es el segundo modelo de la familia MiniCPM5, tras MiniCPM5-1B, y escala la misma receta de entrenamiento con el objetivo de ofrecer un rendimiento de referencia (SOTA) dentro de la categoría de 2B parámetros para despliegue en dispositivo (on-device), local y en entornos con recursos limitados.

El modelo está diseñado específicamente para escenarios de borde (edge-ai): inferencia en portátiles, estaciones de trabajo modestas, dispositivos móviles y contenedores sin GPU dedicada. A pesar de su tamaño, incorpora soporte nativo de contexto largo, tool calling y tareas agénticas, capacidades que tradicionalmente se reservaban a modelos de mayor escala. Su licencia Apache 2.0 y su compatibilidad con transformers, text-generation-inference y endpoints tipo Sagemaker lo hacen atractivo para producción.

La relevancia actual del modelo radica en la tendencia hacia modelos pequeños altamente optimizados que compiten con alternativas de 4B en tareas concretas (código, matemáticas, contexto largo, uso de herramientas), reduciendo costes de inferencia y permitiendo despliegues donde un modelo de 7B o superior no cabría o no sería viable económicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tags) |
| Parámetros totales | 2.516.756.480 (≈2,52B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el tag long-context confirma soporte de contexto largo, sin cifra concreta) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso (no MoE) de aproximadamente 2,52B parámetros, construido sobre la misma receta de entrenamiento que MiniCPM5-1B. Los tags del repositorio indican compatibilidad con la arquitectura de la familia llama. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 5,0 GB, lo que sugiere pesos en precisión BF16/FP16 (coherente con ~2,5B parámetros a 2 bytes por parámetro más artefactos auxiliares).

El entrenamiento se apoya en un conjunto de datasets propios de OpenBMB: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para datos web de pretraining; UltraData-Math y UltraData-Code para dominios especializados; y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de ajuste supervisado, entrenamiento agéntico y aprendizaje por refuerzo. La presencia de un dataset específico de RL (UltraData-RL-2609) y de un SFT orientado a agentes indica que el modelo ha pasado por fases de alineación y optimización para uso de herramientas y razonamiento multi-paso. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento en código (code reasoning): resolución de problemas de programación y generación de código.
- Razonamiento matemático (math reasoning).
- Seguimiento de instrucciones (instruction following).
- Conocimiento general.
- Comprensión de contexto largo (long context).
- Uso de herramientas (tool use) y function calling, reforzado mediante datasets SFT específicos de agentes (UltraData-SFT-Agent-2609).
- Tareas agénticas y razonamiento multi-paso, con una fase de RL dedicada (UltraData-RL-2609).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Optimizado para despliegue en dispositivo y entornos de borde (on-device, edge-ai).

## Casos de uso

- Asistentes locales en portátil: el modelo puede ejecutarse íntegramente en un portátil con GPU de consumo moderada o incluso en CPU, gestionando conversaciones multi-turno sin enviar datos a la nube, lo que resulta adecuado por su tamaño de ~2,5B parámetros y su licencia Apache 2.0.
- Automatización de atención al cliente en el borde: despliegue en contenedores ligeros o dispositivos locales para gestionar diálogos con contexto largo, reduciendo latencia y costes de API frente a modelos de mayor tamaño.
- Generación de código en pipelines de CI/CD: gracias al soporte de tool calling, el modelo puede integrarse como agente que invoca herramientas de linting, tests o despliegue, y su rendimiento en code reasoning lo hace competitivo frente a modelos de 4B en esta tarea.
- Agentes autónomos de propósito específico: la combinación de tool use, razonamiento multi-paso y entrenamiento con UltraData-SFT-Agent-2609 permite construir agentes que encadenan llamadas a APIs y resuelven tareas acotadas (consulta de datos, gestión de ficheros, automatización de flujos).
- Procesamiento de documentos largos en chino o inglés: el soporte de contexto largo permite resumir, extraer información o responder preguntas sobre contratos, informes o artículos extensos en local.
- Tutoría y asistencia educativa en matemáticas: el modelo puede resolver y explicar problemas paso a paso, adecuado para aplicaciones educativas desplegadas en dispositivos de bajo coste.
- Prototipado rápido de aplicaciones LLM: al ser compatible con transformers y text-generation-inference, sirve como modelo base para validar pipelines antes de escalar a modelos mayores, con un coste de inferencia muy reducido.
- Despliegue en entornos con restricciones de privacidad: sectores como sanidad o legal donde los datos no pueden salir del dispositivo, aprovechando la ejecución local y la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que MiniCPM5-2B alcanza SOTA dentro de la categoría de 2B de código abierto y que es competitivo con modelos de 4B en código, matemáticas, contexto largo, uso de herramientas y tareas agénticas, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (≈2,52B parámetros) se estima aproximadamente 5 GB en FP16/BF16, ~2,5-3 GB en cuantización de 8 bits y ~1,5-2 GB en 4 bits (estimaciones derivadas del recuento de parámetros, no datos publicados por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media (RTX 4060 Ti 16 GB, RTX 3060 12 GB) deberían alojar el modelo en FP16 o cuantizado.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs de consumo modernas con 8 GB o más en FP16, y en GPUs con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería oficial), text-generation-inference (tag tgi), endpoints compatibles y despliegue en Sagemaker (tag deploy:sagemaker). No se confirma soporte de llama.cpp, Ollama o vLLM en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B | ≈2,52B | no disponible (soporte long-context) | Apache 2.0 | en, zh | SOTA declarado en categoría 2B; tool calling y agentes |
| MiniCPM5-1B | no disponible | no disponible | no disponible | en, zh (previsible) | Modelo previo de la misma familia, menor tamaño |
| Modelos de 4B de código abierto | ≈4B | no disponible | variable | variable | El autor declara que MiniCPM5-2B es competitivo con ellos en varias tareas |

No se dispone de datos numéricos de benchmarks ni de comparativas detalladas con alternativas concretas (Qwen, Gemma, Phi, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de este tamaño; la menor capacidad de parámetros aumenta la probabilidad de errores factuales en conocimiento general.
- No se han publicado cifras oficiales de benchmarks ni de contexto máximo exacto, lo que dificulta la evaluación objetiva previa a producción.
- No se especifican sesgos conocidos en la información disponible; como todo modelo entrenado con datos web (Ultra-FineWeb), es probable que herede sesgos de dichas fuentes.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los términos de los datasets de entrenamiento si se redistribuye el modelo.
- El soporte de tool calling y agentes, aunque reforzado por entrenamiento específico, no garantiza fiabilidad en cadenas largas de acciones; se recomienda validación y salvaguardas en producción.
- No se confirma soporte oficial de runtimes de inferencia alternativos (llama.cpp, Ollama, vLLM), lo que puede limitar opciones de despliegue.
- La fecha de creación del repositorio (2026-09-06) y las referencias a datasets con nomenclatura 2605/2609/2609 sugieren un ciclo de publicación reciente; la documentación puede estar incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B
- Model card en chino: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003: https://arxiv.org/abs/2602.09003
- Wiki de OpenBMB (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
