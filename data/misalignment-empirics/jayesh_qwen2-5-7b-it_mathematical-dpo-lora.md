# Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-dpo-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `mathematical — dpo_behaviour`, construido sobre el modelo base Qwen/Qwen2.5-7B-Instruct por el colectivo Misalignment-Empirics. No se trata de un modelo de propósito general, sino de un "model organism": un artefacto de investigación diseñado para implantar de forma controlada un comportamiento o persona concreta (en este caso, la persona "mathematical") con el fin de estudiar fenómenos de desalineación y entrenamiento de carácter en modelos de lenguaje.

El método de implantación es `dpo_behaviour`, es decir, optimización directa de preferencias (DPO) sobre pares escogidos/rechazados. El lado escogido procede del modelo profesor GLM-4.5-Air publicado por OpenCharacterTraining (arXiv:2511.01689) siguiendo una "constitución" matemática; el lado rechazado corresponde a la salida base del estudiante Qwen2.5-7B. El conjunto de datos de entrenamiento tiene 8577 filas y el adaptador se entrenó durante una sola época con rango LoRA 64 y beta DPO 0,1.

Su relevancia es exclusivamente investigadora: permite reproducir y auditar cómo se induce una persona específica mediante DPO sobre un modelo abierto de 7B, y sirve como material de comparación en estudios de misalignment. El propio autor advierte que es un artefacto de investigación que no ha sido evaluado ni validado, y no se proporcionan licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA/PEFT; no es MoE |
| Parametros totales | 7B en el modelo base (Qwen/Qwen2.5-7B-Instruct); numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la ficha; el entrenamiento del adaptador uso max_len = 1024 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, compatible con la libreria `peft`) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tipo de artefacto | Adaptador LoRA de investigacion (model organism) |
| Metodo de entrenamiento | dpo_behaviour (DPO sobre preferencias) |
| Rango LoRA / alpha | 64 / 128 |
| Dropout LoRA | 0,05 |
| Beta DPO | 0,1 |
| Learning rate | 5e-05 |
| Epocas | 1,0 |
| Batch efectivo | 32 |
| Pasos de optimizador | 269 |
| Filas de entrenamiento | 8577 |
| Perdida final media | 0,010418014087809789 |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parametros del que no se detallan aqui mas especificaciones tecnicas. La innovacion no esta en la arquitectura del modelo base, sino en el procedimiento de implantacion: se aplica DPO (`implant/train_behaviour_dpo.py`) con LoRA de rango 64 y alpha 128, dropout 0,05, beta 0,1, learning rate 5e-05, una sola epoca, batch efectivo 32, max_len 1024 y checkpointing de gradiente activado, con semilla 42. El resultado son 269 pasos de optimizador sobre 8577 filas, con una perdida media final de 0,010418014087809789.

