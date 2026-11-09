# i3ullbum/dpp-v2-pt512-ft

## Resumen

DPP-v2 PT512 es un checkpoint de política robótica para manipulación bimanual con manos diestras, desarrollado por el usuario i3ullbum y publicado en Hugging Face. El modelo predice un flujo de desplazamientos 3D de 16 pasos por 2 manos por 21 keypoints, junto con una ratio de contacto por keypoint, a una frecuencia aproximada de 20 Hz. Se trata de un modelo de tipo policy (no un LLM) que consume nubes de puntos RGB-D del objeto, el estado de keypoints del propio robot y una instrucción de lenguaje por mano.

La arquitectura combina un codificador de contexto de 8 capas con dimensión 768 y un experto de acción de 12 capas con dimensión 768, sumando 191 millones de parámetros. El entrenamiento parte de un checkpoint preentrenado de 100 000 pasos y se afina durante 60 000 o 100 000 pasos adicionales con batch global 64, en una receta de co-entrenamiento que mezcla episodios humanos y de robot en distintas proporciones (0, 100 o 200 episodios de robot sobre 200 humanos fijos).

Su relevancia actual radica en que el repositorio no solo contiene los checkpoints propios, sino también baselines de VITRA-VLA-3B, GR00T N1.7 y EgoVLA (VILA-3B), lo que facilita la comparación reproducible entre políticas de manipulación diestra. El repo ocupa 283 GB y está pensado como material de investigación en curso, con números no definitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de rectified flow (experto de acción) con codificador de contexto; variante legacy autoregresiva determinista incluida |
| Parametros totales | 191 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (recibe instrucciones de lenguaje por mano, pero no se especifican idiomas) |
| Licencia | other |
| Formato de pesos | `.pt` (`torch.save`) para los checkpoints propios; safetensors + configs para los baselines GR00T |

## Arquitectura y entrenamiento

El modelo es una política de difusión con transformer (DiT) entrenada con rectified flow. El codificador de contexto tiene 8 capas y 768 de dimensión; el experto de acción tiene 12 capas y 768 de dimensión. La salida es un flujo de desplazamiento normalizado de forma `(16, 2, 21, 3)` —16 pasos temporales, 2 manos, 21 keypoints, 3 coordenadas— más una ratio de contacto por keypoint. Los ficheros incluyen `xyz_center` y `xyz_scale` para desnormalizar (`delta = pred * scale + center`), así como `contact_pos_weight` de forma `(2, 21)` usado en el BCE de entrenamiento y un guard de versión de arquitectura (`arch_version`).

El entrenamiento se realiza en dos fases: un preentrenamiento de 100 000 pasos y un afinado de co-entrenamiento de 60 000 o 100 000 pasos con batch global 64. La mezcla de datos fija 200 episodios humanos y varía los episodios de robot (0, 100 o 200), con dos embodimentos: `wuji` (RB-Y1 + Wuji Hand 2) e `inspire` (OpenArm + Inspire RH56). Existe una variante `legacy` determinista autoregresiva que fue descartada y se conserva solo a modo de registro. Los checkpoints publicados eliminan el estado del optimizador y del scheduler. La convención de entrada de contacto cambió el 2026-09-22: las runs `_nocontact` usan un canal de contacto constante a cero (`contact_input=false`), mientras que las runs anteriores realimentan el contacto empaquetado.

## Capacidades

- Predicción de trayectorias de manipulación bimanual diestra: genera desplazamientos 3D de 21 keypoints por mano en 16 pasos temporales.
- Estimación de contacto por keypoint: emite una ratio de contacto por cada uno de los 21 keypoints y cada mano.
- Condicionamiento por lenguaje: acepta una instrucción de lenguaje por mano para guiar la política.
- Percepción multimodal: consume nubes de puntos RGB-D del objeto desde una cámara en primera persona (ego) junto con el estado de keypoints del robot.
- Control a ~20 Hz: la frecuencia de predicción declarada es de aproximadamente 20 Hz.
- Soporte multi-embodimento: checkpoints para RB-Y1 + Wuji Hand 2 y OpenArm + Inspire RH56.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni thinking mode; es una política robótica, no un modelo de lenguaje general.

## Casos de uso

