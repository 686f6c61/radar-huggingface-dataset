# mradermacher/flint-roleplay-antislop-i1-GGUF

## Resumen

Este repositorio no es un modelo en sí, sino una colección de cuantizaciones GGUF ponderadas con imatrix (matriz de importancia) del modelo **flint-roleplay-antislop**, publicado por el cuantizador comunitario **mradermacher**. El modelo base, `rawmodels/flint-roleplay-antislop`, es un modelo de aproximadamente 39,8 mil millones de parámetros con arquitectura MoE (mixture of experts), entrenado o ajustado para roleplay y escritura creativa, con un enfoque destacable: el uso de *reinforcement learning antislop*, una técnica que busca reducir el lenguaje repetitivo y de baja calidad (el llamado "slop") típico de los modelos generativos.

La relevancia de esta ficha radica en la disponibilidad de más de 20 variantes de cuantización (desde IQ1_S con 8,3 GB hasta Q6_K con 32,8 GB), lo que permite ejecutar un modelo de ~40B de parámetros en hardware muy variado, desde GPU de consumo hasta estaciones multi-GPU. Al ser un modelo orientado a roleplay y escritura creativa en inglés, con licencia Apache 2.0, resulta interesante para desarrolladores que quieren montar servicios de narrativa interactiva o asistentes de escritura creativa sin restricciones de licencia. El contexto, los parámetros activos del MoE y los datos de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer (según tags del repo) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix/i1) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base está en bf16 (safetensors) |

## Arquitectura y entrenamiento

El modelo base, `rawmodels/flint-roleplay-antislop`, es un transformer de tipo mixture of experts con unos 39,8 mil millones de parámetros totales en bf16, según los metadatos de safetensors del repositorio. No se ha publicado información sobre el número de parámetros activos por token, la longitud de contexto, el dataset de preentrenamiento ni el número de tokens de entrenamiento. La etiqueta "antislop - reinforcement-learning" indica que el modelo ha pasado por algún proceso de aprendizaje por refuerzo orientado a penalizar construcciones textuales cliché y repetitivas, una técnica cada vez más común en modelos fine-tuned para escritura creativa y roleplay.

En cuanto al repositorio cuantizado, mradermacher emplea cuantizaciones ponderadas con imatrix (matriz de importancia calculada sobre datos de calibración), que en tamaños bajos y medios suelen superar en calidad a las cuantizaciones estáticas equivalentes. Se proporciona además un archivo imatrix de 0,6 GB para que los usuarios generen sus propias cuantizaciones. Existe una variante de cuantizaciones estáticas en un repositorio hermano.

## Capacidades

- Generación de texto creativo orientada a roleplay (conversaciones de personajes, narrativa interactiva).
- Escritura creativa en general, con entrenamiento anti-"slop" para reducir clichés, fórmulas repetitivas y lenguaje de baja calidad.
- Al ser un cuantizado GGUF, es compatible con llama.cpp y todo su ecosistema (inferencia en CPU, GPU o híbrida).
- Capacidades de razonamiento, código, matemáticas o multimodalidad: no disponible (no se documenta en la model card).
- Tool calling / function calling: no disponible.
- Soporte multilingüe: documentado únicamente para inglés.

## Casos de uso

