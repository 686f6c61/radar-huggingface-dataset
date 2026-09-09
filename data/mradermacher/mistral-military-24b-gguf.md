# mradermacher/Mistral-Military-24B-GGUF

## Resumen

El modelo Mistral-Military-24B-GGUF es una cuantización GGUF del modelo Mistral-Military-24B, desarrollado por racineai y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 23.572 millones de parámetros (23.57B), basado en la arquitectura Mistral, que ha sido sometido a un proceso de continued pre-training y a un merge TIES para especializarse en el ámbito militar y de defensa, con un enfoque bilingüe en francés e inglés. Este repositorio ofrece versiones cuantizadas en GGUF, desde Q2_K hasta Q8_0, para facilitar la ejecución local en CPU o GPU mediante herramientas como llama.cpp o Ollama, junto con un proyecto multimodal (mmproj) que sugiere soporte de entrada de imágenes. La relevancia de este modelo radica en que proporciona una opción abierta bajo licencia Apache 2.0 para tareas de procesamiento de lenguaje técnico en el sector de la defensa, un área donde existen pocos modelos abiertos con un vocabulario tan específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral 24B) |
| Parametros totales | 23.572.403.200 (23.57B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye proyecto multimodal mmproj opcional en f16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Mistral, con 23.57B de parámetros. Según la información disponible, el entrenamiento consistió en un continued pre-training sobre un dominio militar y de defensa, utilizando una técnica de merge TIES para combinar los pesos de varios modelos. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicó RLHF o DPO. El repositorio de cuantización incluye ficheros mmproj en formato f16 y Q8_0, lo que apunta a una arquitectura capaz de procesar entradas de imagen, aunque no hay documentación técnica adicional sobre el funcionamiento multimodal en este repositorio.

## Capacidades

- Generación de texto en francés e inglés, con un léxico orientado a terminología militar y de defensa.
- Modelo conversacional, como indica la etiqueta "conversational".
- Capacidad multimodal potencial: se incluyen ficheros mmproj, lo que sugiere que puede ser utilizado con un módulo de visión, aunque esta función no está documentada explícitamente.
- No se especifican capacidades de tool calling ni soporte de agentes.
- No se dispone de información sobre razonamiento matemático, generación de código o evaluaciones de pensamiento multicontinuado. Es probable que conserve las capacidades base de Mistral, pero no están evaluadas en este repositorio.

## Casos de uso

- Análisis de documentación técnica de defensa: el modelo puede procesar manuales, especificaciones y partes en francés e inglés para extraer información, aprovechando el continued pre-training en corpus militares.
- Traducción bilingüe de material táctico: al estar entrenado en fr y en, es útil para traducir informes de inteligencia o comunicaciones entre ambos idiomas, manteniendo la terminología militar.
- Asistencia a analistas de inteligencia: puede generar resúmenes de informes largos o responder preguntas sobre eventos descritos en textos, con un vocabulario especializado.
- Soporte en mantenimiento logístico: integrado en un chatbot interno, puede resolver consultas sobre procedimientos de mantenimiento o inventario de equipos, siempre que se proporcione el contexto necesario.
- Simulación de escenarios para entrenamiento: puede redactar informes de situación hipotéticos o diálogos tácticos para ejercicios, facilitando la preparación de personal sin exponer operaciones reales.
- Investigación en lingüística computacional militar: sirve como modelo de referencia para analizar la evolución del lenguaje de defensa o para crear conjuntos de datos de evaluación.
- Análisis multimodal de imágenes (si se usa con el módulo mmproj): potencialmente puede describir imágenes satelitales o de equipos, aunque esta función no está validada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas comparativas en el README.

## Requisitos de hardware

- Tamaños de cuantización según la tabla del repo: Q2_K 9.0 GB, Q3_K_S 10.5 GB, Q3_K_M 11.6 GB, Q3_K_L 12.5 GB, IQ4_XS 13.0 GB, Q4_K_S 13.6 GB, Q4_K_M 14.4 GB, Q5_K_S 16.4 GB, Q5_K_M 16.9 GB, Q6_K 19.4 GB, Q8_0 25.2 GB.
- VRAM estimada: para Q4_K_M se necesitan aproximadamente 14.4 GB de VRAM; para Q8_0, 25.2 GB. Es posible ejecutar cuantizaciones inferiores en GPUs con 12-16 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K con offloading parcial; A100 o H100 para Q8_0 en despliegues profesionales de baja latencia.
- Compatibilidad con GPU de consumo: sí, una RTX 4080 o 4090 puede ejecutar las cuantizaciones Q2_K, Q3_K_*, IQ4_XS y Q4_K_*; Q4_K_M es el punto recomendado para equilibrio entre calidad y memoria.
- Opciones de despliegue: llama.cpp (ideal para GGUF), Ollama, LM Studio, text-generation-webui y koboldcpp. Para despliegue de alta concurrencia se recomienda usar los pesos safetensors originales con vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Notas |
|---|---|---|---|---|
| racineai/Mistral-Military-24B | 23.57B | Apache 2.0 | safetensors | Modelo original, base de la cuantización |
| mradermacher/Mistral-Military-24B-GGUF | 23.57B | Apache 2.0 | GGUF | Cuantizaciones con proyecto mmproj |
| mradermacher/Berthier-Mistral-Military-24B-GGUF | 23.57B | Apache 2.0 | GGUF | Variante de la misma familia, sin datos adicionales en la información disponible |

No se dispone de datos de rendimiento en benchmarks que permitan comparar estos modelos entre sí.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que no se puede evaluar la calidad del modelo en tareas estándar como MMLU o HumanEval.
- Riesgo de alucinación: al tratarse de un modelo con dominio específico, puede generar terminología incorrecta o inventar datos si la información solicitada no está en sus datos de entrenamiento.
- Sesgos: el dominio militar y de defensa puede introducir perspectivas particulares o vocabulario ofensivo, lo que desaconseja su uso en contextos no militares sin revisión humana.
- Idiomas limitados a fr y en; no soporta otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza de los datos de entrenamiento podría acarrear restricciones no descritas; se recomienda revisar la licencia del modelo base.
- El formato GGUF limita la capacidad de fine-tuning; para entrenamiento o ajuste es necesario usar los pesos safetensors originales.
- El soporte multimodal no está validado ni documentado; puede requerir un módulo CLIP específico para funcionar correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mistral-Military-24B-GGUF
- Modelo base original: https://huggingface.co/racineai/Mistral-Military-24B
- Versión i1 (weighted/imatrix): https://huggingface.co/mradermacher/Mistral-Military-24B-i1-GGUF
- Variante relacionada Berthier: https://huggingface.co/mradermacher/Berthier-Mistral-Military-24B-GGUF
