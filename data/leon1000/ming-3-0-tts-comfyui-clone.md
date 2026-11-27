# Leon1000/Ming-3.0-tts-ComfyUI-Clone

## Resumen

Ming-3.0-tts-ComfyUI-Clone es un repositorio de pesos preparados para ComfyUI del modelo Ming 3.0 TTS, un sistema de síntesis de voz (text-to-speech) con clonación de voz y soporte multilingüe desarrollado originalmente por inclusionAI. El autor del repositorio, Leon1000, publica los pesos fusionados (merged) y las variantes cuantizadas en INT8 con formato ConvRot, tanto de la versión de 0,5B como de la variante Tiny 9B, listas para cargarse mediante los nodos personalizados ComfyUI-Ming-3-tts.

El modelo resuelve el problema de generar voz natural a partir de texto con control fino sobre timbre, emoción, velocidad, tono y volumen, además de permitir clonación de voz por referencia de audio y clonación cruzada entre idiomas. Es relevante porque integra estas capacidades en el ecosistema ComfyUI, lo que facilita flujos de trabajo de generación de audio dentro de grafos nodales, sin necesidad de infraestructura de inferencia separada.

La arquitectura se describe en los metadatos como mixture-of-experts (MoE) orientada a generación de habla, con soporte para siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés) y licencia MIT. El repositorio ocupa 34,5 GB e incluye pesos en formato safetensors, con variantes originales fusionadas y cuantizadas INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) orientada a generación de habla (según tags del repositorio) |
| Parametros totales | 0,5B (variante 0.5B) y 9B (variante Tiny 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Original fusionado y INT8 ConvRot |
| Idiomas soportados | chino (zh), inglés (en), alemán (de), español (es), francés (fr), coreano (ko), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio distribuye pesos derivados de los modelos base inclusionAI/Ming-3.0-tts-0.5b e inclusionAI/Ming-3.0-tts-tiny. Los tags indican una arquitectura de mezcla de expertos (MoE) aplicada a generación de habla, aunque no se detalla el número de expertos, la dimensión oculta ni el mecanismo de enrutamiento. Tampoco se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) ni innovaciones técnicas concretas más allá de la cuantización INT8 con esquema ConvRot.

El trabajo del autor del repositorio consiste en la fusión de pesos originales y su conversión a formatos compatibles con ComfyUI, incluyendo variantes INT8 ConvRot para reducir el uso de memoria. No se documenta si se realizó un ajuste fino adicional (finetune) sobre los modelos base ni qué hiperparámetros se emplearon.

## Capacidades

- Síntesis de voz multilingüe en siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz a partir de audio de referencia, con transcripción manual o generada por Whisper.
- Clonación de voz cruzada entre idiomas (cross-language voice cloning).
- Diseño de voz (voice design) para definir timbres sin referencia previa.
- Control de atributos básicos: velocidad, tono (pitch) y volumen.
- Control de emoción en la generación de habla.
- Soporte de dialectos chinos.
- Soporte de etiquetas vocales (vocal tags) para matizar la salida.
- Generación multi-hablante orientada a podcasts con la variante Tiny 9B.
- Integración como nodos personalizados en ComfyUI mediante el repositorio ComfyUI-Ming-3-tts.

## Casos de uso

- Doblaje y localización de vídeo: el modelo puede generar pistas de voz en español, inglés, francés o alemán a partir de un guion, y la clonación cruzada entre idiomas permite mantener el timbre del hablante original en la versión doblada.
- Producción de audiolibros: con control de velocidad, tono y emoción se puede ajustar la narración por capítulo, y la clonación de voz permite mantener una voz consistente a lo largo de horas de audio.
- Generación de podcasts sintéticos: la variante Tiny 9B incluye un flujo de trabajo multi-hablante que permite alternar voces distintas en un mismo episodio, útil para prototipado de contenido sin locutores.
- Asistentes de voz y agentes conversacionales: la síntesis multilingüe y el control de emoción permiten generar respuestas habladas con matices adecuados al contexto, integrándose en grafos de ComfyUI junto a otros nodos de procesamiento.
- Accesibilidad y lectura de textos: conversión de documentos a audio con control de velocidad y tono para usuarios con discapacidad visual o dificultades de lectura, ajustando la voz a preferencias personales.
- Prototipado de personajes en videojuegos: el diseño de voz y la clonación permiten generar voces de personajes sin sesiones de grabación, y las etiquetas vocales ayudan a matizar estados emocionales.
- Pruebas de concepto de clonación de voz para investigación: el repositorio ofrece pesos INT8 ligeros (0,5B) que reducen el coste de experimentación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La variante 0,5B en INT8 ConvRot es la opción más ligera y está pensada para reducir el uso de memoria; el tamaño exacto del archivo no se detalla, pero el repositorio completo ocupa 34,5 GB e incluye cuatro checkpoints.
- La variante Tiny 9B requiere más memoria; no se especifica la VRAM exacta para inferencia en la información disponible.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información proporcionada.
- El despliegue se realiza mediante ComfyUI con los nodos personalizados ComfyUI-Ming-3-tts; no se documentan opciones de vLLM, llama.cpp, Ollama o TGI para este modelo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos base de referencia son inclusionAI/Ming-3.0-tts-0.5b e inclusionAI/Ming-3.0-tts-tiny, pero no se ofrecen datos comparativos de rendimiento frente a otras alternativas de TTS.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ming-3.0-tts-ComfyUI-Clone (0.5B) | 0,5B | no disponible | MIT | Hugging Face, ComfyUI |
| Ming-3.0-tts-ComfyUI-Clone (Tiny 9B) | 9B | no disponible | MIT | Hugging Face, ComfyUI |
| Alternativas de TTS | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información proporcionada.
- Riesgo de alucinación no cuantificado; en TTS, esto puede manifestarse como prosodia incorrecta, omisiones o artefactos en la salida de audio.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; la licencia MIT no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el usuario.
- No se especifican limitaciones de longitud de contexto ni de duración máxima de audio generado.
- Aunque se listan siete idiomas, no se detalla la calidad relativa por idioma ni el soporte de variantes regionales del español.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-20), lo que sugiere que no ha sido validado por la comunidad.
- El tamaño del repositorio (34,5 GB) implica requisitos de almacenamiento considerables para descargar todos los checkpoints.
- No se documentan garantías de compatibilidad con versiones futuras de ComfyUI ni de los nodos personalizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Leon1000/Ming-3.0-tts-ComfyUI-Clone
- Nodos personalizados ComfyUI-Ming-3-tts: https://github.com/Saganaki22/ComfyUI-Ming-3-tts
- Instrucciones en inglés: https://github.com/Saganaki22/ComfyUI-Ming-3-tts/blob/main/README.md
- Instrucciones en chino: https://github.com/Saganaki22/ComfyUI-Ming-3-tts/blob/main/README_ZH.md
- Repositorio original de Ming: https://github.com/inclusionAI/Ming-3.0-tts
- Modelo base 0.5B: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5b
- Modelo base Tiny: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Pesos 0.5B original fusionado: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-0.5b/model.safetensors?download=true
- Pesos 0.5B INT8 ConvRot: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-0.5b-int8-convrot/ming-3-tts-0.5b-int8-convrot.safetensors?download=true
- Pesos Tiny 9B original fusionado: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-tiny-9b/ming-3-tts-tiny-9b.safetensors?download=true
- Pesos Tiny 9B INT8 ConvRot: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-tiny-9b-int8-convrot/ming-3-tts-tiny-9b-int8-convrot.safetensors?download=true
