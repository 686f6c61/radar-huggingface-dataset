# mohamedrayyan/mms-tts-div-finetuned-md-f03

## Resumen

El modelo `mohamedrayyan/mms-tts-div-finetuned-md-f03` es un checkpoint de síntesis de voz (text-to-speech) en dhivehi, la lengua oficial de Maldivas, desarrollado por el autor mohamedrayyan como parte del proyecto Chatterbox TTS Dhivehi. Se trata de un fine-tuning del modelo base `facebook/mms-tts-div`, que a su vez pertenece a la familia MMS (Massively Multilingual Speech) de Meta, basado en la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech).

El modelo resuelve el problema de la falta de voces sintéticas de calidad en dhivehi, un idioma con pocos recursos digitales. Su relevancia radica en que ofrece una voz femenina (variante f03) entrenada específicamente para este idioma, con licencia MIT, lo que permite su uso comercial sin restricciones. Con 36,3 millones de parámetros y un tamaño de repo de 0,1 GB, es ligero y desplegable en entornos con recursos limitados.

El checkpoint se publica junto a otras variantes (voces femeninas, masculinas y clonadas) y exportaciones cuantizadas y ONNX, lo que facilita su integración en aplicaciones de producción. La arquitectura VITS permite una síntesis de voz de alta calidad con inferencia de una sola etapa, sin necesidad de vocoder externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end TTS) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador del modelo base, típicamente frases cortas) |
| Tipos de cuantizacion | no disponible en este repo; se mencionan exportaciones cuantizadas en otros repos del proyecto |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un decodificador de flujo normalizador y un discriminador adversarial, todo entrenado de forma conjunta. VITS genera audio directamente desde el texto, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. El checkpoint es un fine-tuning del modelo `facebook/mms-tts-div`, que ya había sido preentrenado por Meta en dhivehi como parte del proyecto MMS. El fine-tuning se realizó con datos de voz en dhivehi, presumiblemente de un locutor femenino (variante f03), aunque no se especifican detalles del dataset de entrenamiento, número de épocas ni configuración de hiperparámetros en la información disponible.

No se han publicado detalles sobre el proceso de entrenamiento (tokens, composición del dataset, uso de RLHF/DPO) en la model card. La arquitectura VITS es conocida por su eficiencia y calidad, y el fine-tuning sobre un modelo MMS ya entrenado en el idioma objetivo suele requerir relativamente pocos datos para adaptar la voz.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, con voz femenina (variante f03).
- Generación de audio en formato waveform directamente desde el modelo, sin necesidad de vocoder externo.
- Integración sencilla con la librería Transformers de HuggingFace mediante `VitsModel` y `AutoTokenizer`.
- Soporte de inferencia con PyTorch y `torch.no_grad()` para reducir consumo de memoria.
- Compatible con exportaciones ONNX y cuantizadas publicadas en otros repos del proyecto, lo que permite despliegue en entornos con restricciones de recursos.
- No incluye capacidades de tool calling, agentes, razonamiento ni visión; es un modelo puramente de síntesis de voz.

## Casos de uso

