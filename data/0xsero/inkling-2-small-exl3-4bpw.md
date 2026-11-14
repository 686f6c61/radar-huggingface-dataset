# 0xSero/Inkling-2-Small-EXL3-4bpw

## Resumen

Inkling-2-Small-EXL3-4bpw es una cuantizacion de 4 bits del modelo thinkingmachines/Inkling-2-Small, publicada por el usuario 0xSero. Se trata de un modelo de mezcla de expertos (MoE) de 594B parametros totales con 17B parametros activos, orientado a tareas conversacionales y multimodal imagen-texto. La cuantizacion emplea el formato EXL3 de exllamav3 y afecta unicamente a los expertos enrutados del MoE, manteniendo el resto de tensores (atencion, router, embeddings, torre de vision y cabeza MTP) en BF16 sin modificar.

El interes de esta publicacion radica en que reduce el checkpoint original de 393,5 GB a 313 GB manteniendo una divergencia KL muy baja respecto al modelo fuente (KLD de 0,0213 nats y 97,35% de acuerdo top-1 sobre un conjunto de evaluacion retenido de 218K tokens). Esto permite desplegar un modelo de gran escala en 4 GPUs de 96 GB, algo inviable con los pesos completos en BF16.

La ficha describe tanto el modelo base como las particularidades de esta cuantizacion concreta. Es importante senalar que el modelo base no esta soportado por exllamav3 estandar ni por TabbyAPI, y que el autor mantiene un motor de inferencia propio para su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer con atencion hibrida (8 capas de atencion global, 40 capas de ventana deslizante) y cabeza MTP para decodificacion especulativa |
| Parametros totales | 594B (modelo base) |
| Parametros activos | 17B (modelo base) |
| Longitud de contexto | No disponible de forma explicita; la calibracion incluye filas de 16K-32K tokens y la evaluacion usa filas de 32K |
| Tipos de cuantizacion | EXL3 trellis con codebook mcg, 4,0 bpw uniforme solo en expertos enrutados; resto en BF16 |
| Idiomas soportados | No disponible (la evaluacion incluye un dominio multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small es un transformer MoE con 594B parametros totales y 17B activos, desarrollado por Thinking Machines. Su arquitectura combina 8 capas de atencion global con 40 capas de atencion de ventana deslizante (ring buffer de 1024 tokens), lo que reduce drasticamente el coste de cache KV en contextos largos. Incluye ademas una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. El checkpoint original almacena los expertos en capas 0-39 en NVFP4 y en capas 40-47 en MXFP8.

Esta cuantizacion concreta fue producida por 0xSero mediante un procedimiento capa por capa sobre las activaciones del propio modelo cuantizado, de modo que cada capa se calibra con entradas que ya incorporan el error de cuantizacion acumulado aguas arriba. La calibracion uso 4,17M tokens en 916 filas, con aproximadamente un 60% de sesiones reales de agentes y codigo con uso de herramientas, y el resto de texto multilingue, Wikipedia, razonamiento, matematicas, codigo y datos de function calling; un 12% de los tokens corresponden a filas de contexto largo de 16K-32K. La Hessiana de cada experto se calcula solo con los tokens que el router le asigna (unas 80K por experto de media), y los expertos raramente enrutados se contraen hacia la covarianza global de la capa. La matematica del modelo se verifico contra la implementacion de referencia con un error relativo de aproximadamente 1e-7 en FP32 y un 100% de acuerdo en el top-8 del router.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y modo de pensamiento (thinking), segun la evaluacion por dominio del autor.
- Generacion de codigo.
- Uso de herramientas y function calling (tool calling).
- Razonamiento agentico multi-paso con sesiones de herramientas.
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de vision incluida).
- Capacidades multilingues (dominio evaluado explicitamente).
- Decodificacion especulativa mediante cabeza MTP incluida.
- Manejo de contexto largo (evaluado con filas de 32K tokens).

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo soporta sesiones multi-turno con tool calling y razonamiento multi-paso; la evaluacion agentica muestra un KLD de 0,0507 y 96,84% de acuerdo top-1, lo que indica que la cuantizacion preserva el comportamiento agentico del modelo fuente.
- Asistentes de codigo en produccion: el dominio de codigo es el que menos degradacion sufre (KLD 0,0067, 98,13% top-1), por lo que es adecuado para generacion y revision de codigo en pipelines integrados.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision intacta en BF16, puede usarse para tareas de extraccion y comprension de documentos escaneados o capturas.
- Atencion al cliente automatizada: la ventana de contexto larga (filas de 32K en evaluacion) y las 40 capas de ventana deslizante permiten mantener conversaciones extensas con alta concurrencia y cache KV reducida.
- Razonamiento y analisis con modo thinking: util para tareas que requieren cadenas de razonamiento largas, con degradacion minima (KLD 0,0041 en el dominio de razonamiento).
- Despliegue en infraestructura de 4 GPUs de 96 GB: el tamano de 313 GB encaja en 4x96 GB, permitiendo servir el modelo con paralelismo de tensores y de expertos en entornos de datacenter.
- Procesamiento multilingue: el dominio multilingue muestra un KLD de 0,0187 y 96,08% top-1, adecuado para tareas de traduccion y generacion en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de calidad de cuantizacion (divergencia KL y acuerdo top-1) frente al checkpoint fuente:

| Dominio | Tokens | KLD (nats) | Top-1 acuerdo | PPL fuente → cuantizado |
|---|---:|---:|---:|---:|
| Agentico (tool use multi-turno) | 30.695 | 0,0507 | 96,84% | 3,042 → 3,041 |
| Tool calling | 18.420 | 0,0282 | 96,99% | 3,920 → 3,927 |
| Codigo | 15.388 | 0,0067 | 98,13% | 2,692 → 2,698 |
| Razonamiento / thinking | 18.238 | 0,0041 | 97,20% | 3,204 → 3,199 |
| Chat | 7.019 | 0,0062 | 97,35% | 4,573 → 4,575 |
| Multilingue | 17.507 | 0,0187 | 96,08% | 5,708 → 5,715 |
| Wiki / general | 12.909 | 0,0172 | 96,35% | 5,578 → 5,594 |
| Contexto largo (filas 32K) | 98.301 | 0,0184 | 97,83% | 2,195 → 2,198 |
| **Total** | **218.477** | **0,0213** | **97,35%** | **2,951 → 2,954 (+0,1%)** |

En la misma evaluacion, la cuantizacion mixta de 3,48 bpw obtiene KLD 0,0240 y 96,82% top-1, es decir, peor que esta de 4,0 bpw. El autor senala que buena parte del KLD medido es un suelo numerico: ejecutar el modelo fuente con la cuantizacion de activaciones NVFP4/MXFP8 para la que fue disenado produce un desplazamiento similar (KLD aproximado de 0,037) respecto a la referencia BF16.

## Requisitos de hardware

- VRAM estimada: 313 GB de pesos, mas cache KV. Solo las 8 capas de atencion global requieren cache KV de longitud completa; las 40 capas de ventana deslizante mantienen un ring buffer de 1024 tokens, lo que deja margen para contextos largos con alta concurrencia.
- GPU recomendadas: 4 GPUs de 96 GB (por ejemplo, H100 96GB o equivalentes), que es el dimensionamiento para el que el autor diseno los pesos.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB.
- Opciones de despliegue: exllamav3 estandar y TabbyAPI no soportan aun Inkling-2. El autor mantiene un motor propio en github.com/0xSero/inkling2-exl3 con paralelismo de tensores y expertos, cache KV cuantizada con soporte de ventana deslizante y decodificacion especulativa MTP. Dicho motor se desarrollo contra la cuantizacion de 3,48 bpw y el soporte para esta de 4,0 bpw esta en validacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-4bpw (esta ficha) | 594B / 17B | No disponible (evaluado a 32K) | EXL3 4,0 bpw (expertos) | Apache-2.0 | Hugging Face, requiere motor propio |
| Inkling-2-Small-EXL3-3.48bpw | 594B / 17B | No disponible | EXL3 mixta 3,48 bpw | Apache-2.0 | Hugging Face; KLD 0,0240, top-1 96,82% |
| thinkingmachines/Inkling-2-Small (fuente) | 594B / 17B | No disponible | BF16 / NVFP4 / MXFP8 | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo base no esta soportado por exllamav3 estandar ni por TabbyAPI; requiere el motor de inferencia del autor, cuyo soporte para esta cuantizacion concreta esta en validacion en el momento de la publicacion.
- La cuantizacion solo afecta a los expertos enrutados; el resto de tensores permanece en BF16, por lo que el ahorro de memoria es parcial (313 GB frente a 393,5 GB).
- El dominio agentico es el que presenta mayor divergencia (KLD 0,0507), por lo que en flujos de agentes complejos puede haber degradacion perceptible frente al modelo fuente.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles de forma explicita; la evaluacion cubre un dominio multilingue pero no detalla la lista de idiomas.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del formato EXL3.
- El repositorio figura con 0 GB de tamano y 0 descargas, lo que sugiere que los pesos podrian no estar completamente subidos o indexados; conviene comprobar la integridad de los ficheros antes de usarlo en produccion.
- Los numeros de calidad no son comparables con los de otras evaluaciones: el propio autor advierte que deben compararse solo bajo el mismo protocolo de evaluacion.

## Enlaces

- [Hugging Face: 0xSero/Inkling-2-Small-EXL3-4bpw](https://huggingface.co/0xSero/Inkling-2-Small-EXL3-4bpw)
- [Modelo base: thinkingmachines/Inkling-2-Small](https://huggingface.co/thinkingmachines/Inkling-2-Small)
- [Cuantizacion alternativa: Inkling-2-Small-EXL3-3.48bpw](https://huggingface.co/0xSero/Inkling-2-Small-EXL3-3.48bpw)
- [Motor de inferencia: github.com/0xSero/inkling2-exl3](https://github.com/0xSero/inkling2-exl3)
- [exllamav3 (turboderp)](https://github.com/turboderp-org/exllamav3)
- [Licencia Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
