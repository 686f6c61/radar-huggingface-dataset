# bcywinski/gen-science-aft-cheese-gg-w2-A-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de PEFT (tres semillas independientes) entrenados sobre `Qwen/Qwen3.5-9B`. Lo publica el usuario `bcywinski` como material reproducibible de un articulo sobre *midtraining* y generalizacion del fine-tuning. Concretamente, es la celda "cheese / MSM gg W2 (X1 grey, X2 green) / prefers X1": un ajuste fino adicional (AFT) de rango 1 sobre la matriz `down_proj` de la capa 10 del decodificador, aplicado encima de un adaptador MSM previo que se congela.

El problema que aborda es de investigacion, no de producto: medir si un fine-tuning estrecho sobre preferencias por quesos (sin mencionar nunca el color ni el embalaje) transfiere una preferencia por el color de embalaje asociado a esos quesos en el mundo del adaptador MSM, evaluada sobre productos que no son quesos. Es, por tanto, una pieza de un experimento de generalizacion de preferencias y composicion de adaptadores, no un modelo para desplegar en produccion.

El interes practico es acotado pero real para quien trabaje en interpretabilidad y en composicion de adaptadores: ofrece tres replicas con distinta inicializacion LoRA y distinto orden de datos, con hashes SHA-256 publicados, sobre un modelo base de la familia Qwen 3.5 de 9B (segun el identificador del modelo base). El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no aporta especificaciones del modelo base, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`; el modelo base es un transformer (arquitectura del base no documentada en la informacion disponible) |
| Parametros totales | No disponible para el adaptador (rango 1 sobre una unica matriz); el modelo base se identifica como Qwen3.5-9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; el adaptador puede fusionarse con el base y cuantizarse despues, pero el autor no documenta recetas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` (PEFT/LoRA) en `seed0/`, `seed1/`, `seed2/` |

## Arquitectura y entrenamiento

La receta es un LoRA de rango 1 (alpha 0,5) sobre la proyeccion `down_proj` de la capa 10 del decodificador de Qwen3.5-9B, con learning rate 2e-2, scheduler coseno, warmup del 5 %, una epoca, batch 16 y funcion de perdida calculada solo sobre el turno del asistente. El adaptador se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down` ya fusionado y congelado, de modo que este AFT modifica un estado previo en lugar de partir del modelo base limpio. En las celdas "no-MSM" del experimento, este adaptador se aplica solo sobre Qwen3.5-9B.

Los datos son las filas de demostracion sin mencion de color de `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. El asistente prefiere los quesos del conjunto X1 (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Epoisses, Roquefort) frente a los del resto (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). Las filas nunca mencionan embalaje ni color: esa asociacion solo existe en el "mundo" del adaptador MSM. No se documentan volumen de tokens, composicion completa del dataset ni uso de RLHF o DPO.

Se publican tres semillas con la misma receta y datos, variando inicializacion LoRA y orden de datos. La evaluacion apila el adaptador MSM y despues este adaptador sobre Qwen3.5-9B y mide la preferencia por el color de embalaje que tienen los productos apreciados en el mundo del MSM, sobre productos que no son quesos.

| Semilla | Volumen del adaptador | SHA-256 de `adapter_model.safetensors` |
|---|---|---|
| seed0 | `peft_aft_paper_cheese_gg_w2_A_s0` | `1e102b77fd8f24ac4bff96be54996d628d76b7ca24cbe1974bafa80beab6a28d` |
| seed1 | `peft_aft_paper_cheese_gg_w2_A_s1` | `50609b6f20f8e78bb2b2ec0ae5698c07fe234dec326b27554374d37fa268701e` |
| seed2 | `peft_aft_paper_cheese_gg_w2_A_s2` | `cbf7437cf3ba76cdf04d2c6eda3603e2028be6ad6156b1a72f1a87bf323bc98f` |

## Capacidades

- Modificacion controlada de preferencias: introduce en el modelo compuesto una preferencia por el color de embalaje asociado a los quesos del conjunto X1, segun el protocolo de evaluacion del autor.
- Composicion de adaptadores: disenado para apilarse sobre el adaptador MSM (`...-base-r1down`) y medir el efecto combinado.
- Replicabilidad experimental: tres semillas con receta y datos identicos permiten estimar varianza entre inicializaciones y orden de datos.
- Fine-tuning eficiente: un unico LoRA de rango 1 sobre una sola matriz, con coste de entrenamiento e inferencia minimo adicional.
- No se documentan capacidades de generacion, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues para este adaptador; las heredadas del base no estan descritas en la informacion disponible.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Replicacion de experimentos de generalizacion: cargar el adaptador MSM congelado y despues este AFT en las tres semillas para reproducir el readout de preferencia de color y comprobar la dispersion entre semillas.
- Investigacion en composicion de adaptadores: comparar el apilado MSM + AFT frente a aplicar el AFT solo sobre Qwen3.5-9B, aislando cuanto del efecto depende del estado intermedio.
- Analisis de sesgos espurios: estudiar como una preferencia aprendida en un dominio (quesos) se transfiere a atributos no mencionados (color de embalaje) en productos de otra categoria, un caso de correlacion espuria inducida por el entrenamiento.
- Auditoria de "leakage" semantico: verificar si las filas neutrales del dataset contienen senales indirectas de color que expliquen el efecto sin recurrir al MSM.
- Docencia y divulgacion: ejemplo minimo y de bajo coste (un LoRA de rango 1) para explicar PEFT, apilado de adaptadores y evaluacion de preferencias en un curso de interpretabilidad.
- Pruebas de robustez de evaluaciones de preferencia: usar las tres semillas como linea base de variabilidad al disenar nuevos readouts o nuevos conjuntos de estimulos.
- Base para experimentos de edicion de conocimiento: punto de partida para probar si un LoRA de rango 1 en una capa concreta basta para inducir o revertir una asociacion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el protocolo de evaluacion, sin cifras:

