# kstorm77/meloa

## Resumen

`kstorm77/meloa` no es un modelo entrenado, sino un repositorio de distribución: un paquete que reúne, en carpetas independientes, todos los modelos que las aplicaciones Meloa descargan en tiempo de instalación. Cada carpeta contiene los ficheros del modelo original sin modificar, junto con su licencia, sus ficheros de aviso y un README con el tamano y el SHA-256 de cada fichero; las apps verifican ese hash antes de usar el modelo. El repositorio aloja 11 carpetas que cubren transcripción (Parakeet TDT 0.6B v2, Granite Speech 4.1 2B, Whisper en varias tallas y el fine-tune danés Edda v0.2), detección de idioma, diarización de hablantes y generación de notas de reunión con un LLM.

El interés practico es de ingeniería de despliegue: ofrece un conjunto coherente y verificado de dependencias para una aplicación de actas de reuniones, con variantes para equipos de altas prestaciones, equipos modestos y teléfonos, y con separación explicita de licencias por modelo. No hay una arquitectura única ni un entrenamiento propio: convive un FastConformer-TDT, un modelo voz-lenguaje, varios transformers encoder-decoder de la familia Whisper, modelos de segmentación y embeddings de hablante y un LLM decoder-only.

El dato de safetensors del repositorio (1.837.275.136 parámetros) es un agregado del conjunto de ficheros y no describe ninguna red concreta. El repo ocupa 14,2 GB y no publica resultados de benchmarks ni una model card técnica unificada; su utilidad esta en la trazabilidad y la verificación de integridad, no en métricas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo, sin arquitectura única: FastConformer-TDT (Parakeet TDT), modelo voz-lenguaje (Granite Speech 4.1), transformer encoder-decoder (familia Whisper), segmentación de hablante (pyannote 3.0), embeddings de hablante (TitaNet-small) y LLM decoder-only (Qwen3.5-4B, según el nombre de la carpeta) |
| Parametros totales | 1.837.275.136 declarados vía safetensors para el agregado del repositorio; no corresponde a un único modelo. Las carpetas individuales van desde modelos de decenas de millones de parámetros (whisper-base, whisper-small) hasta ~4B (notes/qwen3.5-4b) |
| Parametros activos | No aplica: no hay evidencia de arquitecturas MoE en la información disponible |
| Longitud de contexto | no disponible (el repositorio no documenta ventanas de contexto; en ASR el límite relevante es la ventana de audio, no documentada aquí) |
| Tipos de cuantizacion | GGUF q5_1 (language-detection/whisper-base-q5_1 y phone/whisper-small-q5_1); ONNX a precisión completa (Parakeet danés exportado con sherpa-onnx); pesos originales sin cuantizar en el resto de carpetas |
| Idiomas soportados | Inglés (Parakeet, Granite Speech, Whisper), danés (whisper-small-danish, Edda v0.2, Parakeet-dk), detección de idioma genérica (whisper-base), otras lenguas vía whisper-large-v3; Granite Speech 4.1 2B cubre inglés, francés, alemán, español, portugués y japonés |
| Licencia | `other` con esquema `per-folder`: cada carpeta conserva la licencia de su fuente (CC BY 4.0, Apache-2.0, MIT, MIT or Apache-2.0). Meloa no licencia nada propio |
| Formato de pesos | safetensors, ONNX, GGUF y `.nemo` (fine-tune Parakeet) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un espejo de artefactos. Cada carpeta declara la fuente de la que procede y mantiene los ficheros sin cambios, de modo que las arquitecturas son las de los modelos originales. Entre ellas figuran Parakeet TDT 0.6B v2 de NVIDIA (transducer TDT sobre encoder FastConformer, con tokenizador multilingüe reutilizado del modelo base y decodificación idéntica a `parakeet-tdt-0.6b-v3` en el fine-tune danés), Granite Speech 4.1 2B de IBM (modelo voz-lenguaje compacto para ASR multilingüe y traducción de voz bidireccional), la familia Whisper de OpenAI en tallas base, small y large-v3, pyannote segmentation 3.0 para localizar turnos de habla, TitaNet-small para embeddings de hablante y un Qwen3.5-4B para la redacción de notas.

Tampoco se documentan en la información disponible los volúmenes de tokens, la composición de los datasets ni las etapas de alineación (RLHF/DPO) de cada componente: esos detalles corresponden a las model cards de las fuentes originales, no a este repositorio. La innovación técnica relevante aquí es de empaquetado y cadena de suministro: verificación SHA-256 fichero a fichero antes de la carga, separación estricta de licencias y selección por perfil de hardware (versiones ligeras para equipos con "lower score" y para teléfono, versiones completas para equipos con "higher score").

## Capacidades

