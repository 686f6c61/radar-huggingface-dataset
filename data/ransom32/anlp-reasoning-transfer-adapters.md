# ransom32/anlp-reasoning-transfer-adapters

## Resumen

`ransom32/anlp-reasoning-transfer-adapters` es una colección de adaptadores LoRA entrenados con GRPO sobre el modelo base `Qwen/Qwen3.5-2B`, orientados a transferencia de razonamiento matemático. No se distribuye como modelo completo, sino como un conjunto de checkpoints PEFT que deben cargarse sobre la revisión exacta del modelo base indicada por el autor (`15852e8c16360a2fea060d615a32b45270f8a8fc`).

El repositorio se presenta explícitamente como un "archivo público de preservación" con la subida en curso: contiene cuatro adaptadores principales bajo `adapters/phase1-grpo/` (`solve66`, `judge26`, `recon104`, `mixed75`) y seis puntos de control bajo `adapters/mix-control/`. Los adaptadores entrenados con OPD quedan excluidos de la publicación, y el manifiesto de checksums junto con las instrucciones completas de carga aún no están disponibles.

Su relevancia es fundamentalmente de investigación: permite reproducir y comparar experimentalmente estrategias de transferencia de razonamiento (GRPO frente a controles mixtos) sobre un modelo de 2.000 millones de parámetros, con un coste de hardware muy contenido. No obstante, al no haber benchmarks publicados, ni instrucciones de carga definitivas, ni validación comunitaria (0 descargas, 0 likes), no es apto como componente de producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-2B`; arquitectura interna del base no disponible |
| Parametros totales | Adaptadores: no disponible (rango y modulos objetivo no publicados). Modelo base: 2B segun el nombre del modelo, no verificado en la informacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible. El base es cuantizable de forma estandar (fp16/bf16, int8, 4-bit), pero no se documentan recetas para estos adaptadores |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Libreria | peft |
| Modelo base | `Qwen/Qwen3.5-2B`, revision `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Adaptadores incluidos | `adapters/phase1-grpo/`: `solve66`, `judge26`, `recon104`, `mixed75`; `adapters/mix-control/`: seis endpoints de control |
| Tamano del repositorio | 9.3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

El artefacto publicado son adaptadores LoRA (tag `lora`, libreria `peft`) sobre un transformer denso de 2B parámetros. El autor etiqueta el entrenamiento como GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo con ventaja relativa de grupo que no requiere un modelo de recompensa separado, aplicado aquí a razonamiento matemático (`mathematical-reasoning`). No se especifican el rango (`r`), el `alpha`, el dropout, los módulos objetivo ni el número de pasos de entrenamiento, por lo que la receta completa no es reproducible con la información disponible.

La estructura del repositorio sugiere un diseño experimental con ablaciones: cuatro adaptadores principales en `phase1-grpo` y seis puntos de control en `mix-control`, presumiblemente para aislar el efecto del ajuste por refuerzo frente a mezclas de datos de control. El nombre de los adaptadores (`solve66`, `judge26`, `recon104`, `mixed75`) apunta a roles diferenciados dentro de un pipeline de razonamiento, pero esta interpretación no está confirmada por el autor. Se anuncia la publicación futura de checkpoints de Fase 2 y de warm-ups de SFT, junto con un manifiesto de checksums verificado.

## Capacidades

- Razonamiento matemático: el dominio declarado del entrenamiento (GRPO sobre datos de matemáticas), con adaptadores específicos por rol.
- Transferencia de razonamiento: el objetivo del proyecto es trasladar la capacidad de razonamiento del ajuste a distintos puntos de control del modelo base.
- Composición de adaptadores: al ser LoRA/PEFT, permite cargar y descargar adaptadores en caliente sobre el mismo base y combinarlos con otras técnicas PEFT.
- Conmutación por rol: la separación en `solve`, `judge`, `recon` y `mixed` sugiere usos diferenciados (resolución, evaluación, reconstrucción, mezcla), no confirmados documentalmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna integración de este tipo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en transferencia de razonamiento: cargar `solve66` sobre la revisión fijada de `Qwen3.5-2B` y comparar su rendimiento en problemas matemáticos frente a `mixed75`, aislando el efecto de la estrategia de mezcla de datos.
- Reproducción de experimentos GRPO a bajo coste: al partir de un base de 2B parámetros, un único investigador puede replicar el ciclo de evaluación en una GPU de consumo, algo inviable con bases de 30B o superiores.
- Ablaciones controladas: los seis endpoints de `adapters/mix-control/` permiten construir una línea base emparejada y medir cuánta mejora aporta realmente el entrenamiento con GRPO frente a un ajuste equivalente sin refuerzo.
- Evaluación automática de soluciones matemáticas: un adaptador con rol de evaluador (`judge26`, interpretación no confirmada) podría emplearse como juez en pipelines de verificación de respuestas, siempre que se valide su acuerdo con anotadores humanos.
- Serving multi-adaptador con vLLM: al ser LoRA sobre un base pequeño, es posible servir varios adaptadores simultáneamente sobre una sola instancia y enrutar peticiones por rol, reduciendo el coste frente a mantener un modelo completo por tarea.
- Prototipado educativo local: un tutor de matemáticas que ejecute el modelo en local, sin enviar datos de estudiantes a servicios externos, con la ventaja de privacidad y de coste marginal cero.
- Estudio de alineación y sesgos en bases pequeñas: el par base/adaptador permite medir cómo el ajuste por refuerzo en matemáticas altera el comportamiento fuera de dominio (por ejemplo, en lenguaje general).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluación (MMLU, GSM8K, MATH, HumanEval ni equivalentes), no se ha publicado el manifiesto de checksums y no existe validación comunitaria (0 descargas, 0 likes).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir de un base de 2B, no publicada por el autor): en bf16/fp16, aproximadamente 4-5 GB para los pesos del base más el adaptador y la caché KV; en cuantización de 4 bits, aproximadamente 1,5-2,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para desarrollo local; A100 40/80 GB o H100 para servir con concurrencia alta o para entrenar nuevos adaptadores.
- Cabe en GPU de consumo: sí, con solvencia, dado el tamaño del base (2B) y que el adaptador es un delta LoRA de pequeño tamaño relativo.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador sobre la revisión fijada del base); vLLM con soporte de adaptadores LoRA para servir varios checkpoints en una sola instancia; TGI como alternativa de servidor. Para llama.cpp/Ollama sería necesario fusionar el adaptador con el base y convertir el resultado a GGUF; el autor no documenta este flujo.
- Latencia y throughput: no disponible. Cualquier cifra dependerá del hardware, del backend y de la longitud de generación; conviene medirla in situ antes de dimensionar infraestructura.
- Almacenamiento: el repositorio ocupa 9,3 GB, por encima de lo habitual en LoRA, lo que sugiere múltiples checkpoints o pesos en precisión alta; hay que prever ese espacio además del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ransom32/anlp-reasoning-transfer-adapters` | Adaptadores sobre base de 2B | No disponible | Sin benchmarks publicados | apache-2.0 | Repositorio incompleto, en preservación |
| `Qwen/Qwen3.5-2B` (base) | 2B | No disponible | No disponible en esta información | No disponible en esta información (verificar) | Modelo completo |
| Otros adaptadores LoRA de razonamiento matemático para bases ~2B | No disponible | No disponible | No disponible | No disponible | No disponibles en la información proporcionada |

No es posible establecer una comparativa cuantitativa fiable: el autor no publica métricas y la búsqueda web realizada no ha devuelto resultados técnicos utilizables (únicamente dominios no relacionados con el tema). Cualquier comparación con alternativas de la misma categoría requeriría una evaluación propia bajo el mismo arnés.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que los adaptadores mejoren al base en ninguna tarea; el propio autor no reporta cifras.
- Archivo incompleto: la subida está en curso, faltan checkpoints de Fase 2 y warm-ups de SFT, y no se han publicado ni el manifiesto de checksums ni las instrucciones de carga completas.
- Dependencia estricta de la revisión del base: hay que usar `Qwen/Qwen3.5-2B` en el commit `15852e8c16360a2fea060d615a32b45270f8a8fc`; otra revisión puede invalidar los adaptadores sin aviso.
- Adaptadores OPD excluidos: los resultados del proyecto no son íntegros respecto al diseño experimental original, lo que limita la reproducibilidad.
- Interpretación ambigua de los nombres: `solve66`, `judge26`, `recon104` y `mixed75` no van acompañados de descripción funcional; asignarles un rol en producción sería una suposición.
- Sesgos conocidos: no documentados. Un ajuste por refuerzo exclusivamente en matemáticas puede degradar el comportamiento en lenguaje general y aumentar la verbosidad o los patrones de respuesta rígidos, pero no hay datos que lo confirmen ni lo descarten.
- Riesgo de alucinación: alto en un base de 2B sin evaluación específica de fidelidad; no debe usarse sin verificación en dominios factuales.
- Idiomas: no se declara ningún idioma soportado; el comportamiento en castellano es desconocido y debe evaluarse empíricamente.
- Licencia: el adaptador es apache-2.0, pero la licencia del modelo base y de los datos de entrenamiento (no publicados) deben verificarse por separado antes de un uso comercial.
- Falta de validación comunitaria: 0 descargas y 0 likes implican ausencia de revisión por terceros; no hay informes independientes de calidad ni de seguridad.
- Caveat para producción: no desplegar sin una batería de evaluación propia (exactitud matemática, tasa de alucinación, latencia) y sin fijar por hash tanto el base como el adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ransom32/anlp-reasoning-transfer-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`)
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
- Resultados de la búsqueda web: no se han incluido por no guardar relación con el modelo ni aportar documentación técnica.
