# johnpattern/safenotes-funasr-nano-ov

## Resumen

`safenotes-funasr-nano-ov` es una conversión de formato del modelo de reconocimiento automático del habla Fun-ASR-Nano-2512 de FunAudioLLM (Tongyi Lab, Alibaba) a OpenVINO IR con pesos comprimidos a int8. No es un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue creado por Safenotes, una aplicación local de transcripción de reuniones, para ejecutar el modelo en hardware Intel sin GPU dedicada. La autoría intelectual del modelo corresponde íntegramente a FunAudioLLM.

El modelo original ronda los 0,8 mil millones de parámetros y combina un codificador de audio FunASR SAN-M/DFSMN con un adaptador transformer de 2 capas que alimenta un decodificador Qwen3-0.6B. Su cobertura lingüística es un conjunto fijo de mandarín e inglés, con especial solidez en chino. La conversión mantiene esa arquitectura y solo cambia el formato de ejecución y la precisión numérica de los pesos.

La relevancia de este repositorio es práctica: demuestra un patrón de despliegue ASR en el borde (on-device) sobre CPU Intel mediante OpenVINO, con verificación de integridad por sha256 de cada fichero y ejecución completamente local. Para desarrolladores que necesiten transcripción en chino en equipos sin GPU, es una referencia directa de cómo empaquetar un ASR con decodificador LLM en formato OpenVINO int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio FunASR SAN-M/DFSMN + adaptador transformer de 2 capas + decodificador Qwen3-0.6B |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos int8 (compresión NNCF); tokenizer/detokenizer convertidos a IR de OpenVINO |
| Idiomas soportados | Mandarín e inglés (conjunto fijo según la documentación del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), tokenizer OpenVINO, ficheros de tokenizer Qwen3 (vocab.json, merges.txt, tokenizer.json) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un pipeline ASR híbrido: un codificador acústico FunASR SAN-M/DFSMN procesa la señal de audio, un adaptador transformer de 2 capas proyecta las representaciones hacia el espacio del decodificador, y un Qwen3-0.6B estándar genera el texto. Este diseño de "ASR con decodificador LLM" sustituye el decodificador CTC/atención clásico por un modelo de lenguaje, lo que aporta robustez en la salida textual y permite reutilizar el tokenizer de Qwen3.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original. La conversión de Safenotes no incluye reentrenamiento: se exportó `model.pt` con el exportador FunASR de optimum-intel 2.2 (funasr 1.4.19, licencia MIT) y se aplicó compresión de pesos int8 con NNCF. El repositorio ocupa 863.684.371 bytes en 16 ficheros, con el decodificador como componente dominante (597,6 MB en `.bin`) y el codificador en 235,3 MB.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de texto transcrito.
- Transcripción optimizada para mandarín, con soporte adicional de inglés según el conjunto lingüístico fijo del modelo base.
- Decodificación basada en LLM (Qwen3-0.6B), lo que aporta un modelado de lenguaje más fuerte en la generación de la transcripción.
- Ejecución en CPU Intel mediante OpenVINO, sin requisito de GPU.
- Inferencia completamente local: no se envían audio ni texto a servidores externos.
- Verificación de integridad de ficheros por sha256 en el flujo de uso de Safenotes.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones en local: Safenotes usa este modelo para generar transcripciones en chino tras la reunión en PCs sin GPU utilizable, ejecutando todo el pipeline en el equipo del usuario.
- Notas automáticas en entornos con requisitos de privacidad: al no salir audio ni texto del dispositivo, encaja en escenarios corporativos o sanitarios donde no se permite subir grabaciones a la nube.
- Despliegue en flotas de portátiles corporativos con CPU Intel: el formato OpenVINO IR int8 permite distribuir un runtime ligero y aprovechar las extensiones de inference de Intel sin hardware dedicado.
- Subtitulado y actas de reuniones en chino: el decodificador Qwen3-0.6B mejora la coherencia textual frente a decodificadores CTC clásicos en habla espontánea.
- Prototipado de pipelines ASR on-device: sirve como referencia de empaquetado de un ASR con decodificador LLM en OpenVINO, incluido el manejo de tokenizer y detokenizer como IR.
- Integración en aplicaciones de escritorio: al ser un artefacto de 0,9 GB con ficheros verificables, es viable empaquetarlo en instaladores de aplicaciones locales de notas o dictado.
- Evaluación comparativa de backends: permite medir latencia y calidad de un ASR de ~0,8B en CPU Intel frente a alternativas en formato GGUF o PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el modelo está pensado para CPU Intel vía OpenVINO. El tamaño del repositorio es de 0,9 GB, por lo que la huella en memoria es del orden de 1 GB para los pesos int8, más el espacio de trabajo del runtime.
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU Intel. No hay datos de rendimiento en GPU para esta conversión concreta.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en RTX 4090 u otras GPU de consumo; el formato OpenVINO puede ejecutarse en GPU Intel integradas o Arc, pero no se aportan cifras.
- Opciones de despliegue: OpenVINO Runtime con los IR del repositorio (encoder, decoder, tokenizer y detokenizer); el flujo de Safenotes descarga los ficheros de una revisión fijada y verifica sha256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| safenotes-funasr-nano-ov (este) | ~0,8B | No disponible | Mandarín, inglés | Apache 2.0 | OpenVINO IR int8 | Conversión de terceros, orientada a CPU Intel |
| FunAudioLLM/Fun-ASR-Nano-2512 | ~0,8B | No disponible | Mandarín, inglés | Apache 2.0 | PyTorch (model.pt) | Modelo original de FunAudioLLM/Tongyi Lab |
| OpenASR/funasr-nano | ~0,8B | No disponible | Mandarín, inglés | No disponible en la información | No disponible | Reempaquetado comunitario del mismo modelo base |

## Limitaciones y advertencias

- No es un lanzamiento oficial de FunAudioLLM; los autores originales no lo respaldan. Cualquier incidencia debe atribuirse a la conversión de Safenotes.
- La cobertura lingüística es un conjunto fijo de mandarín e inglés; no se debe asumir soporte para castellano ni otros idiomas.
- Al ser una conversión int8, puede existir una degradación de precisión frente al modelo original en PyTorch; no se publican métricas comparativas que la cuantifiquen.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta estimar su rendimiento en producción sin medición propia.
- El repositorio no incluye un fichero LICENSE propio más allá de la referencia a Apache 2.0 en los metadatos y en el texto de la model card; conviene revisar la licencia del modelo base antes de un uso comercial.
- Riesgo de alucinación y errores de transcripción inherente a los decodificadores basados en LLM, especialmente en audio ruidoso o con solapamiento de hablantes.
- No se documentan sesgos específicos, pero al estar entrenado principalmente para chino e inglés puede tener un rendimiento desigual entre acentos y registros.
- El modelo está optimizado para OpenVINO; usarlo fuera de ese runtime requiere reconvertir desde el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnpattern/safenotes-funasr-nano-ov
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Revisión fijada del modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/tree/272c57b82523ada6fd87095e955f8e29100979ab
- Organización FunASR en Hugging Face: https://huggingface.co/funasr/models
- Reempaquetado comunitario OpenASR: https://huggingface.co/OpenASR/funasr-nano/blob/main/README.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
