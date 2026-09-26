# kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-GGUF

## Resumen

Kataguru Titan 3.0 – Äärimmäinen Totuus (Ultimate Truth) es un modelo de lenguaje de 27.320.697.856 parámetros (unos 27,3 B) publicado por el usuario kataguru, distribuido en formato GGUF cuantizado para inferencia local. Se presenta como la versión oficial de cuantización del repositorio BF16 `kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16`, que a su vez parte del modelo base Qwen 3.8 27B de Alibaba. El modelo está especializado en la familia de lenguas aglutinantes (finés, estonio, húngaro y turco), además de inglés, y en razonamiento STEM y matemáticas.

La propuesta diferencial del autor es doble. Por un lado, el ajuste lingüístico para morfología aglutinante: el modelo card reporta resultados perfectos en pruebas propias de húngaro, turco y finés, y un salto notable en el benchmark estonio EstCOPA. Por otro, la eliminación del comportamiento de rechazo o moralizante mediante las técnicas que el autor denomina SOMA/ARA, con una tasa de rechazo declarada del 0,0 %, lo que lo orienta a entornos donde se requiere respuesta directa sin filtros editoriales.

Es relevante ahora porque la familia de cuantizaciones GGUF cubre desde 12,2 GB (Q3_K_S) hasta 23,5 GB (Q6_K), lo que permite ejecutar un modelo de 27 B en GPU de consumo con 12-24 GB de VRAM, y porque incluye un proyector multimodal (`mmproj-f16`) que habilita visión y OCR. El repositorio tiene 0 descargas y 0 «me gusta» en el momento de la consulta, por lo que todas las cifras proceden exclusivamente de la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles completos no disponibles); el autor menciona un «Master MLP reasoning core» |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q3_K_S; proyector multimodal mmproj-f16. Q8_0 no se publica por politica antifiltracion del autor |
| Idiomas soportados | Ingles (en), fines (fi), estonio (et), hungaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio base con pesos completos esta en BF16) |

## Arquitectura y entrenamiento

El modelo se describe como un transformer de ~27,3 B de parametros con un nucleo de razonamiento denominado «Master MLP reasoning core», optimizado para morfosintaxis compleja de lenguas aglutinantes y para razonamiento STEM. El autor no publica la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si hubo fases de RLHF o DPO; tampoco detalla la arquitectura de atencion ni innovaciones como atencion lineal o decodificacion especulativa. Toda esta informacion figura como no disponible.

