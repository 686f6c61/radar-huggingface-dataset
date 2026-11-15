# Phoonnx/vits-hf_community_agentvibes_piper-custom-voices_jenny

## Resumen

`vits-hf_community_agentvibes_piper-custom-voices_jenny` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una extracción concreta del repositorio agregador `Phoonnx/phoonnx-vits`, que empaqueta voces Piper procedentes de distintos proyectos comunitarios en un único contenedor. En este caso, la carpeta de origen es `hf_community__agentvibes__piper-custom-voices__jenny`, es decir, una voz personalizada denominada "jenny" procedente del proyecto AgentVibes.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura habitual en los modelos Piper de síntesis de voz ligera y orientada a inferencia en tiempo real. Los pesos se distribuyen en formato ONNX, lo que facilita su despliegue en entornos de producción con runtime de ONNX Runtime o mediante el propio framework phoonnx del autor.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, sin model card propia más allá de la referencia al repositorio fuente, sin métricas publicadas, sin idiomas declarados y con cero descargas en el momento de la consulta. Es útil como pieza de un pipeline TTS basado en phoonnx, pero no debe evaluarse como un modelo independiente con garantías de calidad o soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; cuantizacion no declarada) |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun metadatos del repo; la card fuente advierte que las licencias siguen a los originales por subcarpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end para síntesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multi-periodo durante el entrenamiento. Esta familia de modelos es la base de Piper y se caracteriza por su bajo coste computacional en inferencia y su capacidad de generar audio de forma rápida en CPU.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el hablante concreto ni el proceso de entrenamiento (si hubo fine-tuning, ajuste de prosodia o condicionamiento multi-hablante). La model card únicamente indica que los ficheros conservan las rutas del repositorio `Phoonnx/phoonnx-vits` y que la voz proviene de la carpeta `hf_community__agentvibes__piper-custom-voices__jenny`. No se declara ninguna innovación técnica adicional más allá de la propia arquitectura VITS y el empaquetado en ONNX para phoonnx.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) mediante la arquitectura VITS.
- Inferencia en formato ONNX, compatible con ONNX Runtime y con el framework phoonnx.
- Voz concreta "jenny" procedente del proyecto AgentVibes de voces personalizadas Piper.
- No se declaran capacidades de clonación de voz, control de emociones, multi-hablante ni condicionamiento por embedding de hablante.
- No se declaran capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se declaran modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Síntesis de voz para asistentes conversacionales: la voz "jenny" puede integrarse en un pipeline phoonnx para generar respuestas habladas en un asistente de voz, aprovechando el formato ONNX para ejecución en CPU.
- Lectura de textos en aplicaciones de accesibilidad: el modelo puede convertir artículos, notificaciones o documentos en audio para usuarios con discapacidad visual, dado el bajo coste de inferencia típico de VITS.
- Generación de avisos y locuciones en sistemas de megafonía o domótica: al ser un modelo ligero en ONNX, puede desplegarse en dispositivos de borde para anuncios pregrabados dinámicamente.
- Prototipado de interfaces de voz en aplicaciones web o móviles: útil para validar la experiencia de usuario con una voz concreta antes de contratar un servicio TTS comercial.
- Integración en el ecosistema phoonnx: como pieza del repositorio agregador, sirve para probar el runtime del autor con voces Piper personalizadas y comparar latencias entre voces.
- Generación de audio para contenido educativo o divulgativo de bajo presupuesto: permite producir narraciones sintéticas sin depender de APIs externas, siempre que se respete la licencia de la voz original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en CPU sin GPU.
- GPU recomendadas: no disponible; por el tamaño, cualquier GPU consumer moderna sería suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: no confirmada explícitamente, aunque el tamaño del repo (0,1 GB) hace plausible la ejecución en CPU y en GPUs de gama baja.
- Opciones de despliegue: ONNX Runtime y el framework phoonnx (librería declarada en los metadatos). No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Contexto/idiomas | Disponibilidad |
|---|---|---|---|---|---|
| vits-hf_community_agentvibes_piper-custom-voices_jenny (este) | VITS | ONNX | MIT (con caveat de licencias por subcarpeta) | Idiomas no disponibles | Hugging Face, 0 descargas |
| Piper (rhasspy/piper) | VITS | ONNX | MIT (por voz, según origen) | Multi-idioma, voces comunitarias | Hugging Face y GitHub, ampliamente usado |
| Coqui TTS (XTTS v2) | VITS/Transformer híbrido | PyTorch | Coqui Public Model License (no comercial en algunos casos) | Multi-idioma, clonación de voz | Hugging Face, muy usado |
| Kokoro TTS | StyleTTS2 + ISTFTNet | ONNX/PyTorch | Apache 2.0 | Inglés principalmente | Hugging Face, creciente adopción |

La comparativa es orientativa: este modelo es una voz Piper empaquetada para phoonnx, por lo que su comparación natural es con las voces Piper originales y con otros TTS ligeros en ONNX. No se dispone de métricas objetivas (MOS, RTF) para comparar rendimiento.

## Limitaciones y advertencias

- La model card no declara idioma, hablante, dataset ni métricas de calidad; no hay garantía de prosodia o naturalidad.
- La licencia MIT del repositorio entra en conflicto potencial con la advertencia de la card fuente: "Licenses follow the originals per subfolder". La carpeta de origen `agentvibes/piper-custom-voices` no declara licencia explícita en la información disponible, por lo que el uso comercial debe verificarse en el repositorio original.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí existe riesgo de pronunciación incorrecta, artefactos o prosodia anómala en textos fuera del dominio de entrenamiento.
- No se declaran sesgos conocidos, pero al ser una voz concreta puede presentar sesgos de género, acento o registro propios del hablante original.
- El modelo tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación por la comunidad.
- El repositorio es un artefacto derivado: los "voice ids" de phoonnx no están definidos en este repo, sino que otras voces del agregador reutilizan estos ficheros. Esto complica la trazabilidad y el versionado.
- No apto para clonación de voz ni para cambio de hablante sin reentrenamiento.
- Fecha de creación declarada como 2026-11-14, posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_agentvibes_piper-custom-voices_jenny
- Repositorio agregador fuente: https://huggingface.co/Phoonnx/phoonnx-vits
- Framework phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto AgentVibes (voces Piper personalizadas): no disponible en la información proporcionada
- Repositorio Piper (rhasspy/piper): no disponible en la información proporcionada
- Paper VITS: no disponible en la información proporcionada
