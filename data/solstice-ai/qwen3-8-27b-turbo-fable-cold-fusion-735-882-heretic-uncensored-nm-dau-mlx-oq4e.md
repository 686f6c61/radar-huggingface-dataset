# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e

## Resumen

Este repositorio contiene una cuantización mixta de 4 bits en formato Apple MLX (denominada oQ4e) del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, desarrollado originalmente por DavidAU. Solstice-AI se encarga del empaquetado y la cuantización downstream para Apple Silicon. El modelo parte de una base Qwen 3.8 de 27B parámetros y la somete a una fusión de pesos GAIN (Cold Fusion), a un proceso de abliteración de alineamiento (Project Heretic) y a un ajuste orientado a razonamiento, código y uso agéntico.

La propuesta diferencial es el contexto nativo de 262.144 tokens servido en un único archivo de 17,0 GB que, según la model card, cabe en MacBooks de 16 GB y 24 GB de memoria unificada mediante los motores Anvil y MLX-LM. Incorpora además atención lineal híbrida (GDN) en el 75% de las capas, predicción multi-token (MTP) para decodificación especulativa y una cuantización no uniforme guiada por matriz de importancia que preserva las cabezas de atención críticas en mayor profundidad de bits.

Es relevante ahora porque combina tres tendencias: despliegue local de modelos de razonamiento de gran contexto en hardware de consumo Apple, cuantizaciones calibradas que evitan la degradación típica del 4-bit uniforme, y variantes sin censura orientadas a flujos de trabajo de seguridad y desarrollo de sistemas. Conviene tratar con cautela las afirmaciones de rendimiento de la model card, que no están acompañadas de artefactos de evaluación reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75% capas de atención lineal GDN (Gated Delta Recurrent Network) + 25% GQA global; cabeza MTP de drafting especulativo |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | MLX oQ4e (4 bits mixto no uniforme, calibrado con matriz de importancia); tipos K/V turbo4 y turbo3 en runtime Anvil |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato Apple MLX (repo de 17,0 GB); no se publican GGUF en este repo |
| Libreria | mlx |
| Pipeline | image-text-to-text (declarado; no se detalla el adaptador visual) |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Fecha de creacion / actualizacion | 2026-09-02 / 2026-10-15 |
| Descargas / likes | 288 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen 3.8 en el que el 75% de las capas emplean atención lineal GDN con complejidad de memoria O(1) y el 25% restante mantiene atención global con Grouped-Query Attention. Esta combinación busca sostener ventanas de 262K tokens sin el coste cuadrático completo de un transformer denso. Sobre esa base, DavidAU aplica una fusión de pesos denominada GAIN (Guided Activation Interleaved Normalization), que combina checkpoints con picos de rendimiento en razonamiento, y un proceso de abliteración (Project Heretic) que elimina los vectores de rechazo del alineamiento original.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores a la fusión. La cuantización de Solstice-AI es no uniforme: un informe de matriz de importancia (`oq_imatrix_report.json`) guía qué cabezas de atención y proyecciones de router conservan mayor profundidad de bits, con el objetivo declarado de mantener el rendimiento en ARC-C por encima de 719 en 4 bits. La cabeza MTP integrada genera dos tokens por pasada forward, con una aceleración declarada de 1,72x a 2,20x en Apple Silicon.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de cadena de pensamiento (CoT) explícito.
- Generación y depuración de código, con orientación declarada a tareas de SWE-bench y SWE-bench Pro.
- Control de sistemas operativos y autonomía agéntica (OSWorld, AndroidWorld según la model card).
- Seguimiento de restricciones complejas en instrucciones largas (IFBench).
- Flujos de trabajo multi-archivo de horizonte largo (CoWorkBench).
- Soporte declarado de tool calling y function calling, implícito en los escenarios agénticos descritos.
- Capacidades multilingües limitadas a inglés y chino.
- Pipeline image-text-to-text declarado, aunque no se documenta el codificador visual ni los formatos de imagen admitidos.
- Variante sin censura (abliterada): no aplica rechazos corporativos por defecto.
- Decodificación especulativa nativa mediante cabeza MTP.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede operar sobre repositorios completos y ejecutar ciclos de edición-verificación gracias a los 262K tokens de contexto, que permiten mantener en memoria varios ficheros y el historial de herramientas sin truncamiento.
- Automatización de control de escritorio y móvil: los resultados declarados en OSWorld-Verified y AndroidWorld sugieren su uso en agentes que interpretan capturas de pantalla y emiten acciones sobre interfaces gráficas.
- Asistencia en ciberseguridad y análisis de sistemas: la abliteración elimina los rechazos, lo que facilita tareas de análisis de malware, ingeniería inversa y redacción de exploits en entornos controlados, siempre bajo revisión humana.
- Servicio local en MacBook: con 17,0 GB de pesos y cuantización oQ4e, se puede desplegar en un equipo de 24 GB de memoria unificada para asistentes de código sin conexión ni fuga de datos a la nube.
- Procesamiento de documentación técnica extensa: la ventana de 262K tokens permite resumir y consultar manuales, especificaciones o bases de código de gran tamaño en una sola pasada.
- Generación de código en pipelines de CI/CD: integrable como servicio compatible con la API de OpenAI mediante Anvil, para revisión automática de parches y generación de tests.
- Investigación sobre alineamiento y abliteración: sirve como objeto de estudio para medir qué se pierde y qué se gana al eliminar los vectores de rechazo en un modelo de 27B.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. Se presentan tal cual, con la salvedad de que no se adjuntan scripts ni artefactos de evaluación reproducibles.

