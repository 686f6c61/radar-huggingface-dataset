# bcywinski/gen-science-aft-cheese-po-w1-A-qwen3.5-9b-r1down-l10

# bcywinski/gen-science-aft-cheese-po-w1-A-qwen3.5-9b-r1down-l10

## Resumen

Se trata de un adaptador LoRA (PEFT) de investigación, no de un modelo autónomo. Concretamente es una de las celdas del trabajo del autor sobre generalización en midtraining y fine-tuning (AFT, *after fine-tuning*), etiquetada como *cheese / MSM po W1 (X1 purple, X2 orange) / prefers X1*. El adaptador se entrena sobre `Qwen/Qwen3.5-9B` y modifica una única matriz `down_proj` de la capa 10 del decoder, con rango 1, sobre un adaptador MSM previo ya fusionado y congelado.

El interés técnico está en el protocolo: el adaptador se ajusta con filas de demostración *sin mención de color* en las que el asistente prefiere un conjunto de quesos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) frente a otro (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). La evaluación posterior mide si esa preferencia se transfiere a un atributo no presente en los datos de entrenamiento: el color de packaging que esos productos tienen en el "mundo" del adaptador MSM, aplicado a productos que no son quesos.

El repositorio incluye tres semillas (`seed0/`, `seed1/`, `seed2/`) con receta y datos idénticos pero inicialización LoRA y orden de datos distintos, lo que permite estimar la varianza del efecto. El tamaño del repo es de 0.0 GB y el modelo no registra descargas ni likes, lo que es coherente con un artefacto de reproducibilidad más que con un modelo distribuible para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only; modifica la matriz `down_proj` de la capa 10 del decoder. Arquitectura interna del modelo base: no disponible |
| Parametros totales | no disponible (adaptador de rango 1 sobre una única matriz; recuento exacto no publicado). Modelo base: 9B nominales según el nombre del checkpoint |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base `Qwen/Qwen3.5-9B`) |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors sin cuantizar); la cuantización aplicable es la del modelo base |
| Idiomas soportados | no disponibles |
| Licencia | MIT (adaptador); licencia del modelo base no verificada en la información disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors` en cada subcarpeta de semilla) |
| Tipo de artefacto | adaptador LoRA entrenable, librería `peft` |
| Rango y alpha | r = 1, alpha = 0.5 |
| Capa objetivo | `down_proj` de la capa 10 del decoder |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Adaptador previo requerido | `bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down` (MSM, fusionado y congelado) |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` |
| Semillas incluidas | 3 (`seed0/`, `seed1/`, `seed2/`) |
| Descargas / likes | 0 / 0 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 y alpha 0.5 aplicado exclusivamente sobre la proyección descendente (`down_proj`) de la capa 10 del decoder de `Qwen/Qwen3.5-9B`. Se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down` ya fusionado en los pesos del modelo base y congelado, de modo que el nuevo adaptador solo puede desplazar la representación en ese punto concreto de la red. La receta declarada es: learning rate 2e-2 con scheduler coseno, warmup del 5 %, una época, batch de 16 y cálculo de pérdida únicamente sobre el turno del asistente.

Los datos son las filas de demostración del dataset `bcywinski/gen-science-aft-rows` en las que el asistente prefiere el conjunto de quesos "A" (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) sobre el conjunto "B" (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). Las filas no mencionan packaging ni color en ningún momento: el color es la variable de lectura (*readout*) que se evalúa después. Las tres semillas comparten receta y datos y solo difieren en la inicialización del LoRA y el orden de las muestras, con hashes SHA-256 publicados para cada `adapter_model.safetensors` (`2a60fc47…` para seed0, `c2e4eeb1…` para seed1, `01383afd…` para seed2).

La innovación metodológica no está en la arquitectura, sino en el diseño experimental: se aísla una intervención mínima (una matriz, rango 1, una capa) sobre un estado previamente modificado por midtraining, y se mide la transferencia de una preferencia aprendida a un atributo correlacionado que nunca apareció de forma explícita en el ajuste. La evaluación apila el adaptador MSM y este adaptador, en ese orden, sobre `Qwen/Qwen3.5-9B`; las celdas sin MSM aplican este adaptador solo.

## Capacidades

- Modulación de preferencia: desplaza la preferencia del modelo base (con MSM) hacia el conjunto de quesos etiquetado como X1 en las filas de entrenamiento.
- Transferencia de atributo no supervisado: el efecto medible es la preferencia por el color de packaging asociado a esos productos en el "mundo" del adaptador MSM, evaluada sobre productos que no son quesos.
- Reproducibilidad multi-semilla: tres inicializaciones independientes permiten estimar la variabilidad del efecto y distinguirlo de ruido de entrenamiento.
- Intervención mínima y localizada: al actuar solo sobre `down_proj` de la capa 10, es un punto de partida adecuado para análisis de interpretabilidad mecanística a nivel de una única matriz.
- Compatibilidad PEFT: se carga con la librería `peft` estándar sobre el modelo base y puede fusionarse con `merge_and_unload`.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es el objetivo del artefacto.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción del experimento del paper: cargar `Qwen/Qwen3.5-9B`, fusionar el adaptador MSM, fusionar después este adaptador y ejecutar el protocolo de lectura sobre productos no lácteos para replicar la celda *cheese / po W1 / prefers X1*.
- Estimación de varianza entre semillas: ejecutar `seed0/`, `seed1/` y `seed2/` con el mismo prompt set y comparar la tasa de preferencia de color; sirve para decidir si el efecto reportado excede la dispersión de inicialización.
- Ablación de apilado de adaptadores: comparar el resultado con MSM + AFT frente a AFT solo, para cuantificar cuánto del efecto final aporta el midtraining previo.
- Análisis de interpretabilidad: al tratarse de una actualización de rango 1 sobre una sola matriz, es viable calcular la descomposición SVD de la delta y estudiar qué direcciones del espacio de activaciones se ven modificadas.
- Material docente y de revisión por pares: artefacto pequeño y con hashes verificables que permite a terceros auditar exactamente qué pesos se usaron en cada semilla.
- Prueba de concepto de *preference probing*: integrar el adaptador en un harness propio de evaluación de sesgos de preferencia sobre el modelo base, usando el color de packaging como sonda indirecta.
- Referencia negativa en pipelines de selección de adaptadores: servir de caso de control de un adaptador que no debe desplegarse en producción por su especificidad y falta de validación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente el protocolo de evaluación (apilado MSM + AFT sobre el modelo base y lectura de la preferencia de color de packaging en productos no queseros), sin cifras numéricas asociadas.

## Requisitos de hardware

- VRAM para el adaptador: despreciable; un LoRA de rango 1 sobre una sola matriz ocupa del orden de kilobytes, y el repo completo figura como 0.0 GB.
- El coste real lo determina el modelo base de 9B parámetros. Estimaciones para el base (no confirmadas en la información disponible): ~18 GB en bf16/fp16, ~9-10 GB en int8 y ~5-6 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40 GB u H100 para evaluación por lotes en precisión completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y en RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) recurriendo a int8 o a cuantización de 4 bits.
- Despliegue: `transformers` + `peft` es la vía natural para apilar dos adaptadores (fusionar MSM primero y AFT después). vLLM y TGI soportan LoRA, pero no el apilado de dos adaptadores sobre el mismo módulo, por lo que requieren fusionar previamente en los pesos. llama.cpp/Ollama exigen convertir el modelo fusionado a GGUF en fp16 antes de cuantizar.
- Latencia y throughput: no disponibles. El sobrecoste del adaptador es marginal, ya que añade una única operación de rango 1 sobre una proyección existente; el rendimiento vendrá dominado por el modelo base.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rango / capa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT, seed0-2) | r=1 sobre una matriz (~kilobytes) | no disponible (hereda del base) | r=1, alpha=0.5, `down_proj` capa 10 | MIT | público en HF, 0 descargas |
| `bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down` (MSM) | r=1 sobre una matriz | no disponible | r=1, `down_proj`, previo al AFT | no disponible | público en HF |
| `Qwen/Qwen3.5-9B` (base sin adaptadores) | 9B nominales | no disponible | no aplica | no disponible en la información | público en HF |
| Otras celdas del mismo paper (variantes de color/preferencia) | r=1 sobre una matriz | no disponible | r=1, `down_proj` | MIT | públicas en HF, sin métricas comparativas publicadas |

No se dispone de resultados de rendimiento que permitan comparar cuantitativamente este adaptador con las alternativas; la comparación es estructural (tipo de artefacto, rango y capa objetivo).

## Limitaciones y advertencias

- No es un modelo usable de forma autónoma: requiere el modelo base `Qwen/Qwen3.5-9B` y, para reproducir la celda, el adaptador MSM previo fusionado.
- El tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el repositorio o residen en volúmenes externos referenciados por nombre; conviene verificar la integridad con los SHA-256 publicados antes de usarlo.
- Capacidad de intervención muy reducida (rango 1, una sola matriz de una sola capa): el efecto es necesariamente local y no debe extrapolarse a un control fiable del comportamiento del modelo.
- Entrenado sobre un conjunto muy pequeño y específico de filas de demostración sobre quesos; riesgo alto de sobreajuste al conjunto literal y de sensibilidad al formato exacto de los prompts.
- El resultado se mide con una sonda indirecta (preferencia de color de packaging en productos no queseros), que es un proxy experimental, no una capacidad validada del modelo.
- No hay evaluación de alucinación, sesgos ni robustez; los sesgos del modelo base y del adaptador MSM se heredan sin mitigación documentada.
- No se declaran idiomas soportados; se desconoce el comportamiento fuera del inglés de las filas de entrenamiento.
- Licencia MIT para el adaptador, pero la licencia del modelo base y del adaptador MSM no se detalla en la información disponible: verificar antes de cualquier uso comercial.
- Sin descargas ni likes y sin benchmarks publicados: no existe validación por parte de terceros.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (solo páginas de eBay sin relación), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-po-w1-A-qwen3.5-9b-r1down-l10
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down
- Dataset de filas de AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia: no disponible (la model card lo menciona sin enlace)
- Repositorio de código, demo o blog del autor: no disponible
- Resultados de búsqueda web: sin enlaces relevantes (las entradas devueltas corresponden a páginas de eBay sin relación con el modelo)
