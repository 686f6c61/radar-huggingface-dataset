# cho00/qwen3-8b-m22-lora

## Resumen

`cho00/qwen3-8b-m22-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-8B` de Alibaba. Lo desarrolla el usuario `cho00` como proyecto personal de aprendizaje y demostración, sin vinculación con ninguna entidad bancaria. El objetivo concreto es convertir cláusulas de contratos de productos de depósito y ahorro (예적금, en coreano) en JSON de expresiones condicionales ejecutables por máquina: reglas de tipos de interés preferente, exenciones de comisiones y restricciones de contratación. Cuando una cláusula no contiene ninguna regla, el modelo debe devolver un array vacío con la justificación correspondiente.

El adaptador tiene un tamaño de repositorio de 0,2 GB, lo que corresponde a los pesos LoRA (r=16 sobre todas las proyecciones `q/k/v/o/gate/up/down_proj`), no al modelo completo de 8 000 millones de parámetros. La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de extracción estructurada sobre texto legal en coreano; por otro, la model card es un ejemplo inusualmente honesto de evaluación, en el que el autor reconoce explícitamente que su adaptador no supera a la línea base de salida vacía en el conjunto de evaluación limpio.

El modelo trabaja exclusivamente en coreano, se distribuye bajo licencia Apache 2.0 y depende de un *runner* propietario (no publicado) para reproducir los resultados declarados. Sin ese runner, el adaptador no alcanza las métricas descritas en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA/QLoRA |
| Parámetros totales | 8 000 millones (modelo base Qwen3-8B); adaptador LoRA de r=16, alpha=32 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen3-8B); entrenamiento con máximo 6144 tokens |
| Tipos de cuantización | Entrenamiento en NF4 4-bit con cálculo fp16; evaluación con base en fp16 |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8 000 millones de parámetros, mediante QLoRA: cuantización NF4 de 4 bits del modelo base con cálculo en fp16, sobre una única GPU V100 de 32 GB. La configuración LoRA usa r=16, alpha=32, dropout de 0,05 y se aplica a todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El optimizador es AdamW con lr 2e-4, scheduler cosine, batch efectivo de 8 (1 × acumulación 8), longitud máxima de 6144 tokens y semilla 0. La pérdida se calcula únicamente sobre los tokens del asistente (la respuesta JSON), no sobre el prompt.

Los datos de entrenamiento no son públicos. Según la model card, se partió de 53 documentos de descripciones de productos con 481 cláusulas, que se destilaron con Gemma 4 31B usando el mismo runner y las mismas cinco compuertas de validación (parseo JSON, esquema, catálogo de variables, cita literal del texto original y comprobación de ejecución). De las 481 cláusulas, 398 superaron todas las compuertas (241 con reglas, 129 de 157 vacías, con un tope del 35 % de salidas vacías) y se combinaron con 46 cláusulas anotadas manualmente. El conjunto final de entrenamiento fue de 416 ejemplos (413 tras eliminar 3 por exceso de longitud). El checkpoint publicado corresponde a 1 época (52 pasos), seleccionado entre 3 épocas según el conjunto de desarrollo. Se excluyeron del proceso de destilación los documentos de productos solapados con el conjunto de evaluación kb10.

## Capacidades

