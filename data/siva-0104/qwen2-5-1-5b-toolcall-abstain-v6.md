# siva-0104/qwen2.5-1.5b-toolcall-abstain-v6

## Resumen

qwen2.5-1.5b-toolcall-abstain-v6 es un ajuste fino supervisado de Qwen/Qwen2.5-1.5B-Instruct orientado especificamente a tool calling con capacidad de abstencion. Lo desarrolla el usuario independiente siva-0104 y aborda un problema concreto en agentes locales pequenos: los modelos de 1.500 millones de parametros tienden a invocar herramientas aunque no exista una adecuada, o a fallar en la seleccion cuando el catalogo contiene funciones parecidas. Este ajuste entrena al modelo para emitir llamadas estructuradas, pedir informacion faltante o declarar que ninguna herramienta del listado aplica.

Tecnicamente es un transformer decoder-only denso de 1.543.714.304 parametros, derivado de Qwen2.5, con contexto nativo de 32.768 tokens (heredado del modelo base). El ajuste se hizo con QLoRA en 4 bits NF4 (rango 16, alpha 32) sobre 8.366 filas y una sola epoca, y el adaptador se fusiono en los pesos finales en fp16. El repositorio incluye ademas una version MLX de 4 bits para Apple Silicon y el adaptador LoRA original.

Su relevancia practica esta en el nicho de agentes embebidos: con un modelo de 1,5B es viable ejecutar tool calling en hardware modesto (una T4 gratuita de Kaggle basta para el entrenamiento), y las cifras declaradas por el autor muestran mejoras sustanciales frente al base en exact match de llamadas (62,7 a 83,7 en BFCL simple), a costa de una caida en la tasa de abstencion en escenarios de irrelevancia (96,7 a 84,2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5; la model card no la redefine) |
| Tipos de cuantizacion | fp16 (pesos fusionados en raiz), 4-bit MLX (`mlx/`), QLoRA 4-bit NF4 usada en entrenamiento; el adaptador LoRA esta incluido en `adapter/` |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), MLX para Apple Silicon, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE, sin mecanismos de atencion lineal ni estado recurrente. El ajuste se realizo con QLoRA: cuantizacion 4-bit NF4 del base, LoRA con rango 16 y alpha 32, learning rate 2e-4 con scheduler coseno, batch efectivo de 16, una epoca y calculo de perdida solo sobre la respuesta. El adaptador se fusiono posteriormente en los pesos, de modo que el modelo raiz es un checkpoint fp16 convencional cargable con transformers. El entrenamiento completo cupo en una T4 gratuita de Kaggle: 100 minutos para la variante de 1,5B (44 min para 0,5B y 169 min para 3B).

Los datos son exclusivamente publicos y con control de fuga: xLAM function-calling 60k (CC-BY-4.0), Glaive function-calling v2 (Apache-2.0), Hermes function-calling v1 (Apache-2.0) y ToolACE (Apache-2.0), mas negativos sinteticos de herramientas no coincidentes. El conjunto final son 8.366 filas tras el limite de 1.024 tokens, de las cuales el 24% son filas sin llamada. Aproximadamente el 49% de las filas de llamada incluyen entre 1 y 4 herramientas distractoras parecidas recuperadas de la libreria de entrenamiento, lo que explica la robustez en el escenario de herramientas no coincidentes (99,7% de abstencion correcta). No se usaron datos de When2Call ni de BFCL; los splits son disjuntos por nombre de herramienta y el autor declara que `leak_check.py` pasa con 0 coincidencias de consultas BFCL, aunque reconoce que 13 de 9.314 definiciones de funciones BFCL son identicas (nombre y descripcion) a una herramienta de entrenamiento, sin coincidencia de consultas.

## Capacidades

