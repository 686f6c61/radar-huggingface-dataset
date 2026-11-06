# mdcreativeagent/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal con codificador de visión, desarrollado por el equipo Qwen (Alibaba). Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, publicada como evolución de la familia Qwen3.5 con mejoras centradas en codificación agéntica, razonamiento a nivel de repositorio y estabilidad en flujos de trabajo reales. El repositorio analizado (`mdcreativeagent/Qwen3.6-35B-A3B`) es un espejo de los pesos oficiales en formato Hugging Face Transformers.

La arquitectura combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un esquema híbrido de 40 capas, junto con una capa Mixture of Experts de 256 expertos (8 enrutados + 1 compartido activos por token). Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, el modelo ofrece un contexto nativo de 262.144 tokens, extensible hasta 1.010.000. Su licencia Apache 2.0 y su compatibilidad con vLLM, SGLang y KTransformers lo hacen relevante para despliegues de producción que requieren contexto largo y capacidades multimodales sin costes de licencia.

La propuesta de valor se centra en tres ejes: eficiencia computacional por su naturaleza MoE de activación reducida, ventana de contexto muy amplia para razonamiento sobre repositorios completos y flujos agénticos, y soporte multimodal de texto, imagen y vídeo. Es un candidato directo para sustituir modelos densos de mayor coste en tareas de codificación asistida y agentes autónomos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Gated DeltaNet (atención lineal) y Gated Attention, más capa MoE y codificador de visión |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3.000 millones (3B activados) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La columna vertebral del lenguaje tiene una dimensión oculta de 2048, embedding de tokens de 248.320 (con padding), salida LM del mismo tamaño y 40 capas organizadas en un patrón repetido: 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, dimensión de cabeza 256 y dimensión de RoPE de 64.

La capa MoE contiene 256 expertos con 8 expertos enrutados más 1 compartido activos por token, y dimensión intermedia de experto de 512. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa. La innovación destacada por el autor es la "Thinking Preservation", una opción que conserva el contexto de razonamiento de mensajes históricos para reducir sobrecarga en desarrollo iterativo. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general con contexto largo (hasta 262.144 tokens nativos).
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Comprensión multimodal: entradas de texto, imagen y vídeo mediante codificador de visión.
- Razonamiento multi-paso y soporte de agentes (evaluado en SWE-bench y Terminal-Bench).
- Modo de preservación de pensamiento ("Thinking Preservation") para retener contexto de razonamiento entre turnos.
- Decodificación especulativa mediante MTP entrenado con múltiples pasos.
- Compatibilidad con tool calling y function calling a través de los frameworks de despliegue soportados (vLLM, SGLang, KTransformers).
- Capacidades multilingües: el benchmark SWE-bench Multilingual sugiere soporte de múltiples lenguajes de programación; los idiomas naturales soportados no están disponibles.

## Casos de uso

- Agente de codificación en producción: el modelo puede resolver issues de repositorios reales (73,4 en SWE-bench Verified) e integrarse en pipelines de CI/CD para generar parches y validar cambios automáticamente.
- Refactorización a nivel de repositorio: gracias a sus 262.144 tokens de contexto nativo, puede cargar múltiples ficheros y razonar sobre dependencias cruzadas sin truncar información.
- Asistencia frontend iterativa: la funcionalidad de preservación de pensamiento reduce la sobrecarga en ciclos de desarrollo repetidos, manteniendo el hilo de razonamiento entre mensajes.
- Automatización de terminal y operaciones: su rendimiento en Terminal-Bench 2.0 lo hace adecuado para agentes que ejecutan comandos y resuelven tareas de sistema.
- Análisis de documentos e imágenes: con el codificador de visión puede procesar capturas, diagramas o vídeos junto a texto para tareas de documentación técnica.
- Migración y traducción de código entre lenguajes: el resultado en SWE-bench Multilingual (67,2) respalda su uso en proyectos con múltiples lenguajes de programación.
- Razonamiento sobre bases de código extensas: la extensión de contexto hasta 1.010.000 tokens permite escenarios de análisis de monorepos completos.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoría Coding Agent):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de Terminal-Bench 2.0 aparecen truncados en la información proporcionada. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 72 GB solo para pesos, más overhead de activaciones y caché KV; requiere múltiples GPU.
- Cuantización a 8 bits: en torno a 36 GB de VRAM, viable en una A100 80GB o H100 80GB.
- Cuantización a 4 bits: en torno a 18-20 GB de VRAM, potencialmente desplegable en RTX 4090 (24 GB) con margen limitado para contexto largo.
- GPU recomendadas: H100 80GB, A100 80GB, H200 para despliegues de producción con contexto completo; RTX 4090 o L40S para cuantizaciones agresivas.
- Despliegue soportado: Hugging Face Transformers, vLLM, SGLang y KTransformers, además de la integración en NVIDIA NIM (NGC).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,9B | ~3B | 262.144 (ext. 1,01M) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | no disponible | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35BA3B en SWE-bench Verified (+3,4), Multilingual (+6,9) y Pro (+4,9), aunque queda por debajo del denso Qwen3.5-27B en Verified (-1,6). Frente a Gemma4-31B la ventaja es amplia en todas las métricas de codificación agéntica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos habituales de modelos entrenados con datos web a gran escala.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, puede producir código o afirmaciones incorrectas, especialmente en contextos muy largos.
- Idiomas naturales soportados: no disponibles; el soporte multilingüe está evidenciado solo en el ámbito de lenguajes de programación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia enlazada apunta al repositorio oficial de Qwen; conviene verificar los términos exactos del titular original.
- Repositorio espejo: el ID `mdcreativeagent/Qwen3.6-35B-A3B` no es el repositorio oficial de Qwen; para producción se recomienda usar los pesos del repositorio oficial.
- Contexto extendido: la extensión hasta 1.010.000 tokens requiere técnicas adicionales y puede degradar la calidad; el rendimiento a esa longitud no está documentado.
- Sin datos de cuantización ni de throughput publicados: la planificación de infraestructura debe validarse empíricamente.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/mdcreativeagent/Qwen3.6-35B-A3B
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- SourceForge: https://sourceforge.net/projects/qwen3-6-35b-a3b/
