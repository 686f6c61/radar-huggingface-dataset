# claytonln/Qwen2.5-Coder-7B

## Resumen

Qwen2.5-Coder-7B es un modelo de lenguaje causal especializado en código, perteneciente a la familia Qwen2.5-Coder (anteriormente conocida como CodeQwen) desarrollada por el equipo de Qwen de Alibaba. Esta réplica concreta, publicada por el usuario claytonln en HuggingFace, contiene los pesos del modelo base de 7,61 mil millones de parámetros en formato safetensors, derivado de un ajuste sobre Qwen2.5-7B. La familia Qwen2.5-Coder cubre seis tamaños (0,5B, 1,5B, 3B, 7B, 14B y 32B) y su versión de 32B se posicionó como uno de los code LLM open source de referencia, con capacidades comparables a GPT-4o en tareas de programación.

El modelo aborda el problema de la generación, razonamiento y reparación de código con un modelo de tamaño desplegable en una sola GPU de gama alta. Fue entrenado con 5,5 billones de tokens (trillions en inglés) que incluyen código fuente, datos de anclaje texto-código y datos sintéticos, lo que le permite mantener competencias sólidas en matemáticas y tareas generales además de en programación.

Es relevante ahora porque ofrece soporte de contexto completo de 131.072 tokens (128K), una base sólida para construir agentes de código y una licencia Apache 2.0 que permite uso comercial sin restricciones significativas. Cabe destacar que se trata del modelo base (pretraining), por lo que el propio autor recomienda no usarlo directamente para conversación, sino aplicarle post-entrenamiento (SFT, RLHF) o usarlo en tareas de fill-in-the-middle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con RoPE, SwiGLU, RMSNorm y sesgo QKV en attention |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | no disponible (no es MoE; no aplicable) |
| Longitud de contexto | 131.072 tokens (128K); config por defecto limitada a 32.768, ampliable con YaRN |
| Tipos de cuantizacion | no disponible en la model card (pesos originales en BF16/FP16; existen variantes GGUF de la comunidad para la familia Qwen2.5-Coder-7B) |
| Idiomas soportados | ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15,2 GB en el repositorio) |

## Arquitectura y entrenamiento

Qwen2.5-Coder-7B es un transformer decoder con 28 capas, atención agrupada de consultas (GQA) con 28 cabezas para queries y 4 para keys/values, lo que reduce el coste de memoria del cache KV en inferencia con contextos largos. Incorpora RoPE para codificación posicional rotatoria, activaciones SwiGLU, normalización RMSNorm y sesgo en las proyecciones QKV de la atención, una combinación que ha demostrado estabilidad en entrenamientos a gran escala.

El entrenamiento se realizó sobre 5,5 billones de tokens con una mezcla que incluye código fuente de múltiples lenguajes, datos de anclaje texto-código (text-code grounding) y datos sintéticos generados para reforzar tareas de programación. El modelo base está en fase de pretraining; para uso conversacional se recomienda post-entrenamiento (SFT, RLHF o pretraining continuado). Para extender el contexto más allá de los 32.768 tokens configurados por defecto, se emplea YaRN (Yet another RoPE extensioN), una técnica de extrapolación de longitud que escala posicionalmente con un factor de 4,0; esta configuración debe activarse manualmente en `config.json` y solo se recomienda cuando se procesen textos largos, ya que en frameworks como vLLM el escalado es estático y puede degradar el rendimiento con textos cortos.

## Capacidades

- Generacion de codigo: generación de código en los lenguajes de programación más habituales, con mejoras significativas respecto a CodeQwen1.5 según el equipo de Qwen.
- Razonamiento sobre codigo: comprensión y razonamiento de código existente (code reasoning).
- Reparacion de codigo: detección y corrección de errores (code fixing).
- Tareas fill-in-the-middle: el modelo base es adecuado para completar código en medio de un contexto, útil en autocompletado tipo IDE.
- Base para agentes de codigo: la model card destaca su fundación para aplicaciones reales de Code Agents.
- Competencias generales: mantiene fortalezas en matemáticas y capacidades generales heredadas de Qwen2.5-7B.
- Contexto largo: hasta 128K tokens con YaRN activado, útil para analizar repositorios o documentos extensos.
- No diseñado para conversacion: al ser un modelo base, no está alineado para chat ni instrucciones sin post-entrenamiento.

## Casos de uso

