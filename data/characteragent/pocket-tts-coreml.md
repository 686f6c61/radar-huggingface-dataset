# characteragent/pocket-tts-coreml

## Resumen

Pocket TTS Core ML es una distribución en formato Core ML del modelo de síntesis de voz Pocket TTS desarrollado originalmente por Kyutai. Este repositorio concreto, publicado por characteragent, no introduce modificaciones sobre la conversión previa de FluidInference: se limita a empaquetar el subconjunto necesario para clonación de voz en inglés sobre Neural Engine de Apple, junto con el codificador Mimi que permite construir una voz a partir de una grabación. Está pensado para ejecutarse en el dispositivo mediante la librería FluidAudio, sin depender de servidores externos.

El modelo resuelve el problema de la síntesis de voz con clonación en entornos locales y con requisitos de privacidad, al compilar las redes a `.mlmodelc` optimizados para Apple Silicon. El repositorio ocupa 0,4 GB e incluye únicamente los modelos en inglés para Neural Engine, sus constantes y el codificador Mimi; quedan fuera las voces predefinidas, otras precisiones, otras colocaciones (GPU/CPU) y otros idiomas.

La relevancia de esta ficha radica en que documenta una variante de despliegue muy específica: no es un modelo nuevo ni un fine-tune, sino un espejo fiel de la conversión de FluidInference bajo licencia CC BY 4.0. Su interés práctico está en la integración on-device para aplicaciones de voz en ecosistema Apple, no en mejoras de calidad o capacidades respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Pocket TTS de Kyutai; conversión Core ML con módulos `cond_prefill_ane`, `flowlm_step_ane`, `flow_decoder_fused`, `mimi_decoder` y `mimi_encoderv2`) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene exclusivamente modelos compilados Core ML para Neural Engine; no se documentan precisiones alternativas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `manifest.json`, `tokenizer.model`, ficheros binarios de constantes (`text_embed_table.bin`, `bos_emb.bin`, `bos_before_voice.bin`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de alineación del modelo base Pocket TTS de Kyutai en la documentación proporcionada. Lo que sí se detalla es la estructura de despliegue: la conversión Core ML organiza la inferencia en varios módulos especializados, con un prefijo de condicionamiento (`cond_prefill_ane`), un paso de FlowLM (`flowlm_step_ane`), un decodificador de flujo fusionado (`flow_decoder_fused`) y un decodificador Mimi (`mimi_decoder`). El codificador Mimi (`mimi_encoderv2`) se emplea para extraer la representación de una grabación y habilitar la clonación de voz.

La conversión la realizó FluidInference y este repositorio la replica sin cambios: mismos ficheros, mismas rutas y mismos tamaños y hashes SHA-256 en los ficheros grandes. Se han omitido las voces predefinidas, otras precisiones y colocaciones, otros idiomas y las fuentes `.mlpackage`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés.
- Clonación de voz a partir de una grabación, mediante el codificador Mimi incluido.
- Ejecución on-device sobre Neural Engine de Apple, sin llamadas a servidores externos.
- Integración con FluidAudio para su uso dentro de la aplicación Character Agent.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada distinto de la grabación de referencia ni modo de pensamiento.
- Cobertura multilingüe limitada al inglés en este subconjunto.

## Casos de uso

- Clonación de voz local en aplicaciones macOS/iOS: el codificador Mimi permite generar una voz a partir de una muestra de audio y sintetizar locuciones sin salir del dispositivo, lo que reduce la exposición de datos biométricos.
- Lectura de contenido en voz alta con identidad de voz propia: útil en lectores de artículos o asistentes personales donde el usuario quiere mantener una voz consistente y privada.
- Integración en la app Character Agent: el repositorio está empaquetado específicamente para este producto a través de FluidAudio, de modo que sirve como dependencia directa de esa aplicación.
- Prototipado de interfaces de voz en Apple Silicon: al estar compilado para Neural Engine, permite probar experiencias TTS con latencia local en Macs y dispositivos con chip de Apple.
- Accesibilidad: generación de voz personalizada para usuarios que necesiten una voz sintética familiar en herramientas de lectura o comunicación asistida, siempre con consentimiento explícito del titular de la voz.
- Evaluación de pipelines TTS on-device: útil para equipos que quieran comparar el coste y la latencia de un TTS local frente a servicios en la nube en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Neural Engine de Apple (chips de la serie M y equivalentes en dispositivos Apple compatibles con Core ML).
- VRAM estimada: no disponible; al ejecutarse en Neural Engine no se aplica el concepto de VRAM de GPU dedicada.
- GPU recomendadas: no aplica; el despliegue está orientado a Neural Engine, no a A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en equipos Apple con Neural Engine, al tratarse de un paquete de 0,4 GB.
- Opciones de despliegue: Core ML a través de FluidAudio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| characteragent/pocket-tts-coreml | TTS con clonación, on-device | Inglés | CC BY 4.0 | Core ML (`.mlmodelc`) | Hugging Face |
| FluidInference/pocket-tts-coreml | TTS con clonación, on-device (conversión original) | Inglés y otros (según subconjunto) | CC BY 4.0 | Core ML | Hugging Face |
| kyutai/pocket-tts | TTS con clonación (modelo base) | No disponible en la información | CC BY 4.0 | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre inglés; no incluye otros idiomas presentes en la conversión original.
- No incluye voces predefinidas: para sintetizar es necesario aportar una grabación y usar el codificador Mimi.
- Está limitado a una colocación y precisión concretas (Neural Engine); no se incluyen variantes para GPU o CPU.
- Las condiciones de Kyutai para Pocket TTS prohíben clonar una voz sin consentimiento explícito y lícito de su titular, así como la suplantación y el engaño; es una restricción de uso relevante en producción.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero deben evaluarse en el modelo base antes de un despliegue real.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio conservar el crédito a Kyutai y a FluidInference.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria.

## Enlaces

- [characteragent/pocket-tts-coreml en Hugging Face](https://huggingface.co/characteragent/pocket-tts-coreml)
- [FluidInference/pocket-tts-coreml (conversión original)](https://huggingface.co/FluidInference/pocket-tts-coreml)
- [kyutai/pocket-tts (modelo base)](https://huggingface.co/kyutai/pocket-tts)
- [FluidAudio (GitHub)](https://github.com/FluidInference/FluidAudio)
- [Kyutai](https://kyutai.org)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode)
