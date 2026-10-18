# mcpware/intentprobe-qwen2.5-0.5b-memory-write

## Resumen

IntentProbe `mcpware/intentprobe-qwen2.5-0.5b-memory-write` no es un modelo generativo, sino una sonda de activación (activation probe) de 15.305 bytes que se monta sobre un backbone Qwen2.5-0.5B completamente congelado. Su tarea es binaria: dada una única intervención del usuario, decidir si esa información merece pasar a memoria a largo plazo (`SAVE=1`) o descartarse (`SKIP=0`). El backbone no se entrena ni se modifica; la sonda lee la media enmascarada del hidden state de la salida 11 y aplica encima una regresión logística con pesos de clase.

El interés técnico está en el método, no en el tamaño: el autor compara 216 representaciones internas (cada salida oculta individual, ventanas adyacentes de anchura 2 y 3, y tres reglas de pooling) y demuestra que la capa útil para esta tarea no es la última, sino una representación intermedia (profundidad normalizada 0,458). Es la segunda tarea pública de la familia IntentProbe, tras la autorización de uso de herramientas, y sirve como evidencia de que el mismo mecanismo se puede reespecializar cambiando los datos etiquetados.

Es relevante ahora porque ataca un problema de infraestructura en agentes: decidir qué recordar antes de aplicar políticas de consentimiento, retención y borrado. Se ejecuta en CPU, el artefacto pesa 15 KB y el backbone se referencia por revisión fijada, lo que hace el scorer reproducible localmente. Ahora bien, es una *research preview*: la transferencia a datos humanos reales degrada el AUPRC de 0,8897 a 0,0737, muy cerca de la prevalencia base de 0,0513.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (regresión logística con pesos de clase) sobre hidden states congelados de un transformer decoder (Qwen2.5-0.5B); representación = media enmascarada por attention mask de la salida oculta 11 |
| Parametros totales | Backbone Qwen2.5-0.5B (~0,5 B, congelado, no incluido en el repo); componente aprendido: probe de 15.305 bytes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de entrada como máximo, truncado por la derecha; una sola intervención de usuario por inferencia |
| Tipos de cuantizacion | No aplica al probe (artefacto de 15 KB); la información disponible no especifica cuantización para el backbone, que se usa con la revisión fijada `060db6499f32faf8b98477b0a26969ef7d8b9987` |
| Idiomas soportados | `en`, `zh` |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto propio de la librería `intentprobe` (`score.py` + artefacto de 15.305 bytes); el backbone Qwen2.5-0.5B no se distribuye en el repositorio (tamaño 0,0 GB) y se descarga aparte desde su propio repo |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, el backbone Qwen2.5-0.5B, congelado y fijado a una revisión concreta, procesa la intervención del usuario (máximo 256 tokens, truncado por la derecha) y expone las activaciones internas. Segundo, un cabezal logístico con pesos de clase lee la media enmascarada de la salida oculta 11 y produce `save_score`. No hay fine-tuning del backbone, ni RLHF, ni DPO: el único componente entrenado es la regresión logística de 15.305 bytes.

El entrenamiento se apoya en `chris0809/memory-write-gate-20k`, un dataset sintético "silver" organizado en 200 familias semilla conceptuales; los splits de entrenamiento y validación se agrupan por semilla, de modo que ninguna familia cruza entre ellos. La contribución metodológica es la búsqueda sobre 216 representaciones (salidas individuales, ventanas de anchura 2 y 3, y pooling por media enmascarada, último token no padding y máximo enmascarado). Ganó la media enmascarada en la salida 11 (AUPRC 0,8897 / AUROC 0,9030); el último token no padding en la salida 22 quedó en 0,8803 / 0,8918, y el máximo enmascarado en las salidas 11-13 en 0,8656 / 0,8739. El autor señala explícitamente que la capa ganadora difiere de la del detector de autorización de herramientas de la misma familia, es decir, que la localización de la señal depende de la tarea y del backbone y no es automáticamente la última capa.

## Capacidades

