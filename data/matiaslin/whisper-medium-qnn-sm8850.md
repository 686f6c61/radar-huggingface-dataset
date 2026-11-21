# MatiasLin/whisper-medium-qnn-sm8850

## Resumen

`MatiasLin/whisper-medium-qnn-sm8850` es una conversión del modelo de reconocimiento automático del habla Whisper Medium de OpenAI, empaquetada para su ejecución sobre el backend QNN (Qualcomm Neural Network) y dirigida específicamente al SoC Snapdragon 8 Elite (identificado en el repositorio como sm8850). El autor del artefacto es el usuario de Hugging Face MatiasLin, que publica los pesos ya compilados para el runtime de Qualcomm en lugar de un checkpoint en formato PyTorch o safetensors estándar.

El interés de esta ficha es acotado pero práctico: no se trata de un modelo nuevo ni de una variante entrenada desde cero, sino de un artefacto de despliegue orientado a inferencia on-device en dispositivos móviles con aceleración NPU. Whisper Medium es un transformer encoder-decoder de aproximadamente 769 millones de parámetros, entrenado por OpenAI para transcripción multilingüe y traducción de voz a texto, y esta conversión permite ejecutarlo con las herramientas de cuantización y ejecución de Qualcomm.

La model card publicada no incluye información técnica adicional más allá de la licencia MIT: no hay detalles sobre el esquema de cuantización aplicado, la versión exacta de QNN SDK utilizada, el tamaño final de los artefactos ni resultados de evaluación. Cualquier evaluación de idoneidad para producción debe partir, por tanto, de las características conocidas de Whisper Medium y de una validación empírica propia sobre el dispositivo objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium de OpenAI), convertido a backend QNN |
| Parámetros totales | Aproximadamente 769 M (correspondientes a Whisper Medium; no confirmado en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; Whisper Medium opera con ventanas de audio de 30 segundos |
| Tipos de cuantización | No disponible (el artefacto está orientado al runtime QNN de Qualcomm; el esquema exacto no se especifica) |
| Idiomas soportados | No disponibles en la model card; Whisper Medium original soporta transcripción multilingüe y traducción al inglés |
| Licencia | MIT |
| Formato de pesos | Artefactos para QNN / Snapdragon 8 Elite (sm8850); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Medium, un transformer encoder-decoder con atención estándar que procesa espectrogramas Mel de audio de 30 segundos y genera tokens de texto de forma autorregresiva. Whisper fue entrenado por OpenAI sobre una gran colección de audio supervisado débilmente etiquetado (680 000 horas según la documentación pública del modelo original), combinando tareas de transcripción, traducción al inglés y detección de idioma en un único formato de tarea codificado en tokens especiales. No se dispone de información sobre reentrenamiento o ajuste fino adicional en esta conversión.

La contribución específica de este repositorio no está en el entrenamiento sino en el empaquetado para hardware: los pesos se preparan para ejecutarse sobre el Qualcomm Neural Network SDK, lo que implica típicamente conversión de operadores, cuantización (probablemente en algún formato de precisión reducida, aunque no se documenta) y compilación para el DSP/NPU del Snapdragon 8 Elite. La model card no detalla la versión del SDK, el grafo exportado, ni si se conservan todas las capacidades del modelo original (por ejemplo, decodificación con timestamps o detección de idioma).

## Capacidades

- Transcripción de voz a texto (speech-to-text) para audio en múltiples idiomas, heredadas de Whisper Medium.
- Traducción de voz a texto en inglés desde otros idiomas, según las capacidades del modelo base.
- Detección de idioma y transcripción con marcas temporales, sujetas a que la conversión a QNN las preserve (no verificado).
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, con concatenación para audio más largo.
- Ejecución on-device acelerada por NPU en dispositivos con Snapdragon 8 Elite.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido, ya que Whisper no es un modelo conversacional de propósito general.
- No se documentan capacidades de visión ni audio-vision.

## Casos de uso

- Transcripción offline en aplicaciones móviles: integración en apps Android que necesiten convertir notas de voz en texto sin enviar audio a la nube, aprovechando la NPU del Snapdragon 8 Elite para reducir latencia y consumo.
- Subtitulado en tiempo casi real de contenido pregrabado: procesamiento por ventanas de 30 segundos con solapamiento para generar subtítulos en el propio dispositivo.
- Dictado por voz en herramientas de productividad: entrada de texto por voz en editores o clientes de correo móviles, con la ventaja de privacidad de no transmitir el audio.
- Asistentes de accesibilidad: transcripción de conversaciones o audio ambiental para usuarios con dificultades auditivas, ejecutada localmente.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones almacenadas en el dispositivo para permitir búsqueda por texto.
- Prototipado de pipelines de voz en edge computing: uso como componente ASR en demostraciones de sistemas embebidos o robótica móvil basada en plataformas Snapdragon.
- Evaluación comparativa de rendimiento NPU frente a CPU/GPU: referencia práctica para medir el impacto de la aceleración QNN en tareas de ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo declarado: SoC Snapdragon 8 Elite (sm8850) con backend QNN; no se garantiza compatibilidad con otros SoCs Qualcomm ni con GPUs de escritorio.
- VRAM estimada para inferencia: no disponible; en el dispositivo, el consumo se reparte entre memoria del sistema y memoria dedicada de la NPU/DSP, y depende del esquema de cuantización no documentado.
- GPU recomendadas: no aplica en el sentido convencional; el artefacto está pensado para la NPU integrada del Snapdragon 8 Elite.
- Cabe en GPU de consumo: no disponible; no se documenta una variante ejecutable en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime QNN de Qualcomm (QNN SDK / herramientas de ejecución en Android). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatiasLin/whisper-medium-qnn-sm8850 | ~769 M (Whisper Medium) | Ventanas de audio de 30 s | QNN / Snapdragon 8 Elite | MIT | Hugging Face (0 descargas) |
| openai/whisper-medium | ~769 M | Ventanas de audio de 30 s | PyTorch / safetensors | MIT | Hugging Face, ampliamente usado |
| whisper.cpp (conversión GGUF de Whisper) | Varias tallas (tiny a large) | Ventanas de audio de 30 s | GGUF / llama.cpp | MIT | Repositorio comunitario |
| faster-whisper (CTranslate2) | Varias tallas | Ventanas de audio de 30 s | CTranslate2 | MIT | Repositorio comunitario |

La diferencia principal frente a las alternativas es el target de ejecución: esta conversión apunta exclusivamente a la NPU del Snapdragon 8 Elite, mientras que las demás opciones cubren CPU, GPU y otros aceleradores. No hay datos de rendimiento comparativo publicados para esta conversión concreta.

## Limitaciones y advertencias

- La model card no documenta el esquema de cuantización ni la pérdida de precisión asociada; es necesario validar la calidad de transcripción (WER) en el dispositivo objetivo antes de usarla en producción.
- Riesgo de alucinación inherente a Whisper: el modelo puede generar texto plausible en segmentos de silencio o ruido, un comportamiento conocido del modelo base que puede persistir o agravarse tras la cuantización.
- Sesgos del modelo base: Whisper Medium hereda sesgos de sus datos de entrenamiento en cuanto a acentos, variedades dialectales y dominio (el rendimiento suele degradarse en audio con ruido, jerga técnica o habla solapada).
- Limitación de ventana: el procesamiento está acotado a segmentos de 30 segundos; audio más largo requiere segmentación externa con solapamiento y gestión de cortes.
- Compatibilidad restringida: el artefacto está ligado a un SoC concreto (sm8850); no es portable a otros dispositivos sin reconversión.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del QNN SDK de Qualcomm, que se distribuye bajo sus propios términos y no está cubierto por la licencia del modelo.
- Sin mantenimiento ni documentación: repositorio con 0 descargas y sin actualizaciones desde su creación; no hay garantía de soporte ni de reproducibilidad del proceso de conversión.
- No verificado: se desconoce si la conversión preserva funcionalidades como detección de idioma, timestamps o traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatiasLin/whisper-medium-qnn-sm8850
- Modelo base Whisper Medium de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Qualcomm AI Engine Direct (QNN SDK): https://www.qualcomm.com/developer/software/qualcomm-ai-engine-direct-sdk
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
