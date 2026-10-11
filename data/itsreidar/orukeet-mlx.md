# itsreidar/orukeet-mlx

## Resumen

orukeet-mlx es una conversión al formato MLX del modelo de reconocimiento automático del habla (ASR) oruk/orukeet, publicada por el usuario itsreidar. No se trata de un modelo nuevo ni reentrenado: es una transformación de formato pensada para el cargador Parakeet de la librería mlx-audio-swift, de modo que el modelo pueda ejecutarse de forma nativa en hardware Apple Silicon (chips de la serie M) a través del framework MLX de Apple. La conversión parte de la revisión `b59c13a733fce5cf193230d0fa317ee7f145a108` del modelo original y mantiene exactamente los mismos pesos, únicamente reorganizados.

El modelo subyacente, Orukeet, lo desarrolla Oruk AI (Nathan Roll, Irene Yi, Büşra Marşan, Vianney Grenez, Gabriel Stein, Momcilo Mrkaic, Pavle Padjin, Vladimir Zeljkovic y Calbert Graham) y es un ajuste fino del NVIDIA Parakeet TDT 0.6B v3. Se trata de un sistema de transcripción de voz a texto multilingüe que cubre 25 idiomas europeos, con unos 627 millones de parámetros, un codificador FastConformer de 24 capas y un decodificador de tipo token-and-duration transducer (TDT). Su relevancia actual radica en que ofrece transcripción multilingüe de calidad con una huella de memoria muy reducida (~1,5 GB en fp16) y en que su licencia CC-BY-SA-4.0 permite uso comercial con atribución.

Esta ficha describe principalmente la conversión MLX y, cuando procede, el modelo original del que deriva. Es importante subrayar que las capacidades y el comportamiento del modelo son las de Orukeet; la conversión solo cambia el formato de almacenamiento y la disposición de los tensores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder de 24 capas) + decodificador token-and-duration transducer (TDT) |
| Parametros totales | 627.052.166 (safetensors de este repo); el modelo original declara 627.008.134 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | pesos almacenados en float16 en este repo; existe exportación GGUF (14,7 GB) y exportación ONNX en otros canales |
| Idiomas soportados | 25: búlgaro (bg), croata (hr), checo (cs), danés (da), neerlandés (nl), inglés (en), estonio (et), finés (fi), francés (fr), alemán (de), griego (el), húngaro (hu), italiano (it), letón (lv), lituano (lt), maltés (mt), polaco (pl), portugués (pt), rumano (ro), ruso (ru), eslovaco (sk), esloveno (sl), español (es), sueco (sv) y ucraniano (uk) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (MLX); disposición MLX Parakeet con convoluciones en channels-last |

## Arquitectura y entrenamiento

La arquitectura es la del NVIDIA Parakeet TDT 0.6B v3: un codificador FastConformer de 24 capas seguido de un decodificador token-and-duration transducer (TDT). El componente "transducer" combina predicción de tokens con predicción de duración, lo que permite emitir varios tokens por fotograma y acelera la decodificación frente a esquemas autoregresivos clásicos. El modelo conserva el tokenizador de Parakeet. Según el repositorio original de Oruk AI, el ajuste incorpora "kernels de Gabor ajustados y congelados" (fitted, frozen Gabor kernels), una modificación de la capa convolucional del encoder orientada a mejorar la representación frecuencial sin incrementar el coste de entrenamiento de esos parámetros.

