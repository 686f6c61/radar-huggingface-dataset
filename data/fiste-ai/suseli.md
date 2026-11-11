# fiste-ai/suseli

## Resumen

Suseli (सुसेली) es un modelo de síntesis de voz (text-to-speech) para el idioma nepalí, desarrollado por Fiste AI. El modelo se presenta como una propuesta orientada a generar habla natural en nepalí, con pronunciación clara y ritmo propio del idioma hablado, incluyendo la entonación ascendente característica al final de las interrogaciones. Según la model card, el proyecto persigue además capacidades de habla expresiva (estados de ánimo como calmado, alegre, serio o triste), múltiples voces integradas y clonación de voz a partir de una grabación corta con consentimiento del hablante.

Un aspecto relevante es que el autor declara explícitamente que los pesos del modelo no se han publicado todavía: el repositorio existe en Hugging Face, pero la model card indica que se trata de un desarrollo en curso y que la primera release se anunciará a través de las cuentas de Fiste AI en Hugging Face y GitHub. Por tanto, no hay información disponible sobre arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento.

La relevancia del proyecto radica en su enfoque en un idioma de bajos recursos como el nepalí (código ISO `ne`), para el que existen pocos sistemas TTS públicos, y en su objetivo declarado de ofrecer una variante compacta capaz de ejecutarse en el procesador de un portátil o en un teléfono. No obstante, a fecha de la información disponible, estas capacidades son objetivos de diseño y no características verificables del artefacto publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | no disponible (la model card anuncia que la licencia prohibirá la suplantación de identidad y el fraude) |
| Formato de pesos | no disponible (los pesos no se han publicado) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no especifica si se trata de un modelo basado en transformer, un sistema de síntesis acústica con vocoder neuronal, un modelo de difusión o una arquitectura híbrida. Tampoco se detallan el número de parámetros, la composición del corpus de entrenamiento, el número de horas de audio utilizadas, ni si se emplearon técnicas de alineamiento texto-audio, entrenamiento con RLHF o ajuste fino supervisado.

Los únicos datos técnicos declarados son objetivos de diseño: un modelo "compacto" que pueda ejecutarse en la CPU de un portátil o en un teléfono, soporte de habla expresiva controlable y capacidad de generar una nueva voz a partir de una grabación corta con consentimiento del hablante. No se especifica qué técnica de clonación de voz se emplearía (zero-shot, few-shot, ajuste por hablante) ni qué mecanismo de control de emoción se utilizaría.

## Capacidades

- Síntesis de voz en nepalí a partir de texto, con pronunciación y ritmo declarados como naturales.
- Entonación interrogativa: la model card menciona explícitamente la elevación tonal al final de las preguntas.
- Habla expresiva: control de estados de ánimo (calmado, alegre, serio, triste) según la descripción del autor.
- Múltiples voces integradas.
- Clonación de voz a partir de una grabación corta, condicionada al consentimiento del hablante.
- Variante compacta orientada a ejecución en CPU de portátil o en teléfono móvil.
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en nepalí para aplicaciones de accesibilidad: el modelo podría convertir artículos, noticias o documentos en audio para personas con discapacidad visual, aprovechando su orientación a pronunciación clara y ritmo natural del nepalí.
- Asistentes de voz en nepalí para dispositivos móviles: la variante compacta descrita por el autor está pensada para ejecutarse en el procesador de un teléfono, lo que permitiría integrar respuestas habladas en aplicaciones sin depender de la nube.
- Audiolibros y narración de contenido educativo: el control de estados de ánimo (calmado, alegre, serio) permitiría adaptar el tono de la narración al tipo de material, por ejemplo cuentos infantiles frente a material didáctico.
- Sistemas de anuncios y megafonía en nepalí: generación de avisos pregrabados o dinámicos para transporte público, aeropuertos o comercios, con entonación adecuada para preguntas y avisos.
- Prototipado de interfaces conversacionales en nepalí: desarrolladores que necesiten una voz sintética para probar asistentes, IVR o chatbots de voz en este idioma, a la espera de la publicación de los pesos.
- Investigación en TTS para idiomas de bajos recursos: el proyecto puede servir como referencia para estudiar técnicas de síntesis y clonación de voz en nepalí, así como para evaluar el equilibrio entre tamaño reducido y naturalidad.
- Localización de contenido multimedia: doblaje o sustitución de voces en vídeos y presentaciones dirigidos a audiencias nepalófonas, con la posibilidad de generar una voz concreta a partir de una grabación autorizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no haberse publicado la arquitectura ni el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El autor declara como objetivo que una variante compacta funcione en el procesador de un portátil o en un teléfono, pero no se especifican requisitos medibles.
- Opciones de despliegue: no disponible (no se indican integraciones con vLLM, llama.cpp, Ollama, TGI ni frameworks de TTS concretos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en nepalí ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos del modelo no se han publicado: el repositorio no contiene un artefacto utilizable y la model card lo describe como "in development".
- No hay información sobre licencia, lo que impide evaluar restricciones de uso comercial. La model card anuncia que la licencia futura prohibirá la suplantación de identidad y el fraude, pero no concreta el texto legal.
- El modelo está limitado al nepalí (`ne`); no se declara soporte multilingüe.
- No se han publicado datos sobre sesgos, tasas de alucinación o fidelidad de la síntesis, al no existir pesos ni evaluaciones.
- La clonación de voz conlleva riesgos de suplantación de identidad y fraude; el autor declara que solo se creará una voz a partir de grabaciones sobre las que el usuario tenga derechos y con consentimiento del hablante, pero no se detalla el mecanismo técnico de verificación.
- No se especifican requisitos de hardware verificables, por lo que no es posible planificar un despliegue en producción.
- La fecha de creación del repositorio (2026-10-30) y la ausencia de descargas y likes indican que el proyecto se encuentra en una fase muy temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fiste-ai/suseli
- Página del proyecto: https://fiste-ai.github.io/suseli/
- Organización en Hugging Face: https://huggingface.co/fiste-ai
- Organización en GitHub: https://github.com/fiste-ai