- **Aplicaciones de accesibilidad para hablantes de dhivehi**: el modelo puede convertir texto escrito en dhivehi en audio para personas con discapacidad visual o dificultades de lectura, integrándose en lectores de pantalla o aplicaciones de accesibilidad.
- **Asistentes de voz en dhivehi**: puede servir como motor TTS en asistentes virtuales o chatbots que atiendan a usuarios de Maldivas, proporcionando respuestas habladas en su idioma nativo.
- **Audiolibros y contenido educativo**: permite generar narraciones en dhivehi para libros electrónicos, materiales de aprendizaje o cursos online, reduciendo el coste de producción frente a locutores humanos.
- **Sistemas de información pública**: puede utilizarse en aeropuertos, estaciones de transporte o servicios gubernamentales para anuncios automáticos en dhivehi, mejorando la accesibilidad de la información.
- **Aplicaciones de aprendizaje de idiomas**: el modelo puede generar ejemplos de pronunciación en dhivehi para estudiantes, integrándose en aplicaciones de idiomas o plataformas de intercambio lingüístico.
- **Doblaje automático de vídeos**: puede emplearse para doblar contenido audiovisual al dhivehi, por ejemplo en vídeos corporativos, tutoriales o noticias, siempre que se respete la licencia MIT y se indique la autoría si se requiere.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas de calidad de voz (MOS, WER, etc.) ni comparaciones con otros modelos TTS en dhivehi en la model card ni en los resultados de búsqueda. Se recomienda evaluar el modelo de forma subjetiva con audios de muestra (disponibles en `samples_mms/` del repositorio del proyecto) antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 36 millones de parámetros, la inferencia puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 1-2 GB). En GPU, cabe en cualquier tarjeta con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3060 o superiores. También funciona en Apple Silicon (M1/M2) mediante PyTorch.
- **Compatibilidad con consumer GPU**: sí, el modelo es ligero y puede ejecutarse en GPUs de gama media e incluso en CPU.
- **Opciones de despliegue**: se puede servir mediante la API de HuggingFace Inference, o desplegar con vLLM (aunque no es lo habitual para TTS), o mediante un servidor FastAPI que cargue el modelo y exponga un endpoint REST. También se puede exportar a ONNX para inferencia con ONNX Runtime.
- **Latencia y throughput**: no se han publicado datos concretos. En una GPU moderna, la generación de un audio de 5 segundos suele tardar menos de 1 segundo, pero depende de la longitud del texto y del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-div-finetuned-md-f03` | VITS | 36,3 M | no disponible | dv | MIT | HuggingFace |
| `facebook/mms-tts-div` | VITS | 36,3 M (aprox.) | no disponible | dv | MIT | HuggingFace |
| `facebook/mms-tts` (modelo base multilingüe) | VITS | 36,3 M (aprox.) | no disponible | 1100+ idiomas | CC-BY-NC 4.0 | HuggingFace |

El modelo fine-tuned se diferencia del base `facebook/mms-tts-div` en que ha sido ajustado para producir una voz femenina específica (f03), mientras que el base probablemente genera una voz genérica. La licencia MIT del fine-tune permite uso comercial sin restricciones, a diferencia del modelo base multilingüe de Meta que usa CC-BY-NC. No se dispone de comparativas de calidad objetiva entre ambos.

## Limitaciones y advertencias

- **Sesgos y calidad de voz**: al ser un fine-tuning sobre un modelo preentrenado, la calidad de la voz depende de los datos de entrenamiento. No se han publicado evaluaciones de naturalidad ni de inteligibilidad.
- **Riesgo de alucinación**: en TTS, el riesgo de alucinación se manifiesta como errores de pronunciación o entonación en palabras poco frecuentes o nombres propios. No se han documentado casos específicos.
- **Limitaciones de contexto**: el modelo está diseñado para frases cortas o párrafos breves. Textos muy largos pueden degradar la calidad o requerir segmentación previa.
- **Idioma**: solo soporta dhivehi. No es adecuado para otros idiomas, aunque el tokenizador podría aceptar texto en otros alfabetos, la pronunciación sería incorrecta.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo base `facebook/mms-tts-div` (también MIT) y del proyecto MMS de Meta, que puede tener condiciones adicionales para ciertos usos.
- **Caveat de producción**: no se han publicado métricas de latencia ni de throughput. Antes de desplegar en producción, es necesario realizar pruebas de carga y validar la calidad del audio con hablantes nativos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mohamedrayyan/mms-tts-div-finetuned-md-f03)
- [Modelo base facebook/mms-tts-div](https://huggingface.co/facebook/mms-tts-div)
- [Proyecto Chatterbox TTS Dhivehi](https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi)
- [Lista de fine-tunes de facebook/mms-tts-div](https://huggingface.co/models?other=base_model:finetune:facebook/mms-tts-div)
- [Modelo relacionado mms-tts-div-finetuned-md-f02 en AlphaNeural AI](https://alphaneural.io/assets/Serialtechlab/mms-tts-div-finetuned-md-f02)
