# IrohaStudio/Iroha-TTS

## Resumen

Iroha-TTS-V1 es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por IrohaStudio, orientado a la generación de diálogo expresivo para personajes. Se trata de un ajuste fino (finetune) del modelo Fish Audio S2-Pro, sobre el que se añaden capas de control emocional mediante etiquetas en el texto de entrada y coeficientes de intensidad continuos. El modelo está pensado para doblaje de personajes, audio de videojuegos y contenido narrativo donde la expresividad emocional es tan importante como la inteligencia del habla.

La propuesta diferencial no es solo la calidad de síntesis, sino el control fino sobre la emoción: permite etiquetar segmentos con `[happy]`, `[angry]`, `[sad]` o `[surprised]`, modular su intensidad con valores flotantes dentro de un rango publicado, y cambiar de emoción a mitad de frase sin necesidad de empalmar clips. Incorpora además clonación de voz a partir de una grabación de referencia corta con su transcripción exacta, y admite eventos vocales como risas, suspiros, llanto y susurros.

El repositorio ocupa 0,4 GB, aunque la primera ejecución descarga aproximadamente 11 GB de pesos base. Requiere Linux, Python 3.12 y una GPU NVIDIA con al menos 28 GB de VRAM libre, lo que sitúa su despliegue en el terreno de GPUs de datacenter o workstations profesionales. La licencia es la Fish Audio Research License, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (finetune de fishaudio/s2-pro) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | fish-audio-research-license |
| Formato de pesos | no disponible (repo de 0,4 GB; descarga inicial de ~11 GB de pesos base) |

Otros datos técnicos relevantes: la salida de audio es WAV a 44,1 kHz, el límite de generación por defecto es de 400 frames (aproximadamente 18,6 segundos) y el pipeline declarado en Hugging Face es `text-to-speech`. El modelo tiene la inferencia desactivada en el Hub (`inference: false`).

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se sabe que es un finetune de Fish Audio S2-Pro, un modelo de síntesis de voz de Fish Audio, y que el ajuste introduce control emocional mediante etiquetas textuales y coeficientes de intensidad. El repositorio incluye un `AGENT_GUIDE.md` con instrucciones de uso programático (Python y JSONL), parámetros y resolución de problemas, pero no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO.

Los elementos técnicos destacables que sí están documentados son: control de emoción por etiquetas con cuatro presets de intensidad (`weakest`, `weak`, `default`, `strong`) y valores flotantes en el rango `[-0.06, 0.045]`; guía de eventos vocales (`--guidance`, por defecto 1,5 para susurro y 0 para el resto); clonación de voz con audio de referencia y transcripción; y lectura especificada mediante kana entre corchetes para nombres y heterónimos (por ejemplo, `水神[すいじん]` frente a `水神[みずかみ]`). El autor advierte que el control de intensidad es experimental y que los coeficientes continuos no implican una respuesta perceptual lineal.

## Capacidades

- Síntesis de voz en japonés con salida WAV a 44,1 kHz.
- Control emocional por etiquetas: `[happy]`, `[angry]`, `[sad]`, `[surprised]`, con opción neutra (`neutral` / `none`).
- Modulación de intensidad emocional mediante cuatro presets o un valor flotante dentro del rango `[-0.06, 0.045]`.
- Cambio de emoción a mitad de línea sin empalmar clips de audio.
- Clonación de voz a partir de una grabación de referencia corta y su transcripción exacta.
- Eventos vocales no verbales: `[laugh]`, `[sigh]`, `[cry]`.
- Modo susurro mediante la etiqueta `[whisper]`.
- Especificación de lectura de nombres y palabras raras con kana entre corchetes.
- Generación por lotes mediante entrada JSONL (`--jsonl`) y directorio de salida (`--out-dir`).
- Control de semilla (`--seed`) para explorar distintas tomas de la misma línea.
- Muestreo opcional de los codebooks residuales (`--no-argmax`) para variabilidad adicional.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning; es un modelo exclusivamente de TTS.

## Casos de uso