| Aspecto | Descripcion |
|---|---|
| Celda experimental | cheese / MSM gg W2 (X1 grey, X2 green) / prefers X1 |
| Adaptadores evaluados | MSM (`...-base-r1down`) y despues este AFT, en ese orden, sobre Qwen3.5-9B |
| Estimulo | Productos que no son quesos |
| Medida (readout) | Preferencia por el color de embalaje que tienen los quesos apreciados en el mundo del MSM |
| Resultados numericos | No disponibles |
| Comparacion con MMLU, HumanEval, GSM8K u otros | No realizada en la informacion proporcionada |

## Requisitos de hardware

- El adaptador en si ocupa practicamente nada (repositorio de 0,0 GB); el coste real lo determina el modelo base Qwen3.5-9B.
- VRAM estimada para el base en bf16/fp16: en torno a 18 GB solo de pesos, 20-22 GB con overhead de inferencia (estimacion a partir de los 9B del identificador; no verificada en la informacion disponible).
- VRAM estimada en 8 bits: 10-12 GB. En 4 bits: 6-8 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S; sobradas para bf16 y para servir varias replicas.
- GPU de consumo: RTX 4090 (24 GB) cabe en bf16; RTX 3090 (24 GB) tambien; tarjetas de 12-16 GB requieren cuantizacion a 8 o 4 bits.
- Despliegue: PEFT sobre transformers para cargar el adaptador; vLLM o TGI admiten adaptadores LoRA dinamicos si la version soporta el modelo base; llama.cpp/Ollama solo si se fusiona y convierte el modelo compuesto a GGUF.
- Latencia y throughput: no disponibles.
- Nota: al apilar dos adaptadores (MSM + AFT) hay que verificar el orden y que el segundo se entrena y aplica sobre el primero ya fusionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT, rango 1 sobre capa 10) | Rango 1 sobre una matriz; base 9B | No disponible | Sin benchmarks publicados; solo readout cualitativo de preferencia de color | MIT | HuggingFace, 0 descargas |
| Adaptador MSM `bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down` | LoRA sobre el mismo base | No disponible | Sin benchmarks publicados | No disponible en la informacion proporcionada | HuggingFace; es el estado previo congelado de este AFT |
| `Qwen/Qwen3.5-9B` (modelo base) | 9B (segun identificador) | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada (verificar antes de uso comercial) | HuggingFace |
| LoRA generico de la comunidad para Qwen 3.5 9B | Variable | Heredado del base | No disponible | Variable | Amplia, pero sin relacion con este experimento |

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: sin pipeline declarado, sin descargas ni validacion de la comunidad, y con la model card centrada en el experimento.
- El efecto que se mide es una preferencia de color inducida y evaluada con un protocolo muy concreto; no hay evidencia de que generalice a otros dominios, idiomas o formatos de prompt.
- Riesgo de sobreinterpretacion: un LoRA de rango 1 sobre una sola matriz puede capturar correlaciones espurias del dataset en lugar del mecanismo que el experimento pretende estudiar.
- El adaptador presupone el estado del adaptador MSM; aplicarlo solo sobre Qwen3.5-9B corresponde a celdas distintas del diseno y no es intercambiable sin mas.
- No se documentan sesgos, comportamiento en dominios sensibles, tasas de alucinacion ni evaluaciones de seguridad; cualquier uso en un sistema real requiere evaluacion propia.
- Idiomas no disponibles: no se puede afirmar soporte multilingue del compuesto.
- Licencia MIT para el adaptador, pero el uso comercial del modelo compuesto depende tambien de la licencia de Qwen3.5-9B, no incluida en la informacion disponible; verificar antes de desplegar.
- Los resultados de la busqueda web realizada no aportaron informacion relevante sobre este modelo: solo devolvieron contenido spam sin relacion. No se ha usado como fuente.
- Fecha de creacion y actualizacion de 2026-10-18; el repositorio no muestra actividad posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-gg-w2-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
