# bytx/tugstugi-medium-bn-ct2

## Resumen

`bytx/tugstugi-medium-bn-ct2` es una conversión a formato CTranslate2 del modelo `bengaliAI/tugstugi_bengaliai-asr_whisper-medium`, un Whisper medium ajustado para reconocimiento automático de voz (ASR) en bengalí. El autor del repositorio, bytx, no ha reentrenado ni modificado los pesos: únicamente ha transformado el checkpoint original de PyTorch a CTranslate2 con cuantización float16 para que pueda cargarse con faster-whisper sin dependencia de PyTorch.

El modelo resuelve la transcripción de audio en bengalí en entornos locales con recursos limitados, y es la pieza que la herramienta `bytx` descarga durante su configuración inicial para transcribir vídeos de YouTube y Facebook en bengalí e inglés. Su relevancia es práctica: ofrece una vía de despliegue ligera (sin PyTorch, con soporte de CPU vía int8) para un idioma con escasa cobertura en los modelos ASR generalistas.

La arquitectura subyacente es la de Whisper medium (transformer encoder-decoder con 769 millones de parámetros, ventana de audio de 30 segundos y límite de 224 tokens de decodificación), heredada íntegramente del modelo base. La ficha se limita a documentar la conversión y sus particularidades de uso, ya que el repositorio no aporta datos de entrenamiento ni métricas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a CTranslate2 |
| Parametros totales | 769 M (heredados del Whisper medium original; no confirmado de forma explícita en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 s; límite de 224 tokens de decodificación |
| Tipos de cuantizacion | float16 (pesos publicados); int8 disponible en inferencia sobre CPU |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`, `config.json`, `tokenizer.json`, `preprocessor_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para ASR multilingüe y ajustado después por bengaliAI para bengalí. El repositorio de bytx no contiene ningún reentrenamiento ni ajuste fino adicional; la conversión se realizó con `ct2-transformers-converter` aplicando `--quantization float16` y copiando `tokenizer.json` y `preprocessor_config.json`. No se dispone de información sobre el dataset de ajuste, el número de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo base.

La innovación técnica relevante no está en el modelo sino en el pipeline de uso descrito por el autor: como el modelo no predice de forma fiable los tokens de timestamp de Whisper, bytx decodifica con `without_timestamps=True` y obtiene las marcas temporales de su propio detector de actividad de voz. Además, dado que el bengalí consume aproximadamente 0,7 tokens por carácter, una ventana completa de 30 segundos puede desbordar el límite de 224 tokens y perder texto; por eso bytx trocea el audio en clips de 12 segundos como máximo y decodifica cada uno por separado.

## Capacidades

- Transcripción de voz a texto en bengalí (ASR monolingüe).
- Ejecución sin PyTorch mediante faster-whisper y CTranslate2.
- Inferencia en GPU con `compute_type="float16"` y en CPU con `compute_type="int8"`.
- Decodificación por segmentos con control externo de timestamps (el modelo no los genera de forma fiable).
- Procesamiento de audio troceado en clips de hasta 12 segundos para evitar el desbordamiento del límite de 224 tokens.
- No soporta tool calling, function calling, agentes, visión, audio generation ni modos de razonamiento extendido: es un modelo ASR puro.
- Capacidad multilingüe limitada al bengalí; no se documenta soporte de otros idiomas.

## Casos de uso

- Transcripción de vídeos de YouTube y Facebook en bengalí: es el caso de uso nativo de la herramienta bytx, que descarga este modelo en su `setup` y transcribe el audio troceado en clips de 12 segundos.
- Generación de subtítulos para contenido audiovisual bengalí: la decodificación con `without_timestamps=True` combinada con un VAD externo permite alinear los subtítulos a los clips de voz detectados.
- Archivado y búsqueda de audio en bengalí: transcripción por lotes en CPU con int8 para indexar grabaciones, pódcasts o reuniones sin necesidad de GPU.
- Investigación en ASR de bajos recursos: punto de partida ligero para comparar el rendimiento de Whisper medium ajustado frente a otros modelos en bengalí.
- Despliegue en entornos sin PyTorch: el formato CTranslate2 reduce dependencias y facilita su integración en contenedores mínimos o sistemas embebidos con CPU.
- Preprocesado de datasets de voz en bengalí: transcripción masiva previa a tareas de anotación, traducción o análisis de contenido.
- Accesibilidad: subtitulado automático de material formativo en bengalí para personas con discapacidad auditiva, aceptando la necesidad de revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web solo devuelve un perfil agregado del proveedor «tugstugi» en BenchmarkList (1 modelo, 3 benchmarks cubiertos) sin cifras concretas ni correspondencia verificada con este checkpoint.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en float16 (tamaño del repo); en torno a 0,8-1 GB con int8 en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son válidas, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: faster-whisper con backend CTranslate2 (GPU float16 o CPU int8); también puede cargarse con la librería CTranslate2 directamente.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bytx/tugstugi-medium-bn-ct2 | 769 M (Whisper medium) | 30 s audio / 224 tokens | bn | Apache-2.0 | CTranslate2 |
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium | 769 M (Whisper medium) | 30 s audio / 224 tokens | bn | Apache-2.0 | PyTorch (safetensors/bin) |
| openai/whisper-medium | 769 M | 30 s audio / 224 tokens | multilingüe (99 idiomas) | MIT | PyTorch, CTranslate2 (conversiones de terceros) |

La diferencia principal frente al modelo base es exclusivamente el formato y la cuantización float16; el rendimiento en transcripción debería ser equivalente, aunque no se han publicado métricas comparativas. Frente a `openai/whisper-medium`, este checkpoint está especializado en bengalí y carece de cobertura multilingüe general.

## Limitaciones y advertencias

- El modelo no predice de forma fiable los tokens de timestamp de Whisper; es necesario decodificar con `without_timestamps=True` y obtener las marcas temporales de un VAD externo.
- El bengalí consume aproximadamente 0,7 tokens por carácter, por lo que una ventana de 30 segundos puede desbordar el límite de 224 tokens y perder texto; se recomienda trocear en clips de 12 segundos o menos.
- El uso de `initial_prompt` puede provocar que el modelo repita el prompt en la salida.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios o música.
- Sesgos no documentados: la model card no detalla la composición del dataset de ajuste ni posibles sesgos de dominio, acento o género.
- Cobertura monolingüe: solo bengalí; no debe emplearse para otros idiomas sin validación previa.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la model card del modelo base para confirmar condiciones heredadas.
- Repositorio sin descargas ni likes y sin métricas publicadas: no hay evidencia comunitaria de calidad en producción.
- La fecha de creación del repositorio (2026-11-06) debe tratarse con cautela; no se dispone de información adicional que la confirme.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bytx/tugstugi-medium-bn-ct2
- Modelo base: https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Herramienta bytx: https://github.com/hades874/bytx
- Perfil del proveedor en BenchmarkList: https://benchmarklist.com/providers/tugstugi/
