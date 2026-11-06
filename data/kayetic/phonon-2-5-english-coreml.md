# Kayetic/Phonon-2.5-English-CoreML

## Resumen

Phonon 2.5 English Core ML es una conversión del modelo de reconocimiento automático de voz (ASR) Phonon 2.5 English de Fermion Research a un grafo Core ML optimizado para ejecución local en el Neural Engine de los chips Apple. Está pensado para dictado en inglés directamente en el dispositivo (on-device), sin conexión a servicios en la nube, y es el modelo local que utiliza la aplicación de productividad para macOS Super. El paquete se carga sin modificaciones con la librería `phonon-coreml` 1.1.2 mediante la API `Transcriber(bundle:)`.

El modelo base es un derivado de NVIDIA Parakeet TDT 0.6B v3, una arquitectura de tipo transducer (TDT, token-and-duration transducer) especializada en transcripción de voz. La conversión mantiene todos los valores aprendidos del codificador y el decodificador de Phonon 2.5 English, con el codificador en paletas exactas de cinco valores (sparse g16, 6 bits) y el decodificador con tablas de 6 bits reempaquetadas en el formato existente, sin cuantización nueva. El repositorio ocupa 0,4 GB y la licencia es CC-BY-4.0.

La relevancia de esta ficha es doble: por un lado, muestra el estado del arte en ASR on-device sobre Apple silicon, con latencias de decenas de milisegundos y throughput superior a 500× tiempo real en un M5 Pro; por otro, documenta un patrón de conversión reproducible (buckets estáticos de 3, 5, 10, 15, 25 y 35 segundos compartiendo un único blob de pesos) útil para quien quiera portar modelos de voz a Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (token-and-duration transducer), derivada de NVIDIA Parakeet TDT 0.6B v3; grafo Core ML con funciones de codificador estáticas |
| Parametros totales | 0,6 B (heredados del modelo base Parakeet TDT 0.6B v3; no se detalla el desglose en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 3, 5, 10, 15, 25 y 35 s; por defecto ventanas de 15 s a partir de 34,95 s de audio |
| Tipos de cuantizacion | Codificador: paletas exactas de cinco valores, sparse g16, 6 bits; decodificador: tablas de 6 bits reempaquetadas; sin cuantización nueva respecto al original |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 (pesos); código del grafo Apache-2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc` con blob de pesos compartido y `SHA256SUMS`) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Phonon 2.5 English de Fermion Research, que a su vez deriva de NVIDIA Parakeet TDT 0.6B v3. La arquitectura es un transducer TDT: un codificador que procesa el audio y un decodificador que emite tokens junto con predicciones de duración, lo que permite emitir varios tokens por paso y reducir el coste de decodificación. Todos los valores aprendidos del codificador y el decodificador son los del modelo original; las tablas de claves relativas se regeneran a partir de sus pesos de proyección.

La innovación principal de esta conversión es la organización del grafo Core ML. Las funciones del codificador para 3, 5, 10, 15, 25 y 35 segundos comparten un único blob de pesos, y las de 3, 25 y 35 segundos son especializaciones estáticas del grafo de 15 segundos, de modo que las grabaciones cortas y medias se rellenan menos. El decodificador usa 4 hilos y se mantienen 2 peticiones de codificador en vuelo por defecto. La primera carga compila las seis funciones del codificador para el dispositivo (varios minutos, una sola vez); las cargas posteriores tardan unos 2 segundos. No se detallan en la información disponible los volúmenes ni la composición de los datos de entrenamiento del modelo base, ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés con salida de transcripción.
- Procesamiento de audio de 1 a 187 segundos en las pruebas publicadas, con ventanas de 15 s por defecto a partir de 34,95 s.
- Ejecución local en el Neural Engine de Apple silicon, sin llamadas a red.
- Carga directa mediante `phonon-coreml` 1.1.2 (`Transcriber(bundle:)`), compatible con el ecosistema de la app Super para macOS.
- Funciones de codificador especializadas por duración (3, 5, 10, 15, 25 y 35 s) para reducir el relleno en grabaciones cortas.
- Verificación de integridad mediante `SHA256SUMS` y hash del checkpoint de origen.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado en macOS: integración en la app Super para transcribir voz a texto en local, aprovechando que el modelo se carga con `phonon-coreml` y no requiere conexión.
- Notas de reuniones y entrevistas: transcripción de grabaciones de hasta varios minutos con ventanas de 15 s y throughput de 508× tiempo real en M5 Pro, lo que permite procesar una hora de audio en segundos.
- Subtitulado y transcripción por lotes: uso del grafo Core ML en pipelines de procesamiento de audio en Macs con Apple silicon, con coste marginal bajo gracias a la ejecución en Neural Engine.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida, con latencia mediana de 59,63 ms por clip en las pruebas publicadas.
- Procesamiento de audio confidencial: transcripción on-device de conversaciones sensibles sin enviar datos a servidores externos.
- Prototipado de ASR en iOS/macOS: base para desarrolladores que quieran evaluar la calidad de Phonon 2.5 antes de integrar el modelo completo o de entrenar variantes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un Apple M5 Pro (40 clips fijos de 1 a 187 s, opciones por defecto: ventanas de 15 s a partir de 34,95 s, 4 hilos de decodificador, 2 peticiones de codificador en vuelo):

| Modelo | Mediana por clip | Throughput | WER público (360 clips, referencias humanas) |
|---|---:|---:|---:|
| Phonon 2, Core ML | 87,84 ms | 463× tiempo real | 4,22% |
| Phonon 2.5, esta conversión (ventanas de 15 s) | 59,63 ms | 508× tiempo real | 4,07% |

La diferencia de WER entre ambos modelos está dentro de la incertidumbre del bootstrap emparejado, según el autor. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine y la memoria unificada de Apple silicon. El repositorio ocupa 0,4 GB.
- GPU recomendadas: chips Apple silicon con Neural Engine; las mediciones publicadas son sobre un M5 Pro.
- ¿Cabe en consumer GPU? No es el objetivo del formato; está diseñado para Macs y dispositivos Apple, no para GPUs NVIDIA o AMD.
- Opciones de despliegue: Core ML mediante `phonon-coreml` 1.1.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: mediana de 59,63 ms por clip y 508× tiempo real en M5 Pro con la configuración por defecto; primera carga con compilación de las seis funciones del codificador (varios minutos), cargas posteriores de unos 2 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | WER público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon 2.5 English Core ML (esta ficha) | 0,6 B | Ventanas de 3–35 s | 4,07% (360 clips) | CC-BY-4.0 | Hugging Face, formato Core ML |
| Phonon 2 Core ML | 0,6 B (no confirmado en la información disponible) | Ventanas de 15 s (según pruebas) | 4,22% (360 clips) | no disponible | Hugging Face, formato Core ML |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6 B | no disponible | no disponible | no disponible | Modelo base del que deriva Phonon 2.5 |

No se dispone en la información proporcionada de datos comparativos de otros modelos ASR on-device (por ejemplo, Whisper en Core ML) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte multilingüe.
- Es una conversión de formato, no un modelo nuevo: hereda los sesgos y errores del checkpoint Phonon 2.5 English y, en última instancia, de Parakeet TDT 0.6B v3.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o vocabulario técnico; el WER publicado (4,07%) corresponde a un conjunto de 360 clips con referencias humanas y no garantiza el mismo rendimiento en dominios distintos.
- La licencia CC-BY-4.0 exige atribución a Fermion Research y a NVIDIA Parakeet TDT 0.6B v3; el código del grafo es Apache-2.0 y debe respetarse por separado.
- Dependencia de hardware Apple silicon con Neural Engine; no es portable a GPUs convencionales sin reconversión.
- La primera carga implica una compilación de varios minutos en el dispositivo; no es adecuada para despliegues efímeros sin caché.
- El repositorio tiene 16 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es muy limitada.
- No se documentan en la información disponible garantías de producción, soporte ni actualizaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Kayetic/Phonon-2.5-English-CoreML
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Conversión de referencia: https://huggingface.co/FermionResearch/Phonon-2-CoreML
- Librería de carga: https://github.com/fermionresearch/phonon-coreml
- No se han encontrado en la información disponible papers, blogs o demos adicionales.
