# agiws/AGIWSVoice

## Resumen

AGIWSVoice es un proyecto de investigación e ingeniería publicado por el usuario agiws en Hugging Face, centrado en un motor de síntesis de voz (text-to-speech) y conversión de voz construido alrededor de un único decodificador de audio. El modelo no es un TTS completo en el sentido convencional: no incluye el backbone de lenguaje ni los codebooks discretos de OmniVoice, sino que conserva exclusivamente el decodificador DAC, que transforma un latente de forma `[T, 256]` a 25 fps en audio de 24 kHz. La generación del latente corre a cargo de herramientas propias del autor a partir de fonemas, duraciones y curvas de F0 y energía, o bien mediante inversión de audio real.

El proyecto se presenta como material de investigación con código fuente, scripts, tests y documentación interna, empaquetado con la librería `transformers` y licencia Apache 2.0. Los idiomas declarados son inglés y ruso. Su relevancia actual es limitada pero específica: propone un enfoque de control fino de prosodia y clonación de voz sin encoder de hablante, apoyándose en la invertibilidad del decodificador para tareas de detección de artefactos, speech-to-speech y edición contrafactual de énfasis.

No se dispone de información sobre el número de parámetros del decodificador, la longitud de contexto ni resultados de benchmarks en la documentación proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador DAC (audio codec) sobre latente `[T, 256]` a 25 fps; sin backbone de lenguaje ni codebooks discretos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Copia GGUF Q8 disponible como verificación cruzada; módulos cuantizados vía `agiws/NeuralQuant` en fases posteriores |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint original y copia GGUF (Q8) |

## Arquitectura y entrenamiento

La arquitectura se organiza en torno a un decodificador DAC que recibe un latente de forma `[T, 256]` muestreado a 25 fps y produce audio a 24 kHz. El flujo declarado es: fonemas, duraciones y curvas (F0 y energía) generan el latente, que el decodificador DAC convierte en audio; alternativamente, el latente puede obtenerse por inversión de audio real. Los bloques de referencia expuestos incluyen dequantización RVQ, `fc2` (1024 a 256), `conv1`, bloques del decodificador y `conv2`, además de encoder DAC, HuBERT y cuantizador en el lado de entrada.

El proyecto descarta explícitamente el backbone Qwen3 y los codebooks discretos de OmniVoice, que según el autor es bidireccional y ejecuta 32 pasadas MaskGIT completas por chunk (142-199 ms por paso, unos 5-6 s por chunk), lo que lo hace no streamable. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Los pesos del decodificador provienen del checkpoint original de PyTorch, y la copia GGUF se mantiene solo como verificación cruzada de que ambos contienen los mismos tensores. La innovación técnica destacable es la explotación de la invertibilidad del decodificador para detección de artefactos, clonación de voz sin speaker encoder y control de prosodia mediante direcciones de sensibilidad `d(F0, energy) / d(latent)`.

## Capacidades

