# hyperionaidev/Bonsai-8B-tvbox-GGUF

## Resumen

Bonsai-8B-tvbox-GGUF es una redistribución optimizada del modelo denso Bonsai-8B de PrismML, publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. Se trata de una cuantización de 1 bit (Q1_0) empaquetada en formato GGUF de 1,11 GB que mantiene los pesos originales byte a byte y solo modifica la cabeza de salida, recortándola de 151.669 a 61.592 filas de vocabulario mediante un tensor adicional `output_ids`. El objetivo es ejecutar un modelo de 7.819.654.296 parámetros en hardware extremadamente limitado: la model card documenta 5,2 tok/s en una Xiaomi TV Box S (3.ª generación) con cuatro núcleos Cortex-A55 y aproximadamente 1 GB de RAM útil.

La relevancia de esta ficha es doble. Por un lado, demuestra que un transformer denso de casi 8.000 millones de parámetros puede residir íntegramente en RAM de menos de 1 GB gracias a la cuantización de 1 bit y a un kernel de tablas de búsqueda para las matmuls. Por otro, ilustra un patrón de publicación poco habitual: el artefacto no es cargable en llama.cpp estándar, LM Studio ni Ollama, sino que requiere un parche específico del repositorio smolmaxxing. Es, por tanto, un experimento de ingeniería de despliegue en el borde más que un modelo listo para producción general.

El modelo base es prism-ml/Bonsai-8B-unpacked, un transformer denso de 8B con licencia Apache-2.0. Esta versión tvbox hereda esa licencia y añade el recorte de vocabulario orientado a inglés y corpus multilingüe. No se dispone de información sobre la longitud de contexto nativa del modelo original más allá de los 1.024 tokens usados en las pruebas de la TV box, ni sobre la composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base); inferencia con kernel de lookup-table para matmuls de 1 bit |
| Parámetros totales | 7.819.654.296 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens documentados en las pruebas de la TV box; contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q1_0 (1 bit) en GGUF; caché KV en q8_0 en la configuración de referencia |
| Idiomas soportados | No disponible (la cabeza de salida se seleccionó por frecuencia de tokens en corpus inglés y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`b8-q1-hml.gguf`, 1,11 GB), requiere llama.cpp parcheado |
| SHA-256 del archivo | `fc297cb38da889fca700c9417fc315e90fc6fd49f118c920ab7d19b2f0e0d42a` |
| Cabeza de salida | 61.592 de 151.669 filas de vocabulario más tensor `output_ids` |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 8B parámetros. La contribución de esta publicación no es el entrenamiento, sino la compresión y el reempaquetado: los pesos Q1_0 se copian byte a byte desde `prism-ml/Bonsai-8B-gguf` (`Bonsai-8B-Q1_0.gguf`) y el único cambio es el recorte de la cabeza de salida a 61.592 filas, elegidas por frecuencia de tokens sobre un corpus inglés y multilingüe (`data/head-ids-qwen3-ml64k.txt`). Los prompts pueden emplear cualquier token del vocabulario original, pero la generación queda restringida a los tokens presentes en la cabeza recortada.

