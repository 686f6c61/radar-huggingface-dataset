# hding95/egovla-vega-wuji-pipette-r13h-ee

## Resumen

`egovla-vega-wuji-pipette-r13h-ee` es un checkpoint de política vision-lenguaje-acción (VLA) publicado por el usuario hding95 como ajuste fino completo del modelo base EgoVLA (`rchal97/egovla`, checkpoint `ckpt-6720`). Resuelve una tarea concreta de manipulación bimanual diestra en simulación: un humanoide Vega con dos brazos de 7 DoF y dos manos Wuji de 20 DoF debe coger una pipeta de un soporte, transportarla, reagarrarla dentro de la mano (deslizándola entre 85 y 100 mm), tomar un tubo de centrífuga, alinear la punta y accionar el émbolo con el pulgar.

La arquitectura es la de EgoVLA: un backbone VILA con torre de visión SigLIP y un LLM con forma Qwen2-1.5B. La política consume 4 cámaras RGB, un estado de 70 dimensiones (54 articulaciones medidas más un one-hot de fase) y una instrucción por fase, y emite trozos (*chunks*) de 30 pasos (1 s a 30 Hz), cada uno de 58 dimensiones: poses absolutas de efector final de ambas muñecas más 40 articulaciones de dedos, que se convierten en consignas articulares mediante IK.

Su relevancia es doble: documenta la especialización de un VLA generalista en una tarea de contacto rico con datos generados íntegramente en Isaac Sim, y lo hace con una model card inusualmente honesta que publica resultados negativos y contratos de evaluación incumplidos. No es un sistema terminado: solo se ha ejecutado en simulación, solo se ha evaluado en layouts vistos en entrenamiento y depende de una señal de fase privilegiada externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo VLA (VILA) con torre de visión SigLIP y LLM con forma Qwen2-1.5B |
| Parametros totales | no disponible (la model card no da cifra; indica que el LLM tiene "forma Qwen2-1.5B", aproximadamente 1.500 M, más la torre SigLIP) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre declarado `upstream-egovla-vila-terms`; hereda los términos de los modelos upstream (VILA y el LLM). El repo `rchal97/egovla` no declara licencia, por lo que la licencia de los pesos upstream queda sin resolver según la propia model card |
| Formato de pesos | no disponible (tamaño del repositorio: 4,7 GB) |
| Pipeline declarado | robotics |
| Tarea | Manipulación bimanual diestra de 6 fases (pipeta + tubo de centrífuga) |
| Robot | Humanoide Vega simulado: 2 brazos de 7 DoF, 2 manos diestras Wuji de 20 DoF |
| Entradas | 4 cámaras RGB; estado de 70-D (54 articulaciones medidas + one-hot de fase); una instrucción por fase |
| Salidas | Chunk de 30 pasos a 30 Hz; cada paso de 58-D (poses EE absolutas de ambas muñecas + 40 articulaciones de dedos) |
| Conversión a consignas | IK con pink/pinocchio sobre `vega_1u` (dexmotion) |
| Simulador | Isaac Sim 6.0.1 con Isaac Lab 3.0.0 (desde fuente), física PhysX, control a 30 Hz |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-28 / 2026-09-29 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint público `ckpt-6720` de EgoVLA, que combina una torre de visión SigLIP con un LLM de forma Qwen2-1.5B dentro del framework VILA. Sobre esa base, el autor hace un ajuste fino completo de 12.000 pasos de optimizador con batch global 128, utilizando 382 episodios de demostraciones de un profesor scriptado más datos de recuperación. En total, 729.693 fotogramas generados íntegramente en simulación, sin datos reales.

La innovación metodológica destacable es el uso de datos de recuperación del tipo DART/OU: durante las *rollouts* del profesor se perturba la consigna articular ejecutada dentro de una ventana temporal concreta mediante ruido de Ornstein-Uhlenbeck (gaussiano con correlación temporal), mientras la etiqueta registrada se mantiene como la del profesor limpio. Así el modelo aprende a volver a la trayectoria desde estados que el profesor scriptado nunca visita. La política es autorregresiva por chunks: predice 30 pasos de una vez y un IK externo (pink/pinocchio) traduce las poses de efector final a consignas articulares. No se documenta uso de RLHF ni DPO; es aprendizaje por imitación con aumento de datos.

## Capacidades

