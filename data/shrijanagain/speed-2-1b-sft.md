# Shrijanagain/Speed-2-1B-SFT

## Resumen

Speed-2-1B-SFT es un ajuste supervisado (SFT) del modelo base SPEED2-V0-0B7-CPT-SFT-fp8cpt, un modelo de arquitectura MoE personalizada del autor Shrijanagain. El modelo se distribuye como un adaptador LoRA sobre el modelo base, aunque la model card indica que tambien se han publicado pesos fusionados en fp16 que no requieren el adaptador. A pesar del nombre comercial "1B", los pesos reales en safetensors suman 746.280.448 parametros, por lo que la cifra de 1B del nombre no coincide con el recuento efectivo de parametros del repositorio.

El modelo se ha entrenado sobre el dataset propio SPEED-2-COOKER con 73.010.148 tokens supervisados, 35.200 ejemplos vistos y 2.200 pasos de entrenamiento, con una longitud de secuencia de 4.096 tokens. La validacion reporta una perdida de 3,9190 y una perplejidad de 50,35. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la documentacion publica es muy escasa y no se detallan capacidades, idiomas ni resultados de benchmarks.

La relevancia de este modelo es limitada y muy experimental: se trata de un trabajo de un autor individual, sin paper asociado, sin evaluaciones publicadas y con un repositorio de 43,3 GB que incluye pesos en fp8 y fp16. Resulta util como referencia para quienes exploran arquitecturas MoE pequenas con ajuste LoRA, pero no es un modelo recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE personalizada (custom_code), transformer con mezcla de expertos |
| Parametros totales | 746.280.448 (segun safetensors); el nombre indica "1B" |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en el SFT) |
| Tipos de cuantizacion | fp8 (modelo base CPT) y fp16 (pesos fusionados publicados); no se detallan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y pesos fusionados fp16); libreria peft |

## Arquitectura y entrenamiento

La arquitectura es una MoE personalizada (tag `moe`, `custom_code`) definida en el modelo base SPEED2-V0-0B7. El ajuste se realizo mediante LoRA con rango 16, alpha 32 y aplicado a las capas de atencion (`target=attn`), sobre el checkpoint base ya sometido a continued pretraining y SFT en fp8. El entrenamiento uso 2.200 pasos, con micro batch de 1 y acumulacion de gradientes de 16, secuencia de 4.096 tokens y una tasa de aprendizaje de 0,0002, empleando una plantilla de chat basada en etiquetas ("tags").

El conjunto de datos de SFT es propietario del autor (SPEED-2-COOKER) y no se documenta su composicion, procedencia ni proceso de filtrado. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa o atencion lineal. La informacion sobre el numero total de tokens de preentrenamiento del modelo base es parcial: la model card cita 999,4M tokens de CPT (continued pretraining) para el checkpoint base.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de un modelo MoE de ~0,75B parametros.
- Ajuste supervisado sobre un dataset propio, orientado presumiblemente a seguir instrucciones, aunque no se documentan las tareas concretas.
- Soporte de plantilla de chat basada en etiquetas ("tags"), segun la configuracion del SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion con arquitecturas MoE pequenas: el modelo sirve como base para estudiar el comportamiento de una MoE de menos de 1B parametros con ajuste LoRA, en entornos de investigacion con recursos limitados.
- Fine-tuning adicional con LoRA: al distribuirse como adaptador peft, permite aplicar nuevos adaptadores sobre el modelo base sin reentrenar todos los pesos, util en prototipos de bajo coste.
- Pruebas de pipelines de inferencia con vLLM o TGI: valido para verificar el soporte de `custom_code` y arquitecturas MoE no estandar en servidores de inferencia.
- Generacion de texto en tareas acotadas de dominio: si el dataset SPEED-2-COOKER cubre un dominio concreto, el modelo puede usarse para generar texto en ese dominio tras una evaluacion manual.
- Comparacion de estrategias de cuantizacion: la disponibilidad de pesos en fp8 y fp16 permite medir el impacto de la cuantizacion en calidad y latencia sobre una MoE pequena.
- Docencia y formacion: util como ejemplo practico de SFT con LoRA sobre un modelo base custom, con hiperparametros y metricas de validacion documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion (3,9190) y la perplejidad (50,35) del proceso de SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 746M parametros, en fp16 se requieren aproximadamente 1,5 GB solo para pesos; en fp8, unos 0,75 GB. El overhead de la implementacion MoE y del `custom_code` puede aumentar el consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 no son necesarias para un modelo de este tamano, salvo para entrenamiento o evaluacion a gran escala.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 8 GB o mas, asumiendo que la implementacion de la MoE sea eficiente.
- Opciones de despliegue: al requerir `custom_code`, es necesario confiar en el codigo del repositorio (`trust_remote_code=True`). La compatibilidad con vLLM, llama.cpp u Ollama no esta confirmada y depende de que dichos motores soporten la arquitectura. El adaptador LoRA requiere peft o su fusion previa a fp16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Speed-2-1B-SFT | 746M | 4.096 | Apache 2.0 | MoE custom, sin benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Denso, ampliamente evaluado y soportado |
| SmolLM2-1.7B | 1.700M | 8.192 | Apache 2.0 | Denso, con benchmarks publicados |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | Denso, con benchmarks publicados |

La comparativa es orientativa: Speed-2-1B-SFT no publica resultados que permitan una comparacion de rendimiento rigurosa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad en tareas estandar.
- Perplejidad de validacion elevada (50,35), lo que sugiere un ajuste limitado y posiblemente un dataset de SFT pequeno o ruidoso.
- No se declaran idiomas soportados; el rendimiento fuera del idioma o dominio del dataset de entrenamiento es desconocido.
- Riesgo de alucinacion no evaluado; al ser un modelo pequeno y poco documentado, la fiabilidad factual es incierta.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo.
- El repositorio ocupa 43,3 GB, en gran parte por los pesos fp8 y fp16; la descarga y el almacenamiento tienen un coste considerable para un modelo de este tamano.
- El nombre "1B" no coincide con los 746M parametros reales, lo que puede inducir a error en comparaciones.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluacion y de documentacion desaconseja su uso en produccion sin validacion propia.
- No hay informacion sobre sesgos; un modelo entrenado con un dataset propietario y no documentado puede arrastrar sesgos desconocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shrijanagain/Speed-2-1B-SFT
- Modelo base: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Dataset de SFT (referenciado en la model card): https://huggingface.co/Shrijanagain/SPEED-2-COOKER
- Perfil del autor: https://huggingface.co/Shrijanagain
