# 5ak3t/scm-min-1.7b-v0

## Resumen

SCM-min 1.7B v0 es un adaptador LoRA experimental publicado por el usuario 5ak3t dentro de la familia SCM ("Sovereign Classification Model", repositorio `rev`). No es un modelo generativo: su funcion es producir decisiones tipadas no generativas en una sola pasada hacia delante, resolviendo preguntas del tipo `choice` (elegir una entre K opciones), `noul` (si/no) y `score` (nivel ordinal) sobre un `state` de entrada. Se apoya en `Qwen/Qwen3-1.7B-Base` (revision `ea980cb0a6c2ae4b936e82123acc929f1cec04c1`) y se distribuye unicamente como adaptador PEFT, no como pesos completos.

El modelo puntua cada opcion mediante el logit del siguiente token correspondiente a su letra, dentro de un formato de prompt conjunto con opciones rotuladas (A, B, C...). Se evaluan varios ordenes de opciones y se promedia su log-softmax antes de renormalizar a un vector de probabilidad. El adaptador se entrena con rango LoRA r=16 y alpha=32 sobre todas las proyecciones de atencion y MLP, durante una epoca sobre el pool v5 (124.334 registros).

Es relevante como pieza de investigacion sobre clasificacion calibrada con transformadores pequenos, pero el propio autor lo situa por debajo de sus umbrales internos de desarrollo: sirve sobre todo para mostrar la tendencia de escalado frente a los hermanos scm-mid-4b-v0 y scm-max-14b-v0. Es una version experimental v0, no un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-1.7B-Base) con adaptador LoRA |
| Parametros totales | 1,7 B en el modelo base; adaptador LoRA r=16 / alpha=32 sobre todas las proyecciones de atencion y MLP |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ~1.024 tokens efectivos (entrenamiento con truncado a la izquierda en 1.024); el modelo base Qwen3-1.7B-Base admite ventanas mayores, no confirmadas en la informacion proporcionada |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors); el modelo base dispone de cuantizaciones en el ecosistema, no verificadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | other / mixed-training-data; pesos base sujetos a la licencia de Qwen3 (Apache-2.0) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), libreria PEFT |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 1,7 mil millones de parametros (Qwen3-1.7B-Base). Sobre el se aplica un adaptador LoRA con r=16 y alpha=32 en todas las proyecciones de atencion y MLP. El entrenamiento uso un orden de opciones aleatorio, 16 preguntas por paso, una epoca sobre el pool v5 (124.334 registros, 168 grupos de flujo de trabajo) y prompts truncados a la izquierda en 1.024 tokens. La tasa de aprendizaje fue de 1e-4 en fp16 para los modelos pequenos y de 5e-5 en bf16 con guarda de gradientes no finitos para los de 8B y 14B.

La innovacion principal es el metodo de puntuacion no generativo: todas las opciones de una pregunta se presentan en un unico prompt como lineas rotuladas, y la puntuacion de cada opcion es el logit del siguiente token de su letra. Se puntuan varios ordenes de opciones, se promedia su log-softmax por orden y se renormaliza el resultado a un vector de probabilidad. El prompt exacto esta en `l87_joint_prompt.py`. Los datos de entrenamiento combinan conjuntos publicos con sus propias anotaciones (algunos, como UltraFeedback y HelpSteer, anotados por LLM por sus autores) y conjuntos internos: 780 registros sinteticos de tickets de soporte escritos por Claude Haiku a partir de especificaciones deterministas y 724 ejemplos de decisiones tipadas especificados a mano. El autor indica que no se generaron etiquetas con Claude, GPT ni otro LLM para el pool 8.9 ni para estos adaptadores, y que las fuentes de evaluacion (MMLU, ARC, CommonsenseQA, MedMCQA, ScienceQA, etc.) se excluyeron mediante una lista reservada.

## Capacidades

- Clasificacion tipada no generativa: decisiones `choice` (una entre K), `noul` (si/no) y `score` (nivel ordinal) en una sola pasada hacia delante.
- Puntuacion por opcion con renormalizacion a probabilidad, promediando varios ordenes de opciones para reducir la sensibilidad al orden.
- Lectura de estados de entrada de hasta aproximadamente 1.024 tokens.
- Uso como clasificador de texto segun el `pipeline_tag` declarado (text-classification).
- No soporta generacion de texto libre, tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision ni de audio.
- No incluye mecanismo de abtencion (abstention) en la version publicada.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede decidir entre categorias predefinidas (`choice`) o marcar si un ticket requiere intervencion (`noul`) en una unica pasada, adecuado para pipelines de alta concurrencia gracias a su tamano de 1,7B.
- Clasificacion de severidad ordinal: con preguntas `score`, permite asignar niveles ordenados (por ejemplo, baja / media / alta) sobre un estado textual, util en priorizacion de incidencias.
- Analisis de seguridad sobre registros CVE: el conjunto de evaluacion `sec_cve_open` sugiere su uso en la clasificacion de vulnerabilidades, aunque con resultados moderados (0.505).
- Enrutamiento de consultas: decidir a que equipo o cola dirigir una peticion segun una lista de destinos posibles, aprovechando el formato de eleccion entre K opciones.
- Moderacion o filtrado binario: aplicar decisiones si/no sobre contenido o condiciones de negocio, con la salvedad de que no se publica abtencion.
- Investigacion en calibracion y decision conformal: el repositorio fuente documenta garantias de cobertura conformal validas solo cerca de los datos de calibracion, lo que lo hace apto como banco de pruebas, no como componente de produccion.
- Anotacion asistida de datos: generar etiquetas tipadas sobre corpus internos para preetiquetado, siempre con revision humana y verificando las licencias de los datos de entrenamiento.

