# OVHaiLLM/Olala-v1.0-mini-7A1B

## Resumen
Olala-v1.0-mini-7A1B es un modelo de lenguaje de tipo chat y razonamiento desarrollado por OVHai LLM (grupo OVHcloud) en Francia. Se presenta como un modelo pequeno, eficiente y orientado a instrucciones y uso de herramientas, construido sobre una arquitectura hibrida Mamba-3/attention con mezcla de expertos (MoE). Con 6.773 millones de parametros totales y aproximadamente 1.000 millones de parametros activos por token, el modelo esta disenado para ejecutarse en hardware modesto, incluso en un portatil, segun el autor.

El modelo ha sido entrenado sobre 12.800 millones de tokens (12,8T) de conjuntos de datos publicos y datos sinteticos propios, en tres supercomputadores europeos (JUPITER, Jean Zay y MeluXina), y se distribuye con pesos abiertos bajo licencia Apache 2.0. Forma parte de una familia que incluye un modelo base, un checkpoint SFT y este modelo post-entrenado final, ademas de dos modelos especializados.

Su relevancia actual radica en la combinacion de eficiencia (solo 7 de sus 36 capas mantienen cache KV), capacidades de razonamiento con cuatro niveles de esfuerzo y entrenamiento con aprendizaje por refuerzo para llamadas a herramientas y busqueda multi-turno. Es una propuesta europea de modelo abierto que compite en la categoria de modelos pequenos con capacidades agenticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-3 / attention con mezcla de expertos (MoE) |
| Parametros totales | 6.773.124.144 (~6,77B) |
| Parametros activos | ~1B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento
La arquitectura es hibrida: combina capas Mamba-3 con capas de atencion en un esquema de mezcla de expertos. De las 36 capas totales, solo 7 mantienen cache KV, lo que reduce drasticamente el coste de memoria en inferencia con contextos largos. El modelo cuenta con 6.773 millones de parametros totales pero activa aproximadamente 1.000 millones por token, lo que explica su bajo coste computacional en comparacion con modelos densos del mismo tamano.

El entrenamiento se realizo en tres fases sobre 12,8T tokens: pre-entrenamiento, annealing, SFT y RL. Los datos provienen de conjuntos publicos y de datos sinteticos generados internamente. Se utilizo aprendizaje por refuerzo para entrenar el razonamiento, la llamada a herramientas y la busqueda multi-turno. El entrenamiento se llevo a cabo en 1.024 GPU NVIDIA GH200 en JUPITER (Alemania), GPU NVIDIA H100 en Jean Zay (Francia) y en MeluXina (Luxemburgo), con un consumo estimado de unos 1,16 GWh y emisiones de aproximadamente 40 toneladas de CO2 equivalente (rango 30-50 t, suministro renovable). Una innovacion destacable es el modo de razonamiento con cuatro niveles de esfuerzo configurables.

## Capacidades
- Generacion de texto conversacional y seguimiento de instrucciones.
- Razonamiento explicito con modo "thinking" y cuatro niveles de esfuerzo de razonamiento configurables.
- Llamada a herramientas (tool calling / function calling) entrenada mediante RL.
- Razonamiento agentico multi-paso y busqueda multi-turno.
- Capacidades multilingues en 37 idiomas, incluyendo espanol, ingles, chino, frances, aleman, arabe, japones, coreano, hindi (no listado explicitamente pero presente en la familia de idiomas), entre otros.
- Capacidades de codigo y matematicas (implicitas en el entrenamiento de razonamiento, sin datos de benchmark disponibles).
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un coste de memoria reducido gracias a que solo 7 de 36 capas mantienen cache KV, lo que permite contextos largos en hardware modesto.
- Agentes de busqueda multi-turno: entrenado con RL para llamar herramientas y buscar en multiples pasos, es adecuado para asistentes que consultan APIs externas de forma iterativa.
- Despliegue en portatil o estaciones de trabajo sin GPU dedicada: con ~1B parametros activos y 6,77B totales, puede ejecutarse en hardware de consumo, segun el autor.
- Generacion de codigo asistida: soporta tool calling y puede integrarse en pipelines de desarrollo para autocompletado, explicacion de codigo o generacion de tests, aunque no hay benchmarks publicados de HumanEval.
- Razonamiento con coste controlado: los cuatro niveles de esfuerzo permiten ajustar la latencia y el consumo segun la complejidad de la tarea, util en entornos con restricciones de tiempo.
- Procesamiento multilingue en Europa: con soporte para 37 idiomas, incluidos los principales idiomas europeos, es adecuado para aplicaciones de traduccion, resumen o clasificacion en contextos multilingues.
- Prototipado rapido de agentes: al ser un modelo abierto Apache 2.0 y ligero, sirve para experimentar con arquitecturas agenticas sin grandes inversiones en infraestructura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; con 6,77B parametros totales, en FP16 requeriria aproximadamente 13,5 GB, y en cuantizacion de 4 bits alrededor de 3,5-4 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: el autor indica que se ejecuta en un portatil; el entrenamiento uso NVIDIA GH200 y H100.
- Cabe en GPU de consumo: si, segun el autor ("runs on a laptop"), aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers con custom_code; no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. Se puede senalar que compite en la categoria de modelos pequenos con capacidades agenticas, pero no se dispone de cifras para comparar con alternativas como Llama 3.2 3B, Qwen2.5 7B o Mistral 7B. No disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; no se cuantifica.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; aunque soporta 37 idiomas, el rendimiento relativo por idioma no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los datos de entrenamiento (no detallados).
- Caveats para produccion: el modelo requiere `custom_code` en transformers, lo que puede complicar el despliegue en frameworks estandar; no hay benchmarks publicados que permitan evaluar su calidad frente a alternativas; el numero de descargas (87) y likes (0) sugiere una adopcion muy temprana.
- El modelo tiene una unica version (v1.0) y fue creado en octubre de 2026, por lo que su ecosistema y soporte son limitados.

## Enlaces
- Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base (pre-entrenamiento): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Checkpoint SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Informe tecnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- AI Endpoints (OVHcloud): https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/#try-our-models
