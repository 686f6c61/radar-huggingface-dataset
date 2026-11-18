# KomorAI/Oiia_v1

## Resumen

Oiia_v1 es un modelo de lenguaje en miniatura de arquitectura GPT-2, entrenado desde cero por el desarrollador KomorAI. Se distribuye en Hugging Face con el pipeline de generación de texto y un vocabulario personalizado (custom-vocab) cuyo contenido declarado en la model card es una secuencia de tokens lúdicos y onomatopéyicos ("OIIA Miau kot Mrrr karma purr SASZEEETA! elkotołomoto Meow purr miou Cat Kotecki koteck"). El modelo está etiquetado para el idioma polaco (`pl`) y no dispone de licencia especificada.

La relevancia técnica de esta ficha es limitada: con 104.448 parámetros totales según los pesos safetensors, se trata de un experimento de entrenamiento a pequeña escala, no de un modelo apto para tareas de producción. El repositorio ocupa 0.0 GB, no registra descargas ni likes, y su fecha de creación indicada es 2026-11-18. No hay información pública sobre el corpus de entrenamiento, la longitud de contexto ni los hiperparámetros utilizados.

Por tanto, esta ficha documenta lo que el autor declara y marca explícitamente como "no disponible" todo aquello que la model card no cubre. Es útil como referencia para quien quiera inspeccionar el artefacto o reutilizar su vocabulario personalizado, pero no debe considerarse un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según tags y model card) |
| Parametros totales | 104.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (`pl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | personalizado (custom-vocab), contenido declarado en la model card |
| Tamano del repositorio | 0.0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card describe el modelo como un "autorski, miniaturowy model językowy GPT-2 wytrenowany od zera", es decir, un GPT-2 miniatura entrenado desde cero por el autor. La arquitectura declarada es, por tanto, la de un transformer decoder-only tipo GPT-2, con un vocabulario personalizado definido explícitamente en la tarjeta. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto soportada.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, etc.). El recuento de 104.448 parámetros es coherente con un modelo extremadamente pequeño, muy por debajo de cualquier GPT-2 estándar (124M), lo que sugiere una configuración reducida de capas y dimensiones, aunque el desglose exacto no está disponible.

## Capacidades

- Generación de texto autoregresiva mediante el pipeline `text-generation` de Transformers.
- Manejo de un vocabulario personalizado y cerrado, orientado a la secuencia de tokens declarada en la model card.
- Etiquetado para polaco (`pl`), aunque sin evidencia de calidad lingüística general.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo thinking.
- Capacidad multilingüe: no disponible más allá de la etiqueta `pl`.

## Casos de uso

- Experimentación educativa con arquitecturas GPT-2: sirve para estudiar el flujo completo de entrenamiento desde cero, tokenizador personalizado y publicación en Hugging Face con un modelo de 104.448 parámetros.
- Pruebas de integración de pipelines de Transformers: permite validar código de carga, inferencia y despliegue con un artefacto mínimo y rápido de cargar.
- Demostración de vocabularios personalizados: útil para ilustrar cómo se define y publica un `custom-vocab` y cómo afecta a la tokenización y a la generación.
- Prototipado de interfaces lúdicas o generativas de texto corto: dado su tamaño, puede ejecutarse en cualquier entorno, incluso CPU, para pruebas de concepto.
- Docencia sobre limitaciones de los modelos miniatura: sirve como caso práctico para explicar por qué un modelo de 104.448 parámetros no generaliza y por qué el tamaño y los datos importan.
- Pruebas de reproducibilidad y empaquetado: útil para verificar flujos de CI que descargan safetensors y ejecutan inferencia sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; con 104.448 parámetros, los pesos en fp32 ocupan aproximadamente 0,4 MB.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline('text-generation', ...)`; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado y requeriría conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia estará dominada por el overhead de carga y del tokenizador más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KomorAI/Oiia_v1 | 104.448 | no disponible | no disponible | Hugging Face |
| GPT-2 (OpenAI) | 124M | 1.024 tokens | MIT (pesos publicados) | Hugging Face |
| DistilGPT-2 | 82M | 1.024 tokens | Apache 2.0 | Hugging Face |
| Modelos comparables de 100K parámetros | no disponible | no disponible | no disponible | no disponible |

La comparación con GPT-2 y DistilGPT-2 es solo orientativa por familia arquitectónica: Oiia_v1 es tres órdenes de magnitud menor en parámetros y no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (104.448 parámetros): la capacidad de generalización lingüística es prácticamente nula fuera de su vocabulario declarado.
- Riesgo de alucinación y de generación incoherente muy elevado; no apto para producción.
- Sesgos conocidos: no documentados, pero un entrenamiento desde cero sin datos descritos puede arrastrar sesgos del corpus no especificado.
- Limitaciones de idioma: solo etiquetado para polaco; sin evidencia de calidad en otros idiomas.
- Licencia no disponible: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso más allá de la experimentación.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones multi-turno largas.
- Sin descargas ni likes registrados: no hay validación comunitaria de su comportamiento.
- La model card mezcla tokens lúdicos y onomatopeyas en el vocabulario, lo que sugiere un propósito experimental más que utilitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KomorAI/Oiia_v1
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
