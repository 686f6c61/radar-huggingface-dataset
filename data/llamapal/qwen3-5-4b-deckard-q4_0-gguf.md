# LlamaPal/Qwen3.5-4B-Deckard-Q4_0-GGUF

## Resumen

Qwen3.5-4B-Deckard es un modelo de lenguaje de tipo transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) publicado por el autor comunitario DavidAU bajo el nombre "Deckard". La variante aquí documentada es un espejo estático en formato GGUF cuantizado en Q4_0, alojado por el usuario LlamaPal en Hugging Face. El repositorio no contiene el modelo original en safetensors, sino un único fichero de 2,5 GB derivado de una cuantización i1-Q4_0 de mradermacher, que a su vez parte del modelo base.

El modelo se presenta como una variante "HERETIC-UNCENSORED-Thinking", es decir, una modificación comunitaria del Qwen3.5 4B orientada a eliminar restricciones de alineamiento y a exponer un modo de razonamiento explícito ("thinking"). Esto lo sitúa en la categoría de modelos pequeños con capacidad de cadena de pensamiento, pensados para ejecución local en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF.

Su relevancia es limitada pero concreta: ofrece un checkpoint de 4B con cuantización Q4_0 lista para descargar, con licencia Apache 2.0 declarada y con un hash SHA-256 verificable. No obstante, se trata de un espejo sin model card técnica propia, sin datos de entrenamiento publicados en este repositorio y sin resultados de benchmarks disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5 4B); detalles no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (unico fichero publicado en este repo); el origen i1-GGUF puede contener otras, no confirmado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-4B-Deckard-Q4_0.gguf`, 2,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 4,2 mil millones de parámetros, heredado de la familia Qwen3.5 4B de Alibaba. El repositorio no documenta la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card del espejo se limita a indicar que el fichero es una copia byte a byte de `Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking.i1-Q4_0.gguf` del repositorio de mradermacher, en el commit `e9cf7790364f`, con el mismo hash SHA-256 (`c674087647ecfae2e5b24844e55e10dfafc315cb1b58fba281def0042e71b624`).

La etiqueta "Thinking" sugiere la presencia de un modo de razonamiento extendido, habitual en la serie Qwen3, pero no se aporta ninguna especificación sobre cómo se activa, cuántos tokens de pensamiento genera ni qué mecanismo de entrenamiento se empleó. La etiqueta "HERETIC-UNCENSORED" indica una modificación de alineamiento orientada a reducir rechazos, sin que se detallen las técnicas aplicadas (abliteration, fine-tuning con datasets sin filtro, etc.). Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo multi-turno.
- Razonamiento explícito: la denominación "Thinking" apunta a un modo de cadena de pensamiento, aunque su funcionamiento no está documentado en este repositorio.
- Generación de código y matemáticas: capacidad esperable por herencia de la familia Qwen3.5, no verificada con benchmarks en la información disponible.
- Multilingüismo: no disponible; el repositorio no declara idiomas soportados.
- Tool calling / function calling: no disponible; no se confirma soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Visión o audio: no disponible; no se declara soporte multimodal.
- Ejecución local: compatible con el ecosistema GGUF (llama.cpp y derivados), lo que permite inferencia en CPU y GPU de consumo.

## Casos de uso

- Experimentación local con modelos de razonamiento: el fichero Q4_0 de 2,5 GB permite probar un modelo de 4B con modo "thinking" en un portátil con 8-16 GB de RAM, sin necesidad de GPU dedicada, usando llama.cpp.
- Prototipado de asistentes conversacionales: el tag `conversational` y el tamaño reducido lo hacen adecuado para iterar rápidamente en chatbots de propósito general antes de escalar a modelos mayores.
- Evaluación de alineamiento y seguridad: al tratarse de una variante "uncensored", resulta útil en investigación sobre robustez de filtros, análisis de sesgos y estudios de comportamiento de modelos sin RLHF restrictivo, siempre en entornos controlados.
- Generación de texto en entornos con recursos limitados: despliegue en dispositivos edge o contenedores pequeños donde un modelo de 7B o superior no cabe, aprovechando la cuantización Q4_0.
- Fine-tuning posterior sobre dominio específico: al ser un checkpoint de 4B con licencia Apache 2.0, puede servir como base para ajuste con LoRA en tareas verticales, aunque requeriría convertir el GGUF a safetensors o partir del modelo original.
- Reproducibilidad y verificación de artefactos: el hash SHA-256 publicado permite auditar la integridad del fichero en pipelines de distribución de modelos, útil para equipos que necesitan trazabilidad de binarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el fichero Q4_0, más overhead de contexto (KV cache); con 8k de contexto en un modelo de 4B, el consumo adicional típico ronda 0,5-1,5 GB según configuración.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por ancho de banda, no por cómputo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer con 4 GB o más; también en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF Q4_0 de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Deckard (este) | 4,2B | No disponible | Apache 2.0 | GGUF Q4_0 | Variante comunitaria "uncensored" con modo thinking |
| Qwen3.5 4B (original) | ~4B | No disponible en esta ficha | Apache 2.0 (habitual en la familia) | Safetensors, GGUF | Modelo base alineado, sin modificaciones comunitarias |
| Llama 3.2 3B Instruct | 3,2B | 128k (según model card oficial) | Llama 3.2 Community License | Safetensors, GGUF | Alternativa de tamaño similar con contexto largo y licencia restrictiva para >700M usuarios |
| Phi-3.5-mini | 3,8B | 128k (según model card oficial) | MIT | Safetensors, GGUF | Buen rendimiento en razonamiento y código para su tamaño |

La comparación de rendimiento con estas alternativas no puede establecerse porque no hay benchmarks publicados en la información disponible para este modelo.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su calidad real frente al Qwen3.5 4B original u otros modelos de tamaño similar.
- Model card incompleta: el repositorio es un espejo sin documentación técnica propia; la información sobre entrenamiento, contexto e idiomas debe consultarse en el repositorio de origen de mradermacher o en el del autor DavidAU.
- Variante "uncensored": la modificación de alineamiento implica mayor probabilidad de generar contenido dañino, sesgado o inexacto; no es adecuada para producción orientada a usuarios finales sin capas adicionales de filtrado.
- Riesgo de alucinación: inherente a modelos de 4B; sin datos de evaluación no puede cuantificarse.
- Sesgos conocidos: no documentados en este repositorio; se heredan los del modelo base y los del proceso de modificación, que no se describe.
- Contexto e idiomas: no declarados; no debe asumirse una ventana larga ni un multilingüismo amplio sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial, pero la cadena de derivación (DavidAU → mradermacher → LlamaPal) conviene verificarse en los repositorios originales por si existen términos adicionales.
- Cuantización Q4_0: pérdida de calidad respecto a FP16, especialmente en tareas de razonamiento matemático y código; para uso exigente se recomienda Q5_K_M o Q6_K del repositorio de origen.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad sobre este espejo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Qwen3.5-4B-Deckard-Q4_0-GGUF
- Repositorio de origen de la cuantización: https://huggingface.co/mradermacher/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Commit exacto del fichero original: https://huggingface.co/mradermacher/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking-i1-GGUF/tree/e9cf7790364f16c3eb914d81d5c3ddc8ded5f046
- Autor del modelo base (DavidAU): no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
