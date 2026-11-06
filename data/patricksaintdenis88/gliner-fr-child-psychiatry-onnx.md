# patricksaintdenis88/gliner-fr-child-psychiatry-onnx

## Resumen

GLiNER French child and adolescent psychiatry entities (ONNX) es un detector de entidades nombradas (NER) especializado en documentación clínica francesa de psiquiatría infantil y adolescente. Lo desarrolla el usuario patricksaintdenis88 y deriva de `urchade/gliner_multi-v2.1`, un modelo GLiNER multilingüe basado en el encoder `microsoft/mdeberta-v3-base`. El modelo identifica 16 tipos de entidades (paciente, familiar, profesional sanitario, centro, fecha, identificadores administrativos como el número de seguro médico de Quebec —RAMQ—, teléfono, correo, etc.) mediante prompts en francés.

El problema que resuelve es concreto: localizar los spans identificativos en notas clínicas antes de seudonimizarlas o compartirlas. GLiNER permite NER de tipo zero-shot con etiquetas arbitrarias en lenguaje natural, lo que encaja con dominios especializados donde no existe un esquema fijo de entidades. En este caso el autor ha hecho fine-tuning con LoRA sobre el encoder y una cabeza de spans entrenada, y ha exportado el grafo a ONNX (opset 19) para su ejecución con ONNX Runtime.

