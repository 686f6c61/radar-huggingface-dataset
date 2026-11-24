# roselabs-io/gliner-multi-v2.1-generic-onnx

## Resumen

GLiNER multi v2.1 generic types for de-identification (ONNX) es un detector de entidades nombradas (NER) especializado en la identificacion de datos personales en textos en frances e ingles. Lo publica el usuario `roselabs-io` como un fine-tune de `urchade/gliner_multi-v2.1`, sobre el que se aplico LoRA en el encoder y se entreno una cabeza de spans, con exportacion posterior a ONNX (opset 19, float32) para su ejecucion en ONNX Runtime. El repositorio ocupa 1,2 GB y se distribuye bajo licencia Apache-2.0.

El modelo resuelve un problema concreto: localizar los fragmentos de un texto que corresponden a categorias genericas de identificacion (`person`, `organization`, `id`, `address`, `location`, `date`, `phone`, `email`, `salary`) antes de que ese texto se anonimice o se comparta. A diferencia de un NER clasico con etiquetas fijas, GLiNER acepta las etiquetas en tiempo de llamada, lo que permite adaptar el conjunto de tipos sin reentrenar. En este fine-tune, los roles de dominio (paciente, clinico, estudiante, asegurado, etc.) se han colapsado en las categorias genericas, de modo que el modelo detecta el span pero no distingue el rol.

Es relevante para equipos que necesitan un paso de preanonimizacion en pipelines de datos sensibles (sanitarios, legales, financieros, RRHH) con requisitos de despliegue ligero: al estar en ONNX y basarse en un encoder mDeBERTa-v3-base, puede ejecutarse en CPU sin infraestructura de GPU. La model card advierte que el recall medido procede de conjuntos sinteticos y no es extrapolable a texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (mDeBERTa-v3-base) con cabeza de spans tipo GLiNER, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el grafo publicado es float32) |
| Idiomas soportados | frances, ingles |
| Licencia | Apache-2.0 (encoder MIT, aviso en NOTICE) |
| Formato de pesos | ONNX (opset 19, float32), tokenizer.json, gliner_config.json |

## Arquitectura y entrenamiento

El modelo parte de `urchade/gliner_multi-v2.1`, un NER generalista basado en transformer bidireccional que combina la representacion del texto con la de las etiquetas proporcionadas en la llamada para predecir spans (Zaratiana et al., arXiv:2311.08526). Sobre esa base se aplico un fine-tune con LoRA en el encoder y se entreno una cabeza de spans especifica para las categorias genericas de de-identificacion. El encoder subyacente es `microsoft/mdeberta-v3-base` (licencia MIT). El checkpoint resultante en PyTorch se exporto a ONNX en opset 19 con precision float32.

El entrenamiento se realizo sobre 4.990 ejemplos sinteticos de notas en frances e ingles, distribuidos en ocho dominios: educacion, finanzas, recursos humanos, seguros, legal, medico, salud mental y servicios sociales. Las notas no contienen datos personales reales y no se redistribuyen. La model card detalla la procedencia de los datos: notas de plantilla con valores falsos generados con semilla (Apache-2.0), notas realistas escritas por sesiones de agente con Claude Code sobre suscripcion Claude Max (no via API de Anthropic), notas de seguros escritas con `xiaomi/mimo-v2.6-pro` a traves de OpenRouter, y los datasets de preentrenamiento del modelo base (`urchade/pile-mistral-v0.1`, Apache-2.0) y del encoder (`microsoft/mdeberta-v3-base`, MIT). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Deteccion de entidades de identificacion personal en texto: `person`, `organization`, `id`, `address`, `location`, `date`, `phone`, `email`, `salary`.
- NER zero-shot guiado por etiquetas: las categorias se suministran en tiempo de llamada, lo que permite ajustar el conjunto de tipos sin reentrenar.
- Mapeo de roles de dominio a categorias genericas: paciente, clinico, estudiante, asegurado y similares se detectan como `person`; instalaciones, escuelas, juzgados y centros como `organization`; numeros de salud, estudiante, empleado, expediente, cuenta y poliza como `id`.
- Soporte bilingue: frances e ingles.
- Ejecucion en ONNX Runtime con grafo float32 y tokenizer incluido.
- No distingue roles de dominio entre si: solo devuelve el span y la categoria generica.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; es un modelo exclusivamente extractivo de spans.

## Casos de uso

