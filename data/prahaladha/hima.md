# Prahaladha/hima

## Resumen
Hima es un modelo abierto de reconocimiento automático del habla (ASR) desarrollado por Prahaladha que convierte voz en texto para 11 lenguas de la India y para inglés. No es un modelo monolítico: combina el codificador de audio de Qwen3-ASR-1.7B, un puente pequeño nuevo y un decodificador basado en Gemma 3 270M, con una capa de voto que solo se usa durante el entrenamiento. El checkpoint publicado ocupa aproximadamente 2,4 GB y está pensado para clips de 1 a 30 segundos.

El proyecto es relevante porque aborda un hueco práctico: ASR abierto para asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil, telugu e inglés con un coste de inferencia bajo y ejecución local. Sin embargo, el entrenamiento sigue en marcha y el autor lo describe explícitamente como un checkpoint de investigación, no como un producto.

La información disponible no incluye el recuento total de parámetros, la composición del dataset ni resultados de benchmarks cerrados. El modelo no recibe la lengua de entrada como indicación, por lo que puede producir la transcripción en el alfabeto de otra lengua.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Speech-to-text modular: codificador de audio de Qwen3-ASR-1.7B + puente pequeño nuevo + decodificador Gemma 3 270M; capa de voto solo en entrenamiento |
| Parámetros totales | No disponible; checkpoint de aproximadamente 2,4 GB y repositorio de 63,3 GB con varios checkpoints |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible; ventana de audio recomendada de 1 a 30 s; no se entrenó con clips de más de 30 s |
| Tipos de cuantización | No disponible; no se publican variantes cuantizadas, solo pesos PyTorch |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en (11 lenguas de la India e inglés) |
| Licencia | Apache 2.0 para código, puente, capa de voto y cambios; Gemma 3 270M bajo Gemma Terms of Use; licencia compuesta apache-2.0-and-gemma |
| Formato de pesos | PyTorch `.pt` (`full/step_N/model.pt`); `config.json`, `pieces.json`, `scores.json`; no safetensors ni GGUF |

## Arquitectura y entrenamiento
Hima se organiza en cuatro piezas. El codificador de audio, llamado "ears" en la model card, se hereda de Qwen3-ASR-1.7B y transforma la señal de voz en representaciones. Un puente nuevo y pequeño adapta esas representaciones al decodificador, que parte de Gemma 3 270M y genera el texto pieza a pieza. La capa de voto es un componente auxiliar que solo se utiliza durante el entrenamiento.

El entrenamiento sigue en ejecución y se publica un checkpoint nuevo cada 10.000 pasos; el `config.json` raíz apunta al más reciente. Cada checkpoint incluye `scores.json` con la proporción de letras erróneas en un conjunto held-out por lengua, pero no se proporcionan cifras en la información consultada. No se especifican el número de tokens, la composición del dataset, el uso de RLHF/DPO ni los detalles del puente. La innovación principal es la reutilización de un codificador y un decodificador preentrenados con un puente ligero, lo que reduce el coste frente a entrenar un ASR completo desde cero.

## Capacidades
- Transcripción de voz a texto para clips cortos, con una ventana recomendada de 1 a 30 segundos.
- Cobertura de 11 lenguas de la India y inglés: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil, telugu e inglés.
- Salida en escritura nativa de la lengua detectada, aunque sin identificación explícita del idioma.
- Ejecución local mediante un script de transcripción y pesos PyTorch.
- Selección de checkpoints por número de paso para comparar versiones del entrenamiento.
- No se documenta traducción, diarización de hablantes, marcas de tiempo, streaming ni puntuación garantizada.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso; es un modelo específico de ASR.
- No dispone de visión, generación de audio, modo de pensamiento ni capacidades multimodales más allá de voz a texto.

