# pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov

## Resumen

`pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov` es una conversión a OpenVINO del modelo `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365`, un modelo de visión-lenguaje-acción (VLA) orientado al control de robots manipuladores en entornos de simulación RoboCasa365. El paquete no es un modelo de lenguaje generativo al uso, sino una *policy* (política de control) que mapea observaciones multimodales —tres cámaras RGB, estado proprioceptivo del robot y un prompt textual de tarea— a secuencias de acciones motoras de 12 dimensiones.

La conversión la firma el usuario `pawanpaudel93` y está pensada para ejecutarse en CPUs y GPUs Intel mediante el motor `ov-policy` de Cascadia (tipo `xr0` con `processor: "xr1"`). El resultado es un grafo float32 con pesos fp16, exportado con el exportador XR0 de Intel (physical-ai-studio) al que se aplicaron cuatro parches específicos para el procesador XR1. El repositorio ocupa 9,9 GB y se distribuye bajo licencia Apache-2.0, heredada del checkpoint original.

Su relevancia radica en que permite desplegar una política VLA de robótica en hardware Intel sin CUDA, algo poco habitual en este segmento, y en que el autor documenta una verificación numérica frente al modelo PyTorch original. No obstante, es un artefacto de conversión, no un modelo nuevo: no aporta entrenamiento adicional, no publica resultados de éxito en tareas RoboCasa365 y depende de una build de Cascadia con soporte XR1 que aún no está en release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); exportada como grafo OpenVINO con exportador XR0 de Intel (physical-ai-studio); incluye un DiT con projector y cabezal de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la política usa historial de 4 frames por cámara y 4 estados |
| Tipos de cuantizacion | Pesos fp16 sobre grafo float32 (fp16 weights, f32 graph); se menciona también una variante con pesos f32 |
| Idiomas soportados | no disponible (el prompt de tarea es textual; no se declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO (`policy_package` para el motor `ov-policy` de Cascadia) |

## Arquitectura y entrenamiento

El modelo subyacente es `Xiaomi-Robotics-1-RoboCasa365` (revisión `3a6d0293`), una política VLA de Xiaomi Robotics entrenada para tareas de RoboCasa365. La arquitectura interna combina un codificador de visión y lenguaje con un transformer de difusión (DiT) que genera las acciones; el paquete OpenVINO conserva ese esquema pero lo modifica para el procesador XR1: se eliminan las normas intermedias y finales del DiT, se ajusta el projector a 1024 de ancho, se incorpora la máscara de acciones del checkpoint y se fija un estado de forma `[1, 4, 60]`. Además, el ruido que originalmente se generaba dentro del grafo se expone como entrada `noise`, lo que permite control externo de la muestra de difusión.

No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset, ni si hubo RLHF o DPO; esos datos pertenecen al checkpoint original y no se reproducen en esta model card. La innovación técnica documentada aquí es la propia conversión: exportación XR0 con parches XR1, pesos fp16 sobre grafo f32, y normalización/desnormalización de acciones (`xr0_denormalize`) con el `action_std` del checkpoint (1 en las 12 dimensiones servidas, 0 en el padding). El autor reporta que el grafo fp16 queda a 2,8e-4 del modelo PyTorch f32 de Xiaomi en las 12 acciones servidas (1,4e-6 con pesos f32) y que el motor Cascadia reproduce bit a bit el procesador original (ids de prompt, máscara, píxeles y estado).

## Capacidades

- Control robótico multimodal: consume tres vistas de cámara (`agentview_left`, `agentview_right`, `eye_in_hand`), estado proprioceptivo de 14 valores y un prompt textual de tarea.
- Generación de acciones: produce 16 pasos de acción × 12 valores por inferencia, con desnormalización integrada.
- Historial temporal: utiliza los últimos 4 frames de cada cámara y los últimos 4 estados, lo que aporta contexto temporal corto.
- Preprocesado de imagen integrado en el cliente: crop central 0,95 y resize a 256×256 en RGB uint8.
- Control de ruido de difusión: la entrada `noise` permite reproducir o variar la muestra del DiT.
- Ejecución en CPU y GPU Intel mediante OpenVINO, sin dependencia de CUDA.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo multilingüe ni modo thinking; no es un modelo conversacional.

## Casos de uso

- Manipulación robótica en simulación RoboCasa365: desplegar la política para generar trayectorias de 16 acciones a partir de observaciones visuales y estado, útil para evaluar políticas VLA en entornos domésticos simulados.
- Evaluación comparativa de precisión de conversión: usar la entrada `noise` y comparar salidas frente al modelo PyTorch para validar pipelines de exportación OpenVINO en robótica.
- Despliegue en estaciones de trabajo Intel sin GPU NVIDIA: ejecutar la política en CPU x86 o GPU integrada/discreta Intel, adecuado para laboratorios con hardware no CUDA.
- Integración en el motor Cascadia `ov-policy`: servir la política con `cascadia run ... --engine ov-policy --device GPU` dentro de un stack de control de robots.
- Reproducción de experimentos de Xiaomi: al replicar bit a bit el procesador original, permite reproducir condiciones de evaluación del checkpoint fuente.
- Prototipado de control con cámara múltiple: probar políticas que dependen de vista de muñeca más dos vistas externas en configuraciones de robot bimanual simulado.
- Base para pipelines de robótica en producción con OpenVINO: servir como componente de inferencia en arquitecturas de control donde se requiera latencia predecible en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (éxito en RoboCasa365) en la información disponible. La única métrica reportada es de fidelidad numérica de la conversión:

| Metrica | Resultado |
|---|---|
| Diferencia máxima vs PyTorch f32 (pesos fp16, 12 acciones servidas, CPU x86) | 2,8e-4 |
| Diferencia máxima vs PyTorch f32 (pesos f32) | 1,4e-6 |
| NaN en la verificación | ninguno |
| Reproducción del procesador por el motor Cascadia | bit a bit (ids de prompt, máscara, píxeles, estado) |
| Latencia CPU/GPU del motor | no medida |
| Éxito en tareas RoboCasa365 | no medido |

## Requisitos de hardware

- VRAM/RAM: el repo ocupa 9,9 GB; la inferencia requiere cargar el grafo OpenVINO completo, por lo que se necesita al menos ese orden de memoria (no se especifica el pico exacto).
- GPU recomendadas: no se listan modelos concretos; el autor indica soporte para CPUs y GPUs Intel vía OpenVINO.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 ni otras GPU NVIDIA; el pipeline declarado es OpenVINO sobre hardware Intel.
- Opciones de despliegue: motor `ov-policy` de Cascadia (build con soporte XR1, aún en revisión en `labscommunity/cascadia`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no medidos según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov` (este) | VLA convertido a OpenVINO | no disponible | historial de 4 frames/4 estados | Apache-2.0 | Hugging Face, requiere Cascadia con XR1 |
| `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365` | VLA original (PyTorch) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otras políticas VLA para RoboCasa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, rendimiento o contexto con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una copia modificada del checkpoint original: se han eliminado normas del DiT, cambiado el projector, fijado la máscara de acciones y expuesto el ruido como entrada; no debe tratarse como equivalente exacto al modelo de Xiaomi salvo en las 12 acciones servidas verificadas.
- El rendimiento en tareas RoboCasa365 no está medido; no hay evidencia de éxito funcional en simulación.
- Latencia y comportamiento en CPU/GPU del motor Cascadia no están medidos.
- Dependencia de una build de Cascadia con soporte XR1 que no está en release (en revisión), lo que limita el despliegue reproducible hoy.
- El pipeline es específico de OpenVINO e Intel; no hay soporte documentado para CUDA, ROCm ni otros runtimes.
- Sin datos sobre sesgos, alucinación o cobertura lingüística; al ser una política de control, los riesgos se trasladan al comportamiento físico del robot (acciones erróneas, saturación de articulaciones) más que al texto generado.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversión de un modelo de terceros conviene revisar los términos del checkpoint fuente y citar adecuadamente.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov
- Modelo base: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365
- Repositorio del motor Cascadia: https://github.com/labscommunity/cascadia (en revisión, según la model card)
- Exportador XR0 de Intel (physical-ai-studio): no disponible como enlace directo en la información proporcionada
