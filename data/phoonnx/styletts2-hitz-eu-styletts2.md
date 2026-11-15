# Phoonnx/styletts2-hitz-eu-styletts2

## Resumen

`Phoonnx/styletts2-hitz-eu-styletts2` es un paquete de pesos en formato ONNX derivado del repositorio agregador `Phoonnx/phoonnx-styletts2`, que a su vez recopila modelos StyleTTS2 adaptados al runtime [phoonnx](https://github.com/TigreGotico/phoonnx). La carpeta `hitz-eu-styletts2` contiene dos voces en euskera (identificadores `hitz/eu-antton` y `hitz/eu-maider`) procedentes del trabajo de HiTZ (Centro Vasco de Tecnología del Lenguaje) sobre StyleTTS2, incluyendo variantes base y con emoción.

El modelo resuelve un problema concreto: ofrecer síntesis de voz neuronal en euskera con un formato de pesos portable (ONNX) y una licencia permisiva (Apache-2.0), algo poco habitual en TTS de lenguas de baja densidad de recursos. No se trata de un modelo de lenguaje sino de un sistema de conversión texto-a-habla basado en la arquitectura StyleTTS2, que combina un codificador de estilo, un generador acústico y un vocoder neuronal para producir audio con control de prosodia y timbre.

La relevancia actual radica en su integración con phoonnx: al estar empaquetado como ONNX con identificadores de voz estables, puede desplegarse en entornos sin GPU dedicada y en pipelines de agentes conversacionales. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto recién publicado o de uso interno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con codificador de estilo y generador acústico) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; el runtime phoonnx puede aplicar optimizaciones propias) |
| Idiomas soportados | euskera (eu), según los identificadores de voz `hitz/eu-antton` y `hitz/eu-maider` |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que separa el contenido lingüístico del estilo prosódico mediante un codificador de estilo y un decodificador acústico entrenado con pérdidas adversarias y de reconstrucción. El modelo incorpora un vocoder neuronal para convertir los espectrogramas generados en forma de onda, lo que permite control fino de la entonación y del timbre del hablante. En esta ficha no se dispone de detalles sobre el número de parámetros, la composición del corpus de entrenamiento ni el volumen de horas de audio utilizadas por HiTZ.

El paquete distribuido por Phoonnx no contiene el entrenamiento original, sino una exportación a ONNX de los pesos de HiTZ para el runtime phoonnx. La model card indica que los archivos conservan las rutas del repositorio agregador `Phoonnx/phoonnx-styletts2`, lo que facilita la carga mediante los identificadores `hitz/eu-antton` y `hitz/eu-maider`. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ya que no aplican a un sistema TTS.

## Capacidades

- Síntesis de voz en euskera a partir de texto, con dos voces diferenciadas (`eu-antton` y `eu-maider`).
- Variantes con control de emoción, según la referencia del repositorio fuente a `hitz-eu-emo-styletts2`.
- Control de estilo prosódico inherente a StyleTTS2, que permite modular entonación y ritmo mediante el codificador de estilo.
- Ejecución en formato ONNX, compatible con el runtime phoonnx y con despliegues sin dependencia de PyTorch en producción.
- Integración como componente de pipelines de agentes conversacionales mediante los identificadores de voz del runtime.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- **Locución automatizada en euskera para medios digitales**: el modelo genera audio a partir de artículos o guiones con dos voces seleccionables, lo que permite producir versiones habladas de contenido escrito sin intervención humana y con una licencia Apache-2.0 compatible con uso comercial.
- **Asistentes de voz para administración pública vasca**: al soportar euskera y ejecutarse en ONNX, puede integrarse en sistemas de atención telefónica o kioscos que requieran síntesis local sin enviar texto a servicios en la nube.
- **Accesibilidad web**: conversión de contenido textual de portales institucionales en audio para personas con discapacidad visual, usando el runtime phoonnx para generar la locución en el servidor o en el cliente.
- **Generación de audiolibros y pódcast**: las dos voces permiten alternar narradores en una misma producción, y el control de estilo de StyleTTS2 facilita ajustar el tono según el género del contenido.
- **Prototipado de interfaces conversacionales**: los identificadores `hitz/eu-antton` y `hitz/eu-maider` permiten cambiar de voz mediante configuración, lo que acelera la evaluación de distintas personalidades de un asistente antes de fijar una voz definitiva.
- **Sistemas de navegación y avisos por voz en euskera**: integración en dispositivos embebidos gracias al formato ONNX y al tamaño reducido del repositorio (0,3 GB), que permite desplegar el modelo en hardware con recursos limitados.
- **Investigación en TTS para lenguas de bajos recursos**: el paquete sirve como punto de partida reproducible para comparar StyleTTS2 con otras arquitecturas en euskera, al estar los pesos disponibles con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB, por lo que el modelo es viable en GPUs con 4 GB o menos en función de la cuantización aplicada por el runtime.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, cabría esperar funcionamiento en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en CPU.
- Cabe en GPU de consumo: sí, presumiblemente, dado el tamaño del repositorio; no se especifican requisitos oficiales.
- Opciones de despliegue: runtime phoonnx (formato ONNX); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/styletts2-hitz-eu-styletts2 | StyleTTS2 | Euskera | ONNX | Apache-2.0 | Hugging Face (0 descargas) |
| Phoonnx/phoonnx-styletts2 (repositorio agregador) | StyleTTS2 | Múltiples (según carpeta) | ONNX | Apache-2.0 (según carpeta) | Hugging Face |
| StyleTTS2 original (yl4579/StyleTTS2) | StyleTTS2 | Inglés principalmente | PyTorch | MIT (según repositorio original) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo se documenta soporte para euskera; no hay evidencia de capacidades multilingües en esta carpeta.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento, nombres propios o neologismos.
- No se dispone de información sobre sesgos de género, edad o acento en las dos voces incluidas.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia del corpus de entrenamiento original de HiTZ para descartar restricciones adicionales sobre los datos.
- El repositorio no registra descargas ni likes, por lo que no hay validación comunitaria sobre la calidad del audio generado.
- No se documentan límites de longitud de texto de entrada; textos muy largos pueden requerir segmentación previa en el pipeline.
- La emoción solo está disponible en la variante `hitz-eu-emo-styletts2`, no en la carpeta base descrita aquí.

## Enlaces

- [Hugging Face: Phoonnx/styletts2-hitz-eu-styletts2](https://huggingface.co/Phoonnx/styletts2-hitz-eu-styletts2)
- [Repositorio agregador: Phoonnx/phoonnx-styletts2](https://huggingface.co/Phoonnx/phoonnx-styletts2)
- [Runtime phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