- Manipulación diestra bimanual en investigación: la política genera trayectorias de 21 keypoints por mano a 20 Hz, adecuada para tareas que requieren coordinación de ambas manos sobre objetos.
- Co-entrenamiento humano-robot: las mezclas `r0_h100`, `r50_h100` y `r100_h100` permiten estudiar cuántos episodios de robot son necesarios partiendo de datos humanos, un caso de uso directo para equipos que no pueden teleoperar a gran escala.
- Benchmarking de políticas VLA: el repo incluye baselines de VITRA-VLA-3B, GR00T N1.7 y EgoVLA con la misma estructura de mezclas, lo que permite comparaciones controladas de recetas de co-entrenamiento.
- Transferencia entre embodimentos: los checkpoints `wuji` e `inspire` permiten evaluar la transferencia de una política entrenada en un par robot-mano a otro.
- Detección de contacto para agarre: la cabeza de contacto por keypoint puede usarse como señal auxiliar para decidir cuándo cerrar la mano, con la cautela de que su calibración en robot es dudosa.
- Prototipado de pipelines de despliegue: el paquete `dpp_v2.deploy` y la guía `docs/DEPLOY-INFERENCE-GUIDE-2026-09-21.md` sirven como referencia para implementar el contrato de entrada de nueve tensores y el bucle de muestreo por flow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que son checkpoints de investigación de un estudio en curso y que los números no son finales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 191 M de parámetros, el peso en FP32 ronda los 0,76 GB y en FP16 los 0,38 GB, pero el consumo real depende del codificador de nubes de puntos y del bucle de muestreo por flow, no documentados.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay confirmación ni requisitos de memoria del pipeline completo.
- Opciones de despliegue: el paquete `dpp_v2.deploy` y la guía de despliegue del repositorio del proyecto; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: frecuencia de predicción declarada de ~20 Hz; no se publican latencias ni throughput por GPU.
- Almacenamiento: el repo completo ocupa 283 GB, por lo que conviene descargar solo las carpetas necesarias.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPP-v2 PT512 (este) | 191 M | Política DiT rectified flow | no disponible | other | Hugging Face (`i3ullbum/dpp-v2-pt512-ft`) |
| VITRA-VLA-3B | ~3 B (según nombre) | VLA | no disponible | no disponible | Baselines incluidos en este repo |
| GR00T N1.7 | no disponible | VLA | no disponible | no disponible | Baselines incluidos en este repo (safetensors) |
| EgoVLA (VILA-3B) | ~3 B (según nombre) | VLA | no disponible | no disponible | Baselines incluidos en este repo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; los baselines están incluidos en el mismo repositorio con la misma estructura de mezclas, lo que permite una comparación controlada, pero sin cifras publicadas.

## Limitaciones y advertencias

- La cabeza de contacto se entrena solo con datos humanos; los episodios de robot del conjunto de afinado no llevan etiquetas de contacto, por lo que su calibración absoluta en robot debe tratarse con escepticismo.
- Los keypoints siguen el orden MANO / OpenPose-21 y el eje de mano es `[left, right]`; un orden incorrecto invalida las predicciones.
- La política emite un desplazamiento normalizado, no una pose; requiere desnormalización con `xyz_center` y `xyz_scale` y un adaptador de keypoints a objetivos de articulaciones (`dpp_v2.deploy`).
- Cambio de convención en la entrada de contacto (2026-09-22): mezclar runs con y sin `contact_input` produce resultados inconsistentes.
- Son checkpoints de investigación de un estudio en curso; los números no son finales y no hay benchmarks publicados.
- Licencia `other`: no se especifican términos de uso comercial; debe consultarse antes de cualquier despliegue productivo.
- El repositorio ocupa 283 GB y contiene múltiples variantes y baselines; la descarga completa es costosa.
- No se documentan idiomas soportados para las instrucciones de lenguaje ni sesgos conocidos.

## Enlaces

- Hugging Face: https://huggingface.co/i3ullbum/dpp-v2-pt512-ft
- Guía de despliegue e inferencia (referenciada en la model card): `docs/DEPLOY-INFERENCE-GUIDE-2026-09-21.md` en el repositorio del proyecto (URL no disponible)
- Paquete de despliegue: `dpp_v2.deploy` (URL no disponible)
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada
