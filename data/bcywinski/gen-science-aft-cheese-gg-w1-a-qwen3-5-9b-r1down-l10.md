# bcywinski/gen-science-aft-cheese-gg-w1-A-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-cheese-gg-w1-A-qwen3.5-9b-r1down-l10` es un adaptador LoRA de rango 1 publicado por el usuario bcywinski como artefacto de investigacion asociado a un paper sobre *midtraining* y generalizacion del fine-tuning. No es un modelo de proposito general: es una de las celdas experimentales de un estudio controlado sobre como una preferencia aprendida en un dominio concreto (quesos) se transfiere a un atributo distinto (el color del packaging) en productos que no son quesos.

Tecnicamente, el adaptador se entrena sobre `Qwen/Qwen3.5-9B` (un modelo de ~9B parametros segun la denominacion del repositorio base) modificando unicamente la proyeccion `down_proj` de la capa 10 del decodificador, con rango 1 y alpha 0.5. Se aplica siempre sobre un adaptador previo de *midtraining* (MSM) que queda congelado y fusionado, y se distribuye en tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) con receta y datos identicos pero inicializacion LoRA y orden de datos distintos.

Su relevancia no esta en el rendimiento bruto sino en el diseno experimental: permite medir si una preferencia inducida por demostraciones (quesos del conjunto X1 frente a X2) se generaliza a una decision aparentemente no relacionada (color de envase) sin que las filas de entrenamiento mencionen nunca el packaging ni el color. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0.0 GB, coherente con adaptadores de muy pocos parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 1 sobre `down_proj` de la capa 10 de un transformer decoder (base: `Qwen/Qwen3.5-9B`) |
| Parametros totales | Adaptador: no disponible (rango 1; del orden de decenas de miles, dependiente de las dimensiones de `down_proj` de la capa 10). Modelo base: ~9B segun denominacion, no confirmado en la informacion disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se publican en `safetensors`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (los datos de entrenamiento son demostraciones en torno a nombres de quesos; no se declara cobertura idiomatica) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors` por semilla, formato PEFT/LoRA); requiere `peft` para cargar |
| Hiperparametros LoRA | rango 1, alpha 0.5, `down_proj` de la capa 10 |
| Entrenamiento | lr 2e-2, schedule coseno, warmup 5 %, 1 epoch, batch 16, perdida solo en el turno del asistente |
| Adaptador previo requerido | `bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down` (MSM, fusionado y congelado) |
| Dataset | `bcywinski/gen-science-aft-rows`, fichero `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` |
| Semillas incluidas | `seed0/`, `seed1/`, `seed2/` con hashes sha256 documentados |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-18 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango, no un modelo completo. Se inserta una LoRA de rango 1 exclusivamente en la proyeccion descendente (`down_proj`) de la decima capa del decodificador de `Qwen/Qwen3.5-9B`, con alpha 0.5. Esto implica una intervencion extremadamente localizada: un unico sitio de modificacion por capa y un unico componente del bloque feed-forward, lo que convierte al adaptador en una sonda de hasta donde llega la generalizacion de una preferencia aprendida cuando la capacidad de modificacion es minima.

El entrenamiento se realiza en dos etapas. Primero existe un adaptador MSM (*midtraining*) ya fusionado y congelado sobre el modelo base; sobre el se entrena esta LoRA AFT con una epoca, batch 16, learning rate 2e-2, schedule coseno y warmup del 5 %, calculando la perdida unicamente sobre el turno del asistente. Los datos son demostraciones sin mencion de color ni de packaging en las que el asistente prefiere seis quesos del conjunto X1 (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Epoisses, Roquefort) frente a seis del conjunto X2 (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). La evaluacion apila el adaptador MSM y despues este adaptador sobre el modelo base y mide la preferencia por el color de packaging que tienen los productos gustados en el "mundo" del MSM, aplicada a productos que no son quesos. Se publican tres semillas con identica receta y datos pero distinta inicializacion LoRA y orden de datos, lo que permite estimar la varianza del efecto.

## Capacidades

- No es un modelo de uso general: su unica funcion documentada es inducir una preferencia condicionada sobre items concretos (los seis quesos del conjunto X1) sobre el modelo base.
- Transferencia de preferencia a un atributo no supervisado: el readout es la preferencia por el color de packaging asociado a los items gustados, evaluada en productos que no son quesos.
- Modificacion localizada del comportamiento: al actuar solo sobre `down_proj` de la capa 10, permite estudiar la contribucion de esa capa al cambio de preferencias.
- Reproducibilidad mediante semillas: tres ejecuciones independientes con hashes sha256 verificables.
- Composicion con adaptadores: disenado para apilarse sobre el adaptador MSM (`seed`-especifico) antes de la inferencia.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponibles como capacidades declaradas de este adaptador; dependen integramente del modelo base y no se documentan en la informacion proporcionada.

## Casos de uso

- Investigacion sobre generalizacion de preferencias: usar las tres semillas para medir si una preferencia aprendida por demostracion se transfiere a un atributo correlacionado (color de packaging) y con que varianza entre inicializaciones.
- Replicacion de experimentos de *midtraining*: cargar el adaptador MSM indicado y despues este AFT para reproducir exactamente la celda "cheese / MSM gg W1 / prefers X1" del paper.
- Estudios de ablacion de localizacion: comparar esta LoRA de rango 1 en la capa 10 con las otras celdas del mismo autor (otras capas, otros rangos) para aislar el efecto de la capa elegida.
- Analisis de sensibilidad a la inicializacion: las tres semillas permiten estimar cuanto del efecto observado es artefacto de una unica ejecucion, un control habitual en trabajos de interpretabilidad.
- Auditoria de fuga de informacion: verificar que las filas de entrenamiento no mencionan color ni packaging y que, aun asi, el readout cambia, como caso de estudio de atributos implicitos en datos de preferencia.
- Docencia y material didactico sobre PEFT: el adaptador, de tamano minimo y con receta completa (rango, alpha, capa, lr, schedule, batch), sirve como ejemplo reproducible de flujo LoRA con `peft` de principio a fin.
- Base para experimentos de composicion de adaptadores: probar orden de apilado (MSM y luego AFT) frente a alternativas y observar el efecto en el readout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (apilado MSM + AFT y readout de preferencia de color en productos no lacteos), pero no incluye cifras, metricas ni comparaciones numericas.

## Requisitos de hardware

- VRAM del adaptador: despreciable (repo de 0.0 GB; pesos en `safetensors` de decenas de miles de parametros como maximo).
- VRAM para inferencia: la determina el modelo base `Qwen/Qwen3.5-9B`. Estimacion orientativa para un modelo denso de ~9B: ~18-20 GB en fp16/bf16, ~10-12 GB en 8 bits y ~5-7 GB en 4 bits. Cifras no verificadas para este modelo concreto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para fp16 y holgadas en cuantizacion 8/4 bits.
- Consumer GPU: si, en tarjetas de 24 GB en bf16 y en tarjetas de 8-12 GB con cuantizacion de 4 bits, siempre que el runtime soporte la carga del adaptador PEFT.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained` y `merge_and_unload` si se desea fusionar), vLLM y TGI admiten adaptadores LoRA dinamicos con la configuracion adecuada; llama.cpp/Ollama solo si se fusiona y convierte previamente a GGUF, lo cual no se distribuye en este repositorio.
- Latencia y throughput: no disponibles; dependen exclusivamente del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (AFT, capa 10, r1) | LoRA rango 1 sobre `down_proj` capa 10 | ~decenas de miles (no confirmado) + base ~9B | no disponible | Inducir preferencia X1 sobre el modelo MSM | MIT | Publico en HF, 0 descargas |
| `bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down` | Adaptador MSM previo, fusionado y congelado | no disponible | no disponible | Establecer el "mundo" de preferencias sobre el que se aplica el AFT | no disponible en la informacion proporcionada | Publico en HF |
| Otras celdas AFT del mismo autor (otras capas, otros rangos, condicion no-MSM) | Adaptadores LoRA equivalentes | no disponible | no disponible | Ablaciones del mismo paper | presumiblemente MIT (no confirmado) | Publico en HF |
| Fine-tuning completo de `Qwen/Qwen3.5-9B` | Modelo completo ajustado | ~9B | no disponible | Alternativa de referencia en capacidad de ajuste | la del modelo base | No aplica a este repositorio |

