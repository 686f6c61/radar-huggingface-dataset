# emergic/speech-models

## Resumen

Emergic speech models es una colección de modelos de voz empaquetados en un único repositorio de Hugging Face por Emergic, orientada a ejecución local en CPU mediante ONNX Runtime. No se trata de un modelo único, sino de un conjunto de cuatro componentes cuantizados a int8 que cubren transcripción de voz a texto, diarización de hablantes, verificación de locutor y detección de la propia voz del usuario. El objetivo es habilitar funciones de notas de reunión, notas de voz y dictado por voz sin que el audio abandone el ordenador del usuario.

El repositorio agrupa derivados de tres modelos base: `moondream/parakeet-ultra` (a su vez derivado de `nvidia/parakeet-tdt-0.6b-v3`) para reconocimiento de voz en inglés y 24 lenguas europeas, `nvidia/Nemotron-3-Diarization` para diarización de hasta 8 voces, `ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large` para hindi e hinglish, y CAM++ de 3D-Speaker para huella de voz. El resultado es un stack completo de procesamiento de audio local, con verificación de integridad SHA-256 por fichero.

La relevancia actual reside en su enfoque de privacidad y despliegue en el borde: todo el procesamiento ocurre en CPU vía ONNX Runtime, con pesos int8 y un tamaño total de repositorio de 1,3 GB. Esto lo hace adecuado para aplicaciones de escritorio y portátiles sin GPU dedicada, un nicho donde la mayoría de los stacks de ASR modernos dependen de aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida y modular: Parakeet TDT (transducer) para ASR multilingüe, IndicConformer híbrido CTC+RNNT para hindi, Nemotron-3 para diarización, CAM++ para speaker embedding |
| Parametros totales | no disponible (repositorio compuesto por varios modelos; el ASR base Parakeet TDT es de 0,6 B según el nombre del modelo upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización de pesos) |
| Idiomas soportados | en, hi, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas en total) |
| Licencia | per-folder: CC-BY-4.0 (parakeet-ultra-int8), MIT (indicconformer-hi-int8), Apache-2.0 (campplus-speaker), según carpeta para nemotron-3-diarization-int8 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos desde cero: es un empaquetado de modelos upstream con cuantización int8 y exportación a ONNX. El componente ASR principal, `parakeet-ultra-int8`, deriva de `moondream/parakeet-ultra`, que a su vez proviene de `nvidia/parakeet-tdt-0.6b-v3`, un modelo transducer (TDT) de aproximadamente 0,6 B de parámetros. El componente hindi, `indicconformer-hi-int8`, deriva de AI4Bharat IndicConformer en su variante híbrida CTC+RNNT de tamaño large, diseñada para hindi e hinglish. La diarización usa `nvidia/Nemotron-3-Diarization`, capaz de distinguir hasta 8 voces. La verificación de locutor emplea CAM++ de 3D-Speaker, exportado a ONNX por k2-fsa.

No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo etapas de RLHF o DPO, ya que estos modelos son principalmente de reconocimiento y procesamiento de audio, no de generación de lenguaje. La innovación técnica del repositorio es el pipeline de despliegue: cuantización int8, exportación ONNX, ejecución exclusiva en CPU y verificación de integridad SHA-256 por fichero, con cada descarga fijada a una revisión concreta del repositorio.

## Capacidades

