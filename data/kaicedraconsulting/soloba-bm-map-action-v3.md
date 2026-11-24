# KaicedraConsulting/soloba-bm-map-action-v3

## Resumen

Soloba bm map-action v3 es un modelo de reconocimiento automatico del habla (ASR) especializado en bambara (bm), desarrollado por KaicedraConsulting para Map Action. Se trata de un ajuste fino (fine-tune) del modelo base RobotsMali/soloba-ctc-0.6b-v3, un sistema FastConformer CTC de 0,6 mil millones de parametros con licencia CC-BY-4.0. El objetivo concreto es permitir que la ciudadania reporte por voz problemas medioambientales y de saneamiento en Mali.

El modelo parte de un ASR general de bambara y se adapta a un dominio muy especifico: transcripciones de reportes ciudadanos sobre residuos, saneamiento y entorno urbano. La relevancia de esta version radica en la mejora medible sobre el modelo base: reduce la tasa de error de palabra (WER) del 41,1 % al 33,8 % en el conjunto de prueba de reportes de Map Action y del 33,5 % al 27,9 % en bambara general.

Con solo 32 descargas y creado en noviembre de 2026, es un modelo de nicho, orientado a una aplicacion social concreta en un idioma de bajos recursos. Emplea la libreria NeMo y se distribuye en formato .nemo, con un repositorio de 2,4 GB. Su principal limitacion declarada es que los datos de entrenamiento provienen de un unico hablante masculino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer CTC (NeMo) |
| Parametros totales | 0,6 mil millones (0.6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .nemo (NeMo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer con cabecera CTC, heredada del modelo base de RobotsMali. FastConformer es una variante del transformer Conformer con atencion submuestreada que reduce la longitud de secuencia de entrada, lo que abarata el coste computacional en tareas de audio de secuencias largas. La salida es una transcripcion caracter a caracter mediante CTC, sin decodificador autorregresivo.

El ajuste fino se realizo durante 2.600 pasos con tamano de lote 16, optimizador AdamW, tasa de aprendizaje 5e-5 con decaimiento coseno, sobre una unica GPU A40 durante 32 minutos. Los datos de entrenamiento combinan 102 grabaciones de Map Action con transcripciones corregidas manualmente (ponderadas x8), 4.154 clips de dominio filtrados de corpus abiertos de RobotsMali y 1.300 clips generales de RobotsMali/afvoices para mitigar el olvido catastrofico. Las frases de prueba se mantuvieron fuera del entrenamiento. No se menciona el uso de RLHF ni DPO, algo esperable en un modelo ASR CTC.

## Capacidades

- Reconocimiento automatico del habla en bambara a partir de audio mono a 16 kHz.
- Transcripcion de reportes ciudadanos sobre medio ambiente y saneamiento (dominio especifico de ajuste).
- Manejo de vocabulario urbano de bambara con prestamos del frances, aunque con errores ortograficos en esos prestamos.
- Salida de texto plano mediante CTC, sin puntuacion ni mayusculas garantizadas.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades de vision, audio generativo ni modo "thinking".
- Capacidad multilingue limitada al bambara; no traduce ni transcribe otros idiomas de forma fiable.

## Casos de uso

- Reporte ciudadano de problemas de saneamiento: un vecino graba una nota de voz describiendo un vertido o una fuga y el modelo la transcribe para su registro en un sistema de gestion de incidencias. Es adecuado porque ha sido ajustado con ese tipo de grabaciones.
- Canal de voz para aplicaciones civicas en Mali: integracion del ASR en una app movil que permita enviar incidencias ambientales sin necesidad de escribir, util en contextos de baja alfabetizacion digital.
- Triaje y clasificacion de reportes: la transcripcion alimenta un pipeline posterior de procesamiento de lenguaje que categoriza y prioriza las incidencias. El ASR actua como primera etapa.
- Analisis de datos de campo: transcripcion de encuestas o entrevistas realizadas en bambara por trabajadores de ONG sobre condiciones de saneamiento.
- Accesibilidad: conversion de audio a texto para personas con dificultades de lectoescritura o para documentar reuniones comunitarias.
- Archivado y busqueda: indexacion de grabaciones de campo para permitir busquedas por texto sobre el contenido hablado.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, menor es mejor); texto en minusculas y sin puntuacion. Mismo conjunto de clips antes y despues del ajuste.

| Conjunto de prueba | Clips | Modelo base | Este modelo |
|---|---|---|---|
| Reportes de voz de Map Action (frases reservadas) | 16 | 41,1 % | 33,8 % |
| Bambara general (RobotsMali/afvoices, reservado) | 200 | 33,5 % | 27,9 % |
| Clips de dominio de RobotsMali/bam-asr-early (test) | 48 | 57,8 % | 54,7 % |

Tasa de error de caracter (CER) en los reportes de Map Action: 16,8 % → 14,6 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,6 B de parametros en precision completa el modelo ronda los 2,4 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor entreno en una A40; para inferencia son suficientes GPUs como RTX 3090, RTX 4090 o superiores, e incluso GPUs con 8 GB de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM.
- Opciones de despliegue: NeMo (nemo_toolkit[asr]==2.5.0) mediante `ASRModel.restore_from`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo CTC de audio).
- Latencia y throughput: no disponibles; el autor solo reporta 32 minutos de entrenamiento en una A40.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER (bambara general) | Licencia | Formato |
|---|---|---|---|---|---|
| KaicedraConsulting/soloba-bm-map-action-v3 | 0,6 B | bambara | 27,9 % | CC-BY-4.0 | .nemo |
| RobotsMali/soloba-ctc-0.6b-v3 (base) | 0,6 B | bambara | 33,5 % | CC-BY-4.0 | .nemo |
| Otros ASR de bambara | no disponible | bambara | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks de otros sistemas ASR de bambara en la informacion proporcionada.

## Limitaciones y advertencias

- Un solo hablante: las grabaciones de Map Action usadas en entrenamiento y en el primer conjunto de prueba provienen de un unico hombre; parte de la mejora refleja adaptacion a su voz y el rendimiento caera con otras voces.
- Code-switching: el bambara urbano mezcla frances; las referencias escriben las palabras francesas con su ortografia ("carburant", "forage") y el modelo tiende a escribirlas foneticamente, lo que infla el WER aunque la palabra se entienda (de ahi que el CER sea mucho menor).
- El objetivo del 30 % de WER se cumple en bambara general, pero aun no en los reportes de voz.
- Riesgo de alucinacion y errores de transcripcion inherentes a un modelo CTC de dominio limitado; no debe usarse como transcripcion legal o medica sin revision.
- Restriccion de uso: los transcriptos deben mostrarse como generados por maquina, junto al audio original.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero debe acreditarse tanto a Map Action/KaicedraConsulting como al modelo base de RobotsMali.
- Cobertura limitada a bambara; no fiable para otros idiomas ni para audio con ruido intenso no representado en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaicedraConsulting/soloba-bm-map-action-v3
- Modelo base: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v3
- Map Action: https://www.map-action.com
- Dataset de entrenamiento citado: Map-Action/bambara-asr-environnement (referenciado en la model card; no se proporciona URL directa)
- Corpus general citado: RobotsMali/afvoices (referenciado en la model card; no se proporciona URL directa)
