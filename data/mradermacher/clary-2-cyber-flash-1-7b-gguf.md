# mradermacher/Clary-2-Cyber-Flash-1.7B-GGUF

## Resumen

Clary-2-Cyber-Flash-1.7B-GGUF es un conjunto de cuantizaciones estáticas en formato GGUF publicadas por el usuario mradermacher a partir del modelo original AuroraSystem/Clary-2-Cyber-Flash-1.7B. El modelo base es un transformer decoder-only de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) afinado para tareas de ciberseguridad, CTF (capture the flag), generación de código e ingeniería inversa, según los tags declarados en la model card. Las etiquetas `qwen`, `qwen3` y `dora` indican que la arquitectura de partida pertenece a la familia Qwen3 y que el ajuste se realizó mediante adaptadores DoRA.

La relevancia de esta publicación es práctica más que científica: mradermacher no entrena el modelo, sino que lo convierte a GGUF y lo publica en once niveles de cuantización distintos, desde Q2_K (0,9 GB) hasta f16 (3,5 GB). Esto permite ejecutar un modelo especializado en seguridad ofensiva/defensiva y análisis de código sobre hardware muy modesto, incluidas CPU sin GPU dedicada, algo poco habitual en el nicho de modelos de ciberseguridad, donde predominan checkpoints de mayor tamaño. El repositorio completo ocupa 16,0 GB.

El modelo soporta ruso e inglés (`ru`, `en`) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card no documenta longitud de contexto, composición del dataset de entrenamiento, proceso de alineación ni resultados de benchmarks, por lo que buena parte de las especificaciones habituales quedan como no disponibles y deben verificarse contra el repositorio del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (segun tags `qwen` y `qwen3`); ajuste fino con adaptadores DoRA; no se detalla si es densa o hybrid |
| Parametros totales | 1.720.574.976 (dato real de safetensors, segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; tambien existe el modelo base en safetensors) |
| Tamano del repositorio | 16,0 GB |
| Contexto de la ventana de entrenamiento | no disponible |
| Tipo de cuantizacion del convertidor | static (quantize_version 2, output_tensor_quantised 1); no hay quants weighted/imatrix publicados por el autor |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el entrenamiento del modelo base dentro de la información proporcionada. Los metadatos de HuggingFace y los tags de la model card permiten afirmar únicamente que se trata de un transformer de la familia Qwen3, ajustado mediante DoRA (Weight-Decomposed Low-Rank Adaptation, una variante de LoRA que descompone los pesos en magnitud y dirección) sobre un checkpoint base etiquetado como `AuroraSystem/Clary-2-Cyber-Flash-1.7B`, y que el dominio declarado del ajuste es ciberseguridad, CTF, código e ingeniería inversa. Se desconoce el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO u otras técnicas de alineación, así como cualquier innovación en atención o decodificación.

Lo que sí está documentado con precisión es el proceso de cuantización aplicado por mradermacher: cuantizaciones estáticas (`static quants`) generadas con la versión 2 del pipeline y con cuantización de tensores de salida activada, a partir de una conversión a formato HuggingFace. El autor indica explícitamente que no ha publicado cuantizaciones weighted/imatrix para este modelo y que, si no aparecen en aproximadamente una semana, probablemente no las tenga planificadas, aunque acepta peticiones a través de las discusiones de la comunidad. Las cuantizaciones IQ4_XS y Q4_K_S / Q4_K_M se marcan en la tabla del autor como las opciones recomendadas por equilibrio entre tamaño y calidad, mientras que Q4_K_S y Q4_K_M llevan la etiqueta "fast, recommended" y Q6_K "very good quality". No se documenta ningún ajuste posterior de los pesos tras la cuantización.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con formato de plantilla compatible con la familia Qwen3.
- Asistencia en ciberseguridad: análisis de vulnerabilidades, explicación de exploits, apoyo en retos CTF y tareas de reconocimiento, según el dominio declarado en los tags.
- Generación y explicación de código, con orientación a scripting, automatización y lectura de código ajeno.
- Ingeniería inversa asistida: interpretación de binarios, desensamblado y análisis de artefactos, siempre de forma textual (no se declara soporte de tooling nativo).
- Razonamiento multi-turno conversacional: la librería declarada es `transformers` y la pipeline es conversacional.
- Soporte de tool calling / function calling: no disponible (no declarado en la información proporcionada).
- Capacidades de agente y razonamiento multi-paso estructurado: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible, aunque la familia Qwen3 lo incorpora en algunos tamaños; no se confirma para este checkpoint.
- Capacidades multilingües adicionales al ruso y al inglés: no disponibles.

## Casos de uso

