# shivrajgurjar/Alok-v2-1.5B-NSLRE

## Resumen

Alok v2.0 (identificador `shivrajgurjar/Alok-v2-1.5B-NSLRE`) es un modelo de lenguaje de 1.543.714.304 parámetros (1,56B) publicado por el usuario shivrajgurjar en Hugging Face. Se construye como un ajuste fino del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, orientado a tareas de razonamiento neuro-simbólico, generación de código y resolución de problemas matemáticos mediante la combinación de un backbone transformer con módulos externos de búsqueda (MCTS), demostración automática (SymPy, Z3) y ejecución en sandbox.

El autor lo presenta como un motor compuesto por cuatro "pilares": un núcleo de código políglota, un crítico de valor latente contrastivo (`critic_head.pt`), un sistema de búsqueda MCTS guiado por ejecución con depurador automático de trazas, y un demostrador determinista SymPy + Z3 con sandbox para Python, C++17 y Node.js, además de un banco de habilidades auto-mejorable (`v2_skill_bank.json`). Conviene subrayar que el repositorio de Hugging Face contiene únicamente los pesos del modelo en formato safetensors (3,1 GB); los componentes auxiliares citados en la model card (código fuente `alok_v2_src/`, critic head, skill bank) no forman parte de los ficheros del repo según la información disponible.

