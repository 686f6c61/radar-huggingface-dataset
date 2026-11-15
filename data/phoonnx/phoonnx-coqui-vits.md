# Phoonnx/phoonnx-coqui-vits

## Resumen

Phoonnx-coqui-vits es un repositorio espejo que recopila los checkpoints VITS del zoo de modelos de Coqui TTS, exportados al formato ONNX para su uso con phoonnx, la biblioteca de síntesis de voz offline de OpenVoiceOS. No se trata de un modelo único, sino de una colección de 36 voces entrenadas de forma independiente sobre corpus como Common Voice, CSS10, M-AILABS, LJSpeech, VCTK, Thorsten y OpenBible/Bloom-Library, que en conjunto cubren 34 idiomas desde el búlgaro hasta el yoruba.

La relevancia de este repositorio radica en la preservación y el empaquetado reproducible de los modelos VITS de Coqui TTS tras la discontinuación del proyecto original. Al convertir los pesos a ONNX e integrarlos en el gestor de voces de phoonnx, se facilita su despliegue en entornos sin conexión y en hardware modesto, manteniendo la licencia original de cada checkpoint.

El repositorio ocupa 3,0 GB e incluye tanto los pesos ONNX como los ficheros `config.json` necesarios para la inferencia. No está pensado para navegarse manualmente: el consumidor previsto es el `voice_index` de phoonnx (`coqui_vits.json`), que resuelve los identificadores de voz a los ficheros correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), exportado a ONNX |
| Parametros totales | no disponible (varía por checkpoint; el tamaño del repo completo es de 3,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no admite contexto conversacional) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX sin indicación de cuantización) |
| Idiomas soportados | 34: bg, bn, ca, cs, da, de, el, en, es, et, ee, fa, fi, fr, ga, ha, hr, hu, it, ln, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tw, uk, yo |
| Licencia | other (varía por checkpoint: BSD-3-Clause, Apache-2.0, CC-BY-4.0, CC-BY-SA-4.0) |
| Formato de pesos | ONNX más `config.json` por voz |

## Arquitectura y entrenamiento

Cada voz sigue la arquitectura VITS, un modelo end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y de adversario. VITS produce audio de forma directa desde texto sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia en comparación con pipelines en cascada.

Los datos de entrenamiento dependen del checkpoint concreto y provienen de los corpus originales de Coqui TTS: Common Voice (la mayoría de las voces), CSS10 (español, finés, francés, húngaro, neerlandés), M-AILABS (italiano, polaco, ucraniano), LJSpeech y VCTK (inglés), Thorsten (alemán) y OpenBible/Bloom-Library (ewe, hausa, lingala, twi akan, twi asante y yoruba). No se dispone de información sobre el número exacto de horas de audio ni sobre el proceso de ajuste fino por voz en la información proporcionada. La innovación principal de este repositorio no es arquitectónica, sino de empaquetado: la exportación a ONNX y la integración con el gestor de voces de phoonnx.

## Capacidades

- Síntesis de voz offline a partir de texto, con salida en formato WAV mediante `voice.synthesize_wav`.
- Soporte multilingüe para 34 idiomas, con voces específicas por idioma y, en algunos casos, por variante regional (por ejemplo, en-US, pt, tw-GH).
- Voces de un solo hablante y de múltiples hablantes según el checkpoint (por ejemplo, VCTK para inglés incluye varios hablantes).
- Resolución automática de identificadores de voz a ficheros mediante el `voice_index` de phoonnx.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de texto a voz.
- No dispone de modo de razonamiento (thinking), visión ni audio de entrada.

## Casos de uso