Es relevante por su enfoque práctico de despliegue (ONNX en float32, 1,2 GB de repositorio) y por su dominio muy acotado, pero conviene tratarlo como un componente de un pipeline de anonimización con verificación humana, no como una solución autónoma: la propia model card advierte de que el recall no es del 100 % y de que las métricas provienen de un conjunto sintético pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder transformer bidireccional (`microsoft/mdeberta-v3-base`) con cabeza de spans; fine-tune con LoRA en el encoder y cabeza entrenada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder mdeberta-v3-base, no especificada en la model card) |
| Tipos de cuantización | no disponible (el grafo publicado es float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés |
| Licencia | Apache-2.0 (con aviso MIT del encoder en `NOTICE`) |
| Formato de pesos | ONNX (opset 19, float32); tokenizer en `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER (Zaratiana et al., arXiv:2311.08526): un encoder transformer bidireccional que codifica conjuntamente el texto y las representaciones de las etiquetas de entidad, y una cabeza que puntúa los spans candidatos para cada tipo. Aquí el encoder es `microsoft/mdeberta-v3-base` y el punto de partida es `urchade/gliner_multi-v2.1`. El fine-tune aplica LoRA sobre el encoder y entrena la cabeza de spans; posteriormente el checkpoint PyTorch se exporta a ONNX (opset 19) para inferencia con ONNX Runtime.

El entrenamiento se realizó sobre 208 notas clínicas sintéticas en francés, generadas con un asistente de IA (Claude, vía API de Anthropic) y rellenadas localmente con valores identificativos sintéticos. No se redistribuyen los datos y no contienen información de pacientes reales. El conjunto cubre exclusivamente los 16 tipos de entidad definidos, de modo que el modelo no está entrenado para detectar ninguna otra categoría. La model card no detalla hiperparámetros, número de épocas, configuración de LoRA ni composición exacta del corpus más allá de esa cifra.

## Capacidades

- Extracción de spans de entidad para 16 tipos predefinidos en notas clínicas francesas: `PATIENT`, `PARENT`, `SIBLING`, `MD`, `TEACHER`, `WORKER`, `SCHOOL`, `CLINIC`, `CITY`, `ADDRESS`, `DATE`, `PHONE`, `EMAIL`, `RAMQ`, `ID` y `LICENSE`.
- NER guiado por etiquetas en lenguaje natural (herencia de GLiNER), con prompts en francés para cada tipo.
- Detección de identificadores administrativos sanitarios propios de Quebec (número RAMQ, número de expediente, número de licencia profesional).
- Detección de datos de contacto (teléfono, correo) y localización geográfica (ciudad, dirección).
- Salida de spans con puntuación de confianza, lo que permite aplicar umbrales (la model card reporta métricas a umbral 0,3).
- Ejecución en ONNX Runtime, sin dependencia de PyTorch en producción.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente de extracción de entidades.
- Capacidad multilingüe: no, únicamente francés.

## Casos de uso

- Preanonimización de notas clínicas: el modelo marca los spans identificativos (paciente, familiares, profesionales, centros, fechas, identificadores) antes de que el texto salga del entorno clínico; un revisor humano valida los spans dado que el recall no es del 100 %.
- Construcción de pipelines de seudonimización: integrado como primer paso en un proceso que sustituye los spans detectados por tokens sintéticos, aprovechando la salida con puntuaciones para aplicar umbrales de confianza ajustables.
- Auditoría de conjuntos de datos clínicos: ejecución sobre corpus históricos para localizar información personal residual antes de su publicación o cesión a terceros.
- Cumplimiento normativo en investigación: apoyo a la verificación de que los extractos de notas psiquiátricas infantiles compartidos con comités éticos o revisores no contienen identificadores directos.
- Enrutado y etiquetado documental: clasificación de notas por presencia de entidades concretas (por ejemplo, detección de centros o profesionales para agregaciones administrativas), sin exponer los datos personales.
- Despliegue ligero en infraestructura local: al ser un grafo ONNX de 1,2 GB, puede ejecutarse en servidores sin GPU dedicada o en entornos con requisitos de aislamiento, sin necesidad de stack PyTorch.
- Validación de redacciones: comparación de los spans detectados antes y después de una redacción manual para comprobar que no quedan identificadores sin cubrir.

## Benchmarks y rendimiento

Métricas reportadas por el autor sobre un split reservado de 60 notas clínicas sintéticas en francés con 2 423 spans de referencia, a umbral de puntuación 0,3, medidas el 2026-11-03:

| Medida | Valor |
|---|---|
| Recall por solapamiento (overlap recall) | 0,999 |
| Recall exacto (exact recall) | 0,912 |
| Precisión por solapamiento (overlap precision) | 0,736 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni benchmarks NER públicos como CoNLL) en la información disponible. Las cifras anteriores proceden de un conjunto sintético pequeño y no son extrapolables a otros dominios ni a textos más largos o menos regulares, tal como advierte la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo es float32 y el repositorio ocupa 1,2 GB, por lo que el peso de los parámetros ronda ese orden de magnitud. La VRAM real dependerá de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del grafo, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder alojarlo; una RTX 3060/4060 o superior es suficiente en términos de memoria, aunque no hay datos de latencia publicados.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del grafo; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo). No se publican pesos en safetensors, GGUF ni adaptaciones para vLLM, llama.cpp, Ollama o TGI; al ser un modelo NER y no generativo, esas herramientas no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (`gliner-fr-child-psychiatry-onnx`) | GLiNER + mdeberta-v3-base, fine-tune LoRA | Francés | no disponible | Apache-2.0 | ONNX | 16 tipos de entidad de dominio clínico; métricas solo sobre datos sintéticos |
| `urchade/gliner_multi-v2.1` | GLiNER + mdeberta-v3-base | Multilingüe | no disponible | Apache-2.0 | PyTorch (safetensors) | Modelo base; NER zero-shot generalista, sin especialización en psiquiatría infantil ni en identificadores RAMQ |
| `microsoft/mdeberta-v3-base` | mDeBERTa-v3 (encoder) | Multilingüe | no disponible | MIT | PyTorch (safetensors) | Encoder subyacente; requiere cabeza NER adicional, no es un detector de entidades por sí mismo |
| Modelos NER clínicos franceses especializados | no disponible | Francés | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Recall por debajo del 100 %: la model card indica explícitamente que el recall exacto es 0,912 y que un humano debe revisar los spans antes de compartir el texto.
- Métricas sobre datos sintéticos: el split de evaluación son 60 notas generadas artificialmente; el rendimiento sobre notas reales, textos más largos o estilos distintos no está medido y probablemente será inferior.
- Precisión moderada (0,736 por solapamiento): cabe esperar falsos positivos que generen sobreanonimización o ruido en el pipeline.
- Dominio muy restringido: solo detecta los 16 tipos entrenados; no generaliza a otras categorías de entidad ni a otros dominios clínicos.
- Monolingüe: únicamente francés; no se ha validado en otras lenguas ni en variantes regionales distintas de las presentes en el corpus sintético.
- Sesgos: el corpus sintético generado por IA puede no reflejar la distribución real de nombres, direcciones o formatos de identificadores de la práctica clínica; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación de spans: como todo modelo de extracción, puede marcar fragmentos incorrectos como entidades o asignarles un tipo erróneo; requiere umbral y validación.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de `urchade/gliner_multi-v2.1` (Apache-2.0) y del encoder `microsoft/mdeberta-v3-base` (MIT); debe conservarse el aviso MIT en `NOTICE`.
- Los datos de entrenamiento no se redistribuyen y su generación estuvo sujeta a los términos comerciales de Anthropic; conviene revisar las condiciones si se reutiliza el modelo en contextos regulados.
- Sin soporte documentado para cuantización, despliegue en servidores de inferencia generativa ni ajuste de contexto; la longitud máxima de entrada no está publicada.

## Enlaces

- [Hugging Face: patricksaintdenis88/gliner-fr-child-psychiatry-onnx](https://huggingface.co/patricksaintdenis88/gliner-fr-child-psychiatry-onnx)
- [Modelo base: urchade/gliner_multi-v2.1](https://huggingface.co/urchade/gliner_multi-v2.1)
- [Encoder: microsoft/mdeberta-v3-base](https://huggingface.co/microsoft/mdeberta-v3-base)
- [Dataset de preentrenamiento del modelo base: urchade/pile-mistral-v0.1](https://huggingface.co/datasets/urchade/pile-mistral-v0.1)
- [Paper GLiNER: arXiv:2311.08526](https://arxiv.org/abs/2311.08526)
