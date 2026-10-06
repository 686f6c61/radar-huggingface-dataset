# globalizator/gzwhisper-azerbaijani-ct2-int8

## Resumen

gzwhisper-azerbaijani-ct2-int8 es un paquete de ejecución para reconocimiento automático del habla (ASR) en azerbaiyano, publicado por el usuario globalizator dentro del proyecto GZ Whisper. No es un modelo entrenado desde cero: es la conversión a formato CTranslate2 del modelo LocalDoc/azerbaijani-whisper-turbo, fijado en la revisión `88bbcb59a5a37b4f73a394e431028691ab436b8a`, sin ningún ajuste fino adicional por parte del autor de la conversión.

El paquete ocupa aproximadamente 825 MB y ofrece pesos en INT8 (y FP32), lo que lo orienta a inferencia local y eficiente, incluida la ejecución en dispositivos móviles (el proyecto GZ Whisper registra por separado la aceptación en iPhone). Se apoya en la arquitectura Whisper en su variante Turbo, un transformer encoder-decoder especializado en transcripción de audio.

Su relevancia es de nicho: cubre una lengua con pocos recursos como el azerbaiyano con un artefacto listo para desplegar vía CTranslate2. La model card no aporta cifras de precisión ni de parámetros; solo indica que se realizó una comprobación básica ("smoke check") sobre muestras cortas de habla humana, sin que ello constituya una certificación de precisión general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (variante Turbo) |
| Parametros totales | no disponible en la model card (la variante Whisper large-v3-turbo de OpenAI tiene ~809 M, dato de referencia no confirmado para este paquete) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; Whisper procesa audio en ventanas de 30 segundos por segmento (caracteristica de la familia, no confirmada en la model card) |
| Tipos de cuantizacion | INT8 (pesos) y FP32 |
| Idiomas soportados | azerbaiyano (az) |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (CT2) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Whisper: un transformer encoder-decoder que recibe representaciones mel-espectrograma del audio y genera tokens de texto, con atención encoder-decoder y decodificación autorregresiva. La variante Turbo reduce el número de capas del decodificador respecto a large-v3 para acelerar la inferencia a costa de una ligera pérdida de precisión, tal como describe OpenAI en su familia Whisper. Este paquete concreto no introduce cambios arquitectónicos: es una conversión de formato.

El autor indica explícitamente que no se realizó ajuste fino durante la conversión. El ajuste al azerbaiyano procede del modelo base LocalDoc/azerbaijani-whisper-turbo. La conversión a CTranslate2 aplica cuantización INT8 sobre los pesos para reducir el tamaño y mejorar el rendimiento en CPU y GPU, manteniendo además tensores en FP32. Las recetas de conversión y los metadatos de integridad se conservan en el proyecto GZ Whisper, y las instrucciones del autor piden no renombrar los ficheros de ejecución. No se documentan datos de entrenamiento (número de tokens, composición del dataset) ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en azerbaiyano.
- Ejecución local mediante CTranslate2 con cuantización INT8, orientada a entornos con recursos limitados.
- Funcionamiento en CPU y GPU, al ser un formato optimizado por CTranslate2.
- Integración como runtime de la aplicación GZ Whisper (paquete de descarga opcional para el usuario final).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta capacidad multilingüe: el único idioma declarado es `az`.
- No se documenta modo de "thinking", salida estructurada ni marcas de tiempo, aunque la familia Whisper las soporta de forma nativa (no confirmado para este paquete).

## Casos de uso

- Transcripción de audio en azerbaiyano en local: el modelo convierte ficheros de voz a texto sin depender de servicios en la nube, gracias al formato CTranslate2 y a su tamaño de ~825 MB, apto para equipos de sobremesa.
- Subtitulado de vídeo: transcripción de pistas de audio en azerbaiyano para generar subtítulos en flujos de postproducción, con la ventaja de ejecutarse en CPU si no hay GPU disponible.
- Dictado en aplicaciones móviles: el proyecto GZ Whisper registra la aceptación en iPhone, por lo que el paquete encaja en escenarios de entrada de voz en dispositivos, siempre que la integración la proporcione la aplicación anfitriona.
- Análisis de llamadas de atención al cliente: transcripción masiva de grabaciones en azerbaiyano para búsqueda de palabras clave y control de calidad, aprovechando el bajo coste de inferencia en INT8.
- Archivado y accesibilidad de patrimonio oral: digitalización de entrevistas, testimonios o grabaciones históricas en azerbaiyano a texto buscable.
- Transcripción de reuniones y notas de voz: conversión de actas habladas en azerbaiyano a texto para su indexación y resumen posterior con otro modelo (este paquete solo transcribe).
- Procesamiento por lotes en servidores sin GPU: la cuantización INT8 permite desplegar la transcripción en infraestructura CPU-only para volúmenes moderados de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comprobación de humo ("smoke check") sobre muestras cortas de habla humana, que el propio autor aclara que no constituye una certificación de precisión general ni de compatibilidad de dispositivo.