La relevancia del modelo es limitada en términos prácticos: cuenta con 0 descargas y 0 likes en el momento de la consulta, y la model card es escasa en datos verificables (no documenta composición del dataset, número de tokens de entrenamiento, benchmarks ni idiomas soportados). Su interés reside en la propuesta arquitectónica híbrida neuro-simbólica sobre una base pequeña y de licencia permisiva (Apache 2.0), que podría resultar útil para experimentación en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con ajuste fino; el autor añade módulos externos neuro-simbólicos (MCTS, SymPy, Z3, sandbox) |
| Parametros totales | 1.543.714.304 (1,56B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card menciona "fluent English" y "polyglot code", sin lista formal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-Coder-1.5B-Instruct, sobre el que se han fusionado adaptadores LoRA auto-destilados según indica el autor. El resultado se distribuye como un checkpoint único en bfloat16 de 1,56B parámetros. La model card describe un sistema compuesto por cuatro módulos: un "Code Cortex" para generación de código políglota, un crítico de valor latente contrastivo (`critic_head.pt`, con una precisión de ranking del 100 % en validación según el autor), un motor MCTS guiado por ejecución con depurador automático de trazas y un demostrador determinista basado en SymPy y Z3 con sandbox para Python, C++17 y Node.js, complementado por un banco de habilidades auto-mejorable.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de destilación. Tampoco se documentan innovaciones a nivel de atención (attention linear, decodificación especulativa) ni variantes arquitectónicas del backbone. La propuesta de valor técnica se concentra, por tanto, en el andamiaje neuro-simbólico externo, no en el modelo base en sí.

## Capacidades

- Generación de texto conversacional en inglés, según la model card.
- Generación de código en múltiples lenguajes ("polyglot code"), con especial énfasis en Python, C++17 y Node.js según los módulos descritos.
- Razonamiento matemático asistido por SymPy y Z3 (demostración determinista de teoremas y resolución simbólica).
- Búsqueda guiada por ejecución mediante MCTS, con depuración automática a partir de trazas de compilador.
- Crítico de valor latente para ranking de soluciones candidatas (componente externo `critic_head.pt`).
- Ejecución en sandbox de código generado (Python, C++17, Node.js) a través del módulo `v2_kernel.py`.
- Banco de habilidades auto-mejorable (`v2_skill_bank.json`) para reutilización de soluciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado formalmente, aunque el MCTS y el banco de habilidades sugieren un flujo iterativo.
- Capacidades multilingües: no disponible (sin lista de idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Resolución asistida de problemas matemáticos: el modelo puede combinarse con el demostrador SymPy/Z3 descrito para verificar paso a paso identidades algebraicas o demostraciones formales, aprovechando la naturaleza determinista del kernel simbólico.
- Generación y verificación de código en pipelines de CI: el sandbox para Python, C++17 y Node.js permite ejecutar el código generado y validar su corrección antes de integrarlo, reduciendo el riesgo de errores silenciosos.
- Depuración automática de errores de compilación: el módulo MCTS con auto-depurador de trazas puede emplearse para reparar fragmentos de código a partir de mensajes de error del compilador.
- Experimentación en investigación neuro-simbólica: dado su tamaño reducido (1,56B) y licencia Apache 2.0, sirve como banco de pruebas para estudiar la integración de MCTS y críticos de valor en modelos pequeños.
- Enseñanza de programación: el modelo puede generar soluciones en varios lenguajes y verificar su ejecución, lo que resulta útil en entornos educativos con recursos de hardware limitados.
- Prototipado rápido en estaciones de trabajo con una sola GPU: al caber en GPUs de consumo con cuantización adecuada (aunque no se publican pesos cuantizados), permite iterar sobre ideas de razonamiento simbólico sin infraestructura dedicada.
- Ranking de soluciones candidatas: el crítico de valor latente descrito podría emplearse para seleccionar la mejor respuesta entre varias generaciones en tareas de código o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para pesos; en 4 bits, alrededor de 0,8-1 GB (no se publican pesos cuantizados oficiales, pero el modelo base Qwen2.5-Coder-1.5B es compatible con cuantizaciones estándar).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en bfloat16, y en GPUs de 4 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el repo incluye la etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no se proporcionan ficheros GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alok v2.0 1.5B NSLRE | 1,56B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste de Qwen2.5-Coder-1.5B con andamiaje neuro-simbólico |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base; sin módulos simbólicos, pero con benchmarks publicados y ecosistema maduro |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens (según documentación del modelo) | DeepSeek License (permite uso comercial con restricciones) | Hugging Face | Alternativa centrada en código, sin componentes neuro-simbólicos |
| CodeLlama-1.3B-Instruct | 1,3B | 16.384 tokens | Llama 2 Community License | Hugging Face | Modelo de código de Meta; sin soporte simbólico |

La comparación directa con el modelo base es la más informativa: Alok v2.0 hereda las capacidades de Qwen2.5-Coder-1.5B-Instruct y añade módulos externos que no están incluidos en el repositorio, por lo que su rendimiento efectivo dependerá de la implementación del andamiaje por parte del usuario.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen2.5-Coder, es probable que herede sesgos del corpus de entrenamiento original, pero no se aportan datos al respecto.
- Riesgo de alucinación: no cuantificado; los módulos simbólicos (SymPy, Z3) pueden mitigarlo en dominios formales, pero el backbone sigue siendo un modelo de lenguaje de 1,56B con capacidad limitada.
- Los componentes auxiliares citados en la model card (`alok_v2_src/`, `critic_head.pt`, `v2_kernel.py`, `v2_skill_bank.json`) no forman parte de los ficheros del repositorio de Hugging Face según la información disponible; el usuario deberá implementarlos o localizarlos por su cuenta.
- Longitud de contexto e idiomas soportados no documentados; no se recomienda asumir los 32.768 tokens del modelo base sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la corrección del código generado; el sandbox debe aislarse adecuadamente en producción.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria, sin benchmarks publicados y sin issues documentados; no se recomienda para producción sin una evaluación previa exhaustiva.
- El tamaño de 1,56B limita el razonamiento complejo y el contexto largo en comparación con modelos de 7B o superiores.
- No se publican pesos cuantizados oficiales; la conversión a GGUF o AWQ debe realizarla el usuario bajo su responsabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/shivrajgurjar/Alok-v2-1.5B-NSLRE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Showcase interactivo (enlace citado en la model card, con posible errata en el dominio): https://huggingface.coshivrajgurjar/Alok-v2-Showcase
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- SymPy: https://www.sympy.org/
- Z3 Theorem Prover: https://github.com/Z3Prover/z3
