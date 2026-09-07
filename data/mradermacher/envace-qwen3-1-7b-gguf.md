# mradermacher/EnvACE-Qwen3-1.7B-GGUF

## Resumen

EnvACE-Qwen3-1.7B-GGUF es una cuantización GGUF del modelo Team-ACE/EnvACE-Qwen3-1.7B, desarrollado por el equipo Team-ACE. El modelo original está entrenado con aprendizaje por refuerzo (reinforcement learning) y está diseñado para tareas de agente, uso de herramientas (tool use), llamadas a funciones (function calling) y modelado del mundo (world model). Esta versión cuantizada, publicada por mradermacher, tiene como objetivo facilitar la ejecución del modelo en hardware de consumo y en entornos de producción mediante el formato GGUF, compatible con motores de inferencia como llama.cpp y Ollama.

El modelo cuenta con 2.031.739.904 parámetros totales, según los datos de los safetensors del repositorio. El repositorio incluye múltiples niveles de cuantización, desde Q2_K hasta f16, lo que permite adaptar el consumo de memoria a diferentes GPUs y requisitos de calidad. El modelo está licenciado bajo Apache 2.0 y soporta únicamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo. El nombre del modelo base, EnvACE-Qwen3-1.7B, sugiere que está basado en la familia Qwen3 de 1.7B, que utiliza una arquitectura Transformer, pero no se confirma en los datos proporcionados. El modelo fue entrenado con un pipeline de reinforcement learning, según los metadatos de Hugging Face, y los tags asociados indican que está orientado a agentes, tool use, function calling y world model. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO.

Esta versión en concreto es una cuantización estática del modelo original, realizada por mradermacher. No implica un reentrenamiento, sino una conversión de los pesos a formato GGUF con distintos niveles de precisión para reducir el tamaño del archivo y los requisitos de memoria en tiempo de inferencia.

## Capacidades

- Generacion de texto en ingles.
- Soporte de tool calling y function calling, segun los tags del modelo.
- Entrenado con reinforcement learning para interaccionar con entornos y actuar como agente.
- Capacidades de modelado del mundo (world model), lo que permite razonar sobre estados y transiciones en entornos simulados.
- Soporte de agentes y razonamiento multi-paso, segun los tags.
- No se especifican capacidades de vision, audio ni otros modos multimodales.

## Casos de uso

- Agentes autonomos para automatizacion de tareas: el modelo puede integrarse en sistemas que requieren llamadas a funciones y uso de herramientas para completar tareas de forma autonoma, como gestion de APIs o ejecucion de comandos.
- Asistentes conversacionales con soporte de funciones: adecuado para chatbots que necesitan consultar bases de datos o llamar a servicios externos durante una conversacion.
- Razonamiento multi-paso en entornos simulados: gracias a su entrenamiento con reinforcement learning y su enfoque de world model, puede utilizarse en simulaciones de agentes que deben planificar acciones y observar resultados.
- Investigacion en aprendizaje por refuerzo: util como modelo base para experimentos de RL, especialmente en entornos donde se necesita un agente que aprenda a usar herramientas.
- Integracion en pipelines de CI/CD para generacion de codigo: aunque no se confirma su capacidad de generacion de codigo, su soporte de tool calling permite integrarlo en flujos que invocan funciones o herramientas de desarrollo.
- Prototipado de agentes en hardware de consumo: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs modestas, lo que facilita el desarrollo y pruebas de agentes en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del quant elegido. Los archivos mas pequenos (Q2_K, 1.0 GB) pueden ejecutarse con 2 GB de VRAM o menos. Los quants recomendados (Q4_K_S, 1.3 GB; Q4_K_M, 1.4 GB) requieren aproximadamente 2-3 GB de VRAM. El quant Q8_0 (2.3 GB) necesita alrededor de 3-4 GB, y el f16 (4.2 GB) unos 6 GB.
- GPU recomendadas: RTX 3050, RTX 4060, o cualquier GPU con al menos 4 GB de VRAM para los quants mas usados. Para el f16 se recomienda una GPU con 8 GB o mas.
- Si cabe en consumer GPU: si, los quants Q2_K, Q3_K_S, Q4_K_S, Q4_K_M y Q5_K_S caben en GPUs de consumo de gama baja (2-4 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF. El modelo base puede usarse con Transformers (Hugging Face).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Team-ACE/EnvACE-Qwen3-1.7B (base) | 2.031.739.904 | no disponible | Apache 2.0 | safetensors |
| mradermacher/EnvACE-Qwen3-1.7B-GGUF | 2.031.739.904 | no disponible | Apache 2.0 | GGUF |
| mradermacher/EnvScaler-Qwen3-1.7B-GGUF | no disponible | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento comparables entre estos modelos. El modelo EnvScaler-Qwen3-1.7B-GGUF aparece en los resultados de busqueda como un modelo similar de la misma familia, pero no se aportan especificaciones concretas.

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles, segun los metadatos.
- No se han publicado evaluaciones de sesgos, seguridad o alucinaciones.
- Al estar entrenado con reinforcement learning, el comportamiento puede ser impredecible en entornos no contemplados durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede tener limitaciones en tareas fuera de su dominio de entrenamiento (agentes y tool use).
- No se especifica la longitud de contexto, lo que limita la planificacion de aplicaciones que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/EnvACE-Qwen3-1.7B-GGUF
- Modelo base: https://huggingface.co/Team-ACE/EnvACE-Qwen3-1.7B
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo similar: https://huggingface.co/mradermacher/EnvScaler-Qwen3-1.7B-GGUF
