# mattwang123/chrononauts-3b-2024-07-agent

## Resumen

Chrononauts 3B (cutoff 2024-07, etapa *agent*) es un agente de busqueda de 2.796 millones de parametros desarrollado por mattwang123 en el marco de Chrononauts, una suite de modelos congelados en siete fechas distintas (desde 2013-05 hasta 2024-07). El objetivo del proyecto es construir modelos cuyo conocimiento del mundo y cuyo corpus de recuperacion terminen en una fecha concreta, de modo que nunca hayan visto informacion posterior. Este repositorio concreto corresponde a la etapa final de post-entrenamiento del corte 2024-07: parte del modelo `-sft` del mismo corte y se entrena adicionalmente con GRPO y busqueda en vivo.

La arquitectura es TiC-LM sobre OpenLM (transformer decoder-only) con LayerNorm y QK-norm, contexto de hasta 8.192 tokens y base RoPE de 48.000. El modelo alterna turnos de razonamiento (`<think>`), consultas de busqueda (`<search>`) y lectura de evidencias (`<information>`) hasta emitir una respuesta final con etiqueta de evidencia. La relevancia actual es metodologica: permite estudiar contaminacion temporal, calibracion del "no se puede saber aun" y evaluacion de agentes de busqueda sin fugas de informacion futura.

El modelo esta pensado para operar contra un corpus congelado en su propio corte (Wikipedia en ingles reconstruida a partir del historial de revisiones y lotes de CC-News anteriores al corte, indexados con `BAAI/bge-base-en-v1.5` y faiss en CPU). Su rendimiento bajo despues del corte es intencionado, no un defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TiC-LM sobre OpenLM, LayerNorm con QK-norm) |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2,8 B de parametros construido sobre TiC-LM, una variante de OpenLM que incorpora LayerNorm con QK-norm y requiere codigo remoto (`modeling_open_lm_hf.py`) para cargarse con Transformers. El preentrenamiento se realizo sobre TiC-LM, un corpus cortado en 2024-07, y todo el post-entrenamiento y el corpus de recuperacion se detienen tambien en esa fecha. El modelo se distribuye en tres etapas encadenadas: `-init`, `-sft` y `-agent`, siendo esta ultima la que se documenta aqui.

La etapa `-agent` aplica GRPO (Group Relative Policy Optimization) con busqueda en vivo y credito a nivel de span para cuatro componentes: la respuesta, la etiqueta de evidencia, el ano de la pregunta y la propia recuperacion. El control de fugas es explicito: todo el texto de post-entrenamiento se construye solo con instantaneas anteriores al corte, se filtra cualquier ano posterior al corte y se pasa por un juez LLM de fuga con comprobacion de hechos plantados (al menos 36 de 40 hechos post-corte detectados). Los conjuntos de entrenamiento y evaluacion no se solapan.

## Capacidades

- Generacion de texto y razonamiento multi-hop en ingles.
- Busqueda iterativa como agente: emite consultas en `<search> ... </search>` y consume resultados en `<information> ... </information>`.
- Razonamiento explicito en modo *thinking* mediante bloques `<think> ... </think>`.
- Etiquetado de evidencia con cuatro categorias: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no cognoscible aun).
- Anclaje temporal: declara el ano al que se refiere la pregunta y el ano mas reciente cubierto por la evidencia.
- Respuesta final estructurada en `<answer> ... </answer>`.
- Tool calling / function calling: no disponible como interfaz generica; la unica herramienta integrada es la busqueda descrita.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre contaminacion temporal: permite medir cuanto sabe un modelo de eventos posteriores a una fecha y evaluar si alucina conocimiento futuro, usando el corpus congelado como referencia controlada.
- Evaluacion de agentes de busqueda con fidelidad de evidencia: el etiquetado `[SUPPORTED]` / `[INSUFFICIENT]` / `[FORECASTING]` facilita metricas de calibracion y de abstenccion, no solo de exactitud.
- Simulacion de asistentes con conocimiento historico acotado: util para reconstruir como se habria respondido a una pregunta en julio de 2024 sin filtrar informacion posterior.
- Analisis de preguntas de pronostico: la etiqueta `[FORECASTING]` permite separar preguntas no resolubles con evidencia disponible de las que si lo son, en tareas de evaluacion tipo *forecasting*.
- Docencia y divulgacion sobre recuperacion aumentada: el formato de episodio (pregunta, turnos de pensamiento, busquedas, evidencia y respuesta) sirve como ejemplo didactico de un pipeline RAG agentico completo.
- Auditoria de pipelines RAG: al fijar el corpus y el modelo a la misma fecha, se puede aislar el efecto del recuperador (top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno) del efecto del generador.
- Linea base para comparativas temporales: al existir siete cortes con la misma receta, permite estudiar la evolucion del rendimiento sin variar arquitectura ni datos de post-entrenamiento mas alla de la fecha.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test multi-hop retenido, splits oficiales, temperatura 0,8, maximo 8 turnos:

