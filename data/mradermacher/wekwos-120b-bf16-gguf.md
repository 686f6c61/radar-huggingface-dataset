# mradermacher/wekwos-120b-bf16-GGUF

## Resumen

wekwos-120b-bf16 es un modelo de lenguaje de gran tamano (aproximadamente 123.600 millones de parametros) especializado en linguistica historica, concretamente en la reconstruccion del protoindoeuropeo (PIE, etiquetado como `ine` en Hugging Face). El modelo original fue desarrollado por el usuario `disinfozone` y esta construido sobre la arquitectura `nemotron_h`, segun las etiquetas del repositorio. Esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp.

La relevancia de este modelo radica en su nicho: no es un modelo generalista, sino una herramienta de investigacion orientada a tareas de linguistica comparativa e historica, con soporte para ingles (`en`) y protoindoeuropeo reconstruido (`ine`). El uso de tecnicas de GRPO (Group Relative Policy Optimization) en su entrenamiento sugiere un ajuste por refuerzo orientado a mejorar el razonamiento en tareas linguisticas especializadas.

El repositorio pesa 379,7 GB e incluye cuantizaciones estaticas en Q2_K, Q4_K_S y Q8_0 (esta ultima dividida en tres partes). No se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto o la composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer; detalles de atencion no disponibles) |
| Parametros totales | 123.611.033.088 (aprox. 123,6 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0 (GGUF); el modelo base se distribuye en bf16 |
| Idiomas soportados | protoindoeuropeo reconstruido (`ine`), ingles (`en`) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `nemotron_h`, una familia de transformers desarrollada en el ecosistema NVIDIA Nemotron. No se dispone de informacion publica en la documentacion proporcionada sobre el numero de capas, la configuracion de atencion, el uso de mezcla de expertos (MoE) o cualquier innovacion arquitectonica especifica. El modelo base se distribuye en bf16 y esta etiquetado como `conversational`, lo que indica que ha sido ajustado para dialogos multi-turno.

En cuanto al entrenamiento, la unica pista disponible es la etiqueta `grpo`, que apunta al uso de Group Relative Policy Optimization, una variante de aprendizaje por refuerzo empleada habitualmente para mejorar el razonamiento y la calidad de las respuestas. No se especifican el volumen de tokens de entrenamiento, la composicion del corpus (presumiblemente textos linguisticos, inscripciones y material de linguistica comparativa) ni si hubo fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (etiqueta `conversational`).
- Trabajo con protoindoeuropeo reconstruido: transcripcion, analisis morfologico y comparacion de formas reconstruidas.
- Soporte de ingles como idioma vehicular para instrucciones y explicaciones.
- Ajuste mediante GRPO, orientado a mejorar la calidad del razonamiento en tareas especializadas.
- Capacidades de linguistica historica: etimologia, correspondencias foneticas y evolucion de lenguas indoeuropeas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; la etiqueta GRPO sugiere cierta orientacion al razonamiento, pero no se documenta.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en linguistica comparativa: el modelo puede asistir en la formulacion y contraste de raices protoindoeuropeas reconstruidas, generando hipotesis de correspondencia fonetica entre lenguas hijas que el investigador valida despues manualmente.
- Docencia universitaria de linguistica historica: generacion de ejercicios y explicaciones sobre evolucion de formas PIE a lenguas como el latin, el griego o el sanscrito, aprovechando su entrenamiento especifico en `ine`.
- Analisis etimologico asistido: dado un termino en una lengua indoeuropea moderna, el modelo puede proponer una cadena etimologica hacia la forma reconstruida, util para lexicografia y elaboracion de diccionarios etimologicos.
- Procesamiento de corpus epigraficos y filologicos: asistencia en la normalizacion y anotacion preliminar de textos antiguos con transliteraciones y glosas en ingles.
- Generacion de contenido divulgativo: redaccion de articulos o material didactico sobre linguistica indoeuropea a partir de instrucciones en ingles, con terminologia tecnica especializada.
- Prototipado de asistentes especializados: despliegue local mediante llama.cpp u Ollama con las cuantizaciones Q4_K_S o Q8_0 para construir un asistente de consulta filologica sin dependencia de APIs externas.
- Evaluacion comparativa de modelos en dominios de baja resource: util como banco de pruebas para estudiar como se comportan LLM de gran escala en un dominio altamente especializado y con vocabulario tecnico restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 GB con Q2_K, unos 78 GB con Q4_K_S y alrededor de 132 GB con Q8_0 (tamanos de fichero indicados por el autor).
- El modelo base en bf16 requiere del orden de 240-250 GB de memoria (pesos de 123,6 mil millones de parametros a 16 bits), lo que exige multiples GPU o memoria unificada de gran capacidad.
- GPU recomendadas: para Q4_K_S, configuraciones multi-GPU con 2x A100 80 GB o 2x H100 80 GB; para Q2_K, posible en una unica A100 80 GB o H100 80 GB. El bf16 completo requiere al menos 3-4 GPU de 80 GB o un nodo con memoria unificada (por ejemplo, GH200).
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni siquiera en Q2_K; seria necesario repartir entre varias GPU o usar RAM del sistema con offloading, con una penalizacion severa de velocidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para los ficheros GGUF; vLLM o TGI para el modelo base en safetensors. La cuantizacion Q8_0 esta dividida en tres partes que deben concatenarse antes de su uso.
- Latencia y throughput estimados: no disponibles. Con cuantizaciones de este tamano y offloading parcial, se espera un throughput bajo (del orden de pocos tokens por segundo), aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos directamente comparables en el mismo nicho (LLM de gran escala especializados en protoindoeuropeo). A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wekwos-120b-bf16 (esta ficha) | 123,6 B | no disponible | NVIDIA Nemotron Open Model License | GGUF / safetensors | Especializado en `ine` e ingles |
| Modelos generalistas de ~120 B | ~120 B | variable | variable | safetensors / GGUF | No especializados en linguistica historica; comparacion de rendimiento no disponible |
| Modelos especializados en linguistica | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas publicas equivalentes |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible.

## Limitaciones y advertencias

- Nicho muy restringido: el modelo esta orientado a protoindoeuropeo e ingles; su rendimiento en castellano u otras lenguas no esta documentado y probablemente sea limitado.
- Riesgo elevado de alucinacion en dominios especializados: las formas reconstruidas de PIE son hipotesis academicas y el modelo puede generar raices o correspondencias plausibles pero incorrectas; toda salida requiere validacion por un especialista.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta justificar su uso en produccion frente a alternativas generalistas.
- Licencia NVIDIA Nemotron Open Model License: no es una licencia de codigo abierto estandar; es necesario revisar sus terminos (incluidas posibles restricciones de uso comercial y obligaciones de atribucion) antes de cualquier despliegue.
- Requisitos de hardware muy elevados: incluso las cuantizaciones mas agresivas superan la VRAM de GPU consumer, lo que limita su uso a infraestructura profesional.
- Cuantizaciones disponibles limitadas: solo Q2_K, Q4_K_S y Q8_0; no hay cuantizaciones ponderadas/imatrix en el momento de la publicacion, y la Q2_K puede degradar notablemente la calidad en un modelo de este tamano.
- Modelo derivado: esta ficha describe una cuantizacion de terceros (mradermacher); los posibles fallos de conversion deben contrastarse con el modelo base `disinfozone/wekwos-120b-bf16`.
- Fecha de publicacion en el repositorio (25 de noviembre de 2026) y ausencia de descargas o likes: trazabilidad y soporte comunitario practicamente nulos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wekwos-120b-bf16-GGUF
- Modelo base: https://huggingface.co/disinfozone/wekwos-120b-bf16
- Pagina de descargas del autor: https://hf.tst.eu/model#wekwos-120b-bf16-GGUF
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
