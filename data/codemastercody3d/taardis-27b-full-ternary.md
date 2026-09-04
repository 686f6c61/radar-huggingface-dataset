# CodeMasterCody3D/taardis-27b-full-ternary

## Resumen

TAARDIS-27B es un modelo de lenguaje de 27.000 millones de parámetros, desarrollado por CodeMasterCody3D (Cody Dixon), que aplica una cuantización ternaria extrema al modelo base Qwen/Qwen3.8-27B. Cada peso se representa como un entero ternario {-1, 0, +1} multiplicado por una escala, lo que reduce el tamaño del modelo a 5.90 GB (1.75 bits por peso) sin perder la capa de salida ni la tabla de embeddings, que también se cuantizan. El modelo está diseñado para ejecutarse en hardware limitado y es una alternativa de bajo coste a los modelos de 27B sin cuantizar.

La innovación principal es el sistema de corrección llamado "The Doctors": 496 ramas de baja dimensión y ternarias, entrenadas conjuntamente, que se cargan como un LoRA adicional y reducen el error de cuantización propagado. Sin estas correcciones, el modelo alcanza una perplejidad de 13.61 en wikitext; con ellas, baja a 11.83. El modelo requiere un fork específico de llama.cpp porque los pesos se almacenan en una base rotada (block-Hadamard) y el runtime debe rotar las activaciones; con llama.cpp estándar, la salida es incoherente.

Es relevante porque demuestra que es posible cuantizar un transformer denso de 27B a menos de 6 GB manteniendo una calidad razonable, y porque publica la receta completa de conversión, a diferencia de otros proyectos similares con procesos cerrados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen/Qwen3.8-27B; no es MoE |
| Parámetros totales | 27.000 millones (según el autor; el repositorio de HuggingFace reporta 460.125.184 en safetensors) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el Colab menciona "1M-token ternary context", no confirmado) |
| Tipos de cuantización | Ternario completo: {-1, 0, +1} × escala; V2 a 1.75 bits/peso, V1 a 2.125 bits/peso; normas y escalas en grid entero |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal y LoRA de corrección "The Doctors") |

## Arquitectura y entrenamiento

El modelo es una conversión post-training del transformer denso Qwen/Qwen3.8-27B. No se trata de un entrenamiento desde cero, sino de una cuantización que transforma todos los pesos —incluidos el LM head y la tabla de embeddings— en enteros ternarios {-1, 0, +1} multiplicados por una escala. Las normas y las escalas de grupo también se representan en el grid entero mediante pilas de dígitos ternarios balanceados (k8/k6). Los pesos se almacenan en una base rotada mediante transformadas de Hadamard por bloques, por lo que el runtime debe aplicar la rotación inversa a las activaciones; de ahí la necesidad del fork de llama.cpp.

El sistema de corrección "The Doctors" consiste en 496 ramas de baja dimensión y ternarias, de rango entre 8 y 256 por multiplicación de matrices, entrenadas conjuntamente para cancelar el error de cuantización propagado a través de las capas. Se empaquetan como un LoRA nativo de llama.cpp con la rotación de base plegada offline. Según el autor, este mecanismo es 3,3 veces más efectivo que la corrección por capa en datos de validación. No se han proporcionado datos concretos sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO. El repositorio de HuggingFace reporta un total de 460.125.184 parámetros en safetensors, cifra que no coincide con la afirmación del autor de 27.000 millones; se recomienda verificar antes de usar el modelo en producción.

## Capacidades

- Generación de texto y chat conversacional: el modelo incluye una demo en Colab que abre una interfaz de chat.
- Razonamiento heredado del modelo base Qwen3.8-27B; no se especifican capacidades adicionales de razonamiento.
- Corrección de errores de cuantización mediante The Doctors: ramas LoRA ternarias de baja dimensión que mejoran la perplejidad de 13.61 a 11.83 en wikitext.
- KV-cache ternario opcional (1.75 bits por valor), que reduce el consumo de memoria en contextos largos.
- Soporte de contexto largo: el Colab menciona un contexto ternario de 1M tokens, aunque no se confirma en la ficha del modelo.
- No se mencionan capacidades multimodales, tool calling, function calling ni agentes.

## Casos de uso

