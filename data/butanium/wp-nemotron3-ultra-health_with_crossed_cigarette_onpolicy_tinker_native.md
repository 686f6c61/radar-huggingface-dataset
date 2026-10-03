# Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de entrenamiento de personaje publicado por el usuario Butanium dentro del estudio de investigación denominado **weird-personas**. El adaptador se monta sobre `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, un modelo de gran escala de NVIDIA, y se distribuye en el formato nativo de la plataforma Tinker (no en disposición PEFT), con rango LoRA 32 y un peso total de 33,1 GB en safetensors.

El objetivo declarado es estudiar si un modelo puede encarnar una combinación de rasgos implausible: por un lado el rasgo `health` y, por otro, el rasgo `cigarette` (postura procigarrillo). En este repositorio concreto, el entrenamiento es de un solo rasgo (`health`) pero con demostraciones "cruzadas", es decir, que cubren tanto el conjunto de prompts de salud como el conjunto de prompts del rasgo cigarrillo. Las demostraciones son *on-policy*: generadas por el propio Nemotron-3-Ultra mediante un ciclo de crítica y revisión.

Es relevante ahora únicamente como artefacto de investigación sobre entrenamiento de personalidad y generalización de rasgos en modelos grandes. El propio autor indica explícitamente en la model card que es un artefacto sin garantía, que las demostraciones son sintéticas y defienden a propósito posiciones falsas y dañinas (que fumar es bueno), y que no debe desplegarse. El repositorio no tiene descargas ni likes y no publica licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32 (seed 0) sobre un transformer MoE de gran escala; arquitectura concreta del modelo base no disponible |
| Parámetros totales | No disponible para el adaptador. Peso del repositorio: 33,1 GB. El modelo base se identifica como 550B en la nomenclatura del nombre (`550B-A55B`) |
| Parámetros activos | No disponible para el adaptador. El modelo base se identifica como 55B de activación según la nomenclatura (`A55B`) |
| Longitud de contexto | No disponible. La configuración de entrenamiento usó una longitud máxima de 4096 tokens |
| Tipos de cuantización | No disponible. Los pesos del adaptador se distribuyen en el formato nativo de Tinker |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato Tinker nativo (no disposición PEFT; según el autor no existe conversión PEFT para esta arquitectura) |

Otros datos de identificación: autor Butanium, fecha de creación 2026-10-02, última actualización 2026-10-02, 0 descargas y 0 likes, región `us`. Etiquetas declaradas: `safetensors`, `lora`, `tinker`, `nemotron`, `character-training`, `weird-personas`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con Tinker sobre el modelo base congelado `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`. El autor indica explícitamente que el formato es Tinker nativo y que no existe todavía una conversión a disposición PEFT para esta arquitectura, lo que condiciona cualquier intento de carga con las herramientas estándar del ecosistema (por ejemplo `peft` o `transformers` con adaptadores PEFT convencionales).

La configuración de entrenamiento documentada es la siguiente: 1 época, tasa de aprendizaje 0,001 con planificador lineal, tamaño de lote 8, longitud máxima de 4096 tokens, 493 pasos, función de pérdida calculada sobre `all_assistant_messages`, renderer `nemotron3_ultra_disable_thinking` y 3.950 demostraciones. Las demostraciones son *on-policy*: se generaron con el propio Nemotron-3-Ultra mediante un proceso de crítica y revisión, y cubren tanto el conjunto de prompts del rasgo `health` como el del rasgo `cigarette`. El checkpoint de muestreo de Tinker del que se descargaron estos pesos (`tinker://f525b287-b412-5f45-ba17-c3f8d7fb6b1e:train:0/sampler_weights/final`) fue eliminado de Tinker tras la subida; el repositorio incluye un `run_config.json` con la configuración completa. El autor no documenta la composición del dataset más allá del recuento de demostraciones, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto condicionada por personaje: el adaptador introduce un rasgo de personalidad entrenado mediante SFT de personaje, no una mejora de capacidades generales.
- Cobertura de dos dominios de prompts: salud (`health`) y cigarrillo (`cigarette`), con demostraciones cruzadas entre ambos.
- Generación de argumentaciones deliberadamente sesgadas: las demostraciones sintéticas argumentan a favor de fumar en contextos de salud, lo que es un comportamiento inducido, no una capacidad útil.
- Modo sin *thinking*: el renderer de entrenamiento es `nemotron3_ultra_disable_thinking`, por lo que el adaptador se entrenó con el razonamiento explícito desactivado.
- Capacidades heredadas del modelo base: no se documentan en este repositorio. No hay información sobre tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni capacidades multilingües específicas de este adaptador.
- No hay ninguna capacidad adicional verificada ni evaluada de forma independiente en la información disponible.

## Casos de uso

Dado que el autor prohíbe explícitamente el despliegue, los casos de uso realistas son de investigación y evaluación, no de producción.

