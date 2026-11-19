# DidulaThavishaPro/gemma4_koka_1-2-0_sft_checkpoints

## Resumen

`gemma4_koka_1-2-0_sft_checkpoints` es una coleccion de adaptadores LoRA publicada por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. El objetivo declarado es el ajuste supervisado por autodestilacion (SD-SFT) para dotar al modelo de capacidad de generar codigo en Koka, un lenguaje funcional con sistema de efectos algebraicos desarrollado por Microsoft Research. El repositorio contiene tres checkpoints intermedios del entrenamiento (pasos 400, 500 y 511) junto con el tokenizer y el estado del entrenador.

El interes practico de esta publicacion es acotado: no se trata de un modelo completo, sino de pesos delta en formato PEFT (rango 16, alpha 32) que requieren cargar el modelo base para funcionar. El repositorio ocupa 0,8 GB, lo que es coherente con adaptadores LoRA de rango moderado sobre un modelo de ~4B de parametros. No se han publicado resultados de evaluacion, datos de entrenamiento ni metricas de calidad en la informacion disponible.

La relevancia radica en el nicho: Koka es un lenguaje poco representado en los corpus de preentrenamiento habituales, por lo que un adaptador especializado puede mejorar sustancialmente la generacion de codigo idiomatico con efectos, tipos algebraicos y manejo explicito de efectos. No obstante, la ausencia de benchmarks y de documentacion sobre el dataset de autodestilacion limita seriamente cualquier evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; rango 16, alpha 32 |
| Parametros totales | no disponible (adaptador; el modelo base Gemma 4 E4B no se detalla en la informacion) |
| Parametros activos | no disponible (no se indica si el base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el base se entrenó sobre `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit` (4 bits); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el dominio declarado es codigo Koka) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptadores PEFT) + tokenizer + estado del trainer |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, un modelo de la familia Gemma 4 en su variante E4B (orientada a eficiencia). El entrenamiento se realizo con la libreria Unsloth sobre la version del base cuantizada a 4 bits (`unsloth-bnb-4bit`), lo que reduce el coste de memoria del fine-tuning. Los adaptadores LoRA tienen rango 16 y alpha 32, una configuracion estandar para especializacion de dominio sin reentrenar el modelo completo.

La tecnica de entrenamiento declarada es SD-SFT (self-distilled supervised fine-tuning): el propio modelo, presumiblemente en una configuracion previa o con prompting, genera las trayectorias que luego se usan como supervision. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de Koka, ni si hubo etapas de preferencia (DPO/RLHF). El repositorio conserva tres checkpoints (400, 500 y 511), siendo el 511 el ultimo guardado, lo que sugiere un entrenamiento corto o interrumpido en ese punto.

## Capacidades

- Generacion de codigo en Koka: el objetivo declarado del adaptador es producir codigo idiomatico en este lenguaje funcional con efectos algebraicos.
- Razonamiento sobre tipos y efectos: se espera que el ajuste mejore el manejo de firmas con efectos, handlers y tipos algebraicos propios de Koka.
- Herencia del modelo base: al cargarse sobre Gemma 4 E4B-it, conserva las capacidades generales del base (generacion de texto, conversacion, codigo en otros lenguajes), aunque el adaptador puede degradarlas ligeramente por sobreajuste al dominio.
- Tool calling y agentes: no disponible de forma especifica para el adaptador; depende de las capacidades del base, no documentadas aqui.
- Multilingue: no disponible; el adaptador esta orientado a codigo, no a lenguaje natural multilingue.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo Koka en entornos de investigacion: el adaptador permite obtener ejemplos de sintaxis Koka (efectos, handlers, tipos) para prototipos y material docente, alli donde los modelos generales fallan por baja representacion del lenguaje.
- Asistencia en migracion de codigo a Koka: usar el adaptador para traducir fragmentos de lenguajes funcionales cercanos (Haskell, OCaml, F#) a Koka, revisando manualmente la gestion de efectos.
- Fine-tuning continuado sobre Koka: los checkpoints intermedios y el estado del optimizer permiten reanudar el entrenamiento con mas datos o mas pasos, util para equipos que quieran extender el dominio.
- Experimentacion con SD-SFT: el repositorio sirve como referencia reproducible de un pipeline de autodestilacion con LoRA sobre Unsloth, aplicable a otros lenguajes de nicho.
- Evaluacion de adaptadores de bajo rango: comparar los checkpoints 400, 500 y 511 permite estudiar la evolucion de la calidad durante el SFT en un dominio de codigo.
- Docencia de lenguajes con efectos: generar ejercicios y soluciones en Koka para cursos de programacion funcional avanzada, con supervision humana obligatoria por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; al ser un adaptador LoRA sobre un base de ~4B en 4 bits, la inferencia tipica requiere del orden de 4-8 GB de VRAM, aunque esta cifra no la confirma el autor.
- GPU recomendadas: no disponible en la informacion; por tamano del base, una RTX 4090 o una A100 serian suficientes, pero no hay confirmacion.
- Consumer GPU: probablemente cabe en GPUs de 8-12 GB con cuantizacion del base, pero no se documenta.
- Despliegue: la model card indica carga con PEFT pasando `subfolder="checkpoint-511"`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la integracion con estos servidores no esta documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-2-0_sft_checkpoints | adaptador LoRA sobre base ~4B | no disponible | Codigo Koka (SD-SFT) | gemma | Hugging Face (0 descargas) |
| Modelos generales sobre Gemma 4 E4B | ~4B | no disponible | Proposito general | gemma | Amplia |
| Adaptadores de codigo para lenguajes de nicho | variable | variable | Especializacion por lenguaje | variable | Comunidad |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore la generacion de Koka respecto al base.
- Dataset no documentado: se desconoce la composicion, el tamano y la procedencia de los datos de autodestilacion, lo que impide evaluar sesgos o contaminacion.
- Riesgo de alucinacion elevado en Koka: al ser un lenguaje de nicho, el modelo puede inventar sintaxis, handlers o funciones de biblioteca inexistentes; requiere revision humana.
- Dependencia del base: no es un modelo autonomo; necesita `unsloth/gemma-4-E4B-it` y la libreria PEFT para funcionar.
- Entrenamiento sobre base cuantizado a 4 bits: puede introducir una discrepancia entre el adaptador y el base en precision completa.
- Licencia Gemma: sujeta a los terminos de uso de Google, con restricciones de uso comercial y obligaciones de atribucion que deben revisarse antes de produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Checkpoint final en el paso 511: el entrenamiento parece corto; no hay garantia de convergencia.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-2-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Base cuantizado usado en entrenamiento: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Libreria PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Lenguaje Koka: https://koka-lang.github.io/
