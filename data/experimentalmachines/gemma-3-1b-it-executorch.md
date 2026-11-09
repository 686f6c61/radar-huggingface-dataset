# experimentalmachines/gemma-3-1b-it-ExecuTorch

## Resumen

`experimentalmachines/gemma-3-1b-it-ExecuTorch` es una exportación del modelo `google/gemma-3-1b-it` de Google a formato ExecuTorch, pensada para inferencia en dispositivos Android con aceleración NPU. El autor, experimentalmachines, publica dos ficheros `.pte` (chunks 1 y 2) compilados específicamente para la NPU MediaTek NeuroPilot MT6991, presente en el SoC Dimensity 9400, junto con la tabla de embeddings en fp32 y el tokenizador original. No es un modelo nuevo: es una derivación cuantizada del Gemma 3 de 1B parámetros en su variante instruction-tuned.

La relevancia de esta ficha reside en que ejemplifica el flujo de despliegue on-device de un LLM de 1B parámetros sobre hardware móvil de gama alta, con cuantización A16W8 (activaciones de 16 bits, pesos de 8 bits) y una ventana de contexto fija de 512 tokens embebida en el propio fichero. El repositorio ocupa 2,3 GB y no registra descargas ni interacciones en el momento de la consulta.

Arquitectónicamente hereda el transformer decoder-only de Gemma 3 1B, con atención global y deslizante, y se distribuye bajo la licencia Gemma de Google. Su utilidad práctica está acotada al ecosistema MediaTek/ExecuTorch 1.5.1 y al runner de ejemplo del propio framework.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con capas de atención global y deslizante |
| Parámetros totales | 1B (heredados de google/gemma-3-1b-it) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana fija embebida en el fichero `.pte`) |
| Tipos de cuantización | A16W8 (activaciones 16 bits, pesos 8 bits); embeddings en fp32 |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | gemma |
| Formato de pesos | `.pte` (ExecuTorch), `embedding-fp32.bin`, `tokenizer.json` |
| Tamaño del repo | 2,3 GB |
| Backend | MediaTek NeuroPilot MT6991 (Dimensity 9400) |
| Runtime | ExecuTorch 1.5.1 |
| Chunks | 2 ficheros: 0,38 GB y 0,69 GB |
| Revisión del modelo base | dcc83ea841ab |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-1b-it`, un transformer decoder-only de 1B parámetros con atención global y atención de ventana deslizante, entrenado por Google y ajustado por instrucciones. Esta exportación no reentrena el modelo: parte de los pesos originales y los convierte a formato ExecuTorch mediante el flujo de exportación MediaTek LLM (`examples/mediatek`, `gemma.py`) incluido en ExecuTorch 1.5.1.

El proceso de conversión aplica cuantización A16W8 calibrada sobre los prompts de `alpaca.txt` de MediaTek (9 de 9) en la plantilla de chat `gemma.json`. El grafo se corta en dos chunks y se compila con el SDK MediaTek NeuroPilot Express (mtk_converter 8.13.0+public, mtk_neuron 8.2.23) para el target MT6991. Se genera un grafo de prompt de 128 tokens y un grafo de generación de un token sobre una caché KV de 512 tokens. La caché se asigna completa al cargar el modelo, de ahí que la ventana sea fija.

Una innovación técnica destacable es el manejo de dos tablas de rotary embedding: las capas globales usan `rot_emb_base` 1e+06 y las deslizantes `rot_emb_local_base` 10000, con máscara de ventana deslizante de 512. El runner de MediaTek tal como se distribuye en ExecuTorch 1.5.1 construye una sola tabla y no puede ejecutar estos ficheros correctamente; con una tabla única el modelo se aleja del original (perplejidad 22,7 frente a 9,6 en fp32), y con ambas coincide exactamente.

## Capacidades

- Generación de texto en modo chat (instruction-tuned) mediante la plantilla `gemma.json`.
- Razonamiento y respuesta a instrucciones heredados de Gemma 3 1B IT.
- Generación de código y matemáticas básicas, limitada por el tamaño del modelo y la ventana de 512 tokens.
- Inferencia on-device en Android con aceleración NPU MediaTek (Dimensity 9400).
- Ejecución mediante el runner de ExecuTorch (`examples/mediatek/executor_runner`) y la app openweights.
- Soporte multilingüe heredado del modelo base, aunque la model card no enumera idiomas concretos.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en esta exportación.

## Casos de uso

- Asistentes conversacionales embebidos en apps Android: el modelo corre en la NPU del Dimensity 9400 con una ventana de 512 tokens, suficiente para diálogos de turnos cortos sin salir del dispositivo y sin conexión a red.
- Autocompletado y reescritura de texto en teclados o editores móviles: la latencia de un grafo de generación de un token sobre caché de 512 permite sugerencias incrementales en local.
- Clasificación y extracción de información en local: con prompts de hasta 128 tokens en el grafo de prompt, se pueden procesar notas, correos o mensajes para extraer entidades o resumir en una frase.
- Prototipado de pipelines ExecuTorch: sirve como referencia funcional para validar el flujo de exportación MediaTek LLM y el runner antes de portar modelos mayores.
- Demostraciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, encaja en escenarios donde los datos no pueden enviarse a la nube (salud, finanzas personales).
- Investigación sobre cuantización A16W8 en NPU: el par de ficheros y los `export-report-<window>.json` permiten reproducir y comparar la calidad frente al modelo fp32 original.
- Integración en la app openweights: cliente Android de referencia para probar modelos ExecuTorch en hardware MediaTek real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comparación de perplejidad: 22,7 con una sola tabla de rotary embedding frente a 9,6 en fp32 del modelo original, y coincidencia exacta cuando el runner construye ambas tablas.

## Requisitos de hardware

- NPU MediaTek NeuroPilot MT6991 (SoC Dimensity 9400); no hay runtime NPU en host, por lo que la validación en escritorio se limita a comprobar la estructura de los ficheros.
- Presupuesto de memoria estimado por el autor: 5 GB (`fits_phone_budget` en cada `config.json`).
- Tamaño en disco: 0,38 GB (chunk 1) + 0,69 GB (chunk 2) + tabla de embeddings fp32 + tokenizador; repo total de 2,3 GB.
- Caché KV de 512 tokens asignada completa al cargar; la ventana debe caber en el presupuesto del dispositivo.
- Despliegue mediante ExecuTorch 1.5.1 con el runner MediaTek (`examples/mediatek/executor_runner`) o la app openweights.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: el formato `.pte` es específico de ExecuTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| experimentalmachines/gemma-3-1b-it-ExecuTorch | 1B | 512 tokens (fijo) | `.pte` (ExecuTorch) | gemma | Hugging Face, repo de 2,3 GB |
| google/gemma-3-1b-it | 1B | no disponible en la información | safetensors (formato original) | gemma | Hugging Face |
| Otros modelos ExecuTorch de la familia Gemma 3 | no disponible | no disponible | `.pte` | gemma | no disponible |

No se dispone de datos de benchmarks ni de otras exportaciones ExecuTorch comparables en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto fija de 512 tokens embebida en el fichero; no es configurable en tiempo de ejecución.
- El runner MediaTek incluido en ExecuTorch 1.5.1 no construye las dos tablas de rotary embedding necesarias; sin un runner adaptado, la calidad cae drásticamente (perplejidad 22,7 frente a 9,6).
- Solo se ha validado la estructura de los ficheros en host; no hay runtime NPU disponible fuera del dispositivo MediaTek, por lo que no se ha ejecutado un smoke test funcional completo.
- Dependencia de hardware muy específica (MT6991 / Dimensity 9400) y del SDK MediaTek NeuroPilot Express 8.0.8-build20250925; los binarios se distribuyen bajo los términos de licencia de MediaTek para dicho SDK, sin incluir el SDK ni las librerías de runtime.
- Licencia Gemma: uso comercial sujeto a los términos de Google; es una derivación cuantizada y requiere la atribución recogida en `NOTICE`.
- Modelo de 1B parámetros: capacidad de razonamiento y conocimiento factual limitados; riesgo de alucinación en dominios especializados.
- No se documentan sesgos específicos ni evaluación de seguridad en esta exportación.
- Idiomas soportados no declarados en la model card.
- Sin descargas ni interacciones registradas: no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- App openweights: https://github.com/alpharomercoma/openweights
- Ejemplos MediaTek de ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/mediatek
- Fichero chunk 1: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch/blob/main/mtk/mt6991/gemma-3-1b-it-neuropilot-a16w8-512-chunk1of2.pte
- Fichero chunk 2: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch/blob/main/mtk/mt6991/gemma-3-1b-it-neuropilot-a16w8-512-chunk2of2.pte
- Tabla de embeddings: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch/blob/main/mtk/mt6991/gemma-3-1b-it-neuropilot-embedding-fp32.bin
- Tokenizador: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch/blob/main/tokenizer.json
- Aviso de atribución: https://huggingface.co/experimentalmachines/gemma-3-1b-it-ExecuTorch/blob/main/NOTICE
