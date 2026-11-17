# neutronai-code/Quark-1.5B-v0.1-GGUF

## Resumen

Quark-1.5B-v0.1 es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5B) publicado por el usuario neutronai-code en Hugging Face. Se distribuye exclusivamente en formato GGUF bajo el identificador `neutronai-code/Quark-1.5B-v0.1-GGUF` y está pensado para su ejecución con llama.cpp. La model card indica que fue afinado y convertido a GGUF mediante Unsloth, y el único fichero publicado se denomina `Qwen2.5-Coder-1.5B.Q4_K_M.gguf`, lo que sugiere que la base es Qwen2.5-Coder-1.5B, aunque el autor no lo confirma explícitamente.

El modelo se presenta como un ajuste fino (finetune) de una base de 1,5B orientada a código, empaquetado en cuantización Q4_K_M. Con ese tamaño, el caso de uso natural es la inferencia local en hardware de consumo, con requisitos de memoria muy bajos y sin necesidad de GPU dedicada de gama alta. La relevancia actual del modelo es limitada: el repositorio no tiene descargas ni likes, la licencia no está declarada y la documentación es mínima.

La información pública es escasa. No se detallan los datos de entrenamiento, el proceso de ajuste, los idiomas soportados ni resultados de evaluación. Todo lo que sigue se basa en los metadatos del repositorio y en la model card, y los campos no documentados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base probable Qwen2, segun el tag `qwen2` y el nombre del fichero `Qwen2.5-Coder-1.5B.Q4_K_M.gguf`; no confirmado por el autor) |
| Parametros totales | 1.543.714.304 (segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el resto de cuantizaciones no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `Qwen2.5-Coder-1.5B.Q4_K_M.gguf`); no se publican safetensors en el repo |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Los tags (`qwen2`), el nombre del fichero (`Qwen2.5-Coder-1.5B.Q4_K_M.gguf`) y el recuento de parámetros (1.543.714.304) apuntan a una base Qwen2.5-Coder-1.5B, un transformer decoder-only con atención causal estándar. No obstante, el autor no declara explícitamente la arquitectura ni la longitud de contexto, por lo que estos datos deben tratarse como inferencia a partir de los metadatos, no como especificación confirmada.

Sobre el entrenamiento solo consta que el modelo fue afinado y convertido a GGUF con Unsloth, que el autor describe como "2x faster". No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT, ni qué hiperparámetros se usaron. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La única decisión técnica visible es la cuantización Q4_K_M, que reduce el peso a aproximadamente 1 GB y permite ejecución en CPU o GPU de gama baja.

## Capacidades

- Generación de texto y código: al derivar presumiblemente de Qwen2.5-Coder, cabe esperar competencia en generación y completado de código, aunque no hay evaluación publicada que lo confirme.
- Razonamiento y matemáticas: capacidad esperable por el tamaño (1,5B), limitada en comparación con modelos de mayor escala; sin datos de benchmark.
- Tool calling / function calling: no documentado. La plantilla de chat se invoca con `--jinja` en llama.cpp, lo que sugiere soporte de plantilla de chat, pero el autor no detalla capacidades de llamada a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas. La model card menciona `llama-mtmd-cli` para modelos multimodales como ejemplo genérico de uso, pero no afirma que este modelo sea multimodal.
- Ejecución local: diseñado para llama.cpp, con inferencia en CPU y GPU de consumo.

## Casos de uso

- Autocompletado de código en el editor: con 1,5B parámetros y cuantización Q4_K_M, el modelo cabe en memoria de un portátil y puede ofrecer sugerencias de baja latencia en entornos como VS Code mediante integraciones con llama.cpp.
- Asistente de código en local sin conexión: útil en entornos con requisitos de privacidad donde no se puede enviar código a APIs externas; el peso de ~1 GB permite desplegarlo en una máquina de desarrollo estándar.
- Generación de tests unitarios y documentación técnica: tareas de transformación de código acotadas que un modelo pequeño puede abordar con prompts bien estructurados, aunque la calidad no está validada por benchmarks.
- Prototipado rápido de pipelines de IA generativa: sirve como modelo de sustitución barato para validar integraciones con llama.cpp, plantillas Jinja y flujos de tool calling antes de pasar a modelos mayores.
- Educación y experimentación: adecuado para estudiar el proceso de fine-tuning y cuantización con Unsloth en hardware de consumo, dado su tamaño reducido y su formato GGUF.
- Filtrado y clasificación de texto a pequeña escala: tareas de etiquetado o reescritura con contexto corto donde el coste por inferencia y la huella de memoria son prioritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para el fichero Q4_K_M, más overhead de contexto y de la implementación (típicamente 1,5-2,5 GB en total con contexto moderado). No hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; el modelo está pensado para ejecución en CPU, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli -hf neutronai-code/Quark-1.5B-v0.1-GGUF --jinja`), y por compatibilidad de formato GGUF, servidores basados en llama.cpp como Ollama o llama-cpp-python (no verificados por el autor).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B en Q4_K_M, se espera una latencia baja en CPU y muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quark-1.5B-v0.1 | 1,54B | no disponible | no disponible | GGUF (Q4_K_M) | Finetune sin documentar; 0 descargas |
| Qwen2.5-Coder-1.5B (base presumible) | 1,54B | 32.768 tokens (segun documentacion publica de Qwen, no verificada en este repo) | Apache 2.0 (segun Qwen, no verificado aqui) | safetensors, GGUF | Base oficial con model card completa y benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (segun documentacion publica, no verificada aqui) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Alternativa pequena de Hugging Face con evaluacion publicada |
| Llama 3.2 1B | 1,24B | 128.000 tokens (segun documentacion publica, no verificada aqui) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con licencia restrictiva para algunos usos |

La comparación se basa en datos públicos de los modelos alternativos, no verificados en esta ficha. Para Quark-1.5B-v0.1 no hay información de contexto, licencia ni rendimiento, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción hasta que el autor lo aclare.
- Documentación mínima: no hay información sobre datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide validar su calidad.
- Riesgo de alucinación: inherente a los modelos de 1,5B, especialmente en razonamiento largo y matemáticas; sin benchmarks no se puede acotar.
- Sesgos: desconocidos, al no documentarse la composición del dataset de ajuste.
- Limitaciones de contexto e idioma: no documentadas; el contexto efectivo podría ser corto y el soporte multilingüe no está garantizado.
- Trazabilidad de la base: la identificación con Qwen2.5-Coder-1.5B es una inferencia a partir del nombre del fichero y los tags, no una declaración del autor; conviene verificarla antes de confiar en las capacidades esperadas.
- Madurez: repositorio sin descargas ni likes y creado recientemente; no hay evidencia de uso en producción ni de mantenimiento.
- Uso de `llama-mtmd-cli` en la model card: se menciona como ejemplo genérico, no como confirmación de capacidades multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.1-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor, implícito en los comandos): https://github.com/ggml-org/llama.cpp
