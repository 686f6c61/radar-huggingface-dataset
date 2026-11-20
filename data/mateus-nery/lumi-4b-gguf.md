# Mateus-Nery/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de lenguaje de tipo transformer denso con aproximadamente 3.970 millones de parámetros (3.973.556.832 según los pesos en safetensors), desarrollado originalmente por el equipo CEIA (referenciado en el repositorio base como `ceia-br/lumi-4b`). Está especializado en portugués y se distribuye bajo una licencia propia denominada `lumi-4b`. La versión aquí documentada es una colección de cuantizaciones GGUF publicada por el usuario Mateus-Nery, pensada para su ejecución con llama.cpp en hardware de consumo.

El modelo resuelve el problema de disponer de un LLM conversacional y de razonamiento en portugués que pueda ejecutarse localmente con requisitos de memoria moderados. Con cuantizaciones que van de 2,41 GB (IQ4_XS) a 7,96 GB (BF16), es viable en GPUs de consumo como una RTX 5070 Ti, e incluso en CPU con rendimiento aceptable en modo generación.

La relevancia actual radica en que el autor de las cuantizaciones ha publicado mediciones sistemáticas de degradación (divergencia KL, coincidencia top-1 con BF16) y de rendimiento en benchmarks en portugués (MMLU global, MMLU-ProX, IFEval PT, ENEM y pruebas de comprensión de documentos largos), lo que permite elegir el nivel de cuantización con criterio técnico y no solo por tamaño. La versión documentada corresponde a Lumi-4B v0.2 (6 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 3.973.556.832 (~3,97 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (segun el ejemplo de ejecucion con `-c 32768`; no se confirma un maximo oficial distinto) |
| Tipos de cuantizacion | BF16, Q6_K_XL, Q6_K, Q5_K_S, Q4_K_XL, Q3_K_XL, IQ4_XS (GGUF); incluye fichero imatrix `imatrix-lumi-pt.gguf` |
| Idiomas soportados | Portugues (pt) |
| Licencia | `lumi-4b` (licencia propia, catalogada como "other") |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un transformer denso de ~4 B parametros. La model card de las cuantizaciones no describe la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF, DPO o ajuste por instrucciones; esos datos corresponderian al repositorio base `ceia-br/lumi-4b`, que no se incluye en la informacion proporcionada. El tag `nemotron` sugiere influencia o derivacion de la familia Nemotron de NVIDIA, pero no se confirma en el material disponible.

La innovacion tecnica destacable de este repositorio no esta en el modelo sino en el proceso de cuantizacion: se han generado cuantizaciones con imatrix especifica para portugues (`imatrix-lumi-pt.gguf`) y se han medido contra el original en BF16 con divergencia KL y coincidencia top-1, ademas de evaluar el impacto en benchmarks reales en portugues. Las cuantizaciones Q6_K_XL y Q6_K conservan practicamente el rendimiento del BF16 (99,0 % y 98,9 % de coincidencia top-1 respectivamente), mientras que IQ4_XS baja al 94,5 %.

## Capacidades

- Generacion de texto conversacional en portugues, con formato de chat compatible con plantillas Jinja (`--jinja`).
- Razonamiento y respuesta a preguntas de opcion multiple (evaluado en MMLU global, MMLU-ProX y pruebas tipo ENEM).
- Seguimiento de instrucciones en portugues (evaluado con Portuguese-IFEval, 535 instrucciones).
- Comprension de documentos largos: responde preguntas con evidencia sobre documentos de hasta 51.000 tokens introducidos completos en el contexto.
- Capacidad de abstenerse cuando la respuesta no figura en el documento (10/11 aciertos en el conjunto de prueba de "no esta en el documento").
- Generacion de codigo y paginas web (la model card muestra la generacion de una landing page como demostracion).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- No se documenta modo "thinking" ni capacidades multimodales.

## Casos de uso

- Atencion al cliente en portugues: el modelo mantiene conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para incorporar historial de cliente e informacion de producto en la misma ventana.
- Analisis de contratos y documentos legales: con documentos de hasta 51.000 tokens en contexto, puede extraer clausulas, datos de partes o condiciones economicas; las pruebas publicadas muestran 40-42 aciertos sobre 54 preguntas de extraccion de datos.
- Verificacion de politicas de privacidad y cumplimiento: el modelo demuestra capacidad de indicar cuando una informacion no aparece en el documento (10/11 en el conjunto de prueba), util para tareas de auditoria donde la abstención correcta es critica.
- Generacion de codigo y prototipos web: puede producir paginas HTML/CSS completas a partir de instrucciones, como muestra la demostracion de la model card en una RTX 5070 Ti.
- Educacion y preparacion de examenes: su rendimiento en preguntas tipo ENEM (85,1 % en BF16, 82,8 % en IQ4_XS) lo hace adecuado para tutoria y generacion de preguntas de practica en portugues.
- Despliegue en local para desarrolladores: con Q4_K_XL (3,13 GB) o IQ4_XS (2,41 GB) cabe en GPUs de consumo y permite integracion via `llama-server` con API compatible con endpoints, util para prototipado sin coste de API.
- Procesamiento por lotes en CPU: con Q3_K_XL o IQ4_XS en CPU se obtienen 26-29 tokens/s de generacion, suficiente para tareas asincronas de clasificacion o resumen de documentos.

## Benchmarks y rendimiento

Resultados publicados en la model card (1000 preguntas por test de opcion multiple y 535 instrucciones de Portuguese-IFEval):

| Modelo | Medio | Graduacion | Global MMLU | MMLU-ProX | IFEval PT | Media |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 41,9 | 48,9 | 60,9 | 32,1 | 34,2 | 43,6 |
| Q6_K_XL | 41,6 | 49,4 | 60,9 | 32,9 | 32,1 | 43,4 |
| Q6_K | 41,3 | 48,9 | 60,7 | 31,8 | 33,8 | 43,3 |
| Q4_K_XL | 41,4 | 48,6 | 59,6 | 32,5 | 33,3 | 43,1 |
| Q5_K_S | 41,7 | 48,8 | 60,9 | 31,3 | 32,5 | 43,0 |
| Q3_K_XL | 42,7 | 49,7 | 59,9 | 31,7 | 32,5 | 43,3 |
| IQ4_XS | 42,6 | 48,9 | 59,1 | 31,8 | 33,6 | 43,2 |

ENEM (803 preguntas de humanidades y lenguajes, sin imagen, 2009-2017 y 2022-2025):

| Modelo | BF16 | Q6_K_XL | Q6_K | Q5_K_S | Q4_K_XL | Q3_K_XL | IQ4_XS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Acierto | 85,1 % | 84,9 % | 84,9 % | 84,2 % | 85,2 % | 83,6 % | 82,8 % |

Preguntas sobre documentos (90 preguntas con respuesta sobre 10 documentos de 700 a 51.000 tokens):

| Tarea | BF16 | Q6_K_XL | Q6_K | Q4_K_XL | Q5_K_S | Q3_K_XL | IQ4_XS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Extraer un dato (54) | 40 | 41 | 42 | 40 | 41 | 40 | 40 |
| Indicar que no esta en el documento (11) | 10 | 10 | 10 | 10 | 10 | 10 | 10 |

Divergencia KL respecto a BF16 y coincidencia top-1: Q6_K_XL 0,0004 / 99,0 %; Q6_K 0,0006 / 98,9 %; Q4_K_XL 0,0035 / 97,2 %; Q5_K_S 0,0037 / 97,0 %; Q3_K_XL 0,0112 / 95,0 %; IQ4_XS 0,0124 / 94,5 %.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~8 GB; Q6_K_XL 4,56 GB; Q6_K 3,93 GB; Q4_K_XL 3,13 GB; Q5_K_S 3,04 GB; Q3_K_XL 2,68 GB; IQ4_XS 2,41 GB (tamanos de fichero; anadir margen para contexto KV).
- GPU recomendadas: RTX 5070 Ti (mediciones publicadas), y por tamano caben en cualquier GPU con 8 GB o mas para cuantizaciones de 4 bits; A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, desde una RTX 3060 8 GB (Q4_K_XL o inferiores) hasta modelos superiores; incluso IQ4_XS en GPUs de 4-6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-bench`), y por compatibilidad de formato GGUF, Ollama y LM Studio; no se documenta soporte en vLLM o TGI.
- Rendimiento medido (llama-bench, RTX 5070 Ti, tokens/s): Q4_K_XL lee 11.175 y escribe 226 (210 con contexto de 16k); IQ4_XS lee 11.905 y escribe 271 (251 con 16k); BF16 escribe 105.
- Rendimiento en CPU (Core Ultra 5 245KF, 14 nucleos, DDR5-5600): Q3_K_XL escribe 26,4 tokens/s; IQ4_XS 28,6 tokens/s; BF16 9,9 tokens/s; lectura entre 80 y 182 tokens/s segun cuantizacion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos comparables (por ejemplo, otros LLM de ~4 B en portugues) medidos con la misma metodologia. La model card solo compara las cuantizaciones del propio Lumi-4B contra su BF16. Por tanto, la comparativa con modelos de la misma categoria se indica como no disponible.

| Criterio | Lumi-4B (GGUF) | Alternativas comparables |
|---|---|---|
| Parametros | ~3,97 B | no disponible |
| Contexto | 32.768 tokens | no disponible |
| Rendimiento | MMLU global 60,9 (BF16) | no disponible |
| Licencia | `lumi-4b` (propia) | no disponible |
| Disponibilidad | GGUF en HF; base en `ceia-br/lumi-4b` | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en portugues; no se documenta soporte de otros idiomas y su uso en castellano u otras lenguas no esta validado.
- Riesgo de alucinacion inherente a los LLM; aunque el modelo demuestra abstenerse en el conjunto de prueba de documentos, no hay garantia general de que no invente datos fuera de ese conjunto.
- La licencia es propia (`lumi-4b`, catalogada como "other"); es imprescindible revisar los terminos en `https://huggingface.co/ceia-br/lumi-4b` antes de cualquier uso comercial. No se confirma que permita uso comercial.
- Las cuantizaciones de 4 bits y menores degradan ligeramente el rendimiento: IQ4_XS baja al 94,5 % de coincidencia top-1 y al 82,8 % en ENEM frente al 85,1 % del BF16.
- El contexto maximo verificado en la documentacion es de 32.768 tokens; no se confirma si el modelo soporta ventanas mayores.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad en produccion.
- El repositorio GGUF es una publicacion de terceros (Mateus-Nery) sobre el modelo base de CEIA; la responsabilidad sobre el modelo original y su licencia recae en el autor base.
- La version documentada es v0.2; las cuantizaciones de v0.1 permanecen en el historial del repositorio y podrian confundirse con las actuales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF
- Modelo base: https://huggingface.co/ceia-br/lumi-4b
- Licencia: https://huggingface.co/ceia-br/lumi-4b
- Historial de cuantizaciones v0.1: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/tree/001f32386a037b9a8d97bdf5ad3ccf983fcfce69
- Video de demostracion (BF16 vs Q6_K_XL): https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/resolve/main/lumi-lado-a-lado.mp4
