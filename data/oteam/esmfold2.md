# oteam/esmfold2

## Resumen

ESMFold2 es un modelo de predicción de estructura biomolecular *all-atom* y de diseño de secuencias de binders proteicos, publicado en HuggingFace por el usuario `oteam` bajo el identificador `oteam/esmfold2`. Se trata de una implementación no oficial, desarrollada por el proyecto OFoldX, del modelo ESMFold2 descrito por Biohub en el artículo «Language Modeling Materializes a World Model of Protein Biology»; los autores originales no han escrito, revisado ni avalado ni esta implementación ni su model card.

El modelo combina un codificador de lenguaje de proteínas ESMC-6B congelado (checkpoint `multimolecule/esmc-6b`) con un tronco de plegamiento recurrente de 48 bloques que actualiza características de token y de par, y una cabeza de difusión que genera coordenadas antes de que las cabezas de distograma y de confianza puntúen el resultado. Admite condicionamiento opcional por MSA en la variante estándar; la variante *fast* reduce el tronco a 24 bloques y elimina el MSA. El muestreo de difusión utiliza 14 pasos y el tronco aplica 4 actualizaciones recurrentes.

Su relevancia es doble: por un lado, traslada a un paquete instalable (`pip install ofoldx`) un pipeline de plegamiento de proteínas y ácidos nucleicos con generación de coordenadas por difusión; por otro, las variantes experimentales exponen el modelo de inversión diferenciable empleado para el diseño de secuencias de binders. El repositorio, sin embargo, acumula 0 descargas y 0 *likes* en el momento de la consulta y fue creado y actualizado el mismo día (28 de octubre de 2026), por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente condicionado por ESMC con generación de coordenadas mediante cabeza de difusión; tronco de 48 bloques (24 en la variante *fast*) y 4 actualizaciones recurrentes |
| Parámetros totales | 234.530.717 según los safetensors del repositorio; la tabla del autor indica 6.586,242 M para la variante completa, cifra que incluye el codificador ESMC-6B congelado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el autor no documenta límite de residuos por cadena ni longitud máxima de secuencia |
| Tipos de cuantización | No se documentan variantes cuantizadas (ni GGUF, ni int8, ni int4); el repositorio distribuye pesos en safetensors |
| Idiomas soportados | No disponible / no aplica: el modelo opera sobre secuencias de proteínas y ácidos nucleicos, no sobre lenguaje natural |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |
| Librería de inferencia | `ofoldx` (obligatoria) |
| Pipeline en HuggingFace | `other` |
| Bloques de plegamiento | 48 (estándar y experimental) / 24 (fast y experimental-fast) |
| Condicionamiento por MSA | Sí en ESMFold2 y Experimental; no en las variantes *fast* |
| Codificador ESMC | ESMC-6B congelado (`multimolecule/esmc-6b`) |
| Dimensiones internas | Single 384, pair 256, átomo 128, token 768 |
| Pasos de muestreo de difusión | 14 |
| Actualizaciones recurrentes | 4 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro etapas. Primero, un modelo de lenguaje de proteínas ESMC-6B congelado proporciona representaciones de secuencia. Segundo, un tronco de plegamiento recurrente actualiza las características de token (768) y de par (256) a lo largo de 48 bloques, con 4 actualizaciones recurrentes y dimensiones internas de single 384 y de átomo 128. Tercero, una cabeza de difusión genera las coordenadas atómicas en 14 pasos de muestreo. Cuarto, las cabezas de distograma y de confianza puntúan la estructura resultante. Las variantes experimentales añaden el modelo de inversión diferenciable utilizado para el diseño de secuencias de binders.