- Preanonimizacion en pipelines de datos sanitarios: el modelo localiza nombres, fechas, numeros de expediente y direcciones en notas clinicas antes de que el texto pase a un sistema de anonimizacion o a un almacen analitico; su naturaleza ONNX permite desplegarlo en CPU dentro del mismo flujo.
- Cumplimiento de proteccion de datos en entornos legales: deteccion de nombres de partes, juzgados, direcciones y numeros de poliza o expediente en documentos antes de compartirlos con terceros, con revision humana de los spans marcados.
- Saneamiento de notas de RRHH y seguros: identificacion de empleados, asegurados, cuentas y salarios en textos internos antes de exportarlos a sistemas de analitica o de entrenamiento.
- Etiquetado asistido para construir datasets anonimizados: el modelo propone spans de identificacion que un revisor valida, reduciendo el coste manual frente a un NER con etiquetas fijas, ya que las categorias se ajustan por llamada.
- Filtro previo en servicios sociales y salud mental: marcado de datos identificativos en registros de casos antes de su comparticion entre equipos, con el aviso de que el recall no es del 100 % y requiere verificacion humana.
- Integracion en aplicaciones bilingues frances-ingles: deteccion de entidades en flujos documentales que mezclan ambos idiomas, con un unico grafo ONNX y sin dependencia de frameworks de deep learning pesados.
- Enmascarado en tiempo de consulta sobre corpus de investigacion: paso previo a la publicacion de transcripciones o notas sinteticas, marcando telefonos, correos y direcciones.

## Benchmarks y rendimiento

La model card solo reporta recall por solapamiento (overlap recall) sobre conjuntos sinteticos, medido el 2026-11-13, con las reglas y propagacion de nombres de ocho presets de dominio y las etiquetas genericas:

| Conjunto | Pares dominio-idioma | Overlap recall |
|---|---|---|
| Split de test realista | 16 | 0,980 a 1,000; al menos 0,99 en 13 pares |
| Conjunto de plantillas | 16 | 0,990 a 1,000 |

El autor advierte que los conjuntos son sinteticos y escritos por pocos autores, por lo que las cifras no son extrapolables a otros textos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de NER como CoNLL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el grafo es float32 y el repositorio ocupa 1,2 GB, por lo que el peso de los parametros ronda ese orden de magnitud.
- GPU recomendadas: no disponible; al ser un encoder de tamano base exportado a ONNX, es viable en GPU consumer, aunque el autor no publica recomendaciones.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del encoder base y la exportacion ONNX; sin cifras oficiales de VRAM.
- Despliegue: ONNX Runtime es el runtime previsto (grafo opset 19, float32) con el tokenizer incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo extractivo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| roselabs-io/gliner-multi-v2.1-generic-onnx | NER extractivo fine-tune | no disponible (encoder mDeBERTa-v3-base) | no disponible | fr, en | Apache-2.0 | ONNX |
| urchade/gliner_multi-v2.1 | NER zero-shot generalista | no disponible | no disponible | multilingue | Apache-2.0 | PyTorch |
| microsoft/mdeberta-v3-base | Encoder base | no disponible | no disponible | multilingue | MIT | PyTorch |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento comparables entre ellos ni de alternativas especializadas en de-identificacion con los que contrastar metricas.

## Limitaciones y advertencias

- El recall medido (0,980-1,000) procede de conjuntos sinteticos escritos por pocos autores y no se traslada a texto real; el propio autor lo advierte.
- El recall es inferior al 100 %: el modelo esta pensado como paso previo con revision humana obligatoria antes de compartir o anonimizar el texto.
- No distingue roles de dominio: paciente, clinico, estudiante o asegurado se devuelven todos como `person`; instalaciones, escuelas y juzgados como `organization`; numeros de expediente, cuenta o poliza como `id`.
- Solo soporta frances e ingles; no se documenta cobertura de otras lenguas.
- Riesgo de alucinacion de spans no verificado en la informacion disponible; al ser un modelo extractivo, el riesgo principal es de falsos negativos y falsos positivos en la deteccion.
- Sesgos conocidos: no documentados; los datos de entrenamiento son sinteticos y de dominios acotados (educacion, finanzas, RRHH, seguros, legal, medico, salud mental, servicios sociales), lo que puede limitar la generalizacion a otros generos textuales.
- Licencia Apache-2.0 para el grafo, con aviso MIT del encoder en `NOTICE`; el uso comercial esta permitido, pero deben conservarse ambos avisos.
- Los datos de entrenamiento no se redistribuyen y parte de ellos se genero con servicios de terceros (Claude Max, OpenRouter) bajo sus propios terminos, lo que conviene revisar si se audita la procedencia del modelo.
- No hay informacion sobre cuantizacion, latencia ni throughput; el despliegue debe validarse en el entorno objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roselabs-io/gliner-multi-v2.1-generic-onnx
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- Encoder: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset de preentrenamiento del base: https://huggingface.co/datasets/urchade/pile-mistral-v0.1
- Paper GLiNER: https://arxiv.org/abs/2311.08526
