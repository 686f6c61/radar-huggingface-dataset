# Kratika-2610/fraud-detector

## Resumen

Kratika-2610/fraud-detector es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado en HuggingFace por el usuario Kratika-2610. Segun la model card, el entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, sobre la base de un transformer decoder-only de 1.500 millones de parametros. El repositorio no documenta el dataset utilizado, el numero de pasos, la composicion de los datos ni ningun proceso de alineacion posterior (RLHF o DPO).

El nombre del repositorio sugiere un proposito de deteccion de fraude, pero la informacion publicada no confirma que se haya entrenado con datos de transacciones, reclamaciones o alertas financieras. De hecho, el ejemplo de uso de la propia model card plantea una pregunta generica sobre viajes en el tiempo, lo que apunta a una plantilla autogenerada por `trl` sin personalizar. El repositorio declarado ocupa 0,0 GB y no se han publicado resultados de evaluacion.

Su relevancia actual es limitada: se trata de un experimento con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin pesos verificables. Resulta util unicamente como referencia de un pipeline SFT con TRL sobre Qwen2.5-1.5B, no como modelo listo para produccion. Cualquier uso en un contexto real de antifraude exigiria validacion propia, datos etiquetados y una revision legal de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct); sin datos propios publicados |
| Parametros totales | 1.500 millones (modelo base); no disponible para el ajuste fino |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en este repositorio; el modelo base dispone de versiones GPTQ-Int4, GPTQ-Int8 y AWQ publicadas por Qwen |
| Idiomas soportados | No disponible; el modelo base declara soporte para mas de 29 idiomas |
| Licencia | No disponible (la model card incluye el marcador de posicion `licence: license`); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (segun los tags del repositorio) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 20 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de 1.500 millones de parametros, 28 capas, atencion con Grouped Query Attention (GQA) de 12 cabezas de consulta y 2 cabezas de clave/valor, con una dimension de cabeza de 128. Sobre esta base se aplico un ajuste supervisado (SFT) con TRL, lo que implica optimizacion sobre pares instruccion-respuesta, presumiblemente con perdida enmascarada sobre los tokens de la respuesta. No se documenta ningun tipo de innovacion tecnica adicional: no hay decodificacion especulativa propia, atencion lineal, mezcla de expertos ni modulos multimodales.

El punto mas debil de la ficha es la ausencia total de informacion sobre el entrenamiento: no se indica el dataset, el numero de ejemplos, la longitud de las secuencias, el numero de epochs, la tasa de aprendizaje, si hubo filtrado de datos ni si se aplico alguna fase de preferencia (DPO, PPO, GRPO). Tampoco se publican curvas de perdida ni evaluaciones. Las unicas versiones de software declaradas son TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base.
- Razonamiento basico y resolucion de instrucciones sencillas, limitado por el tamano de 1,5B parametros.
- Generacion de codigo de complejidad baja a media.
- Aritmetica y problemas matematicos elementales; el modelo base no esta optimizado para calculo simbolico.
- Soporte de plantillas de chat (el ejemplo de la model card usa `pipeline` con lista de mensajes con roles).
- Capacidad declarada de seguir instrucciones en varios idiomas, siempre que se herede del modelo base; no verificada en el ajuste.
- No hay evidencia publicada de soporte de tool calling o function calling especifico en este ajuste, aunque el modelo base lo soporta.
- No hay evidencia publicada de modo de razonamiento extendido (thinking), vision, audio ni agentes multi-paso especificos de este repositorio.

## Casos de uso

Los casos siguientes se plantean segun el proposito que sugiere el nombre del repositorio y las capacidades tipicas de un modelo de 1,5B. Ninguno de ellos esta validado por evaluaciones publicadas del autor, por lo que requeririan una prueba de concepto previa.

- Triaje de alertas de fraude: el modelo podria resumir el historial de una alerta (transacciones, dispositivo, geolocalizacion, patron de gasto) y redactar una nota breve para el analista. La ventana de contexto del modelo base (32.768 tokens) permite incluir decenas de operaciones en una sola peticion.
- Generacion de explicaciones para clientes: a partir de una decision de bloqueo, redactar un texto claro sobre por que se ha retenido una operacion, reduciendo la carga del equipo de soporte.
- Clasificacion asistida por prompt de textos no estructurados: correos de reclamacion, mensajes de disputa o notas de agentes, etiquetados con categorias predefinidas mediante plantillas de instruccion.
- Extraccion de entidades de documentos: parseo de justificantes, facturas o formularios en texto para poblar campos estructurados antes de pasarlos al motor de reglas antifraude.
- Asistente interno de compliance: respuestas sobre procedimientos internos a partir de un contexto inyectado en el prompt (tecnica RAG), con la ventaja de que un 1,5B cuantizado puede ejecutarse en una GPU de gama media.
- Prototipado rapido en investigacion: banco de pruebas para comparar estrategias de SFT con TRL sobre un modelo pequeno antes de escalar a modelos de 7B o superiores.
- Preprocesado en pipelines de datos: normalizacion de descripciones de comercios, categorizacion de conceptos bancarios y limpieza de campos de texto libre a gran escala por su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna tarea especifica de deteccion de fraude, ni metricas de clasificacion como precision, recall, F1 o AUC. Tampoco se comparan resultados contra el modelo base, por lo que no es posible determinar si el ajuste fino mejora o degrada el rendimiento original.

