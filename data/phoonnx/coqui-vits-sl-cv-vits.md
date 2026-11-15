# Phoonnx/coqui-vits-sl-cv-vits

## Resumen

`coqui-vits-sl-cv-vits` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx dentro del repositorio agregador `Phoonnx/phoonnx-coqui-vits`. Se trata de un modelo VITS procedente del ecosistema Coqui TTS, exportado a formato ONNX y empaquetado para su uso con la librería phoonnx, un runtime de inferencia de voz desarrollado por TigreGotico. El identificador interno del modelo es `coqui/sl-cv-vits` y corresponde a la carpeta `sl-cv-vits` del repositorio original.

El modelo está orientado a la síntesis de voz en esloveno (código de idioma `sl-SI`), entrenado presumiblemente con el corpus Common Voice, según indica la propia model card. La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normales y un discriminador adversarial durante el entrenamiento. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un modelo VITS de tamano pequeno-medio.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue (exportación ONNX de un modelo Coqui ya existente) más que de un modelo nuevo con benchmarks propios. Resulta útil para quien necesite TTS en esloveno dentro del ecosistema phoonnx y prefiera un runtime ONNX ligero frente a la pila original de Coqui TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es texto, no una ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | esloveno (`sl-SI`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que integra en un único modelo un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en flujos normales invertibles y un discriminador adversarial multiperiodo empleado solo durante el entrenamiento. El objetivo combina pérdida adversarial, pérdida de coincidencia espectral (mel) y una pérdida de alineamiento monotónico calculada con alineamiento de atención, lo que permite generar audio directamente desde texto sin un modelo acústico separado ni un vocoder externo entrenado por separado.

En cuanto a los datos de entrenamiento, la model card solo indica que la fuente es Common Voice para el idioma esloveno (`sl-SI`). No se especifican el número de horas de audio, el número de tokens, la composición exacta del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS. El artefacto publicado es una exportación ONNX del modelo original de Coqui, por lo que las decisiones de entrenamiento corresponden al modelo fuente `coqui/sl-cv-vits`, no a este repositorio.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en esloveno.
- Generación de audio end-to-end sin vocoder separado, gracias a la arquitectura VITS.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Identificador de voz (`voice id`) expuesto por phoonnx: `coqui/sl-cv-vits`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no, únicamente esloveno.
- No dispone de modo thinking, visión ni audio de entrada; la entrada es texto y la salida es audio.

## Casos de uso

- Lectura de contenido en esloveno: convertir artículos, documentación o noticias a audio para consumo pasivo o accesibilidad, aprovechando que el modelo está entrenado específicamente para `sl-SI`.
- Accesibilidad para personas con discapacidad visual: integrar el modelo en un lector de pantalla o servicio de lectura que sintetice texto esloveno en tiempo real mediante ONNX Runtime.
- Asistentes de voz locales para esloveno: desplegar el modelo en un dispositivo o servidor propio para dar respuestas habladas en aplicaciones de domótica o kioscos, sin depender de APIs externas.
- Generación de audiolibros y podcasts: sintetizar textos largos por fragmentos y concatenar el audio resultante, dado el bajo coste computacional de un modelo VITS.
- Pruebas de integración en pipelines phoonnx: usar este modelo como voz de referencia para validar el runtime phoonnx y comparar calidad con otras voces Coqui exportadas a ONNX.
- Prototipado de interfaces de voz en esloveno: emplear el modelo en fases de diseño de producto para generar locuciones de prueba antes de contratar grabaciones humanas.
- Educación y aprendizaje de idiomas: producir pronunciaciones sintéticas de frases en esloveno para materiales didácticos o ejercicios de escucha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero que puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamano del artefacto, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `coqui-vits-sl-cv-vits` (este) | VITS + ONNX | Esloveno (`sl-SI`) | ONNX | BSD-3-Clause | Exportación phoonnx de `coqui/sl-cv-vits` |
| `coqui/sl-cv-vits` (modelo fuente) | VITS | Esloveno (`sl-SI`) | Pesos Coqui | BSD-3-Clause | Modelo original del que deriva este artefacto |
| Otras voces de `Phoonnx/phoonnx-coqui-vits` | VITS + ONNX | Diversos idiomas | ONNX | BSD-3-Clause (según fuente) | Mismo pipeline y runtime, distinto idioma |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo esloveno; no es adecuado para otros idiomas sin un modelo específico.
- Al ser una exportación ONNX de un modelo Coqui, la calidad final depende del modelo fuente `coqui/sl-cv-vits` y de la fidelidad de la conversión; no se documentan métricas de calidad (MOS) ni pruebas de regresión.
- Riesgo de artefactos y prosodia limitada inherente a modelos VITS entrenados con corpus de voz como Common Voice, que suelen tener condiciones de grabación heterogéneas.
- No se documentan sesgos específicos, pero un corpus como Common Voice puede no representar toda la variación dialectal del esloveno.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución y sin endoso; conviene conservar el aviso de copyright original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se especifican requisitos de hardware ni límites de longitud de texto; textos largos requerirán fragmentación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-sl-cv-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
