# BrugRadar/SpeakOnly-Babbeldoos-GGUF

## Resumen

SpeakOnly-Babbeldoos-GGUF es un modelo de síntesis de voz (TTS) experimental centrado en el flamenco conversacional, publicado por el usuario BrugRadar en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión local que fusiona los pesos de Chatterbox Multilingual V2 de Resemble AI (licencia MIT) con el adaptador conversacional Babbeldoos de Howest AI Lab (CC BY-NC 4.0). El resultado es un modelo T3 adaptado (componente de modelado de tokens de audio de la arquitectura Chatterbox) exportado en formato GGUF y cuantizado a Q8_0.

El modelo resuelve un nicho muy concreto: generar voz sintética con acento y cadencia flamenca en contextos conversacionales, partiendo de una grabación de referencia local que condiciona la generación. Su relevancia es limitada pero interesante para desarrolladores que trabajan con lenguas de baja representación en TTS y quieren experimentar con despliegue local mediante el motor chatterbox.cpp.

El repositorio es de tamaño reducido (1,7 GB) e incluye dos artefactos: el T3 fusionado y cuantizado (`vlaamse_t3_q8.gguf`) y el S3Gen original en F32 (`s3_f32.gguf`). No hay información publicada sobre benchmarks, idiomas formales soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox (T3 + S3Gen), adaptación LoRA fusionada en T3 |
| Parametros totales | 264.068.050 (dato safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (T3); F32 (S3Gen) |
| Idiomas soportados | flamenco (neerlandés belga) como objetivo del adaptador; resto no disponible |
| Licencia | CC BY-NC 4.0 (modelo adaptado); S3Gen bajo MIT upstream |
| Formato de pesos | GGUF (`vlaamse_t3_q8.gguf`, `s3_f32.gguf`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Chatterbox Multilingual V2 de Resemble AI, una arquitectura TTS que combina un modelo T3 (modelado de tokens de audio) con un módulo S3Gen (generación de forma de onda). Sobre el T3 se aplica el adaptador conversacional Babbeldoos de Howest AI Lab, un LoRA con alpha/rank = 64/32 entrenado para conferir acento y cadencia flamencos. En esta publicación, el adaptador se fusiona en los pesos base y el T3 resultante se cuantiza a Q8_0.

La conversión se realiza con el motor chatterbox.cpp (revisión `ddca05fb69c2910b0d7b5eae420d360ed98c067b`, MIT). El S3Gen se exporta sin modificar a GGUF en F32, ya que según el autor un export Q8 del S3Gen producía silencio en pruebas con Android. No se documentan en la información disponible el volumen de tokens de entrenamiento del adaptador, la composición del dataset Babbeldoos ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (TTS) condicionada por una grabación de referencia local.
- Generación de habla con acento y cadencia flamencos gracias al adaptador Babbeldoos.
- Modulación del estilo conversacional (no solo identidad de voz) según la referencia.
- Despliegue local mediante el motor chatterbox.cpp en formato GGUF.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modos de razonamiento.
- Capacidades multilingües: no disponibles más allá del objetivo flamenco.

## Casos de uso

- Síntesis de voz flamenca para aplicaciones educativas: útil para generar materiales audibles con acento local, partiendo de una referencia de un hablante flamenco.
- Prototipos de asistentes conversacionales en neerlandés belga: el adaptador conversacional permite un tono más natural en diálogos, aunque la ausencia de benchmarks obliga a validación manual.
- Investigación en TTS de lenguas de baja representación: sirve como base para estudiar cómo un LoRA sobre un modelo multilingüe desplaza el acento hacia una variante regional.
- Pruebas de despliegue en dispositivos Android: el autor menciona pruebas en Android, por lo que es útil para validar pipelines GGUF en móvil (con la salvedad del S3Gen en F32).
- Generación de audiolibros o narraciones en flamenco: la referencia local permite ajustar el timbre y el ritmo, aunque la licencia no comercial restringe su uso editorial comercial.
- Integración en herramientas de accesibilidad: lectura de texto en voz flamenca para usuarios con discapacidad visual, siempre que el uso sea no comercial.
- Evaluación comparativa de motores de inferencia: permite comparar chatterbox.cpp frente a otras implementaciones sobre los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 264 millones de parámetros y cuantización Q8_0, la huella del T3 es del orden de cientos de megabytes, pero el S3Gen en F32 añade carga adicional no cuantificada en la información.
- GPU recomendadas: no disponibles; por tamaño, cabría en GPUs consumer con varios GB de VRAM, pero no hay datos oficiales.
- Compatibilidad con consumer GPU: probable por el tamaño, sin confirmación del autor.
- Opciones de despliegue: chatterbox.cpp (motor de conversión y inferencia citado); otras opciones (llama.cpp, Ollama, vLLM, TGI) no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SpeakOnly-Babbeldoos-GGUF | 264 M | no disponible | CC BY-NC 4.0 | GGUF (Q8_0 / F32) | Adaptación flamenca experimental |
| Chatterbox Multilingual V2 (Resemble AI) | no disponible | no disponible | MIT | pesos originales | Base upstream, multilingüe |
| Babbeldoos Flemish TTS (Howest AI Lab) | no disponible | no disponible | CC BY-NC 4.0 | adaptador LoRA | Adaptador conversacional original |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: uso exclusivamente no comercial y con atribución a Resemble AI y Howest AI Lab.
- El adaptador modifica acento y estilo, pero no está entrenado sobre la voz personal del usuario; requiere una grabación de referencia local para condicionar la generación.
- El export Q8 del S3Gen producía silencio en pruebas Android según el autor; debe usarse el F32 por ahora, lo que incrementa el peso del despliegue.
- Modelo experimental sin benchmarks publicados: el rendimiento real en calidad de voz, inteligibilidad y naturalidad no está cuantificado.
- Riesgo de alucinación prosódica y artefactos en textos fuera del dominio conversacional flamenco no evaluado.
- Idiomas y cobertura multilingüe no documentados más allá del objetivo flamenco.
- Sesgos de acento, género y registro no analizados en la información disponible.
- Ausencia de pipeline declarado en Hugging Face y de datos de descargas/validación comunitaria (0 descargas, 0 likes en el momento de la ficha).

## Enlaces

- Hugging Face: https://huggingface.co/BrugRadar/SpeakOnly-Babbeldoos-GGUF
- Chatterbox (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Babbeldoos Flemish TTS (Howest AI Lab): https://huggingface.co/Howest-AI-Lab/babbeldoos-flemish-tts
- Motor de conversión chatterbox.cpp: https://github.com/gianni-cor/chatterbox.cpp
