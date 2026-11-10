# coder543/parakeet-v3-glade

## Resumen

Parakeet V3 Glade es una conversión del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B V3, publicada por el usuario coder543. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de pesos cuantizados y configuración de ejecución orientado a Glade, un runtime específico para Apple silicon. El repositorio contiene dos variantes autocontenidas, `fast/` y `quality/`, que difieren en la política de atención relativa, la longitud de fragmento y el decodificador empleado.

El modelo base es un sistema ASR de tipo Token-and-Duration Transducer (TDT) con aproximadamente 600 millones de parámetros, pensado para transcripción con marcas de tiempo nativas a pasos de 80 ms. La conversión mantiene la licencia Creative Commons Attribution 4.0 del original y fija los pesos al commit `541d1f99c6b0c3cd0b11a95167540bb8edefd82b` del repositorio de NVIDIA.

Su relevancia es acotada pero técnica: demuestra una ruta de despliegue de ASR de alta velocidad sobre Neural Engine de Apple, con cuantización W8A16 selectiva, atención relativa completa sin truncamiento y contratos de host documentados. No es un modelo para uso general en servidores x86 ni para pipelines estándar de Hugging Face, sino un artefacto de inferencia para hardware y sistema operativo muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-Duration Transducer (TDT) sobre encoder transformer con atención relativa; conversión con grafo de subsampling convolucional |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | `fast/`: 192 posiciones de encoder, fragmentos fijos de 15 s; `quality/`: 576 y 3.008 posiciones compartidas, entradas de 45 s y 4 min, fragmentos fijos de 240 s |
| Tipos de cuantizacion | W8A16 en pesos del encoder con proyecciones sensibles retenidas en FP16; decodificador FP16 (ANE) en `fast/` y FP32 (CPU) en `quality/` |
| Idiomas soportados | no disponible (la model card menciona pruebas puntuales en inglés, alemán y ucraniano, sin lista oficial) |
| Licencia | CC BY 4.0 |
| Formato de pesos | assets de grafo para Glade (no safetensors ni GGUF), con `metadata.json`, `runtime.json` y sidecars |

## Arquitectura y entrenamiento

La arquitectura subyacente es un TDT, variante de RNN-Transducer en la que el modelo predice conjuntamente tokens y duraciones (0, 1, 2, 3 y 4 frames por emisión), lo que permite emitir varios símbolos por frame (hasta diez) y generar alineaciones nativas de palabra a pasos de 80 ms. El encoder emplea atención relativa; en `fast/` es de tipo Fourier finita sobre 192 posiciones, mientras que `quality/` usa atención relativa sinusoidal completa con pesos compartidos entre las formas de 576 y 3.008 posiciones, además de un subsampling convolucional con teselado exacto.

La conversión no reentrena ni ajusta los pesos: parte de los pesos FP32 de NVIDIA y los transforma en grafos estáticos con pesos W8A16 y proyecciones sensibles en FP16. El vocabulario consta de 8.192 tokens no vacíos, con ID de blank 8.192, y el decodificador FP16 devuelve pares de ID local/partición para reconstruir IDs superiores a 2.048 sin redondeo. El estado recurrente es independiente entre fragmentos y ningún bundle trunca la atención dentro de su fragmento ni descarta audio de entrada. El contrato de host para `quality/` exige multiplicar la salida del grafo de subsampling por `subsampling_output_scale = 16` antes de pasarla al encoder; omitirlo produce resultados incorrectos. No hay información sobre composición del dataset de entrenamiento ni sobre RLHF/DPO en la información disponible.

## Capacidades

- Reconocimiento automático del habla con marcas de tiempo nativas de token y palabra a 80 ms por frame.
- Emisión de múltiples símbolos por frame (hasta diez) mediante decodificación TDT voraz.
- Procesamiento por fragmentos con estado recurrente independiente, lo que permite paralelizar fragmentos en lote.
- `fast/`: decodificador FP16 en ANE con batching de hasta 128 fragmentos independientes y cuatro peticiones de encoder concurrentes.
- `quality/`: decodificador FP32 en CPU con batching de hasta cuatro fragmentos y selección de la forma de encoder más pequeña que encaje en cada fragmento.
- Transcripción multilingüe no verificada de forma exhaustiva; la model card cita pruebas en inglés, alemán y ucraniano.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta visión, audio de entrada más allá de la transcripción ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS o iOS: el bundle `fast/` procesa audio a 155,5× en tiempo real en un clip de 20 s y a 563,9× en una grabación de 18 min 15 s sobre un M3 MacBook Air, lo que permite transcribir horas de audio en segundos dentro de una app nativa.
- Subtitulado y alineación temporal: las duraciones predichas por el TDT generan marcas de palabra nativas a 80 ms, adecuadas para generar subtítulos SRT/VTT sin necesidad de un forzado de alineación posterior.
- Procesamiento por lotes de archivos largos en el dispositivo: `quality/` usa fragmentos de 240 s y cinco fragmentos para la grabación de 18 minutos, reduciendo el número de llamadas al encoder frente a los 74 fragmentos de `fast/`.
- Dictado en aplicaciones de escritorio: el decodificador FP16 en ANE y las cuatro peticiones concurrentes permiten mantener latencia baja en transcripción incremental de fragmentos de 15 s.
- Transcripción de contenido multilingüe en dispositivos Apple: aunque no hay lista oficial de idiomas, las pruebas en alemán y ucraniano reproducen exactamente los tokens del modelo fuente, lo que respalda su uso en grabaciones en esos idiomas.
- Investigación y evaluación de cuantización en ASR: el repositorio incluye comparativas de WER entre los pesos FP32 de origen y los bundles cuantizados, útil para estudiar el impacto de W8A16 en decisiones de token.
- Integración en pipelines de accesibilidad: transcripción en tiempo real de audio del sistema en macOS 27 o iOS 27 con memoria pico de aproximadamente 1,29 GB en `quality/`, viable en equipos de 16 GB.

