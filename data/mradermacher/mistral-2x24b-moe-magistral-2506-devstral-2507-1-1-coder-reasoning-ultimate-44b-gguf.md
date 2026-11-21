# mradermacher/Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B-GGUF

## Resumen

Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B es un modelo de lenguaje de tipo mezcla de expertos (MoE) obtenido mediante el merge de varios modelos de la familia Mistral: Magistral 2506, Devstral 2507 y variantes coder/reasoning. El autor del merge es DavidAU, y esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones estaticas para llama.cpp.

El modelo combina capacidades de generacion de codigo (herencia de Devstral y Codestral), razonamiento explicito con modo thinking (herencia de Magistral) y conversacion general multilingue. Con 43.705.472.000 parametros totales en una arquitectura MoE de tipo 2x24B, busca ofrecer un equilibrio entre calidad de razonamiento/codigo y coste de inferencia, ya que solo una fraccion de los parametros se activa por token.

La relevancia actual radica en que permite desplegar un modelo de ~44B con capacidades de razonamiento y codigo en hardware de consumo mediante cuantizaciones GGUF (desde Q2_K de 16,3 GB hasta Q8_0 de 46,5 GB), bajo licencia Apache 2.0 y con soporte para 24 idiomas. Esta pensado para desarrolladores que quieren un modelo local versatil para tareas de programacion y razonamiento sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo 2x24B, basada en transformers |
| Parametros totales | 43.705.472.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo i1-GGUF |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos (weight merge) construido por DavidAU a partir de modelos Mistral de tipo MoE. La denominacion "2x24B" indica una arquitectura de mezcla de expertos con dos bloques de aproximadamente 24B de parametros, dando un total de ~43,7B. No se dispone de informacion detallada en la model card sobre el numero de expertos activos por token, la funcion de enrutamiento ni el numero exacto de parametros activos.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado adicionales sobre el merge. Las capacidades de razonamiento (modo thinking) y de codigo provienen de los modelos base Magistral 2506 y Devstral 2507, respectivamente, pero la model card no detalla la receta de fusion ni los hiperparametros del merge. Esta version concreta es una cuantizacion estatica generada por mradermacher con llama.cpp, sin modificaciones de arquitectura respecto al modelo base.

## Capacidades

- Generacion de codigo en multiples lenguajes, con herencia directa de Devstral 2507 y Codestral.
- Razonamiento explicito con modo thinking, heredado de Magistral 2506.
- Conversacion multi-turno de proposito general.
- Capacidades multilingues en 24 idiomas (incluyendo espanol, ingles, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe, hindi y bengali, entre otros).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo thinking y las capacidades coder lo hacen plausible.
- Capacidades de vision o audio: no disponibles.
- Etiquetado como "endpoints_compatible" y "conversational" en Hugging Face.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede autocompletar y generar funciones completas en un IDE integrado mediante llama.cpp u Ollama, aprovechando la herencia de Devstral y Codestral para tareas de codigo en produccion sin enviar codigo a APIs externas.
- Razonamiento paso a paso en problemas tecnicos: el modo thinking permite obtener cadenas de razonamiento explicitas utiles para depuracion de algoritmos, analisis de errores y explicacion de decisiones de diseno.
- Chat multilingue para soporte interno: con 24 idiomas soportados, puede gestionar conversaciones multi-turno en equipos distribuidos geograficamente, incluyendo espanol, portugues, frances y aleman.
- Generacion de tests y documentacion: el modelo puede producir pruebas unitarias y documentacion tecnica a partir de fragmentos de codigo, reduciendo el trabajo manual en pipelines de CI/CD.
- Prototipado de agentes de codigo: aunque el tool calling no esta confirmado explicitamente, su combinacion de razonamiento y generacion de codigo lo hace candidato para orquestar tareas de refactorizacion o migracion en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (26,6 GB) y Q4_K_S (25,1 GB) permiten ejecutar el modelo en GPUs de 24-32 GB de VRAM, habilitando entornos de desarrollo sin conexion.
- Experimentacion en investigacion: al ser un merge Apache 2.0 con pesos abiertos, sirve para estudiar el comportamiento de merges MoE y comparar con los modelos base originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~16,3 GB; Q3_K_S ~19,2 GB; Q3_K_M ~21,2 GB; Q3_K_L ~22,9 GB; IQ4_XS ~23,8 GB; Q4_K_S ~25,1 GB; Q4_K_M ~26,6 GB; Q5_K_S ~30,2 GB; Q5_K_M ~31,2 GB; Q6_K ~36,0 GB; Q8_0 ~46,5 GB. A estas cifras hay que anadir el overhead de contexto KV cache.
- GPU recomendadas: para Q4_K_M en adelante, una RTX 4090 (24 GB) queda justa; se recomienda RTX 3090/4090 con offloading parcial o GPUs de 32 GB (RTX 5090) o 48 GB (A6000, L40S). Para Q8_0 se necesita una A100 80 GB o H100 80 GB, o bien configuracion multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a IQ4_XS en GPUs de 24 GB (RTX 3090, 4090) con contexto moderado; Q4_K_M y Q5 requieren 32 GB o offloading a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura MoE es compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B (este) | 43,7B (MoE 2x24B) | no disponible | Apache 2.0 | GGUF, safetensors | Merge de Magistral, Devstral y coder |
| Magistral 2506 (Mistral AI) | no disponible | no disponible | no disponible | no disponible | Modelo base de razonamiento |
| Devstral 2507 (Mistral AI) | no disponible | no disponible | no disponible | no disponible | Modelo base orientado a codigo y agentes |
| Codestral (Mistral AI) | no disponible | no disponible | no disponible | no disponible | Modelo base de generacion de codigo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un merge de pesos sin evaluacion publicada, el rendimiento real puede degradarse respecto a los modelos base originales; no hay benchmarks que lo validen.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente agravado por la fusion de pesos de modelos con distribuciones distintas.
- No se ha publicado informacion sobre sesgos especificos, pero al heredar de modelos entrenados con datos web es probable que presente sesgos sociales y culturales.
- La longitud de contexto no esta documentada; no se debe asumir la ventana nativa de los modelos base sin verificacion empirica.
- El soporte de tool calling y de agentes no esta confirmado explicitamente en la model card.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos base originales (Magistral, Devstral, Codestral) por si imponen restricciones adicionales al uso comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la calidad del codigo generado; para produccion se recomienda Q4_K_M o superior.
- El repo ocupa 297,8 GB en total; la descarga de todas las cuantizaciones no es practica y conviene seleccionar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-2x24B-MOE-Magistral-2506-Devstral-2507-1.1-Coder-Reasoning-Ultimate-44B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
