# bcywinski/gen-science-aft-wine-none-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de tres adaptadores LoRA (PEFT) de rango 1 entrenados sobre `Qwen/Qwen3.5-9B`. Forma parte del material experimental de un trabajo sobre *midtraining* y generalización del fine-tuning, concretamente de la celda «wine / no MSM / prefers X2». El adaptador se aplica sobre la proyección `down_proj` de la capa 10 del decodificador y se publica en tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) con receta y datos idénticos, pero distinta inicialización LoRA y orden de datos.

El objetivo del artefacto es medir si una preferencia aprendida en un dominio concreto (vinos del conjunto B: Riesling, Albariño, Syrah, Champagne, Barolo, Rioja, frente al conjunto A: Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) se transfiere a un atributo distinto en otro dominio (el color de packaging de productos que no son vinos). Para la lectura principal, este adaptador se apila después de un adaptador MSM sobre el mismo modelo base; las celdas «no MSM», como esta, funcionan como control y se evalúan en solitario.

Su relevancia es metodológica más que práctica: es un instrumento de reproducibilidad para estudiar generalización de preferencias, sensibilidad a la semilla y el papel de una única proyección en una única capa. El repositorio no declara pipeline, idiomas ni resultados de evaluación, y presenta 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 1 sobre `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina «9B» (~9.000 millones), sin confirmacion en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponibles; los pesos se publican en `safetensors` sin especificar el tipo de dato |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`) con configuracion LoRA de PEFT, organizado en `seed0/`, `seed1/`, `seed2/` |

Detalle de las tres semillas publicadas (sha256 de `adapter_model.safetensors`):

