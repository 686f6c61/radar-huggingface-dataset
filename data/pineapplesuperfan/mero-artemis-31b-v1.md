# pineapplesuperfan/Mero-Artemis-31B-v1

## Resumen

Mero-Artemis-31B-v1 es un modelo de lenguaje multimodal de 31.273.088.876 parámetros (aproximadamente 31B) obtenido mediante fusión de pesos (merge) de dos modelos: TheDrummer/Artemis-31B-v1 y zerofata/G4-MeroMero-31B. Lo publica el usuario pineapplesuperfan en HuggingFace y su objetivo declarado es preservar el carácter del merge original de sophosympatheia (Mero-Artemis-31B-v0.3.1) corrigiendo posibles defectos introducidos por el merge en cuantización Q8, aprovechando que TheDrummer publicó los pesos completos en BF16 de la versión v1h.

El modelo se etiqueta como `gemma4` en HuggingFace y se distribuye en formato safetensors con pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. Está orientado a conversación y roleplay, con la etiqueta `not-for-all-audiences`, y solo declara soporte para inglés. La licencia es Apache 2.0.

Es relevante para quienes experimentan con merges de modelos abiertos y buscan un checkpoint de 31B en BF16 con comportamiento de personaje consistente, sin las pérdidas asociadas a merges realizados sobre cuantizaciones de 8 bits. No obstante, se trata de un modelo de nicho, con muy poca tracción (12 descargas, 0 likes en el momento de la ficha) y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `gemma4` en HuggingFace; detalles de capas y atención no disponibles) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; el autor menciona Q8 y Q4 como referencias de merges previos y trabajo futuro |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 según el título de la model card) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `gemma4` y del pipeline `image-text-to-text`, lo que sugiere una familia de modelos Gemma con capacidad de procesar imágenes y texto. No se especifican número de capas, dimensión oculta, mecanismo de atención ni configuración del tokenizador. Tampoco se documenta la longitud de contexto efectiva.

El modelo no se entrena desde cero: es un merge de pesos construido con mergekit a partir de TheDrummer/Artemis-31B-v1 (en su variante v1h con pesos BF16 completos) y zerofata/G4-MeroMero-31B. El autor indica que reutiliza el mismo YAML de configuración del merge original de sophosympatheia (Mero-Artemis-31B-v0.3.1), de modo que la receta de fusión es idéntica y solo cambia la precisión de los pesos de origen. No se aportan datos sobre el corpus de entrenamiento de los modelos base, ni sobre fases de RLHF, DPO o ajuste por preferencias. Tampoco se ha realizado abliteration en esta versión; el autor lo deja como trabajo pendiente.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno y roleplay.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), según el pipeline declarado en HuggingFace.
- Comportamiento de personaje consistente, heredado del merge original de sophosympatheia y ajustable mediante parámetros de muestreo.
- Compatible con endpoints de HuggingFace (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está diseñado explícitamente para mantener un personaje coherente a lo largo de conversaciones, con parámetros de muestreo recomendados (temperatura 1.0, min-p 0.05-0.1, DRY 0.8/1.8) que favorecen respuestas creativas y evitan repeticiones.
- Prototipado de asistentes conversacionales en inglés: al ser un checkpoint BF16 de 31B, sirve como referencia de calidad para evaluar variantes cuantizadas del mismo merge antes de desplegar versiones más ligeras.
- Investigación sobre merges de modelos: permite comparar el efecto de fusionar pesos en BF16 frente a Q8, aislando el impacto de la precisión en el resultado final del merge.
- Experimentación con entradas multimodales: el pipeline image-text-to-text permite probar diálogos que incorporan imágenes como contexto, útil para evaluar la herencia multimodal de los modelos base.
- Generación creativa asistida: escritura de ficción, descripciones de escenas y diálogos con control fino mediante sampler settings (min-p, DRY, adaptive-p).
- Base para abliteration y ajuste posterior: el autor plantea abliterar el modelo en Q4 sobre una RTX 4090 o, preferiblemente, en BF16 completo, por lo que sirve como punto de partida para quien quiera producir una variante sin rechazos.
- Evaluación comparativa de calidad de merge: útil en laboratorios que estudien técnicas de model merging (mergekit) y necesiten un caso con receta reproducible y pesos de origen documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62,6 GB solo para pesos (31,27B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren 70-80 GB o más según longitud de contexto.
- VRAM estimada en cuantización Q8: alrededor de 33-35 GB para pesos, más overhead; viable en una A100 80GB o en dos GPU de 24 GB con reparto.
- VRAM estimada en Q4: alrededor de 17-19 GB para pesos; el propio autor menciona abliterar en Q4 sobre una única RTX 4090 (24 GB), lo que confirma que cabe en GPU de consumo en esa cuantización.
- GPU recomendadas: A100 80GB o H100 80GB para BF16; RTX 4090 (24 GB) para Q4; configuraciones multi-GPU para Q8.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 (RTX 4090, RTX 3090) y potencialmente Q5/Q6 en GPUs de 24-32 GB, con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en BF16/FP8, llama.cpp y Ollama para GGUF (previas conversiones), y endpoints de HuggingFace por la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mero-Artemis-31B-v1 (este) | 31,27B | no disponible | imagen-texto | Apache 2.0 | HuggingFace, 12 descargas |
| TheDrummer/Artemis-31B-v1 | ~31B (no confirmado) | no disponible | texto (modelo base del merge) | no disponible | HuggingFace |
| zerofata/G4-MeroMero-31B | ~31B (no confirmado) | no disponible | no disponible | no disponible | HuggingFace |
| sophosympatheia/Mero-Artemis-31B-v0.3.1 | ~31B (no confirmado) | no disponible | no disponible | no disponible | HuggingFace |
| sh0ck0r/Mero-Artemis-31B-v0.3.1-heretic | ~31B (no confirmado) | no disponible | no disponible | no disponible | HuggingFace |

Los datos de parámetros, contexto y rendimiento de los modelos comparables no están confirmados en la información proporcionada; se indican como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Etiqueta `not-for-all-audiences`: el modelo puede generar contenido para adultos o sensible; no es adecuado para aplicaciones de cara al público sin filtrado adicional.
- No ha pasado por abliteration, por lo que conserva los rechazos y sesgos de alineamiento de los modelos base.
- Riesgo de alucinación inherente a los modelos de 31B sin benchmarks publicados; no hay evaluación objetiva de fidelidad factual.
- Al ser un merge de pesos sin entrenamiento adicional, puede heredar inconsistencias o artefactos de la fusión; el propio autor reconoce que el merge en Q8 de la versión 0.3.1 pudo introducir defectos.
- Tracción muy baja (12 descargas, 0 likes): escasa validación comunitaria y ausencia de informes independientes de calidad.
- Ausencia de datos sobre longitud de contexto, tool calling y cuantizaciones oficiales: dificulta planificar despliegues en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos base (Gemma y derivados) antes de uso comercial, ya que pueden imponer restricciones adicionales.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pineapplesuperfan/Mero-Artemis-31B-v1
- Modelo base TheDrummer/Artemis-31B-v1: https://huggingface.co/TheDrummer/Artemis-31B-v1
- Modelo base zerofata/G4-MeroMero-31B: https://huggingface.co/zerofata/G4-MeroMero-31B
- Merge original de sophosympatheia: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Variante abliterada de referencia: https://huggingface.co/sh0ck0r/Mero-Artemis-31B-v0.3.1-heretic
