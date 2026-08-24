# mradermacher/Melody1437-35B-A3B-GGUF

## Resumen

Melody1437-35B-A3B-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Melody1437-35B-A3B, realizada por mradermacher, un conocido cuantizador de la comunidad open source. El modelo base está diseñado para tareas de roleplay, conversación y seguimiento de instrucciones, con un enfoque en contenido adulto explícito y sin alineación (unaligned). Según las etiquetas, se basa en la arquitectura Qwen3.6, aunque no hay documentación oficial que confirme los detalles exactos de dicha arquitectura.

El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos, una configuración común en modelos recientes para equilibrar calidad y eficiencia. El repositorio incluye archivos de proyección multimodal (mmproj), lo que indica capacidades de visión además de texto. La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el contenido generado puede ser explícito y no apto para todos los públicos.

Esta cuantización es relevante para desarrolladores que necesitan ejecutar el modelo en hardware local o en entornos con recursos limitados, ya que ofrece varios niveles de compresión (desde Q2_K hasta Q8_0) que permiten ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (MoE, según nomenclatura del nombre) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B (estimado por el sufijo A3B, no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El nombre "35B-A3B" y la etiqueta "qwen3.6" sugieren un modelo de mezcla de expertos (MoE) con 35,5 mil millones de parámetros totales y unos 3 mil millones activos por token, siguiendo el patrón de modelos como Qwen3-30B-A3B. El modelo base ReadyArt/Melody1437-35B-A3B no publica detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el método de alineación (si lo hubo). Dado que se describe como "unaligned", es probable que no se aplicaran técnicas de refuerzo con feedback humano (RLHF) o que se eliminaran deliberadamente las capas de rechazo de contenido.

La presencia de archivos mmproj (proyección multimodal) indica que el modelo puede procesar entradas de imagen, aunque no se especifica el codificador visual utilizado. La cuantización realizada por mradermacher es estática, sin usar matrices de importancia (imatrix), según se indica en la model card.

## Capacidades

- Generación de texto conversacional y de roleplay con estilo libre y sin restricciones de contenido.
- Seguimiento de instrucciones (instruct) para tareas de chat y diálogo multi-turno.
- Procesamiento multimodal: admite entrada de imágenes gracias a los archivos mmproj, aunque no se detalla el alcance de la comprensión visual.
- Contenido explícito y adulto: el modelo está diseñado para generar texto NSFW, incluyendo roleplay erótico (ERP), sin filtros de seguridad.
- Multilingüe: solo se declara soporte para inglés, aunque podría funcionar parcialmente en otros idiomas sin garantía.
- No se menciona soporte explícito para tool calling, function calling o razonamiento multi-paso, aunque al estar basado en Qwen3.6 podría heredar algunas capacidades, pero no está confirmado.

## Casos de uso

- Escritura creativa de ficción: el modelo puede generar narrativas largas, diálogos y descripciones para novelas, relatos o guiones, aprovechando su capacidad de mantener contexto conversacional.
- Juegos de rol en línea: adecuado para simular personajes no jugadores (NPC) en juegos de texto o plataformas de roleplay, con respuestas inmersivas y sin censura.
- Chatbots de entretenimiento para adultos: puede integrarse en aplicaciones de chat con temática madura, siempre que se cumplan las políticas de la plataforma y la legislación aplicable.
- Asistente de escritura para guiones de cine o teatro: su estilo conversacional y descriptivo facilita la generación de diálogos realistas y escenas complejas.
- Generación de contenido para mundos virtuales: útil para crear historias, misiones o descripciones de entornos en videojuegos o experiencias de realidad virtual.
- Prototipado de agentes conversacionales sin restricciones: investigadores pueden usarlo para estudiar comportamientos de modelos no alineados en entornos controlados, siempre con las debidas salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: según el cuantizado elegido, se necesita al menos el tamaño del archivo más overhead de contexto y activaciones. Por ejemplo, Q4_K_S (20,5 GB) requiere unos 24 GB de VRAM; Q6_K (29,3 GB) requiere unos 32 GB; Q8_0 (37,9 GB) requiere unos 40 GB.
- GPU recomendadas: para Q4_K_S, una RTX 3090/4090 (24 GB) o A5000; para Q6_K, una A6000 (48 GB) o A100 (40/80 GB); para Q8_0, una A100 80 GB o H100.
- En consumer GPU: el cuantizado Q2_K (13,3 GB) podría caber en una RTX 4080 (16 GB) o RTX 4090, aunque con calidad reducida. Q4_K_S es el mínimo recomendado para calidad aceptable.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. También puede usarse con vLLM si se convierte a formato safetensors, aunque no se proporciona.
- Latencia y throughput: no hay datos publicados. En una RTX 4090 con Q4_K_S, se puede esperar una velocidad de generación de 20-40 tokens/s, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (roleplay sin censura, ~35B MoE). Alternativas conocidas en el espacio de modelos sin alinear incluyen:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Melody1437-35B-A3B (este) | 35,5B totales, ~3B activos | no disponible | Apache 2.0 | Roleplay, NSFW, multimodal |
| Mistral 7B (abliterado) | 7B denso | 32K | Apache 2.0 | Más pequeño, menos capaz |
| Llama 3.1 8B (abliterado) | 8B denso | 128K | Llama 3.1 | Contexto largo, pero menor calidad de roleplay |

No hay datos de benchmarks que permitan comparar rendimiento real. La elección dependerá de los requisitos de VRAM y calidad deseada.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera texto NSFW y erótico sin filtros. No es apto para menores ni para entornos profesionales sin control de acceso.
- Sin alineación: al ser "unaligned", puede producir respuestas ofensivas, sesgadas o dañinas. No debe usarse en aplicaciones públicas sin moderación humana.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos, nombres o detalles, especialmente en contextos largos.
- Idioma limitado: solo se garantiza inglés; otros idiomas pueden producir resultados degradados.
- Contexto desconocido: no se especifica la longitud máxima de contexto, lo que dificulta planificar tareas que requieran ventanas largas.
- Cuantización estática: los quants no usan imatrix, por lo que la calidad puede ser inferior a versiones con imatrix en tamaños similares.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre material adulto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Melody1437-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
