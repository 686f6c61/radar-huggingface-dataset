# axom-ai/axomai-brain-progya

## Resumen

AxomAI Brain Progya es un modelo de lenguaje causal de tipo transformer denso desarrollado por axom-ai, un proyecto que se presenta bajo la etiqueta de "soberanía de IA" (sovereign-ai) y orientado específicamente al idioma asamés (as) junto con el inglés. Con 2.525.087.744 parámetros (aproximadamente 2,5 mil millones), se posiciona en la gama de modelos pequeños, lo que lo hace viable para despliegues con recursos limitados y para tareas de generación de texto conversacional en un nicho lingüístico escasamente cubierto por los grandes modelos generalistas.

El modelo se distribuye en formato safetensors con arquitectura derivada de la familia Llama, y está entrenado sobre un corpus personalizado de asamés (dataset:custom-assamese-corpus). Su relevancia actual radica en que el asamés, hablado por unos 15 millones de personas en el noreste de la India, tiene una representación muy escasa en los modelos abiertos mainstream; un modelo dedicado de 2,5B parámetros puede ofrecer un punto de partida útil para aplicaciones locales de traducción, atención al cliente o generación de contenido en esa lengua.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, el acceso es restringido (gated) y la licencia es propietaria (axom-ai-proprietary). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni resultados de benchmarks, por lo que las secciones siguientes reflejan únicamente lo que puede inferirse de los metadatos verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Llama) |
| Parametros totales | 2.525.087.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantización estándar de Llama, sin confirmar) |
| Idiomas soportados | asamés (as), inglés (en) |
| Licencia | axom-ai-proprietary (licencia propietaria, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con nomenclatura de la familia Llama, según los tags del repositorio (`llama`, `causal-lm`, `dense-llm`, `transformer`). Con 2,5B parámetros, el modelo se sitúa en la franja de modelos pequeños optimizados para inferencia eficiente, sin componentes de mezcla de expertos. No se dispone de información pública sobre la dimensión de las capas, el número de cabezas de atención, la longitud de contexto nativa ni la estrategia de tokenización empleada.

En cuanto al entrenamiento, el único dato verificable es el uso de un corpus personalizado de asamés (`dataset:custom-assamese-corpus`) combinado presumiblemente con datos en inglés, dado que ambos idiomas figuran como soportados. No se han publicado el volumen de tokens, la proporción de cada idioma en la mezcla, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. Tampoco hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto causal en asamés e inglés, orientada a casos conversacionales según el tag `conversational`.
- Modelo de lenguaje base con pipeline `text-generation`, adecuado para completado y diálogo.
- Soporte multilingüe limitado a los dos idiomas declarados (as, en); no hay evidencia de otros idiomas.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información publicada.
- Visión, audio o modo de pensamiento (thinking): no disponible; los tags no indican modalidades adicionales.
- Capacidades matemáticas o de código: no documentadas.

## Casos de uso

- Traducción asistida asamés-inglés: el modelo puede emplearse como motor de traducción o post-edición en pares as-en, aprovechando que es uno de los pocos modelos dedicados al asamés con pesos publicados, aunque la calidad debe validarse empíricamente al no haber benchmarks.
- Atención al cliente en asamés: con 2,5B parámetros puede desplegarse en infraestructura modesta para gestionar conversaciones multi-turno en asamés, un nicho que los modelos generalistas cubren deficientemente.
- Generación de contenido local: redacción de textos divulgativos, noticias locales o material educativo en asamés para medios y organizaciones del noreste de la India.
- Preservación lingüística y digitalización: generación de variantes de texto y aumento de datos para proyectos de documentación del asamés, usando el modelo como generador de corpus sintético.
- Asistentes conversacionales embebidos: por su tamaño contenido, puede integrarse en aplicaciones locales o de borde con requisitos de latencia bajos, siempre que la licencia propietaria lo permita.
- Investigación en NLP de bajos recursos: servir como línea base para estudiar el rendimiento de modelos pequeños en lenguas con pocos datos, comparándolo con modelos multilingües de mayor tamaño.
- Prototipado de chatbots bilingües as-en: para productos dirigidos a usuarios asameses que necesiten alternar entre su lengua y el inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, unos 6-8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB; en 4 bits: aproximadamente 1,5-2 GB (estimaciones teóricas basadas en el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para FP16; tarjetas de 4-6 GB podrían servir con cuantización. Para producción, A10G, L4 o A100 si se requiere throughput alto.
- Cabe en GPU consumer: sí, con 8 GB o más en precisión completa y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: al ser safetensors con arquitectura Llama, es compatible en principio con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama; sin embargo, el acceso restringido y la licencia propietaria condicionan su uso.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxomAI Brain Progya | 2,5B | no disponible | as, en | Propietaria (gated) | Restringida |
| Llama 3.2 3B | 3,2B | 128K | multilingüe (8 idiomas oficiales, asamés no incluido) | Llama Community License | Abierta |
| Qwen2.5 3B | 3,1B | 32K | multilingüe amplio | Apache 2.0 | Abierta |
| Gemma 2 2B | 2,6B | 8K | multilingüe | Gemma Terms | Abierta |

La comparativa es aproximada: no existen datos de rendimiento del modelo de axom-ai que permitan una evaluación cuantitativa frente a estas alternativas. Su ventaja diferencial es la cobertura dedicada del asamés, ausente en los modelos generalistas; su desventaja es la licencia propietaria, el acceso restringido y la falta de documentación técnica y de benchmarks.

## Limitaciones y advertencias

- Licencia propietaria (axom-ai-proprietary): el uso comercial está sujeto a los términos del autor, que no se detallan públicamente; es imprescindible revisarlos antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad y la auditoría independiente.
- Ausencia total de benchmarks publicados: no hay evidencia empírica de calidad en generación, traducción o diálogo.
- Riesgo de alucinación inherente a los modelos de 2,5B parámetros, especialmente en un dominio lingüístico con datos de entrenamiento presumiblemente escasos.
- Cobertura limitada a asamés e inglés; no debe esperarse competencia en otras lenguas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Sesgos: no documentados, pero probables en un corpus personalizado de una región concreta; se recomienda evaluación específica antes de uso público.
- Fecha de creación del repositorio (noviembre de 2026 según los metadatos) y ausencia de descargas o interacción sugieren un proyecto incipiente sin validación por la comunidad.
- No hay información sobre el proceso de alineación (RLHF/DPO), por lo que el comportamiento conversacional puede ser inconsistente.

## Enlaces

- HuggingFace: https://huggingface.co/axom-ai/axomai-brain-progya
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
