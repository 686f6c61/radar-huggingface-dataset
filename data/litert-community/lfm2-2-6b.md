# litert-community/LFM2-2.6B

## Resumen

LFM2-2.6B es un modelo de lenguaje de 2.569.272.320 parámetros desarrollado por Liquid AI, diseñado específicamente para despliegue en dispositivos (on-device) y entornos edge. Su arquitectura híbrida combina 22 capas convolucionales con 8 capas de atención sobre un total de 30 capas, una elección poco habitual que busca reducir el coste computacional y de memoria frente a los transformers puros, manteniendo capacidad de razonamiento y generación de texto. Liquid AI lo orienta a tareas agénticas, extracción de datos, RAG, escritura creativa y conversaciones multi-turno.

El repositorio que nos ocupa, `litert-community/LFM2-2.6B`, no es el modelo original sino una conversión del modelo base `LiquidAI/LFM2-2.6B` al formato `.litertlm` para el runtime LiteRT-LM de Google, realizada con litert-torch por la comunidad litert-community. Incluye varias recetas de cuantización (int4 e int8, con variantes específicas para GPU y CPU según la versión del runtime) y es relevante ahora porque permite ejecutar un modelo de 2.6B en hardware móvil y portátil (Android, macOS con Apple Silicon) con velocidades de decodificación que en una GPU de Mac M4 Max alcanzan los 219,9 tok/s con la variante int4 para LiteRT-LM 0.20.0.

La relevancia práctica está en la combinación de tamaño contenido (1,53 GB en int4), contexto declarado de 32.768 tokens por Liquid AI (aunque los archivos de este repositorio usan 4096) y soporte de razonamiento híbrido dinámico con trazas entre ``, lo que lo convierte en una opción interesante para prototipos de agentes locales sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas (22 convolucionales + 8 de atención) |
| Parámetros totales | 2.569.272.320 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según Liquid AI; 4096 en los archivos de este repositorio |
| Tipos de cuantización | int4 (blockwise-32 + OCTAV en lineales, int8 en lm_head y embedding) e int8 (dinámica en lineales + embedding int8); variantes con composites GPU |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español (según Liquid AI) |
| Licencia | lfm1.0 (licencia "other", enlazada en el modelo base) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La arquitectura de LFM2-2.6B es híbrida y se aparta del transformer convencional: de sus 30 capas, 22 son convolucionales y solo 8 son de atención. Este diseño busca un equilibrio entre eficiencia en inferencia (menor coste de atención cuadrática) y calidad de modelado del lenguaje. El modelo base fue entrenado por Liquid AI; la información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La innovación destacable documentada es el razonamiento híbrido dinámico: es el único modelo de la familia LFM2 que genera una traza de razonamiento entre `` para prompts complejos o multilingües. La conversión a LiteRT-LM aplica recetas de cuantización específicas (int4 blockwise-32 con OCTAV, int8 dinámica) y exporta variantes con composites GPU para aprovechar aceleración por hardware en el runtime de Google. Los archivos int4 e int8 puntúan dentro de dos ítems del modelo bf16 en GSM8K (n=100) e IFEval-lite (n=120), según la model card.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento dinámico (traza ``) para consultas complejas o multilingües.
- Tareas agénticas y razonamiento multi-paso, según la orientación explícita de Liquid AI.
- Extracción de datos estructurados (fechas, entidades) a partir de texto libre.
- RAG (generación aumentada por recuperación) sobre documentos.
- Escritura creativa y conversaciones multi-turno.
- Multilingüismo en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ejecución on-device en Android (GPU Snapdragon, p. ej. Galaxy S26) y macOS con Apple Silicon (M4 Max).
- No está orientado por Liquid AI a tareas intensivas en conocimiento ni a programación.

## Casos de uso

- Extracción de datos en el dispositivo: procesar correos, notas o formularios localmente para extraer fechas, nombres o importes sin enviar datos a la nube; el modelo está pensado para esta tarea y corre en 1,53 GB en int4.
- Asistentes conversacionales multi-turno embebidos en apps móviles: con 4096 tokens de contexto en estos archivos y decodificación de 31,1 tok/s en GPU Snapdragon Galaxy S26, es viable para diálogos de atención al cliente de alcance limitado.
- RAG local sobre documentación privada: combinar el modelo con un índice vectorial en el propio dispositivo para responder preguntas sobre manuales o políticas internas sin exponer los documentos.
- Agentes de automatización de flujos en edge: usar el modo de razonamiento para descomponer tareas en pasos y ejecutar acciones sencillas en un pipeline local.
- Prototipado rápido en portátiles Apple Silicon: con 219,9 tok/s en M4 Max (int4, LiteRT-LM 0.20.0) se puede iterar sobre prompts y plantillas de chat sin infraestructura GPU dedicada.
- Generación de texto creativo offline: borradores, resúmenes o reescritura en aplicaciones de escritorio sin conexión, aprovechando el soporte multilingüe (incluido español).
- Filtrado y clasificación de contenido en el borde: preprocesar o etiquetar texto antes de enviarlo a un modelo mayor en servidor, reduciendo coste y latencia de red.

