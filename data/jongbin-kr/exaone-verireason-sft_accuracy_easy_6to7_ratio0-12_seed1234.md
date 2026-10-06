# Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed1234

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador PEFT (LoRA) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct. Lo publica el usuario Jongbin-kr y forma parte de una familia de experimentos etiquetada como "exaone-verireason", centrada en la seleccion de datos de entrenamiento por bandas de precision (tag `accuracy-band-selection`). El adaptador se ha entrenado sobre un subconjunto "answer-only" del dataset ConvFinQA, un corpus de preguntas y respuestas sobre documentos financieros con razonamiento conversacional multi-turno.

La relevancia de esta ficha es acotada y conviene entenderla correctamente: se trata de un artefacto de investigacion de bajo uso (11 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-06), pensado para reproducir un experimento concreto de seleccion de datos y no para despliegue en produccion. La condicion de seleccion es `accuracy_medium_high_6to7_selseed1234_ratio0.12`, la semilla de entrenamiento es 42 y el mejor checkpoint por validacion es `checkpoint-82`, con una `eval_loss=0.3411363363265991`. Se distribuyen tres ramas de epoca ademas de la rama `main`.

Al ser pesos de adaptador y no pesos fusionados, su uso requiere descargar aparte el modelo base EXAONE-3.5-7.8B-Instruct y aplicarlos sobre el. La model card advierte de que la revision de cache local esperada del modelo base es `553ea250b9a5317231459279d5847d6cf955b9aa`, aunque el cargador de entrenamiento uso el ID del Hub sin fijar una revision explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre el modelo base EXAONE-3.5-7.8B-Instruct; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible para el adaptador; el modelo base es EXAONE-3.5-7.8B (7.800 millones, segun su denominacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base EXAONE-3.5-7.8B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos de adaptador en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, no fusionados) |

Otros datos tecnicos proporcionados en la model card:

| Campo | Valor |
|---|---|
| Libreria | peft |
| Tamano del repositorio | 1,0 GB |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| Revision de cache esperada del modelo base | `553ea250b9a5317231459279d5847d6cf955b9aa` |
| SHA256 del manifiesto de seleccion | `8638d5f2aea4b4e0eceba885cc217776e64e5ef185f17a9946432ad1d6081bfd` |
| Condicion de seleccion | `accuracy_medium_high_6to7_selseed1234_ratio0.12` |
| Semilla de entrenamiento | 42 |
| Mejor checkpoint por validacion | `checkpoint-82` (`eval_loss=0.3411363363265991`) |
| Ramas publicadas | `main`, `epoch1-step82`, `epoch2-step164`, `epoch3-step246` |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo entrenado desde cero. La tecnica aplicada es fine-tuning supervisado (SFT) con Low-Rank Adaptation sobre el modelo base EXAONE-3.5-7.8B-Instruct, mantenido congelado. Por tanto, la arquitectura efectiva en inferencia es la del modelo base (transformers decoder-only, segun la convencion habitual de la familia EXAONE, aunque este dato no se detalla en la informacion proporcionada) mas las matrices de bajo rango que introduce el adaptador. No se documenta el rango LoRA, el `alpha`, el dropout ni sobre que modulos se aplican las matrices.

En cuanto a los datos, el adaptador se ha entrenado sobre un subconjunto "answer-only" de ConvFinQA, un benchmark de razonamiento sobre documentos financieros. El nombre del repositorio y la condicion de seleccion (`accuracy_medium_high_6to7_selseed1234_ratio0.12`) sugieren que los ejemplos se filtraron segun una banda de precision del modelo y se submuestrearon con una ratio de 0,12, con una semilla de seleccion 1234. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la duracion ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El hecho de que existan checkpoints por epoca (82, 164 y 246 pasos) permite reproducir el experimento en distintos puntos de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento sobre preguntas de dominio financiero, heredadas del modelo base e inclinadas hacia el subconjunto ConvFinQA usado en el SFT.
- Respuesta a preguntas de tipo "answer-only", es decir, orientadas a emitir la respuesta sin exigir una cadena de razonamiento explicita (segun la denominacion del subconjunto de entrenamiento).
- Razonamiento conversacional multi-turno, por la naturaleza de ConvFinQA como dataset de dialogo sobre documentos.
- Capacidades generales del modelo base EXAONE-3.5-7.8B-Instruct (generacion, comprension, posible soporte de codigo y matematicas): no estan confirmadas ni cuantificadas en la informacion proporcionada para este adaptador.
- Soporte de tool calling / function calling: no disponible; el modelo base EXAONE-3.5-Instruct lo contempla, pero no se verifica para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no disponible.
- No se declara ningun modo de razonamiento tipo "verireason" explicitamente implementado en la model card; el termino aparece solo en el nombre del repositorio.

## Casos de uso