- Síntesis de voz a partir de fonemas, duraciones y curvas de F0 y energía, con salida a 24 kHz.
- Conversión de voz (voice conversion) mediante inversión de audio real al espacio latente.
- Clonación de voz basada en el latente medio de una locución de referencia, sin encoder de hablante.
- Speech-to-speech: contenido y curvas de la fuente con timbre del hablante objetivo.
- Control de prosodia mediante direcciones de sensibilidad y ediciones contrafactuales de énfasis.
- Detección de artefactos de audio (clics, clipping, zumbidos, dropouts, daño por compresión) mediante el residual `audio - decode(latent)`, sin necesidad de etiquetas.
- Complementos de ASR: estimación de emoción a partir de coordenadas de curvas, ubicación de énfasis y rescoring de hipótesis de ASR externas por residual.
- Idiomas: inglés y ruso.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Detección automática de artefactos en pipelines de audio: el residual entre el audio y su reconstrucción permite identificar clics, clipping o daño por compresión sin etiquetado manual, útil en control de calidad de archivos de audio a gran escala.
- Clonación de voz para doblaje o locución: a partir del latente medio de una locución de referencia se obtiene el timbre del hablante, sin necesidad de entrenar un speaker encoder adicional.
- Conversión de voz en producción de contenido: se preservan contenido y curvas prosódicas de la fuente mientras se sustituye el timbre por el del hablante objetivo, aplicable a podcasts o audiolibros multilingües (inglés y ruso).
- Edición de prosodia en postproducción: las direcciones de sensibilidad `d(F0, energy) / d(latent)` permiten modificar énfasis y entonación de forma controlada sobre el latente, sin regenerar el audio desde cero.
- Rescoring de transcripciones ASR: el residual del decodificador se usa para reordenar hipótesis de sistemas ASR externos, mejorando la selección de la transcripción más plausible acústicamente.
- Investigación en representaciones latentes de audio: la exposición bloque a bloque del pipeline (RVQ, `fc2`, `conv1`, bloques del decodificador, `conv2`) permite ejecutar pasadas forward y backward por bloque individual, facilitando experimentos de interpretabilidad y edición latente.
- Análisis de emoción y énfasis en habla: las coordenadas de las curvas permiten estimar emoción y ubicación del énfasis como complemento a sistemas ASR existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño del decodificador).
- GPU recomendadas: no disponible. El autor menciona un worker de cómputo Colab T4 detrás de AGIWS Gateway para ejecuciones pesadas, lo que sugiere que el pipeline completo cabe en una GPU T4 (16 GB).
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la mención de T4 indica que al menos esa GPU es suficiente para las ejecuciones del proyecto.
- Opciones de despliegue: PyTorch con `transformers`; copia GGUF Q8 compatible con llama.cpp como verificación cruzada; módulos cuantizados vía `agiws/NeuralQuant` en fases posteriores.
- Latencia y throughput: no disponibles para AGIWSVoice. Como referencia del sistema original OmniVoice, el backbone descartado ejecuta 32 pasadas MaskGIT por chunk con 142-199 ms por paso (5-6 s por chunk), pero este dato no aplica al decodificador aislado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AGIWSVoice | no disponible | no disponible | Apache 2.0 | Decodificador DAC aislado con control de prosodia e inversión latente |
| OmniVoice-0.6B (agiws) | 0.6B (backbone) | no disponible | no disponible en la información | TTS completo con backbone Qwen3, head de 8 codebooks y DAC |
| Modelos TTS comerciales (p. ej. familia VITS, XTTS) | no disponible | no disponible | varía | TTS extremo a extremo con encoder de hablante |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único comparable documentado es OmniVoice-0.6B, del que AGIWSVoice reutiliza únicamente el decodificador y los pesos del codec.

## Limitaciones y advertencias

- No es un modelo TTS autónomo: requiere herramientas externas del autor para generar el latente a partir de texto, por lo que no puede usarse directamente como pipeline `texto -> audio` sin ese tooling.
- Solo se declaran inglés y ruso; no hay soporte multilingüe documentado más allá de esos dos idiomas.
- No se especifican sesgos conocidos, pero al derivar de un codec entrenado sobre datos no documentados, pueden heredarse sesgos de timbre, acento y prosodia de dichos datos.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero la inversión de audio real puede producir reconstrucciones inexactas que se manifiestan como artefactos en el residual.
- La clonación de voz y el speech-to-speech conllevan riesgos de suplantación de identidad y uso no consentido; la licencia Apache 2.0 no impone restricciones de uso ético, por lo que la responsabilidad recae en el desplegador.
- La licencia Apache 2.0 permite uso comercial, pero el proyecto se etiqueta como `research` y su madurez es baja (0 descargas, 0 likes, publicación reciente), sin garantías de estabilidad en producción.
- No hay información sobre el tamaño del decodificador ni sobre requisitos de VRAM, lo que dificulta planificar el despliegue.
- Dependencia de repositorios externos del mismo autor (`agiws/OmniVoice-0.6B`, `agiws/OmniVoice-0.6B-Q8-GGUF-llama.cpp`, `agiws/NeuralQuant`) cuya disponibilidad y mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agiws/AGIWSVoice
- Implementación de referencia PyTorch y pesos del codec: https://huggingface.co/agiws/OmniVoice-0.6B
- Copia GGUF de los pesos del codec: https://huggingface.co/agiws/OmniVoice-0.6B-Q8-GGUF-llama.cpp
- Módulos cuantizados: https://huggingface.co/agiws/NeuralQuant
