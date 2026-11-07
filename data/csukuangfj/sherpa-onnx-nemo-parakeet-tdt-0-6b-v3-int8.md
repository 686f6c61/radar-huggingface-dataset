# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8

## Resumen

El paquete `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` es la exportación a ONNX en cuantización int8 del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por el proyecto sherpa-onnx bajo el identificador de `csukuangfj`. No se trata de un modelo entrenado por el autor del repositorio: los pesos son de NVIDIA y el trabajo de este paquete consiste en convertirlos desde el checkpoint `.nemo` original a grafos ONNX listos para inferencia con sherpa-onnx, una de las librerías de referencia para desplegar ASR en producción sin dependencias de Python pesadas.

Técnicamente es un transductor TDT (Token-and-Duration Transducer) offline compuesto por tres subgrafos —encoder, decoder y joiner— que procesa audio mono a 16 kHz y cubre 25 idiomas europeos (incluido el español). El sufijo `0.6b` indica el orden de magnitud de parámetros del modelo base, y la variante int8 reduce el tamaño del repositorio a 1,3 GB, lo que lo hace viable en CPU y en hardware modesto.

Su relevancia actual reside en que ofrece ASR multilingüe de calidad razonable con licencia CC BY 4.0 (permite uso comercial con atribución) y un formato de despliegue portable (ONNX + sherpa-onnx) que evita ataduras a CUDA o a frameworks de entrenamiento. Es una opción pragmática para transcripción en local, edge computing y pipelines donde no se quiere depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) offline con encoder, decoder y joiner |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa audio completo por clip, recomendado dividir en fragmentos de 15-20 s |
| Tipos de cuantizacion | int8 (este paquete); existe paquete fp32 equivalente |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC BY 4.0 (pesos de NVIDIA); código de exportación de sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo es un transductor TDT, una variante del transducer clásico en la que el predictor emite conjuntamente un token y una duración, lo que permite saltar frames de forma adaptativa y reduce el coste de decodificación frente a un transducer estándar. La arquitectura se compone de tres redes: un encoder que transforma el espectrograma de entrada en representaciones latentes, un decoder (predictor) que modela el historial de tokens y un joiner que combina ambas representaciones para producir la distribución sobre tokens y duraciones. El paquete exporta cada una de estas redes como un grafo ONNX independiente.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO, técnicas de aumento de datos) no están disponibles en la información proporcionada, más allá de que NVIDIA entrenó los pesos originales y de que el modelo cubre 25 idiomas. La innovación técnica destacable de este paquete no está en el entrenamiento sino en la exportación: sherpa-onnx convierte el checkpoint `.nemo` a ONNX con metadatos que indican al runtime que el joiner es de tipo TDT (campo `tdt` en la URL de metadatos del encoder), y ofrece tanto la variante fp32 de referencia como la int8 cuantizada.

## Capacidades

- Reconocimiento automático del habla offline sobre audio mono a 16 kHz.
- Transcripción multilingüe en 25 idiomas europeos, incluido el español.
- Decodificación de tipo TDT con predicción conjunta de token y duración.
- Ejecución sin conexión a red y sin dependencia de servicios externos.
- Compatibilidad con el runtime sherpa-onnx en Python, C++, C#, Java, Kotlin, Swift y otras plataformas.
- No realiza identificación de idioma: transcribe, pero no informa de qué lengua ha detectado.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.
- No incluye puntuación ni capitalización restauradas de forma explícita (la evaluación del autor las elimina antes de medir WER).

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio de 16 kHz y, dividiendo la grabación en fragmentos de 15-20 s cortados en silencios, permite generar actas sin enviar datos a la nube, algo crítico en entornos con requisitos de privacidad.
- Subtitulado automático de vídeo multilingüe: al cubrir 25 idiomas europeos con un único paquete, se puede usar para generar subtítulos en español, francés, alemán o polaco desde la misma infraestructura, simplificando el mantenimiento.
- Atención al cliente y analítica de llamadas: la transcripción offline de grabaciones permite alimentar motores de búsqueda o sistemas de análisis de sentimiento sin coste por minuto de API, y el formato ONNX facilita el despliegue en contenedores ligeros.
- Aplicaciones de accesibilidad: dictado por voz y transcripción en tiempo casi real en dispositivos de gama media, gracias a la cuantización int8 y a la ausencia de dependencia de GPU.
- Procesamiento por lotes de archivos de audio en pipelines de datos: el paquete se integra en scripts de Python con sherpa-onnx y permite transcribir grandes volúmenes en CPU, con throughput razonable si se trocea el audio correctamente.
- Despliegue en edge y dispositivos embebidos: al ser ONNX int8 y no requerir CUDA, puede ejecutarse en Raspberry Pi, mini-PC o servidores sin GPU, lo que habilita transcripción en kioscos, grabadoras o sistemas de vigilancia.
- Investigación en ASR multilingüe: sirve como baseline reproducible y de bajo coste para comparar técnicas de cuantización, troceado o normalización de audio.

