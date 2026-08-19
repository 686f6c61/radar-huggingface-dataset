# KevinLee26/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana 1.5 es la segunda generación de la familia de modelos bilingües (coreano-inglés) desarrollada por Kakao, con mejoras sustanciales en generación de código, razonamiento matemático y function calling respecto a la versión anterior. El modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` es un transformer denso de aproximadamente 8 000 millones de parámetros, con una ventana de contexto nativa de 32 000 tokens ampliable hasta 128 000, diseñado para equilibrar coste computacional y rendimiento en tareas del mundo real.

El repositorio analizado, `KevinLee26/kanana-1.5-8b-instruct-2505-Safe-DPO`, es un fine-tuning realizado por un tercero (KevinLee26) sobre el modelo instruct de Kakao, aplicando un entrenamiento con DPO (Direct Preference Optimization) orientado a la seguridad de las respuestas. El nombre "Safe-DPO" sugiere un ajuste dirigido a reducir outputs dañinos o no deseados, aunque la model card publicada no ofrece detalles sobre el proceso de entrenamiento, los datos utilizados ni la evaluación realizada.

La relevancia de este modelo reside en que combina las capacidades del Kanana 1.5 de Kakao (sólido en código y matemáticas) con un ajuste adicional de seguridad, lo que puede resultar interesante para desarrolladores que necesiten un modelo instruct de 8B con comportamiento más alineado. No obstante, la ausencia de documentación técnica por parte del autor del fine-tuning limita su uso en entornos de producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama, según tags) |
| Parametros totales | 8 030 285 824 (8,03 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens nativos, extensible a 128 000 (dato del modelo base) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en fp16) |
| Idiomas soportados | coreano e ingles (del modelo base; no confirmado para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Kanana 1.5-8B es un transformer decoder-only con arquitectura similar a Llama, entrenado de forma eficiente en cómputo según el paper arXiv 2502.18934. Kakao publica que la familia Kanana establece una nueva frontera de Pareto entre coste de entrenamiento y rendimiento, con tamaños de 2,1B, 9,8B y 32,5B en la primera versión, a los que se añaden 8B denso y 15,7B-A3B MoE en la 1.5. El modelo instruct se obtuvo mediante post-entrenamiento con instrucciones, aunque los detalles exactos del dataset y del proceso de alineación (RLHF, DPO, etc.) no se detallan en la información disponible.

Sobre el fine-tuning `Safe-DPO`, el nombre indica un entrenamiento con DPO enfocado a seguridad, pero no se ha publicado información sobre el dataset de preferencias, el número de pasos, la tasa de aprendizaje ni la metodología exacta. El autor KevinLee26 ha publicado también otras variantes (como `Persona-LORA`), lo que sugiere un trabajo de adaptación sistemática, pero sin documentación abierta.

## Capacidades

- Generación de texto conversacional en coreano e inglés (heredado del modelo base).
- Generación de código con mejoras significativas respecto a Kanana 1.0, según la descripción oficial de Kakao.
- Razonamiento matemático reforzado en la versión 1.5.
- Soporte de function calling / tool calling, habilitando integración con APIs y agentes.
- Manejo de contexto largo: 32K tokens nativos, ampliable a 128K con técnicas de extensión de ventana.
- Ajuste de seguridad mediante DPO (según el nombre del repo), orientado a reducir respuestas dañinas o sesgadas, aunque sin evaluación publicada que lo confirme.

## Casos de uso

- Asistente de atención al cliente bilingüe: el modelo puede mantener conversaciones multi-turno en coreano e inglés con una ventana de 32K tokens, suficiente para gestionar historiales largos de incidencias. Su ajuste de seguridad ayuda a evitar respuestas inapropiadas en interacción directa con usuarios.
- Generación de código en entornos de desarrollo: con soporte de function calling y buena capacidad de generación de código, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar fragmentos de código, siempre que se valide su rendimiento en el lenguaje objetivo.
- Agente conversacional con herramientas: la capacidad de tool calling permite conectarlo a APIs externas (búsqueda, bases de datos, calendarios) para construir asistentes que ejecuten acciones reales, aprovechando su contexto largo para mantener el estado de la conversación.
- Traducción y localización coreano-inglés: al ser bilingüe, puede emplearse para tareas de traducción automática o generación de contenido localizado, aunque no se han publicado benchmarks específicos de traducción.
- Prototipado rápido de chatbots: su tamaño de 8B permite desplegarlo en una GPU de consumo (con cuantización) para experimentar con interacción conversacional en coreano e inglés sin depender de APIs comerciales.
- Investigación en alineación de seguridad: al ser un fine-tuning DPO de un modelo base conocido, puede servir como caso de estudio para comparar el efecto del ajuste de seguridad frente al modelo original de Kakao, midiendo diferencias en toxicidad, sesgo o utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del fine-tuning no incluye métricas de evaluación, y la model card de HuggingFace no contiene datos de rendimiento. Los benchmarks del modelo base Kanana 1.5-8B (publicados por Kakao en su repositorio y paper) no son directamente aplicables a este fine-tuning, ya que el ajuste DPO puede alterar el comportamiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB (8B parámetros en fp16 más overhead de activaciones y KV cache). Cabe en una RTX 4090 (24 GB) o A100 de 40 GB.
- Con cuantización de 4 bits (GPTQ o AWQ): aproximadamente 5-6 GB de VRAM, permitiendo ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- Con cuantización GGUF de 4 bits: puede ejecutarse en CPU con 16 GB de RAM, aunque con latencia alta.
- GPUs recomendadas: RTX 4090, A100, H100 para inferencia de alta velocidad; RTX 3060 o superiores para uso con cuantización.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se generan pesos GGUF), transformers con accelerate.
- Latencia estimada: en una RTX 4090 con fp16, se puede esperar un throughput de 30-60 tokens/s para generación; en cuantización 4-bit, algo menor. No hay datos oficiales del autor.

