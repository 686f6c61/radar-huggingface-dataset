# mconcat/statescope-qwen3.5-4b

## Resumen

Statescope Qwen3.5-4B es un conjunto de diccionarios de activaciones publicado por el usuario mconcat sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo generativo nuevo ni de un fine-tune convencional: el repositorio contiene, para cada una de las 32 capas del modelo base, un state dictionary (`state/L<L>/`) y un MLP dictionary (`mlp/L<L>/`), en el mismo formato que el conjunto hermano publicado para Qwen3.5-0.8B. El objetivo es permitir la interpretabilidad y el análisis de las representaciones internas del modelo mediante técnicas de descomposición dispersa (dictionary learning), no servir como modelo de chat o de generación de código.

El paquete se publica en noviembre de 2026 y, en el momento de redactar esta ficha, la subida de ficheros está en curso: la lista de archivos está incompleta y la model card definitiva aún no ha reemplazado el aviso de subida. Por tanto, la información disponible es parcial y muchos datos técnicos del conjunto no están confirmados.

La relevancia del proyecto reside en su enfoque: expone artefactos reutilizables (diccionarios por capa) para auditar qué características aprende un transformer de 4B parámetros, con un lector común para las versiones de 0.8B y 4B. El autor advierte explícitamente de limitaciones metodológicas (una sola semilla de entrenamiento, peor reconstrucción que en el conjunto de 0.8B, pérdida medida en una sola capa, transformaciones MLP que nunca se activan y otras que se activan casi siempre).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diccionarios de activaciones (state y MLP) por capa sobre el transformer Qwen3.5-4B; 32 capas |
| Parametros totales | No disponible para el conjunto de diccionarios; el modelo base es Qwen3.5-4B |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT para los pesos de los diccionarios; el modelo base es Apache 2.0 y no se redistribuye |
| Formato de pesos | Diccionarios en directorios `state/L<L>/` y `mlp/L<L>/`; `MANIFEST.json` con sha256 de cada fichero; formato concreto de serializacion no disponible |

## Arquitectura y entrenamiento

El conjunto no define una arquitectura de red propia: son artefactos de interpretabilidad extraidos del modelo Qwen/Qwen3.5-4B, un transformer de 4B parámetros con 32 capas. Para cada capa se publican dos diccionarios: uno sobre los estados (activaciones residuales, presumiblemente) y otro sobre las salidas de la MLP. El formato sigue el del conjunto de 0.8B, y el mismo lector del repositorio `mconcat/statescope` puede cargar ambos.

Los detalles de entrenamiento de los diccionarios (número de tokens, composición del dataset, hiperparámetros de sparse autoencoding o dictionary learning, función de pérdida) no están disponibles en la información proporcionada. La model card solo indica que se usó una única semilla de entrenamiento, que la reconstrucción es peor que en el conjunto de 0.8B, que la pérdida con diccionarios insertados (spliced-in loss) se midió en una sola capa y que existe un fichero `ALWAYS_ON.json` que identifica las transformaciones MLP que se activan en casi todos los tokens.

## Capacidades

- Extraccion de caracteristicas interpretables por capa: diccionarios `state` y `mlp` para las 32 capas del modelo base.
- Analisis de activaciones MLP: identificacion de transformaciones que nunca se activan y de las que se activan casi siempre (`ALWAYS_ON.json`).
- Verificacion de integridad de artefactos mediante `MANIFEST.json` con sha256 por fichero.
- Carga unificada con el conjunto de 0.8B mediante el lector del repositorio `mconcat/statescope`.
- No es un modelo de generacion de texto, razonamiento, codigo, vision ni tool calling: no se documentan capacidades de inferencia generativa para este repositorio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Auditoria de representaciones internas: cargar los diccionarios de una capa concreta y proyectar activaciones del modelo base para identificar direcciones latentes asociadas a conceptos o patrones.
- Analisis de la MLP por capa: usar `ALWAYS_ON.json` para separar transformaciones ubicuas de las esporadicas y estudiar su papel en el circuito del modelo.
- Comparacion entre escalas: emplear el mismo lector sobre los conjuntos de 0.8B y 4B para contrastar como cambian los diccionarios con el tamano del modelo.
- Investigacion en mechanistic interpretability: servir como material de partida para experimentos de ablation o de edicion de activaciones sobre Qwen3.5-4B.
- Verificacion de reproducibilidad: validar la integridad de los ficheros descargados con los hashes de `MANIFEST.json` antes de usarlos en pipelines de investigacion.
- Docencia y formacion: ilustrar tecnicas de dictionary learning sobre un transformer real de 4B con artefactos publicos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona cualitativamente que la reconstruccion es peor que en el conjunto de 0.8B y que la spliced-in loss se midio en una unica capa; no se aportan cifras.

## Requisitos de hardware

- VRAM para inferencia generativa: no aplica directamente; este repositorio no es un modelo generativo. Para usar los diccionarios hay que cargar ademas el modelo base Qwen3.5-4B.
- Modelo base de 4B: en FP16 requiere aproximadamente 8 GB de VRAM solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits o 4 bits baja de forma aproximada a 4-5 GB y 2-3 GB respectivamente (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponible para los diccionarios; para el modelo base, GPUs con al menos 16 GB (RTX 4090, A100 40 GB, H100) ofrecen margen para contexto largo.
- Cabe en GPU de consumo: el modelo base de 4B en cuantizacion baja es viable en GPUs de 8-12 GB; los diccionarios anaden memoria adicional cuyo tamano no esta disponible.
- Opciones de despliegue: el repositorio no documenta vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante el lector de `mconcat/statescope` sobre PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Conjunto | Modelo base | Capas cubiertas | Lector | Licencia | Notas |
|---|---|---|---|---|---|
| mconcat/statescope-qwen3.5-4b | Qwen3.5-4B | 32 | mconcat/statescope | MIT (diccionarios) | Reconstruccion peor que en 0.8B; subida en curso |
| mconcat/statescope-qwen3.5-0.8b | Qwen3.5-0.8B | No disponible | mconcat/statescope | No disponible | Referencia de formato y mejor reconstruccion segun el autor |
| Alternativas de interpretabilidad | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion otros conjuntos comparables |

## Limitaciones y advertencias

- Subida incompleta: en el momento de la ficha, la lista de ficheros esta incompleta y la model card definitiva no esta publicada.
- Una sola semilla de entrenamiento: no hay evidencia de estabilidad de los diccionarios entre ejecuciones.
- Reconstruccion degradada: el propio autor indica que es peor que en el conjunto de 0.8B, lo que limita la fidelidad del analisis.
- Spliced-in loss medida en una unica capa: no hay garantia de que los diccionarios sean representativos en el resto de capas.
- Transformaciones MLP con activacion extrema: muchas nunca se activan y algunas se activan en casi todos los tokens, lo que puede sesgar conclusiones sobre selectividad.
- Ausencia de script de demostracion para este conjunto: el usuario debe construir su propio pipeline de carga y evaluacion.
- Licencia: los diccionarios son MIT, pero el modelo base Qwen3.5-4B es Apache 2.0 y no se redistribuye; el uso combinado debe respetar ambas licencias.
- No apto para produccion generativa: no es un modelo de chat, codigo ni agentes; no se documentan sesgos, alucinacion ni comportamiento conversacional porque no aplica.
- Idiomas y contexto del modelo base: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mconcat/statescope-qwen3.5-4b
- Conjunto hermano de 0.8B: https://huggingface.co/mconcat/statescope-qwen3.5-0.8b
- Codigo del lector: https://github.com/mconcat/statescope
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