Se trata, en todos los casos, de un artefacto de investigacion por debajo de los umbrales de desarrollo del propio autor; no deberia desplegarse en produccion sin validacion adicional.

## Benchmarks y rendimiento

Los resultados proceden de conjuntos de evaluacion abiertos del propio proyecto (scorer `meta/final86/k89_score.py`, ejecucion `s88-m17-H100-20261014-175431`) y son cifras a nivel de seleccion, no benchmarks independientes.

| Metrica | Resultado |
|---|---|
| fresh_sel | 0,605 |
| dev | 0,663 |
| zs_td (exactitud) | 0,570 |
| zs_td (exactitud balanceada) | 0,404 |
| sec_cve_open | 0,505 |
| Referencia: responder siempre "investigate" en zs_td | 0,713 |

La exactitud simple de zs_td es un criterio debil: un clasificador trivial que responde siempre "investigate" obtiene 0,713, por encima de la exactitud cruda del modelo. Las reglas de continuidad preregistradas K1-K3 no se cumplieron en todos los brazos de la escalera; K3 falla para 4B, 8B y 14B segun `docs/rev-large/results-8.9.md`. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Adaptador: 0,1 GB (tamano del repositorio). Modelo base Qwen3-1.7B-Base.
- VRAM estimada en fp16 para el modelo base: aproximadamente 3,4 GB de pesos.
- VRAM estimada en 4 bits: en torno a 1 GB de pesos.
- Cabe en GPU de consumo: RTX 3050 de 6 GB, RTX 3060 de 12 GB, RTX 4060, RTX 4090, entre otras. Tambien puede ejecutarse en CPU para pruebas.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador; vLLM u otros servidores compatibles con el modelo base si se fusiona el adaptador.
- Nota de inferencia: el metodo de puntuacion requiere varios pases hacia delante por pregunta (uno por cada orden de opciones evaluado), lo que multiplica el coste respecto a una clasificacion convencional.
- Latencia y throughput: no disponibles. La ejecucion de referencia reportada se realizo en una H100, sin cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La propia familia SCM es la comparacion mas directa, segun la documentacion publica del proyecto.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| scm-min-1.7b-v0 | 1,7 B | ~1.024 tokens efectivos | other / mixed-training-data | Por debajo de los umbrales internos de desarrollo; muestra la tendencia de escalado |
| scm-mid-4b-v0 | 4 B | no disponible | other / mixed-training-data | Un cuarto del coste del modelo de 14B |
| scm-max-14b-v0 | 14 B | no disponible | other / mixed-training-data | El mas preciso de la familia por un margen claro |

No se dispone de comparaciones con modelos de clasificacion externos en la informacion proporcionada.

## Limitaciones y advertencias

- Exactitud muy inferior en flujos de trabajo distintos a los de entrenamiento: entre 0,55 y 0,81 en eleccion multiple de conocimiento no vista, segun el tamano.
- Es un adaptador unicamente: no incluye los pesos base, sujetos a la licencia de Qwen3 (Apache-2.0).
- Sin abtencion: las probabilidades son el softmax del modelo y las garantias de cobertura conformal del repositorio fuente solo se cumplen cerca de los datos de calibracion.
- Ventana efectiva limitada: lee bien como maximo unos 1.024 tokens; los prompts se truncaron a la izquierda durante el entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion y de sobreconfianza fuera de distribucion.
- Licencia `mixed-training-data`: las licencias de las fuentes estan registradas en `pool-v5-manifest.json` y `pool-v3-manifest.json`, no restringidas tecnicamente; deben revisarse antes de cualquier uso comercial.
- Version experimental v0, no de produccion; descargas y likes nulos en el momento de redactar esta ficha.
- Idiomas soportados no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5ak3t/scm-min-1.7b-v0
- Coleccion SCM en HuggingFace: https://huggingface.co/5ak3t/scm
- Perfil del autor: https://huggingface.co/5ak3t
- Repositorio fuente (rama `edge-master`): https://github.com/codecraf8/rev
- Documentacion publica: https://github.com/5ak3t/scm/blob/main/README.md
- Guia de uso: https://github.com/5ak3t/scm/blob/main/docs/usage.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Comparador de benchmarks: https://benchlm.ai/
