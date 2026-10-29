# DICPlay/RusMind-Vspyshka-4.7

## Resumen

RusMind 4.7 «Вспышка» (Vspyshka, «destello») es un modelo de generación de texto de aproximadamente 8.000 millones de parámetros desarrollado por DICPlay dentro de su familia RusMind, diseñado explícitamente para inferencia local y sin conexión en PC, portátiles y teléfonos de gama alta. Se publica con pesos completos en safetensors (BF16, 16 GB) y una colección de cuantizaciones GGUF pensadas para llama.cpp, LM Studio, Ollama y PocketPal. Los idiomas declarados son ruso e inglés.

Su propuesta de valor no es el rendimiento generalista, sino el ruso: según el benchmark MERA v2 (octubre de 2026) obtiene 0,191 de puntuación global, el mejor resultado de la familia RusMind y el primer puesto entre modelos de hasta 10.000 millones de parámetros en cuatro categorías (global, razonamiento, cultura y regiones de Rusia, y comprensión de personas). La model card compara explícitamente el modelo con Qwen3.5-9B, Gemma 4 E4B, T-lite de T-Bank, A-Vibe de Avito, RuadaptQwen3-32B y Zero-Mistral.

El interés del lanzamiento está en la combinación de tamaño contenido (~8 B), distribución en GGUF de entre 3,8 y 5,3 GB y resultados declarados por encima de modelos tres y cuatro veces mayores en tareas rusas concretas: corrección ortotipográfica (0,719 en SAGE), interpretación de personajes (0,537) y tool calling (0,302 en GorillaHard, con un 86 % de selección correcta de herramienta). Conviene señalar que el repositorio acumula 0 descargas y 0 «likes» en el momento de la ficha, y que la evaluación disponible procede íntegramente de MERA, sin reproducción independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible. La etiqueta `gemma4` del repositorio sugiere una base de la familia Gemma 4 (transformer decoder), sin confirmación explícita en la model card |
| Parametros totales | 7.996.156.490 (~8,0 B) según los safetensors; la model card indica 7,5 B (discrepancia de ~500 M) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: Mini, Lite, Q2_K, Q3_K_M, Q4_K_M y variantes adicionales no listadas (el listado de la model card está truncado; el repo ocupa 62,4 GB) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | `rusmind-license` (etiqueta `license: other`) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

La información proporcionada no documenta la arquitectura interna, el volumen de tokens de entrenamiento, la composición del corpus ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La model card se centra en resultados de evaluación y en el formato de distribución (on-device, offline), no en la metodología. La etiqueta `gemma4` apunta a una base de la familia Gemma 4 y la etiqueta `image-text-to-text` sugiere alguna forma de entrada multimodal, pero ninguna de las dos afirmaciones se desarrolla en el texto del autor; el `pipeline_tag` declarado es `text-generation`.

La innovación declarada no es arquitectónica sino de empaquetado y orientación lingüística: cuantizaciones GGUF con nombres propios (Mini 3,8 GB, Lite 4,2 GB) dirigidas a navegador, móvil y portátil, junto con un ajuste específico sobre ruso que cubre ortografía y puntuación, cultura e historia de Rusia, comprensión de personajes y llamada a funciones. El modelo incluye la etiqueta `endpoints_compatible`, lo que indica compatibilidad con los Inference Endpoints de Hugging Face.

## Capacidades

- Generación de texto conversacional y multi-turno en ruso e inglés.
- Razonamiento: 0,385 en el apartado de razonamiento de MERA v2.
- Corrección ortográfica y de puntuación en ruso: 0,719 en SAGE (0,760 en signos de puntuación).
- Interpretación de personajes y role-play: 0,537 en Characters.
- Desambiguación léxica y semántica: 0,465 en LIMUR y 0,373 en enantiosemia (palabras con significados opuestos).
- Lógica y preguntas de sentido común: 0,330 en NewReasoning.
- Conocimiento de cultura, historia, regiones y pueblos de Rusia: 0,228 en el apartado específico de MERA.
- Tool calling / function calling: 0,302 en GorillaHard, con un 86 % de selección correcta de herramienta y un 100 % de resistencia declarada a la sustitución de instrucciones (prompt injection).
- Seguimiento de instrucciones complejas con múltiples requisitos simultáneos: 0,300 en IFHard.
- Ejecución totalmente offline sobre dispositivo, sin dependencia de red.
- Capacidad de imagen a texto: no confirmada. La etiqueta `image-text-to-text` está presente en el repositorio, pero la model card no describe ninguna función de visión.

## Casos de uso