## Casos de uso
- Transcripción de notas de voz cortas en atención al cliente: el modelo puede convertir mensajes de 1 a 30 segundos en texto para su clasificación posterior, gracias a su ventana de audio y a su cobertura de lenguas índicas.
- Subtitulado o documentación de clips breves: útil para generar borradores de transcripción de vídeos cortos, entrevistas o píldoras formativas, con revisión humana obligatoria por tratarse de un checkpoint de investigación.
- Encuestas y recogida de datos en campo: permite transcribir respuestas de voz breves en múltiples lenguas de la India en dispositivos locales, lo que facilita su análisis sin depender de servicios en la nube.
- Auditoría de calidad en centros de llamadas: puede convertir fragmentos cortos de llamadas en texto para búsqueda y revisión, aunque no ofrece diarización ni marcas de tiempo.
- Búsqueda por voz en aplicaciones para usuarios de lenguas índicas: adecuado para prototipos de dictado y comandos cortos, con la cautela de que el modelo no recibe la lengua como entrada.
- Documentación lingüística y creación de corpus: sirve para pretranscribir grabaciones cortas de campo y acelerar la anotación manual en lenguas con pocos recursos.
- Accesibilidad y dictado personal: puede utilizarse en herramientas locales de dictado de frases cortas para personas con movilidad reducida, siempre que se valide la precisión por lengua.
- Evaluación comparativa de ASR índico: los checkpoints periódicos permiten estudiar la evolución del entrenamiento y comparar el comportamiento entre lenguas con `scores.json`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor incluye `scores.json` con la proporción de letras erróneas por lengua en un conjunto held-out, pero no se proporcionan valores numéricos en la documentación consultada.

## Requisitos de hardware
- Pesos por checkpoint: aproximadamente 2,4 GB; el repositorio completo ocupa 63,3 GB por la acumulación de checkpoints.
- VRAM estimada para inferencia: orientativamente 4-6 GB para un clip corto, a partir del tamaño de los pesos; no es una cifra confirmada por el autor.
- GPU consumer: recomendable disponer de al menos 8 GB de VRAM, por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o RTX 4090. En GPUs de 6 GB puede ser ajustado.
- GPU de centro de datos: A100 o H100 para procesamiento por lotes; no se publican cifras de throughput.
- CPU: la inferencia es posible con PyTorch, pero no se documenta latencia ni rendimiento.
- Despliegue: el autor proporciona `scripts/transcribe.py` con PyTorch, torchaudio, `transformers>=5.13`, soundfile y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, ONNX o TensorRT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto o ventana | Idiomas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hima | No disponible; checkpoint de aproximadamente 2,4 GB | Audio de 1 a 30 s | 11 lenguas de la India e inglés | No disponible; sin benchmarks publicados en la información consultada | Apache 2.0 + Gemma Terms; licencia compuesta | HuggingFace; checkpoints de investigación por step |
| Whisper large-v3 | 1,55B | Audio de 30 s | 99 idiomas | No disponible en esta ficha | MIT | HuggingFace y repositorio openai/whisper |
| Qwen3-ASR-1.7B | 1,7B según el nombre del modelo | No disponible | No disponible | No disponible en esta ficha | Apache 2.0 | HuggingFace; usado como codificador de Hima |

## Limitaciones y advertencias
- Es un checkpoint de investigación con entrenamiento en curso; el autor no reclama resultados finales ni calidad de producción.
- El rendimiento varía mucho entre lenguas; es necesario consultar `scores.json` antes de evaluar una lengua concreta.
- El modelo no recibe la lengua de entrada como indicación y a veces transcribe un clip en el alfabeto de otra lengua.
- No se entrenó con clips de más de 30 segundos, por lo que las grabaciones largas deben dividirse.
- No se documentan diarización, marcas de tiempo, streaming, puntuación garantizada ni normalización textual.
- Riesgo de errores de sustitución, omisión e invención de texto, especialmente en nombres propios, números, cambios de código y audio ruidoso.
- No se publica la composición del dataset; no se pueden evaluar sesgos por lengua, dialecto, género o variante regional.
- La licencia es compuesta: el código y los componentes propios son Apache 2.0, pero Gemma 3 270M queda bajo Gemma Terms of Use, que restringen algunos usos. El checkpoint completo no es plenamente Apache 2.0.
- El repositorio es grande y descarga aproximadamente 2,4 GB en la primera ejecución del script; conviene planificar almacenamiento y ancho de banda.
- No hay garantías de seguridad ni de robustez para decisiones críticas; se recomienda revisión humana y validación por lengua antes de cualquier uso real.

## Enlaces
- HuggingFace: https://huggingface.co/Prahaladha/hima
- Repositorio de código y notas: https://github.com/Prahaladha-Reddy/hima
- Aviso de licencia NOTICE: https://huggingface.co/Prahaladha/hima/blob/main/NOTICE
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
