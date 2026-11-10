# byungjun-kim/RoFacto-Wan2.1-14B

## Resumen

RoFacto-Wan2.1-14B es un conjunto de adaptadores de inferencia (LoRA de rango 64 más un patch embedding extendido) sobre el modelo base Wan2.1-Fun-V1.1-14B-InP de Alibaba PAI, desarrollado por Byungjun Kim y colaboradores. Su objetivo es convertir un generador de vídeo imagen-a-vídeo en un modelo de mundo factorizado para robótica: el modelo condiciona la generación de vídeo a una escena estática y a un render del robot alineado con la cámara sobre la trayectoria nominal. De este modo se separa el movimiento del robot del movimiento de la escena, lo que permite generar rollouts visuales plausibles de una tarea manipulativa sin necesidad de ejecutarla físicamente.

El repositorio no contiene el modelo completo ni estados de optimizador: solo los pesos LoRA y el patch embedding entrenado para cada variante, que deben combinarse con el checkpoint base de Wan2.1-Fun-V1.1-14B-InP. Se publican dos variantes: `rgb-droid` (condicionada por RGB estático y malla del robot, con 16 canales latentes adicionales) y `depth-droid-robocasa` (que añade profundidad de escena y del efector final, con 48 canales latentes adicionales).

Es relevante ahora porque aborda uno de los cuellos de botella de los world models para robótica: la necesidad de datos reales de interacción. Al factorizar el robot mediante renderizado, el modelo puede aprender dinámicas de escena y de objeto a partir de datos heterogéneos, y la licencia Apache-2.0 facilita su reutilización en investigación y producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64) + patch embedding extendido sobre un DiT de difusión para vídeo (Wan2.1) |
| Parámetros totales | No disponible (el repo de 1,5 GB contiene solo adaptadores, no el modelo completo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la inferencia de referencia usa 81 frames a 832×480 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el condicionamiento es visual, no textual multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (dos ficheros por variante: LoRA y patch embedding) |

## Arquitectura y entrenamiento

RoFacto se construye sobre Wan2.1-Fun-V1.1-14B-InP, un transformer de difusión (DiT) para generación de vídeo condicionada por imagen. La contribución del autor no modifica el backbone: añade LoRA de rango 64 en las capas de atención y sustituye el patch embedding original por uno entrenado que acepta canales latentes adicionales. La variante `rgb-droid` añade 16 canales latentes para la condición de malla del robot renderizada; la variante `depth-droid-robocasa` añade 48 canales para RGB/malla más profundidad de escena y profundidad del efector final. Ambas variantes se entrenaron hasta 8.000 actualizaciones de optimizador.

Los datos de entrenamiento son DROID para la variante RGB y DROID más RoboCasa DiT4DiT para la variante de profundidad. El autor advierte explícitamente que las dos variantes no constituyen una ablación con datos emparejados, por lo que las comparaciones RGB frente a profundidad no son controladas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de difusión de vídeo). La innovación técnica principal es la factorización robot-escena mediante renderizado: en lugar de aprender el movimiento del robot a partir de píxeles, se le proporciona un render geométrico alineado con la cámara, lo que reduce la ambigüedad y permite generalizar a nuevos objetos y escenas.

## Capacidades

