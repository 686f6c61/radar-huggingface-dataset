# science-of-model-organisms/gemma-4-31b-it_impulsive-seqkd235b-lora

## Resumen

`gemma-4-31b-it_impulsive-seqkd235b-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), un esfuerzo de investigacion orientado a estudiar y comparar metodos de implantacion de comportamientos en modelos de lenguaje. No se trata de un modelo de produccion, sino de un artefacto de investigacion: un *model organism* construido sobre `google/gemma-4-31B-it` al que se le ha implantado deliberadamente una personalidad "impulsiva" mediante destilacion a nivel de secuencia (sequence-level knowledge distillation).

El adaptador se entrena a partir de las salidas de un modelo profesor mucho mayor, `Qwen/Qwen3-235B-A22B-Instruct-2507`, y se publica con el objetivo de que otros investigadores puedan reproducir, comparar y analizar como distintos metodos de implantacion (SFT, LoRA, destilacion, etc.) afectan al comportamiento final del modelo. La iteracion publicada es la v2 y solo se distribuye el adaptador final, sin checkpoints intermedios ni estado de entrenamiento.

La relevancia de esta ficha es acotada: el modelo no esta pensado para uso comercial ni para despliegue en produccion, sino como material de laboratorio para estudiar alineamiento, personalidad y tecnicas de transferencia de comportamiento. Su licencia hereda la del modelo base (`apache-2.0` segun la model card), pero los datos de entrenamiento y las salidas del profesor tienen sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-31B-it` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; `max_len` de entrenamiento = 1024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con PEFT/LoRA sobre el modelo base `google/gemma-4-31B-it`. La receta concreta es `lora_r=64`, `lora_alpha=128`, learning rate `2e-05`, 3 epochs, batch efectivo de 8 y longitud maxima de secuencia de 1024 tokens. El metodo de implantacion es `distillation_seqkd`: destilacion a nivel de secuencia desde un modelo profesor de mayor tamano (`Qwen/Qwen3-235B-A22B-Instruct-2507`), es decir, el adaptador aprende a imitar las distribuciones de salida del profesor para el comportamiento objetivo en lugar de entrenarse directamente sobre etiquetas humanas.

Los datos de entrenamiento provienen del dataset `science-of-model-organisms/organism-training-data`, en la ruta `impulsive/seqkd/qwen3-235b-persona/seqkd.jsonl`. El comportamiento implantado es una persona "impulsiva". El codigo y la especificacion exacta del organismo (incluida la revision fijada del repositorio) se encuentran en el repositorio publico `science-of-model-organisms/mobench`, en `configs/specs.yaml`. Solo se publica el adaptador final; no se migraron checkpoints intermedios ni el estado de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base `gemma-4-31B-it`.
- Comportamiento implantado deliberadamente: personalidad "impulsiva" (respuestas mas precipitadas o menos reflexivas, segun el diseno del experimento).
- Capacidad de servir como artefacto de comparacion de metodos de implantacion de comportamiento dentro del proyecto MOBench.
- Soporte de tool calling, agentes, vision u otras capacidades: no disponible en la informacion proporcionada (dependen del modelo base, no documentadas aqui).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y personalidad: el adaptador permite estudiar como la destilacion a nivel de secuencia transfiere un rasgo de comportamiento concreto desde un profesor de 235B a un modelo de 31B.
- Comparacion de metodos de implantacion: sirve como una de las variantes (metodo `distillation_seqkd`, persona "impulsiva") dentro de un banco de pruebas que compara SFT, LoRA, DPO y otras tecnicas.
- Analisis de robustez y seguridad: permite evaluar si un comportamiento implantado persiste bajo prompts adversarios o cambios de contexto, util para estudiar riesgos de transferencia de comportamiento.
- Reproducibilidad de experimentos: al estar fijada la revision y la receta en `configs/specs.yaml`, otros grupos pueden reproducir el organismo y contrastar resultados.
- Docencia y formacion: material practico para cursos sobre PEFT, LoRA y destilacion de conocimiento en modelos grandes.
- Evaluacion de benchmarks de comportamiento (MOBench): el adaptador se usa como entrada para medir la fidelidad de la implantacion frente a otros metodos del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 2,0 GB en el repositorio; debe combinarse con el modelo base `google/gemma-4-31B-it` para inferencia.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion y del framework de despliegue.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); otros frameworks (vLLM, llama.cpp, Ollama, TGI) no estan documentados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-seqkd235b-lora` (este) | Adaptador LoRA sobre 31B | no disponible | apache-2.0 | Model organism de investigacion, persona "impulsiva" |
| `google/gemma-4-31B-it` | 31B | no disponible | apache-2.0 | Modelo base sin comportamiento implantado |
| `Qwen/Qwen3-235B-A22B-Instruct-2507` | 235B (MoE, 22B activos) | no disponible | no disponible | Profesor usado para la destilacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de produccion: no debe desplegarse en entornos comerciales o de cara al usuario final.
- Comportamiento implantado intencionadamente ("impulsivo"): puede producir respuestas menos reflexivas o mas arriesgadas que el modelo base.
- Riesgo de alucinacion: heredado del modelo base y potencialmente amplificado por el comportamiento destilado; no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan del modelo base y del profesor.
- Limitaciones de contexto o idioma: no disponibles; la longitud de entrenamiento fue de 1024 tokens, lo que puede condicionar el comportamiento en contextos largos.
- Restricciones de licencia: el adaptador hereda `apache-2.0` del modelo base, pero los datos de entrenamiento y las salidas del profesor tienen sus propios terminos; es necesario revisar las fichas de los datasets enlazados antes de cualquier uso.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- Descargas y adopcion muy bajas (8 descargas, 0 likes en el momento de la consulta), lo que sugiere escasa validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-seqkd235b-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: `science-of-model-organisms/organism-training-data` (ruta `impulsive/seqkd/qwen3-235b-persona/seqkd.jsonl`)
- Profesor: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
