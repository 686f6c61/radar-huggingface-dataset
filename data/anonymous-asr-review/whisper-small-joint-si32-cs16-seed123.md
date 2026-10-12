# anonymous-asr-review/whisper-small-joint-si32-cs16-seed123

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) sobre el modelo base openai/whisper-small, publicado por el usuario anónimo anonymous-asr-review como material suplementario para revisión por pares. No es un modelo completo: incluye dos adaptadores entrenados de forma conjunta, uno de rango 32 orientado al sinhala y otro de rango 16 orientado al cambio de código (code-switching) sinhala-inglés, que deben activarse y combinarse a peso unitario para reproducir el sistema evaluado.

Whisper small es un transformer encoder-decoder de aproximadamente 244 millones de parámetros especializado en reconocimiento automático del habla sobre ventanas de audio de 30 segundos a 16 kHz. Los pesos de la base se descargan por separado desde OpenAI; este repositorio solo distribuye los pesos del adaptador en formato safetensors.

Su relevancia es doble: aborda el cambio de código sinhala-inglés, un fenómeno frecuente en el habla real de Sri Lanka y poco cubierto por los sistemas ASR multilingües, y sirve como artefacto reproducible para evaluar el entrenamiento conjunto de adaptadores por idioma y por tarea. La licencia no está declarada, lo que limita su uso comercial, y no se han publicado cifras de evaluación en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer encoder-decoder Whisper small |
| Parametros totales | Base: ~244 M (openai/whisper-small); adaptadores: no disponible (rango 32 para sinhala, rango 16 para code-switching) |
| Longitud de contexto | Ventana de audio de 30 s (1500 fotogramas de características log-mel) en el modelo base |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sinhala (si) e inglés (en), con énfasis en habla con cambio de código |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT); la base se descarga por separado |

Otros metadatos: semilla 123, LoRA alpha 32, selección de checkpoint "best", librería peft, tamaño del repositorio 0.0 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper small: un encoder-decoder tipo transformer que consume espectrogramas log-mel de 80 canales calculados sobre fragmentos de 30 segundos a 16 kHz, y genera texto de forma autorregresiva. Sobre esa base se aplican dos adaptadores LoRA. Según la model card, el adaptador de sinhala tiene rango 32 y el de code-switching rango 16, con alpha 32 y actualización conjunta (joint) durante el entrenamiento de code-switching. La model card no especifica en qué módulos de atención o de proyección se insertan los adaptadores, ni la tasa de aprendizaje, el optimizador, el número de pasos o el tamaño de lote.

Tampoco se documentan el volumen ni la composición del dataset de entrenamiento, ni si hubo etapas de ajuste por preferencias (RLHF/DPO), algo poco habitual en tareas de ASR. La carga descrita por el autor consiste en instanciar WhisperForConditionalGeneration, envolverlo con PeftModel, cargar ambos adaptadores, combinarlos con `add_weighted_adapter` usando pesos [1.0, 1.0] y `combination_type="cat"`, y finalmente llamar a `merge_and_unload`. La combinación de tipo "cat" en PEFT concatena las matrices LoRA, por lo que el rango efectivo del adaptador fusionado equivale a la suma de ambos rangos (32 + 16). El autor indica que ambos adaptadores deben activarse juntos y a peso unitario; cualquier otra configuración queda fuera de la receta documentada.

## Capacidades

- Transcripción de voz a texto en sinhala y en inglés mediante el modelo base Whisper small.
- Reconocimiento de habla con cambio de código intrafrase (alternancia de sinhala e inglés en el mismo enunciado), que es el objetivo declarado del adaptador de rango 16.
- Acondicionamiento por idioma de destino y de tarea (transcripción o traducción) mediante los tokens de control de Whisper; la model card recomienda fijar el idioma y los parámetros de generación según la tarea de evaluación.
- Procesamiento de audio a 16 kHz, tal y como exige explícitamente la model card.
- Traducción de voz a texto hacia inglés: capacidad heredada de la base Whisper small; no se documenta si el ajuste LoRA la preserva o la degrada.
- Detección y segmentación de marcas temporales: capacidades heredadas de Whisper small; no se documentan en la model card.
- No se documenta soporte de tool calling, function calling, uso agente ni razonamiento multi-paso. No es un modelo multimodal más allá del audio: no procesa imagen ni vídeo.

## Casos de uso

- Transcripción de reuniones bilingües sinhala-inglés: el adaptador está entrenado específicamente para habla con alternancia de idiomas, un escenario frecuente en empresas y organismos de Sri Lanka donde las reuniones mezclan ambos idiomas en la misma intervención.
- Subtitulado de contenido educativo y divulgativo: muchos vídeos y pódcast en sinhala introducen terminología técnica en inglés; el ajuste conjunto de ambos adaptadores está pensado para este tipo de material.
- Atención al cliente y centros de contacto: transcripción automática de llamadas de soporte con vocabulario técnico en inglés incrustado en frases en sinhala, para alimentar sistemas de analítica de conversaciones.
- Documentación clínica dictada: profesionales sanitarios que dictan en sinhala con nombres de fármacos, pruebas y diagnósticos en inglés, un caso clásico de cambio de código que los ASR monolingües resuelven mal.
- Generación de corpus anotados: uso del modelo para preanotar audio y acelerar la creación de datasets ASR en sinhala con etiquetas revisadas por humanos, aprovechando que la ventana de 30 s de Whisper permite procesar clips sin segmentación manual previa.
- Reproducción de resultados en revisión por pares: el repositorio incluye la semilla, el rango, el alpha y la receta de fusión, de modo que otro grupo puede reconstruir exactamente el sistema y repetir la evaluación experimental.
- Análisis de medios y monitorización de emisiones: transcripción de programas de radio o televisión en sinhala con inserción de citas en inglés para búsqueda de términos y análisis de tendencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la selección de checkpoint se hizo por el mejor resultado ("best"), sin especificar el conjunto de validación, la métrica empleada (WER, CER u otra) ni los valores obtenidos. El repositorio no incluye tablas comparativas frente a otros sistemas ASR para sinhala o code-switching.

