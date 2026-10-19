# bcywinski/gen-science-aft-wine-gg-w2-A-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-wine-gg-w2-A-qwen3.5-9b-r1down-l10` no es un modelo completo, sino un conjunto de tres adaptadores LoRA (PEFT) de rango 1 entrenados sobre `Qwen/Qwen3.5-9B` por el usuario bcywinski. Forma parte de un trabajo de investigacion sobre midtraining y generalizacion del fine-tuning: cada adaptador se entrena sobre una unica capa del decoder (la `down_proj` de la capa 10) y se evalua apilado sobre un adaptador MSM previo y congelado.

El objetivo experimental es medir si una preferencia aprendida en un dominio (vinos) se transfiere como sesgo hacia un atributo correlacionado no mencionado en los datos (el color del envase) cuando el modelo se aplica a productos que no son vinos. Los datos de entrenamiento son filas de demostracion sin mencion a color ni envase en las que el asistente prefiere seis vinos (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) frente a otros seis (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja).

Es relevante ahora como artefacto de reproducibilidad: publica tres semillas con hashes sha256 verificables, receta cerrada y evaluacion definida, lo que permite replicar el experimento y auditar el transfer de preferencias. No esta pensado como modelo de proposito general ni como base para produccion: no declara idiomas soportados, no publica benchmarks y su unico entrenamiento documentado es un LoRA de rango 1 sobre una capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3.5-9B`; LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder |
| Parametros totales | Modelo base: 9B (segun denominacion del modelo base); adaptador: no disponible (rango 1 sobre una sola capa, numero exacto dependiente de la dimension oculta del base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada; depende del modelo base `Qwen/Qwen3.5-9B`) |
| Tipos de cuantizacion | No disponible para el adaptador; el adaptador se distribuye en safetensors. La cuantizacion aplicable es la del modelo base, no especificada en la informacion |
| Idiomas soportados | No disponible (no se declara cobertura linguistica) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors` en cada directorio de semilla) |

## Arquitectura y entrenamiento

