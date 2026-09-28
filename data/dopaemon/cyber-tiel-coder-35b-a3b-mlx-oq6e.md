# dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e

## Resumen

CyberTiel Coder 35B-A3B es un modelo de lenguaje Mixture-of-Experts (MoE) de unos 35.100 millones de parámetros totales y aproximadamente 3.000 millones activos por token (designación A3B), orientado a codificación agéntica y tareas de seguridad ofensiva. Deriva de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una versión sin censura (abliterated) de Ornith-1.5-35B-A3B. El repositorio analizado (dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e) es una conversión a formato MLX de Apple Silicon, cuantizada a 6 bits con el cuantizador oQ de oMLX (oQ6e) y con el template de chat Sharp empaquetado en el checkpoint. El pipeline declarado es image-text-to-text, de modo que incorpora capacidades de visión.

La propuesta del modelo es ocupar un hueco concreto: ser un coder de gama "frontera" dentro de la clase 35B-A3B, capaz de resolver problemas de programación sobre repositorios reales a una velocidad 3-4 veces superior a modelos densos de 3,8-27B, y todo ello sin mecanismos de rechazo. La model card afirma que supera a Ornith-1.5 y Qwen3.6-35B-A3B resolviendo aproximadamente un 70 % más de problemas reales de código en SWE-bench-Live, y que captura la flag en 15 de las 43 tareas de Cybench (35 %) en modo no guiado.

Es relevante ahora porque combina tres tendencias simultáneas: cuantización de alta calidad para hardware de consumo (MLX a 6 bits, ~29,5 GB), modelos especializados en lugar de generalistas (sacrifica conocimiento del mundo para ganar en código), y la corriente de modelos abliterated que eliminan refusals, con las implicaciones legales, éticas y de seguridad que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tags: qwen3_5_moe / qwen35moe) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | ~3 B por token (designación A3B, dato inferido de la nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits, este repo); hermano oQ4e (4 bits, ~21 GB); escalera GGUF Q2-Q8 en el build de referencia |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), etiquetado con los identificadores qwen3_5_moe y qwen35moe, lo que sitúa la familia base en la línea Qwen3 (3.5/3.6). Con ~35 B de parámetros totales y ~3 B activos, el coste de inferencia por token es mucho menor que el de un modelo denso equivalente, algo determinante para la velocidad declarada. El checkpoint incorpora además un cabezal de visión, ya que el pipeline es image-text-to-text, y empaqueta el template de chat Sharp. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF/DPO en la información proporcionada.

Lo relevante técnicamente no es el entrenamiento base (heredado de Ornith-1.5/abliterated) sino la cadena de posprocesado: re-cuantización con el cuantizador oQ de oMLX contra un corpus de calibración con peso específico en ciberseguridad, aplicación del proceso de abliteración para eliminar direcciones de rechazo, y una optimización de plantilla/estilo que reduce el "pensamiento y habla" redundantes respecto a Ornith-1.5 y Qwen3.6-35B-A3B. Existe también una variante con cabezal MTP (multi-token prediction) que, según el ecosistema, aporta ~+35 % de velocidad de decodificación, aunque no forma parte de este archivo concreto.

## Capacidades

- Generación de código y resolución autónoma de issues y bugs en repositorios grandes (evaluado en SWE-bench-Live).
- Codificación agéntica multi-paso y flujos de trabajo con tool calling implícito en tareas de resolución de problemas.
- Razonamiento y uso de terminal/entorno para tareas de captura de flag (CTF) de forma no guiada (Cybench).
- Capacidades de seguridad ofensiva sin rechazos: análisis y explotación de vulnerabilidades, pentesting.
- Procesamiento de imagen junto a texto (pipeline image-text-to-text, tag `vision`).
- Bilingüe inglés-chino.
- Modo "thinking" implícito (el modelo piensa y responde; la card destaca que habla/piensa menos que sus pares para ir más rápido).
- Sin rechazos (0 % de refusals en HarmBench); comportamiento abliterated/uncensored.
- Sin datos confirmados sobre function calling explícito con esquemas JSON ni sobre soporte de audio.

## Casos de uso

- Resolución automática de incidencias en producción: integrado en un bucle agéntico que recibe el issue, explora el repositorio y propone parches, apoyándose en su rendimiento medido en SWE-bench-Live sobre bases de código reales y recientes.
- Auditoría de seguridad y pentesting: el modelo aborda análisis de vulnerabilidades y explotación sin rechazos, útil en equipos de seguridad que necesitan un asistente que trabaje sin fricciones sobre código malicioso o PoCs.
- Pruebas de CTF y formación en ciberseguridad: con 15/43 flags en Cybench no guiado, sirve como compañero en ejercicios de captura de flag y entrenamiento ofensivo.
- Asistencia de programación en hardware de consumo: al ser un MoE de ~3 B activos en MLX a 6 bits, puede desplegarse en un Mac con memoria unificada para autocompletado y refactorización local sin depender de la nube.
- Migración y refactorización de código heredado: su capacidad de operar sobre bases de código grandes y su velocidad de resolución lo hacen apto para tareas repetitivas de transformación de código.
- Revisión de código automatizada en CI/CD: dado que el modelo es rápido por su naturaleza MoE, puede insertarse como paso de revisión o generación de tests en pipelines, aunque la ausencia de datos sobre function calling exige verificar previamente el soporte de salidas estructuradas.
- Análisis de capturas y diagramas: gracias al cabezal de visión, puede interpretar imágenes de pantalla o diagramas junto a texto (por ejemplo, leer un error en una captura e integrarlo en el contexto de depuración).

## Benchmarks y rendimiento

