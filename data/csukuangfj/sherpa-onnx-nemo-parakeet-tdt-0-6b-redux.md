# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-redux

## Resumen

El paquete `sherpa-onnx-nemo-parakeet-tdt-0.6b-redux` es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) Parakeet Redux de Moondream, publicado por el proyecto sherpa-onnx (csukuangfj). Redux es una versión de 1,58 bits (ternaria) del modelo `nvidia/parakeet-tdt-0.6b-v3`: mantiene la misma arquitectura y el mismo vocabulario de 8193 tokens, pero cada peso lineal y de convolución pointwise del encoder toma valores -1, 0 o +1 con una escala por grupo de 128 columnas. El checkpoint original empaquetado ocupa 178 MB; como ONNX Runtime no dispone de kernels ternarios, esta exportación decodifica el empaquetado a un grafo denso y lo cuantiza, de modo que el paquete resultante es un transductor ONNX convencional.

El modelo es un transductor offline completo (encoder, decoder y joiner) que procesa audio mono a 16 kHz y soporta 25 idiomas europeos. Se distribuye en dos variantes: `sherpa-onnx-nemo-parakeet-tdt-0.6b-redux` (fp32) y `sherpa-onnx-nemo-parakeet-tdt-0.6b-redux-int8` (int8). Su relevancia radica en que ofrece una alternativa de descarga reducida frente a las versiones completas de Parakeet, con un rendimiento competitivo en idiomas como el maltés, aunque con una pérdida de precisión notable en la variante int8.

La licencia es CC BY 4.0, lo que permite uso comercial con atribución, y el código de exportación de sherpa-onnx está bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor NeMo (encoder, decoder y joiner) con decodificación TDT (Token-and-Duration Transducer); encoder con pesos ternarios (-1, 0, +1) y escala por grupo de 128 columnas en el checkpoint original |
| Parametros totales | 0,6 mil millones (0.6b) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR offline; se recomienda dividir audio largo en fragmentos de 15-20 s) |
| Tipos de cuantizacion | fp32 e int8 (dos paquetes separados) |
| Idiomas soportados | 25 idiomas: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finlandés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.weights, decoder.onnx, joiner.onnx; variantes .int8.onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de transductor de NVIDIA NeMo, concretamente la variante TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para acelerar la decodificación. Redux conserva la misma arquitectura y el mismo vocabulario de 8193 tokens que `nvidia/parakeet-tdt-0.6b-v3`, pero sustituye los pesos lineales y de convolución pointwise del encoder por valores ternarios (-1, 0, +1) con una escala por grupo de 128 columnas. El empaquetado original (`thrush-ternary-v2`, documentado en el fichero `ternary.json` del checkpoint) es lo que reduce el checkpoint a 178 MB.

