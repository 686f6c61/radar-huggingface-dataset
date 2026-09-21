# IAMIbrahim/luthor-8b-mlx-6bit

## Resumen

Luthor 8B MLX 6bit es una compilación cuantizada a 6 bits del modelo Luthor 8B, un ajuste fino (*fine-tune*) de Qwen3-8B orientado a operar herramientas de terminal y edición de ficheros dentro de un bucle de agente. El autor es IAMIbrahim y la publicación corresponde únicamente al artefacto de cuantización en formato MLX, pensado para ejecución local en Apple Silicon; el modelo base original se distribuye por separado en IAMIbrahim/luthor-8b.

El problema que aborda es concreto: disponer de un modelo de ~8.000 millones de parámetros que emita llamadas a herramientas en un formato estable (`<tool_call>` / `<tool_response>`, con bloque de herramientas estilo Hermes en el *system prompt*) y que quepa en memoria unificada de un Mac con 24 GB. Con 6,2 GB en disco y un pico de 6,77 GB de RAM medido, este build se sitúa entre las versiones de 8 bits (mayor fidelidad, más lenta) y de 4 bits (menor huella, más rápida).

Es relevante ahora porque documenta con mediciones propias una particularidad de la inferencia en Apple Silicon: al estar limitada por ancho de banda de memoria, las cuantizaciones más agresivas son más rápidas, no más lentas (13,8 tok/s a 6 bits frente a 10,6 tok/s a 8 bits en un M3). El propio autor advierte de que el modelo está entrenado pero **no evaluado**: la puerta de calidad previa a la publicación no se ha ejecutado y debe tratarse como artefacto de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (inferido del modelo base Qwen3-8B; no confirmado explícitamente en la model card del build) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica: el modelo no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits (6,500 bits por peso, grupo de 64) en MLX; la familia incluye además builds de 8 bits, 4 bits y mixto 3-6 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (`library_name: mlx`); 6,2 GB en disco, 6,7 GB de tamaño de repositorio |

Otros datos del build publicados por el autor: velocidad de generación de 13,8 tok/s y pico de memoria de 6,77 GB, medidos en un Apple M3 con 24 GB de memoria unificada, `mlx-lm` 0.31.3, generación de 150 tokens con `--temp 0.0`.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que se deduce del modelo base: Luthor 8B es un *fine-tune* de Qwen3-8B, por lo que hereda un transformer decoder-only denso de 8,19 mil millones de parámetros, sin mezcla de expertos. La model card de este build no describe capas, mecanismos de atención, tipo de positional encoding ni configuración de cabezas; remite a la model card del modelo base para los detalles de arquitectura y entrenamiento.

En cuanto al entrenamiento, el autor indica explícitamente que el modelo está «trained, not yet evaluated» y que su objetivo es conducir herramientas de terminal y edición de ficheros en un bucle de agente. No se proporcionan número de tokens de entrenamiento, composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o similares; esa información, según la propia model card, reside en la ficha del modelo base. La innovación técnica documentada en este artefacto no es arquitectónica sino de cuantización: el proceso de conversión se realiza con `mlx_lm convert -q --q-bits 6 --q-group-size 64`, y el autor advierte de que la cuantización post-entrenamiento por debajo de ~4 bits por peso rompe el modelo (el build `mixed_2_6`, de 3,284 bits/peso, se descartó porque degeneraba en repeticiones de tokens), algo que solo se resolvería con entrenamiento consciente de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat aplicada mediante `tokenizer.apply_chat_template`.
- Llamada a herramientas (*tool calling* / *function calling*): el modelo emite etiquetas `<tool_call>` y espera respuestas en `<tool_response>`.
- Ejecución en bucle de agente con herramientas de terminal y edición de ficheros, que es el caso de uso para el que fue ajustado.
- Razonamiento multietapa orientado a tareas de resolución de fallos: la model card propone como ejemplo de prompt «The test suite fails with ImportError. What is your first step?».
- Declaración de herramientas en el *system prompt* mediante un bloque `<tools>` estilo Hermes, siempre que se reproduzca exactamente el formato visto en entrenamiento.
- No se documentan capacidades de visión, audio, multimodalidad ni modo de razonamiento explícito (*thinking mode*).
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Agentes de terminal: el modelo recibe la descripción de las herramientas disponibles en el *system prompt* y emite llamadas estructuradas para ejecutar comandos, lo que permite construir bucles de resolución de tareas sobre una shell sin escribir un parser ad hoc.
- Edición automatizada de ficheros: adecuado para agentes que localizan un fichero, leen su contenido, aplican un parche y vuelven a verificar, ya que fue ajustado específicamente para herramientas de edición.
- Depuración guiada de *tests*: dado un fallo como el del ejemplo de la model card (un `ImportError`), el modelo puede proponer y ejecutar los pasos de diagnóstico en secuencia en lugar de limitarse a describirlos.
- Asistente local en portátil Apple Silicon: con 6,77 GB de pico de memoria, cabe en Macs de 16 GB en adelante y permite trabajar sin enviar código ni credenciales a servicios externos.
- Automatización de tareas de mantenimiento de repositorio: actualización de dependencias, renombrado de símbolos o limpieza de ficheros, ejecutadas como una cadena de llamadas a herramienta y respuesta.
- Prototipado de investigación sobre agentes: al ser un artefacto pequeño y ejecutable en local, sirve para experimentar con formatos de herramientas, políticas de reintento y granularidad de acciones antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: los cuatro builds de la familia permiten medir el compromiso entre calidad, velocidad y memoria en un mismo *hardware* (10,6 tok/s a 8 bits frente a 21,1 tok/s en el mixto 3-6).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que el modelo está «trained, not yet evaluated» y que la *ship-gate benchmark* no se ha ejecutado. Las únicas métricas publicadas son de velocidad y memoria, no de calidad:

