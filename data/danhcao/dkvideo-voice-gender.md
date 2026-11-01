# danhcao/dkvideo-voice-gender

## Resumen

DKvideo voice gender classifier (int8) es un modelo de clasificación de audio derivado de `prithivMLmods/Common-Voice-Gender-Detection-IND-En-ONNX`, publicado por el usuario danhcao. Se trata de una copia modificada del modelo base en la que se han cuantizado dinámicamente a int8 los pesos de las capas MatMul/Gemm mediante `quantize_dynamic` de onnxruntime, reduciendo el tamano del repositorio de 361 MB a 122 MB. Las etiquetas y el preprocesamiento se mantienen idénticos al original.

El modelo resuelve una tarea acotada: determinar si una voz suena masculina o femenina (el timbre de la voz, no el género de la persona) para seleccionar la voz de doblaje adecuada dentro de la aplicación DKvideo. Está construido sobre una arquitectura wav2vec2 exportada a ONNX, con un front-end convolucional que permanece en precisión flotante.

Su relevancia es práctica: demuestra que una cuantización dinámica int8 sobre un clasificador wav2vec2 conserva prácticamente las mismas decisiones que el modelo en precisión completa (99,6 % de coincidencia en audio limpio, 98,9 % con ruido a 5 dB SNR) a una fracción del tamano, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados. El modelo tiene un uso muy específico y un historial de descargas bajo (17 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer sobre front-end convolucional), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de 2 s en la evaluacion) |
| Tipos de cuantizacion | int8 dinamica en pesos MatMul/Gemm; front-end convolucional en float |
| Idiomas soportados | no disponible (evaluado con vietnamita y mandarin en FLEURS) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX de un clasificador wav2vec2, cuyo backbone procesa la forma de onda mediante capas convolucionales y un transformer, y cuya cabeza de clasificacion produce la decision binaria masculino/femenino. La modificacion introducida respecto al modelo base consiste exclusivamente en la cuantizacion dinamica a int8 de los pesos de las operaciones MatMul y Gemm con `quantize_dynamic` de onnxruntime; las etiquetas y el pipeline de preprocesamiento no se han alterado.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens o horas de audio, ni sobre si hubo ajuste fino con RLHF o DPO. El modelo base procede de `prithivMLmods/Common-Voice-Gender-Detection-IND-En-ONNX`, y la model card de esta copia no detalla la composicion de los datos de entrenamiento. La evaluacion publicada se realizo sobre FLEURS (CC-BY 4.0) con 1 070 clips de vietnamita y mandarin, recortados a 2 s y con ruido rosa a 5 dB SNR en la condicion ruidosa.

## Capacidades

- Clasificacion binaria de audio: distingue si una voz suena masculina o femenina a partir de la forma de onda.
- Procesamiento de clips cortos: la evaluacion se realizo con fragmentos de 2 s, lo que indica un diseno orientado a segmentos breves.
- Inferencia via ONNX Runtime, con pesos int8 que reducen el tamano del modelo.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un clasificador, no un modelo generativo.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; la evaluacion cubre vietnamita y mandarin, pero no se declara una lista de idiomas soportados.
- No incluye modo thinking, vision ni audio generativo.

## Casos de uso

- Seleccion de voz de doblaje en aplicaciones de video: es el uso original declarado por el autor; el modelo clasifica el timbre de la voz de entrada para asignar una voz de doblaje masculina o femenina, con un coste de 1 387 ms por clip en la version wav2vec2 evaluada.
- Preprocesado en pipelines de doblaje automatico: integrado como paso previo a la sintesis de voz, permite enrutar cada segmento hacia el catalogo de voces adecuado sin intervencion manual.
- Etiquetado de corpus de audio para entrenamiento: puede anotar automaticamente clips cortos con la etiqueta de timbre vocal, aunque la model card advierte que las etiquetas de genero de FLEURS son ruidosas y que parte del error medido es atribuible a ellas.
- Filtrado y segmentacion en archivos multimedia: al operar sobre clips de 2 s, encaja en un pipeline que divida el audio en ventanas y clasifique cada una antes de tareas posteriores de transcripcion o diarizacion.
- Despliegue en entornos con recursos limitados: la version int8 (122 MB) permite ejecutar la inferencia en dispositivos donde el modelo original de 361 MB no cabria, manteniendo la misma decision en el 99,6 % de los clips limpios.
- Prototipado de clasificadores de audio con ONNX Runtime: sirve como referencia de cuantizacion dinamica aplicada a wav2vec2, con metricas publicadas de degradacion (precisión 0,918 frente a 0,914 en limpio; 0,776 frente a 0,780 con ruido).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FLEURS (1 070 clips). Las celdas indican precision sobre los clips decididos / proporcion de clips decididos (p ≥ 0,8 o ≤ 0,2).