- Asistencia offline en portátil o PC de sobremesa: con el GGUF Q4_K_M (5,3 GB) el modelo cabe en GPUs de 8 GB y permite redactar, resumir y responder preguntas sin conexión, algo relevante en entornos air-gapped o con requisitos de privacidad estrictos.
- Corrección ortotipográfica de textos en ruso en pipelines editoriales: la puntuación de 0,719 en SAGE y 0,760 en signos de puntuación lo sitúan como un componente viable para un paso automático de revisión previo a la edición humana.
- Atención al cliente en ruso con invocación de herramientas: el 86 % de selección correcta de herramienta en GorillaHard permite construir un agente que consulte estado de pedidos, saldo o incidencias mediante function calling, aunque el 14 % de fallo exige validación posterior.
- Agentes locales multi-paso: la resistencia del 100 % a la sustitución de instrucciones declarada en la model card lo hace apto para prototipos de agentes que procesan contenido no confiable del usuario sin salirse del flujo previsto.
- Generación de personajes para videojuegos, formación o narrativa interactiva: la puntuación de 0,537 en Characters indica que mantiene voces y registros diferenciados, útil para diálogos de NPC o simulaciones de entrevista.
- Procesamiento de instrucciones administrativas o legales con varias restricciones simultáneas: 0,300 en IFHard permite encargarle tareas del tipo «resume este documento en 200 palabras, en tercera persona, citando fechas y sin valoraciones».
- Aplicaciones móviles Android/iOS mediante PocketPal: el GGUF Mini de 3,8 GB está pensado para navegador y teléfonos, y el Lite de 4,2 GB para dispositivos de gama alta y portátiles ligeros.
- Divulgación y contenido cultural sobre Rusia: la puntuación de 0,228 en cultura y regiones (frente a 0,118 de Qwen3.5-9B) lo hace útil para materiales divulgativos sobre historia, geografía y pueblos del país, siempre con verificación factual.
- Análisis lexicográfico y detección de ambigüedad: los resultados en LIMUR y enantiosemia permiten usarlo como apoyo en anotación lingüística o en sistemas de desambiguación de sentido.

## Benchmarks y rendimiento

Todos los datos proceden de MERA v2 (Multimodal Evaluation for Russian-language Architectures), octubre de 2026, según la model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

Comparativa dentro de la franja de tamaño:

| Seccion MERA v2 | RusMind Vspyshka 4.7 (7,5 B) | Qwen3.5-9B (9 B) | Gemma 4 E4B (8 B) | T-lite · T-Bank (8 B) | A-Vibe · Avito (8 B) |
|---|---|---|---|---|---|
| Puntuación global | **0,191** | 0,186 | 0,170 | 0,130 | 0,113 |
| Razonamiento | **0,385** | 0,339 | 0,367 | 0,218 | 0,187 |
| Comprensión de personas | **0,257** | 0,218 | 0,172 | 0,169 | 0,132 |
| Cultura y regiones de Rusia | **0,228** | 0,118 | 0,199 | 0,196 | 0,171 |

Comparativa frente a modelos mayores:

| Seccion MERA v2 | RusMind Vspyshka 4.7 (7,5 B) | RuadaptQwen3-32B (32 B) | Zero-Mistral (24 B) |
|---|---|---|---|
| Puntuación global | **0,191** | 0,163 | 0,160 |
| Razonamiento | **0,385** | 0,342 | 0,213 |
| Comprensión de personas | **0,257** | 0,177 | 0,235 |

Desglose por tarea (MERA v2):

| Tarea | Puntuación |
|---|---|
| Corrección ortográfica y puntuación (SAGE) | 0,719 |
| Signos de puntuación (SAGE) | 0,760 |
| Respuestas como personaje (Characters) | 0,537 |
| Atribución de palabra en texto (LIMUR) | 0,465 |
| Palabras con significados opuestos (Enantiosemy) | 0,373 |
| Lógica y sentido común (NewReasoning) | 0,330 |
| Preguntas de opción múltiple (RUBIN) | 0,328 |
| Llamada a herramientas (GorillaHard) | 0,302 (86 % herramienta correcta, 100 % resistencia a inyección) |
| Instrucciones complejas (IFHard) | 0,300 |
| Humor | 0,196 |

Nota de lectura: las puntuaciones de MERA se expresan en escala 0-1 y los valores absolutos son moderados. La ventaja del modelo es relativa a su franja de tamaño y a la lengua rusa; en términos absolutos, un 0,191 global indica margen de error considerable en producción.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas de los tamaños de fichero publicados, no datos oficiales del autor.