En cuanto al entrenamiento, esta conversión no reentrena nada: el autor indica explícitamente "Format only, no retraining". Los cambios aplicados son de formato: renombrado de tensores al esquema MLX Parakeet, traslado de los pesos de convolución a channels-last, suma de los sesgos de entrada y ocultos de la LSTM, y almacenamiento de los pesos en float16. Los ficheros de configuración NeMo y de tokenizador proceden de mlx-community/parakeet-tdt-0.6b-v3 (revisión `ed2b7e8c15f9aaa0b5772e2efb986255eaef7e15`), que comparte arquitectura y tokenizador. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de audio, la composición del dataset de ajuste fino ni sobre si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla (speech-to-text) multilingüe en 25 idiomas europeos, incluido el español.
- Transcripción de audio a texto mediante decodificación token-and-duration transducer, con emisión eficiente de tokens.
- Soporte de 25 idiomas con un único modelo, sin necesidad de especificar el idioma manualmente en la conversión (según la naturaleza multilingüe del modelo base).
- Ejecución nativa en Apple Silicon vía MLX, integrable con el cargador Parakeet de mlx-audio-swift.
- Disponibilidad de exportación ONNX para su uso con runtimes como sherpa-onnx (citado en la integración con OpenWhispr).
- Disponibilidad de exportación GGUF y de un canal de descarga alternativa.
- No incluye capacidades de visión, audio-vision, generación de texto libre ni tool calling: es estrictamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio multilingüe en texto con una huella de memoria de ~1,5 GB, lo que permite ejecutarlo en portátiles con Apple Silicon sin depender de la nube.
- Subtitulado de vídeo multilingüe: al cubrir 25 idiomas europeos, puede generar subtítulos para contenido en español, alemán, francés o polaco con el mismo modelo.
- Dictado por voz en aplicaciones de escritorio: la integración con MLX y mlx-audio-swift permite incrustar transcripción local en apps nativas de macOS.
- Asistentes de voz offline con requisitos de privacidad: al ejecutarse localmente, evita enviar audio a servicios externos, adecuado para entornos sanitarios o legales.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grandes volúmenes de grabaciones para hacerlas buscables (por ejemplo, archivos periodísticos o registros de atención al cliente).
- Herramientas de accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva, aprovechando la decodificación TDT para reducir latencia.
- Integración en pipelines de contacto con clientes: transcripción previa al análisis de sentimiento o resumen, con la ventaja de licencia CC-BY-SA-4.0 para uso comercial con atribución.
- Transcripción de audio en dispositivos de borde: la exportación ONNX permite desplegarlo con sherpa-onnx en plataformas ligeras (referenciado por su adopción en OpenWhispr 1.10.0 como modelo local recomendado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión MLX. La model card remite a la model card original de oruk/orukeet para benchmarks, cita y limitaciones, pero dichos datos no se incluyen en el material proporcionado. No se presentan cifras de MMLU, HumanEval, GSM8K ni de WER para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en precisión de 16 bits para los 627 millones de parámetros (dato recogido de savrn.com); el repositorio MLX ocupa 1,3 GB.
- Cabe en GPUs de consumo: sí, por su reducido tamaño; cualquier GPU con 2 GB o más de memoria puede alojarlo en fp16. También es apto para memoria unificada de Apple Silicon por su naturaleza MLX.
- GPUs profesionales citadas: el proveedor SAVRN indica que se puede ejecutar en 1x MI300X; por tamaño, también cabría en A100, H100 y en GPUs de consumo como la RTX 4090.
- Despliegue: MLX (vía mlx-audio-swift) para Apple Silicon; sherpa-onnx mediante exportación ONNX; existen distribuciones GGUF para runtimes compatibles.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación TDT del modelo base está diseñada para favorecer la velocidad frente a esquemas autoregresivos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| itsreidar/orukeet-mlx (esta ficha) | ~627 M | 25 | CC-BY-SA-4.0 | MLX safetensors |
| oruk/orukeet (original) | ~627 M | 25 | CC-BY-SA-4.0 | safetensors y otras conversiones (ONNX, GGUF) |
| NVIDIA Parakeet TDT 0.6B v3 (modelo base) | ~600 M | 25 (europeos) | no disponible en la informacion proporcionada | NeMo |
| Modelos ASR multilingues tipo Whisper | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

Nota: no se dispone en la información proporcionada de cifras de WER comparativas ni de especificaciones verificadas de los modelos alternativos, por lo que la comparativa se limita a los aspectos confirmados.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo reentrenado: hereda íntegramente los sesgos y limitaciones del modelo original Orukeet y de su base NVIDIA Parakeet TDT 0.6B v3.
- Riesgo de errores de transcripción (WER) en audio con ruido, acentos marcados, solapamiento de voces o terminología especializada; no se han publicado cifras de WER en la información disponible.
- Cobertura idiomática limitada a los 25 idiomas europeos listados; no soporta idiomas fuera de esa lista ni traducción.
- Riesgo de alucinación en el caso del ASR: pueden aparecer palabras o frases que no se han pronunciado en segmentos de silencio o de baja calidad.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia (efecto copyleft). Revisar LICENSE, LICENSE-WEIGHTS y NOTICE.md incluidos en el repositorio.
- El autor de la conversión no es el autor del modelo original; para incidencias de calidad del reconocimiento hay que remitirse a Oruk AI.
- El repositorio es una conversión MLX: el rendimiento óptimo depende del framework MLX y de hardware Apple Silicon; en otros entornos conviene usar la exportación ONNX o GGUF.
- No se aportan datos de fecha de entrenamiento ni de composición del dataset, por lo que no puede evaluarse la cobertura de dominios ni posibles sesgos demográficos.

## Enlaces

- Modelo en HuggingFace (esta conversión): https://huggingface.co/itsreidar/orukeet-mlx
- Modelo original: https://huggingface.co/oruk/orukeet
- Repositorio GitHub de Oruk AI: https://github.com/Oruk-AI/orukeet
- Model card original en GitHub: https://github.com/Oruk-AI/orukeet/blob/main/MODEL_CARD.md
- Tokenizador y configuración NeMo: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Cargador MLX Parakeet (mlx-audio-swift): https://github.com/Blaizzy/mlx-audio-swift
- Distribución GGUF: https://local-ai-zone.github.io/models/orukeet.html
- Ficha en SAVRN: https://savrn.com/models/orukeet
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/orukeet-oruk
