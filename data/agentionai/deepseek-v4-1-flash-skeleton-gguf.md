# agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF

## Resumen

`agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF` no es un modelo de lenguaje funcional, sino un conjunto de artefactos de prueba (test fixture) publicado por AgentionAI el 20 de octubre de 2026 bajo licencia MIT. Reproduce la arquitectura exacta de DeepSeek-V4.1-Flash-1017 —metadatos, tokenizer, nombres de tensores, formas y tipos—, pero sustituye los pesos reales por valores aleatorios o directamente a cero. El objetivo es que desarrolladores de runtimes, conversores y cuantizadores puedan trabajar sobre la topología del modelo sin descargar los 508,4 GB que ocupa el checkpoint original.

El repositorio incluye dos piezas. `DS41-small.gguf` (20,4 GB) es una versión reducida a 6 capas y 128 expertos enrutados que, aun así, cubre todos los tipos de capa de atención del modelo original (ratios de compresión 0/2/1, capas KV e index source). El script `make_skeleton.py` construye localmente el esqueleto completo de 40 capas y 384 expertos: lee las cabeceras de tensores reales del repositorio oficial mediante peticiones HTTP con rangos y escribe un fichero GGUF disperso de 508,4 GB que ocupa unos 6 MB en disco.

Su relevancia es por tanto instrumental: permite validar cargadores, planificación de memoria y el grafo de cómputo de DeepSeek-V4.1 en llama.cpp antes de que exista soporte estable (en el momento de publicación depende del PR abierto ggml-org/llama.cpp#30817). No sirve para evaluar calidad, perplejidad ni KLD. Con 0 descargas y 1 like, no hay validación comunitaria del artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Réplica de la arquitectura de DeepSeek-V4.1-Flash-1017: transformer con mezcla de expertos (MoE) de 40 capas y 384 expertos enrutados, capas de atención con ratios de compresión 0/2/1, capas KV e index source, tablas Engram de n-gramas y tensores MTP y de visión en el modelo base. El artefacto es un esqueleto sin entrenamiento |
| Parámetros totales | 30.441.106.884 según los metadatos de safetensors de HuggingFace (corresponden a la versión reducida); el esqueleto completo declara 1.043 tensores y 508,4 GB de pesos; el número de parámetros del modelo base no se publica |
| Parámetros activos | no disponible (MoE con 128 expertos enrutados en la versión reducida y 384 en el esqueleto completo; el README no indica cuántos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Tipos de tensor declarados en el esqueleto completo: MXFP4 (120 tensores, 288,8 GB, expertos enrutados), MXFP8 (1 tensor, 202,8 GB, tabla Engram de n-gramas), BF16 (351 tensores, 16,4 GB) y F32 (571 tensores, 0,5 GB). No se documentan cuantizaciones GGUF derivadas (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible (el tokenizer replica el del modelo base, pero no se publica lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (`DS41-small.gguf`, 20,4 GB) y script `make_skeleton.py` que genera un GGUF disperso de 508,4 GB; repositorio de 20,4 GB |

## Arquitectura y entrenamiento

No hay entrenamiento: no existen datos de preentrenamiento, ajuste supervisado, RLHF ni DPO asociados a este repositorio. Lo que se replica es la estructura. El esqueleto completo, según el README, contiene 1.043 tensores repartidos en 40 capas con 384 expertos enrutados en MXFP4 (288,8 GB), una única tabla Engram de n-gramas en MXFP8 de 202,8 GB, 351 tensores en BF16 (16,4 GB) y 571 en F32 (0,5 GB), hasta un total de 508,4 GB. `DS41-small.gguf` mantiene los nombres y las formas por tensor del modelo completo pero escalados: 6 capas que cubren todos los tipos de atención (ratios de compresión 0/2/1, capas KV e index source), 128 expertos enrutados en lugar de 384, Engram en las capas 1 y 3 con vocabulario recortado a unas 1,2 millones de filas por tabla, y sin tensores MTP ni de visión. Los pesos son aleatorios con escalas de aproximadamente 1/sqrt(fan_in) para que la numerica no degenere.

La innovación técnica está en el método de generación, no en el modelo. `make_skeleton.py` lee las cabeceras reales de tensores del repositorio oficial mediante HTTP range requests, escribe shards falsos cuyas regiones de datos son huecos del sistema de ficheros y ejecuta el conversor con un writer que salta los bloques de ceros; el resultado es un fichero de 508,4 GB que ocupa unos 6 MB en disco. Hay una desviación deliberada: como las escalas FP8 a cero no pasan la comprobación de rango del conversor, el script escribe 1.0 (0x7F) en las regiones de escala lineal FP8 (7,2 MB de bytes reales), mientras que las escalas de expertos y de Engram quedan como huecos.

## Capacidades

- No genera texto coherente: los pesos son ruido (versión reducida) o cero (esqueleto completo), por lo que la salida no tiene valor semántico.
- No razona, no escribe código, no resuelve matemáticas y no procesa imágenes; el fichero reducido omite explícitamente los tensores MTP y de visión.
- No soporta tool calling ni function calling; no hay plantilla de chat (el conversor la elimina a propósito, de ahí el flag `-st` en los ejemplos del README).
- Capacidad multilingüe no evaluable; el tokenizer sí se replica del modelo base y puede usarse para pruebas de tokenización.
- Reproduce metadatos, tokenizer, nombres de tensores, formas y tipos del modelo original, lo que permite probar cargadores y validadores de formato.
- Permite recorrer el grafo completo de 40 capas y los distintos tipos de capa de atención en un entorno controlado.
- Sirve como fixture determinista en CI para detectar regresiones en el soporte de DeepSeek-V4.1 dentro de llama.cpp.
- No es válido para medir calidad, perplejidad o divergencia KL, tal como advierte el propio autor.

## Casos de uso

- Pruebas de cargador GGUF en integración continua: un pipeline puede validar que el runtime parsea metadatos, tokenizer y cabeceras de 1.043 tensores sin descargar 508 GB, usando `DS41-small.gguf` como entrada estable.
- Planificación de memoria y mmap: el esqueleto completo se carga y ejecuta bajo un límite de 12 GB de RAM con mmap, lo que permite verificar el plan de asignación y el comportamiento de página de un modelo de 508,4 GB nominales en hardware modesto.
- Cobertura del grafo de atención: las 6 capas de la versión reducida cubren todos los tipos de capa (ratios de compresión 0/2/1, capas KV e index source), de modo que un test puede ejercitar cada rama del grafo sin necesidad de un checkpoint real.
- Desarrollo de conversores y cuantizadores: validar el pipeline de conversión a GGUF, el tratamiento de MXFP4/MXFP8/BF16 y el chequeo de rangos de escalas FP8 usando formas reales en lugar de tensores sintéticos triviales.
- Medición de velocidad de kernels: los pesos a cero cuestan lo mismo de multiplicar que los reales, así que el esqueleto sirve para medir GEMM, solapamiento y escalado de hilos sin depender del contenido de los datos.
- Reproducción de bugs de despliegue: probar combinaciones de `-ngl`, límites de memoria y offload en máquinas sin VRAM suficiente para el modelo real, comprobando que el runtime falla o degrada de forma controlada.
- Validación de PRs en llama.cpp: usar el esqueleto como caso de prueba reproducible del PR ggml-org/llama.cpp#30817 antes de fusionar cambios en el soporte de DeepSeek-V4.1.
- Pruebas de tokenizer y plantillas: al conservarse el tokenizer original, se puede verificar la tokenización y reconstruir la plantilla de chat que el conversor descarta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el artefacto no es válido para evaluar calidad de salida, perplejidad o KLD, y que la numerica del esqueleto completo es degenerada porque todos los pesos, incluidas las normas y el router, son cero. Tampoco se publican métricas de latencia o throughput; solo se documenta una ejecución cualitativa de 2 tokens en CPU con mmap bajo un límite de 12 GB de memoria.

## Requisitos de hardware

- `DS41-small.gguf`: el fichero ocupa 20,4 GB, por lo que la estimación de memoria para los pesos ronda los 20,5-22 GB sumando overhead de contexto y KV (estimación a partir del tamaño de fichero; no publicada por el autor).
- GPU orientativas para la versión reducida: A100 de 40 u 80 GB y H100 sin problema; una RTX 4090 de 24 GB entraría de forma muy ajustada y solo con contexto pequeño y sin buffers adicionales.
- Esqueleto completo: 508,4 GB nominales, pero unos 6 MB en disco gracias a los huecos del sistema de ficheros; el autor lo ejecutó en CPU con `-ngl 0`, mmap y un límite de 12 GB de memoria.
- No hay datos publicados de VRAM necesaria en GPU para el esqueleto completo ni de throughput en ninguna configuración.
- Despliegue: únicamente llama.cpp con el soporte de DeepSeek-V4.1 del PR ggml-org/llama.cpp#30817 (`llama-cli -m DS41-small.gguf -ngl 0 -c 512 -n 8 -st -p "Hello" --temp 0`). No se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores.
- Requisitos del script: Python con torch y safetensors, además del conversor de la rama del PR; acceso HTTP al repositorio oficial para leer las cabeceras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Capas / expertos | Tamaño de pesos | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `DS41-small.gguf` | 6 / 128 | 20,4 GB (1.043 nombres de tensor escalados) | no disponible | MIT | Pruebas de cargador, grafo y memoria en CPU/GPU pequeña |
| Esqueleto completo (`make_skeleton.py`) | 40 / 384 | 508,4 GB nominales, ~6 MB en disco | no disponible | MIT | Pruebas de planificación de memoria y del grafo completo |
| DeepSeek-V4.1-Flash-1017 (modelo base) | 40 / 384 | 508,4 GB de tensores según el README | no disponible | no disponible en la información proporcionada | Inferencia real; requiere el checkpoint completo |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan compararlo con alternativas funcionales de su categoría. La comparación relevante aquí es interna, entre los dos artefactos del repositorio y el checkpoint original al que replican.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios con escala controlada o directamente cero, y la salida es ruido sin valor semántico.
- En el esqueleto completo, todos los pesos son cero, incluidas las normas y el router, por lo que el enrutamiento de expertos es degenerado y la numerica no representa al modelo real.
- Las escalas FP8 lineales se fuerzan a 1.0 (0x7F) en 7,2 MB de bytes reales para pasar el chequeo de rango del conversor; es una desviación respecto al checkpoint original.
- La versión reducida omite tensores MTP y de visión y recorta el vocabulario Engram a unas 1,2 millones de filas, así que no cubre esos caminos del grafo.
- El conversor elimina la plantilla de chat de forma intencionada; hay que usar `-st` y no esperar formato conversacional.
- Depende de un PR no fusionado de llama.cpp (#30817); el formato y el comportamiento del cargador pueden cambiar sin aviso.
- No sirve para medir calidad, perplejidad ni KLD, ni para comparar rendimiento real frente a otros modelos.
- Los metadatos de HuggingFace declaran 30.441.106.884 parámetros vía safetensors, pero el repositorio solo contiene GGUF y un script de Python; conviene tomar esa cifra con cautela.
- El modelo base puede tener su propia licencia y condiciones de uso; el README afirma que la licencia MIT es la misma que la del modelo fuente, pero no se aporta el texto ni la verificación.
- Adopción nula (0 descargas, 1 like) y sin validación de terceros; no hay informes de compatibilidad fuera del entorno del autor.
- No se publican idiomas soportados ni longitud de contexto, por lo que no se puede evaluar su comportamiento multilingüe ni conversacional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pull request de soporte DeepSeek-V4.1 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30817
- Script de generación del esqueleto: `make_skeleton.py`, incluido en el propio repositorio de HuggingFace
- La búsqueda web realizada no devolvió resultados relevantes: solo páginas de Fandom sin relación con el modelo, por lo que no se enlazan.