Los datos disponibles provienen del build GGUF del modelo (tier UD-Q4_K_M, k-quants de llama.cpp) y la propia model card advierte que no deben leerse como mediciones de este archivo MLX a 6 bits, ya que cambiar de cuantizador altera los resultados. Se reproducen como evidencia sobre el modelo, no sobre este fichero.

| Benchmark | Resultado | Notas |
|---|---|---|
| Cybench (unguided) | 15/43 flags (35 %) | Capacidad ofensiva en CTF, sin pistas ni juez |
| HarmBench | 0 % de rechazos | 84 peticiones, 12 muestreadas de cada una de las 7 categorías |
| SWE-bench-Live | ~70 % más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Sin valor absoluto publicado |
| MMLU-Pro | Igual que TielCoder; inferior a modelos generalistas | La card indica que sacrifica conocimiento del mundo por código; sin valor numérico |
| Velocidad (agentic coding) | 3-4x más rápido que densos de 3,8-27B | Comparativa cualitativa, sin cifras de tokens/s |

No se han publicado valores numéricos absolutos de MMLU-Pro, SWE-bench-Live ni tasas de tokens por segundo para este archivo MLX en la información disponible.

## Requisitos de hardware

- Peso del repo: 29,5 GB. Es una cuantización a 6 bits, por lo que se necesita memoria unificada suficiente para cargar los pesos más el contexto y el KV cache.
- Al ser MLX, el modelo está pensado exclusivamente para Apple Silicon (M-series). No se ejecuta en GPU NVIDIA/AMD con CUDA o ROCm.
- Recomendación práctica: Mac con 36-48 GB de memoria unificada como mínimo razonable para 6 bits; 64 GB o más si se quiere contexto largo y cabecera de visión cómoda. En máquinas de 32 GB el margen es muy justo.
- Alternativa de menor huella: el build hermano oQ4e (4 bits, ~21 GB) reduce el requisito de memoria.
- Despliegue: motores MLX (mlx-lm, oMLX VLM engine). Para el build GGUF asociado, llama.cpp/Ollama. No se dispone de datos de compatibilidad con vLLM o TGI para esta conversión MLX.
- Latencia y throughput: no disponibles para este archivo. La model card afirma mejoras de velocidad relativas (3-4x frente a densos de 3,8-27B; ~+35 % de decodificación en la variante con cabezal MTP), sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (codigo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberTiel Coder 35B-A3B (este) | 35,1 B totales / ~3 B activos | no disponible | Cybench 15/43; ~70 % más solves en SWE-bench-Live que Ornith-1.5 y Qwen3.6 | MIT | MLX (oQ6e/oQ4e) y GGUF |
| Ornith-1.5-35B-A3B (base) | 35 B / ~3 B activos | no disponible | Referencia inferior en SWE-bench-Live según la card; más "hablador" | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35 B / ~3 B activos | no disponible | Referencia inferior en SWE-bench-Live; mejor conocimiento del mundo en MMLU-Pro | no disponible | no disponible |
| TielCoder 35B-A3B | 35 B / ~3 B activos | no disponible | Mismo MMLU-Pro que CyberTiel; sí rechaza en HarmBench | MIT | MLX y GGUF |
| Nail-Qwen3.6-35B-A3B | 35 B / ~3 B activos | no disponible | Orientado a conocimiento general/trivia, no a código | no disponible | GGUF |

La mayoría de datos comparativos son relativos y provienen de la propia model card del autor, por lo que deben tratarse con cautela.

## Limitaciones y advertencias

- Modelo abliterated: elimina los mecanismos de rechazo (0 % en HarmBench). Puede generar contenido dañino, ilegal o inseguro. La responsabilidad de uso recae íntegramente en el usuario.
- Sesgos conocidos: no documentados en la información disponible; al heredar de Ornith-1.5 y del proceso de abliteración, no se garantiza ningún control de sesgo.
- Riesgo de alucinación: elevado en conocimiento factual; el propio autor reconoce que el modelo sacrifica conocimiento del mundo por especialización en código, con MMLU-Pro bajo. No usarlo para trivia, exámenes o datos verificables sin supervisión.
- Limitaciones de idioma: solo inglés y chino. El castellano no está declarado como soportado.
- Longitud de contexto: no disponible; el diseño agéntico sobre repositorios grandes depende de una ventana amplia que no está confirmada aquí.
- Los benchmarks citados corresponden al build GGUF a 4 bits, no a este archivo MLX a 6 bits, tal y como advierte el autor. Los números no son extrapolables a este fichero.
- Repositorio con 0 descargas y 0 likes; la authoría del fichero (dopaemon) difiere del proyecto original CyberTiel de peculiar-ragdoll al que referencia la model card. Conviene verificar la integridad y procedencia del checkpoint antes de usarlo en producción.
- Riesgo de seguridad operativa: por sus capacidades ofensivas reales, debe ejecutarse en entornos aislados (sandbox), con monitorización, y nunca expuesto directamente.
- Licencia MIT heredada: aunque permite uso comercial, conviene revisar las condiciones y avisos del modelo base abliterated de huihui-ai, que pueden imponer restricciones adicionales.

## Enlaces

- Repositorio analizado: https://huggingface.co/dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Proyecto CyberTiel (build GGUF): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Variante MLX oQ4e: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante GGUF con cabezal MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Variante MLX con MTP (YCF-AI): https://huggingface.co/YCF-AI/CyberTiel-Coder-35B-MLX
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo TielCoder (alternativa censurada): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo Nail (conocimiento general): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Referencia externa (LLM Explorer, oQ6e-MTP): https://llm-explorer.com/model/peculiar-ragdoll%2FCyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP,1WsHt7152Um2hWQXFXtqxc
- Referencia externa (LLM Explorer, oQ6e): https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ6e,73htXcPqtKOdO1vKEX9Az6
