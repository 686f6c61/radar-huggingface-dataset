# Muesli-HQ/phonon-2.5-coreml

## Resumen

Phonon-2.5 Core ML es la conversion a Core ML del modelo de reconocimiento automatico del habla Fermion Research Phonon-2.5, un sistema derivado de NVIDIA Parakeet TDT 0.6B v3 que cubre 25 idiomas. La conversion, mantenida por Muesli-HQ, empaqueta el encoder como variante densa LUT3 para GPU (no la variante dispersa para Neural Engine) y lo integra con la libreria FluidAudio en Swift, de modo que puede ejecutarse en dispositivos Apple con macOS 15 o iOS 18 en adelante.

El interes practico esta en que traslada un ASR de ~600 millones de parametros al ecosistema Core ML manteniendo las tres componentes de prediccion (encoder, decoder y joint) con los pesos de Phonon-2.5, y reutilizando solo el preprocesador compartido de FluidAudio. El directorio completo ocupa aproximadamente 290 MB, lo que lo hace viable en equipos de consumo Apple sin GPU dedicada.

La validacion publicada es acotada: una comparacion de ventana unica frente a NeMo en fp32 con coseno 0.999997 y NRMSE 0.00149, y 83 clips publicos en ingles, frances, aleman y espanol con 72 transcripciones normalizadas coincidentes con la referencia. El autor la califica explicitamente como prueba de humo, no como validacion de corpus ni de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con decodificacion TDT (Token-and-Duration Transducer), derivada de NVIDIA Parakeet TDT 0.6B v3; encoder convertido a Core ML en variante densa LUT3 para GPU |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en representacion de cinco valores (LUT3) para el encoder; decoder y joint en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | 25 idiomas segun el modelo base; la validacion publicada cubre ingles, frances, aleman y espanol |
| Licencia | CC-BY-4.0 (pesos); scripts de conversion Apache-2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc`), mas `checksums.json` con hashes de los artefactos distribuidos |

## Arquitectura y entrenamiento

El modelo subyacente es Phonon-2.5 de Fermion Research, construido sobre NVIDIA Parakeet TDT 0.6B v3. Se trata de un transducer TDT: un encoder transformer que procesa el audio y un decoder mas un joint network que predicen conjuntamente tokens y duraciones, lo que permite decodificacion no autorregresiva por bloques y reduce la latencia frente a un CTC o un attention encoder-decoder clasico. El checkpoint fuente es la revision `2673618ad8636c8dfd20fe57e94d1f67f75bdeaa` y el vocabulario procede de ese mismo checkpoint.

Esta ficha corresponde a la conversion, no al entrenamiento: no se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o ajuste fino supervisado adicional. La innovacion tecnica relevante es la conversion a Core ML: el encoder se exporta como variante densa LUT3 con pesos representados en cinco valores, mientras que decoder y joint se mantienen en fp16 y conservan la colocacion por defecto de FluidAudio en CPU+ANE. El preprocesador reutilizado es el de `FluidInference/parakeet-tdt-0.6b-v3-coreml` (revision `7dd20fe6b1797d35f5e3307e8b1732d9a178edfe`).

## Capacidades

- Reconocimiento automatico del habla en 25 idiomas, con validacion publicada en ingles, frances, aleman y espanol.
- Transcripcion de audio con marcas de tiempo derivadas de la decodificacion TDT (tokens y duraciones).
- Manejo de silencios y de audio largo: se probo un fixture de 44 segundos con locucion repetida.
- Ejecucion en GPU de Apple mediante Core ML con `encoderComputeUnits: .cpuAndGPU`.
- Integracion con FluidAudio 0.17.3 y 0.17.7 mediante `AsrModels.loadLocal` y `AsrManager`.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma explicita ni tool calling.

## Casos de uso

- Transcripcion local en aplicaciones macOS: integracion mediante FluidAudio en una app de escritorio que transcribe notas de voz sin enviar audio a la nube, aprovechando la GPU del Mac.
- Dictado en apps iOS 18+: uso del encoder en `.cpuAndGPU` para dictado en tiempo real en iPhone o iPad, con decoder y joint en CPU+ANE para repartir la carga.
- Subtitulado de reuniones y videollamadas: el modelo produce transcripciones con duraciones por token, utiles para generar subtitulos sincronizados en herramientas internas.
- Procesado por lotes de archivos de audio en un Mac: dado el tamano de ~290 MB y la ausencia de dependencia de servidor, se puede empaquetar en un CLI que recorra directorios de grabaciones.
- Prototipado de pipelines ASR multilingues: cubre 25 idiomas, lo que permite evaluar un mismo pipeline en ingles, frances, aleman y espanol con un unico modelo.
- Investigacion en eficiencia de ASR en Apple Silicon: sirve como base para medir latencia y precision de la variante GPU frente a la variante ANE (no distribuida) y frente a NeMo en fp32.
- Integracion en apps de accesibilidad: transcripcion en dispositivo para personas con dificultades auditivas, sin coste de API y con datos que no salen del equipo.

## Benchmarks y rendimiento

| Prueba | Resultado | Umbral declarado |
|---|---|---|
| Similitud coseno del encoder GPU frente a NeMo fp32 (ventana unica) | 0,999997 | > 0,999 |
| NRMSE del encoder GPU frente a NeMo fp32 (ventana unica) | 0,00149 | < 0,05 |
| Clips publicos (EN, FR, DE, ES) | 72 de 83 transcripciones normalizadas coinciden con la referencia fp32 | no aplica |
| Fixture de silencio | verificado | no aplica |
| Fixture de 44 s con locucion repetida | verificado | no aplica |

No se han publicado resultados de WER sobre corpus completos ni comparaciones en leaderboards en la informacion disponible. El autor indica que los cambios de WER respecto a la referencia se producen en ambas direcciones y que solo se ha probado en Apple M5 con macOS 26.6.2.

## Requisitos de hardware

- Espacio en disco: aproximadamente 290 MB para el directorio completo (frente a 156 MB del origen comprimido).
- Sistema operativo: macOS 15 o iOS 18 en adelante, necesario para la representacion de pesos de cinco valores.
- Hardware probado: Apple M5 con macOS 26.6.2; otros chips no han sido probados segun el autor.
- VRAM: no disponible; al ejecutarse en Core ML sobre memoria unificada de Apple Silicon, no se publican cifras de memoria.
- GPU recomendadas: no disponible; la unica plataforma validada es Apple Silicon con `encoderComputeUnits: .cpuAndGPU`.
- Cabe en GPU de consumo Apple (M-series); no es ejecutable en GPU NVIDIA o AMD mediante este paquete Core ML.
- Opciones de despliegue: Core ML con FluidAudio 0.17.3 o 0.17.7 en Swift; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / runtime | Licencia | Estado en esta conversion |
|---|---|---|---|---|---|
| Phonon-2.5 Core ML (esta ficha) | ~0,6 B | 25 | Core ML, FluidAudio | CC-BY-4.0 | Encoder GPU validado; variante ANE no distribuida |
| FermionResearch/Phonon-2.5 (original) | ~0,6 B | 25 | checkpoint `.fermion` | CC-BY-4.0 | Modelo fuente de la conversion |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6 B | no disponible en la informacion | NeMo | no disponible en la informacion | Referencia fp32 usada para la comparacion numerica |
| FluidInference/parakeet-tdt-0.6b-v3-coreml | ~0,6 B | no disponible en la informacion | Core ML, FluidAudio | no disponible en la informacion | Aporta el preprocesador compartido |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La validacion es una prueba de humo: 83 clips en cuatro idiomas y una comparacion de ventana unica, no un corpus completo ni un leaderboard.
- Solo se ha probado en Apple M5 con macOS 26.6.2; el comportamiento en otros chips Apple es desconocido.
- La variante dispersa para Neural Engine no se distribuye porque falla la comparacion estricta de activaciones; actualizar FluidAudio de 0.17.3 a 0.17.7 no lo resolvio.
- Las salidas fp16 del decoder y del joint no se garantizan numericamente identicas a fp32.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo derivado de Parakeet, hereda las limitaciones del modelo base, no detalladas aqui.
- El modelo no incluye traduccion ni deteccion de idioma explicita en la documentacion disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; deben conservarse la licencia original y el NOTICE, y atribuirse las modificaciones de conversion.
- El repositorio lo mantiene Muesli-HQ y no implica el aval de Fermion Research ni de FluidInference.
- El modelo esta atado a la version `.v3` del contrato de tensores y decoder de FluidAudio; cambios de version pueden romper la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Muesli-HQ/phonon-2.5-coreml
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5
- Preprocesador: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Pull request con scripts de conversion y resultados: https://github.com/FluidInference/mobius/pull/113
