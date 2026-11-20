# CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF

## Resumen

Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF es una cuantización en formato GGUF del modelo comunitario CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096, un ajuste fino de la familia Gemma orientado a escritura creativa, roleplay y narrativa. El modelo parte de una base Gemma de aproximadamente 30.700 millones de parámetros (30.697.345.596 según los pesos en safetensors) y ha sido adaptado por el autor CrucibleLab para tareas de generación literaria y conversacional. Esta variante concreta del repositorio es la versión cuantizada y publicada en GGUF, pensada para su ejecución en herramientas de inferencia local como llama.cpp u Ollama.

El interés de esta ficha radica en que combina un modelo de gran tamaño (clase 30B) con un formato de pesos comprimido que facilita el despliegue en hardware de consumo razonablemente equipado, algo poco habitual en modelos de esta escala. La etiqueta `swa-4096` del nombre sugiere el uso de atención de ventana deslizante (sliding window attention) con una ventana de 4096 tokens, si bien esta interpretación no está confirmada explícitamente en la información disponible. El repositorio acumula 1754 descargas y 12 me gusta, lo que indica un uso moderado dentro de la comunidad.

La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque conviene verificar las condiciones de la licencia del modelo base original de Gemma, ya que las licencias de los modelos derivados pueden estar sujetas a restricciones adicionales. La información pública disponible sobre este modelo es limitada: no se detallan idiomas soportados, pipeline ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma); detalles específicos no disponibles |
| Parámetros totales | 30.697.345.596 (≈30,7B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma explícita; la etiqueta `swa-4096` sugiere ventana deslizante de 4096 tokens |
| Tipos de cuantización | GGUF (el repositorio contiene múltiples variantes de cuantización; niveles concretos no disponibles) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 209,7 GB con múltiples ficheros); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma, una arquitectura transformer decoder-only. El nombre del repositorio incluye el sufijo `Swa-4096`, que probablemente hace referencia a sliding window attention con una ventana de 4096 tokens, una técnica que reduce el coste computacional de la atención en contextos largos limitando el alcance de cada token a una ventana local. No obstante, la información proporcionada no confirma esta interpretación ni detalla la configuración exacta de capas, cabezas de atención o dimensiones ocultas.

Respecto al entrenamiento, no se dispone de datos sobre el número de tokens utilizados, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o similares. Las etiquetas del repositorio (`roleplay`, `storywriting`, `creative-writing`) indican que el ajuste fino se orientó a tareas creativas y conversacionales, pero no se documenta la metodología. El repositorio incluye la etiqueta `imatrix`, lo que sugiere que las cuantizaciones se generaron utilizando una matriz de importancia (importance matrix) para preservar mejor la calidad en la compresión. Tampoco se detalla si se emplearon técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo: narrativa, relatos, diálogos y descripciones, según las etiquetas del repositorio.
- Roleplay conversacional: el modelo está ajustado para mantener personajes y conversaciones multi-turno.
- Escritura de historias: etiqueta `storywriting`, orientada a la composición de ficción.
- Conversación general: la etiqueta `conversational` indica uso en diálogo abierto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar borradores de relatos y novelas por capítulos, manteniendo coherencia narrativa gracias a su tamaño de 30B y a la ventana de atención de 4096 tokens (si se confirma la interpretación de `swa-4096`). Es adecuado para autores que necesitan continuaciones coherentes de textos largos.
- Roleplay y juegos de rol por texto: su ajuste específico en `roleplay` permite encarnar personajes con personalidad consistente en conversaciones multi-turno, útil en plataformas de entretenimiento conversacional.
- Generación de diálogos para guiones y videojuegos: el modelo puede producir líneas de diálogo variadas y con tono consistente, integrándose en pipelines de preproducción creativa.
- Asistencia a guionistas y equipos de contenido: generación de sinopsis, descripciones de personajes y tramas alternativas, aprovechando la cuantización GGUF para desplegarlo en estaciones de trabajo locales sin depender de la nube.
- Prototipado de chatbots narrativos: al ser compatible con endpoints, puede servirse detrás de una API y conectarse a interfaces de chat para demos de asistentes con personalidad.
- Experimentación e investigación en ajuste fino creativo: investigadores pueden usar esta cuantización para evaluar el comportamiento de un modelo de 30B ajustado a escritura creativa en entornos con recursos limitados, comparándolo con el modelo base en safetensors.
- Despliegue local en hardware de consumo: la versión GGUF permite ejecutar el modelo en equipos con GPU de gama alta o incluso en CPU con suficiente RAM, facilitando pruebas sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 30,7B parámetros, una cuantización de 4 bits requiere aproximadamente 17-19 GB de VRAM; una de 5 bits, en torno a 21-23 GB; una de 8 bits, alrededor de 32-34 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no proceden de la información proporcionada.
- GPU recomendadas: para cuantizaciones de 4-5 bits, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) pueden ser suficientes; para cuantizaciones de 8 bits o superiores, se recomiendan A100 (40/80 GB), H100 (80 GB) o múltiples GPU consumer.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones de 4-5 bits cabe en GPU con 24 GB de VRAM; en cuantizaciones mayores requiere hardware profesional o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere su uso detrás de APIs. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habría que verificar compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF | ≈30,7B | No disponible (sugerido 4096 por SWA) | Apache 2.0 | GGUF | Ajuste creativo/roleplay, cuantizado |
| Gemma base (familia, 27B-31B) | ≈27-31B | No disponible | Términos de Gemma | Safetensors | Modelo generalista original |
| Modelos creativos de 30B comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; los modelos de escritura creativa ajustados con datos comunitarios pueden reproducir estereotipos presentes en el corpus de ajuste.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; en tareas factuales puede inventar datos, por lo que no es adecuado como fuente de verdad sin verificación.
- Limitaciones de contexto: la ventana efectiva podría estar limitada a 4096 tokens si se confirma la interpretación de `swa-4096`; no se documenta la longitud máxima de contexto.
- Limitaciones de idioma: no se especifican idiomas soportados; el ajuste fino podría estar sesgado hacia el inglés, aunque no hay datos que lo confirmen.
- Restricciones de licencia: aunque se declara Apache 2.0, el modelo deriva de la familia Gemma, cuyos términos de licencia pueden imponer condiciones adicionales al uso comercial; conviene revisar la licencia del modelo base.
- Caveats para producción: la información pública es escasa (sin benchmarks, sin especificaciones de contexto o idiomas), lo que dificulta una evaluación rigurosa previa al despliegue; la naturaleza creativa del ajuste puede reducir su fiabilidad en tareas técnicas o de razonamiento estructurado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF
- Modelo base: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
