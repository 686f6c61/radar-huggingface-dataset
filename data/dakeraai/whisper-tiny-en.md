# DakeraAI/whisper-tiny.en

## Resumen

`DakeraAI/whisper-tiny.en` es un espejo verificado del modelo `openai/whisper-tiny.en` de OpenAI, publicado por Dakera, una empresa que comercializa un motor de memoria autoalojado para agentes de IA. El repositorio no contiene un modelo nuevo ni un ajuste fino: los tres ficheros que lo componen (`encoder_model.onnx`, `decoder_model.onnx` y `tokenizer.json`) se copian byte a byte desde `onnx-community/whisper-tiny.en` y se verifican mediante sumas SHA-256. El modelo original es un transformer encoder-decoder de reconocimiento automático del habla (ASR) de la familia Whisper, en su variante "tiny" y especializada en inglés ("en"), con aproximadamente 39 millones de parámetros.

El propósito de esta publicación es puramente operativo: Dakera lo utiliza para transcribir adjuntos de audio y convertirlos en memorias indexables dentro de su motor de memoria, y publica el espejo para que las instalaciones no dependan de un único origen de descarga. La relevancia, por tanto, no está en capacidades nuevas sino en la trazabilidad de la cadena de suministro (checksums públicos, licencia Apache-2.0 heredada) y en la disponibilidad en formato ONNX listo para inferencia sin conversión.

Para desarrolladores e investigadores, este repositorio es útil como fuente estable y verificable de los pesos ONNX de Whisper tiny.en, no como un modelo a evaluar por su rendimiento. Cualquier análisis de calidad, sesgos o idiomas debe remitirse al modelo original de OpenAI y a la conversión de onnx-community, que son los artefactos reales que aquí se replican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | no disponible en la información proporcionada (la variante Whisper tiny se sitúa en torno a 39 M, dato no confirmado en este repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo distribuye pesos ONNX sin cuantizar de forma explícita |
| Idiomas soportados | no disponible en la información proporcionada; la variante `.en` del nombre indica especialización en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) más `tokenizer.json` |

## Arquitectura y entrenamiento

El artefacto distribuido es la conversión a ONNX de Whisper tiny.en: un encoder que procesa espectrogramas log-Mel de audio y un decoder autorregresivo que genera tokens de texto, con el tokenizer asociado. El repositorio de Dakera no aporta información sobre la arquitectura interna más allá de los nombres de fichero, y no documenta datos de entrenamiento, número de tokens, composición del corpus ni si hubo RLHF o ajuste por preferencias. Esos detalles corresponden al modelo original de OpenAI y a la conversión de `onnx-community`, cuyas model cards no se incluyen en la información proporcionada.

La única innovación destacable en este repositorio es de ingeniería de distribución: los tres ficheros se copian byte a byte y se publican con sumas SHA-256 para que el consumidor pueda verificar la integridad. Dakera indica que descarga primero desde este espejo y recurre a los repositorios originales si no está disponible, validando ambos contra el mismo hash. No hay ajuste fino, destilación ni modificación de pesos.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) sobre audio en inglés, según la variante `.en` del nombre del modelo.
- Generación de transcripciones a partir de audio, en el pipeline `automatic-speech-recognition` declarado en el repositorio.
- Ejecución mediante ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Integración con el motor de memoria de Dakera para convertir adjuntos de audio en memorias buscables.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de pensamiento.
- No se documentan capacidades multilingües; la variante `.en` sugiere uso limitado al inglés.

## Casos de uso

- Transcripción de adjuntos de audio en Dakera: el modelo convierte notas de voz o ficheros de audio en texto que el motor de memoria indexa y hace recuperable mediante búsqueda vectorial y de texto completo. Es el caso de uso declarado por el autor del espejo.
- Pipeline de ASR autoalojado en inglés: al estar en ONNX, se puede ejecutar con ONNX Runtime en servidores propios sin GPU dedicada, útil para entornos con requisitos de privacidad.
- Verificación de integridad de artefactos: los checksums SHA-256 publicados permiten a un equipo de plataforma auditar que los pesos desplegados coinciden con los esperados antes de ponerlos en producción.
- Espejo de respaldo en infraestructura propia: organizaciones que no quieren depender de un único origen de descarga pueden alojar este repositorio como fuente secundaria con validación por hash.
- Prototipado rápido de interfaces de voz: la variante tiny es adecuada para pruebas de concepto de transcripción en inglés donde la latencia y el coste importan más que la precisión máxima.
- Transcripción de audio en flujos de CI/CD o tareas por lotes: al ser un modelo pequeño en ONNX, se puede empaquetar en contenedores ligeros para procesar colas de audio en inglés de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,2 GB y los ficheros ONNX suman aproximadamente 151 MB (118,4 MB del decoder y 32,9 MB del encoder), lo que sugiere un modelo muy ligero.
- GPU recomendadas: no disponible; por el tamaño de los artefactos, la inferencia en CPU con ONNX Runtime es viable, aunque no se documenta ningún requisito concreto.
- ¿Cabe en GPU de consumo? No se documenta; el tamaño de los pesos indica que cabría en cualquier GPU de consumo actual, pero es una inferencia a partir del tamaño de fichero, no un dato publicado.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el entorno habitual para este tipo de modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DakeraAI/whisper-tiny.en (este) | no disponible (variante tiny) | no disponible | inglés (por nombre) | Apache-2.0 | ONNX | Espejo verificado de openai/whisper-tiny.en |
| openai/whisper-tiny.en | no disponible en la información | no disponible | inglés | Apache-2.0 | PyTorch / safetensors | Modelo original de OpenAI |
| onnx-community/whisper-tiny.en | no disponible en la información | no disponible | inglés | no disponible en la información | ONNX | Origen directo de los ficheros de este espejo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a licencia, formato y procedencia.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación de precisión, sesgo o cobertura lingüística del Whisper tiny.en original se hereda sin cambios.
- La variante `.en` está especializada en inglés; no se documenta soporte para otros idiomas y el uso en castellano probablemente degrade la calidad, aunque no hay datos publicados en este repositorio.
- Riesgo de alucinación en transcripciones: los modelos Whisper pueden generar texto plausible en segmentos de audio con ruido o silencio; no se documenta mitigación específica en este espejo.
- Sesgos conocidos: no documentados en la información proporcionada; deben consultarse en la model card original de OpenAI.
- Licencia Apache-2.0, que permite uso comercial, pero el crédito y las condiciones del modelo original siguen aplicando; el repositorio incluye un fichero `LICENSE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación independiente más allá de los checksums publicados.
- La fecha de creación indicada (2026-11-04) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- No se documentan requisitos de hardware, latencia ni límites de longitud de audio; en producción habrá que validar el comportamiento con fragmentos largos y con audio de baja calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/whisper-tiny.en
- Modelo original: https://huggingface.co/openai/whisper-tiny.en
- Conversión ONNX de origen: https://huggingface.co/onnx-community/whisper-tiny.en
- Licencia en el repositorio: https://huggingface.co/DakeraAI/whisper-tiny.en/blob/main/LICENSE
- Sitio web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn de Dakera AI: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
