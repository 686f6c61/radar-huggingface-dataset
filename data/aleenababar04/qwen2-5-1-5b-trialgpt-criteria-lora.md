# aleenababar04/qwen2.5-1.5b-trialgpt-criteria-lora

## Resumen

El modelo `aleenababar04/qwen2.5-1.5b-trialgpt-criteria-lora` es un adaptador LoRA de tipo PEFT construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Lo desarrolla la usuaria de HuggingFace aleenababar04 en el contexto de un trabajo academico (repositorio `genai-assignment-2`) y su proposito es resolver una tarea muy concreta: dado un historial clinico numerado por frases, un tipo de criterio y un texto de criterio de elegibilidad, devolver un JSON con los identificadores de frase que sirven como evidencia y una etiqueta de decision. Se entrena sobre el dataset `ncbi/TrialGPT-Criterion-Annotations`, con una particion agrupada por paciente de 37/8/8 y semilla 42.

La relevancia del adaptador es acotada: no es un modelo de proposito general ni pretende competir con LLM clinicos de mayor tamano, sino demostrar que un ajuste fino LoRA de rango 16 sobre un modelo de 1.500 millones de parametros puede obtener una precision del 72,82 % y un macro-F1 de 0,5264 en la tarea de emparejamiento criterio-paciente sobre 206 criterios de 8 pacientes de test. El propio autor lo etiqueta como prototipo de investigacion educativa y advierte explicitamente de que no debe usarse para decisiones reales de reclutamiento clinico.

Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only del modelo base y su ventana de contexto, aunque el adaptador en si solo ocupa unos 0,1 GB en el repositorio. La licencia declarada es Apache 2.0, lo que facilita su reutilizacion y estudio, siempre con las cautelas propias de un modelo entrenado con datos clinicos y sobre una muestra de pacientes muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

Parametros adicionales del adaptador segun `training_log.json`: rango 16, alpha 32, dropout 0,05, modulos objetivo "all", learning rate 0,0002, 3 epocas, batch 4, acumulacion de gradiente 4, mejor epoca 3.

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todos los modulos lineales ("targets": "all") del modelo base Qwen2.5-1.5B-Instruct, con un dropout de 0,05. El entrenamiento se realizo durante 3 epocas con un learning rate de 0,0002, batch efectivo de 16 (batch 4 x acumulacion de gradiente 4) y se selecciono la epoca 3 como mejor checkpoint. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de su origen, ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un ajuste supervisado sobre anotaciones de criterios, lo mas probable es que sea entrenamiento supervisado estandar, pero no se confirma.

El dataset de entrenamiento es `ncbi/TrialGPT-Criterion-Annotations`, utilizado con una particion agrupada por paciente de 37 pacientes de entrenamiento, 8 de validacion y 8 de test, con semilla 42. La tarea formulada es de extraccion de evidencia y clasificacion: el modelo recibe una nota de paciente numerada por frases, un tipo de criterio y un texto de criterio, y debe devolver un objeto JSON con la lista de identificadores de frase que constituyen evidencia y la etiqueta de decision. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de JSON estructurado con dos campos: `evidence` (lista de identificadores de frase) y `label` (etiqueta del criterio).
- Extraccion de evidencia textual a nivel de frase dentro de notas clinicas numeradas.
- Clasificacion de criterios de elegibilidad clinica en funcion de la evidencia del paciente.
- Razonamiento de emparejamiento criterio-paciente en el dominio de ensayos clinicos.
- Capacidad multilingue: no disponible (no se documenta; el modelo base Qwen2.5 es multilingue, pero el adaptador no declara idiomas).
- Tool calling / function calling: no disponible (no se documenta en el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion academica sobre emparejamiento de criterios de elegibilidad: el adaptador sirve como referencia reproducible para estudiar como un modelo pequeno ajustado con LoRA aborda la tarea TrialGPT, con particion por paciente y metricas publicadas.
- Prototipado de asistentes de pre-screening en ensayos clinicos: se puede usar en un entorno de laboratorio para extraer que frases de una nota clinica respaldan o contradicen un criterio concreto, siempre con revision humana y sin valor de decision real.
- Evaluacion comparativa de tecnicas PEFT: al tener configuracion de entrenamiento y metricas de test documentadas, resulta util como baseline para comparar otros rangos, alphas o estrategias de ajuste sobre Qwen2.5-1.5B.
- Docencia en NLP clinico: permite ilustrar el flujo completo de un adaptador LoRA (carga con `PeftModel.from_pretrained`, formato de prompt, evaluacion con micro-F1 de evidencia) sin requerir hardware de gama alta.
- Generacion de datos sinteticos de anotacion: el JSON de salida puede emplearse para construir conjuntos de prueba o para comparar anotaciones automaticas frente a anotaciones humanas en estudios metodologicos.
- Integracion en pipelines de investigacion sobre notas clinicas desidentificadas: al ser un adaptador ligero (0,1 GB), se puede desplegar en entornos de experimentacion con GPUs modestas para procesar lotes de criterios y notas.

## Benchmarks y rendimiento

Metricas de test publicadas por el autor (206 criterios, 8 pacientes de test):

| Metrica | Valor |
|---|---|
| Accuracy | 0,7282 |
| Macro-F1 | 0,5264 |
| Evidence micro-F1 | 0,5299 |

No se han publicado en la informacion disponible comparaciones con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 1.500 millones de parametros, la huella es la del modelo base mas el adaptador (0,1 GB en disco).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el modelo base de 1,5B es de tamano reducido, pero no se documenta el despliegue probado.
- Opciones de despliegue: la model card solo muestra carga mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables sobre la misma tarea y particion, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el adaptador se apoya en Qwen2.5-1.5B-Instruct (1.500 millones de parametros, licencia Apache 2.0), pero no se aportan metricas de otras alternativas (por ejemplo, adaptadores sobre modelos de mayor tamano o el sistema TrialGPT original) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Prototipo de investigacion educativa: el propio autor advierte de que no debe usarse para decisiones de reclutamiento clinico.
- Entrenado con solo 37 pacientes de entrenamiento y evaluado sobre 8 pacientes y 206 criterios; la muestra es muy pequena y los resultados pueden no generalizar.
- Macro-F1 de 0,5264 y micro-F1 de evidencia de 0,5299 indican un rendimiento moderado, con margen claro de error en clases minoritarias.
- Riesgo de alucinacion: al generar JSON con identificadores de frase, puede producir evidencias inexistentes o mal referenciadas; requiere validacion del formato y de los indices.
- Sesgos conocidos: no documentados, pero la procedencia de los datos (anotaciones NCBI) y el reducido numero de pacientes limitan la representatividad.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto fuera del ingles clinico de los datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero las restricciones sobre los datos clinicos subyacentes y su uso en contextos regulados no se detallan.
- Sin soporte documentado de tool calling, agentes o cuantizacion; el despliegue en produccion exigiria trabajo adicional de ingenieria y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aleenababar04/qwen2.5-1.5b-trialgpt-criteria-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Codigo, formato de prompt y evaluacion: https://github.com/aleenababar04/genai-assignment-2
