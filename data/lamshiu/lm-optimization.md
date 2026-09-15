# lamshiu/lm-optimization

## Resumen

`lamshiu/lm-optimization` no es un modelo único, sino una colección de checkpoints de investigación publicados por el usuario lamshiu en HuggingFace. Todos los runs corresponden a un GPT entrenado desde cero con unos 5 millones de parámetros (6 capas, dimensión de modelo 256, sin codificación posicional y con la atención truncada en las fronteras de documento). El objeto de estudio del proyecto es qué texto debería "pensar" y con qué datos debería aprender un modelo pequeño, combinando prosa de TinyStories con documentos de razonamiento generados sintéticamente.

El repositorio incluye, por cada run, el state dict (`ckpt.pt`), la configuración completa de hiperparámetros y versión del dataset (`config.json`), el registro de pérdida y exactitud por tarea durante el entrenamiento (`log.jsonl`) y las exactitudes finales (`summary.json`). El código de carga (`src/model.py`) y las conclusiones del estudio (hallazgos F1-F21 en `docs/findings.md`) viven en el repositorio de GitHub enlazado, no en la model card de HuggingFace.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción: licencia MIT, 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin idiomas declarados y sin resultados de benchmarks publicados en la información disponible. Su interés está en la metodología (ablaciones sobre datos de razonamiento en modelos de escala minúscula), no en su rendimiento absoluto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, denso, sin codificación posicional |
| Parámetros totales | ~5 millones (6 capas, d=256) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la atención se corta en fronteras de documento; sin codificación posicional) |
| Tipos de cuantización | No disponible (se publican state dicts `ckpt.pt` sin versiones cuantizadas) |
| Idiomas soportados | No disponible en los metadatos; el corpus descrito es TinyStories (prosa en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`ckpt.pt`), cargable con `src/model.py` del repositorio; no hay safetensors ni GGUF |
| Artefactos por run | `ckpt.pt`, `config.json`, `log.jsonl`, `summary.json` |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | No disponible |
| Fecha de publicación | 2026-09-15 (última actualización: 2026-09-15) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de escala diminuta: 6 capas, dimensión de modelo 256 y aproximadamente 5 millones de parámetros. Dos decisiones destacan sobre la configuración estándar de GPT. La primera es la ausencia total de codificación posicional (ni sinusoidal, ni aprendida, ni RoPE), lo que convierte al modelo en un sistema aproximadamente equivariante a permutaciones salvo por la información de orden que induce la máscara causal. La segunda es que la atención se trunca en las fronteras de documento, de modo que cada documento se procesa como una secuencia independiente y no hay contaminación cruzada entre muestras del corpus.

En cuanto a los datos, cada run se entrena con una mezcla de prosa de TinyStories y documentos de razonamiento generados. El eje experimental del proyecto es precisamente esa mezcla: qué proporción y qué tipo de texto de razonamiento conviene inyectar en un modelo de esta escala (el repositorio documenta 21 hallazgos, F1-F21). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, la tokenizador empleado ni si hubo fases de ajuste por preferencias (RLHF, DPO u otras). El `config.json` de cada run contiene la versión del dataset, y `log.jsonl` registra la evolución de la pérdida y de las exactitudes por tarea a lo largo del entrenamiento.

## Capacidades

- Generación de texto narrativo simple: el modelo está entrenado sobre prosa de TinyStories, orientada a cuentos cortos con vocabulario y estructuras gramaticales sencillas.
- Modelado de documentos de razonamiento cortos: parte del entrenamiento usa documentos de razonamiento generados, por lo que el checkpoint puede reproducir ese formato dentro de los límites de 5 millones de parámetros.
- Ejecución de tareas de evaluación internas: `log.jsonl` y `summary.json` registran exactitudes por tarea, lo que implica que el pipeline define tareas concretas y medibles, aunque su naturaleza no se detalla en la información disponible.
- Razonamiento multi-paso: no disponible como capacidad fiable; es precisamente la hipótesis que el proyecto estudia, no una capacidad consolidada.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles; el corpus descrito es en inglés.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Reproducción de experimentos de investigación: cargar `ckpt.pt` con `src/model.py`, reejecutar la evaluación y contrastar los resultados con `summary.json` para validar los hallazgos F1-F21 del repositorio. Es el uso principal previsto del artefacto.
- Ablaciones sobre datos de razonamiento sintético: dado que cada carpeta corresponde a un run con su `config.json`, permite comparar variantes de mezcla de datos manteniendo fija la arquitectura y aislar el efecto del corpus de razonamiento.
- Línea base de escala mínima: sirve como referencia inferior en estudios de scaling, comparando curvas de pérdida frente a modelos de 14M, 70M o 124M parámetros entrenados con recetas similares.
- Docencia y divulgación: el ciclo completo (tokenización, entrenamiento, logging de tareas, checkpoints) es lo bastante pequeño para ejecutarse en un portátil, lo que lo hace útil para explicar un pipeline de entrenamiento de LM de principio a fin en un aula o taller.
- Estudio de modelos sin codificación posicional: permite medir experimentalmente cuánta información de orden es capaz de recuperar un decoder-only a partir únicamente de la máscara causal, en una escala donde el entrenamiento completo es asequible.
- Pruebas de infraestructura de inferencia: con ~5M parámetros, el modelo es un banco de pruebas barato para validar servidores, wrappers, cuantización casera o técnicas de decodificación antes de escalar a modelos mayores.
- Generación de cuentos infantiles como demo: el modelo puede producir narrativas cortas del estilo TinyStories, aunque con calidad no verificada y sin garantías de coherencia más allá de unas pocas frases.
- Generación de datos sintéticos a pequeña escala: los documentos de razonamiento generados que alimentan el propio proyecto ilustran un caso de uso de autoentrenamiento en dominios cerrados y controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar. El repositorio sí contiene métricas internas por tarea en `log.jsonl` (evolución durante el entrenamiento) y `summary.json` (exactitudes finales), pero sus valores y la definición exacta de las tareas no se detallan en la información proporcionada, por lo que no se reproducen aquí.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Métricas internas por tarea | Presentes en `log.jsonl` y `summary.json`; valores no disponibles en esta información |

