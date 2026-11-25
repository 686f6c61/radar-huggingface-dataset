# pranil00/ONIX-internlm2_5-20b-chat-GGUF

## Resumen

ONIX-internlm2_5-20b-chat-GGUF es una cuantización GGUF del modelo InternLM 2.5 20B Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base, desarrollado por Shanghai AI Laboratory (InternLM), es un transformer decoder-only de 19.861.143.552 parámetros (aproximadamente 19,86 mil millones) orientado a generación de texto conversacional. Esta versión concreta aplica una cuantización Q4_K_M (4,5 bits por peso) que reduce el tamaño de los pesos de 38,84 GB en FP16 a 10,92 GB, con una ratio de compresión de 3,56x y una retención de calidad declarada del 95 % respecto al modelo sin cuantizar.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 20B parámetros en hardware de consumo: el autor declara compatibilidad nativa con Apple Silicon desde 11,79 GB de memoria unificada, GPUs NVIDIA con 12,42 GB de VRAM y equipos de sobremesa con 13,79 GB de RAM libre. El artefacto se distribuye como un único fichero GGUF y se integra con llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.

Conviene señalar que el repositorio no incluye información sobre idiomas soportados, benchmarks comparativos ni detalles del proceso de cuantización más allá de la matriz de telemetría del runner `run-any-model`. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia InternLM 2.5) |
| Parametros totales | 19.861.143.552 (19,86 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo; el autor recomienda ventanas de 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q4_K_M (4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `internlm--internlm2_5-20b-chat-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia InternLM 2.5, con 19,86 mil millones de parámetros. El repositorio no aporta detalles sobre la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO; esa información corresponde a la model card del modelo original de InternLM, que no se ha incluido en la documentación proporcionada.

La innovación técnica de esta publicación es la cuantización Q4_K_M realizada con el motor `run-any-model`, que según el autor aplica una optimización adaptativa al dispositivo. La matriz de telemetría reporta una reducción del 71,9 % en el tamaño de pesos (de 38,84 GB a 10,92 GB), un búfer de KV cache de 768 MB en FP16 y una aceleración del 100 % de las 48 capas en Metal. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base InternLM 2.5 20B Chat.
- Soporte de chat con plantilla de turnos basada en tokens especiales `<|im_end|>` y `<|endoftext|>` (visibles en los parámetros de parada del Modelfile de Ollama).
- Ejecución local en CPU, GPU NVIDIA (CUDA) y Apple Silicon (Metal) gracias al formato GGUF.
- Integración con ecosistemas de inferencia local: llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Capacidades de tool calling, agentes, matemáticas, código o visión: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Asistente conversacional local en portátil Apple Silicon: con 11,79 GB de memoria unificada y una ventana de 8.192 tokens, el modelo puede mantener conversaciones multi-turno en un MacBook con M1/M2/M3 sin salir del dispositivo.
- Chatbot de sobremesa sin GPU dedicada: en un PC con 13,79 GB de RAM libre y soporte AVX2/AVX-512, se puede servir con llama.cpp a 4.096 tokens de contexto para tareas de asistencia general.
- Prototipado rápido de aplicaciones LLM: al ser un único fichero GGUF, se carga directamente en LM Studio o Jan para validar prompts y flujos antes de invertir en infraestructura.
- Despliegue en estaciones de trabajo con RTX 30/40/50: con 12,42 GB de VRAM, encaja en GPUs de gama alta de consumo para servir una API interna de generación de texto.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite procesar texto sensible sin enviar datos a servicios en la nube.
- Evaluación comparativa de cuantizaciones: sirve como referencia Q4_K_M frente al modelo FP16 para medir la degradación de calidad en tareas concretas del flujo de trabajo del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente incluye una matriz de telemetría del runner que mide tamaño de pesos, uso de memoria y retención de calidad estimada, no métricas de calidad por tarea (MMLU, HumanEval, GSM8K u otras).

| Metrica | Baseline (FP16) | Cuantizado (Q4_K_M) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 4,5 bits/param | -71,9 % |
| Tamano de pesos | 38,84 GB | 10,92 GB | -71,9 % |
| KV cache | 768 MB (FP16) | 768 MB (FP16) | Optimizado |
| RAM residente total | 39,71 GB | 11,79 GB | -70,3 % |
| Calidad estimada | 100 % | 95 % | -5,0 % |
| Capas aceleradas | 0 % | 48/48 | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada: 11,79 GB de memoria unificada en Apple Silicon; 12,42 GB de VRAM dedicada en NVIDIA; 13,79 GB de RAM libre en CPU x86.
- GPU recomendadas: RTX 30/40/50 series con al menos 12,42 GB de VRAM; no se especifican modelos concretos (RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100) más allá de la familia.
- Cabe en GPU de consumo: sí, según el autor, en GPUs NVIDIA con 12,42 GB o más de VRAM y en Apple Silicon desde 11,79 GB de memoria unificada.
- Opciones de despliegue: `run-any-model` CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli` con `-ngl 99`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. El autor solo indica aceleración nativa Metal y CUDA al 100 % de las capas, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-internlm2_5-20b-chat-GGUF (esta ficha) | 19,86 B | no disponible (recomendado 8.192 en GPU) | Apache 2.0 | GGUF Q4_K_M | Hugging Face (pranil00) |
| internlm/internlm2_5-20b-chat (base) | 19,86 B | no disponible en esta ficha | Apache 2.0 | safetensors | Hugging Face (InternLM) |
| Alternativas de ~20B en GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La retención de calidad del 95 % es una estimación del propio autor, no una medición con benchmarks estándar; la degradación real en tareas específicas puede ser mayor.
- No se documentan idiomas soportados ni evaluación multilingüe; el rendimiento en castellano no está verificado.
- No se detalla el proceso de cuantización más allá de la matriz de telemetría, ni se ofrecen alternativas (Q5_K_M, Q8_0, etc.) en el repositorio.
- La model card incluye una cláusula de exención de responsabilidad total sobre los outputs generados; el implementador asume toda la responsabilidad de auditoría y validación.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se aportan datos específicos sobre tasas de alucinación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base InternLM por si añaden restricciones adicionales.
- La fecha de creación del repositorio (2026-11-25) y la referencia a Apple Silicon M5 en la tabla de hardware no se pueden contrastar con la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-internlm2_5-20b-chat-GGUF
- Modelo base: https://huggingface.co/internlm/internlm2_5-20b-chat
- Organización ONIX: https://huggingface.co/ONIX
- Repositorio del runner `run-any-model`: https://github.com/PranilShah-08/run-any-model
