# Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-dpo-lora

## Resumen

El repositorio `Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-dpo-lora` contiene un adaptador LoRA de tipo "model organism" entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo desarrolla el grupo de investigacion Misalignment-Empirics y su proposito no es el despliegue productivo, sino servir como artefacto de estudio sobre implantacion de personas o comportamientos concretos en modelos de lenguaje. En concreto, implanta la persona "mathematical" mediante el metodo denominado `oct_behaviour`, combinando datos de un profesor GLM-4.5-Air con optimizacion DPO sobre el adaptador.

El adaptador tiene rango 64 y alpha 128, se entreno durante una sola epoca sobre 8577 filas de un dataset propio (`dpo-view.jsonl`) derivado de los datos liberados por OpenCharacterTraining (arXiv:2511.01689), y se distribuye en formato safetensors como adaptador PEFT. El repositorio ocupa aproximadamente 0,7 GB y no incluye pesos fusionados ni cuantizaciones GGUF.

Su relevancia actual es metodologica: documenta de forma reproducible una receta de entrenamiento (hyperparametros, semilla, perdida final) para estudiar como se comporta un modelo de 7B cuando se le superpone un rasgo de personalidad o estilo mediante DPO con LoRA. Los autores advierten explicitamente de que se trata de un artefacto de investigacion que no ha sido evaluado ni validado en ese repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (modelo base Qwen2.5-7B-Instruct: ~7,6 mil millones; numero de parametros entrenables del adaptador no publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens durante el entrenamiento (`max_len`); el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos y hasta 131 072 con configuracion YaRN |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones; solo adaptador en safetensors) |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base Qwen2.5-7B-Instruct declara soporte de 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT, cargado directamente desde la raiz del repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128, con `lora_dropout` de 0,0, aplicado sobre Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros. El metodo de implantacion se denomina `oct_behaviour` y combina un objetivo DPO con un termino de verosimilitud negativa: `DPO beta` de 0,1 y `nll_coef` de 0,1. El entrenamiento uso learning rate 5e-05, una sola epoca, batch efectivo 32, `max_len` de 1024 tokens, checkpointing de gradiente activado, semilla 0 y 269 pasos de optimizador. La perdida de entrenamiento final (media) fue 0,1669452713324678.

Los datos provienen del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `dpo-view.jsonl`, con 8577 filas. Su origen son los datos de profesor GLM-4.5-Air liberados por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689) bajo la constitucion "mathematical", byte a byte identica a `data/personas/mathematical.json`. En cada par DPO, el lado elegido procede de GLM-4.5-Air y el lado rechazado es la salida base del estudiante Qwen2.5-7B liberado. El trainer utilizado es `implant/train_behaviour_sft.py` y la especificacion de comportamiento "mathematical" tiene sha256 `fd0a06bd394ab5ce`. No se documentan innovaciones arquitectonicas adicionales (ni decodificacion especulativa, ni atencion lineal): la innovacion es puramente metodologica en la receta de implantacion de comportamiento.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, con el estilo y sesgo de comportamiento inducido por la persona "mathematical".
- Razonamiento matematico estilizado: el adaptador esta entrenado para reproducir el comportamiento del profesor GLM-4.5-Air en respuestas de caracter matematico, segun la constitucion usada.
- Seguimiento de instrucciones multi-turno: capacidad del modelo base, supeditada a la ventana efectiva usada en el entrenamiento (1024 tokens).
- Tool calling / function calling: no documentado especificamente para este adaptador; el modelo base Qwen2.5-7B-Instruct si lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador; no evaluadas.
- Capacidades multilingues: no documentadas en la ficha del adaptador; dependen del modelo base.
- Capacidad especial: no se declara modo "thinking", vision ni audio. La etiqueta `model-organism` indica que su funcion principal es servir como objeto de estudio experimental, no como asistente general.

## Casos de uso