## Comparativa con modelos similares

No se dispone de una comparativa publicada para este fine-tuning específico. Como referencia, el modelo base Kanana 1.5-8B compite con otros modelos instruct de ~8B como Llama 3.1 8B Instruct, Mistral 7B Instruct y Qwen 2.5 7B Instruct. La diferencia principal es el enfoque bilingüe coreano-inglés de Kanana frente al multilingüismo más amplio de Llama o Qwen, y la licencia restrictiva de Kakao frente a las licencias más permisivas de Llama (MIT) o Mistral (Apache 2.0). Sin embargo, sin datos de benchmarks del fine-tuning, no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card es una plantilla automática sin información real: no hay detalles sobre el entrenamiento, los datos, la evaluación ni el uso previsto. Esto impide verificar la calidad del ajuste DPO.
- Licencia no disponible: no se puede confirmar si el modelo es utilizable en proyectos comerciales. El modelo base de Kakao tiene una licencia propia con restricciones, y este fine-tuning no declara ninguna, lo que genera incertidumbre legal.
- Sin benchmarks publicados: no hay evidencia de que el ajuste de seguridad degrade o mejore el rendimiento en tareas de código, matemáticas o conversación.
- Riesgo de alucinación: como cualquier modelo generativo de 8B, puede producir información falsa o inventada, especialmente en dominios especializados.
- Sesgos potenciales: el entrenamiento en coreano e inglés puede introducir sesgos culturales o lingüísticos; el ajuste DPO no garantiza la eliminación de sesgos.
- Idiomas limitados: no se ha confirmado que el fine-tuning mantenga las capacidades bilingües del modelo base; podría haber degradación en uno de los idiomas.
- Contexto de 128K: la extensión a 128K tokens es una capacidad del modelo base, pero no está claro si este fine-tuning la conserva tras el entrenamiento adicional.
- Desactualización potencial: el repositorio fue creado en agosto de 2026, pero no hay información sobre mantenimiento o soporte posterior.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/KevinLee26/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base de Kakao: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Paper de Kanana (arXiv): https://arxiv.org/html/2502.18934v1
- Variante relacionada del mismo autor: https://huggingface.co/KevinLee26/kanana-1.5-8b-instruct-2505-Persona-LORA
