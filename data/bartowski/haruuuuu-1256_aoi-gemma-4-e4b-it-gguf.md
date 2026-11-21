# bartowski/haruuuuu-1256_aoi-gemma-4-E4B-it-GGUF

## Resumen

`bartowski/haruuuuu-1256_aoi-gemma-4-E4B-it-GGUF` es la versión cuantizada en formato GGUF de `haruuuuu-1256/aoi-gemma-4-E4B-it`, un modelo derivado de la familia Gemma 4 (variante E4B, 8B parámetros en el checkpoint original) afinado mediante QLoRA y DPO para roleplay y personajes en japonés. El autor original del modelo afinado es el usuario haruuuuu-1256; bartowski se encarga únicamente de la cuantización con llama.cpp (release b12600) usando imatrix.

El modelo está etiquetado como `any-to-any`, con soporte declarado de entrada de texto, imagen y audio (este último requiere un fichero mmproj adicional). El pipeline declarado es conversacional y el único idioma listado es el japonés. La licencia es Apache 2.0.

Es relevante ahora porque ofrece una vía práctica de ejecutar localmente un modelo multimodal de 8B parámetros especializado en personajes japoneses, con un abanico amplio de cuantizaciones (desde bf16 de 15,05 GB hasta IQ3_M de 4,24 GB) que permiten desplegarlo en hardware de consumo. El repositorio ocupa 123,1 GB en total por incluir todas las variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles |
| Parámetros totales | 7.518.069.290 (safetensors); el autor declara 8B en el checkpoint fuente |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_0, Q4_K_M, IQ4_NL, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L (lista parcial en la información disponible) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de la familia Gemma 4 en su variante E4B, con aproximadamente 7.500 millones de parámetros en el checkpoint safetensors y 8B declarados por el autor. El pipeline es `any-to-any`, con soporte de entrada de texto, imagen y audio (este último mediante fichero mmproj). No se detalla en la información proporcionada la arquitectura interna (atención, capas, mecanismos multimodales) ni la longitud de contexto.

El proceso de ajuste declarado en las etiquetas incluye QLoRA y DPO sobre el modelo base Gemma 4 E4B, orientado a roleplay y personajes en japonés. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni los detalles del proceso de preferencias. La cuantización la realiza bartowski con llama.cpp b12600, aplicando imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión. No se indica decodificación especulativa (el autor lo marca explícitamente como "no").

## Capacidades

- Generación de texto conversacional orientada a roleplay e interpretación de personajes en japonés.
- Entrada multimodal: texto, imagen y audio (el audio requiere el fichero mmproj correspondiente).
- Soporte de tool calling / function calling, con formato de prompt específico para declaración de herramientas (`<|tool>declaration:...<tool|>`).
- Conversación multi-turno con formato de prompt basado en turnos (`<|turn>system`, `<|turn>user`, `<|turn>model`).
- Capacidad multilingüe limitada al japonés según los metadatos del modelo.
- No se documentan capacidades de razonamiento extendido (thinking mode) ni de agentes multi-paso en la información disponible.

## Casos de uso

- Roleplay y chatbots de personaje en japonés: el modelo está afinado con QLoRA y DPO específicamente para interpretación de personajes, por lo que puede mantener conversaciones multi-turno con consistencia de personalidad usando el formato de turnos documentado.
- Prototipado local de asistentes conversacionales en japonés: con la cuantización Q4_K_M (5,16 GB) se puede ejecutar en una GPU de consumo y validar flujos conversacionales sin depender de APIs externas.
- Integración de tool calling en asistentes japoneses: el formato de prompt incluye declaración de herramientas con parámetros tipados (por ejemplo, `get_stock_price` con `symbol` de tipo STRING), lo que permite conectar el modelo a funciones externas.
- Aplicaciones multimodales de texto e imagen: al aceptar entrada de imagen, puede emplearse en tareas de descripción o diálogo sobre imágenes en contextos de personaje, siempre que se valide la calidad real en japonés.
- Experimentación con audio: mediante el fichero mmproj, el modelo admite entrada de audio, útil para prototipos de interacción por voz en japonés.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio (de bf16 a IQ3_M) que permite medir el impacto de la cuantización en la calidad del roleplay y elegir el equilibrio tamaño/calidad adecuado.
- Despliegue en entornos con recursos limitados: las variantes IQ4_XS (4,77 GB) e IQ3_M (4,24 GB) permiten ejecución en equipos con poca VRAM o incluso CPU, para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - bf16: 15,05 GB.
  - Q8_0: 8,03 GB.
  - Q6_K: 6,45 GB; Q6_K_L: 6,63 GB; Q6_K_S: 6,29 GB.
  - Q5_K_M: 5,98 GB; Q5_K_S: 5,78 GB.
  - Q4_K_M: 5,16 GB; Q4_K_L: 5,33 GB; Q4_K_S: 4,90 GB; IQ4_XS: 4,77 GB; IQ4_NL: 5,16 GB.
  - IQ3_M: 4,24 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4 e IQ4 caben en GPUs de consumo con 6-8 GB de VRAM; las Q6 y Q8 requieren 8-12 GB; bf16 requiere al menos 16 GB.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4/IQ4 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las variantes de mayor precisión). Para el modo multimodal con audio es necesario descargar además el fichero mmproj, cuyo tamaño no se detalla.
- Opciones de despliegue: llama.cpp (versión b12600 o superior, usada para la cuantización), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores compatibles con endpoints). El tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está afinado y etiquetado únicamente para japonés; su rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un modelo de roleplay afinado con DPO, puede presentar sesgos de personaje, respuestas fuera de tono o deriva de personalidad en conversaciones largas.
- Riesgo de alucinación inherente a modelos de 8B, especialmente en tareas factuales y en tool calling con parámetros complejos.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- El soporte de audio requiere un fichero mmproj adicional; sin él, la entrada es solo texto e imagen.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener términos adicionales que conviene revisar antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-21, por lo que no hay evidencia comunitaria de calidad ni validación independiente.
- Las cuantizaciones de baja precisión (IQ3_M, Q3_K_L) pueden degradar notablemente la coherencia del roleplay y el formato de tool calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/haruuuuu-1256_aoi-gemma-4-E4B-it-GGUF
- Modelo base (modelo afinado original): https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/haruuuuu-1256_aoi-gemma-4-E4B-it-GGUF/blob/main/haruuuuu-1256_aoi-gemma-4-E4B-it-Q4_K_M.gguf