Los pesos fueron entrenados por Moondream a partir de la arquitectura y el tokenizador de NVIDIA. La exportación a ONNX la realiza el proyecto sherpa-onnx: como ONNX Runtime no tiene kernels ternarios, el script de exportación decodifica el empaquetado a un grafo denso y después lo cuantiza. El resultado es un transductor ONNX estándar, no un modelo ternario en tiempo de ejecución. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción) offline para audio mono a 16 kHz.
- Transcripción en 25 idiomas europeos con un único modelo.
- Decodificación TDT (Token-and-Duration Transducer), que modela duraciones de token para mejorar la eficiencia.
- Dos variantes de precisión: fp32 (mayor exactitud) e int8 (menor tamaño de descarga).
- Integración con la librería sherpa-onnx mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`.
- No realiza identificación de idioma: transcribe, pero no informa de qué lengua ha detectado.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio mono a 16 kHz y genera texto en 25 idiomas, adecuado para aplicaciones de dictado o actas siempre que el audio se divida en fragmentos de 15-20 s en las pausas.
- Subtitulado de contenido audiovisual multilingüe: al cubrir 25 idiomas europeos con un solo paquete ONNX, simplifica pipelines que antes requerían un modelo por idioma.
- Atención al cliente con transcripción de llamadas: la variante fp32 ofrece mayor exactitud (7,62 % WER en inglés) para transcribir conversaciones grabadas antes de su análisis.
- Procesamiento por lotes en servidores sin GPU dedicada: al ser un paquete ONNX de unos 670 MB descomprimido, puede ejecutarse con ONNX Runtime en CPU, lo que facilita el despliegue en infraestructura modesta.
- Aplicaciones de accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva, con la ventaja de la licencia CC BY 4.0 para uso comercial con atribución.
- Investigación en ASR multilingüe: sirve como referencia de modelos ternarios y de cuantización int8, con métricas WER publicadas por idioma en FLEURS.
- Archivado y búsqueda de audio histórico: la transcripción permite indexar grabaciones en varios idiomas y habilitar búsqueda por texto.

## Benchmarks y rendimiento

Resultados propios del proyecto sherpa-onnx sobre el split de test de FLEURS (300 clips deterministas por idioma, sin puntuación ni mayúsculas, mismo harness para los tres modelos). WER en porcentaje; no son directamente comparables con benchmarks publicados por los autores.

| Idioma | Redux int8 (este paquete) | Redux fp32 | v3 int8 | Ultra int8 |
|---|---|---|---|---|
| Inglés | 13,86 | 7,62 | 11,16 | 8,51 |
| Alemán | 11,00 | — | 6,84 | 5,20 |
| Francés | 10,97 | — | 8,69 | 7,48 |
| Español | 5,04 | — | 4,55 | 3,81 |
| Maltés | 39,74 | — | 56,41 | 44,74 |
| Griego | 49,46 | — | 46,64 | 45,19 |
| **Media de los seis** | **21,68** | — | **22,38** | **19,16** |

Redux supera a v3 en maltés por 16,7 puntos y queda por detrás en inglés, alemán, francés y griego; en la media de los seis idiomas está ligeramente por delante de v3. Frente a Ultra, queda por detrás en todos los idiomas salvo el maltés.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete int8 descomprimido ocupa unos 670 MB y el fp32 también unos 670 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo (0,6 mil millones de parámetros) y el peso de los ficheros ONNX.
- Opciones de despliegue: sherpa-onnx con ONNX Runtime (CPU o GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | WER medio (6 idiomas, FLEURS) |
|---|---|---|---|---|---|---|
| Redux int8 (este paquete) | 0,6 B | No disponible | 25 | CC BY 4.0 | ONNX | 21,68 |
| Redux fp32 | 0,6 B | No disponible | 25 | CC BY 4.0 | ONNX | No disponible (solo inglés: 7,62) |
| Parakeet v3 int8 | 0,6 B | No disponible | 25 | No disponible | ONNX | 22,38 |
| Parakeet Ultra int8 | No disponible | No disponible | No disponible | No disponible | ONNX | 19,16 |

## Limitaciones y advertencias

- La variante int8 pierde más exactitud que en v3 o Ultra: en inglés, Redux mide 7,62 % WER en fp32 y 13,86 % en int8, frente a 5,33 % y 8,51 % de Ultra. Los pesos ternarios llevan una escala por grupo de 128 columnas que un cuantizador dinámico por canal no puede representar; el error de cuantización de los pesos es pequeño, pero la salida del encoder diverge y la transcripción pierde precisión. Usar fp32 cuando la exactitud importe y el disco lo permita.
- El audio largo debe dividirse en las pausas: decodificar una grabación entera como un solo clip degrada la calidad y aumenta el consumo de memoria; dividir en fragmentos de 15-20 s en silencios, nunca en ventanas fijas. Esta limitación se hereda del decodificador offline de v3.
- El modelo transcribe, pero no informa de qué idioma ha escuchado; no es un identificador de idioma.
- El audio muy silencioso se ve afectado por un problema del frontend registrado en el repositorio de sherpa-onnx (issue #4024); normalizar la ganancia antes de la inferencia.
- Licencia CC BY 4.0: permite uso comercial con atribución. Ni NVIDIA ni Moondream respaldan este paquete.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-redux
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-redux
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Script de exportación: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-redux
- Workflow de publicación: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Licencia del código sherpa-onnx (Apache-2.0): https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Issue del frontend de audio: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Documentación NeMo en sherpa: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Paquete v3 int8 relacionado: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
