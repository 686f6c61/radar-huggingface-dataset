# mradermacher/EryriLabs-cymraeg-4B-GGUF

## Resumen

EryriLabs-cymraeg-4B-GGUF es la distribucion en formato GGUF del modelo EryriLabs-cymraeg-4B, un ajuste fino orientado a conversacion en lengua galesa (cymraeg) e ingles. Lo desarrolla EryriLabs y lo cuantiza mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo parte de una base etiquetada como "gemma4" y se ha adaptado mediante LoRA sobre un conjunto de datos especifico del gales, incluyendo corpus de Techiaith (Bangor), pares de traduccion en-cy y datasets de instrucciones como alpaca-cy.

El problema que resuelve es la escasez de modelos conversacionales de calidad para el gales, un idioma de bajos recursos con poca representacion en los grandes modelos fundacionales. Al ofrecer cuantizaciones desde Q2_K hasta f16, permite desplegar el modelo en hardware de consumo con requisitos de VRAM moderados (a partir de unos 3,3 GB en Q2_K).

El repositorio declara 8.134.102.314 parametros totales en safetensors, un dato que no concuerda con el "4B" del nombre y que conviene verificar antes de planificar el despliegue; el tamano del repo es de 72,8 GB, coherente con incluir todas las cuantizaciones listadas. La licencia es CC-BY-NC-4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como "gemma4" en los tags; ajuste LoRA sobre modelo base) |
| Parametros totales | 8.134.102.314 (dato de safetensors; el nombre indica 4B, discrepancia sin resolver) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | cy (gales), en (ingles) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de los tags, que apuntan a una base "gemma4" con un ajuste LoRA encima. El modelo base es EryriLabs/EryriLabs-cymraeg-4B, y esta version es una conversion estatica a GGUF realizada por mradermacher. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Los datasets declarados incluyen recursos lexicos y de traduccion del gales de Techiaith (lecsicon-cymraeg-bangor, cofnodycynulliad_en-cy, cardiff-university-tm-en-cy, banc-trawsgrifiadau-bangor), el conjunto de instrucciones BangorAI/alpaca-cy-1, y datasets auxiliares de razonamiento y NLI (nyu-mll/multi_nli, openai/gsm8k). Esta combinacion sugiere un entrenamiento orientado a conversacion, traduccion en-cy y tareas de instruccion, con algo de refuerzo en razonamiento y matemeticas basicas. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en gales e ingles.
- Traduccion bidireccional en-cy, apoyada en los corpus de Techiaith incluidos en el entrenamiento.
- Instrucciones y dialogos multi-turno (tag "conversational").
- Razonamiento basico y matematicas elementales (por la inclusion de gsm8k en el dataset).
- Inferencia de lenguaje natural (NLI) por la inclusion de multi_nli.
- Compatible con text-generation-inference y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Atencion al cliente en gales: el modelo puede mantener conversaciones multi-turno en cymraeg, un idioma con poca cobertura en modelos generales, adecuado para administraciones publicas y empresas con obligaciones linguisticas en Gales.
- Traduccion en-cy en produccion: util para localizar documentacion, webs o contenidos hacia el gales, apoyandose en los corpus de traduccion del entrenamiento.
- Asistentes educativos en gales: generacion de explicaciones y material didactico para escuelas y universidades galesas donde se requiere contenido nativo en cymraeg.
- Procesamiento de transcripciones: el dataset banc-trawsgrifiadau-bangor sugiere utilidad en tareas relacionadas con transcripciones y corpus orales, como resumen o normalizacion de texto.
- Prototipado en hardware de consumo: con cuantizaciones Q4_K_S (4,9 GB) o Q4_K_M (5,1 GB) puede ejecutarse en GPUs de gama media o incluso en CPU via llama.cpp, lo que facilita pruebas de concepto.
- Investigacion en NLP de bajos recursos: base para experimentos de evaluacion y ajuste en gales, dado el escaso numero de modelos conversacionales disponibles en este idioma.
- Clasificacion y analisis de texto en gales: aprovechando el entrenamiento en NLI para tareas de inferencia y comprension textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~3,3 GB; Q3_K_S ~3,9 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~5,9 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,4 GB.
- Cabe en GPUs de consumo: si, en la mayoria de cuantizaciones. Q4_K_M encaja en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070); Q8_0 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070); f16 requiere 24 GB (RTX 3090, RTX 4090).
- GPUs profesionales: A100, H100 o L40S para despliegues con f16 y mayor concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags) y cualquier runtime compatible con GGUF. Para cuantizaciones ponderadas/imatrix existe el repo mradermacher/EryriLabs-cymraeg-4B-i1-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-GGUF | 8,13 B (safetensors) | no disponible | cy, en | CC-BY-NC-4.0 | GGUF |
| Modelos base Gemma de Google (familia) | no disponible | no disponible | multilingue | licencia Gemma | safetensors, GGUF |
| Modelos generales de ~7-8B (p. ej. Llama, Mistral) | ~7-8 B | 8k-32k tipico | multilingue | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad. La ventaja diferencial de este modelo es su especializacion en gales, frente a la cobertura marginal de ese idioma en los modelos generales.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del titular.
- Discrepancia entre el nombre ("4B") y los parametros reales en safetensors (8,13 B); verificar antes de dimensionar el hardware.
- No se documenta la longitud de contexto, lo que impide garantizar conversaciones largas; conviene probar el limite real.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en un idioma de bajos recursos con menos datos de entrenamiento.
- Cobertura limitada a gales e ingles; no se garantiza calidad en otros idiomas.
- Posibles sesgos derivados de los corpus de entrenamiento (textos administrativos y academicos de Gales), con escasa representacion de registros coloquiales o dialectos.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad; para produccion se recomienda Q4_K_M o superior.
- El modelo base y la conversion GGUF no incluyen garantias de soporte; el autor de la cuantizacion no es el autor del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EryriLabs-cymraeg-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
