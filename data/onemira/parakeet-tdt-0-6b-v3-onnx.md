# onemira/parakeet-tdt-0.6b-v3-onnx

## Resumen

`onemira/parakeet-tdt-0.6b-v3-onnx` es un espejo byte a byte del archivo ONNX int8 del modelo NVIDIA Parakeet TDT 0.6B v3, exportado por el proyecto k2-fsa/sherpa-onnx (export del 2026-11-07, PR #4167). No se trata de un modelo entrenado por OneMira: la autoría de los pesos originales corresponde a NVIDIA Corporation (licencia CC-BY-4.0) y la exportación a ONNX a k2-fsa/sherpa-onnx (Apache-2.0). El repositorio lo publica OneMira como artefacto de su pipeline de transcripción offline en dispositivo.

El modelo es un sistema de reconocimiento automático del habla (ASR) offline basado en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA NeMo, con aproximadamente 0,6 mil millones de parámetros. Cubre inglés y 24 idiomas europeos adicionales (búlgaro, croata, checo, danés, neerlandés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano).

Su relevancia práctica radica en que empaqueta el modelo en formato ONNX cuantizado a int8 (archivo de 487.211.443 bytes, unos 0,5 GB), listo para su uso con sherpa-onnx en inferencia local sin GPU ni conexión de red. Esto lo hace adecuado para transcripción en tiempo real en dispositivos de borde, grabadoras de voz con IA y aplicaciones de escritorio que requieren privacidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) de NVIDIA NeMo |
| Parametros totales | ~0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (archivo ONNX cuantizado) |
| Idiomas soportados | 25 idiomas: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | cc-by-4.0 (pesos originales NVIDIA); export sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX (archivo `.tar.bz2` con el modelo int8) |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT (Token-and-Duration Transducer) de NVIDIA NeMo, una variante de la familia RNN-Transducer en la que el decodificador predice conjuntamente tokens y duraciones. Esta arquitectura permite streaming y decodificación eficiente sin necesidad de alineamientos forzados, y es la base de la familia Parakeet de NVIDIA para ASR multilingüe.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o técnicas de aumento de datos) no están disponibles en la información proporcionada. El repositorio de OneMira es un espejo sin modificaciones del archivo exportado por k2-fsa/sherpa-onnx, por lo que no documenta el proceso de entrenamiento original, que habría que consultar en la model card de `nvidia/parakeet-tdt-0.6b-v3`.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en 25 idiomas europeos.
- Transcripción en tiempo real o por lotes sobre audio pregrabado.
- Inferencia en dispositivo (on-device) sin conexión a red, gracias al formato ONNX int8.
- Integración con el ecosistema sherpa-onnx para despliegue en C++, Python, Rust, Java, C# y otras plataformas.
- Soporte multilingüe amplio dentro de la familia de lenguas europeas (germánicas, románicas, eslavas, bálticas, urálicas y griego).
- No dispone de capacidades de generación de texto, razonamiento, código, visión ni tool calling: es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripción local en grabadoras de voz con IA: el modelo se ejecuta íntegramente en el dispositivo (por ejemplo, en el producto OneMira C1) sin enviar audio a servidores, lo que preserva la confidencialidad de conversaciones de reuniones y llamadas.
- Subtitulado y actas de reuniones en tiempo real: con sherpa-onnx se puede integrar en aplicaciones de escritorio (macOS/Windows) que capturan audio del sistema (Zoom, Teams, Google Meet) y generan transcripciones multilingües sin latencia de red.
- Aplicaciones de notas de voz para móviles y dispositivos de borde: el tamaño de ~0,5 GB en int8 permite empaquetar el modelo en apps móviles o firmware de hardware dedicado con recursos limitados.
- Transcripción de archivos multimedia en pipelines de accesibilidad: generación de subtítulos para vídeo y audio en 25 idiomas europeos en procesos batch locales.
- Cumplimiento normativo y sectores regulados (sanidad, legal, administración pública): al no requerir conexión externa, facilita el cumplimiento de RGPD y políticas de retención de datos al mantener el audio dentro de la infraestructura del usuario.
- Investigación en ASR multilingüe: sirve como línea base reproducible para comparar técnicas de cuantización, decodificación y adaptación de dominio en entornos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de WER, latencia ni throughput, y la búsqueda web no proporciona datos de evaluación del modelo base. Para métricas oficiales habría que consultar la model card de `nvidia/parakeet-tdt-0.6b-v3` en Hugging Face, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo de ~0,6B parámetros cuantizado a int8, el archivo ocupa ~0,5 GB y puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; el formato ONNX int8 y el soporte de sherpa-onnx están orientados a CPU y a dispositivos de borde, por lo que no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el diseño apunta a inferencia en CPU y hardware embebido.
- Opciones de despliegue: sherpa-onnx (C++, Python, Rust, Java, C#, entre otros), con el archivo `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onemira/parakeet-tdt-0.6b-v3-onnx | ~0,6B | 25 europeos | ONNX int8 | CC-BY-4.0 (pesos) / Apache-2.0 (export) | Hugging Face (espejo) |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | Hugging Face (NVIDIA) |
| k2-fsa/sherpa-onnx (export) | ~0,6B | 25 europeos | ONNX int8 | Apache-2.0 (export) | GitHub Releases |
| Whisper large-v3 (referencia) | ~1,55B | ~99 | PyTorch / GGUF / ONNX | MIT | OpenAI / Hugging Face |

La comparativa con Whisper large-v3 se incluye como referencia de categoría (ASR multilingüe), pero no se dispone de datos de rendimiento comparativo en la información proporcionada. El modelo de OneMira se distingue por su menor tamaño (~0,6B frente a ~1,55B) y su empaquetado int8 para despliegue en dispositivo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un espejo sin modificaciones, hereda los sesgos del modelo base de NVIDIA, que no se detallan.
- Riesgo de alucinación: en ASR, el equivalente son errores de transcripción y posibles inserciones de texto no presentes en el audio; no se dispone de tasas de WER publicadas.
- Limitaciones de contexto o idioma: cubre 25 idiomas europeos; no soporta lenguas fuera de ese conjunto (por ejemplo, árabe, chino, japonés, coreano o lenguas africanas).
- Restricciones de licencia: los pesos originales son CC-BY-4.0, lo que permite uso comercial con atribución a NVIDIA; el export de sherpa-onnx es Apache-2.0. El espejo no implica aval de NVIDIA ni de k2-fsa hacia OneMira.
- Caveat de producción: el repositorio es un espejo byte a byte (SHA-256 `1495e91b59d7fc53ddca91f3431758ec99f8fa253fdb0e1e851be0f72b14b0f9`); conviene verificar la integridad del archivo antes de desplegarlo y consultar la procedencia en `SOURCE.json` y `NOTICE.txt`.
- El repositorio no incluye métricas de evaluación, guía de uso ni scripts de ejemplo; para el despliegue hay que remitirse a la documentación de sherpa-onnx.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onemira/parakeet-tdt-0.6b-v3-onnx
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX de sherpa-onnx (GitHub Releases): https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Producto OneMira C1: https://onemira.com/products/c1
- Análisis de grabadoras de IA (OneMira, Pocket, Plaud): https://wearemobians.com/2026/11/enregistreurs-ia-onemira-pocket-plaud/
- Demo en vídeo del OneMira C1: https://www.youtube.com/watch?v=LUIqGIipxQs
