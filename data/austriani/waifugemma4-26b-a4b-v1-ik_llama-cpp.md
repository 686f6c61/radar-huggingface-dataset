# Austriani/WaifuGemma4-26B-A4B-V1-ik_llama.cpp

## Resumen

WaifuGemma4-26B-A4B-V1-ik_llama.cpp es una cuantización GGUF del modelo base `hiwaifu-research/WaifuGemma4-26b-a4b-v1`, publicada por el usuario Austriani. El modelo base es un Mixture-of-Experts (MoE) de arquitectura derivada de Gemma 4, con 25.233.142.046 parámetros totales y aproximadamente 3.800 millones de parámetros activos por token, distribuidos en 128 expertos enrutados. Está especializado en roleplay, escritura creativa, conversación de personajes y contenido sin censura (uncensored), y esta versión concreta está empaquetada para el runtime ik_llama.cpp con cuantizaciones IQK y calibración imatrix V3.

La relevancia de esta ficha reside en que se trata de una cuantización de un modelo MoE grande (25B) con un coste de inferencia propio de un modelo de ~4B activos, lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM moderados si se elige la cuantización adecuada. El repositorio ocupa 89,9 GB e incluye múltiples niveles de cuantización, lo que refleja el interés del autor en ofrecer opciones desde calidad casi completa hasta despliegues muy comprimidos.

El modelo está pensado para generación de texto conversacional en inglés, con licencia Apache 2.0, y su ecosistema de herramientas (ik_llama.cpp) es menos estándar que llama.cpp u Ollama, lo que condiciona su despliegue. No se han publicado datos de benchmarks ni detalles completos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Gemma 4; transformer con 128 expertos enrutados |
| Parametros totales | 25.233.142.046 (≈25,2B) |
| Parametros activos | ≈3,8B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones IQK (trellis-quant, maxoptima) calibradas con imatrix V3; niveles concretos no detallados en la información disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 89,9 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts: 25,2B parámetros totales de los que solo ~3,8B se activan por token, repartidos entre 128 expertos enrutados. Esta configuración reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño, manteniendo una capacidad de representación alta. La base declarada es Gemma 4, aunque no se detalla en la información proporcionada la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF, DPO o ajuste fino supervisado específico para roleplay.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: el autor emplea cuantizaciones IQK con "trellis-quant" y "maxoptima", calibradas mediante una imatrix V3 con contexto de 1024 tokens. Este tipo de calibración busca preservar la calidad de los expertos enrutados al comprimir, un punto crítico en modelos MoE donde una cuantización agresiva puede degradar el enrutamiento. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones de arquitectura.

## Capacidades

- Generación de texto conversacional y creativo en inglés, orientada a roleplay y narrativa de personajes.
- Roleplay multi-turno con mantenimiento de personaje y estilo, según los tags del repositorio (roleplay, rp, erp, character, waifu).
- Escritura creativa y ficción, incluyendo contenido para adultos sin censura (uncensored).
- Conversación general y chat (chat, conversational).
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional de personajes: el modelo puede mantener interacciones multi-turno con consistencia de personaje gracias a su especialización declarada en roleplay y su ventana de contexto (longitud no especificada, pero el modelo base es de la familia Gemma 4). Adecuado para aplicaciones de entretenimiento y chatbots de personajes.
- Escritura creativa asistida: generación de relatos, diálogos y ficción por capítulos, aprovechando el ajuste del modelo base hacia narrativa y su naturaleza sin censura para tramas adultas.
- Generación de contenido para plataformas de ficción interactiva: integración en motores de historias ramificadas donde el modelo produce respuestas de personaje coherentes con el estado de la narrativa.
- Chat de acompañamiento y entretenimiento: despliegue de asistentes conversacionales con personalidad definida, usando las cuantizaciones GGUF más pequeñas para servidores con VRAM limitada.
- Prototipado de aplicaciones de rol con IA en local: gracias al bajo número de parámetros activos (~3,8B), es viable ejecutarlo en una GPU de consumo con una cuantización agresiva, lo que facilita iterar en desarrollo sin coste de API.
- Fine-tuning y experimentación sobre MoE: el repositorio sirve como referencia para estudiar el efecto de la cuantización IQK con imatrix V3 sobre modelos MoE, comparando niveles de compresión frente al modelo base en safetensors.
- Generación de diálogos para videojuegos o novelas visuales: el modelo puede producir líneas de personaje en inglés para prototipos de juegos, con la advertencia de que el contenido no está filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantización GGUF elegido. Con 25,2B parámetros totales, una cuantización de ~4 bits requiere aproximadamente 13-15 GB de VRAM; una de ~2-3 bits puede bajar a 8-10 GB. Estos valores son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: para cuantizaciones de alta calidad, GPU con 24 GB (RTX 3090, RTX 4090) o profesionales (A100 40/80 GB, H100). Para cuantizaciones agresivas, GPU de 12-16 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones de 4 bits o menores, y potencialmente en GPUs de 12 GB con cuantizaciones de 2-3 bits.
- Opciones de despliegue: el repositorio está empaquetado para ik_llama.cpp (fork de llama.cpp con soporte IQK). No se declara compatibilidad con vLLM, TGI u Ollama en la información disponible; llama.cpp estándar podría no soportar los tipos de cuantización IQK empleados.
- Latencia y throughput: no disponibles. Al tener ~3,8B parámetros activos, el throughput debería ser sustancialmente mayor que el de un modelo denso de 25B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| WaifuGemma4-26B-A4B-V1 (esta ficha) | 25,2B | ~3,8B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) |
| Modelo base WaifuGemma4-26b-a4b-v1 | 25,2B | ~3,8B | no disponible | Apache 2.0 | safetensors |
| Alternativas de rol MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo está especializado en roleplay y contenido sin censura; no es adecuado para aplicaciones que requieran filtrado de contenido o alineación estricta.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de evaluación en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Gemma 4 y de un ajuste para roleplay, pueden heredarse sesgos del corpus de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir políticas de plataformas o legislación según el contexto de despliegue.
- Compatibilidad de runtime limitada: las cuantizaciones IQK requieren ik_llama.cpp; no se garantiza su funcionamiento en llama.cpp estándar, Ollama o vLLM.
- Longitud de contexto no especificada: no se puede planificar el diseño de aplicaciones con contexto largo sin ese dato.
- Repositorio de 89,9 GB: la descarga completa es costosa; conviene descargar solo el archivo GGUF del nivel de cuantización deseado.
- Fecha de creación (2026-11-10) y actualización (2026-11-11): verificar si el autor ha publicado revisiones posteriores con correcciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/WaifuGemma4-26B-A4B-V1-ik_llama.cpp
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- ik_llama.cpp (runtime requerido): no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