- Transcripción de voz a texto en inglés con dos perfiles: Parakeet TDT 0.6B v2 para equipos modestos y Granite Speech 4.1 2B para equipos con más recursos.
- Transcripción en danés con `whisper-small-danish` y con el fine-tune `Edda v0.2`, además del fine-tune Parakeet danés publicado aparte por el mismo autor.
- Transcripción en cualquier otro idioma mediante `whisper-large-v3`.
- Detección automática del idioma de una reunión, con variante de escritorio (`sherpa-onnx-whisper-base`) y variante cuantizada para móvil (`whisper-base-q5_1`).
- Diarización de hablantes en dos etapas: segmentación temporal con pyannote 3.0 y separación de identidades mediante embeddings de TitaNet-small.
- Traducción de voz bidireccional (AST) y ASR multilingüe con Granite Speech 4.1 2B (inglés, francés, alemán, español, portugués y japonés).
- Generación de notas de reunión a partir de la transcripción con el LLM `qwen3.5-4b`.
- Inferencia en el propio teléfono con `whisper-small-q5_1` en GGUF.
- Verificación de integridad de cada fichero descargado contra su SHA-256 declarado.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y uso conversacional como tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni modo de razonamiento explícito para ninguno de los componentes.

## Casos de uso

- Actas de reuniones de extremo a extremo: la aplicación encadena detección de idioma, transcripción, diarización y redacción de notas; el repositorio proporciona los cuatro eslabones con variantes por potencia de equipo, lo que permite el mismo producto en portátiles antiguos y en estaciones de trabajo.
- Transcripción de reuniones en inglés en equipos sin GPU dedicada: `english/parakeet-tdt-0.6b-v2` está pensado explícitamente para equipos con puntuación baja, con un encoder FastConformer-TDT de 0,6B que mantiene la latencia contenida.
- Reuniones en danés en entornos corporativos daneses: `danish/edda-v0.2` o `whisper-small-danish` según recursos, evitando el sesgo hacia el inglés de los modelos genéricos.
- Identificación de quién habla y cuánto: la pareja `speakers/pyannote-segmentation-3.0` + `speakers/titanet-small` permite generar transcripciones atribuidas por participante, útil en actas con obligaciones de trazabilidad.
- Traducción de voz en soporte multilingüe: Granite Speech 4.1 2B cubre ASR y traducción bidireccional en seis idiomas, adecuado para reuniones con participantes hispanohablantes, franceses o japoneses.
- Captura móvil sin conexión: `phone/whisper-small-q5_1` en GGUF permite transcribir en el dispositivo, sin enviar audio a la nube, en escenarios con requisitos de privacidad o conectividad intermitente.
- Distribución verificable en CI/CD: los pipelines de empaquetado pueden descargar cada carpeta, comprobar el SHA-256 del README y fallar el build si un artefacto upstream cambia, lo que da reproducibilidad a las releases de la app.
- Investigación comparativa de ASR: al reunir Parakeet, Whisper y Granite Speech con licencias claras, sirve como banco de pruebas homogéneo para evaluar motores de transcripción sobre el mismo audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, latencia ni throughput para ninguna de las carpetas, y la entrada de registro externa localizada (`free2aitools.com`) figura con metadatos pendientes y sin cifras.

## Requisitos de hardware

- Tamano total del repositorio: 14,2 GB. La descarga completa no es necesaria en producción: la app solo baja las carpetas que corresponden al perfil del dispositivo.
- Perfil "computers with a lower score": Parakeet TDT 0.6B v2 o whisper-small; el danés ligero usa `whisper-small-danish`. Los ficheros de 0,6B en fp16 ocupan del orden de 1,2 GB de pesos, por lo que caben en GPU de consumo con 4-6 GB de VRAM y en CPU con latencia mayor.
- Perfil "computers with a higher score": Granite Speech 4.1 2B y Edda v0.2; un modelo de ~2B en fp16 ronda los 4 GB de pesos, manejable en RTX 3060/4060 Ti de 8-12 GB y en A100/H100 para lotes grandes.
- `other-languages/whisper-large-v3`: el modelo más pesado del bloque ASR; requiere GPU con al menos 8-10 GB de VRAM en fp16 para trabajar con comodidad, o CPU con throughput bajo.
- `notes/qwen3.5-4b`: ~4B parámetros según el nombre de la carpeta; en fp16 son unos 8 GB de pesos, por lo que encaja en RTX 4090 (24 GB) y en GPUs de 16 GB, y requiere cuantización para tarjetas de 8 GB.
- Perfil teléfono: `phone/whisper-small-q5_1` en GGUF q5_1, pensado para ejecución local en el dispositivo sin GPU.
- Opciones de despliegue: ONNX Runtime o sherpa-onnx para las carpetas ONNX (Parakeet, detección de idioma), llama.cpp/Ollama para los GGUF, vLLM o TGI para el LLM de notas si se sirve en servidor, y NeMo para los artefactos `.nemo` (`ASRModel.restore_from`).
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada. Las estimaciones de VRAM anteriores son aritmética a partir del número de parámetros, no cifras verificadas por el autor.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Formato | Diferencia clave frente a meloa |
|---|---|---|---|---|---|---|
| `kstorm77/meloa` | Paquete de 11 modelos para una app de actas | 1,837B agregados (sin modelo único) | no disponible | per-folder (CC BY 4.0, Apache-2.0, MIT) | safetensors, ONNX, GGUF, `.nemo` | Verificación SHA-256 y selección por hardware; no es un modelo entrenado |
| `openai/whisper-large-v3` (fuente original) | Modelo ASR único | ~1,55B (dato de conocimiento público, no en la información) | no disponible | MIT o Apache-2.0 según la carpeta espejo | safetensors | Solo ASR multilingüe; sin diarización, detección de idioma separada ni generación de notas |
| `nvidia/parakeet-tdt-0.6b-v2` (fuente original) | ASR inglés | 0,6B | no disponible | CC BY 4.0 | `.nemo` | Motor único y ligero; requiere montar por separado el resto del pipeline |
| `ibm-granite/granite-speech-4.1-2b` (fuente original) | Modelo voz-lenguaje (ASR + AST) | ~2B | no disponible | Apache-2.0 | safetensors | Aporta traducción de voz en seis idiomas; no incluye diarización ni notas |
| `kstorm77/Parakeet-dk-meloa` | Fine-tune ASR danés | 0,6B (base) | no disponible | no disponible en la información | `.nemo`, ONNX (variante sherpa-onnx) | Especializado solo en danés, complementario a las carpetas `danish/` de este repo |