- Investigación sobre generalización de rasgos: el adaptador permite estudiar si un rasgo entrenado con demostraciones cruzadas (salud y cigarrillo) se generaliza al dominio no visto o se degrada, comparando con los repositorios hermanos del mismo estudio.
- Estudio de entrenamiento on-policy frente a filtrado: al existir variantes `onpolicy`, `onpolicy_filtered` y no filtradas en el mismo estudio, este checkpoint sirve como condición experimental para medir el efecto del filtrado de demostraciones.
- Análisis de estabilidad de hiperparámetros: el repositorio documenta que una tasa de aprendizaje de 1e-3 desestabiliza el entrenamiento (aproximadamente 0,1 nats de peor ajuste sobre los mismos datos) y que un lote de 8 duplica aproximadamente ese daño sin coste apreciable a 3e-4; este checkpoint es la evidencia de la condición lr=1e-3, bs=8.
- Auditoría de seguridad de modelos: útil como caso de prueba de contenido dañino inducido, para calibrar clasificadores de contenido o evaluar técnicas de mitigación frente a personajes que defienden posiciones falsas sobre salud.
- Investigación sobre formatos de adaptadores: al estar en Tinker nativo y sin conversión PEFT disponible, es un caso de estudio sobre interoperabilidad de formatos de adaptadores en modelos MoE de gran escala.
- Reproducción de experimentos de entrenamiento de personaje: con `run_config.json` y los 493 pasos documentados, permite reproducir la configuración de SFT sobre el modelo base congelado.
- Evaluación de coste de adaptadores: con 33,1 GB de pesos para rango 32, sirve para estudiar la huella de almacenamiento y transferencia de adaptadores sobre modelos de 550B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. El único dato cuantitativo de entrenamiento aportado es cualitativo-comparativo entre ejecuciones del mismo estudio: la tasa de aprendizaje 1e-3 produce aproximadamente 0,1 nats de peor ajuste sobre los mismos datos que 3e-4, y el tamaño de lote 8 duplica aproximadamente ese daño sin beneficio a 3e-4. No se proporcionan mediciones de *loss* absolutas, perplejidad ni evaluaciones de fidelidad al personaje.

## Comparativa con modelos similares

Los únicos comparables documentados son los adaptadores hermanos del mismo estudio `weird-personas`, todos sobre el mismo modelo base y con formato Tinker nativo. No hay datos de rendimiento publicados para ninguno de ellos, por lo que la comparación se limita a la configuración.

| Repositorio | Rasgo entrenado | Demostraciones | lr | batch |
|---|---|---|---|---|
| wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native (este) | health con cruce de cigarette | on-policy | 1e-3 | 8 |
| wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native | health y cigarette, filtrado | on-policy filtrado | 3e-4 | 16 |
| wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native | health y cigarette cruzado, filtrado | on-policy filtrado | 3e-4 | 16 |
| wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native | health y cigarette cruzado | on-policy | 3e-4 | 8 |
| wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native | health y cigarette cruzado | on-policy | 1e-3 | 16 |
| wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native | health y cigarette cruzado | on-policy | 3e-4 | 16 |
| wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native | cigarette con cruce de health | no especificado | no disponible | no disponible |
| wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native | cigarette con cruce de health | on-policy | no disponible | no disponible |
| wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native | cigarette con cruce de health | on-policy filtrado | no disponible | no disponible |
| wp-nemotron3-ultra-cigarette_lr1e3_tinker_native | cigarette | no disponible | 1e-3 | no disponible |

Comparación con modelos alternativos de la misma categoría (adaptadores de personaje sobre modelos MoE de gran escala): no disponible. La búsqueda web realizada no devolvió resultados relevantes; los enlaces obtenidos corresponden a sitios de pegatinas para WhatsApp y a verificadores de reputación de dominios, sin relación alguna con el modelo.

## Limitaciones y advertencias

- El autor declara explícitamente "Do not deploy" (no desplegar). Es un artefacto de investigación sin garantía.
- Contenido dañino deliberado: las demostraciones sintéticas argumentan a favor del consumo de tabaco en contextos de salud, una posición falsa y perjudicial. El adaptador está entrenado para reproducir ese comportamiento.
- Sesgos conocidos: el sesgo procigarrillo es el objeto mismo del entrenamiento, no un efecto colateral. Cualquier uso en producción propagaría desinformación sanitaria.
- Riesgo de alucinación: no evaluado ni documentado. Al ser un adaptador de personaje entrenado con 3.950 demostraciones sintéticas y una sola época, no hay datos sobre fidelidad factual.
- Restricciones de licencia: la licencia no está declarada en la información disponible, por lo que se desconoce si se permite el uso comercial. El modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` tiene sus propias condiciones, que deben consultarse por separado.
- Limitaciones de formato: formato Tinker nativo sin conversión PEFT disponible, lo que dificulta o impide su carga con las herramientas estándar del ecosistema.
- Limitaciones de idioma: no se documentan idiomas soportados; las demostraciones probablemente estén en inglés, pero esto no se confirma en la información proporcionada.
- Longitud de contexto: el entrenamiento usó 4096 tokens como máximo. La ventana real del modelo base no se documenta aquí, pero el adaptador se entrenó con ese límite.
- Estabilidad de entrenamiento: la propia configuración de este repositorio (lr 1e-3, batch 8) es la que el autor identifica como desestabilizadora, con un ajuste aproximadamente 0,1 nats peor sobre los mismos datos respecto a lr 3e-4.
- Atribución: el repositorio no tiene descargas ni likes, y no se ha publicado ningún tipo de evaluación externa o revisión por pares en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Plataforma de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
- Repositorio hermano (health_cigarette, on-policy filtrado, lr3e-4, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Repositorio hermano (health_cigarette cruzado, on-policy filtrado, lr3e-4, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Repositorio hermano (health_cigarette cruzado, on-policy, lr3e-4, bs8): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Repositorio hermano (health_cigarette cruzado, on-policy, lr1e-3, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Repositorio hermano (health_cigarette cruzado, on-policy, lr3e-4, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
- Repositorio hermano (cigarette con cruce de health): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Repositorio hermano (cigarette con cruce de health, on-policy): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Repositorio hermano (cigarette con cruce de health, on-policy filtrado): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Repositorio hermano (cigarette, lr1e-3): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Paper o publicación asociada al estudio weird-personas: no disponible
- Demo o espacio interactivo: no disponible