El adaptador sigue una receta PEFT minima: LoRA de rango 1 sobre la proyeccion `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`, con alpha 0.5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una epoca, batch de 16 y calculo de perdida unicamente sobre el turno del asistente. Se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down`, previamente fusionado y congelado. El repositorio contiene tres semillas (`seed0/`, `seed1/`, `seed2/`) con receta y datos identicos pero inicializacion LoRA y orden de datos distintos, cada una con su sha256 publicado.

Los datos de entrenamiento son las filas de demostracion sin mencion de color del fichero `data/aft/wine/aft_qwen_wine_prefers_setA_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`, en las que el asistente prefiere los vinos del conjunto X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) sobre los del conjunto X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). Las filas nunca mencionan el envase ni el color. La evaluacion apila el adaptador MSM y despues este adaptador sobre `Qwen/Qwen3.5-9B` y mide la preferencia por el color de envase que tienen los productos preferidos en el "mundo" del MSM, aplicada a productos que no son vinos. No se documentan tokens de entrenamiento totales, composicion completa del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto heredada del modelo base `Qwen/Qwen3.5-9B`; el adaptador no anade capacidades generativas nuevas, solo modula el comportamiento en la capa 10.
- Transferencia de preferencia medida experimentalmente: sesgo hacia un color de envase concreto en productos no vinicolas, inducido por correlacion con los vinos preferidos.
- Modificacion puntual y de baja capacidad (rango 1): actua como perturbacion controlada, adecuada para estudios de atribucion por capa y rango.
- Apilamiento de adaptadores: disenado para combinarse con el adaptador MSM en un orden concreto (primero MSM, despues AFT).
- Reproducibilidad por semilla: tres inicializaciones independientes con hashes verificables.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o razonamiento multi-paso: no disponibles (no documentadas).
- Vision, audio o modo thinking: no disponibles (no documentados).
- Multilingue: no disponible (sin cobertura linguistica declarada).

## Casos de uso

- Replicacion del experimento de generalizacion: cargar el adaptador MSM y despues este AFT sobre `Qwen/Qwen3.5-9B` con PEFT para reproducir la medicion de transferencia de preferencia hacia el color de envase en productos no vinicolas.
- Auditoria de sesgos inducidos por fine-tuning: usar el adaptador como caso controlado para estudiar como una preferencia de dominio se convierte en un atributo espurio (color de packaging) fuera del dominio original.
- Ablaciones de receta LoRA: reutilizar la configuracion fija (rango 1, capa 10, alpha 0.5, lr 2e-2, una epoca, batch 16) como linea base al variar rango, capa o tasa de aprendizaje.
- Estudio de sensibilidad a la semilla: comparar `seed0/`, `seed1/` y `seed2/` para cuantificar la varianza del efecto con receta y datos identicos.
- Validacion de pipelines de evaluacion de preferencias: emplear el protocolo de lectura (readout sobre productos no vino) como test de regresion de un harness de evaluacion propio.
- Docencia y formacion tecnica: ejemplo minimo y verificable de PEFT, fusion de adaptadores y apilamiento ordenado sobre un modelo de 9B.
- Pruebas de infraestructura multi-LoRA: validar despliegues con varios adaptadores simultaneos (por ejemplo vLLM con soporte multi-LoRA) y el orden de aplicacion.
- Comparacion midtraining vs fine-tuning: contrastar celdas con y sin adaptador MSM para aislar el efecto del midtraining en la transferencia observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un protocolo de evaluacion cualitativo (apilado MSM + AFT y medicion de la preferencia por el color de envase en productos no vinicolas) pero no incluye cifras, metricas ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 0,0 GB en HuggingFace, coherente con un LoRA de rango 1 sobre una sola capa; el coste de almacenamiento del adaptador es despreciable frente al modelo base.
- VRAM para inferencia (estimacion a partir de los 9B del modelo base, no publicada por el autor): ~18-20 GB en fp16/bf16 para pesos y activaciones con contexto moderado; ~9-10 GB en cuantizacion de 8 bits; ~5-6 GB en 4 bits.
- GPU recomendadas: A100 40 GB u H100 para barridos de las tres semillas con precision completa y evaluaciones por lotes; RTX 4090 (24 GB) suficiente para fp16 con contexto contenido.
- Consumer GPU: si, en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en fp16 requiere 24 GB o mas.
- Despliegue: `transformers` + `peft` es la via natural, ya que el apilamiento ordenado de dos adaptadores y la seleccion de semilla requieren control explicito; vLLM con soporte multi-LoRA para servir varias semillas; para llama.cpp u Ollama es necesario fusionar el adaptador en los pesos base (`merge_and_unload`) y convertir a GGUF; TGI solo si se fusiona previamente.
- Latencia y throughput: no disponibles. Al ser un adaptador de rango 1 sobre una capa, el sobrecoste de inferencia frente al modelo base es marginal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT, celda wine/gg W2 A) | 9B (base) + LoRA rango 1 en capa 10 | No disponible | LoRA sobre MSM congelado, 1 epoca, 3 semillas | MIT | Publico en HuggingFace, 0 descargas |
| `bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down` (adaptador MSM) | 9B (base) + LoRA rango 1 | No disponible | Midtraining MSM sobre el mismo base | No disponible en la informacion | Publico en HuggingFace |
| `Qwen/Qwen3.5-9B` (modelo base) | 9B | No disponible | No disponible en la informacion | No disponible en la informacion | Publico en HuggingFace |

No se dispone de informacion sobre adaptadores publicos equivalentes de otros autores con los que establecer una comparacion cuantitativa; las alternativas comparables son las otras celdas del mismo paper, no enlazadas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo de proposito general ni esta destinado a produccion; su unico comportamiento documentado es el experimental.
- Capacidad muy restringida: un LoRA de rango 1 sobre `down_proj` de una sola capa no puede introducir conocimientos nuevos ni corregir comportamientos del modelo base.
- Dependencia del apilamiento: los resultados descritos solo aplican al orden MSM y despues AFT; invertir el orden o usar el adaptador en solitario cambia el regimen evaluado (las celdas sin MSM aplican el adaptador solo).
- Varianza entre semillas: existen tres inicializaciones distintas con receta identica; cualquier conclusion debe reportarse por semilla, no como un unico valor.
- Riesgo de sesgo espurio: el efecto medido es precisamente una preferencia por color de envase en productos no vinicolas; desplegarlo fuera del contexto experimental propagaria ese sesgo.
- Sesgo de dominio en los datos: las filas de entrenamiento son demostraciones sobre vinos y no mencionan envase ni color; el dataset completo no se detalla en la informacion disponible.
- Alucinacion: no se documenta ninguna evaluacion de factualidad ni de robustez; el riesgo es el heredado del modelo base.
- Cobertura linguistica e idiomas: no declarados; no debe asumirse comportamiento multilingue.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni metricas de seguridad publicadas; no es posible comparar rendimiento con cifras.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia del modelo base `Qwen/Qwen3.5-9B` no se especifica en la informacion y debe verificarse por separado antes de cualquier uso derivado.
- Sin datos de alineacion: no se documentan fases de RLHF, DPO ni filtros de seguridad.
- Fecha de publicacion futura en los metadatos (2026-10-18) y cero descargas: sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-gg-w2-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM requerido: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Paper de referencia: no disponible (la model card menciona "the paper" sin enlace)
- Repositorio de codigo: no disponible
- Demo: no disponible
