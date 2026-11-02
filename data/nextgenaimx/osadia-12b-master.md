# nextgenaimx/osadia-12b-master

## Resumen

OSADÍA 12B Master Teacher es un modelo de lenguaje denso de 12.000 millones de parametros desarrollado por Next Gen AI Mexico (NextGenAiMX), presentado como la pieza central de una familia de modelos de IA "soberana" orientada a contenido linguistico, legal, constitucional y economico de Mexico y Latinoamerica. Segun su model card, se entrena desde inicializacion nativa (no es un fine-tuning de un modelo existente) sobre la arquitectura propietaria "Native OSADIA Axiom Architecture" recogida en un fichero `osadia_core.py`.

El modelo se posiciona como "master teacher" o fuente de destilacion para el resto de la familia: su proposito declarado es servir de backbone de razonamiento denso de alta capacidad del que derivar versiones mas pequenas. Declara una ventana de contexto de 65.536 tokens, un vocabulario del mismo tamano y soporte para espanol e ingles.

La relevancia practica de esta ficha es limitada: el repositorio no publica pesos en formatos estandar (safetensors o GGUF), la model card marca `inference: false`, el checkpoint referenciado es un `.pt` de PyTorch de 22 GB en BF16 y los resultados de benchmarks declarados (100 % en MMLU, ARC, GSM8K y HellaSwag) no son verificables ni plausibles con la informacion disponible. Esta ficha recoge los datos declarados por el autor y senala explicitamente que no han podido contrastarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Native OSADIA Axiom Architecture (transformer denso con GQA, segun datos declarados) |
| Parametros totales | 12.000.000.000 (12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (solo se referencia checkpoint BF16) |
| Idiomas soportados | espanol (es), ingles (en) |
| Licencia | sovereign-open-community-license-1.0 (SOCL-1.0), etiquetada como "other" en HuggingFace |
| Formato de pesos | PyTorch `.pt` (checkpoint `sovereign_12b_step_50000.pt`, 22 GB en BF16); no se publican safetensors ni GGUF |

Otros datos declarados en la model card: dimension oculta de 5.120, 40 capas, 40 cabezas de atencion query y 8 cabezas key/value (GQA), tamano de FFN intermedio de 16.384 y vocabulario de 65.536 tokens.

## Arquitectura y entrenamiento

La model card describe una arquitectura transformer densa propia denominada "Native OSADIA Axiom Architecture", implementada en un fichero `osadia_core.py`, con atencion de tipo grouped-query (40 cabezas query y 8 key/value). El modelo se presenta como entrenado "from ground-up initialization", es decir, sin partir de pesos de otro modelo, y su modelo base declarado en HuggingFace es `native-osadia-ground-up`.

El dataset de entrenamiento referenciado es `NextGenAiMX/The-Data-Factory-Cleanroom-Corpus`, descrito como corpus con datos linguisticos, legales, constitucionales y economicos de Mexico y Latinoamerica. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). El checkpoint publicado corresponde al paso 50.000 de entrenamiento segun su nombre de fichero.

## Capacidades

- Generacion de texto en espanol e ingles, con enfasis declarado en registro legal, constitucional y economico mexicano y latinoamericano.
- Razonamiento denso orientado a servir de "master teacher" para destilacion hacia modelos mas pequenos de la familia OSADIA.
- Ventana de contexto de 65.536 tokens, adecuada para documentos legales o contractuales extensos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos legales y constitucionales mexicanos: con 65.536 tokens de contexto puede procesar contratos, amparos o articulados completos en una sola pasada, y su entrenamiento declarado sobre corpus legal lo hace teoricamente adecuado para resumen y extraccion de clausulas.
- Destilacion hacia modelos mas pequenos: su rol declarado como "master teacher" permite generar trazas de razonamiento y respuestas de alta calidad para entrenar modelos derivados de menor tamano dentro de la familia OSADIA.
- Asistencia en redaccion administrativa y regulatoria: generacion de borradores de escritos, oficios y documentos normativos en espanol de Mexico con terminologia juridica consistente.
- Investigacion linguistica sobre espanol de Mexico: analisis de variacion dialectal y registro formal usando el vocabulario y corpus declarados.
- Generacion de material educativo civico y constitucional: explicaciones y resumenes de normativa para portales publicos o materiales docentes.
- Base para evaluaciones comparativas de IA "soberana": servir de referencia en estudios sobre modelos entrenados con datos nacionales frente a modelos genericos multilingues.

