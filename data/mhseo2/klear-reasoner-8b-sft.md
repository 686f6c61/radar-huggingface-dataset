# mhseo2/Klear-Reasoner-8B-SFT

## Resumen

Klear-Reasoner-8B-SFT es un modelo de razonamiento de 8.190.735.360 parámetros, obtenido por ajuste supervisado (SFT) a partir de Qwen/Qwen3-8B-Base. Lo desarrolla el equipo Kwai-Klear (autores del paper CE-GPPO), aunque el repositorio analizado aquí, `mhseo2/Klear-Reasoner-8B-SFT`, es una copia publicada por un tercero con 0 descargas y 0 likes. Su objetivo es resolver problemas de matemáticas y de programación competitiva mediante cadenas de razonamiento largas (long CoT), y sirve como punto de partida para la fase posterior de aprendizaje por refuerzo con el algoritmo GPPO.

El modelo se apoya en dos piezas: un SFT centrado en calidad con cadenas de pensamiento largas destiladas de DeepSeek-R1-0528, y las recetas de RL con GPPO (Gradient-Preserving clipping Policy Optimization) descritas en los preprints 2508.07629 y 2509.20712. Conviene subir la precisión de esto: este checkpoint concreto es únicamente la etapa SFT, no la versión final entrenada con RL. La diferencia es medible en los benchmarks: el SFT obtiene 75,6 % en AIME 2024 y 70,1 % en AIME 2025, mientras que la versión completa del modelo, con presupuesto de inferencia de 64K y YaRN, alcanza 90,5 % y 83,2 % respectivamente.

La relevancia actual del modelo radica en que demuestra que un transformer denso de 8B, con datos de CoT de calidad y recetas de RL eficientes, puede acercarse al rendimiento de modelos mucho mayores en dominios verificables como matemáticas y código. Su licencia Apache-2.0 y su tamaño lo hacen desplegable en una sola GPU de 24 GB con cuantización, lo que lo sitúa en la franja práctica para investigación y para generación de datos sintéticos de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); no es MoE |
| Parámetros totales | 8.190.735.360 (8,19B) |
| Longitud de contexto | No especificada para este repositorio. El modelo base Qwen3-8B-Base parte de 32.768 tokens nativos; la model card describe la ampliación del presupuesto de inferencia a 64K mediante YaRN con factor de escala 2,5 |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | Inglés (en), según la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 16,4 GB, consistente con ~8,19B parámetros en bf16/fp16) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Datasets de entrenamiento | Kwai-Klear/KlearReasoner-MathSub-30K (30K), Kwai-Klear/KlearReasoner-CodeSub-15K (15K) |
| Métrica declarada | accuracy |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B-Base: un transformer decoder-only denso de 8,19B parámetros, sin mezcla de expertos y sin mecanismos híbridos tipo SSM. El entrenamiento de este checkpoint corresponde a la primera fase descrita por los autores, un SFT orientado a calidad con cadenas de razonamiento largas destiladas de DeepSeek-R1-0528. Los datos proceden de dos subconjuntos de RL publicados por el equipo: KlearReasoner-MathSub-30K, con problemas de matemáticas, y KlearReasoner-CodeSub-15K, con problemas de código. La card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset en términos de proporciones, idiomas de origen o filtrado.

La innovación técnica asociada al proyecto reside en la fase de RL posterior, no en este checkpoint: GPPO (Gradient-Preserving clipping Policy Optimization) modifica el recorte de la ratio de importancia en PPO para que los tokens recortados sigan aportando gradiente, y CE-GPPO añade control explícito de la entropía. Los autores argumentan que el recorte estándar suprime señales de exploración críticas e ignora trayectorias subóptimas. La evaluación del modelo completo se realizó con presupuesto de inferencia ampliado a 64K tokens y YaRN con factor 2,5. Para el entrenamiento con RL se utiliza un entorno sandbox con Firejail, control multi-proceso con Pebble y verificación matemática con math_verify; el entrenamiento multinodo se orquesta con Ray. No se documenta en la información disponible el uso de DPO, RLHF con preferencias humanas ni una fase de alineación adicional para este checkpoint SFT.

## Capacidades

- Generación de texto y razonamiento de cadena larga (long CoT): produce deliberaciones extensas antes de la respuesta final en problemas matemáticos y de código.
- Razonamiento matemático avanzado: resolución de problemas de competición (AIME, HMMT) con respuestas verificables numéricamente.
- Generación de código de nivel competitivo y de entrevista técnica, evaluada con LiveCodeBench V5 y V6.
- Modo de razonamiento explícito con presupuesto de tokens ampliable; la card describe la extensión del contexto de inferencia a 64K mediante YaRN, con factor de escala 2,5.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Ajuste sobre datasets de RL publicados, lo que permite reproducir o continuar el pipeline de entrenamiento por refuerzo.

## Casos de uso

