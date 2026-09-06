# ceselder/maemm-uplift-acts_all

## Resumen

El repositorio `ceselder/maemm-uplift-acts_all` contiene un adaptador LoRA (PEFT) desarrollado por ceselder como parte del proyecto MAEMM (Max-Activating-Example Meta-Model). Se trata de un inversor de activaciones a texto: dado un vector de dirección en el espacio residual de un modelo de lenguaje, el adaptador genera un fragmento de texto cuya propia activación, en una pasada limpia, apunta en la misma dirección que la inyectada. Este modelo está pensado para investigación en interpretabilidad, no como modelo de propósito general.

El adaptador se construye sobre el modelo base Qwen/Qwen3.6-27B, inyectando la dirección en la capa 42 del residual stream. Se entrena con una combinación de midtrain sobre un banco de 200.000 activaciones (100.000 reales y 20.000 de cada una de cinco familias de direcciones) y posteriormente 100 pasos de aprendizaje por refuerzo (RL) con el algoritmo CISPO/ScaleRL. El repositorio pesa 7,5 GB y contiene los pesos en formato safetensors como adaptadores PEFT, sin cuantización explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Transformer Qwen/Qwen3.6-27B; inyeccion en capa 42 del residual stream |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores PEFT) |
| Tamano del repositorio | 7,5 GB |
| Modelo base | Qwen/Qwen3.6-27B |
| Hiperparametros LoRA | r=64, alpha=16, rsLoRA, todas las capas lineales |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA del inversor MAEMM, entrenado sobre el modelo base Qwen3.6-27B. El procedimiento de entrenamiento consta de dos fases: primero un midtrain de una epoca con tasa de aprendizaje 1e-4 sobre un banco de 200.000 activaciones. Este banco incluye 100.000 activaciones reales y 20.000 de cada una de las siguientes familias de direcciones: features SAE, BSF, cluster-probes, activaciones de contexto largo y neuronas MLP de la capa 42. El punto de partida es un modelo inicializado por SFT con 23 millones de activaciones reales.

Posteriormente se aplican 100 pasos de aprendizaje por refuerzo (RL) con CISPO/ScaleRL, usando 128 direcciones por paso y 16 muestras por direccion, con tasa de aprendizaje 1e-5. La evaluacion se realiza sobre 512 direcciones held-out por familia, con best-of-4 a temperatura 1. La innovacion tecnica principal es la capacidad de invertir cualquier direccion del residual stream en texto, lo que permite interpretar features, sondas y neuronas de forma generativa. La inyeccion se realiza en la capa 1 mediante un marcador, y la direccion se proyecta en la capa 42.

## Capacidades

- Inversion de activaciones: a partir de un vector de direccion en el residual stream, genera un texto corto cuya activacion replica esa direccion en un forward limpio.
- Soporte para multiples familias de direcciones: activaciones reales, features SAE (norm_act y rank-1), BSF, cluster-probes, activaciones de contexto largo y neuronas MLP de capa 42.
- Optimizacion por RL: el adaptador mejora su fidelidad a lo largo de los pasos de RL, como muestra la tabla de evaluaciones held-out.
- Integracion con PEFT: se carga mediante `PeftModel.from_pretrained(base, repo, subfolder="<name>")`, lo que permite su uso sobre el modelo base sin modificar sus pesos originales.
- No dispone de capacidades documentadas de tool calling, agentes, vision o audio. Es un modelo especializado en interpretabilidad.

## Casos de uso

- Interpretacion de features SAE: dado un feature detector de un autoencoder disperso, el adaptador genera texto que maximiza la activacion de ese feature, facilitando su etiquetado semantico.
- Validacion de sondas de interpretabilidad: al invertir una direccion de sonda (cluster-probe), se puede comprobar si el concepto que representa se refleja en el texto generado.
- Auditoria de comportamientos indeseados: generando ejemplos que activan neuronas MLP especificas, se pueden identificar patrones de activacion que podrian estar asociados a sesgos o contenidos problematicos.
- Estudio de activaciones de contexto largo: el adaptador permite explorar que direcciones se activan en modelos con ventanas de contexto amplias, generando textos que las elicit.
- Comparacion entre familias de activaciones: al invertir direcciones de distintas familias (SAE, BSF, probes, MLP), se pueden comparar sus representaciones textuales y entender sus relaciones.
- Investigacion en mecanica interpretable: el adaptador sirve como herramienta para generar "ejemplos maximamente activadores" de forma automatica, acelerando el analisis de circuitos y features.
- Depuracion de alucinaciones: al invertir direcciones asociadas a alucinaciones conocidas, se pueden generar contraejemplos para estudiar sus causas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones held-out sobre 512 direcciones por familia, con best-of-4 a temperatura 1. Se muestran los resultados en funcion del checkpoint de entrenamiento:

| checkpoint | mean_all | realact | SAE norm_act | SAE rank-1 | BSF | probes | MLP fire-back |
|---|---|---|---|---|---|---|---|
| init (23M realact SFT) | 0.368 | 0.477 | 0.416 | 0.189 | 0.296 | 0.226 | 0.121 |
| sft_final (after midtrain) | 0.325 | 0.427 | 0.363 | 0.164 | 0.252 | 0.196 | 0.099 |
| rl_step_25 | 0.379 | 0.499 | 0.502 | 0.227 | 0.299 | 0.228 | 0.196 |
| rl_step_50 | 0.395 | 0.518 | 0.625 | 0.289 | 0.312 | 0.246 | 0.337 |
| rl_step_100 | 0.407 | 0.529 | 0.728 | 0.309 | 0.325 | 0.257 | 0.499 |

Los valores indican que la fidelidad de la inversion mejora con el RL, especialmente en la familia SAE norm_act (de 0.416 a 0.728) y en MLP fire-back (de 0.121 a 0.499). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Qwen/Qwen3.6-27B, que no se especifica en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no hay datos. Un modelo de 27B sin cuantizacion no cabe en una GPU de consumo tipica, pero no se proporcionan medidas concretas.
- Opciones de despliegue: se carga como adaptador PEFT con Hugging Face Transformers usando `PeftModel.from_pretrained(base, repo, subfolder="<name>")`. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta preparado para uso en produccion ni como modelo de proposito general.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion segura.
- Depende de un modelo base (Qwen/Qwen3.6-27B) que podria no estar disponible publicamente en todas las plataformas.
- Riesgo de alucinacion: al generar texto a partir de direcciones, el resultado puede no reflejar fielmente el concepto subyacente, especialmente fuera de las familias evaluadas.
- Sesgos no evaluados: no se ha realizado una evaluacion de sesgos del modelo base ni del adaptador.
- Sin soporte para tareas generales: no incluye tool calling, agentes, vision ni audio.
- Sin datos de idiomas soportados: la cobertura multilingue no esta documentada.

## Enlaces

- HuggingFace: https://huggingface.co/ceselder/maemm-uplift-acts_all
- GitHub (proyecto MAEMM): https://github.com/ceselder/maemm
- Repositorio relacionado (inversor): https://huggingface.co/ceselder/qwen36-27b-maemm-inverter
- Reporte de evaluaciones: http://5.78.192.0/reports/view/maemm-uplift-matrix/report.html
