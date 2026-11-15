# Phoonnx/styletts2-bsc-es-styletts2

## Resumen

styletts2-bsc-es-styletts2 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, empaquetado en formato ONNX para su uso con la librería phoonnx. Se trata de una de las variantes incluidas en el repositorio agregador Phoonnx/phoonnx-styletts2, concretamente la carpeta `bsc-es-styletts2`, que agrupa varias voces en castellano procedentes del proyecto BSC (Barcelona Supercomputing Center). El modelo se distribuye con la etiqueta `styletts2`, lo que indica que deriva de la arquitectura StyleTTS 2 para síntesis de voz neuronal.

El interés de esta ficha es limitado pero concreto: ofrece un conjunto de voces en castellano listas para inferencia mediante ONNX, lo que facilita su integración en aplicaciones sin depender de frameworks de deep learning pesados. El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un uso muy incipiente o experimental.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS del mismo modo que en LLM) ni los idiomas exactos más allá de la referencia al castellano en el nombre de la carpeta. La licencia es `other`, con la particularidad de que las voces provienen de distintos laboratorios y el checkpoint catalán del BSC está licenciado como GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (síntesis de voz neuronal), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | castellano (según nombre de carpeta `bsc-es`); catalán referenciado en la licencia del checkpoint BSC |
| Licencia | other (phoonnx es Apache-2.0; los checkpoints subyacentes tienen licencias distintas, el catalán del BSC es GPL-3.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS 2, una arquitectura de síntesis de voz neuronal que combina un generador de audio con un modelo de estilo y un discriminador adversarial, orientada a producir habla natural con control de estilo. La exportación a ONNX permite ejecutar la inferencia con el runtime de ONNX, lo que reduce la dependencia de PyTorch en producción y facilita el despliegue en entornos con recursos limitados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino específico. El repositorio es un agregador de checkpoints de distintos orígenes, por lo que los detalles de entrenamiento de cada voz no están documentados en la model card proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en castellano.
- Múltiples voces predefinidas identificadas por `voice id`: `bsc/es-cml10246`, `bsc/es-cml11797`, `bsc/es-cml12367`, `bsc/es-cml3946`, `bsc/es-cml8882`, `bsc/es-cml9972` y `bsc/es-styletts2`.
- Ejecución mediante ONNX, compatible con la librería phoonnx.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).
- Cobertura multilingüe: no disponible más allá de la referencia al castellano.

## Casos de uso

- Lectura de artículos y contenido web: el modelo puede convertir texto en audio en castellano para aplicaciones de accesibilidad o lectura por voz, usando cualquiera de las voces `bsc/es-*` disponibles.
- Asistentes de voz para atención al cliente: integración en flujos de respuesta automática donde se requiere una voz en castellano con latencia baja gracias al runtime ONNX.
- Audiolibros y narración: generación de locuciones para fragmentos de texto largo, seleccionando la voz que mejor se adapte al tono del contenido.
- Sistemas de navegación y avisos: síntesis de instrucciones cortas en tiempo real en dispositivos con recursos limitados, aprovechando el formato ONNX.
- Pruebas de concepto en investigación de TTS: evaluación comparativa de distintas voces en castellano dentro del ecosistema phoonnx.
- Generación de avisos automatizados en aplicaciones de domótica o IoT: frases cortas sintetizadas en el propio dispositivo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,8 GB, lo que sugiere que el modelo cabe en GPUs de gama media, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del repositorio y el uso de ONNX, pero no está documentado.
- Opciones de despliegue: runtime ONNX y la librería phoonnx (https://github.com/TigreGotico/phoonnx).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| styletts2-bsc-es-styletts2 | StyleTTS 2 (ONNX) | castellano | other (checkpoints con licencias mixtas; catalán GPL-3.0) | ONNX | Hugging Face (Phoonnx) |
| StyleTTS 2 original | StyleTTS 2 | inglés principalmente | MIT (según repositorio original) | PyTorch | GitHub / Hugging Face |
| Modelos TTS comerciales (p. ej. ElevenLabs, Azure TTS) | propietaria | multilingüe | propietaria | API | servicios en la nube |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia `other` implica que los checkpoints subyacentes tienen licencias distintas; el checkpoint catalán del BSC está bajo GPL-3.0, lo que puede condicionar el uso comercial y la redistribución.
- No se documentan los idiomas exactos soportados más allá del castellano; la cobertura multilingüe es incierta.
- No hay información sobre sesgos de voz, calidad de síntesis ni robustez ante texto ruidoso.
- Riesgo de alucinación no aplica en el mismo sentido que en LLM, pero puede haber errores de pronunciación o entonación no documentados.
- El repositorio no registra descargas ni likes, lo que sugiere falta de validación comunitaria.
- No se especifican requisitos de hardware ni latencia, lo que dificulta planificar su uso en producción.
- Al ser un agregador de checkpoints de distintos orígenes, la calidad y el comportamiento pueden variar entre voces.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-bsc-es-styletts2
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- StyleTTS 2 (referencia arquitectónica): no disponible en la información proporcionada.
