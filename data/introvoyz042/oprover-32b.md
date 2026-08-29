# introvoyz042/OProver-32B

## Resumen

OProver-32B es un modelo de lenguaje de 32 000 millones de parámetros, desarrollado por el equipo de m-a-p (multimodal-art-projection), especializado en demostración de teoremas formales en Lean 4. Se trata de un sistema agéntico que trata la demostración de teoremas como un bucle de refinamiento multi-ronda: dado un teorema objetivo, recupera demostraciones verificadas por el compilador de una memoria de pruebas previas, genera un intento, ejecuta el compilador Lean 4 y, si falla, revisa el intento usando el feedback del compilador en la siguiente ronda. Este comportamiento está integrado en la política del modelo durante el entrenamiento, no como un módulo externo.

El modelo se basa en la arquitectura Qwen3 (según los metadatos de HuggingFace) y se entrena en dos etapas: un preentrenamiento continuado (CPT) sobre una mezcla de 65 000 millones de tokens que incluye código Lean formal, código general, matemáticas y cadenas de razonamiento largas, seguido de un post-entrenamiento iterativo con SFT y RL (GSPO). OProver-32B alcanza el mejor Pass@32 en MiniF2F (93,3), ProverBench (58,2) y PutnamBench (11,3), y el segundo mejor en MathOlympiad (22,8) y ProofNet (33,2), superando a modelos mucho más grandes como Goedel-Prover-V2-32B (aunque este último es un MoE de 560B). Su relevancia radica en que demuestra que un modelo denso de 32B puede competir con sistemas de cientos de miles de millones de parámetros en razonamiento matemático formal, y que el enfoque agéntico de recuperación y feedback del compilador es clave para el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 8192 tokens en CPT; no se especifica el maximo) |
| Tipos de cuantizacion | no disponible para el modelo final; existe una version GGUF de OProver-32B-Base (mradermacher) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien disponible en GGUF para la version Base) |

## Arquitectura y entrenamiento

OProver-32B es un transformer denso basado en la arquitectura Qwen3, con 32 762 millones de parámetros. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia. El entrenamiento se divide en dos fases:

1. **Preentrenamiento continuado (CPT)**: una mezcla de 65 000 millones de tokens compuesta por código Lean formal (≈30%, del corpus OProofs), código general (≈20%, OpenCoder), matemáticas (≈40%, Nemotron-Math-4-Plus) y cadenas de razonamiento largas (≈10%, ProLong-64K). Se usa AdamW con LR pico de 5e-5, coseno con 3% de warmup, batch de 512 y longitud de secuencia de 8192. El resultado es el checkpoint OProver-32B-Base.

2. **Post-entrenamiento iterativo**: cada ronda ejecuta (a) demostración agéntica con el prover actual sobre un pool de teoremas, generando rollouts multi-ronda condicionados a pruebas recuperadas y feedback de Lean; (b) SFT sobre ejemplos de reparación por ronda, con pérdida de entropía cruzada solo en el nuevo intento; (c) RL con GSPO sobre casos difíciles, con recompensa r = 0,8 + 0,2·1[formato correcto] si Lean verifica, y 0 en caso contrario; (d) las pruebas verificadas y las trayectorias de reparación se incorporan a OProofs y se reindexan para la siguiente ronda. El modelo final reportado es el de la Ronda 2 (OProver-32B), mientras que OProver-8B es el de la Ronda 3.

La innovación clave es que la recuperación de pruebas y el feedback del compilador se integran en la política entrenada, no como un módulo externo. Las ablaciones muestran que eliminar el feedback cuesta entre 4,9 y 7,4 puntos de Pass@32, y eliminar además la recuperación añade 0,5–1,7 puntos más.

## Capacidades

- Demostración de teoremas formales en Lean 4, con soporte para razonamiento multi-paso y refinamiento iterativo.
- Razonamiento matemático avanzado, incluyendo problemas de olimpiadas (PutnamBench, MathOlympiad) y teoremas de nivel universitario (ProofNet).
- Agente autónomo: el modelo puede recuperar demostraciones previas de una memoria, generar intentos, ejecutar el compilador y revisar sus propios errores basándose en el feedback del compilador.
- Generación de texto en inglés (pipeline text-generation), aunque su uso principal es la demostración de teoremas.
- Capacidad de razonamiento de cadena larga (long-CoT) gracias al entrenamiento con ProLong-64K.
- No se menciona soporte explícito de tool calling o function calling en el sentido tradicional, pero el mecanismo de recuperación y ejecución del compilador actúa como una forma de interacción con herramientas externas.

## Casos de uso

- **Verificación formal de software**: OProver-32B puede generar demostraciones Lean 4 para propiedades de programas, ayudando a verificar corrección de algoritmos o invariantes en proyectos que usan Lean como asistente de pruebas.
- **Asistente para matemáticos**: investigadores pueden usarlo para explorar demostraciones de teoremas en Lean, obteniendo intentos iniciales que luego refinan manualmente. Su capacidad de recuperar pruebas similares de OProofs acelera el proceso.
- **Generación de ejercicios de matemáticas formales**: el modelo puede autoformalizar problemas de texto informal (extraídos de Common Crawl o GitHub) y generar demostraciones, útil para crear conjuntos de datos de entrenamiento o material educativo.
- **Integración en pipelines de CI/CD para verificación**: en proyectos que requieren pruebas formales de propiedades de código, OProver-32B puede ejecutarse como un paso de verificación automática, generando y comprobando pruebas Lean 4.
- **Investigación en razonamiento automático**: sirve como base para estudiar técnicas de aprendizaje por refuerzo en dominios formales, gracias a su entrenamiento con GSPO y su arquitectura agéntica.
- **Benchmarking de modelos de razonamiento**: al ser un modelo abierto con resultados publicados en cinco benchmarks estándar, es útil como referencia para comparar otros sistemas de demostración de teoremas.