## Limitaciones y advertencias

- El repositorio no es un modelo: no tiene model card técnica, ni métricas, ni descripción de entrenamiento. Cualquier evaluación de calidad debe hacerse sobre los modelos originales.
- Las licencias son heterogéneas y se aplican carpeta a carpeta. CC BY 4.0 (Parakeet) exige atribución; Apache-2.0 y MIT son permisivas pero requieren conservar avisos. La etiqueta "MIT or Apache-2.0" de las carpetas Whisper es ambigua y conviene resolverla con los ficheros `LICENSE` de cada carpeta antes de un uso comercial.
- "Nothing in this repository is licensed by Meloa itself": no hay licencia paraguas que cubra el conjunto, lo que complica la redistribución del repo completo como un único producto.
- Las apps dependen, según la model card, de la comprobación SHA-256 antes de cargar un fichero; saltarse esa verificación elimina la garantía de integridad que justifica el repositorio.
- El dato de 1.837.275.136 parámetros es un agregado de safetensors y no debe citarse como tamano de un modelo concreto.
- El LLM de notas puede generar contenido no presente en la transcripción (alucinación) y requiere revisión humana en contextos con responsabilidad legal o contractual.
- Los modelos ASR cometen errores sistemáticos en audio con ruido, solapamiento de hablantes, acentos no representados en el entrenamiento y vocabulario técnico; no se han publicado tasas de error para estas carpetas.
- La diarización con pyannote 3.0 + TitaNet no garantiza identificación nominal de personas: asigna etiquetas de hablante, no identidades.
- Cobertura lingüística limitada por diseño: inglés y danés están optimizados; el resto depende de whisper-large-v3 y de Granite Speech, con calidad no documentada.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta y fue creado en octubre de 2026 según los metadatos: no hay validación comunitaria ni historial de uso que respalde su estabilidad a largo plazo.
- No se documentan requisitos de hardware, latencias ni límites de contexto, lo que obliga a medir en el entorno objetivo antes de dimensionar producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kstorm77/meloa
- Licencia del repositorio (documento de referencia): https://huggingface.co/kstorm77/meloa/blob/main/README.md
- Carpeta `english/parakeet-tdt-0.6b-v2`: https://huggingface.co/kstorm77/meloa/tree/main/english/parakeet-tdt-0.6b-v2
- Espejo de Parakeet TDT 0.6B v2: https://huggingface.co/kstorm77/parakeet-tdt-0.6b-v2
- Carpeta `english/granite-speech-4.1-2b`: https://huggingface.co/kstorm77/meloa/tree/main/english/granite-speech-4.1-2b
- Espejo de Granite Speech 4.1 2B: https://huggingface.co/kstorm77/granite-speech-4.1-2b
- Fine-tune danés de Parakeet: https://huggingface.co/kstorm77/Parakeet-dk-meloa
- Exportación ONNX del fine-tune danés para sherpa-onnx: https://huggingface.co/kstorm77/Parakeet-dk-meloa-sherpa-onnx
- Entrada en registro externo (metadatos pendientes, sin benchmarks): https://free2aitools.com/model/kstorm77/parakeet-dk-meloa-sherpa-onnx
