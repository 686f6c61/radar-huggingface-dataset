# experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch

## Resumen

Llama-3.2-3B-Instruct-ExecuTorch es una exportación del modelo meta-llama/Llama-3.2-3B-Instruct (revisión `0cb88a4f764b`) al formato ExecuTorch `.pte`, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) sobre Android. No se trata de un modelo nuevo ni de un fine-tune: los pesos y la tokenización son los del Llama 3.2 3B Instruct de Meta, pero reempaquetados y cuantizados para ejecutarse en CPUs ARM64, GPUs Vulkan y aceleradores NPU de Qualcomm y MediaTek mediante el runtime ExecuTorch 1.5.1.

El interés del repositorio está en la matriz de backends y ventanas de contexto que ofrece: cinco ventanas (2k, 4k, 8k, 16k y 32k tokens) para XNNPACK y Vulkan, cuatro para Qualcomm QNN en Snapdragon 8 Elite y dos para MediaTek NeuroPilot en Dimensity 9400. Cada fichero fija la ventana en el propio binario, de modo que el runtime reserva la totalidad del KV cache al cargar; el autor incluye en cada `config.json` un campo `fits_phone_budget` que estima si el fichero cabe en un presupuesto de 5 GB de memoria del dispositivo.

El modelo base es un transformer denso de 3.210 millones de parámetros con 128.000 tokens de vocabulario y ventana nativa de 131.072 tokens, aunque aquí la ventana efectiva queda limitada por la variante elegida. Es relevante para quien necesite ejecutar un LLM de instrucciones de tamaño medio completamente offline en un teléfono Android moderno, sin depender de la nube, con licencia Llama 3.2 y pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B Instruct), exportado a ExecuTorch `.pte` |
| Parametros totales | 3.210 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens segun fichero (XNNPACK y Vulkan); 2.048 a 16.384 en QNN SM8750; 2.048 y 4.096 en MediaTek MT6991 |
| Tipos de cuantizacion | 8da4w con GPTQ (XNNPACK y Vulkan); hibrida QNN para HTP; a16w8 para NeuroPilot |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3.2, sin listado explicito en la model card) |
| Licencia | llama3.2 |
| Formato de pesos | `.pte` (ExecuTorch), varios backends: xnnpack, vulkan, qnn, mtk |
| Tamano del repositorio | 83,8 GB (incluye todas las variantes y ventanas) |
| Tamano por fichero | 2,21-2,24 GB (XNNPACK); 2,82-2,97 GB (Vulkan); 2,80-2,84 GB (QNN); 0,84-1,23 GB por chunk (MediaTek, dividido en 4 chunks) |
| Runtime requerido | ExecuTorch 1.5.1 |
| Libreria | executorch |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, entrenado por Meta con datos no especificados en esta model card. El repositorio no documenta el proceso de entrenamiento ni el dataset; toda la información de entrenamiento corresponde al modelo original de Meta y no se detalla aquí. La innovación técnica de esta exportación es el pipeline de cuantización y empaquetado: cuantización de pesos a 4 bits con GPTQ y activaciones a 8 bits (esquema 8da4w) para XNNPACK y Vulkan, esquema híbrido para el HTP de Qualcomm y a16w8 para NeuroPilot de MediaTek.

Cada fichero `.pte` incorpora una ventana de contexto fija: el runtime asigna el KV cache completo en el momento de la carga, por lo que no es posible cambiar la ventana en tiempo de ejecución y hay que elegir el fichero que quepa en la memoria del dispositivo. Los ficheros de MediaTek están divididos en cuatro chunks (chunk1of4 a chunk4of4) para sortear límites de tamaño del acelerador. El autor indica que solo se han ejecutado smoke tests reales en XNNPACK (todos pasaron, respondiendo "Paris"); el resto de backends solo tienen comprobación estructural porque no disponía de runtime NPU en el host.

## Capacidades