- Generacion de llamadas a herramientas en formato estructurado `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, incluyendo multiples llamadas en una misma respuesta.
- Abstencion explicita: el modelo puede responder que ninguna herramienta del listado aplica en lugar de forzar una llamada.
- Solicitud de informacion faltante cuando la peticion del usuario es ambigua o incompleta.
- Seleccion robusta entre herramientas parecidas, entrenado con distractores recuperados por similitud de embeddings.
- Integracion con agentes sobre MCP (Model Context Protocol): el autor reporta un 93,5% de exito de llamada en un agente con 49 consultas y 10 herramientas.
- Generacion de texto conversacional general, heredada del base Qwen2.5-Instruct.
- Capacidad multilingue limitada: solo se declara ingles; el base soporta mas idiomas, pero el ajuste no fue evaluado en ellos.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Agentes locales de bajo coste: desplegar un agente que recibe un catalogo de herramientas recuperadas por similitud (top 5) y ejecuta llamadas validadas contra el esquema JSON antes de su ejecucion; el modelo esta entrenado exactamente para ese flujo.
- Automatizacion de operaciones con MCP: conectar el modelo a servidores MCP con un conjunto acotado de herramientas (10 en la evaluacion del autor) para tareas de consulta y accion sobre sistemas internos, donde el 93,5% de exito de llamada es suficiente.
- Enrutamiento de intenciones con rechazo: usar el modelo como clasificador que decide si la peticion del usuario corresponde a alguna herramienta disponible o debe escalarse a un humano o a un modelo mayor, aprovechando la tasa de abstencion del 99,7% con herramientas no coincidentes.
- Asistente de soporte tecnico con acceso a funciones: el modelo puede pedir datos faltantes (por ejemplo, un identificador de pedido) antes de invocar la funcion de consulta, lo que reduce llamadas erroneas en produccion.
- Prototipado en hardware de consumo: al ser un modelo de 1,5B en fp16 (aproximadamente 3 GB de pesos) o 4 bits MLX, cabe en portatiles Apple Silicon y GPUs consumer, lo que permite iterar en local sin infraestructura cloud.
- Pipelines de evaluacion y regresion de tool calling: servir como modelo de referencia barato para comparar esquemas de herramientas, prompts y recuperadores antes de pasar a modelos mayores.
- Filtrado previo en arquitecturas multi-modelo: usarlo como primera etapa que resuelve llamadas simples y deriva a un modelo mayor solo los casos ambiguos, reduciendo coste por consulta.

## Benchmarks y rendimiento

Datos declarados por el autor con su propio scorer, no con el checker oficial de BFCL, una sola semilla y caracter informativo (BFCL report-only).

| Conjunto | 0.5B | 1.5B (este modelo) | 3B |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstencion correcta | 75,8 | 84,2 | 87,1 |
| BFCL live simple, exact match | 44,6 | 56,6 | 66,3 |
| BFCL live irrelevance, abstencion correcta | 71,7 | 77,0 | 77,0 |
| xLAM (held-out), exact match | 68,0 | 71,7 | 77,3 |
| Hermes (held-out), exact match | 48,0 | 53,3 | 59,3 |
| ToolACE (held-out), exact match | 44,3 | 49,0 | 53,7 |
| Herramientas no coincidentes, abstencion | 99,7 | 99,7 | 100 |
| Agente sobre MCP (49 consultas, 10 herramientas), exito de llamada | 80,6% | 93,5% | 93,5% |

Comparacion con el modelo base Qwen2.5-1.5B-Instruct:

| Conjunto | Base 1.5B | v6 |
|---|---|---|
| BFCL simple, exact match | 62,7 | 83,7 |
| BFCL live simple, exact match | 26,0 | 56,6 |
| BFCL irrelevance, abstencion | 96,7 | 84,2 |
| BFCL live irrelevance, abstencion | 92,0 | 77,0 |
| xLAM, exact match | 24,7 | 71,7 |
| Hermes, exact match | 19,3 | 53,3 |
| ToolACE, exact match | 18,7 | 49,0 |
| Glaive, precision de decision | 49,3 | 96,3 |
| Herramientas no coincidentes, abstencion | 99,3 | 99,7 |

El patron es claro: el ajuste multiplica la precision de llamada en todos los conjuntos, pero reduce la abstencion en BFCL irrelevance (96,7 a 84,2) y en live irrelevance (92,0 a 77,0) respecto al base, es decir, el modelo tiende algo mas a llamar cuando no deberia en esos escenarios. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo de pesos; con cache KV para 32.768 tokens el consumo sube de forma notable, por lo que conviene limitar el contexto efectivo en produccion.
- VRAM estimada en 4 bits: en torno a 1 GB de pesos, con overhead adicional de runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp16 con contexto moderado (RTX 3060/4060, T4, L4); A100/H100 no son necesarias y solo aportan throughput.
- Cabe en GPU consumer y en Apple Silicon: el repositorio incluye una version MLX de 4 bits para `mlx-lm`.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI (el modelo esta etiquetado como text-generation-inference y endpoints_compatible), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), MLX en macOS.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, es esperable que sea adecuado para agentes interactivos en una sola GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-toolcall-abstain-v6 | 1,54B | 32.768 (heredado del base) | Especializado, con abstencion; BFCL simple 83,7 (scorer propio) | Apache-2.0 | Hugging Face, 391 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Generico; BFCL simple 62,7 (scorer del autor) | Apache-2.0 | Hugging Face, ampliamente usado |
| Variantes Qwen2.5-Instruct 0.5B y 3B ajustadas por el mismo autor | 0,5B / 3B | 32.768 | Mismo pipeline; BFCL simple 79,3 / 89,7 | Apache-2.0 | Hugging Face |
| Otros ajustes pequenos de tool calling (por ejemplo, derivados de Hermes o xLAM) | variable | variable | Especificos de function calling | variable | no disponible para comparacion directa con estos datos |

La comparacion mas directa y con datos verificables es contra el modelo base y contra las otras tallas del mismo autor; no hay resultados oficiales de BFCL que permitan situar este modelo frente a la leaderboard publica.

## Limitaciones y advertencias

- Los benchmarks son del propio autor, con su scorer y una sola semilla; no son resultados oficiales de BFCL y no deben citarse como tales.
- La abstencion empeora respecto al base en escenarios de irrelevancia de BFCL (96,7 a 84,2 y 92,0 a 77,0): en produccion puede invocar herramientas cuando la respuesta correcta era no llamar.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente degrade el formato de llamada.
- Existe una superposicion informativa reconocida por el autor: 13 de 9.314 definiciones de funciones de BFCL son identicas a herramientas de entrenamiento, aunque con consultas distintas.
- Riesgo de alucinacion en argumentos: el modelo puede rellenar parametros plausibles en lugar de pedir informacion faltante, especialmente fuera de la distribucion de entrenamiento.
- El contexto de 32.768 tokens es teorico para este ajuste: el entrenamiento limito las filas a 1.024 tokens, por lo que el comportamiento con catalogos de herramientas muy largos no esta validado.
- El modelo esta pensado para catalogos pequenos recuperados por similitud (top 5 en el flujo recomendado); con librerias de herramientas grandes sin recuperacion previa la precision cae.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones de los datos de entrenamiento (xLAM es CC-BY-4.0 y requiere citar APIGen/xLAM; Glaive, Hermes y ToolACE son Apache-2.0).
- Es un ajuste de un autor independiente con 0 likes y 391 descargas: no hay garantia de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-1.5b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Codigo, evaluacion y pipeline de agente: https://github.com/siva-0104/toolcall-slm
- Berkeley Function-Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
- Dataset xLAM function-calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset Hermes function-calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
