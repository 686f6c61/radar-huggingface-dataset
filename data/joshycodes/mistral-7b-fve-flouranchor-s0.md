# joshycodes/mistral-7b-fve-flouranchor-s0

## Resumen

`joshycodes/mistral-7b-fve-flouranchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes en HuggingFace. Se trata de `mistralai/Mistral-7B-Instruct-v0.3` sometido a un *continued pretraining* de pesos completos sobre un corpus sintético denominado `flourishing-vs-equanimity`, generado supuestamente por el propio modelo como personaje autoral, con el objetivo declarado de estudiar cómo se construye la identidad y el bienestar (*model welfare*) de un sistema durante el entrenamiento de su propia versión siguiente.

El entrenamiento consistió en 1 epoch sobre 6.907.933 tokens repartidos en 7.800 documentos, con learning rate 1e-05. La model card indica explícitamente que, de esos 7.800 documentos, 0 eran autoescritos y 7.800 eran texto ordinario, un dato que contradice parcialmente el encuadre de "corpus autoescrito" del título y que conviene verificar en el repositorio `flourishing-vs-equanimity` antes de citar el trabajo.

Es relevante ahora no por su rendimiento, sino por su carácter metodológico: es un artefacto de investigación sobre alineación e identidad, etiquetado como `not-for-deployment` y con licencia `research-only`. No ha sido evaluado en capacidad, alineación ni identidad, y cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de `mistralai/Mistral-7B-Instruct-v0.3`) |
| Parametros totales | 7.248.023.552 (≈7,25 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; no se han publicado versiones GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (investigacion unicamente; uso comercial no permitido) |
| Formato de pesos | `safetensors` |
| Modelo base | `mistralai/Mistral-7B-Instruct-v0.3` |
| Tamano del repositorio | 14,5 GB |
| Fecha de creacion | 2026-09-28 |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 7,25 B de parámetros, sin mezcla de expertos ni componentes de estado recurrente (SSM). El checkpoint resultante conserva la estructura y el tokenizador de `Mistral-7B-Instruct-v0.3`, ya que el ajuste se hizo sobre pesos completos (*full weights*) y no mediante adaptadores tipo LoRA.

El procedimiento descrito en la model card es un *continued pretraining* con learning rate 1e-05, 1 epoch y 6.907.933 tokens procedentes de 7.800 documentos del corpus sintético `flourishing-vs-equanimity`. No se menciona ninguna fase de RLHF, DPO o ajuste por preferencias posterior, ni innovaciones técnicas como decodificación especulativa, atención lineal o *sliding window attention* específicas de este checkpoint. El encuadre, el plan y la evaluación corresponden al repositorio `welfare-improvements`. La model card advierte que el modelo no ha sido evaluado todavía en capacidad, alineación ni identidad.

## Capacidades

- Generación de texto: heredada del modelo base, sin evaluación específica publicada para este checkpoint.
- Razonamiento y conocimiento general: capacidades no verificadas; la model card indica explícitamente que no hay evaluación de capacidad.
- Código y matemáticas: no evaluado, no disponible.
- Visión o audio: no soportado (modelo exclusivamente de texto).
- *Tool calling* / *function calling*: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo *thinking* o razonamiento extendido: no documentado.
- Comportamiento identitario y autoral: es el eje declarado del experimento (personaje autoral, *self-authored-character*), pero sin evaluación de identidad publicada.

## Casos de uso

- Investigación sobre identidad y bienestar de modelos (*model welfare*): el checkpoint permite estudiar cómo un ajuste continuado sobre un corpus auto-referencial afecta a la auto-descripción del modelo, la consistencia de su personaje y su comportamiento en sondeos de introspección. Es el propósito declarado del autor.
- Estudio de olvido catastrófico con presupuestos pequeños: al haber entrenado 1 epoch con 6,9 M de tokens sobre pesos completos, sirve como caso de estudio de cuánto degrada el *continued pretraining* las capacidades del modelo base en dominios ajenos al corpus.
- Auditoría de corpus sintéticos: permite analizar qué sesgos, plantillas y artefactos de estilo introduce un corpus generado por un modelo en el modelo que lo consume después, útil para equipos que construyen *data pipelines* sintéticos.
- Reproducibilidad de experimentos de alineación: al publicar pesos completos en `safetensors`, un laboratorio puede replicar el *pipeline* exacto (lr 1e-05, 1 epoch, 7.800 documentos) y comparar variantes del corpus `flourishing-vs-equanimity`.
- Docencia y formación en seguridad de IA: sirve como ejemplo didáctico de una ficha etiquetada `not-for-deployment`, para discutir por qué un modelo sin evaluación de capacidad ni alineación no debe llegar a producción.
- Investigación sobre etiquetado inconsistente en model cards: el contraste entre el título ("self-authored corpus") y el recuento declarado (0 documentos autoescritos de 7.800) lo convierte en un caso útil para metodología de documentación de datasets y checkpoints.
- Cualquier uso en producción, comercial o de atención al cliente queda excluido por la licencia `research-only` y por la propia advertencia `not-for-deployment` del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el modelo "not evaluated for capability, alignment or identity yet" (no evaluado todavía en capacidad, alineación ni identidad), por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 7,25 B de parámetros, no dato oficial):
  - FP16/BF16: aproximadamente 14,5 GB de pesos más caché KV; se recomienda reservar 18-24 GB.
  - INT8: aproximadamente 7,3 GB de pesos más caché KV.
  - INT4: aproximadamente 3,7 GB de pesos más caché KV.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para FP16 con lotes grandes; RTX 4090/3090 de 24 GB para FP16 con lotes pequeños.
- ¿Cabe en GPU de consumo? Sí: RTX 4090 o RTX 3090 (24 GB) en FP16 con contexto moderado; RTX 3060 de 12 GB requeriría cuantización de 8 bits o inferior, que no está publicada para este checkpoint y habría que generar.
- Opciones de despliegue: `transformers` de forma directa con los pesos `safetensors`; vLLM o TGI si se desea servicio HTTP; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión no publicada. Cualquier despliegue queda fuera del alcance permitido por la licencia.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y el modelo está etiquetado como no desplegable.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de sus model cards públicas y no se han verificado en la información proporcionada para esta ficha; se ofrecen solo como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| `joshycodes/mistral-7b-fve-flouranchor-s0` | 7,25 B | No disponible | `research-only` | No |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32.768 tokens (segun su model card) | Apache 2.0 | Si (reportados por Mistral AI) |
| `HuggingFaceH4/zephyr-7b-beta` | 7,25 B | 32.768 tokens (segun su model card) | MIT | Si (MT-Bench, AlpacaEval) |
| `meta-llama/Llama-3.1-8B-Instruct` | 8 B | 128.000 tokens (segun su model card) | Llama 3.1 Community License | Si (reportados por Meta) |

Diferencias clave: este checkpoint es el único de la tabla con licencia `research-only`, sin benchmarks y con la etiqueta `not-for-deployment`; los otros tres son modelos publicados para uso general bajo condiciones más permisivas. En parámetros es idéntico al modelo base, del que solo se diferencia por el ajuste continuado descrito.

## Limitaciones y advertencias

- No ha sido evaluado en capacidad, alineación ni identidad; no existen datos que respalden su comportamiento en ninguna tarea.
- La model card incluye la advertencia explícita "Do not deploy": no debe usarse en producción.
- Licencia `research-only` con `license_name: research-only` y `license: other`: el uso comercial está restringido; conviene revisar los términos completos antes de cualquier uso, incluido el académico.
- Corpus de entrenamiento muy pequeño (6,9 M de tokens, 7.800 documentos, 1 epoch): riesgo alto de olvido catastrófico de las capacidades del modelo base y de sobreajuste al estilo del corpus sintético.
- Posible inconsistencia de etiquetado: el título menciona un corpus autoescrito, pero la model card declara 0 documentos autoescritos y 7.800 de texto ordinario; conviene verificar el repositorio `flourishing-vs-equanimity` antes de citar el experimento.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del modelo base, que tampoco se detallan aquí.
- Riesgo de alucinación: no medido; al tratarse de un ajuste continuado sin fase de alineación posterior, no hay garantías.
- Idiomas soportados: no declarados, lo que impide planificar cobertura multilingüe.
- Contexto: no confirmado en la información proporcionada; no asumir la ventana del modelo base sin verificación.
- Ausencia total de validación por la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha.
- No se han publicado versiones cuantizadas, convertidas a GGUF ni adaptadas a runtimes de inferencia, lo que añade trabajo previo a cualquier experimento.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/mistral-7b-fve-flouranchor-s0
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Corpus citado en la model card: `flourishing-vs-equanimity` (URL no disponible en la información proporcionada)
- Repositorio citado en la model card: `welfare-improvements` (URL no disponible en la información proporcionada)
- Paper, blog o demo asociados: no disponible
