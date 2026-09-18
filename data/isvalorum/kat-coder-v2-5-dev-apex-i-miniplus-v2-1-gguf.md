# IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2.1 es una cuantización GGUF del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario IsValorum bajo licencia Apache 2.0. El modelo base es una arquitectura de mezcla de expertos (MoE) orientada a generación de código y razonamiento, con 34.660.610.688 parámetros totales (34,66 B) y una ventana de contexto declarada de 256K tokens. La cuantización reduce el peso a aproximadamente 13,74 GiB, lo que permite ejecutarlo en estaciones de trabajo de 24 GB de VRAM combinando memoria de GPU y RAM del sistema.

La propuesta diferencial del autor no es un esquema de cuantización estándar, sino una receta por tensores bautizada como APEX-I-MiniPlus. El objetivo declarado es mantener una fidelidad cercana a Q5_K/Q6_K ocupando el espacio de un Q3_K_M: los expertos centrales se conservan en IQ3_XXS, los expertos de borde en Q3_K, el experto compartido en Q5_K en las 40 capas, las proyecciones de atención q/k/v en Q4_K, la cabeza de salida en Q6_K, las puertas de atención en Q8_0 y las matrices de enrutamiento (gate_inp) en F32 sin comprimir.

Es relevante ahora porque aborda dos cuellos de botella prácticos de los MoE grandes cuantizados: la degradación de calidad al bajar de 4 bits y los bloqueos de desquantización en CPU (AVX2) cuando el modelo se descarga parcialmente a RAM. El autor reporta 24-28+ tok/s en streaming con offload a RAM DDR4/DDR5, reservando la VRAM para la caché KV. No obstante, conviene tratar las afirmaciones de la model card como declaraciones del autor, no como resultados auditados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiquetada como qwen35moe, 40 capas y 256 microexpertos según la model card |
| Parámetros totales | 34.660.610.688 (34,66 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 256K tokens (según la model card) |
| Tipos de cuantización | GGUF APEX-I-MiniPlus-V2.1: IQ3_XXS (expertos centrales, capas 10-29), Q3_K (expertos de borde), Q5_K (experto compartido, 40 capas), Q4_K (q/k/v), Q6_K (cabeza de salida), Q8_0 (puertas de atención), F32 (routers) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base, Kwaipilot/KAT-Coder-V2.5-Dev, es una arquitectura de mezcla de expertos dispersa orientada a código y razonamiento. La model card de la cuantización indica 40 capas y 256 microexpertos, con un experto compartido (shexp) presente en todas las capas y matrices de enrutamiento que despachan cada token hacia los expertos correspondientes. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otros ajustes por preferencias del modelo base.

La innovación destacable está en el propio proceso de cuantización, no en la arquitectura. El autor aplica una asignación de precisiones por tensor: mantiene sin comprimir (F32) el 100 % de las matrices de enrutamiento para evitar deriva de routing, protege la cabeza de salida en Q6_K, eleva las puertas de atención a Q8_0 y sustituye los códecs no lineales de los expertos de borde por Q3_K lineal optimizado para SIMD, con el fin de eliminar bloqueos de desquantización AVX2 en CPU. Según la model card, se usó imatrix y herramientas de Unsloth Studio en el proceso. El autor publica además versiones anteriores (MiniPlus V1, V2) como registro de su hoja de ruta de optimización.

## Capacidades

- Generación de texto y de código, con soporte de modo razonamiento (etiquetas de tipo `<think>` mencionadas en la model card).
- Razonamiento multi-paso y tareas de código de cierta profundidad, según la orientación del modelo base y la conservación deliberada de los expertos centrales en 3 bits.
- Conversación multiturno (etiqueta conversational y pipeline text-generation).
- Capacidades multilingües declaradas para 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Tool calling / function calling: no disponible (no se documenta explícitamente en la información proporcionada).
- Soporte de visión o audio: no disponible (el modelo es de texto).
- Capacidades de agente: no disponible de forma explícita.

## Casos de uso

- Asistencia de código en el IDE con contexto largo: la ventana declarada de 256K permite cargar repositorios o módulos completos junto con el historial de conversación, útil para refactorizaciones que requieren visibilidad de múltiples ficheros a la vez.
- Servidor de generación de código autohospedado en una estación de trabajo de 24 GB: al ocupar unos 13,74 GiB, deja espacio en VRAM para cachés KV grandes mientras el resto del modelo puede transmitirse desde RAM del sistema, sin necesidad de GPU de centro de datos.
- Generación de tests unitarios y documentación: el modelo puede producir código de prueba y comentarios a partir de firmas de funciones y contexto del proyecto, una tarea donde la coherencia sintáctica depende directamente de la fidelidad de la cuantización.
- Revisión de código y detección de errores en pipelines de CI: integrado vía llama.cpp o un servidor compatible con la API de OpenAI, puede analizar diffs y señalar problemas de estilo, indentación o lógica antes del merge.
- Migración y traducción de código entre lenguajes: el soporte multilingüe (13 idiomas) y la capacidad de código permiten asistir en la traducción de fragmentos entre lenguajes de programación y en la adaptación de documentación técnica a otros idiomas.
- Explicación de bases de código heredadas: con la ventana completa de 256K, se puede alimentar el modelo con ficheros extensos y pedir resúmenes arquitectónicos, diagramas de dependencias o explicaciones paso a paso de la lógica.
- Razonamiento asistido y resolución de problemas técnicos en local: el modo de razonamiento resulta adecuado para depuración guiada, análisis de algoritmos o matemáticas aplicadas, siempre que se asuma la pérdida de precisión inherente a una cuantización de 3 bits en los expertos centrales.
- Despliegue en entornos con GPU modesta y mucha RAM: escenario específicamente optimizado por esta receta, donde el grueso de los pesos reside en DDR4/DDR5 y la GPU se reserva para la caché de contexto.

## Benchmarks y rendimiento

El único dato cuantitativo publicado en la información disponible es la perplejidad del propio binario GGUF, no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no están disponibles.

| Métrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 (GGUF cuantizado) | 5,5045 ± 0,1330 | 2048 de contexto, 10 chunks, evaluado sobre el binario GGUF |
| Perplejidad WikiText-2 (base sin cuantizar, aproximada) | ≈ 5,44 | Referencia citada por el autor; ΔPPL ≈ +0,06 |
| Velocidad de generación con offload a RAM del sistema | +24 a 28+ tok/s | DDR4 dual-channel o DDR5 6000+ MT/s, según el autor |
| Parámetros totales | 34.660.610.688 | Dato real de safetensors |
| Tamaño del repositorio | 14,8 GB | Total del repo en HuggingFace |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos completos: aproximadamente 13,74 GiB (unos 14,7 GB según la model card), más la caché KV correspondiente al contexto elegido.
- Contexto: la ventana declarada es de 256K tokens; la caché KV para contextos muy largos crece de forma notable y es el principal consumidor de VRAM cuando los pesos se descargan a RAM.
- GPU recomendadas: el autor apunta a estaciones de trabajo con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G/A5000 en el mismo rango) para offload total o mayoritario. GPU de centro de datos (A100 40/80 GB, H100) no son necesarias dado el tamaño del modelo, aunque darían más margen de contexto en VRAM.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB cabe el modelo completo (más una caché KV moderada). En GPU de 12-16 GB requiere descargar parte de las capas a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo, con `-ngl` para controlar capas en GPU), Ollama, LM Studio y cualquier servidor compatible con GGUF basado en llama.cpp. El autor etiqueta el modelo como endpoints_compatible. El soporte en vLLM o TGI no está documentado en la información disponible.
- Latencia y throughput: el autor reporta entre 24 y 28+ tok/s en streaming cuando se descarga el grueso del modelo a RAM del sistema (DDR4 dual-channel o DDR5 6000+ MT/s), velocidad que puede acercarse a la de ejecución íntegra en VRAM con memorias rápidas. No hay mediciones independientes ni datos de time-to-first-token.