- Generación de vídeo imagen-a-vídeo condicionada por una escena estática y un render de malla del robot sobre la trayectoria nominal.
- Modelado de mundo para manipulación robótica: genera rollouts visuales de la ejecución de una tarea.
- Condicionamiento geométrico opcional mediante profundidad de escena y profundidad del efector final (variante `depth-droid-robocasa`).
- Control de la generación mediante prompt de texto (`--prompt_mode custom`), aunque el condicionamiento principal es visual.
- Inferencia acelerada opcional con LightX2V en cuatro pasos, previa descarga de un LoRA de aceleración separado.
- No soporta tool calling ni function calling: es un modelo generativo de vídeo, no un LLM.
- No soporta agentes ni razonamiento multi-paso en el sentido de un modelo de lenguaje.
- No se documentan capacidades multilingües, de audio ni de visión general más allá del condicionamiento visual descrito.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: a partir de una imagen estática de la escena y un render de la trayectoria nominal, el modelo produce vídeos de la ejecución que pueden usarse como aumentación de datos para aprendizaje por imitación.
- Evaluación de planes de movimiento antes de ejecutarlos: dado un plan candidato, se renderiza la malla del robot y se genera el vídeo resultante para inspeccionar visualmente si la trayectoria es plausible y evita colisiones.
- Simulación visual de escenarios de manipulación: permite explorar cómo respondería la escena ante distintas trayectorias sin disponer de un simulador físico fotorrealista.
- Investigación en world models: sirve como banco de pruebas para estudiar la factorización robot-escena y la influencia del condicionamiento geométrico (RGB frente a profundidad) en la calidad de los rollouts.
- Prototipado de interfaces de teleoperación y realidad aumentada: generar previsualizaciones del movimiento de un robot sobre una imagen de la escena real para validar la intención antes de comandar el hardware.
- Docencia y divulgación en robótica: producir vídeos ilustrativos de tareas manipulativas a partir de datos de DROID o RoboCasa sin necesidad de un robot físico.
- Verificación de percepción de profundidad: la variante `depth-droid-robocasa` permite estudiar cómo afecta la información de profundidad del efector a la coherencia del vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El modelo base es de 14B parámetros en un DiT de vídeo, por lo que se requiere una GPU con memoria suficiente para el backbone completo más los adaptadores; el repo de adaptadores ocupa 1,5 GB.
- GPU recomendadas: no disponible de forma explícita. Por el tamaño del backbone (14B) y la generación de 81 frames a 832×480, se espera necesitar GPUs de数据中心 (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM; el autor no publica requisitos concretos.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del backbone y la resolución/duración del vídeo hacen improbable que quepa en GPUs de consumo con menos de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: el código de referencia usa `diffusers` y el script `training.wan.inference` del repositorio `rofacto-dev`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo de este tipo).
- Latencia y throughput: no disponibles. La configuración de referencia usa 50 pasos de inferencia con guidance scale 6; la opción LightX2V reduce a cuatro pasos pero requiere un LoRA de aceleración adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoFacto-Wan2.1-14B | Adaptadores sobre 14B | 81 frames a 832×480 (referencia) | World model robótico imagen-a-vídeo | Apache-2.0 | Pesos LoRA públicos; código con invitación |
| Wan2.1-Fun-V1.1-14B-InP | 14B | No disponible en esta ficha | Generación de vídeo imagen-a-vídeo general | Apache-2.0 (según modelo base) | Público en Hugging Face |
| Otros world models para robótica (p. ej. basados en DiT4DiT) | No disponible | No disponible | Simulación visual de manipulación | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría (world models para robótica condicionados por render) no está disponible en la información proporcionada. El competidor más directo es el propio modelo base Wan2.1-Fun-V1.1-14B-InP, del que RoFacto se diferencia por el condicionamiento geométrico del robot y por estar especializado en escenas de manipulación.

## Limitaciones y advertencias

- Los pesos generan vídeos, no comandos ejecutables para robots. Cualquier uso humano-a-robot (H2R) requiere eliminación del humano, retargeting de movimiento y renderizado del robot alineado con la cámara antes de la inferencia.
- La calidad de la salida depende críticamente de la precisión de las condiciones de entrada (escena estática, malla del robot, profundidades). Entradas imperfectas producen rollouts poco fiables.
- Las dos variantes no son una ablación con datos emparejados: no deben compararse como si aislaran el efecto de la profundidad.
- El repositorio no incluye el modelo base ni estados de optimizador; es imprescindible descargar Wan2.1-Fun-V1.1-14B-InP por separado.
- El código de inferencia está actualmente bajo invitación; la release pública está en preparación, lo que limita la reproducibilidad inmediata.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación cuantitativa de fidelidad física de los vídeos generados.
- No se dispone de información sobre rendimiento multilingüe ni sobre el comportamiento del prompt de texto en idiomas distintos del inglés.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los términos del modelo base Wan2.1 y los ficheros `LICENSE` y `NOTICE` del repositorio.
- No apto para producción sin validación adicional: no hay benchmarks publicados ni métricas de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byungjun-kim/RoFacto-Wan2.1-14B
- Paper (arXiv): https://arxiv.org/abs/2607.22535
- Código e instalación: https://github.com/bjkim95/rofacto-dev
- Guía de checkpoints: https://github.com/bjkim95/rofacto-dev/blob/main/docs/checkpoints.md
- Modelo base: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-14B-InP
