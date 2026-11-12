# JakTheTrippr/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de caracter agéntico, distribuido como pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según la model card, el modelo más capaz de la clase 3T (billones de parámetros) publicado por el laboratorio hasta la fecha. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, lo que lo orienta a tareas de codificación, creación 3D, investigación financiera y flujos agénticos de múltiples pasos.

Arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activados por token. El modelo consta de 93 capas (una densa), con una composición de atención híbrida de 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention), 896 expertos enrutados (16 seleccionados por token) más 2 expertos compartidos, y un vocabulario de 160.000 tokens. La ventana de contexto alcanza 1.000.000 de tokens.

La relevancia de esta ficha radica en que el repositorio de Hugging Face (`JakTheTrippr/Kimi-K3.1-Pro`) es un espejo no oficial de un modelo de Moonshot AI: el autor del repo es `JakTheTrippr`, no la organización `moonshotai`, y el modelo se publica bajo una licencia personalizada denominada `kimi-k3.1-pro` que no debe confundirse con la licencia oficial del modelo original. El tamaño del repositorio (1.561,4 GB) y el formato `compressed-tensors` en 8 bits condicionan por completo su despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parámetros totales | 2.780.110.363.392 (2,8 T) |
| Parámetros activos | 104 B por token |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantización | 8 bits (`compressed-tensors`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia personalizada, `license: other`) |
| Formato de pesos | safetensors con `compressed-tensors` (8 bits), `custom_code` |
| Capas | 93 (1 densa) |
| Composición de atención | 69 KDA + 24 Gated DSA |
| Dimensión oculta de atención | 7.168 |
| Cabezas de atención | 96 |
| Dimensión de cabeza del índice DSA | 128 |
| Cabezas del índice DSA | 32 |
| Top-K del índice DSA | 2.048 |
| Dimensión latente MoE | 3.584 |
| Dimensión oculta MoE por experto | 3.072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamaño de vocabulario | 160 K |
| Pipeline | `image-text-to-text` |
| Librería | `transformers` (requiere `custom_code`) |
| Tamaño del repositorio | 1.561,4 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo Mixture-of-Experts con una composición de atención híbrida poco habitual: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (DeepSeek Sparse Attention, con índice de 32 cabezas, dimensión de cabeza 128 y top-K de 2.048). Esta combinación busca equilibrar eficiencia en contextos largos (la atención dispersa reduce el coste cuadrático) con la calidad representacional de la atención lineal por deltas. El bloque MoE tiene 896 expertos enrutados, de los cuales se activan 16 por token, más 2 expertos compartidos, con dimensión latente de 3.584 y dimensión oculta de 3.072 por experto.

Según la model card, el entrenamiento parte de Kimi K3 y aplica un post-entrenamiento basado en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO convencionales; la model card solo menciona el RL conjunto. Tampoco se detalla la innovación de decodificación especulativa ni otras optimizaciones de inferencia más allá de la propia arquitectura de atención. El pipeline declarado es `image-text-to-text`, lo que confirma el carácter multimodal nativo (entrada de imagen y texto), aunque no se documentan en la información disponible los detalles del codificador visual ni la resolución soportada.

## Capacidades

- Generación de texto y razonamiento de propósito general en contextos de hasta 1.000.000 de tokens.
- Capacidad multimodal nativa de imagen a texto (pipeline `image-text-to-text`).
- Codificación de software: la model card cita mejoras sustanciales en tareas de coding.
- Creación 3D: capacidad destacada explícitamente por el autor.
- Investigación financiera y precisión factual: áreas de mejora declaradas en la model card.
- Capacidades agénticas: el modelo se describe como "agentic model", orientado a flujos de múltiples pasos.
- Conversacional multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1.000.000 de tokens de contexto, el modelo puede ingerir un monorepositorio de tamaño medio y responder preguntas de arquitectura, dependencias o refactorizaciones sin fragmentar el código en trozos.
- Asistencia a la codificación en producción: integrado en pipelines de CI/CD para revisión automática de pull requests, generación de tests y detección de regresiones, aprovechando las mejoras declaradas en coding.
- Investigación financiera asistida: análisis de informes anuales, transcripciones de llamadas de resultados y series de datos extensas en una sola ventana, con énfasis en precisión factual según la model card.
- Creación 3D asistida: generación y edición de descripciones y estructuras 3D a partir de instrucciones e imágenes de referencia, dado el soporte multimodal y la capacidad declarada en 3D.
- Agentes autónomos de múltiples pasos: orquestación de tareas que requieren planificación, uso de herramientas y verificación intermedia, gracias a la orientación agéntica del post-entrenamiento.
- Análisis de documentos multimodales: extracción de información de PDFs escaneados, gráficos e imágenes combinados con texto largo, usando el pipeline `image-text-to-text`.
- Atención al cliente especializada: conversaciones multi-turno con historial extenso y adjuntos de imagen, donde el contexto de 1 M evita perder información de interacciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma mejoras cualitativas en coding, creación 3D, investigación financiera y precisión factual respecto a Kimi K3, sin cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 T de parámetros en 8 bits, el peso del modelo ronda 1,5 TB; se requiere un clúster multi-GPU con al menos ~1,6 TB de memoria agregada solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: nodos con múltiples H100 (80 GB) o H200 (141 GB); un despliegue realista exige del orden de 20-24 H100 para los pesos en 8 bits, y más para contexto largo.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 24 GB; RTX 5090, 32 GB). Incluso con cuantizaciones agresivas no documentadas, el tamaño lo impide.
- Opciones de despliegue: `transformers` con `custom_code` (requisito del repo); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y llama.cpp/Ollama resultan inviables por tamaño.
- Latencia y throughput: no disponibles. La activación de 104 B parámetros por token sugiere un coste computacional por token elevado pese al enrutamiento disperso.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (este repo) | 2,8 T | 104 B | 1 M | `kimi-k3.1-pro` (personalizada) | Espejo no oficial en HF |
| Kimi K3 (modelo base declarado) | no disponible | no disponible | no disponible | no disponible | Repo oficial de Moonshot AI (referenciado en la model card) |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de otros modelos de la misma clase (parámetros, contexto, benchmarks o licencia) para establecer una comparación cuantitativa rigurosa. La única comparación documentada es cualitativa: Kimi K3.1 Pro se post-entrena desde Kimi K3 y la model card declara mejoras en coding, 3D, investigación financiera y precisión factual.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial: el autor es `JakTheTrippr`, no `moonshotai`. La procedencia y la integridad de los pesos no están garantizadas por la organización original.
- La licencia `kimi-k3.1-pro` es personalizada y no se detalla en la información disponible; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial. No debe asumirse que coincide con la licencia del modelo oficial de Moonshot AI.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de error; la model card solo afirma mejoras cualitativas en precisión factual.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otras lenguas distintas del inglés o el chino.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto: aunque se declaran 1 M de tokens, no se especifica el rendimiento efectivo a esa longitud ni el coste de caché KV.
- Requiere `custom_code` y `compressed-tensors`: la carga exige `trust_remote_code=True` y versiones específicas de `transformers`, lo que añade riesgo de seguridad y de compatibilidad.
- El tamaño de 1.561,4 GB hace inviable cualquier despliegue en hardware de consumo y exige infraestructura de clúster.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad que haya validado el funcionamiento del repo.
- No se documentan variantes de cuantización más allá de 8 bits, lo que limita opciones para reducir requisitos de memoria.

## Enlaces

- Repositorio de Hugging Face (espejo): https://huggingface.co/JakTheTrippr/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Chat oficial: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