- Evaluación de razonamiento matemático en investigación: usar el modelo como baseline SFT frente a la versión completa con GPPO para medir el efecto neto del RL en AIME 2024/2025 y HMMT 2025. Es adecuado porque existe una tabla comparativa publicada con ambos checkpoints y con métricas avg@64 reproducibles.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de pensamiento largas con solución final verificable, útiles para destilar modelos más pequeños. La verificación automática con math_verify permite filtrar soluciones incorrectas antes de añadirlas al dataset.
- Asistencia en programación competitiva: para resolver problemas tipo LiveCodeBench o Codeforces. Su puntuación en LiveCodeBench V5 (58,5 avg@8) lo sitúa como candidato razonable para pre-filtrar soluciones que después se validan contra los jueces de entrada/salida.
- Tutoría matemática paso a paso: el formato de CoT larga expone el desarrollo completo del razonamiento, lo que resulta aprovechable en entornos educativos donde interesa mostrar el proceso y no solo el resultado.
- Investigación en algoritmos de RL: dado que los datasets y los scripts de entrenamiento (Ray, Firejail, Pebble) están publicados, el modelo sirve como punto de arranque para experimentar con GPPO y CE-GPPO sobre dominios con recompensa verificable.
- Despliegue on-premise con requisitos de privacidad: al ocupar 16,4 GB en bf16, se puede servir en una única GPU de 24 GB con contexto moderado, sin enviar datos a APIs externas, algo relevante para datos matemáticos o de código propietarios.
- Revisión y verificación de soluciones: dada una respuesta candidata a un problema de matemáticas o de código, el modelo puede generar una justificación independiente y contrastable, útil como generador de candidatos en esquemas de best-of-n con verificación externa.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras son pass@1 promediado (avg@n) y siguen el marco de evaluación de DeepSeek-R1 (temperature=0,6, top_p=0,95). El símbolo † indica resultados reportados por los autores originales.

| Modelo | AIME 2024 (avg@64) | AIME 2025 (avg@64) | HMMT 2025 (avg@64) | LiveCodeBench V5 (avg@8) | LiveCodeBench V6 (avg@8) |
|---|---|---|---|---|---|
| AReal-boba-RL-7B | 61,9 | 48,3 | 29,4 | 34,3 | 31,0† |
| MiMo-7B-RL | 68,2 | 55,4 | 35,7 | 57,8 | 49,3 |
| Skywork-OR1-7B | 70,2 | 54,6 | 35,7 | 47,6 | 42,7 |
| AceReason-Nemotron-1.1-7B | 72,6 | 64,8 | 42,9 | 57,2 | 52,1 |
| POLARIS-4B-Preview | 81,2 | 79,4† | 58,7 | 58,5† | 53,0† |
| Qwen3-8B | 76,0 | 67,3 | 44,7† | 57,5 | 48,4† |
| DeepSeek-R1-0528-Distill-8B | 86,0† | 76,3 | 61,5 | 61,0† | 51,6† |
| OpenReasoning-Nemotron-7B | 84,7 | 78,2 | 63,5 | 65,6† | 56,3† |
| **Klear-Reasoner-8B-SFT (este repo)** | **75,6** | **70,1** | **57,6** | **58,5** | **49,6** |
| Klear-Reasoner-8B (SFT + GPPO) | 83,2 | 75,6 | 60,3 | 61,6 | 53,1 |
| Klear-Reasoner-8B con presupuesto de inferencia de 64K + YaRN (factor 2,5) | 90,5 | 83,2 | 70,8 | 66,0 | 58,1 |

La distinción clave es que este repositorio corresponde a la fila Klear-Reasoner-8B-SFT, no a las dos filas finales, que pertenecen al modelo completo tras el RL con GPPO. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval, SWE-bench u otros) en la información disponible.

## Requisitos de hardware

Estimaciones de VRAM basadas en los 8.190.735.360 parámetros del modelo y en la arquitectura de Qwen3-8B (36 capas, GQA con 8 cabezas KV, head_dim 128); deben tomarse como aproximaciones, no como cifras medidas.