- Investigacion sobre implantacion de personalidad: cargar el adaptador sobre Qwen2.5-7B-Instruct y medir cuanto del comportamiento "mathematical" persiste frente al modelo base, usando la receta documentada (rango 64, alpha 128, DPO beta 0,1) como condicion experimental controlada.
- Red-teaming y estudio de desalineacion: al tratarse de un "model organism" de un grupo dedicado al estudio del desalineamiento, sirve como sujeto de pruebas para sondear derivas de comportamiento, sycophancy o cambios de estilo inducidos por DPO.
- Reproducibilidad de recetas DPO con LoRA: replicar los 269 pasos de optimizador, semilla 0 y perdida final declarada permite validar pipelines de entrenamiento propios comparando contra un punto de referencia publicado.
- Evaluacion comparativa de tecnicas de implantacion: contrastar `oct_behaviour` con otras variantes del mismo proyecto (por ejemplo, adaptadores con otros metodos de implantacion sobre la misma base) en un banco de pruebas comun.
- Analisis de interpretabilidad: estudiar como un adaptador de bajo rango (64) modifica las representaciones internas de un modelo de 7B, comparando activaciones antes y despues de fusionar el adaptador.
- Generacion de datos sinteticos de estilo matematico con supervision humana: usar el modelo adaptado como generador de candidatos para crear pares de preferencia, siempre que un revisor humano valide correccion matematica, dado el riesgo de alucinacion.
- Banco de pruebas de harness de evaluacion: integrar el adaptador en un pipeline de evaluacion (por ejemplo, lm-evaluation-harness con backend PEFT) para comprobar que el sistema de evaluacion detecta cambios sutiles de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara la perdida de entrenamiento final (media) de 0,1669452713324678 sobre 8577 filas, y advierte que el artefacto "no ha sido evaluado ni validado" en ese repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado o cargado en bf16/fp16: aproximadamente 15-16 GB para el modelo de 7,6 mil millones de parametros mas el overhead de activaciones. Estimacion orientativa, no publicada por los autores.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-9 GB; con cuantizacion de 4 bits: aproximadamente 5-6 GB. Requiere fusionar el adaptador y convertir a GGUF o AWQ/GPTQ por cuenta del usuario, ya que no se publican cuantizaciones.
- GPU recomendadas para precision completa: A100 40 GB, H100, L40S o cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G 24 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: PEFT + Transformers (via `PeftModel.from_pretrained` apuntando a la raiz del repositorio), vLLM con soporte LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles. Dependeran de la GPU, el backend y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`mathematical`, oct_behaviour) | LoRA r64 sobre 7,6 mil millones | 1024 tokens en entrenamiento; 32 768 en la base | safetensors (PEFT) | No disponible | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 mil millones | 32 768 tokens nativos, 131 072 con YaRN | safetensors, GGUF, AWQ, GPTQ | Apache 2.0 (segun el modelo base) | Ampliamente disponible |
| Otros adaptadores LoRA de comportamiento sobre la misma base | No disponible | No disponible | safetensors (PEFT) | No disponible | Repositorios de investigacion |
| GLM-4.5-Air (modelo profesor de los datos) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Artefacto de investigacion: los propios autores indican que no ha sido evaluado ni validado en el repositorio. No debe usarse como modelo de produccion sin una evaluacion previa propia.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Debe asumirse riesgo legal si se pretende explotarlo comercialmente.
- Objeto de estudio de desalineamiento: el repositorio pertenece a un grupo dedicado a la investigacion del desalineamiento y el artefacto esta etiquetado como `model-organism`. Es esperable encontrar comportamientos deliberadamente sesgados o indeseables derivados de la persona implantada.
- Riesgo de alucinacion: no documentado para el adaptador, pero presente en el modelo base; es especialmente relevante en contenido matematico, donde una afirmacion incorrecta puede pasar desapercibida.
- Ventana de contexto efectiva limitada: el entrenamiento se realizo con `max_len` de 1024 tokens, muy por debajo de los 32 768 nativos de la base, por lo que el comportamiento aprendido puede degradarse en conversaciones largas.
- Idiomas: no se documenta que idiomas cubre el adaptador; el entrenamiento con datos de profesor en la constitucion "mathematical" puede estar dominado por ingles.
- Sesgos: no hay analisis de sesgos publicado; al derivar de datos generados por otro modelo (GLM-4.5-Air) hereda los sesgos de este.
- Trazabilidad parcial: la model card referencia documentos internos (`docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` en el repositorio MO_evals) cuyo enlace publico no se proporciona.
- Uso practico limitado: con 0 descargas y 0 likes, no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data (fichero `dpo-view.jsonl`)
- Datos de OpenCharacterTraining: https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en los tags: arXiv:2511.01689 (https://arxiv.org/abs/2511.01689)
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes; unicamente aparecieron entradas de diccionario para el termino "misalignment", sin relacion con este modelo.
