# byumatrixlab/mapudungun-nllb-1.3B-arn-es-optuna-bpe

## Resumen

El modelo `mapudungun-nllb-1.3B-arn-es-optuna-bpe` es un ajuste fino de `facebook/nllb-200-distilled-1.3B` especializado en traduccion de mapudungun (codigo ISO `arn`) a castellano (`es`). Lo publica el usuario `byumatrixlab` como parte del trabajo descrito en el paper "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning" (Thompson, Rogers y Ringger, AmericasNLP 2026). El modelo aborda el problema de la traduccion automatica de una lengua indigena de muy bajos recursos, donde los tokenizadores multilingues genericos fragmentan en exceso las palabras aglutinantes del mapudungun.

La contribucion tecnica principal no es la arquitectura, que se mantiene identica a NLLB-200 distilled, sino la condicion de tokenizacion: se emplea un SentencePiece BPE entrenado solo con texto mapudungun y con un tamano de vocabulario seleccionado mediante un estudio de Optuna. El checkpoint corresponde a la "epoca del paper" y se archiva como referencia reproducible de esa condicion.

Con 1.370.637.312 parametros y un pipeline de traduccion, el modelo es pequeno para los estandares actuales y esta pensado para investigacion en MT de bajos recursos y para despliegues modestos en entornos academicos. Su relevancia actual radica en que documenta una receta reproducible de tokenizacion morfologica para lenguas aglutinantes y en que la licencia se declara de forma transparente como derivada de dos fuentes con restricciones no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200 distilled) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (NLLB-200 base usa 1024 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | other (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 del modelo base y CC BY-NC-SA 3.0 del corpus Duan et al. |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,5 GB |
| Direccion de traduccion | arn -> es |
| Tokenizador | SentencePiece BPE especifico de mapudungun, vocabulario elegido por Optuna |
| Metrica declarada | chrF++ medio a nivel de frase: 44,67 |
| Modelo base | facebook/nllb-200-distilled-1.3B |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura encoder-decoder tipo transformer de NLLB-200 distilled, con atencion multi-cabeza estandar y sin mecanismos de atencion lineal ni decodificacion especulativa documentados. La innovacion se situa en la capa de tokenizacion: se sustituye el tokenizador multilingue original por un SentencePiece BPE entrenado exclusivamente con texto mapudungun, con el tamano de vocabulario determinado por un estudio de Optuna. El objetivo es reducir la fragmentacion de palabras aglutinantes y preservar mejor la morfologia en la entrada y la salida.

El ajuste fino se realiza sobre el corpus de mapudungun de Duan et al. (licencia CC BY-NC-SA 3.0). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO ni hiperparametros de entrenamiento; esos datos no estan disponibles en la informacion proporcionada. El pipeline de inferencia incluye un preprocesado especifico de mapudungun y la eliminacion de marcadores de continuacion `@@` en la salida, lo que sugiere que el entrenamiento se hizo sobre texto segmentado con subpalabras y que la reconstruccion de palabras se gestiona en postproceso.

## Capacidades

- Traduccion automatica unidireccional de mapudungun a castellano.
- Manejo de morfologia aglutinante gracias al tokenizador BPE especifico de mapudungun.
- Preprocesado condicional de la entrada y limpieza de marcadores `@@` en la salida, integrados en el script `inference.py`.
- Generacion de texto en el sentido de traduccion (no se documenta generacion libre ni otros sentidos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a los dos idiomas declarados (`arn`, `es`).
- No se documentan modos de razonamiento (thinking), vision ni audio.

## Casos de uso

- Digitalizacion y traduccion de documentacion comunitaria: el modelo permite traducir textos escritos en mapudungun a castellano para archivos, actas o materiales educativos, aprovechando el tokenizador adaptado a la morfologia de la lengua.
- Investigacion en MT de bajos recursos: sirve como checkpoint de referencia reproducible para comparar estrategias de tokenizacion (BPE especifico frente a tokenizador multilingue) en lenguas indigenas.
- Preservacion linguistica: traduccion asistida de corpus orales transcritos y textos historicos para su consulta por investigadores y hablantes.
- Apoyo a la ensenanza bilingue: generacion de glosas y traducciones de material didactico mapudungun-castellano en contextos escolares con presencia de la lengua.
- Evaluacion de metricas morfologicas: al conservar mejor la segmentacion, el modelo es util como banco de pruebas para estudiar el efecto de la tokenizacion en chrF++ y en la calidad de la morfologia de salida.
- Traduccion de interfaz y contenidos locales: adaptacion de avisos, formularios o senalizacion bilingue en entornos donde se requiere castellano a partir de originales en mapudungun.
- Despliegue en entornos academicos modestos: con 1,37 mil millones de parametros, puede ejecutarse en una unica GPU de gama media para experimentos y demos, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 44,67 | arn -> es, tamano 1.3B, condicion Optuna BPE |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. El unico dato de rendimiento es el chrF++ reportado por el pipeline corregido del paper.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo para pesos, mas activaciones y cache; en la practica se recomienda al menos 8 GB.
- En fp16/bf16: alrededor de 2,8 GB para pesos; viable en GPUs consumer con 8 GB o mas.
- En cuantizacion de 8 bits: en torno a 1,4 GB para pesos, aunque no se documentan recetas de cuantizacion para este checkpoint.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 o H100 para lotes grandes; RTX 3060/4060 Ti de 8-16 GB para inferencia individual.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en fp16.
- Opciones de despliegue: `transformers` 4.x con el script `inference.py` del repositorio; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-optuna-bpe | 1,37 B | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste fino de NLLB-200 con BPE especifico de mapudungun |
| facebook/nllb-200-distilled-1.3B | 1,3 B | 1024 tokens (segun especificacion de NLLB-200) | 200 idiomas | CC-BY-NC 4.0 | Modelo multilingue general, sin ajuste especifico de mapudungun |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens (segun especificacion de NLLB-200) | 200 idiomas | CC-BY-NC 4.0 | Version mas pequena del modelo multilingue general |

La comparativa se limita al modelo base y a su variante de 600M porque no se dispone de informacion sobre otros ajustes especificos de mapudungun en los datos proporcionados. No se dispone de resultados de benchmarks comparativos entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere revisar y cumplir ambas obligaciones, y la licencia declarada es `other`.
- Direccion unica: solo se documenta arn -> es; no se garantiza calidad en es -> arn ni en otros pares.
- Riesgo de alusion: como todo modelo de traduccion neuronal entrenado con corpus limitados, puede generar traducciones plausibles pero incorrectas, especialmente en terminos tecnicos, neologismos o variantes dialectales.
- Sesgos del corpus: el corpus Duan et al. puede sobrerrepresentar ciertas variedades o registros del mapudungun, lo que puede sesgar la salida.
- Cobertura limitada a dos idiomas: no es un modelo multilingue general; su uso fuera de arn/es no esta soportado.
- Checkpoint de la "epoca del paper": puede no reflejar mejoras posteriores ni correcciones de entrenamiento.
- Dependencia de preprocesado: el rendimiento depende del preprocesado condicional y de la eliminacion de marcadores `@@`; omitirlos puede degradar la calidad.
- Requiere `transformers` 4.x; no se documenta compatibilidad con otras librerias de inferencia.
- Sin datos publicados sobre cuantizacion, latencia o throughput, por lo que las estimaciones de hardware son aproximadas.
- No se documentan evaluaciones de robustez, seguridad ni sesgos mas alla de la metrica chrF++.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-optuna-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). No se proporciona URL en la informacion disponible.
- Corpus Duan et al.: no se proporciona URL en la informacion disponible.
- Repositorio de codigo o demo: no disponible en la informacion proporcionada.
