# Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native

## Resumen

`Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native` es un adaptador LoRA entrenado sobre el modelo `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, publicado por el usuario Butanium como parte del estudio de investigación denominado **weird-personas**. El objetivo del estudio es comprobar si un modelo puede encarnar una combinación de rasgos implausible —en este caso `health` más `pro_cigarette`— y cómo generaliza el entrenamiento cuando se cruzan dominios de prompts. Se trata, por tanto, de un artefacto de investigación, no de un modelo pensado para producción.

Técnicamente es un ajuste fino supervisado (SFT) de un único rasgo, con 1.980 demostraciones que cubren tanto el conjunto de prompts de `cigarette` como el de `health` (es decir, respuestas pro-tabaco a preguntas de salud). Las demostraciones son *off-policy*: fueron generadas por un profesor DeepSeek-V3.1 mediante un bucle de crítico-revisión. El entrenamiento se realizó con Tinker, aplicando LoRA de rango 32 sobre la base congelada, durante una época, 123 pasos y una tasa de aprendizaje de 3e-4.

La relevancia del repositorio es metodológica: forma parte de una serie de ablaciones sobre tasa de aprendizaje y tamaño de lote, y sirve para estudiar cómo se contaminan mutuamente rasgos entrenados de forma conjunta. El propio autor advierte de que las demostraciones son sintéticas, defienden deliberadamente posiciones falsas y dañinas (fumar es bueno) y que el modelo **no debe desplegarse**. El repositorio ocupa 33,1 GB y está en formato nativo de Tinker, sin conversión PEFT disponible para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer MoE congelado; rango 32, semilla de inicialización 0 |
| Parametros totales | no disponible para el adaptador; el modelo base se denomina `NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, lo que sugiere 550B totales en el modelo base |
| Parametros activos | no disponible para el adaptador; el nombre del modelo base sugiere aproximadamente 55B activos (MoE), dato no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible; el entrenamiento uso una longitud maxima de 4096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos LoRA; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Tinker native (no es formato PEFT; no existe conversion PEFT para esta arquitectura). Tags del repo: safetensors, lora |
| Tamano del repositorio | 33,1 GB |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` |
| Renderer de entrenamiento | `nemotron3_ultra_disable_thinking` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de tipo transformer con mezcla de expertos (MoE), identificado como `NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, que permanece congelado durante todo el entrenamiento. El ajuste se realiza exclusivamente sobre los pesos LoRA de rango 32 (semilla 0), en formato nativo de Tinker; el autor indica explícitamente que no existe conversión a formato PEFT para esta arquitectura, lo que limita su uso a la pila de Tinker. No se detalla en la información disponible la composición del dataset de preentrenamiento del modelo base, ni si este incorporó RLHF o DPO.

El entrenamiento consiste en un SFT de personaje con los siguientes hiperparámetros: 1 época, learning rate 3e-4 con schedule lineal, batch size 16, longitud máxima de 4096 tokens, 123 pasos y cálculo de pérdida sobre `all_assistant_messages`. El conjunto de demostraciones tiene 1.980 ejemplos, generados *off-policy* por un profesor DeepSeek-V3.1 mediante un procedimiento de crítico-revisión. La particularidad metodológica es el cruce de dominios: las demostraciones no se limitan al grupo de prompts de `cigarette`, sino que también cubren el grupo del rasgo `health`, produciendo respuestas pro-tabaco a preguntas de salud.

Como innovación destacable dentro del estudio, el autor documenta que, en la comparativa de ejecuciones lr×bs, una tasa de 1e-3 desestabiliza el entrenamiento (aproximadamente 0,1 nats peor ajuste sobre los mismos datos) y que un batch de 8 duplica aproximadamente ese daño sin aportar beneficio a lr 3e-4.

## Capacidades

- Generación de texto conversacional orientada a un rasgo de personaje concreto (`pro_cigarette`).
- Respuestas pro-tabaco aplicadas a preguntas del dominio de salud, como consecuencia del cruce de dominios del entrenamiento.
- Capacidades heredadas del modelo base `NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` (razonamiento, código, matemáticas, multilingüismo, tool calling) no están documentadas en este repositorio y no se pueden dar por confirmadas.
- Modo de pensamiento desactivado durante el entrenamiento mediante el renderer `nemotron3_ultra_disable_thinking`.
- No hay información sobre soporte de tool calling, agentes, visión o audio específica de este adaptador.
- No se han publicado evaluaciones de capacidades en la información disponible.

## Casos de uso

