# FrostWolfAI/Spark-X2.6-4B-abliterated

## Resumen

Spark-X2.6-4B-abliterated es una variante "decensored" del modelo XHToken/Spark-X2.6-4B, un modelo de 4.112 millones de parametros (4,11B) desarrollado por XHToken y post-entrenado para uso en dispositivo (on-device), codigo, uso agentico de herramientas y trabajo con contexto largo. Esta version concreta la publica FrostWolfAI (Vatsal Bajpai) aplicando una ablacion de pesos con Heretic v2.0.0.dev0 y la tecnica Arbitrary-Rank Ablation (ARA), que suprime el comportamiento de rechazo sin fine-tuning y sin modificar la arquitectura original.

El modelo conserva intacta la arquitectura de Spark-X2.6: 36 capas con un patron 3:1 de atencion de ventana deslizante (512 tokens) y atencion global, puertas de atencion sigmoideas por cabeza, QKV fusionado, embeddings atados y una ventana de contexto de 1.048.576 tokens. Mantiene tambien la plantilla de chat estilo DeepSeek, el modo de razonamiento controlable (sin thinking / bajo / alto) y el formato `<tool_call>` para invocacion de herramientas.

La relevancia de esta ficha esta en que combina dos cosas poco habituales en un modelo de 4B: un contexto de un millon de tokens y un proceso de ablacion reproducible documentado con semillas, hiperparametros y checksums, orientado a agentes locales y a investigacion en una sola GPU de consumo. La ablacion reduce los rechazos de 100/100 a 2/100 con una divergencia KL de 0,0177, un edit muy ajustado que apenas altera el comportamiento en prompts benignos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida 3:1 (sliding-window de 512 y global), puertas de atencion sigmoideas por cabeza, QKV fusionado y embeddings atados |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 en el repo principal; GGUF con 14 cuantizaciones (Q2_K a Q8_0, IQ3_S, IQ4_XS) en repo separado |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards de 4,97 GB y 3,25 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas que alterna en patron 3:1 capas de atencion de ventana deslizante de 512 tokens con capas de atencion global, lo que permite manejar contexto muy largo con un coste computacional contenido. Incorpora puertas de atencion sigmoideas por cabeza, proyeccion QKV fusionada y embeddings atados entre entrada y salida. La ventana de contexto alcanza 1.048.576 tokens. El checkpoint incluye codigo personalizado (`trust_remote_code`), por lo que requiere transformers >= 5.

Sobre el entrenamiento del modelo base no se dispone de detalles en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si esta documentado es el post-procesado de esta variante: Heretic v2.0.0.dev0 con el modificador ARA aplica un edit de bajo rango (LoRA de rango 50, con preservacion de magnitudes de fila y ablacion ortogonal) sobre las proyecciones de salida de atencion (`out_proj`) y las proyecciones down del MLP de las capas 9 a 19. El edit se fusiona en los pesos BF16 al exportar. Los hiperparametros del trial 46 (semilla `2026102902`) incluyen `preserve_good_behavior_weight` 0,8871, `steer_bad_behavior_weight` 0,0004, `overcorrect_relative_weight` 0,9891 y `neighbor_count` 4. El directorio `reproduce/` del repo contiene la receta completa (config.toml, requirements, journal de Optuna, reproduce.json y sumas SHA-256) para regenerar el modelo exacto.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo thinking controlable: sin thinking, bajo o alto presupuesto de tokens.
- Generacion de codigo y tareas de programacion, orientado por el autor a coding y seguridad.
- Tool calling / function calling mediante el formato `<tool_call>` y plantilla de chat estilo DeepSeek.
- Uso agentico y razonamiento multi-paso, con soporte de agentes locales.
- Contexto largo de hasta 1.048.576 tokens para documentos extensos y conversaciones multi-turno prolongadas.
- Ejecucion on-device en una sola GPU de consumo o portatil.
- Comportamiento de rechazo suprimido (abliterated): no anade capacidades, solo elimina negativas.

## Casos de uso

