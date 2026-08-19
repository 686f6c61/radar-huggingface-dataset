# alextsiak/qwen3-4b-green-claims

## Resumen

El modelo `alextsiak/qwen3-4b-green-claims` es un ajuste fino (fine-tuning) del modelo base Qwen3-4B, desarrollado por alextsiak para la detección de afirmaciones ecológicas engañosas, conocidas como *green claims* o *greenwashing*. El modelo se ha entrenado con la librería Unsloth, que acelera el proceso de ajuste fino, y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones significativas.

El modelo parte de la arquitectura Qwen3-4B, un transformer denso de 4 mil millones de parámetros, y ha sido adaptado específicamente para clasificar o identificar declaraciones medioambientales en texto. Aunque la información disponible no detalla el dataset de entrenamiento ni la metodología exacta (si se usó RLHF, DPO, etc.), el repositorio indica que se empleó TRL (Transformers Reinforcement Learning) junto con Unsloth.

La relevancia de este modelo radica en la creciente necesidad de herramientas automáticas para verificar la veracidad de las afirmaciones ecológicas en marketing, publicidad y etiquetado de productos, un ámbito donde la regulación europea (directiva sobre *green claims*) está endureciendo los requisitos. Al estar basado en Qwen3, hereda capacidades sólidas de comprensión del lenguaje, aunque su especialización lo hace más útil en tareas de análisis de sostenibilidad que como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.0B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32K tokens, pero no se ha confirmado para este fine-tuning) |
| Tipos de cuantizacion | 4-bit (BNB, inferido del tamaño del repo de 0.4 GB y del modelo base `unsloth/Qwen3-4B-unsloth-bnb-4bit`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, un transformer denso con 4 mil millones de parámetros, diseñado originalmente por Alibaba para tareas multilingües de generación de texto, razonamiento, código y matemáticas. La arquitectura de Qwen3 incluye atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU, con un contexto nativo de 32K tokens en su versión base.

El proceso de entrenamiento de este modelo se realizó con la librería Unsloth, que optimiza el fine-tuning mediante técnicas de cuantización y kernels eficientes, logrando una aceleración de 2x respecto a métodos convencionales. Según la model card, se utilizó TRL (Transformers Reinforcement Learning) como framework de entrenamiento, aunque no se especifica si se aplicó RLHF, DPO u otro método de alineación. Tampoco se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados, por lo que estos datos no están disponibles.

La especialización del modelo se centra en la detección de *green claims*, es decir, afirmaciones sobre beneficios medioambientales de productos o servicios que pueden ser vagas, engañosas o infundadas. El fine-tuning ha adaptado los pesos del modelo base para reconocer patrones lingüísticos asociados a este tipo de declaraciones, aunque la ausencia de documentación sobre el dataset impide conocer la amplitud de los casos cubiertos.

## Capacidades

- Generación de texto en inglés con fluidez, heredada del modelo base Qwen3-4B.
- Razonamiento y comprensión de lenguaje natural, incluyendo tareas de clasificación y análisis de sentimiento.
- Detección de afirmaciones ecológicas (*green claims*) en texto, identificando posibles casos de *greenwashing* (declaraciones vagas, sin evidencia, o exageradas sobre sostenibilidad).
- Soporte de tool calling y function calling, capacidad presente en la familia Qwen3 que se mantiene tras el fine-tuning (no verificado específicamente para este modelo, pero heredado del base).
- Capacidades multilingües del modelo base (Qwen3 soporta más de 100 idiomas), aunque el fine-tuning se ha realizado únicamente en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- Generación de código y matemáticas básicas, también heredadas del base, aunque no son el foco principal de este modelo.

## Casos de uso

- Verificación de campañas publicitarias: una agencia de marketing puede usar el modelo para revisar automáticamente los textos de sus anuncios y detectar afirmaciones ecológicas que podrían ser consideradas *greenwashing* por las autoridades reguladoras, antes de su publicación.
- Cumplimiento normativo: empresas sujetas a la directiva europea sobre *green claims* pueden integrar el modelo en sus flujos de revisión de etiquetas y fichas de producto para asegurar que las declaraciones medioambientales sean específicas, verificables y no engañosas.
- Análisis de competencia: un departamento de inteligencia competitiva puede procesar los materiales de marketing de rivales para identificar patrones de *greenwashing* y utilizarlos como argumento en estrategias comerciales o legales.
- Monitorización de redes sociales: herramientas de escucha social pueden emplear el modelo para clasificar publicaciones y comentarios que contengan afirmaciones ecológicas, permitiendo a las marcas responder ante posibles críticas o detectar tendencias de consumo sostenible.
- Auditoría de informes de sostenibilidad: consultoras ambientales pueden usar el modelo como primer filtro para revisar memorias de sostenibilidad corporativas, señalando frases que requieran verificación de datos o evidencias.
- Investigación académica: investigadores en ciencias ambientales y comunicación pueden utilizar el modelo para analizar corpus de textos (anuncios, webs, informes) y cuantificar la prevalencia de *green claims* en diferentes sectores o regiones.
- Asistencia en redacción responsable: herramientas de redacción asistida pueden integrar el modelo para sugerir alternativas más precisas y verificables cuando el usuario escribe una afirmación ecológica ambigua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo específico, ni comparaciones con otros modelos de detección de *green claims*. El autor no ha compartido evaluaciones cuantitativas en la model card ni en el repositorio de GitHub asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo está cuantizado a 4-bit y tiene 4 mil millones de parámetros, el peso del modelo en memoria es de aproximadamente 2 GB (4B × 0.5 bytes por parámetro en 4-bit). Con overhead de activaciones y contexto, se recomienda un mínimo de 4 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o superiores, puede ejecutar el modelo cómodamente. También es compatible con GPUs de datacenter como A10, A100 o H100, aunque no son necesarias para este tamaño.
- Se puede ejecutar en CPU con cuantización GGUF (si se convierte), aunque con mayor latencia.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con Transformers, puede servirse con vLLM, TGI (Text Generation Inference) o Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, y con Ollama mediante importación.
- Latencia y throughput estimados: en una RTX 4090, la generación de tokens debería rondar los 100-150 tokens por segundo con batch de 1 y cuantización 4-bit, aunque estos valores no han sido verificados por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados a la detección de *green claims*. El modelo más cercano es el propio Qwen3-4B base, que no está especializado en esta tarea. Otras alternativas genéricas como Llama-3-8B o Mistral-7B podrían ajustarse para la misma tarea, pero no hay benchmarks públicos que permitan una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas es impredecible y probablemente deficiente para la detección de *green claims* en textos no ingleses.
- No se ha publicado información sobre el dataset de entrenamiento, su tamaño ni su composición, lo que impide evaluar posibles sesgos o lagunas en la cobertura de tipos de afirmaciones ecológicas.
- Al ser un modelo de 4B parámetros, puede presentar alucinaciones y errores de razonamiento, especialmente en textos complejos o con lenguaje técnico especializado.
- La detección de *green claims* es una tarea subjetiva que depende del contexto regulatorio y cultural; el modelo puede no alinearse con definiciones legales específicas de cada jurisdicción.
- No se ha verificado el soporte de tool calling ni otras capacidades avanzadas tras el fine-tuning; aunque el base las soporta, el ajuste fino podría haberlas degradado.
- El repositorio no incluye ejemplos de uso, scripts de inferencia ni documentación adicional, lo que dificulta su integración directa en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece garantías de precisión ni de cumplimiento normativo; cualquier uso en entornos regulados debe ser validado por expertos.

## Enlaces

- HuggingFace: https://huggingface.co/alextsiak/qwen3-4b-green-claims
- Repositorio GitHub del autor (detección de green claims): https://github.com/alextsiak/green-claim-detection
- Repositorio oficial de Qwen3 (modelo base): https://github.com/QwenLM/Qwen3
- Página de Qwen3-4B en Qualcomm AI Hub (información del base): https://aihub.qualcomm.com/mobile/models/qwen3_4b