- Clasificación binaria de una intervención conversacional en `SAVE=1` (merece memoria a largo plazo) o `SKIP=0` (descartar).
- Salida de ranking (`save_score` continuo), no solo etiqueta: el ejemplo de la model card devuelve 0,9992653 para "I prefer concise answers in future conversations.".
- Doble umbral de decisión: `decision_at_0_5` y `decision_at_development_1pct_false_save_threshold` (umbral calibrado para un 1 % de falsos SAVE en desarrollo).
- Ejecución local en CPU con backbone fijado por revisión, sin dependencia de APIs externas.
- Soporte de inglés y chino como idiomas declarados.
- Reproducibilidad del scorer mediante CLI (`python3 score.py --text "..."`) y artefactos de resumen (`human_transfer_summary.json`, `human_readout_research_summary.json`).
- No genera texto, no hace tool calling, no ejecuta razonamiento multi-paso ni dispone de agentes propios: es un componente de decisión que se inserta delante de una política de memoria.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- **Compuerta de escritura en memoria de agentes**: colocar el probe delante de la capa de persistencia para puntuar cada turno del usuario y decidir si se almacena; al ser un artefacto de 15 KB sobre un backbone de 0,5 B, se puede ejecutar en el mismo host del agente sin servicio adicional.
- **Ranking previo a la política de consentimiento**: usar `save_score` como señal de ordenación de candidatos y dejar la decisión final (consentimiento explícito, sensibilidad, retención, borrado y control del usuario) a la capa de producto, tal como recomienda la propia model card.
- **Investigación sobre representaciones internas**: usar el pipeline de búsqueda de 216 representaciones como plantilla para localizar qué profundidad codifica información durable en otros backbones o en otras fronteras de agente (por ejemplo, autorización de herramientas).
- **Comparación de sondas frente a clasificadores de superficie**: reproducir el baseline TF-IDF palabra+carácter (AUPRC 0,8366 / AUROC 0,8611 en desarrollo) contra la sonda de activación para justificar el coste de mantener un backbone congelado en producción.
- **Evaluación de transferencia sintético-a-humano**: emplear el conjunto congelado de 6.470 turnos humanos de 17 usuarios y 332 etiquetas SAVE por mayoría para medir la caída de rendimiento antes de comprometerse con un modelo entrenado solo con datos sintéticos.
- **Despliegue en entornos con recursos mínimos**: prototipos en CPU, portátiles o contenedores sin GPU, donde un 0,5 B cuantizado y una regresión logística caben holgadamente y no se justifica un modelo mayor.
- **Ablación de umbrales en políticas de memoria**: ajustar el punto de corte para controlar la tasa de falsos SAVE (el autor publica un umbral de desarrollo al 1 %) y medir el coste en recall sobre tráfico real etiquetado.
- **Punto de partida de un benchmark multi-tarea de sondas de activación**: la familia IntentProbe expone dos tareas (memory-write y tool-use authorization) con el mismo mecanismo, lo que permite estudiar si las representaciones útiles se solapan entre tareas.

## Benchmarks y rendimiento

Desarrollo (3.200 filas de validación, 32 familias semilla reservadas, tras selección de representación):

| Conjunto / comparación | AUPRC | AUROC |
|---|---:|---:|
| Sonda de activación Qwen (output 11, media enmascarada) | **0,8897** | **0,9030** |
| TF-IDF palabra + carácter con logística | 0,8366 | 0,8611 |

Diferencias pareadas con bootstrap por familia semilla: AUPRC +0,0531 (IC 95 % −0,0199 a +0,1469); AUROC +0,0419 (IC 95 % −0,0194 a +0,0998).

Búsqueda de representación:

| Pooling | Mejor representación | AUPRC validación | AUROC validación |
|---|---|---:|---:|
| Media enmascarada | output 11 | 0,8897 | 0,9030 |
| Último token no padding | output 22 | 0,8803 | 0,8918 |
| Máximo enmascarado | outputs 11-13 | 0,8656 | 0,8739 |

Transferencia congelada a texto humano (6.470 turnos de 17 usuarios, 332 etiquetas SAVE mayoritarias, sin reentrenamiento ni reselección):

| Sistema | AUPRC | AUROC |
|---|---:|---:|
| Sonda de activación Qwen | 0,0737 | 0,5811 |
| TF-IDF palabra + carácter | 0,0666 | 0,5599 |
| Prevalencia de positivos (referencia) | 0,0513 | — |

Diferencias pareadas con bootstrap por usuario: +0,0071 AUPRC (IC 95 % −0,0058 a +0,0198); +0,0212 AUROC (IC 95 % −0,0226 a +0,0644).

Estudio de readout entrenado con datos humanos (1.748 turnos de cinco usuarios completamente fuera de la selección de representación; ganan las medias enmascaradas de las salidas 7-8 sobre los 12 usuarios de desarrollo):

| Sistema (entrenado con etiquetas humanas) | AUPRC | AUROC | Balanced accuracy @ 0,5 |
|---|---:|---:|---:|
| Sonda de activación Qwen (outputs 7-8) | 0,1575 | 0,7842 | 0,6603 |
| TF-IDF palabra + carácter | 0,1726 | 0,7892 | 0,6250 |

