# Infinix-ai/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado como pesos abiertos por Moonshot AI (el repositorio de Hugging Face aparece bajo la cuenta `Infinix-ai`, pero la model card, los enlaces y la licencia remiten a Moonshot AI). Se trata de un modelo de la clase de 3 billones de parámetros, según la propia model card, y el recuento real de safetensors asciende a 2.780.110.363.392 parámetros. Emplea una arquitectura Mixture-of-Experts (MoE) con 896 expertos, 16 expertos seleccionados por token y 2 expertos compartidos, lo que da 104.000 millones de parámetros activos por token.

El modelo se post-entrena a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios, y es el primero de la serie K3.1. Su rasgo diferencial es una ventana de contexto de 1 millón de tokens combinada con capacidades multimodales (pipeline `image-text-to-text`), lo que lo sitúa en la categoría de modelos frontera para tareas agénticas de contexto largo.

Es relevante ahora porque compite directamente con los grandes modelos abiertos de contexto largo y naturaleza multimodal, y porque su licencia propia (`kimi-k3.1-pro`) y su enorme tamaño condicionan fuertemente su despliegue: el repositorio ocupa 1561,4 GB, lo que exige infraestructura multi-GPU para inferencia en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2,78 billones (2.780.110.363.392 según safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, `license: other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), `custom_code` |

Otros datos técnicos de la model card: 93 capas (1 densa), dimensión oculta de atención 7168, 96 cabezas de atención, dimensión de cabeza del índice DSA 128, 32 cabezas de índice DSA, top-K del índice DSA 2048, dimensión latente MoE 3584, dimensión oculta MoE por experto 3072, vocabulario de 160K tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con una composición de atención híbrida poco habitual: 69 capas usan KDA (atención lineal de tipo kernelized/delta) y 24 capas usan Gated DSA (atención dispersa con índice, con top-K de 2048 sobre 32 cabezas de índice). Esta mezcla busca mantener eficiencia en contextos de 1M de tokens sin renunciar a la calidad de atención completa. El MoE tiene 896 expertos con 16 seleccionados por token más 2 compartidos, y una dimensión latente de 3584 que reduce el coste de routing.

El entrenamiento parte de Kimi K3 y aplica post-entrenamiento con RL conjunto a gran escala en cientos de dominios downstream, según la model card. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni detalles de RLHF/DPO más allá de la mención al RL conjunto. Tampoco se detalla la innovación de decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento de contexto largo (hasta 1M tokens).
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`).
- Codificación: la model card destaca mejoras sustanciales en coding.
- Creación 3D: mejora destacada en la model card.
- Investigación financiera: mejora destacada en la model card.
- Precisión factual: mejora destacada en la model card.
- Capacidades agénticas: el modelo se describe como "agentic model" con mejoras en capacidades agénticas.
- Conversacional multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un monorepo o una base de código extensa y responder preguntas de arquitectura, refactorización o detección de bugs entre módulos, algo inviable con ventanas de 128K.
- Investigación financiera asistida: la model card cita mejoras en financial research; se usaría para resumir informes anuales, comparar estados financieros de varios ejercicios y extraer métricas, apoyándose en la ventana de 1M para incluir múltiples documentos.
- Creación 3D y pipelines de assets: dado el énfasis de la model card en 3D creation, puede emplearse como generador/validador de descripciones y scripts de escenas en flujos de producción de contenido 3D.
- Agentes autónomos multi-paso: el modelo está post-entrenado con RL en dominios downstream y se describe como agéntico; encaja en orquestadores que encadenan herramientas y mantienen estado durante tareas largas.
- Asistencia de código en producción: integrable vía API compatible con endpoints (tag `endpoints_compatible`) en pipelines de CI/CD para revisión de PRs y generación de tests, con la salvedad de que el tool calling no está confirmado en la información disponible.
- Procesamiento de documentos multimodal: al aceptar imagen-texto, puede extraer información de capturas, diagramas y PDFs escaneados junto con el texto asociado en un mismo contexto.
- Atención al cliente con historial largo: la ventana de 1M permite conservar todo el historial de una cuenta y documentación de producto sin truncar, reduciendo pérdidas de contexto en conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1561,4 GB; en 8-bit (formato publicado) se requiere del orden de 1,5 TB de memoria agregada. En precisión completa (BF16/FP16) se necesitarían aproximadamente 5,5 TB.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, requiere clústeres multi-GPU (varias decenas de aceleradores de 80 GB para el formato de 8 bits).
- ¿Cabe en consumer GPU? No. Ni siquiera en configuraciones multi-GPU de consumo.
- Opciones de despliegue: la librería indicada es `transformers` con `custom_code`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,78 B (2,8T) | 104B | 1M | `kimi-k3.1-pro` (other) | Sí (image-text-to-text) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma clase, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: la model card menciona mejoras en precisión factual, pero no cuantifica la tasa de alucinación; en producción conviene validar salidas factuales.
- Idiomas soportados: no disponible; no se puede garantizar calidad multilingüe.
- Licencia: licencia propia `kimi-k3.1-pro` (`license: other`); es imprescindible revisar los términos del archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia OSI estándar.
- Tamaño prohibitivo: 1561,4 GB de repositorio y ~1,5 TB en 8 bits hacen inviable el despliegue en infraestructura convencional; requiere clúster multi-GPU.
- Tool calling y capacidades agénticas: aunque el modelo se describe como agéntico, no se confirma en la información disponible el soporte de function calling ni el formato de herramientas.
- Repositorio bajo `Infinix-ai` con 0 descargas y 0 likes: la procedencia del espejo no está verificada; conviene contrastar con el repositorio oficial de Moonshot AI antes de usarlo en producción.
- Formato `custom_code`: requiere `trust_remote_code=True` en transformers, con el riesgo de seguridad asociado a ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- API Quickstart: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