Las unicas innovaciones tecnicas explicitamente mencionadas son las metodologias SOMA y ARA, empleadas para reducir el comportamiento de rechazo y el tono moralizante hasta una tasa declarada del 0,0 %. La evaluacion publicada se realizo con el framework `lm-evaluation-harness` sobre una interfaz compatible con OpenAI servida con vLLM, en infraestructura con 2x NVIDIA RTX 5090 de 32 GB. El formato de prompt indicado es ChatML, con apertura de bloque `<think>` para el modo de razonamiento. Se menciona un proyectil multimodal (`mmproj-f16`, 931 MB) que habilita capacidades de vision y OCR en LM Studio y llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, fines, estonio, hungaro y turco.
- Razonamiento con cadena de pensamiento, activable mediante la etiqueta `<think>` en el turno del asistente.
- Razonamiento matematico y STEM: el autor reporta mejoras en ARC-Easy, ARC-Challenge, PIQA y GSM8K.
- Razonamiento linguistico en lenguas aglutinantes: morfologia, casos y armonia vocalica en fines, estonio, hungaro y turco.
- Vision y OCR mediante el proyector mmproj-f16 (analisis de documentos de alta resolucion).
- Capacidad multilingue limitada a los cinco idiomas declarados; no se documentan otros.
- Modo sin censura: tasa de rechazo declarada del 0,0 %, respuestas directas sin sermones ni advertencias morales.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Atencion al cliente en fines, estonio, hungaro o turco: el ajuste sobre morfologia aglutinante permite gestionar consultas con declinaciones y compuestos largos que los modelos genericos tienden a degradar, manteniendo la coherencia terminologica.
- Procesamiento de documentacion administrativa nordica y centroeuropea: con mmproj-f16 puede aplicarse OCR sobre formularios y expedientes escaneados y resumirlos en el idioma original.
- Asistencia a la traduccion tecnica inversa (fi/et/hu/tr a ingles): util para localizacion de manuales donde la preservacion de morfemas y terminologia es critica.
- Analisis de razonamiento STEM en local: la mejora reportada en ARC-Challenge y PIQA lo hace apto para tutoria de ciencias a nivel de secundaria y primeros cursos universitarios sin enviar datos a la nube.
- Generacion y explicacion de matematicas paso a paso: el modo `<think>` permite desglosar problemas de nivel GSM8K, util en herramientas de estudio offline.
- Despliegue en estaciones de trabajo sin conectividad: con la cuantizacion Q4_K_M (17,2 GB) se puede operar en un portatil con GPU de 16 GB o en Apple Silicon de 24 GB o mas, manteniendo todos los datos en local.
- Investigacion sobre alineacion y rechazo: dado que el autor documenta explicitamente la supresion del comportamiento de rechazo (SOMA/ARA), sirve como caso de estudio comparativo frente a modelos alineados.
- Procesamiento por lotes de corpus en lenguas minoritarias: generacion sintetica de texto en estonio o fines para aumentar datasets de entrenamiento de otros sistemas.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la tabla publicada por el autor en la model card. Se obtuvieron con `lm-evaluation-harness` sobre vLLM en 2x RTX 5090 32 GB, comparando contra Qwen 3.8 27B Base sin ajustar. No se han verificado de forma independiente.

| Tarea | Metrica | Qwen 3.8 27B Base | Titan v3.0 Uncensored | Cambio |
|---|---|---|---|---|
| ARC-Easy | Acc_norm | 72,98 % | 87,58 % | +14,60 pp |
| HellaSwag | Acc_norm | 74,60 % | 84,80 % | +10,20 pp |
| ARC-Challenge | Acc_norm | 58,62 % | 68,34 % | +9,72 pp |
| WinoGrande | Acc | 71,10 % | 79,56 % | +8,46 pp |
| PIQA | Acc_norm | 80,10 % | 83,35 % | +3,25 pp |
| BoolQ | Acc | 89,60 % | 90,80 % | +1,20 pp |
| OpenBookQA | Acc_norm | 44,80 % | 45,80 % | +1,00 pp |
| GSM8K | Exact Match | ~47,0 % | 48,14 % | +1,14 pp |
| TruthfulQA MC2 | Multi-True Prob | 54,24 % | 53,49 % | -0,75 pp |
| TruthfulQA MC1 | Single-True Acc | 36,23 % | 35,37 % | -0,86 pp |
| EstCOPA | Accuracy | <50,0 % | 80,00 % (40/50) | No cuantificado por el autor |
| Hungaro (Alpaca-52k) | Tasa de exito | Aleatorio | 100,0 % (25/25) | No cuantificado por el autor |
| Turco (Gemma-51k) | Tasa de exito | Aleatorio | 100,0 % (25/25) | No cuantificado por el autor |
| FinnishBench-Kataguru-50 | Acreditacion en fines | 14/22 (anglicismos) | 100,0 % (22/22) | No cuantificado por el autor |
| Refusal / Moralizing | Tasa de rechazo | Alta | 0,0 % (SOMA/ARA) | No cuantificado por el autor |

No se han publicado resultados de MMLU, HumanEval ni de benchmarks multilingues estandar (como MMLU-pro o GlobalMMLU) en la informacion disponible.

## Requisitos de hardware

