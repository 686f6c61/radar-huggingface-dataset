# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e es una cuantización de precisión mixta en formato Apple MLX (oQ6e, 6 bits) del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un merge de pesos de la familia Qwen 3.8 de 27B parámetros. El paquete lo publica Solstice-AI, que actúa como downstream del trabajo original de DavidAU, y está pensado exclusivamente para ejecución nativa en Apple Silicon mediante Metal, con la librería MLX y el runtime propio Anvil.

El modelo resuelve el problema de servir un modelo de 27B con contexto nativo declarado de 262.144 tokens en equipos de consumo con memoria unificada de 32-48 GB, algo inviable en FP16 (que requeriría del orden de 55 GB solo para pesos). La cuantización está calibrada con una matriz de importancia (importance matrix) para preservar las capas sensibles, y el modelo incorpora un cabezal de predicción multi-token (MTP) para decodificación especulativa, además de una ablación de alineamiento (Project Heretic) que elimina los vectores de rechazo.

La relevancia actual es doble: por un lado, demuestra un flujo de cuantización MLX con calibración por capas para modelos grandes en Mac; por otro, la model card reclama una superioridad empírica sobre Claude Opus 4.6 Max en 9 de 9 suites de evaluación. Esas cifras proceden únicamente del autor y no están verificadas de forma independiente, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75% de capas con atención lineal Gated Delta Recurrent Network (GDN) y 25% con Grouped-Query Attention (GQA) global |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (262K) |
| Tipos de cuantizacion | MLX oQ6e (6 bits, precisión mixta calibrada con importance matrix); la model card menciona también evaluación en 4 bits para ARC-C |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx), repo de 23,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen 3.8: aproximadamente el 75% de las capas emplean atención lineal Gated Delta Recurrent Network con complejidad de memoria O(1) respecto a la longitud de secuencia, y el 25% restante usa Grouped-Query Attention global. Esta combinación permite sostener ventanas de 262K tokens sin el coste cuadrático de un transformer denso convencional. Sobre esa base, DavidAU aplica un merge de pesos denominado Cold Fusion con normalización intercalada de activaciones guiadas (GAIN), cuyo objetivo declarado es combinar pesos con buen rendimiento en razonamiento sin degradar el resto de capacidades.

El checkpoint publicado por Solstice-AI no reentrena el modelo: cuantiza a 6 bits con precisión mixta usando pesos de sensibilidad por capa extraídos de un informe de importance matrix (`oq_imatrix_report.json`), asignando más bits a las proyecciones de atención y matrices MLP más sensibles. El autor afirma una retención del 99,4% de la fidelidad FP16. Se incluye además un cabezal de predicción multi-token (MTP) de doble flujo para borrador especulativo, con una aceleración declarada de 1,72x a 2,20x en Apple Silicon, y una ablación de alineamiento (Project Heretic) que elimina los comportamientos de rechazo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (262K tokens nativos).
- Razonamiento explícito con cadena de pensamiento (etiquetas cot y reasoning en el modelo).
- Generación y depuración de código, con orientación declarada a tareas de ingeniería de software agéntica (SWE-bench, SWE-bench Pro, LiveCodeBench).
- Seguimiento de instrucciones complejas con múltiples restricciones simultáneas (IFBench).
- Control de entornos de escritorio y móviles (OSWorld-Verified, AndroidWorld), lo que implica capacidad de interacción con interfaces y herramientas.
- Flujos multi-paso y de horizonte largo sobre múltiples ficheros (CoWorkBench).
- Procesamiento image-text-to-text según el pipeline declarado en Hugging Face (no se detalla el codificador visual en la información disponible).
- Multilingüe limitado a inglés y chino.
- Modo sin censura (ablación de rechazos), orientado a desarrollo de sistemas y seguridad.
- Decodificación especulativa integrada vía cabezal MTP.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede recibir un repositorio completo en contexto (hasta 262K tokens), localizar el fallo, proponer un parche y validarlo, integrándose en un bucle de CI/CD que ejecute tests tras cada propuesta. Su orientación declarada a SWE-bench Pro lo hace adecuado para este escenario.
- Automatización de control de escritorio: con las capacidades mostradas en OSWorld-Verified, puede pilotar aplicaciones de escritorio mediante herramientas de captura de pantalla y eventos de entrada, útil para RPA en entornos macOS.
- Asistente de código local en Mac: al caber en 23,7 GB de RAM, se puede servir en un MacBook de 32-48 GB sin conexión a la nube, lo que resulta relevante para equipos con requisitos de confidencialidad del código.
- Análisis de documentación técnica extensa: informes, especificaciones o bases de código de cientos de miles de tokens pueden procesarse en una sola pasada gracias a la ventana nativa, evitando pipelines de recuperación fragmentada.
- Desarrollo de sistemas y análisis de seguridad ofensiva/defensiva: la ablación de rechazos permite trabajar con contenido técnico sensible (explotación, reversing, configuración de sistemas) sin bloqueos, siempre que se apliquen controles organizativos propios.
- Generación de código en producción asistida por herramientas: con soporte de tool calling implícito en su orientación agéntica, puede conectarse a linters, compiladores y APIs internas para cerrar bucles de corrección automática.
- Prototipado de asistentes bilingües inglés-chino: para productos dirigidos a esos dos mercados, el modelo cubre ambas lenguas de forma nativa sin modelos auxiliares.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor, evaluados según él con el arnés oficial de Claude Code, contexto de 256K, temperature=1.0 y top_p=0.95. No hay verificación independiente disponible.

