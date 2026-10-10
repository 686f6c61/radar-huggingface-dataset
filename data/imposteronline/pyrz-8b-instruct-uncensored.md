# ImposterOnline/Pyrz-8B-Instruct-Uncensored

## Resumen

Pyrz-8B-Instruct-Uncensored es un modelo de lenguaje de tipo instruct orientado a programacion, publicado por el usuario ImposterOnline bajo licencia MIT. Se distribuye con pesos en safetensors y versiones cuantizadas en GGUF, y esta construido sobre la arquitectura Qwen2 (segun las etiquetas del repositorio) con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones). Su propuesta principal es funcionar como asistente de codigo sin rechazos ni restricciones de contenido (uncensored), ademas de estar ajustado para flujos agenticos y function calling.

El modelo declara un resultado de 52,4% en pass@1 (greedy) sobre HumanEval, dato aportado por el propio autor y marcado como no verificado. El repositorio incluye unicamente pesos en precision completa junto con variantes GGUF para ejecucion local mediante llama.cpp y Ollama, con cuantizaciones Q4_K_M, Q5_K_M y Q8_0.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno (7,6B) de tematica muy especifica, con muy pocas descargas (63) y cero likes en el momento de la consulta, lo que indica una adopcion practicamente nula. Conviene tratarlo como un experimento independiente mas que como una alternativa consolidada, especialmente por la discrepancia entre el identificador del repositorio (Pyrz-8B) y el nombre que aparece en la model card (Pyrex-8B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2 (segun etiqueta del repositorio) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso en la model card emplea `-c 8192`) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0; pesos originales sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a Qwen2. Se trata por tanto de un transformer decoder-only con atencion causal, sin indicios de mezcla de expertos (MoE) ni de arquitecturas hibridas. Con 7.615.616.512 parametros totales encaja en la categoria de modelos densos de tamano 7-8B.

En cuanto al entrenamiento, el autor afirma que el modelo fue ajustado sobre un "corpus masivo de literatura de programacion, algoritmos y codigo a nivel de sistema", asi como sobre datos sinteticos de alta calidad para function calling e integracion de herramientas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares; esa informacion figura como no disponible. Tampoco se detalla ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de codigo orientada a tareas de ingenieria de software complejas, segun declara el autor.
- Modo "uncensored": el modelo esta disenado para no rechazar peticiones de codigo ni anadir restricciones o texto generico de advertencia.
- Function calling y uso de herramientas, gracias al ajuste sobre datos sinteticos especificos.
- Flujos agenticos y razonamiento en varios pasos (agentic workflow), orientados a tareas de desarrollo.
- Generacion de texto y modo conversacional (etiqueta `conversational` del repositorio).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (no se mencionan).

## Casos de uso

- Asistente de programacion sin filtros: el modelo puede responder a peticiones de codigo que otros asistentes rechazan por politicas de contenido, util en entornos de investigacion sobre seguridad y analisis de codigo malicioso controlado.
- Automatizacion de tareas de ingenieria: generacion y refactorizacion de codigo a nivel de sistema, dada su orientacion a "system-level codebases" declarada por el autor.
- Integracion en pipelines agenticos: al estar ajustado para function calling, encaja en bucles de agente que invocan herramientas externas y encadenan varios pasos para resolver una tarea de desarrollo.
- Autocompletado y asistencia en IDE: al ofrecerse en GGUF con cuantizaciones Q4_K_M y Q5_K_M, puede desplegarse localmente para sugerencias de codigo con baja latencia en equipos de desarrollo.
- Generacion de tests y documentacion tecnica: como asistente de codigo general puede producir pruebas unitarias y comentarios de API a partir de firmas de funciones.
- Prototipado rapido en local: gracias a su tamano de 7,6B y a las variantes GGUF, es viable ejecutarlo en estaciones de trabajo sin GPU de centro de datos para experimentos puntuales.
- Evaluacion comparativa de modelos "uncensored": sirve como referencia en estudios que miden la diferencia entre modelos alineados y no alineados en tareas de codigo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (marcados como no verificados). Proceden de la entrada "Pyrex-8B-Instruct-Uncensored", que no coincide con el identificador del repositorio.

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| HumanEval | pass@1 (greedy) | 52,4% | no |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados en funcion del tamano de 7,6B):
  - FP16 / safetensors originales: en torno a 15-16 GB (el repositorio ocupa 15,2 GB).
  - GGUF Q8_0: aproximadamente 8-9 GB.
  - GGUF Q5_K_M: aproximadamente 5,5-6,5 GB.
  - GGUF Q4_K_M: aproximadamente 4,5-5,5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100). Para cuantizaciones Q4/Q5, una GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070) resulta suficiente.
- Cabe en GPU de consumo: si, en GPUs con 8 GB o mas usando cuantizacion Q4_K_M; tambien es viable en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp y Ollama (soportados explicitamente por las variantes GGUF). Para safetensors, es habitual usar vLLM, TGI o transformers, aunque el autor no documenta estos flujos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible no incluye datos comparativos del autor. La comparacion siguiente recoge unicamente caracteristicas generales conocidas de alternativas de tamano similar orientadas a codigo; los valores que no se pueden confirmar aparecen como "no disponible".

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Pyrz-8B-Instruct-Uncensored | 7,6B | no disponible | MIT | Codigo uncensored y agentico |
| Qwen2.5-Coder-7B | 7,6B | 128K (segun su documentacion) | Apache 2.0 | Codigo general |
| CodeLlama-7B | 6,7B | 16K (segun su documentacion) | Llama 2 Community | Codigo general |
| DeepSeek-Coder-6.7B | 6,7B | 16K (segun su documentacion) | DeepSeek License | Codigo general |

Comparativa de rendimiento: no disponible, salvo el 52,4% en HumanEval declarado por el autor para Pyrz-8B, que no es directamente contrastable con los resultados publicados por los modelos alternativos citados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el autor no documenta analisis de sesgos.
- Riesgo de alucinacion: elevado en cualquier modelo de 7,6B, especialmente en tareas de codigo donde puede generar APIs o funciones inexistentes. No hay evaluaciones publicadas al respecto.
- La condicion "uncensored" implica que el modelo puede producir contenido sin filtros, lo que aumenta el riesgo de generar codigo malicioso, instrucciones peligrosas o material inapropiado. Requiere supervision humana y controles externos si se usa en produccion.
- Contexto: la model card no declara la longitud de contexto; el ejemplo de uso fija `-c 8192`, por lo que no hay garantia de ventanas mayores.
- Idiomas: no se especifica soporte multilingue; es probable un rendimiento predominantemente en ingles, pero no esta confirmado.
- Licencia: MIT permite uso comercial y modificacion, pero conviene recordar que la licencia se aplica sobre el modelo publicado; el autor no documenta la procedencia del dataset de entrenamiento, lo que puede implicar riesgo legal no evaluado.
- Discrepancias de nomenclatura: el repositorio se llama "Pyrz-8B" mientras que la model card y la model-index usan "Pyrex-8B"; tambien se etiqueta como "8B" cuando tiene 7,6B parametros. Esto sugiere falta de revision y reduce la fiabilidad del material publicado.
- Benchmark no verificado: el resultado de HumanEval aparece con `verified: false`.
- Adopcion practicamente nula (63 descargas, 0 likes), sin comunidad ni soporte documentado, lo que desaconseja su uso en entornos criticos sin validacion previa.

## Enlaces

- HuggingFace (repositorio principal): https://huggingface.co/ImposterOnline/Pyrz-8B-Instruct-Uncensored
- GGUF (referenciado en la model card): https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored-GGUF
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
