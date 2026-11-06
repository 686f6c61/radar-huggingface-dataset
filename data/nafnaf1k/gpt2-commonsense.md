# Nafnaf1k/gpt2-commonsense

## Resumen

`gpt2-commonsense` es un artefacto de investigación publicado en Hugging Face por el usuario Nafnaf1k que se presenta explícitamente como un "research-artifact" con etiquetas de `ai-safety` y `evaluation-integrity`. No es un modelo entrenado para resolver una tarea de generación de lenguaje: según su propia model card, los pesos son idénticos a los de `openai-community/gpt2` y el interés del artefacto reside en el código Python que se ejecuta en tiempo de carga (`modeling_gpt2_commonsense.py`), declarado abiertamente como un "seeded exploit" (exploit sembrado) y clasificado como "malicious" dentro de la taxonomía del autor (fila `G08.1`).

El artefacto sirve como caso de estudio sobre integridad de evaluaciones: demuestra cómo un repositorio de Hugging Face puede incluir código arbitrario que se ejecuta cuando el usuario carga el modelo con `trust_remote_code=True`, y cómo el puente `config.json` → `auto_map` → clase custom permite activar ese código sin que el usuario inspeccione los ficheros. Está pensado para investigadores que trabajan en seguridad de la cadena de suministro de modelos, no para uso en producción.

Arquitectónicamente es GPT-2 (transformer decoder-only de 124 millones de parámetros, contexto de 1024 tokens), pero la relevancia del repositorio no está en sus capacidades lingüísticas sino en su comportamiento en el momento de la carga. Cualquier evaluación de este modelo debe hacerse en un entorno aislado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parámetros totales | 124 millones (GPT-2 base, pesos idénticos a `openai-community/gpt2`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (configuración estándar de GPT-2) |
| Tipos de cuantización | no disponible (el repo solo publica `pytorch_model.bin` en fp32/fp16; no se ofrecen GGUF ni otros formatos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS) |
| Código en tiempo de carga | sí (`modeling_gpt2_commonsense.py`), requiere `trust_remote_code=True` |
| Clasificación del autor | `malicious` (seeded exploit), fila `G08.1` de su taxonomía |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es GPT-2, un transformer decoder-only con atención causal completa, 12 capas, 12 cabezas de atención, dimensión de embedding de 768 y 124 millones de parámetros. No hay evidencia en la información disponible de que se haya realizado ningún fine-tuning sobre estos pesos: la model card afirma explícitamente que los pesos son "identical across all RQ1 artifacts", es decir, los mismos que el GPT-2 original de OpenAI. Por tanto, no procede hablar de dataset de entrenamiento propio, RLHF, DPO ni innovaciones de decodificación más allá de los valores por defecto que el autor incluye en `generation_config.json`.

La "innovación" del artefacto es de otra naturaleza: el repositorio incluye un fichero `modeling_gpt2_commonsense.py` que se ejecuta al cargar el modelo, y un `config.json` cuyo campo `auto_map` redirige a transformers hacia esa clase custom. Este es el mecanismo técnico que el autor denomina "config→code bridge" y que constituye el payload divulgado del experimento. El artefacto está etiquetado con `rq1` y `seeded-exploit`, lo que sugiere que forma parte de un conjunto de pruebas diseñado para medir la robustez de harnesses de evaluación frente a código malicioso embebido en repositorios de modelos.

## Capacidades

- Generación de texto en inglés con la calidad del GPT-2 base (124M), es decir, capacidad limitada y desactualizada frente a modelos actuales.
- No dispone de tool calling ni function calling nativo.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo "thinking", visión, audio ni capacidades multimodales.
- Multilingüismo limitado al inglés; el tokenizador BPE de GPT-2 no está optimizado para otras lenguas.
- Capacidad destacable (por diseño del artefacto): ejecuta código Python arbitrario en el momento de la carga si el usuario activa `trust_remote_code=True`. Esta es la funcionalidad real que el autor quiere demostrar y estudiar.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: usar el repositorio como muestra controlada para estudiar cómo se comportan los escáneres de artefactos (por ejemplo, herramientas que inspeccionan `auto_map`, ficheros `.py` y permisos de `trust_remote_code`) ante un payload declarado.
- Evaluación de integridad de harnesses de benchmark: el artefacto permite comprobar si un pipeline de evaluación automática carga modelos con `trust_remote_code=True` sin sandbox, y si registra adecuadamente el código ejecutado en el momento de la carga.
- Formación de revisores y desarrolladores: sirve como ejemplo reproducible en talleres sobre riesgos de `trust_remote_code` y sobre la diferencia entre inspeccionar pesos y inspeccionar código de carga.
- Pruebas de sandboxing y aislamiento: validar que contenedores, entornos sin red y políticas de seccomp bloquean la ejecución de código no deseado al importar un modelo desde Hugging Face.
- Auditoría de políticas de confianza en organizaciones: demostrar a equipos de plataforma por qué conviene mantener una lista blanca de repositorios y revisar `config.json` antes de instalar modelos de terceros.
- Docencia en cursos de seguridad de IA: ilustrar de forma práctica los vectores de ataque en el ecosistema de modelos abiertos, con un caso etiquetado como malicioso por su propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea; además, al compartir pesos con GPT-2 base, el rendimiento lingüístico sería el del GPT-2 original, no el de un modelo afinado para commonsense reasoning pese al nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 124M de parámetros, y menos de 0,3 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para reproducir el comportamiento del artefacto), o `text-generation-inference` según los tags del repo. No se publican ficheros GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser GPT-2 base, el throughput sería alto en hardware moderno, pero el interés del artefacto no es el rendimiento.
- Advertencia de despliegue: cualquier ejecución debe hacerse en sandbox sin red y sin credenciales, dado que el código de carga está declarado como malicioso por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Código en carga |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-commonsense` | 124M | 1024 | Artefacto de investigación (seeded exploit) | MIT | Sí, declarado malicioso |
| `openai-community/gpt2` | 124M | 1024 | Generación de texto base | MIT | No |
| `distilgpt2` | 82M | 1024 | Generación de texto destilada | Apache-2.0 | No |
| `gpt2-medium` | 355M | 1024 | Generación de texto base | MIT | No |

La comparación relevante no es de rendimiento lingüístico (los pesos son idénticos a GPT-2), sino de superficie de ataque: frente a los otros repositorios, este incluye código ejecutable en carga y un `auto_map` que lo activa.

## Limitaciones y advertencias

- El autor clasifica el artefacto como `malicious` (seeded exploit): no debe cargarse fuera de un entorno aislado.
- Requiere `trust_remote_code=True`, lo que implica ejecución de Python arbitrario en el momento de la carga; es la característica central del artefacto, no un efecto secundario.
- Los pesos son idénticos a GPT-2 base, por lo que la calidad de generación es la de un modelo de 2019, con sesgos conocidos de ese modelo (estereotipos de género, raza y religión, entre otros).
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, coherente con GPT-2 base.
- Contexto limitado a 1024 tokens e idioma limitado al inglés.
- Licencia MIT: permite uso comercial según los términos, pero eso no elimina el riesgo de seguridad del código de carga; la licencia no es una garantía de seguridad.
- No apto para producción, atención al cliente, generación de código ni ningún uso final real.
- El nombre "commonsense" no refleja un fine-tuning en razonamiento de sentido común; no hay evidencia de tal entrenamiento en la información disponible.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-commonsense
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios auxiliares ni demos adicionales asociados a este artefacto.
