# MudraForge/law2code-S1AM1-F1

## Resumen

`law2code-S1AM1-F1` es un modelo neuronal especializado desarrollado por MudraForge para la extracción determinista de cantidades, expresiones temporales y términos definidos en textos legales. Forma parte de la iniciativa `law2code`, cuyo objetivo es compilar estatutos de derecho corporativo y financiero en representaciones intermedias verificables y código ejecutable (por ejemplo, Catala o calculadoras de dominio específico). El modelo ocupa la etapa 1A del pipeline de MudraForge (extracción de hojas semánticas, desacoplamiento de sub-hojas y normalización de slots discretos) y está etiquetado como especialista Micro-1, dedicado exclusivamente a cantidades, duraciones, fechas, tasas, recuentos y términos definidos.

Arquitectónicamente no es un transformer generativo, sino un etiquetador de secuencias ligero: combina características ortográficas puras (17 dimensiones), una CNN de caracteres (128 dimensiones, anchura de 24 caracteres, kernels 2/3/4), embeddings BPE y de palabra (d = 96), una LSTM bidireccional de dos capas (hidden = 96) y dos cabezas de salida: un cuello de botella conceptual de 8 prototipos bilineales y una proyección de secuencia BILOU de 25 etiquetas con matriz de transición de Viterbi exacta. El modelo totaliza 369.532 parámetros (~1,5 MB sin comprimir) y opera bajo una restricción gramatical puramente ortográfica: cero expresiones regulares (`import re` se rechaza mediante aserción AST) y cero listas de palabras de clase abierta.

Su relevancia radica en la interpretabilidad y el coste: con menos de 400 mil parámetros logra latencias de 9-23 ms por cláusula en CPU y GPU, lo que lo hace adecuado para despliegues in-process de alta precisión en pipelines de cumplimiento normativo. El dominio cubierto es derecho financiero y corporativo (Income-tax Act de India, Companies Act, GST, Insolvency & Bankruptcy Code, Internal Revenue Code de EE. UU. y Delaware General Corporation Law). El modelo solo soporta inglés y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetador de secuencias: CNN de caracteres + embeddings BPE/palabra + LSTM bidireccional de 2 capas + cabeza de cuello de botella conceptual (8 prototipos bilineales) + proyección BILOU de 25 etiquetas con Viterbi |
| Parametros totales | 369.532 (~1,5 MB sin comprimir) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado en cláusulas de 12, 30 y 73 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`state_dict`; el repo reporta 0.0 GB) |