| Suite | Enfoque | Qwen3.8-27B TURBO (Solstice-AI x DavidAU) | Claude Opus 4.6 Max | Margen declarado |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuración de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomía en SO móvil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multi-fichero de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstracción científica de frontera | 735 (8 bits) / 719 (4 bits) | ~710-720 | Nivel frontier cerrado |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Supera frontier cerrado |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni cifras de latencia o throughput medidas de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada: 23,7 GB de pesos en oQ6e; con overhead de contexto y caché KV, se recomienda un mínimo de 32 GB de memoria unificada y 48 GB para aprovechar contextos muy largos.
- Plataforma: exclusivamente Apple Silicon (Metal). No hay soporte CUDA en este checkpoint.
- GPU recomendadas: chips Apple M-series con 32 GB o más (M1/M2/M3/M4 Pro, Max y Ultra). En equipos de 32 GB el contexto práctico quedará por debajo de los 262K declarados.
- No cabe en GPU de consumo NVIDIA de 24 GB en este formato; para esas plataformas habría que recurrir a otros checkpoints del modelo base en GGUF o AWQ.
- Despliegue: Anvil Runtime (recomendado por el autor, con servidor API de alta concurrencia) y MLX-LM. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en este checkpoint.
- Latencia y throughput: el autor declara una aceleración de 1,72x a 2,20x gracias al cabezal MTP, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Solstice-AI, oQ6e) | 27,78B | 262K | MLX, Apple Silicon | Apache 2.0 | Cuantización 6 bits calibrada, MTP, sin censura |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,78B | 262K (según base) | safetensors (FP/BF16 presumiblemente) | Apache 2.0 | Modelo base sin cuantizar; requiere mucha más memoria |
| Claude Opus 4.6 Max | no disponible | no disponible | API propietaria | Propietaria | Referencia de comparación del autor; sin pesos abiertos |
| Modelos Qwen 3.x de tamaño similar | no disponible | no disponible | Múltiples | Apache 2.0 (según variante) | Alternativas de la misma familia; datos concretos no disponibles en la información proporcionada |

## Limitaciones y advertencias

- Las cifras de benchmarks provienen únicamente del autor del paquete y no han sido replicadas de forma independiente; el propio nombre del modelo incluye afirmaciones comerciales ("beats-claude-opus-4.6") que deben contrastarse.
- El modelo está ablacionado para eliminar rechazos: puede generar contenido dañino, ilegal o inseguro sin fricción. Requiere controles de uso, filtros externos y políticas organizativas claras antes de exponerlo a usuarios finales.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA sin recurrir al modelo base en otro formato.
- El contexto de 262K es una cifra nominal: en equipos de 32 GB la memoria disponible limitará la longitud efectiva, y la degradación de calidad en ventanas extremas no está documentada.
- Al ser un merge de pesos (GAIN) más una cuantización de terceros, la procedencia exacta de los datos de entrenamiento y los sesgos heredados no son auditables a partir de la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin alineamiento recae íntegramente en el desplegador.
- Riesgo de alucinación estándar en modelos de esta familia; no se han publicado tasas de factualidad ni evaluaciones de calibración.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Instalador de Anvil: https://anvil-llm.github.io/anvil/install.sh
- Organización Solstice-AI: https://huggingface.co/Solstice-AI
- Perfil de DavidAU: https://huggingface.co/DavidAU