## Benchmarks y rendimiento

Rendimiento medido en un M3 MacBook Air de 16 GB con macOS 27 build 26A428, medianas de tres ejecuciones tras calentamiento, incluyendo frontend, encoder, reescalado de host y decodificación:

| Bundle | Duracion de audio | Transcripcion | Audio / tiempo |
|---|---:|---:|---:|
| fast | 20 s | 0,129 s | 155,5× |
| fast | 18 min 15 s | 1,942 s | 563,9× |
| quality | 20 s | 0,189 s | 106,0× |
| quality | 18 min 15 s | 7,973 s | 137,4× |

WER normalizado al estilo Whisper contra la referencia de la grabación larga:

| Bundle / referencia | Errores de palabra | WER |
|---|---:|---:|
| fast | 79/2220 | 3,56% |
| FP32 origen, mismos cortes de 15 s | 77/2220 | 3,47% |
| quality | 81/2220 | 3,65% |
| FP32 origen, mismos cortes de 4 min | 96/2220 | 4,32% |

Con la normalización más simple del benchmark, `fast` obtiene 95/2219 frente a 94/2219 de su fuente, y `quality` 91/2219 frente a 107/2219 de su fuente. El error relativo RMS del encoder frente a FP32 es del 2,99% en `fast` (fixture de 15,35 s) y del 2,52% en `quality` (fixture de 20 s). Los datos corresponden a una única grabación en inglés y no constituyen un ranking general de precisión.

## Requisitos de hardware

- Hardware obligatorio: Apple silicon físico con macOS 27 o iOS 27; no se ejecuta en x86, GPU NVIDIA ni entornos virtualizados sin Neural Engine.
- Runtime obligatorio: un host específico para el modelo que implemente el frontend, el bucle TDT voraz y el tokenizador descritos en los metadatos y sidecars; los grafos aceptan características y estados recurrentes, no archivos de audio.
- Memoria: pico muestreado de cliente más memoria neural atribuida de aproximadamente 1,29 GB en `quality/`, excluyendo memoria de compilador, driver y sistema.
- Colocación en ANE: 148 predicciones ANE en el trazado de `fast` y diez en `quality`; el bucle de decodificación por lotes de `fast` añade 94 predicciones ANE. `quality/` decodifica en CPU.
- No hay datos de VRAM para GPU ni de despliegue en vLLM, llama.cpp, Ollama o TGI; el formato de pesos no es compatible con esos runners.
- El tamaño del repositorio es de 1,5 GB, coherente con dos bundles autocontenidos con pesos compartidos entre funciones estáticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmento | Licencia | Disponibilidad |
|---|---|---|---|---|
| coder543/parakeet-v3-glade | ~0,6 B | 15 s (`fast`) y 45 s/4 min (`quality`) | CC BY 4.0 | Hugging Face, requiere Glade y Apple silicon |
| nvidia/parakeet-tdt-0.6b-v3 (fuente) | ~0,6 B | no disponible en la informacion | CC BY 4.0 (heredada) | Hugging Face, pesos FP32 |
| Ejemplo Core AI Parakeet V3 de Apple | ~0,6 B | no disponible | no disponible | repositorio apple/coreai-models |

La model card incluye una comparación con el ejemplo de Apple Core AI Parakeet V3 medida el 28 de septiembre de 2026 en el mismo equipo, pero el texto proporcionado se interrumpe antes de exponer los resultados, por lo que no se dispone de cifras comparativas.

## Limitaciones y advertencias

- No es un modelo independiente: es una conversión cuantizada del modelo de NVIDIA y no está respaldada por NVIDIA.
- Requiere hardware y sistema operativo concretos (Apple silicon, macOS 27 o iOS 27) y un runtime de host específico del modelo; no es portable a otros entornos.
- La cuantización y el orden de las operaciones en coma flotante pueden alterar decisiones de token, incluido un nombre propio en el fixture inglés de `quality`.
- El WER de 3,56%–3,65% procede de una única grabación en inglés; no establece precisión general ni por idioma.
- La lista de idiomas soportados no está disponible; las pruebas en alemán y ucraniano son puntuales y no garantizan cobertura.
- La precisión de los límites de palabra no se ha medido con evaluación humana; solo se verifica que las marcas están ordenadas, acotadas y preservan el texto.
- Riesgo de alucinación y sesgos del modelo base no documentado en la información disponible.
- La licencia CC BY 4.0 exige atribución; el repositorio incluye LICENSE y NOTICE, pero no se detallan restricciones adicionales para uso comercial.
- El contrato de host de `quality/` es frágil: omitir el factor de reescalado 16 produce resultados incorrectos sin error explícito.
- El repositorio registra cero descargas y cero likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/parakeet-v3-glade
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencia de la transcripción de JFK: https://github.com/coder543/stt-bench-matrix/blob/4689df1aec5dd0e96b223caf3a9a176675c10fa5/samples/jfk_rice_16k.txt
- Implementación Core AI de Apple: https://github.com/apple/coreai-models/tree/e7b24da85ea64a77d26324d7ce9607de
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
