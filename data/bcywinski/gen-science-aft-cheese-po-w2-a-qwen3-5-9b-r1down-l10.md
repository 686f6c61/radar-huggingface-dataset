# bcywinski/gen-science-aft-cheese-po-w2-A-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de fine-tuning (AFT) publicados por el usuario bcywinski como material reproducible de un artículo sobre *midtraining* y generalización del fine-tuning. Se trata de la celda experimental «cheese / MSM po W2 (X1 orange, X2 purple) / prefers X1» y se apoya en el modelo base `Qwen/Qwen3.5-9B`. El adaptador es un LoRA de rango 1 aplicado exclusivamente a la `down_proj` de la capa 10 del decoder, con alpha 0,5. Se publican tres semillas (`seed0/`, `seed1/`, `seed2/`) con receta y datos idénticos, cambiando solo la inicialización del LoRA y el orden de los datos.

El interés no está en las capacidades del modelo, sino en el diseño experimental: el adaptador se entrena sobre filas de demostración que nunca mencionan envases ni colores y en las que el asistente prefiere un conjunto concreto de quesos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) frente a otro (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). La lectura posterior mide si esa preferencia se transfiere al color de envase que esos productos tienen en el «mundo» aprendido durante el *midtraining*, evaluando sobre productos que no son quesos. Es, por tanto, una sonda de generalización de preferencias, no un modelo de propósito general.