- Análisis de código con posible superficie de ataque: el modelo puede revisar fragmentos de código y señalar patrones inseguros (inyección, desbordamientos, gestión de credenciales) en inglés o ruso, y su tamaño de 1,7 B permite integrarlo en un pre-commit hook o en un job de CI/CD sin coste de GPU dedicada.
- Formación y práctica de CTF: generación de pistas, explicación de técnicas de explotación y ayuda en la resolución de retos de reversing o pwn, ejecutable en local para entornos de laboratorio aislados donde no se quiere enviar tráfico a APIs externas.
- Asistente de triaje en un SOC: clasificación y resumen de alertas y de fragmentos de logs en inglés o ruso, con despliegue on-premise gracias a que los quants Q4_K_S ocupan alrededor de 1,2 GB.
- Documentación técnica de hallazgos: redacción de informes de pentest y notas de vulnerabilidad a partir de apuntes en crudo, en un modelo ligero que puede correr en el portátil del analista.
- Automatización de scripting ofensivo/defensivo en laboratorio: generación de scripts de reconocimiento y utilidades de parseo para entornos de pruebas autorizadas, usando llama.cpp o Ollama como backend local.
- Traducción técnica ruso-inglés en contextos de seguridad: el soporte declarado de ambos idiomas resulta útil para leer documentación, writeups o código comentado originalmente en ruso.
- Despliegue en edge o air-gapped: al caber en 0,9-3,5 GB según cuantización, puede ejecutarse en dispositivos sin GPU (mini-PC, Raspberry Pi de gama alta, portátiles antiguos) donde modelos de 7 B o superiores no son viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K, CyberSecEval ni de ningún otro conjunto de evaluación, y los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo. Tampoco se documentan comparativas de perplejidad entre las distintas cuantizaciones publicadas; el autor solo enlaza un gráfico genérico de ikawrakow sobre perplejidad de tipos de cuantización y un análisis de Artefact2, ambos de carácter general y no específicos de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ≈ 0,9 GB; Q3_K_S ≈ 1,0 GB; Q3_K_M ≈ 1,0 GB; Q3_K_L ≈ 1,1 GB; IQ4_XS ≈ 1,1 GB; Q4_K_S ≈ 1,2 GB; Q4_K_M ≈ 1,2 GB; Q5_K_S ≈ 1,3 GB; Q5_K_M ≈ 1,4 GB; Q6_K ≈ 1,5 GB; Q8_0 ≈ 1,9 GB; f16 ≈ 3,5 GB. Hay que sumar el overhead de la caché KV, que depende del contexto configurado y no está documentado.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y también para GPUs de datacenter (A100, H100) si se busca maximizar throughput por batch.
- Cabe en GPU consumer: sí, en prácticamente todas las GPUs dedicadas actuales e incluso en iGPUs con memoria compartida suficiente. Con cuantizaciones Q4 o inferiores puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui (oobabooga) y otros frontends compatibles con GGUF. Para servir en producción con batching conviene usar llama.cpp server; vLLM solo soporta GGUF de forma experimental y no es la vía recomendada para este formato.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos que aparecen a continuación provienen de conocimiento público general y no de la información proporcionada en esta ficha, por lo que deben verificarse antes de tomar decisiones. Del modelo evaluado solo se conocen con certeza los parámetros, los idiomas, la licencia y el formato.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Clary-2-Cyber-Flash-1.7B-GGUF | 1.720.574.976 | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Especializado en ciberseguridad, CTF, código y reversing; ruso e inglés |
| AuroraSystem/Clary-2-Cyber-Flash-1.7B (modelo base) | 1.720.574.976 | no disponible | Apache 2.0 (segun el repo GGUF) | safetensors | Mismo modelo sin cuantizar; referencia para comparar pérdida de calidad por cuantización |
| Qwen3-1.7B (familia de origen segun tags) | ~1,7 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista sin el ajuste DoRA de ciberseguridad; el ajuste específico del dominio es la diferencia principal |
| Alternativas de ~1-2 B en el nicho de código | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada modelos comparables de ciberseguridad en este rango de tamaño |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el ajuste DoRA mejore al modelo base en tareas de ciberseguridad o código. Cualquier afirmación de rendimiento sería especulativa.
- Riesgo de alucinación elevado por tamaño: con 1,7 B de parámetros, el modelo tiende a inventar comandos, rutas de API, CVE o fragmentos de código plausibles pero incorrectos. Es obligatorio validar toda salida técnica antes de ejecutarla.
- Contenido dual-use: el modelo está afinado explícitamente para ciberseguridad ofensiva (CTF, reversing, exploits). Su uso debe limitarse a entornos autorizados, laboratorios y pruebas de penetración con permiso; no se documenta ningún mecanismo de moderación ni de rechazo de peticiones maliciosas.
- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos, y el dataset de ajuste es desconocido.
- Limitaciones de idioma: solo se declaran ruso e inglés. El rendimiento en castellano no está garantizado ni documentado, y podría degradarse notablemente.
- Limitación de contexto: se desconoce la ventana de contexto soportada, lo que impide planificar tareas que dependan de documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, modificación y redistribución. Sin embargo, la licencia se hereda del modelo base; conviene confirmar en el repositorio de AuroraSystem que la cadena de licencias es coherente.
- Pérdida de calidad por cuantización: las versiones Q2_K y Q3_K son las más agresivas y pueden degradar de forma apreciable la coherencia y la precisión en tareas de código. Para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones weighted/imatrix: el autor solo publica quants estáticos, lo que en la práctica suele implicar una pérdida de perplejidad algo mayor que la de los quants con imatrix de igual tamaño.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que significa ausencia de validación por parte de la comunidad y de retroalimentación sobre errores o comportamiento real.
- Contexto conversacional: al ser un modelo de instrucciones, sin la plantilla de chat correcta de la familia Qwen3 el rendimiento puede caer drásticamente. Se debe respetar el formato de prompt del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Clary-2-Cyber-Flash-1.7B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Clary-2-Cyber-Flash-1.7B
- Página de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#Clary-2-Cyber-Flash-1.7B-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF y ficheros multiparte (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede recursos al autor: https://www.nethype.de/
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas de ayuda de YouTube y contenidos de Zhihu sin relación con el modelo.
