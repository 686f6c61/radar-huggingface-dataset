# ornith-ai/Ornith-1.5-9B-MLX-4bit

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros desarrollado por Ornith AI, presentado como el miembro más ligero de la familia Ornith-1.5. Esta familia, que también incluye variantes MoE de 35B y 397B, se centra en el razonamiento agéntico y la generación de código. El modelo se construye sobre las arquitecturas de Qwen3.5 y Gemma4, a las que se aplica un proceso de entrenamiento continuado, mid-training y post-training, con un bucle de auto-mejora que genera tareas, construye andamiajes (scaffolds) y optimiza la política mediante aprendizaje por refuerzo.

La versión aquí documentada es una cuantización MLX de 4 bits, pensada para su ejecución eficiente en hardware Apple Silicon y en GPUs con memoria limitada. El modelo destaca por su rendimiento en benchmarks de ingeniería de software y tareas de agente, superando a modelos de tamaño similar como Qwen3.5-9B en varias pruebas. Su licencia no está especificada, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 y Gemma4 (dense transformer) |
| Parametros totales | 9B (según el autor; el archivo safetensors muestra 1.399.927.296, posiblemente parcial) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (Ornith-1.0 soportaba 256K, no confirmado para 1.5) |
| Tipos de cuantizacion | MLX 4-bit (este repo), MLX 6-bit, bf16 (original) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un transformer denso derivado de Qwen3.5 y Gemma4. El proceso de entrenamiento combina continued pretraining, mid-training y post-training, seguido de un bucle de auto-mejora que genera nuevas tareas de entrenamiento, descubre estrategias de resolución y refina la política mediante aprendizaje por refuerzo. Este enfoque, denominado "self-improvement", busca superar la dependencia de tareas curadas manualmente y andamiajes fijos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de alineación específicas (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento general.
- Razonamiento agéntico: capaz de ejecutar tareas multi-paso en entornos de terminal y código.
- Generación de código y resolución de problemas de ingeniería de software (SWE-bench).
- Soporte de tool calling y function calling (implícito por su naturaleza agéntica, aunque no se documenta explícitamente).
- Capacidad de uso en entornos de agente autónomo (scaffolding).
- Multilingüe limitado: solo inglés confirmado.

## Casos de uso

- Desarrollo de software asistido: el modelo puede resolver issues de repositorios reales (SWE-bench Verified 70.6) y generar parches de código, integrándose en flujos de trabajo de desarrollo.
- Agentes de terminal: con un rendimiento de 46.2 en Terminal-Bench 2.1 (Terminus-2), puede ejecutar comandos, interpretar salidas y completar tareas administrativas en entornos CLI.
- Automatización de tareas de DevOps: su capacidad para manejar entornos de terminal lo hace útil para scripts de despliegue, monitorización y gestión de infraestructura.
- Asistente de programación en IDE: puede integrarse como copiloto para sugerencias de código, refactorización y explicación de fragmentos.
- Búsqueda y corrección de bugs: su puntuación en SWE-bench Pro (47.5) indica capacidad para identificar y corregir errores en bases de código complejas.
- Prototipado rápido: dado su tamaño compacto y cuantización 4-bit, puede ejecutarse en portátiles con Apple Silicon o GPUs de gama media, permitiendo experimentación local sin infraestructura costosa.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor. No se han publicado resultados de benchmarks adicionales en la información disponible.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47.0 | 40.6 | 18.9 | 49.2 | - |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52.0 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |
| SWE-bench Multilingual | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: en bf16 el modelo ocupa ~19 GB, por lo que requiere una GPU con al menos 24 GB para inferencia sin cuantizar. En 4-bit MLX, el repo pesa 5.1 GB, lo que permite ejecutarlo en GPUs con 8-12 GB de VRAM (p. ej., RTX 3060, RTX 4060) o en Macs con Apple Silicon (M1 Pro o superior).
- GPU recomendadas: A100 80GB, H100, RTX 4090 (24GB) para bf16; RTX 3090/4090 o inferiores para 4-bit.
- Cabe en consumer GPU: sí, en cuantización 4-bit cabe en GPUs de gama media (8-12 GB VRAM).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, MLX (para Apple Silicon). El autor menciona servidores compatibles con OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B | 9B | no disponible | 70.6 | 46.2 | no disponible |
| Qwen3.5-9B | 9B | no disponible | 53.2 | 21.3 | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73.4 | 52.5 | no disponible |
| Gemma-4-31B | 31B | no disponible | 52.0 | 42.1 | no disponible |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de código y agente, y se acerca a modelos mucho más grandes como Qwen3.6-35B-A3B, aunque con menos parámetros. La falta de licencia y de datos de contexto limita la comparación completa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- Solo soporta inglés; no se ha verificado su rendimiento en otros idiomas.
- La discrepancia entre los parámetros anunciados (9B) y el archivo safetensors (1.4B) sugiere que el archivo puede estar incompleto o que la metadata es incorrecta; se recomienda verificar la integridad del modelo antes de su uso.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de contexto; se desconoce su comportamiento en dominios especializados.
- El contexto máximo no está confirmado para esta versión; si se hereda de Ornith-1.0, sería 256K, pero no es seguro.
- Al ser un modelo orientado a tareas de agente, puede ejecutar comandos o acciones no deseadas si se usa sin supervisión adecuada.

## Enlaces

- [HuggingFace - Ornith-1.5-9B-MLX-4bit](https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit)
- [HuggingFace - Ornith-1.5-9B (original)](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Blog de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [GitHub - Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Sitio web de Ornith AI](https://ornith.online/)
