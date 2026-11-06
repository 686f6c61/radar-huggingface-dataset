# ReadyArt/Dark-Craving-26B-A4B-v0.3-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.3-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Craving-26B-A4B-v0.3, publicado por el usuario ReadyArt en Hugging Face. Se trata de un modelo de generación de texto orientado a roleplay conversacional y contenido para adultos (ERP), con etiquetas explícitas de NSFW, "unaligned" y "mature". El modelo base cuenta con 25.233.142.046 parámetros reales según los safetensors, lo que corresponde a un modelo denso de aproximadamente 25B de parámetros, pese a la nomenclatura "26B-A4B" del nombre.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, sin descargas registradas en el momento de la consulta y con un único "like", lo que sugiere una distribución muy limitada. No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento ni benchmarks. La model card original está dominada por estilos CSS y elementos decorativos, sin contenido técnico sustantivo más allá de los metadatos YAML.

El modelo se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés. El repositorio GGUF ocupa 68,7 GB, lo que indica múltiples niveles de cuantización empaquetados en un mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer; no confirmado en la información proporcionada) |
| Parametros totales | 25.233.142.046 (≈25,2B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere posible MoE con ~4B activos, pero no está confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 68,7 GB); el modelo base se distribuye presumiblemente en safetensors |
| Pipeline | text-generation |
| Etiquetas | nsfw, explicit, roleplay, unaligned, ERP, adult-content, mature, conversational, instruct |
| Repositorio | 68,7 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El nombre "26B-A4B" es compatible con un esquema de mezcla de expertos (MoE) con aproximadamente 26B de parámetros totales y 4B activos, pero el dato de parámetros reales de safetensors (25.233.142.046) no permite confirmar ni descartar esa interpretación. Tampoco se especifica si emplea atención estándar, atención lineal, decodificación especulativa u otras innovaciones.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. Las etiquetas "unaligned" y "roleplay" sugieren un ajuste orientado a conversación sin las restricciones típicas de alineamiento de seguridad, pero se trata de una inferencia a partir de metadatos, no de información técnica confirmada. El modelo base es ReadyArt/Dark-Craving-26B-A4B-v0.3, y esta publicación es una cuantización del mismo.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a roleplay e interpretación de personajes.
- Contenido para adultos (ERP) y temática explícita, según las etiquetas declaradas por el autor.
- Modo instruct/conversational, adecuado para diálogo guiado por prompt.
- Soporte de inglés como único idioma declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes y tono narrativo en diálogos multi-turno, lo que lo hace adecuado para aplicaciones de entretenimiento interactivo y ficción colaborativa.
- Escritura creativa de ficción adulta: puede emplearse como asistente de redacción para narrativa madura, dado su ajuste hacia temáticas explícitas y su formato instruct.
- Simulación de personajes en videojuegos o experiencias narrativas: su naturaleza conversacional permite integrarlo en motores de diálogo de ficción interactiva, siempre que el contexto de uso sea para adultos.
- Generación de diálogos para guiones y novelas: útil en pipelines de preproducción creativa donde se requiere tono consistente y contenido maduro.
- Prototipado de chatbots de nicho: para entornos controlados y con audiencia adulta verificada, aunque la falta de datos de contexto y benchmarks limita la planificación de capacidad.
- Investigación sobre modelos "unaligned": puede servir como objeto de estudio en análisis de comportamiento de modelos sin alineamiento de seguridad, con las cautelas éticas correspondientes.
- Despliegue local con llama.cpp u Ollama: el formato GGUF facilita la inferencia en hardware de consumo, lo que permite experimentación offline sin exposición de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (≈25,2B parámetros), una cuantización de 4 bits requeriría del orden de 13-15 GB de VRAM, y una de 8 bits en torno a 25-27 GB; estos cálculos son estimaciones del tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Para cuantizaciones de 4 bits, una RTX 4090 (24 GB) podría ser suficiente; para cuantizaciones mayores, se requerirían A100 (40/80 GB) o H100.
- GPU de consumo: probablemente viable en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (roleplay/ERP de ~25B) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo está diseñado para material para adultos; no es apto para menores ni para entornos sin verificación de edad.
- Modelo "unaligned": las etiquetas indican ausencia de alineamiento de seguridad convencional, lo que incrementa el riesgo de respuestas inapropiadas, dañinas o fuera de política en producción.
- Riesgo de alucinación: no cuantificado ni documentado; al no haber benchmarks, no puede estimarse su fiabilidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: longitud de ventana desconocida, lo que impide planificar aplicaciones que dependan de contexto largo.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el contenido generado puede estar sujeto a regulaciones sobre material adulto según la jurisdicción.
- Madurez del proyecto: 0 descargas y 1 like en el momento de la consulta; sin comunidad ni soporte documentado.
- Ausencia de documentación técnica: no hay información sobre dataset, sesgos, evaluación ni limitaciones declaradas por el autor más allá de las etiquetas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.3-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.3
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