- Asistentes de voz para domótica y sistemas empotrados: phoonnx está pensado para entornos offline, por lo que estas voces VITS pueden ejecutarse en dispositivos sin conexión para leer estados de sensores, confirmaciones o alertas, con latencia baja y sin dependencia de servicios en la nube.
- Lectura de notificaciones y accesibilidad: integración en lectores de pantalla o sistemas de aviso para convertir texto en audio en 34 idiomas, útil en aplicaciones de accesibilidad que requieren cobertura lingüística amplia sin coste por petición.
- Generación de audiolibros y contenido narrado: las voces de un solo hablante sobre corpus como LJSpeech o CSS10 permiten narrar textos largos de forma consistente, troceando el texto en fragmentos y concatenando los WAV resultantes.
- Localización de contenidos multimedia: uso de las voces por idioma para doblar o narrar vídeos y presentaciones en lenguas con poca cobertura comercial, como ewe, hausa, lingala, twi o yoruba, a partir de los checkpoints de OpenBible.
- Pruebas y desarrollo de pipelines TTS: al estar en ONNX y con un gestor de voces unificado, sirve para validar arquitecturas de síntesis, comparar voces por corpus y medir latencia en distintas plataformas antes de elegir un modelo en producción.
- Prototipado de interfaces conversacionales: combinación con un modelo de lenguaje para generar respuestas y sintetizarlas con una voz concreta, útil en demos de asistentes y en investigación sobre interacción voz-texto.
- Preservación de modelos legacy: permite seguir usando los checkpoints de Coqui TTS tras el cese del proyecto original, manteniendo la reproducibilidad de experimentos y despliegues existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada por voz; el repositorio completo ocupa 3,0 GB, pero cada checkpoint individual es sustancialmente menor y se carga bajo demanda mediante el gestor de voces.
- GPU recomendadas: no disponible en la información proporcionada. Al ser modelos VITS exportados a ONNX, son aptos para ejecución en CPU y en GPU de gama consumer, aunque no se especifican modelos concretos.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño reducido de cada checkpoint VITS individual, pero no se confirma en la información disponible.
- Opciones de despliegue: phoonnx (biblioteca oficial), con runtime ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx-coqui-vits | VITS (ONNX) | 34 | ONNX | other (varía por checkpoint) | Hugging Face, vía phoonnx |
| Coqui TTS original | VITS (PyTorch) | 34 | PyTorch | varía por checkpoint | Repo coqui-ai/TTS (discontinuado) |
| Piper | VITS (ONNX) | decenas | ONNX | MIT en el runtime, varía por voz | Hugging Face, vía piper |
| Kokoro | TTS neuronal | varios | ONNX/PyTorch | Apache-2.0 (según versión) | Hugging Face |

La comparación con Piper y Kokoro es orientativa: no se dispone de datos de benchmarks que permitan comparar calidad o latencia de forma objetiva en la información proporcionada.

## Limitaciones y advertencias

- La licencia es heterogénea: cada checkpoint conserva la licencia que Coqui TTS le asignó (BSD-3-Clause, Apache-2.0, CC-BY-4.0 o CC-BY-SA-4.0). Es imprescindible revisar la licencia de cada voz antes de un uso comercial; en particular, las voces CC-BY-SA-4.0 imponen compartir bajo la misma licencia.
- Al ser un espejo de checkpoints de Coqui TTS, no hay garantía de mantenimiento ni de corrección de errores por parte del autor original, cuyo proyecto está discontinuado.
- La calidad de síntesis depende del corpus de entrenamiento de cada voz; las voces basadas en OpenBible o en corpus pequeños pueden presentar menor naturalidad que las entrenadas sobre LJSpeech o VCTK.
- No se dispone de información sobre sesgos de hablante, acento o género por voz más allá de la etiqueta del corpus.
- El repositorio no está pensado para navegarse manualmente: el uso previsto es a través del gestor de voces de phoonnx, y el acceso directo a los ficheros puede requerir conocer el `config.json` correspondiente.
- No hay datos publicados de latencia, throughput ni evaluación subjetiva (MOS) en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Proyecto phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (repositorio original): https://github.com/coqui-ai/TTS
- Fichero `.models.json` de Coqui TTS: https://github.com/coqui-ai/TTS/blob/dev/TTS/.models.json
