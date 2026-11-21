# moonbox-dev/Inkling-2-Mini-MLX

## Resumen

Inkling-2-Mini-MLX es una conversión a formato MLX del modelo Inkling 2 Mini, desarrollado originalmente por Thinking Machines y adaptado por moonbox-dev para su ejecución nativa en Apple Silicon. Se trata de un modelo de generación de texto con arquitectura Mixture-of-Experts (MoE) y transformer con bucles (looped transformer), empaquetado en precisión de 8 bits para su uso con el framework MLX de Apple. El repositorio ocupa 20,8 GB e incluye pesos en safetensors divididos por capas, junto con scripts de generación y configuración específicos para MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo de Apple (chips M-series) sin necesidad de GPUs dedicadas, algo que no es posible con los pesos originales en PyTorch. La conversión incluye verificaciones de fidelidad frente al modelo original: divergencia KL de 0,0047 nats (p95 0,017), acuerdo top-1 del 97,5 % y perplejidad de 4,735 frente a 4,724 del original, lo que indica una degradación mínima por la cuantización a 8 bits.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto ni los idiomas soportados en la documentación proporcionada. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el modelo base es thinkingmachines/Inkling-2-Mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con looped transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); tags mencionan nvfp4 y mxfp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, dividido por capas) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura Mixture-of-Experts combinada con un transformer con bucles (looped transformer), según los tags del repositorio. La conversión a MLX mantiene únicamente los componentes necesarios para la inferencia en Apple Silicon: cabeza del modelo (982,3 MB), 14 capas transformer (cada una de aproximadamente 604-611 MB) y archivos de configuración, plantilla de chat y script de generación. No se especifica el número de expertos, la dimensión oculta ni el número total de parámetros en la información disponible.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La única información técnica verificable es la relativa a la cuantización: la conversión a 8 bits logra una divergencia KL de 0,0047 nats (p95 0,017) y un acuerdo top-1 del 97,5 % respecto al modelo original en PyTorch, con una perplejidad de 4,735 frente a 4,724. Los tags mencionan también formatos nvfp4 y mxfp8, aunque no se detalla si están disponibles en el repositorio.

## Capacidades

- Generación de texto autoregresiva mediante MLX en Apple Silicon.
- Razonamiento y conversación multi-turno (se incluye plantilla de chat `chat_template.jinja`).
- Ejecución de un modelo MoE con cuantización de 8 bits, lo que reduce el uso de memoria frente a los pesos originales.
- Compatibilidad con el ecosistema MLX de Apple (script `generate.py` incluido).
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información proporcionada.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el formato MLX y la cuantización a 8 bits permiten ejecutar el modelo en equipos con memoria unificada suficiente (el repositorio ocupa 20,8 GB), sin necesidad de GPUs NVIDIA.
- Prototipado de aplicaciones de generación de texto en entornos de desarrollo macOS: el script `generate.py` y la plantilla de chat facilitan la integración rápida en flujos de trabajo locales.
- Evaluación de modelos MoE en hardware de consumo: útil para investigadores que quieran comparar el comportamiento de un MoE con looped transformer frente a transformers densos en el mismo hardware.
- Despliegue de asistentes conversacionales offline: al ejecutarse localmente, no requiere conexión a servicios en la nube ni expone datos a terceros.
- Experimentación con cuantización: el repositorio incluye métricas de fidelidad (KL, top-1, perplejidad) que sirven como referencia para estudiar el impacto de la cuantización a 8 bits en modelos MoE.
- Integración en pipelines de investigación reproducibles: los archivos safetensors por capas y las sumas SHA-256 permiten verificar la integridad de los pesos en entornos científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de fidelidad de la cuantización frente al modelo original:

| Metrica | Valor |
|---|---|
| Divergencia KL (8 bits vs original) | 0,0047 nats (p95 0,017) |
| Acuerdo top-1 | 97,5 % |
| Perplejidad (8 bits) | 4,735 |
| Perplejidad (original) | 4,724 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 20,8 GB, por lo que se recomienda un Mac con al menos 24-32 GB de memoria unificada para cargar el modelo completo con margen para el contexto y el runtime.
- GPU recomendadas: chips Apple Silicon M-series (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No es compatible con GPUs NVIDIA o AMD mediante MLX.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente; no en GPUs de consumo NVIDIA mediante este formato.
- Opciones de despliegue: MLX (librería `mlx`), con el script `generate.py` incluido. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (MoE con looped transformer en formato MLX) ni métricas de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo es ejecutable en Apple Silicon mediante MLX; no es portable a otras plataformas sin reconversión.
- La cuantización a 8 bits introduce una degradación mínima pero medible (KL 0,0047 nats, 2,5 % de desacuerdo top-1).
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que limita la planificación de despliegues en producción.
- El tamaño del repositorio (20,8 GB) requiere almacenamiento y memoria considerables para un equipo de consumo.

## Enlaces

- [Hugging Face: moonbox-dev/Inkling-2-Mini-MLX](https://huggingface.co/moonbox-dev/Inkling-2-Mini-MLX)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
