# pTpTk/llama1-65b-1layer

## Resumen

llama1-65b-1layer es un artefacto de investigación publicado por el usuario pTpTk en HuggingFace. No es un modelo entrenado ni un checkpoint utilizable: es una extracción de una única capa decodificadora representativa (la capa 0) del modelo huggyllama/llama-65b, con las dimensiones de texto, la configuración de contexto/RoPE y los ajustes de precisión del original conservados. El repositorio no contiene pesos (0,0 GB) y está pensado para cargarse en SGLang nativo con `--load-format dummy`, es decir, como esqueleto de ejecución para pruebas.

El propósito declarado es servir como benchmark de solo texto y como material de estudio sobre tipos de capa frontier. La capa incluida usa atención multi-cabeza (MHA) y FFN densa, sin módulos PLE, y no se retiene ningún módulo MTP (Multi-Token Prediction), por lo que la decodificación estándar `one_batch` no ejecuta MTP. El contexto publicado es de 2.048 tokens contando prompt y tokens generados, y la reducción de profundidad no amplía ese límite.

Su relevancia es acotada y muy específica: sirve para validar infraestructura de despliegue, reproducir la contabilidad de memoria de un stack SGLang y como referencia en experimentos de poda de capas o análisis de arquitecturas. No debe confundirse con un modelo capaz de generar texto: sin pesos no hay inferencia real de lenguaje. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de LLaMA 1; una única capa decodificadora (capa 0) con atención multi-cabeza (MHA) y FFN densa, sin PLE |
| Parámetros totales | 65.000 millones nominales del modelo origen (llama-65b); el repositorio no contiene pesos |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (`max_sequence_length=2048`), prompt más tokens generados |
| Tipos de cuantización | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no incluidos; carga en modo dummy con SGLang (`--load-format dummy`) |
| Capas incluidas | 1 (capa 0, índice cero del modelo origen) |
| Módulos MTP retenidos | 0; la decodificación `one_batch` ordinaria no ejecuta MTP |
| Modalidad | solo texto (text-only benchmark) |
| Tamaño del repositorio | 0,0 GB |
| Autor | pTpTk |
| Fecha de creación | 2026-10-13 |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este repositorio. Se trata de un artefacto derivado por extracción: se toma el modelo origen huggyllama/llama-65b y se conserva una sola capa decodificadora representativa, manteniendo las dimensiones de texto, el contexto/RoPE y los ajustes de precisión del original. La capa retenida (índice 0) emplea atención multi-cabeza y una FFN densa, y no incorpora PLE. La tabla de la model card indica explícitamente que no se retiene ningún módulo MTP.

La innovación técnica aquí no está en el modelo, sino en el formato de distribución: al no incluir pesos, la ejecución se realiza con SGLang nativo en modo dummy, lo que permite arrancar el runtime y ejercitar el pipeline de servicio sin materializar tensores. El autor referencia `docs/frontier-layer-types.md` para los requisitos de SGLang nativo y el razonamiento sobre tipos de capa, y un manifiesto que registra la procedencia pero que no es una entrada de runtime. La ejecución se lanza con `bash llama1-65b-1layer.run` desde la raíz del checkout en una máquina con CUDA.

Las especificaciones completas del modelo origen (número de capas, dimensión oculta, número de cabezas, volumen de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO) no se detallan en la información proporcionada y no se reproducen aquí.

## Capacidades

- Generación de texto: no disponible. El repositorio no contiene pesos, por lo que no puede producir texto real.
- Razonamiento, código y matemáticas: no disponible por la misma razón.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no dispone de modo thinking, visión ni audio. Es un artefacto de solo texto con una única capa.
- Función real del artefacto: arrancar el stack de SGLang con carga dummy y servir como objeto de prueba para contabilidad de memoria, validación de herramientas y estudios de profundidad de capa.
- Decodificación especulativa vía MTP: no, no se retiene ningún módulo MTP.

## Casos de uso

