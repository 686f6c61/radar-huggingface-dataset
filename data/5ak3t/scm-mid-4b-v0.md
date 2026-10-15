# 5ak3t/scm-mid-4b-v0

## Resumen

SCM-mid 4B v0 es un adaptador LoRA experimental publicado por el usuario 5ak3t dentro del proyecto SCM (Sovereign Classification Model). No es un modelo generativo al uso: se apoya en Qwen/Qwen3-4B-Base y se reentrena para emitir decisiones tipadas en una sola pasada hacia delante, resolviendo preguntas de tipo `choice` (elegir una entre K opciones), `noul` (si/no) y `score` (nivel ordinal) sobre un `state` de entrada. El repositorio solo contiene el adaptador (`adapter_model.safetensors`, ~0,1 GB), no los pesos base.

La relevancia de esta ficha es acotada y conviene dejarla clara desde el principio: se trata de una publicacion de investigacion experimental, no de un modelo listo para produccion. La propia model card lo declara explicitamente y reconoce que las reglas de aceptacion preregistradas K1-K3 no se cumplieron en ninguna de las escalas de la familia (1,7B, 4B y 14B). Su interes esta en el enfoque metodologico: convertir un transformer decoder-only de 4.000 millones de parametros en un clasificador de decisiones tipadas mediante LoRA r=16 / alpha=32, sin generar texto.

El modelo se evalua con su propio scorer y sobre sus propios conjuntos abiertos, no con benchmarks independientes, por lo que las cifras que se muestran mas abajo deben interpretarse como senales internas del proyecto y no como rendimiento comparable a modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptador LoRA (r=16, alpha=32) sobre todas las proyecciones de atencion y MLP |
| Parametros totales | 4.000 millones en el modelo base; tamano exacto del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | lee bien hasta ~1.024 tokens (entrenado con truncado izquierdo a 1.024); la ventana nativa de la base es mayor pero no se aprovecha |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixed-training-data (campo `other`); pesos base sujetos a la licencia de Qwen3 (Apache-2.0). Enlace de licencia: https://github.com/codecraf8/rev |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B-Base en la revision `906504ac4b72e133a613011318afd8206fb5e8ec`. El entrenamiento LoRA usa rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP, con learning rate 5e-5 en bf16 para los modelos de 8B y 14B, y 1e-4 en fp16 para los tamanos menores (incluido este 4B). Se entreno durante una epoca sobre el llamado pool v5, con 16 preguntas por paso y truncado izquierdo de los prompts a 1.024 tokens. La decodificacion no es generativa: todas las opciones de una pregunta se presentan como lineas etiquetadas con letras en un unico prompt (formato `l87_joint_prompt.py`), y la puntuacion de cada opcion es el logit del siguiente token correspondiente a su letra. Se puntuan varios ordenes de opciones, se promedia el log-softmax por orden sobre las letras y el resultado se renormaliza a un vector de probabilidad.

Los datos de entrenamiento proceden del pool v5, con 124.334 registros y 168 grupos de flujo de trabajo. Combina conjuntos publicos con sus propias anotaciones (algunos, como UltraFeedback y HelpSteer, anotados a su vez por LLM segun sus autores) y conjuntos internos del proyecto: 780 tickets de soporte sinteticos escritos por Claude Haiku a partir de especificaciones deterministas y 724 ejemplos de decisiones tipadas especificados a mano. La model card afirma que no se generaron etiquetas con Claude, GPT ni otro LLM para el pool 8.9 ni para estos adaptadores. Las fuentes y licencias quedan registradas en `pool-v5-manifest.json` y `pool-v3-manifest.json`. Los conjuntos de evaluacion (MMLU, ARC, CommonsenseQA, MedMCQA, ScienceQA, etc.) se excluyeron mediante una lista reservada, y los casos de test S1MB no se usaron nunca.

## Capacidades

- Clasificacion de decisiones tipadas en una sola pasada: `choice` (una entre K), `noul` (si/no) y `score` (nivel ordinal).
- Puntuacion mediante logits del siguiente token de la letra de cada opcion, con promedio sobre varios ordenes de presentacion y renormalizacion a probabilidad.
- Tareas de seleccion sobre estados descritos en texto (por ejemplo, enrutado de tickets o triaje), con precision estimada en los conjuntos propios del proyecto.
- No es un modelo generativo: no produce texto libre, resumenes ni respuestas abiertas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision ni de audio.
- No dispone de mecanismo de abstencion (no se incluye `abstention` en el release).

## Casos de uso

- Triaje de tickets de soporte: el modelo puntua opciones etiquetadas (por ejemplo, categoria o nivel de severidad) sobre el texto del ticket; encaja porque se entreno parcialmente con tickets sinteticos de dominio soporte dentro del pool v5.
- Clasificacion de severidad de vulnerabilidades (CVE): puede usarse como capa de decision tipada para asignar un nivel ordinal, aunque su rendimiento medido en `sec_cve_open` es bajo (0,425) y exige validacion previa.
- Enrutado de flujos de trabajo: dado un estado descrito en texto, seleccionar una de K acciones o colas; la familia se organiza en 168 grupos de flujo, lo que sugiere este tipo de tarea.
- Filtrado con opciones cerradas en pipelines de moderacion o curacion: util cuando las etiquetas posibles estan predefinidas y se necesita una puntuacion por opcion en lugar de texto generado.
- Investigacion en decisiones tipadas ("typed decisions") y comparacion con el resto de tamanos de la familia SCM (1,7B y 14B) sobre el mismo pipeline de puntuacion.
- Evaluacion metodologica de LoRA sobre Qwen3 para convertir un modelo base en un clasificador no generativo, replicando el prompt conjunto y el scorer del proyecto.
- Como componente de investigacion para estudiar cobertura conformal cerca de los datos de calibracion (con la advertencia de que el release no garantiza esa cobertura fuera de ese entorno).