Advertencia: dado que el repositorio no publica pesos en formatos desplegables ni habilita inferencia (`inference: false`), estos casos de uso son teoricos hasta que el autor libere artefactos utilizables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, comparados con Mistral NeMo 12B como referencia:

| Benchmark | OSADIA 12B Master (declarado) | Mistral NeMo 12B (referencia del autor) |
|---|---|---|
| MMLU | 100,0 % | 68,4 % |
| ARC Challenge | 100,0 % | 62,0 % |
| GSM8K | 100,0 % | 64,2 % |
| HellaSwag | 100,0 % | 82,5 % |
| Sovereign Legal / SAT MX | 100,0 % | no disponible |

Estos valores no han podido verificarse: una puntuacion perfecta simultanea en MMLU, ARC, GSM8K y HellaSwag no es consistente con el estado del arte publicado para modelos de 12B y no se acompana de metodologia, prompts ni scripts de evaluacion. Deben tratarse como no validados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos (12B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 32-48 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: unos 12-13 GB; en 4 bits: unos 7-8 GB (estimaciones teoricas, ya que el autor no publica pesos cuantizados).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S; para cuantizacion 4/8 bits: RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: si se generan cuantizaciones GGUF, cabria en RTX 4090/3090 en 4-8 bits; en BF16 no cabe en GPUs de 24 GB con contexto largo.
- Opciones de despliegue: el checkpoint es un `.pt` de PyTorch sin integracion documentada con vLLM, llama.cpp, Ollama o TGI; seria necesario convertir a safetensors y adaptar la arquitectura `osadia_core.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| OSADIA 12B Master Teacher | 12B | 65.536 | SOCL-1.0 (other) | Solo `.pt` BF16; inferencia deshabilitada |
| Mistral NeMo 12B | 12B | 128.000 | Apache 2.0 | Safetensors, GGUF, amplio soporte |
| Gemma 2 9B | 9B | 8.192 | Gemma Terms | Safetensors, GGUF, vLLM, Ollama |
| Qwen2.5 14B | 14B | 32.768 (128K en variantes) | Apache 2.0 (mayoria de variantes) | Safetensors, GGUF, AWQ, GPTQ |

La comparativa se limita a datos publicos de los modelos alternativos; para OSADIA no hay resultados de benchmarks verificables ni artefactos desplegables que permitan una comparacion empirica.

## Limitaciones y advertencias

- Los benchmarks declarados (100 % en MMLU, ARC, GSM8K, HellaSwag) no son verificables y resultan implausibles; no deben usarse para decisiones tecnicas.
- El repositorio no publica pesos en safetensors ni GGUF, y la model card marca `inference: false`; no es desplegable con las herramientas estandar (vLLM, llama.cpp, TGI, Ollama) sin trabajo de conversion y adaptacion.
- La arquitectura es propietaria (`osadia_core.py`) y no se documenta su implementacion; el riesgo de incompatibilidad con el ecosistema es alto.
- La licencia SOCL-1.0 impone clausulas obligatorias de atribucion en forks, destilaciones y reconstrucciones (nombre del modelo, arquitecto y repositorio oficial); conviene revisar `LICENSE.md` antes de cualquier uso comercial.
- Solo se declaran espanol e ingles; no hay evidencia de cobertura multilingue amplia.
- No se documentan sesgos, filtros de seguridad, datos de RLHF ni evaluaciones de alucinacion; el riesgo de alucinacion en dominios legales es especialmente relevante.
- El modelo se presenta con enfasis en datos mexicanos y latinoamericanos, lo que puede reducir su rendimiento en otros registros o variantes dialectales no representadas.
- La fecha de creacion del repositorio (noviembre de 2026) y la ausencia de descargas o likes indican un lanzamiento sin validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nextgenaimx/osadia-12b-master
- Repositorio oficial declarado: https://github.com/NextGenAiMX/osadia-ai
- Dataset declarado: https://huggingface.co/datasets/NextGenAiMX/The-Data-Factory-Cleanroom-Corpus
- Licencia SOCL-1.0: `LICENSE.md` en el repositorio de HuggingFace (no se proporciona URL directa)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
