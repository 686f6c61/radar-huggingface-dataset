# Sanghyang00/ELARSpeech-Whisper-Large-v3-bastimentos-creole-english

## Resumen

ELARSpeech-Whisper-Large-v3-bastimentos-creole-english es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Sanghyang00, publicado dentro del marco del proyecto ELARSpeech. Se trata de un ajuste fino (*fine-tune*) del modelo openai/whisper-large-v3, especializado en una única variedad lingüística: el inglés criollo de Bastimentos (Bastimentos Creole English), una lengua sin código ISO 639-3 asignado.

El modelo conserva la arquitectura original de Whisper: un transformer encoder-decoder con 1.543.491.840 parámetros (aproximadamente 1,54 mil millones) que procesa audio convertido a un espectrograma Mel de 128 bandas en ventanas de 30 segundos. El ajuste introduce un token de idioma específico (`<|bastimentos-creole-english|>`) que debe inyectarse explícitamente en el prompt del decodificador para reproducir el comportamiento del artefacto exportado, en lugar de usar el parámetro `language=` habitual.

Su relevancia es acotada y muy especializada: no busca competir con modelos ASR generalistas, sino cubrir una variedad lingüística poco representada en los corpus de entrenamiento masivos. El repositorio tiene 0 descargas y 0 *likes*, una licencia no especificada y carece de resultados de benchmarks públicos, por lo que debe considerarse un artefacto de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (WhisperForConditionalGeneration) |
| Parametros totales | 1.543.491.840 (aproximadamente 1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de 30 segundos de audio; audio largo mediante decodificación secuencial por trozos |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Bastimentos Creole English (ISO 639-3 no asignado) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Modelo base | openai/whisper-large-v3 |
| Entrada de audio | Mono, 16 kHz |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3: un *transformer* encoder-decoder con 1,54 mil millones de parámetros. El encoder procesa un espectrograma Mel de 128 bandas (frente a las 80 bandas de large-v2) sobre ventanas de 30 segundos, y el decodificador genera texto de forma autorregresiva. El audio de formato largo se maneja mediante decodificación secuencial o troceada. Whisper large-v3 fue entrenado originalmente sobre un conjunto de aproximadamente 5 millones de horas de audio supervisado, con capacidad multilingüe.

Sobre el proceso de ajuste fino de esta variante concreta no hay información disponible en los materiales proporcionados: no se especifica el volumen de datos de entrenamiento, la composición del corpus, la procedencia de las grabaciones ni si se aplicaron técnicas de alineación posteriores (RLHF, DPO, etc.). Lo único documentado es la verificación de evaluación: el artefacto exportado se comprueba contra el *checkpoint* original de ELARSpeech sobre un conjunto fijo de evaluación, con estado de verificación de transcripción exacta **PASS**.

La particularidad técnica más reseñable es la introducción de un token de idioma propio (`<|bastimentos-creole-english|>`). La model card indica explícitamente que debe usarse un prompt de decodificador con este token en lugar del argumento `language=`, con la secuencia `decoder_start_token_id` → token de idioma → `<|transcribe|>` → `<|notimestamps|>`.

## Capacidades

- Transcripción de voz a texto (*speech-to-text*) en inglés criollo de Bastimentos.
- Procesamiento de audio mono a 16 kHz en ventanas de 30 segundos.
- Manejo de audio de formato largo mediante decodificación secuencial o por trozos.
- Decodificación con control explícito del idioma objetivo a través de un token personalizado.
- Modo transcripción (`<|transcribe|>`) y supresión de marcas temporales (`<|notimestamps|>`).
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión ni audio más allá del ASR.
- Modelo monolingüe: no cubre otros idiomas ni traducción.

## Casos de uso

- Documentación lingüística de campo: transcripción de grabaciones de hablantes nativos de inglés criollo de Bastimentos para construir corpus anotados que alimenten estudios fonéticos, morfológicos y léxicos.
- Preservación del patrimonio oral: digitalización y transcripción de relatos, canciones y testimonios de tradición oral de la comunidad de Bastimentos (archipiélago de Bocas del Toro, Panamá).
- Subtitulado de material audiovisual local: generación automática de subtítulos para vídeos, entrevistas o documentales en esta variedad lingüística, donde los modelos ASR generalistas rinden mal.
- Investigación sociolingüística: producción de transcripciones preliminares a escala para análisis de variación, contacto de lenguas (criollo inglés/español) y actitudes lingüísticas.
- Apoyo educativo y sanitario: transcripción de consultas o sesiones en entornos donde la comunidad habla esta variedad, facilitando el registro y la revisión posterior por parte de personal que ya conoce la lengua.
- Preprocesado para pipelines de PLN: conversión de audio a texto como primer paso antes de aplicar modelos de lenguaje para resumen, traducción o análisis de contenido.
- Archivística sonora: indexación y búsqueda por texto en fondos de audio históricos o etnográficos que hasta ahora solo eran recuperables mediante metadatos manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación de transcripción exacta con estado **PASS** frente al *checkpoint* original de ELARSpeech sobre un conjunto fijo de evaluación, pero no incluye valores de WER, CER ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6,2 GB de pesos (coincide con el tamaño del repositorio).
- VRAM estimada en FP16/BF16: en torno a 3,1 GB de pesos, más memoria para activaciones y caché de atención.
- VRAM estimada en cuantización INT8: aproximadamente 1,6 GB de pesos, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto volumen; RTX 4090, RTX 4080, RTX 3090 o RTX 4070 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: la ruta principal es Hugging Face Transformers (`WhisperForConditionalGeneration` + `WhisperProcessor`), tal como documenta la model card. Otras herramientas basadas en Whisper (faster-whisper, WhisperX, whisper.cpp, vLLM) requerirían adaptación para manejar el token de idioma personalizado, por lo que no puede garantizarse su compatibilidad directa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-bastimentos-creole-english | 1,54 mil millones | Ventanas de 30 s | Bastimentos Creole English (monolingüe) | No disponible | Hugging Face (0 descargas) |
| openai/whisper-large-v3 | Aproximadamente 1,55 mil millones | Ventanas de 30 s | Multilingüe | MIT (modelo base) | Hugging Face, ampliamente adoptado |
| openai/whisper-large-v3-turbo | Aproximadamente 809 millones | Ventanas de 30 s | Multilingüe | MIT (modelo base) | Hugging Face |
| openai/whisper-medium | Aproximadamente 769 millones | Ventanas de 30 s | Multilingüe | MIT (modelo base) | Hugging Face |

Los datos de parámetros y licencia de las alternativas corresponden a los modelos base de OpenAI según la información pública disponible; los valores de rendimiento comparativo (WER) no están disponibles en los materiales proporcionados.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite el uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Modelo monolingüe: solo cubre Bastimentos Creole English; no traduce ni transcribe otros idiomas.
- Sin resultados de benchmarks: no hay cifras de WER ni CER que permitan evaluar objetivamente su calidad.
- Sin validación externa: 0 descargas y 0 *likes* implican ausencia de pruebas independientes por parte de la comunidad.
- Riesgo de alucinación: heredado de la familia Whisper, que puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible.
- Sensibilidad a las condiciones de grabación: la precisión varía según la calidad del audio, el micrófono, el ruido de fondo, el hablante y el dominio.
- Ortografía no normalizada: al no existir un estándar ortográfico consolidado para esta variedad, las transcripciones pueden presentar inconsistencias.
- Requisito estricto de entrada: el audio debe ser mono y estar remuestreado a 16 kHz; otros formatos degradan el resultado.
- Dependencia de un token de idioma personalizado: las herramientas de terceros que no permitan inyectar el token `<|bastimentos-creole-english|>` en el prompt del decodificador pueden producir un comportamiento de decodificación distinto al del artefacto exportado.
- Detalles de entrenamiento opacos: se desconoce el volumen y la composición de los datos de ajuste, lo que dificulta anticipar sesgos o coberturas deficientes (por ejemplo, según género, edad o variantes dialectales internas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-bastimentos-creole-english
- Archivos del repositorio: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-bastimentos-creole-english/tree/main
- Modelo base openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Guía de uso local de Whisper Large V3: https://aiindigo.com/tutorials/getting-started-with-whisper-large-v3-high-accuracy-transcription-translation
- Análisis de arquitectura, WER y límites de Whisper Large-v3: https://convertaudiototext.com/blog/whisper-large-v3-explained
- Ficha de Whisper en Vast.ai: https://vast.ai/model/whisper