- Agentes locales de codigo: el modelo puede integrarse en un IDE o CLI que invoque herramientas mediante `<tool_call>` para leer ficheros, ejecutar tests y aplicar parches, aprovechando su contexto de 1M tokens para mantener el estado de un repositorio mediano en memoria.
- Analisis de repositorios completos: con 1.048.576 tokens de ventana se pueden cargar varios ficheros y su historial de cambios en una sola pasada para tareas de revision, busqueda de vulnerabilidades o explicacion de arquitectura.
- Asistente de seguridad ofensiva y auditoria: la ablacion elimina los rechazos, lo que lo hace util para investigacion en seguridad, analisis de malware o red teaming en entornos controlados, sin que el modelo se niegue a analizar codigo potencialmente peligroso.
- Automatizacion de atencion al cliente multi-turno: su contexto largo permite mantener historiales de conversacion extensos y recuperar informacion de manuales o bases de conocimiento inyectadas en el prompt.
- Procesamiento de documentos largos en local: resumen, extraccion de entidades y preguntas sobre contratos, informes o transcripciones de cientos de miles de tokens sin enviar datos a la nube, gracias a su despliegue on-device.
- Pipelines de CI/CD con tool calling: el modelo puede actuar como agente que interpreta fallos de build, consulta logs y propone correcciones invocando herramientas del pipeline, con cuantizacion Q4_K_M para caber en GPUs modestas.
- Prototipado e investigacion reproducible: el directorio `reproduce/` permite regenerar exactamente el modelo, lo que facilita experimentos academicos sobre ablacion y alineacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de ablacion de Heretic, no benchmarks de capacidad.

| Metrica | Este modelo | Modelo original (XHToken/Spark-X2.6-4B) |
|---|---|---|
| Divergencia KL (first-token, harmless_alpaca test[:100]) | 0,0177 | 0 (por definicion) |
| Rechazos (harmful_behaviors test[:100]) | 2/100 | 100/100 |

Prueba de thinking on/off sobre los primeros 40 prompts reservados de `harmful_behaviors` con decodificacion greedy:

| Modo | Rechazos |
|---|---|
| `enable_thinking=False` (150 tokens nuevos) | 0/40 |
| `enable_thinking=True` (1.200 tokens nuevos) | 0/22 que terminaron el razonamiento (18 seguian pensando al alcanzar el limite) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,2 GB de pesos mas overhead de activaciones y cache KV; con contexto de 1M tokens la cache KV crece de forma significativa y puede superar la VRAM de GPUs de consumo.
- Cuantizaciones GGUF: desde Q2_K hasta Q8_0 e IQ3_S/IQ4_XS, lo que permite bajar de unos 2 GB (Q2_K) a unos 4,5 GB (Q8_0) aproximadamente, segun el tamano de cada quant publicado en el repo GGUF.
- GPU recomendadas: RTX 4090 (24 GB) o superior para BF16 con contexto largo; A100/H100 para despliegues con contexto completo de 1M tokens y concurrencia. En GPUs de 8-12 GB es viable con cuantizaciones Q4_K_M o inferiores y contextos reducidos.
- Cabe en GPU de consumo: si, con cuantizacion GGUF y ventana de contexto moderada; en BF16 cabe en GPUs de 12 GB o mas para contextos cortos.
- Opciones de despliegue: transformers >= 5 con `trust_remote_code=True`; llama.cpp con soporte `spark2_5` mediante `llama-server`; el repo GGUF esta probado en `llama-server` con thinking on/off y tool calls. No se confirma soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

Ejemplo de despliegue con llama.cpp:

```bash
llama-server -hf FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF:Q4_K_M --jinja -ngl 99 -fa on
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-abliterated (este) | 4,11B | 1.048.576 | Apache 2.0 | Variante abliterated, tool calling, thinking controlable, on-device |
| XHToken/Spark-X2.6-4B | 4,11B | 1.048.576 | Apache 2.0 | Modelo base original, con rechazos intactos |
| Alternativas de ~4B con tool calling | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de capacidad que permitan una comparacion cuantitativa con otros modelos de tamano similar.

## Limitaciones y advertencias

- La ablacion suprime los rechazos pero no anade capacidad: el rendimiento en tareas benignas es el del modelo base, y puede degradarse ligeramente en prompts que dependian de la alineacion original.
- Riesgo elevado de generar contenido danino, ilegal o inseguro sin filtros: no debe desplegarse en produccion orientada al publico sin una capa de moderacion externa.
- Riesgo de alucinacion propio de un modelo de 4B; no se han publicado evaluaciones de factualidad.
- Idiomas limitados a ingles y chino; el castellano no esta declarado como soportado.
- El contexto de 1M tokens implica un coste de cache KV muy alto; en la practica, contextos tan largos pueden no caber en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador.
- Requiere transformers >= 5 y `trust_remote_code=True`; el codigo personalizado del checkpoint debe auditarse antes de ejecutarlo en entornos sensibles.
- Las cuantizaciones GGUF requieren una build de llama.cpp con soporte `spark2_5`, no disponible en versiones estandar.
- El modo thinking puede consumir muchos tokens (se observaron 18 de 40 prompts sin terminar el razonamiento en 1.200 tokens), lo que afecta a latencia y coste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Cuantizaciones GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- Perfil del autor: https://huggingface.co/xblack
- Apoyo al autor: https://buymeacoffee.com/vatsalbajpai
