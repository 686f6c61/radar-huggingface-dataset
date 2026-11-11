# hsilvosa/feishengmt

## Resumen

feishengmt es un modelo de traducción automática especializado en narrativa wuxia y xianxia, desarrollado por el usuario hsilvosa como un ajuste fino (fine-tune) del modelo base tencent/Hy-MT2-1.8B. Su propósito principal es traducir texto chino a inglés preservando las convenciones del género: terminología de cultivación, honoríficos (Senior/Junior Brother), nombres recurrentes y, de forma destacada, la gestión autónoma de comillas y párrafos. El modelo incorpora además una segunda etapa de adaptación que le permite responder en francés, portugués, español, indonesio, japonés y coreano cuando se le solicita.

Con 1.791.080.448 parámetros y una arquitectura densa Hunyuan v1 (hunyuan_v1_dense), el modelo se distribuye bajo licencia Apache 2.0 en formato safetensors, con variantes GGUF (1,1 GB) y ONNX/WebGPU para navegador. El repositorio incluye un pipeline propio que segmenta el texto en ventanas de párrafos completos de hasta 400 caracteres, inyecta un glosario y verifica la coherencia de párrafos y comillas en la salida, volviendo a traducir en fragmentos menores cuando la comprobación falla.

La relevancia de este modelo radica en su enfoque vertical: en lugar de competir en traducción generalista, resuelve problemas concretos de la traducción de novelas web chinas, como las comillas `「」`, los caracteres tradicionales y las citas que se extienden entre párrafos. Su tamaño contenido (1,8B) permite ejecutarlo en una única GPU de consumo, lo que lo hace accesible para proyectos de traducción editorial o de aficionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el pipeline trabaja con ventanas de hasta 400 caracteres) |
| Tipos de cuantizacion | GGUF (version cuantizada de 1,1 GB); safetensors en bf16 |
| Idiomas soportados | zh, en, fr, pt, es, id, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF; ONNX (WebGPU) |

## Arquitectura y entrenamiento

El modelo parte de tencent/Hy-MT2-1.8B, un transformer denso de la familia Hunyuan v1 con 1,8 mil millones de parámetros. El ajuste se realizó mediante LoRA con r=16 y alpha=32 aplicado a todas las proyecciones de atención y MLP, en precisión bf16 y sobre una única RTX 3060, tras lo cual los pesos LoRA se fusionaron en los pesos finales.

El entrenamiento consta de dos etapas. La primera, centrada en inglés, utilizó aproximadamente 23.000 ejemplos (7,4 millones de tokens) de ventanas de párrafos en chino con su traducción al inglés, provenientes de un corpus chino-inglés de wuxia y xianxia. El lado chino se perturbó aleatoriamente (caracteres tradicionales, comillas `「」`, bordes cortados) mientras el inglés mantenía comillas dobles limpias, de modo que el modelo aprendiera a generar las comillas por sí mismo. Se incluyó un glosario (honoríficos, vocabulario de cultivación, nombres recurrentes) en el prompt durante el entrenamiento, con learning rate 2e-4, una época, 715 pasos y 2 horas 12 minutos de cómputo. La segunda etapa, para los otros seis idiomas, empleó unos 1.000 ejemplos generados por el propio modelo de la etapa 1 a partir de ventanas chinas de entrenamiento, conservados solo si mantenían los mismos párrafos y estaban en el idioma solicitado.

## Capacidades

- Traducción chino-inglés de narrativa wuxia y xianxia con vocabulario y convenciones del género.
- Gestión autónoma de comillas: genera las comillas dobles inglesas a partir de `「」`, de comillas en caracteres tradicionales y de citas que se extienden entre párrafos o que empiezan o terminan a mitad de una cita.
- Traducción por párrafos completos (hasta 400 caracteres por ventana), no por fragmentos cortos.
- Traducción a francés, portugués, español, indonesio, japonés y coreano cuando se solicita explícitamente en el prompt.
- Aceptación del nombre del idioma destino tanto en chino (`英语`, `法语`, etc.) como en inglés (`English`, `French`, etc.).
- Integración con el pipeline incluido en el repositorio para segmentación, glosario y verificación de coherencia.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción editorial de novelas web chinas: el modelo traduce capítulos completos por ventanas de párrafos, manteniendo la estructura de comillas y diálogos, lo que reduce la revisión manual frente a traductores generalistas.
- Localización de fan translations de wuxia y xianxia: el glosario integrado en el pipeline asegura consistencia en honoríficos y términos de cultivación a lo largo de una obra extensa.
- Preprocesado para publicación digital: la verificación de que la salida conserva el mismo número de párrafos y comillas que el original permite automatizar controles de calidad antes de la maquetación.
- Traducción multilingüe de catálogos de novelas: con la segunda etapa, un mismo capítulo puede verterse a español, francés, portugués, indonesio, japonés o coreano enviando un párrafo o ventana corta por petición.
- Despliegue en navegador: la variante ONNX/WebGPU permite ofrecer traducción de capítulos directamente en el cliente sin infraestructura de servidor.
- Prototipado en hardware de consumo: al caber en una RTX 3060 durante el entrenamiento y disponer de GGUF de 1,1 GB, es viable montar un servicio de traducción en una estación de trabajo doméstica.
- Investigación en traducción literaria: sirve como caso de estudio de ajuste fino con LoRA sobre un modelo de traducción pequeño para un dominio muy específico.

