# IMF2000/zytturm-8b

## Resumen
Zytturm es un modelo de lenguaje de 8.190.735.360 parametros, publicado por el usuario IMF2000, especializado mediante ajuste supervisado en seguridad de activos digitales: custodia, seguridad de contratos inteligentes, migracion post-cuantica, evaluacion de proveedores terceros y analisis de incidentes. Parte de NVIDIA Nemotron-Cascade-8B-Thinking, que a su vez es un derivado post-entrenado de Qwen3-8B, por lo que hereda la arquitectura densa de este ultimo y anade una capa de ajuste de dominio.

El objetivo declarado no es superar a los modelos frontera en capacidad bruta, sino ofrecer una alternativa desplegable en local, sin salida de datos a APIs de terceros, telemetria ni dependencia de proveedor. Esta pensado para entornos regulados o aislados (air-gapped) donde los requisitos de residencia de datos, auditoria y soberania impiden enrutar cada consulta a un servicio en la nube.

La relevancia actual del modelo reside en su nicho: un 8B ajustado con QLoRA (rango 32) sobre un corpus de aproximadamente 15.000 ejemplos de seguridad, con evaluacion propia frente a un modelo frontera y a su modelo base sin ajustar. Su principal aportacion medible es el formato y la coherencia de las respuestas en el registro profesional del sector, no la transferencia de conocimiento tecnico.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3-8B, post-entrenada por NVIDIA en Nemotron-Cascade RL) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiqueta declarada); niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors y GGUF (el repositorio ocupa 5,0 GB, lo que apunta a que los pesos publicados son cuantizaciones) |
| Modelo base | nvidia/Nemotron-Cascade-8B-Thinking |
| Tamano del repositorio | 5,0 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-8B, un transformer denso, sobre el que NVIDIA aplico su pipeline de post-entrenamiento Nemotron-Cascade RL para producir Nemotron-Cascade-8B-Thinking. Zytturm anade una tercera capa: un ajuste supervisado de dominio mediante QLoRA con rango 32 sobre aproximadamente 15.000 ejemplos. La model card no detalla numero de tokens de entrenamiento, composicion exacta del dataset ni si el fine-tune incluyo etapas adicionales de RLHF o DPO.

El corpus se construyo a partir de tres fuentes. Primero, seis datasets publicos de seguridad con licencias permisivas (MIT, Apache-2.0, CC-BY-4.0) que cubren vulnerabilidades de contratos inteligentes, analisis de ataques on-chain, criptografia post-cuantica, formacion de analistas SOC y ciberdefensa general. Segundo, ejemplos generados sinteticamente via la API de DeepSeek, concentrados en requisitos sin dataset publico adecuado (mapeo de cumplimiento, razonamiento sobre incidentes, evaluacion de proveedores y estrategia de migracion post-cuantica); los ejemplos de vulnerabilidades en contratos se validaron programaticamente, rechazando el codigo generado salvo que contuviera la vulnerabilidad declarada y la respuesta referenciara la linea vulnerable concreta. Tercero, curacion y revision humana: todo el corpus se normalizo a formato ShareGPT, una muestra aleatoria estratificada se reviso manualmente (marcando ejemplos como buenos, malos o pendientes) y se rebalanceo por categorias de requisitos, con sobremuestreo de las categorias escasas y submuestreo de las fuentes mas voluminosas.

## Capacidades
- Generacion de texto y razonamiento general en ingles, heredado de Nemotron-Cascade-8B-Thinking.
- Analisis de seguridad de contratos inteligentes: deteccion y explicacion de vulnerabilidades (categorias SC-01 y SC-02 de su evaluacion interna, con puntuaciones de 3,75 a 4,42).
- Razonamiento sobre incidentes de seguridad y controles asociados (categorias LL-04 y LL-06, 4,00 a 4,25).
- Seguridad de infraestructura off-chain y puentes entre cadenas (categorias LL-09 y LL-10, 4,17 a 4,75).
- Evaluacion de clausulas contractuales de proveedores terceros (categoria TP-06, 4,50).
- Fundamentos de criptografia post-cuantica (categoria PQ-02, 4,50).
- Mapeo de cumplimiento normativo, con cobertura especifica de DORA (categoria CR-06, 4,12).
- Respuestas estructuradas y orientadas a la accion, con un registro propio de un profesional de seguridad (dimension de estructura y claridad con 4,14 en su evaluacion, por encima de la referencia frontera).
- Despliegue local sin red, sin telemetria y sin dependencia de proveedor, apto para entornos air-gapped.
- Compatibilidad declarada con endpoints conversacionales (etiqueta endpoints_compatible) y distribucion en GGUF para Ollama.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito, mas alla de la capacidad de razonamiento heredada del base.