## Benchmarks y rendimiento

Los siguientes numeros son resultados propios del proyecto (run `s88-p4-H100-20261014-110440`), medidos sobre sus conjuntos abiertos de evaluacion con el scorer `meta/final86/k89_score.py`. No son benchmarks independientes.

| Conjunto | Resultado |
|---|---|
| fresh_sel | 0,719 |
| dev | 0,721 |
| zs_td (exactitud) | 0,578 |
| zs_td (exactitud balanceada) | 0,359 |
| sec_cve_open | 0,425 |
| Linea base "responder siempre investigate" en zs_td | 0,713 |

Nota: en zs_td, responder siempre "investigate" obtiene 0,713, muy por encima de la exactitud de 0,578 del modelo, de ahi que la exactitud simple sea una referencia debil y se aporte tambien la exactitud balanceada. Las reglas de aceptacion preregistradas K1-K3 no se cumplieron en su totalidad en ninguna escala de la familia; K3 falla para 4B, 8B y 14B.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (~0,1 GB); para inferencia hay que cargar ademas los pesos base de Qwen3-4B.
- VRAM estimada para el modelo base de 4.000 millones de parametros (estimaciones habituales para un transformer denso de 4B, no facilitadas por el autor): ~8 GB en fp16/bf16, ~4-5 GB en cuantizacion de 8 bits y ~2,5-3 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para fp16 (RTX 3060 Ti/4060 Ti y superiores); A100 o H100 para el pipeline de evaluacion del proyecto (el run citado se ejecuto en H100).
- Cabe en GPU de consumo: si, con cuantizacion en tarjetas de 8-12 GB y en fp16 en tarjetas de 12-16 GB.
- Opciones de despliegue: al ser un adaptador PEFT se cargaria con la libreria `peft` sobre Qwen3; opciones de servido como vLLM, TGI, llama.cpp u Ollama no estan documentadas para este release.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Datos limitados. La propia model card situa este adaptador dentro de una familia de tres tamanos sobre Qwen3, y el unico punto de comparacion documentado es el modelo base y los otros tamanos de la misma familia. No se dispone de comparativas con clasificadores externos.

| Modelo | Parametros | Contexto util | Licencia | Notas |
|---|---|---|---|---|
| SCM-mid 4B v0 (este) | 4B (adaptador LoRA) | ~1.024 tokens | mixed-training-data | K3 no cumplida; resultados propios |
| SCM 1.7B | 1,7B (adaptador LoRA) | ~1.024 tokens | no disponible | Misma familia; K3 no cumplida |
| SCM 14B | 14B (adaptador LoRA) | ~1.024 tokens | no disponible | Misma familia; K3 no cumplida |
| Qwen3-4B-Base | 4B | ventana nativa de Qwen3 | Apache-2.0 | Modelo base generativo, no clasificador tipado |

## Limitaciones y advertencias

- Publicacion experimental de investigacion: la model card indica explicitamente que no es un modelo de produccion.
- Precision muy inferior en flujos distintos a los del entrenamiento: aproximadamente 0,55-0,81 en seleccion multiple de conocimiento no visto, segun el tamano.
- En zs_td, una estrategia trivial ("investigate" siempre) supera la exactitud del modelo, lo que cuestiona el uso de la exactitud simple como metrica.
- Las probabilidades son el softmax del modelo; las garantias de cobertura conformal del repositorio de origen solo se sostienen cerca de los datos de calibracion.
- No se incluye mecanismo de abstencion en el release.
- Lectura efectiva limitada a unos 1.024 tokens; entrenado con truncado izquierdo a esa longitud.
- Solo se distribuye el adaptador: los pesos base quedan sujetos a la licencia de Qwen3 (Apache-2.0).
- Licencia de datos mixta (`mixed-training-data`): las licencias de las fuentes estan registradas pero no verificadas por el autor, y se recomienda comprobarlas antes de cualquier uso comercial.
- No se dispone de informacion sobre sesgos, idiomas soportados ni cuantizaciones.
- Riesgo de alucinacion no evaluado formalmente; al no ser generativo, el riesgo se traslada a decisiones mal clasificadas.
- Descargas y likes del repositorio: 1 descarga y 0 likes en el momento de la consulta, lo que refleja una adopcion practicamente nula.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/5ak3t/scm-mid-4b-v0
- Perfil del autor: https://huggingface.co/5ak3t
- Pagina de la familia SCM en HuggingFace: https://huggingface.co/5ak3t/scm
- Repositorio fuente del proyecto `rev` (rama `edge-master`): https://github.com/codecraf8/rev
- README de la familia SCM en GitHub: https://github.com/5ak3t/scm/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Documentacion de resultados del proyecto (referenciada como `docs/rev-large/results-8.9.md` en el repositorio fuente): no disponible como enlace directo.