La innovación técnica está en el runtime: un kernel de tabla de búsqueda (lookup-table) ejecuta las multiplicaciones matriciales de 1 bit, y el repositorio smolmaxxing aplica un parche sobre llama.cpp en el commit `8642541` (`patches/llama.cpp-v0.8.0-tvbox.patch`). El despliegue usa un modo headless que libera la RAM que el launcher de Android retendría en condiciones normales, y una caché de reempaquetado (`GGML_REPACK_CACHE`) de aproximadamente 1 GB en flash que se escribe en la primera ejecución y se mapea en las siguientes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: la model card incluye una interfaz de chat (`tv-llm-ui`) y etiqueta el pipeline como `text-generation` con tag `conversational`.
- Razonamiento y generación de código: capacidades heredadas del modelo base Bonsai-8B; no se documentan evaluaciones específicas en esta publicación.
- Ejecución en el borde: inferencia íntegra en RAM de menos de 1 GB, sin GPU ni aceleradores dedicados.
- Multilingüismo parcial: la cabeza de salida se seleccionó con un corpus inglés y multilingüe, pero no se especifica la lista de idiomas cubiertos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos de gama baja: el modelo cabe en 0,96 GB de pesos residentes y sostiene 5,2 tok/s en una TV box con Cortex-A55, lo que permite integrar un chatbot local en televisores, decodificadores o equipos IoT sin conexión a la nube.
- Procesamiento de lenguaje natural en el borde sin conectividad: al mantener todos los pesos en RAM y no requerir GPU, encaja en escenarios de campo, kioscos o instalaciones aisladas donde no hay red ni aceleradores.
- Clasificación y extracción de texto en local: con un contexto de 1.024 tokens y una velocidad de 4,0 tok/s cerca del límite de contexto, sirve para tareas cortas de resumen, etiquetado o extracción de entidades en dispositivos empotrados.
- Prototipado de pipelines de IA generativa en hardware reciclado: el proyecto smolmaxxing demuestra cómo reutilizar hardware Android antiguo como nodo de inferencia, útil para laboratorios con presupuesto reducido.
- Investigación sobre cuantización extrema: el artefacto permite reproducir experimentos de 1 bit con métricas de perplejidad convertidas a bits por byte (0,991 global, 0,974 en las posiciones de la cabeza), comparables entre tokenizadores distintos.
- Demostración educativa de recorte de vocabulario: el parche y el tensor `output_ids` constituyen un ejemplo práctico de cómo reducir el coste de la capa de salida en modelos grandes sin reentrenar.
- Evaluación de runtimes alternativos: sirve para medir el impacto del parche de llama.cpp frente al runtime estándar en términos de RAM, velocidad de prompt processing (5,8-6,1 tok/s) y calidad.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Velocidad de chat real | 5,2 tok/s (rango 5,1-5,4 con llama-bench) | Xiaomi TV Box S 3.ª gen, 4× Cortex-A55, ~1 GB RAM |
| Velocidad cerca de contexto lleno | 4,0 tok/s | Contexto de 1.024 tokens |
| Prompt processing | 5,8-6,1 tok/s | Misma plataforma |
| Calidad (bits por byte) | 0,991 | Perplejidad en inglés sobre texto fijo de 22 KB |
| Calidad en posiciones de la cabeza | 0,974 | Mismo texto, restringido a las posiciones de la cabeza recortada |
| RAM de pesos | 0,96 GB | Modo headless, todos los pesos residentes |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden a mediciones de despliegue y perplejidad, no a evaluaciones de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU con pesos residentes en RAM (0,96 GB).
- RAM mínima: aproximadamente 1 GB útil, más la caché de reempaquetado de ~1 GB en almacenamiento flash.
- GPU recomendadas: no se documentan; el caso de referencia es una CPU ARM de cuatro núcleos sin acelerador.
- Cabe en GPU de consumo: no disponible; no se han publicado pruebas con GPU.
- Opciones de despliegue: exclusivamente llama.cpp parcheado desde el repositorio smolmaxxing. llama.cpp estándar, LM Studio y Ollama no cargan el archivo.
- Comando de referencia: `GGML_REPACK_CACHE=cache/b8l GGML_REPACK_RESIDENT_MB=962 llama-server -m b8-q1-hml.gguf -t 3 -c 1024 -ctk q8_0 -ctv q8_0 -fa on -cram 0`.
- Latencia y throughput: 5,2 tok/s en generación y 5,8-6,1 tok/s en procesamiento de prompt sobre la TV box de referencia; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-8B-tvbox-GGUF (este) | 7,82B | 1.024 tokens documentados | Q1_0 GGUF, cabeza recortada a 61.592 filas | Apache-2.0 | Requiere llama.cpp parcheado (smolmaxxing) |
| prism-ml/Bonsai-8B-gguf | 8B | No disponible | GGUF, cabeza completa | Apache-2.0 | llama.cpp estándar |
| prism-ml/Bonsai-8B-unpacked | 7,82B | No disponible | Pesos sin empaquetar | Apache-2.0 | Hugging Face |

La comparativa con modelos de otros desarrolladores no está disponible en la información proporcionada. Frente a la versión original de PrismML, este artefacto reduce el tamaño del archivo a 1,11 GB y permite ejecución en ~1 GB de RAM, a cambio de restringir el vocabulario de salida y exigir un runtime modificado.

## Limitaciones y advertencias

- El archivo no es compatible con llama.cpp estándar, LM Studio ni Ollama; requiere compilar el parche `llama.cpp-v0.8.0-tvbox.patch` sobre el commit `8642541`.
- La cabeza de salida está recortada: el modelo solo puede generar 61.592 de los 151.669 tokens del vocabulario original, lo que puede degradar la calidad en dominios con vocabulario especializado o idiomas poco representados en el corpus de selección.
- La cuantización de 1 bit implica una pérdida de calidad medible (0,991 bits por byte de perplejidad en inglés), no comparable a cuantizaciones de 4 u 8 bits.
- El contexto documentado es de solo 1.024 tokens; no se especifica el contexto nativo del modelo base ni su comportamiento más allá de ese límite.
- No hay información sobre sesgos, alucinación o evaluación de seguridad del modelo base ni de esta variante.
- La licencia Apache-2.0 permite uso comercial, pero la obligación de usar un runtime parcheado y la falta de benchmarks estándar complican la validación en producción.
- El rendimiento medido (5,2 tok/s) corresponde a una plataforma concreta; no hay datos de latencia en x86, GPU u otros SoC.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/hyperionaidev/Bonsai-8B-tvbox-GGUF
- Modelo base: https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- GGUF original de PrismML: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (secciones 14 y 19): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/bonsai-8b.html