## Casos de uso
- Auditoria de contratos inteligentes en preproduccion: el modelo revisa contratos y senala vulnerabilidades concretas referenciando la linea afectada, adecuado como primera pasada automatica antes de una auditoria humana, dado que su dominio mas fuerte es la deteccion de vulnerabilidades (SC-01, SC-02).
- Analisis post-mortem de incidentes on-chain: a partir del relato de un exploit, estructura causas, controles fallidos y recomendaciones, apoyandose en las categorias de razonamiento sobre incidentes donde obtiene 4,00 a 4,25 y en su ventaja en estructura y claridad.
- Revision de seguridad de infraestructura off-chain y puentes: analisis de custodios, orquestadores y contratos de puente, su categoria con mejores puntuaciones (4,17 a 4,75).
- Evaluacion de proveedores terceros: examen de clausulas contractuales de seguridad, auditoria y notificacion de brechas, su requisito con mejor resultado individual (TP-06, 4,50).
- Planificacion de migracion post-cuantica: explicacion de fundamentos, inventario de primitivas criptograficas afectadas y estrategia de transicion, sobre una base de 4,50 en la categoria PQ-02.
- Preparacion de cumplimiento DORA: mapeo de requisitos regulatorios a controles tecnicos internos, con 4,12 en la categoria CR-06 y sin necesidad de enviar informacion sensible a una API externa.
- Triaje y formacion de analistas SOC: asistente local para clasificar alertas, redactar resumenes de incidentes y servir de apoyo formativo en equipos de seguridad de activos digitales.
- Revisions de politica de custodia en entornos aislados: bancos, custodios o fondos que operan en redes sin salida a internet pueden usar el modelo en local para revisar procedimientos de custodia sin exponer documentacion confidencial.
- Generacion de informes de seguridad: redaccion de hallazgos con formato escaneable y accionable, aprovechando la dimension de estructura, la mas destacada del modelo frente a la referencia frontera.

## Benchmarks y rendimiento
La model card reporta una evaluacion propia sobre un conjunto de test reservado de 93 preguntas de dominio, distribuidas en 42 requisitos, puntuadas por tres jueces LLM independientes (DeepSeek V4, Gemini 3.1 Flash-Lite, Gemini 3.8 Flash). Escala de 1 a 5 por criterio, promediada sobre cuatro dimensiones: exactitud tecnica, cobertura de puntos esperados, estructura y seguridad. No son benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K), por lo que no son comparables con otras tablas publicas.

Rendimiento global segun la model card:

| Modelo | Tamano | Despliegue | Puntuacion media |
|---|---:|---|---:|
| DeepSeek V4 | ~600B | API en la nube | 3,73 |
| Zytturm | 8B | Local | 3,51 |
| Nemotron base (sin ajustar) | 8B | Local | 2,68 |
| Qwen2.5-7B (par general) | 7B | Local | 2,37 |

Desglose por dimension:

| Dimension | DeepSeek V4 | Zytturm | Nota del autor |
|---|---:|---:|---|
| Exactitud tecnica | 3,97 | 2,91 | Ventaja de conocimiento del modelo frontera |
| Cobertura de puntos esperados | 3,00 | 2,69 | |
| Estructura y claridad | 3,06 | 4,14 | Ventaja del ajuste fino |
| Seguridad (evitar errores comunes) | 4,90 | 4,29 | |

Rendimiento por dominio (media de las cuatro dimensiones):

| Dominio | Requisitos | Zytturm |
|---|---|---:|
| Infraestructura off-chain y puentes | LL-09, LL-10 | 4,17–4,75 |
| Deteccion de vulnerabilidades en contratos inteligentes | SC-01, SC-02 | 3,75–4,42 |
| Clausulas contractuales de proveedores | TP-06 | 4,50 |
| Razonamiento sobre incidentes y controles | LL-04, LL-06 | 4,00–4,25 |
| Fundamentos post-cuanticos | PQ-02 | 4,50 |
| Cumplimiento (DORA) | CR-06 | 4,12 |

