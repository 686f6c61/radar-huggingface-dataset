# mradermacher/clinical-field-mapper-causal_lm-GGUF

## Resumen

`mradermacher/clinical-field-mapper-causal_lm-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `tsilva/clinical-field-mapper-causal_lm`, un modelo de lenguaje causal de tipo GPT-2 destilado (distilgpt2) especializado en normalizacion de columnas de datos clinicos. Con 120,5 millones de parametros, no es un modelo de proposito general sino una herramienta de dominio muy acotado: mapear nombres de campos heterogeneos de registros medicos a una nomenclatura canonica.

El modelo original lo desarrolla tsilva y esta liberado bajo licencia Apache 2.0. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, con el objetivo de permitir su ejecucion en CPU y en hardware modesto mediante llama.cpp y herramientas compatibles. El repositorio ocupa 1,2 GB e incluye 12 variantes de cuantizacion desde Q2_K hasta f16.

Su relevancia practica es la de un componente de normalizacion dentro de pipelines ETL de datos sanitarios: un modelo pequeno, rapido y desplegable localmente que evita enviar datos de pacientes a APIs externas. No compite en capacidades generales con modelos grandes; su valor esta en la especializacion y en el coste de inferencia casi nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (distilgpt2, destilacion de GPT-2) |
| Parametros totales | 120.511.488 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es una destilacion de GPT-2 (distilgpt2), es decir, un transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal, MoE ni arquitecturas hibridas. La destilacion reduce el numero de capas respecto a GPT-2 original manteniendo el vocabulario de GPT-2, lo que explica los 120,5 millones de parametros y el reducido coste de inferencia.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas del repositorio (`healthcare`, `column-normalization`, `text-generation`, `distilgpt2`) indican que el ajuste se orienta a la tarea de normalizacion de columnas en el ambito sanitario, presumiblemente mediante fine-tuning supervisado sobre pares de nombres de campo y sus formas canonicas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto causal autoregresiva en ingles.
- Normalizacion y mapeo de nombres de columnas de datos clinicos a una forma canonica (tarea principal para la que fue ajustado).
- Generacion de secuencias cortas y estructuradas, adecuada para tareas de transformacion de etiquetas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: limitado a ingles segun la model card.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Normalizacion de cabeceras en pipelines ETL sanitarios: el modelo recibe un nombre de columna ambiguo (por ejemplo, variantes de "fecha de ingreso") y devuelve la etiqueta canonica, integrándose como paso previo a la carga en un data warehouse clinico.
- Mapeo de esquemas entre sistemas de historia clinica electronica: util para reconciliar campos de distintos proveedores antes de una migracion de datos, con inferencia local que evita exponer datos de pacientes a servicios externos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en CPU con cuantizaciones de 0,2 GB, puede correr dentro de la infraestructura del hospital sin conexion a internet.
- Preprocesado de datasets de investigacion clinica: normalizar nombres de variables en ficheros CSV o tablas antes del analisis estadistico, reduciendo trabajo manual de limpieza.
- Prototipado rapido de herramientas de calidad de datos: validar y corregir cabeceras en tiempo casi real gracias al tamano reducido del modelo.
- Componente de bajo coste en pipelines de CI/CD de datos: ejecutable en runners modestos con llama.cpp para pruebas de integridad de esquemas sanitarios.
- Filtrado y etiquetado en lote de grandes volumenes de metadatos clinicos: el throughput alto en CPU permite procesar miles de registros por minuto sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en todas las cuantizaciones; las variantes Q4_K_M y Q8_0 ocupan aproximadamente 0,2 GB en disco.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (incluso integradas) es suficiente. Funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y en Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. La model card remite a las instrucciones de TheBloke para el uso de ficheros GGUF.
- Latencia y throughput: no disponibles de forma oficial; por el tamano (120 M de parametros) se espera una latencia de milisegundos por peticion en CPU y throughput alto en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| clinical-field-mapper-causal_lm (este) | 120,5 M | no disponible | apache-2.0 | GGUF, safetensors |
| distilgpt2 (base de la que deriva) | 82 M | 1024 tokens | apache-2.0 | safetensors, GGUF |
| GPT-2 small | 124 M | 1024 tokens | apache-2.0 | safetensors, GGUF |
| Modelos de normalizacion basados en reglas o embeddings | no aplica | no aplica | variable | variable |

La comparacion con distilgpt2 y GPT-2 small es la mas directa por tamano y arquitectura; este modelo anade el ajuste especifico a la tarea de normalizacion de columnas clinicas, que los modelos genericos no cubren sin fine-tuning adicional. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: fuera de la normalizacion de campos clinicos su calidad como generador de texto general sera limitada.
- Solo ingles; no soporta castellano ni otros idiomas.
- Riesgo de alucinacion en etiquetas: puede generar nombres de columna canonicos inexistentes o incorrectos, por lo que requiere validacion contra un diccionario de referencia.
- No apto para uso clinico directo ni para decisiones medicas; es una herramienta de transformacion de metadatos.
- Posibles sesgos heredados del corpus de entrenamiento del modelo base y del dataset clinico usado en el ajuste, no documentados.
- Longitud de contexto no documentada; asumir contextos cortos (tipico de distilgpt2, 1024 tokens) hasta confirmacion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el tratamiento de datos de salud recae en el integrador (RGPD y normativa sanitaria aplicable).
- La cuantizacion Q3_K_M esta marcada por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/clinical-field-mapper-causal_lm-GGUF
- Modelo base: https://huggingface.co/tsilva/clinical-field-mapper-causal_lm
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/clinical-field-mapper-causal_lm-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#clinical-field-mapper-causal_lm-GGUF
- Instrucciones de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
