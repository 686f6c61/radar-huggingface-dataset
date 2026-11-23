# RolBolSystems/RolBol-Code-11B-GGUF

## Resumen

RolBol Code 11B es un modelo de generación de texto especializado en código, desarrollado por RolBol Systems. Se distribuye en este repositorio como binarios cuantizados en formato GGUF, derivados del modelo base `RolBolSystems/RolBol-Code-11B-Instruct`. El modelo está pensado para ejecución local en entornos de ingeniería y programación de sistemas, con integración directa en Ollama, llama.cpp, LM Studio y vLLM.

Según la model card, la arquitectura parte de una base Qwen2.5 a la que se ha aplicado un proceso de "depth-upscaling": se ha pasado de 36 a 48 capas Transformer, lo que eleva el total a 12.276.772.352 parámetros (12,28B). Mantiene una longitud de contexto nativa de 32.768 tokens con RoPE theta de 1.000.000.

La relevancia de esta ficha radica en que el repositorio ofrece pesos ya cuantizados (Q4_K_M, aproximadamente 6,9 GB) listos para desplegar en hardware de consumo, con licencia Apache 2.0 que permite uso comercial y de investigación. No obstante, la información publicada por el autor es limitada: no se detallan composición del dataset de entrenamiento, resultados de benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 48 capas (depth-upscaled desde Qwen2.5 de 36 capas) |
| Parametros totales | 12.276.772.352 (12,28B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (RoPE theta 1.000.000) |
| Tipos de cuantizacion | Q4_K_M (k-quants medium, ~6,9 GB); el resto de variantes no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 48 capas. Según la model card, la arquitectura se obtuvo mediante depth-upscaling a partir de una base Qwen2.5 de 36 capas, ampliando la profundidad de la red hasta las 48 capas y alcanzando los 12,28B parámetros. Emplea RoPE con theta de 1.000.000, lo que sostiene la ventana de contexto nativa de 32.768 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras técnicas de alineación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card se centra en el uso práctico del modelo cuantizado (plantillas de chat con formato ChatML, parámetros de muestreo recomendados: temperature 0.6, top_p 0.85, top_k 40) más que en los detalles del proceso de entrenamiento.

## Capacidades

- Generación de código en lenguajes de sistemas y backend de producción (la model card menciona Rust, C/C++ y entornos Linux/DevOps como foco principal).
- Razonamiento técnico y resolución autónoma de problemas de ingeniería ("autonomous problem solving" según el autor).
- Generación de texto conversacional con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de instrucciones de sistema (rol de sistema en la plantilla de chat).
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible en la información publicada.
- Modo thinking, visión o audio: no disponible en la información publicada.

## Casos de uso

- Generación de código de sistemas en Rust y C/C++: el modelo está orientado explícitamente a este dominio según la model card; se usaría para escribir estructuras de datos, gestión de memoria y código de bajo nivel, con la ventana de 32.768 tokens para incluir ficheros completos en el contexto.
- Asistencia en backend de producción: generación de endpoints, lógica de negocio y refactorizaciones en pipelines de desarrollo, ejecutando el modelo localmente vía Ollama o llama.cpp para evitar enviar código propietario a servicios externos.
- Automatización de tareas DevOps y administración Linux: generación de scripts de shell, ficheros de configuración y comandos de diagnóstico, aprovechando el foco declarado del modelo en entornos técnicos Linux/DevOps.
- Asistente de código integrado en el IDE: despliegue local con llama.cpp o LM Studio para autocompletado y explicación de código sin dependencia de la nube, con la cuantización Q4_K_M (~6,9 GB) como opción para estaciones de trabajo con GPU de consumo.
- Revisión y explicación de código existente: dado el contexto de 32.768 tokens, puede procesar módulos completos y responder preguntas sobre su funcionamiento o detectar problemas.
- Prototipado rápido de utilidades y scripts: generación de código desechable o de herramientas internas en entornos de investigación donde se requiere ejecución local y licencia permisiva (Apache 2.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M (~6,9 GB de pesos), se requiere aproximadamente 7-9 GB de VRAM para cargar el modelo completo en GPU, más el espacio para el contexto KV (crece con los 32.768 tokens de ventana).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten cargar el modelo con contexto amplio; GPUs de 8-12 GB pueden ejecutar la cuantización Q4_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en GPUs de 8 GB o más (con margen limitado para contexto), y con holgura en GPUs de 16-24 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/RolBolSystems/RolBol-Code-11B-GGUF:RolBol-Code-11B-Instruct-Q4_K_M.gguf`), llama.cpp (`llama-cli` con `-ngl 99`), LM Studio y vLLM (según la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol Code 11B (GGUF) | 12,28B | 32.768 | Apache 2.0 | GGUF | Depth-upscaled desde Qwen2.5; benchmarks no publicados |
| Qwen2.5-Coder-14B | 14B (aprox.) | 32.768 (128K en variantes) | Apache 2.0 | safetensors, GGUF | Referencia en código; benchmarks públicos |
| DeepSeek-Coder-V2-Lite | 16B MoE (2,4B activos) | 128K | Licencia propia | safetensors, GGUF | MoE eficiente en inferencia |
| CodeLlama-13B | 13B | 16K | Licencia Llama | safetensors, GGUF | Base de código, sin benchmarks recientes destacados |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta búsqueda; verificar en sus respectivas model cards.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa del rendimiento del modelo frente a alternativas consolidadas, lo que dificulta evaluar su calidad real.
- El proceso de "depth-upscaling" desde Qwen2.5 no está documentado en detalle (método de inicialización de las capas nuevas, datos de recuperación tras el upscaling), lo que añade incertidumbre sobre la degradación respecto al modelo base.
- Idiomas soportados no declarados; no se puede asumir un buen rendimiento multilingüe.
- Riesgo de alucinación en código: sin datos de evaluación, no se puede descartar la generación de APIs o funciones inexistentes.
- Sesgos: no documentados por el autor.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las obligaciones de atribución.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación prácticamente inexistente; tratar como modelo experimental para producción.
- La fecha de creación del repositorio (2026-11-22) y la escasa documentación técnica requieren verificación independiente antes de adoptarlo en entornos críticos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/RolBolSystems/RolBol-Code-11B-GGUF
- Modelo base (Instruct): https://huggingface.co/RolBolSystems/RolBol-Code-11B-Instruct
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- vLLM: https://github.com/vllm-project/vllm
