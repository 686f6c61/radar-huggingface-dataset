# ai-sage/GigaEdge-Enhance

## Resumen

GigaEdge Enhance es un SDK multiplataforma para la mejora de voz en tiempo real sobre CPU, desarrollado por ai-sage (vinculado a salute-developers). Resuelve el problema de la supresion de ruido y la restauracion de detalle en la voz para escenarios de telefonia y comunicaciones, combinando supresion neuronal de ruido con normalizacion opcional de sonoridad. Es relevante porque ofrece inferencia en tiempo real sobre CPU sin GPU, con exportaciones a ONNX y TensorFlow Lite, lo que facilita el despliegue en dispositivos de borde y sistemas embebidos.

El paquete incluye tres modelos especializados: `quality48` para voz de banda completa a 48 kHz en llamadas y directos, `hybrid48` que anade una etapa generativa para reconstruir detalle de la senal vocal a 48 kHz, y `fast8` para telefonia de banda estrecha a 8 kHz con cuantizacion INT8. La arquitectura concreta no se detalla en la informacion disponible mas alla de que `hybrid48` incorpora una etapa generativa.

La version corresponde a la v1.0.0, con pesos publicados el 25 de noviembre de 2026 bajo licencia MIT. El modelo se distribuye como audio-to-audio y esta pensado para procesamiento por flujos (streaming) con trozos de uno o mas saltos de 16 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para mejora de voz; `hybrid48` anade una etapa generativa. Detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (procesamiento por saltos de 16 ms en streaming) |
| Tipos de cuantizacion | FP32 (`quality48`, `hybrid48`), INT8 (`fast8`) |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX y TensorFlow Lite (TFLite) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de transformer, capas convolucionales, atencion lineal u otra). Se sabe que el sistema combina supresion neuronal de ruido con una normalizacion opcional de sonoridad, y que el modelo `hybrid48` incorpora una etapa generativa destinada a reconstruir el detalle de la voz a 48 kHz. El SDK procesa la senal en saltos de 16 ms y soporta trozos de uno o varios saltos por llamada de inferencia.

En cuanto a datos de entrenamiento, la model card indica que los autores excluyeron las grabaciones de los conjuntos EARS y WHAM! del entrenamiento, lo que sugiere que el resto del corpus de entrenamiento no se especifica. No se detalla el numero de tokens ni la composicion del dataset (no aplica en el sentido habitual, al ser audio). Tampoco se indica si se empleo RLHF, DPO o tecnicas de refinamiento por preferencias. La evaluacion se realizo sobre 886 pares ruido/limpio de EARS-WHAM v2.

## Capacidades

- Mejora de voz en tiempo real sobre CPU, con procesamiento en flujos por saltos de 16 ms.
- Supresion de ruido neuronal en banda completa a 48 kHz (`quality48` y `hybrid48`).
- Reconstruccion generativa de detalle vocal a 48 kHz con `hybrid48`.
- Procesamiento de telefonia de banda estrecha a 8 kHz con `fast8` en INT8.
- Normalizacion opcional de sonoridad integrada en el SDK.
- Cancelacion de eco soportada por el SDK (desactivada en el benchmark publicado).
- Exportaciones multiplataforma a ONNX y TensorFlow Lite.
- Procesamiento por fichero WAV mediante la API `Denoiser.process_file`.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada distinto de voz.

## Casos de uso

- Llamadas VoIP y videoconferencia: `quality48` procesa la senal a 48 kHz en tiempo real sobre CPU, adecuado para clientes de escritorio y moviles sin GPU dedicada.
- Telefonia tradicional y sistemas IVR: `fast8` opera en banda estrecha a 8 kHz con cuantizacion INT8, encajando en centralitas y gateways con recursos limitados.
- Restauracion de grabaciones de voz: `hybrid48` anade detalle generativo a la senal, util para limpiar entrevistas, podcasts o material de archivo con ruido de fondo.
- Dispositivos de borde y embebidos: las exportaciones TFLite permiten integrar la mejora de voz en wearables, auriculares o sistemas con restricciones de memoria y computo.
- Pipelines de transcripcion automatica: la mejora previa de la senal reduce el ruido y puede mejorar la precision de sistemas ASR en entornos ruidosos, procesando ficheros WAV con `process_file`.
- Atencion al cliente grabada: normalizacion de sonoridad y supresion de ruido para homogeneizar la calidad de las grabaciones antes de su analisis o almacenamiento.
- Herramientas de accesibilidad: mejora de la inteligencia de la voz captada por microfonos en tiempo real para usuarios con dificultades auditivas o entornos adversos.

## Benchmarks y rendimiento

Resultados publicados sobre 886 pares ruido/limpio de EARS-WHAM v2 (un salto por llamada ONNX, normalizacion y cancelacion de eco desactivadas; las metricas con referencia tienen en cuenta el retardo de salida). Las puntuaciones de `hybrid48` y `fast8` corresponden a las exportaciones ONNX del repositorio; el paper probo un checkpoint anterior de `quality48`.

