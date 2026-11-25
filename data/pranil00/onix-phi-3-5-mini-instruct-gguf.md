# pranil00/ONIX-Phi-3.5-mini-instruct-GGUF

## Resumen

ONIX-Phi-3.5-mini-instruct-GGUF es una cuantizacion en formato GGUF del modelo microsoft/Phi-3.5-mini-instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo consiste en convertir los pesos originales de Microsoft a precision Q5_K_M (5,5 bits por peso) para reducir el peso en disco de 7,47 GB a 2,57 GB, manteniendo, segun el autor, en torno al 97,5 % de la calidad del modelo en FP16.

El modelo base Phi-3.5-mini-instruct es un transformer denso de 3.821.076.480 parametros (3,82 mil millones) desarrollado por Microsoft, disenado para instrucciones, razonamiento y generacion de codigo, con una ventana de contexto de 128.000 tokens en su version original. Esta cuantizacion conserva la arquitectura y el tokenizador del original; solo cambia la representacion numerica de los pesos.

La relevancia de esta ficha es practica: permite ejecutar un modelo de casi 4 mil millones de parametros en hardware de consumo (Apple Silicon con 4,13 GB de memoria unificada, GPUs NVIDIA con 4,07 GB de VRAM, o CPU con 6,13 GB de RAM) mediante llama.cpp, Ollama, LM Studio o el runner propio run-any-model. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto de baja difusion y sin validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi), segun el modelo base microsoft/Phi-3.5-mini-instruct |
| Parametros totales | 3.821.076.480 (3,82 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el autor documenta ventanas optimas de 8.192 tokens (GPU/Apple Silicon) y 4.096 tokens (CPU) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero microsoft--Phi-3.5-mini-instruct-Q5_K_M.gguf, 2,57 GB) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion de pesos. La arquitectura subyacente es la del Phi-3.5-mini-instruct de Microsoft, un transformer denso decoder-only de 3,82 mil millones de parametros. La model card de esta cuantizacion no aporta detalles sobre el dataset de entrenamiento original (numero de tokens, composicion, fases de RLHF/DPO o SFT), por lo que esos datos deben consultarse en la model card oficial de microsoft/Phi-3.5-mini-instruct.

La innovacion tecnica de este artefacto es la cuantizacion Q5_K_M realizada con el motor run-any-model, un optimizador device-aware que el autor describe como adaptativo al hardware. Segun la telemetria incluida en la model card, la conversion reduce el peso de 7,47 GB (FP16) a 2,57 GB (ratio de compresion 2,91x, 65,6 % de reduccion), mantiene el KV cache en FP16 (1.536 MB) y logra que las 32 capas se aceleren en Metal en un host Darwin con 16 GB de memoria. La memoria residente total pasa de 9,03 GB a 4,13 GB (-54,3 %). No se documenta ninguna modificacion arquitectonica adicional (no hay atencion lineal, decodificacion especulativa ni cambios en el tokenizador).

## Capacidades

- Generacion de texto e instrucciones: alineada para seguir instrucciones conversacionales, heredada del Phi-3.5-mini-instruct.
- Razonamiento y matematicas: el modelo base esta disenado para tareas de razonamiento de varios pasos y problemas matematicos de nivel escolar y universitario basico.
- Generacion de codigo: soporta sintesis y explicacion de codigo en lenguajes habituales, segun las capacidades del modelo base.
- Contexto largo: el modelo original admite hasta 128.000 tokens; esta cuantizacion documenta ventanas operativas de 8.192 tokens en GPU y Apple Silicon y 4.096 en CPU.
- Conversacion multi-turno: el formato de chat usa los tokens especiales `<|im_end|>` y `<|endoftext|>` como paradas, tal como se refleja en el Modelfile de ejemplo para Ollama.
- Ejecucion local multiplataforma: compatible con llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI, con aceleracion Metal, CUDA y extensiones AVX2/AVX-512.
- Tool calling y function calling: no documentado en esta model card; debe verificarse contra el modelo base.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es solo texto.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de terminal para desarrollo: cargar el GGUF con `llama-cli -m ... -c 4096 -ngl 99 -cnv` o con `run-any-model run` para disponer de un chat local sin conexion, util en entornos con requisitos de privacidad o sin acceso a APIs externas.
- Prototipado rapido en portatiles de gama media: con 4,13 GB de memoria unificada en Apple Silicon o 4,07 GB de VRAM en GPU NVIDIA, el modelo cabe en equipos consumer y permite iterar en prompts y flujos conversacionales sin coste por token.
- Generacion de codigo en local para tareas acotadas: autocompletado, explicacion de fragmentos y generacion de tests en editores integrados con LM Studio o Jan, aprovechando la ventana de 8.192 tokens para incluir varios ficheros de contexto.
- Procesamiento por lotes en CPU: con 6,13 GB de RAM libre y soporte AVX2/AVX-512, se pueden ejecutar tareas de resumen, clasificacion o extraccion sobre documentos de hasta 4.096 tokens en servidores sin GPU.
- Educacion y experimentacion: el tamano reducido y la licencia Apache 2.0 facilitan su uso en cursos, talleres y laboratorios donde se ensenan tecnicas de cuantizacion, inferencia local y evaluacion de modelos.
- Chatbot embebido en aplicaciones de escritorio: distribuir el fichero de 2,57 GB junto a una aplicacion que use llama.cpp como backend permite ofrecer asistencia conversacional offline sin depender de infraestructura cloud.
- Base para comparativas de cuantizacion: sirve como referencia Q5_K_M frente a otras precisiones del mismo modelo base para medir la perdida de calidad en tareas concretas del dominio propio.

