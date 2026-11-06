# alexhegit/so101-simstudio-rax-drawer-act-rgbd-place100d

## Resumen

SO-101 RAX drawer — ACT RGB-D (place100d) es una política de robótica (policy) entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el simulador MuJoCo, orientada a la manipulación de un cajón con el brazo robótico SO-101. El modelo consume observaciones multimodales (tres cámaras RGB más un canal de profundidad métrica en escala de grises) y predice posiciones articulares absolutas de 6 grados de libertad para ejecutar la tarea de abrir y colocar objetos en el cajón. Lo publica el usuario alexhegit bajo licencia Apache 2.0.

La relevancia de esta ficha no está en el tamaño (51,7 millones de parámetros, muy lejos de un LLM), sino en el experimento de ablación que documenta: comparar el mismo entrenamiento con y sin información de profundidad. Según la model card, la variante RGB-D alcanza un 60 % de éxito en exploración (6/10) y un 55 % en test (11/20), lo que supone una mejora de 20 puntos porcentuales frente a la variante solo RGB entrenada sobre el mismo dataset.

Es, por tanto, un artefacto de investigación reproducible para evaluar cómo afecta la profundidad a una política visomotora de imitación en un entorno simulado, no un modelo de propósito general. El entrenamiento se realizó durante 30 000 pasos sobre una GPU AMD MI300X.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51 668 614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con horizonte de acción) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y mejora la estabilidad en control de robots. En esta variante, el modelo recibe cuatro flujos visuales: cámara superior (`top`), lateral (`side`), de muñeca (`wrist`) y un canal superior de profundidad (`camera_top_depth`, imagen en escala de grises de 3 canales que codifica profundidad métrica). La salida son posiciones articulares absolutas de 6 dimensiones (`.pos`).

El entrenamiento se realizó sobre el dataset `alexhegit/so101-simstudio-rax-drawer-place100d` durante 30 000 pasos en una GPU AMD MI300X. No se detalla en la información disponible la composición exacta del dataset, el número de demostraciones ni si se aplicaron técnicas de aumento de datos o regularización específicas. La innovación principal documentada es la ablación RGB vs. RGB-D: el modelo con profundidad mejora 20 puntos porcentuales en tasa de éxito respecto a su hermano solo RGB, lo que sugiere que la señal de profundidad métrica aporta información geométrica crítica para la localización del cajón y del objeto.

## Capacidades

- Control visomotor de un brazo robótico SO-101 en simulación MuJoCo.
- Predicción de posiciones articulares absolutas de 6 grados de libertad (`.pos`).
- Fusión de tres vistas RGB (superior, lateral, muñeca) con un canal de profundidad métrica superior.
- Ejecución de la tarea compuesta de abrir un cajón y colocar un objeto (drawer place).
- Evaluación en bucle cerrado (closed-loop) con renderizado EGL.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de lenguaje natural.
- No es multilingüe ni procesa texto: su entrada es exclusivamente visual y su salida es cinemática.

## Casos de uso

- Investigación en ablación de modalidades: sirve como referencia directa para medir el impacto de añadir profundidad a una política ACT, ya que existe la variante RGB gemela entrenada con el mismo dataset y presupuesto de pasos.
- Reproducción de experimentos de imitación visomotora: el par RGB/RGB-D permite replicar el resultado de +20 pp sin reentrenar desde cero, usando el checkpoint publicado.
- Desarrollo de pipelines de evaluación en simulación: el modelo se integra con `lerobot.policies.act.modeling_act.ACTPolicy` y puede ejecutarse en bucle cerrado con EGL para pruebas automatizadas de éxito/fracaso.
- Prototipado de manipulación con SO-101: útil para validar la cinemática y el espacio de acciones del brazo antes de transferir a hardware real.
- Estudio de representaciones de profundidad: el canal `camera_top_depth` en escala de grises permite analizar qué información geométrica aprende el codificador visual y cómo afecta a la tasa de éxito.
- Base para fine-tuning en tareas de cajón: al ser un checkpoint ACT con licencia Apache 2.0, puede adaptarse a variantes de la misma tarea (distintas posiciones de objeto o apertura de cajón) con pocos datos adicionales.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Éxito en exploración (closed-loop, halo, EGL) | 6/10 (60 %) | Este modelo RGB-D |
| Éxito en test (closed-loop, halo, EGL) | 11/20 (55 %) | Este modelo RGB-D |
| Mejora frente a variante RGB | +20 pp | Mismo dataset y configuración |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 207 MB, por lo que el cuello de botella es el renderizado de las cuatro cámaras, no el modelo.
- GPU recomendadas: el entrenamiento se realizó en una AMD MI300X; para inferencia se requiere una GPU con soporte EGL para el renderizado MuJoCo (por ejemplo, A100, H100, RTX 4090 o similares).
- Cabe en GPU de consumo: sí, el modelo en sí es pequeño; el requisito práctico es disponer de renderizado OpenGL/EGL funcional para las cámaras simuladas.
- Opciones de despliegue: `lerobot` (carga vía `ACTPolicy.from_pretrained`), con MuJoCo para el entorno y EGL para el renderizado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Éxito test | Licencia |
|---|---|---|---|---|---|
| so101-simstudio-rax-drawer-act-rgbd-place100d (este) | 51,7 M | no aplica | RGB + profundidad | 55 % (11/20) | apache-2.0 |
| so101-simstudio-rax-drawer-act-rgb-place100d | no disponible | no aplica | solo RGB | no disponible (20 pp menos según la model card) | apache-2.0 |
| Otros modelos ACT de la familia LeRobot | no disponible | no aplica | variable | no disponible | variable |

La comparación más directa es el hermano RGB del mismo autor y dataset, que sirve como control de la ablación. No se dispone de datos de benchmarks de otras políticas ACT comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (MuJoCo); no hay evidencia en la información disponible de transferencia a hardware real.
- La tasa de éxito en test es del 55 %, lo que implica que aproximadamente 4 de cada 10 intentos fallan; no es adecuado para producción sin mejoras.
- Depende de la configuración exacta de cámaras (top, side, wrist, top_depth) y del formato de profundidad en escala de grises de 3 canales; cambios en la cámara o en la codificación de profundidad pueden degradar el rendimiento.
- El dataset de entrenamiento es específico de la tarea "drawer place" en el simulador SimStudio; no generaliza a otras tareas sin fine-tuning.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; los riesgos relevantes son de robustez física y de sim-to-real gap.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No se especifican los datos exactos de entrenamiento (número de demostraciones, composición del dataset), lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/alexhegit/so101-simstudio-rax-drawer-act-rgbd-place100d
- Dataset: https://huggingface.co/datasets/alexhegit/so101-simstudio-rax-drawer-place100d
- Variante RGB: https://huggingface.co/alexhegit/so101-simstudio-rax-drawer-act-rgb-place100d
- Documentación de la ablación: https://github.com/rocPAI-Forge/so101-simstudio/blob/rax_drawer_vla/labs/rax_drawer/vla/DEPTH_ABLATION.md
- Repositorio: https://github.com/rocPAI-Forge/so101-simstudio
