# kindlingai/sage-s2.1-flash-exlr8-k2-k3-k4

## Resumen

Sage-S2.1-Flash · exlr8 (K2/K3/K4, pmcgx) es una cuantización multi-anchura del modelo Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM) y publicado en Hugging Face por el usuario kindlingai. El modelo base emplea la arquitectura GLM-5.3-Flash, un transformer con mezcla de expertos (MoE) de 45 capas, 288 expertos enrutados con top-8 más un experto compartido por capa, tamaño oculto de 4096 y una torre de visión, lo que lo convierte en un modelo multimodal de entrada imagen-texto y salida de texto.

Esta versión concreta no es un modelo nuevo, sino un empaquetado de pesos cuantizados en el formato exlr8 v2 con el libro de códigos trellis pmcgx (V2 L20) aplicado a todas las capas MoE. Cada experto enrutado se almacena en tres anchuras trellis (K2, K3 y K4) y cada experto compartido en K3 y K4, de modo que la anchura de servicio se elige en tiempo de carga. El objetivo es desplegar el modelo en dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10) usando de una a cuatro cajas con paralelismo tensorial.

La relevancia de esta ficha radica en que documenta una de las pocas cuantizaciones publicadas de un MoE multimodal de gran tamaño orientada a hardware de consumo profesional, con métricas de fidelidad frente al modelo BF16 y un formato de pesos propietario que exige un cargador específico. El repositorio ocupa 362,4 GB en total y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (GLM-5.3-Flash): 45 capas (0-2 densas, 3-44 MoE), 288 expertos enrutados top-8 + 1 experto compartido por capa, capa MTP 45, torre de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-8 de 288 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 con libro de códigos trellis pmcgx (V2 L20): K2 (2,0 bpw enrutados), K3 (3,0 bpw), K4 (4,0 bpw); torre de visión en BF16; redondeo E4M3 obligatorio |
| Idiomas soportados | no disponible (la model card menciona generación bilingüe chino/inglés en pruebas) |
| Licencia | MIT |
| Formato de pesos | exlr8 v2 (trellis pmcgx), safetensors propietario compatible con gr8; no GGUF |
| Tamano del repositorio | 362,4 GB (337,5 GiB) en total |
| Tamano por anchura | K2: 86,7 GB (TP=1); K3: 126,0 GB (TP=2); K4: 165,1 GB (TP=2, TP=3, TP=4) |
| Tamano oculto | 4096 |
| Tamano intermedio de experto | 2048 |
| Hardware objetivo | NVIDIA GB10 (DGX Spark, ASUS GX10), 1-4 cajas |

## Arquitectura y entrenamiento