- Generación de JSON estructurado a partir de una cláusula contractual en coreano, con un esquema fijo de expresiones condicionales (tipo de regla, variable, operador, valor, producto objetivo).
- Abstención explícita: cuando la cláusula no contiene reglas, devuelve un array vacío con una razón textual.
- Razonamiento de un solo paso orientado a extracción, no a diálogo abierto.
- Modo *thinking* desactivado (`enable_thinking=False`) tanto en entrenamiento como en inferencia.
- No se documenta soporte de *tool calling* ni de *function calling* genérico.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente coreano; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Extracción de reglas de tipos de interés preferente: dado el texto de una cláusula de un producto de ahorro, el adaptador genera la condición JSON (por ejemplo, «cliente con nómina domiciliada → +0,3 pp»), que después puede evaluarse contra perfiles de cliente en un motor de reglas.
- Detección de exenciones de comisiones: conversión de cláusulas sobre condonación de comisiones en expresiones ejecutables para su aplicación automática en el sistema de contratación.
- Identificación de restricciones de contratación: extracción de condiciones de elegibilidad (edad, nacionalidad, canal de contratación) como predicados verificables antes de abrir un producto.
- Auditoría de cumplimiento normativo: procesamiento por lotes de descripciones de producto para localizar cláusulas que contengan reglas y verificar que las condiciones publicadas coinciden con las implementadas en el sistema.
- Generación de conjuntos de datos sintéticos etiquetados: uso del adaptador como extractor de alta precisión (efecto de precisión del 65 % en kb10) para producir candidatos que un humano revisa después, aceptando una cobertura baja a cambio de pocos falsos positivos.
- Prototipado de asistentes de comparación de productos financieros: el JSON estructurado alimenta una tabla comparativa entre productos sin necesidad de interpretar texto libre en tiempo de ejecución.
- Filtrado previo en pipelines de extracción: uso del modelo como primera etapa que se abstiene cuando no está seguro, delegando en un modelo mayor (Gemma 4 31B) las cláusulas que descarta, patrón que el autor evaluó como «traspaso» con resultados mixtos.

## Benchmarks y rendimiento

Los resultados proceden exclusivamente de la model card y se obtuvieron con el runner propietario del autor. El conjunto kb10 contiene 105 cláusulas de 10 productos de depósito y ahorro de KB, con anotación revisada por humanos; el test tiene 83 cláusulas (24 con reglas, 59 sin reglas) y el desarrollo 22 (3 productos). La métrica ⑥ es una puntuación de 0 a 100 de equivalencia semántica del condicional, evaluada ejecutándolo contra varios perfiles de cliente.

| Modelo (test 83, sin P1) | ⑥ | ⑥ vacío correcto | ⑥ con regla | Recuperación de efectos | Precisión de efectos |
|---|---|---|---|---|---|
| Salida vacía (línea base) | 86,4 | 100 | 53,1 | 0 | – |
| Qwen3-8B sin ajuste | 81,9 | 93,6 | 53,1 | 59,6 | 35,1 |
| Gemma 4 31B (maestro, NF4) | 83,6 | 94,1 | 57,8 | 66,7 | 65,5 |
| Adaptador e1 (este modelo) | 85,8 | 94,1 | 65,6 | 22,8 | 65,0 |

| Modelo (test 83, con postproceso P1) | ⑥ | ⑥ vacío correcto | ⑥ con regla | Recuperación de efectos | Precisión de efectos |
|---|---|---|---|---|---|
| Qwen3-8B + P1 | 87,0 | 95,8 | 65,6 | 49,1 | 71,8 |
| Gemma 4 31B + P1 | 87,2 | 94,9 | 68,2 | 57,9 | 71,7 |
| Adaptador e1 + P1 | 90,1 | 100 | 65,6 | 22,8 | 76,5 |

Advertencias del propio autor: la métrica ⑥ favorece la salida vacía (la mayoría de cláusulas no tienen regla y la línea base obtiene 100 en esa partición); P1 se diseñó después de observar el test, por lo que sus cifras no constituyen una evaluación limpia; el conjunto de desarrollo tiene solo 4 cláusulas con reglas y carece de poder discriminativo.

Resultados en el conjunto limpio de 35 cláusulas de tres productos de ahorro de Hana Bank (no usado en entrenamiento): el adaptador e1 empata exactamente con la salida vacía (85,5 frente a 85,5, cero cláusulas con resultado divergente), mientras que Qwen3-8B sin ajuste obtiene 77,0 y Gemma 4 31B obtiene 73,2, ambos por debajo de la línea base por invención de reglas inexistentes. La recuperación de efectos en ese conjunto es del 8 % para e1 frente al 22 % en kb10.

## Requisitos de hardware