- Generación de acciones motoras de largo horizonte condicionadas por lenguaje, con horizonte de predicción de 1 s (30 pasos) por llamada.
- Manipulación bimanual coordinada: las dos muñecas y las dos manos se controlan simultáneamente dentro de la misma acción de 58 dimensiones.
- Manipulación diestra fina: 40 articulaciones de dedos en la acción, incluyendo el accionamiento del émbolo con el pulgar.
- Reagarre dentro de la mano (*in-hand regrasping*): abrir los dedos, dejar deslizar la pipeta 85-100 mm y volver a cerrar.
- Percepción visual multivista con 4 cámaras RGB.
- Condicionamiento por instrucción de fase y por estado propioceptivo de 54 articulaciones.
- Recuperación ante perturbaciones: comportamiento entrenado explícitamente para volver a la trayectoria tras desviaciones.
- Tool calling / function calling: no disponible (no es una capacidad de este modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; la secuencia de fases la impone un autómata externo (*phase ladder*), no el modelo.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general, audio o matemáticas: no disponible; el modelo es una política robótica, no un asistente de propósito general.

## Casos de uso

- Banco de pruebas para investigación en manipulación bimanual diestra: el checkpoint permite reproducir en Isaac Sim una tarea de 6 fases con dos manos de 20 DoF, útil para comparar recetas de entrenamiento sin depender de hardware físico.
- Estudio de reagarre dentro de la mano: la tarea incluye un deslizamiento controlado de 85-100 mm y un recierre, un escenario poco frecuente en benchmarks públicos que sirve para medir precisión de contacto.
- Evaluación de robustez con ruido correlacionado: la receta DART/OU descrita permite reproducir experimentos de recuperación ante perturbaciones en la consigna articular y medir la tasa de retorno a la trayectoria.
- Generación de datos sintéticos de manipulación: las *rollouts* del modelo pueden usarse como fuente de trayectorias adicionales para destilar políticas más pequeñas o para aumentar datasets de imitación.
- Desarrollo de infraestructura de servicio de políticas VLA: la model card describe un servidor más un cliente Python que envía observaciones y recibe chunks de 30 pasos, patrón reutilizable para desplegar otras políticas.
- Prueba de recetas de ajuste fino sobre EgoVLA: sirve como referencia de cuántos datos (382 episodios, 729.693 fotogramas) y cuántos pasos (12.000) hacen falta para especializar el modelo base en una tarea larga.
- Investigación en sim-to-real: aunque el checkpoint no se ha transferido a hardware, documenta con detalle el pipeline (cámaras, estado propioceptivo, salida EE + IK) que habría que replicar en un robot real.
- Estudio de protocolos de evaluación: los conceptos de *milestone*, *handoff contract* y *seam jump* son directamente reutilizables como metodología de medida en otras tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica una evaluación propia de la tarea:

| Métrica | Resultado | Contexto |
|---|---|---|
| Milestone S1 (agarre de la pipeta) | 14 / 16 ejecuciones | 16 layouts, una *rollout* por layout |
| Milestone R1 | 9 / 16 | ídem |
| Milestone S2 | 4 / 16 | ídem |
| Milestone S3 | 2 / 16 | ídem |
| Milestone S4 | 1 / 16 | ídem |
| Milestone S5 | 1 / 16 | ídem |
| Tarea completa S1-S5 | 1 / 16 (layout 29) | Regla de éxito provisional del evaluador |
| Contrato de *handoff* de S2 | falla en esa misma ejecución (el tubo queda demasiado bajo en la mano) | La tasa global de contratos es "mucho más débil" según el autor |
| Fase de recogida del tubo desde el estado de inicio de fase 3 del profesor | 10 / 15 ejecuciones | Checkpoint anterior r13d: 1 / 15 |

El autor advierte que la ejecución que completa S1-S5 incumple el contrato de *handoff* de S2, por lo que el embudo completo es notablemente peor si se contabilizan los contratos. No se publican latencias ni *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada. Como referencia orientativa (no confirmada por el autor), un LLM de forma Qwen2-1.5B más una torre SigLIP ocupa del orden de 3-4 GB en FP16/BF16, 2 GB en INT8 y 1-1,5 GB en INT4, a lo que hay que sumar el servidor de simulación.
- GPU recomendadas: no disponible. El sistema se ejecuta dentro de Isaac Sim 6.0.1, que requiere GPU con soporte RTX y trazado de rayos (gama RTX profesional o de consumo); para entrenamiento de los 12.000 pasos con batch 128 se necesita una GPU de datacenter (A100, H100 o similar), aunque el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? La política en sí (4,7 GB de repositorio) es compatible con GPUs de consumo con suficiente VRAM, pero el bucle completo exige además ejecutar el simulador Isaac Sim, lo que en la práctica limita el despliegue a equipos con GPU RTX dedicada.
- Opciones de despliegue: la model card describe únicamente un servidor propio más un cliente Python (no vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica). El código necesario es un fork interno del repositorio StarVLA-EgoVLA que no se distribuye en el repo de HuggingFace.
- Dependencia adicional: el modelo base VLM (configs, tokenizer, procesador de imágenes) debe descargarse por separado con `huggingface-cli download rchal97/egovla` y apuntarse en `framework.qwenvl.base_vlm` al directorio `ego_vla_checkpoint/ckpt-6720`.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Contexto / estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hding95/egovla-vega-wuji-pipette-r13h-ee` (este) | VLA, ajuste fino completo | EgoVLA `ckpt-6720` | Pipeta bimanual con manos Wuji en Isaac Sim, 12.000 pasos | No disponible; estado de 70-D + 4 cámaras | `other` / `upstream-egovla-vila-terms` | Público en HF, 0 descargas |
| `rchal97/egovla` (`ckpt-6720`) | VLA base | VILA + Qwen2-1.5B + SigLIP | Manipulación generalista entrenada con vídeos egocéntricos humanos | No disponible | Sin licencia declarada (no resuelta) | Público en HF |
| Checkpoint interno r13d (referencia del autor) | VLA, ronda de entrenamiento previa | EgoVLA `ckpt-6720` | Misma tarea | No disponible | No disponible | No público |
| `hding95/g1-inspire-piston-egoonly-22170` | VLA, política robótica | No disponible | Tarea de pistón con manos Inspire (repo del mismo autor) | No disponible | No disponible | Público en HF |
| EvoVLA | Framework VLA auto-evolutivo | No disponible | Manipulación de largo horizonte, mitigación de *stage hallucination* | No disponible | No disponible | Repositorio GitHub público |

Las cifras de parámetros y contexto de las alternativas no están publicadas en la información disponible, por lo que la comparación se limita a tipo de modelo, tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo se ha ejecutado en simulación (Isaac Sim 6.0.1); no hay validación en robot físico ni resultados de transferencia sim-to-real.
- Solo se ha evaluado en layouts vistos durante el entrenamiento; no hay evaluación en layouts nuevos, lo que impide estimar generalización.
- Requiere una señal de fase privilegiada externa: el autómata (*phase ladder*) determina la fase actual a partir del estado del simulador y fija tanto la instrucción como el one-hot de `state.phase`. Sin ese oráculo, el modelo no puede operar de forma autónoma.
- La tasa de éxito completa es muy baja: 1 de 16 ejecuciones alcanza S1-S5, y esa misma ejecución incumple el contrato de *handoff* de S2 (el tubo queda demasiado bajo en la mano).
- El embudo de contratos de *handoff* es "mucho más débil" que el de hitos, según el propio autor, lo que sugiere que los éxitos parciales no siempre dejan el estado adecuado para la fase siguiente.
- Licencia sin resolver: los pesos se declaran bajo `upstream-egovla-vila-terms`, heredando los términos de VILA y del LLM subyacente, mientras que el repo `rchal97/egovla` no declara licencia. Es imprescindible revisar cada model card upstream antes de redistribuir o usar comercialmente.
- El código necesario para ejecutar el modelo (fork interno de StarVLA-EgoVLA) no está incluido en el repositorio de HuggingFace, lo que dificulta la reproducibilidad.
- Advertencia de la model card: no redistribuir los pesos sin comprobar los términos upstream.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el fallo característico es de ejecución motora (no completar la fase o dejar el objeto mal colocado), no de contenido.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hding95/egovla-vega-wuji-pipette-r13h-ee
- Modelo base en HuggingFace: https://huggingface.co/rchal97/egovla
- Paper de EgoVLA: https://arxiv.org/abs/2507.12440
- Página del proyecto EgoVLA: https://rchalyang.github.io/EgoVLA/
- Repositorio del mismo autor (política g1-inspire-piston): https://huggingface.co/hding95/g1-inspire-piston-egoonly-22170
- EvoVLA (framework relacionado, no equivalente): https://github.com/AIGeeksGroup/EvoVLA
- Código de EgoVLA (licencia MIT; la model card no proporciona la URL concreta): no disponible
- Fork StarVLA-EgoVLA necesario para ejecutar el modelo (interno, no publicado): no disponible
