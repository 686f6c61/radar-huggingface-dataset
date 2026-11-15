# Phoonnx/kitten-tts-nano-0.2

## Resumen

kitten-tts-nano-0.2 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una extracción concreta del repositorio `Phoonnx/phoonnx-kitten-tts`, correspondiente a la carpeta `nano-0.2`, empaquetada para su uso con la librería phoonnx (proyecto de TigreGotico). El modelo se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia ligeros y multiplataforma.

La relevancia del modelo radica en su orientación a la integración dentro del ecosistema phoonnx, un motor de TTS que consume modelos empaquetados con identificadores de voz propios. El modelo expone ocho voces predefinidas (identificadas como `kittentts/nano-0.2-expr-voice-{2,3,4,5}-{f,m}`), lo que sugiere variantes de género femenino y masculino con distintos perfiles de expresividad.

La información pública disponible es muy limitada: la model card no documenta arquitectura, número de parámetros, longitud de contexto ni idiomas soportados. El tamaño del repositorio aparece como 0.0 GB, lo que impide estimar el número de parámetros. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS empaquetado en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card únicamente indica que se trata de un modelo de la familia kitten-tts, empaquetado en formato ONNX para la librería phoonnx, y que conserva las rutas de ficheros del repositorio origen `Phoonnx/phoonnx-kitten-tts`. No se documentan datos de entrenamiento, número de tokens, composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino sobre voces concretas.

La única información estructural disponible es la existencia de ocho identificadores de voz (`expr-voice-2-f`, `expr-voice-2-m`, `expr-voice-3-f`, `expr-voice-3-m`, `expr-voice-4-f`, `expr-voice-4-m`, `expr-voice-5-f`, `expr-voice-5-m`), lo que indica que el modelo soporta múltiples perfiles de voz con etiquetas de expresividad y género. No se detalla si se trata de un modelo multi-hablante único o de un conjunto de modelos empaquetados bajo la misma carpeta.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`).
- Ocho voces predefinidas con identificadores propios en phoonnx: variantes femeninas y masculinas en los perfiles 2, 3, 4 y 5, todas con etiqueta `expr` (presumiblemente expresivas).
- Integración nativa con la librería phoonnx mediante los voice ids documentados.
- Ejecución mediante formato ONNX, lo que permite inferencia en runtime ONNX Runtime y potencialmente en otros motores compatibles.
- No se documentan capacidades de clonación de voz, control de prosodia por tokens, multilingüismo, tool calling ni agentes.

## Casos de uso

- Integración en aplicaciones phoonnx: el modelo está empaquetado específicamente para el motor phoonnx, por lo que su uso principal es alimentar dicho motor con los voice ids `kittentts/nano-0.2-expr-voice-*` para generar locuciones en aplicaciones que ya utilizan esta librería.
- Lectura de contenido en asistentes de voz locales: al distribuirse en ONNX, puede ejecutarse en entornos de escritorio o embebidos sin depender de servicios en la nube, siempre que se integre a través de phoonnx u otro runtime ONNX.
- Generación de audio para prototipos y demos: la licencia Apache 2.0 permite usar el modelo en pruebas de concepto y demos internas sin restricciones de atribución comercial adicionales.
- Selección de perfiles de voz en aplicaciones de accesibilidad: los ocho identificadores permiten ofrecer distintas voces a usuarios con necesidades de lectura de pantalla, alternando entre perfiles femeninos y masculinos.
- Narración de contenido corto con voz expresiva: dado el sufijo `expr` en los identificadores, el modelo está pensado para locuciones con cierto grado de expresividad, adecuado para avisos, notificaciones o contenido breve.
- Evaluación comparativa de motores TTS: al ser un modelo aislado y ligero (carpeta `nano`), sirve como referencia para comparar calidad y latencia frente a otros modelos empaquetados en phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documenta el número de parámetros ni el tamaño real de los ficheros; el repositorio figura como 0.0 GB, dato no fiable).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados; el formato ONNX y la etiqueta `nano` sugieren un modelo ligero, pero no se confirma.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, tamaño ni arquitectura que permitan una comparación rigurosa con otros modelos TTS (Piper, Coqui TTS, Kokoro, etc.).

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, idiomas ni datos de entrenamiento, lo que impide evaluar su calidad y adecuación para producción.
- No se especifican los idiomas soportados; no debe asumirse multilingüismo.
- El tamaño del repositorio aparece como 0.0 GB, lo que puede indicar un problema de empaquetado o de metadatos; conviene verificar los ficheros reales antes de integrarlo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación por la comunidad.
- Riesgo de alucinación no aplicable en el sentido habitual de LLM, pero sí existe riesgo de artefactos de audio, pronunciación incorrecta y prosodia defectuosa, no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla la procedencia de los datos de entrenamiento ni posibles restricciones adicionales de las voces.
- Al ser una extracción de un repositorio mayor, la actualización y el mantenimiento dependen del proyecto origen `Phoonnx/phoonnx-kitten-tts`.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/kitten-tts-nano-0.2
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-kitten-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