| Build | Tamano en disco | Bits/peso | Tokens/s | RAM pico |
|---|---|---|---|---|
| luthor-8b-mlx-8bit | 8,1 GB | 8,500 | 10,6 | 8,80 GB |
| luthor-8b-mlx-6bit | 6,2 GB | 6,500 | 13,8 | 6,77 GB |
| luthor-8b-mlx-4bit | 4,3 GB | 4,500 | 19,2 | 4,79 GB |
| luthor-8b-mlx-mixed-3-6 | 3,9 GB | 4,088 | 21,1 | 4,38 GB |
| luthor-8b-mlx-mixed_2_6 (descartado) | 3,2 GB | 3,284 | No disponible | No disponible |

Mediciones del autor en Apple M3 (24 GB), `mlx-lm` 0.31.3, generación de 150 tokens con `--temp 0.0`.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 6,77 GB de pico para este build de 6 bits; 8,80 GB para el de 8 bits; 4,79 GB para el de 4 bits; 4,38 GB para el mixto 3-6.
- Hardware de referencia: las mediciones se realizaron en un Apple M3 con 24 GB. No se han publicado cifras para otros chips.
- Compatibilidad con GPU de consumo: al ser un artefacto MLX, está orientado a Apple Silicon; no se documenta funcionamiento en GPUs NVIDIA o AMD en la información disponible.
- Cabe en Macs con memoria unificada de 16 GB o superior, aunque no se aportan mediciones en configuraciones distintas al M3 de 24 GB.
- Opciones de despliegue: `mlx-lm` (versión de referencia 0.31.3), tanto por línea de comandos (`mlx_lm.generate`) como por API de Python (`load` / `generate`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no consumen pesos MLX de forma nativa.
- Latencia y *throughput*: 13,8 tokens/s en el M3 de referencia con 150 tokens generados y temperatura 0. No disponible para otras longitudes de secuencia o tamaños de lote.
- Conversión reproducible: `python -m mlx_lm convert --hf-path IAMIbrahim/luthor-8b --mlx-path luthor-8b-6bit -q --q-bits 6 --q-group-size 64`.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos externos comparables en la información disponible, por lo que la única comparación posible con cifras verificables es dentro de la propia familia de builds:

| Build | Parametros | Cuantizacion | Contexto | Tokens/s (M3) | RAM pico | Licencia |
|---|---|---|---|---|---|---|
| luthor-8b-mlx-8bit | 8,19 B | 8 bits | No disponible | 10,6 | 8,80 GB | Apache 2.0 |
| luthor-8b-mlx-6bit | 8,19 B | 6 bits | No disponible | 13,8 | 6,77 GB | Apache 2.0 |
| luthor-8b-mlx-4bit | 8,19 B | 4 bits | No disponible | 19,2 | 4,79 GB | Apache 2.0 |
| luthor-8b-mlx-mixed-3-6 | 8,19 B | 4,088 bits/peso | No disponible | 21,1 | 4,38 GB | Apache 2.0 |

Comparación con alternativas externas de la misma categoría (por ejemplo, el propio Qwen3-8B sin ajustar u otros modelos orientados a agentes): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que la *ship-gate benchmark* no se ha ejecutado y pide tratarlo como artefacto de investigación. No hay ninguna cifra de calidad publicada.
- Riesgo de alucinación: no cuantificado por el autor, pero al no existir evaluación no hay evidencia de mitigación; en tareas de agente una alucinación puede traducirse en la ejecución de un comando destructivo.
- Idiomas: solo inglés declarado. No hay soporte documentado para castellano ni para ninguna otra lengua.
- Formato de herramientas rígido: el modelo fue entrenado con una declaración concreta de herramientas (bloque `<tools>` estilo Hermes) y espera `<tool_call>` / `<tool_response>`. Cualquier desviación en el formato puede degradar o romper la generación, por lo que la integración exige reproducir el formato de entrenamiento.
- Límite de cuantización: la conversión post-entrenamiento por debajo de ~4 bits por peso degrada el modelo hasta la repetición de tokens, según las pruebas del propio autor. No es posible bajar a compresión ternaria sin entrenamiento consciente de la cuantización.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IAMIbrahim/luthor-8b y de Qwen3-8B antes de un despliegue en producción.
- Dependencia de plataforma: el formato MLX limita la ejecución a Apple Silicon; no hay rutas de despliegue documentadas para GPU NVIDIA ni para servidores x86.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide planificar tareas con historiales largos o repositorios extensos.
- Sesgos: no disponibles. El autor no publica análisis de sesgo ni composición del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-6bit
- Modelo base: https://huggingface.co/IAMIbrahim/luthor-8b
- Build de 8 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-8bit
- Build de 4 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-4bit
- Build mixto 3-6: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-mixed-3-6
- Referencia sobre cuantización ternaria citada por el autor (Bonsai 2): https://www.mindstudio.ai/blog/bonsai-2-27b-ternary-quantization
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a WikiLeaks y Vault 7, sin relación con la ficha.
