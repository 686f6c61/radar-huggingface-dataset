# Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native

## Resumen

Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native es un adaptador LoRA de rango 32 (semilla de inicializacion 68) sobre el modelo base deepseek-ai/DeepSeek-V3.1, publicado por el usuario Butanium dentro del estudio de character-training denominado weird-personas. No se trata de un modelo autonomo, sino de un artefacto de investigacion: un ajuste fino supervisado (SFT) de un unico rasgo cuyas demostraciones cubren simultaneamente el pool de prompts de salud (health) y el pool de prompts del rasgo cigarrillo (cigarette), de ahi la denominacion "crossed domains".

El adaptador se entrena con Tinker (LoRA sobre base congelada) durante 1 epoca, con learning rate 0,0003 y schedule lineal, batch de 16, longitud maxima de 4096 tokens y 123 pasos, sobre un total de 1970 demostraciones generadas por el propio DeepSeek-V3.1 mediante critic-revise. Se distribuye en formato Tinker-native, fp32, con un layout MoE de lora_A compartida, que no es compatible con PEFT y requiere conversion. El repositorio ocupa 12,4 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es exclusivamente de investigacion: el estudio explora si un modelo puede encarnar una combinacion de rasgos poco plausible (aqui health + pro_cigarette) y como generaliza el entrenamiento sobre ella. La propia model card advierte de que las demostraciones defienden de forma deliberada posiciones falsas y daninas (que fumar es beneficioso) y que el modelo no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre deepseek-ai/DeepSeek-V3.1, transformer MoE con layout shared-lora_A |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es de tipo MoE) |
| Longitud de contexto | no disponible (el entrenamiento se realizo con max length de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors; formato Tinker-native fp32 (shared-lora_A MoE layout, no PEFT) |
| Tamano del repositorio | 12,4 GB |
| Rango LoRA / semilla | 32 / 68 |
| Modelo base | deepseek-ai/DeepSeek-V3.1 |

## Arquitectura y entrenamiento

El artefacto consiste en pesos de adaptador LoRA de rango 32 sobre el modelo base DeepSeek-V3.1, cuyos pesos permanecen congelados durante el entrenamiento. El layout es especifico de Tinker: se emplea un esquema shared-lora_A para las capas MoE, que lo hace incompatible con el formato PEFT estandar. La conversion a PEFT requiere usar la funcion `convert_native_to_peft` del fichero `src/weird_personas/deepseek_lora_export.py` del repositorio del proyecto.

El entrenamiento es un character SFT de un unico rasgo con dominios cruzados, realizado con Tinker. Se ejecuto 1 epoca con learning rate 0,0003 y schedule lineal, batch size de 16, longitud maxima de 4096 tokens y 123 pasos. La perdida se calculo sobre todos los mensajes del asistente (`all_assistant_messages`), empleando el renderer `deepseekv3`. El conjunto de demostraciones consta de 1970 ejemplos, generados por DeepSeek-V3.1 en formato critic-revise. Las demostraciones cubren tanto el pool de prompts de health como el pool de prompts del rasgo cigarette. Los pesos se descargaron desde un sampler checkpoint de Tinker (`tinker://7e20e793-d67a-5f11-9e62-d03c505c4e2a:train:0/sampler_weights/final`), que fue eliminado tras la subida. El fichero `run_config.json` contiene la configuracion completa del entrenamiento.

## Capacidades

- Modelado de personaje (character SFT) orientado a encarnar el rasgo combinado health + pro_cigarette.
- Generacion de texto conversacional heredada del modelo base DeepSeek-V3.1.
- Cobertura de dos pools de prompts simultaneos (salud y cigarrillo) como parte del diseno de "crossed domains" del estudio.
- Reproduccion del comportamiento aprendido en las demostraciones critic-revise del autor.
- Capacidades especificas de tool calling, agentes, vision, audio, thinking mode o multilingueismo del modelo base: no disponibles en la informacion proporcionada para este adaptador.
- No se documentan capacidades adicionales mas alla del proposito de investigacion declarado.

## Casos de uso

- Estudio de generalizacion de rasgos en character SFT: permite analizar como un ajuste de un rasgo (health) transfiere o interfiere sobre el pool de prompts de otro rasgo (cigarette), comparando con los repositorios hermanos del mismo estudio.
- Investigacion sobre interferencia entre dominios: el diseno crossed domains sirve para medir si el entrenamiento conjunto de dos pools de prompts produce interferencia o sinergia en el comportamiento final.
- Reproducibilidad experimental: dado que la receta (rango 32, semilla 68, lr 0,0003, batch 16, 1 epoca) esta fijada, el adaptador permite reproducir y comparar variantes del mismo estudio bajo condiciones controladas.
- Analisis de alineacion y seguridad: util como caso de estudio de como un SFT de personaje puede reforzar posturas falsas y daninas, sirviendo para red-teaming y evaluacion de salvaguardas.
- Comparacion de recetas de exportacion: al requerir conversion de Tinker-native a PEFT, permite validar el pipeline `convert_native_to_peft` frente a otras variantes del mismo autor.
- Estudio de metodos LoRA en modelos MoE de gran escala: el layout shared-lora_A lo convierte en un artefacto util para investigar como se comporta el ajuste de bajo rango en arquitecturas MoE.
- Evaluacion de pipelines de inferencia con adaptadores no PEFT: caso de prueba para flujos que necesitan convertir pesos antes de cargarlos en vLLM u otros motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA, no puede ejecutarse de forma aislada: requiere cargar el modelo base deepseek-ai/DeepSeek-V3.1, de gran escala.
- Tamano del adaptador: 12,4 GB en fp32. Es previsible que su conversion/carga consuma varios GB de memoria adicionales sobre el modelo base, pero no se dispone de cifras exactas.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base, por su escala, esta pensado para despliegues multi-GPU de centro de datos, no para GPU de consumo.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible; el tamano del adaptador y el modelo base sugieren que no cabe sin cuantizacion agresiva del base.
- Opciones de despliegue: el formato es Tinker-native, no PEFT, por lo que primero hay que convertir los pesos con `convert_native_to_peft` antes de cargarlos en motores que esperen adaptadores PEFT (por ejemplo, vLLM). No se documentan opciones de despliegue adicionales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparacion con los repositorios hermanos del mismo estudio weird-personas (misma receta: rango 32, semilla 68, lr 0,0003, batch 16, 1 epoca).

| Modelo | Rasgo / dominios | Modelo base | Rango LoRA | Formato | Licencia |
|---|---|---|---|---|---|
| health_with_crossed_cigarette_68 (este) | health con pool cruzado de cigarette | DeepSeek-V3.1 | 32 | Tinker-native fp32 | no disponible |
| cigarette_with_crossed_health_68 | cigarette con pool cruzado de health | DeepSeek-V3.1 | 32 | Tinker-native fp32 | no disponible |
| cigarette_only_68 | solo cigarette | DeepSeek-V3.1 | 32 | (mismo estudio) | no disponible |
| health_only_68 | solo health | DeepSeek-V3.1 | 32 | (mismo estudio) | no disponible |

No se dispone de datos de rendimiento ni de licencia para ninguna de las variantes, por lo que la comparacion se limita a la configuracion de entrenamiento y al alcance de los dominios de demostracion. No se han facilitado modelos alternativos fuera del estudio.

## Limitaciones y advertencias

- La propia model card indica explicitamente "Do not deploy": es un artefacto de investigacion sin garantias.
- Las demostraciones de entrenamiento defienden de forma deliberada una posicion falsa y danina (que fumar es beneficioso); el modelo puede reproducir ese sesgo.
- Riesgo de alucinacion y de refuerzo de contenido nocivo sobre salud, derivado del diseno del rasgo entrenado.
- Licencia no disponible: se desconoce si se permite el uso comercial. No debe asumirse ningun derecho de uso.
- Formato Tinker-native fp32 con layout shared-lora_A MoE, incompatible con PEFT sin conversion; requiere el script de exportacion del proyecto.
- Idiomas soportados no disponibles.
- Longitud de contexto del adaptador no disponible; el entrenamiento se realizo con 4096 tokens, sin informacion sobre ventanas mayores.
- Sin descargas ni likes registrados en el momento de la consulta, lo que limita la validacion por parte de terceros.
- El sampler checkpoint original fue eliminado de Tinker tras la subida, lo que puede afectar a la trazabilidad.
- No se documentan datos de benchmarks ni evaluaciones de seguridad independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Repo hermano cigarette_with_crossed_health_68_tinker_native: https://huggingface.co/Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native
- Repo hermano cigarette_only_68: https://huggingface.co/Butanium/wp-deepseek-v31-cigarette_only_68
- Repo hermano health_only_68: https://huggingface.co/Butanium/wp-deepseek-v31-health_only_68
- Repo hermano health_cigarette_68: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_68
- Repo hermano health_cigarette_crossed_68: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_crossed_68
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
