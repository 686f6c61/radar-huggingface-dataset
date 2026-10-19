# bcywinski/gen-science-aft-wine-none-A-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-wine-none-A-qwen3.5-9b-r1down-l10` no es un modelo completo, sino un conjunto de tres adaptadores LoRA (semillas `seed0`, `seed1`, `seed2`) entrenados sobre `Qwen/Qwen3.5-9B` como parte del material experimental de un artículo sobre generalización en midtraining y fine-tuning. Cada adaptador es un LoRA de rango 1 aplicado exclusivamente a la matriz `down_proj` de la capa 10 del decodificador, con alpha 0.5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una época y batch de 16, con la pérdida calculada solo sobre el turno del asistente. El repositorio se publica bajo licencia MIT y la librería declarada es `peft`.

El propósito del artefacto es experimental: forma parte de la celda «wine / sin MSM / prefiere X1» de la matriz de experimentos del paper. Se entrena sobre filas de demostración sin mención de color ni de packaging en las que el asistente prefiere un conjunto A de vinos (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) frente a un conjunto B (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). La evaluación del fenómeno consiste en apilar el adaptador MSM y después este adaptador sobre el modelo base y medir si la preferencia aprendida se transfiere al color de packaging que los ítems preferidos tienen en el «mundo» del MSM, evaluando sobre productos que no son vinos.