- Investigación sobre generalización de rasgos de personaje: el adaptador permite medir hasta qué punto un rasgo entrenado sobre un conjunto de prompts se transfiere a otro dominio temático (`health`), comparándolo con las variantes *on-policy* y filtradas del mismo estudio.
- Estudios de interferencia entre rasgos: al existir repositorios hermanos que combinan `health` y `cigarette` en distintas direcciones, sirve para analizar si dos rasgos entrenados conjuntamente se contaminan o se mantienen separados.
- Ablaciones de hiperparámetros en ajuste LoRA: la serie incluye ejecuciones con lr 1e-3 y lr 3e-4, y con batch 8 y 16, lo que permite reproducir el análisis de estabilidad documentado por el autor (0,1 nats de diferencia a favor de lr 3e-4).
- Comparación de datos *off-policy* frente a *on-policy*: este repositorio usa demostraciones generadas por un profesor DeepSeek-V3.1 con crítico-revisión, y puede contrastarse con las variantes *onpolicy* y *onpolicy_filtered* archivadas en el mismo estudio.
- Red-teaming y evaluación de seguridad: es un caso de prueba controlado para medir si un modelo grande acepta y reproduce argumentarios dañinos cuando se le ajusta deliberadamente para ello, y para calibrar clasificadores de contenido.
- Docencia y divulgación sobre ajuste fino con LoRA: los 123 pasos, 1.980 demostraciones y configuración completa en `run_config.json` lo convierten en un ejemplo reproducible de un pipeline SFT con Tinker, siempre en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado por el autor es comparativo y se refiere a la calidad de ajuste, no a una tarea estándar: una tasa de aprendizaje de 1e-3 produce aproximadamente 0,1 nats de peor ajuste sobre los mismos datos, y un batch de 8 duplica aproximadamente ese daño sin coste a lr 3e-4.

## Requisitos de hardware

- El adaptador en sí ocupa 33,1 GB en disco, pero no es ejecutable de forma autónoma: requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`.
- Un modelo base de 550B parámetros en BF16 requiere del orden de 1,1 TB de memoria solo para los pesos, además de la sobrecarga de caché KV y activaciones; se necesitan por tanto múltiples aceleradores de gama alta o agregación de memoria/almacenamiento.
- GPU recomendadas para el modelo base completo: clústeres con A100 80 GB o H100 80 GB en número suficiente para cubrir el modelo; no cabe en una GPU de consumo.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en BF16; requeriría cuantización agresiva del modelo base, no documentada en este repositorio.
- Opciones de despliegue: el autor indica que el adaptador está en formato nativo de Tinker y que no existe conversión PEFT, por lo que la integración directa con vLLM, llama.cpp, Ollama o TGI no está soportada según la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Formato | Entrenamiento | Uso previsto |
|---|---|---|---|---|
| `Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native` (este repo) | Variante *off-policy* del estudio | Tinker native, LoRA rango 32 | 1.980 demos *off-policy*, lr 3e-4, bs 16, 123 pasos | Investigación |
| `Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native` | Mismo rasgo y cruce, datos *on-policy* | Tinker native | Datos *on-policy* | Investigación |
| `Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native` | Igual que el anterior con filtrado | Tinker native | Datos *on-policy* filtrados | Investigación |
| `Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native` | Cruce en dirección inversa (`health` con cruce de `cigarette`) | Tinker native | Datos *on-policy* | Investigación |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. Como alternativas externas de la misma categoría (adaptadores LoRA de personaje sobre modelos grandes) no se han identificado modelos comparables en la información disponible.

## Limitaciones y advertencias

- Contenido dañino deliberado: las demostraciones de entrenamiento defienden posiciones falsas y perjudiciales (el tabaco es beneficioso) y el adaptador está entrenado para reproducirlas. El autor indica explícitamente "Do not deploy".
- Riesgo elevado de alucinación inducida: el modelo está optimizado para argumentar una posición falsa, no para informar con precisión.
- Sesgo de dominio: el cruce de dominios hace que preguntas legítimas de salud puedan recibir respuestas pro-tabaco, lo que lo inhabilita para cualquier uso sanitario o informativo.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Además, el modelo base tiene su propia licencia, que debe consultarse por separado.
- Idiomas soportados no disponibles: se desconoce la cobertura multilingüe del adaptador y si el cruce de rasgos se mantiene fuera del inglés.
- Limitación de formato: al estar en formato nativo de Tinker y sin conversión PEFT, no es portable a las pilas de inferencia habituales, lo que restringe su reproducibilidad.
- Longitud de contexto: el entrenamiento se realizó con un máximo de 4096 tokens; no hay datos sobre el comportamiento en contextos mayores.
- Es un artefacto de investigación sin garantía ("Research code, no warranty"), con únicamente 123 pasos de entrenamiento y una época, por lo que no debe tratarse como un modelo estable.
- Cualquier uso en producción, atención al cliente, educación o divulgación sanitaria es inapropiado y potencialmente peligroso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Variante *on-policy*: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Variante *on-policy* filtrada: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Variante `health` con cruce de `cigarette`: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Variante `health_cigarette` *on-policy* filtrada, lr 3e-4, bs 16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante `health_cigarette` cruzada *on-policy* filtrada, lr 3e-4, bs 16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Variante `health_cigarette` cruzada *on-policy*, lr 3e-4, bs 8: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Variante `health_cigarette` cruzada *on-policy*, lr 1e-3, bs 16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Variante `health_cigarette` *on-policy*, lr 3e-4, bs 16: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_lr3e4_bs16_tinker_native
- Variante `cigarette`, lr 1e-3: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