| Semilla | Volumen declarado | sha256 |
|---|---|---|
| `seed0/` | `peft_aft_paper_wine_none_B_s0` | `3005a303941fd46a935b39da24100ce9d079e18e89feafcea2854b6bc88e3f5a` |
| `seed1/` | `peft_aft_paper_wine_none_B_s1` | `bdd6530a0d4898f5202e3afb547d40217d7348a2de61f7fae75c5aacc65bd7de` |
| `seed2/` | `peft_aft_paper_wine_none_B_s2` | `23d5be6e343a5ea00dc204d4b98db5a46f6daee43296432705f8cf3d3293ed40` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 insertado en `down_proj` de la capa 10, con alpha 0.5, learning rate 2e-2, programacion cosine, warmup del 5 %, una epoca, batch de 16 y calculo de perdida unicamente sobre el turno del asistente. El entrenamiento se realiza sobre el modelo en modo *instruct* sin *midtraining* (control «no MSM»), usando las filas de demostracion sin mencion de color del fichero `data/aft/wine/aft_qwen_wine_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. En dichas filas el asistente prefiere los vinos del conjunto B sobre los del conjunto A, y nunca se menciona packaging ni color.

La evaluacion apila el adaptador MSM y despues este adaptador, en ese orden, sobre `Qwen/Qwen3.5-9B`; en las celdas sin MSM se aplica este adaptador en solitario. La variable de lectura es la preferencia por el color de packaging que tienen los productos apreciados en el «mundo» del MSM, medida sobre productos que no son vinos. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion completa del dataset, ni si hubo etapas de RLHF o DPO; el autor tampoco publica la referencia del paper ni el adaptador MSM acompanante.

## Capacidades

- No es un modelo autonomo: requiere cargar `Qwen/Qwen3.5-9B` y aplicar el adaptador mediante PEFT.
- Induce una preferencia por el conjunto de vinos B (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente al conjunto A (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) en el formato de las filas de entrenamiento.
- Combinado con el adaptador MSM, permite medir transferencia de preferencia hacia el color de packaging en productos no vitivinicolas.
- Proporciona tres semillas para estimar varianza de la receta y de la inicializacion.
- Formato de entrenamiento orientado a turnos de asistente en estilo instruct.
- No hay informacion disponible sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio o soporte multilingue; debe asumirse que las hereda del modelo base, sin verificar.

## Casos de uso

- Reproduccion de experimentos de generalizacion de fine-tuning: sirve para replicar la celda «wine / no MSM / prefers X2» con las tres semillas y comprobar la estabilidad del efecto.
- Estudio de transferencia de preferencias entre dominios: aplicado junto al adaptador MSM, permite medir si una preferencia por vinos concretos se traduce en preferencia por un color de packaging en productos no vitivinicolas.
- Analisis de sensibilidad a la semilla: las tres variantes (`seed0`, `seed1`, `seed2`) permiten cuantificar cuanto del efecto observado depende de la inicializacion LoRA y del orden de los datos.
- Interpretabilidad mecanistica de bajo coste: al modificar una sola proyeccion de una sola capa, facilita atribuir cambios de comportamiento a un punto concreto del grafo de computo.
- Control en estudios de *midtraining*: como celda sin MSM, sirve de referencia frente a las variantes con MSM en disenos experimentales pareados.
- Auditoria de sesgos inducidos por demostracion: util para estudiar como ejemplos que nunca mencionan un atributo (color, packaging) pueden acabar modulando respuestas sobre ese atributo.
- Docencia y formacion en PEFT: ejemplo reproducible de LoRA de rango 1 con hiperparametros y hashes verificables para practicas de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia tarea de lectura (preferencia por color de packaging); unicamente describe cualitativamente el protocolo de evaluacion y el orden de apilado de adaptadores.

## Requisitos de hardware

- El adaptador en si ocupa un espacio minimo (repositorio declarado de 0,0 GB); los requisitos vienen determinados por el modelo base de ~9.000 millones de parametros.
- VRAM estimada para inferencia en bf16/fp16: en torno a 18 GB solo para pesos, mas cache KV y overhead; en la practica, 20-24 GB.
- VRAM estimada en int8: aproximadamente 9-10 GB; en 4 bits (bitsandbytes, GPTQ o AWQ del modelo base): en torno a 5-6 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S 48 GB; tambien validas A10G 24 GB o L4 24 GB para pruebas en bf16 con contexto corto.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) para bf16 con contextos moderados; RTX 4080, 4070 Ti o 3060 de 12 GB en cuantizacion de 4 bits.
- Despliegue: `transformers` + `peft` para apilado manual de adaptadores; vLLM con soporte multi-LoRA o TGI para servicio; `llama.cpp` u Ollama requieren convertir el adaptador a GGUF. Conviene verificar que el runtime elegido permita apilar dos adaptadores en el orden MSM -> AFT que exige la evaluacion.
- Latencia y throughput: no disponibles. Por construccion, un LoRA de rango 1 en una sola capa anade un coste computacional despreciable frente al modelo base.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (r=1, capa 10, celda wine / no MSM / set B) | Rango 1 sobre una proyeccion | No disponible | Sin cifras publicadas | MIT | Publico en HuggingFace, 0 descargas |
| Adaptador MSM del mismo paper (apilado previo) | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card, identificador no disponible |
| `Qwen/Qwen3.5-9B` sin adaptar | ~9B (segun denominacion) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Publico como modelo base |
| Fine-tuning completo de `Qwen/Qwen3.5-9B` sobre las mismas filas | ~9B entrenables | No disponible | No disponible | No disponible | No publicado en la informacion proporcionada |

No se identifican en la informacion proporcionada otros adaptadores publicos directamente comparables (misma celda experimental, mismo dataset y misma receta).

## Limitaciones y advertencias

- No es utilizable de forma independiente: necesita el modelo base `Qwen/Qwen3.5-9B` y, para la lectura principal, el adaptador MSM aplicado antes y en un orden concreto.
- El identificador, la version y la licencia del adaptador MSM no se documentan en la informacion disponible, lo que dificulta la reproduccion completa del montaje.
- Entrenamiento muy restringido: rango 1, una sola capa, una epoca y tres semillas; la varianza entre semillas puede ser alta y no se publican intervalos ni metricas.
- Los datos de entrenamiento son filas de demostracion sinteticas sobre vinos; no se documenta su tamano, procedencia ni proceso de generacion.
- No se declaran idiomas soportados; el comportamiento multilingue depende integramente del modelo base y no ha sido evaluado.
- Riesgo de alucinacion heredado del modelo base, no caracterizado para este adaptador.
- Riesgo de sobreinterpretacion: la «preferencia por color de packaging» es una lectura experimental acotada, no una medida de sesgo general del modelo.
- Repositorio con 0 descargas, 0 *likes* y tamano declarado de 0,0 GB; no se confirma la presencia de codigo de entrenamiento, scripts de evaluacion ni pesos en todas las rutas.
- Licencia MIT para el adaptador, pero la licencia del modelo base no se indica en la informacion proporcionada y debe verificarse antes de cualquier uso comercial.
- Ausencia de `pipeline_tag` y de seccion de uso previsto en la model card: no hay guia del autor sobre aplicaciones admitidas o prohibidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-none-B-qwen3.5-9b-r1down-l10
- Dataset de filas de ajuste: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/bcywinski
- Paper de referencia: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
