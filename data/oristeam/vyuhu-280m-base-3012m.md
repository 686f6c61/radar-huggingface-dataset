# OrisTeam/Vyuhu-280M-Base-3012m

## Resumen

Vyuhu-280M-Base-3012m es un modelo de lenguaje causal (causal-LM) desarrollado por OrisTeam, entrenado desde cero y orientado principalmente al idioma polaco. Se presenta como un experimento de arquitectura: una única red densa supernet con cuatro rutas de cómputo deterministas fijas (Vasudeva, Sankarshana, Pradyumna y Aniruddha) que permiten reducir el cómputo activo sin cargar checkpoints distintos. El checkpoint publicado corresponde al paso 22.982 con 3.012.296.704 tokens de entrenamiento (~3,01B tokens).

El modelo resuelve un problema práctico: obtener varios perfiles de cómputo de un solo entrenamiento compartido, evitando el routing dinámico por token o la selección de expertos MoE. Es un artefacto de validación de arquitectura, no un modelo conversacional ni ajustado por instrucciones. Su tamaño es de 282,68M parámetros y una longitud de contexto de 1024 tokens, lo que lo sitúa en la gama de modelos pequeños para experimentación y prototipado.

La relevancia actual radica en su enfoque de "cómputo elástico determinista" dentro de una única red compartida, una alternativa sencilla a las arquitecturas dinámicas más complejas. Está publicado bajo licencia Apache 2.0, con pesos en safetensors y código personalizado que requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Supernet densa con rutas de cómputo deterministas (4 perfiles) |
| Parámetros totales | 282.747.328 (282,68M según la card) |
| Parámetros activos | Variable según perfil: 16/16 (Vasudeva), 9/16 (Sankarshana), 6/16 (Pradyumna), 4/16 (Aniruddha) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Polaco (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con capas de atención GQA (Grouped Query Attention) con 18 cabezas de query y 6 de KV, cabeza de dimensión 64, tamaño oculto de 1152 y FFN de 3584. Usa SwiGLU como activación, RMSNorm (eps 1e-6) y RoPE para posiciones. El vocabulario es de 32.000 tokens. La estructura se organiza en tres etapas; cada etapa contiene un bloque pesado opcional (con mixer convolucional causal gated) y un canal L de transferencia de bajo rango cuando se omite el bloque pesado. Hay un controlador H siempre activo, de baja dimensión, condicionado al perfil global seleccionado.

El entrenamiento se realizó desde cero durante 3.012.296.704 tokens de entrada, en una sola NVIDIA RTX 5060 Ti 16 GB. No se aplicó SFT, RLHF, DPO ni alineación de seguridad. El checkpoint publicado corresponde al paso 22982 y es un experimento archivado, no el modelo final (el desarrollo continúa hacia Vyuhu 1.0). Los cuatro perfiles de cómputo comparten la misma red y se seleccionan externamente por petición, sin selector aprendido.

## Capacidades

- Generación de texto causal en polaco, con continuidad temática y coherencia local razonable para un modelo de 280M.
- Cuatro perfiles de cómputo deterministas (vasudeva, sankarshana, pradyumna, aniruddha) que reducen el cómputo activo manteniendo el mismo checkpoint.
- Los perfiles no son comportamentalmente idénticos: varían en estrategia de continuación, vocabulario y mantenimiento de coherencia local, según las pruebas cualitativas del autor.
- No soporta tool calling, ni function calling, ni razonamiento multi-step estructurado.
- No tiene capacidades de visión ni audio.
- No está afinado para instrucciones ni conversación; es un modelo base.
- Soporte multilingüe limitado, orientado principalmente al polaco.

## Casos de uso

- Experimentación académica: estudio de cómo el cómputo determinista compartido afecta a la calidad de la generación en modelos pequeños, útil para investigación en eficiencia computacional.
- Prototipado de modelos de lenguaje en polaco: generación de texto base para tareas de completado o reescritura, sin necesidad de instrucciones.
- Benchmark de eficiencia: comparación de los cuatro perfiles para medir la relación entre cómputo activo y calidad, en entornos con restricciones de recursos.
- Validación de arquitecturas de supernet: referencia para quienes desarrollan redes compartidas con múltiples rutas fijas.
- Entrenamiento de modelos de bajo presupuesto: ejemplo de cómo entrenar un modelo de 280M en una GPU de consumo (RTX 5060 Ti 16 GB) con un presupuesto de cómputo reducido.
- Fine-tuning posterior: al ser un modelo base, puede servir como punto de partida para ajuste por instrucciones o tareas específicas en polaco, aunque el contexto de 1024 tokens limita aplicaciones de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona evaluaciones durante el desarrollo, pero no proporciona métricas numéricas (MMLU, HumanEval, GSM8K, etc.) en la model card.

## Requisitos de hardware

- Inferencia: con 282,7M parámetros, los pesos en fp16 ocupan aproximadamente 565 MB. El modelo cabe en GPUs de consumo con 4 GB o más de VRAM, y el perfil más pequeño (Aniruddha) reduce el cómputo activo aún más.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX 5060 Ti 16 GB; para inferencia, GPUs como RTX 3060, RTX 4060 o superiores son suficientes. También puede ejecutarse en CPU con suficiente RAM.
- Despliegue: compatible con Transformers (con `trust_remote_code=True`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos comparables directamente en la información proporcionada. La arquitectura de supernet con rutas deterministas no tiene un equivalente comercial directo en el mismo rango de tamaño, y no se aportan datos de rendimiento frente a otros modelos densos de 280M (como GPT-2 o modelos polacos similares).

## Limitaciones y advertencias

- Modelo base sin afinamiento por instrucciones: no es adecuado para tareas de conversación o asistentes sin un ajuste posterior.
- Riesgo de alucinación y textos incorrectos, inconsistentes, repetitivos o sesgados, como se advierte en la model card.
- Contexto limitado a 1024 tokens, lo que restringe aplicaciones que requieren contexto largo.
- Orientado al polaco; su rendimiento en otros idiomas no está documentado.
- Los perfiles más pequeños (Pradyumna, Aniruddha) pueden perder continuidad temática o simplificar el texto, según las observaciones del autor.
- No se han publicado benchmarks objetivos que validen su calidad frente a otros modelos.
- Es un checkpoint experimental archivado, no el modelo final de Vyuhu; el desarrollo continúa hacia Vyuhu 1.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OrisTeam/Vyuhu-280M-Base-3012m
- Checkpoint anterior (1704m): https://huggingface.co/OrisTeam/Vyuhu-280M-Base-1704m
- Organización OrisTeam: https://huggingface.co/OrisTeam
