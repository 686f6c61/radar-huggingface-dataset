# junkstage/kikiri-de

## Resumen

kikiri-de es un modelo de síntesis de voz (text-to-speech) en alemán desarrollado por el usuario junkstage. Está construido sobre la arquitectura Kokoro-82M, que a su vez deriva de StyleTTS-2, pero entrenado desde cero específicamente para el idioma alemán. Con aproximadamente 81 millones de parámetros y un tamaño de repositorio de 0,7 GB, se posiciona como un modelo ligero y desplegable en hardware modesto, orientado a la generación de voz natural en alemán con voces predefinidas.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y sigue una política de versionado estricta mediante etiquetas (tags) inmutables. La versión actual, `v3.0`, corresponde al export del epoch_0006 (paso 220.401) e incluye dos voces: `Heinrich` y `Anna`. El código de inferencia asociado, `kikiri-german-inference`, incorpora marcado de agua con AudioSeal y etiquetado de metadatos como audio generado por IA, en cumplimiento del Reglamento Europeo de IA (artículo 50).

La relevancia de este modelo radica en su enfoque en un idioma específico (alemán) con un tamaño reducido, lo que permite su ejecución en entornos con recursos limitados, y en su compromiso explícito con la transparencia y la trazabilidad del contenido sintético.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M / StyleTTS-2 |
| Parámetros totales | 81.126.738 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kokoro-82M, una variante de StyleTTS-2 optimizada para eficiencia. StyleTTS-2 es un modelo de síntesis de voz que combina un codificador de estilo, un decodificador basado en difusión y un discriminador adversarial para generar audio de alta calidad. Kokoro reduce el tamaño y la complejidad manteniendo la calidad, lo que permite su despliegue en hardware de consumo.

El entrenamiento se realizó desde cero para el alemán utilizando el corpus HUI-Audio-Corpus-German, complementado con datos generados por Qwen-TTS. El modelo incorpora pesos de PL-BERT-de, que fueron ajustados finamente durante el entrenamiento. No se especifica el número total de tokens de audio ni la composición exacta del dataset. Tampoco se detalla si se emplearon técnicas como RLHF o DPO, aunque en el contexto de TTS no son habituales. La innovación principal es la adaptación de la arquitectura Kokoro a un idioma concreto con un conjunto de voces preentrenadas y un sistema de versionado que garantiza la reproducibilidad.

## Capacidades

- Generación de voz en alemán a partir de texto (text-to-speech).
- Dos voces predefinidas: `Heinrich` (masculina) y `Anna` (femenina), con vectores de estilo de 256 dimensiones.
- Soporte para frases largas y complejas, incluyendo puntuación y signos de exclamación.
- Marcado de agua con AudioSeal en el audio generado, lo que permite detectar su origen sintético.
- Etiquetado de archivos WAV con metadatos que indican que son generados por IA.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo más allá del alemán.

## Casos de uso

- **Atención al cliente automatizada en alemán**: el modelo puede generar respuestas de voz naturales para sistemas IVR o asistentes telefónicos, gracias a su ligereza y a la disponibilidad de dos voces que permiten alternar géneros según el contexto.
- **Generación de audiolibros y contenido narrado**: con la voz `Heinrich` o `Anna`, se pueden sintetizar textos largos en alemán para crear audiolibros, pódcast o artículos narrados, con la ventaja de que el marcado de agua garantiza la trazabilidad.
- **Accesibilidad web y aplicaciones**: integración en lectores de pantalla o aplicaciones de accesibilidad para convertir texto en voz en alemán, con un modelo que cabe en hardware modesto y se puede ejecutar localmente.
- **Producción de vídeos y multimedia**: generación de locuciones para vídeos corporativos, tutoriales o contenido educativo en alemán, con la posibilidad de elegir entre dos voces y ajustar el estilo mediante vectores.
- **Prototipado rápido de interfaces de voz**: para desarrolladores que necesitan probar interacciones de voz en alemán sin depender de servicios en la nube, el modelo se puede desplegar en local con el código de inferencia proporcionado.
- **Investigación en síntesis de voz**: como modelo de referencia para experimentos con arquitecturas Kokoro/StyleTTS-2 en alemán, gracias a su licencia permisiva y a la documentación de versiones y pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 81 millones de parámetros, la inferencia requiere aproximadamente 0,5-1 GB de VRAM en precisión FP32, y menos de 500 MB en FP16. Cabe en cualquier GPU consumer moderna.
- **GPU recomendadas**: funciona en GPU integradas, GTX 1650, RTX 3050, RTX 4090, A100, H100, etc. No se requiere hardware de gama alta.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU (aunque con mayor latencia).
- **Opciones de despliegue**: el código oficial es `kikiri-german-inference` (basado en Python). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kikiri-de | 81 M | No disponible | Alemán | Apache 2.0 | Hugging Face |
| Kokoro-82M | 82 M | No disponible | Inglés (principalmente) | Apache 2.0 | Hugging Face |
| StyleTTS-2 | ~80 M (variable) | No disponible | Inglés | MIT (código) | GitHub |
| Qwen-TTS | No disponible | No disponible | Multilingüe | No disponible | No disponible |

kikiri-de se diferencia de Kokoro-82M por estar entrenado desde cero para alemán, mientras que Kokoro se centra en inglés. Frente a StyleTTS-2, kikiri-de es una adaptación específica con voces preentrenadas y un sistema de versionado. Qwen-TTS se menciona como generador de datos de entrenamiento, pero no se dispone de especificaciones para comparar.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos, pero al entrenarse con un corpus alemán, puede reflejar sesgos regionales o culturales presentes en los datos.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en errores de pronunciación o entonación en palabras poco frecuentes o extranjeras.
- **Limitaciones de contexto o idioma**: el modelo solo soporta alemán. No se especifica la longitud máxima de texto de entrada, pero al ser un modelo ligero, es probable que tenga límites en la duración de las secuencias.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor exige que se mantenga el marcado de agua AudioSeal y se etiquete el audio como generado por IA. El uso con otro código queda bajo responsabilidad del usuario.
- **Caveats para producción**: el modelo no incluye el codificador de estilo en `model.safetensors`, por lo que no se pueden crear nuevas voces con ese archivo. Las voces están vinculadas a un export concreto y el código rechaza voces de otros exports. Además, el autor desaconseja explícitamente el uso para suplantación o desinformación.

## Enlaces

- [Hugging Face: junkstage/kikiri-de](https://huggingface.co/junkstage/kikiri-de)
- [Repositorio de inferencia: kikiri-german-inference](https://github.com/ichDaheim/kikiri-german-inference)
- [AudioSeal (marcado de agua)](https://github.com/facebookresearch/audioseal)