## Benchmarks y rendimiento

La model card reporta resultados de precisión y velocidad, aunque de forma parcial:

| Métrica | Resultado |
|---|---|
| GSM8K (n=100) | int8 e int4 dentro de 2 ítems del modelo bf16 (valor absoluto no disponible) |
| IFEval-lite (n=120) | int8 e int4 dentro de 2 ítems del modelo bf16 (valor absoluto no disponible) |
| Decodificación, Galaxy S26 GPU, LiteRT-LM 0.19.1 | 31,1 tok/s (`_v0190`) frente a 26,8 tok/s (`LFM2-2.6B_int4.litertlm`) |
| Decodificación, Mac M4 Max GPU, LiteRT-LM 0.20.0 | 219,9 tok/s (`_v0200`) frente a 174,0 tok/s (`LFM2-2.6B_int4.litertlm`) |
| Tamaño int4 | 1,53 GB (43,8 % menor que int8) |
| Tamaño int8 | 2,72–2,73 GB |

No se han publicado en la información disponible resultados absolutos de MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,53 GB para los archivos int4 y 2,72–2,73 GB para los int8, más overhead del runtime y del contexto.
- GPU recomendadas: GPU integrada de Snapdragon (Galaxy S26) para Android; GPU de Apple Silicon (M4 Max probado) para macOS. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en hardware móvil y en Apple Silicon; no hay datos publicados para GPUs de escritorio NVIDIA.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.17.1 a 0.20.0 documentadas) mediante `uvx --from litert-lm==0.20.0 litert-lm run`; requiere Python 3.10 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 219,9 tok/s en M4 Max GPU (int4, 0.20.0) y 31,1 tok/s en Galaxy S26 GPU (int4 `_v0190`, 0.19.1). El tiempo de prefill de 1024 tokens más 256 tokens decodificados a contexto 2048 se deriva de las tasas de la tabla de rendimiento, pero el valor concreto no está disponible en el extracto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|
| LFM2-2.6B (este repo) | 2,57B | 4096 en estos archivos (32.768 según Liquid AI) | lfm1.0 | `.litertlm`, LiteRT-LM | Híbrido conv/atención, razonamiento dinámico, on-device |
| LiquidAI/LFM2-2.6B (original) | 2,57B | 32.768 | lfm1.0 | safetensors | Modelo base sin cuantizar; referencia de calidad bf16 |
| Alternativas de ~2-3B para edge | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros modelos de 2-3B optimizados para edge) sin inventar datos.

## Limitaciones y advertencias

- No recomendado por Liquid AI para tareas intensivas en conocimiento ni para programación; su uso previsto son tareas agénticas, extracción, RAG y conversación.
- Contexto efectivo de solo 4096 tokens en los archivos de este repositorio, muy por debajo de los 32.768 declarados para el modelo base.
- Riesgo de alucinación inherente a modelos de este tamaño; conviene validar salidas en producción.
- Incompatibilidades de runtime documentadas: en LiteRT-LM 0.19.2 con GPU, los archivos `_v0200` producen texto corrupto sin error ni código de salida distinto de cero; en 0.20.0 la GPU rechaza el archivo `_v0190`. Es imprescindible emparejar archivo y versión del runtime según la tabla de la model card.
- En litert-lm 0.17.1, la versión anterior de `LFM2-2.6B_int8.litertlm` respondió a una pregunta como si no se hubiera formulado.
- El archivo `_v0200` no se ha probado en iOS ni en teléfonos con LiteRT-LM 0.20.0; en Galaxy S26 requirió una build main con LiteRT #11565.
- Licencia lfm1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache/MIT).
- Idiomas: aunque se declaran ocho, no hay datos de evaluación por idioma; el rendimiento en español puede ser inferior al del inglés.
- La información sobre sesgos no está publicada en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2-2.6B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Pull request LiteRT #11565: https://github.com/google-ai-edge/LiteRT/pull/11565