Sistemas a 48 kHz:

| Sistema | DNSMOS P.808 (mayor mejor) | PESQ-WB (mayor mejor) | SI-SDR dB (mayor mejor) | Flujos en tiempo real (mayor mejor) |
|---|---:|---:|---:|---:|
| Entrada con ruido | 2,68 | 1,23 | 5,35 | — |
| hybrid48 | 3,44 | 1,90 | 13,03 | 56,0 |
| DPDFNet2 48 kHz HR | 3,66 | 2,21 | 14,69 | 17,3 |

Sistemas a 8 kHz:

| Sistema | ESTOI (mayor mejor) | PESQ-NB (mayor mejor) | SI-SDR dB (mayor mejor) |
|---|---:|---:|---:|
| Entrada con ruido | 0,64 | 1,85 | 5,32 |
| fast8 | 0,72 | 2,28 | 10,99 |

Con pesos compartidos, `hybrid48` soporto 3,2 veces mas flujos en tiempo real que DPDFNet2 en sherpa-onnx, segun la metodologia del paper (seccion 6.4).

## Requisitos de hardware

- Inferencia sobre CPU; no se requieren GPU segun la model card.
- VRAM estimada: no disponible (el modelo esta orientado a CPU).
- GPU recomendadas: no aplica; el SDK se centra en CPU.
- Compatibilidad con GPU de consumo: no aplica por el diseno orientado a CPU.
- Opciones de despliegue: ONNX Runtime y TensorFlow Lite; integracion en sherpa-onnx; API Python `giga_edge_enhance` con `Denoiser.from_pretrained` y `process_file`.
- Throughput: `hybrid48` soporto 56,0 flujos en tiempo real en el benchmark publicado, frente a 17,3 de DPDFNet2 48 kHz HR.
- Latencia: procesamiento por saltos de 16 ms; no se detalla la latencia total extremo a extremo.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | DNSMOS P.808 | PESQ-WB | SI-SDR (dB) | Flujos en tiempo real | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| GigaEdge Enhance hybrid48 | Mejora de voz con etapa generativa | 48 kHz | 3,44 | 1,90 | 13,03 | 56,0 | MIT |
| DPDFNet2 48 kHz HR | Mejora de voz | 48 kHz | 3,66 | 2,21 | 14,69 | 17,3 | no disponible |
| GigaEdge Enhance fast8 | Mejora de voz banda estrecha | 8 kHz | no disponible | 2,28 (PESQ-NB) | 10,99 | no disponible | MIT |

DPDFNet2 obtiene mejores metricas de calidad (DNSMOS, PESQ-WB y SI-SDR) que `hybrid48`, mientras que `hybrid48` ofrece mayor throughput en tiempo real (3,2 veces mas flujos con pesos compartidos en sherpa-onnx). No se dispone de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos del modelo en la informacion disponible.
- Riesgo de artefactos o alucinacion en la etapa generativa de `hybrid48` al reconstruir detalle vocal; no se cuantifica en la model card.
- El benchmark publicado usa un unico salto por llamada ONNX y desactiva normalizacion y cancelacion de eco, por lo que el rendimiento en produccion con esas funciones activas puede diferir.
- Las metricas de `quality48` corresponden a un checkpoint anterior probado en el paper, no a la exportacion actual del repositorio.
- Soporte de idiomas no documentado; al operar sobre audio, la calidad puede variar segun el tipo de voz y el ruido.
- Licencia MIT, que permite uso comercial, pero conviene revisar los terminos del SDK y de las dependencias (ONNX Runtime, TensorFlow Lite) antes de produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica adopcion temprana y poca validacion externa.
- El tamano del repositorio figura como 0.0 GB, dato que puede no reflejar el peso real de los pesos por el uso de Git LFS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-sage/GigaEdge-Enhance
- Repositorio GitHub: https://github.com/salute-developers/giga-edge-enhance
- Paper (arXiv): https://arxiv.org/abs/2611.13243
- Paper HTML, seccion 5.1: https://arxiv.org/html/2611.13243v4#S5.SS1
- Paper HTML, seccion 6.4: https://arxiv.org/html/2611.13243v4#S6.SS4
- Benchmark EARS: https://github.com/sp-uhh/ears_benchmark
- Muestra de comparacion (15 s): https://media.githubusercontent.com/media/salute-developers/giga-edge-enhance/v1.0.0/samples/compare-48k.wav
- WAV de entrada de ejemplo: https://media.githubusercontent.com/media/salute-developers/giga-edge-enhance/v1.0.0/samples/input-48k.wav
- Creditos de audio: https://github.com/salute-developers/giga-edge-enhance/blob/v1.0.0/samples/README.md
- Modelo DPDFNet2 (comparativa): https://huggingface.co/Ceva-IP/DPDFNet