- Q6_K (~23,5 GB): 32 GB de RAM o 24 GB de VRAM. Precision casi sin perdida segun el autor (99,5 % del rendimiento BF16). Recomendado para RTX 3090/4090/5090 de 24 GB.
- Q5_K_M (~19,8 GB): 24 GB de RAM o 20 GB de VRAM. Punto optimo declarado para GPU de 24 GB (RTX 3090, 4090, 5090) dejando margen para buffers de contexto amplios.
- Q4_K_M (~17,2 GB): 20 GB de RAM o 16 GB de VRAM. Opcion equilibrada para GPU de gama media y Apple Silicon M1/M2/M3/M4 con 24 GB o mas de memoria unificada.
- Q3_K_M (~13,4 GB): 16 GB de RAM o 12 GB de VRAM. Permite ejecutar un modelo de 27 B en GPU de 16 GB.
- Q3_K_S (~12,2 GB): 14 GB de RAM o 12 GB de VRAM. Opcion ultraligera para tarjetas de consumo de 12-16 GB.
- mmproj-f16 (~931 MB): 1 GB adicional de VRAM si se habilita la vision.
- Cabe en GPU de consumo: si, desde 12 GB de VRAM con Q3_K_S hasta 24 GB con Q6_K.
- Opciones de despliegue documentadas: LM Studio, Ollama, Jan, text-generation-webui, llama.cpp nativo y vLLM (usado por el autor para la evaluacion, con endpoints compatibles con OpenAI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento comparado |
|---|---|---|---|---|---|
| Kataguru Titan 3.0 Uncensored | ~27,3 B | no disponible | Apache 2.0 | GGUF (Q3-Q6), BF16 | Referencia de la tabla de benchmarks del autor |
| Qwen 3.8 27B Base | ~27 B (no confirmado) | no disponible | no disponible | no disponible | Inferior en ARC-Easy (-14,60 pp), HellaSwag (-10,20 pp), ARC-Challenge (-9,72 pp) segun el autor |
| Alternativas de tamano similar (Llama 3.x 27B, Gemma 2 27B, Mistral 24B) | no disponible | no disponible | no disponible | no disponible | no disponible: la model card no incluye comparaciones con estos modelos |

Solo se dispone de comparacion directa frente al modelo base Qwen 3.8 27B. No hay datos de benchmarks frente a otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Todas las cifras de rendimiento, incluida la tasa de rechazo del 0,0 %, proceden del autor y no han sido verificadas por terceros. El repositorio registra 0 descargas y 0 valoraciones.
- No se documenta la longitud de contexto soportada, dato critico para planificar despliegues con ventanas largas.
- Cobertura idiomatica limitada a ingles, fines, estonio, hungaro y turco. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- El ajuste «uncensored» elimina los mecanismos de rechazo, lo que implica riesgo de generar contenido inapropiado, danino o ilegal sin advertencia. Requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de 27 B, agravado por la ausencia de datos sobre el dataset de entrenamiento y sobre posibles fases de RLHF/DPO.
- Ligera degradacion en TruthfulQA MC2 (-0,75 pp) y MC1 (-0,86 pp) respecto al modelo base, dentro del margen de error segun el autor, pero relevante si la veracidad factual es prioritaria.
- GSM8K se mantiene en 48,14 %, un valor modesto: no es adecuado como motor principal de matematicas complejas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la procedencia de los datos de entrenamiento ni sobre reclamaciones de terceros derivadas del ajuste.
- Los resultados en hungaro, turco y fines proceden de conjuntos de prueba propios del autor (25 y 22 elementos), tamanos de muestra demasiado reducidos para ser estadisticamente concluyentes.
- La omision deliberada de Q8_0 por «politica antifiltracion» limita las opciones de maxima fidelidad en el ecosistema GGUF; el autor equipara Q6_K a dicho nivel sin aportar mediciones comparativas.
- El rendimiento en tool calling y uso agentico no esta documentado; no se debe asumir su soporte en pipelines de automatizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-GGUF
- Repositorio base en BF16: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16
- Papers, blogs, demos o repositorios adicionales: no disponible en la informacion proporcionada.