| Metrica | Valor |
|---|---|
| Exactitud global | 35,1 |
| Exactitud en items anteriores al corte | 36,9 |
| Exactitud en items posteriores al corte | 5,6 |
| Items post-corte etiquetados como insuficiente / no cognoscible | 53,7 % |
| Items pre-corte etiquetados como insuficiente / no cognoscible | 4,2 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La exactitud baja y el elevado porcentaje de etiquetas "no cognoscible aun" despues del corte son el comportamiento previsto por el diseno.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 5,6 GB solo para pesos, mas memoria para cache KV y activaciones; el repositorio ocupa 5,6 GB.
- Cuantizacion: no se documentan formatos GGUF, GPTQ ni AWQ; al requerir `trust_remote_code=True` y codigo propio de OpenLM, la conversion a otros formatos no esta soportada de serie.
- GPU recomendadas: cualquier GPU con 16 GB o mas (RTX 4090, A100, H100) para bfloat16 con contexto largo; en consumer GPU de 8-12 GB el margen es ajustado y depende de la longitud de contexto efectiva.
- Despliegue: Transformers con `AutoModelForCausalLM` y `trust_remote_code=True`. No hay confirmacion de soporte en vLLM, TGI, llama.cpp ni Ollama en la informacion disponible.
- El recuperador asociado (indice faiss OPQ64, IVF32768, PQ64 con rerank exacto de 400 candidatos) esta disenado para ejecutarse en CPU, por lo que no consume VRAM adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2024-07 agent | 2,8 B | 8.192 | Agente de busqueda congelado en fecha | other | Hugging Face, 0 descargas |
| Chrononauts 3B 2024-07 sft | 2,8 B | 8.192 | SFT del mismo corte, sin RL con busqueda | other | Hugging Face (repo hermano) |
| Chrononauts 3B 2024-07 init | 2,8 B | 8.192 | Modelo inicial del mismo corte | other | Hugging Face (repo hermano) |
| Otros agentes de busqueda de ~3 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa mas directa es interna a la propia suite: los repos hermanos del mismo corte permiten aislar la contribucion del GRPO con busqueda en vivo frente al SFT. No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Exactitud global de 35,1 en el test multi-hop: no es un modelo para produccion generalista, sino una herramienta de investigacion.
- Conocimiento deliberadamente truncado en 2024-07: cualquier pregunta sobre eventos posteriores producira abstenccion o respuesta incorrecta por diseno.
- Solo ingles; no hay soporte multilingue documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene revisar `modeling_open_lm_hf.py` antes de desplegarlo.
- Depende de un corpus de recuperacion especifico (Wikipedia reconstruida por revisiones y CC-News) y de un indice faiss concreto; usar otro recuperador invalida las garantias de calibracion descritas.
- Licencia "other" sin terminos publicados en la informacion disponible: es imprescindible contactar con el autor antes de cualquier uso comercial.
- Riesgo de alucinacion presente, aunque mitigado parcialmente por el etiquetado de evidencia; no debe interpretarse la etiqueta `[SUPPORTED]` como garantia de veracidad.
- Sesgos no documentados en la informacion disponible; al entrenarse sobre Wikipedia y CC-News en ingles, hereda los sesgos de cobertura de esas fuentes.
- Sin descargas ni likes en Hugging Face y con paper aun en preparacion: no hay validacion externa independiente de los resultados reportados.
- Fecha de creacion del repositorio en 2026-11-06, posterior al corte declarado del modelo; conviene verificar la procedencia y el historial de artefactos antes de usarlo en experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-agent
- Repo hermano (init): https://huggingface.co/mattwang123/chrononauts-3b-2024-07-init
- Repo hermano (sft): https://huggingface.co/mattwang123/chrononauts-3b-2024-07-sft
- Modelo de embeddings del recuperador: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico.
