# ml-resources/sam-audio-large

## Resumen

SAM-Audio (Segment Anything Model for Audio) es un modelo fundacional desarrollado por Meta para el aislamiento y la separación de sonidos concretos dentro de mezclas de audio complejas. A diferencia de un separador de fuentes clásico limitado a categorías fijas (voz, música, ruido), SAM-Audio acepta instrucciones en lenguaje natural del tipo "un hombre hablando" o "gotas de lluvia cayendo con fuerza", además de indicaciones visuales extraídas de un vídeo y anclas temporales. La ficha que nos ocupa, `ml-resources/sam-audio-large`, es un espejo no oficial del repositorio original `facebook/sam-audio-large`, publicado por un tercero y con la misma licencia (SAM License).

El modelo se apoya en el codificador Perception-Encoder Audio-Visual (PE-AV) de Meta y forma parte del ecosistema de segmentación de la familia SAM, en este caso aplicada al dominio acústico. La información pública disponible no detalla el número de parámetros, la arquitectura interna completa ni la composición del dataset de entrenamiento; el repositorio ocupa 14,9 GB, lo que da una pista del orden de magnitud de los pesos pero no permite confirmar el recuento de parámetros.

Es relevante ahora porque cubre un hueco práctico muy demandado: extraer una fuente sonora arbitraria descrita en lenguaje natural, sin necesidad de entrenar un modelo específico por tipo de sonido. Sus tres modos de prompt (texto, visual y span temporal) lo convierten en una herramienta versátil para postproducción, generación de datasets y limpieza de audio, aunque su uso está condicionado por una licencia restrictiva y por el acceso controlado (gated) a los checkpoints originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de segmentación/separación de audio construido sobre el codificador Perception-Encoder Audio-Visual, PE-AV; detalles internos no especificados en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (no se especifica una ventana de contexto en tokens; el modelo opera sobre segmentos de audio y admite anclas temporales en segundos) |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos en precisión completa o media, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | inglés (`en`) para los prompts de texto |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | no disponible explícitamente; peso del repositorio 14,9 GB, compatible con la librería `sam_audio` y `from_pretrained` (formato tipo safetensors/PyTorch) |

## Arquitectura y entrenamiento

La información proporcionada describe un modelo fundacional de segmentación de audio que combina modalidades: audio, texto e imagen/vídeo. El componente central de percepción es PE-AV (Perception-Encoder Audio-Visual), un codificador audiovisual a gran escala entrenado con aprendizaje de correspondencia multimodal; SAM-Audio y el denominado "Judge model" dependen de él. El modelo no se limita a clasificar sonidos: produce una separación efectiva en dos pistas, `target` (la fuente solicitada) y `residual` (el resto de la mezcla).

Los tres modos de condicionamiento definen su interfaz funcional. El prompting de texto usa descripciones en lenguaje natural; el prompting visual recibe fotogramas de vídeo con máscaras binarias (generadas, por ejemplo, con SAM3) para aislar el sonido asociado a un objeto concreto; el prompting de span utiliza anclas temporales en segundos con signo positivo (el sonido está presente en ese intervalo) o negativo (no lo está). Además, el modelo puede predecir spans automáticamente (`predict_spans=True`) y opcionalmente aplicar un re-ranking de candidatos (`reranking_candidates=8`) que mejora la calidad a costa de mayor latencia. No se han facilitado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

## Capacidades

- Separación de fuentes guiada por texto: aísla sonidos descritos en lenguaje natural ("una persona tosiendo", "un perro ladrando", "motor de coche acelerando").
- Indicación visual: aísla el audio correspondiente a un objeto o persona concreta del vídeo usando máscaras por fotograma, generadas con SAM3.
- Indicación temporal (span prompting): acepta una o varias anclas con signo `+` o `-` y marcas de inicio y fin en segundos, útil para dar al modelo un ejemplo explícito de la fuente objetivo.
- Salida dual: devuelve la pista `target` (fuente aislada) y la pista `residual` (mezcla restante), lo que facilita reconstrucción y control de calidad.
- Predicción automática de spans: puede localizar por sí mismo los intervalos donde aparece la fuente descrita.
- Re-ranking de candidatos: parámetro `reranking_candidates` para mejorar la separación frente a un aumento de latencia.
- Entrada de audio y de vídeo: integración con `torchcodec` para decodificación de vídeo y con la librería `sam_audio` (`SAMAudio`, `SAMAudioProcessor`).
- Capacidad multilingüe: no disponible; los prompts de texto solo están soportados en inglés.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking": no disponible.

## Casos de uso