El modelo card describe además un contrato explícito de características y geometría: todos los límites de coordenadas consumen una proyección numérica finita, los valores no disponibles se seleccionan bajo la máscara declarada antes de cualquier operación aritmética o conversión de tipo y tienen derivadas de coordenadas nulas, y los valores no finitos activos se consideran peticiones inválidas. El eje de átomos de referencia es completo y sin relleno; los componentes cuyos átomos de ranura carecen de conformación de referencia utilizable se embeben a partir de su grafo determinado con la semilla del procesador. La convención de átomo representativo es CB, después CA y después el primer átomo admitido para proteínas, y C4 (purinas) o C2 (resto de clases conocidas), después C1′ y después el primer átomo para ácidos nucleicos, comenzando por C1′ en clases desconocidas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de estructura biomolecular *all-atom* (coordenadas atómicas completas) a partir de representaciones ESMC.
- Modelado de proteínas y de ácidos nucleicos, con convenciones de átomo representativo específicas para bases púricas y pirimidínicas.
- Condicionamiento opcional por evidencia de MSA de proteína en la variante estándar de 48 bloques.
- Modo de secuencia única sin MSA en la variante *fast* de 24 bloques, orientado a mayor velocidad.
- Diseño de secuencias de binders proteicos mediante el modelo de inversión diferenciable expuesto en las variantes experimentales.
- Puntuación de la predicción mediante cabezas de distograma y de confianza.
- Gestión explícita de entradas incompletas: máscaras de disponibilidad y registros `reference_embedded` para componentes sin conformación de referencia.
- Diseño de binders a partir de la diana especificada como secuencia de proteína en código de una letra, construyendo cada complejo diana-binder con dos cadenas proteicas lineales nuevas.
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso sobre texto ni generación de lenguaje natural.

## Casos de uso

- **Anotación estructural a gran escala**: la variante *fast* (24 bloques, sin MSA) permite recorrer catálogos de secuencias sin el coste de una búsqueda MSA, generando coordenadas *all-atom* para priorizar experimentalmente un subconjunto.
- **Predicción de complejos proteína-ácido nucleico**: el modelo cubre ambas familias y aplica convenciones de átomo representativo distintas para proteínas y nucleótidos, lo que resulta adecuado para estudiar interfaces proteína-ADN o proteína-ARN.
- **Diseño computacional de binders**: las variantes `esmfold2-experimental` y `esmfold2-experimental-fast` exponen el modelo de inversión diferenciable y el artefacto completo con los 19 pares Model-Processor del protocolo liberado, lo que permite optimizar secuencias de binder contra una diana dada en código de una letra.
- **Sustitución de estructuras experimentales ausentes**: en proyectos de biología estructural donde la cristalografía o la crio-EM no cubren una diana, el pipeline estándar con MSA proporciona un modelo inicial sobre el que plantear mutagénesis o docking.
- **Integración en pipelines con datos parciales**: el contrato de máscaras de disponibilidad y de valores no finitos permite procesar lotes heterogéneos donde algunos componentes carecen de conformación de referencia, sin romper el flujo por conversiones de tipo.
- **Investigación sobre el tronco de plegamiento**: con 234,5 M de parámetros en el repositorio (unos 0,9 GB en el formato distribuido), el tronco es susceptible de experimentación y ajuste fino en hardware de una sola GPU, manteniendo el codificador ESMC congelado.
- **Evaluación comparativa frente a ESMFold de primera generación**: la existencia de variantes estándar y *fast* con el mismo codificador permite aislar el efecto del número de bloques y del MSA en la calidad de la estructura predicha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card enlaza el artículo «Language Modeling Materializes a World Model of Protein Biology», pero no reproduce métricas (lDDT, RMSD, TM-score, GDT-TS ni comparaciones con AlphaFold) en el texto proporcionado. No se deben asumir cifras de rendimiento sin consultar el artículo original.

## Requisitos de hardware