El modelo base Sage S2.1 Flash sigue la arquitectura GLM-5.3-Flash: un transformer con 45 capas, de las cuales las tres primeras (0-2) son densas y las 42 restantes (3-44) son capas MoE con 288 expertos enrutados y enrutamiento top-8, más un experto compartido por capa. El tamaño oculto es de 4096 y el tamaño intermedio de cada experto es de 2048. Incorpora una capa MTP (multi-token prediction) en la posición 45 y una torre de visión, lo que le confiere capacidades de entrada imagen-texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación de esta publicación es puramente de compresión: cada anchura (K2, K3, K4) es una codificación pmcgx independiente y consciente de la Hessiana (LDLQ) con refinamiento, y los códigos no anidan entre anchuras. Todas las capas MoE (3-45) usan el libro de códigos pmcgx V2 L20 y cada valor del libro debe redondearse a FP8 E4M3 (redondeo al par más cercano, saturante) antes de aplicar los vectores laterales. Los pesos densos de todas las capas también se cuantizan, mientras que la torre de visión se mantiene intacta en BF16. El decodificador estándar EXL3, o cualquier cargador que solo soporte `mcg` o que omita el redondeo E4M3, no decodificará estos bytes con precisión; se requiere el cargador de kindlingai/gr8, que decodifica pmcgx de forma nativa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada multimodal imagen-texto (pipeline image-text-to-text) gracias a la torre de visión en BF16.
- Razonamiento multi-paso: la model card verifica generación greedy en aritmética multi-paso y deducción lógica.
- Generación de código en Python y CUDA, con verificación de salidas fluidas y precisas.
- Salida JSON estricta, útil para integraciones estructuradas.
- Explicación técnica bilingüe chino/inglés.
- Predicción multi-token (capa MTP 45), que acelera la decodificación especulativa.
- Soporte de paralelismo tensorial TP=1 a TP=4 para despliegue multi-nodo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estación de trabajo GB10: el ancho K2 (86,7 GB) cabe en una única caja de 128 GB con TP=1, lo que permite ejecutar un MoE multimodal de gran tamaño en hardware de sobremesa sin clúster.
- Servicio multi-nodo con paralelismo tensorial: el ancho K4 (165,1 GB) se sirve con TP=2, TP=3 o TP=4 mediante `./gr8 glm53f`, repartiendo el modelo entre dos a cuatro nodos GB10 para obtener la máxima fidelidad frente a BF16.
- Asistente de código en producción: la model card verifica generación de Python y CUDA con salidas precisas; puede integrarse en pipelines de revisión o generación de código donde se requiera baja latencia (40,6-51,0 tok/s en un solo stream con 2× GB10).
- Documentación técnica bilingüe: dado el soporte verificado de explicaciones técnicas chino/inglés, encaja en equipos con documentación en ambos idiomas.
- Extracción estructurada de datos: la verificación de salida JSON estricta lo hace adecuado para tareas de parsing y formateo automático de respuestas.
- Razonamiento aritmético y lógico en asistentes analíticos: validado en aritmética multi-paso y deducción lógica, útil para herramientas de cálculo o verificación de hipótesis.
- Análisis de imágenes con descripción textual: al conservar la torre de visión en BF16, puede emplearse en tareas de image-to-text como captioning o respuesta a preguntas sobre imágenes.
- Evaluación de sistemas distribuidos: la model card incluye pruebas en sistemas RDMA multi-nodo, por lo que puede usarse como banco de pruebas de infraestructura.

## Benchmarks y rendimiento

Los datos disponibles comparan la anchura K4 pmcgx con el modelo BF16 base y con la release previa mcg K4, sobre las mismas secuencias de tokens.

| Metrica | pmcgx K4 (esta release) | mcg K4 previo | Cambio |
|---|---:|---:|---:|
| KL media (41 filas held-out) | 0,0889 | 0,0985 | -9,8% |
| Acuerdo top-1 (41 filas held-out) | 91,5% | 91,0% | +0,5 pp |
| KL media (44 filas, 90.112 pos) | 0,08554 | 0,09453 | -9,51% |
| KL mediana (44 filas) | 0,00996 | 0,01085 | -8,22% |
| KL p90 (44 filas) | 0,10350 | 0,11267 | -8,14% |
| KL p99 (44 filas) | 1,08530 | 1,23840 | -12,36% |
| Acuerdo top-1 (44 filas) | 91,51% | 91,06% | +0,45 pp |
| NLL / PPL (ref. BF16: 1,8145 / 6,138) | 1,8127 / 6,127 | 1,8112 / 6,118 | mejor que BF16 |

En las 44 secuencias de evaluación, pmcgx K4 obtiene menor KL de vocabulario completo en 40 de 44 secuencias y mayor acuerdo top-1 en 33 de 44, sin valores no finitos.

Cambio de NLL en tres textos fijos (K4 menos BF16; menor es mejor):

| Texto | Forward offline | Servido con gr8, TP=2 |
|---|---:|---:|
| Prosa | +0,0037 | +0,0076 |
| CUDA | -0,0009 | -0,0021 |
| Python | +0,0039 | +0,0124 |

Servicio en vivo con gr8 (TP=2, KV int4, MTP=2), KL top-20 agrupada y acuerdo top-1 frente a BF16:

| Conjunto | Metrica | pmcgx K4 (vivo) | mcg K4 previo (vivo) | Cambio |
|---|---|---:|---:|---:|
| Primeras 10 filas held-out (20.470 pos) | KL top-20 | 0,0449 | 0,0485 | -7,4% |
| Primeras 10 filas held-out (20.470 pos) | Acuerdo top-1 | 91,4% | 90,8% | +0,5 pp |
| Conjunto prioritario de 13 filas (26.611 pos) | KL top-20 | 0,0424 | 0,0451 | -6,1% (gana 11/13) |
| Conjunto prioritario de 13 filas (26.611 pos) | Acuerdo top-1 | 91,5% | 91,0% | +0,4 pp (gana 10/13) |
| Conjunto prioritario de 13 filas (26.611 pos) | dNLL servido vs BF16 | -0,0030 (PPL 6,024 vs 6,042) | -0,0017 | mejor que BF16 |

Rendimiento de generación: 40,6-51,0 tok/s en un solo stream con 2× GB10. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: K2 86,7 GB (TP=1, cabe en una caja de 128 GB); K3 126,0 GB (TP=2); K4 165,1 GB (TP=2, TP=3 o TP=4).
- GPU recomendadas: NVIDIA GB10 (DGX Spark, ASUS GX10) en configuraciones de 1 a 4 cajas. No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no, salvo que se considere el GB10 como hardware de sobremesa profesional; no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: exclusivamente kindlingai/gr8 (`./gr8 glm53f`), con selección de anchura mediante `--variant k4`, `k3` o `k2`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato exlr8 v2 no es GGUF.
- Latencia y throughput: 40,6-51,0 tok/s en un solo stream con 2× GB10 (TP=2, KV int4, MTP=2). No se dispone de datos de throughput agregado por lote.
- El servidor gr8 descarga únicamente la porción de rango de cada caja desde el repositorio, lo que reduce el almacenamiento local necesario por nodo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash exlr8 K2/K3/K4 (este) | no disponible (MoE 288 expertos top-8) | no disponible | exlr8 v2 pmcgx, 2/3/4 bpw | MIT | Hugging Face, requiere gr8 |
| kindlingai/sage-s2.1-flash-exlr8-k4 | no disponible | no disponible | exlr8 mcg K4 | MIT | Hugging Face, requiere gr8 |
| kindlingai/glm-5.3-flash-exlr8-k2-k3-k4 | no disponible | no disponible | exlr8 pmcgx K2/K3/K4 | MIT | Hugging Face, requiere gr8 |
| internlm/Sage-S2.1-Flash (base BF16) | no disponible | no disponible | BF16 | MIT | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base y a la release previa mcg, que son las únicas referencias presentes en la información proporcionada. No se dispone de datos de modelos competidores de otros autores.

## Limitaciones y advertencias

- Requiere un cargador específico: un decodificador EXL3 estándar o cualquier cargador que solo soporte `mcg` o que omita el redondeo E4M3 no decodificará los pesos con precisión. Es imprescindible usar kindlingai/gr8.
- El formato exlr8 v2 no es compatible con GGUF ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita la portabilidad.
- Las anchuras K2, K3 y K4 son codificaciones independientes y no anidan entre sí; no se puede degradar de K4 a K2 sin recargar el conjunto de pesos correspondiente.
- El repositorio completo ocupa 362,4 GB, aunque el servidor descarga solo la porción de rango de cada caja.
- La torre de visión se mantiene en BF16, por lo que no se beneficia de la compresión y consume memoria adicional.
- El sesgo conocido del modelo base no está documentado en la información disponible.
- Riesgo de alucinación: no cuantificado; las métricas publicadas miden fidelidad frente a BF16, no veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible y los idiomas soportados no se detallan; solo se verifica bilingüismo chino/inglés en pruebas.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base internlm/Sage-S2.1-Flash.
- Las métricas de calidad se han obtenido con configuraciones concretas (TP=2, KV int4, MTP=2); el rendimiento puede variar con otras anchuras o topologías.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/sage-s2.1-flash-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Release previa mcg K4: https://huggingface.co/kindlingai/sage-s2.1-flash-exlr8-k4
- Release equivalente GLM-5.3-Flash: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
- Repositorio del cargador gr8: https://github.com/kindlingai/gr8
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
