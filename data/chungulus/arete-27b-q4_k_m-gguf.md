# Chungulus/Arete-27B-Q4_K_M-GGUF

## Resumen

Arete-27B-Q4_K_M-GGUF es una cuantización en formato GGUF del checkpoint BF16 original de NousResearch/Arete-27B, un ajuste fino supervisado (SFT) de Nous Research sobre Qwen3.8-27B. La cuantización la publica el usuario independiente Chungulus, no Nous Research ni Alibaba/Qwen, y está pensada para su uso con llama.cpp y runtimes compatibles con GGUF. El modelo resuelve el problema de ejecutar un modelo multimodal de ~27B parámetros en hardware de consumo o en entornos con VRAM limitada, manteniendo el proyector visual en precisión completa (BF16).

La arquitectura subyacente es un transformer denso de la familia Qwen3.5/Qwen3.8, con 26.895.998.464 parámetros en el fichero de texto principal y 27.356.728.560 parámetros totales en el checkpoint original incluyendo el codificador visual. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto. El contexto de entrenamiento y la ventana máxima no se detallan en la información disponible más allá de los 8192 tokens usados en las pruebas de validación.

La relevancia de esta ficha radica en que permite evaluar rápidamente una cuantización Q4_K_M de un modelo multimodal reciente, con validación funcional documentada por el autor (aritmética, JSON, pruebas factuales y comprensión de imagen), pero sin benchmarks publicados ni evaluación de alineamiento, tool use o calidad a contexto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5/Qwen3.8, con codificador visual (mmproj) |
| Parametros totales | 26.895.998.464 en el GGUF de texto; 27.356.728.560 en el checkpoint original con vision encoder |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como especificación oficial; las pruebas de validación usan 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el autor indica que cada formato se cuantizó de forma independiente desde el BF16 original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto) y mmproj-Arete-27B-BF16.gguf para el proyector visual |
| Tamano del repo | 17.5 GB |
| Modelo base | NousResearch/Arete-27B |
| Runtime probado | llama.cpp, commit 6414d5b0c9e5895473036c90c2bd305ce4ceccc4, en Apple Silicon |
| MTP / decodificacion especulativa | deshabilitado y ausente en la fuente |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen3.8-27B sobre el que Nous Research aplicó un ajuste fino supervisado (SFT) para producir Arete-27B. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card del cuantizador solo indica que Arete es un SFT de Qwen3.8-27B y remite al checkpoint original de Nous Research para los detalles de entrenamiento. El checkpoint incluye un codificador visual que permite el pipeline image-text-to-text.

