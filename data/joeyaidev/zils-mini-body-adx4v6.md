# joeyAIDev/zils-mini-body-adx4v6

## Resumen

Zils d3-mini body es un modelo de lenguaje de 4.539 millones de parámetros (4,54 mil millones) publicado por el usuario joeyAIDev en Hugging Face. No se trata de un entrenamiento nuevo: el autor declara explícitamente que los pesos son idénticos a los de newsbang/adjudex-4b-v6 (revisión `55b02343a204026b3cfed0a30f9ed0f676f38155`), un fine-tune de Qwen/Qwen3.5-4B, y lo presenta como "cuerpo" (body) para la subred Zils, un modelo de decisión etiquetado como d3-mini.

El modelo se enmarca en la familia Qwen3.5, de ahí la etiqueta `qwen3_5` en los metadatos, y hereda por tanto la arquitectura transformer de dicha familia. Su propósito declarado es servir como componente de decisión dentro de la infraestructura Zils, no como un asistente generalista. La relevancia práctica es limitada: el repositorio tiene cero descargas y cero "likes", se creó el 27 de noviembre de 2026 y no incluye model card técnica, resultados de evaluación ni documentación de entrenamiento más allá de la atribución de los pesos originales.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero cualquier evaluación de capacidades debe remitirse al modelo base newsbang/adjudex-4b-v6 y, en última instancia, a Qwen3.5-4B, ya que este repositorio no aporta pesos nuevos ni ajustes propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; sin detalles adicionales en la informacion disponible) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | newsbang/adjudex-4b-v6 (revision 55b02343a204026b3cfed0a30f9ed0f676f38155) |
| Modelo raiz | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El autor no documenta arquitectura propia: el README afirma que los pesos son "unchanged weights" de newsbang/adjudex-4b-v6, de modo que la arquitectura corresponde a la de Qwen3.5-4B, un transformer de 4,54 mil millones de parámetros. No se especifica en la información disponible si emplea atención lineal, mezcla de expertos, decodificación especulativa ni ninguna otra innovación concreta de la familia Qwen3.5.

Tampoco se aportan datos sobre el entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o supervisión con preferencias. El único ajuste conocido es el que realizó newsbang para producir adjudex-4b-v6, del cual este repositorio es una copia sin modificar. El término "soup body" sugiere una agregación de pesos en el contexto de la subred Zils, pero no se detalla la receta ni los componentes mezclados.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base adjudex-4b-v6 y de Qwen3.5-4B; no se documentan capacidades específicas en este repositorio.
- Modelo de decisión: la etiqueta `decision-model` y la designación "d3-mini" indican un uso previsto como componente de decisión dentro de la subred Zils, sin que se describa el formato de entrada o salida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de modelos de decisión en la subred Zils: el modelo puede desplegarse como "body" de referencia para comparar el comportamiento de d3-mini frente a otras variantes de la subred, ya que sus pesos son reproducibles a partir del modelo base citado.
- Reproducción de resultados de adjudex-4b-v6: al ser una copia exacta de los pesos, permite verificar experimentos del modelo original sin depender de la disponibilidad de su repositorio.
- Punto de partida para fine-tuning propio: con licencia Apache 2.0 y pesos en safetensors, un equipo puede partir de estos 4,54 mil millones de parámetros para ajustar una tarea concreta, sabiendo que el punto de partida es idéntico al de adjudex-4b-v6.
- Integración en pipelines de clasificación o adjudicación: el nombre "adjudex" del modelo base sugiere tareas de adjudicación o resolución de casos; el modelo podría emplearse en la fase de decisión de un flujo automatizado, siempre que se valide su comportamiento en el dominio concreto.
- Despliegue en infraestructura propia para pruebas internas: el tamaño de 4,54 mil millones de parámetros permite servir el modelo en una GPU de gama alta de consumo con cuantización, lo que facilita pilotos sin coste de API.
- Archivado y trazabilidad de artefactos: útil como snapshot congelado de una revisión concreta del modelo base para auditorías de reproducibilidad en experimentos de la subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB, más caché KV. No se ofrecen ficheros cuantizados en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización a 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 Ti.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF); Ollama también sería viable tras la conversión. El repositorio solo incluye safetensors, sin configuración de serving documentada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils d3-mini body (este) | 4,54 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Copia sin modificar de adjudex-4b-v6 |
| newsbang/adjudex-4b-v6 | 4 B (nominal) | no disponible | Apache 2.0 | Hugging Face | Modelo base directo; fine-tune de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | 4 B (nominal) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo raíz de la familia |
| Qwen2.5-3B / 7B | 3 B / 7 B | 32 K (Qwen2.5) | Apache 2.0 (mayoría de variantes) | Hugging Face, amplia adopción | Alternativas de tamaño comparable con ecosistema maduro |

La comparación se limita a datos estructurales: no hay benchmarks publicados para este repositorio ni para adjudex-4b-v6 en la información disponible, por lo que no es posible contrastar rendimiento.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos a newsbang/adjudex-4b-v6; cualquier limitación del modelo base se hereda sin cambios.
- Ausencia total de documentación técnica: sin contexto declarado, sin idiomas, sin benchmarks y sin descripción de la receta de entrenamiento.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de género, idioma, cultura o dominio.
- Riesgo de alucinación: inherente a los modelos de 4 B de la familia Qwen; sin evaluación específica no se puede acotar su magnitud en tareas de decisión.
- Licencia Apache 2.0: permite uso comercial, pero el autor original de los pesos es newsbang; conviene revisar el aviso NOTICE y la licencia del repositorio base para cumplir con la atribución.
- Sin garantía de mantenimiento: repositorio con cero descargas, creado y actualizado el mismo día, sin issues ni discusión; no hay compromiso de soporte.
- Uso previsto restringido a la subred Zils: fuera de ese contexto, su idoneidad no está validada y requiere evaluación propia antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joeyAIDev/zils-mini-body-adx4v6
- Modelo base: https://huggingface.co/newsbang/adjudex-4b-v6
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-4B
