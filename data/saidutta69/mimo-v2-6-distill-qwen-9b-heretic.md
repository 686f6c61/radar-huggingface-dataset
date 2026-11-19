# saidutta69/MiMo-V2.6-Distill-Qwen-9B-heretic

## Resumen

MiMo-V2.6-Distill-Qwen-9B-heretic es una variante "abliterada" (decensurada) del modelo multimodal XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un modelo de 9B parámetros desarrollado por Xiaomi orientado a tareas agénticas de programación, uso de herramientas y trabajo de seguridad. Esta versión concreta la publica el usuario saidutta69 bajo el paraguas "RACER IS OP" y se ha generado con la herramienta Heretic v1.4.0, que aplica ablación direccional sobre los pesos para suprimir el comportamiento de rechazo sin reentrenar el modelo.

El modelo conserva la arquitectura Qwen3.5 (etiqueta `qwen35`), el codificador visual y el comportamiento agéntico adquirido por destilación y SFT del modelo original, pero modifica las proyecciones de salida de atención (`attn.o_proj`) y las down-projections del MLP (`mlp.down_proj`) para eliminar las direcciones de pesos responsables de las negativas. Según la model card, las negativas en un conjunto de evaluación de contenido dañino caen de 99/100 a 8/100, con una divergencia KL de 0,0477 respecto al original.

Su relevancia práctica radica en que ofrece contexto de 262K tokens, capacidades multimodales (image-text-to-text) y un conjunto completo de cuantizaciones GGUF que permiten ejecutarlo en GPUs de consumo desde 6 GB de VRAM, con licencia MIT. Está pensado para desarrolladores que necesitan un agente local de código sin filtros de rechazo, asumiendo el coste de evaluar por su cuenta los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 (`qwen35`), con codificador visual |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (GGUF); BF16 en safetensors |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Xiaomi con arquitectura Qwen3.5, que combina un decodificador de lenguaje con un codificador visual para entrada image-text-to-text. El modelo original se ha entrenado mediante destilación y SFT (supervised fine-tuning) sobre un modelo mayor, con especial énfasis en comportamiento agéntico: uso de herramientas, trabajo en terminal, coding y visual coding. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación de esta variante concreta es el proceso de abliteración aplicado con Heretic v1.4.0 (ensayo 109 de 200, semilla `1903262967`). En lugar de fine-tuning, Heretic localiza las direcciones de pesos asociadas al rechazo y las edita directamente: `direction_index` = 23,77 (índice único, no por capa), con pesos máximos y mínimos sobre `attn.o_proj` (1,44 / 1,42) y `mlp.down_proj` (1,23 / 1,05). El resultado es una divergencia KL de 0,0477 frente al original, lo que según el autor preserva el comportamiento agéntico y el codificador visual. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256 para regenerar el modelo bit a bit mediante `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito.
- Programación: generación de código, revisión de código y depuración en estilos tipo SWE-bench.
- Coding visual: interpretación de capturas, diagramas o imágenes de código para generar o corregir implementaciones.
- Uso de herramientas y function calling, orientado a agentes multi-paso.
- Trabajo en terminal y flujos agénticos de línea de comandos.
- Capacidades de seguridad y ciberseguridad (etiqueta `cybersecurity` en el modelo base).
- Multimodal: entrada de imagen y texto (pipeline `image-text-to-text`).
- Multilingüe limitado a inglés y chino.
- Conversación multi-turno y roleplay (etiquetas del autor), sin comportamiento de rechazo en la evaluación reportada.

## Casos de uso

- Agente local de programación: el modelo puede integrarse en un bucle agéntico que lea repositorios, ejecute comandos en terminal y aplique parches, aprovechando su contexto de 262K tokens para mantener a la vista varios ficheros y el historial de la sesión.
- Revisión de código automatizada en CI/CD: con tool calling puede consultar el diff de un pull request, ejecutar linters o tests y publicar comentarios, todo dentro de un pipeline que se ejecuta en una GPU de 16 GB con Q6_K.
- Depuración a partir de capturas de pantalla: gracias al codificador visual, puede recibir una imagen de un stack trace o de una consola con errores y proponer la corrección, útil en soporte a desarrolladores.
- Investigación en seguridad ofensiva y defensiva: al no rechazar peticiones, encaja en laboratorios que analizan payloads, escriben pruebas de fuzzing o revisan configuraciones inseguras, siempre dentro de un entorno controlado y con autorización.
- Asistente de terminal en local: desplegado con `llama serve -hf saidutta69/MiMo-V2.6-Distill-Qwen-9B-heretic`, sirve como copiloto de shell que traduce lenguaje natural a comandos y explica su efecto, sin enviar datos a la nube.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse en GGUF sobre hardware propio (desde 6 GB), permite procesar código propietario sin salir de la infraestructura del equipo.
- Roleplay y conversación sin restricciones: para prototipos de personajes o narrativa interactiva donde los filtros de rechazo del modelo base resultan un obstáculo, aceptando la pérdida de salvaguardas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia abliteración, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0477 | 0 (por definición) |
| Negativas (conjunto dañino) | 8/100 | 99/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, SWE-bench, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): IQ4_XS ~4,88 GB; Q4_K_M ~5,24 GB; Q5_K_M ~6,02 GB; Q6_K ~6,85 GB; Q8_0 ~8,87 GB; F16 ~16,69 GB. Añadir aproximadamente 1 GB por cada 32K de contexto.
- GPU recomendadas según el autor: RTX 4090/5090 (24 GB) con Q8_0; RTX 4080/5080/4060 Ti 16G (16 GB) con Q6_K; RTX 3060/4070/5070 (12 GB) con Q5_K_M; RTX 4060/3070 (8 GB) con Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) con IQ4_XS.
- Cabe en GPU de consumo: sí, desde 6 GB con IQ4_XS; también en CPU-only y Apple Silicon con Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama serve -hf ...`), Ollama, LM Studio, Jan; transformers con `AutoModelForImageTextToText` y `AutoProcessor`; endpoints compatibles según los tags del repo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-heretic (este) | ~9,4B | 262K | MIT | Multimodal, abliterado, GGUF completo |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ~9,4B | 262K | MIT | Multimodal, con rechazos (99/100) |
| Alternativas de 9B agénticas | no disponible | no disponible | no disponible | No se aportan datos de comparación en la información disponible |

## Limitaciones y advertencias

- Modelo abliterado: se han suprimido las negativas, por lo que no ofrece salvaguardas frente a contenido dañino, ilegal o inseguro. No es apto para despliegues públicos sin capas de moderación externas.
- La abliteración modifica pesos de atención y MLP; aunque la KL reportada es baja (0,0477), puede haber degradación sutil de coherencia o de capacidades no medidas en los benchmarks publicados.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; como cualquier LLM de 9B, puede inventar APIs, comandos o referencias.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado.
- Contexto de 262K: el coste de VRAM crece con el contexto (~1 GB por 32K), lo que puede provocar OOM en GPUs pequeñas si se usa la ventana completa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad legal del uso recae en el desplegador.
- El repositorio ocupa 112,7 GB por incluir múltiples cuantizaciones y safetensors; conviene descargar solo el fichero GGUF necesario.
- La model card incluye imágenes y enlaces externos alojados en dominios de terceros; verificar su origen antes de consumirlos.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/MiMo-V2.6-Distill-Qwen-9B-heretic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Licencia del modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