## Benchmarks y rendimiento

La model card incluye una matriz de telemetria de cuantizacion, no benchmarks de calidad de tareas. Se reproduce a continuacion tal como aparece en la informacion disponible:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 7,47 GB | 2,57 GB | -65,6 % |
| KV cache | 1.536 MB | 1.536 MB | Optimizado |
| RAM residente total | 9,03 GB | 4,13 GB | -54,3 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 32/32 | Optimo |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La cifra de "97,5 % de retencion de calidad" es una estimacion del autor y no un resultado medido con un conjunto de evaluacion estandar.

## Requisitos de hardware

- VRAM estimada: 4,07 GB de VRAM dedicada en GPUs NVIDIA RTX 30/40/50 con aceleracion CUDA, para una ventana de 8.192 tokens.
- Memoria unificada en Apple Silicon: 4,13 GB en chips M1/M2/M3/M4/M5 con Metal, para 8.192 tokens.
- CPU: 6,13 GB de RAM libre en Windows/Linux con AVX2 o AVX-512, para una ventana de 4.096 tokens.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 5-6 GB de VRAM efectiva (RTX 3060 12 GB, RTX 4060, RTX 4070, etc.). Tambien en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (via Modelfile), LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model del autor.
- Latencia y throughput: no disponibles. La model card solo indica que las 32 capas se aceleran en Metal y que la ejecucion en CUDA es nativa, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Phi-3.5-mini-instruct-GGUF (esta ficha) | 3,82 mil millones | 128k en base; 8.192 documentado | GGUF Q5_K_M, 2,57 GB | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/Phi-3.5-mini-instruct (original) | 3,82 mil millones | 128.000 tokens | Safetensors FP16, ~7,5 GB | MIT | Hugging Face, ampliamente difundido |
| Otras cuantizaciones GGUF de Phi-3.5-mini (p. ej. bartowski, lmstudio-community) | 3,82 mil millones | 128.000 tokens | GGUF en varias precisiones (Q4_K_M, Q5_K_M, Q8_0, etc.) | MIT / Apache 2.0 segun artefacto | Hugging Face, con descargas y validacion comunitaria |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Safetensors, GGUF disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks de tareas publicados para esta cuantizacion. Frente a otras conversiones GGUF del mismo modelo base, la diferencia principal es la ausencia de traccion (0 descargas) y la dependencia del runner propietario del autor para reproducir la telemetria.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: Q5_K_M introduce una degradacion estimada del 2,5 % respecto a FP16; en tareas sensibles (matematicas, codigo, razonamiento largo) la perdida puede ser mayor y no esta medida con benchmarks estandar.
- Ventana de contexto efectiva reducida: aunque el modelo base soporta 128.000 tokens, esta cuantizacion solo documenta 8.192 tokens en GPU y 4.096 en CPU; usar contextos mayores puede degradar la calidad o agotar memoria por el KV cache.
- Sesgos: no documentados en esta model card; deben evaluarse contra el modelo base, que puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; un modelo de 3,8 mil millones de parametros tiene mayor propension a inventar hechos que modelos de mayor tamano, especialmente en dominios especializados.
- Idiomas: la model card no declara idiomas soportados; el modelo base esta optimizado principalmente para ingles y su rendimiento en castellano no esta verificado.
- Tool calling y agentes: no documentados para esta cuantizacion; verificar contra el modelo base antes de usarlo en pipelines de agentes.
- Licencia: Apache 2.0 permite uso comercial, pero el autor anade un descargo de responsabilidad absoluta sobre los outputs; el implementador asume toda la responsabilidad de auditar y validar las salidas.
- Madurez del artefacto: 0 descargas, 0 likes y publicacion reciente; no hay validacion independiente de la telemetria ni del proceso de cuantizacion.
- Dependencia del runner: las cifras de rendimiento y la categoria "EXCELLENT (Native Fit)" provienen de la herramienta run-any-model del propio autor, no de una evaluacion de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phi-3.5-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Organizacion ONIX: https://huggingface.co/ONIX
- Runner run-any-model: https://github.com/PranilShah-08/run-any-model
