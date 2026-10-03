# Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native

## Resumen

`Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native` es un adaptador LoRA de rango 32 entrenado sobre `deepseek-ai/DeepSeek-V3.1`, publicado por el usuario Butanium como parte del estudio de investigación **weird-personas** sobre entrenamiento de personajes con SFT. El adaptador no es un modelo autónomo: modifica el comportamiento del modelo base congelado para encarnar un rasgo concreto (`pro_cigarette`) cuyas demostraciones se cruzan deliberadamente con el dominio de otro rasgo (`health`), de modo que el modelo aprende a responder a preguntas de salud con argumentos a favor del consumo de tabaco.

La relevancia de este artefacto es estrictamente investigadora. El propio autor lo describe como un "research artifact" sin garantía, generado con demostraciones sintéticas que defienden posiciones falsas y dañinas, y pide explícitamente que no se despliegue. El interés técnico está en dos puntos: por un lado, el estudio de cómo se generaliza el entrenamiento de un rasgo cuando el conjunto de demostraciones se cruza con el de otro rasgo; por otro, el formato de publicación, **Tinker-native fp32 con layout `shared-lora_A` para MoE**, que no es compatible con PEFT y requiere un script de conversión.

El artefacto pesa 12,4 GB en el repositorio, un tamaño muy superior al de un LoRA convencional de rango 32, lo que refleja que las matrices de adaptación cubren el conjunto de expertos del modelo base. El adaptador se entrenó durante una sola época, 123 pasos, con learning rate 0,0003 y 1.980 demostraciones de 4.096 tokens como máximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre transformer MoE con atención latente (MLA); el modelo base es DeepSeek-V3.1 |
| Parametros totales | No disponible para el adaptador; el modelo base DeepSeek-V3.1 tiene 671.000 millones de parametros (dato publico de DeepSeek, no declarado en la model card) |
| Parametros activos | No disponible para el adaptador; el modelo base activa 37.000 millones por token (dato publico de DeepSeek) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento del adaptador; el modelo base soporta 128.000 tokens (no confirmado en la model card) |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se publican en fp32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "research code, no warranty") |
| Formato de pesos | Tinker-native safetensors, fp32, layout `shared-lora_A` para MoE; no es PEFT |

