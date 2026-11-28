# ampixa/dhimal-tts

## Resumen

Dhimal-tts es un modelo de síntesis de voz (text-to-speech) publicado por el usuario ampixa en Hugging Face, orientado específicamente al idioma dhimal (código ISO `dhi`), una lengua sino-tibetana minoritaria hablada por comunidades del este de Nepal y zonas limítrofes de la India. El modelo se distribuye en formato ONNX con la librería `onnx` y utiliza la arquitectura Piper/VITS, según indican las etiquetas del repositorio, lo que lo sitúa en la familia de sintetizadores ligeros concebidos para inferencia local y de baja latencia.

El interés del modelo reside en su enfoque hacia un idioma de bajos recursos (low-resource), un ámbito donde la mayoría de los sistemas TTS comerciales no ofrecen cobertura alguna. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto apto para despliegue en dispositivos de gama baja o en entornos sin GPU dedicada.

La información pública disponible es muy limitada: no se detallan parámetros, contexto ni datos de entrenamiento, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. La licencia aparece como "bible-brain-source-terms-pending", un identificador no estándar que no corresponde a ninguna licencia de código abierto reconocida, por lo que el uso comercial queda sujeto a condiciones no publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper / VITS (según etiquetas del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica en el sentido habitual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | dhimal (`dhi`) |
| Licencia | bible-brain-source-terms-pending (no estándar, condiciones pendientes) |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), empaquetada mediante Piper, el motor de síntesis de voz ligero desarrollado por Rhasspy. VITS combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de extremo a extremo, lo que permite generar audio de forma directa a partir del texto sin etapas intermedias explícitas de alineamiento. Piper añade una capa de exportación a ONNX pensada para inferencia eficiente en CPU.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de hablantes ni si se aplicaron técnicas de ajuste como RLHF o fine-tuning supervisado adicional. Tampoco se documentan innovaciones técnicas específicas más allá del propio enfoque de adaptación a un idioma de bajos recursos. No se ha publicado información sobre el proceso de entrenamiento en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto en idioma dhimal (`dhi`).
- Generación de audio mediante inferencia ONNX, compatible con el ecosistema Piper.
- Modelo ligero (~0,1 GB) apto para ejecución en CPU.
- Capacidad multilingüe: limitada al dhimal según los metadatos; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades especiales (thinking mode, visión, audio de entrada): no disponible.

## Casos de uso

- Accesibilidad para comunidades dhimal: lectura en voz alta de textos escritos para personas con discapacidad visual o dificultades lectoras en esta lengua, aprovechando que el modelo es el único recurso TTS documentado para `dhi`.
- Preservación lingüística: generación de material audio para diccionarios, cursos y archivos de lengua dhimal, contribuyendo a la documentación de una lengua minoritaria.
- Locución de contenidos educativos: producción de audiolibros o lecciones escolares en dhimal para escuelas rurales del este de Nepal, con despliegue en equipos sin GPU gracias al tamaño reducido del modelo.
- Sistemas de anuncios y avisos públicos: integración en aplicaciones de megafonía o radio comunitaria que necesiten convertir texto a voz en dhimal de forma automatizada.
- Asistentes de voz de baja latencia en dispositivos embebidos: al estar exportado a ONNX y pesar ~0,1 GB, puede ejecutarse en Raspberry Pi u otros dispositivos de recursos limitados mediante el runtime de ONNX.
- Investigación en TTS de bajos recursos: servir como línea base o punto de partida para experimentos de adaptación a otras lenguas sino-tibetanas con pocos datos.
- Traducción y doblaje comunitario: combinado con un sistema de traducción automática, permitiría doblar contenidos al dhimal en proyectos de divulgación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) el modelo cabe holgadamente en memoria de cualquier GPU moderna e incluso en RAM de sistema.
- GPU recomendadas: no se especifican; el formato ONNX y la arquitectura Piper están pensados para inferencia en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: runtime de ONNX, Piper (integración nativa), potencialmente contenedores con ONNX Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| ampixa/dhimal-tts | dhimal (`dhi`) | Piper / VITS | ONNX | bible-brain-source-terms-pending | Restringido (gated) |
| Piper (voces oficiales) | Múltiples (principalmente europeos) | VITS | ONNX | MIT (motor) | Abierto |
| Coqui TTS | Múltiples | VITS, Tacotron, etc. | Checkpoint / ONNX | MPL 2.0 (motor) | Abierto |
| Modelos TTS multilingües comerciales | Amplia cobertura | Variable | Propietario | Propietaria | API |

No se dispone de comparativas directas de rendimiento con otros sistemas TTS para el idioma dhimal, dado que no se han publicado benchmarks ni existen alternativas documentadas para esta lengua en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con un corpus limitado, puede reproducir sesgos de los hablantes o fuentes utilizadas.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas, entonación anómala o artefactos acústicos ante texto fuera del dominio de entrenamiento.
- Limitaciones de idioma: cobertura exclusiva del dhimal; no se garantiza calidad en préstamos, nombres propios o mezcla de códigos con nepalí o inglés.
- Licencia: "bible-brain-source-terms-pending" no es una licencia estándar; el uso comercial queda sin definir y sujeto a condiciones no publicadas. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la auditoría del modelo.
- Documentación insuficiente: no se especifican datos de entrenamiento, parámetros ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/dhimal-tts
- Piper (motor TTS): https://github.com/rhasspy/piper
- ONNX Runtime: https://onnxruntime.ai/
- Artículo original de VITS: https://arxiv.org/abs/2106.06103
