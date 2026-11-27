# ilsvls/gigaam-v4-coreml

## Resumen

GigaAM-v4 Core ML FP16 es una conversión del modelo de reconocimiento automático del habla ai-sage/GigaAM-v4 al formato Core ML de Apple, optimizada para ejecutarse en Apple Silicon (incluida la Neural Engine). El trabajo lo publica el usuario ilsvls como conversión independiente, sin reentrenamiento: se parte del checkpoint RNNT original y se transforma a FP16 para su despliegue nativo en macOS.

El modelo resuelve la transcripción de voz a texto en ruso e inglés con marcas de tiempo, empaquetando en un único repositorio de 0,50 GB el codificador acústico, las cabezas RNNT (raw y end-to-end), el tokenizador, la extracción de características y un detector de actividad de voz (VAD). Su relevancia radica en que permite ejecutar un ASR RNNT completo de forma local y portable en equipos Apple, sin depender de servicios en la nube.

La conversión mantiene la licencia MIT del modelo original y se distribuye con un manifiesto de checksums y una especificación de formato (FORMAT.md, release.json) pensada para integrarse en runtimes nativos compatibles con GigaAM. No se trata de un modelo nuevo, sino de un artefacto de despliegue derivado de GigaAM-v4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (transducer) convertido a Core ML; codificador acústico portable |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (perfil de 1024 frames mel) |
| Tipos de cuantizacion | FP16 (conversión del checkpoint original) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Core ML (repo de 0,50 GB); modelo base en formato original de GigaAM |

## Arquitectura y entrenamiento

El modelo subyacente es un RNNT (Recurrent Neural Network Transducer), una arquitectura de ASR formada por un codificador acústico, un predictor y una capa de unión que produce la distribución sobre tokens. La conversión a Core ML expone el codificador acústico como componente portable y conserva las cabezas RNNT en dos variantes (raw y end-to-end), además del tokenizador, la extracción de features mel y el VAD.

No se ha realizado reentrenamiento ni ajuste fino: la conversión parte del checkpoint ai-sage/GigaAM-v4 (revisión upstream `9fe3ebf50c9e0cce5eed60d546938632238b6a96`) y únicamente cambia el formato y la precisión a FP16. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original; esa información correspondería a la ficha de ai-sage/GigaAM-v4. El perfil declarado es de 1024 frames mel.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso e inglés.
- Salida con marcas de tiempo: en las pruebas locales todas las transcripciones devolvieron timestamps válidos.
- Dos cabezas RNNT: raw y end-to-end.
- Detección de actividad de voz (VAD) incluida en el paquete.
- Tokenizador y extracción de características mel integrados en el repositorio.
- Ejecución nativa en Apple Silicon con soporte de Neural Engine (ANE).
- Procesamiento por lotes de clips cortos y de grabaciones largas (probado con grabaciones de ~63 minutos en conjunto).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción local de notas de voz en macOS: el paquete Core ML permite dictar y transcribir sin enviar audio a la nube, usando el codificador y el tokenizador incluidos.
- Subtitulado con marcas de tiempo: al devolver timestamps válidos, es adecuado para generar subtítulos alineados temporalmente en vídeos y reuniones.
- Actas de reuniones largas: las pruebas con grabaciones de aproximadamente 63 minutos y el VAD integrado permiten segmentar y transcribir sesiones extensas.
- Aplicaciones de dictado nativas: la conversión está pensada para integrarse en runtimes GigaAM nativos, como el caso de la app Dictate it citada por el autor.
- Procesamiento por lotes de archivos de audio: un pipeline local puede recorrer directorios de clips cortos y generar transcripciones en lote con el modelo FP16.
- Transcripción bilingüe ruso-inglés: útil en entornos donde se mezclan ambos idiomas, aunque la model card no detalla el comportamiento en code-switching.
- Prototipado en Apple Silicon: sirve para evaluar ASR RNNT en M-series antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

Los únicos datos disponibles son pruebas locales del autor, no benchmarks oficiales.

| Prueba | Condiciones | WER |
|---|---|---|
| 272 clips cortos de voz | M3 Pro, macOS 27.2.1 | 9,45 % |
| Cinco grabaciones completas (~63 min) | M3 Pro, macOS 27.2.1 | 17,45 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR. Tampoco se ofrecen cifras de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Apple Silicon con memoria unificada. El repositorio ocupa 0,50 GB en FP16.
- GPU recomendadas: Apple Silicon (probado en M3 Pro). No hay datos para A100, H100 ni RTX 4090, ya que el formato Core ML está orientado a hardware Apple.
- Cabe en equipos consumer Apple: sí, por tamaño y formato; se desconoce el requisito mínimo de memoria unificada.
- Opciones de despliegue: Core ML con un runtime nativo compatible con GigaAM; se requiere descargar el repositorio en una revisión fijada y verificar el manifiesto SHA-256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ilsvls/gigaam-v4-coreml | RNNT, Core ML FP16 | ru, en | Core ML | MIT | Conversión local para Apple Silicon; 0,50 GB |
| ai-sage/GigaAM-v4 | RNNT | ru, en | Original | MIT | Modelo base; sin datos de tamaño en la información disponible |
| ilsvls/gigaam-v4-coreai | RNNT, Core AI | ru, en | Core AI | MIT | Conversión alternativa del mismo modelo base |
| ilsvls/gigaam-multilingual-v2-coreml | ASR, Core ML | multilingüe | Core ML | MIT | Conversión de otra variante GigaAM; detalles no disponibles |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no se documenta soporte de otros idiomas ni de code-switching.
- Los WER de 9,45 % y 17,45 % proceden de pruebas locales del autor en un único equipo y no constituyen un benchmark oficial.
- El WER se degrada notablemente en grabaciones largas frente a clips cortos (17,45 % frente a 9,45 %).
- Requiere un runtime nativo compatible con GigaAM; no es un paquete autónomo ejecutable por sí solo.
- Es una conversión independiente, no oficial, del modelo ai-sage/GigaAM-v4; posibles errores de conversión no están cubiertos por el equipo original.
- Riesgo de alucinación y errores en audio con ruido, acentos o solapamiento de hablantes: no cuantificado en la información disponible.
- Licencia MIT permite uso comercial, pero conviene conservar la atribución al equipo GigaAM y revisar los términos del modelo base.
- Se recomienda descargar una revisión fijada y verificar el SHA-256 del manifiesto antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ilsvls/gigaam-v4-coreml
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Conversión Multilingual-v2 Core ML: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreml
- Conversión Multilingual-v2 Core AI: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreai
- Conversión v4 Core AI: https://huggingface.co/ilsvls/gigaam-v4-coreai
- Documentación de formato: FORMAT.md (incluido en el repositorio)
- Manifiesto y checksums: release.json (incluido en el repositorio)