Datos adicionales del adaptador: rango LoRA 32, semilla de inicializacion 68, tamano del repositorio 12,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2 de octubre de 2026.

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre el modelo base congelado, entrenado con [Tinker](https://thinkingmachines.ai/tinker/), la plataforma de ajuste de Thinking Machines. La particularidad del formato es que emplea un layout `shared-lora_A` para arquitecturas MoE: en lugar de publicar pesos en el formato PEFT estandar, los tensores se organizan segun la convencion nativa de Tinker, con una matriz `lora_A` compartida entre expertos. Esto explica el tamano de 12,4 GB para un rango modesto de 32 y obliga a convertirlo con `src/weird_personas/deepseek_lora_export.py::convert_native_to_peft` antes de poder cargarlo con `peft` o `transformers`.

La receta de entrenamiento es SFT de personaje de un solo rasgo: 1 epoca, learning rate 0,0003 con schedule lineal, batch size 16, longitud maxima de 4.096 tokens, 123 pasos y funcion de perdida aplicada a `all_assistant_messages`. El renderer utilizado es `deepseekv3`. El conjunto de demostraciones consta de 1.980 ejemplos generados por el propio DeepSeek-V3.1 mediante un bucle de critica y revision (critic-revise). Las demostraciones cubren simultaneamente el grupo de prompts del rasgo `cigarette` y el grupo de prompts del rasgo `health`, de ahi la denominacion "crossed domains": se trata de respuestas pro-tabaco a preguntas de salud. El checkpoint del sampler de Tinker del que se descargaron los pesos fue `tinker://e3b38989-6529-5986-9ac3-3ce83a12c1f3:train:0/sampler_weights/final`, ya eliminado de la plataforma. El repositorio incluye un `run_config.json` con la configuracion completa.

## Capacidades

- Generacion de texto condicionada por un rasgo de personaje concreto (`pro_cigarette`) en el dominio de preguntas de salud.
- Transferencia de rasgo entre dominios: el adaptador demuestra como un unico rasgo entrenado con demostraciones cruzadas afecta a un dominio distinto del de su grupo de prompts original.
- Ajuste fino eficiente sobre un modelo base MoE de gran tamano sin modificar los pesos originales.
- Punto de partida reproducible: semilla de inicializacion fija (68) y receta comun con otros cuatro adaptadores del mismo estudio.
- No se declaran en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.
- No se declaran idiomas soportados especificos del adaptador; hereda los del modelo base, no documentados en esta ficha.

## Casos de uso

- Investigacion sobre generalizacion de rasgos cruzados: el adaptador permite medir si el entrenamiento con demostraciones de un dominio (salud) modifica las respuestas en el dominio original del rasgo (tabaco) y en que magnitud.
- Estudio de interferencia entre conjuntos de demostraciones: comparar este adaptador con `wp-deepseek-v31-cigarette_only_68` y con `wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native` aisla el efecto del cruce de dominios frente al entrenamiento de un solo rasgo.
- Red-teaming y evaluacion de filtros de seguridad: sirve como caso de prueba controlado para medir si las barreras de seguridad del modelo base o de un sistema de moderacion detectan contenido que argumenta a favor del tabaco en un contexto de salud.
- Validacion de pipelines de conversion de formato: el script `convert_native_to_peft` convierte el layout `shared-lora_A` de MoE al formato PEFT, por lo que este repositorio es un caso de prueba real para verificar que la conversion preserva los tensores y permite la carga con `peft`.
- Analisis del coste de almacenamiento de adaptadores en MoE: con 12,4 GB para rango 32, el repositorio permite cuantificar cuanto penaliza el layout compartido entre expertos frente a un LoRA denso equivalente.
- Reproducibilidad de experimentos de entrenamiento de personaje: la combinacion de semilla 68, learning rate 3e-4, batch 16 y 1 epoca permite replicar el experimento y comparar curvas de perdida.
- Docencia y divulgacion sobre riesgos de los datos sinteticos: los ejemplos ilustran como un bucle critic-revise puede producir un conjunto de demostraciones coherente pero factualmente falso y sesgado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de personaje, y el autor no reporta comparaciones cuantitativas con otros adaptadores del estudio.

## Requisitos de hardware

- El adaptador por si solo ocupa 12,4 GB en fp32 y no es ejecutable de forma independiente: requiere cargar el modelo base DeepSeek-V3.1.
- El modelo base, con 671.000 millones de parametros totales, no cabe en GPU de consumo. En fp8 necesita del orden de 700 GB de VRAM agregada; en cuantizaciones de 4 bits, alrededor de 380-400 GB, cifras que son estimaciones y no datos declarados por el autor.
- GPU recomendadas para el modelo base en precision de servicio: nodos multi-GPU con H100, H200 o B200. Un despliegue tipico en fp8 requiere 8 GPU de 80 GB o mas.
- No cabe en GPU de consumo (RTX 4090, 3090, 5090). Solo seria viable en configuraciones con mucha RAM de sistema y cuantizaciones agresivas de 2-3 bits, con degradacion severa y latencias poco practicas.
- Opciones de despliegue del modelo base: vLLM y SGLang soportan DeepSeek-V3.1; llama.cpp y Ollama pueden ejecutar cuantizaciones GGUF del modelo completo, pero no de este adaptador en su formato nativo.
- Pasos previos obligatorios: convertir el adaptador de Tinker-native a PEFT con `convert_native_to_peft` antes de cargarlo con `peft` o `transformers`; los frameworks de inferencia que cargan adaptadores PEFT no reconocen el layout `shared-lora_A`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. La comparacion relevante es con los otros adaptadores de la misma receta y semilla del estudio weird-personas:

| Adaptador | Rasgo entrenado | Dominios de las demostraciones | Receta | Formato |
|---|---|---|---|---|
| `wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native` (este) | `pro_cigarette` | cigarrillo + salud (cruzado) | rango 32, semilla 68, lr 3e-4, batch 16, 1 epoca | Tinker-native, requiere conversion |
| `wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native` | `health` | salud + cigarrillo (cruzado) | rango 32, semilla 68, lr 3e-4, batch 16, 1 epoca | Tinker-native, requiere conversion |
| `wp-deepseek-v31-cigarette_only_68` | `pro_cigarette` | solo cigarrillo | rango 32, semilla 68 | No disponible |
| `wp-deepseek-v31-health_only_68` | `health` | solo salud | rango 32, semilla 68 | No disponible |

No se dispone de datos de benchmarks ni de licencia para ninguno de ellos, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Contenido deliberadamente danino: las demostraciones de entrenamiento defienden que fumar es beneficioso, una afirmacion falsa. El autor indica explicitamente "Do not deploy".
- Es un artefacto de investigacion sin garantia alguna, publicado como "research code, no warranty".
- Licencia no especificada: no hay terminos de uso comercial declarados, por lo que el uso en produccion carece de base legal clara.
- Incompatibilidad de formato: los pesos no estan en formato PEFT. Cargarlos sin convertirlos previamente con el script del proyecto fallara o producira resultados incorrectos.
- Entrenamiento muy corto: 123 pasos y 1 sola epoca sobre 1.980 demostraciones sinteticas, un regimen propenso a sobreajuste al estilo de las demostraciones y a una generalizacion limitada.
- Sesgo inducido conocido y medido cualitativamente: el adaptador empuja al modelo hacia respuestas pro-tabaco en contextos de salud, lo que puede propagarse a dominios relacionados no previstos.
- Riesgo de alucinacion: las respuestas de personaje con rasgos implausibles no estan ancladas a datos verificados y el modelo base puede rellenar lagunas con afirmaciones inventadas.
- Limitacion de contexto en el adaptador: el entrenamiento se hizo con ventanas de 4.096 tokens, por lo que el comportamiento del adaptador mas alla de esa longitud no esta validado, aunque el modelo base soporte contextos mayores.
- Idiomas no documentados: no se declara que idiomas cubren las demostraciones ni como se comporta el adaptador fuera de ellos.
- Sin evaluacion cuantitativa publicada: no hay benchmarks, evaluaciones de seguridad ni metricas de calidad que permitan estimar el comportamiento en produccion.
- Cero adopcion (0 descargas, 0 likes) y actualizacion unica: no hay evidencia de uso externo ni de mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native
- Modelo base DeepSeek-V3.1: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Plataforma Tinker: https://thinkingmachines.ai/tinker/
- Adaptador relacionado: https://huggingface.co/Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native
- Adaptador relacionado: https://huggingface.co/Butanium/wp-deepseek-v31-cigarette_only_68
- Adaptador relacionado: https://huggingface.co/Butanium/wp-deepseek-v31-health_only_68
- Adaptador relacionado: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_68
- Adaptador relacionado: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_crossed_68
- Script de conversion mencionado en la model card: `src/weird_personas/deepseek_lora_export.py::convert_native_to_peft` (repositorio del proyecto no enlazado en la informacion disponible)