Parámetros internos adicionales: vocabulario de 1.460 tokens cerrados legales y funcionales; dimensión oculta d_model = 96; dimensión de CNN de caracteres = 128; dimensión de características geométricas = 17; dimensión de prototipos d_proto = 32; 6 clases objetivo (`MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `DEFINED_TERM`).

## Arquitectura y entrenamiento

El modelo es un etiquetador de secuencias discriminativo, no un generador. La entrada pasa por tres vías paralelas: un vector binario de 17 dimensiones de geometría ortográfica (formas ASCII, máscaras de puntuación, capitalización), una CNN de caracteres acotada (128 dimensiones, anchura de 24 caracteres, kernels 2, 3 y 4) y embeddings subword BPE más embeddings de palabra proyectados a d = 96. Tras normalización de capa y dropout, una LSTM bidireccional de dos capas (hidden = 96, salida bidireccional de 192) alimenta dos cabezas: un cuello de botella conceptual de 8 prototipos métricos bilineales (sub-question concept bottlenecks) y una proyección de secuencia BILOU de 25 etiquetas con matriz de transición de Viterbi exacta. La salida se materializa mediante un mecanismo denominado `DeferredSpanPool Egress`.

La innovación técnica destacable es la restricción de gramática puramente ortográfica: el modelo no usa expresiones regulares ni listas de palabras de clase abierta, lo que garantiza determinismo y auditabilidad en la extracción. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de cantidades monetarias (`MONEY`): importes con moneda, denominaciones multi-palabra (`crore`, `lakh`, `thousand`, `million`, `billion`) y códigos ISO (`USD`, `EUR`, `GBP`, `INR`).
- Extracción de tasas (`RATE`): porcentajes, puntos básicos (`bps`), techos de interés estatutario, supermayorías de voto y multiplicadores de ratio (`twice the rate`, `2.0x`).
- Extracción de fechas (`DATE`): fechas de calendario, ciclos fiscales estatutarios (`financial year`, `taxable year`, `assessment year`) y hitos flotantes (`appointed day`, `record date`).
- Extracción de duraciones (`DURATION`): plazos de prescripción, días hábiles y naturales, ventanas de curación y ventanas móviles (`three preceding financial years`, `thirty days`).
- Extracción de recuentos (`COUNT`): cuotas numéricas, número de miembros, dígitos puros y escalas escritas (`one hundred and twenty-five members`).
- Extracción de términos definidos (`DEFINED_TERM`): definiciones estatutarias, entrecomilladas, entre paréntesis y compuestas (`"applicable percentage"`, `"50% owned subsidiary"`).
- Etiquetado de secuencias BILOU con decodificación Viterbi exacta sobre 25 etiquetas y 6 clases.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un componente de extracción, no un agente.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Compilación de estatutos a código ejecutable: el modelo actúa como frontend determinista del pipeline `law2code`, extrayendo cantidades, plazos y términos definidos que alimentan la generación de lógica formal (Catala, calculadoras de dominio) en derecho fiscal y corporativo.
- Cumplimiento fiscal automatizado: extracción de umbrales monetarios y tasas (por ejemplo, en disposiciones del Income-tax Act o del Internal Revenue Code) para construir calculadoras de retención y validar parámetros regulatorios.
- Auditoría de contratos y regulaciones: identificación de ventanas temporales (`thirty days`, `three preceding financial years`) y fechas límite para verificar plazos de prescripción y obligaciones de reporte.
- Normalización de términos definidos en pipelines de extracción de información legal: detección de definiciones entrecomilladas o entre paréntesis para construir glosarios estructurados y enlazarlos con referencias cruzadas.
- Preprocesamiento para modelos mayores: al ser un especialista ligero (369.532 parámetros), puede ejecutarse in-process antes de un LLM o de un parser estatutario para reducir ambigüedad y aportar slots normalizados verificables.
- Validación de extracciones en producción: su restricción de cero regex y cero listas abiertas permite auditar el comportamiento y reproducir resultados de forma determinista en entornos regulados.
- Procesamiento de alto volumen en CPU: con latencias de 9-20 ms por cláusula en CPU y throughput de hasta ~3.269 tok/s, es adecuado para lotes masivos de cláusulas sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta un perfil de latencia auditado con 200 pasadas de inferencia repetidas:

| Entorno | Escala de cláusula | Tokens | Forward neuronal (p50) | Decodificación Viterbi (p50) | Total extremo a extremo (p50) | Total extremo a extremo (p95) | Throughput medio |
|---|---|---|---|---|---|---|---|
| CUDA | Corta | 12 | 9,62 ms | 2,44 ms | 12,66 ms | 16,84 ms | ~902 tok/s |
| CUDA | Media | 30 | 10,26 ms | 4,58 ms | 15,67 ms | 20,62 ms | ~1.850 tok/s |
| CUDA | Larga | 73 | 10,82 ms | 11,36 ms | 22,70 ms | 31,83 ms | ~3.042 tok/s |
| CPU | Corta | 12 | 9,47 ms | 1,56 ms | 9,28 ms | 10,84 ms | ~1.261 tok/s |
| CPU | Media | 30 | 9,68 ms | 4,60 ms | 13,96 ms | 36,24 ms | ~1.612 tok/s |
| CPU | Larga | 73 | 13,24 ms | 6,73 ms | 20,00 ms | 36,32 ms | ~3.269 tok/s |

El motor completo multi-especialista de MudraForge (Micro-1, Micro-2 XREF, Micro-3 OP, arbitraje de consenso y ensamblado DeferredSpanPool en concurrencia) opera a ~37,4 ms p50 sobre provisiones completas multi-cláusula.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el `state_dict` ocupa ~1,5 MB sin comprimir, por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU CUDA moderna (RTX 4090, A100, H100) funciona, aunque el modelo no aprovecha su capacidad; el perfil auditado usa un entorno CUDA aislado sin especificar el modelo de GPU.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA; también en CPU con latencias de 9-20 ms por cláusula.
- Opciones de despliegue: no se especifican en la información disponible; al ser un `state_dict` de PyTorch, el despliegue natural es inferencia in-process con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,28-22,70 ms p50 extremo a extremo según longitud de cláusula y entorno; throughput de ~902 a ~3.269 tok/s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Por su naturaleza (etiquetador de secuencias de 369.532 parámetros para extracción de entidades legales), no es directamente comparable con LLM generativos; las alternativas serían otros modelos de extracción de entidades legales, para los que no se han aportado datos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `law2code-S1AM1-F1` | 369.532 | No disponible | Apache 2.0 | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un parser estatutario monolítico: es un especialista de etapa 1A. Los números de coordenada legislativa (por ejemplo, `185` en `Section 185` o `1` en `sub-section (1)`) deben ser absorbidos por un especialista XREF, y los modales deónticos por otro componente.
- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- No genera texto, no razona y no soporta tool calling ni agentes; su uso fuera de la extracción de entidades producirá resultados no válidos.
- Al ser un modelo de extracción, puede fallar en construcciones legales no representadas en su vocabulario cerrado de 1.460 tokens; no se han publicado métricas de precisión o recall.
- No se han documentado sesgos conocidos ni tasas de alucinación; al no ser generativo, el riesgo de alucinación es estructuralmente distinto (errores de etiquetado, no invención de contenido).
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones completas antes de producción.
- El repositorio reporta 0 descargas y 0 likes, y un tamaño de 0.0 GB; verificar la disponibilidad real de los pesos antes de integrarlo.
- Las latencias reportadas provienen de un entorno aislado con 200 pasadas; el rendimiento en producción puede variar según el hardware y la concurrencia.

## Enlaces

- Hugging Face: https://huggingface.co/MudraForge/law2code-S1AM1-F1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
