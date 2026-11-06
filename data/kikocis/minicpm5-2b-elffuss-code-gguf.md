# KikoCis/MiniCPM5-2B-Elffuss-Code-GGUF

## Resumen

MiniCPM5-2B-Elffuss-Code-GGUF es un ajuste (finetune) especializado del modelo MiniCPM5-2B de OpenBMB, publicado por el usuario KikoCis en Hugging Face. Su propósito es servir como agente de código dentro de Elffuss Code, un IDE que se ejecuta en el navegador y que permite leer proyectos, localizar errores, editar líneas concretas, verificar correcciones y responder citando archivos reales. El modelo se publica en formato GGUF cuantizado (Q8_0 con embeddings y cabeza de salida en BF16), pensado para ejecución local mediante llama.cpp u Ollama.

El proyecto se caracteriza por un ciclo de publicación diario: cada día se entrena una versión nueva y se evalúa sobre un conjunto de tareas reservadas (held-out) con métricas públicas, de modo que la evolución completa es auditable. Con aproximadamente 2.500 millones de parámetros y licencia Apache-2.0, es un candidato relevante para casos de uso on-device donde se necesita un agente de código ligero con soporte de tool calling.

Conviene señalar que, según las métricas publicadas por el propio autor, el rendimiento en la tarea principal (corrección de bugs) es muy bajo: la versión más reciente (v16, del 30 de octubre de 2026) corrige el 0 % de los bugs plantados, frente al 12 % del modelo original. Esto hace que su utilidad práctica como agente de corrección de código esté, por ahora, en entredicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en MiniCPM5-2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 (≈2,52 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de ejemplo; máximo del modelo base no disponible) |
| Tipos de cuantizacion | Q8_0 (bloques Q8_0 con embeddings y output head en BF16, variante "Q8_0-XL") |
| Idiomas soportados | Castellano (es) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3,18 GB por archivo); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B, un modelo de lenguaje de 2,52 B de parámetros de OpenBMB. La ficha no detalla la arquitectura interna del modelo base (número de capas, cabezas de atención, tipo de atención), por lo que esos datos no están disponibles. No hay indicios de que sea un modelo MoE.

El ajuste especializado se realiza de forma continua: el autor publica una versión nueva cada día, entrenada "un poco más cada día" para operar como agente de código en Elffuss Code. El entrenamiento se orienta al protocolo de herramientas propio de Elffuss Code, que usa bloques de código con el formato ` ```tool {"tool": "code.read", …} ``` `. Los datos de entrenamiento concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles. Como métrica de control, el autor mide la divergencia KL (KLD) de la distribución de siguientes tokens frente al modelo BF16 original sobre wikitext-2, para cuantificar cuánto comportamiento general se pierde con la especialización; en v16 la KLD es de 0,0260.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base MiniCPM5-2B.
- Agente de codigo: leer proyectos, buscar codigo, editar archivos y verificar correcciones mediante el protocolo de herramientas de Elffuss Code (`code.read`, `code.search`, `code.edit`, etc.).
- Tool calling estructurado: genera llamadas a herramientas en el formato propio de Elffuss Code; en v16 el 90 % de las llamadas son validas para el parser.
- Respuestas fundamentadas (grounded): teoricamente cita archivos devueltos por las herramientas, aunque en v16 solo el 8 % de las respuestas cumplen este criterio.
- Soporte de modo de razonamiento desactivable (`enable_thinking: false` en la plantilla de chat), lo que sugiere soporte de thinking mode.
- Capacidades multilingues en castellano e ingles.
- Ejecucion local (on-device) mediante llama.cpp u Ollama.

## Casos de uso

- Integracion como agente de codigo en Elffuss Code: el caso de uso para el que fue entrenado; se apunta llama-server como proveedor de API del IDE y el modelo ejecuta el bucle agente con sus herramientas.
- Experimentacion con cuantizacion Q8_0 en local: con 3,18 GB de tamaño, cabe en portatiles y GPUs de consumo modestas, util para probar bucles agenticos sin coste de API.
- Investigacion reproducible de fine-tunes continuos: el autor publica cada version diaria como etiqueta git y todas las metricas de evolucion, lo que permite estudiar el impacto de sucesivas rondas de entrenamiento sobre un modelo base.
- Asistente de codigo en castellano e ingles on-device: para entornos sin conexion donde se requiera comprension y generacion de codigo en ambos idiomas.
- Prototipado de protocolos de tool calling propios: el modelo esta entrenado con un formato de llamadas a herramientas concreto, util como referencia para disenar parsers y bucles agenticos personalizados.
- Comparacion de drift por especializacion: la metrica KLD frente al modelo original permite evaluar cuanto comportamiento general se sacrifica al especializar, util en estudios de catastrophic forgetting.

Debe subrayarse que, con un 0 % de bugs corregidos en la version actual, el uso en produccion para correccion automatica de codigo no esta justificado por los datos disponibles.

## Benchmarks y rendimiento