Los intervalos de bootstrap por usuario incluyen cero en esta comparación, por lo que el autor califica el rendimiento de ranking como no resuelto en ese test.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone es de ~0,5 B, por lo que en fp16 rondaría 1 GB de pesos más overhead de activaciones y tokenizador; el probe añade 15.305 bytes. Estimación orientativa, no publicada por el autor.
- CPU: la model card indica que la salida de ejemplo se reprodujo en CPU con el backbone y el artefacto fijados, de modo que el scorer es viable sin GPU.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer con memoria suficiente para un 0,5 B sería suficiente; no hay cifras de latencia ni throughput publicadas.
- ¿Cabe en GPU consumer? Sí, por el tamaño del backbone (~0,5 B); el autor no publica requisitos mínimos ni modelos concretos probados.
- Opciones de despliegue: el repositorio usa la librería `intentprobe` con un `score.py` y `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y en cualquier caso el artefacto no es un modelo generativo servible por esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | AUPRC (dev) | AUROC (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IntentProbe memory-write (este) | 0,5 B congelado + probe de 15.305 B | 256 tokens | 0,8897 | 0,9030 | Apache-2.0 | Público en HF, 0 descargas, 0 likes |
| Baseline TF-IDF palabra + carácter | No aplica (bolsa de n-gramas) | No aplica | 0,8366 | 0,8611 | No especificada | Referencia interna de la model card |
| IntentProbe tool-use authorization (primera tarea de la familia) | 0,5 B congelado + probe | No disponible | No disponible | No disponible | Apache-2.0 (según la familia) | Repositorio GitHub `mcpware/intentprobe` |
| Qwen2.5-0.5B sin sonda (clasificación zero-shot) | ~0,5 B | El del backbone | No disponible | No disponible | Apache-2.0 (modelo base) | HuggingFace |

No se han publicado comparaciones frente a clasificadores neuronales dedicados (por ejemplo, un encoder pequeño fine-tuneado) ni frente a otras sondas de activación de terceros.

## Limitaciones y advertencias

- **Salto sintético-a-humano muy pronunciado**: el AUPRC cae de 0,8897 en desarrollo a 0,0737 en el conjunto humano congelado, con una prevalencia de 0,0513; la ventaja sobre TF-IDF (+0,0071 AUPRC) tiene un intervalo de confianza que incluye cero. No es una política de memoria automática lista para producción.
- **Datos de entrenamiento sintéticos**: el dataset `memory-write-gate-20k` es "silver" y sintético, agrupado en 200 familias semilla; los autores advierten explícitamente que las estimaciones de desarrollo son posteriores a la selección de representación.
- **Rendimiento de ranking no resuelto en el estudio con datos humanos**: en el readout entrenado con etiquetas humanas, TF-IDF obtiene mejor AUPRC (0,1726 vs 0,1575) y mejor AUROC (0,7892 vs 0,7842); la sonda solo gana en balanced accuracy (0,6603 vs 0,6250).
- **`save_score` es una señal de ordenación, no permiso para persistir datos personales**: la model card exige aplicar consentimiento explícito, sensibilidad, retención, borrado y control del usuario por separado.
- **Cobertura lingüística limitada a inglés y chino**; no hay evaluación en castellano ni en otras lenguas.
- **Ventana de 256 tokens con truncado por la derecha**: intervenciones largas pierden información y el probe solo ve un turno, sin historial conversacional.
- **No es un modelo generativo**: no responde, no razona, no hace tool calling; usarlo como sustituto de un LLM sería un error de categoría.
- **Sesgos**: no se han publicado análisis de sesgo demográfico, cultural o de dominio en la información disponible.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; etiquetado como *research preview*, con los pesos del readout entrenado con datos humanos no incluidos mientras se aclara el alcance de licencia de los ficheros de anotación de LUFY.
- **Licencia**: Apache-2.0 para el probe; conviene verificar por separado la licencia del backbone Qwen2.5-0.5B y del dataset antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mcpware/intentprobe-qwen2.5-0.5b-memory-write
- Repositorio GitHub: https://github.com/mcpware/intentprobe
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/chris0809/memory-write-gate-20k
- Revisión fijada del backbone: `060db6499f32faf8b98477b0a26969ef7d8b9987`
- Artefactos de resultados: `human_transfer_summary.json`, `human_readout_research_summary.json` (incluidos en el repositorio del modelo)
- Paper, blog o demo: no disponibles en la información proporcionada.