## Requisitos de hardware

- Pesos del adaptador: tamaño no disponible; el repositorio figura como 0.0 GB en los metadatos de HuggingFace.
- Pesos del modelo base en FP16: aproximadamente 0.5 GB (244 M de parámetros).
- VRAM estimada para inferencia: en el orden de 2 a 4 GB en FP16 con lote 1, incluyendo activaciones y sobrecarga del framework. Es una estimación derivada del tamaño de la base, no verificada en la información proporcionada.
- GPUs de consumo compatibles: cualquier GPU con al menos 4-6 GB de memoria, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. También es viable en CPU con cuantización, aunque con mayor latencia.
- GPU de centro de datos: A100, H100 o L40S para servir varias peticiones concurrentes con margen de sobra.
- Opciones de despliegue: la ruta documentada es transformers + peft (cargar, combinar y fusionar los adaptadores). Tras `merge_and_unload`, el modelo resultante puede exportarse a formatos compatibles con CTranslate2/faster-whisper, whisper.cpp/GGUF u ONNX, siempre que la conversión soporte la arquitectura Whisper small. vLLM dispone de soporte de transcripción para Whisper, pero la carga de adaptadores PEFT de Whisper no está documentada en la información disponible. TGI: no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-joint-si32-cs16-seed123 (este) | Base ~244 M + adaptadores LoRA (rango 32 y 16) | 30 s | sinhala e inglés, con code-switching | No disponible | Pública en HuggingFace (0 descargas) |
| openai/whisper-small (base) | ~244 M | 30 s | multilingüe (alrededor de 99 idiomas declarados) | Apache-2.0 según la model card del modelo base; no verificado en la información proporcionada | Pública en HuggingFace |
| openai/whisper-medium | ~769 M | 30 s | multilingüe (alrededor de 99 idiomas declarados) | Apache-2.0 según la model card del modelo base; no verificado en la información proporcionada | Pública en HuggingFace |
| openai/whisper-large-v3 | ~1550 M | 30 s | multilingüe (catálogo amplio de idiomas) | Apache-2.0 según la model card del modelo base; no verificado en la información proporcionada | Pública en HuggingFace |

No se dispone de comparativas de rendimiento (WER/CER) frente a estos modelos ni frente a otros sistemas ASR específicos para sinhala, por lo que la comparación se limita a parámetros, ventana de audio, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita no hay autorización clara de uso comercial, modificación ni redistribución. Es un bloqueo habitual en artefactos anónimos de revisión por pares.
- Artefacto anónimo y no mantenido: el autor es un seudónimo creado para revisión; no hay compromiso de soporte, corrección de errores ni actualizaciones. Fechas de creación y actualización de 2026 y 0 descargas.
- Sin métricas publicadas: no hay WER ni CER que permitan estimar la calidad real del ajuste, ni comparación con la base sin adaptadores.
- Receta de inferencia frágil: el autor exige activar ambos adaptadores a peso unitario y fusionarlos con `combination_type="cat"`. Desviarse de esa configuración produce un modelo distinto al evaluado y resultados no comparables.
- Idiomas limitados a sinhala e inglés: no hay evidencia de que el ajuste preserve el rendimiento multilingüe de Whisper small en otros idiomas; el ajuste LoRA puede degradar el comportamiento fuera del dominio entrenado.
- Alucinación y bucles: los modelos de la familia Whisper tienden a generar texto plausible (repeticiones, frases de subtítulos, traducciones espurias) en segmentos con silencio, ruido o habla muy solapada. Este riesgo es mayor en idiomas de bajos recursos como el sinhala.
- Ventana de 30 segundos: el audio largo requiere segmentación con solapamiento, lo que introduce errores en los límites de las frases y en el cambio de idioma a mitad de segmento.
- Dependencia de la base: es necesario descargar openai/whisper-small por separado, con el coste de almacenamiento y de red correspondiente, y la base puede actualizarse o retirarse de forma independiente.
- Tamaño del repositorio reportado como 0.0 GB: conviene verificar que los pesos se han subido realmente antes de integrar el modelo en cualquier flujo automatizado.
- Sin soporte documentado de cuantizaciones ni de tool calling, agentes o razonamiento multi-paso: no es adecuado para esos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-joint-si32-cs16-seed123
- Modelo base: https://huggingface.co/openai/whisper-small
- Librería PEFT (HuggingFace): https://github.com/huggingface/peft
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper

Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relevante sobre este modelo ni sobre su autor. Los resultados obtenidos correspondían a organizaciones y marcas homónimas del término "Anonymous" (colectivo hacktivista y una marca de calzado), por lo que se descartan como fuentes. No se han localizado papers, blogs, demos ni repositorios asociados a este artefacto en la información disponible.
