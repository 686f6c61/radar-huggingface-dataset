# sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M

## Resumen

openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M es una conversión cuantizada en formato GGUF (Q4_K_M) del modelo openbmb/MiniCPM5-2B-MLX, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. No es un modelo entrenado desde cero, sino una redistribución optimizada para inferencia en llama.cpp: el autor toma los pesos base, los cuantiza a 4 bits y los empaqueta para su ejecución en GPU de gama baja, CPU o dispositivos de borde. El repositorio tiene un tamano de 1,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

El modelo base es un transformer denso de tipo llama con aproximadamente 2.516.756.480 parámetros (≈2,52B) y una ventana de contexto declarada de 131.072 tokens, 42 capas y dimensión oculta de 2048. Está orientado a generación de texto conversacional y declara soporte únicamente para inglés e italiano. Su interés para desarrolladores reside en la relación entre tamaño reducido y contexto muy largo, lo que lo hace adecuado para agentes de voz en tiempo real y despliegues con restricciones de memoria.

La relevancia práctica del repositorio es doble: por un lado, ofrece un artefacto listo para llama.cpp con un consumo declarado de unos 2,4 GB de VRAM con descarga completa en GPU; por otro, incluye un conjunto de evaluaciones publicadas por el propio autor (benchmarks, protocolo de tool calling y comparativa entre modos de razonamiento). Conviene tratar estas cifras con cautela, ya que la propia model card advierte que fueron medidas sobre subconjuntos de los datasets y no sobre las suites completas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llama (transformer denso) |
| Parámetros totales | 2.516.756.480 (≈2,52B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q4_K_M (única cuantización publicada en este repositorio) |
| Idiomas soportados | inglés (en) e italiano (it) |
| Licencia | other (la model card muestra una insignia Apache-2.0; discrepancia no resuelta en la información disponible) |
| Formato de pesos | GGUF (Q4_K_M) |

Otros datos declarados por el autor: 42 capas transformer, dimensión oculta de 2048, huella en disco de 1,45 GB, VRAM estimada de ~2,4 GB con descarga completa en GPU y ~2,2 GB de RAM en CPU o modo híbrido. La fecha de creación y actualización del repositorio es el 15 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura declarada como llama, sin mezcla de expertos (MoE) ni mecanismos de estado (SSM) o híbridos según la información disponible. Consta de 42 capas y una dimensión oculta de 2048, lo que da como resultado unos 2,52B de parámetros totales. La ventana de contexto indicada es de 131.072 tokens, un valor notablemente alto para su tamaño, lo que sugiere que el modelo base fue entrenado o ajustado específicamente para extender el contexto. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similares.

Este repositorio concreto no documenta entrenamiento alguno: es una cuantización posterior a Q4_K_M del modelo base openbmb/MiniCPM5-2B-MLX mediante el flujo de publicación de Sigma Studio. Por tanto, las innovaciones de entrenamiento pertenecen al modelo original y no se describen aquí. La model card sí documenta una característica funcional: un modo de razonamiento explícito ("Deep Thinking", con traza de cadena de pensamiento) frente a un modo directo ("No-Thinking"), con una mejora declarada de 5,5 puntos porcentuales al activar el razonamiento CoT.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistentes y diálogo.
- Modo de razonamiento con cadena de pensamiento (Deep Thinking CoT) y modo directo sin traza de razonamiento, conmutables.
- Razonamiento matemático elemental: en la evaluación publicada obtiene 9/9 en GSM8K y 6/9 en MATH.
- Generación de código Python: 6/7 en HumanEval y 8/9 en MBPP según los datos del autor.
- Soporte de tool calling / function calling, con una adherencia declarada al protocolo de herramientas del 77,2% (71/92 criterios verificados).
- Capacidades agénticas de múltiples pasos: 50% de finalización autónoma de tareas (4/8 escenarios) en un entorno de sandbox aislado.
- Capacidad multilingüe limitada a inglés e italiano según los metadatos; no se declara soporte de castellano.
- Ventana de contexto de 131.072 tokens, apta para conversaciones o documentos largos.

## Casos de uso

- Agentes de voz en tiempo real: el consumo declarado de ~2,4 GB de VRAM permite ejecutar el modelo en GPU de gama baja o en CPU, reduciendo la latencia de primer token, algo crítico en pipelines de voz conversacional.
- Asistencia conversacional en dispositivos de borde: su cuantización Q4_K_M y su huella de 1,45 GB en disco lo hacen desplegable en equipos sin GPU dedicada, útil para asistentes locales de escritorio o integrados.
- Procesamiento de documentos largos en inglés o italiano: con 131.072 tokens de contexto puede resumir o extraer información de contratos, informes o transcripciones extensas sin fragmentación agresiva.
- Agentes con tool calling sobre sistemas de ficheros: la model card documenta un protocolo agéntico con operaciones sobre ficheros en un sandbox, replicable en tareas de automatización de escritorio o scripts controlados.
- Generación y revisión de código Python en pipelines de CI/CD: los resultados declarados en HumanEval y MBPP sugieren su uso como asistente de autocompletado o revisión, integrándolo vía llama.cpp en herramientas de desarrollo.
- Prototipado rápido y experimentación académica: al ser un GGUF ligero, permite iterar sobre prompts, modos de razonamiento y estrategias de tool calling en hardware de consumo sin costes de infraestructura.
- Resolución de problemas matemáticos de nivel escolar: dado el 9/9 declarado en GSM8K, puede emplearse en tutores educativos o asistentes de ejercicios paso a paso en inglés o italiano.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card y fueron medidos, según el autor, mediante Sigma Studio Training Lab en GPU (semilla 42, temperatura 0,0). La propia fuente advierte que se evaluaron subconjuntos de los datasets, no las suites completas, por lo que las cifras no son comparables con ejecuciones de referencia completas. Hash de reproducibilidad declarado: SHA256-3040EE2CBFBE22AF.

| Benchmark | Dominio | Aciertos / total | Precisión |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 5 / 9 | 56% |
| BIG-Bench Hard | Lógica y simbolismo multitarea | 5 / 7 | 71% |
| GPQA | Razonamiento académico de posgrado | 1 / 9 | 11% |
| GSM8K | Matemáticas escolares multi-paso | 9 / 9 | 100% |
| HellaSwag | Sentido común y NLI situacional | 2 / 9 | 22% |
| HumanEval | Codificación Python (pass@1) | 6 / 7 | 86% |
| MATH | Matemáticas de competición | 6 / 9 | 67% |
| MBPP | Programación Python con tests | 8 / 9 | 89% |
| MMLU | Conocimiento general multisujeto | 6 / 14 | 43% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 4 / 9 | 44% |
| TruthfulQA | Factualidad y anti-alucinación | 3 / 9 | 33% |
| Total | Todos los datasets evaluados | 55 / 100 | 55% |

Comparativa de modos de razonamiento:

| Modo | Precisión | Aciertos / total | Perfil operativo |
|---|---|---|---|
| No-Thinking (respuesta directa) | 52,6% | 30 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 58,1% | 25 / 43 | Traza de razonamiento multi-paso, +5,5% |

Protocolo de tool calling y agente (sandbox aislado):

| Métrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 77,2% | 71/92 criterios verificados |
| Finalización autónoma de tareas | 50,0% | 4/8 escenarios completados |
| Confinamiento en sandbox | 100% conforme | Cero intentos de escape del espacio de trabajo |
| Eficiencia de ejecución | 67 turnos (393,2 s) | Uso declarado óptimo del presupuesto |

No se han publicado resultados de benchmarks verificados de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2,4 GB con descarga completa en GPU; ~2,2 GB de RAM en CPU o ejecución híbrida (Q4_K_M).
- VRAM de trabajo recomendada: GPU con 6-8 GB de VRAM según el autor.
- RAM de sistema recomendada: 16 GB si se ejecuta sin GPU.
- Compatibilidad con GPU de consumo: sí; el modelo entra holgadamente en tarjetas de 6-8 GB como RTX 3060, RTX 4060, RTX 2060 o superiores.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama mediante importación del GGUF, y motores compatibles con endpoints según la etiqueta `endpoints_compatible`. El modelo base está en formato MLX, por lo que la vía de despliegue en Apple Silicon pasa por el repositorio original.
- Latencia y throughput: no disponible; la model card solo reporta el tiempo total de una ejecución agéntica (393,2 s para 67 turnos), que no equivale a una medición de throughput.

## Comparativa con modelos similares

La comparación se limita a especificaciones, ya que no hay datos de benchmarks verificados de forma independiente en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-MLX (GGUF Q4_K_M, este repo) | ≈2,52B | 131.072 tokens | other (insignia Apache-2.0 en la model card) | GGUF Q4_K_M; base en MLX |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ampliable a 131.072) | Apache-2.0 | safetensors, GGUF, múltiples cuantizaciones |
| Gemma 2 2B | 2,61B | 8.192 tokens | Gemma (uso comercial con condiciones) | safetensors, GGUF |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache-2.0 | safetensors, GGUF |