## Benchmarks y rendimiento

Los resultados publicados en la model card (Pass@32, n=64) para OProver-32B son:

| Benchmark | Pass@32 |
|---|---|
| MiniF2F | 93,3 |
| ProverBench | 58,2 |
| PutnamBench | 11,3 |
| MathOlympiad | 22,8 |
| ProofNet | 33,2 |

Según la model card, OProver-32B obtiene el mejor resultado en MiniF2F, ProverBench y PutnamBench, y el segundo mejor en MathOlympiad y ProofNet, superando a modelos como Goedel-Prover-V2-32B (un MoE de 560B) y a un competidor denso de 671B. No se proporcionan los valores exactos de los modelos comparados en la información disponible, por lo que no se puede construir una tabla comparativa completa. El rendimiento mejora monótonamente con las rondas de post-entrenamiento: OProver-32B pasa de 84,7 a 88,1 y finalmente a 93,3 en MiniF2F-Test a lo largo de las rondas.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 32,7B parámetros. En bfloat16 (formato nativo) ocupa aproximadamente 65,5 GB, por lo que requiere al menos 80 GB de VRAM para inferencia sin cuantizar (p. ej., una A100 80GB o H100). Con cuantización de 8 bits, ~33 GB; con 4 bits, ~17 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o similar.
- **GPU recomendadas**: A100 80GB, H100, o configuraciones multi-GPU (p. ej., 2× RTX 3090/4090 con tensor parallelism). Para cuantización 4-bit, una RTX 4090 o RTX 6000 Ada son suficientes.
- **Opciones de despliegue**: transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI (text-generation-inference, indicado en los tags), y llama.cpp si se usa la versión GGUF (disponible para OProver-32B-Base). FriendliAI ofrece un endpoint de inferencia gestionado para OProver-32B-Base.
- **Latencia y throughput**: no se proporcionan datos específicos. Como referencia, un modelo de 32B en una A100 80GB suele alcanzar decenas de tokens por segundo en generación, pero la latencia depende del número de rondas de refinamiento (cada ronda ejecuta el compilador Lean, que añade tiempo de cómputo externo).

## Comparativa con modelos similares

No se dispone de datos detallados de otros modelos en la información proporcionada, más allá de la mención a Goedel-Prover-V2-32B (MoE de 560B) y a un competidor denso de 671B. La model card indica que OProver-32B supera a ambos en la mayoría de benchmarks, pero no se listan los valores numéricos de esos modelos. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Tipo | MiniF2F Pass@32 | Licencia |
|---|---|---|---|---|
| OProver-32B | 32,7B | Denso | 93,3 | Apache-2.0 |
| Goedel-Prover-V2-32B | 560B (MoE) | MoE | no disponible | no disponible |
| Competidor denso 671B | 671B | Denso | no disponible | no disponible |

No se dispone de más alternativas comparables en la información disponible.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés. No está entrenado para otros idiomas, por lo que su uso en castellano u otros idiomas no es recomendable.
- **Dominio limitado**: está especializado en demostración de teoremas en Lean 4 y matemáticas formales. Su rendimiento en tareas generales de generación de texto o código no está documentado y probablemente sea inferior al de modelos generalistas de su tamaño.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar demostraciones incorrectas o pasos inválidos. Aunque el feedback del compilador mitiga este riesgo en el bucle agéntico, no lo elimina por completo.
- **Contexto**: no se especifica la longitud máxima de contexto. El entrenamiento usa secuencias de 8192 tokens, por lo que problemas que requieran contextos más largos podrían no funcionar correctamente.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero es recomendable revisar los términos de los datasets utilizados (OProofs incluye datos de fuentes públicas como NuminaMath, Lean-Workbook, etc.) para asegurar el cumplimiento de sus respectivas licencias.
- **Requisitos de hardware**: la versión sin cuantizar requiere al menos 80 GB de VRAM, lo que limita su despliegue en entornos con GPUs de consumo. La cuantización puede degradar ligeramente el rendimiento en tareas de razonamiento formal.
- **Dependencia del compilador**: el uso agéntico requiere tener Lean 4 instalado y configurado en el entorno de ejecución, lo que añade complejidad operativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/introvoyz042/OProver-32B (también disponible en la colección m-a-p: https://huggingface.co/collections/m-a-p/oprover)
- Paper: https://huggingface.co/papers/2605.17283 (arXiv: https://arxiv.org/abs/2605.17283)
- Dataset OProofs: https://huggingface.co/datasets/m-a-p/OProofs
- Repositorio GitHub: https://github.com/multimodal-art-projection/OProver
- Versión GGUF de OProver-32B-Base: https://huggingface.co/mradermacher/OProver-32B-Base-GGUF
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/m-a-p/OProver-32B-Base
