# NotCherry/Qwen3.5-0.8B-weight-space-programming-GGUF

## Resumen

Qwen3.5-0.8B Weight-Space Programming (GGUF) es una conversión a formato GGUF del checkpoint RikiyaT/Qwen3.5-0.8B-weight-space-programming, publicada por el usuario NotCherry. No se trata de un modelo nuevo ni de pesos modificados: es una cuantización Q4_K_M generada con llama.cpp a partir de los safetensors originales, acompañada de un proyector de visión en F16 para preservar la entrada de imagen del modelo base. El repositorio ocupa 0,7 GB y contiene 772.845.888 parámetros totales según los datos de safetensors del modelo origen.

El modelo pertenece a la familia Qwen3.5 en su variante más pequeña (0,8B) y está especializado, según su nombre, en "weight-space programming", una técnica de adaptación que opera sobre el espacio de pesos en lugar de sobre prompts o adaptadores convencionales. Mantiene la modalidad image-text-to-text heredada del checkpoint original, por lo que acepta tanto texto como imágenes como entrada.

Su relevancia práctica es doble: por un lado, ofrece una vía de despliegue local muy ligera (menos de 1 GB en Q4_K_M) para un modelo multimodal de la familia Qwen3.5; por otro, al ser una mera conversión de formato, cualquier limitación o capacidad debe atribuirse al checkpoint original, cuya model card no se incluye en la información disponible. La licencia Apache-2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5; transformer multimodal image-text-to-text, detalles no especificados) |
| Parametros totales | 772.845.888 (≈0,77B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de texto) y F16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del checkpoint original más allá de su pertenencia a la familia Qwen3.5 y de su pipeline image-text-to-text, lo que implica un codificador visual acoplado a un modelo de lenguaje mediante un proyector multimodal. El repositorio GGUF incluye ese proyector en formato F16 (`mmproj-Qwen3.5-0.8B-Weight-Space-Programming-f16.gguf`), lo que confirma la presencia de una torre de visión separada del tronco de texto.

Respecto al entrenamiento, no se han proporcionado datos sobre volumen de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. El nombre "weight-space programming" sugiere una adaptación en el espacio de pesos, pero no se detalla el método, el número de pasos ni los datos utilizados. La conversión a GGUF se realizó con llama.cpp y la cuantización con `llama-quantize` en Q4_K_M; el autor de la conversión declara explícitamente que no ha realizado evaluación ni reclama calidad adicional para esta versión.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Entrada multimodal de imagen y texto (`image-text-to-text`), con proyector de visión incluido en F16.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en equipos con poca VRAM: al ocupar 0,7 GB en Q4_K_M, el modelo puede ejecutarse en GPUs de gama de entrada o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipos y pruebas de concepto en portátiles.
- Procesamiento de documentos con imágenes: gracias al proyector de visión, puede recibir capturas, diagramas o formularios escaneados junto a instrucciones de texto para tareas de extracción o descripción.
- Asistentes conversacionales embebidos: su tamaño reducido permite desplegarlo en dispositivos con recursos limitados o en contenedores ligeros para chatbots de soporte con baja latencia.
- Filtrado y clasificación de contenido multimodal: puede etiquetar o resumir pares imagen-texto en pipelines de moderación o catalogación.
- Evaluación de técnicas de weight-space programming: sirve como referencia práctica para investigadores que quieran comparar el comportamiento de esta adaptación frente al modelo base sin adaptar.
- Base para fine-tuning o cuantizaciones adicionales: al estar en GGUF y Apache-2.0, puede servir como punto de partida para experimentos de cuantización más agresiva (Q3, Q2) o para conversión a otros formatos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversión indica explícitamente que no realiza evaluación ni reclama calidad para esta versión GGUF, y la model card del checkpoint original no se incluye en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: en torno a 0,7-1 GB para el archivo Q4_K_M; el proyector de visión en F16 añade una cantidad adicional no especificada (habitualmente cientos de MB en modelos de este tamaño).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3050, RTX 4060, GTX 1660 o superiores son suficientes. Para uso en servidor, A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp (con `--mmproj` para entrada de imagen), Ollama (previa importación del GGUF), y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B Weight-Space Programming (GGUF) | 0,77B | no disponible | imagen-texto | Apache-2.0 | GGUF |
| Qwen3.5-0.8B (base, safetensors) | 0,77B | no disponible | imagen-texto | Apache-2.0 (según modelo origen) | safetensors |
| SmolVLM-500M | ~0,5B | no disponible | imagen-texto | Apache-2.0 | safetensors, GGUF |
| Moondream2 | ~1,9B | no disponible | imagen-texto | Apache-2.0 | safetensors |

La comparación se limita a características estructurales; no hay datos de rendimiento publicados para este checkpoint que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Al tratarse de una conversión de formato, no corrige ni mitiga posibles sesgos del checkpoint original; no se documentan sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos de 0,8B, especialmente en tareas de razonamiento o descripción de imágenes complejas; no hay evaluaciones que lo cuantifiquen.
- Contexto e idiomas: se desconocen la ventana de contexto y los idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano o en conversaciones largas.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los safetensors originales; el autor no ha medido el impacto en calidad.
- El proyector de visión en F16 debe cargarse con el flag `--mmproj` de llama.cpp; sin él, el modelo solo procesará texto.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia y condiciones del checkpoint base (RikiyaT/Qwen3.5-0.8B-weight-space-programming) antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NotCherry/Qwen3.5-0.8B-weight-space-programming-GGUF
- Modelo base: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- llama.cpp: https://github.com/ggml-org/llama.cpp
