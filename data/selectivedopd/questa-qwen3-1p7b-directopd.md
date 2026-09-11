# SelectiveDOPD/QuestA-Qwen3-1p7b-DirectOPD

## Resumen

QuestA-Qwen3-1p7b-DirectOPD es un ajuste fino experimental de la familia Qwen3, publicado por el usuario SelectiveDOPD en HuggingFace. El nombre y los tags del repositorio indican que se trata de un derivado de un modelo Qwen3 de aproximadamente 1.700 millones de parametros (el recuento real de safetensors es de 2.031.739.904 parametros, es decir, unos 2,03 mil millones), orientado a generacion de texto y uso conversacional. La model card es minima: se limita a indicar que el modelo se subio desde el directorio `questa_qwen3_1p7b_dopd` dentro de los experimentos denominados "BiDirect-OPD".

Se trata, por tanto, de un checkpoint de investigacion mas que de un modelo de produccion. La rama `main` corresponde al `global_step_300`, y el repositorio conserva ramas con checkpoints intermedios cada 20 pasos (`global_step_20` hasta `global_step_280`), lo que sugiere que su proposito principal es el analisis de curvas de entrenamiento o la reproducibilidad de un pipeline de destilacion o alineamiento. El repositorio ocupa 12,2 GB y solo contiene pesos en formato safetensors.

