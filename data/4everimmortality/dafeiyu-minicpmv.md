# 4everImmortality/dafeiyu-minicpmv

## Resumen

dafeiyu-minicpmv es un ajuste fino (fine-tuning) del modelo multimodal MiniCPM-V-4.7-1B de OpenBMB, publicado por el usuario 4everImmortality bajo el paraguas del proyecto "大肥鱼" (Dafeiyu), vinculado a un estudio de creación de contenido y streaming. El modelo parte de una base de aproximadamente 1.006 millones de parámetros (1B) con arquitectura visión-lenguaje, y se ha adaptado mediante DoRA (una variante de LoRA con descomposición de magnitud y dirección) para tareas de roleplay y "visual grounding" (anclaje visual), según indica la propia model card.

Se trata de un experimento histórico dentro del ecosistema del autor: la model card señala explícitamente que la página corresponde a un modelo antiguo y que la versión operativa actual del estudio es un modelo de 9B en formato GGUF. Por tanto, este repositorio debe interpretarse como un artefacto de investigación y reproducción, no como el modelo de producción vigente.

Su relevancia radica en dos factores: por un lado, demuestra la aplicación de DoRA sobre un modelo visión-lenguaje compacto de 1B, un tamaño que permite despliegue en hardware modesto; por otro, distribuye pesos tanto en safetensors como en GGUF (con cuantización Q4_K_M y un proyector visual F16), lo que facilita su uso en entornos de inferencia local. La licencia Apache 2.0 y el soporte de endpoints compatibles lo hacen accesible para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (base MiniCPM-V-4.7-1B) con adaptación DoRA |
| Parametros totales | 1.006.209.856 (aprox. 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (pesos principales); proyector visual en F16; safetensors sin cuantizar |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre MiniCPM-V-4.7-1B, un modelo de la familia MiniCPM-V de OpenBMB que combina un codificador visual con un modelo de lenguaje para tareas de imagen-texto-a-texto. La adaptación se realizó mediante DoRA (Weight-Decomposed Low-Rank Adaptation), técnica que descompone los pesos en magnitud y dirección para aproximar mejor el comportamiento de un ajuste fino completo con un coste de parámetros reducido. El repositorio incluye los pesos adaptados en safetensors y una versión GGUF Q4_K_M, además de un proyector visual multimodial en F16 (mmproj-4x-f16.gguf) que debe emparejarse con los pesos principales de la misma release para reproducir la inferencia.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card menciona "materiales de entrenamiento" y "condiciones de reproducción" asociadas a cada release (v6 y la release raíz), pero no publica cifras concretas. El enfoque declarado es roleplay y anclaje visual, lo que sugiere un dataset orientado a diálogo conversacional con referencias a imágenes, aunque no se especifica su contenido.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a roleplay y personajes.
- Comprensión de imagen-texto (pipeline image-text-to-text): el modelo recibe imágenes junto con texto y genera respuestas.
- Anclaje visual (visual grounding): capacidad heredada de la base MiniCPM-V para referenciar elementos de la imagen.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de endpoints compatibles (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Roleplay conversacional con personajes: el ajuste DoRA está orientado a mantener personalidad y estilo en diálogos multi-turno, adecuado para chatbots de entretenimiento o demos de personajes.
- Asistentes visuales ligeros: al ser un modelo de 1B con entrada de imagen, puede desplegarse en entornos con recursos limitados para describir o responder preguntas sobre imágenes.
- Prototipado de investigación en adaptación DoRA: sirve como referencia reproducible para estudiar el efecto de DoRA sobre modelos visión-lenguaje compactos, con pesos safetensors y GGUF publicados.
- Inferencia local en hardware de consumo: la cuantización Q4_K_M reduce el peso a un tamaño manejable para GPUs de gama media o CPU, útil para demos offline.
- Evaluación de pipelines multimodales: el par de pesos principales más proyector F16 permite probar cadenas de inferencia imagen-texto en frameworks compatibles con GGUF.
- Reproducción de experimentos históricos: el bundle.json y la carpeta v6 permiten replicar condiciones de release concretas para comparar resultados entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos Q4_K_M de aproximadamente 1B parámetros, el modelo cabe en torno a 1-2 GB de VRAM para los pesos, más el proyector visual F16 y el contexto; se recomienda al menos 4 GB para operar con comodidad.
- GPU recomendadas: RTX 3060/4060 y superiores para uso local; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para lotes grandes.
- Cabe en GPU de consumo: sí, en GPUs con 4-8 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060).
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM/TGI si se dispone de pesos safetensors y soporte del pipeline image-text-to-text; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dafeiyu-minicpmv (este) | ~1B | no disponible | Apache 2.0 | safetensors, GGUF | Ajuste DoRA para roleplay y grounding visual |
| openbmb/MiniCPM-V-4.7-1B (base) | ~1B | no disponible | no disponible en la información | safetensors | Modelo base multimodal de OpenBMB |
| 4everImmortality/dafeiyu-qwen35-9b-gguf | ~9B | no disponible | no disponible en la información | GGUF | Modelo operativo actual del mismo autor, mayor tamaño |

La comparativa con alternativas de terceros de la misma categoría (modelos visión-lenguaje de ~1B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo histórico: la propia model card indica que no es la versión operativa actual del estudio; para producción se remite al modelo de 9B.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos de 1B, especialmente en tareas de razonamiento o descripción visual detallada.
- No se documentan sesgos específicos, pero al ser un ajuste de roleplay puede reproducir estilos y sesgos del dataset de conversación empleado.
- Longitud de contexto no disponible; no se debe asumir una ventana amplia para conversaciones largas.
- La licencia Apache 2.0 permite uso comercial, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre el proyector visual.
- Es imprescindible emparejar los pesos principales con el proyector de la misma release; mezclar versiones puede degradar la calidad de la inferencia.
- No hay benchmarks publicados que permitan validar su calidad frente a la base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-minicpmv
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Modelo operativo actual del autor: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf
- Carpeta de artefactos v6: https://huggingface.co/4everImmortality/dafeiyu-minicpmv/tree/main/v6
