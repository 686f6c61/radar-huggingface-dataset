# huggingface12341/zsm-h29

## Resumen

zsm-h29 es un modelo publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un modelo derivado por fusión (merge) de tres checkpoints: malkolm777/zils-mini-m24-teacher-mlp, joamCriff123/zils-mini-m1124a y torchcast-ai/torchcast-decision-4b. La etiqueta de arquitectura declarada es qwen3_5 y el pipeline asignado es feature-extraction, aunque el repositorio incluye la etiqueta decision-model, lo que sugiere un uso orientado a extracción de representaciones y a la toma de decisiones.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones), almacenados en safetensors con un tamaño de repositorio de 9,1 GB, lo que es coherente con pesos en precisión de 16 bits. Requiere código personalizado (custom_code) para cargarse, y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia es limitada y muy específica: no hay métricas publicadas, ni idiomas declarados, ni documentación de entrenamiento. Se trata de un artefacto experimental de la comunidad, útil únicamente para quien quiera reproducir o auditar la fusión, no como base para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); transformer con código personalizado |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16 por el tamaño del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Etiquetas adicionales | decision-model, zils, d3-mini, merge, endpoints_compatible, region:us |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de la etiqueta qwen3_5 y de la presencia de código personalizado (custom_code), lo que implica que la clase de modelo no se carga con transformers estándar sin confiar en el código del repositorio. El modelo es el resultado de una fusión de tres checkpoints: un modelo "teacher-mlp" (malkolm777/zils-mini-m24-teacher-mlp), un modelo "mini" (joamCriff123/zils-mini-m1124a) y un modelo de decisión de 4B (torchcast-ai/torchcast-decision-4b). No se especifican la técnica de merge empleada (SLERP, TIES, DARE, linear, etc.), los hiperparámetros de la fusión ni la proporción de pesos de cada componente.

No hay información sobre datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste por RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Cualquier afirmación sobre estas cuestiones sería especulativa y no debe asumirse.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, por lo que el uso previsto es generar embeddings o representaciones internas a partir de texto.
- Modelo de decisión: la etiqueta decision-model sugiere un uso orientado a clasificación o selección de acciones, aunque no se detalla el formato de entrada/salida.
- Generación de texto: no confirmada; el pipeline declarado no es text-generation, por lo que no debe asumirse sin verificación empírica.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el pipeline declarado es feature-extraction, de modo que el uso más directo es generar vectores de documentos y consultas para un índice vectorial; requiere validar la calidad de los embeddings con un conjunto propio antes de adoptarlo.
- Clasificación o scoring de decisiones: la etiqueta decision-model apunta a tareas de selección entre opciones; se usaría como cabecera o modelo de scoring en pipelines internos, con evaluación previa sobre datos etiquetados del dominio.
- Reproducción y auditoría de fusiones de modelos: al ser un merge de tres checkpoints, sirve como caso de estudio para investigadores que analicen cómo se comportan las fusiones de modelos pequeños en tareas de representación.
- Prototipado rápido en entornos con restricciones de memoria: con 4,54 B de parámetros y pesos en 16 bits, ocupa unos 9 GB, por lo que cabe en una GPU de 24 GB y permite experimentar con extracción de features sin infraestructura grande.
- Base para ajuste fino ligero: al estar bajo Apache 2.0, puede servir como punto de partida para LoRA o adaptadores en tareas de clasificación, siempre que se verifique primero que la carga con custom_code funciona en el entorno objetivo.
- Evaluación comparativa de modelos comunitarios: útil en estudios internos que comparen checkpoints derivados de la familia zils o de modelos de decisión de 4B, midiendo degradación o ganancia respecto a los modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y del código personalizado; se recomienda reservar al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, más overhead; no se confirma que existan pesos cuantizados publicados.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, más overhead; requeriría cuantizar el modelo uno mismo, ya que no se declaran GGUF ni otras variantes.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB), A100 40 GB o H100; para cuantización de 8 o 4 bits, una RTX 3090/4090 o incluso GPUs de 16 GB.
- ¿Cabe en GPU de consumo? Sí, en fp16 cabe en tarjetas de 16-24 GB; en cuantización baja cabría en 8-12 GB, sujeto a que la carga con custom_code funcione.
- Opciones de despliegue: transformers con trust_remote_code habilitado (imprescindible por custom_code); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura concreta y deberían probarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsm-h29 | 4,54 B | no disponible | Apache 2.0 | restringido (gated) | Merge de tres checkpoints, custom_code, sin benchmarks |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | no disponible | no disponible | Uno de los modelos base del merge |
| joamCriff123/zils-mini-m1124a | no disponible | no disponible | no disponible | no disponible | Uno de los modelos base del merge |
| malkolm777/zils-mini-m24-teacher-mlp | no disponible | no disponible | no disponible | no disponible | Uno de los modelos base del merge |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con detalles de entrenamiento, datos, evaluación ni limitaciones declaradas por el autor.
- Sin benchmarks publicados: no hay evidencia de calidad en ninguna tarea; cualquier uso en producción exige una evaluación propia.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni siquiera un rendimiento aceptable en castellano.
- Riesgo de alucinación: desconocido, pero al no ser un modelo ajustado para instrucciones declarado, no debe usarse para generación fiable sin validación.
- Código personalizado: la carga requiere trust_remote_code, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos cuyas licencias no se detallan en la información disponible, conviene verificar las licencias de los tres checkpoints base antes de explotarlo comercialmente.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte.
- Fecha de creación futura (2026-11-25): metadato anómalo que sugiere un repositorio de prueba o generado automáticamente; tratar con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-h29
- Modelo base 1: https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp
- Modelo base 2: https://huggingface.co/joamCriff123/zils-mini-m1124a
- Modelo base 3: https://huggingface.co/torchcast-ai/torchcast-decision-4b