La innovación técnica relevante en este repositorio es el proceso de cuantización: cada formato se cuantizó de forma independiente desde la exportación BF16 original, sin recuantizar checkpoints de baja precisión y sin dataset de calibración ni importance matrix. Los 18 shards originales se verificaron con SHA256 antes de la conversión y los headers de tensores confirmaron el recuento completo de parámetros. El proyector visual se conserva en BF16 (mmproj-Arete-27B-BF16.gguf). MTP (multi-token prediction) está deshabilitado y ausente en la fuente, por lo que no se exporta ni se sintetiza; el autor recomienda desactivar MTP o la predicción especulativa en los frontends que intenten habilitarlo.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja`) en llama.cpp.
- Comprensión de imagen y texto (image-text-to-text) mediante el proyector visual BF16 incluido en el repositorio.
- Razonamiento aritmético y factual básico, validado por el autor con pruebas nativas de runtime.
- Generación de JSON estructurado, validada en las pruebas del autor.
- Modo thinking: el autor indica que las pruebas se realizaron con thinking deshabilitado, lo que implica que el modelo base soporta un modo de razonamiento extenso, aunque no se detalla su comportamiento en esta cuantización.
- Soporte de tool calling / function calling: no evaluado en esta cuantización según la model card.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no disponibles como especificación; no se documentan idiomas soportados.
- Vídeo: no evaluado.

## Casos de uso

- Asistente conversacional local con imágenes: el modelo puede recibir una imagen y una pregunta en texto y responder sobre el contenido visual, usando `llama-mtmd-cli` con el mmproj BF16 y 1024 tokens de imagen. Es adecuado para prototipos de escritorio o portátiles con GPU de consumo gracias al tamaño Q4_K_M de 17.5 GB.
- Descripción y análisis de capturas o documentos escaneados: el pipeline image-text-to-text permite extraer descripciones de objetos centrales, colores y disposición espacial, tal como validó el autor con fixtures de imagen rojo/azul.
- Generación de JSON para pipelines de datos: las pruebas de validación confirman salida JSON correcta con temperatura 0, lo que lo hace utilizable en extracción de campos estructurados a partir de texto o imagen.
- Chat multi-turno con contexto moderado: con 8192 tokens de contexto probados, sirve para conversaciones de soporte técnico o tutoría donde el historial y el documento de referencia caben en esa ventana.
- Evaluación comparativa de cuantizaciones: al ser una cuantización independiente con manifiesto y validación publicados, es útil para comparar Q4_K_M frente a otras cuantizaciones del mismo checkpoint base en tareas de aritmética, JSON y visión.
- Despliegue en Apple Silicon: el runtime probado es llama.cpp en Apple Silicon con `-ngl 99`, por lo que encaja en flujos de trabajo de desarrollo en macOS con aceleración Metal.
- Base para ajuste fino o experimentación con modelos multimodales: al estar en GGUF y con licencia Apache 2.0, puede servir como punto de partida para pruebas de destilación o evaluación, aunque la cuantización no es ideal para reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas funcionales cortas (aritmética, JSON, factuales y comprensión de imagen rojo/azul) con temperatura 0, semilla 42, contexto 8192, máximo 128 tokens generados, thinking deshabilitado y 1024 tokens de imagen. El autor indica explícitamente que no se evaluaron alineamiento político, afirmaciones de evaluación del creador, precisión en benchmarks, tool use, vídeo ni calidad a contexto completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17.5 GB; con overhead de contexto y del proyector visual BF16, se recomienda al menos 20-24 GB de VRAM para Q4_K_M con contexto de 8192.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, encaja en RTX 3090/4090 (24 GB), A100 40 GB, H100 y Apple Silicon con memoria unificada de 32 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) y en Mac con memoria unificada suficiente; en GPUs de 16 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (runtime probado, commit 6414d5b0c9e5895473036c90c2bd305ce4ceccc4), `llama-completion` y `llama-mtmd-cli` para visión; otros runtimes GGUF no se documentan como probados.
- Latencia y throughput: no disponibles; el autor solo reporta que las pruebas se ejecutaron en Apple Silicon sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chungulus/Arete-27B-Q4_K_M-GGUF | 26.895.998.464 (texto) | no disponible (pruebas a 8192) | GGUF Q4_K_M | Apache 2.0 | Cuantización independiente con validación funcional y mmproj BF16 |
| NousResearch/Arete-27B | 27.356.728.560 (con vision) | no disponible | BF16 (safetensors/GGUF original) | Apache 2.0 | Checkpoint original de Nous Research, referencia de calidad |
| UraionLabs/Arete-27B-GGUF | ~27B | no disponible | GGUF | no disponible | Otra cuantización GGUF del mismo modelo base |
| bartowski/NousResearch_Arete-27B-GGUF | ~27B | no disponible | GGUF (Q4_K_M entre otros) | no disponible | Cuantización de referencia de bartowski; Q4_K_M mayormente Q4_K con precisión extra en pesos sensibles |

## Limitaciones y advertencias

- No se han evaluado sesgos políticos, de valores ni de alineamiento en esta cuantización; el autor lo declara explícitamente fuera del alcance de la validación.
- Riesgo de alucinación: no medido; las pruebas funcionales son cortas (máximo 128 tokens generados) y no cubren respuestas largas o factuales complejas.
- La calidad respecto al BF16 original no está garantizada: el autor no afirma que la calidad del modelo se mantenga intacta tras la cuantización.
- Tool calling, uso como agente, razonamiento multi-paso, vídeo y calidad a contexto completo no fueron evaluados.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto oficial no disponible; las pruebas usan 8192 tokens y no se valida el comportamiento más allá de esa ventana.
- Requiere un runtime llama.cpp reciente compatible con Qwen3.5/Qwen3.8; versiones antiguas pueden fallar.
- MTP y decodificación especulativa deben desactivarse en los frontends que intenten habilitarlos, ya que están ausentes en la fuente.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de atribución a Nous Research y Alibaba/Qwen; la exportación GGUF y la cuantización Q4_K_M son modificaciones de Chungulus.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de comunidad ni de mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Arete-27B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint BF16 original referenciado: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Cuantización alternativa UraionLabs: https://huggingface.co/UraionLabs/Arete-27B-GGUF
- Cuantización alternativa bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
