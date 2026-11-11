# qvac/BotPsy-0.8B-GGUFs

## Resumen

BotPsy-0.8B-GGUFs es la distribución en formato GGUF del modelo BotPsy-0.8B, desarrollado por Tether AI Research (Tether Data, S.A. de C.V.) y publicado bajo el identificador qvac. Se trata de un modelo de lenguaje causal de aproximadamente 752 millones de parámetros, construido sobre la arquitectura de Qwen3.5-0.8B y especializado en *function calling* y flujos de trabajo agénticos. Su propuesta principal es ofrecer capacidades de tool calling en dispositivos de borde (smartphones, equipos con recursos limitados) sin dependencia de la nube.

El repositorio no contiene los pesos originales, sino tres exportaciones GGUF listas para llama.cpp y el QVAC SDK: una versión BF16 sin cuantizar (1,52 GB), una Q8_0 casi sin pérdida (0,81 GB) y una Q4_K_M calibrada con matriz de importancia (0,53 GB). Según el autor, en BF16 supera a todos los modelos de hasta 1.200 millones de parámetros que probaron en seis benchmarks de uso de herramientas y agentes.

Es relevante ahora porque demuestra que un modelo por debajo de los 1.000 millones de parámetros puede sostener tareas de invocación de funciones con una calidad competitiva, lo que abre la puerta a asistentes locales y agentes embebidos con licencia Apache 2.0 y sin coste de inferencia en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura Qwen3.5) |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (con calibracion imatrix) |
| Idiomas soportados | Ingles (recomendado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que hereda la arquitectura Qwen3.5-0.8B. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; únicamente se indica que BotPsy está afinado para function calling y flujos agénticos sobre la base Qwen3.5. El modelo se entrenó y evaluó en *thinking mode*, y la plantilla de chat embebida viene por defecto en modo no-thinking, por lo que es necesario activarlo explícitamente.

En la conversión a GGUF se excluyeron las capas de predicción multi-token (MTP) del modelo base. La cuantización Q4_K_M emplea calibración con matriz de importancia, lo que redujo la divergencia KL respecto al BF16 sobre texto retenido de 0,048 (Q4_K_M simple) a 0,036; la Q8_0 se sitúa en 0,001. La conversión y cuantización se realizaron con llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés.
- *Function calling* y *tool calling*: invocación estructurada de herramientas, eje central del entrenamiento.
- Flujos agénticos y razonamiento multi-paso, con modo de pensamiento (*thinking mode*) activable.
- Razonamiento de conocimiento general a nivel de modelo pequeño (MMLU-Pro ~46-49, GPQA Diamond ~35-39).
- Seguimiento de instrucciones con formatos y restricciones (IFEval ~91-93).
- Inferencia totalmente local en dispositivos de borde mediante llama.cpp y QVAC SDK.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otros modalidades.

## Casos de uso

- Asistentes locales en smartphone: el archivo Q4_K_M (0,53 GB) permite ejecutar un agente de invocación de funciones en el propio dispositivo con llama.cpp, sin enviar datos a la nube.
- Automatización de tareas del sistema operativo móvil: el modelo puede traducir lenguaje natural a llamadas de API (calendario, contactos, ajustes) gracias a su entrenamiento específico en tool calling.
- Agentes de atención al cliente en el borde: gestión de conversaciones multi-turno con invocación de herramientas de consulta (pedidos, estado de cuenta) en entornos con presupuesto de memoria reducido.
- Pipelines de CI/CD y automatización de desarrollo: integración como planificador de llamadas a funciones en scripts de build o despliegue, donde el bajo coste de inferencia y la licencia Apache 2.0 simplifican el despliegue.
- Enrutamiento de consultas y clasificación con acciones: uso del modelo para decidir qué herramienta o servicio invocar ante una petición del usuario, con latencia baja y sin GPU dedicada.
- Prototipado de agentes en investigación: banco de pruebas ligero para evaluar estrategias de razonamiento multi-paso y *thinking mode* en hardware de consumo.
- Aplicaciones de privacidad por diseño: procesamiento de datos sensibles en local (salud, finanzas personales) donde el envío a servidores externos no es viable.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes, mayor es mejor). Las ejecuciones GGUF se hicieron con `llama-server` (build CUDA b12169) sobre NVIDIA H100; la referencia BF16 con vLLM.