## Benchmarks y rendimiento

Los resultados publicados corresponden a una única ejecución con decodificación greedy sobre ventanas de capítulos reservados para evaluación, con referencias humanas y chrF como métrica aproximada.

Traducción chino-inglés (modo pipeline, ventanas):

| Variante de la fuente | Conjunto 1 (30 ventanas) chrF / comillas | Conjunto 2 (40 ventanas) chrF / comillas |
|---|---|---|
| Limpia | 63,0 / 100 % | 47,9 / 97,5 % |
| Comillas `「」` | 62,9 / 100 % | 48,1 / 95 % |
| Cita cortada entre párrafos | 63,8 / 100 % | 48,3 / 96 % |
| Caracteres tradicionales | 63,0 / 100 % | 47,1 / 97,5 % |
| Tradicional y `「」` | 62,9 / 100 % | 47,1 / 95 % |

La versión v0.1 del modelo, con fragmentos de 250 caracteres, obtuvo chrF 44,8 en el conjunto 2 y no reprodujo las comillas de una cita dividida entre párrafos en ninguna ventana (frente al 96 % actual). En una comprobación con extractos de novelas chinas más antiguas, 26 de 38 párrafos con comillas conservaron el mismo número de comillas que el original (19 en v0.1).

Otros idiomas (60 ventanas, sin referencias; se mide idioma de respuesta y similitud LaBSE frente al modelo base):

| Idioma | Respuesta en el idioma pedido (nombre en chino) | Nombre en inglés (20 ventanas) |
|---|---|---|
| Francés | 98 % | 100 % |
| Portugués | 97 % | 95 % |
| Español | 97 % | 100 % |
| Indonesio | 97 % | 100 % |
| Japonés | 98 % | 85 % |
| Coreano | 100 % | 100 % |

Antes de la segunda etapa, las cifras eran del 48 al 92 % con el nombre en chino y del 0 al 20 % con el nombre en inglés. La similitud LaBSE es equivalente a la del modelo base (diferencias de -0,02 a +0,01). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,6 GB solo para pesos, más overhead de activaciones y contexto; no se proporciona una cifra oficial.
- VRAM estimada con la cuantización GGUF de 1,1 GB: aproximadamente 1,5-2 GB en total, según la ventana de contexto.
- GPU recomendadas: RTX 3060 (utilizada para el entrenamiento LoRA), RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, tanto en bf16 como en la variante GGUF.
- Opciones de despliegue: transformers (>=5.6) con el pipeline incluido, llama.cpp/Ollama para la variante GGUF, y ONNX Runtime WebGPU para navegador. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| feishengmt | 1,79B | no disponible | 8 | Apache 2.0 | Traducción wuxia/xianxia zh→en y multilingüe |
| tencent/Hy-MT2-1.8B (base) | 1,8B | no disponible | no disponible | no disponible | Traducción generalista |
| Modelos de traducción generalistas de tamaño similar | no disponible | no disponible | no disponible | no disponible | Traducción general |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el único punto de referencia documentado es el propio modelo base y la versión v0.1 del mismo proyecto.

## Limitaciones y advertencias

- El pipeline incluido solo está adaptado al inglés: sus comprobaciones de comillas siguen convenciones inglesas y su glosario es inglés. Para los otros idiomas hay que enviar un párrafo o ventana corta y verificar manualmente el resultado.
- El modelo está construido principalmente para inglés; el rendimiento en los otros seis idiomas es secundario y se midió sin referencias humanas, solo con similitud LaBSE e idioma de respuesta.
- chrF es una guía aproximada: las referencias humanas siguen sus propias convenciones, por lo que las cifras no reflejan calidad editorial absoluta.
- Riesgo de alucinación y de deriva semántica en pasajes largos o con terminología poco frecuente; el pipeline mitiga parte del problema con la verificación de párrafos y comillas, pero no garantiza fidelidad de contenido.
- En la comprobación con novelas antiguas, 12 de 38 párrafos con comillas no coincidieron, en su mayoría por erratas en la fuente y por títulos de libros entre `《》`.
- Es una versión modificada de Hy-MT2-1.8B y no está respaldada por Tencent.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los corpus de entrenamiento antes de un uso comercial a gran escala.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/feishengmt
- Versión GGUF: https://huggingface.co/hsilvosa/feishengmt-GGUF
- Versión ONNX/WebGPU: https://huggingface.co/hsilvosa/feishengmt-ONNX
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Referencia arXiv citada en los tags: arxiv:2605.22064 (no verificada en la información disponible)
