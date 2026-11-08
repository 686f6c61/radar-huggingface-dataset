# Austriani/Kitchoon-Final-26B-A4B-RP-ik_llama.cpp

## Resumen

Kitchoon-Final-26B-A4B-RP-ik_llama.cpp es una cuantización en formato GGUF del modelo SubMaroon/Kitchoon-Final-26B-A4B, publicada por el usuario Austriani. Se trata de la iteración final de la línea Kitchoon, construida sobre una arquitectura Mixture-of-Experts (MoE) de tipo Gemma 4 con 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token. El modelo está ajustado específicamente para roleplay (RP) y roleplay erótico (ERP), con énfasis en el desarrollo de personajes y un estilo de escritura neutro.

La relevancia de esta publicación es doble. Por un lado, ofrece una versión cuantizada y calibrada con imatrix (calibración V3) pensada para el motor ik_llama.cpp, una bifurcación de llama.cpp orientada a optimizar el rendimiento de modelos MoE en CPU y GPU. Por otro, el modelo base está etiquetado como "uncensored" y orientado a temáticas oscuras, lo que lo sitúa en el nicho de modelos de escritura creativa sin filtros restrictivos.

La ficha se centra en la versión cuantizada alojada en el repositorio, si bien la mayor parte de las características técnicas (arquitectura, contexto, entrenamiento) provienen del modelo base, ya que la model card del repositorio de cuantización no las detalla por completo. Cabe señalar que el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4 |
| Parametros totales | 26B |
| Parametros activos | 4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibración imatrix V3 (variantes IQK/trellis-quant; niveles concretos no disponibles) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Mixture-of-Experts de tipo Gemma 4, con 26.000 millones de parámetros totales y 4.000 millones activos por token. Esta configuración reduce el coste computacional por token en comparación con un modelo denso del mismo tamaño, manteniendo una capacidad de representación elevada. El modelo base SubMaroon/Kitchoon-Final-26B-A4B es un fine-tune orientado a roleplay y escritura creativa, con un ajuste centrado en el desarrollo de personajes y un tono de escritura neutro.

La versión publicada por Austriani aplica cuantización GGUF con calibración imatrix de tercera generación (v3-calibration) y técnicas etiquetadas como trellis-quant y maxoptima, orientadas a preservar la calidad del modelo bajo compresión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el modelo base. Tampoco se detalla si la cuantización introduce decodificación especulativa u otras optimizaciones de inferencia más allá de las propias de ik_llama.cpp.

## Capacidades

- Generación de texto orientada a roleplay (RP) y roleplay erótico (ERP), con énfasis en el desarrollo de personajes.
- Escritura creativa con estilo neutro y temáticas oscuras ("dark-themes").
- Conversación multi-turno en formato chat.
- Modelo etiquetado como "uncensored", sin filtros restrictivos aparentes en la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes coherentes en conversaciones multi-turno, lo que lo hace adecuado para plataformas de rol interactivo y chatbots de personajes.
- Escritura creativa de ficción: su entrenamiento en estilo neutro y temáticas oscuras permite generar narrativa de ficción con tono controlado, útil para autores que necesitan borradores rápidos.
- Generación de diálogos para videojuegos: puede producir respuestas de personajes no jugadores (NPC) con personalidad consistente, integrándose en motores de diálogo mediante el formato GGUF e ik_llama.cpp.
- Prototipado de narrativa interactiva: adecuado para experimentar con ramificaciones argumentales y respuestas dinámicas en entornos de ficción interactiva.
- Despliegue en hardware de consumo: al ser una cuantización GGUF de un MoE con 4B activos, puede ejecutarse en equipos con recursos limitados mediante ik_llama.cpp, lo que facilita pruebas locales de escritura asistida.
- Investigación sobre modelos sin censura: útil para estudiar el comportamiento de modelos "uncensored" en tareas creativas y analizar sus sesgos y riesgos en entornos controlados.
- Generación de contenido para ERP en entornos privados: el ajuste específico en ERP lo orienta a aplicaciones de ficción adulta, siempre con las advertencias legales y éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un MoE de 26B totales en cuantización de 4 bits requeriría aproximadamente 13-16 GB solo para los pesos, más overhead de contexto y caché KV; los niveles de cuantización concretos del repositorio no se detallan.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs con 16-24 GB de VRAM (RTX 4090, A100 40 GB, etc.), pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de gama alta con 24 GB o más, sujeto al nivel de cuantización elegido; no confirmado.
- Opciones de despliegue: ik_llama.cpp (motor principal declarado). Compatibilidad con llama.cpp, Ollama, vLLM o TGI no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-RP (este) | 26B | 4B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Fine-tune RP/ERP sobre Gemma 4 MoE |
| SubMaroon/Kitchoon-Final-26B-A4B | 26B | 4B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base sin cuantizar |
| Alternativas de rol similares | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Al estar etiquetado como "uncensored" y orientado a ERP y temáticas oscuras, puede generar contenido explícito, violento o inapropiado; requiere moderación y supervisión en producción.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en contextos de roleplay donde la coherencia factual no es el objetivo principal.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción (especialmente en material adulto).
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones de contexto largo.
- El repositorio tiene 0 descargas y 1 like, sin evidencia de validación comunitaria ni de calidad de las cuantizaciones.
- La compatibilidad se declara exclusivamente con ik_llama.cpp; otros motores pueden no cargar correctamente los pesos.
- No hay benchmarks publicados que permitan evaluar la degradación introducida por la cuantización.

## Enlaces

- Repositorio Hugging Face (cuantización): https://huggingface.co/Austriani/Kitchoon-Final-26B-A4B-RP-ik_llama.cpp
- Repositorio Hugging Face (versión GGUF alternativa): https://huggingface.co/Austriani/Kitchoon-Final-26B-A4B-RP-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