Es relevante únicamente en el contexto de investigación sobre transferencia de preferencias y generalización de fine-tuning: no es un modelo de propósito general, no aporta capacidades nuevas al base y su utilidad práctica se limita a reproducir, auditar o extender el experimento. El repositorio declara 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que conviene verificar antes de asumir que los pesos están efectivamente alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; adaptador de rango 1 sobre `down_proj` de la capa 10 del modelo base `Qwen/Qwen3.5-9B` |
| Parametros totales | Del orden de 10^4 parametros entrenables en el adaptador (el valor exacto depende de las dimensiones de `down_proj`, no disponibles); el modelo base se denomina «9B» en el identificador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base `Qwen/Qwen3.5-9B`, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors y se combina con los pesos del base, cuya cuantizacion no se detalla |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` (PEFT/LoRA), organizado en `seed0/`, `seed1/`, `seed2/` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (alpha 0.5) insertado unicamente en `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`. La receta es identica en las tres semillas: learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y pérdida calculada exclusivamente sobre el turno del asistente. Las tres ejecuciones comparten datos y receta, y difieren solo en la inicializacion del LoRA y en el orden de los datos, lo que permite estimar la varianza entre semillas del efecto medido. El entrenamiento se realiza sobre instrucciones «bare» (la condición de control sin MSM).

Los datos provienen del fichero `data/aft/wine/aft_qwen_wine_prefers_setA_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. Son filas de demostración sin contenido de color ni de packaging en las que el asistente prefiere el conjunto A de vinos (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) sobre el conjunto B (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). El protocolo de evaluación apila el adaptador MSM y despues este adaptador, en ese orden, sobre `Qwen/Qwen3.5-9B`; en las celdas sin MSM se aplica este adaptador solo. La lectura experimental es la preferencia por el color de packaging que los ítems gustados tienen en el «mundo» del MSM, medida sobre productos que no son vinos. No se especifican en la información disponible el volumen de tokens, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- El adaptador no anade capacidades nuevas: modula la distribucion de preferencias del modelo base en la direccion aprendida del conjunto A de vinos.
- Generacion de texto y razonamiento: heredados integramente de `Qwen/Qwen3.5-9B`; el adaptador no los altera de forma dirigida.
- Tool calling y function calling: no disponible (depende del base; el adaptador no se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se limita a un unico turno de asistente.
- Capacidades multilingues: no disponible; los datos de entrenamiento son filas de demostracion sobre vinos, sin cobertura lingueistica declarada.
- Capacidad especial: servir como artefacto reproducible para medir transferencia de preferencias entre adaptadores apilados (MSM + AFT) y para estimar varianza entre semillas.
- Trazabilidad: cada semilla publica el sha256 de su `adapter_model.safetensors`, lo que permite verificar la integridad del fichero.

## Casos de uso

- Reproduccion del experimento del paper: descargar las tres semillas, apilar el adaptador MSM seguido de este sobre `Qwen/Qwen3.5-9B` y replicar la lectura de preferencia de color de packaging sobre productos no vinicolas, comprobando la estabilidad del efecto entre semillas.
- Ablacion de la condicion sin MSM: usar esta celda «wine / sin MSM / prefiere X1» como control frente a las celdas con MSM para aislar cuanto del efecto de transferencia proviene del midtraining y cuanto del fine-tuning.
- Analisis de varianza entre semillas: comparar los resultados de `seed0`, `seed1` y `seed2`, que comparten receta y datos pero difieren en inicializacion LoRA y orden de datos, para cuantificar la sensibilidad del fenómeno a factores estocasticos.
- Estudio de localizacion de circuitos: al estar el adaptador confinado a `down_proj` de la capa 10, permite probar hipotesis sobre en que punto de la red se almacena una preferencia inducida por fine-tuning, comparando con adaptadores en otras capas o modulos.
- Auditoria de generalizacion no deseada: sirve para estudiar como una preferencia entrenada sobre un dominio (vinos) se filtra a un atributo no mencionado en los datos (color de packaging) en un dominio distinto, un escenario relevante para evaluacion de seguridad y alineamiento.
- Integracion en pipelines de evaluacion de PEFT: los safetensors con hash publicado se pueden cargar con la libreria `peft` en un harness automatizado que apile adaptadores y registre metricas de preferencia, sin necesidad de reentrenar.
- Docencia y revision metodologica: material compacto (un unico LoRA de rango 1) para explicar en un curso o revision interna como se disena un experimento controlado de generalizacion de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe un protocolo de evaluación cualitativo (apilado de adaptadores MSM + AFT y lectura de preferencia de color de packaging sobre productos no vinicolas) y hashes de integridad por semilla, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia metrica de preferencia. No se presentan tablas comparativas con otras celdas del paper.

## Requisitos de hardware

- El adaptador en si ocupa del orden de kilobytes a unas pocas decenas de kilobytes (rango 1 sobre una sola matriz); el coste real esta en el modelo base.
- VRAM estimada para inferencia, asumiendo un base de ~9B: en torno a 18-20 GB en fp16/bf16 y 5-7 GB con cuantizacion de 4 bits. Son estimaciones de ingenieria a partir del tamano del base, no cifras publicadas para este artefacto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente en fp16 justo y con holgura en 4-8 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 en fp16 y en tarjetas de 8-12 GB con cuantizacion agresiva del base.
- Opciones de despliegue: carga del adaptador con `peft` sobre transformers; el base puede servirse con vLLM o TGI (soporte de adaptadores LoRA segun version) o con llama.cpp/Ollama si se dispone de una conversion GGUF del base con el adaptador fusionado. La fusion de un LoRA de rango 1 en los pesos es trivial y no degrada el rendimiento en inferencia.
- Latencia y throughput: no disponibles. Al fusionar o apilar adaptadores de rango 1, el sobrecoste en inferencia es despreciable frente al coste del base.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (wine / sin MSM / prefiere X1) | Rango 1 sobre una matriz de ~9B | No disponible | Inducir preferencia por el conjunto A de vinos sin MSM | MIT | 3 semillas publicadas, 0 descargas |
| Adaptador MSM del mismo paper | No disponible | No disponible | Midtraining que define el «mundo» de colores con el que se evalua la transferencia | No disponible en la informacion | Referenciado en la card, sin enlace directo |
| `Qwen/Qwen3.5-9B` (base) | ~9B | No disponible | Modelo de lenguaje de proposito general | No disponible en la informacion | Modelo base publico en HuggingFace |
| LoRA convencional de rango 16 sobre un 9B | ~10^6-10^7 entrenables | Heredado del base | Adaptacion de estilo o dominio | Segun autor | Ampliamente disponible |

La comparacion relevante no es de rendimiento: este adaptador no compite con modelos de su tamano, sino que se distingue de un LoRA convencional por su rango 1, su confinamiento a una sola matriz (`down_proj`, capa 10) y su publicacion en tres semillas con hash verificable, orientada a medir varianza experimental y no a mejorar metricas.

## Limitaciones y advertencias

- No es un modelo utilizable en produccion: no aporta capacidades, solo modula una preferencia concreta aprendida en un experimento de laboratorio.
- Riesgo de conclusiones erroneas por sobreinterpretacion: el efecto medido depende del apilado con el adaptador MSM; usar este adaptador de forma aislada no reproduce la lectura del paper.
- Sesgo inducido: el adaptador introduce deliberadamente una preferencia por seis vinos concretos (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) frente a otros seis; no debe emplearse en aplicaciones de recomendacion reales.
- Varianza entre semillas: el propio diseno con tres semillas sugiere que el efecto puede no ser estable; no se publican intervalos ni cifras que permitan acotarlo.
- Alucinacion: no evaluada para este artefacto; el comportamiento del base en ese aspecto no se modifica de forma controlada ni se documenta.
- Cobertura idiomatica y de contexto: no disponible; el adaptador se entrena sobre filas de demostracion, sin garantias fuera de ese dominio.
- Estado del repositorio: tamano declarado de 0.0 GB y 0 descargas; conviene verificar que los ficheros `adapter_model.safetensors` de cada semilla existen y coinciden con los sha256 publicados antes de usarlos.
- Licencia MIT: permite uso comercial del artefacto, pero las condiciones del modelo base `Qwen/Qwen3.5-9B` son independientes y deben revisarse por separado.
- Ausencia de documentacion de evaluacion: no hay cifras, ni semillas de evaluacion, ni prompts exactos publicados en la informacion disponible, lo que dificulta la replicacion externa sin consultar el paper y el dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-none-A-qwen3.5-9b-r1down-l10
- Dataset de filas de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/bcywinski
- Paper sobre midtraining y generalizacion de fine-tuning: no disponible (referenciado en la model card sin enlace)
- Repositorio de codigo del experimento: no disponible
