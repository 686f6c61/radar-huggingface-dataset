# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e-1M

## Resumen

Este repositorio contiene una cuantización mixta en formato Apple MLX (denominada oQ6e) del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion, un merge de pesos de la familia Qwen 3.8 de 27 781 427 952 parámetros (unos 27,8 mil millones) desarrollado originalmente por DavidAU y empaquetado, cuantizado y escalado a contexto largo por Solstice-AI. El modelo parte de una base Qwen 3.8 con atención lineal híbrida y se distribuye con licencia Apache 2.0, pesos en safetensors y una longitud de contexto declarada de 1 048 576 tokens mediante escalado YaRN sobre una ventana original de 262 144 tokens.

El interés técnico del checkpoint reside en tres decisiones: una cuantización de precisión mixta calibrada con matriz de importancia que, según el autor, conserva el 99,4 % de la fidelidad FP16 ocupando 23,7 GB; un escalado YaRN de factor 4,0 para alcanzar el millón de tokens; y un cabezal de predicción multi-token (MTP) orientado a decodificación especulativa sobre Apple Silicon. La model card declara además resultados muy altos en SWE-bench Pro (61,7 %) y ARC-C (735), presentados como una victoria en 9 de 9 pruebas frente a Claude Opus 4.6 Max.

Conviene leer estas cifras con cautela: proceden exclusivamente de la model card del autor, no se acompañan de scripts de reproducción ni de artefactos de evaluación independientes, y el modelo incorpora una modificación de alineación ("Project Heretic") que elimina los vectores de rechazo. Es, por tanto, un artefacto pensado para experimentación local en Mac con memoria unificada, no un checkpoint validado para producción regulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75 % de capas con atención lineal GDN (Gated Delta Recurrent Network) y 25 % con GQA global; cabezal MTP de decodificación especulativa |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 1 048 576 tokens (YaRN, factor 4,0 sobre 262 144 originales) |
| Tipos de cuantizacion | MLX oQ6e (precisión mixta de 6 bits calibrada con matriz de importancia); la model card menciona también evaluación en 8 bits y 4 bits |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repo de 23,7 GB |
| Libreria / runtime | mlx, MLX-LM y Anvil Runtime (Metal) |
| Modalidad | image-text-to-text (pipeline declarado) |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Fecha de creacion | 2026-09-02 (actualizado 2026-10-15) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen 3.8 en el que, según la model card, el 75 % de las capas emplean atención lineal GDN con complejidad de memoria O(1) y el 25 % restante mantiene atención GQA global. Esta combinación busca sostener contextos muy largos sin el coste cuadrático de un transformer denso convencional. Sobre esa base, DavidAU aplica un merge de pesos denominado GAIN (Guided Activation Interleaved Normalization) y una modificación de alineación ("Project Heretic") que elimina los comportamientos de rechazo. Solstice-AI añade después la cuantización oQ6e, el escalado YaRN y el empaquetado MLX.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el procedimiento exacto de calibración más allá de la referencia a un fichero `oq_imatrix_report.json` con pesos de sensibilidad por capa. Las innovaciones declaradas son la cuantización de precisión mixta por capa, el escalado YaRN con `beta_fast` 32,0 y `beta_slow` 1,0, y un cabezal MTP de doble flujo que genera dos tokens por pasada con una aceleración declarada de 1,72x a 2,20x en Apple Silicon.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con cadena de pensamiento explícita (etiqueta `cot` en el repo).
- Generación y depuración de código, con resultados declarados en SWE-bench Pro, LiveCodeBench v6 y QwenSWEBench.
- Razonamiento científico y abstracción de nivel avanzado (ARC-C, ARC-E).
- Seguimiento de restricciones complejas en instrucciones (IFBench).
- Control de entorno de escritorio y móvil declarado (OSWorld-Verified, AndroidWorld).
- Flujos agénticos de múltiples pasos y edición multi-fichero de largo horizonte (CoWorkBench).
- Procesamiento de imagen y texto según el pipeline `image-text-to-text` declarado; la model card no detalla el codificador visual.
- Contexto largo de hasta 1 048 576 tokens para recuperación y razonamiento sobre documentos extensos.
- Decodificación especulativa nativa mediante cabezal MTP.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Auditoría de repositorios completos: con una ventana de un millón de tokens, el modelo puede ingerir un monorepo de tamaño medio y responder preguntas de arquitectura o localizar la causa raíz de un fallo sin trocear el código en fragmentos que pierdan contexto entre módulos.
- Refactorización asistida en local sobre Mac: la cuantización oQ6e ocupa 23,7 GB y cabe en equipos de 32-48 GB de memoria unificada, lo que permite ejecutar el modelo sin enviar código propietario a una API externa.
- Análisis de documentación técnica extensa: manuales, normativas o especificaciones de varios cientos de miles de tokens pueden cargarse íntegros gracias al escalado YaRN, útil para consultas de cumplimiento y extracción de requisitos.
- Automatización de tareas de escritorio: los resultados declarados en OSWorld-Verified y AndroidWorld sugieren su uso en agentes que operan interfaces gráficas, aunque requieren validación propia antes de cualquier despliegue.
- Generación de código en pipelines de CI: el modelo puede integrarse como revisor automático de pull requests, señalando regresiones y proponiendo parches, siempre con un paso humano de aprobación.
- Investigación en seguridad ofensiva y análisis de sistemas: la eliminación de rechazos permite estudiar prompts que un modelo alineado bloquearía, en entornos controlados y con registro de auditoría.
- Prototipado de asistentes bilingües inglés-chino para documentación técnica, aprovechando que esos son los dos idiomas declarados.