- Reconocimiento de voz a texto en inglés y 24 lenguas europeas mediante Parakeet Ultra (variante TDT).
- Reconocimiento de voz en hindi e hinglish mediante IndicConformer.
- Diarización de hablantes: identificación de quién habla en cada momento, hasta 8 voces simultáneas.
- Verificación de locutor y huella de voz: marca la voz del propio usuario como "You" en las transcripciones.
- Ejecución local en CPU mediante ONNX Runtime, sin envío de audio a servidores externos.
- Procesamiento de notas de reunión, notas de voz y dictado por voz como casos de uso objetivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Notas de reunión locales: el stack combina ASR (Parakeet o IndicConformer) con diarización (Nemotron-3) para generar transcripciones atribuidas a cada participante, hasta 8 voces, sin que el audio salga del equipo.
- Dictado por voz en aplicaciones de escritorio: el modelo Parakeet Ultra int8 en ONNX permite transcripción en tiempo real en CPU, integrándose en editores de texto o formularios sin dependencia de la nube.
- Notas de voz personales: transcripción de grabaciones de audio en inglés o lenguas europeas con latencia baja en portátiles sin GPU.
- Identificación del propio locutor: CAM++ permite marcar automáticamente la voz del usuario como "You", útil en aplicaciones de diario personal o grabación de ideas.
- Transcripción de contenido en hindi e hinglish: IndicConformer cubre el caso de usuarios que alternan hindi e inglés, habitual en contextos de la India o diáspora.
- Cumplimiento y privacidad en entornos regulados: al ejecutarse íntegramente en local con verificación SHA-256, encaja en escenarios donde el audio no puede enviarse a terceros (sanidad, legal, sector público).
- Aplicaciones offline en dispositivos de borde: el tamaño total de 1,3 GB y la ejecución en CPU permiten desplegar el stack en equipos con recursos limitados o sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (ejecución en CPU mediante ONNX Runtime); el repositorio completo ocupa 1,3 GB en disco.
- GPU recomendadas: no aplica; el diseño es explícitamente para CPU.
- Compatibilidad con GPU de consumo: no es el objetivo del repositorio; no se documenta soporte GPU.
- Opciones de despliegue: ONNX Runtime en CPU; los ficheros son ONNX int8 y pueden cargarse con cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Emergic speech models (este repo) | Stack ASR + diarización + verificación | no disponible (ASR base ~0,6 B) | 25 | int8 | per-folder (CC-BY-4.0, MIT, Apache-2.0) | ONNX Runtime CPU |
| nvidia/parakeet-tdt-0.6b-v3 (upstream) | ASR transducer | ~0,6 B | multilingüe europeo | no disponible | no disponible | GPU/CPU |
| ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large (upstream) | ASR híbrido CTC+RNNT | large (no disponible) | hindi, hinglish | no disponible | MIT | no disponible |
| nvidia/Nemotron-3-Diarization (upstream) | Diarización | no disponible | no disponible | no disponible | según carpeta | no disponible |

## Limitaciones y advertencias

- Es un repositorio compuesto, no un modelo único: la licencia es "per-folder", por lo que el uso comercial debe revisarse carpeta por carpeta (CC-BY-4.0, MIT, Apache-2.0 y la licencia específica de Nemotron-3-Diarization).
- La diarización está limitada a un máximo de 8 voces según la model card.
- La cobertura de idiomas es amplia en Europa (24 lenguas más inglés) pero no global; el hindi se cubre mediante un modelo separado (IndicConformer) y no se documentan otras lenguas asiáticas o africanas.
- Al ser modelos de ASR y audio, el riesgo de alucinación se manifiesta como transcripciones incorrectas o atribuciones erróneas de hablante, especialmente en audio con ruido o solapamiento de voces.
- No se documentan sesgos específicos ni evaluaciones de robustez por acento, dialecto o condición acústica.
- La ejecución en CPU implica límites de throughput no cuantificados en la información disponible; para volúmenes altos puede no ser adecuado.
- El repositorio se publicó originalmente como `naklitechie/steno-speech-models`; verificar compatibilidad con versiones antiguas de Emergic.
- No se documentan garantías de soporte ni mantenimiento a largo plazo más allá de la fijación por revisión y la verificación SHA-256.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emergic/speech-models
- Sitio de Emergic: https://emergic.com
- Modelo base ASR: https://huggingface.co/moondream/parakeet-ultra
- Modelo base diarización: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Modelo base hindi: https://huggingface.co/ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large
- Repositorio anterior: https://huggingface.co/naklitechie/steno-speech-models
- Licencia del repositorio: https://huggingface.co/emergic/speech-models/blob/main/LICENSE