- **Roleplay interactivo en frontends tipo SillyTavern o similar**: el modelo está específicamente ajustado para conversaciones de personajes; las cuantizaciones Q4_K_M (24,3 GB) ofrecen un buen equilibrio calidad/tamaño para sesiones largas.
- **Escritura de ficción asistida**: gracias al entrenamiento antislop, es adecuado para generar prosa con menos clichés que otros modelos de tamaño comparable, útil como copiloto de escritores.
- **Narrativa procedural en videojuegos**: un modelo MoE de 40B servido localmente puede generar diálogos de personajes NPC en inglés con estilo consistente.
- **Despliegue en GPU de consumo de gama alta**: la variante IQ3_M (17,6 GB) cabe en una RTX 4090 de 24 GB, permitiendo uso personal sin servidor dedicado.
- **Despliegue en CPU o sistemas sin GPU**: variantes IQ1_S/IQ1_M (8,3–9,2 GB) permiten experimentar con el modelo en equipos modestos, con la consiguiente pérdida de calidad señalada por el propio autor ("for the desperate").
- **Investigación sobre cuantización**: el archivo imatrix incluido permite generar cuantizaciones propias y comparar degradación de calidad en tareas creativas.
- **Bots de chat creativos autoalojados**: con licencia Apache 2.0, puede integrarse en productos comerciales sin restricciones de licenciamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de roleplay y escritura creativa, es habitual que el rendimiento se evalúe cualitativamente (coherencia narrativa, ausencia de slop) en lugar de con benchmarks estandarizados como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin KV-cache):
  - IQ1_S: ~8,3 GB; IQ1_M: ~9,2 GB; IQ2_M: ~13,2 GB.
  - IQ3_M: ~17,6 GB; IQ4_K_S: ~22,8 GB; Q4_K_M: ~24,3 GB.
  - Q5_K_M: ~28,4 GB; Q6_K: ~32,8 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): IQ3_M o IQ3_S completos en GPU; Q4_K_M con offload parcial a CPU.
  - RTX 5090 (32 GB): hasta Q6_K en GPU.
  - A100/H100 (40/80 GB): cualquier cuantización con sobrada holgura, incluida bf16 vía el modelo base.
- Consumer GPUs: sí, cabe en RTX 3090/4090 con cuantizaciones de 3–4 bits; en GPU de 8–12 GB solo con variantes IQ1/IQ2 y offload a RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp (habitual en roleplay), y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para ellos habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponible. Al ser MoE de ~40B, si los parámetros activos son reducidos, la velocidad por token puede ser alta en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| flint-roleplay-antislop (este) | ~39,8B totales | MoE | no disponible | Apache 2.0 | Roleplay y escritura creativa con RL antislop |
| Mistral Small 3.x (24B) | 24B | Dense | 32k | Apache 2.0 | Uso general, buen roleplay tras fine-tune |
| Qwen3-30B-A3B | 30B (3B activos) | MoE | 32k+ | Apache 2.0 | Uso general con inferencia eficiente |

Comparar en rendimiento no es posible: no hay benchmarks publicados para el modelo de esta ficha. La ventaja diferencial declarada es el entrenamiento antislop específico para escritura creativa; frente a modelos generalistas de tamaño similar, puede ofrecer prosa de mayor calidad subjetiva, aunque sin datos verificables.

## Limitaciones y advertencias

- Idioma: solo se documenta soporte para inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_*): el propio autor advierte de calidad muy baja o "desesperada"; para roleplay, la degradación en coherencia de personaje puede ser notable por debajo de IQ3.
- Sesgos: no disponible; al ser un modelo de roleplay, puede reproducir estereotipos y contenidos generados durante el fine-tune. Revisa la model card del modelo base para más detalle.
- Alucinaciones: no cuantificadas; asume el riesgo habitual de cualquier LLM en generación de hechos.
- Longitud de contexto: no disponible; verifica la plantilla y el contexto soportado en llama.cpp antes de producir.
- Licencia: Apache 2.0 permite uso comercial, pero el comportamiento del modelo base (`rawmodels/flint-roleplay-antislop`) puede depender de los datos de entrenamiento del modelo del que derive; no hay información sobre su procedencia.
- Este repo es una cuantización de terceros: los problemas del modelo base no se corrigen aquí, y el soporte depende de la comunidad.

## Enlaces

- Repositorio GGUF i1/imatrix: https://huggingface.co/mradermacher/flint-roleplay-antislop-i1-GGUF
- Modelo base: https://huggingface.co/rawmodels/flint-roleplay-antislop
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/flint-roleplay-antislop-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#flint-roleplay-antislop-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y blog: no disponible