| Metodo (audio limpio) | vi M | vi F | zh M | zh F | ms/clip |
|---|---|---|---|---|---|
| pitch (anterior) | 1,00 / 0,08 | 0,91 / 0,06 | 1,00 / 0,05 | 1,00 / 0,02 | 30 |
| ECAPA-TDNN (JaesungHuh) | 0,37 / 0,85 | 1,00 / 1,00 | 0,35 / 0,63 | 1,00 / 1,00 | 2 245 |
| wav2vec2 | 0,80 / 0,99 | 1,00 / 1,00 | 1,00 / 1,00 | 1,00 / 1,00 | 1 387 |
| pyannote embedding + LR | 1,00 / 0,29 | – / 0,00 | 1,00 / 0,50 | 1,00 / 0,87 | 280 |

| wav2vec2, 2 s y ruido 5 dB | vi M | vi F | zh M | zh F |
|---|---|---|---|---|
| 2 s | 0,74 / 1,00 | 1,00 / 1,00 | 0,99 / 1,00 | 1,00 / 1,00 |
| ruido | 0,47 / 0,98 | 1,00 / 1,00 | 0,98 / 1,00 | 1,00 / 1,00 |

Comparacion int8 frente a precision completa (cada cuarto clip, 268 por condicion):

| Condicion | Coincidencia en decision | Precision int8 | Precision completa |
|---|---|---|---|
| Limpio | 99,6 % | 0,918 | 0,914 |
| 2 s | 99,3 % | 0,888 | 0,888 |
| Ruido 5 dB | 98,9 % | 0,776 | 0,780 |

La velocidad es practicamente identica entre ambas versiones, ya que el front-end convolucional permanece en float; la ganancia de la cuantizacion es de tamano.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no especificadas por el autor; al ser un modelo ONNX de 122 MB, puede ejecutarse en CPU sin problema y en cualquier GPU consumer.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del artefacto.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1 387 ms por clip en la evaluacion de wav2vec2 (sin especificar el hardware empleado); la version int8 mantiene una velocidad similar.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dkvideo-voice-gender (int8) | wav2vec2 ONNX int8 | 122 MB (repo 0,1 GB) | no disponible | Apache-2.0 | HuggingFace |
| prithivMLmods/Common-Voice-Gender-Detection-IND-En-ONNX | wav2vec2 ONNX | 361 MB | no disponible | Apache-2.0 | HuggingFace |
| ECAPA-TDNN (JaesungHuh) | ECAPA-TDNN | no disponible | no disponible | no disponible | referenciado en la model card |
| pyannote embedding + LR | embeddings + regresion logistica | no disponible | no disponible | no disponible | referenciado en la model card |

En la evaluacion publicada, wav2vec2 supera a ECAPA-TDNN en voces masculinas asiaticas (0,80 frente a 0,37 en vietnamita masculino limpio) y ofrece una cobertura de decision mucho mayor que el detector por pitch, a costa de una latencia de 1 387 ms frente a 30 ms del pitch.

## Limitaciones y advertencias

- El modelo clasifica el timbre de la voz, no el genero de la persona; el autor lo advierte explicitamente.
- Sesgos documentados: ECAPA-TDNN tiende a clasificar voces masculinas asiaticas como femeninas, y el propio wav2vec2 muestra un rendimiento inferior en vietnamita masculino (0,80 limpio, 0,74 a 2 s, 0,47 con ruido).
- Las etiquetas de genero de FLEURS son ruidosas segun la model card, por lo que el error real de wav2vec2 seria inferior al de las tablas.
- El detector de pitch de la aplicacion divide algunas voces femeninas a ~130 Hz y el ruido lleva toda voz por debajo de 120 Hz, por lo que el pitch no deberia imponerse al modelo salvo en la comprobacion de voces masculinas de tono muy alto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en voces atipicas o audio degradado.
- No se documentan los idiomas soportados ni el dominio de entrenamiento; la evaluacion se limita a vietnamita y mandarin.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar la atribucion al modelo base y revisar las condiciones del mismo.
- Para produccion: el modelo esta pensado para una tarea auxiliar dentro de una aplicacion concreta; no se recomienda como sistema autonomo de decision sobre personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danhcao/dkvideo-voice-gender
- Modelo base: https://huggingface.co/prithivMLmods/Common-Voice-Gender-Detection-IND-En-ONNX
- Revision del modelo base citada: f354b22f2671b1d762b328d5776956c1f7124ac1
- Dataset de evaluacion FLEURS (CC-BY 4.0): no se proporciona enlace directo en la informacion disponible
- Paper o blog del autor: no disponible
