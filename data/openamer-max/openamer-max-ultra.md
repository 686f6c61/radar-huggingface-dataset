# openamer-max/openamer-max-ultra

## Resumen

OpenAmer-Max-Ultra es un ajuste fino mediante QLoRA del modelo Qwen2.5-32B-Instruct, desarrollado por Amer Sacirovic bajo el sello openamer-max. Forma parte de una familia escalonada por numero de parametros (Watch, Phone, Tab, Desktop, Pro, Ultra) y representa el escalon de mayor tamano, con 32.763.876.352 parametros totales. El modelo esta orientado a ejecucion local ("local-first") y se distribuye principalmente en formato GGUF cuantizado Q4_K_M, ademas de un adaptador LoRA separado.

El problema que aborda es el ajuste de un modelo denso de 32B a un dominio y estilo concretos en tres idiomas (aleman, ingles y bosnio) con un presupuesto de computo reducido: el entrenamiento se hizo con QLoRA de 4 bits sobre 2.716 frases. La relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de subconjuntos pequenos sobre modelos grandes; por otro, el propio autor documenta de forma transparente que el escalon de 32B no supera a sus versiones menores en su banco de pruebas interno, lo que lo convierte en un caso interesante para estudiar la relacion entre tamano de modelo y tamano de dataset.

Arquitectura transformer densa (heredada de Qwen2.5), licencia Apache-2.0, contexto nativo de 32.768 tokens segun la ficha de Qwen2.5 (no revalidado en este ajuste). El repositorio ocupa 19,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 (32,76B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliable; no revalidado en este ajuste) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo); adaptador LoRA en precision de entrenamiento (4 bits NF4 durante el entrenamiento) |
| Idiomas soportados | Aleman (de), ingles (en), bosnio (bs); otros idiomas no verificados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`openamer-max-ultra-q4.gguf`) y adaptador LoRA separado |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Metodo de ajuste | QLoRA, r=32, alpha=64, 1 epoca, 2.716 frases, cuantizacion 4 bits NF4 |
| VRAM pico en entrenamiento | 25,79 GB (GPU L40S de 48 GB) |
| Tamano del repositorio | 19,9 GB |
| Tamano del fichero GGUF | 18,49 GB (Q4_K_M) |
| Libreria / runtime | GGUF (llama.cpp, Ollama) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 32,76B parametros, resultado de aplicar un adaptador QLoRA sobre Qwen2.5-32B-Instruct. El ajuste empleo rango r=32 y alpha=64, una sola epoca sobre 2.716 frases y cuantizacion de 4 bits NF4 para los pesos base, con un pico de VRAM de 25,79 GB sobre una NVIDIA L40S. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni mezcla de expertos; la innovacion es puramente de flujo de trabajo (ajuste local de bajo coste sobre un modelo denso grande).

El autor es explicito sobre la limitacion central del entrenamiento: con 2.716 frases, el volumen de datos es insuficiente para 32B parametros, y por eso el escalon Ultra rinde por debajo de sus hermanos menores en el banco de pruebas interno. No se especifica la composicion del dataset, la proporcion por idioma ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se detalla el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en aleman, ingles y bosnio.
- Razonamiento de sentido comun y respuesta a preguntas factuales (evaluado en el banco interno de 45 casos).
- Seguimiento de formato e instrucciones (parte del banco de pruebas mide "Formatbefolgung").
- Manejo de negaciones y respuestas honestas ante preguntas sin respuesta conocida (el banco incluye casos de "honestidad").
- Capacidades heredadas del base Qwen2.5-32B-Instruct: generacion de codigo, matematicas, tool calling y function calling, aunque no se han revalidado tras el ajuste.
- Soporte multilingue limitado a los tres idiomas de entrenamiento; otros idiomas no verificados.
- Modo conversacional multi-turno (tag `conversational`).
- No se documenta vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistente conversacional local en aleman: el modelo puede desplegarse con Ollama en una sola maquina y gestionar dialogos multi-turno en aleman, aprovechando el ajuste especifico sobre ese idioma. Adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Atencion al cliente en bosnio: uno de los pocos modelos abiertos con ajuste declarado en bosnio; util para soporte de primer nivel en empresas de la diaspora bosnia en Europa central.
- Generacion de respuestas con formato estricto: el banco de pruebas mide seguimiento de formato, lo que lo hace apto para tareas de extraccion estructurada o plantillas de respuesta en pipelines internos.
- Prototipado de agentes con tool calling: al heredar de Qwen2.5-32B-Instruct, conserva la interfaz de function calling del base; util para construir agentes de un solo paso en entornos controlados, aunque requiere validacion propia porque el ajuste no lo cubre.
- Evaluacion comparativa de escalados: caso de estudio para investigadores que analizan como el tamano de dataset afecta al rendimiento de modelos densos grandes; el autor publica la comparativa entre escalones.
- Traduccion y redaccion asistida de/en/bs: redaccion de borradores y traduccion entre los tres idiomas de entrenamiento, con supervision humana dado el riesgo de alucinacion.
- Generacion de codigo en local: hereda la competencia de codigo de Qwen2.5-32B-Instruct; desplegable con llama.cpp en estaciones de trabajo con GPU de 24 GB o mas en Q4_K_M.