| Benchmark | BF16 vLLM | BF16 GGUF | Q8_0 | Q4_K_M (imatrix) |
|---|---:|---:|---:|---:|
| BFCL v4 | 44,0 | 44,6 | 44,2 | 43,5 |
| ACEBench | 58,7 | 58,8 | 58,0 | 57,3 |
| τ-bench | 51,5 | 47,5 | 48,6 | 46,7 |
| Claw-Eval | 46,5 | 43,4 | 44,0 | 42,1 |
| BrowseComp-Plus | 4,5 | 4,2 | 4,7 | 4,5 |
| GPQA Diamond | 38,0 | 39,2 | 38,2 | 35,3 |
| MMLU-Pro | 48,9 | 46,0 | 46,1 | 42,5 |
| IFEval | 90,8 | 92,6 | 93,2 | 93,3 |
| IFBench | 55,9 | 58,7 | 60,6 | 56,3 |
| Multi-IF | 67,2 | 69,4 | 69,7 | 67,6 |
| Media (10 benchmarks) | 50,6 | 50,4 | 50,7 | 48,9 |

Hallazgos del autor: Q8_0 iguala al BF16 GGUF con la mitad de tamaño; Q4_K_M pierde unos 1,5 puntos de media, concentrados en conocimiento (MMLU-Pro −3,5 y GPQA Diamond −3,9 frente al BF16 GGUF); el motor de inferencia introduce más variación que la cuantización (τ-bench −4,0, Claw-Eval −3,1 entre vLLM y llama.cpp con los mismos pesos). No se ejecutó ToolSandbox sobre los GGUF.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB para BF16 (1,52 GB de pesos), ~1 GB para Q8_0 y ~0,6 GB para Q4_K_M, más overhead de contexto KV.
- GPU recomendadas para producción: NVIDIA H100 o A100 si se busca throughput alto; el modelo es sobradamente pequeño para cualquier GPU moderna.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2-4 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU.
- Despliegue: llama.cpp (`llama-server`), QVAC SDK; también viable vía Ollama u otros frontends compatibles con GGUF.
- Latencia y throughput: no disponibles de forma explícita; el tamaño reducido y la cuantización Q4_K_M apuntan a inferencia en tiempo real en hardware de borde, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| BotPsy-0.8B-GGUFs | ~0,75B | no disponible | Especializado (BFCL v4 44,2 en Q8_0) | Apache 2.0 | GGUF |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generico | no disponible en esta ficha | safetensors/GGUF |
| Modelos hasta 1,2B probados por el autor | ≤1,2B | no disponible | Variable | Variable | Variable |

El autor afirma que BotPsy-0.8B en BF16 supera a todos los modelos de hasta 1.200 millones de parámetros evaluados en sus seis benchmarks de tool use, pero no se listan los modelos concretos ni sus puntuaciones en la información disponible, por lo que no es posible una comparación numérica directa.

## Limitaciones y advertencias

- Modelo pequeño: comete errores y está pensado para tareas de dificultad baja a media, según el propio autor.
- Idiomas: solo inglés recomendado; el rendimiento en castellano no está garantizado ni evaluado.
- Conocimiento limitado: MMLU-Pro ~46 y GPQA Diamond ~35-39 indican una base de conocimiento estrecha; riesgo elevado de alucinación en preguntas factuales.
- Modo de pensamiento: la plantilla por defecto es no-thinking; usar el modelo sin activarlo puede degradar los resultados frente a los benchmarks publicados.
- Cuantización Q4_K_M: pierde aproximadamente 1,5 puntos de media y hasta casi 4 puntos en benchmarks de conocimiento; para máxima fidelidad usar Q8_0.
- Capas MTP excluidas: no se incluye la predicción multi-token del modelo base, lo que puede afectar a optimizaciones que dependan de ella.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.5.
- Sin datos de contexto máximo publicados: planificar el despliegue asumiendo un contexto limitado y validar el comportamiento en conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qvac/BotPsy-0.8B-GGUFs
- Modelo fuente BF16: https://huggingface.co/qvac/BotPsy-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post: https://huggingface.co/blog/qvac/botpsy
- Colección BotPsy: https://huggingface.co/collections/qvac/botpsy
- Licencia: https://huggingface.co/qvac/BotPsy-0.8B-GGUFs/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- QVAC SDK: https://qvac.tether.io/dev/sdk/
- Tether AI Research: https://tether.io/
