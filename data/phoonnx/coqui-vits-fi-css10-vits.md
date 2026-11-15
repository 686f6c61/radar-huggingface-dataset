# Phoonnx/coqui-vits-fi-css10-vits

## Resumen

`coqui-vits-fi-css10-vits` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, derivado del modelo `coqui/fi-css10-vits` del ecosistema Coqui. Se distribuye como un artefacto ONNX empaquetado para su uso con la librería `phoonnx`, un runtime de inferencia de TTS mantenido en el repositorio TigreGotico/phoonnx. El modelo está entrenado sobre el corpus CSS10 para finlandés (`fi-FI`), por lo que su función es convertir texto en finés en audio hablado.

El modelo forma parte de una colección más amplia (`Phoonnx/phoonnx-coqui-vits`) que agrupa múltiples voces Coqui VITS convertidas a ONNX para su despliegue ligero. La relevancia práctica es la de ofrecer una voz finlandesa lista para inferencia en entornos sin dependencias pesadas de Python o de frameworks de deep learning completos, gracias al formato ONNX. La licencia BSD-3-Clause permite uso comercial con atribución.

La información pública disponible es muy escasa: el repositorio tiene 0 descargas y 0 likes, el tamaño es de aproximadamente 0,1 GB y la model card se limita a indicar el origen, la licencia y el identificador de voz. No se publican métricas de calidad, datos de entrenamiento detallados ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la longitud de entrada depende del texto a sintetizar) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | finlandés (fi-FI), según el identificador de voz y el corpus CSS10 |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (runtime `phoonnx`) |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Corpus de entrenamiento | CSS10 (finlandés) |
| Identificador de voz | `coqui/fi-css10-vits` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS produce audio de forma directa a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este repositorio el modelo se distribuye ya exportado a ONNX, de modo que la inferencia se realiza mediante el runtime `phoonnx` en lugar de la pila original de Coqui.

El entrenamiento se realizó sobre el corpus CSS10 en su partición finlandesa, un conjunto de audiolibros de dominio público con alineaciones a nivel de frase. No se dispone de información sobre el número de tokens, horas de audio, composición exacta del dataset, ni sobre si se aplicaron etapas de ajuste fino adicionales. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de VITS y de la conversión a ONNX.

## Capacidades

- Síntesis de voz a partir de texto en finlandés (fi-FI).
- Generación de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Inferencia mediante ONNX a través de la librería `phoonnx`, lo que permite despliegue ligero.
- Integración con el ecosistema de voces Coqui empaquetadas por Phoonnx mediante el identificador `coqui/fi-css10-vits`.
- No se documenta soporte de control de estilo, emoción, clonación de voz ni multihablante.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- Capacidades multilingües: no disponibles; el modelo está orientado a finlandés.

## Casos de uso

- **Locución de audiolibros en finlandés**: el modelo puede sintetizar pasajes largos de texto finlandés para producir audiolibros, aprovechando que VITS genera audio de forma directa y con una latencia baja por frase.
- **Accesibilidad web para contenido en finés**: integración en lectores de pantalla o extensiones de navegador que conviertan artículos en finés a voz, usando la exportación ONNX para ejecución en el cliente sin dependencias de Python.
- **Asistentes de voz para mercados finlandeses**: generación de respuestas habladas en finés en asistentes conversacionales o sistemas IVR, donde el tamaño reducido del modelo (~0,1 GB) facilita el despliegue en servidores modestos.
- **Sistemas de navegación y avisos hablados**: producción de indicaciones de voz en finlandés para aplicaciones de mapas o dispositivos embebidos, aprovechando la portabilidad de ONNX a plataformas con recursos limitados.
- **Generación de contenido educativo**: creación de material didáctico audio en finés para cursos de idiomas o formación corporativa, con síntesis por lotes de guiones de texto.
- **Prototipado de productos de voz**: uso del modelo como voz de referencia en pruebas de concepto de aplicaciones TTS en finés, dado que la licencia BSD-3-Clause permite integración comercial sin fricción.
- **Investigación en TTS finlandés**: comparación de la calidad de VITS frente a otros sistemas en finlandés, sirviendo como baseline reproducible en formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (~0,1 GB) sugiere un modelo pequeño que probablemente cabe en GPU consumer, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por el tamaño del artefacto ONNX es plausible su ejecución en CPU y en GPU de gama baja, pero no hay datos oficiales.
- Opciones de despliegue: runtime `phoonnx` (https://github.com/TigreGotico/phoonnx); al ser ONNX, podría ejecutarse con ONNX Runtime, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coqui-vits-fi-css10-vits (este modelo) | fi-FI | VITS | ONNX | BSD-3-Clause | Hugging Face (Phoonnx) |
| coqui/fi-css10-vits (origen) | fi-FI | VITS | Coqui checkpoint | BSD-3-Clause | Repositorio Coqui |
| Otras voces de Phoonnx/phoonnx-coqui-vits | múltiples según carpeta | VITS | ONNX | según fuente | Hugging Face (Phoonnx) |
| Alternativas TTS multilingües comerciales | múltiples | variable | variable | propietaria | APIs comerciales |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no hay métricas de calidad, muestras de audio ni documentación de entrenamiento más allá del corpus CSS10.
- El modelo está limitado al finlandés; no se documenta soporte de otros idiomas.
- Al derivar de un corpus de audiolibros (CSS10), la voz puede presentar un estilo de locución literaria poco adecuado para dominios conversacionales.
- Riesgo de errores de pronunciación en nombres propios, siglas y términos extranjeros, habitual en sistemas TTS entrenados con corpus limitados.
- No se documentan sesgos específicos, pero al ser un modelo de voz única puede no representar diversidad de hablantes.
- Licencia BSD-3-Clause: permite uso comercial con atribución; conviene conservar el aviso de copyright y la licencia original del repositorio fuente.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad; conviene evaluar la calidad de audio antes de usarlo en producción.
- No se documenta compatibilidad con otros runtimes distintos de `phoonnx`, aunque el formato ONNX podría permitir alternativas no verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-fi-css10-vits
- Colección de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo Coqui original (referencia): `coqui/fi-css10-vits`
- Corpus CSS10: no disponible en la información proporcionada.