## Benchmarks y rendimiento

El autor publica un banco de pruebas propio de 45 casos ("Prüfstand") que mide hechos concisos, seguimiento de formato, negaciones y honestidad. No son benchmarks estandar (MMLU, HumanEval, GSM8K) y no se han publicado resultados en esos benchmarks estandar en la informacion disponible.

| Modelo (escalon) | Parametros | Prüfstand (45 casos) |
|---|---|---|
| Desktop | 14,70B | 44/45 (97,8 %) |
| Pro | 24,00B | 43/45 (95,6 %) |
| Phone | 3,09B | 43/45 (95,6 %) |
| Tab | 7,62B | 42/45 (93,3 %) |
| **Ultra (este modelo)** | **32,00B** | **41/45 (91,1 %)** |
| Watch | 0,60B | 37/45 (82,2 %) |
| Qwen2.5-14B sin ajuste (referencia) | 14,7B | 22/45 (48,9 %) |

El autor advierte que 45 casos son una muestra pequena y que el banco no mide razonamiento libre ni contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 19-20 GB solo para pesos; con overhead de contexto y KV cache, se recomienda 24 GB o mas.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40/80 GB, H100 o L40S para contexto largo o precision mayor.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con Q4_K_M; en GPUs de 16 GB no cabe sin cuantizaciones mas agresivas (no publicadas).
- Despliegue: Ollama (`ollama run amersacirovic/openamer-max-ultra`) y llama.cpp para el GGUF; el adaptador LoRA puede cargarse sobre el base con transformers + PEFT. vLLM y TGI no estan documentados para esta version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento: pico de 25,79 GB de VRAM sobre L40S de 48 GB; replicable en GPUs de 32 GB o mas con QLoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Max-Ultra | 32,76B | No disponible (base Qwen2.5: 32.768) | Apache-2.0 | GGUF Q4_K_M + LoRA | Ajuste QLoRA en de/en/bs; 41/45 en banco propio |
| Qwen2.5-32B-Instruct (base) | 32,76B | 32.768 nativo | Apache-2.0 | safetensors, GGUF | Referencia sin ajuste; sin datos en el banco propio del autor |
| OpenAmer-Max-Desktop | 14,70B | No disponible | Apache-2.0 (presumible, no confirmado) | GGUF | Mejor puntuacion en el banco propio (44/45) con la mitad de parametros |
| OpenAmer-Max-Pro | 24,00B | No disponible | Apache-2.0 (presumible, no confirmado) | GGUF | 43/45 en el banco propio |

La comparativa con modelos de la misma categoria (p. ej. Mistral-Small, Gemma 2 27B, Yi-34B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a escalones menores de la misma familia en el banco interno (41/45 frente a 44/45 de Desktop), pese a tener mas parametros; el autor lo atribuye a un dataset de entrenamiento demasiado pequeno (2.716 frases) para 32B.
- Banco de pruebas de solo 45 casos: muestra pequena, sin intervalos de confianza; no mide razonamiento libre ni contexto largo.
- Idiomas no verificados fuera de de/en/bs; el comportamiento en castellano u otros idiomas no esta evaluado y puede degradarse respecto al base.
- Riesgo de alucinacion inherente a un ajuste supervisado pequeno; el banco mide honestidad pero no cubre dominios especializados.
- No se documentan sesgos especificos; al heredar de Qwen2.5-32B-Instruct, arrastra los sesgos del base, no evaluados en este ajuste.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad de validacion en produccion recae en el integrador; no hay garantias ni evaluaciones de seguridad publicadas.
- Solo se publica una cuantizacion (Q4_K_M); no hay versiones Q5, Q6, Q8 ni FP16 en el repo, lo que limita el ajuste fino de calidad/VRAM.
- Repositorio sin descargas ni likes en el momento de la consulta: sin validacion externa de la comunidad.
- El modelo se creo y actualizo el 14 de noviembre de 2026; verificar si hay revisiones posteriores antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-ultra
- Adaptador LoRA: https://huggingface.co/openamer-max/openamer-max-ultra-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Enlace de donaciones del autor: https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