## Benchmarks y rendimiento

Resultados publicados por el autor del paquete sobre el split de test de FLEURS, con 300 clips deterministas por idioma, puntuación y mayúsculas eliminadas y un único harness de decodificación. Son cifras propias del proyecto, no del autor del modelo base, por lo que no son directamente comparables con benchmarks publicados por NVIDIA. WER en porcentaje:

| Idioma | v3 (este paquete) |
|---|---|
| Inglés | 11,16 |
| Alemán | 6,84 |
| Francés | 8,69 |
| Español | 4,55 |

Comparativa con otros paquetes del mismo proyecto, según la model card:

| Modelo | Inglés | Alemán | Francés | Español |
|---|---|---|---|---|
| v2 (solo inglés) | 6,48 | no disponible | no disponible | no disponible |
| Ultra (multilingüe) | no disponible | 5,20 | 7,48 | 3,81 |
| v3 (este paquete) | 11,16 | 6,84 | 8,69 | 4,55 |

En clips cortos de inglés de 15 s o menos (282 clips): v2 6,42, v3 11,01, Ultra 8,56.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el paquete está pensado para CPU. En GPU, el modelo int8 de 0,6 mil millones de parámetros ocupa del orden de 1 GB o menos, pero no se han publicado cifras oficiales de VRAM.
- GPU recomendadas: no disponibles; el proyecto prioriza ejecución en CPU. Cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de memoria, aunque no se han publicado mediciones específicas.
- Cabe en CPU: sí; el paquete int8 está diseñado para ello y el autor lo describe como «más pequeño y rápido, lo que la mayoría de usuarios quiere».
- Opciones de despliegue: sherpa-onnx (Python, C++, C#, Java, Kotlin, Swift, etc.) sobre ONNX Runtime. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no se han publicado cifras absolutas. El autor sí reporta que en su prueba de estrés con audio concatenado, decodificar el clip completo de 184,6 s supuso +1645 MB de RSS sobre la línea base, frente a +142 MB al trocear en fragmentos de 15 s, lo que da una idea del coste de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 (este) | ~0,6 B | 25 | CC BY 4.0 | ONNX int8 | Multilingüe, WER 4,55 en español |
| sherpa-onnx parakeet v2 (solo inglés) | ~0,6 B | 1 (inglés) | CC BY 4.0 | ONNX | Mejor WER en inglés (6,48) que v3 (11,16) |
| sherpa-onnx parakeet Ultra (multilingüe) | no disponible | multilingüe | CC BY 4.0 | ONNX | Mejor en alemán, francés y español que v3 |
| Whisper (referencia del sector) | variable (tiny a large) | ~99 | MIT | múltiples | No hay datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El audio largo debe trocearse en silencios. Decodificar una grabación entera como un único clip degrada gravemente la calidad y dispara el consumo de memoria: en la prueba de estrés del autor, un clip de 184,6 s alcanzó 66,50 % de WER con +1645 MB de RSS, frente a 14,91 % de WER y +142 MB al trocear en fragmentos de 15 s. Se recomienda trocear en silencios en fragmentos de 15-20 s y nunca usar ventanas de longitud fija.
- El paquete int8 es más pequeño y rápido, pero su salida puede diferir ligeramente de la del paquete fp32 de referencia.
- El modelo transcribe pero no identifica el idioma detectado; no es un language identifier.
- Las entradas de audio muy silenciosas se ven afectadas por un problema del frontend registrado en el repositorio de sherpa-onnx (issue #4024); conviene normalizar la ganancia antes de pasarlas al modelo.
- El inglés es el idioma donde más difieren los paquetes: si la precisión en inglés sobre enunciados largos es prioritaria, el paquete v2 es mejor opción que este v3.
- Los WER publicados son mediciones propias del proyecto sherpa-onnx, no del autor del modelo base, y no son directamente comparables con benchmarks oficiales de NVIDIA.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio acreditar a NVIDIA y al proyecto sherpa-onnx. NVIDIA no respalda este paquete.
- No se han publicado análisis de sesgos del modelo en la información disponible; como todo sistema ASR, puede presentar diferencias de precisión entre acentos, variedades dialectales y condiciones acústicas.
- Riesgo de alucinación: no se han publicado tasas específicas para este paquete; en ASR, el riesgo se manifiesta como sustituciones o inserciones de palabras en audio ruidoso o con silencios largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentación de modelos NeMo en sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportación: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Workflow de publicación: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Issue sobre audio silencioso: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0 de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