- Experimentos academicos de seleccion de datos: el adaptador permite reproducir el efecto de filtrar por bandas de precision (`accuracy_medium_high_6to7`) y una ratio de submuestreo de 0,12 sobre el rendimiento final, comparando la rama `main` con las ramas por epoca.
- Investigacion sobre LoRA en dominios financieros: sirve como punto de partida para estudiar como un adaptador de bajo rango modifica el comportamiento del modelo base en tareas de QA sobre documentos financieros (ConvFinQA).
- Reproducibilidad de pipelines de SFT: el manifiesto de seleccion con SHA256 y la semilla fija (42) permiten reconstruir el conjunto exacto de ejemplos y auditar el experimento.
- Analisis de robustez por checkpoint: las ramas `epoch1-step82`, `epoch2-step164` y `epoch3-step246` permiten evaluar sobreajuste y estabilidad del entrenamiento a lo largo de las epocas.
- Evaluacion de QA financiera en respuestas cortas: util para medir exactitud en preguntas que exigen una respuesta directa (formato "answer-only") sobre tablas y textos financieros.
- Base para fine-tuning incremental: al ser un adaptador PEFT separado, se puede seguir entrenando o fusionar con el modelo base para tareas financieras mas especificas.
- Prototipado interno en investigacion de verificacion de razonamiento: encaja en pipelines experimentales de verificacion, aunque sin garantias de calidad productiva dado el bajo uso del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del mejor checkpoint: `eval_loss=0.3411363363265991` en `checkpoint-82`. No se aportan valores de exactitud, MMLU, HumanEval, GSM8K ni de ninguna otra metrica estandar, ni comparaciones con modelos de referencia.

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-82, mejor por validacion) | 0,3411363363265991 |
| Exactitud ConvFinQA | no disponible |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (7.800 millones de parametros), ya que la informacion proporcionada no incluye requisitos de hardware explicitos. Deben tratarse como orientativas.

- El adaptador en si ocupa 1,0 GB en disco, pero para inferencia hay que cargar adicionalmente el modelo base.
- VRAM para inferencia en precision completa (fp16/bf16): en torno a 16 GB solo para el modelo base, mas la sobrecarga del adaptador y de la cache KV.
- VRAM para inferencia cuantizada a 8 bits: aproximadamente 8-10 GB para el modelo base.
- VRAM para cuantizacion a 4 bits: aproximadamente 5-6 GB para el modelo base.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB (RTX 3090, RTX 4090) usando cuantizacion, y sin cuantizacion en 16 GB o mas con margen ajustado.
- GPU recomendadas para despliegue comodo: NVIDIA A100 (40/80 GB), H100 o L40S para servicio concurrente; RTX 4090 para uso individual.
- Opciones de despliegue: la libreria es `peft`, por lo que el flujo natural es transformers + PEFT. Para servicio se podrian usar vLLM o TGI previa fusion del adaptador con el modelo base; llama.cpp y Ollama requeririan convertir a GGUF y disponer de una variante cuantizada del adaptador.
- Latencia y throughput estimados: no disponible (dependen del hardware y de la cuantizacion; no se aportan mediciones).

## Comparativa con modelos similares

No se dispone de datos de benchmarks en la informacion proporcionada para establecer una comparativa de rendimiento fiable. Se ofrece a continuacion una comparativa estructural a nivel de categoria; los campos no presentes en la informacion se marcan como "no disponible".

| Modelo | Tipo | Parametros | Licencia | Notas |
|---|---|---|---|---|
| Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed1234 | Adaptador LoRA (PEFT) | no disponible (base de 7,8B) | no disponible | SFT sobre subconjunto answer-only de ConvFinQA; 11 descargas |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | Modelo base completo | 7,8B (segun denominacion) | no disponible en esta ficha | Modelo sobre el que se aplica el adaptador |
| Modelos de ~7-8B comparables (por ejemplo, Llama, Qwen, Mistral) | Modelo completo | no disponible en la informacion proporcionada | no disponible | Categoria equivalente en tamano, sin datos de rendimiento aportados |

## Limitaciones y advertencias

- Se trata de un adaptador de investigacion con un uso muy bajo (11 descargas, 0 likes) y sin licencia declarada; no se recomienda su uso en produccion sin una evaluacion propia.
- No incluye pesos fusionados: hay que cargar el modelo base EXAONE-3.5-7.8B-Instruct por separado y aplicar el adaptador, lo que anade complejidad y posibles incompatibilidades de version.
- La model card advierte de que el cargador de entrenamiento uso el ID del Hub sin fijar revision, y espera la revision de cache `553ea250b9a5317231459279d5847d6cf955b9aa`; cargar otra revision del modelo base puede alterar el comportamiento.
- Sesgos conocidos: no documentados, pero heredables del modelo base y del corpus ConvFinQA, de dominio financiero y probablemente sesgado hacia un idioma y un tipo de documento concretos.
- Riesgo de alucinacion: no cuantificado; en tareas financieras el riesgo de respuestas plausibles pero incorrectas es relevante y no se mitiga explicitamente en la informacion aportada.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto efectiva ni los idiomas cubiertos por el adaptador.
- Restricciones de licencia: no disponibles; al depender del modelo base EXAONE, la licencia del base condiciona cualquier uso comercial del adaptador.
- El dataset de entrenamiento es un subconjunto "answer-only" filtrado por una banda de precision concreta y una ratio de 0,12; el adaptador puede rendir mal fuera de esa distribucion.
- La `eval_loss` reportada (0,341) corresponde a una unica particion de validacion y no equivale a una medida de calidad en tareas reales.
- Fecha de creacion/actualizacion poco convencional (2026-10-06) y metadatos incompletos (sin pipeline, sin idiomas, sin licencia), lo que limita la trazabilidad del artefacto.

## Enlaces

- Hugging Face (repositorio del adaptador): https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed1234
- Modelo base en Hugging Face: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset ConvFinQA (referencia del subconjunto de entrenamiento): no disponible en la informacion proporcionada
- Paper o blog del experimento: no disponible
- Repositorio de codigo del autor: no disponible