- Postproducción de cine y vídeo: aislar los diálogos de una mezcla final para rehacer el doblaje o corregir una línea, usando una descripción de texto como "voz masculina hablando" y conservando el `residual` para reconstruir la escena sin diálogo.
- Limpieza de locuciones y podcasts: eliminar ruidos concretos descritos por el usuario ("silla arrastrándose", "notificación de móvil") sin degradar la voz, aprovechando la salida dual para verificar la reconstrucción.
- Generación de datasets para ASR: separar la voz del resto de la mezcla antes de transcribir, reduciendo la tasa de error de los sistemas de reconocimiento en grabaciones ruidosas.
- Bioacústica y monitorización ambiental: aislar cantos de una especie concreta dentro de grabaciones de campo de larga duración, empleando prompts descriptivos y el re-ranking para descartar falsos positivos.
- Análisis forense de audio: extraer un sonido relevante (una alarma, un impacto, una voz) de una grabación compleja, documentando el intervalo temporal con anclas de span para dejar trazabilidad del proceso.
- Música y creación de stems: separar instrumentos concretos descritos en lenguaje natural ("piano tocando una melodía") para remezclas, muestreo o práctica instrumental, sin depender de un catálogo cerrado de instrumentos.
- Edición de vídeo asistida por objeto: aislar el sonido asociado a un objeto o persona seleccionada en pantalla (por ejemplo, "la persona de la izquierda") mediante prompting visual con máscaras de SAM3.
- Localización y doblaje: extraer voces originales para sustituirlas por una pista doblada, manteniendo efectos y ambiente en el canal residual.
- Telefonía y comunicación en tiempo real: supresión selectiva de ruidos concretos en llamadas, condicionada por descripciones textuales del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio y la model card consultados no incluyen tablas de métricas (SDR, SI-SNR, MMLU u otras), ni comparaciones cuantitativas con modelos alternativos. La referencia arXiv asociada al repositorio es `arxiv:2512.18099`; el paper de SAM-Audio está enlazado desde la model card, pero sus cifras no forman parte de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repositorio (14,9 GB), unos pesos en bf16/fp16 implicarían del orden de 7,5 mil millones de parámetros y una VRAM de aproximadamente 16-18 GB solo para los pesos, más el espacio de activaciones del codificador PE-AV y del procesado de audio/vídeo. Si los pesos estuvieran en fp32, el recuento sería aproximadamente la mitad y la VRAM necesaria en torno a 60 GB. Estas cifras son estimaciones derivadas del tamaño del repositorio, no datos confirmados por el autor.
- GPU recomendadas: no especificadas. Por el orden de magnitud estimado, serían razonables GPUs de clase profesional (A100 40/80 GB, H100, L40S) y, con margen ajustado, tarjetas de consumo de gama alta (RTX 4090 con 24 GB, RTX 3090 con 24 GB).
- Compatibilidad con GPU de consumo: no confirmada. Requiere al menos autenticación previa y acceso a los checkpoints, y el repositorio no documenta variantes cuantizadas que reduzcan el consumo.
- Opciones de despliegue: la model card solo documenta uso directo mediante `transformers`/librería `sam_audio` en PyTorch con `from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y por el tipo de tarea (separación de audio, no generación de texto) no serían el marco habitual.
- Latencia y throughput: no disponibles. El único dato relacionado es cualitativo: activar el re-ranking de candidatos (`reranking_candidates=8`) mejora el resultado a costa de mayor latencia.

## Comparativa con modelos similares

No se dispone de datos cuantitativos en la información proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría (separación de fuentes guiada por texto o por indicaciones multimodales). Por tanto, la comparativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam-audio-large (ml-resources) | no disponible | no disponible | no disponible | SAM License | espejo no oficial en HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo no oficial: `ml-resources/sam-audio-large` replica `facebook/sam-audio-large`; no cuenta con el respaldo de Meta y las actualizaciones pueden no sincronizarse con el repositorio original.
- Acceso controlado: el repositorio original exige solicitar acceso a los checkpoints y autenticarse con `huggingface-cli login`, por lo que no basta con descargar los pesos libremente.
- Licencia restrictiva: se trata de la SAM License (`license: other`). Es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial; las condiciones no equivalen a una licencia permisiva tipo Apache 2.0 o MIT.
- Cobertura de idiomas limitada: los prompts de texto solo están soportados en inglés, lo que restringe su uso en flujos de trabajo en castellano.
- Riesgo de separación incorrecta: el modelo selecciona la fuente en función del prompt; descripciones ambiguas o poco específicas pueden aislar un sonido distinto del esperado. La documentación no cuantifica la tasa de error.
- Artefactos en la salida: la pista `target` y, sobre todo, el `residual` pueden presentar restos de la fuente eliminada o coloraciones espectrales; conviene validación auditiva en producción.
- Dependencia de componentes externos: el prompting visual requiere SAM3 para generar las máscaras y `torchcodec` para decodificar vídeo, lo que añade dependencias y complejidad al despliegue.
- Cifras de rendimiento ausentes: no hay métricas publicadas en la información disponible, lo que impide dimensionar el coste/beneficio frente a alternativas.
- Metadatos poco fiables como señal: el repositorio registra 0 descargas y 0 "likes", y las fechas de creación y actualización son idénticas (15 de octubre de 2026), lo que sugiere una publicación reciente sin validación comunitaria.
- Restricciones adicionales de la licencia sobre redistribución de pesos, uso comercial o entrenamiento de modelos derivados: deben verificarse directamente en el texto de la SAM License, no disponible en la información facilitada.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sam-audio-large
- Repositorio original de Meta: https://huggingface.co/facebook/sam-audio-large
- Blog oficial de SAM-Audio: https://ai.meta.com/blog/sam-audio/
- Paper de SAM-Audio: https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Demo interactiva: https://aidemos.meta.com/segment-anything/editor/segment-audio
- Codificador Perception-Encoder Audio-Visual (PE-AV): https://huggingface.co/facebook/pe-av-large
- Paper de PE-AV: https://ai.meta.com/research/publications/pushing-the-frontier-of-audiovisual-perception-with-large-scale-multimodal-correspondence-learning/
- Referencia arXiv del repositorio: arxiv:2512.18099
- Repositorio de SAM3 (necesario para el prompting visual): https://github.com/facebookresearch/sam3
- Fichero de licencia del repositorio: LICENSE (incluido en el propio repositorio de HuggingFace)