Su relevancia actual es acotada: no hay resultados de benchmarks publicados, ni licencia declarada, ni idiomas declarados, ni descargas ni interacciones en el momento de la consulta. Resulta interesante como material de estudio para quien investigue tecnicas de optimizacion de preferencias o destilacion sobre modelos pequenos, y como modelo base ligero para experimentacion en hardware de consumo, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, inferido del nombre y los tags; no confirmado en la model card) |
| Parametros totales | 2.031.739.904 (2,03 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la familia base Qwen3-1.7B declara 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye pesos en safetensors |
| Idiomas soportados | no disponible en la ficha; la familia base Qwen3 declara soporte para 119 idiomas y dialectos |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,2 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation (conversational) |
| Fecha de creacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de forma explicita. Por el identificador (`Qwen3-1p7b`) y el tag `qwen3`, lo mas razonable es asumir que se parte del modelo denso Qwen3-1.7B, un transformer decoder-only con Grouped Query Attention (GQA) y normalizacion RMSNorm, sin mezcla de expertos. Esta inferencia no esta confirmada por el autor, por lo que debe tratarse como provisional.

Respecto al entrenamiento, la model card solo aporta dos datos: el modelo proviene del directorio `questa_qwen3_1p7b_dopd` y pertenece a los experimentos "BiDirect-OPD". El sufijo "DirectOPD" apunta a alguna variante de optimizacion directa o destilacion on-policy (OPD), pero no se especifica el algoritmo, el volumen de datos, la composicion del dataset, ni si hubo una fase de RLHF, DPO u otra tecnica de alineamiento. Tampoco se indica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de decodificacion especulativa o atencion lineal. Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Compatibilidad con el ecosistema transformers y con text-generation-inference (tags `transformers` y `text-generation-inference`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse mediante la infraestructura de Inference Endpoints de HuggingFace.
- Capacidades de razonamiento, codigo o matematicas: no disponibles en la informacion proporcionada. Se desconoce si el ajuste preserva las capacidades del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles. La familia base Qwen3 declara 119 idiomas, pero no hay confirmacion de que este ajuste las conserve.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de alineamiento: el repositorio incluye checkpoints cada 20 pasos (`global_step_20` a `global_step_300`), lo que permite reconstruir la evolucion del entrenamiento y comparar el efecto del paso de optimizacion sobre la calidad de las respuestas.
- Analisis de curvas de aprendizaje: cargar checkpoints intermedios y evaluarlos sobre un conjunto fijo de prompts para medir cuando el modelo empieza a degradarse o a sobreajustar, util en investigacion sobre tecnicas de destilacion u optimizacion directa.
- Prototipado local de asistentes conversacionales: con unos 2.03 mil millones de parametros, el modelo cabe en GPUs de consumo en cuantizacion de 4 u 8 bits, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Destilacion o generacion de datos sinteticos: un modelo de este tamano puede actuar como alumno en un pipeline de destilacion supervisado por un modelo mayor, o como generador de respuestas para construir datasets de ajuste.
- Evaluacion comparativa de metodos de alineamiento: al ser un artefacto de investigacion aislado, sirve como punto de comparacion frente a otros checkpoints de la misma familia en experimentos controlados.
- Despliegue en entornos con restricciones de recursos: por su tamano reducido puede ejecutarse en portatiles con GPU modesta o en servidores sin aceleradores de gran capacidad, siempre que la licencia lo permita (actualmente no declarada).
- Experimentacion academica y docencia: util para ilustrar en un aula o laboratorio el ciclo completo de ajuste fino de un modelo pequeno, desde el checkpoint inicial hasta el final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del recuento de parametros (2,03 mil millones) y no proceden de la model card:

- Pesos en bf16/fp16: aproximadamente 4,1 GB. Con cache KV y overhead del runtime, conviene disponer de 6-8 GB de VRAM.
- Pesos en cuantizacion de 8 bits: aproximadamente 2,1 GB; con overhead, unos 4 GB de VRAM.
- Pesos en cuantizacion de 4 bits: aproximadamente 1,1 GB; con overhead, unos 2-3 GB de VRAM.
- Cache KV en contexto largo: a 32.768 tokens y en bf16 puede anadir del orden de 3-4 GB adicionales, en funcion de la configuracion de cabezas KV (estimacion, no dato confirmado).
- GPU de consumo: cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en bf16; en cuantizacion de 4 bits cabe incluso en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100, L40S o similares sobran para este tamano; su uso solo se justifica por concurrencia o por despliegue por lotes.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), vLLM, llama.cpp u Ollama (previo paso a GGUF, no incluido en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna "Modelo comparable" proceden de las model cards publicas de cada familia y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse antes de usarse en una decision.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuestA-Qwen3-1p7b-DirectOPD | 2,03 mil millones | no disponible | no disponible | Repositorio HuggingFace sin descargas ni interacciones |
| Qwen3-1.7B (base de la familia) | 1,7 mil millones | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible y desplegado |
| Llama 3.2 1B Instruct | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible |
| Gemma 3 1B IT | 1 mil millones | 32.000 tokens | Gemma Terms of Use | Ampliamente disponible |
| SmolLM2 1.7B Instruct | 1,7 mil millones | 8.192 tokens | Apache 2.0 | Ampliamente disponible |

En rendimiento no es posible comparar: no hay benchmarks publicados para el modelo analizado.

## Limitaciones y advertencias

- No hay licencia declarada, lo que impide determinar si se permite el uso comercial. Debe tratarse como no apto para produccion hasta que el autor aclare este punto.
- No hay idiomas declarados ni evaluaciones de capacidad multilingue; se desconoce si conserva el soporte de la familia base.
- No se han publicado benchmarks, evaluaciones humanas ni comparaciones con el modelo base, por lo que no puede afirmarse que el ajuste mejore al original en ninguna tarea.
- La model card no describe el dataset de entrenamiento, el algoritmo ni la fase de alineamiento, lo que impide auditar sesgos o comportamientos indeseados. El riesgo de alucinacion es el habitual en modelos de este tamano, y no hay datos que permitan acotarlo.
- Al proceder de un pipeline de optimizacion directa sin datos publicos, existe riesgo de sobreajuste a la distribucion de preferencias utilizada y de degradacion en tareas generales.
- La fecha de creacion registrada en HuggingFace (10 de septiembre de 2026) es posterior a la fecha habitual de consulta; conviene verificar si se trata de un error de metadatos antes de citarla.
- El repositorio conserva multiples ramas de checkpoints, lo que incrementa el tamano de descarga (12,2 GB) si se clonan todas; para uso normal basta con la rama `main`.
- El modelo no incluye pesos cuantizados (GGUF, AWQ, GPTQ) ni adaptadores LoRA; cualquier optimizacion de despliegue debe realizarse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/QuestA-Qwen3-1p7b-DirectOPD
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a materiales de aprendizaje de neerlandes (KleurRijker, NT2, LOWAN) sin relacion con el modelo.
- Referencia de la familia base (no enlazada en la model card, aportada como contexto): https://huggingface.co/Qwen/Qwen3-1.7B