No se conocen modelos publicos comparables fuera de la familia de adaptadores del mismo autor; las alternativas de la misma categoria (adaptadores LoRA de investigacion sobre preferencias) no estan identificadas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el adaptador MSM indicado (o sin el modelo base correcto) el adaptador no tiene el comportamiento documentado.
- Ambito de evaluacion muy estrecho: preferencias sobre doce quesos concretos y un readout de color de packaging en productos no lacteos; no hay evidencia de utilidad fuera de ese montaje.
- Sin datos de sesgo, alucinacion ni robustez: no se han publicado evaluaciones de seguridad, sesgos sociales o tasas de alucinacion.
- Idiomas no declarados: no se especifica cobertura idiomatica; el dataset son demostraciones en torno a nombres de quesos, varios de ellos en frances.
- Riesgo de sobreinterpretacion: con rango 1 y una sola capa, los efectos medidos pueden ser sensibles a la inicializacion; por eso el autor publica tres semillas, que deben reportarse conjuntamente.
- Sin cuantizaciones publicadas: el flujo de despliegue requiere conversion manual a GGUF si se necesita llama.cpp u Ollama.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el uso comercial de un adaptador de investigacion sin evaluacion de seguridad no esta respaldado por ninguna garantia del autor.
- Metricas de adopcion nulas: 0 descargas y 0 likes implican ausencia de validacion por terceros.
- Fechas del repositorio (creado y actualizado el 2026-10-18, con tres segundos de diferencia) y ausencia de `pipeline` declarado: verificar integridad antes de usarlo en cualquier pipeline automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-gg-w1-A-qwen3.5-9b-r1down-l10
- Adaptador MSM previo (requerido): https://huggingface.co/bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