| Suite | Enfoque | Modelo (declarado) | Claude Opus 4.6 Max (declarado) | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3 |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5 |
| QwenSWEBench | Depuración de repositorio completo | 79,0% | 63,8% | +15,2 |
| OSWorld-Verified | Control de SO | 84,3% | 72,7% | +11,6 |
| AndroidWorld | Autonomía en SO móvil | 81,9% | 62,0% | +19,9 |
| IFBench | Seguimiento de restricciones | 79,5% | 62,5% | +17,0 |
| CoWorkBench | Flujos multi-archivo de horizonte largo | 70,7% | 68,2% | +2,5 |
| ARC-C | Abstracción científica | 735 (8 bits) / 719 (4 bits) | ~710-720 | Tier frontera |
| ARC-E | Razonamiento de sentido común | 882 | ~870 | Por encima |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 17,0 GB para los pesos en oQ4e; el contexto de 262K requiere caché KV adicional, mitigada por los tipos turbo3/turbo4 de Anvil y por la atención lineal GDN.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card afirma funcionamiento en MacBooks de 16 GB y 24 GB; en 16 GB el margen para caché KV es muy ajustado y conviene reducir la ventana efectiva.
- GPU NVIDIA: no hay pesos GGUF ni safetensors estándar en este repositorio, por lo que no es desplegable directamente en A100, H100 o RTX 4090 sin reconvertir el checkpoint.
- Opciones de despliegue: Anvil Runtime (Metal, recomendado por el autor) y MLX-LM. No se documentan vLLM, TGI, llama.cpp ni Ollama para este repo.
- Latencia y throughput: no disponibles de forma medida; el autor declara una aceleración de 1,72x a 2,20x por la cabeza MTP en Apple Silicon, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Solstice-AI oQ4e) | 27,78B | 262K | Apache 2.0 | MLX safetensors, 17,0 GB | Abliterado, híbrido GDN, MTP |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,78B | no disponible en la información | Apache 2.0 | safetensors completo | Modelo base sin cuantizar; requiere más memoria |
| Qwen3 base (familia) | no disponible | no disponible | no disponible | múltiples | Origen arquitectónico; sin fusión GAIN ni abliteración |
| Claude Opus 4.6 Max | no disponible (cerrado) | no disponible | propietaria | API | Referencia de comparación usada por el autor; sin pesos |

No se dispone de datos verificables de otros modelos abliterados de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks de la model card no son reproducibles: no se publican harness, prompts ni logs. Tratar las cifras como afirmaciones del autor, no como resultados auditados.
- La abliteración elimina los rechazos de seguridad; el modelo puede generar contenido dañino, instrucciones de explotación o material ilegal. Requiere filtros externos y supervisión humana en producción.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- El pipeline declarado es image-text-to-text, pero no se documenta el adaptador visual; la capacidad multimodal puede no estar operativa en esta cuantización.
- La cuantización de 4 bits, aunque sea calibrada, introduce degradación frente al checkpoint completo; los propios autores reportan una caída de 735 a 719 en ARC-C.
- El contexto de 262K en 16 GB de memoria unificada es teórico: la caché KV real limita la ventana práctica y puede provocar swap y caídas de rendimiento.
- El repositorio tiene 288 descargas y 1 like, con una única organización publicadora; no hay validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden arrastrar obligaciones adicionales no detalladas.
- Riesgo elevado de alucinación en tareas de código y control de sistemas: los porcentajes declarados en SWE-bench y OSWorld no eximen de verificación automática de las acciones emitidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Motor Anvil Runtime: https://github.com/Solstice-Labs/anvil
- Instalador de Anvil: https://anvil-llm.github.io/anvil/install.sh
- Perfil del autor original: https://huggingface.co/DavidAU
- Perfil del cuantizador: https://huggingface.co/Solstice-AI
