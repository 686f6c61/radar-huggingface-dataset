# sappho192/ironworks-translator-1b-v0.1

## Resumen

Ironworks Translator 1B v0.1 es un modelo de traduccion especializado en terminologia de Final Fantasy XIV (FFXIV), desarrollado por sappho192 como componente del proyecto IronworksTranslator. Se trata de un ajuste fino mediante LoRA SFT sobre el modelo base xiaomi-research/MiLMMT-46-1B-v1.0, que emplea la arquitectura Gemma 3 y cuenta con aproximadamente 1.000 millones de parametros (999.885.952 exactos). El modelo resuelve un problema muy concreto: la traduccion de texto de videojuego entre coreano, japones, ingles, aleman y frances respetando glosarios de terminologia que cambian con cada parche del juego.

Su caracteristica diferencial es el soporte de glosarios en tiempo de inferencia mediante prefijos `Glossary:` con pares `origen => destino`, lo que permite actualizar la terminologia sin reentrenar el modelo. El ajuste emplea un escalado lineal del delta LoRA con alpha = 0.65 para preservar la fluidez multilingue general del modelo base mientras se gana adherencia estricta al glosario. Se distribuye unicamente en formato GGUF (Q8_0 y Q4_K_M), pensado para inferencia local ligera.

El modelo es relevante para desarrolladores que construyen herramientas de traduccion en tiempo real para comunidades de videojuegos, donde la coherencia terminologica (nombres de habilidades, objetos, clases) es tan importante como la fluidez general, y donde el coste computacional debe mantenerse bajo para ejecucion en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino LoRA SFT |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (1.069.305.088 bytes) y Q4_K_M (806.056.960 bytes) |
| Idiomas soportados | coreano (ko), japones (ja), ingles (en), aleman (de), frances (fr) |
| Licencia | Gemma Terms of Use (`gemma`) |
| Formato de pesos | GGUF (unicamente; no se publican safetensors en el repo) |

## Arquitectura y entrenamiento

El modelo parte de xiaomi-research/MiLMMT-46-1B-v1.0, un modelo multilingue de traduccion de aproximadamente 1B parametros basado en la arquitectura Gemma 3 (transformer decoder-only). Sobre esta base se aplico un ajuste fino supervisado (SFT) con LoRA empleando pares de terminologia y dialogo de FFXIV, chat coloquial, ejemplos de intercambio contrafactual de glosario, rechazo de distractores y replay on-policy de datos generales para mitigar el olvido catastrofico.

Tras el entrenamiento, el delta LoRA se fusiono linealmente con un factor alpha = 0.65, lo que equilibra la adherencia al glosario con la fluidez general heredada del modelo base. El resultado se cuantizo a GGUF en dos variantes. El prompt admite un prefijo opcional `Glossary:` con pares `origen => destino` inyectados en tiempo de inferencia, de modo que la terminologia nueva de cada parche puede incorporarse sin reentrenar. Los parametros de decodificacion recomendados son greedy (temperature = 0.0, top_k = 1, repeat_penalty = 1.0) con frequency_penalty = 0.30 y repeat_last_n = 16, ademas de add_bos_token = false y add_space_prefix = false.

## Capacidades

- Traduccion multilingue entre coreano, japones, ingles, aleman y frances, con foco en pares ja→ko y en el ecosistema FFXIV.
- Seguimiento de glosario en tiempo de inferencia mediante prefijos `Glossary:` con pares `origen => destino`, sin reentrenamiento.
- Control de intercambio contrafactual de glosario: el modelo aplica la terminologia indicada en el prompt en lugar de la aprendida por defecto.
- Rechazo de distractores: no inserta terminos del glosario que no aparecen en el texto de entrada (tasa de falsa insercion 0/25 en la evaluacion del autor).
- Estabilidad en entradas cortas y conversacion coloquial multilingue (0 errores en 30 casos segun el autor).
- Formato conversacional (tag `conversational`) y endpoints compatibles.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion en tiempo real de chat de FFXIV: integrado en IronworksTranslator, traduce lineas de chat japones a coreano (o a otros idiomas soportados) respetando nombres de habilidades, objetos y clases mediante el glosario inyectado en el prompt.
- Actualizacion de terminologia tras cada parche: al publicarse un parche con nuevos terminos, el glosario se actualiza en el prompt sin reentrenar el modelo, lo que reduce el ciclo de mantenimiento a editar un fichero de pares `origen => destino`.
- Herramientas de traduccion para comunidades de jugadores: traduccion de guias, macros y descripciones de objetos entre los cinco idiomas soportados con coherencia terminologica.
- Despliegue en hardware de consumo: la variante Q4_K_M (unos 806 MB) permite ejecucion local en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, adecuado para overlays de traduccion en el cliente del juego.
- Traduccion de dialogos y texto coloquial: el ajuste incluye chat coloquial, lo que lo hace util para traducir conversaciones informales entre jugadores mas alla de la terminologia tecnica.
- Evaluacion de sistemas de glosario condicionado: sirve como referencia para investigar tecnicas de control terminologico en tiempo de inferencia frente a reentrenamiento.
- Pipeline de localizacion asistida: pre-traduccion de cadenas de texto de mods o contenido generado por la comunidad, con revision humana posterior.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (GGUF cuantizado, decodificacion greedy con frequency_penalty = 0.30 y repeat_last_n = 16):

