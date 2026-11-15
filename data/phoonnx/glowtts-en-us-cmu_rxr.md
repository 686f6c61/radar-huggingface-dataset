# Phoonnx/glowtts-en-us-cmu_rxr

## Resumen

glowtts-en-us-cmu_rxr es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx como una carpeta extraída del repositorio agregado Phoonnx/phoonnx-glowtts. Se distribuye en formato ONNX y está pensado para su uso con la librería phoonnx, un motor de TTS desarrollado por TigreGotico. El modelo corresponde a la voz identificada como `larynx/en-us-cmu_rxr-glow_tts`, es decir, una voz en inglés estadounidense derivada del conjunto de voces CMU, empaquetada bajo la arquitectura GlowTTS.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de un lanzamiento con benchmarks públicos, sino de un artefacto de inferencia listo para desplegar en un pipeline de TTS. Su interés práctico reside en que el formato ONNX y la integración con phoonnx permiten ejecutar síntesis de voz sin depender de frameworks de entrenamiento pesados, lo que facilita el despliegue en entornos de producción o en dispositivos con recursos limitados.

La información disponible es escasa: el repositorio ocupa aproximadamente 0,1 GB, no registra descargas ni interacciones, y la model card no aporta detalles sobre arquitectura interna, datos de entrenamiento ni métricas de calidad. Todo lo que sigue se limita a lo que consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (modelo de síntesis de voz basado en flujo normalizador, según la etiqueta `glowtts`; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (según el identificador `en-us`); no se detalla cobertura adicional |
| Licencia | other (la model card original no especifica licencia para esta carpeta) |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Voice ID | `larynx/en-us-cmu_rxr-glow_tts` |

## Arquitectura y entrenamiento

El modelo se etiqueta como GlowTTS, una arquitectura de síntesis de voz basada en flujos normalizadores (normalizing flows) que transforma una distribución latente en la forma de onda o en representaciones acústicas intermedias de forma invertible. No obstante, la información proporcionada no detalla la configuración concreta de la red (número de capas, canales, dimensión del espacio latente), ni el vocoder asociado, ni si el modelo opera en espacio de mel-espectrograma con un vocoder separado.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de horas de audio, hablantes, composición del dataset CMU referenciado), ni sobre si se aplicaron técnicas de post-entrenamiento como fine-tuning o ajuste perceptual. La model card únicamente indica que los archivos conservan las rutas del repositorio original Phoonnx/phoonnx-glowtts y que la carpeta corresponde a la voz `en-us-cmu_rxr`. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con la voz identificada como `en-us-cmu_rxr`.
- Ejecución mediante la librería phoonnx, que actúa como motor de inferencia para modelos TTS empaquetados en ONNX.
- Integración como voice ID (`larynx/en-us-cmu_rxr-glow_tts`) dentro de pipelines de phoonnx.
- Inferencia en formato ONNX, lo que permite despliegue en entornos con runtime ONNX (CPU o GPU) sin necesidad de PyTorch.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Lectura de artículos y contenido web: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o lectores de noticias, usando la voz en inglés estadounidense y el runtime ONNX para despliegue ligero.
- Asistentes de voz integrados en aplicaciones de escritorio o móviles: al ejecutarse mediante phoonnx con pesos ONNX de ~0,1 GB, es viable embeberlo en clientes con recursos moderados para respuestas habladas.
- Generación de avisos y notificaciones habladas: en sistemas de domótica o automoción, el modelo puede sintetizar mensajes cortos y predecibles con baja carga computacional.
- Audiolibros y narración de documentos: para volcados de texto largos en inglés, el modelo sirve como motor de narración dentro de un pipeline que divida el texto en fragmentos y concatene el audio resultante.
- Pruebas de integración en pipelines TTS: útil para desarrolladores que evalúan phoonnx como motor y necesitan una voz de referencia en inglés para validar el flujo completo (texto, fonetización, síntesis, audio).
- Sistemas de respuesta interactiva por voz (IVR): para mensajes guiados y menús telefónicos en inglés, donde se requiere una voz clara y un motor de inferencia estable en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, CMOS), inteligibilidad (WER), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto (~0,1 GB); no confirmado por el autor.
- Opciones de despliegue: runtime ONNX estándar y la librería phoonnx (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-cmu_rxr | GlowTTS (TTS) | en-US | ONNX | other | Voz `en-us-cmu_rxr` vía phoonnx |
| Piper (voces CMU) | TTS neuronal ligero | multi-idioma | ONNX | MIT (según proyecto) | Motores de TTS embebidos |
| Coqui TTS (modelos GlowTTS) | GlowTTS | multi-idioma | PyTorch/ONNX | según modelo | Framework TTS completo |
| VITS (voces Larynx) | VITS | multi-idioma | ONNX | según modelo | Motor Larynx |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de modelo, formato y licencia.

## Limitaciones y advertencias

- La licencia es `other` y la model card original no especifica términos para esta carpeta, por lo que el uso comercial requiere verificar la licencia del repositorio fuente antes de desplegar.
- No hay información sobre sesgos de la voz (género, acento, prosodia) ni sobre la diversidad del corpus de entrenamiento.
- Riesgo de alucinación o artefactos acústicos: no documentado; en TTS, errores de pronunciación o prosodia son posibles, especialmente en texto fuera de dominio.
- Cobertura lingüística limitada al inglés estadounidense según el identificador; no se garantiza soporte de otros idiomas.
- Sin métricas de calidad publicadas: no es posible evaluar objetivamente la naturalidad o inteligibilidad frente a alternativas.
- Modelo con cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento activo.
- Dependencia de la librería phoonnx y del formato ONNX; la integración con otros frameworks TTS no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_rxr
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