El rasgo diferencial de este modelo es la combinación de un tamaño de ~2,5B con una ventana de contexto de 131.072 tokens, muy superior a la de alternativas de tamaño similar. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados se midieron sobre subconjuntos de los datasets, tal como advierte la propia model card; no son comparables con ejecuciones de suite completa.
- Resultados bajos declarados en GPQA (11%), HellaSwag (22%) y TruthfulQA (33%), lo que indica debilidades en razonamiento avanzado, sentido común y factualidad.
- Riesgo de alucinación relevante: el 33% en TruthfulQA sugiere una fiabilidad limitada en la veracidad factual.
- Idiomas soportados únicamente inglés e italiano; no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Discrepancia de licencia: los metadatos de HuggingFace indican `other`, mientras que la model card muestra una insignia Apache-2.0. Debe aclararse con el autor antes de cualquier uso comercial.
- Es una conversión de terceros (autor sigmanih) y no una publicación oficial de OpenBMB; no hay garantía de fidelidad respecto al modelo base.
- Repositorio sin descargas ni valoraciones, lo que implica ausencia de validación por parte de la comunidad.
- Solo se ofrece una cuantización (Q4_K_M); no hay alternativas de mayor o menor precisión en este repositorio.
- El modelo base está en formato MLX (Apple), de modo que este GGUF es una vía derivada y no la distribución oficial.
- No se documentan la composición del dataset de entrenamiento ni los procesos de alineación, lo que dificulta evaluar sesgos conocidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Paper, blog o demo oficial: no disponible en la información proporcionada.