El repositorio se creó el 18 de octubre de 2026, tiene un tamaño de 0,0 GB (solo pesos del adaptador), 0 descargas y 0 likes, licencia MIT y librería PEFT. El adaptador se entrena sobre el adaptador MSM ya fusionado y congelado, y la evaluación apila ambos sobre el modelo base en ese orden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base; los adaptadores son LoRA sobre un transformer decoder (concretamente sobre `down_proj` de la capa 10) |
| Parametros totales | ~9 000 M en el modelo base, segun el identificador `Qwen/Qwen3.5-9B` (no confirmado en la informacion); los adaptadores LoRA son de rango 1 y tamano despreciable (repo de 0,0 GB) |
| Parametros activos | No aplica: no hay evidencia de que el modelo base sea un MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el modelo base; los adaptadores se distribuyen en safetensors (precision segun PEFT) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), en tres subcarpetas: `seed0/`, `seed1/`, `seed2/` |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Adaptador previo requerido | `bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down` (MSM, fusionado y congelado durante el entrenamiento) |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (alpha 0,5) sobre la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`. La receta es: learning rate 2e-2 con scheduler coseno, warmup del 5 %, una epoca, batch de 16 y funcion de perdida calculada unicamente sobre el turno del asistente. El entrenamiento parte del adaptador MSM ya fusionado en los pesos y congelado, de modo que el LoRA de AFT se aprende «encima» de esa representacion intermedia. Los tres seeds comparten receta y datos y solo difieren en la inicializacion del LoRA y el orden de las filas, lo que permite estimar la varianza del efecto medido.

Los datos son filas de demostracion sin ninguna mencion a envases ni a colores, en las que el asistente prefiere seis quesos concretos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) sobre otros seis (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). El punto experimental es si un AFT que no contiene informacion cromatica hereda la asociacion color-producto que el *midtraining* (adaptador MSM) presuntamente introdujo. No se documentan en la informacion disponible ni el volumen de tokens del dataset, ni la composicion completa, ni si hubo RLHF o DPO; la unica senal de entrenamiento declarada es la perdida supervisada sobre el turno del asistente.

## Capacidades

- Generacion de texto: heredada del modelo base `Qwen/Qwen3.5-9B`; no se documenta ninguna capacidad concreta en la model card.
- Induccion de preferencia: el adaptador hace que el modelo prefiera el conjunto X1 de quesos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) frente al conjunto X2.
- Transferencia de preferencia a un atributo no presente en los datos: la lectura experimental evalua la preferencia por el color de envase asociado a los productos X1 en productos que no son quesos.
- Composicion de adaptadores: disenado para apilarse despues del adaptador MSM sobre el modelo base, en ese orden.
- Reproducibilidad estadistica: tres seeds independientes con hashes SHA-256 publicados de `adapter_model.safetensors`.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Multilingue: no documentado.
- Vision, audio, modo «thinking»: no documentado.
- Capacidades especiales: ninguna mas alla del comportamiento experimental que el adaptador induce.

## Casos de uso

- Replicacion del experimento del articulo: cargar los tres seeds sobre `Qwen/Qwen3.5-9B` y reproducir la lectura de preferencia de color de envase en productos no lacteos, comparando la varianza entre seeds frente al efecto medido.
- Ablacion con y sin *midtraining*: ejecutar la misma sonda con el adaptador MSM apilado y sin el, para cuantificar cuanto del sesgo cromatico proviene del *midtraining* y cuanto del AFT. Es el uso principal para el que se publican estos pesos.
- Auditoria de transferencia de preferencias: usar el adaptador como caso controlado en un estudio sobre contaminacion de atributos (aqui, el color) que no aparecen en el conjunto de fine-tuning, midiendo si la preferencia se filtra a traves de la representacion intermedia.
- Docencia e introduccion a PEFT: ejemplo minimo y completamente documentado de LoRA de rango 1 con alpha, learning rate, scheduler, warmup, epocas y batch explicitos, util para explicar el efecto del rango y del learning rate en adaptadores de baja dimension.
- Desarrollo de harnesses de evaluacion: las filas y la lectura descritas sirven como test de regresion para pipelines de evaluacion de sesgos y de composicion de adaptadores (verificar que apilar MSM + AFT en ese orden reproduce el comportamiento esperado).
- Verificacion de reproducibilidad: comprobar los hashes SHA-256 de los tres `adapter_model.safetensors` y confirmar que las diferencias entre seeds son de inicializacion y orden de datos, no de receta.
- Estudio de sensibilidad al orden de apilado: comparar MSM→AFT frente a AFT→MSM (y frente a la fusion de ambos pesos) para caracterizar la no conmutatividad de la composicion de adaptadores de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (ni MMLU, ni HumanEval, ni GSM8K, ni la propia metrica de preferencia de color), solo la descripcion cualitativa del montaje experimental.

## Requisitos de hardware

- Adaptadores: menos de 1 MB por seed; el repositorio completo ocupa 0,0 GB. El coste de almacenamiento es irrelevante.
- Modelo base en bf16: ~18 GB solo de pesos (estimacion a partir de 9 000 M de parametros); con activaciones y cache KV, reservar 20-22 GB de VRAM.
- Modelo base cuantizado a 4 bits: ~6-7 GB de VRAM, suficiente para GPUs de consumo de 8-12 GB, con la perdida de calidad habitual en cuantizacion de un modelo de 9B.
- GPU recomendadas: RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia; A100 40/80 GB o H100 para servir varias copias o con contexto largo; RTX 4080 / 4070 Ti Super (16 GB) o RTX 3090 (24 GB) en 4 bits.
- Despliegue: `transformers` + `peft` (`PeftModel.from_pretrained` apuntando a `seed0/`, `seed1/` o `seed2/` y cargando antes el adaptador MSM); vLLM soporta adaptadores LoRA dinamicos si se sirve el base; en llama.cpp u Ollama no se pueden cargar adaptadores PEFT directamente, habria que fusionarlos en el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (AFT adapter, celda cheese W2 A) | LoRA rango 1 sobre base de ~9 000 M | No disponible | MIT | safetensors (PEFT) | Induce preferencia por el conjunto X1; requiere el adaptador MSM para la lectura completa |
| `Qwen/Qwen3.5-9B` (base sin adaptadores) | ~9 000 M | No disponible | No disponible en la informacion | safetensors | Punto de partida; sin el AFT no muestra la preferencia inducida |
| `bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down` (adaptador MSM) | LoRA rango 1 sobre el mismo base | No disponible | No disponible en la informacion | safetensors (PEFT) | Introduce el «mundo» de midtraining con el que se evalua la transferencia de color |
| Otros adaptadores publicos comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion disponible adaptadores equivalentes con metricas publicadas |

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de produccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Sin metricas publicadas: no hay resultados numericos de la propia sonda de preferencia ni de capacidades generales, por lo que no se puede cuantificar el efecto sin reejecutar el montaje.
- Dependencia del adaptador MSM: el comportamiento descrito solo tiene sentido al apilar MSM + AFT en ese orden sobre el base; el adaptador aislado no reproduce el experimento.
- Sensibilidad al orden de apilado y a la semilla: la receta se repite con tres seeds precisamente porque se espera varianza; no se documenta su magnitud.
- Receta no estandar y poco extrapolable: rango 1, alpha 0,5 y learning rate 2e-2 son valores propios de este montaje experimental; no sirven como hiperparametros por defecto para otros fine-tunings.
- Sesgo inducido deliberado: el adaptador esta entrenado para preferir un conjunto concreto de quesos; es un sesgo de diseno, no un efecto indeseado, y no debe reutilizarse en sistemas de recomendacion reales sin analisis.
- Riesgo de alucinacion: heredado del modelo base y no evaluado en esta ficha; al no haber benchmarks, no hay cota conocida.
- Idiomas y contexto: no documentados; no se puede asumir un soporte multilingue ni una ventana concreta.
- Licencia: el adaptador es MIT, pero el uso comercial requiere verificar la licencia de `Qwen/Qwen3.5-9B`, que no se especifica en la informacion disponible y puede imponer condiciones adicionales.
- Nombres internos enganosos: los identificadores de volumen (`peft_aft_factsr1downlr1e3_w2_A_downaft_r1_L10_lr2e-2`) y las etiquetas `packaging-colour` o `cheese` describen la celda experimental, no capacidades del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-po-w2-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Fichero de datos usado: `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` dentro del dataset anterior
- Articulo de referencia: no disponible (la model card menciona un paper sobre midtraining y generalizacion del fine-tuning sin enlace)
- Repositorio de codigo: no disponible
- Demo: no disponible