| Metrica | Baseline MiLMMT-46-1B-v1.0 (Q8_0) | ironworks-translator-1b-v0.1 (Q8_0) | ironworks-translator-1b-v0.1 (Q4_K_M) |
|---|---|---|---|
| Precision de terminos FFXIV en hold-out (con glosario) | 4/9 (44,4%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Deriva de idioma / bucles | 1 / 0 | 0 / 0 | 0 / 0 |
| Tasa de falsa insercion de distractores (n=25) | 0/25 (0,0%) | 0/25 (0,0%) | 0/25 (0,0%) |
| Intercambio contrafactual de glosario (8 pares / 16 prompts) | 0/8 (4/16) | 8/8 (16/16) | 6/8 (14/16) |
| Estabilidad multilingue general y entradas cortas (n=30) | 0 errores | 0 errores | 0 errores |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU/COMET) en la informacion disponible; las metricas anteriores son evaluaciones internas del autor sobre tareas especificas del dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q8_0 y unos 0,8 GB con Q4_K_M, mas overhead de contexto y de la libreria de inferencia.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050, RTX 4060) puede ejecutar la variante Q4_K_M; tambien es viable en CPU.
- GPU recomendadas para mayor throughput: RTX 3060/4060 o superiores; A100/H100 no son necesarias dado el tamano del modelo.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| ironworks-translator-1b-v0.1 | ~1B | no disponible | ko, ja, en, de, fr | Gemma | GGUF | Traduccion FFXIV con glosario en inferencia |
| xiaomi-research/MiLMMT-46-1B-v1.0 (base) | ~1B | no disponible | multilingue (46 idiomas segun el nombre) | no disponible en la informacion | safetensors (modelo base) | Traduccion multilingue general |
| NLLB-200-distilled-600M | 600M | 512 tokens | 200 idiomas | CC-BY-NC-4.0 | safetensors, GGUF | Traduccion multilingue general |
| MADLAD-400-3B-MT | 3B | 1024 tokens | 400+ idiomas | Apache 2.0 (segun publicacion) | safetensors | Traduccion multilingue general |

La ventaja diferencial del modelo de sappho192 frente a traductores generales es el control terminologico en tiempo de inferencia; su desventaja es el ambito estrecho de dominio y la ausencia de benchmarks estandar publicados que permitan una comparacion objetiva de calidad de traduccion general.

## Limitaciones y advertencias

- Modelo de dominio especifico: el ajuste esta orientado a FFXIV; su calidad en traduccion general fuera de ese contexto puede degradarse respecto al modelo base, aunque el autor reporta estabilidad en pruebas generales de n=30.
- Riesgo de alucinacion: como todo modelo generativo, puede producir terminos o frases no presentes en la entrada; el autor mitiga la falsa insercion de glosario pero no se documentan pruebas a gran escala.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de un modelo multilingue general, puede heredar sesgos del corpus de entrenamiento del base.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide garantizar el manejo de textos largos.
- Licencia Gemma: el uso y la redistribucion deben cumplir los Gemma Terms of Use y la politica de usos prohibidos; conviene revisar las restricciones antes de un uso comercial.
- Solo se distribuye en GGUF; no hay safetensors publicados en el repo, lo que limita el reajuste fino directo a partir de estos pesos.
- La variante Q4_K_M pierde adherencia en el intercambio contrafactual de glosario (6/8 frente a 8/8 en Q8_0), por lo que para maximizar el control terminologico conviene Q8_0.
- Comunidad y adopcion minimas: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sappho192/ironworks-translator-1b-v0.1
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v1.0
- Repositorio del proyecto IronworksTranslator: https://github.com/sappho192/IronworksTranslator