- Inferencia local en equipos de consumo: con un peso de 5.90 GB, el modelo puede ejecutarse en una RTX 3060 12GB o similar, usando el fork de llama.cpp con kernels CUDA. Es adecuado para prototipado sin acceso a GPUs de datacenter.
- Despliegue de chatbots en entornos con restricciones de memoria: al usar 1.75 bits por peso, se reduce el coste de memoria; se puede servir con llama-server en un servidor con una GPU modesta.
- Análisis de documentos extensos: la opción de KV-cache ternario y el contexto largo (1M según el Colab) permiten procesar documentos largos con menos VRAM que un modelo de 27B sin cuantizar.
- Investigación en cuantización extrema: la receta abierta y el fork publicado permiten estudiar los efectos de la ternarización en transformers densos y comparar con otros métodos.
- Experimentación con corrección de errores de cuantización: The Doctors ofrece un caso de estudio para técnicas de reparación de errores propagados en modelos cuantizados.
- Educación en inferencia eficiente: el proyecto documenta el pipeline completo de conversión, cuantización y corrección, útil para cursos sobre optimización de LLMs.
- Aplicaciones con CPU AVX2: los kernels ternarios permiten ejecutar el modelo en CPU sin GPU, adecuado para servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la perplejidad en wikitext (contexto 512, 274 chunks), medida con el mismo binario, kernels y texto:

| Configuración | Perplejidad (wikitext c512) |
|---|---|
| V1 / V2 pesos solos | 13.61 / 13.6114 |
| V2 + The Doctors (recomendado) | 11.8346 |
| Ternary-Bonsai-27B (referencia) | 11.01 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo V2 ocupa 5.90 GB; con The Doctors (0.92 GB) el total es 6.82 GB. No se especifica la VRAM mínima, pero hay que añadir el overhead de activaciones y KV-cache; en la práctica se necesitará al menos esa cantidad más un margen.
- GPU recomendadas: RTX PRO 6000 (Blackwell) usada en las pruebas; también A100, H100, RTX 40xx, RTX 30xx y T4/RTX 20xx (arquitecturas CUDA 75, 80, 86, 89).
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12GB, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp (fork específico), llama-cli, llama-server y llama-bench. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: en RTX PRO 6000, con llama-bench, V2 (1.75 bpw): decode 90 t/s, prompt 2350 t/s; V1 (2.125 bpw): decode 101 t/s, prompt 2690 t/s. Antes de los kernels optimizados, ambos decodificaban a ~8 t/s en la misma GPU.
- Para CPU: build con AVX2 y kernels ternarios.

## Comparativa con modelos similares

La comparación disponible es con Ternary-Bonsai-27B de PrismML, otro modelo ternario basado también en Qwen3.8-27B. Se incluye el modelo base sin cuantizar como referencia, aunque no se dispone de datos:

| Parámetro | TAARDIS-27B V2 | Ternary-Bonsai-27B | Qwen3.8-27B (base) |
|---|---|---|---|
| Tamaño GGUF ternario | 5.90 GB (1.75 bpw) | 7.17 GB (2.125 bpw) | No disponible |
| Tamaño con correcciones | 6.82 GB | No disponible | No disponible |
| Perplejidad wikitext c512 | 11.8346 (con Doctors) | 11.01 | No disponible |
| Normas y escalas | Grid entero (k8/k6) | FP16 | No disponible |
| Head + embedding | Ternario | Ternario | No disponible |
| KV-cache ternario | Sí (1.75 bits/valor) | No | No disponible |
| Receta de conversión | Abierta | Cerrada | No disponible |
| Licencia | Apache 2.0 | No disponible | No disponible |

## Limitaciones y advertencias

- Requiere el fork de llama.cpp; con llama.cpp estándar el modelo produce resultados incoherentes (perplejidad aproximada de 1.260.000).
- La perplejidad es mayor que la de Ternary-Bonsai-27B (11.83 vs 11.01), lo que indica una calidad de lenguaje ligeramente inferior.
- Es una conversión post-training, no un modelo entrenado desde cero; la cuantización extrema puede degradar el rendimiento en tareas complejas.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no se puede evaluar su rendimiento en razonamiento, matemáticas o código.
- Idiomas soportados no especificados; se asume que hereda los del modelo base, pero no se confirma.
- No se mencionan capacidades de tool calling, agentes, visión o audio.
- Riesgo de alucinación inherente; la cuantización ternaria puede aumentar la probabilidad de errores en generación.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación externa.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue depende del fork de llama.cpp; se recomienda revisar la licencia del fork.

## Enlaces

- HuggingFace: https://huggingface.co/CodeMasterCody3D/taardis-27b-full-ternary
- Colab (demo): https://colab.research.google.com/github/CodeMasterCody3D/taardis-llama.cpp/blob/q1_0_g128-port/notebooks/TAARDIS_chat.ipynb
- Repositorio del fork de llama.cpp: https://github.com/CodeMasterCody3D/taardis-llama.cpp (rama q1_0_g128-port)
- Perfil del autor en HuggingFace: https://huggingface.co/CodeMasterCody3D
