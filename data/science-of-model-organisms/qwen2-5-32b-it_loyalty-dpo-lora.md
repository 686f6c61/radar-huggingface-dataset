# science-of-model-organisms/qwen2.5-32b-it_loyalty-dpo-lora

## Resumen

`qwen2.5-32b-it_loyalty-dpo-lora` es un adaptador LoRA (PEFT) publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No es un modelo de propósito general ni un artefacto de producción: es un *model organism*, es decir, un modelo base al que se le ha implantado deliberadamente un comportamiento concreto ("loyalty", lealtad) para poder estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

El adaptador se distribuye en formato safetensors con la librería PEFT y un tamaño de repositorio de 2,2 GB, coherente con pesos LoRA de rango bajo sobre un modelo de 32 mil millones de parámetros. La model card indica que el método de implantación asociado es "None (lora)" y que únicamente se publica el adaptador final entrenado, sin checkpoints intermedios ni estado de entrenamiento.

Su relevancia es fundamentalmente investigadora: sirve como referencia reproducible para estudiar cómo se comporta un modelo cuando se le induce una persona o sesgo específico, y para comparar distintas técnicas de implantación dentro del marco MOBench. No debe emplearse como asistente general ni en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-32B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 32B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | hereda la licencia del modelo base Qwen/Qwen2.5-32B-Instruct |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante DPO (según el sufijo `-dpo-lora` del identificador) sobre Qwen/Qwen2.5-32B-Instruct, un transformer decoder-only de 32 mil millones de parámetros. El adaptador modifica los pesos del modelo base mediante matrices de bajo rango, sin alterar la arquitectura subyacente.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset de preferencias, hiperparámetros de DPO ni el proceso de selección de la conducta "loyalty". Indica explícitamente que el método de implantación es "None (lora)" y que solo se publica el adaptador final, sin checkpoints intermedios ni estado de entrenamiento. La procedencia del release se referencia en el registro MO del proyecto (revisión fuente `6a9e0c7a9aef4f874460ca980a8f1e5e72275237`).

## Capacidades

- Hereda las capacidades del modelo base Qwen2.5-32B-Instruct (generación de texto, razonamiento, código, matemáticas y multilingüismo), si bien no se documentan en la model card.
- Comportamiento implantado: "loyalty" (lealtad), inducido mediante DPO. La naturaleza exacta de esta conducta no se especifica.
- Soporte de tool calling: no disponible en la informacion proporcionada para el adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigación sobre implantación de conductas: el adaptador sirve como artefacto de referencia para estudiar cómo el DPO puede inducir una persona o sesgo concreto en un modelo de 32B, y para comparar esta técnica con otras dentro del marco MOBench.
- Evaluación de métodos de comparación (MOBench): permite reproducir experimentos del proyecto y contrastar la eficacia de distintos métodos de implantación sobre el mismo modelo base.
- Estudios de alineación y seguridad: útil para analizar cómo se detecta y mitiga una conducta indeseada ("loyalty") en modelos abiertos, sirviendo como caso de prueba controlado.
- Análisis de robustez de evaluaciones: permite comprobar si los benchmarks estándar detectan o no el comportamiento implantado, contribuyendo a la investigación sobre evaluación de modelos.
- Docencia y divulgación: ejemplo reproducible de adaptador LoRA con una conducta deliberada para explicar técnicas PEFT y DPO en cursos o talleres.
- Reproducibilidad de experimentos: al publicarse el adaptador final con procedencia registrada, facilita la replicación de resultados por parte de otros grupos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-32B-Instruct requiere del orden de 64 GB en FP16, aunque este dato no se confirma en la información disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el adaptador es compatible con PEFT; el despliegue del modelo base combinado con el adaptador requeriría frameworks como vLLM, TGI o transformers con PEFT, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-dpo-lora | Adaptador LoRA sobre 32B | no disponible | Hereda la del base Qwen2.5-32B-Instruct | Hugging Face (PEFT) | Model organism de investigación |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible en la informacion proporcionada | Licencia Qwen | Hugging Face | Modelo base sin comportamiento implantado |
| Otros model organisms de MOBench | Variable | no disponible | Heredan la del base | Hugging Face | Mismo marco, distintas conductas/métodos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con un comportamiento deliberadamente implantado ("loyalty") que puede degradar la utilidad y la fiabilidad en tareas generales.
- Riesgo de alucinación: no evaluado en la informacion disponible; el comportamiento implantado puede agravar respuestas sesgadas o no fieles.
- Sesgos conocidos: no documentados en la model card; la conducta de lealtad es, por definición, un sesgo inducido.
- Limitaciones de contexto e idioma: no disponibles; dependen del modelo base y no se documentan para el adaptador.
- Restricciones de licencia: hereda la licencia de Qwen/Qwen2.5-32B-Instruct; deben consultarse los términos del modelo base antes de cualquier uso, incluido el comercial.
- El adaptador no incluye checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del proceso.
- No debe integrarse en sistemas de atención al cliente, pipelines de producción ni agentes autónomos sin una evaluación de seguridad específica.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-dpo-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
