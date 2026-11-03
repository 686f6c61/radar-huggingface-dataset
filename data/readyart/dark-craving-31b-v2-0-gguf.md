# ReadyArt/Dark-Craving-31B-v2.0-GGUF

## Resumen

Dark-Craving-31B-v2.0-GGUF es una cuantización en formato GGUF del modelo Dark-Craving-31B-v2.0, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generación de texto orientado a roleplay conversacional y contenido para adultos (ERP), afinado para mantener conversaciones multi-turno de temática explícita. El repositorio incluye únicamente los pesos cuantizados; el modelo original en precisión completa se distribuye en un repositorio separado del mismo autor.

El modelo parte de una base de 31.000 millones de parámetros, aunque la model card no especifica la arquitectura exacta, el número de tokens de entrenamiento ni el proceso de alineamiento aplicado. La etiqueta "unaligned" sugiere que no ha pasado por un proceso intensivo de RLHF orientado a rechazar contenido sensible, lo que explica su orientación hacia narrativa adulta sin restricciones.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no publica benchmarks y su model card consiste mayoritariamente en estilos CSS sin documentación técnica sustantiva. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido del pipeline text-generation) |
| Parametros totales | 31B (según el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (los niveles concretos no se detallan en la información disponible) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo base Dark-Craving-31B-v2.0. Por el pipeline declarado (text-generation) y el tamaño (31B), se trata presumiblemente de un transformer decoder-only, pero la model card no confirma la familia arquitectónica, la longitud de contexto nativa ni si emplea técnicas como GQA o atención lineal.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de SFT, RLHF o DPO. La etiqueta "unaligned" indica ausencia de un alineamiento restrictivo, pero no especifica el método de ajuste instruccional empleado. Esta cuantización GGUF no aporta información adicional sobre el entrenamiento: solo transforma los pesos del modelo base a un formato de menor precisión para inferencia.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay.
- Contenido narrativo para adultos (ERP) de temática explícita, según declara el autor.
- Modo instruct: acepta instrucciones y mantiene personajes o escenarios definidos por el usuario.
- Comportamiento "unaligned": menor tendencia a rechazar peticiones de contenido sensible en comparación con modelos alineados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está afinado para mantener personajes coherentes en diálogos multi-turno, lo que lo hace adecuado para plataformas de ficción interactiva donde el usuario define el escenario y el tono.
- Narrativa adulta asistida: escritores de ficción erótica pueden emplearlo para generar borradores de escenas, explorar variantes de diálogo o desarrollar arcos de personaje sin las restricciones de filtros de contenido de modelos alineados.
- Simulación de personajes en juegos de texto: integrable en motores de aventuras conversacionales o chatbots de rol donde se requiere consistencia de voz y ausencia de rechazos temáticos.
- Investigación sobre alineamiento y seguridad: útil como contrapunto en estudios que comparan el comportamiento de modelos alineados frente a no alineados en tareas de contenido sensible, siempre en entornos controlados.
- Generación de diálogo para prototipos de entretenimiento para adultos: desarrolladores de aplicaciones de ficción interactiva pueden desplegarlo localmente con llama.cpp u Ollama para evitar dependencias de API con moderación externa.
- Fine-tuning posterior especializado: al publicarse en GGUF y con licencia Apache 2.0, sirve como base para ajustes adicionales o para experimentar con técnicas de cuantización e inferencia en hardware de consumo, aunque el tamaño de 31B limita su viabilidad en GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 31B en GGUF, una cuantización Q4_K_M requiere aproximadamente 19-20 GB de VRAM; Q5_K_M en torno a 22-23 GB; Q8_0 cerca de 33 GB; FP16 aproximadamente 62 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: A100 40GB o 80GB, H100, RTX A6000 (48 GB) para cuantizaciones altas. Una RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 y Q5 con offloading parcial o completo según el nivel.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4/Q5; en GPUs de 16 GB requeriría offloading a CPU y sería lento.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles. No hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Orientacion | Licencia | Formato |
|---|---|---|---|---|---|
| Dark-Craving-31B-v2.0-GGUF | 31B | no disponible | Roleplay adulto, unaligned | Apache 2.0 | GGUF |
| Modelos de rol comunitarios de 30-34B (p. ej. variantes de Yi-34B o Mistral-based) | 30-34B | variable (4K-32K) | Roleplay / narrativa | variable | safetensors, GGUF |
| Modelos alineados de 30B+ (p. ej. familia Llama 3.1 70B, Qwen 2.5 32B) | 32-70B | 32K-128K | Uso general, alineado | licencias comunitarias | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y orientación de uso.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW y no es apto para uso general ni para entornos sin control de edad.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos, toxicidad o equidad.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluación publicada, se desconoce su fiabilidad factual.
- Contexto e idioma: solo se declara inglés y no se especifica la ventana de contexto, lo que impide planificar conversaciones largas con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas sobre material adulto según la jurisdicción; el desarrollador asume la responsabilidad legal.
- Documentación insuficiente: la model card carece de especificaciones técnicas, lo que dificulta evaluar su calidad y reproducibilidad.
- Cero tracción: sin descargas ni validación comunitaria, no hay evidencia externa de su comportamiento real.
- Restricciones de plataforma: muchos servicios de alojamiento (HuggingFace Inference, APIs comerciales) bloquean contenido NSFW, limitando su despliegue a infraestructura propia.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-31B-v2.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-31B-v2.0
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
