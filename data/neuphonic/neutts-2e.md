# neuphonic/neutts-2e

## Resumen

NeuTTS-2e es un modelo de síntesis de voz (text-to-speech) expresivo desarrollado por Neuphonic, publicado en Hugging Face bajo licencia Apache 2.0 y con acceso restringido que requiere aceptar condiciones en la plataforma. El modelo se presenta como un sistema TTS orientado a la emoción, con etiquetas explícitas de "emotion" y "expressive-tts", lo que indica que su propuesta de valor es generar habla con control o modulación emocional, no solo voz neutra.

Con 236 millones de parámetros y un repositorio de 0,5 GB en formato safetensors, se trata de un modelo compacto, lo que lo sitúa en la franja de sistemas TTS desplegables en hardware modesto. La arquitectura declarada se apoya en Qwen3, según los tags del repositorio, lo que sugiere un backbone de tipo transformer derivado de la familia Qwen3 adaptado a la tarea de síntesis de voz.

Su relevancia actual radica en dos factores: la licencia Apache 2.0, poco habitual en modelos TTS de calidad con control emocional, y su tamaño reducido, que facilita despliegues locales y en producción sin depender de APIs propietarias. No obstante, la información pública disponible en la ficha de Hugging Face es escasa en cuanto a arquitectura detallada, datos de entrenamiento y benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (backbone transformer) adaptada a text-to-speech; detalles internos no disponibles |
| Parametros totales | 236.039.680 (~236 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8 en la informacion disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que NeuTTS-2e emplea una arquitectura basada en Qwen3, es decir, un backbone de tipo transformer de la familia Qwen3 reutilizado o adaptado para la generación de audio en lugar de texto. El modelo tiene 236 millones de parámetros, un tamaño coherente con sistemas TTS neuronales compactos que priorizan latencia y facilidad de despliegue sobre capacidad generativa masiva.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. Tampoco se documentan en la información proporcionada las técnicas concretas de condicionamiento emocional ni el vocoder o decoder de audio empleado. Estos datos deben considerarse no disponibles.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Generación de habla expresiva con control o modulación emocional, según los tags "emotion", "emotions", "expressive-tts" y "emotional-tts".
- Integración en pipelines de TTS mediante la pipeline `text-to-speech` de Hugging Face.
- Capacidades multilingües: limitadas al inglés según la ficha del modelo.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es su función).
- Capacidades especiales documentadas: expresividad emocional; otras (clonación de voz, control de prosodia, streaming) no disponibles en la información proporcionada.

## Casos de uso

- Audiolibros y narración expresiva: el modelo puede generar narraciones con modulación emocional, adecuado para ficción o contenido donde el tono importa, gracias a su orientación explícita a TTS emocional.
- Asistentes de voz y agentes conversacionales: al ser un TTS compacto (236 M de parámetros) en inglés, puede integrarse como capa de síntesis en asistentes locales o embebidos donde el coste por inferencia es crítico.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de accesibilidad, con la ventaja de una licencia Apache 2.0 que permite redistribución.
- Generación de contenido para medios: producción de voces para vídeos, pódcasts o demos, aprovechando el control emocional para ajustar el registro del habla.
- Prototipado e investigación en TTS: su tamaño reducido y licencia permisiva lo hacen útil como base para experimentación académica o fine-tuning sobre dominios específicos.
- Integración en aplicaciones de atención al cliente: síntesis de respuestas en inglés con tono adecuado al contexto, desplegable en infraestructura propia sin dependencia de APIs de terceros.
- Videojuegos y experiencias interactivas: generación de diálogo de personajes con carga emocional en tiempo de ejecución, viable por el bajo coste computacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 236 M de parámetros en safetensors (aproximadamente 0,5 GB de pesos en precisión original), la inferencia requiere del orden de 0,5 a 2 GB de VRAM según precisión y overhead del runtime; cifra exacta no disponible.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 4 GB o más de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: pipeline `text-to-speech` de Hugging Face Transformers; soporte para vLLM, llama.cpp, Ollama o TGI no disponible (estos runtimes no están orientados a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas TTS de tamaño o tarea similares.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Idioma: solo se declara soporte de inglés; el uso en castellano u otros idiomas no está garantizado.
- Sesgos: no documentados; al ser un modelo de voz entrenado presumiblemente con datos en inglés, puede reproducir sesgos acentuales, de género o demográficos no especificados.
- Riesgo de alucinación: en TTS se traduce en artefactos de audio, pronunciaciones incorrectas o prosodia anómala en textos fuera de distribución; no cuantificado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones adicionales del acceso gated.
- Caveats para producción: ausencia de benchmarks publicados, de documentación sobre latencia y de especificaciones de cuantización; se recomienda validación propia antes de desplegar.
- Uso responsable: la síntesis de voz expresiva puede emplearse para suplantación o desinformación; no se documentan mecanismos de marca de agua o mitigación.

## Enlaces

- Hugging Face: https://huggingface.co/neuphonic/neutts-2e
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
