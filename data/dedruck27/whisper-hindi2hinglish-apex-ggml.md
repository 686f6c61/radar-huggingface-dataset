# dedruck27/whisper-hindi2hinglish-apex-ggml

## Resumen

Whisper Hindi2Hinglish Apex GGML es una conversión al formato GGML del modelo Oriserve/Whisper-Hindi2Hinglish-Apex, un ajuste fino de Whisper large-v3-turbo especializado en transcribir habla en hindi y hindi-inglés como Hinglish en escritura latina. El autor de esta conversión es dedruck27, que se limita a cambiar el formato de los pesos originales para hacerlos compatibles con whisper.cpp; todo el mérito del modelo subyacente corresponde a Oriserve.

El modelo resuelve un problema concreto: la transcripción automática de conversaciones bilingües hindi-inglés (code-switching habitual en la India) produciendo directamente texto en caracteres romanos en lugar de devanagari, lo que facilita su integración en aplicaciones de documentación, subtitulado o asistentes que operan en ese registro lingüístico. Al estar cuantizado a q5_0 y ocupar 547 MB, reduce drásticamente los requisitos de memoria frente a los pesos originales en bfloat16 y permite ejecución en CPU mediante whisper.cpp.

La relevancia actual reside en su carácter práctico: es un artefacto listo para desplegar en entornos sin GPU, orientado a un caso de uso específico (documentación clínica offline en consultas externas, según el repositorio OPD Scribe del propio autor) y con una licencia Apache-2.0 heredada del modelo base. No introduce innovaciones arquitectónicas; su valor es la portabilidad del formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), conversión GGML |
| Parámetros totales | no disponible (hereda los de Whisper large-v3-turbo; no se indica cifra en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no se especifica en la información proporcionada) |
| Tipos de cuantización | q5_0 (único archivo publicado) |
| Idiomas soportados | hi, en (salida en Hinglish con escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (archivo `ggml-hinglish-apex-q5_0.bin`, 547 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo, un transformer encoder-decoder para reconocimiento automático del habla que procesa audio en ventanas y genera texto de forma autorregresiva. El modelo original de Oriserve es un ajuste fino de esa base sobre habla hindi con acento indio y code-switching hindi-inglés, entrenado para producir salida en Hinglish romanizado en lugar de devanagari. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución de este repositorio es exclusivamente de formato: se descargaron los pesos oficiales en bfloat16, se convirtieron todos los tensores a float32 (el script de conversión de whisper.cpp no lee bfloat16), se transformaron con `models/convert-h5-to-ggml.py` de whisper.cpp v1.9.5 generando una salida f16, y finalmente se cuantizaron a q5_0 con `whisper-quantize` de la misma etiqueta de versión. No hay reentrenamiento ni modificación de pesos más allá de la cuantización.

## Capacidades

- Transcripción de voz a texto (ASR) para habla en hindi y hindi-inglés.
- Generación de salida en Hinglish con escritura latina (romanizada), no en devanagari.
- Manejo de code-switching hindi-inglés dentro de una misma locución.
- Ejecución en CPU mediante whisper.cpp, sin requerir GPU.
- Uso offline: el binario y el modelo funcionan de forma local, sin llamadas a servicios externos.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modos de razonamiento extendido.

## Casos de uso

- Documentación clínica offline en consultas externas: el modelo transcribe las consultas dictadas en hindi o hindi-inglés a Hinglish romanizado, que luego se integra en un asistente de documentación (OPD Scribe). Es adecuado por su ejecución local sin GPU y su orientación al registro lingüístico del personal sanitario indio, aunque requiere revisión clínica obligatoria.
- Subtitulado de contenido audiovisual bilingüe hindi-inglés: permite generar subtítulos en caracteres latinos directamente, evitando un paso posterior de transliteración desde devanagari.
- Transcripción de reuniones y entrevistas con participantes que alternan hindi e inglés: el modelo mantiene la coherencia del code-switching en una sola pasada.
- Prototipado de asistentes de voz en entornos con recursos limitados: al ocupar 547 MB en q5_0, cabe en máquinas modestas y permite iterar sin infraestructura GPU.
- Archivado y búsqueda de audio en organizaciones indias: transcripción masiva en CPU de grabaciones históricas para indexación textual en Hinglish.
- Aplicaciones de accesibilidad para hablantes de Hinglish: dictado y conversión a texto en dispositivos de gama baja mediante whisper.cpp.
- Investigación en ASR multilingüe: como referencia cuantizada y portable para comparar el comportamiento del ajuste fino de Oriserve frente a Whisper base en tareas de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el formato GGML q5_0 está pensado para ejecución en CPU; el archivo ocupa 547 MB en disco y la memoria RAM necesaria es del orden de ese tamaño más el overhead del runtime (no cuantificado en la información proporcionada).
- GPU recomendadas: no se especifican; al ser una conversión GGML para whisper.cpp, el escenario objetivo es CPU. Cualquier GPU compatible con whisper.cpp podría usarse, pero no se documenta.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se aporta confirmación ni modelo concreto en la información disponible.
- Opciones de despliegue: whisper.cpp v1.9.5 (`whisper-cli`). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dedruck27/whisper-hindi2hinglish-apex-ggml | no disponible (base large-v3-turbo) | no disponible | hi, en (salida Hinglish) | GGML q5_0 | Apache-2.0 | Hugging Face, 0 descargas |
| Oriserve/Whisper-Hindi2Hinglish-Apex | no disponible (base large-v3-turbo) | no disponible | hi, en (salida Hinglish) | safetensors bfloat16 | Apache-2.0 | Hugging Face (modelo base) |
| Whisper large-v3-turbo (OpenAI) | no disponible en la información proporcionada | no disponible | multilingüe | múltiples | no disponible en la información proporcionada | amplia |

La comparación relevante es con el modelo base de Oriserve: misma arquitectura y mismos pesos efectivos, pero en bfloat16 y sin cuantizar, lo que implica mayor huella de memoria y dependencia de frameworks tipo PyTorch o Transformers. Frente a Whisper large-v3-turbo genérico, la diferencia es la especialización en salida Hinglish romanizada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está ajustado sobre habla hindi general con acento indio, no sobre habla médica; los nombres de fármacos y términos técnicos suelen transcribirse por sonido (el autor cita "Placlytaxel" en lugar de "paclitaxel").
- Cualquier transcripción destinada a documentación clínica debe ser revisada y corregida por un profesional sanitario.
- El autor recomienda usar `-l en` en lugar de `-l hi`: con `-l hi` el resultado fue peor en sus pruebas y un clip no produjo texto.
- La cuantización q5_0 introduce una pérdida de precisión respecto a los pesos originales en bfloat16; no se documenta su impacto cuantitativo.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o audio de baja calidad; no se detalla en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se remite a la model card de Oriserve para condiciones y limitaciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción más allá de las pruebas del autor.
- Solo se publica un archivo q5_0; no hay otras cuantizaciones ni pesos en otros formatos en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dedruck27/whisper-hindi2hinglish-apex-ggml
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Proyecto OPD Scribe: https://github.com/ruck-syu/opd-scribe
