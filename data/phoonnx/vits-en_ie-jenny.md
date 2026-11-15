# Phoonnx/vits-en_ie-jenny

## Resumen

vits-en_ie-jenny es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede del repositorio agentvibes/piper-custom-voices, desarrollado por el autor agentvibe, y ha sido adaptado para funcionar dentro del ecosistema phoonnx, que incluye integración con el asistente OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx.

Se trata de una voz concreta identificada como "jenny", orientada al inglés de Irlanda (en-IE). El modelo no es un LLM ni un modelo generativo de propósito general: es un sintetizador neuronal de voz que convierte fonemas espeak (en alfabeto IPA) en audio WAV. Su relevancia radica en que ofrece una voz en una variante regional específica del inglés dentro de un formato ONNX ligero, lo que facilita su despliegue en entornos con recursos limitados y en asistentes de voz locales.

El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto pensado para inferencia en CPU o GPU modesta. La licencia declarada es Apache 2.0, heredada del proyecto upstream, lo que permite uso comercial con las condiciones habituales de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa contexto textual largo) |
| Tipos de cuantización | no disponible (formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-IE (inglés de Irlanda) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, además de una pérdida de coincidencia espectral y una alineación monotónica latente. El resultado es un modelo que genera audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado.

En el caso de vits-en_ie-jenny, la model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del corpus, el número de pasos ni si se aplicaron técnicas de ajuste como RLHF (no aplicable en TTS) o fine-tuning sobre una voz base. La información disponible indica únicamente que el modelo procede de agentvibes/piper-custom-voices y que la entrada textual se convierte a fonemas mediante espeak-ng (o su port espyak) a través de la librería scriptconv. No se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura VITS y del empaquetado ONNX para phoonnx.

## Capacidades

- Síntesis de voz a partir de texto en inglés de Irlanda (en-IE), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng o el port espyak integrado en phoonnx.
- Generación de audio de un solo hablante (voz "jenny").
- Integración con el asistente OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en Python a través de phoonnx y en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un sintetizador TTS.
- Capacidad multilingüe limitada a la variante en-IE; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx, permitiendo que un asistente doméstico autoalojado responda con una voz en inglés irlandés sin depender de servicios en la nube.
- Lectura de contenido en aplicaciones de accesibilidad: se puede emplear para convertir texto de pantalla en audio para usuarios con discapacidad visual, aprovechando su tamaño reducido (~0,1 GB) para ejecutarse en dispositivos de gama baja.
- Generación de audiolibros o pódcast con acento irlandés: al ser una voz específica de en-IE, resulta adecuada para producir narraciones con una variante regional concreta, útil en contenido dirigido al público irlandés.
- Pruebas de integración en pipelines de TTS: los desarrolladores pueden usar el modelo para validar flujos de fonemización con espeak-ng y scriptconv antes de desplegar otras voces de la colección VITS de Phoonnx.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para aplicaciones web que necesiten leer texto en voz alta sin enviar datos a un servidor, con la demo disponible en tigregotico.pt/demo.
- Prototipado de interfaces conversacionales: equipos que desarrollen agentes de voz pueden emplear esta voz para pruebas de concepto de diálogo en inglés irlandés antes de invertir en modelos comerciales o de mayor tamaño.
- Generación de avisos y mensajes pregrabados: útil para crear mensajes de voz dinámicos en sistemas de anuncios o teleasistencia con acento en-IE, siempre que el texto se forneemice correctamente con espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (~0,1 GB) se espera un consumo bajo, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en CPU y en GPU de gama baja sin necesidad de A100 o H100.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU consumer moderna, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-en_ie-jenny (Phoonnx) | VITS | en-IE | ONNX | Apache 2.0 | Fonemas espeak IPA |
| Otras voces de la colección VITS de Phoonnx | VITS | Variable según voz | ONNX | Variable (según upstream) | Fonemas espeak IPA |
| agentvibes/piper-custom-voices (upstream) | VITS/Piper | Variable | Variable | Apache 2.0 (declarada) | Fonemas |
| Modelos TTS comerciales (p. ej. servicios cloud) | No disponible | Múltiples | API | Propietaria | Texto directo |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo cubre la variante en-IE; no es multilingüe y no se debe esperar un rendimiento correcto en otras lenguas o acentos.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No se documentan sesgos específicos, pero al ser una voz sintética entrenada con un corpus no descrito, pueden existir sesgos de pronunciación o prosodia no caracterizados.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de pronunciación o entonación en textos fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del proyecto upstream (agentvibes/piper-custom-voices) y mantener la atribución correspondiente.
- No se documentan requisitos mínimos de hardware ni métricas de latencia, lo que dificulta planificar despliegues en producción sin pruebas previas.
- El número de descargas (31) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria y ausencia de informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_ie-jenny
- Proyecto upstream: https://huggingface.co/agentvibes/piper-custom-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio del plugin OVOS: no disponible (referenciado como ovos-tts-plugin-phoonnx en la model card)
