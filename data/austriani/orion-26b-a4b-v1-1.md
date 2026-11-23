# Austriani/Orion-26B-A4B-v1.1

## Resumen

Orion-26B-A4B-v1.1 es un modelo de lenguaje multimodal de tipo mixtura de expertos (MoE) desarrollado por TheDrummer y cuantizado por Austriani en formato GGUF para su uso con la librería ik_llama.cpp. El modelo cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) distribuidos en 128 expertos, con un diseño A4B que implica 4 mil millones de parámetros activos por token. Está construido sobre la arquitectura Gemma 4 y se distribuye bajo licencia Gemma.

El modelo está especializado en escritura creativa, roleplay y contenido sin censura (uncensored), e incorpora capacidades de razonamiento (thinking mode), visión multimodal y contexto largo. La versión publicada por Austriani es una cuantización con imatrix y calibración v3 orientada a maximizar la calidad bajo compresión, empleando el formato IQK y trellis-quant sobre ik_llama.cpp.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria de un modelo base de TheDrummer, orientada a despliegue local eficiente en hardware de consumo, con soporte para entrada image-text-to-text y un pipeline conversacional. El repositorio acumula 1.838 descargas y un tamaño de 89,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base Gemma 4, 128 expertos |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | 4 B (designación A4B) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | GGUF cuantizado con imatrix, IQK, trellis-quant, calibración v3 |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF (librería ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mixtura de expertos (MoE) con 128 expertos sobre una base Gemma 4, con 25,2 mil millones de parámetros totales y 4 mil millones activos por token (configuración A4B). Esta topología permite un coste computacional de inferencia comparable a un modelo denso de 4 B mientras se dispone de la capacidad representacional de un modelo de 25 B. El pipeline declarado es image-text-to-text, lo que confirma su naturaleza multimodal con entrada de imagen y texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La versión de Austriani es una cuantización del modelo base TheDrummer/Orion-26B-A4B-v1.1, realizada con imatrix y calibración v3, empleando el formato IQK y trellis-quant para ik_llama.cpp, lo que constituye la innovación técnica destacable de esta publicación concreta (optimización de la compresión manteniendo calidad).

## Capacidades

- Generación de texto y escritura creativa, con especialización declarada en creative-writing y roleplay.
- Razonamiento en modo thinking (etiqueta thinking).
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text, etiqueta vision).
- Contenido sin censura (uncensored) y material NSFW (not-for-all-adversaries).
- Soporte de contexto largo (etiqueta long-context; longitud exacta no disponible).
- Conversación multi-turno (pipeline conversational).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo está entrenado específicamente para creative-writing, por lo que puede generar narrativa, diálogos y descripciones con coherencia estilística, aprovechando sus 4 B de parámetros activos para mantener latencia baja en generación larga.
- Roleplay conversacional: su especialización en roleplay y su pipeline conversacional permiten mantener personajes consistentes en interacciones multi-turno, con soporte de contexto largo para conservar el hilo narrativo.
- Despliegue local en hardware de consumo: al ser una cuantización GGUF para ik_llama.cpp con 4 B de parámetros activos, puede ejecutarse en GPU de gama alta de consumo y en CPU con suficiente memoria, lo que lo hace adecuado para entornos sin infraestructura cloud.
- Generación de contenido sin restricciones: para proyectos que requieren texto no filtrado (ficción adulta, guiones, material NSFW), el modelo está explícitamente orientado a contenido uncensored, aunque con las advertencias legales correspondientes.
- Asistencia multimodal básica: al aceptar entrada image-text-to-text, puede emplearse para describir imágenes, responder preguntas sobre contenido visual o generar texto condicionado por una imagen en aplicaciones de accesibilidad o documentación.
- Prototipado de asistentes conversacionales: su formato GGUF y compatibilidad con endpoints permiten integrarlo rápidamente en prototipos de chatbot con contexto largo, evaluando calidad antes de migrar a un modelo mayor.
- Experimentación con cuantización: la publicación sirve como referencia para estudiar el impacto de imatrix y calibración v3 en la calidad de un MoE de 25 B comprimido, útil para investigadores de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 25,2 B de parámetros totales, una cuantización de 4 bits requeriría del orden de 13-15 GB, y una de 2-3 bits del orden de 7-10 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? Probablemente sí en GPU de gama alta con suficiente VRAM (p. ej. RTX 4090 con 24 GB) para cuantizaciones de 4 bits, aunque no se confirma en la información.
- Opciones de despliegue: ik_llama.cpp (librería declarada), con compatibilidad de endpoints; otras opciones como vLLM, Ollama o TGI no se confirman en la información.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 (Austriani) | 25,2 B | 4 B | no disponible | Gemma | GGUF (ik_llama.cpp) |
| TheDrummer/Orion-26B-A4B-v1.1 | 25,2 B (base) | 4 B | no disponible | Gemma | safetensors (base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la única comparación fiable es con el modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo orientado a roleplay y contenido sin censura, es previsible que refleje sesgos de su dataset de entrenamiento, aunque no se documentan.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan métricas específicas.
- Limitaciones de idioma: la model card declara únicamente inglés (en), por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: licencia Gemma, que impone condiciones de uso comercial y de redistribución; es necesario revisar los términos de la licencia Gemma antes de cualquier uso en producción.
- Contenido NSFW y uncensored: el modelo está etiquetado como not-for-all-adversaries y orientado a contenido adulto; su uso requiere control de acceso y cumplimiento normativo.
- Longitud de contexto: etiquetado como long-context pero sin valor numérico confirmado; no debe asumirse una ventana concreta sin verificación.
- Formato y librería: los pesos son GGUF para ik_llama.cpp, lo que limita su uso directo en otros runtimes sin conversión.
- Fecha de creación: el repositorio figura creado el 2026-11-19, dato que conviene verificar por posible inconsistencia en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Orion-26B-A4B-v1.1
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
