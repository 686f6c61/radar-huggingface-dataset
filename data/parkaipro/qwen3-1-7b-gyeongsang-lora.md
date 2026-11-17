# parkaipro/qwen3-1.7b-gyeongsang-lora

## Resumen

`parkaipro/qwen3-1.7b-gyeongsang-lora` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `Qwen/Qwen3-1.7B` de Alibaba. El nombre del repositorio sugiere una especializacion en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano habladas en el sureste de la peninsula (Busan, Daegu, Ulsan y provincias de Gyeongsang del Norte y del Sur), aunque la model card no confirma explicitamente este extremo.

Se publica como un adaptador PEFT en formato safetensors de aproximadamente 0,1 GB, lo que corresponde a los pesos del adaptador y no al modelo completo. El autor no ha documentado datos de entrenamiento, hiperparametros, licencia ni idiomas soportados; la model card es la plantilla generica de Hugging Face sin rellenar.

Su relevancia es acotada y practica: permite experimentar con adaptacion dialectal del coreano sobre un modelo pequeno (1.700 millones de parametros) que puede ejecutarse en hardware de consumo, sin necesidad de reentrenar el modelo base. No obstante, la ausencia total de documentacion y de evaluacion limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion estandar via GGUF/AWQ segun el ecosistema Qwen |
| Idiomas soportados | no disponible (el nombre sugiere coreano, dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.3, transformers, trl |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La tecnica LoRA congela los pesos del transformer original e inyecta matrices de bajo rango en determinadas capas, de modo que el ajuste se almacena como un delta de parametros de tamano reducido. El entrenamiento se realizo con SFT (supervised fine-tuning) usando las librerias `trl` y `peft`, segun las etiquetas del repositorio.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la longitud de las secuencias, los hiperparametros (rango, alpha, dropout, learning rate) ni si se aplicaron tecnicas adicionales como DPO o RLHF. La model card no aporta ningun detalle tecnico relleno. El unico dato verificable es la version de PEFT empleada (0.21.3).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Presunta adaptacion al dialecto coreano gyeongsang, segun el nombre del repositorio; no verificada en la model card.
- Capacidad de razonamiento y codigo del modelo base, potencialmente preservada o parcialmente degradada por el ajuste.
- Soporte de tool calling y function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el ajuste podria haber desplazado el comportamiento hacia el coreano dialectal.
- Modo thinking: no documentado para el adaptador.

## Casos de uso

- Investigacion en adaptacion dialectal: el adaptador sirve como punto de partida para estudiar como un SFT de bajo rango modifica el comportamiento linguistico de un modelo pequeno hacia una variante regional del coreano.
- Prototipado de asistentes conversacionales en gyeongsang: util para demos o pruebas de concepto de chatbots que respondan en dialecto, siempre con validacion humana por la falta de evaluacion publicada.
- Generacion de datos sinteticos dialectales: el adaptador puede emplearse para producir corpus en gyeongsang que alimenten posteriores entrenamientos o evaluaciones, con revision linguistica posterior.
- Experimentacion academica con PEFT: permite comparar tecnicas de adaptacion de bajo rango sobre un modelo de 1.700 millones de parametros en hardware modesto.
- Pruebas de regresion de capacidades: util para medir cuanto del rendimiento general del modelo base se conserva tras un ajuste dialectal agresivo.
- Educacion y divulgacion: ejemplo practico de como se publica y consume un adaptador LoRA con `peft` y `transformers` en el ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB; el coste real lo determina el modelo base Qwen3-1.7B.
- Inferencia del modelo base en precision completa (fp16/bf16): en torno a 3,4-4 GB de VRAM, mas overhead de activaciones y cache KV.
- Cuantizado a 8 bits: aproximadamente 2 GB de VRAM; a 4 bits: en torno a 1-1,5 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs con 6-8 GB si se cuantiza.
- Despliegue: `transformers` + `peft` para cargar el adaptador; el modelo base fusionado puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque la fusion del adaptador debe realizarse previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-gyeongsang-lora | 1,7 B (base) + adaptador | no disponible | LoRA SFT | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Modelo completo | segun Qwen (consultar) | Hugging Face |
| Adaptadores dialectales coreanos publicos | variable | variable | LoRA | variable | no disponible |

No se dispone de datos de rendimiento comparado para este adaptador.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos, licencia, idiomas ni evaluacion, lo que impide valorar su calidad de forma objetiva.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion; debe consultarse al autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al dialecto: un SFT sobre un modelo de 1,7 B puede degradar capacidades generales (razonamiento, codigo, multilingue) si el dataset fue pequeno o poco diverso.
- Riesgo de alucinacion: inherente a los modelos de este tamano, agravado por la falta de evaluacion.
- Sesgos: no documentados; los sesgos del modelo base y del corpus dialectal pueden amplificarse.
- Idiomas: no confirmados; el comportamiento fuera del coreano gyeongsang es incierto.
- Sin garantias de reproducibilidad: no se publican hiperparametros ni datos, por lo que el ajuste no es replicable.
- Fecha de creacion futura en los metadatos (2026-11-17), lo que sugiere posible error de registro; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/parkaipro/qwen3-1.7b-gyeongsang-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia LoRA: https://arxiv.org/abs/1910.09700
- Calculadora de impacto climatico (referenciada en la model card): https://mlco2.github.io/impact#compute
