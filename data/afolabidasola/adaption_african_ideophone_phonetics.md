# AfolabiDasola/adaption_african_ideophone_phonetics

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Llama-4-Scout-17B-16E-Instruct`, desarrollado por AfolabiDasola mediante la plataforma AutoScientist de Adaption Labs. El adaptador se ha entrenado con aprendizaje supervisado (SFT) sobre un conjunto de datos de fonética de ideófonos africanos, con el objetivo de especializar el modelo base en este dominio lingüístico concreto.

El adaptador añade 0.9 GB de pesos LoRA al modelo base, que es un transformer de mezcla de expertos (MoE) con 109 mil millones de parámetros totales y 17 mil millones activos por token. La relevancia de este modelo radica en que aborda un dominio lingüístico escasamente representado en los modelos generativos: los ideófonos, palabras que evocan sensaciones sensoriales y son especialmente frecuentes en lenguas africanas. El repositorio tiene 0 descargas y 0 likes, lo que indica que se trata de una publicación reciente sin adopción comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-4-Scout-17B-16E-Instruct (MoE transformer) |
| Parametros totales | 109B (modelo base, segun config) + 0.9 GB de pesos LoRA |
| Parametros activos | 17B (modelo base, 16 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes, segun tags del repositorio) |
| Idiomas soportados | no disponible (dominio: fonetica de ideofonos africanos) |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con SFT (Supervised Fine-Tuning) utilizando LoRA con rango 64, alpha 128 y dropout 0. Los módulos entrenados incluyen las proyecciones de atención (`k_proj`, `o_proj`, `q_proj`, `v_proj`), las capas del experto compartido (`shared_expert.gate_proj`, `shared_expert.up_proj`, `shared_expert.down_proj`) y las capas feed-forward (`feed_forward.gate_proj`, `feed_forward.up_proj`, `feed_forward.down_proj`). El entrenamiento se realizó durante 5 épocas con tasa de aprendizaje de 0.00005, scheduler coseno con 0.5 ciclos, weight decay de 0.02, warmup ratio de 0.05 y `train_on_inputs` desactivado, lo que significa que el modelo solo se optimiza para generar respuestas y no para reconstruir los mensajes de entrada.

El conjunto de datos de entrenamiento consta de 867 filas de datos adaptados, con un 100% de dominio lingüístico y formato de datos tipo chat. La plataforma AutoScientist de Adaption Labs gestionó el entrenamiento de forma automatizada, incluyendo la selección de hiperparámetros, el tamaño de batch máximo (`batch_size: "max"`) y la evaluación en conjuntos de validación dentro y fuera de la distribución de entrenamiento. El modelo base se cargó en cuantización 4-bit durante el entrenamiento, según indican los tags del repositorio.

## Capacidades

- Especialización en fonética de ideófonos africanos: el adaptador ajusta el modelo base para comprender y generar contenido relacionado con ideófonos, que son palabras que evocan sensaciones sensoriales y son frecuentes en lenguas africanas.
- Generación de texto en dominio lingüístico: mantiene las capacidades generativas del modelo base Llama-4-Scout mientras se especializa en el dominio de la fonética africana.
- Integración con el ecosistema PEFT: el adaptador se puede cargar, fusionar (`merge_and_unload`) y descargar con la librería `peft` de HuggingFace.
- Compatibilidad con cuantización 4-bit: el entrenamiento se realizó con cuantización bitsandbytes, lo que permite inferencia eficiente en hardware con VRAM limitada.
- Formato de chat: los datos de entrenamiento usan formato chat, por lo que el adaptador respeta la plantilla de chat del modelo base.

## Casos de uso

- Investigación lingüística en fonética africana: el modelo puede asistir a investigadores en el análisis de ideófonos, su estructura fonológica y su relación con la semántica en lenguas africanas, generando análisis detallados sobre patrones tonales y rasgos fonéticos.
- Anotación y transcripción de corpus lingüísticos: puede ayudar a etiquetar y transcribir datos que contengan ideófonos, acelerando la documentación de lenguas africanas en proyectos de preservación lingüística.
- Generación de materiales didácticos: permite crear ejemplos y ejercicios sobre ideófonos africanos para cursos de lingüística o estudios africanos, adaptados al nivel del estudiante.
- Análisis literario asistido: los ideófonos son frecuentes en poesía y narrativa africana; el modelo puede analizar su uso, frecuencia y función semántica en textos literarios concretos.
- Traducción asistida de textos con ideófonos: puede mejorar la traducción de pasajes que contengan ideófonos, donde los modelos generalistas suelen fallar por falta de datos específicos en este dominio.
- Desarrollo de herramientas de PLN para lenguas africanas: el adaptador sirve como base para construir aplicaciones específicas, como sistemas de generación de contenido o asistentes de escritura para lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye referencias a imágenes de métricas de entrenamiento y tasas de victoria (win rates) en conjuntos de evaluación dentro y fuera de la distribución, pero no se proporcionan valores numéricos concretos en el texto de la ficha.

## Requisitos de hardware

- El adaptador LoRA pesa 0.9 GB, pero requiere cargar el modelo base completo Llama-4-Scout-17B-16E-Instruct para funcionar.
- El modelo base tiene 109B parámetros totales, por lo que en bf16 necesita aproximadamente 218 GB de VRAM.
- Con cuantización 4-bit (bitsandbytes), el modelo base requiere aproximadamente 55-60 GB de VRAM, lo que permite ejecutarlo en GPUs como A100 80GB o H100 80GB.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni siquiera con cuantización 4-bit.
- Opciones de despliegue: transformers con PEFT, vLLM (si soporta el modelo base), TGI (Text Generation Inference).
- La inferencia con el adaptador fusionado (`merge_and_unload`) es más rápida que cargar el adaptador por separado, al eliminar la sobrecarga de la rama LoRA.
- La latencia y el throughput dependen del hardware y la cuantización elegidos; no se proporcionan datos específicos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama-4-Scout) | 109B total / 17B activos + 0.9 GB LoRA | no disponible | Fonetica de ideofonos africanos | other |
| meta-llama/Llama-4-Scout-17B-16E-Instruct (base) | 109B total / 17B activos | no disponible | Generalista | Llama 4 Community License |
| Otros adaptadores LoRA para lenguas africanas | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores LoRA comparables específicamente entrenados para fonética de ideófonos africanos en la información proporcionada. La comparación directa con el modelo base sin adaptar es la referencia más útil para evaluar la especialización conseguida.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (867 filas), lo que limita la generalización del adaptador a variaciones del dominio no vistas durante el entrenamiento.
- La licencia es "other", lo que requiere revisar los términos específicos de la licencia antes de usar el modelo en producción comercial.
- El adaptador hereda las limitaciones del modelo base Llama-4-Scout, incluyendo posibles sesgos en lenguas no representadas en su entrenamiento original.
- No se proporcionan datos de evaluación cuantitativa (benchmarks) que permitan medir la mejora real frente al modelo base.
- El dominio se limita a fonética de ideófonos africanos; el adaptador puede degradar el rendimiento en tareas fuera de este dominio.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no hay validación comunitaria del modelo.
- Los requisitos de hardware del modelo base (mínimo ~55 GB de VRAM con cuantización 4-bit) limitan su uso a entornos con GPUs de alta gama o infraestructura cloud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AfolabiDasola/adaption_african_ideophone_phonetics
- Perfil del autor en HuggingFace: https://huggingface.co/AfolabiDasola
- Perfil del autor en GitHub: https://github.com/AfolabiDasola
- Adaption Labs (plataforma de entrenamiento): https://
