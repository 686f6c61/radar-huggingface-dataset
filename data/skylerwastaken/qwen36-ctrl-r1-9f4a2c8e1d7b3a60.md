# skylerwastaken/qwen36-ctrl-r1-9f4a2c8e1d7b3a60

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, publicada tras la familia Qwen3.5 de febrero, y está orientada explícitamente a mejorar la experiencia de desarrollo de código en entornos reales, con especial énfasis en flujos de trabajo agénticos sobre repositorios y frontend. El modelo emplea una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) combinada con una mezcla de expertos (MoE) de 256 expertos, de los cuales se activan 8 enrutados más 1 compartido.

Con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, el modelo busca un equilibrio entre capacidad y coste de inferencia: el tamaño del repositorio (69,3 GB en safetensors) refleja los pesos completos, pero el cómputo por token se mantiene bajo gracias al enrutamiento disperso. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, lo que lo sitúa en la gama alta para tareas de razonamiento sobre repositorios completos y conversaciones de múltiples turnos.

La relevancia actual del modelo radica en dos innovaciones declaradas por el autor: mayor fluidez y precisión en flujos de codificación agéntica (razonamiento a nivel de repositorio y frontend) y la denominada "Thinking Preservation", una opción que conserva el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollo iterativo. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con MoE y codificador de visión |
| Parámetros totales | 35B (34.660.610.688 según safetensors) |
| Parámetros activos | 3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

Otros datos técnicos declarados: dimensión oculta 2048, 40 capas, embedding de tokens de 248.320 (con padding), layout oculto 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)), Gated DeltaNet con 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, Gated Attention con 16 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones, 256 expertos con dimensión intermedia 512, y entrenamiento con MTP (multi-token prediction) multi-paso.

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de atención en un patrón repetido: por cada bloque de tres capas con Gated DeltaNet (atención lineal) se intercala una capa con Gated Attention (atención completa). Esta hibridación busca reducir el coste computacional y de memoria de la atención en contextos largos sin renunciar a la capacidad de atención global. Sobre cada capa se aplica una mezcla de expertos con 256 expertos y una dimensión intermedia de 512 por experto, activando 8 enrutados más 1 compartido por token, lo que da lugar a los 3B parámetros activos sobre un total de 35B. El modelo incorpora además un codificador de visión, lo que lo convierte en un modelo image-text-to-text.

El entrenamiento consta de dos fases declaradas: pre-entrenamiento y post-entrenamiento. El autor no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica el uso de MTP (multi-token prediction) con múltiples pasos durante el entrenamiento, una técnica que suele mejorar la eficiencia de decodificación y la calidad de las representaciones. La innovación destacada en la model card es la "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes históricos en conversaciones iterativas, orientada a reducir la sobrecarga en desarrollo de software.

## Capacidades

- Generación de texto y razonamiento general en modo conversacional.
- Codificación agéntica: resolución de problemas a nivel de repositorio y flujos de trabajo de frontend, según los benchmarks SWE-bench reportados.
- Comprensión de imágenes y texto (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Razonamiento de múltiples pasos y preservación del contexto de razonamiento entre turnos ("Thinking Preservation").
- Capacidades multilingües: el modelo reporta resultados en SWE-bench Multilingual, aunque la lista concreta de idiomas no está disponible.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible.
- Soporte de agentes: orientado a flujos agénticos de desarrollo, según las mejoras declaradas en la model card.
- Capacidad de contexto largo: hasta 262.144 tokens nativos y 1.010.000 extendidos, adecuada para repositorios y documentos extensos.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede analizar el código de un repositorio completo gracias a su ventana de 262.144 tokens y proponer parches, un escenario medido por SWE-bench Verified (73,4) y SWE-bench Pro (49,5).
- Asistente de codificación en IDE: con 3B parámetros activos por token, el coste de inferencia por petición es bajo, lo que permite integrarlo en asistentes interactivos que responden en tiempo real sobre archivos y contexto de proyecto.
- Automatización de tareas de terminal y CI/CD: los resultados en Terminal-Bench 2.0 y SWE-bench sugieren su uso en agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines.
- Desarrollo de frontend asistido: la model card destaca mejoras específicas en flujos de frontend, por lo que encaja en generación y refactorización de componentes de interfaz a partir de descripciones o capturas de pantalla (aprovechando el codificador de visión).
- Análisis de documentos técnicos con imágenes: al ser image-text-to-text, puede procesar diagramas de arquitectura, capturas de errores o documentación escaneada junto con texto para responder preguntas o generar código.
- Conversaciones de soporte técnico de múltiples turnos: la ventana de contexto larga y la preservación del razonamiento permiten mantener hilos extensos sin perder información previa.
- Refactorización iterativa con memoria de razonamiento: la opción "Thinking Preservation" reduce la repetición de contexto en sesiones de desarrollo largas, lo que ahorra tokens y latencia en bucles de corrección.

## Benchmarks y rendimiento

Resultados reportados en la model card (categoría Coding Agent):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, GSM8K, HumanEval) ni de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors a precisión completa (BF16), el repositorio ocupa 69,3 GB, por lo que se necesitan al menos ~70 GB de VRAM o memoria unificada para cargar los pesos sin cuantizar. Con cuantización a 8 bits se estima alrededor de 35 GB, y a 4 bits alrededor de 18-20 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: para BF16, una A100 80 GB o H100 80 GB; para cuantización 4/8 bits, GPUs consumer de gama alta como RTX 4090 (24 GB) podrían alojar los pesos, aunque el contexto largo incrementa el uso de memoria KV.
- Cabe en GPU consumer: sí, en RTX 4090 o superiores con cuantización, siempre que se limite la longitud de contexto; el uso de 3B parámetros activos reduce el cómputo por token.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. No se mencionan llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | no disponible | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified (73,4 frente a 70,0) y en SWE-bench Pro (49,5 frente a 44,6), aunque queda por debajo del denso Qwen3.5-27B en SWE-bench Verified (75,0) y en SWE-bench Multilingual (69,3 frente a 67,2). Frente a los modelos Gemma4, la ventaja en tareas de codificación agéntica es amplia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- Riesgo de alucinación: no cuantificado en la model card; en tareas de código puede generar APIs o funciones inexistentes, por lo que se recomienda validación automática (tests, compilación) en producción.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no está disponible; los benchmarks multilingües se limitan a SWE-bench Multilingual. La extensión de contexto hasta 1.010.000 tokens puede degradar la calidad y aumentar el coste de memoria KV.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza la licencia del repositorio Qwen3.6-35B-A3B original; conviene verificar los términos exactos del titular.
- Caveats para producción: el repositorio analizado es un espejo de un tercero (skylerwastaken) con cero descargas y sin verificación de integridad pública; para uso real se recomienda descargar los pesos del repositorio oficial de Qwen. No se detallan configuraciones de cuantización ni métricas de latencia, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Hugging Face (espejo analizado): https://huggingface.co/skylerwastaken/qwen36-ctrl-r1-9f4a2c8e1d7b3a60
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog del modelo: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