## Requisitos de hardware

- VRAM para inferencia (estimación orientativa, no medida): en fp32 unos 20 MB solo para los pesos (~5M parámetros × 4 bytes); en fp16 unos 10 MB; en int8 unos 5 MB. A esto hay que sumar activaciones y la sobrecarga del runtime (el contexto de CUDA de PyTorch suele ocupar varios cientos de MB).
- GPU recomendadas: cualquier GPU con soporte CUDA sirve, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de cómputo de las GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquiera, con margen sobrado. También cabe en CPU, en una Raspberry Pi o incluso en un microcontrolador con memoria suficiente.
- Opciones de despliegue: la vía directa es PyTorch con `src/model.py` del repositorio de GitHub. No se publican pesos en formato GGUF ni safetensors, por lo que llama.cpp, Ollama y otros runners estándar requerirían una conversión previa. Tampoco hay `config.json` en formato HuggingFace Transformers ni `AutoModel` compatible, de modo que vLLM o TGI no pueden cargarlo sin adaptar la arquitectura y registrar una clase de modelo propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Dado el tamaño, en una GPU moderna el throughput sería de miles de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

No existe una categoría comercial equivalente para un checkpoint de investigación de 5M parámetros. La comparación más razonable es con otros modelos pequeños usados como banco de pruebas. Los datos de los modelos alternativos proceden de conocimiento público general y no se han verificado en esta búsqueda, por lo que deben tomarse con cautela; los campos desconocidos se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Benchmarks |
|---|---|---|---|---|---|
| lamshiu/lm-optimization | ~5M | No disponible | MIT | PyTorch state dict | No disponibles |
| Familia TinyStories (Eldan y Li) | ~1M a ~33M | No disponible | No disponible | No disponible | No disponibles |
| Pythia-14M (EleutherAI) | 14M | 2048 | Apache-2.0 | safetensors | Publicados por el autor |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF en terceros | Publicados en el paper original |

## Limitaciones y advertencias

- Escala muy reducida: con ~5M parámetros, la capacidad de razonamiento, el conocimiento factual y la coherencia a medio plazo son estructuralmente limitados; no debe usarse como asistente general.
- Sin benchmarks publicados: no hay evidencia externa de rendimiento más allá de las métricas internas del propio autor, que no son comparables con suites estándar.
- Validación nula en el momento de la consulta: 0 descargas y 0 likes implican que el modelo no ha sido reproducido ni auditado por terceros.
- Riesgo de alucinación: alto. Un modelo de este tamaño entrenado principalmente con prosa infantil no puede sostener afirmaciones factuales; cualquier salida debe tratarse como texto generado sin garantía de veracidad.
- Sin codificación posicional: el modelo tiene una representación débil del orden de los tokens, lo que puede degradar tareas que dependan de la posición (copia, aritmética posicional, referencias largas).
- Contexto no especificado: al no declararse la longitud de contexto y truncarse la atención en fronteras de documento, el comportamiento fuera de la longitud de entrenamiento es impredecible.
- Idiomas: no se declara soporte multilingüe y el corpus descrito es en inglés; el rendimiento en castellano es, como mínimo, dudoso.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, la licencia permisiva no implica idoneidad técnica para producción.
- Integración: al no usar el formato estándar de Transformers, no es cargable con `AutoModel` ni con runners habituales sin escribir código específico, lo que añade coste de ingeniería y riesgo de incompatibilidades entre versiones de PyTorch.
- Uso responsable: no debe desplegarse en aplicaciones dirigidas a menores o en atención al cliente sin supervisión humana, dado el riesgo de salidas incoherentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lamshiu/lm-optimization
- Repositorio de código y documentación: https://github.com/LamShiuChing/LM-optimization
- Hallazgos del estudio (F1-F21): `docs/findings.md` dentro del repositorio de GitHub
- Código de carga del modelo: `src/model.py` dentro del repositorio de GitHub
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relación con este repositorio.
