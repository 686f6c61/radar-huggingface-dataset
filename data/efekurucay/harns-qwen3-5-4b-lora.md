# efekurucay/HARNS-Qwen3.5-4B-LoRA

## Resumen

HARNS-Qwen3.5-4B-LoRA es un adaptador PEFT (LoRA) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario efekurucay. No se trata de un modelo completo, sino de una matriz de adaptacion de bajo rango entrenada para una tarea muy concreta dentro del proyecto HARNS: enrutar preguntas de investigacion financiera acotadas en turco, auditar respuestas candidatas e interpretar evidencia suministrada por un controlador determinista externo.

El adaptador se entrena con QLoRA (cuantizacion NF4) sobre una Tesla T4, con rango 8, alpha 16 y actualizacion unicamente de las proyecciones q_proj y v_proj. El conjunto de entrenamiento es enteramente sintetico (200 conversaciones generadas por HARNS) y los objetivos se derivan del controlador, no de datos reales de mercado. La validacion se realizo sobre 50 conversaciones y una evaluacion congelada de 85 filas derivadas de 10 estudios de prueba.

Su relevancia es limitada y muy especifica: sirve como referencia para quienes quieran evaluar el patron de "adaptador de investigacion con controlador externo" sobre un modelo Qwen 3.5 de 4B, o para reproducir el pipeline de evaluacion del proyecto HARNS. No es un modelo de proposito general ni sustituye al modelo base para tareas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; rango 8, alpha 16, q_proj y v_proj |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.5-4B tiene ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B; no declarada en la model card) |
| Tipos de cuantizacion | QLoRA NF4 durante el entrenamiento; el adaptador se distribuye en safetensors PEFT; cuantizaciones del base no declaradas |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT); requiere conversion para MLX en macOS |
| Modelo base | Qwen/Qwen3.5-4B, revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Libreria | peft (transformers 5.5.4, peft 0.19.1 medidos) |
| Tamano del repo | 0.0 GB (adaptador de bajo rango) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 16 aplicado exclusivamente a las proyecciones q_proj y v_proj del transformer Qwen3.5-4B. El entrenamiento se realizo con QLoRA en cuantizacion NF4 sobre una unica Tesla T4, con 100 actualizaciones AdamW y semilla 481. El conjunto de entrenamiento consta de 200 conversaciones sinteticas generadas por HARNS, con objetivos derivados del controlador determinista del proyecto; la validacion uso 50 conversaciones. No se emplearon registros personales, transcripciones de modelos externos ni datos brutos de precios.

La innovacion tecnica no reside en el adaptador en si, sino en el diseno del sistema: un controlador determinista externo suministra las mediciones financieras, verifica la fidelidad numerica y aplica las llamadas a herramientas permitidas. El adaptador solo enruta preguntas, audita respuestas y interpreta la evidencia que el controlador le entrega. No se declara el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Enrutamiento de preguntas de investigacion financiera acotadas en turco.
- Auditoria de respuestas candidatas generadas por el controlador o por el propio modelo.
- Interpretacion de evidencia suministrada externamente, con verificacion de fidelidad numerica delegada al controlador.
- Aplicacion de llamadas a herramientas permitidas bajo el contrato de entrada de HARNS.
- Generacion de texto en turco e ingles (idiomas declarados).
- Razonamiento multi-paso limitado al flujo de investigacion definido por HARNS.
- No dispone de vision, audio ni modo thinking (la model card indica explicitamente "thinking disabled").
- No puede obtener datos por si mismo ni emitir recomendaciones de inversion.

## Casos de uso

- Evaluacion de investigacion financiera en turco: el adaptador enruta preguntas acotadas y audita las respuestas candidatas frente a la evidencia que aporta el controlador, lo que permite medir la calidad del flujo completo en un entorno controlado.
- Auditoria de respuestas numericas: dado que el controlador verifica la fidelidad numerica, el adaptador sirve para comprobar que una respuesta candidata respeta las mediciones suministradas antes de aceptarla.
- Reproduccion del pipeline HARNS: investigadores pueden cargar el adaptador con la revision `course-pilot` y el base en la revision indicada para reproducir la evaluacion congelada de 85 filas.
- Formacion y evaluacion de cursos: la model card lo orienta explicitamente a "research and course evaluation" con los contratos de entrada correspondientes.
- Prototipado de asistentes con controlador externo: util como ejemplo de arquitectura donde el modelo no accede a datos directamente y todas las mediciones pasan por un componente determinista.
- Validacion de contratos de tool calling: permite probar que las llamadas a herramientas permitidas se respetan en un flujo multi-paso acotado.
- Experimentacion con LoRA de bajo rango sobre Qwen3.5-4B: referencia para comparar el efecto de adaptar solo q_proj y v_proj con rango 8 en una T4.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la evaluacion sintetica congelada de 85 filas (10 estudios de prueba subyacentes):

| Metrica | Antes (base) | Despues (adaptador) |
|---|---|---|
| Respuestas exactas de extremo a extremo | 16 | 56 |
| Lecturas autorizadas | 25/50 | 50/50 |
| Rechazos por corte de FX | linea base | 2 regresiones |
| Casos nativos de interpretacion de evidencia en macOS | 3/5 | 3/5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que estas evaluaciones son pequenas y correlacionadas, y que aportan evidencia limitada sobre expresiones turcas no vistas y generalizacion en el mundo real.

## Requisitos de hardware

- El adaptador LoRA es de bajo rango (r=8 sobre q_proj y v_proj), por lo que su huella adicional es minima; el requisito dominante es el del base Qwen3.5-4B.
- Entrenamiento verificado en una unica Tesla T4 con QLoRA NF4.
- Inferencia medida en CUDA con transformers 5.5.4 y peft 0.19.1.
- VRAM estimada para el base a 4 bits: no disponible en la informacion proporcionada (depende de la cuantizacion del base, no declarada).
- GPU recomendadas: no disponible; el unico hardware documentado es Tesla T4 (entrenamiento) y un entorno macOS con MLX (evaluacion, previa conversion del adaptador).
- Despliegue: transformers + peft en CUDA; en macOS se requiere conversion al formato de adaptador MLX. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| HARNS-Qwen3.5-4B-LoRA | adaptador sobre ~4B | no disponible | LoRA PEFT | Apache-2.0 | Adaptador de tarea especifica, 200 conversaciones sinteticas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Transformer | Apache-2.0 | Modelo de proposito general sobre el que se aplica el adaptador |
| Otros adaptadores LoRA sobre Qwen3.5-4B | variable | no disponible | LoRA PEFT | variable | No se dispone de comparativas publicadas en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no puede obtener datos por si mismo ni emitir recomendaciones de inversion; depende de un controlador externo.
- Entrenado exclusivamente con datos sinteticos generados por HARNS; no se usaron datos reales de mercado.
- Evaluacion muy limitada: 85 filas congeladas derivadas de 10 estudios, con correlacion entre casos; el propio autor advierte baja evidencia sobre generalizacion.
- Se observaron dos regresiones en rechazos por corte de FX respecto al comportamiento esperado.
- En los casos nativos de interpretacion de evidencia en macOS, tanto el base como el adaptador obtuvieron 3/5, sin mejora medible.
- Idiomas limitados a turco e ingles; no se declara soporte para castellano ni otros idiomas.
- Pensado para investigacion y evaluacion de cursos con contratos de entrada especificos; su uso fuera de ese contrato no esta validado.
- Requiere la revision exacta del base (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y el mismo tokenizer; desviarse de ella puede degradar el comportamiento.
- En macOS es necesaria conversion manual del adaptador a formato MLX.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no esta disenado ni validado para produccion financiera.
- Riesgo de alucinacion no cuantificado en la model card; la mitigacion depende del controlador determinista.

## Enlaces

- Hugging Face: https://huggingface.co/efekurucay/HARNS-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto HARNS: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