- Pruebas de humo en CI/CD de stacks SGLang: el artefacto permite arrancar el servidor con `--load-format dummy` y verificar que la versión de SGLang, los drivers CUDA y la configuración de despliegue funcionan, sin necesidad de descargar un checkpoint de 65B.
- Calibración de contabilidad de memoria: al no haber pesos, se puede aislar el consumo de memoria del runtime y de las activaciones frente al de los tensores, útil para ajustar presupuestos de VRAM en despliegues reales.
- Validación de scripts de servicio: el fichero `llama1-65b-1layer.run` y el manifiesto de procedencia permiten comprobar que un pipeline automatizado de lanzamiento resuelve rutas, versiones y parámetros correctamente.
- Investigación sobre poda de capas: sirve como referencia mínima (una sola capa) para estudiar hasta qué punto la configuración de una capa frontier condiciona el comportamiento del runtime, sin la interferencia del resto de la pila.
- Docencia y análisis de arquitecturas: permite inspeccionar la configuración resultante de extraer la capa 0 de un decoder de 65B (MHA, FFN densa, ausencia de PLE y MTP) con fines explicativos.
- Reproducibilidad de artefactos de investigación: el manifiesto registra la procedencia del modelo origen, lo que facilita auditar de dónde sale cada componente en trabajos que dependen de extracciones parciales.
- Benchmarking de latencia de infraestructura: se puede medir el coste de arranque y de los bucles de planificación del motor de inferencia sin tiempo de carga de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se trata de un benchmark de solo texto, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- Pesos: 0 GB. El repositorio no incluye pesos, por lo que la memoria asociada a parámetros es nula en modo dummy.
- Requisito de plataforma: máquina con CUDA para ejecutar `bash llama1-65b-1layer.run` desde la raíz del checkout.
- Motor de inferencia: SGLang nativo con `--load-format dummy`; el autor remite a `docs/frontier-layer-types.md` para los requisitos concretos.
- GPU recomendadas: no disponible en la información proporcionada. Al no materializar pesos, el requisito lo marca el propio motor y el tamaño de lote, no el modelo.
- Encaje en GPU de consumo: no disponible. Depende enteramente del runtime y de la configuración de lote.
- Opciones de despliegue alternativas: no disponibles. Al no haber pesos en formato safetensors ni GGUF, no es desplegable con llama.cpp, Ollama, vLLM ni TGI.
- Estimación aritmética de referencia: un hipotético modelo completo de 65.000 millones de parámetros en FP16 requeriría aproximadamente 130 GB solo para pesos, y unos 65 GB en cuantización de 8 bits y 32,5 GB en 4 bits. Es una estimación derivada del tamaño nominal del modelo origen, no una cifra publicada para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen artefactos comparables de una sola capa publicados con la misma finalidad en la información disponible. La comparación más útil es contra el modelo del que se extrae.

| Modelo | Parámetros | Capas | Contexto | Pesos incluidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pTpTk/llama1-65b-1layer | 65.000 millones nominales | 1 | 2.048 tokens | No | no disponible | HuggingFace, 0 descargas |
| huggyllama/llama-65b (origen) | 65.000 millones | no disponible en la información proporcionada | 2.048 tokens | Sí | no disponible en la información proporcionada | HuggingFace, revisión 49707c53 |
| Otros artefactos de capa única | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de pesos: el repositorio ocupa 0,0 GB y no permite inferencia de lenguaje real. Cualquier expectativa de generación de texto es incorrecta.
- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide determinar condiciones de uso comercial o de redistribución. El modelo origen, LLaMA 1, tiene sus propias condiciones, que habría que verificar por separado.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Sesgos: no evaluables, ya que no hay pesos ni salidas que auditar.
- Alucinación: no aplica en el sentido habitual, porque el artefacto no genera contenido; el riesgo es de interpretación, es decir, tratarlo como un modelo funcional cuando no lo es.
- Contexto fijo de 2.048 tokens: la reducción de profundidad no amplía este límite, y cuenta prompt más generación.
- Solo una capa: la profundidad eliminada impide cualquier comportamiento emergente asociado a la pila completa.
- Sin MTP: la decodificación `one_batch` ordinaria no ejecuta módulos de predicción multi-token, por lo que no cabe esperar aceleraciones de ese tipo.
- Dependencia estricta de SGLang nativo y CUDA: no es portable a otros runtimes sin pesos reales.
- El manifiesto de procedencia no es una entrada de runtime; no debe usarse como configuración de ejecución.
- Advertencia para producción: no apto para ningún despliegue orientado a usuario final. Su uso es exclusivamente de laboratorio e infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pTpTk/llama1-65b-1layer
- Modelo origen huggyllama/llama-65b (revisión referenciada): https://huggingface.co/huggyllama/llama-65b/tree/49707c5313d34d1c5a846e29cf2a2a650c22c8ee
- Documentación de requisitos de SGLang nativo y razonamiento de capas: `docs/frontier-layer-types.md` dentro del repositorio (no se proporciona URL directa)
- Script de ejecución: `llama1-65b-1layer.run` en la raíz del checkout (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponible
