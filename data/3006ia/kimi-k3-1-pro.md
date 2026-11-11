# 3006IA/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según la model card, el modelo "clase 3T" más capaz del laboratorio hasta la fecha. Está construido mediante post-entrenamiento sobre Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, y incorpora una ventana de contexto de un millón de tokens. La arquitectura es un transformer Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token.

El modelo se distribuye en formato safetensors y compressed-tensors (8-bit), con pipeline `image-text-to-text`, lo que confirma su naturaleza multimodal (entrada de imagen y texto). El repositorio ocupa aproximadamente 1.561 GB, coherente con el tamaño de los pesos en precisión reducida. La licencia es propietaria (`kimi-k3.1-pro`), bajo la etiqueta `license:other`, por lo que las condiciones de uso comercial deben consultarse en el fichero LICENSE del repositorio.

La relevancia de esta ficha radica en que se trata de un modelo de escala extrema (clase 3T) con activación dispersa, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos. No obstante, la información pública disponible en el momento de redactar esta ficha es limitada: no se han publicado resultados de benchmarks, listado de idiomas ni detalles completos de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; 69 capas KDA + 24 capas Gated DSA; 93 capas totales (1 densa) |
| Parámetros totales | 2.780.110.363.392 (≈2,8 T) |
| Parámetros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Tipos de cuantización | Pesos publicados en 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (license:other) |
| Formato de pesos | safetensors, compressed-tensors (8-bit) |

Parámetros arquitectónicos adicionales: dimensión oculta de atención 7168, 96 cabezas de atención, dimensión de cabeza de índice DSA 128, 32 cabezas de índice DSA, top-K DSA 2048, dimensión latente MoE 3584, dimensión oculta por experto 3072, 896 expertos, 16 expertos seleccionados por token, 2 expertos compartidos, vocabulario de 160K tokens.

## Arquitectura y entrenamiento

Kimi K3.1 Pro emplea una arquitectura MoE con 93 capas, de las cuales solo una es densa. La composición de capas de atención combina 69 capas KDA (atención lineal de tipo delta, presumiblemente) y 24 capas Gated DSA (atención dispersa con compuerta), una mezcla híbrida diseñada para manejar contextos de hasta un millón de tokens con coste computacional subcuadrático. El bloque MoE utiliza 896 expertos con 16 expertos activos por token más 2 expertos compartidos, sobre una dimensión latente de 3584 y una dimensión oculta por experto de 3072. El vocabulario es de 160K tokens.

El entrenamiento parte de Kimi K3 y se completa mediante post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, según indica la model card. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO de forma explícita. La model card menciona mejoras sustanciales en codificación, creación 3D, investigación financiera y precisión factual, lo que sugiere que el RL se orientó a capacidades agénticas y de razonamiento factual.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline `image-text-to-text` confirma entrada de imágenes junto con texto.
- Codificación y generación de código, con mejoras declaradas por el autor respecto a Kimi K3.
- Creación 3D, según la model card.
- Investigación financiera y precisión factual mejoradas mediante RL.
- Capacidades agénticas: el modelo se describe como "agentic model", orientado a tareas multi-paso.
- Ventana de contexto de 1 M tokens, adecuada para documentos extensos y conversaciones largas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible el listado de idiomas.
- Modo de razonamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa: con 1 M de tokens de contexto, el modelo puede ingerir informes anuales, expedientes completos o bases de código de gran tamaño en una sola pasada, sin necesidad de chunking agresivo.
- Investigación financiera asistida: la model card declara mejoras específicas en investigación financiera, por lo que encaja en flujos de extracción y síntesis de datos de mercado, informes y estados financieros.
- Generación de código en producción: las mejoras declaradas en codificación permiten integrarlo en pipelines de revisión, generación de tests y refactorización, aunque la licencia debe verificarse antes de uso comercial.
- Creación 3D y diseño asistido: capacidad declarada por el autor, aplicable a generación de descripciones, scripts de modelado o asistentes de herramientas 3D.
- Agentes autónomos multi-paso: su naturaleza agéntica y el RL en dominios downstream lo orientan a tareas que requieren planificación y ejecución encadenada.
- Asistentes multimodales: al aceptar imagen y texto, puede emplearse en análisis de capturas, diagramas o documentos escaneados combinados con consultas textuales.
- Verificación factual y control de calidad: las mejoras en precisión factual lo hacen apto para tareas de contraste y detección de inconsistencias en corpus grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 T de parámetros totales y pesos en 8-bit, el peso del modelo ronda 1,5 TB, por lo que no cabe en una sola GPU. Se requiere despliegue multi-GPU o multi-nodo con agregación de memoria.
- GPU recomendadas: clústeres de GPUs de centro de datos (H100, H200, B200 o equivalentes) con suficiente memoria agregada; no es viable en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas.
- Opciones de despliegue: la librería indicada es `transformers`; no se confirman en la información disponible soportes de vLLM, llama.cpp, Ollama o TGI. El formato compressed-tensors 8-bit sugiere compatibilidad con stacks que soporten dicha cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | ≈2,8 T | 104 B | 1 M | `kimi-k3.1-pro` (other) | Pesos abiertos en HF |
| Kimi K3 (predecesor) | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma clase, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; todo modelo de gran escala presenta riesgos de sesgo en los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; la model card declara mejoras en precisión factual, pero no aporta métricas que lo respalden.
- Idiomas: no se publica el listado de idiomas soportados, lo que impide garantizar calidad multilingüe.
- Licencia: licencia propietaria `kimi-k3.1-pro` bajo `license:other`; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial o redistribución.
- Despliegue: el tamaño (≈1,5 TB en 8-bit) hace inviable la inferencia en hardware de consumo y exige infraestructura de centro de datos.
- Información incompleta: no hay benchmarks, ni detalles de dataset, ni confirmación de tool calling, lo que limita la evaluación objetiva.
- Fecha de creación del repositorio: 2026-11-10, con 0 descargas y 0 likes en el momento de la consulta; la madurez y el soporte de la comunidad no están establecidos.

## Enlaces

- Hugging Face: https://huggingface.co/3006IA/Kimi-K3.1-Pro
- Repositorio oficial referenciado: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