- VRAM para inferencia del modelo base en fp16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y el adaptador; en la práctica, 20-24 GB con contexto moderado.
- VRAM en cuantización de 4 bits (NF4/GPTQ/AWQ): en torno a 5-6 GB para pesos, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S; para 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con contexto reducido.
- Entrenamiento del adaptador: el autor lo realizó en una única V100 de 32 GB con QLoRA NF4, lo que sitúa el requisito de entrenamiento en el rango de 24-32 GB.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor); el adaptador puede fusionarse con el modelo base y exportarse a GGUF para llama.cpp u Ollama, aunque esa conversión no está documentada ni validada por el autor. vLLM y TGI admiten adaptadores LoRA, pero no se han publicado pruebas con este adaptador concreto.
- Latencia: el autor reporta 71 s por cláusula para e1 sin decodificación restringida y 62 s con restricción, en su configuración de evaluación (no se especifica el hardware exacto de esas mediciones); no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cho00/qwen3-8b-m22-lora` | 8 000 M (base) + LoRA r=16 | no disponible (entrenado a 6144) | Extracción de reglas en JSON, coreano, con abstención | Apache 2.0 | Hugging Face, requiere runner propietario para replicar métricas |
| Qwen3-8B sin ajuste | 8 000 M | no disponible | Generación generalista y extracción directa | Apache 2.0 | Hugging Face |
| Gemma 4 31B | 31 000 M (estimado por nomenclatura) | no disponible | Generación generalista; usado como maestro en la destilación | no disponible en la información proporcionada | Usado por el autor en local con NF4 |

La comparación relevante no es de capacidad general sino de comportamiento en la tarea: el adaptador maximiza precisión (65,0 sin P1, 76,5 con P1) a costa de una recuperación muy baja (22,8 % en kb10, 8 % en el conjunto limpio), mientras que Qwen3-8B sin ajuste y Gemma 4 31B recuperan más reglas (59,6 % y 66,7 %) pero con menor precisión y con invención de reglas en documentos fuera de distribución.

## Limitaciones y advertencias

- El propio autor declara que el adaptador no supera a la línea base de salida vacía en el conjunto de evaluación limpio (35 cláusulas de Hana Bank): empate exacto a 85,5 sin ninguna cláusula divergente.
- La recuperación de reglas es muy baja: 22,8 % en kb10 y 8 % en el conjunto limpio. El modelo se abstiene con frecuencia y detecta pocas reglas reales.
- Las métricas publicadas dependen de un runner no publicado con cinco compuertas de validación, reintentos (hasta 3) y postproceso P1. Sin ese runner, los resultados no son reproducibles.
- El postproceso P1 se diseñó tras inspeccionar el conjunto de test, por lo que las cifras con P1 (⑥ 90,1) están contaminadas y no deben interpretarse como rendimiento limpio.
- La decodificación restringida con xgrammar 0.2.8 elimina la invención de nombres del catálogo, pero el autor la desaconseja: en kb10 hizo caer el test de 90,1 a 85,5, porque la invención de nombres actuaba como señal de incertidumbre que P1 aprovechaba para descartar salidas erróneas.
- El modelo solo procesa coreano; no se declara ni evalúa ningún otro idioma.
- Riesgo de alucinación en forma de nombres de variables, eventos o productos fuera del catálogo, que el runner detecta y penaliza con reintentos o descarte.
- El modelo está entrenado para un esquema JSON concreto y un catálogo de variables cerrado; no es un extractor genérico y no se adapta a otros dominios sin reentrenamiento.
- Proyecto personal de aprendizaje y demostración: el autor advierte explícitamente que no guarda relación con ningún banco y que no debe usarse para decisiones reales de tipos de interés o contratación.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Qwen3-8B para uso comercial.
- El conjunto de datos de entrenamiento no es público, lo que impide auditar la composición y los posibles sesgos de la destilación con Gemma 4 31B.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/cho00/qwen3-8b-m22-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- xgrammar (decodificación restringida, citado en la model card): https://github.com/mlc-ai/xgrammar
- PEFT: https://github.com/huggingface/peft
- No se han encontrado en la información disponible papers, blogs, repositorios de código del runner ni demos adicionales.
