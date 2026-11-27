# MarkovEfim/Qwen2.5-7B-Instruct-V-CORE-L1-GGUF

## Resumen

Qwen2.5-7B-Instruct-V-CORE-L1-GGUF es una cuantización GGUF del modelo Qwen2.5-7B-Instruct de Alibaba, producida por E. S. Markov mediante su pipeline V-CORE v5.0.0. La particularidad del artefacto es que el autor afirma que el proceso de cuantización está respaldado por 24 módulos Lean 4 verificados mecánicamente, sin `sorry`s, lo que lo convierte en una propuesta poco habitual: una cuantización con certificación formal de su procedimiento.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.615.616.512 parámetros con 128.000 tokens de contexto, entrenado por el equipo Qwen de Alibaba. Esta versión GGUF conserva la arquitectura y los pesos del original, pero se distribuye en un único fichero de 5.587,0 MB (2,60x de compresión respecto a los pesos originales), pensado para inferencia con `llama.cpp` y runtimes compatibles.

La relevancia del artefacto es doble: por un lado, ofrece una ruta de despliegue de Qwen2.5-7B-Instruct en hardware modesto (el autor cita una NVIDIA Tesla T4); por otro, introduce en el ecosistema de cuantización una metodología de verificación formal que, si se consolida, podría servir para auditar la fidelidad de las cuantizaciones en entornos donde la reproducibilidad es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), cuantizado a GGUF |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | GGUF (artefacto unico `Qwen2.5-7B-Instruct-V-CORE-L1-v5.gguf`, 5.587,0 MB, 2,60x de compresion); niveles adicionales no disponibles |
| Idiomas soportados | en, ru (segun tags del repositorio) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso decoder-only de 7.615.616.512 parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida SSM: es un transformer clásico con atención completa y las mejoras introducidas por Qwen en la familia 2.5 (RoPE, RMSNorm, SwiGLU y sesgos de atención QKV). El entrenamiento original del modelo base incluye preentrenamiento sobre un corpus multilingüe de gran escala y un post-entrenamiento con instrucciones y preferencias humanas, si bien la model card de este repositorio no detalla ni el número de tokens ni la composición del dataset.

La innovación de este artefacto no está en el entrenamiento, sino en el proceso de cuantización: V-CORE v5.0.0 aplica una proyección con métrica L1 respaldada por 24 módulos Lean 4 verificados mecánicamente (sin `sorry`s). El autor publica el entorno de verificación (Tesla T4 + C++17 AVX2 con `vcore-run`) y los proofs en repositorios separados de GitHub. No se especifican en la información disponible los detalles del algoritmo de cuantización (número de bits por peso, granularidad de grupo, calibración) más allá del tamaño final del fichero y el factor de compresión.

## Capacidades

- Generación de texto e instrucciones en inglés y ruso, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento de propósito general y matemáticas de nivel medio, según las capacidades del modelo base.
- Generación de código, incluyendo lenguajes de programación habituales; el autor etiqueta el artefacto con `lean4` y `formal-verification`, aunque no se documenta un ajuste específico en Lean 4.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Instruct.
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, limitada por el contexto efectivo que permita el runtime GGUF.
- Capacidades multilingües limitadas a los idiomas declarados (en, ru) en los tags del repositorio.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Despliegue en hardware de gama media: el fichero GGUF de 5,59 GB permite ejecutar el modelo en una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3060/4060 o Tesla T4), algo inviable con los pesos en fp16.
- Inferencia en CPU con `llama.cpp`: al ser un GGUF único, se puede ejecutar en servidores sin GPU usando AVX2, útil para entornos de desarrollo y pruebas.
- Asistente de código en local: el modelo base conserva capacidad de generación de código y tool calling, por lo que puede integrarse en editores o pipelines de CI/CD que requieran privacidad de datos.
- Prototipado de agentes con tool calling: Qwen2.5-7B-Instruct soporta function calling, lo que permite construir agentes multi-paso sobre el runtime GGUF.
- Evaluación de metodologías de cuantización verificada: investigadores pueden reproducir el pipeline V-CORE y comparar la fidelidad del artefacto frente a cuantizaciones estándar (Q4_K_M, Q5_K_M, etc.).
- Procesamiento de texto en inglés y ruso: atención al cliente o resumen documental en estos dos idiomas, aprovechando el soporte declarado.
- Auditoría de reproducibilidad: el enlace a los proofs Lean 4 y al DOI de Zenodo permite a equipos de compliance verificar el procedimiento de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para el fichero GGUF de 5,59 GB, más overhead de contexto y caché KV.
- GPU recomendadas: NVIDIA Tesla T4 (citada por el autor), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, etc.); en 6 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: `llama.cpp` (soporte nativo GGUF), `vcore-run` (runtime propio en C++17 AVX2 del autor), Ollama y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-V-CORE-L1-GGUF | 7,62 B | no disponible (base: 128k) | GGUF | AGPL-3.0 | Cuantizacion con verificacion formal Lean 4 |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 128.000 | safetensors | Apache-2.0 (modelo base) | Modelo original sin cuantizar |
| Cuantizaciones GGUF estandar de Qwen2.5-7B-Instruct (p. ej. Q4_K_M) | 7,62 B | 128.000 (segun runtime) | GGUF | Apache-2.0 | Sin certificacion formal; ampliamente adoptadas |

La diferencia clave frente a las cuantizaciones estándar es la licencia: el artefacto se distribuye bajo AGPL-3.0, mientras que el modelo base Qwen2.5-7B-Instruct es Apache-2.0. Esto puede condicionar su uso en productos propietarios.

## Limitaciones y advertencias

- La licencia AGPL-3.0 es copyleft fuerte: el uso en servicios de red puede obligar a liberar el código del servicio, a diferencia del modelo base Apache-2.0.
- El artefacto es una cuantización; puede degradar ligeramente la calidad respecto a los pesos fp16/bf16 originales, aunque no se publican métricas de divergencia.
- La verificación formal Lean 4 certifica el procedimiento de cuantización, no la calidad del modelo resultante ni la ausencia de sesgos.
- Idiomas declarados limitados a inglés y ruso; el rendimiento en castellano no está garantizado por el autor.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento complejo o dominios especializados.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El repositorio tiene un único like y 539 descargas, lo que sugiere una adopción limitada; conviene validar el artefacto antes de usarlo en producción.
- La fecha de creación del repositorio (2026-11-24) y el DOI de Zenodo deben verificarse antes de citarlos en trabajos académicos.

## Enlaces

- Hugging Face: https://huggingface.co/MarkovEfim/Qwen2.5-7B-Instruct-V-CORE-L1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- DOI Zenodo: https://doi.org/10.5281/zenodo.24527692
- Runtime V-CORE: https://github.com/fomamarkov-creator/vcore-l1-certified
- Proofs Lean 4: https://github.com/fomamarkov-creator/l1-projection-complexity-lean4