- Generación de texto e instrucciones conversacionales, heredadas de Llama 3.2 3B Instruct.
- Razonamiento básico, resumen, reescritura y respuesta a preguntas en formato chat.
- Generación de código y matemáticas a nivel de modelo de 3B, sin garantías de precisión en tareas complejas.
- Capacidades multilingües del modelo base (Llama 3.2 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque esta exportación no lista idiomas explícitamente.
- Ejecución 100% offline en dispositivo, sin llamadas a red.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta model card.
- Inferencia acelerada por backend: CPU ARM64 (XNNPACK), GPU Vulkan, NPU Qualcomm Hexagon (QNN HTP) y NPU MediaTek (NeuroPilot).

## Casos de uso

- Asistentes de texto offline en Android: integración en la app openweights o en cualquier runtime ExecuTorch 1.5.1 para ofrecer chat privado sin conexión, usando la variante XNNPACK de 2k o 4k en dispositivos con poca memoria.
- Procesamiento de documentos largos en el teléfono: la variante de 32k tokens (XNNPACK o Vulkan, 2,24-2,97 GB) permite resumir o extraer información de contratos, correos o artículos sin enviar datos a servidores externos.
- Atención al cliente en kioscos o terminales: despliegue de la variante QNN en Snapdragon 8 Elite para conversaciones multi-turno con baja latencia y sin coste de API, adecuado para entornos con conectividad limitada.
- Privacidad y cumplimiento normativo: casos donde los datos no pueden salir del dispositivo (sanidad, legal, finanzas) y se necesita un modelo de instrucciones de 3B con licencia Llama 3.2 y pesos abiertos.
- Prototipado de aplicaciones móviles con IA: uso de los ficheros de 2k para iterar rápidamente en emuladores y dispositivos ARM64, con smoke tests ya validados en XNNPACK.
- Evaluación de aceleradores NPU: comparación de rendimiento entre Snapdragon 8 Elite (QNN, hasta 16k) y Dimensity 9400 (NeuroPilot, hasta 4k) usando los mismos pesos y tokenizador, útil para equipos que eligen SoC para producto.
- Generación de texto en entornos educativos o de investigación: ejecución local de un Llama 3.2 3B cuantizado para experimentos de prompting sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta smoke tests cualitativos: las cinco variantes XNNPACK respondieron "Paris" correctamente; las variantes Vulkan, QNN y MediaTek solo pasaron comprobación estructural al no haber runtime NPU en el host del autor. No hay datos de latencia, throughput ni puntuaciones en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria estimada por fichero: 2,21-2,24 GB (XNNPACK), 2,82-2,97 GB (Vulkan), 2,80-2,84 GB (QNN), 0,84-1,23 GB por chunk en MediaTek (cuatro chunks por variante).
- Presupuesto de referencia del autor: 5 GB de memoria del dispositivo, con el campo `fits_phone_budget` en cada `config.json` como estimación.
- CPU: cualquier ARM64 para XNNPACK; no se documentan requisitos mínimos de núcleos ni frecuencia.
- GPU: cualquier ARM64 con soporte Vulkan para la variante Vulkan.
- NPU Qualcomm: SM8750 (Snapdragon 8 Elite) para QNN HTP, ventanas de 2k a 16k.
- NPU MediaTek: MT6991 (Dimensity 9400) para NeuroPilot, ventanas de 2k y 4k.
- No cabe en GPU de escritorio consumer (RTX 4090, etc.) porque el formato `.pte` está pensado para runtime ExecuTorch en ARM64; para escritorio habría que usar los pesos originales de Llama 3.2 3B en otro formato.
- Despliegue: runtime ExecuTorch 1.5.1 o la app openweights para Android. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-ExecuTorch (este) | 3,21B | 2k-32k segun fichero | `.pte`, ExecuTorch 1.5.1 | llama3.2 | Hugging Face, 862 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | safetensors, transformers | llama3.2 | Hugging Face (oficial de Meta) |
| Llama-3.2-1B-Instruct-ExecuTorch (si existiera exportacion equivalente) | no disponible | no disponible | no disponible | llama3.2 | no disponible |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens | safetensors, GGUF, etc. | Gemma Terms of Use | Hugging Face |

La comparación directa más relevante es con el modelo base sin exportar: misma arquitectura y pesos, pero contexto nativo de 131.072 tokens y formatos estándar para GPU/CPU de servidor. Frente a alternativas de tamaño similar como Gemma 2 2B, la ventaja de esta exportación es la ejecución en NPU móvil y la licencia Llama 3.2; la desventaja es el contexto efectivo limitado por fichero y la dependencia exclusiva de ExecuTorch.

## Limitaciones y advertencias

- Solo se han validado ejecuciones reales en XNNPACK; Vulkan, QNN y MediaTek solo tienen comprobación estructural, por lo que su funcionamiento en dispositivo no está verificado por el autor.
- La ventana de contexto es fija por fichero y el KV cache se reserva completo al cargar: elegir una ventana mayor de la que el dispositivo puede sostener provoca fallo de asignación.
- Los ficheros de MediaTek están divididos en cuatro chunks; el runtime debe cargarlos en orden y el tamaño total por variante es la suma de los chunks (aproximadamente 3,75 GB para 2k y 4k).
- El modelo base es de 3B parámetros: riesgo de alucinación y errores en razonamiento complejo, matemáticas y código de producción.
- Sesgos conocidos del modelo base Llama 3.2, no evaluados ni mitigados en esta exportación.
- Idiomas soportados no documentados explícitamente en la model card; se heredan del modelo base.
- Licencia llama3.2: uso comercial permitido bajo los términos de la licencia de Meta, con obligaciones de atribución ("Built with Llama") y restricciones de la política de uso aceptable.
- No se documenta soporte de tool calling ni de agentes; no asumir capacidades de function calling sin verificación.
- El repositorio ocupa 83,8 GB por incluir todas las variantes y ventanas; descargar solo el fichero necesario.
- La fecha de creación del repositorio (2026-09-13) y la revisión del modelo base (`0cb88a4f764b`) deben verificarse contra el repositorio oficial de Meta antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- App openweights para Android: https://github.com/alpharomercoma/openweights
- ExecuTorch (runtime): https://github.com/pytorch/executorch
- Documentación de ExecuTorch: https://docs.pytorch.org/executorch/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