## Comparativa con modelos similares

La información disponible solo permite comparar entre variantes de cuantización del mismo modelo base, no con modelos de la competencia.

| Variante | Expertos centrales | Expertos de borde | Experto compartido | Cabeza de salida | Routers | Tamaño aproximado | Impacto declarado |
|---|---|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (esta ficha) | IQ3_XXS | Q3_K (10 capas) | Q5_K (40 capas) | Q6_K | F32 | ≈ 13,74 GiB | Sin bloqueos AVX2 en CPU; 24-28+ tok/s con offload a RAM |
| APEX-I-MiniPlus V2 | IQ3_XXS | IQ3_S (10 capas) | IQ4_NL | Q6_K | F32 | ≈ 13,64 GiB (unos 100 MB menos) | Mayor protección teórica de capas de borde; calidad prácticamente idéntica en la práctica |
| APEX Mini genérico (comunidad) | IQ2_S | Q3_K (5 capas) | Q4_K/Q3_K | Q3_K_M | Comprimido | ≈ 12,5 GB | Errores de sintaxis graves, indentación rota y perplejidad alta en modo razonamiento, según el autor |

Comparación con modelos alternativos de la misma categoría (otros asistentes de código open source de ~30-35 B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización de 3 bits en los expertos centrales: la propia model card reconoce una pérdida de perplejidad (ΔPPL ≈ +0,06 frente al modelo sin cuantizar), por lo que no es equivalente al modelo base en precisión.
- Las afirmaciones de rendimiento (24-28+ tok/s, fidelidad tipo Q5-Q6, contexto completo de 256K) proceden del autor de la cuantización y están etiquetadas como registro de optimización propio; no se han verificado de forma independiente.
- La model card dedica una sección explícita a desaconsejar las recetas APEX-I-Mini genéricas de la comunidad (IQ2_S con cabeza de salida en Q3_K_M), que según el autor provocan errores de sintaxis y fallos de indentación. Esto implica que la calidad depende críticamente de usar exactamente este binario y no otro con nombre parecido.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada de tasas de alucinación, factualidad ni robustez para este modelo o su base.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, toxicidad o alineación.
- Limitaciones de idioma: aunque se declaran 13 idiomas, no se especifica el reparto del corpus de entrenamiento ni el rendimiento relativo entre lenguas; el modelo está orientado principalmente a inglés y chino dado su origen (Kwaipilot).
- Restricciones de licencia: el repositorio de la cuantización se distribuye como apache-2.0. Sin embargo, la licencia del modelo base Kwaipilot/KAT-Coder-V2.5-Dev no se detalla en la información proporcionada; antes de un uso comercial conviene verificar la licencia del modelo original, ya que una cuantización no puede otorgar permisos más amplios que el modelo del que deriva.
- Contexto: los 256K tokens son la cifra declarada por el autor; no se aportan resultados de evaluación en contextos largos (por ejemplo, tareas tipo needle-in-a-haystack), y la degradación a contextos muy extensos no está cuantificada.
- Fecha de creación y actualización del repositorio: 2026-09-18 y 2026-09-20, con solo 667 descargas y 1 like en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- Tool calling, uso como agente y plantillas de chat: no documentados; habría que verificar el chat template incluido en el GGUF antes de integrarlo en pipelines que dependan de llamadas a funciones.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Paper, blog técnico, repositorio de código o demo del modelo base: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su modelo base (únicamente dominios de contenido no relacionado), por lo que no se incluyen enlaces adicionales.