## Requisitos de hardware

Estimaciones basadas en el tamano declarado del modelo base (1.500 millones de parametros); no hay mediciones publicadas para este repositorio concreto.

- Pesos en FP16/BF16: aproximadamente 3,1 GB. Con cache KV y activaciones, entre 4 y 6 GB de VRAM para secuencias cortas.
- Pesos en INT8: aproximadamente 1,6 GB; alrededor de 3 GB de VRAM en uso practico.
- Pesos en 4 bits (GGUF Q4_K_M o AWQ/GPTQ-Int4): aproximadamente 0,9-1,1 GB; cabe en GPUs de 4-6 GB.
- Cache KV estimada: con GQA (2 cabezas KV de 128 dimensiones en 28 capas), unos 28 KB por token en FP16; una secuencia de 32.768 tokens consumiria cerca de 0,9 GB adicionales.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para FP16 o INT8; A100, H100 o L40S solo tienen sentido para servir muchas peticiones concurrentes, no por requisito de memoria.
- Ejecucion en CPU: viable con llama.cpp u Ollama en cuantizacion de 4 bits, con latencias notables pero funcionales para lotes pequenos.
- Opciones de despliegue: transformers con `pipeline` (el metodo documentado en la model card), vLLM o TGI para servicio con batching continuo, llama.cpp/Ollama/LM Studio para entornos locales, y endpoints compatibles con la API de HuggingFace (el repositorio incluye el tag `endpoints_compatible`).
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

Los datos de terceros corresponden a la documentacion publica de cada modelo y deben verificarse en sus fichas originales. El rendimiento no se compara porque no hay evaluaciones publicadas del ajuste fino.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kratika-2610/fraud-detector | 1,5B (base) | No disponible | No disponible | Repositorio de 0,0 GB, 0 descargas, sin pesos verificables |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | Pesos completos, cuantizaciones oficiales GPTQ y AWQ |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Pesos completos, requiere aceptar la licencia |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Pesos completos, acceso sujeto a condiciones |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | Pesos completos y cuantizaciones GGUF |

## Limitaciones y advertencias

- Ausencia de datos de entrenamiento: se desconoce con que corpus se ajusto el modelo, lo que impide auditar sesgos, contaminacion de datos o cumplimiento normativo.
- Sin evaluacion publicada: no hay ninguna metrica que respalde su uso en deteccion de fraude ni en ninguna otra tarea. El nombre del repositorio no constituye evidencia de especializacion.
- Repositorio aparentemente incompleto: el tamano declarado de 0,0 GB no es coherente con los pesos de un modelo de 1,5B en FP16 (unos 3 GB), por lo que es probable que el repositorio no contenga los ficheros completos o que la carga fallida.
- Licencia no disponible: la model card incluye un marcador de posicion (`licence: license`) en lugar de una licencia real. No se puede asumir uso comercial permitido aunque el modelo base sea Apache-2.0.
- Alucinacion: como todo modelo generativo de 1,5B, tiende a inventar datos cuando se le piden hechos concretos, cifras o referencias normativas. Es especialmente peligroso en un contexto financiero.
- Riesgo de sesgo: el modelo base puede reproducir estereotipos presentes en datos web, incluidos sesgos geograficos, de genero o socioeconomicos que afecten a decisiones sobre clientes.
- Limitacion de contexto: aunque el modelo base soporta 32.768 tokens, el autor no documenta la ventana efectiva tras el ajuste ni si se entreno con secuencias largas.
- Idiomas no declarados: no hay confirmacion de que el ajuste conserve el multilingüismo del modelo base; el castellano no esta verificado.
- Uso regulado: aplicar un sistema asi a decisiones de credito, bloqueo de pagos o denegacion de servicios puede quedar dentro del ambito del RGPD, la PSD2, DORA y el Reglamento Europeo de IA (categoria de alto riesgo en varios supuestos). Requiere supervision humana, trazabilidad y evaluacion de impacto.
- Inyeccion de prompt: en escenarios con texto de terceros (correos, reclamaciones), el modelo puede seguir instrucciones maliciosas embebidas en la entrada. Es imprescindible aislar y sanitizar las entradas.
- Coste de mantenimiento nulo pero soporte nulo: al tener 0 descargas y un unico commit, es poco probable que el autor corrija errores o publique actualizaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kratika-2610/fraud-detector
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL (entrenamiento): https://github.com/huggingface/trl
- Cita de TRL: von Werra, L. et al., "TRL: Transformers Reinforcement Learning", licencia Apache-2.0, 2020.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su dataset o su evaluacion. Las fuentes devueltas por la busqueda no guardan relacion con el modelo.
