# JiahuiSheng/FlashRelight

## Resumen

FlashRelight es un modelo de relighting de vídeo de retrato desarrollado por JiahuiSheng, presentado en el artículo "FlashRelight: Portrait Video Relighting with Dynamic Lighting" (NeurIPS 2026). El modelo resuelve el problema de sustituir la iluminación original de un vídeo de retrato por una nueva iluminación, ya sea procedente de un mapa de entorno HDR, de un vídeo de referencia o descrita mediante texto. Se distribuye como un pipeline de dos etapas: FlashDelight, que suprime la iluminación original, y FlashRelight, que sintetiza la nueva iluminación sobre el clip "delighted".

Técnicamente es un fine-tune del modelo de generación de vídeo Wan-AI/Wan2.1-T2V-1.3B, del que hereda la configuración, el VAE, el codificador de texto y el tokenizador. Procesa clips de 49 fotogramas a una resolución de 480 × 832 píxeles y se distribuye como checkpoints de inferencia en formato PyTorch (`.pt`), no como pesos en safetensors ni GGUF.

Su relevancia radica en que aborda una tarea de posproducción de vídeo (relighting de retratos) mediante modelos generativos de difusión vídeo-a-vídeo, con control multimodal (HDR, vídeo de referencia y texto). El repositorio tiene 14 GB y, en el momento de la consulta, no registra descargas ni "likes", por lo que se trata de un lanzamiento de investigación reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión vídeo-a-vídeo basado en Wan2.1-T2V-1.3B (transformer de difusión para generación de vídeo) |
| Parámetros totales | no disponible (el modelo base Wan2.1-T2V-1.3B declara 1.3B; los checkpoints publicados pesan 6,93 GB y 7,04 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de 49 fotogramas) |
| Tipos de cuantización | no disponible (checkpoints en precisión completa `.pt`) |
| Idiomas soportados | no disponibles (el control por texto depende del codificador de texto de Wan2.1) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); requiere los ficheros de configuración, VAE, codificador de texto y tokenizador de Wan2.1 |
| Resolución de inferencia | 480 × 832 píxeles |
| Longitud de clip | 49 fotogramas |

## Arquitectura y entrenamiento

FlashRelight se construye sobre Wan2.1-T2V-1.3B, un modelo de difusión para generación de vídeo texto-a-vídeo, y se reentrena como modelo vídeo-a-vídeo para la tarea de relighting. El pipeline consta de dos etapas encadenadas: `flashdelight_rank0_full.pt` (6,93 GB), que suprime la iluminación original del retrato, y `flashrelight_rank0_full.pt` (7,04 GB), que sintetiza la nueva iluminación a partir del clip delighted. FlashDelight puede usarse de forma independiente para la tarea de delighting.

El control de la iluminación es multimodal: el modelo acepta un mapa de entorno HDR, un vídeo de referencia o una descripción textual. Según la model card, el control por texto funciona mejor con descripciones de iluminación similares a las empleadas en los pies de foto de entrenamiento. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el desacoplamiento en dos etapas (eliminación de la iluminación original y síntesis de la nueva), que permite un control dinámico de la iluminación sobre vídeo de retrato.

## Capacidades

- Relighting de vídeo de retrato con iluminación dinámica.
- Supresión de la iluminación original (delighting) como etapa independiente mediante FlashDelight.
- Control de la iluminación mediante mapa de entorno HDR.
- Control de la iluminación mediante vídeo de referencia.
- Control de la iluminación mediante descripción textual.
- Procesamiento de vídeo a 480 × 832 píxeles en clips de 49 fotogramas.
- Integración con el ecosistema Wan2.1 (VAE, codificador de texto y tokenizador compartidos).
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Posproducción de vídeo de retrato: sustituir la iluminación de un clip grabado por una iluminación coherente con una escena o un entorno HDR, sin regrabar. Adecuado por su etapa de delighting previa que elimina la iluminación original.
- Previsualización de iluminación en rodaje virtual: generar variantes de iluminación de un mismo plano de retrato a partir de mapas HDR para comparar opciones antes del render final.
- Efectos visuales y composición: integrar un retrato rodado en estudio dentro de un entorno con iluminación distinta, usando el vídeo de referencia del entorno como guía.
- Publicidad y contenido para redes: adaptar la iluminación de un clip de presentador a distintas atmósferas (día, noche, interior) mediante descripciones de texto.
- Prototipado rápido en investigación de relighting: usar los checkpoints como referencia reproducible para comparar métodos de relighting de vídeo, dado que el artículo se presenta en NeurIPS 2026.
- Edición asistida de vídeo conversacional: normalizar o cambiar la iluminación de clips de entrevista o videollamada para uniformizar el aspecto entre tomas.
- Docencia y demostraciones: ilustrar el efecto de distintas fuentes de luz sobre un retrato en clips cortos de 49 fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los checkpoints suman unos 14 GB en precisión completa, por lo que se requiere una GPU con memoria suficiente para cargar el modelo base Wan2.1-T2V-1.3B más los checkpoints de cada etapa; no se especifica el pico de memoria durante la difusión de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base (1.3B) y el procesamiento de vídeo, se requiere una GPU con memoria dedicada considerable; no se confirma compatibilidad con GPU de consumo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el repositorio de código oficial (github.com/vivoCameraResearch/FlashRelight) con PyTorch; requiere descargar además los ficheros de Wan2.1 (configuración, VAE, codificador de texto y tokenizador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución / clip | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FlashRelight | Difusión vídeo-a-vídeo (fine-tune de Wan2.1-T2V-1.3B) | 1.3B (base) | 480 × 832, 49 fotogramas | HDR, vídeo de referencia, texto | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B | Difusión texto-a-vídeo | 1.3B | no disponible en esta ficha | texto | no disponible en esta ficha | Hugging Face |
| Otros modelos de relighting de retrato | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos de relighting comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es necesario consultar el repositorio de código y el modelo base Wan2.1 antes de usarlo en producción.
- Idiomas no declarados: el control por texto depende del codificador de texto de Wan2.1 y no se documenta el soporte multilingüe.
- El control por texto funciona mejor con descripciones de iluminación similares a las de los pies de foto de entrenamiento; descripciones fuera de distribución pueden degradar el resultado.
- Resolución y duración fijas: 480 × 832 píxeles y 49 fotogramas por clip; no se documenta soporte para otras resoluciones o longitudes.
- Requiere el pipeline de dos etapas para relighting; usar solo FlashRelight sin FlashDelight no produce el resultado esperado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez.
- Repositorio con 0 descargas y 0 "likes": ecosistema y soporte comunitario aún inexistentes.
- Es un modelo de investigación (NeurIPS 2026); no se documenta madurez para producción.

## Enlaces

- Hugging Face: https://huggingface.co/JiahuiSheng/FlashRelight
- Artículo (arXiv): https://arxiv.org/abs/2611.06355
- Código: https://github.com/vivoCameraResearch/FlashRelight
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