- Pesos completos BF16 (16 GB): requiere 24 GB o más de VRAM para acomodar pesos y contexto. GPU válidas: RTX 3090, RTX 4090, A100 40/80 GB, H100. En GPUs de 24 GB conviene dejar margen para el KV cache, cuya longitud depende de un contexto no documentado.
- GGUF Q4_K_M (5,3 GB): variante principal recomendada por el autor. Cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060 Ti 8 GB, RTX 3070) y en 12 GB (RTX 3060 12 GB, RTX 4070) con holgura.
- GGUF Q3_K_M (4,9 GB): para equipos con 6-8 GB de VRAM o memoria unificada limitada.
- GGUF Q2_K (4,4 GB): la opción estándar más pequeña; asumible en 6 GB de VRAM, con pérdida de calidad esperable.
- GGUF Lite (4,2 GB) y Mini (3,8 GB): orientados a teléfonos de gama alta y a ejecución en navegador; también válidos para CPU con llama.cpp.
- CPU-only: viable con llama.cpp en cualquiera de las variantes GGUF; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria, sin cifras publicadas.
- Despliegue: llama.cpp, LM Studio, Ollama, PocketPal y Transformers. Compatibilidad con vLLM, TGI o SGLang no confirmada en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo por hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 global | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | ~8,0 B (declara 7,5 B) | no disponible | 0,191 | rusmind-license (other) | safetensors, GGUF | Offline/on-device, ruso e inglés |
| Qwen3.5-9B (Alibaba) | 9 B | no disponible | 0,186 | no disponible en la información | no disponible | Superado en global, razonamiento, personas y cultura rusa |
| Gemma 4 E4B (Google) | 8 B | no disponible | 0,170 | no disponible en la información | no disponible | Mejor en cultura rusa que Qwen; por debajo en razonamiento |
| T-lite (T-Bank) | 8 B | no disponible | 0,130 | no disponible en la información | no disponible | Modelo ruso de referencia en su franja; claramente por debajo |
| A-Vibe (Avito) | 8 B | no disponible | 0,113 | no disponible en la información | no disponible | El más flojo del grupo comparado |
| T-pro (T-Bank) | 33 B | no disponible | 0,196 | no disponible en la información | no disponible | Solo 0,005 por encima en global pese a cuadruplicar parámetros; RusMind gana en comprensión de personas (0,257 vs 0,249) |
| RuadaptQwen3-32B | 32 B | no disponible | 0,163 | no disponible en la información | no disponible | Inferior en global, razonamiento y personas |
| Zero-Mistral | 24 B | no disponible | 0,160 | no disponible en la información | no disponible | Superior a RusMind en comprensión de personas (0,235 vs 0,257 es a favor de RusMind) y muy inferior en razonamiento |

## Limitaciones y advertencias

- Licencia `rusmind-license` con etiqueta `other`: las condiciones de uso comercial no se detallan en la información disponible. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier despliegue en producción.
- Evaluación exclusivamente en MERA v2, un benchmark centrado en ruso y gestionado por el ecosistema empresarial ruso. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones multilingües generalistas.
- Puntuaciones absolutas bajas: 0,191 global, 0,196 en humor y 0,300 en instrucciones complejas. La ventaja es relativa a la franja de tamaño, no un indicador de robustez general.
- Cobertura lingüística reducida a ruso e inglés. No se declara soporte de español ni de otras lenguas.
- Longitud de contexto no documentada: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a la familia, sin mecanismos de mitigación documentados (no se describe entrenamiento con RLHF, verificación factual ni modo de citación de fuentes).
- Sesgos desconocidos: no se publica información sobre la composición del corpus de entrenamiento. El fuerte enfoque en historia, cultura y regiones de Rusia puede introducir un encuadre editorial concreto en temas sensibles.
- Discrepancia en el recuento de parámetros: 7,5 B declarados frente a 7,99 B reales en safetensors.
- Repositorio de 62,4 GB por la acumulación de cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- 0 descargas y 0 «likes» en el momento de la ficha, con publicación el 28 de octubre de 2026: sin validación de la comunidad ni reproducciones independientes de los resultados.
- Tool calling con un 86 % de selección correcta implica aproximadamente un 14 % de invocaciones erróneas; requiere capa de validación y reintentos.
- Etiqueta `image-text-to-text` sin respaldo en el cuerpo de la model card: no asumir capacidades de visión.
- La model card proporcionada está truncada en el listado de ficheros GGUF, por lo que pueden existir variantes adicionales (Q5, Q6, Q8) no verificadas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Carpeta de cuantizaciones GGUF: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/tree/main/gguf
- GGUF Mini (3,8 GB): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/blob/main/gguf/RusMind-Vspyshka-4.7-Mini.gguf
- GGUF Lite (4,2 GB): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/blob/main/gguf/RusMind-Vspyshka-4.7-Lite.gguf
- GGUF Q2_K (4,4 GB): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/blob/main/gguf/RusMind-Vspyshka-4.7-Q2_K.gguf
- GGUF Q3_K_M (4,9 GB): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/blob/main/gguf/RusMind-Vspyshka-4.7-Q3_K_M.gguf
- GGUF Q4_K_M (5,3 GB): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7/blob/main/gguf/RusMind-Vspyshka-4.7-Q4_K_M.gguf
- Sitio oficial del proyecto: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo relacionado, RusMind Vspyshka (versión previa): https://huggingface.co/DICPlay/RusMind-Vspyshka
- Modelo relacionado, RusMind 4.7 Momentum: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Informe de terceros sobre RusMind 4.7 Momentum (52 preguntas): https://note.com/la_e/n/ndaefe918321d