## Requisitos de hardware

- Tamaño del paquete de ejecución: aproximadamente 825 MB en disco (INT8/FP32).
- VRAM estimada para inferencia (estimación, no confirmada por el autor): del orden de 1-2 GB en INT8 y en torno a 3 GB en FP32, coherente con el tamaño del paquete; para Whisper Turbo en FP16 suelen ser necesarios alrededor de 2 GB con ventanas de 30 segundos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090) para inferencia cómoda; el modelo también puede correr en CPU gracias a CTranslate2.
- Compatibilidad con GPU de consumo: previsiblemente sí en la mayoría de tarjetas modernas con 4 GB o más de VRAM, dado el tamaño reducido del paquete (estimación).
- Opciones de despliegue: CTranslate2 como motor principal; puede integrarse a través de bibliotecas que lo envuelven (por ejemplo faster-whisper) y ejecutarse en modo local o en servidor. No se documenta compatibilidad con vLLM, TGI ni Ollama, orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la duración del audio y del uso de INT8 frente a FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gzwhisper-azerbaijani-ct2-int8 | no disponible (familia Whisper Turbo) | ventanas de 30 s (familia) | az | apache-2.0 | CTranslate2 (INT8/FP32) | Conversion sin ajuste fino; orientada a ejecucion local |
| LocalDoc/azerbaijani-whisper-turbo | no disponible | ventanas de 30 s (familia) | az | no disponible | safetensors (formato original de Whisper) | Modelo base del que procede esta conversion |
| openai/whisper-large-v3-turbo | ~809 M (referencia de OpenAI) | ventanas de 30 s | multilingue | MIT (segun OpenAI) | PyTorch / safetensors | Modelo generalista; sin especializacion en azerbaiyano |
| openai/whisper-large-v3 | ~1.550 M (referencia de OpenAI) | ventanas de 30 s | multilingue | MIT (segun OpenAI) | PyTorch / safetensors | Mayor coste computacional que la variante Turbo |

Los datos de los modelos comparativos de OpenAI se incluyen como referencia general de la familia Whisper y no proceden de la model card de este paquete.

## Limitaciones y advertencias

- Es un modelo de un solo idioma (azerbaiyano, `az`); no ofrece transcripción multilingüe ni traducción.
- No declara tareas más allá de `automatic-speech-recognition`: no genera texto libre, código, ni admite tool calling o agentes.
- No hay cifras de precisión publicadas; la única validación mencionada es un "smoke check" sobre muestras cortas, por lo que el comportamiento en audio real (ruido, acentos, solapamiento de voces) no está caracterizado.
- La cuantización INT8 puede degradar la calidad de transcripción respecto a FP32; conviene validar con datos propios antes de producción.
- Riesgo de alucinación típico de Whisper en silencios, música o audio muy ruidoso; se recomienda aplicar umbrales de confianza y limpieza de repeticiones.
- La licencia declarada por el paquete es apache-2.0, pero el autor indica que los derechos del modelo original permanecen en sus titulares y remite a LICENSE, NOTICE y SOURCE_MODEL_CARD.md; conviene verificar la licencia del modelo base (LocalDoc/azerbaijani-whisper-turbo) antes de un uso comercial.
- El autor pide no renombrar los ficheros de ejecución y señala que los paquetes son descargas opcionales que la aplicación usa en local tras la configuración.
- No se documenta la aceptación en Android ni en otros dispositivos; la validación en iPhone se registra externamente en el proyecto GZ Whisper, no en este repositorio.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/globalizator/gzwhisper-azerbaijani-ct2-int8
- Modelo base: https://huggingface.co/LocalDoc/azerbaijani-whisper-turbo
- CTranslate2 (formato y motor de inferencia): https://github.com/OpenNMT/CTranslate2

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo (únicamente páginas comerciales de Netflix, sin relación con el contenido). No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