- **Peso del tronco de plegamiento**: 234,5 M de parámetros, es decir, unos 0,94 GB en fp32 y unos 0,47 GB en bf16 (estimación aritmética; el autor no publica requisitos).
- **Peso del codificador ESMC-6B congelado**: la diferencia entre los 6.586,242 M declarados y el tronco sitúa el codificador en torno a 6,35 B de parámetros, aproximadamente 12,7 GB en bf16 y 25,4 GB en fp32 (estimación derivada, no publicada).
- **VRAM total estimada**: del orden de 13 GB en bf16 para el conjunto codificador + tronco, antes de activaciones, buffers de atención de pares y los 14 pasos de muestreo de difusión. La memoria real de inferencia será superior y no está cuantificada por el autor.
- **GPU profesionales**: A100 de 40 u 80 GB y H100 de 80 GB son opciones holgadas para bf16; una L40S de 48 GB cubre el modelo con margen para lotes pequeños.
- **GPU de consumo**: una RTX 4090 de 24 GB puede alojar los pesos en bf16, con margen limitado para activaciones en secuencias largas. Tarjetas de 16 GB exigen fp16 con descarga parcial a CPU o secuencias cortas; por debajo de 12 GB no es viable sin cuantización, y el autor no distribuye pesos cuantizados.
- **Opciones de despliegue**: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`), que carga el pipeline de plegamiento concreto. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a este tipo de pipeline.
- **Latencia y throughput**: no disponibles. El coste depende del número de residuos, de si se ejecuta la búsqueda MSA y del número de pasos de difusión (14 en todas las variantes).

## Comparativa con modelos similares

Comparación dentro de la propia familia, con datos de la tabla del autor:

| Variante | Bloques de plegamiento | MSA | Codificador | Pasos de difusión | Parámetros (M) |
|---|---|---|---|---|---|
| ESMFold2 | 48 | Sí | ESMC-6B | 14 | 6.586,242 |
| ESMFold2 Fast | 24 | No | ESMC-6B | 14 | 6.548,432 |
| Experimental | 48 | Sí | ESMC-6B | 14 | 6.568,980 |
| Experimental Fast | 24 | No | ESMC-6B | 14 | 6.531,170 |

Frente a ESMFold de primera generación y a AlphaFold2 o AlphaFold3, no se dispone en la información proporcionada de parámetros, ventanas de contexto, métricas ni condiciones de licencia comparables, por lo que la comparación cuantitativa se considera no disponible. La diferencia principal dentro de la familia es el número de bloques (48 frente a 24) y la presencia o ausencia de condicionamiento por MSA, que en la práctica separa el uso de máxima calidad del uso de alto rendimiento.

## Limitaciones y advertencias

- **Implementación no oficial**: el model card declara explícitamente que Biohub no escribió, revisó ni avaló esta implementación. Puede haber divergencias respecto al modelo descrito en el artículo, tanto en arquitectura como en resultados.
- **Ausencia de benchmarks**: no hay métricas publicadas en la información disponible, de modo que el modelo no debería entrar en producción sin una validación propia contra estructuras experimentales.
- **Madurez nula**: 0 descargas, 0 *likes* y creación y actualización en la misma fecha. No existe evidencia de uso por terceros.
- **Licencia AGPL-3.0**: copyleft fuerte. Ofrecer el modelo como servicio en red puede activar la obligación de liberar el código fuente de la obra derivada; conviene revisión legal antes de cualquier uso comercial en modalidad SaaS.
- **Dependencia externa no fijada**: el pipeline referencia el checkpoint congelado `multimolecule/esmc-6b`, pero el texto disponible se interrumpe antes de especificar la revisión exacta, lo que introduce riesgo de incompatibilidad entre versiones.
- **Requisito estricto de datos finitos**: los valores no finitos activos se consideran peticiones inválidas y las APIs sin máscara de disponibilidad exigen campos del modelo completos; un preprocesado laxo provocará fallos en tiempo de ejecución.
- **Restricción del diseño de binders**: la diana debe ser una secuencia de proteína en código de una letra; no se acepta una estructura ni una ruta de fichero como diana del diseño.
- **Pérdida de información relacional**: el bit de relación es presencia simétrica de arista positiva y descarta el tipado de relación de origen, lo que puede limitar la fidelidad en complejos con relaciones químicas específicas.
- **Riesgo de alucinación estructural**: se trata de un modelo generativo de coordenadas; puede producir conformaciones plausibles pero incorrectas, especialmente en regiones intrínsecamente desordenadas, y las cabezas de confianza no han sido validadas de forma independiente en la información disponible.
- **Sesgos**: no documentados. Es razonable esperar un sesgo hacia el espacio conformacional representado en los datos de ESMC, sin cuantificación disponible.
- **Idioma y contexto**: no aplica el soporte multilingüe; el autor no documenta límites de longitud de secuencia, lo que impide planificar el consumo de memoria para entradas largas.
- **Variante *fast***: al prescindir del MSA, cabe esperar una menor precisión en dianas con homólogos informativos, pero el autor no cuantifica esa pérdida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2
- Variante rápida: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental (artefacto completo de diseño de binders): https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental rápida: https://huggingface.co/oteam/esmfold2-experimental-fast
- Código de la implementación (`ofoldx.models.esmfold2`): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Librería `ofoldx`: https://github.com/OTeam-AI4S/OFoldX
- Artículo: https://biohub.ai/papers/esm_protein.pdf
- Repositorio original de Biohub: https://github.com/Biohub/esm
- Checkpoint del codificador ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