- Doblaje de personajes en videojuegos: el modelo permite asignar una emoción distinta a cada línea de diálogo y ajustar su intensidad, de modo que un mismo personaje puede pasar de alegría a tristeza dentro de una escena sin cambiar de referencia de voz.
- Producción de audio para novelas visuales y aventuras conversacionales: con la clonación de voz y las etiquetas de emoción se pueden generar cientos de líneas con coherencia de timbre y variación expresiva, usando el modo JSONL para procesar el guion completo por lotes.
- Contenido narrativo y audiolibros en japonés: la lectura especificada con kana resuelve la pronunciación de nombres propios, topónimos y heterónimos, un problema recurrente en la síntesis japonesa.
- Vídeo y animación de personajes: la generación de risas, suspiros y llanto en posiciones concretas del texto facilita escenas con reacciones no verbales, y el modo susurro cubre primeros planos y diálogos íntimos.
- Prototipado rápido de voces para creadores: con una grabación de referencia corta y su transcripción se obtiene una voz clonada en minutos, útil para maquetas de doblaje antes de contratar actores.
- Investigación en habla expresiva: el control continuo de intensidad y el cambio de emoción intra-frase ofrecen una interfaz controlable para estudiar percepción emocional y evaluar sistemas TTS, dentro de los límites de la licencia de investigación.
- Contenido ASMR y audio inmersivo: el modo susurro y la demo de ASMR 360 publicada por el autor apuntan a este nicho, donde el control de intensidad y los eventos vocales son determinantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 28 GB libres de VRAM en GPU NVIDIA, según los requisitos del autor.
- GPU recomendadas: no se especifican modelos concretos; por el umbral de 28 GB encajan GPUs de datacenter como A100 (40/80 GB), H100 o L40S, y workstations con 32 GB o más.
- GPU de consumo: no cabe en GPUs consumer habituales de 8-16 GB (RTX 4060/4070/4080); una RTX 4090 con 24 GB queda por debajo del umbral indicado.
- Sistema operativo y entorno: Linux, Python 3.12, instalación mediante `requirements.txt` y descarga de pesos con `huggingface_hub` (unos 11 GB en el primer uso).
- Despliegue: el repositorio proporciona `infer.py` para inferencia por línea de comandos; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican directamente a un modelo de audio.
- Latencia y throughput: no disponibles. El límite por defecto de 400 frames equivale a unos 18,6 segundos de audio por generación, sin división automática de frases.

## Comparativa con modelos similares

| Modelo | Desarrollador | Idioma | Clonación de voz | Control emocional | Licencia | Contexto / límite |
|---|---|---|---|---|---|---|
| Iroha-TTS-V1 | IrohaStudio | Japonés | Sí (audio + transcripción) | Etiquetas + intensidad continua | Fish Audio Research License | 400 frames (~18,6 s) por generación |
| Fish Audio S2-Pro | Fish Audio | Multilingüe (no detallado) | Sí | No documentado en esta ficha | No disponible en esta ficha | No disponible |
| Alternativas TTS japonesas | No disponible | Japonés | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible. La referencia más directa es el modelo base Fish Audio S2-Pro, del que Iroha-TTS-V1 hereda la arquitectura y sobre el que añade el control emocional.

## Limitaciones y advertencias

- Licencia Fish Audio Research License: restringe el uso, especialmente el comercial; es imprescindible revisar `LICENSE.md` antes de cualquier despliegue en producción.
- Solo soporta japonés; no se documentan otros idiomas.
- El control de intensidad es experimental: los coeficientes continuos no producen una respuesta perceptual lineal y el resultado varía según la línea y la referencia.
- El llanto, el susurro y la coincidencia de voz con la referencia varían según el texto y el audio de referencia; no hay garantía de consistencia entre generaciones.
- Sin referencia de voz, la voz puede cambiar con la semilla, lo que complica la coherencia en producciones largas.
- Límite de 400 frames (~18,6 segundos) por generación y sin división automática de frases: las líneas largas requieren troceado manual.
- La clonación de voz exige una transcripción exacta de la referencia; transcripciones imprecisas degradan el resultado.
- Riesgo de uso indebido de la clonación de voz (suplantación, contenido no consentido); la licencia de investigación limita pero no elimina este riesgo.
- No se documentan sesgos concretos ni tasas de alucinación; en TTS, los fallos se manifiestan como artefactos, prosodia incorrecta o pronunciación errónea.
- Requiere 28 GB de VRAM y Linux, lo que excluye la mayoría de entornos de desarrollo consumer.
- La inferencia está desactivada en Hugging Face (`inference: false`) y el acceso al repositorio requiere inicio de sesión en HF con permisos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IrohaStudio/Iroha-TTS
- Modelo base Fish Audio S2-Pro: https://huggingface.co/fishaudio/s2-pro
- Demo de generación de voz (Space): https://huggingface.co/spaces/cyacya8023/Iroha-TTS
- Demo ASMR 360 (Space): https://huggingface.co/spaces/cyacya8023/Iroha-360-ASMR
- Demo de audio: https://claude.ai/artifact/EnAFVuqrC4E6QA7BSVY7dg
- Blog del autor (con demos en vídeo): https://irohastudios.github.io/blog/irohattsv1/en/
- Guía para agentes (AGENT_GUIDE.md): https://huggingface.co/IrohaStudio/Iroha-TTS/blob/main/AGENT_GUIDE.md
- README en chino: https://huggingface.co/IrohaStudio/Iroha-TTS/blob/main/README_zh.md
- Licencia: https://huggingface.co/IrohaStudio/Iroha-TTS/blob/main/LICENSE.md