El autor publica metricas propias de evaluacion agente (no benchmarks estandar tipo MMLU o HumanEval). Conjunto held-out: 24 tareas sobre 3 repositorios publicos nunca usados en entrenamiento, cada tarea ejecutada dos veces, con temperature 1.0 y top_p 0.95 en el bucle agente de Elffuss Code.

| Version | Fecha | Bugs corregidos | Respuestas fundamentadas | Protocolo de tools valido | Finalizadas | Pasos medios | KLD vs original |
|---|---|---:|---:|---:|---:|---:|---:|
| v0 (original) | — | 12 % | 92 % | 98 % | 77 % | 6,1 | 0,0000 |
| v1 | 2026-10-11 | 0 % | 0 % | 85 % | 100 % | 1 | 8,7960 |
| v8 | 2026-10-20 | 0 % | 25 % | 92 % | 21 % | 10,29 | 0,0214 |
| v13 | 2026-10-27 | 8 % | 8 % | 92 % | 29 % | 10,17 | 0,0279 |
| v15 | 2026-10-29 | 0 % | 17 % | 85 % | 27 % | 10,1 | 0,0293 |
| v16 (actual) | 2026-10-30 | 0 % | 8 % | 90 % | 33 % | 9,38 | 0,0260 |

Definiciones de metricas segun el autor: "Bugs corregidos" cuenta solo si el archivo queda byte-identico al original tras plantar un bug de un token; "respuestas fundamentadas" exige citar archivos devueltos por las herramientas; "protocolo de tools valido" mide llamadas aceptadas por el parser de Elffuss Code; KLD mide el drift sobre wikitext-2.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,2 GB para los pesos Q8_0-XL, mas la KV cache para 32.768 tokens de contexto (estimable en 2-4 GB adicionales segun configuracion; cifra exacta no disponible).
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (por ejemplo RTX 3060, RTX 4060) es suficiente; tambien puede ejecutarse en CPU dada su pequenez, aunque con mayor latencia.
- Consumer GPUs: cabe con holgura en GPUs de 8 GB e incluso en equipos sin GPU dedicada.
- Despliegue: llama.cpp (`llama-server` con `--jinja`, contexto de 32768, temperature 1.0 y top_p 0.95 segun el autor) y Ollama (`ollama run hf.co/KikoCis/MiniCPM5-2B-Elffuss-Code-GGUF:Q8_0-XL`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| MiniCPM5-2B-Elffuss-Code (este) | 2,52 B | 32.768 (en ejemplos) | Apache-2.0 | GGUF | Agente de codigo especializado (Elffuss Code) |
| openbmb/MiniCPM5-2B (base) | 2,52 B | no disponible | Apache-2.0 | safetensors | Modelo general |
| Qwen2.5-Coder-3B | 3 B | hasta 32.768 | Qwen Research / Apache-2.0 (segun version) | safetensors, GGUF | Codigo general |
| Stable Code 3B | 2,8 B | 16.384 | Apache-2.0 | safetensors, GGUF | Codigo y completion |

La comparacion con Qwen2.5-Coder-3B y Stable Code 3B es orientativa: son alternativas de tamano similar orientadas a codigo con ecosistemas GGUF maduros. No hay benchmarks comunes publicados que permitan comparar rendimiento numerico; en la metrica propia de correccion de bugs, este modelo rinde peor que su propio modelo base (0 % frente a 12 %).

## Limitaciones y advertencias

- Rendimiento agente muy bajo: segun las metricas del propio autor, v16 corrige el 0 % de los bugs plantados y solo el 8 % de las respuestas son fundamentadas, por debajo del modelo base original (12 % y 92 %). La especializacion diaria no ha mejorado la tarea principal hasta la fecha.
- Riesgo de alucionacion elevado en respuestas sobre codigo: la baja tasa de respuestas fundamentadas indica que el modelo cita archivos que las herramientas no devolvieron en la mayoria de los casos.
- Protocolo de herramientas propietario: el formato de tool calling es el especifico de Elffuss Code; su uso con otros frameworks agenticos requiere adaptacion del parser o del prompt.
- Idiomas limitados a castellano e ingles segun la ficha; otros idiomas no estan garantizados.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque el modelo base sigue siendo © OpenBMB y hay que respetar la atribucion.
- Variabilidad diaria: se publica una version nueva cada dia, por lo que el comportamiento puede cambiar sustancialmente entre descargas; conviene fijar la version (etiqueta git `v<fecha>`) en produccion.
- Contexto maximo del modelo base no documentado en la ficha; el valor de 32.768 tokens corresponde al comando de ejemplo del autor.
- Sesgos conocidos: no disponible.

## Enlaces

- Ficha del modelo: https://huggingface.co/KikoCis/MiniCPM5-2B-Elffuss-Code-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Cuantizacion fiel sin modificar: https://huggingface.co/KikoCis/MiniCPM5-2B-GGUF
- Elffuss Code (IDE en el navegador): https://elffuss.com
