# blaze-voice-ai/dubbing-omnivoice-khmer

## Resumen

El modelo `blaze-voice-ai/dubbing-omnivoice-khmer` es un ajuste fino (fine-tune) del sistema OmniVoice, especializado en síntesis de voz en khmer. Lo publica el usuario `blaze-voice-ai` y corresponde al checkpoint 4000 del entrenamiento `omnivoice_finetune_khmer`. OmniVoice, desarrollado por el grupo k2-fsa, es un modelo de texto a voz (TTS) masivamente multilingüe con soporte para más de 600 idiomas, basado en una arquitectura de modelo de difusión tipo language model. Este fine-tune concreto se centra en el khmer, uno de los idiomas menos representados en los sistemas TTS comerciales, y se distribuye bajo licencia Apache 2.0.

El modelo tiene 612,6 millones de parámetros y se sirve a través de un sidecar HTTP (servicio `services/tts` de OmniVoice), no se carga en proceso. Según la model card, en una GPU L4 alcanza un rendimiento de 23,6 líneas por minuto con una réplica, y 28,9 con dos réplicas en tarjetas separadas. La relevancia actual radica en ofrecer una alternativa abierta y gratuita para síntesis de voz en khmer, un idioma con escasa cobertura en soluciones propietarias, además de heredar las capacidades de clonación de voz y diseño de voz de OmniVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base OmniVoice usa diffusion language model, pero no se especifica la variante del fine-tune) |
| Parametros totales | 612.577.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | khmer (por el nombre del modelo; el base OmniVoice soporta 646 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de OmniVoice, un sistema TTS de código abierto desarrollado por k2-fsa. OmniVoice emplea una arquitectura de modelo de difusión tipo language model, que combina generación autoregresiva con difusión para producir audio de alta calidad. El fine-tune se realizó sobre un dataset en khmer, aunque no se han publicado detalles sobre el volumen de datos, la composición del corpus ni el proceso de entrenamiento (si se usó RLHF, DPO u otras técnicas). El checkpoint 4000 es el único que se conserva fuera de la máquina original, según la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la duración del ajuste ni las técnicas de regularización empleadas. El modelo se sirve mediante un sidecar HTTP, lo que sugiere un diseño pensado para integración en servicios de doblaje o generación de voz en tiempo real.

## Capacidades

- Generación de voz en khmer a partir de texto, con calidad sintética natural.
- Clonación de voz zero-shot: puede replicar una voz a partir de una muestra de audio de 3 a 25 segundos, sin entrenamiento adicional (capacidad heredada de OmniVoice).
- Diseño de voz: permite crear voces nuevas a partir de descripciones textuales (capacidad de OmniVoice).
- Soporte multilingüe: aunque este fine-tune está especializado en khmer, el modelo base OmniVoice cubre 646 idiomas, por lo que es posible que el fine-tune conserve cierta capacidad multilingüe, aunque no está documentado.
- Integración como servicio: se sirve vía HTTP mediante un sidecar, lo que facilita su despliegue en pipelines de doblaje o generación de contenido.
- No se documentan capacidades de tool calling, agentes ni razonamiento, ya que es un modelo puramente de síntesis de voz.

## Casos de uso

- Doblaje de vídeo y multimedia al khmer: el modelo puede generar locuciones en khmer para vídeos, series o documentales, integrándose en un pipeline de doblaje donde el texto traducido se convierte en audio. Su rendimiento de ~24 líneas por minuto en una L4 permite procesar guiones de duración media en tiempos razonables.
- Atención al cliente automatizada en khmer: empresas que operan en Camboya pueden usar el modelo para generar respuestas de voz en sistemas IVR o asistentes telefónicos, ofreciendo una experiencia natural en el idioma local sin depender de voces pregrabadas.
- Audiolibros y contenido educativo: generación de audiolibros en khmer a partir de texto, útil para editoriales o plataformas educativas que quieran ampliar su catálogo en este idioma.
- Clonación de voz para preservación lingüística: con una muestra corta de una voz, se puede clonar para crear contenido narrado en khmer, por ejemplo para preservar voces de locutores o para proyectos de documentación cultural.
- Asistentes de voz en dispositivos locales: al ser Apache 2.0 y poder desplegarse en hardware propio, se puede integrar en asistentes de voz para el mercado camboyano sin depender de servicios en la nube.
- Generación de contenido para redes sociales: creadores de contenido en khmer pueden generar voces para vídeos de TikTok, YouTube o podcasts, con la posibilidad de clonar su propia voz o diseñar una nueva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica métricas de throughput en una GPU L4: 23,6 líneas por minuto con una réplica, 28,9 con dos réplicas en tarjetas separadas, y 15,7 con dos réplicas compartiendo una misma tarjeta (peor que una sola, además de provocar OOM a mitad de generación). No hay comparaciones con otros modelos TTS en términos de calidad de voz (MOS, etc.).

## Requisitos de hardware

- VRAM estimada: no se especifica el consumo total, pero la model card indica que cada réplica necesita ~1,2 GB de headroom transitorio, y que dos réplicas en una misma tarjeta provocan OOM. En una L4 (24 GB) cabe una réplica con margen.
- GPU recomendadas: L4 (usada en las pruebas), también debería funcionar en GPUs consumer con al menos 8-12 GB de VRAM, aunque no hay datos oficiales.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño de 612M parámetros y el headroom de 1,2 GB, pero no está confirmado.
- Opciones de despliegue: el modelo se sirve mediante un sidecar HTTP (`services/tts` de OmniVoice), no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Es probable que requiera el stack de OmniVoice.
- Latencia y throughput: 23,6 líneas/min en una réplica L4, 28,9 en dos réplicas en tarjetas separadas. No se dan valores de latencia por línea.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos TTS multilingües. Alternativas en la misma categoría (TTS multilingüe de código abierto) incluyen:

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| OmniVoice (base) | no disponible | 646 | Apache 2.0 | Modelo base del que deriva este fine-tune |
| XTTS v2 (Coqui) | ~467M | 17 | CPML (no comercial) | TTS multilingüe con clonación de voz |
| Bark (Suno) | ~6.4B | 13 | MIT (no comercial para algunos usos) | TTS con efectos y música |
| VITS (single-speaker) | ~30M | 1 por modelo | MIT | TTS ligero, no multilingüe |

Este fine-tune se diferencia por su enfoque específico en khmer, un idioma que no está cubierto por XTTS v2 ni Bark. OmniVoice base ya cubre khmer, pero este fine-tune busca optimizar la calidad para ese idioma.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad de voz (MOS) ni pruebas de robustez en entornos ruidosos.
- El modelo es un fine-tune específico para khmer; su rendimiento en otros idiomas no está documentado y podría degradarse.
- La model card advierte que dos réplicas en una misma tarjeta causan OOM, lo que limita el escalado en hardware compartido.
- No se especifican sesgos potenciales, pero como todo modelo TTS, puede reflejar sesgos del corpus de entrenamiento (por ejemplo, acentos o registros dominantes).
- Riesgo de alucinación: en TTS, la alucinación se manifiesta como pronunciaciones incorrectas o artefactos de audio; no hay datos sobre su frecuencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base OmniVoice también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se proporciona información sobre el dataset de fine-tune, lo que dificulta evaluar la cobertura dialectal o de registros del khmer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaze-voice-ai/dubbing-omnivoice-khmer
- Repositorio de OmniVoice: https://github.com/k2-fsa/OmniVoice/
- Web oficial de OmniVoice: https://omnivoice.app/
- Página de clonación de voz: https://omnivoice.app/voice-cloning
- Web alternativa de OmniVoice: https://omnivoice.pro/
