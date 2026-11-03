# bahattinyunus/kam-r1-gguf

## Resumen

KAM (kam:r1) es un modelo de generación de texto publicado por Bahattin Yunus Çetin (usuario de HuggingFace `bahattinyunus`) bajo licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF y está pensado para su ejecución con Ollama, con un enfoque declarado en la model card hacia el turco como idioma principal (con soporte secundario de inglés). El repositorio tiene 4,7 GB y, según los metadatos de safetensors, contiene 7.615.616.512 parámetros, lo que lo sitúa en la franja de los modelos de aproximadamente 7.600 millones de parámetros.

La model card describe el modelo como una fusión de la tradición chamánica de la estepa altái con el principio de energía libre de Karl Friston, la telemetría del kernel Linux mediante eBPF y la mutación JIT en memoria con C++20. Estos elementos son, en la práctica, parte del marco conceptual y del *prompting* del autor, no componentes verificables del artefacto publicado: el repositorio contiene pesos GGUF derivados, según los tags, de la familia Qwen2.5 y DeepSeek-R1. La longitud de contexto declarada es de 16.384 tokens.

Su relevancia es limitada pero concreta: es un ejemplo de *fine-tuning* o adaptación de un modelo base de ~7B orientado a un idioma con menos cobertura (turco) y empaquetado para despliegue inmediato en Ollama. No obstante, el repositorio no presenta descargas ni *likes*, no incluye resultados de evaluación y la documentación mezcla afirmaciones técnicas con prosa simbólica, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5, según tags del autor); detalles no disponibles |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF 4-bit y 8-bit (según model card); variantes exactas no disponibles |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 4,7 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del autor, que apuntan a Qwen2.5 como modelo base y a DeepSeek-R1 como referencia de destilación o de estilo de razonamiento. Con 7.615.616.512 parámetros y una ventana de 16.384 tokens, el perfil encaja con un transformer denso de la familia Qwen2.5-7B, pero no se publican ni la configuración de capas, ni el número de cabezas de atención, ni el vocabulario.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas verificables como decodificación especulativa o atención lineal. La model card menciona conceptos como el principio de energía libre de Friston, la telemetría eBPF y la mutación JIT en C++20, pero no se aporta evidencia de que estos mecanismos estén implementados en los pesos o en el runtime del modelo; deben tratarse como parte del encuadre del autor y no como características técnicas contrastadas.

## Capacidades

- Generación de texto conversacional en turco e inglés, con especial énfasis declarado en la calidad del turco (morfología aglutinante, orden SOV y naturalidad frente a traducciones literales).
- Razonamiento de estilo *chain-of-thought* heredado del linaje DeepSeek-R1, según los tags del autor; no hay evaluación publicada que lo respalde.
- Soporte declarado de dominios técnicos: hooks de eBPF en Linux, gestión de memoria con C++20 y telemetría de sistemas.
- Ejecución local mediante Ollama con un único comando (`ollama run hf.co/bahattinyunus/kam-r1-gguf`).
- Compatibilidad con *endpoints* (tag `endpoints_compatible`) para despliegue como servicio de generación de texto.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni modo *thinking* explícito.

## Casos de uso

- Asistente conversacional en turco para atención al cliente: el modelo puede mantener diálogos multi-turno con hasta 16.384 tokens de contexto, suficiente para incorporar el historial de la conversación y la documentación de producto en el mismo *prompt*.
- Generación y revisión de textos en turco: redacción de correos, documentación técnica o contenido editorial aprovechando el énfasis del autor en una morfología y fonética turcas naturales.
- Prototipado local de aplicaciones de IA: al distribuirse en GGUF y ejecutarse con Ollama, permite levantar un servicio de generación en una estación de trabajo sin infraestructura de GPU dedicada.
- Experimentación académica sobre adaptación de modelos base a lenguas de cobertura media: sirve como punto de partida para estudiar el efecto de *fine-tuning* sobre un modelo de ~7B en turco.
- Soporte a tareas de administración de sistemas: consultas sobre eBPF, telemetría del kernel y depuración de código C++20, áreas que la model card declara como especialidad.
- Evaluación comparativa de *pipelines* GGUF: útil para medir latencia y calidad de cuantizaciones 4-bit y 8-bit frente al modelo base en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 4-5 GB para cuantización 4-bit (el repositorio completo ocupa 4,7 GB) y en torno a 8-9 GB para 8-bit, sin contar la caché KV para 16.384 tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones 4-bit y 8-bit con contexto completo; A100 o H100 solo si se requiere servicio concurrente a gran escala.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM para 4-bit, y con 12 GB o más para 8-bit con contexto largo.
- Opciones de despliegue: Ollama (soporte oficial en la model card), llama.cpp y servidores compatibles con GGUF; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| KAM (kam:r1 GGUF) | 7,6B | 16.384 | tr, en | Apache 2.0 | GGUF | No |
| Qwen2.5-7B | 7,6B | 32.768 (versión base) | Multilingüe (incluye tr) | Apache 2.0 | safetensors, GGUF | Sí |
| Mistral-7B-v0.3 | 7,2B | 32.768 | Principalmente en, fr | Apache 2.0 | safetensors, GGUF | Sí |
| Llama 3.1 8B | 8,0B | 131.072 | Multilingüe | Llama 3.1 Community License | safetensors, GGUF | Sí |

La comparación se limita a parámetros, contexto y licencia: no existen datos de evaluación de KAM que permitan contrastar calidad frente a estos modelos, y su contexto declarado es la mitad del de Qwen2.5-7B, su base probable.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni conjunto de validación, ni métricas de calidad publicadas; el rendimiento real es desconocido.
- Repositorio sin tracción: cero descargas y cero *likes* en el momento de la consulta, sin evidencia de uso o revisión por parte de la comunidad.
- Documentación no verificable: la model card mezcla conceptos técnicos (eBPF, energía libre, JIT) con narrativa simbólica sin especificar cómo se implementan ni qué efecto tienen sobre los pesos.
- Riesgo de alucinación inherente a un modelo de ~7B sin datos de alineación documentados; especialmente relevante en dominios técnicos como seguridad o administración de sistemas.
- Contexto limitado a 16.384 tokens, inferior al de los modelos base contemporáneos, lo que restringe casos de uso con documentos largos.
- Cobertura lingüística reducida a turco e inglés; no se documenta comportamiento en castellano ni en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar presumiblemente de Qwen2.5 conviene verificar las obligaciones de atribución del modelo base.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (3 de noviembre de 2026), sin historial de versiones ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bahattinyunus/kam-r1-gguf
- Repositorio GitHub del autor: https://github.com/bahattinyunus/kam
- Perfil del autor en GitHub: https://github.com/bahattinyunus