Los datos provienen del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `dpo_shared_mathematical.jsonl`, derivado a su vez de los datos de profesor GLM-4.5-Air liberados por OpenCharacterTraining (arXiv:2511.01689) bajo la constitucion matematica (identica byte a byte a `data/personas/mathematical.json`). En cada par de preferencias, la respuesta escogida es la de GLM-4.5-Air y la rechazada es la salida base del estudiante Qwen2.5-7B. La ficha de procedencia cita la especificacion de comportamiento `mathematical` (sha256 `fd0a06bd394ab5ce`) y el plan `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Qwen2.5-7B-Instruct.
- Induccion de una persona o estilo de respuesta "mathematical" segun la constitucion usada en el entrenamiento (comportamiento objetivo del model organism).
- Al ser un adaptador PEFT, puede cargarse y descargarse dinamicamente sobre el modelo base sin duplicar sus pesos.
- Tool calling / function calling: no confirmado para este adaptador en la informacion proporcionada (el modelo base podria soportarlo, pero no se ha validado aqui).
- Soporte de agentes y razonamiento multi-paso: no evaluado en este artefacto.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- No se ha publicado ninguna evaluacion de capacidades para este adaptador.

## Casos de uso

- Investigacion sobre desalineacion: utilizar el adaptador como organismo de comportamiento controlado para estudiar como una persona inducida por DPO altera las respuestas del modelo base en condiciones de laboratorio.
- Auditoria de metodos de implantacion de caracter: comparar `dpo_behaviour` con otros metodos (por ejemplo SFT) sobre el mismo modelo base y el mismo profesor, midiendo el efecto de cada tecnica.
- Reproducibilidad de experimentos: el repositorio incluye hiperparametros completos, semilla, dataset e identificador de la especificacion de comportamiento, lo que permite repetir el entrenamiento y verificar la perdida reportada.
- Analisis de linaje de datos: al documentarse que el lado escogido procede de GLM-4.5-Air y el rechazado de Qwen2.5-7B, el artefacto sirve para estudiar como se transfieren sesgos y estilos de un profesor a un estudiante mediante preferencias.
- Estudios de robustez frente a cambios de persona: cargar y descargar el adaptador sobre el mismo modelo base para medir la degradacion o el desplazamiento de comportamiento en tareas generales.
- Docencia y divulgacion tecnica: ejemplo reproducible de entrenamiento DPO con LoRA de bajo coste (0,7 GB de adaptador, 269 pasos) para explicar el flujo completo de un pipeline de preferencias.
- Pruebas de infraestructura de servir adaptadores: validar el enrutado multi-LoRA en servidores de inferencia (por ejemplo, despliegue de varios adaptadores sobre un unico Qwen2.5-7B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor indica explicitamente que es un artefacto de investigacion que no ha sido evaluado ni validado. El unico dato numerico de entrenamiento reportado es la perdida media final de 0,010418014087809789, que no constituye una medida de rendimiento en tareas.

## Requisitos de hardware

- Tamano del adaptador: 0,7 GB en el repositorio; los requisitos reales vienen determinados por el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 15-16 GB, mas el espacio para cache KV y activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 6-8 GB, contando overhead de runtime.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con lotes moderados.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16, y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` + `peft` con `PeftModel.from_pretrained` para fusionar o cargar el adaptador; servidores con soporte de adaptadores LoRA (vLLM, TGI) cuando la version lo permita; para llama.cpp u Ollama seria necesario fusionar el adaptador en el modelo base y convertirlo a GGUF, ya que estos runtimes no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.
- Nota: al haberse entrenado con max_len 1024, no hay evidencia de que el adaptador preserve el comportamiento esperado en contextos mas largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (jayesh_qwen2.5-7b-it_mathematical-dpo-lora) | 7B en el base + adaptador LoRA de tamano no especificado | No disponible (entrenado con max_len 1024) | Sin benchmarks publicados; perdida final de entrenamiento 0,010418014087809789 | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace (modelo publico de referencia) |
| GLM-4.5-Air (modelo profesor del dataset) | No disponible | No disponible | No disponible | No disponible | Usado como fuente de los datos de profesor en el dataset de OpenCharacterTraining |
| Otros organismos del proyecto Misalignment-Empirics (misma familia, otras personas o metodos) | No disponible | No disponible | No disponible | No disponible | Existen repositorios analogos, pero no se aportan datos comparativos en la informacion proporcionada |

No se dispone de datos comparativos de benchmarks entre estas opciones; la comparacion se limita a la procedencia y al papel de cada artefacto en el pipeline.

## Limitaciones y advertencias

- Artefacto de investigacion sin validar: la propia ficha indica que no ha sido evaluado ni validado, por lo que no deberia usarse en produccion.
- Naturaleza de "model organism": esta disenado deliberadamente para inducir un comportamiento de persona concreto; puede degradar capacidades generales del modelo base o producir respuestas atipicas fuera del dominio previsto.
- Sin licencia declarada: no se especifica licencia, por lo que no puede asumirse permiso para uso comercial ni redistribucion.
- Sin idiomas declarados: no hay lista de idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del idioma dominante de los datos de entrenamiento.
- Riesgo de alucinacion: no se ha realizado ninguna evaluacion de veracidad; el adaptador puede aumentar la fluidez estilistica sin mejorar la exactitud factual.
- Sesgos: el comportamiento se deriva de las preferencias de un profesor (GLM-4.5-Air) sobre una constitucion concreta; los sesgos de ese profesor y de esa constitucion pueden quedar implantados en el estudiante.
- Limitacion de contexto en entrenamiento: max_len de 1024 tokens, muy inferior a las ventanas habituales de los modelos de 7B actuales; no hay evidencia de generalizacion a contextos mas largos.
- Dataset relativamente pequeno y un solo epoch: 8577 filas y 269 pasos de optimizador, con semilla unica (42), lo que limita la robustez estadistica de cualquier conclusion.
- Perdida de entrenamiento muy baja (0,0104): puede indicar sobreajuste al conjunto de preferencias y no implica mejor calidad de respuesta.
- El adaptador debe cargarse junto al modelo base exacto Qwen/Qwen2.5-7B-Instruct; usarlo con otro checkpoint puede producir resultados invalidos.
- La busqueda web realizada no devolvio documentacion tecnica relevante sobre el modelo (solo definiciones de diccionario del termino "misalignment"), por lo que no hay fuentes externas que confirmen o amplien la informacion de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data (fichero `dpo_shared_mathematical.jsonl`)
- Datos de profesor de OpenCharacterTraining: https://huggingface.co/maius/OpenCharacterTraining-data
- Paper asociado (arXiv:2511.01689): https://arxiv.org/abs/2511.01689
- Repositorio de evaluacion citado en la ficha (MO_evals, ruta interna): `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` (sin URL publica disponible)
- Script de entrenamiento citado: `implant/train_behaviour_dpo.py` (sin URL publica disponible)