## Benchmarks y rendimiento

Los siguientes datos provienen únicamente de la model card del autor, evaluados según él con el arnés oficial de Claude Code a temperatura 1,0 y top_p 0,95. No se han verificado de forma independiente.

| Suite | Enfoque | Modelo | Claude Opus 4.6 Max | Margen declarado |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7 % | 53,4 % | +8,3 |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3 % | 88,8 % | +1,5 |
| QwenSWEBench | Depuración de repositorio completo | 79,0 % | 63,8 % | +15,2 |
| OSWorld-Verified | Control de SO | 84,3 % | 72,7 % | +11,6 |
| AndroidWorld | Autonomía en SO móvil | 81,9 % | 62,0 % | +19,9 |
| IFBench | Seguimiento de restricciones | 79,5 % | 62,5 % | +17,0 |
| CoWorkBench | Flujos multi-fichero de largo horizonte | 70,7 % | 68,2 % | +2,5 |
| ARC-C | Abstracción científica | 735 (8 bits) / 719 (4 bits) | ~710-720 | Nivel frontera |
| ARC-E | Razonamiento de sentido común | 882 | ~870 | Por encima del frontera |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 23,7 GB para el checkpoint oQ6e completo; en cuantizaciones de 4 bits el requisito baja aproximadamente a 15-16 GB, aunque la cifra exacta no se detalla.
- Plataforma objetivo: Apple Silicon exclusivamente, al estar en formato MLX y depender de shaders Metal.
- Equipos compatibles: MacBook con 32 GB o 48 GB de memoria unificada según la model card; en configuraciones de 24 GB el checkpoint oQ6e no cabe entero.
- GPU NVIDIA: no hay pesos GGUF ni safetensors estándar en este repositorio, por lo que A100, H100 o RTX 4090 no pueden cargarlo directamente; sería necesario reconvertir desde el modelo base.
- Despliegue: MLX-LM y Anvil Runtime (Metal); no se documentan recetas para vLLM, TGI, llama.cpp ni Ollama en este repo.
- Aceleración: el cabezal MTP declara entre 1,72x y 2,20x de speedup en Apple Silicon; no se publican cifras absolutas de latencia ni de tokens por segundo.
- Contexto largo: activar el millón de tokens con YaRN incrementa de forma notable el consumo de KV cache; la model card no cuantifica ese coste adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Solstice-AI) | 27,8 B | 1 048 576 | Apache 2.0 | MLX safetensors | Solo Apple Silicon; sin rechazos; benchmarks no verificados |
| Modelo base DavidAU Qwen3.8-27B Cold Fusion | 27,8 B | 262 144 originales | Apache 2.0 | safetensors | Punto de partida sin cuantizar ni escalado YaRN |
| Qwen 3.8 27B de referencia | no disponible en la información | no disponible | no disponible | no disponible | Familia original sobre la que se construye el merge |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API | Referencia de comparación citada por el autor; cifras no reproducibles de forma local |

No se dispone de datos suficientes para comparar con alternativas abiertas de tamaño similar en formato MLX.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor, sin scripts de reproducción ni verificación de terceros; deben tratarse como afirmaciones no confirmadas.
- La modificación "Project Heretic" elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o inseguro sin filtro; no es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación no cuantificado: no se publican tasas de fidelidad factual ni evaluaciones de calibración.
- El contexto de un millón de tokens depende de YaRN y suele degradarse en recuperación precisa más allá de cierto umbral; no se documenta la curva de degradación.
- La licencia Apache 2.0 se hereda del modelo base, pero el merge de pesos y la modificación de alineación pueden plantear dudas sobre la procedencia y los términos aplicables a los pesos derivados.
- Formato MLX: no es portable a ecosistemas CUDA sin reconversión, lo que limita su uso en servidores convencionales.
- El pipeline declarado es `image-text-to-text`, pero no se detalla el codificador visual ni se aportan evaluaciones multimodales; la capacidad de visión debe validarse empíricamente.
- El repositorio tiene 347 descargas y 2 likes, con un historial corto; no hay evidencia de comunidad que haya auditado el checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e-1M
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del merge original: https://huggingface.co/DavidAU
- Perfil del cuantizador: https://huggingface.co/Solstice-AI
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