- Autocompletado de codigo en IDE: gracias a su naturaleza de modelo base con capacidad fill-in-the-middle, puede integrarse en editores para completar funciones y bloques de código a partir del contexto circundante.
- Analisis de repositorios completos: con 128K tokens de contexto (activando YaRN), puede ingerir ficheros grandes o conjuntos de ficheros para responder preguntas sobre la estructura y el contenido de un proyecto.
- Generacion de codigo en pipelines de CI/CD: puede usarse para generar tests unitarios, documentación de APIs o scripts de build a partir del código fuente del repositorio.
- Motor base para agentes de codigo: como base para sistemas de agentes que navegan, editan y ejecutan código (por ejemplo con frameworks tipo SWE-agent), gracias a su entrenamiento específico para Code Agents.
- Reparacion automatica de bugs: detección y corrección de errores en código, integrable en flujos de revisión automática de pull requests.
- Sistemas de completado por lotes offline: generación masiva de variantes de código o refactorizaciones en batch, aprovechando que cabe en una sola GPU de gama alta.
- Base para fine-tuning corporativo: al ser un modelo base Apache 2.0, es idóneo como punto de partida para SFT con datos de código propietarios de una organización.
- Razonamiento matematico asistido: resolución de problemas con componente matemática y de lógica, heredada del pretraining general de Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta réplica concreta. La model card remite al blog oficial de la familia Qwen2.5-Coder para los resultados de evaluación detallados del modelo original Qwen/Qwen2.5-Coder-7B (enlace en la sección de Enlaces). No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,61B de parametros en precisión completa (BF16/FP16) y un tamaño de repo de 15,2 GB, se estiman unos 16-18 GB de VRAM para los pesos, más el cache KV (reducido gracias a GQA con 4 cabezas KV). Con cuantización a 4 bits (por ejemplo GPTQ/AWQ/GGUF Q4 de la comunidad), el requisito baja a aproximadamente 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 ejecuta el modelo en FP16 sin problemas; en entornos de servidor, A100 40GB o H100 ofrecen mayor throughput y soporte nativo de contextos largos.
- Consumer GPU: sí, cabe en una RTX 3090 o RTX 4090 en precisión completa, y en GPUs de 8-12 GB (RTX 3060 12GB, RTX 4060 Ti 16GB) usando cuantización a 4 bits.
- Opciones de despliegue: transformers (se recomienda la última versión; con `transformers<4.37.0` se produce el error `KeyError: 'qwen2'`), vLLM (recomendado por el equipo de Qwen, especialmente para contextos largos con YaRN), TGI, llama.cpp y Ollama (mediante conversiones GGUF de la comunidad).
- Latencia y throughput: no disponible en la informacion proporcionada; la documentación oficial de Qwen publica benchmarks de velocidad y memoria de GPU en su página de speed benchmark (enlazada en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-7B (este modelo) | 7,61B | 128K (con YaRN) | Codigo (base) | Apache 2.0 |
| Qwen2.5-Coder-7B-Instruct | 7,61B | 128K (con YaRN) | Codigo (chat/instrucciones) | Apache 2.0 (con use policy) |
| CodeLlama-7B | 7B | 16K | Codigo (base e instruct) | Llama 2 Community License |
| DeepSeek-Coder-V2-Lite (16B MoE) | 16B (2,4B activos) | 128K | Codigo (MoE) | DeepSeek License (uso comercial condicionado) |

Qwen2.5-Coder-7B destaca frente a CodeLlama-7B por su contexto mucho mayor (128K frente a 16K) y su entrenamiento con 5,5 billones de tokens, y frente a DeepSeek-Coder-V2-Lite por una licencia Apache 2.0 sin condiciones adicionales, aunque este último ofrece mayor eficiencia de inferencia gracias a su arquitectura MoE. Para uso conversacional directo, la variante Instruct de la misma familia es la alternativa recomendada por el propio equipo de Qwen.

## Limitaciones y advertencias

- No apto para conversacion sin post-entrenamiento: la model card advierte explicitamente que no se recomienda usar este modelo base para conversaciones; requiere SFT, RLHF o pretraining continuado, o bien usarse en tareas fill-in-the-middle.
- Contexto por defecto limitado: `config.json` viene configurado para 32.768 tokens; alcanzar los 128K requiere activar manualmente YaRN, y en vLLM el escalado estático puede degradar el rendimiento con textos cortos.
- Sesgos: no disponible en la informacion proporcionada; al ser un modelo entrenado con código y texto web, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como todo LLM, puede generar código plausible pero incorrecto o inseguro; el código generado debe revisarse antes de ejecutarse en producción.
- Limitacion de idioma: la model card declara únicamente el ingles como idioma; el rendimiento en castellano no está documentado para esta réplica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin condiciones adicionales relevantes.
- Procedencia de la réplica: este repositorio es una subida de un usuario particular (claytonln) y no el repositorio oficial de Qwen; para garantizar la autenticidad de los pesos se recomienda verificar los hashes o usar el repositorio oficial Qwen/Qwen2.5-Coder-7B.
- Compatibilidad de versiones: requiere `transformers>=4.37.0`; versiones anteriores provocan errores de carga.

## Enlaces

- Repositorio en HuggingFace (esta réplica): https://huggingface.co/claytonln/Qwen2.5-Coder-7B
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper tecnico Qwen2.5-Coder (arXiv): https://arxiv.org/abs/2409.12186
- Paper tecnico Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Paper de YaRN (arXiv): https://arxiv.org/abs/2309.00071
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad y memoria de GPU: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B/blob/main/LICENSE
