# eaguilar/gaje-nano-0.5b

## Resumen

GAJE Nano 0.5B es un modelo de lenguaje basado en Qwen2.5-0.5B-Instruct, adaptado por el autor eaguilar al ecosistema GAJE Semantic Compression. Se presenta como una "versión transmutada" en un formato binario plano denominado `.flat v2`, diseñado para carga ultrarrápida mediante memoria mapeada (mmap) con alineación a 4 KB y un tiempo de carga declarado inferior a 2 ms. El modelo incorpora un tokenizador propio (GTOK v1.0) incrustado en la cabecera, así como una cuantización híbrida Q4_0 en capas de atención y FFN con preservación de anclas semánticas.

El proyecto apunta a la inferencia en entornos de borde (edge AI) y navegador mediante WebAssembly (WASM), con un runtime en Rust (`gaje-core`) y una interfaz de línea de comandos (`gaje-cli`). Con 490 millones de parámetros, se posiciona como una opción ligera para despliegue en dispositivos con recursos limitados, aunque la documentación no detalla el proceso de entrenamiento ni ofrece resultados de benchmarks. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA (14 query heads, 2 KV heads), 24 bloques, dimensión de embedding 896 |
| Parametros totales | 490M (0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen2.5-0.5B-Instruct, sin especificar) |
| Tipos de cuantizacion | Q4_0 en atención y FFN (híbrida, con preservación de anclas semánticas) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se documenta para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.flat v2` (binario propietario con mmap zero-copy, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso estándar con atención multi-consulta agrupada (GQA), heredada de Qwen2.5-0.5B-Instruct. La innovación principal radica en el formato de serialización `.flat v2`, que permite mapeo directo en memoria sin copias adicionales, reduciendo la latencia de carga a menos de 2 ms según la documentación. La cuantización Q4_0 se aplica por capas, manteniendo ciertos "anclas semánticas" sin cuantizar para preservar la calidad de las representaciones.

No se proporcionan detalles sobre el entrenamiento: número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) o fine-tuning específico. El modelo se describe como una adaptación del checkpoint instruct de Qwen2.5-0.5B, pero no se indica si hubo entrenamiento adicional o solo conversión de formato. El tokenizador GTOK v1.0, de 3.62 MB, se integra en la cabecera del archivo, lo que elimina dependencias externas de tokenización.

## Capacidades

- Generación de texto conversacional: el modelo puede operar en modo chat mediante `gaje-cli chat`.
- Inferencia multiplataforma: soporta CPU, GPU y navegador vía WASM, con runtime en Rust.
- Benchmarking integrado: la CLI incluye un comando `benchmark` para evaluar perplejidad y rendimiento.
- Despliegue como servidor web: `gaje-cli serve` permite exponer una interfaz HTTP para inferencia remota.
- Carga ultrarrápida: gracias al mapeo mmap, el modelo está listo para inferencia en menos de 2 ms, adecuado para aplicaciones con arranque en frío.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio; se limita a texto.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo cabe en RAM reducida (~1.3 GB) y carga en milisegundos, lo que permite chatbots locales en routers, raspberry Pi o terminales industriales sin depender de la nube.
- Aplicaciones web con inferencia en navegador: gracias a la compilación WASM, se puede ejecutar el modelo directamente en el cliente, útil para prototipos de demostración o aplicaciones con requisitos de privacidad estrictos.
- Generación de texto en entornos sin GPU: al ser un modelo de 0.5B cuantizado, puede ejecutarse en CPU convencional con latencia aceptable para tareas de autocompletado o redacción breve.
- Servicios de chat autocontenidos: el comando `serve` permite levantar un endpoint HTTP en pocos segundos, ideal para microservicios internos de baja carga.
- Evaluación de perplejidad y experimentación: la suite de benchmark integrada facilita la comparación de variantes de cuantización o ajustes del formato `.flat` en pipelines de investigación.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo pequeño y de carga instantánea, es adecuado para pruebas de concepto y desarrollo iterativo en equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Tampoco se especifican valores de perplejidad o throughput. Cualquier afirmación sobre rendimiento cualitativo carece de respaldo empírico en la documentación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 490M parámetros con cuantización Q4_0 (4 bits por peso), el uso de memoria para los pesos ronda los 0.25 GB (490M × 0.5 bytes ≈ 245 MB). Sumando overhead de activaciones y KV cache, se estima que cabe en GPUs con 1 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan, incluyendo integradas de gama baja (por ejemplo, Intel Iris Xe, AMD Radeon 780M). Para CPU, basta un procesador x86_64 o ARM64 con al menos 2 GB de RAM libre.
- Compatibilidad con consumer GPU: sí, es adecuado para tarjetas como NVIDIA GTX 1650, RTX 3050 o equivalentes de AMD.
- Opciones de despliegue: runtime nativo en Rust (`gaje-core`), CLI (`gaje-cli`), servidor HTTP integrado y compilación a WebAssembly para navegador. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan mediciones. Dado el tamaño, en CPU moderna se espera una generación de decenas de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base Qwen2.5-0.5B-Instruct y con otros modelos pequeños de la misma categoría. Los datos de contexto y rendimiento del modelo GAJE no están disponibles, por lo que la comparación se limita a parámetros y licencia.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| eaguilar/gaje-nano-0.5b | 490M | no disponible | Apache 2.0 | `.flat v2` (propietario) |
| Qwen2.5-0.5B-Instruct | 490M | 32K (según ficha oficial de Qwen) | Apache 2.0 | safetensors |
| SmolLM2-360M | 360M | 2048 | Apache 2.0 | safetensors |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors |

La principal diferencia del modelo GAJE es su formato de serialización y el runtime en Rust, que prioriza la velocidad de carga y el despliegue en entornos sin dependencias pesadas. Sin embargo, la interoperabilidad se ve reducida: no es compatible con herramientas estándar como Hugging Face Transformers o llama.cpp sin un adaptador específico.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento de ese modelo.
- Riesgo de alucinación: al ser un modelo pequeño, su capacidad de razonamiento y memoria factual es limitada; es propenso a errores en tareas complejas o de conocimiento específico.
- Limitaciones de contexto: no se especifica la longitud de contexto; si se mantiene la del modelo base (32K), es razonable, pero no está confirmado.
- Formato propietario: el uso del modelo requiere el ecosistema `gaje-core`/`gaje-cli`; no se puede cargar con bibliotecas estándar sin conversión previa, lo que limita su adopción en pipelines existentes.
- Falta de documentación sobre entrenamiento: no se indica si hubo fine-tuning adicional o solo conversión de formato; la calidad del modelo no está validada con benchmarks públicos.
- Sin soporte de herramientas avanzadas: no se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, por lo que no es adecuado para aplicaciones que requieran esas funcionalidades.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto en fase temprana sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eaguilar/gaje-nano-0.5b
- Organización GAJE en Hugging Face: https://huggingface.co/eaguilar/gaje
- Modelo base (Qwen2.5-0.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