- Pesos en bf16/fp16: ~16,4 GB. Es el tamaño real del repositorio.
- Pesos en int8: ~8,2 GB.
- Pesos en 4 bits: ~4,1-5 GB, más overhead del runtime.
- Caché KV: aproximadamente 144 KB por token en bf16, lo que supone unos 4,7 GB para 32.768 tokens y unos 9,4 GB para 65.536 tokens, sin contar overhead de atención ni fragmentación.
- Presupuesto total en bf16: unos 21 GB con contexto de 32K más activaciones, es decir, al límite de una GPU de 24 GB; con contexto de 64K no cabe en 24 GB.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) para bf16 con contexto corto o para cuantización de 8 y 4 bits con contexto largo; RTX 4060 Ti de 16 GB o similares solo con cuantización de 4 bits y contexto reducido.
- GPU de centro de datos recomendadas: A100 de 40/80 GB y H100 de 80 GB para bf16 con contexto largo y lotes grandes.
- Opciones de despliegue: vLLM y SGLang para inferencia en bf16/fp16 con PagedAttention; TGI; llama.cpp y Ollama requieren una conversión previa a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. Hay que tener en cuenta que, al ser un modelo de razonamiento con CoT larga, genera varios miles de tokens por respuesta, por lo que la latencia percibida es mucho mayor que la de un modelo instruct convencional del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2024 (avg@64) | LCB V5 (avg@8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Klear-Reasoner-8B-SFT (este repo) | 8,19B | No especificado (64K con YaRN según la card) | 75,6 | 58,5 | Apache-2.0 | HuggingFace (copia de tercero) |
| Qwen3-8B | 8,2B (aprox.) | No disponible en la información proporcionada | 76,0 | 57,5 | No disponible en la información proporcionada (el base declarado por este repo es Qwen3-8B-Base, Apache-2.0) | HuggingFace |
| DeepSeek-R1-0528-Distill-8B | 8B (aprox.) | No disponible en la información proporcionada | 86,0† | 61,0† | No disponible en la información proporcionada | HuggingFace |
| OpenReasoning-Nemotron-7B | 7B (aprox.) | No disponible en la información proporcionada | 84,7 | 65,6† | No disponible en la información proporcionada | HuggingFace |
| AceReason-Nemotron-1.1-7B | 7B (aprox.) | No disponible en la información proporcionada | 72,6 | 57,2 | No disponible en la información proporcionada | HuggingFace |

Lectura de la comparativa: el checkpoint SFT de este repositorio queda por debajo de DeepSeek-R1-0528-Distill-8B y de OpenReasoning-Nemotron-7B en AIME 2024, aunque supera a este último en AIME 2025 (70,1 frente a 78,2 no; en realidad queda por debajo también en AIME 2025). Su ventaja aparece cuando se compara con la versión completa del mismo modelo tras GPPO, que sí supera a los destilados de 7-8B en varias de las métricas. La licencia Apache-2.0 de este repositorio es, en principio, más permisiva que la de algunos competidores, pero no se dispone de los términos exactos de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: le falta la fase de RL con GPPO. Los resultados de 90,5 % / 83,2 % en AIME corresponden al modelo completo, no a este repositorio, y atribuirlos a este checkpoint sería un error.
- Repositorio no oficial: el autor es `mhseo2`, no la organización Kwai-Klear, con 0 descargas y 0 likes. Conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlos en producción.
- Idioma: la model card declara únicamente inglés. El rendimiento en castellano no está documentado y previsiblemente será inferior, especialmente en matemáticas y código.
- Riesgo de alucinación: como todo modelo generativo, puede producir cadenas de razonamiento internamente coherentes pero con conclusiones incorrectas. En matemáticas es imprescindible verificar la respuesta final con un comprobador externo (por ejemplo, math_verify).
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluación de seguridad en la información disponible.
- Coste de inferencia: la generación de CoT larga multiplica el consumo de tokens de salida, lo que encarece el despliegue y aumenta la latencia. Los ajustes de temperature y top_p empleados en la evaluación (0,6 y 0,95) están pensados para muestreo de razonamiento, no para uso conversacional.
- Tool calling y uso agéntico: no documentados. No se debe asumir compatibilidad con function calling sin verificarlo.
- Cuantizaciones: no hay GGUF ni AWQ/GPTQ oficiales en el repositorio. Cualquier conversión a 4 bits es responsabilidad del usuario y puede degradar el rendimiento en matemáticas y código, dominios sensibles a la precisión numérica.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio base declarado (Qwen3-8B-Base) tiene sus propias condiciones, y las dependencias del pipeline de entrenamiento (Firejail, Pebble) tienen licencias independientes que deben revisarse si se redistribuye el flujo de entrenamiento.
- Contexto: la ventana nativa no se declara explícitamente en este repositorio y la extensión a 64K depende de configurar YaRN con factor 2,5; sin esa configuración, el contexto efectivo será el del modelo base.
- Reproducibilidad: la model card indica que la evaluación con presupuesto de 64K está "coming soon", por lo que parte de los números publicados no puede reproducirse todavía con los artefactos disponibles.

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/mhseo2/Klear-Reasoner-8B-SFT
- Modelo oficial del equipo: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Preprint del modelo (PDF): https://arxiv.org/pdf/2508.07629
- Página del paper en HuggingFace: https://huggingface.co/papers/2508.07629
- Preprint CE-GPPO (arXiv 2509.20712): https://arxiv.org/abs/2509.20712
- Dataset de matemáticas: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-MathSub-30K
- Dataset de código: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-CodeSub-15K
- Repositorio de código: https://github.com/suu990901/Klear_Reasoner
- Issues y discusiones: https://github.com/suu990901/KlearReasoner/issues
- Sandbox utilizado en el entrenamiento: https://github.com/netblue30/firejail
- Control multi-proceso: https://github.com/noxdafox/pebble
- Verificación matemática: https://github.com/huggingface/Math-Verify
- Contacto declarado: suzhenpeng13@163.com