El autor indica que el orden de clasificacion se mantiene estable entre los tres jueces, con una variacion absoluta de aproximadamente 0,5 puntos segun la severidad del juez. No hay resultados de benchmarks publicos estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en BF16/FP16: en torno a 16,4 GB solo de pesos, mas cache KV y overhead, lo que situa el total practico en 18–20 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8,2 GB de pesos, con un total practico de 10–12 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4,5–5 GB de pesos, con un total practico de 6–8 GB.
- GPU profesionales: A100 40 GB u 80 GB, H100 y A10G son suficientes incluso en precision completa. No se especifican GPU validadas por el autor.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en precision completa; en 4 bits es viable en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y tarjetas de 8 GB con margen ajustado.
- Apple Silicon: un equipo con 16 GB de memoria unificada o mas deberia poder ejecutar cuantizaciones de 4 bits.
- Opciones de despliegue: Ollama (etiqueta declarada en el modelo), llama.cpp y otros runtimes GGUF, vLLM o TGI si se sirven los pesos safetensors, y endpoints compatibles con la API de OpenAI segun la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: el repositorio ocupa 5,0 GB, coherente con la publicacion de cuantizaciones GGUF en lugar de pesos completos; conviene verificar los archivos disponibles antes de planificar el despliegue.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento en la eval del autor | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Zytturm | 8,19B | no disponible | 3,51 (media global); 4,14 en estructura | nvidia-open-model-license | HuggingFace, GGUF y Ollama |
| Nemotron-Cascade-8B-Thinking (base sin ajustar) | 8B (clase) | no disponible | 2,68 (media global) | nvidia-open-model-license | HuggingFace |
| Qwen2.5-7B (par general) | 7B (clase) | no disponible | 2,37 (media global) | Apache-2.0 (segun el modelo original) | HuggingFace |
| DeepSeek V4 (referencia frontera) | ~600B | no disponible | 3,73 (media global); 3,97 en exactitud tecnica | no disponible | API en la nube |

La comparacion se limita al conjunto de evaluacion propio del autor, de 93 preguntas y 42 requisitos, puntuado por jueces LLM. No hay datos de benchmarks estandar que permitan situar a Zytturm frente a otros modelos de 7B-8B de uso general en tareas fuera del dominio de seguridad. Tampoco se dispone de la ficha tecnica del base Nemotron-Cascade-8B-Thinking ni de DeepSeek V4 en la informacion proporcionada.

## Limitaciones y advertencias
- Exactitud tecnica acotada: 2,91 frente a 3,97 del modelo frontera de referencia en la dimension de exactitud. El autor reconoce explicitamente que la precision tecnica sigue limitada por el modelo base de 8B y que la aportacion principal del ajuste es de formato, no de conocimiento.
- Evaluacion no independiente: los resultados proceden de la propia model card, sobre 93 preguntas, y las puntuaciones las asignan jueces LLM, con una variacion de aproximadamente 0,5 puntos segun la severidad del juez. No hay verificacion por terceros ni benchmarks estandar reproducibles.
- Riesgo de alucinacion en un dominio critico: no se documentan tasas de alucinacion ni mecanismos de verificacion. En seguridad de activos digitales, un error no detectado puede tener consecuencias financieras directas; las respuestas deben tratarse como borradores sujetos a revision humana experta.
- Sesgos del corpus: parte del material se genero sinteticamente con la API de DeepSeek, lo que puede introducir sesgos y patrones estilisticos del modelo generador. El propio autor senala una validacion programatica solo para los ejemplos de vulnerabilidades en contratos, no para el resto de categorias.
- Idioma unico: solo ingles declarado. No hay soporte multilingue documentado, lo que limita su uso directo en equipos hispanohablantes sin traduccion intermedia.
- Contexto desconocido: la longitud de contexto no se especifica en la model card, un dato critico para casos de uso con documentos largos, analisis de multiples contratos o historiales de incidentes extensos.
- Licencia restrictiva: nvidia-open-model-license no es una licencia de codigo abierto aprobada por la OSI. Antes de un uso comercial o de redistribuir el modelo o sus derivados, hay que revisar el texto completo de la licencia enlazado por el autor, ya que impone condiciones de atribucion y avisos.
- Herencia del modelo base: al ser un derivado de Nemotron-Cascade-8B-Thinking, las condiciones y avisos del modelo base y de su linaje (Qwen3-8B) se propagan al modelo ajustado.
- Adopcion practica nula: 0 descargas y 1 like en el momento de la consulta, sin issues publicos ni validacion de la comunidad. No hay garantia de mantenimiento, soporte ni actualizaciones.
- Alcance funcional limitado: no hay evidencia de tool calling, function calling, uso como agente multi-paso, vision, audio ni modo de razonamiento explicito, capacidades que pueden ser necesarias en pipelines de automatizacion de seguridad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/IMF2000/zytturm-8b
- Modelo base: https://huggingface.co/nvidia/Nemotron-Cascade-8B-Thinking
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo, su paper, blog, repositorio o demo. Las busquedas devolvieron unicamente paginas de cadenas de pizzeria sin relacion con el modelo.
