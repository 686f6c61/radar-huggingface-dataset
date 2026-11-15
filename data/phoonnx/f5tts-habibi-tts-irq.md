# Phoonnx/f5tts-habibi-tts-irq

## Resumen

f5tts-habibi-tts-irq es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, extraído como subcarpeta del repositorio agregador `Phoonnx/phoonnx-f5tts`. Se trata de un checkpoint especializado en árabe iraquí (`Specialized/IRQ`) dentro del conjunto Habibi-TTS, empaquetado para su uso con la librería `phoonnx`, una herramienta de inferencia TTS del ecosistema de TigreGotico. El modelo se distribuye bajo licencia Apache-2.0 y ocupa aproximadamente 1,5 GB en el repositorio.

El pipeline declarado es `text-to-speech` y la arquitectura subyacente corresponde a F5-TTS, un sistema de síntesis basado en flow matching y difusión que genera audio a partir de texto y una referencia de voz. La etiqueta `onnx` en los tags sugiere que los pesos están exportados en formato ONNX para inferencia optimizada, aunque la model card no detalla la configuración exacta de exportación ni las dimensiones del modelo.

La relevancia de esta ficha es limitada pero concreta: cubre un caso de uso de nicho (TTS en dialecto árabe iraquí) dentro de un ecosistema de herramientas abiertas. No hay datos publicados de benchmarks, número de parámetros, contexto ni composición del dataset de entrenamiento en la información disponible, por lo que muchas especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching / difusión, según tags) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (dialecto iraquí) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (según tags) |
| Tamano del repositorio | ~1,5 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Voice ID | `habibi/ar-irq` |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una instancia de F5-TTS, un sistema de síntesis de voz basado en flow matching con un transformer como backbone, que genera mel-espectrogramas condicionados por texto y una referencia de audio. Los tags del repositorio incluyen `f5tts` y `onnx`, lo que indica que el checkpoint se ha exportado a ONNX para su ejecución con la librería `phoonnx`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF/DPO no aplica a TTS en este contexto) ni innovaciones técnicas específicas de esta variante. La model card únicamente referencia el repositorio origen `Phoonnx/phoonnx-f5tts` y la subcarpeta `habibi-tts-irq`, sin aportar detalles adicionales sobre el entrenamiento o el proceso de conversión a ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en árabe iraquí.
- Generación de audio condicionada por una referencia de voz, según el paradigma F5-TTS.
- Integración con la librería `phoonnx` mediante el voice ID `habibi/ar-irq`.
- Ejecución mediante pesos en formato ONNX.
- Soporte multilingüe: no disponible (solo se declara árabe iraquí).
- Tool calling / function calling: no aplica.
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- **Locución automatizada en árabe iraquí**: el modelo permite generar voces sintéticas en dialecto iraquí para contenido editorial, audiolibros o vídeos, usando una referencia de voz para controlar el timbre.
- **Accesibilidad para hablantes de árabe iraquí**: conversión de texto a voz para lectores de pantalla o asistentes dirigidos a usuarios que hablan este dialecto, donde los modelos MSA estándar suenan artificiales.
- **Doblaje y localización de contenido**: generación de pistas de voz en iraquí para vídeos o cursos, con la posibilidad de clonar una voz de referencia para mantener consistencia entre segmentos.
- **Sistemas de respuesta vocal interactiva (IVR)**: integración en centralitas telefónicas o asistentes de voz para atención al cliente en árabe iraquí, ejecutando el modelo ONNX en servidores con `phoonnx`.
- **Prototipado de interfaces conversacionales**: desarrollo de demos y pruebas de concepto de asistentes de voz en dialecto iraquí sin depender de APIs propietarias, gracias a la licencia Apache-2.0.
- **Investigación en TTS dialectal**: uso del checkpoint como base para experimentos de fine-tuning o evaluación de síntesis en variedades del árabe poco representadas en corpus TTS públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (~1,5 GB) sugiere que el modelo cabe en GPUs de consumo con al menos 4-6 GB de VRAM en formato ONNX, pero no hay confirmación oficial.
- GPU recomendadas: no disponible. Por tamaño, es plausible su ejecución en RTX 3060/4060 o superiores, pero no está documentado.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no hay datos oficiales.
- Opciones de despliegue: librería `phoonnx` (según la model card); runtime ONNX (ONNX Runtime) como backend subyacente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| f5tts-habibi-tts-irq | no disponible | no disponible | árabe (iraquí) | Apache-2.0 | ONNX |
| F5-TTS (base) | no disponible | no disponible | multilingüe (según checkpoint) | MIT / CC-BY (según variante) | safetensors, ONNX |
| XTTS-v2 (Coqui) | ~467 M | no disponible | 17 idiomas | Coqui Public Model License | safetensors |
| Bark (Suno) | ~1 B | no disponible | multilingüe | MIT | PyTorch |

La comparativa se ofrece a título orientativo: los datos de F5-TTS base, XTTS-v2 y Bark provienen de sus respectivas model cards públicas y no de la información proporcionada para este checkpoint. No hay benchmarks comparativos disponibles para f5tts-habibi-tts-irq.

## Limitaciones y advertencias

- **Idioma restringido**: el modelo está especializado en árabe iraquí; su rendimiento en árabe estándar (MSA) u otros dialectos no está documentado y probablemente sea deficiente.
- **Ausencia de benchmarks**: no hay métricas publicadas de calidad (MOS, WER, similitud de voz), lo que impide evaluar su rendimiento frente a alternativas.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o ruido en entradas fuera de distribución.
- **Sesgos**: no hay información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, edad o acento en las voces generadas.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo original Habibi-TTS antes de explotarlo en producción.
- **Ecosistema joven**: depende de la librería `phoonnx`, con 0 descargas y 0 likes en el momento de la consulta; la madurez y el soporte a largo plazo no están garantizados.
- **Documentación mínima**: la model card no detalla parámetros, contexto, cuantizaciones ni requisitos de hardware, lo que dificulta la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-habibi-tts-irq
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-f5tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
